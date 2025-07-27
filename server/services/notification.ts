import { Repository } from "typeorm";
import { DatabaseConnection } from "../db/connection";
import {
  NotificationTemplate,
  NotificationCategory,
  NotificationChannel,
  TemplateStatus,
} from "../entities/NotificationTemplate";
import {
  NotificationDelivery,
  DeliveryStatus,
  DeliveryChannel,
  DeliveryPriority,
} from "../entities/NotificationDelivery";
import {
  NotificationEvent,
  EventType,
  EventSeverity,
} from "../entities/NotificationEvent";
import {
  NotificationPreference,
  ConsentType,
  ConsentStatus,
  ChannelType,
} from "../entities/NotificationPreference";
import { User } from "../entities/User";
import * as sgMail from "@sendgrid/mail";
import webpush from "web-push";
import * as Handlebars from "handlebars";
import { Redis } from "ioredis";

export interface NotificationRequest {
  templateId: string;
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  variables?: Record<string, any>;
  channels?: NotificationChannel[];
  priority?: DeliveryPriority;
  scheduledFor?: Date;
  context?: {
    workflowId?: string;
    flowId?: string;
    campaignId?: string;
    leadId?: string;
    instanceId?: string;
    eventType?: string;
  };
  metadata?: Record<string, any>;
}

export interface BulkNotificationRequest {
  templateId: string;
  recipients: Array<{
    userId?: string;
    email?: string;
    phone?: string;
    variables?: Record<string, any>;
  }>;
  channels?: NotificationChannel[];
  priority?: DeliveryPriority;
  scheduledFor?: Date;
  context?: any;
}

export interface NotificationProvider {
  name: string;
  sendEmail?(
    data: any,
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: any;
    cost?: number;
  }>;
  sendWhatsApp?(
    data: any,
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: any;
    cost?: number;
  }>;
  sendPush?(
    data: any,
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: any;
    cost?: number;
  }>;
  sendSMS?(
    data: any,
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: any;
    cost?: number;
  }>;
}

export class NotificationService {
  private templateRepo: Repository<NotificationTemplate>;
  private deliveryRepo: Repository<NotificationDelivery>;
  private eventRepo: Repository<NotificationEvent>;
  private preferenceRepo: Repository<NotificationPreference>;
  private userRepo: Repository<User>;
  private redis: Redis;
  private providers: Map<string, NotificationProvider> = new Map();
  private queues: Map<string, any[]> = new Map();
  private isProcessing = false;

  constructor() {
    // Inicializar repositórios
    this.templateRepo = DatabaseConnection.getRepository(NotificationTemplate);
    this.deliveryRepo = DatabaseConnection.getRepository(NotificationDelivery);
    this.eventRepo = DatabaseConnection.getRepository(NotificationEvent);
    this.preferenceRepo = DatabaseConnection.getRepository(
      NotificationPreference,
    );
    this.userRepo = DatabaseConnection.getRepository(User);
    this.redis = DatabaseConnection.redis;

    // Configurar providers padrão
    this.setupProviders();

    // Configurar Handlebars helpers
    this.setupHandlebarsHelpers();

    // Iniciar processamento de filas
    this.startQueueProcessing();
  }

  private setupProviders(): void {
    // SendGrid para email
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      this.providers.set("sendgrid", {
        name: "sendgrid",
        sendEmail: async (data) => {
          try {
            const result = await sgMail.send(data);
            return {
              success: true,
              messageId: result[0]?.headers?.["x-message-id"],
              cost: 0.001, // Custo estimado por email
            };
          } catch (error) {
            return { success: false, error };
          }
        },
      });
    }

    // Web Push para notificações push
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        "mailto:" +
          (process.env.NOTIFICATION_FROM_EMAIL || "noreply@kryonix.com"),
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
      );

      this.providers.set("webpush", {
        name: "webpush",
        sendPush: async (data) => {
          try {
            await webpush.sendNotification(
              data.subscription,
              JSON.stringify(data.payload),
            );
            return { success: true, cost: 0 };
          } catch (error) {
            return { success: false, error };
          }
        },
      });
    }

    // WhatsApp provider (integração com módulo existente)
    this.providers.set("whatsapp", {
      name: "whatsapp",
      sendWhatsApp: async (data) => {
        try {
          // Integrar com o serviço WhatsApp existente
          const whatsappService = require("./whatsapp");
          const result = await whatsappService.sendMessage(
            data.instanceId,
            data.phone,
            data.message,
            data.options,
          );
          return {
            success: true,
            messageId: result.messageId,
            cost: 0.05, // Custo estimado por mensagem WhatsApp
          };
        } catch (error) {
          return { success: false, error };
        }
      },
    });
  }

  private setupHandlebarsHelpers(): void {
    // Helper para formatação de data
    Handlebars.registerHelper("formatDate", (date: Date, format: string) => {
      if (!date) return "";

      const options: Intl.DateTimeFormatOptions = {};
      switch (format) {
        case "short":
          options.dateStyle = "short";
          break;
        case "long":
          options.dateStyle = "long";
          break;
        case "datetime":
          options.dateStyle = "short";
          options.timeStyle = "short";
          break;
        default:
          options.dateStyle = "medium";
      }

      return new Intl.DateTimeFormat("pt-BR", options).format(new Date(date));
    });

    // Helper para formatação de moeda
    Handlebars.registerHelper("formatCurrency", (value: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value || 0);
    });

    // Helper condicional
    Handlebars.registerHelper("if_eq", function (a: any, b: any, options: any) {
      return a === b ? options.fn(this) : options.inverse(this);
    });

    // Helper para links com tracking
    Handlebars.registerHelper(
      "trackingLink",
      (url: string, deliveryId: string) => {
        const trackingUrl = `${process.env.FRONTEND_URL}/api/notifications/track/click/${deliveryId}?url=${encodeURIComponent(url)}`;
        return new Handlebars.SafeString(trackingUrl);
      },
    );
  }

  private startQueueProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;

    // Processar fila a cada 10 segundos
    setInterval(async () => {
      await this.processQueues();
    }, 10000);

    // Processar retries a cada minuto
    setInterval(async () => {
      await this.processRetries();
    }, 60000);
  }

  // Método principal para enviar notificação
  async sendNotification(
    tenantId: string,
    request: NotificationRequest,
  ): Promise<string[]> {
    try {
      // Buscar template
      const template = await this.templateRepo.findOne({
        where: {
          id: request.templateId,
          tenantId,
          status: TemplateStatus.ACTIVE,
        },
      });

      if (!template) {
        throw new Error(`Template ativo não encontrado: ${request.templateId}`);
      }

      // Validar variáveis
      const validation = template.validateVariables(request.variables || {});
      if (!validation.valid) {
        throw new Error(`Variáveis inválidas: ${validation.errors.join(", ")}`);
      }

      // Determinar destinatário
      let recipient: User | null = null;
      if (request.recipientId) {
        recipient = await this.userRepo.findOne({
          where: { id: request.recipientId, tenantId },
        });
      }

      // Buscar preferências do usuário
      const preferences = await this.getUserPreferences(
        tenantId,
        request.recipientId,
      );

      // Determinar canais a serem usados
      const channels = this.determineChannels(
        request.channels || template.supportedChannels,
        template,
        preferences,
      );

      if (channels.length === 0) {
        await this.logEvent(
          tenantId,
          EventType.DELIVERY_CANCELLED,
          "Nenhum canal disponível para entrega",
          { templateId: template.id, recipientId: request.recipientId },
        );
        return [];
      }

      // Criar deliveries para cada canal
      const deliveryIds: string[] = [];

      for (const channel of channels) {
        const deliveryId = await this.createDelivery(
          tenantId,
          template,
          channel,
          recipient,
          request,
          preferences,
        );

        if (deliveryId) {
          deliveryIds.push(deliveryId);

          // Adicionar à fila
          await this.addToQueue(
            channel,
            deliveryId,
            request.priority || DeliveryPriority.NORMAL,
          );
        }
      }

      // Log do evento
      await this.logEvent(
        tenantId,
        EventType.DELIVERY_QUEUED,
        `Notificação enfileirada para ${channels.length} canal(is)`,
        {
          templateId: template.id,
          recipientId: request.recipientId,
          channels,
          deliveryIds,
        },
      );

      return deliveryIds;
    } catch (error) {
      await this.logEvent(
        tenantId,
        EventType.DELIVERY_FAILED,
        `Erro ao criar notificação: ${error.message}`,
        request,
        EventSeverity.HIGH,
      );
      throw error;
    }
  }

  // Envio em massa
  async sendBulkNotification(
    tenantId: string,
    request: BulkNotificationRequest,
  ): Promise<string[]> {
    const allDeliveryIds: string[] = [];

    for (const recipient of request.recipients) {
      try {
        const deliveryIds = await this.sendNotification(tenantId, {
          templateId: request.templateId,
          recipientId: recipient.userId,
          recipientEmail: recipient.email,
          recipientPhone: recipient.phone,
          variables: recipient.variables,
          channels: request.channels,
          priority: request.priority,
          scheduledFor: request.scheduledFor,
          context: request.context,
        });

        allDeliveryIds.push(...deliveryIds);
      } catch (error) {
        console.error(
          `Erro ao enviar para ${recipient.email || recipient.userId}:`,
          error,
        );
      }
    }

    return allDeliveryIds;
  }

  private async createDelivery(
    tenantId: string,
    template: NotificationTemplate,
    channel: NotificationChannel,
    recipient: User | null,
    request: NotificationRequest,
    preferences: NotificationPreference | null,
  ): Promise<string | null> {
    try {
      const delivery = new NotificationDelivery();
      delivery.tenantId = tenantId;
      delivery.templateId = template.id;
      delivery.recipientId = request.recipientId;
      delivery.status = DeliveryStatus.QUEUED;
      delivery.channel = channel;
      delivery.priority = request.priority || DeliveryPriority.NORMAL;
      delivery.scheduledFor = request.scheduledFor;

      // Configurar destinatário
      const recipientData: any = {};
      if (recipient) {
        recipientData.userId = recipient.id;
        recipientData.email = recipient.email;
      }
      if (request.recipientEmail) recipientData.email = request.recipientEmail;
      if (request.recipientPhone) recipientData.phone = request.recipientPhone;

      // Renderizar conteúdo
      const content = template.renderContent(channel, request.variables || {});
      if (!content) {
        throw new Error(
          `Não foi possível renderizar conteúdo para o canal ${channel}`,
        );
      }

      // Configurar metadata
      delivery.metadata = {
        recipient: recipientData,
        content,
        delivery: {
          maxRetries: template.settings.retryPolicy.maxRetries,
          retryCount: 0,
          retryDelayMinutes: template.settings.retryPolicy.retryDelayMinutes,
          scheduledFor: request.scheduledFor,
          respectQuietHours: template.settings.quietHours.enabled,
          respectBusinessHours: template.settings.businessHours.enabled,
        },
        tracking: {
          campaignId: request.context?.campaignId,
          segmentId: request.context?.leadId,
          utmSource: "kryonix",
          utmMedium: channel.toLowerCase(),
          trackingPixelId: `px_${delivery.id}`,
        },
        provider: {
          name: this.getProviderForChannel(channel),
        },
        lgpd: {
          hasConsent: preferences?.hasValidConsent || false,
          consentType: preferences?.consentType || ConsentType.TRANSACTIONAL,
          baseLegal:
            preferences?.consentDetails.legalBasis || "legitimate_interest",
          canUnsubscribe: preferences?.consentType === ConsentType.MARKETING,
          unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe?token=${delivery.id}`,
          dataRetentionDays:
            preferences?.preferences.lgpd.dataRetentionDays || 730,
        },
        context: request.context,
      };

      // Configurar expiração
      if (template.settings.retryPolicy.maxRetries > 0) {
        const expirationHours =
          (template.settings.retryPolicy.maxRetries *
            template.settings.retryPolicy.retryDelayMinutes) /
            60 +
          24;
        delivery.expiresAt = new Date(
          Date.now() + expirationHours * 60 * 60 * 1000,
        );
      }

      const savedDelivery = await this.deliveryRepo.save(delivery);

      // Atualizar estatísticas do template
      template.updateStats("sent");
      await this.templateRepo.save(template);

      return savedDelivery.id;
    } catch (error) {
      console.error("Erro ao criar delivery:", error);
      return null;
    }
  }

  private async addToQueue(
    channel: NotificationChannel,
    deliveryId: string,
    priority: DeliveryPriority,
  ): Promise<void> {
    const queueName = `notifications:${channel.toLowerCase()}`;
    const priorityScore = this.getPriorityScore(priority);

    // Usar Redis sorted set para fila com prioridade
    await this.redis.zadd(queueName, priorityScore, deliveryId);
  }

  private getPriorityScore(priority: DeliveryPriority): number {
    switch (priority) {
      case DeliveryPriority.URGENT:
        return 1;
      case DeliveryPriority.CRITICAL:
        return 2;
      case DeliveryPriority.HIGH:
        return 3;
      case DeliveryPriority.NORMAL:
        return 4;
      case DeliveryPriority.LOW:
        return 5;
      default:
        return 4;
    }
  }

  private async processQueues(): Promise<void> {
    const channels = Object.values(NotificationChannel);

    for (const channel of channels) {
      await this.processChannelQueue(channel);
    }
  }

  private async processChannelQueue(
    channel: NotificationChannel,
  ): Promise<void> {
    const queueName = `notifications:${channel.toLowerCase()}`;

    try {
      // Buscar próximos deliveries (máximo 10 por vez)
      const deliveryIds = await this.redis.zrange(queueName, 0, 9);

      if (deliveryIds.length === 0) return;

      for (const deliveryId of deliveryIds) {
        await this.processDelivery(deliveryId);
        // Remover da fila após processamento
        await this.redis.zrem(queueName, deliveryId);
      }
    } catch (error) {
      console.error(`Erro ao processar fila ${channel}:`, error);
    }
  }

  private async processDelivery(deliveryId: string): Promise<void> {
    try {
      const delivery = await this.deliveryRepo.findOne({
        where: { id: deliveryId },
        relations: ["template", "tenant"],
      });

      if (!delivery) return;

      // Verificar se deve ser processada agora
      if (delivery.scheduledFor && delivery.scheduledFor > new Date()) {
        // Reagendar
        await this.addToQueue(
          delivery.channel as NotificationChannel,
          deliveryId,
          delivery.priority as DeliveryPriority,
        );
        return;
      }

      // Verificar expiração
      if (delivery.isExpired) {
        delivery.markAsCancelled("Expirado");
        await this.deliveryRepo.save(delivery);
        return;
      }

      // Verificar horários (quiet hours, business hours)
      if (!this.isWithinAllowedTime(delivery)) {
        // Reagendar para próximo horário permitido
        await this.rescheduleDelivery(delivery);
        return;
      }

      // Marcar como processando
      delivery.status = DeliveryStatus.PROCESSING;
      await this.deliveryRepo.save(delivery);

      // Enviar através do provider
      const success = await this.sendThroughProvider(delivery);

      if (success) {
        await this.logEvent(
          delivery.tenantId,
          EventType.DELIVERY_SENT,
          `Notificação enviada via ${delivery.channel}`,
          { deliveryId: delivery.id },
        );
      }
    } catch (error) {
      console.error(`Erro ao processar delivery ${deliveryId}:`, error);

      // Marcar como falhado
      const delivery = await this.deliveryRepo.findOne({
        where: { id: deliveryId },
      });
      if (delivery) {
        delivery.markAsFailed(error.message, true, error);
        await this.deliveryRepo.save(delivery);
      }
    }
  }

  private async sendThroughProvider(
    delivery: NotificationDelivery,
  ): Promise<boolean> {
    const providerName = delivery.metadata.provider.name;
    const provider = this.providers.get(providerName);

    if (!provider) {
      delivery.markAsFailed(`Provider não encontrado: ${providerName}`, false);
      await this.deliveryRepo.save(delivery);
      return false;
    }

    try {
      let result: any = null;

      switch (delivery.channel) {
        case DeliveryChannel.EMAIL:
          if (provider.sendEmail) {
            result = await provider.sendEmail(this.prepareEmailData(delivery));
          }
          break;
        case DeliveryChannel.WHATSAPP:
          if (provider.sendWhatsApp) {
            result = await provider.sendWhatsApp(
              this.prepareWhatsAppData(delivery),
            );
          }
          break;
        case DeliveryChannel.PUSH:
          if (provider.sendPush) {
            result = await provider.sendPush(this.preparePushData(delivery));
          }
          break;
        case DeliveryChannel.SMS:
          if (provider.sendSMS) {
            result = await provider.sendSMS(this.prepareSMSData(delivery));
          }
          break;
      }

      if (result?.success) {
        delivery.markAsSent(result.providerId, result.messageId, result.cost);
        await this.deliveryRepo.save(delivery);
        return true;
      } else {
        delivery.markAsFailed(
          result?.error?.message || "Falha no provider",
          true,
          result?.error,
        );
        await this.deliveryRepo.save(delivery);
        return false;
      }
    } catch (error) {
      delivery.markAsFailed(error.message, true, error);
      await this.deliveryRepo.save(delivery);
      return false;
    }
  }

  private prepareEmailData(delivery: NotificationDelivery): any {
    const content = delivery.metadata.content;
    const tracking = delivery.metadata.tracking;

    return {
      to: delivery.metadata.recipient.email,
      from: process.env.NOTIFICATION_FROM_EMAIL || "noreply@kryonix.com",
      subject: content.subject || content.title,
      text: content.body,
      html: content.htmlBody || content.body,
      customArgs: {
        deliveryId: delivery.id,
        tenantId: delivery.tenantId,
        campaignId: tracking.campaignId,
      },
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };
  }

  private prepareWhatsAppData(delivery: NotificationDelivery): any {
    const content = delivery.metadata.content;

    return {
      instanceId: delivery.metadata.context?.instanceId,
      phone: delivery.metadata.recipient.phone,
      message: content.body,
      options: {
        deliveryId: delivery.id,
        trackClicks: true,
      },
    };
  }

  private preparePushData(delivery: NotificationDelivery): any {
    const content = delivery.metadata.content;

    return {
      subscription: {
        endpoint: delivery.metadata.recipient.deviceToken,
        keys: {},
      },
      payload: {
        title: content.title,
        body: content.body,
        icon: content.image?.url,
        badge: "/icon-192x192.png",
        data: {
          deliveryId: delivery.id,
          url: content.buttons?.[0]?.url,
        },
      },
    };
  }

  private prepareSMSData(delivery: NotificationDelivery): any {
    const content = delivery.metadata.content;

    return {
      to: delivery.metadata.recipient.phone,
      message: `${content.title}\n\n${content.body}`,
      deliveryId: delivery.id,
    };
  }

  private async processRetries(): Promise<void> {
    const now = new Date();

    const retriesQuery = this.deliveryRepo
      .createQueryBuilder("delivery")
      .where("delivery.status = :status", { status: DeliveryStatus.FAILED })
      .andWhere("delivery.nextRetryAt <= :now", { now })
      .andWhere("delivery.retryCount < delivery.maxRetries")
      .andWhere("delivery.expiresAt > :now OR delivery.expiresAt IS NULL", {
        now,
      });

    const deliveries = await retriesQuery.getMany();

    for (const delivery of deliveries) {
      delivery.status = DeliveryStatus.RETRY;
      await this.deliveryRepo.save(delivery);

      await this.addToQueue(
        delivery.channel as NotificationChannel,
        delivery.id,
        delivery.priority as DeliveryPriority,
      );
    }
  }

  private async getUserPreferences(
    tenantId: string,
    userId?: string,
  ): Promise<NotificationPreference | null> {
    if (!userId) return null;

    return await this.preferenceRepo.findOne({
      where: { tenantId, userId, preferenceType: "GLOBAL" },
    });
  }

  private determineChannels(
    requestedChannels: NotificationChannel[],
    template: NotificationTemplate,
    preferences: NotificationPreference | null,
  ): NotificationChannel[] {
    const availableChannels = template.supportedChannels;
    let channels = requestedChannels.filter((channel) =>
      availableChannels.includes(channel),
    );

    if (preferences) {
      channels = channels.filter(
        (channel) =>
          preferences.canReceiveOnChannel(channel as ChannelType) &&
          preferences.isWithinSchedule(channel as ChannelType),
      );
    }

    return channels;
  }

  private isWithinAllowedTime(delivery: NotificationDelivery): boolean {
    if (
      !delivery.metadata.delivery.respectQuietHours &&
      !delivery.metadata.delivery.respectBusinessHours
    ) {
      return true;
    }

    // Implementar lógica de horários permitidos
    const now = new Date();
    const currentHour = now.getHours();

    // Exemplo simples: não enviar entre 22h e 8h
    if (
      delivery.metadata.delivery.respectQuietHours &&
      (currentHour >= 22 || currentHour < 8)
    ) {
      return false;
    }

    return true;
  }

  private async rescheduleDelivery(
    delivery: NotificationDelivery,
  ): Promise<void> {
    // Agendar para próximo horário permitido (exemplo: 9h da manhã)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    delivery.scheduledFor = tomorrow;
    await this.deliveryRepo.save(delivery);

    await this.addToQueue(
      delivery.channel as NotificationChannel,
      delivery.id,
      delivery.priority as DeliveryPriority,
    );
  }

  private getProviderForChannel(channel: NotificationChannel): string {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return "sendgrid";
      case NotificationChannel.WHATSAPP:
        return "whatsapp";
      case NotificationChannel.PUSH:
        return "webpush";
      case NotificationChannel.SMS:
        return "sms";
      default:
        return "default";
    }
  }

  private async logEvent(
    tenantId: string,
    eventType: EventType,
    description: string,
    eventData?: any,
    severity: EventSeverity = EventSeverity.INFO,
  ): Promise<void> {
    try {
      const event = new NotificationEvent();
      event.tenantId = tenantId;
      event.eventType = eventType;
      event.description = description;
      event.eventData = eventData || {};
      event.severity = severity;
      event.eventCategory = "DELIVERY";
      event.source = "notification_service";

      await this.eventRepo.save(event);
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
    }
  }

  // Tracking methods
  async trackOpen(deliveryId: string, trackingData?: any): Promise<void> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId },
      relations: ["template"],
    });

    if (delivery) {
      delivery.markAsOpened(trackingData);
      await this.deliveryRepo.save(delivery);
    }
  }

  async trackClick(
    deliveryId: string,
    url: string,
    trackingData?: any,
  ): Promise<void> {
    const delivery = await this.deliveryRepo.findOne({
      where: { id: deliveryId },
      relations: ["template"],
    });

    if (delivery) {
      delivery.markAsClicked(url, trackingData);
      await this.deliveryRepo.save(delivery);
    }
  }

  // Analytics methods
  async getDeliveryStats(
    tenantId: string,
    templateId?: string,
    dateRange?: { start: Date; end: Date },
  ): Promise<any> {
    let query = this.deliveryRepo
      .createQueryBuilder("delivery")
      .where("delivery.tenantId = :tenantId", { tenantId });

    if (templateId) {
      query = query.andWhere("delivery.templateId = :templateId", {
        templateId,
      });
    }

    if (dateRange) {
      query = query.andWhere(
        "delivery.createdAt BETWEEN :start AND :end",
        dateRange,
      );
    }

    const deliveries = await query.getMany();

    const stats = {
      total: deliveries.length,
      sent: deliveries.filter((d) => d.status === DeliveryStatus.SENT).length,
      delivered: deliveries.filter((d) => d.status === DeliveryStatus.DELIVERED)
        .length,
      opened: deliveries.filter((d) => d.openedAt).length,
      clicked: deliveries.filter((d) => d.clickedAt).length,
      failed: deliveries.filter((d) => d.status === DeliveryStatus.FAILED)
        .length,
      byChannel: {} as Record<string, number>,
      totalCost: deliveries.reduce((sum, d) => sum + (d.cost || 0), 0),
    };

    // Estatísticas por canal
    for (const delivery of deliveries) {
      const channel = delivery.channel;
      stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;
    }

    return stats;
  }

  // Template management
  async createTemplate(
    tenantId: string,
    templateData: any,
  ): Promise<NotificationTemplate> {
    const template = new NotificationTemplate();
    Object.assign(template, templateData);
    template.tenantId = tenantId;
    template.status = TemplateStatus.DRAFT;

    return await this.templateRepo.save(template);
  }

  async updateTemplate(
    tenantId: string,
    templateId: string,
    updates: any,
  ): Promise<NotificationTemplate> {
    const template = await this.templateRepo.findOne({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      throw new Error("Template não encontrado");
    }

    Object.assign(template, updates);
    return await this.templateRepo.save(template);
  }

  async getTemplates(tenantId: string): Promise<NotificationTemplate[]> {
    return await this.templateRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  // User preferences management
  async getUserPreference(
    tenantId: string,
    userId: string,
  ): Promise<NotificationPreference | null> {
    return await this.preferenceRepo.findOne({
      where: { tenantId, userId, preferenceType: "GLOBAL" },
    });
  }

  async updateUserPreference(
    tenantId: string,
    userId: string,
    updates: any,
  ): Promise<NotificationPreference> {
    let preference = await this.getUserPreference(tenantId, userId);

    if (!preference) {
      preference = NotificationPreference.createGlobalPreference(
        tenantId,
        userId,
      );
    }

    Object.assign(preference.preferences, updates);
    return await this.preferenceRepo.save(preference);
  }

  // Health check
  async healthCheck(): Promise<any> {
    const stats = await this.getDeliveryStats("system");
    const queueSizes: Record<string, number> = {};

    for (const channel of Object.values(NotificationChannel)) {
      const queueName = `notifications:${channel.toLowerCase()}`;
      queueSizes[channel] = await this.redis.zcard(queueName);
    }

    return {
      status: "healthy",
      providers: Array.from(this.providers.keys()),
      queueSizes,
      stats: {
        totalDeliveries: stats.total,
        deliveryRate:
          stats.total > 0
            ? ((stats.delivered / stats.total) * 100).toFixed(2) + "%"
            : "0%",
        failureRate:
          stats.total > 0
            ? ((stats.failed / stats.total) * 100).toFixed(2) + "%"
            : "0%",
      },
    };
  }

  // Static instance
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  static async initialize(): Promise<void> {
    NotificationService.getInstance();
    console.log("✅ Notification Service initialized");
  }
}

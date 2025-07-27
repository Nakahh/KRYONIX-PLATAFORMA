import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "./Tenant";
import { MauticInstance } from "./MauticInstance";

export enum CampaignType {
  EMAIL_SEQUENCE = "EMAIL_SEQUENCE",
  LEAD_NURTURING = "LEAD_NURTURING",
  WELCOME_SERIES = "WELCOME_SERIES",
  ABANDONED_CART = "ABANDONED_CART",
  RE_ENGAGEMENT = "RE_ENGAGEMENT",
  PRODUCT_LAUNCH = "PRODUCT_LAUNCH",
  SEASONAL = "SEASONAL",
  WEBINAR = "WEBINAR",
  CUSTOM = "CUSTOM",
}

export enum CampaignStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export enum TriggerType {
  LEAD_SCORE = "LEAD_SCORE",
  TAG_ADDED = "TAG_ADDED",
  SEGMENT_MEMBERSHIP = "SEGMENT_MEMBERSHIP",
  FORM_SUBMISSION = "FORM_SUBMISSION",
  EMAIL_OPENED = "EMAIL_OPENED",
  LINK_CLICKED = "LINK_CLICKED",
  WHATSAPP_MESSAGE = "WHATSAPP_MESSAGE",
  TIME_BASED = "TIME_BASED",
  AI_CLASSIFICATION = "AI_CLASSIFICATION",
  CUSTOM_EVENT = "CUSTOM_EVENT",
}

export interface CampaignTrigger {
  type: TriggerType;
  conditions: Record<string, any>;
  delay?: number; // minutes
  timeRestrictions?: {
    startTime?: string; // HH:MM
    endTime?: string; // HH:MM
    daysOfWeek?: number[]; // 0-6, 0 = Sunday
  };
}

export interface EmailAction {
  type: "send_email";
  templateId: number;
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  delay?: number; // minutes after trigger
}

export interface WhatsAppAction {
  type: "send_whatsapp";
  instanceId: string;
  message: string;
  mediaUrl?: string;
  delay?: number;
}

export interface SegmentAction {
  type: "add_to_segment" | "remove_from_segment";
  segmentId: number;
  delay?: number;
}

export interface TagAction {
  type: "add_tag" | "remove_tag";
  tags: string[];
  delay?: number;
}

export interface ScoreAction {
  type: "modify_lead_score";
  points: number;
  reason: string;
  delay?: number;
}

export interface N8NAction {
  type: "trigger_n8n_workflow";
  workflowId: string;
  data?: Record<string, any>;
  delay?: number;
}

export interface AIAction {
  type: "ai_analysis";
  service: "OPENAI" | "GOOGLE" | "ANTHROPIC";
  operation: string;
  prompt?: string;
  delay?: number;
}

export type CampaignAction =
  | EmailAction
  | WhatsAppAction
  | SegmentAction
  | TagAction
  | ScoreAction
  | N8NAction
  | AIAction;

export interface CampaignSettings {
  allowRestart: boolean;
  maxExecutions?: number;
  timezone: string;
  language: string;
  trackingEnabled: boolean;

  // Configurações brasileiras específicas
  respectBusinessHours: boolean;
  businessHours?: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  avoidHolidays: boolean;
  holidaysList?: string[]; // Dates in YYYY-MM-DD format

  // LGPD Compliance
  requireConsent: boolean;
  consentMessage?: string;
  unsubscribeLink: boolean;

  // Performance
  throttling?: {
    maxEmailsPerHour: number;
    maxWhatsAppPerHour: number;
  };
}

export interface CampaignMetrics {
  totalContacts: number;
  activeContacts: number;
  completedContacts: number;

  // Email metrics
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  emailsBounced: number;
  unsubscribes: number;

  // WhatsApp metrics
  whatsappSent: number;
  whatsappDelivered: number;
  whatsappRead: number;
  whatsappReplied: number;

  // Conversion metrics
  leadsGenerated: number;
  conversions: number;
  revenue: number;

  // Engagement
  averageEngagementScore: number;
  clickThroughRate: number;
  conversionRate: number;

  // Performance
  lastExecutionAt?: Date;
  executionErrors: number;
  avgExecutionTime: number;
}

@Entity("mautic_campaigns")
@Index(["tenantId", "status"])
@Index(["mauticInstanceId", "mauticCampaignId"])
export class MauticCampaign {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column("uuid")
  mauticInstanceId: string;

  @Column({ type: "integer", nullable: true })
  mauticCampaignId?: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: CampaignType,
    default: CampaignType.CUSTOM,
  })
  type: CampaignType;

  @Column({
    type: "enum",
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({ type: "jsonb" })
  triggers: CampaignTrigger[];

  @Column({ type: "jsonb" })
  actions: CampaignAction[];

  @Column({ type: "jsonb" })
  settings: CampaignSettings;

  @Column({ type: "jsonb", default: {} })
  metrics: CampaignMetrics;

  @Column({ type: "timestamp", nullable: true })
  startDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  endDate?: Date;

  @Column({ type: "jsonb", nullable: true })
  targetSegments?: number[];

  @Column({ type: "jsonb", nullable: true })
  excludeSegments?: number[];

  @Column({ type: "boolean", default: true })
  isPublished: boolean;

  @Column({ type: "text", nullable: true })
  lastError?: string;

  @Column({ type: "integer", default: 0 })
  priority: number;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @ManyToOne(() => MauticInstance, (instance) => instance.campaigns)
  @JoinColumn({ name: "mauticInstanceId" })
  mauticInstance: MauticInstance;

  // Helper methods
  isActive(): boolean {
    return this.status === CampaignStatus.ACTIVE && this.isPublished;
  }

  isScheduled(): boolean {
    if (!this.startDate) return false;
    return new Date() < this.startDate;
  }

  isExpired(): boolean {
    if (!this.endDate) return false;
    return new Date() > this.endDate;
  }

  canExecute(): boolean {
    if (!this.isActive()) return false;
    if (this.isScheduled()) return false;
    if (this.isExpired()) return false;

    // Check if within business hours (if configured)
    if (this.settings.respectBusinessHours && this.settings.businessHours) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM

      if (
        currentTime < this.settings.businessHours.start ||
        currentTime > this.settings.businessHours.end
      ) {
        return false;
      }
    }

    return true;
  }

  // Trigger evaluation
  evaluateTriggers(contact: any, event?: any): boolean {
    return this.triggers.some((trigger) =>
      this.evaluateTrigger(trigger, contact, event),
    );
  }

  private evaluateTrigger(
    trigger: CampaignTrigger,
    contact: any,
    event?: any,
  ): boolean {
    switch (trigger.type) {
      case TriggerType.LEAD_SCORE:
        return contact.aiScore >= (trigger.conditions.minScore || 0);

      case TriggerType.TAG_ADDED:
        return trigger.conditions.tags?.some((tag: string) =>
          contact.tags?.includes(tag),
        );

      case TriggerType.SEGMENT_MEMBERSHIP:
        return trigger.conditions.segments?.some((segmentId: number) =>
          contact.segments?.includes(segmentId),
        );

      case TriggerType.WHATSAPP_MESSAGE:
        return event?.type === "whatsapp_message";

      case TriggerType.AI_CLASSIFICATION:
        return (
          contact.intent === trigger.conditions.intent ||
          contact.sentiment === trigger.conditions.sentiment
        );

      default:
        return false;
    }
  }

  // Action execution
  getNextActions(
    contact: any,
    executedActions: string[] = [],
  ): CampaignAction[] {
    return this.actions.filter((action) => {
      const actionId = this.getActionId(action);
      return !executedActions.includes(actionId);
    });
  }

  private getActionId(action: CampaignAction): string {
    return `${action.type}_${JSON.stringify(action)}`;
  }

  // Metrics update
  updateMetrics(updates: Partial<CampaignMetrics>): void {
    this.metrics = {
      ...this.metrics,
      ...updates,
      lastExecutionAt: new Date(),
    };
  }

  incrementEmailMetric(
    metric: keyof Pick<
      CampaignMetrics,
      "emailsSent" | "emailsOpened" | "emailsClicked" | "emailsBounced"
    >,
  ): void {
    this.metrics[metric] = (this.metrics[metric] || 0) + 1;
    this.updateRates();
  }

  incrementWhatsAppMetric(
    metric: keyof Pick<
      CampaignMetrics,
      "whatsappSent" | "whatsappDelivered" | "whatsappRead" | "whatsappReplied"
    >,
  ): void {
    this.metrics[metric] = (this.metrics[metric] || 0) + 1;
  }

  private updateRates(): void {
    // Update click-through rate
    if (this.metrics.emailsSent > 0) {
      this.metrics.clickThroughRate =
        (this.metrics.emailsClicked || 0) / this.metrics.emailsSent;
    }

    // Update conversion rate
    if (this.metrics.totalContacts > 0) {
      this.metrics.conversionRate =
        (this.metrics.conversions || 0) / this.metrics.totalContacts;
    }
  }

  // Performance analysis
  getPerformanceReport(): Record<string, any> {
    const metrics = this.metrics;

    return {
      overview: {
        status: this.status,
        totalContacts: metrics.totalContacts,
        completionRate:
          metrics.totalContacts > 0
            ? metrics.completedContacts / metrics.totalContacts
            : 0,
        conversionRate: metrics.conversionRate || 0,
      },

      email: {
        sent: metrics.emailsSent || 0,
        openRate:
          metrics.emailsSent > 0
            ? (metrics.emailsOpened || 0) / metrics.emailsSent
            : 0,
        clickRate: metrics.clickThroughRate || 0,
        bounceRate:
          metrics.emailsSent > 0
            ? (metrics.emailsBounced || 0) / metrics.emailsSent
            : 0,
        unsubscribeRate:
          metrics.emailsSent > 0
            ? (metrics.unsubscribes || 0) / metrics.emailsSent
            : 0,
      },

      whatsapp: {
        sent: metrics.whatsappSent || 0,
        deliveryRate:
          metrics.whatsappSent > 0
            ? (metrics.whatsappDelivered || 0) / metrics.whatsappSent
            : 0,
        readRate:
          metrics.whatsappDelivered > 0
            ? (metrics.whatsappRead || 0) / metrics.whatsappDelivered
            : 0,
        replyRate:
          metrics.whatsappSent > 0
            ? (metrics.whatsappReplied || 0) / metrics.whatsappSent
            : 0,
      },

      performance: {
        executionErrors: metrics.executionErrors || 0,
        avgExecutionTime: metrics.avgExecutionTime || 0,
        lastExecution: metrics.lastExecutionAt,
      },
    };
  }

  // Campaign optimization suggestions
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const report = this.getPerformanceReport();

    // Email optimization suggestions
    if (report.email.openRate < 0.2) {
      suggestions.push("Melhorar assunto dos emails - taxa de abertura baixa");
    }

    if (report.email.clickRate < 0.05) {
      suggestions.push("Melhorar CTAs e conteúdo - taxa de clique baixa");
    }

    if (report.email.bounceRate > 0.1) {
      suggestions.push("Limpar lista de emails - taxa de bounce alta");
    }

    // WhatsApp optimization suggestions
    if (report.whatsapp.replyRate < 0.1) {
      suggestions.push("Tornar mensagens WhatsApp mais interativas");
    }

    // General optimization
    if (report.overview.conversionRate < 0.05) {
      suggestions.push("Revisar ofertas e call-to-actions");
    }

    if (report.performance.executionErrors > 10) {
      suggestions.push("Investigar e corrigir erros de execução");
    }

    return suggestions;
  }

  // Brazilian market specific methods
  respectsBrazilianHolidays(): boolean {
    if (!this.settings.avoidHolidays || !this.settings.holidaysList) {
      return true;
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return !this.settings.holidaysList.includes(today);
  }

  isWithinBusinessHours(): boolean {
    if (!this.settings.respectBusinessHours || !this.settings.businessHours) {
      return true;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    return (
      currentTime >= this.settings.businessHours.start &&
      currentTime <= this.settings.businessHours.end
    );
  }

  // LGPD compliance
  requiresConsent(): boolean {
    return this.settings.requireConsent;
  }

  hasValidConsent(contact: any): boolean {
    if (!this.requiresConsent()) return true;
    return contact.hasMarketingConsent && contact.hasMarketingConsent();
  }

  // Template generation for Brazilian market
  generateBrazilianTemplate(
    type: "welcome" | "abandoned_cart" | "nurturing",
  ): any {
    const templates = {
      welcome: {
        subject: "🎉 Bem-vindo(a) à nossa família!",
        content: `
Olá {{lead.firstname}}!

Seja muito bem-vindo(a)! Estamos felizes em tê-lo(a) conosco.

Nos próximos dias, você receberá:
• Dicas exclusivas
• Ofertas especiais
• Conteúdo personalizado

Um abraço,
Equipe {{company.name}}

📱 WhatsApp: {{company.whatsapp}}
📧 Email: {{company.email}}
        `,
      },

      abandoned_cart: {
        subject: "🛒 Esqueceu algo no seu carrinho?",
        content: `
Oi {{lead.firstname}}!

Notamos que você deixou alguns itens no seu carrinho. Que tal finalizar sua compra?

🎁 Use o código VOLTA10 e ganhe 10% de desconto
💳 Pague no PIX e ganhe mais 5% off
🚚 Frete grátis para todo o Brasil

[FINALIZAR COMPRA]

Aproveite, a oferta é válida por apenas 24h!
        `,
      },

      nurturing: {
        subject: "💡 Dica exclusiva para você!",
        content: `
Olá {{lead.firstname}}!

Preparamos uma dica especial para ajudar você a {{goal}}.

[CONTEÚDO PERSONALIZADO]

Gostou? Responda este email com suas dúvidas!

Até breve,
{{sender.name}}
        `,
      },
    };

    return templates[type];
  }
}

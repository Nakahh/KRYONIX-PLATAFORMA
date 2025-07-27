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
import { User } from "./User";
import { NotificationTemplate } from "./NotificationTemplate";

export enum DeliveryStatus {
  QUEUED = "QUEUED",
  PROCESSING = "PROCESSING",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  RETRY = "RETRY",
}

export enum DeliveryChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
  PUSH = "PUSH",
  SMS = "SMS",
  WEBHOOK = "WEBHOOK",
}

export enum DeliveryPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
  URGENT = "URGENT",
}

export interface DeliveryMetadata {
  // Destinatário
  recipient: {
    userId?: string;
    email?: string;
    phone?: string;
    deviceToken?: string;
    webhookUrl?: string;
    customIdentifier?: string;
  };

  // Conteúdo renderizado
  content: {
    subject?: string;
    title: string;
    body: string;
    htmlBody?: string;
    footer?: string;
    buttons?: Array<{
      text: string;
      url?: string;
      action?: string;
    }>;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size?: number;
    }>;
  };

  // Configurações de entrega
  delivery: {
    maxRetries: number;
    retryCount: number;
    retryDelayMinutes: number;
    scheduledFor?: Date;
    expiresAt?: Date;
    respectQuietHours: boolean;
    respectBusinessHours: boolean;
  };

  // Tracking e Analytics
  tracking: {
    messageId?: string;
    campaignId?: string;
    segmentId?: string;
    abTestVariant?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    trackingPixelId?: string;
  };

  // Provider específico
  provider: {
    name: string; // 'sendgrid', 'whatsapp', 'firebase', etc.
    messageId?: string;
    providerId?: string;
    providerStatus?: string;
    providerResponse?: any;
    webhookData?: any;
  };

  // LGPD compliance
  lgpd: {
    hasConsent: boolean;
    consentType: string; // 'marketing', 'transactional', 'operational'
    consentDate?: Date;
    baseLegal: string; // 'consent', 'legitimate_interest', 'contract', etc.
    canUnsubscribe: boolean;
    unsubscribeUrl?: string;
    dataRetentionDays: number;
  };

  // Contexto de negócio
  context?: {
    workflowId?: string;
    flowId?: string;
    campaignId?: string;
    leadId?: string;
    instanceId?: string;
    eventType?: string;
    triggerData?: any;
  };
}

export interface DeliveryEvents {
  queued?: {
    timestamp: Date;
    queueId?: string;
    priority: number;
  };

  processing?: {
    timestamp: Date;
    workerId?: string;
    attempt: number;
  };

  sent?: {
    timestamp: Date;
    providerId?: string;
    messageId?: string;
    cost?: number;
    quota?: {
      used: number;
      limit: number;
      resetTime: Date;
    };
  };

  delivered?: {
    timestamp: Date;
    confirmationId?: string;
    deliveryTime?: number; // ms
  };

  opened?: {
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    location?: {
      country?: string;
      city?: string;
      timezone?: string;
    };
    openCount: number;
    firstOpenAt?: Date;
    lastOpenAt?: Date;
  };

  clicked?: {
    timestamp: Date;
    url: string;
    buttonId?: string;
    ipAddress?: string;
    userAgent?: string;
    clickCount: number;
    firstClickAt?: Date;
    lastClickAt?: Date;
  };

  failed?: {
    timestamp: Date;
    reason: string;
    errorCode?: string;
    isRetriable: boolean;
    nextRetryAt?: Date;
    providerError?: any;
  };

  cancelled?: {
    timestamp: Date;
    reason: string;
    cancelledBy?: string;
  };

  bounced?: {
    timestamp: Date;
    bounceType: "hard" | "soft";
    reason: string;
    isRetriable: boolean;
  };

  complained?: {
    timestamp: Date;
    complaintType: "spam" | "abuse" | "other";
    feedbackId?: string;
  };

  unsubscribed?: {
    timestamp: Date;
    unsubscribeType: "manual" | "automatic" | "complaint";
    reason?: string;
  };
}

@Entity("notification_deliveries")
@Index(["tenantId", "status", "createdAt"])
@Index(["templateId", "status"])
@Index(["recipientId", "status"])
@Index(["channel", "status", "scheduledFor"])
@Index(["priority", "status", "scheduledFor"])
export class NotificationDelivery {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column("uuid")
  templateId: string;

  @Column("uuid", { nullable: true })
  recipientId?: string; // User ID se aplicável

  @Column({
    type: "enum",
    enum: DeliveryStatus,
    default: DeliveryStatus.QUEUED
  })
  status: DeliveryStatus;

  @Column({
    type: "enum",
    enum: DeliveryChannel,
  })
  channel: DeliveryChannel;

  @Column({
    type: "enum",
    enum: DeliveryPriority,
    default: DeliveryPriority.NORMAL
  })
  priority: DeliveryPriority;

  @Column("jsonb")
  metadata: DeliveryMetadata;

  @Column("jsonb", { default: {} })
  events: DeliveryEvents;

  @Column("timestamp", { nullable: true })
  scheduledFor?: Date;

  @Column("timestamp", { nullable: true })
  sentAt?: Date;

  @Column("timestamp", { nullable: true })
  deliveredAt?: Date;

  @Column("timestamp", { nullable: true })
  openedAt?: Date;

  @Column("timestamp", { nullable: true })
  clickedAt?: Date;

  @Column("timestamp", { nullable: true })
  failedAt?: Date;

  @Column("timestamp", { nullable: true })
  expiresAt?: Date;

  @Column("integer", { default: 0 })
  retryCount: number;

  @Column("integer", { default: 3 })
  maxRetries: number;

  @Column("timestamp", { nullable: true })
  nextRetryAt?: Date;

  @Column("text", { nullable: true })
  errorMessage?: string;

  @Column("jsonb", { nullable: true })
  errorDetails?: any;

  @Column("decimal", { precision: 10, scale: 4, nullable: true })
  cost?: number; // Custo da entrega em reais

  @Column("boolean", { default: false })
  isTest: boolean; // Marca deliveries de teste

  @Column("jsonb", { nullable: true })
  auditLog?: Array<{
    timestamp: Date;
    action: string;
    userId?: string;
    details?: any;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @ManyToOne(() => NotificationTemplate)
  @JoinColumn({ name: "templateId" })
  template: NotificationTemplate;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "recipientId" })
  recipient?: User;

  // Computed properties
  get isScheduled(): boolean {
    return this.scheduledFor !== null && this.scheduledFor > new Date();
  }

  get isExpired(): boolean {
    return this.expiresAt !== null && this.expiresAt < new Date();
  }

  get canRetry(): boolean {
    return (
      this.status === DeliveryStatus.FAILED &&
      this.retryCount < this.maxRetries &&
      !this.isExpired
    );
  }

  get deliveryTime(): number | null {
    if (this.sentAt && this.deliveredAt) {
      return this.deliveredAt.getTime() - this.sentAt.getTime();
    }
    return null;
  }

  // Instance methods
  markAsSent(providerId?: string, messageId?: string, cost?: number): void {
    this.status = DeliveryStatus.SENT;
    this.sentAt = new Date();

    if (providerId || messageId) {
      this.metadata.provider.providerId = providerId;
      this.metadata.provider.messageId = messageId;
    }

    if (cost) {
      this.cost = cost;
    }

    this.events.sent = {
      timestamp: new Date(),
      providerId,
      messageId,
      cost,
    };

    this.addAuditLog("sent", { providerId, messageId, cost });
  }

  markAsDelivered(confirmationId?: string): void {
    this.status = DeliveryStatus.DELIVERED;
    this.deliveredAt = new Date();

    this.events.delivered = {
      timestamp: new Date(),
      confirmationId,
      deliveryTime: this.deliveryTime,
    };

    this.addAuditLog("delivered", { confirmationId });

    // Atualizar estatísticas do template
    if (this.template) {
      this.template.updateStats("delivered");
    }
  }

  markAsOpened(trackingData?: any): void {
    const now = new Date();

    if (!this.openedAt) {
      this.openedAt = now;
    }

    if (!this.events.opened) {
      this.events.opened = {
        timestamp: now,
        openCount: 1,
        firstOpenAt: now,
        lastOpenAt: now,
        ...trackingData,
      };
    } else {
      this.events.opened.openCount++;
      this.events.opened.lastOpenAt = now;
      this.events.opened.timestamp = now;
      Object.assign(this.events.opened, trackingData);
    }

    this.addAuditLog("opened", trackingData);

    // Atualizar estatísticas do template
    if (this.template) {
      this.template.updateStats("opened");
    }
  }

  markAsClicked(url: string, trackingData?: any): void {
    const now = new Date();

    if (!this.clickedAt) {
      this.clickedAt = now;
    }

    if (!this.events.clicked) {
      this.events.clicked = {
        timestamp: now,
        url,
        clickCount: 1,
        firstClickAt: now,
        lastClickAt: now,
        ...trackingData,
      };
    } else {
      this.events.clicked.clickCount++;
      this.events.clicked.lastClickAt = now;
      this.events.clicked.timestamp = now;
      this.events.clicked.url = url;
      Object.assign(this.events.clicked, trackingData);
    }

    this.addAuditLog("clicked", { url, ...trackingData });

    // Atualizar estatísticas do template
    if (this.template) {
      this.template.updateStats("clicked");
    }
  }

  markAsFailed(
    reason: string,
    isRetriable: boolean = true,
    errorDetails?: any,
  ): void {
    this.status = DeliveryStatus.FAILED;
    this.failedAt = new Date();
    this.errorMessage = reason;
    this.errorDetails = errorDetails;

    if (isRetriable && this.canRetry) {
      this.retryCount++;
      this.nextRetryAt = new Date(
        Date.now() + this.metadata.delivery.retryDelayMinutes * 60 * 1000,
      );
    }

    this.events.failed = {
      timestamp: new Date(),
      reason,
      isRetriable,
      nextRetryAt: this.nextRetryAt,
      errorCode: errorDetails?.code,
      providerError: errorDetails,
    };

    this.addAuditLog("failed", { reason, isRetriable, errorDetails });

    // Atualizar estatísticas do template
    if (this.template) {
      this.template.updateStats("failed");
    }
  }

  markAsCancelled(reason: string, cancelledBy?: string): void {
    this.status = DeliveryStatus.CANCELLED;

    this.events.cancelled = {
      timestamp: new Date(),
      reason,
      cancelledBy,
    };

    this.addAuditLog("cancelled", { reason, cancelledBy });
  }

  scheduleRetry(delayMinutes?: number): void {
    if (!this.canRetry) {
      throw new Error("Cannot schedule retry for this delivery");
    }

    this.status = DeliveryStatus.RETRY;
    this.nextRetryAt = new Date(
      Date.now() +
        (delayMinutes || this.metadata.delivery.retryDelayMinutes) * 60 * 1000,
    );

    this.addAuditLog("retry_scheduled", { nextRetryAt: this.nextRetryAt });
  }

  addAuditLog(action: string, details?: any, userId?: string): void {
    if (!this.auditLog) {
      this.auditLog = [];
    }

    this.auditLog.push({
      timestamp: new Date(),
      action,
      userId,
      details,
    });
  }

  updateMetadata(updates: Partial<DeliveryMetadata>): void {
    this.metadata = { ...this.metadata, ...updates };
    this.addAuditLog("metadata_updated", updates);
  }

  getDeliveryReport(): any {
    return {
      id: this.id,
      status: this.status,
      channel: this.channel,
      priority: this.priority,
      recipient: this.metadata.recipient,
      timeline: {
        created: this.createdAt,
        scheduled: this.scheduledFor,
        sent: this.sentAt,
        delivered: this.deliveredAt,
        opened: this.openedAt,
        clicked: this.clickedAt,
        failed: this.failedAt,
      },
      performance: {
        deliveryTime: this.deliveryTime,
        retryCount: this.retryCount,
        cost: this.cost,
      },
      events: this.events,
      lgpd: this.metadata.lgpd,
    };
  }

  // LGPD compliance methods
  canBeProcessed(): boolean {
    return this.metadata.lgpd.hasConsent && !this.isExpired;
  }

  shouldBeDeleted(): boolean {
    if (!this.metadata.lgpd.dataRetentionDays) return false;

    const retentionDate = new Date();
    retentionDate.setDate(
      retentionDate.getDate() - this.metadata.lgpd.dataRetentionDays,
    );

    return this.createdAt < retentionDate;
  }

  anonymizePersonalData(): void {
    // Anonimizar dados pessoais conforme LGPD
    this.metadata.recipient = {
      customIdentifier: "ANONYMIZED_" + this.id.substring(0, 8),
    };

    if (this.events.opened) {
      delete this.events.opened.ipAddress;
      delete this.events.opened.userAgent;
      delete this.events.opened.location;
    }

    if (this.events.clicked) {
      delete this.events.clicked.ipAddress;
      delete this.events.clicked.userAgent;
    }

    this.addAuditLog("data_anonymized", { reason: "LGPD_compliance" });
  }
}

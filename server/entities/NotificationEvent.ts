import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "./Tenant";
import { User } from "./User";
import { NotificationTemplate } from "./NotificationTemplate";
import { NotificationDelivery } from "./NotificationDelivery";

export enum EventType {
  // Template events
  TEMPLATE_CREATED = "TEMPLATE_CREATED",
  TEMPLATE_UPDATED = "TEMPLATE_UPDATED",
  TEMPLATE_ACTIVATED = "TEMPLATE_ACTIVATED",
  TEMPLATE_DEACTIVATED = "TEMPLATE_DEACTIVATED",
  TEMPLATE_DELETED = "TEMPLATE_DELETED",
  TEMPLATE_CLONED = "TEMPLATE_CLONED",

  // Delivery events
  DELIVERY_QUEUED = "DELIVERY_QUEUED",
  DELIVERY_PROCESSING = "DELIVERY_PROCESSING",
  DELIVERY_SENT = "DELIVERY_SENT",
  DELIVERY_DELIVERED = "DELIVERY_DELIVERED",
  DELIVERY_OPENED = "DELIVERY_OPENED",
  DELIVERY_CLICKED = "DELIVERY_CLICKED",
  DELIVERY_FAILED = "DELIVERY_FAILED",
  DELIVERY_RETRIED = "DELIVERY_RETRIED",
  DELIVERY_CANCELLED = "DELIVERY_CANCELLED",
  DELIVERY_EXPIRED = "DELIVERY_EXPIRED",
  DELIVERY_BOUNCED = "DELIVERY_BOUNCED",

  // User interaction events
  USER_SUBSCRIBED = "USER_SUBSCRIBED",
  USER_UNSUBSCRIBED = "USER_UNSUBSCRIBED",
  USER_COMPLAINED = "USER_COMPLAINED",
  USER_PREFERENCES_UPDATED = "USER_PREFERENCES_UPDATED",

  // System events
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  RATE_LIMIT_HIT = "RATE_LIMIT_HIT",
  PROVIDER_ERROR = "PROVIDER_ERROR",
  WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED",
  WEBHOOK_FAILED = "WEBHOOK_FAILED",

  // Campaign events
  CAMPAIGN_STARTED = "CAMPAIGN_STARTED",
  CAMPAIGN_COMPLETED = "CAMPAIGN_COMPLETED",
  CAMPAIGN_PAUSED = "CAMPAIGN_PAUSED",
  CAMPAIGN_RESUMED = "CAMPAIGN_RESUMED",
  CAMPAIGN_CANCELLED = "CAMPAIGN_CANCELLED",

  // A/B Testing events
  AB_TEST_STARTED = "AB_TEST_STARTED",
  AB_TEST_VARIANT_SENT = "AB_TEST_VARIANT_SENT",
  AB_TEST_COMPLETED = "AB_TEST_COMPLETED",
  AB_TEST_WINNER_SELECTED = "AB_TEST_WINNER_SELECTED",

  // Integration events
  WHATSAPP_CONNECTED = "WHATSAPP_CONNECTED",
  WHATSAPP_DISCONNECTED = "WHATSAPP_DISCONNECTED",
  MAUTIC_SYNC = "MAUTIC_SYNC",
  N8N_TRIGGERED = "N8N_TRIGGERED",
  TYPEBOT_EXECUTED = "TYPEBOT_EXECUTED",
  AI_RESPONSE_GENERATED = "AI_RESPONSE_GENERATED",

  // LGPD events
  CONSENT_GRANTED = "CONSENT_GRANTED",
  CONSENT_REVOKED = "CONSENT_REVOKED",
  DATA_EXPORT_REQUESTED = "DATA_EXPORT_REQUESTED",
  DATA_DELETION_REQUESTED = "DATA_DELETION_REQUESTED",
  DATA_ANONYMIZED = "DATA_ANONYMIZED",

  // Security events
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  SECURITY_SCAN = "SECURITY_SCAN",
}

export enum EventSeverity {
  INFO = "INFO",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum EventCategory {
  TEMPLATE = "TEMPLATE",
  DELIVERY = "DELIVERY",
  USER = "USER",
  SYSTEM = "SYSTEM",
  CAMPAIGN = "CAMPAIGN",
  INTEGRATION = "INTEGRATION",
  SECURITY = "SECURITY",
  LGPD = "LGPD",
  ANALYTICS = "ANALYTICS",
}

export interface EventData {
  // Identificadores relacionados
  templateId?: string;
  deliveryId?: string;
  campaignId?: string;
  workflowId?: string;
  flowId?: string;
  instanceId?: string;

  // Dados específicos do evento
  eventData?: any;
  oldValues?: any;
  newValues?: any;
  errorMessage?: string;
  errorStack?: string;

  // Contexto da requisição
  requestId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;

  // Localização e device
  location?: {
    country?: string;
    state?: string;
    city?: string;
    timezone?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  device?: {
    type: "desktop" | "mobile" | "tablet" | "unknown";
    os?: string;
    browser?: string;
    version?: string;
  };

  // Performance metrics
  performance?: {
    duration?: number; // em ms
    memoryUsage?: number; // em MB
    cpuUsage?: number; // em %
    queueSize?: number;
    responseTime?: number;
  };

  // Provider específico
  provider?: {
    name: string;
    response?: any;
    webhook?: any;
    cost?: number;
    quotaUsed?: number;
    quotaLimit?: number;
  };

  // Tracking UTM
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };

  // LGPD e compliance
  compliance?: {
    hasConsent: boolean;
    consentType?: string;
    baseLegal?: string;
    dataProcessed?: string[];
    retentionDays?: number;
  };

  // Tags customizadas
  tags?: string[];

  // Metadata adicional
  metadata?: Record<string, any>;
}

@Entity("notification_events")
@Index(["tenantId", "eventType", "createdAt"])
@Index(["eventCategory", "severity", "createdAt"])
@Index(["userId", "eventType", "createdAt"])
@Index(["templateId", "eventType", "createdAt"])
@Index(["deliveryId", "eventType", "createdAt"])
@Index(["createdAt"]) // Para queries por data
export class NotificationEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column("uuid", { nullable: true })
  userId?: string;

  @Column("uuid", { nullable: true })
  templateId?: string;

  @Column("uuid", { nullable: true })
  deliveryId?: string;

  @Column({
    type: "enum",
    enum: EventType,
  })
  eventType: EventType;

  @Column({
    type: "enum",
    enum: EventCategory,
  })
  eventCategory: EventCategory;

  @Column({
    type: "enum",
    enum: EventSeverity,
    default: EventSeverity.INFO
  })
  severity: EventSeverity;

  @Column("text")
  description: string;

  @Column("jsonb", { default: {} })
  eventData: EventData;

  @Column("text", { nullable: true })
  source?: string; // 'api', 'webhook', 'scheduler', 'manual'

  @Column("text", { nullable: true })
  channel?: string; // email, whatsapp, etc.

  @Column("boolean", { default: false })
  isProcessed: boolean; // Para eventos que precisam de processamento

  @Column("boolean", { default: false })
  isAcknowledged: boolean; // Para eventos que precisam de ação manual

  @Column("timestamp", { nullable: true })
  acknowledgedAt?: Date;

  @Column("uuid", { nullable: true })
  acknowledgedBy?: string;

  @Column("text", { nullable: true })
  acknowledgmentNote?: string;

  @Column("timestamp", { nullable: true })
  expiresAt?: Date; // Para eventos com TTL

  @Column("integer", { default: 1 })
  occurrences: number; // Quantas vezes este evento ocorreu

  @Column("timestamp", { nullable: true })
  firstOccurredAt?: Date;

  @Column("timestamp", { nullable: true })
  lastOccurredAt?: Date;

  @Column("jsonb", { nullable: true })
  aggregatedData?: any; // Dados agregados quando occurrences > 1

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user?: User;

  @ManyToOne(() => NotificationTemplate, { nullable: true })
  @JoinColumn({ name: "templateId" })
  template?: NotificationTemplate;

  @ManyToOne(() => NotificationDelivery, { nullable: true })
  @JoinColumn({ name: "deliveryId" })
  delivery?: NotificationDelivery;

  // Computed properties
  get isExpired(): boolean {
    return this.expiresAt !== null && this.expiresAt < new Date();
  }

  get isCritical(): boolean {
    return (
      this.severity === EventSeverity.CRITICAL ||
      this.severity === EventSeverity.HIGH
    );
  }

  get isRecent(): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.createdAt > oneHourAgo;
  }

  // Static factory methods
  static createTemplateEvent(
    tenantId: string,
    templateId: string,
    eventType: EventType,
    description: string,
    eventData?: any,
    userId?: string,
  ): NotificationEvent {
    const event = new NotificationEvent();
    event.tenantId = tenantId;
    event.templateId = templateId;
    event.userId = userId;
    event.eventType = eventType;
    event.eventCategory = EventCategory.TEMPLATE;
    event.description = description;
    event.eventData = eventData || {};
    event.severity = EventSeverity.INFO;
    event.source = "api";

    return event;
  }

  static createDeliveryEvent(
    tenantId: string,
    deliveryId: string,
    eventType: EventType,
    description: string,
    eventData?: any,
    severity: EventSeverity = EventSeverity.INFO,
  ): NotificationEvent {
    const event = new NotificationEvent();
    event.tenantId = tenantId;
    event.deliveryId = deliveryId;
    event.eventType = eventType;
    event.eventCategory = EventCategory.DELIVERY;
    event.description = description;
    event.eventData = eventData || {};
    event.severity = severity;
    event.source = "system";

    return event;
  }

  static createUserEvent(
    tenantId: string,
    userId: string,
    eventType: EventType,
    description: string,
    eventData?: any,
  ): NotificationEvent {
    const event = new NotificationEvent();
    event.tenantId = tenantId;
    event.userId = userId;
    event.eventType = eventType;
    event.eventCategory = EventCategory.USER;
    event.description = description;
    event.eventData = eventData || {};
    event.severity = EventSeverity.INFO;
    event.source = "user";

    return event;
  }

  static createSystemEvent(
    tenantId: string,
    eventType: EventType,
    description: string,
    severity: EventSeverity,
    eventData?: any,
  ): NotificationEvent {
    const event = new NotificationEvent();
    event.tenantId = tenantId;
    event.eventType = eventType;
    event.eventCategory = EventCategory.SYSTEM;
    event.description = description;
    event.eventData = eventData || {};
    event.severity = severity;
    event.source = "system";

    return event;
  }

  static createSecurityEvent(
    tenantId: string,
    eventType: EventType,
    description: string,
    eventData?: any,
    userId?: string,
  ): NotificationEvent {
    const event = new NotificationEvent();
    event.tenantId = tenantId;
    event.userId = userId;
    event.eventType = eventType;
    event.eventCategory = EventCategory.SECURITY;
    event.description = description;
    event.eventData = eventData || {};
    event.severity = EventSeverity.HIGH;
    event.source = "security";

    return event;
  }

  static createLGPDEvent(
    tenantId: string,
    userId: string,
    eventType: EventType,
    description: string,
    eventData?: any,
  ): NotificationEvent {
    const event = new NotificationEvent();
    event.tenantId = tenantId;
    event.userId = userId;
    event.eventType = eventType;
    event.eventCategory = EventCategory.LGPD;
    event.description = description;
    event.eventData = eventData || {};
    event.severity = EventSeverity.MEDIUM;
    event.source = "lgpd";

    return event;
  }

  // Instance methods
  acknowledge(userId: string, note?: string): void {
    this.isAcknowledged = true;
    this.acknowledgedAt = new Date();
    this.acknowledgedBy = userId;
    this.acknowledgmentNote = note;
  }

  incrementOccurrence(additionalData?: any): void {
    this.occurrences++;
    this.lastOccurredAt = new Date();

    if (!this.firstOccurredAt) {
      this.firstOccurredAt = this.createdAt;
    }

    if (additionalData) {
      if (!this.aggregatedData) {
        this.aggregatedData = [];
      }
      this.aggregatedData.push({
        timestamp: new Date(),
        data: additionalData,
      });
    }
  }

  addMetadata(key: string, value: any): void {
    if (!this.eventData.metadata) {
      this.eventData.metadata = {};
    }
    this.eventData.metadata[key] = value;
  }

  addTag(tag: string): void {
    if (!this.eventData.tags) {
      this.eventData.tags = [];
    }
    if (!this.eventData.tags.includes(tag)) {
      this.eventData.tags.push(tag);
    }
  }

  setExpiration(hours: number): void {
    this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  updateEventData(updates: Partial<EventData>): void {
    this.eventData = { ...this.eventData, ...updates };
  }

  getEventSummary(): any {
    return {
      id: this.id,
      type: this.eventType,
      category: this.eventCategory,
      severity: this.severity,
      description: this.description,
      occurrences: this.occurrences,
      isRecent: this.isRecent,
      isCritical: this.isCritical,
      isAcknowledged: this.isAcknowledged,
      createdAt: this.createdAt,
      lastOccurredAt: this.lastOccurredAt || this.createdAt,
      tags: this.eventData.tags || [],
      source: this.source,
    };
  }

  // Analytics helpers
  static getEventCountsByType(
    events: NotificationEvent[],
  ): Record<string, number> {
    return events.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + event.occurrences;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  static getEventCountsBySeverity(
    events: NotificationEvent[],
  ): Record<string, number> {
    return events.reduce(
      (acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + event.occurrences;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  static getCriticalEvents(events: NotificationEvent[]): NotificationEvent[] {
    return events.filter((event) => event.isCritical && !event.isAcknowledged);
  }

  static getRecentEvents(
    events: NotificationEvent[],
    hours: number = 24,
  ): NotificationEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return events.filter((event) => event.createdAt > cutoff);
  }
}

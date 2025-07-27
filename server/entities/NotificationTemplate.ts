import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { Tenant } from "./Tenant";

export enum NotificationCategory {
  SYSTEM = "SYSTEM",
  BILLING = "BILLING",
  WHATSAPP = "WHATSAPP",
  AI_SERVICE = "AI_SERVICE",
  AUTOMATION = "AUTOMATION",
  TYPEBOT = "TYPEBOT",
  MAUTIC = "MAUTIC",
  N8N = "N8N",
  USER_ACTION = "USER_ACTION",
  INTEGRATION = "INTEGRATION",
  SECURITY = "SECURITY",
  MARKETING = "MARKETING",
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
  URGENT = "URGENT",
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
  PUSH = "PUSH",
  SMS = "SMS",
  WEBHOOK = "WEBHOOK",
}

export enum TemplateStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  TESTING = "TESTING",
}

export interface TemplateContent {
  subject?: string;
  title: string;
  body: string;
  footer?: string;
  htmlBody?: string;
  buttons?: Array<{
    text: string;
    url?: string;
    action?: string;
  }>;
  image?: {
    url: string;
    alt?: string;
  };
  metadata?: Record<string, any>;
}

export interface TemplateSettings {
  enableRichText: boolean;
  allowHtml: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
  enableAbTesting: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;
    timezone: string;
  };
  rateLimiting: {
    enabled: boolean;
    maxPerHour: number;
    maxPerDay: number;
  };
  businessHours: {
    enabled: boolean;
    workingDays: string[]; // ['monday', 'tuesday', ...]
    startTime: string;
    endTime: string;
    timezone: string;
    holidays: string[]; // ISO dates
  };
  retryPolicy: {
    maxRetries: number;
    retryDelayMinutes: number;
    backoffMultiplier: number;
  };
}

export interface TemplateVariables {
  [key: string]: {
    type: "string" | "number" | "boolean" | "date" | "array" | "object";
    required: boolean;
    defaultValue?: any;
    description?: string;
    validation?: {
      pattern?: string;
      min?: number;
      max?: number;
      options?: string[];
    };
  };
}

@Entity("notification_templates")
@Index(["tenantId", "category", "status"])
@Index(["eventType", "status"])
export class NotificationTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255 })
  eventType: string; // e.g., 'user.registered', 'whatsapp.message.failed'

  @Column({
    type: "enum",
    enum: NotificationCategory,
  })
  category: NotificationCategory;

  @Column({
    type: "enum",
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL
  })
  priority: NotificationPriority;

  @Column({
    type: "enum",
    enum: TemplateStatus,
    default: TemplateStatus.DRAFT
  })
  status: TemplateStatus;

  @Column("simple-array")
  supportedChannels: string[];

  @Column("jsonb")
  content: any;

  @Column("jsonb")
  variables: any;

  @Column("jsonb")
  settings: any;

  @Column("jsonb", { nullable: true })
  conditions?: any;

  @Column("jsonb", { nullable: true })
  abTestConfig?: any;

  @Column({ type: "integer", default: 0 })
  totalSent: number;

  @Column({ type: "integer", default: 0 })
  totalDelivered: number;

  @Column({ type: "integer", default: 0 })
  totalOpened: number;

  @Column({ type: "integer", default: 0 })
  totalClicked: number;

  @Column({ type: "integer", default: 0 })
  totalFailed: number;

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt?: Date;

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

  // Computed properties
  get deliveryRate(): number {
    return this.totalSent > 0
      ? (this.totalDelivered / this.totalSent) * 100
      : 0;
  }

  get openRate(): number {
    return this.totalDelivered > 0
      ? (this.totalOpened / this.totalDelivered) * 100
      : 0;
  }

  get clickRate(): number {
    return this.totalOpened > 0
      ? (this.totalClicked / this.totalOpened) * 100
      : 0;
  }

  get failureRate(): number {
    return this.totalSent > 0 ? (this.totalFailed / this.totalSent) * 100 : 0;
  }

  // Instance methods
  isActive(): boolean {
    return this.status === TemplateStatus.ACTIVE;
  }

  canSendToChannel(channel: NotificationChannel): boolean {
    return this.supportedChannels.includes(channel);
  }

  getContentForChannel(channel: NotificationChannel): TemplateContent | null {
    return this.content[channel] || null;
  }

  shouldRespectQuietHours(): boolean {
    return this.settings.quietHours.enabled;
  }

  shouldRespectBusinessHours(): boolean {
    return this.settings.businessHours.enabled;
  }

  updateStats(
    action: "sent" | "delivered" | "opened" | "clicked" | "failed",
  ): void {
    switch (action) {
      case "sent":
        this.totalSent++;
        break;
      case "delivered":
        this.totalDelivered++;
        break;
      case "opened":
        this.totalOpened++;
        break;
      case "clicked":
        this.totalClicked++;
        break;
      case "failed":
        this.totalFailed++;
        break;
    }
    this.lastUsedAt = new Date();
  }

  renderContent(
    channel: NotificationChannel,
    variables: Record<string, any>,
  ): TemplateContent | null {
    const content = this.getContentForChannel(channel);
    if (!content) return null;

    // Basic Mustache-style template rendering
    const rendered = JSON.parse(JSON.stringify(content));

    Object.keys(variables).forEach((key) => {
      const value = variables[key];
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, "g");

      if (rendered.title) {
        rendered.title = rendered.title.replace(placeholder, String(value));
      }
      if (rendered.body) {
        rendered.body = rendered.body.replace(placeholder, String(value));
      }
      if (rendered.subject) {
        rendered.subject = rendered.subject.replace(placeholder, String(value));
      }
      if (rendered.htmlBody) {
        rendered.htmlBody = rendered.htmlBody.replace(
          placeholder,
          String(value),
        );
      }
    });

    return rendered;
  }

  validateVariables(variables: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    Object.keys(this.variables).forEach((varName) => {
      const varDef = this.variables[varName];
      const value = variables[varName];

      if (varDef.required && (value === undefined || value === null)) {
        errors.push(`Variável obrigatória '${varName}' está ausente`);
        return;
      }

      if (value !== undefined && value !== null) {
        // Type validation
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (varDef.type !== actualType) {
          errors.push(
            `Variável '${varName}' deve ser ${varDef.type} mas recebeu ${actualType}`,
          );
        }

        // Validation rules
        if (varDef.validation) {
          const validation = varDef.validation;

          if (validation.pattern && typeof value === "string") {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) {
              errors.push(`Variável '${varName}' não atende ao padrão exigido`);
            }
          }

          if (
            validation.min !== undefined &&
            typeof value === "number" &&
            value < validation.min
          ) {
            errors.push(
              `Variável '${varName}' deve ser maior ou igual a ${validation.min}`,
            );
          }

          if (
            validation.max !== undefined &&
            typeof value === "number" &&
            value > validation.max
          ) {
            errors.push(
              `Variável '${varName}' deve ser menor ou igual a ${validation.max}`,
            );
          }

          if (
            validation.options &&
            !validation.options.includes(String(value))
          ) {
            errors.push(
              `Variável '${varName}' deve ser uma das opções: ${validation.options.join(", ")}`,
            );
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getPerformanceReport(): any {
    return {
      totalSent: this.totalSent,
      deliveryRate: this.deliveryRate,
      openRate: this.openRate,
      clickRate: this.clickRate,
      failureRate: this.failureRate,
      lastUsed: this.lastUsedAt,
    };
  }

  clone(newName: string): Partial<NotificationTemplate> {
    return {
      tenantId: this.tenantId,
      name: newName,
      description: this.description,
      eventType: this.eventType,
      category: this.category,
      priority: this.priority,
      status: TemplateStatus.DRAFT,
      supportedChannels: [...this.supportedChannels],
      content: JSON.parse(JSON.stringify(this.content)),
      variables: JSON.parse(JSON.stringify(this.variables)),
      settings: JSON.parse(JSON.stringify(this.settings)),
      conditions: this.conditions
        ? JSON.parse(JSON.stringify(this.conditions))
        : undefined,
    };
  }
}

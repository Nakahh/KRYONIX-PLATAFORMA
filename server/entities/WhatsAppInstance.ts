import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from "typeorm";
import { Tenant } from "./Tenant";
import { Message } from "./Message";

export enum InstanceStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  SUSPENDED = "SUSPENDED",
  ERROR = "ERROR",
}

export enum InstanceType {
  OFFICIAL = "OFFICIAL", // WhatsApp Business API
  EVOLUTION = "EVOLUTION", // Evolution API
  BAILEYS = "BAILEYS", // Baileys WebSocket
}

export interface InstanceConfig {
  webhookUrl?: string;
  webhookEvents?: string[];
  autoReply?: boolean;
  businessProfile?: {
    description?: string;
    email?: string;
    website?: string;
    address?: string;
    category?: string;
  };
  rateLimits?: {
    messagesPerSecond?: number;
    messagesPerMinute?: number;
    messagesPerHour?: number;
  };
  features?: {
    readReceipts?: boolean;
    typing?: boolean;
    presence?: boolean;
    groupsEnabled?: boolean;
    mediaEnabled?: boolean;
  };
}

export interface InstanceStats {
  messagesSent: number;
  messagesReceived: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesFailed: number;
  connectionUptime: number;
  lastActivity: Date;
  apiCallsToday: number;
  monthlyUsage: number;
}

@Entity("whatsapp_instances")
@Index(["tenantId", "phoneNumber"], { unique: true })
@Index(["phoneNumber"], { unique: true })
export class WhatsAppInstance {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({
    type: "enum",
    enum: InstanceType,
    default: InstanceType.EVOLUTION,
  })
  type: InstanceType;

  @Column({
    type: "enum",
    enum: InstanceStatus,
    default: InstanceStatus.INACTIVE,
  })
  status: InstanceStatus;

  @Column({ type: "jsonb", nullable: true })
  config?: InstanceConfig;

  @Column({ type: "jsonb", default: {} })
  stats: InstanceStats;

  // WhatsApp Business API specific fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  businessAccountId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phoneNumberId?: string;

  @Column({ type: "text", nullable: true })
  accessToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  appSecret?: string;

  // Evolution API specific fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  instanceKey?: string;

  @Column({ type: "text", nullable: true })
  apiToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  serverUrl?: string;

  // QR Code and connection data
  @Column({ type: "text", nullable: true })
  qrCode?: string;

  @Column({ type: "timestamp", nullable: true })
  qrCodeExpires?: Date;

  @Column({ type: "timestamp", nullable: true })
  lastConnectedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  lastDisconnectedAt?: Date;

  @Column({ type: "text", nullable: true })
  lastError?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column("uuid")
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.whatsappInstances)
  tenant: Tenant;

  @OneToMany(() => Message, (message) => message.instance)
  messages: Message[];

  // Instance methods
  get isConnected(): boolean {
    return this.status === InstanceStatus.CONNECTED;
  }

  get isActive(): boolean {
    return [InstanceStatus.CONNECTED, InstanceStatus.CONNECTING].includes(
      this.status,
    );
  }

  get needsQRCode(): boolean {
    return (
      this.type !== InstanceType.OFFICIAL &&
      this.status === InstanceStatus.INACTIVE &&
      (!this.qrCode || this.isQRCodeExpired())
    );
  }

  isQRCodeExpired(): boolean {
    if (!this.qrCodeExpires) return true;
    return new Date() > this.qrCodeExpires;
  }

  updateQRCode(qrCode: string, expiresInMinutes = 5): void {
    this.qrCode = qrCode;
    this.qrCodeExpires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  }

  markConnected(): void {
    this.status = InstanceStatus.CONNECTED;
    this.lastConnectedAt = new Date();
    this.qrCode = null;
    this.qrCodeExpires = null;
    this.lastError = null;
  }

  markDisconnected(error?: string): void {
    this.status = InstanceStatus.DISCONNECTED;
    this.lastDisconnectedAt = new Date();
    if (error) {
      this.lastError = error;
    }
  }

  markError(error: string): void {
    this.status = InstanceStatus.ERROR;
    this.lastError = error;
    this.lastDisconnectedAt = new Date();
  }

  updateStats(updates: Partial<InstanceStats>): void {
    this.stats = {
      ...this.stats,
      ...updates,
      lastActivity: new Date(),
    };
  }

  incrementMessageCount(
    type: "sent" | "received" | "delivered" | "read" | "failed",
  ): void {
    const statsKey =
      `messages${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof InstanceStats;
    if (typeof this.stats[statsKey] === "number") {
      (this.stats[statsKey] as number)++;
    }
    this.stats.lastActivity = new Date();
  }

  getWebhookUrl(): string | null {
    if (this.config?.webhookUrl) {
      return this.config.webhookUrl;
    }

    // Generate default webhook URL
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    return `${baseUrl}/api/webhooks/whatsapp/${this.tenantId}/${this.id}`;
  }

  canSendMessage(): boolean {
    if (!this.isConnected) return false;

    // Check rate limits if configured
    const rateLimits = this.config?.rateLimits;
    if (rateLimits) {
      // In a real implementation, check against Redis rate limit counters
      // For now, just return true if connected
      return true;
    }

    return true;
  }

  getRemainingRateLimit(): {
    messagesPerSecond: number;
    messagesPerMinute: number;
    messagesPerHour: number;
  } {
    // In a real implementation, calculate from Redis counters
    const limits = this.config?.rateLimits || {
      messagesPerSecond: 10,
      messagesPerMinute: 100,
      messagesPerHour: 1000,
    };

    return {
      messagesPerSecond: limits.messagesPerSecond || 10,
      messagesPerMinute: limits.messagesPerMinute || 100,
      messagesPerHour: limits.messagesPerHour || 1000,
    };
  }
}

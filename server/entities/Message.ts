import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { Tenant } from "./Tenant";
import { WhatsAppInstance } from "./WhatsAppInstance";

export enum MessageDirection {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
  LOCATION = "LOCATION",
  CONTACT = "CONTACT",
  TEMPLATE = "TEMPLATE",
  INTERACTIVE = "INTERACTIVE",
  STICKER = "STICKER",
  REACTION = "REACTION",
  SYSTEM = "SYSTEM",
}

export enum MessageStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
}

export interface MessageContent {
  text?: string;
  media?: {
    url?: string;
    mimeType?: string;
    filename?: string;
    caption?: string;
    size?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  interactive?: {
    type: "button" | "list" | "quick_reply";
    header?: string;
    body: string;
    footer?: string;
    buttons?: Array<{
      id: string;
      title: string;
    }>;
    sections?: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>;
  };
  template?: {
    name: string;
    language: string;
    components?: any[];
  };
}

export interface MessageMetadata {
  whatsappMessageId?: string;
  conversationId?: string;
  quotedMessageId?: string;
  forwardedFrom?: string;
  automation?: {
    triggeredBy?: string;
    ruleId?: string;
    flowId?: string;
  };
  campaign?: {
    id?: string;
    name?: string;
    type?: string;
  };
  contact?: {
    name?: string;
    profilePic?: string;
    businessName?: string;
  };
  costs?: {
    conversation?: number;
    currency?: string;
    billable?: boolean;
  };
}

@Entity("messages")
@Index(["tenantId", "direction", "createdAt"])
@Index(["instanceId", "status"])
@Index(["contactPhone", "createdAt"])
@Index(["whatsappMessageId"], { unique: true })
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  whatsappMessageId?: string;

  @Column({
    type: "enum",
    enum: MessageDirection,
  })
  direction: MessageDirection;

  @Column({
    type: "enum",
    enum: MessageType,
  })
  type: MessageType;

  @Column({
    type: "enum",
    enum: MessageStatus,
    default: MessageStatus.PENDING,
  })
  status: MessageStatus;

  @Column({ type: "jsonb" })
  content: MessageContent;

  @Column({ type: 'varchar', length: 20 })
  contactPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactName?: string;

  @Column({ type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  deliveredAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  readAt?: Date;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;

  @Column({ type: "integer", default: 0 })
  retryCount: number;

  @Column({ type: "timestamp", nullable: true })
  scheduledAt?: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata?: MessageMetadata;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column("uuid")
  tenantId: string;

  @Column("uuid")
  instanceId: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @ManyToOne(() => WhatsAppInstance, (instance) => instance.messages)
  instance: WhatsAppInstance;

  // Instance methods
  get isInbound(): boolean {
    return this.direction === MessageDirection.INBOUND;
  }

  get isOutbound(): boolean {
    return this.direction === MessageDirection.OUTBOUND;
  }

  get isDelivered(): boolean {
    return [MessageStatus.DELIVERED, MessageStatus.READ].includes(this.status);
  }

  get isRead(): boolean {
    return this.status === MessageStatus.READ;
  }

  get isFailed(): boolean {
    return [MessageStatus.FAILED, MessageStatus.REJECTED].includes(this.status);
  }

  get hasMedia(): boolean {
    return [
      MessageType.IMAGE,
      MessageType.VIDEO,
      MessageType.AUDIO,
      MessageType.DOCUMENT,
      MessageType.STICKER,
    ].includes(this.type);
  }

  get isFromAutomation(): boolean {
    return !!(
      this.metadata?.automation?.ruleId || this.metadata?.automation?.flowId
    );
  }

  get isFromCampaign(): boolean {
    return !!this.metadata?.campaign?.id;
  }

  markSent(whatsappMessageId?: string): void {
    this.status = MessageStatus.SENT;
    this.sentAt = new Date();
    if (whatsappMessageId) {
      this.whatsappMessageId = whatsappMessageId;
    }
  }

  markDelivered(): void {
    this.status = MessageStatus.DELIVERED;
    this.deliveredAt = new Date();
  }

  markRead(): void {
    this.status = MessageStatus.READ;
    this.readAt = new Date();
  }

  markFailed(error: string): void {
    this.status = MessageStatus.FAILED;
    this.errorMessage = error;
    this.retryCount++;
  }

  canRetry(): boolean {
    return this.isFailed && this.retryCount < 3;
  }

  getMediaUrl(): string | null {
    return this.content.media?.url || null;
  }

  getDisplayText(): string {
    switch (this.type) {
      case MessageType.TEXT:
        return this.content.text || "";
      case MessageType.IMAGE:
        return this.content.media?.caption || "[Image]";
      case MessageType.VIDEO:
        return this.content.media?.caption || "[Video]";
      case MessageType.AUDIO:
        return "[Audio]";
      case MessageType.DOCUMENT:
        return `[Document: ${this.content.media?.filename || "Unknown"}]`;
      case MessageType.LOCATION:
        return `[Location: ${this.content.location?.name || "Unknown"}]`;
      case MessageType.CONTACT:
        return `[Contact: ${this.content.contact?.name || "Unknown"}]`;
      case MessageType.TEMPLATE:
        return `[Template: ${this.content.template?.name || "Unknown"}]`;
      case MessageType.INTERACTIVE:
        return this.content.interactive?.body || "[Interactive]";
      case MessageType.STICKER:
        return "[Sticker]";
      case MessageType.REACTION:
        return "[Reaction]";
      default:
        return "[Unknown message type]";
    }
  }

  getConversationCost(): number {
    return this.metadata?.costs?.conversation || 0;
  }

  isBillable(): boolean {
    return this.metadata?.costs?.billable || false;
  }

  static createTextMessage(
    tenantId: string,
    instanceId: string,
    contactPhone: string,
    text: string,
    direction: MessageDirection = MessageDirection.OUTBOUND,
  ): Partial<Message> {
    return {
      tenantId,
      instanceId,
      direction,
      type: MessageType.TEXT,
      contactPhone,
      content: { text },
      status: MessageStatus.PENDING,
    };
  }

  static createMediaMessage(
    tenantId: string,
    instanceId: string,
    contactPhone: string,
    type: MessageType,
    mediaUrl: string,
    caption?: string,
    direction: MessageDirection = MessageDirection.OUTBOUND,
  ): Partial<Message> {
    return {
      tenantId,
      instanceId,
      direction,
      type,
      contactPhone,
      content: {
        media: {
          url: mediaUrl,
          caption,
        },
      },
      status: MessageStatus.PENDING,
    };
  }

  static createTemplateMessage(
    tenantId: string,
    instanceId: string,
    contactPhone: string,
    templateName: string,
    language: string,
    components?: any[],
  ): Partial<Message> {
    return {
      tenantId,
      instanceId,
      direction: MessageDirection.OUTBOUND,
      type: MessageType.TEMPLATE,
      contactPhone,
      content: {
        template: {
          name: templateName,
          language,
          components,
        },
      },
      status: MessageStatus.PENDING,
    };
  }
}

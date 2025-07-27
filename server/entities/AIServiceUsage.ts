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

export enum AIServiceType {
  OPENAI = "OPENAI",
  GOOGLE = "GOOGLE",
  ANTHROPIC = "ANTHROPIC",
  AZURE = "AZURE",
}

export enum AIOperationType {
  CHAT_COMPLETION = "CHAT_COMPLETION",
  TEXT_ANALYSIS = "TEXT_ANALYSIS",
  SENTIMENT_ANALYSIS = "SENTIMENT_ANALYSIS",
  INTENT_CLASSIFICATION = "INTENT_CLASSIFICATION",
  SPEECH_TO_TEXT = "SPEECH_TO_TEXT",
  TEXT_TO_SPEECH = "TEXT_TO_SPEECH",
  TRANSLATION = "TRANSLATION",
  IMAGE_ANALYSIS = "IMAGE_ANALYSIS",
  CONTENT_MODERATION = "CONTENT_MODERATION",
}

export enum AISourceModule {
  TYPEBOT = "TYPEBOT",
  N8N = "N8N",
  WHATSAPP = "WHATSAPP",
  API = "API",
  MANUAL = "MANUAL",
}

@Entity("ai_service_usage")
@Index(["tenantId", "createdAt"])
@Index(["serviceType", "createdAt"])
@Index(["sourceModule", "createdAt"])
export class AIServiceUsage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column({
    type: "enum",
    enum: AIServiceType,
  })
  serviceType: AIServiceType;

  @Column({
    type: "enum",
    enum: AIOperationType,
  })
  operationType: AIOperationType;

  @Column({ length: 100, nullable: true })
  modelName?: string;

  @Column({ type: "integer", default: 0 })
  inputTokens: number;

  @Column({ type: "integer", default: 0 })
  outputTokens: number;

  @Column({ type: "decimal", precision: 10, scale: 6, default: 0 })
  costUSD: number;

  @Column({ type: "jsonb", nullable: true })
  requestData?: any;

  @Column({ type: "jsonb", nullable: true })
  responseData?: any;

  @Column({ type: "integer" })
  executionTimeMs: number;

  @Column({
    type: "enum",
    enum: AISourceModule,
  })
  sourceModule: AISourceModule;

  @Column("uuid", { nullable: true })
  sourceId?: string;

  @Column({ length: 255, nullable: true })
  userId?: string;

  @Column({ length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: "text", nullable: true })
  userAgent?: string;

  @Column({ type: "boolean", default: true })
  success: boolean;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  // Helper methods
  getTotalTokens(): number {
    return this.inputTokens + this.outputTokens;
  }

  getCostPerToken(): number {
    const totalTokens = this.getTotalTokens();
    return totalTokens > 0 ? this.costUSD / totalTokens : 0;
  }

  getEfficiencyScore(): number {
    // Lower execution time and cost = higher efficiency
    const baseScore = 100;
    const timeScore = Math.max(0, 100 - this.executionTimeMs / 100);
    const costScore = Math.max(0, 100 - this.costUSD * 1000);

    return Math.round((timeScore + costScore) / 2);
  }
}

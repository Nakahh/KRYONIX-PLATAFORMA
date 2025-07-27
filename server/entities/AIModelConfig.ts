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
import { AIServiceType } from "./AIServiceUsage";

export enum AIModelStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DEPRECATED = "DEPRECATED",
}

export interface AIModelLimits {
  maxTokensPerRequest: number;
  maxRequestsPerMinute: number;
  maxRequestsPerDay: number;
  maxCostPerRequest: number;
  allowedOperations: string[];
}

export interface AIModelSettings {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  systemPrompt?: string;
  responseFormat?: string;
  timeout?: number;
  retryAttempts?: number;
}

@Entity("ai_model_configs")
@Index(["tenantId", "serviceType"])
@Index(["tenantId", "isDefault"])
export class AIModelConfig {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column({
    type: "enum",
    enum: AIServiceType,
  })
  serviceType: AIServiceType;

  @Column({ length: 100 })
  modelName: string;

  @Column({ length: 255, nullable: true })
  displayName?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: AIModelStatus,
    default: AIModelStatus.ACTIVE,
  })
  status: AIModelStatus;

  @Column({ type: "jsonb" })
  settings: AIModelSettings;

  @Column({ type: "jsonb" })
  limits: AIModelLimits;

  @Column({ type: "boolean", default: false })
  isDefault: boolean;

  @Column({ type: "decimal", precision: 10, scale: 6 })
  costPerInputToken: number;

  @Column({ type: "decimal", precision: 10, scale: 6 })
  costPerOutputToken: number;

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

  // Helper methods
  isActive(): boolean {
    return this.status === AIModelStatus.ACTIVE;
  }

  calculateCost(inputTokens: number, outputTokens: number): number {
    return (
      inputTokens * this.costPerInputToken +
      outputTokens * this.costPerOutputToken
    );
  }

  canExecute(operation: string): boolean {
    return (
      this.limits.allowedOperations.includes(operation) ||
      this.limits.allowedOperations.includes("*")
    );
  }

  validateRequest(
    tokens: number,
    cost: number,
  ): { valid: boolean; reason?: string } {
    if (tokens > this.limits.maxTokensPerRequest) {
      return { valid: false, reason: "Exceeds max tokens per request" };
    }

    if (cost > this.limits.maxCostPerRequest) {
      return { valid: false, reason: "Exceeds max cost per request" };
    }

    return { valid: true };
  }

  getEffectiveSettings(): AIModelSettings {
    const defaults: AIModelSettings = {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
      timeout: 30000,
      retryAttempts: 3,
    };

    return { ...defaults, ...this.settings };
  }
}

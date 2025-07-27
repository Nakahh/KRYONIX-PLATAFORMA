import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { User } from "./User";
import { WhatsAppInstance } from "./WhatsAppInstance";
import { Subscription } from "./Subscription";

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  CANCELLED = "CANCELLED",
  TRIAL = "TRIAL",
}

export interface TenantSettings {
  allowedDomains?: string[];
  defaultTimezone?: string;
  brandingConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    companyName?: string;
  };
  integrationSettings?: {
    whatsappEnabled?: boolean;
    aiEnabled?: boolean;
    analyticsEnabled?: boolean;
  };
  securitySettings?: {
    require2FA?: boolean;
    sessionTimeout?: number;
    allowedIPs?: string[];
  };
  aiSettings?: {
    enabledServices?: string[];
    defaultModel?: string;
    maxConcurrentRequests?: number;
    enableCaching?: boolean;
    cacheExpiryMinutes?: number;
    enableAuditLog?: boolean;
    enableCostTracking?: boolean;
  };
}

export interface TenantLimits {
  maxUsers: number;
  maxWhatsappInstances: number;
  maxMessagesPerMonth: number;
  maxAutomationRules: number;
  maxChatbotFlows: number;
  maxApiCalls: number;
  maxStorageGB: number;
  maxAICallsPerDay: number;
  maxAITokensPerMonth: number;
  maxAIBudgetUSD: number;
  maxConcurrentAIRequests: number;
}

export interface TenantUsage {
  currentUsers: number;
  currentWhatsappInstances: number;
  messagesThisMonth: number;
  automationRulesActive: number;
  chatbotFlowsActive: number;
  apiCallsThisMonth: number;
  storageUsedGB: number;
  aiCallsToday: number;
  aiTokensThisMonth: number;
  aiCostThisMonthUSD: number;
  currentAIRequests: number;
  lastUpdated: Date;
}

@Entity("tenants")
@Index(["domain"], { unique: true })
@Index(["subdomain"], { unique: true })
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  subdomain: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  domain?: string;

  @Column({
    type: "enum",
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @Column({ type: "jsonb", nullable: true })
  settings?: TenantSettings;

  @Column({ type: "jsonb" })
  limits: TenantLimits;

  @Column({ type: "jsonb" })
  usage: TenantUsage;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ownerEmail?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => WhatsAppInstance, (instance) => instance.tenant)
  whatsappInstances: WhatsAppInstance[];

  @OneToMany(() => Subscription, (subscription) => subscription.tenant)
  subscriptions: Subscription[];

  // Virtual properties and methods
  get isActive(): boolean {
    return (
      this.status === TenantStatus.ACTIVE || this.status === TenantStatus.TRIAL
    );
  }

  get isTrial(): boolean {
    return this.status === TenantStatus.TRIAL;
  }

  updateUsage(updates: Partial<TenantUsage>): void {
    this.usage = {
      ...this.usage,
      ...updates,
      lastUpdated: new Date(),
    };
  }

  checkLimit(resource: keyof TenantLimits): boolean {
    const limit = this.limits[resource];
    const current = this.usage[
      resource.replace("max", "current") as keyof TenantUsage
    ] as number;

    // -1 means unlimited
    if (limit === -1) return true;

    return current < limit;
  }

  getUsagePercentage(resource: keyof TenantLimits): number {
    const limit = this.limits[resource];
    const current = this.usage[
      resource.replace("max", "current") as keyof TenantUsage
    ] as number;

    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // No limit set

    return Math.round((current / limit) * 100);
  }
}

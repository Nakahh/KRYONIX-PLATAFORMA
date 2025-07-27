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
import { MauticLead } from "./MauticLead";
import { MauticCampaign } from "./MauticCampaign";

export enum MauticInstanceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
  SYNCING = "SYNCING",
}

export interface MauticCredentials {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface MauticConfig {
  autoSync: boolean;
  syncInterval: number; // minutes
  webhookEnabled: boolean;
  webhookEvents: string[];
  defaultSegmentId?: number;
  leadScoringEnabled: boolean;
  aiIntegrationEnabled: boolean;
  lgpdComplianceEnabled: boolean;
  customFields: Record<string, any>;
}

export interface MauticSyncSettings {
  lastSyncAt?: Date;
  syncDirection: "BIDIRECTIONAL" | "TO_MAUTIC" | "FROM_MAUTIC";
  fieldMapping: Record<string, string>;
  filters: {
    includeSegments?: number[];
    excludeSegments?: number[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
}

export interface MauticStats {
  totalContacts: number;
  totalLeads: number;
  activeCampaigns: number;
  lastSyncAt: Date;
  syncErrors: number;
  apiCallsToday: number;
  apiCallsThisMonth: number;
}

@Entity("mautic_instances")
@Index(["tenantId", "status"])
export class MauticInstance {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 500 })
  instanceUrl: string;

  @Column({ type: "jsonb" })
  credentials: MauticCredentials;

  @Column({
    type: "enum",
    enum: MauticInstanceStatus,
    default: MauticInstanceStatus.INACTIVE,
  })
  status: MauticInstanceStatus;

  @Column({ type: "jsonb" })
  config: MauticConfig;

  @Column({ length: 255, nullable: true })
  webhookSecret?: string;

  @Column({ type: "jsonb" })
  syncSettings: MauticSyncSettings;

  @Column({ type: "jsonb", default: {} })
  stats: MauticStats;

  @Column({ type: "text", nullable: true })
  lastError?: string;

  @Column({ type: "timestamp", nullable: true })
  lastHealthCheck?: Date;

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

  @OneToMany(() => MauticLead, (lead) => lead.mauticInstance)
  leads: MauticLead[];

  @OneToMany(() => MauticCampaign, (campaign) => campaign.mauticInstance)
  campaigns: MauticCampaign[];

  // Helper methods
  isActive(): boolean {
    return this.status === MauticInstanceStatus.ACTIVE;
  }

  needsTokenRefresh(): boolean {
    if (!this.credentials.expiresAt) return true;
    return (
      new Date() >=
      new Date(this.credentials.expiresAt.getTime() - 5 * 60 * 1000)
    ); // 5 min buffer
  }

  getApiUrl(endpoint: string): string {
    return `${this.instanceUrl}/api${endpoint}`;
  }

  updateStats(updates: Partial<MauticStats>): void {
    this.stats = {
      ...this.stats,
      ...updates,
      lastSyncAt: new Date(),
    };
  }

  incrementApiCall(): void {
    this.stats.apiCallsToday = (this.stats.apiCallsToday || 0) + 1;
    this.stats.apiCallsThisMonth = (this.stats.apiCallsThisMonth || 0) + 1;
  }

  canMakeApiCall(): boolean {
    const dailyLimit = this.config.customFields?.dailyApiLimit || 10000;
    return (this.stats.apiCallsToday || 0) < dailyLimit;
  }

  getSyncStatus(): string {
    if (!this.stats.lastSyncAt) return "Nunca sincronizado";

    const now = new Date();
    const lastSync = new Date(this.stats.lastSyncAt);
    const diffMinutes = Math.floor(
      (now.getTime() - lastSync.getTime()) / (1000 * 60),
    );

    if (diffMinutes < 60) return `Sincronizado há ${diffMinutes} minutos`;
    if (diffMinutes < 1440)
      return `Sincronizado há ${Math.floor(diffMinutes / 60)} horas`;
    return `Sincronizado há ${Math.floor(diffMinutes / 1440)} dias`;
  }

  getHealthStatus(): { status: string; issues: string[] } {
    const issues: string[] = [];

    if (!this.isActive()) {
      issues.push("Instância inativa");
    }

    if (this.needsTokenRefresh()) {
      issues.push("Token de acesso expirado");
    }

    if (!this.canMakeApiCall()) {
      issues.push("Limite de API excedido");
    }

    if (this.stats.syncErrors > 10) {
      issues.push("Muitos erros de sincronização");
    }

    return {
      status: issues.length === 0 ? "Saudável" : "Com problemas",
      issues,
    };
  }

  // LGPD Compliance methods
  getDataRetentionPeriod(): number {
    return this.config.customFields?.dataRetentionDays || 365; // Default 1 year
  }

  isLgpdCompliant(): boolean {
    return (
      this.config.lgpdComplianceEnabled &&
      this.config.customFields?.consentFieldId !== undefined
    );
  }

  // Integration status
  hasAIIntegration(): boolean {
    return this.config.aiIntegrationEnabled;
  }

  hasWhatsAppIntegration(): boolean {
    return this.config.customFields?.whatsappIntegrationEnabled === true;
  }

  hasTypebotIntegration(): boolean {
    return this.config.customFields?.typebotIntegrationEnabled === true;
  }

  // Field mapping helpers
  getMappedField(kryonixField: string): string | undefined {
    return this.syncSettings.fieldMapping[kryonixField];
  }

  getKryonixField(mauticField: string): string | undefined {
    const mapping = this.syncSettings.fieldMapping;
    return Object.keys(mapping).find((key) => mapping[key] === mauticField);
  }

  // Webhook validation
  validateWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false;

    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  // Campaign management
  shouldAutoCreateCampaigns(): boolean {
    return this.config.customFields?.autoCreateCampaigns === true;
  }

  getDefaultCampaignSettings(): any {
    return {
      language: "pt_BR",
      timezone: "America/Sao_Paulo",
      allowRestart: true,
      isPublished: true,
    };
  }
}

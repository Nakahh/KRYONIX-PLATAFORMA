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

export enum LeadSource {
  WHATSAPP = "WHATSAPP",
  TYPEBOT = "TYPEBOT",
  WEBSITE = "WEBSITE",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  EMAIL = "EMAIL",
  API = "API",
  MANUAL = "MANUAL",
  IMPORTED = "IMPORTED",
}

export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUALIFIED = "QUALIFIED",
  UNQUALIFIED = "UNQUALIFIED",
  CONVERTED = "CONVERTED",
  LOST = "LOST",
}

export enum SyncStatus {
  PENDING = "PENDING",
  SYNCED = "SYNCED",
  ERROR = "ERROR",
  CONFLICT = "CONFLICT",
}

export interface LeadData {
  // Dados básicos
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;

  // Dados brasileiros específicos
  cpf?: string;
  cnpj?: string;
  cep?: string;
  city?: string;
  state?: string;
  region?: string; // Norte, Nordeste, Centro-Oeste, Sudeste, Sul

  // Dados de engajamento
  source: LeadSource;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Dados comportamentais
  lastActivity?: Date;
  interactions?: number;
  whatsappEngagement?: number;
  emailEngagement?: number;

  // Dados comerciais
  budget?: number;
  timeline?: string;
  industry?: string;
  companySize?: string;

  // Dados de IA
  aiScore?: number;
  aiScoreReason?: string;
  sentiment?: string;
  intent?: string;

  // LGPD
  consentMarketing?: boolean;
  consentDataProcessing?: boolean;
  consentTimestamp?: Date;

  // Campos customizados
  customFields?: Record<string, any>;
}

export interface SyncMetadata {
  lastSyncAt: Date;
  syncDirection: "TO_MAUTIC" | "FROM_MAUTIC" | "BIDIRECTIONAL";
  conflicts?: string[];
  errorMessage?: string;
  retryCount: number;
  nextRetryAt?: Date;
}

@Entity("mautic_leads")
@Index(["tenantId", "syncStatus"])
@Index(["mauticInstanceId", "mauticLeadId"])
@Index(["phone"], { unique: false }) // Para busca rápida por telefone
@Index(["email"], { unique: false }) // Para busca rápida por email
export class MauticLead {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column("uuid")
  mauticInstanceId: string;

  @Column({ type: "integer", nullable: true })
  mauticLeadId?: number;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ type: "jsonb" })
  leadData: LeadData;

  @Column({
    type: "enum",
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({
    type: "enum",
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  syncStatus: SyncStatus;

  @Column({ type: "jsonb" })
  syncMetadata: SyncMetadata;

  @Column({ type: "float", default: 0 })
  aiScore: number;

  @Column({ type: "text", nullable: true })
  aiScoreReason?: string;

  @Column({ type: "integer", default: 0 })
  engagementScore: number;

  @Column({ type: "timestamp", nullable: true })
  lastContactedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  lastActivityAt?: Date;

  @Column({ type: "jsonb", nullable: true })
  tags?: string[];

  @Column({ type: "jsonb", nullable: true })
  segments?: number[];

  @Column({ type: "jsonb", nullable: true })
  campaigns?: number[];

  @Column({ type: "boolean", default: true })
  marketingEnabled: boolean;

  @Column({ type: "text", nullable: true })
  notes?: string;

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

  @ManyToOne(() => MauticInstance, (instance) => instance.leads)
  @JoinColumn({ name: "mauticInstanceId" })
  mauticInstance: MauticInstance;

  // Helper methods
  getFullName(): string {
    const { firstName, lastName } = this.leadData;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return this.email || this.phone || "Lead sem nome";
  }

  isQualified(): boolean {
    return this.status === LeadStatus.QUALIFIED || this.aiScore >= 7;
  }

  needsSync(): boolean {
    return (
      this.syncStatus === SyncStatus.PENDING ||
      this.syncStatus === SyncStatus.ERROR
    );
  }

  canRetrySync(): boolean {
    if (this.syncStatus !== SyncStatus.ERROR) return false;

    const maxRetries = 5;
    if (this.syncMetadata.retryCount >= maxRetries) return false;

    if (this.syncMetadata.nextRetryAt) {
      return new Date() >= this.syncMetadata.nextRetryAt;
    }

    return true;
  }

  updateEngagementScore(activity: string, value: number = 1): void {
    this.engagementScore += value;
    this.lastActivityAt = new Date();

    // Update activity in leadData
    if (!this.leadData.interactions) this.leadData.interactions = 0;
    this.leadData.interactions += 1;

    // Update specific engagement metrics
    if (activity.includes("whatsapp")) {
      this.leadData.whatsappEngagement =
        (this.leadData.whatsappEngagement || 0) + value;
    } else if (activity.includes("email")) {
      this.leadData.emailEngagement =
        (this.leadData.emailEngagement || 0) + value;
    }
  }

  updateAIScore(score: number, reason: string): void {
    this.aiScore = score;
    this.aiScoreReason = reason;
    this.leadData.aiScore = score;
    this.leadData.aiScoreReason = reason;

    // Auto-qualify based on AI score
    if (score >= 8 && this.status === LeadStatus.NEW) {
      this.status = LeadStatus.QUALIFIED;
    } else if (score < 3 && this.status === LeadStatus.NEW) {
      this.status = LeadStatus.UNQUALIFIED;
    }
  }

  setSyncError(error: string): void {
    this.syncStatus = SyncStatus.ERROR;
    this.syncMetadata.errorMessage = error;
    this.syncMetadata.retryCount = (this.syncMetadata.retryCount || 0) + 1;

    // Calculate next retry time with exponential backoff
    const baseDelay = 5 * 60 * 1000; // 5 minutes
    const delay = baseDelay * Math.pow(2, this.syncMetadata.retryCount - 1);
    this.syncMetadata.nextRetryAt = new Date(Date.now() + delay);
  }

  markSynced(mauticLeadId?: number): void {
    this.syncStatus = SyncStatus.SYNCED;
    this.syncMetadata.lastSyncAt = new Date();
    this.syncMetadata.errorMessage = undefined;
    this.syncMetadata.retryCount = 0;
    this.syncMetadata.nextRetryAt = undefined;

    if (mauticLeadId) {
      this.mauticLeadId = mauticLeadId;
    }
  }

  // LGPD compliance methods
  hasMarketingConsent(): boolean {
    return this.leadData.consentMarketing === true && this.marketingEnabled;
  }

  hasDataProcessingConsent(): boolean {
    return this.leadData.consentDataProcessing === true;
  }

  revokeConsent(type: "marketing" | "data_processing"): void {
    if (type === "marketing") {
      this.leadData.consentMarketing = false;
      this.marketingEnabled = false;
    } else if (type === "data_processing") {
      this.leadData.consentDataProcessing = false;
    }

    this.leadData.consentTimestamp = new Date();
    this.syncStatus = SyncStatus.PENDING; // Needs sync to update Mautic
  }

  // Regional/Brazilian specific methods
  getRegion(): string | undefined {
    return this.leadData.region;
  }

  isBusiness(): boolean {
    return !!(this.leadData.cnpj || this.leadData.company);
  }

  getDocumentNumber(): string | undefined {
    return this.leadData.cnpj || this.leadData.cpf;
  }

  // Segmentation helpers
  getSegmentationData(): Record<string, any> {
    return {
      source: this.leadData.source,
      aiScore: this.aiScore,
      engagementScore: this.engagementScore,
      region: this.leadData.region,
      city: this.leadData.city,
      state: this.leadData.state,
      industry: this.leadData.industry,
      companySize: this.leadData.companySize,
      isBusiness: this.isBusiness(),
      isQualified: this.isQualified(),
      hasMarketingConsent: this.hasMarketingConsent(),
      lastActivity: this.lastActivityAt,
      daysActive: this.getDaysActive(),
    };
  }

  private getDaysActive(): number {
    if (!this.lastActivityAt) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.lastActivityAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Campaign assignment
  addToCampaign(campaignId: number): void {
    if (!this.campaigns) this.campaigns = [];
    if (!this.campaigns.includes(campaignId)) {
      this.campaigns.push(campaignId);
      this.syncStatus = SyncStatus.PENDING;
    }
  }

  removeFromCampaign(campaignId: number): void {
    if (this.campaigns) {
      this.campaigns = this.campaigns.filter((id) => id !== campaignId);
      this.syncStatus = SyncStatus.PENDING;
    }
  }

  // Tag management
  addTag(tag: string): void {
    if (!this.tags) this.tags = [];
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.syncStatus = SyncStatus.PENDING;
    }
  }

  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter((t) => t !== tag);
      this.syncStatus = SyncStatus.PENDING;
    }
  }

  // Data export for LGPD compliance
  exportData(): Record<string, any> {
    return {
      id: this.id,
      mauticLeadId: this.mauticLeadId,
      personalData: {
        name: this.getFullName(),
        email: this.email,
        phone: this.phone,
        ...this.leadData,
      },
      activityData: {
        status: this.status,
        aiScore: this.aiScore,
        engagementScore: this.engagementScore,
        lastContactedAt: this.lastContactedAt,
        lastActivityAt: this.lastActivityAt,
        tags: this.tags,
        campaigns: this.campaigns,
      },
      consentData: {
        marketingConsent: this.leadData.consentMarketing,
        dataProcessingConsent: this.leadData.consentDataProcessing,
        consentTimestamp: this.leadData.consentTimestamp,
        marketingEnabled: this.marketingEnabled,
      },
      metadata: {
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        syncStatus: this.syncStatus,
        syncMetadata: this.syncMetadata,
      },
    };
  }

  // Validation methods
  isValid(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.email && !this.phone) {
      errors.push("Lead deve ter email ou telefone");
    }

    if (this.email && !this.isValidEmail(this.email)) {
      errors.push("Email inválido");
    }

    if (this.phone && !this.isValidPhone(this.phone)) {
      errors.push("Telefone inválido");
    }

    if (this.leadData.cpf && !this.isValidCPF(this.leadData.cpf)) {
      errors.push("CPF inválido");
    }

    if (this.leadData.cnpj && !this.isValidCNPJ(this.leadData.cnpj)) {
      errors.push("CNPJ inválido");
    }

    return { valid: errors.length === 0, errors };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Brazilian phone validation
    const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}$/;
    return phoneRegex.test(phone);
  }

  private isValidCPF(cpf: string): boolean {
    // Basic CPF validation (simplified)
    const cleanCPF = cpf.replace(/\D/g, "");
    return cleanCPF.length === 11 && cleanCPF !== "00000000000";
  }

  private isValidCNPJ(cnpj: string): boolean {
    // Basic CNPJ validation (simplified)
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    return cleanCNPJ.length === 14 && cleanCNPJ !== "00000000000000";
  }
}

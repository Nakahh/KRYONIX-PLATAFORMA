import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { Tenant } from "./Tenant";
import { User } from "./User";

export enum PreferenceType {
  GLOBAL = "GLOBAL",
  CATEGORY = "CATEGORY",
  CHANNEL = "CHANNEL",
  TEMPLATE = "TEMPLATE",
  CAMPAIGN = "CAMPAIGN",
}

export enum ConsentType {
  MARKETING = "MARKETING",
  TRANSACTIONAL = "TRANSACTIONAL",
  OPERATIONAL = "OPERATIONAL",
  PROMOTIONAL = "PROMOTIONAL",
  NEWSLETTER = "NEWSLETTER",
  PRODUCT_UPDATES = "PRODUCT_UPDATES",
  SECURITY_ALERTS = "SECURITY_ALERTS",
  BILLING = "BILLING",
  SUPPORT = "SUPPORT",
}

export enum ConsentStatus {
  GRANTED = "GRANTED",
  DENIED = "DENIED",
  WITHDRAWN = "WITHDRAWN",
  PENDING = "PENDING",
  EXPIRED = "EXPIRED",
}

export enum ChannelType {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
  PUSH = "PUSH",
  SMS = "SMS",
  WEBHOOK = "WEBHOOK",
}

export interface ChannelPreferences {
  enabled: boolean;
  schedule?: {
    allowedDays: string[]; // ['monday', 'tuesday', ...]
    allowedHours: {
      start: string; // "09:00"
      end: string; // "18:00"
    };
    timezone: string;
    respectQuietHours: boolean;
    quietHours?: {
      start: string;
      end: string;
    };
  };
  frequency?: {
    maxPerHour: number;
    maxPerDay: number;
    maxPerWeek: number;
    maxPerMonth: number;
  };
  deliverySettings?: {
    priority: "HIGH" | "NORMAL" | "LOW";
    groupSimilar: boolean;
    batchDelivery: boolean;
    batchIntervalMinutes: number;
  };
}

export interface ConsentDetails {
  status: ConsentStatus;
  grantedAt?: Date;
  withdrawnAt?: Date;
  expiresAt?: Date;
  source: string; // 'registration', 'settings', 'api', 'webhook'
  ipAddress?: string;
  userAgent?: string;
  legalBasis: string; // 'consent', 'legitimate_interest', 'contract', 'vital_interests', 'public_task', 'legal_obligation'
  purpose: string;
  dataProcessed: string[]; // ['email', 'phone', 'location', etc.]
  processingDuration: string; // 'indefinite', '1_year', '2_years', etc.
  consentEvidence?: {
    checkboxText?: string;
    formUrl?: string;
    timestamp: Date;
    method: "checkbox" | "opt_in" | "double_opt_in" | "api" | "manual";
  };
}

export interface PreferenceSettings {
  // Configurações gerais
  globallyEnabled: boolean;

  // Por canal
  channels: Record<ChannelType, ChannelPreferences>;

  // Por categoria de notificação
  categories: Record<
    string,
    {
      enabled: boolean;
      channels: ChannelType[];
      priority: "HIGH" | "NORMAL" | "LOW";
    }
  >;

  // Templates específicos
  templates: Record<
    string,
    {
      enabled: boolean;
      overrideChannels?: ChannelType[];
      customSchedule?: {
        allowedDays: string[];
        allowedHours: { start: string; end: string };
      };
    }
  >;

  // Configurações de agrupamento
  grouping: {
    enabled: boolean;
    groupByCategory: boolean;
    groupByChannel: boolean;
    maxGroupSize: number;
    groupIntervalMinutes: number;
  };

  // Configurações de digest
  digest: {
    enabled: boolean;
    frequency: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
    preferredTime: string; // "09:00"
    preferredDay?: string; // "monday" para weekly
    includeCategories: string[];
    maxItemsPerDigest: number;
  };

  // Configurações LGPD
  lgpd: {
    dataRetentionDays: number;
    allowMarketing: boolean;
    allowProfiling: boolean;
    allowDataSharing: boolean;
    allowInternationalTransfer: boolean;
  };
}

@Entity("notification_preferences")
@Index(["tenantId", "userId"])
@Index(["userId", "preferenceType"])
@Index(["tenantId", "consentType", "consentStatus"])
@Unique(["tenantId", "userId", "preferenceType", "referenceId"])
export class NotificationPreference {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("uuid")
  tenantId: string;

  @Column("uuid")
  userId: string;

  @Column({
    type: "enum",
    enum: PreferenceType,
  })
  preferenceType: PreferenceType; // GLOBAL, CATEGORY, CHANNEL, TEMPLATE, CAMPAIGN

  @Column({ type: "varchar", length: 255, nullable: true })
  referenceId?: string; // ID da categoria, template, campaign, etc.

  @Column({
    type: "enum",
    enum: ConsentType,
  })
  consentType: ConsentType;

  @Column({
    type: "enum",
    enum: ConsentStatus,
  })
  consentStatus: ConsentStatus;

  @Column("jsonb")
  consentDetails: ConsentDetails;

  @Column("jsonb")
  preferences: PreferenceSettings;

  @Column("text", { nullable: true })
  language?: string; // ISO 639-1 code (pt, en, es)

  @Column("text", { nullable: true })
  timezone?: string; // America/Sao_Paulo

  @Column("text", { nullable: true })
  contactEmail?: string; // Pode ser diferente do email principal

  @Column("text", { nullable: true })
  contactPhone?: string;

  @Column("text", { nullable: true })
  contactWhatsApp?: string;

  @Column("boolean", { default: true })
  isActive: boolean;

  @Column("timestamp", { nullable: true })
  lastUpdatedBy?: string;

  @Column("jsonb", { nullable: true })
  auditLog?: Array<{
    timestamp: Date;
    action: string;
    oldValues?: any;
    newValues?: any;
    userId?: string;
    ipAddress?: string;
    source: string;
  }>;

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Tenant)
  @JoinColumn({ name: "tenantId" })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  // Computed properties
  get hasValidConsent(): boolean {
    return (
      this.consentStatus === ConsentStatus.GRANTED &&
      (!this.consentDetails.expiresAt ||
        this.consentDetails.expiresAt > new Date())
    );
  }

  get isConsentExpired(): boolean {
    return (
      this.consentDetails.expiresAt !== undefined &&
      this.consentDetails.expiresAt < new Date()
    );
  }

  get canReceiveMarketing(): boolean {
    return (
      this.hasValidConsent &&
      this.consentType === ConsentType.MARKETING &&
      this.preferences.lgpd.allowMarketing
    );
  }

  get canReceiveTransactional(): boolean {
    return (
      this.consentType === ConsentType.TRANSACTIONAL ||
      this.consentType === ConsentType.OPERATIONAL
    );
  }

  // Static factory methods
  static createGlobalPreference(
    tenantId: string,
    userId: string,
    consentType: ConsentType = ConsentType.OPERATIONAL,
  ): NotificationPreference {
    const preference = new NotificationPreference();
    preference.tenantId = tenantId;
    preference.userId = userId;
    preference.preferenceType = PreferenceType.GLOBAL;
    preference.consentType = consentType;
    preference.consentStatus = ConsentStatus.GRANTED;

    preference.consentDetails = {
      status: ConsentStatus.GRANTED,
      grantedAt: new Date(),
      source: "registration",
      legalBasis: "consent",
      purpose: "Receber notificações operacionais e transacionais",
      dataProcessed: ["email"],
      processingDuration: "indefinite",
    };

    preference.preferences = NotificationPreference.getDefaultPreferences();

    return preference;
  }

  static getDefaultPreferences(): PreferenceSettings {
    return {
      globallyEnabled: true,
      channels: {
        [ChannelType.IN_APP]: {
          enabled: true,
          schedule: {
            allowedDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ],
            allowedHours: { start: "09:00", end: "18:00" },
            timezone: "America/Sao_Paulo",
            respectQuietHours: true,
            quietHours: { start: "22:00", end: "08:00" },
          },
          frequency: {
            maxPerHour: 10,
            maxPerDay: 50,
            maxPerWeek: 200,
            maxPerMonth: 500,
          },
          deliverySettings: {
            priority: "NORMAL",
            groupSimilar: true,
            batchDelivery: false,
            batchIntervalMinutes: 15,
          },
        },
        [ChannelType.EMAIL]: {
          enabled: true,
          schedule: {
            allowedDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
            allowedHours: { start: "08:00", end: "20:00" },
            timezone: "America/Sao_Paulo",
            respectQuietHours: true,
            quietHours: { start: "22:00", end: "08:00" },
          },
          frequency: {
            maxPerHour: 2,
            maxPerDay: 10,
            maxPerWeek: 30,
            maxPerMonth: 100,
          },
          deliverySettings: {
            priority: "NORMAL",
            groupSimilar: true,
            batchDelivery: true,
            batchIntervalMinutes: 60,
          },
        },
        [ChannelType.WHATSAPP]: {
          enabled: false, // Opt-in por padrão
          schedule: {
            allowedDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ],
            allowedHours: { start: "09:00", end: "17:00" },
            timezone: "America/Sao_Paulo",
            respectQuietHours: true,
            quietHours: { start: "20:00", end: "09:00" },
          },
          frequency: {
            maxPerHour: 1,
            maxPerDay: 3,
            maxPerWeek: 10,
            maxPerMonth: 20,
          },
          deliverySettings: {
            priority: "HIGH",
            groupSimilar: false,
            batchDelivery: false,
            batchIntervalMinutes: 0,
          },
        },
        [ChannelType.PUSH]: {
          enabled: false, // Opt-in por padrão
          schedule: {
            allowedDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
            allowedHours: { start: "08:00", end: "22:00" },
            timezone: "America/Sao_Paulo",
            respectQuietHours: true,
            quietHours: { start: "22:00", end: "08:00" },
          },
          frequency: {
            maxPerHour: 5,
            maxPerDay: 15,
            maxPerWeek: 50,
            maxPerMonth: 150,
          },
          deliverySettings: {
            priority: "HIGH",
            groupSimilar: true,
            batchDelivery: false,
            batchIntervalMinutes: 0,
          },
        },
        [ChannelType.SMS]: {
          enabled: false, // Opt-in por padrão
          schedule: {
            allowedDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ],
            allowedHours: { start: "09:00", end: "17:00" },
            timezone: "America/Sao_Paulo",
            respectQuietHours: true,
            quietHours: { start: "20:00", end: "09:00" },
          },
          frequency: {
            maxPerHour: 1,
            maxPerDay: 2,
            maxPerWeek: 5,
            maxPerMonth: 10,
          },
          deliverySettings: {
            priority: "CRITICAL",
            groupSimilar: false,
            batchDelivery: false,
            batchIntervalMinutes: 0,
          },
        },
        [ChannelType.WEBHOOK]: {
          enabled: false,
          schedule: {
            allowedDays: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
            allowedHours: { start: "00:00", end: "23:59" },
            timezone: "America/Sao_Paulo",
            respectQuietHours: false,
          },
          frequency: {
            maxPerHour: 100,
            maxPerDay: 1000,
            maxPerWeek: 5000,
            maxPerMonth: 20000,
          },
          deliverySettings: {
            priority: "NORMAL",
            groupSimilar: false,
            batchDelivery: false,
            batchIntervalMinutes: 0,
          },
        },
      },
      categories: {
        SYSTEM: {
          enabled: true,
          channels: [ChannelType.IN_APP, ChannelType.EMAIL],
          priority: "HIGH",
        },
        BILLING: {
          enabled: true,
          channels: [ChannelType.IN_APP, ChannelType.EMAIL],
          priority: "HIGH",
        },
        SECURITY: {
          enabled: true,
          channels: [ChannelType.IN_APP, ChannelType.EMAIL],
          priority: "CRITICAL",
        },
        MARKETING: {
          enabled: false,
          channels: [ChannelType.EMAIL],
          priority: "LOW",
        },
        OPERATIONAL: {
          enabled: true,
          channels: [ChannelType.IN_APP],
          priority: "NORMAL",
        },
      },
      templates: {},
      grouping: {
        enabled: true,
        groupByCategory: true,
        groupByChannel: false,
        maxGroupSize: 5,
        groupIntervalMinutes: 30,
      },
      digest: {
        enabled: false,
        frequency: "DAILY",
        preferredTime: "09:00",
        includeCategories: ["SYSTEM", "BILLING"],
        maxItemsPerDigest: 20,
      },
      lgpd: {
        dataRetentionDays: 730, // 2 anos
        allowMarketing: false,
        allowProfiling: false,
        allowDataSharing: false,
        allowInternationalTransfer: false,
      },
    };
  }

  // Instance methods
  grantConsent(
    source: string = "manual",
    legalBasis: string = "consent",
    ipAddress?: string,
    userAgent?: string,
    expiresInDays?: number,
  ): void {
    const now = new Date();

    this.consentStatus = ConsentStatus.GRANTED;
    this.consentDetails.status = ConsentStatus.GRANTED;
    this.consentDetails.grantedAt = now;
    this.consentDetails.source = source;
    this.consentDetails.legalBasis = legalBasis;
    this.consentDetails.ipAddress = ipAddress;
    this.consentDetails.userAgent = userAgent;

    if (expiresInDays) {
      this.consentDetails.expiresAt = new Date(
        now.getTime() + expiresInDays * 24 * 60 * 60 * 1000,
      );
    }

    this.addAuditLog("consent_granted", null, {
      source,
      legalBasis,
      ipAddress,
      expiresInDays,
    });
  }

  withdrawConsent(reason?: string, userId?: string): void {
    const now = new Date();

    this.consentStatus = ConsentStatus.WITHDRAWN;
    this.consentDetails.status = ConsentStatus.WITHDRAWN;
    this.consentDetails.withdrawnAt = now;

    // Desabilitar todas as notificações
    this.preferences.globallyEnabled = false;
    Object.keys(this.preferences.channels).forEach((channel) => {
      this.preferences.channels[channel as ChannelType].enabled = false;
    });

    this.addAuditLog("consent_withdrawn", null, { reason }, userId);
  }

  updateChannelPreference(
    channel: ChannelType,
    enabled: boolean,
    settings?: Partial<ChannelPreferences>,
    userId?: string,
  ): void {
    const oldValue = { ...this.preferences.channels[channel] };

    this.preferences.channels[channel].enabled = enabled;

    if (settings) {
      this.preferences.channels[channel] = {
        ...this.preferences.channels[channel],
        ...settings,
      };
    }

    this.addAuditLog(
      "channel_preference_updated",
      oldValue,
      {
        channel,
        enabled,
        settings,
      },
      userId,
    );
  }

  updateCategoryPreference(
    category: string,
    enabled: boolean,
    channels?: ChannelType[],
    priority?: "HIGH" | "NORMAL" | "LOW",
    userId?: string,
  ): void {
    const oldValue = this.preferences.categories[category];

    this.preferences.categories[category] = {
      enabled,
      channels: channels ||
        this.preferences.categories[category]?.channels || [ChannelType.IN_APP],
      priority:
        priority || this.preferences.categories[category]?.priority || "NORMAL",
    };

    this.addAuditLog(
      "category_preference_updated",
      oldValue,
      {
        category,
        enabled,
        channels,
        priority,
      },
      userId,
    );
  }

  updateTemplatePreference(
    templateId: string,
    enabled: boolean,
    overrideChannels?: ChannelType[],
    customSchedule?: any,
    userId?: string,
  ): void {
    const oldValue = this.preferences.templates[templateId];

    this.preferences.templates[templateId] = {
      enabled,
      overrideChannels,
      customSchedule,
    };

    this.addAuditLog(
      "template_preference_updated",
      oldValue,
      {
        templateId,
        enabled,
        overrideChannels,
        customSchedule,
      },
      userId,
    );
  }

  canReceiveOnChannel(channel: ChannelType): boolean {
    if (
      !this.hasValidConsent ||
      !this.isActive ||
      !this.preferences.globallyEnabled
    ) {
      return false;
    }

    return this.preferences.channels[channel]?.enabled === true;
  }

  canReceiveCategory(category: string): boolean {
    if (
      !this.hasValidConsent ||
      !this.isActive ||
      !this.preferences.globallyEnabled
    ) {
      return false;
    }

    return this.preferences.categories[category]?.enabled !== false;
  }

  canReceiveTemplate(templateId: string): boolean {
    if (
      !this.hasValidConsent ||
      !this.isActive ||
      !this.preferences.globallyEnabled
    ) {
      return false;
    }

    const templatePref = this.preferences.templates[templateId];
    return templatePref?.enabled !== false;
  }

  isWithinSchedule(channel: ChannelType): boolean {
    const channelPref = this.preferences.channels[channel];
    if (!channelPref?.schedule) return true;

    const now = new Date();
    const currentDay = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ][now.getDay()];
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM

    // Verificar dia da semana
    if (!channelPref.schedule.allowedDays.includes(currentDay)) {
      return false;
    }

    // Verificar horário permitido
    if (channelPref.schedule.allowedHours) {
      const { start, end } = channelPref.schedule.allowedHours;
      if (currentTime < start || currentTime > end) {
        return false;
      }
    }

    // Verificar quiet hours
    if (
      channelPref.schedule.respectQuietHours &&
      channelPref.schedule.quietHours
    ) {
      const { start, end } = channelPref.schedule.quietHours;
      if (start > end) {
        // Quiet hours cross midnight
        if (currentTime >= start || currentTime <= end) {
          return false;
        }
      } else {
        if (currentTime >= start && currentTime <= end) {
          return false;
        }
      }
    }

    return true;
  }

  addAuditLog(
    action: string,
    oldValues?: any,
    newValues?: any,
    userId?: string,
    ipAddress?: string,
    source: string = "api",
  ): void {
    if (!this.auditLog) {
      this.auditLog = [];
    }

    this.auditLog.push({
      timestamp: new Date(),
      action,
      oldValues,
      newValues,
      userId,
      ipAddress,
      source,
    });
  }

  getPreferenceSummary(): any {
    return {
      id: this.id,
      userId: this.userId,
      consentType: this.consentType,
      consentStatus: this.consentStatus,
      hasValidConsent: this.hasValidConsent,
      globallyEnabled: this.preferences.globallyEnabled,
      enabledChannels: Object.entries(this.preferences.channels)
        .filter(([_, pref]) => pref.enabled)
        .map(([channel, _]) => channel),
      enabledCategories: Object.entries(this.preferences.categories)
        .filter(([_, pref]) => pref.enabled)
        .map(([category, _]) => category),
      language: this.language,
      timezone: this.timezone,
      lastUpdated: this.updatedAt,
    };
  }

  // LGPD methods
  exportData(): any {
    return {
      preferenceId: this.id,
      userId: this.userId,
      tenantId: this.tenantId,
      preferences: this.preferences,
      consentDetails: this.consentDetails,
      contactInfo: {
        email: this.contactEmail,
        phone: this.contactPhone,
        whatsapp: this.contactWhatsApp,
      },
      metadata: this.metadata,
      auditLog: this.auditLog,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  anonymizeData(): void {
    this.contactEmail = null;
    this.contactPhone = null;
    this.contactWhatsApp = null;
    this.metadata = null;

    // Limpar dados pessoais do audit log
    if (this.auditLog) {
      this.auditLog.forEach((entry) => {
        delete entry.ipAddress;
        delete entry.userId;
      });
    }

    this.addAuditLog("data_anonymized", null, { reason: "LGPD_compliance" });
  }
}

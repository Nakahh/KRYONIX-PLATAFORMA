import axios, { AxiosInstance } from "axios";
import { createHash, createHmac } from "crypto";
import { DatabaseConnection } from "../db/connection";
import { Repository } from "typeorm";
import {
  MauticInstance,
  MauticInstanceStatus,
  MauticCredentials,
} from "../entities/MauticInstance";
import {
  MauticLead,
  LeadSource,
  LeadStatus,
  SyncStatus,
} from "../entities/MauticLead";
import {
  MauticCampaign,
  CampaignStatus,
  CampaignType,
} from "../entities/MauticCampaign";
import { Tenant } from "../entities/Tenant";
import { WhatsAppService } from "./whatsapp";
import { AIService } from "./ai";
import { N8NService } from "./n8n";
import { Message } from "../entities/Message";

export interface MauticContact {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  tags?: string[];
  segments?: number[];
  customFields?: Record<string, any>;
}

export interface MauticSegment {
  id?: number;
  name: string;
  description?: string;
  filters: SegmentFilter[];
  isGlobal: boolean;
  isPublished: boolean;
}

export interface SegmentFilter {
  field: string;
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "notLike"
    | "in"
    | "notIn";
  value: any;
  glue?: "and" | "or";
}

export interface CampaignExecutionResult {
  success: boolean;
  contactsProcessed: number;
  actionsExecuted: number;
  errors: string[];
  executionTime: number;
}

class MauticAPIClient {
  private client: AxiosInstance;
  private credentials: MauticCredentials;
  private instanceUrl: string;

  constructor(instanceUrl: string, credentials: MauticCredentials) {
    this.instanceUrl = instanceUrl;
    this.credentials = credentials;

    this.client = axios.create({
      baseURL: `${instanceUrl}/api`,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(async (config) => {
      if (this.needsTokenRefresh()) {
        await this.refreshToken();
      }

      config.headers["Authorization"] =
        `Bearer ${this.credentials.accessToken}`;
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshToken();
          return this.client.request(error.config);
        }
        throw error;
      },
    );
  }

  private needsTokenRefresh(): boolean {
    if (!this.credentials.expiresAt) return true;
    return (
      new Date() >=
      new Date(this.credentials.expiresAt.getTime() - 5 * 60 * 1000)
    );
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await axios.post(`${this.instanceUrl}/oauth/v2/token`, {
        grant_type: "refresh_token",
        refresh_token: this.credentials.refreshToken,
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
      });

      this.credentials.accessToken = response.data.access_token;
      this.credentials.refreshToken = response.data.refresh_token;
      this.credentials.expiresAt = new Date(
        Date.now() + response.data.expires_in * 1000,
      );
    } catch (error) {
      console.error("Failed to refresh Mautic token:", error);
      throw new Error("Falha na autenticação com Mautic");
    }
  }

  // Contacts API
  async createContact(contactData: MauticContact): Promise<any> {
    const response = await this.client.post("/contacts/new", contactData);
    return response.data.contact;
  }

  async updateContact(
    id: number,
    contactData: Partial<MauticContact>,
  ): Promise<any> {
    const response = await this.client.patch(
      `/contacts/${id}/edit`,
      contactData,
    );
    return response.data.contact;
  }

  async getContact(id: number): Promise<any> {
    const response = await this.client.get(`/contacts/${id}`);
    return response.data.contact;
  }

  async getContacts(filters?: Record<string, any>): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, String(value));
      });
    }

    const response = await this.client.get(`/contacts?${params.toString()}`);
    return Object.values(response.data.contacts || {});
  }

  async deleteContact(id: number): Promise<void> {
    await this.client.delete(`/contacts/${id}/delete`);
  }

  // Segments API
  async createSegment(segmentData: MauticSegment): Promise<any> {
    const response = await this.client.post("/segments/new", segmentData);
    return response.data.list;
  }

  async getSegments(): Promise<any[]> {
    const response = await this.client.get("/segments");
    return Object.values(response.data.lists || {});
  }

  async addContactToSegment(
    segmentId: number,
    contactId: number,
  ): Promise<void> {
    await this.client.post(`/segments/${segmentId}/contact/${contactId}/add`);
  }

  async removeContactFromSegment(
    segmentId: number,
    contactId: number,
  ): Promise<void> {
    await this.client.post(
      `/segments/${segmentId}/contact/${contactId}/remove`,
    );
  }

  // Campaigns API
  async createCampaign(campaignData: any): Promise<any> {
    const response = await this.client.post("/campaigns/new", campaignData);
    return response.data.campaign;
  }

  async getCampaigns(): Promise<any[]> {
    const response = await this.client.get("/campaigns");
    return Object.values(response.data.campaigns || {});
  }

  async addContactToCampaign(
    campaignId: number,
    contactId: number,
  ): Promise<void> {
    await this.client.post(`/campaigns/${campaignId}/contact/${contactId}/add`);
  }

  async triggerCampaignForContact(
    campaignId: number,
    contactId: number,
  ): Promise<void> {
    await this.client.post(
      `/campaigns/${campaignId}/contact/${contactId}/trigger`,
    );
  }

  // Tags API
  async addTagToContact(contactId: number, tag: string): Promise<void> {
    await this.client.post(`/contacts/${contactId}/tags/add`, { tags: [tag] });
  }

  async removeTagFromContact(contactId: number, tag: string): Promise<void> {
    await this.client.post(`/contacts/${contactId}/tags/remove`, {
      tags: [tag],
    });
  }

  // Stats API
  async getContactStats(contactId: number): Promise<any> {
    const response = await this.client.get(`/contacts/${contactId}/activity`);
    return response.data;
  }

  async getCampaignStats(campaignId: number): Promise<any> {
    const response = await this.client.get(`/campaigns/${campaignId}/events`);
    return response.data;
  }
}

export class MauticService {
  private static instanceRepo: Repository<MauticInstance>;
  private static leadRepo: Repository<MauticLead>;
  private static campaignRepo: Repository<MauticCampaign>;
  private static tenantRepo: Repository<Tenant>;
  private static clients = new Map<string, MauticAPIClient>();

  static async initialize(): Promise<void> {
    const dataSource = await DatabaseConnection.getInstance();
    this.instanceRepo = dataSource.getRepository(MauticInstance);
    this.leadRepo = dataSource.getRepository(MauticLead);
    this.campaignRepo = dataSource.getRepository(MauticCampaign);
    this.tenantRepo = dataSource.getRepository(Tenant);

    console.log("🎯 Mautic Service initialized");
  }

  // Instance Management
  static async createInstance(
    tenantId: string,
    config: {
      name: string;
      instanceUrl: string;
      credentials: MauticCredentials;
      config?: any;
    },
  ): Promise<MauticInstance> {
    const instance = this.instanceRepo.create({
      tenantId,
      name: config.name,
      instanceUrl: config.instanceUrl,
      credentials: config.credentials,
      config: {
        autoSync: true,
        syncInterval: 30,
        webhookEnabled: true,
        webhookEvents: [
          "contact_created",
          "contact_updated",
          "email_sent",
          "email_opened",
        ],
        leadScoringEnabled: true,
        aiIntegrationEnabled: true,
        lgpdComplianceEnabled: true,
        customFields: {},
        ...config.config,
      },
      syncSettings: {
        syncDirection: "BIDIRECTIONAL",
        fieldMapping: {
          firstName: "firstname",
          lastName: "lastname",
          email: "email",
          phone: "mobile",
          company: "company",
          position: "position",
        },
        filters: {},
      },
      stats: {
        totalContacts: 0,
        totalLeads: 0,
        activeCampaigns: 0,
        lastSyncAt: new Date(),
        syncErrors: 0,
        apiCallsToday: 0,
        apiCallsThisMonth: 0,
      },
    });

    const savedInstance = await this.instanceRepo.save(instance);

    // Test connection
    try {
      await this.testConnection(savedInstance.id);
      savedInstance.status = MauticInstanceStatus.ACTIVE;
      await this.instanceRepo.save(savedInstance);
    } catch (error) {
      savedInstance.status = MauticInstanceStatus.ERROR;
      savedInstance.lastError = error.message;
      await this.instanceRepo.save(savedInstance);
      throw error;
    }

    return savedInstance;
  }

  static async testConnection(instanceId: string): Promise<boolean> {
    const instance = await this.instanceRepo.findOne({
      where: { id: instanceId },
    });
    if (!instance) throw new Error("Instância Mautic não encontrada");

    try {
      const client = this.getClient(instance);
      await client.getContacts();

      instance.lastHealthCheck = new Date();
      instance.status = MauticInstanceStatus.ACTIVE;
      await this.instanceRepo.save(instance);

      return true;
    } catch (error) {
      instance.status = MauticInstanceStatus.ERROR;
      instance.lastError = error.message;
      await this.instanceRepo.save(instance);
      throw error;
    }
  }

  static async getInstances(tenantId: string): Promise<MauticInstance[]> {
    return await this.instanceRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  static async getInstance(
    instanceId: string,
    tenantId: string,
  ): Promise<MauticInstance | null> {
    return await this.instanceRepo.findOne({
      where: { id: instanceId, tenantId },
    });
  }

  private static getClient(instance: MauticInstance): MauticAPIClient {
    const cacheKey = instance.id;

    if (!this.clients.has(cacheKey)) {
      this.clients.set(
        cacheKey,
        new MauticAPIClient(instance.instanceUrl, instance.credentials),
      );
    }

    return this.clients.get(cacheKey)!;
  }

  // Lead Management
  static async createLead(
    instanceId: string,
    leadData: any,
    source: LeadSource = LeadSource.API,
  ): Promise<MauticLead> {
    const instance = await this.instanceRepo.findOne({
      where: { id: instanceId },
    });
    if (!instance) throw new Error("Instância Mautic não encontrada");

    // Create local lead record
    const lead = this.leadRepo.create({
      tenantId: instance.tenantId,
      mauticInstanceId: instanceId,
      phone: leadData.phone,
      email: leadData.email,
      leadData: {
        ...leadData,
        source,
      },
      status: LeadStatus.NEW,
      syncStatus: SyncStatus.PENDING,
      syncMetadata: {
        lastSyncAt: new Date(),
        syncDirection: "TO_MAUTIC",
        retryCount: 0,
      },
      aiScore: 0,
      engagementScore: 0,
      marketingEnabled: leadData.consentMarketing !== false,
    });

    const savedLead = await this.leadRepo.save(lead);

    // Sync to Mautic
    try {
      await this.syncLeadToMautic(savedLead.id);
    } catch (error) {
      console.error("Erro ao sincronizar lead com Mautic:", error);
      // Lead is saved locally, sync will be retried later
    }

    return savedLead;
  }

  static async syncLeadToMautic(leadId: string): Promise<void> {
    const lead = await this.leadRepo.findOne({
      where: { id: leadId },
      relations: ["mauticInstance"],
    });

    if (!lead) throw new Error("Lead não encontrado");

    const instance = lead.mauticInstance;
    if (!instance.isActive())
      throw new Error("Instância Mautic não está ativa");

    try {
      const client = this.getClient(instance);

      // Prepare contact data for Mautic
      const contactData: MauticContact = {
        firstName: lead.leadData.firstName,
        lastName: lead.leadData.lastName,
        email: lead.email,
        phone: lead.phone,
        company: lead.leadData.company,
        position: lead.leadData.position,
        customFields: {
          kryonix_lead_id: lead.id,
          ai_score: lead.aiScore,
          engagement_score: lead.engagementScore,
          source: lead.leadData.source,
          consent_marketing: lead.leadData.consentMarketing,
          consent_data_processing: lead.leadData.consentDataProcessing,
          created_at: lead.createdAt.toISOString(),
          ...lead.leadData.customFields,
        },
      };

      let mauticContact;
      if (lead.mauticLeadId) {
        // Update existing contact
        mauticContact = await client.updateContact(
          lead.mauticLeadId,
          contactData,
        );
      } else {
        // Create new contact
        mauticContact = await client.createContact(contactData);
      }

      // Update local lead with Mautic data
      lead.markSynced(mauticContact.id);

      // Add tags if any
      if (lead.tags && lead.tags.length > 0) {
        for (const tag of lead.tags) {
          await client.addTagToContact(mauticContact.id, tag);
        }
      }

      // Add to segments if any
      if (lead.segments && lead.segments.length > 0) {
        for (const segmentId of lead.segments) {
          await client.addContactToSegment(segmentId, mauticContact.id);
        }
      }

      await this.leadRepo.save(lead);

      // Update instance stats
      instance.incrementApiCall();
      await this.instanceRepo.save(instance);
    } catch (error) {
      console.error("Erro na sincronização com Mautic:", error);
      lead.setSyncError(error.message);
      await this.leadRepo.save(lead);
      throw error;
    }
  }

  // WhatsApp Integration
  static async syncFromWhatsApp(message: Message): Promise<MauticLead | null> {
    try {
      // Get active Mautic instances for tenant
      const instances = await this.instanceRepo.find({
        where: {
          tenantId: message.tenantId,
          status: MauticInstanceStatus.ACTIVE,
        },
      });

      if (instances.length === 0) return null;

      // Use first active instance (could be made configurable)
      const instance = instances[0];

      // Check if lead already exists
      let lead = await this.leadRepo.findOne({
        where: {
          tenantId: message.tenantId,
          phone: message.fromNumber,
        },
      });

      if (lead) {
        // Update engagement
        lead.updateEngagementScore("whatsapp_message", 1);
        lead.lastActivityAt = new Date();
        await this.leadRepo.save(lead);

        // Sync updated engagement to Mautic
        if (lead.mauticLeadId) {
          try {
            const client = this.getClient(instance);
            await client.updateContact(lead.mauticLeadId, {
              customFields: {
                engagement_score: lead.engagementScore,
                last_activity: lead.lastActivityAt?.toISOString(),
                whatsapp_engagement: lead.leadData.whatsappEngagement,
              },
            });
          } catch (error) {
            console.error("Erro ao atualizar engajamento no Mautic:", error);
          }
        }

        return lead;
      }

      // Create new lead from WhatsApp message
      const leadData = {
        phone: message.fromNumber,
        source: LeadSource.WHATSAPP,
        lastActivity: new Date(),
        interactions: 1,
        whatsappEngagement: 1,
        consentMarketing: false, // Will need explicit consent
        consentDataProcessing: true, // Basic processing for service
      };

      lead = await this.createLead(instance.id, leadData, LeadSource.WHATSAPP);

      // Trigger AI analysis for intent classification
      try {
        const aiResult = await AIService.processRequest(message.tenantId, {
          service: "OPENAI",
          operation: "INTENT_CLASSIFICATION",
          input: message.content?.text || "",
          sourceModule: "WHATSAPP",
          metadata: {
            leadId: lead.id,
            messageId: message.id,
          },
        });

        if (aiResult.success && aiResult.data) {
          lead.leadData.intent = aiResult.data.intent;
          lead.leadData.aiScore = aiResult.data.confidence * 10;
          lead.updateAIScore(
            aiResult.data.confidence * 10,
            "Análise automática via WhatsApp",
          );
          await this.leadRepo.save(lead);
        }
      } catch (error) {
        console.error("Erro na análise de IA:", error);
      }

      return lead;
    } catch (error) {
      console.error("Erro ao sincronizar do WhatsApp:", error);
      return null;
    }
  }

  // Campaign Management
  static async createCampaign(
    instanceId: string,
    campaignData: {
      name: string;
      type: CampaignType;
      triggers: any[];
      actions: any[];
      settings?: any;
    },
  ): Promise<MauticCampaign> {
    const instance = await this.instanceRepo.findOne({
      where: { id: instanceId },
    });
    if (!instance) throw new Error("Instância Mautic não encontrada");

    // Create local campaign record
    const campaign = this.campaignRepo.create({
      tenantId: instance.tenantId,
      mauticInstanceId: instanceId,
      name: campaignData.name,
      type: campaignData.type,
      triggers: campaignData.triggers,
      actions: campaignData.actions,
      settings: {
        allowRestart: true,
        timezone: "America/Sao_Paulo",
        language: "pt_BR",
        trackingEnabled: true,
        respectBusinessHours: true,
        businessHours: {
          start: "09:00",
          end: "18:00",
        },
        avoidHolidays: true,
        requireConsent: true,
        unsubscribeLink: true,
        ...campaignData.settings,
      },
      status: CampaignStatus.DRAFT,
      metrics: {
        totalContacts: 0,
        activeContacts: 0,
        completedContacts: 0,
        emailsSent: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        emailsBounced: 0,
        unsubscribes: 0,
        whatsappSent: 0,
        whatsappDelivered: 0,
        whatsappRead: 0,
        whatsappReplied: 0,
        leadsGenerated: 0,
        conversions: 0,
        revenue: 0,
        averageEngagementScore: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        executionErrors: 0,
        avgExecutionTime: 0,
      },
    });

    const savedCampaign = await this.campaignRepo.save(campaign);

    // Create campaign in Mautic
    try {
      const client = this.getClient(instance);
      const mauticCampaignData = {
        name: campaignData.name,
        description: `Campanha criada via KRYONIX - Tipo: ${campaignData.type}`,
        isPublished: false,
        category: campaignData.type,
        canvas: {
          nodes: this.convertActionsToMauticNodes(campaignData.actions),
          connections: this.generateMauticConnections(campaignData.actions),
        },
      };

      const mauticCampaign = await client.createCampaign(mauticCampaignData);

      savedCampaign.mauticCampaignId = mauticCampaign.id;
      await this.campaignRepo.save(savedCampaign);
    } catch (error) {
      console.error("Erro ao criar campanha no Mautic:", error);
      // Campaign is saved locally, sync will be retried later
    }

    return savedCampaign;
  }

  static async executeCampaign(
    campaignId: string,
  ): Promise<CampaignExecutionResult> {
    const campaign = await this.campaignRepo.findOne({
      where: { id: campaignId },
      relations: ["mauticInstance"],
    });

    if (!campaign) throw new Error("Campanha não encontrada");
    if (!campaign.canExecute())
      throw new Error("Campanha não pode ser executada no momento");

    const startTime = Date.now();
    let contactsProcessed = 0;
    let actionsExecuted = 0;
    const errors: string[] = [];

    try {
      // Get leads that match campaign triggers
      const eligibleLeads = await this.getEligibleLeads(campaign);

      for (const lead of eligibleLeads) {
        try {
          if (!campaign.hasValidConsent(lead)) {
            continue; // Skip leads without consent
          }

          const actions = campaign.getNextActions(lead);

          for (const action of actions) {
            try {
              await this.executeAction(action, lead, campaign);
              actionsExecuted++;
            } catch (error) {
              errors.push(
                `Erro ao executar ação para lead ${lead.id}: ${error.message}`,
              );
            }
          }

          contactsProcessed++;
        } catch (error) {
          errors.push(`Erro ao processar lead ${lead.id}: ${error.message}`);
        }
      }

      // Update campaign metrics
      campaign.updateMetrics({
        totalContacts: eligibleLeads.length,
        activeContacts: contactsProcessed,
        executionErrors: errors.length,
        avgExecutionTime: Date.now() - startTime,
      });

      await this.campaignRepo.save(campaign);
    } catch (error) {
      errors.push(`Erro geral na execução: ${error.message}`);
    }

    return {
      success: errors.length === 0,
      contactsProcessed,
      actionsExecuted,
      errors,
      executionTime: Date.now() - startTime,
    };
  }

  private static async getEligibleLeads(
    campaign: MauticCampaign,
  ): Promise<MauticLead[]> {
    const queryBuilder = this.leadRepo
      .createQueryBuilder("lead")
      .where("lead.tenantId = :tenantId", { tenantId: campaign.tenantId })
      .andWhere("lead.marketingEnabled = true");

    // Apply campaign filters
    if (campaign.targetSegments && campaign.targetSegments.length > 0) {
      queryBuilder.andWhere("lead.segments && :segments", {
        segments: campaign.targetSegments,
      });
    }

    if (campaign.excludeSegments && campaign.excludeSegments.length > 0) {
      queryBuilder.andWhere("NOT (lead.segments && :excludeSegments)", {
        excludeSegments: campaign.excludeSegments,
      });
    }

    return await queryBuilder.getMany();
  }

  private static async executeAction(
    action: any,
    lead: MauticLead,
    campaign: MauticCampaign,
  ): Promise<void> {
    switch (action.type) {
      case "send_email":
        await this.executeSendEmailAction(action, lead, campaign);
        break;

      case "send_whatsapp":
        await this.executeSendWhatsAppAction(action, lead, campaign);
        break;

      case "add_tag":
        await this.executeAddTagAction(action, lead);
        break;

      case "modify_lead_score":
        await this.executeModifyScoreAction(action, lead);
        break;

      case "trigger_n8n_workflow":
        await this.executeTriggerN8NAction(action, lead, campaign);
        break;

      case "ai_analysis":
        await this.executeAIAnalysisAction(action, lead, campaign);
        break;

      default:
        throw new Error(`Tipo de ação não suportado: ${action.type}`);
    }
  }

  private static async executeSendEmailAction(
    action: any,
    lead: MauticLead,
    campaign: MauticCampaign,
  ): Promise<void> {
    if (!lead.email) throw new Error("Lead não possui email");

    const client = this.getClient(campaign.mauticInstance);

    // Trigger email send in Mautic
    if (lead.mauticLeadId && campaign.mauticCampaignId) {
      await client.triggerCampaignForContact(
        campaign.mauticCampaignId,
        lead.mauticLeadId,
      );
    }

    campaign.incrementEmailMetric("emailsSent");
    await this.campaignRepo.save(campaign);
  }

  private static async executeSendWhatsAppAction(
    action: any,
    lead: MauticLead,
    campaign: MauticCampaign,
  ): Promise<void> {
    if (!lead.phone) throw new Error("Lead não possui telefone");

    // Get WhatsApp instance for tenant
    const instances = await WhatsAppService.getInstances(campaign.tenantId);
    if (instances.length === 0)
      throw new Error("Nenhuma instância WhatsApp ativa");

    const instance = instances[0]; // Use first active instance

    // Send WhatsApp message
    await WhatsAppService.sendMessage(instance.id, {
      to: lead.phone,
      type: "text",
      content: { text: action.message },
    });

    campaign.incrementWhatsAppMetric("whatsappSent");
    lead.updateEngagementScore("campaign_whatsapp", 1);

    await Promise.all([
      this.campaignRepo.save(campaign),
      this.leadRepo.save(lead),
    ]);
  }

  private static async executeAddTagAction(
    action: any,
    lead: MauticLead,
  ): Promise<void> {
    for (const tag of action.tags) {
      lead.addTag(tag);
    }
    await this.leadRepo.save(lead);
  }

  private static async executeModifyScoreAction(
    action: any,
    lead: MauticLead,
  ): Promise<void> {
    lead.updateAIScore(lead.aiScore + action.points, action.reason);
    await this.leadRepo.save(lead);
  }

  private static async executeTriggerN8NAction(
    action: any,
    lead: MauticLead,
    campaign: MauticCampaign,
  ): Promise<void> {
    await N8NService.triggerWorkflow(action.workflowId, {
      leadId: lead.id,
      campaignId: campaign.id,
      leadData: lead.leadData,
      ...action.data,
    });
  }

  private static async executeAIAnalysisAction(
    action: any,
    lead: MauticLead,
    campaign: MauticCampaign,
  ): Promise<void> {
    const aiResult = await AIService.processRequest(campaign.tenantId, {
      service: action.service,
      operation: action.operation,
      input: action.prompt || lead.leadData,
      sourceModule: "MAUTIC",
      metadata: {
        leadId: lead.id,
        campaignId: campaign.id,
      },
    });

    if (aiResult.success && aiResult.data) {
      // Update lead with AI insights
      lead.leadData.aiAnalysis = aiResult.data;
      if (aiResult.data.score) {
        lead.updateAIScore(
          aiResult.data.score,
          "Análise automática via campanha",
        );
      }
      await this.leadRepo.save(lead);
    }
  }

  private static convertActionsToMauticNodes(actions: any[]): any[] {
    // Convert KRYONIX actions to Mautic campaign nodes
    return actions.map((action, index) => ({
      id: `node_${index}`,
      name: action.type,
      type: this.getMauticNodeType(action.type),
      settings: action,
    }));
  }

  private static generateMauticConnections(actions: any[]): any[] {
    // Generate sequential connections between nodes
    const connections = [];
    for (let i = 0; i < actions.length - 1; i++) {
      connections.push({
        sourceId: `node_${i}`,
        targetId: `node_${i + 1}`,
        anchors: ["source", "target"],
      });
    }
    return connections;
  }

  private static getMauticNodeType(actionType: string): string {
    const typeMap = {
      send_email: "email.send",
      add_tag: "contact.add_tag",
      modify_lead_score: "contact.modify_score",
      send_whatsapp: "custom.whatsapp",
      trigger_n8n_workflow: "custom.n8n",
      ai_analysis: "custom.ai",
    };
    return typeMap[actionType] || "custom.action";
  }

  // Analytics and Reporting
  static async getTenantAnalytics(tenantId: string): Promise<any> {
    const [instances, leads, campaigns] = await Promise.all([
      this.instanceRepo.find({ where: { tenantId } }),
      this.leadRepo.find({ where: { tenantId } }),
      this.campaignRepo.find({ where: { tenantId } }),
    ]);

    const analytics = {
      overview: {
        totalInstances: instances.length,
        activeInstances: instances.filter((i) => i.isActive()).length,
        totalLeads: leads.length,
        qualifiedLeads: leads.filter((l) => l.isQualified()).length,
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter((c) => c.isActive()).length,
      },

      leadSources: this.groupBy(leads, "leadData.source"),

      leadsByStatus: this.groupBy(leads, "status"),

      engagementMetrics: {
        averageAIScore: this.average(leads.map((l) => l.aiScore)),
        averageEngagementScore: this.average(
          leads.map((l) => l.engagementScore),
        ),
        totalInteractions: leads.reduce(
          (sum, l) => sum + (l.leadData.interactions || 0),
          0,
        ),
      },

      campaignPerformance: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        performance: c.getPerformanceReport(),
      })),

      regionalDistribution: this.groupBy(
        leads.filter((l) => l.leadData.region),
        "leadData.region",
      ),
    };

    return analytics;
  }

  private static groupBy(
    array: any[],
    property: string,
  ): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = this.getNestedProperty(item, property) || "Não definido";
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  private static getNestedProperty(obj: any, path: string): any {
    return path.split(".").reduce((current, prop) => current?.[prop], obj);
  }

  private static average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  // Webhook handling
  static async handleWebhook(
    tenantId: string,
    instanceId: string,
    webhookData: any,
  ): Promise<void> {
    const instance = await this.instanceRepo.findOne({
      where: { id: instanceId, tenantId },
    });

    if (!instance) throw new Error("Instância não encontrada");

    const { event, contact } = webhookData;

    switch (event) {
      case "contact.created":
        await this.handleContactCreated(instance, contact);
        break;

      case "contact.updated":
        await this.handleContactUpdated(instance, contact);
        break;

      case "email.sent":
        await this.handleEmailSent(instance, webhookData);
        break;

      case "email.opened":
        await this.handleEmailOpened(instance, webhookData);
        break;

      default:
        console.log(`Webhook event não tratado: ${event}`);
    }
  }

  private static async handleContactCreated(
    instance: MauticInstance,
    contactData: any,
  ): Promise<void> {
    // Sync contact from Mautic to KRYONIX
    const existingLead = await this.leadRepo.findOne({
      where: {
        mauticLeadId: contactData.id,
        mauticInstanceId: instance.id,
      },
    });

    if (existingLead) return; // Already synced

    const leadData = {
      firstName: contactData.fields.core.firstname?.value,
      lastName: contactData.fields.core.lastname?.value,
      email: contactData.fields.core.email?.value,
      phone: contactData.fields.core.mobile?.value,
      company: contactData.fields.core.company?.value,
      source: LeadSource.IMPORTED,
      consentMarketing: true, // Assume consent if created in Mautic
      consentDataProcessing: true,
    };

    await this.createLead(instance.id, leadData, LeadSource.IMPORTED);
  }

  private static async handleContactUpdated(
    instance: MauticInstance,
    contactData: any,
  ): Promise<void> {
    const lead = await this.leadRepo.findOne({
      where: {
        mauticLeadId: contactData.id,
        mauticInstanceId: instance.id,
      },
    });

    if (!lead) return;

    // Update local lead with Mautic data
    lead.leadData = {
      ...lead.leadData,
      firstName: contactData.fields.core.firstname?.value,
      lastName: contactData.fields.core.lastname?.value,
      email: contactData.fields.core.email?.value,
      phone: contactData.fields.core.mobile?.value,
      company: contactData.fields.core.company?.value,
    };

    lead.syncStatus = SyncStatus.SYNCED;
    await this.leadRepo.save(lead);
  }

  private static async handleEmailSent(
    instance: MauticInstance,
    eventData: any,
  ): Promise<void> {
    // Find campaign and update metrics
    const campaign = await this.campaignRepo.findOne({
      where: {
        mauticCampaignId: eventData.campaign?.id,
        mauticInstanceId: instance.id,
      },
    });

    if (campaign) {
      campaign.incrementEmailMetric("emailsSent");
      await this.campaignRepo.save(campaign);
    }
  }

  private static async handleEmailOpened(
    instance: MauticInstance,
    eventData: any,
  ): Promise<void> {
    // Find campaign and update metrics
    const campaign = await this.campaignRepo.findOne({
      where: {
        mauticCampaignId: eventData.campaign?.id,
        mauticInstanceId: instance.id,
      },
    });

    if (campaign) {
      campaign.incrementEmailMetric("emailsOpened");
      await this.campaignRepo.save(campaign);
    }

    // Update lead engagement
    const lead = await this.leadRepo.findOne({
      where: {
        mauticLeadId: eventData.contact?.id,
        mauticInstanceId: instance.id,
      },
    });

    if (lead) {
      lead.updateEngagementScore("email_opened", 2);
      await this.leadRepo.save(lead);
    }
  }

  // Health monitoring
  static async performHealthCheck(instanceId: string): Promise<any> {
    const instance = await this.instanceRepo.findOne({
      where: { id: instanceId },
    });
    if (!instance) throw new Error("Instância não encontrada");

    try {
      const client = this.getClient(instance);

      // Test basic connectivity
      await client.getContacts();

      // Update health status
      instance.lastHealthCheck = new Date();
      instance.status = MauticInstanceStatus.ACTIVE;
      instance.lastError = undefined;

      await this.instanceRepo.save(instance);

      return instance.getHealthStatus();
    } catch (error) {
      instance.status = MauticInstanceStatus.ERROR;
      instance.lastError = error.message;
      await this.instanceRepo.save(instance);

      throw error;
    }
  }
}

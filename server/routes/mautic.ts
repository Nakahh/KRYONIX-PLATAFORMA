import { Router, RequestHandler } from "express";
import { z } from "zod";
import {
  createAuthMiddleware,
  validateBody,
  validateQuery,
} from "../middleware/auth";
import { MauticService } from "../services/mautic";
import { DatabaseConnection } from "../db/connection";
import {
  MauticInstance,
  MauticInstanceStatus,
} from "../entities/MauticInstance";
import { MauticLead, LeadSource, LeadStatus } from "../entities/MauticLead";
import {
  MauticCampaign,
  CampaignType,
  CampaignStatus,
} from "../entities/MauticCampaign";
import {
  MAUTIC_CAMPAIGN_TEMPLATES,
  BRAZILIAN_MARKET_TEMPLATES,
} from "../templates/mautic-templates";

const router = Router();

// Validation Schemas
const CreateInstanceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  instanceUrl: z.string().url("URL da instância inválida"),
  credentials: z.object({
    clientId: z.string().min(1, "Client ID é obrigatório"),
    clientSecret: z.string().min(1, "Client Secret é obrigatório"),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
  }),
  config: z
    .object({
      autoSync: z.boolean().default(true),
      syncInterval: z.number().min(5).max(1440).default(30),
      webhookEnabled: z.boolean().default(true),
      webhookEvents: z.array(z.string()).default([]),
      leadScoringEnabled: z.boolean().default(true),
      aiIntegrationEnabled: z.boolean().default(true),
      lgpdComplianceEnabled: z.boolean().default(true),
      customFields: z.record(z.any()).default({}),
    })
    .optional(),
});

const CreateLeadSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Email inválido").optional(),
    phone: z
      .string()
      .min(10, "Telefone deve ter pelo menos 10 dígitos")
      .optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    cep: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    region: z
      .enum(["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"])
      .optional(),
    source: z.nativeEnum(LeadSource).default(LeadSource.API),
    budget: z.number().optional(),
    timeline: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    consentMarketing: z.boolean().default(false),
    consentDataProcessing: z.boolean().default(true),
    customFields: z.record(z.any()).optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email ou telefone é obrigatório",
    path: ["email"],
  });

const CreateCampaignSchema = z.object({
  name: z.string().min(1, "Nome da campanha é obrigatório"),
  description: z.string().optional(),
  type: z.nativeEnum(CampaignType),
  triggers: z.array(
    z.object({
      type: z.string(),
      conditions: z.record(z.any()),
      delay: z.number().optional(),
      timeRestrictions: z
        .object({
          startTime: z.string().optional(),
          endTime: z.string().optional(),
          daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
        })
        .optional(),
    }),
  ),
  actions: z.array(
    z
      .object({
        type: z.string(),
        delay: z.number().optional(),
      })
      .passthrough(),
  ),
  settings: z
    .object({
      allowRestart: z.boolean().default(true),
      timezone: z.string().default("America/Sao_Paulo"),
      language: z.string().default("pt_BR"),
      trackingEnabled: z.boolean().default(true),
      respectBusinessHours: z.boolean().default(true),
      businessHours: z
        .object({
          start: z.string().default("09:00"),
          end: z.string().default("18:00"),
        })
        .optional(),
      avoidHolidays: z.boolean().default(true),
      requireConsent: z.boolean().default(true),
      unsubscribeLink: z.boolean().default(true),
    })
    .optional(),
  targetSegments: z.array(z.number()).optional(),
  excludeSegments: z.array(z.number()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

const UpdateLeadSchema = CreateLeadSchema.partial();

const BulkActionSchema = z.object({
  leadIds: z.array(z.string().uuid()),
  action: z.enum([
    "add_tag",
    "remove_tag",
    "add_to_segment",
    "remove_from_segment",
    "update_score",
  ]),
  params: z.record(z.any()),
});

const AnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
  metrics: z.array(z.string()).optional(),
});

// Instance Management
export const createInstance: RequestHandler[] = [
  ...createAuthMiddleware("mautic:admin"),
  validateBody(CreateInstanceSchema),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const instance = await MauticService.createInstance(tenantId, req.body);

      res.status(201).json({
        success: true,
        data: instance,
        message: "Instância Mautic criada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar instância Mautic:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const getInstances: RequestHandler[] = [
  ...createAuthMiddleware("mautic:read"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const instances = await MauticService.getInstances(tenantId);

      res.json({
        success: true,
        data: instances,
      });
    } catch (error) {
      console.error("Erro ao listar instâncias:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const getInstance: RequestHandler[] = [
  ...createAuthMiddleware("mautic:read"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const instanceId = req.params.instanceId;

      const instance = await MauticService.getInstance(instanceId, tenantId);

      if (!instance) {
        return res.status(404).json({
          success: false,
          error: "Instância não encontrada",
        });
      }

      res.json({
        success: true,
        data: instance,
      });
    } catch (error) {
      console.error("Erro ao obter instância:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const testConnection: RequestHandler[] = [
  ...createAuthMiddleware("mautic:admin"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const instanceId = req.params.instanceId;

      const instance = await MauticService.getInstance(instanceId, tenantId);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: "Instância não encontrada",
        });
      }

      const isConnected = await MauticService.testConnection(instanceId);

      res.json({
        success: true,
        data: {
          connected: isConnected,
          status: instance.status,
          lastHealthCheck: instance.lastHealthCheck,
          healthStatus: instance.getHealthStatus(),
        },
      });
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        data: {
          connected: false,
        },
      });
    }
  },
];

// Lead Management
export const createLead: RequestHandler[] = [
  ...createAuthMiddleware("mautic:write"),
  validateBody(CreateLeadSchema),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const instanceId = req.params.instanceId;

      const instance = await MauticService.getInstance(instanceId, tenantId);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: "Instância não encontrada",
        });
      }

      const lead = await MauticService.createLead(
        instanceId,
        req.body,
        req.body.source,
      );

      res.status(201).json({
        success: true,
        data: lead,
        message: "Lead criado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const getLeads: RequestHandler[] = [
  ...createAuthMiddleware("mautic:read"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { page = 1, limit = 20, status, source, search } = req.query;

      const dataSource = await DatabaseConnection.getInstance();
      const leadRepo = dataSource.getRepository(MauticLead);

      const queryBuilder = leadRepo
        .createQueryBuilder("lead")
        .where("lead.tenantId = :tenantId", { tenantId })
        .orderBy("lead.createdAt", "DESC");

      if (status) {
        queryBuilder.andWhere("lead.status = :status", { status });
      }

      if (source) {
        queryBuilder.andWhere("lead.leadData ->> 'source' = :source", {
          source,
        });
      }

      if (search) {
        queryBuilder.andWhere(
          `(
          lead.email ILIKE :search OR 
          lead.phone ILIKE :search OR
          lead.leadData ->> 'firstName' ILIKE :search OR
          lead.leadData ->> 'lastName' ILIKE :search OR
          lead.leadData ->> 'company' ILIKE :search
        )`,
          { search: `%${search}%` },
        );
      }

      const [leads, total] = await queryBuilder
        .limit(Number(limit))
        .offset((Number(page) - 1) * Number(limit))
        .getManyAndCount();

      res.json({
        success: true,
        data: {
          leads,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Erro ao listar leads:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const getLead: RequestHandler[] = [
  ...createAuthMiddleware("mautic:read"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const leadId = req.params.leadId;

      const dataSource = await DatabaseConnection.getInstance();
      const leadRepo = dataSource.getRepository(MauticLead);

      const lead = await leadRepo.findOne({
        where: { id: leadId, tenantId },
        relations: ["mauticInstance"],
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: "Lead não encontrado",
        });
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      console.error("Erro ao obter lead:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const updateLead: RequestHandler[] = [
  ...createAuthMiddleware("mautic:write"),
  validateBody(UpdateLeadSchema),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const leadId = req.params.leadId;

      const dataSource = await DatabaseConnection.getInstance();
      const leadRepo = dataSource.getRepository(MauticLead);

      const lead = await leadRepo.findOne({
        where: { id: leadId, tenantId },
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: "Lead não encontrado",
        });
      }

      // Update lead data
      Object.assign(lead.leadData, req.body);
      if (req.body.email) lead.email = req.body.email;
      if (req.body.phone) lead.phone = req.body.phone;

      // Mark for sync
      lead.syncStatus = "PENDING";

      const updatedLead = await leadRepo.save(lead);

      res.json({
        success: true,
        data: updatedLead,
        message: "Lead atualizado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const syncLead: RequestHandler[] = [
  ...createAuthMiddleware("mautic:write"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const leadId = req.params.leadId;

      await MauticService.syncLeadToMautic(leadId);

      res.json({
        success: true,
        message: "Lead sincronizado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao sincronizar lead:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const bulkAction: RequestHandler[] = [
  ...createAuthMiddleware("mautic:write"),
  validateBody(BulkActionSchema),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { leadIds, action, params } = req.body;

      const dataSource = await DatabaseConnection.getInstance();
      const leadRepo = dataSource.getRepository(MauticLead);

      const leads = await leadRepo.find({
        where: {
          id: { $in: leadIds } as any,
          tenantId,
        },
      });

      if (leads.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Nenhum lead encontrado",
        });
      }

      let updatedCount = 0;

      for (const lead of leads) {
        try {
          switch (action) {
            case "add_tag":
              if (params.tag) {
                lead.addTag(params.tag);
                updatedCount++;
              }
              break;

            case "remove_tag":
              if (params.tag) {
                lead.removeTag(params.tag);
                updatedCount++;
              }
              break;

            case "add_to_segment":
              if (params.segmentId) {
                lead.addToCampaign(params.segmentId);
                updatedCount++;
              }
              break;

            case "update_score":
              if (params.score && params.reason) {
                lead.updateAIScore(params.score, params.reason);
                updatedCount++;
              }
              break;
          }

          await leadRepo.save(lead);
        } catch (error) {
          console.error(`Erro ao aplicar ação no lead ${lead.id}:`, error);
        }
      }

      res.json({
        success: true,
        data: {
          totalLeads: leads.length,
          updatedLeads: updatedCount,
        },
        message: `Ação aplicada a ${updatedCount} leads`,
      });
    } catch (error) {
      console.error("Erro na ação em lote:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Campaign Management
export const createCampaign: RequestHandler[] = [
  ...createAuthMiddleware("mautic:admin"),
  validateBody(CreateCampaignSchema),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const instanceId = req.params.instanceId;

      const instance = await MauticService.getInstance(instanceId, tenantId);
      if (!instance) {
        return res.status(404).json({
          success: false,
          error: "Instância não encontrada",
        });
      }

      const campaign = await MauticService.createCampaign(instanceId, req.body);

      res.status(201).json({
        success: true,
        data: campaign,
        message: "Campanha criada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao criar campanha:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const getCampaigns: RequestHandler[] = [
  ...createAuthMiddleware("mautic:read"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { status, type } = req.query;

      const dataSource = await DatabaseConnection.getInstance();
      const campaignRepo = dataSource.getRepository(MauticCampaign);

      const queryBuilder = campaignRepo
        .createQueryBuilder("campaign")
        .where("campaign.tenantId = :tenantId", { tenantId })
        .orderBy("campaign.createdAt", "DESC");

      if (status) {
        queryBuilder.andWhere("campaign.status = :status", { status });
      }

      if (type) {
        queryBuilder.andWhere("campaign.type = :type", { type });
      }

      const campaigns = await queryBuilder.getMany();

      res.json({
        success: true,
        data: campaigns,
      });
    } catch (error) {
      console.error("Erro ao listar campanhas:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const executeCampaign: RequestHandler[] = [
  ...createAuthMiddleware("mautic:write"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const campaignId = req.params.campaignId;

      const result = await MauticService.executeCampaign(campaignId);

      res.json({
        success: result.success,
        data: result,
        message: result.success
          ? "Campanha executada com sucesso"
          : "Campanha executada com alguns erros",
      });
    } catch (error) {
      console.error("Erro ao executar campanha:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Templates
export const getTemplates: RequestHandler[] = [
  ...createAuthMiddleware("mautic:read"),
  async (req, res) => {
    try {
      const { category, type } = req.query;

      let templates = { ...MAUTIC_CAMPAIGN_TEMPLATES };

      if (category === "brazilian") {
        templates = { ...templates, ...BRAZILIAN_MARKET_TEMPLATES };
      }

      if (type) {
        const filteredTemplates = {};
        Object.entries(templates).forEach(([key, template]) => {
          if (template.type === type) {
            filteredTemplates[key] = template;
          }
        });
        templates = filteredTemplates;
      }

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error("Erro ao listar templates:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

export const createFromTemplate: RequestHandler[] = [
  ...createAuthMiddleware("mautic:admin"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const instanceId = req.params.instanceId;
      const templateName = req.params.templateName;
      const customizations = req.body;

      const allTemplates = {
        ...MAUTIC_CAMPAIGN_TEMPLATES,
        ...BRAZILIAN_MARKET_TEMPLATES,
      };
      const template = allTemplates[templateName];

      if (!template) {
        return res.status(404).json({
          success: false,
          error: "Template não encontrado",
        });
      }

      const campaignData = {
        ...template,
        ...customizations,
        name: customizations.name || template.name,
      };

      const campaign = await MauticService.createCampaign(
        instanceId,
        campaignData,
      );

      res.status(201).json({
        success: true,
        data: campaign,
        message: "Campanha criada a partir do template",
      });
    } catch (error) {
      console.error("Erro ao criar campanha do template:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Analytics
export const getAnalytics: RequestHandler[] = [
  ...createAuthMiddleware("mautic:read"),
  validateQuery(AnalyticsQuerySchema),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const analytics = await MauticService.getTenantAnalytics(tenantId);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error("Erro ao obter analytics:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Webhook Handler
export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const instanceId = req.params.instanceId;
    const webhookData = req.body;

    await MauticService.handleWebhook(tenantId, instanceId, webhookData);

    res.json({
      success: true,
      message: "Webhook processado com sucesso",
    });
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Health Check
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      service: "Mautic Marketing Automation",
      version: "1.0.0",
      status: "healthy",
      timestamp: new Date().toISOString(),
      features: {
        leadManagement: true,
        campaignAutomation: true,
        emailMarketing: true,
        whatsappIntegration: true,
        aiIntegration: true,
        lgpdCompliance: true,
        brazilianMarket: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// LGPD Compliance endpoints
export const handleDataRequest: RequestHandler[] = [
  ...createAuthMiddleware("mautic:admin"),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { contactPhone, requestType } = req.body;

      const dataSource = await DatabaseConnection.getInstance();
      const leadRepo = dataSource.getRepository(MauticLead);

      const lead = await leadRepo.findOne({
        where: { phone: contactPhone, tenantId },
      });

      if (!lead) {
        return res.status(404).json({
          success: false,
          error: "Contato não encontrado",
        });
      }

      if (requestType === "export") {
        const exportedData = lead.exportData();
        res.json({
          success: true,
          data: exportedData,
          message: "Dados exportados com sucesso",
        });
      } else if (requestType === "delete") {
        await leadRepo.remove(lead);
        res.json({
          success: true,
          message: "Dados removidos conforme solicitado",
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Tipo de solicita��ão inválido",
        });
      }
    } catch (error) {
      console.error("Erro na solicitação LGPD:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Route definitions
router.post("/instances", ...createInstance);
router.get("/instances", ...getInstances);
router.get("/instances/:instanceId", ...getInstance);
router.post("/instances/:instanceId/test", ...testConnection);

router.post("/instances/:instanceId/leads", ...createLead);
router.get("/leads", ...getLeads);
router.get("/leads/:leadId", ...getLead);
router.put("/leads/:leadId", ...updateLead);
router.post("/leads/:leadId/sync", ...syncLead);
router.post("/leads/bulk-action", ...bulkAction);

router.post("/instances/:instanceId/campaigns", ...createCampaign);
router.get("/campaigns", ...getCampaigns);
router.post("/campaigns/:campaignId/execute", ...executeCampaign);

router.get("/templates", ...getTemplates);
router.post(
  "/instances/:instanceId/templates/:templateName",
  ...createFromTemplate,
);

router.get("/analytics", ...getAnalytics);

router.post("/lgpd/data-request", ...handleDataRequest);

router.get("/health", healthCheck);

export default router;

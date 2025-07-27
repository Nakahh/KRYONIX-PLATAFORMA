import express, { RequestHandler } from "express";
import { z } from "zod";
import {
  createAuthMiddleware,
  validateBody,
  validateQuery,
} from "../middleware/auth";
import { NotificationService } from "../services/notification";
import { DatabaseConnection } from "../db/connection";
import {
  NotificationTemplate,
  NotificationCategory,
  NotificationChannel,
  TemplateStatus,
} from "../entities/NotificationTemplate";
import {
  NotificationDelivery,
  DeliveryStatus,
  DeliveryChannel,
} from "../entities/NotificationDelivery";
import { NotificationEvent, EventType } from "../entities/NotificationEvent";
import {
  NotificationPreference,
  ConsentType,
} from "../entities/NotificationPreference";

const router = express.Router();

// Validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional(),
  eventType: z.string().min(3).max(255),
  category: z.enum([
    "SYSTEM",
    "BILLING",
    "WHATSAPP",
    "AI_SERVICE",
    "AUTOMATION",
    "TYPEBOT",
    "MAUTIC",
    "N8N",
    "USER_ACTION",
    "INTEGRATION",
    "SECURITY",
    "MARKETING",
  ]),
  priority: z
    .enum(["LOW", "NORMAL", "HIGH", "CRITICAL", "URGENT"])
    .default("NORMAL"),
  supportedChannels: z.array(
    z.enum(["IN_APP", "EMAIL", "WHATSAPP", "PUSH", "SMS", "WEBHOOK"]),
  ),
  content: z.record(
    z.string(),
    z.object({
      subject: z.string().optional(),
      title: z.string(),
      body: z.string(),
      footer: z.string().optional(),
      htmlBody: z.string().optional(),
      buttons: z
        .array(
          z.object({
            text: z.string(),
            url: z.string().optional(),
            action: z.string().optional(),
          }),
        )
        .optional(),
      image: z
        .object({
          url: z.string(),
          alt: z.string().optional(),
        })
        .optional(),
      metadata: z.record(z.any()).optional(),
    }),
  ),
  variables: z.record(
    z.string(),
    z.object({
      type: z.enum(["string", "number", "boolean", "date", "array", "object"]),
      required: z.boolean(),
      defaultValue: z.any().optional(),
      description: z.string().optional(),
      validation: z
        .object({
          pattern: z.string().optional(),
          min: z.number().optional(),
          max: z.number().optional(),
          options: z.array(z.string()).optional(),
        })
        .optional(),
    }),
  ),
  settings: z.object({
    enableRichText: z.boolean().default(true),
    allowHtml: z.boolean().default(false),
    trackOpens: z.boolean().default(true),
    trackClicks: z.boolean().default(true),
    enableAbTesting: z.boolean().default(false),
    quietHours: z.object({
      enabled: z.boolean().default(true),
      startTime: z.string().default("22:00"),
      endTime: z.string().default("08:00"),
      timezone: z.string().default("America/Sao_Paulo"),
    }),
    rateLimiting: z.object({
      enabled: z.boolean().default(true),
      maxPerHour: z.number().default(10),
      maxPerDay: z.number().default(100),
    }),
    businessHours: z.object({
      enabled: z.boolean().default(true),
      workingDays: z
        .array(z.string())
        .default(["monday", "tuesday", "wednesday", "thursday", "friday"]),
      startTime: z.string().default("09:00"),
      endTime: z.string().default("18:00"),
      timezone: z.string().default("America/Sao_Paulo"),
      holidays: z.array(z.string()).default([]),
    }),
    retryPolicy: z.object({
      maxRetries: z.number().default(3),
      retryDelayMinutes: z.number().default(15),
      backoffMultiplier: z.number().default(2),
    }),
  }),
});

const sendNotificationSchema = z.object({
  templateId: z.string().uuid(),
  recipientId: z.string().uuid().optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().optional(),
  variables: z.record(z.any()).optional(),
  channels: z
    .array(z.enum(["IN_APP", "EMAIL", "WHATSAPP", "PUSH", "SMS", "WEBHOOK"]))
    .optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL", "URGENT"]).optional(),
  scheduledFor: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  context: z
    .object({
      workflowId: z.string().optional(),
      flowId: z.string().optional(),
      campaignId: z.string().optional(),
      leadId: z.string().optional(),
      instanceId: z.string().optional(),
      eventType: z.string().optional(),
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

const bulkNotificationSchema = z.object({
  templateId: z.string().uuid(),
  recipients: z
    .array(
      z.object({
        userId: z.string().uuid().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        variables: z.record(z.any()).optional(),
      }),
    )
    .min(1)
    .max(1000),
  channels: z
    .array(z.enum(["IN_APP", "EMAIL", "WHATSAPP", "PUSH", "SMS", "WEBHOOK"]))
    .optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "CRITICAL", "URGENT"]).optional(),
  scheduledFor: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  context: z.record(z.any()).optional(),
});

const updatePreferencesSchema = z.object({
  globallyEnabled: z.boolean().optional(),
  channels: z
    .record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        schedule: z
          .object({
            allowedDays: z.array(z.string()),
            allowedHours: z.object({
              start: z.string(),
              end: z.string(),
            }),
            timezone: z.string(),
            respectQuietHours: z.boolean(),
            quietHours: z
              .object({
                start: z.string(),
                end: z.string(),
              })
              .optional(),
          })
          .optional(),
        frequency: z
          .object({
            maxPerHour: z.number(),
            maxPerDay: z.number(),
            maxPerWeek: z.number(),
            maxPerMonth: z.number(),
          })
          .optional(),
      }),
    )
    .optional(),
  categories: z
    .record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        channels: z.array(z.string()),
        priority: z.enum(["HIGH", "NORMAL", "LOW"]),
      }),
    )
    .optional(),
});

// Inicializar serviço
const notificationService = NotificationService.getInstance();

// Health check
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    const health = await notificationService.healthCheck();
    res.json({
      success: true,
      service: "notification",
      timestamp: new Date().toISOString(),
      ...health,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error.message,
      service: "notification",
    });
  }
};

// TEMPLATE MANAGEMENT

// Criar template
export const createTemplate: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  validateBody(createTemplateSchema),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const template = await notificationService.createTemplate(
        tenantId,
        req.body,
      );

      res.status(201).json({
        success: true,
        data: template,
        message: "Template criado com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Listar templates
export const getTemplates: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const templates = await notificationService.getTemplates(tenantId);

      res.json({
        success: true,
        data: templates,
        total: templates.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Obter template específico
export const getTemplate: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const templateId = req.params.templateId;

      const templateRepo =
        DatabaseConnection.getRepository(NotificationTemplate);
      const template = await templateRepo.findOne({
        where: { id: templateId, tenantId },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          error: "Template não encontrado",
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Atualizar template
export const updateTemplate: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  validateBody(createTemplateSchema.partial()),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const templateId = req.params.templateId;

      const template = await notificationService.updateTemplate(
        tenantId,
        templateId,
        req.body,
      );

      res.json({
        success: true,
        data: template,
        message: "Template atualizado com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Ativar/desativar template
export const toggleTemplate: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const templateId = req.params.templateId;
      const { active } = req.body;

      const templateRepo =
        DatabaseConnection.getRepository(NotificationTemplate);
      const template = await templateRepo.findOne({
        where: { id: templateId, tenantId },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          error: "Template não encontrado",
        });
      }

      template.status = active ? TemplateStatus.ACTIVE : TemplateStatus.DRAFT;
      await templateRepo.save(template);

      res.json({
        success: true,
        data: template,
        message: `Template ${active ? "ativado" : "desativado"} com sucesso`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Clonar template
export const cloneTemplate: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const templateId = req.params.templateId;
      const { name } = req.body;

      const templateRepo =
        DatabaseConnection.getRepository(NotificationTemplate);
      const originalTemplate = await templateRepo.findOne({
        where: { id: templateId, tenantId },
      });

      if (!originalTemplate) {
        return res.status(404).json({
          success: false,
          error: "Template não encontrado",
        });
      }

      const clonedData = originalTemplate.clone(
        name || `${originalTemplate.name} (Cópia)`,
      );
      const newTemplate = await notificationService.createTemplate(
        tenantId,
        clonedData,
      );

      res.status(201).json({
        success: true,
        data: newTemplate,
        message: "Template clonado com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// NOTIFICATION SENDING

// Enviar notificação única
export const sendNotification: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  validateBody(sendNotificationSchema),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const deliveryIds = await notificationService.sendNotification(
        tenantId,
        req.body,
      );

      res.status(201).json({
        success: true,
        data: { deliveryIds },
        message: `Notificação enfileirada para ${deliveryIds.length} canal(is)`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Envio em massa
export const sendBulkNotification: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  validateBody(bulkNotificationSchema),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const deliveryIds = await notificationService.sendBulkNotification(
        tenantId,
        req.body,
      );

      res.status(201).json({
        success: true,
        data: {
          deliveryIds,
          recipientCount: req.body.recipients.length,
          deliveryCount: deliveryIds.length,
        },
        message: `Notificação em massa enfileirada para ${req.body.recipients.length} destinatário(s)`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// DELIVERY TRACKING

// Listar deliveries
export const getDeliveries: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  validateQuery(
    z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
      status: z
        .enum([
          "QUEUED",
          "PROCESSING",
          "SENT",
          "DELIVERED",
          "FAILED",
          "CANCELLED",
          "RETRY",
        ])
        .optional(),
      channel: z
        .enum(["IN_APP", "EMAIL", "WHATSAPP", "PUSH", "SMS", "WEBHOOK"])
        .optional(),
      templateId: z.string().uuid().optional(),
      recipientId: z.string().uuid().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),
  ),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const {
        page,
        limit,
        status,
        channel,
        templateId,
        recipientId,
        startDate,
        endDate,
      } = req.query as any;

      const deliveryRepo =
        DatabaseConnection.getRepository(NotificationDelivery);
      let query = deliveryRepo
        .createQueryBuilder("delivery")
        .leftJoinAndSelect("delivery.template", "template")
        .leftJoinAndSelect("delivery.recipient", "recipient")
        .where("delivery.tenantId = :tenantId", { tenantId })
        .orderBy("delivery.createdAt", "DESC");

      if (status) {
        query = query.andWhere("delivery.status = :status", { status });
      }

      if (channel) {
        query = query.andWhere("delivery.channel = :channel", { channel });
      }

      if (templateId) {
        query = query.andWhere("delivery.templateId = :templateId", {
          templateId,
        });
      }

      if (recipientId) {
        query = query.andWhere("delivery.recipientId = :recipientId", {
          recipientId,
        });
      }

      if (startDate) {
        query = query.andWhere("delivery.createdAt >= :startDate", {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        query = query.andWhere("delivery.createdAt <= :endDate", {
          endDate: new Date(endDate),
        });
      }

      const [deliveries, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      res.json({
        success: true,
        data: deliveries.map((d) => d.getDeliveryReport()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Obter delivery específico
export const getDelivery: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const deliveryId = req.params.deliveryId;

      const deliveryRepo =
        DatabaseConnection.getRepository(NotificationDelivery);
      const delivery = await deliveryRepo.findOne({
        where: { id: deliveryId, tenantId },
        relations: ["template", "recipient"],
      });

      if (!delivery) {
        return res.status(404).json({
          success: false,
          error: "Delivery não encontrado",
        });
      }

      res.json({
        success: true,
        data: delivery.getDeliveryReport(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Cancelar delivery
export const cancelDelivery: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const deliveryId = req.params.deliveryId;
      const { reason } = req.body;

      const deliveryRepo =
        DatabaseConnection.getRepository(NotificationDelivery);
      const delivery = await deliveryRepo.findOne({
        where: { id: deliveryId, tenantId },
      });

      if (!delivery) {
        return res.status(404).json({
          success: false,
          error: "Delivery não encontrado",
        });
      }

      if (
        delivery.status === DeliveryStatus.SENT ||
        delivery.status === DeliveryStatus.DELIVERED
      ) {
        return res.status(400).json({
          success: false,
          error: "Não é possível cancelar delivery já enviado",
        });
      }

      delivery.markAsCancelled(
        reason || "Cancelado pelo usuário",
        req.user!.id,
      );
      await deliveryRepo.save(delivery);

      res.json({
        success: true,
        data: delivery.getDeliveryReport(),
        message: "Delivery cancelado com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// TRACKING ENDPOINTS

// Tracking de abertura (pixel)
export const trackOpen: RequestHandler = async (req, res) => {
  try {
    const deliveryId = req.params.deliveryId;

    const trackingData = {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date(),
    };

    await notificationService.trackOpen(deliveryId, trackingData);

    // Retornar pixel transparente 1x1
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.send(pixel);
  } catch (error) {
    // Ainda retornar pixel mesmo com erro
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    );
    res.set("Content-Type", "image/png");
    res.send(pixel);
  }
};

// Tracking de clique
export const trackClick: RequestHandler = async (req, res) => {
  try {
    const deliveryId = req.params.deliveryId;
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL é obrigatória",
      });
    }

    const trackingData = {
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date(),
    };

    await notificationService.trackClick(deliveryId, url, trackingData);

    // Redirecionar para URL original
    res.redirect(url);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// USER PREFERENCES

// Obter preferências do usuário
export const getUserPreferences: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.params.userId || req.user!.id;

      const preferences = await notificationService.getUserPreference(
        tenantId,
        userId,
      );

      if (!preferences) {
        // Criar preferências padrão
        const defaultPrefs = await notificationService.updateUserPreference(
          tenantId,
          userId,
          {},
        );
        return res.json({
          success: true,
          data: defaultPrefs.getPreferenceSummary(),
        });
      }

      res.json({
        success: true,
        data: preferences.getPreferenceSummary(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Atualizar preferências do usuário
export const updateUserPreferences: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  validateBody(updatePreferencesSchema),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.params.userId || req.user!.id;

      const preferences = await notificationService.updateUserPreference(
        tenantId,
        userId,
        req.body,
      );

      res.json({
        success: true,
        data: preferences.getPreferenceSummary(),
        message: "Preferências atualizadas com sucesso",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Unsubscribe
export const unsubscribe: RequestHandler = async (req, res) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token é obrigatório",
      });
    }

    // O token é o deliveryId
    const deliveryRepo = DatabaseConnection.getRepository(NotificationDelivery);
    const delivery = await deliveryRepo.findOne({
      where: { id: token },
      relations: ["recipient"],
    });

    if (!delivery || !delivery.recipientId) {
      return res.status(404).json({
        success: false,
        error: "Link de unsubscribe inválido",
      });
    }

    // Atualizar preferências para desabilitar marketing
    const preferenceRepo = DatabaseConnection.getRepository(
      NotificationPreference,
    );
    const preference = await preferenceRepo.findOne({
      where: {
        tenantId: delivery.tenantId,
        userId: delivery.recipientId,
        consentType: ConsentType.MARKETING,
      },
    });

    if (preference) {
      preference.withdrawConsent("Unsubscribe via email");
      await preferenceRepo.save(preference);
    }

    res.json({
      success: true,
      message: "Unsubscribe realizado com sucesso",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ANALYTICS & REPORTING

// Estatísticas de delivery
export const getDeliveryStats: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  validateQuery(
    z.object({
      templateId: z.string().uuid().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      groupBy: z.enum(["day", "week", "month"]).default("day"),
    }),
  ),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const { templateId, startDate, endDate } = req.query as any;

      const dateRange =
        startDate && endDate
          ? {
              start: new Date(startDate),
              end: new Date(endDate),
            }
          : undefined;

      const stats = await notificationService.getDeliveryStats(
        tenantId,
        templateId,
        dateRange,
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Eventos do sistema
export const getEvents: RequestHandler[] = [
  ...createAuthMiddleware({ requireAuth: true }),
  validateQuery(
    z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
      eventType: z.string().optional(),
      severity: z
        .enum(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"])
        .optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),
  ),
  async (req, res) => {
    try {
      const tenantId = req.user!.tenantId;
      const { page, limit, eventType, severity, startDate, endDate } =
        req.query as any;

      const eventRepo = DatabaseConnection.getRepository(NotificationEvent);
      let query = eventRepo
        .createQueryBuilder("event")
        .where("event.tenantId = :tenantId", { tenantId })
        .orderBy("event.createdAt", "DESC");

      if (eventType) {
        query = query.andWhere("event.eventType = :eventType", { eventType });
      }

      if (severity) {
        query = query.andWhere("event.severity = :severity", { severity });
      }

      if (startDate) {
        query = query.andWhere("event.createdAt >= :startDate", {
          startDate: new Date(startDate),
        });
      }

      if (endDate) {
        query = query.andWhere("event.createdAt <= :endDate", {
          endDate: new Date(endDate),
        });
      }

      const [events, total] = await query
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      res.json({
        success: true,
        data: events.map((e) => e.getEventSummary()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Montar rotas
router.get("/health", healthCheck);

// Templates
router.post("/templates", ...createTemplate);
router.get("/templates", ...getTemplates);
router.get("/templates/:templateId", ...getTemplate);
router.put("/templates/:templateId", ...updateTemplate);
router.patch("/templates/:templateId/toggle", ...toggleTemplate);
router.post("/templates/:templateId/clone", ...cloneTemplate);

// Sending
router.post("/send", ...sendNotification);
router.post("/send/bulk", ...sendBulkNotification);

// Deliveries
router.get("/deliveries", ...getDeliveries);
router.get("/deliveries/:deliveryId", ...getDelivery);
router.delete("/deliveries/:deliveryId", ...cancelDelivery);

// Tracking
router.get("/track/open/:deliveryId", trackOpen);
router.get("/track/click/:deliveryId", trackClick);

// Preferences
router.get("/preferences/:userId?", ...getUserPreferences);
router.put("/preferences/:userId?", ...updateUserPreferences);
router.get("/unsubscribe", unsubscribe);

// Analytics
router.get("/stats", ...getDeliveryStats);
router.get("/events", ...getEvents);

export default router;

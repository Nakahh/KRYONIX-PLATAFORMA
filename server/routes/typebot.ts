import { RequestHandler } from "express";
import { z } from "zod";
import { TypebotService } from "../services/typebot.js";
import { FlowType, FlowStatus } from "../entities/TypebotFlow.js";
import { SessionTrigger } from "../entities/TypebotSession.js";
import {
  getTemplateByType,
  getAllTemplates,
  getTemplatesByCategory,
} from "../templates/typebot-templates.js";

// Conditionally import auth middleware
let authenticateJWT: any = null;
let requirePermission: any = null;

try {
  const authMiddleware = require("../middleware/auth");
  authenticateJWT = authMiddleware.authenticateJWT;
  requirePermission = authMiddleware.requirePermission;
} catch (error) {
  console.log("⚠️  Auth middleware not loaded");
}

// Validation schemas
const CreateFlowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.nativeEnum(FlowType),
  nodes: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      data: z.any(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
    }),
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().optional(),
      targetHandle: z.string().optional(),
      type: z.string().optional(),
      label: z.string().optional(),
    }),
  ),
  variables: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      isPII: z.boolean(),
      description: z.string().optional(),
      defaultValue: z.string().optional(),
    }),
  ),
  settings: z.object({
    theme: z.any(),
    behavior: z.any(),
    security: z.any(),
    integrations: z.any(),
    analytics: z.any(),
  }),
});

const StartSessionSchema = z.object({
  trigger: z.nativeEnum(SessionTrigger),
  contactInfo: z
    .object({
      phone: z.string().optional(),
      name: z.string().optional(),
      instanceId: z.string().optional(),
    })
    .optional(),
  initialVariables: z.record(z.any()).optional(),
});

const ContinueSessionSchema = z.object({
  userInput: z.string(),
  sessionId: z.string(),
});

const UpdateFlowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  variables: z.array(z.any()).optional(),
  settings: z.any().optional(),
});

// Validation middleware
const validateBody = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      }
      next(error);
    }
  };
};

// Error handler
const handleTypebotError = (error: any, res: any) => {
  console.error("Typebot API error:", error);

  if (error.message.includes("not found")) {
    return res.status(404).json({
      error: error.message,
      code: "FLOW_NOT_FOUND",
    });
  }

  if (error.message.includes("limit")) {
    return res.status(400).json({
      error: error.message,
      code: "LIMIT_EXCEEDED",
    });
  }

  if (error.message.includes("invalid")) {
    return res.status(400).json({
      error: error.message,
      code: "INVALID_FLOW",
    });
  }

  return res.status(500).json({
    error: "Typebot service error",
    code: "TYPEBOT_SERVICE_ERROR",
  });
};

// Create authentication middleware that works even if auth is not loaded
const createAuthMiddleware = (permission?: string) => {
  const middlewares: RequestHandler[] = [];

  if (authenticateJWT) {
    middlewares.push(authenticateJWT);
  } else {
    // Fallback for demo purposes
    middlewares.push((req: any, res, next) => {
      req.user = {
        id: "demo-user-123",
        tenantId: "demo-tenant-123",
        role: "TENANT_ADMIN",
        hasPermission: () => true,
      };
      next();
    });
  }

  if (permission && requirePermission) {
    middlewares.push(requirePermission(permission));
  }

  return middlewares;
};

// Template Endpoints
export const getTemplates: RequestHandler[] = [
  ...createAuthMiddleware("typebot:read"),
  async (req: any, res) => {
    try {
      const { type, category } = req.query;

      if (type && Object.values(FlowType).includes(type)) {
        const template = getTemplateByType(type as FlowType);
        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }
        res.json({ template });
      } else if (category) {
        const templates = getTemplatesByCategory(category as any);
        res.json({ templates, total: templates.length });
      } else {
        const templates = getAllTemplates();
        res.json({ templates, total: templates.length });
      }
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const createFlowFromTemplate: RequestHandler[] = [
  ...createAuthMiddleware("typebot:create"),
  async (req: any, res) => {
    try {
      const { type } = req.params;
      const { name, customSettings } = req.body;

      if (!Object.values(FlowType).includes(type)) {
        return res.status(400).json({ error: "Invalid flow type" });
      }

      const template = getTemplateByType(type as FlowType);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Create flow from template
      const flowData = {
        ...template,
        name: name || template.name,
        settings: { ...template.settings, ...customSettings },
      };

      const flow = await TypebotService.createFlow(req.user.tenantId, flowData);

      res.status(201).json({
        id: flow.id,
        name: flow.name,
        type: flow.type,
        status: flow.status,
        isPublished: flow.isPublished,
        createdAt: flow.createdAt,
      });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

// Flow Management Endpoints
export const createFlow: RequestHandler[] = [
  ...createAuthMiddleware("typebot:create"),
  validateBody(CreateFlowSchema),
  async (req: any, res) => {
    try {
      const flow = await TypebotService.createFlow(req.user.tenantId, req.body);

      res.status(201).json({
        id: flow.id,
        name: flow.name,
        type: flow.type,
        status: flow.status,
        isPublished: flow.isPublished,
        publicUrl: flow.publicUrl,
        createdAt: flow.createdAt,
      });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const getFlows: RequestHandler[] = [
  ...createAuthMiddleware("typebot:read"),
  async (req: any, res) => {
    try {
      const flows = await TypebotService.getTenantFlows(req.user.tenantId);

      const response = flows.map((flow) => ({
        id: flow.id,
        name: flow.name,
        description: flow.description,
        type: flow.type,
        status: flow.status,
        isPublished: flow.isPublished,
        totalSessions: flow.totalSessions,
        completionRate: flow.completionRate,
        averageSessionDuration: flow.averageSessionDuration,
        lastUsedAt: flow.lastUsedAt,
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
      }));

      res.json({
        flows: response,
        total: response.length,
      });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const getFlow: RequestHandler[] = [
  ...createAuthMiddleware("typebot:read"),
  async (req: any, res) => {
    try {
      const { flowId } = req.params;
      const flow = await TypebotService.getFlowById(flowId, req.user.tenantId);

      if (!flow) {
        return res.status(404).json({ error: "Flow not found" });
      }

      res.json({
        id: flow.id,
        name: flow.name,
        description: flow.description,
        type: flow.type,
        status: flow.status,
        isPublished: flow.isPublished,
        nodes: flow.nodes,
        edges: flow.edges,
        variables: flow.variables,
        settings: flow.settings,
        publicUrl: flow.publicUrl,
        totalSessions: flow.totalSessions,
        completedSessions: flow.completedSessions,
        completionRate: flow.completionRate,
        averageSessionDuration: flow.averageSessionDuration,
        lastUsedAt: flow.lastUsedAt,
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
      });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const updateFlow: RequestHandler[] = [
  ...createAuthMiddleware("typebot:update"),
  validateBody(UpdateFlowSchema),
  async (req: any, res) => {
    try {
      const { flowId } = req.params;
      // TODO: Implement flow update logic
      res.status(501).json({ error: "Update flow not implemented yet" });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const publishFlow: RequestHandler[] = [
  ...createAuthMiddleware("typebot:publish"),
  async (req: any, res) => {
    try {
      const { flowId } = req.params;
      const flow = await TypebotService.publishFlow(flowId, req.user.tenantId);

      res.json({
        id: flow.id,
        status: flow.status,
        isPublished: flow.isPublished,
        publicUrl: flow.publicUrl,
        message: "Flow published successfully",
      });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const unpublishFlow: RequestHandler[] = [
  ...createAuthMiddleware("typebot:publish"),
  async (req: any, res) => {
    try {
      const { flowId } = req.params;
      const flow = await TypebotService.unpublishFlow(
        flowId,
        req.user.tenantId,
      );

      res.json({
        id: flow.id,
        status: flow.status,
        isPublished: flow.isPublished,
        message: "Flow unpublished successfully",
      });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const deleteFlow: RequestHandler[] = [
  ...createAuthMiddleware("typebot:delete"),
  async (req: any, res) => {
    try {
      const { flowId } = req.params;
      // TODO: Implement flow deletion
      res.status(501).json({ error: "Delete flow not implemented yet" });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

// Session Management Endpoints
export const startSession: RequestHandler[] = [
  ...createAuthMiddleware("typebot:use"),
  validateBody(StartSessionSchema),
  async (req: any, res) => {
    try {
      const { flowId } = req.params;
      const { trigger, contactInfo, initialVariables } = req.body;

      const session = await TypebotService.createSession(
        flowId,
        req.user.tenantId,
        trigger,
        contactInfo,
        initialVariables,
      );

      res.status(201).json({
        sessionId: session.id,
        status: session.status,
        currentNodeId: session.context.currentNodeId,
        isWaitingForInput: session.context.isWaitingForInput,
        createdAt: session.createdAt,
      });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const continueSession: RequestHandler[] = [
  validateBody(ContinueSessionSchema),
  async (req: any, res) => {
    try {
      const { userInput, sessionId } = req.body;

      // Extract tenant ID from session or use demo
      const tenantId = req.user?.tenantId || "demo-tenant-123";

      const result = await TypebotService.continueSession(
        sessionId,
        userInput,
        tenantId,
      );

      res.json({
        sessionId: result.session.id,
        status: result.session.status,
        isCompleted: result.session.isCompleted,
        responses: result.responses,
        variables: result.session.variables,
        context: {
          currentNodeId: result.session.context.currentNodeId,
          isWaitingForInput: result.session.context.isWaitingForInput,
          messageCount: result.session.context.messageCount,
        },
      });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const getSession: RequestHandler[] = [
  ...createAuthMiddleware("typebot:read"),
  async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const session = await TypebotService.getSessionById(
        sessionId,
        req.user.tenantId,
      );

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session.export());
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const getFlowSessions: RequestHandler[] = [
  ...createAuthMiddleware("typebot:read"),
  async (req: any, res) => {
    try {
      const { flowId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      // TODO: Implement session listing for flow
      res.status(501).json({ error: "Get flow sessions not implemented yet" });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

// WhatsApp Integration Endpoints
export const processWhatsAppMessage: RequestHandler = async (req, res) => {
  try {
    const { tenantId, flowId } = req.params;
    const messageData = req.body;

    console.log(
      `Processing WhatsApp message for tenant: ${tenantId}, flow: ${flowId}`,
    );

    // TODO: Integrate with WhatsApp service to process incoming messages
    // This would create a session and process the message through the flow

    res.status(200).json({
      received: true,
      processed: true,
    });
  } catch (error) {
    console.error("WhatsApp message processing error:", error);
    res.status(500).json({ error: "Message processing failed" });
  }
};

// Webhook Endpoint (no authentication required)
export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const { tenantId, flowId } = req.params;
    const payload = req.body;

    console.log(
      `Typebot webhook received for tenant: ${tenantId}, flow: ${flowId}`,
    );

    // TODO: Process webhook payload
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Typebot webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// Analytics Endpoints
export const getFlowAnalytics: RequestHandler[] = [
  ...createAuthMiddleware("typebot:read"),
  async (req: any, res) => {
    try {
      const { flowId } = req.params;
      const flow = await TypebotService.getFlowById(flowId, req.user.tenantId);

      if (!flow) {
        return res.status(404).json({ error: "Flow not found" });
      }

      const analytics = {
        totalSessions: flow.totalSessions,
        completedSessions: flow.completedSessions,
        completionRate: flow.completionRate,
        averageSessionDuration: flow.averageSessionDuration,
        conversionRate: flow.conversionRate,
        lastUsedAt: flow.lastUsedAt,
        performance: {
          sessionsToday: 0, // TODO: Calculate
          sessionsThisWeek: 0, // TODO: Calculate
          sessionsThisMonth: 0, // TODO: Calculate
          averageResponseTime: 0, // TODO: Calculate
        },
        topExitPoints: [], // TODO: Calculate
        variableCollection: [], // TODO: Calculate
      };

      res.json(analytics);
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

export const getTenantAnalytics: RequestHandler[] = [
  ...createAuthMiddleware("typebot:read"),
  async (req: any, res) => {
    try {
      const flows = await TypebotService.getTenantFlows(req.user.tenantId);

      const analytics = {
        totalFlows: flows.length,
        publishedFlows: flows.filter((f) => f.isPublished).length,
        totalSessions: flows.reduce((sum, f) => sum + f.totalSessions, 0),
        totalCompletedSessions: flows.reduce(
          (sum, f) => sum + f.completedSessions,
          0,
        ),
        averageCompletionRate:
          flows.length > 0
            ? flows.reduce((sum, f) => sum + f.completionRate, 0) / flows.length
            : 0,
        flowsByType: flows.reduce(
          (acc, f) => {
            acc[f.type] = (acc[f.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        recentActivity: flows
          .filter((f) => f.lastUsedAt)
          .sort((a, b) => b.lastUsedAt!.getTime() - a.lastUsedAt!.getTime())
          .slice(0, 5)
          .map((f) => ({
            flowId: f.id,
            name: f.name,
            type: f.type,
            lastUsedAt: f.lastUsedAt,
            completionRate: f.completionRate,
          })),
      };

      res.json(analytics);
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

// Health Check Endpoint
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    const health = await TypebotService.healthCheck();

    res.json({
      status: health.status,
      timestamp: new Date().toISOString(),
      external: health.external,
      version: health.version,
      templates: {
        available: getAllTemplates().length,
        types: Object.values(FlowType),
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Export Flow
export const exportFlow: RequestHandler[] = [
  ...createAuthMiddleware("typebot:read"),
  async (req: any, res) => {
    try {
      const { flowId } = req.params;
      const flow = await TypebotService.getFlowById(flowId, req.user.tenantId);

      if (!flow) {
        return res.status(404).json({ error: "Flow not found" });
      }

      const exported = flow.export();

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${flow.name}.json"`,
      );
      res.json(exported);
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

// Import Flow
export const importFlow: RequestHandler[] = [
  ...createAuthMiddleware("typebot:create"),
  async (req: any, res) => {
    try {
      const flowData = req.body;

      // TODO: Implement flow import logic
      res.status(501).json({ error: "Import flow not implemented yet" });
    } catch (error) {
      handleTypebotError(error, res);
    }
  },
];

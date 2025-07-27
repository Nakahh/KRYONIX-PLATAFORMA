import { RequestHandler } from "express";
import { z } from "zod";
import { N8NService } from "../services/n8n.js";
import { WorkflowType } from "../entities/WorkflowTemplate.js";
import {
  getTemplateByType,
  getAllTemplates,
} from "../templates/workflow-templates.js";

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
const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.nativeEnum(WorkflowType),
  trigger: z.object({
    type: z.enum([
      "webhook",
      "schedule",
      "whatsapp_message",
      "manual",
      "api_call",
    ]),
    config: z.any(),
  }),
  definition: z.object({
    nodes: z.array(z.any()),
    connections: z.any(),
    settings: z.any().optional(),
  }),
  settings: z.object({
    maxExecutionsPerHour: z.number().min(1).max(1000),
    maxExecutionsPerDay: z.number().min(1).max(10000),
    retrySettings: z.object({
      enabled: z.boolean(),
      maxRetries: z.number().min(0).max(10),
      retryDelay: z.number().min(1000).max(300000),
    }),
    notificationSettings: z.object({
      onSuccess: z.boolean(),
      onFailure: z.boolean(),
      notifyEmails: z.array(z.string().email()),
    }),
    timeoutSettings: z.object({
      enabled: z.boolean(),
      timeoutMinutes: z.number().min(1).max(120),
    }),
  }),
});

const ExecuteWorkflowSchema = z.object({
  inputData: z.any().optional(),
  context: z.any().optional(),
});

const CloneWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
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
const handleN8NError = (error: any, res: any) => {
  console.error("N8N API error:", error);

  if (error.message.includes("not found")) {
    return res.status(404).json({
      error: error.message,
      code: "WORKFLOW_NOT_FOUND",
    });
  }

  if (error.message.includes("limit exceeded")) {
    return res.status(400).json({
      error: error.message,
      code: "EXECUTION_LIMIT_EXCEEDED",
    });
  }

  if (error.message.includes("cannot be executed")) {
    return res.status(400).json({
      error: error.message,
      code: "WORKFLOW_NOT_EXECUTABLE",
    });
  }

  return res.status(500).json({
    error: "N8N service error",
    code: "N8N_SERVICE_ERROR",
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
export const getWorkflowTemplates: RequestHandler[] = [
  ...createAuthMiddleware("workflows:read"),
  async (req: any, res) => {
    try {
      const { type } = req.query;

      if (type && Object.values(WorkflowType).includes(type)) {
        const template = getTemplateByType(type as WorkflowType);
        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }
        res.json({ template });
      } else {
        const templates = getAllTemplates();
        res.json({ templates, total: templates.length });
      }
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

export const createWorkflowFromTemplate: RequestHandler[] = [
  ...createAuthMiddleware("workflows:create"),
  async (req: any, res) => {
    try {
      const { type } = req.params;
      const { name, customSettings } = req.body;

      if (!Object.values(WorkflowType).includes(type)) {
        return res.status(400).json({ error: "Invalid workflow type" });
      }

      const template = getTemplateByType(type as WorkflowType);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      // Create workflow from template
      const workflowData = {
        ...template,
        name: name || template.name,
        settings: { ...template.settings, ...customSettings },
      };

      const workflow = await N8NService.createWorkflowTemplate(
        req.user.tenantId,
        workflowData,
      );

      res.status(201).json({
        id: workflow.id,
        name: workflow.name,
        type: workflow.type,
        status: workflow.status,
        createdAt: workflow.createdAt,
      });
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

// Workflow Management Endpoints
export const createWorkflow: RequestHandler[] = [
  ...createAuthMiddleware("workflows:create"),
  validateBody(CreateWorkflowSchema),
  async (req: any, res) => {
    try {
      const workflow = await N8NService.createWorkflowTemplate(
        req.user.tenantId,
        req.body,
      );

      res.status(201).json({
        id: workflow.id,
        name: workflow.name,
        type: workflow.type,
        status: workflow.status,
        isActive: workflow.isActive,
        createdAt: workflow.createdAt,
      });
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

export const getWorkflows: RequestHandler[] = [
  ...createAuthMiddleware("workflows:read"),
  async (req: any, res) => {
    try {
      const workflows = await N8NService.getTenantWorkflows(req.user.tenantId);

      const response = workflows.map((workflow) => ({
        id: workflow.id,
        name: workflow.name,
        type: workflow.type,
        status: workflow.status,
        isActive: workflow.isActive,
        executionCount: workflow.executionCount,
        successRate: workflow.successRate,
        lastExecutedAt: workflow.lastExecutedAt,
        createdAt: workflow.createdAt,
      }));

      res.json({
        workflows: response,
        total: response.length,
      });
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

export const getWorkflow: RequestHandler[] = [
  ...createAuthMiddleware("workflows:read"),
  async (req: any, res) => {
    try {
      const { workflowId } = req.params;
      const workflows = await N8NService.getTenantWorkflows(req.user.tenantId);
      const workflow = workflows.find((w) => w.id === workflowId);

      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      res.json({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        type: workflow.type,
        status: workflow.status,
        isActive: workflow.isActive,
        trigger: workflow.trigger,
        definition: workflow.definition,
        settings: workflow.settings,
        executionCount: workflow.executionCount,
        successCount: workflow.successCount,
        failureCount: workflow.failureCount,
        successRate: workflow.successRate,
        lastExecutedAt: workflow.lastExecutedAt,
        lastError: workflow.lastError,
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
      });
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

export const activateWorkflow: RequestHandler[] = [
  ...createAuthMiddleware("workflows:update"),
  async (req: any, res) => {
    try {
      const { workflowId } = req.params;
      const workflow = await N8NService.activateWorkflow(
        workflowId,
        req.user.tenantId,
      );

      res.json({
        id: workflow.id,
        status: workflow.status,
        isActive: workflow.isActive,
        message: "Workflow activated successfully",
      });
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

export const deactivateWorkflow: RequestHandler[] = [
  ...createAuthMiddleware("workflows:update"),
  async (req: any, res) => {
    try {
      const { workflowId } = req.params;
      const workflow = await N8NService.deactivateWorkflow(
        workflowId,
        req.user.tenantId,
      );

      res.json({
        id: workflow.id,
        status: workflow.status,
        isActive: workflow.isActive,
        message: "Workflow deactivated successfully",
      });
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

export const cloneWorkflow: RequestHandler[] = [
  ...createAuthMiddleware("workflows:create"),
  validateBody(CloneWorkflowSchema),
  async (req: any, res) => {
    try {
      const { workflowId } = req.params;
      const { name } = req.body;

      const clonedWorkflow = await N8NService.cloneWorkflowTemplate(
        workflowId,
        req.user.tenantId,
        name,
      );

      res.status(201).json({
        id: clonedWorkflow.id,
        name: clonedWorkflow.name,
        type: clonedWorkflow.type,
        status: clonedWorkflow.status,
        createdAt: clonedWorkflow.createdAt,
        message: "Workflow cloned successfully",
      });
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

// Execution Endpoints
export const executeWorkflow: RequestHandler[] = [
  ...createAuthMiddleware("workflows:execute"),
  validateBody(ExecuteWorkflowSchema),
  async (req: any, res) => {
    try {
      const { workflowId } = req.params;
      const { inputData, context } = req.body;

      const execution = await N8NService.executeWorkflow(
        workflowId,
        req.user.tenantId,
        inputData,
        context,
      );

      res.status(201).json({
        executionId: execution.id,
        status: execution.status,
        startedAt: execution.startedAt,
        message: "Workflow execution started",
      });
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

export const getWorkflowExecutions: RequestHandler[] = [
  ...createAuthMiddleware("workflows:read"),
  async (req: any, res) => {
    try {
      const { workflowId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const executions = await N8NService.getWorkflowExecutions(
        workflowId,
        req.user.tenantId,
        limit,
      );

      const response = executions.map((execution) => execution.export());

      res.json({
        executions: response,
        total: response.length,
      });
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

export const getExecution: RequestHandler[] = [
  ...createAuthMiddleware("workflows:read"),
  async (req: any, res) => {
    try {
      const { executionId } = req.params;
      const execution = await N8NService.getExecutionById(
        executionId,
        req.user.tenantId,
      );

      if (!execution) {
        return res.status(404).json({ error: "Execution not found" });
      }

      res.json(execution.export());
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

// Webhook Endpoint (no authentication required)
export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const { tenantId, workflowId } = req.params;
    const payload = req.body;

    console.log(
      `N8N Webhook received for tenant: ${tenantId}, workflow: ${workflowId}`,
    );

    const execution = await N8NService.processWebhook(
      tenantId,
      workflowId,
      payload,
    );

    res.status(200).json({
      received: true,
      executionId: execution.id,
      status: execution.status,
    });
  } catch (error) {
    console.error("N8N Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// Health Check Endpoint
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    const health = await N8NService.healthCheck();

    res.json({
      status: health.status,
      timestamp: new Date().toISOString(),
      n8n: {
        connected: health.n8nConnected,
        version: health.version,
      },
      templates: {
        available: getAllTemplates().length,
        types: Object.values(WorkflowType),
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

// Analytics Endpoints
export const getWorkflowAnalytics: RequestHandler[] = [
  ...createAuthMiddleware("workflows:read"),
  async (req: any, res) => {
    try {
      const workflows = await N8NService.getTenantWorkflows(req.user.tenantId);

      const analytics = {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter((w) => w.isActive).length,
        totalExecutions: workflows.reduce(
          (sum, w) => sum + w.executionCount,
          0,
        ),
        totalSuccesses: workflows.reduce((sum, w) => sum + w.successCount, 0),
        totalFailures: workflows.reduce((sum, w) => sum + w.failureCount, 0),
        averageSuccessRate:
          workflows.length > 0
            ? workflows.reduce((sum, w) => sum + w.successRate, 0) /
              workflows.length
            : 0,
        workflowsByType: workflows.reduce(
          (acc, w) => {
            acc[w.type] = (acc[w.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
        recentActivity: workflows
          .filter((w) => w.lastExecutedAt)
          .sort(
            (a, b) => b.lastExecutedAt!.getTime() - a.lastExecutedAt!.getTime(),
          )
          .slice(0, 10)
          .map((w) => ({
            workflowId: w.id,
            name: w.name,
            type: w.type,
            lastExecutedAt: w.lastExecutedAt,
            successRate: w.successRate,
          })),
      };

      res.json(analytics);
    } catch (error) {
      handleN8NError(error, res);
    }
  },
];

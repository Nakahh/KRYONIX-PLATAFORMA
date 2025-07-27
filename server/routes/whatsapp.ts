import { RequestHandler } from "express";
import { z } from "zod";
import { WhatsAppService } from "../services/whatsapp.js";
import { authenticateJWT, requirePermission } from "../middleware/auth.js";
import { InstanceType } from "../entities/WhatsAppInstance.js";

// Validation schemas
const CreateInstanceSchema = z.object({
  name: z.string().min(1).max(255),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  type: z.nativeEnum(InstanceType).default(InstanceType.EVOLUTION),
  serverUrl: z.string().url().optional(),
  apiToken: z.string().min(1).optional(),
  webhookUrl: z.string().url().optional(),
});

const SendMessageSchema = z
  .object({
    contactPhone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    text: z.string().optional(),
    mediaUrl: z.string().url().optional(),
    mediaType: z.enum(["image", "video", "audio", "document"]).optional(),
    caption: z.string().optional(),
    filename: z.string().optional(),
  })
  .refine((data) => data.text || data.mediaUrl, {
    message: "Either text or mediaUrl must be provided",
  });

const UpdateInstanceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  webhookUrl: z.string().url().optional(),
  config: z
    .object({
      autoReply: z.boolean().optional(),
      features: z
        .object({
          readReceipts: z.boolean().optional(),
          typing: z.boolean().optional(),
          presence: z.boolean().optional(),
          groupsEnabled: z.boolean().optional(),
          mediaEnabled: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
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
const handleWhatsAppError = (error: any, res: any) => {
  console.error("WhatsApp API error:", error);

  if (error.message.includes("not found")) {
    return res.status(404).json({
      error: error.message,
      code: "INSTANCE_NOT_FOUND",
    });
  }

  if (error.message.includes("limit exceeded")) {
    return res.status(400).json({
      error: error.message,
      code: "LIMIT_EXCEEDED",
    });
  }

  if (error.message.includes("cannot send messages")) {
    return res.status(400).json({
      error: error.message,
      code: "INSTANCE_NOT_READY",
    });
  }

  return res.status(500).json({
    error: "WhatsApp service error",
    code: "WHATSAPP_SERVICE_ERROR",
  });
};

// Instance Management Endpoints
export const createInstance: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:create"),
  validateBody(CreateInstanceSchema),
  async (req: any, res) => {
    try {
      const instance = await WhatsAppService.createInstance(req.user.tenantId, {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        type: req.body.type,
        serverUrl: req.body.serverUrl || process.env.EVOLUTION_API_URL,
        apiToken: req.body.apiToken || process.env.EVOLUTION_API_KEY,
        webhookUrl: req.body.webhookUrl,
      });

      res.status(201).json({
        id: instance.id,
        name: instance.name,
        phoneNumber: instance.phoneNumber,
        type: instance.type,
        status: instance.status,
        needsQRCode: instance.needsQRCode,
        createdAt: instance.createdAt,
      });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

export const getInstances: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:read"),
  async (req: any, res) => {
    try {
      const instances = await WhatsAppService.getTenantInstances(
        req.user.tenantId,
      );

      const response = instances.map((instance) => ({
        id: instance.id,
        name: instance.name,
        phoneNumber: instance.phoneNumber,
        type: instance.type,
        status: instance.status,
        isConnected: instance.isConnected,
        needsQRCode: instance.needsQRCode,
        stats: instance.stats,
        createdAt: instance.createdAt,
        lastConnectedAt: instance.lastConnectedAt,
      }));

      res.json({
        instances: response,
        total: response.length,
      });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

export const getInstance: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:read"),
  async (req: any, res) => {
    try {
      const { instanceId } = req.params;
      const instance = await WhatsAppService.getInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({ error: "Instance not found" });
      }

      // Check tenant access
      if (instance.tenantId !== req.user.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json({
        id: instance.id,
        name: instance.name,
        phoneNumber: instance.phoneNumber,
        type: instance.type,
        status: instance.status,
        isConnected: instance.isConnected,
        needsQRCode: instance.needsQRCode,
        config: instance.config,
        stats: instance.stats,
        createdAt: instance.createdAt,
        lastConnectedAt: instance.lastConnectedAt,
        lastDisconnectedAt: instance.lastDisconnectedAt,
      });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

export const getQRCode: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:read"),
  async (req: any, res) => {
    try {
      const { instanceId } = req.params;
      const instance = await WhatsAppService.getInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({ error: "Instance not found" });
      }

      if (instance.tenantId !== req.user.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const qrCode = await WhatsAppService.getQRCode(instanceId);

      if (!qrCode) {
        return res.status(400).json({
          error: "QR code not available. Instance may already be connected.",
        });
      }

      res.json({
        qrCode,
        expires: instance.qrCodeExpires,
      });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

export const updateInstance: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:update"),
  validateBody(UpdateInstanceSchema),
  async (req: any, res) => {
    try {
      const { instanceId } = req.params;
      // TODO: Implement instance update logic
      res.status(501).json({ error: "Update instance not implemented yet" });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

export const deleteInstance: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:delete"),
  async (req: any, res) => {
    try {
      const { instanceId } = req.params;
      const instance = await WhatsAppService.getInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({ error: "Instance not found" });
      }

      if (instance.tenantId !== req.user.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await WhatsAppService.deleteInstance(instanceId);

      res.json({ message: "Instance deleted successfully" });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

// Message Endpoints
export const sendMessage: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:send"),
  validateBody(SendMessageSchema),
  async (req: any, res) => {
    try {
      const { instanceId } = req.params;
      const instance = await WhatsAppService.getInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({ error: "Instance not found" });
      }

      if (instance.tenantId !== req.user.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const message = await WhatsAppService.sendMessage(
        instanceId,
        req.body.contactPhone,
        {
          text: req.body.text,
          mediaUrl: req.body.mediaUrl,
          mediaType: req.body.mediaType,
          caption: req.body.caption,
          filename: req.body.filename,
        },
      );

      res.status(201).json({
        id: message.id,
        status: message.status,
        type: message.type,
        contactPhone: message.contactPhone,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

export const getMessages: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:read"),
  async (req: any, res) => {
    try {
      const { instanceId } = req.params;
      const instance = await WhatsAppService.getInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({ error: "Instance not found" });
      }

      if (instance.tenantId !== req.user.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // TODO: Implement message listing with pagination and filters
      res.status(501).json({ error: "Get messages not implemented yet" });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

// Webhook Endpoint (no authentication required)
export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const { tenantId, instanceId } = req.params;
    const payload = req.body;

    console.log(
      `Webhook received for tenant: ${tenantId}, instance: ${instanceId}`,
    );

    await WhatsAppService.processWebhook(tenantId, instanceId, payload);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

// Status and Health Endpoints
export const getInstanceStatus: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:read"),
  async (req: any, res) => {
    try {
      const { instanceId } = req.params;
      const instance = await WhatsAppService.getInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({ error: "Instance not found" });
      }

      if (instance.tenantId !== req.user.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json({
        id: instance.id,
        status: instance.status,
        isConnected: instance.isConnected,
        needsQRCode: instance.needsQRCode,
        lastConnectedAt: instance.lastConnectedAt,
        lastDisconnectedAt: instance.lastDisconnectedAt,
        lastError: instance.lastError,
        stats: instance.stats,
        rateLimits: instance.getRemainingRateLimit(),
      });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

export const disconnectInstance: RequestHandler[] = [
  authenticateJWT,
  requirePermission("whatsapp:update"),
  async (req: any, res) => {
    try {
      const { instanceId } = req.params;
      const instance = await WhatsAppService.getInstanceById(instanceId);

      if (!instance) {
        return res.status(404).json({ error: "Instance not found" });
      }

      if (instance.tenantId !== req.user.tenantId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await WhatsAppService.disconnectInstance(instanceId);

      res.json({ message: "Instance disconnected successfully" });
    } catch (error) {
      handleWhatsAppError(error, res);
    }
  },
];

// Health check endpoint
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      features: {
        evolution_api: !!process.env.EVOLUTION_API_URL,
        official_api: !!process.env.WHATSAPP_BUSINESS_API_URL,
        webhooks: true,
        media_support: true,
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

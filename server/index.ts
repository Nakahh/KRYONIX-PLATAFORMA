import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { initializePassport } from "./config/passport";
import {
  cacheMiddleware,
  apiCache,
  userCache,
  analyticsCache,
  whatsappCache,
  cacheWarmingMiddleware,
  compressionMiddleware,
  getCacheStats,
  clearAllCache,
  invalidateCache,
} from "./middleware/cache";
import {
  authRateLimit,
  apiRateLimit,
  whatsappRateLimit,
  billingRateLimit,
  suspiciousIPMiddleware,
  suspiciousUserAgentMiddleware,
  securityAuditMiddleware,
  autoBlockMiddleware,
  getSecurityStats,
} from "./middleware/security";

import { handleDemo } from "./routes/demo";
import * as billingRoutes from "./routes/billing";
import whiteLabelRoutes from "./routes/white-label";
import enterpriseRoutes from "./routes/enterprise";

// Conditionally import database-related modules only in server mode
let whatsappRoutes: any = null;
let n8nRoutes: any = null;
let typebotRoutes: any = null;
let aiRoutes: any = null;
let mauticRoutes: any = null;
let notificationRoutes: any = null;
let authRoutes: any = null;
let authAdvancedRoutes: any = null;
let stackConfigRoutes: any = null;
let initializeDatabase: any = null;
let checkDatabaseHealth: any = null;

// Only load database modules if we're not in Vite build mode
if (process.env.NODE_ENV !== "test" && typeof window === "undefined") {
  try {
    whatsappRoutes = require("./routes/whatsapp");
    n8nRoutes = require("./routes/n8n");
    typebotRoutes = require("./routes/typebot");
    aiRoutes = require("./routes/ai");
    mauticRoutes = require("./routes/mautic");
    notificationRoutes = require("./routes/notifications");
    authRoutes = require("./routes/auth");
    authAdvancedRoutes = require("./routes/auth-advanced");
    stackConfigRoutes = require("./routes/stack-config");
    const dbConnection = require("./db/connection");
    initializeDatabase = dbConnection.initializeDatabase;
    checkDatabaseHealth = dbConnection.checkDatabaseHealth;
  } catch (error) {
    console.log("⚠️  Database modules not loaded (likely in build mode)");
  }
}

export function createServer() {
  const app = express();

  // Security and logging middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable for development
      crossOriginEmbedderPolicy: false,
    }),
  );

  app.use(compression());

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
  }

  // CORS configuration
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? [process.env.FRONTEND_URL]
          : [
              "http://localhost:3000",
              "http://localhost:5173",
              "http://localhost:8080",
            ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );

  // Cookie parser for auth tokens
  app.use(cookieParser());

  // Express session for OAuth
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "kryonix-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
      },
    }),
  );

  // Initialize Passport with advanced configuration
  initializePassport(app);

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
      error: "Too many requests from this IP, please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", limiter);

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Security middlewares
  app.use(suspiciousIPMiddleware());
  app.use(suspiciousUserAgentMiddleware());
  app.use(securityAuditMiddleware());
  app.use(autoBlockMiddleware());

  // Cache warming middleware
  app.use(cacheWarmingMiddleware());

  // Compression middleware
  app.use(compressionMiddleware());

  // Raw body for webhooks
  app.use("/api/billing/webhook", express.raw({ type: "application/json" }));
  app.use("/api/webhooks/whatsapp/:tenantId/:instanceId", express.json());

  // Health check endpoints
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "KRYONIX API is running! ��";
    res.json({ message: ping });
  });

  // Cache management endpoints
  app.get("/api/cache/stats", async (_req, res) => {
    try {
      const stats = await getCacheStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get cache stats" });
    }
  });

  app.post("/api/cache/clear", async (_req, res) => {
    try {
      await clearAllCache();
      res.json({ message: "Cache cleared successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cache" });
    }
  });

  app.post("/api/cache/invalidate/:pattern", async (req, res) => {
    try {
      await invalidateCache(req.params.pattern);
      res.json({
        message: `Cache invalidated for pattern: ${req.params.pattern}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to invalidate cache" });
    }
  });

  // Security management endpoints
  app.get("/api/security/stats", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const stats = await getSecurityStats(days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get security stats" });
    }
  });

  app.get("/api/health", async (_req, res) => {
    try {
      let dbHealth = { status: "not_available", database: false, redis: false };

      if (checkDatabaseHealth) {
        dbHealth = await checkDatabaseHealth();
      }

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        database: dbHealth,
        modules: {
          billing: "active",
          whatsapp: whatsappRoutes ? "active" : "not_loaded",
          n8n_workflows: n8nRoutes ? "active" : "not_loaded",
          typebot_chatbots: typebotRoutes ? "active" : "not_loaded",
          ai_services: aiRoutes ? "active" : "not_loaded",
          mautic_marketing: mauticRoutes ? "active" : "not_loaded",
          notifications: notificationRoutes ? "active" : "not_loaded",
          authentication: authRoutes ? "active" : "not_loaded",
        },
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Authentication routes (no versioning) with rate limiting
  if (authRoutes) {
    app.use("/api/auth", authRateLimit, authRoutes.default);
  }
  if (authAdvancedRoutes) {
    app.use("/api/v1/auth", authRateLimit, authAdvancedRoutes.default);
  }

  // API v1 routes
  const v1Router = express.Router();

  // Billing API routes (com cache)
  v1Router.get("/billing/health", billingRoutes.healthCheck);
  v1Router.get("/billing/plans", apiCache, billingRoutes.getPlans);
  v1Router.get("/billing/plans/:planId", apiCache, billingRoutes.getPlan);

  v1Router.post("/billing/subscriptions", ...billingRoutes.createSubscription);
  v1Router.get(
    "/billing/subscription",
    userCache,
    ...billingRoutes.getSubscription,
  );
  v1Router.put("/billing/subscription", ...billingRoutes.updateSubscription);
  v1Router.delete("/billing/subscription", ...billingRoutes.cancelSubscription);

  v1Router.get("/billing/usage", analyticsCache, ...billingRoutes.getUsage);
  v1Router.put("/billing/usage", ...billingRoutes.updateUsage);

  v1Router.post(
    "/billing/payment-methods",
    ...billingRoutes.createPaymentMethod,
  );
  v1Router.post("/billing/portal", ...billingRoutes.createBillingPortal);

  v1Router.post("/billing/webhook", billingRoutes.handleWebhook);

  // White Label API routes
  v1Router.use("/white-label", whiteLabelRoutes);

  // Enterprise API routes
  v1Router.use("/enterprise", enterpriseRoutes);

  // WhatsApp API routes (only if loaded)
  if (whatsappRoutes) {
    v1Router.get("/whatsapp/health", whatsappRoutes.healthCheck);
    v1Router.post("/whatsapp/instances", ...whatsappRoutes.createInstance);
    v1Router.get("/whatsapp/instances", ...whatsappRoutes.getInstances);
    v1Router.get(
      "/whatsapp/instances/:instanceId",
      ...whatsappRoutes.getInstance,
    );
    v1Router.put(
      "/whatsapp/instances/:instanceId",
      ...whatsappRoutes.updateInstance,
    );
    v1Router.delete(
      "/whatsapp/instances/:instanceId",
      ...whatsappRoutes.deleteInstance,
    );

    v1Router.get(
      "/whatsapp/instances/:instanceId/qrcode",
      ...whatsappRoutes.getQRCode,
    );
    v1Router.get(
      "/whatsapp/instances/:instanceId/status",
      ...whatsappRoutes.getInstanceStatus,
    );
    v1Router.post(
      "/whatsapp/instances/:instanceId/disconnect",
      ...whatsappRoutes.disconnectInstance,
    );

    v1Router.post(
      "/whatsapp/instances/:instanceId/messages",
      ...whatsappRoutes.sendMessage,
    );
    v1Router.get(
      "/whatsapp/instances/:instanceId/messages",
      ...whatsappRoutes.getMessages,
    );
  }

  // N8N Workflow API routes (only if loaded)
  if (n8nRoutes) {
    v1Router.get("/workflows/health", n8nRoutes.healthCheck);
    v1Router.get("/workflows/templates", ...n8nRoutes.getWorkflowTemplates);
    v1Router.post(
      "/workflows/templates/:type",
      ...n8nRoutes.createWorkflowFromTemplate,
    );

    v1Router.post("/workflows", ...n8nRoutes.createWorkflow);
    v1Router.get("/workflows", ...n8nRoutes.getWorkflows);
    v1Router.get("/workflows/analytics", ...n8nRoutes.getWorkflowAnalytics);
    v1Router.get("/workflows/:workflowId", ...n8nRoutes.getWorkflow);
    v1Router.post(
      "/workflows/:workflowId/activate",
      ...n8nRoutes.activateWorkflow,
    );
    v1Router.post(
      "/workflows/:workflowId/deactivate",
      ...n8nRoutes.deactivateWorkflow,
    );
    v1Router.post("/workflows/:workflowId/clone", ...n8nRoutes.cloneWorkflow);

    v1Router.post(
      "/workflows/:workflowId/execute",
      ...n8nRoutes.executeWorkflow,
    );
    v1Router.get(
      "/workflows/:workflowId/executions",
      ...n8nRoutes.getWorkflowExecutions,
    );
    v1Router.get("/executions/:executionId", ...n8nRoutes.getExecution);
  }

  // Typebot Chatbot API routes (only if loaded)
  if (typebotRoutes) {
    v1Router.get("/typebot/health", typebotRoutes.healthCheck);
    v1Router.get("/typebot/templates", ...typebotRoutes.getTemplates);
    v1Router.post(
      "/typebot/templates/:type",
      ...typebotRoutes.createFlowFromTemplate,
    );

    v1Router.post("/typebot/flows", ...typebotRoutes.createFlow);
    v1Router.get("/typebot/flows", ...typebotRoutes.getFlows);
    v1Router.get(
      "/typebot/flows/analytics",
      ...typebotRoutes.getTenantAnalytics,
    );
    v1Router.get("/typebot/flows/:flowId", ...typebotRoutes.getFlow);
    v1Router.put("/typebot/flows/:flowId", ...typebotRoutes.updateFlow);
    v1Router.delete("/typebot/flows/:flowId", ...typebotRoutes.deleteFlow);
    v1Router.post(
      "/typebot/flows/:flowId/publish",
      ...typebotRoutes.publishFlow,
    );
    v1Router.post(
      "/typebot/flows/:flowId/unpublish",
      ...typebotRoutes.unpublishFlow,
    );
    v1Router.get("/typebot/flows/:flowId/export", ...typebotRoutes.exportFlow);
    v1Router.get(
      "/typebot/flows/:flowId/analytics",
      ...typebotRoutes.getFlowAnalytics,
    );
    v1Router.post("/typebot/import", ...typebotRoutes.importFlow);

    v1Router.post(
      "/typebot/flows/:flowId/sessions",
      ...typebotRoutes.startSession,
    );
    v1Router.get(
      "/typebot/flows/:flowId/sessions",
      ...typebotRoutes.getFlowSessions,
    );
    v1Router.get("/typebot/sessions/:sessionId", ...typebotRoutes.getSession);
    v1Router.post(
      "/typebot/sessions/continue",
      ...typebotRoutes.continueSession,
    );
  }

  // AI Services API routes (only if loaded)
  if (aiRoutes) {
    v1Router.post("/ai/analyze", ...aiRoutes.processAIRequest);

    v1Router.post("/ai/models", ...aiRoutes.createModelConfig);
    v1Router.get("/ai/models", ...aiRoutes.getModelConfigs);
    v1Router.get("/ai/models/:configId", ...aiRoutes.getModelConfig);
    v1Router.put("/ai/models/:configId", ...aiRoutes.updateModelConfig);
    v1Router.delete("/ai/models/:configId", ...aiRoutes.deleteModelConfig);

    v1Router.get("/ai/usage/stats", ...aiRoutes.getUsageStats);
    v1Router.get("/ai/usage/details", ...aiRoutes.getUsageDetails);

    v1Router.get("/ai/cache", ...aiRoutes.getCacheStats);
    v1Router.delete("/ai/cache", ...aiRoutes.clearCache);

    v1Router.get("/ai/health", ...aiRoutes.getServiceHealth);
    v1Router.get("/ai/templates", ...aiRoutes.getAITemplates);
    v1Router.post("/ai/templates", ...aiRoutes.createFromTemplate);
  }

  // Mautic Marketing API routes (only if loaded)
  if (mauticRoutes) {
    v1Router.post("/mautic/instances", ...mauticRoutes.createInstance);
    v1Router.get("/mautic/instances", ...mauticRoutes.getInstances);
    v1Router.get("/mautic/instances/:instanceId", ...mauticRoutes.getInstance);
    v1Router.post(
      "/mautic/instances/:instanceId/test",
      ...mauticRoutes.testConnection,
    );

    v1Router.post(
      "/mautic/instances/:instanceId/leads",
      ...mauticRoutes.createLead,
    );
    v1Router.get("/mautic/leads", ...mauticRoutes.getLeads);
    v1Router.get("/mautic/leads/:leadId", ...mauticRoutes.getLead);
    v1Router.put("/mautic/leads/:leadId", ...mauticRoutes.updateLead);
    v1Router.post("/mautic/leads/:leadId/sync", ...mauticRoutes.syncLead);
    v1Router.post("/mautic/leads/bulk-action", ...mauticRoutes.bulkAction);

    v1Router.post(
      "/mautic/instances/:instanceId/campaigns",
      ...mauticRoutes.createCampaign,
    );
    v1Router.get("/mautic/campaigns", ...mauticRoutes.getCampaigns);
    v1Router.post(
      "/mautic/campaigns/:campaignId/execute",
      ...mauticRoutes.executeCampaign,
    );

    v1Router.get("/mautic/templates", ...mauticRoutes.getTemplates);
    v1Router.post(
      "/mautic/instances/:instanceId/templates/:templateName",
      ...mauticRoutes.createFromTemplate,
    );

    v1Router.get("/mautic/analytics", ...mauticRoutes.getAnalytics);
    v1Router.post(
      "/mautic/lgpd/data-request",
      ...mauticRoutes.handleDataRequest,
    );

    v1Router.get("/mautic/health", ...mauticRoutes.healthCheck);
  }

  // Notification System API routes (only if loaded)
  if (notificationRoutes) {
    v1Router.use("/notifications", notificationRoutes.default);
  }

  // Stack Configuration API routes (only if loaded)
  if (stackConfigRoutes) {
    v1Router.use("/stack-config", stackConfigRoutes.default);
  }

  // Mount v1 routes with rate limiting
  app.use("/api/v1", apiRateLimit, v1Router);

  // Webhook endpoints (no versioning for external services)
  if (whatsappRoutes) {
    app.post(
      "/api/webhooks/whatsapp/:tenantId/:instanceId",
      whatsappRoutes.handleWebhook,
    );
  }

  if (n8nRoutes) {
    app.post(
      "/api/webhooks/n8n/:tenantId/:workflowId",
      n8nRoutes.handleWebhook,
    );
  }

  if (typebotRoutes) {
    app.post(
      "/api/webhooks/typebot/:tenantId/:flowId",
      typebotRoutes.handleWebhook,
    );
    app.post(
      "/api/webhooks/whatsapp/typebot/:tenantId/:flowId",
      typebotRoutes.processWhatsAppMessage,
    );
  }

  if (mauticRoutes) {
    app.post(
      "/api/webhooks/mautic/:tenantId/:instanceId",
      mauticRoutes.handleWebhook,
    );
  }

  // Legacy billing routes (maintain backward compatibility)
  app.get("/api/billing/health", billingRoutes.healthCheck);
  app.get("/api/billing/plans", billingRoutes.getPlans);
  app.get("/api/billing/plans/:planId", billingRoutes.getPlan);
  app.post("/api/billing/subscriptions", ...billingRoutes.createSubscription);
  app.get("/api/billing/subscription", ...billingRoutes.getSubscription);
  app.put("/api/billing/subscription", ...billingRoutes.updateSubscription);
  app.delete("/api/billing/subscription", ...billingRoutes.cancelSubscription);
  app.get("/api/billing/usage", ...billingRoutes.getUsage);
  app.put("/api/billing/usage", ...billingRoutes.updateUsage);
  app.post(
    "/api/billing/payment-methods",
    ...billingRoutes.createPaymentMethod,
  );
  app.post("/api/billing/portal", ...billingRoutes.createBillingPortal);
  app.post("/api/billing/webhook", billingRoutes.handleWebhook);

  // Admin routes (TODO: Add proper admin authentication)
  app.post("/api/billing/admin/plans", billingRoutes.createPlan);
  app.put("/api/billing/admin/plans/:planId", billingRoutes.updatePlan);
  app.delete("/api/billing/admin/plans/:planId", billingRoutes.deletePlan);

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      error: "API endpoint not found",
      code: "NOT_FOUND",
      path: req.path,
    });
  });

  // Global error handler
  app.use(
    (
      error: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Global error handler:", error);

      if (res.headersSent) {
        return next(error);
      }

      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      });
    },
  );

  return app;
}

// Initialize database on server creation
export async function startServer() {
  try {
    console.log("🚀 Starting KRYONIX server...");

    // Initialize database connection (if available)
    if (initializeDatabase) {
      const dbConnected = await initializeDatabase();

      if (dbConnected) {
        console.log("✅ Database initialized successfully");

        // Initialize AI Services
        if (aiRoutes) {
          try {
            const aiService = require("./services/ai");
            await aiService.AIService.initialize();
            console.log("✅ AI Services initialized successfully");
          } catch (error) {
            console.log(
              "⚠️  AI Services initialization failed:",
              error.message,
            );
          }
        }

        // Initialize Mautic Services
        if (mauticRoutes) {
          try {
            const mauticService = require("./services/mautic");
            await mauticService.MauticService.initialize();
            console.log("✅ Mautic Services initialized successfully");
          } catch (error) {
            console.log(
              "⚠️  Mautic Services initialization failed:",
              error.message,
            );
          }
        }

        // Initialize Notification Services
        if (notificationRoutes) {
          try {
            const notificationService = require("./services/notification");
            await notificationService.NotificationService.initialize();
            console.log("✅ Notification Services initialized successfully");
          } catch (error) {
            console.log(
              "⚠️  Notification Services initialization failed:",
              error.message,
            );
          }
        }
      } else {
        console.log("⚠️  Running without database (using in-memory storage)");
      }
    } else {
      console.log("⚠️  Database modules not loaded (likely in build mode)");
    }

    const app = createServer();

    console.log("✅ Server created successfully");
    console.log("📡 Available API endpoints:");
    console.log("   - GET  /api/health - System health check");
    console.log("   - GET  /api/v1/billing/* - Billing API");

    if (whatsappRoutes) {
      console.log("   - GET  /api/v1/whatsapp/* - WhatsApp API");
      console.log(
        "   - POST /api/webhooks/whatsapp/:tenantId/:instanceId - WhatsApp webhooks",
      );
    }

    if (n8nRoutes) {
      console.log("   - GET  /api/v1/workflows/* - N8N Workflow API");
      console.log(
        "   - POST /api/webhooks/n8n/:tenantId/:workflowId - N8N webhooks",
      );
    }

    if (typebotRoutes) {
      console.log("   - GET  /api/v1/typebot/* - Typebot Chatbot API");
      console.log(
        "   - POST /api/webhooks/typebot/:tenantId/:flowId - Typebot webhooks",
      );
    }

    if (aiRoutes) {
      console.log("   - POST /api/v1/ai/* - AI Services API");
      console.log("   - GET  /api/v1/ai/health - AI Services health check");
    }

    if (mauticRoutes) {
      console.log("   - POST /api/v1/mautic/* - Mautic Marketing API");
      console.log(
        "   - POST /api/webhooks/mautic/:tenantId/:instanceId - Mautic webhooks",
      );
    }

    if (notificationRoutes) {
      console.log(
        "   - POST /api/v1/notifications/* - Notification System API",
      );
      console.log(
        "   - GET  /api/v1/notifications/track/* - Notification tracking",
      );
    }

    return app;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    throw error;
  }
}

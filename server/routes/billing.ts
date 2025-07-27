import { RequestHandler } from "express";
import { z } from "zod";
import { BillingService } from "../services/billing.js";
import {
  CreateSubscriptionSchema,
  UpdateSubscriptionSchema,
  CreatePaymentMethodSchema,
  WebhookEventSchema,
  BillingError,
  PlanListResponse,
  SubscriptionResponse,
  CreateSubscriptionResponse,
  UsageResponse,
  BillingPortalResponse,
} from "../../shared/billing.js";

// Middleware for user authentication (simplified)
const authenticateUser: RequestHandler = (req, res, next) => {
  // In real implementation, validate JWT token
  const userId = req.headers["x-user-id"] as string;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as any).userId = userId;
  next();
};

// Error handler
const handleBillingError = (error: any, res: any) => {
  if (error instanceof BillingError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
  }

  console.error("Billing error:", error);
  return res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
};

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

// Plans endpoints
export const getPlans: RequestHandler = async (req, res) => {
  try {
    const active =
      req.query.active === "true"
        ? true
        : req.query.active === "false"
          ? false
          : undefined;

    const plans = await BillingService.getPlans(active);

    const response: PlanListResponse = {
      plans,
      total: plans.length,
    };

    res.json(response);
  } catch (error) {
    handleBillingError(error, res);
  }
};

export const getPlan: RequestHandler = async (req, res) => {
  try {
    const { planId } = req.params;
    const plan = await BillingService.getPlanById(planId);

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    handleBillingError(error, res);
  }
};

// Subscription endpoints
export const createSubscription: RequestHandler[] = [
  authenticateUser,
  validateBody(CreateSubscriptionSchema),
  async (req: any, res) => {
    try {
      const result = await BillingService.createSubscription(
        req.userId,
        req.body,
      );

      const response: CreateSubscriptionResponse = {
        subscription: result.subscription,
        clientSecret: result.clientSecret,
        requiresAction: !!result.clientSecret,
      };

      res.status(201).json(response);
    } catch (error) {
      handleBillingError(error, res);
    }
  },
];

export const getSubscription: RequestHandler[] = [
  authenticateUser,
  async (req: any, res) => {
    try {
      const subscription = await BillingService.getSubscription(req.userId);

      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      const plan = await BillingService.getPlanById(subscription.planId);
      const currentUsage = await BillingService.getUsageMetrics(req.userId);

      const response: SubscriptionResponse = {
        subscription,
        plan: plan!,
        currentUsage: currentUsage || undefined,
      };

      res.json(response);
    } catch (error) {
      handleBillingError(error, res);
    }
  },
];

export const updateSubscription: RequestHandler[] = [
  authenticateUser,
  validateBody(UpdateSubscriptionSchema),
  async (req: any, res) => {
    try {
      const subscription = await BillingService.updateSubscription(
        req.userId,
        req.body,
      );

      res.json(subscription);
    } catch (error) {
      handleBillingError(error, res);
    }
  },
];

export const cancelSubscription: RequestHandler[] = [
  authenticateUser,
  async (req: any, res) => {
    try {
      const immediately = req.query.immediately === "true";
      const subscription = await BillingService.cancelSubscription(
        req.userId,
        immediately,
      );

      res.json(subscription);
    } catch (error) {
      handleBillingError(error, res);
    }
  },
];

// Usage tracking endpoints
export const getUsage: RequestHandler[] = [
  authenticateUser,
  async (req: any, res) => {
    try {
      const month = req.query.month as string;
      const usage = await BillingService.getUsageMetrics(req.userId, month);
      const subscription = await BillingService.getSubscription(req.userId);

      if (!usage || !subscription) {
        return res.status(404).json({ error: "Usage data not found" });
      }

      const plan = await BillingService.getPlanById(subscription.planId);
      const limits = plan!.features;

      // Calculate usage percentages
      const percentage: Record<string, number> = {};
      const warnings: string[] = [];

      Object.entries(usage).forEach(([key, value]) => {
        if (key in limits && typeof value === "number") {
          const limit = (limits as any)[key];
          if (limit > 0) {
            // Not unlimited
            const percent = (value / limit) * 100;
            percentage[key] = Math.round(percent);

            if (percent >= 90) {
              warnings.push(`${key} is at ${percent.toFixed(1)}% of limit`);
            }
          }
        }
      });

      const response: UsageResponse = {
        current: usage,
        limits,
        percentage: percentage as any,
        warnings,
      };

      res.json(response);
    } catch (error) {
      handleBillingError(error, res);
    }
  },
];

export const updateUsage: RequestHandler[] = [
  authenticateUser,
  async (req: any, res) => {
    try {
      const metrics = await BillingService.updateUsageMetrics(
        req.userId,
        req.body,
      );

      res.json(metrics);
    } catch (error) {
      handleBillingError(error, res);
    }
  },
];

// Payment methods endpoints
export const createPaymentMethod: RequestHandler[] = [
  authenticateUser,
  validateBody(CreatePaymentMethodSchema),
  async (req: any, res) => {
    try {
      const paymentMethod = await BillingService.createPaymentMethod(
        req.userId,
        req.body,
      );

      res.status(201).json(paymentMethod);
    } catch (error) {
      handleBillingError(error, res);
    }
  },
];

// Billing portal endpoint
export const createBillingPortal: RequestHandler[] = [
  authenticateUser,
  async (req: any, res) => {
    try {
      const returnUrl =
        req.body.returnUrl || `${req.protocol}://${req.get("host")}/dashboard`;
      const url = await BillingService.createBillingPortalSession(
        req.userId,
        returnUrl,
      );

      const response: BillingPortalResponse = { url };
      res.json(response);
    } catch (error) {
      handleBillingError(error, res);
    }
  },
];

// Webhook endpoint (no authentication required)
export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"] as string;
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({ error: "Missing stripe signature" });
    }

    const result = await BillingService.handleWebhook(payload, signature);

    res.json({ received: true, processed: result.processed });
  } catch (error) {
    console.error("Webhook error:", error);
    handleBillingError(error, res);
  }
};

// Health check endpoint
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    // Check if Stripe is accessible
    const plans = await BillingService.getPlans(true);

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      activePlans: plans.length,
      version: "1.0.0",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Admin endpoints (for managing plans)
export const createPlan: RequestHandler = async (req, res) => {
  // TODO: Implement plan creation (admin only)
  res.status(501).json({ error: "Not implemented" });
};

export const updatePlan: RequestHandler = async (req, res) => {
  // TODO: Implement plan updates (admin only)
  res.status(501).json({ error: "Not implemented" });
};

export const deletePlan: RequestHandler = async (req, res) => {
  // TODO: Implement plan deletion (admin only)
  res.status(501).json({ error: "Not implemented" });
};

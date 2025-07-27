import Stripe from "stripe";
import {
  Plan,
  PlanType,
  BillingCycle,
  Subscription,
  SubscriptionStatus,
  UsageMetrics,
  PaymentMethod,
  Invoice,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  BillingError,
  PlanFeatures,
} from "../../shared/billing.js";

// Stripe Configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// Default Plans Configuration
const DEFAULT_PLANS: Omit<Plan, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Starter",
    type: PlanType.STARTER,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID!,
    stripeProductId: process.env.STRIPE_STARTER_PRODUCT_ID!,
    description: "Perfeito para pequenos negócios que estão começando",
    price: 29.9,
    currency: "BRL",
    billingCycle: BillingCycle.MONTHLY,
    trialDays: 7,
    isActive: true,
    isPopular: false,
    sortOrder: 1,
    features: {
      whatsappInstances: 1,
      messagesPerMonth: 1000,
      automationRules: 5,
      teamMembers: 2,
      chatbotFlows: 3,
      apiCalls: 10000,
      customIntegrations: false,
      prioritySupport: false,
      whiteLabel: false,
      advancedAnalytics: false,
      customDomain: false,
      sslCertificate: true,
      backupFrequency: "WEEKLY",
      storageGB: 5,
    },
  },
  {
    name: "Professional",
    type: PlanType.PROFESSIONAL,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    stripeProductId: process.env.STRIPE_PROFESSIONAL_PRODUCT_ID!,
    description:
      "Ideal para empresas em crescimento com necessidades avançadas",
    price: 89.9,
    currency: "BRL",
    billingCycle: BillingCycle.MONTHLY,
    trialDays: 14,
    isActive: true,
    isPopular: true,
    sortOrder: 2,
    features: {
      whatsappInstances: 5,
      messagesPerMonth: 10000,
      automationRules: 25,
      teamMembers: 10,
      chatbotFlows: 15,
      apiCalls: 100000,
      customIntegrations: true,
      prioritySupport: true,
      whiteLabel: false,
      advancedAnalytics: true,
      customDomain: true,
      sslCertificate: true,
      backupFrequency: "DAILY",
      storageGB: 50,
    },
  },
  {
    name: "Enterprise",
    type: PlanType.ENTERPRISE,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    stripeProductId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID!,
    description:
      "Solução completa para grandes empresas com recursos ilimitados",
    price: 299.9,
    currency: "BRL",
    billingCycle: BillingCycle.MONTHLY,
    trialDays: 30,
    isActive: true,
    isPopular: false,
    sortOrder: 3,
    features: {
      whatsappInstances: -1, // Unlimited
      messagesPerMonth: -1, // Unlimited
      automationRules: -1, // Unlimited
      teamMembers: -1, // Unlimited
      chatbotFlows: -1, // Unlimited
      apiCalls: -1, // Unlimited
      customIntegrations: true,
      prioritySupport: true,
      whiteLabel: true,
      advancedAnalytics: true,
      customDomain: true,
      sslCertificate: true,
      backupFrequency: "REAL_TIME",
      storageGB: 500,
    },
  },
];

// In-memory storage (replace with actual database)
const plans = new Map<string, Plan>();
const subscriptions = new Map<string, Subscription>();
const usageMetrics = new Map<string, UsageMetrics>();
const paymentMethods = new Map<string, PaymentMethod>();
const invoices = new Map<string, Invoice>();

// Initialize default plans
DEFAULT_PLANS.forEach((planData, index) => {
  const plan: Plan = {
    ...planData,
    id: `plan_${index + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  plans.set(plan.id, plan);
});

export class BillingService {
  // Plan Management
  static async getPlans(active?: boolean): Promise<Plan[]> {
    const allPlans = Array.from(plans.values());
    return active !== undefined
      ? allPlans.filter((plan) => plan.isActive === active)
      : allPlans;
  }

  static async getPlanById(planId: string): Promise<Plan | null> {
    return plans.get(planId) || null;
  }

  // Subscription Management
  static async createSubscription(
    userId: string,
    request: CreateSubscriptionRequest,
  ): Promise<{ subscription: Subscription; clientSecret?: string }> {
    try {
      const plan = await this.getPlanById(request.planId);
      if (!plan) {
        throw new BillingError("Plan not found", "PLAN_NOT_FOUND", 404);
      }

      // Create or get Stripe customer
      const customer = await this.getOrCreateStripeCustomer(userId);

      // Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: plan.stripePriceId }],
        trial_period_days: request.trialDays || plan.trialDays,
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: {
          userId,
          planId: request.planId,
          ...(request.metadata || {}),
        },
      });

      // Create local subscription record
      const subscription: Subscription = {
        id: `sub_${Date.now()}`,
        userId,
        planId: request.planId,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: stripeSubscription.id,
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          stripeSubscription.current_period_end * 1000,
        ),
        trialStart: stripeSubscription.trial_start
          ? new Date(stripeSubscription.trial_start * 1000)
          : undefined,
        trialEnd: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : undefined,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        metadata: request.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      subscriptions.set(subscription.id, subscription);

      // Initialize usage metrics
      await this.initializeUsageMetrics(userId, subscription.id);

      // Extract client secret for payment confirmation
      const latestInvoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      const paymentIntent =
        latestInvoice?.payment_intent as Stripe.PaymentIntent;

      return {
        subscription,
        clientSecret: paymentIntent?.client_secret,
      };
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new BillingError(
          `Stripe error: ${error.message}`,
          "STRIPE_ERROR",
          400,
        );
      }
      throw error;
    }
  }

  static async getSubscription(userId: string): Promise<Subscription | null> {
    const userSubscriptions = Array.from(subscriptions.values()).filter(
      (sub) =>
        sub.userId === userId && sub.status === SubscriptionStatus.ACTIVE,
    );

    return userSubscriptions[0] || null;
  }

  static async updateSubscription(
    userId: string,
    request: UpdateSubscriptionRequest,
  ): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new BillingError(
        "Subscription not found",
        "SUBSCRIPTION_NOT_FOUND",
        404,
      );
    }

    try {
      const updateData: Stripe.SubscriptionUpdateParams = {};

      if (request.planId && request.planId !== subscription.planId) {
        const newPlan = await this.getPlanById(request.planId);
        if (!newPlan) {
          throw new BillingError("Plan not found", "PLAN_NOT_FOUND", 404);
        }

        // Get current subscription item
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripeSubscriptionId,
        );

        updateData.items = [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPlan.stripePriceId,
          },
        ];
        updateData.proration_behavior = "create_prorations";
      }

      if (request.cancelAtPeriodEnd !== undefined) {
        updateData.cancel_at_period_end = request.cancelAtPeriodEnd;
      }

      if (request.metadata) {
        updateData.metadata = { ...subscription.metadata, ...request.metadata };
      }

      // Update in Stripe
      const updatedStripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        updateData,
      );

      // Update local record
      const updatedSubscription: Subscription = {
        ...subscription,
        planId: request.planId || subscription.planId,
        status: this.mapStripeStatus(updatedStripeSubscription.status),
        cancelAtPeriodEnd: updatedStripeSubscription.cancel_at_period_end,
        metadata: updateData.metadata || subscription.metadata,
        updatedAt: new Date(),
      };

      subscriptions.set(subscription.id, updatedSubscription);
      return updatedSubscription;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new BillingError(
          `Stripe error: ${error.message}`,
          "STRIPE_ERROR",
          400,
        );
      }
      throw error;
    }
  }

  static async cancelSubscription(
    userId: string,
    immediately = false,
  ): Promise<Subscription> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new BillingError(
        "Subscription not found",
        "SUBSCRIPTION_NOT_FOUND",
        404,
      );
    }

    try {
      if (immediately) {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        subscription.status = SubscriptionStatus.CANCELLED;
        subscription.canceledAt = new Date();
        subscription.endedAt = new Date();
      } else {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        subscription.cancelAtPeriodEnd = true;
      }

      subscription.updatedAt = new Date();
      subscriptions.set(subscription.id, subscription);
      return subscription;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new BillingError(
          `Stripe error: ${error.message}`,
          "STRIPE_ERROR",
          400,
        );
      }
      throw error;
    }
  }

  // Usage Tracking
  static async getUsageMetrics(
    userId: string,
    month?: string,
  ): Promise<UsageMetrics | null> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) return null;

    const currentMonth = month || new Date().toISOString().slice(0, 7);
    const key = `${userId}_${currentMonth}`;
    return usageMetrics.get(key) || null;
  }

  static async updateUsageMetrics(
    userId: string,
    metrics: Partial<
      Omit<UsageMetrics, "userId" | "subscriptionId" | "month" | "lastUpdated">
    >,
  ): Promise<UsageMetrics> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) {
      throw new BillingError(
        "Subscription not found",
        "SUBSCRIPTION_NOT_FOUND",
        404,
      );
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const key = `${userId}_${currentMonth}`;
    const existing = usageMetrics.get(key);

    const updated: UsageMetrics = {
      userId,
      subscriptionId: subscription.id,
      month: currentMonth,
      whatsappInstancesUsed: 0,
      messagesSent: 0,
      automationRulesUsed: 0,
      teamMembersActive: 0,
      chatbotFlowsUsed: 0,
      apiCallsMade: 0,
      storageUsedGB: 0,
      ...existing,
      ...metrics,
      lastUpdated: new Date(),
    };

    usageMetrics.set(key, updated);
    return updated;
  }

  // Payment Methods
  static async createPaymentMethod(
    userId: string,
    request: CreatePaymentMethodRequest,
  ): Promise<PaymentMethod> {
    try {
      const customer = await this.getOrCreateStripeCustomer(userId);

      // Attach payment method to customer
      await stripe.paymentMethods.attach(request.stripePaymentMethodId, {
        customer: customer.id,
      });

      // Get payment method details
      const stripePaymentMethod = await stripe.paymentMethods.retrieve(
        request.stripePaymentMethodId,
      );

      // Set as default if requested
      if (request.isDefault) {
        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: request.stripePaymentMethodId,
          },
        });
      }

      const paymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        userId,
        stripePaymentMethodId: request.stripePaymentMethodId,
        type: stripePaymentMethod.type as any,
        isDefault: request.isDefault,
        cardBrand: stripePaymentMethod.card?.brand,
        cardLast4: stripePaymentMethod.card?.last4,
        cardExpMonth: stripePaymentMethod.card?.exp_month,
        cardExpYear: stripePaymentMethod.card?.exp_year,
        createdAt: new Date(),
      };

      paymentMethods.set(paymentMethod.id, paymentMethod);
      return paymentMethod;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new BillingError(
          `Stripe error: ${error.message}`,
          "STRIPE_ERROR",
          400,
        );
      }
      throw error;
    }
  }

  // Billing Portal
  static async createBillingPortalSession(
    userId: string,
    returnUrl: string,
  ): Promise<string> {
    try {
      const customer = await this.getOrCreateStripeCustomer(userId);

      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl,
      });

      return session.url;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new BillingError(
          `Stripe error: ${error.message}`,
          "STRIPE_ERROR",
          400,
        );
      }
      throw error;
    }
  }

  // Webhook Handling
  static async handleWebhook(
    payload: string,
    signature: string,
  ): Promise<{ processed: boolean; event: any }> {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );

      switch (event.type) {
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await this.handleSubscriptionEvent(event);
          break;
        case "invoice.payment_succeeded":
        case "invoice.payment_failed":
          await this.handleInvoiceEvent(event);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { processed: true, event };
    } catch (error) {
      console.error("Webhook error:", error);
      throw new BillingError("Webhook processing failed", "WEBHOOK_ERROR", 400);
    }
  }

  // Helper Methods
  private static async getOrCreateStripeCustomer(
    userId: string,
  ): Promise<Stripe.Customer> {
    // In real implementation, check if customer exists in database
    // For now, create a new customer each time
    return await stripe.customers.create({
      metadata: { userId },
    });
  }

  private static mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case "active":
        return SubscriptionStatus.ACTIVE;
      case "canceled":
        return SubscriptionStatus.CANCELLED;
      case "past_due":
        return SubscriptionStatus.PAST_DUE;
      case "unpaid":
        return SubscriptionStatus.UNPAID;
      case "trialing":
        return SubscriptionStatus.TRIALING;
      case "incomplete":
        return SubscriptionStatus.INCOMPLETE;
      case "incomplete_expired":
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }

  private static async initializeUsageMetrics(
    userId: string,
    subscriptionId: string,
  ): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const key = `${userId}_${currentMonth}`;

    const metrics: UsageMetrics = {
      userId,
      subscriptionId,
      month: currentMonth,
      whatsappInstancesUsed: 0,
      messagesSent: 0,
      automationRulesUsed: 0,
      teamMembersActive: 0,
      chatbotFlowsUsed: 0,
      apiCallsMade: 0,
      storageUsedGB: 0,
      lastUpdated: new Date(),
    };

    usageMetrics.set(key, metrics);
  }

  private static async handleSubscriptionEvent(
    event: Stripe.Event,
  ): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    // Update local subscription record based on Stripe webhook
    console.log("Subscription event:", event.type, subscription.id);
  }

  private static async handleInvoiceEvent(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    // Handle invoice events
    console.log("Invoice event:", event.type, invoice.id);
  }
}

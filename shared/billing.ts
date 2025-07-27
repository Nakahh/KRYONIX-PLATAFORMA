import { z } from "zod";

// Plan Types
export enum PlanType {
  STARTER = "STARTER",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
  CUSTOM = "CUSTOM",
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  LIFETIME = "LIFETIME",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  PAST_DUE = "PAST_DUE",
  UNPAID = "UNPAID",
  TRIALING = "TRIALING",
  INCOMPLETE = "INCOMPLETE",
  INCOMPLETE_EXPIRED = "INCOMPLETE_EXPIRED",
}

// Plan Configuration
export interface PlanFeatures {
  whatsappInstances: number;
  messagesPerMonth: number;
  automationRules: number;
  teamMembers: number;
  chatbotFlows: number;
  apiCalls: number;
  customIntegrations: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
  advancedAnalytics: boolean;
  customDomain: boolean;
  sslCertificate: boolean;
  backupFrequency: "DAILY" | "WEEKLY" | "REAL_TIME";
  storageGB: number;
}

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  stripePriceId: string;
  stripeProductId: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  trialDays: number;
  features: PlanFeatures;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription Management
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  endedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Usage Tracking
export interface UsageMetrics {
  userId: string;
  subscriptionId: string;
  month: string; // YYYY-MM format
  whatsappInstancesUsed: number;
  messagesSent: number;
  automationRulesUsed: number;
  teamMembersActive: number;
  chatbotFlowsUsed: number;
  apiCallsMade: number;
  storageUsedGB: number;
  lastUpdated: Date;
}

// Payment and Invoice
export interface PaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: "card" | "sepa_debit" | "ideal" | "boleto";
  isDefault: boolean;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId: string;
  stripeInvoiceId: string;
  number: string;
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
  amountPaid: number;
  amountDue: number;
  currency: string;
  dueDate?: Date;
  paidAt?: Date;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// API Request/Response Types
export const CreateSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  paymentMethodId: z.string().optional(),
  trialDays: z.number().int().min(0).max(30).optional(),
  metadata: z.record(z.any()).optional(),
});

export const UpdateSubscriptionSchema = z.object({
  planId: z.string().uuid().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

export const CreatePaymentMethodSchema = z.object({
  stripePaymentMethodId: z.string(),
  isDefault: z.boolean().default(false),
});

export const WebhookEventSchema = z.object({
  id: z.string(),
  object: z.literal("event"),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
  created: z.number(),
  livemode: z.boolean(),
  pending_webhooks: z.number(),
  request: z
    .object({
      id: z.string().nullable(),
      idempotency_key: z.string().nullable(),
    })
    .nullable(),
});

// Response Types
export interface CreateSubscriptionResponse {
  subscription: Subscription;
  clientSecret?: string;
  requiresAction?: boolean;
}

export interface PlanListResponse {
  plans: Plan[];
  total: number;
}

export interface SubscriptionResponse {
  subscription: Subscription;
  plan: Plan;
  currentUsage?: UsageMetrics;
  paymentMethod?: PaymentMethod;
}

export interface UsageResponse {
  current: UsageMetrics;
  limits: PlanFeatures;
  percentage: Record<keyof PlanFeatures, number>;
  warnings: string[];
}

export interface BillingPortalResponse {
  url: string;
}

// Error Types
export class BillingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "BillingError";
  }
}

// Type exports for forms and validation
export type CreateSubscriptionRequest = z.infer<
  typeof CreateSubscriptionSchema
>;
export type UpdateSubscriptionRequest = z.infer<
  typeof UpdateSubscriptionSchema
>;
export type CreatePaymentMethodRequest = z.infer<
  typeof CreatePaymentMethodSchema
>;
export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { Tenant } from "./Tenant";

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  PAST_DUE = "PAST_DUE",
  UNPAID = "UNPAID",
  TRIALING = "TRIALING",
  INCOMPLETE = "INCOMPLETE",
  INCOMPLETE_EXPIRED = "INCOMPLETE_EXPIRED",
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  LIFETIME = "LIFETIME",
}

@Entity("subscriptions")
@Index(["tenantId", "status"])
@Index(["stripeSubscriptionId"], { unique: true })
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', length: 255 })
  planId: string;

  @Column({ type: 'varchar', length: 255 })
  planName: string;

  @Column({
    type: "enum",
    enum: SubscriptionStatus,
  })
  status: SubscriptionStatus;

  @Column({
    type: "enum",
    enum: BillingCycle,
  })
  billingCycle: BillingCycle;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: "BRL" })
  currency: string;

  @Column({ type: 'varchar', length: 255 })
  stripeCustomerId: string;

  @Column({ type: 'varchar', length: 255 })
  stripeSubscriptionId: string;

  @Column({ type: "timestamp" })
  currentPeriodStart: Date;

  @Column({ type: "timestamp" })
  currentPeriodEnd: Date;

  @Column({ type: "timestamp", nullable: true })
  trialStart?: Date;

  @Column({ type: "timestamp", nullable: true })
  trialEnd?: Date;

  @Column({ type: "boolean", default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ type: "timestamp", nullable: true })
  canceledAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  endedAt?: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column("uuid")
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.subscriptions)
  tenant: Tenant;

  // Instance methods
  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE;
  }

  get isTrialing(): boolean {
    return this.status === SubscriptionStatus.TRIALING;
  }

  get isCancelled(): boolean {
    return this.status === SubscriptionStatus.CANCELLED;
  }

  get daysUntilRenewal(): number {
    const now = new Date();
    const renewalDate = new Date(this.currentPeriodEnd);
    return Math.ceil(
      (renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  get daysInTrial(): number {
    if (!this.trialStart || !this.trialEnd) return 0;
    const start = new Date(this.trialStart);
    const end = new Date(this.trialEnd);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  get trialDaysRemaining(): number {
    if (!this.isTrialing || !this.trialEnd) return 0;
    const now = new Date();
    const trialEnd = new Date(this.trialEnd);
    return Math.max(
      0,
      Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
  }
}

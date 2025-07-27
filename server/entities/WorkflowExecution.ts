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
import { WorkflowTemplate } from "./WorkflowTemplate";

export enum ExecutionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  TIMEOUT = "TIMEOUT",
  WAITING = "WAITING",
}

export enum ExecutionMode {
  MANUAL = "MANUAL",
  TRIGGER = "TRIGGER",
  WEBHOOK = "WEBHOOK",
  SCHEDULED = "SCHEDULED",
  API = "API",
}

export interface ExecutionContext {
  userId?: string;
  triggerSource: string;
  instanceId?: string;
  contactPhone?: string;
  messageId?: string;
  campaignId?: string;
}

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  status: "pending" | "running" | "success" | "failed" | "skipped";
  startedAt?: Date;
  finishedAt?: Date;
  inputData?: any;
  outputData?: any;
  error?: string;
  duration?: number; // milliseconds
}

export interface ExecutionMetrics {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  skippedNodes: number;
  totalDuration: number; // milliseconds
  avgNodeDuration: number; // milliseconds
  memoryUsage?: number; // bytes
  cpuUsage?: number; // percentage
}

@Entity("workflow_executions")
@Index(["tenantId", "status"])
@Index(["workflowTemplateId", "createdAt"])
@Index(["n8nExecutionId"], { unique: true })
export class WorkflowExecution {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255, nullable: true })
  n8nExecutionId?: string;

  @Column({
    type: "enum",
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING,
  })
  status: ExecutionStatus;

  @Column({
    type: "enum",
    enum: ExecutionMode,
  })
  mode: ExecutionMode;

  @Column({ type: "jsonb" })
  context: ExecutionContext;

  @Column({ type: "jsonb", nullable: true })
  inputData?: any;

  @Column({ type: "jsonb", nullable: true })
  outputData?: any;

  @Column({ type: "jsonb", default: [] })
  steps: ExecutionStep[];

  @Column({ type: "jsonb", nullable: true })
  metrics?: ExecutionMetrics;

  @Column({ type: "text", nullable: true })
  error?: string;

  @Column({ type: "integer", default: 0 })
  retryCount: number;

  @Column({ type: "timestamp", nullable: true })
  startedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  finishedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  scheduledAt?: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column("uuid")
  tenantId: string;

  @Column("uuid")
  workflowTemplateId: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @ManyToOne(() => WorkflowTemplate, (template) => template.executions)
  workflowTemplate: WorkflowTemplate;

  // Instance methods
  get isCompleted(): boolean {
    return [
      ExecutionStatus.SUCCESS,
      ExecutionStatus.FAILED,
      ExecutionStatus.CANCELLED,
      ExecutionStatus.TIMEOUT,
    ].includes(this.status);
  }

  get isSuccessful(): boolean {
    return this.status === ExecutionStatus.SUCCESS;
  }

  get isFailed(): boolean {
    return [
      ExecutionStatus.FAILED,
      ExecutionStatus.TIMEOUT,
      ExecutionStatus.CANCELLED,
    ].includes(this.status);
  }

  get isRunning(): boolean {
    return [
      ExecutionStatus.PENDING,
      ExecutionStatus.RUNNING,
      ExecutionStatus.WAITING,
    ].includes(this.status);
  }

  get duration(): number {
    if (!this.startedAt) return 0;
    const endTime = this.finishedAt || new Date();
    return endTime.getTime() - this.startedAt.getTime();
  }

  get progressPercentage(): number {
    if (!this.metrics) return 0;
    return Math.round(
      (this.metrics.completedNodes / this.metrics.totalNodes) * 100,
    );
  }

  start(): void {
    this.status = ExecutionStatus.RUNNING;
    this.startedAt = new Date();
  }

  complete(outputData?: any): void {
    this.status = ExecutionStatus.SUCCESS;
    this.finishedAt = new Date();
    if (outputData) {
      this.outputData = outputData;
    }
    this.updateMetrics();
  }

  fail(error: string): void {
    this.status = ExecutionStatus.FAILED;
    this.finishedAt = new Date();
    this.error = error;
    this.updateMetrics();
  }

  cancel(): void {
    this.status = ExecutionStatus.CANCELLED;
    this.finishedAt = new Date();
    this.updateMetrics();
  }

  timeout(): void {
    this.status = ExecutionStatus.TIMEOUT;
    this.finishedAt = new Date();
    this.error = "Execution timed out";
    this.updateMetrics();
  }

  addStep(step: Omit<ExecutionStep, "startedAt">): void {
    const newStep: ExecutionStep = {
      ...step,
      startedAt: new Date(),
    };
    this.steps.push(newStep);
  }

  updateStep(nodeId: string, updates: Partial<ExecutionStep>): void {
    const stepIndex = this.steps.findIndex((step) => step.nodeId === nodeId);
    if (stepIndex !== -1) {
      this.steps[stepIndex] = {
        ...this.steps[stepIndex],
        ...updates,
      };
    }
  }

  completeStep(nodeId: string, outputData?: any, error?: string): void {
    const stepIndex = this.steps.findIndex((step) => step.nodeId === nodeId);
    if (stepIndex !== -1) {
      this.steps[stepIndex] = {
        ...this.steps[stepIndex],
        status: error ? "failed" : "success",
        finishedAt: new Date(),
        outputData,
        error,
        duration: this.steps[stepIndex].startedAt
          ? Date.now() - this.steps[stepIndex].startedAt!.getTime()
          : 0,
      };
    }
  }

  canRetry(): boolean {
    return this.isFailed && this.retryCount < 3;
  }

  incrementRetry(): void {
    this.retryCount++;
    this.status = ExecutionStatus.PENDING;
    this.error = null;
    this.startedAt = null;
    this.finishedAt = null;
  }

  private updateMetrics(): void {
    const completedSteps = this.steps.filter((step) =>
      ["success", "failed", "skipped"].includes(step.status),
    );

    const successfulSteps = this.steps.filter(
      (step) => step.status === "success",
    );
    const failedSteps = this.steps.filter((step) => step.status === "failed");
    const skippedSteps = this.steps.filter((step) => step.status === "skipped");

    const durations = this.steps
      .filter((step) => step.duration)
      .map((step) => step.duration!);

    this.metrics = {
      totalNodes: this.steps.length,
      completedNodes: completedSteps.length,
      failedNodes: failedSteps.length,
      skippedNodes: skippedSteps.length,
      totalDuration: this.duration,
      avgNodeDuration:
        durations.length > 0
          ? durations.reduce((sum, duration) => sum + duration, 0) /
            durations.length
          : 0,
    };
  }

  getStepsByStatus(status: ExecutionStep["status"]): ExecutionStep[] {
    return this.steps.filter((step) => step.status === status);
  }

  getCurrentStep(): ExecutionStep | null {
    return this.steps.find((step) => step.status === "running") || null;
  }

  getFailedSteps(): ExecutionStep[] {
    return this.steps.filter((step) => step.status === "failed");
  }

  export(): any {
    return {
      id: this.id,
      n8nExecutionId: this.n8nExecutionId,
      status: this.status,
      mode: this.mode,
      context: this.context,
      duration: this.duration,
      progressPercentage: this.progressPercentage,
      metrics: this.metrics,
      error: this.error,
      retryCount: this.retryCount,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      createdAt: this.createdAt,
    };
  }

  static createFromTrigger(
    workflowTemplateId: string,
    tenantId: string,
    context: ExecutionContext,
    inputData?: any,
  ): Partial<WorkflowExecution> {
    return {
      workflowTemplateId,
      tenantId,
      status: ExecutionStatus.PENDING,
      mode: ExecutionMode.TRIGGER,
      context,
      inputData,
      retryCount: 0,
      steps: [],
    };
  }

  static createManual(
    workflowTemplateId: string,
    tenantId: string,
    userId: string,
    inputData?: any,
  ): Partial<WorkflowExecution> {
    return {
      workflowTemplateId,
      tenantId,
      status: ExecutionStatus.PENDING,
      mode: ExecutionMode.MANUAL,
      context: {
        userId,
        triggerSource: "manual",
      },
      inputData,
      retryCount: 0,
      steps: [],
    };
  }
}

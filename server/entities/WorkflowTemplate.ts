import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from "typeorm";
import { Tenant } from "./Tenant";
import { WorkflowExecution } from "./WorkflowExecution";

export enum WorkflowType {
  LEAD_QUALIFICATION = "LEAD_QUALIFICATION",
  CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT",
  MARKETING_CAMPAIGN = "MARKETING_CAMPAIGN",
  ORDER_PROCESSING = "ORDER_PROCESSING",
  APPOINTMENT_BOOKING = "APPOINTMENT_BOOKING",
  FOLLOW_UP_SEQUENCE = "FOLLOW_UP_SEQUENCE",
  DATA_SYNCHRONIZATION = "DATA_SYNCHRONIZATION",
  CUSTOM = "CUSTOM",
}

export enum WorkflowStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  ARCHIVED = "ARCHIVED",
  ERROR = "ERROR",
}

export interface WorkflowTrigger {
  type: "webhook" | "schedule" | "whatsapp_message" | "manual" | "api_call";
  config: {
    webhookPath?: string;
    cronSchedule?: string;
    eventFilter?: any;
    conditions?: any[];
  };
}

export interface WorkflowAction {
  type:
    | "send_whatsapp"
    | "update_crm"
    | "send_email"
    | "create_task"
    | "http_request"
    | "wait"
    | "condition";
  config: any;
}

export interface WorkflowSettings {
  maxExecutionsPerHour: number;
  maxExecutionsPerDay: number;
  retrySettings: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number; // milliseconds
  };
  notificationSettings: {
    onSuccess: boolean;
    onFailure: boolean;
    notifyEmails: string[];
  };
  timeoutSettings: {
    enabled: boolean;
    timeoutMinutes: number;
  };
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: any;
  credentials?: any;
}

export interface WorkflowConnection {
  [nodeId: string]: {
    main: Array<Array<{ node: string; type: string; index: number }>>;
  };
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  connections: WorkflowConnection;
  settings: any;
  meta?: {
    tags?: string[];
    description?: string;
    version?: string;
  };
}

@Entity("workflow_templates")
@Index(["tenantId", "type"])
@Index(["tenantId", "status"])
export class WorkflowTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: WorkflowType,
  })
  type: WorkflowType;

  @Column({
    type: "enum",
    enum: WorkflowStatus,
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  @Column({ type: "jsonb" })
  trigger: WorkflowTrigger;

  @Column({ type: "jsonb" })
  definition: WorkflowDefinition;

  @Column({ type: "jsonb" })
  settings: WorkflowSettings;

  @Column({ length: 255, nullable: true })
  n8nWorkflowId?: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "integer", default: 0 })
  executionCount: number;

  @Column({ type: "integer", default: 0 })
  successCount: number;

  @Column({ type: "integer", default: 0 })
  failureCount: number;

  @Column({ type: "timestamp", nullable: true })
  lastExecutedAt?: Date;

  @Column({ type: "text", nullable: true })
  lastError?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @Column("uuid")
  tenantId: string;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @OneToMany(() => WorkflowExecution, (execution) => execution.workflowTemplate)
  executions: WorkflowExecution[];

  // Instance methods
  get isRunning(): boolean {
    return this.status === WorkflowStatus.ACTIVE && this.isActive;
  }

  get successRate(): number {
    if (this.executionCount === 0) return 0;
    return (this.successCount / this.executionCount) * 100;
  }

  get averageExecutionsPerDay(): number {
    const daysSinceCreation = Math.max(
      1,
      Math.floor(
        (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
    return this.executionCount / daysSinceCreation;
  }

  updateExecutionStats(success: boolean): void {
    this.executionCount++;
    if (success) {
      this.successCount++;
    } else {
      this.failureCount++;
    }
    this.lastExecutedAt = new Date();
  }

  canExecute(): boolean {
    if (!this.isRunning) return false;

    // Check hourly limit
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // In a real implementation, check recent executions from database
    // For now, assume it's within limits
    return true;
  }

  getWebhookUrl(): string {
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    return `${baseUrl}/api/webhooks/n8n/${this.tenantId}/${this.id}`;
  }

  getN8NWorkflowUrl(): string {
    const n8nUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678";
    return `${n8nUrl}/workflow/${this.n8nWorkflowId}/execute`;
  }

  clone(newName: string): Partial<WorkflowTemplate> {
    return {
      name: newName,
      description: this.description,
      type: this.type,
      trigger: { ...this.trigger },
      definition: JSON.parse(JSON.stringify(this.definition)),
      settings: { ...this.settings },
      status: WorkflowStatus.DRAFT,
      isActive: false,
      tenantId: this.tenantId,
    };
  }

  export(): any {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      trigger: this.trigger,
      definition: this.definition,
      settings: this.settings,
      metadata: this.metadata,
    };
  }

  static createFromTemplate(
    template: any,
    tenantId: string,
  ): Partial<WorkflowTemplate> {
    return {
      ...template,
      tenantId,
      status: WorkflowStatus.DRAFT,
      isActive: false,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
    };
  }

  validateDefinition(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate nodes
    if (!this.definition.nodes || this.definition.nodes.length === 0) {
      errors.push("Workflow must have at least one node");
    }

    // Validate trigger node exists
    const triggerNodes = this.definition.nodes.filter(
      (node) => node.type.includes("trigger") || node.type.includes("webhook"),
    );

    if (triggerNodes.length === 0) {
      errors.push("Workflow must have a trigger node");
    }

    // Validate connections
    if (!this.definition.connections) {
      errors.push("Workflow must have connection definitions");
    }

    // Validate settings
    if (this.settings.maxExecutionsPerHour <= 0) {
      errors.push("Max executions per hour must be greater than 0");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

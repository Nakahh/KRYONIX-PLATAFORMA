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
import { TypebotFlow } from "./TypebotFlow";
import { WhatsAppInstance } from "./WhatsAppInstance";

export enum SessionStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
  TRANSFERRED = "TRANSFERRED",
  ERROR = "ERROR",
}

export enum SessionTrigger {
  WHATSAPP = "WHATSAPP",
  WEBCHAT = "WEBCHAT",
  API = "API",
  MANUAL = "MANUAL",
}

export interface SessionContext {
  currentNodeId?: string;
  previousNodeId?: string;
  lastMessageAt: Date;
  messageCount: number;
  isWaitingForInput: boolean;
  inputType?: string;
  expectedVariable?: string;
  retryCount: number;
  errors: Array<{
    timestamp: Date;
    error: string;
    nodeId?: string;
  }>;
  metadata?: Record<string, any>;
}

export interface SessionVariable {
  name: string;
  value: any;
  type: string;
  collectedAt: Date;
  nodeId?: string;
  validated: boolean;
}

export interface ConversationStep {
  id: string;
  nodeId: string;
  type: "bot_message" | "user_input" | "system_action";
  content: {
    text?: string;
    richText?: any[];
    media?: {
      type: "image" | "video" | "audio" | "document";
      url: string;
      caption?: string;
    };
    buttons?: Array<{
      id: string;
      text: string;
      selected?: boolean;
    }>;
    input?: {
      type: string;
      placeholder?: string;
      validation?: any;
    };
  };
  timestamp: Date;
  processingTime?: number; // milliseconds
  success: boolean;
  error?: string;
}

@Entity("typebot_sessions")
@Index(["tenantId", "status"])
@Index(["flowId", "createdAt"])
@Index(["contactPhone", "tenantId"])
export class TypebotSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255, nullable: true })
  externalSessionId?: string; // External Typebot session ID

  @Column({
    type: "enum",
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({
    type: "enum",
    enum: SessionTrigger,
  })
  trigger: SessionTrigger;

  @Column({ length: 20, nullable: true })
  contactPhone?: string;

  @Column({ length: 255, nullable: true })
  contactName?: string;

  @Column({ length: 255, nullable: true })
  userAgent?: string;

  @Column({ type: "inet", nullable: true })
  ipAddress?: string;

  @Column({ type: "jsonb" })
  variables: SessionVariable[];

  @Column({ type: "jsonb" })
  context: SessionContext;

  @Column({ type: "jsonb", default: [] })
  conversationSteps: ConversationStep[];

  @Column({ type: "timestamp", nullable: true })
  startedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  lastActivityAt?: Date;

  @Column({ type: "integer", default: 0 })
  duration: number; // seconds

  @Column({ type: "boolean", default: false })
  isCompleted: boolean;

  @Column({ type: "boolean", default: false })
  hasCollectedData: boolean;

  @Column({ type: "float", default: 0 })
  completionPercentage: number;

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

  @Column("uuid")
  flowId: string;

  @Column("uuid", { nullable: true })
  instanceId?: string; // WhatsApp instance if triggered via WhatsApp

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @ManyToOne(() => TypebotFlow, (flow) => flow.sessions)
  flow: TypebotFlow;

  @ManyToOne(() => WhatsAppInstance, { nullable: true })
  instance?: WhatsAppInstance;

  // Instance methods
  get isActive(): boolean {
    return this.status === SessionStatus.ACTIVE;
  }

  get isAbandoned(): boolean {
    if (!this.lastActivityAt) return false;
    const now = new Date();
    const hoursSinceLastActivity =
      (now.getTime() - this.lastActivityAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastActivity > 24; // Consider abandoned after 24 hours
  }

  get sessionDuration(): number {
    if (!this.startedAt) return 0;
    const endTime = this.completedAt || new Date();
    return Math.round((endTime.getTime() - this.startedAt.getTime()) / 1000);
  }

  start(): void {
    this.status = SessionStatus.ACTIVE;
    this.startedAt = new Date();
    this.lastActivityAt = new Date();
    this.context = {
      currentNodeId: undefined,
      previousNodeId: undefined,
      lastMessageAt: new Date(),
      messageCount: 0,
      isWaitingForInput: false,
      retryCount: 0,
      errors: [],
    };
  }

  complete(): void {
    this.status = SessionStatus.COMPLETED;
    this.completedAt = new Date();
    this.isCompleted = true;
    this.completionPercentage = 100;
    this.duration = this.sessionDuration;
  }

  abandon(): void {
    this.status = SessionStatus.ABANDONED;
    this.duration = this.sessionDuration;
  }

  transferToAgent(agentId?: string): void {
    this.status = SessionStatus.TRANSFERRED;
    this.metadata = {
      ...this.metadata,
      transferredAt: new Date(),
      agentId,
    };
  }

  setVariable(name: string, value: any, type: string, nodeId?: string): void {
    const existingIndex = this.variables.findIndex((v) => v.name === name);
    const variable: SessionVariable = {
      name,
      value,
      type,
      collectedAt: new Date(),
      nodeId,
      validated: true, // TODO: Add validation logic
    };

    if (existingIndex !== -1) {
      this.variables[existingIndex] = variable;
    } else {
      this.variables.push(variable);
    }

    this.hasCollectedData = true;
    this.lastActivityAt = new Date();
  }

  getVariable(name: string): SessionVariable | null {
    return this.variables.find((v) => v.name === name) || null;
  }

  getVariableValue(name: string): any {
    const variable = this.getVariable(name);
    return variable ? variable.value : null;
  }

  addConversationStep(step: Omit<ConversationStep, "id" | "timestamp">): void {
    const conversationStep: ConversationStep = {
      ...step,
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.conversationSteps.push(conversationStep);
    this.context.messageCount++;
    this.context.lastMessageAt = new Date();
    this.lastActivityAt = new Date();

    // Update completion percentage based on flow progress
    this.updateCompletionPercentage();
  }

  moveToNode(nodeId: string): void {
    this.context.previousNodeId = this.context.currentNodeId;
    this.context.currentNodeId = nodeId;
    this.context.isWaitingForInput = false;
    this.lastActivityAt = new Date();
  }

  waitForInput(inputType: string, expectedVariable?: string): void {
    this.context.isWaitingForInput = true;
    this.context.inputType = inputType;
    this.context.expectedVariable = expectedVariable;
    this.lastActivityAt = new Date();
  }

  addError(error: string, nodeId?: string): void {
    this.context.errors.push({
      timestamp: new Date(),
      error,
      nodeId,
    });
    this.context.retryCount++;
    this.lastError = error;

    if (this.context.retryCount >= 3) {
      this.status = SessionStatus.ERROR;
    }
  }

  clearErrors(): void {
    this.context.errors = [];
    this.context.retryCount = 0;
    this.lastError = null;
  }

  private updateCompletionPercentage(): void {
    // Calculate completion based on nodes visited vs total nodes in flow
    const visitedNodes = new Set(
      this.conversationSteps
        .filter((step) => step.type === "bot_message")
        .map((step) => step.nodeId),
    );

    // This would need access to the flow to calculate properly
    // For now, use message count as a proxy
    const estimatedProgress = Math.min(this.context.messageCount * 10, 90);
    this.completionPercentage = this.isCompleted ? 100 : estimatedProgress;
  }

  getLastUserInput(): ConversationStep | null {
    const userInputs = this.conversationSteps.filter(
      (step) => step.type === "user_input",
    );
    return userInputs.length > 0 ? userInputs[userInputs.length - 1] : null;
  }

  getLastBotMessage(): ConversationStep | null {
    const botMessages = this.conversationSteps.filter(
      (step) => step.type === "bot_message",
    );
    return botMessages.length > 0 ? botMessages[botMessages.length - 1] : null;
  }

  export(): any {
    return {
      id: this.id,
      status: this.status,
      trigger: this.trigger,
      contactPhone: this.contactPhone,
      contactName: this.contactName,
      variables: this.variables,
      conversationSteps: this.conversationSteps,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      duration: this.sessionDuration,
      completionPercentage: this.completionPercentage,
      isCompleted: this.isCompleted,
      hasCollectedData: this.hasCollectedData,
      createdAt: this.createdAt,
    };
  }

  static createFromTrigger(
    flowId: string,
    tenantId: string,
    trigger: SessionTrigger,
    contactInfo?: {
      phone?: string;
      name?: string;
      instanceId?: string;
    },
    initialVariables?: Record<string, any>,
  ): Partial<TypebotSession> {
    return {
      flowId,
      tenantId,
      trigger,
      status: SessionStatus.ACTIVE,
      contactPhone: contactInfo?.phone,
      contactName: contactInfo?.name,
      instanceId: contactInfo?.instanceId,
      variables: initialVariables
        ? Object.entries(initialVariables).map(([name, value]) => ({
            name,
            value,
            type: typeof value,
            collectedAt: new Date(),
            validated: true,
          }))
        : [],
      conversationSteps: [],
      isCompleted: false,
      hasCollectedData: false,
      completionPercentage: 0,
      duration: 0,
    };
  }
}

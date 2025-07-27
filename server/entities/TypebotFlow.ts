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
import { TypebotSession } from "./TypebotSession";

export enum FlowStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  TESTING = "TESTING",
}

export enum FlowType {
  LEAD_CAPTURE = "LEAD_CAPTURE",
  CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT",
  PRODUCT_SHOWCASE = "PRODUCT_SHOWCASE",
  APPOINTMENT_BOOKING = "APPOINTMENT_BOOKING",
  SURVEY_FORM = "SURVEY_FORM",
  FAQ_BOT = "FAQ_BOT",
  CUSTOM = "CUSTOM",
}

export interface FlowNode {
  id: string;
  type:
    | "text"
    | "input"
    | "condition"
    | "webhook"
    | "integration"
    | "buttons"
    | "image"
    | "video";
  data: {
    content?: string;
    richText?: any[];
    variable?: string;
    inputType?: "text" | "email" | "phone" | "number" | "date";
    placeholder?: string;
    conditions?: Array<{
      operator: "equals" | "contains" | "greater" | "less";
      value: string;
      variable: string;
    }>;
    webhookUrl?: string;
    integration?: {
      type: "whatsapp" | "openai" | "crm" | "stripe" | "calendar";
      config: any;
    };
    buttons?: Array<{
      id: string;
      text: string;
      action: "next" | "webhook" | "link";
      target?: string;
    }>;
    mediaUrl?: string;
    mediaType?: "image" | "video" | "audio" | "document";
    caption?: string;
  };
  position: { x: number; y: number };
  nextNodes?: string[];
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: "default" | "conditional";
  label?: string;
}

export interface FlowSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  behavior: {
    typingDelay: number;
    allowRestart: boolean;
    showProgressBar: boolean;
    enableAudio: boolean;
  };
  security: {
    enableEncryption: boolean;
    allowAnonymous: boolean;
    rateLimitEnabled: boolean;
    maxSessionsPerIP: number;
  };
  integrations: {
    whatsappEnabled: boolean;
    webChatEnabled: boolean;
    embedEnabled: boolean;
    apiEnabled: boolean;
  };
  analytics: {
    trackConversions: boolean;
    trackEngagement: boolean;
    enableHeatmaps: boolean;
  };
}

export interface FlowVariable {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "email" | "phone" | "url";
  defaultValue?: string;
  required: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
  isPII: boolean; // For GDPR compliance
  description?: string;
}

@Entity("typebot_flows")
@Index(["tenantId", "type"])
@Index(["tenantId", "status"])
export class TypebotFlow {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: FlowType,
    default: FlowType.CUSTOM,
  })
  type: FlowType;

  @Column({
    type: "enum",
    enum: FlowStatus,
    default: FlowStatus.DRAFT,
  })
  status: FlowStatus;

  @Column({ type: "jsonb" })
  nodes: FlowNode[];

  @Column({ type: "jsonb" })
  edges: FlowEdge[];

  @Column({ type: "jsonb" })
  variables: FlowVariable[];

  @Column({ type: "jsonb" })
  settings: FlowSettings;

  @Column({ length: 255, nullable: true })
  typebotPublicId?: string; // External Typebot ID if using Typebot.io

  @Column({ length: 255, nullable: true })
  publicUrl?: string; // Public sharing URL

  @Column({ type: "boolean", default: false })
  isPublished: boolean;

  @Column({ type: "integer", default: 0 })
  totalSessions: number;

  @Column({ type: "integer", default: 0 })
  completedSessions: number;

  @Column({ type: "float", default: 0 })
  completionRate: number;

  @Column({ type: "integer", default: 0 })
  averageSessionDuration: number; // seconds

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt?: Date;

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

  @OneToMany(() => TypebotSession, (session) => session.flow)
  sessions: TypebotSession[];

  // Instance methods
  get isActive(): boolean {
    return this.status === FlowStatus.PUBLISHED && this.isPublished;
  }

  get hasWhatsAppIntegration(): boolean {
    return this.settings.integrations.whatsappEnabled;
  }

  get conversionRate(): number {
    if (this.totalSessions === 0) return 0;
    return (this.completedSessions / this.totalSessions) * 100;
  }

  updateStats(sessionCompleted: boolean, duration: number): void {
    this.totalSessions++;
    if (sessionCompleted) {
      this.completedSessions++;
    }

    // Update average duration
    this.averageSessionDuration = Math.round(
      (this.averageSessionDuration * (this.totalSessions - 1) + duration) /
        this.totalSessions,
    );

    // Update completion rate
    this.completionRate = (this.completedSessions / this.totalSessions) * 100;

    this.lastUsedAt = new Date();
  }

  publish(): void {
    this.status = FlowStatus.PUBLISHED;
    this.isPublished = true;
  }

  unpublish(): void {
    this.status = FlowStatus.DRAFT;
    this.isPublished = false;
  }

  archive(): void {
    this.status = FlowStatus.ARCHIVED;
    this.isPublished = false;
  }

  getStartNode(): FlowNode | null {
    return (
      this.nodes.find(
        (node) => node.type === "text" || node.type === "input",
      ) || null
    );
  }

  getNodeById(nodeId: string): FlowNode | null {
    return this.nodes.find((node) => node.id === nodeId) || null;
  }

  getNextNodes(currentNodeId: string): FlowNode[] {
    const edges = this.edges.filter((edge) => edge.source === currentNodeId);
    return edges
      .map((edge) => this.getNodeById(edge.target))
      .filter(Boolean) as FlowNode[];
  }

  getVariableByName(name: string): FlowVariable | null {
    return this.variables.find((variable) => variable.name === name) || null;
  }

  validateFlow(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if there's at least one node
    if (this.nodes.length === 0) {
      errors.push("Flow must have at least one node");
    }

    // Check if there's a start node
    const startNode = this.getStartNode();
    if (!startNode) {
      errors.push("Flow must have a starting node");
    }

    // Validate node connections
    const nodeIds = new Set(this.nodes.map((node) => node.id));
    for (const edge of this.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
      }
    }

    // Validate variables
    for (const variable of this.variables) {
      if (!variable.name || variable.name.trim() === "") {
        errors.push("All variables must have a name");
      }
      if (
        variable.required &&
        !variable.defaultValue &&
        variable.type !== "boolean"
      ) {
        // Note: boolean variables can be required without default value
      }
    }

    // Check for orphaned nodes (nodes with no incoming edges except start)
    const targetNodes = new Set(this.edges.map((edge) => edge.target));
    const orphanedNodes = this.nodes.filter(
      (node) => node.id !== startNode?.id && !targetNodes.has(node.id),
    );
    if (orphanedNodes.length > 0) {
      errors.push(`Found ${orphanedNodes.length} orphaned nodes`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  clone(newName: string): Partial<TypebotFlow> {
    return {
      name: newName,
      description: this.description,
      type: this.type,
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      edges: JSON.parse(JSON.stringify(this.edges)),
      variables: JSON.parse(JSON.stringify(this.variables)),
      settings: JSON.parse(JSON.stringify(this.settings)),
      status: FlowStatus.DRAFT,
      isPublished: false,
      tenantId: this.tenantId,
    };
  }

  export(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      nodes: this.nodes,
      edges: this.edges,
      variables: this.variables,
      settings: this.settings,
      metadata: this.metadata,
      version: "1.0.0",
      exportedAt: new Date(),
    };
  }

  static createFromTemplate(
    template: any,
    tenantId: string,
  ): Partial<TypebotFlow> {
    return {
      ...template,
      tenantId,
      status: FlowStatus.DRAFT,
      isPublished: false,
      totalSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      averageSessionDuration: 0,
    };
  }
}

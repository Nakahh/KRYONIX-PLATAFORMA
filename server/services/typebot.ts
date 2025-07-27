import axios, { AxiosInstance } from "axios";
import { AppDataSource } from "../db/connection";
import { TypebotFlow, FlowStatus, FlowType } from "../entities/TypebotFlow";
import {
  TypebotSession,
  SessionStatus,
  SessionTrigger,
} from "../entities/TypebotSession";
import { WhatsAppService } from "./whatsapp";
import { N8NService } from "./n8n";
import { Tenant } from "../entities/Tenant";

// Typebot Configuration
interface TypebotConfig {
  baseURL: string;
  apiKey: string;
  version: string;
  selfHosted: boolean;
}

interface FlowExecutionContext {
  sessionId: string;
  tenantId: string;
  currentNodeId?: string;
  variables: Record<string, any>;
  contactPhone?: string;
  instanceId?: string;
}

interface NodeExecutionResult {
  success: boolean;
  nextNodeId?: string;
  response?: {
    type: "text" | "image" | "video" | "buttons" | "input";
    content: any;
  };
  variables?: Record<string, any>;
  error?: string;
  waitForInput?: boolean;
  completed?: boolean;
}

export class TypebotService {
  private static client: AxiosInstance;
  private static config: TypebotConfig;

  // Initialize Typebot service
  static initialize() {
    this.config = {
      baseURL: process.env.TYPEBOT_API_URL || "http://localhost:3001/api/v1",
      apiKey: process.env.TYPEBOT_API_KEY || "",
      version: "v1",
      selfHosted: process.env.TYPEBOT_SELF_HOSTED === "true",
    };

    if (this.config.apiKey) {
      this.client = axios.create({
        baseURL: this.config.baseURL,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      // Request interceptor
      this.client.interceptors.request.use(
        (config) => {
          console.log(
            `Typebot API Request: ${config.method?.toUpperCase()} ${config.url}`,
          );
          return config;
        },
        (error) => {
          console.error("Typebot API Request Error:", error);
          return Promise.reject(error);
        },
      );

      // Response interceptor
      this.client.interceptors.response.use(
        (response) => {
          console.log(
            `Typebot API Response: ${response.status} ${response.config.url}`,
          );
          return response;
        },
        (error) => {
          console.error(
            "Typebot API Error:",
            error.response?.data || error.message,
          );
          return Promise.reject(error);
        },
      );
    }
  }

  // Flow Management
  static async createFlow(
    tenantId: string,
    flowData: {
      name: string;
      description?: string;
      type: FlowType;
      nodes: any[];
      edges: any[];
      variables: any[];
      settings: any;
    },
  ): Promise<TypebotFlow> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const flowRepository = AppDataSource.getRepository(TypebotFlow);
    const tenantRepository = AppDataSource.getRepository(Tenant);

    // Verify tenant exists
    const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    // Check limits
    const existingFlows = await flowRepository.count({ where: { tenantId } });
    if (existingFlows >= 10) {
      // Example limit
      throw new Error("Maximum number of flows reached for this tenant");
    }

    // Create flow
    const flow = flowRepository.create({
      tenantId,
      name: flowData.name,
      description: flowData.description,
      type: flowData.type,
      nodes: flowData.nodes,
      edges: flowData.edges,
      variables: flowData.variables,
      settings: flowData.settings,
      status: FlowStatus.DRAFT,
      isPublished: false,
    });

    // Validate flow structure
    const validation = flow.validateFlow();
    if (!validation.valid) {
      throw new Error(`Invalid flow: ${validation.errors.join(", ")}`);
    }

    const savedFlow = await flowRepository.save(flow);

    // Create external Typebot if configured
    try {
      if (this.config.apiKey && this.config.selfHosted) {
        const externalTypebot = await this.createExternalTypebot(savedFlow);
        savedFlow.typebotPublicId = externalTypebot.id;
        savedFlow.publicUrl = externalTypebot.publicUrl;
        await flowRepository.save(savedFlow);
      }
    } catch (error) {
      console.error("Failed to create external Typebot:", error);
      // Continue without external integration
    }

    return savedFlow;
  }

  static async getFlowById(
    flowId: string,
    tenantId: string,
  ): Promise<TypebotFlow | null> {
    if (!AppDataSource.isInitialized) {
      return null;
    }

    const flowRepository = AppDataSource.getRepository(TypebotFlow);
    return await flowRepository.findOne({
      where: { id: flowId, tenantId },
      relations: ["tenant"],
    });
  }

  static async getTenantFlows(tenantId: string): Promise<TypebotFlow[]> {
    if (!AppDataSource.isInitialized) {
      return [];
    }

    const flowRepository = AppDataSource.getRepository(TypebotFlow);
    return await flowRepository.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  static async publishFlow(
    flowId: string,
    tenantId: string,
  ): Promise<TypebotFlow> {
    const flow = await this.getFlowById(flowId, tenantId);
    if (!flow) {
      throw new Error("Flow not found");
    }

    // Validate before publishing
    const validation = flow.validateFlow();
    if (!validation.valid) {
      throw new Error(
        `Cannot publish invalid flow: ${validation.errors.join(", ")}`,
      );
    }

    flow.publish();

    if (AppDataSource.isInitialized) {
      const flowRepository = AppDataSource.getRepository(TypebotFlow);
      return await flowRepository.save(flow);
    }

    return flow;
  }

  static async unpublishFlow(
    flowId: string,
    tenantId: string,
  ): Promise<TypebotFlow> {
    const flow = await this.getFlowById(flowId, tenantId);
    if (!flow) {
      throw new Error("Flow not found");
    }

    flow.unpublish();

    if (AppDataSource.isInitialized) {
      const flowRepository = AppDataSource.getRepository(TypebotFlow);
      return await flowRepository.save(flow);
    }

    return flow;
  }

  // Session Management
  static async createSession(
    flowId: string,
    tenantId: string,
    trigger: SessionTrigger,
    contactInfo?: {
      phone?: string;
      name?: string;
      instanceId?: string;
    },
    initialVariables?: Record<string, any>,
  ): Promise<TypebotSession> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const sessionRepository = AppDataSource.getRepository(TypebotSession);
    const flow = await this.getFlowById(flowId, tenantId);

    if (!flow) {
      throw new Error("Flow not found");
    }

    if (!flow.isActive) {
      throw new Error("Flow is not published");
    }

    // Create session
    const sessionData = TypebotSession.createFromTrigger(
      flowId,
      tenantId,
      trigger,
      contactInfo,
      initialVariables,
    );

    const session = sessionRepository.create(sessionData);
    session.start();

    const savedSession = await sessionRepository.save(session);

    // Start flow execution
    await this.startFlowExecution(savedSession, flow);

    return savedSession;
  }

  static async getSessionById(
    sessionId: string,
    tenantId: string,
  ): Promise<TypebotSession | null> {
    if (!AppDataSource.isInitialized) {
      return null;
    }

    const sessionRepository = AppDataSource.getRepository(TypebotSession);
    return await sessionRepository.findOne({
      where: { id: sessionId, tenantId },
      relations: ["flow", "instance"],
    });
  }

  static async continueSession(
    sessionId: string,
    userInput: string,
    tenantId: string,
  ): Promise<{ session: TypebotSession; responses: any[] }> {
    const session = await this.getSessionById(sessionId, tenantId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.isActive) {
      throw new Error("Session is not active");
    }

    const flow = await this.getFlowById(session.flowId, tenantId);
    if (!flow) {
      throw new Error("Flow not found");
    }

    // Add user input to conversation
    session.addConversationStep({
      nodeId: session.context.currentNodeId || "user_input",
      type: "user_input",
      content: { text: userInput },
      success: true,
    });

    // Process user input
    const responses = await this.processUserInput(session, flow, userInput);

    // Save session updates
    if (AppDataSource.isInitialized) {
      const sessionRepository = AppDataSource.getRepository(TypebotSession);
      await sessionRepository.save(session);
    }

    return { session, responses };
  }

  // Flow Execution Engine
  private static async startFlowExecution(
    session: TypebotSession,
    flow: TypebotFlow,
  ): Promise<void> {
    const startNode = flow.getStartNode();
    if (!startNode) {
      throw new Error("Flow has no start node");
    }

    session.moveToNode(startNode.id);

    // Execute the start node
    await this.executeNode(session, flow, startNode);
  }

  private static async processUserInput(
    session: TypebotSession,
    flow: TypebotFlow,
    userInput: string,
  ): Promise<any[]> {
    const responses: any[] = [];

    // Handle variable collection if waiting for input
    if (session.context.isWaitingForInput && session.context.expectedVariable) {
      const variable = flow.getVariableByName(session.context.expectedVariable);
      if (variable) {
        // Validate and store variable
        const isValid = await this.validateUserInput(userInput, variable);
        if (isValid) {
          session.setVariable(
            variable.name,
            userInput,
            variable.type,
            session.context.currentNodeId,
          );
        } else {
          // Handle validation error
          responses.push({
            type: "text",
            content: `Please provide a valid ${variable.type} for ${variable.name}`,
          });
          return responses;
        }
      }
    }

    // Continue flow execution
    const currentNodeId = session.context.currentNodeId;
    if (currentNodeId) {
      const currentNode = flow.getNodeById(currentNodeId);
      if (currentNode) {
        const nextNodes = flow.getNextNodes(currentNodeId);
        if (nextNodes.length > 0) {
          // Execute next node(s)
          for (const nextNode of nextNodes) {
            session.moveToNode(nextNode.id);
            const result = await this.executeNode(session, flow, nextNode);
            if (result.response) {
              responses.push(result.response);
            }
            if (result.waitForInput) {
              break; // Stop execution if waiting for input
            }
          }
        } else {
          // End of flow
          session.complete();
          responses.push({
            type: "text",
            content: "Thank you for using our service!",
          });
        }
      }
    }

    return responses;
  }

  private static async executeNode(
    session: TypebotSession,
    flow: TypebotFlow,
    node: any,
  ): Promise<NodeExecutionResult> {
    try {
      const context: FlowExecutionContext = {
        sessionId: session.id,
        tenantId: session.tenantId,
        currentNodeId: node.id,
        variables: session.variables.reduce(
          (acc, v) => ({ ...acc, [v.name]: v.value }),
          {},
        ),
        contactPhone: session.contactPhone,
        instanceId: session.instanceId,
      };

      switch (node.type) {
        case "text":
          return await this.executeTextNode(session, node, context);
        case "input":
          return await this.executeInputNode(session, node, context);
        case "condition":
          return await this.executeConditionNode(session, flow, node, context);
        case "integration":
          return await this.executeIntegrationNode(session, node, context);
        case "webhook":
          return await this.executeWebhookNode(session, node, context);
        case "buttons":
          return await this.executeButtonsNode(session, node, context);
        case "image":
        case "video":
          return await this.executeMediaNode(session, node, context);
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      session.addError(errorMessage, node.id);

      return {
        success: false,
        error: errorMessage,
        response: {
          type: "text",
          content: "Sorry, I encountered an error. Please try again.",
        },
      };
    }
  }

  private static async executeTextNode(
    session: TypebotSession,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    const content = this.interpolateVariables(
      node.data.content || "",
      context.variables,
    );

    session.addConversationStep({
      nodeId: node.id,
      type: "bot_message",
      content: { text: content },
      success: true,
    });

    return {
      success: true,
      response: {
        type: "text",
        content,
      },
    };
  }

  private static async executeInputNode(
    session: TypebotSession,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    const { inputType, placeholder, variable } = node.data;

    session.waitForInput(inputType, variable);

    session.addConversationStep({
      nodeId: node.id,
      type: "bot_message",
      content: {
        text: placeholder || `Please provide your ${variable}:`,
        input: { type: inputType, placeholder },
      },
      success: true,
    });

    return {
      success: true,
      waitForInput: true,
      response: {
        type: "input",
        content: {
          placeholder: placeholder || `Please provide your ${variable}:`,
          inputType,
        },
      },
    };
  }

  private static async executeConditionNode(
    session: TypebotSession,
    flow: TypebotFlow,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    const { conditions } = node.data;

    for (const condition of conditions || []) {
      const { variable, operator, value } = condition;
      const variableValue = context.variables[variable];

      if (this.evaluateCondition(variableValue, operator, value)) {
        // Find the edge for this condition
        const edges = flow.edges.filter(
          (edge) => edge.source === node.id && edge.label === "true",
        );

        if (edges.length > 0) {
          const nextNode = flow.getNodeById(edges[0].target);
          if (nextNode) {
            session.moveToNode(nextNode.id);
            return await this.executeNode(session, flow, nextNode);
          }
        }
        break;
      }
    }

    // Default path (condition false)
    const falseEdges = flow.edges.filter(
      (edge) => edge.source === node.id && edge.label === "false",
    );

    if (falseEdges.length > 0) {
      const nextNode = flow.getNodeById(falseEdges[0].target);
      if (nextNode) {
        session.moveToNode(nextNode.id);
        return await this.executeNode(session, flow, nextNode);
      }
    }

    return { success: true };
  }

  private static async executeIntegrationNode(
    session: TypebotSession,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    const { integration } = node.data;

    switch (integration?.type) {
      case "whatsapp":
        return await this.executeWhatsAppIntegration(session, node, context);
      case "openai":
        return await this.executeOpenAIIntegration(session, node, context);
      case "crm":
        return await this.executeCRMIntegration(session, node, context);
      default:
        throw new Error(`Unknown integration type: ${integration?.type}`);
    }
  }

  private static async executeWhatsAppIntegration(
    session: TypebotSession,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    const { config } = node.data.integration;
    const { action, message } = config;

    if (
      action === "send_message" &&
      context.instanceId &&
      context.contactPhone
    ) {
      const interpolatedMessage = this.interpolateVariables(
        message,
        context.variables,
      );

      try {
        await WhatsAppService.sendMessage(
          context.instanceId,
          context.contactPhone,
          { text: interpolatedMessage },
        );

        return {
          success: true,
          response: {
            type: "text",
            content: "Message sent via WhatsApp",
          },
        };
      } catch (error) {
        throw new Error(`Failed to send WhatsApp message: ${error}`);
      }
    }

    return { success: true };
  }

  private static async executeOpenAIIntegration(
    session: TypebotSession,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    // TODO: Implement OpenAI integration
    return {
      success: true,
      response: {
        type: "text",
        content: "AI response would go here",
      },
    };
  }

  private static async executeCRMIntegration(
    session: TypebotSession,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    // TODO: Implement CRM integration via N8N workflow
    try {
      await N8NService.executeWorkflow("crm-lead-creation", context.tenantId, {
        variables: context.variables,
        sessionId: context.sessionId,
        contactPhone: context.contactPhone,
      });

      return {
        success: true,
        response: {
          type: "text",
          content: "Your information has been saved to our CRM",
        },
      };
    } catch (error) {
      throw new Error(`CRM integration failed: ${error}`);
    }
  }

  private static async executeWebhookNode(
    session: TypebotSession,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    const { webhookUrl } = node.data;

    try {
      const response = await axios.post(webhookUrl, {
        sessionId: context.sessionId,
        tenantId: context.tenantId,
        variables: context.variables,
        nodeId: node.id,
      });

      return {
        success: true,
        variables: response.data.variables,
        response: response.data.response,
      };
    } catch (error) {
      throw new Error(`Webhook execution failed: ${error}`);
    }
  }

  private static async executeButtonsNode(
    session: TypebotSession,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    const { content, buttons } = node.data;

    session.addConversationStep({
      nodeId: node.id,
      type: "bot_message",
      content: {
        text: content,
        buttons: buttons,
      },
      success: true,
    });

    return {
      success: true,
      waitForInput: true,
      response: {
        type: "buttons",
        content: {
          text: content,
          buttons: buttons,
        },
      },
    };
  }

  private static async executeMediaNode(
    session: TypebotSession,
    node: any,
    context: FlowExecutionContext,
  ): Promise<NodeExecutionResult> {
    const { mediaUrl, mediaType, caption } = node.data;

    session.addConversationStep({
      nodeId: node.id,
      type: "bot_message",
      content: {
        media: { type: mediaType, url: mediaUrl, caption },
      },
      success: true,
    });

    return {
      success: true,
      response: {
        type: mediaType,
        content: {
          url: mediaUrl,
          caption: caption,
        },
      },
    };
  }

  // Helper Methods
  private static interpolateVariables(
    text: string,
    variables: Record<string, any>,
  ): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      return variables[variableName] || match;
    });
  }

  private static evaluateCondition(
    value: any,
    operator: string,
    expected: any,
  ): boolean {
    switch (operator) {
      case "equals":
        return value === expected;
      case "contains":
        return String(value)
          .toLowerCase()
          .includes(String(expected).toLowerCase());
      case "greater":
        return Number(value) > Number(expected);
      case "less":
        return Number(value) < Number(expected);
      default:
        return false;
    }
  }

  private static async validateUserInput(
    input: string,
    variable: any,
  ): Promise<boolean> {
    switch (variable.type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input);
      case "phone":
        const phoneRegex = /^\+?[\d\s-()]+$/;
        return phoneRegex.test(input);
      case "number":
        return !isNaN(Number(input));
      default:
        return true;
    }
  }

  private static async createExternalTypebot(flow: TypebotFlow): Promise<any> {
    if (!this.client) {
      throw new Error("Typebot client not configured");
    }

    const typebotData = {
      name: flow.name,
      publicId: `kryonix_${flow.id}`,
      groups: this.convertNodesToGroups(flow.nodes),
      variables: flow.variables,
      theme: flow.settings.theme,
      settings: flow.settings,
    };

    const response = await this.client.post("/typebots", typebotData);
    return response.data;
  }

  private static convertNodesToGroups(nodes: any[]): any[] {
    // Convert KRYONIX nodes to Typebot format
    // This is a simplified conversion - in practice, this would be more complex
    return nodes.map((node, index) => ({
      id: node.id,
      title: `Step ${index + 1}`,
      blocks: [
        {
          id: `${node.id}_block`,
          type: node.type,
          content: node.data,
        },
      ],
    }));
  }

  // Health Check
  static async healthCheck(): Promise<{
    status: string;
    external: boolean;
    version?: string;
  }> {
    try {
      if (!this.config.apiKey) {
        return { status: "not_configured", external: false };
      }

      if (this.client) {
        const response = await this.client.get("/health");
        return {
          status: "healthy",
          external: true,
          version: response.data.version || "unknown",
        };
      }

      return { status: "internal_only", external: false };
    } catch (error) {
      return {
        status: "unhealthy",
        external: false,
      };
    }
  }
}

// Initialize Typebot service
if (typeof window === "undefined") {
  TypebotService.initialize();
}

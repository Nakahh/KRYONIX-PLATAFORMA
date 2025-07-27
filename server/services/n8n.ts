import axios, { AxiosInstance } from "axios";
import { AppDataSource } from "../db/connection";
import {
  WorkflowTemplate,
  WorkflowType,
  WorkflowStatus,
} from "../entities/WorkflowTemplate";
import {
  WorkflowExecution,
  ExecutionStatus,
  ExecutionMode,
} from "../entities/WorkflowExecution";
import { WhatsAppService } from "./whatsapp";
import { Tenant } from "../entities/Tenant";

// N8N API Configuration
interface N8NConfig {
  baseURL: string;
  apiKey: string;
  webhookURL: string;
}

interface N8NWorkflowResponse {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

interface N8NExecutionResponse {
  id: string;
  finished: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  data?: any;
}

export class N8NService {
  private static client: AxiosInstance;
  private static config: N8NConfig;

  // Initialize N8N client
  static initialize() {
    this.config = {
      baseURL: process.env.N8N_API_URL || "https://n8n.kryonix.com.br/api/v1",
      apiKey: process.env.N8N_API_KEY || "",
      webhookURL: process.env.N8N_WEBHOOK_URL || "https://n8n.kryonix.com.br",
    };

    if (!this.config.apiKey) {
      console.warn("⚠️ N8N_API_KEY not configured - N8N integration disabled");
      return;
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        "X-N8N-API-KEY": this.config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: parseInt(process.env.N8N_TIMEOUT || "60000"),
      auth: process.env.N8N_BASIC_AUTH_USER
        ? {
            username: process.env.N8N_BASIC_AUTH_USER,
            password: process.env.N8N_BASIC_AUTH_PASSWORD || "",
          }
        : undefined,
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(
          `N8N API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        console.error("N8N API Request Error:", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(
          `N8N API Response: ${response.status} ${response.config.url}`,
        );
        return response;
      },
      (error) => {
        console.error("N8N API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      },
    );

    // Testar conexão na inicialização
    this.testConnection();
  }

  private static async testConnection(): Promise<void> {
    try {
      await this.client.get("/workflows?limit=1");
      console.log("✅ N8N connection established successfully");
    } catch (error) {
      console.error("❌ N8N connection failed:", error.message);
    }
  }

  // Workflow Template Management
  static async createWorkflowTemplate(
    tenantId: string,
    templateData: {
      name: string;
      description?: string;
      type: WorkflowType;
      trigger: any;
      definition: any;
      settings: any;
    },
  ): Promise<WorkflowTemplate> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const workflowRepository = AppDataSource.getRepository(WorkflowTemplate);
    const tenantRepository = AppDataSource.getRepository(Tenant);

    // Verify tenant exists
    const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    // Check workflow limits
    if (!tenant.checkLimit("maxActiveWorkflows")) {
      throw new Error("Maximum active workflows limit exceeded");
    }

    // Create workflow template
    const template = workflowRepository.create({
      tenantId,
      name: templateData.name,
      description: templateData.description,
      type: templateData.type,
      trigger: templateData.trigger,
      definition: this.injectTenantContext(templateData.definition, tenantId),
      settings: templateData.settings,
      status: WorkflowStatus.DRAFT,
      isActive: false,
    });

    // Validate workflow definition
    const validation = template.validateDefinition();
    if (!validation.valid) {
      throw new Error(
        `Invalid workflow definition: ${validation.errors.join(", ")}`,
      );
    }

    const savedTemplate = await workflowRepository.save(template);

    // Create workflow in N8N if configuration is available
    try {
      if (this.config.apiKey) {
        const n8nWorkflow = await this.createN8NWorkflow(savedTemplate);
        savedTemplate.n8nWorkflowId = n8nWorkflow.id;
        await workflowRepository.save(savedTemplate);
      }
    } catch (error) {
      console.error("Failed to create N8N workflow:", error);
      // Continue without N8N integration
    }

    return savedTemplate;
  }

  static async activateWorkflow(
    templateId: string,
    tenantId: string,
  ): Promise<WorkflowTemplate> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const workflowRepository = AppDataSource.getRepository(WorkflowTemplate);
    const template = await workflowRepository.findOne({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      throw new Error("Workflow template not found");
    }

    // Activate in N8N if available
    if (template.n8nWorkflowId && this.config.apiKey) {
      try {
        await this.client.patch(`/workflows/${template.n8nWorkflowId}`, {
          active: true,
        });
      } catch (error) {
        console.error("Failed to activate N8N workflow:", error);
      }
    }

    // Update template status
    template.status = WorkflowStatus.ACTIVE;
    template.isActive = true;

    return await workflowRepository.save(template);
  }

  static async deactivateWorkflow(
    templateId: string,
    tenantId: string,
  ): Promise<WorkflowTemplate> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const workflowRepository = AppDataSource.getRepository(WorkflowTemplate);
    const template = await workflowRepository.findOne({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      throw new Error("Workflow template not found");
    }

    // Deactivate in N8N if available
    if (template.n8nWorkflowId && this.config.apiKey) {
      try {
        await this.client.patch(`/workflows/${template.n8nWorkflowId}`, {
          active: false,
        });
      } catch (error) {
        console.error("Failed to deactivate N8N workflow:", error);
      }
    }

    // Update template status
    template.status = WorkflowStatus.PAUSED;
    template.isActive = false;

    return await workflowRepository.save(template);
  }

  static async getTenantWorkflows(
    tenantId: string,
  ): Promise<WorkflowTemplate[]> {
    if (!AppDataSource.isInitialized) {
      return [];
    }

    const workflowRepository = AppDataSource.getRepository(WorkflowTemplate);
    return await workflowRepository.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  // Workflow Execution
  static async executeWorkflow(
    templateId: string,
    tenantId: string,
    inputData?: any,
    context?: any,
  ): Promise<WorkflowExecution> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const workflowRepository = AppDataSource.getRepository(WorkflowTemplate);
    const executionRepository = AppDataSource.getRepository(WorkflowExecution);

    const template = await workflowRepository.findOne({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      throw new Error("Workflow template not found");
    }

    if (!template.canExecute()) {
      throw new Error("Workflow cannot be executed at this time");
    }

    // Create execution record
    const execution = executionRepository.create({
      workflowTemplateId: templateId,
      tenantId,
      status: ExecutionStatus.PENDING,
      mode: ExecutionMode.API,
      context: context || { triggerSource: "api" },
      inputData,
    });

    const savedExecution = await executionRepository.save(execution);

    // Execute in N8N if available
    try {
      if (template.n8nWorkflowId && this.config.apiKey) {
        const n8nExecution = await this.executeN8NWorkflow(
          template.n8nWorkflowId,
          inputData,
        );
        savedExecution.n8nExecutionId = n8nExecution.id;
        savedExecution.start();

        // Atualizar com resultado real
        if (n8nExecution.finished) {
          savedExecution.complete(n8nExecution.data);
        }

        await executionRepository.save(savedExecution);
      } else {
        throw new Error("N8N not configured or workflow not found");
      }
    } catch (error) {
      savedExecution.fail(
        error instanceof Error ? error.message : "Unknown error",
      );
      await executionRepository.save(savedExecution);
      throw error;
    }

    // Update template statistics
    template.updateExecutionStats(savedExecution.isSuccessful);
    await workflowRepository.save(template);

    return savedExecution;
  }

  static async getWorkflowExecutions(
    templateId: string,
    tenantId: string,
    limit = 50,
  ): Promise<WorkflowExecution[]> {
    if (!AppDataSource.isInitialized) {
      return [];
    }

    const executionRepository = AppDataSource.getRepository(WorkflowExecution);
    return await executionRepository.find({
      where: { workflowTemplateId: templateId, tenantId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  static async getExecutionById(
    executionId: string,
    tenantId: string,
  ): Promise<WorkflowExecution | null> {
    if (!AppDataSource.isInitialized) {
      return null;
    }

    const executionRepository = AppDataSource.getRepository(WorkflowExecution);
    return await executionRepository.findOne({
      where: { id: executionId, tenantId },
      relations: ["workflowTemplate"],
    });
  }

  // Webhook Processing
  static async processWebhook(
    tenantId: string,
    templateId: string,
    webhookData: any,
  ): Promise<WorkflowExecution> {
    const template = await AppDataSource.getRepository(
      WorkflowTemplate,
    ).findOne({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      throw new Error("Workflow template not found");
    }

    if (!template.isRunning) {
      throw new Error("Workflow is not active");
    }

    // Create execution from webhook
    const execution = await this.executeWorkflow(
      templateId,
      tenantId,
      webhookData,
      {
        triggerSource: "webhook",
        webhookData,
      },
    );

    return execution;
  }

  // N8N Integration Methods
  private static async createN8NWorkflow(
    template: WorkflowTemplate,
  ): Promise<N8NWorkflowResponse> {
    // Validar definição antes de enviar
    if (
      !template.definition?.nodes ||
      !Array.isArray(template.definition.nodes)
    ) {
      throw new Error("Invalid workflow definition: missing nodes");
    }

    const workflowData = {
      name: `${template.tenantId}_${template.name}`,
      nodes: template.definition.nodes,
      connections: template.definition.connections || {},
      settings: {
        ...template.definition.settings,
        executionOrder: "v1", // Garantir compatibilidade
        saveManualExecutions: true,
        callerPolicy: "workflowsFromSameOwner",
      },
      active: false,
      tags: [`tenant:${template.tenantId}`, `type:${template.type}`],
    };

    try {
      const response = await this.client.post("/workflows", workflowData);
      console.log(`✅ N8N workflow created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error(
        "Failed to create N8N workflow:",
        error.response?.data || error,
      );
      throw new Error(`N8N workflow creation failed: ${error.message}`);
    }
  }

  private static async executeN8NWorkflow(
    n8nWorkflowId: string,
    inputData?: any,
  ): Promise<N8NExecutionResponse> {
    try {
      // 1. Ativar workflow se não estiver ativo
      await this.client.patch(`/workflows/${n8nWorkflowId}`, {
        active: true,
      });

      // 2. Executar workflow via API
      const executionResponse = await this.client.post(
        `/workflows/${n8nWorkflowId}/run`,
        {
          workflowData: inputData || {},
        },
      );

      const executionId = executionResponse.data.executionId;
      console.log(
        `🚀 N8N workflow ${n8nWorkflowId} started - execution ID: ${executionId}`,
      );

      // 3. Aguardar conclusão ou timeout
      const result = await this.waitForExecution(executionId);

      return {
        id: executionId,
        finished: result.finished,
        mode: "api",
        startedAt: result.startedAt,
        stoppedAt: result.stoppedAt,
        workflowId: n8nWorkflowId,
        data: result.data,
      };
    } catch (error) {
      console.error(
        `❌ Failed to execute N8N workflow ${n8nWorkflowId}:`,
        error.message,
      );
      throw new Error(`N8N execution failed: ${error.message}`);
    }
  }

  private static async waitForExecution(
    executionId: string,
    timeoutMs = 30000,
  ): Promise<N8NExecutionResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await this.client.get(`/executions/${executionId}`);
        const execution = response.data;

        if (execution.finished) {
          console.log(`✅ N8N execution ${executionId} completed`);
          return execution;
        }

        console.log(`⏳ N8N execution ${executionId} still running...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error checking execution status:", error);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    throw new Error(
      `N8N execution ${executionId} timeout after ${timeoutMs}ms`,
    );
  }

  // Helper Methods
  private static injectTenantContext(definition: any, tenantId: string): any {
    const updatedDefinition = JSON.parse(JSON.stringify(definition));

    // Inject tenant context into all nodes
    updatedDefinition.nodes = updatedDefinition.nodes.map((node: any) => ({
      ...node,
      parameters: {
        ...node.parameters,
        tenantId: tenantId,
      },
    }));

    return updatedDefinition;
  }

  // Método removido - agora usa execução real via N8N API

  // Template Management
  static async importWorkflowTemplate(
    tenantId: string,
    templateData: any,
  ): Promise<WorkflowTemplate> {
    const template = WorkflowTemplate.createFromTemplate(
      templateData,
      tenantId,
    );

    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const workflowRepository = AppDataSource.getRepository(WorkflowTemplate);
    return await workflowRepository.save(template);
  }

  static async cloneWorkflowTemplate(
    templateId: string,
    tenantId: string,
    newName: string,
  ): Promise<WorkflowTemplate> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const workflowRepository = AppDataSource.getRepository(WorkflowTemplate);
    const original = await workflowRepository.findOne({
      where: { id: templateId, tenantId },
    });

    if (!original) {
      throw new Error("Original workflow template not found");
    }

    const cloned = original.clone(newName);
    return await workflowRepository.save(cloned);
  }

  // Health Check
  static async healthCheck(): Promise<{
    status: string;
    n8nConnected: boolean;
    version?: string;
  }> {
    try {
      if (!this.config.apiKey) {
        return { status: "not_configured", n8nConnected: false };
      }

      const response = await this.client.get("/workflows?limit=1");
      return {
        status: "healthy",
        n8nConnected: true,
        version: response.headers["x-n8n-version"] || "unknown",
      };
    } catch (error) {
      return {
        status: "unhealthy",
        n8nConnected: false,
      };
    }
  }
}

// Initialize N8N service
if (typeof window === "undefined") {
  N8NService.initialize();
}

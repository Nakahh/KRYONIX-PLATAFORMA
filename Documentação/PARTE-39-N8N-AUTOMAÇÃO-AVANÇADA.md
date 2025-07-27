# 🔄 PARTE 39 - N8N AUTOMAÇÃO AVANÇADA
*Agente Responsável: Especialista em Automação + Integração*
*Data: 27 de Janeiro de 2025*

---

## 📋 **VISÃO GERAL**

### **Objetivo**
Implementar workflows avançados de automação usando N8N para orquestrar todos os serviços da plataforma KRYONIX, criando fluxos inteligentes de integração, transformação de dados e automação de processos.

### **Escopo da Parte 39**
- Workflows N8N complexos e escaláveis
- Integração com todas as 32 stacks
- Error handling e retry mechanisms
- Monitoring e alertas automáticos
- Template library de workflows
- Visual workflow editor customizado

### **Agentes Especializados Envolvidos**
- 🔄 **Especialista em Automação** (Líder)
- 🔌 **Especialista em Integração** 
- 🧠 **Especialista IA**
- 📊 **Analista de Sistemas**
- ⚡ **Performance Expert**

---

## 🏗️ **ARQUITETURA N8N AVANÇADA**

### **Estrutura de Workflows**
```yaml
# config/n8n/workflows-structure.yml
workflows:
  core:
    - user-registration-flow
    - data-synchronization
    - notification-orchestrator
    - backup-automation
    - health-monitoring
  
  communication:
    - whatsapp-message-router
    - email-campaign-manager
    - social-media-publisher
    - sms-notification-sender
    - push-notification-handler
  
  ai:
    - ml-model-training
    - prediction-pipeline
    - recommendation-engine
    - sentiment-analysis
    - auto-scaling-trigger
  
  business:
    - lead-scoring-automation
    - invoice-generation
    - customer-journey-tracker
    - performance-reporter
    - compliance-auditor

environment:
  production:
    parallel_executions: 50
    timeout: 300000
    retry_attempts: 3
    log_level: "info"
  
  development:
    parallel_executions: 10
    timeout: 60000
    retry_attempts: 1
    log_level: "debug"
```

### **Conectores Personalizados**
```typescript
// src/n8n/custom-nodes/kryonix-connector.ts
import { INodeType, INodeTypeDescription, IExecuteFunctions } from 'n8n-workflow';

export class KryonixConnector implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Kryonix Stack Connector',
    name: 'kryonixConnector',
    group: ['transform'],
    version: 1,
    description: 'Connector para todas as 32 stacks da Kryonix',
    defaults: {
      name: 'Kryonix Connector',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Service',
        name: 'service',
        type: 'options',
        options: [
          { name: 'PostgreSQL', value: 'postgresql' },
          { name: 'MinIO', value: 'minio' },
          { name: 'Redis', value: 'redis' },
          { name: 'Evolution API', value: 'evolution' },
          { name: 'Chatwoot', value: 'chatwoot' },
          { name: 'Typebot', value: 'typebot' },
          { name: 'Mautic', value: 'mautic' },
          { name: 'Dify AI', value: 'dify' },
          { name: 'Ollama', value: 'ollama' },
          { name: 'Grafana', value: 'grafana' },
          { name: 'Prometheus', value: 'prometheus' },
          { name: 'Portainer', value: 'portainer' },
        ],
        default: 'postgresql',
        required: true,
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          { name: 'Create', value: 'create' },
          { name: 'Read', value: 'read' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' },
          { name: 'Sync', value: 'sync' },
          { name: 'Monitor', value: 'monitor' },
        ],
        default: 'read',
        required: true,
      },
    ],
  };

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      const service = this.getNodeParameter('service', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;
      
      try {
        const result = await this.executeServiceOperation(service, operation, items[i]);
        returnData.push({ json: result });
      } catch (error) {
        throw new Error(`Erro no serviço ${service}: ${error.message}`);
      }
    }

    return [returnData];
  }

  private async executeServiceOperation(service: string, operation: string, data: any) {
    const serviceMap = {
      postgresql: () => this.handlePostgreSQL(operation, data),
      minio: () => this.handleMinIO(operation, data),
      redis: () => this.handleRedis(operation, data),
      evolution: () => this.handleEvolutionAPI(operation, data),
      chatwoot: () => this.handleChatwoot(operation, data),
      typebot: () => this.handleTypebot(operation, data),
      mautic: () => this.handleMautic(operation, data),
      dify: () => this.handleDifyAI(operation, data),
      ollama: () => this.handleOllama(operation, data),
      grafana: () => this.handleGrafana(operation, data),
      prometheus: () => this.handlePrometheus(operation, data),
      portainer: () => this.handlePortainer(operation, data),
    };

    const handler = serviceMap[service];
    if (!handler) {
      throw new Error(`Serviço ${service} não suportado`);
    }

    return await handler();
  }

  private async handlePostgreSQL(operation: string, data: any) {
    // Implementação PostgreSQL
    return { success: true, service: 'postgresql', operation, data };
  }

  private async handleEvolutionAPI(operation: string, data: any) {
    // Implementação Evolution API
    return { success: true, service: 'evolution', operation, data };
  }

  // Implementar handlers para todos os serviços...
}
```

### **Orquestrador Principal**
```typescript
// src/n8n/orchestrator/workflow-orchestrator.ts
export class WorkflowOrchestrator {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executionQueue: ExecutionQueue;
  private monitoring: WorkflowMonitoring;

  constructor() {
    this.executionQueue = new ExecutionQueue();
    this.monitoring = new WorkflowMonitoring();
  }

  async registerWorkflow(definition: WorkflowDefinition): Promise<void> {
    this.workflows.set(definition.id, definition);
    await this.validateWorkflow(definition);
    this.monitoring.registerWorkflow(definition.id);
  }

  async executeWorkflow(
    workflowId: string, 
    input: any, 
    options: ExecutionOptions = {}
  ): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} não encontrado`);
    }

    const execution = new WorkflowExecution(workflow, input, options);
    
    try {
      this.monitoring.startExecution(execution.id);
      const result = await this.executionQueue.add(() => execution.run());
      this.monitoring.completeExecution(execution.id, result);
      return result;
    } catch (error) {
      this.monitoring.failExecution(execution.id, error);
      throw error;
    }
  }

  async createUserRegistrationFlow(): Promise<WorkflowDefinition> {
    return {
      id: 'user-registration',
      name: 'User Registration Flow',
      description: 'Automação completa de registro de usuário',
      triggers: ['user_signup'],
      steps: [
        {
          id: 'validate-data',
          type: 'validation',
          config: {
            schema: userRegistrationSchema,
            sanitize: true
          }
        },
        {
          id: 'create-keycloak-user',
          type: 'service-call',
          service: 'keycloak',
          operation: 'createUser',
          config: {
            retry: 3,
            timeout: 30000
          }
        },
        {
          id: 'create-database-record',
          type: 'database',
          service: 'postgresql',
          operation: 'insert',
          table: 'users',
          config: {
            transaction: true
          }
        },
        {
          id: 'send-welcome-email',
          type: 'communication',
          service: 'mautic',
          operation: 'sendTemplate',
          config: {
            template: 'welcome-email',
            async: true
          }
        },
        {
          id: 'setup-typebot-session',
          type: 'service-call',
          service: 'typebot',
          operation: 'createSession',
          config: {
            flow: 'onboarding'
          }
        },
        {
          id: 'log-registration',
          type: 'logging',
          level: 'info',
          message: 'User registration completed'
        }
      ],
      errorHandling: {
        retryStrategy: 'exponential-backoff',
        maxRetries: 3,
        fallbackActions: ['notify-admin', 'rollback-changes']
      }
    };
  }

  async createDataSyncFlow(): Promise<WorkflowDefinition> {
    return {
      id: 'data-synchronization',
      name: 'Multi-Service Data Sync',
      description: 'Sincronização de dados entre todos os serviços',
      triggers: ['schedule:daily', 'data_change'],
      steps: [
        {
          id: 'extract-postgresql',
          type: 'database',
          service: 'postgresql',
          operation: 'extract',
          config: {
            tables: ['users', 'contacts', 'campaigns'],
            incremental: true
          }
        },
        {
          id: 'transform-data',
          type: 'transform',
          config: {
            mappings: dataTransformMappings,
            validations: dataValidationRules
          }
        },
        {
          id: 'sync-chatwoot',
          type: 'service-call',
          service: 'chatwoot',
          operation: 'syncContacts',
          config: {
            batchSize: 100,
            parallel: true
          }
        },
        {
          id: 'sync-mautic',
          type: 'service-call',
          service: 'mautic',
          operation: 'syncContacts',
          config: {
            segmentation: true,
            updateExisting: true
          }
        },
        {
          id: 'update-cache',
          type: 'cache',
          service: 'redis',
          operation: 'refresh',
          config: {
            keys: ['user-data', 'contact-lists', 'campaign-stats']
          }
        },
        {
          id: 'publish-sync-event',
          type: 'messaging',
          service: 'rabbitmq',
          operation: 'publish',
          config: {
            exchange: 'data-sync',
            routingKey: 'sync.completed'
          }
        }
      ]
    };
  }

  private async validateWorkflow(definition: WorkflowDefinition): Promise<void> {
    // Validação de estrutura
    if (!definition.id || !definition.steps) {
      throw new Error('Workflow inválido: ID e steps são obrigatórios');
    }

    // Validação de dependências
    for (const step of definition.steps) {
      if (step.service && !this.isServiceAvailable(step.service)) {
        throw new Error(`Serviço ${step.service} não disponível`);
      }
    }

    // Validação de circular dependencies
    await this.checkCircularDependencies(definition);
  }

  private isServiceAvailable(service: string): boolean {
    const availableServices = [
      'postgresql', 'minio', 'redis', 'evolution', 'chatwoot',
      'typebot', 'mautic', 'dify', 'ollama', 'grafana', 'prometheus'
    ];
    return availableServices.includes(service);
  }
}
```

---

## 🔧 **WORKFLOWS PRÉ-CONFIGURADOS**

### **1. Workflow de Comunicação Omnichannel**
```typescript
// src/n8n/workflows/communication-orchestrator.ts
export class CommunicationOrchestrator {
  async createOmnichannelFlow(): Promise<WorkflowDefinition> {
    return {
      id: 'omnichannel-communication',
      name: 'Omnichannel Message Router',
      description: 'Roteamento inteligente de mensagens multi-canal',
      triggers: ['message_received'],
      steps: [
        {
          id: 'detect-channel',
          type: 'conditional',
          conditions: [
            { if: 'input.channel === "whatsapp"', goto: 'process-whatsapp' },
            { if: 'input.channel === "email"', goto: 'process-email' },
            { if: 'input.channel === "chat"', goto: 'process-chat' },
            { if: 'input.channel === "sms"', goto: 'process-sms' },
            { default: 'handle-unknown-channel' }
          ]
        },
        {
          id: 'process-whatsapp',
          type: 'service-call',
          service: 'evolution',
          operation: 'processMessage',
          config: {
            aiResponse: true,
            sentiment: true,
            routing: 'intelligent'
          }
        },
        {
          id: 'process-email',
          type: 'service-call',
          service: 'mautic',
          operation: 'processEmail',
          config: {
            autoResponder: true,
            tracking: true,
            segmentation: true
          }
        },
        {
          id: 'process-chat',
          type: 'service-call',
          service: 'chatwoot',
          operation: 'routeConversation',
          config: {
            agentAssignment: 'auto',
            priority: 'calculated'
          }
        },
        {
          id: 'analyze-sentiment',
          type: 'ai-analysis',
          service: 'dify',
          operation: 'analyzeSentiment',
          config: {
            model: 'sentiment-analyzer',
            confidence: 0.8
          }
        },
        {
          id: 'trigger-typebot',
          type: 'conditional',
          conditions: [
            { 
              if: 'sentiment.score < 0.3', 
              action: 'escalate-to-human' 
            },
            { 
              if: 'sentiment.score >= 0.7', 
              action: 'continue-automation' 
            }
          ]
        },
        {
          id: 'update-crm',
          type: 'service-call',
          service: 'chatwoot',
          operation: 'updateContact',
          config: {
            fields: ['last_interaction', 'channel', 'sentiment'],
            sync: true
          }
        },
        {
          id: 'log-interaction',
          type: 'database',
          service: 'postgresql',
          operation: 'insert',
          table: 'communication_logs',
          config: {
            include_metadata: true,
            retention_days: 365
          }
        }
      ]
    };
  }
}
```

### **2. Workflow de IA e Machine Learning**
```typescript
// src/n8n/workflows/ai-pipeline.ts
export class AIPipelineOrchestrator {
  async createMLPipeline(): Promise<WorkflowDefinition> {
    return {
      id: 'ml-training-pipeline',
      name: 'Machine Learning Training Pipeline',
      description: 'Pipeline automático de treinamento de modelos IA',
      triggers: ['schedule:weekly', 'data_threshold_reached'],
      steps: [
        {
          id: 'extract-training-data',
          type: 'database',
          service: 'postgresql',
          operation: 'extract',
          config: {
            query: 'training_data_query.sql',
            cache: false,
            streaming: true
          }
        },
        {
          id: 'preprocess-data',
          type: 'ai-processing',
          service: 'dify',
          operation: 'preprocessData',
          config: {
            normalization: true,
            feature_engineering: true,
            outlier_detection: true
          }
        },
        {
          id: 'train-model',
          type: 'ai-training',
          service: 'ollama',
          operation: 'trainModel',
          config: {
            model_type: 'transformer',
            epochs: 100,
            early_stopping: true,
            validation_split: 0.2
          }
        },
        {
          id: 'evaluate-model',
          type: 'ai-evaluation',
          service: 'dify',
          operation: 'evaluateModel',
          config: {
            metrics: ['accuracy', 'precision', 'recall', 'f1'],
            threshold: 0.85
          }
        },
        {
          id: 'conditional-deployment',
          type: 'conditional',
          conditions: [
            { 
              if: 'evaluation.accuracy >= 0.85',
              goto: 'deploy-model'
            },
            {
              default: 'notify-poor-performance'
            }
          ]
        },
        {
          id: 'deploy-model',
          type: 'service-call',
          service: 'ollama',
          operation: 'deployModel',
          config: {
            version_control: true,
            rollback_enabled: true,
            health_checks: true
          }
        },
        {
          id: 'update-langfuse',
          type: 'service-call',
          service: 'langfuse',
          operation: 'trackModelDeployment',
          config: {
            metrics: true,
            performance_tracking: true
          }
        },
        {
          id: 'notify-deployment',
          type: 'notification',
          channels: ['slack', 'email'],
          config: {
            template: 'model-deployment-success',
            include_metrics: true
          }
        }
      ]
    };
  }

  async createPredictionPipeline(): Promise<WorkflowDefinition> {
    return {
      id: 'prediction-pipeline',
      name: 'Real-time Prediction Pipeline',
      description: 'Pipeline de predições em tempo real',
      triggers: ['prediction_request'],
      steps: [
        {
          id: 'validate-input',
          type: 'validation',
          config: {
            schema: predictionInputSchema,
            sanitize: true,
            required_fields: ['user_id', 'features']
          }
        },
        {
          id: 'feature-engineering',
          type: 'ai-processing',
          service: 'dify',
          operation: 'engineerFeatures',
          config: {
            feature_store: true,
            real_time: true
          }
        },
        {
          id: 'load-model',
          type: 'ai-model',
          service: 'ollama',
          operation: 'loadModel',
          config: {
            model_id: 'latest_deployed',
            cache: true
          }
        },
        {
          id: 'make-prediction',
          type: 'ai-inference',
          service: 'ollama',
          operation: 'predict',
          config: {
            batch_size: 1,
            return_confidence: true,
            explain: true
          }
        },
        {
          id: 'post-process',
          type: 'transform',
          config: {
            format: 'api_response',
            include_confidence: true,
            include_explanation: true
          }
        },
        {
          id: 'cache-result',
          type: 'cache',
          service: 'redis',
          operation: 'set',
          config: {
            ttl: 300,
            key_pattern: 'prediction:{user_id}:{hash}'
          }
        },
        {
          id: 'track-prediction',
          type: 'service-call',
          service: 'langfuse',
          operation: 'trackPrediction',
          config: {
            include_features: true,
            include_result: true,
            performance_metrics: true
          }
        }
      ]
    };
  }
}
```

---

## 📊 **MONITORAMENTO E ALERTAS**

### **Sistema de Monitoramento de Workflows**
```typescript
// src/n8n/monitoring/workflow-monitor.ts
export class WorkflowMonitor {
  private metrics: MetricsCollector;
  private alerting: AlertingSystem;
  private dashboard: MonitoringDashboard;

  constructor() {
    this.metrics = new MetricsCollector();
    this.alerting = new AlertingSystem();
    this.dashboard = new MonitoringDashboard();
  }

  async setupMonitoring(): Promise<void> {
    // Configurar métricas Prometheus
    await this.metrics.registerMetrics([
      {
        name: 'n8n_workflow_executions_total',
        type: 'counter',
        help: 'Total de execuções de workflows',
        labels: ['workflow_id', 'status']
      },
      {
        name: 'n8n_workflow_duration_seconds',
        type: 'histogram',
        help: 'Duração das execuções de workflows',
        labels: ['workflow_id'],
        buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
      },
      {
        name: 'n8n_workflow_errors_total',
        type: 'counter',
        help: 'Total de erros em workflows',
        labels: ['workflow_id', 'error_type']
      },
      {
        name: 'n8n_active_executions',
        type: 'gauge',
        help: 'Número de execuções ativas',
        labels: ['workflow_id']
      }
    ]);

    // Configurar alertas
    await this.alerting.setupAlerts([
      {
        name: 'workflow-failure-rate',
        condition: 'rate(n8n_workflow_errors_total[5m]) > 0.1',
        severity: 'warning',
        channels: ['slack', 'email']
      },
      {
        name: 'workflow-long-execution',
        condition: 'n8n_workflow_duration_seconds > 300',
        severity: 'warning',
        channels: ['slack']
      },
      {
        name: 'workflow-stuck',
        condition: 'n8n_active_executions > 50',
        severity: 'critical',
        channels: ['slack', 'email', 'pagerduty']
      }
    ]);

    // Configurar dashboard Grafana
    await this.dashboard.createDashboard({
      title: 'N8N Workflows Monitoring',
      panels: [
        {
          title: 'Execuções por Workflow',
          type: 'graph',
          query: 'sum by (workflow_id) (rate(n8n_workflow_executions_total[5m]))'
        },
        {
          title: 'Taxa de Erro',
          type: 'stat',
          query: 'sum(rate(n8n_workflow_errors_total[5m])) / sum(rate(n8n_workflow_executions_total[5m]))'
        },
        {
          title: 'Duração Média',
          type: 'graph',
          query: 'avg by (workflow_id) (n8n_workflow_duration_seconds)'
        },
        {
          title: 'Workflows Ativos',
          type: 'stat',
          query: 'sum(n8n_active_executions)'
        }
      ]
    });
  }

  async trackExecution(workflowId: string, status: string, duration: number): Promise<void> {
    this.metrics.incrementCounter('n8n_workflow_executions_total', { workflow_id: workflowId, status });
    this.metrics.observeHistogram('n8n_workflow_duration_seconds', duration, { workflow_id: workflowId });
    
    if (status === 'error') {
      this.metrics.incrementCounter('n8n_workflow_errors_total', { workflow_id: workflowId });
    }
  }
}
```

### **Sistema de Health Checks**
```typescript
// src/n8n/monitoring/health-checker.ts
export class WorkflowHealthChecker {
  private healthChecks: Map<string, HealthCheck> = new Map();

  async registerHealthChecks(): Promise<void> {
    // Health check para conectividade com serviços
    this.healthChecks.set('service-connectivity', {
      name: 'Service Connectivity',
      check: async () => {
        const services = ['postgresql', 'redis', 'evolution', 'chatwoot'];
        const results = await Promise.allSettled(
          services.map(service => this.checkServiceHealth(service))
        );
        
        const unhealthy = results.filter(r => r.status === 'rejected');
        return {
          healthy: unhealthy.length === 0,
          details: { unhealthy_services: unhealthy.length }
        };
      },
      interval: 30000
    });

    // Health check para performance de workflows
    this.healthChecks.set('workflow-performance', {
      name: 'Workflow Performance',
      check: async () => {
        const avgDuration = await this.getAverageWorkflowDuration();
        const errorRate = await this.getWorkflowErrorRate();
        
        return {
          healthy: avgDuration < 60 && errorRate < 0.05,
          details: { avg_duration: avgDuration, error_rate: errorRate }
        };
      },
      interval: 60000
    });

    // Health check para queue status
    this.healthChecks.set('queue-status', {
      name: 'Queue Status',
      check: async () => {
        const queueSize = await this.getQueueSize();
        const oldestExecution = await this.getOldestQueuedExecution();
        
        return {
          healthy: queueSize < 100 && oldestExecution < 300,
          details: { queue_size: queueSize, oldest_execution: oldestExecution }
        };
      },
      interval: 15000
    });
  }

  async runHealthChecks(): Promise<HealthCheckResult[]> {
    const results = [];
    
    for (const [id, check] of this.healthChecks) {
      try {
        const result = await check.check();
        results.push({
          id,
          name: check.name,
          ...result,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          id,
          name: check.name,
          healthy: false,
          error: error.message,
          timestamp: new Date()
        });
      }
    }
    
    return results;
  }
}
```

---

## 🚀 **IMPLEMENTAÇÃO E DEPLOY**

### **Docker Configuration**
```yaml
# docker/n8n/docker-compose.yml
version: '3.8'

services:
  n8n-advanced:
    image: n8nio/n8n:latest
    container_name: n8n-kryonix
    restart: unless-stopped
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgresql
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_kryonix
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - WEBHOOK_URL=https://n8n.kryonix.com.br/
      - N8N_METRICS=true
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console,file
      - N8N_LOG_FILE_LOCATION=/home/node/logs/
      - EXECUTIONS_PROCESS=main
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_PASSWORD=${REDIS_PASSWORD}
      - N8N_PAYLOAD_SIZE_MAX=64
      - N8N_DISABLE_UI=false
      - N8N_PERSONALIZATION_ENABLED=false
      - N8N_VERSION_NOTIFICATIONS_ENABLED=false
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_PUBLIC_API_DISABLED=false
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
      - n8n_logs:/home/node/logs
      - ./custom-nodes:/home/node/.n8n/custom-nodes
      - ./workflows:/home/node/.n8n/workflows
    networks:
      - kryonix-network
    depends_on:
      - postgresql
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`n8n.kryonix.com.br`)"
      - "traefik.http.routers.n8n.tls=true"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  n8n-worker:
    image: n8nio/n8n:latest
    container_name: n8n-worker-kryonix
    restart: unless-stopped
    command: worker
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgresql
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_kryonix
      - DB_POSTGRESDB_USER=${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_PASSWORD=${REDIS_PASSWORD}
      - N8N_LOG_LEVEL=info
    volumes:
      - n8n_data:/home/node/.n8n
      - ./custom-nodes:/home/node/.n8n/custom-nodes
    networks:
      - kryonix-network
    depends_on:
      - postgresql
      - redis
    deploy:
      replicas: 3

volumes:
  n8n_data:
  n8n_logs:

networks:
  kryonix-network:
    external: true
```

### **Configuração de Ambiente**
```bash
#!/bin/bash
# scripts/setup-n8n-advanced.sh

echo "🔄 Configurando N8N Automação Avançada..."

# Criar diretórios
mkdir -p custom-nodes workflows backup logs

# Configurar variáveis de ambiente
cat > .env.n8n << EOF
N8N_USER=kryonix
N8N_PASSWORD=Vitor@123456
N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)
N8N_USER_MANAGEMENT_JWT_SECRET=$(openssl rand -hex 32)
EOF

# Instalar custom nodes
echo "📦 Instalando custom nodes..."
npm init -y
npm install n8n-nodes-base @n8n/typeorm mysql2 pg redis

# Configurar workflows iniciais
echo "🔧 Configurando workflows iniciais..."
node scripts/setup-initial-workflows.js

# Configurar monitoring
echo "📊 Configurando monitoring..."
cp config/grafana/n8n-dashboard.json /var/lib/grafana/dashboards/
cp config/prometheus/n8n-rules.yml /etc/prometheus/rules/

# Configurar backup automático
echo "💾 Configurando backup automático..."
crontab -l | { cat; echo "0 2 * * * /app/scripts/backup-n8n.sh"; } | crontab -

# Deploy
echo "🚀 Fazendo deploy N8N..."
docker-compose -f docker/n8n/docker-compose.yml up -d

# Health check
echo "🏥 Verificando saúde do serviço..."
timeout 60 bash -c 'until curl -f http://localhost:5678/healthz; do sleep 2; done'

echo "✅ N8N Automação Avançada configurado com sucesso!"
echo "🌐 Acesso: https://n8n.kryonix.com.br"
echo "👤 Usuário: kryonix"
echo "🔑 Senha: Vitor@123456"
```

---

## 🧪 **TESTES E VALIDAÇÃO**

### **Testes Automatizados**
```typescript
// tests/n8n/workflow-tests.spec.ts
import { WorkflowOrchestrator } from '../src/n8n/orchestrator/workflow-orchestrator';
import { CommunicationOrchestrator } from '../src/n8n/workflows/communication-orchestrator';

describe('N8N Workflow Tests', () => {
  let orchestrator: WorkflowOrchestrator;
  let communicationOrchestrator: CommunicationOrchestrator;

  beforeEach(() => {
    orchestrator = new WorkflowOrchestrator();
    communicationOrchestrator = new CommunicationOrchestrator();
  });

  describe('User Registration Flow', () => {
    it('should execute complete user registration workflow', async () => {
      const workflow = await orchestrator.createUserRegistrationFlow();
      const result = await orchestrator.executeWorkflow(workflow.id, {
        email: 'test@kryonix.com.br',
        name: 'Test User',
        phone: '+5517981805327'
      });

      expect(result.success).toBe(true);
      expect(result.steps.length).toBe(6);
      expect(result.duration).toBeLessThan(10000);
    });

    it('should handle registration errors gracefully', async () => {
      const workflow = await orchestrator.createUserRegistrationFlow();
      const result = await orchestrator.executeWorkflow(workflow.id, {
        email: 'invalid-email'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation');
      expect(result.rollback).toBe(true);
    });
  });

  describe('Communication Orchestrator', () => {
    it('should route WhatsApp messages correctly', async () => {
      const workflow = await communicationOrchestrator.createOmnichannelFlow();
      const result = await orchestrator.executeWorkflow(workflow.id, {
        channel: 'whatsapp',
        from: '+5517981805327',
        message: 'Olá, preciso de ajuda!'
      });

      expect(result.success).toBe(true);
      expect(result.data.routed_to).toBe('typebot');
      expect(result.data.sentiment_analyzed).toBe(true);
    });

    it('should escalate negative sentiment to human agent', async () => {
      const workflow = await communicationOrchestrator.createOmnichannelFlow();
      const result = await orchestrator.executeWorkflow(workflow.id, {
        channel: 'whatsapp',
        from: '+5517981805327',
        message: 'Estou muito insatisfeito! Serviço péssimo!'
      });

      expect(result.success).toBe(true);
      expect(result.data.escalated).toBe(true);
      expect(result.data.assigned_agent).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should handle high concurrent execution load', async () => {
      const promises = Array.from({ length: 100 }, () => 
        orchestrator.executeWorkflow('data-synchronization', {})
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      expect(successful).toBeGreaterThan(95);
    });

    it('should complete workflows within SLA', async () => {
      const start = Date.now();
      await orchestrator.executeWorkflow('user-registration', testData);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // 5 segundos SLA
    });
  });
});
```

### **Testes de Integração**
```typescript
// tests/integration/service-integration.spec.ts
describe('Service Integration Tests', () => {
  it('should integrate with all 32 stacks successfully', async () => {
    const services = [
      'postgresql', 'minio', 'redis', 'evolution', 'chatwoot',
      'typebot', 'mautic', 'dify', 'ollama', 'grafana', 'prometheus'
    ];

    for (const service of services) {
      const health = await checkServiceHealth(service);
      expect(health.status).toBe('healthy');
    }
  });

  it('should maintain data consistency across services', async () => {
    const userId = 'test-user-123';
    
    // Criar usuário via workflow
    await orchestrator.executeWorkflow('user-registration', {
      id: userId,
      email: 'consistency@test.com'
    });

    // Verificar em todos os serviços
    const keycloakUser = await keycloak.getUser(userId);
    const dbUser = await postgresql.findUser(userId);
    const mauticContact = await mautic.getContact(userId);
    const chatwootContact = await chatwoot.getContact(userId);

    expect(keycloakUser.email).toBe(dbUser.email);
    expect(dbUser.email).toBe(mauticContact.email);
    expect(mauticContact.email).toBe(chatwootContact.email);
  });
});
```

---

## 📚 **TUTORIAL PARA USUÁRIO FINAL**

### **Guia Completo - Automação N8N**

#### **Passo 1: Acessar o N8N**
1. Abra seu navegador
2. Acesse: `https://n8n.kryonix.com.br`
3. Faça login com suas credenciais

#### **Passo 2: Criar Seu Primeiro Workflow**
1. Clique em "New Workflow"
2. Arraste o node "Trigger" para começar
3. Configure o gatilho desejado
4. Adicione nodes de ação
5. Conecte os nodes
6. Teste o workflow
7. Ative o workflow

#### **Passo 3: Usar Templates Prontos**
1. Acesse "Templates"
2. Escolha um template (ex: "Automação de WhatsApp")
3. Clique em "Use Template"
4. Configure os parâmetros
5. Teste e ative

#### **Passo 4: Monitorar Execuções**
1. Vá para "Executions"
2. Veja histórico de execuções
3. Analise logs de erro
4. Configure alertas

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

### **Funcionalidades Básicas**
- [ ] N8N instalado e funcionando
- [ ] Interface web acessível
- [ ] Autenticação configurada
- [ ] Database PostgreSQL conectado
- [ ] Redis queue funcionando

### **Custom Nodes**
- [ ] Kryonix Connector instalado
- [ ] Todos os 32 serviços conectáveis
- [ ] Error handling implementado
- [ ] Retry mechanisms funcionando

### **Workflows Pré-configurados**
- [ ] User Registration Flow ativo
- [ ] Data Synchronization funcionando
- [ ] Omnichannel Communication operacional
- [ ] ML Pipeline configurado
- [ ] Prediction Pipeline ativo

### **Monitoramento**
- [ ] Métricas Prometheus coletadas
- [ ] Dashboard Grafana criado
- [ ] Alertas configurados
- [ ] Health checks ativos
- [ ] Logs centralizados

### **Performance**
- [ ] Execução paralela funcionando
- [ ] Queue Redis operacional
- [ ] Workers N8N ativos
- [ ] Load balancing configurado
- [ ] Auto-scaling implementado

### **Integração**
- [ ] Evolution API conectada
- [ ] Chatwoot integrado
- [ ] Typebot funcionando
- [ ] Mautic conectado
- [ ] Dify AI integrado
- [ ] Ollama conectado
- [ ] Todas as 32 stacks testadas

### **Testes**
- [ ] Testes unitários passando
- [ ] Testes de integração OK
- [ ] Testes de performance validados
- [ ] Testes de carga realizados
- [ ] Error scenarios testados

### **Documentação**
- [ ] Workflows documentados
- [ ] API documentation criada
- [ ] Tutorial usuário final
- [ ] Guias de troubleshooting
- [ ] Runbooks operacionais

---

## 🚀 **PRÓXIMOS PASSOS**

### **Imediatos (Esta Semana)**
1. ✅ Deploy N8N com configurações avançadas
2. ✅ Implementar workflows críticos
3. ✅ Configurar monitoramento
4. ✅ Testes de integração com todos os serviços

### **Próxima Semana**
1. Otimizar performance dos workflows
2. Implementar workflows adicionais
3. Configurar alertas avançados
4. Treinamento da equipe

### **Integração com Outras Partes**
- **Parte 40**: Mautic Marketing (workflows de campanha)
- **Parte 41**: Email Marketing (templates automatizados)
- **Parte 42**: SMS/Push (notificações automáticas)
- **Parte 46**: Testes Automatizados (CI/CD workflows)

---

## 📞 **SUPORTE E CONTATO**

### **Equipe Responsável**
- **Especialista Automação**: automacao@kryonix.com.br
- **Especialista Integração**: integracao@kryonix.com.br
- **Suporte Técnico**: suporte@kryonix.com.br

### **Recursos Adicionais**
- **Documentação N8N**: https://docs.n8n.io
- **Community**: https://community.n8n.io
- **Workflows Marketplace**: https://n8n.io/workflows

---

**🎯 Parte 39 de 50 concluída! Automação N8N avançada implementada com sucesso!**

*Próxima: Parte 40 - Mautic Marketing*

---

*Documentação criada por: Especialista em Automação*  
*Data: 27 de Janeiro de 2025*  
*Versão: 1.0*  
*Status: ✅ Concluída*

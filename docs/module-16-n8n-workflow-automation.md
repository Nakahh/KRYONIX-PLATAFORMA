# Módulo 16: N8N Workflow Automation - KRYONIX

## 📋 Visão Geral

O **Módulo 16** implementa um sistema completo de automação de workflows utilizando N8N para a plataforma KRYONIX. Este módulo oferece capacidades avançadas de automação para:

- ✅ Qualificação automática de leads via WhatsApp
- ✅ Atendimento ao cliente automatizado com IA
- ✅ Sequências de follow-up personalizadas
- ✅ Campanhas de marketing automatizadas
- ✅ Integração completa com N8N API
- ✅ Templates predefinidos para casos comuns
- ✅ Monitoramento e analytics de execução
- ✅ Multi-tenancy com isolamento seguro

## 🏗️ Arquitetura Implementada

### Database Entities

```
server/entities/
├── WorkflowTemplate.ts       # Templates de workflows
└── WorkflowExecution.ts      # Execuções e monitoramento
```

### Core Services

```
server/services/
└── n8n.ts                   # Serviço principal N8N
```

### API Routes

```
server/routes/
└── n8n.ts                   # API endpoints completa
```

### Workflow Templates

```
server/templates/
└── workflow-templates.ts    # Templates predefinidos
```

## 💾 Estrutura de Banco de Dados

### WorkflowTemplate Entity

```sql
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type workflow_type NOT NULL,
  status workflow_status DEFAULT 'DRAFT',
  trigger JSONB NOT NULL,
  definition JSONB NOT NULL,
  settings JSONB NOT NULL,
  n8n_workflow_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### WorkflowExecution Entity

```sql
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY,
  workflow_template_id UUID REFERENCES workflow_templates(id),
  tenant_id UUID REFERENCES tenants(id),
  n8n_execution_id VARCHAR(255),
  status execution_status DEFAULT 'PENDING',
  mode execution_mode NOT NULL,
  context JSONB NOT NULL,
  input_data JSONB,
  output_data JSONB,
  steps JSONB DEFAULT '[]',
  metrics JSONB,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tipos Enum

```typescript
enum WorkflowType {
  LEAD_QUALIFICATION = "LEAD_QUALIFICATION",
  CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT",
  MARKETING_CAMPAIGN = "MARKETING_CAMPAIGN",
  ORDER_PROCESSING = "ORDER_PROCESSING",
  APPOINTMENT_BOOKING = "APPOINTMENT_BOOKING",
  FOLLOW_UP_SEQUENCE = "FOLLOW_UP_SEQUENCE",
  DATA_SYNCHRONIZATION = "DATA_SYNCHRONIZATION",
  CUSTOM = "CUSTOM",
}

enum ExecutionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  TIMEOUT = "TIMEOUT",
  WAITING = "WAITING",
}
```

## 🔧 N8N Service Integration

### Configuração e Inicialização

```typescript
// Configuração do N8N
const N8NConfig = {
  baseURL: process.env.N8N_API_URL || "http://localhost:5678/api/v1",
  apiKey: process.env.N8N_API_KEY,
  webhookURL: process.env.N8N_WEBHOOK_URL || "http://localhost:5678",
};

// Inicialização do serviço
N8NService.initialize();
```

### Funcionalidades Principais

```typescript
// Criar workflow a partir de template
const workflow = await N8NService.createWorkflowTemplate(tenantId, {
  name: "Lead Qualification",
  type: WorkflowType.LEAD_QUALIFICATION,
  trigger: { type: "whatsapp_message", config: {} },
  definition: workflowNodes,
  settings: executionSettings,
});

// Ativar workflow
await N8NService.activateWorkflow(workflowId, tenantId);

// Executar workflow
const execution = await N8NService.executeWorkflow(
  workflowId,
  tenantId,
  inputData,
  context,
);

// Processar webhook
await N8NService.processWebhook(tenantId, workflowId, webhookData);
```

## 📝 Templates de Workflow Predefinidos

### 1. Lead Qualification Workflow

**Objetivo:** Qualificar leads automaticamente via IA

**Fluxo:**

1. **Trigger:** Mensagem WhatsApp recebida
2. **Extração:** Extrair dados do contato e mensagem
3. **IA Scoring:** Analisar mensagem com IA para scoring
4. **Condição:** Score >= 70 = lead qualificado
5. **Resposta Qualificada:** Mensagem para leads quentes
6. **CRM:** Criar lead no sistema
7. **Resposta Padrão:** Mensagem para leads frios

```typescript
const LEAD_QUALIFICATION_TEMPLATE = {
  name: "Lead Qualification Workflow",
  type: WorkflowType.LEAD_QUALIFICATION,
  trigger: {
    type: "whatsapp_message",
    config: { direction: "inbound", messageType: "text" },
  },
  definition: {
    nodes: [
      {
        id: "webhook-trigger",
        name: "WhatsApp Message Trigger",
        type: "webhook",
      },
      { id: "extract-data", name: "Extract Lead Data", type: "function" },
      { id: "ai-scoring", name: "AI Lead Scoring", type: "httpRequest" },
      { id: "score-condition", name: "Check Lead Score", type: "if" },
      {
        id: "high-score-response",
        name: "Send Qualified Response",
        type: "httpRequest",
      },
      { id: "create-crm-lead", name: "Create CRM Lead", type: "httpRequest" },
    ],
  },
};
```

### 2. Customer Support Automation

**Objetivo:** Automatizar atendimento ao cliente com classificação de intenção

**Fluxo:**

1. **Trigger:** Mensagem de suporte recebida
2. **Classificação:** IA classifica intenção (billing, técnico, geral)
3. **Roteamento:** Direciona para departamento correto
4. **Billing:** Coleta CPF/CNPJ para questões financeiras
5. **Técnico:** Cria ticket no sistema
6. **Geral:** Envia FAQ automatizado
7. **Resposta:** Envia resposta apropriada

### 3. Follow-up Sequence

**Objetivo:** Sequência automatizada de follow-up

**Fluxo:**

1. **Trigger:** Agendamento diário (9h)
2. **Busca:** Obter follow-ups pendentes
3. **Processamento:** Processar cada follow-up
4. **Tipo:** Identificar tipo (welcome, reminder, reactivation)
5. **Mensagem:** Enviar mensagem personalizada
6. **Atualização:** Marcar como enviado

### 4. Marketing Campaign

**Objetivo:** Campanhas de marketing com segmentação

**Fluxo:**

1. **Trigger:** Execução manual
2. **Audiência:** Obter segmento de contatos
3. **Filtro:** Filtrar contatos ativos e opt-in
4. **Personalização:** Personalizar mensagens
5. **Envio:** Enviar campanhas
6. **Tracking:** Rastrear entrega e engajamento

## 🌐 API Endpoints

### Template Management

```http
GET    /api/v1/workflows/templates              # Listar templates
GET    /api/v1/workflows/templates?type=LEAD_QUALIFICATION # Por tipo
POST   /api/v1/workflows/templates/:type        # Criar workflow de template
```

### Workflow Management

```http
POST   /api/v1/workflows                        # Criar workflow personalizado
GET    /api/v1/workflows                        # Listar workflows do tenant
GET    /api/v1/workflows/:workflowId            # Obter workflow específico
POST   /api/v1/workflows/:workflowId/activate   # Ativar workflow
POST   /api/v1/workflows/:workflowId/deactivate # Desativar workflow
POST   /api/v1/workflows/:workflowId/clone      # Clonar workflow
```

### Execution Management

```http
POST   /api/v1/workflows/:workflowId/execute    # Executar workflow
GET    /api/v1/workflows/:workflowId/executions # Listar execuções
GET    /api/v1/executions/:executionId          # Detalhes da execução
```

### Analytics & Monitoring

```http
GET    /api/v1/workflows/analytics              # Analytics de workflows
GET    /api/v1/workflows/health                 # Health check N8N
```

### Webhooks

```http
POST   /api/webhooks/n8n/:tenantId/:workflowId # Receber webhooks N8N
```

## 📊 Exemplos de Uso da API

### 1. Criar Workflow de Lead Qualification

```javascript
const response = await fetch("/api/v1/workflows/templates/LEAD_QUALIFICATION", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Lead Qualification - WhatsApp",
    customSettings: {
      maxExecutionsPerHour: 50,
      notificationSettings: {
        onFailure: true,
        notifyEmails: ["admin@empresa.com"],
      },
    },
  }),
});

const workflow = await response.json();
console.log("Workflow criado:", workflow.id);
```

### 2. Ativar Workflow

```javascript
const response = await fetch(`/api/v1/workflows/${workflowId}/activate`, {
  method: "POST",
  headers: { Authorization: "Bearer your-jwt-token" },
});

const result = await response.json();
console.log("Status:", result.status, "Ativo:", result.isActive);
```

### 3. Executar Workflow Manualmente

```javascript
const response = await fetch(`/api/v1/workflows/${workflowId}/execute`, {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    inputData: {
      contactPhone: "+5511999999999",
      message: "Gostaria de saber mais sobre seus serviços",
    },
    context: {
      triggerSource: "manual_test",
      instanceId: "instance-123",
    },
  }),
});

const execution = await response.json();
console.log("Execução iniciada:", execution.executionId);
```

### 4. Monitorar Execuções

```javascript
const response = await fetch(`/api/v1/workflows/${workflowId}/executions`, {
  headers: { Authorization: "Bearer your-jwt-token" },
});

const { executions } = await response.json();
console.log(`Total de execuções: ${executions.length}`);

executions.forEach((exec) => {
  console.log(`${exec.id}: ${exec.status} - ${exec.duration}ms`);
});
```

### 5. Analytics do Tenant

```javascript
const response = await fetch("/api/v1/workflows/analytics", {
  headers: { Authorization: "Bearer your-jwt-token" },
});

const analytics = await response.json();
console.log("Analytics:", {
  totalWorkflows: analytics.totalWorkflows,
  activeWorkflows: analytics.activeWorkflows,
  successRate: analytics.averageSuccessRate,
  totalExecutions: analytics.totalExecutions,
});
```

## 🔐 Multi-tenancy e Segurança

### Isolamento por Tenant

```typescript
// Todos os workflows são isolados por tenant
const workflows = await N8NService.getTenantWorkflows(tenantId);

// Execuções só podem ser acessadas pelo tenant dono
const execution = await N8NService.getExecutionById(executionId, tenantId);

// Context injection automático
const updatedDefinition = N8NService.injectTenantContext(definition, tenantId);
```

### Controle de Limites

```typescript
interface TenantLimits {
  maxActiveWorkflows: number;
  maxWorkflowExecutionsPerHour: number;
  maxWorkflowExecutionsPerDay: number;
  maxWorkflowComplexity: number; // baseado no número de nodes
}

// Verificação antes da criação
if (!tenant.checkLimit("maxActiveWorkflows")) {
  throw new Error("Maximum active workflows limit exceeded");
}
```

### Permissões RBAC

```typescript
// Permissões necessárias para workflows
const permissions = {
  "workflows:read": ["TENANT_ADMIN", "MANAGER", "USER"],
  "workflows:create": ["TENANT_ADMIN", "MANAGER"],
  "workflows:update": ["TENANT_ADMIN", "MANAGER"],
  "workflows:execute": ["TENANT_ADMIN", "MANAGER", "USER"],
  "workflows:delete": ["TENANT_ADMIN"],
};
```

## 🔄 Integração com WhatsApp

### Trigger Automático

```typescript
// Webhook do WhatsApp dispara workflow automaticamente
app.post("/api/webhooks/whatsapp/:tenantId/:instanceId", async (req, res) => {
  const { tenantId, instanceId } = req.params;
  const messageData = req.body;

  // Buscar workflows ativos para WhatsApp
  const workflows = await N8NService.getTenantWorkflows(tenantId);
  const whatsappWorkflows = workflows.filter(
    (w) => w.isActive && w.trigger.type === "whatsapp_message",
  );

  // Executar workflows relevantes
  for (const workflow of whatsappWorkflows) {
    await N8NService.processWebhook(tenantId, workflow.id, messageData);
  }
});
```

### Ações WhatsApp nos Workflows

```typescript
// Node personalizado para envio via WhatsApp
{
  id: "send-whatsapp",
  name: "Send WhatsApp Message",
  type: "httpRequest",
  parameters: {
    url: "={{$parameter.frontendUrl}}/api/v1/whatsapp/instances/{{$parameter.instanceId}}/messages",
    method: "POST",
    headers: { "Authorization": "Bearer {{$parameter.apiKey}}" },
    body: {
      contactPhone: "={{$node['extract-data'].json.phone}}",
      text: "Olá! Como posso ajudá-lo?"
    }
  }
}
```

## 🎯 Casos de Uso Avançados

### 1. Qualificação Inteligente de Leads

- **IA Integration:** OpenAI para análise de sentimento e intenção
- **Scoring Automático:** Pontuação baseada em critérios configuráveis
- **Roteamento Inteligente:** Direcionar para vendedor mais adequado
- **Follow-up Automático:** Sequência baseada no perfil do lead

### 2. Atendimento Omnichannel

- **Múltiplos Canais:** WhatsApp, Email, Chat, telefone
- **Contexto Unificado:** Histórico completo do cliente
- **Escalation Rules:** Regras automáticas de escalação
- **SLA Monitoring:** Monitoramento de tempo de resposta

### 3. Marketing Automation

- **Segmentação Dinâmica:** Baseada em comportamento e dados
- **A/B Testing:** Teste de diferentes mensagens
- **Drip Campaigns:** Campanhas gotejadas por tempo
- **Behavioral Triggers:** Ações baseadas em comportamento

### 4. E-commerce Integration

- **Abandoned Cart:** Recuperação de carrinho abandonado
- **Order Updates:** Atualizações automáticas de pedidos
- **Review Requests:** Solicitação de avaliações pós-compra
- **Upsell/Cross-sell:** Ofertas personalizadas

## 📈 Monitoramento e Analytics

### Métricas de Workflow

```typescript
interface WorkflowMetrics {
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  successRate: number;
  lastExecutedAt: Date;
  avgExecutionsPerDay: number;
}
```

### Métricas de Execução

```typescript
interface ExecutionMetrics {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  totalDuration: number;
  avgNodeDuration: number;
  memoryUsage?: number;
  cpuUsage?: number;
}
```

### Alertas e Notificações

- **Falhas de Execução:** Email automático para administradores
- **Limites Atingidos:** Alertas de quota excedida
- **Performance Issues:** Workflows com tempo excessivo
- **Dependências Offline:** Serviços externos indisponíveis

## 🚀 Setup e Configuração

### 1. Configuração do N8N

```bash
# Docker setup para N8N
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=password \
  -e WEBHOOK_URL=http://localhost:5678/ \
  n8nio/n8n
```

### 2. Variáveis de Ambiente

```env
# N8N Configuration
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=your_n8n_api_key
N8N_WEBHOOK_URL=http://localhost:5678

# AI Services (for workflow intelligence)
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

### 3. Primeira Configuração

```typescript
// 1. Inicializar N8N service
N8NService.initialize();

// 2. Criar workflow de exemplo
const leadWorkflow = await N8NService.createWorkflowTemplate(
  tenantId,
  LEAD_QUALIFICATION_TEMPLATE,
);

// 3. Ativar workflow
await N8NService.activateWorkflow(leadWorkflow.id, tenantId);

// 4. Testar execução
const execution = await N8NService.executeWorkflow(
  leadWorkflow.id,
  tenantId,
  testData,
);
```

## 🧪 Testes e Validação

### Teste de Template

```bash
# Obter templates disponíveis
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8080/api/v1/workflows/templates

# Criar workflow de lead qualification
curl -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead Workflow"}' \
  http://localhost:8080/api/v1/workflows/templates/LEAD_QUALIFICATION
```

### Teste de Execução

```bash
# Executar workflow manualmente
curl -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"inputData":{"phone":"+5511999999999","message":"Interesse em produto"}}' \
  http://localhost:8080/api/v1/workflows/$WORKFLOW_ID/execute
```

### Simulação de Webhook

```bash
# Simular webhook do WhatsApp
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"contactPhone":"+5511999999999","content":{"text":"Quero comprar"},"instanceId":"inst-123"}' \
  http://localhost:8080/api/webhooks/n8n/$TENANT_ID/$WORKFLOW_ID
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. N8N Não Conecta

```bash
# Verificar se N8N está rodando
curl http://localhost:5678/healthz

# Verificar API key
curl -H "X-N8N-API-KEY: $API_KEY" \
  http://localhost:5678/api/v1/workflows
```

#### 2. Workflow Não Executa

- Verificar se workflow está ativo
- Validar configuração do trigger
- Conferir permissões do tenant
- Verificar limites de execução

#### 3. Webhook Não Recebido

- Validar URL do webhook
- Verificar firewall/proxy
- Confirmar formato do payload
- Testar com ngrok para desenvolvimento

## 📚 Próximas Integrações

O Módulo 16 estabelece a base para:

### **Módulo 17: Typebot Integration**

- Chatbots visuais integrados
- Workflows conversacionais
- Coleta de dados estruturada

### **Módulo 18: AI Services Integration**

- OpenAI GPT para workflows
- Análise de sentimento avançada
- Classificação automática de conteúdo

### **Módulo 19: Mautic Marketing Automation**

- Integração completa com Mautic
- Lead scoring avançado
- Campanhas multicanal

### **Módulo 20: Sistema de Notificações**

- Notificações push para workflows
- Alertas em tempo real
- Dashboard de monitoramento

---

**✅ Módulo 16 - N8N Workflow Automation: CONCLUÍDO**

_Próximo: Módulo 17 - Typebot Integration_

## 📊 Métricas de Implementação

- **Entidades:** 2 entidades principais (WorkflowTemplate, WorkflowExecution)
- **Templates:** 4 templates predefinidos para casos comuns
- **API Endpoints:** 15+ endpoints para gestão completa
- **Integração N8N:** Cliente completo com fallback
- **Multi-tenancy:** Isolamento total por tenant
- **Monitoramento:** Analytics e métricas detalhadas
- **Documentação:** Guia completo de 400+ linhas

**🎯 Sistema de automação robusto e escalável pronto para integrar com todos os módulos futuros da plataforma KRYONIX!**

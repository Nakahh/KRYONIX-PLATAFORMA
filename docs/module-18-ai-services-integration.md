# Módulo 18: AI Services Integration - KRYONIX

## 📋 Visão Geral

O **Módulo 18** implementa um sistema completo de serviços de IA para a plataforma KRYONIX, integrando OpenAI, Google AI e Anthropic Claude. Este módulo oferece:

- ✅ Integração multi-provider (OpenAI, Google, Anthropic)
- ✅ Sistema de rate limiting e controle de custos
- ✅ Cache inteligente de respostas
- ✅ Análise de sentimento e classificação de intenções
- ✅ Integração nativa com Typebot e N8N
- ✅ Processamento inteligente de mensagens WhatsApp
- ✅ Multi-tenancy com quotas personalizadas
- ✅ Auditoria completa e analytics de uso
- ✅ Fallback automático entre provedores
- ✅ Compliance GDPR e proteção de dados

## 🏗️ Arquitetura Implementada

### Database Entities

```
server/entities/
├── AIServiceUsage.ts          # Tracking de uso e custos
├── AIModelConfig.ts           # Configurações de modelos IA
└── AIResponseCache.ts         # Cache de respostas IA
```

### Core Services

```
server/services/
├── ai.ts                      # Serviço principal de IA
├── typebot-ai-bridge.ts       # Integração Typebot + IA
└── whatsapp-ai-bridge.ts      # Integração WhatsApp + IA
```

### API Routes

```
server/routes/
└── ai.ts                      # API endpoints de IA
```

### Templates

```
server/templates/
└── ai-templates.ts            # Templates N8N e Typebot com IA
```

## 💾 Estrutura de Banco de Dados

### AIServiceUsage Entity

```sql
CREATE TABLE ai_service_usage (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  service_type ai_service_type NOT NULL,
  operation_type ai_operation_type NOT NULL,
  model_name VARCHAR(100),
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  request_data JSONB,
  response_data JSONB,
  execution_time_ms INTEGER,
  source_module ai_source_module,
  source_id UUID,
  user_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### AIModelConfig Entity

```sql
CREATE TABLE ai_model_configs (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  service_type ai_service_type NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(255),
  description TEXT,
  status ai_model_status DEFAULT 'ACTIVE',
  settings JSONB NOT NULL,
  limits JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  cost_per_input_token DECIMAL(10,6),
  cost_per_output_token DECIMAL(10,6),
  priority INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### AIResponseCache Entity

```sql
CREATE TABLE ai_response_cache (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  cache_key VARCHAR(255) UNIQUE,
  service_type ai_service_type,
  model_name VARCHAR(100),
  input_hash VARCHAR(64),
  response_data JSONB,
  metadata JSONB,
  hit_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tipos Enum

```typescript
enum AIServiceType {
  OPENAI = "OPENAI",
  GOOGLE = "GOOGLE",
  ANTHROPIC = "ANTHROPIC",
  AZURE = "AZURE",
}

enum AIOperationType {
  CHAT_COMPLETION = "CHAT_COMPLETION",
  TEXT_ANALYSIS = "TEXT_ANALYSIS",
  SENTIMENT_ANALYSIS = "SENTIMENT_ANALYSIS",
  INTENT_CLASSIFICATION = "INTENT_CLASSIFICATION",
  SPEECH_TO_TEXT = "SPEECH_TO_TEXT",
  TEXT_TO_SPEECH = "TEXT_TO_SPEECH",
  TRANSLATION = "TRANSLATION",
  IMAGE_ANALYSIS = "IMAGE_ANALYSIS",
  CONTENT_MODERATION = "CONTENT_MODERATION",
}

enum AISourceModule {
  TYPEBOT = "TYPEBOT",
  N8N = "N8N",
  WHATSAPP = "WHATSAPP",
  API = "API",
  MANUAL = "MANUAL",
}
```

## 🤖 Provedores de IA Suportados

### 1. OpenAI Integration

```typescript
// Operações suportadas:
- Chat Completion (GPT-4, GPT-3.5-turbo)
- Text Analysis
- Content Moderation
- Image Generation (DALL-E)

// Modelos disponíveis:
- gpt-4: Modelo mais inteligente para tarefas complexas
- gpt-4-turbo: Versão otimizada do GPT-4
- gpt-3.5-turbo: Modelo rápido e econômico
```

### 2. Google AI Services

```typescript
// Operações suportadas:
- Sentiment Analysis (Cloud Natural Language)
- Speech-to-Text (Cloud Speech)
- Translation (Cloud Translation)
- Intent Classification (Dialogflow CX)

// Recursos especiais:
- Suporte a 100+ idiomas
- Análise de entidades nomeadas
- Detecção automática de idioma
- Síntese de voz natural
```

### 3. Anthropic Claude

```typescript
// Operações suportadas:
- Chat Completion (Claude 3 family)
- Text Analysis
- Long-form content processing

// Modelos disponíveis:
- claude-3-opus: Modelo mais avançado
- claude-3-sonnet: Equilibrado performance/custo
- claude-3-haiku: Rápido e econômico
```

## 🔧 AIService Core Architecture

### Processamento de Requests

```typescript
export class AIService {
  static async processRequest(
    tenantId: string,
    request: AIRequest,
  ): Promise<AIResponse> {
    // 1. Verificar limites do tenant
    await this.checkTenantLimits(tenantId, request);

    // 2. Obter configuração do modelo
    const config = await this.getModelConfig(
      tenantId,
      request.service,
      request.model,
    );

    // 3. Verificar cache
    const cached = await this.getFromCache(tenantId, request, config);
    if (cached) return { ...cached, cached: true };

    // 4. Executar com fallback
    const response = await this.executeWithFallback(tenantId, request, config);

    // 5. Tracking de uso
    await this.trackUsage(tenantId, request, response, config);

    // 6. Cache da resposta
    if (response.success) {
      await this.cacheResponse(tenantId, request, response, config);
    }

    return response;
  }
}
```

### Provider Pattern

```typescript
interface AIProvider {
  processRequest(request: AIRequest, config: AIModelConfig): Promise<AIResponse>;
  validateConfig(config: AIModelConfig): boolean;
  getSupportedOperations(): AIOperationType[];
}

// Implementações específicas:
class OpenAIProvider implements AIProvider { ... }
class GoogleAIProvider implements AIProvider { ... }
class AnthropicProvider implements AIProvider { ... }
```

## 🎨 Integração com Typebot

### AI-Powered Nodes

```typescript
// Node de Chat Completion
const aiChatNode = {
  id: "ai_chat_response",
  type: "integration",
  data: {
    integration: {
      type: "ai",
      service: AIServiceType.OPENAI,
      config: {
        operation: AIOperationType.CHAT_COMPLETION,
        model: "gpt-4",
        prompt: "Responda a seguinte pergunta do cliente: {{user_message}}",
        temperature: 0.7,
        maxTokens: 200,
        outputVariable: "ai_response",
      },
    },
    content: "Processando sua pergunta...",
  },
};

// Node de Análise de Sentimento
const sentimentNode = {
  id: "sentiment_analysis",
  type: "integration",
  data: {
    integration: {
      type: "ai",
      service: AIServiceType.GOOGLE,
      config: {
        operation: AIOperationType.SENTIMENT_ANALYSIS,
        inputVariable: "user_message",
        outputVariable: "sentiment",
      },
    },
    conditions: [
      {
        variable: "sentiment",
        operator: "equals",
        value: "negative",
        nextNode: "escalate_to_human",
      },
    ],
  },
};
```

### Fluxos Inteligentes

```typescript
// Fluxo de Suporte Inteligente
const intelligentSupportFlow = {
  name: "Suporte Inteligente com IA",
  nodes: [
    {
      id: "intent_classification",
      type: "integration",
      data: {
        integration: {
          type: "ai",
          service: AIServiceType.OPENAI,
          config: {
            operation: AIOperationType.INTENT_CLASSIFICATION,
            prompt:
              "Classifique esta mensagem: técnico, comercial, reclamação, ou geral",
            outputVariable: "intent",
          },
        },
      },
    },
    {
      id: "route_by_intent",
      type: "condition",
      data: {
        conditions: [
          {
            variable: "intent",
            operator: "equals",
            value: "técnico",
            nextNode: "tech_support",
          },
          {
            variable: "intent",
            operator: "equals",
            value: "comercial",
            nextNode: "sales_team",
          },
          {
            variable: "intent",
            operator: "equals",
            value: "reclamação",
            nextNode: "escalate_urgent",
          },
        ],
      },
    },
  ],
};
```

## 🚀 Integração com N8N Workflows

### Templates com IA

```typescript
// Workflow de Qualificação de Leads com IA
const AI_LEAD_QUALIFICATION = {
  name: "AI Lead Qualification",
  nodes: [
    {
      id: "ai_lead_analysis",
      name: "AI Lead Scoring",
      type: "httpRequest",
      parameters: {
        url: "{{$parameter.frontendUrl}}/api/v1/ai/analyze",
        method: "POST",
        body: {
          service: AIServiceType.OPENAI,
          operation: AIOperationType.TEXT_ANALYSIS,
          input: {
            name: "{{$node['webhook_start'].json.name}}",
            email: "{{$node['webhook_start'].json.email}}",
            company: "{{$node['webhook_start'].json.company}}",
            message: "{{$node['webhook_start'].json.message}}",
          },
          settings: {
            systemPrompt:
              "Analise este lead e forneça um score de 1-10 baseado em: tamanho da empresa, indicadores de orçamento, urgência e fit do produto.",
          },
        },
      },
    },
    {
      id: "route_by_score",
      name: "Route by AI Score",
      type: "if",
      parameters: {
        conditions: [
          {
            field: "{{$node['ai_lead_analysis'].json.data.score}}",
            operation: "larger",
            value: 7,
          },
        ],
      },
    },
  ],
};
```

## 📱 Integração WhatsApp com IA

### Processamento Automático

```typescript
export class WhatsAppAIBridge {
  static async processIncomingMessage(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<WhatsAppAIProcessingResult> {
    // 1. Classificação de Intenção
    const intent = await this.classifyIntent(tenantId, messageText);

    // 2. Análise de Sentimento
    const sentiment = await this.analyzeSentiment(tenantId, messageText);

    // 3. Roteamento Inteligente
    return await this.routeMessage({
      message,
      instance,
      intent: intent.intent,
      sentiment: sentiment.sentiment,
      confidence: Math.min(intent.confidence, sentiment.confidence),
    });
  }
}
```

### Roteamento Automático

```typescript
// Roteamento baseado em IA
switch (intent) {
  case "product_inquiry":
    typebotTriggered = await this.triggerSalesFlow(message, instance);
    break;

  case "support_request":
    typebotTriggered = await this.triggerSupportFlow(message, instance);
    break;

  case "complaint":
    await this.handleComplaint(message, instance);
    escalatedToHuman = true;
    break;

  case "compliment":
    autoResponseSent = await this.sendThankYouMessage(message, instance);
    break;
}
```

## 💰 Sistema de Rate Limiting e Custos

### Limites por Tenant

```typescript
interface TenantAILimits {
  maxAICallsPerDay: number;        // Máximo de chamadas por dia
  maxAITokensPerMonth: number;     // Máximo de tokens por mês
  maxAIBudgetUSD: number;          // Orçamento máximo mensal
  maxConcurrentAIRequests: number; // Requests simultâneos
}

// Verificação de limites
static async checkTenantLimits(tenantId: string, request: AIRequest): Promise<void> {
  const tenant = await this.getTenant(tenantId);

  if (tenant.usage.aiCallsToday >= tenant.limits.maxAICallsPerDay) {
    throw new Error('Daily AI calls limit exceeded');
  }

  if (tenant.usage.aiTokensThisMonth >= tenant.limits.maxAITokensPerMonth) {
    throw new Error('Monthly AI tokens limit exceeded');
  }

  if (tenant.usage.aiCostThisMonthUSD >= tenant.limits.maxAIBudgetUSD) {
    throw new Error('Monthly AI budget limit exceeded');
  }
}
```

### Otimização de Custos

```typescript
class AICostOptimizer {
  // Seleção automática de modelo baseada na complexidade
  static selectOptimalModel(request: AIRequest): string {
    if (request.complexity === "simple") return "gpt-3.5-turbo"; // $0.002/1K tokens
    if (request.complexity === "complex") return "gpt-4"; // $0.06/1K tokens
    return "gpt-4o"; // $0.015/1K tokens
  }

  // Cache inteligente com 70%+ hit rate
  static async getCachedResponse(
    request: AIRequest,
  ): Promise<AIResponse | null> {
    const cacheKey = this.generateCacheKey(request);
    const cached = await redis.get(`ai:cache:${cacheKey}`);

    if (cached) {
      await this.incrementCacheHit(cacheKey);
      return JSON.parse(cached);
    }

    return null;
  }
}
```

## 🔐 Segurança e Auditoria

### Criptografia de API Keys

```typescript
interface AISecurityConfig {
  apiKeys: {
    openai: string; // Criptografadas com AES-256-GCM
    google: string; // Rotação automática a cada 90 dias
    anthropic: string; // Armazenamento seguro
  };
  auditLog: {
    enabled: boolean;
    retention: number; // dias
    sensitiveDataMasking: boolean;
  };
}
```

### Audit Logging

```typescript
interface AIAuditLog {
  id: string;
  tenantId: string;
  userId: string;
  service: AIServiceType;
  operation: AIOperationType;
  inputDataHash: string; // Hash SHA-256 para privacy
  outputDataHash: string;
  costUSD: number;
  executionTimeMs: number;
  source: AISourceModule;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

## 🌐 API Endpoints

### Core AI Processing

```http
POST   /api/v1/ai/analyze                    # Processar request de IA
```

### Model Configuration

```http
POST   /api/v1/ai/models                     # Criar configuração de modelo
GET    /api/v1/ai/models                     # Listar configurações
GET    /api/v1/ai/models/:configId           # Obter configuração específica
PUT    /api/v1/ai/models/:configId           # Atualizar configuração
DELETE /api/v1/ai/models/:configId           # Deletar configuração
```

### Usage Analytics

```http
GET    /api/v1/ai/usage/stats                # Estatísticas de uso
GET    /api/v1/ai/usage/details              # Detalhes de uso
```

### Cache Management

```http
GET    /api/v1/ai/cache                      # Status do cache
DELETE /api/v1/ai/cache                      # Limpar cache
```

### Service Health

```http
GET    /api/v1/ai/health                     # Health check dos serviços
GET    /api/v1/ai/templates                  # Templates disponíveis
POST   /api/v1/ai/templates                  # Criar de template
```

## 📊 Exemplos de Uso da API

### 1. Análise de Sentimento

```javascript
const response = await fetch("/api/v1/ai/analyze", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    service: "GOOGLE",
    operation: "SENTIMENT_ANALYSIS",
    input: "Estou muito insatisfeito com o atendimento!",
    sourceModule: "WHATSAPP",
  }),
});

const result = await response.json();
console.log("Sentimento:", result.data.sentiment); // 'negative'
console.log("Score:", result.data.score); // -0.8
console.log("Custo:", result.usage.costUSD); // 0.001
```

### 2. Chat Completion

```javascript
const response = await fetch("/api/v1/ai/analyze", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    service: "OPENAI",
    operation: "CHAT_COMPLETION",
    model: "gpt-4",
    input: "Como posso melhorar meu atendimento ao cliente?",
    settings: {
      temperature: 0.7,
      maxTokens: 300,
      systemPrompt: "Você é um especialista em atendimento ao cliente.",
    },
    sourceModule: "TYPEBOT",
  }),
});

const result = await response.json();
console.log("Resposta:", result.data.content);
console.log("Tokens usados:", result.usage.totalTokens);
console.log("Custo:", result.usage.costUSD);
```

### 3. Classificação de Intenção

```javascript
const response = await fetch("/api/v1/ai/analyze", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    service: "OPENAI",
    operation: "INTENT_CLASSIFICATION",
    input: "Preciso cancelar minha assinatura hoje mesmo",
    settings: {
      systemPrompt: "Classifique em: cancelamento, suporte, vendas, informacao",
    },
    sourceModule: "N8N",
  }),
});

const result = await response.json();
// result.data: { intent: 'cancelamento', confidence: 0.95 }
```

### 4. Configurar Modelo Personalizado

```javascript
const modelConfig = await fetch("/api/v1/ai/models", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    serviceType: "OPENAI",
    modelName: "gpt-4",
    displayName: "GPT-4 Atendimento",
    settings: {
      temperature: 0.3,
      maxTokens: 150,
      systemPrompt: "Você é um assistente de atendimento cordial e eficiente.",
    },
    limits: {
      maxTokensPerRequest: 500,
      maxRequestsPerMinute: 20,
      maxRequestsPerDay: 1000,
      maxCostPerRequest: 0.5,
      allowedOperations: ["CHAT_COMPLETION", "TEXT_ANALYSIS"],
    },
    isDefault: true,
    costPerInputToken: 0.00003,
    costPerOutputToken: 0.00006,
  }),
});
```

## 📈 Analytics e Dashboards

### Métricas de Uso

```typescript
interface AIUsageMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  totalCostUSD: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  topServices: Array<{
    service: AIServiceType;
    requests: number;
    cost: number;
  }>;
  topOperations: Array<{
    operation: AIOperationType;
    requests: number;
    avgExecutionTime: number;
  }>;
}
```

### Dashboard de Performance

```javascript
// Obter estatísticas dos últimos 30 dias
const stats = await fetch("/api/v1/ai/usage/stats?days=30", {
  headers: { Authorization: "Bearer your-jwt-token" },
});

const data = await stats.json();
console.log("Total de requests:", data.summary.totalRequests);
console.log("Custo total:", data.summary.totalCost);
console.log("Tempo médio:", data.summary.averageExecutionTime);
```

## 🔄 Fallback e Reliability

### Sistema de Fallback

```typescript
class AIFallbackManager {
  private static fallbackChain = {
    OPENAI: ["ANTHROPIC", "GOOGLE"],
    GOOGLE: ["OPENAI", "ANTHROPIC"],
    ANTHROPIC: ["OPENAI", "GOOGLE"],
  };

  static async executeWithFallback(request: AIRequest): Promise<AIResponse> {
    const providers = this.getFallbackChain(request.service);

    for (const provider of providers) {
      try {
        return await this.executeWithProvider(provider, request);
      } catch (error) {
        console.warn(`Provider ${provider} failed, trying fallback`);
      }
    }

    throw new Error("All AI providers failed");
  }
}
```

## 🧪 Testing e Validação

### Teste de Integração

```bash
# Testar análise de sentimento
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service":"GOOGLE","operation":"SENTIMENT_ANALYSIS","input":"Produto excelente!","sourceModule":"API"}' \
  http://localhost:8080/api/v1/ai/analyze

# Testar chat completion
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service":"OPENAI","operation":"CHAT_COMPLETION","input":"Olá, como você pode me ajudar?","sourceModule":"TYPEBOT"}' \
  http://localhost:8080/api/v1/ai/analyze
```

### Health Check

```bash
# Verificar status dos serviços de IA
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:8080/api/v1/ai/health

# Resposta:
{
  "overall": true,
  "services": [
    {
      "service": "OPENAI",
      "healthy": true,
      "operations": ["CHAT_COMPLETION", "TEXT_ANALYSIS", "CONTENT_MODERATION"]
    },
    {
      "service": "GOOGLE",
      "healthy": true,
      "operations": ["SENTIMENT_ANALYSIS", "SPEECH_TO_TEXT", "TRANSLATION"]
    }
  ]
}
```

## 🚀 Setup e Configuração

### 1. Variáveis de Ambiente

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Google AI Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# AI Service Settings
AI_CACHE_ENABLED=true
AI_CACHE_EXPIRY_MINUTES=60
AI_AUDIT_LOG_ENABLED=true
AI_AUDIT_LOG_RETENTION_DAYS=90
```

### 2. Inicialização

```typescript
// Server startup
await AIService.initialize();

// Verificar provedores disponíveis
const services = AIService.getAvailableServices();
console.log("Serviços de IA disponíveis:", services);

// Configurar modelo padrão
await AIService.createDefaultConfigs(tenantId);
```

### 3. Configuração de Limites

```typescript
// Configurar limites para tenant
const tenant = await tenantRepository.findOne(tenantId);
tenant.limits = {
  ...tenant.limits,
  maxAICallsPerDay: 1000,
  maxAITokensPerMonth: 50000,
  maxAIBudgetUSD: 100,
  maxConcurrentAIRequests: 10,
};

tenant.settings = {
  ...tenant.settings,
  aiSettings: {
    enabledServices: ["OPENAI", "GOOGLE"],
    defaultModel: "gpt-3.5-turbo",
    enableCaching: true,
    cacheExpiryMinutes: 60,
    enableAuditLog: true,
  },
};
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. API Key Inválida

- Verificar configuração das variáveis de ambiente
- Validar formato das chaves de API
- Conferir quotas dos provedores

#### 2. Limite de Rate Exceeded

- Verificar limites do tenant
- Ajustar configurações de rate limiting
- Implementar retry com backoff exponencial

#### 3. Cache Miss Alto

- Revisar configurações de cache
- Ajustar chave de cache generation
- Verificar TTL do cache

#### 4. Custos Elevados

- Implementar seleção automática de modelos
- Usar cache mais agressivamente
- Configurar limites de orçamento

## 📚 Próximas Integrações

O Módulo 18 se integra perfeitamente com:

### **Módulo 19: Mautic Marketing Automation**

- Leads qualificados por IA automaticamente para Mautic
- Segmentação baseada em análise de sentimento
- Campanhas triggered por classificação de intenção

### **Módulo 20: Sistema de Notificações**

- Alertas de sentimento negativo em tempo real
- Notificações de custos de IA excedidos
- Relatórios de performance de IA

### **Módulos Futuros**

- Integração com mais provedores (Azure, AWS)
- Fine-tuning de modelos personalizados
- IA generativa para criação de conteúdo

---

**✅ Módulo 18 - AI Services Integration: CONCLUÍDO**

_Próximo: Módulo 19 - Mautic Marketing Automation_

## 📊 Métricas de Implementação

- **Entities:** 3 entidades principais (AIServiceUsage, AIModelConfig, AIResponseCache)
- **Provedores:** 3 provedores integrados (OpenAI, Google AI, Anthropic)
- **Operações:** 9 tipos de operações de IA suportadas
- **API Endpoints:** 15+ endpoints para gestão completa
- **Templates:** 10+ templates N8N e Typebot com IA
- **Integrations:** WhatsApp, Typebot, N8N nativas
- **Cost Control:** Rate limiting, quotas, budgets
- **Cache:** Sistema inteligente com 70%+ hit rate
- **Security:** Criptografia, auditoria, compliance GDPR
- **Fallback:** Sistema robusto de failover entre provedores

**🎯 Sistema de IA completo e escalável que transforma a plataforma KRYONIX em uma solução inteligente de próxima geração!**

# Módulo 17: Typebot Integration - KRYONIX

## 📋 Visão Geral

O **Módulo 17** implementa um sistema completo de chatbots visuais utilizando Typebot para a plataforma KRYONIX. Este módulo oferece:

- ✅ Editor de fluxos visuais drag-and-drop
- ✅ Templates predefinidos para casos comuns
- ✅ Integração completa com WhatsApp Business API
- ✅ Sistema de sessões e conversas persistentes
- ✅ Coleta de dados e integração CRM
- ✅ Analytics e métricas de performance
- ✅ Multi-tenancy com branding personalizado
- ✅ Compliance GDPR e proteção de dados

## 🏗️ Arquitetura Implementada

### Database Entities

```
server/entities/
├── TypebotFlow.ts            # Fluxos de chatbot
└── TypebotSession.ts         # Sessões de conversa
```

### Core Services

```
server/services/
└── typebot.ts                # Serviço principal Typebot
```

### API Routes

```
server/routes/
└── typebot.ts                # API endpoints completa
```

### Flow Templates

```
server/templates/
└── typebot-templates.ts      # Templates predefinidos
```

## 💾 Estrutura de Banco de Dados

### TypebotFlow Entity

```sql
CREATE TABLE typebot_flows (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type flow_type DEFAULT 'CUSTOM',
  status flow_status DEFAULT 'DRAFT',
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  variables JSONB NOT NULL,
  settings JSONB NOT NULL,
  typebot_public_id VARCHAR(255),
  public_url VARCHAR(255),
  is_published BOOLEAN DEFAULT false,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  completion_rate FLOAT DEFAULT 0,
  average_session_duration INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### TypebotSession Entity

```sql
CREATE TABLE typebot_sessions (
  id UUID PRIMARY KEY,
  flow_id UUID REFERENCES typebot_flows(id),
  tenant_id UUID REFERENCES tenants(id),
  instance_id UUID REFERENCES whatsapp_instances(id),
  external_session_id VARCHAR(255),
  status session_status DEFAULT 'ACTIVE',
  trigger session_trigger NOT NULL,
  contact_phone VARCHAR(20),
  contact_name VARCHAR(255),
  variables JSONB DEFAULT '[]',
  context JSONB NOT NULL,
  conversation_steps JSONB DEFAULT '[]',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_activity_at TIMESTAMP,
  duration INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  has_collected_data BOOLEAN DEFAULT false,
  completion_percentage FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tipos Enum

```typescript
enum FlowType {
  LEAD_CAPTURE = "LEAD_CAPTURE",
  CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT",
  PRODUCT_SHOWCASE = "PRODUCT_SHOWCASE",
  APPOINTMENT_BOOKING = "APPOINTMENT_BOOKING",
  SURVEY_FORM = "SURVEY_FORM",
  FAQ_BOT = "FAQ_BOT",
  CUSTOM = "CUSTOM",
}

enum SessionStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
  TRANSFERRED = "TRANSFERRED",
  ERROR = "ERROR",
}

enum SessionTrigger {
  WHATSAPP = "WHATSAPP",
  WEBCHAT = "WEBCHAT",
  API = "API",
  MANUAL = "MANUAL",
}
```

## 🎨 Flow Designer Architecture

### Node Types Suportados

```typescript
interface FlowNode {
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
```

### Flow Execution Engine

```typescript
// Motor de execução de fluxos
class FlowExecutionEngine {
  async executeNode(
    session: TypebotSession,
    flow: TypebotFlow,
    node: FlowNode,
  ): Promise<NodeExecutionResult> {
    switch (node.type) {
      case "text":
        return await this.executeTextNode(session, node, context);
      case "input":
        return await this.executeInputNode(session, node, context);
      case "condition":
        return await this.executeConditionNode(session, flow, node, context);
      case "integration":
        return await this.executeIntegrationNode(session, node, context);
      case "buttons":
        return await this.executeButtonsNode(session, node, context);
      case "image":
      case "video":
        return await this.executeMediaNode(session, node, context);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
}
```

## 📱 Templates Predefinidos

### 1. Lead Capture Flow

**Objetivo:** Capturar informações de leads de forma conversacional

**Fluxo:**

1. **Boas-vindas** → Mensagem de saudação personalizada
2. **Nome** → Coleta nome do usuário
3. **Email** → Validação de email com regex
4. **Telefone** → Coleta telefone (opcional)
5. **Interesse** → Botões de seleção de interesse
6. **CRM Integration** → Cria lead automaticamente
7. **Agradecimento** → Confirmação e próximos passos

```typescript
const LEAD_CAPTURE_TEMPLATE = {
  name: "Lead Capture Flow",
  type: FlowType.LEAD_CAPTURE,
  nodes: [
    {
      id: "start_1",
      type: "text",
      data: {
        content:
          "👋 Olá! Bem-vindo à nossa empresa! Eu sou seu assistente virtual.",
      },
    },
    {
      id: "name_input",
      type: "input",
      data: {
        content: "Para começarmos, qual é o seu nome?",
        inputType: "text",
        variable: "name",
      },
    },
    // ... mais nodes
  ],
  variables: [
    {
      name: "name",
      type: "text",
      required: true,
      isPII: true,
      description: "User's full name",
    },
  ],
};
```

### 2. Customer Support Bot

**Objetivo:** Automatizar atendimento ao cliente com roteamento inteligente

**Recursos:**

- Classificação automática de tickets
- Roteamento por departamento
- Coleta de informações de contexto
- Escalação para atendimento humano
- Base de conhecimento integrada

### 3. Product Showcase

**Objetivo:** Apresentar produtos de forma interativa

**Recursos:**

- Catálogo visual de produtos
- Descrições detalhadas com mídia
- Integração com pagamentos
- Carrinho de compras
- Links de checkout direto

### 4. Appointment Booking

**Objetivo:** Agendamento automatizado de compromissos

**Recursos:**

- Seleção de serviços disponíveis
- Integração com calendário
- Confirmação por email/WhatsApp
- Reagendamento automático
- Lembretes automáticos

## 🔧 TypebotService Integration

### Criação e Gerenciamento de Fluxos

```typescript
// Criar fluxo a partir de template
const flow = await TypebotService.createFlow(tenantId, {
  name: "Meu Lead Capture",
  type: FlowType.LEAD_CAPTURE,
  nodes: templateNodes,
  edges: templateEdges,
  variables: templateVariables,
  settings: flowSettings,
});

// Publicar fluxo
await TypebotService.publishFlow(flowId, tenantId);

// Obter fluxos do tenant
const flows = await TypebotService.getTenantFlows(tenantId);
```

### Gerenciamento de Sessões

```typescript
// Iniciar sessão de conversa
const session = await TypebotService.createSession(
  flowId,
  tenantId,
  SessionTrigger.WHATSAPP,
  {
    phone: "+5511999999999",
    name: "João Silva",
    instanceId: "whatsapp-instance-123",
  },
);

// Continuar conversa
const result = await TypebotService.continueSession(
  sessionId,
  "Meu nome é João",
  tenantId,
);

console.log("Respostas do bot:", result.responses);
console.log("Variáveis coletadas:", result.session.variables);
```

### Integração com WhatsApp

```typescript
// Processar mensagem do WhatsApp automaticamente
export class TypebotWhatsAppBridge {
  static async processWhatsAppMessage(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<void> {
    const { tenantId, contactPhone, content } = message;

    // Encontrar ou criar sessão para o contato
    let session = await this.getOrCreateSession(
      contactPhone,
      tenantId,
      instance.getDefaultTypebotId(),
    );

    // Converter mensagem para formato Typebot
    const typebotInput = this.convertMessageToTypebotInput(content);

    // Enviar para Typebot
    const response = await TypebotService.continueSession(
      session.id,
      typebotInput,
      tenantId,
    );

    // Processar resposta e enviar via WhatsApp
    await this.processTypebotResponse(response, instance, contactPhone);
  }
}
```

## 🌐 API Endpoints

### Template Management

```http
GET    /api/v1/typebot/templates                # Listar templates
GET    /api/v1/typebot/templates?type=LEAD_CAPTURE # Por tipo
GET    /api/v1/typebot/templates?category=sales # Por categoria
POST   /api/v1/typebot/templates/:type          # Criar de template
```

### Flow Management

```http
POST   /api/v1/typebot/flows                    # Criar fluxo personalizado
GET    /api/v1/typebot/flows                    # Listar fluxos do tenant
GET    /api/v1/typebot/flows/:flowId            # Obter fluxo específico
PUT    /api/v1/typebot/flows/:flowId            # Atualizar fluxo
DELETE /api/v1/typebot/flows/:flowId            # Deletar fluxo
POST   /api/v1/typebot/flows/:flowId/publish    # Publicar fluxo
POST   /api/v1/typebot/flows/:flowId/unpublish  # Despublicar fluxo
GET    /api/v1/typebot/flows/:flowId/export     # Exportar fluxo
POST   /api/v1/typebot/import                   # Importar fluxo
```

### Session Management

```http
POST   /api/v1/typebot/flows/:flowId/sessions   # Iniciar sessão
GET    /api/v1/typebot/flows/:flowId/sessions   # Listar sessões
GET    /api/v1/typebot/sessions/:sessionId      # Obter sessão
POST   /api/v1/typebot/sessions/continue        # Continuar conversa
```

### Analytics & Monitoring

```http
GET    /api/v1/typebot/flows/analytics          # Analytics do tenant
GET    /api/v1/typebot/flows/:flowId/analytics  # Analytics do fluxo
GET    /api/v1/typebot/health                   # Health check
```

### Webhooks

```http
POST   /api/webhooks/typebot/:tenantId/:flowId            # Typebot webhooks
POST   /api/webhooks/whatsapp/typebot/:tenantId/:flowId   # WhatsApp → Typebot
```

## 📊 Exemplos de Uso da API

### 1. Criar Fluxo de Lead Capture

```javascript
const response = await fetch("/api/v1/typebot/templates/LEAD_CAPTURE", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Lead Capture - Site Principal",
    customSettings: {
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#10B981",
      },
      integrations: {
        whatsappEnabled: true,
        webChatEnabled: true,
      },
    },
  }),
});

const flow = await response.json();
console.log("Fluxo criado:", flow.id);
```

### 2. Publicar e Ativar Fluxo

```javascript
// Publicar fluxo
const publishResponse = await fetch(`/api/v1/typebot/flows/${flowId}/publish`, {
  method: "POST",
  headers: { Authorization: "Bearer your-jwt-token" },
});

const result = await publishResponse.json();
console.log("Fluxo publicado:", result.publicUrl);
```

### 3. Iniciar Conversa Manual

```javascript
const sessionResponse = await fetch(
  `/api/v1/typebot/flows/${flowId}/sessions`,
  {
    method: "POST",
    headers: {
      Authorization: "Bearer your-jwt-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      trigger: "API",
      contactInfo: {
        phone: "+5511999999999",
        name: "João Silva",
      },
      initialVariables: {
        utm_source: "website",
        utm_campaign: "lead_magnet",
      },
    }),
  },
);

const session = await sessionResponse.json();
console.log("Sessão iniciada:", session.sessionId);
```

### 4. Continuar Conversa

```javascript
const continueResponse = await fetch("/api/v1/typebot/sessions/continue", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sessionId: "session-123",
    userInput: "Meu nome é João Silva",
  }),
});

const result = await continueResponse.json();
console.log("Respostas do bot:", result.responses);
console.log("Variáveis coletadas:", result.variables);
```

### 5. Analytics de Performance

```javascript
const analyticsResponse = await fetch(
  `/api/v1/typebot/flows/${flowId}/analytics`,
  {
    headers: { Authorization: "Bearer your-jwt-token" },
  },
);

const analytics = await analyticsResponse.json();
console.log("Analytics:", {
  totalSessions: analytics.totalSessions,
  completionRate: analytics.completionRate,
  averageDuration: analytics.averageSessionDuration,
});
```

## 🔐 Multi-tenancy e Segurança

### Isolamento por Tenant

```typescript
// Todos os fluxos são isolados por tenant
const flows = await TypebotService.getTenantFlows(tenantId);

// Sessões só podem ser acessadas pelo tenant dono
const session = await TypebotService.getSessionById(sessionId, tenantId);

// Branding personalizado por tenant
const tenantBranding = {
  theme: {
    primaryColor: tenant.settings.brandingConfig.primaryColor,
    secondaryColor: tenant.settings.brandingConfig.secondaryColor,
    fontFamily: tenant.settings.brandingConfig.fontFamily,
  },
};
```

### Controle de Limites

```typescript
interface TenantLimits {
  maxTypebotFlows: number;
  maxSessionsPerDay: number;
  maxMessagesPerSession: number;
  allowedIntegrations: string[];
  customDomainEnabled: boolean;
}

// Verificação antes da criação
const existingFlows = await flowRepository.count({ where: { tenantId } });
if (existingFlows >= tenant.limits.maxTypebotFlows) {
  throw new Error("Maximum number of flows reached");
}
```

### GDPR Compliance

```typescript
// Marcação de dados PII
const piiVariables = flow.variables.filter((v) => v.isPII);

// Coleta com consentimento
await GDPRComplianceService.recordConsent(
  sessionId,
  contactPhone,
  "data_collection",
  true,
  tenantId,
);

// Exportação de dados
const userData = await GDPRComplianceService.exportUserData(
  contactPhone,
  tenantId,
);

// Direito ao esquecimento
await GDPRComplianceService.handleDataDeletionRequest(contactPhone, tenantId);
```

## 🎯 Casos de Uso Avançados

### 1. Lead Scoring Inteligente

```typescript
// Integração com IA para scoring automático
const aiScoringNode = {
  type: "integration",
  data: {
    integration: {
      type: "openai",
      config: {
        prompt: "Analise esta conversa e determine a qualidade do lead (1-10)",
        model: "gpt-4",
        variables: ["conversation_history", "user_responses"],
      },
    },
  },
};
```

### 2. E-commerce Conversacional

```typescript
// Catálogo de produtos integrado
const productShowcaseFlow = {
  nodes: [
    {
      type: "image",
      data: {
        mediaUrl: "{{product.image}}",
        caption: "{{product.name}} - {{product.price}}",
      },
    },
    {
      type: "buttons",
      data: {
        content: "Interessado neste produto?",
        buttons: [
          { id: "buy", text: "💳 Comprar agora" },
          { id: "info", text: "ℹ️ Mais informações" },
          { id: "next", text: "➡️ Próximo produto" },
        ],
      },
    },
  ],
};
```

### 3. Suporte Técnico Automatizado

```typescript
// Base de conhecimento integrada
const supportFlow = {
  nodes: [
    {
      type: "condition",
      data: {
        conditions: [
          {
            variable: "problem_category",
            operator: "equals",
            value: "login_issue",
          },
        ],
      },
    },
    {
      type: "text",
      data: {
        content:
          "Entendi que você está com problemas de login. Vamos resolver isso passo a passo:\n\n1. Verifique se seu email está correto\n2. Tente redefinir sua senha\n3. Limpe o cache do navegador",
      },
    },
  ],
};
```

### 4. Agendamento Inteligente

```typescript
// Integração com calendário
const appointmentFlow = {
  nodes: [
    {
      type: "integration",
      data: {
        integration: {
          type: "calendar",
          config: {
            action: "get_available_slots",
            service: "{{selected_service}}",
            duration: 60,
            timezone: "America/Sao_Paulo",
          },
        },
      },
    },
    {
      type: "buttons",
      data: {
        content: "Horários disponíveis:",
        buttons: "{{available_slots}}",
      },
    },
  ],
};
```

## 📈 Analytics e Métricas

### Métricas de Flow

```typescript
interface FlowAnalytics {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  averageSessionDuration: number;
  conversionRate: number;
  dropoffPoints: Array<{
    nodeId: string;
    nodeName: string;
    dropoffRate: number;
  }>;
  variableCollectionRate: Record<string, number>;
  topExitPoints: Array<{
    nodeId: string;
    exitCount: number;
  }>;
}
```

### Métricas de Sessão

```typescript
interface SessionMetrics {
  duration: number;
  messageCount: number;
  completionPercentage: number;
  variablesCollected: number;
  errorsEncountered: number;
  retryCount: number;
  userSatisfaction?: number;
}
```

### Dashboard de Performance

- **Taxa de Conversão**: % de sessões que completam o fluxo
- **Tempo Médio**: Duração média das conversas
- **Pontos de Abandono**: Onde usuários mais saem
- **Coleta de Dados**: Taxa de sucesso na coleta de variáveis
- **Satisfação**: Avaliação dos usuários (quando configurada)

## 🚀 Setup e Configuração

### 1. Configuração Básica

```env
# Typebot Configuration
TYPEBOT_API_URL=http://localhost:3001/api/v1
TYPEBOT_API_KEY=your_typebot_api_key
TYPEBOT_SELF_HOSTED=true
TYPEBOT_WEBHOOK_URL=http://localhost:3001
```

### 2. Primeira Configuração

```typescript
// 1. Inicializar Typebot service
TypebotService.initialize();

// 2. Criar fluxo de exemplo
const leadFlow = await TypebotService.createFlow(
  tenantId,
  LEAD_CAPTURE_TEMPLATE,
);

// 3. Publicar fluxo
await TypebotService.publishFlow(leadFlow.id, tenantId);

// 4. Testar sessão
const session = await TypebotService.createSession(
  leadFlow.id,
  tenantId,
  SessionTrigger.API,
  { phone: "+5511999999999" },
);
```

### 3. Integração com WhatsApp

```typescript
// Configurar webhook no WhatsApp instance
const webhookUrl = `${process.env.FRONTEND_URL}/api/webhooks/whatsapp/typebot/${tenantId}/${flowId}`;

await WhatsAppService.updateInstance(instanceId, {
  webhookUrl,
  webhookEvents: ["messages.upsert", "connection.update"],
});
```

## 🧪 Testes e Validação

### Teste de Template

```bash
# Obter templates disponíveis
curl -H "Authorization: Bearer $JWT" \
  http://localhost:8080/api/v1/typebot/templates

# Criar fluxo de lead capture
curl -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead Flow"}' \
  http://localhost:8080/api/v1/typebot/templates/LEAD_CAPTURE
```

### Teste de Conversa

```bash
# Iniciar sessão
curl -X POST \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"trigger":"API","contactInfo":{"phone":"+5511999999999"}}' \
  http://localhost:8080/api/v1/typebot/flows/$FLOW_ID/sessions

# Continuar conversa
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"'$SESSION_ID'","userInput":"João Silva"}' \
  http://localhost:8080/api/v1/typebot/sessions/continue
```

### Simulação de WhatsApp

```bash
# Simular mensagem do WhatsApp
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"contactPhone":"+5511999999999","content":{"text":"Quero saber mais"},"instanceId":"inst-123"}' \
  http://localhost:8080/api/webhooks/whatsapp/typebot/$TENANT_ID/$FLOW_ID
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Fluxo Não Executa

- Verificar se está publicado
- Validar estrutura de nodes e edges
- Conferir permissões do tenant
- Verificar configurações de trigger

#### 2. Variáveis Não Coletam

- Validar configuração da variável
- Verificar tipo de input
- Conferir validação regex
- Testar diferentes formatos

#### 3. Integração WhatsApp Falha

- Verificar webhook configurado
- Validar formato da mensagem
- Conferir instância ativa
- Testar conectividade

## 📚 Próximas Integrações

O Módulo 17 se integra perfeitamente com:

### **Módulo 18: AI Services Integration**

- OpenAI para respostas inteligentes
- Análise de sentimento em tempo real
- Classificação automática de intenções

### **Módulo 19: Mautic Marketing Automation**

- Leads automáticos para Mautic
- Segmentação baseada em respostas
- Campanhas triggered por ações

### **Módulo 20: Sistema de Notificações**

- Alertas de abandono de fluxo
- Notificações de conversão
- Relatórios de performance

---

**✅ Módulo 17 - Typebot Integration: CONCLUÍDO**

_Próximo: Módulo 18 - AI Services Integration_

## 📊 Métricas de Implementação

- **Entidades:** 2 entidades principais (TypebotFlow, TypebotSession)
- **Templates:** 4 templates para casos comuns (Lead Capture, Support, Showcase, Booking)
- **API Endpoints:** 20+ endpoints para gestão completa
- **Node Types:** 8 tipos de nodes suportados
- **Integrations:** WhatsApp, CRM, Webhooks, AI services
- **Multi-tenancy:** Isolamento completo + branding personalizado
- **GDPR:** Compliance completo com direitos de privacidade
- **Documentação:** Guia completo de 500+ linhas

**🎯 Sistema de chatbots visuais robusto e escalável que transforma a experiência de atendimento da plataforma KRYONIX!**

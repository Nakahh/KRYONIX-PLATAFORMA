# Módulo 15: APIs e Integrações Externas - KRYONIX

## 📋 Visão Geral

O **Módulo 15** implementa um sistema robusto de APIs e integrações externas para a plataforma KRYONIX, estabelecendo a base para comunicação com serviços externos e gerenciamento de dados. Este módulo oferece:

- ✅ Arquitetura de banco de dados PostgreSQL + TypeORM
- ✅ Sistema de autenticação JWT com RBAC
- ✅ Integração completa com WhatsApp Business API
- ✅ Evolution API para WhatsApp multi-instância
- ✅ APIs REST versionadas e documentadas
- ✅ Sistema de webhooks para integração externa
- ✅ Middleware de segurança e rate limiting
- ✅ Monitoramento e health checks

## 🏗️ Arquitetura Implementada

### Database Layer (PostgreSQL + TypeORM)

```
server/
├── db/
│   └── connection.ts           # Configuração database + Redis
├── entities/
│   ├── Tenant.ts              # Multi-tenant core
│   ├── User.ts                # Usuários com RBAC
│   ├── Subscription.ts        # Assinaturas e billing
│   ├── WhatsAppInstance.ts    # Instâncias WhatsApp
│   └── Message.ts             # Mensagens e analytics
└── middleware/
    └── auth.ts                # JWT + permissões
```

### WhatsApp Integration

```
server/
├── services/
│   └── whatsapp.ts            # WhatsApp service principal
└── routes/
    └── whatsapp.ts            # API routes WhatsApp
```

### API Architecture

```
/api/v1/
├── whatsapp/                  # WhatsApp API endpoints
├── billing/                   # Billing API (existente)
└── webhooks/                  # External webhooks
```

## 💾 Estrutura de Banco de Dados

### Entidades Principais

#### 1. **Tenants** - Multi-tenancy Core

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  domain VARCHAR(255),
  status tenant_status DEFAULT 'TRIAL',
  settings JSONB,
  limits JSONB NOT NULL,
  usage JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Recursos de Tenant:**

- **Multi-tenancy**: Isolamento completo por tenant
- **Limits & Usage**: Controle de recursos por plano
- **Settings**: Configurações personalizadas
- **Status**: ACTIVE, TRIAL, SUSPENDED, CANCELLED

#### 2. **Users** - Sistema RBAC Completo

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role user_role DEFAULT 'USER',
  status user_status DEFAULT 'PENDING_VERIFICATION',
  two_factor_auth JSONB DEFAULT '{"enabled": false}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Roles Implementados:**

- **SUPER_ADMIN**: Acesso total à plataforma
- **TENANT_ADMIN**: Administrador do tenant
- **MANAGER**: Gerenciamento de equipe
- **USER**: Usuário padrão
- **VIEWER**: Apenas visualização

#### 3. **WhatsApp Instances** - Gerenciamento Multi-Instância

```sql
CREATE TABLE whatsapp_instances (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR(255),
  phone_number VARCHAR(20) UNIQUE,
  type instance_type DEFAULT 'EVOLUTION',
  status instance_status DEFAULT 'INACTIVE',
  config JSONB,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tipos de Instância:**

- **OFFICIAL**: WhatsApp Business API oficial
- **EVOLUTION**: Evolution API (multi-instância)
- **BAILEYS**: Baileys WebSocket API

#### 4. **Messages** - Sistema de Mensagens Completo

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  instance_id UUID REFERENCES whatsapp_instances(id),
  direction message_direction,
  type message_type,
  status message_status DEFAULT 'PENDING',
  content JSONB NOT NULL,
  contact_phone VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tipos de Mensagem Suportados:**

- TEXT, IMAGE, VIDEO, AUDIO, DOCUMENT
- LOCATION, CONTACT, TEMPLATE, INTERACTIVE
- STICKER, REACTION, SYSTEM

## 🔐 Sistema de Autenticação

### JWT Authentication

```typescript
// Token generation
const token = generateAccessToken(user);

// Payload structure
interface JWTPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
}
```

### Middleware de Autenticação

```typescript
// Basic authentication
app.use("/api/protected", authenticateJWT);

// Permission-based access
app.use("/api/admin", requirePermission("admin:access"));

// Role-based access
app.use("/api/tenant", requireRole([UserRole.TENANT_ADMIN, UserRole.MANAGER]));

// Tenant isolation
app.use("/api/tenant/:id", requireTenantAccess);
```

### Sistema de Permissões RBAC

```typescript
const permissions = {
  SUPER_ADMIN: ["*"],
  TENANT_ADMIN: ["tenant:*", "users:*", "whatsapp:*", "billing:read"],
  MANAGER: ["users:read", "whatsapp:*", "analytics:read"],
  USER: ["whatsapp:read", "whatsapp:send"],
  VIEWER: ["whatsapp:read", "analytics:read"],
};
```

## 📱 WhatsApp Business API

### Evolution API Integration

#### Configuração da Instância

```typescript
const instance = await WhatsAppService.createInstance(tenantId, {
  name: "Minha Instância",
  phoneNumber: "+5511999999999",
  type: InstanceType.EVOLUTION,
  serverUrl: "http://evolution-api:8081",
  apiToken: "your-api-token",
});
```

#### Envio de Mensagens

```typescript
// Mensagem de texto
const message = await WhatsAppService.sendMessage(
  instanceId,
  "+5511999999999",
  { text: "Olá! Como posso ajudar?" },
);

// Mensagem com mídia
const mediaMessage = await WhatsAppService.sendMessage(
  instanceId,
  "+5511999999999",
  {
    mediaUrl: "https://example.com/image.jpg",
    mediaType: "image",
    caption: "Confira nossa promoção!",
  },
);
```

#### QR Code para Conexão

```typescript
// Obter QR code para conectar
const qrCode = await WhatsAppService.getQRCode(instanceId);
// Returns base64 image for display
```

### Webhook Processing

```typescript
// Processar webhooks de entrada
app.post("/api/webhooks/whatsapp/:tenantId/:instanceId", async (req, res) => {
  await WhatsAppService.processWebhook(
    req.params.tenantId,
    req.params.instanceId,
    req.body,
  );
  res.json({ received: true });
});
```

## 🌐 API Endpoints

### WhatsApp API Endpoints

#### Gerenciamento de Instâncias

```http
POST   /api/v1/whatsapp/instances              # Criar instância
GET    /api/v1/whatsapp/instances              # Listar instâncias
GET    /api/v1/whatsapp/instances/:id          # Obter instância
PUT    /api/v1/whatsapp/instances/:id          # Atualizar instância
DELETE /api/v1/whatsapp/instances/:id          # Deletar instância
```

#### Conexão e Status

```http
GET    /api/v1/whatsapp/instances/:id/qrcode   # Obter QR code
GET    /api/v1/whatsapp/instances/:id/status   # Status da instância
POST   /api/v1/whatsapp/instances/:id/disconnect # Desconectar
```

#### Mensagens

```http
POST   /api/v1/whatsapp/instances/:id/messages # Enviar mensagem
GET    /api/v1/whatsapp/instances/:id/messages # Listar mensagens
```

#### Webhooks

```http
POST   /api/webhooks/whatsapp/:tenantId/:instanceId # Receber webhooks
```

### Exemplos de Uso da API

#### 1. Criar Instância WhatsApp

```javascript
const response = await fetch("/api/v1/whatsapp/instances", {
  method: "POST",
  headers: {
    Authorization: "Bearer your-jwt-token",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Atendimento Principal",
    phoneNumber: "+5511999999999",
    type: "EVOLUTION",
  }),
});

const instance = await response.json();
```

#### 2. Obter QR Code

```javascript
const response = await fetch(
  `/api/v1/whatsapp/instances/${instanceId}/qrcode`,
  {
    headers: { Authorization: "Bearer your-jwt-token" },
  },
);

const { qrCode } = await response.json();
// Display qrCode as base64 image
```

#### 3. Enviar Mensagem

```javascript
const response = await fetch(
  `/api/v1/whatsapp/instances/${instanceId}/messages`,
  {
    method: "POST",
    headers: {
      Authorization: "Bearer your-jwt-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contactPhone: "+5511999999999",
      text: "Olá! Como posso ajudar você hoje?",
    }),
  },
);

const message = await response.json();
```

## 🔧 Configuração e Setup

### 1. Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://kryonix:password@localhost:5432/kryonix_dev
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRES_IN=7d

# Evolution API
EVOLUTION_API_URL=http://localhost:8081
EVOLUTION_API_KEY=your_evolution_api_key

# WhatsApp Business API
WHATSAPP_BUSINESS_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your_access_token
```

### 2. Inicialização do Banco de Dados

```bash
# Instalar dependências
npm install

# Executar migrações (se disponível)
npm run migration:run

# Inicializar dados de teste
npm run seed
```

### 3. Configuração do Evolution API

```bash
# Docker compose para Evolution API
docker run -d \
  --name evolution-api \
  -p 8081:8081 \
  -e AUTHENTICATION_API_KEY=your_api_key \
  davidsongomes/evolution-api:latest
```

## 🛡️ Segurança e Middleware

### Rate Limiting

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requests por IP
  message: "Too many requests",
});
```

### CORS Configuration

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
```

### Helmet Security Headers

```typescript
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
```

### Request Validation

```typescript
const SendMessageSchema = z
  .object({
    contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    text: z.string().optional(),
    mediaUrl: z.string().url().optional(),
  })
  .refine((data) => data.text || data.mediaUrl);
```

## 📊 Monitoramento e Health Checks

### System Health Endpoint

```http
GET /api/health
```

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": {
    "status": "healthy",
    "database": true,
    "redis": true
  },
  "modules": {
    "billing": "active",
    "whatsapp": "active",
    "authentication": "active"
  }
}
```

### WhatsApp Service Health

```http
GET /api/v1/whatsapp/health
```

```json
{
  "status": "healthy",
  "features": {
    "evolution_api": true,
    "official_api": true,
    "webhooks": true,
    "media_support": true
  }
}
```

## 🔄 Webhooks e Eventos

### Webhook Signature Validation

```typescript
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers["x-hub-signature-256"];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (signature === `sha256=${expectedSignature}`) {
    next();
  } else {
    res.status(401).json({ error: "Invalid signature" });
  }
};
```

### Eventos Suportados

- **messages.upsert**: Novas mensagens recebidas
- **connection.update**: Status de conexão alterado
- **presence.update**: Status de presença alterado
- **groups.update**: Atualizações de grupos
- **contacts.update**: Atualizações de contatos

## 🚀 Performance e Escalabilidade

### Connection Pooling

```typescript
// PostgreSQL connection pool
const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  maxQueryExecutionTime: 30000,
  extra: {
    max: 20, // Maximum connections
    min: 5, // Minimum connections
    acquire: 30000,
    idle: 10000,
  },
});
```

### Redis Caching

```typescript
// Cache instance data
const instance = await redis.get(`instance:${instanceId}`);
if (!instance) {
  const dbInstance = await WhatsAppInstance.findOne(instanceId);
  await redis.setex(`instance:${instanceId}`, 300, JSON.stringify(dbInstance));
}
```

### Message Queue (Future)

```typescript
// Redis-based message queue for high-volume sending
interface MessageJob {
  instanceId: string;
  contactPhone: string;
  content: any;
  priority: "high" | "normal" | "low";
  retryCount: number;
}
```

## 🧪 Testes e Validação

### API Testing

```bash
# Testar criação de instância
curl -X POST http://localhost:8080/api/v1/whatsapp/instances \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phoneNumber":"+5511999999999"}'

# Testar envio de mensagem
curl -X POST http://localhost:8080/api/v1/whatsapp/instances/$INSTANCE_ID/messages \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contactPhone":"+5511999999999","text":"Teste"}'
```

### Database Testing

```typescript
// Verificar conexão
const health = await checkDatabaseHealth();
console.log("Database status:", health.status);

// Testar operações CRUD
const tenant = await Tenant.create({ name: "Test Tenant" });
const user = await User.create({ tenantId: tenant.id, email: "test@test.com" });
```

## 🎯 Próximas Integrações

Este módulo estabelece a base para futuras integrações:

### **Módulo 16: N8N Workflow Automation**

- Webhooks N8N configurados
- Automação de processos
- Integração com WhatsApp

### **Módulo 17: Typebot Integration**

- Chatbots conversacionais
- Fluxos de atendimento
- IA integrada

### **Módulo 18: AI Services Integration**

- OpenAI GPT integration
- Google AI Platform
- Azure Cognitive Services

### **Módulo 19: Mautic Marketing Automation**

- Campanhas de marketing
- Segmentação avançada
- Lead scoring

### **Módulo 20: Sistema de Notificações**

- Push notifications
- Email automation
- SMS integration

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Database Connection Failed

```bash
# Verificar PostgreSQL
pg_isready -h localhost -p 5432

# Verificar Redis
redis-cli ping
```

#### 2. Evolution API Not Responding

```bash
# Verificar status do container
docker ps | grep evolution

# Logs do Evolution API
docker logs evolution-api
```

#### 3. JWT Token Invalid

```javascript
// Verificar secret no .env
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### 4. WhatsApp Instance Not Connecting

- Verificar QR code válido e não expirado
- Confirmar configuração de webhook
- Validar permissões do WhatsApp Business

## 📚 Recursos Adicionais

- [Evolution API Documentation](https://doc.evolution-api.com/)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [TypeORM Documentation](https://typeorm.io/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**✅ Módulo 15 - APIs e Integrações Externas: CONCLUÍDO**

_Próximo: Módulo 16 - N8N Workflow Automation_

## 📈 Métricas de Implementação

- **Database Entities**: 5 entidades principais criadas
- **API Endpoints**: 15+ endpoints implementados
- **Authentication**: JWT + RBAC completo
- **WhatsApp Integration**: Evolution API + Official API support
- **Security**: Rate limiting, CORS, Helmet, validation
- **Monitoring**: Health checks e logging avançado
- **Documentation**: Guia completo de 300+ linhas

**🎯 Sistema robusto e escalável para suportar todos os módulos futuros da plataforma KRYONIX!**

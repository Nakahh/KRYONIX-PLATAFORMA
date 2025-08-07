# KRYONIX Backend

Backend da plataforma KRYONIX - APIs, IA e infraestrutura para SaaS 100% autônomo.

## 🚀 Deploy no Render

Este backend está configurado para deploy automático no Render.

### 1. Deploy Automático
```bash
# Conecte seu repositório ao Render
# Configure o render.yaml para deploy automático
```

### 2. Configuração de Serviços
```yaml
# render.yaml já configurado com:
- Web Service (Node.js)
- PostgreSQL Database
- Redis Cache
```

### 3. Comandos Disponíveis
```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Monitoramento
npm run monitor

# Webhook listener
npm run webhook
```

## 🏗️ Arquitetura

- **Framework**: Express.js
- **Database**: PostgreSQL (multi-tenant)
- **Cache**: Redis
- **Auth**: Keycloak SSO + JWT
- **AI**: Ollama + Dify + LangFlow
- **Storage**: MinIO/S3
- **Monitoring**: Prometheus + Grafana

## 🎯 APIs Principais

### Módulos SaaS (8 APIs)
1. **Auth API** - `/api/auth/*`
2. **CRM API** - `/api/crm/*`
3. **WhatsApp API** - `/api/whatsapp/*`
4. **Agendamento API** - `/api/agendamento/*`
5. **Marketing API** - `/api/marketing/*`
6. **Analytics API** - `/api/analytics/*`
7. **Portal API** - `/api/portal/*`
8. **White-label API** - `/api/whitelabel/*`

### Endpoints Essenciais
```bash
# Health checks
GET /health
GET /api/health
GET /api/status

# Webhook GitHub
POST /api/github-webhook
```

## 🤖 IA Autônoma

- **Ollama**: LLM local para processamento
- **Dify**: IA conversacional
- **LangFlow**: Automações inteligentes
- **Auto-criação**: Clientes em 2-5 minutos

## 🔒 Multi-tenancy

- **Isolamento**: Schema-based isolation
- **PostgreSQL**: Row Level Security (RLS)
- **Cache**: Redis por tenant
- **Storage**: Bucket por tenant

## 📊 Monitoramento 24/7

- **Health checks**: Automáticos
- **Logs**: Centralizados
- **Metrics**: Prometheus
- **Alerts**: Sistema IA
- **Backup**: Automático

## 📦 Estrutura

```
backend/
├── src/
│   ├── server.js        # Servidor principal
│   ├── lib/            # Lógica de negócio
│   └── routes/         # Rotas das APIs
├── scripts/            # Scripts de instalação
├── docs/              # Documentação técnica
└── config/            # Configurações
```

## 🌐 URLs

- **Desenvolvimento**: http://localhost:8080
- **Produção**: https://kryonix-backend.onrender.com
- **Health**: https://kryonix-backend.onrender.com/health
- **Status**: https://kryonix-backend.onrender.com/api/status

## 🚀 Infraestrutura

### Render Services
- **Web Service**: Express.js app
- **PostgreSQL**: Database principal
- **Redis**: Cache e sessions

### Integração Externa
- **Keycloak**: SSO e autenticação
- **Evolution API**: WhatsApp Business
- **MinIO**: Object storage
- **Prometheus**: Monitoramento

## 📋 Variáveis de Ambiente

Configure as seguintes variáveis no Render:

```bash
# Essenciais
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://kryonix-frontend.vercel.app

# Database (auto-configurado pelo Render)
DATABASE_URL=postgresql://...

# APIs Externas
EVOLUTION_API_URL=https://api.kryonix.com.br
KEYCLOAK_URL=https://auth.kryonix.com.br
```

## 🔧 Features Técnicas

- ✅ **Multi-tenant**: Isolamento completo
- ✅ **Auto-scaling**: Baseado em CPU
- ✅ **Health checks**: Monitoramento contínuo
- ✅ **CORS**: Configurado para frontend
- ✅ **Security**: Helmet + rate limiting
- ✅ **Logs**: Morgan + estruturados
- ✅ **Webhook**: Deploy automático GitHub

Desenvolvido para rodar no **Render** com alta disponibilidade e performance.

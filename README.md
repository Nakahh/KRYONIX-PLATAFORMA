# 🚀 KRYONIX - Plataforma SaaS Autônoma com IA

<div align="center">

![KRYONIX Logo](https://cdn.builder.io/api/v1/image/assets%2Ff3c03838ba934db3a83fe16fb45b6ea7%2F3519eceabb8c461795571a5035d97ebe?format=webp&width=200)

**Plataforma SaaS 100% Autônoma e Inteligente para Empreendedores**

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow.svg)](#)
[![Versão](https://img.shields.io/badge/Versão-2.0-blue.svg)](#)
[![IA](https://img.shields.io/badge/IA-100%25%20Autônoma-green.svg)](#)
[![Mobile](https://img.shields.io/badge/Mobile--First-80%25%20dos%20Usuários-orange.svg)](#)

</div>

## 📊 Status do Projeto

**68% Concluído** - Parte 34 de 50 implementada

### ✅ Implementado

- 🤖 **IA 100% Autônoma** - OpenAI, Anthropic, Google AI
- 🔧 **Auto-Healing Inteligente** - Correção automática de problemas
- 📱 **Mobile-First Design** - 80% dos usuários mobile
- 🎨 **Identidade Visual KRYONIX** - Logo e branding completos
- 📊 **Métricas Reais Prometheus** - Dados reais, não mock
- ⚡ **N8N Workflows Reais** - Execução via API real
- 🔌 **Conectividade Robusta** - Frontend ↔ Backend

### 🚧 Em Progresso

- 📈 **Análise Preditiva** - Business Intelligence com ML
- 💰 **Otimização de Custos** - Auto-scaling inteligente
- 🌐 **Deploy Produção** - Netlify + stacks externas

## 🏗️ Arquitetura

### Frontend (React 18 + TypeScript)

```
client/
├── components/
│   ├── brand/           # Logo KRYONIX + Identidade Visual
│   ├── layout/          # KryonixLayout unificado
│   └── ui/              # 47 componentes shadcn/ui
├── hooks/               # Hooks com dados reais
├── services/            # APIs + IA + Automação
└── pages/               # 15+ páginas funcionais
```

### Backend (Node.js + Express + TypeScript)

```
server/
├── routes/              # APIs REST organizadas
├── services/            # IA + N8N + WhatsApp + Billing
├── entities/            # TypeORM + PostgreSQL
└── middleware/          # Auth + CORS + Rate Limiting
```

### Stacks Integradas (25 stacks)

```
🔥 Principais:
- WhatsApp: https://api.kryonix.com.br
- N8N: https://n8n.kryonix.com.br
- Typebot: https://typebot.kryonix.com.br
- Mautic: https://mautic.kryonix.com.br
- Grafana: https://grafana.kryonix.com.br
- Prometheus: https://prometheus.kryonix.com.br
```

## 🎨 Identidade Visual

### Cores da Marca

```css
/* Azul KRYONIX */
--kryonix-blue: #0ea5e9 /* Verde KRYONIX */ --kryonix-green: #22c55e
  /* Gradiente Oficial */
  background: linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%);
```

### Logo Integration

- ✅ Header principal
- ✅ Tela de login/registro
- ✅ Loading screens
- ✅ Menu do usuário
- ✅ PWA favicon

## 🤖 IA 100% Autônoma

### Providers Integrados

- **OpenAI**: GPT-4, GPT-4o (análise e configuração)
- **Anthropic**: Claude-3 (processamento avançado)
- **Google AI**: Sentiment, Speech-to-Text, Translation

### Auto-Healing System

```typescript
// Detecção automática de problemas
- CPU > 85% → Otimização automática
- Memória > 90% → Limpeza e restart
- Erros > 5% → Investigação e correção
- Latência > 2s → Cache e CDN
- Serviço offline → Restart automático
```

### Configuração Automática

- Templates brasileiros pré-configurados
- Contexto de negócio nacional
- Compliance LGPD automático
- Integração PIX e métodos locais

## 📱 Mobile-First (80% usuários)

### Responsividade

- **xs-md**: Interface móvel otimizada
- **lg+**: Desktop com sidebar + detalhes
- **Touch**: Gestos nativos, swipe, pull-refresh
- **PWA**: Instalação, offline, notificações

### Performance Mobile

- Lazy loading de componentes
- Bundling otimizado (Vite)
- Cache inteligente (TanStack Query)
- Fallbacks offline

## 🔌 Conectividade Real

### API Client Robusto

```typescript
// Auto-retry + Health Check + Fallbacks
enhancedApiClient
  .get("/api/v1/dashboard")
  .then(realData)
  .catch(() => fallbackData);
```

### WebSocket Real-Time

- Status de stacks em tempo real
- Métricas live (CPU, memória, requests)
- Notificações push instantâneas
- Chat/mensagens ao vivo

### Fallback Inteligente

- APIs offline → Dados mock realistas
- Conexão instável → Queue de retry
- Servidor degradado → Cache local

## 📊 Métricas Reais (Prometheus)

### Queries PromQL

```promql
# WhatsApp mensagens hoje
increase(evolution_api_messages_sent_total[24h])

# CPU por stack
avg(node_cpu_usage_percent{service="evolution-api"})

# Requests por minuto
rate(nginx_http_requests_total[1m])
```

### Dashboards

- Sistema geral (CPU, RAM, Disco, Rede)
- WhatsApp Business (mensagens, instâncias)
- N8N (workflows, execuções, sucesso)
- Compliance (LGPD, SSL, backups)

## 🛠️ Configuração de Desenvolvimento

### Pré-requisitos

```bash
Node.js 18+
PostgreSQL 14+
Redis 6+ (opcional)
```

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/kryonix.git
cd kryonix

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# 4. Execute migrações do banco
npm run migrate

# 5. Inicie o desenvolvimento
npm run dev
```

### Variáveis de Ambiente Críticas

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/kryonix

# IA Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Stacks Externas
N8N_API_URL=https://n8n.kryonix.com.br/api/v1
N8N_API_KEY=seu_n8n_api_key
EVOLUTION_API_URL=https://api.kryonix.com.br
PROMETHEUS_URL=https://prometheus.kryonix.com.br

# Billing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🚀 Deploy Produção

### Netlify (Frontend)

```bash
# Build command
npm run build

# Publish directory
dist/

# Environment variables
VITE_API_URL=https://api.kryonix.com.br
VITE_PROMETHEUS_URL=https://prometheus.kryonix.com.br
```

### VPS/Cloud (Backend)

```bash
# Docker deployment
docker-compose up -d

# Ou manual
npm run build
npm run start:prod
```

### Stacks Externas

Cada stack roda em subdomain próprio:

- `api.kryonix.com.br` - Evolution API
- `n8n.kryonix.com.br` - N8N Workflows
- `typebot.kryonix.com.br` - Chatbots
- `mautic.kryonix.com.br` - Marketing
- `grafana.kryonix.com.br` - Analytics
- `prometheus.kryonix.com.br` - Métricas

## 📚 Documentação Técnica

### Estrutura de Pastas

```
kryonix/
├── 📱 client/              # Frontend React
├── 🔧 server/              # Backend Node.js
├── 🔗 shared/              # Tipos compartilhados
├── 📦 stack-uploads/       # Configs das stacks
├── 🐳 docker/              # Containers
└── 📖 docs/                # Documentação
```

### Componentes Principais

- **KryonixLayout**: Layout unificado mobile-first
- **KryonixLogo**: Sistema de logo responsivo
- **EnhancedApiClient**: Client robusto com retry
- **AutoHealingSystem**: Correção automática IA
- **PrometheusClient**: Métricas reais

### Hooks Essenciais

```typescript
useRealDashboardData(); // Dashboard com dados reais
useWhatsAppInstances(); // Instâncias WhatsApp
useBillingData(); // Cobrança/assinaturas
useConnectionStatus(); // Status de conexão
useRealTimeMetrics(); // Métricas ao vivo
```

## 🔒 Segurança & Compliance

### Autenticação

- JWT + Refresh tokens
- OAuth2 (Google, GitHub)
- 2FA com QR Code
- Rate limiting

### LGPD Compliance

- Audit logs automáticos
- Consentimento de cookies
- Anonimização de dados
- Direito ao esquecimento

### Segurança da API

- Helmet.js headers
- CORS configurado
- Validação Zod
- Sanitização XSS

## 👥 Equipe

**Fundador & CEO**: [Vitor Fernandes](https://linkedin.com/in/vitor-fernandes)

- Especialista em IA e Automação
- 10+ anos de experiência
- Visão: Democratizar IA para empreendedores

## 📞 Suporte

- **Email**: suporte@kryonix.com.br
- **WhatsApp**: [Fale conosco](https://wa.me/5511999999999)
- **Documentação**: [docs.kryonix.com.br](https://docs.kryonix.com.br)

## 📄 Licença

Proprietary License - © 2024 KRYONIX. Todos os direitos reservados.

**⚠️ Código Protegido**: Este software é propriedade da KRYONIX e está protegido por leis de direitos autorais. Uso não autorizado é proibido.

---

<div align="center">

**🚀 Criado por [Vitor Fernandes](https://linkedin.com/in/vitor-fernandes) para democratizar a IA**

[![KRYONIX](https://img.shields.io/badge/Powered%20by-KRYONIX-blue.svg)](https://kryonix.com.br)

</div>

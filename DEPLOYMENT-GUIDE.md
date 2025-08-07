# 🚀 KRYONIX - Guia Completo de Deploy

Este guia contém todas as instruções para fazer o deploy completo da plataforma KRYONIX no **Vercel** (frontend) e **Render** (backend).

## 📋 Visão Geral

- **Frontend**: Next.js App Router → Vercel
- **Backend**: Express + APIs → Render
- **Banco de Dados**: PostgreSQL → Render
- **Cache**: Redis → Render
- **Monitoramento**: Multi-serviços → Render

## 🎯 Arquitetura Final

```
Frontend (Vercel)     Backend (Render)
     ↓                      ↓
┌──────────────┐    ┌─────────────────┐
│   Next.js    │────│   Express API   │
│ + React + TS │    │ + Socket.io     │
│ + Tailwind   │    │ + Webhooks      │
│ + next-intl  │    │ + Monitoring    │
└──────────────┘    └─────────────────┘
                             ↓
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   + Redis       │
                    │   + Backups     │
                    └─────────────────┘
```

---

## 🔧 Pré-requisitos

### 1. Ferramentas Necessárias
```bash
# Node.js 18+
node --version  # deve mostrar v18.x.x ou superior

# Git configurado
git --version

# NPM atualizado
npm --version
```

### 2. Contas Necessárias
- [ ] **GitHub** - Para repositório do código
- [ ] **Vercel** - Para deploy do frontend
- [ ] **Render** - Para deploy do backend
- [ ] **Domínio** (opcional) - Para URL personalizada

### 3. Configurações Externas
- [ ] **Evolution API** - Para WhatsApp Business
- [ ] **SendGrid/SMTP** - Para emails
- [ ] **GitHub Webhook** - Para deploy automático

---

## 🌐 PARTE 1: Deploy do Frontend no Vercel

### Passo 1: Preparar o Projeto
```bash
# 1. Verificar configurações
npm run health

# 2. Testar build local
npm run build:vercel

# 3. Verificar tipos TypeScript
npm run type-check
```

### Passo 2: Deploy Automático
```bash
# Usar script automático
npm run deploy:vercel

# OU manualmente:
npx vercel login
npx vercel --prod
```

### Passo 3: Configurar Variáveis de Ambiente no Vercel

Acesse [Vercel Dashboard](https://vercel.com/dashboard) e configure:

#### 🔐 Variáveis Obrigatórias
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://kryonix-backend.onrender.com
NEXT_PUBLIC_SITE_URL=https://kryonix.vercel.app
NEXT_PUBLIC_ENV=production

# Security
NEXTAUTH_SECRET=seu-secret-super-seguro-aqui
NEXTAUTH_URL=https://kryonix.vercel.app
JWT_SECRET=seu-jwt-secret-aqui
ADMIN_TOKEN=seu-admin-token-aqui

# Build Optimization
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production
```

### Passo 4: Verificar Deploy
```bash
# Testar URLs importantes
curl https://kryonix.vercel.app/health
curl https://kryonix.vercel.app/api/status

# Verificar todas as rotas de idioma
https://kryonix.vercel.app/pt-br
https://kryonix.vercel.app/en
https://kryonix.vercel.app/es
https://kryonix.vercel.app/de
https://kryonix.vercel.app/fr
```

---

## 🛠️ PARTE 2: Deploy do Backend no Render

### Passo 1: Preparar Repositório
```bash
# 1. Verificar render.yaml existe
ls -la render.yaml

# 2. Verificar scripts de migração
npm run migrate  # teste local

# 3. Verificar health check
npm run health
```

### Passo 2: Deploy no Render
```bash
# Usar script automático
npm run deploy:render

# OU manual via dashboard:
# 1. Acesse https://dashboard.render.com
# 2. Conecte seu repositório GitHub
# 3. Importe usando render.yaml
```

### Passo 3: Configurar Variáveis de Ambiente no Render

#### 🔐 Variáveis Críticas
```env
# Core
NODE_ENV=production
PORT=8080
HOSTNAME=0.0.0.0

# Security (Render pode gerar automaticamente)
WEBHOOK_SECRET=(generate value)
JWT_SECRET=(generate value)  
ENCRYPTION_KEY=(generate value)
SESSION_SECRET=(generate value)

# CORS - MUITO IMPORTANTE
CORS_ORIGINS=https://kryonix.vercel.app,https://kryonix.com.br,https://www.kryonix.com.br

# Features
AUTO_MIGRATE=true
AUTO_BACKUP=true
HEALTH_CHECK_ENABLED=true
MONITORING_ENABLED=true
GITHUB_WEBHOOK_ENABLED=true
```

#### 🌐 Serviços Externos
```env
# WhatsApp Business
EVOLUTION_API_URL=https://api.kryonix.com.br
EVOLUTION_API_KEY=sua-evolution-api-key
WHATSAPP_WEBHOOK_URL=https://kryonix-backend.onrender.com/api/whatsapp-webhook
ALERT_WHATSAPP=+5517981805327

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
ALERT_EMAIL=monitoring@kryonix.com.br

# Storage (opcional)
MINIO_URL=https://storage.kryonix.com.br
MINIO_ACCESS_KEY=kryonix
MINIO_SECRET_KEY=(generate value)

# Auth Provider (opcional)
KEYCLOAK_URL=https://keycloak.kryonix.com.br
KEYCLOAK_ADMIN_USERNAME=kryonix
KEYCLOAK_ADMIN_PASSWORD=(generate value)
```

### Passo 4: Verificar Serviços Render

#### 📊 Serviços Criados
- **kryonix-backend** (Web Service) - `https://kryonix-backend.onrender.com`
- **kryonix-webhook** (Worker) - Para GitHub webhooks
- **kryonix-monitor** (Worker) - Para monitoramento
- **kryonix-postgres** (Database) - PostgreSQL 15
- **kryonix-redis** (Redis) - Cache e sessões

#### 🔍 Health Checks
```bash
# Verificar se todos os serviços estão online
curl https://kryonix-backend.onrender.com/health
curl https://kryonix-backend.onrender.com/api/status

# Verificar webhook
curl -X POST https://kryonix-backend.onrender.com/api/github-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 🔗 PARTE 3: Conectar Frontend e Backend

### Passo 1: Atualizar CORS no Backend
No Render, certifique-se que `CORS_ORIGINS` inclui:
```env
CORS_ORIGINS=https://kryonix.vercel.app,https://seu-dominio.com.br
```

### Passo 2: Atualizar API URL no Frontend
No Vercel, configure:
```env
NEXT_PUBLIC_API_URL=https://kryonix-backend.onrender.com
```

### Passo 3: Testar Integração
```bash
# Do frontend, testar chamadas para backend
curl https://kryonix.vercel.app/api/health
curl https://kryonix.vercel.app/api/status
```

---

## 📡 PARTE 4: Configurar GitHub Webhooks

### Webhook para Deploy Automático

1. **Acesse GitHub Repository**:
   - Vá para: `https://github.com/Nakahh/KRYONIX-PLATAFORMA`
   - Settings → Webhooks → Add webhook

2. **Configurações do Webhook**:
   ```
   Payload URL: https://kryonix-backend.onrender.com/api/github-webhook
   Content type: application/json
   Secret: (copie WEBHOOK_SECRET do Render)
   Events: Push, Pull Request
   Active: ✅
   ```

3. **Testar Webhook**:
   ```bash
   # Fazer um commit e push para testar
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```

---

## 🌍 PARTE 5: Configurar Domínios Personalizados

### Domínio Frontend (Vercel)
1. **No Vercel Dashboard**:
   - Project → Settings → Domains
   - Add: `kryonix.com.br` e `www.kryonix.com.br`

2. **Configurar DNS**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A (se necessário)
   Name: @
   Value: 76.76.19.61
   ```

### Domínio Backend (Render)
1. **No Render Dashboard**:
   - Service → Settings → Custom Domains
   - Add: `api.kryonix.com.br`

2. **Configurar DNS**:
   ```
   Type: CNAME
   Name: api
   Value: kryonix-backend.onrender.com
   ```

---

## ✅ PARTE 6: Checklist Final

### Frontend (Vercel)
- [ ] Deploy concluído sem erros
- [ ] Todas as rotas funcionando (`/pt-br`, `/en`, etc.)
- [ ] Environment variables configuradas
- [ ] Health check respondendo: `/health`
- [ ] APIs conectando com backend
- [ ] Domínio personalizado funcionando (se configurado)

### Backend (Render)
- [ ] Todos os 5 serviços online (web, workers, DB, redis)
- [ ] Environment variables configuradas
- [ ] Migrations rodaram com sucesso
- [ ] Health checks funcionando: `/health`, `/api/status`
- [ ] CORS configurado para frontend
- [ ] GitHub webhook funcionando
- [ ] Backups automáticos configurados

### Integração
- [ ] Frontend → Backend: Chamadas API funcionando
- [ ] Backend → Frontend: CORS permitindo requisições
- [ ] Webhook GitHub → Deploy automático funcionando
- [ ] Logs sem erros críticos
- [ ] Performance adequada (tempo de resposta < 2s)

---

## 🆘 Troubleshooting

### Problemas Comuns

#### Frontend não conecta com Backend
```bash
# Verificar CORS
# No Render: CORS_ORIGINS deve incluir URL do Vercel
# No Vercel: NEXT_PUBLIC_API_URL deve apontar para Render
```

#### Build Error no Vercel
```bash
# Verificar tipos TypeScript
npm run type-check

# Verificar build local
npm run build:vercel
```

#### Backend não inicia no Render
```bash
# Verificar logs no Render Dashboard
# Comum: DATABASE_URL não configurada automaticamente
# Verificar se PostgreSQL está online
```

#### 404 nas Rotas Internationalizadas
```bash
# Verificar middleware.ts
# Verificar se locales estão corretas em lib/i18n.ts
# Testar: https://seu-site.com/pt-br, /en, /es, /de, /fr
```

---

## 📞 Suporte e Contato

### Desenvolvedor
- **Nome**: Vitor Jayme Fernandes Ferreira
- **WhatsApp**: +55 17 98180-5327
- **Email**: contato@kryonix.com.br

### Links Úteis
- **Frontend**: https://kryonix.vercel.app
- **Backend**: https://kryonix-backend.onrender.com
- **Health**: https://kryonix-backend.onrender.com/health
- **GitHub**: https://github.com/Nakahh/KRYONIX-PLATAFORMA

---

## 🎉 Deploy Realizado com Sucesso!

Sua plataforma KRYONIX agora está rodando em produção com:

✅ **Frontend Next.js no Vercel**  
✅ **Backend Express no Render**  
✅ **PostgreSQL + Redis no Render**  
✅ **Deploy automático via GitHub**  
✅ **Monitoramento multi-serviços**  
✅ **Backup automático**  
✅ **HTTPS e CDN global**  

**Resultado**: Uma plataforma SaaS 100% autônoma por IA rodando em cloud enterprise! 🚀

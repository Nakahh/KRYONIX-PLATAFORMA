# 🚀 KRYONIX Platform - Deploy Completo

## 📋 Visão Geral

Este diretório contém scripts instaladores completos para hospedar gratuitamente a plataforma KRYONIX:

- **Frontend (Next.js)** → **Vercel** (Gratuito)
- **Backend (Express/APIs)** → **Render** (Gratuito)

## 📁 Estrutura dos Arquivos

```
deploy/
├── vercel-installer.sh          # Script completo para Vercel
├── render-installer.sh          # Script completo para Render  
├── .env.production.template     # Template de variáveis de ambiente
└── README.md                   # Esta documentação
```

## 🎯 Pré-requisitos

### Software Necessário
- **Node.js 18+** ([Download](https://nodejs.org))
- **Git** ([Download](https://git-scm.com))
- **npm** (incluso com Node.js)

### Contas Necessárias
- **GitHub** (para repositório)
- **Vercel** ([Registro gratuito](https://vercel.com))
- **Render** ([Registro gratuito](https://render.com))

## 🚀 Processo de Deploy

### 1️⃣ Preparação

```bash
# Clone o projeto (se ainda não fez)
git clone https://github.com/seu-usuario/kryonix-plataforma.git
cd kryonix-plataforma

# Torne os scripts executáveis
chmod +x deploy/vercel-installer.sh
chmod +x deploy/render-installer.sh
```

### 2️⃣ Deploy do Backend (Render)

Execute primeiro o backend, pois o frontend precisa da URL do backend:

```bash
./deploy/render-installer.sh
```

**O script irá:**
1. ✅ Verificar pré-requisitos
2. 🔐 Autenticar no Render CLI
3. ⚙️ Criar configurações otimizadas
4. 🗄️ Configurar PostgreSQL + Redis
5. 🚀 Fazer deploy automático
6. 📊 Configurar monitoramento

**Anote a URL do backend** (ex: `https://kryonix-backend.onrender.com`)

### 3️⃣ Deploy do Frontend (Vercel)

```bash
./deploy/vercel-installer.sh
```

**O script irá:**
1. ✅ Verificar pré-requisitos
2. 🔐 Autenticar no Vercel CLI
3. ⚙️ Criar configurações Next.js
4. 🌐 Configurar domínio (opcional)
5. 🚀 Fazer deploy automático
6. 🔗 Conectar com backend

## ⚙️ Configuração de Variáveis

### Frontend (Vercel)
```bash
# Configurar via CLI
vercel env add NEXT_PUBLIC_API_URL production
# Valor: https://kryonix-backend.onrender.com

vercel env add NODE_ENV production  
# Valor: production
```

### Backend (Render)
As variáveis principais são configuradas automaticamente:
- `DATABASE_URL` → PostgreSQL automático
- `REDIS_URL` → Redis automático  
- `JWT_SECRET` → Gerado automaticamente

## 🔧 Configurações Adicionais

### GitHub Webhooks

1. Vá em **Settings > Webhooks** no seu repositório
2. **Add webhook**:
   - URL: `https://kryonix-backend.onrender.com/api/github-webhook`
   - Content type: `application/json`
   - Events: `push`, `pull_request`
   - Secret: Use a variável `WEBHOOK_SECRET` do Render

### Domínio Personalizado

**Para o Frontend (Vercel):**
1. No dashboard Vercel → Settings → Domains
2. Adicione: `kryonix.com.br`
3. Configure DNS: `CNAME @ cname.vercel-dns.com`

**Para o Backend (Render):**
1. No dashboard Render → Settings → Custom Domains
2. Adicione: `api.kryonix.com.br`
3. Configure DNS: `CNAME api kryonix-backend.onrender.com`

## 📊 Monitoramento

### Health Checks Automáticos
- **Frontend**: `https://seu-site.vercel.app/health`
- **Backend**: `https://kryonix-backend.onrender.com/health`

### Logs em Tempo Real
```bash
# Logs do Render
render logs kryonix-backend --tail

# Logs do Vercel
vercel logs https://seu-site.vercel.app
```

## 🛠️ Comandos Úteis

### Vercel
```bash
# Ver deployments
vercel ls

# Ver logs
vercel logs

# Configurar env vars
vercel env add NOME_VAR production

# Deploy manual
vercel --prod
```

### Render
```bash
# Ver serviços
render services list

# Ver logs
render logs kryonix-backend

# Deploy manual  
render deploy
```

## 🔒 Segurança

### Variáveis Sensíveis
- ✅ `JWT_SECRET` → Auto-gerado pelo Render
- ✅ `DATABASE_URL` → Auto-configurado pelo Render
- ✅ `WEBHOOK_SECRET` → Auto-gerado pelo Render
- ⚠️ `EVOLUTION_API_KEY` → Configure manualmente
- ⚠️ `SENDGRID_API_KEY` → Configure manualmente

### CORS Configuration
O backend está configurado para aceitar requests apenas dos domínios:
- `https://kryonix-frontend.vercel.app`
- `https://kryonix.com.br` 
- `https://app.kryonix.com.br`

## 🐛 Troubleshooting

### Build Falhando
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar dependências
npm run check-deps
```

### Erro de Conexão Backend
1. Verifique se o serviço está rodando: `render services list`
2. Verifique os logs: `render logs kryonix-backend`
3. Teste o health check: `curl https://kryonix-backend.onrender.com/health`

### Erro de CORS
1. Verifique a variável `CORS_ORIGINS` no Render
2. Adicione o domínio do frontend na lista

## 📞 Suporte

- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Render**: https://render.com/docs
- **Issues GitHub**: https://github.com/seu-usuario/kryonix-plataforma/issues

## 🎉 Deploy Bem-sucedido!

Após o deploy completo, você terá:

✅ **Frontend funcionando** no Vercel  
✅ **Backend funcionando** no Render  
✅ **Database PostgreSQL** configurado  
✅ **Redis cache** configurado  
✅ **Monitoramento 24/7** ativo  
✅ **Deploy automático** via GitHub  
✅ **Health checks** funcionando  

**URLs finais:**
- Frontend: `https://kryonix-frontend.vercel.app`
- Backend: `https://kryonix-backend.onrender.com`
- Health Frontend: `https://kryonix-frontend.vercel.app/health`
- Health Backend: `https://kryonix-backend.onrender.com/health`

**🎯 Sua plataforma KRYONIX está no ar e rodando 100% gratuita!**

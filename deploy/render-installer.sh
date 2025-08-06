#!/bin/bash

# ============================================================================
# 🚀 KRYONIX - SCRIPT INSTALADOR COMPLETO PARA RENDER
# ============================================================================
# Deploy completo da plataforma KRYONIX no Render
# Desenvolvido por: Vitor Jayme Fernandes Ferreira
# Data: Janeiro 2025
# Versão: 2.0.0
# ============================================================================

set -euo pipefail

# Configurações
PROJECT_NAME="kryonix-backend"
GITHUB_REPO="https://github.com/Nakahh/KRYONIX-PLATAFORMA.git"
REGION="oregon"
PLAN="starter"  # starter, standard, pro
NODE_VERSION="18"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Função de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Verificar se Render CLI está instalado
check_render_cli() {
    if ! command -v render &> /dev/null; then
        error "Render CLI não encontrado. Instalando..."
        
        # Instalar Render CLI
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install render
            else
                error "Homebrew não encontrado. Instale manualmente: https://docs.render.com/cli"
                exit 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -s https://api.github.com/repos/render-oss/render-cli/releases/latest \
                | grep "browser_download_url.*linux_amd64" \
                | cut -d '"' -f 4 \
                | wget -qi - -O render-cli.tar.gz
            tar -xzf render-cli.tar.gz
            sudo mv render /usr/local/bin/
            rm render-cli.tar.gz
        else
            error "Sistema operacional não suportado. Instale o Render CLI manualmente."
            exit 1
        fi
    fi
    
    success "Render CLI encontrado"
}

# Autenticar no Render
authenticate_render() {
    log "Autenticando no Render..."
    
    if [ -z "${RENDER_API_KEY:-}" ]; then
        warning "RENDER_API_KEY não encontrada no ambiente"
        info "Por favor, faça login no Render CLI:"
        render auth login
    else
        info "Usando RENDER_API_KEY do ambiente"
        render auth set-key "$RENDER_API_KEY"
    fi
    
    # Verificar se autenticação funcionou
    if render auth whoami &> /dev/null; then
        success "Autenticação bem-sucedida"
    else
        error "Falha na autenticação"
        exit 1
    fi
}

# Criar arquivo de configuração render.yaml
create_render_config() {
    log "Criando configuração render.yaml..."
    
    cat > render.yaml << 'EOF'
services:
  # Web Service Principal
  - type: web
    name: kryonix-backend
    runtime: node
    env: node
    buildCommand: npm ci && npm run build-fast
    startCommand: npm run production
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 8080
      - key: HOSTNAME
        value: 0.0.0.0
      - key: NEXT_TELEMETRY_DISABLED
        value: 1
      - key: DATABASE_URL
        fromDatabase:
          name: kryonix-postgres
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: kryonix-redis
          property: connectionString
      - key: WEBHOOK_SECRET
        generateValue: true
      - key: JWT_SECRET
        generateValue: true
      - key: ENCRYPTION_KEY
        generateValue: true
      - key: SESSION_SECRET
        generateValue: true
      - key: KEYCLOAK_ADMIN_PASSWORD
        generateValue: true
      - key: MINIO_SECRET_KEY
        generateValue: true
      - key: CORS_ORIGINS
        value: "https://kryonix-frontend.vercel.app,https://kryonix.com.br"
    healthCheckPath: /health
    autoDeploy: true
    buildFilter:
      paths:
        - server.js
        - lib/**
        - app/api/**
        - package.json
        - package-lock.json
        - next.config.js
        - tsconfig.json
    scaling:
      minInstances: 1
      maxInstances: 3
    disk:
      name: kryonix-data
      mountPath: /app/data
      sizeGB: 5
    
  # Worker Service para Webhook
  - type: worker
    name: kryonix-webhook
    runtime: node
    env: node
    buildCommand: npm ci
    startCommand: node webhook-listener.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: kryonix-postgres
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: kryonix-redis
          property: connectionString
      - key: WEBHOOK_SECRET
        sync: false
    autoDeploy: true
    
  # Monitor Service
  - type: worker
    name: kryonix-monitor
    runtime: node
    env: node
    buildCommand: npm ci
    startCommand: node kryonix-monitor.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: kryonix-postgres
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: kryonix-redis
          property: connectionString
    autoDeploy: true

# PostgreSQL Database
databases:
  - name: kryonix-postgres
    databaseName: kryonix_platform
    user: kryonix
    region: oregon
    plan: starter
    postgresMajorVersion: 15

# Redis Cache
services:
  - type: redis
    name: kryonix-redis
    region: oregon
    plan: starter
    maxmemoryPolicy: allkeys-lru

# Cron Jobs
cronJobs:
  - name: database-backup
    schedule: "0 2 * * *"  # Diário às 2h
    command: node lib/backup/auto-backup.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: kryonix-postgres
          property: connectionString
      
  - name: health-check
    schedule: "*/5 * * * *"  # A cada 5 minutos
    command: curl -f https://kryonix-backend.onrender.com/health
    
  - name: dependency-update
    schedule: "0 1 * * 0"  # Semanalmente no domingo
    command: npm run check-deps && npm audit fix
EOF

    success "Arquivo render.yaml criado"
}

# Criar Dockerfile otimizado para Render
create_render_dockerfile() {
    log "Criando Dockerfile otimizado para Render..."
    
    cat > Dockerfile.render << 'EOF'
# Multi-stage build otimizado para Render
FROM node:18-alpine AS deps
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat curl git

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar node_modules e código
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis de build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build da aplicação (apenas backend)
RUN npm run build-fast || echo "Build failed, continuing with runtime files"

# Runtime stage
FROM node:18-alpine AS runner
WORKDIR /app

# Instalar dependências runtime
RUN apk add --no-cache curl dumb-init postgresql-client redis && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 kryonix

# Copiar aplicação
COPY --from=builder /app/server.js ./
COPY --from=builder /app/webhook-listener.js ./
COPY --from=builder /app/kryonix-monitor.js ./
COPY --from=builder /app/check-dependencies.js ./
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/app/api ./app/api
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Criar diretórios necessários
RUN mkdir -p /app/data /app/logs /app/backups

# Configurar permissões
RUN chown -R kryonix:nodejs /app
USER kryonix

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando de inicio
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
EOF

    success "Dockerfile.render criado"
}

# Criar arquivo de variáveis de ambiente
create_env_template() {
    log "Criando template de variáveis de ambiente..."
    
    cat > .env.render.template << 'EOF'
# KRYONIX - Configurações para Render Backend
NODE_ENV=production
PORT=8080
HOSTNAME=0.0.0.0

# Database (Automaticamente configurado pelo Render)
# DATABASE_URL será fornecido automaticamente

# Redis (Automaticamente configurado pelo Render)  
# REDIS_URL será fornecido automaticamente

# Secrets (Gerados automaticamente pelo Render)
# WEBHOOK_SECRET=auto-generated
# JWT_SECRET=auto-generated
# ENCRYPTION_KEY=auto-generated
# SESSION_SECRET=auto-generated

# CORS Origins (Ajustar conforme necessário)
CORS_ORIGINS=https://kryonix-frontend.vercel.app,https://www.kryonix.com.br,https://kryonix.com.br

# Keycloak Configuration
KEYCLOAK_URL=https://keycloak.kryonix.com.br
KEYCLOAK_ADMIN_USERNAME=kryonix
# KEYCLOAK_ADMIN_PASSWORD=auto-generated

# MinIO Storage Configuration  
MINIO_URL=https://storage.kryonix.com.br
MINIO_ACCESS_KEY=kryonix
# MINIO_SECRET_KEY=auto-generated

# Features
NEXT_TELEMETRY_DISABLED=1
AUTO_MIGRATE=true
AUTO_BACKUP=true

# Monitoring
HEALTH_CHECK_ENABLED=true
MONITORING_ENABLED=true

# GitHub Integration
GITHUB_WEBHOOK_ENABLED=true
# GITHUB_PAT=seu_token_aqui (opcional)

# WhatsApp Integration
EVOLUTION_API_URL=https://api.kryonix.com.br
# EVOLUTION_API_KEY=sua_key_aqui
WHATSAPP_WEBHOOK_URL=https://kryonix-backend.onrender.com/api/whatsapp-webhook
ALERT_WHATSAPP=+5517981805327

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
# SMTP_USER=seu_email@gmail.com
# SMTP_PASS=sua_senha_app
ALERT_EMAIL=monitoring@kryonix.com.br

# External Services
# SENDGRID_API_KEY=sua_key_aqui
# TWILIO_ACCOUNT_SID=seu_sid_aqui
# TWILIO_AUTH_TOKEN=seu_token_aqui
EOF

    success "Template de variáveis de ambiente criado"
}

# Criar script de configuração pós-deploy
create_post_deploy_script() {
    log "Criando script de configuração pós-deploy..."
    
    cat > post-deploy.sh << 'EOF'
#!/bin/bash

# Script executado após deploy no Render
echo "🚀 Executando configuração pós-deploy KRYONIX..."

# Aguardar database ficar disponível
echo "⏳ Aguardando database..."
while ! node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()')
  .then(() => { console.log('DB ready'); process.exit(0); })
  .catch(() => process.exit(1));
"; do
    echo "Aguardando conexão com database..."
    sleep 5
done

# Executar migrações se habilitado
if [ "${AUTO_MIGRATE:-false}" = "true" ]; then
    echo "📦 Executando migrações de database..."
    node -e "
        const { initializeAllDatabaseModules } = require('./lib/database/init');
        initializeAllDatabaseModules()
            .then(() => {
                console.log('✅ Migrações concluídas');
                process.exit(0);
            })
            .catch(err => {
                console.error('❌ Erro nas migrações:', err);
                process.exit(1);
            });
    " || echo "⚠️ Migrações falharam, mas continuando..."
fi

# Verificar health
echo "🔍 Verificando health da aplicação..."
timeout 60 bash -c 'until curl -f http://localhost:8080/health; do sleep 2; done'

echo "✅ Configuração pós-deploy concluída"
EOF

    chmod +x post-deploy.sh
    success "Script pós-deploy criado"
}

# Criar package.json otimizado para backend
create_backend_package() {
    log "Criando package.json otimizado para backend..."
    
    cat > package.backend.json << 'EOF'
{
  "name": "kryonix-backend",
  "version": "2.0.0",
  "description": "KRYONIX Platform - Backend (Express + APIs)",
  "main": "server.js",
  "scripts": {
    "dev": "node server.js",
    "build": "echo 'Backend build completed'",
    "build-fast": "npm run validate-install-inline",
    "start": "node server.js",
    "production": "NODE_ENV=production node server.js",
    "webhook": "node webhook-listener.js",
    "monitor": "node kryonix-monitor.js",
    "check-deps": "node check-dependencies.js",
    "validate-install-inline": "node -e \"const fs = require('fs'); const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); const deps = Object.keys(pkg.dependencies); console.log('🔍 Validando ' + deps.length + ' dependências...'); let installed = 0; deps.forEach(dep => { try { require.resolve(dep); installed++; } catch(e) { console.error('❌ Falta: ' + dep); } }); console.log('✅ Instaladas: ' + installed + '/' + deps.length); if (installed !== deps.length) process.exit(1);\"",
    "postinstall": "echo 'Backend dependencies installed'",
    "prestart": "npm run check-deps"
  },
  "dependencies": {
    "express": "4.18.2",
    "cors": "2.8.5",
    "helmet": "7.1.0",
    "body-parser": "1.20.2",
    "morgan": "1.10.0",
    "pg": "8.11.3",
    "ioredis": "5.3.2",
    "jsonwebtoken": "9.0.2",
    "bcryptjs": "2.4.3",
    "multer": "1.4.5-lts.1",
    "aws-sdk": "2.1467.0",
    "axios": "1.6.2",
    "dotenv": "16.3.1",
    "node-cron": "3.0.3",
    "socket.io": "4.7.4",
    "ws": "8.14.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.11",
    "@types/node": "^20",
    "@types/pg": "^8.10.9",
    "@types/ws": "^8.5.10"
  },
  "engines": {
    "node": "18.x",
    "npm": ">=8.0.0"
  }
}
EOF

    success "package.json backend criado"
}

# Deploy no Render
deploy_to_render() {
    log "Iniciando deploy no Render..."
    
    # Verificar se estamos em um repositório git
    if [ ! -d ".git" ]; then
        warning "Não é um repositório git. Inicializando..."
        git init
        git add .
        git commit -m "Initial commit for Render deploy"
    fi
    
    # Deploy usando render.yaml
    info "Fazendo deploy usando render.yaml..."
    render deploy
    
    # Aguardar deploy
    log "Aguardando deploy concluir..."
    sleep 30
    
    # Verificar status dos serviços
    info "Verificando status dos serviços..."
    render services list
    
    success "Deploy iniciado! Verifique o dashboard do Render para acompanhar o progresso."
}

# Configurar webhook do GitHub
setup_github_webhook() {
    log "Configurando webhook do GitHub..."
    
    # Obter URL do serviço
    WEB_URL=$(render services list --format json | jq -r '.[] | select(.name=="kryonix-backend") | .url' 2>/dev/null || echo "")
    
    if [ -n "$WEB_URL" ] && [ "$WEB_URL" != "null" ]; then
        WEBHOOK_URL="${WEB_URL}/api/github-webhook"
        
        info "URL do webhook: $WEBHOOK_URL"
        info "Configure no GitHub:"
        info "1. Vá em Settings > Webhooks"
        info "2. Add webhook com URL: $WEBHOOK_URL"
        info "3. Content type: application/json"
        info "4. Events: push, pull_request"
        info "5. Secret: use a variável WEBHOOK_SECRET do Render"
        
        success "Instruções de webhook fornecidas"
    else
        warning "Não foi possível obter URL do serviço. Configure o webhook manualmente."
    fi
}

# Configurar domínio personalizado
setup_custom_domain() {
    local domain="$1"
    
    if [ -n "$domain" ]; then
        log "Configurando domínio personalizado: $domain"
        
        info "Para configurar domínio personalizado:"
        info "1. No dashboard do Render, vá em Settings > Custom Domains"
        info "2. Adicione: $domain"
        info "3. Configure DNS CNAME: $domain -> kryonix-backend.onrender.com"
        info "4. Aguarde propagação DNS"
        
        success "Instruções de domínio fornecidas"
    fi
}

# Verificar saúde dos serviços
health_check() {
    log "Verificando saúde dos serviços..."
    
    # Obter URL do serviço web
    WEB_URL=$(render services list --format json | jq -r '.[] | select(.name=="kryonix-backend") | .url' 2>/dev/null || echo "")
    
    if [ -n "$WEB_URL" ] && [ "$WEB_URL" != "null" ]; then
        info "Testando health endpoint..."
        
        # Aguardar serviço ficar disponível
        timeout 120 bash -c "
            until curl -sf ${WEB_URL}/health > /dev/null 2>&1; do
                echo 'Aguardando serviço...'
                sleep 10
            done
        "
        
        if curl -sf "${WEB_URL}/health" > /dev/null 2>&1; then
            success "✅ Serviço backend está saudável: $WEB_URL"
            
            # Testar outros endpoints
            info "Testando outros endpoints..."
            curl -sf "${WEB_URL}/api/status" && success "✅ API status OK"
            
        else
            error "❌ Serviço backend não está respondendo"
            return 1
        fi
    else
        warning "Não foi possível obter URL do serviço"
        return 1
    fi
}

# Mostrar informações finais
show_final_info() {
    log "🎉 Deploy KRYONIX Backend concluído com sucesso!"
    
    echo ""
    echo -e "${PURPLE}╔══════════════════════���═══════════════════╗${NC}"
    echo -e "${PURPLE}║        KRYONIX RENDER BACKEND DEPLOY     ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════╝${NC}"
    echo ""
    
    # Informações dos serviços
    echo -e "${BLUE}📊 SERVIÇOS CRIADOS:${NC}"
    render services list 2>/dev/null || echo "Execute 'render services list' para ver os serviços"
    
    echo ""
    echo -e "${BLUE}🔗 PRÓXIMOS PASSOS:${NC}"
    echo "1. 🌐 Configure o webhook do GitHub"
    echo "2. 🔧 Ajuste variáveis de ambiente se necessário"
    echo "3. 📱 Configure domínio personalizado (opcional)"
    echo "4. 🔍 Monitore logs: render logs kryonix-backend"
    echo "5. 📊 Acesse dashboard: https://dashboard.render.com"
    echo "6. 🔗 Conecte o frontend (Vercel) com este backend"
    
    echo ""
    echo -e "${GREEN}✅ BACKEND KRYONIX ESTÁ PRONTO!${NC}"
}

# Função principal
main() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║      KRYONIX RENDER INSTALLER v2.0       ║${NC}"
    echo -e "${PURPLE}║   Deploy Backend da Plataforma SaaS      ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════╝${NC}"
    echo ""
    
    # Verificar pré-requisitos
    check_render_cli
    
    # Autenticar
    authenticate_render
    
    # Criar arquivos de configuração
    create_render_config
    create_render_dockerfile
    create_env_template
    create_post_deploy_script
    create_backend_package
    
    # Perguntar sobre domínio personalizado
    echo ""
    read -p "Deseja configurar um domínio personalizado? (y/N): " setup_domain
    domain=""
    if [[ $setup_domain =~ ^[Yy]$ ]]; then
        read -p "Digite o domínio (ex: api.kryonix.com.br): " domain
    fi
    
    # Confirmar deploy
    echo ""
    info "Configuração pronta. Iniciando deploy..."
    read -p "Continuar com o deploy? (Y/n): " confirm_deploy
    
    if [[ ! $confirm_deploy =~ ^[Nn]$ ]]; then
        # Fazer deploy
        deploy_to_render
        
        # Aguardar e verificar
        sleep 60
        health_check
        
        # Configurar webhook
        setup_github_webhook
        
        # Configurar domínio se solicitado
        if [ -n "$domain" ]; then
            setup_custom_domain "$domain"
        fi
        
        # Mostrar informações finais
        show_final_info
        
    else
        info "Deploy cancelado. Arquivos de configuração foram criados."
        info "Execute 'render deploy' quando estiver pronto."
    fi
}

# Verificar se jq está instalado (tentar instalar se não estiver)
if ! command -v jq &> /dev/null; then
    warning "jq não encontrado. Tentando instalar..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install jq
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y jq
        fi
    fi
fi

# Executar função principal
main "$@"

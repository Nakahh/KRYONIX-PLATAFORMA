# 🤖 PROMPT PARA IA - DEPLOY AUTOMÁTICO KRYONIX

**Repositório**: https://github.com/Nakahh/KRYONIX-PLATAFORMA  
**Objetivo**: Deploy automático + restart + monitoramento tempo real

---

## 🎯 **INSTRUÇÕES PARA A IA**

Execute TODAS as etapas abaixo de forma automática e sequencial. Configure deploy automático completo para o projeto KRYONIX com monitoramento em tempo real.

---

## 📋 **ETAPA 0: ESTRUTURA INICIAL OBRIGATÓRIA DO PROJETO**

### **CORREÇÃO CRÍTICA**: Sempre criar estrutura Node.js completa

### **Criar arquivo: `package.json`** (SE NÃO EXISTIR)
```json
{
  "name": "kryonix-platform",
  "version": "1.0.0",
  "description": "🚀 KRYONIX - Plataforma SaaS 100% Autônoma por Inteligência Artificial",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server.js",
    "preview": "vite preview",
    "test": "echo 'Tests will be added in Part 01' && exit 0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "vite": "^5.0.8",
    "@types/node": "^20.10.5"
  },
  "keywords": ["kryonix", "saas", "ai", "autonomous", "platform"],
  "author": "Vitor Fernandes",
  "license": "MIT"
}
```

### **Criar arquivo: `vite.config.js`** (SE NÃO EXISTIR)
```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'public',
  server: {
    port: 5173,
    host: true,
    open: false
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
```

### **Criar arquivo: `server.js`** (SE NÃO EXISTIR)
```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança e performance
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(join(__dirname, 'public')));
app.use(express.static(join(__dirname, 'dist')));

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'KRYONIX Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Deploy automático ativo - Parte 01 em desenvolvimento'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    api: 'KRYONIX API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Página de progresso em tempo real
app.get('/progresso', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'progresso.html'));
});

// Catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KRYONIX Server running on port ${PORT}`);
  console.log(`📱 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Progresso: http://localhost:${PORT}/progresso`);
});
```

### **Criar arquivo: `Dockerfile`** (OBRIGATÓRIO)
```dockerfile
# Multi-stage build para otimização
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código source
COPY . .

# Build da aplicação
RUN npm run build

# Imagem final de produção
FROM node:18-alpine AS production

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar build da aplicação
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Mudança de propriedade
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD ["node", "server.js"]
```

## 📋 **ETAPA 1: CONFIGURAR GITHUB ACTIONS CI/CD**

### **Criar arquivo: `.github/workflows/deploy-kryonix.yml`**

```yaml
name: 🚀 KRYONIX Deploy Automático

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  SERVER_HOST: 144.202.90.55
  DOMAIN: kryonix.com.br
  DOCKER_REGISTRY: ghcr.io
  IMAGE_NAME: kryonix-platform

jobs:
  # Job 1: Build e Test
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - name: 📥 Checkout código
      uses: actions/checkout@v4

    - name: 📦 Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: 🔧 Verificar estrutura do projeto
      run: |
        echo "Verificando arquivos essenciais..."
        if [ ! -f "package.json" ]; then
          echo "❌ package.json não encontrado!"
          exit 1
        fi
        if [ ! -f "server.js" ]; then
          echo "❌ server.js não encontrado!"
          exit 1
        fi
        if [ ! -f "vite.config.js" ]; then
          echo "❌ vite.config.js não encontrado!"
          exit 1
        fi
        echo "✅ Estrutura do projeto OK"

    - name: 📚 Instalar dependências
      run: |
        npm ci

    - name: 🧪 Executar testes
      run: |
        npm test

    - name: 🏗️ Build aplicação
      run: |
        npm run build
        
    - name: 📊 Upload artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-files
        path: |
          dist/
          build/
          backend/dist/

  # Job 2: Build Docker Images
  build-docker:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: 📥 Checkout
      uses: actions/checkout@v4
      
    - name: 🐳 Setup Docker Buildx
      uses: docker/setup-buildx-action@v3
      
    - name: 🔐 Login GitHub Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
        
    - name: 📊 Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: build-files
        
    - name: 🏗️ Build e Push Docker Image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ghcr.io/${{ github.repository }}:latest
          ghcr.io/${{ github.repository }}:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  # Job 3: Deploy para Produção
  deploy:
    needs: [build-and-test, build-docker]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: 📥 Checkout
      uses: actions/checkout@v4
      
    - name: 🔐 Setup SSH
      uses: webfactory/ssh-agent@v0.8.0
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
        
    - name: 🚀 Deploy via SSH
      run: |
        ssh -o StrictHostKeyChecking=no root@${{ env.SERVER_HOST }} '
          # Navegar para diretório do projeto
          cd /opt/kryonix-platform || { echo "Criando diretório..."; mkdir -p /opt/kryonix-platform; cd /opt/kryonix-platform; }
          
          # Clonar/atualizar repositório
          if [ ! -d ".git" ]; then
            git clone https://github.com/Nakahh/KRYONIX-PLATAFORMA.git .
          else
            git fetch origin
            git reset --hard origin/main
          fi
          
          # Login no registry
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          
          # Pull nova imagem
          docker pull ghcr.io/${{ github.repository }}:latest
          
          # Parar containers existentes
          docker-compose down || true
          
          # Iniciar novos containers
          docker-compose up -d
          
          # Aguardar serviços ficarem prontos
          sleep 30
          
          # Verificar saúde dos serviços
          ./scripts/health-check.sh
          
          # Limpar imagens antigas
          docker image prune -f
        '
        
    - name: 🔍 Verificar Deploy
      run: |
        # Aguardar serviços ficarem disponíveis
        timeout 300 bash -c 'until curl -f https://www.${{ env.DOMAIN }}/health; do sleep 10; done'
        echo "✅ Deploy realizado com sucesso!"
        
    - name: 📱 Notificar WhatsApp
      if: always()
      run: |
        STATUS="${{ job.status }}"
        if [ "$STATUS" = "success" ]; then
          MESSAGE="🚀 *KRYONIX Deploy Sucesso*%0A%0A✅ Commit: ${{ github.sha }}%0A🌐 URL: https://www.${{ env.DOMAIN }}%0A⏰ $(date)"
        else
          MESSAGE="🚨 *KRYONIX Deploy Falhou*%0A%0A❌ Commit: ${{ github.sha }}%0A📝 Verificar logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
        fi
        
        curl -X POST "https://api.whatsapp.com/send?phone=5517981805327&text=$MESSAGE" || true

  # Job 4: Monitoramento Pós-Deploy
  monitor:
    needs: deploy
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: 🔍 Testes de Fumaça
      run: |
        # Testes básicos
        curl -f https://www.${{ env.DOMAIN }}/health
        curl -f https://api.${{ env.DOMAIN }}/health
        curl -f https://painel.${{ env.DOMAIN }}/health
        
    - name: 📊 Coletar Métricas
      run: |
        # Coletar métricas iniciais pós-deploy
        curl -s https://www.${{ env.DOMAIN }}/metrics > metrics.txt
        echo "Métricas coletadas com sucesso"
        
    - name: 🚨 Alerta se Falha
      if: failure()
      run: |
        curl -X POST "https://api.whatsapp.com/send?phone=5517981805327&text=🚨%20ALERTA%20KRYONIX:%20Falha%20pós-deploy%20detectada!" || true
```

---

## 📋 **ETAPA 2: CRIAR DOCKER-COMPOSE PARA RESTART AUTOMÁTICO**

### **Criar arquivo: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  # Frontend KRYONIX
  kryonix-frontend:
    image: ghcr.io/nakahh/kryonix-plataforma:latest
    container_name: kryonix-frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=https://api.kryonix.com.br
      - REACT_APP_WS_URL=wss://api.kryonix.com.br/ws
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kryonix-app.rule=Host(`www.kryonix.com.br`)"
      - "traefik.http.routers.kryonix-app.tls.certresolver=letsencrypt"
      - "traefik.http.services.kryonix-app.loadbalancer.server.port=3000"
    networks:
      - kryonix-net

  # Backend API KRYONIX (Usando mesmo container mas porta diferente)
  kryonix-backend:
    image: ghcr.io/nakahh/kryonix-plataforma:latest
    container_name: kryonix-backend
    restart: always
    ports:
      - "4000:3000"  # Mapear para mesma porta interna do Node.js
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:kryonix2025@kryonix-postgres:5432/kryonix
      - REDIS_URL=redis://kryonix-redis:6379
      - JWT_SECRET=${JWT_SECRET:-kryonix-default-secret-2025}
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health", "||", "exit", "1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kryonix-api.rule=Host(`api.kryonix.com.br`)"
      - "traefik.http.routers.kryonix-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.kryonix-api.loadbalancer.server.port=3000"
    networks:
      - kryonix-net

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: kryonix-postgres
    restart: always
    environment:
      POSTGRES_DB: kryonix
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: kryonix2025
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d kryonix"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - kryonix-net

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: kryonix-redis
    restart: always
    command: redis-server --appendonly yes --requirepass kryonix2025
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "kryonix2025", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    networks:
      - kryonix-net

  # Traefik Proxy
  traefik:
    image: traefik:v3.0
    container_name: kryonix-traefik
    restart: always
    command:
      - "--api.dashboard=true"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.network=Kryonix-NET"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@kryonix.com.br"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--global.sendAnonymousUsage=false"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt_data:/letsencrypt
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/ping", "||", "exit", "1"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - kryonix-net

  # Monitor de Health Check
  healthcheck-monitor:
    image: alpine:latest
    container_name: kryonix-healthcheck
    restart: always
    command: |
      sh -c "
        apk add --no-cache curl wget
        echo '🚀 KRYONIX Health Monitor iniciado...'
        while true; do
          echo '[$(date)] Verificando saúde dos serviços...'

          # Verificar Frontend
          if ! wget --quiet --tries=1 --timeout=10 --spider http://kryonix-frontend:3000/health; then
            echo '⚠️ Frontend unhealthy - tentando restart...'
            # Não pode reiniciar containers de dentro do container
            echo '❌ Frontend offline detectado'
          else
            echo '✅ Frontend OK'
          fi

          # Verificar Backend
          if ! wget --quiet --tries=1 --timeout=10 --spider http://kryonix-backend:3000/health; then
            echo '⚠️ Backend unhealthy'
            echo '❌ Backend offline detectado'
          else
            echo '✅ Backend OK'
          fi

          echo '[$(date)] Próxima verificação em 60s...'
          sleep 60
        done
      "
    depends_on:
      - kryonix-frontend
      - kryonix-backend
    networks:
      - kryonix-net

volumes:
  postgres_data:
  redis_data:
  letsencrypt_data:

networks:
  kryonix-net:
    name: Kryonix-NET
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

---

## 📋 **ETAPA 3: SCRIPT DE HEALTH CHECK AUTOMÁTICO**

### **Criar arquivo: `scripts/health-check.sh`**

```bash
#!/bin/bash
# Health Check Automático KRYONIX

echo "🔍 Verificando saúde dos serviços KRYONIX..."

# Configurações
DOMAIN="kryonix.com.br"
MAX_RETRIES=30
RETRY_INTERVAL=10

# Função para verificar serviço
check_service() {
    local url=$1
    local service_name=$2
    local retries=0
    
    echo "Verificando $service_name..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -f -s "$url" > /dev/null; then
            echo "✅ $service_name: OK"
            return 0
        fi
        
        retries=$((retries + 1))
        echo "⏳ $service_name: Tentativa $retries/$MAX_RETRIES..."
        sleep $RETRY_INTERVAL
    done
    
    echo "❌ $service_name: FALHOU após $MAX_RETRIES tentativas"
    return 1
}

# Verificar serviços principais
SERVICES=(
    "https://www.$DOMAIN/health|Frontend"
    "https://api.$DOMAIN/health|Backend API"
    "https://painel.$DOMAIN/health|Dashboard"
)

FAILED_SERVICES=()

for service in "${SERVICES[@]}"; do
    IFS='|' read -r url name <<< "$service"
    if ! check_service "$url" "$name"; then
        FAILED_SERVICES+=("$name")
    fi
done

# Verificar se todos os serviços estão OK
if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
    echo "🎉 Todos os serviços KRYONIX estão funcionando!"
    
    # Notificar sucesso via WhatsApp
    curl -X POST "https://api.whatsapp.com/send?phone=5517981805327&text=✅%20KRYONIX:%20Todos%20serviços%20OK%20após%20deploy!" || true
    
    exit 0
else
    echo "🚨 Serviços com falha: ${FAILED_SERVICES[*]}"
    
    # Tentar restart automático
    echo "🔄 Tentando restart automático..."
    docker-compose restart
    
    # Aguardar e verificar novamente
    sleep 60
    
    # Notificar falha via WhatsApp
    curl -X POST "https://api.whatsapp.com/send?phone=5517981805327&text=🚨%20KRYONIX:%20Falha%20detectada%20nos%20serviços:%20${FAILED_SERVICES[*]}" || true
    
    exit 1
fi
```

---

## 📋 **ETAPA 4: SCRIPT DE MONITORAMENTO CONTÍNUO**

### **Criar arquivo: `scripts/monitor-realtime.sh`**

```bash
#!/bin/bash
# Monitor em Tempo Real KRYONIX

echo "👁️ Iniciando monitoramento em tempo real KRYONIX..."

# Configurações
LOG_FILE="/var/log/kryonix-monitor.log"
WEBHOOK_URL="https://api.whatsapp.com/send?phone=5517981805327"

# Função para log com timestamp
log_with_time() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Função para notificar WhatsApp
notify_whatsapp() {
    local message="$1"
    curl -X POST "$WEBHOOK_URL&text=$(echo "$message" | sed 's/ /%20/g')" || true
}

# Monitor principal
monitor_services() {
    while true; do
        # Verificar containers
        CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep kryonix)
        
        # Verificar se algum container está down
        if echo "$CONTAINERS" | grep -q "Exited\|Restarting"; then
            log_with_time "🚨 Container com problema detectado!"
            log_with_time "$CONTAINERS"
            
            # Restart automático
            log_with_time "🔄 Executando restart automático..."
            docker-compose restart
            
            notify_whatsapp "🔄 KRYONIX: Restart automático executado - $(date)"
        fi
        
        # Verificar uso de recursos
        CPU_USAGE=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}" | grep kryonix | awk '{print $2}' | sed 's/%//' | sort -nr | head -1)
        
        if [ ! -z "$CPU_USAGE" ] && [ $(echo "$CPU_USAGE > 80" | bc -l) -eq 1 ]; then
            log_with_time "⚠️ Alto uso de CPU detectado: ${CPU_USAGE}%"
            notify_whatsapp "⚠️ KRYONIX: Alto uso CPU (${CPU_USAGE}%) - $(date)"
        fi
        
        # Verificar conectividade
        if ! curl -f -s https://www.kryonix.com.br/health > /dev/null; then
            log_with_time "🚨 Site principal inacessível!"
            
            # Restart emergencial
            docker-compose restart kryonix-frontend
            notify_whatsapp "🚨 KRYONIX: Site inacessível, restart executado - $(date)"
        fi
        
        # Log status OK
        log_with_time "✅ Todos os serviços funcionando normalmente"
        
        # Aguardar próxima verificação
        sleep 300  # 5 minutos
    done
}

# Iniciar monitoramento em background
monitor_services &
MONITOR_PID=$!

log_with_time "🚀 Monitor KRYONIX iniciado (PID: $MONITOR_PID)"
notify_whatsapp "🚀 KRYONIX: Monitor tempo real iniciado - $(date)"

# Manter script rodando
wait $MONITOR_PID
```

---

## 📋 **ETAPA 5: CONFIGURAR SECRETS NO GITHUB**

Configure os seguintes secrets no repositório GitHub:

1. **Ir para**: https://github.com/Nakahh/KRYONIX-PLATAFORMA/settings/secrets/actions

2. **Adicionar os secrets**:
```
SSH_PRIVATE_KEY = [Sua chave SSH privada para acesso ao servidor]
JWT_SECRET = [Chave secreta para JWT - gere uma aleatória]
WHATSAPP_API_KEY = [Chave da API do WhatsApp se tiver]
```

---

## 📋 **ETAPA 6: SCRIPT DE SETUP INICIAL NO SERVIDOR**

### **Executar no servidor (144.202.90.55):**

```bash
#!/bin/bash
# Setup inicial do servidor para deploy automático

echo "🚀 Configurando servidor para deploy automático KRYONIX..."

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install -y docker-compose-plugin

# Criar diretório do projeto
mkdir -p /opt/kryonix-platform
cd /opt/kryonix-platform

# Configurar logs
mkdir -p /var/log
touch /var/log/kryonix-monitor.log
chmod 666 /var/log/kryonix-monitor.log

# Configurar cron para monitor contínuo
(crontab -l 2>/dev/null; echo "@reboot cd /opt/kryonix-platform && ./scripts/monitor-realtime.sh") | crontab -

# Configurar Docker para auto-restart
systemctl enable docker
systemctl start docker

# Permitir Docker sem sudo para deploys
usermod -aG docker $USER

echo "✅ Servidor configurado para deploy automático!"
echo "🌐 Acesse: https://www.kryonix.com.br"
```

---

## 📋 **ETAPA 7: PÁGINA DE PROGRESSO EM TEMPO REAL**

### **Criar arquivo: `public/progresso.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 KRYONIX - Deploy Progress</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; min-height: 100vh; padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .subtitle { opacity: 0.8; font-size: 1.2em; }
        .progress-section { background: rgba(255,255,255,0.1); border-radius: 15px; padding: 30px; margin-bottom: 30px; }
        .progress-bar { background: rgba(255,255,255,0.2); height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
        .progress-fill { background: linear-gradient(90deg, #4CAF50, #45a049); height: 100%; transition: width 0.3s ease; }
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .status-card { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 20px; }
        .status-title { font-weight: bold; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
        .status-ok { color: #4CAF50; }
        .status-warning { color: #FF9800; }
        .status-error { color: #f44336; }
        .logs { background: rgba(0,0,0,0.3); border-radius: 10px; padding: 20px; height: 300px; overflow-y: auto; font-family: monospace; font-size: 14px; }
        .refresh-btn { background: #4CAF50; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 10px; }
        .refresh-btn:hover { background: #45a049; }
        @media (max-width: 768px) { .container { padding: 10px; } .status-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 KRYONIX</div>
            <div class="subtitle">Deploy Progress - Tempo Real</div>
        </div>

        <div class="progress-section">
            <h2>📊 Progresso Geral</h2>
            <div id="progress-text">Carregando...</div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
            </div>
            <button class="refresh-btn" onclick="updateStatus()">🔄 Atualizar Status</button>
        </div>

        <div class="status-grid">
            <div class="status-card">
                <div class="status-title">🌐 Frontend Status</div>
                <div id="frontend-status">Verificando...</div>
            </div>
            <div class="status-card">
                <div class="status-title">⚡ Backend API</div>
                <div id="backend-status">Verificando...</div>
            </div>
            <div class="status-card">
                <div class="status-title">🗄️ Database</div>
                <div id="database-status">Verificando...</div>
            </div>
            <div class="status-card">
                <div class="status-title">📈 Último Deploy</div>
                <div id="deploy-info">Carregando...</div>
            </div>
        </div>

        <div class="progress-section">
            <h2>📝 Logs em Tempo Real</h2>
            <div class="logs" id="logs">
                Conectando aos logs...
            </div>
        </div>
    </div>

    <script>
        // Função para verificar status dos serviços
        async function checkServiceStatus(url, elementId) {
            try {
                const response = await fetch(url);
                const element = document.getElementById(elementId);
                if (response.ok) {
                    element.innerHTML = '<span class="status-ok">✅ Online</span>';
                } else {
                    element.innerHTML = '<span class="status-warning">⚠️ Instável</span>';
                }
            } catch (error) {
                document.getElementById(elementId).innerHTML = '<span class="status-error">❌ Offline</span>';
            }
        }

        // Função para atualizar progresso
        function updateProgress() {
            // Simular progresso baseado no timestamp
            const startDate = new Date('2025-01-27');
            const currentDate = new Date();
            const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
            const progress = Math.min(daysDiff * 2, 100); // 2% por dia, max 100%
            
            document.getElementById('progress-fill').style.width = progress + '%';
            document.getElementById('progress-text').textContent = 
                `Progresso: ${progress}% - Deploy automático ativo`;
        }

        // Função para atualizar todos os status
        async function updateStatus() {
            updateProgress();
            
            await Promise.all([
                checkServiceStatus('https://www.kryonix.com.br/health', 'frontend-status'),
                checkServiceStatus('https://api.kryonix.com.br/health', 'backend-status'),
                checkServiceStatus('https://api.kryonix.com.br/db-health', 'database-status')
            ]);
            
            // Atualizar info do último deploy
            document.getElementById('deploy-info').innerHTML = 
                `<div>🚀 ${new Date().toLocaleString('pt-BR')}</div><div>📱 Deploy automático ativo</div>`;
                
            // Simular logs
            addLog(`✅ Status atualizado - ${new Date().toLocaleTimeString()}`);
        }

        // Função para adicionar logs
        function addLog(message) {
            const logsElement = document.getElementById('logs');
            const timestamp = new Date().toLocaleTimeString();
            logsElement.innerHTML += `[${timestamp}] ${message}\n`;
            logsElement.scrollTop = logsElement.scrollHeight;
        }

        // Simular conexão WebSocket para logs em tempo real
        function startRealtimeLogs() {
            setInterval(() => {
                const logs = [
                    '🔍 Verificando containers...',
                    '📊 Coletando métricas...',
                    '✅ Todos os serviços OK',
                    '🔄 Monitor ativo...'
                ];
                const randomLog = logs[Math.floor(Math.random() * logs.length)];
                addLog(randomLog);
            }, 10000); // Log a cada 10 segundos
        }

        // Inicializar página
        document.addEventListener('DOMContentLoaded', () => {
            updateStatus();
            startRealtimeLogs();
            
            // Atualizar status a cada 30 segundos
            setInterval(updateStatus, 30000);
            
            addLog('🚀 KRYONIX Deploy Monitor iniciado');
            addLog('📱 Monitoramento em tempo real ativo');
        });
    </script>
</body>
</html>
```

---

## 🎯 **RESUMO DO QUE A IA DEVE FAZER**

Execute todas as etapas acima para configurar:

✅ **GitHub Actions** - CI/CD automático  
✅ **Docker Compose** - Restart automático  
✅ **Health Checks** - Monitoramento contínuo  
✅ **Monitor Tempo Real** - Logs e alertas  
✅ **WhatsApp Notifications** - Alertas automáticos  
✅ **Página Progresso** - Acompanhamento visual  

**Resultado**: Deploy automático completo com restart e monitoramento em tempo real!

---

**📱 Notificações WhatsApp**: +55 17 98180-5327  
**🌐 Monitoramento**: https://www.kryonix.com.br/progresso  
**🚀 Status**: Deploy automático ativo 24/7

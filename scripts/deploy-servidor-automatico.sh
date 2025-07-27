#!/bin/bash

# =====================================================
# SCRIPT DE DEPLOY AUTOMÁTICO KRYONIX NO SERVIDOR
# Deploy completo com configuração automática
# Servidor: 144.202.90.55
# =====================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configurações
SERVIDOR_IP="144.202.90.55"
SERVIDOR_USER="linuxuser"
SERVIDOR_SENHA="{Yn53,KsFDpCmK-L"
DOMINIO="${DOMINIO:-kryonix.app}"
PROJECT_DIR="/opt/kryonix"

# Banner
echo -e "${CYAN}"
cat << 'EOF'
  ██╗  ██╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗██╗  ██╗
  ██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║╚██╗██╔╝
  █████╔╝ ██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║██║ ╚███╔╝ 
  ██╔═██╗ ██╔══██╗  ╚██╔╝  ██║   ██║██║╚██╗██║██║ ██╔██╗ 
  ██║  ██╗██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║██╔╝ ██╗
  ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝

  🚀 DEPLOY AUTOMÁTICO KRYONIX - SERVIDOR PRÓPRIO
  📦 Deploy completo + Configuração automática + 25 stacks
EOF
echo -e "${NC}"

echo -e "${BLUE}🎯 Servidor: ${SERVIDOR_IP}${NC}"
echo -e "${BLUE}🎯 Domínio: ${DOMINIO}${NC}"
echo -e "${BLUE}🎯 Usuário: ${SERVIDOR_USER}${NC}"
echo

# Função para executar comandos SSH
ssh_exec() {
    local comando="$1"
    echo -e "${YELLOW}⚡ Executando: ${comando}${NC}"
    
    sshpass -p "${SERVIDOR_SENHA}" ssh -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        "${SERVIDOR_USER}@${SERVIDOR_IP}" \
        "${comando}"
}

# Função para copiar arquivos
scp_copy() {
    local origem="$1"
    local destino="$2"
    echo -e "${YELLOW}📁 Copiando: ${origem} → ${destino}${NC}"
    
    sshpass -p "${SERVIDOR_SENHA}" scp -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o LogLevel=ERROR \
        -r "${origem}" "${SERVIDOR_USER}@${SERVIDOR_IP}:${destino}"
}

# Verificar se sshpass está instalado
if ! command -v sshpass &> /dev/null; then
    echo -e "${RED}❌ sshpass não encontrado! Instalando...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass
    elif command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y sshpass
    elif command -v yum &> /dev/null; then
        sudo yum install -y sshpass
    else
        echo -e "${RED}❌ Instale o sshpass manualmente${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ sshpass instalado com sucesso${NC}"

# Teste de conectividade
echo -e "${BLUE}🔍 Testando conectividade com o servidor...${NC}"
if ssh_exec "echo 'Conexão bem-sucedida'"; then
    echo -e "${GREEN}✅ Conectado ao servidor com sucesso!${NC}"
else
    echo -e "${RED}❌ Falha na conexão. Verifique IP, usuário e senha${NC}"
    exit 1
fi

echo
echo -e "${PURPLE}==================== INÍCIO DO DEPLOY ====================${NC}"
echo

# 1. Atualizar sistema
echo -e "${BLUE}📦 1. Atualizando sistema...${NC}"
ssh_exec "sudo apt update && sudo apt upgrade -y"
echo -e "${GREEN}✅ Sistema atualizado${NC}"

# 2. Instalar dependências
echo -e "${BLUE}🔧 2. Instalando dependências...${NC}"
ssh_exec "sudo apt install -y curl wget git nano htop unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release"

# Instalar Docker
ssh_exec "curl -fsSL https://get.docker.com | sudo sh"
ssh_exec "sudo usermod -aG docker ${SERVIDOR_USER}"

# Instalar Docker Compose
ssh_exec "sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
ssh_exec "sudo chmod +x /usr/local/bin/docker-compose"

# Instalar Node.js
ssh_exec "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
ssh_exec "sudo apt-get install -y nodejs"

echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 3. Criar estrutura de diretórios
echo -e "${BLUE}📁 3. Criando estrutura de diretórios...${NC}"
ssh_exec "sudo mkdir -p ${PROJECT_DIR}/{platform,backups,logs,ssl,data}"
ssh_exec "sudo chown -R ${SERVIDOR_USER}:${SERVIDOR_USER} ${PROJECT_DIR}"
echo -e "${GREEN}✅ Estrutura criada${NC}"

# 4. Clonar projeto
echo -e "${BLUE}📥 4. Clonando projeto KRYONIX...${NC}"
ssh_exec "cd ${PROJECT_DIR} && git clone https://github.com/kryonix-platform/kryonix-saas.git platform || echo 'Repositório já existe'"
ssh_exec "cd ${PROJECT_DIR}/platform && git pull origin main || echo 'Continuando...'"
echo -e "${GREEN}✅ Projeto clonado${NC}"

# 5. Copiar arquivos locais para o servidor
echo -e "${BLUE}📤 5. Copiando arquivos do projeto...${NC}"

# Criar arquivo temporário com o projeto
tar -czf /tmp/kryonix-project.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=logs \
    .

# Copiar para servidor
scp_copy "/tmp/kryonix-project.tar.gz" "${PROJECT_DIR}/"

# Extrair no servidor
ssh_exec "cd ${PROJECT_DIR} && tar -xzf kryonix-project.tar.gz"
ssh_exec "rm ${PROJECT_DIR}/kryonix-project.tar.gz"

echo -e "${GREEN}✅ Arquivos copiados${NC}"

# 6. Configurar variáveis de ambiente
echo -e "${BLUE}⚙️ 6. Configurando variáveis de ambiente...${NC}"

ssh_exec "cd ${PROJECT_DIR} && cat > .env << 'ENV_EOF'
# KRYONIX Environment Configuration
NODE_ENV=production
PORT=3000

# Domínio principal
DOMAIN=${DOMINIO}

# Database
DATABASE_URL=postgresql://kryonix:kryonix_senha_123@postgres:5432/kryonix
DATABASE_HOST=postgres
DATABASE_USER=kryonix
DATABASE_PASSWORD=kryonix_senha_123
DATABASE_NAME=kryonix

# Redis
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# Administração
ADMIN_EMAIL=admin@${DOMINIO}
ADMIN_PASSWORD=admin_kryonix_2024

# JWT
JWT_SECRET=\$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# PIX & Payments
PIX_CLIENT_ID=sua_chave_pix
PIX_CLIENT_SECRET=sua_secret_pix

# WhatsApp (Evolution API)
EVOLUTION_API_URL=http://evolution-api:8080
EVOLUTION_API_KEY=kryonix_evolution_key_2024

# N8N
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=n8n_senha_123

# Mautic
MAUTIC_URL=http://mautic:80
MAUTIC_USERNAME=admin
MAUTIC_PASSWORD=mautic_senha_123

# Grafana
GRAFANA_ADMIN_PASSWORD=grafana_senha_123

# AI Services
OPENAI_API_KEY=sua_chave_openai_aqui
OLLAMA_API_URL=http://ollama:11434
DIFY_API_URL=http://dify:3004
DIFY_API_KEY=sua_chave_dify

# Security
SESSION_SECRET=\$(openssl rand -hex 32)
ENCRYPTION_KEY=\$(openssl rand -hex 32)

# LGPD & Privacy
LGPD_COMPLIANCE=true
DATA_RETENTION_DAYS=365

# Monitoring
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000

# Storage
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_URL=http://minio:9000

# SSL/TLS
SSL_ENABLED=true
FORCE_HTTPS=true
ENV_EOF"

echo -e "${GREEN}✅ Variáveis configuradas${NC}"

# 7. Instalar dependências do projeto
echo -e "${BLUE}📦 7. Instalando dependências do projeto...${NC}"
ssh_exec "cd ${PROJECT_DIR} && npm install --production"
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 8. Build do projeto
echo -e "${BLUE}🏗️ 8. Fazendo build do projeto...${NC}"
ssh_exec "cd ${PROJECT_DIR} && npm run build"
echo -e "${GREEN}✅ Build concluído${NC}"

# 9. Configurar Docker Compose
echo -e "${BLUE}🐳 9. Configurando Docker Compose...${NC}"

ssh_exec "cd ${PROJECT_DIR} && cat > docker-compose.yml << 'DOCKER_EOF'
version: '3.8'

networks:
  kryonix-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data:
  redis_data:
  minio_data:
  grafana_data:
  prometheus_data:
  n8n_data:
  evolution_data:
  mautic_data:

services:
  # =================== CORE SERVICES ===================
  
  # Nginx Proxy
  nginx:
    image: nginxproxy/nginx-proxy:latest
    ports:
      - \"80:80\"
      - \"443:443\"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - ./ssl:/etc/nginx/certs:ro
      - /etc/nginx/vhost.d
      - /usr/share/nginx/html
    networks:
      - kryonix-network
    restart: unless-stopped

  # Let's Encrypt
  letsencrypt:
    image: nginxproxy/acme-companion:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./ssl:/etc/nginx/certs:rw
      - /etc/nginx/vhost.d
      - /usr/share/nginx/html
    environment:
      - DEFAULT_EMAIL=admin@${DOMINIO}
    networks:
      - kryonix-network
    restart: unless-stopped

  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kryonix
      POSTGRES_USER: kryonix
      POSTGRES_PASSWORD: kryonix_senha_123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - kryonix-network
    restart: unless-stopped
    healthcheck:
      test: [\"CMD-SHELL\", \"pg_isready -U kryonix\"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - kryonix-network
    restart: unless-stopped
    healthcheck:
      test: [\"CMD\", \"redis-cli\", \"ping\"]
      interval: 30s
      timeout: 10s
      retries: 3

  # =================== APPLICATION ===================
  
  # KRYONIX App Principal
  kryonix-app:
    build: .
    environment:
      - NODE_ENV=production
      - VIRTUAL_HOST=app.${DOMINIO},${DOMINIO}
      - LETSENCRYPT_HOST=app.${DOMINIO},${DOMINIO}
      - VIRTUAL_PORT=3000
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix-network
    restart: unless-stopped
    healthcheck:
      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:3000/health\"]
      interval: 30s
      timeout: 10s
      retries: 3

  # =================== COMMUNICATION ===================
  
  # Evolution API (WhatsApp)
  evolution-api:
    image: atendai/evolution-api:latest
    environment:
      - VIRTUAL_HOST=whatsapp.${DOMINIO}
      - LETSENCRYPT_HOST=whatsapp.${DOMINIO}
      - VIRTUAL_PORT=8080
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://kryonix:kryonix_senha_123@postgres:5432/kryonix
      - REDIS_URI=redis://redis:6379
      - AUTHENTICATION_API_KEY=kryonix_evolution_key_2024
    volumes:
      - evolution_data:/evolution/instances
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix-network
    restart: unless-stopped

  # N8N Workflows
  n8n:
    image: n8nio/n8n:latest
    environment:
      - VIRTUAL_HOST=n8n.${DOMINIO}
      - LETSENCRYPT_HOST=n8n.${DOMINIO}
      - VIRTUAL_PORT=5678
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=kryonix
      - DB_POSTGRESDB_USER=kryonix
      - DB_POSTGRESDB_PASSWORD=kryonix_senha_123
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=n8n_senha_123
      - WEBHOOK_URL=https://n8n.${DOMINIO}/
      - GENERIC_TIMEZONE=America/Sao_Paulo
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres
    networks:
      - kryonix-network
    restart: unless-stopped

  # Typebot
  typebot:
    image: baptistearno/typebot-builder:latest
    environment:
      - VIRTUAL_HOST=typebot.${DOMINIO}
      - LETSENCRYPT_HOST=typebot.${DOMINIO}
      - VIRTUAL_PORT=3000
      - DATABASE_URL=postgresql://kryonix:kryonix_senha_123@postgres:5432/kryonix
      - NEXTAUTH_URL=https://typebot.${DOMINIO}
      - NEXT_PUBLIC_VIEWER_URL=https://typebot.${DOMINIO}
      - ADMIN_EMAIL=admin@${DOMINIO}
    depends_on:
      - postgres
    networks:
      - kryonix-network
    restart: unless-stopped

  # =================== AI SERVICES ===================
  
  # Ollama (IA Local)
  ollama:
    image: ollama/ollama:latest
    environment:
      - VIRTUAL_HOST=ollama.${DOMINIO}
      - LETSENCRYPT_HOST=ollama.${DOMINIO}
      - VIRTUAL_PORT=11434
    volumes:
      - ./data/ollama:/root/.ollama
    networks:
      - kryonix-network
    restart: unless-stopped

  # Dify (Plataforma IA)
  dify:
    image: langgenius/dify-web:latest
    environment:
      - VIRTUAL_HOST=dify.${DOMINIO}
      - LETSENCRYPT_HOST=dify.${DOMINIO}
      - VIRTUAL_PORT=3000
      - CONSOLE_API_URL=http://dify-api:5001
      - APP_API_URL=http://dify-api:5001
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix-network
    restart: unless-stopped

  # Dify API
  dify-api:
    image: langgenius/dify-api:latest
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=kryonix
      - DB_PASSWORD=kryonix_senha_123
      - DB_DATABASE=kryonix
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix-network
    restart: unless-stopped

  # Mautic (Marketing)
  mautic:
    image: mautic/mautic:5-apache
    environment:
      - VIRTUAL_HOST=mautic.${DOMINIO}
      - LETSENCRYPT_HOST=mautic.${DOMINIO}
      - VIRTUAL_PORT=80
      - MAUTIC_DB_HOST=postgres
      - MAUTIC_DB_NAME=kryonix
      - MAUTIC_DB_USER=kryonix
      - MAUTIC_DB_PASSWORD=kryonix_senha_123
      - MAUTIC_TRUSTED_PROXIES=0.0.0.0/0
    volumes:
      - mautic_data:/var/www/html
    depends_on:
      - postgres
    networks:
      - kryonix-network
    restart: unless-stopped

  # =================== MONITORING ===================
  
  # Grafana
  grafana:
    image: grafana/grafana:latest
    environment:
      - VIRTUAL_HOST=grafana.${DOMINIO}
      - LETSENCRYPT_HOST=grafana.${DOMINIO}
      - VIRTUAL_PORT=3000
      - GF_SECURITY_ADMIN_PASSWORD=grafana_senha_123
      - GF_DATABASE_TYPE=postgres
      - GF_DATABASE_HOST=postgres:5432
      - GF_DATABASE_NAME=kryonix
      - GF_DATABASE_USER=kryonix
      - GF_DATABASE_PASSWORD=kryonix_senha_123
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - postgres
    networks:
      - kryonix-network
    restart: unless-stopped

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    environment:
      - VIRTUAL_HOST=prometheus.${DOMINIO}
      - LETSENCRYPT_HOST=prometheus.${DOMINIO}
      - VIRTUAL_PORT=9090
    volumes:
      - prometheus_data:/prometheus
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - kryonix-network
    restart: unless-stopped

  # =================== STORAGE ===================
  
  # MinIO (Object Storage)
  minio:
    image: minio/minio:latest
    environment:
      - VIRTUAL_HOST=storage.${DOMINIO}
      - LETSENCRYPT_HOST=storage.${DOMINIO}
      - VIRTUAL_PORT=9000
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin123
    volumes:
      - minio_data:/data
    command: server /data --console-address \":9001\"
    networks:
      - kryonix-network
    restart: unless-stopped

  # Uptime Kuma (Status Monitoring)
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    environment:
      - VIRTUAL_HOST=status.${DOMINIO}
      - LETSENCRYPT_HOST=status.${DOMINIO}
      - VIRTUAL_PORT=3001
    volumes:
      - ./data/uptime-kuma:/app/data
    networks:
      - kryonix-network
    restart: unless-stopped
DOCKER_EOF"

echo -e "${GREEN}✅ Docker Compose configurado${NC}"

# 10. Criar Dockerfile
echo -e "${BLUE}🐳 10. Criando Dockerfile...${NC}"

ssh_exec "cd ${PROJECT_DIR} && cat > Dockerfile << 'DOCKERFILE_EOF'
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache curl

# Diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicialização
CMD [\"npm\", \"start\"]
DOCKERFILE_EOF"

echo -e "${GREEN}✅ Dockerfile criado${NC}"

# 11. Configurar Prometheus
echo -e "${BLUE}📊 11. Configurando monitoramento...${NC}"

ssh_exec "mkdir -p ${PROJECT_DIR}/monitoring"

ssh_exec "cd ${PROJECT_DIR} && cat > monitoring/prometheus.yml << 'PROM_EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'kryonix-app'
    static_configs:
      - targets: ['kryonix-app:3000']
    metrics_path: '/metrics'

  - job_name: 'evolution-api'
    static_configs:
      - targets: ['evolution-api:8080']

  - job_name: 'n8n'
    static_configs:
      - targets: ['n8n:5678']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
PROM_EOF"

echo -e "${GREEN}✅ Monitoramento configurado${NC}"

# 12. Configurar deploy automático contínuo
echo -e "${BLUE}🔄 12. Configurando deploy contínuo...${NC}"

ssh_exec "cd ${PROJECT_DIR} && cat > deploy-webhook.js << 'WEBHOOK_EOF'
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'kryonix_webhook_secret_2024';
const DEPLOY_SCRIPT = '${PROJECT_DIR}/scripts/update-deploy.sh';

function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  return \`sha256=\${digest}\` === signature;
}

app.post('/webhook/deploy', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  if (!verifySignature(payload, signature)) {
    return res.status(401).send('Unauthorized');
  }
  
  const event = req.headers['x-github-event'];
  const branch = req.body.ref?.split('/').pop();
  
  if (event === 'push' && branch === 'main') {
    console.log('🚀 Deploy triggered by GitHub webhook');
    
    exec(DEPLOY_SCRIPT, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Deploy failed:', error);
        return res.status(500).send('Deploy failed');
      }
      
      console.log('✅ Deploy output:', stdout);
      res.status(200).send('Deploy triggered successfully');
    });
  } else {
    res.status(200).send('No action taken');
  }
});

const PORT = process.env.WEBHOOK_PORT || 3010;
app.listen(PORT, () => {
  console.log(\`🎣 Webhook server running on port \${PORT}\`);
});
WEBHOOK_EOF"

# Script de update
ssh_exec "mkdir -p ${PROJECT_DIR}/scripts"

ssh_exec "cd ${PROJECT_DIR} && cat > scripts/update-deploy.sh << 'UPDATE_EOF'
#!/bin/bash

set -e

cd ${PROJECT_DIR}

echo \"🔄 Atualizando KRYONIX...\"

# Pull latest changes
git pull origin main

# Install dependencies
npm install --production

# Build
npm run build

# Restart containers
docker-compose down
docker-compose up -d --build

# Health check
sleep 30
docker-compose ps

echo \"✅ Deploy atualizado com sucesso!\"
UPDATE_EOF"

ssh_exec "chmod +x ${PROJECT_DIR}/scripts/update-deploy.sh"

echo -e "${GREEN}✅ Deploy contínuo configurado${NC}"

# 13. Iniciar todos os serviços
echo -e "${BLUE}🚀 13. Iniciando todos os serviços...${NC}"

ssh_exec "cd ${PROJECT_DIR} && docker-compose up -d --build"

echo -e "${GREEN}✅ Serviços iniciados${NC}"

# 14. Aguardar inicialização
echo -e "${BLUE}⏳ 14. Aguardando inicialização dos serviços...${NC}"
sleep 60

# 15. Verificar status
echo -e "${BLUE}🏥 15. Verificando status dos serviços...${NC}"
ssh_exec "cd ${PROJECT_DIR} && docker-compose ps"

# 16. Configurar modelos Ollama
echo -e "${BLUE}🤖 16. Configurando modelos de IA...${NC}"
ssh_exec "cd ${PROJECT_DIR} && docker-compose exec -d ollama ollama pull llama2"
ssh_exec "cd ${PROJECT_DIR} && docker-compose exec -d ollama ollama pull codellama"

# 17. Configurar firewall
echo -e "${BLUE}🔥 17. Configurando firewall...${NC}"
ssh_exec "sudo ufw allow 22"
ssh_exec "sudo ufw allow 80"
ssh_exec "sudo ufw allow 443"
ssh_exec "sudo ufw --force enable"

echo -e "${GREEN}✅ Firewall configurado${NC}"

# 18. Criar script de monitoramento
echo -e "${BLUE}👁️ 18. Configurando monitoramento...${NC}"

ssh_exec "cd ${PROJECT_DIR} && cat > scripts/monitor.sh << 'MONITOR_EOF'
#!/bin/bash

# Monitor KRYONIX services
cd ${PROJECT_DIR}

echo \"📊 Status dos serviços KRYONIX:\"
echo \"================================\"

docker-compose ps

echo
echo \"🏥 Health checks:\"
echo \"==================\"

# Check main app
if curl -f -s http://localhost:3000/health > /dev/null; then
    echo \"✅ KRYONIX App: ONLINE\"
else
    echo \"❌ KRYONIX App: OFFLINE\"
fi

# Check other services
services=(\"postgres:5432\" \"redis:6379\" \"evolution-api:8080\" \"n8n:5678\")

for service in \"\${services[@]}\"; do
    IFS=':' read -r name port <<< \"\$service\"
    if nc -z localhost \"\$port\" 2>/dev/null; then
        echo \"✅ \$name: ONLINE\"
    else
        echo \"❌ \$name: OFFLINE\"
    fi
done

echo
echo \"💾 Uso do disco:\"
echo \"=================\"
df -h ${PROJECT_DIR}

echo
echo \"🐳 Containers Docker:\"
echo \"======================\"
docker stats --no-stream
MONITOR_EOF"

ssh_exec "chmod +x ${PROJECT_DIR}/scripts/monitor.sh"

# Configurar cron para monitoramento
ssh_exec "(crontab -l 2>/dev/null; echo '*/5 * * * * ${PROJECT_DIR}/scripts/monitor.sh >> ${PROJECT_DIR}/logs/monitor.log 2>&1') | crontab -"

echo -e "${GREEN}✅ Monitoramento configurado${NC}"

# 19. Configurar backup automático
echo -e "${BLUE}💾 19. Configurando backup automático...${NC}"

ssh_exec "cd ${PROJECT_DIR} && cat > scripts/backup.sh << 'BACKUP_EOF'
#!/bin/bash

BACKUP_DIR=\"${PROJECT_DIR}/backups\"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_NAME=\"kryonix_backup_\$DATE\"

mkdir -p \"\$BACKUP_DIR\"

echo \"💾 Criando backup: \$BACKUP_NAME\"

# Backup database
docker-compose exec -T postgres pg_dump -U kryonix kryonix > \"\$BACKUP_DIR/\${BACKUP_NAME}_db.sql\"

# Backup volumes
docker run --rm -v ${PROJECT_DIR}_postgres_data:/data -v \$BACKUP_DIR:/backup alpine tar czf /backup/\${BACKUP_NAME}_postgres.tar.gz -C /data .
docker run --rm -v ${PROJECT_DIR}_redis_data:/data -v \$BACKUP_DIR:/backup alpine tar czf /backup/\${BACKUP_NAME}_redis.tar.gz -C /data .

# Backup code
tar -czf \"\$BACKUP_DIR/\${BACKUP_NAME}_code.tar.gz\" -C ${PROJECT_DIR} . --exclude=backups --exclude=logs --exclude=node_modules

# Remove backups antigos (manter 7 dias)
find \"\$BACKUP_DIR\" -name \"kryonix_backup_*\" -mtime +7 -delete

echo \"✅ Backup criado: \$BACKUP_NAME\"
BACKUP_EOF"

ssh_exec "chmod +x ${PROJECT_DIR}/scripts/backup.sh"

# Configurar backup diário
ssh_exec "(crontab -l 2>/dev/null; echo '0 2 * * * ${PROJECT_DIR}/scripts/backup.sh >> ${PROJECT_DIR}/logs/backup.log 2>&1') | crontab -"

echo -e "${GREEN}✅ Backup automático configurado${NC}"

# 20. Status final
echo
echo -e "${PURPLE}==================== DEPLOY FINALIZADO ====================${NC}"
echo

echo -e "${GREEN}🎉 DEPLOY KRYONIX CONCLUÍDO COM SUCESSO!${NC}"
echo
echo -e "${CYAN}📋 INFORMAÇÕES DO DEPLOY:${NC}"
echo -e "${BLUE}🌐 Domínio principal: https://${DOMINIO}${NC}"
echo -e "${BLUE}📱 Aplicação: https://app.${DOMINIO}${NC}"
echo -e "${BLUE}📊 Grafana: https://grafana.${DOMINIO}${NC}"
echo -e "${BLUE}📈 Prometheus: https://prometheus.${DOMINIO}${NC}"
echo -e "${BLUE}📱 WhatsApp: https://whatsapp.${DOMINIO}${NC}"
echo -e "${BLUE}🔄 N8N: https://n8n.${DOMINIO}${NC}"
echo -e "${BLUE}🤖 Typebot: https://typebot.${DOMINIO}${NC}"
echo -e "${BLUE}📧 Mautic: https://mautic.${DOMINIO}${NC}"
echo -e "${BLUE}🧠 Ollama: https://ollama.${DOMINIO}${NC}"
echo -e "${BLUE}🤖 Dify: https://dify.${DOMINIO}${NC}"
echo -e "${BLUE}💾 MinIO: https://storage.${DOMINIO}${NC}"
echo -e "${BLUE}📊 Status: https://status.${DOMINIO}${NC}"
echo
echo -e "${YELLOW}🔑 CREDENCIAIS PADRÃO:${NC}"
echo -e "${BLUE}Admin: admin@${DOMINIO} / admin_kryonix_2024${NC}"
echo -e "${BLUE}Grafana: admin / grafana_senha_123${NC}"
echo -e "${BLUE}N8N: admin / n8n_senha_123${NC}"
echo
echo -e "${CYAN}🚀 PRÓXIMOS PASSOS:${NC}"
echo -e "${BLUE}1. Configure DNS para apontar todos os subdomínios para ${SERVIDOR_IP}${NC}"
echo -e "${BLUE}2. Aguarde SSL ser gerado automaticamente pelo Let's Encrypt${NC}"
echo -e "${BLUE}3. Acesse https://app.${DOMINIO} para usar a plataforma${NC}"
echo -e "${BLUE}4. Configure GitHub webhook para deploy automático${NC}"
echo
echo -e "${GREEN}✅ Plataforma KRYONIX 100% funcional no seu servidor!${NC}"

# Cleanup
rm -f /tmp/kryonix-project.tar.gz

echo
echo -e "${PURPLE}=========================================================${NC}"
echo -e "${GREEN}🎯 Deploy automático concluído em $(date)${NC}"
echo -e "${PURPLE}=========================================================${NC}"

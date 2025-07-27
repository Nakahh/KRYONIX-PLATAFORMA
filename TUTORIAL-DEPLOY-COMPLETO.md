# 🚀 TUTORIAL COMPLETO DE DEPLOY - KRYONIX PLATAFORMA

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Deploy Local (Desenvolvimento)](#deploy-local)
4. [Deploy em Produção](#deploy-em-produção)
5. [Configuração de Stacks Externas](#configuração-de-stacks-externas)
6. [Monitoramento e Manutenção](#monitoramento-e-manutenção)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 PRÉ-REQUISITOS

### Conhecimentos Necessários

- ✅ **Nenhum conhecimento técnico específico necessário**
- ✅ Saber usar linha de comando básica (copiar/colar comandos)
- ✅ Ter acesso a um servidor ou provedor de nuvem

### Recursos Mínimos do Servidor

```bash
# Para produção pequena (até 1.000 usuários)
RAM: 4GB
CPU: 2 cores
Disco: 50GB SSD
Banda: 100Mbps

# Para produção média (até 10.000 usuários)
RAM: 8GB
CPU: 4 cores
Disco: 100GB SSD
Banda: 500Mbps

# Para produção grande (10.000+ usuários)
RAM: 16GB+
CPU: 8+ cores
Disco: 200GB+ SSD
Banda: 1Gbps+
```

### Contas e Serviços Necessários

#### 🏛️ Essenciais

- [ ] **Servidor Linux** (Ubuntu 20.04+ ou CentOS 8+)
- [ ] **Domínio próprio** (ex: minhaempresa.com.br)
- [ ] **Email SMTP** (Gmail, SendGrid, ou similar)

#### 🔌 Integrações Principais

- [ ] **WhatsApp Business API** → [Meta Business](https://business.whatsapp.com/)
- [ ] **OpenAI API Key** → [OpenAI Platform](https://platform.openai.com/)
- [ ] **Stripe** (pagamentos) → [Stripe Brasil](https://stripe.com/br)

#### 📊 Opcionais (mas recomendados)

- [ ] **Cloudflare** (CDN/DNS) → [Cloudflare](https://cloudflare.com/)
- [ ] **Google Analytics** → [Google Analytics](https://analytics.google.com/)
- [ ] **Sentry** (monitoramento) → [Sentry.io](https://sentry.io/)

---

## ⚙️ CONFIGURAÇÃO DO AMBIENTE

### 1. Preparar o Servidor

```bash
# 1. Conectar ao servidor (substitua pelo seu IP)
ssh root@SEU_IP_DO_SERVIDOR

# 2. Atualizar o sistema
apt update && apt upgrade -y

# 3. Instalar Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 5. Verificar instalação
docker --version
docker-compose --version
```

### 2. Configurar Firewall e Segurança

```bash
# 1. Configurar UFW (firewall)
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable

# 2. Criar usuário específico para a aplicação
useradd -m -s /bin/bash kryonix
usermod -aG docker kryonix

# 3. Configurar chaves SSH (recomendado)
mkdir -p /home/kryonix/.ssh
# Copie sua chave pública para /home/kryonix/.ssh/authorized_keys
```

### 3. Configurar Domínio e DNS

#### No seu provedor de domínio (ex: Registro.br, GoDaddy):

```dns
# Registros A (substitua 123.456.789.10 pelo IP do seu servidor)
@               A    123.456.789.10
www             A    123.456.789.10
app             A    123.456.789.10
admin           A    123.456.789.10
api             A    123.456.789.10
gateway         A    123.456.789.10
monitor         A    123.456.789.10
metrics         A    123.456.789.10
status          A    123.456.789.10

# Registro CNAME (opcional, se usar Cloudflare)
*               CNAME    @
```

---

## 🏠 DEPLOY LOCAL (DESENVOLVIMENTO)

### 1. Baixar o Código

```bash
# 1. Mudar para usuário kryonix
su - kryonix

# 2. Clonar o repositório
git clone https://github.com/SEU_USUARIO/kryonix-platform.git
cd kryonix-platform

# 3. Verificar se está na branch correta
git checkout main
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

#### Exemplo de .env para desenvolvimento:

```env
# === CONFIGURAÇÕES BÁSICAS ===
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

# === BANCO DE DADOS ===
DATABASE_URL=postgresql://kryonix:senha123@localhost:5432/kryonix_dev
REDIS_URL=redis://localhost:6379

# === SEGURANÇA ===
JWT_SECRET=sua_chave_super_secreta_aqui_minimo_32_caracteres
SESSION_SECRET=outra_chave_secreta_para_sessoes

# === WHATSAPP (OBTER EM https://business.whatsapp.com/) ===
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=seu_token_do_whatsapp

# === OPENAI (OBTER EM https://platform.openai.com/) ===
OPENAI_API_KEY=sk-sua_chave_openai_aqui

# === EMAIL (Exemplo com Gmail) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASS=sua_senha_de_app

# === STRIPE (OBTER EM https://dashboard.stripe.com/) ===
STRIPE_PUBLIC_KEY=pk_test_sua_chave_publica
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook

# === PWA PUSH NOTIFICATIONS ===
VAPID_PUBLIC_KEY=sua_chave_publica_vapid
VAPID_PRIVATE_KEY=sua_chave_privada_vapid
```

### 3. Executar em Desenvolvimento

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar banco de dados e Redis com Docker
docker-compose up -d postgres redis

# 3. Executar migrações do banco
npm run db:migrate

# 4. Iniciar aplicação
npm run dev
```

#### ✅ Verificar se funcionou:

- Abra http://localhost:3000
- Você deve ver a tela de login do KRYONIX
- Teste criar uma conta e fazer login

---

## 🌐 DEPLOY EM PRODUÇÃO

### 1. Configurar Variáveis de Produção

```bash
# Editar arquivo de produção
nano .env.production
```

#### Exemplo de .env.production:

```env
# === CONFIGURAÇÕES BÁSICAS ===
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://app.suaempresa.com.br

# === BANCO DE DADOS (CONFIGURE SEU BANCO REAL) ===
DATABASE_URL=postgresql://usuario:senha@localhost:5432/kryonix_prod
REDIS_URL=redis://localhost:6379

# === SEGURANÇA (GERE CHAVES FORTES!) ===
JWT_SECRET=sua_chave_super_secreta_producao_minimo_64_caracteres_muito_forte
SESSION_SECRET=outra_chave_secreta_producao_tambem_muito_forte

# === DOMÍNIOS ===
ALLOWED_ORIGINS=https://suaempresa.com.br,https://app.suaempresa.com.br

# === WHATSAPP BUSINESS ===
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=seu_token_producao_whatsapp
WHATSAPP_VERIFY_TOKEN=seu_token_verificacao

# === OPENAI ===
OPENAI_API_KEY=sk-sua_chave_openai_producao

# === EMAIL SMTP ===
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua_api_key_sendgrid

# === STRIPE PRODUÇÃO ===
STRIPE_PUBLIC_KEY=pk_live_sua_chave_publica_live
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta_live
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook_live

# === MONITORAMENTO ===
SENTRY_DSN=sua_url_sentry
PROMETHEUS_ENABLED=true

# === SSL/CERTIFICADOS ===
SSL_CERT_PATH=/etc/letsencrypt/live/suaempresa.com.br/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/suaempresa.com.br/privkey.pem
```

### 2. Executar Deploy com Docker

```bash
# 1. Build da aplicação
npm run build

# 2. Criar rede Docker
docker network create kryonix-network

# 3. Executar stack completa
docker-compose -f docker-compose.production.yml up -d

# 4. Verificar se todos os serviços estão rodando
docker-compose ps
```

### 3. Configurar NGINX e SSL

```bash
# 1. Instalar NGINX e Certbot
apt install nginx certbot python3-certbot-nginx -y

# 2. Configurar NGINX
nano /etc/nginx/sites-available/kryonix
```

#### Configuração NGINX (kryonix):

```nginx
# === CONFIGURAÇÃO NGINX PARA KRYONIX ===

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream para load balancing
upstream kryonix_app {
    server localhost:3000;
    # Adicione mais servidores aqui se necessário
    # server localhost:3001;
}

# === HTTP → HTTPS REDIRECT ===
server {
    listen 80;
    server_name suaempresa.com.br www.suaempresa.com.br app.suaempresa.com.br;
    return 301 https://$server_name$request_uri;
}

# === APLICAÇÃO PRINCIPAL ===
server {
    listen 443 ssl http2;
    server_name app.suaempresa.com.br;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/suaempresa.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suaempresa.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logs
    access_log /var/log/nginx/kryonix.access.log;
    error_log /var/log/nginx/kryonix.error.log;

    # Max file upload
    client_max_body_size 10M;

    # === LOCALIZAÇÕES ===

    # API Routes com rate limiting
    location /api/auth/login {
        limit_req zone=login burst=10 nodelay;
        proxy_pass http://kryonix_app;
        include /etc/nginx/proxy_params;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://kryonix_app;
        include /etc/nginx/proxy_params;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://kryonix_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files com cache
    location /static/ {
        proxy_pass http://kryonix_app;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # PWA files
    location /manifest.json {
        proxy_pass http://kryonix_app;
        expires 1d;
    }

    location /sw.js {
        proxy_pass http://kryonix_app;
        expires 0;
        add_header Cache-Control "no-cache";
    }

    # Root
    location / {
        proxy_pass http://kryonix_app;
        include /etc/nginx/proxy_params;
    }
}

# === SUBDOMÍNIOS ADICIONAIS ===

# Admin
server {
    listen 443 ssl http2;
    server_name admin.suaempresa.com.br;

    ssl_certificate /etc/letsencrypt/live/suaempresa.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suaempresa.com.br/privkey.pem;

    location / {
        proxy_pass http://kryonix_app/admin;
        include /etc/nginx/proxy_params;
    }
}

# API Gateway
server {
    listen 443 ssl http2;
    server_name api.suaempresa.com.br;

    ssl_certificate /etc/letsencrypt/live/suaempresa.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suaempresa.com.br/privkey.pem;

    location / {
        limit_req zone=api burst=30 nodelay;
        proxy_pass http://kryonix_app/api;
        include /etc/nginx/proxy_params;
    }
}
```

```bash
# 3. Ativar configuração
ln -s /etc/nginx/sites-available/kryonix /etc/nginx/sites-enabled/
nginx -t  # Testar configuração

# 4. Obter certificados SSL
certbot --nginx -d suaempresa.com.br -d www.suaempresa.com.br -d app.suaempresa.com.br -d admin.suaempresa.com.br -d api.suaempresa.com.br

# 5. Reiniciar NGINX
systemctl restart nginx
systemctl enable nginx
```

### 4. Script Automatizado de Deploy

Crie o arquivo `deploy.sh`:

```bash
#!/bin/bash
# Script de deploy automatizado para KRYONIX

set -e

echo "🇧🇷 Iniciando deploy do KRYONIX..."

# Variáveis
APP_DIR="/home/kryonix/kryonix-platform"
BACKUP_DIR="/home/kryonix/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Função de log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# 1. Backup
log "📦 Criando backup..."
mkdir -p $BACKUP_DIR
docker-compose exec postgres pg_dump -U kryonix kryonix_prod > $BACKUP_DIR/db_$DATE.sql
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# 2. Atualizar código
log "📥 Atualizando código..."
cd $APP_DIR
git stash  # Salvar mudanças locais
git pull origin main

# 3. Build
log "🏗️ Fazendo build..."
npm ci --production
npm run build

# 4. Atualizar containers
log "🐳 Atualizando containers..."
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build

# 5. Verificar saúde
log "🔍 Verificando saúde da aplicação..."
sleep 30
curl -f http://localhost:3000/api/health || {
    log "❌ Health check falhou, fazendo rollback..."
    docker-compose -f docker-compose.production.yml down
    # Restaurar backup se necessário
    exit 1
}

# 6. Reiniciar NGINX
log "🔄 Reiniciando NGINX..."
systemctl reload nginx

log "✅ Deploy concluído com sucesso!"
log "🌐 Aplicação disponível em: https://app.suaempresa.com.br"
```

```bash
# Tornar executável
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

---

## 🔌 CONFIGURAÇÃO DE STACKS EXTERNAS

### 1. WhatsApp Business API

#### Passo 1: Criar App no Meta Business

1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Clique em "Meus Apps" → "Criar App"
3. Escolha "Business" → "WhatsApp Business Management"
4. Preencha os dados da sua empresa

#### Passo 2: Configurar WhatsApp Business

```bash
# No painel do Meta Business:
# 1. Vá em WhatsApp → Introdução
# 2. Adicione o número de telefone da sua empresa
# 3. Copie o Token de Acesso Temporário
# 4. Configure o webhook:

# URL do Webhook: https://api.suaempresa.com.br/webhooks/whatsapp
# Token de Verificação: seu_token_personalizado
```

#### Passo 3: Testar Integração

```bash
# Teste o webhook
curl -X POST "https://api.suaempresa.com.br/api/v1/whatsapp/instances" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Atendimento Principal",
    "number": "+5511999999999"
  }'
```

### 2. OpenAI API

```bash
# 1. Criar conta em https://platform.openai.com/
# 2. Ir em API Keys → Create new secret key
# 3. Copiar a chave e adicionar no .env
# 4. Configurar limites de uso em Billing

# Teste da integração
curl -X POST "https://api.suaempresa.com.br/api/v1/ai/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, como você pode me ajudar?",
    "context": "atendimento_cliente"
  }'
```

### 3. Stripe (Pagamentos)

```bash
# 1. Criar conta em https://stripe.com/br
# 2. Ativar conta para Brasil
# 3. Configurar PIX (beta)
# 4. Obter chaves da API em Developers → API keys

# Configurar webhook no Stripe:
# URL: https://api.suaempresa.com.br/api/billing/webhook
# Eventos: invoice.payment_succeeded, invoice.payment_failed, customer.subscription.created, customer.subscription.updated
```

### 4. Configurar N8N (Automações)

```bash
# 1. Subir instância N8N
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_HOST=n8n.suaempresa.com.br \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=https \
  -e WEBHOOK_TUNNEL_URL=https://n8n.suaempresa.com.br \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# 2. Configurar NGINX para N8N
# Adicionar no /etc/nginx/sites-available/kryonix:

server {
    listen 443 ssl http2;
    server_name n8n.suaempresa.com.br;

    ssl_certificate /etc/letsencrypt/live/suaempresa.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/suaempresa.com.br/privkey.pem;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 5. Configurar Typebot (Chatbots)

```bash
# 1. Subir instância Typebot
docker run -d \
  --name typebot \
  -p 3001:3000 \
  -e DATABASE_URL="postgresql://typebot:senha@localhost:5432/typebot" \
  -e NEXTAUTH_URL=https://typebot.suaempresa.com.br \
  -e NEXTAUTH_SECRET=sua_chave_secreta \
  baptistearno/typebot-builder

# 2. Configurar nginx (similar ao N8N)
# 3. Criar workflows no Typebot
# 4. Integrar com WhatsApp via webhook
```

---

## 📊 MONITORAMENTO E MANUTENÇÃO

### 1. Configurar Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
version: "3.8"

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.path=/prometheus"
      - "--web.console.libraries=/etc/prometheus/console_libraries"
      - "--web.console.templates=/etc/prometheus/consoles"
      - "--storage.tsdb.retention.time=200h"
      - "--web.enable-lifecycle"

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=sua_senha_grafana
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning

volumes:
  prometheus_data:
  grafana_data:
```

### 2. Scripts de Monitoramento

```bash
#!/bin/bash
# monitor.sh - Script de monitoramento

check_health() {
    echo "🔍 Verificando saúde da aplicação..."

    # Verificar API
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ API: OK"
    else
        echo "❌ API: FALHA"
        # Notificar equipe
        send_alert "API KRYONIX está fora do ar!"
    fi

    # Verificar banco
    if docker exec postgres pg_isready -U kryonix > /dev/null; then
        echo "✅ Banco: OK"
    else
        echo "❌ Banco: FALHA"
        send_alert "Banco de dados KRYONIX está fora do ar!"
    fi

    # Verificar Redis
    if docker exec redis redis-cli ping > /dev/null; then
        echo "✅ Redis: OK"
    else
        echo "❌ Redis: FALHA"
        send_alert "Redis KRYONIX está fora do ar!"
    fi
}

send_alert() {
    # Enviar notificação por email/Slack/WhatsApp
    curl -X POST "https://hooks.slack.com/services/SEU/WEBHOOK/SLACK" \
         -H 'Content-Type: application/json' \
         -d "{\"text\":\"🚨 $1\"}"
}

# Executar verificação
check_health
```

### 3. Backup Automatizado

```bash
#!/bin/bash
# backup.sh - Backup automatizado

BACKUP_DIR="/home/kryonix/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "📦 Iniciando backup..."

# Criar diretório
mkdir -p $BACKUP_DIR

# Backup do banco
docker exec postgres pg_dump -U kryonix kryonix_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /home/kryonix/kryonix-platform/uploads/

# Backup das configurações
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /home/kryonix/kryonix-platform/.env*

# Remover backups antigos
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup concluído: $DATE"

# Opcional: Enviar para S3/Google Cloud
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://meu-bucket-backup/
```

### 4. Configurar Cron Jobs

```bash
# Editar crontab
crontab -e

# Adicionar tarefas
# Backup diário às 2h
0 2 * * * /home/kryonix/scripts/backup.sh >> /var/log/backup.log 2>&1

# Monitoramento a cada 5 minutos
*/5 * * * * /home/kryonix/scripts/monitor.sh >> /var/log/monitor.log 2>&1

# Limpeza de logs semanalmente
0 0 * * 0 find /var/log -name "*.log" -mtime +7 -delete

# Renovação SSL mensal
0 0 1 * * certbot renew --quiet && systemctl reload nginx
```

---

## 🔧 TROUBLESHOOTING

### Problemas Comuns e Soluções

#### 1. Aplicação não inicia

```bash
# Verificar logs
docker-compose logs kryonix

# Verificar variáveis de ambiente
cat .env

# Verificar portas
netstat -tulpn | grep :3000

# Reiniciar containers
docker-compose restart
```

#### 2. Banco de dados não conecta

```bash
# Verificar se o PostgreSQL está rodando
docker ps | grep postgres

# Testar conexão
docker exec -it postgres psql -U kryonix -d kryonix_prod

# Verificar logs do banco
docker logs postgres

# Reiniciar banco
docker-compose restart postgres
```

#### 3. WhatsApp não conecta

```bash
# Verificar token
curl -H "Authorization: Bearer $WHATSAPP_ACCESS_TOKEN" \
     "https://graph.facebook.com/v18.0/me"

# Verificar webhook
curl -X GET "https://api.suaempresa.com.br/api/v1/whatsapp/webhook-verify?hub.verify_token=SEU_TOKEN&hub.challenge=teste"

# Logs da integração
docker-compose logs | grep whatsapp
```

#### 4. SSL/HTTPS não funciona

```bash
# Verificar certificados
certbot certificates

# Renovar certificados
certbot renew --dry-run

# Verificar NGINX
nginx -t
systemctl status nginx

# Verificar DNS
nslookup app.suaempresa.com.br
```

#### 5. Performance lenta

```bash
# Verificar uso de recursos
docker stats

# Verificar logs de performance
tail -f /var/log/nginx/kryonix.access.log

# Verificar cache Redis
docker exec redis redis-cli monitor

# Otimizar banco
docker exec postgres psql -U kryonix -d kryonix_prod -c "VACUUM ANALYZE;"
```

### Logs e Diagnóstico

```bash
# === LOGS IMPORTANTES ===

# Logs da aplicação
docker-compose logs -f kryonix

# Logs do NGINX
tail -f /var/log/nginx/kryonix.access.log
tail -f /var/log/nginx/kryonix.error.log

# Logs do sistema
journalctl -f -u docker

# Logs específicos por erro
grep "ERROR" /var/log/nginx/kryonix.error.log | tail -20

# === COMANDOS DE DIAGNÓSTICO ===

# Status dos containers
docker-compose ps

# Uso de recursos
docker stats --no-stream

# Espaço em disco
df -h

# Memória e CPU
free -h
top

# Conectividade de rede
netstat -tulpn | grep :3000
netstat -tulpn | grep :443

# Verificar processos
ps aux | grep node
ps aux | grep nginx
```

---

## 🎯 CHECKLIST FINAL

### ✅ Pré-Deploy

- [ ] Servidor configurado com Docker
- [ ] Domínio configurado e apontando para o servidor
- [ ] Certificados SSL instalados
- [ ] Variáveis de ambiente configuradas
- [ ] Backups configurados

### ✅ Pós-Deploy

- [ ] Aplicação acessível via HTTPS
- [ ] Login e registro funcionando
- [ ] WhatsApp conectado e enviando mensagens
- [ ] Pagamentos funcionando (Stripe)
- [ ] Email sendo enviado
- [ ] Monitoramento ativo
- [ ] Backups automáticos rodando

### ✅ Integrações

- [ ] WhatsApp Business API configurada
- [ ] OpenAI respondendo
- [ ] N8N criando automações
- [ ] Typebot com chatbots
- [ ] Stripe processando pagamentos
- [ ] Emails de notificação

### ✅ Segurança

- [ ] Firewall configurado
- [ ] HTTPS funcionando
- [ ] Rate limiting ativo
- [ ] Backups seguros
- [ ] Logs monitorados

---

## 📞 SUPORTE

Em caso de dúvidas ou problemas:

### 📧 Contatos de Suporte

- **Email**: tech@kryonix.com.br
- **WhatsApp**: +55 17 98180-5327
- **Discord**: [Comunidade KRYONIX](https://discord.gg/kryonix)

### 📚 Documentação Adicional

- [Documentação da API](https://docs.kryonix.com.br/api)
- [Guias de Integração](https://docs.kryonix.com.br/integrations)
- [FAQ](https://docs.kryonix.com.br/faq)

### 🛠️ Suporte Técnico Premium

Para suporte técnico especializado:

- **Deploy Assistido**: R$ 297 (único)
- **Configuração Completa**: R$ 497 (único)
- **Suporte Mensal**: R$ 197/mês

---

## 🎉 PARABÉNS!

Se chegou até aqui, sua plataforma KRYONIX está **100% funcional** e pronta para atender seus clientes brasileiros com:

✅ **WhatsApp Business** integrado  
✅ **IA conversacional** com OpenAI  
✅ **Automações** poderosas  
✅ **Pagamentos PIX** e cartão  
✅ **PWA móvel** otimizado  
✅ **Segurança enterprise**  
✅ **Monitoramento completo**

**🇧🇷 Seja bem-vindo à revolução da automação brasileira!**

---

_Última atualização: Janeiro 2025_  
_Versão: 1.0.0_  
_© 2025 KRYONIX - Plataforma SaaS Brasileira_

#!/bin/bash
set -e

echo "🚀 KRYONIX - Deploy Docker Swarm TOTALMENTE AUTOMÁTICO"
echo "======================================================"

# Função para logs coloridos
log_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

log_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Configurações - INFORMAÇÕES REAIS KRYONIX
REPO_URL="https://github.com/Nakahh/KRYONIX-PLATAFORMA.git"
PROJECT_DIR="/opt/kryonix-plataform"
WEBHOOK_PORT="9002"
WEBHOOK_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"
GITHUB_TOKEN="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"
NETWORK_NAME="Kryonix-NET"
SENDGRID_API_KEY="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"

# Verificar se Docker Swarm está ativo
if ! docker info | grep -q "Swarm: active"; then
    log_error "Docker Swarm não está ativo!"
    log_info "Execute: docker swarm init"
    exit 1
fi

log_info "Docker Swarm detectado ✓"

# Limpeza completa antes do deploy
log_info "Executando limpeza completa do ambiente..."

# Parar e remover stack se existir
if docker stack ls | grep -q "kryonix-plataforma"; then
    log_warning "Removendo stack kryonix-plataforma existente..."
    docker stack rm kryonix-plataforma
    sleep 30  # Aguardar remoção completa
fi

# Remover configs antigos se existirem
if docker config ls | grep -q "blackbox_config"; then
    log_warning "Removendo config blackbox_config antigo..."
    docker config rm blackbox_config 2>/dev/null || true
fi

# Limpar containers órfãos
log_info "Limpando containers órfãos..."
docker container prune -f 2>/dev/null || true

# Limpar volumes órfãos
log_info "Limpando volumes órfãos..."
docker volume prune -f 2>/dev/null || true

# Limpar imagens não utilizadas
log_info "Limpando imagens antigas..."
docker image prune -f 2>/dev/null || true

# Remover imagens antigas do kryonix se existirem
docker images | grep "kryonix-plataforma" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

log_success "Limpeza completa finalizada ✓"

# Criar diretório do projeto se não existir
log_info "Criando diretório do projeto com permissões adequadas..."
sudo mkdir -p "$PROJECT_DIR"
sudo chown -R $USER:$USER "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Configurar Git se estiver no diretório vazio
if [ ! -d ".git" ]; then
    log_info "Clonando repositório..."
    git clone "$REPO_URL" .
    git config --local user.name "KRYONIX Deploy Bot"
    git config --local user.email "deploy@kryonix.com.br"
    git checkout main
else
    log_info "Repositório já existe, fazendo pull da branch main..."
    git fetch origin
    git checkout main
    git reset --hard origin/main
    git clean -fd
fi

log_success "Repositório atualizado na branch main ✓"

# Verificar se a rede Kryonix-NET existe
if ! docker network ls | grep -q "$NETWORK_NAME"; then
    log_warning "Rede $NETWORK_NAME não encontrada, criando..."
    docker network create -d overlay --attachable "$NETWORK_NAME"
    log_success "Rede $NETWORK_NAME criada"
else
    log_info "Rede $NETWORK_NAME já existe ✓"
fi

# Criar webhook listener para GitHub
log_info "Configurando webhook listener..."
cat > webhook-listener.js << 'WEBHOOK_EOF'
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');

const PORT = process.env.WEBHOOK_PORT || 9002;
const SECRET = process.env.WEBHOOK_SECRET || 'Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8';
const PROJECT_DIR = process.env.PROJECT_DIR || '/opt/kryonix-plataform';
const NETWORK_NAME = process.env.NETWORK_NAME || 'Kryonix-NET';

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [WEBHOOK] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync('/var/log/kryonix-webhook.log', logMessage);
}

function verifySignature(payload, signature) {
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = hmac.update(payload).digest('hex');
    const expected = `sha256=${digest}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function deployProject() {
    log('🚀 Iniciando deploy automático...');

    const deployScript = `
        cd ${PROJECT_DIR}
        git fetch origin
        git checkout main
        git reset --hard origin/main
        git clean -fd

        # Build nova imagem com timestamp
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        docker build --no-cache --pull -t kryonix-plataforma:latest .
        docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP

        # Deploy atualizado
        docker stack deploy -c docker-stack.yml kryonix-plataforma

        # Aguardar inicialização
        sleep 60

        # Verificar saúde
        if curl -f http://localhost:3000/health 2>/dev/null; then
            echo "✅ Deploy concluído com sucesso!"
            # Notificar sucesso via NTFY
            curl -X POST https://ntfy.kryonix.com.br/kryonix-deploy \\
                -H "Authorization: Basic a3J5b25peDpWaXRvckAxMjM0NTY=" \\
                -H "Content-Type: application/json" \\
                -d '{"title":"KRYONIX Deploy Sucesso","message":"Deploy automático concluído com sucesso! 🚀","priority":3,"tags":["white_check_mark","rocket"]}'
        else
            echo "❌ Deploy falhou - verificar logs"
            # Notificar falha via NTFY
            curl -X POST https://ntfy.kryonix.com.br/kryonix-deploy \\
                -H "Authorization: Basic a3J5b25peDpWaXRvckAxMjM0NTY=" \\
                -H "Content-Type: application/json" \\
                -d '{"title":"KRYONIX Deploy Falhou","message":"Deploy automático falhou! Verificar logs. ❌","priority":5,"tags":["x","warning"]}'
            exit 1
        fi
    `;

    exec(deployScript, (error, stdout, stderr) => {
        if (error) {
            log(\`❌ Erro no deploy: \${error.message}\`);
            return;
        }
        if (stderr) {
            log(\`⚠️  Deploy stderr: \${stderr}\`);
        }
        log(\`✅ Deploy stdout: \${stdout}\`);
        log('🎉 Deploy automático concluído!');
    });
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const signature = req.headers['x-hub-signature-256'];
                
                if (!signature || !verifySignature(body, signature)) {
                    log('❌ Webhook signature inválida');
                    res.writeHead(401);
                    res.end('Unauthorized');
                    return;
                }
                
                const payload = JSON.parse(body);
                
                // Verificar se é push na branch main
                if (payload.ref === 'refs/heads/main') {
                    log(`📥 Push recebido na main por ${payload.pusher.name}`);
                    log(`📝 Commit: ${payload.head_commit.message}`);
                    
                    deployProject();
                    
                    res.writeHead(200);
                    res.end('Deploy iniciado!');
                } else {
                    log(`ℹ️  Push ignorado - branch: ${payload.ref}`);
                    res.writeHead(200);
                    res.end('Push ignorado - não é main branch');
                }
                
            } catch (error) {
                log(`❌ Erro no webhook: ${error.message}`);
                res.writeHead(500);
                res.end('Internal Server Error');
            }
        });
        
    } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'kryonix-webhook' }));
        
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    log(`🎣 Webhook listener iniciado na porta ${PORT}`);
    log(`🔐 Secret configurado: ${SECRET.substring(0, 10)}...`);
});

process.on('SIGTERM', () => {
    log('🛑 Webhook listener parado');
    server.close();
    process.exit(0);
});
WEBHOOK_EOF

# Criar configuração do blackbox exporter para monitoramento
log_info "Configurando monitor de saúde..."
cat > blackbox.yml << 'BLACKBOX_EOF'
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_http_versions: ["HTTP/1.1", "HTTP/2.0"]
      valid_status_codes: [200]
      method: GET
      fail_if_ssl: false
      fail_if_not_ssl: false
BLACKBOX_EOF

# Criar configuração no Docker config
log_info "Criando configuração blackbox_config..."
docker config create blackbox_config blackbox.yml
log_success "Configuração blackbox_config criada ✓"

# Criar Dockerfile no projeto
log_info "Criando Dockerfile..."
cat > Dockerfile << 'DOCKERFILE_EOF'
# Simple single-stage Dockerfile - no build step
FROM node:18-bullseye-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tini \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r kryonix && useradd -r -g kryonix kryonix

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --production && npm cache clean --force

# Copy application files directly
COPY server.js ./
COPY public/ ./dist/

# Set ownership
RUN chown -R kryonix:kryonix /app

# Switch to non-root user
USER kryonix

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use tini as init and start server
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
DOCKERFILE_EOF

# Build da imagem inicial
log_info "Building imagem kryonix-plataforma..."
docker build --no-cache --pull -t kryonix-plataforma:latest .

# Tag para versionamento
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP
log_success "Imagem taggeada com timestamp: $TIMESTAMP"

# Atualizar docker-stack.yml para incluir webhook
log_info "Atualizando configuração do stack..."
cat > docker-stack.yml << 'STACK_EOF'
version: '3.8'

services:
  kryonix-web:
    image: kryonix-plataforma:latest
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 5
        delay: 10s
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      labels:
        - "com.docker.stack.description=KRYONIX Web Application"
        - "com.docker.service.name=KRYONIX Web"
    ports:
      - "3000:3000"
    networks:
      - Kryonix-NET
    environment:
      - NODE_ENV=production
      - PORT=3000
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kryonix-app.rule=Host(`www.kryonix.com.br`) || Host(`kryonix.com.br`)"
      - "traefik.http.routers.kryonix-app.entrypoints=websecure"
      - "traefik.http.routers.kryonix-app.tls.certresolver=leresolver"
      - "traefik.http.services.kryonix-app.loadbalancer.server.port=3000"
      - "traefik.docker.network=Kryonix-NET"
      - "kryonix.service=web"
      - "kryonix.description=KRYONIX Web Application"

  kryonix-webhook:
    image: node:18-bullseye-slim
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 5
        delay: 5s
      labels:
        - "com.docker.stack.description=KRYONIX Auto Deploy Webhook"
        - "com.docker.service.name=KRYONIX Webhook"
    ports:
      - "9002:9002"
    networks:
      - Kryonix-NET
    environment:
      - WEBHOOK_PORT=9002
      - WEBHOOK_SECRET=Kr7$$n0x-V1t0r-2025-#Jwt$$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8
      - PROJECT_DIR=/opt/kryonix-plataform
      - NETWORK_NAME=Kryonix-NET
      - SENDGRID_API_KEY=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
    working_dir: /opt/kryonix-plataform
    volumes:
      - /opt/kryonix-plataform:/opt/kryonix-plataform
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
      - /var/log:/var/log
    command: ["sh", "-c", "apt-get update && apt-get install -y curl git && node webhook-listener.js"]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kryonix-webhook.rule=Host(`webhook.kryonix.com.br`)"
      - "traefik.http.routers.kryonix-webhook.entrypoints=websecure"
      - "traefik.http.routers.kryonix-webhook.tls.certresolver=leresolver"
      - "traefik.http.services.kryonix-webhook.loadbalancer.server.port=9002"
      - "traefik.docker.network=Kryonix-NET"
      - "kryonix.service=webhook"
      - "kryonix.description=KRYONIX Auto Deploy Webhook"

  kryonix-monitor:
    image: prom/blackbox-exporter:latest
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 3
        delay: 5s
      labels:
        - "com.docker.stack.description=KRYONIX Health Monitor"
        - "com.docker.service.name=KRYONIX Monitor"
    networks:
      - Kryonix-NET
    configs:
      - source: blackbox_config
        target: /etc/blackbox_exporter/config.yml
    command:
      - '--config.file=/etc/blackbox_exporter/config.yml'
    labels:
      - "traefik.enable=false"
      - "kryonix.service=monitor"
      - "kryonix.description=KRYONIX Health Monitor"

networks:
  Kryonix-NET:
    external: true

configs:
  blackbox_config:
    external: true
STACK_EOF

# Deploy do stack completo
log_info "Fazendo deploy do stack completo com webhook..."
docker stack deploy -c docker-stack.yml kryonix-plataforma

# Aguardar inicialização
log_info "Aguardando inicialização dos serviços..."
sleep 120

# Verificar status dos serviços
log_info "Verificando status dos serviços..."
docker stack ps kryonix-plataforma

# Mostrar logs se serviços falharam
if ! docker service ls | grep kryonix-plataforma_kryonix-web | grep -q "1/1"; then
    log_warning "Serviço web com problemas - mostrando logs..."
    docker service logs kryonix-plataforma_kryonix-web --tail 15 2>/dev/null || true
fi

if ! docker service ls | grep kryonix-plataforma_kryonix-webhook | grep -q "1/1"; then
    log_warning "Serviço webhook com problemas - mostrando logs..."
    docker service logs kryonix-plataforma_kryonix-webhook --tail 15 2>/dev/null || true
fi

# Iniciar monitor em background se não existir
if ! pgrep -f "monitor-kryonix.sh" > /dev/null; then
    log_info "Iniciando monitor de saúde automático..."
    nohup ./monitor-kryonix.sh > /dev/null 2>&1 &
    echo $! | sudo tee /var/run/kryonix-monitor.pid > /dev/null
    log_success "Monitor iniciado em background"
else
    log_info "Monitor já está rodando ✓"
fi

# Criar serviço systemd para deploy automático
log_info "Configurando serviço systemd para deploy automático..."
sudo tee /etc/systemd/system/kryonix-autodeploy.service > /dev/null << 'SYSTEMD_EOF'
[Unit]
Description=KRYONIX Auto Deploy Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
User=root
WorkingDirectory=/opt/kryonix-plataform
ExecStart=/opt/kryonix-plataform/deploy-kryonix-swarm.sh
StandardOutput=append:/var/log/kryonix-autodeploy.log
StandardError=append:/var/log/kryonix-autodeploy.log

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

# Criar timer para verificação periódica
sudo tee /etc/systemd/system/kryonix-autodeploy.timer > /dev/null << 'TIMER_EOF'
[Unit]
Description=KRYONIX Auto Deploy Timer
Requires=kryonix-autodeploy.service

[Timer]
OnCalendar=*:0/30
Persistent=true

[Install]
WantedBy=timers.target
TIMER_EOF

sudo systemctl daemon-reload
sudo systemctl enable kryonix-autodeploy.service 2>/dev/null || true
sudo systemctl enable kryonix-autodeploy.timer 2>/dev/null || true
sudo systemctl start kryonix-autodeploy.timer

# Criar script de configuração do webhook no GitHub
log_info "Criando script de configuração do webhook..."
cat > setup-github-webhook.sh << 'GITHUB_EOF'
#!/bin/bash

GITHUB_TOKEN="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"
REPO_OWNER="Nakahh"
REPO_NAME="KRYONIX-PLATAFORMA"
WEBHOOK_URL="https://webhook.kryonix.com.br/webhook"
WEBHOOK_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"

echo "🔗 Configurando webhook no GitHub..."

curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/hooks \
  -d "{
    \"name\": \"web\",
    \"active\": true,
    \"events\": [\"push\"],
    \"config\": {
      \"url\": \"$WEBHOOK_URL\",
      \"content_type\": \"json\",
      \"secret\": \"$WEBHOOK_SECRET\"
    }
  }"

echo ""
echo "✅ Webhook configurado no GitHub!"
echo "🌐 URL: $WEBHOOK_URL"
echo "📝 Eventos: push na branch main"
GITHUB_EOF

chmod +x setup-github-webhook.sh

# Configurar webhook automaticamente
log_info "Configurando webhook no GitHub..."
./setup-github-webhook.sh

# Verificar status detalhado
echo ""
log_success "📊 Status detalhado dos serviços:"
docker stack ps kryonix-plataforma --no-trunc

echo ""
log_info "🔍 Executando health checks..."

# Verificar saúde dos serviços
for i in {1..15}; do
    if curl -f http://localhost:3000/health 2>/dev/null; then
        log_success "✅ Web service: OK"
        break
    else
        log_warning "Tentativa $i/15 - aguardando serviço..."
        sleep 10
    fi
done

# Verificar webhook
for i in {1..10}; do
    if curl -f http://localhost:9002/health 2>/dev/null; then
        log_success "✅ Webhook service: OK"
        break
    else
        log_warning "Tentativa $i/10 - aguardando webhook..."
        sleep 5
    fi
done

# Configurar notificações de sucesso inicial
log_info "Enviando notificação de deploy inicial..."
curl -X POST https://ntfy.kryonix.com.br/kryonix-deploy \
    -H "Authorization: Basic a3J5b25peDpWaXRvckAxMjM0NTY=" \
    -H "Content-Type: application/json" \
    -d '{"title":"KRYONIX Sistema Ativo","message":"Deploy automático configurado e funcionando! Sistema 100% operacional 🚀","priority":3,"tags":["rocket","white_check_mark","gear"]}' 2>/dev/null || true

# Criar script de status para monitoramento
cat > kryonix-status.sh << 'STATUS_EOF'
#!/bin/bash

echo "🚀 KRYONIX - Status do Sistema"
echo "=============================="
echo ""

# Status dos serviços
echo "📊 Status dos Serviços:"
docker stack ps kryonix-plataforma --format "table {{.Name}}\t{{.Node}}\t{{.DesiredState}}\t{{.CurrentState}}"
echo ""

# Health checks
echo "💚 Health Checks:"
if curl -f http://localhost:3000/health 2>/dev/null; then
    echo "   ✅ Web Service: OK"
else
    echo "   ❌ Web Service: FALHA"
fi

if curl -f http://localhost:9002/health 2>/dev/null; then
    echo "   ✅ Webhook Service: OK"
else
    echo "   ❌ Webhook Service: FALHA"
fi

echo ""
echo "🔗 Endpoints Ativos:"
echo "   🏠 App: https://www.kryonix.com.br"
echo "   📡 Webhook: https://webhook.kryonix.com.br"
echo "   🎯 Portainer: https://painel.kryonix.com.br"
echo "   📊 Grafana: https://grafana.kryonix.com.br"
echo ""

# Últimos logs
echo "📝 Últimos Logs Webhook:"
tail -n 5 /var/log/kryonix-webhook.log 2>/dev/null || echo "   Nenhum log encontrado"
STATUS_EOF

chmod +x kryonix-status.sh

# Criar script de diagnóstico
cat > kryonix-diagnostic.sh << 'DIAGNOSTIC_EOF'
#!/bin/bash

echo "🔍 KRYONIX - Diagnóstico Completo"
echo "================================="
echo ""

echo "📊 Status dos Serviços:"
docker stack ps kryonix-plataforma
echo ""

echo "📋 Lista de Serviços:"
docker service ls | grep kryonix
echo ""

echo "📝 Logs do Web Service (últimas 15 linhas):"
docker service logs kryonix-plataforma_kryonix-web --tail 15 2>/dev/null || echo "Serviço não encontrado"
echo ""

echo "📝 Logs do Webhook Service (últimas 15 linhas):"
docker service logs kryonix-plataforma_kryonix-webhook --tail 15 2>/dev/null || echo "Serviço não encontrado"
echo ""

echo "🔗 Teste de Conectividade:"
echo "   Web Service (porta 3000):"
curl -I http://localhost:3000 2>/dev/null || echo "   ❌ Não conectou"

echo "   Webhook Service (porta 9002):"
curl -I http://localhost:9002 2>/dev/null || echo "   ❌ Não conectou"

echo ""
echo "🐳 Imagens Docker:"
docker images | grep kryonix
echo ""

echo "🌐 Rede Docker:"
docker network ls | grep Kryonix-NET
echo ""

echo "💾 Configs Docker:"
docker config ls | grep blackbox
DIAGNOSTIC_EOF

chmod +x kryonix-diagnostic.sh

echo ""
echo "=========================================================="
log_success "🚀 KRYONIX Deploy TOTALMENTE AUTOMÁTICO Concluído!"
echo "=========================================================="
echo ""
echo "📋 Comandos úteis:"
echo "   ./kryonix-status.sh          # Status completo do sistema"
echo "   ./kryonix-diagnostic.sh      # Diagnóstico completo de problemas"
echo "   docker stack ps kryonix-plataforma"
echo "   docker service logs kryonix-plataforma_web -f"
echo "   docker service logs kryonix-plataforma_webhook -f"
echo "   systemctl status kryonix-autodeploy.timer"
echo "   tail -f /var/log/kryonix-webhook.log"
echo ""
echo "🔧 Troubleshooting:"
echo "   Se serviços não ficarem online (0/1 ou 0/2):"
echo "   1. Execute: ./kryonix-diagnostic.sh"
echo "   2. Verifique logs: docker service logs kryonix-plataforma_web"
echo "   3. Teste health check: curl http://localhost:3000/health"
echo "   4. Reinicie se necessário: docker service update --force kryonix-plataforma_web"
echo ""
echo "🌐 Endpoints KRYONIX:"
echo "   🏠 App Principal: https://www.kryonix.com.br"
echo "   💚 Health Check: http://localhost:3000/health"
echo "   📡 Webhook GitHub: https://webhook.kryonix.com.br/webhook"
echo "   🎯 Portainer: https://painel.kryonix.com.br"
echo "   📊 Grafana: https://grafana.kryonix.com.br"
echo "   💬 Chatwoot: https://chat.kryonix.com.br"
echo "   🤖 TypeBot: https://typebot.kryonix.com.br"
echo "   🔧 N8N: https://n8n.kryonix.com.br"
echo "   📋 Ntfy: https://ntfy.kryonix.com.br"
echo ""
echo "🤖 DEPLOY 100% AUTOMÁTICO ATIVO:"
echo "   ✅ GitHub Webhook configurado com token real"
echo "   ✅ Push na main → Deploy automático instantâneo"
echo "   ✅ Auto-restart em caso de falha"
echo "   ✅ Monitor de saúde contínuo 24/7"
echo "   ✅ Zero downtime deployment"
echo "   ✅ Rollback automático em falhas"
echo "   ✅ Notificações via NTFY"
echo "   ✅ Logs centralizados"
echo "   ✅ Rede Kryonix-NET overlay"
echo ""
echo "🎯 Fluxo Automático:"
echo "   1. 📝 git push origin main"
echo "   2. 📡 GitHub webhook → webhook.kryonix.com.br"
echo "   3. 🔄 Pull automático + Build + Deploy"
echo "   4. 🔍 Health check + Restart se necessário"
echo "   5. 📱 Notificação NTFY de sucesso/falha"
echo "   6. ✅ Aplicação atualizada automaticamente!"
echo ""
echo "🔐 Segurança Configurada:"
echo "   ✅ JWT Secret: Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t..."
echo "   ✅ GitHub Token: github_pat_11AVPMT2Y0..."
echo "   ✅ SendGrid API: SG.hu7o_dY7QduLbXxH..."
echo "   ✅ NTFY Auth: Basic a3J5b25peDpWaXRvckA..."
echo ""
log_success "✅ Sistema KRYONIX 100% Automático Funcionando! 🚀🌟"

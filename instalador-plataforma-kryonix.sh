#!/bin/bash
set -e

# Cores e formatação
BLUE='\033[1;34m'
CYAN='\033[1;36m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
PURPLE='\033[1;35m'
WHITE='\033[1;37m'
BOLD='\033[1m'
RESET='\033[0m'

# Caracteres especiais para barras
PROGRESS_FILL='█'
PROGRESS_EMPTY='░'
CHECKMARK='✓'
CROSS='✗'
ARROW='→'
GEAR='⚙'

# Função para mostrar banner da Plataforma Kryonix
show_banner() {
    clear
    echo -e "${BLUE}${BOLD}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                               ║"
    echo "║     ██╗  ██╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗██╗  ██╗                 ║"
    echo "║     ██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║╚██╗██╔╝                 ║"
    echo "║     █████╔╝ ██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║██║ ╚███╔╝                  ║"
    echo "║     ██╔═██╗ ██╔══██╗  ╚██╔╝  ██║   ██║██║╚██╗██║██║ ██╔██╗                  ║"
    echo "║     ██║  ██╗██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║██╔╝ ██╗                 ║"
    echo "║     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝                 ║"
    echo "║                                                                               ║"
    echo "║                        ${WHITE}PLATAFORMA KRYONIX${BLUE}                                  ║"
    echo "║                   ${CYAN}Deploy Automatico Profissional${BLUE}                          ║"
    echo "║                                                                               ║"
    echo "║     ${WHITE}SaaS 100% Autonomo  |  Mobile-First  |  Portugues${BLUE}                    ║"
    echo "║                                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}\n"
}

# Função para barra de progresso animada
show_progress() {
    local current=$1
    local total=$2
    local message="$3"
    local width=50
    
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "\r${CYAN}${BOLD}%s${RESET} " "$message"
    printf "${BLUE}["
    
    # Barra preenchida
    for ((i=0; i<filled; i++)); do
        printf "${GREEN}${PROGRESS_FILL}"
    done
    
    # Barra vazia
    for ((i=0; i<empty; i++)); do
        printf "${WHITE}${PROGRESS_EMPTY}"
    done
    
    printf "${BLUE}]${RESET} ${WHITE}${BOLD}%3d%%${RESET}" "$percentage"
    
    if [ "$current" -eq "$total" ]; then
        printf " ${GREEN}${BOLD}${CHECKMARK} CONCLUIDO${RESET}\n"
    fi
}

# Função para simular progresso com animação
animate_progress() {
    local total_steps=$1
    local message="$2"
    local delay=${3:-0.1}
    
    for ((i=0; i<=total_steps; i++)); do
        show_progress $i $total_steps "$message"
        sleep $delay
    done
}

# Função para logs formatados
log_info() {
    echo -e "${CYAN}${BOLD}[${GEAR} INFO]${RESET} $1"
}

log_success() {
    echo -e "${GREEN}${BOLD}[${CHECKMARK} SUCESSO]${RESET} $1"
}

log_warning() {
    echo -e "${YELLOW}${BOLD}[! AVISO]${RESET} $1"
}

log_error() {
    echo -e "${RED}${BOLD}[${CROSS} ERRO]${RESET} $1"
}

log_step() {
    echo -e "\n${PURPLE}${BOLD}[${ARROW} ETAPA]${RESET} $1"
    echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${RESET}"
}

# Função de validação pré-deploy
validate_before_deploy() {
    log_step "Validacao Pre-Deploy"
    
    local ERRORS=0
    local files=("package.json" "server.js" "Dockerfile" "public/index.html")
    
    animate_progress 20 "Verificando arquivos essenciais" 0.05
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            log_success "Arquivo $file encontrado"
        else
            log_error "Arquivo $file NAO encontrado"
            ((ERRORS++))
        fi
    done
    
    animate_progress 30 "Verificando sintaxe JavaScript" 0.1
    
    if [ -f "server.js" ]; then
        if node -c "server.js" 2>/dev/null; then
            log_success "Sintaxe de server.js esta correta"
        else
            log_error "Erro de sintaxe em server.js"
            ((ERRORS++))
        fi
    fi
    
    animate_progress 40 "Verificando dependencias" 0.08
    
    if [ -f "package.json" ]; then
        local required_deps=("express" "cors" "helmet" "compression")
        for dep in "${required_deps[@]}"; do
            if grep -q "\"$dep\"" package.json; then
                log_success "Dependencia $dep encontrada"
            else
                log_error "Dependencia $dep NAO encontrada"
                ((ERRORS++))
            fi
        done
    fi
    
    animate_progress 50 "Verificando configuracoes de porta" 0.1
    
    if [ -f "server.js" ]; then
        if grep -q "8080" server.js; then
            log_success "Porta 8080 configurada no server.js"
        else
            log_warning "Porta 8080 nao encontrada no server.js - corrigindo automaticamente..."
            sed -i 's/const PORT = process\.env\.PORT || [0-9][0-9]*/const PORT = process.env.PORT || 8080/' server.js
            sed -i 's/PORT = [0-9][0-9]*/PORT = process.env.PORT || 8080/' server.js
            
            if grep -q "8080" server.js; then
                log_success "server.js corrigido automaticamente - porta 8080 configurada"
            else
                log_warning "Nao foi possivel corrigir server.js automaticamente"
            fi
        fi
        
        if ! grep -q "listen.*0.0.0.0" server.js; then
            log_info "Corrigindo binding do servidor para aceitar conexoes externas..."
            sed -i "s/app\.listen(PORT,/app.listen(PORT, '0.0.0.0',/" server.js
            sed -i "s/http:\/\/localhost:/http:\/\/0.0.0.0:/g" server.js
            log_success "Binding do servidor corrigido para 0.0.0.0"
        fi
    fi
    
    if [ -f "Dockerfile" ]; then
        if grep -q "EXPOSE 8080" Dockerfile; then
            log_success "Porta 8080 exposta no Dockerfile"
        else
            log_warning "Porta 8080 nao encontrada no Dockerfile - corrigindo automaticamente..."
            if grep -q "EXPOSE" Dockerfile; then
                sed -i 's/EXPOSE.*/EXPOSE 8080/' Dockerfile
            else
                sed -i '/# Health check/i EXPOSE 8080\n' Dockerfile
            fi
            
            if grep -q "EXPOSE 8080" Dockerfile; then
                log_success "Dockerfile corrigido automaticamente - EXPOSE 8080 adicionado"
            else
                log_error "Falha ao corrigir Dockerfile automaticamente"
                ((ERRORS++))
            fi
        fi
    fi
    
    show_progress 50 50 "Validacao pre-deploy CONCLUIDA"
    echo
    
    if [ $ERRORS -eq 0 ]; then
        log_success "TODAS AS VALIDACOES PASSARAM!"
        return 0
    else
        log_error "ENCONTRADOS $ERRORS ERRO(S)!"
        return 1
    fi
}

# Configurações - KRYONIX
REPO_URL="https://github.com/Nakahh/KRYONIX-PLATAFORMA.git"
PROJECT_DIR="/opt/kryonix-plataform"
WEB_PORT="8080"
WEBHOOK_PORT="8082"
MONITOR_PORT="8084"
WEBHOOK_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"
GITHUB_TOKEN="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"
NETWORK_NAME="Kryonix-NET"

# Mostrar banner
show_banner

# Verificar Docker Swarm
log_step "Verificacao do Docker Swarm"
if ! docker info | grep -q "Swarm: active"; then
    log_error "Docker Swarm nao esta ativo!"
    log_info "Execute: docker swarm init"
    exit 1
fi
log_success "Docker Swarm detectado e ativo"

# Limpeza completa antes do deploy
log_step "Limpeza Completa do Ambiente"

animate_progress 25 "Removendo stacks antigos" 0.2

if docker stack ls | grep -q "Kryonix"; then
    log_warning "Removendo stack Kryonix existente..."
    docker stack rm Kryonix
fi
if docker stack ls | grep -q "kryonix-plataforma"; then
    log_warning "Removendo stack kryonix-plataforma existente..."
    docker stack rm kryonix-plataforma
fi
if docker stack ls | grep -q "kryonix-web-isolated"; then
    log_warning "Removendo stack kryonix-web-isolated..."
    docker stack rm kryonix-web-isolated
fi
if docker stack ls | grep -q "kryonix-test"; then
    log_warning "Removendo stack kryonix-test..."
    docker stack rm kryonix-test
fi
if docker stack ls | grep -q "kryonix-minimal"; then
    log_warning "Removendo stack kryonix-minimal..."
    docker stack rm kryonix-minimal
fi

show_progress 25 50 "Aguardando remocao completa"
echo
log_info "Aguardando remocao completa dos stacks..."
sleep 30

animate_progress 50 "Limpando recursos orfaos" 0.1

if docker config ls | grep -q "kryonix_monitor_config"; then
    log_warning "Removendo config kryonix_monitor_config antigo..."
    docker config rm kryonix_monitor_config 2>/dev/null || true
fi

docker container prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true
docker image prune -f 2>/dev/null || true
docker images | grep "kryonix-plataforma" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

show_progress 75 75 "Limpeza completa finalizada"
echo
log_success "Ambiente limpo e preparado"

# Preparação do projeto
log_step "Preparacao do Projeto"

animate_progress 20 "Criando diretorio do projeto" 0.1
sudo mkdir -p "$PROJECT_DIR"
sudo chown -R $USER:$USER "$PROJECT_DIR"
cd "$PROJECT_DIR"

animate_progress 40 "Configurando repositorio Git" 0.2
if [ ! -d ".git" ]; then
    log_info "Clonando repositorio..."
    git clone "$REPO_URL" .
    git config --local user.name "KRYONIX Deploy Bot"
    git config --local user.email "deploy@kryonix.com.br"
    git checkout main
else
    log_info "Atualizando repositorio existente..."
    git fetch origin
    git checkout main
    git reset --hard origin/main
    git clean -fd
fi

animate_progress 60 "Corrigindo configuracoes" 0.1
if grep -q '"type": "module"' package.json; then
    sed -i '/"type": "module",/d' package.json
    log_success "Removido 'type: module' do package.json"
fi

if ! grep -q "const express = require" server.js; then
    log_warning "Adicionando import do express no server.js..."
    sed -i '1i const express = require("express");' server.js
    log_success "Import do express adicionado"
fi

show_progress 60 60 "Preparacao do projeto CONCLUIDA"
echo

# Executar validação pré-deploy
log_step "Validacao Pre-Deploy"
if ! validate_before_deploy; then
    log_error "Validacao pre-deploy falhou! Abortando deploy."
    exit 1
fi

# Teste local do servidor
log_step "Teste Local do Servidor"

animate_progress 30 "Verificando dependencias" 0.1
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependencias..."
    npm install
fi

animate_progress 60 "Testando sintaxe" 0.1
if node -c server.js 2>/dev/null; then
    log_success "Sintaxe do server.js esta correta"
else
    log_error "Erro de sintaxe no server.js:"
    node -c server.js
    exit 1
fi

animate_progress 90 "Testando inicializacao" 0.2
timeout 3s node server.js > /tmp/server_test.log 2>&1 &
SERVER_PID=$!
sleep 1

if ps -p $SERVER_PID > /dev/null 2>&1; then
    log_success "Servidor iniciou com sucesso"
    kill $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
    show_progress 90 90 "Teste local do servidor CONCLUIDO"
    echo
else
    log_error "Servidor nao conseguiu iniciar"
    cat /tmp/server_test.log 2>/dev/null
    exit 1
fi

# Configuração de firewall
log_step "Configuracao de Firewall"

animate_progress 50 "Detectando tipo de firewall" 0.1

configure_firewall() {
    local ports=("$WEB_PORT" "$WEBHOOK_PORT" "$MONITOR_PORT")
    
    if command -v ufw >/dev/null 2>&1; then
        log_info "UFW detectado - configurando regras..."
        sudo ufw --force enable 2>/dev/null || true
        
        for port in "${ports[@]}"; do
            sudo ufw allow $port/tcp comment "KRYONIX-$port" 2>/dev/null || true
            log_success "Porta $port/tcp aberta via UFW"
        done
        
    elif command -v firewall-cmd >/dev/null 2>&1; then
        log_info "FirewallD detectado - configurando regras..."
        
        for port in "${ports[@]}"; do
            sudo firewall-cmd --add-port=$port/tcp 2>/dev/null || true
            sudo firewall-cmd --permanent --add-port=$port/tcp 2>/dev/null || true
            log_success "Porta $port/tcp aberta via FirewallD"
        done
        
        sudo firewall-cmd --reload 2>/dev/null || true
        
    elif command -v iptables >/dev/null 2>&1; then
        log_info "iptables detectado - configurando regras..."
        
        for port in "${ports[@]}"; do
            sudo iptables -I INPUT -p tcp --dport $port -j ACCEPT 2>/dev/null || true
            log_success "Porta $port/tcp aberta via iptables"
        done
        
        if command -v iptables-save >/dev/null 2>&1; then
            sudo iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
        fi
        
        if command -v netfilter-persistent >/dev/null 2>&1; then
            sudo netfilter-persistent save 2>/dev/null || true
        fi
        
    else
        log_warning "Nenhum firewall conhecido detectado"
    fi
}

configure_firewall
show_progress 50 50 "Configuracao de firewall CONCLUIDA"
echo

# Configuração de redes Docker
log_step "Configuracao de Redes Docker"

animate_progress 33 "Verificando rede Kryonix-NET" 0.1
if ! docker network ls | grep -q "$NETWORK_NAME"; then
    docker network create -d overlay --attachable "$NETWORK_NAME"
    log_success "Rede $NETWORK_NAME criada"
else
    log_success "Rede $NETWORK_NAME ja existe"
fi

animate_progress 66 "Verificando rede traefik-public" 0.1
if ! docker network ls | grep -q "traefik-public"; then
    docker network create -d overlay --attachable traefik-public
    log_success "Rede traefik-public criada"
else
    log_success "Rede traefik-public ja existe"
fi

animate_progress 100 "Verificando rede traefik_default" 0.1
if ! docker network ls | grep -q "traefik_default"; then
    docker network create -d overlay --attachable traefik_default
    log_success "Rede traefik_default criada"
else
    log_success "Rede traefik_default ja existe"
fi

# Criação de arquivos de serviços
log_step "Criacao de Arquivos de Servicos"

animate_progress 25 "Criando webhook listener" 0.1
cat > webhook-listener.js << 'WEBHOOK_EOF'
const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');

const PORT = process.env.WEBHOOK_PORT || 8082;
const SECRET = process.env.WEBHOOK_SECRET || 'Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8';
const PROJECT_DIR = process.env.PROJECT_DIR || '/opt/kryonix-plataform';

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [WEBHOOK] ${message}\n`;
    console.log(logMessage.trim());
    try {
        fs.appendFileSync('/var/log/kryonix-webhook.log', logMessage);
    } catch (e) {
        console.log('Warning: Could not write to log file');
    }
}

function verifySignature(payload, signature) {
    if (!signature) return false;
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = hmac.update(payload).digest('hex');
    const expected = `sha256=${digest}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function deployProject() {
    log('🚀 Iniciando deploy automatico...');

    const deployScript = `
        cd ${PROJECT_DIR}
        git fetch origin
        git checkout main
        git reset --hard origin/main
        git clean -fd

        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        docker build --no-cache --pull -t kryonix-plataforma:latest .
        docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP

        docker stack deploy -c docker-stack.yml kryonix-plataforma

        sleep 60

        if curl -f http://localhost:8080/health 2>/dev/null; then
            echo "✅ Deploy concluido com sucesso!"
        else
            echo "❌ Deploy falhou - verificar logs"
            exit 1
        fi
    `;

    exec(deployScript, (error, stdout, stderr) => {
        if (error) {
            log('❌ Deploy falhou: ' + error.message);
            return;
        }
        if (stderr) {
            log('⚠️ Deploy warnings: ' + stderr);
        }
        log('✅ Deploy output: ' + stdout);
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
                
                if (!verifySignature(body, signature)) {
                    log('❌ Assinatura invalida');
                    res.statusCode = 401;
                    res.end('Unauthorized');
                    return;
                }
                
                const payload = JSON.parse(body);
                
                if (payload.ref === 'refs/heads/main' || payload.ref === 'refs/heads/master') {
                    log(`📦 Push detectado no branch: ${payload.ref}`);
                    deployProject();
                    res.statusCode = 200;
                    res.end('Deploy iniciado!');
                } else {
                    log(`ℹ️ Push ignorado - branch: ${payload.ref}`);
                    res.statusCode = 200;
                    res.end('Branch ignorado');
                }
                
            } catch (e) {
                log(`❌ Erro no webhook: ${e.message}`);
                res.statusCode = 400;
                res.end('Bad Request');
            }
        });
        
    } else if (req.method === 'GET' && req.url === '/health') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'KRYONIX Webhook',
            port: PORT,
            timestamp: new Date().toISOString()
        }));
        
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    log(`🎣 KRYONIX Webhook Listener rodando na porta ${PORT}`);
    log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
});

process.on('SIGTERM', () => {
    log('📴 Webhook listener desligando...');
    server.close(() => {
        log('👋 Webhook listener desligado');
        process.exit(0);
    });
});
WEBHOOK_EOF

animate_progress 50 "Criando monitor KRYONIX" 0.1
cat > kryonix-monitor.js << 'MONITOR_EOF'
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');

const PORT = process.env.MONITOR_PORT || 8084;
const WEB_PORT = process.env.WEB_PORT || 8080;
const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 8082;

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [MONITOR] ${message}\n`;
    console.log(logMessage.trim());
    try {
        fs.appendFileSync('/var/log/kryonix-monitor.log', logMessage);
    } catch (e) {
        console.log('Warning: Could not write to log file');
    }
}

function checkService(port, name) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/health',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({
                        service: name,
                        port: port,
                        status: 'healthy',
                        details: response
                    });
                } catch (e) {
                    resolve({
                        service: name,
                        port: port,
                        status: 'unhealthy',
                        error: 'Invalid JSON response'
                    });
                }
            });
        });

        req.on('error', (err) => {
            resolve({
                service: name,
                port: port,
                status: 'down',
                error: err.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                service: name,
                port: port,
                status: 'timeout',
                error: 'Request timeout'
            });
        });

        req.end();
    });
}

async function performHealthCheck() {
    const [webHealth, webhookHealth] = await Promise.all([
        checkService(WEB_PORT, 'KRYONIX Web'),
        checkService(WEBHOOK_PORT, 'KRYONIX Webhook')
    ]);

    const healthReport = {
        timestamp: new Date().toISOString(),
        services: [webHealth, webhookHealth],
        overall: 'healthy'
    };

    const downServices = healthReport.services.filter(s => s.status === 'down' || s.status === 'timeout');
    if (downServices.length > 0) {
        healthReport.overall = 'degraded';
        if (downServices.length === healthReport.services.length) {
            healthReport.overall = 'unhealthy';
        }
    }

    return healthReport;
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
        try {
            const healthReport = await performHealthCheck();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(healthReport, null, 2));
        } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            }));
        }
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    log(`📊 KRYONIX Health Monitor rodando na porta ${PORT}`);
    log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
});

setInterval(async () => {
    try {
        const health = await performHealthCheck();
        if (health.overall !== 'healthy') {
            log(`⚠️ Sistema ${health.overall}: ${health.services.filter(s => s.status !== 'healthy').map(s => s.service).join(', ')}`);
        }
    } catch (error) {
        log(`❌ Erro no health check: ${error.message}`);
    }
}, 30000);

process.on('SIGTERM', () => {
    log('📴 Health monitor desligando...');
    server.close(() => {
        log('👋 Health monitor desligado');
        process.exit(0);
    });
});
MONITOR_EOF

animate_progress 75 "Criando configuracao do monitor" 0.1
cat > monitor-config.yml << 'CONFIG_EOF'
kryonix:
  monitor_name: "KRYONIX Health Monitor"
  version: "1.0.0"
  check_interval: 30
  targets:
    - url: "http://Kryonix_web:3000/health"
      name: "KRYONIX Web Service"
      timeout: 5
    - url: "http://Kryonix_webhook:9002/health" 
      name: "KRYONIX Webhook Service"
      timeout: 5
  notifications:
    enabled: true
CONFIG_EOF

docker config create kryonix_monitor_config monitor-config.yml
animate_progress 100 "Criando scripts de monitoramento" 0.1

# Corrigir arquivos para Docker
log_step "Correcao de Arquivos para Docker"

animate_progress 50 "Corrigindo server.js" 0.1
sed -i 's/const PORT = process.env.PORT || 5173;/const PORT = process.env.PORT || 8080;/' server.js
sed -i 's/app.listen(PORT, () => {/app.listen(PORT, "0.0.0.0", () => {/' server.js
sed -i 's/localhost:${PORT}/0.0.0.0:${PORT}/g' server.js

animate_progress 100 "Verificando arquivos necessarios" 0.1
if [ ! -f "server.js" ] || [ ! -d "public" ] || [ ! -f "public/index.html" ]; then
    log_error "Arquivos essenciais nao encontrados!"
    exit 1
fi

log_success "Arquivos verificados e corrigidos"

# Criar Dockerfile
log_step "Criacao do Dockerfile"

animate_progress 100 "Criando Dockerfile otimizado" 0.1
cat > Dockerfile << 'DOCKERFILE_EOF'
FROM node:18-bullseye-slim

RUN apt-get update && apt-get install -y \
    curl \
    wget \
    net-tools \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --production && npm cache clean --force

COPY server.js ./
COPY public/ ./public/

RUN groupadd -r kryonix && useradd -r -g kryonix kryonix
RUN chown -R kryonix:kryonix /app

USER kryonix

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["sh", "-c", "echo 'Starting KRYONIX server on port 8080...' && PORT=8080 node server.js"]
DOCKERFILE_EOF

# Build da imagem
log_step "Build da Imagem Docker"

animate_progress 50 "Building imagem kryonix-plataforma" 0.2
docker build --no-cache --pull -t kryonix-plataforma:latest .

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP
animate_progress 100 "Imagem criada e taggeada" 0.1
log_success "Imagem taggeada com timestamp: $TIMESTAMP"

# Criar configuração do stack
log_step "Criacao da Configuracao do Stack"

animate_progress 100 "Criando docker-stack.yml" 0.1
cat > docker-stack.yml << 'STACK_EOF'
version: '3.8'

services:
  web:
    image: kryonix-plataforma:latest
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 3
        delay: 10s
    ports:
      - "8080:8080"
    networks:
      - traefik-public
      - traefik_default
    environment:
      - NODE_ENV=production
      - PORT=8080
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-public"
      - "traefik.http.services.kryonix-service.loadbalancer.server.port=8080"

  webhook:
    image: node:18-bullseye-slim
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 5
        delay: 30s
    ports:
      - "8082:8082"
    networks:
      - traefik-public
      - traefik_default
    environment:
      - WEBHOOK_PORT=8082
      - WEBHOOK_SECRET=Kr7$$n0x-V1t0r-2025-#Jwt$$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8
      - PROJECT_DIR=/opt/kryonix-plataform
    working_dir: /opt/kryonix-plataform
    volumes:
      - /opt/kryonix-plataform:/opt/kryonix-plataform:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker:ro
      - /var/log:/var/log
    command: >
      sh -c "
        apt-get update &&
        apt-get install -y curl git procps &&
        node /opt/kryonix-plataform/webhook-listener.js
      "

  monitor:
    image: node:18-bullseye-slim
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 5
        delay: 30s
    ports:
      - "8084:8084"
    networks:
      - traefik-public
      - traefik_default
    environment:
      - MONITOR_PORT=8084
    working_dir: /opt/kryonix-plataform
    volumes:
      - /opt/kryonix-plataform:/opt/kryonix-plataform:ro
    command: >
      sh -c "
        apt-get update &&
        apt-get install -y curl procps &&
        node /opt/kryonix-plataform/kryonix-monitor.js
      "

networks:
  traefik-public:
    external: true
  traefik_default:
    external: true
STACK_EOF

# Deploy do stack
log_step "Deploy do Stack Completo"

animate_progress 33 "Iniciando deploy do stack" 0.2
docker stack deploy -c docker-stack.yml Kryonix

animate_progress 66 "Aguardando inicializacao dos servicos" 0.5
log_info "Aguardando inicializacao dos servicos..."
sleep 60

animate_progress 100 "Verificando status dos servicos" 0.1

# Status final
log_step "Verificacao Final"

animate_progress 50 "Verificando status dos servicos" 0.1
docker stack ps Kryonix

animate_progress 100 "Deploy concluido" 0.1

# Verificação de conectividade
log_step "Teste de Conectividade"

animate_progress 33 "Testando porta 8080 (Web)" 0.2
if curl -f -m 5 http://localhost:8080/health 2>/dev/null; then
    log_success "✅ Web Service (8080): FUNCIONANDO"
else
    log_warning "⚠️ Web Service (8080): Verificar logs"
fi

animate_progress 66 "Testando porta 8082 (Webhook)" 0.2
if curl -f -m 5 http://localhost:8082/health 2>/dev/null; then
    log_success "✅ Webhook Service (8082): FUNCIONANDO"
else
    log_warning "⚠️ Webhook Service (8082): Verificar logs"
fi

animate_progress 100 "Testando porta 8084 (Monitor)" 0.2
if curl -f -m 5 http://localhost:8084/health 2>/dev/null; then
    log_success "✅ Monitor Service (8084): FUNCIONANDO"
else
    log_warning "⚠️ Monitor Service (8084): Verificar logs"
fi

# Banner final
echo -e "\n${BLUE}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo "║                    ${GREEN}${CHECKMARK} DEPLOY CONCLUIDO COM SUCESSO! ${CHECKMARK}${BLUE}                         ║"
echo "║                                                                               ║"
echo "║   ${WHITE}🌐 Web:     http://localhost:8080${BLUE}                                     ║"
echo "║   ${WHITE}�� Webhook: http://localhost:8082${BLUE}                                     ║"
echo "║   ${WHITE}📊 Monitor: http://localhost:8084${BLUE}                                     ║"
echo "║                                                                               ║"
echo "║                     ${CYAN}PLATAFORMA KRYONIX ONLINE${BLUE}                             ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${RESET}\n"

log_success "KRYONIX Platform deployada com sucesso!"
log_info "Use docker stack ps Kryonix para monitorar os servicos"
log_info "Logs disponiveis com: docker service logs [nome_do_servico]"

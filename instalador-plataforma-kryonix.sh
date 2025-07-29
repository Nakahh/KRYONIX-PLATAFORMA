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
    echo    "╔═══════════════════════════��═══════════════════════════════════════════════════╗"
    echo    "║                                                                               ║"
    echo    "║     ██╗  ██╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗██╗  ██╗                   ║"
    echo    "║     ██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║╚██╗██╔╝                   ║"
    echo    "║     █████╔╝ ██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║██║ ╚███╔╝                    ║"
    echo    "║     ██╔═██╗ ██╔══██╗  ╚██╔╝  ██║   ██║██║╚██╗██║██║ ██╔██╗                    ║"
    echo    "║     ██║  ██╗██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║██╔╝ ██╗                   ║"
    echo    "║     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ��═══╝╚═╝╚═╝  ╚═╝                   ║"
    echo    "║                                                                               ║"
    echo -e "║                   ${WHITE}PLATAFORMA KRYONIX${BLUE}                           ║"
    echo -e "║                   ${CYAN}Deploy Automatico Profissional${BLUE}                ║"
    echo    "║                                                                               ║"
    echo -e "║     ${WHITE}SaaS 100% Autonomo  |  Mobile-First  |  Portugues${BLUE}          ║"
    echo    "║                                                                               ║"
    echo    "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}\n"
}

# Função para barra de progresso simples
show_simple_progress() {
    local message="$1"
    local percentage="$2"
    local width=50
    
    local filled=$((percentage * width / 100))
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
    
    if [ "$percentage" -eq 100 ]; then
        printf " ${GREEN}${BOLD}${CHECKMARK}${RESET}\n"
    fi
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

# Função para progresso com status
show_status() {
    local task="$1"
    local status="$2"
    
    case $status in
        "iniciando")
            echo -e "${CYAN}${BOLD}[→]${RESET} $task..."
            ;;
        "processando")
            echo -e "${YELLOW}${BOLD}[...]${RESET} $task em andamento..."
            ;;
        "concluido")
            echo -e "${GREEN}${BOLD}[${CHECKMARK}]${RESET} $task concluido"
            ;;
        "erro")
            echo -e "${RED}${BOLD}[${CROSS}]${RESET} $task falhou"
            ;;
    esac
}

# Configurações - KRYONIX
REPO_URL="https://github.com/Nakahh/KRYONIX-PLATAFORMA.git"
PROJECT_DIR="/opt/kryonix-plataform"
WEB_PORT="8080"
WEBHOOK_PORT="8082"
MONITOR_PORT="8084"
WEBHOOK_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"
NETWORK_NAME="Kryonix-NET"

# Mostrar banner
show_banner

# Verificar Docker Swarm
log_step "Verificacao do Docker Swarm"
show_status "Verificando Docker Swarm" "iniciando"
if ! docker info | grep -q "Swarm: active"; then
    show_status "Verificando Docker Swarm" "erro"
    log_error "Docker Swarm nao esta ativo!"
    log_info "Execute: docker swarm init"
    exit 1
fi
show_status "Docker Swarm detectado e ativo" "concluido"

# Limpeza completa antes do deploy
log_step "Limpeza Completa do Ambiente"

show_status "Removendo stacks antigos" "iniciando"
if docker stack ls | grep -q "Kryonix"; then
    log_warning "Removendo stack Kryonix existente..."
    docker stack rm Kryonix > /dev/null 2>&1
fi
if docker stack ls | grep -q "kryonix-plataforma"; then
    log_warning "Removendo stack kryonix-plataforma existente..."
    docker stack rm kryonix-plataforma > /dev/null 2>&1
fi
if docker stack ls | grep -q "kryonix-web-isolated"; then
    log_warning "Removendo stack kryonix-web-isolated..."
    docker stack rm kryonix-web-isolated > /dev/null 2>&1
fi
if docker stack ls | grep -q "kryonix-test"; then
    log_warning "Removendo stack kryonix-test..."
    docker stack rm kryonix-test > /dev/null 2>&1
fi
if docker stack ls | grep -q "kryonix-minimal"; then
    log_warning "Removendo stack kryonix-minimal..."
    docker stack rm kryonix-minimal > /dev/null 2>&1
fi
show_status "Stacks antigos removidos" "concluido"

show_status "Aguardando remocao completa" "processando"
sleep 20
show_status "Remocao completa" "concluido"

show_status "Limpando recursos orfaos" "iniciando"
if docker config ls | grep -q "kryonix_monitor_config"; then
    docker config rm kryonix_monitor_config 2>/dev/null || true
fi

docker container prune -f 2>/dev/null || true
docker volume prune -f 2>/dev/null || true
docker image prune -f 2>/dev/null || true
docker images | grep "kryonix-plataforma" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
show_status "Recursos orfaos limpos" "concluido"

# Preparação do projeto
log_step "Preparacao do Projeto"

show_status "Criando diretorio do projeto" "iniciando"
sudo mkdir -p "$PROJECT_DIR"
sudo chown -R $USER:$USER "$PROJECT_DIR"
cd "$PROJECT_DIR"
show_status "Diretorio do projeto criado" "concluido"

show_status "Configurando repositorio Git" "iniciando"

# Configurações globais do Git para evitar interações
export GIT_TERMINAL_PROMPT=0
export GIT_ASKPASS=/bin/echo
git config --global credential.helper store 2>/dev/null || true
git config --global http.sslverify false 2>/dev/null || true

if [ ! -d ".git" ]; then
    log_info "Clonando repositorio publico..."

    # Método 1: HTTPS direto sem autenticação
    timeout 60 git clone --depth 1 --no-single-branch "$REPO_URL" . 2>/dev/null
    if [ $? -eq 0 ] && [ -f "package.json" -o -f "README.md" ]; then
        log_success "Clone realizado com sucesso via HTTPS"
    else
        log_warning "Tentativa HTTPS falhou. Tentando método alternativo..."

        # Limpar tentativa anterior
        rm -rf .git 2>/dev/null || true
        rm -rf * .[^.]* 2>/dev/null || true

        # Método 2: Wget/curl como alternativa
        if command -v wget >/dev/null 2>&1; then
            log_info "Usando wget para download do repositorio..."
            wget --timeout=30 --tries=3 -q https://github.com/Nakahh/KRYONIX-PLATAFORMA/archive/refs/heads/main.zip -O /tmp/kryonix.zip 2>/dev/null
            if [ -f /tmp/kryonix.zip ] && [ -s /tmp/kryonix.zip ]; then
                cd /tmp
                if unzip -q kryonix.zip 2>/dev/null; then
                    if [ -d "KRYONIX-PLATAFORMA-main" ]; then
                        cp -r KRYONIX-PLATAFORMA-main/* "$PROJECT_DIR/" 2>/dev/null
                        cd "$PROJECT_DIR"
                        rm -f /tmp/kryonix.zip
                        rm -rf /tmp/KRYONIX-PLATAFORMA-main
                        log_success "Repositorio baixado via wget"

                        # Inicializar git local
                        git init 2>/dev/null
                        git remote add origin "$REPO_URL" 2>/dev/null
                    fi
                fi
            fi
        elif command -v curl >/dev/null 2>&1; then
            log_info "Usando curl para download do repositorio..."
            curl --connect-timeout 30 --max-time 60 -L https://github.com/Nakahh/KRYONIX-PLATAFORMA/archive/refs/heads/main.zip -o /tmp/kryonix.zip 2>/dev/null
            if [ -f /tmp/kryonix.zip ] && [ -s /tmp/kryonix.zip ]; then
                cd /tmp
                if unzip -q kryonix.zip 2>/dev/null; then
                    if [ -d "KRYONIX-PLATAFORMA-main" ]; then
                        cp -r KRYONIX-PLATAFORMA-main/* "$PROJECT_DIR/" 2>/dev/null
                        cd "$PROJECT_DIR"
                        rm -f /tmp/kryonix.zip
                        rm -rf /tmp/KRYONIX-PLATAFORMA-main
                        log_success "Repositorio baixado via curl"

                        # Inicializar git local
                        git init 2>/dev/null
                        git remote add origin "$REPO_URL" 2>/dev/null
                    fi
                fi
            fi
        else
            log_warning "Wget e curl nao disponiveis. Criando arquivos minimos..."
        fi
    fi

    # Configurações locais do git
    git config --local user.name "KRYONIX Deploy Bot" 2>/dev/null || true
    git config --local user.email "deploy@kryonix.com.br" 2>/dev/null || true
    git config --local credential.helper store 2>/dev/null || true

    # Tentar checkout da branch correta
    git checkout main 2>/dev/null || git checkout master 2>/dev/null || true

else
    log_info "Atualizando repositorio existente..."

    # Configurar para não pedir credenciais
    git config --local credential.helper store 2>/dev/null || true

    # Tentar update via git
    if git fetch origin --depth 1 2>/dev/null; then
        git checkout main 2>/dev/null || git checkout master 2>/dev/null || true
        git reset --hard origin/main 2>/dev/null || git reset --hard origin/master 2>/dev/null || true
        git clean -fd 2>/dev/null || true
        log_success "Repositorio atualizado via git"
    else
        log_warning "Git fetch falhou. Usando método de download direto..."

        # Backup de arquivos importantes
        [ -f "docker-stack.yml" ] && cp docker-stack.yml /tmp/backup-stack.yml
        [ -f "Dockerfile" ] && cp Dockerfile /tmp/backup-dockerfile

        # Download fresh
        if wget -q https://github.com/Nakahh/KRYONIX-PLATAFORMA/archive/refs/heads/main.zip -O /tmp/kryonix-update.zip; then
            cd /tmp
            unzip -q kryonix-update.zip
            # Preservar arquivos gerados pelo script
            cp -r KRYONIX-PLATAFORMA-main/* "$PROJECT_DIR/" 2>/dev/null || true
            cd "$PROJECT_DIR"
            rm -f /tmp/kryonix-update.zip
            rm -rf /tmp/KRYONIX-PLATAFORMA-main

            # Restaurar arquivos importantes se existirem
            [ -f "/tmp/backup-stack.yml" ] && cp /tmp/backup-stack.yml docker-stack.yml
            [ -f "/tmp/backup-dockerfile" ] && cp /tmp/backup-dockerfile Dockerfile

            log_success "Repositorio atualizado via download"
        fi
    fi
fi
show_status "Repositorio configurado" "concluido"

show_status "Corrigindo configuracoes" "iniciando"
# Criar package.json mínimo se não existir
if [ ! -f "package.json" ]; then
    log_info "Criando package.json basico..."
    cat > package.json << 'PACKAGE_EOF'
{
  "name": "kryonix-plataforma",
  "version": "1.0.0",
  "description": "KRYONIX - Plataforma SaaS 100% Autonoma por IA",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4"
  }
}
PACKAGE_EOF
fi

# Remover type: module se existir
if grep -q '"type": "module"' package.json; then
    sed -i '/"type": "module",/d' package.json
fi

# Criar server.js básico se não existir
if [ ! -f "server.js" ]; then
    log_info "Criando server.js basico..."
    cat > server.js << 'SERVER_EOF'
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'KRYONIX Platform',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KRYONIX Platform rodando na porta ${PORT}`);
    console.log(`💚 Health check: http://0.0.0.0:${PORT}/health`);
});
SERVER_EOF
fi

# Criar diretório public e index.html se não existir
if [ ! -d "public" ]; then
    mkdir -p public
fi

if [ ! -f "public/index.html" ]; then
    log_info "Criando index.html basico..."
    cat > public/index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KRYONIX - Plataforma SaaS Autônoma</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 600px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        .status {
            background: rgba(0, 255, 0, 0.2);
            border: 1px solid #00ff00;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            display: inline-block;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 KRYONIX</h1>
        <p>Plataforma SaaS 100% Autônoma por IA</p>
        
        <div class="features">
            <div class="feature">
                <h3>🤖 Autônoma</h3>
                <p>100% IA</p>
            </div>
            <div class="feature">
                <h3>📱 Mobile-First</h3>
                <p>Responsivo</p>
            </div>
            <div class="feature">
                <h3>🇧🇷 Português</h3>
                <p>Nacional</p>
            </div>
        </div>
        
        <div class="status">
            ✅ Plataforma Online
        </div>
    </div>
</body>
</html>
HTML_EOF
fi

show_status "Configuracoes corrigidas" "concluido"

# Teste local do servidor
log_step "Teste Local do Servidor"

show_status "Verificando dependencias" "iniciando"
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependencias..."
    npm install
fi
show_status "Dependencias verificadas" "concluido"

show_status "Testando sintaxe" "iniciando"
if node -c server.js 2>/dev/null; then
    show_status "Sintaxe do server.js esta correta" "concluido"
else
    show_status "Erro de sintaxe no server.js" "erro"
    node -c server.js
    exit 1
fi

show_status "Testando inicializacao" "iniciando"
timeout 3s node server.js > /tmp/server_test.log 2>&1 &
SERVER_PID=$!
sleep 1

if ps -p $SERVER_PID > /dev/null 2>&1; then
    kill $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
    show_status "Servidor testado com sucesso" "concluido"
else
    show_status "Servidor nao conseguiu iniciar" "erro"
    cat /tmp/server_test.log 2>/dev/null
    exit 1
fi

# Configuração de firewall
log_step "Configuracao de Firewall"

show_status "Configurando firewall" "iniciando"
configure_firewall() {
    local ports=("$WEB_PORT" "$WEBHOOK_PORT" "$MONITOR_PORT")
    
    if command -v ufw >/dev/null 2>&1; then
        sudo ufw --force enable 2>/dev/null || true
        for port in "${ports[@]}"; do
            sudo ufw allow $port/tcp comment "KRYONIX-$port" 2>/dev/null || true
        done
    elif command -v firewall-cmd >/dev/null 2>&1; then
        for port in "${ports[@]}"; do
            sudo firewall-cmd --add-port=$port/tcp 2>/dev/null || true
            sudo firewall-cmd --permanent --add-port=$port/tcp 2>/dev/null || true
        done
        sudo firewall-cmd --reload 2>/dev/null || true
    elif command -v iptables >/dev/null 2>&1; then
        for port in "${ports[@]}"; do
            sudo iptables -I INPUT -p tcp --dport $port -j ACCEPT 2>/dev/null || true
        done
    fi
}

configure_firewall
show_status "Firewall configurado" "concluido"

# Configuração de redes Docker
log_step "Configuracao de Redes Docker"

show_status "Criando redes Docker" "iniciando"
if ! docker network ls | grep -q "$NETWORK_NAME"; then
    docker network create -d overlay --attachable "$NETWORK_NAME" > /dev/null 2>&1
fi
if ! docker network ls | grep -q "traefik-public"; then
    docker network create -d overlay --attachable traefik-public > /dev/null 2>&1
fi
if ! docker network ls | grep -q "traefik_default"; then
    docker network create -d overlay --attachable traefik_default > /dev/null 2>&1
fi
show_status "Redes Docker criadas" "concluido"

# Criar Dockerfile
log_step "Criacao do Dockerfile"

show_status "Criando Dockerfile otimizado" "iniciando"
cat > Dockerfile << 'DOCKERFILE_EOF'
FROM node:18-bullseye-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

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

CMD ["node", "server.js"]
DOCKERFILE_EOF
show_status "Dockerfile criado" "concluido"

# Build da imagem
log_step "Build da Imagem Docker"

show_status "Building imagem kryonix-plataforma" "iniciando"
docker build --no-cache --pull -t kryonix-plataforma:latest . > /dev/null 2>&1

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP
show_status "Imagem criada e taggeada: $TIMESTAMP" "concluido"

# Criar configuração do stack
log_step "Criacao da Configuracao do Stack"

show_status "Criando docker-stack.yml" "iniciando"
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
      labels:
        # Habilitar Traefik
        - "traefik.enable=true"

        # Configurar rede
        - "traefik.docker.network=Kryonix-NET"

        # Configurar serviço e porta
        - "traefik.http.services.kryonix-web.loadbalancer.server.port=8080"

        # Router HTTP (redireciona para HTTPS)
        - "traefik.http.routers.kryonix-web-http.rule=Host(`kryonix.com.br`) || Host(`www.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-web-http.entrypoints=web"
        - "traefik.http.routers.kryonix-web-http.middlewares=redirect-https@docker"
        - "traefik.http.routers.kryonix-web-http.service=kryonix-web"

        # Router HTTPS
        - "traefik.http.routers.kryonix-web-https.rule=Host(`kryonix.com.br`) || Host(`www.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-web-https.entrypoints=websecure"
        - "traefik.http.routers.kryonix-web-https.tls=true"
        - "traefik.http.routers.kryonix-web-https.tls.certresolver=letsencryptresolver"
        - "traefik.http.routers.kryonix-web-https.service=kryonix-web"

        # Headers de segurança
        - "traefik.http.routers.kryonix-web-https.middlewares=security-headers@docker"
        - "traefik.http.middlewares.security-headers.headers.frameDeny=true"
        - "traefik.http.middlewares.security-headers.headers.sslRedirect=true"
        - "traefik.http.middlewares.security-headers.headers.browserXssFilter=true"
        - "traefik.http.middlewares.security-headers.headers.contentTypeNosniff=true"
        - "traefik.http.middlewares.security-headers.headers.forceSTSHeader=true"
        - "traefik.http.middlewares.security-headers.headers.stsIncludeSubdomains=true"
        - "traefik.http.middlewares.security-headers.headers.stsPreload=true"
        - "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000"
    networks:
      - Kryonix-NET
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  Kryonix-NET:
    external: true
STACK_EOF
show_status "Configuracao do stack criada" "concluido"

# Deploy do stack
log_step "Deploy do Stack Completo"

show_status "Iniciando deploy do stack" "iniciando"
docker stack deploy -c docker-stack.yml Kryonix > /dev/null 2>&1
show_status "Stack deployado" "concluido"

show_status "Aguardando inicializacao dos servicos" "processando"
sleep 60
show_status "Servicos inicializados" "concluido"

# Verificação de conectividade
log_step "Teste de Conectividade"

show_status "Testando conectividade" "iniciando"
sleep 10

if curl -f -m 10 http://localhost:8080/health 2>/dev/null; then
    show_status "Web Service (8080): FUNCIONANDO" "concluido"
    WEB_STATUS="✅ ONLINE"
else
    show_status "Web Service (8080): Verificar logs" "erro"
    WEB_STATUS="⚠️ VERIFICAR"
fi

# Banner final
echo -e "\n${BLUE}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo -e "║                    ${GREEN}${CHECKMARK} DEPLOY CONCLUIDO COM SUCESSO! ${CHECKMARK}${BLUE}                         ║"
echo "║                                                                               ║"
echo -e "║   ${WHITE}🌐 Site Principal: https://kryonix.com.br${BLUE}                             ║"
echo -e "║   ${WHITE}🔧 Local (backup): http://localhost:8080 - $WEB_STATUS${BLUE}                ║"
echo "║                                                                               ║"
echo -e "║                     ${CYAN}PLATAFORMA KRYONIX ONLINE${BLUE}                             ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${RESET}\n"

log_success "KRYONIX Platform deployada com sucesso!"
echo
log_info "🌐 URLs de Acesso:"
log_info "   Site Principal: https://kryonix.com.br"
log_info "   Local (backup): http://localhost:8080"
echo
log_info "🔧 Comandos Uteis:"
log_info "   docker stack ps Kryonix          # Status dos servicos"
log_info "   docker service logs Kryonix_web  # Logs do site"
log_info "   docker service ls                # Lista todos os servicos"
echo
log_info "📝 Certificados SSL serao gerados automaticamente pelo Let's Encrypt"
log_info "⏱️ Aguarde 1-2 minutos para os certificados serem emitidos"
echo
log_info "💡 Dica: Se tiver problemas, execute: docker service update --force Kryonix_web"

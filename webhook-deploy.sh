#!/bin/bash

set -euo pipefail

# Configurações
STACK_NAME="Kryonix"
DEPLOY_PATH="/opt/kryonix-plataform"
LOG_FILE="/var/log/kryonix-deploy.log"
MAX_RETRIES=3
HEALTH_CHECK_TIMEOUT=120

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    local message="${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo -e "$message"

    # Tentar escrever no log do sistema primeiro, depois local
    {
        echo -e "$message" >> "$LOG_FILE" 2>/dev/null || \
        echo -e "$message" >> "./deploy.log" 2>/dev/null || \
        echo -e "$message" >> "/tmp/kryonix-deploy.log" 2>/dev/null || \
        true
    }
}

info() {
    local message="${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
    echo -e "$message"
    echo -e "$message" >> "$LOG_FILE" 2>/dev/null || echo -e "$message" >> "./deploy.log" 2>/dev/null || true
}

error() {
    local message="${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    echo -e "$message"
    echo -e "$message" >> "$LOG_FILE" 2>/dev/null || echo -e "$message" >> "./deploy.log" 2>/dev/null || true
}

warning() {
    local message="${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
    echo -e "$message"
    echo -e "$message" >> "$LOG_FILE" 2>/dev/null || echo -e "$message" >> "./deploy.log" 2>/dev/null || true
}

# Função para verificar se o serviço está saudável
check_service_health() {
    local max_attempts=${1:-12}
    local wait_time=${2:-10}

    info "🔍 Verificando saúde do serviço..."

    for i in $(seq 1 $max_attempts); do
        if curl -f -s -m 10 "http://localhost:8080/health" >/dev/null 2>&1; then
            log "✅ Serviço está saudável!"
            return 0
        fi

        if [ $i -lt $max_attempts ]; then
            info "Tentativa $i/$max_attempts - aguardando ${wait_time}s..."
            sleep $wait_time
        fi
    done

    warning "⚠️ Serviço pode não estar totalmente saudável após $max_attempts tentativas"
    return 1
}

# Função para restart forçado do stack
force_restart_stack() {
    info "🔄 Forçando restart completo do stack..."

    # Parar o stack
    docker stack rm "$STACK_NAME" 2>/dev/null || true

    # Aguardar remoção completa
    info "⏳ Aguardando remoção completa do stack..."
    sleep 30

    # Verificar se todos os serviços foram removidos
    for i in {1..10}; do
        if ! docker service ls --format "{{.Name}}" | grep -q "${STACK_NAME}_"; then
            break
        fi
        info "Aguardando remoção dos serviços... (tentativa $i/10)"
        sleep 10
    done

    # Redeployar o stack
    info "🚀 Redesployando stack..."
    docker stack deploy -c docker-stack.yml "$STACK_NAME"

    # Aguardar estabilização
    sleep 45

    return 0
}

deploy() {
    local payload="$1"

    log "🚀 Iniciando deploy automatico do KRYONIX Platform..."

    cd "$DEPLOY_PATH"

    # Corrigir ownership do Git antes de fazer pull
    info "🔧 Corrigindo permissoes Git..."
    git config --global --add safe.directory "$DEPLOY_PATH" 2>/dev/null || true
    sudo git config --system --add safe.directory "$DEPLOY_PATH" 2>/dev/null || true

    # Configurar credenciais do GitHub
    info "🔑 Configurando credenciais GitHub..."
    git remote set-url origin "https://Nakahh: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@github.com/Nakahh/KRYONIX-PLATAFORMA.git"

    # Pull das mudancas
    info "📥 Fazendo pull do repositorio..."
    git fetch origin --force
    git reset --hard origin/main || git reset --hard origin/master
    git clean -fd
    
    # Instalar dependencias e executar build
    info "📦 Instalando dependencias..."
    if [ -f "yarn.lock" ]; then
        yarn install
        info "🏗️ Executando yarn build (Builder.io)..."
        yarn build 2>/dev/null || npm run build 2>/dev/null || info "ℹ️ Sem script de build"
    else
        npm install
        info "🏗️ Executando npm run build (Builder.io)..."
        npm run build 2>/dev/null || info "ℹ️ Sem script de build"
    fi

    # Verificar se existe pasta dist/build gerada
    if [ -d "dist" ]; then
        info "📁 Build gerado em ./dist/"
        cp -r dist/* public/ 2>/dev/null || true
    elif [ -d "build" ]; then
        info "���� Build gerado em ./build/"
        cp -r build/* public/ 2>/dev/null || true
    elif [ -d ".next" ]; then
        info "📁 Build Next.js gerado"
    fi
    
    # Limpar imagem antiga para garantir rebuild completo
    info "🧹 Limpando imagem antiga..."
    docker rmi kryonix-plataforma:latest 2>/dev/null || true

    # Build da imagem
    info "🏗️ Fazendo build da imagem..."
    docker build --no-cache -t kryonix-plataforma:latest .
    
    # Deploy do stack
    info "🐳 Atualizando Docker Stack..."
    docker stack deploy -c docker-stack.yml "$STACK_NAME"
    
    # Aguardar servicos
    sleep 30
    
    # Verificar health
    info "🔍 Verificando health da aplicacao..."
    for i in {1..30}; do
        if curl -f -s "http://localhost:8080/health" > /dev/null; then
            log "✅ Deploy automatico concluido com sucesso!"
            return 0
        fi
        sleep 10
    done
    
    error "⚠️ Deploy pode ter problemas - verificar manualmente"
}

main() {
    case "${1:-}" in
        "webhook")
            local payload="${2:-}"
            if [ ! -z "$payload" ]; then
                deploy "$payload"
            fi
            ;;
        "manual")
            deploy '{"ref":"refs/heads/main","repository":"manual"}'
            ;;
        *)
            echo "Uso: $0 {webhook|manual}"
            ;;
    esac
}

main "$@"

#!/bin/bash

set -euo pipefail

# Configuracoes
STACK_NAME="Kryonix"
DEPLOY_PATH="/opt/kryonix-plataform"
LOG_FILE="/var/log/kryonix-deploy.log"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

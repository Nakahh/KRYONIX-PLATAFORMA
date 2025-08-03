#!/bin/bash

set -euo pipefail

# Configurações KRYONIX - FUNCIONAL DO INSTALADOR ANTIGO
STACK_NAME="Kryonix"
DEPLOY_PATH="/opt/kryonix-plataform"
LOG_FILE="/var/log/kryonix-deploy.log"
GITHUB_REPO="https://Nakahh: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@github.com/Nakahh/KRYONIX-PLATAFORMA.git"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    local message="${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo -e "$message"
    echo -e "$message" >> "$LOG_FILE" 2>/dev/null || echo -e "$message" >> "./deploy.log" 2>/dev/null || true
}

# Auto-update dependencies function - FUNCIONAL DO INSTALADOR ANTIGO
auto_update_dependencies() {
    log "📦 Atualizando dependências automaticamente..."

    # Backup
    cp package.json package.json.backup || true

    # Install npm-check-updates if not exists
    if ! command -v ncu >/dev/null 2>&1; then
        log "📦 Instalando npm-check-updates..."
        npm install -g npm-check-updates >/dev/null 2>&1 || true
    fi

    # Update dependencies
    if command -v ncu >/dev/null 2>&1; then
        log "🔄 Verificando atualizações disponíveis..."
        ncu --upgrade --target minor >/dev/null 2>&1 || true
        log "✅ Dependências atualizadas para versões compatíveis"
    fi

    # Clean and reinstall
    log "🧹 Limpando cache e reinstalando..."
    npm cache clean --force >/dev/null 2>&1 || true
    rm -rf node_modules package-lock.json 2>/dev/null || true

    if npm install --production --no-audit --no-fund; then
        log "✅ Dependências instaladas com sucesso"
    else
        log "⚠️ Problemas na instalação, restaurando backup..."
        cp package.json.backup package.json || true
        npm install --production >/dev/null 2>&1 || true
    fi
}

deploy() {
    log "🚀 Iniciando deploy automático KRYONIX com nuclear cleanup..."

    # CORREÇÃO: Nuclear cleanup para garantir versão mais recente
    log "🧹 Nuclear cleanup para garantir versão mais recente..."

    # Parar processos
    sudo pkill -f "$DEPLOY_PATH" 2>/dev/null || true

    # Remover TUDO do diretório (incluindo .git)
    cd /opt
    sudo rm -rf kryonix-plataform

    log "📥 Clone FRESH da versão mais recente..."

    # Configurar Git e credenciais para repositório privado
    git config --global user.name "KRYONIX Deploy" 2>/dev/null || true
    git config --global user.email "deploy@kryonix.com.br" 2>/dev/null || true
    git config --global --add safe.directory "$DEPLOY_PATH" 2>/dev/null || true
    git config --global credential.helper store 2>/dev/null || true

    # Configurar credenciais para repositório privado
    echo "https://Nakahh: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@github.com" > ~/.git-credentials
    chmod 600 ~/.git-credentials

    # Clone fresh completo (repositório privado)
    if git clone --single-branch --branch main --depth 1 "https://github.com/Nakahh/KRYONIX-PLATAFORMA.git" kryonix-plataform; then
        log "✅ Clone fresh concluído"
    else
        log "⚠️ Clone com credenciais store falhou, tentando com token na URL..."
        # Fallback: token diretamente na URL
        if git clone --single-branch --branch main --depth 1 "https://Nakahh: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@github.com/Nakahh/KRYONIX-PLATAFORMA.git" kryonix-plataform; then
            log "✅ Clone fresh concluído com fallback"
        else
            log "❌ Falha no clone fresh com todos os métodos"
            return 1
        fi
    fi

    cd "$DEPLOY_PATH"

    # Verificar se é a versão mais recente
    current_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
    current_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "N/A")
    remote_commit=$(git ls-remote origin HEAD 2>/dev/null | cut -f1 | head -c 8 || echo "unknown")

    log "📌 Commit local: $current_commit"
    log "🌐 Commit remoto: $remote_commit"
    log "📝 Mensagem: $current_msg"

    # Verificar se tem arquivos necessários
    if [ ! -f "webhook-listener.js" ] || [ ! -f "kryonix-monitor.js" ]; then
        log "❌ Arquivos de serviços faltando após clone!"
        return 1
    fi

    # NOVA FUNCIONALIDADE: Auto-update de dependências
    auto_update_dependencies

    # Verificar se tem arquivos necessários
    if [ ! -f "package.json" ]; then
        log "❌ package.json faltando após clone!"
        return 1
    fi

    # Verificar dependências críticas
    log "🔍 Verificando dependências críticas..."
    if [ -f "check-dependencies.js" ]; then
        if node check-dependencies.js; then
            log "✅ Verificação de dependências passou"
        else
            log "⚠️ Problemas nas dependências, tentando correção..."
            if [ -f "fix-dependencies.js" ]; then
                node fix-dependencies.js || true
            fi
        fi
    fi

    # Instalar dependências
    log "📦 Instalando dependências..."
    npm install --production

    # Rebuild da imagem
    log "🏗️ Fazendo rebuild da imagem Docker..."
    docker build --no-cache -t kryonix-plataforma:latest .

    # Deploy do stack
    log "🚀 Fazendo deploy do stack KRYONIX..."
    docker stack deploy -c docker-stack.yml "$STACK_NAME"

    sleep 60

    # Verificar health de todos os serviços
    log "🔍 Verificando health dos serviços KRYONIX..."

    services_ok=0
    total_services=3

    for port in 8080 8082 8084; do
        if curl -f -s "http://localhost:$port/health" > /dev/null; then
            log "✅ Serviço KRYONIX na porta $port funcionando"
            services_ok=$((services_ok + 1))
        else
            log "⚠️ Serviço KRYONIX na porta $port com problemas"
        fi
    done

    if [ $services_ok -eq $total_services ]; then
        log "🎉 Deploy KRYONIX concluído com SUCESSO! ($services_ok/$total_services serviços OK)"
    else
        log "⚠️ Deploy KRYONIX com problemas ($services_ok/$total_services serviços OK)"
    fi

    # Testar webhook externamente
    if curl -f -s -X POST "https://kryonix.com.br/api/github-webhook" \
       -H "Content-Type: application/json" \
       -d '{"test":true,"ref":"refs/heads/main"}' >/dev/null 2>&1; then
        log "🌐 Webhook externo KRYONIX funcionando!"
    else
        log "⚠️ Webhook externo KRYONIX pode ter problemas"
    fi
}

case "${1:-}" in
    "webhook")
        deploy
        ;;
    "manual")
        deploy
        ;;
    *)
        echo "Uso: $0 {webhook|manual}"
        ;;
esac

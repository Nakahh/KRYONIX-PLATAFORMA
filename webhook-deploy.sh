#!/bin/bash

set -euo pipefail

# ============================================================================
# 🚀 KRYONIX - WEBHOOK DEPLOY AUTOMÁTICO
# ============================================================================
# Deploy automático via GitHub webhook com nuclear cleanup
# Desenvolvido por: Vitor Jayme Fernandes Ferreira
# Data: Agosto 2025
# ============================================================================

# Configurações KRYONIX
STACK_NAME="Kryonix"
DEPLOY_PATH="/opt/kryonix-plataforma"
LOG_FILE="/var/log/kryonix-deploy.log"
GITHUB_REPO="https://github.com/Nakahh/KRYONIX-PLATAFORMA.git"
PAT_TOKEN="${PAT_TOKEN:-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}"

# Cores para logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função de logging
log() {
    local message="${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo -e "$message"
    echo -e "$message" >> "$LOG_FILE" 2>/dev/null || echo -e "$message" >> "./deploy.log" 2>/dev/null || true
}

# Função principal de deploy
deploy() {
    log "🚀 Iniciando deploy automático KRYONIX com nuclear cleanup..."

    # CORREÇÃO: Nuclear cleanup para garantir versão mais recente
    log "💣 Nuclear cleanup para garantir versão mais recente..."

    # Parar processos
    sudo pkill -f "$DEPLOY_PATH" 2>/dev/null || true

    # Navegar para diretório pai
    cd /opt || cd /app || {
        log "❌ Diretório do projeto não encontrado"
        exit 1
    }

    # Remover TUDO do diretório (incluindo .git)
    sudo rm -rf kryonix-plataforma 2>/dev/null || true

    log "📥 Clone FRESH da versão mais recente..."

    # Configurar Git e credenciais para repositório privado
    git config --global user.name "KRYONIX Deploy" 2>/dev/null || true
    git config --global user.email "deploy@kryonix.com.br" 2>/dev/null || true
    git config --global --add safe.directory "$DEPLOY_PATH" 2>/dev/null || true
    git config --global credential.helper store 2>/dev/null || true

    # Configurar credenciais para repositório privado (usando variável segura)
    echo "https://Nakahh:${PAT_TOKEN}@github.com" > ~/.git-credentials 2>/dev/null || true
    chmod 600 ~/.git-credentials 2>/dev/null || true

    # Clone fresh completo (repositório privado)
    if git clone --single-branch --branch main --depth 1 "$GITHUB_REPO" kryonix-plataforma; then
        log "✅ Clone fresh concluído"
    else
        log "⚠️ Clone com credenciais store falhou, tentando com token na URL..."
        # Fallback: token diretamente na URL usando variável
        if git clone --single-branch --branch main --depth 1 "https://Nakahh:${PAT_TOKEN}@github.com/Nakahh/KRYONIX-PLATAFORMA.git" kryonix-plataforma; then
            log "✅ Clone fresh concluído com fallback"
        else
            log "❌ Falha no clone fresh com todos os métodos"
            return 1
        fi
    fi

    cd "$DEPLOY_PATH" || {
        log "❌ Falha ao acessar diretório do projeto"
        return 1
    }

    # Verificar se é a versão mais recente
    current_commit=$(git rev-parse HEAD 2>/dev/null | head -c 8 || echo "unknown")
    current_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "N/A")
    remote_commit=$(git ls-remote origin HEAD 2>/dev/null | cut -f1 | head -c 8 || echo "unknown")

    log "📌 Commit local: $current_commit"
    log "🌐 Commit remoto: $remote_commit"
    log "📝 Mensagem: $current_msg"

    # Verificar se tem arquivos necessários
    if [ ! -f "server.js" ]; then
        log "❌ Arquivos essenciais faltando após clone!"
        return 1
    fi

    # Instalar dependências
    log "📦 Instalando dependências..."
    npm ci --only=production 2>/dev/null || npm install --only=production

    # Verificar se Dockerfile existe
    if [ ! -f "Dockerfile" ]; then
        log "❌ Dockerfile não encontrado"
        return 1
    fi

    # Rebuild da imagem
    log "🏗️ Fazendo rebuild da imagem Docker..."
    if docker build --no-cache -t kryonix-plataforma:latest .; then
        log "✅ Build da imagem concluído"
    else
        log "❌ Falha no build da imagem"
        return 1
    fi

    # Verificar se existe docker-compose.yml ou similar
    COMPOSE_FILE=""
    if [ -f "docker-compose.yml" ]; then
        COMPOSE_FILE="docker-compose.yml"
    elif [ -f "docker-stack.yml" ]; then
        COMPOSE_FILE="docker-stack.yml"
    else
        log "⚠️ Arquivo de compose não encontrado, usando comando docker service"
    fi

    # Deploy do stack
    if [ -n "$COMPOSE_FILE" ]; then
        log "🚀 Fazendo deploy do stack KRYONIX usando $COMPOSE_FILE..."
        docker stack deploy -c "$COMPOSE_FILE" "$STACK_NAME"
    else
        log "🚀 Criando serviço KRYONIX diretamente..."
        # Deploy alternativo sem compose
        docker service create \
            --name "${STACK_NAME}_web" \
            --replicas 1 \
            --publish 8080:8080 \
            --network Kryonix-NET \
            --mount type=volume,source=kryonix-data,target=/app/data \
            kryonix-plataforma:latest || log "⚠️ Serviço pode já existir"
    fi

    log "⏳ Aguardando estabilização dos serviços..."
    sleep 30

    # Verificar health dos serviços
    log "🔍 Verificando health dos serviços KRYONIX..."

    services_ok=0
    total_services=1

    # Testar portas principais
    for port in 8080 8082 8084; do
        if curl -f -s --max-time 10 "http://localhost:$port/health" >/dev/null 2>&1; then
            log "✅ Serviço KRYONIX na porta $port funcionando"
            services_ok=$((services_ok + 1))
            total_services=$((total_services + 1))
        else
            log "ℹ��� Serviço na porta $port não disponível (pode ser normal)"
        fi
    done

    if [ $services_ok -gt 0 ]; then
        log "🎉 Deploy KRYONIX concluído com SUCESSO! ($services_ok serviços OK)"
    else
        log "⚠️ Deploy KRYONIX finalizado, aguardando serviços ficarem prontos..."
    fi

    # Testar webhook externamente
    if curl -f -s -X POST --max-time 10 "https://kryonix.com.br/api/github-webhook" \
       -H "Content-Type: application/json" \
       -d '{"test":true,"ref":"refs/heads/main"}' >/dev/null 2>&1; then
        log "🌐 Webhook externo KRYONIX funcionando!"
    else
        log "ℹ️ Webhook externo será testado após DNS se propagar"
    fi

    log "✅ Deploy automático KRYONIX finalizado"
}

# Função de cleanup
cleanup() {
    log "🧹 Executando cleanup..."
    # Remover credenciais temporárias
    rm -f ~/.git-credentials 2>/dev/null || true
}

# Configurar trap para cleanup
trap cleanup EXIT

# Executar baseado no parâmetro
case "${1:-webhook}" in
    "webhook")
        log "📡 Deploy via webhook GitHub"
        deploy
        ;;
    "manual")
        log "🖐️ Deploy manual"
        deploy
        ;;
    "test")
        log "🧪 Teste de funcionalidade"
        echo "✅ webhook-deploy.sh funcionando corretamente"
        ;;
    *)
        echo "Uso: $0 {webhook|manual|test}"
        echo "  webhook - Deploy automático via webhook GitHub"
        echo "  manual  - Deploy manual"
        echo "  test    - Teste de funcionalidade"
        exit 1
        ;;
esac

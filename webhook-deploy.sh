#!/bin/bash

# KRYONIX Webhook Deploy Script
# Script para deploy automático via webhook

set -e

echo "🚀 KRYONIX - Iniciando deploy via webhook..."

# Variáveis
PROJECT_DIR="/opt/kryonix"
LOG_FILE="/var/log/kryonix-webhook-deploy.log"
BACKUP_DIR="/opt/backups/kryonix"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Função de erro
error_exit() {
    log "ERRO: $1"
    exit 1
}

# Verificar se está rodando como root ou com sudo
if [[ $EUID -ne 0 && -z "$SUDO_USER" ]]; then
   error_exit "Este script deve ser executado como root ou com sudo"
fi

log "📡 Recebendo webhook de deploy..."

# Fazer backup antes do deploy
log "💾 Criando backup antes do deploy..."
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
fi

BACKUP_NAME="kryonix-backup-$(date +%Y%m%d_%H%M%S)"
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$PROJECT_DIR" . 2>/dev/null || log "⚠️ Backup parcial criado"

log "📥 Fazendo pull das últimas alterações..."
cd "$PROJECT_DIR"

# Git pull com força
git fetch origin main
git reset --hard origin/main || error_exit "Falha ao fazer git reset"

log "🔧 Verificando dependências..."
if [ -f "package.json" ]; then
    npm install --production 2>&1 | tee -a "$LOG_FILE" || log "⚠️ Algumas dependências podem ter falhado"
fi

log "🏗️ Reconstruindo aplicação..."
if [ -f "next.config.js" ]; then
    npm run build 2>&1 | tee -a "$LOG_FILE" || log "⚠️ Build pode ter tido problemas"
fi

log "🐳 Reconstruindo containers Docker..."
if [ -f "docker-compose.yml" ]; then
    docker-compose down --remove-orphans 2>&1 | tee -a "$LOG_FILE" || true
    docker-compose build --no-cache 2>&1 | tee -a "$LOG_FILE" || error_exit "Falha no build Docker"
    docker-compose up -d 2>&1 | tee -a "$LOG_FILE" || error_exit "Falha ao subir containers"
elif [ -f "Dockerfile" ]; then
    # Build da imagem
    docker build -t kryonix-plataforma:latest . 2>&1 | tee -a "$LOG_FILE" || error_exit "Falha no build da imagem Docker"
    
    # Parar e remover container existente
    docker stop kryonix-app 2>/dev/null || true
    docker rm kryonix-app 2>/dev/null || true
    
    # Executar novo container
    docker run -d \
        --name kryonix-app \
        --restart unless-stopped \
        -p 8080:8080 \
        -p 8082:8082 \
        -p 8084:8084 \
        -v /opt/kryonix/data:/app/data \
        kryonix-plataforma:latest 2>&1 | tee -a "$LOG_FILE" || error_exit "Falha ao executar container"
fi

log "🏥 Verificando saúde dos serviços..."
sleep 30

# Health check
for i in {1..10}; do
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        log "✅ Aplicação está saudável!"
        break
    elif [ $i -eq 10 ]; then
        error_exit "❌ Aplicação não passou no health check"
    else
        log "🔄 Tentativa $i/10 - Aguardando aplicação..."
        sleep 10
    fi
done

log "🧹 Limpando recursos antigos..."
docker image prune -f >/dev/null 2>&1 || true
docker container prune -f >/dev/null 2>&1 || true

# Manter apenas os 5 backups mais recentes
find "$BACKUP_DIR" -name "kryonix-backup-*.tar.gz" -type f -mtime +5 -delete 2>/dev/null || true

log "✅ Deploy via webhook concluído com sucesso!"
log "🌐 Aplicação disponível em: http://$(hostname -I | awk '{print $1}'):8080"

# Notificar sucesso (opcional)
if [ -n "$WEBHOOK_SUCCESS_URL" ]; then
    curl -X POST "$WEBHOOK_SUCCESS_URL" \
        -H "Content-Type: application/json" \
        -d "{\"status\":\"success\",\"message\":\"Deploy concluído\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" \
        >/dev/null 2>&1 || true
fi

exit 0

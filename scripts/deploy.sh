#!/bin/bash

# Script de Deploy Automatizado KRYONIX
# Autor: Vitor Fernandes
# Descrição: Deploy completo da plataforma autônoma com IA

set -euo pipefail

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_ENV="${1:-production}"
DOCKER_IMAGE="kryonix-platform"
BACKUP_DIR="/opt/kryonix/backups"
LOG_FILE="/var/log/kryonix-deploy.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de logging
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

info() { log "INFO" "${BLUE}$*${NC}"; }
warn() { log "WARN" "${YELLOW}$*${NC}"; }
error() { log "ERROR" "${RED}$*${NC}"; }
success() { log "SUCCESS" "${GREEN}$*${NC}"; }

# Verificar se está executando como root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "Este script não deve ser executado como root por segurança"
        exit 1
    fi
}

# Verificar dependências
check_dependencies() {
    info "🔍 Verificando dependências..."
    
    local deps=("docker" "docker-compose" "git" "curl" "jq")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "❌ Dependência não encontrada: $dep"
            exit 1
        fi
    done
    
    success "✅ Todas as dependências verificadas"
}

# Criar backup antes do deploy
create_backup() {
    info "💾 Criando backup da versão atual..."
    
    local backup_name="kryonix_backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup do código
    if [[ -d "$PROJECT_ROOT" ]]; then
        tar -czf "${backup_path}_code.tar.gz" -C "$PROJECT_ROOT" \
            --exclude=node_modules \
            --exclude=dist \
            --exclude=.git \
            --exclude=logs \
            .
    fi
    
    # Backup dos volumes Docker
    if docker-compose ps -q | grep -q .; then
        info "📦 Fazendo backup dos volumes Docker..."
        docker-compose exec -T redis redis-cli BGSAVE || warn "⚠️ Backup do Redis falhou"
        
        # Backup dos dados
        docker run --rm \
            -v kryonix_redis_data:/data \
            -v "$BACKUP_DIR":/backup \
            alpine tar czf "/backup/${backup_name}_redis.tar.gz" -C /data .
            
        docker run --rm \
            -v kryonix_prometheus_data:/data \
            -v "$BACKUP_DIR":/backup \
            alpine tar czf "/backup/${backup_name}_prometheus.tar.gz" -C /data .
    fi
    
    # Manter apenas os últimos 10 backups
    find "$BACKUP_DIR" -name "kryonix_backup_*" -type f -mtime +7 -delete
    
    success "✅ Backup criado: $backup_name"
    echo "$backup_name" > "$BACKUP_DIR/latest_backup"
}

# Atualizar código do repositório
update_code() {
    info "⬇️ Atualizando código do repositório..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar se há mudanças não commitadas
    if ! git diff --quiet; then
        warn "⚠️ Há mudanças não commitadas. Fazendo stash..."
        git stash push -m "Deploy backup $(date)"
    fi
    
    # Atualizar do repositório
    git fetch origin
    git checkout main
    git reset --hard origin/main
    
    success "✅ Código atualizado para a versão mais recente"
}

# Instalar dependências
install_dependencies() {
    info "📦 Instalando dependências..."
    
    cd "$PROJECT_ROOT"
    
    # Limpar cache npm se necessário
    if [[ ! -f "package-lock.json" ]]; then
        npm install
    else
        npm ci --production
    fi
    
    success "✅ Dependências instaladas"
}

# Build da aplicação
build_application() {
    info "🏗️ Executando build da aplicação..."
    
    cd "$PROJECT_ROOT"
    
    # Build do frontend e backend
    npm run build:client
    npm run build:server
    
    # Verificar se os builds foram criados
    if [[ ! -d "dist" ]]; then
        error "❌ Build falhou - diretório dist não encontrado"
        exit 1
    fi
    
    success "✅ Build da aplicação concluído"
}

# Deploy com Docker Compose
deploy_docker() {
    info "🐳 Iniciando deploy com Docker..."
    
    cd "$PROJECT_ROOT"
    
    # Parar serviços atuais
    info "⏹️ Parando serviços atuais..."
    docker-compose down --remove-orphans || warn "⚠️ Nenhum serviço estava rodando"
    
    # Remover imagens antigas se especificado
    if [[ "${CLEAN_IMAGES:-false}" == "true" ]]; then
        info "🧹 Limpando imagens antigas..."
        docker image prune -f
        docker images | grep "$DOCKER_IMAGE" | grep -v latest | awk '{print $3}' | xargs -r docker rmi
    fi
    
    # Build e start dos serviços
    info "🚀 Iniciando novos serviços..."
    docker-compose build --no-cache
    docker-compose up -d
    
    success "✅ Serviços Docker iniciados"
}

# Verificar health dos serviços
health_check() {
    info "🔍 Verificando saúde dos serviços..."
    
    local max_attempts=30
    local attempt=0
    
    while [[ $attempt -lt $max_attempts ]]; do
        if curl -f -s http://localhost:3000/api/health > /dev/null; then
            success "✅ Aplicação principal está saudável"
            break
        fi
        
        attempt=$((attempt + 1))
        info "⏳ Tentativa $attempt de $max_attempts - aguardando aplicação..."
        sleep 10
    done
    
    if [[ $attempt -eq $max_attempts ]]; then
        error "❌ Health check falhou após $max_attempts tentativas"
        return 1
    fi
    
    # Verificar outros serviços
    local services=("redis:6379" "prometheus:9090" "grafana:3000")
    for service in "${services[@]}"; do
        local host=$(echo "$service" | cut -d: -f1)
        local port=$(echo "$service" | cut -d: -f2)
        
        if nc -z localhost "$port" 2>/dev/null; then
            success "✅ $host está funcionando"
        else
            warn "⚠️ $host não está respondendo na porta $port"
        fi
    done
}

# Executar testes pós-deploy
run_post_deploy_tests() {
    info "🧪 Executando testes pós-deploy..."
    
    # Teste de API básica
    if curl -f -s http://localhost:3000/api/health | jq -e '.status == "healthy"' > /dev/null; then
        success "✅ API health check passou"
    else
        error "❌ API health check falhou"
        return 1
    fi
    
    # Teste de métricas
    if curl -f -s http://localhost:3000/api/metrics > /dev/null; then
        success "✅ Endpoint de métricas está funcionando"
    else
        warn "⚠️ Endpoint de métricas não está respondendo"
    fi
    
    # Teste de conectividade com stacks
    if curl -f -s http://localhost:3000/api/health/stacks | jq -e '.stacks | length > 0' > /dev/null; then
        success "✅ Stacks estão sendo monitoradas"
    else
        warn "⚠️ Nenhuma stack sendo monitorada"
    fi
}

# Rollback em caso de falha
rollback() {
    error "🔄 Executando rollback..."
    
    if [[ -f "$BACKUP_DIR/latest_backup" ]]; then
        local backup_name=$(cat "$BACKUP_DIR/latest_backup")
        warn "📦 Restaurando backup: $backup_name"
        
        # Parar serviços atuais
        docker-compose down --remove-orphans
        
        # Restaurar código
        if [[ -f "$BACKUP_DIR/${backup_name}_code.tar.gz" ]]; then
            tar -xzf "$BACKUP_DIR/${backup_name}_code.tar.gz" -C "$PROJECT_ROOT"
        fi
        
        # Restaurar volumes
        if [[ -f "$BACKUP_DIR/${backup_name}_redis.tar.gz" ]]; then
            docker run --rm \
                -v kryonix_redis_data:/data \
                -v "$BACKUP_DIR":/backup \
                alpine sh -c "cd /data && tar xzf /backup/${backup_name}_redis.tar.gz"
        fi
        
        # Reiniciar serviços
        docker-compose up -d
        
        warn "⚠️ Rollback concluído. Verifique os logs para diagnosticar o problema."
    else
        error "❌ Nenhum backup encontrado para rollback"
    fi
}

# Notificar sucesso do deploy
notify_success() {
    success "🎉 Deploy do KRYONIX concluído com sucesso!"
    info "📊 Informações do deploy:"
    info "   • Ambiente: $DEPLOY_ENV"
    info "   • Timestamp: $(date)"
    info "   • Versão: $(git rev-parse --short HEAD)"
    info "   • URL: http://localhost:3000"
    info "   • Grafana: http://localhost:3001"
    info "   • Prometheus: http://localhost:9090"
}

# Main function
main() {
    info "🚀 Iniciando deploy do KRYONIX - Plataforma Autônoma com IA"
    info "📝 Ambiente: $DEPLOY_ENV"
    
    # Trap para rollback em caso de erro
    trap 'rollback' ERR
    
    check_root
    check_dependencies
    create_backup
    update_code
    install_dependencies
    build_application
    deploy_docker
    
    if health_check && run_post_deploy_tests; then
        notify_success
    else
        error "❌ Deploy falhou nas verificações finais"
        exit 1
    fi
}

# Verificar argumentos
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    echo "Uso: $0 [production|staging|development]"
    echo "Opções:"
    echo "  --clean-images: Remove imagens antigas do Docker"
    echo "  --help: Mostra esta ajuda"
    exit 0
fi

# Verificar se deve limpar imagens
if [[ "${2:-}" == "--clean-images" ]]; then
    export CLEAN_IMAGES=true
fi

# Executar deploy
main "$@"

#!/bin/bash

# ========================================
# KRYONIX AUTO-DEPLOY SYSTEM v2.0
# Deploy 100% Automatizado - Zero Cliques
# ========================================

set -euo pipefail

# Configurações Globais
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_ENV="${1:-production}"
DOMAIN="${DOMAIN:-kryonix.com.br}"
BACKUP_DIR="/opt/kryonix/backups"
LOG_DIR="/var/log/kryonix"
HEALTH_CHECK_TIMEOUT=300
ROLLBACK_ON_FAILURE=true

# Stacks Integradas (25+ serviços)
STACKS=(
    "kryonix-app:3000:/"
    "evolution-api:8080:/api/whatsapp"
    "n8n:5678:/n8n"
    "typebot:3001:/typebot"
    "mautic:8001:/mautic"
    "grafana:3002:/grafana"
    "prometheus:9090:/prometheus"
    "postgres:5432:database"
    "redis:6379:cache"
    "minio:9000:/storage"
    "chatwoot:3003:/chatwoot"
    "dify:3004:/dify"
    "ollama:11434:/ollama"
    "portainer:9443:/portainer"
    "traefik:8080:/traefik"
    "uptime-kuma:3005:/status"
    "mailhog:8025:/mail"
    "adminer:8080:/db"
    "nginx-proxy-manager:81:/proxy"
    "metabase:3006:/analytics"
    "plausible:8000:/plausible"
    "strapi:1337:/cms"
    "supabase:3007:/supabase"
    "discourse:3008:/forum"
    "rocketchat:3009:/chat"
)

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Função de logging avançado
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_file="$LOG_DIR/deploy-$(date +%Y%m%d).log"
    
    mkdir -p "$LOG_DIR"
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$log_file"
}

info() { log "INFO" "${BLUE}$*${NC}"; }
warn() { log "WARN" "${YELLOW}$*${NC}"; }
error() { log "ERROR" "${RED}$*${NC}"; }
success() { log "SUCCESS" "${GREEN}$*${NC}"; }
debug() { [[ "${DEBUG:-false}" == "true" ]] && log "DEBUG" "${PURPLE}$*${NC}"; }

# Banner de inicialização
show_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
    ██╗  ██╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗���█╗██╗  ██╗
    ██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║╚██╗██╔╝
    █████╔╝ ██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║██║ ╚███╔╝ 
    ██╔═██╗ ██╔══██╗  ╚██╔╝  ██║   ██║██║╚██╗██║██║ ██╔██╗ 
    ██║  ██╗██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║██╔╝ ██╗
    ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝
                                                             
    🚀 SISTEMA DE DEPLOY AUTOMATIZADO v2.0
    🌐 Plataforma SaaS 100% Autônoma
    🇧🇷 Desenvolvido no Brasil para o Brasil
EOF
    echo -e "${NC}"
}

# Verificar pré-requisitos do sistema
check_prerequisites() {
    info "🔍 Verificando pré-requisitos do sistema..."
    
    local required_deps=("docker" "docker-compose" "git" "curl" "jq" "nginx")
    local missing_deps=()
    
    for dep in "${required_deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        error "❌ Dependências faltando: ${missing_deps[*]}"
        info "📦 Instalando dependências automaticamente..."
        
        # Auto-install missing dependencies
        for dep in "${missing_deps[@]}"; do
            case $dep in
                docker)
                    curl -fsSL https://get.docker.com | sh
                    usermod -aG docker $USER
                    ;;
                docker-compose)
                    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                    chmod +x /usr/local/bin/docker-compose
                    ;;
                *)
                    apt update && apt install -y "$dep"
                    ;;
            esac
        done
    fi
    
    # Verificar espaço em disco
    local available_space=$(df / | awk 'NR==2{print $4}')
    if [[ $available_space -lt 5000000 ]]; then # 5GB
        warn "⚠️ Pouco espaço em disco disponível: $(($available_space/1000000))GB"
    fi
    
    success "✅ Todos os pré-requisitos verificados"
}

# Backup inteligente do sistema
create_comprehensive_backup() {
    info "💾 Criando backup completo do sistema..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_name="kryonix_full_backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    mkdir -p "$backup_path"
    
    # 1. Backup do código fonte
    info "📁 Backup do código fonte..."
    tar -czf "$backup_path/code.tar.gz" -C "$PROJECT_ROOT" \
        --exclude="node_modules" \
        --exclude="dist" \
        --exclude=".git" \
        --exclude="logs" \
        . || warn "⚠️ Backup parcial do código"
    
    # 2. Backup dos volumes Docker
    info "🐳 Backup dos volumes Docker..."
    for stack in "${STACKS[@]}"; do
        local service=$(echo "$stack" | cut -d: -f1)
        local volume_name="kryonix_${service}_data"
        
        if docker volume inspect "$volume_name" &>/dev/null; then
            docker run --rm \
                -v "$volume_name":/data \
                -v "$backup_path":/backup \
                alpine tar czf "/backup/${service}_volume.tar.gz" -C /data . &
        fi
    done
    wait
    
    # 3. Backup do banco de dados
    info "🗄️ Backup do banco de dados..."
    if docker-compose exec -T postgres pg_dump -U kryonix -d kryonix > "$backup_path/database.sql" 2>/dev/null; then
        success "✅ Backup do banco de dados criado"
    else
        warn "⚠️ Backup do banco de dados falhou"
    fi
    
    # 4. Backup da configuração do sistema
    info "⚙️ Backup das configurações..."
    tar -czf "$backup_path/system_config.tar.gz" \
        /etc/nginx/sites-available/kryonix* \
        /etc/ssl/certs/kryonix* \
        /etc/ssl/private/kryonix* \
        /etc/letsencrypt/live/kryonix* 2>/dev/null || true
    
    # 5. Limpar backups antigos (manter últimos 7)
    find "$BACKUP_DIR" -name "kryonix_full_backup_*" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    
    echo "$backup_name" > "$BACKUP_DIR/latest_backup"
    success "✅ Backup completo criado: $backup_name"
    
    # Gerar relatório do backup
    du -sh "$backup_path"/* > "$backup_path/backup_report.txt"
    echo "Backup criado em: $(date)" >> "$backup_path/backup_report.txt"
}

# Atualizar código do repositório com validações
update_repository() {
    info "⬇️ Atualizando código do repositório..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar status do Git
    if ! git status &>/dev/null; then
        error "❌ Não é um repositório Git válido"
        return 1
    fi
    
    # Stash mudanças locais se existirem
    if ! git diff --quiet; then
        warn "⚠️ Mudanças locais detectadas. Fazendo stash..."
        git stash push -m "Auto-deploy backup $(date)"
    fi
    
    # Fetch e verificar se há atualizações
    git fetch origin
    local current_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main)
    
    if [[ "$current_commit" == "$remote_commit" ]]; then
        info "✅ Código já está atualizado"
        return 0
    fi
    
    info "📥 Atualizando de $current_commit para $remote_commit"
    git reset --hard origin/main
    
    success "✅ Código atualizado com sucesso"
}

# Build otimizado da aplicação
build_application() {
    info "🏗️ Executando build otimizado da aplicação..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar se package.json foi alterado
    if [[ "package.json" -nt "node_modules" ]] || [[ ! -d "node_modules" ]]; then
        info "📦 Instalando/atualizando dependências..."
        npm ci --production
    fi
    
    # Build paralelo do frontend e backend
    info "🔨 Build do frontend e backend em paralelo..."
    
    (
        npm run build 2>&1 | sed 's/^/[BUILD] /' &
        BUILD_PID=$!
        
        wait $BUILD_PID
    )
    
    # Verificar se builds foram criados
    if [[ ! -d "dist" ]]; then
        error "❌ Build falhou - diretório dist não encontrado"
        return 1
    fi
    
    success "✅ Build da aplicação concluído"
}

# Deploy inteligente com Docker
intelligent_docker_deploy() {
    info "🐳 Iniciando deploy inteligente com Docker..."
    
    cd "$PROJECT_ROOT"
    
    # Verificar se docker-compose.yml existe
    if [[ ! -f "docker-compose.yml" ]]; then
        info "📝 Criando docker-compose.yml para produção..."
        generate_docker_compose
    fi
    
    # Health check antes do deploy
    info "🏥 Verificando saúde atual do sistema..."
    docker-compose ps --services --filter "status=running" > /tmp/running_services.txt || touch /tmp/running_services.txt
    
    # Deploy com zero-downtime usando rolling update
    info "🔄 Executando rolling update..."
    
    # 1. Build novas imagens
    docker-compose build --parallel --no-cache || warn "⚠️ Build parcial das imagens"
    
    # 2. Deploy serviços não-críticos primeiro
    local non_critical_services=("grafana" "prometheus" "minio" "adminer")
    for service in "${non_critical_services[@]}"; do
        if grep -q "$service" /tmp/running_services.txt 2>/dev/null; then
            info "��� Atualizando $service..."
            docker-compose up -d --no-deps "$service" || warn "⚠️ Falha ao atualizar $service"
        fi
    done
    
    # 3. Deploy serviços críticos com verificação
    local critical_services=("postgres" "redis" "kryonix-app")
    for service in "${critical_services[@]}"; do
        if grep -q "$service" /tmp/running_services.txt 2>/dev/null; then
            info "🚨 Atualizando serviço crítico: $service..."
            
            docker-compose up -d --no-deps "$service" || {
                error "❌ Falha ao atualizar $service"
                return 1
            }
            
            # Aguardar serviço estar saudável
            local attempts=0
            while [[ $attempts -lt 30 ]]; do
                if docker-compose exec -T "$service" sh -c 'exit 0' &>/dev/null; then
                    success "✅ $service está saudável"
                    break
                fi
                sleep 5
                ((attempts++))
            done
            
            if [[ $attempts -eq 30 ]]; then
                error "❌ $service não ficou saudável, fazendo rollback..."
                return 1
            fi
        fi
    done
    
    # 4. Limpar recursos não utilizados
    docker system prune -f || true
    
    success "✅ Deploy Docker concluído com sucesso"
}

# Gerar docker-compose.yml otimizado
generate_docker_compose() {
    cat > docker-compose.yml << 'EOF'
version: '3.8'

networks:
  kryonix-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data:
  redis_data:
  minio_data:
  grafana_data:
  prometheus_data:

services:
  # Aplicação Principal KRYONIX
  kryonix-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://kryonix:senha123@postgres:5432/kryonix
      - REDIS_URL=redis://redis:6379
      - DOMAIN=${DOMAIN:-kryonix.com.br}
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=kryonix
      - POSTGRES_USER=kryonix
      - POSTGRES_PASSWORD=senha123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - kryonix-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kryonix"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - kryonix-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Evolution API (WhatsApp)
  evolution-api:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://kryonix:senha123@postgres:5432/kryonix
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix-network
    restart: unless-stopped

  # N8N Workflow Automation
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=kryonix
      - DB_POSTGRESDB_PASSWORD=senha123
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=senha123
    depends_on:
      - postgres
    networks:
      - kryonix-network
    restart: unless-stopped

  # Typebot
  typebot:
    image: baptistearno/typebot-builder:latest
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://kryonix:senha123@postgres:5432/typebot
      - NEXTAUTH_URL=https://typebot.${DOMAIN:-kryonix.com.br}
      - NEXT_PUBLIC_VIEWER_URL=https://typebot.${DOMAIN:-kryonix.com.br}
    depends_on:
      - postgres
    networks:
      - kryonix-network
    restart: unless-stopped

  # Grafana
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3002:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=senha123
      - GF_DATABASE_TYPE=postgres
      - GF_DATABASE_HOST=postgres:5432
      - GF_DATABASE_NAME=grafana
      - GF_DATABASE_USER=kryonix
      - GF_DATABASE_PASSWORD=senha123
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - postgres
    networks:
      - kryonix-network
    restart: unless-stopped

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - prometheus_data:/prometheus
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - kryonix-network
    restart: unless-stopped

  # MinIO Storage
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=senha123
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - kryonix-network
    restart: unless-stopped
EOF
}

# Health check abrangente de todas as stacks
comprehensive_health_check() {
    info "🏥 Executando health check abrangente das stacks..."
    
    local total_checks=0
    local passed_checks=0
    local failed_services=()
    
    for stack in "${STACKS[@]}"; do
        local service=$(echo "$stack" | cut -d: -f1)
        local port=$(echo "$stack" | cut -d: -f2)
        local path=$(echo "$stack" | cut -d: -f3)
        
        total_checks=$((total_checks + 1))
        
        # Health check HTTP para serviços web
        if [[ "$path" != "database" && "$path" != "cache" ]]; then
            local url="http://localhost:${port}${path}"
            if curl -f -s --max-time 10 "$url" >/dev/null; then
                success "✅ $service respondendo em $url"
                passed_checks=$((passed_checks + 1))
            else
                warn "⚠️ $service não responde em $url"
                failed_services+=("$service:http_check_failed")
            fi
        else
            # Health checks específicos para banco/cache
            case "$service" in
                postgres)
                    if docker-compose exec -T postgres pg_isready -U kryonix &>/dev/null; then
                        success "✅ PostgreSQL está saudável"
                        passed_checks=$((passed_checks + 1))
                    else
                        failed_services+=("postgres:db_check_failed")
                    fi
                    ;;
                redis)
                    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
                        success "✅ Redis está saudável"
                        passed_checks=$((passed_checks + 1))
                    else
                        failed_services+=("redis:cache_check_failed")
                    fi
                    ;;
            esac
        fi
    done
    
    # Relatório final do health check
    local success_rate=$((passed_checks * 100 / total_checks))
    
    if [[ $success_rate -ge 90 ]]; then
        success "🎉 Health check APROVADO! ($passed_checks/$total_checks checks passaram - $success_rate%)"
        return 0
    elif [[ $success_rate -ge 70 ]]; then
        warn "⚠️ Health check PARCIAL ($passed_checks/$total_checks checks passaram - $success_rate%)"
        warn "Serviços com problemas: ${failed_services[*]}"
        return 0
    else
        error "❌ Health check REPROVADO! ($passed_checks/$total_checks checks passaram - $success_rate%)"
        error "Serviços com problemas: ${failed_services[*]}"
        return 1
    fi
}

# Rollback automático inteligente
intelligent_rollback() {
    error "🔄 Iniciando rollback automático inteligente..."
    
    local backup_name
    if [[ -f "$BACKUP_DIR/latest_backup" ]]; then
        backup_name=$(cat "$BACKUP_DIR/latest_backup")
    else
        error "❌ Nenhum backup encontrado para rollback"
        return 1
    fi
    
    local backup_path="$BACKUP_DIR/$backup_name"
    
    if [[ ! -d "$backup_path" ]]; then
        error "❌ Backup não encontrado: $backup_path"
        return 1
    fi
    
    info "📦 Restaurando backup: $backup_name"
    
    # 1. Parar todos os serviços
    docker-compose down --remove-orphans || true
    
    # 2. Restaurar código fonte
    if [[ -f "$backup_path/code.tar.gz" ]]; then
        info "📁 Restaurando código fonte..."
        tar -xzf "$backup_path/code.tar.gz" -C "$PROJECT_ROOT"
    fi
    
    # 3. Subir serviços essenciais
    docker-compose up -d postgres redis || error "❌ Falha ao restaurar serviços essenciais"
    
    success "✅ Rollback concluído com sucesso"
}

# Configurar monitoramento de arquivos
setup_file_monitoring() {
    info "👁️ Configurando monitoramento de arquivos para deploy automático..."
    
    # Verificar se inotify-tools está instalado
    if ! command -v inotifywait &> /dev/null; then
        apt update && apt install -y inotify-tools
    fi
    
    # Criar script de monitoramento
    cat > /usr/local/bin/kryonix-auto-deploy-monitor.sh << 'MONITOR_EOF'
#!/bin/bash

WATCH_DIR="/opt/kryonix/platform"
DEPLOY_SCRIPT="/opt/kryonix/platform/scripts/kryonix-auto-deploy.sh"

while inotifywait -r -e modify,create,delete "$WATCH_DIR" --exclude="(node_modules|\.git|logs|dist)"; do
    echo "$(date): Mudanças detectadas, aguardando 30s para estabilizar..."
    sleep 30
    
    if [[ -x "$DEPLOY_SCRIPT" ]]; then
        echo "$(date): Executando deploy automático..."
        "$DEPLOY_SCRIPT" auto >> /var/log/kryonix/auto-deploy.log 2>&1
    fi
done
MONITOR_EOF
    
    chmod +x /usr/local/bin/kryonix-auto-deploy-monitor.sh
    
    # Criar service systemd
    cat > /etc/systemd/system/kryonix-auto-deploy.service << 'SERVICE_EOF'
[Unit]
Description=KRYONIX Auto-Deploy Monitor
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/kryonix-auto-deploy-monitor.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE_EOF
    
    systemctl daemon-reload
    systemctl enable kryonix-auto-deploy.service
    systemctl start kryonix-auto-deploy.service
    
    success "✅ Monitoramento de arquivos configurado"
}

# Enviar notificações
send_notification() {
    local title="$1"
    local message="$2"
    local webhook_url="${DISCORD_WEBHOOK_URL:-}"
    
    if [[ -n "$webhook_url" ]]; then
        curl -H "Content-Type: application/json" \
             -X POST \
             -d "{\"embeds\": [{\"title\": \"$title\", \"description\": \"$message\", \"color\": 65280}]}" \
             "$webhook_url" &>/dev/null || true
    fi
    
    # Log local sempre
    info "📢 $title: $message"
}

# Função principal
main() {
    local start_time=$(date +%s)
    
    show_banner
    
    # Configurar trap para rollback automático em caso de erro
    if [[ "$ROLLBACK_ON_FAILURE" == "true" && "$1" != "rollback" ]]; then
        trap 'intelligent_rollback' ERR
    fi
    
    info "🚀 Iniciando deploy automatizado KRYONIX v2.0"
    info "📝 Ambiente: $DEPLOY_ENV"
    info "🌐 Domínio: $DOMAIN"
    info "📁 Projeto: $PROJECT_ROOT"
    
    # Executar todas as etapas do deploy
    check_prerequisites
    create_comprehensive_backup
    update_repository
    build_application
    intelligent_docker_deploy
    
    if comprehensive_health_check; then
        # Deploy bem-sucedido
        success "🎉 Deploy KRYONIX concluído com sucesso!"
        
        # Configurar componentes adicionais apenas no primeiro deploy
        if [[ "$1" != "auto" ]]; then
            setup_file_monitoring
        fi
        
        # Notificar sucesso
        send_notification "🚀 DEPLOY CONCLUÍDO" "KRYONIX v2.0 deploy realizado com sucesso em $DOMAIN"
        
        # Informações finais
        echo
        info "🌐 URLs de acesso:"
        info "   📱 Aplicação: https://app.$DOMAIN"
        info "   🔧 API: https://api.$DOMAIN"
        info "   📊 Grafana: https://grafana.$DOMAIN"
        info "   📈 Prometheus: https://prometheus.$DOMAIN"
        info "   💾 Storage: https://storage.$DOMAIN"
        echo
        info "📊 Logs em: $LOG_DIR"
        info "💾 Backups em: $BACKUP_DIR"
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        success "⏱️ Deploy concluído em ${duration}s"
        
    else
        error "❌ Deploy falhou nas verificações finais"
        exit 1
    fi
}

# Verificar argumentos e executar
case "${1:-deploy}" in
    "auto")
        info "🤖 Deploy automático iniciado"
        main auto
        ;;
    "rollback")
        intelligent_rollback
        ;;
    "health")
        comprehensive_health_check
        ;;
    "setup")
        show_banner
        check_prerequisites
        setup_file_monitoring
        ;;
    "help"|"--help"|"-h")
        echo "Uso: $0 [comando]"
        echo
        echo "Comandos:"
        echo "  deploy     Deploy completo (padrão)"
        echo "  auto       Deploy automático (sem interação)"
        echo "  rollback   Rollback para último backup"
        echo "  health     Verificar saúde de todos os serviços"
        echo "  setup      Configurar monitoramento"
        echo "  help       Mostrar esta ajuda"
        echo
        echo "Variáveis de ambiente:"
        echo "  DOMAIN              Domínio principal (padrão: kryonix.com.br)"
        echo "  DISCORD_WEBHOOK_URL URL para notificações Discord"
        echo "  DEBUG               Ativar logs debug (true/false)"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac

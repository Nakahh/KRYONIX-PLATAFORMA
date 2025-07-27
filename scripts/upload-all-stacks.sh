#!/bin/bash

# ========================================
# KRYONIX Stack Upload Automation v2.0
# Upload automático de configurações
# ========================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
STACK_UPLOADS_DIR="$PROJECT_ROOT/stack-uploads"
LOG_FILE="/var/log/kryonix/stack-upload-$(date +%Y%m%d_%H%M%S).log"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    mkdir -p "$(dirname "$LOG_FILE")"
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

info() { log "INFO" "${BLUE}$*${NC}"; }
warn() { log "WARN" "${YELLOW}$*${NC}"; }
error() { log "ERROR" "${RED}$*${NC}"; }
success() { log "SUCCESS" "${GREEN}$*${NC}"; }

# Banner
show_banner() {
    echo -e "${BLUE}"
    cat << 'EOF'
    ╔═══════════════════════════════════════════════╗
    ║         KRYONIX STACK UPLOAD SYSTEM           ║
    ║        Configuração Automática 1-Click       ║
    ╚═══════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Verificar dependências
check_dependencies() {
    info "🔍 Verificando dependências do sistema..."
    
    local deps=("docker" "docker-compose" "curl" "jq")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing+=("$dep")
        fi
    done
    
    if [[ ${#missing[@]} -gt 0 ]]; then
        error "❌ Dependências faltando: ${missing[*]}"
        return 1
    fi
    
    success "✅ Todas as dependências verificadas"
}

# Substituir variáveis de ambiente
substitute_variables() {
    local file="$1"
    local temp_file=$(mktemp)
    
    # Variáveis padrão
    local domain="${DOMAIN:-kryonix.com.br}"
    local db_host="${DATABASE_HOST:-postgres}"
    local db_user="${DATABASE_USER:-kryonix}"
    local db_password="${DATABASE_PASSWORD:-senha123}"
    local admin_email="${ADMIN_EMAIL:-admin@${domain}}"
    local admin_password="${ADMIN_PASSWORD:-senha123}"
    
    # Substituir variáveis
    sed "s|\${DOMAIN}|${domain}|g" "$file" > "$temp_file"
    sed -i "s|\${DATABASE_HOST}|${db_host}|g" "$temp_file"
    sed -i "s|\${DATABASE_USER}|${db_user}|g" "$temp_file"
    sed -i "s|\${DATABASE_PASSWORD}|${db_password}|g" "$temp_file"
    sed -i "s|\${ADMIN_EMAIL}|${admin_email}|g" "$temp_file"
    sed -i "s|\${ADMIN_PASSWORD}|${admin_password}|g" "$temp_file"
    
    # Gerar chaves secrets se necessário
    if grep -q "\${.*_SECRET_KEY}" "$temp_file"; then
        local secret_key=$(openssl rand -hex 32)
        sed -i "s|\${.*_SECRET_KEY}|${secret_key}|g" "$temp_file"
    fi
    
    echo "$temp_file"
}

# Upload para stack específica
upload_to_stack() {
    local stack_name="$1"
    local config_dir="$STACK_UPLOADS_DIR/$stack_name"
    
    if [[ ! -d "$config_dir" ]]; then
        warn "⚠️ Configuração não encontrada para: $stack_name"
        return 1
    fi
    
    info "📤 Fazendo upload da configuração: $stack_name"
    
    # Verificar se a stack está rodando
    if ! docker-compose ps | grep -q "$stack_name.*Up"; then
        warn "⚠️ Stack $stack_name não está rodando, pulando..."
        return 0
    fi
    
    local success_count=0
    local total_files=0
    
    # Upload de arquivos de configuração
    for config_file in "$config_dir"/*.{json,yml,yaml,conf,env} 2>/dev/null; do
        [[ -f "$config_file" ]] || continue
        
        total_files=$((total_files + 1))
        local filename=$(basename "$config_file")
        
        # Substituir variáveis
        local processed_file=$(substitute_variables "$config_file")
        
        # Determinar método de upload baseado na stack
        case "$stack_name" in
            "evolution-api")
                upload_evolution_config "$processed_file" "$filename"
                ;;
            "n8n")
                upload_n8n_config "$processed_file" "$filename"
                ;;
            "mautic")
                upload_mautic_config "$processed_file" "$filename"
                ;;
            "grafana")
                upload_grafana_config "$processed_file" "$filename"
                ;;
            "prometheus")
                upload_prometheus_config "$processed_file" "$filename"
                ;;
            *)
                upload_generic_config "$stack_name" "$processed_file" "$filename"
                ;;
        esac
        
        if [[ $? -eq 0 ]]; then
            success_count=$((success_count + 1))
            success "  ✅ $filename aplicado com sucesso"
        else
            error "  ❌ Falha ao aplicar $filename"
        fi
        
        rm -f "$processed_file"
    done
    
    if [[ $success_count -eq $total_files ]]; then
        success "🎉 Stack $stack_name configurada completamente ($success_count/$total_files)"
        return 0
    else
        warn "⚠️ Stack $stack_name configurada parcialmente ($success_count/$total_files)"
        return 1
    fi
}

# Upload específico para Evolution API
upload_evolution_config() {
    local config_file="$1"
    local filename="$2"
    
    local api_url="http://localhost:8080"
    local api_key="${EVOLUTION_API_KEY:-}"
    
    case "$filename" in
        "config.json")
            curl -s -X POST "$api_url/manager/config" \
                -H "Content-Type: application/json" \
                -H "apikey: $api_key" \
                -d "@$config_file" > /dev/null
            ;;
        "webhook-config.json")
            curl -s -X POST "$api_url/webhook/set" \
                -H "Content-Type: application/json" \
                -H "apikey: $api_key" \
                -d "@$config_file" > /dev/null
            ;;
        *)
            # Copiar para volume do container
            docker cp "$config_file" "evolution-api:/app/config/$filename"
            docker-compose restart evolution-api
            ;;
    esac
}

# Upload específico para N8N
upload_n8n_config() {
    local config_file="$1"
    local filename="$2"
    
    case "$filename" in
        "*.json")
            # Import workflow
            local n8n_url="http://localhost:5678"
            curl -s -X POST "$n8n_url/rest/workflows/import" \
                -H "Content-Type: application/json" \
                -u "${N8N_USER:-admin}:${N8N_PASSWORD:-senha123}" \
                -d "@$config_file" > /dev/null
            ;;
        *)
            docker cp "$config_file" "n8n:/home/node/.n8n/$filename"
            docker-compose restart n8n
            ;;
    esac
}

# Upload específico para Mautic
upload_mautic_config() {
    local config_file="$1"
    local filename="$2"
    
    # Copiar para diretório de config do Mautic
    docker cp "$config_file" "mautic:/var/www/html/app/config/$filename"
    
    # Limpar cache
    docker-compose exec -T mautic php app/console cache:clear --env=prod
}

# Upload específico para Grafana
upload_grafana_config() {
    local config_file="$1"
    local filename="$2"
    
    case "$filename" in
        "dashboard-*.json")
            # Import dashboard via API
            local grafana_url="http://localhost:3002"
            local dashboard_json=$(cat "$config_file")
            
            curl -s -X POST "$grafana_url/api/dashboards/db" \
                -H "Content-Type: application/json" \
                -u "admin:${GRAFANA_ADMIN_PASSWORD:-senha123}" \
                -d "{\"dashboard\": $dashboard_json, \"overwrite\": true}" > /dev/null
            ;;
        "datasource-*.json")
            # Add datasource via API
            curl -s -X POST "$grafana_url/api/datasources" \
                -H "Content-Type: application/json" \
                -u "admin:${GRAFANA_ADMIN_PASSWORD:-senha123}" \
                -d "@$config_file" > /dev/null
            ;;
        *)
            docker cp "$config_file" "grafana:/etc/grafana/$filename"
            docker-compose restart grafana
            ;;
    esac
}

# Upload específico para Prometheus
upload_prometheus_config() {
    local config_file="$1"
    local filename="$2"
    
    # Copiar configuração
    docker cp "$config_file" "prometheus:/etc/prometheus/$filename"
    
    # Reload configuration
    curl -s -X POST http://localhost:9090/-/reload
}

# Upload genérico
upload_generic_config() {
    local stack_name="$1"
    local config_file="$2"
    local filename="$3"
    
    # Copiar para container e reiniciar
    docker cp "$config_file" "$stack_name:/config/$filename" 2>/dev/null || {
        docker cp "$config_file" "$stack_name:/app/config/$filename" 2>/dev/null || {
            docker cp "$config_file" "$stack_name:/usr/local/etc/$filename" 2>/dev/null || {
                warn "⚠️ Não foi possível copiar $filename para $stack_name"
                return 1
            }
        }
    }
    
    # Tentar reload sem restart primeiro
    docker-compose kill -s HUP "$stack_name" 2>/dev/null || {
        docker-compose restart "$stack_name"
    }
}

# Verificar saúde após upload
health_check_stack() {
    local stack_name="$1"
    local config_file="$STACK_UPLOADS_DIR/$stack_name/config.json"
    
    if [[ ! -f "$config_file" ]]; then
        return 0
    fi
    
    # Extrair informações de health check
    local health_url=$(jq -r '.health_check.url // empty' "$config_file" 2>/dev/null)
    local expected_status=$(jq -r '.health_check.expected_status // 200' "$config_file" 2>/dev/null)
    
    if [[ -z "$health_url" ]]; then
        return 0
    fi
    
    # Obter porta da stack
    local port=$(docker-compose port "$stack_name" 80 2>/dev/null | cut -d: -f2)
    [[ -z "$port" ]] && port=$(docker-compose port "$stack_name" 3000 2>/dev/null | cut -d: -f2)
    [[ -z "$port" ]] && return 0
    
    local full_url="http://localhost:${port}${health_url}"
    
    info "🏥 Verificando saúde de $stack_name em $full_url"
    
    local attempts=0
    local max_attempts=12
    
    while [[ $attempts -lt $max_attempts ]]; do
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$full_url" 2>/dev/null || echo "000")
        
        if [[ "$status_code" -eq "$expected_status" ]]; then
            success "✅ $stack_name está saudável (HTTP $status_code)"
            return 0
        fi
        
        info "⏳ Aguardando $stack_name ficar saudável... (tentativa $((attempts + 1))/$max_attempts)"
        sleep 10
        attempts=$((attempts + 1))
    done
    
    warn "⚠️ $stack_name não passou no health check após $max_attempts tentativas"
    return 1
}

# Upload de todas as stacks
upload_all_stacks() {
    info "🚀 Iniciando upload de todas as configurações..."
    
    # Lista de stacks em ordem de dependência
    local stacks=(
        "evolution-api"
        "n8n" 
        "typebot"
        "mautic"
        "grafana"
        "prometheus"
        "chatwoot"
        "rocketchat"
    )
    
    local success_count=0
    local total_stacks=${#stacks[@]}
    
    for stack in "${stacks[@]}"; do
        info "📦 Processando stack: $stack"
        
        if upload_to_stack "$stack"; then
            success_count=$((success_count + 1))
            
            # Health check após upload
            health_check_stack "$stack"
        fi
        
        echo
    done
    
    # Relatório final
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    
    if [[ $success_count -eq $total_stacks ]]; then
        success "🎉 TODAS AS STACKS CONFIGURADAS COM SUCESSO!"
        success "✅ $success_count/$total_stacks stacks processadas"
    elif [[ $success_count -gt 0 ]]; then
        warn "⚠️ CONFIGURAÇÃO PARCIAL CONCLUÍDA"
        warn "✅ $success_count/$total_stacks stacks processadas com sucesso"
    else
        error "❌ FALHA NA CONFIGURAÇÃO DE TODAS AS STACKS"
    fi
    
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    
    info "📊 Log completo salvo em: $LOG_FILE"
}

# Função principal
main() {
    show_banner
    
    case "${1:-all}" in
        "all")
            check_dependencies
            upload_all_stacks
            ;;
        "check")
            check_dependencies
            ;;
        *)
            if [[ -d "$STACK_UPLOADS_DIR/$1" ]]; then
                check_dependencies
                upload_to_stack "$1"
                health_check_stack "$1"
            else
                echo "Uso: $0 [stack_name|all|check]"
                echo
                echo "Stacks disponíveis:"
                ls -1 "$STACK_UPLOADS_DIR" | grep -v "shared\|README\|INSTRUÇÕES"
                exit 1
            fi
            ;;
    esac
}

# Executar
main "$@"

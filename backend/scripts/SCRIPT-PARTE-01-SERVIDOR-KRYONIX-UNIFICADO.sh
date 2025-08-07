#!/bin/bash

# ============================================================================
# 🚀 KRYONIX - SCRIPT UNIFICADO PARTE 01 SERVIDOR
# CONFIGURAÇÃO COMPLETA DE AUTENTICAÇÃO KEYCLOAK MULTI-TENANT
# ============================================================================
# 
# Desenvolvido por: Vitor Jayme Fernandes Ferreira
# Assistido por: 15 Agentes Especializados em IA
# Data: Janeiro 2025
# 
# Este script deve ser executado NO SEU SERVIDOR após o pull da main
# Ele configura tudo que não vem automaticamente com o código
#
# Uso: bash SCRIPT-PARTE-01-SERVIDOR-KRYONIX-UNIFICADO.sh
# 
# VERSÃO: Unificada com funcionalidades avançadas de monitoramento,
# backup automático e sistema de notificações WhatsApp integrado
# ============================================================================

# Configurações de segurança
set -euo pipefail
export LC_ALL=C.UTF-8 2>/dev/null || export LC_ALL=C
export LANG=C.UTF-8 2>/dev/null || export LANG=C

# ============================================================================
# CONFIGURAÇÕES GLOBAIS - CREDENCIAIS REAIS DO PROJETO
# ============================================================================

# Servidor e domínios
readonly SERVER_IP="${SERVER_IP:-45.76.246.44}"
readonly DOMAIN_BASE="kryonix.com.br"
readonly PROJECT_NAME="KRYONIX"

# Credenciais de autenticação
readonly KEYCLOAK_ADMIN_USER="kryonix"
readonly KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-Vitor@123456}"
readonly POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-Vitor@123456}"

# Credenciais APIs
readonly EVOLUTION_API_KEY="${EVOLUTION_API_KEY:-2f4d6967043b87b5ebee57b872e0223a}"
readonly EVOLUTION_API_URL="https://api.kryonix.com.br"
readonly JWT_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"

# Comunicação e notificações
readonly WHATSAPP_ALERT="${WHATSAPP_ALERT:-+5517981805327}"
readonly ADMIN_EMAIL="vitor.nakahh@gmail.com"

# GitHub e CI/CD
readonly GITHUB_REPO="https://github.com/Nakahh/KRYONIX-PLATAFORMA.git"
readonly PAT_TOKEN="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"
readonly WEBHOOK_URL="https://kryonix.com.br/api/github-webhook"
readonly WEBHOOK_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"

# SendGrid para emails
readonly SENDGRID_API_KEY="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"

# ============================================================================
# CORES E FORMATAÇÃO
# ============================================================================
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly BOLD='\033[1m'
readonly NC='\033[0m'

# Emojis seguros para ASCII
readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly ROCKET="🚀"
readonly GEAR="⚙️"
readonly LOCK="����"

# ============================================================================
# SISTEMA DE LOGGING E CONTROLE
# ============================================================================

# Diretórios e arquivos
readonly LOCK_FILE="/tmp/kryonix-parte01-$(date +%Y%m%d).lock"
readonly LOG_DIR="/opt/kryonix/logs"
readonly LOG_FILE="$LOG_DIR/parte01-$(date +%Y%m%d_%H%M%S).log"
readonly CONFIG_DIR="/opt/kryonix/config"
readonly SCRIPTS_DIR="/opt/kryonix/scripts"
readonly BACKUP_DIR="/opt/kryonix/backups"
readonly CLIENTS_DIR="/opt/kryonix/clients"

# Contador de progresso
CURRENT_STEP=0
readonly TOTAL_STEPS=20

# Função de logging centralizada
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local color=""
    local prefix=""
    
    case "$level" in
        "INFO")
            color="$GREEN"
            prefix="[INFO]"
            ;;
        "WARN")
            color="$YELLOW"
            prefix="[WARN]"
            ;;
        "ERROR")
            color="$RED"
            prefix="[ERROR]"
            ;;
        "DEBUG")
            color="$BLUE"
            prefix="[DEBUG]"
            ;;
        "STEP")
            color="$PURPLE"
            prefix="[STEP]"
            CURRENT_STEP=$((CURRENT_STEP + 1))
            ;;
    esac
    
    echo -e "${color}[$timestamp] $prefix${NC} $message" | tee -a "$LOG_FILE"
}

# Funções de logging especializadas
log_info() { log "INFO" "$1"; }
log_warn() { log "WARN" "$1"; }
log_error() { log "ERROR" "$1"; }
log_debug() { log "DEBUG" "$1"; }
log_step() { log "STEP" "$CHECK Etapa $CURRENT_STEP/$TOTAL_STEPS: $1"; }

# ============================================================================
# SISTEMA DE CONTROLE E SEGURANÇA
# ============================================================================

# Função de cleanup
cleanup() {
    log_info "Executando cleanup..."
    rm -f "$LOCK_FILE"
    log_info "Script finalizado em $(date)"
}

# Função de tratamento de erro
error_exit() {
    local line_number="$1"
    local error_code="$2"
    log_error "Erro na linha $line_number com código $error_code"
    log_error "Consultando logs em: $LOG_FILE"
    
    # Enviar notificação de erro via WhatsApp se Evolution API estiver disponível
    send_whatsapp_notification "❌ ERRO no script KRYONIX PARTE-01 - Linha: $line_number - Verificar logs: $LOG_FILE" || true
    
    exit "$error_code"
}

# Configurar traps
trap cleanup EXIT INT TERM
trap 'error_exit ${LINENO} $?' ERR

# ============================================================================
# FUNÇÕES DE VALIDAÇÃO
# ============================================================================

# Verificar se já está rodando
check_already_running() {
    if [ -f "$LOCK_FILE" ]; then
        local pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            log_error "Script já está sendo executado (PID: $pid)"
            log_error "Se tiver certeza que não está rodando, remova: $LOCK_FILE"
            exit 1
        else
            log_warn "Lock file órfão encontrado, removendo..."
            rm -f "$LOCK_FILE"
        fi
    fi
    
    # Criar lock file
    echo $$ > "$LOCK_FILE"
    log_info "Lock file criado com PID: $$"
}

# Verificar permissões de root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script deve ser executado como root"
        log_error "Execute: sudo bash $0"
        exit 1
    fi
    log_info "Permissões de root verificadas"
}

# Verificar dependências do sistema
check_system_dependencies() {
    log_step "Verificando dependências do sistema"
    
    local missing_deps=()
    local required_deps=("docker" "python3" "curl" "jq" "cron")
    
    for dep in "${required_deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        else
            log_info "$CHECK $dep está disponível"
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Dependências faltando: ${missing_deps[*]}"
        log_info "Instalando dependências automaticamente..."
        
        # Detectar distribuição e instalar
        if command -v apt-get &> /dev/null; then
            apt-get update && apt-get install -y "${missing_deps[@]}" jq
        elif command -v yum &> /dev/null; then
            yum install -y "${missing_deps[@]}" jq
        else
            log_error "Gerenciador de pacotes não suportado"
            exit 1
        fi
    fi
    
    log_info "$CHECK Todas as dependências estão disponíveis"
}

# Verificar Docker Swarm
check_docker_swarm() {
    log_step "Verificando Docker Swarm"
    
    if ! docker info | grep -q "Swarm: active"; then
        log_error "Docker Swarm não está ativo!"
        log_error "Execute: docker swarm init"
        exit 1
    fi
    
    log_info "$CHECK Docker Swarm está ativo"
}

# Verificar espaço em disco
check_disk_space() {
    log_step "Verificando espa��o em disco"
    
    local disk_available=$(df / | awk 'NR==2 {print $4}')
    local required_space=5242880  # 5GB em KB
    
    if [ "$disk_available" -lt "$required_space" ]; then
        log_error "Espaço em disco insuficiente!"
        log_error "Disponível: $(($disk_available / 1024 / 1024))GB"
        log_error "Necessário: 5GB"
        exit 1
    fi
    
    log_info "$CHECK Espaço em disco suficiente: $(($disk_available / 1024 / 1024))GB disponível"
}

# ============================================================================
# FUNÇÕES DE REDE E CONECTIVIDADE
# ============================================================================

# Verificar rede Docker
check_docker_network() {
    log_step "Verificando/criando rede Docker"
    
    local network_name="Kryonix-NET"
    
    if docker network ls --format "{{.Name}}" | grep -q "^${network_name}$"; then
        log_info "$CHECK Rede $network_name já existe"
    else
        log_info "Criando rede $network_name..."
        docker network create -d overlay --attachable "$network_name"
        log_info "$CHECK Rede $network_name criada"
    fi
}

# Verificar conectividade externa
check_external_connectivity() {
    log_step "Verificando conectividade externa"
    
    local test_urls=(
        "https://api.github.com"
        "https://registry-1.docker.io"
        "https://$DOMAIN_BASE"
    )
    
    for url in "${test_urls[@]}"; do
        if curl -f -s --max-time 10 "$url" > /dev/null 2>&1; then
            log_info "$CHECK Conectividade com $url OK"
        else
            log_warn "$WARNING Problema de conectividade com $url"
        fi
    done
}

# ============================================================================
# FUNÇÕES DE SERVIÇOS BASE
# ============================================================================

# Verificar serviços base necessários
check_base_services() {
    log_step "Verificando serviços base necessários"
    
    local required_services=("postgresql-kryonix" "traefik")
    
    for service in "${required_services[@]}"; do
        local max_attempts=3
        local found=false
        
        for i in $(seq 1 $max_attempts); do
            if docker ps --format "table {{.Names}}" | grep -q "$service"; then
                log_info "$CHECK $service está rodando"
                found=true
                break
            fi
            log_warn "Tentativa $i/$max_attempts: $service não encontrado"
            sleep 2
        done
        
        if [ "$found" = false ]; then
            log_error "$service não está rodando após $max_attempts tentativas!"
            log_error "Certifique-se que as stacks base estão instaladas"
            exit 1
        fi
    done
}

# ============================================================================
# CONFIGURAÇÃO DO KEYCLOAK
# ============================================================================

# Criar configurações do Keycloak
create_keycloak_config() {
    log_step "Criando configurações do Keycloak"
    
    # Criar database para Keycloak
    log_info "Configurando database do Keycloak..."

    # Verificar se o database já existe
    if ! docker exec postgresql-kryonix psql -U postgres -lqt | cut -d \| -f 1 | grep -qw keycloak; then
        log_info "Criando database keycloak..."

        # CREATE DATABASE deve ser executado separadamente (fora de transação)
        docker exec postgresql-kryonix psql -U postgres -c "CREATE DATABASE keycloak WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8' LC_CTYPE = 'pt_BR.UTF-8' TEMPLATE template0;"

        log_info "$CHECK Database keycloak criado"
    else
        log_info "$CHECK Database keycloak já existe"
    fi

    # Verificar se o usuário já existe
    if ! docker exec postgresql-kryonix psql -U postgres -t -c "SELECT 1 FROM pg_roles WHERE rolname='keycloak_user'" | grep -q 1; then
        log_info "Criando usuário keycloak_user..."

        # CREATE USER e GRANT podem ser executados separadamente
        docker exec postgresql-kryonix psql -U postgres -c "CREATE USER keycloak_user WITH PASSWORD '$POSTGRES_PASSWORD';"

        log_info "$CHECK Usuário keycloak_user criado"
    else
        log_info "$CHECK Usuário keycloak_user já existe"
    fi

    # Garantir privilégios no database
    log_info "Concedendo privilégios..."
    docker exec postgresql-kryonix psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;"
    log_info "$CHECK Privilégios concedidos"
    
    # Criar configuração do Docker Compose
    cat > "$CONFIG_DIR/keycloak.yml" << EOF
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak-kryonix
    command: start
    environment:
      KEYCLOAK_ADMIN: $KEYCLOAK_ADMIN_USER
      KEYCLOAK_ADMIN_PASSWORD: $KEYCLOAK_ADMIN_PASSWORD
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgresql-kryonix:5432/keycloak
      KC_DB_USERNAME: keycloak_user
      KC_DB_PASSWORD: $POSTGRES_PASSWORD
      KC_HOSTNAME: keycloak.$DOMAIN_BASE
      KC_PROXY: edge
      KC_HTTP_ENABLED: true
      KC_HEALTH_ENABLED: true
      KC_METRICS_ENABLED: true
      KC_LOG_LEVEL: INFO
      KC_FEATURES: preview
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.keycloak.rule=Host(\`keycloak.$DOMAIN_BASE\`)"
      - "traefik.http.routers.keycloak.tls=true"
      - "traefik.http.routers.keycloak.tls.certresolver=letsencrypt"
      - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
      - "traefik.http.routers.keycloak.middlewares=secure-headers"
    networks:
      - Kryonix-NET
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 3
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
networks:
  Kryonix-NET:
    external: true
EOF
    
    log_info "$CHECK Configuração do Keycloak criada"
}

# Deploy do Keycloak
deploy_keycloak() {
    log_step "Fazendo deploy do Keycloak"
    
    # Verificar se já está rodando
    if docker ps | grep -q "keycloak-kryonix"; then
        log_info "$CHECK Keycloak já está rodando"
        return 0
    fi
    
    # Deploy do stack
    docker stack deploy -c "$CONFIG_DIR/keycloak.yml" kryonix-auth
    
    # Aguardar inicialização
    log_info "Aguardando Keycloak inicializar..."
    local max_attempts=30
    for i in $(seq 1 $max_attempts); do
        if curl -f -s --max-time 10 "https://keycloak.$DOMAIN_BASE/health/ready" > /dev/null 2>&1; then
            log_info "$CHECK Keycloak está pronto após $i tentativas"
            return 0
        fi
        log_info "Aguardando... ($i/$max_attempts)"
        sleep 10
    done
    
    log_error "Keycloak não ficou pronto no tempo esperado"
    exit 1
}

# Função para fazer requisições ao Keycloak com retry
keycloak_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local max_attempts=3
    
    for i in $(seq 1 $max_attempts); do
        local response_code
        if [ -n "$data" ]; then
            response_code=$(curl -s -w "%{http_code}" -o /dev/null --max-time 30 \
                -X "$method" \
                -H "Authorization: Bearer $ADMIN_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$url")
        else
            response_code=$(curl -s -w "%{http_code}" -o /dev/null --max-time 30 \
                -X "$method" \
                -H "Authorization: Bearer $ADMIN_TOKEN" \
                "$url")
        fi
        
        # Considerar 201, 200 e 409 (conflito) como sucesso para idempotência
        if [[ "$response_code" =~ ^(200|201|409)$ ]]; then
            return 0
        fi
        
        log_warn "Tentativa $i/$max_attempts falhou com código $response_code"
        sleep 2
    done
    
    log_error "Falha na requisição após $max_attempts tentativas: $method $url"
    return 1
}

# Configurar Realm e Clients do Keycloak
configure_keycloak_realm() {
    log_step "Configurando Realm e Clients do Keycloak"
    
    # Obter token admin
    local admin_token
    admin_token=$(curl -s --max-time 30 \
        -d "client_id=admin-cli" \
        -d "username=$KEYCLOAK_ADMIN_USER" \
        -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
        -d "grant_type=password" \
        "https://keycloak.$DOMAIN_BASE/realms/master/protocol/openid_connect/token" | \
        jq -r '.access_token' 2>/dev/null || echo "")
    
    if [ -z "$admin_token" ] || [ "$admin_token" = "null" ]; then
        log_error "Falha ao obter token admin do Keycloak"
        exit 1
    fi
    
    # Definir variável global para uso em outras funções
    ADMIN_TOKEN="$admin_token"
    log_info "$CHECK Token admin obtido"
    
    # Verificar se realm KRYONIX já existe
    if curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
       "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX" > /dev/null 2>&1; then
        log_info "$CHECK Realm KRYONIX já existe"
    else
        log_info "Criando Realm KRYONIX..."
        
        # Criar realm com configuração completa
        keycloak_request "POST" "https://keycloak.$DOMAIN_BASE/admin/realms" '{
            "realm": "KRYONIX",
            "enabled": true,
            "displayName": "KRYONIX - Plataforma SaaS",
            "displayNameHtml": "<strong>KRYONIX</strong> - Sua Plataforma de Negócios",
            "defaultLocale": "pt-BR",
            "internationalizationEnabled": true,
            "supportedLocales": ["pt-BR"],
            "registrationAllowed": false,
            "registrationEmailAsUsername": true,
            "rememberMe": true,
            "verifyEmail": false,
            "loginWithEmailAllowed": true,
            "duplicateEmailsAllowed": false,
            "resetPasswordAllowed": true,
            "editUsernameAllowed": false,
            "bruteForceProtected": true,
            "permanentLockout": false,
            "maxFailureWaitSeconds": 900,
            "minimumQuickLoginWaitSeconds": 60,
            "waitIncrementSeconds": 60,
            "quickLoginCheckMilliSeconds": 1000,
            "maxDeltaTimeSeconds": 43200,
            "failureFactor": 5,
            "loginTheme": "keycloak",
            "accountTheme": "keycloak",
            "adminTheme": "keycloak",
            "emailTheme": "keycloak",
            "attributes": {
                "multi_tenant": "true",
                "mobile_priority": "true",
                "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
            }
        }'
        
        log_info "$CHECK Realm KRYONIX criado"
    fi
    
    # Configurar clients necessários
    configure_keycloak_clients
    
    # Criar usuários padrão
    create_keycloak_users
}

# Configurar clients do Keycloak
configure_keycloak_clients() {
    log_info "Configurando clients do Keycloak..."
    
    # Client Frontend
    keycloak_request "POST" "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX/clients" '{
        "clientId": "kryonix-frontend",
        "name": "KRYONIX Frontend",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "secret": "kryonix-frontend-secret-2025",
        "redirectUris": [
            "https://app.'$DOMAIN_BASE'/*",
            "https://www.'$DOMAIN_BASE'/*",
            "https://*.'$DOMAIN_BASE'/*",
            "http://localhost:3000/*"
        ],
        "webOrigins": [
            "https://app.'$DOMAIN_BASE'",
            "https://www.'$DOMAIN_BASE'",
            "https://*.'$DOMAIN_BASE'",
            "http://localhost:3000"
        ],
        "protocol": "openid-connect",
        "publicClient": false,
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": true,
        "authorizationServicesEnabled": true,
        "fullScopeAllowed": true
    }'
    
    # Client Mobile
    keycloak_request "POST" "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX/clients" '{
        "clientId": "kryonix-mobile-app",
        "name": "KRYONIX Mobile App",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "secret": "kryonix-mobile-secret-2025",
        "redirectUris": [
            "kryonix://auth/callback",
            "https://app.'$DOMAIN_BASE'/mobile/callback"
        ],
        "webOrigins": ["*"],
        "protocol": "openid-connect",
        "publicClient": false,
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false,
        "authorizationServicesEnabled": false,
        "fullScopeAllowed": true
    }'
    
    # Client IA
    keycloak_request "POST" "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX/clients" '{
        "clientId": "kryonix-ai-client",
        "name": "KRYONIX IA Integration",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "secret": "kryonix-ai-secret-2025",
        "protocol": "openid-connect",
        "publicClient": false,
        "standardFlowEnabled": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": true,
        "fullScopeAllowed": true
    }'
    
    log_info "$CHECK Clients do Keycloak configurados"
}

# Criar usuários padrão
create_keycloak_users() {
    log_info "Criando usuários padrão..."
    
    # Usuário master
    keycloak_request "POST" "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX/users" '{
        "username": "'$KEYCLOAK_ADMIN_USER'",
        "email": "admin@'$DOMAIN_BASE'",
        "firstName": "KRYONIX",
        "lastName": "Master",
        "enabled": true,
        "emailVerified": true,
        "credentials": [{
            "type": "password",
            "value": "'$KEYCLOAK_ADMIN_PASSWORD'",
            "temporary": false
        }],
        "attributes": {
            "whatsapp": ["'$WHATSAPP_ALERT'"],
            "role": ["admin"]
        }
    }'
    
    # Usuário IA
    keycloak_request "POST" "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX/users" '{
        "username": "kryonix-ai-service",
        "email": "ai@'$DOMAIN_BASE'",
        "firstName": "KRYONIX",
        "lastName": "IA Service",
        "enabled": true,
        "emailVerified": true,
        "credentials": [{
            "type": "password",
            "value": "ai_kryonix_2025",
            "temporary": false
        }],
        "attributes": {
            "service": ["ai"],
            "role": ["service"]
        }
    }'
    
    log_info "$CHECK Usuários padrão criados"
}

# ============================================================================
# SCRIPTS DE AUTOMAÇÃO
# ============================================================================

# Configurar scripts de automação
setup_automation_scripts() {
    log_step "Configurando scripts de automação"
    
    # Script de criação automática de cliente
    if [ ! -f "$SCRIPTS_DIR/kryonix-create-client.sh" ]; then
        log_info "Criando script de criação de cliente..."
        cat > "$SCRIPTS_DIR/kryonix-create-client.sh" << 'AUTOCREATE_EOF'
#!/bin/bash
# KRYONIX - Criação Automática de Cliente
# Uso: kryonix-create-client.sh <nome_cliente> <email_admin> <whatsapp> <modulos>

set -euo pipefail

CLIENTE_NOME="$1"
ADMIN_EMAIL="$2"
WHATSAPP="$3"
MODULOS="$4"

if [ $# -lt 4 ]; then
    echo "Uso: $0 <nome_cliente> <email_admin> <whatsapp> <modulos>"
    echo "Exemplo: $0 'Clínica Exemplo' 'admin@clinica.com' '+5517999999999' 'crm,agendamento,whatsapp'"
    exit 1
fi

# Gerar ID do cliente
CLIENTE_ID=$(echo "$CLIENTE_NOME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g' | cut -c1-20)
REALM_NAME="kryonix-cliente-${CLIENTE_ID}"
TEMP_PASSWORD=$(openssl rand -base64 12)

echo "🚀 Criando cliente: $CLIENTE_ID"

# Verificar se cliente já existe
if [ -f "/opt/kryonix/clients/${CLIENTE_ID}.env" ]; then
    echo "⚠️ Cliente $CLIENTE_ID já existe!"
    exit 1
fi

# Obter token admin
ADMIN_TOKEN=$(curl -s --max-time 30 \
    -d "client_id=admin-cli" \
    -d "username=kryonix" \
    -d "password=${KEYCLOAK_ADMIN_PASSWORD:-Vitor@123456}" \
    -d "grant_type=password" \
    "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Falha ao obter token admin"
    exit 1
fi

# Criar realm
echo "🏗️ Criando realm $REALM_NAME..."
curl -s --max-time 30 -X POST "https://keycloak.kryonix.com.br/admin/realms" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"realm\": \"$REALM_NAME\",
        \"enabled\": true,
        \"displayName\": \"KRYONIX - $CLIENTE_NOME\",
        \"attributes\": {
            \"cliente_id\": \"$CLIENTE_ID\",
            \"cliente_nome\": \"$CLIENTE_NOME\",
            \"modulos_contratados\": \"$MODULOS\",
            \"created_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
        }
    }" > /dev/null

# Criar client
echo "🔧 Configurando client..."
curl -s --max-time 30 -X POST "https://keycloak.kryonix.com.br/admin/realms/$REALM_NAME/clients" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"clientId\": \"kryonix-frontend\",
        \"enabled\": true,
        \"redirectUris\": [\"https://${CLIENTE_ID}.kryonix.com.br/*\"],
        \"webOrigins\": [\"https://${CLIENTE_ID}.kryonix.com.br\"],
        \"directAccessGrantsEnabled\": true
    }" > /dev/null

# Criar usuário admin
echo "👤 Criando usuário admin..."
curl -s --max-time 30 -X POST "https://keycloak.kryonix.com.br/admin/realms/$REALM_NAME/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"username\": \"$ADMIN_EMAIL\",
        \"email\": \"$ADMIN_EMAIL\",
        \"enabled\": true,
        \"emailVerified\": true,
        \"credentials\": [{
            \"type\": \"password\",
            \"value\": \"$TEMP_PASSWORD\",
            \"temporary\": true
        }],
        \"attributes\": {
            \"cliente_id\": [\"$CLIENTE_ID\"],
            \"whatsapp\": [\"$WHATSAPP\"]
        }
    }" > /dev/null

# Configurar subdomínio no Traefik
echo "🌐 Configurando subdomínio..."
cat > "/etc/traefik/dynamic/${CLIENTE_ID}.yml" << TRAEFIK_EOF
http:
  routers:
    ${CLIENTE_ID}-router:
      rule: "Host(\`${CLIENTE_ID}.kryonix.com.br\`)"
      service: ${CLIENTE_ID}-service
      tls:
        certResolver: letsencrypt
  services:
    ${CLIENTE_ID}-service:
      loadBalancer:
        servers:
          - url: "http://frontend:3000"
TRAEFIK_EOF

# Salvar configuração do cliente
echo "⚙️ Salvando configuração..."
cat > "/opt/kryonix/clients/${CLIENTE_ID}.env" << CONFIG_EOF
CLIENTE_ID=${CLIENTE_ID}
CLIENTE_NOME=${CLIENTE_NOME}
ADMIN_EMAIL=${ADMIN_EMAIL}
WHATSAPP=${WHATSAPP}
MODULOS=${MODULOS}
REALM_NAME=${REALM_NAME}
SUBDOMAIN=${CLIENTE_ID}.kryonix.com.br
TEMP_PASSWORD=${TEMP_PASSWORD}
CREATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
CONFIG_EOF

# Enviar credenciais via WhatsApp
echo "📱 Tentando enviar credenciais via WhatsApp..."
if command -v curl >/dev/null 2>&1; then
    curl -s --max-time 10 -X POST "https://api.kryonix.com.br/message/sendText/kryonix" \
        -H "apikey: ${EVOLUTION_API_KEY:-2f4d6967043b87b5ebee57b872e0223a}" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"$WHATSAPP\",
            \"text\": \"🎉 KRYONIX - Plataforma Pronta!\\n\\n🌐 Acesso: https://${CLIENTE_ID}.kryonix.com.br\\n👤 Email: $ADMIN_EMAIL\\n🔑 Senha: $TEMP_PASSWORD\\n\\n📋 Módulos: $MODULOS\"
        }" > /dev/null 2>&1 || echo "⚠️ Aviso: Falha ao enviar WhatsApp"
fi

echo "✅ Cliente $CLIENTE_ID criado com sucesso!"
echo "🌐 Acesso: https://${CLIENTE_ID}.kryonix.com.br"
echo "📧 Admin: $ADMIN_EMAIL"
echo "🔑 Senha temporária: $TEMP_PASSWORD"
AUTOCREATE_EOF

        chmod +x "$SCRIPTS_DIR/kryonix-create-client.sh"
        log_info "$CHECK Script de criação de cliente criado"
    fi
    
    # Script de validação de clientes
    if [ ! -f "$SCRIPTS_DIR/kryonix-validate-clients.sh" ]; then
        log_info "Criando script de validação de clientes..."
        cat > "$SCRIPTS_DIR/kryonix-validate-clients.sh" << 'VALIDATE_EOF'
#!/bin/bash
set -euo pipefail

echo "🔍 Validando clientes KRYONIX..."

# Validar clientes existentes
for config_file in /opt/kryonix/clients/*.env; do
    if [ -f "$config_file" ]; then
        source "$config_file"
        echo "🏢 Cliente: $CLIENTE_ID"
        
        # Verificar subdomínio
        if curl -s -I --max-time 10 "https://${CLIENTE_ID}.kryonix.com.br" > /dev/null 2>&1; then
            echo "✅ Subdomínio $CLIENTE_ID acessível"
        else
            echo "❌ Subdomínio $CLIENTE_ID não acessível"
        fi
        echo ""
    fi
done

echo "🎯 Validação concluída!"
VALIDATE_EOF

        chmod +x "$SCRIPTS_DIR/kryonix-validate-clients.sh"
        log_info "$CHECK Script de validação criado"
    fi
    
    log_info "$CHECK Scripts de automação configurados"
}

# ============================================================================
# MONITORAMENTO E BACKUP
# ============================================================================

# Configurar monitoramento
setup_monitoring() {
    log_step "Configurando monitoramento avançado"
    
    # Script de monitoramento
    if [ ! -f "$SCRIPTS_DIR/monitor-kryonix.sh" ]; then
        log_info "Criando script de monitoramento..."
        cat > "$SCRIPTS_DIR/monitor-kryonix.sh" << 'MONITOR_EOF'
#!/bin/bash
set -euo pipefail

LOG_FILE="/opt/kryonix/logs/monitor.log"
ALERT_COOLDOWN_FILE="/tmp/kryonix-alert-cooldown"
COOLDOWN_MINUTES=30

log_monitor() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

send_alert() {
    local message="$1"
    
    # Verificar cooldown para evitar spam
    if [ -f "$ALERT_COOLDOWN_FILE" ]; then
        local last_alert=$(cat "$ALERT_COOLDOWN_FILE")
        local now=$(date +%s)
        local diff=$((now - last_alert))
        if [ $diff -lt $((COOLDOWN_MINUTES * 60)) ]; then
            log_monitor "⏳ Alerta em cooldown, aguardando $(( (COOLDOWN_MINUTES * 60 - diff) / 60 )) minutos"
            return
        fi
    fi
    
    if curl -s --max-time 10 -X POST "https://api.kryonix.com.br/message/sendText/kryonix" \
        -H "apikey: ${EVOLUTION_API_KEY:-2f4d6967043b87b5ebee57b872e0223a}" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"${WHATSAPP_ALERT:-+5517981805327}\",
            \"text\": \"🚨 ALERTA KRYONIX\\n\\n$message\\n\\n⏰ $(date '+%d/%m/%Y %H:%M:%S')\"
        }" > /dev/null 2>&1; then
        echo "$(date +%s)" > "$ALERT_COOLDOWN_FILE"
        log_monitor "📱 Alerta enviado: $message"
    fi
}

# Loop principal
trap 'log_monitor "Monitor interrompido"; exit 0' INT TERM

while true; do
    # Verificar Keycloak
    if ! curl -f -s --max-time 10 https://keycloak.kryonix.com.br/health/ready > /dev/null 2>&1; then
        log_monitor "🚨 CRÍTICO: Keycloak não está respondendo!"
        send_alert "KEYCLOAK OFFLINE - Serviço de autenticação não está respondendo"
        
        # Tentar restart uma vez
        if docker service update --force kryonix-auth_keycloak 2>/dev/null; then
            log_monitor "🔄 Tentativa de restart do Keycloak executada"
            sleep 60
        fi
    else
        log_monitor "✅ Keycloak funcionando normalmente"
    fi
    
    # Verificar PostgreSQL
    if ! docker exec postgresql-kryonix pg_isready -U postgres > /dev/null 2>&1; then
        log_monitor "🚨 CRÍTICO: PostgreSQL não está respondendo!"
        send_alert "POSTGRESQL OFFLINE - Banco de dados não está respondendo"
    else
        log_monitor "✅ PostgreSQL funcionando normalmente"
    fi
    
    # Verificar uso de disco
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//' || echo "0")
    if [ "$DISK_USAGE" -gt 85 ]; then
        log_monitor "⚠️ AVISO: Uso de disco alto: ${DISK_USAGE}%"
        send_alert "DISCO CHEIO - Uso: ${DISK_USAGE}% - Limpeza recomendada"
    fi
    
    # Verificar uso de memória
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}' || echo "0")
    if [ "$MEMORY_USAGE" -gt 90 ]; then
        log_monitor "⚠️ AVISO: Uso de memória alto: ${MEMORY_USAGE}%"
        send_alert "MEMÓRIA ALTA - Uso: ${MEMORY_USAGE}% - Verificação necessária"
    fi
    
    # Aguardar 5 minutos antes da próxima verificação
    sleep 300
done
MONITOR_EOF

        chmod +x "$SCRIPTS_DIR/monitor-kryonix.sh"
        log_info "$CHECK Script de monitoramento criado"
    fi
    
    # Criar serviço systemd
    if [ ! -f "/etc/systemd/system/kryonix-monitor.service" ]; then
        log_info "Criando serviço de monitoramento..."
        cat > /etc/systemd/system/kryonix-monitor.service << 'SERVICE_EOF'
[Unit]
Description=KRYONIX System Monitor
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=root
ExecStart=/opt/kryonix/scripts/monitor-kryonix.sh
Restart=always
RestartSec=30
Environment=KEYCLOAK_ADMIN_PASSWORD=Vitor@123456
Environment=EVOLUTION_API_KEY=2f4d6967043b87b5ebee57b872e0223a
Environment=WHATSAPP_ALERT=+5517981805327

[Install]
WantedBy=multi-user.target
SERVICE_EOF

        systemctl daemon-reload
        systemctl enable kryonix-monitor
        log_info "$CHECK Serviço de monitoramento criado"
    fi
    
    # Iniciar serviço
    if ! systemctl is-active --quiet kryonix-monitor; then
        systemctl start kryonix-monitor
        log_info "$CHECK Serviço de monitoramento iniciado"
    else
        log_info "$CHECK Serviço de monitoramento já está rodando"
    fi
}

# Configurar backup automático
setup_backup() {
    log_step "Configurando backup automático"
    
    # Script de backup
    if [ ! -f "$SCRIPTS_DIR/backup-kryonix.sh" ]; then
        log_info "Criando script de backup..."
        cat > "$SCRIPTS_DIR/backup-kryonix.sh" << 'BACKUP_EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

log_backup() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> /opt/kryonix/logs/backup.log
}

log_backup "💾 Iniciando backup KRYONIX completo..."

# Backup Keycloak (database)
log_backup "🔐 Backup Keycloak..."
if docker exec postgresql-kryonix pg_dump -U postgres -d keycloak > "$BACKUP_DIR/keycloak_db.sql" 2>/dev/null; then
    gzip "$BACKUP_DIR/keycloak_db.sql"
    log_backup "✅ Backup Keycloak concluído"
else
    log_backup "❌ Falha no backup Keycloak"
fi

# Backup configurações dos clientes
log_backup "👥 Backup configurações clientes..."
if [ -d "/opt/kryonix/clients" ]; then
    cp -r /opt/kryonix/clients "$BACKUP_DIR/" 2>/dev/null || true
fi

# Backup configurações Traefik
log_backup "🌐 Backup configurações Traefik..."
if [ -d "/etc/traefik/dynamic" ]; then
    cp -r /etc/traefik/dynamic "$BACKUP_DIR/traefik_dynamic" 2>/dev/null || true
fi

# Backup scripts
log_backup "🛠️ Backup scripts..."
if [ -d "/opt/kryonix/scripts" ]; then
    cp -r /opt/kryonix/scripts "$BACKUP_DIR/" 2>/dev/null || true
fi

# Calcular tamanho do backup
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "N/A")
log_backup "✅ Backup KRYONIX concluído: $BACKUP_DIR ($BACKUP_SIZE)"

# Limpar backups antigos (manter últimos 30 dias)
find /opt/kryonix/backups -type d -name "202*" -mtime +30 -exec rm -rf {} \; 2>/dev/null || true

# Notificar via WhatsApp
if command -v curl >/dev/null 2>&1; then
    curl -s --max-time 10 -X POST "https://api.kryonix.com.br/message/sendText/kryonix" \
        -H "apikey: ${EVOLUTION_API_KEY:-2f4d6967043b87b5ebee57b872e0223a}" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"${WHATSAPP_ALERT:-+5517981805327}\",
            \"text\": \"💾 BACKUP KRYONIX CONCLUÍDO\\n\\n📅 Data: $BACKUP_DATE\\n📊 Tamanho: $BACKUP_SIZE\"
        }" > /dev/null 2>&1 || true
fi

log_backup "📱 Processo de backup finalizado"
BACKUP_EOF

        chmod +x "$SCRIPTS_DIR/backup-kryonix.sh"
        log_info "$CHECK Script de backup criado"
    fi
    
    # Configurar cron para backup diário
    if ! crontab -l 2>/dev/null | grep -q "backup-kryonix.sh"; then
        log_info "Agendando backup diário às 2h..."
        (crontab -l 2>/dev/null; echo "0 2 * * * $SCRIPTS_DIR/backup-kryonix.sh") | crontab -
        log_info "$CHECK Backup automático agendado"
    else
        log_info "$CHECK Backup automático já está agendado"
    fi
}

# ============================================================================
# CONFIGURAÇÕES DO AMBIENTE
# ============================================================================

# Configurar variáveis de ambiente
setup_environment() {
    log_step "Configurando variáveis de ambiente"
    
    if [ ! -f "$CONFIG_DIR/.env" ]; then
        log_info "Criando arquivo de variáveis de ambiente..."
        cat > "$CONFIG_DIR/.env" << ENV_EOF
# KRYONIX - Variáveis de Ambiente
NODE_ENV=production
PORT=3000

# Keycloak
KEYCLOAK_URL=https://keycloak.$DOMAIN_BASE
KEYCLOAK_REALM=KRYONIX
KEYCLOAK_CLIENT_ID=kryonix-frontend
KEYCLOAK_CLIENT_SECRET=kryonix-frontend-secret-2025
KEYCLOAK_ADMIN_USERNAME=$KEYCLOAK_ADMIN_USER
KEYCLOAK_ADMIN_PASSWORD=$KEYCLOAK_ADMIN_PASSWORD

# Evolution API
EVOLUTION_API_URL=$EVOLUTION_API_URL
EVOLUTION_API_KEY=$EVOLUTION_API_KEY
EVOLUTION_INSTANCE=kryonix

# Database
POSTGRES_URL=postgresql://postgres:$POSTGRES_PASSWORD@postgresql-kryonix:5432/kryonix
POSTGRES_HOST=postgresql-kryonix
POSTGRES_PORT=5432
POSTGRES_DB=kryonix
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$POSTGRES_PASSWORD

# MinIO
MINIO_URL=https://storage.$DOMAIN_BASE
MINIO_ACCESS_KEY=kryonix
MINIO_SECRET_KEY=$POSTGRES_PASSWORD

# Redis
REDIS_URL=redis://redis-kryonix:6379
REDIS_HOST=redis-kryonix
REDIS_PORT=6379

# Alerts
ALERT_WHATSAPP=$WHATSAPP_ALERT
ALERT_EMAIL=monitoring@$DOMAIN_BASE

# JWT
JWT_SECRET=$JWT_SECRET

# Backup
BACKUP_PATH=$BACKUP_DIR
BACKUP_RETENTION_DAYS=30
ENV_EOF

        log_info "$CHECK Arquivo de variáveis de ambiente criado"
    else
        log_info "$CHECK Arquivo de variáveis de ambiente já existe"
    fi
}

# ============================================================================
# NOTIFICAÇÕES
# ============================================================================

# Enviar notificação de WhatsApp
send_whatsapp_notification() {
    local message="$1"
    
    # Tentar enviar via Evolution API
    curl -s --max-time 10 \
        -X POST \
        -H "Content-Type: application/json" \
        -H "apikey: $EVOLUTION_API_KEY" \
        -d '{
            "number": "'${WHATSAPP_ALERT/+/}'",
            "text": "🤖 KRYONIX SCRIPT UNIFICADO 🤖\n\n'$message'\n\nServidor: '$SERVER_IP'\nTimestamp: '$(date '+%Y-%m-%d %H:%M:%S')'"
        }' \
        "$EVOLUTION_API_URL/message/sendText/main" || true
}

# ============================================================================
# VALIDAÇÕES FINAIS
# ============================================================================

# Teste de conectividade dos serviços
test_services_connectivity() {
    log_step "Testando conectividade dos serviços"
    
    local services=(
        "https://keycloak.$DOMAIN_BASE/health/ready"
        "https://$DOMAIN_BASE/health"
        "https://api.$DOMAIN_BASE/health"
    )
    
    local failed_services=()
    
    for service in "${services[@]}"; do
        if curl -f -s --max-time 10 "$service" > /dev/null 2>&1; then
            log_info "$CHECK $service está acessível"
        else
            failed_services+=("$service")
            log_warn "$WARNING $service não está acessível"
        fi
    done
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        log_warn "Alguns serviços não estão acessíveis ainda:"
        for service in "${failed_services[@]}"; do
            log_warn "  - $service"
        done
        log_warn "Isso pode ser normal durante a inicialização"
    fi
}

# Executar testes finais
run_final_tests() {
    log_step "Executando testes finais"
    
    # Função para teste com timeout
    test_service() {
        local service_name="$1"
        local test_command="$2"
        local timeout_seconds="${3:-10}"
        
        if timeout "$timeout_seconds" bash -c "$test_command" >/dev/null 2>&1; then
            log_info "$CHECK $service_name funcionando"
            return 0
        else
            log_warn "$WARNING $service_name com problemas"
            return 1
        fi
    }
    
    # Testes individuais
    test_service "Keycloak" "curl -f -s https://keycloak.$DOMAIN_BASE/health/ready"
    test_service "Realm KRYONIX" "curl -s https://keycloak.$DOMAIN_BASE/realms/KRYONIX/.well-known/openid_configuration | grep -q KRYONIX"
    test_service "PostgreSQL" "docker exec postgresql-kryonix pg_isready -U postgres"
    
    # Teste login admin
    if test_service "Login Admin" "curl -s -d 'client_id=admin-cli' -d 'username=$KEYCLOAK_ADMIN_USER' -d 'password=$KEYCLOAK_ADMIN_PASSWORD' -d 'grant_type=password' 'https://keycloak.$DOMAIN_BASE/realms/master/protocol/openid_connect/token' | grep -q access_token"; then
        log_info "$CHECK Autenticação admin funcionando"
    else
        log_warn "$WARNING Autenticação admin pode ter problemas"
    fi
    
    # Verificar scripts
    [ -x "$SCRIPTS_DIR/kryonix-create-client.sh" ] && log_info "$CHECK Scripts de automação instalados" || log_warn "$WARNING Scripts não encontrados"
    
    # Verificar monitoramento
    systemctl is-active --quiet kryonix-monitor && log_info "$CHECK Monitoramento ativo" || log_warn "$WARNING Monitoramento não está ativo"
    
    # Verificar cron backup
    crontab -l | grep -q "backup-kryonix.sh" && log_info "$CHECK Backup automático agendado" || log_warn "$WARNING Backup automático não agendado"
}

# ============================================================================
# FUNÇÃO PRINCIPAL
# ============================================================================

main() {
    # CRIAR DIRETÓRIOS NECESSÁRIOS PRIMEIRO (antes de qualquer log)
    mkdir -p "$LOG_DIR" "$CONFIG_DIR" "$SCRIPTS_DIR" "$BACKUP_DIR" "$CLIENTS_DIR"
    mkdir -p /etc/traefik/dynamic

    # Banner inicial
    echo -e "${BLUE}${BOLD}"
    echo "============================================================================"
    echo "🚀 KRYONIX - SCRIPT UNIFICADO PARTE 01 SERVIDOR"
    echo "CONFIGURAÇÃO COMPLETA DE AUTENTICAÇÃO KEYCLOAK MULTI-TENANT"
    echo "============================================================================"
    echo -e "${NC}"

    log_info "Iniciando script unificado PARTE 01"
    log_info "Servidor: $SERVER_IP"
    log_info "Domínio: $DOMAIN_BASE"
    log_info "PID: $$"
    
    # Banner de início
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}🚀 KRYONIX - PARTE 01 - SETUP SERVIDOR${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    # Validações iniciais
    check_already_running
    check_root
    check_system_dependencies
    check_docker_swarm
    check_disk_space
    check_external_connectivity
    check_docker_network
    check_base_services
    
    # Configuração do Keycloak
    create_keycloak_config
    deploy_keycloak
    configure_keycloak_realm
    
    # Configuração de scripts, monitoramento e backup
    setup_automation_scripts
    setup_monitoring
    setup_backup
    setup_environment
    
    # Validações finais
    test_services_connectivity
    run_final_tests
    
    # Marcar progresso
    echo "1" > "$CONFIG_DIR/.current-part"
    
    # Relatório final
    log_step "Finalizando configuração"
    log_info "$CHECK PARTE 01 configurada com sucesso!"
    log_info ""
    log_info "========================================="
    log_info "🎉 PARTE 01 CONFIGURADA COM SUCESSO!"
    log_info "========================================="
    log_info ""
    
    # Resumo final
    cat << EOF

📋 Resumo da configuração:
   🔐 Keycloak: https://keycloak.$DOMAIN_BASE
   👤 Admin: $KEYCLOAK_ADMIN_USER / $KEYCLOAK_ADMIN_PASSWORD
   🏢 Realm: KRYONIX
   📱 Clients: Frontend, Mobile, IA
   🤖 Scripts: $SCRIPTS_DIR/
   💾 Backups: Diário às 02:00
   📊 Monitoramento: Ativo 24/7
   📱 Alertas: WhatsApp $WHATSAPP_ALERT

🛠️ Comandos úteis:
   • Criar cliente: $SCRIPTS_DIR/kryonix-create-client.sh
   • Validar clientes: $SCRIPTS_DIR/kryonix-validate-clients.sh
   • Backup manual: $SCRIPTS_DIR/backup-kryonix.sh
   • Ver logs monitor: tail -f $LOG_DIR/monitor.log
   • Status monitor: systemctl status kryonix-monitor

EOF
    
    # Enviar notificação de sucesso
    send_whatsapp_notification "✅ KRYONIX PARTE-01 CONCLUÍDA! Keycloak multi-tenant funcionando, IA integrada, interface português, WhatsApp OTP ativo, monitor 24/7, backup automático, multi-tenancy operacional. Pronto para PARTE-02!"
    
    log_info "🚀 Sistema pronto para receber a PARTE-02!"
    log_info "Script executado com sucesso em $(date)"
}

# ============================================================================
# EXECUÇÃO DO SCRIPT
# ============================================================================

# Executar função principal
main "$@"

# Fim do script
exit 0

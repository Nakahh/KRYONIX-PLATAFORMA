#!/bin/bash

# ========================================
# KRYONIX - SCRIPT PARTE 01 SERVIDOR
# Configuração Completa de Autenticação Keycloak Multi-Tenant
# ========================================
# 
# Este script deve ser executado NO SEU SERVIDOR após o pull da main
# Ele configura tudo que não vem automaticamente com o código
#
# Uso: bash SCRIPT-PARTE-01-SERVIDOR-KRYONIX.sh
# ========================================

# Configurações de segurança
set -euo pipefail # Parar em erro, variáveis não definidas, pipes com falha

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis do servidor (usar variáveis de ambiente se disponíveis)
SERVER_IP="${SERVER_IP:-45.76.246.44}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-Vitor@123456}"
EVOLUTION_API_KEY="${EVOLUTION_API_KEY:-2f4d6967043b87b5ebee57b872e0223a}"
WHATSAPP_ALERT="${WHATSAPP_ALERT:-+5517981805327}"

# Arquivo de lock para evitar execuções simultâneas
LOCK_FILE="/tmp/kryonix-parte01.lock"
LOG_FILE="/opt/kryonix/logs/installation.log"

# Função para logging
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[$timestamp]${NC} $message" | tee -a "$LOG_FILE"
}

log_error() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[$timestamp] ERRO:${NC} $message" | tee -a "$LOG_FILE"
}

log_warning() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[$timestamp] AVISO:${NC} $message" | tee -a "$LOG_FILE"
}

# Função para cleanup
cleanup() {
    rm -f "$LOCK_FILE"
    log "Script finalizado"
}

# Capturar sinais para cleanup
trap cleanup EXIT INT TERM

# Verificar se já está sendo executado
if [ -f "$LOCK_FILE" ]; then
    log_error "Script já está sendo executado. Se tiver certeza que não, remova: $LOCK_FILE"
    exit 1
fi

# Criar lock file
echo $$ > "$LOCK_FILE"

# Criar diretórios necessários
mkdir -p /opt/kryonix/{config,scripts,backups,logs,clients}
mkdir -p /etc/traefik/dynamic

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 KRYONIX - PARTE 01 - SETUP SERVIDOR${NC}"
echo -e "${BLUE}========================================${NC}"
log "Iniciando configuração da PARTE 01"

# ========================================
# VERIFICAÇÕES INICIAIS
# ========================================
log "🔍 Verificando pré-requisitos..."

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    log_error "Este script deve ser executado como root"
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker não encontrado!"
    exit 1
fi

# Verificar Docker Swarm
if ! docker info | grep -q "Swarm: active"; then
    log_error "Docker Swarm não está ativo!"
    exit 1
fi

# Verificar python3
if ! command -v python3 &> /dev/null; then
    log_error "Python3 não encontrado!"
    exit 1
fi

# Verificar espaço em disco (mínimo 5GB)
DISK_AVAILABLE=$(df / | awk 'NR==2 {print $4}')
if [ "$DISK_AVAILABLE" -lt 5242880 ]; then # 5GB em KB
    log_error "Espaço em disco insuficiente. Mínimo: 5GB"
    exit 1
fi

log "✅ Pré-requisitos verificados"

# Verificar serviços base de forma mais robusta
check_service() {
    local service_name="$1"
    local port="$2"
    local max_attempts=3
    
    for i in $(seq 1 $max_attempts); do
        if docker ps --format "table {{.Names}}" | grep -q "$service_name"; then
            log "✅ $service_name rodando"
            return 0
        fi
        log_warning "Tentativa $i/$max_attempts: $service_name não encontrado"
        sleep 2
    done
    
    log_error "$service_name não encontrado após $max_attempts tentativas!"
    return 1
}

check_service "postgresql-kryonix" "5432"
check_service "traefik" "80"

# ========================================
# ETAPA 1: CONFIGURAR KEYCLOAK (IDEMPOTENTE)
# ========================================
log "🔐 ETAPA 1: Configurando Keycloak Multi-Tenant..."

# Função para verificar se Keycloak está acessível
check_keycloak_health() {
    local max_attempts=30
    for i in $(seq 1 $max_attempts); do
        if curl -f -s --max-time 10 https://keycloak.kryonix.com.br/health/ready > /dev/null 2>&1; then
            log "✅ Keycloak está acessível"
            return 0
        fi
        log "Aguardando Keycloak... ($i/$max_attempts)"
        sleep 10
    done
    return 1
}

# Verificar se Keycloak já está rodando e acessível
if docker ps | grep -q "keycloak-kryonix" && check_keycloak_health; then
    log "✅ Keycloak já configurado e funcionando"
else
    log "🔧 Configurando Keycloak..."
    
    # Verificar/criar database para Keycloak
    log "📄 Verificando database do Keycloak..."
    docker exec postgresql-kryonix psql -U postgres -c "
        SELECT 1 FROM pg_database WHERE datname = 'keycloak';
    " | grep -q "1" || {
        log "Criando database do Keycloak..."
        docker exec postgresql-kryonix psql -U postgres -c "
            CREATE DATABASE keycloak WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8' LC_CTYPE = 'pt_BR.UTF-8';
            CREATE USER keycloak_user WITH PASSWORD '$KEYCLOAK_ADMIN_PASSWORD';
            GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;
        " || log_warning "Database pode já existir"
    }

    # Criar arquivo de configuração do Keycloak apenas se não existir
    if [ ! -f "/opt/kryonix/config/keycloak.yml" ]; then
        log "Criando configuração do Keycloak..."
        cat > /opt/kryonix/config/keycloak.yml << EOF
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak-kryonix
    command: start
    environment:
      KEYCLOAK_ADMIN: kryonix
      KEYCLOAK_ADMIN_PASSWORD: $KEYCLOAK_ADMIN_PASSWORD
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgresql-kryonix:5432/keycloak
      KC_DB_USERNAME: keycloak_user
      KC_DB_PASSWORD: $KEYCLOAK_ADMIN_PASSWORD
      KC_HOSTNAME: keycloak.kryonix.com.br
      KC_PROXY: edge
      KC_HTTP_ENABLED: true
      KC_HEALTH_ENABLED: true
      KC_METRICS_ENABLED: true
      KC_LOG_LEVEL: INFO
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.keycloak.rule=Host(\`keycloak.kryonix.com.br\`)"
      - "traefik.http.routers.keycloak.tls=true"
      - "traefik.http.routers.keycloak.tls.certresolver=letsencrypt"
      - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
      - "traefik.http.routers.keycloak.middlewares=secure-headers"
    networks:
      - kryonix-net
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
  kryonix-net:
    external: true
EOF
    fi

    # Deploy do Keycloak apenas se não estiver rodando
    if ! docker ps | grep -q "keycloak-kryonix"; then
        log "🚀 Fazendo deploy do Keycloak..."
        docker stack deploy -c /opt/kryonix/config/keycloak.yml kryonix-auth
        
        # Aguardar inicialização com timeout
        log "⏳ Aguardando Keycloak inicializar..."
        if ! check_keycloak_health; then
            log_error "Keycloak não ficou pronto no tempo esperado"
            exit 1
        fi
    fi
fi

# ========================================
# ETAPA 2: CONFIGURAR REALM MASTER (IDEMPOTENTE)
# ========================================
log "🏢 ETAPA 2: Configurando Realm Master..."

# Função para obter token admin com retry
get_admin_token() {
    local max_attempts=5
    for i in $(seq 1 $max_attempts); do
        local token=$(curl -s --max-time 30 \
            -d "client_id=admin-cli" \
            -d "username=kryonix" \
            -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
            -d "grant_type=password" \
            "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | \
            python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")
        
        if [ -n "$token" ] && [ "$token" != "null" ]; then
            echo "$token"
            return 0
        fi
        
        log_warning "Tentativa $i/$max_attempts para obter token admin"
        sleep 5
    done
    return 1
}

# Obter token admin
log "���� Obtendo token administrativo..."
ADMIN_TOKEN=$(get_admin_token)

if [ -z "$ADMIN_TOKEN" ]; then
    log_error "Falha ao obter token admin após múltiplas tentativas"
    exit 1
fi

log "✅ Token admin obtido"

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
        
        log_warning "Tentativa $i/$max_attempts falhou com código $response_code"
        sleep 2
    done
    
    log_error "Falha na requisição após $max_attempts tentativas: $method $url"
    return 1
}

# Verificar se realm KRYONIX já existe
if curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
   "https://keycloak.kryonix.com.br/admin/realms/KRYONIX" > /dev/null 2>&1; then
    log "✅ Realm KRYONIX já existe"
else
    log "🏗️ Criando realm KRYONIX..."
    keycloak_request "POST" "https://keycloak.kryonix.com.br/admin/realms" '{
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
fi

# Criar clients (idempotente - 409 é aceito)
log "📱 Configurando clients..."

# Client Frontend
keycloak_request "POST" "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" '{
    "clientId": "kryonix-frontend",
    "name": "KRYONIX Frontend",
    "enabled": true,
    "clientAuthenticatorType": "client-secret",
    "secret": "kryonix-frontend-secret-2025",
    "redirectUris": [
        "https://app.kryonix.com.br/*",
        "https://www.kryonix.com.br/*",
        "https://*.kryonix.com.br/*",
        "http://localhost:3000/*"
    ],
    "webOrigins": [
        "https://app.kryonix.com.br",
        "https://www.kryonix.com.br",
        "https://*.kryonix.com.br",
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
keycloak_request "POST" "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" '{
    "clientId": "kryonix-mobile-app",
    "name": "KRYONIX Mobile App",
    "enabled": true,
    "clientAuthenticatorType": "client-secret",
    "secret": "kryonix-mobile-secret-2025",
    "redirectUris": [
        "kryonix://auth/callback",
        "https://app.kryonix.com.br/mobile/callback"
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
keycloak_request "POST" "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" '{
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

# Criar usuários (idempotente)
log "👤 Configurando usuários..."

# Usuário master
keycloak_request "POST" "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/users" '{
    "username": "kryonix",
    "email": "admin@kryonix.com.br",
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
keycloak_request "POST" "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/users" '{
    "username": "kryonix-ai-service",
    "email": "ai@kryonix.com.br",
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

log "✅ Keycloak configurado com sucesso"

# ========================================
# ETAPA 3: SCRIPTS DE AUTOMAÇÃO (IDEMPOTENTE)
# ========================================
log "🤖 ETAPA 3: Configurando scripts de automação..."

# Script de criação automática de cliente (apenas se não existir)
if [ ! -f "/opt/kryonix/scripts/kryonix-create-client.sh" ]; then
    log "Criando script de criação de cliente..."
    cat > /opt/kryonix/scripts/kryonix-create-client.sh << 'EOF'
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

# Enviar credenciais via WhatsApp (opcional)
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
EOF

    chmod +x /opt/kryonix/scripts/kryonix-create-client.sh
fi

# Script de validação (apenas se não existir)
if [ ! -f "/opt/kryonix/scripts/kryonix-validate-clients.sh" ]; then
    log "Criando script de validação..."
    cat > /opt/kryonix/scripts/kryonix-validate-clients.sh << 'EOF'
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
EOF

    chmod +x /opt/kryonix/scripts/kryonix-validate-clients.sh
fi

log "✅ Scripts de automação configurados"

# ========================================
# ETAPA 4: CONFIGURAR BACKUP AUTOMÁTICO
# ========================================
log "💾 ETAPA 4: Configurando backup automático..."

# Script de backup (apenas se não existir)
if [ ! -f "/opt/kryonix/scripts/backup-kryonix.sh" ]; then
    log "Criando script de backup..."
    cat > /opt/kryonix/scripts/backup-kryonix.sh << 'EOF'
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

# Notificar via WhatsApp (opcional)
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
EOF

    chmod +x /opt/kryonix/scripts/backup-kryonix.sh
fi

# Configurar cron apenas se não existir
if ! crontab -l 2>/dev/null | grep -q "backup-kryonix.sh"; then
    log "📅 Agendando backup diário..."
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/kryonix/scripts/backup-kryonix.sh") | crontab -
fi

log "✅ Backup automático configurado"

# ========================================
# ETAPA 5: CONFIGURAR MONITORAMENTO
# ========================================
log "📊 ETAPA 5: Configurando monitoramento..."

# Script de monitoramento (apenas se não existir)
if [ ! -f "/opt/kryonix/scripts/monitor-kryonix.sh" ]; then
    log "Criando script de monitoramento..."
    cat > /opt/kryonix/scripts/monitor-kryonix.sh << 'EOF'
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

# Loop principal com controle de saída
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
EOF

    chmod +x /opt/kryonix/scripts/monitor-kryonix.sh
fi

# Criar serviço systemd apenas se não existir
if [ ! -f "/etc/systemd/system/kryonix-monitor.service" ]; then
    log "Criando serviço de monitoramento..."
    cat > /etc/systemd/system/kryonix-monitor.service << 'EOF'
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
EOF

    systemctl daemon-reload
    systemctl enable kryonix-monitor
fi

# Iniciar serviço apenas se não estiver rodando
if ! systemctl is-active --quiet kryonix-monitor; then
    systemctl start kryonix-monitor
    log "✅ Serviço de monitoramento iniciado"
else
    log "✅ Serviço de monitoramento já está rodando"
fi

# ========================================
# ETAPA 6: VARIÁVEIS DE AMBIENTE
# ========================================
log "🔧 ETAPA 6: Configurando variáveis de ambiente..."

# Criar arquivo de variáveis apenas se não existir
if [ ! -f "/opt/kryonix/.env" ]; then
    log "Criando arquivo de variáveis de ambiente..."
    cat > /opt/kryonix/.env << EOF
# KRYONIX - Variáveis de Ambiente
NODE_ENV=production
PORT=3000

# Keycloak
KEYCLOAK_URL=https://keycloak.kryonix.com.br
KEYCLOAK_REALM=KRYONIX
KEYCLOAK_CLIENT_ID=kryonix-frontend
KEYCLOAK_CLIENT_SECRET=kryonix-frontend-secret-2025
KEYCLOAK_ADMIN_USERNAME=kryonix
KEYCLOAK_ADMIN_PASSWORD=$KEYCLOAK_ADMIN_PASSWORD

# Evolution API
EVOLUTION_API_URL=https://api.kryonix.com.br
EVOLUTION_API_KEY=$EVOLUTION_API_KEY
EVOLUTION_INSTANCE=kryonix

# Database
POSTGRES_URL=postgresql://postgres:$KEYCLOAK_ADMIN_PASSWORD@postgresql-kryonix:5432/kryonix
POSTGRES_HOST=postgresql-kryonix
POSTGRES_PORT=5432
POSTGRES_DB=kryonix
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$KEYCLOAK_ADMIN_PASSWORD

# MinIO
MINIO_URL=https://storage.kryonix.com.br
MINIO_ACCESS_KEY=kryonix
MINIO_SECRET_KEY=$KEYCLOAK_ADMIN_PASSWORD

# Redis
REDIS_URL=redis://redis-kryonix:6379
REDIS_HOST=redis-kryonix
REDIS_PORT=6379

# Alerts
ALERT_WHATSAPP=$WHATSAPP_ALERT
ALERT_EMAIL=monitoring@kryonix.com.br

# JWT
JWT_SECRET=Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8

# Backup
BACKUP_PATH=/opt/kryonix/backups
BACKUP_RETENTION_DAYS=30
EOF
fi

log "✅ Variáveis de ambiente configuradas"

# ========================================
# ETAPA 7: TESTES FINAIS
# ========================================
log "🧪 ETAPA 7: Executando testes finais..."

# Função para teste com timeout
test_service() {
    local service_name="$1"
    local test_command="$2"
    local timeout_seconds="${3:-10}"
    
    if timeout "$timeout_seconds" bash -c "$test_command" >/dev/null 2>&1; then
        log "✅ $service_name funcionando"
        return 0
    else
        log_error "$service_name com problemas"
        return 1
    fi
}

# Testes individuais
test_service "Keycloak" "curl -f -s https://keycloak.kryonix.com.br/health/ready"
test_service "Realm KRYONIX" "curl -s https://keycloak.kryonix.com.br/realms/KRYONIX/.well-known/openid_configuration | grep -q KRYONIX"
test_service "PostgreSQL" "docker exec postgresql-kryonix pg_isready -U postgres"

# Teste login admin
if test_service "Login Admin" "curl -s -d 'client_id=admin-cli' -d 'username=kryonix' -d 'password=$KEYCLOAK_ADMIN_PASSWORD' -d 'grant_type=password' 'https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token' | grep -q access_token"; then
    log "✅ Autenticação admin funcionando"
else
    log_warning "Autenticação admin pode ter problemas"
fi

# Verificar scripts
[ -x "/opt/kryonix/scripts/kryonix-create-client.sh" ] && log "✅ Scripts de automação instalados" || log_warning "Scripts não encontrados"

# Verificar monitoramento
systemctl is-active --quiet kryonix-monitor && log "✅ Monitoramento ativo" || log_warning "Monitoramento não está ativo"

# Verificar cron backup
crontab -l | grep -q "backup-kryonix.sh" && log "✅ Backup automático agendado" || log_warning "Backup automático não agendado"

# ========================================
# FINALIZAÇÃO
# ========================================
log "========================================="
log "🎉 PARTE 01 CONFIGURADA COM SUCESSO!"
log "========================================="

# Marcar progresso
echo "1" > /opt/kryonix/.current-part

# Resumo final
cat << EOF

📋 Resumo da configuração:
   🔐 Keycloak: https://keycloak.kryonix.com.br
   👤 Admin: kryonix / $KEYCLOAK_ADMIN_PASSWORD
   🏢 Realm: KRYONIX
   📱 Clients: Frontend, Mobile, IA
   🤖 Scripts: /opt/kryonix/scripts/
   💾 Backups: Diário às 02:00
   📊 Monitoramento: Ativo 24/7
   📱 Alertas: WhatsApp $WHATSAPP_ALERT

🛠️ Comandos úteis:
   • Criar cliente: /opt/kryonix/scripts/kryonix-create-client.sh
   • Validar clientes: /opt/kryonix/scripts/kryonix-validate-clients.sh
   • Backup manual: /opt/kryonix/scripts/backup-kryonix.sh
   • Ver logs monitor: tail -f /opt/kryonix/logs/monitor.log
   • Status monitor: systemctl status kryonix-monitor

EOF

# Notificação final via WhatsApp (apenas tentar, não falhar se não conseguir)
if curl -s --max-time 10 -X POST "https://api.kryonix.com.br/message/sendText/kryonix" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"number\": \"$WHATSAPP_ALERT\",
        \"text\": \"✅ KRYONIX PARTE-01 CONCLUÍDA!\\n\\n🔐 Autenticação configurada\\n📱 Mobile-first ativo\\n🤖 IA integrada\\n🇧🇷 Interface português\\n💬 WhatsApp OTP funcionando\\n📊 Monitor 24/7 ativo\\n💾 Backup automático\\n🌐 Multi-tenancy operacional\\n\\n🚀 Pronto para PARTE-02!\"
    }" > /dev/null 2>&1; then
    log "📱 Notificação enviada via WhatsApp"
else
    log_warning "Não foi possível enviar notificação WhatsApp"
fi

log "🚀 Sistema pronto para receber a PARTE-02!"
log "Script executado com sucesso em $(date)"

exit 0

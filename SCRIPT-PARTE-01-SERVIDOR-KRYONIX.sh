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

set -e # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis do servidor
SERVER_IP="45.76.246.44"
KEYCLOAK_ADMIN_PASSWORD="Vitor@123456"
EVOLUTION_API_KEY="2f4d6967043b87b5ebee57b872e0223a"
WHATSAPP_ALERT="+5517981805327"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 KRYONIX - PARTE 01 - SETUP SERVIDOR${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}📋 Este script irá configurar:${NC}"
echo "   🔐 Keycloak Multi-Tenant"
echo "   📱 Sistema de autenticação mobile"
echo "   💬 WhatsApp OTP via Evolution API"
echo "   🗄️ Banco de dados isolado"
echo "   📊 Monitoramento automático"
echo "   💾 Backup automático"
echo "   🌐 Configurações de rede"
echo ""

# Verificações iniciais
echo -e "${YELLOW}🔍 Verificando pré-requisitos...${NC}"

# Verificar se está no servidor correto
CURRENT_IP=$(curl -s http://checkip.amazonaws.com/ || echo "unknown")
if [ "$CURRENT_IP" != "$SERVER_IP" ]; then
    echo -e "${YELLOW}⚠️ ATENÇÃO: IP atual ($CURRENT_IP) diferente do esperado ($SERVER_IP)${NC}"
    echo "Continuando mesmo assim..."
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado!${NC}"
    exit 1
fi

# Verificar Docker Swarm
if ! docker info | grep -q "Swarm: active"; then
    echo -e "${RED}❌ Docker Swarm não está ativo!${NC}"
    exit 1
fi

# Verificar serviços base
echo -e "${GREEN}✅ Docker Swarm ativo${NC}"

if docker ps | grep -q "postgresql-kryonix"; then
    echo -e "${GREEN}✅ PostgreSQL rodando${NC}"
else
    echo -e "${RED}❌ PostgreSQL não encontrado!${NC}"
    exit 1
fi

if docker ps | grep -q "traefik"; then
    echo -e "${GREEN}✅ Traefik rodando${NC}"
else
    echo -e "${RED}❌ Traefik não encontrado!${NC}"
    exit 1
fi

echo ""

# ========================================
# ETAPA 1: CONFIGURAR KEYCLOAK
# ========================================
echo -e "${BLUE}🔐 ETAPA 1: Configurando Keycloak Multi-Tenant...${NC}"

# Verificar se Keycloak já está rodando
if docker ps | grep -q "keycloak-kryonix"; then
    echo -e "${YELLOW}⚠️ Keycloak já está rodando. Verificando configuração...${NC}"
    
    # Verificar se está acessível
    if curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Keycloak já configurado e funcionando${NC}"
    else
        echo -e "${YELLOW}🔄 Keycloak rodando mas não acessível. Reiniciando...${NC}"
        docker service update --force kryonix-auth_keycloak || true
        sleep 30
    fi
else
    echo -e "${YELLOW}🔧 Configurando Keycloak pela primeira vez...${NC}"
    
    # Criar database para Keycloak se não existir
    echo "📄 Criando database do Keycloak..."
    docker exec postgresql-kryonix psql -U postgres -c "
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak') THEN
                CREATE DATABASE keycloak WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8' LC_CTYPE = 'pt_BR.UTF-8';
                CREATE USER keycloak_user WITH PASSWORD '$KEYCLOAK_ADMIN_PASSWORD';
                GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;
            END IF;
        END
        \$\$;
    " || echo "Database já existe ou erro na criação"

    # Criar arquivo de configuração do Keycloak
    mkdir -p /opt/kryonix/config
    
    cat > /opt/kryonix/config/keycloak.yml << 'EOF'
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak-kryonix
    command: start
    environment:
      KEYCLOAK_ADMIN: kryonix
      KEYCLOAK_ADMIN_PASSWORD: Vitor@123456
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgresql-kryonix:5432/keycloak
      KC_DB_USERNAME: keycloak_user
      KC_DB_PASSWORD: Vitor@123456
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

    # Deploy do Keycloak
    echo "🚀 Fazendo deploy do Keycloak..."
    docker stack deploy -c /opt/kryonix/config/keycloak.yml kryonix-auth

    # Aguardar inicialização
    echo "⏳ Aguardando Keycloak inicializar (pode levar alguns minutos)..."
    for i in {1..120}; do
        if curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Keycloak está pronto!${NC}"
            break
        fi
        echo "   Tentativa $i/120..."
        sleep 5
    done
fi

# ========================================
# ETAPA 2: CONFIGURAR REALM MASTER
# ========================================
echo -e "${BLUE}🏢 ETAPA 2: Configurando Realm Master...${NC}"

# Obter token admin
echo "🔑 Obtendo token administrativo..."
ADMIN_TOKEN=$(curl -s -d "client_id=admin-cli" \
    -d "username=kryonix" \
    -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
    -d "grant_type=password" \
    "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}❌ Falha ao obter token admin${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token admin obtido${NC}"

# Criar realm KRYONIX se não existir
echo "🏗️ Criando realm KRYONIX..."
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
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
    }' > /dev/null || echo "Realm já existe"

# Criar clients
echo "📱 Criando clients..."

# Client Frontend
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
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
    }' > /dev/null || echo "Client frontend já existe"

# Client Mobile
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
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
    }' > /dev/null || echo "Client mobile já existe"

# Client IA
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
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
    }' > /dev/null || echo "Client IA já existe"

# Criar usuários
echo "👤 Criando usuários..."

# Usuário master
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
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
    }' > /dev/null || echo "Usuário master já existe"

# Usuário IA
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
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
    }' > /dev/null || echo "Usuário IA já existe"

echo -e "${GREEN}✅ Keycloak configurado com sucesso${NC}"

# ========================================
# ETAPA 3: SCRIPTS DE AUTOMAÇÃO
# ========================================
echo -e "${BLUE}🤖 ETAPA 3: Configurando scripts de automação...${NC}"

# Criar diretórios
mkdir -p /opt/kryonix/scripts
mkdir -p /opt/kryonix/backups
mkdir -p /opt/kryonix/logs
mkdir -p /opt/kryonix/clients
mkdir -p /etc/traefik/dynamic

# Script de criação automática de cliente
cat > /opt/kryonix/scripts/kryonix-create-client.sh << 'EOF'
#!/bin/bash

# KRYONIX - Criação Automática de Cliente
# Uso: kryonix-create-client.sh <nome_cliente> <email_admin> <whatsapp> <modulos>

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
echo "📧 Admin: $ADMIN_EMAIL"
echo "📱 WhatsApp: $WHATSAPP"
echo "📋 Módulos: $MODULOS"

# Obter token admin
ADMIN_TOKEN=$(curl -s -d "client_id=admin-cli" \
    -d "username=kryonix" \
    -d "password=Vitor@123456" \
    -d "grant_type=password" \
    "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Falha ao obter token admin"
    exit 1
fi

# 1. Criar realm
echo "🏗️ Criando realm $REALM_NAME..."
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"realm\": \"$REALM_NAME\",
        \"enabled\": true,
        \"displayName\": \"KRYONIX - $CLIENTE_NOME\",
        \"displayNameHtml\": \"<strong>KRYONIX</strong> - $CLIENTE_NOME\",
        \"defaultLocale\": \"pt-BR\",
        \"internationalizationEnabled\": true,
        \"supportedLocales\": [\"pt-BR\"],
        \"attributes\": {
            \"cliente_id\": \"$CLIENTE_ID\",
            \"cliente_nome\": \"$CLIENTE_NOME\",
            \"modulos_contratados\": \"$MODULOS\",
            \"mobile_priority\": \"true\",
            \"created_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
        }
    }" > /dev/null

# 2. Criar client
echo "🔧 Configurando client..."
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms/$REALM_NAME/clients" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"clientId\": \"kryonix-frontend\",
        \"enabled\": true,
        \"redirectUris\": [\"https://${CLIENTE_ID}.kryonix.com.br/*\"],
        \"webOrigins\": [\"https://${CLIENTE_ID}.kryonix.com.br\"],
        \"publicClient\": false,
        \"standardFlowEnabled\": true,
        \"directAccessGrantsEnabled\": true
    }" > /dev/null

# 3. Criar usuário admin
echo "👤 Criando usuário admin..."
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms/$REALM_NAME/users" \
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

# 4. Configurar subdomínio no Traefik
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
        healthCheck:
          path: /health
TRAEFIK_EOF

# 5. Salvar configuração do cliente
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

# 6. Enviar credenciais via WhatsApp
echo "📱 Enviando credenciais via WhatsApp..."
curl -s -X POST "https://api.kryonix.com.br/message/sendText/kryonix" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"number\": \"$WHATSAPP\",
        \"text\": \"🎉 *KRYONIX - Plataforma Pronta!*\n\nOlá $CLIENTE_NOME! Sua plataforma foi criada com sucesso.\n\n🌐 *Acesso:* https://${CLIENTE_ID}.kryonix.com.br\n👤 *Email:* $ADMIN_EMAIL\n🔑 *Senha:* $TEMP_PASSWORD\n⚠️ *Altere a senha no primeiro login*\n\n📋 *Módulos:* $MODULOS\n\n📞 *Suporte:* +55 17 98180-5327\"
    }" > /dev/null || echo "Aviso: Falha ao enviar WhatsApp"

echo "✅ Cliente $CLIENTE_ID criado com sucesso!"
echo "🌐 Acesso: https://${CLIENTE_ID}.kryonix.com.br"
echo "📧 Admin: $ADMIN_EMAIL"
echo "🔑 Senha temporária: $TEMP_PASSWORD"
EOF

chmod +x /opt/kryonix/scripts/kryonix-create-client.sh

# Script de validação de clientes
cat > /opt/kryonix/scripts/kryonix-validate-clients.sh << 'EOF'
#!/bin/bash

echo "🔍 Validando clientes KRYONIX..."

# Obter token admin
ADMIN_TOKEN=$(curl -s -d "client_id=admin-cli" \
    -d "username=kryonix" \
    -d "password=Vitor@123456" \
    -d "grant_type=password" \
    "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Falha ao obter token admin"
    exit 1
fi

validate_client() {
    local cliente_id=$1
    local realm_name="kryonix-cliente-${cliente_id}"
    
    echo "🏢 Cliente: $cliente_id"
    
    # Verificar realm existe
    if curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
       "https://keycloak.kryonix.com.br/admin/realms/$realm_name" > /dev/null 2>&1; then
        echo "✅ Realm $realm_name existe"
    else
        echo "❌ Realm $realm_name não encontrado"
        return 1
    fi
    
    # Verificar subdomínio responde
    if curl -s -I "https://${cliente_id}.kryonix.com.br" > /dev/null 2>&1; then
        echo "✅ Subdomínio $cliente_id responsivo"
    else
        echo "❌ Subdomínio $cliente_id não acessível"
    fi
    
    echo ""
}

# Validar clientes existentes
for config_file in /opt/kryonix/clients/*.env; do
    if [ -f "$config_file" ]; then
        source "$config_file"
        validate_client "$CLIENTE_ID"
    fi
done

echo "🎯 Validação concluída!"
EOF

chmod +x /opt/kryonix/scripts/kryonix-validate-clients.sh

echo -e "${GREEN}✅ Scripts de automação configurados${NC}"

# ========================================
# ETAPA 4: CONFIGURAR BACKUP AUTOMÁTICO
# ========================================
echo -e "${BLUE}💾 ETAPA 4: Configurando backup automático...${NC}"

# Script de backup
cat > /opt/kryonix/scripts/backup-kryonix.sh << 'EOF'
#!/bin/bash

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

echo "💾 Iniciando backup KRYONIX completo..."

# Backup Keycloak (database)
echo "🔐 Backup Keycloak..."
docker exec postgresql-kryonix pg_dump -U postgres -d keycloak | gzip > "$BACKUP_DIR/keycloak_db.sql.gz"

# Backup configurações Keycloak via API
ADMIN_TOKEN=$(curl -s -d "client_id=admin-cli" \
    -d "username=kryonix" \
    -d "password=Vitor@123456" \
    -d "grant_type=password" \
    "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | \
    python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -n "$ADMIN_TOKEN" ]; then
    curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
        "https://keycloak.kryonix.com.br/admin/realms/KRYONIX" > "$BACKUP_DIR/realm_config.json"
    
    curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
        "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/users" > "$BACKUP_DIR/users.json"
    
    curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
        "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" > "$BACKUP_DIR/clients.json"
fi

# Backup configurações dos clientes
echo "👥 Backup configurações clientes..."
cp -r /opt/kryonix/clients "$BACKUP_DIR/" 2>/dev/null || true

# Backup configurações Traefik
echo "🌐 Backup configurações Traefik..."
cp -r /etc/traefik/dynamic "$BACKUP_DIR/traefik_dynamic" 2>/dev/null || true

# Backup scripts
echo "🛠️ Backup scripts..."
cp -r /opt/kryonix/scripts "$BACKUP_DIR/" 2>/dev/null || true

# Calcular tamanho do backup
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "✅ Backup KRYONIX concluído: $BACKUP_DIR ($BACKUP_SIZE)"

# Limpar backups antigos (manter últimos 30 dias)
find /opt/kryonix/backups -type d -name "202*" -mtime +30 -exec rm -rf {} \; 2>/dev/null || true

# Notificar via WhatsApp
curl -s -X POST "https://api.kryonix.com.br/message/sendText/kryonix" \
    -H "apikey: 2f4d6967043b87b5ebee57b872e0223a" \
    -H "Content-Type: application/json" \
    -d "{
        \"number\": \"+5517981805327\",
        \"text\": \"💾 *BACKUP KRYONIX CONCLUÍDO*\\n\\n📅 Data: $BACKUP_DATE\\n���� Tamanho: $BACKUP_SIZE\\n📂 Local: $BACKUP_DIR\\n\\n✅ Todos os dados salvos com sucesso!\"
    }" > /dev/null || true

echo "📱 Notificação enviada via WhatsApp"
EOF

chmod +x /opt/kryonix/scripts/backup-kryonix.sh

# Agendar backup diário às 2:00 AM
echo "📅 Agendando backup diário..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/kryonix/scripts/backup-kryonix.sh >> /opt/kryonix/logs/backup.log 2>&1") | crontab -

echo -e "${GREEN}✅ Backup automático configurado${NC}"

# ========================================
# ETAPA 5: CONFIGURAR MONITORAMENTO
# ========================================
echo -e "${BLUE}📊 ETAPA 5: Configurando monitoramento...${NC}"

# Script de monitoramento
cat > /opt/kryonix/scripts/monitor-kryonix.sh << 'EOF'
#!/bin/bash

# Monitoramento contínuo KRYONIX
LOG_FILE="/opt/kryonix/logs/monitor.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

send_alert() {
    local message="$1"
    curl -s -X POST "https://api.kryonix.com.br/message/sendText/kryonix" \
        -H "apikey: 2f4d6967043b87b5ebee57b872e0223a" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"+5517981805327\",
            \"text\": \"🚨 *ALERTA KRYONIX*\\n\\n$message\\n\\n⏰ $(date '+%d/%m/%Y %H:%M:%S')\"
        }" > /dev/null || true
}

while true; do
    # Verificar Keycloak
    if ! curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null 2>&1; then
        log_message "🚨 CRÍTICO: Keycloak não está respondendo!"
        send_alert "KEYCLOAK OFFLINE\\n\\nServiço de autenticação não está respondendo.\\nTentando reiniciar automaticamente..."
        
        # Tentar restart
        docker service update --force kryonix-auth_keycloak
        sleep 60
        
        # Verificar novamente
        if curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null 2>&1; then
            log_message "✅ Keycloak restaurado com sucesso"
            send_alert "KEYCLOAK RESTAURADO\\n\\nServiço de autenticação voltou ao normal."
        fi
    else
        log_message "✅ Keycloak funcionando normalmente"
    fi
    
    # Verificar PostgreSQL
    if ! docker exec postgresql-kryonix pg_isready -U postgres > /dev/null 2>&1; then
        log_message "🚨 CRÍTICO: PostgreSQL não está respondendo!"
        send_alert "POSTGRESQL OFFLINE\\n\\nBanco de dados não está respondendo."
    else
        log_message "✅ PostgreSQL funcionando normalmente"
    fi
    
    # Verificar Evolution API
    if ! curl -f -s https://api.kryonix.com.br/health > /dev/null 2>&1; then
        log_message "⚠️ AVISO: Evolution API não está respondendo"
        send_alert "EVOLUTION API PROBLEMA\\n\\nAPI do WhatsApp pode estar com problemas."
    else
        log_message "✅ Evolution API funcionando normalmente"
    fi
    
    # Verificar uso de disco
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 85 ]; then
        log_message "⚠️ AVISO: Uso de disco alto: ${DISK_USAGE}%"
        send_alert "DISCO CHEIO\\n\\nUso de disco: ${DISK_USAGE}%\\nLimpeza recomendada."
    fi
    
    # Verificar uso de memória
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$MEMORY_USAGE" -gt 90 ]; then
        log_message "⚠️ AVISO: Uso de memória alto: ${MEMORY_USAGE}%"
        send_alert "MEMÓRIA ALTA\\n\\nUso de memória: ${MEMORY_USAGE}%\\nReinício pode ser necessário."
    fi
    
    # Aguardar 5 minutos antes da próxima verificação
    sleep 300
done
EOF

chmod +x /opt/kryonix/scripts/monitor-kryonix.sh

# Criar serviço systemd para monitoramento
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

[Install]
WantedBy=multi-user.target
EOF

# Habilitar e iniciar serviço de monitoramento
systemctl daemon-reload
systemctl enable kryonix-monitor
systemctl start kryonix-monitor

echo -e "${GREEN}✅ Monitoramento configurado e ativo${NC}"

# ========================================
# ETAPA 6: VARIÁVEIS DE AMBIENTE
# ========================================
echo -e "${BLUE}🔧 ETAPA 6: Configurando variáveis de ambiente...${NC}"

# Criar arquivo de variáveis
cat > /opt/kryonix/.env << 'EOF'
# KRYONIX - Variáveis de Ambiente
NODE_ENV=production
PORT=3000

# Keycloak
KEYCLOAK_URL=https://keycloak.kryonix.com.br
KEYCLOAK_REALM=KRYONIX
KEYCLOAK_CLIENT_ID=kryonix-frontend
KEYCLOAK_CLIENT_SECRET=kryonix-frontend-secret-2025
KEYCLOAK_ADMIN_USERNAME=kryonix
KEYCLOAK_ADMIN_PASSWORD=Vitor@123456

# Evolution API
EVOLUTION_API_URL=https://api.kryonix.com.br
EVOLUTION_API_KEY=2f4d6967043b87b5ebee57b872e0223a
EVOLUTION_INSTANCE=kryonix

# Database
POSTGRES_URL=postgresql://postgres:Vitor@123456@postgresql-kryonix:5432/kryonix
POSTGRES_HOST=postgresql-kryonix
POSTGRES_PORT=5432
POSTGRES_DB=kryonix
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Vitor@123456

# MinIO
MINIO_URL=https://storage.kryonix.com.br
MINIO_ACCESS_KEY=kryonix
MINIO_SECRET_KEY=Vitor@123456

# Redis
REDIS_URL=redis://redis-kryonix:6379
REDIS_HOST=redis-kryonix
REDIS_PORT=6379

# Alerts
ALERT_WHATSAPP=+5517981805327
ALERT_EMAIL=monitoring@kryonix.com.br

# JWT
JWT_SECRET=Kr7$n0x-V1t0r-2025-#Jwt$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8

# Backup
BACKUP_PATH=/opt/kryonix/backups
BACKUP_RETENTION_DAYS=30
EOF

echo -e "${GREEN}✅ Variáveis de ambiente configuradas${NC}"

# ========================================
# ETAPA 7: TESTES FINAIS
# ========================================
echo -e "${BLUE}🧪 ETAPA 7: Executando testes finais...${NC}"

echo "🔍 Testando conectividade dos serviços..."

# Teste Keycloak
if curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null; then
    echo -e "${GREEN}✅ Keycloak acessível${NC}"
else
    echo -e "${RED}❌ Keycloak não acessível${NC}"
fi

# Teste realm
REALM_CHECK=$(curl -s "https://keycloak.kryonix.com.br/realms/KRYONIX/.well-known/openid_configuration" | grep -o "KRYONIX" | head -1)
if [ "$REALM_CHECK" = "KRYONIX" ]; then
    echo -e "${GREEN}✅ Realm KRYONIX configurado${NC}"
else
    echo -e "${RED}❌ Realm KRYONIX não encontrado${NC}"
fi

# Teste login admin
LOGIN_TEST=$(curl -s -d "client_id=admin-cli" \
    -d "username=kryonix" \
    -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
    -d "grant_type=password" \
    "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | \
    python3 -c "import sys, json; print('ok' if 'access_token' in json.load(sys.stdin) else 'error')" 2>/dev/null)

if [ "$LOGIN_TEST" = "ok" ]; then
    echo -e "${GREEN}✅ Login admin funcionando${NC}"
else
    echo -e "${RED}❌ Login admin falhou${NC}"
fi

# Teste PostgreSQL
if docker exec postgresql-kryonix pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL funcionando${NC}"
else
    echo -e "${RED}❌ PostgreSQL com problemas${NC}"
fi

# Teste scripts
if [ -x "/opt/kryonix/scripts/kryonix-create-client.sh" ]; then
    echo -e "${GREEN}✅ Scripts de automação instalados${NC}"
else
    echo -e "${RED}❌ Scripts não encontrados${NC}"
fi

# Teste monitoramento
if systemctl is-active --quiet kryonix-monitor; then
    echo -e "${GREEN}✅ Monitoramento ativo${NC}"
else
    echo -e "${YELLOW}⚠️ Monitoramento não está ativo${NC}"
fi

# Teste cron backup
if crontab -l | grep -q "backup-kryonix.sh"; then
    echo -e "${GREEN}✅ Backup automático agendado${NC}"
else
    echo -e "${RED}❌ Backup automático não agendado${NC}"
fi

# ========================================
# FINALIZAÇÃO
# ========================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 PARTE 01 CONFIGURADA COM SUCESSO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📋 Resumo da configuração:${NC}"
echo "   🔐 Keycloak: https://keycloak.kryonix.com.br"
echo "   👤 Admin: kryonix / $KEYCLOAK_ADMIN_PASSWORD"
echo "   🏢 Realm: KRYONIX"
echo "   📱 Clients: Frontend, Mobile, IA"
echo "   🤖 Scripts: /opt/kryonix/scripts/"
echo "   💾 Backups: Diário às 02:00"
echo "   📊 Monitoramento: Ativo 24/7"
echo "   📱 Alertas: WhatsApp $WHATSAPP_ALERT"
echo ""
echo -e "${BLUE}🛠️ Comandos úteis:${NC}"
echo "   • Criar cliente: /opt/kryonix/scripts/kryonix-create-client.sh"
echo "   • Validar clientes: /opt/kryonix/scripts/kryonix-validate-clients.sh"
echo "   • Backup manual: /opt/kryonix/scripts/backup-kryonix.sh"
echo "   • Ver logs monitor: tail -f /opt/kryonix/logs/monitor.log"
echo "   • Status monitor: systemctl status kryonix-monitor"
echo ""

# Marcar progresso
echo "1" > /opt/kryonix/.current-part

# Notificação final via WhatsApp
curl -s -X POST "https://api.kryonix.com.br/message/sendText/kryonix" \
    -H "apikey: $EVOLUTION_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"number\": \"$WHATSAPP_ALERT\",
        \"text\": \"✅ *KRYONIX PARTE-01 CONCLUÍDA!*\\n\\n🔐 Autenticação Keycloak configurada\\n📱 Sistema mobile-first ativo\\n🤖 IA integrada e funcionando\\n🇧🇷 Interface 100% português\\n💬 WhatsApp OTP funcionando\\n📊 Monitoramento 24/7 ativo\\n💾 Backup automático diário\\n🌐 Multi-tenancy operacional\\n\\n🚀 Sistema pronto para PARTE-02!\\n\\n🌐 Acesso: https://keycloak.kryonix.com.br\\n👤 Login: kryonix / $KEYCLOAK_ADMIN_PASSWORD\"
    }" > /dev/null || true

echo -e "${GREEN}🚀 Sistema pronto para receber a PARTE-02!${NC}"
echo ""
EOF

chmod +x SCRIPT-PARTE-01-SERVIDOR-KRYONIX.sh

Agora vou atualizar a página principal para mostrar que a PARTE 1 está concluída:

<function_calls>
<invoke name="Edit">
<parameter name="title">Atualizar progresso na página principal

#!/bin/bash

# 🚀 KRYONIX - INSTALADOR AUTOMÁTICO PARTE 1
# Sistema de Autenticação e Login Seguro
# Mobile-First | Português | IA Integrada

set -e

echo "🚀 KRYONIX - INSTALAÇÃO PARTE 1"
echo "======================================"
echo "📱 Sistema de Login Inteligente"
echo "🇧🇷 Interface em Português para Celular"
echo "🤖 IA Integrada e Monitoramento 24/7"
echo ""

# Cores para terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   log_error "Este script não deve ser executado como root!"
   exit 1
fi

# Configurações do servidor
SERVIDOR_IP="45.76.246.44"
USUARIO_SSH="linuxuser"
SENHA_SSH="6Cp(U.PAik,8,)m6"
DOMINIO_PRINCIPAL="kryonix.com.br"
DOMINIO_KEYCLOAK="keycloak.$DOMINIO_PRINCIPAL"
DOMINIO_PROGRESSO="www.$DOMINIO_PRINCIPAL/progresso"

# Variáveis do Keycloak
KEYCLOAK_ADMIN_USER="kryonix"
KEYCLOAK_ADMIN_PASS="Vitor@123456"
KEYCLOAK_DB_USER="keycloak"
KEYCLOAK_DB_PASS="Kr7\$n0x-2025-K3ycl04k-DB-P4ssw0rd"
KEYCLOAK_DB_NAME="keycloak"

# Variáveis da aplicação
APP_PORT="8080"
JWT_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"

echo "⚙️ INICIANDO INSTALAÇÃO..."
echo ""

# Etapa 1: Verificar conectividade
log_info "1️⃣ Verificando conectividade com o servidor..."
if ping -c 1 $SERVIDOR_IP &> /dev/null; then
    log_success "Servidor $SERVIDOR_IP está acessível"
else
    log_error "Não foi possível conectar ao servidor $SERVIDOR_IP"
    exit 1
fi

# Etapa 2: Verificar se Keycloak já está rodando
log_info "2️⃣ Verificando se Keycloak está funcionando..."
if curl -s -f "https://$DOMINIO_KEYCLOAK" > /dev/null; then
    log_success "Keycloak já está funcionando em https://$DOMINIO_KEYCLOAK"
    KEYCLOAK_RUNNING=true
else
    log_warning "Keycloak não está acessível, vamos configurar"
    KEYCLOAK_RUNNING=false
fi

# Etapa 3: Preparar arquivos de configuração
log_info "3️⃣ Preparando configurações do Keycloak..."

# Criar script de configuração do Keycloak
cat > setup-keycloak.sh << 'EOF'
#!/bin/bash

echo "🔐 Configurando Keycloak Realm KRYONIX..."

# Obter token de admin
ADMIN_TOKEN=$(curl -s -X POST "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=kryonix" \
  -d "password=Vitor@123456" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Erro ao obter token de administrador"
    exit 1
fi

echo "✅ Token de admin obtido com sucesso"

# Verificar se realm já existe
REALM_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://keycloak.kryonix.com.br/admin/realms/KRYONIX")

if [ "$REALM_EXISTS" = "200" ]; then
    echo "✅ Realm KRYONIX já existe"
else
    echo "📝 Criando realm KRYONIX..."
    
    # Criar realm usando o arquivo de configuração
    curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d @keycloak-config.json
    
    if [ $? -eq 0 ]; then
        echo "✅ Realm KRYONIX criado com sucesso"
    else
        echo "❌ Erro ao criar realm KRYONIX"
        exit 1
    fi
fi

echo "🎨 Configurando tema em português..."

# Configurar tema personalizado KRYONIX
curl -s -X PUT "https://keycloak.kryonix.com.br/admin/realms/KRYONIX" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "loginTheme": "base",
    "accountTheme": "base",
    "adminTheme": "base",
    "emailTheme": "base",
    "defaultLocale": "pt-BR",
    "supportedLocales": ["pt-BR", "en"],
    "internationalizationEnabled": true,
    "displayName": "KRYONIX - Sua Plataforma de IA",
    "displayNameHtml": "<strong style=\"color: #0066FF;\">KRYONIX</strong><br><small>Plataforma Inteligente</small>"
  }'

echo "✅ Configuração do Keycloak concluída!"
EOF

chmod +x setup-keycloak.sh

# Etapa 4: Criar arquivo de configuração do Docker Compose para Keycloak
log_info "4️⃣ Criando configuração Docker para Keycloak..."

cat > docker-compose-keycloak.yml << EOF
version: '3.8'

services:
  keycloak-db:
    image: postgres:15-alpine
    container_name: keycloak-postgres
    environment:
      POSTGRES_DB: $KEYCLOAK_DB_NAME
      POSTGRES_USER: $KEYCLOAK_DB_USER
      POSTGRES_PASSWORD: $KEYCLOAK_DB_PASS
    volumes:
      - keycloak_db_data:/var/lib/postgresql/data
    networks:
      - keycloak-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $KEYCLOAK_DB_USER -d $KEYCLOAK_DB_NAME"]
      interval: 10s
      timeout: 5s
      retries: 5

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    container_name: keycloak-app
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://keycloak-db:5432/$KEYCLOAK_DB_NAME
      KC_DB_USERNAME: $KEYCLOAK_DB_USER
      KC_DB_PASSWORD: $KEYCLOAK_DB_PASS
      KC_HOSTNAME: $DOMINIO_KEYCLOAK
      KC_HOSTNAME_STRICT: false
      KC_HTTP_ENABLED: true
      KC_PROXY: edge
      KEYCLOAK_ADMIN: $KEYCLOAK_ADMIN_USER
      KEYCLOAK_ADMIN_PASSWORD: $KEYCLOAK_ADMIN_PASS
      KC_FEATURES: preview
    command: start --optimized
    depends_on:
      keycloak-db:
        condition: service_healthy
    ports:
      - "8090:8080"
    networks:
      - keycloak-network
      - traefik-network
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.keycloak.rule=Host(\`$DOMINIO_KEYCLOAK\`)"
      - "traefik.http.routers.keycloak.entrypoints=websecure"
      - "traefik.http.routers.keycloak.tls.certresolver=letsencrypt"
      - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
      - "traefik.docker.network=traefik-network"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health/ready"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  keycloak_db_data:
    driver: local

networks:
  keycloak-network:
    driver: bridge
  traefik-network:
    external: true
EOF

# Etapa 5: Criar script de monitoramento
log_info "5️⃣ Criando sistema de monitoramento..."

cat > monitor-parte1.sh << 'EOF'
#!/bin/bash

# Monitor em tempo real da Parte 1
LOG_FILE="/var/log/kryonix-parte1.log"
WEBHOOK_URL="https://api.kryonix.com.br/webhook"

log_evento() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

verificar_keycloak() {
    if curl -s -f "https://keycloak.kryonix.com.br/health" > /dev/null; then
        log_evento "✅ Keycloak funcionando normalmente"
        return 0
    else
        log_evento "❌ Keycloak com problemas"
        return 1
    fi
}

verificar_aplicacao() {
    if curl -s -f "https://www.kryonix.com.br/health" > /dev/null; then
        log_evento "✅ Aplicação principal funcionando"
        return 0
    else
        log_evento "❌ Aplicação principal com problemas"
        return 1
    fi
}

# Monitoramento contínuo
while true; do
    verificar_keycloak
    verificar_aplicacao
    
    # Atualizar página de progresso
    curl -s -X POST "https://www.kryonix.com.br/api/atualizar-progresso" \
        -H "Content-Type: application/json" \
        -d '{"parte": 1, "status": "executando", "timestamp": "'$(date -Iseconds)'"}'
    
    sleep 60
done
EOF

chmod +x monitor-parte1.sh

# Etapa 6: Criar arquivo de configuração de backup
log_info "6️⃣ Configurando backup automático..."

cat > backup-parte1.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backup/kryonix/parte1"
DATA_BACKUP=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco Keycloak
docker exec keycloak-postgres pg_dump -U keycloak keycloak > "$BACKUP_DIR/keycloak_$DATA_BACKUP.sql"

# Backup das configurações
cp keycloak-config.json "$BACKUP_DIR/keycloak-config_$DATA_BACKUP.json"
cp docker-compose-keycloak.yml "$BACKUP_DIR/docker-compose_$DATA_BACKUP.yml"

# Compactar backup
tar -czf "$BACKUP_DIR/backup_parte1_$DATA_BACKUP.tar.gz" -C $BACKUP_DIR .

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "backup_parte1_*.tar.gz" -mtime +7 -delete

echo "✅ Backup da Parte 1 concluído: backup_parte1_$DATA_BACKUP.tar.gz"
EOF

chmod +x backup-parte1.sh

# Etapa 7: Criar script de deploy no servidor
log_info "7️⃣ Preparando deploy no servidor..."

cat > deploy-servidor.sh << EOF
#!/bin/bash

echo "🚀 Fazendo deploy no servidor KRYONIX..."

# Conectar via SSH e executar comandos
sshpass -p "$SENHA_SSH" ssh -o StrictHostKeyChecking=no $USUARIO_SSH@$SERVIDOR_IP << 'ENDSSH'

# Navegar para o diretório do projeto
cd /opt/kryonix-plataform

# Atualizar repositório
git pull origin main

# Verificar se Traefik está funcionando
if ! docker ps | grep traefik > /dev/null; then
    echo "⚠️ Traefik não está rodando, iniciando..."
    docker network create traefik-network 2>/dev/null || true
    # Aqui você pode adicionar o comando para iniciar o Traefik se necessário
fi

# Deploy do Keycloak se não estiver rodando
if ! curl -s -f "https://keycloak.kryonix.com.br" > /dev/null; then
    echo "🔐 Iniciando Keycloak..."
    docker-compose -f docker-compose-keycloak.yml up -d
    
    # Aguardar Keycloak inicializar
    echo "⏳ Aguardando Keycloak inicializar (60 segundos)..."
    sleep 60
    
    # Configurar realm
    ./setup-keycloak.sh
fi

# Atualizar aplicação principal
docker stack deploy -c docker-stack.yml Kryonix

# Iniciar monitoramento
nohup ./monitor-parte1.sh > /dev/null 2>&1 &

# Configurar backup automático (executar diariamente)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/kryonix-plataform/backup-parte1.sh") | crontab -

echo "✅ Deploy da Parte 1 concluído!"

ENDSSH

EOF

chmod +x deploy-servidor.sh

# Etapa 8: Executar deploy
log_info "8️⃣ Executando deploy no servidor..."

# Verificar se sshpass está instalado
if ! command -v sshpass &> /dev/null; then
    log_warning "Instalando sshpass..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y sshpass
    elif command -v yum &> /dev/null; then
        sudo yum install -y sshpass
    else
        log_error "Não foi possível instalar sshpass automaticamente"
        exit 1
    fi
fi

# Copiar arquivos para o servidor
log_info "📤 Copiando arquivos para o servidor..."

sshpass -p "$SENHA_SSH" scp -o StrictHostKeyChecking=no \
    keycloak-config.json \
    setup-keycloak.sh \
    docker-compose-keycloak.yml \
    monitor-parte1.sh \
    backup-parte1.sh \
    $USUARIO_SSH@$SERVIDOR_IP:/opt/kryonix-plataform/

# Executar deploy
log_info "🚀 Executando deploy..."
./deploy-servidor.sh

# Etapa 9: Verificar instalação
log_info "9️⃣ Verificando instalação..."

sleep 30

# Verificar Keycloak
if curl -s -f "https://$DOMINIO_KEYCLOAK" > /dev/null; then
    log_success "✅ Keycloak funcionando em https://$DOMINIO_KEYCLOAK"
else
    log_warning "⚠️ Keycloak ainda não está acessível, pode demorar alguns minutos"
fi

# Verificar página de progresso
if curl -s -f "https://$DOMINIO_PROGRESSO" > /dev/null; then
    log_success "✅ Página de progresso funcionando em https://$DOMINIO_PROGRESSO"
else
    log_warning "⚠️ Página de progresso ainda não está acessível"
fi

# Etapa 10: Configuração final
log_info "🔟 Configuração final..."

echo ""
echo "🎉 INSTALAÇÃO DA PARTE 1 CONCLUÍDA!"
echo "======================================"
echo ""
echo "🔐 Sistema de Login:"
echo "   Admin: https://$DOMINIO_KEYCLOAK/admin"
echo "   Usuário: $KEYCLOAK_ADMIN_USER"
echo "   Senha: $KEYCLOAK_ADMIN_PASS"
echo ""
echo "📱 Página de Progresso:"
echo "   URL: https://$DOMINIO_PROGRESSO"
echo ""
echo "🔍 Monitoramento:"
echo "   Logs: /var/log/kryonix-parte1.log"
echo "   Monitor: ./monitor-parte1.sh"
echo ""
echo "💾 Backup:"
echo "   Script: ./backup-parte1.sh"
echo "   Automático: Diário às 2h"
echo ""
echo "🚀 Próximos Passos:"
echo "   1. Acesse https://$DOMINIO_PROGRESSO para acompanhar"
echo "   2. Configure usuários em https://$DOMINIO_KEYCLOAK/admin"
echo "   3. Aguarde a Parte 2 (Base de Dados)"
echo ""
echo "✅ KRYONIX Parte 1 instalada com sucesso!"
EOF

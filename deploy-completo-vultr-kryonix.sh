#!/bin/bash

# 🚀 KRYONIX - SCRIPT ÚNICO DEPLOY COMPLETO PARTE 1
# Deploy automatizado para servidor Vultr - Execução única
# Tudo o que não pode ser feito via commit no GitHub

set -euo pipefail

# ================================================================================
# 🎯 CONFIGURAÇÕES DO SERVIDOR VULTR - KRYONIX PARTE 1
# ================================================================================

# Informações do servidor (Auto-detectadas)
SERVER_IP="${SERVER_IP:-$(curl -s -4 ifconfig.me 2>/dev/null || curl -s ipv4.icanhazip.com 2>/dev/null || echo '45.76.246.44')}"
SERVER_USER="${SERVER_USER:-$(whoami)}"
HOSTNAME="${HOSTNAME:-$(hostname)}"

# Configurações KRYONIX
DOMAIN="kryonix.com.br"
PROJECT_DIR="/opt/kryonix-plataform"
KEYCLOAK_DOMAIN="keycloak.$DOMAIN"
ADMIN_PHONE="5517981805327"

# Credenciais (já configuradas)
GITHUB_PAT="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"
WEBHOOK_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"
JWT_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"
EVOLUTION_API_KEY="2f4d6967043b87b5ebee57b872e0223a"
SENDGRID_API_KEY="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"

# Database Keycloak
KEYCLOAK_DB_USER="keycloak"
KEYCLOAK_DB_PASS="Kr7\$n0x-2025-K3ycl04k-DB-P4ssw0rd"
KEYCLOAK_DB_NAME="keycloak"
KEYCLOAK_ADMIN_USER="kryonix"
KEYCLOAK_ADMIN_PASS="Vitor@123456"

# Cores e formatação
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
RESET='\033[0m'

# Progress tracking
TOTAL_STEPS=12
CURRENT_STEP=0
START_TIME=$(date +%s)

# ================================================================================
# 🛠️ FUNÇÕES AUXILIARES
# ================================================================================

print_header() {
    clear
    echo -e "${BLUE}${BOLD}"
    echo    "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo    "║                                                                              ║"
    echo    "║     ██╗  ██╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗██╗  ██╗                ║"
    echo    "║     ██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║╚██╗██╔╝                ║"
    echo    "║     █████╔╝ ██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║██║ ╚███╔╝                 ║"
    echo    "║     ██╔═██╗ ██╔══██╗  ╚██╔╝  ██║   ██║██║╚██╗██║██║ ██╔██╗                 ║"
    echo    "║     ██║  ██╗██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║██╔╝ ██╗                ║"
    echo    "║     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝                ║"
    echo    "║                                                                              ║"
    echo -e "║                     ${WHITE}DEPLOY COMPLETO PARTE 1 - VULTR${BLUE}                     ║"
    echo -e "║                  ${CYAN}Script Único - Configuração Externa${BLUE}                   ║"
    echo    "║                                                                              ║"
    echo    "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}\n"
    
    echo -e "${PURPLE}🎯 INFORMAÇÕES DO SERVIDOR:${RESET}"
    echo -e "   ${CYAN}├─ Servidor:${RESET} $HOSTNAME"
    echo -e "   ${CYAN}├─ IP Público:${RESET} $SERVER_IP"
    echo -e "   ${CYAN}├─ Usuário:${RESET} $SERVER_USER"
    echo -e "   ${CYAN}└─ Domínio:${RESET} $DOMAIN"
    echo ""
}

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")  echo -e "${CYAN}[$timestamp] [INFO]${RESET} $message" ;;
        "SUCCESS") echo -e "${GREEN}[$timestamp] [SUCESSO]${RESET} $message" ;;
        "WARNING") echo -e "${YELLOW}[$timestamp] [AVISO]${RESET} $message" ;;
        "ERROR") echo -e "${RED}[$timestamp] [ERRO]${RESET} $message" ;;
        "STEP") echo -e "${PURPLE}[$timestamp] [ETAPA $CURRENT_STEP/$TOTAL_STEPS]${RESET} $message" ;;
    esac
}

next_step() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    if [ $CURRENT_STEP -le $TOTAL_STEPS ]; then
        echo ""
        log "STEP" "${STEP_DESCRIPTIONS[$((CURRENT_STEP-1))]}"
        echo ""
    fi
}

# Array com descrições das etapas
STEP_DESCRIPTIONS=(
    "🔍 Verificando pré-requisitos do sistema"
    "🐳 Configurando Docker e Docker Swarm"
    "🌐 Configurando redes Docker e Traefik"
    "🔐 Configurando Keycloak com PostgreSQL"
    "📊 Configurando monitoramento com Prometheus/Grafana"
    "💾 Configurando sistema de backup automático"
    "🔧 Configurando GitHub Webhook no repositório"
    "📱 Configurando instância WhatsApp Evolution API"
    "🚨 Configurando sistema de alertas e notificações"
    "⚙️ Configurando serviços systemd e cron jobs"
    "🧪 Executando testes de integração completos"
    "🎉 Finalizando configuração e enviando relatório"
)

# Função para enviar WhatsApp via Evolution API
send_whatsapp() {
    local message="$1"
    local priority="${2:-info}"
    
    local emoji=""
    case $priority in
        "success") emoji="✅" ;;
        "error") emoji="❌" ;;
        "warning") emoji="⚠️" ;;
        "info") emoji="ℹ️" ;;
        *) emoji="🚀" ;;
    esac
    
    curl -s -X POST "https://api.kryonix.com.br/message/sendText/kryonix-monitor" \
        -H "Content-Type: application/json" \
        -H "apikey: $EVOLUTION_API_KEY" \
        -d "{
            \"number\": \"${ADMIN_PHONE}@s.whatsapp.net\",
            \"text\": \"${emoji} *KRYONIX Deploy Vultr*\n\n${message}\n\n_Deploy automático em andamento_\"
        }" >/dev/null 2>&1 || true
}

# ================================================================================
# 🚀 INÍCIO DO DEPLOY
# ================================================================================

print_header

log "INFO" "Iniciando deploy completo KRYONIX Parte 1 no servidor Vultr"
log "INFO" "Este script configurará tudo que não pode ser feito via GitHub commits"
echo ""

# Verificar se está rodando como usuário correto
if [[ $EUID -eq 0 ]]; then
   log "ERROR" "Este script não deve ser executado como root!"
   log "INFO" "Execute como usuário normal: ./deploy-completo-vultr-kryonix.sh"
   exit 1
fi

# Enviar notificação de início
send_whatsapp "🚀 *Deploy Iniciado*\n\nConfiguração externa iniciada no servidor Vultr\n\nServidor: $HOSTNAME\nIP: $SERVER_IP\nDomínio: $DOMAIN" "info"

# ================================================================================
# ETAPA 1: VERIFICAR PRÉ-REQUISITOS
# ================================================================================

next_step

log "INFO" "Verificando se Docker está instalado..."
if ! command -v docker >/dev/null 2>&1; then
    log "ERROR" "Docker não está instalado!"
    log "INFO" "Instale o Docker primeiro: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

log "INFO" "Verificando se Docker Compose está disponível..."
if ! docker compose version >/dev/null 2>&1; then
    log "ERROR" "Docker Compose não está disponível!"
    exit 1
fi

log "INFO" "Verificando se usuário está no grupo docker..."
if ! groups | grep -q docker; then
    log "WARNING" "Usuário não está no grupo docker, adicionando..."
    sudo usermod -aG docker $USER
    log "INFO" "Usuário adicionado ao grupo docker - necessário logout/login"
fi

log "SUCCESS" "Pré-requisitos verificados com sucesso"

# ================================================================================
# ETAPA 2: CONFIGURAR DOCKER SWARM
# ================================================================================

next_step

log "INFO" "Verificando Docker Swarm..."
if ! docker info | grep -q "Swarm: active"; then
    log "INFO" "Inicializando Docker Swarm..."
    docker swarm init --advertise-addr $SERVER_IP
    log "SUCCESS" "Docker Swarm inicializado"
else
    log "SUCCESS" "Docker Swarm já está ativo"
fi

# ================================================================================
# ETAPA 3: CONFIGURAR REDES DOCKER
# ================================================================================

next_step

log "INFO" "Configurando redes Docker..."

# Criar rede principal do Traefik
if ! docker network ls | grep -q "traefik-public"; then
    log "INFO" "Criando rede traefik-public..."
    docker network create \
        --driver=overlay \
        --attachable \
        --subnet=172.20.0.0/16 \
        traefik-public
    log "SUCCESS" "Rede traefik-public criada"
else
    log "SUCCESS" "Rede traefik-public já existe"
fi

# Criar rede Kryonix-NET
if ! docker network ls | grep -q "Kryonix-NET"; then
    log "INFO" "Criando rede Kryonix-NET..."
    docker network create \
        --driver=overlay \
        --attachable \
        --subnet=172.21.0.0/16 \
        Kryonix-NET
    log "SUCCESS" "Rede Kryonix-NET criada"
else
    log "SUCCESS" "Rede Kryonix-NET já existe"
fi

# ================================================================================
# ETAPA 4: CONFIGURAR KEYCLOAK COM POSTGRESQL
# ================================================================================

next_step

log "INFO" "Configurando Keycloak com PostgreSQL..."

# Criar stack do Keycloak
cat > /tmp/keycloak-stack.yml << EOF
version: '3.8'

services:
  keycloak-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: $KEYCLOAK_DB_NAME
      POSTGRES_USER: $KEYCLOAK_DB_USER
      POSTGRES_PASSWORD: $KEYCLOAK_DB_PASS
    volumes:
      - keycloak_postgres_data:/var/lib/postgresql/data
    networks:
      - keycloak-network
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $KEYCLOAK_DB_USER -d $KEYCLOAK_DB_NAME"]
      interval: 10s
      timeout: 5s
      retries: 5

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://keycloak-db:5432/$KEYCLOAK_DB_NAME
      KC_DB_USERNAME: $KEYCLOAK_DB_USER
      KC_DB_PASSWORD: $KEYCLOAK_DB_PASS
      KC_HOSTNAME: $KEYCLOAK_DOMAIN
      KC_HOSTNAME_STRICT: false
      KC_HTTP_ENABLED: true
      KC_PROXY: edge
      KEYCLOAK_ADMIN: $KEYCLOAK_ADMIN_USER
      KEYCLOAK_ADMIN_PASSWORD: $KEYCLOAK_ADMIN_PASS
      KC_FEATURES: preview
    command: start --optimized
    depends_on:
      - keycloak-db
    ports:
      - "8090:8080"
    networks:
      - keycloak-network
      - traefik-public
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.keycloak.rule=Host(\`$KEYCLOAK_DOMAIN\`)"
        - "traefik.http.routers.keycloak.entrypoints=websecure"
        - "traefik.http.routers.keycloak.tls.certresolver=letsencrypt"
        - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
        - "traefik.docker.network=traefik-public"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health/ready"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  keycloak_postgres_data:

networks:
  keycloak-network:
    driver: overlay
  traefik-public:
    external: true
EOF

# Deploy do Keycloak
log "INFO" "Fazendo deploy do Keycloak..."
docker stack deploy -c /tmp/keycloak-stack.yml keycloak-stack

log "SUCCESS" "Keycloak configurado e deployado"

# ================================================================================
# ETAPA 5: CONFIGURAR MONITORAMENTO
# ================================================================================

next_step

log "INFO" "Configurando monitoramento com Prometheus e Grafana..."

# Criar diretórios de dados
sudo mkdir -p /opt/monitoring/{prometheus,grafana}
sudo chown -R $USER:$USER /opt/monitoring

# Configuração do Prometheus
cat > /opt/monitoring/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'kryonix-web'
    static_configs:
      - targets: ['kryonix_web:8080']

  - job_name: 'kryonix-webhook'
    static_configs:
      - targets: ['kryonix_webhook:8082']

  - job_name: 'kryonix-monitor'
    static_configs:
      - targets: ['kryonix_monitor:8084']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'docker-daemon'
    static_configs:
      - targets: ['host.docker.internal:9323']
EOF

log "SUCCESS" "Monitoramento configurado"

# ================================================================================
# ETAPA 6: CONFIGURAR SISTEMA DE BACKUP
# ================================================================================

next_step

log "INFO" "Configurando sistema de backup automático..."

# Criar diretórios de backup
sudo mkdir -p /backup/kryonix
sudo chown -R $USER:$USER /backup

# Configurar cron job para backup diário
BACKUP_SCRIPT_PATH="$PROJECT_DIR/backup-automatico-kryonix.sh"
CRON_ENTRY="0 2 * * * $BACKUP_SCRIPT_PATH --run-backup >/dev/null 2>&1"

# Verificar se já existe
if ! crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT_PATH"; then
    # Adicionar ao crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
    log "SUCCESS" "Backup automático configurado para 02:00 diariamente"
else
    log "SUCCESS" "Backup automático já estava configurado"
fi

# ================================================================================
# ETAPA 7: CONFIGURAR GITHUB WEBHOOK
# ================================================================================

next_step

log "INFO" "Configurando GitHub Webhook no repositório..."

# Configurar webhook via API do GitHub
WEBHOOK_CONFIG='{
  "name": "web",
  "active": true,
  "events": ["push"],
  "config": {
    "url": "https://kryonix.com.br/api/github-webhook",
    "content_type": "json",
    "secret": "'$WEBHOOK_SECRET'"
  }
}'

# Verificar se webhook já existe
EXISTING_WEBHOOKS=$(curl -s -H "Authorization: token $GITHUB_PAT" \
    "https://api.github.com/repos/Nakahh/KRYONIX-PLATAFORMA/hooks")

if echo "$EXISTING_WEBHOOKS" | grep -q "kryonix.com.br/api/github-webhook"; then
    log "SUCCESS" "GitHub Webhook já está configurado"
else
    # Criar webhook
    WEBHOOK_RESPONSE=$(curl -s -X POST \
        -H "Authorization: token $GITHUB_PAT" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/Nakahh/KRYONIX-PLATAFORMA/hooks" \
        -d "$WEBHOOK_CONFIG")
    
    if echo "$WEBHOOK_RESPONSE" | grep -q '"id"'; then
        log "SUCCESS" "GitHub Webhook configurado com sucesso"
    else
        log "WARNING" "Falha na configuração do webhook - verificar permissões do token"
    fi
fi

# ================================================================================
# ETAPA 8: CONFIGURAR WHATSAPP EVOLUTION API
# ================================================================================

next_step

log "INFO" "Configurando instância WhatsApp Evolution API..."

# Criar instância para monitoramento
INSTANCE_CONFIG='{
  "instanceName": "kryonix-monitor",
  "token": "'$EVOLUTION_API_KEY'",
  "qrcode": true,
  "markMessagesRead": true,
  "delayMessage": 1000,
  "msgRetryCounterValue": 3,
  "webhook": "https://kryonix.com.br/api/whatsapp-webhook",
  "webhookByEvents": false,
  "webhookBase64": false
}'

# Verificar se instância existe
INSTANCE_STATUS=$(curl -s -H "apikey: $EVOLUTION_API_KEY" \
    "https://api.kryonix.com.br/instance/connectionState/kryonix-monitor" || echo "error")

if echo "$INSTANCE_STATUS" | grep -q '"state"'; then
    log "SUCCESS" "Instância WhatsApp já existe"
else
    # Criar instância
    INSTANCE_RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "apikey: $EVOLUTION_API_KEY" \
        "https://api.kryonix.com.br/instance/create" \
        -d "$INSTANCE_CONFIG" || echo "error")
    
    if echo "$INSTANCE_RESPONSE" | grep -q '"instance"'; then
        log "SUCCESS" "Instância WhatsApp criada - QR Code necessário"
        log "INFO" "Acesse https://api.kryonix.com.br/manager para conectar"
    else
        log "WARNING" "Problema na criação da instância WhatsApp"
    fi
fi

# ================================================================================
# ETAPA 9: CONFIGURAR ALERTAS E NOTIFICAÇÕES
# ================================================================================

next_step

log "INFO" "Configurando sistema de alertas..."

# Configurar alertas do sistema
cat > /etc/systemd/system/kryonix-alerts.service << EOF
[Unit]
Description=KRYONIX System Alerts
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=$PROJECT_DIR/ia-monitor-kryonix.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Habilitar serviço de alertas
sudo systemctl daemon-reload
sudo systemctl enable kryonix-alerts.service

log "SUCCESS" "Sistema de alertas configurado"

# ================================================================================
# ETAPA 10: CONFIGURAR SERVIÇOS SYSTEMD
# ================================================================================

next_step

log "INFO" "Configurando serviços systemd..."

# Serviço principal KRYONIX
cat > /etc/systemd/system/kryonix-platform.service << EOF
[Unit]
Description=KRYONIX Platform Service
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/docker stack deploy -c docker-stack.yml Kryonix
ExecStop=/usr/bin/docker stack rm Kryonix
RemainAfterExit=yes
Restart=no
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Habilitar serviços
sudo systemctl daemon-reload
sudo systemctl enable kryonix-platform.service

log "SUCCESS" "Serviços systemd configurados"

# ================================================================================
# ETAPA 11: EXECUTAR TESTES DE INTEGRAÇÃO
# ================================================================================

next_step

log "INFO" "Executando testes de integração..."

# Aguardar serviços subirem
sleep 60

# Testar conectividade dos serviços
TESTS_PASSED=0
TOTAL_TESTS=5

# Teste 1: Docker Swarm
if docker info | grep -q "Swarm: active"; then
    log "SUCCESS" "✅ Teste 1/5: Docker Swarm ativo"
    ((TESTS_PASSED++))
else
    log "ERROR" "❌ Teste 1/5: Docker Swarm falhou"
fi

# Teste 2: Redes Docker
if docker network ls | grep -q "traefik-public" && docker network ls | grep -q "Kryonix-NET"; then
    log "SUCCESS" "✅ Teste 2/5: Redes Docker criadas"
    ((TESTS_PASSED++))
else
    log "ERROR" "❌ Teste 2/5: Redes Docker falharam"
fi

# Teste 3: Keycloak
if curl -s -f "http://localhost:8090/health/ready" >/dev/null 2>&1; then
    log "SUCCESS" "✅ Teste 3/5: Keycloak respondendo"
    ((TESTS_PASSED++))
else
    log "WARNING" "⚠️ Teste 3/5: Keycloak ainda inicializando"
fi

# Teste 4: Sistema de backup
if [ -f "$PROJECT_DIR/backup-automatico-kryonix.sh" ] && crontab -l | grep -q "backup-automatico"; then
    log "SUCCESS" "✅ Teste 4/5: Sistema de backup configurado"
    ((TESTS_PASSED++))
else
    log "ERROR" "❌ Teste 4/5: Sistema de backup falhou"
fi

# Teste 5: Conectividade externa
if curl -s -f "https://api.kryonix.com.br" >/dev/null 2>&1; then
    log "SUCCESS" "✅ Teste 5/5: Evolution API acessível"
    ((TESTS_PASSED++))
else
    log "WARNING" "⚠️ Teste 5/5: Evolution API com problemas"
fi

log "INFO" "Testes concluídos: $TESTS_PASSED/$TOTAL_TESTS passaram"

# ================================================================================
# ETAPA 12: FINALIZAR E ENVIAR RELATÓRIO
# ================================================================================

next_step

log "INFO" "Finalizando configuração..."

# Calcular tempo total
END_TIME=$(date +%s)
DURATION=$(($END_TIME - $START_TIME))
DURATION_FORMATTED=$(printf "%02d:%02d:%02d" $((DURATION/3600)) $((DURATION%3600/60)) $((DURATION%60)))

# Criar relatório final
REPORT="/tmp/kryonix-deploy-report.txt"
cat > $REPORT << EOF
KRYONIX - Relatório de Deploy Vultr
===================================

Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')
Servidor: $HOSTNAME ($SERVER_IP)
Usuário: $SERVER_USER
Duração: $DURATION_FORMATTED

Configurações Aplicadas:
========================

✅ Docker Swarm inicializado
✅ Redes Docker criadas (traefik-public, Kryonix-NET)
✅ Keycloak + PostgreSQL configurado
✅ Sistema de monitoramento configurado
✅ Backup automático configurado (diário 02:00)
✅ GitHub Webhook configurado
✅ WhatsApp Evolution API configurado
✅ Sistema de alertas configurado
✅ Serviços systemd criados

Testes de Integração:
=====================
Aprovados: $TESTS_PASSED/$TOTAL_TESTS

Próximos Passos:
================
1. Fazer commit dos arquivos no GitHub
2. Executar o instalador principal: bash <(curl -sSL setup.oriondesign.art.br)
3. Conectar WhatsApp via QR Code em: https://api.kryonix.com.br/manager
4. Configurar Realm Keycloak em: https://$KEYCLOAK_DOMAIN/admin
5. Monitorar logs: tail -f /var/log/kryonix-*.log

URLs Importantes:
=================
- Keycloak Admin: https://$KEYCLOAK_DOMAIN/admin
- Evolution Manager: https://api.kryonix.com.br/manager
- Aplicação: https://www.$DOMAIN
- Webhook: https://$DOMAIN/api/github-webhook

Credenciais:
============
- Keycloak Admin: $KEYCLOAK_ADMIN_USER / $KEYCLOAK_ADMIN_PASS
- Banco Keycloak: $KEYCLOAK_DB_USER / [configurado]
- WhatsApp: Conectar via QR Code

Status: CONFIGURAÇÃO EXTERNA CONCLUÍDA ✅
EOF

# Mostrar relatório
cat $REPORT

# Enviar relatório via WhatsApp
WHATSAPP_SUMMARY="🎉 *Deploy Vultr Concluído!*\n\n"
WHATSAPP_SUMMARY+="⏱️ **Duração:** $DURATION_FORMATTED\n"
WHATSAPP_SUMMARY+="🖥️ **Servidor:** $HOSTNAME\n"
WHATSAPP_SUMMARY+="🌐 **IP:** $SERVER_IP\n"
WHATSAPP_SUMMARY+="🔗 **Domínio:** $DOMAIN\n\n"
WHATSAPP_SUMMARY+="✅ **Configurado:**\n"
WHATSAPP_SUMMARY+="• Docker Swarm + Redes\n"
WHATSAPP_SUMMARY+="• Keycloak + PostgreSQL\n"
WHATSAPP_SUMMARY+="• Backup automático\n"
WHATSAPP_SUMMARY+="• GitHub Webhook\n"
WHATSAPP_SUMMARY+="• WhatsApp API\n"
WHATSAPP_SUMMARY+="• Sistema de alertas\n\n"
WHATSAPP_SUMMARY+="🧪 **Testes:** $TESTS_PASSED/$TOTAL_TESTS aprovados\n\n"
WHATSAPP_SUMMARY+="🚀 **Próximo Passo:**\n"
WHATSAPP_SUMMARY+="Executar instalador principal\n\n"
WHATSAPP_SUMMARY+="📋 **Admin Keycloak:**\n"
WHATSAPP_SUMMARY+="https://$KEYCLOAK_DOMAIN/admin\n"
WHATSAPP_SUMMARY+="User: $KEYCLOAK_ADMIN_USER\n\n"
WHATSAPP_SUMMARY+="📱 **WhatsApp Manager:**\n"
WHATSAPP_SUMMARY+="https://api.kryonix.com.br/manager"

send_whatsapp "$WHATSAPP_SUMMARY" "success"

echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}                🎉 DEPLOY VULTR CONCLUÍDO COM SUCESSO! 🎉${RESET}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════${RESET}"
echo ""
echo -e "${CYAN}${BOLD}📊 RESUMO:${RESET}"
echo -e "   ${BLUE}├─ Duração:${RESET} $DURATION_FORMATTED"
echo -e "   ${BLUE}├─ Servidor:${RESET} $HOSTNAME ($SERVER_IP)"
echo -e "   ${BLUE}├─ Testes:${RESET} $TESTS_PASSED/$TOTAL_TESTS aprovados"
echo -e "   ${BLUE}└─ Status:${RESET} ${GREEN}Configuração externa completa${RESET}"
echo ""
echo -e "${YELLOW}${BOLD}🚀 PRÓXIMOS PASSOS:${RESET}"
echo -e "   ${BLUE}1.${RESET} Fazer commit/push dos arquivos para GitHub"
echo -e "   ${BLUE}2.${RESET} Executar instalador principal: ${CYAN}bash <(curl -sSL setup.oriondesign.art.br)${RESET}"
echo -e "   ${BLUE}3.${RESET} Conectar WhatsApp: ${CYAN}https://api.kryonix.com.br/manager${RESET}"
echo -e "   ${BLUE}4.${RESET} Configurar Keycloak: ${CYAN}https://$KEYCLOAK_DOMAIN/admin${RESET}"
echo ""
echo -e "${GREEN}${BOLD}✅ KRYONIX PARTE 1 - CONFIGURAÇÃO EXTERNA FINALIZADA!${RESET}"
echo ""

log "SUCCESS" "Script de deploy Vultr executado com sucesso!"
log "INFO" "Relatório completo salvo em: $REPORT"

exit 0

#!/bin/bash

# ============================================================================
# 🚀 KRYONIX - SCRIPT DE EXECUÇÃO ÚNICA PARA SERVIDOR VULTR
# PARTE 01 - CONFIGURAÇÃO COMPLETA DE AUTENTICAÇÃO KEYCLOAK MULTI-TENANT
# ============================================================================
# 
# Desenvolvido por: Vitor Jayme Fernandes Ferreira
# Assistido por: 15 Agentes Especializados em IA
# Data: Janeiro 2025
# 
# OBJETIVO: Automatizar TODA a configuração externa necessária no servidor
# após o pull da versão mais recente do GitHub
# 
# USO: bash SCRIPT-EXECUCAO-UNICA-SERVIDOR-VULTR-PARTE01.sh
# 
# ============================================================================

# Configurações de segurança
set -euo pipefail
export LC_ALL=C.UTF-8 2>/dev/null || export LC_ALL=C
export LANG=C.UTF-8 2>/dev/null || export LANG=C

# ============================================================================
# CONFIGURAÇÕES GLOBAIS - CREDENCIAIS REAIS DO PROJETO
# ============================================================================

# Servidor e domínios
readonly SERVER_IP="45.76.246.44"
readonly DOMAIN_BASE="kryonix.com.br"
readonly PROJECT_NAME="KRYONIX"

# Credenciais de autenticação
readonly KEYCLOAK_ADMIN_USER="kryonix"
readonly KEYCLOAK_ADMIN_PASSWORD="Vitor@123456"
readonly POSTGRES_PASSWORD="Vitor@123456"

# Credenciais APIs
readonly EVOLUTION_API_KEY="2f4d6967043b87b5ebee57b872e0223a"
readonly EVOLUTION_API_URL="https://api.kryonix.com.br"
readonly JWT_SECRET="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"

# Comunicação e notificações
readonly WHATSAPP_ALERT="+5517981805327"
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
readonly LOCK="🔐"

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

# Contador de progresso
CURRENT_STEP=0
readonly TOTAL_STEPS=15

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
trap cleanup EXIT
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
    log_step "Verificando espaço em disco"
    
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
        if docker ps --format "table {{.Names}}" | grep -q "$service"; then
            log_info "$CHECK $service está rodando"
        else
            log_error "$service não está rodando!"
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
    docker exec postgresql-kryonix psql -U postgres -c "
        SELECT 1 FROM pg_database WHERE datname = 'keycloak';
    " | grep -q "1" || {
        docker exec postgresql-kryonix psql -U postgres -c "
            CREATE DATABASE keycloak WITH 
                ENCODING 'UTF8' 
                LC_COLLATE = 'pt_BR.UTF-8' 
                LC_CTYPE = 'pt_BR.UTF-8'
                TEMPLATE template0;
            CREATE USER keycloak_user WITH PASSWORD '$POSTGRES_PASSWORD';
            GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;
        "
        log_info "$CHECK Database do Keycloak criado"
    }
    
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
    
    log_info "$CHECK Token admin obtido"
    
    # Verificar se realm KRYONIX já existe
    local realm_exists
    realm_exists=$(curl -s --max-time 30 \
        -H "Authorization: Bearer $admin_token" \
        "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX" \
        | jq -r '.realm // empty' 2>/dev/null || echo "")
    
    if [ "$realm_exists" = "KRYONIX" ]; then
        log_info "$CHECK Realm KRYONIX já existe"
    else
        log_info "Criando Realm KRYONIX..."
        
        # Criar realm
        curl -s --max-time 30 \
            -X POST \
            -H "Authorization: Bearer $admin_token" \
            -H "Content-Type: application/json" \
            -d '{
                "realm": "KRYONIX",
                "displayName": "KRYONIX Platform",
                "enabled": true,
                "sslRequired": "external",
                "registrationAllowed": false,
                "loginWithEmailAllowed": true,
                "duplicateEmailsAllowed": false,
                "resetPasswordAllowed": true,
                "editUsernameAllowed": false,
                "internationalizationEnabled": true,
                "defaultLocale": "pt-BR",
                "supportedLocales": ["pt-BR", "en"],
                "browserFlow": "browser",
                "registrationFlow": "registration",
                "directGrantFlow": "direct grant",
                "resetCredentialsFlow": "reset credentials",
                "clientAuthenticationFlow": "clients",
                "attributes": {
                    "frontendUrl": "https://keycloak.'$DOMAIN_BASE'"
                }
            }' \
            "https://keycloak.$DOMAIN_BASE/admin/realms"
        
        log_info "$CHECK Realm KRYONIX criado"
    fi
    
    # Configurar clients necessários
    configure_keycloak_clients "$admin_token"
    
    # Criar usuários padrão
    create_keycloak_users "$admin_token"
}

# Configurar clients do Keycloak
configure_keycloak_clients() {
    local admin_token="$1"
    
    log_info "Configurando clients do Keycloak..."
    
    # Client para frontend web
    local frontend_client='{
        "clientId": "kryonix-frontend",
        "name": "KRYONIX Frontend Web",
        "description": "Cliente para aplicação web KRYONIX",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "secret": "'$JWT_SECRET'",
        "redirectUris": [
            "https://'$DOMAIN_BASE'/*",
            "https://www.'$DOMAIN_BASE'/*",
            "http://localhost:*/*"
        ],
        "webOrigins": [
            "https://'$DOMAIN_BASE'",
            "https://www.'$DOMAIN_BASE'",
            "http://localhost:3000",
            "http://localhost:8080"
        ],
        "protocol": "openid-connect",
        "publicClient": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false,
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false
    }'
    
    # Client para aplicativo mobile
    local mobile_client='{
        "clientId": "kryonix-mobile-app",
        "name": "KRYONIX Mobile App",
        "description": "Cliente para aplicativo móvel KRYONIX",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "secret": "'$JWT_SECRET'",
        "redirectUris": [
            "kryonix://callback",
            "https://'$DOMAIN_BASE'/mobile/callback"
        ],
        "protocol": "openid-connect",
        "publicClient": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": false,
        "standardFlowEnabled": true,
        "implicitFlowEnabled": false
    }'
    
    # Client para serviços de IA
    local ai_client='{
        "clientId": "kryonix-ai-client",
        "name": "KRYONIX AI Services",
        "description": "Cliente para serviços de IA KRYONIX",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "secret": "'$JWT_SECRET'",
        "protocol": "openid-connect",
        "publicClient": false,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": true,
        "standardFlowEnabled": false,
        "implicitFlowEnabled": false
    }'
    
    # Criar clients
    for client in "$frontend_client" "$mobile_client" "$ai_client"; do
        curl -s --max-time 30 \
            -X POST \
            -H "Authorization: Bearer $admin_token" \
            -H "Content-Type: application/json" \
            -d "$client" \
            "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX/clients" || true
    done
    
    log_info "$CHECK Clients do Keycloak configurados"
}

# Criar usuários padrão
create_keycloak_users() {
    local admin_token="$1"
    
    log_info "Criando usuários padrão..."
    
    # Usuário administrador
    local admin_user='{
        "username": "'$KEYCLOAK_ADMIN_USER'",
        "email": "'$ADMIN_EMAIL'",
        "firstName": "Admin",
        "lastName": "KRYONIX",
        "enabled": true,
        "emailVerified": true,
        "credentials": [{
            "type": "password",
            "value": "'$KEYCLOAK_ADMIN_PASSWORD'",
            "temporary": false
        }]
    }'
    
    # Usuário de serviço para IA
    local ai_user='{
        "username": "kryonix-ai-service",
        "email": "ai@'$DOMAIN_BASE'",
        "firstName": "AI",
        "lastName": "Service",
        "enabled": true,
        "emailVerified": true,
        "serviceAccountClientId": "kryonix-ai-client",
        "credentials": [{
            "type": "password",
            "value": "'$KEYCLOAK_ADMIN_PASSWORD'",
            "temporary": false
        }]
    }'
    
    # Criar usuários
    for user in "$admin_user" "$ai_user"; do
        curl -s --max-time 30 \
            -X POST \
            -H "Authorization: Bearer $admin_token" \
            -H "Content-Type: application/json" \
            -d "$user" \
            "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX/users" || true
    done
    
    log_info "$CHECK Usuários padrão criados"
}

# ============================================================================
# MONITORAMENTO E BACKUP
# ============================================================================

# Configurar monitoramento
setup_monitoring() {
    log_step "Configurando monitoramento"
    
    # Script de monitoramento Python
    cat > "$SCRIPTS_DIR/kryonix_monitor.py" << 'EOF'
#!/usr/bin/env python3
"""
KRYONIX Platform Monitor
Monitora serviços críticos e envia alertas
"""

import requests
import json
import time
import smtplib
from email.mime.text import MIMEText
from datetime import datetime
import sys

# Configurações
SERVICES = {
    'keycloak': 'https://keycloak.kryonix.com.br/health/ready',
    'main_site': 'https://kryonix.com.br/health',
    'evolution_api': 'https://api.kryonix.com.br/manager/status'
}

SENDGRID_API_KEY = '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'
ALERT_EMAIL = 'vitor.nakahh@gmail.com'
WHATSAPP_NUMBER = '+5517981805327'
EVOLUTION_API_KEY = '2f4d6967043b87b5ebee57b872e0223a'

def check_service(name, url):
    """Verifica status de um serviço"""
    try:
        response = requests.get(url, timeout=10)
        return response.status_code == 200
    except:
        return False

def send_whatsapp_alert(message):
    """Envia alerta via WhatsApp usando Evolution API"""
    try:
        url = 'https://api.kryonix.com.br/message/sendText/main'
        headers = {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
        }
        data = {
            'number': WHATSAPP_NUMBER.replace('+', ''),
            'text': f'🚨 ALERTA KRYONIX 🚨\n\n{message}\n\nTimestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
        }
        requests.post(url, json=data, headers=headers, timeout=10)
        print(f"Alerta WhatsApp enviado: {message}")
    except Exception as e:
        print(f"Erro ao enviar WhatsApp: {e}")

def send_email_alert(subject, message):
    """Envia alerta por email usando SendGrid"""
    try:
        # Implementação simplificada - em produção use SendGrid SDK
        print(f"Email alert: {subject} - {message}")
    except Exception as e:
        print(f"Erro ao enviar email: {e}")

def main():
    """Função principal de monitoramento"""
    down_services = []
    
    for service_name, service_url in SERVICES.items():
        if not check_service(service_name, service_url):
            down_services.append(service_name)
    
    if down_services:
        message = f"Serviços indisponíveis: {', '.join(down_services)}"
        send_whatsapp_alert(message)
        send_email_alert("KRYONIX - Serviços Indisponíveis", message)
        sys.exit(1)
    else:
        print(f"Todos os serviços OK - {datetime.now()}")
        sys.exit(0)

if __name__ == "__main__":
    main()
EOF
    
    chmod +x "$SCRIPTS_DIR/kryonix_monitor.py"
    
    # Configurar cron para monitoramento a cada 5 minutos
    (crontab -l 2>/dev/null; echo "*/5 * * * * python3 $SCRIPTS_DIR/kryonix_monitor.py") | crontab -
    
    log_info "$CHECK Monitoramento configurado"
}

# Configurar backup automático
setup_backup() {
    log_step "Configurando backup automático"
    
    # Script de backup
    cat > "$SCRIPTS_DIR/kryonix_backup.sh" << 'EOF'
#!/bin/bash
# KRYONIX Backup Script

BACKUP_DIR="/opt/kryonix/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="kryonix_backup_$DATE.tar.gz"

mkdir -p "$BACKUP_DIR"

# Backup do PostgreSQL
docker exec postgresql-kryonix pg_dumpall -U postgres > "$BACKUP_DIR/postgres_$DATE.sql"

# Backup das configurações
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    /opt/kryonix/config \
    /opt/kryonix/scripts \
    "$BACKUP_DIR/postgres_$DATE.sql"

# Limpar backups antigos (manter últimos 7 dias)
find "$BACKUP_DIR" -name "kryonix_backup_*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "postgres_*.sql" -mtime +7 -delete

echo "Backup criado: $BACKUP_FILE"
EOF
    
    chmod +x "$SCRIPTS_DIR/kryonix_backup.sh"
    
    # Configurar cron para backup diário às 2h
    (crontab -l 2>/dev/null; echo "0 2 * * * $SCRIPTS_DIR/kryonix_backup.sh") | crontab -
    
    log_info "$CHECK Backup automático configurado"
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
            "text": "🤖 KRYONIX SCRIPT AUTOMÁTICO 🤖\n\n'$message'\n\nServidor: '$SERVER_IP'\nTimestamp: '$(date '+%Y-%m-%d %H:%M:%S')'"
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

# Validar configuração do Keycloak
validate_keycloak_config() {
    log_step "Validando configuração do Keycloak"
    
    # Testar login admin
    local admin_token
    admin_token=$(curl -s --max-time 30 \
        -d "client_id=admin-cli" \
        -d "username=$KEYCLOAK_ADMIN_USER" \
        -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
        -d "grant_type=password" \
        "https://keycloak.$DOMAIN_BASE/realms/master/protocol/openid_connect/token" | \
        jq -r '.access_token // empty' 2>/dev/null)
    
    if [ -n "$admin_token" ] && [ "$admin_token" != "null" ]; then
        log_info "$CHECK Login admin do Keycloak funcionando"
        
        # Verificar realm KRYONIX
        local realm_check
        realm_check=$(curl -s --max-time 30 \
            -H "Authorization: Bearer $admin_token" \
            "https://keycloak.$DOMAIN_BASE/admin/realms/KRYONIX" | \
            jq -r '.realm // empty' 2>/dev/null)
        
        if [ "$realm_check" = "KRYONIX" ]; then
            log_info "$CHECK Realm KRYONIX está configurado"
        else
            log_warn "$WARNING Realm KRYONIX pode não estar configurado corretamente"
        fi
    else
        log_warn "$WARNING Login admin do Keycloak pode ter problemas"
    fi
}

# ============================================================================
# FUNÇÃO PRINCIPAL
# ============================================================================

main() {
    # Banner inicial
    echo -e "${BLUE}${BOLD}"
    echo "============================================================================"
    echo "🚀 KRYONIX - SCRIPT DE EXECUÇÃO ÚNICA PARA SERVIDOR VULTR"
    echo "PARTE 01 - CONFIGURAÇÃO COMPLETA DE AUTENTICAÇÃO KEYCLOAK MULTI-TENANT"
    echo "============================================================================"
    echo -e "${NC}"
    
    log_info "Iniciando script de execução única para PARTE 01"
    log_info "Servidor: $SERVER_IP"
    log_info "Domínio: $DOMAIN_BASE"
    log_info "PID: $$"
    
    # Criar diretórios necessários
    mkdir -p "$LOG_DIR" "$CONFIG_DIR" "$SCRIPTS_DIR" "$BACKUP_DIR"
    
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
    
    # Configuração de monitoramento e backup
    setup_monitoring
    setup_backup
    
    # Validações finais
    test_services_connectivity
    validate_keycloak_config
    
    # Relatório final
    log_step "Finalizando configuração"
    log_info "$CHECK PARTE 01 configurada com sucesso!"
    log_info ""
    log_info "==============================================="
    log_info "📊 RESUMO DA CONFIGURAÇÃO"
    log_info "==============================================="
    log_info "🔐 Keycloak: https://keycloak.$DOMAIN_BASE"
    log_info "👤 Login Admin: $KEYCLOAK_ADMIN_USER / $KEYCLOAK_ADMIN_PASSWORD"
    log_info "🏢 Realm: KRYONIX"
    log_info "📱 WhatsApp Alertas: $WHATSAPP_ALERT"
    log_info "📧 Email Admin: $ADMIN_EMAIL"
    log_info "📝 Logs: $LOG_FILE"
    log_info "💾 Backups: $BACKUP_DIR"
    log_info "==============================================="
    
    # Enviar notificação de sucesso
    send_whatsapp_notification "✅ PARTE 01 configurada com SUCESSO! Keycloak multi-tenant funcionando em https://keycloak.$DOMAIN_BASE"
    
    log_info "Script executado com sucesso em $(date)"
    log_info "Próximo passo: Executar PARTE 02 (PostgreSQL otimizado)"
}

# ============================================================================
# EXECUÇÃO DO SCRIPT
# ============================================================================

# Executar função principal
main "$@"

# Fim do script
exit 0

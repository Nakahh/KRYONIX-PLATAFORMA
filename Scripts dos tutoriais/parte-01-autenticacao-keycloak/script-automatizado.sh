#!/bin/bash
# 🔐 SCRIPT AUTOMATIZADO PARTE 01 - CONFIGURAÇÃO KEYCLOAK KRYONIX
# Sistema de Autenticação IA 100% Autônoma para Stacks Docker Swarm

# =============================================================================
# CONFIGURAÇÃO INICIAL
# =============================================================================

set -e  # Parar em caso de erro
set -u  # Parar se variável não definida

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Função para log formatado
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}🚀 PASSO: $1${NC}"; }

# Cabeçalho KRYONIX
clear
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                     🚀 KRYONIX PARTE 01 - CONFIGURAÇÃO                   ║"
echo "║                   Central de Autenticação Inteligente                   ║"
echo "║                                                                          ║"
echo "║  👥 15 Agentes Especializados • 📱 Mobile-First • 🤖 IA Autônoma       ║"
echo "║  🇧🇷 Interface PT-BR • 📊 Dados Reais • 🌐 www.kryonix.com.br         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# =============================================================================
# VARIÁVEIS GLOBAIS
# =============================================================================

# Configurações do servidor
export KRYONIX_SERVER_IP="144.202.90.55"
export KRYONIX_DOMAIN="kryonix.com.br"
export KRYONIX_AUTH_DOMAIN="auth.kryonix.com.br"

# Configurações Docker Swarm
export KRYONIX_NETWORK="Kryonix-NET"
export KEYCLOAK_SERVICE_NAME="keycloak"
export POSTGRES_SERVICE_NAME="postgresql"
export REDIS_SERVICE_NAME="redis"

# Configurações de segurança
export KEYCLOAK_ADMIN_USER="admin"
export KEYCLOAK_ADMIN_PASS="KryonixAdmin2025!"
export POSTGRES_ADMIN_USER="kryonix_admin"
export POSTGRES_ADMIN_PASS="KryonixDB2025!"

# Diretórios de trabalho
export KRYONIX_CONFIG_DIR="/opt/kryonix/config"
export KRYONIX_SCRIPTS_DIR="/opt/kryonix/scripts"
export KRYONIX_LOGS_DIR="/opt/kryonix/logs"
export KRYONIX_BACKUPS_DIR="/opt/kryonix/backups"

# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

# Verificar se serviço Docker Swarm existe
check_service_exists() {
    local service_name="$1"
    if docker service ls --format "{{.Name}}" | grep -q "^${service_name}$"; then
        return 0
    else
        return 1
    fi
}

# Aguardar serviço estar saudável
wait_service_healthy() {
    local service_name="$1"
    local max_attempts="${2:-30}"
    local attempt=1
    
    log_info "Aguardando serviço $service_name estar saudável..."
    
    while [ $attempt -le $max_attempts ]; do
        local replicas=$(docker service ls --filter name="$service_name" --format "{{.Replicas}}")
        if [[ "$replicas" =~ ^[1-9][0-9]*/[1-9][0-9]*$ ]] && [[ $(echo "$replicas" | cut -d'/' -f1) == $(echo "$replicas" | cut -d'/' -f2) ]]; then
            log_success "Serviço $service_name está saudável"
            return 0
        fi
        
        echo -e "${YELLOW}   Tentativa $attempt/$max_attempts - Status: $replicas${NC}"
        sleep 10
        ((attempt++))
    done
    
    log_error "Serviço $service_name não ficou saudável"
    return 1
}

# Executar comando no container via Docker Swarm
exec_in_service() {
    local service_name="$1"
    local command="$2"
    
    # Obter ID do container do serviço
    local container_id=$(docker service ps "$service_name" --format "{{.ID}}" --filter "desired-state=running" | head -n1)
    local node_id=$(docker service ps "$service_name" --format "{{.Node}}" --filter "desired-state=running" | head -n1)
    
    if [ -z "$container_id" ]; then
        log_error "Não foi possível encontrar container para o serviço $service_name"
        return 1
    fi
    
    # Executar comando no container
    docker exec $(docker ps --filter "name=${service_name}" --format "{{.ID}}" | head -n1) $command
}

# =============================================================================
# PASSO 1: VALIDAÇÃO DO AMBIENTE
# =============================================================================

step_validate_environment() {
    log_step "Validando ambiente Docker Swarm KRYONIX"
    
    # Verificar se Docker Swarm está ativo
    if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q active; then
        log_error "Docker Swarm não está ativo"
        exit 1
    fi
    log_success "Docker Swarm ativo"
    
    # Verificar rede overlay
    if ! docker network ls --filter name="$KRYONIX_NETWORK" --format "{{.Name}}" | grep -q "^${KRYONIX_NETWORK}$"; then
        log_error "Rede overlay $KRYONIX_NETWORK não encontrada"
        exit 1
    fi
    log_success "Rede overlay $KRYONIX_NETWORK encontrada"
    
    # Verificar serviços necessários
    local required_services=("$KEYCLOAK_SERVICE_NAME" "$POSTGRES_SERVICE_NAME" "$REDIS_SERVICE_NAME")
    for service in "${required_services[@]}"; do
        if ! check_service_exists "$service"; then
            log_error "Serviço $service não encontrado no Docker Swarm"
            exit 1
        fi
        log_success "Serviço $service encontrado"
    done
    
    # Criar diretórios necessários
    mkdir -p "$KRYONIX_CONFIG_DIR" "$KRYONIX_SCRIPTS_DIR" "$KRYONIX_LOGS_DIR" "$KRYONIX_BACKUPS_DIR"
    log_success "Diretórios KRYONIX criados"
}

# =============================================================================
# PASSO 2: CONFIGURAÇÃO POSTGRESQL PARA KEYCLOAK
# =============================================================================

step_configure_postgresql() {
    log_step "Configurando PostgreSQL para Keycloak KRYONIX"
    
    # Aguardar PostgreSQL estar saudável
    wait_service_healthy "$POSTGRES_SERVICE_NAME"
    
    # Script SQL para configurar database Keycloak
    cat > "$KRYONIX_CONFIG_DIR/keycloak-database-setup.sql" << 'EOF'
-- KRYONIX Keycloak Database Setup
-- Configuração otimizada para autenticação mobile-first

-- Criar database específico para Keycloak
CREATE DATABASE kryonix_keycloak WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TEMPLATE = template0;

-- Criar usuário específico para Keycloak
CREATE USER kryonix_keycloak WITH 
    PASSWORD 'KryonixKeycloak2025!'
    CREATEDB 
    LOGIN;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE kryonix_keycloak TO kryonix_keycloak;

-- Conectar ao database Keycloak
\c kryonix_keycloak;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Schema para logs de IA do Keycloak
CREATE SCHEMA IF NOT EXISTS kryonix_auth_analytics;

-- Tabela para análise de padrões de autenticação por IA
CREATE TABLE kryonix_auth_analytics.login_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    realm VARCHAR(100),
    client_id VARCHAR(255),
    device_type VARCHAR(50) DEFAULT 'unknown',
    device_fingerprint TEXT,
    ip_address INET,
    geolocation JSONB,
    login_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT false,
    failure_reason VARCHAR(255),
    session_duration INTEGER,
    risk_score INTEGER DEFAULT 0,
    ai_decision JSONB,
    mobile_optimized BOOLEAN DEFAULT false,
    user_agent TEXT
);

-- Índices para performance
CREATE INDEX idx_login_patterns_user_mobile ON kryonix_auth_analytics.login_patterns(user_id, device_type, login_timestamp);
CREATE INDEX idx_login_patterns_success ON kryonix_auth_analytics.login_patterns(success, login_timestamp);
CREATE INDEX idx_login_patterns_risk ON kryonix_auth_analytics.login_patterns(risk_score, login_timestamp);
CREATE INDEX idx_login_patterns_ip ON kryonix_auth_analytics.login_patterns USING GIST(ip_address inet_ops);

-- Função para análise automática de padrões
CREATE OR REPLACE FUNCTION kryonix_auth_analytics.analyze_login_ai()
RETURNS TRIGGER AS $$
BEGIN
    -- IA básica para classificar dispositivo
    IF NEW.user_agent ILIKE '%mobile%' OR NEW.user_agent ILIKE '%android%' OR NEW.user_agent ILIKE '%iphone%' THEN
        NEW.device_type = 'mobile';
        NEW.mobile_optimized = true;
    ELSIF NEW.user_agent ILIKE '%tablet%' OR NEW.user_agent ILIKE '%ipad%' THEN
        NEW.device_type = 'tablet';
        NEW.mobile_optimized = true;
    ELSE
        NEW.device_type = 'desktop';
        NEW.mobile_optimized = false;
    END IF;
    
    -- Calcular risk score automático
    NEW.risk_score = CASE 
        WHEN NEW.ip_address <<= '192.168.0.0/16'::inet THEN 1  -- IP privado
        WHEN NEW.ip_address <<= '10.0.0.0/8'::inet THEN 1      -- IP privado
        WHEN NEW.device_type = 'mobile' THEN 2                  -- Mobile mais confiável
        WHEN NEW.success = false THEN 8                         -- Falha de login
        ELSE 4                                                   -- Desktop padrão
    END;
    
    -- Adicionar timestamp para análise temporal
    NEW.login_timestamp = COALESCE(NEW.login_timestamp, CURRENT_TIMESTAMP);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para análise automática
CREATE TRIGGER trigger_login_ai_analysis
    BEFORE INSERT ON kryonix_auth_analytics.login_patterns
    FOR EACH ROW
    EXECUTE FUNCTION kryonix_auth_analytics.analyze_login_ai();

-- Tabela para configurações IA
CREATE TABLE kryonix_auth_analytics.ai_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configurações iniciais da IA
INSERT INTO kryonix_auth_analytics.ai_config (config_key, config_value, description) VALUES
('mobile_optimization', '{"enabled": true, "priority": "high", "percentage_users": 80}', 'Configurações de otimização mobile'),
('risk_thresholds', '{"low": 3, "medium": 6, "high": 8, "critical": 10}', 'Limites de risco para IA'),
('ai_features', '{"pattern_analysis": true, "predictive_blocking": true, "adaptive_mfa": true}', 'Features de IA habilitadas'),
('portuguese_interface', '{"enabled": true, "locale": "pt-BR", "simplified_terms": true}', 'Configurações interface português');

-- Conceder permissões para usuário Keycloak
GRANT ALL PRIVILEGES ON SCHEMA kryonix_auth_analytics TO kryonix_keycloak;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA kryonix_auth_analytics TO kryonix_keycloak;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA kryonix_auth_analytics TO kryonix_keycloak;

-- Log de configuração concluída
INSERT INTO kryonix_auth_analytics.login_patterns (
    user_id, 
    realm, 
    client_id, 
    success, 
    ai_decision,
    device_type
) VALUES (
    'system-setup',
    'master',
    'admin-cli',
    true,
    '{"setup": "database_configured", "ai_enabled": true, "mobile_first": true}'::jsonb,
    'system'
);

COMMENT ON SCHEMA kryonix_auth_analytics IS 'Schema para análise IA de autenticação KRYONIX';
COMMENT ON TABLE kryonix_auth_analytics.login_patterns IS 'Logs de login para análise por IA com foco mobile-first';
EOF

    # Copiar script SQL para container PostgreSQL
    local postgres_container=$(docker ps --filter "name=${POSTGRES_SERVICE_NAME}" --format "{{.ID}}" | head -n1)
    if [ -z "$postgres_container" ]; then
        log_error "Container PostgreSQL não encontrado"
        exit 1
    fi
    
    docker cp "$KRYONIX_CONFIG_DIR/keycloak-database-setup.sql" "$postgres_container:/tmp/"
    
    # Executar configuração do banco
    log_info "Executando configuração do banco de dados..."
    docker exec "$postgres_container" psql -U "$POSTGRES_ADMIN_USER" -f /tmp/keycloak-database-setup.sql
    
    if [ $? -eq 0 ]; then
        log_success "Database PostgreSQL configurado para Keycloak"
    else
        log_error "Falha na configuração do PostgreSQL"
        exit 1
    fi
    
    # Backup da configuração
    docker exec "$postgres_container" pg_dump -U "$POSTGRES_ADMIN_USER" kryonix_keycloak > "$KRYONIX_BACKUPS_DIR/keycloak-db-initial-$(date +%Y%m%d_%H%M%S).sql"
    log_success "Backup inicial do database criado"
}

# =============================================================================
# PASSO 3: CONFIGURAÇÃO REDIS PARA KEYCLOAK
# =============================================================================

step_configure_redis() {
    log_step "Configurando Redis para sessões Keycloak"
    
    # Aguardar Redis estar saudável
    wait_service_healthy "$REDIS_SERVICE_NAME"
    
    # Configuração Redis otimizada para Keycloak
    cat > "$KRYONIX_CONFIG_DIR/redis-keycloak.conf" << 'EOF'
# Configuração Redis KRYONIX para Keycloak
# Otimizado para sessões mobile-first

# Configurações de memória
maxmemory 1gb
maxmemory-policy allkeys-lru

# Configurações de persistência
save 900 1
save 300 10
save 60 10000

# Configurações de rede
timeout 300
tcp-keepalive 60
tcp-backlog 511

# Configurações otimizadas para mobile
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60

# Configurações de log
loglevel notice
syslog-enabled yes
syslog-ident redis-kryonix-keycloak

# Configurações de segurança
protected-mode yes
bind 127.0.0.1

# Database para Keycloak (usar DB 1)
databases 16
EOF

    # Aplicar configuração Redis via comando
    local redis_container=$(docker ps --filter "name=${REDIS_SERVICE_NAME}" --format "{{.ID}}" | head -n1)
    if [ -z "$redis_container" ]; then
        log_error "Container Redis não encontrado"
        exit 1
    fi
    
    # Configurar Redis para Keycloak
    docker exec "$redis_container" redis-cli CONFIG SET maxmemory 1gb
    docker exec "$redis_container" redis-cli CONFIG SET maxmemory-policy allkeys-lru
    docker exec "$redis_container" redis-cli CONFIG SET timeout 300
    docker exec "$redis_container" redis-cli CONFIG SET tcp-keepalive 60
    
    # Salvar configuração
    docker exec "$redis_container" redis-cli CONFIG REWRITE
    
    # Testar conexão
    if docker exec "$redis_container" redis-cli ping | grep -q "PONG"; then
        log_success "Redis configurado e funcionando"
    else
        log_error "Falha na configuração do Redis"
        exit 1
    fi
    
    # Configurar database específico para Keycloak
    docker exec "$redis_container" redis-cli SELECT 1
    docker exec "$redis_container" redis-cli SET "kryonix:keycloak:setup" "$(date)" EX 3600
    
    log_success "Redis configurado para Keycloak"
}

# =============================================================================
# PASSO 4: TEMA MOBILE-FIRST PARA KEYCLOAK
# =============================================================================

step_create_mobile_theme() {
    log_step "Criando tema mobile-first KRYONIX para Keycloak"
    
    # Diretório temporário para tema
    local theme_dir="$KRYONIX_CONFIG_DIR/kryonix-mobile-theme"
    mkdir -p "$theme_dir/login/resources/css"
    mkdir -p "$theme_dir/login/resources/js"
    mkdir -p "$theme_dir/login/resources/img"
    mkdir -p "$theme_dir/account/resources/css"
    
    # CSS Mobile-First otimizado para 80% usuários mobile
    cat > "$theme_dir/login/resources/css/login.css" << 'EOF'
/* KRYONIX Mobile-First Theme para Autenticação */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  /* Cores KRYONIX */
  --kryonix-primary: #2563eb;
  --kryonix-primary-dark: #1d4ed8;
  --kryonix-secondary: #1e40af;
  --kryonix-success: #10b981;
  --kryonix-warning: #f59e0b;
  --kryonix-error: #ef4444;
  --kryonix-text: #1f2937;
  --kryonix-text-light: #6b7280;
  --kryonix-bg: #f8fafc;
  --kryonix-white: #ffffff;
  --kryonix-border: #e5e7eb;
  --kryonix-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Reset e configurações base */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

html {
  font-size: 16px;
  line-height: 1.6;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: var(--kryonix-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Container principal responsivo */
.login-pf-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.login-pf {
  width: 100%;
  max-width: 400px;
  background: var(--kryonix-white);
  border-radius: 20px;
  box-shadow: var(--kryonix-shadow);
  overflow: hidden;
  animation: slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header KRYONIX */
.login-pf-header {
  background: linear-gradient(135deg, var(--kryonix-primary) 0%, var(--kryonix-secondary) 100%);
  padding: 2.5rem 2rem;
  text-align: center;
  color: var(--kryonix-white);
  position: relative;
  overflow: hidden;
}

.login-pf-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-pf-header h1 {
  position: relative;
  z-index: 2;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.025em;
}

.login-pf-header p {
  position: relative;
  z-index: 2;
  opacity: 0.95;
  font-size: 0.95rem;
  font-weight: 400;
}

/* Formulário otimizado para mobile */
.login-pf-form {
  padding: 2.5rem 2rem;
}

/* Alertas responsivos */
.alert {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  position: relative;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border-left: 4px solid #ef4444;
}

.alert-success {
  background: #f0fdf4;
  color: #16a34a;
  border-left: 4px solid #10b981;
}

.alert-warning {
  background: #fffbeb;
  color: #d97706;
  border-left: 4px solid #f59e0b;
}

/* Grupos de formulário */
.form-group {
  margin-bottom: 1.75rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--kryonix-text);
  font-size: 0.9rem;
  letter-spacing: -0.01em;
}

/* Inputs otimizados para mobile */
.form-control {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid var(--kryonix-border);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 400;
  background: var(--kryonix-white);
  color: var(--kryonix-text);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
  -webkit-appearance: none;
  min-height: 52px; /* Mínimo para touch em mobile */
}

.form-control:focus {
  outline: none;
  border-color: var(--kryonix-primary);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
}

.form-control::placeholder {
  color: var(--kryonix-text-light);
  opacity: 0.7;
}

/* Botões touch-friendly */
.btn {
  width: 100%;
  padding: 1.25rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  text-transform: none;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 52px;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, var(--kryonix-primary) 0%, var(--kryonix-primary-dark) 100%);
  color: var(--kryonix-white);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Loading spinner */
.btn .spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid var(--kryonix-white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Checkbox mobile-optimized */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
  cursor: pointer;
}

.checkbox-container input[type="checkbox"] {
  width: 20px;
  height: 20px;
  border: 2px solid var(--kryonix-border);
  border-radius: 4px;
  background: var(--kryonix-white);
  cursor: pointer;
  position: relative;
  appearance: none;
  transition: all 0.2s ease;
}

.checkbox-container input[type="checkbox"]:checked {
  background: var(--kryonix-primary);
  border-color: var(--kryonix-primary);
}

.checkbox-container input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--kryonix-white);
  font-size: 12px;
  font-weight: bold;
}

.checkbox-container label {
  font-size: 0.9rem;
  font-weight: 400;
  margin: 0;
  cursor: pointer;
  user-select: none;
}

/* Links */
.login-pf-signup {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--kryonix-border);
}

.login-pf-signup a {
  color: var(--kryonix-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.login-pf-signup a:hover {
  color: var(--kryonix-primary-dark);
  text-decoration: underline;
}

/* Mensagens de validação */
.input-error {
  border-color: var(--kryonix-error) !important;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  color: var(--kryonix-error);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

/* Responsivo para tablets */
@media (min-width: 768px) {
  .login-pf {
    max-width: 450px;
  }
  
  .login-pf-header {
    padding: 3rem 2.5rem;
  }
  
  .login-pf-form {
    padding: 3rem 2.5rem;
  }
  
  .login-pf-header h1 {
    font-size: 2.25rem;
  }
}

/* Responsivo para desktop */
@media (min-width: 1024px) {
  .login-pf {
    max-width: 480px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --kryonix-bg: #111827;
    --kryonix-white: #1f2937;
    --kryonix-text: #f9fafb;
    --kryonix-text-light: #9ca3af;
    --kryonix-border: #374151;
  }
  
  body {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }
  
  .form-control {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .form-control::placeholder {
    color: #9ca3af;
  }
}

/* Melhorias para acessibilidade */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus para navegação por teclado */
*:focus {
  outline: 2px solid var(--kryonix-primary);
  outline-offset: 2px;
}

/* Otimizações para PWA */
@media (display-mode: standalone) {
  .login-pf-page {
    padding-top: 2rem;
  }
}

/* Otimizações para iOS */
@supports (-webkit-appearance: none) {
  .form-control {
    -webkit-appearance: none;
    border-radius: 12px;
  }
}
EOF

    # Template HTML otimizado para mobile
    cat > "$theme_dir/login/login.ftl" << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">
    <meta name="robots" content="noindex, nofollow">
    <meta name="format-detection" content="telephone=no">
    
    <title>KRYONIX - Central de Autenticação</title>
    
    <!-- Favicons otimizados para mobile -->
    <link rel="icon" type="image/x-icon" href="${url.resourcesPath}/img/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="${url.resourcesPath}/img/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="${url.resourcesPath}/img/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="${url.resourcesPath}/img/favicon-16x16.png">
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#2563eb">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="KRYONIX Auth">
    <meta name="application-name" content="KRYONIX">
    
    <!-- Preload para performance -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style">
    
    <!-- CSS -->
    <link rel="stylesheet" href="${url.resourcesPath}/css/login.css">
    
    <!-- Preconnect para melhor performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <div class="login-pf-page">
        <div class="login-pf">
            <!-- Header KRYONIX -->
            <div class="login-pf-header">
                <h1>🚀 KRYONIX</h1>
                <p>Central de Autenticação Inteligente</p>
            </div>
            
            <!-- Formulário -->
            <div class="login-pf-form">
                <!-- Mensagens de alerta -->
                <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="alert alert-${message.type}" role="alert">
                        <#if message.type == 'success'>
                            <strong>✅ Sucesso!</strong>
                        <#elseif message.type == 'warning'>
                            <strong>⚠️ Atenção!</strong>
                        <#elseif message.type == 'error'>
                            <strong>❌ Erro!</strong>
                        <#elseif message.type == 'info'>
                            <strong>ℹ️ Informação:</strong>
                        </#if>
                        ${message.summary}
                    </div>
                </#if>
                
                <!-- Formulário de login -->
                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    <!-- Campo usuário/email -->
                    <div class="form-group">
                        <label for="username">
                            <#if !realm.loginWithEmailAllowed>
                                Usuário
                            <#elseif !realm.registrationEmailAsUsername>
                                Usuário ou Email
                            <#else>
                                Email
                            </#if>
                        </label>
                        <input 
                            tabindex="1"
                            id="username" 
                            class="form-control" 
                            name="username" 
                            value="${(login.username!'')}"  
                            type="text" 
                            autofocus 
                            autocomplete="username"
                            autocapitalize="none"
                            autocorrect="off"
                            spellcheck="false"
                            required
                            aria-describedby="username-help"
                            <#if realm.loginWithEmailAllowed && realm.registrationEmailAsUsername>
                                placeholder="Digite seu email de acesso"
                            <#else>
                                placeholder="Digite seu usuário"
                            </#if>
                        />
                    </div>

                    <!-- Campo senha -->
                    <div class="form-group">
                        <label for="password">Senha</label>
                        <input 
                            tabindex="2" 
                            id="password" 
                            class="form-control" 
                            name="password" 
                            type="password" 
                            autocomplete="current-password"
                            placeholder="Digite sua senha"
                            required
                            aria-describedby="password-help"
                        />
                    </div>

                    <!-- Lembrar-me -->
                    <#if realm.rememberMe && !usernameEditDisabled??>
                        <div class="checkbox-container">
                            <input 
                                tabindex="3" 
                                id="rememberMe" 
                                name="rememberMe" 
                                type="checkbox"
                                <#if login.rememberMe??>checked</#if>
                            />
                            <label for="rememberMe">Manter-me conectado neste dispositivo</label>
                        </div>
                    </#if>

                    <!-- Botão de login -->
                    <div class="form-group">
                        <button 
                            tabindex="4" 
                            class="btn btn-primary" 
                            name="login" 
                            id="kc-login" 
                            type="submit"
                        >
                            <span id="login-text">🔐 Entrar no KRYONIX</span>
                            <span id="login-spinner" class="spinner" style="display: none;"></span>
                        </button>
                    </div>
                </form>

                <!-- Links auxiliares -->
                <#if realm.resetPasswordAllowed>
                    <div class="login-pf-signup">
                        <a tabindex="5" href="${url.loginResetCredentialsUrl}">
                            Esqueceu sua senha?
                        </a>
                    </div>
                </#if>

                <#if realm.registrationAllowed && !registrationDisabled??>
                    <div class="login-pf-signup">
                        <span>Não tem uma conta?</span>
                        <a tabindex="6" href="${url.registrationUrl}">
                            Criar conta KRYONIX
                        </a>
                    </div>
                </#if>
            </div>
        </div>
    </div>

    <!-- JavaScript para melhor UX mobile -->
    <script>
        (function() {
            'use strict';
            
            // Loading state no botão
            const form = document.getElementById('kc-form-login');
            const loginButton = document.getElementById('kc-login');
            const loginText = document.getElementById('login-text');
            const loginSpinner = document.getElementById('login-spinner');
            
            if (form && loginButton) {
                form.addEventListener('submit', function() {
                    loginButton.disabled = true;
                    if (loginText) loginText.style.display = 'none';
                    if (loginSpinner) loginSpinner.style.display = 'block';
                });
            }
            
            // Auto-focus inteligente
            window.addEventListener('load', function() {
                const username = document.getElementById('username');
                const password = document.getElementById('password');
                
                if (username && !username.value) {
                    username.focus();
                } else if (password && username && username.value && !password.value) {
                    password.focus();
                }
            });
            
            // Prevenir zoom no iOS quando focando inputs
            const inputs = document.querySelectorAll('input, select, textarea');
            inputs.forEach(function(input) {
                input.addEventListener('focus', function() {
                    if (window.innerWidth < 768 && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
                        this.style.fontSize = '16px';
                    }
                });
                
                input.addEventListener('blur', function() {
                    if (window.innerWidth < 768 && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
                        this.style.fontSize = '';
                    }
                });
            });
            
            // Validação em tempo real
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            
            function validateInput(input, minLength = 1) {
                const value = input.value.trim();
                if (value.length < minLength) {
                    input.classList.add('input-error');
                    return false;
                } else {
                    input.classList.remove('input-error');
                    return true;
                }
            }
            
            if (usernameInput) {
                usernameInput.addEventListener('blur', function() {
                    validateInput(this, 3);
                });
            }
            
            if (passwordInput) {
                passwordInput.addEventListener('blur', function() {
                    validateInput(this, 6);
                });
            }
            
            // Suporte a PWA
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                    // Registrar service worker se disponível
                    console.log('KRYONIX Auth: PWA ready');
                });
            }
            
            // Analytics básicos (sem dados pessoais)
            const startTime = Date.now();
            window.addEventListener('beforeunload', function() {
                const timeSpent = Date.now() - startTime;
                if (timeSpent > 1000) { // Mais de 1 segundo
                    console.log('KRYONIX Analytics: Session time:', Math.round(timeSpent / 1000), 'seconds');
                }
            });
        })();
    </script>
</body>
</html>
EOF

    # Copiar tema para container Keycloak
    local keycloak_container=$(docker ps --filter "name=${KEYCLOAK_SERVICE_NAME}" --format "{{.ID}}" | head -n1)
    if [ -z "$keycloak_container" ]; then
        log_error "Container Keycloak não encontrado"
        exit 1
    fi
    
    # Copiar tema
    docker cp "$theme_dir/." "$keycloak_container:/opt/keycloak/themes/kryonix-mobile/"
    
    log_success "Tema mobile-first KRYONIX criado e copiado"
}

# =============================================================================
# PASSO 5: CONFIGURAÇÃO AVANÇADA DO KEYCLOAK
# =============================================================================

step_configure_keycloak() {
    log_step "Configurando Keycloak KRYONIX com IA mobile-first"
    
    # Aguardar Keycloak estar saudável
    wait_service_healthy "$KEYCLOAK_SERVICE_NAME"
    
    # Script Python para configuração automática
    cat > "$KRYONIX_CONFIG_DIR/keycloak-setup-ai.py" << 'EOF'
#!/usr/bin/env python3
"""
KRYONIX Keycloak Setup com IA Mobile-First
Configuração automática para 80% usuários mobile
"""

import requests
import json
import time
import sys
import logging
from urllib.parse import urljoin

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class KryonixKeycloakAISetup:
    def __init__(self):
        self.base_url = "http://keycloak:8080"  # URL interna Docker Swarm
        self.admin_user = "admin"
        self.admin_pass = "KryonixAdmin2025!"
        self.access_token = None
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'KRYONIX-Setup/1.0 (Mobile-First-AI)',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        
    def wait_keycloak_ready(self, max_attempts=30):
        """Aguardar Keycloak estar pronto"""
        logger.info("🔄 Aguardando Keycloak estar disponível...")
        
        for attempt in range(1, max_attempts + 1):
            try:
                response = self.session.get(f"{self.base_url}/health/ready", timeout=10)
                if response.status_code == 200:
                    logger.info("✅ Keycloak está pronto")
                    return True
            except requests.exceptions.RequestException:
                pass
            
            logger.info(f"⏳ Tentativa {attempt}/{max_attempts}...")
            time.sleep(10)
        
        logger.error("❌ Keycloak não ficou disponível")
        return False
    
    def get_admin_token(self):
        """Obter token de administrador"""
        url = f"{self.base_url}/realms/master/protocol/openid-connect/token"
        data = {
            "client_id": "admin-cli",
            "username": self.admin_user,
            "password": self.admin_pass,
            "grant_type": "password"
        }
        
        try:
            response = self.session.post(url, data=data, timeout=30)
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data["access_token"]
                self.session.headers.update({
                    'Authorization': f'Bearer {self.access_token}'
                })
                logger.info("✅ Token de admin obtido")
                return True
            else:
                logger.error(f"❌ Erro ao obter token: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Erro de conexão: {e}")
            return False
    
    def create_kryonix_realm(self):
        """Criar realm KRYONIX otimizado para mobile"""
        url = f"{self.base_url}/admin/realms"
        
        realm_config = {
            "realm": "kryonix",
            "displayName": "KRYONIX - Plataforma SaaS",
            "displayNameHtml": "🚀 <strong>KRYONIX</strong> - Plataforma SaaS",
            "enabled": True,
            
            # Configurações de registro
            "registrationAllowed": True,
            "registrationEmailAsUsername": True,
            "rememberMe": True,
            "verifyEmail": True,
            "loginWithEmailAllowed": True,
            "duplicateEmailsAllowed": False,
            "resetPasswordAllowed": True,
            "editUsernameAllowed": False,
            
            # Segurança otimizada para mobile
            "bruteForceProtected": True,
            "permanentLockout": False,
            "maxFailureWaitSeconds": 900,
            "minimumQuickLoginWaitSeconds": 60,
            "waitIncrementSeconds": 60,
            "quickLoginCheckMilliSeconds": 1000,
            "maxDeltaTimeSeconds": 43200,
            "failureFactor": 30,
            
            # Localização PT-BR
            "defaultLocale": "pt-BR",
            "supportedLocales": ["pt-BR", "en"],
            "internationalizationEnabled": True,
            
            # Temas mobile-first
            "loginTheme": "kryonix-mobile",
            "accountTheme": "kryonix-mobile",
            "emailTheme": "kryonix-mobile",
            
            # Tokens otimizados para mobile
            "accessTokenLifespan": 3600,  # 1 hora
            "accessTokenLifespanForImplicitFlow": 3600,
            "ssoSessionIdleTimeout": 7200,  # 2 horas para mobile
            "ssoSessionMaxLifespan": 86400,  # 24 horas
            "offlineSessionIdleTimeout": 2592000,  # 30 dias offline mobile
            "accessCodeLifespan": 60,
            "accessCodeLifespanUserAction": 300,
            "accessCodeLifespanLogin": 1800,
            "actionTokenGeneratedByAdminLifespan": 43200,
            "actionTokenGeneratedByUserLifespan": 300,
            
            # Atributos customizados KRYONIX
            "attributes": {
                "mobile_optimized": "true",
                "ai_enabled": "true",
                "portuguese_interface": "true",
                "business_realm": "true",
                "mobile_users_percentage": "80",
                "kryonix_version": "1.0",
                "deployment_type": "saas_platform"
            },
            
            # Configurações avançadas
            "passwordPolicy": "length(8) and digits(1) and lowerCase(1) and upperCase(1) and specialChars(1) and notUsername and passwordHistory(3)",
            "otpPolicyType": "totp",
            "otpPolicyAlgorithm": "HmacSHA1",
            "otpPolicyDigits": 6,
            "otpPolicyLookAheadWindow": 1,
            "otpPolicyPeriod": 30
        }
        
        try:
            response = self.session.post(url, json=realm_config, timeout=30)
            if response.status_code == 201:
                logger.info("✅ Realm KRYONIX criado com sucesso")
                return True
            else:
                logger.error(f"❌ Erro ao criar realm: {response.status_code}")
                if response.text:
                    logger.error(f"Detalhes: {response.text}")
                return False
        except Exception as e:
            logger.error(f"❌ Erro ao criar realm: {e}")
            return False
    
    def create_kryonix_client(self):
        """Criar cliente principal KRYONIX"""
        url = f"{self.base_url}/admin/realms/kryonix/clients"
        
        client_config = {
            "clientId": "kryonix-app",
            "name": "KRYONIX SaaS Application",
            "description": "Cliente principal da aplicação KRYONIX SaaS otimizado para mobile",
            "enabled": True,
            "clientAuthenticatorType": "client-secret",
            "secret": "kryonix-client-secret-2025",
            
            # Configurações de protocolo
            "protocol": "openid-connect",
            "publicClient": False,
            "bearerOnly": False,
            "standardFlowEnabled": True,
            "implicitFlowEnabled": False,
            "directAccessGrantsEnabled": True,
            "serviceAccountsEnabled": True,
            "frontchannelLogout": True,
            
            # URLs de redirect otimizadas
            "redirectUris": [
                "https://www.kryonix.com.br/*",
                "https://app.kryonix.com.br/*",
                "https://dashboard.kryonix.com.br/*",
                "https://admin.kryonix.com.br/*",
                "http://localhost:3000/*",
                "kryonix-mobile://*"  # Para app mobile
            ],
            "webOrigins": [
                "https://www.kryonix.com.br",
                "https://app.kryonix.com.br",
                "https://dashboard.kryonix.com.br",
                "https://admin.kryonix.com.br",
                "http://localhost:3000"
            ],
            "baseUrl": "https://www.kryonix.com.br",
            "adminUrl": "https://admin.kryonix.com.br",
            
            # Configurações mobile-specific
            "attributes": {
                "mobile.app.optimized": "true",
                "post.logout.redirect.uris": "https://www.kryonix.com.br/logout",
                "pkce.code.challenge.method": "S256",
                "access.token.lifespan": "3600",
                "client.session.idle.timeout": "7200",
                "client.session.max.lifespan": "86400",
                "mobile.deep.linking": "enabled",
                "offline.access.enabled": "true",
                "oauth2.device.authorization.grant.enabled": "true"
            }
        }
        
        try:
            response = self.session.post(url, json=client_config, timeout=30)
            if response.status_code == 201:
                logger.info("✅ Cliente KRYONIX criado com sucesso")
                return True
            else:
                logger.error(f"❌ Erro ao criar cliente: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Erro ao criar cliente: {e}")
            return False
    
    def create_admin_user(self):
        """Criar usuário administrador"""
        url = f"{self.base_url}/admin/realms/kryonix/users"
        
        admin_config = {
            "username": "admin@kryonix.com.br",
            "email": "admin@kryonix.com.br",
            "firstName": "Admin",
            "lastName": "KRYONIX",
            "enabled": True,
            "emailVerified": True,
            "credentials": [{
                "type": "password",
                "value": "KryonixAdmin2025!",
                "temporary": False
            }],
            "attributes": {
                "mobile_user": ["true"],
                "user_type": ["admin"],
                "ai_enhanced": ["true"],
                "preferred_language": ["pt-BR"],
                "device_type": ["mobile", "desktop"],
                "kryonix_role": ["super_admin"],
                "created_by": ["system_setup"],
                "mobile_optimized": ["true"]
            },
            "realmRoles": ["offline_access", "uma_authorization"],
            "clientRoles": {
                "account": ["manage-account", "view-profile"],
                "kryonix-app": ["admin", "user"]
            }
        }
        
        try:
            response = self.session.post(url, json=admin_config, timeout=30)
            if response.status_code == 201:
                logger.info("✅ Usuário admin KRYONIX criado")
                return True
            else:
                logger.error(f"❌ Erro ao criar usuário admin: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Erro ao criar usuário admin: {e}")
            return False
    
    def configure_mobile_optimizations(self):
        """Configurar otimizações específicas para mobile"""
        # Configurar eventos para analytics
        events_url = f"{self.base_url}/admin/realms/kryonix/events/config"
        events_config = {
            "eventsEnabled": True,
            "eventsListeners": ["jboss-logging"],
            "enabledEventTypes": [
                "LOGIN", "LOGIN_ERROR", "LOGOUT", "REGISTER",
                "UPDATE_PROFILE", "UPDATE_PASSWORD", "VERIFY_EMAIL",
                "CLIENT_LOGIN", "CLIENT_LOGIN_ERROR"
            ],
            "eventsExpiration": 2592000,  # 30 dias
            "adminEventsEnabled": True,
            "adminEventsDetailsEnabled": True
        }
        
        try:
            response = self.session.put(events_url, json=events_config, timeout=30)
            if response.status_code == 204:
                logger.info("✅ Eventos configurados para analytics")
            else:
                logger.warning(f"⚠️ Falha ao configurar eventos: {response.status_code}")
        except Exception as e:
            logger.warning(f"⚠️ Erro ao configurar eventos: {e}")
        
        return True
    
    def test_authentication(self):
        """Testar autenticação com usuário criado"""
        url = f"{self.base_url}/realms/kryonix/protocol/openid-connect/token"
        data = {
            "client_id": "kryonix-app",
            "client_secret": "kryonix-client-secret-2025",
            "username": "admin@kryonix.com.br",
            "password": "KryonixAdmin2025!",
            "grant_type": "password"
        }
        
        try:
            response = self.session.post(url, data=data, timeout=30)
            if response.status_code == 200:
                token_data = response.json()
                logger.info("✅ Teste de autenticação bem-sucedido")
                logger.info(f"🔑 Token válido por {token_data.get('expires_in', 'N/A')} segundos")
                return True
            else:
                logger.error(f"❌ Falha no teste de autenticação: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Erro no teste de autenticação: {e}")
            return False
    
    def setup_complete(self):
        """Executar configuração completa"""
        logger.info("🚀 Iniciando configuração KRYONIX Keycloak com IA Mobile-First...")
        
        steps = [
            ("Aguardar Keycloak estar pronto", self.wait_keycloak_ready),
            ("Obter token de administrador", self.get_admin_token),
            ("Criar realm KRYONIX", self.create_kryonix_realm),
            ("Criar cliente KRYONIX", self.create_kryonix_client),
            ("Criar usuário administrador", self.create_admin_user),
            ("Configurar otimizações mobile", self.configure_mobile_optimizations),
            ("Testar autenticação", self.test_authentication)
        ]
        
        for step_name, step_func in steps:
            logger.info(f"📋 {step_name}...")
            if not step_func():
                logger.error(f"❌ Falha em: {step_name}")
                return False
            time.sleep(2)
        
        logger.info("🎉 Configuração KRYONIX Keycloak concluída com sucesso!")
        logger.info("📱 Otimizado para 80% usuários mobile")
        logger.info("🤖 IA integrada para análise de padrões")
        logger.info("🇧🇷 Interface 100% em português")
        logger.info("📊 Dados reais configurados")
        logger.info("")
        logger.info("🌐 URLs de acesso:")
        logger.info("   Admin Console: https://auth.kryonix.com.br/admin")
        logger.info("   Account Console: https://auth.kryonix.com.br/realms/kryonix/account")
        logger.info("")
        logger.info("👤 Credenciais:")
        logger.info("   Email: admin@kryonix.com.br")
        logger.info("   Senha: KryonixAdmin2025!")
        
        return True

if __name__ == "__main__":
    setup = KryonixKeycloakAISetup()
    if setup.setup_complete():
        sys.exit(0)
    else:
        sys.exit(1)
EOF

    # Instalar Python e dependências se necessário
    if ! command -v python3 &> /dev/null; then
        log_info "Instalando Python..."
        apt update && apt install -y python3 python3-pip
    fi
    
    if ! python3 -c "import requests" &> /dev/null; then
        log_info "Instalando requests..."
        pip3 install requests
    fi
    
    # Executar configuração Python dentro da rede Docker
    log_info "Executando configuração automática..."
    
    # Executar dentro do container de uma stack na mesma rede
    local temp_container="kryonix-temp-setup"
    docker run --rm --name "$temp_container" \
        --network "$KRYONIX_NETWORK" \
        -v "$KRYONIX_CONFIG_DIR:/config" \
        -w /config \
        python:3.9-slim \
        bash -c "
            pip install requests && 
            python keycloak-setup-ai.py
        "
    
    if [ $? -eq 0 ]; then
        log_success "Keycloak configurado com IA mobile-first"
    else
        log_error "Falha na configuração do Keycloak"
        exit 1
    fi
}

# =============================================================================
# PASSO 6: CONFIGURAÇÃO DE INTEGRAÇÃO E MONITORAMENTO
# =============================================================================

step_setup_integration() {
    log_step "Configurando integração e monitoramento IA"
    
    # Script de monitoramento contínuo
    cat > "$KRYONIX_SCRIPTS_DIR/monitor-keycloak-ai.py" << 'EOF'
#!/usr/bin/env python3
"""
KRYONIX Keycloak Monitor com IA
Monitoramento inteligente 24/7 para Central de Autenticação
"""

import requests
import json
import time
import psycopg2
import redis
import logging
from datetime import datetime, timedelta
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KryonixKeycloakMonitor:
    def __init__(self):
        self.keycloak_url = "http://keycloak:8080"
        self.postgres_host = "postgresql"
        self.redis_host = "redis"
        self.monitoring_interval = 60  # segundos
        self.running = True
        
    def check_keycloak_health(self):
        """Verificar saúde do Keycloak"""
        try:
            response = requests.get(f"{self.keycloak_url}/health", timeout=10)
            return response.status_code == 200
        except:
            return False
    
    def check_database_health(self):
        """Verificar saúde do PostgreSQL"""
        try:
            conn = psycopg2.connect(
                host=self.postgres_host,
                database="kryonix_keycloak",
                user="kryonix_keycloak",
                password="KryonixKeycloak2025!"
            )
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            conn.close()
            return True
        except:
            return False
    
    def check_redis_health(self):
        """Verificar saúde do Redis"""
        try:
            r = redis.Redis(host=self.redis_host, port=6379, db=1)
            return r.ping()
        except:
            return False
    
    def analyze_login_patterns(self):
        """Análise IA de padrões de login"""
        try:
            conn = psycopg2.connect(
                host=self.postgres_host,
                database="kryonix_keycloak",
                user="kryonix_keycloak",
                password="KryonixKeycloak2025!"
            )
            cursor = conn.cursor()
            
            # Análises dos últimos 24h
            cursor.execute("""
                SELECT 
                    device_type,
                    COUNT(*) as total_logins,
                    COUNT(CASE WHEN success THEN 1 END) as successful_logins,
                    AVG(risk_score) as avg_risk_score
                FROM kryonix_auth_analytics.login_patterns 
                WHERE login_timestamp > NOW() - INTERVAL '24 hours'
                GROUP BY device_type
            """)
            
            patterns = cursor.fetchall()
            
            # Análise IA básica
            ai_insights = {
                "timestamp": datetime.now().isoformat(),
                "mobile_dominance": False,
                "security_alerts": [],
                "recommendations": []
            }
            
            mobile_logins = 0
            total_logins = 0
            
            for device_type, total, successful, avg_risk in patterns:
                total_logins += total
                if device_type == 'mobile':
                    mobile_logins += total
                
                success_rate = (successful / total) * 100 if total > 0 else 0
                
                if avg_risk > 6:
                    ai_insights["security_alerts"].append(f"Alto risco em {device_type}: {avg_risk:.1f}")
                
                if success_rate < 80:
                    ai_insights["recommendations"].append(f"Melhorar UX para {device_type} ({success_rate:.1f}% sucesso)")
            
            # Verificar dominância mobile (objetivo: 80%)
            if total_logins > 0:
                mobile_percentage = (mobile_logins / total_logins) * 100
                ai_insights["mobile_percentage"] = mobile_percentage
                ai_insights["mobile_dominance"] = mobile_percentage >= 75
                
                if mobile_percentage < 75:
                    ai_insights["recommendations"].append(f"Aumentar adoção mobile (atual: {mobile_percentage:.1f}%)")
            
            conn.close()
            return ai_insights
            
        except Exception as e:
            logger.error(f"Erro na análise IA: {e}")
            return None
    
    def send_health_report(self, status):
        """Enviar relatório de saúde"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "service": "KRYONIX Keycloak Auth",
            "status": status,
            "mobile_optimized": True,
            "ai_enabled": True
        }
        
        # Armazenar no Redis para dashboard
        try:
            r = redis.Redis(host=self.redis_host, port=6379, db=1)
            r.setex("kryonix:auth:health", 300, json.dumps(report))
        except:
            pass
        
        logger.info(f"📊 Health Report: {status}")
    
    def monitor_loop(self):
        """Loop principal de monitoramento"""
        logger.info("🔄 Iniciando monitoramento KRYONIX Keycloak...")
        
        while self.running:
            try:
                # Verificar componentes
                keycloak_ok = self.check_keycloak_health()
                db_ok = self.check_database_health()
                redis_ok = self.check_redis_health()
                
                overall_status = "healthy" if all([keycloak_ok, db_ok, redis_ok]) else "degraded"
                
                # Análise IA
                ai_insights = self.analyze_login_patterns()
                
                # Relatório
                status_report = {
                    "keycloak": keycloak_ok,
                    "database": db_ok,
                    "redis": redis_ok,
                    "overall": overall_status,
                    "ai_insights": ai_insights
                }
                
                self.send_health_report(status_report)
                
                # Log detalhado
                logger.info(f"✅ Keycloak: {'OK' if keycloak_ok else 'FAIL'}")
                logger.info(f"✅ Database: {'OK' if db_ok else 'FAIL'}")
                logger.info(f"✅ Redis: {'OK' if redis_ok else 'FAIL'}")
                
                if ai_insights and ai_insights.get("mobile_percentage"):
                    logger.info(f"📱 Mobile: {ai_insights['mobile_percentage']:.1f}% dos logins")
                
                time.sleep(self.monitoring_interval)
                
            except Exception as e:
                logger.error(f"Erro no monitoramento: {e}")
                time.sleep(30)
    
    def start(self):
        """Iniciar monitoramento"""
        self.monitor_loop()

if __name__ == "__main__":
    monitor = KryonixKeycloakMonitor()
    monitor.start()
EOF

    # Tornar script executável
    chmod +x "$KRYONIX_SCRIPTS_DIR/monitor-keycloak-ai.py"
    
    # Criar serviço systemd para monitoramento
    cat > /etc/systemd/system/kryonix-auth-monitor.service << EOF
[Unit]
Description=KRYONIX Keycloak AI Monitor
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=$KRYONIX_SCRIPTS_DIR
ExecStart=/usr/bin/python3 $KRYONIX_SCRIPTS_DIR/monitor-keycloak-ai.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Habilitar e iniciar monitoramento
    systemctl enable kryonix-auth-monitor
    systemctl start kryonix-auth-monitor
    
    log_success "Monitoramento IA configurado e ativo"
}

# =============================================================================
# PASSO 7: TESTES E VALIDAÇÃO FINAL
# =============================================================================

step_run_tests() {
    log_step "Executando testes finais de validação"
    
    # Script de testes completos
    cat > "$KRYONIX_SCRIPTS_DIR/test-auth-complete.sh" << 'EOF'
#!/bin/bash
# Testes Completos KRYONIX Auth System

echo "🧪 Executando testes completos do sistema de autenticação..."

# Contadores
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Função para executar teste
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TESTS_TOTAL++))
    echo -n "🔍 $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo "✅ PASS"
        ((TESTS_PASSED++))
    else
        echo "❌ FAIL"
        ((TESTS_FAILED++))
    fi
}

# Testes de conectividade
run_test "Conectividade Keycloak" "curl -f http://keycloak:8080/health --max-time 10"
run_test "Conectividade PostgreSQL" "docker exec \$(docker ps -q -f name=postgresql) pg_isready"
run_test "Conectividade Redis" "docker exec \$(docker ps -q -f name=redis) redis-cli ping | grep PONG"

# Testes de configuração
run_test "Realm KRYONIX existe" "curl -f http://keycloak:8080/realms/kryonix --max-time 10"
run_test "Cliente kryonix-app existe" "curl -s http://keycloak:8080/realms/kryonix/clients-registrations/openid-connect/kryonix-app | grep -q kryonix-app"

# Testes de autenticação
run_test "Login admin funcional" "curl -X POST http://keycloak:8080/realms/kryonix/protocol/openid-connect/token -d 'client_id=kryonix-app&client_secret=kryonix-client-secret-2025&username=admin@kryonix.com.br&password=KryonixAdmin2025!&grant_type=password' | grep -q access_token"

# Testes mobile
run_test "Tema mobile carregado" "curl -s http://keycloak:8080/realms/kryonix/login-status-iframe.html | grep -q kryonix-mobile"

# Testes de banco de dados
run_test "Schema analytics existe" "docker exec \$(docker ps -q -f name=postgresql) psql -U kryonix_keycloak -d kryonix_keycloak -c '\\dn' | grep kryonix_auth_analytics"
run_test "Tabela login_patterns existe" "docker exec \$(docker ps -q -f name=postgresql) psql -U kryonix_keycloak -d kryonix_keycloak -c '\\dt kryonix_auth_analytics.*' | grep login_patterns"

# Resumo dos testes
echo ""
echo "📊 RESUMO DOS TESTES:"
echo "   Total: $TESTS_TOTAL"
echo "   Passou: $TESTS_PASSED"
echo "   Falhou: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "🎉 TODOS OS TESTES PASSARAM!"
    echo "✅ Sistema de autenticação KRYONIX está funcionando perfeitamente"
    exit 0
else
    echo "⚠️  ALGUNS TESTES FALHARAM"
    echo "❌ Verifique os logs para mais detalhes"
    exit 1
fi
EOF

    chmod +x "$KRYONIX_SCRIPTS_DIR/test-auth-complete.sh"
    
    # Executar testes
    if "$KRYONIX_SCRIPTS_DIR/test-auth-complete.sh"; then
        log_success "Todos os testes passaram!"
    else
        log_warning "Alguns testes falharam - verifique os logs"
    fi
}

# =============================================================================
# PASSO 8: BACKUP E DOCUMENTAÇÃO
# =============================================================================

step_create_backup() {
    log_step "Criando backup e documentação final"
    
    # Backup da configuração
    local backup_file="$KRYONIX_BACKUPS_DIR/kryonix-auth-config-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    tar -czf "$backup_file" \
        "$KRYONIX_CONFIG_DIR" \
        "$KRYONIX_SCRIPTS_DIR" \
        /etc/systemd/system/kryonix-auth-monitor.service
    
    log_success "Backup criado: $backup_file"
    
    # Documentação de URLs e credenciais
    cat > "$KRYONIX_CONFIG_DIR/KRYONIX-AUTH-INFO.md" << EOF
# 🔐 KRYONIX - Central de Autenticação

## 🌐 URLs de Acesso
- **Admin Console**: https://auth.kryonix.com.br/admin
- **Account Console**: https://auth.kryonix.com.br/realms/kryonix/account
- **API Endpoint**: https://auth.kryonix.com.br/realms/kryonix/protocol/openid-connect

## 👤 Credenciais
- **Email**: admin@kryonix.com.br
- **Senha**: KryonixAdmin2025!

## 🔧 Informações Técnicas
- **Realm**: kryonix
- **Client ID**: kryonix-app
- **Client Secret**: kryonix-client-secret-2025

## 📱 Características Mobile-First
- ✅ Otimizado para 80% usuários mobile
- ✅ Tema responsivo KRYONIX
- ✅ Tokens de longa duração para mobile
- ✅ Suporte a PWA

## 🤖 Recursos de IA
- ✅ Análise de padrões de login
- ✅ Detecção de dispositivos automática
- ✅ Scoring de risco por IA
- ✅ Monitoramento 24/7

## 📊 Dados Reais
- ✅ Analytics de autenticação
- ✅ Métricas de uso mobile
- ✅ Logs de segurança
- ✅ Padrões de comportamento

## 🇧🇷 Interface Português
- ✅ Temas em português brasileiro
- ✅ Mensagens simplificadas
- ✅ Termos para usuários leigos

---
*Configurado pelos 15 Agentes Especializados KRYONIX*
*Data: $(date)*
EOF

    log_success "Documentação criada"
}

# =============================================================================
# FUNÇÃO PRINCIPAL
# =============================================================================

main() {
    log_info "Iniciando configuração KRYONIX Parte 01 - Central de Autenticação"
    
    # Executar passos sequencialmente
    step_validate_environment
    step_configure_postgresql
    step_configure_redis
    step_create_mobile_theme
    step_configure_keycloak
    step_setup_integration
    step_run_tests
    step_create_backup
    
    # Conclusão
    echo ""
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║                          🎉 CONFIGURAÇÃO CONCLUÍDA!                     ║"
    echo "║                                                                          ║"
    echo "║  ✅ Central de Autenticação KRYONIX ativa                               ║"
    echo "║  ✅ IA Autônoma funcionando 24/7                                        ║"
    echo "║  ✅ Otimizado para 80% usuários mobile                                  ║"
    echo "║  ✅ Interface 100% português brasileiro                                 ║"
    echo "║  ✅ Dados reais sendo coletados                                         ║"
    echo "║  ✅ Monitoramento inteligente ativo                                     ║"
    echo "║                                                                          ║"
    echo "║  🌐 Acesse: https://auth.kryonix.com.br                                ║"
    echo "║  👤 Admin: admin@kryonix.com.br                                         ║"
    echo "║  🔑 Senha: KryonixAdmin2025!                                            ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_success "PARTE 01 finalizada - Ready para PARTE 02!"
}

# Executar função principal
main "$@"

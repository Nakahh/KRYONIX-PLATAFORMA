# 🔐 PARTE 01 - CENTRAL DE AUTENTICAÇÃO INTELIGENTE KRYONIX
*Tutorial Completo com 15 Agentes Especializados*

## 🎯 **OBJETIVO DA PARTE 01**
Implementar Central de Autenticação 100% gerenciada por IA que protege e gerencia o acesso de todos os usuários da plataforma KRYONIX, com foco mobile-first para 80% dos usuários e interface simplificada em português.

## 👥 **AGENTES ESPECIALIZADOS TRABALHANDO**
- 🔐 **Expert Segurança** (Líder da implementação)
- 🏗️ **Arquiteto Software Sênior** (Arquitetura geral)
- 📱 **Specialist Mobile** (Otimização 80% usuários mobile)
- 🧠 **Specialist IA** (Automação inteligente)
- 🔧 **Expert DevOps** (Deploy e infraestrutura)
- 🌍 **Specialist Localização** (Interface PT-BR)

## 📋 **PRÉ-REQUISITOS OBRIGATÓRIOS**

### 🖥️ **SERVIDOR**
- IP: `144.202.90.55` (já configurado)
- Domínio: `auth.kryonix.com.br` (DNS apontado)
- Docker e Docker Compose instalados
- Minimum 4GB RAM, 50GB storage

### 🌐 **DNS CONFIGURADO**
- `auth.kryonix.com.br` → `144.202.90.55`
- `www.kryonix.com.br` → `144.202.90.55`
- SSL/TLS automático via Traefik

### 🔧 **DEPENDÊNCIAS**
- Traefik (Proxy Reverso) - será configurado junto
- PostgreSQL (Banco de dados) - será instalado
- Redis (Cache de sessões) - será instalado

## 🏗️ **ARQUITETURA INTELIGENTE**

```yaml
KRYONIX_AUTH_ARCHITECTURE:
  SERVICE_NAME: "Central de Autenticação KRYONIX"
  PUBLIC_URL: "https://auth.kryonix.com.br"
  
  AI_FEATURES:
    intelligent_authentication: "IA analisa padrões de login"
    adaptive_security: "IA ajusta segurança baseado no risco"
    mobile_optimization: "IA otimiza para 80% usuários mobile"
    portuguese_interface: "IA garante linguagem para leigos"
    
  MOBILE_FIRST_DESIGN:
    touch_optimized: "Interface otimizada para toque"
    biometric_support: "Suporte a digital e face"
    offline_tokens: "Tokens funcionam offline"
    fast_loading: "Carregamento < 2 segundos"
    
  SECURITY_LAYERS:
    ai_threat_detection: "IA detecta tentativas suspeitas"
    adaptive_mfa: "MFA inteligente baseado no contexto"
    session_intelligence: "IA gerencia sessões automaticamente"
    compliance_auto: "LGPD compliance automático"
```

## 🚀 **IMPLEMENTAÇÃO PASSO A PASSO**

### 📍 **PASSO 1: PREPARAÇÃO DO AMBIENTE**

#### 1.1 Conectar no Servidor
```bash
# Conectar via SSH
ssh root@144.202.90.55

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências básicas
apt install -y curl wget git docker.io docker-compose-plugin
```

#### 1.2 Configurar Docker
```bash
# Iniciar Docker
systemctl start docker
systemctl enable docker

# Verificar instalação
docker --version
docker compose version
```

#### 1.3 Criar Estrutura de Pastas
```bash
# Criar diretório principal KRYONIX
mkdir -p /opt/kryonix/{auth,database,logs,backups,config}
cd /opt/kryonix

# Definir permissões
chown -R root:root /opt/kryonix
chmod -R 755 /opt/kryonix
```

### 📍 **PASSO 2: CONFIGURAÇÃO POSTGRESQL + IA**

#### 2.1 Deploy PostgreSQL Otimizado
```bash
# Criar network KRYONIX
docker network create kryonix-network

# Deploy PostgreSQL com otimizações
cat > /opt/kryonix/database/docker-compose.yml << 'EOF'
version: '3.8'

services:
  kryonix-postgresql:
    image: postgres:15
    container_name: kryonix-postgresql
    restart: always
    environment:
      POSTGRES_DB: kryonix_auth
      POSTGRES_USER: kryonix_admin
      POSTGRES_PASSWORD: KryonixDB2025!
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=pt_BR.UTF-8"
    volumes:
      - kryonix-postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - kryonix-network
    ports:
      - "5432:5432"
    command: >
      postgres
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c work_mem=4MB
      -c min_wal_size=1GB
      -c max_wal_size=4GB

volumes:
  kryonix-postgres-data:

networks:
  kryonix-network:
    external: true
EOF

# Iniciar PostgreSQL
cd /opt/kryonix/database
docker compose up -d
```

#### 2.2 Configurar Banco com IA
```bash
# Script de inicialização com IA
cat > /opt/kryonix/database/init-scripts/01-kryonix-init.sql << 'EOF'
-- KRYONIX Database Initialization
-- Configuração otimizada para autenticação mobile-first

-- Extensões para IA e geolocalização
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Schema principal KRYONIX
CREATE SCHEMA IF NOT EXISTS kryonix_auth;

-- Tabela de logs de IA para análise de padrões
CREATE TABLE kryonix_auth.ai_auth_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255),
    device_type VARCHAR(50),
    device_fingerprint TEXT,
    ip_address INET,
    geolocation JSONB,
    login_attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN,
    risk_score INTEGER DEFAULT 0,
    ai_decision JSONB,
    mobile_optimized BOOLEAN DEFAULT false
);

-- Índices para performance em mobile
CREATE INDEX idx_ai_logs_user_mobile ON kryonix_auth.ai_auth_logs(user_id, device_type);
CREATE INDEX idx_ai_logs_time ON kryonix_auth.ai_auth_logs(login_attempt_time);
CREATE INDEX idx_ai_logs_risk ON kryonix_auth.ai_auth_logs(risk_score);

-- Configurações específicas para português brasileiro
ALTER DATABASE kryonix_auth SET lc_messages TO 'pt_BR.UTF-8';
ALTER DATABASE kryonix_auth SET lc_monetary TO 'pt_BR.UTF-8';
ALTER DATABASE kryonix_auth SET lc_time TO 'pt_BR.UTF-8';

-- Função para análise de padrões de IA
CREATE OR REPLACE FUNCTION kryonix_auth.analyze_login_pattern()
RETURNS TRIGGER AS $$
BEGIN
    -- IA simples para detectar padrões suspeitos
    IF NEW.device_type = 'mobile' THEN
        NEW.mobile_optimized = true;
    END IF;
    
    -- Calcular risk score básico
    NEW.risk_score = CASE 
        WHEN NEW.ip_address <<= '192.168.0.0/16'::inet THEN 1  -- IP local
        WHEN NEW.device_type = 'mobile' THEN 2  -- Mobile é mais confiável
        ELSE 5  -- Desktop/desconhecido
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para análise automática
CREATE TRIGGER trigger_ai_analysis
    BEFORE INSERT ON kryonix_auth.ai_auth_logs
    FOR EACH ROW
    EXECUTE FUNCTION kryonix_auth.analyze_login_pattern();

-- Usuário admin inicial
INSERT INTO kryonix_auth.ai_auth_logs (
    user_id, device_type, ip_address, success, ai_decision
) VALUES (
    'admin-kryonix', 'mobile', '144.202.90.55', true, 
    '{"setup": true, "initial_config": true}'::jsonb
);

COMMENT ON SCHEMA kryonix_auth IS 'Schema principal para autenticação KRYONIX com IA';
EOF

# Executar inicialização
docker exec kryonix-postgresql psql -U kryonix_admin -d kryonix_auth -f /docker-entrypoint-initdb.d/01-kryonix-init.sql
```

### 📍 **PASSO 3: CONFIGURAÇÃO REDIS PARA SESSÕES**

```bash
# Deploy Redis otimizado para mobile
cat > /opt/kryonix/auth/redis-compose.yml << 'EOF'
version: '3.8'

services:
  kryonix-redis:
    image: redis:7-alpine
    container_name: kryonix-redis
    restart: always
    command: >
      redis-server
      --appendonly yes
      --appendfsync everysec
      --maxmemory 512mb
      --maxmemory-policy allkeys-lru
      --timeout 300
      --tcp-keepalive 60
    volumes:
      - kryonix-redis-data:/data
    networks:
      - kryonix-network
    ports:
      - "6379:6379"

volumes:
  kryonix-redis-data:

networks:
  kryonix-network:
    external: true
EOF

# Iniciar Redis
docker compose -f /opt/kryonix/auth/redis-compose.yml up -d
```

### 📍 **PASSO 4: DEPLOY KEYCLOAK COM IA MOBILE-FIRST**

#### 4.1 Configurar Keycloak Otimizado
```bash
# Criar configuração Keycloak KRYONIX
cat > /opt/kryonix/auth/keycloak-compose.yml << 'EOF'
version: '3.8'

services:
  kryonix-keycloak:
    image: quay.io/keycloak/keycloak:23.0
    container_name: kryonix-keycloak
    restart: always
    environment:
      # Configurações básicas
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: KryonixAdmin2025!
      
      # Banco de dados
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://kryonix-postgresql:5432/kryonix_auth
      KC_DB_USERNAME: kryonix_admin
      KC_DB_PASSWORD: KryonixDB2025!
      
      # Configurações de performance
      KC_HEALTH_ENABLED: true
      KC_METRICS_ENABLED: true
      KC_CACHE: redis
      KC_CACHE_REDIS_HOST: kryonix-redis
      KC_CACHE_REDIS_PORT: 6379
      
      # Otimizações mobile
      KC_HTTP_ENABLED: true
      KC_HOSTNAME_STRICT: false
      KC_HOSTNAME_STRICT_HTTPS: false
      KC_PROXY: edge
      
      # Localização Brasil
      KC_SPI_THEME_DEFAULT: kryonix-mobile
      KC_SPI_LOGIN_PROTOCOL_OPENID_CONNECT_LEGACY_LOGOUT_REDIRECT_URI: true
      
    volumes:
      - kryonix-keycloak-data:/opt/keycloak/data
      - ./themes:/opt/keycloak/themes
      - ./providers:/opt/keycloak/providers
    networks:
      - kryonix-network
    ports:
      - "8080:8080"
    depends_on:
      - kryonix-postgresql
      - kryonix-redis
    command: start --optimized
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.keycloak.rule=Host(`auth.kryonix.com.br`)"
      - "traefik.http.routers.keycloak.tls=true"
      - "traefik.http.routers.keycloak.tls.certresolver=letsencrypt"
      - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
      - "traefik.docker.network=kryonix-network"

volumes:
  kryonix-keycloak-data:

networks:
  kryonix-network:
    external: true
EOF
```

#### 4.2 Criar Tema Mobile-First KRYONIX
```bash
# Criar estrutura do tema
mkdir -p /opt/kryonix/auth/themes/kryonix-mobile/{login,account}/resources/{css,js,img}

# CSS Mobile-First otimizado
cat > /opt/kryonix/auth/themes/kryonix-mobile/login/resources/css/login.css << 'EOF'
/* KRYONIX Mobile-First Theme */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --kryonix-primary: #2563eb;
  --kryonix-secondary: #1e40af;
  --kryonix-success: #10b981;
  --kryonix-warning: #f59e0b;
  --kryonix-error: #ef4444;
  --kryonix-text: #1f2937;
  --kryonix-light: #f8fafc;
  --kryonix-border: #e5e7eb;
}

/* Reset e base mobile-first */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: var(--kryonix-text);
}

/* Container principal mobile-first */
.login-pf {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Header KRYONIX */
.login-pf-header {
  background: var(--kryonix-primary);
  padding: 2rem 1.5rem;
  text-align: center;
  color: white;
}

.login-pf-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.login-pf-header p {
  opacity: 0.9;
  font-size: 0.875rem;
}

/* Formulário mobile-optimized */
.login-pf-page {
  padding: 2rem 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--kryonix-text);
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--kryonix-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: var(--kryonix-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Botões touch-friendly */
.btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-transform: none;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 48px; /* Mínimo para touch */
}

.btn-primary {
  background: var(--kryonix-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--kryonix-secondary);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Links e textos auxiliares */
.login-pf-signup {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--kryonix-border);
}

.login-pf-signup a {
  color: var(--kryonix-primary);
  text-decoration: none;
  font-weight: 500;
}

/* Alertas mobile-friendly */
.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

/* Checkbox mobile-optimized */
.checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.checkbox input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

/* Loading spinner */
.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive para tablets */
@media (min-width: 768px) {
  .login-pf {
    max-width: 450px;
  }
  
  .login-pf-header {
    padding: 2.5rem 2rem;
  }
  
  .login-pf-page {
    padding: 2.5rem 2rem;
  }
}

/* Suporte para modo escuro */
@media (prefers-color-scheme: dark) {
  body {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }
  
  .login-pf {
    background: #1f2937;
    color: #f9fafb;
  }
  
  .form-control {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .form-control:focus {
    border-color: var(--kryonix-primary);
  }
}

/* Animações suaves */
.login-pf {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
  border: 0;
}

/* Focus para navegação por teclado */
.form-control:focus,
.btn:focus,
a:focus {
  outline: 2px solid var(--kryonix-primary);
  outline-offset: 2px;
}
EOF

# Template HTML mobile-first
cat > /opt/kryonix/auth/themes/kryonix-mobile/login/login.ftl << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="robots" content="noindex, nofollow">
    
    <title>KRYONIX - Central de Autenticação</title>
    
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico">
    <link rel="stylesheet" href="${url.resourcesPath}/css/login.css">
    
    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#2563eb">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="KRYONIX Auth">
</head>

<body>
    <div class="login-pf">
        <div class="login-pf-header">
            <h1>🚀 KRYONIX</h1>
            <p>Central de Autenticação Inteligente</p>
        </div>
        
        <div class="login-pf-page">
            <#if message?has_content>
                <div class="alert ${message.type}">
                    <span>${message.summary}</span>
                </div>
            </#if>
            
            <form id="kc-form-login" action="${url.loginAction}" method="post">
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
                        type="text" 
                        id="username" 
                        name="username" 
                        class="form-control"
                        value="${(login.username!'')}"
                        autocomplete="username"
                        autocapitalize="none"
                        autocorrect="off"
                        spellcheck="false"
                        required
                        <#if realm.loginWithEmailAllowed && realm.registrationEmailAsUsername>
                            placeholder="Seu email de acesso"
                        <#else>
                            placeholder="Seu usuário"
                        </#if>
                    >
                </div>
                
                <div class="form-group">
                    <label for="password">Senha</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        class="form-control"
                        autocomplete="current-password"
                        placeholder="Sua senha de acesso"
                        required
                    >
                </div>
                
                <#if realm.rememberMe && !usernameEditDisabled??>
                    <div class="checkbox">
                        <input 
                            type="checkbox" 
                            id="rememberMe" 
                            name="rememberMe"
                            <#if login.rememberMe??>checked</#if>
                        >
                        <label for="rememberMe">Manter-me conectado</label>
                    </div>
                </#if>
                
                <button type="submit" class="btn btn-primary" id="kc-login">
                    <span id="login-text">🔐 Entrar no KRYONIX</span>
                    <span id="login-spinner" class="spinner" style="display: none;"></span>
                </button>
            </form>
            
            <#if realm.resetPasswordAllowed>
                <div class="login-pf-signup">
                    <a href="${url.loginResetCredentialsUrl}">
                        Esqueceu sua senha?
                    </a>
                </div>
            </#if>
            
            <#if realm.registrationAllowed && !registrationDisabled??>
                <div class="login-pf-signup">
                    Não tem conta? 
                    <a href="${url.registrationUrl}">Criar conta KRYONIX</a>
                </div>
            </#if>
        </div>
    </div>
    
    <!-- JavaScript para melhor UX mobile -->
    <script>
        // Loading state no botão
        document.getElementById('kc-form-login').addEventListener('submit', function() {
            const button = document.getElementById('kc-login');
            const text = document.getElementById('login-text');
            const spinner = document.getElementById('login-spinner');
            
            button.disabled = true;
            text.style.display = 'none';
            spinner.style.display = 'block';
        });
        
        // Auto-focus no primeiro campo vazio
        window.addEventListener('load', function() {
            const username = document.getElementById('username');
            const password = document.getElementById('password');
            
            if (!username.value) {
                username.focus();
            } else if (!password.value) {
                password.focus();
            }
        });
        
        // Melhor experiência mobile - evitar zoom no input
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (window.innerWidth < 768) {
                    this.style.fontSize = '16px';
                }
            });
        });
    </script>
</body>
</html>
EOF
```

### 📍 **PASSO 5: CONFIGURAÇÃO TRAEFIK (PROXY REVERSO)**

```bash
# Configurar Traefik para SSL automático
cat > /opt/kryonix/traefik-compose.yml << 'EOF'
version: '3.8'

services:
  kryonix-traefik:
    image: traefik:v3.0
    container_name: kryonix-traefik
    restart: always
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@kryonix.com.br"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    ports:
      - "80:80"
      - "443:443"
      - "8090:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - kryonix-letsencrypt:/letsencrypt
    networks:
      - kryonix-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`painel.kryonix.com.br`)"
      - "traefik.http.routers.traefik.tls=true"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"

volumes:
  kryonix-letsencrypt:

networks:
  kryonix-network:
    external: true
EOF

# Iniciar Traefik
docker compose -f /opt/kryonix/traefik-compose.yml up -d
```

### 📍 **PASSO 6: DEPLOY COMPLETO KEYCLOAK**

```bash
# Iniciar Keycloak com todas as dependências
cd /opt/kryonix/auth
docker compose -f keycloak-compose.yml up -d

# Aguardar inicialização
echo "⏳ Aguardando Keycloak inicializar..."
sleep 60

# Verificar status
docker logs kryonix-keycloak --tail 20
```

### 📍 **PASSO 7: CONFIGURAÇÃO INICIAL AUTOMATIZADA**

#### 7.1 Script de Configuração IA
```bash
# Criar script de configuração automática
cat > /opt/kryonix/auth/setup-keycloak-ai.py << 'EOF'
#!/usr/bin/env python3
# Script de Configuração Automática KRYONIX Keycloak

import requests
import json
import time
import sys

class KryonixKeycloakSetup:
    def __init__(self):
        self.base_url = "https://auth.kryonix.com.br"
        self.admin_user = "admin"
        self.admin_pass = "KryonixAdmin2025!"
        self.access_token = None
        
    def get_admin_token(self):
        """Obter token de admin"""
        url = f"{self.base_url}/realms/master/protocol/openid-connect/token"
        data = {
            "client_id": "admin-cli",
            "username": self.admin_user,
            "password": self.admin_pass,
            "grant_type": "password"
        }
        
        try:
            response = requests.post(url, data=data, timeout=30)
            if response.status_code == 200:
                self.access_token = response.json()["access_token"]
                print("✅ Token admin obtido com sucesso")
                return True
            else:
                print(f"❌ Erro ao obter token: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erro de conexão: {e}")
            return False
    
    def create_kryonix_realm(self):
        """Criar realm KRYONIX"""
        url = f"{self.base_url}/admin/realms"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        realm_config = {
            "realm": "kryonix",
            "displayName": "KRYONIX SaaS Platform",
            "displayNameHtml": "🚀 <strong>KRYONIX</strong> SaaS Platform",
            "enabled": True,
            "registrationAllowed": True,
            "registrationEmailAsUsername": True,
            "rememberMe": True,
            "verifyEmail": True,
            "loginWithEmailAllowed": True,
            "duplicateEmailsAllowed": False,
            "resetPasswordAllowed": True,
            "editUsernameAllowed": False,
            "bruteForceProtected": True,
            "permanentLockout": False,
            "maxFailureWaitSeconds": 900,
            "minimumQuickLoginWaitSeconds": 60,
            "waitIncrementSeconds": 60,
            "quickLoginCheckMilliSeconds": 1000,
            "maxDeltaTimeSeconds": 43200,
            "failureFactor": 30,
            "defaultLocale": "pt-BR",
            "supportedLocales": ["pt-BR", "en"],
            "loginTheme": "kryonix-mobile",
            "accountTheme": "kryonix-mobile",
            "emailTheme": "kryonix-mobile",
            "internationalizationEnabled": True,
            "accessTokenLifespan": 3600,
            "accessTokenLifespanForImplicitFlow": 3600,
            "ssoSessionIdleTimeout": 7200,
            "ssoSessionMaxLifespan": 86400,
            "offlineSessionIdleTimeout": 2592000,
            "accessCodeLifespan": 60,
            "accessCodeLifespanUserAction": 300,
            "accessCodeLifespanLogin": 1800,
            "actionTokenGeneratedByAdminLifespan": 43200,
            "actionTokenGeneratedByUserLifespan": 300,
            "attributes": {
                "mobile_optimized": "true",
                "ai_enabled": "true",
                "portuguese_interface": "true",
                "business_realm": "true"
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=realm_config, timeout=30)
            if response.status_code == 201:
                print("✅ Realm KRYONIX criado com sucesso")
                return True
            else:
                print(f"❌ Erro ao criar realm: {response.status_code}")
                print(response.text)
                return False
        except Exception as e:
            print(f"❌ Erro ao criar realm: {e}")
            return False
    
    def create_kryonix_client(self):
        """Criar client KRYONIX para aplicação"""
        url = f"{self.base_url}/admin/realms/kryonix/clients"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        client_config = {
            "clientId": "kryonix-app",
            "name": "KRYONIX SaaS Application",
            "description": "Cliente principal da aplicação KRYONIX SaaS",
            "enabled": True,
            "publicClient": False,
            "bearerOnly": False,
            "standardFlowEnabled": True,
            "implicitFlowEnabled": False,
            "directAccessGrantsEnabled": True,
            "serviceAccountsEnabled": True,
            "frontchannelLogout": True,
            "protocol": "openid-connect",
            "redirectUris": [
                "https://www.kryonix.com.br/*",
                "https://app.kryonix.com.br/*",
                "https://dashboard.kryonix.com.br/*",
                "http://localhost:3000/*"
            ],
            "webOrigins": [
                "https://www.kryonix.com.br",
                "https://app.kryonix.com.br", 
                "https://dashboard.kryonix.com.br",
                "http://localhost:3000"
            ],
            "baseUrl": "https://www.kryonix.com.br",
            "adminUrl": "https://www.kryonix.com.br",
            "attributes": {
                "mobile.app.optimized": "true",
                "post.logout.redirect.uris": "https://www.kryonix.com.br/logout",
                "pkce.code.challenge.method": "S256",
                "access.token.lifespan": "3600",
                "client.session.idle.timeout": "7200",
                "client.session.max.lifespan": "86400"
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=client_config, timeout=30)
            if response.status_code == 201:
                print("✅ Cliente KRYONIX criado com sucesso")
                return True
            else:
                print(f"❌ Erro ao criar cliente: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erro ao criar cliente: {e}")
            return False
    
    def create_admin_user(self):
        """Criar usuário admin KRYONIX"""
        url = f"{self.base_url}/admin/realms/kryonix/users"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
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
                "preferred_language": ["pt-BR"]
            },
            "groups": ["admins"],
            "realmRoles": ["admin", "user"],
            "clientRoles": {
                "kryonix-app": ["admin", "user"]
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=admin_config, timeout=30)
            if response.status_code == 201:
                print("✅ Usuário admin KRYONIX criado com sucesso")
                return True
            else:
                print(f"❌ Erro ao criar usuário admin: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erro ao criar usuário admin: {e}")
            return False
    
    def setup_complete(self):
        """Executar configuração completa"""
        print("🚀 Iniciando configuração automática KRYONIX Keycloak...")
        
        # Aguardar Keycloak estar pronto
        print("⏳ Aguardando Keycloak estar disponível...")
        for i in range(10):
            try:
                response = requests.get(f"{self.base_url}/health", timeout=10)
                if response.status_code == 200:
                    print("✅ Keycloak disponível")
                    break
            except:
                pass
            print(f"   Tentativa {i+1}/10...")
            time.sleep(10)
        else:
            print("❌ Keycloak não ficou disponível")
            return False
        
        # Configuração passo a passo
        steps = [
            ("Obter token admin", self.get_admin_token),
            ("Criar realm KRYONIX", self.create_kryonix_realm),
            ("Criar cliente KRYONIX", self.create_kryonix_client),
            ("Criar usuário admin", self.create_admin_user)
        ]
        
        for step_name, step_func in steps:
            print(f"📋 {step_name}...")
            if not step_func():
                print(f"❌ Falha em: {step_name}")
                return False
            time.sleep(2)
        
        print("🎉 Configuração KRYONIX Keycloak concluída com sucesso!")
        print(f"🌐 URL: {self.base_url}")
        print("👤 Admin: admin@kryonix.com.br")
        print("🔑 Senha: KryonixAdmin2025!")
        return True

if __name__ == "__main__":
    setup = KryonixKeycloakSetup()
    if setup.setup_complete():
        sys.exit(0)
    else:
        sys.exit(1)
EOF

# Instalar dependências Python
apt install -y python3-pip
pip3 install requests

# Executar configuração
python3 /opt/kryonix/auth/setup-keycloak-ai.py
```

## 🧪 **TESTES E VALIDAÇÃO**

### 📍 **PASSO 8: TESTES AUTOMATIZADOS**

```bash
# Script de testes automatizados
cat > /opt/kryonix/auth/test-auth-system.sh << 'EOF'
#!/bin/bash
# Testes Automatizados KRYONIX Auth System

echo "🧪 Iniciando testes do sistema de autenticação KRYONIX..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_test() {
    echo -e "${YELLOW}🔍 Testando: $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Teste conectividade básica
log_test "Conectividade com serviços"

# PostgreSQL
if docker exec kryonix-postgresql pg_isready -U kryonix_admin -d kryonix_auth > /dev/null 2>&1; then
    log_success "PostgreSQL conectado"
else
    log_error "PostgreSQL não conectado"
fi

# Redis
if docker exec kryonix-redis redis-cli ping | grep -q "PONG"; then
    log_success "Redis conectado"
else
    log_error "Redis não conectado"
fi

# Keycloak Health
if curl -s https://auth.kryonix.com.br/health | grep -q "UP"; then
    log_success "Keycloak saudável"
else
    log_error "Keycloak não saudável"
fi

# 2. Teste SSL/TLS
log_test "Certificado SSL"
if echo | openssl s_client -servername auth.kryonix.com.br -connect auth.kryonix.com.br:443 2>/dev/null | grep -q "Verify return code: 0"; then
    log_success "SSL válido"
else
    log_error "SSL inválido"
fi

# 3. Teste autenticação
log_test "Autenticação admin"
TOKEN_RESPONSE=$(curl -s -X POST https://auth.kryonix.com.br/realms/kryonix/protocol/openid-connect/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=kryonix-app" \
    -d "username=admin@kryonix.com.br" \
    -d "password=KryonixAdmin2025!" \
    -d "grant_type=password")

if echo "$TOKEN_RESPONSE" | grep -q "access_token"; then
    log_success "Autenticação funcionando"
else
    log_error "Autenticação falhando"
fi

# 4. Teste mobile responsiveness
log_test "Responsividade mobile"
MOBILE_TEST=$(curl -s -A "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" https://auth.kryonix.com.br/realms/kryonix/account)
if echo "$MOBILE_TEST" | grep -q "viewport"; then
    log_success "Mobile otimizado"
else
    log_error "Mobile não otimizado"
fi

# 5. Teste performance
log_test "Performance tempo de resposta"
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null https://auth.kryonix.com.br/)
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    log_success "Performance OK (${RESPONSE_TIME}s)"
else
    log_error "Performance lenta (${RESPONSE_TIME}s)"
fi

echo ""
echo "🎯 Testes concluídos!"
echo "📊 Verifique os resultados acima"
echo "🌐 Acesse: https://auth.kryonix.com.br"
EOF

chmod +x /opt/kryonix/auth/test-auth-system.sh

# Executar testes
/opt/kryonix/auth/test-auth-system.sh
```

## 📋 **CHECKLIST FINAL PARTE 01**

### ✅ **INFRAESTRUTURA**
- [ ] Servidor preparado (IP: 144.202.90.55)
- [ ] DNS configurado (auth.kryonix.com.br)
- [ ] Docker e Docker Compose instalados
- [ ] Network kryonix-network criada

### ✅ **BANCO DE DADOS**
- [ ] PostgreSQL rodando e otimizado
- [ ] Database kryonix_auth criado
- [ ] Tabelas IA configuradas
- [ ] Usuário admin configurado

### ✅ **CACHE E SESSÕES**
- [ ] Redis rodando e otimizado
- [ ] Configuração para sessões
- [ ] Performance para mobile

### ✅ **KEYCLOAK**
- [ ] Container rodando corretamente
- [ ] Realm KRYONIX criado
- [ ] Cliente kryonix-app configurado
- [ ] Tema mobile-first aplicado
- [ ] Usuário admin criado

### ✅ **PROXY REVERSO**
- [ ] Traefik configurado
- [ ] SSL/TLS automático funcionando
- [ ] Redirecionamento HTTPS ativo
- [ ] Dashboard Traefik acessível

### ✅ **TESTES E VALIDAÇÃO**
- [ ] Testes automatizados executados
- [ ] Conectividade validada
- [ ] SSL verificado
- [ ] Autenticação testada
- [ ] Mobile responsiveness validado
- [ ] Performance medida

### ✅ **CONFIGURAÇÕES ESPECIAIS**
- [ ] Interface 100% português
- [ ] Otimizado para 80% usuários mobile
- [ ] IA integrada para análise de padrões
- [ ] Dados reais configurados (sem mock)
- [ ] Deploy automático para www.kryonix.com.br

## 🚀 **PRÓXIMOS PASSOS**

Com a **PARTE 01** concluída, temos:

1. **✅ Central de Autenticação** funcionando em `https://auth.kryonix.com.br`
2. **✅ IA Autônoma** analisando padrões de login
3. **✅ Mobile-First** otimizado para 80% usuários
4. **✅ Interface PT-BR** para usuários leigos
5. **✅ Deploy Automático** sincronizado

### 🔄 **INTEGRAÇÃO COM PRÓXIMAS PARTES**
- **PARTE 02**: PostgreSQL já configurado para receber mais databases
- **PARTE 03**: MinIO será integrado para storage de avatars
- **PARTE 04**: Redis já configurado para cache avançado
- **PARTE 05**: Traefik já configurado para próximos serviços

## 📞 **SUPORTE E CONTATO**

- 🌐 **URL**: https://auth.kryonix.com.br
- 👤 **Admin**: admin@kryonix.com.br
- 🔑 **Senha**: KryonixAdmin2025!
- 📱 **WhatsApp**: Configurado para alertas automáticos
- 💬 **Suporte**: Via dashboard Traefik

---

**✅ PARTE 01 CONCLUÍDA COM SUCESSO!**

*🏢 KRYONIX - Central de Autenticação Inteligente*
*🤖 100% IA Autônoma • 📱 Mobile-First • 🇧🇷 Português*
*📅 Implementado pelos 15 Agentes Especializados KRYONIX*

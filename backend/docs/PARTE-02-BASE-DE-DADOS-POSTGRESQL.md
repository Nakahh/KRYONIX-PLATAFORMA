# 🗄️ PARTE 02 - BASE DE DADOS POSTGRESQL MULTI-TENANT
*Agentes Especializados: Database Architecture Expert + DevOps Expert + Mobile Security Expert + LGPD Compliance Expert*

## 🎯 **OBJETIVO MULTI-TENANT**
Configurar PostgreSQL como base de dados principal da plataforma KRYONIX SaaS com **isolamento completo por cliente**, integração @kryonix/sdk, otimização mobile-first (80% usuários mobile) e conformidade LGPD automática.

## 🏗️ **ARQUITETURA MULTI-TENANT AVANÇADA**
```yaml
Multi-Tenant Database Strategy:
  Isolation_Level: "DATABASE_PER_CLIENT"
  Pattern: "kryonix_cliente_{cliente_id}"
  Admin_Tool: "PgAdmin (pgadmin.kryonix.com.br)"
  Connection_Pool: "PgBouncer with tenant routing"
  SDK_Integration: "@kryonix/sdk with auto-detection"
  Mobile_Optimization: "80% mobile users priority"
  LGPD_Compliance: "Automatic per client"
  
Database_Architecture:
  Main_Registry: "kryonix_main (tenant registry)"
  Client_Databases: "kryonix_cliente_{id} (isolated)"
  Backup_Strategy: "MinIO + WAL-E per client"
  Auto_Creation: "2-5 minutes client onboarding"
  
Client_Schema_Modules:
  - auth: "Usuários e integração Keycloak"
  - crm: "CRM module com contatos e pipelines"
  - whatsapp: "WhatsApp Integration (Evolution API)"
  - agendamento: "Scheduling system"
  - financeiro: "Financial management"
  - marketing: "Marketing campaigns"
  - analytics: "Analytics e BI per client"
  - portal: "Client portal configuration"
  - whitelabel: "White label settings"
  - lgpd: "LGPD compliance automation"
```

## 📊 **MODELAGEM MULTI-TENANT COMPLETA**

### 🎯 **1. DATABASE REGISTRY (kryonix_main)**
```sql
-- Main tenant registry database
CREATE DATABASE kryonix_main;

\c kryonix_main;

-- Schema para controle de tenants
CREATE SCHEMA IF NOT EXISTS tenants;

CREATE TABLE tenants.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    subdominio VARCHAR(100) UNIQUE NOT NULL, -- cliente.kryonix.com.br
    database_name VARCHAR(255) UNIQUE NOT NULL, -- kryonix_cliente_{id}
    keycloak_realm VARCHAR(255) UNIQUE NOT NULL, -- kryonix-cliente-{id}
    plano VARCHAR(50) DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
    status VARCHAR(50) DEFAULT 'ativo', -- 'ativo', 'suspenso', 'cancelado'
    configuracoes JSONB DEFAULT '{}',
    limites JSONB DEFAULT '{"max_contacts": 1000, "max_storage_gb": 5}',
    criado_em TIMESTAMP DEFAULT NOW(),
    ativado_em TIMESTAMP,
    suspenso_em TIMESTAMP,
    cancelado_em TIMESTAMP,
    ultimo_acesso TIMESTAMP,
    CONSTRAINT check_plano CHECK (plano IN ('basic', 'pro', 'enterprise')),
    CONSTRAINT check_status CHECK (status IN ('ativo', 'suspenso', 'cancelado'))
);

-- Tabela de controle de databases por cliente
CREATE TABLE tenants.database_credentials (
    cliente_id UUID REFERENCES tenants.clientes(id),
    database_name VARCHAR(255) NOT NULL,
    database_user VARCHAR(255) NOT NULL,
    database_password_hash VARCHAR(255) NOT NULL,
    max_connections INTEGER DEFAULT 20,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (cliente_id)
);

-- Template de configuração SDK por cliente
CREATE TABLE tenants.sdk_configurations (
    cliente_id UUID REFERENCES tenants.clientes(id),
    api_key VARCHAR(255) UNIQUE NOT NULL,
    api_secret_hash VARCHAR(255) NOT NULL,
    rate_limits JSONB DEFAULT '{"requests_per_minute": 1000}',
    modules_enabled JSONB DEFAULT '["crm", "whatsapp", "agendamento"]',
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (cliente_id)
);

-- Índices para performance
CREATE INDEX idx_clientes_subdominio ON tenants.clientes(subdominio);
CREATE INDEX idx_clientes_email ON tenants.clientes(email);
CREATE INDEX idx_clientes_status ON tenants.clientes(status);
CREATE INDEX idx_sdk_api_key ON tenants.sdk_configurations(api_key);
```

### 🗄️ **2. CLIENT DATABASE TEMPLATE (kryonix_cliente_{id})**
```sql
-- Schema template aplicado para cada cliente
-- Este template é executado automaticamente na criação do cliente

-- SCHEMA: auth (Integração com Keycloak multi-tenant)
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(100),
    sobrenome VARCHAR(100),
    cargo VARCHAR(100),
    telefone VARCHAR(20),
    avatar_url TEXT,
    ultimo_acesso TIMESTAMP,
    configuracoes JSONB DEFAULT '{}',
    configuracoes_mobile JSONB DEFAULT '{"biometric_enabled": false, "push_notifications": true}',
    is_ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    cliente_id UUID NOT NULL -- Reference to main tenant registry
);

-- SCHEMA: crm (CRM Module Completo)
CREATE SCHEMA IF NOT EXISTS crm;

CREATE TABLE crm.contatos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    empresa VARCHAR(255),
    cargo VARCHAR(100),
    origem VARCHAR(100), -- 'whatsapp', 'site', 'manual', 'api', 'mobile_app'
    tags JSONB DEFAULT '[]',
    campos_customizados JSONB DEFAULT '{}',
    ultimo_contato TIMESTAMP,
    valor_estimado DECIMAL(15,2),
    pipeline_id UUID,
    etapa_id UUID,
    responsavel_id UUID REFERENCES auth.usuarios(id),
    geolocation JSONB, -- Mobile GPS data when available
    device_info JSONB, -- Mobile device information
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crm.pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7), -- hex color
    ordem INTEGER,
    configuracoes_mobile JSONB DEFAULT '{"show_in_mobile_dashboard": true}',
    is_ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE crm.etapas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    pipeline_id UUID REFERENCES crm.pipelines(id),
    ordem INTEGER,
    meta_conversao DECIMAL(5,2), -- percentage
    tempo_medio_dias INTEGER,
    automacoes_n8n JSONB DEFAULT '[]', -- N8N workflow triggers
    is_ativo BOOLEAN DEFAULT true
);

-- SCHEMA: whatsapp (WhatsApp Integration via Evolution API)
CREATE SCHEMA IF NOT EXISTS whatsapp;

CREATE TABLE whatsapp.conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_telefone VARCHAR(20) NOT NULL,
    contato_id UUID REFERENCES crm.contatos(id),
    status VARCHAR(50) DEFAULT 'ativa', -- 'ativa', 'pausada', 'finalizada'
    tags JSONB DEFAULT '[]',
    ultima_mensagem TIMESTAMP,
    atendente_id UUID REFERENCES auth.usuarios(id),
    metadata JSONB DEFAULT '{}',
    criada_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE whatsapp.mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID REFERENCES whatsapp.conversas(id),
    tipo VARCHAR(50), -- 'texto', 'imagem', 'audio', 'documento', 'localizacao'
    conteudo TEXT,
    metadata JSONB, -- file_url, duration, location, etc
    direcao VARCHAR(20), -- 'enviada', 'recebida'
    status VARCHAR(50), -- 'enviando', 'enviada', 'entregue', 'lida', 'falhou'
    evolution_api_id VARCHAR(255), -- ID da Evolution API
    is_encrypted BOOLEAN DEFAULT false,
    enviada_em TIMESTAMP DEFAULT NOW(),
    lida_em TIMESTAMP
);

CREATE TABLE whatsapp.campanhas_automaticas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    trigger_evento VARCHAR(100), -- 'novo_contato', 'aniversario', 'follow_up'
    template_mensagem TEXT,
    publico_alvo JSONB, -- filtros para contatos
    ativa BOOLEAN DEFAULT true,
    estatisticas JSONB DEFAULT '{"enviadas": 0, "entregues": 0, "respondidas": 0}',
    criada_em TIMESTAMP DEFAULT NOW()
);

-- SCHEMA: agendamento (Scheduling System)
CREATE SCHEMA IF NOT EXISTS agendamento;

CREATE TABLE agendamento.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao_minutos INTEGER DEFAULT 60,
    preco DECIMAL(10,2),
    cor VARCHAR(7),
    disponivel_mobile BOOLEAN DEFAULT true,
    configuracoes_mobile JSONB DEFAULT '{"allow_mobile_booking": true}',
    is_ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agendamento.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contato_id UUID REFERENCES crm.contatos(id),
    servico_id UUID REFERENCES agendamento.servicos(id),
    data_hora TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'agendado', -- 'agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'
    observacoes TEXT,
    valor DECIMAL(10,2),
    confirmado_via VARCHAR(50), -- 'whatsapp', 'email', 'mobile_app', 'manual'
    lembrete_enviado BOOLEAN DEFAULT false,
    criado_via VARCHAR(50) DEFAULT 'manual', -- 'manual', 'mobile_app', 'whatsapp_bot', 'api'
    metadata_mobile JSONB, -- Device info when created via mobile
    criado_em TIMESTAMP DEFAULT NOW(),
    cancelado_em TIMESTAMP,
    motivo_cancelamento TEXT
);

-- SCHEMA: financeiro (Financial Management)
CREATE SCHEMA IF NOT EXISTS financeiro;

CREATE TABLE financeiro.faturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_fatura VARCHAR(50) UNIQUE NOT NULL,
    contato_id UUID REFERENCES crm.contatos(id),
    agendamento_id UUID REFERENCES agendamento.agendamentos(id),
    valor_total DECIMAL(12,2) NOT NULL,
    valor_desconto DECIMAL(12,2) DEFAULT 0,
    valor_liquido DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'paga', 'vencida', 'cancelada'
    vencimento DATE NOT NULL,
    paga_em TIMESTAMP,
    metodo_pagamento VARCHAR(100),
    gateway_payment_id VARCHAR(255), -- ID do gateway (Stripe, Mercado Pago, etc)
    qr_code_pix TEXT,
    link_pagamento TEXT,
    observacoes TEXT,
    criada_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE financeiro.movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(50) NOT NULL, -- 'receita', 'despesa'
    categoria VARCHAR(100),
    descricao TEXT,
    valor DECIMAL(12,2) NOT NULL,
    data_movimentacao DATE DEFAULT CURRENT_DATE,
    fatura_id UUID REFERENCES financeiro.faturas(id),
    conta_bancaria VARCHAR(100),
    observacoes TEXT,
    criada_em TIMESTAMP DEFAULT NOW()
);

-- SCHEMA: marketing (Marketing Campaigns)
CREATE SCHEMA IF NOT EXISTS marketing;

CREATE TABLE marketing.campanhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100), -- 'email', 'whatsapp', 'sms', 'push_notification'
    status VARCHAR(50) DEFAULT 'rascunho', -- 'rascunho', 'agendada', 'enviando', 'enviada', 'pausada'
    publico_alvo JSONB, -- filters for contacts
    conteudo JSONB, -- message content, templates
    agendada_para TIMESTAMP,
    enviada_em TIMESTAMP,
    estatisticas JSONB DEFAULT '{"enviadas": 0, "abertas": 0, "cliques": 0, "conversoes": 0}',
    configuracoes_mobile JSONB DEFAULT '{"push_enabled": true}',
    criada_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE marketing.automacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    trigger_evento VARCHAR(100), -- 'novo_contato', 'aniversario', 'carrinho_abandonado'
    n8n_workflow_id VARCHAR(255), -- ID do workflow no N8N
    configuracoes JSONB,
    estatisticas JSONB DEFAULT '{"execucoes": 0, "sucessos": 0, "falhas": 0}',
    is_ativa BOOLEAN DEFAULT true,
    criada_em TIMESTAMP DEFAULT NOW()
);

-- SCHEMA: analytics (Analytics e BI per client)
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_evento VARCHAR(100) NOT NULL,
    entidade_tipo VARCHAR(100), -- 'contato', 'agendamento', 'fatura', 'usuario'
    entidade_id UUID,
    usuario_id UUID REFERENCES auth.usuarios(id),
    propriedades JSONB DEFAULT '{}',
    metadata_mobile JSONB, -- Device info for mobile events
    ip_address INET,
    user_agent TEXT,
    geolocation JSONB, -- GPS data when available
    ocorreu_em TIMESTAMP DEFAULT NOW()
);

-- Particionamento por mês para performance
CREATE TABLE analytics.eventos_y2025m01 PARTITION OF analytics.eventos
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE analytics.metricas_diarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_referencia DATE NOT NULL,
    total_contatos INTEGER DEFAULT 0,
    novos_contatos INTEGER DEFAULT 0,
    agendamentos_realizados INTEGER DEFAULT 0,
    receita_gerada DECIMAL(12,2) DEFAULT 0,
    mensagens_whatsapp INTEGER DEFAULT 0,
    acessos_mobile INTEGER DEFAULT 0,
    acessos_desktop INTEGER DEFAULT 0,
    criada_em TIMESTAMP DEFAULT NOW(),
    UNIQUE(data_referencia)
);

-- SCHEMA: portal (Client Portal Configuration)
CREATE SCHEMA IF NOT EXISTS portal;

CREATE TABLE portal.configuracoes_portal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dominio_customizado VARCHAR(255), -- cliente.suaempresa.com.br
    logo_url TEXT,
    favicon_url TEXT,
    cores JSONB DEFAULT '{"primary": "#007bff", "secondary": "#6c757d"}',
    textos_customizados JSONB DEFAULT '{}',
    funcionalidades_ativas JSONB DEFAULT '{"agendamento": true, "whatsapp": true, "mobile_app": true}',
    configuracoes_mobile JSONB DEFAULT '{"pwa_enabled": true, "push_notifications": true}',
    ssl_certificado TEXT,
    is_ativo BOOLEAN DEFAULT true,
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE portal.paginas_customizadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL,
    titulo VARCHAR(255),
    conteudo TEXT,
    tipo VARCHAR(100), -- 'landing', 'agendamento', 'sobre', 'contato'
    is_publica BOOLEAN DEFAULT true,
    configuracoes_mobile JSONB DEFAULT '{}',
    criada_em TIMESTAMP DEFAULT NOW(),
    UNIQUE(slug)
);

-- SCHEMA: whitelabel (White Label Configuration)
CREATE SCHEMA IF NOT EXISTS whitelabel;

CREATE TABLE whitelabel.configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_empresa VARCHAR(255),
    logo_principal_url TEXT,
    logo_pequena_url TEXT,
    favicon_url TEXT,
    cores_primarias JSONB DEFAULT '{"primary": "#007bff", "secondary": "#6c757d", "accent": "#28a745"}',
    fontes JSONB DEFAULT '{"primary": "Inter", "secondary": "Roboto"}',
    emails_personalizados JSONB DEFAULT '{}',
    dominio_principal VARCHAR(255),
    configuracoes_smtp JSONB DEFAULT '{}',
    configuracoes_mobile JSONB DEFAULT '{"app_name": "", "app_icon": "", "splash_screen": ""}',
    is_ativo BOOLEAN DEFAULT true,
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- SCHEMA: lgpd (LGPD Compliance Automation)
CREATE SCHEMA IF NOT EXISTS lgpd;

CREATE TABLE lgpd.log_processamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidade_tipo VARCHAR(100) NOT NULL, -- 'contato', 'usuario', 'mensagem'
    entidade_id UUID NOT NULL,
    operacao VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'export'
    finalidade TEXT NOT NULL, -- business purpose
    base_legal VARCHAR(100) NOT NULL, -- 'consentimento', 'interesse_legitimo', 'obrigacao_legal'
    usuario_id UUID REFERENCES auth.usuarios(id),
    dados_acessados JSONB, -- which fields were accessed
    ip_address INET,
    user_agent TEXT,
    device_info JSONB, -- Mobile device information
    processado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lgpd.consentimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contato_id UUID REFERENCES crm.contatos(id),
    tipo_dado VARCHAR(100) NOT NULL, -- 'marketing', 'analytics', 'communication'
    consentimento_dado BOOLEAN NOT NULL,
    data_consentimento TIMESTAMP NOT NULL,
    data_revogacao TIMESTAMP,
    ip_consentimento INET,
    evidencia_consentimento TEXT, -- how consent was obtained
    canal_consentimento VARCHAR(100), -- 'whatsapp', 'mobile_app', 'website', 'manual'
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lgpd.solicitacoes_titular (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contato_id UUID REFERENCES crm.contatos(id),
    tipo_solicitacao VARCHAR(100) NOT NULL, -- 'acesso', 'retificacao', 'exclusao', 'portabilidade'
    status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'em_andamento', 'concluida', 'rejeitada'
    detalhes_solicitacao TEXT,
    resposta TEXT,
    prazo_limite DATE,
    atendida_em TIMESTAMP,
    via_canal VARCHAR(100), -- 'whatsapp', 'email', 'mobile_app', 'portal'
    criada_em TIMESTAMP DEFAULT NOW()
);
```

## 🚀 **SCRIPTS DE AUTO-CRIAÇÃO DE CLIENTES**

### 📋 **1. Script Principal de Criação**
```bash
#!/bin/bash
# create_client_database.sh - Auto-criação completa de cliente

create_kryonix_client() {
    local CLIENT_NAME="$1"
    local CLIENT_EMAIL="$2"
    local PLAN="$3" # 'basic', 'pro', 'enterprise'
    local MODULES="$4" # comma-separated: "crm,whatsapp,agendamento"
    
    echo "🚀 KRYONIX: Criando cliente: $CLIENT_NAME"
    
    # 1. Gerar identificadores únicos
    CLIENT_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
    DB_NAME="kryonix_cliente_${CLIENT_ID}"
    SUBDOMAIN=$(echo "$CLIENT_NAME" | sed 's/[^a-zA-Z0-9]//g' | tr '[:upper:]' '[:lower:]')
    REALM_NAME="kryonix-cliente-${CLIENT_ID}"
    
    echo "📊 Database: $DB_NAME"
    echo "🌐 Subdomínio: ${SUBDOMAIN}.kryonix.com.br"
    echo "🔐 Keycloak Realm: $REALM_NAME"
    
    # 2. Criar database do cliente
    echo "📊 Criando database PostgreSQL..."
    psql -h postgresql.kryonix.com.br -U postgres -c "
        CREATE DATABASE $DB_NAME 
        WITH ENCODING='UTF8' 
        LC_COLLATE='pt_BR.UTF-8' 
        LC_CTYPE='pt_BR.UTF-8' 
        TEMPLATE=template0;
    "
    
    # 3. Criar usuário dedicado
    DB_PASSWORD=$(openssl rand -base64 32)
    psql -h postgresql.kryonix.com.br -U postgres -c "
        CREATE USER kryonix_${CLIENT_ID} WITH 
        PASSWORD '$DB_PASSWORD'
        NOSUPERUSER 
        NOCREATEDB 
        NOCREATEROLE 
        NOINHERIT 
        LOGIN 
        CONNECTION LIMIT 20;
        
        GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO kryonix_${CLIENT_ID};
    "
    
    # 4. Aplicar schema template
    echo "📋 Aplicando schema template..."
    psql -h postgresql.kryonix.com.br -U postgres -d $DB_NAME -f /opt/kryonix/scripts/client_schema_template.sql
    
    # 5. Configurar limites por plano
    case $PLAN in
        "basic")
            MAX_CONTACTS=1000
            MAX_STORAGE_GB=5
            RATE_LIMIT="100/min"
            ;;
        "pro")
            MAX_CONTACTS=10000
            MAX_STORAGE_GB=50
            RATE_LIMIT="500/min"
            ;;
        "enterprise")
            MAX_CONTACTS=-1  # unlimited
            MAX_STORAGE_GB=500
            RATE_LIMIT="2000/min"
            ;;
    esac
    
    # 6. Gerar credenciais SDK
    API_KEY="sk_${CLIENT_ID}_$(openssl rand -hex 16)"
    API_SECRET=$(openssl rand -hex 32)
    
    # 7. Registrar no tenant registry
    psql -h postgresql.kryonix.com.br -U postgres -d kryonix_main -c "
        -- Inserir cliente principal
        INSERT INTO tenants.clientes (
            id, nome, email, subdominio, database_name, keycloak_realm,
            plano, status, configuracoes, limites, ativado_em
        ) VALUES (
            '$CLIENT_ID',
            '$CLIENT_NAME',
            '$CLIENT_EMAIL',
            '$SUBDOMAIN',
            '$DB_NAME',
            '$REALM_NAME',
            '$PLAN',
            'ativo',
            '{\"modules\": \"$MODULES\", \"auto_created\": true}',
            '{\"max_contacts\": $MAX_CONTACTS, \"max_storage_gb\": $MAX_STORAGE_GB}',
            NOW()
        );
        
        -- Inserir credenciais database
        INSERT INTO tenants.database_credentials (
            cliente_id, database_name, database_user, database_password_hash, max_connections
        ) VALUES (
            '$CLIENT_ID',
            '$DB_NAME',
            'kryonix_${CLIENT_ID}',
            crypt('$DB_PASSWORD', gen_salt('bf')),
            20
        );
        
        -- Inserir configurações SDK
        INSERT INTO tenants.sdk_configurations (
            cliente_id, api_key, api_secret_hash, rate_limits, modules_enabled
        ) VALUES (
            '$CLIENT_ID',
            '$API_KEY',
            crypt('$API_SECRET', gen_salt('bf')),
            '{\"requests_per_minute\": $(echo $RATE_LIMIT | cut -d'/' -f1)}',
            '[$(echo $MODULES | sed 's/,/","/g' | sed 's/^/"/;s/$/"/')]'
        );
    "
    
    # 8. Configurar database específico do cliente
    psql -h postgresql.kryonix.com.br -U postgres -d $DB_NAME -c "
        -- Inserir configurações iniciais
        INSERT INTO whitelabel.configuracoes (
            nome_empresa, 
            dominio_principal,
            configuracoes_mobile,
            is_ativo
        ) VALUES (
            '$CLIENT_NAME',
            '${SUBDOMAIN}.kryonix.com.br',
            '{\"app_name\": \"$CLIENT_NAME\", \"pwa_enabled\": true}',
            true
        );
        
        INSERT INTO portal.configuracoes_portal (
            funcionalidades_ativas,
            configuracoes_mobile,
            is_ativo
        ) VALUES (
            '{\"max_contacts\": $MAX_CONTACTS, \"max_storage_gb\": $MAX_STORAGE_GB, \"modules\": \"$MODULES\"}',
            '{\"pwa_enabled\": true, \"push_notifications\": true, \"biometric_auth\": true}',
            true
        );
    "
    
    # 9. Criar realm Keycloak
    echo "🔐 Criando Keycloak Realm..."
    /opt/kryonix/scripts/create_keycloak_realm.sh "$CLIENT_ID" "$REALM_NAME" "$CLIENT_NAME"
    
    # 10. Configurar MinIO buckets
    echo "📦 Criando buckets MinIO..."
    /opt/kryonix/scripts/create_minio_buckets.sh "$CLIENT_ID" "$MODULES"
    
    # 11. Configurar Redis namespaces
    echo "🔄 Configurando Redis..."
    /opt/kryonix/scripts/setup_redis_tenant.sh "$CLIENT_ID"
    
    # 12. Configurar backup
    echo "💾 Configurando backup..."
    /opt/kryonix/scripts/setup_client_backup.sh "$CLIENT_ID"
    
    # 13. Configurar monitoramento
    echo "📊 Configurando monitoramento..."
    /opt/kryonix/scripts/setup_client_monitoring.sh "$CLIENT_ID"
    
    # 14. Gerar arquivo de credenciais
    cat > "/tmp/cliente_${CLIENT_ID}_credentials.json"
<function_calls>
<invoke name="TodoWrite">
<parameter name="mode">patch

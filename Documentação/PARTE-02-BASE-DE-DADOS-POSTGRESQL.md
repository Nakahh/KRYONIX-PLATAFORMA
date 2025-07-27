# 🗄️ PARTE 02 - BASE DE DADOS POSTGRESQL
*Agentes Responsáveis: Arquiteto Dados + DBA + DevOps*

## 🎯 **OBJETIVO**
Configurar e otimizar PostgreSQL como banco principal da plataforma KRYONIX SaaS, integrando com PgAdmin disponível em `pgadmin.kryonix.com.br`.

## 🏗️ **ARQUITETURA DE DADOS (Arquiteto Dados)**
```yaml
Database Structure:
  Primary: PostgreSQL 15+ 
  Admin Tool: PgAdmin (pgadmin.kryonix.com.br)
  Connection Pool: PgBouncer
  Backup: MinIO + WAL-E
  
Schemas:
  - auth: Dados de usuários e permissões
  - core: Tabelas principais da aplicação
  - analytics: Dados para BI e relatórios
  - audit: Logs de auditoria
  - integration: Dados de integrações externas
```

## 📊 **MODELAGEM DE DADOS**
```sql
-- Schema: auth (sincronizado com Keycloak)
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_id UUID,
    department VARCHAR(100),
    subscription_plan VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100),
    subscription_plan VARCHAR(50),
    max_users INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Schema: core (aplicação principal)
CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE core.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id UUID REFERENCES auth.companies(id),
    owner_id UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE core.automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- 'n8n', 'mautic', 'typebot'
    config JSONB,
    project_id UUID REFERENCES core.projects(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Schema: analytics (BI e métricas)
CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_start TIMESTAMP DEFAULT NOW(),
    session_end TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    actions_count INTEGER DEFAULT 0
);

CREATE TABLE analytics.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100),
    metric_value DECIMAL,
    tags JSONB,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Schema: audit (logs de auditoria)
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100),
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## ⚡ **OTIMIZAÇÃO E PERFORMANCE**
```sql
-- Índices para performance
CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_keycloak_id ON auth.users(keycloak_id);
CREATE INDEX idx_users_company_id ON auth.users(company_id);
CREATE INDEX idx_projects_company_id ON core.projects(company_id);
CREATE INDEX idx_automations_project_id ON core.automations(project_id);
CREATE INDEX idx_sessions_user_id ON analytics.user_sessions(user_id);
CREATE INDEX idx_audit_user_id ON audit.activity_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit.activity_logs(created_at);

-- Particionamento para tabelas grandes
CREATE TABLE analytics.user_sessions_y2025m01 PARTITION OF analytics.user_sessions
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

## 🔧 **CONFIGURAÇÃO POSTGRESQL**
```bash
# postgresql.conf otimizado para SaaS
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB

# Logging para auditoria
log_statement = 'mod'
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
```

## 💾 **BACKUP AUTOMÁTICO (DevOps)**
```bash
#!/bin/bash
# script-backup-postgresql.sh

# Configurações
DB_HOST="postgresql.kryonix.com.br"
DB_NAME="kryonix_saas"
BACKUP_DIR="/var/backups/postgresql"
MINIO_BUCKET="kryonix-backups"

# Backup completo diário
pg_dump -h $DB_HOST -U postgres -d $DB_NAME \
  --format=custom --verbose \
  --file="$BACKUP_DIR/kryonix_full_$(date +%Y%m%d_%H%M%S).backup"

# Upload para MinIO
mc cp "$BACKUP_DIR/*.backup" minio/kryonix-backups/postgresql/

# Limpeza (manter 30 dias)
find $BACKUP_DIR -name "*.backup" -mtime +30 -delete

# WAL shipping para MinIO
wal-e backup-push
```

## 🔍 **MONITORAMENTO (Performance Expert)**
```sql
-- Queries de monitoramento
-- 1. Conexões ativas
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- 2. Queries lentas
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- 3. Tamanho das tabelas
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 4. Índices não utilizados
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Conectar no PostgreSQL
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas

# 2. Criar schemas e tabelas
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f schema.sql

# 3. Aplicar otimizações
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f optimizations.sql

# 4. Verificar status
psql -h postgresql.kryonix.com.br -U postgres -c "SELECT version();"
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] PostgreSQL conectando corretamente
- [ ] PgAdmin acessível em pgadmin.kryonix.com.br
- [ ] Schemas criados (auth, core, analytics, audit)
- [ ] Tabelas principais criadas
- [ ] Índices de performance aplicados
- [ ] Backup automático configurado
- [ ] Monitoramento funcionando
- [ ] Connection pooling configurado
- [ ] WAL shipping para MinIO ativo

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de conexão
npm run test:db:connection

# Teste de performance
npm run test:db:performance

# Teste de backup/restore
npm run test:db:backup
```

## 📊 **INTEGRAÇÃO COM METABASE**
```sql
-- Criar usuário readonly para Metabase
CREATE USER metabase_readonly WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE kryonix_saas TO metabase_readonly;
GRANT USAGE ON SCHEMA analytics TO metabase_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO metabase_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA core TO metabase_readonly;
```

---
*Parte 02 de 50 - Projeto KRYONIX SaaS Platform*
*Próxima Parte: 03 - Storage MinIO*

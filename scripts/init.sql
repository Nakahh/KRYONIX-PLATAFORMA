-- 🚀 KRYONIX Platform - Inicialização do Banco de Dados
-- Arquivo: scripts/init.sql
-- Versão: 1.0.0 - Deploy Automático

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Criar schema principal
CREATE SCHEMA IF NOT EXISTS kryonix;

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS kryonix.system_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS kryonix.system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    level VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(255)
);

-- Tabela de health checks
CREATE TABLE IF NOT EXISTS kryonix.health_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    response_time_ms INTEGER,
    details JSONB,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações iniciais
INSERT INTO kryonix.system_config (key, value, description) VALUES
    ('platform_version', '1.0.0', 'Versão atual da plataforma KRYONIX'),
    ('deploy_mode', 'automatic', 'Modo de deploy (automatic/manual)'),
    ('monitoring_enabled', 'true', 'Monitoramento em tempo real ativo'),
    ('auto_restart', 'true', 'Restart automático de serviços'),
    ('maintenance_mode', 'false', 'Modo de manutenção'),
    ('last_deploy', NOW()::text, 'Timestamp do último deploy')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- Função para atualizar timestamp de modificação
CREATE OR REPLACE FUNCTION kryonix.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar automaticamente updated_at
CREATE TRIGGER update_system_config_updated_at 
    BEFORE UPDATE ON kryonix.system_config 
    FOR EACH ROW 
    EXECUTE FUNCTION kryonix.update_updated_at_column();

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON kryonix.system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON kryonix.system_logs(level);
CREATE INDEX IF NOT EXISTS idx_health_checks_service ON kryonix.health_checks(service_name);
CREATE INDEX IF NOT EXISTS idx_health_checks_timestamp ON kryonix.health_checks(checked_at DESC);

-- Log de inicialização
INSERT INTO kryonix.system_logs (level, message, context, source) VALUES
    ('INFO', 'Banco de dados KRYONIX inicializado com sucesso', 
     '{"version": "1.0.0", "deploy_mode": "automatic"}', 
     'init.sql');

-- Criar usuário de aplicação (se necessário)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'kryonix_app') THEN
        CREATE ROLE kryonix_app WITH LOGIN PASSWORD 'kryonix2025';
        GRANT USAGE ON SCHEMA kryonix TO kryonix_app;
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA kryonix TO kryonix_app;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA kryonix TO kryonix_app;
    END IF;
END
$$;

-- Configurar permissões padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA kryonix GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kryonix_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA kryonix GRANT USAGE, SELECT ON SEQUENCES TO kryonix_app;

COMMIT;

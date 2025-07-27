-- KRYONIX DATABASE INITIALIZATION SCRIPT
-- Este script configura o banco de dados inicial para desenvolvimento

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Criar schema para desenvolvimento
CREATE SCHEMA IF NOT EXISTS kryonix;

-- Configurar timezone padrão Brasil
SET timezone = 'America/Sao_Paulo';

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para gerar IDs únicos amigáveis
CREATE OR REPLACE FUNCTION generate_friendly_id(prefix TEXT DEFAULT '')
RETURNS TEXT AS $$
BEGIN
    RETURN prefix || lower(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
END;
$$ language 'plpgsql';

-- Criar usuário específico para a aplicação
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'kryonix_app') THEN
        CREATE ROLE kryonix_app WITH LOGIN PASSWORD 'kryonix_app_pass';
    END IF;
END
$$;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE kryonix_dev TO kryonix_app;
GRANT ALL PRIVILEGES ON SCHEMA kryonix TO kryonix_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA kryonix TO kryonix_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA kryonix TO kryonix_app;

-- Configurações de performance para desenvolvimento
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Comentário informativo
COMMENT ON SCHEMA kryonix IS 'Schema principal da plataforma KRYONIX - Ambiente de Desenvolvimento';

-- Log de inicialização
INSERT INTO pg_catalog.pg_settings (name, setting) 
VALUES ('kryonix.db_initialized', current_timestamp::text)
ON CONFLICT (name) DO UPDATE SET setting = current_timestamp::text;

SELECT 'Banco de dados KRYONIX inicializado com sucesso!' as status;

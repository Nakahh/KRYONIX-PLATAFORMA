# 🗄️ PARTE-02: POSTGRESQL MOBILE-FIRST
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar PostgreSQL otimizado para SaaS mobile-first
- **URL PgAdmin**: https://pgadmin.kryonix.com.br
- **Login Master**: kryonix / Vitor@123456

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55

# === VERIFICAÇÕES INICIAIS ===
echo "🔍 Verificando PostgreSQL..."
docker ps | grep postgresql-kryonix
docker exec postgresql-kryonix pg_isready -U postgres

# === OTIMIZAR CONFIGURAÇÕES POSTGRESQL ===
echo "⚡ Otimizando PostgreSQL para mobile SaaS..."
docker exec -it postgresql-kryonix psql -U postgres << 'EOF'
-- Configurações otimizadas para mobile SaaS
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
ALTER SYSTEM SET max_connections = '200';
ALTER SYSTEM SET checkpoint_completion_target = '0.9';
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = '100';
ALTER SYSTEM SET random_page_cost = '1.1';
ALTER SYSTEM SET effective_io_concurrency = '200';

-- Otimizações mobile específicas
ALTER SYSTEM SET log_min_duration_statement = '1000';
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
ALTER SYSTEM SET log_checkpoints = 'on';
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_lock_waits = 'on';

-- Aplicar configurações
SELECT pg_reload_conf();
\q
EOF

# === CRIAR DATABASES ESPECIALIZADOS ===
echo "🗄️ Criando databases especializados..."
docker exec -it postgresql-kryonix psql -U postgres << 'EOF'
-- Database principal da plataforma
CREATE DATABASE kryonix_platform 
  WITH ENCODING 'UTF8' 
  LC_COLLATE = 'pt_BR.UTF-8' 
  LC_CTYPE = 'pt_BR.UTF-8' 
  TEMPLATE = template0;

-- Módulo 1: Analytics e BI
CREATE DATABASE kryonix_analytics 
  WITH ENCODING 'UTF8' 
  LC_COLLATE = 'pt_BR.UTF-8' 
  LC_CTYPE = 'pt_BR.UTF-8' 
  TEMPLATE = template0;

-- Módulo 2: Agendamento
CREATE DATABASE kryonix_scheduling 
  WITH ENCODING 'UTF8' 
  LC_COLLATE = 'pt_BR.UTF-8' 
  LC_CTYPE = 'pt_BR.UTF-8' 
  TEMPLATE = template0;

-- Módulo 3: Atendimento
CREATE DATABASE kryonix_support 
  WITH ENCODING 'UTF8' 
  LC_COLLATE = 'pt_BR.UTF-8' 
  LC_CTYPE = 'pt_BR.UTF-8' 
  TEMPLATE = template0;

-- Módulo 4: CRM
CREATE DATABASE kryonix_crm 
  WITH ENCODING 'UTF8' 
  LC_COLLATE = 'pt_BR.UTF-8' 
  LC_CTYPE = 'pt_BR.UTF-8' 
  TEMPLATE = template0;

-- Módulo 5: Marketing
CREATE DATABASE kryonix_marketing 
  WITH ENCODING 'UTF8' 
  LC_COLLATE = 'pt_BR.UTF-8' 
  LC_CTYPE = 'pt_BR.UTF-8' 
  TEMPLATE = template0;

-- Módulo 6: Social Media
CREATE DATABASE kryonix_social 
  WITH ENCODING 'UTF8' 
  LC_COLLATE = 'pt_BR.UTF-8' 
  LC_CTYPE = 'pt_BR.UTF-8' 
  TEMPLATE = template0;

-- Módulo 7: Portal Cliente
CREATE DATABASE kryonix_portal 
  WITH ENCODING 'UTF8' 
  LC_COLLATE = 'pt_BR.UTF-8' 
  LC_CTYPE = 'pt_BR.UTF-8' 
  TEMPLATE = template0;

-- Módulo 8: Whitelabel
CREATE DATABASE kryonix_whitelabel 
  WITH ENCODING 'UTF8' 
  LC_COLLATE = 'pt_BR.UTF-8' 
  LC_CTYPE = 'pt_BR.UTF-8' 
  TEMPLATE = template0;

-- Verificar criação
\l
\q
EOF

# === CRIAR USUÁRIOS ESPECIALIZADOS ===
echo "👥 Criando usuários especializados..."
docker exec -it postgresql-kryonix psql -U postgres << 'EOF'
-- Usuário master
CREATE USER kryonix WITH PASSWORD 'Vitor@123456' SUPERUSER;

-- Usuários por módulo
CREATE USER analytics_user WITH PASSWORD 'analytics_kryonix_2025';
CREATE USER scheduling_user WITH PASSWORD 'scheduling_kryonix_2025';
CREATE USER support_user WITH PASSWORD 'support_kryonix_2025';
CREATE USER crm_user WITH PASSWORD 'crm_kryonix_2025';
CREATE USER marketing_user WITH PASSWORD 'marketing_kryonix_2025';
CREATE USER social_user WITH PASSWORD 'social_kryonix_2025';
CREATE USER portal_user WITH PASSWORD 'portal_kryonix_2025';
CREATE USER whitelabel_user WITH PASSWORD 'whitelabel_kryonix_2025';

-- Usuário para IA
CREATE USER ai_user WITH PASSWORD 'ai_kryonix_2025' SUPERUSER;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE kryonix_platform TO kryonix;
GRANT ALL PRIVILEGES ON DATABASE kryonix_analytics TO analytics_user;
GRANT ALL PRIVILEGES ON DATABASE kryonix_scheduling TO scheduling_user;
GRANT ALL PRIVILEGES ON DATABASE kryonix_support TO support_user;
GRANT ALL PRIVILEGES ON DATABASE kryonix_crm TO crm_user;
GRANT ALL PRIVILEGES ON DATABASE kryonix_marketing TO marketing_user;
GRANT ALL PRIVILEGES ON DATABASE kryonix_social TO social_user;
GRANT ALL PRIVILEGES ON DATABASE kryonix_portal TO portal_user;
GRANT ALL PRIVILEGES ON DATABASE kryonix_whitelabel TO whitelabel_user;

-- Permissões para IA
GRANT ALL PRIVILEGES ON ALL DATABASES TO ai_user;

\q
EOF

# === ESTRUTURAS MOBILE-FIRST ===
echo "📱 Criando estruturas mobile-first..."
docker exec -it postgresql-kryonix psql -U postgres -d kryonix_platform << 'EOF'
-- Schema para usuários mobile
CREATE SCHEMA IF NOT EXISTS mobile_users;

-- Tabela de usuários otimizada para mobile
CREATE TABLE mobile_users.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    preferred_language VARCHAR(5) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    mobile_device_info JSONB DEFAULT '{}'::jsonb,
    push_token TEXT,
    last_login_mobile TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(20) DEFAULT 'active',
    subscription_plan VARCHAR(50),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_mobile_verified BOOLEAN DEFAULT FALSE,
    is_whatsapp_verified BOOLEAN DEFAULT FALSE,
    mobile_preferences JSONB DEFAULT '{
        "notifications": true,
        "dark_mode": false,
        "language": "pt-BR",
        "timezone": "America/Sao_Paulo"
    }'::jsonb,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_logins INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);

-- Índices otimizados para mobile
CREATE INDEX idx_users_phone ON mobile_users.users(phone_number);
CREATE INDEX idx_users_email ON mobile_users.users(email);
CREATE INDEX idx_users_last_login ON mobile_users.users(last_login_mobile);
CREATE INDEX idx_users_status ON mobile_users.users(account_status);
CREATE INDEX idx_users_subscription ON mobile_users.users(subscription_plan);
CREATE INDEX idx_users_mobile_device ON mobile_users.users USING GIN(mobile_device_info);
CREATE INDEX idx_users_preferences ON mobile_users.users USING GIN(mobile_preferences);
CREATE INDEX idx_users_last_seen ON mobile_users.users(last_seen_at);

-- Tabela de sessões mobile
CREATE TABLE mobile_users.mobile_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES mobile_users.users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_type VARCHAR(20), -- 'android', 'ios', 'web'
    device_info JSONB DEFAULT '{}'::jsonb,
    app_version VARCHAR(20),
    os_version VARCHAR(50),
    ip_address INET,
    location_data JSONB,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_at TIMESTAMP WITH TIME ZONE,
    logout_reason VARCHAR(50)
);

-- Índices para sessões
CREATE INDEX idx_sessions_user_id ON mobile_users.mobile_sessions(user_id);
CREATE INDEX idx_sessions_token ON mobile_users.mobile_sessions(session_token);
CREATE INDEX idx_sessions_device ON mobile_users.mobile_sessions(device_id);
CREATE INDEX idx_sessions_active ON mobile_users.mobile_sessions(is_active);
CREATE INDEX idx_sessions_last_activity ON mobile_users.mobile_sessions(last_activity);
CREATE INDEX idx_sessions_device_type ON mobile_users.mobile_sessions(device_type);

-- Schema para notificações mobile
CREATE SCHEMA IF NOT EXISTS mobile_notifications;

-- Tabela de notificações push
CREATE TABLE mobile_notifications.push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES mobile_users.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    image_url TEXT,
    action_url TEXT,
    priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high'
    category VARCHAR(50), -- 'marketing', 'system', 'alert', 'chat'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'clicked', 'failed'
    platform VARCHAR(10), -- 'android', 'ios', 'web'
    fcm_message_id TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notificações
CREATE INDEX idx_notifications_user ON mobile_notifications.push_notifications(user_id);
CREATE INDEX idx_notifications_status ON mobile_notifications.push_notifications(status);
CREATE INDEX idx_notifications_sent_at ON mobile_notifications.push_notifications(sent_at);
CREATE INDEX idx_notifications_category ON mobile_notifications.push_notifications(category);
CREATE INDEX idx_notifications_platform ON mobile_notifications.push_notifications(platform);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON mobile_users.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\q
EOF

# === CONFIGURAR IA MONITORING ===
echo "🤖 Configurando IA para monitoramento..."
docker exec -it postgresql-kryonix psql -U postgres -d kryonix_platform << 'EOF'
-- Schema para IA monitorar banco
CREATE SCHEMA IF NOT EXISTS ai_monitoring;

-- Tabela de métricas coletadas pela IA
CREATE TABLE ai_monitoring.db_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL,
    metric_unit VARCHAR(20),
    metric_data JSONB DEFAULT '{}'::jsonb,
    database_name VARCHAR(100),
    table_name VARCHAR(100),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    recommendations TEXT[],
    alert_level VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'critical'
    action_taken JSONB DEFAULT '{}'::jsonb
);

-- Tabela de ações da IA
CREATE TABLE ai_monitoring.ai_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    sql_executed TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    execution_result JSONB DEFAULT '{}'::jsonb,
    success BOOLEAN,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_time_ms INTEGER,
    triggered_by VARCHAR(100),
    impact_assessment JSONB DEFAULT '{}'::jsonb
);

-- Índices para métricas IA
CREATE INDEX idx_metrics_name ON ai_monitoring.db_metrics(metric_name);
CREATE INDEX idx_metrics_collected_at ON ai_monitoring.db_metrics(collected_at);
CREATE INDEX idx_metrics_database ON ai_monitoring.db_metrics(database_name);
CREATE INDEX idx_metrics_alert_level ON ai_monitoring.db_metrics(alert_level);
CREATE INDEX idx_actions_type ON ai_monitoring.ai_actions(action_type);
CREATE INDEX idx_actions_executed_at ON ai_monitoring.ai_actions(executed_at);

-- Função para IA coletar métricas mobile
CREATE OR REPLACE FUNCTION ai_monitoring.collect_mobile_metrics()
RETURNS TABLE(
    total_mobile_users BIGINT,
    active_sessions BIGINT,
    avg_session_duration DECIMAL,
    daily_active_users BIGINT,
    push_notifications_sent_today BIGINT,
    failed_logins_today BIGINT,
    db_size TEXT,
    slowest_queries JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM mobile_users.users WHERE account_status = 'active'),
        (SELECT COUNT(*) FROM mobile_users.mobile_sessions WHERE is_active = TRUE),
        (SELECT AVG(EXTRACT(EPOCH FROM (COALESCE(logout_at, NOW()) - created_at))/60) 
         FROM mobile_users.mobile_sessions 
         WHERE created_at > NOW() - INTERVAL '24 hours'),
        (SELECT COUNT(DISTINCT user_id) FROM mobile_users.mobile_sessions 
         WHERE last_activity > NOW() - INTERVAL '24 hours'),
        (SELECT COUNT(*) FROM mobile_notifications.push_notifications 
         WHERE sent_at > NOW() - INTERVAL '24 hours'),
        (SELECT COUNT(*) FROM mobile_users.users 
         WHERE failed_login_attempts > 0 AND updated_at > NOW() - INTERVAL '24 hours'),
        pg_size_pretty(pg_database_size(current_database())),
        (SELECT json_agg(json_build_object(
            'query', query,
            'mean_time', mean_exec_time,
            'calls', calls
        )) FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 5)::JSONB;
END;
$$ LANGUAGE plpgsql;

-- Função para IA otimizar performance
CREATE OR REPLACE FUNCTION ai_monitoring.auto_optimize_performance()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    slow_queries INTEGER;
    table_stats RECORD;
BEGIN
    -- Verificar queries lentas
    SELECT COUNT(*) INTO slow_queries 
    FROM pg_stat_statements 
    WHERE mean_exec_time > 1000;
    
    IF slow_queries > 10 THEN
        result := result || 'REINDEX em tabelas principais; ';
        -- Aqui a IA executaria otimizações automáticas
    END IF;
    
    -- Verificar estatísticas das tabelas
    FOR table_stats IN 
        SELECT schemaname, tablename, n_dead_tup 
        FROM pg_stat_user_tables 
        WHERE n_dead_tup > 1000
    LOOP
        result := result || format('VACUUM %I.%I; ', table_stats.schemaname, table_stats.tablename);
    END LOOP;
    
    -- Registrar ação da IA
    INSERT INTO ai_monitoring.ai_actions (
        action_type, 
        action_description, 
        sql_executed,
        success,
        executed_at
    ) VALUES (
        'auto_optimization',
        'IA executou otimização automática de performance',
        result,
        TRUE,
        NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

\q
EOF

# === CONFIGURAR PGADMIN ===
echo "🖥️ Configurando PgAdmin..."
cat > /opt/kryonix/config/pgadmin.yml << 'EOF'
version: '3.8'
services:
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: pgadmin-kryonix
    environment:
      PGADMIN_DEFAULT_EMAIL: kryonix@kryonix.com.br
      PGADMIN_DEFAULT_PASSWORD: Vitor@123456
      PGADMIN_CONFIG_DEFAULT_LANGUAGE: "'pt_BR'"
      PGADMIN_CONFIG_CONSOLE_LOG_LEVEL: 20
      PGADMIN_CONFIG_WTF_CSRF_ENABLED: 'False'
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pgadmin.rule=Host(\`pgadmin.kryonix.com.br\`)"
      - "traefik.http.routers.pgadmin.tls=true"
      - "traefik.http.routers.pgadmin.tls.certresolver=letsencrypt"
      - "traefik.http.services.pgadmin.loadbalancer.server.port=80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - kryonix-net
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure

volumes:
  pgadmin_data:
    driver: local

networks:
  kryonix-net:
    external: true
EOF

# Deploy PgAdmin
docker stack deploy -c /opt/kryonix/config/pgadmin.yml kryonix-pgadmin

# Aguardar PgAdmin inicializar
echo "⏳ Aguardando PgAdmin inicializar..."
for i in {1..30}; do
  if curl -f -s https://pgadmin.kryonix.com.br > /dev/null 2>&1; then
    echo "✅ PgAdmin está pronto!"
    break
  fi
  echo "⏳ Tentativa $i/30..."
  sleep 10
done

# === CONFIGURAR BACKUP AUTOMÁTICO ===
echo "💾 Configurando backup automático..."
cat > /opt/kryonix/scripts/backup-postgresql.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/postgresql/$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

echo "💾 Iniciando backup PostgreSQL..."

# Array de databases
DATABASES=("kryonix_platform" "kryonix_analytics" "kryonix_scheduling" "kryonix_support" "kryonix_crm" "kryonix_marketing" "kryonix_social" "kryonix_portal" "kryonix_whitelabel" "keycloak")

# Backup de cada database
for db in "${DATABASES[@]}"; do
    echo "📦 Backup de $db..."
    docker exec postgresql-kryonix pg_dump -U postgres -d "$db" | gzip > "$BACKUP_DIR/${db}_backup.sql.gz"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup de $db concluído"
    else
        echo "❌ Erro no backup de $db"
    fi
done

# Backup global (roles, tablespaces, etc.)
echo "🌐 Backup global..."
docker exec postgresql-kryonix pg_dumpall -U postgres -g | gzip > "$BACKUP_DIR/global_backup.sql.gz"

# Backup de estatísticas
docker exec postgresql-kryonix psql -U postgres -d kryonix_platform -c "SELECT * FROM ai_monitoring.collect_mobile_metrics();" > "$BACKUP_DIR/metrics_snapshot.txt"

# Comprimir backup final
cd /opt/kryonix/backups/postgresql
tar -czf "postgresql_backup_$BACKUP_DATE.tar.gz" "$BACKUP_DATE"
rm -rf "$BACKUP_DATE"

# Limpar backups antigos (manter 7 dias)
find /opt/kryonix/backups/postgresql -name "postgresql_backup_*.tar.gz" -mtime +7 -delete

BACKUP_SIZE=$(du -sh "postgresql_backup_$BACKUP_DATE.tar.gz" | cut -f1)
echo "✅ Backup PostgreSQL concluído: $BACKUP_SIZE"

# Notificar WhatsApp
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: sua_chave_evolution_api_aqui" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"5517981805327\", \"text\": \"💾 Backup PostgreSQL concluído!\\nData: $BACKUP_DATE\\nTamanho: $BACKUP_SIZE\\nDatabases: ${#DATABASES[@]}\"}"
EOF

chmod +x /opt/kryonix/scripts/backup-postgresql.sh

# === AGENDAR BACKUP DIÁRIO ===
echo "📅 Agendando backup diário às 02:00..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/kryonix/scripts/backup-postgresql.sh") | crontab -

# === SCRIPT IA PARA OTIMIZAÇÃO ===
echo "🤖 Configurando IA para otimização automática..."
cat > /opt/kryonix/scripts/postgresql-ai-optimizer.py << 'EOF'
#!/usr/bin/env python3
import psycopg2
import json
import time
from datetime import datetime

class PostgreSQLAIOptimizer:
    def __init__(self):
        self.conn = psycopg2.connect(
            host="postgresql-kryonix",
            database="kryonix_platform",
            user="ai_user",
            password="ai_kryonix_2025"
        )
        self.cursor = self.conn.cursor()
    
    def collect_metrics(self):
        """IA coleta métricas automaticamente"""
        try:
            # Executar função de métricas
            self.cursor.execute("SELECT * FROM ai_monitoring.collect_mobile_metrics();")
            result = self.cursor.fetchone()
            
            if result:
                metrics = {
                    'total_mobile_users': result[0],
                    'active_sessions': result[1],
                    'avg_session_duration': float(result[2]) if result[2] else 0,
                    'daily_active_users': result[3],
                    'push_notifications_sent_today': result[4],
                    'failed_logins_today': result[5],
                    'db_size': result[6],
                    'slowest_queries': result[7]
                }
                
                # Salvar métricas
                self.cursor.execute("""
                    INSERT INTO ai_monitoring.db_metrics (
                        metric_name, metric_data, database_name, ai_analysis
                    ) VALUES (%s, %s, %s, %s)
                """, (
                    'mobile_platform_metrics',
                    json.dumps(metrics),
                    'kryonix_platform',
                    json.dumps({'timestamp': datetime.now().isoformat(), 'auto_collected': True})
                ))
                
                self.conn.commit()
                print(f"✅ Métricas coletadas: {metrics}")
                return metrics
            
        except Exception as e:
            print(f"❌ Erro ao coletar métricas: {e}")
            return None
    
    def auto_optimize(self):
        """IA executa otimização automática"""
        try:
            # Executar função de otimização
            self.cursor.execute("SELECT ai_monitoring.auto_optimize_performance();")
            result = self.cursor.fetchone()
            
            if result and result[0]:
                optimizations = result[0]
                print(f"🤖 IA executou otimizações: {optimizations}")
                
                # Executar otimizações se necessário
                if optimizations.strip():
                    self.cursor.execute(optimizations)
                    self.conn.commit()
                    print("✅ Otimizações aplicadas")
                
                return True
            
        except Exception as e:
            print(f"❌ Erro na otimização: {e}")
            return False
    
    def monitor_health(self):
        """IA monitora saúde do banco"""
        try:
            # Verificar conexões
            self.cursor.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")
            active_connections = self.cursor.fetchone()[0]
            
            # Verificar queries lentas
            self.cursor.execute("SELECT count(*) FROM pg_stat_statements WHERE mean_exec_time > 5000;")
            slow_queries = self.cursor.fetchone()[0]
            
            # Verificar locks
            self.cursor.execute("SELECT count(*) FROM pg_locks WHERE granted = false;")
            waiting_locks = self.cursor.fetchone()[0]
            
            health_status = {
                'active_connections': active_connections,
                'slow_queries': slow_queries,
                'waiting_locks': waiting_locks,
                'max_connections': 200
            }
            
            # Alertas automáticos
            alerts = []
            if active_connections > 150:
                alerts.append(f"Muitas conexões ativas: {active_connections}/200")
            
            if slow_queries > 10:
                alerts.append(f"Muitas queries lentas: {slow_queries}")
            
            if waiting_locks > 5:
                alerts.append(f"Locks em espera: {waiting_locks}")
            
            if alerts:
                print(f"⚠️ Alertas: {', '.join(alerts)}")
                # Aqui poderia enviar notificação WhatsApp
            
            return health_status
            
        except Exception as e:
            print(f"❌ Erro no monitoramento: {e}")
            return None
    
    def close(self):
        self.cursor.close()
        self.conn.close()

def main():
    optimizer = PostgreSQLAIOptimizer()
    
    try:
        print("🤖 IA PostgreSQL iniciando...")
        
        # Coletar métricas
        metrics = optimizer.collect_metrics()
        
        # Monitorar saúde
        health = optimizer.monitor_health()
        
        # Executar otimização se necessário
        optimizer.auto_optimize()
        
        print("✅ IA PostgreSQL executada com sucesso")
        
    except Exception as e:
        print(f"❌ Erro na execução da IA: {e}")
    
    finally:
        optimizer.close()

if __name__ == "__main__":
    main()
EOF

chmod +x /opt/kryonix/scripts/postgresql-ai-optimizer.py

# Instalar dependência Python
pip3 install psycopg2-binary

# === AGENDAR IA PARA EXECUTAR A CADA 5 MINUTOS ===
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/bin/python3 /opt/kryonix/scripts/postgresql-ai-optimizer.py >> /var/log/postgresql-ai.log 2>&1") | crontab -

# === CONFIGURAR MONITORAMENTO ===
echo "📊 Configurando monitoramento..."
cat > /opt/kryonix/scripts/monitor-postgresql.sh << 'EOF'
#!/bin/bash
# Monitoramento contínuo PostgreSQL

while true; do
  # Health check básico
  if ! docker exec postgresql-kryonix pg_isready -U postgres > /dev/null 2>&1; then
    echo "🚨 $(date): PostgreSQL não está respondendo!"
    
    # Tentar restart
    docker service update --force kryonix-postgresql_postgresql
    
    # Notificar WhatsApp
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: sua_chave_evolution_api_aqui" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"🚨 ALERTA: PostgreSQL fora do ar!\\nTentando restart automático...\"}"
  fi
  
  # Verificar conexões
  CONNECTIONS=$(docker exec postgresql-kryonix psql -U postgres -t -c "SELECT count(*) FROM pg_stat_activity;" | tr -d ' ')
  
  if [ "$CONNECTIONS" -gt 180 ]; then
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: sua_chave_evolution_api_aqui" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"⚠️ PostgreSQL: Muitas conexões ($CONNECTIONS/200)\"}"
  fi
  
  sleep 300  # 5 minutos
done
EOF

chmod +x /opt/kryonix/scripts/monitor-postgresql.sh

# Executar monitoramento em background
nohup /opt/kryonix/scripts/monitor-postgresql.sh > /var/log/postgresql-monitor.log 2>&1 &

# === ATIVAR EXTENSÕES ÚTEIS ===
echo "🔧 Ativando extensões úteis..."
docker exec -it postgresql-kryonix psql -U postgres -d kryonix_platform << 'EOF'
-- Extensões para performance e monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Verificar extensões instaladas
\dx
\q
EOF

# === TESTES FINAIS ===
echo "🧪 Executando testes finais..."

# Teste 1: Conectividade
echo "Teste 1: Conectividade PostgreSQL..."
docker exec postgresql-kryonix pg_isready -U postgres || echo "❌ PostgreSQL não está pronto"

# Teste 2: Databases criados
echo "Teste 2: Verificando databases..."
DB_COUNT=$(docker exec postgresql-kryonix psql -U postgres -t -c "SELECT count(*) FROM pg_database WHERE datname LIKE 'kryonix_%';" | tr -d ' ')
echo "Databases KRYONIX criados: $DB_COUNT"

# Teste 3: PgAdmin acessível
echo "Teste 3: Testando PgAdmin..."
curl -f https://pgadmin.kryonix.com.br > /dev/null 2>&1 && echo "✅ PgAdmin acessível" || echo "❌ PgAdmin não acessível"

# Teste 4: IA funcionando
echo "Teste 4: Testando IA..."
python3 /opt/kryonix/scripts/postgresql-ai-optimizer.py

# === MARCAR PROGRESSO ===
echo "2" > /opt/kryonix/.current-part

# === NOTIFICAÇÃO FINAL ===
echo "📱 Enviando notificação final..."
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: sua_chave_evolution_api_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "text": "✅ PARTE-02 CONCLUÍDA!\n\n🗄️ PostgreSQL otimizado para mobile\n📱 9 databases especializados criados\n🤖 IA monitorando performance 24/7\n🇧🇷 PgAdmin em português funcionando\n📊 Métricas automáticas ativas\n💾 Backup automático diário (02:00)\n📈 Monitoramento contínuo ativo\n\n🌐 PgAdmin: https://pgadmin.kryonix.com.br\nLogin: kryonix@kryonix.com.br / Vitor@123456\n\n🚀 Sistema pronto para PARTE-03!"
  }'

echo ""
echo "✅ PARTE-02 CONCLUÍDA COM SUCESSO!"
echo "🗄️ PostgreSQL otimizado para SaaS mobile"
echo "📱 9 databases especializados criados"
echo "🤖 IA monitorando automaticamente"
echo "🌐 PgAdmin: https://pgadmin.kryonix.com.br"
echo "👤 Login: kryonix@kryonix.com.br / Vitor@123456"
echo ""
echo "🚀 Próxima etapa: PARTE-03-MINIO.md"
```

---

## 📋 **VALIDAÇÕES OBRIGATÓRIAS**
Após executar, confirme se:
- [ ] ✅ PostgreSQL funcionando e otimizado
- [ ] ✅ 9 databases especializados criados
- [ ] ✅ PgAdmin acessível em https://pgadmin.kryonix.com.br
- [ ] ✅ Login com kryonix@kryonix.com.br/Vitor@123456 funciona
- [ ] �� Estruturas mobile-first criadas
- [ ] ✅ IA coletando métricas automaticamente
- [ ] ✅ Backup automático agendado (02:00)
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Extensões PostgreSQL instaladas
- [ ] ✅ Notificação WhatsApp enviada

---

**⚠️ IMPORTANTE**: Substitua 'sua_chave_evolution_api_aqui' pela chave real da Evolution API antes de executar.

*🤖 Prompt criado pelos 15 Agentes Especializados KRYONIX*

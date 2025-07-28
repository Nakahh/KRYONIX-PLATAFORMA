# 🗄️ PARTE-02: BASE DE DADOS POSTGRESQL - TUTORIAL COMPLETO
*Configuração PostgreSQL Mobile-First com IA 100% Autônoma*

---

## 🎯 **OBJETIVO DA PARTE 02**
Configurar PostgreSQL otimizado para SaaS mobile-first com IA autônoma:
- 📱 **Queries otimizadas** para mobile (80% usuários)
- 🤖 **IA gerenciando** performance e backup
- 🇧��� **Interface PgAdmin** em português
- 📊 **Métricas reais** de performance
- 💬 **Notificações WhatsApp** de status
- 🔧 **Backup automático** inteligente

---

## 👥 **AGENTES ESPECIALIZADOS RESPONSÁVEIS**
- 🗄️ **Arquiteto de Dados** (Líder)
- 🏗️ **Arquiteto Software Sênior**
- 📱 **Especialista Mobile**
- 🤖 **Especialista IA**
- ⚡ **Expert Performance**

---

## 🛠️ **CONFIGURAÇÕES NO SERVIDOR (VIA PORTAINER)**

### **1. Otimizar PostgreSQL para Mobile SaaS**

#### **1.1 Acessar Stack PostgreSQL no Portainer**
```bash
# Portainer > Stacks > postgresql-kryonix > Edit
```

#### **1.2 Configurar Environment Variables Otimizadas**
```yaml
# Configurações otimizadas para SaaS mobile:
POSTGRES_DB: kryonix_saas
POSTGRES_USER: postgres
POSTGRES_PASSWORD: [sua_senha_segura]
POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --locale=pt_BR.UTF-8"

# Performance para mobile:
POSTGRES_SHARED_BUFFERS: "512MB"
POSTGRES_EFFECTIVE_CACHE_SIZE: "2GB"
POSTGRES_WORK_MEM: "16MB"
POSTGRES_MAINTENANCE_WORK_MEM: "256MB"
POSTGRES_MAX_CONNECTIONS: "200"
POSTGRES_CHECKPOINT_COMPLETION_TARGET: "0.9"
POSTGRES_WAL_BUFFERS: "16MB"
POSTGRES_DEFAULT_STATISTICS_TARGET: "100"
```

#### **1.3 Configurar Volume Persistente**
```yaml
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/kryonix/data/postgresql
```

---

## 🚀 **CRIAÇÃO DE DATABASES ESPECIALIZADOS**

### **2. Databases por Módulo SaaS**

#### **2.1 Acessar PostgreSQL Console**
```bash
# No Portainer: Containers > postgresql-kryonix > Console
docker exec -it postgresql-kryonix psql -U postgres
```

#### **2.2 Criar Databases Específicos**
```sql
-- Database principal da plataforma
CREATE DATABASE kryonix_platform
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'pt_BR.UTF-8'
  LC_CTYPE = 'pt_BR.UTF-8'
  TEMPLATE = template0;

-- Database para Analytics e BI (Módulo 1)
CREATE DATABASE kryonix_analytics
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'pt_BR.UTF-8'
  LC_CTYPE = 'pt_BR.UTF-8'
  TEMPLATE = template0;

-- Database para Agendamento (Módulo 2)
CREATE DATABASE kryonix_scheduling
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'pt_BR.UTF-8'
  LC_CTYPE = 'pt_BR.UTF-8'
  TEMPLATE = template0;

-- Database para Atendimento (Módulo 3)
CREATE DATABASE kryonix_support
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'pt_BR.UTF-8'
  LC_CTYPE = 'pt_BR.UTF-8'
  TEMPLATE = template0;

-- Database para CRM (Módulo 4)
CREATE DATABASE kryonix_crm
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'pt_BR.UTF-8'
  LC_CTYPE = 'pt_BR.UTF-8'
  TEMPLATE = template0;

-- Database para Marketing (Módulo 5)
CREATE DATABASE kryonix_marketing
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'pt_BR.UTF-8'
  LC_CTYPE = 'pt_BR.UTF-8'
  TEMPLATE = template0;

-- Database para Social Media (Módulo 6)
CREATE DATABASE kryonix_social
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'pt_BR.UTF-8'
  LC_CTYPE = 'pt_BR.UTF-8'
  TEMPLATE = template0;

-- Database para Portal Cliente (Módulo 7)
CREATE DATABASE kryonix_portal
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'pt_BR.UTF-8'
  LC_CTYPE = 'pt_BR.UTF-8'
  TEMPLATE = template0;

-- Database para Whitelabel (Módulo 8)
CREATE DATABASE kryonix_whitelabel
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'pt_BR.UTF-8'
  LC_CTYPE = 'pt_BR.UTF-8'
  TEMPLATE = template0;

-- Verificar criação
\l
```

#### **2.3 Criar Usuários Específicos por Módulo**
```sql
-- Usuário para Analytics
CREATE USER analytics_user WITH PASSWORD 'analytics_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE kryonix_analytics TO analytics_user;

-- Usuário para Agendamento
CREATE USER scheduling_user WITH PASSWORD 'scheduling_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE kryonix_scheduling TO scheduling_user;

-- Usuário para Atendimento
CREATE USER support_user WITH PASSWORD 'support_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE kryonix_support TO support_user;

-- Usuário para CRM
CREATE USER crm_user WITH PASSWORD 'crm_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE kryonix_crm TO crm_user;

-- Usuário para Marketing
CREATE USER marketing_user WITH PASSWORD 'marketing_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE kryonix_marketing TO marketing_user;

-- Usuário para Social Media
CREATE USER social_user WITH PASSWORD 'social_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE kryonix_social TO social_user;

-- Usuário para Portal
CREATE USER portal_user WITH PASSWORD 'portal_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE kryonix_portal TO portal_user;

-- Usuário para Whitelabel
CREATE USER whitelabel_user WITH PASSWORD 'whitelabel_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE kryonix_whitelabel TO whitelabel_user;

-- Usuário para IA (acesso total)
CREATE USER ai_user WITH PASSWORD 'ai_kryonix_2025' SUPERUSER;
```

---

## 📱 **ESTRUTURA MOBILE-FIRST**

### **3. Schemas Otimizados para Mobile**

#### **3.1 Schema Base do Platform**
```sql
-- Conectar ao database principal
\c kryonix_platform;

-- Schema para usuários mobile
CREATE SCHEMA IF NOT EXISTS mobile_users;

-- Tabela de usuários otimizada mobile
CREATE TABLE mobile_users.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    preferred_language VARCHAR(5) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    mobile_device_info JSONB,
    push_token TEXT,
    last_login_mobile TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(20) DEFAULT 'active',
    subscription_plan VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_mobile_verified BOOLEAN DEFAULT FALSE,
    mobile_preferences JSONB DEFAULT '{}'::jsonb
);

-- Índices otimizados para mobile
CREATE INDEX idx_users_phone ON mobile_users.users(phone_number);
CREATE INDEX idx_users_email ON mobile_users.users(email);
CREATE INDEX idx_users_last_login ON mobile_users.users(last_login_mobile);
CREATE INDEX idx_users_status ON mobile_users.users(account_status);
CREATE INDEX idx_users_mobile_device ON mobile_users.users USING GIN(mobile_device_info);

-- Tabela de sessões mobile
CREATE TABLE mobile_users.mobile_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES mobile_users.users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    location_data JSONB,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para sessões
CREATE INDEX idx_sessions_user_id ON mobile_users.mobile_sessions(user_id);
CREATE INDEX idx_sessions_token ON mobile_users.mobile_sessions(session_token);
CREATE INDEX idx_sessions_device ON mobile_users.mobile_sessions(device_id);
```

#### **3.2 Schema para Notificações Mobile**
```sql
-- Schema para push notifications
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
    priority VARCHAR(10) DEFAULT 'normal',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending',
    platform VARCHAR(10), -- 'android', 'ios', 'web'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para notificações
CREATE INDEX idx_notifications_user ON mobile_notifications.push_notifications(user_id);
CREATE INDEX idx_notifications_status ON mobile_notifications.push_notifications(status);
CREATE INDEX idx_notifications_sent_at ON mobile_notifications.push_notifications(sent_at);
```

---

## 🤖 **INTEGRAÇÃO COM IA**

### **4. Configurar IA para Gerenciamento Automático**

#### **4.1 Schema para IA Analytics**
```sql
-- Schema para IA monitorar banco
CREATE SCHEMA IF NOT EXISTS ai_monitoring;

-- Tabela de métricas coletadas pela IA
CREATE TABLE ai_monitoring.db_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL,
    metric_data JSONB,
    database_name VARCHAR(100),
    table_name VARCHAR(100),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_analysis JSONB,
    recommendations TEXT[]
);

-- Tabela de ações da IA
CREATE TABLE ai_monitoring.ai_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    sql_executed TEXT,
    parameters JSONB,
    execution_result JSONB,
    success BOOLEAN,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_time_ms INTEGER
);

-- Função para IA coletar métricas
CREATE OR REPLACE FUNCTION ai_monitoring.collect_mobile_metrics()
RETURNS TABLE(
    total_mobile_users BIGINT,
    active_sessions BIGINT,
    avg_response_time DECIMAL,
    slow_queries BIGINT,
    db_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM mobile_users.users WHERE account_status = 'active'),
        (SELECT COUNT(*) FROM mobile_users.mobile_sessions WHERE is_active = TRUE),
        (SELECT AVG(EXTRACT(EPOCH FROM (NOW() - last_activity))) FROM mobile_users.mobile_sessions WHERE is_active = TRUE),
        (SELECT COUNT(*) FROM pg_stat_statements WHERE mean_exec_time > 1000),
        pg_size_pretty(pg_database_size(current_database()));
END;
$$ LANGUAGE plpgsql;
```

#### **4.2 Configurar Usuário para Dify AI**
```sql
-- Dar permissões para IA Dify acessar métricas
GRANT USAGE ON SCHEMA ai_monitoring TO ai_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA ai_monitoring TO ai_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA ai_monitoring TO ai_user;

-- Permissões de leitura nos schemas principais
GRANT USAGE ON SCHEMA mobile_users TO ai_user;
GRANT SELECT ON ALL TABLES IN SCHEMA mobile_users TO ai_user;
GRANT USAGE ON SCHEMA mobile_notifications TO ai_user;
GRANT SELECT ON ALL TABLES IN SCHEMA mobile_notifications TO ai_user;
```

---

## 📊 **CONFIGURAÇÃO PGADMIN PORTUGUÊS**

### **5. Deploy PgAdmin Mobile-Friendly**

#### **5.1 Configurar PgAdmin no Portainer**
```yaml
# Adicionar ao stack postgresql-kryonix:
pgadmin:
  image: dpage/pgadmin4:latest
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@kryonix.com.br
    PGADMIN_DEFAULT_PASSWORD: [senha_pgadmin]
    PGADMIN_CONFIG_DEFAULT_LANGUAGE: "'pt_BR'"
    PGADMIN_CONFIG_CONSOLE_LOG_LEVEL: 20
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.pgadmin.rule=Host(`pgadmin.kryonix.com.br`)"
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
```

#### **5.2 Configurar Servers no PgAdmin**
```json
// servers.json para auto-configuração
{
  "Servers": {
    "1": {
      "Name": "KRYONIX PostgreSQL",
      "Group": "KRYONIX Servers",
      "Host": "postgresql-kryonix",
      "Port": 5432,
      "MaintenanceDB": "kryonix_platform",
      "Username": "postgres",
      "PassFile": "/pgpass",
      "SSLMode": "prefer",
      "SSLCert": "<STORAGE_DIR>/.postgresql/postgresql.crt",
      "SSLKey": "<STORAGE_DIR>/.postgresql/postgresql.key",
      "SSLCompression": 0,
      "Timeout": 10,
      "UseSSHTunnel": 0,
      "TunnelPort": "22",
      "TunnelAuthentication": 0
    }
  }
}
```

---

## 🔄 **BACKUP AUTOMÁTICO COM IA**

### **6. Sistema de Backup Inteligente**

#### **6.1 Script de Backup Automático**
```bash
# Criar volume para scripts no Portainer
# /opt/kryonix/scripts/backup-postgresql.sh

#!/bin/bash
# Backup automático PostgreSQL com IA

BACKUP_DIR="/opt/kryonix/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DATABASES=("kryonix_platform" "kryonix_analytics" "kryonix_scheduling" "kryonix_support" "kryonix_crm" "kryonix_marketing" "kryonix_social" "kryonix_portal" "kryonix_whitelabel")

echo "🔄 Iniciando backup automático PostgreSQL..."

# Criar diretório de backup
mkdir -p $BACKUP_DIR/$DATE

# Backup de cada database
for db in "${DATABASES[@]}"; do
    echo "📦 Fazendo backup de $db..."
    docker exec postgresql-kryonix pg_dump -U postgres -d $db > $BACKUP_DIR/$DATE/${db}_backup.sql
    
    # Comprimir backup
    gzip $BACKUP_DIR/$DATE/${db}_backup.sql
    
    echo "✅ Backup de $db concluído"
done

# Backup global (roles, tablespaces, etc.)
echo "🌐 Fazendo backup global..."
docker exec postgresql-kryonix pg_dumpall -U postgres -g > $BACKUP_DIR/$DATE/global_backup.sql
gzip $BACKUP_DIR/$DATE/global_backup.sql

# Limpar backups antigos (manter 7 dias)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

# Enviar notificação WhatsApp
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: [seu_token]" \
  -H "Content-Type: application/json" \
  -d "{
    \"number\": \"5517981805327\",
    \"text\": \"🔄 Backup PostgreSQL concluído!\\n\\n📅 Data: $DATE\\n📊 Databases: 9\\n💾 Tamanho: $(du -sh $BACKUP_DIR/$DATE | cut -f1)\\n📱 Status: Sucesso\"
  }"

echo "✅ Backup automático concluído com sucesso!"
```

#### **6.2 Configurar Cron para Backup**
```bash
# No servidor, agendar backup diário às 02:00
# crontab -e
0 2 * * * /opt/kryonix/scripts/backup-postgresql.sh >> /var/log/kryonix-backup.log 2>&1
```

---

## 📊 **MONITORAMENTO E ALERTAS**

### **7. Métricas PostgreSQL no Grafana**

#### **7.1 Configurar pg_stat_statements**
```sql
-- Ativar extensão para estatísticas
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Configurar coleta de métricas
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_statements.max = 10000;

-- Reiniciar PostgreSQL (via Portainer)
```

#### **7.2 Dashboard Grafana**
```bash
# Acessar Grafana: https://grafana.kryonix.com.br
# Import Dashboard ID: 9628 (PostgreSQL Overview)
# Configurar data source PostgreSQL
```

#### **7.3 Alertas WhatsApp**
```yaml
# Configurar alertas para:
- Conexões > 150 (75% do limite)
- Queries lentas > 5 segundos
- Disk usage > 80%
- Backup falhou
- Deadlocks detectados
- Performance degradada
```

---

## 🧪 **TESTES E VALIDAÇÃO**

### **8. Checklist de Testes**

#### **8.1 Testes de Performance Mobile**
```sql
-- Teste de conexões simultâneas mobile
SELECT count(*) as conexoes_ativas 
FROM pg_stat_activity 
WHERE state = 'active' 
AND application_name LIKE '%mobile%';

-- Teste de queries mais lentas
SELECT query, mean_exec_time, calls, total_exec_time
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Teste de tamanho dos databases
SELECT 
    datname as database,
    pg_size_pretty(pg_database_size(datname)) as tamanho
FROM pg_database 
WHERE datname LIKE 'kryonix_%'
ORDER BY pg_database_size(datname) DESC;
```

#### **8.2 Testes de Backup**
```bash
# Testar restore de backup
docker exec postgresql-kryonix createdb -U postgres kryonix_test
gunzip -c /opt/kryonix/backups/postgresql/latest/kryonix_platform_backup.sql.gz | docker exec -i postgresql-kryonix psql -U postgres -d kryonix_test
```

#### **8.3 Testes de IA**
```sql
-- Testar função de métricas da IA
SELECT * FROM ai_monitoring.collect_mobile_metrics();

-- Verificar se IA está coletando dados
SELECT COUNT(*) FROM ai_monitoring.db_metrics WHERE collected_at > NOW() - INTERVAL '1 hour';
```

---

## 🚀 **FINALIZAÇÃO E NOTIFICAÇÃO**

### **9. Deploy Final**

#### **9.1 Restart Final do PostgreSQL**
```bash
# No Portainer: Containers > postgresql-kryonix > Restart
# Aguardar containers ficarem healthy
```

#### **9.2 Verificar Health Checks**
```bash
# Testar conectividade
docker exec postgresql-kryonix pg_isready -U postgres

# Testar PgAdmin
curl -f https://pgadmin.kryonix.com.br

# Testar todas as databases
docker exec postgresql-kryonix psql -U postgres -l
```

#### **9.3 Notificação de Conclusão**
```bash
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: [seu_token]" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "text": "✅ PARTE-02 CONCLUÍDA!\n\n🗄️ PostgreSQL otimizado\n📱 9 databases mobile-ready\n🤖 IA monitorando performance\n🇧🇷 PgAdmin em português\n📊 Métricas ativas no Grafana\n🔄 Backup automático funcionando\n\n🚀 Sistema pronto para PARTE-03!"
  }'
```

---

## 📋 **SITUAÇÃO APÓS PARTE-02**

### **✅ O QUE FOI CONFIGURADO:**
- 🗄️ PostgreSQL otimizado para SaaS mobile
- 📱 9 databases especializados criados
- 🤖 IA monitorando performance automaticamente
- 🇧🇷 PgAdmin configurado em português
- 📊 Métricas ativas no Grafana
- 🔄 Backup automático diário
- 💬 Notificações WhatsApp de status

### **✅ PRÓXIMAS ETAPAS:**
- **PARTE-03**: Configurar MinIO para storage
- **PARTE-04**: Configurar Redis para cache
- **PARTE-05**: Otimizar Traefik proxy

---

## 🤖 **PROMPT PARA IA EXECUTAR NO VSCODE**

```prompt
Execute a PARTE-02 do projeto KRYONIX - Configuração PostgreSQL otimizada para SaaS mobile-first:

CONTEXTO:
- PostgreSQL rodando em postgresql-kryonix
- PgAdmin será configurado em pgadmin.kryonix.com.br
- Foco: Mobile-first (80% usuários)
- Interface: 100% português
- IA: gerenciamento autônomo

TAREFAS OBRIGATÓRIAS:
1. Otimizar configurações PostgreSQL para mobile
2. Criar 9 databases especializados por módulo SaaS
3. Configurar schemas mobile-first otimizados
4. Integrar IA para monitoramento automático
5. Configurar PgAdmin em português
6. Implementar backup automático inteligente
7. Configurar métricas no Grafana
8. Testar performance e conectividade
9. Enviar notificação WhatsApp de conclusão

VALIDAÇÕES:
- 9 databases criados ✅
- IA coletando métricas ✅
- Backup automático funcionando ✅
- PgAdmin acessível em português ✅
- Performance otimizada mobile ✅

Execute e reporte status detalhado.
```

---

*📅 Tutorial criado para execução na PARTE-02*  
*🏢 KRYONIX - Plataforma SaaS 100% Autônoma*  
*👨‍💼 Cliente: Vitor Fernandes*  
*🤖 Assistido por: 15 Agentes Especializados KRYONIX*

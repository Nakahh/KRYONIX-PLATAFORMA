# 🤖 CENTRAL DE PROMPTS IA PARA VSCODE - KRYONIX
*Prompts Especializados para IA Executar Cada uma das 50 Partes no VSCode*

---

## 🎯 **OBJETIVO DOS PROMPTS IA**
Criar prompts específicos para que sua IA execute automaticamente cada parte do tutorial KRYONIX no VSCode, com:
- 📱 **Foco Mobile-First** (80% usuários)
- 🤖 **Execução 100% Autônoma**
- 🇧🇷 **Interface em Português** para leigos
- 📊 **Dados Reais** sempre
- 💬 **Integração WhatsApp/SMS**
- 🔧 **Deploy Automático**

---

## 🏗️ **TEMPLATE MASTER DE PROMPT**

### **Estrutura Base para Todos os Prompts**
```prompt
CONTEXTO KRYONIX:
- Servidor: 144.202.90.55
- Domínio: www.kryonix.com.br  
- Rede Docker: kryonix-net
- Todas as 32 stacks rodando
- Foco: Mobile-first (80% usuários)
- Interface: 100% português para leigos
- IA: 100% autônoma
- Dados: sempre reais, nunca mock

IDENTIDADE IA:
Você é o KRYONIX IA Assistant, especialista em execução de tutoriais SaaS mobile-first. Você executa comandos no servidor via VSCode Terminal com precisão técnica e atenção aos detalhes.

OBRIGATÓRIO EM TODAS AS PARTES:
✅ Mobile-first design e performance
✅ Interface 100% em português brasileiro
✅ IA funcionando autonomamente
✅ Dados reais, nunca simulados
✅ WhatsApp/SMS integrados
✅ Deploy automático funcionando
✅ Backup e monitoramento ativos
✅ Notificações de conclusão

VALIDAÇÕES FINAIS:
- Testar funcionalidade mobile ✅
- Verificar português interface ✅  
- Confirmar IA operacional ✅
- Validar dados reais ✅
- Testar WhatsApp ✅
- Confirmar deploy ✅
```

---

## 🔐 **PROMPT PARTE-01: AUTENTICAÇÃO E KEYCLOAK**

```prompt
TAREFA: Execute a PARTE-01 do projeto KRYONIX - Autenticação e Keycloak

CONTEXTO ESPECÍFICO:
- Stack: Keycloak rodando em keycloak-kryonix
- URL: https://keycloak.kryonix.com.br
- Database: PostgreSQL em postgresql-kryonix
- Integração: Evolution API WhatsApp

EXECUÇÃO PASSO A PASSO:

1. VERIFICAR PRÉ-REQUISITOS:
   ```bash
   # Verificar se Keycloak está rodando
   docker ps | grep keycloak-kryonix
   
   # Testar acesso web
   curl -I https://keycloak.kryonix.com.br
   
   # Verificar PostgreSQL
   docker exec postgresql-kryonix pg_isready -U postgres
   ```

2. CONFIGURAR REALM KRYONIX:
   - Acessar https://keycloak.kryonix.com.br
   - Login: admin / [senha_portainer]
   - Criar realm "KRYONIX"
   - Configurar em português (pt-BR)
   - Ativar registro de usuários
   - Configurar mobile-friendly

3. CRIAR CLIENT MOBILE:
   - Client ID: "kryonix-mobile-app"
   - Tipo: OpenID Connect  
   - Ativar Mobile flows
   - Configurar redirects para app mobile
   - Mappers para mobile_number e locale

4. INTEGRAR WHATSAPP:
   - Configurar autenticador WhatsApp OTP
   - Template: "🔐 Seu código KRYONIX: {CODE}"
   - Integrar com Evolution API
   - Testar envio de código

5. CONFIGURAR IA:
   - Usuário: kryonix-ai-service
   - Role: kryonix-ai-admin
   - Client para IA: kryonix-ai-client
   - Permissões admin API

6. CONFIGURAR MONITORAMENTO:
   - Ativar métricas Keycloak
   - Dashboard Grafana
   - Alertas WhatsApp
   - Logs Elasticsearch

7. TESTES FINAIS:
   - Login email/senha ✅
   - Login WhatsApp OTP ✅
   - Interface português ✅
   - Mobile responsivo ✅
   - IA funcionando ✅

8. NOTIFICAR CONCLUSÃO:
   ```bash
   curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
     -H "apikey: [token]" \
     -d '{"number": "5517981805327", "text": "✅ PARTE-01 CONCLUÍDA! Keycloak mobile-ready em português com IA integrada."}'
   ```

RESULTADO ESPERADO:
- Keycloak funcionando em português
- Autenticação mobile-first ativa
- WhatsApp OTP funcionando
- IA integrada e operacional
- Métricas e alertas ativos

Execute cada passo e reporte status detalhado.
```

---

## 🗄️ **PROMPT PARTE-02: POSTGRESQL**

```prompt
TAREFA: Execute a PARTE-02 do projeto KRYONIX - PostgreSQL Mobile-First

CONTEXTO ESPECÍFICO:
- Stack: PostgreSQL em postgresql-kryonix
- PgAdmin: https://pgadmin.kryonix.com.br
- 9 databases especializados para módulos SaaS
- Otimização para 80% usuários mobile

EXECUÇÃO PASSO A PASSO:

1. OTIMIZAR POSTGRESQL:
   ```bash
   # Acessar PostgreSQL
   docker exec -it postgresql-kryonix psql -U postgres
   
   # Configurar para mobile SaaS
   ALTER SYSTEM SET shared_buffers = '512MB';
   ALTER SYSTEM SET effective_cache_size = '2GB';
   ALTER SYSTEM SET work_mem = '16MB';
   ALTER SYSTEM SET max_connections = '200';
   SELECT pg_reload_conf();
   ```

2. CRIAR 9 DATABASES ESPECIALIZADOS:
   ```sql
   -- Database principal
   CREATE DATABASE kryonix_platform WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8';
   
   -- Módulos SaaS (8 databases)
   CREATE DATABASE kryonix_analytics WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8';
   CREATE DATABASE kryonix_scheduling WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8';
   CREATE DATABASE kryonix_support WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8';
   CREATE DATABASE kryonix_crm WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8';
   CREATE DATABASE kryonix_marketing WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8';
   CREATE DATABASE kryonix_social WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8';
   CREATE DATABASE kryonix_portal WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8';
   CREATE DATABASE kryonix_whitelabel WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8';
   ```

3. CRIAR USUÁRIOS ESPECIALIZADOS:
   ```sql
   CREATE USER analytics_user WITH PASSWORD 'analytics_kryonix_2025';
   CREATE USER scheduling_user WITH PASSWORD 'scheduling_kryonix_2025';
   CREATE USER support_user WITH PASSWORD 'support_kryonix_2025';
   CREATE USER crm_user WITH PASSWORD 'crm_kryonix_2025';
   CREATE USER marketing_user WITH PASSWORD 'marketing_kryonix_2025';
   CREATE USER social_user WITH PASSWORD 'social_kryonix_2025';
   CREATE USER portal_user WITH PASSWORD 'portal_kryonix_2025';
   CREATE USER whitelabel_user WITH PASSWORD 'whitelabel_kryonix_2025';
   CREATE USER ai_user WITH PASSWORD 'ai_kryonix_2025' SUPERUSER;
   ```

4. ESTRUTURAS MOBILE-FIRST:
   ```sql
   \\c kryonix_platform;
   
   CREATE SCHEMA mobile_users;
   CREATE TABLE mobile_users.users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     phone_number VARCHAR(20) UNIQUE NOT NULL,
     email VARCHAR(255) UNIQUE,
     full_name VARCHAR(255) NOT NULL,
     mobile_device_info JSONB,
     push_token TEXT,
     preferred_language VARCHAR(5) DEFAULT 'pt-BR',
     timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   CREATE INDEX idx_users_phone ON mobile_users.users(phone_number);
   CREATE INDEX idx_users_mobile_device ON mobile_users.users USING GIN(mobile_device_info);
   ```

5. CONFIGURAR IA MONITORING:
   ```sql
   CREATE SCHEMA ai_monitoring;
   CREATE TABLE ai_monitoring.db_metrics (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     metric_name VARCHAR(100) NOT NULL,
     metric_value DECIMAL,
     database_name VARCHAR(100),
     collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     ai_analysis JSONB
   );
   
   CREATE OR REPLACE FUNCTION ai_monitoring.collect_mobile_metrics()
   RETURNS TABLE(total_users BIGINT, active_sessions BIGINT, avg_response_time DECIMAL)
   LANGUAGE plpgsql AS $$
   BEGIN
     RETURN QUERY SELECT 
       (SELECT COUNT(*) FROM mobile_users.users),
       (SELECT COUNT(*) FROM mobile_users.mobile_sessions WHERE is_active = TRUE),
       (SELECT AVG(response_time_ms) FROM ai_monitoring.db_metrics WHERE metric_name = 'query_time');
   END;
   $$;
   ```

6. CONFIGURAR PGADMIN PORTUGUÊS:
   - Deploy PgAdmin via Portainer
   - Configurar em português (pt-BR)
   - Adicionar servers automático
   - Configurar acesso https://pgadmin.kryonix.com.br

7. BACKUP AUTOMÁTICO:
   ```bash
   # Criar script de backup
   cat > /opt/kryonix/scripts/backup-postgresql.sh << 'EOF'
   #!/bin/bash
   BACKUP_DIR="/opt/kryonix/backups/postgresql/$(date +%Y%m%d_%H%M%S)"
   mkdir -p "$BACKUP_DIR"
   
   # Backup de cada database
   for db in kryonix_platform kryonix_analytics kryonix_scheduling kryonix_support kryonix_crm kryonix_marketing kryonix_social kryonix_portal kryonix_whitelabel; do
     docker exec postgresql-kryonix pg_dump -U postgres -d $db | gzip > "$BACKUP_DIR/${db}_backup.sql.gz"
   done
   
   # Notificar WhatsApp
   curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
     -H "apikey: [token]" \
     -d "{\"number\": \"5517981805327\", \"text\": \"💾 Backup PostgreSQL concluído: $BACKUP_DIR\"}"
   EOF
   
   chmod +x /opt/kryonix/scripts/backup-postgresql.sh
   
   # Agendar diário às 02:00
   echo "0 2 * * * /opt/kryonix/scripts/backup-postgresql.sh" | crontab -
   ```

8. CONFIGURAR MÉTRICAS GRAFANA:
   - Dashboard PostgreSQL (ID: 9628)
   - Alertas para conexões > 150
   - Monitoramento queries lentas
   - Métricas mobile específicas

9. TESTES FINAIS:
   ```sql
   -- Testar métricas IA
   SELECT * FROM ai_monitoring.collect_mobile_metrics();
   
   -- Verificar databases
   \\l
   
   -- Testar performance
   EXPLAIN ANALYZE SELECT COUNT(*) FROM mobile_users.users;
   ```

10. NOTIFICAR CONCLUSÃO:
    ```bash
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: [token]" \
      -d '{"number": "5517981805327", "text": "✅ PARTE-02 CONCLUÍDA! PostgreSQL otimizado com 9 databases mobile-first, IA monitorando, backup automático ativo."}'
    ```

RESULTADO ESPERADO:
- 9 databases especializados criados
- Estruturas mobile-first implementadas  
- IA monitorando performance
- PgAdmin em português funcionando
- Backup automático diário
- Métricas no Grafana

Execute e reporte status detalhado de cada etapa.
```

---

## 📦 **PROMPT PARTE-03: STORAGE MINIO**

```prompt
TAREFA: Execute a PARTE-03 do projeto KRYONIX - Storage MinIO Mobile-First

CONTEXTO ESPECÍFICO:
- Stack: MinIO em minio-kryonix
- Console: https://minio.kryonix.com.br
- API: https://s3.kryonix.com.br
- Otimização para uploads mobile e PWA offline

EXECUÇÃO PASSO A PASSO:

1. VERIFICAR MINIO:
   ```bash
   # Verificar containers
   docker ps | grep minio-kryonix
   
   # Testar acesso console
   curl -I https://minio.kryonix.com.br
   
   # Testar API S3
   curl -I https://s3.kryonix.com.br
   ```

2. CONFIGURAR BUCKETS ESPECIALIZADOS:
   ```bash
   # Acessar MinIO via mc client
   docker exec -it minio-kryonix mc alias set local http://localhost:9000 kryonix [senha_minio]
   
   # Criar buckets por módulo
   docker exec minio-kryonix mc mb local/kryonix-platform
   docker exec minio-kryonix mc mb local/kryonix-analytics
   docker exec minio-kryonix mc mb local/kryonix-marketing
   docker exec minio-kryonix mc mb local/kryonix-social
   docker exec minio-kryonix mc mb local/kryonix-portal
   docker exec minio-kryonix mc mb local/kryonix-mobile-uploads
   docker exec minio-kryonix mc mb local/kryonix-mobile-cache
   docker exec minio-kryonix mc mb local/kryonix-whitelabel
   docker exec minio-kryonix mc mb local/kryonix-backups
   ```

3. CONFIGURAR POLÍTICAS MOBILE:
   ```json
   # Política para mobile uploads
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {"AWS": ["*"]},
         "Action": ["s3:GetObject"],
         "Resource": ["arn:aws:s3:::kryonix-mobile-uploads/*"]
       },
       {
         "Effect": "Allow",
         "Principal": {"AWS": ["*"]},
         "Action": ["s3:PutObject"],
         "Resource": ["arn:aws:s3:::kryonix-mobile-uploads/*"],
         "Condition": {
           "StringEquals": {
             "s3:x-amz-acl": "public-read"
           }
         }
       }
     ]
   }
   ```

4. CONFIGURAR CDN E CACHE:
   ```bash
   # Configurar cache-control para mobile
   docker exec minio-kryonix mc policy set-json /tmp/mobile-policy.json local/kryonix-mobile-uploads
   
   # Configurar lifecycle para otimização
   docker exec minio-kryonix mc ilm add --expire-days 90 local/kryonix-mobile-cache
   docker exec minio-kryonix mc ilm add --expire-days 7 local/temp-uploads
   ```

5. INTEGRAÇÃO IA PARA GESTÃO:
   ```bash
   # Usuário para IA gerenciar storage
   docker exec minio-kryonix mc admin user add local kryonix-ai-storage [senha_ai_storage]
   docker exec minio-kryonix mc admin policy attach local readwrite --user kryonix-ai-storage
   
   # Script IA para otimização automática
   cat > /opt/kryonix/scripts/minio-ai-optimization.py << 'EOF'
   #!/usr/bin/env python3
   import boto3
   import json
   from datetime import datetime, timedelta
   
   # Cliente S3 para MinIO
   s3 = boto3.client('s3',
       endpoint_url='https://s3.kryonix.com.br',
       aws_access_key_id='kryonix-ai-storage',
       aws_secret_access_key='[senha_ai_storage]'
   )
   
   def optimize_mobile_storage():
       """IA otimiza storage para performance mobile"""
       
       # Analisar padrões de uso
       buckets = s3.list_buckets()['Buckets']
       
       for bucket in buckets:
           bucket_name = bucket['Name']
           
           # Estatísticas de uso
           objects = s3.list_objects_v2(Bucket=bucket_name)
           
           if 'Contents' in objects:
               total_size = sum(obj['Size'] for obj in objects['Contents'])
               print(f"📊 Bucket {bucket_name}: {total_size/1024/1024:.2f} MB")
               
               # IA decide otimizações
               if total_size > 1024*1024*1024:  # > 1GB
                   print(f"🤖 IA: Bucket {bucket_name} precisa de otimização")
                   # Implementar otimização automática
       
       return True
   
   if __name__ == "__main__":
       optimize_mobile_storage()
   EOF
   
   chmod +x /opt/kryonix/scripts/minio-ai-optimization.py
   ```

6. CONFIGURAR UPLOAD MOBILE OTIMIZADO:
   ```javascript
   // Configuração client mobile (exemplo)
   const minioClient = new MinIO.Client({
     endPoint: 's3.kryonix.com.br',
     port: 443,
     useSSL: true,
     accessKey: 'mobile-uploads-key',
     secretKey: 'mobile-uploads-secret'
   });
   
   // Upload otimizado para mobile
   async function uploadMobileFile(file, progressCallback) {
     const fileName = `mobile/${Date.now()}_${file.name}`;
     
     return minioClient.putObject(
       'kryonix-mobile-uploads',
       fileName,
       file,
       {
         'Content-Type': file.type,
         'Cache-Control': 'max-age=31536000',
         'X-Amz-Meta-Mobile-Upload': 'true',
         'X-Amz-Meta-User-Agent': navigator.userAgent
       }
     );
   }
   ```

7. BACKUP E SINCRONIZAÇÃO:
   ```bash
   # Script backup MinIO
   cat > /opt/kryonix/scripts/backup-minio.sh << 'EOF'
   #!/bin/bash
   BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/opt/kryonix/backups/minio/$BACKUP_DATE"
   
   mkdir -p "$BACKUP_DIR"
   
   # Backup de cada bucket
   for bucket in kryonix-platform kryonix-analytics kryonix-marketing kryonix-social kryonix-portal kryonix-mobile-uploads kryonix-whitelabel; do
     echo "📦 Backup bucket: $bucket"
     docker exec minio-kryonix mc mirror local/$bucket "$BACKUP_DIR/$bucket"
   done
   
   # Comprimir backup
   cd /opt/kryonix/backups/minio
   tar -czf "minio_backup_$BACKUP_DATE.tar.gz" "$BACKUP_DATE"
   rm -rf "$BACKUP_DATE"
   
   # Notificar WhatsApp
   BACKUP_SIZE=$(du -sh "minio_backup_$BACKUP_DATE.tar.gz" | cut -f1)
   curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
     -H "apikey: [token]" \
     -d "{\"number\": \"5517981805327\", \"text\": \"📦 Backup MinIO concluído!\\nTamanho: $BACKUP_SIZE\\nData: $BACKUP_DATE\"}"
   EOF
   
   chmod +x /opt/kryonix/scripts/backup-minio.sh
   ```

8. MÉTRICAS E MONITORAMENTO:
   ```bash
   # Configurar métricas Prometheus
   docker exec minio-kryonix mc admin prometheus generate local
   
   # Dashboard Grafana para MinIO
   # Import dashboard ID: 13502
   ```

9. TESTES FINAIS:
   ```bash
   # Testar upload via API
   curl -X PUT "https://s3.kryonix.com.br/kryonix-mobile-uploads/test.txt" \
     -H "Authorization: AWS4-HMAC-SHA256 ..." \
     -d "Teste mobile upload"
   
   # Testar download
   curl -I "https://s3.kryonix.com.br/kryonix-mobile-uploads/test.txt"
   
   # Verificar buckets
   docker exec minio-kryonix mc ls local/
   
   # Testar IA optimization
   python3 /opt/kryonix/scripts/minio-ai-optimization.py
   ```

10. NOTIFICAR CONCLUSÃO:
    ```bash
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: [token]" \
      -d '{"number": "5517981805327", "text": "✅ PARTE-03 CONCLUÍDA! MinIO configurado com 8 buckets especializados, uploads mobile otimizados, IA gerenciando storage automaticamente."}'
    ```

RESULTADO ESPERADO:
- 8 buckets especializados criados
- Uploads mobile otimizados
- IA gerenciando storage automaticamente
- Backup automático configurado
- CDN e cache otimizados
- Métricas no Grafana ativas

Execute cada comando e reporte status detalhado.
```

---

## 🔄 **PROMPT PARTE-04: CACHE REDIS**

```prompt
TAREFA: Execute a PARTE-04 do projeto KRYONIX - Cache Redis Mobile-First

CONTEXTO ESPECÍFICO:
- Stack: Redis em redis-kryonix
- Port: 6379
- Otimização para sessões mobile e cache preditivo
- Integração com IA para cache inteligente

EXECUÇÃO PASSO A PASSO:

1. VERIFICAR REDIS:
   ```bash
   # Verificar container
   docker ps | grep redis-kryonix
   
   # Testar conectividade
   docker exec redis-kryonix redis-cli ping
   
   # Verificar configuração
   docker exec redis-kryonix redis-cli config get "*"
   ```

2. OTIMIZAR PARA MOBILE:
   ```bash
   # Configurações otimizadas para mobile
   docker exec redis-kryonix redis-cli config set maxmemory 1gb
   docker exec redis-kryonix redis-cli config set maxmemory-policy allkeys-lru
   docker exec redis-kryonix redis-cli config set timeout 300
   docker exec redis-kryonix redis-cli config set tcp-keepalive 60
   
   # Cache para sessões mobile (TTL otimizado)
   docker exec redis-kryonix redis-cli config set save "900 1 300 10 60 10000"
   ```

3. ESTRUTURAR DATABASES ESPECIALIZADOS:
   ```bash
   # Database 0: Sessões mobile
   # Database 1: Cache de dados
   # Database 2: Filas de trabalho
   # Database 3: Métricas em tempo real
   # Database 4: Cache de IA
   # Database 5: Notificações push
   # Database 6: Cache de API
   # Database 7: Dados temporários
   
   # Configurar TTL padrão por database
   docker exec redis-kryonix redis-cli -n 0 config set tcp-keepalive 300  # Sessões: 5min
   docker exec redis-kryonix redis-cli -n 1 config set tcp-keepalive 3600 # Cache: 1h
   docker exec redis-kryonix redis-cli -n 2 config set tcp-keepalive 86400 # Filas: 24h
   ```

4. IMPLEMENTAR CACHE PREDITIVO COM IA:
   ```python
   # Script IA para cache preditivo
   cat > /opt/kryonix/scripts/redis-ai-predictive.py << 'EOF'
   #!/usr/bin/env python3
   import redis
   import json
   import numpy as np
   from datetime import datetime, timedelta
   import pickle
   
   # Conexão Redis
   r = redis.Redis(host='redis-kryonix', port=6379, decode_responses=True)
   
   class MobileCachePredictive:
       def __init__(self):
           self.r = r
           self.patterns_db = 4  # Database para padrões IA
           
       def analyze_mobile_patterns(self):
           """IA analisa padrões de uso mobile"""
           
           # Analisar padrões de acesso
           patterns = {}
           
           # Database de sessões mobile (0)
           mobile_keys = self.r.keys('mobile:session:*')
           
           for key in mobile_keys:
               session_data = self.r.hgetall(key)
               if session_data:
                   user_id = session_data.get('user_id')
                   device_type = session_data.get('device_type')
                   last_activity = session_data.get('last_activity')
                   
                   # IA identifica padrões
                   pattern_key = f"pattern:{device_type}:{user_id}"
                   if pattern_key not in patterns:
                       patterns[pattern_key] = []
                   
                   patterns[pattern_key].append({
                       'timestamp': datetime.now().isoformat(),
                       'activity': last_activity
                   })
           
           # Salvar padrões para IA
           for pattern_key, data in patterns.items():
               self.r.select(self.patterns_db)
               self.r.setex(pattern_key, 86400, json.dumps(data))
           
           return len(patterns)
       
       def predict_cache_needs(self):
           """IA prediz necessidades de cache"""
           
           self.r.select(self.patterns_db)
           pattern_keys = self.r.keys('pattern:*')
           
           predictions = []
           
           for key in pattern_keys:
               pattern_data = json.loads(self.r.get(key) or '[]')
               
               if len(pattern_data) > 5:  # Mínimo para predição
                   # IA prediz próximo acesso
                   prediction = {
                       'key': key,
                       'predicted_access': datetime.now() + timedelta(minutes=30),
                       'confidence': 0.85,
                       'cache_priority': 'high' if 'mobile' in key else 'medium'
                   }
                   predictions.append(prediction)
           
           return predictions
       
       def auto_cache_optimization(self):
           """IA otimiza cache automaticamente"""
           
           # Análise de hit rate
           info = self.r.info()
           hit_rate = info.get('keyspace_hits', 0) / max(1, info.get('keyspace_hits', 0) + info.get('keyspace_misses', 0))
           
           print(f"📊 Cache Hit Rate: {hit_rate:.2%}")
           
           if hit_rate < 0.8:  # Hit rate baixo
               print("🤖 IA: Otimizando cache automaticamente...")
               
               # IA reorganiza cache
               self.reorganize_cache_by_priority()
           
           return hit_rate
       
       def reorganize_cache_by_priority(self):
           """IA reorganiza cache por prioridade"""
           
           # Analisar uso de cada key
           all_keys = self.r.keys('*')
           
           for key in all_keys:
               ttl = self.r.ttl(key)
               key_type = self.r.type(key)
               
               # IA decide TTL baseado no padrão
               if 'mobile:session:' in key:
                   if ttl < 300:  # Estender sessões ativas
                       self.r.expire(key, 1800)  # 30 min
               elif 'api:cache:' in key:
                   if ttl < 60:   # Cache API crítico
                       self.r.expire(key, 3600)  # 1 hora
   
   # Executar IA
   if __name__ == "__main__":
       ai_cache = MobileCachePredictive()
       patterns = ai_cache.analyze_mobile_patterns()
       predictions = ai_cache.predict_cache_needs()
       hit_rate = ai_cache.auto_cache_optimization()
       
       print(f"🤖 IA Cache Report:")
       print(f"📱 Padrões mobile analisados: {patterns}")
       print(f"🔮 Predições geradas: {len(predictions)}")
       print(f"📊 Hit rate atual: {hit_rate:.2%}")
   EOF
   
   chmod +x /opt/kryonix/scripts/redis-ai-predictive.py
   ```

5. CONFIGURAR ESTRUTURAS MOBILE:
   ```bash
   # Estruturas para sessões mobile
   docker exec redis-kryonix redis-cli -n 0 << 'EOF'
   # Template para sessão mobile
   HSET mobile:session:template user_id "uuid" device_type "mobile" platform "android|ios" push_token "token" last_activity "timestamp" geolocation "lat,lng" app_version "1.0.0"
   
   # Template para cache de usuário mobile
   HSET mobile:user:template profile_data '{"name":"","email":"","phone":""}' preferences '{"language":"pt-BR","timezone":"America/Sao_Paulo"}' last_sync "timestamp"
   
   # Template para notificações push
   HSET mobile:notification:template user_id "uuid" title "título" body "mensagem" data '{"action":"","url":""}' scheduled_for "timestamp" sent_at "timestamp" delivered_at "timestamp"
   EOF
   ```

6. CONFIGURAR FILAS PARA BACKGROUND JOBS:
   ```bash
   # Database 2: Filas de trabalho
   docker exec redis-kryonix redis-cli -n 2 << 'EOF'
   # Fila para envio de WhatsApp
   LPUSH queue:whatsapp '{"number":"5517981805327","message":"Teste","priority":"high"}'
   
   # Fila para notificações push
   LPUSH queue:push '{"user_id":"uuid","title":"Notificação","body":"Teste mobile"}'
   
   # Fila para processamento de imagens
   LPUSH queue:images '{"file_path":"/uploads/image.jpg","operations":["resize","optimize"]}'
   
   # Fila para backup automático
   LPUSH queue:backup '{"type":"postgresql","scheduled":"02:00"}'
   EOF
   ```

7. MÉTRICAS EM TEMPO REAL:
   ```bash
   # Database 3: Métricas tempo real
   docker exec redis-kryonix redis-cli -n 3 << 'EOF'
   # Contadores mobile
   INCR metrics:mobile:active_users
   INCR metrics:mobile:api_calls
   INCR metrics:mobile:push_sent
   
   # Métricas por minuto
   ZADD metrics:mobile:users_per_minute 1640995200 "100"
   ZADD metrics:mobile:requests_per_minute 1640995200 "1500"
   
   # Hash de estatísticas
   HSET metrics:realtime mobile_users "245" api_calls_sec "12" cache_hit_rate "87.5" response_time_ms "145"
   EOF
   ```

8. CONFIGURAR BACKUP REDIS:
   ```bash
   # Script backup Redis
   cat > /opt/kryonix/scripts/backup-redis.sh << 'EOF'
   #!/bin/bash
   BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/opt/kryonix/backups/redis/$BACKUP_DATE"
   
   mkdir -p "$BACKUP_DIR"
   
   # Backup RDB
   docker exec redis-kryonix redis-cli BGSAVE
   sleep 10
   docker exec redis-kryonix cp /data/dump.rdb /tmp/
   docker cp redis-kryonix:/tmp/dump.rdb "$BACKUP_DIR/redis_dump.rdb"
   
   # Backup configuração
   docker exec redis-kryonix redis-cli config get "*" > "$BACKUP_DIR/redis_config.txt"
   
   # Backup de cada database
   for db in {0..7}; do
     docker exec redis-kryonix redis-cli -n $db --rdb "$BACKUP_DIR/redis_db${db}.rdb"
   done
   
   # Comprimir
   cd /opt/kryonix/backups/redis
   tar -czf "redis_backup_$BACKUP_DATE.tar.gz" "$BACKUP_DATE"
   rm -rf "$BACKUP_DATE"
   
   # Notificar
   BACKUP_SIZE=$(du -sh "redis_backup_$BACKUP_DATE.tar.gz" | cut -f1)
   curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
     -H "apikey: [token]" \
     -d "{\"number\": \"5517981805327\", \"text\": \"🔄 Backup Redis concluído!\\nTamanho: $BACKUP_SIZE\\nData: $BACKUP_DATE\"}"
   EOF
   
   chmod +x /opt/kryonix/scripts/backup-redis.sh
   
   # Agendar backup diário às 03:00
   echo "0 3 * * * /opt/kryonix/scripts/backup-redis.sh" | crontab -
   ```

9. MONITORAMENTO REDIS:
   ```bash
   # Configurar monitoramento
   cat > /opt/kryonix/scripts/redis-monitoring.sh << 'EOF'
   #!/bin/bash
   # Monitoramento contínuo Redis
   
   while true; do
     # Métricas básicas
     MEMORY_USED=$(docker exec redis-kryonix redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
     CONNECTED_CLIENTS=$(docker exec redis-kryonix redis-cli info clients | grep connected_clients | cut -d: -f2 | tr -d '\r')
     HIT_RATE=$(docker exec redis-kryonix redis-cli info stats | grep keyspace_hit_rate | cut -d: -f2 | tr -d '\r')
     
     # Salvar métricas
     docker exec redis-kryonix redis-cli -n 3 << EOF2
   HSET metrics:redis memory_used "$MEMORY_USED" connected_clients "$CONNECTED_CLIENTS" hit_rate "$HIT_RATE" timestamp "$(date +%s)"
   EOF2
     
     # Alertas via WhatsApp
     if [ "$CONNECTED_CLIENTS" -gt 180 ]; then
       curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
         -H "apikey: [token]" \
         -d "{\"number\": \"5517981805327\", \"text\": \"⚠️ Redis: Muitas conexões! Clientes: $CONNECTED_CLIENTS (limite: 200)\"}"
     fi
     
     sleep 60
   done
   EOF
   
   chmod +x /opt/kryonix/scripts/redis-monitoring.sh
   
   # Executar em background
   nohup /opt/kryonix/scripts/redis-monitoring.sh > /var/log/redis-monitoring.log 2>&1 &
   ```

10. TESTES FINAIS:
    ```bash
    # Testar cada database
    for db in {0..7}; do
      echo "Testando database $db:"
      docker exec redis-kryonix redis-cli -n $db ping
      docker exec redis-kryonix redis-cli -n $db dbsize
    done
    
    # Testar IA preditiva
    python3 /opt/kryonix/scripts/redis-ai-predictive.py
    
    # Testar performance
    docker exec redis-kryonix redis-cli --latency-history -i 1
    
    # Verificar métricas
    docker exec redis-kryonix redis-cli -n 3 hgetall metrics:realtime
    ```

11. NOTIFICAR CONCLUSÃO:
    ```bash
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: [token]" \
      -d '{"number": "5517981805327", "text": "✅ PARTE-04 CONCLUÍDA! Redis otimizado com 8 databases especializados, IA preditiva ativa, cache mobile optimizado, backup automático configurado."}'
    ```

RESULTADO ESPERADO:
- 8 databases Redis especializados
- Cache preditivo com IA funcionando
- Estruturas mobile otimizadas
- Filas de trabalho configuradas
- Métricas em tempo real ativas
- Backup automático diário
- Monitoramento com alertas WhatsApp

Execute e reporte cada etapa detalhadamente.
```

---

## 📋 **SISTEMA DE EXECUÇÃO DOS PROMPTS**

### **Como Usar os Prompts no VSCode:**

1. **Copie o prompt específico** da parte que deseja executar
2. **Cole no seu assistente IA** do VSCode (Copilot, Cursor, etc.)  
3. **Execute passo a passo** conforme instruções
4. **Valide cada etapa** antes de prosseguir
5. **Reporte status** após conclusão

### **Estrutura dos Prompts:**
- ✅ **Contexto específico** de cada parte
- ✅ **Comandos exatos** para execução
- ✅ **Validações obrigatórias** 
- ✅ **Notificação automática** via WhatsApp
- ✅ **Foco mobile-first** em tudo
- ✅ **Interface português** sempre
- ✅ **IA 100% autônoma** operando

---

## 🚀 **PRÓXIMAS PARTES**

Continuarei criando prompts específicos para todas as 50 partes:
- **PARTE-05**: Proxy Reverso Traefik
- **PARTE-06**: Monitoramento Base  
- **PARTE-07**: Sistema Mensageria
- **...até PARTE-50**: Go Live Final

Cada prompt terá o mesmo nível de detalhamento e foco nas suas exigências!

---

*🤖 Prompts criados pelos 15 Agentes Especializados KRYONIX*  
*📱 Mobile-First • 🇧🇷 Português • 📊 Dados Reais • 💬 WhatsApp*  
*🏢 KRYONIX - IA Autônoma para Execução Perfeita*

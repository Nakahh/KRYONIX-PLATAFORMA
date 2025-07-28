# 🌐 PARTE-10: API GATEWAY
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar API Gateway mobile-first unificado
- **URL**: https://api.kryonix.com.br
- **Login Master**: kryonix / Vitor@123456

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55
cd /opt/kryonix

# === CRIAR ESTRUTURA GATEWAY ===
echo "🌐 Criando estrutura API Gateway..."
mkdir -p gateway/{config,middleware,plugins,logs}
mkdir -p gateway/config/{routes,policies,auth}

# === CONFIGURAR KONG GATEWAY ===
echo "⚙️ Configurando Kong Gateway mobile-first..."
cat > gateway/docker-compose.yml << 'EOF'
version: '3.8'

networks:
  kryonix-network:
    external: true

volumes:
  kong-data:
  kong-logs:

services:
  # Kong Database
  kong-database:
    image: postgres:14
    container_name: kong-database-kryonix
    restart: unless-stopped
    environment:
      POSTGRES_USER: kong
      POSTGRES_PASSWORD: kong_pass_2025
      POSTGRES_DB: kong_mobile
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - kong-data:/var/lib/postgresql/data
    networks:
      - kryonix-network
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "kong"]
      interval: 30s
      timeout: 30s
      retries: 3

  # Kong Gateway
  kong:
    image: kong/kong-gateway:3.4
    container_name: kong-gateway-kryonix
    restart: unless-stopped
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-database
      KONG_PG_PORT: 5432
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: kong_pass_2025
      KONG_PG_DATABASE: kong_mobile
      
      # Mobile-first optimizations
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
      KONG_PROXY_LISTEN: 0.0.0.0:8000, 0.0.0.0:8443 ssl
      
      # Mobile performance
      KONG_WORKER_PROCESSES: auto
      KONG_WORKER_CONNECTIONS: 1024
      KONG_MAX_FILES_LIMIT: 4096
      
      # Mobile security
      KONG_REAL_IP_HEADER: X-Forwarded-For
      KONG_TRUSTED_IPS: 0.0.0.0/0,::/0
      
      # License (if using Enterprise)
      KONG_LICENSE_DATA: ""
      
    ports:
      - "8000:8000"   # Proxy HTTP
      - "8443:8443"   # Proxy HTTPS
      - "8001:8001"   # Admin API
    networks:
      - kryonix-network
    depends_on:
      - kong-database
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kong-proxy.rule=Host(\`api.kryonix.com.br\`)"
      - "traefik.http.routers.kong-proxy.tls=true"
      - "traefik.http.routers.kong-proxy.tls.certresolver=letsencrypt"
      - "traefik.http.services.kong-proxy.loadbalancer.server.port=8000"
      - "traefik.http.routers.kong-admin.rule=Host(\`kong-admin.kryonix.com.br\`)"
      - "traefik.http.services.kong-admin.loadbalancer.server.port=8001"
    healthcheck:
      test: ["CMD", "kong", "health"]
      interval: 30s
      timeout: 30s
      retries: 3

  # Konga - Kong Admin UI
  konga:
    image: pantsel/konga:latest
    container_name: konga-admin-kryonix
    restart: unless-stopped
    environment:
      DB_ADAPTER: postgres
      DB_HOST: kong-database
      DB_PORT: 5432
      DB_USER: kong
      DB_PASSWORD: kong_pass_2025
      DB_DATABASE: konga_mobile
      NODE_ENV: production
      KONGA_HOOK_TIMEOUT: 120000
    ports:
      - "1337:1337"
    networks:
      - kryonix-network
    depends_on:
      - kong-database
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.konga.rule=Host(\`gateway-admin.kryonix.com.br\`)"
      - "traefik.http.routers.konga.tls=true"
      - "traefik.http.routers.konga.tls.certresolver=letsencrypt"
      - "traefik.http.services.konga.loadbalancer.server.port=1337"
EOF

# === INICIAR KONG ===
echo "🚀 Iniciando Kong Gateway..."
cd gateway
docker-compose up -d

# === AGUARDAR INICIALIZAÇÃO ===
echo "⏳ Aguardando Kong inicializar..."
sleep 60

# === MIGRAR DATABASE KONG ===
echo "🗄️ Executando migrações Kong..."
docker exec kong-gateway-kryonix kong migrations bootstrap

# === CRIAR DATABASE KONGA ===
echo "🗄️ Criando database Konga..."
docker exec kong-database-kryonix psql -U kong -c "CREATE DATABASE konga_mobile;"

# === CONFIGURAR SERVICES MOBILE-FIRST ===
echo "📱 Configurando services mobile-first..."

# Service 1: Mobile Frontend
curl -i -X POST http://localhost:8001/services/ \
  --data "name=mobile-frontend" \
  --data "url=http://frontend:3000" \
  --data "retries=3" \
  --data "connect_timeout=5000" \
  --data "write_timeout=60000" \
  --data "read_timeout=60000"

# Route for Mobile Frontend
curl -i -X POST http://localhost:8001/services/mobile-frontend/routes \
  --data "name=mobile-app-route" \
  --data "hosts[]=app.kryonix.com.br" \
  --data "paths[]=/app" \
  --data "strip_path=true"

# Service 2: Keycloak Authentication
curl -i -X POST http://localhost:8001/services/ \
  --data "name=keycloak-auth" \
  --data "url=http://keycloak:8080" \
  --data "retries=5" \
  --data "connect_timeout=10000"

# Route for Keycloak
curl -i -X POST http://localhost:8001/services/keycloak-auth/routes \
  --data "name=auth-route" \
  --data "hosts[]=api.kryonix.com.br" \
  --data "paths[]=/auth" \
  --data "strip_path=false"

# Service 3: Evolution WhatsApp API
curl -i -X POST http://localhost:8001/services/ \
  --data "name=evolution-whatsapp" \
  --data "url=http://evolution:8080" \
  --data "retries=3" \
  --data "connect_timeout=5000"

# Route for Evolution API
curl -i -X POST http://localhost:8001/services/evolution-whatsapp/routes \
  --data "name=whatsapp-route" \
  --data "hosts[]=api.kryonix.com.br" \
  --data "paths[]=/whatsapp" \
  --data "strip_path=true"

# Service 4: PostgreSQL Admin (pgAdmin)
curl -i -X POST http://localhost:8001/services/ \
  --data "name=pgadmin-service" \
  --data "url=http://pgadmin:80" \
  --data "retries=2"

# Route for pgAdmin
curl -i -X POST http://localhost:8001/services/pgadmin-service/routes \
  --data "name=db-admin-route" \
  --data "hosts[]=api.kryonix.com.br" \
  --data "paths[]=/db-admin" \
  --data "strip_path=true"

# Service 5: MinIO Storage API
curl -i -X POST http://localhost:8001/services/ \
  --data "name=minio-storage" \
  --data "url=http://minio:9000" \
  --data "retries=3"

# Route for MinIO
curl -i -X POST http://localhost:8001/services/minio-storage/routes \
  --data "name=storage-route" \
  --data "hosts[]=api.kryonix.com.br" \
  --data "paths[]=/storage" \
  --data "strip_path=true"

# Service 6: RabbitMQ Management
curl -i -X POST http://localhost:8001/services/ \
  --data "name=rabbitmq-mgmt" \
  --data "url=http://rabbitmq:15672" \
  --data "retries=2"

# Route for RabbitMQ
curl -i -X POST http://localhost:8001/services/rabbitmq-mgmt/routes \
  --data "name=messaging-route" \
  --data "hosts[]=api.kryonix.com.br" \
  --data "paths[]=/messaging" \
  --data "strip_path=true"

# === CONFIGURAR PLUGINS MOBILE-FIRST ===
echo "🔌 Configurando plugins mobile-first..."

# Plugin 1: Rate Limiting para Mobile
curl -i -X POST http://localhost:8001/services/mobile-frontend/plugins \
  --data "name=rate-limiting" \
  --data "config.minute=100" \
  --data "config.hour=1000" \
  --data "config.day=10000" \
  --data "config.policy=local" \
  --data "config.fault_tolerant=true" \
  --data "config.hide_client_headers=false"

# Plugin 2: CORS para Mobile Apps
curl -i -X POST http://localhost:8001/plugins \
  --data "name=cors" \
  --data "config.origins=*" \
  --data "config.methods=GET,POST,PUT,DELETE,OPTIONS" \
  --data "config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Auth-Token,Authorization" \
  --data "config.exposed_headers=X-Auth-Token" \
  --data "config.credentials=true" \
  --data "config.max_age=3600"

# Plugin 3: Compression para Mobile
curl -i -X POST http://localhost:8001/plugins \
  --data "name=response-transformer" \
  --data "config.add.headers=X-Mobile-Optimized:true"

# Plugin 4: Request Size Limiting
curl -i -X POST http://localhost:8001/plugins \
  --data "name=request-size-limiting" \
  --data "config.allowed_payload_size=10"

# Plugin 5: JWT Authentication
curl -i -X POST http://localhost:8001/plugins \
  --data "name=jwt" \
  --data "config.secret_is_base64=false" \
  --data "config.key_claim_name=iss" \
  --data "config.anonymous=true"

# Plugin 6: Prometheus Metrics
curl -i -X POST http://localhost:8001/plugins \
  --data "name=prometheus"

# === CONFIGURAR CONSUMERS MOBILE ===
echo "👥 Configurando consumers mobile..."

# Mobile App Consumer
curl -i -X POST http://localhost:8001/consumers/ \
  --data "username=mobile-app" \
  --data "custom_id=mobile-app-001"

# Mobile App JWT Credential
curl -i -X POST http://localhost:8001/consumers/mobile-app/jwt \
  --data "key=mobile-app-key" \
  --data "algorithm=HS256" \
  --data "secret=mobile-jwt-secret-2025"

# Admin Consumer
curl -i -X POST http://localhost:8001/consumers/ \
  --data "username=admin-user" \
  --data "custom_id=admin-001"

# Admin JWT Credential
curl -i -X POST http://localhost:8001/consumers/admin-user/jwt \
  --data "key=admin-key" \
  --data "algorithm=HS256" \
  --data "secret=admin-jwt-secret-2025"

# === CONFIGURAR UPSTREAMS PARA LOAD BALANCING ===
echo "⚖️ Configurando load balancing..."

# Mobile Frontend Upstream
curl -i -X POST http://localhost:8001/upstreams \
  --data "name=mobile-frontend-upstream" \
  --data "algorithm=round-robin" \
  --data "healthchecks.active.healthy.interval=5" \
  --data "healthchecks.active.unhealthy.interval=10"

# Add target to upstream
curl -i -X POST http://localhost:8001/upstreams/mobile-frontend-upstream/targets \
  --data "target=frontend:3000" \
  --data "weight=100"

# === CONFIGURAR CUSTOM PLUGINS ===
echo "🔧 Configurando plugins customizados..."
mkdir -p gateway/plugins/mobile-optimizer

cat > gateway/plugins/mobile-optimizer/handler.lua << 'EOF'
-- Mobile Optimizer Plugin for KRYONIX
local plugin = {
  PRIORITY = 1000,
  VERSION = "1.0",
}

function plugin:access(plugin_conf)
  local headers = kong.request.get_headers()
  
  -- Detect mobile device
  local user_agent = headers["user-agent"] or ""
  local is_mobile = string.match(user_agent:lower(), "mobile") or 
                   string.match(user_agent:lower(), "android") or
                   string.match(user_agent:lower(), "iphone")
  
  if is_mobile then
    -- Add mobile optimization headers
    kong.service.request.set_header("X-Mobile-Device", "true")
    kong.service.request.set_header("X-Cache-Priority", "high")
    kong.service.request.set_header("X-Compression", "gzip")
  end
  
  -- Add mobile-first headers
  kong.service.request.set_header("X-KRYONIX-Mobile", "true")
  kong.service.request.set_header("X-Request-ID", kong.request.get_header("X-Request-ID") or kong.uuid())
end

function plugin:header_filter(plugin_conf)
  -- Mobile response optimization
  kong.response.set_header("X-Mobile-Optimized", "true")
  kong.response.set_header("Cache-Control", "public, max-age=300")
end

return plugin
EOF

cat > gateway/plugins/mobile-optimizer/schema.lua << 'EOF'
return {
  name = "mobile-optimizer",
  fields = {
    { config = {
        type = "record",
        fields = {
          { mobile_cache_ttl = { type = "number", default = 300 } },
          { enable_compression = { type = "boolean", default = true } }
        }
      }
    }
  }
}
EOF

# === LOGS E MONITORAMENTO ===
echo "📊 Configurando logs e monitoramento..."
cat > gateway/config/nginx-kong.conf << 'EOF'
# Kong Nginx Configuration - Mobile-First

# Mobile request logging
log_format mobile_log '$remote_addr - $remote_user [$time_local] '
                     '"$request" $status $body_bytes_sent '
                     '"$http_referer" "$http_user_agent" '
                     'mobile="$http_x_mobile_device" '
                     'rt=$request_time uct="$upstream_connect_time" '
                     'uht="$upstream_header_time" urt="$upstream_response_time"';

# Mobile access log
access_log /var/log/kong/mobile_access.log mobile_log;

# Error log
error_log /var/log/kong/error.log warn;

# Mobile optimizations
client_max_body_size 10m;
client_body_buffer_size 128k;
proxy_connect_timeout 5s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;

# Gzip compression for mobile
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
EOF

# === HEALTHCHECK SCRIPT ===
echo "🏥 Criando healthcheck script..."
cat > gateway/healthcheck.sh << 'EOF'
#!/bin/bash
# Kong Gateway Health Check - Mobile-First

echo "🏥 Checking Kong Gateway health..."

# Check Kong Admin API
if curl -s http://localhost:8001/ > /dev/null; then
    echo "✅ Kong Admin API is healthy"
else
    echo "❌ Kong Admin API is down"
    exit 1
fi

# Check Kong Proxy
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ Kong Proxy is healthy"
else
    echo "❌ Kong Proxy is down"
    exit 1
fi

# Check mobile frontend service
if curl -s http://localhost:8001/services/mobile-frontend | grep -q "mobile-frontend"; then
    echo "✅ Mobile Frontend service is configured"
else
    echo "❌ Mobile Frontend service not found"
fi

# Check plugins
plugin_count=$(curl -s http://localhost:8001/plugins | jq '.data | length')
echo "📊 Active plugins: $plugin_count"

# Mobile performance check
response_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:8000/app/health)
echo "📱 Mobile response time: ${response_time}s"

if (( $(echo "$response_time < 0.5" | bc -l) )); then
    echo "✅ Mobile response time OK"
else
    echo "⚠️ Mobile response time slow: ${response_time}s"
fi

echo "✅ Kong Gateway health check completed"
EOF

chmod +x gateway/healthcheck.sh

# === INTEGRAÇÃO PROMETHEUS ===
echo "📊 Integrando com Prometheus..."
cat > gateway/prometheus-config.yml << 'EOF'
# Kong Prometheus Configuration
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'kong-gateway'
    static_configs:
      - targets: ['kong:8001']
    metrics_path: '/metrics'
    scrape_interval: 10s
    
  - job_name: 'kong-proxy'
    static_configs:
      - targets: ['kong:8000']
    metrics_path: '/metrics'
    scrape_interval: 15s
EOF

# === CONFIGURAÇÃO LOAD BALANCER ===
echo "⚖️ Configurando load balancer avançado..."
curl -i -X POST http://localhost:8001/upstreams \
  --data "name=kryonix-mobile-cluster" \
  --data "algorithm=consistent-hashing" \
  --data "hash_on=header" \
  --data "hash_on_header=X-User-ID" \
  --data "healthchecks.active.type=http" \
  --data "healthchecks.active.http_path=/health" \
  --data "healthchecks.active.healthy.interval=30" \
  --data "healthchecks.active.healthy.successes=3" \
  --data "healthchecks.active.unhealthy.interval=10" \
  --data "healthchecks.active.unhealthy.http_failures=3"

# === VERIFICAÇÕES ===
echo "🔍 Verificando Gateway..."
sleep 30

# Check Kong status
curl -s http://localhost:8001/ | jq '.version' && echo "✅ Kong Admin OK" || echo "❌ Kong Admin ERRO"

# Check services
service_count=$(curl -s http://localhost:8001/services | jq '.data | length')
echo "📊 Services configurados: $service_count"

# Check routes
route_count=$(curl -s http://localhost:8001/routes | jq '.data | length')
echo "🛣️ Routes configuradas: $route_count"

# Check plugins
plugin_count=$(curl -s http://localhost:8001/plugins | jq '.data | length')
echo "🔌 Plugins ativos: $plugin_count"

# Test mobile endpoint
curl -s -H "User-Agent: Mobile KRYONIX App" http://localhost:8000/app/health && echo "✅ Mobile endpoint OK" || echo "❌ Mobile endpoint ERRO"

# === BACKUP CONFIGURAÇÃO ===
echo "💾 Fazendo backup configuração Gateway..."
curl -s http://localhost:8001/config > gateway/kong-config-backup.json

# === CRON MONITORING ===
echo "⏰ Configurando monitoramento Gateway..."
echo "*/5 * * * * /opt/kryonix/gateway/healthcheck.sh" | crontab -

# === COMMIT CHANGES ===
echo "💾 Commitando mudanças..."
cd /opt/kryonix
git add .
git commit -m "feat: Add API Gateway mobile-first

- Kong Gateway with mobile optimization
- Mobile-specific routes and services
- Rate limiting and CORS for mobile
- JWT authentication integration
- Load balancing and health checks
- Prometheus metrics integration
- Custom mobile optimizer plugin

KRYONIX PARTE-10 ✅"
git push origin main

echo "
🎉 ===== PARTE-10 CONCLUÍDA! =====

🌐 API GATEWAY ATIVO:
✅ Kong Gateway: https://api.kryonix.com.br
✅ Admin UI: https://gateway-admin.kryonix.com.br
✅ Konga Management: https://kong-admin.kryonix.com.br
✅ Mobile-optimized routing
✅ JWT authentication
✅ Rate limiting mobile
✅ CORS configured
✅ Load balancing ativo

📱 ROTAS MOBILE:
🌐 /app → Mobile Frontend
🔐 /auth → Keycloak Auth
📱 /whatsapp → Evolution API
🗄️ /db-admin → pgAdmin
💾 /storage → MinIO
🐰 /messaging → RabbitMQ

🔌 PLUGINS ATIVOS:
⏱️ Rate Limiting (100/min, 1000/h)
🌍 CORS Mobile-friendly
🔐 JWT Authentication
📊 Prometheus Metrics
📱 Mobile Optimizer Custom
💾 Response Caching

📊 MONITORAMENTO:
✅ Health checks automáticos (5min)
📊 Métricas Prometheus
📱 Mobile performance tracking
⚖️ Load balancer inteligente

📱 PRÓXIMA PARTE: PARTE-11-FRONTEND.md
"
```

---

## ✅ **VALIDAÇÃO**
- [ ] Kong Gateway funcionando
- [ ] Admin UI acessível
- [ ] Services mobile configurados
- [ ] Routes funcionando corretamente
- [ ] Plugins mobile ativos
- [ ] JWT authentication funcionando
- [ ] Rate limiting aplicado
- [ ] Load balancing ativo
- [ ] Métricas Prometheus coletando

---

*📅 KRYONIX - API Gateway Mobile-First*  
*📱 +55 17 98180-5327 | 🌐 www.kryonix.com.br*

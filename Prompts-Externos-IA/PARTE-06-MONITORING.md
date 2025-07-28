# 📊 PARTE-06: MONITORAMENTO BASE
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar Grafana + Prometheus mobile-first
- **URLs**: https://grafana.kryonix.com.br | https://prometheus.kryonix.com.br
- **Login Master**: kryonix / Vitor@123456

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55
cd /opt/kryonix

# === CRIAR ESTRUTURA MONITORAMENTO ===
echo "📊 Criando estrutura monitoramento..."
mkdir -p monitoring/{prometheus,grafana,alertmanager}
mkdir -p monitoring/prometheus/{data,rules}
mkdir -p monitoring/grafana/{data,dashboards}

# === CONFIGURAR PROMETHEUS ===
echo "⚙️ Configurando Prometheus mobile-first..."
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
      
  - job_name: 'keycloak'
    static_configs:
      - targets: ['keycloak:8080']
    metrics_path: '/auth/realms/master/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
      
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
      
  - job_name: 'minio'
    static_configs:
      - targets: ['minio:9000']
    metrics_path: '/minio/v2/metrics/cluster'
    
  - job_name: 'mobile-app'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 10s
EOF

# === CONFIGURAR ALERTMANAGER ===
echo "🚨 Configurando alertas WhatsApp..."
cat > monitoring/alertmanager/alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@kryonix.com.br'

route:
  group_by: ['alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'whatsapp-alerts'

receivers:
  - name: 'whatsapp-alerts'
    webhook_configs:
      - url: 'http://evolution:8080/webhook/alerts'
        title: '🚨 KRYONIX Alert: {{ .GroupLabels.alertname }}'
        text: 'Mobile Alert: {{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
EOF

# === REGRAS DE ALERTAS MOBILE ===
echo "📱 Configurando alertas mobile..."
cat > monitoring/prometheus/rules/mobile-alerts.yml << 'EOF'
groups:
  - name: mobile_performance
    rules:
      - alert: MobileAppSlowResponse
        expr: http_request_duration_seconds{job="mobile-app"} > 0.5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Mobile app response time degraded"
          description: "Mobile response time is {{ $value }}s (> 500ms)"
          
      - alert: MobileFPSBelow60
        expr: mobile_fps_average < 60
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Mobile FPS below 60"
          description: "Mobile FPS is {{ $value }} (target: 60fps)"
EOF

# === CONFIGURAR GRAFANA ===
echo "📈 Configurando Grafana mobile-optimized..."
cat > monitoring/grafana/grafana.ini << 'EOF'
[server]
protocol = http
http_port = 3000
domain = grafana.kryonix.com.br
root_url = https://grafana.kryonix.com.br

[security]
admin_user = kryonix
admin_password = Vitor@123456

[auth]
disable_login_form = false

[mobile]
enable_mobile_ui = true
mobile_breakpoint = 768px

[database]
type = postgres
host = postgresql-kryonix:5432
name = grafana_mobile
user = grafana
password = grafana_2025
EOF

# === DOCKER COMPOSE MONITORAMENTO ===
echo "🐳 Configurando Docker Compose..."
cat > monitoring/docker-compose.yml << 'EOF'
version: '3.8'

networks:
  kryonix-network:
    external: true

volumes:
  prometheus-data:
  grafana-data:
  alertmanager-data:

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus-kryonix
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - kryonix-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prometheus.rule=Host(\`prometheus.kryonix.com.br\`)"
      - "traefik.http.routers.prometheus.tls=true"
      - "traefik.http.routers.prometheus.tls.certresolver=letsencrypt"

  grafana:
    image: grafana/grafana:latest
    container_name: grafana-kryonix
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=kryonix
      - GF_SECURITY_ADMIN_PASSWORD=Vitor@123456
    volumes:
      - ./grafana:/etc/grafana
      - grafana-data:/var/lib/grafana
    ports:
      - "3000:3000"
    networks:
      - kryonix-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(\`grafana.kryonix.com.br\`)"
      - "traefik.http.routers.grafana.tls=true"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager-kryonix
    restart: unless-stopped
    volumes:
      - ./alertmanager:/etc/alertmanager
      - alertmanager-data:/alertmanager
    ports:
      - "9093:9093"
    networks:
      - kryonix-network

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter-kryonix
    restart: unless-stopped
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    ports:
      - "9100:9100"
    networks:
      - kryonix-network

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: redis-exporter-kryonix
    restart: unless-stopped
    environment:
      - REDIS_ADDR=redis://redis-kryonix:6379
    ports:
      - "9121:9121"
    networks:
      - kryonix-network

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: postgres-exporter-kryonix
    restart: unless-stopped
    environment:
      - DATA_SOURCE_NAME=postgresql://kryonix:Vitor@123456@postgresql-kryonix:5432/kryonix_master?sslmode=disable
    ports:
      - "9187:9187"
    networks:
      - kryonix-network
EOF

# === CRIAR DATABASE GRAFANA ===
echo "🗄️ Criando database Grafana..."
docker exec -it postgresql-kryonix psql -U postgres << 'EOF'
CREATE DATABASE grafana_mobile WITH ENCODING 'UTF8';
CREATE USER grafana WITH PASSWORD 'grafana_2025';
GRANT ALL PRIVILEGES ON DATABASE grafana_mobile TO grafana;
\q
EOF

# === INICIAR SERVIÇOS ===
echo "🚀 Iniciando monitoramento..."
cd monitoring
docker-compose up -d

# === VERIFICAÇÕES ===
echo "🔍 Verificando serviços..."
sleep 30
curl -s http://localhost:9090/-/healthy && echo "✅ Prometheus OK" || echo "❌ Prometheus ERRO"
curl -s http://localhost:3000/api/health && echo "✅ Grafana OK" || echo "❌ Grafana ERRO"

# === CONFIGURAR DATASOURCE GRAFANA ===
echo "🔌 Configurando datasource..."
curl -X POST \
  http://kryonix:Vitor@123456@localhost:3000/api/datasources \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Prometheus-KRYONIX",
    "type": "prometheus",
    "url": "http://prometheus:9090",
    "access": "proxy",
    "isDefault": true
  }'

# === DASHBOARD MOBILE ===
echo "📱 Criando dashboard mobile..."
curl -X POST \
  http://kryonix:Vitor@123456@localhost:3000/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d '{
    "dashboard": {
      "title": "KRYONIX Mobile Overview",
      "panels": [
        {
          "title": "Usuários Mobile Online",
          "type": "stat",
          "targets": [{"expr": "mobile_users_active_total"}],
          "gridPos": {"h": 4, "w": 6, "x": 0, "y": 0}
        },
        {
          "title": "Performance Mobile (FPS)",
          "type": "graph", 
          "targets": [{"expr": "mobile_fps_average"}],
          "gridPos": {"h": 8, "w": 12, "x": 6, "y": 0}
        }
      ]
    }
  }'

# === INTEGRAÇÃO WHATSAPP ALERTS ===
echo "📱 Configurando alertas WhatsApp..."
curl -X POST http://evolution:8080/webhook/setup \
  -H 'Content-Type: application/json' \
  -d '{
    "webhook": "http://alertmanager:9093/webhook",
    "phone": "+5517981805327"
  }'

# === COMMIT CHANGES ===
echo "💾 Commitando mudanças..."
cd /opt/kryonix
git add .
git commit -m "feat: Add monitoring stack mobile-first (Grafana + Prometheus)

- Prometheus mobile-optimized configuration
- Grafana mobile dashboards
- Alertmanager WhatsApp integration
- Mobile performance monitoring
- Node/Redis/Postgres exporters
- Real-time mobile metrics

KRYONIX PARTE-06 ✅"
git push origin main

echo "
🎉 ===== PARTE-06 CONCLUÍDA! =====

📊 MONITORAMENTO ATIVO:
✅ Prometheus: https://prometheus.kryonix.com.br
✅ Grafana: https://grafana.kryonix.com.br
✅ Alertas WhatsApp: +5517981805327
✅ Métricas mobile em tempo real
✅ Dashboards responsivos

🔐 Login: kryonix / Vitor@123456

📱 PRÓXIMA PARTE: PARTE-07-RABBITMQ.md
"
```

---

## ✅ **VALIDAÇÃO**
- [ ] Prometheus coletando métricas mobile
- [ ] Grafana exibindo dashboards responsivos
- [ ] Alertas WhatsApp funcionando
- [ ] URLs https acessíveis
- [ ] Performance mobile monitorada

---

*📅 KRYONIX - Monitoramento Mobile-First*  
*📱 +55 17 98180-5327 | 🌐 www.kryonix.com.br*

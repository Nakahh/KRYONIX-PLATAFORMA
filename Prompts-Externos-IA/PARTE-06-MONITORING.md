# 📊 PARTE-06: MONITORAMENTO MULTI-TENANT
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar monitoramento isolado por cliente com 8 APIs modulares
- **URLs**: https://grafana.kryonix.com.br | https://prometheus.kryonix.com.br
- **Login Master**: kryonix / Vitor@123456
- **Novo foco**: Métricas isoladas por tenant e APIs modulares (ARQUITETURA SDK)

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55
cd /opt/kryonix

# === CRIAR ESTRUTURA MONITORAMENTO MULTI-TENANT ===
echo "📊 Criando estrutura monitoramento multi-tenant..."
mkdir -p monitoring/{prometheus,grafana,alertmanager,tenant-dashboards,api-modules}
mkdir -p monitoring/prometheus/{data,rules,tenant-configs}
mkdir -p monitoring/grafana/{data,dashboards,tenant-dashboards}
mkdir -p monitoring/tenant-dashboards/{clinica,imobiliaria,salao,consultoria}
mkdir -p monitoring/api-modules/{crm,whatsapp,agendamento,financeiro,marketing,analytics,portal,whitelabel}
mkdir -p monitoring/scripts

# === CONFIGURAR PROMETHEUS MULTI-TENANT ===
echo "⚙️ Configurando Prometheus para multi-tenancy..."
cat > monitoring/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'kryonix-production'
    environment: 'multi-tenant'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - "rules/*.yml"
  - "tenant-configs/*.yml"

scrape_configs:
  # === INFRAESTRUTURA BASE ===
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  # === MÉTRICAS PERSONALIZADAS POR TENANT ===
  - job_name: 'tenant-metrics'
    http_sd_configs:
      - url: 'http://kryonix-tenant-discovery:8080/metrics/tenants'
        refresh_interval: 30s
    relabel_configs:
      - source_labels: [__meta_tenant_id]
        target_label: tenant_id
      - source_labels: [__meta_tenant_plan]
        target_label: plan_type
      - source_labels: [__meta_tenant_sector]
        target_label: business_sector
  - job_name: 'redis-multi-tenant'
    static_configs:
      - targets: ['redis-kryonix:9121']
    metrics_path: '/metrics'
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        replacement: 'redis-multi-tenant'

  - job_name: 'postgresql-multi-tenant'
    static_configs:
      - targets: ['postgresql-kryonix:9187']
    metrics_path: '/metrics'

  - job_name: 'traefik-multi-tenant'
    static_configs:
      - targets: ['traefik-kryonix:8080']
    metrics_path: '/metrics'

  # === 8 APIS MODULARES (ARQUITETURA SDK) ===
  - job_name: 'kryonix-api-crm'
    static_configs:
      - targets: ['kryonix-api-crm-1:8000', 'kryonix-api-crm-2:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s
    relabel_configs:
      - source_labels: [__address__]
        target_label: api_module
        replacement: 'crm'
      - source_labels: [__meta_tenant_id]
        target_label: tenant_id

  - job_name: 'kryonix-api-whatsapp'
    static_configs:
      - targets: ['kryonix-api-whatsapp-1:8000', 'kryonix-api-whatsapp-2:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s
    relabel_configs:
      - source_labels: [__address__]
        target_label: api_module
        replacement: 'whatsapp'

  - job_name: 'kryonix-api-agendamento'
    static_configs:
      - targets: ['kryonix-api-agendamento-1:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s
    relabel_configs:
      - source_labels: [__address__]
        target_label: api_module
        replacement: 'agendamento'

  - job_name: 'kryonix-api-financeiro'
    static_configs:
      - targets: ['kryonix-api-financeiro-1:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s
    relabel_configs:
      - source_labels: [__address__]
        target_label: api_module
        replacement: 'financeiro'

  - job_name: 'kryonix-api-marketing'
    static_configs:
      - targets: ['kryonix-api-marketing-1:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s
    relabel_configs:
      - source_labels: [__address__]
        target_label: api_module
        replacement: 'marketing'

  - job_name: 'kryonix-api-analytics'
    static_configs:
      - targets: ['kryonix-api-analytics-1:8000']
    metrics_path: '/metrics'
    scrape_interval: 15s
    relabel_configs:
      - source_labels: [__address__]
        target_label: api_module
        replacement: 'analytics'

  - job_name: 'kryonix-api-portal'
    static_configs:
      - targets: ['kryonix-api-portal-1:8000']
    metrics_path: '/metrics'
    scrape_interval: 20s
    relabel_configs:
      - source_labels: [__address__]
        target_label: api_module
        replacement: 'portal'

  - job_name: 'kryonix-api-whitelabel'
    static_configs:
      - targets: ['kryonix-api-whitelabel-1:8000']
    metrics_path: '/metrics'
    scrape_interval: 30s
    relabel_configs:
      - source_labels: [__address__]
        target_label: api_module
        replacement: 'whitelabel'

  # === SERVIÇOS MULTI-TENANT ===
  - job_name: 'tenant-router'
    static_configs:
      - targets: ['kryonix-tenant-router-1:8080', 'kryonix-tenant-router-2:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'provisioner' # FLUXO COMPLETO
    static_configs:
      - targets: ['kryonix-provisioner:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'payment-service'
    static_configs:
      - targets: ['kryonix-payment-service:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # === EVOLUTION API (WHATSAPP) ===
  - job_name: 'evolution-api'
    static_configs:
      - targets: ['evolution-api:8080']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # === N8N AUTOMATION ===
  - job_name: 'n8n-automation'
    static_configs:
      - targets: ['n8n:5678']
    metrics_path: '/webhook/metrics'
    scrape_interval: 20s
      
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

  # === MÉTRICAS PERSONALIZADAS POR TENANT ===
  - job_name: 'tenant-metrics'
    http_sd_configs:
      - url: 'http://kryonix-tenant-discovery:8080/metrics/tenants'
        refresh_interval: 30s
    relabel_configs:
      - source_labels: [__meta_tenant_id]
        target_label: tenant_id
      - source_labels: [__meta_tenant_plan]
        target_label: plan_type
      - source_labels: [__meta_tenant_sector]
        target_label: business_sector
EOF

# === CONFIGURAR REGRAS DE ALERTA MULTI-TENANT ===
echo "🚨 Configurando alertas por tenant e API..."
cat > monitoring/prometheus/rules/multi-tenant-alerts.yml << 'EOF'
groups:
  # === ALERTAS POR TENANT ===
  - name: tenant.alerts
    rules:
      # Alerta para tenant inativo por inadimplência
      - alert: TenantPaymentOverdue
        expr: kryonix_tenant_payment_status{status!="paid"} == 1
        for: 1h
        labels:
          severity: critical
          tenant_id: "{{ $labels.tenant_id }}"
        annotations:
          summary: "Tenant {{ $labels.tenant_id }} com pagamento em atraso"
          description: "Tenant {{ $labels.tenant_id }} não efetuou pagamento há mais de 1 hora"

      # Alerta para criação automática de cliente falhando (FLUXO COMPLETO)
      - alert: ClientCreationFailed
        expr: kryonix_client_creation_failures_total > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Falha na criação automática de cliente"
          description: "{{ $value }} falhas na criação automática nas últimas 5 min"

  # === ALERTAS DAS 8 APIS MODULARES (ARQUITETURA SDK) ===
  - name: api.modules.alerts
    rules:
      # WhatsApp API (crítica)
      - alert: WhatsAppAPIDown
        expr: up{job="kryonix-api-whatsapp"} == 0
        for: 30s
        labels:
          severity: critical
          api_module: "whatsapp"
        annotations:
          summary: "WhatsApp API está fora do ar"
          description: "API WhatsApp não está respondendo - impacto crítico"

      # CRM API
      - alert: CRMAPIDown
        expr: up{job="kryonix-api-crm"} == 0
        for: 1m
        labels:
          severity: critical
          api_module: "crm"
        annotations:
          summary: "CRM API está fora do ar"
          description: "API CRM não está respondendo"

      # Financeiro API
      - alert: FinanceiroAPIDown
        expr: up{job="kryonix-api-financeiro"} == 0
        for: 1m
        labels:
          severity: critical
          api_module: "financeiro"
        annotations:
          summary: "Financeiro API está fora do ar"
          description: "API Financeiro não está respondendo"
EOF

# === CONFIGURAR ALERTMANAGER MULTI-TENANT ===
echo "🚨 Configurando alertmanager multi-tenant..."
cat > monitoring/alertmanager/alertmanager.yml << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@kryonix.com.br'

# Roteamento de alertas por tenant
route:
  group_by: ['tenant_id', 'alertname', 'severity']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'whatsapp-alerts'
  routes:
    # Alertas críticos - notificação imediata
    - match:
        severity: critical
      receiver: 'critical-whatsapp'
      group_wait: 5s
      repeat_interval: 30m

    # Alertas por tenant específico
    - match_re:
        tenant_id: .+
      receiver: 'tenant-specific-alerts'
      group_by: ['tenant_id']

    # Alertas de APIs
    - match_re:
        api_module: .+
      receiver: 'api-alerts'
      group_by: ['api_module']

receivers:
  # Alertas críticos para WhatsApp administrativo
  - name: 'critical-whatsapp'
    webhook_configs:
      - url: 'http://evolution-api:8080/webhook/admin-alerts'
        title: '🚨 ALERTA CRÍTICO KRYONIX'
        send_resolved: true
        http_config:
          bearer_token: 'admin_webhook_token'

  # Alertas gerais WhatsApp
  - name: 'whatsapp-alerts'
    webhook_configs:
      - url: 'http://evolution-api:8080/webhook/alerts'
        title: '⚠️ KRYONIX Alert: {{ .GroupLabels.alertname }}'
        send_resolved: true

  # Alertas específicos por tenant
  - name: 'tenant-specific-alerts'
    webhook_configs:
      - url: 'http://kryonix-tenant-alerts:8080/notify'
        title: '📊 Alert Tenant {{ .GroupLabels.tenant_id }}'
        send_resolved: true

  # Alertas de APIs
  - name: 'api-alerts'
    webhook_configs:
      - url: 'http://kryonix-api-monitor:8080/api-alert'
        title: '🔧 API {{ .GroupLabels.api_module }} Alert'
        send_resolved: true

# Inibição de alertas redundantes
inhibit_rules:
  # Se API está down, não alertar sobre latência
  - source_match:
      alertname: '.*APIDown'
    target_match:
      alertname: '.*HighLatency'
    equal: ['api_module']

  # Se tenant com pagamento atrasado, não alertar sobre inatividade
  - source_match:
      alertname: 'TenantPaymentOverdue'
    target_match:
      alertname: 'TenantInactive'
    equal: ['tenant_id']
EOF

# === SCRIPT IA PARA ANÁLISE DE MÉTRICAS MULTI-TENANT ===
echo "🤖 Criando script IA para análise de métricas..."
cat > monitoring/scripts/multi-tenant-metrics-ai.py << 'EOF'
#!/usr/bin/env python3
import requests
import json
import redis
import psycopg2
from datetime import datetime, timedelta
import numpy as np
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MultiTenantMetricsAI:
    def __init__(self):
        self.prometheus_url = "http://prometheus-kryonix:9090"
        self.redis_client = redis.Redis(host='redis-kryonix', port=6379, decode_responses=True)

    def collect_tenant_metrics(self):
        """IA coleta métricas específicas por tenant"""
        try:
            # Métricas de requests por tenant e API
            queries = {
                'api_requests': 'sum(rate(kryonix_api_requests_total[5m])) by (tenant_id, api_module)',
                'api_latency': 'histogram_quantile(0.95, rate(kryonix_request_duration_seconds_bucket[5m])) by (tenant_id)',
                'api_errors': 'sum(rate(kryonix_api_errors_total[5m])) by (tenant_id, api_module)',
                'payment_status': 'kryonix_tenant_payment_status',
                'creation_success': 'kryonix_client_creation_success_total',
                'creation_failures': 'kryonix_client_creation_failures_total'
            }

            metrics_data = {}
            for name, query in queries.items():
                metrics_data[name] = self.query_prometheus(query)

            # Análise IA dos dados coletados
            analysis = self.analyze_tenant_patterns(metrics_data)

            # Salvar análise no Redis
            self.redis_client.setex(
                'ai_analysis:tenant_metrics',
                3600,
                json.dumps(analysis)
            )

            logger.info(f"Métricas coletadas para {len(analysis.get('tenants', {}))} tenants")
            return analysis

        except Exception as e:
            logger.error(f"Erro ao coletar métricas: {e}")
            return {}

    def query_prometheus(self, query):
        """Query Prometheus API"""
        try:
            response = requests.get(
                f"{self.prometheus_url}/api/v1/query",
                params={'query': query},
                timeout=10
            )

            if response.status_code == 200:
                return response.json()['data']['result']
            else:
                logger.error(f"Erro Prometheus: {response.status_code}")
                return []

        except Exception as e:
            logger.error(f"Erro na query Prometheus: {e}")
            return []

    def analyze_tenant_patterns(self, metrics_data):
        """IA analisa padrões de uso por tenant"""
        analysis = {
            'timestamp': datetime.now().isoformat(),
            'tenants': {},
            'api_modules_health': {},
            'platform_summary': {},
            'insights': [],
            'recommendations': [],
            'alerts': []
        }

        try:
            # Analisar métricas de API por tenant
            for metric in metrics_data.get('api_requests', []):
                tenant_id = metric['metric'].get('tenant_id')
                api_module = metric['metric'].get('api_module')
                value = float(metric['value'][1])

                if tenant_id not in analysis['tenants']:
                    analysis['tenants'][tenant_id] = {
                        'api_usage': {},
                        'total_requests': 0,
                        'active_modules': [],
                        'health_score': 100,
                        'status': 'healthy'
                    }

                analysis['tenants'][tenant_id]['api_usage'][api_module] = value
                analysis['tenants'][tenant_id]['total_requests'] += value

                if api_module not in analysis['tenants'][tenant_id]['active_modules']:
                    analysis['tenants'][tenant_id]['active_modules'].append(api_module)

            # Analisar saúde das APIs modulares
            api_modules = ['crm', 'whatsapp', 'agendamento', 'financeiro', 'marketing', 'analytics', 'portal', 'whitelabel']
            for module in api_modules:
                analysis['api_modules_health'][module] = {
                    'status': 'healthy',
                    'total_requests': 0,
                    'avg_latency': 0,
                    'error_rate': 0
                }

                # Somar requests por módulo
                for tenant_data in analysis['tenants'].values():
                    module_requests = tenant_data.get('api_usage', {}).get(module, 0)
                    analysis['api_modules_health'][module]['total_requests'] += module_requests

            # Gerar insights da IA
            analysis['insights'] = self.generate_ai_insights(analysis['tenants'], analysis['api_modules_health'])

            # Gerar recomendações da IA
            analysis['recommendations'] = self.generate_ai_recommendations(analysis['tenants'])

            # Resumo da plataforma
            analysis['platform_summary'] = {
                'total_tenants': len(analysis['tenants']),
                'active_tenants': len([t for t in analysis['tenants'].values() if t['total_requests'] > 0]),
                'most_used_api': max(analysis['api_modules_health'].items(), key=lambda x: x[1]['total_requests'])[0] if analysis['api_modules_health'] else 'none',
                'avg_health_score': round(sum(t['health_score'] for t in analysis['tenants'].values()) / len(analysis['tenants']), 2) if analysis['tenants'] else 100
            }

            return analysis

        except Exception as e:
            logger.error(f"Erro na análise: {e}")
            return analysis

    def generate_ai_insights(self, tenants_data, api_health):
        """IA gera insights baseados nos dados"""
        insights = []

        try:
            # Insight: Tenants mais ativos
            most_active = sorted(
                tenants_data.items(),
                key=lambda x: x[1].get('total_requests', 0),
                reverse=True
            )[:3]

            if most_active:
                insights.append({
                    'type': 'most_active_tenants',
                    'data': [{'tenant_id': t[0], 'requests': t[1].get('total_requests', 0)} for t in most_active],
                    'description': 'Top 3 tenants mais ativos por volume de requests'
                })

            # Insight: APIs mais utilizadas
            most_used_apis = sorted(api_health.items(), key=lambda x: x[1]['total_requests'], reverse=True)[:3]

            if most_used_apis:
                insights.append({
                    'type': 'most_used_apis',
                    'data': [{'api': api, 'requests': data['total_requests']} for api, data in most_used_apis],
                    'description': 'APIs com maior volume de uso na plataforma'
                })

            return insights

        except Exception as e:
            logger.error(f"Erro ao gerar insights: {e}")
            return insights

    def generate_ai_recommendations(self, tenants_data):
        """IA gera recomendações de otimização"""
        recommendations = []

        try:
            for tenant_id, data in tenants_data.items():
                # Recomendação: Tenant inativo
                if data.get('total_requests', 0) == 0:
                    recommendations.append({
                        'tenant_id': tenant_id,
                        'type': 'tenant_inactive',
                        'description': f'Tenant {tenant_id} sem atividade - verificar status',
                        'priority': 'medium'
                    })

                # Recomendação: Poucos módulos ativos
                active_modules = len(data.get('active_modules', []))
                if 0 < active_modules < 3:
                    recommendations.append({
                        'tenant_id': tenant_id,
                        'type': 'low_module_adoption',
                        'description': f'Tenant {tenant_id} usa apenas {active_modules} módulos - oportunidade de upselling',
                        'priority': 'low'
                    })

                # Recomendação: Alto volume de requests
                if data.get('total_requests', 0) > 100:
                    recommendations.append({
                        'tenant_id': tenant_id,
                        'type': 'high_usage',
                        'description': f'Tenant {tenant_id} com alto volume - considerar upgrade de plano',
                        'priority': 'high'
                    })

            return recommendations

        except Exception as e:
            logger.error(f"Erro ao gerar recomendações: {e}")
            return recommendations

def main():
    ai_metrics = MultiTenantMetricsAI()

    try:
        logger.info("🤖 IA Multi-Tenant Metrics iniciando...")

        # Coletar e analisar métricas
        analysis = ai_metrics.collect_tenant_metrics()

        if analysis:
            # Salvar relatório
            with open('/opt/kryonix/logs/multi-tenant-metrics-ai.json', 'w') as f:
                json.dump(analysis, f, indent=2)

            # Log summary
            summary = analysis.get('platform_summary', {})
            logger.info(f"📊 Tenants: {summary.get('total_tenants', 0)}, Ativos: {summary.get('active_tenants', 0)}, API mais usada: {summary.get('most_used_api', 'N/A')}")

        logger.info("✅ IA Multi-Tenant Metrics executada com sucesso")

    except Exception as e:
        logger.error(f"❌ Erro na execução da IA: {e}")

if __name__ == "__main__":
    main()
EOF

chmod +x monitoring/scripts/multi-tenant-metrics-ai.py

# Instalar dependências Python
pip3 install requests psycopg2-binary numpy

# === CONFIGURAR DASHBOARDS GRAFANA MULTI-TENANT ===
echo "📊 Configurando dashboards Grafana por tenant..."
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

# === CONFIGURAÇÕES FINAIS DE DATASOURCES GRAFANA ===
echo "🔌 Configurando todos os datasources Grafana..."

# Prometheus Datasource Principal
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

# PostgreSQL Datasource
curl -X POST \
  http://kryonix:Vitor@123456@localhost:3000/api/datasources \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "PostgreSQL-KRYONIX",
    "type": "postgres",
    "url": "postgresql-kryonix:5432",
    "access": "proxy",
    "database": "kryonix_master",
    "user": "kryonix",
    "secureJsonData": {
      "password": "Vitor@123456"
    }
  }'

# Redis Datasource
curl -X POST \
  http://kryonix:Vitor@123456@localhost:3000/api/datasources \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Redis-KRYONIX",
    "type": "redis-datasource",
    "url": "redis://redis-kryonix:6379",
    "access": "proxy"
  }'

# === CRIAR DASHBOARDS COMPLETOS ===
echo "📊 Criando dashboards multi-tenant completos..."

# Dashboard Principal Multi-Tenant Overview
cat > monitoring/dashboards/kryonix-overview.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "KRYONIX Multi-Tenant Overview",
    "tags": ["kryonix", "multi-tenant", "overview"],
    "style": "dark",
    "timezone": "America/Sao_Paulo",
    "panels": [
      {
        "id": 1,
        "title": "Tenants Ativos",
        "type": "stat",
        "targets": [
          {
            "expr": "count(count by (tenant_id) (kryonix_tenant_payment_status{status=\"paid\"}))",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {"mode": "thresholds"},
            "thresholds": {
              "steps": [
                {"color": "red", "value": 0},
                {"color": "yellow", "value": 10},
                {"color": "green", "value": 20}
              ]
            },
            "unit": "short"
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Status das 8 APIs",
        "type": "table",
        "targets": [
          {
            "expr": "up{job=~\"kryonix-api.*\"}",
            "refId": "A",
            "format": "table"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "custom": {"displayMode": "color-background"},
            "mappings": [
              {
                "options": {
                  "0": {"color": "red", "text": "OFFLINE"},
                  "1": {"color": "green", "text": "ONLINE"}
                },
                "type": "value"
              }
            ]
          }
        },
        "gridPos": {"h": 12, "w": 12, "x": 6, "y": 0}
      },
      {
        "id": 3,
        "title": "Performance Mobile (FPS)",
        "type": "timeseries",
        "targets": [
          {
            "expr": "avg(mobile_fps_average) by (tenant_id)",
            "refId": "A"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {"mode": "palette-classic"},
            "custom": {
              "drawStyle": "line",
              "lineInterpolation": "smooth",
              "pointSize": 3,
              "fillOpacity": 20
            },
            "min": 0,
            "max": 60,
            "unit": "fps"
          }
        },
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8}
      }
    ],
    "time": {"from": "now-1h", "to": "now"},
    "refresh": "30s"
  }
}
EOF

# Importar dashboard
curl -X POST \
  http://kryonix:Vitor@123456@localhost:3000/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @monitoring/dashboards/kryonix-overview.json

# Dashboard APIs Health
cat > monitoring/dashboards/apis-health.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "KRYONIX APIs Health Dashboard",
    "tags": ["kryonix", "apis", "health"],
    "style": "dark",
    "panels": [
      {
        "id": 1,
        "title": "CRM API",
        "type": "stat",
        "targets": [{"expr": "up{job=\"kryonix-api-crm\"}", "refId": "A"}],
        "fieldConfig": {
          "defaults": {
            "mappings": [
              {
                "options": {
                  "0": {"text": "OFFLINE"},
                  "1": {"text": "ONLINE"}
                },
                "type": "value"
              }
            ]
          }
        },
        "gridPos": {"h": 4, "w": 3, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "WhatsApp API",
        "type": "stat",
        "targets": [{"expr": "up{job=\"kryonix-api-whatsapp\"}", "refId": "A"}],
        "fieldConfig": {
          "defaults": {
            "mappings": [
              {
                "options": {
                  "0": {"text": "OFFLINE"},
                  "1": {"text": "ONLINE"}
                },
                "type": "value"
              }
            ]
          }
        },
        "gridPos": {"h": 4, "w": 3, "x": 3, "y": 0}
      }
    ],
    "time": {"from": "now-1h", "to": "now"},
    "refresh": "30s"
  }
}
EOF

# Importar dashboard APIs
curl -X POST \
  http://kryonix:Vitor@123456@localhost:3000/api/dashboards/db \
  -H 'Content-Type: application/json' \
  -d @monitoring/dashboards/apis-health.json

# === SCRIPTS DE AUTOMAÇÃO ===
echo "🤖 Criando scripts de automação..."

# Script de health checks automatizados
cat > monitoring/scripts/health-checks.py << 'EOF'
#!/usr/bin/env python3
import requests
import logging
import json
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_all_apis():
    apis = {
        'prometheus': 'http://localhost:9090/-/healthy',
        'grafana': 'http://localhost:3000/api/health',
        'alertmanager': 'http://localhost:9093/-/healthy'
    }

    results = {}
    for name, url in apis.items():
        try:
            response = requests.get(url, timeout=5)
            results[name] = {
                'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                'response_time': response.elapsed.total_seconds(),
                'timestamp': datetime.now().isoformat()
            }
            logger.info(f"✅ {name}: OK ({response.elapsed.total_seconds():.2f}s)")
        except Exception as e:
            results[name] = {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            logger.error(f"❌ {name}: {e}")

    # Salvar resultados
    with open('/opt/kryonix/logs/health-check.json', 'w') as f:
        json.dump(results, f, indent=2)

    return results

if __name__ == "__main__":
    check_all_apis()
EOF

chmod +x monitoring/scripts/health-checks.py

# Script de backup automático
cat > monitoring/scripts/backup-configs.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/monitoring"

echo "💾 Iniciando backup do monitoramento..."
mkdir -p ${BACKUP_DIR}

# Backup configurações
tar -czf ${BACKUP_DIR}/monitoring_configs_${TIMESTAMP}.tar.gz \
  monitoring/prometheus/ \
  monitoring/grafana/ \
  monitoring/alertmanager/ \
  monitoring/scripts/

# Backup banco Grafana
docker exec postgresql-kryonix pg_dump -U grafana grafana_mobile > ${BACKUP_DIR}/grafana_db_${TIMESTAMP}.sql

echo "✅ Backup concluído: ${BACKUP_DIR}/monitoring_configs_${TIMESTAMP}.tar.gz"
EOF

chmod +x monitoring/scripts/backup-configs.sh

# === CONFIGURAR CRON JOBS ===
echo "⏰ Configurando automação..."
(crontab -l 2>/dev/null; cat << 'EOF'
# KRYONIX Monitoring Automation
*/5 * * * * /usr/bin/python3 /opt/kryonix/monitoring/scripts/health-checks.py >> /opt/kryonix/logs/health.log 2>&1
*/15 * * * * /usr/bin/python3 /opt/kryonix/monitoring/scripts/multi-tenant-metrics-ai.py >> /opt/kryonix/logs/ai-metrics.log 2>&1
0 3 * * 0 /bin/bash /opt/kryonix/monitoring/scripts/backup-configs.sh >> /opt/kryonix/logs/backup.log 2>&1
EOF
) | crontab -

# === INTEGRAÇÃO WHATSAPP ALERTS ===
echo "📱 Configurando alertas WhatsApp..."
curl -X POST http://evolution:8080/webhook/setup \
  -H 'Content-Type: application/json' \
  -d '{
    "webhook": "http://alertmanager:9093/webhook",
    "phone": "+5517981805327"
  }'

# === VALIDAÇÃO FINAL ===
echo "🔍 Executando validação final..."
sleep 15

# Testar health checks
python3 monitoring/scripts/health-checks.py

# Testar análise IA
python3 monitoring/scripts/multi-tenant-metrics-ai.py

# Verificar dashboards
DASHBOARDS_COUNT=$(curl -s -u kryonix:Vitor@123456 http://localhost:3000/api/search | jq length)
echo "📊 Dashboards configurados: ${DASHBOARDS_COUNT}"

# Verificar datasources
DATASOURCES_COUNT=$(curl -s -u kryonix:Vitor@123456 http://localhost:3000/api/datasources | jq length)
echo "🔌 Datasources configurados: ${DATASOURCES_COUNT}"

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

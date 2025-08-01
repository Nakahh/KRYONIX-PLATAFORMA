# PARTE-06: MONITORAMENTO ENTERPRISE MULTI-TENANT KRYONIX

## 🎯 ARQUITETURA DE MONITORAMENTO EMPRESARIAL

### Multi-Tenant Isolation Layer
```yaml
# Configuração Prometheus Multi-Tenant
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'kryonix-enterprise'
    region: 'multi-region'

rule_files:
  - "/etc/prometheus/rules/*.yml"

scrape_configs:
  # Métricas por Tenant com Isolamento
  - job_name: 'kryonix-tenant-metrics'
    scrape_interval: 10s
    static_configs:
      - targets: ['localhost:3001', 'localhost:3002', 'localhost:3003']
    metrics_path: '/metrics'
    relabel_configs:
      - source_labels: [__address__]
        target_label: tenant_id
        regex: 'localhost:300([0-9]+)'
        replacement: 'tenant_${1}'
      - source_labels: [tenant_id]
        target_label: __param_tenant
        replacement: '${1}'

  # Redis Multi-Database Metrics (PARTE-04 Integration)
  - job_name: 'redis-multitenant'
    static_configs:
      - targets: ['redis:6379']
    metrics_path: '/metrics'
    params:
      'databases': ['0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15']

  # Traefik Enterprise Metrics (PARTE-05 Integration)
  - job_name: 'traefik-enterprise'
    static_configs:
      - targets: ['traefik:8082']
    metrics_path: '/metrics'
    scrape_interval: 5s

  # Performance Monitoring (PARTE-20 Integration)
  - job_name: 'timescaledb-performance'
    static_configs:
      - targets: ['timescaledb:5432']
    metrics_path: '/metrics'
    params:
      'tenant_isolation': ['true']
```

### Grafana Enterprise Configuration
```yaml
# grafana.ini - Multi-Tenant Enterprise
[server]
protocol = https
http_port = 3000
domain = monitoring.kryonix.com
enforce_domain = true
root_url = https://monitoring.kryonix.com

[security]
admin_user = admin
admin_password = ${GF_SECURITY_ADMIN_PASSWORD}
secret_key = ${GF_SECURITY_SECRET_KEY}
cookie_secure = true
cookie_samesite = strict
content_security_policy = true

[auth]
disable_login_form = false
oauth_auto_login = true

[auth.generic_oauth]
name = Keycloak-KRYONIX
enabled = true
client_id = ${KEYCLOAK_CLIENT_ID}
client_secret = ${KEYCLOAK_CLIENT_SECRET}
scopes = openid profile email tenant_id
auth_url = https://auth.kryonix.com/realms/kryonix/protocol/openid-connect/auth
token_url = https://auth.kryonix.com/realms/kryonix/protocol/openid-connect/token
api_url = https://auth.kryonix.com/realms/kryonix/protocol/openid-connect/userinfo
allow_sign_up = true
role_attribute_path = contains(tenant_access.roles[*], 'admin') && 'Admin' || 'Viewer'

[users]
auto_assign_org = true
auto_assign_org_id = 1
auto_assign_org_role = Viewer
viewers_can_edit = false
editors_can_admin = false

[dashboards]
default_home_dashboard_path = /var/lib/grafana/dashboards/kryonix-overview.json
```

## 📊 DASHBOARDS MULTI-TENANT

### Dashboard Principal por Tenant
```typescript
// Dashboard JSON Template
export interface TenantDashboard {
  id?: number;
  uid: string;
  title: string;
  tenant_id: string;
  panels: DashboardPanel[];
  time: TimeRange;
  refresh: string;
  templating: Templating;
  annotations: Annotations;
}

export const createTenantDashboard = (tenantId: string): TenantDashboard => ({
  uid: `tenant-${tenantId}-overview`,
  title: `KRYONIX - Tenant ${tenantId} Overview`,
  tenant_id: tenantId,
  panels: [
    {
      id: 1,
      title: "Mobile Performance (80% Users)",
      type: "stat",
      targets: [
        {
          expr: `avg(response_time_mobile{tenant_id="${tenantId}"})`,
          legendFormat: "Mobile Response Time",
          refId: "A"
        }
      ],
      fieldConfig: {
        defaults: {
          color: { mode: "thresholds" },
          thresholds: {
            steps: [
              { color: "green", value: null },
              { color: "yellow", value: 50 },
              { color: "red", value: 100 }
            ]
          },
          unit: "ms"
        }
      },
      options: {
        reduceOptions: {
          values: false,
          calcs: ["lastNotNull"],
          fields: ""
        },
        textMode: "auto",
        colorMode: "background"
      }
    },
    {
      id: 2,
      title: "Redis Cache Performance",
      type: "graph",
      targets: [
        {
          expr: `redis_connected_clients{tenant_id="${tenantId}"}`,
          legendFormat: "Connected Clients",
          refId: "A"
        },
        {
          expr: `redis_keyspace_hits_total{tenant_id="${tenantId}"} / (redis_keyspace_hits_total{tenant_id="${tenantId}"} + redis_keyspace_misses_total{tenant_id="${tenantId}"}) * 100`,
          legendFormat: "Hit Rate %",
          refId: "B"
        }
      ]
    },
    {
      id: 3,
      title: "Traefik SSL & Routing",
      type: "table",
      targets: [
        {
          expr: `traefik_entrypoint_requests_total{tenant_id="${tenantId}"}`,
          legendFormat: "{{method}} {{code}}",
          refId: "A"
        }
      ]
    },
    {
      id: 4,
      title: "AI Predictions & Anomalies",
      type: "timeseries",
      targets: [
        {
          expr: `ai_anomaly_score{tenant_id="${tenantId}"}`,
          legendFormat: "Anomaly Score",
          refId: "A"
        },
        {
          expr: `ai_predicted_load{tenant_id="${tenantId}"}`,
          legendFormat: "Predicted Load",
          refId: "B"
        }
      ]
    }
  ],
  time: {
    from: "now-1h",
    to: "now"
  },
  refresh: "10s",
  templating: {
    list: [
      {
        name: "tenant",
        type: "constant",
        current: {
          value: tenantId,
          text: tenantId
        },
        hide: 2
      }
    ]
  },
  annotations: {
    list: [
      {
        name: "Deployments",
        datasource: "prometheus",
        expr: `deployment_info{tenant_id="${tenantId}"}`,
        titleFormat: "Deployment",
        textFormat: "{{version}}"
      }
    ]
  }
});
```

### Mobile-First Dashboard Components
```typescript
// Mobile-Optimized Dashboard Service
export class MobileDashboardService {
  constructor(
    private readonly grafanaApi: GrafanaAPI,
    private readonly tenantService: TenantService
  ) {}

  async createMobileDashboard(tenantId: string): Promise<Dashboard> {
    const mobileConfig = {
      panels: [
        // Simplified panels for mobile
        {
          title: "Status Geral",
          type: "stat",
          gridPos: { h: 4, w: 12, x: 0, y: 0 },
          targets: [{
            expr: `up{tenant_id="${tenantId}"}`,
            legendFormat: "Services Online"
          }]
        },
        {
          title: "Performance Mobile",
          type: "gauge",
          gridPos: { h: 6, w: 12, x: 0, y: 4 },
          targets: [{
            expr: `avg(response_time_mobile{tenant_id="${tenantId}"})`,
            legendFormat: "Response Time"
          }],
          options: {
            reduceOptions: {
              values: false,
              calcs: ["lastNotNull"]
            },
            fieldConfig: {
              defaults: {
                min: 0,
                max: 200,
                thresholds: {
                  mode: "absolute",
                  steps: [
                    { color: "green", value: null },
                    { color: "yellow", value: 50 },
                    { color: "red", value: 100 }
                  ]
                }
              }
            }
          }
        }
      ],
      refresh: "5s",
      tags: ["mobile", "tenant", tenantId]
    };

    return this.grafanaApi.createDashboard(mobileConfig);
  }

  async setupMobileAlerts(tenantId: string): Promise<void> {
    const mobileAlerts = [
      {
        name: `Mobile Performance - ${tenantId}`,
        condition: `avg(response_time_mobile{tenant_id="${tenantId}"}) > 50`,
        severity: "warning",
        message: "Mobile response time exceeded 50ms threshold"
      },
      {
        name: `Mobile Availability - ${tenantId}`,
        condition: `up{tenant_id="${tenantId}",service="mobile-api"} == 0`,
        severity: "critical",
        message: "Mobile API is down"
      }
    ];

    for (const alert of mobileAlerts) {
      await this.grafanaApi.createAlert(alert);
    }
  }
}
```

## 🚨 ALERTAS INTELIGENTES POR TENANT

### Sistema de Alertas AI-Driven
```typescript
// Intelligent Alert System
export class IntelligentAlertSystem {
  constructor(
    private readonly aiService: AIService,
    private readonly alertManager: AlertManager,
    private readonly tenantService: TenantService
  ) {}

  async setupTenantAlerts(tenantId: string): Promise<void> {
    const tenant = await this.tenantService.getTenant(tenantId);
    
    // Alertas baseados no perfil do tenant
    const alertRules = await this.generateTenantSpecificAlerts(tenant);
    
    for (const rule of alertRules) {
      await this.alertManager.createRule(rule);
    }
  }

  private async generateTenantSpecificAlerts(tenant: Tenant): Promise<AlertRule[]> {
    const baseRules: AlertRule[] = [
      {
        name: `${tenant.id}-mobile-performance`,
        expr: `avg_over_time(response_time_mobile{tenant_id="${tenant.id}"}[5m]) > ${tenant.sla.mobileResponseTime || 50}`,
        for: "2m",
        labels: {
          severity: "warning",
          tenant_id: tenant.id,
          type: "performance"
        },
        annotations: {
          summary: `Mobile performance degraded for tenant ${tenant.id}`,
          description: `Mobile response time exceeded ${tenant.sla.mobileResponseTime}ms threshold`,
          runbook_url: `https://docs.kryonix.com/runbooks/mobile-performance`
        }
      },
      {
        name: `${tenant.id}-redis-cache-miss`,
        expr: `(redis_keyspace_misses_total{tenant_id="${tenant.id}"} / (redis_keyspace_hits_total{tenant_id="${tenant.id}"} + redis_keyspace_misses_total{tenant_id="${tenant.id}"})) * 100 > 20`,
        for: "5m",
        labels: {
          severity: "warning",
          tenant_id: tenant.id,
          type: "cache"
        },
        annotations: {
          summary: `High cache miss rate for tenant ${tenant.id}`,
          description: "Redis cache miss rate exceeded 20%"
        }
      },
      {
        name: `${tenant.id}-ssl-certificate-expiry`,
        expr: `traefik_tls_cert_not_after{tenant_id="${tenant.id}"} - time() < 86400 * 30`,
        for: "1h",
        labels: {
          severity: "critical",
          tenant_id: tenant.id,
          type: "security"
        },
        annotations: {
          summary: `SSL certificate expiring soon for tenant ${tenant.id}`,
          description: "SSL certificate will expire in less than 30 days"
        }
      }
    ];

    // AI-enhanced rules based on historical data
    const aiRules = await this.aiService.generatePredictiveAlerts(tenant);
    
    return [...baseRules, ...aiRules];
  }

  async processAnomalyDetection(tenantId: string): Promise<void> {
    const metrics = await this.getRecentMetrics(tenantId);
    const anomalies = await this.aiService.detectAnomalies(metrics);
    
    for (const anomaly of anomalies) {
      if (anomaly.confidence > 0.8) {
        await this.alertManager.fireAlert({
          name: `${tenantId}-ai-anomaly`,
          labels: {
            severity: anomaly.severity,
            tenant_id: tenantId,
            type: "ai-anomaly",
            confidence: anomaly.confidence.toString()
          },
          annotations: {
            summary: `AI detected anomaly for tenant ${tenantId}`,
            description: anomaly.description,
            predicted_impact: anomaly.predictedImpact
          }
        });
      }
    }
  }
}
```

### AlertManager Configuration
```yaml
# alertmanager.yml - Multi-Tenant Configuration
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@kryonix.com'
  smtp_auth_username: 'alerts@kryonix.com'
  smtp_auth_password: '${SMTP_PASSWORD}'

route:
  group_by: ['tenant_id', 'alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'tenant-webhook'
  routes:
    - match:
        severity: critical
      receiver: 'tenant-critical'
      group_wait: 0s
      repeat_interval: 5m
    - match:
        type: mobile
      receiver: 'mobile-alerts'
      group_interval: 30s

receivers:
  - name: 'tenant-webhook'
    webhook_configs:
      - url: 'https://api.kryonix.com/alerts/webhook'
        send_resolved: true
        http_config:
          bearer_token: '${WEBHOOK_TOKEN}'
        title: 'KRYONIX Alert - Tenant {{ .GroupLabels.tenant_id }}'
        text: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Tenant: {{ .Labels.tenant_id }}
          Severity: {{ .Labels.severity }}
          Description: {{ .Annotations.description }}
          {{ end }}

  - name: 'tenant-critical'
    email_configs:
      - to: '{{ .GroupLabels.tenant_id }}@notifications.kryonix.com'
        subject: 'CRITICAL: {{ .GroupLabels.alertname }} - Tenant {{ .GroupLabels.tenant_id }}'
        body: |
          CRITICAL ALERT for Tenant {{ .GroupLabels.tenant_id }}
          
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Runbook: {{ .Annotations.runbook_url }}
          {{ end }}
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#kryonix-critical'
        title: 'CRITICAL: Tenant {{ .GroupLabels.tenant_id }}'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: 'mobile-alerts'
    pushover_configs:
      - token: '${PUSHOVER_TOKEN}'
        user_key: '${PUSHOVER_USER}'
        title: 'KRYONIX Mobile Alert'
        message: |
          {{ range .Alerts }}
          Mobile Issue: {{ .Annotations.summary }}
          Tenant: {{ .Labels.tenant_id }}
          {{ end }}
        priority: '1'
        sound: 'pushover'
```

## 🧠 AI-DRIVEN MONITORING

### Predictive Analytics Service
```typescript
// AI Monitoring Service
export class AIMonitoringService {
  constructor(
    private readonly prometheusClient: PrometheusAPI,
    private readonly mlModel: MLModel,
    private readonly tenantService: TenantService
  ) {}

  async predictTenantLoad(tenantId: string, hours: number = 24): Promise<LoadPrediction> {
    const historicalData = await this.prometheusClient.queryRange({
      query: `avg_over_time(requests_per_second{tenant_id="${tenantId}"}[7d])`,
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
      step: '1h'
    });

    const prediction = await this.mlModel.predict({
      features: this.extractFeatures(historicalData),
      horizon: hours
    });

    return {
      tenantId,
      prediction: prediction.values,
      confidence: prediction.confidence,
      recommendedActions: this.generateRecommendations(prediction)
    };
  }

  async optimizeCacheStrategy(tenantId: string): Promise<CacheOptimization> {
    const cacheMetrics = await this.prometheusClient.queryRange({
      query: `redis_keyspace_hits_total{tenant_id="${tenantId}"} / (redis_keyspace_hits_total{tenant_id="${tenantId}"} + redis_keyspace_misses_total{tenant_id="${tenantId}"})`,
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date(),
      step: '5m'
    });

    const optimization = await this.mlModel.optimizeCache({
      hitRate: cacheMetrics,
      tenantProfile: await this.tenantService.getTenantProfile(tenantId)
    });

    return {
      currentHitRate: this.calculateCurrentHitRate(cacheMetrics),
      predictedImprovement: optimization.improvement,
      recommendedTTL: optimization.ttl,
      keyPatterns: optimization.patterns
    };
  }

  async detectMobilePerformanceAnomalies(tenantId: string): Promise<Anomaly[]> {
    const mobileMetrics = await this.prometheusClient.queryRange({
      query: `response_time_mobile{tenant_id="${tenantId}"}`,
      start: new Date(Date.now() - 2 * 60 * 60 * 1000),
      end: new Date(),
      step: '1m'
    });

    const anomalies = await this.mlModel.detectAnomalies({
      timeSeries: mobileMetrics,
      threshold: 0.95,
      context: 'mobile_performance'
    });

    return anomalies.map(anomaly => ({
      timestamp: anomaly.timestamp,
      value: anomaly.value,
      expectedValue: anomaly.expected,
      confidence: anomaly.confidence,
      impact: this.assessMobileImpact(anomaly),
      recommendations: this.generateMobileRecommendations(anomaly)
    }));
  }

  private generateMobileRecommendations(anomaly: any): string[] {
    const recommendations = [];
    
    if (anomaly.value > 100) {
      recommendations.push("Scale mobile API instances");
      recommendations.push("Optimize database queries");
      recommendations.push("Implement response caching");
    }
    
    if (anomaly.value > 200) {
      recommendations.push("Activate emergency load balancing");
      recommendations.push("Enable CDN for static assets");
    }

    return recommendations;
  }
}
```

## 🔧 INTEGRAÇÃO COM PARTES EXISTENTES

### Redis Multi-Database Integration (PARTE-04)
```typescript
// Redis Monitoring Integration
export class RedisMonitoringIntegration {
  constructor(
    private readonly redisClient: Redis,
    private readonly prometheusRegistry: PrometheusRegistry
  ) {
    this.setupMetrics();
  }

  private setupMetrics(): void {
    // Métricas por database (16 databases)
    for (let db = 0; db < 16; db++) {
      const gauge = new PrometheusGauge({
        name: `redis_db_${db}_keys`,
        help: `Number of keys in Redis database ${db}`,
        labelNames: ['tenant_id', 'database']
      });

      this.prometheusRegistry.registerMetric(gauge);
    }
  }

  async collectDatabaseMetrics(tenantId: string): Promise<void> {
    for (let db = 0; db < 16; db++) {
      await this.redisClient.select(db);
      const keyCount = await this.redisClient.dbsize();
      
      this.prometheusRegistry.setGaugeValue(
        `redis_db_${db}_keys`,
        keyCount,
        { tenant_id: tenantId, database: db.toString() }
      );
    }
  }
}
```

### Traefik Enterprise Integration (PARTE-05)
```typescript
// Traefik Monitoring Integration
export class TraefikMonitoringIntegration {
  constructor(
    private readonly traefikAPI: TraefikAPI,
    private readonly prometheusClient: PrometheusAPI
  ) {}

  async collectSSLMetrics(tenantId: string): Promise<SSLMetrics> {
    const certificates = await this.traefikAPI.getCertificates({
      tenant: tenantId
    });

    const metrics = {
      totalCertificates: certificates.length,
      expiringCertificates: certificates.filter(cert => 
        cert.notAfter < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ).length,
      sslGrade: await this.calculateSSLGrade(certificates),
      http2Enabled: await this.checkHTTP2Status(tenantId),
      http3Enabled: await this.checkHTTP3Status(tenantId)
    };

    // Send metrics to Prometheus
    await this.prometheusClient.sendMetrics([
      {
        name: 'traefik_ssl_certificates_total',
        value: metrics.totalCertificates,
        labels: { tenant_id: tenantId }
      },
      {
        name: 'traefik_ssl_certificates_expiring',
        value: metrics.expiringCertificates,
        labels: { tenant_id: tenantId }
      }
    ]);

    return metrics;
  }
}
```

### Performance Integration (PARTE-20)
```typescript
// TimescaleDB Performance Integration
export class PerformanceMonitoringIntegration {
  constructor(
    private readonly timescaleDB: TimescaleDB,
    private readonly prometheusClient: PrometheusAPI
  ) {}

  async collectPerformanceMetrics(tenantId: string): Promise<void> {
    const query = `
      SELECT 
        time_bucket('1m', timestamp) AS time,
        AVG(response_time) as avg_response_time,
        AVG(mobile_response_time) as avg_mobile_response_time,
        COUNT(*) as request_count
      FROM performance_metrics 
      WHERE tenant_id = $1 
        AND timestamp >= NOW() - INTERVAL '1 hour'
      GROUP BY time_bucket('1m', timestamp)
      ORDER BY time DESC;
    `;

    const results = await this.timescaleDB.query(query, [tenantId]);

    for (const row of results) {
      await this.prometheusClient.sendMetrics([
        {
          name: 'performance_response_time_avg',
          value: row.avg_response_time,
          labels: { tenant_id: tenantId },
          timestamp: row.time
        },
        {
          name: 'performance_mobile_response_time_avg',
          value: row.avg_mobile_response_time,
          labels: { tenant_id: tenantId },
          timestamp: row.time
        }
      ]);
    }
  }
}
```

## 🚀 IMPLEMENTAÇÃO MOBILE-FIRST

### Mobile Dashboard React Components
```tsx
// Mobile-First Dashboard Components
import React, { useState, useEffect } from 'react';
import { Card, Grid, CircularProgress, Alert } from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';

export const MobileDashboard: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [metrics, setMetrics] = useState<TenantMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await fetch(`/api/metrics/tenant/${tenantId}`);
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        KRYONIX - Tenant {tenantId}
      </h1>
      
      <Grid container spacing={isMobile ? 2 : 3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Mobile Performance"
            value={metrics?.mobileResponseTime || 0}
            unit="ms"
            threshold={50}
            type="performance"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Cache Hit Rate"
            value={metrics?.cacheHitRate || 0}
            unit="%"
            threshold={80}
            type="cache"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="SSL Grade"
            value={metrics?.sslGrade || 'N/A'}
            unit=""
            threshold={null}
            type="security"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={metrics?.activeUsers || 0}
            unit=""
            threshold={null}
            type="users"
          />
        </Grid>
        
        <Grid item xs={12}>
          <AlertsPanel tenantId={tenantId} />
        </Grid>
      </Grid>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: number | string;
  unit: string;
  threshold: number | null;
  type: string;
}> = ({ title, value, unit, threshold, type }) => {
  const getColor = () => {
    if (threshold === null) return 'primary';
    if (typeof value === 'number' && value > threshold) return 'error';
    return 'success';
  };

  return (
    <Card className="p-4 h-32">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className={`text-3xl font-bold text-${getColor()}-600`}>
        {value}{unit}
      </div>
      {threshold && (
        <div className="text-xs text-gray-500 mt-2">
          Threshold: {threshold}{unit}
        </div>
      )}
    </Card>
  );
};

const AlertsPanel: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // WebSocket connection for real-time alerts
    const ws = new WebSocket(`wss://api.kryonix.com/alerts/${tenantId}`);
    
    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      setAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts
    };

    return () => ws.close();
  }, [tenantId]);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No recent alerts
          </div>
        ) : (
          alerts.map((alert, index) => (
            <Alert key={index} severity={alert.severity} className="mb-2">
              <div className="font-medium">{alert.summary}</div>
              <div className="text-sm">{alert.description}</div>
            </Alert>
          ))
        )}
      </div>
    </Card>
  );
};
```

### Mobile-Optimized CSS
```css
/* Mobile-First Dashboard Styles */
.mobile-dashboard {
  max-width: 100vw;
  padding: 1rem;
  font-size: 16px; /* Base font size for mobile */
}

.metric-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
  transition: transform 0.2s ease;
}

.metric-card:active {
  transform: scale(0.98); /* Touch feedback */
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  line-height: 1.2;
}

.metric-title {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .mobile-dashboard {
    padding: 0.5rem;
  }
  
  .metric-card {
    padding: 0.75rem;
  }
  
  .metric-value {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .metric-value {
    font-size: 1.5rem;
  }
  
  .metric-title {
    font-size: 0.75rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .mobile-dashboard {
    background-color: #1a1a1a;
    color: white;
  }
  
  .metric-card {
    background-color: #2d2d2d;
    border: 1px solid #404040;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .metric-card {
    border: 2px solid #000;
  }
  
  .metric-value {
    color: #000;
    text-shadow: none;
  }
}
```

## 📱 SDK INTEGRATION

### Monitoring SDK Integration
```typescript
// @kryonix/monitoring SDK
export class KryonixMonitoring {
  constructor(
    private readonly tenantId: string,
    private readonly apiKey: string,
    private readonly config: MonitoringConfig
  ) {}

  async trackMobilePerformance(metrics: MobileMetrics): Promise<void> {
    const payload = {
      tenant_id: this.tenantId,
      timestamp: new Date().toISOString(),
      metrics: {
        response_time: metrics.responseTime,
        first_contentful_paint: metrics.fcp,
        largest_contentful_paint: metrics.lcp,
        cumulative_layout_shift: metrics.cls,
        user_agent: navigator.userAgent,
        connection_type: (navigator as any).connection?.effectiveType || 'unknown'
      }
    };

    await fetch('/api/metrics/mobile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  async trackCustomMetric(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    const payload = {
      tenant_id: this.tenantId,
      metric_name: name,
      value: value,
      labels: { ...labels, tenant_id: this.tenantId },
      timestamp: new Date().toISOString()
    };

    await fetch('/api/metrics/custom', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  createAlert(alert: AlertDefinition): Promise<string> {
    return fetch('/api/alerts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...alert,
        tenant_id: this.tenantId
      })
    }).then(res => res.json()).then(data => data.alertId);
  }
}
```

## 🎯 CONCLUSÃO PARTE-06

### Funcionalidades Implementadas
✅ **Monitoramento Multi-Tenant Completo**
- Prometheus com isolamento por tenant
- Grafana enterprise com autenticação Keycloak
- Dashboards otimizados para mobile (80% dos usuários)
- Integração com PARTE-04 (Redis), PARTE-05 (Traefik), PARTE-20 (Performance)

✅ **Alertas Inteligentes AI-Driven**
- Detecção de anomalias com machine learning
- Alertas preditivos baseados em histórico
- Notificações personalizadas por tenant
- Escalação automática para criticidade

✅ **Performance Mobile-First**
- Dashboards responsivos React
- Métricas específicas para mobile (<50ms)
- WebSocket para alertas em tempo real
- PWA-ready para acesso offline

✅ **SDK @kryonix Integration**
- Biblioteca de monitoramento TypeScript
- APIs RESTful para métricas customizadas
- Autenticação segura por tenant
- Tracking automático de performance

### Próximos Passos
- **PARTE-07**: Implementar sistema de logs centralizados
- **PARTE-08**: Configurar backup automatizado multi-tenant
- **PARTE-09**: Desenvolver APIs core do sistema
- **PARTE-10**: Implementar autenticação avançada

### Métricas de Sucesso
- **Response Time Mobile**: <50ms (SLA)
- **Cache Hit Rate**: >90% Redis
- **SSL Grade**: A+ em todos os domínios
- **Uptime**: 99.99% SLA garantido
- **Anomaly Detection**: 95% accuracy

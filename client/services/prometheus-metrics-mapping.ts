// Mapeamento de métricas Prometheus para todas as stacks KRYONIX
// Conecta métricas reais com as interfaces do sistema

export const PROMETHEUS_METRICS = {
  // Evolution API (WhatsApp)
  evolution_api: {
    messages_sent_total: "evolution_api_messages_sent_total",
    messages_received_total: "evolution_api_messages_received_total",
    response_time_seconds: "evolution_api_response_time_seconds",
    active_instances: "evolution_api_instances_active",
    webhook_errors_total: "evolution_api_webhook_errors_total",
    cpu_usage: 'node_cpu_usage_percent{service="evolution-api"}',
    memory_usage: 'node_memory_usage_percent{service="evolution-api"}',
    uptime: 'up{job="evolution-api"}',
  },

  // N8N Automation
  n8n: {
    workflows_executed_total: "n8n_workflows_executed_total",
    workflow_success_rate: "n8n_workflow_success_rate",
    execution_time_seconds: "n8n_execution_time_seconds",
    active_workflows: "n8n_workflows_active",
    errors_total: "n8n_errors_total",
    cpu_usage: 'node_cpu_usage_percent{service="n8n"}',
    memory_usage: 'node_memory_usage_percent{service="n8n"}',
    uptime: 'up{job="n8n"}',
  },

  // Typebot Chatbots
  typebot: {
    conversations_total: "typebot_conversations_total",
    messages_processed: "typebot_messages_processed_total",
    ai_requests_total: "typebot_ai_requests_total",
    response_time_seconds: "typebot_response_time_seconds",
    active_bots: "typebot_bots_active",
    cpu_usage: 'node_cpu_usage_percent{service="typebot"}',
    memory_usage: 'node_memory_usage_percent{service="typebot"}',
    uptime: 'up{job="typebot"}',
  },

  // Mautic Marketing
  mautic: {
    contacts_total: "mautic_contacts_total",
    campaigns_active: "mautic_campaigns_active",
    emails_sent_total: "mautic_emails_sent_total",
    leads_generated: "mautic_leads_generated_total",
    conversion_rate: "mautic_conversion_rate",
    cpu_usage: 'node_cpu_usage_percent{service="mautic"}',
    memory_usage: 'node_memory_usage_percent{service="mautic"}',
    uptime: 'up{job="mautic"}',
  },

  // Sistema Geral (Node Exporter)
  system: {
    cpu_usage_percent: "node_cpu_usage_percent",
    memory_usage_percent: "node_memory_usage_percent",
    disk_usage_percent: "node_disk_usage_percent",
    network_bytes_total: "node_network_transmit_bytes_total",
    uptime_seconds: "node_uptime_seconds",
    load_average: "node_load1",
  },

  // Nginx (Proxy/Load Balancer)
  nginx: {
    requests_total: "nginx_http_requests_total",
    request_duration_seconds: "nginx_http_request_duration_seconds",
    connections_active: "nginx_connections_active",
    status_codes: "nginx_http_status_codes_total",
    upstream_response_time: "nginx_upstream_response_time_seconds",
  },

  // PostgreSQL
  postgresql: {
    connections_active: "postgresql_connections_active",
    queries_total: "postgresql_queries_total",
    database_size_bytes: "postgresql_database_size_bytes",
    slow_queries_total: "postgresql_slow_queries_total",
    cache_hit_ratio: "postgresql_cache_hit_ratio",
  },

  // Redis
  redis: {
    commands_processed_total: "redis_commands_processed_total",
    memory_used_bytes: "redis_memory_used_bytes",
    connected_clients: "redis_connected_clients",
    keyspace_hits_total: "redis_keyspace_hits_total",
    operations_per_second: "redis_operations_per_second",
  },

  // MinIO (Storage)
  minio: {
    objects_total: "minio_objects_total",
    bucket_size_bytes: "minio_bucket_size_bytes",
    requests_total: "minio_requests_total",
    errors_total: "minio_errors_total",
    bandwidth_bytes: "minio_bandwidth_bytes_total",
  },

  // Grafana
  grafana: {
    active_users: "grafana_active_users",
    dashboards_total: "grafana_dashboards_total",
    queries_total: "grafana_queries_total",
    alerts_total: "grafana_alerts_total",
    response_time: "grafana_response_time_seconds",
  },
};

// Queries específicas para WhatsApp Business (Evolution API)
export const WHATSAPP_QUERIES = {
  // Mensagens enviadas hoje
  messagesSentToday: `
    increase(evolution_api_messages_sent_total[24h])
  `,

  // Taxa de resposta (últimas 24h)
  responseRate: `
    (
      increase(evolution_api_messages_received_total[24h]) / 
      increase(evolution_api_messages_sent_total[24h])
    ) * 100
  `,

  // Tempo médio de resposta
  avgResponseTime: `
    rate(evolution_api_response_time_seconds_sum[5m]) / 
    rate(evolution_api_response_time_seconds_count[5m])
  `,

  // Instâncias ativas
  activeInstances: `
    evolution_api_instances_active
  `,

  // Taxa de erro por hora
  errorRate: `
    rate(evolution_api_webhook_errors_total[1h])
  `,

  // Mensagens por minuto (últimos 5m)
  messagesPerMinute: `
    rate(evolution_api_messages_sent_total[5m]) * 60
  `,

  // Status de conexão WhatsApp
  connectionStatus: `
    evolution_api_connection_status
  `,
};

// Queries para métricas de sistema
export const SYSTEM_QUERIES = {
  // CPU usage por stack
  cpuUsageByStack: `
    100 - (avg by (service) (
      irate(node_cpu_seconds_total{mode="idle"}[5m])
    ) * 100)
  `,

  // Memória usada por serviço
  memoryUsageByService: `
    (1 - (
      node_memory_MemAvailable_bytes / 
      node_memory_MemTotal_bytes
    )) * 100
  `,

  // Requests por minuto (todas as stacks)
  requestsPerMinute: `
    sum(rate(nginx_http_requests_total[1m])) by (upstream)
  `,

  // Uptime por serviço
  uptimeByService: `
    up{job=~"evolution-api|n8n|typebot|mautic|grafana|prometheus"}
  `,

  // Latência P95 por upstream
  latencyP95: `
    histogram_quantile(0.95, 
      sum(rate(nginx_http_request_duration_seconds_bucket[5m])) 
      by (le, upstream)
    )
  `,

  // Disco disponível
  diskAvailable: `
    (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100
  `,

  // Load average
  loadAverage: `
    avg(node_load1)
  `,

  // Conexões TCP ativas
  tcpConnections: `
    node_netstat_Tcp_CurrEstab
  `,
};

// Queries para métricas de negócio
export const BUSINESS_QUERIES = {
  // PIX transactions hoje
  pixTransactionsToday: `
    increase(payment_transactions_total{method="pix"}[24h])
  `,

  // Receita total BRL (últimas 24h)
  totalRevenueBRL: `
    sum(increase(payment_revenue_total_brl[24h]))
  `,

  // Leads qualificados hoje
  qualifiedLeadsToday: `
    increase(mautic_leads_qualified_total[24h])
  `,

  // Workflows N8N executados hoje
  workflowsExecutedToday: `
    increase(n8n_workflows_executed_total[24h])
  `,

  // Taxa de sucesso N8N
  workflowSuccessRate: `
    (
      increase(n8n_workflows_success_total[24h]) /
      increase(n8n_workflows_executed_total[24h])
    ) * 100
  `,

  // Conversas Typebot iniciadas hoje
  chatConversationsToday: `
    increase(typebot_conversations_total[24h])
  `,

  // Satisfação do cliente (média móvel 7 dias)
  customerSatisfaction: `
    avg_over_time(support_satisfaction_score[7d])
  `,

  // Tickets de suporte abertos hoje
  supportTicketsToday: `
    increase(support_tickets_created_total[24h])
  `,

  // Usuários ativos (últimas 24h)
  activeUsers24h: `
    increase(kryonix_active_users_total[24h])
  `,

  // Tempo médio de resposta do sistema
  avgSystemResponseTime: `
    avg(nginx_upstream_response_time_seconds)
  `,
};

// Queries para compliance e segurança
export const COMPLIANCE_QUERIES = {
  // SSL certificates válidos
  sslCertsValid: `
    ssl_certificate_valid
  `,

  // Backups realizados (últimas 24h)
  backupsCompleted: `
    increase(backup_completed_total[24h])
  `,

  // Logs de auditoria LGPD
  lgpdAuditLogs: `
    increase(lgpd_audit_logs_total[24h])
  `,

  // Falhas de segurança
  securityFailures: `
    increase(security_failures_total[24h])
  `,

  // Acessos não autorizados
  unauthorizedAccess: `
    increase(security_unauthorized_access_total[24h])
  `,

  // Uptime SLA (99.9%)
  slaUptime: `
    avg_over_time(up[30d]) * 100
  `,
};

// Helper para construir queries dinâmicas
export function buildStackQuery(
  stackId: string,
  metric: string,
  timeRange: string = "5m",
): string {
  const stackMetrics =
    PROMETHEUS_METRICS[stackId as keyof typeof PROMETHEUS_METRICS];

  if (!stackMetrics || !stackMetrics[metric as keyof typeof stackMetrics]) {
    throw new Error(`Métrica ${metric} não encontrada para stack ${stackId}`);
  }

  const metricName = stackMetrics[metric as keyof typeof stackMetrics];

  // Determinar tipo de aggregação baseado na métrica
  if (metric.includes("total") || metric.includes("count")) {
    return `increase(${metricName}[${timeRange}])`;
  } else if (metric.includes("rate") || metric.includes("percentage")) {
    return `rate(${metricName}[${timeRange}])`;
  } else if (metric.includes("usage") || metric.includes("percent")) {
    return `avg(${metricName})`;
  } else {
    return metricName;
  }
}

// Helper para formatação de tempo brasileiro
export function formatTimeForQuery(date: Date): string {
  return (date.getTime() / 1000).toString();
}

// Intervalos comuns para queries
export const TIME_RANGES = {
  "5m": "5m",
  "15m": "15m",
  "1h": "1h",
  "6h": "6h",
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
};

export default PROMETHEUS_METRICS;

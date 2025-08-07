# ⚡ PARTE 20 - PERFORMANCE E OTIMIZAÇÃO
*Agentes Responsáveis: Performance Engineer + DevOps Expert + Frontend Architect*

## 🎯 **OBJETIVO**
Implementar otimizações completas de performance em todos os níveis da plataforma KRYONIX, incluindo frontend, backend, banco de dados, cache, CDN e monitoramento de performance em tempo real utilizando Redis, Prometheus e técnicas avançadas de otimização.

## 🏗️ **ARQUITETURA DE PERFORMANCE**
```yaml
Performance Stack:
  Frontend Optimization:
    - Code splitting automático
    - Lazy loading de componentes
    - Service Workers & PWA
    - Image optimization & WebP
    - CSS/JS minification & compression
    
  Backend Optimization:
    - Connection pooling (PgBouncer)
    - Query optimization & indexing
    - Response caching (Redis)
    - API rate limiting inteligente
    - Async processing (RabbitMQ)
    
  Infrastructure Optimization:
    - CDN global (CloudFlare)
    - Load balancing (Traefik)
    - Container optimization
    - Database tuning (PostgreSQL)
    - Memory management (Redis)
    
  Monitoring:
    - Real-time metrics (Prometheus)
    - Performance dashboards (Grafana)
    - Error tracking (Sentry integration)
    - User experience monitoring
    - Synthetic monitoring
```

## 📊 **MODELO DE DADOS PERFORMANCE**
```sql
-- Schema para métricas de performance
CREATE SCHEMA IF NOT EXISTS performance;

-- Métricas de performance por endpoint
CREATE TABLE performance.api_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE
    user_id UUID REFERENCES auth.users(id),
    company_id UUID REFERENCES auth.companies(id),
    
    -- Timing
    response_time INTEGER NOT NULL, -- em milissegundos
    db_time INTEGER DEFAULT 0, -- tempo gasto no banco
    external_api_time INTEGER DEFAULT 0, -- tempo de APIs externas
    cache_time INTEGER DEFAULT 0, -- tempo de cache
    
    -- Status
    status_code INTEGER NOT NULL,
    success BOOLEAN DEFAULT true,
    error_type VARCHAR(100),
    error_message TEXT,
    
    -- Request details
    request_size INTEGER DEFAULT 0, -- tamanho da requisição em bytes
    response_size INTEGER DEFAULT 0, -- tamanho da resposta
    user_agent TEXT,
    ip_address INET,
    
    -- Performance flags
    from_cache BOOLEAN DEFAULT false,
    cache_hit_ratio DECIMAL(5,2) DEFAULT 0,
    
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Métricas de frontend (Core Web Vitals)
CREATE TABLE performance.frontend_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação da sessão
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    company_id UUID REFERENCES auth.companies(id),
    
    -- Página
    page_url TEXT NOT NULL,
    page_title VARCHAR(255),
    
    -- Core Web Vitals
    fcp DECIMAL(8,2), -- First Contentful Paint (ms)
    lcp DECIMAL(8,2), -- Largest Contentful Paint (ms)
    fid DECIMAL(8,2), -- First Input Delay (ms)
    cls DECIMAL(8,4), -- Cumulative Layout Shift
    ttfb DECIMAL(8,2), -- Time to First Byte (ms)
    
    -- Métricas adicionais
    dom_content_loaded DECIMAL(8,2),
    load_event DECIMAL(8,2),
    page_size INTEGER, -- tamanho total da página em bytes
    resource_count INTEGER, -- número de recursos carregados
    
    -- Contexto
    connection_type VARCHAR(50), -- '4g', 'wifi', etc
    device_memory INTEGER, -- GB de RAM do dispositivo
    hardware_concurrency INTEGER, -- número de cores do CPU
    
    -- Browser info
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    operating_system VARCHAR(100),
    screen_resolution VARCHAR(20),
    
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Métricas de banco de dados
CREATE TABLE performance.database_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Query info
    query_hash VARCHAR(64) NOT NULL, -- hash MD5 da query
    query_text TEXT,
    query_type VARCHAR(50), -- SELECT, INSERT, UPDATE, DELETE
    
    -- Timing
    execution_time DECIMAL(10,3) NOT NULL, -- em milissegundos
    planning_time DECIMAL(10,3) DEFAULT 0,
    
    -- Resources
    shared_blks_hit INTEGER DEFAULT 0,
    shared_blks_read INTEGER DEFAULT 0,
    shared_blks_written INTEGER DEFAULT 0,
    temp_blks_read INTEGER DEFAULT 0,
    temp_blks_written INTEGER DEFAULT 0,
    
    -- Result info
    rows_returned INTEGER DEFAULT 0,
    rows_affected INTEGER DEFAULT 0,
    
    -- Context
    database_name VARCHAR(100),
    user_name VARCHAR(100),
    application_name VARCHAR(200),
    
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Cache performance
CREATE TABLE performance.cache_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    cache_key VARCHAR(500) NOT NULL,
    cache_type VARCHAR(50) NOT NULL, -- 'redis', 'memory', 'cdn'
    operation VARCHAR(20) NOT NULL, -- 'get', 'set', 'delete', 'miss'
    
    -- Timing
    operation_time DECIMAL(8,3) NOT NULL, -- em milissegundos
    
    -- Size
    key_size INTEGER DEFAULT 0,
    value_size INTEGER DEFAULT 0,
    
    -- TTL info
    ttl_seconds INTEGER,
    expires_at TIMESTAMP,
    
    -- Hit/Miss
    is_hit BOOLEAN DEFAULT false,
    
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Alertas de performance
CREATE TABLE performance.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    alert_type VARCHAR(100) NOT NULL, -- 'slow_query', 'high_error_rate', 'memory_usage'
    severity VARCHAR(20) DEFAULT 'warning', -- 'info', 'warning', 'error', 'critical'
    
    -- Detalhes
    title VARCHAR(255) NOT NULL,
    description TEXT,
    threshold_value DECIMAL(15,6),
    current_value DECIMAL(15,6),
    
    -- Contexto
    service_name VARCHAR(100),
    endpoint VARCHAR(500),
    company_id UUID REFERENCES auth.companies(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP,
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_api_metrics_endpoint_recorded ON performance.api_metrics(endpoint, recorded_at);
CREATE INDEX idx_api_metrics_company_recorded ON performance.api_metrics(company_id, recorded_at);
CREATE INDEX idx_api_metrics_response_time ON performance.api_metrics(response_time) WHERE response_time > 1000;
CREATE INDEX idx_frontend_metrics_session_recorded ON performance.frontend_metrics(session_id, recorded_at);
CREATE INDEX idx_database_metrics_hash_recorded ON performance.database_metrics(query_hash, recorded_at);
CREATE INDEX idx_cache_metrics_key_recorded ON performance.cache_metrics(cache_key, recorded_at);
CREATE INDEX idx_alerts_status_severity ON performance.alerts(status, severity);

-- Particionamento para tabelas grandes (TimescaleDB)
SELECT create_hypertable('performance.api_metrics', 'recorded_at');
SELECT create_hypertable('performance.frontend_metrics', 'recorded_at');
SELECT create_hypertable('performance.database_metrics', 'recorded_at');
SELECT create_hypertable('performance.cache_metrics', 'recorded_at');
```

## 🔧 **SERVIÇO DE PERFORMANCE**
```typescript
// services/performance.service.ts
export class PerformanceService {
  private redisClient: Redis;
  private prometheusRegister: Registry;

  constructor() {
    this.redisClient = new Redis({
      host: 'redis.kryonix.com.br',
      port: 6379,
      retryDelayOnFailure: 50,
      maxRetriesPerRequest: 3
    });

    this.prometheusRegister = register;
    this.initializeMetrics();
  }

  // ========== MÉTRICAS DE API ==========

  async trackApiRequest(requestData: ApiRequestData): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Registrar métricas em tempo real no Redis
      await this.updateRealTimeMetrics(requestData);
      
      // Salvar métricas detalhadas no banco
      await this.db.query(`
        INSERT INTO performance.api_metrics 
          (endpoint, method, user_id, company_id, response_time, db_time, external_api_time, 
           status_code, success, request_size, response_size, from_cache, user_agent, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        requestData.endpoint,
        requestData.method,
        requestData.userId,
        requestData.companyId,
        requestData.responseTime,
        requestData.dbTime || 0,
        requestData.externalApiTime || 0,
        requestData.statusCode,
        requestData.statusCode < 400,
        requestData.requestSize || 0,
        requestData.responseSize || 0,
        requestData.fromCache || false,
        requestData.userAgent,
        requestData.ipAddress
      ]);

      // Verificar alertas de performance
      await this.checkPerformanceAlerts(requestData);

    } catch (error) {
      console.error('Erro ao rastrear performance da API:', error);
    }
  }

  private async updateRealTimeMetrics(requestData: ApiRequestData): Promise<void> {
    const key = `perf:api:${requestData.endpoint}:${requestData.method}`;
    const hourKey = `perf:api:hour:${new Date().getHours()}`;
    
    const pipeline = this.redisClient.pipeline();
    
    // Métricas por endpoint
    pipeline.hincrby(key, 'requests', 1);
    pipeline.hincrby(key, 'total_time', requestData.responseTime);
    pipeline.hset(key, 'last_request', Date.now());
    pipeline.expire(key, 86400); // 24 horas

    // Métricas horárias
    pipeline.hincrby(hourKey, 'requests', 1);
    pipeline.hincrby(hourKey, 'total_time', requestData.responseTime);
    
    if (requestData.statusCode >= 400) {
      pipeline.hincrby(key, 'errors', 1);
      pipeline.hincrby(hourKey, 'errors', 1);
    }

    // Response time buckets
    const bucket = this.getResponseTimeBucket(requestData.responseTime);
    pipeline.hincrby(`${key}:buckets`, bucket, 1);

    await pipeline.exec();
  }

  // ========== OTIMIZAÇÃO DE CACHE ==========

  async optimizeCache(): Promise<CacheOptimizationResult> {
    // Analisar padrões de cache
    const cacheAnalysis = await this.analyzeCachePatterns();
    
    // Otimizar TTLs baseado no uso
    await this.optimizeCacheTTLs(cacheAnalysis);
    
    // Limpar cache não utilizado
    await this.cleanupUnusedCache();
    
    // Pré-aquecer cache popular
    await this.warmupPopularCache();

    return {
      keysAnalyzed: cacheAnalysis.totalKeys,
      ttlsOptimized: cacheAnalysis.optimizedTTLs,
      memoryFreed: cacheAnalysis.memoryFreed,
      hitRateImprovement: cacheAnalysis.hitRateImprovement
    };
  }

  private async analyzeCachePatterns(): Promise<CacheAnalysis> {
    // Buscar métricas de cache dos últimos 7 dias
    const cacheMetrics = await this.db.query(`
      SELECT 
        cache_key,
        cache_type,
        COUNT(*) as access_count,
        AVG(operation_time) as avg_time,
        SUM(CASE WHEN is_hit THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as hit_rate,
        AVG(value_size) as avg_size,
        MAX(recorded_at) as last_access
      FROM performance.cache_metrics 
      WHERE recorded_at >= NOW() - INTERVAL '7 days'
      GROUP BY cache_key, cache_type
      HAVING COUNT(*) > 10
      ORDER BY access_count DESC
    `);

    const patterns = {
      hotKeys: cacheMetrics.rows.filter(m => m.access_count > 1000),
      coldKeys: cacheMetrics.rows.filter(m => m.access_count < 10),
      lowHitRate: cacheMetrics.rows.filter(m => m.hit_rate < 50),
      largeValues: cacheMetrics.rows.filter(m => m.avg_size > 1024 * 1024), // > 1MB
      totalKeys: cacheMetrics.rows.length
    };

    return patterns;
  }

  private async optimizeCacheTTLs(analysis: CacheAnalysis): Promise<void> {
    for (const key of analysis.hotKeys) {
      // Aumentar TTL para chaves populares
      const newTTL = Math.min(key.current_ttl * 2, 86400); // máximo 24h
      await this.redisClient.expire(key.cache_key, newTTL);
    }

    for (const key of analysis.coldKeys) {
      // Diminuir TTL para chaves pouco usadas
      const newTTL = Math.max(key.current_ttl / 2, 300); // mínimo 5min
      await this.redisClient.expire(key.cache_key, newTTL);
    }
  }

  // ========== OTIMIZAÇÃO DE QUERIES ==========

  async optimizeQueries(): Promise<QueryOptimizationResult> {
    // Identificar queries lentas
    const slowQueries = await this.identifySlowQueries();
    
    // Analisar planos de execução
    const queryPlans = await this.analyzeQueryPlans(slowQueries);
    
    // Sugerir índices
    const indexSuggestions = await this.suggestIndexes(queryPlans);
    
    // Aplicar otimizações automáticas
    const appliedOptimizations = await this.applyAutomaticOptimizations(indexSuggestions);

    return {
      slowQueriesFound: slowQueries.length,
      indexesCreated: appliedOptimizations.indexesCreated,
      queriesOptimized: appliedOptimizations.queriesOptimized,
      performanceGain: appliedOptimizations.averageSpeedupPercent
    };
  }

  private async identifySlowQueries(): Promise<SlowQuery[]> {
    const result = await this.db.query(`
      SELECT 
        query_hash,
        query_text,
        COUNT(*) as execution_count,
        AVG(execution_time) as avg_execution_time,
        MAX(execution_time) as max_execution_time,
        SUM(execution_time) as total_time
      FROM performance.database_metrics 
      WHERE recorded_at >= NOW() - INTERVAL '24 hours'
        AND execution_time > 100 -- queries > 100ms
      GROUP BY query_hash, query_text
      HAVING COUNT(*) > 5
      ORDER BY avg_execution_time DESC, execution_count DESC
      LIMIT 50
    `);

    return result.rows.map(row => ({
      hash: row.query_hash,
      text: row.query_text,
      executionCount: parseInt(row.execution_count),
      avgTime: parseFloat(row.avg_execution_time),
      maxTime: parseFloat(row.max_execution_time),
      totalTime: parseFloat(row.total_time)
    }));
  }

  private async analyzeQueryPlans(queries: SlowQuery[]): Promise<QueryPlan[]> {
    const plans: QueryPlan[] = [];
    
    for (const query of queries.slice(0, 10)) { // Analisar top 10
      try {
        const planResult = await this.db.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query.text}`);
        const plan = planResult.rows[0]['QUERY PLAN'][0];
        
        plans.push({
          queryHash: query.hash,
          queryText: query.text,
          plan: plan,
          totalCost: plan['Total Cost'],
          actualTime: plan['Actual Total Time'],
          recommendations: this.analyzePlanForOptimizations(plan)
        });
      } catch (error) {
        console.error(`Erro ao analisar query ${query.hash}:`, error);
      }
    }

    return plans;
  }

  private analyzePlanForOptimizations(plan: any): string[] {
    const recommendations: string[] = [];
    
    // Análise recursiva do plano
    const analyzePlanNode = (node: any) => {
      // Seq Scan em tabelas grandes
      if (node['Node Type'] === 'Seq Scan' && node['Actual Rows'] > 10000) {
        recommendations.push(`Considere adicionar índice na tabela ${node['Relation Name']}`);
      }
      
      // Nested Loop custoso
      if (node['Node Type'] === 'Nested Loop' && node['Actual Total Time'] > 1000) {
        recommendations.push('Nested Loop custoso - considere otimizar joins');
      }
      
      // Sort com disco
      if (node['Node Type'] === 'Sort' && node['Sort Method']?.includes('external')) {
        recommendations.push('Sort usando disco - considere aumentar work_mem');
      }
      
      // Hash Join com batches
      if (node['Node Type'] === 'Hash Join' && node['Hash Batches'] > 1) {
        recommendations.push('Hash Join com múltiplos batches - considere aumentar work_mem');
      }

      // Analisar nós filhos
      if (node['Plans']) {
        node['Plans'].forEach(analyzePlanNode);
      }
    };

    analyzePlanNode(plan);
    return recommendations;
  }

  // ========== MONITORAMENTO EM TEMPO REAL ==========

  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    const pipeline = this.redisClient.pipeline();
    
    // Métricas da última hora
    const currentHour = new Date().getHours();
    pipeline.hgetall(`perf:api:hour:${currentHour}`);
    
    // Top endpoints por volume
    pipeline.zrevrange('perf:endpoints:volume', 0, 9, 'WITHSCORES');
    
    // Top endpoints por tempo de resposta
    pipeline.zrevrange('perf:endpoints:slowest', 0, 9, 'WITHSCORES');
    
    // Métricas de cache
    pipeline.hgetall('perf:cache:stats');
    
    // Status de saúde dos serviços
    pipeline.hgetall('perf:health:services');

    const results = await pipeline.exec();
    
    return {
      hourlyStats: results[0][1] || {},
      topEndpointsByVolume: this.parseZRangeResults(results[1][1]),
      slowestEndpoints: this.parseZRangeResults(results[2][1]),
      cacheStats: results[3][1] || {},
      serviceHealth: results[4][1] || {},
      timestamp: new Date()
    };
  }

  // ========== ALERTAS DE PERFORMANCE ==========

  async checkPerformanceAlerts(requestData: ApiRequestData): Promise<void> {
    const alerts: PerformanceAlert[] = [];

    // Alerta para response time alto
    if (requestData.responseTime > 5000) { // > 5 segundos
      alerts.push({
        type: 'slow_response',
        severity: requestData.responseTime > 10000 ? 'critical' : 'warning',
        title: 'Response Time Alto',
        description: `Endpoint ${requestData.endpoint} respondeu em ${requestData.responseTime}ms`,
        thresholdValue: 5000,
        currentValue: requestData.responseTime,
        serviceName: 'api',
        endpoint: requestData.endpoint,
        companyId: requestData.companyId
      });
    }

    // Alerta para taxa de erro alta
    const errorRate = await this.calculateErrorRate(requestData.endpoint);
    if (errorRate > 5) { // > 5% de erro
      alerts.push({
        type: 'high_error_rate',
        severity: errorRate > 20 ? 'critical' : 'warning',
        title: 'Taxa de Erro Alta',
        description: `Endpoint ${requestData.endpoint} com ${errorRate.toFixed(1)}% de erro`,
        thresholdValue: 5,
        currentValue: errorRate,
        serviceName: 'api',
        endpoint: requestData.endpoint,
        companyId: requestData.companyId
      });
    }

    // Salvar alertas
    for (const alert of alerts) {
      await this.createAlert(alert);
    }
  }

  private async createAlert(alertData: PerformanceAlert): Promise<void> {
    // Verificar se alerta similar já existe
    const existing = await this.db.query(`
      SELECT id FROM performance.alerts 
      WHERE alert_type = $1 
        AND service_name = $2 
        AND endpoint = $3
        AND status = 'active'
        AND created_at > NOW() - INTERVAL '1 hour'
    `, [alertData.type, alertData.serviceName, alertData.endpoint]);

    if (existing.rows.length > 0) {
      return; // Evitar spam de alertas
    }

    await this.db.query(`
      INSERT INTO performance.alerts 
        (alert_type, severity, title, description, threshold_value, current_value, 
         service_name, endpoint, company_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      alertData.type,
      alertData.severity,
      alertData.title,
      alertData.description,
      alertData.thresholdValue,
      alertData.currentValue,
      alertData.serviceName,
      alertData.endpoint,
      alertData.companyId
    ]);

    // Enviar notificação
    await this.sendPerformanceAlert(alertData);
  }

  // ========== OTIMIZAÇÃO DE FRONTEND ==========

  async optimizeFrontend(): Promise<FrontendOptimizationResult> {
    const optimizations = {
      codeAnalysis: await this.analyzeCodeSplitting(),
      imageOptimization: await this.optimizeImages(),
      bundleAnalysis: await this.analyzeBundles(),
      cacheOptimization: await this.optimizeBrowserCache()
    };

    return {
      bundleSizeReduction: optimizations.bundleAnalysis.sizeReduction,
      imagesSaved: optimizations.imageOptimization.bytesSaved,
      codeChunksOptimized: optimizations.codeAnalysis.chunksOptimized,
      cacheHitRateImproved: optimizations.cacheOptimization.hitRateImprovement
    };
  }

  // ========== OTIMIZAÇÃO DE RECURSOS ==========

  async optimizeResources(): Promise<ResourceOptimizationResult> {
    // Otimizar containers Docker
    const containerOptimization = await this.optimizeContainers();
    
    // Otimizar conexões de banco
    const dbOptimization = await this.optimizeDatabaseConnections();
    
    // Otimizar uso de memória
    const memoryOptimization = await this.optimizeMemoryUsage();

    return {
      containerMemorySaved: containerOptimization.memorySaved,
      dbConnectionsOptimized: dbOptimization.connectionsOptimized,
      memoryUsageReduced: memoryOptimization.memoryReduced,
      overallPerformanceGain: this.calculateOverallGain([
        containerOptimization,
        dbOptimization,
        memoryOptimization
      ])
    };
  }

  // ========== MÉTRICAS AGREGADAS ==========

  async generatePerformanceReport(dateRange: DateRange): Promise<PerformanceReport> {
    const report = {
      summary: await this.generateSummaryMetrics(dateRange),
      apiPerformance: await this.generateApiMetrics(dateRange),
      frontendMetrics: await this.generateFrontendMetrics(dateRange),
      databaseMetrics: await this.generateDatabaseMetrics(dateRange),
      cacheMetrics: await this.generateCacheMetrics(dateRange),
      recommendations: await this.generateRecommendations(dateRange)
    };

    // Salvar relatório para referência futura
    await this.savePerformanceReport(report, dateRange);

    return report;
  }

  private async generateSummaryMetrics(dateRange: DateRange): Promise<SummaryMetrics> {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_requests,
        AVG(response_time) as avg_response_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time) as p95_response_time,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time) as p99_response_time,
        COUNT(*) FILTER (WHERE success = false) * 100.0 / COUNT(*) as error_rate,
        COUNT(*) FILTER (WHERE from_cache = true) * 100.0 / COUNT(*) as cache_hit_rate
      FROM performance.api_metrics 
      WHERE recorded_at >= $1 AND recorded_at <= $2
    `, [dateRange.from, dateRange.to]);

    return result.rows[0];
  }
}
```

## 🎨 **COMPONENTES FRONTEND DE PERFORMANCE**
```tsx
// components/performance/PerformanceDashboard.tsx
export const PerformanceDashboard = () => {
  const { metrics, loading } = useRealtimeMetrics();
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('response_time');

  const performanceCards = [
    {
      title: 'Tempo de Resposta Médio',
      value: `${metrics?.avgResponseTime?.toFixed(0) || '0'}ms`,
      change: metrics?.responseTimeChange || 0,
      target: '< 200ms',
      status: (metrics?.avgResponseTime || 0) < 200 ? 'good' : 'warning',
      icon: <ClockIcon className="h-6 w-6" />
    },
    {
      title: 'Taxa de Erro',
      value: `${metrics?.errorRate?.toFixed(2) || '0'}%`,
      change: metrics?.errorRateChange || 0,
      target: '< 1%',
      status: (metrics?.errorRate || 0) < 1 ? 'good' : 'error',
      icon: <AlertTriangleIcon className="h-6 w-6" />
    },
    {
      title: 'Cache Hit Rate',
      value: `${metrics?.cacheHitRate?.toFixed(1) || '0'}%`,
      change: metrics?.cacheHitRateChange || 0,
      target: '> 80%',
      status: (metrics?.cacheHitRate || 0) > 80 ? 'good' : 'warning',
      icon: <DatabaseIcon className="h-6 w-6" />
    },
    {
      title: 'Throughput',
      value: `${metrics?.requestsPerSecond?.toFixed(0) || '0'} req/s`,
      change: metrics?.throughputChange || 0,
      target: 'Estável',
      status: 'info',
      icon: <TrendingUpIcon className="h-6 w-6" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="text-gray-600">Monitoramento em tempo real da performance do sistema</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceCards.map((card, index) => (
          <PerformanceCard key={index} {...card} />
        ))}
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Resposta</CardTitle>
            <CardDescription>Latência média dos endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponseTimeChart timeRange={timeRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Throughput</CardTitle>
            <CardDescription>Requisições por segundo</CardDescription>
          </CardHeader>
          <CardContent>
            <ThroughputChart timeRange={timeRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>Taxa de erro por endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorRateChart timeRange={timeRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Performance</CardTitle>
            <CardDescription>Hit rate e miss rate do cache</CardDescription>
          </CardHeader>
          <CardContent>
            <CachePerformanceChart timeRange={timeRange} />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Endpoints Mais Lentos</CardTitle>
          </CardHeader>
          <CardContent>
            <SlowestEndpointsTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queries Mais Lentas</CardTitle>
          </CardHeader>
          <CardContent>
            <SlowestQueriesTable />
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>Métricas de experiência do usuário</CardDescription>
        </CardHeader>
        <CardContent>
          <CoreWebVitalsChart timeRange={timeRange} />
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceAlerts />
        </CardContent>
      </Card>
    </div>
  );
};

// components/performance/PerformanceCard.tsx
interface PerformanceCardProps {
  title: string;
  value: string;
  change: number;
  target: string;
  status: 'good' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
}

export const PerformanceCard = ({ title, value, change, target, status, icon }: PerformanceCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getChangeColor = () => {
    if (status === 'error') {
      return change > 0 ? 'text-red-600' : 'text-green-600';
    }
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            
            <div className="flex items-center justify-between mt-3">
              <div className={cn("flex items-center text-sm", getChangeColor())}>
                {change > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
              
              <span className="text-xs text-gray-500">Meta: {target}</span>
            </div>
          </div>
          
          <div className={cn('p-3 rounded-lg', getStatusColor())}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// components/performance/ResponseTimeChart.tsx
export const ResponseTimeChart = ({ timeRange }: { timeRange: string }) => {
  const { data, loading } = useResponseTimeData(timeRange);

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(value) => format(new Date(value), 'HH:mm')}
          />
          <YAxis 
            tickFormatter={(value) => `${value}ms`}
          />
          <Tooltip 
            labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
            formatter={(value: number) => [`${value}ms`, 'Tempo de Resposta']}
          />
          <Line 
            type="monotone" 
            dataKey="avgResponseTime" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="p95ResponseTime" 
            stroke="#EF4444" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// components/performance/CoreWebVitalsChart.tsx
export const CoreWebVitalsChart = ({ timeRange }: { timeRange: string }) => {
  const { data, loading } = useCoreWebVitals(timeRange);

  const vitalsConfig = [
    { key: 'fcp', name: 'First Contentful Paint', color: '#10B981', target: 1800 },
    { key: 'lcp', name: 'Largest Contentful Paint', color: '#3B82F6', target: 2500 },
    { key: 'fid', name: 'First Input Delay', color: '#8B5CF6', target: 100 },
    { key: 'cls', name: 'Cumulative Layout Shift', color: '#F59E0B', target: 0.1 }
  ];

  return (
    <div className="space-y-6">
      {vitalsConfig.map(vital => (
        <div key={vital.key} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{vital.name}</span>
            <span className="text-xs text-gray-500">
              Meta: {vital.key === 'cls' ? vital.target : `${vital.target}ms`}
            </span>
          </div>
          
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`gradient-${vital.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={vital.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={vital.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="timestamp" 
                  hide
                />
                <YAxis hide />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'dd/MM HH:mm')}
                  formatter={(value: number) => [
                    vital.key === 'cls' ? value.toFixed(3) : `${value}ms`,
                    vital.name
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={vital.key}
                  stroke={vital.color}
                  fillOpacity={1}
                  fill={`url(#gradient-${vital.key})`}
                />
                {/* Linha de meta */}
                <ReferenceLine 
                  y={vital.target} 
                  stroke={vital.color} 
                  strokeDasharray="2 2" 
                  opacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Último valor: {data?.[data.length - 1]?.[vital.key] || 'N/A'}</span>
            <span className={cn(
              'font-medium',
              (data?.[data.length - 1]?.[vital.key] || 0) <= vital.target 
                ? 'text-green-600' 
                : 'text-red-600'
            )}>
              {(data?.[data.length - 1]?.[vital.key] || 0) <= vital.target ? '✓ Bom' : '⚠ Precisa melhorar'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 🔧 **MIDDLEWARE DE PERFORMANCE**
```typescript
// middleware/performance.middleware.ts
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startCpuUsage = process.cpuUsage();
  const startMemory = process.memoryUsage();

  // Interceptar response para capturar métricas
  const originalSend = res.send;
  let responseSize = 0;

  res.send = function(body: any) {
    responseSize = Buffer.byteLength(body || '', 'utf8');
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    const endTime = Date.now();
    const endCpuUsage = process.cpuUsage(startCpuUsage);
    const endMemory = process.memoryUsage();

    const metrics = {
      endpoint: `${req.method} ${req.route?.path || req.path}`,
      method: req.method,
      statusCode: res.statusCode,
      responseTime: endTime - startTime,
      requestSize: parseInt(req.get('content-length') || '0'),
      responseSize,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
      userId: req.user?.id,
      companyId: req.user?.companyId,
      cpuUsage: endCpuUsage.user + endCpuUsage.system,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      fromCache: res.get('X-Cache-Status') === 'HIT'
    };

    // Registrar métricas async para não afetar response
    setImmediate(() => {
      performanceService.trackApiRequest(metrics);
    });
  });

  next();
};

// middleware/cache.middleware.ts
export const smartCacheMiddleware = (options: CacheOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Só cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req);
    const startTime = Date.now();

    try {
      // Tentar buscar do cache
      const cachedResponse = await redisClient.get(cacheKey);
      
      if (cachedResponse) {
        const cacheTime = Date.now() - startTime;
        
        // Registrar hit do cache
        await performanceService.trackCacheHit({
          key: cacheKey,
          operation: 'get',
          time: cacheTime,
          hit: true
        });

        res.set('X-Cache-Status', 'HIT');
        res.set('X-Cache-Time', cacheTime.toString());
        return res.json(JSON.parse(cachedResponse));
      }

      // Cache miss - interceptar response para cachear
      const originalJson = res.json;
      res.json = function(body: any) {
        // Determinar TTL baseado no endpoint
        const ttl = determineCacheTTL(req.path, options);
        
        // Cachear response async
        setImmediate(async () => {
          await redisClient.setex(cacheKey, ttl, JSON.stringify(body));
          
          await performanceService.trackCacheHit({
            key: cacheKey,
            operation: 'set',
            time: Date.now() - startTime,
            hit: false,
            ttl
          });
        });

        res.set('X-Cache-Status', 'MISS');
        return originalJson.call(this, body);
      };

      next();

    } catch (error) {
      console.error('Erro no cache middleware:', error);
      next();
    }
  };
};

function generateCacheKey(req: Request): string {
  const baseKey = `cache:${req.method}:${req.path}`;
  const queryString = new URLSearchParams(req.query as any).toString();
  const userContext = req.user?.companyId || 'anonymous';
  
  return `${baseKey}:${userContext}:${crypto
    .createHash('md5')
    .update(queryString)
    .digest('hex')}`;
}

function determineCacheTTL(path: string, options: CacheOptions): number {
  // TTL baseado no tipo de endpoint
  if (path.includes('/metrics') || path.includes('/stats')) {
    return 60; // 1 minuto para métricas
  }
  
  if (path.includes('/users') || path.includes('/profile')) {
    return 300; // 5 minutos para dados de usuário
  }
  
  if (path.includes('/config') || path.includes('/settings')) {
    return 3600; // 1 hora para configurações
  }
  
  return options.defaultTTL || 1800; // 30 minutos padrão
}
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Criar schema de performance
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f performance-schema.sql

# 2. Configurar TimescaleDB para métricas
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -c "
  SELECT create_hypertable('performance.api_metrics', 'recorded_at');
  SELECT create_hypertable('performance.frontend_metrics', 'recorded_at');
  SELECT create_hypertable('performance.database_metrics', 'recorded_at');
"

# 3. Configurar Redis para cache de performance
redis-cli -h redis.kryonix.com.br CONFIG SET maxmemory-policy allkeys-lru
redis-cli -h redis.kryonix.com.br CONFIG SET save "900 1 300 10 60 10000"

# 4. Instalar ferramentas de otimização
npm install sharp imagemin compression helmet
npm install @prometheus-io/client prom-client

# 5. Configurar Prometheus targets
curl -X POST http://prometheus.kryonix.com.br/-/reload

# 6. Testar coleta de métricas
curl -X GET https://api.kryonix.com.br/metrics
curl -X GET https://api.kryonix.com.br/health/performance

# 7. Configurar alertas no Grafana
curl -X POST https://grafana.kryonix.com.br/api/alerts \
  -H "Authorization: Bearer $GRAFANA_TOKEN" \
  -H "Content-Type: application/json" \
  -d @performance-alerts.json
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Schema de performance criado
- [ ] TimescaleDB hypertables configuradas
- [ ] Redis otimizado para cache
- [ ] Middleware de performance ativo
- [ ] Coleta de métricas funcionando
- [ ] Cache inteligente implementado
- [ ] Alertas de performance configurados
- [ ] Dashboard de performance criado
- [ ] Core Web Vitals monitorando
- [ ] Otimização automática ativa
- [ ] Queries lentas identificadas
- [ ] Índices automáticos criados
- [ ] Compressão de responses ativa
- [ ] CDN configurado

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de performance de API
npm run test:performance:api

# Teste de cache
npm run test:performance:cache

# Teste de otimizações
npm run test:performance:optimization

# Teste de alertas
npm run test:performance:alerts

# Teste de métricas frontend
npm run test:performance:frontend

# Load testing
npm run test:performance:load

# Benchmark completo
npm run test:performance:benchmark
```

## 📊 **MÉTRICAS DE PERFORMANCE ALVO**
```yaml
API Performance Targets:
  - Response Time P95: < 500ms
  - Response Time P99: < 1000ms
  - Error Rate: < 1%
  - Throughput: > 1000 req/s
  - Cache Hit Rate: > 80%

Frontend Performance Targets:
  - First Contentful Paint: < 1.8s
  - Largest Contentful Paint: < 2.5s
  - First Input Delay: < 100ms
  - Cumulative Layout Shift: < 0.1
  - Time to Interactive: < 3.8s

Database Performance Targets:
  - Average Query Time: < 50ms
  - Slow Queries (>1s): < 1%
  - Connection Pool Usage: < 80%
  - Cache Hit Ratio: > 95%

System Performance Targets:
  - CPU Usage: < 70%
  - Memory Usage: < 80%
  - Disk I/O: < 70%
  - Network Latency: < 50ms
```

---

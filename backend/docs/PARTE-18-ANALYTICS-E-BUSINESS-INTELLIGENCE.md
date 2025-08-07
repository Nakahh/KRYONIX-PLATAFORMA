# 📊 PARTE 18 - ANALYTICS E BUSINESS INTELLIGENCE
*Agentes Responsáveis: Analytics Expert + BI Specialist + Data Architect*

## 🎯 **OBJETIVO**
Implementar sistema completo de Analytics e Business Intelligence utilizando Metabase (`metabase.kryonix.com.br`) integrado com PostgreSQL, ClickHouse e todas as stacks para fornecer insights em tempo real e relatórios avançados.

## 🏗️ **ARQUITETURA DE ANALYTICS**
```yaml
Analytics Architecture:
  Visualization: Metabase (metabase.kryonix.com.br)
  OLTP Database: PostgreSQL (dados transacionais)
  OLAP Database: ClickHouse (analytics e métricas)
  Real-time: Redis (métricas em tempo real)
  ETL Pipeline: N8N workflows
  Data Lake: MinIO (logs e arquivos)
  
Data Sources:
  - User behavior: Frontend tracking
  - Email metrics: SendGrid + Mautic
  - Communication: Evolution API + Chatwoot
  - System metrics: Prometheus + Grafana
  - Business data: PostgreSQL schemas
  - Application logs: Structured logs
```

## 📊 **MODELO DE DADOS ANALYTICS**
```sql
-- Schema específico para analytics
CREATE SCHEMA IF NOT EXISTS analytics;

-- Tabela de eventos de usuário
CREATE TABLE analytics.user_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identificação
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255) NOT NULL,
    company_id UUID REFERENCES auth.companies(id),
    
    -- Evento
    event_name VARCHAR(100) NOT NULL, -- 'page_view', 'button_click', 'form_submit', etc
    event_category VARCHAR(50) NOT NULL, -- 'navigation', 'engagement', 'conversion'
    event_action VARCHAR(100) NOT NULL,
    event_label VARCHAR(255),
    event_value DECIMAL(10,2),
    
    -- Contexto
    page_url TEXT,
    page_title VARCHAR(255),
    referrer TEXT,
    
    -- Dispositivo
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    screen_resolution VARCHAR(20),
    
    -- Localização
    ip_address INET,
    country VARCHAR(3), -- ISO code
    region VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Dados customizados
    custom_properties JSONB DEFAULT '{}',
    
    -- Timestamp
    occurred_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP DEFAULT NOW()
);

-- Métricas agregadas por dia
CREATE TABLE analytics.daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    date_day DATE NOT NULL,
    company_id UUID REFERENCES auth.companies(id),
    
    -- Métricas de usuários
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    
    -- Métricas de sessão
    total_sessions INTEGER DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0, -- em segundos
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Métricas de página
    page_views INTEGER DEFAULT 0,
    unique_page_views INTEGER DEFAULT 0,
    avg_pages_per_session DECIMAL(5,2) DEFAULT 0,
    
    -- Métricas de conversão
    conversions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Métricas de email
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    
    -- Métricas de comunicação
    whatsapp_messages INTEGER DEFAULT 0,
    chat_conversations INTEGER DEFAULT 0,
    support_tickets INTEGER DEFAULT 0,
    
    -- Métricas de sistema
    api_requests INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0, -- em ms
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(date_day, company_id)
);

-- Funis de conversão
CREATE TABLE analytics.conversion_funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    company_id UUID REFERENCES auth.companies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Configuração do funil
    steps JSONB NOT NULL, -- [{"name": "step1", "event": "page_view", "conditions": {...}}]
    
    -- Configurações
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Dados do funil
CREATE TABLE analytics.funnel_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    funnel_id UUID REFERENCES analytics.conversion_funnels(id) ON DELETE CASCADE,
    date_day DATE NOT NULL,
    step_number INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    
    -- Métricas
    users_entered INTEGER DEFAULT 0,
    users_completed INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Tempo médio no step
    avg_time_in_step INTEGER DEFAULT 0, -- em segundos
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(funnel_id, date_day, step_number)
);

-- Coortes de usuários
CREATE TABLE analytics.user_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    company_id UUID REFERENCES auth.companies(id),
    cohort_month DATE NOT NULL, -- primeiro dia do mês que o usuário se registrou
    period_number INTEGER NOT NULL, -- 0, 1, 2, 3... (meses desde registro)
    
    -- Métricas
    users_count INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    retention_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Receita
    total_revenue DECIMAL(12,2) DEFAULT 0,
    avg_revenue_per_user DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(company_id, cohort_month, period_number)
);

-- Métricas de performance
CREATE TABLE analytics.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    service_name VARCHAR(100) NOT NULL, -- 'api', 'frontend', 'database', etc
    metric_name VARCHAR(100) NOT NULL, -- 'response_time', 'memory_usage', etc
    metric_value DECIMAL(15,6) NOT NULL,
    metric_unit VARCHAR(20), -- 'ms', 'mb', 'percentage', etc
    
    -- Contexto
    instance_id VARCHAR(100),
    tags JSONB DEFAULT '{}',
    
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Relatórios customizados
CREATE TABLE analytics.custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    company_id UUID REFERENCES auth.companies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Configuração
    query_config JSONB NOT NULL, -- configuração da query/dashboard
    chart_config JSONB, -- configuração visual
    schedule_config JSONB, -- para relatórios automáticos
    
    -- Permissões
    is_public BOOLEAN DEFAULT false,
    allowed_users JSONB DEFAULT '[]',
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_user_events_user_occurred ON analytics.user_events(user_id, occurred_at);
CREATE INDEX idx_user_events_company_event ON analytics.user_events(company_id, event_name, occurred_at);
CREATE INDEX idx_user_events_session ON analytics.user_events(session_id, occurred_at);
CREATE INDEX idx_daily_metrics_company_date ON analytics.daily_metrics(company_id, date_day);
CREATE INDEX idx_funnel_data_funnel_date ON analytics.funnel_data(funnel_id, date_day);
CREATE INDEX idx_cohorts_company_month ON analytics.user_cohorts(company_id, cohort_month);
CREATE INDEX idx_performance_service_recorded ON analytics.performance_metrics(service_name, recorded_at);

-- Particionamento por data para tabelas grandes
SELECT create_hypertable('analytics.user_events', 'occurred_at');
SELECT create_hypertable('analytics.performance_metrics', 'recorded_at');
```

## 🔧 **SERVIÇO DE ANALYTICS**
```typescript
// services/analytics.service.ts
export class AnalyticsService {
  
  // ========== COLETA DE EVENTOS ==========
  
  async trackEvent(eventData: UserEventData): Promise<void> {
    try {
      // 1. Enriquecer dados com informações de contexto
      const enrichedEvent = await this.enrichEventData(eventData);
      
      // 2. Salvar evento bruto
      await this.db.query(`
        INSERT INTO analytics.user_events 
          (user_id, session_id, company_id, event_name, event_category, event_action, event_label, event_value,
           page_url, page_title, referrer, device_type, browser, operating_system, screen_resolution,
           ip_address, country, region, city, timezone, custom_properties, occurred_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      `, [
        enrichedEvent.userId,
        enrichedEvent.sessionId,
        enrichedEvent.companyId,
        enrichedEvent.eventName,
        enrichedEvent.eventCategory,
        enrichedEvent.eventAction,
        enrichedEvent.eventLabel,
        enrichedEvent.eventValue,
        enrichedEvent.pageUrl,
        enrichedEvent.pageTitle,
        enrichedEvent.referrer,
        enrichedEvent.deviceType,
        enrichedEvent.browser,
        enrichedEvent.operatingSystem,
        enrichedEvent.screenResolution,
        enrichedEvent.ipAddress,
        enrichedEvent.country,
        enrichedEvent.region,
        enrichedEvent.city,
        enrichedEvent.timezone,
        JSON.stringify(enrichedEvent.customProperties || {}),
        enrichedEvent.occurredAt || new Date()
      ]);

      // 3. Atualizar métricas em tempo real no Redis
      await this.updateRealTimeMetrics(enrichedEvent);

      // 4. Processar funis de conversão
      await this.processFunnelEvent(enrichedEvent);

    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
      // Não falhar a requisição principal por causa de analytics
    }
  }

  async trackBatch(events: UserEventData[]): Promise<void> {
    const chunks = this.chunkArray(events, 100);
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(event => this.trackEvent(event)));
    }
  }

  private async enrichEventData(eventData: UserEventData): Promise<EnrichedEventData> {
    // Buscar informações do usuário se disponível
    let userInfo = null;
    if (eventData.userId) {
      const userResult = await this.db.query(`
        SELECT u.*, c.id as company_id 
        FROM auth.users u 
        LEFT JOIN auth.companies c ON u.company_id = c.id 
        WHERE u.id = $1
      `, [eventData.userId]);
      
      if (userResult.rows.length > 0) {
        userInfo = userResult.rows[0];
      }
    }

    // Buscar informações geográficas por IP
    const geoInfo = await this.getGeoInfoFromIP(eventData.ipAddress);

    // Parsear User-Agent
    const deviceInfo = this.parseUserAgent(eventData.userAgent);

    return {
      ...eventData,
      companyId: userInfo?.company_id || eventData.companyId,
      country: geoInfo?.country,
      region: geoInfo?.region,
      city: geoInfo?.city,
      timezone: geoInfo?.timezone,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      operatingSystem: deviceInfo.os,
      screenResolution: eventData.screenResolution
    };
  }

  // ========== MÉTRICAS AGREGADAS ==========

  async aggregateDailyMetrics(date: Date, companyId?: string): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const companiesQuery = companyId 
      ? 'SELECT id FROM auth.companies WHERE id = $1'
      : 'SELECT id FROM auth.companies WHERE is_active = true';
    
    const companies = await this.db.query(companiesQuery, companyId ? [companyId] : []);

    for (const company of companies.rows) {
      const metrics = await this.calculateDailyMetrics(startOfDay, endOfDay, company.id);
      
      await this.db.query(`
        INSERT INTO analytics.daily_metrics 
          (date_day, company_id, active_users, new_users, returning_users, total_sessions, 
           avg_session_duration, bounce_rate, page_views, unique_page_views, avg_pages_per_session,
           conversions, conversion_rate, revenue, emails_sent, emails_opened, emails_clicked,
           whatsapp_messages, chat_conversations, support_tickets, api_requests, errors_count, avg_response_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        ON CONFLICT (date_day, company_id)
        DO UPDATE SET
          active_users = EXCLUDED.active_users,
          new_users = EXCLUDED.new_users,
          returning_users = EXCLUDED.returning_users,
          total_sessions = EXCLUDED.total_sessions,
          avg_session_duration = EXCLUDED.avg_session_duration,
          bounce_rate = EXCLUDED.bounce_rate,
          page_views = EXCLUDED.page_views,
          unique_page_views = EXCLUDED.unique_page_views,
          avg_pages_per_session = EXCLUDED.avg_pages_per_session,
          conversions = EXCLUDED.conversions,
          conversion_rate = EXCLUDED.conversion_rate,
          revenue = EXCLUDED.revenue,
          emails_sent = EXCLUDED.emails_sent,
          emails_opened = EXCLUDED.emails_opened,
          emails_clicked = EXCLUDED.emails_clicked,
          whatsapp_messages = EXCLUDED.whatsapp_messages,
          chat_conversations = EXCLUDED.chat_conversations,
          support_tickets = EXCLUDED.support_tickets,
          api_requests = EXCLUDED.api_requests,
          errors_count = EXCLUDED.errors_count,
          avg_response_time = EXCLUDED.avg_response_time,
          updated_at = NOW()
      `, [
        dateStr, company.id, metrics.activeUsers, metrics.newUsers, metrics.returningUsers,
        metrics.totalSessions, metrics.avgSessionDuration, metrics.bounceRate,
        metrics.pageViews, metrics.uniquePageViews, metrics.avgPagesPerSession,
        metrics.conversions, metrics.conversionRate, metrics.revenue,
        metrics.emailsSent, metrics.emailsOpened, metrics.emailsClicked,
        metrics.whatsappMessages, metrics.chatConversations, metrics.supportTickets,
        metrics.apiRequests, metrics.errorsCount, metrics.avgResponseTime
      ]);
    }
  }

  private async calculateDailyMetrics(startDate: Date, endDate: Date, companyId: string) {
    // Query complexa para calcular todas as métricas do dia
    const metricsQuery = `
      WITH user_metrics AS (
        SELECT 
          COUNT(DISTINCT user_id) as active_users,
          COUNT(DISTINCT CASE WHEN user_first_seen_date = $1::date THEN user_id END) as new_users,
          COUNT(DISTINCT session_id) as total_sessions,
          COUNT(*) FILTER (WHERE event_name = 'page_view') as page_views,
          COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN page_url END) as unique_page_views,
          COUNT(*) FILTER (WHERE event_name = 'conversion') as conversions
        FROM analytics.user_events 
        WHERE company_id = $3
          AND occurred_at >= $1 
          AND occurred_at <= $2
      ),
      session_metrics AS (
        SELECT 
          AVG(session_duration) as avg_session_duration,
          COUNT(*) FILTER (WHERE page_views_in_session = 1) * 100.0 / COUNT(*) as bounce_rate,
          AVG(page_views_in_session) as avg_pages_per_session
        FROM (
          SELECT 
            session_id,
            EXTRACT(EPOCH FROM (MAX(occurred_at) - MIN(occurred_at))) as session_duration,
            COUNT(*) FILTER (WHERE event_name = 'page_view') as page_views_in_session
          FROM analytics.user_events 
          WHERE company_id = $3
            AND occurred_at >= $1 
            AND occurred_at <= $2
          GROUP BY session_id
        ) session_stats
      )
      SELECT 
        um.*,
        sm.avg_session_duration,
        sm.bounce_rate,
        sm.avg_pages_per_session,
        um.active_users - um.new_users as returning_users,
        CASE WHEN um.active_users > 0 THEN um.conversions * 100.0 / um.active_users ELSE 0 END as conversion_rate
      FROM user_metrics um, session_metrics sm
    `;

    const metricsResult = await this.db.query(metricsQuery, [startDate, endDate, companyId]);
    const baseMetrics = metricsResult.rows[0];

    // Buscar métricas de email
    const emailMetrics = await this.getEmailMetrics(startDate, endDate, companyId);
    
    // Buscar métricas de comunicação
    const commMetrics = await this.getCommunicationMetrics(startDate, endDate, companyId);
    
    // Buscar métricas de sistema
    const systemMetrics = await this.getSystemMetrics(startDate, endDate, companyId);

    // Buscar receita do dia
    const revenueResult = await this.db.query(`
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM billing.transactions 
      WHERE company_id = $1 
        AND status = 'completed'
        AND created_at >= $2 
        AND created_at <= $3
    `, [companyId, startDate, endDate]);

    return {
      activeUsers: parseInt(baseMetrics.active_users) || 0,
      newUsers: parseInt(baseMetrics.new_users) || 0,
      returningUsers: parseInt(baseMetrics.returning_users) || 0,
      totalSessions: parseInt(baseMetrics.total_sessions) || 0,
      avgSessionDuration: parseInt(baseMetrics.avg_session_duration) || 0,
      bounceRate: parseFloat(baseMetrics.bounce_rate) || 0,
      pageViews: parseInt(baseMetrics.page_views) || 0,
      uniquePageViews: parseInt(baseMetrics.unique_page_views) || 0,
      avgPagesPerSession: parseFloat(baseMetrics.avg_pages_per_session) || 0,
      conversions: parseInt(baseMetrics.conversions) || 0,
      conversionRate: parseFloat(baseMetrics.conversion_rate) || 0,
      revenue: parseFloat(revenueResult.rows[0]?.revenue) || 0,
      ...emailMetrics,
      ...commMetrics,
      ...systemMetrics
    };
  }

  // ========== FUNIS DE CONVERSÃO ==========

  async createConversionFunnel(funnelData: ConversionFunnelData): Promise<ConversionFunnel> {
    const result = await this.db.query(`
      INSERT INTO analytics.conversion_funnels (company_id, name, description, steps, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      funnelData.companyId,
      funnelData.name,
      funnelData.description,
      JSON.stringify(funnelData.steps),
      funnelData.createdBy
    ]);

    return result.rows[0];
  }

  async calculateFunnelData(funnelId: string, dateRange: DateRange): Promise<FunnelAnalytics> {
    const funnel = await this.getFunnelById(funnelId);
    const steps = funnel.steps;

    const funnelData = [];
    let previousStepUsers = new Set();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Usuários que completaram este step
      const stepUsers = await this.getUsersCompletedStep(
        step, 
        dateRange, 
        funnel.company_id,
        i === 0 ? null : previousStepUsers
      );

      const usersEntered = i === 0 ? stepUsers.size : previousStepUsers.size;
      const usersCompleted = stepUsers.size;
      const completionRate = usersEntered > 0 ? (usersCompleted / usersEntered) * 100 : 0;

      funnelData.push({
        stepNumber: i + 1,
        stepName: step.name,
        usersEntered,
        usersCompleted,
        completionRate,
        dropoffRate: 100 - completionRate
      });

      previousStepUsers = stepUsers;
    }

    return {
      funnelId,
      dateRange,
      steps: funnelData,
      overallConversionRate: funnelData.length > 0 
        ? (funnelData[funnelData.length - 1].usersCompleted / funnelData[0].usersEntered) * 100 
        : 0
    };
  }

  // ========== ANÁLISE DE COORTE ==========

  async calculateCohortAnalysis(companyId: string, months: number = 12): Promise<CohortAnalysis> {
    const cohortQuery = `
      WITH user_first_purchase AS (
        SELECT 
          user_id,
          DATE_TRUNC('month', MIN(created_at)) as cohort_month
        FROM billing.transactions 
        WHERE company_id = $1 
          AND status = 'completed'
          AND created_at >= NOW() - INTERVAL '${months} months'
        GROUP BY user_id
      ),
      user_monthly_activity AS (
        SELECT 
          ufp.user_id,
          ufp.cohort_month,
          DATE_TRUNC('month', t.created_at) as activity_month,
          SUM(t.amount) as revenue
        FROM user_first_purchase ufp
        JOIN billing.transactions t ON ufp.user_id = t.user_id
        WHERE t.company_id = $1 
          AND t.status = 'completed'
        GROUP BY ufp.user_id, ufp.cohort_month, DATE_TRUNC('month', t.created_at)
      )
      SELECT 
        cohort_month,
        EXTRACT(EPOCH FROM (activity_month - cohort_month)) / (30 * 24 * 3600) as period_number,
        COUNT(DISTINCT user_id) as active_users,
        SUM(revenue) as total_revenue,
        AVG(revenue) as avg_revenue_per_user
      FROM user_monthly_activity
      GROUP BY cohort_month, period_number
      ORDER BY cohort_month, period_number
    `;

    const cohortResult = await this.db.query(cohortQuery, [companyId]);
    
    // Organizar dados em matriz de coorte
    const cohortMatrix = {};
    cohortResult.rows.forEach(row => {
      const month = row.cohort_month.toISOString().substr(0, 7);
      if (!cohortMatrix[month]) {
        cohortMatrix[month] = {};
      }
      cohortMatrix[month][row.period_number] = {
        activeUsers: parseInt(row.active_users),
        totalRevenue: parseFloat(row.total_revenue),
        avgRevenuePerUser: parseFloat(row.avg_revenue_per_user)
      };
    });

    return {
      companyId,
      monthsAnalyzed: months,
      cohortMatrix,
      generatedAt: new Date()
    };
  }

  // ========== RELATÓRIOS CUSTOMIZADOS ==========

  async createCustomReport(reportData: CustomReportData): Promise<CustomReport> {
    const result = await this.db.query(`
      INSERT INTO analytics.custom_reports 
        (company_id, name, description, query_config, chart_config, schedule_config, is_public, allowed_users, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      reportData.companyId,
      reportData.name,
      reportData.description,
      JSON.stringify(reportData.queryConfig),
      JSON.stringify(reportData.chartConfig || {}),
      JSON.stringify(reportData.scheduleConfig || {}),
      reportData.isPublic || false,
      JSON.stringify(reportData.allowedUsers || []),
      reportData.createdBy
    ]);

    return result.rows[0];
  }

  async executeCustomReport(reportId: string, parameters: Record<string, any> = {}): Promise<ReportResult> {
    const report = await this.getCustomReportById(reportId);
    
    // Construir query baseada na configuração
    const query = this.buildQueryFromConfig(report.query_config, parameters);
    
    // Executar query com timeout
    const result = await this.db.query(query.sql, query.params);
    
    return {
      reportId,
      data: result.rows,
      generatedAt: new Date(),
      parameters,
      chartConfig: report.chart_config
    };
  }

  // ========== INTEGRAÇÃO COM METABASE ==========

  async syncWithMetabase(): Promise<void> {
    // Sincronizar dashboards e questões importantes com Metabase
    const metabaseClient = new MetabaseClient({
      baseUrl: 'https://metabase.kryonix.com.br',
      username: 'kryonix',
      password: 'Vitor@123456'
    });

    // Criar coleção para cada empresa
    const companies = await this.db.query('SELECT id, name FROM auth.companies WHERE is_active = true');
    
    for (const company of companies.rows) {
      await metabaseClient.createOrUpdateCollection({
        name: `Analytics - ${company.name}`,
        description: `Dashboards e relatórios para ${company.name}`,
        parent_id: null
      });
    }

    // Criar dashboards padrão
    await this.createDefaultMetabaseDashboards(metabaseClient);
  }

  private async createDefaultMetabaseDashboards(metabaseClient: MetabaseClient): Promise<void> {
    const dashboards = [
      {
        name: 'Visão Geral Executiva',
        description: 'KPIs principais e métricas de negócio',
        cards: [
          { name: 'Usuários Ativos Diários', query: 'daily_active_users' },
          { name: 'Taxa de Conversão', query: 'conversion_rate' },
          { name: 'Receita Mensal', query: 'monthly_revenue' },
          { name: 'NPS Score', query: 'nps_score' }
        ]
      },
      {
        name: 'Marketing e Aquisição',
        description: 'Métricas de marketing e aquisição de usuários',
        cards: [
          { name: 'Funil de Conversão', query: 'conversion_funnel' },
          { name: 'Performance de Campanhas', query: 'campaign_performance' },
          { name: 'Custo por Aquisição', query: 'customer_acquisition_cost' },
          { name: 'ROI de Marketing', query: 'marketing_roi' }
        ]
      },
      {
        name: 'Retenção e Engajamento',
        description: 'Análise de retenção e engajamento de usuários',
        cards: [
          { name: 'Análise de Coorte', query: 'cohort_analysis' },
          { name: 'Taxa de Retenção', query: 'retention_rate' },
          { name: 'Frequência de Uso', query: 'usage_frequency' },
          { name: 'Lifetime Value', query: 'customer_lifetime_value' }
        ]
      }
    ];

    for (const dashboard of dashboards) {
      await metabaseClient.createDashboard(dashboard);
    }
  }
}
```

## 🎨 **COMPONENTES FRONTEND**
```tsx
// components/analytics/AnalyticsDashboard.tsx
export const AnalyticsDashboard = () => {
  const { metrics, loading } = useDailyMetrics();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const kpiCards = [
    {
      title: 'Usuários Ativos',
      value: metrics?.activeUsers?.toLocaleString() || '0',
      change: metrics?.activeUsersChange || 0,
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'blue'
    },
    {
      title: 'Taxa de Conversão',
      value: `${metrics?.conversionRate?.toFixed(1) || '0'}%`,
      change: metrics?.conversionRateChange || 0,
      icon: <TrendingUpIcon className="h-6 w-6" />,
      color: 'green'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${metrics?.monthlyRevenue?.toLocaleString() || '0'}`,
      change: metrics?.revenueChange || 0,
      icon: <DollarSignIcon className="h-6 w-6" />,
      color: 'purple'
    },
    {
      title: 'Taxa de Bounce',
      value: `${metrics?.bounceRate?.toFixed(1) || '0'}%`,
      change: metrics?.bounceRateChange || 0,
      icon: <ActivityIcon className="h-6 w-6" />,
      color: 'orange',
      invertChange: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Insights e métricas do seu negócio</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visão Geral do Tráfego</CardTitle>
            <CardDescription>
              Usuários ativos, sessões e visualizações de página
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrafficOverviewChart dateRange={dateRange} />
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Páginas Mais Visitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPagesTable dateRange={dateRange} />
          </CardContent>
        </Card>

        {/* User Acquisition */}
        <Card>
          <CardHeader>
            <CardTitle>Canais de Aquisição</CardTitle>
          </CardHeader>
          <CardContent>
            <AcquisitionChannelsChart dateRange={dateRange} />
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionFunnelChart />
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição Geográfica</CardTitle>
          </CardHeader>
          <CardContent>
            <GeographicChart dateRange={dateRange} />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Atividade em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RealTimeActivity />
        </CardContent>
      </Card>
    </div>
  );
};

// components/analytics/KPICard.tsx
interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  invertChange?: boolean;
}

export const KPICard = ({ title, value, change, icon, color, invertChange }: KPICardProps) => {
  const isPositive = invertChange ? change < 0 : change > 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeIcon = isPositive ? (
    <ArrowUpIcon className="h-4 w-4" />
  ) : (
    <ArrowDownIcon className="h-4 w-4" />
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <div className={cn("flex items-center mt-2 text-sm", changeColor)}>
              {changeIcon}
              <span className="ml-1">{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-500 ml-1">vs período anterior</span>
            </div>
          </div>
          <div className={cn(
            'p-3 rounded-lg',
            color === 'blue' && 'bg-blue-100 text-blue-600',
            color === 'green' && 'bg-green-100 text-green-600',
            color === 'purple' && 'bg-purple-100 text-purple-600',
            color === 'orange' && 'bg-orange-100 text-orange-600'
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// components/analytics/ConversionFunnelChart.tsx
export const ConversionFunnelChart = () => {
  const { funnelData, loading } = useConversionFunnel();

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {funnelData?.steps.map((step, index) => (
        <div key={step.stepName} className="relative">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white',
                index === 0 ? 'bg-blue-500' :
                index === 1 ? 'bg-green-500' :
                index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
              )}>
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium">{step.stepName}</h4>
                <p className="text-sm text-gray-500">
                  {step.usersCompleted.toLocaleString()} usuários
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold">
                {step.completionRate.toFixed(1)}%
              </div>
              {index > 0 && (
                <div className="text-sm text-red-600">
                  -{step.dropoffRate.toFixed(1)}% dropoff
                </div>
              )}
            </div>
          </div>
          
          {/* Visual Bar */}
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                index === 0 ? 'bg-blue-500' :
                index === 1 ? 'bg-green-500' :
                index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
              )}
              style={{ width: `${step.completionRate}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// components/analytics/CohortAnalysisTable.tsx
export const CohortAnalysisTable = () => {
  const { cohortData, loading } = useCohortAnalysis();

  if (loading) {
    return <div>Carregando análise de coorte...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Coorte
            </th>
            {Array.from({ length: 12 }, (_, i) => (
              <th key={i} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                M{i}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(cohortData?.cohortMatrix || {}).map(([month, data]) => (
            <tr key={month}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {format(new Date(month), 'MMM yyyy', { locale: ptBR })}
              </td>
              {Array.from({ length: 12 }, (_, i) => {
                const periodData = data[i];
                const retentionRate = periodData 
                  ? (periodData.activeUsers / data[0]?.activeUsers * 100) 
                  : 0;
                
                return (
                  <td key={i} className="px-3 py-4 whitespace-nowrap text-center">
                    {periodData ? (
                      <div 
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          retentionRate >= 80 ? 'bg-green-100 text-green-800' :
                          retentionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          retentionRate >= 20 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        )}
                      >
                        {retentionRate.toFixed(0)}%
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Verificar Metabase funcionando
curl -I https://metabase.kryonix.com.br
curl -X POST https://metabase.kryonix.com.br/api/session \
  -H "Content-Type: application/json" \
  -d '{"username": "kryonix", "password": "Vitor@123456"}'

# 2. Criar schema de analytics
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f analytics-schema.sql

# 3. Configurar TimescaleDB (se necessário)
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

# 4. Executar agregação inicial
curl -X POST https://api.kryonix.com.br/v1/analytics/aggregate-daily \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-01-27"}'

# 5. Testar tracking de evento
curl -X POST https://api.kryonix.com.br/v1/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "page_view",
    "eventCategory": "navigation",
    "eventAction": "view_dashboard",
    "pageUrl": "/dashboard",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "sessionId": "sess_123456789"
  }'
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Schema de analytics criado
- [ ] Metabase conectado ao PostgreSQL
- [ ] Tracking de eventos funcionando
- [ ] Agregação diária configurada
- [ ] Dashboards básicos criados no Metabase
- [ ] Funis de conversão operacionais
- [ ] Análise de coorte implementada
- [ ] Relatórios customizados funcionando
- [ ] Interface de analytics criada
- [ ] Métricas em tempo real no Redis
- [ ] Workers de agregação rodando
- [ ] Integração com todas as stacks

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de tracking
npm run test:analytics:tracking

# Teste de agregação
npm run test:analytics:aggregation

# Teste de funis
npm run test:analytics:funnels

# Teste de coortes
npm run test:analytics:cohorts

# Teste de relatórios
npm run test:analytics:reports

# Teste de performance
npm run test:analytics:performance
```

## 📊 **DASHBOARDS PADRÃO METABASE**
```sql
-- Criar views otimizadas para Metabase
CREATE VIEW analytics.v_daily_overview AS
SELECT 
  dm.date_day,
  dm.active_users,
  dm.new_users,
  dm.page_views,
  dm.conversion_rate,
  dm.revenue,
  c.name as company_name
FROM analytics.daily_metrics dm
JOIN auth.companies c ON dm.company_id = c.id
WHERE dm.date_day >= CURRENT_DATE - INTERVAL '90 days';

CREATE VIEW analytics.v_funnel_performance AS
SELECT 
  cf.name as funnel_name,
  fd.date_day,
  fd.step_name,
  fd.users_entered,
  fd.users_completed,
  fd.completion_rate,
  c.name as company_name
FROM analytics.funnel_data fd
JOIN analytics.conversion_funnels cf ON fd.funnel_id = cf.id
JOIN auth.companies c ON cf.company_id = c.id
WHERE fd.date_day >= CURRENT_DATE - INTERVAL '30 days';

CREATE VIEW analytics.v_user_engagement AS
SELECT 
  DATE_TRUNC('day', ue.occurred_at) as event_date,
  ue.event_category,
  ue.event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT ue.user_id) as unique_users,
  c.name as company_name
FROM analytics.user_events ue
JOIN auth.companies c ON ue.company_id = c.id
WHERE ue.occurred_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', ue.occurred_at), ue.event_category, ue.event_name, c.name;
```

---

import { executeQuery, executeTransaction, DatabaseModule } from '../postgres-config'

// AI monitoring data types based on PARTE-02 specifications
export interface DbMetric {
  id: string
  metric_name: string
  metric_value?: number
  metric_unit?: string
  metric_data: Record<string, any>
  database_name?: string
  table_name?: string
  collected_at: Date
  ai_analysis: Record<string, any>
  recommendations: string[]
  alert_level: 'info' | 'warning' | 'critical'
  action_taken: Record<string, any>
}

export interface AiAction {
  id: string
  action_type: string
  action_description?: string
  sql_executed?: string
  parameters: Record<string, any>
  execution_result: Record<string, any>
  success: boolean
  error_message?: string
  executed_at: Date
  execution_time_ms?: number
  triggered_by?: string
  impact_assessment: Record<string, any>
}

export interface MobileMetrics {
  total_mobile_users: number
  active_sessions: number
  avg_session_duration: number
  daily_active_users: number
  push_notifications_sent_today: number
  failed_logins_today: number
  db_size: string
  slowest_queries: any[]
}

/**
 * Initialize AI monitoring schema and tables
 */
export async function initializeAiMonitoringSchema(module: DatabaseModule = 'platform'): Promise<void> {
  const queries = [
    // Create ai_monitoring schema
    {
      query: 'CREATE SCHEMA IF NOT EXISTS ai_monitoring;'
    },
    
    // Create db_metrics table
    {
      query: `
        CREATE TABLE IF NOT EXISTS ai_monitoring.db_metrics (
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
          alert_level VARCHAR(20) DEFAULT 'info',
          action_taken JSONB DEFAULT '{}'::jsonb
        );
      `
    },
    
    // Create ai_actions table
    {
      query: `
        CREATE TABLE IF NOT EXISTS ai_monitoring.ai_actions (
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
      `
    },
    
    // Create indexes for AI monitoring
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_metrics_name ON ai_monitoring.db_metrics(metric_name);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_metrics_collected_at ON ai_monitoring.db_metrics(collected_at);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_metrics_database ON ai_monitoring.db_metrics(database_name);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_metrics_alert_level ON ai_monitoring.db_metrics(alert_level);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_actions_type ON ai_monitoring.ai_actions(action_type);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_actions_executed_at ON ai_monitoring.ai_actions(executed_at);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_actions_success ON ai_monitoring.ai_actions(success);'
    },
    
    // Create function to collect mobile metrics
    {
      query: `
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
            (SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (COALESCE(logout_at, NOW()) - created_at))/60), 0)
             FROM mobile_users.mobile_sessions 
             WHERE created_at > NOW() - INTERVAL '24 hours'),
            (SELECT COUNT(DISTINCT user_id) FROM mobile_users.mobile_sessions 
             WHERE last_activity > NOW() - INTERVAL '24 hours'),
            (SELECT COUNT(*) FROM mobile_notifications.push_notifications 
             WHERE created_at > NOW() - INTERVAL '24 hours'),
            (SELECT COUNT(*) FROM mobile_users.users 
             WHERE failed_login_attempts > 0 AND updated_at > NOW() - INTERVAL '24 hours'),
            pg_size_pretty(pg_database_size(current_database())),
            '{}'::JSONB;
        END;
        $$ LANGUAGE plpgsql;
      `
    },
    
    // Create function for auto optimization
    {
      query: `
        CREATE OR REPLACE FUNCTION ai_monitoring.auto_optimize_performance()
        RETURNS TEXT AS $$
        DECLARE
          result TEXT := '';
          table_stats RECORD;
        BEGIN
          -- Check for tables that need maintenance
          FOR table_stats IN 
            SELECT schemaname, tablename, n_dead_tup 
            FROM pg_stat_user_tables 
            WHERE n_dead_tup > 1000
          LOOP
            result := result || format('VACUUM ANALYZE %I.%I; ', table_stats.schemaname, table_stats.tablename);
          END LOOP;
          
          -- Register AI action
          INSERT INTO ai_monitoring.ai_actions (
            action_type, 
            action_description, 
            sql_executed,
            success,
            executed_at,
            triggered_by
          ) VALUES (
            'auto_optimization',
            'AI executed automatic performance optimization',
            result,
            TRUE,
            NOW(),
            'system_ai'
          );
          
          RETURN result;
        END;
        $$ LANGUAGE plpgsql;
      `
    }
  ]

  try {
    await executeTransaction(queries, module)
    console.log('✅ AI monitoring schema initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing AI monitoring schema:', error)
    throw error
  }
}

/**
 * Collect mobile platform metrics
 */
export async function collectMobileMetrics(module: DatabaseModule = 'platform'): Promise<MobileMetrics> {
  const query = 'SELECT * FROM ai_monitoring.collect_mobile_metrics();'
  const result = await executeQuery(query, [], module)
  
  if (result[0]) {
    const metrics: MobileMetrics = {
      total_mobile_users: Number(result[0].total_mobile_users) || 0,
      active_sessions: Number(result[0].active_sessions) || 0,
      avg_session_duration: Number(result[0].avg_session_duration) || 0,
      daily_active_users: Number(result[0].daily_active_users) || 0,
      push_notifications_sent_today: Number(result[0].push_notifications_sent_today) || 0,
      failed_logins_today: Number(result[0].failed_logins_today) || 0,
      db_size: result[0].db_size || '0 bytes',
      slowest_queries: result[0].slowest_queries || []
    }
    
    // Store metrics for historical tracking
    await recordMetric({
      metric_name: 'mobile_platform_metrics',
      metric_data: metrics,
      database_name: 'kryonix_platform',
      ai_analysis: {
        timestamp: new Date().toISOString(),
        auto_collected: true
      },
      alert_level: 'info',
      recommendations: []
    }, module)
    
    return metrics
  }
  
  throw new Error('Failed to collect mobile metrics')
}

/**
 * Record a metric for AI analysis
 */
export async function recordMetric(
  metricData: Partial<DbMetric>,
  module: DatabaseModule = 'platform'
): Promise<DbMetric> {
  const query = `
    INSERT INTO ai_monitoring.db_metrics (
      metric_name, metric_value, metric_unit, metric_data,
      database_name, table_name, ai_analysis, recommendations, alert_level
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `
  
  const params = [
    metricData.metric_name,
    metricData.metric_value || null,
    metricData.metric_unit || null,
    JSON.stringify(metricData.metric_data || {}),
    metricData.database_name || null,
    metricData.table_name || null,
    JSON.stringify(metricData.ai_analysis || {}),
    metricData.recommendations || [],
    metricData.alert_level || 'info'
  ]
  
  const result = await executeQuery<DbMetric>(query, params, module)
  return result[0]
}

/**
 * Record an AI action
 */
export async function recordAiAction(
  actionData: Partial<AiAction>,
  module: DatabaseModule = 'platform'
): Promise<AiAction> {
  const query = `
    INSERT INTO ai_monitoring.ai_actions (
      action_type, action_description, sql_executed, parameters,
      execution_result, success, error_message, execution_time_ms,
      triggered_by, impact_assessment
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `
  
  const params = [
    actionData.action_type,
    actionData.action_description || null,
    actionData.sql_executed || null,
    JSON.stringify(actionData.parameters || {}),
    JSON.stringify(actionData.execution_result || {}),
    actionData.success !== undefined ? actionData.success : true,
    actionData.error_message || null,
    actionData.execution_time_ms || null,
    actionData.triggered_by || 'system',
    JSON.stringify(actionData.impact_assessment || {})
  ]
  
  const result = await executeQuery<AiAction>(query, params, module)
  return result[0]
}

/**
 * Get recent metrics by name
 */
export async function getRecentMetrics(
  metricName: string,
  hours: number = 24,
  module: DatabaseModule = 'platform'
): Promise<DbMetric[]> {
  const query = `
    SELECT * FROM ai_monitoring.db_metrics 
    WHERE metric_name = $1 AND collected_at > NOW() - INTERVAL '$2 hours'
    ORDER BY collected_at DESC;
  `
  return executeQuery<DbMetric>(query, [metricName, hours], module)
}

/**
 * Get critical alerts
 */
export async function getCriticalAlerts(
  hours: number = 24,
  module: DatabaseModule = 'platform'
): Promise<DbMetric[]> {
  const query = `
    SELECT * FROM ai_monitoring.db_metrics 
    WHERE alert_level = 'critical' AND collected_at > NOW() - INTERVAL '$1 hours'
    ORDER BY collected_at DESC;
  `
  return executeQuery<DbMetric>(query, [hours], module)
}

/**
 * Get AI action history
 */
export async function getAiActionHistory(
  actionType?: string,
  hours: number = 24,
  module: DatabaseModule = 'platform'
): Promise<AiAction[]> {
  let query = `
    SELECT * FROM ai_monitoring.ai_actions 
    WHERE executed_at > NOW() - INTERVAL '$1 hours'
  `
  const params: any[] = [hours]
  
  if (actionType) {
    query += ' AND action_type = $2'
    params.push(actionType)
  }
  
  query += ' ORDER BY executed_at DESC;'
  
  return executeQuery<AiAction>(query, params, module)
}

/**
 * Execute automatic performance optimization
 */
export async function executeAutoOptimization(module: DatabaseModule = 'platform'): Promise<string> {
  const query = 'SELECT ai_monitoring.auto_optimize_performance();'
  const result = await executeQuery(query, [], module)
  return result[0]?.auto_optimize_performance || ''
}

/**
 * Get database health summary
 */
export async function getDatabaseHealthSummary(module: DatabaseModule = 'platform'): Promise<{
  metrics: MobileMetrics
  critical_alerts: number
  recent_optimizations: number
  avg_response_time: number
}> {
  try {
    const [metrics, criticalAlerts, recentActions] = await Promise.all([
      collectMobileMetrics(module),
      getCriticalAlerts(24, module),
      getAiActionHistory('auto_optimization', 24, module)
    ])
    
    return {
      metrics,
      critical_alerts: criticalAlerts.length,
      recent_optimizations: recentActions.length,
      avg_response_time: 0 // TODO: Implement response time tracking
    }
  } catch (error) {
    console.error('Error getting database health summary:', error)
    throw error
  }
}

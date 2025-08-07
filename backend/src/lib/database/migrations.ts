import { executeQuery, executeTransaction, DatabaseModule } from './postgres-config'
import { recordAiAction } from './schemas/ai-monitoring'

export interface Migration {
  id: string
  version: string
  name: string
  description: string
  sql_up: string
  sql_down: string
  checksum: string
  applied_at?: Date
  execution_time_ms?: number
  success?: boolean
  error_message?: string
  applied_by: string
}

export interface MigrationResult {
  migration: Migration
  success: boolean
  execution_time_ms: number
  error?: string
}

/**
 * Initialize migration system schema
 */
export async function initializeMigrationSchema(module: DatabaseModule = 'platform'): Promise<void> {
  const queries = [
    // Create migration management schema
    {
      query: 'CREATE SCHEMA IF NOT EXISTS migration_management;'
    },
    
    // Create migrations tracking table
    {
      query: `
        CREATE TABLE IF NOT EXISTS migration_management.migrations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          version VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          sql_up TEXT NOT NULL,
          sql_down TEXT,
          checksum VARCHAR(64) NOT NULL,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          execution_time_ms INTEGER,
          success BOOLEAN DEFAULT TRUE,
          error_message TEXT,
          applied_by VARCHAR(100) DEFAULT 'system',
          module_name VARCHAR(50) DEFAULT '${module}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    
    // Create migration history table
    {
      query: `
        CREATE TABLE IF NOT EXISTS migration_management.migration_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          migration_id UUID REFERENCES migration_management.migrations(id),
          action VARCHAR(20) NOT NULL, -- 'apply', 'rollback'
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          execution_time_ms INTEGER,
          success BOOLEAN,
          error_message TEXT,
          executed_by VARCHAR(100)
        );
      `
    },
    
    // Create indexes
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_migrations_version ON migration_management.migrations(version);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON migration_management.migrations(applied_at);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_migrations_success ON migration_management.migrations(success);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_migration_history_migration ON migration_management.migration_history(migration_id);'
    }
  ]

  try {
    await executeTransaction(queries, module)
    console.log('✅ Migration system schema initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing migration schema:', error)
    throw error
  }
}

/**
 * Generate checksum for migration content
 */
function generateChecksum(content: string): string {
  // Simple checksum - in production, use crypto
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * Define core migrations for KRYONIX platform
 */
export const coreMigrations: Omit<Migration, 'id' | 'applied_at' | 'execution_time_ms' | 'success' | 'error_message'>[] = [
  {
    version: '001_initial_mobile_users',
    name: 'Create Mobile Users Schema',
    description: 'Initial mobile users and sessions tables',
    sql_up: `
      CREATE SCHEMA IF NOT EXISTS mobile_users;
      
      CREATE TABLE IF NOT EXISTS mobile_users.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        preferred_language VARCHAR(5) DEFAULT 'pt-BR',
        timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
        mobile_device_info JSONB DEFAULT '{}'::jsonb,
        push_token TEXT,
        last_login_mobile TIMESTAMP WITH TIME ZONE,
        account_status VARCHAR(20) DEFAULT 'active',
        subscription_plan VARCHAR(50),
        subscription_expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_mobile_verified BOOLEAN DEFAULT FALSE,
        is_whatsapp_verified BOOLEAN DEFAULT FALSE,
        mobile_preferences JSONB DEFAULT '{
          "notifications": true,
          "dark_mode": false,
          "language": "pt-BR",
          "timezone": "America/Sao_Paulo"
        }'::jsonb,
        last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        total_logins INTEGER DEFAULT 0,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE
      );
      
      CREATE INDEX idx_users_phone ON mobile_users.users(phone_number);
      CREATE INDEX idx_users_email ON mobile_users.users(email);
      CREATE INDEX idx_users_status ON mobile_users.users(account_status);
    `,
    sql_down: 'DROP SCHEMA IF EXISTS mobile_users CASCADE;',
    checksum: '',
    applied_by: 'system_auto'
  },
  
  {
    version: '002_mobile_sessions',
    name: 'Add Mobile Sessions',
    description: 'Mobile sessions and device tracking',
    sql_up: `
      CREATE TABLE IF NOT EXISTS mobile_users.mobile_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES mobile_users.users(id) ON DELETE CASCADE,
        device_id VARCHAR(255) NOT NULL,
        device_type VARCHAR(20),
        device_info JSONB DEFAULT '{}'::jsonb,
        app_version VARCHAR(20),
        os_version VARCHAR(50),
        ip_address INET,
        location_data JSONB,
        session_token TEXT UNIQUE NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        logout_at TIMESTAMP WITH TIME ZONE,
        logout_reason VARCHAR(50)
      );
      
      CREATE INDEX idx_sessions_user_id ON mobile_users.mobile_sessions(user_id);
      CREATE INDEX idx_sessions_token ON mobile_users.mobile_sessions(session_token);
      CREATE INDEX idx_sessions_active ON mobile_users.mobile_sessions(is_active);
    `,
    sql_down: 'DROP TABLE IF EXISTS mobile_users.mobile_sessions;',
    checksum: '',
    applied_by: 'system_auto'
  },
  
  {
    version: '003_push_notifications',
    name: 'Push Notifications System',
    description: 'Mobile push notifications and tracking',
    sql_up: `
      CREATE SCHEMA IF NOT EXISTS mobile_notifications;
      
      CREATE TABLE IF NOT EXISTS mobile_notifications.push_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES mobile_users.users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        data JSONB DEFAULT '{}'::jsonb,
        image_url TEXT,
        action_url TEXT,
        priority VARCHAR(10) DEFAULT 'normal',
        category VARCHAR(50),
        sent_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        clicked_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'pending',
        platform VARCHAR(10),
        fcm_message_id TEXT,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX idx_notifications_user ON mobile_notifications.push_notifications(user_id);
      CREATE INDEX idx_notifications_status ON mobile_notifications.push_notifications(status);
      CREATE INDEX idx_notifications_category ON mobile_notifications.push_notifications(category);
    `,
    sql_down: 'DROP SCHEMA IF EXISTS mobile_notifications CASCADE;',
    checksum: '',
    applied_by: 'system_auto'
  },
  
  {
    version: '004_ai_monitoring',
    name: 'AI Monitoring System',
    description: 'AI-driven database monitoring and optimization',
    sql_up: `
      CREATE SCHEMA IF NOT EXISTS ai_monitoring;
      
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
      
      CREATE INDEX idx_metrics_name ON ai_monitoring.db_metrics(metric_name);
      CREATE INDEX idx_actions_type ON ai_monitoring.ai_actions(action_type);
    `,
    sql_down: 'DROP SCHEMA IF EXISTS ai_monitoring CASCADE;',
    checksum: '',
    applied_by: 'system_auto'
  },
  
  {
    version: '005_multi_tenant',
    name: 'Multi-Tenant Management',
    description: 'Tenant isolation and management system',
    sql_up: `
      CREATE SCHEMA IF NOT EXISTS tenant_management;
      
      CREATE TABLE IF NOT EXISTS tenant_management.tenants (
        tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_name VARCHAR(255) UNIQUE NOT NULL,
        database_module VARCHAR(50) NOT NULL,
        schema_prefix VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        active BOOLEAN DEFAULT TRUE,
        subscription_plan VARCHAR(50) DEFAULT 'basic',
        resource_limits JSONB DEFAULT '{
          "max_users": 100,
          "max_storage_mb": 1000,
          "max_api_calls_per_day": 10000
        }'::jsonb,
        isolation_level VARCHAR(20) DEFAULT 'schema',
        tenant_config JSONB DEFAULT '{}'::jsonb,
        last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS tenant_management.tenant_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenant_management.tenants(tenant_id) ON DELETE CASCADE,
        user_id UUID NOT NULL,
        user_role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        active BOOLEAN DEFAULT TRUE,
        UNIQUE(tenant_id, user_id)
      );
      
      CREATE INDEX idx_tenants_name ON tenant_management.tenants(tenant_name);
      CREATE INDEX idx_tenant_users_tenant ON tenant_management.tenant_users(tenant_id);
    `,
    sql_down: 'DROP SCHEMA IF EXISTS tenant_management CASCADE;',
    checksum: '',
    applied_by: 'system_auto'
  }
]

// Generate checksums for core migrations
coreMigrations.forEach(migration => {
  migration.checksum = generateChecksum(migration.sql_up + migration.sql_down)
})

/**
 * Apply a single migration
 */
export async function applyMigration(
  migration: Omit<Migration, 'id' | 'applied_at' | 'execution_time_ms' | 'success' | 'error_message'>,
  module: DatabaseModule = 'platform'
): Promise<MigrationResult> {
  const startTime = Date.now()
  const result: MigrationResult = {
    migration: migration as Migration,
    success: false,
    execution_time_ms: 0
  }

  try {
    console.log(`🔄 Applying migration: ${migration.version} - ${migration.name}`)
    
    // Check if migration already applied
    const existingQuery = 'SELECT * FROM migration_management.migrations WHERE version = $1 AND success = TRUE;'
    const existing = await executeQuery(existingQuery, [migration.version], module)
    
    if (existing.length > 0) {
      console.log(`⏭️ Migration ${migration.version} already applied, skipping`)
      result.success = true
      result.execution_time_ms = Date.now() - startTime
      return result
    }
    
    // Execute migration SQL
    await executeQuery(migration.sql_up, [], module)
    
    // Record successful migration
    const recordQuery = `
      INSERT INTO migration_management.migrations (
        version, name, description, sql_up, sql_down, checksum,
        execution_time_ms, success, applied_by, module_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `
    
    const executionTime = Date.now() - startTime
    const recordParams = [
      migration.version,
      migration.name,
      migration.description,
      migration.sql_up,
      migration.sql_down,
      migration.checksum,
      executionTime,
      true,
      migration.applied_by,
      module
    ]
    
    const recordResult = await executeQuery<Migration>(recordQuery, recordParams, module)
    result.migration = recordResult[0]
    result.success = true
    result.execution_time_ms = executionTime
    
    // Record in history
    await recordMigrationHistory(result.migration.id!, 'apply', true, executionTime, module)
    
    // Record AI action
    await recordAiAction({
      action_type: 'migration_applied',
      action_description: `Applied migration: ${migration.name}`,
      parameters: { version: migration.version, module },
      execution_result: { success: true, execution_time_ms: executionTime },
      success: true,
      execution_time_ms: executionTime,
      triggered_by: 'migration_system'
    }, module)
    
    console.log(`✅ Migration applied successfully: ${migration.version} (${executionTime}ms)`)
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = String(error)
    
    // Record failed migration
    try {
      const recordQuery = `
        INSERT INTO migration_management.migrations (
          version, name, description, sql_up, sql_down, checksum,
          execution_time_ms, success, error_message, applied_by, module_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
      `
      
      const recordParams = [
        migration.version,
        migration.name,
        migration.description,
        migration.sql_up,
        migration.sql_down,
        migration.checksum,
        executionTime,
        false,
        errorMessage,
        migration.applied_by,
        module
      ]
      
      await executeQuery(recordQuery, recordParams, module)
    } catch (recordError) {
      console.error('Failed to record migration failure:', recordError)
    }
    
    result.success = false
    result.execution_time_ms = executionTime
    result.error = errorMessage
    
    console.error(`❌ Migration failed: ${migration.version} - ${errorMessage}`)
  }

  return result
}

/**
 * Apply all core migrations
 */
export async function applyAllCoreMigrations(module: DatabaseModule = 'platform'): Promise<MigrationResult[]> {
  console.log(`🚀 Applying all core migrations for module: ${module}`)
  
  // Ensure migration schema exists
  await initializeMigrationSchema(module)
  
  const results: MigrationResult[] = []
  
  for (const migration of coreMigrations) {
    const result = await applyMigration(migration, module)
    results.push(result)
    
    if (!result.success) {
      console.error(`Migration ${migration.version} failed, stopping migration process`)
      break
    }
  }
  
  const successful = results.filter(r => r.success).length
  const total = results.length
  
  console.log(`📊 Migration summary for ${module}: ${successful}/${total} successful`)
  
  return results
}

/**
 * Get migration status for a module
 */
export async function getMigrationStatus(module: DatabaseModule = 'platform'): Promise<{
  total_migrations: number
  applied_migrations: number
  failed_migrations: number
  pending_migrations: string[]
  last_migration?: Migration
}> {
  try {
    // Get applied migrations
    const appliedQuery = `
      SELECT * FROM migration_management.migrations 
      WHERE module_name = $1 AND success = TRUE
      ORDER BY applied_at DESC;
    `
    const appliedMigrations = await executeQuery<Migration>(appliedQuery, [module], module)
    
    // Get failed migrations
    const failedQuery = `
      SELECT * FROM migration_management.migrations 
      WHERE module_name = $1 AND success = FALSE
      ORDER BY applied_at DESC;
    `
    const failedMigrations = await executeQuery<Migration>(failedQuery, [module], module)
    
    // Find pending migrations
    const appliedVersions = appliedMigrations.map(m => m.version)
    const pendingMigrations = coreMigrations
      .filter(m => !appliedVersions.includes(m.version))
      .map(m => m.version)
    
    return {
      total_migrations: coreMigrations.length,
      applied_migrations: appliedMigrations.length,
      failed_migrations: failedMigrations.length,
      pending_migrations: pendingMigrations,
      last_migration: appliedMigrations[0]
    }
  } catch (error) {
    console.error(`Error getting migration status for ${module}:`, error)
    return {
      total_migrations: coreMigrations.length,
      applied_migrations: 0,
      failed_migrations: 0,
      pending_migrations: coreMigrations.map(m => m.version)
    }
  }
}

/**
 * Record migration history
 */
async function recordMigrationHistory(
  migrationId: string,
  action: 'apply' | 'rollback',
  success: boolean,
  executionTimeMs: number,
  module: DatabaseModule,
  executedBy: string = 'system'
): Promise<void> {
  const query = `
    INSERT INTO migration_management.migration_history (
      migration_id, action, success, execution_time_ms, executed_by
    ) VALUES ($1, $2, $3, $4, $5);
  `
  
  await executeQuery(query, [migrationId, action, success, executionTimeMs, executedBy], module)
}

/**
 * Rollback a migration (if rollback SQL is provided)
 */
export async function rollbackMigration(
  version: string,
  module: DatabaseModule = 'platform'
): Promise<MigrationResult> {
  const startTime = Date.now()
  
  try {
    // Get migration details
    const migrationQuery = 'SELECT * FROM migration_management.migrations WHERE version = $1 AND success = TRUE;'
    const migrations = await executeQuery<Migration>(migrationQuery, [version], module)
    
    if (migrations.length === 0) {
      throw new Error(`Migration ${version} not found or not successfully applied`)
    }
    
    const migration = migrations[0]
    
    if (!migration.sql_down) {
      throw new Error(`Migration ${version} does not have rollback SQL`)
    }
    
    // Execute rollback SQL
    await executeQuery(migration.sql_down, [], module)
    
    // Mark migration as rolled back
    const updateQuery = `
      UPDATE migration_management.migrations 
      SET success = FALSE, error_message = 'Rolled back'
      WHERE version = $1;
    `
    await executeQuery(updateQuery, [version], module)
    
    const executionTime = Date.now() - startTime
    
    // Record in history
    await recordMigrationHistory(migration.id!, 'rollback', true, executionTime, module)
    
    console.log(`✅ Migration rolled back successfully: ${version}`)
    
    return {
      migration,
      success: true,
      execution_time_ms: executionTime
    }
    
  } catch (error) {
    console.error(`❌ Rollback failed: ${version} - ${error}`)
    
    return {
      migration: {} as Migration,
      success: false,
      execution_time_ms: Date.now() - startTime,
      error: String(error)
    }
  }
}

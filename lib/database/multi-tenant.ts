import { executeQuery, executeTransaction, DatabaseModule } from './postgres-config'
import { recordAiAction } from './schemas/ai-monitoring'

// Multi-tenant client configuration
export interface TenantConfig {
  tenant_id: string
  tenant_name: string
  database_module: DatabaseModule
  schema_prefix: string
  created_at: Date
  active: boolean
  subscription_plan: string
  resource_limits: {
    max_users: number
    max_storage_mb: number
    max_api_calls_per_day: number
  }
  isolation_level: 'schema' | 'database' | 'row_level'
}

export interface TenantStats {
  tenant_id: string
  total_users: number
  active_sessions: number
  storage_used_mb: number
  api_calls_today: number
  last_activity: Date
}

/**
 * Initialize multi-tenant management schema
 */
export async function initializeMultiTenantSchema(module: DatabaseModule = 'platform'): Promise<void> {
  const queries = [
    // Create tenant management schema
    {
      query: 'CREATE SCHEMA IF NOT EXISTS tenant_management;'
    },
    
    // Create tenants table
    {
      query: `
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
      `
    },
    
    // Create tenant users mapping table
    {
      query: `
        CREATE TABLE IF NOT EXISTS tenant_management.tenant_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID REFERENCES tenant_management.tenants(tenant_id) ON DELETE CASCADE,
          user_id UUID NOT NULL,
          user_role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          active BOOLEAN DEFAULT TRUE,
          UNIQUE(tenant_id, user_id)
        );
      `
    },
    
    // Create tenant resource usage table
    {
      query: `
        CREATE TABLE IF NOT EXISTS tenant_management.tenant_usage (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID REFERENCES tenant_management.tenants(tenant_id) ON DELETE CASCADE,
          usage_date DATE DEFAULT CURRENT_DATE,
          api_calls INTEGER DEFAULT 0,
          storage_used_mb DECIMAL DEFAULT 0,
          active_users INTEGER DEFAULT 0,
          bandwidth_mb DECIMAL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(tenant_id, usage_date)
        );
      `
    },
    
    // Create indexes for performance
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_tenants_name ON tenant_management.tenants(tenant_name);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_tenants_module ON tenant_management.tenants(database_module);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenant_management.tenants(active);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_management.tenant_users(tenant_id);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_management.tenant_users(user_id);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_tenant_usage_tenant ON tenant_management.tenant_usage(tenant_id);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_tenant_usage_date ON tenant_management.tenant_usage(usage_date);'
    }
  ]

  try {
    await executeTransaction(queries, module)
    console.log('✅ Multi-tenant schema initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing multi-tenant schema:', error)
    throw error
  }
}

/**
 * Create a new tenant with automatic client isolation
 */
export async function createTenant(
  tenantData: Partial<TenantConfig>,
  module: DatabaseModule = 'platform'
): Promise<TenantConfig> {
  const startTime = Date.now()
  
  try {
    // Generate unique schema prefix
    const schemaPrefix = `tenant_${tenantData.tenant_name?.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`
    
    // Create tenant record
    const createTenantQuery = `
      INSERT INTO tenant_management.tenants (
        tenant_name, database_module, schema_prefix, subscription_plan,
        resource_limits, isolation_level
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `
    
    const tenantParams = [
      tenantData.tenant_name,
      tenantData.database_module || module,
      schemaPrefix,
      tenantData.subscription_plan || 'basic',
      JSON.stringify(tenantData.resource_limits || {
        max_users: 100,
        max_storage_mb: 1000,
        max_api_calls_per_day: 10000
      }),
      tenantData.isolation_level || 'schema'
    ]
    
    const tenantResult = await executeQuery<TenantConfig>(createTenantQuery, tenantParams, module)
    const tenant = tenantResult[0]
    
    // Create isolated schema for tenant
    await createTenantIsolatedSchema(tenant.tenant_id, schemaPrefix, module)
    
    // Record AI action
    await recordAiAction({
      action_type: 'tenant_creation',
      action_description: `Created new tenant: ${tenant.tenant_name}`,
      parameters: {
        tenant_id: tenant.tenant_id,
        schema_prefix: schemaPrefix,
        isolation_level: tenant.isolation_level
      },
      execution_result: {
        tenant_created: true,
        schema_created: true,
        creation_time_ms: Date.now() - startTime
      },
      success: true,
      execution_time_ms: Date.now() - startTime,
      triggered_by: 'system_auto_creation'
    }, module)
    
    console.log(`✅ Tenant created successfully: ${tenant.tenant_name} (${tenant.tenant_id})`)
    return tenant
    
  } catch (error) {
    // Record failed action
    await recordAiAction({
      action_type: 'tenant_creation',
      action_description: `Failed to create tenant: ${tenantData.tenant_name}`,
      parameters: tenantData,
      execution_result: { error: String(error) },
      success: false,
      error_message: String(error),
      execution_time_ms: Date.now() - startTime,
      triggered_by: 'system_auto_creation'
    }, module)
    
    console.error('❌ Error creating tenant:', error)
    throw error
  }
}

/**
 * Create isolated schema for a tenant
 */
async function createTenantIsolatedSchema(
  tenantId: string, 
  schemaPrefix: string, 
  module: DatabaseModule
): Promise<void> {
  const isolationQueries = [
    // Create tenant-specific schema
    {
      query: `CREATE SCHEMA IF NOT EXISTS ${schemaPrefix};`
    },
    
    // Create tenant-specific users table
    {
      query: `
        CREATE TABLE IF NOT EXISTS ${schemaPrefix}.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID DEFAULT '${tenantId}',
          phone_number VARCHAR(20) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE,
          full_name VARCHAR(255) NOT NULL,
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          active BOOLEAN DEFAULT TRUE,
          tenant_role VARCHAR(50) DEFAULT 'user'
        );
      `
    },
    
    // Create tenant-specific sessions table
    {
      query: `
        CREATE TABLE IF NOT EXISTS ${schemaPrefix}.sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID DEFAULT '${tenantId}',
          user_id UUID REFERENCES ${schemaPrefix}.users(id) ON DELETE CASCADE,
          session_token TEXT UNIQUE NOT NULL,
          device_info JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE,
          active BOOLEAN DEFAULT TRUE
        );
      `
    },
    
    // Create tenant-specific data table
    {
      query: `
        CREATE TABLE IF NOT EXISTS ${schemaPrefix}.tenant_data (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id UUID DEFAULT '${tenantId}',
          data_type VARCHAR(100) NOT NULL,
          data_content JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    
    // Create Row Level Security policies
    {
      query: `
        ALTER TABLE ${schemaPrefix}.users ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS tenant_isolation_users ON ${schemaPrefix}.users;
        CREATE POLICY tenant_isolation_users ON ${schemaPrefix}.users
          FOR ALL USING (tenant_id = '${tenantId}');
      `
    },
    
    {
      query: `
        ALTER TABLE ${schemaPrefix}.sessions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS tenant_isolation_sessions ON ${schemaPrefix}.sessions;
        CREATE POLICY tenant_isolation_sessions ON ${schemaPrefix}.sessions
          FOR ALL USING (tenant_id = '${tenantId}');
      `
    },
    
    {
      query: `
        ALTER TABLE ${schemaPrefix}.tenant_data ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS tenant_isolation_data ON ${schemaPrefix}.tenant_data;
        CREATE POLICY tenant_isolation_data ON ${schemaPrefix}.tenant_data
          FOR ALL USING (tenant_id = '${tenantId}');
      `
    },
    
    // Create indexes for performance
    {
      query: `CREATE INDEX IF NOT EXISTS idx_${schemaPrefix}_users_tenant ON ${schemaPrefix}.users(tenant_id);`
    },
    {
      query: `CREATE INDEX IF NOT EXISTS idx_${schemaPrefix}_sessions_tenant ON ${schemaPrefix}.sessions(tenant_id);`
    },
    {
      query: `CREATE INDEX IF NOT EXISTS idx_${schemaPrefix}_data_tenant ON ${schemaPrefix}.tenant_data(tenant_id);`
    }
  ]

  await executeTransaction(isolationQueries, module)
}

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string, module: DatabaseModule = 'platform'): Promise<TenantConfig | null> {
  const query = 'SELECT * FROM tenant_management.tenants WHERE tenant_id = $1 AND active = TRUE;'
  const result = await executeQuery<TenantConfig>(query, [tenantId], module)
  return result[0] || null
}

/**
 * Get tenant by name
 */
export async function getTenantByName(tenantName: string, module: DatabaseModule = 'platform'): Promise<TenantConfig | null> {
  const query = 'SELECT * FROM tenant_management.tenants WHERE tenant_name = $1 AND active = TRUE;'
  const result = await executeQuery<TenantConfig>(query, [tenantName], module)
  return result[0] || null
}

/**
 * Get all active tenants
 */
export async function getAllActiveTenants(module: DatabaseModule = 'platform'): Promise<TenantConfig[]> {
  const query = `
    SELECT * FROM tenant_management.tenants 
    WHERE active = TRUE 
    ORDER BY created_at DESC;
  `
  return executeQuery<TenantConfig>(query, [], module)
}

/**
 * Add user to tenant
 */
export async function addUserToTenant(
  tenantId: string, 
  userId: string, 
  role: string = 'user',
  module: DatabaseModule = 'platform'
): Promise<void> {
  const query = `
    INSERT INTO tenant_management.tenant_users (tenant_id, user_id, user_role)
    VALUES ($1, $2, $3)
    ON CONFLICT (tenant_id, user_id) 
    DO UPDATE SET user_role = EXCLUDED.user_role, active = TRUE;
  `
  await executeQuery(query, [tenantId, userId, role], module)
}

/**
 * Get tenant statistics
 */
export async function getTenantStats(tenantId: string, module: DatabaseModule = 'platform'): Promise<TenantStats> {
  const tenant = await getTenantById(tenantId, module)
  
  if (!tenant) {
    throw new Error(`Tenant not found: ${tenantId}`)
  }

  // Get user count from tenant schema
  const userCountQuery = `SELECT COUNT(*) as count FROM ${tenant.schema_prefix}.users WHERE active = TRUE;`
  const userCountResult = await executeQuery(userCountQuery, [], module)
  
  // Get active sessions count
  const sessionCountQuery = `SELECT COUNT(*) as count FROM ${tenant.schema_prefix}.sessions WHERE active = TRUE AND expires_at > NOW();`
  const sessionCountResult = await executeQuery(sessionCountQuery, [], module)
  
  // Get usage data
  const usageQuery = `
    SELECT * FROM tenant_management.tenant_usage 
    WHERE tenant_id = $1 AND usage_date = CURRENT_DATE;
  `
  const usageResult = await executeQuery(usageQuery, [tenantId], module)
  const usage = usageResult[0] || {
    api_calls: 0,
    storage_used_mb: 0,
    active_users: 0
  }

  return {
    tenant_id: tenantId,
    total_users: Number(userCountResult[0]?.count) || 0,
    active_sessions: Number(sessionCountResult[0]?.count) || 0,
    storage_used_mb: Number(usage.storage_used_mb) || 0,
    api_calls_today: Number(usage.api_calls) || 0,
    last_activity: tenant.last_activity
  }
}

/**
 * Update tenant resource usage
 */
export async function updateTenantUsage(
  tenantId: string,
  usage: {
    api_calls?: number
    storage_used_mb?: number
    active_users?: number
    bandwidth_mb?: number
  },
  module: DatabaseModule = 'platform'
): Promise<void> {
  const query = `
    INSERT INTO tenant_management.tenant_usage (
      tenant_id, usage_date, api_calls, storage_used_mb, active_users, bandwidth_mb
    ) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5)
    ON CONFLICT (tenant_id, usage_date)
    DO UPDATE SET
      api_calls = tenant_management.tenant_usage.api_calls + EXCLUDED.api_calls,
      storage_used_mb = GREATEST(tenant_management.tenant_usage.storage_used_mb, EXCLUDED.storage_used_mb),
      active_users = GREATEST(tenant_management.tenant_usage.active_users, EXCLUDED.active_users),
      bandwidth_mb = tenant_management.tenant_usage.bandwidth_mb + EXCLUDED.bandwidth_mb,
      created_at = NOW();
  `
  
  await executeQuery(query, [
    tenantId,
    usage.api_calls || 0,
    usage.storage_used_mb || 0,
    usage.active_users || 0,
    usage.bandwidth_mb || 0
  ], module)
}

/**
 * Check if tenant has exceeded resource limits
 */
export async function checkTenantLimits(tenantId: string, module: DatabaseModule = 'platform'): Promise<{
  within_limits: boolean
  exceeded_limits: string[]
  current_usage: TenantStats
  limits: any
}> {
  const tenant = await getTenantById(tenantId, module)
  if (!tenant) {
    throw new Error(`Tenant not found: ${tenantId}`)
  }
  
  const stats = await getTenantStats(tenantId, module)
  const limits = tenant.resource_limits
  const exceededLimits: string[] = []
  
  // Check user limit
  if (stats.total_users > limits.max_users) {
    exceededLimits.push(`users (${stats.total_users}/${limits.max_users})`)
  }
  
  // Check storage limit
  if (stats.storage_used_mb > limits.max_storage_mb) {
    exceededLimits.push(`storage (${stats.storage_used_mb}MB/${limits.max_storage_mb}MB)`)
  }
  
  // Check API calls limit
  if (stats.api_calls_today > limits.max_api_calls_per_day) {
    exceededLimits.push(`API calls (${stats.api_calls_today}/${limits.max_api_calls_per_day})`)
  }
  
  return {
    within_limits: exceededLimits.length === 0,
    exceeded_limits: exceededLimits,
    current_usage: stats,
    limits
  }
}

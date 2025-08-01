import { DatabaseModule, testConnection, executeQuery } from './postgres-config'
import { initializeMobileUsersSchema } from './schemas/mobile-users'
import { initializeMobileNotificationsSchema } from './schemas/mobile-notifications'
import { initializeAiMonitoringSchema } from './schemas/ai-monitoring'

export interface InitializationResult {
  success: boolean
  module: DatabaseModule
  schemas_created: string[]
  errors: string[]
  timing: {
    total_time_ms: number
    connection_test_ms: number
    schema_creation_ms: number
  }
}

/**
 * Initialize a database module with all required schemas
 */
export async function initializeDatabaseModule(module: DatabaseModule = 'platform'): Promise<InitializationResult> {
  const startTime = Date.now()
  const result: InitializationResult = {
    success: false,
    module,
    schemas_created: [],
    errors: [],
    timing: {
      total_time_ms: 0,
      connection_test_ms: 0,
      schema_creation_ms: 0
    }
  }

  try {
    console.log(`🔄 Initializing database module: ${module}`)
    
    // Test connection first
    const connectionStart = Date.now()
    const connectionOk = await testConnection(module)
    result.timing.connection_test_ms = Date.now() - connectionStart
    
    if (!connectionOk) {
      result.errors.push(`Failed to connect to database module: ${module}`)
      return result
    }

    console.log(`✅ Connection test passed for ${module}`)

    // Initialize schemas
    const schemaStart = Date.now()
    
    try {
      // Enable required extensions first
      await enableRequiredExtensions(module)
      result.schemas_created.push('extensions')
      
      // Initialize mobile users schema
      await initializeMobileUsersSchema(module)
      result.schemas_created.push('mobile_users')
      console.log(`✅ Mobile users schema initialized for ${module}`)
      
      // Initialize mobile notifications schema
      await initializeMobileNotificationsSchema(module)
      result.schemas_created.push('mobile_notifications')
      console.log(`✅ Mobile notifications schema initialized for ${module}`)
      
      // Initialize AI monitoring schema
      await initializeAiMonitoringSchema(module)
      result.schemas_created.push('ai_monitoring')
      console.log(`✅ AI monitoring schema initialized for ${module}`)
      
      result.timing.schema_creation_ms = Date.now() - schemaStart
      result.success = true
      
    } catch (schemaError) {
      result.errors.push(`Schema initialization error: ${schemaError}`)
      console.error(`❌ Schema initialization failed for ${module}:`, schemaError)
    }

  } catch (error) {
    result.errors.push(`Database initialization error: ${error}`)
    console.error(`❌ Database initialization failed for ${module}:`, error)
  }

  result.timing.total_time_ms = Date.now() - startTime
  
  if (result.success) {
    console.log(`✅ Database module ${module} initialized successfully in ${result.timing.total_time_ms}ms`)
  } else {
    console.error(`❌ Database module ${module} initialization failed:`, result.errors)
  }

  return result
}

/**
 * Enable required PostgreSQL extensions
 */
async function enableRequiredExtensions(module: DatabaseModule): Promise<void> {
  const extensions = [
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    'CREATE EXTENSION IF NOT EXISTS pgcrypto;',
    'CREATE EXTENSION IF NOT EXISTS pg_trgm;'
  ]

  for (const extensionSQL of extensions) {
    try {
      await executeQuery(extensionSQL, [], module)
    } catch (error) {
      console.warn(`Warning: Could not enable extension: ${extensionSQL}`, error)
      // Don't fail initialization for extensions that might not be available
    }
  }
}

/**
 * Initialize all database modules
 */
export async function initializeAllDatabaseModules(): Promise<{ [key in DatabaseModule]: InitializationResult }> {
  const modules: DatabaseModule[] = [
    'platform', 'analytics', 'scheduling', 'support', 
    'crm', 'marketing', 'social', 'portal', 'whitelabel'
  ]
  
  const results: { [key in DatabaseModule]: InitializationResult } = {} as any
  
  console.log('🚀 Starting initialization of all database modules...')
  
  // Initialize modules in parallel for better performance
  const initPromises = modules.map(async (module) => {
    const result = await initializeDatabaseModule(module)
    results[module] = result
    return result
  })
  
  await Promise.all(initPromises)
  
  // Summary
  const successful = Object.values(results).filter(r => r.success).length
  const failed = Object.values(results).filter(r => !r.success).length
  
  console.log(`📊 Database initialization summary:`)
  console.log(`�� Successful: ${successful}/${modules.length}`)
  console.log(`❌ Failed: ${failed}/${modules.length}`)
  
  if (failed > 0) {
    console.log('Failed modules:')
    Object.entries(results).forEach(([module, result]) => {
      if (!result.success) {
        console.log(`  - ${module}: ${result.errors.join(', ')}`)
      }
    })
  }
  
  return results
}

/**
 * Check database health for a module
 */
export async function checkDatabaseHealth(module: DatabaseModule = 'platform'): Promise<{
  connection: boolean
  schemas: string[]
  tables: { schema: string; table: string; rows: number }[]
  errors: string[]
}> {
  const health = {
    connection: false,
    schemas: [] as string[],
    tables: [] as { schema: string; table: string; rows: number }[],
    errors: [] as string[]
  }

  try {
    // Test connection
    health.connection = await testConnection(module)
    
    if (!health.connection) {
      health.errors.push('Connection failed')
      return health
    }

    // Check schemas
    const schemaQuery = `
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('mobile_users', 'mobile_notifications', 'ai_monitoring');
    `
    const schemas = await executeQuery(schemaQuery, [], module)
    health.schemas = schemas.map(s => s.schema_name)

    // Check tables and row counts
    const tableQuery = `
      SELECT 
        t.table_schema,
        t.table_name,
        COALESCE(c.reltuples::bigint, 0) as estimated_rows
      FROM information_schema.tables t
      LEFT JOIN pg_class c ON c.relname = t.table_name
      WHERE t.table_schema IN ('mobile_users', 'mobile_notifications', 'ai_monitoring')
        AND t.table_type = 'BASE TABLE'
      ORDER BY t.table_schema, t.table_name;
    `
    const tables = await executeQuery(tableQuery, [], module)
    health.tables = tables.map(t => ({
      schema: t.table_schema,
      table: t.table_name,
      rows: Number(t.estimated_rows) || 0
    }))

  } catch (error) {
    health.errors.push(`Health check error: ${error}`)
  }

  return health
}

/**
 * Get initialization status for all modules
 */
export async function getDatabaseInitializationStatus(): Promise<{
  [key in DatabaseModule]: {
    initialized: boolean
    schemas: string[]
    last_check: Date
  }
}> {
  const modules: DatabaseModule[] = [
    'platform', 'analytics', 'scheduling', 'support', 
    'crm', 'marketing', 'social', 'portal', 'whitelabel'
  ]
  
  const status: any = {}
  
  for (const dbModule of modules) {
    try {
      const health = await checkDatabaseHealth(dbModule)
      status[dbModule] = {
        initialized: health.connection && health.schemas.length >= 3,
        schemas: health.schemas,
        last_check: new Date()
      }
    } catch (error) {
      status[dbModule] = {
        initialized: false,
        schemas: [],
        last_check: new Date()
      }
    }
  }
  
  return status
}

/**
 * Repair a database module by re-initializing failed schemas
 */
export async function repairDatabaseModule(module: DatabaseModule): Promise<InitializationResult> {
  console.log(`🔧 Repairing database module: ${module}`)
  
  try {
    // Check current health
    const health = await checkDatabaseHealth(module)
    
    if (!health.connection) {
      throw new Error(`Cannot repair ${module}: connection failed`)
    }
    
    // Re-initialize the module
    return await initializeDatabaseModule(module)
    
  } catch (error) {
    console.error(`❌ Failed to repair database module ${module}:`, error)
    return {
      success: false,
      module,
      schemas_created: [],
      errors: [`Repair failed: ${error}`],
      timing: {
        total_time_ms: 0,
        connection_test_ms: 0,
        schema_creation_ms: 0
      }
    }
  }
}

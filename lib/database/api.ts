import { DatabaseModule } from './postgres-config'
import { 
  initializeDatabaseModule, 
  initializeAllDatabaseModules, 
  checkDatabaseHealth,
  getDatabaseInitializationStatus,
  repairDatabaseModule 
} from './init'
import { collectMobileMetrics, getDatabaseHealthSummary } from './schemas/ai-monitoring'

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface DatabaseStatus {
  module: DatabaseModule
  connected: boolean
  schemas: string[]
  tables: Array<{
    schema: string
    table: string
    rows: number
  }>
  last_check: Date
  health_score: number
}

/**
 * Initialize a specific database module via API
 */
export async function apiInitializeModule(module: DatabaseModule): Promise<ApiResponse> {
  try {
    const result = await initializeDatabaseModule(module)
    
    return {
      success: result.success,
      data: {
        module: result.module,
        schemas_created: result.schemas_created,
        timing: result.timing
      },
      error: result.errors.length > 0 ? result.errors.join('; ') : undefined,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to initialize module ${module}: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Initialize all database modules via API
 */
export async function apiInitializeAllModules(): Promise<ApiResponse> {
  try {
    const results = await initializeAllDatabaseModules()
    
    const successful = Object.values(results).filter(r => r.success).length
    const total = Object.keys(results).length
    
    return {
      success: successful === total,
      data: {
        total_modules: total,
        successful_modules: successful,
        failed_modules: total - successful,
        results: Object.fromEntries(
          Object.entries(results).map(([module, result]) => [
            module,
            {
              success: result.success,
              schemas_created: result.schemas_created,
              timing: result.timing,
              errors: result.errors
            }
          ])
        )
      },
      error: successful < total ? `${total - successful} modules failed to initialize` : undefined,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to initialize modules: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Get database status for a specific module
 */
export async function apiGetModuleStatus(module: DatabaseModule): Promise<ApiResponse<DatabaseStatus>> {
  try {
    const health = await checkDatabaseHealth(module)
    
    // Calculate health score based on connection and schema availability
    let healthScore = 0
    if (health.connection) healthScore += 50
    healthScore += (health.schemas.length / 3) * 30 // 3 expected schemas
    healthScore += Math.min(health.tables.length / 5, 1) * 20 // up to 5 tables expected
    
    const status: DatabaseStatus = {
      module,
      connected: health.connection,
      schemas: health.schemas,
      tables: health.tables,
      last_check: new Date(),
      health_score: Math.round(healthScore)
    }
    
    return {
      success: true,
      data: status,
      error: health.errors.length > 0 ? health.errors.join('; ') : undefined,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to get status for module ${module}: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Get status for all database modules
 */
export async function apiGetAllModulesStatus(): Promise<ApiResponse<{ [key in DatabaseModule]: DatabaseStatus }>> {
  try {
    const initStatus = await getDatabaseInitializationStatus()
    const moduleStatuses: any = {}
    
    for (const [module, status] of Object.entries(initStatus)) {
      const moduleResponse = await apiGetModuleStatus(module as DatabaseModule)
      if (moduleResponse.success && moduleResponse.data) {
        moduleStatuses[module] = moduleResponse.data
      } else {
        moduleStatuses[module] = {
          module: module as DatabaseModule,
          connected: false,
          schemas: [],
          tables: [],
          last_check: new Date(),
          health_score: 0
        }
      }
    }
    
    return {
      success: true,
      data: moduleStatuses,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to get all modules status: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Get mobile platform metrics
 */
export async function apiGetMobileMetrics(): Promise<ApiResponse> {
  try {
    const metrics = await collectMobileMetrics('platform')
    
    return {
      success: true,
      data: {
        metrics,
        collected_at: new Date().toISOString(),
        module: 'platform'
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to collect mobile metrics: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Get comprehensive database health summary
 */
export async function apiGetHealthSummary(): Promise<ApiResponse> {
  try {
    const healthSummary = await getDatabaseHealthSummary('platform')
    
    return {
      success: true,
      data: {
        ...healthSummary,
        summary_generated_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to get health summary: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Repair a database module
 */
export async function apiRepairModule(module: DatabaseModule): Promise<ApiResponse> {
  try {
    const result = await repairDatabaseModule(module)
    
    return {
      success: result.success,
      data: {
        module: result.module,
        schemas_created: result.schemas_created,
        timing: result.timing,
        repair_completed_at: new Date().toISOString()
      },
      error: result.errors.length > 0 ? result.errors.join('; ') : undefined,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to repair module ${module}: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Test database connection for a module
 */
export async function apiTestConnection(module: DatabaseModule): Promise<ApiResponse> {
  try {
    const { testConnection } = await import('./postgres-config')
    const connected = await testConnection(module)
    
    return {
      success: connected,
      data: {
        module,
        connected,
        test_completed_at: new Date().toISOString()
      },
      error: connected ? undefined : `Connection test failed for module ${module}`,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: `Connection test error for module ${module}: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Get database configuration summary
 */
export async function apiGetDatabaseConfig(): Promise<ApiResponse> {
  try {
    const { DATABASE_MODULES } = await import('./postgres-config')
    
    return {
      success: true,
      data: {
        modules: DATABASE_MODULES,
        total_modules: Object.keys(DATABASE_MODULES).length,
        environment: process.env.NODE_ENV || 'development',
        config_loaded_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to get database config: ${error}`,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Development utilities - only available in development mode
 */
export const devUtils = {
  /**
   * Reset a database module (development only)
   */
  async resetModule(module: DatabaseModule): Promise<ApiResponse> {
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'Reset operations are not allowed in production',
        timestamp: new Date().toISOString()
      }
    }

    try {
      // In a real implementation, this would drop and recreate schemas
      console.warn(`⚠️ Reset requested for module ${module} (dev mode)`)
      
      const result = await initializeDatabaseModule(module)
      
      return {
        success: result.success,
        data: {
          module: result.module,
          action: 'reset_and_reinitialize',
          schemas_created: result.schemas_created,
          timing: result.timing
        },
        error: result.errors.length > 0 ? result.errors.join('; ') : undefined,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to reset module ${module}: ${error}`,
        timestamp: new Date().toISOString()
      }
    }
  },

  /**
   * Get development database info
   */
  async getDevInfo(): Promise<ApiResponse> {
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'Development info not available in production',
        timestamp: new Date().toISOString()
      }
    }

    return {
      success: true,
      data: {
        environment: 'development',
        postgres_host: process.env.DB_HOST || 'localhost',
        postgres_port: process.env.DB_PORT || '5432',
        available_modules: Object.keys(await import('./postgres-config').then(m => m.DATABASE_MODULES)),
        dev_features_enabled: true
      },
      timestamp: new Date().toISOString()
    }
  }
}

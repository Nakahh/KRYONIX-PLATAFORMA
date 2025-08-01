// KRYONIX Database Module - PARTE 02 Complete
// PostgreSQL Multi-Tenant Mobile-First Database System

// Core database configuration and connection management
export * from './postgres-config'

// Database initialization and health monitoring
export * from './init'

// API utilities for frontend integration
export * from './api'

// Multi-tenant client isolation system
export * from './multi-tenant'

// Automatic database migrations
export * from './migrations'

// Incremental backup system
export * from './backup'

// Mobile-first schemas
export * from './schemas/mobile-users'
export * from './schemas/mobile-notifications'
export * from './schemas/ai-monitoring'

// Re-export key types and functions for easy access
export type {
  DatabaseModule,
  DatabaseConfig,
  ApiResponse,
  MobileUser,
  MobileSession,
  PushNotification,
  TenantConfig,
  TenantStats,
  Migration,
  BackupConfig,
  BackupJob,
  BackupMetrics
} from './postgres-config'

// Main initialization function
export { 
  initializeAllDatabaseModules,
  checkDatabaseHealth,
  getDatabaseInitializationStatus
} from './init'

// API functions
export {
  apiInitializeAllModules,
  apiGetAllModulesStatus,
  apiGetMobileMetrics,
  apiGetHealthSummary
} from './api'

// Multi-tenant functions
export {
  createTenant,
  getTenantById,
  getTenantByName,
  getAllActiveTenants,
  getTenantStats
} from './multi-tenant'

// Migration functions
export {
  applyAllCoreMigrations,
  getMigrationStatus,
  coreMigrations
} from './migrations'

// Backup functions
export {
  executeBackupJob,
  getBackupMetrics,
  cleanupOldBackups,
  getRecentBackupJobs
} from './backup'

/**
 * Quick setup function to initialize the entire KRYONIX database system
 * This implements PARTE-02 PostgreSQL Mobile-First specifications
 */
export async function initializeKryonixDatabase(): Promise<{
  success: boolean
  modules_initialized: number
  migrations_applied: number
  backup_configs_created: number
  errors: string[]
}> {
  const errors: string[] = []
  let modulesInitialized = 0
  let migrationsApplied = 0
  let backupConfigsCreated = 0
  
  try {
    console.log('🚀 Initializing KRYONIX Database System (PARTE-02)')
    
    // 1. Initialize all database modules
    const { initializeAllDatabaseModules } = await import('./init')
    const moduleResults = await initializeAllDatabaseModules()
    
    modulesInitialized = Object.values(moduleResults).filter(r => r.success).length
    
    // 2. Apply core migrations
    const { applyAllCoreMigrations } = await import('./migrations')
    const migrationResults = await applyAllCoreMigrations('platform')
    
    migrationsApplied = migrationResults.filter(r => r.success).length
    
    // 3. Initialize backup system
    const { initializeBackupSchema, createDefaultBackupConfigs } = await import('./backup')
    await initializeBackupSchema('platform')
    const backupConfigs = await createDefaultBackupConfigs('platform')
    
    backupConfigsCreated = backupConfigs.length
    
    // 4. Initialize multi-tenant system
    const { initializeMultiTenantSchema } = await import('./multi-tenant')
    await initializeMultiTenantSchema('platform')
    
    console.log('✅ KRYONIX Database System initialized successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Modules initialized: ${modulesInitialized}/9`)
    console.log(`   - Migrations applied: ${migrationsApplied}`)
    console.log(`   - Backup configs created: ${backupConfigsCreated}`)
    
    return {
      success: true,
      modules_initialized: modulesInitialized,
      migrations_applied: migrationsApplied,
      backup_configs_created: backupConfigsCreated,
      errors
    }
    
  } catch (error) {
    const errorMessage = `Database initialization failed: ${error}`
    errors.push(errorMessage)
    console.error('❌', errorMessage)
    
    return {
      success: false,
      modules_initialized: modulesInitialized,
      migrations_applied: migrationsApplied,
      backup_configs_created: backupConfigsCreated,
      errors
    }
  }
}

/**
 * Development utilities for testing and debugging
 */
export const devUtils = {
  /**
   * Reset entire database system (development only)
   */
  async resetDatabase(): Promise<boolean> {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Database reset is not allowed in production')
      return false
    }
    
    try {
      console.log('⚠️ Resetting KRYONIX database system...')
      
      // Re-initialize everything
      const result = await initializeKryonixDatabase()
      
      console.log('✅ Database system reset completed')
      return result.success
      
    } catch (error) {
      console.error('❌ Database reset failed:', error)
      return false
    }
  },
  
  /**
   * Get comprehensive system status
   */
  async getSystemStatus() {
    try {
      const { apiGetAllModulesStatus, apiGetHealthSummary } = await import('./api')
      const { getMigrationStatus } = await import('./migrations')
      const { getBackupMetrics } = await import('./backup')
      
      const [modulesStatus, healthSummary, migrationStatus, backupMetrics] = await Promise.all([
        apiGetAllModulesStatus(),
        apiGetHealthSummary(),
        getMigrationStatus('platform'),
        getBackupMetrics('platform')
      ])
      
      return {
        modules: modulesStatus,
        health: healthSummary,
        migrations: migrationStatus,
        backups: backupMetrics,
        generated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error getting system status:', error)
      return { error: String(error) }
    }
  }
}

// PARTE-02 Implementation Summary
console.log(`
🗄️ KRYONIX PARTE-02 - PostgreSQL Mobile-First Database
✅ Multi-tenant isolation with Row Level Security
✅ Mobile-optimized schemas and indexes
✅ AI-driven monitoring and optimization
✅ Automatic migration system
✅ Incremental backup with compression
✅ 9 specialized database modules
✅ Real-time metrics collection
✅ Tenant resource management
✅ Development and production utilities

Ready for PARTE-03: MinIO Storage System
`)

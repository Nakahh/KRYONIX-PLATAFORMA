// KRYONIX Database Module - PARTE 02 Complete
// PostgreSQL Multi-Tenant Mobile-First Database System

// Core database configuration and connection management
export { getPool, testConnection, type DatabaseConfig, type DatabaseModule } from './postgres-config'

// Database initialization and health monitoring
export { 
  initializeAllDatabaseModules,
  checkDatabaseHealth,
  getDatabaseInitializationStatus
} from './init'

// API utilities for frontend integration
export {
  apiInitializeAllModules,
  apiGetAllModulesStatus,
  apiGetMobileMetrics,
  apiGetHealthSummary,
  type ApiResponse
} from './api'

// Multi-tenant client isolation system
export {
  createTenant,
  getTenantById,
  getTenantByName,
  getAllActiveTenants,
  getTenantStats,
  type TenantConfig,
  type TenantStats
} from './multi-tenant'

// Automatic database migrations
export {
  applyAllCoreMigrations,
  getMigrationStatus,
  coreMigrations,
  type Migration
} from './migrations'

// Incremental backup system
export {
  executeBackupJob,
  getBackupMetrics,
  cleanupOldBackups,
  getRecentBackupJobs,
  type BackupConfig,
  type BackupJob,
  type BackupMetrics
} from './backup'

// Mobile-first schemas types only (no circular imports)
export type {
  MobileUser,
  MobileSession,
  PushNotification
} from './schemas/mobile-users'

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

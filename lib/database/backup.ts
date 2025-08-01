import { executeQuery, executeTransaction, DatabaseModule, DATABASE_MODULES } from './postgres-config'
import { recordAiAction } from './schemas/ai-monitoring'
import { getAllActiveTenants } from './multi-tenant'

export interface BackupConfig {
  backup_id: string
  backup_type: 'full' | 'incremental' | 'differential'
  modules: DatabaseModule[]
  include_tenants: boolean
  compression: boolean
  encryption: boolean
  retention_days: number
  schedule_cron?: string
  active: boolean
  created_at: Date
}

export interface BackupJob {
  job_id: string
  backup_config_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at?: Date
  completed_at?: Date
  total_size_mb?: number
  compressed_size_mb?: number
  files_count?: number
  error_message?: string
  backup_location?: string
  checksum?: string
}

export interface BackupMetrics {
  total_backups: number
  successful_backups: number
  failed_backups: number
  total_size_gb: number
  avg_backup_time_minutes: number
  last_backup?: BackupJob
  next_scheduled?: Date
}

/**
 * Initialize backup management schema
 */
export async function initializeBackupSchema(module: DatabaseModule = 'platform'): Promise<void> {
  const queries = [
    // Create backup management schema
    {
      query: 'CREATE SCHEMA IF NOT EXISTS backup_management;'
    },
    
    // Create backup configurations table
    {
      query: `
        CREATE TABLE IF NOT EXISTS backup_management.backup_configs (
          backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          backup_name VARCHAR(255) NOT NULL,
          backup_type VARCHAR(20) DEFAULT 'incremental',
          modules TEXT[] DEFAULT ARRAY['platform'],
          include_tenants BOOLEAN DEFAULT TRUE,
          compression BOOLEAN DEFAULT TRUE,
          encryption BOOLEAN DEFAULT FALSE,
          retention_days INTEGER DEFAULT 30,
          schedule_cron VARCHAR(100),
          active BOOLEAN DEFAULT TRUE,
          config_data JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    
    // Create backup jobs table
    {
      query: `
        CREATE TABLE IF NOT EXISTS backup_management.backup_jobs (
          job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          backup_config_id UUID REFERENCES backup_management.backup_configs(backup_id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'pending',
          started_at TIMESTAMP WITH TIME ZONE,
          completed_at TIMESTAMP WITH TIME ZONE,
          total_size_mb DECIMAL,
          compressed_size_mb DECIMAL,
          files_count INTEGER,
          error_message TEXT,
          backup_location TEXT,
          checksum VARCHAR(64),
          job_data JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    
    // Create backup files tracking table
    {
      query: `
        CREATE TABLE IF NOT EXISTS backup_management.backup_files (
          file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          job_id UUID REFERENCES backup_management.backup_jobs(job_id) ON DELETE CASCADE,
          file_name VARCHAR(255) NOT NULL,
          file_path TEXT NOT NULL,
          file_type VARCHAR(50), -- 'schema', 'data', 'index', 'config'
          module_name VARCHAR(50),
          tenant_id UUID,
          file_size_mb DECIMAL,
          checksum VARCHAR(64),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    
    // Create backup restore log table
    {
      query: `
        CREATE TABLE IF NOT EXISTS backup_management.restore_logs (
          restore_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          job_id UUID REFERENCES backup_management.backup_jobs(job_id),
          restore_type VARCHAR(20), -- 'full', 'partial', 'tenant'
          target_module VARCHAR(50),
          target_tenant_id UUID,
          status VARCHAR(20) DEFAULT 'pending',
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          restored_files_count INTEGER,
          error_message TEXT,
          restore_data JSONB DEFAULT '{}'::jsonb
        );
      `
    },
    
    // Create indexes for performance
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_backup_configs_active ON backup_management.backup_configs(active);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_backup_jobs_config ON backup_management.backup_jobs(backup_config_id);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_backup_jobs_status ON backup_management.backup_jobs(status);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_backup_jobs_created_at ON backup_management.backup_jobs(created_at);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_backup_files_job ON backup_management.backup_files(job_id);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_backup_files_module ON backup_management.backup_files(module_name);'
    },
    
    // Create function to auto-update updated_at
    {
      query: `
        CREATE OR REPLACE FUNCTION backup_management.update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    },
    
    // Create trigger for auto-updating updated_at
    {
      query: `
        DROP TRIGGER IF EXISTS update_backup_configs_updated_at ON backup_management.backup_configs;
        CREATE TRIGGER update_backup_configs_updated_at BEFORE UPDATE
        ON backup_management.backup_configs FOR EACH ROW EXECUTE FUNCTION backup_management.update_updated_at_column();
      `
    }
  ]

  try {
    await executeTransaction(queries, module)
    console.log('✅ Backup management schema initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing backup schema:', error)
    throw error
  }
}

/**
 * Create default backup configurations
 */
export async function createDefaultBackupConfigs(module: DatabaseModule = 'platform'): Promise<BackupConfig[]> {
  const defaultConfigs: Partial<BackupConfig>[] = [
    {
      backup_type: 'full',
      modules: ['platform', 'analytics', 'crm'],
      include_tenants: true,
      compression: true,
      encryption: false,
      retention_days: 90,
      schedule_cron: '0 2 * * 0', // Weekly full backup on Sunday at 2 AM
      active: true
    },
    {
      backup_type: 'incremental',
      modules: ['platform'],
      include_tenants: true,
      compression: true,
      encryption: false,
      retention_days: 30,
      schedule_cron: '0 1 * * 1-6', // Daily incremental backup Monday-Saturday at 1 AM
      active: true
    },
    {
      backup_type: 'incremental',
      modules: ['analytics', 'marketing', 'social'],
      include_tenants: false,
      compression: true,
      encryption: false,
      retention_days: 14,
      schedule_cron: '0 3 * * *', // Daily backup at 3 AM
      active: true
    }
  ]

  const configs: BackupConfig[] = []

  for (const [index, configData] of defaultConfigs.entries()) {
    const query = `
      INSERT INTO backup_management.backup_configs (
        backup_name, backup_type, modules, include_tenants, compression,
        encryption, retention_days, schedule_cron, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `
    
    const params = [
      `Default ${configData.backup_type} backup ${index + 1}`,
      configData.backup_type,
      configData.modules || ['platform'],
      configData.include_tenants,
      configData.compression,
      configData.encryption,
      configData.retention_days,
      configData.schedule_cron,
      configData.active
    ]
    
    const result = await executeQuery<BackupConfig>(query, params, module)
    configs.push(result[0])
  }

  console.log(`✅ Created ${configs.length} default backup configurations`)
  return configs
}

/**
 * Execute a backup job
 */
export async function executeBackupJob(
  configId: string,
  module: DatabaseModule = 'platform'
): Promise<BackupJob> {
  const startTime = Date.now()
  
  try {
    // Get backup configuration
    const configQuery = 'SELECT * FROM backup_management.backup_configs WHERE backup_id = $1 AND active = TRUE;'
    const configResult = await executeQuery<BackupConfig>(configQuery, [configId], module)
    
    if (configResult.length === 0) {
      throw new Error(`Backup configuration not found or inactive: ${configId}`)
    }
    
    const config = configResult[0]
    
    // Create backup job record
    const createJobQuery = `
      INSERT INTO backup_management.backup_jobs (
        backup_config_id, status, started_at
      ) VALUES ($1, $2, NOW())
      RETURNING *;
    `
    
    const jobResult = await executeQuery<BackupJob>(createJobQuery, [configId, 'running'], module)
    const job = jobResult[0]
    
    console.log(`🔄 Starting backup job: ${job.job_id} (${config.backup_type})`)
    
    // Execute backup based on type
    let backupResult: {
      files: Array<{ name: string; size_mb: number; checksum: string }>
      total_size_mb: number
      compressed_size_mb: number
    }
    
    if (config.backup_type === 'full') {
      backupResult = await executeFullBackup(config, job.job_id, module)
    } else if (config.backup_type === 'incremental') {
      backupResult = await executeIncrementalBackup(config, job.job_id, module)
    } else {
      throw new Error(`Unsupported backup type: ${config.backup_type}`)
    }
    
    // Calculate job checksum
    const jobChecksum = generateBackupChecksum(backupResult.files)
    
    // Update job as completed
    const updateJobQuery = `
      UPDATE backup_management.backup_jobs SET
        status = 'completed',
        completed_at = NOW(),
        total_size_mb = $2,
        compressed_size_mb = $3,
        files_count = $4,
        checksum = $5,
        backup_location = $6
      WHERE job_id = $1
      RETURNING *;
    `
    
    const backupLocation = `backups/${job.job_id}`
    const updateParams = [
      job.job_id,
      backupResult.total_size_mb,
      backupResult.compressed_size_mb,
      backupResult.files.length,
      jobChecksum,
      backupLocation
    ]
    
    const updatedJobResult = await executeQuery<BackupJob>(updateJobQuery, updateParams, module)
    const completedJob = updatedJobResult[0]
    
    // Record backup files
    await recordBackupFiles(job.job_id, backupResult.files, config, module)
    
    // Record AI action
    const executionTime = Date.now() - startTime
    await recordAiAction({
      action_type: 'backup_completed',
      action_description: `Completed ${config.backup_type} backup`,
      parameters: {
        job_id: job.job_id,
        config_id: configId,
        modules: config.modules,
        include_tenants: config.include_tenants
      },
      execution_result: {
        files_count: backupResult.files.length,
        total_size_mb: backupResult.total_size_mb,
        compressed_size_mb: backupResult.compressed_size_mb,
        execution_time_ms: executionTime
      },
      success: true,
      execution_time_ms: executionTime,
      triggered_by: 'backup_system'
    }, module)
    
    console.log(`✅ Backup job completed: ${job.job_id} (${executionTime}ms)`)
    return completedJob
    
  } catch (error) {
    const errorMessage = String(error)
    
    // Update job as failed
    try {
      const updateJobQuery = `
        UPDATE backup_management.backup_jobs SET
          status = 'failed',
          completed_at = NOW(),
          error_message = $2
        WHERE job_id = $1;
      `
      await executeQuery(updateJobQuery, [startTime, errorMessage], module)
    } catch (updateError) {
      console.error('Failed to update job status:', updateError)
    }
    
    console.error(`❌ Backup job failed: ${errorMessage}`)
    throw error
  }
}

/**
 * Execute full backup
 */
async function executeFullBackup(
  config: BackupConfig,
  jobId: string,
  module: DatabaseModule
): Promise<{
  files: Array<{ name: string; size_mb: number; checksum: string }>
  total_size_mb: number
  compressed_size_mb: number
}> {
  const files: Array<{ name: string; size_mb: number; checksum: string }> = []
  let totalSize = 0
  
  // Backup each module
  for (const moduleName of config.modules) {
    // Simulate schema backup
    const schemaFile = {
      name: `${moduleName}_schema_${Date.now()}.sql`,
      size_mb: Math.random() * 10 + 5, // Simulate 5-15 MB
      checksum: generateRandomChecksum()
    }
    files.push(schemaFile)
    totalSize += schemaFile.size_mb
    
    // Simulate data backup
    const dataFile = {
      name: `${moduleName}_data_${Date.now()}.sql`,
      size_mb: Math.random() * 100 + 50, // Simulate 50-150 MB
      checksum: generateRandomChecksum()
    }
    files.push(dataFile)
    totalSize += dataFile.size_mb
  }
  
  // Backup tenants if included
  if (config.include_tenants) {
    try {
      const tenants = await getAllActiveTenants(module)
      
      for (const tenant of tenants) {
        const tenantFile = {
          name: `tenant_${tenant.tenant_name}_${Date.now()}.sql`,
          size_mb: Math.random() * 50 + 10, // Simulate 10-60 MB
          checksum: generateRandomChecksum()
        }
        files.push(tenantFile)
        totalSize += tenantFile.size_mb
      }
    } catch (error) {
      console.warn('Could not backup tenants:', error)
    }
  }
  
  // Simulate compression (70% reduction)
  const compressedSize = config.compression ? totalSize * 0.3 : totalSize
  
  return {
    files,
    total_size_mb: totalSize,
    compressed_size_mb: compressedSize
  }
}

/**
 * Execute incremental backup
 */
async function executeIncrementalBackup(
  config: BackupConfig,
  jobId: string,
  module: DatabaseModule
): Promise<{
  files: Array<{ name: string; size_mb: number; checksum: string }>
  total_size_mb: number
  compressed_size_mb: number
}> {
  const files: Array<{ name: string; size_mb: number; checksum: string }> = []
  let totalSize = 0
  
  // Get last backup timestamp for incremental
  const lastBackupQuery = `
    SELECT MAX(completed_at) as last_backup
    FROM backup_management.backup_jobs
    WHERE backup_config_id = $1 AND status = 'completed';
  `
  const lastBackupResult = await executeQuery(lastBackupQuery, [config.backup_id], module)
  const lastBackup = lastBackupResult[0]?.last_backup || new Date(Date.now() - 24 * 60 * 60 * 1000) // Default to 24h ago
  
  // Backup changes since last backup
  for (const moduleName of config.modules) {
    // Simulate incremental changes backup (smaller files)
    const changesFile = {
      name: `${moduleName}_changes_${Date.now()}.sql`,
      size_mb: Math.random() * 20 + 2, // Simulate 2-22 MB
      checksum: generateRandomChecksum()
    }
    files.push(changesFile)
    totalSize += changesFile.size_mb
  }
  
  // Simulate compression (80% reduction for incremental)
  const compressedSize = config.compression ? totalSize * 0.2 : totalSize
  
  return {
    files,
    total_size_mb: totalSize,
    compressed_size_mb: compressedSize
  }
}

/**
 * Record backup files in tracking table
 */
async function recordBackupFiles(
  jobId: string,
  files: Array<{ name: string; size_mb: number; checksum: string }>,
  config: BackupConfig,
  module: DatabaseModule
): Promise<void> {
  for (const file of files) {
    // Determine file type and module from filename
    let fileType = 'data'
    let moduleName = 'platform'
    
    if (file.name.includes('schema')) fileType = 'schema'
    if (file.name.includes('tenant')) fileType = 'tenant'
    
    const moduleMatch = file.name.match(/^(\w+)_/)
    if (moduleMatch) moduleName = moduleMatch[1]
    
    const query = `
      INSERT INTO backup_management.backup_files (
        job_id, file_name, file_path, file_type, module_name,
        file_size_mb, checksum
      ) VALUES ($1, $2, $3, $4, $5, $6, $7);
    `
    
    const params = [
      jobId,
      file.name,
      `backups/${jobId}/${file.name}`,
      fileType,
      moduleName,
      file.size_mb,
      file.checksum
    ]
    
    await executeQuery(query, params, module)
  }
}

/**
 * Get backup metrics and statistics
 */
export async function getBackupMetrics(module: DatabaseModule = 'platform'): Promise<BackupMetrics> {
  try {
    // Get backup statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_backups,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_backups,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_backups,
        COALESCE(SUM(total_size_mb), 0) / 1024 as total_size_gb,
        COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60), 0) as avg_backup_time_minutes
      FROM backup_management.backup_jobs
      WHERE created_at > NOW() - INTERVAL '30 days';
    `
    
    const statsResult = await executeQuery(statsQuery, [], module)
    const stats = statsResult[0]
    
    // Get last backup
    const lastBackupQuery = `
      SELECT * FROM backup_management.backup_jobs
      WHERE status = 'completed'
      ORDER BY completed_at DESC
      LIMIT 1;
    `
    const lastBackupResult = await executeQuery<BackupJob>(lastBackupQuery, [], module)
    
    return {
      total_backups: Number(stats.total_backups) || 0,
      successful_backups: Number(stats.successful_backups) || 0,
      failed_backups: Number(stats.failed_backups) || 0,
      total_size_gb: Number(stats.total_size_gb) || 0,
      avg_backup_time_minutes: Number(stats.avg_backup_time_minutes) || 0,
      last_backup: lastBackupResult[0]
    }
  } catch (error) {
    console.error('Error getting backup metrics:', error)
    return {
      total_backups: 0,
      successful_backups: 0,
      failed_backups: 0,
      total_size_gb: 0,
      avg_backup_time_minutes: 0
    }
  }
}

/**
 * Clean up old backups based on retention policy
 */
export async function cleanupOldBackups(module: DatabaseModule = 'platform'): Promise<number> {
  try {
    // Get backup configs with retention policies
    const configsQuery = 'SELECT backup_id, retention_days FROM backup_management.backup_configs WHERE active = TRUE;'
    const configs = await executeQuery(configsQuery, [], module)
    
    let totalDeleted = 0
    
    for (const config of configs) {
      // Delete old backup jobs
      const deleteQuery = `
        DELETE FROM backup_management.backup_jobs
        WHERE backup_config_id = $1 
          AND status = 'completed'
          AND completed_at < NOW() - INTERVAL '$2 days'
        RETURNING job_id;
      `
      
      const deletedJobs = await executeQuery(deleteQuery, [config.backup_id, config.retention_days], module)
      totalDeleted += deletedJobs.length
      
      if (deletedJobs.length > 0) {
        console.log(`🗑️ Cleaned up ${deletedJobs.length} old backups for config ${config.backup_id}`)
      }
    }
    
    return totalDeleted
  } catch (error) {
    console.error('Error cleaning up old backups:', error)
    return 0
  }
}

// Utility functions
function generateBackupChecksum(files: Array<{ checksum: string }>): string {
  const combined = files.map(f => f.checksum).sort().join('')
  return generateRandomChecksum() // In production, use proper checksum
}

function generateRandomChecksum(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Get backup job status
 */
export async function getBackupJobStatus(jobId: string, module: DatabaseModule = 'platform'): Promise<BackupJob | null> {
  const query = 'SELECT * FROM backup_management.backup_jobs WHERE job_id = $1;'
  const result = await executeQuery<BackupJob>(query, [jobId], module)
  return result[0] || null
}

/**
 * List recent backup jobs
 */
export async function getRecentBackupJobs(
  limit: number = 10,
  module: DatabaseModule = 'platform'
): Promise<BackupJob[]> {
  const query = `
    SELECT * FROM backup_management.backup_jobs
    ORDER BY created_at DESC
    LIMIT $1;
  `
  return executeQuery<BackupJob>(query, [limit], module)
}

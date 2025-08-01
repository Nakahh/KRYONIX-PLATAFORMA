import { Pool } from 'pg'

// Database configuration for KRYONIX multi-tenant platform
export interface DatabaseConfig {
  host: string
  port: number
  database: string
  user: string
  password: string
  ssl?: boolean
  max?: number
  idleTimeoutMillis?: number
  connectionTimeoutMillis?: number
}

// Default configuration for development
const defaultConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kryonix_platform',
  user: process.env.DB_USER || 'kryonix',
  password: process.env.DB_PASSWORD || 'Vitor@123456',
  ssl: process.env.NODE_ENV === 'production',
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
}

// Database modules configuration
export const DATABASE_MODULES = {
  platform: 'kryonix_platform',
  analytics: 'kryonix_analytics',
  scheduling: 'kryonix_scheduling',
  support: 'kryonix_support',
  crm: 'kryonix_crm',
  marketing: 'kryonix_marketing',
  social: 'kryonix_social',
  portal: 'kryonix_portal',
  whitelabel: 'kryonix_whitelabel'
} as const

export type DatabaseModule = keyof typeof DATABASE_MODULES

// Database connection pools for each module
const pools: Map<string, Pool> = new Map()

/**
 * Get or create database connection pool for a specific module
 */
export function getPool(module: DatabaseModule = 'platform'): Pool {
  const dbName = DATABASE_MODULES[module]
  
  if (!pools.has(dbName)) {
    const config = {
      ...defaultConfig,
      database: dbName
    }
    
    const pool = new Pool(config)
    
    // Handle connection errors
    pool.on('error', (err) => {
      console.error(`Database pool error for ${module}:`, err)
    })
    
    // Handle client connections
    pool.on('connect', (client) => {
      console.log(`Connected to database: ${module}`)
    })
    
    pools.set(dbName, pool)
  }
  
  return pools.get(dbName)!
}

/**
 * Close all database connections
 */
export async function closeAllPools(): Promise<void> {
  const closePromises = Array.from(pools.values()).map(pool => pool.end())
  await Promise.all(closePromises)
  pools.clear()
}

/**
 * Test database connection
 */
export async function testConnection(module: DatabaseModule = 'platform'): Promise<boolean> {
  try {
    const pool = getPool(module)
    const client = await pool.connect()
    
    try {
      const result = await client.query('SELECT NOW() as current_time')
      console.log(`Database ${module} connection test passed:`, result.rows[0])
      return true
    } finally {
      client.release()
    }
  } catch (error) {
    console.error(`Database ${module} connection test failed:`, error)
    return false
  }
}

/**
 * Execute query with automatic connection management
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = [],
  module: DatabaseModule = 'platform'
): Promise<T[]> {
  const pool = getPool(module)
  const client = await pool.connect()
  
  try {
    const result = await client.query(query, params)
    return result.rows
  } finally {
    client.release()
  }
}

/**
 * Execute transaction with automatic rollback on error
 */
export async function executeTransaction<T>(
  queries: Array<{ query: string; params?: any[] }>,
  module: DatabaseModule = 'platform'
): Promise<T[]> {
  const pool = getPool(module)
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    const results: T[] = []
    for (const { query, params = [] } of queries) {
      const result = await client.query(query, params)
      results.push(result.rows)
    }
    
    await client.query('COMMIT')
    return results
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

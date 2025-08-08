// NEON DATABASE CONFIGURATION FOR RENDER FREE TIER
// Compatible with PostgreSQL and optimized for free hosting

import { Pool } from 'pg';

export interface DatabaseConfig {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean | object;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Default configuration for Neon + Render
export const neonConfig: DatabaseConfig = {
  // Primary connection via DATABASE_URL (Render standard)
  connectionString: process.env.DATABASE_URL,
  
  // Fallback individual parameters
  host: process.env.DB_HOST || 'ep-xxx-xxx.neon.tech',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kryonix_platform',
  user: process.env.DB_USER || 'kryonix',
  password: process.env.DB_PASSWORD || 'Vitor@123456',
  
  // SSL required for Neon
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Pool settings optimized for free tier
  max: 3, // Limited connections for free tier
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

// Create connection pool
export const createNeonPool = (config: DatabaseConfig = neonConfig): Pool => {
  // Prefer DATABASE_URL (Render standard)
  if (config.connectionString) {
    return new Pool({
      connectionString: config.connectionString,
      ssl: config.ssl,
      max: config.max,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis,
    });
  }
  
  // Fallback to individual parameters
  return new Pool(config);
};

// Default pool instance
export const neonPool = createNeonPool();

// Test connection function
export const testNeonConnection = async (): Promise<boolean> => {
  try {
    const client = await neonPool.connect();
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      console.log('✅ Neon Database connected:', {
        time: result.rows[0].current_time,
        version: result.rows[0].pg_version.split(' ')[0]
      });
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Neon Database connection failed:', error);
    return false;
  }
};

// Initialize database schema
export const initNeonSchema = async (): Promise<void> => {
  const client = await neonPool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create default admin user
    await client.query(`
      INSERT INTO users (username, password_hash, email, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO NOTHING
    `, [
      'kryonix',
      '$2b$12$hashedPasswordWillBeGeneratedHere', // Will be properly hashed
      'admin@kryonix.com.br',
      'KRYONIX Administrator',
      'admin'
    ]);
    
    // Create waitlist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        company_name VARCHAR(255),
        phone VARCHAR(50),
        interest_areas TEXT[],
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(255) NOT NULL,
        event_data JSONB,
        user_id INTEGER REFERENCES users(id),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Neon Database schema initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Neon schema:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default neonPool;

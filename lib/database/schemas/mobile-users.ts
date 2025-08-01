import { executeQuery, executeTransaction, DatabaseModule } from '../postgres-config'

// Mobile user data types based on PARTE-02 specifications
export interface MobileUser {
  id: string
  phone_number: string
  email?: string
  full_name: string
  avatar_url?: string
  preferred_language: string
  timezone: string
  mobile_device_info: Record<string, any>
  push_token?: string
  last_login_mobile?: Date
  account_status: 'active' | 'inactive' | 'suspended' | 'pending'
  subscription_plan?: string
  subscription_expires_at?: Date
  created_at: Date
  updated_at: Date
  is_mobile_verified: boolean
  is_whatsapp_verified: boolean
  mobile_preferences: {
    notifications: boolean
    dark_mode: boolean
    language: string
    timezone: string
  }
  last_seen_at: Date
  total_logins: number
  failed_login_attempts: number
  locked_until?: Date
}

export interface MobileSession {
  id: string
  user_id: string
  device_id: string
  device_type: 'android' | 'ios' | 'web'
  device_info: Record<string, any>
  app_version?: string
  os_version?: string
  ip_address?: string
  location_data?: Record<string, any>
  session_token: string
  refresh_token?: string
  expires_at?: Date
  is_active: boolean
  created_at: Date
  last_activity: Date
  logout_at?: Date
  logout_reason?: string
}

export interface PushNotification {
  id: string
  user_id: string
  title: string
  body: string
  data: Record<string, any>
  image_url?: string
  action_url?: string
  priority: 'low' | 'normal' | 'high'
  category: 'marketing' | 'system' | 'alert' | 'chat'
  sent_at?: Date
  delivered_at?: Date
  clicked_at?: Date
  status: 'pending' | 'sent' | 'delivered' | 'clicked' | 'failed'
  platform: 'android' | 'ios' | 'web'
  fcm_message_id?: string
  error_message?: string
  retry_count: number
  created_at: Date
}

/**
 * Initialize mobile users schema and tables
 */
export async function initializeMobileUsersSchema(module: DatabaseModule = 'platform'): Promise<void> {
  const queries = [
    // Create mobile_users schema
    {
      query: 'CREATE SCHEMA IF NOT EXISTS mobile_users;'
    },
    
    // Create users table with mobile-first optimizations
    {
      query: `
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
      `
    },
    
    // Create optimized indexes for mobile queries
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_users_phone ON mobile_users.users(phone_number);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_users_email ON mobile_users.users(email);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_users_last_login ON mobile_users.users(last_login_mobile);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_users_status ON mobile_users.users(account_status);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_users_subscription ON mobile_users.users(subscription_plan);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_users_mobile_device ON mobile_users.users USING GIN(mobile_device_info);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_users_preferences ON mobile_users.users USING GIN(mobile_preferences);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_users_last_seen ON mobile_users.users(last_seen_at);'
    },
    
    // Create mobile sessions table
    {
      query: `
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
      `
    },
    
    // Create session indexes
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON mobile_users.mobile_sessions(user_id);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_sessions_token ON mobile_users.mobile_sessions(session_token);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_sessions_device ON mobile_users.mobile_sessions(device_id);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_sessions_active ON mobile_users.mobile_sessions(is_active);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON mobile_users.mobile_sessions(last_activity);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_sessions_device_type ON mobile_users.mobile_sessions(device_type);'
    },
    
    // Create function to auto-update updated_at
    {
      query: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
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
        DROP TRIGGER IF EXISTS update_users_updated_at ON mobile_users.users;
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE
        ON mobile_users.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `
    }
  ]

  try {
    await executeTransaction(queries, module)
    console.log('✅ Mobile users schema initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing mobile users schema:', error)
    throw error
  }
}

/**
 * Create a new mobile user
 */
export async function createMobileUser(userData: Partial<MobileUser>, module: DatabaseModule = 'platform'): Promise<MobileUser> {
  const query = `
    INSERT INTO mobile_users.users (
      phone_number, email, full_name, avatar_url, preferred_language,
      timezone, mobile_device_info, push_token, subscription_plan,
      mobile_preferences, is_mobile_verified, is_whatsapp_verified
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `
  
  const params = [
    userData.phone_number,
    userData.email || null,
    userData.full_name,
    userData.avatar_url || null,
    userData.preferred_language || 'pt-BR',
    userData.timezone || 'America/Sao_Paulo',
    JSON.stringify(userData.mobile_device_info || {}),
    userData.push_token || null,
    userData.subscription_plan || null,
    JSON.stringify(userData.mobile_preferences || {
      notifications: true,
      dark_mode: false,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    }),
    userData.is_mobile_verified || false,
    userData.is_whatsapp_verified || false
  ]
  
  const result = await executeQuery<MobileUser>(query, params, module)
  return result[0]
}

/**
 * Get mobile user by phone number
 */
export async function getMobileUserByPhone(phoneNumber: string, module: DatabaseModule = 'platform'): Promise<MobileUser | null> {
  const query = 'SELECT * FROM mobile_users.users WHERE phone_number = $1;'
  const result = await executeQuery<MobileUser>(query, [phoneNumber], module)
  return result[0] || null
}

/**
 * Create mobile session
 */
export async function createMobileSession(sessionData: Partial<MobileSession>, module: DatabaseModule = 'platform'): Promise<MobileSession> {
  const query = `
    INSERT INTO mobile_users.mobile_sessions (
      user_id, device_id, device_type, device_info, app_version,
      os_version, ip_address, location_data, session_token,
      refresh_token, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `
  
  const params = [
    sessionData.user_id,
    sessionData.device_id,
    sessionData.device_type,
    JSON.stringify(sessionData.device_info || {}),
    sessionData.app_version,
    sessionData.os_version,
    sessionData.ip_address,
    JSON.stringify(sessionData.location_data || {}),
    sessionData.session_token,
    sessionData.refresh_token,
    sessionData.expires_at
  ]
  
  const result = await executeQuery<MobileSession>(query, params, module)
  return result[0]
}

/**
 * Get active sessions for user
 */
export async function getActiveSessionsForUser(userId: string, module: DatabaseModule = 'platform'): Promise<MobileSession[]> {
  const query = `
    SELECT * FROM mobile_users.mobile_sessions 
    WHERE user_id = $1 AND is_active = TRUE 
    ORDER BY last_activity DESC;
  `
  return executeQuery<MobileSession>(query, [userId], module)
}

/**
 * Update user last seen timestamp
 */
export async function updateUserLastSeen(userId: string, module: DatabaseModule = 'platform'): Promise<void> {
  const query = `
    UPDATE mobile_users.users 
    SET last_seen_at = NOW(), total_logins = total_logins + 1 
    WHERE id = $1;
  `
  await executeQuery(query, [userId], module)
}

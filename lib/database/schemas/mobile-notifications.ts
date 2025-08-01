import { executeQuery, executeTransaction, DatabaseModule } from '../postgres-config'

// Push notification data types based on PARTE-02 specifications
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
 * Initialize mobile notifications schema and tables
 */
export async function initializeMobileNotificationsSchema(module: DatabaseModule = 'platform'): Promise<void> {
  const queries = [
    // Create mobile_notifications schema
    {
      query: 'CREATE SCHEMA IF NOT EXISTS mobile_notifications;'
    },
    
    // Create push_notifications table
    {
      query: `
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
      `
    },
    
    // Create optimized indexes for notifications
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_notifications_user ON mobile_notifications.push_notifications(user_id);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_notifications_status ON mobile_notifications.push_notifications(status);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON mobile_notifications.push_notifications(sent_at);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_notifications_category ON mobile_notifications.push_notifications(category);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_notifications_platform ON mobile_notifications.push_notifications(platform);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_notifications_priority ON mobile_notifications.push_notifications(priority);'
    },
    {
      query: 'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON mobile_notifications.push_notifications(created_at);'
    }
  ]

  try {
    await executeTransaction(queries, module)
    console.log('✅ Mobile notifications schema initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing mobile notifications schema:', error)
    throw error
  }
}

/**
 * Create a new push notification
 */
export async function createPushNotification(
  notificationData: Partial<PushNotification>, 
  module: DatabaseModule = 'platform'
): Promise<PushNotification> {
  const query = `
    INSERT INTO mobile_notifications.push_notifications (
      user_id, title, body, data, image_url, action_url,
      priority, category, platform, fcm_message_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `
  
  const params = [
    notificationData.user_id,
    notificationData.title,
    notificationData.body,
    JSON.stringify(notificationData.data || {}),
    notificationData.image_url || null,
    notificationData.action_url || null,
    notificationData.priority || 'normal',
    notificationData.category || 'system',
    notificationData.platform || 'web',
    notificationData.fcm_message_id || null
  ]
  
  const result = await executeQuery<PushNotification>(query, params, module)
  return result[0]
}

/**
 * Update notification status
 */
export async function updateNotificationStatus(
  notificationId: string,
  status: PushNotification['status'],
  errorMessage?: string,
  module: DatabaseModule = 'platform'
): Promise<void> {
  let query = `
    UPDATE mobile_notifications.push_notifications 
    SET status = $2, retry_count = retry_count + 1
  `
  const params: any[] = [notificationId, status]
  
  if (status === 'sent') {
    query += ', sent_at = NOW()'
  } else if (status === 'delivered') {
    query += ', delivered_at = NOW()'
  } else if (status === 'clicked') {
    query += ', clicked_at = NOW()'
  } else if (status === 'failed' && errorMessage) {
    query += ', error_message = $3'
    params.push(errorMessage)
  }
  
  query += ' WHERE id = $1;'
  
  await executeQuery(query, params, module)
}

/**
 * Get pending notifications for processing
 */
export async function getPendingNotifications(
  limit: number = 100,
  module: DatabaseModule = 'platform'
): Promise<PushNotification[]> {
  const query = `
    SELECT * FROM mobile_notifications.push_notifications 
    WHERE status = 'pending' AND retry_count < 3
    ORDER BY priority DESC, created_at ASC 
    LIMIT $1;
  `
  return executeQuery<PushNotification>(query, [limit], module)
}

/**
 * Get notifications for a specific user
 */
export async function getNotificationsForUser(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  module: DatabaseModule = 'platform'
): Promise<PushNotification[]> {
  const query = `
    SELECT * FROM mobile_notifications.push_notifications 
    WHERE user_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2 OFFSET $3;
  `
  return executeQuery<PushNotification>(query, [userId, limit, offset], module)
}

/**
 * Get notification statistics for a user
 */
export async function getNotificationStats(
  userId: string,
  days: number = 30,
  module: DatabaseModule = 'platform'
): Promise<{
  total_sent: number
  total_delivered: number
  total_clicked: number
  click_rate: number
  delivery_rate: number
}> {
  const query = `
    SELECT 
      COUNT(CASE WHEN status = 'sent' THEN 1 END) as total_sent,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as total_delivered,
      COUNT(CASE WHEN status = 'clicked' THEN 1 END) as total_clicked,
      ROUND(
        (COUNT(CASE WHEN status = 'clicked' THEN 1 END)::float / 
         NULLIF(COUNT(CASE WHEN status = 'delivered' THEN 1 END), 0)) * 100, 2
      ) as click_rate,
      ROUND(
        (COUNT(CASE WHEN status = 'delivered' THEN 1 END)::float / 
         NULLIF(COUNT(CASE WHEN status = 'sent' THEN 1 END), 0)) * 100, 2
      ) as delivery_rate
    FROM mobile_notifications.push_notifications 
    WHERE user_id = $1 AND created_at > NOW() - INTERVAL '$2 days';
  `
  
  const result = await executeQuery(query, [userId, days], module)
  return result[0] || {
    total_sent: 0,
    total_delivered: 0,
    total_clicked: 0,
    click_rate: 0,
    delivery_rate: 0
  }
}

/**
 * Bulk create notifications for multiple users
 */
export async function bulkCreateNotifications(
  userIds: string[],
  notificationData: Partial<PushNotification>,
  module: DatabaseModule = 'platform'
): Promise<number> {
  if (userIds.length === 0) return 0
  
  const values = userIds.map((userId, index) => {
    const baseIndex = index * 9
    return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9})`
  }).join(', ')
  
  const query = `
    INSERT INTO mobile_notifications.push_notifications (
      user_id, title, body, data, image_url, action_url,
      priority, category, platform
    ) VALUES ${values}
    RETURNING id;
  `
  
  const params: any[] = []
  userIds.forEach(userId => {
    params.push(
      userId,
      notificationData.title,
      notificationData.body,
      JSON.stringify(notificationData.data || {}),
      notificationData.image_url || null,
      notificationData.action_url || null,
      notificationData.priority || 'normal',
      notificationData.category || 'system',
      notificationData.platform || 'web'
    )
  })
  
  const result = await executeQuery(query, params, module)
  return result.length
}

/**
 * Clean up old notifications (older than specified days)
 */
export async function cleanupOldNotifications(
  days: number = 90,
  module: DatabaseModule = 'platform'
): Promise<number> {
  const query = `
    DELETE FROM mobile_notifications.push_notifications 
    WHERE created_at < NOW() - INTERVAL '$1 days'
    RETURNING id;
  `
  
  const result = await executeQuery(query, [days], module)
  return result.length
}

import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";

// Load environment variables
config();

// Database entities (will be imported as we create them)
const entities = [
  // User and tenant entities
  "server/entities/Tenant.ts",
  "server/entities/User.ts",
  "server/entities/Subscription.ts",

  // WhatsApp entities
  "server/entities/WhatsAppInstance.ts",
  "server/entities/Message.ts",
  "server/entities/MessageTemplate.ts",

  // N8N Workflow entities
  "server/entities/WorkflowTemplate.ts",
  "server/entities/WorkflowExecution.ts",

  // Typebot entities
  "server/entities/TypebotFlow.ts",
  "server/entities/TypebotSession.ts",

  // AI Service entities
  "server/entities/AIServiceUsage.ts",
  "server/entities/AIModelConfig.ts",
  "server/entities/AIResponseCache.ts",

  // Mautic Marketing entities
  "server/entities/MauticInstance.ts",
  "server/entities/MauticLead.ts",
  "server/entities/MauticCampaign.ts",

  // Integration entities
  "server/entities/Integration.ts",
  "server/entities/Webhook.ts",
  "server/entities/ApiKey.ts",

  // Notification entities
  "server/entities/NotificationTemplate.ts",
  "server/entities/NotificationDelivery.ts",
  "server/entities/NotificationEvent.ts",
  "server/entities/NotificationPreference.ts",
];

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "kryonix",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "kryonix_dev",
  synchronize: process.env.NODE_ENV === "development", // Only in development
  logging: process.env.NODE_ENV === "development",
  entities: entities,
  migrations: ["server/migrations/*.ts"],
  subscribers: ["server/subscribers/*.ts"],
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Redis connection for caching and queues
import Redis from "ioredis";

// Create Redis instance with optional connection for development
export const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true, // Don't connect immediately
    // Silence connection errors in development
    silentErrors: process.env.NODE_ENV === "development",
  },
);

// Handle Redis connection errors gracefully in development
redis.on("error", (error) => {
  if (process.env.NODE_ENV === "development") {
    // Silently ignore Redis errors in development
    return;
  }
  console.error("Redis connection error:", error);
});

// Database initialization
export async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database connection...");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connected successfully");
    }

    // Test Redis connection (optional in development)
    try {
      await redis.ping();
      console.log("✅ Redis connected successfully");
    } catch (redisError) {
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️  Redis not available (running without caching)");
      } else {
        throw redisError;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error);

    // Fallback to in-memory storage in development
    if (process.env.NODE_ENV === "development") {
      console.log("⚠️  Using in-memory storage as fallback");
      return false;
    }

    throw error;
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("��� Database connection closed");
    }

    try {
      await redis.quit();
      console.log("✅ Redis connection closed");
    } catch (redisError) {
      if (process.env.NODE_ENV !== "development") {
        console.error("Error closing Redis connection:", redisError);
      }
    }
  } catch (error) {
    console.error("❌ Error closing database connections:", error);
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    if (!AppDataSource.isInitialized) {
      return { status: "disconnected", database: false, redis: false };
    }

    // Test database connection
    await AppDataSource.query("SELECT 1");
    const dbHealthy = true;

    // Test Redis connection (optional in development)
    let redisHealthy = false;
    try {
      const pong = await redis.ping();
      redisHealthy = pong === "PONG";
    } catch (redisError) {
      if (process.env.NODE_ENV !== "development") {
        console.error("Redis health check failed:", redisError);
      }
      redisHealthy = false;
    }

    return {
      status: dbHealthy && redisHealthy ? "healthy" : "degraded",
      database: dbHealthy,
      redis: redisHealthy,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      database: false,
      redis: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

// Export Redis instance for use in other modules
export { redis as Redis };

// Export function to get data source (compatibility)
export const getDataSource = () => {
  if (!AppDataSource.isInitialized) {
    return null;
  }
  return AppDataSource;
};

// Database connection class for compatibility
export class DatabaseConnection {
  static dataSource = AppDataSource;
  static redis = redis;

  static async initialize() {
    return initializeDatabase();
  }

  static async close() {
    return closeDatabase();
  }

  static async healthCheck() {
    return checkDatabaseHealth();
  }

  static getRepository(entity: any) {
    return AppDataSource.getRepository(entity);
  }
}

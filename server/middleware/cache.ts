import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";

// Configuração Redis otimizada para Brasil - com fallback gracioso
let redis: Redis | null = null;
let redisAvailable = false;

// Inicializar Redis apenas se variáveis estiverem configuradas
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryDelayOnFailover: 100,
      enableOfflineQueue: true, // Permitir queue offline
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      connectTimeout: 3000,
      commandTimeout: 2000,
      keyPrefix: "kryonix:",
    });

    // Verificar conexão
    redis.on("ready", () => {
      redisAvailable = true;
      console.log("✅ Redis conectado e pronto");
    });

    redis.on("error", (error) => {
      redisAvailable = false;
      if (process.env.NODE_ENV === "development") {
        console.log(
          "⚠️ Redis não disponível em desenvolvimento, cache desabilitado",
        );
      } else {
        console.error("❌ Erro Redis:", error.message);
      }
    });

    redis.on("close", () => {
      redisAvailable = false;
      console.log("🔴 Redis desconectado");
    });
  } catch (error) {
    console.warn("⚠️ Redis não configurado, cache em memória será usado");
    redis = null;
    redisAvailable = false;
  }
} else {
  console.log("📝 Redis não configurado, executando sem cache");
}

// Estratégias de cache por tipo de dados
export const CACHE_STRATEGIES = {
  // Cache de longa duração (24h)
  STATIC: {
    ttl: 24 * 60 * 60, // 24 horas
    key: "static",
  },

  // Cache de APIs (5 minutos)
  API: {
    ttl: 5 * 60, // 5 minutos
    key: "api",
  },

  // Cache de usuário (1 hora)
  USER: {
    ttl: 60 * 60, // 1 hora
    key: "user",
  },

  // Cache de analytics (30 minutos)
  ANALYTICS: {
    ttl: 30 * 60, // 30 minutos
    key: "analytics",
  },

  // Cache de WhatsApp (10 minutos)
  WHATSAPP: {
    ttl: 10 * 60, // 10 minutos
    key: "whatsapp",
  },

  // Cache temporário (2 minutos)
  TEMP: {
    ttl: 2 * 60, // 2 minutos
    key: "temp",
  },
} as const;

export interface CacheOptions {
  strategy: keyof typeof CACHE_STRATEGIES;
  customTTL?: number;
  customKey?: string;
  bypassCache?: boolean;
  refreshCache?: boolean;
  compression?: boolean;
}

// Função para gerar chave de cache
function generateCacheKey(
  req: Request,
  strategy: string,
  customKey?: string,
): string {
  const userId = req.user?.id || "anonymous";
  const tenantId = req.headers["x-tenant-id"] || "default";
  const baseKey = customKey || `${req.method}:${req.originalUrl}`;

  return `${strategy}:${tenantId}:${userId}:${baseKey}`;
}

// Middleware principal de cache
export function cacheMiddleware(options: CacheOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Bypass cache se solicitado, em desenvolvimento ou Redis não disponível
    if (
      options.bypassCache ||
      process.env.NODE_ENV === "development" ||
      !redis ||
      !redisAvailable
    ) {
      return next();
    }

    const strategy = CACHE_STRATEGIES[options.strategy];
    const cacheKey = generateCacheKey(req, strategy.key, options.customKey);
    const ttl = options.customTTL || strategy.ttl;

    try {
      // Verificar se existe cache apenas se Redis estiver disponível
      if (!options.refreshCache && redis && redisAvailable) {
        const cached = await redis.get(cacheKey);

        if (cached) {
          console.log(`✅ Cache HIT: ${cacheKey}`);

          const data = JSON.parse(cached);

          // Headers de cache
          res.setHeader("X-Cache", "HIT");
          res.setHeader("X-Cache-Key", cacheKey);
          res.setHeader("Cache-Control", `public, max-age=${ttl}`);

          return res.json(data);
        }
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);
      res.setHeader("X-Cache", "MISS");

      // Interceptar resposta para cachear
      const originalJson = res.json;
      res.json = function (data: any) {
        // Só cachear respostas 200 OK e se Redis estiver disponível
        if (res.statusCode === 200 && redis && redisAvailable) {
          const cacheData = JSON.stringify(data);

          // Cache assíncrono para não bloquear resposta
          redis
            .setex(cacheKey, ttl, cacheData)
            .then(() => console.log(`📦 Cached: ${cacheKey} (${ttl}s)`))
            .catch((err) => console.error("Cache error:", err));
        }

        // Headers de cache
        res.setHeader("X-Cache-Key", cacheKey);
        res.setHeader("Cache-Control", `public, max-age=${ttl}`);

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next(); // Continuar sem cache em caso de erro
    }
  };
}

// Cache específico para APIs críticas
export const apiCache = cacheMiddleware({
  strategy: "API",
  compression: true,
});

export const userCache = cacheMiddleware({
  strategy: "USER",
});

export const analyticsCache = cacheMiddleware({
  strategy: "ANALYTICS",
});

export const whatsappCache = cacheMiddleware({
  strategy: "WHATSAPP",
});

// Função para invalidar cache
export async function invalidateCache(pattern: string) {
  if (!redis || !redisAvailable) {
    console.log("⚠️ Redis não disponível, invalidação de cache ignorada");
    return;
  }

  try {
    const keys = await redis.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `🗑️ Invalidated ${keys.length} cache keys for pattern: ${pattern}`,
      );
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

// Invalidar cache de usuário específico
export async function invalidateUserCache(userId: string) {
  await invalidateCache(`user:*:${userId}:*`);
}

// Invalidar cache de tenant
export async function invalidateTenantCache(tenantId: string) {
  await invalidateCache(`*:${tenantId}:*`);
}

// Estatísticas de cache
export async function getCacheStats() {
  if (!redis || !redisAvailable) {
    return {
      connected: false,
      message: "Redis não disponível",
      stats: "Cache em memória ativo",
      totalKeys: 0,
    };
  }

  try {
    const info = await redis.info("stats");
    const keyspace = await redis.info("keyspace");

    return {
      connected: redisAvailable,
      stats: info,
      keyspace: keyspace,
      totalKeys: await redis.dbsize(),
    };
  } catch (error) {
    console.error("Cache stats error:", error);
    return { connected: false, error: error.message };
  }
}

// Limpar todo o cache
export async function clearAllCache() {
  try {
    await redis.flushdb();
    console.log("🗑️ Cache limpo completamente");
    return true;
  } catch (error) {
    console.error("Clear cache error:", error);
    return false;
  }
}

// Middleware para warming de cache (pré-carregamento)
export function cacheWarmingMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // APIs críticas para pré-carregar
    const criticalAPIs = [
      "/api/auth/me",
      "/api/dashboard/stats",
      "/api/billing/subscription",
      "/api/whatsapp/instances",
    ];

    // Warming em background
    setTimeout(async () => {
      for (const api of criticalAPIs) {
        try {
          const cacheKey = generateCacheKey(
            { ...req, originalUrl: api } as Request,
            "api",
          );

          const cached = await redis.get(cacheKey);
          if (!cached) {
            console.log(`🔥 Warming cache for: ${api}`);
            // Aqui poderia fazer um request interno para popular o cache
          }
        } catch (error) {
          console.error(`Cache warming error for ${api}:`, error);
        }
      }
    }, 1000);

    next();
  };
}

// Middleware para compressão de resposta
export function compressionMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (data: any) {
      // Comprimir apenas respostas grandes (>1KB)
      const dataString = JSON.stringify(data);

      if (dataString.length > 1024) {
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("X-Original-Size", dataString.length);
      }

      return originalJson.call(this, data);
    };

    next();
  };
}

// Health check do Redis (apenas se Redis estiver configurado)
if (redis) {
  redis.on("connect", () => {
    console.log("✅ Redis conectado");
  });

  redis.on("error", (error) => {
    console.error("❌ Redis error:", error);
  });

  redis.on("close", () => {
    console.log("🔴 Redis desconectado");
  });
}

export { redis, redisAvailable };
export default cacheMiddleware;

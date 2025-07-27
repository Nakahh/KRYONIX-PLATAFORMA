# ⚡ PARTE 04 - CACHE REDIS
*Agentes Responsáveis: Arquiteto Software + Performance Expert + DevOps*

## 🎯 **OBJETIVO**
Configurar Redis como sistema de cache, sessões e filas para alta performance da plataforma KRYONIX SaaS.

## 🏗️ **ARQUITETURA CACHE (Performance Expert)**
```yaml
Redis Setup:
  URL: redis.kryonix.com.br:6379
  Mode: Cluster (alta disponibilidade)
  Persistence: RDB + AOF
  Memory: 2GB allocated
  
Use Cases:
  - Session storage (Keycloak sessions)
  - Application cache (database queries)
  - Rate limiting
  - Job queues (Bull/BullMQ)
  - Real-time features (pub/sub)
```

## ⚡ **CONFIGURAÇÃO PERFORMANCE**
```redis
# redis.conf otimizado para SaaS
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# AOF para durabilidade
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Network optimization
tcp-keepalive 300
timeout 0
tcp-backlog 511

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
```

## 🔧 **INTEGRAÇÃO NODE.JS**
```typescript
// config/redis.ts
import Redis from 'ioredis';

// Cliente principal
export const redis = new Redis({
  host: 'redis.kryonix.com.br',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

// Cliente para pub/sub
export const redisSubscriber = new Redis({
  host: 'redis.kryonix.com.br',
  port: 6379,
  password: process.env.REDIS_PASSWORD
});

// Cliente para publisher
export const redisPublisher = new Redis({
  host: 'redis.kryonix.com.br',
  port: 6379,
  password: process.env.REDIS_PASSWORD
});

// services/cache.ts
export class CacheService {
  
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    await redis.del(key);
  }

  async flush(): Promise<void> {
    await redis.flushdb();
  }

  // Cache com padrão cache-aside
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      value = await fetcher();
      await this.set(key, value, ttl);
    }
    
    return value;
  }
}
```

## 🗄️ **ESTRATÉGIAS DE CACHE**

### **1. Database Query Cache**
```typescript
// Database cache wrapper
export class CachedDatabase {
  
  async getUserById(id: string) {
    const cacheKey = `user:${id}`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await database.query('SELECT * FROM auth.users WHERE id = $1', [id]);
      },
      1800 // 30 minutos
    );
  }

  async getCompanyProjects(companyId: string) {
    const cacheKey = `company:${companyId}:projects`;
    
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await database.query(
          'SELECT * FROM core.projects WHERE company_id = $1', 
          [companyId]
        );
      },
      600 // 10 minutos
    );
  }

  // Invalidação de cache
  async invalidateUserCache(userId: string) {
    await cacheService.del(`user:${userId}`);
  }
}
```

### **2. Session Storage**
```typescript
// Session management
export class SessionService {
  
  async createSession(userId: string, sessionData: any) {
    const sessionId = `session:${crypto.randomUUID()}`;
    const sessionKey = `session:${sessionId}`;
    
    await redis.setex(sessionKey, 86400, JSON.stringify({
      userId,
      createdAt: new Date().toISOString(),
      ...sessionData
    }));
    
    return sessionId;
  }

  async getSession(sessionId: string) {
    const sessionKey = `session:${sessionId}`;
    const data = await redis.get(sessionKey);
    return data ? JSON.parse(data) : null;
  }

  async destroySession(sessionId: string) {
    const sessionKey = `session:${sessionId}`;
    await redis.del(sessionKey);
  }

  async refreshSession(sessionId: string) {
    const sessionKey = `session:${sessionId}`;
    await redis.expire(sessionKey, 86400);
  }
}
```

### **3. Rate Limiting**
```typescript
// Rate limiting implementation
export class RateLimitService {
  
  async checkLimit(
    identifier: string, 
    windowMs: number, 
    maxRequests: number
  ): Promise<boolean> {
    const key = `rate_limit:${identifier}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }
    
    return current <= maxRequests;
  }

  // Rate limit por IP
  async limitByIP(ip: string): Promise<boolean> {
    return this.checkLimit(`ip:${ip}`, 60000, 100); // 100 requests/min
  }

  // Rate limit por usuário
  async limitByUser(userId: string): Promise<boolean> {
    return this.checkLimit(`user:${userId}`, 60000, 1000); // 1000 requests/min
  }

  // Rate limit para API
  async limitAPI(apiKey: string): Promise<boolean> {
    return this.checkLimit(`api:${apiKey}`, 3600000, 10000); // 10k requests/hour
  }
}
```

## 🔄 **FILAS DE TRABALHO (Bull Queue)**
```typescript
// config/queues.ts
import Queue from 'bull';

export const emailQueue = new Queue('email processing', {
  redis: {
    host: 'redis.kryonix.com.br',
    port: 6379,
    password: process.env.REDIS_PASSWORD
  }
});

export const reportQueue = new Queue('report generation', {
  redis: {
    host: 'redis.kryonix.com.br',
    port: 6379,
    password: process.env.REDIS_PASSWORD
  }
});

// Processadores de fila
emailQueue.process('sendEmail', async (job) => {
  const { to, subject, template, data } = job.data;
  await emailService.send(to, subject, template, data);
});

reportQueue.process('generateReport', async (job) => {
  const { reportId, type, filters } = job.data;
  await reportService.generate(reportId, type, filters);
});
```

## 📊 **REAL-TIME FEATURES (Pub/Sub)**
```typescript
// Real-time notifications
export class RealtimeService {
  
  async publishUserEvent(userId: string, event: string, data: any) {
    const channel = `user:${userId}:events`;
    await redisPublisher.publish(channel, JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString()
    }));
  }

  async publishSystemEvent(event: string, data: any) {
    const channel = 'system:events';
    await redisPublisher.publish(channel, JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString()
    }));
  }

  subscribeToUserEvents(userId: string, callback: Function) {
    const channel = `user:${userId}:events`;
    redisSubscriber.subscribe(channel);
    redisSubscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(JSON.parse(message));
      }
    });
  }
}
```

## 📈 **MONITORAMENTO REDIS**
```bash
# Comandos de monitoramento
redis-cli -h redis.kryonix.com.br INFO memory
redis-cli -h redis.kryonix.com.br INFO stats
redis-cli -h redis.kryonix.com.br INFO persistence

# Monitoramento contínuo
redis-cli -h redis.kryonix.com.br --latency
redis-cli -h redis.kryonix.com.br --bigkeys

# Backup manual
redis-cli -h redis.kryonix.com.br BGSAVE
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Testar conectividade Redis
redis-cli -h redis.kryonix.com.br ping

# 2. Verificar configuração
redis-cli -h redis.kryonix.com.br CONFIG GET "*"

# 3. Monitorar performance
redis-cli -h redis.kryonix.com.br INFO stats

# 4. Verificar memória
redis-cli -h redis.kryonix.com.br INFO memory
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Redis acessível em redis.kryonix.com.br
- [ ] Configuração de performance aplicada
- [ ] Persistência RDB + AOF ativa
- [ ] Conexão Node.js funcionando
- [ ] Cache de queries implementado
- [ ] Session storage funcionando
- [ ] Rate limiting ativo
- [ ] Filas de trabalho operacionais
- [ ] Pub/Sub real-time funcionando

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de conexão
npm run test:redis:connection

# Teste de cache
npm run test:redis:cache

# Teste de sessões
npm run test:redis:sessions

# Teste de rate limiting
npm run test:redis:ratelimit

# Teste de filas
npm run test:redis:queues
```

---
*Parte 04 de 50 - Projeto KRYONIX SaaS Platform*
*Próxima Parte: 05 - Proxy Reverso Traefik*

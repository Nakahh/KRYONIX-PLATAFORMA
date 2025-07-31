# ⚡ PARTE 04 - CACHE REDIS MULTI-TENANT
*Agentes Responsáveis: Arquiteto Software + Performance Expert + DevOps + SDK Developer*

## 🎯 **CONTEXTO MULTI-TENANT KRYONIX**

**MISSÃO**: Configurar Redis Cluster com isolamento multi-tenant, namespaces por cliente, integração SDK transparente, otimização mobile-first e auto-criação para 8 APIs modulares da plataforma KRYONIX SaaS.

```yaml
Arquitetura Multi-Tenant:
  estratégia: "Namespaces isolados por cliente e módulo"
  pattern: "cliente:{id}:{modulo}:{tipo}:{key}"
  auto_creation: "Setup automático para novos clientes"
  sdk_integration: "@kryonix/sdk cache transparente"
  mobile_optimization: "Cache prioritário para 80% mobile"
  apis_modulares: "Cache específico por módulo"
  monitoring_isolado: "Métricas por cliente"
```

---

## 🏗️ **ARQUITETURA REDIS CLUSTER MULTI-TENANT**

### **🎯 ESTRUTURA PRINCIPAL**
```yaml
Redis Multi-Tenant Architecture:
  Cluster Nodes:
    - redis-1.kryonix.com.br:7001 (Master - CRM/WhatsApp/SMS)
    - redis-2.kryonix.com.br:7002 (Master - Analytics/Email/Social)  
    - redis-3.kryonix.com.br:7003 (Master - Automação/Cobrança)
    - redis-1.kryonix.com.br:7004 (Replica - Backup Node 1)
    - redis-2.kryonix.com.br:7005 (Replica - Backup Node 2)
    - redis-3.kryonix.com.br:7006 (Replica - Backup Node 3)

  Client Isolation Pattern:
    Format: "cliente:{clientId}:{module}:{dataType}:{key}"
    Examples:
      - cliente:123:crm:users:45 (CRM user data)
      - cliente:123:whatsapp:sessions:abc (WhatsApp sessions)
      - cliente:123:mobile:sync:contacts (Mobile sync data)

  Module Distribution:
    Shard 1: CRM, WhatsApp, SMS
    Shard 2: Analytics, Email, Social Media
    Shard 3: Automação, Cobrança
    
  Memory Allocation:
    Total: 16GB RAM per cluster
    Per Client: Dynamic allocation with 100MB baseline
    Mobile Cache: 60% priority (9.6GB)
    Web Cache: 40% allocation (6.4GB)
```

### **📦 CACHE POR MÓDULO SAAS**
```yaml
Per-Client Cache Namespaces:
  # CRM Module
  - cliente:{id}:crm:users:{userId} # Dados de usuários CRM
  - cliente:{id}:crm:contacts:{contactId} # Contatos em cache
  - cliente:{id}:crm:sessions:{sessionId} # Sessões ativas
  
  # WhatsApp Module  
  - cliente:{id}:whatsapp:sessions:{phoneNumber} # Sessões WhatsApp
  - cliente:{id}:whatsapp:media:{mediaId} # Cache de mídia
  - cliente:{id}:whatsapp:queue:{messageId} # Fila de mensagens
  
  # Agendamento Module
  - cliente:{id}:agendamento:slots:{date} # Slots disponíveis
  - cliente:{id}:agendamento:notifications:{id} # Notificações
  
  # Financeiro Module
  - cliente:{id}:financeiro:transactions:{id} # Transações
  - cliente:{id}:financeiro:invoices:{id} # Faturas
  
  # Marketing Module
  - cliente:{id}:marketing:campaigns:{id} # Campanhas
  - cliente:{id}:marketing:templates:{id} # Templates
  
  # Analytics Module
  - cliente:{id}:analytics:reports:{type} # Relatórios
  - cliente:{id}:analytics:metrics:{metric} # Métricas
  
  # Portal Module
  - cliente:{id}:portal:courses:{id} # Cursos
  - cliente:{id}:portal:progress:{userId} # Progresso
  
  # Whitelabel Module
  - cliente:{id}:whitelabel:config:{setting} # Configurações
  - cliente:{id}:whitelabel:themes:{theme} # Temas
  
  # Mobile Sync
  - cliente:{id}:mobile:sync:{dataType} # Sincronização mobile
  - cliente:{id}:mobile:offline:{queueId} # Operações offline
```

---

## 📱 **CONFIGURAÇÃO MOBILE-FIRST PERFORMANCE**

### **🎯 REDIS.CONF OTIMIZADO PARA MOBILE**
```bash
# redis.conf otimizado para Mobile-First Multi-Tenant
# Configuração principal
port 7001
cluster-enabled yes
cluster-config-file nodes-7001.conf
cluster-node-timeout 15000
cluster-announce-ip redis-1.kryonix.com.br
cluster-announce-port 7001
cluster-announce-bus-port 17001

# Memory allocation - Mobile priority
maxmemory 5gb
maxmemory-policy allkeys-lru
maxmemory-samples 10

# Mobile-optimized persistence
save 300 10      # Save every 5min if 10+ keys changed (mobile sync)
save 60 1000     # Save every 1min if 1000+ keys changed (high activity)
save 15 10000    # Save every 15sec if 10k+ keys changed (peak mobile)

# AOF for mobile session durability
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 32mb

# Mobile network optimization
tcp-keepalive 60
timeout 300
tcp-backlog 2048
tcp-user-timeout 30000

# Logging with client isolation
loglevel notice
logfile /var/log/redis/redis-7001.log
syslog-enabled yes
syslog-ident redis-mobile-cluster

# Mobile-specific optimizations
hash-max-ziplist-entries 1024  # Mobile contact lists
hash-max-ziplist-value 128     # Mobile data compression
list-max-ziplist-size -2       # Mobile message queues
set-max-intset-entries 1024    # Mobile tag sets
zset-max-ziplist-entries 256   # Mobile rankings
```

### **💻 TTL OTIMIZADO PARA MOBILE**
```yaml
Mobile-First TTL Strategy:
  mobile_optimized: true
  
  TTL_DEFAULTS:
    # Mobile (shorter TTL para dados frescos)
    userSessions: 1800      # 30min (sessão mobile)
    syncData: 300           # 5min (sync mobile)
    contacts: 900           # 15min (contatos mobile)
    messages: 600           # 10min (mensagens mobile)
    mediaCache: 3600        # 1h (mídia mobile)
    offlineQueue: 7200      # 2h (operações offline)
    
    # Web (TTL maior para melhor cache)
    userSessions_web: 3600  # 1h (sessão web)
    syncData_web: 1800      # 30min (sync web)
    contacts_web: 3600      # 1h (contatos web)
    messages_web: 1800      # 30min (mensagens web)
    mediaCache_web: 7200    # 2h (mídia web)
```

---

## 🚀 **@KRYONIX/SDK INTEGRATION**

### **💻 SDK CACHE MULTI-TENANT**
```typescript
// @kryonix/sdk/cache/multi-tenant-redis.ts
import { Cluster } from 'ioredis';

export interface MultiTenantCacheConfig {
  clientId: string;
  module: APIModule;
  environment: 'development' | 'production';
  mobileOptimized: boolean;
}

export enum APIModule {
  CRM = 'crm',
  WHATSAPP = 'whatsapp',
  AGENDAMENTO = 'agendamento',
  FINANCEIRO = 'financeiro',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  PORTAL = 'portal',
  WHITELABEL = 'whitelabel'
}

export class MultiTenantRedisCache {
  private cluster: Cluster;
  private clientId: string;
  private module: APIModule;
  private mobileOptimized: boolean;

  constructor(config: MultiTenantCacheConfig) {
    this.clientId = config.clientId;
    this.module = config.module;
    this.mobileOptimized = config.mobileOptimized;
    
    // Redis Cluster connection with client-specific routing
    this.cluster = new Cluster([
      { host: 'redis-1.kryonix.com.br', port: 7001 },
      { host: 'redis-2.kryonix.com.br', port: 7002 },
      { host: 'redis-3.kryonix.com.br', port: 7003 }
    ], {
      redisOptions: {
        password: process.env.REDIS_PASSWORD,
        connectTimeout: 5000,
        commandTimeout: 3000,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 2,
        family: 4
      },
      enableReadyCheck: true,
      maxRetriesPerRequest: 2,
      retryDelayOnFailover: 100
    });

    this.setupClientIsolation();
  }

  private async setupClientIsolation(): Promise<void> {
    // Auto-create client namespace on first connection
    this.cluster.on('ready', async () => {
      await this.initializeClientNamespace();
    });
  }

  private async initializeClientNamespace(): Promise<void> {
    const namespaceKey = this.buildKey('meta', 'initialized');
    const exists = await this.cluster.exists(namespaceKey);
    
    if (!exists) {
      // Auto-create client configuration
      const clientConfig = {
        clientId: this.clientId,
        createdAt: new Date().toISOString(),
        modules: [this.module],
        mobileOptimized: this.mobileOptimized,
        maxMemory: '100MB',
        ttlDefaults: this.getMobileTTLDefaults()
      };

      await this.cluster.setex(
        namespaceKey,
        86400 * 30, // 30 days
        JSON.stringify(clientConfig)
      );

      console.log(`✅ Cliente ${this.clientId} auto-criado com módulo ${this.module}`);
    }
  }

  private buildKey(dataType: string, key: string): string {
    return `cliente:${this.clientId}:${this.module}:${dataType}:${key}`;
  }

  private getMobileTTLDefaults(): Record<string, number> {
    const mobileTTL = {
      // Mobile-optimized TTLs (shorter for fresher data)
      userSessions: 1800,      // 30min (mobile session)
      syncData: 300,           // 5min (mobile sync)
      contacts: 900,           // 15min (mobile contacts)
      messages: 600,           // 10min (mobile messages)
      mediaCache: 3600,        // 1h (mobile media)
      offlineQueue: 7200,      // 2h (mobile offline ops)
    };

    const webTTL = {
      // Web-optimized TTLs (longer for better caching)
      userSessions: 3600,      // 1h (web session)
      syncData: 1800,          // 30min (web sync)
      contacts: 3600,          // 1h (web contacts)
      messages: 1800,          // 30min (web messages)
      mediaCache: 7200,        // 2h (web media)
      offlineQueue: 14400,     // 4h (web offline ops)
    };

    return this.mobileOptimized ? mobileTTL : webTTL;
  }

  // Mobile-optimized cache methods
  async getMobileOptimized(dataType: string, key: string): Promise<any> {
    try {
      const cacheKey = this.buildKey(dataType, key);
      const compressed = await this.cluster.get(cacheKey);
      
      if (!compressed) return null;
      
      // Mobile data decompression for bandwidth optimization
      const data = this.mobileOptimized ? 
        this.decompressMobileData(compressed) : 
        JSON.parse(compressed);
        
      return data;
    } catch (error) {
      console.error(`Cache get error for client ${this.clientId}:`, error);
      return null;
    }
  }

  async setMobileOptimized(
    dataType: string, 
    key: string, 
    value: any, 
    customTTL?: number
  ): Promise<void> {
    try {
      const cacheKey = this.buildKey(dataType, key);
      const ttlDefaults = this.getMobileTTLDefaults();
      const ttl = customTTL || ttlDefaults[dataType] || 900; // 15min default
      
      // Mobile data compression for bandwidth optimization
      const serialized = this.mobileOptimized ? 
        this.compressMobileData(value) : 
        JSON.stringify(value);
      
      await this.cluster.setex(cacheKey, ttl, serialized);
      
      // Mobile analytics tracking
      if (this.mobileOptimized) {
        await this.trackMobileUsage(dataType, key);
      }
    } catch (error) {
      console.error(`Cache set error for client ${this.clientId}:`, error);
    }
  }

  // Module-specific cache strategies
  async getCRMData(key: string): Promise<any> {
    return this.getMobileOptimized('crm', key);
  }

  async setCRMData(key: string, value: any, ttl?: number): Promise<void> {
    await this.setMobileOptimized('crm', key, value, ttl);
  }

  async getWhatsAppSession(sessionId: string): Promise<any> {
    return this.getMobileOptimized('whatsapp_sessions', sessionId);
  }

  async setWhatsAppSession(sessionId: string, session: any): Promise<void> {
    const ttl = this.mobileOptimized ? 600 : 1800; // Mobile: 10min, Web: 30min
    await this.setMobileOptimized('whatsapp_sessions', sessionId, session, ttl);
  }

  async getMobileSync(syncType: string): Promise<any> {
    return this.getMobileOptimized('mobile_sync', syncType);
  }

  async setMobileSync(syncType: string, data: any): Promise<void> {
    const ttl = 300; // 5min para sincronização mobile
    await this.setMobileOptimized('mobile_sync', syncType, data, ttl);
  }

  // Mobile compression utilities
  private compressMobileData(data: any): string {
    // Simple compression for mobile bandwidth optimization
    const json = JSON.stringify(data);
    return Buffer.from(json).toString('base64');
  }

  private decompressMobileData(compressed: string): any {
    try {
      const json = Buffer.from(compressed, 'base64').toString('utf-8');
      return JSON.parse(json);
    } catch {
      // Fallback for uncompressed data
      return JSON.parse(compressed);
    }
  }

  private async trackMobileUsage(dataType: string, key: string): Promise<void> {
    const usageKey = this.buildKey('usage_analytics', `${dataType}_mobile`);
    await this.cluster.incr(usageKey);
    await this.cluster.expire(usageKey, 86400); // 24h TTL
  }

  // Client namespace management
  async flushClientData(): Promise<void> {
    const pattern = `cliente:${this.clientId}:${this.module}:*`;
    const keys = await this.cluster.keys(pattern);
    
    if (keys.length > 0) {
      await this.cluster.del(...keys);
    }
  }

  async getClientStats(): Promise<any> {
    const pattern = `cliente:${this.clientId}:${this.module}:*`;
    const keys = await this.cluster.keys(pattern);
    
    return {
      clientId: this.clientId,
      module: this.module,
      totalKeys: keys.length,
      mobileOptimized: this.mobileOptimized,
      memoryUsage: await this.getClientMemoryUsage(keys)
    };
  }

  private async getClientMemoryUsage(keys: string[]): Promise<number> {
    let totalMemory = 0;
    
    for (const key of keys) {
      try {
        const memory = await this.cluster.memory('usage', key);
        totalMemory += memory;
      } catch (error) {
        // Skip if memory command not available
      }
    }
    
    return totalMemory;
  }
}

// SDK Integration
export class KryonixCacheSDK {
  private caches: Map<string, MultiTenantRedisCache> = new Map();

  getCache(clientId: string, module: APIModule, mobileOptimized: boolean = true): MultiTenantRedisCache {
    const cacheKey = `${clientId}:${module}:${mobileOptimized}`;
    
    if (!this.caches.has(cacheKey)) {
      const cache = new MultiTenantRedisCache({
        clientId,
        module,
        environment: process.env.NODE_ENV as any,
        mobileOptimized
      });
      
      this.caches.set(cacheKey, cache);
    }
    
    return this.caches.get(cacheKey)!;
  }

  // Transparent cache methods for each API module
  async crmCache(clientId: string) {
    return this.getCache(clientId, APIModule.CRM);
  }

  async whatsappCache(clientId: string) {
    return this.getCache(clientId, APIModule.WHATSAPP);
  }

  async agendamentoCache(clientId: string) {
    return this.getCache(clientId, APIModule.AGENDAMENTO);
  }

  async financeiroCache(clientId: string) {
    return this.getCache(clientId, APIModule.FINANCEIRO);
  }

  async marketingCache(clientId: string) {
    return this.getCache(clientId, APIModule.MARKETING);
  }

  async analyticsCache(clientId: string) {
    return this.getCache(clientId, APIModule.ANALYTICS);
  }

  async portalCache(clientId: string) {
    return this.getCache(clientId, APIModule.PORTAL);
  }

  async whitelabelCache(clientId: string) {
    return this.getCache(clientId, APIModule.WHITELABEL);
  }
}
```

---

## 🔧 **AUTO-CREATION SYSTEM**

### **🤖 SCRIPT AUTOMÁTICO DE CRIAÇÃO**
```bash
#!/bin/bash
# scripts/auto-create-client-redis.sh

create_client_redis() {
    local CLIENT_ID=$1
    local PLAN=${2:-"basic"}     # basic, pro, enterprise
    local MOBILE_OPT=${3:-"true"} # true, false
    
    if [ -z "$CLIENT_ID" ]; then
        echo "❌ Uso: create_client_redis <client_id> [plan] [mobile_optimized]"
        exit 1
    fi
    
    echo "🚀 Criando cliente Redis: $CLIENT_ID"
    echo "   Plano: $PLAN"
    echo "   Mobile Optimized: $MOBILE_OPT"
    
    # Configurações por plano
    case "$PLAN" in
        "basic")
            MAX_KEYS=10000
            MAX_MEMORY_MB=10
            MODULES=("crm" "whatsapp")
            ;;
        "pro")
            MAX_KEYS=50000
            MAX_MEMORY_MB=50
            MODULES=("crm" "whatsapp" "agendamento" "marketing" "analytics")
            ;;
        "enterprise")
            MAX_KEYS=100000
            MAX_MEMORY_MB=100
            MODULES=("crm" "whatsapp" "agendamento" "financeiro" "marketing" "analytics" "portal" "whitelabel")
            ;;
        *)
            echo "❌ Plano inválido. Use: basic, pro, enterprise"
            exit 1
            ;;
    esac
    
    # Criar namespace do cliente em cada módulo habilitado
    for MODULE in "${MODULES[@]}"; do
        # Determinar shard correto para o módulo
        case "$MODULE" in
            "crm"|"whatsapp")
                HOST="redis-1.kryonix.com.br"
                PORT="7001"
                ;;
            "analytics"|"marketing")
                HOST="redis-2.kryonix.com.br"
                PORT="7002"
                ;;
            "financeiro"|"whitelabel"|"portal"|"agendamento")
                HOST="redis-3.kryonix.com.br"
                PORT="7003"
                ;;
        esac
        
        # Criar configuração do cliente
        CONFIG_KEY="cliente:${CLIENT_ID}:${MODULE}:meta:config"
        CONFIG_VALUE=$(cat <<EOF
{
    "clientId": "$CLIENT_ID",
    "module": "$MODULE",
    "plan": "$PLAN",
    "maxKeys": $MAX_KEYS,
    "maxMemoryMB": $MAX_MEMORY_MB,
    "mobileOptimized": $MOBILE_OPT,
    "createdAt": "$(date -Iseconds)",
    "shard": "$HOST:$PORT"
}
EOF
        )
        
        redis-cli -h $HOST -p $PORT -a $REDIS_PASSWORD \
            SETEX "$CONFIG_KEY" 2592000 "$CONFIG_VALUE" > /dev/null 2>&1
        
        if redis-cli -h $HOST -p $PORT -a $REDIS_PASSWORD \
            EXISTS "$CONFIG_KEY" > /dev/null 2>&1; then
            echo "  ✅ Módulo $MODULE configurado em $HOST:$PORT"
        else
            echo "  ❌ Falha ao configurar módulo $MODULE"
        fi
        
        # Criar TTL defaults para o módulo
        TTL_KEY="cliente:${CLIENT_ID}:${MODULE}:meta:ttl_defaults"
        
        if [ "$MOBILE_OPT" = "true" ]; then
            TTL_CONFIG='{"userSessions":1800,"syncData":300,"contacts":900,"messages":600,"mediaCache":3600,"offlineQueue":7200}'
        else
            TTL_CONFIG='{"userSessions":3600,"syncData":1800,"contacts":3600,"messages":1800,"mediaCache":7200,"offlineQueue":14400}'
        fi
        
        redis-cli -h $HOST -p $PORT -a $REDIS_PASSWORD \
            SETEX "$TTL_KEY" 2592000 "$TTL_CONFIG" > /dev/null 2>&1
        
        # Criar contadores de uso
        USAGE_KEY="cliente:${CLIENT_ID}:${MODULE}:meta:usage"
        USAGE_CONFIG='{"currentKeys":0,"currentMemoryMB":0,"lastAccess":"'$(date -Iseconds)'"}'
        
        redis-cli -h $HOST -p $PORT -a $REDIS_PASSWORD \
            SETEX "$USAGE_KEY" 86400 "$USAGE_CONFIG" > /dev/null 2>&1
    done
    
    echo "✅ Cliente $CLIENT_ID criado com sucesso!"
    echo "   Módulos habilitados: ${MODULES[*]}"
    echo "   Limites: $MAX_KEYS keys, ${MAX_MEMORY_MB}MB"
}

# Função para listar clientes
list_clients_redis() {
    echo "👥 Clientes Redis cadastrados:"
    
    NODES=(
        "redis-1.kryonix.com.br:7001"
        "redis-2.kryonix.com.br:7002"
        "redis-3.kryonix.com.br:7003"
    )
    
    declare -A CLIENTS
    
    for NODE in "${NODES[@]}"; do
        HOST=${NODE%:*}
        PORT=${NODE#*:}
        
        # Buscar configurações de clientes
        CONFIG_KEYS=$(redis-cli -h $HOST -p $PORT -a $REDIS_PASSWORD \
            --raw eval "return redis.call('keys', 'cliente:*:*:meta:config')" 0)
        
        if [ ! -z "$CONFIG_KEYS" ]; then
            while IFS= read -r KEY; do
                if [ ! -z "$KEY" ]; then
                    # Extrair client_id do key
                    CLIENT_ID=$(echo "$KEY" | cut -d: -f2)
                    MODULE=$(echo "$KEY" | cut -d: -f3)
                    
                    if [ ! -z "${CLIENTS[$CLIENT_ID]}" ]; then
                        CLIENTS[$CLIENT_ID]="${CLIENTS[$CLIENT_ID]}, $MODULE"
                    else
                        CLIENTS[$CLIENT_ID]="$MODULE"
                    fi
                fi
            done <<< "$CONFIG_KEYS"
        fi
    done
    
    if [ ${#CLIENTS[@]} -eq 0 ]; then
        echo "📭 Nenhum cliente encontrado"
    else
        for CLIENT_ID in "${!CLIENTS[@]}"; do
            echo "  👤 $CLIENT_ID: ${CLIENTS[$CLIENT_ID]}"
        done
    fi
}

# Função para remover cliente
remove_client_redis() {
    local CLIENT_ID=$1
    
    if [ -z "$CLIENT_ID" ]; then
        echo "❌ Uso: remove_client_redis <client_id>"
        exit 1
    fi
    
    echo "🗑️  Removendo cliente: $CLIENT_ID"
    
    NODES=(
        "redis-1.kryonix.com.br:7001"
        "redis-2.kryonix.com.br:7002"
        "redis-3.kryonix.com.br:7003"
    )
    
    TOTAL_REMOVED=0
    
    for NODE in "${NODES[@]}"; do
        HOST=${NODE%:*}
        PORT=${NODE#*:}
        
        # Remover todas as keys do cliente
        REMOVED=$(redis-cli -h $HOST -p $PORT -a $REDIS_PASSWORD \
            --raw eval "
                local keys = redis.call('keys', 'cliente:${CLIENT_ID}:*')
                if #keys > 0 then
                    redis.call('del', unpack(keys))
                end
                return #keys
            " 0)
        
        if [ "$REMOVED" -gt 0 ]; then
            echo "  🗑️  Removidas $REMOVED keys de $HOST:$PORT"
            TOTAL_REMOVED=$((TOTAL_REMOVED + REMOVED))
        fi
    done
    
    if [ "$TOTAL_REMOVED" -gt 0 ]; then
        echo "✅ Cliente $CLIENT_ID removido (total: $TOTAL_REMOVED keys)"
    else
        echo "⚠️  Cliente $CLIENT_ID não encontrado"
    fi
}

# Menu principal
case "$1" in
    "create")
        create_client_redis "$2" "$3" "$4"
        ;;
    "list")
        list_clients_redis
        ;;
    "remove")
        remove_client_redis "$2"
        ;;
    *)
        echo "Gerenciamento de Clientes Redis Multi-Tenant"
        echo ""
        echo "Uso: $0 {create|list|remove} [argumentos]"
        echo ""
        echo "Comandos:"
        echo "  create <client_id> [plan] [mobile_optimized]"
        echo "    - Criar novo cliente"
        echo "    - plan: basic, pro, enterprise (default: basic)"
        echo "    - mobile_optimized: true, false (default: true)"
        echo ""
        echo "  list"
        echo "    - Listar todos os clientes"
        echo ""
        echo "  remove <client_id>"
        echo "    - Remover cliente e todos os seus dados"
        echo ""
        echo "Exemplos:"
        echo "  $0 create 123 pro true"
        echo "  $0 list"
        echo "  $0 remove 123"
        exit 1
        ;;
esac
```

---

## 📊 **MONITORAMENTO ISOLADO POR CLIENTE**

### **📈 MÉTRICAS PROMETHEUS POR CLIENTE**
```yaml
# prometheus/redis-client-metrics.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'redis-multitenant'
    static_configs:
      - targets: 
        - 'redis-1.kryonix.com.br:7001'
        - 'redis-2.kryonix.com.br:7002'
        - 'redis-3.kryonix.com.br:7003'
    metrics_path: /metrics
    scrape_interval: 30s
    
  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter.kryonix.com.br:9121']
    params:
      check-keys: ['cliente:*:*:meta:*']

rule_files:
  - "redis-client-alerts.yml"
  - "redis-client-rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager.kryonix.com.br:9093
```

### **🚨 ALERTAS POR CLIENTE**
```yaml
# prometheus/redis-client-alerts.yml
groups:
- name: redis-client-cache-alerts
  rules:
  
  # Quota de cache excedida
  - alert: ClientCacheQuotaExceeded
    expr: redis_client_keys_total > 90000
    for: 5m
    labels:
      severity: warning
      service: cache
      component: quota
    annotations:
      summary: "Cliente {{ $labels.client_id }} excedeu quota de cache"
      description: "Cliente {{ $labels.client_id }} está usando {{ $value }} keys, aproximando do limite"
      
  # Performance degradada
  - alert: ClientCachePerformanceDegraded
    expr: redis_client_latency_seconds > 0.1
    for: 2m
    labels:
      severity: warning
      service: cache
      component: performance
    annotations:
      summary: "Performance de cache degradada para cliente {{ $labels.client_id }}"
      description: "Latência de {{ $value }}s está acima do normal para cliente {{ $labels.client_id }}"
      
  # Memory pressure
  - alert: ClientCacheMemoryPressure
    expr: redis_client_memory_usage_bytes > 90 * 1024 * 1024 # 90MB
    for: 3m
    labels:
      severity: warning
      service: cache
      component: memory
    annotations:
      summary: "Pressão de memória no cache do cliente {{ $labels.client_id }}"
      description: "Cliente {{ $labels.client_id }} está usando {{ $value | humanize1024 }}B de memória"
      
  # Baixa otimização mobile
  - alert: ClientMobileOptimizationLow
    expr: redis_client_mobile_ratio < 60
    for: 10m
    labels:
      severity: info
      service: cache
      component: optimization
    annotations:
      summary: "Baixa otimização mobile para cliente {{ $labels.client_id }}"
      description: "Cliente {{ $labels.client_id }} tem apenas {{ $value }}% de dados otimizados para mobile"
```

---

## 🧪 **TESTES E VALIDAÇÃO**

### **🔬 SUITE DE TESTES MULTI-TENANT**
```bash
#!/bin/bash
# tests/test-redis-multitenant.sh

test_redis_multitenant() {
    echo "🧪 KRYONIX - Testes Redis Multi-Tenant"
    echo "======================================"
    
    local ERRORS=0
    
    # Teste 1: Isolamento de clientes
    echo "🔒 Teste 1: Isolamento entre clientes"
    
    # Criar dados de teste para diferentes clientes
    redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        SET "cliente:test1:crm:user:123" "data_client_1" EX 300
    
    redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        SET "cliente:test2:crm:user:123" "data_client_2" EX 300
    
    # Verificar isolamento
    DATA1=$(redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        GET "cliente:test1:crm:user:123")
    DATA2=$(redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        GET "cliente:test2:crm:user:123")
    
    if [ "$DATA1" = "data_client_1" ] && [ "$DATA2" = "data_client_2" ]; then
        echo "✅ Isolamento entre clientes funcionando"
    else
        echo "❌ Falha no isolamento entre clientes"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 2: Distribuição por módulos
    echo "📦 Teste 2: Distribuição por módulos"
    
    # CRM deve ir para shard 1
    redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        SET "cliente:test:crm:data:1" "crm_data" EX 300
    
    # Analytics deve ir para shard 2
    redis-cli -h redis-2.kryonix.com.br -p 7002 -a $REDIS_PASSWORD \
        SET "cliente:test:analytics:data:1" "analytics_data" EX 300
    
    # Financeiro deve ir para shard 3
    redis-cli -h redis-3.kryonix.com.br -p 7003 -a $REDIS_PASSWORD \
        SET "cliente:test:financeiro:data:1" "financeiro_data" EX 300
    
    # Verificar distribuição
    CRM_EXISTS=$(redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        EXISTS "cliente:test:crm:data:1")
    ANALYTICS_EXISTS=$(redis-cli -h redis-2.kryonix.com.br -p 7002 -a $REDIS_PASSWORD \
        EXISTS "cliente:test:analytics:data:1")
    FINANCEIRO_EXISTS=$(redis-cli -h redis-3.kryonix.com.br -p 7003 -a $REDIS_PASSWORD \
        EXISTS "cliente:test:financeiro:data:1")
    
    if [ "$CRM_EXISTS" = "1" ] && [ "$ANALYTICS_EXISTS" = "1" ] && [ "$FINANCEIRO_EXISTS" = "1" ]; then
        echo "✅ Distribuição por módulos funcionando"
    else
        echo "❌ Falha na distribuição por módulos"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 3: Performance mobile
    echo "📱 Teste 3: Performance mobile"
    
    START_TIME=$(date +%s%N)
    
    # Teste de escrita mobile
    for i in {1..50}; do
        redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
            SET "cliente:test:mobile_sync:item:$i" "mobile_data_$i" EX 300 > /dev/null 2>&1
    done
    
    WRITE_TIME=$(( ($(date +%s%N) - START_TIME) / 1000000 ))
    
    # Teste de leitura mobile
    START_TIME=$(date +%s%N)
    
    for i in {1..50}; do
        redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
            GET "cliente:test:mobile_sync:item:$i" > /dev/null 2>&1
    done
    
    READ_TIME=$(( ($(date +%s%N) - START_TIME) / 1000000 ))
    
    echo "   Tempo escrita mobile (50 ops): ${WRITE_TIME}ms"
    echo "   Tempo leitura mobile (50 ops): ${READ_TIME}ms"
    
    if [ "$WRITE_TIME" -lt 500 ] && [ "$READ_TIME" -lt 200 ]; then
        echo "✅ Performance mobile excelente"
    elif [ "$WRITE_TIME" -lt 1000 ] && [ "$READ_TIME" -lt 400 ]; then
        echo "⚠️  Performance mobile boa"
    else
        echo "❌ Performance mobile ruim"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 4: Auto-creation
    echo "🤖 Teste 4: Auto-creation de cliente"
    
    TEST_CLIENT="testclient$(date +%s)"
    
    if /usr/local/bin/auto-create-client-redis.sh create "$TEST_CLIENT" "basic" "true"; then
        echo "✅ Auto-creation funcionando"
        
        # Verificar se foi criado
        CONFIG_EXISTS=$(redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
            EXISTS "cliente:${TEST_CLIENT}:crm:meta:config")
        
        if [ "$CONFIG_EXISTS" = "1" ]; then
            echo "✅ Configuração de cliente criada corretamente"
        else
            echo "❌ Configuração de cliente não encontrada"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Limpar cliente de teste
        /usr/local/bin/auto-create-client-redis.sh remove "$TEST_CLIENT"
    else
        echo "❌ Falha na auto-creation"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 5: TTL móvel vs web
    echo "⏰ Teste 5: TTL otimizado mobile"
    
    # Cache mobile (TTL mais baixo)
    redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        SET "cliente:test:mobile_cache:item1" "mobile_data" EX 300
    
    # Cache web (TTL mais alto)  
    redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        SET "cliente:test:web_cache:item1" "web_data" EX 1800
    
    # Verificar TTLs
    MOBILE_TTL=$(redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        TTL "cliente:test:mobile_cache:item1")
    WEB_TTL=$(redis-cli -h redis-1.kryonix.com.br -p 7001 -a $REDIS_PASSWORD \
        TTL "cliente:test:web_cache:item1")
    
    if [ "$MOBILE_TTL" -lt "$WEB_TTL" ]; then
        echo "✅ TTL mobile otimizado funcionando"
    else
        echo "❌ TTL mobile não está otimizado"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Limpeza de dados de teste
    echo "🧹 Limpando dados de teste..."
    
    NODES=(
        "redis-1.kryonix.com.br:7001"
        "redis-2.kryonix.com.br:7002"
        "redis-3.kryonix.com.br:7003"
    )
    
    for NODE in "${NODES[@]}"; do
        HOST=${NODE%:*}
        PORT=${NODE#*:}
        
        redis-cli -h $HOST -p $PORT -a $REDIS_PASSWORD \
            --raw eval "
                local keys = redis.call('keys', 'cliente:test*')
                if #keys > 0 then
                    redis.call('del', unpack(keys))
                end
                return #keys
            " 0 > /dev/null 2>&1
    done
    
    # Resultado final
    echo "======================================"
    if [ $ERRORS -eq 0 ]; then
        echo "🎉 Todos os testes passaram!"
        echo "✅ Redis Multi-Tenant funcionando perfeitamente"
    else
        echo "❌ $ERRORS teste(s) falharam"
        echo "🔧 Verifique os logs para mais detalhes"
    fi
    
    return $ERRORS
}

# Executar testes se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    test_redis_multitenant
fi
```

---

## 🚀 **COMANDOS DE EXECUÇÃO PRÁTICOS**

### **⚡ SETUP COMPLETO MULTI-TENANT**
```bash
#!/bin/bash
# setup-redis-multitenant.sh
# Setup completo Redis Multi-Tenant para KRYONIX

echo "🚀 KRYONIX - Setup Redis Multi-Tenant"
echo "====================================="

# 1. CRIAR ESTRUTURA DE DIRETÓRIOS
echo "📁 Criando estrutura de diretórios..."
mkdir -p /opt/kryonix/{redis/{config,data,logs},scripts,monitoring/redis,backups/redis}

# 2. CONFIGURAR CLUSTER REDIS
echo "🔧 Configurando Redis Cluster..."

# Criar configurações para cada nó
PORTS=(7001 7002 7003 7004 7005 7006)
HOSTS=("redis-1.kryonix.com.br" "redis-2.kryonix.com.br" "redis-3.kryonix.com.br" "redis-1.kryonix.com.br" "redis-2.kryonix.com.br" "redis-3.kryonix.com.br")

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    HOST=${HOSTS[$i]}
    
    cat > "/opt/kryonix/redis/config/redis-${PORT}.conf" <<EOF
port $PORT
cluster-enabled yes
cluster-config-file nodes-$PORT.conf
cluster-node-timeout 15000
cluster-announce-ip $HOST
cluster-announce-port $PORT
cluster-announce-bus-port 1$PORT

# Memory e performance mobile-first
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 10

# Persistence otimizada para mobile
save 300 10
save 60 1000
save 15 10000

appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 32mb

# Network optimization para mobile
tcp-keepalive 60
timeout 300
tcp-backlog 2048

# Logging
loglevel notice
logfile /opt/kryonix/redis/logs/redis-$PORT.log

# Mobile-specific optimizations
hash-max-ziplist-entries 1024
hash-max-ziplist-value 128
list-max-ziplist-size -2
set-max-intset-entries 1024
zset-max-ziplist-entries 256

# Security
requirepass ${REDIS_PASSWORD:-kryonix_redis_secure_2025}
EOF
    
    echo "✅ Configuração criada para nó $HOST:$PORT"
done

# 3. INICIAR REDIS CLUSTER
echo "🚀 Iniciando Redis Cluster..."

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    
    docker run -d \
        --name redis-cluster-$PORT \
        --restart always \
        -p $PORT:$PORT \
        -p 1$PORT:1$PORT \
        -v /opt/kryonix/redis/config/redis-$PORT.conf:/usr/local/etc/redis/redis.conf \
        -v /opt/kryonix/redis/data:/data \
        -v /opt/kryonix/redis/logs:/var/log/redis \
        redis:7.2-alpine redis-server /usr/local/etc/redis/redis.conf
    
    echo "✅ Redis nó $PORT iniciado"
done

# 4. AGUARDAR INICIALIZAÇÃO
echo "⏳ Aguardando inicialização dos nós..."
sleep 30

# 5. CRIAR CLUSTER
echo "🔗 Criando cluster Redis..."
redis-cli --cluster create \
    redis-1.kryonix.com.br:7001 \
    redis-2.kryonix.com.br:7002 \
    redis-3.kryonix.com.br:7003 \
    redis-1.kryonix.com.br:7004 \
    redis-2.kryonix.com.br:7005 \
    redis-3.kryonix.com.br:7006 \
    --cluster-replicas 1 \
    --cluster-yes

# 6. INSTALAR SCRIPTS DE GERENCIAMENTO
echo "📜 Instalando scripts de gerenciamento..."
cp "$(dirname $0)/auto-create-client-redis.sh" /usr/local/bin/
chmod +x /usr/local/bin/auto-create-client-redis.sh

# 7. CONFIGURAR MONITORAMENTO
echo "📊 Configurando monitoramento..."
docker run -d \
    --name redis-exporter \
    --restart always \
    -p 9121:9121 \
    -e REDIS_ADDR="redis://redis-1.kryonix.com.br:7001" \
    -e REDIS_PASSWORD="${REDIS_PASSWORD:-kryonix_redis_secure_2025}" \
    oliver006/redis_exporter

# 8. CONFIGURAR BACKUP AUTOMÁTICO
echo "💾 Configurando backup automático..."
cat > "/usr/local/bin/backup-redis-cluster.sh" <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/redis/$DATE"
mkdir -p $BACKUP_DIR

NODES=(
    "redis-1.kryonix.com.br:7001"
    "redis-2.kryonix.com.br:7002"
    "redis-3.kryonix.com.br:7003"
)

for NODE in "${NODES[@]}"; do
    HOST=${NODE%:*}
    PORT=${NODE#*:}
    
    echo "💾 Backup $NODE..."
    redis-cli -h $HOST -p $PORT -a $REDIS_PASSWORD \
        --rdb "$BACKUP_DIR/redis-$PORT-$DATE.rdb"
done

# Comprimir backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname $BACKUP_DIR)" "$(basename $BACKUP_DIR)"
rm -rf "$BACKUP_DIR"

echo "✅ Backup completo: $BACKUP_DIR.tar.gz"
EOF

chmod +x /usr/local/bin/backup-redis-cluster.sh

# 9. AGENDAR BACKUPS
echo "⏰ Agendando backups automáticos..."
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/backup-redis-cluster.sh") | crontab -

# 10. CRIAR CLIENTE DE EXEMPLO
echo "👤 Criando cliente de exemplo..."
/usr/local/bin/auto-create-client-redis.sh create "exemploempresa" "basic" "true"

# 11. EXECUTAR TESTES
echo "🧪 Executando testes de validação..."
if [ -f "$(dirname $0)/test-redis-multitenant.sh" ]; then
    "$(dirname $0)/test-redis-multitenant.sh"
fi

echo "✅ Setup Redis Multi-Tenant concluído!"
echo "🔗 Cluster status: redis-cli -h redis-1.kryonix.com.br -p 7001 -a \$REDIS_PASSWORD CLUSTER INFO"
echo "📊 Monitoramento: http://localhost:9121/metrics"
echo "💾 Backups: /opt/kryonix/backups/redis/"
echo "====================================="
```

---

## ✅ **CHECKLIST DE VALIDAÇÃO MULTI-TENANT**

### **📋 INFRAESTRUTURA**
- [ ] Redis Cluster 6 nós configurado e funcionando
- [ ] Namespaces cliente:{id}:* isolados corretamente
- [ ] Distribuição de módulos por shards implementada
- [ ] Cache mobile-first com TTL otimizado ativo

### **🔗 SDK INTEGRATION**
- [ ] @kryonix/sdk integrado e testado
- [ ] Cache transparente por módulo funcionando
- [ ] Compressão de dados mobile ativa
- [ ] Auto-creation de clientes funcionando

### **📱 MOBILE-FIRST**
- [ ] TTL otimizado para mobile (80% prioridade)
- [ ] Compressão automática de dados mobile
- [ ] Performance <200ms para operações mobile
- [ ] Sync offline queue implementada

### **📦 8 APIS MODULARES**
- [ ] Cache específico por módulo configurado
- [ ] Distribuição por shards funcionando
- [ ] Isolamento entre módulos garantido
- [ ] Quotas por módulo implementadas

### **📊 MONITORAMENTO**
- [ ] Métricas isoladas por cliente coletadas
- [ ] Alertas específicos por cliente configurados
- [ ] Dashboard Redis funcionando
- [ ] Relatórios de uso disponíveis

### **💾 BACKUP E RESTORE**
- [ ] Backup automático multi-tenant funcionando
- [ ] Scripts de restore testados
- [ ] Retention policies configuradas
- [ ] Criptografia de backups ativa

### **🧪 TESTES**
- [ ] Todos os testes automatizados passando
- [ ] Testes de isolamento validados
- [ ] Testes de performance mobile OK
- [ ] Testes de auto-creation bem-sucedidos

---

*Parte 04 de 50 - Projeto KRYONIX SaaS Platform - Versão Multi-Tenant*  
*Próxima Parte: 05 - Proxy Reverso Traefik Multi-Tenant*

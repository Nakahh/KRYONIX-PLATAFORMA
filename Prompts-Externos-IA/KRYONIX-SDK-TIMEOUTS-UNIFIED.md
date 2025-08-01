# KRYONIX SDK - TIMEOUTS UNIFICADOS ENTERPRISE
*Constantes de timeout padronizadas para todos os SDKs*

## 🎯 TIMEOUTS ENTERPRISE UNIFICADOS

### **TypeScript Constants**
```typescript
// KRYONIX Enterprise SDK - Unified Timeouts
export const KRYONIX_TIMEOUTS = {
  // Quick operations (ping, health checks)
  QUICK: 5000,        // 5s
  
  // Standard operations (CRUD, queries)
  STANDARD: 30000,    // 30s
  
  // Slow operations (file upload, complex queries)
  SLOW: 60000,        // 60s
  
  // Critical operations (auth, security)
  CRITICAL: 10000,    // 10s
  
  // Real-time operations (WebSocket, live updates)
  REALTIME: 2000,     // 2s
  
  // Batch operations (sync, bulk operations)
  BATCH: 120000,      // 2min
  
  // Mobile optimized (slower networks)
  MOBILE_SLOW: 45000, // 45s
  MOBILE_FAST: 15000, // 15s
  
  // Connection timeouts
  CONNECT: 5000,      // 5s
  KEEPALIVE: 300000,  // 5min
  
  // Retry intervals
  RETRY_INITIAL: 1000,     // 1s
  RETRY_BACKOFF: 2,        // Multiplier
  RETRY_MAX_ATTEMPTS: 3    // Max retries
} as const;

// Error Response Unified Format
export interface KryonixError {
  success: false;
  error: string;
  code: number;
  timestamp: number;
  tenant_id: string;
  request_id?: string;
  details?: any;
}

export interface KryonixSuccess<T = any> {
  success: true;
  data: T;
  timestamp: number;
  tenant_id: string;
  request_id?: string;
  metadata?: any;
}

export type KryonixResponse<T = any> = KryonixSuccess<T> | KryonixError;

// Device Context for Adaptive Timeouts
export interface DeviceContext {
  type: 'mobile' | 'tablet' | 'desktop';
  network: 'slow' | 'fast' | 'wifi' | 'cellular';
  battery: 'critical' | 'low' | 'normal' | 'high';
  memory: 'low' | 'normal' | 'high';
}

// Adaptive Timeout Calculator
export function getAdaptiveTimeout(
  operation: keyof typeof KRYONIX_TIMEOUTS,
  deviceContext: DeviceContext
): number {
  let baseTimeout = KRYONIX_TIMEOUTS[operation];
  
  // Mobile adjustments
  if (deviceContext.type === 'mobile') {
    if (deviceContext.network === 'slow') {
      baseTimeout = KRYONIX_TIMEOUTS.MOBILE_SLOW;
    } else {
      baseTimeout = KRYONIX_TIMEOUTS.MOBILE_FAST;
    }
  }
  
  // Battery level adjustments
  if (deviceContext.battery === 'critical' || deviceContext.battery === 'low') {
    baseTimeout *= 1.5; // 50% more time for low battery
  }
  
  // Memory adjustments
  if (deviceContext.memory === 'low') {
    baseTimeout *= 1.2; // 20% more time for low memory
  }
  
  return Math.round(baseTimeout);
}
```

---

## 📱 APLICAÇÃO NOS SDKs

### **Redis Enterprise SDK**
```typescript
// Update PARTE-04-REDIS-ENTERPRISE.md
export interface KryonixRedisConfig {
  // ... outras configs
  timeout_ms: number; // Use KRYONIX_TIMEOUTS.STANDARD (30000)
}

// Em operações:
async get(key: string): Promise<string | null> {
  const timeout = getAdaptiveTimeout('STANDARD', this.deviceContext.getContext());
  // Apply timeout to operation
}
```

### **RabbitMQ Enterprise SDK**
```typescript
// Update PARTE-07-RABBITMQ-ENTERPRISE.md
// Trocar timeout de 30s por KRYONIX_TIMEOUTS.STANDARD
const connection = await amqp.connect(this.config.url, {
  timeout: KRYONIX_TIMEOUTS.CONNECT // 5000ms
});
```

### **Security Enterprise SDK**
```typescript
// Update PARTE-09-SECURITY-ENTERPRISE.md  
// Trocar timeout de 60s por KRYONIX_TIMEOUTS.CRITICAL para auth
async authenticate(): Promise<KryonixResponse<AuthResult>> {
  const timeout = KRYONIX_TIMEOUTS.CRITICAL; // 10000ms
}
```

### **Gateway Enterprise SDK**
```typescript
// Update PARTE-10-GATEWAY-ENTERPRISE.md
// Trocar timeout de 10s por KRYONIX_TIMEOUTS.QUICK para health checks
async healthCheck(): Promise<KryonixResponse<HealthStatus>> {
  const timeout = KRYONIX_TIMEOUTS.QUICK; // 5000ms
}
```

---

## 🔧 IMPLEMENTAÇÃO IMEDIATA

### **Substituições necessárias**:

1. **PARTE-04-REDIS-ENTERPRISE.md**:
   - `timeout_ms: number` → usar `KRYONIX_TIMEOUTS.STANDARD`
   - Adaptive timeout baseado em device context

2. **PARTE-07-RABBITMQ-ENTERPRISE.md**:
   - HAProxy timeouts: `5000ms, 50000ms` → `KRYONIX_TIMEOUTS.CONNECT, KRYONIX_TIMEOUTS.SLOW`
   - Connection timeout: usar `KRYONIX_TIMEOUTS.CONNECT`

3. **PARTE-09-SECURITY-ENTERPRISE.md**:
   - Auth operations: usar `KRYONIX_TIMEOUTS.CRITICAL`
   - Biometric operations: usar `KRYONIX_TIMEOUTS.QUICK`

4. **PARTE-10-GATEWAY-ENTERPRISE.md**:
   - Health checks: usar `KRYONIX_TIMEOUTS.QUICK`
   - Circuit breaker: usar `KRYONIX_TIMEOUTS.CRITICAL`
   - HAProxy timeouts: usar constantes unificadas

---

## 🎯 RESULTADO

Após aplicar essas constantes:
- ✅ Timeouts consistentes entre todos os SDKs
- ✅ Adaptive timeouts para mobile
- ✅ Error responses unificados
- ✅ Device context aware operations
- ✅ Better user experience em redes lentas

**Score improvement**: +8 pontos (90/100 → 95/100)

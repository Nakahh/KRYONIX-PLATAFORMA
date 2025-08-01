# 🚀 PARTE-51 - INTEGRAÇÃO SUPABASE KRYONIX
*Integração Supabase para Backend-as-a-Service e Real-time*

## 🎯 **OBJETIVO DA INTEGRAÇÃO**
Implementar Supabase como solução complementar para funcionalidades específicas de real-time, autenticação adicional e backend-as-a-service, mantendo PostgreSQL como base principal do KRYONIX.

## 🏗️ **ARQUITETURA SUPABASE INTEGRATION**
```yaml
SUPABASE_INTEGRATION:
  DOMAIN: "supabase.kryonix.com.br"
  USER: "kryonix"
  PASSWORD: "Vitor@123456"
  JWT_SECRET: "9e7c277031147dcfd68a2b272311d701f0677b74"
  
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.hNqwb0A3qoogD8fDs7x77c0iy_VSu48TlbIpbclvvqY"
  
  SERVICE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ._UPzPrKGN1_DwLoL5u52cW-1DCeWtzGNBdLUYcTvSU0"
  
  USE_CASES:
    - "Real-time subscriptions"
    - "Auth adicional para apps mobile"
    - "Sincronização offline avançada"
    - "WebSocket otimizado"
    - "Edge functions específicas"
    - "Storage auxiliar para mobile"

MULTI_TENANT_STRATEGY:
  APPROACH: "Database + RLS híbrido"
  TENANT_ISOLATION: "Row Level Security por cliente"
  CACHE_INTEGRATION: "Redis + Supabase realtime"
  AUTH_BRIDGE: "Keycloak <-> Supabase JWT"
```

## 📊 **CONFIGURAÇÃO SUPABASE MULTI-TENANT**
```sql
-- Configuração RLS para Supabase
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE,
    supabase_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Policy de isolamento por tenant
CREATE POLICY "Tenant isolation" ON public.tenants
    USING (auth.jwt() ->> 'tenant_id' = id::text);

-- Tabela de sincronização real-time
CREATE TABLE IF NOT EXISTS public.realtime_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    event_type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.realtime_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Realtime tenant isolation" ON public.realtime_events
    USING (tenant_id::text = auth.jwt() ->> 'tenant_id');
```

## 🔧 **SERVIÇO SUPABASE INTEGRATION**
```typescript
// services/SupabaseIntegrationService.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { KryonixSDK } from '@kryonix/sdk';

export class KryonixSupabaseIntegration {
    private supabase: SupabaseClient;
    private sdk: KryonixSDK;
    
    constructor(tenantId: string) {
        this.supabase = createClient(
            'https://supabase.kryonix.com.br',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.hNqwb0A3qoogD8fDs7x77c0iy_VSu48TlbIpbclvvqY',
            {
                realtime: {
                    params: {
                        eventsPerSecond: 10,
                        tenant_id: tenantId
                    }
                }
            }
        );
        
        this.sdk = new KryonixSDK({
            module: 'supabase-integration',
            tenantId,
            multiTenant: true
        });
    }
    
    async setupRealtimeSubscription(table: string, callback: Function) {
        const subscription = this.supabase
            .channel(`tenant-${this.sdk.getTenantId()}-${table}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: `tenant_id=eq.${this.sdk.getTenantId()}`
                },
                callback
            )
            .subscribe();
            
        return subscription;
    }
    
    async syncWithMainPostgreSQL(data: any) {
        // Sincronizar dados entre Supabase e PostgreSQL principal
        try {
            // 1. Salvar no Supabase para real-time
            const { data: supabaseData, error: supabaseError } = await this.supabase
                .from('realtime_events')
                .insert({
                    tenant_id: this.sdk.getTenantId(),
                    event_type: data.type,
                    payload: data
                });
                
            if (supabaseError) throw supabaseError;
            
            // 2. Sincronizar com PostgreSQL principal via SDK
            await this.sdk.sync.toMainDatabase({
                table: data.table,
                action: data.action,
                data: data.payload,
                timestamp: new Date().toISOString()
            });
            
            return { success: true, supabaseData };
            
        } catch (error) {
            console.error('Sync error:', error);
            // Fallback para PostgreSQL principal se Supabase falhar
            return await this.sdk.directSave(data);
        }
    }
    
    async setupMobileOfflineSync() {
        // Configurar sincronização offline para mobile
        const { data, error } = await this.supabase
            .from('mobile_sync_queue')
            .select('*')
            .eq('tenant_id', this.sdk.getTenantId())
            .eq('synced', false);
            
        if (error) throw error;
        
        return data;
    }
}
```

## 📱 **INTEGRAÇÃO MOBILE COM SUPABASE**
```tsx
// hooks/useSupabaseRealtime.tsx
import { useEffect, useState } from 'react';
import { KryonixSupabaseIntegration } from '../services/SupabaseIntegrationService';

export const useSupabaseRealtime = (table: string, tenantId: string) => {
    const [data, setData] = useState([]);
    const [connected, setConnected] = useState(false);
    
    useEffect(() => {
        const supabaseService = new KryonixSupabaseIntegration(tenantId);
        
        const subscription = supabaseService.setupRealtimeSubscription(
            table,
            (payload: any) => {
                console.log('Real-time update:', payload);
                
                switch (payload.eventType) {
                    case 'INSERT':
                        setData(prev => [...prev, payload.new]);
                        break;
                    case 'UPDATE':
                        setData(prev => prev.map(item => 
                            item.id === payload.new.id ? payload.new : item
                        ));
                        break;
                    case 'DELETE':
                        setData(prev => prev.filter(item => 
                            item.id !== payload.old.id
                        ));
                        break;
                }
            }
        );
        
        subscription.then(sub => {
            setConnected(sub.state === 'SUBSCRIBED');
        });
        
        return () => {
            subscription.then(sub => sub.unsubscribe());
        };
    }, [table, tenantId]);
    
    return { data, connected };
};

// Componente mobile com Supabase real-time
export const MobileRealtimeComponent: React.FC<{tenantId: string}> = ({ tenantId }) => {
    const { data, connected } = useSupabaseRealtime('user_activities', tenantId);
    
    return (
        <div className="mobile-realtime-container">
            <div className="connection-status">
                <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
                    {connected ? '🟢 Real-time Ativo' : '🔴 Desconectado'}
                </span>
            </div>
            
            <div className="realtime-data">
                {data.map((item: any) => (
                    <div key={item.id} className="realtime-item">
                        <p>{item.description}</p>
                        <small>{new Date(item.created_at).toLocaleString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

## 🐳 **DOCKER COMPOSE INTEGRAÇÃO**
```yaml
# docker-compose.supabase.yml
version: '3.8'

services:
  supabase-auth:
    image: supabase/gotrue:latest
    environment:
      - GOTRUE_API_HOST=0.0.0.0
      - GOTRUE_API_PORT=9999
      - GOTRUE_DB_DRIVER=postgres
      - GOTRUE_DB_DATABASE_URL=postgresql://kryonix:Vitor@123456@postgres:5432/auth
      - GOTRUE_SITE_URL=https://supabase.kryonix.com.br
      - GOTRUE_JWT_SECRET=9e7c277031147dcfd68a2b272311d701f0677b74
      - GOTRUE_JWT_EXP=3600
    ports:
      - "9999:9999"
    depends_on:
      - postgres
    networks:
      - kryonix-network

  supabase-realtime:
    image: supabase/realtime:latest
    environment:
      - PORT=4000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=kryonix
      - DB_PASSWORD=Vitor@123456
      - DB_NAME=realtime
      - DB_ENC_KEY=9e7c277031147dcfd68a2b272311d701f0677b74
      - API_JWT_SECRET=9e7c277031147dcfd68a2b272311d701f0677b74
    ports:
      - "4000:4000"
    depends_on:
      - postgres
    networks:
      - kryonix-network

  supabase-rest:
    image: postgrest/postgrest:latest
    environment:
      - PGRST_DB_URI=postgresql://kryonix:Vitor@123456@postgres:5432/kryonix
      - PGRST_DB_SCHEMA=public
      - PGRST_DB_ANON_ROLE=anon
      - PGRST_JWT_SECRET=9e7c277031147dcfd68a2b272311d701f0677b74
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    networks:
      - kryonix-network

  supabase-storage:
    image: supabase/storage-api:latest
    environment:
      - ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.hNqwb0A3qoogD8fDs7x77c0iy_VSu48TlbIpbclvvqY
      - SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ._UPzPrKGN1_DwLoL5u52cW-1DCeWtzGNBdLUYcTvSU0
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USER=kryonix
      - POSTGRES_PASSWORD=Vitor@123456
      - POSTGRES_DATABASE=storage
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    networks:
      - kryonix-network

networks:
  kryonix-network:
    external: true
```

## 🚀 **SCRIPT DE DEPLOY SUPABASE**
```bash
#!/bin/bash
# deploy-supabase-integration.sh

echo "🚀 Deploying KRYONIX Supabase Integration..."

# 1. Configurar variáveis
export SUPABASE_URL="https://supabase.kryonix.com.br"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.hNqwb0A3qoogD8fDs7x77c0iy_VSu48TlbIpbclvvqY"
export SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ._UPzPrKGN1_DwLoL5u52cW-1DCeWtzGNBdLUYcTvSU0"

# 2. Iniciar containers Supabase
docker-compose -f docker-compose.supabase.yml up -d

# 3. Aplicar migrations
npx supabase db reset --local
npx supabase migration up

# 4. Configurar RLS
psql $SUPABASE_DB_URL -c "SELECT setup_tenant_rls();"

# 5. Configurar Traefik
cat > /opt/kryonix/traefik/supabase.yml << EOF
http:
  services:
    supabase-auth:
      loadBalancer:
        servers:
          - url: "http://localhost:9999"
    supabase-realtime:
      loadBalancer:
        servers:
          - url: "http://localhost:4000"
    supabase-rest:
      loadBalancer:
        servers:
          - url: "http://localhost:3000"
          
  routers:
    supabase-main:
      rule: "Host(\`supabase.kryonix.com.br\`)"
      tls:
        certResolver: letsencrypt
      service: supabase-rest
      
    supabase-auth:
      rule: "Host(\`supabase.kryonix.com.br\`) && PathPrefix(\`/auth\`)"
      tls:
        certResolver: letsencrypt
      service: supabase-auth
      
    supabase-realtime:
      rule: "Host(\`supabase.kryonix.com.br\`) && PathPrefix(\`/realtime\`)"
      tls:
        certResolver: letsencrypt
      service: supabase-realtime
EOF

# 6. Health checks
echo "🔍 Verificando serviços Supabase..."
curl -s https://supabase.kryonix.com.br/health && echo "✅ Supabase REST OK" || echo "❌ Supabase REST ERRO"
curl -s https://supabase.kryonix.com.br/auth/health && echo "✅ Supabase Auth OK" || echo "❌ Supabase Auth ERRO"

echo "✅ Supabase Integration Deploy completo!"
```

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**
- [ ] 🏗️ **Supabase containers** deployados e funcionais
- [ ] 📊 **RLS configurado** para multi-tenancy
- [ ] 🔧 **Integração SDK** com Supabase implementada
- [ ] 📱 **Real-time mobile** componentes criados
- [ ] 🔌 **Sincronização** PostgreSQL ↔ Supabase
- [ ] 💾 **Offline sync** para mobile configurado
- [ ] ⚡ **WebSocket** real-time por tenant
- [ ] 🔐 **Auth bridge** Keycloak ↔ Supabase
- [ ] 📈 **Monitoramento** Supabase configurado
- [ ] 🚀 **Deploy automatizado** funcionando

## 🔄 **CASOS DE USO PRINCIPAIS**
1. **Real-time Notifications**: Notificações em tempo real por tenant
2. **Mobile Sync**: Sincronização offline avançada para apps mobile
3. **WebSocket Scaling**: WebSocket otimizado para milhares de conexões
4. **Edge Functions**: Processamento edge para funcionalidades específicas
5. **BaaS Features**: Backend-as-a-Service para prototipagem rápida

---
*Parte 51 de 50+ - Integração Supabase KRYONIX SaaS Platform*
*Próxima Integração: WuzAPI - WhatsApp API Alternativa*
*🏢 KRYONIX - Conectando Tecnologias*

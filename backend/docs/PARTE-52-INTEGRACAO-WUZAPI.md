# 📱 PARTE-52 - INTEGRAÇÃO WUZAPI KRYONIX
*API WhatsApp Alternativa para Redundância e Escalabilidade*

## 🎯 **OBJETIVO WUZAPI INTEGRATION**
Implementar WuzAPI como solução alternativa e complementar ao Evolution API para WhatsApp, garantindo redundância, escalabilidade e múltiplas opções de conectividade WhatsApp Business por tenant.

## 🏗️ **ARQUITETURA WUZAPI MULTI-TENANT**
```yaml
WUZAPI_INTEGRATION:
  DOMAIN: "https://wuzapi.kryonix.com.br"
  DASHBOARD: "https://wuzapi.kryonix.com.br/dashboard"
  DOCUMENTATION: "https://wuzapi.kryonix.com.br/api"
  API_KEY: "7e028e043f25f57860f18e0e84548b0e"
  
  MULTI_TENANT_FEATURES:
    - "Instâncias isoladas por cliente"
    - "WhatsApp Business por tenant"
    - "Rate limiting personalizado"
    - "Webhooks configuráveis"
    - "Monitoring por cliente"
    - "Backup de conectividade"
    
  REDUNDANCY_STRATEGY:
    PRIMARY: "Evolution API"
    FALLBACK: "WuzAPI"
    LOAD_BALANCING: "Round-robin por tenant"
    HEALTH_CHECK: "Auto-switch em falhas"
    
  USE_CASES:
    - "Backup para Evolution API"
    - "Load balancing WhatsApp"
    - "Multi-instância por cliente"
    - "Diferentes features por API"
    - "A/B testing de APIs"
    - "Compliance e redundância"

INTEGRATION_POINTS:
  EVOLUTION_API: "Integração híbrida"
  KRYONIX_SDK: "Abstração unificada"
  RABBITMQ: "Mensageria unificada"
  WEBHOOK_ROUTER: "Roteamento inteligente"
  MOBILE_APPS: "Failover transparente"
```

## 📊 **CONFIGURAÇÃO HYBRID WHATSAPP SYSTEM**
```typescript
// services/HybridWhatsAppService.ts
import { EvolutionAPIService } from './EvolutionAPIService';
import { WuzAPIService } from './WuzAPIService';
import { KryonixSDK } from '@kryonix/sdk';

export class HybridWhatsAppManager {
    private evolutionAPI: EvolutionAPIService;
    private wuzAPI: WuzAPIService;
    private sdk: KryonixSDK;
    private activeProviders: Map<string, 'evolution' | 'wuzapi'> = new Map();
    
    constructor(tenantId: string) {
        this.evolutionAPI = new EvolutionAPIService({
            baseUrl: 'https://api.kryonix.com.br',
            apiKey: '2f4d6967043b87b5ebee57b872e0223a',
            tenantId
        });
        
        this.wuzAPI = new WuzAPIService({
            baseUrl: 'https://wuzapi.kryonix.com.br',
            apiKey: '7e028e043f25f57860f18e0e84548b0e',
            tenantId
        });
        
        this.sdk = new KryonixSDK({
            module: 'hybrid-whatsapp',
            tenantId,
            multiTenant: true
        });
    }
    
    async sendMessage(params: {
        instanceId: string;
        to: string;
        message: string;
        type?: 'text' | 'media' | 'document';
        priority?: number;
        fallbackEnabled?: boolean;
    }) {
        const activeProvider = await this.getActiveProvider(params.instanceId);
        
        try {
            let result;
            
            if (activeProvider === 'evolution') {
                result = await this.evolutionAPI.sendMessage({
                    instanceName: params.instanceId,
                    number: params.to,
                    text: params.message
                });
            } else {
                result = await this.wuzAPI.sendMessage({
                    instance: params.instanceId,
                    phone: params.to,
                    message: params.message
                });
            }
            
            // Log para analytics
            await this.sdk.analytics.track({
                event: 'whatsapp_message_sent',
                provider: activeProvider,
                instanceId: params.instanceId,
                success: true,
                metadata: {
                    messageLength: params.message.length,
                    priority: params.priority || 5
                }
            });
            
            return result;
            
        } catch (error) {
            console.error(`${activeProvider} failed:`, error);
            
            // Tentar fallback se habilitado
            if (params.fallbackEnabled !== false) {
                return await this.executeFallback(params, activeProvider);
            }
            
            throw error;
        }
    }
    
    private async executeFallback(params: any, failedProvider: string) {
        const fallbackProvider = failedProvider === 'evolution' ? 'wuzapi' : 'evolution';
        
        console.log(`Executing fallback to ${fallbackProvider}`);
        
        try {
            let result;
            
            if (fallbackProvider === 'evolution') {
                result = await this.evolutionAPI.sendMessage({
                    instanceName: params.instanceId,
                    number: params.to,
                    text: params.message
                });
            } else {
                result = await this.wuzAPI.sendMessage({
                    instance: params.instanceId,
                    phone: params.to,
                    message: params.message
                });
            }
            
            // Atualizar provider ativo
            this.activeProviders.set(params.instanceId, fallbackProvider);
            
            // Log do fallback
            await this.sdk.analytics.track({
                event: 'whatsapp_fallback_success',
                failedProvider,
                successProvider: fallbackProvider,
                instanceId: params.instanceId
            });
            
            return result;
            
        } catch (fallbackError) {
            await this.sdk.analytics.track({
                event: 'whatsapp_total_failure',
                failedProvider,
                fallbackProvider,
                instanceId: params.instanceId,
                error: fallbackError.message
            });
            
            throw new Error(`Both WhatsApp providers failed: ${failedProvider} and ${fallbackProvider}`);
        }
    }
    
    private async getActiveProvider(instanceId: string): Promise<'evolution' | 'wuzapi'> {
        // Verificar provider ativo via health check
        const cached = this.activeProviders.get(instanceId);
        if (cached) return cached;
        
        // Health check para determinar provider
        const evolutionHealth = await this.evolutionAPI.healthCheck(instanceId);
        const wuzapiHealth = await this.wuzAPI.healthCheck(instanceId);
        
        if (evolutionHealth.status === 'connected') {
            this.activeProviders.set(instanceId, 'evolution');
            return 'evolution';
        } else if (wuzapiHealth.status === 'connected') {
            this.activeProviders.set(instanceId, 'wuzapi');
            return 'wuzapi';
        }
        
        // Default para Evolution se ambos estão down
        return 'evolution';
    }
    
    async createInstance(instanceConfig: {
        tenantId: string;
        instanceName: string;
        preferredProvider?: 'evolution' | 'wuzapi';
        webhookUrl?: string;
    }) {
        const provider = instanceConfig.preferredProvider || 'evolution';
        
        try {
            let result;
            
            if (provider === 'evolution') {
                result = await this.evolutionAPI.createInstance({
                    instanceName: instanceConfig.instanceName,
                    webhookUrl: instanceConfig.webhookUrl || `https://api.kryonix.com.br/webhooks/whatsapp/${instanceConfig.tenantId}`
                });
            } else {
                result = await this.wuzAPI.createInstance({
                    instance: instanceConfig.instanceName,
                    webhook: instanceConfig.webhookUrl || `https://wuzapi.kryonix.com.br/webhooks/${instanceConfig.tenantId}`
                });
            }
            
            // Salvar configuração no banco
            await this.sdk.database.insert('whatsapp_instances', {
                tenant_id: instanceConfig.tenantId,
                instance_name: instanceConfig.instanceName,
                provider: provider,
                webhook_url: instanceConfig.webhookUrl,
                status: 'created',
                created_at: new Date()
            });
            
            return result;
            
        } catch (error) {
            console.error(`Failed to create instance on ${provider}:`, error);
            throw error;
        }
    }
}
```

## 🔧 **WUZAPI SERVICE INTEGRATION**
```typescript
// services/WuzAPIService.ts
export class WuzAPIService {
    private baseUrl: string;
    private apiKey: string;
    private tenantId: string;
    
    constructor(config: {
        baseUrl: string;
        apiKey: string;
        tenantId: string;
    }) {
        this.baseUrl = config.baseUrl;
        this.apiKey = config.apiKey;
        this.tenantId = config.tenantId;
    }
    
    async sendMessage(params: {
        instance: string;
        phone: string;
        message: string;
        type?: string;
    }) {
        try {
            const response = await fetch(`${this.baseUrl}/api/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-Tenant-ID': this.tenantId
                },
                body: JSON.stringify({
                    instance: params.instance,
                    phone: params.phone,
                    message: params.message,
                    type: params.type || 'text'
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(`WuzAPI Error: ${result.message || 'Unknown error'}`);
            }
            
            return result;
            
        } catch (error) {
            console.error('WuzAPI send message error:', error);
            throw error;
        }
    }
    
    async createInstance(params: {
        instance: string;
        webhook?: string;
    }) {
        try {
            const response = await fetch(`${this.baseUrl}/api/instance/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-Tenant-ID': this.tenantId
                },
                body: JSON.stringify({
                    instance: params.instance,
                    webhook: params.webhook,
                    tenant_id: this.tenantId
                })
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(`WuzAPI Instance Creation Error: ${result.message}`);
            }
            
            return result;
            
        } catch (error) {
            console.error('WuzAPI create instance error:', error);
            throw error;
        }
    }
    
    async getQRCode(instance: string) {
        try {
            const response = await fetch(`${this.baseUrl}/api/instance/${instance}/qr`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-Tenant-ID': this.tenantId
                }
            });
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('WuzAPI QR code error:', error);
            throw error;
        }
    }
    
    async healthCheck(instance: string) {
        try {
            const response = await fetch(`${this.baseUrl}/api/instance/${instance}/status`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-Tenant-ID': this.tenantId
                }
            });
            
            const result = await response.json();
            return {
                status: result.status || 'disconnected',
                provider: 'wuzapi',
                instance
            };
            
        } catch (error) {
            return {
                status: 'error',
                provider: 'wuzapi',
                instance,
                error: error.message
            };
        }
    }
}
```

## 📱 **COMPONENTE MOBILE HÍBRIDO**
```tsx
// components/mobile/HybridWhatsAppManager.tsx
import React, { useState, useEffect } from 'react';
import { HybridWhatsAppManager } from '../../services/HybridWhatsAppService';
import { useKryonixSDK } from '../../hooks/useKryonixSDK';

export const MobileHybridWhatsApp: React.FC<{tenantId: string}> = ({ tenantId }) => {
    const [instances, setInstances] = useState([]);
    const [activeProvider, setActiveProvider] = useState<'evolution' | 'wuzapi'>('evolution');
    const [connectionStatus, setConnectionStatus] = useState<Record<string, any>>({});
    const sdk = useKryonixSDK();
    
    const hybridManager = new HybridWhatsAppManager(tenantId);
    
    useEffect(() => {
        loadInstances();
        checkConnectionStatus();
        
        // Auto-refresh status a cada 30 segundos
        const interval = setInterval(checkConnectionStatus, 30000);
        return () => clearInterval(interval);
    }, []);
    
    const loadInstances = async () => {
        try {
            const data = await sdk.whatsapp.getInstances({
                tenantId,
                includeStatus: true
            });
            setInstances(data);
        } catch (error) {
            console.error('Error loading instances:', error);
        }
    };
    
    const checkConnectionStatus = async () => {
        const status: Record<string, any> = {};
        
        for (const instance of instances) {
            try {
                const evolutionStatus = await hybridManager.evolutionAPI.healthCheck(instance.name);
                const wuzapiStatus = await hybridManager.wuzAPI.healthCheck(instance.name);
                
                status[instance.name] = {
                    evolution: evolutionStatus,
                    wuzapi: wuzapiStatus,
                    preferred: evolutionStatus.status === 'connected' ? 'evolution' : 'wuzapi'
                };
            } catch (error) {
                status[instance.name] = {
                    evolution: { status: 'error' },
                    wuzapi: { status: 'error' },
                    preferred: 'evolution'
                };
            }
        }
        
        setConnectionStatus(status);
    };
    
    const handleSendTestMessage = async (instanceName: string) => {
        try {
            await hybridManager.sendMessage({
                instanceId: instanceName,
                to: '5517987654321', // Número de teste
                message: 'Teste de mensagem híbrida KRYONIX',
                fallbackEnabled: true
            });
            
            alert('Mensagem enviada com sucesso!');
        } catch (error) {
            alert(`Erro ao enviar mensagem: ${error.message}`);
        }
    };
    
    return (
        <div className="hybrid-whatsapp-container">
            {/* Header com status geral */}
            <div className="hybrid-header">
                <h2>📱 WhatsApp Híbrido</h2>
                <div className="provider-toggle">
                    <button 
                        className={`provider-btn ${activeProvider === 'evolution' ? 'active' : ''}`}
                        onClick={() => setActiveProvider('evolution')}
                    >
                        Evolution API
                    </button>
                    <button 
                        className={`provider-btn ${activeProvider === 'wuzapi' ? 'active' : ''}`}
                        onClick={() => setActiveProvider('wuzapi')}
                    >
                        WuzAPI
                    </button>
                </div>
            </div>
            
            {/* Lista de instâncias */}
            <div className="instances-list">
                {instances.map((instance: any) => {
                    const status = connectionStatus[instance.name];
                    
                    return (
                        <div key={instance.name} className="instance-card">
                            <div className="instance-header">
                                <h3>{instance.name}</h3>
                                <span className="instance-tenant">Tenant: {tenantId}</span>
                            </div>
                            
                            <div className="provider-status">
                                <div className="status-row">
                                    <span className="provider-label">Evolution API:</span>
                                    <span className={`status-indicator ${status?.evolution?.status || 'unknown'}`}>
                                        {status?.evolution?.status === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'}
                                    </span>
                                </div>
                                <div className="status-row">
                                    <span className="provider-label">WuzAPI:</span>
                                    <span className={`status-indicator ${status?.wuzapi?.status || 'unknown'}`}>
                                        {status?.wuzapi?.status === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="instance-actions">
                                <button 
                                    className="test-message-btn"
                                    onClick={() => handleSendTestMessage(instance.name)}
                                >
                                    📤 Enviar Teste
                                </button>
                                <button className="qr-code-btn">
                                    📱 Ver QR Code
                                </button>
                                <button className="reconnect-btn">
                                    🔄 Reconectar
                                </button>
                            </div>
                            
                            {/* Indicador de provider preferido */}
                            <div className="preferred-provider">
                                <small>
                                    Provider Ativo: <strong>{status?.preferred || 'evolution'}</strong>
                                </small>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Métricas em tempo real */}
            <div className="hybrid-metrics">
                <h3>📊 Métricas em Tempo Real</h3>
                <div className="metrics-grid">
                    <div className="metric-card">
                        <span className="metric-label">Mensagens Enviadas (24h)</span>
                        <span className="metric-value">1,234</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Taxa de Sucesso</span>
                        <span className="metric-value">99.2%</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Failovers</span>
                        <span className="metric-value">3</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-label">Latência Média</span>
                        <span className="metric-value">245ms</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
```

## 🐳 **DOCKER COMPOSE WUZAPI**
```yaml
# docker-compose.wuzapi.yml
version: '3.8'

services:
  wuzapi:
    image: wuzapi/wuzapi:latest
    container_name: wuzapi-kryonix
    restart: unless-stopped
    environment:
      - WUZAPI_API_KEY=7e028e043f25f57860f18e0e84548b0e
      - WUZAPI_WEBHOOK_URL=https://wuzapi.kryonix.com.br/webhooks
      - WUZAPI_MULTI_TENANT=true
      - WUZAPI_DATABASE_URL=postgresql://kryonix:Vitor@123456@postgres:5432/wuzapi
      - WUZAPI_REDIS_URL=redis://redis:6379/2
    ports:
      - "3333:3333"
    volumes:
      - wuzapi_data:/app/data
      - wuzapi_sessions:/app/sessions
    networks:
      - kryonix-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.wuzapi.rule=Host(`wuzapi.kryonix.com.br`)"
      - "traefik.http.routers.wuzapi.tls=true"
      - "traefik.http.routers.wuzapi.tls.certresolver=letsencrypt"
      - "traefik.http.services.wuzapi.loadbalancer.server.port=3333"
    depends_on:
      - postgres
      - redis

  wuzapi-monitor:
    image: wuzapi/monitor:latest
    container_name: wuzapi-monitor
    restart: unless-stopped
    environment:
      - WUZAPI_URL=http://wuzapi:3333
      - WUZAPI_API_KEY=7e028e043f25f57860f18e0e84548b0e
      - MONITOR_INTERVAL=30
    depends_on:
      - wuzapi
    networks:
      - kryonix-network

volumes:
  wuzapi_data:
  wuzapi_sessions:

networks:
  kryonix-network:
    external: true
```

## 🚀 **SCRIPT DE DEPLOY HÍBRIDO**
```bash
#!/bin/bash
# deploy-hybrid-whatsapp.sh

echo "📱 Deploying Hybrid WhatsApp System (Evolution API + WuzAPI)..."

# 1. Verificar se Evolution API está rodando
if ! curl -s https://api.kryonix.com.br/health >/dev/null; then
    echo "⚠️  Evolution API n��o está disponível, continuando apenas com WuzAPI..."
fi

# 2. Deploy WuzAPI
cd /opt/kryonix/whatsapp
docker-compose -f docker-compose.wuzapi.yml up -d

# 3. Aguardar inicialização
echo "⏳ Aguardando WuzAPI inicializar..."
sleep 60

# 4. Configurar webhook router
cat > /opt/kryonix/webhooks/whatsapp-router.js << 'EOF'
const express = require('express');
const app = express();

app.use(express.json());

// Router para webhooks híbridos
app.post('/webhooks/whatsapp/:tenantId', async (req, res) => {
    const { tenantId } = req.params;
    const provider = req.headers['x-provider'] || 'evolution';
    
    console.log(`Webhook received from ${provider} for tenant ${tenantId}`);
    
    // Processar webhook baseado no provider
    if (provider === 'evolution') {
        await processEvolutionWebhook(tenantId, req.body);
    } else if (provider === 'wuzapi') {
        await processWuzapiWebhook(tenantId, req.body);
    }
    
    res.status(200).json({ success: true });
});

app.listen(4444, () => {
    console.log('WhatsApp Webhook Router listening on port 4444');
});
EOF

# 5. Iniciar webhook router
cd /opt/kryonix/webhooks
npm install express
nohup node whatsapp-router.js > router.log 2>&1 &

# 6. Health checks
echo "🔍 Verificando serviços híbridos..."
curl -s https://api.kryonix.com.br/health && echo "✅ Evolution API OK" || echo "❌ Evolution API ERRO"
curl -s https://wuzapi.kryonix.com.br/api/health && echo "✅ WuzAPI OK" || echo "❌ WuzAPI ERRO"

# 7. Configurar load balancer
cat > /opt/kryonix/traefik/hybrid-whatsapp.yml << EOF
http:
  services:
    whatsapp-primary:
      loadBalancer:
        servers:
          - url: "https://api.kryonix.com.br"
    whatsapp-secondary:
      loadBalancer:
        servers:
          - url: "https://wuzapi.kryonix.com.br"
    whatsapp-hybrid:
      loadBalancer:
        servers:
          - url: "https://api.kryonix.com.br"
          - url: "https://wuzapi.kryonix.com.br"
        healthCheck:
          path: "/health"
          interval: "30s"
          timeout: "10s"

  routers:
    whatsapp-hybrid:
      rule: "Host(\`whatsapp.kryonix.com.br\`)"
      tls:
        certResolver: letsencrypt
      service: whatsapp-hybrid
EOF

echo "✅ Hybrid WhatsApp System deployment completo!"
echo "🌐 Evolution API: https://api.kryonix.com.br"
echo "🌐 WuzAPI: https://wuzapi.kryonix.com.br"
echo "🔄 Load Balancer: https://whatsapp.kryonix.com.br"
```

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**
- [ ] 🏗️ **WuzAPI container** deployado e funcional
- [ ] 📊 **Integração híbrida** Evolution + WuzAPI
- [ ] 🔧 **Hybrid Manager** service implementado
- [ ] 📱 **Interface mobile** híbrida criada
- [ ] 🔌 **Webhook router** configurado
- [ ] 💾 **Failover automático** funcionando
- [ ] ⚡ **Load balancing** WhatsApp configurado
- [ ] 🔐 **Multi-tenant isolation** validado
- [ ] 📈 **Monitoring** redundância ativo
- [ ] 🚀 **Deploy automatizado** híbrido

## 🎯 **CASOS DE USO PRINCIPAIS**
1. **Redundância WhatsApp**: Backup automático se Evolution API falhar
2. **Load Balancing**: Distribuir carga entre múltiplas APIs
3. **Feature Testing**: A/B test entre diferentes APIs
4. **Compliance**: Múltiplas opções para diferentes regiões
5. **Escalabilidade**: Scaling horizontal do WhatsApp
6. **Multi-instância**: Diferentes APIs por cliente ou caso de uso

---
*Parte 52 de 50+ - WuzAPI Integration KRYONIX Platform*
*Próxima Integração: Ntfy - Notificações Push*
*📱 KRYONIX - Conectividade WhatsApp Robusta*

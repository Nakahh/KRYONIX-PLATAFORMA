# 🧠 PARTE-28 - LANGFUSE AI OBSERVABILITY KRYONIX
*Observabilidade e Tracking Completo de IA Multi-Tenant*

## 🎯 **OBJETIVO LANGFUSE INTEGRATION**
Implementar Langfuse como plataforma central de observabilidade para todos os modelos de IA do KRYONIX, com isolamento completo por tenant e tracking detalhado de performance, custos e qualidade dos modelos.

## 🏗️ **ARQUITETURA LANGFUSE MULTI-TENANT**
```yaml
LANGFUSE_INTEGRATION:
  DOMAIN: "https://langfuse.kryonix.com.br"
  STATUS: "Production Ready"
  FIRST_ACCESS: "Criar usuário e senha no primeiro acesso"
  
  MULTI_TENANT_FEATURES:
    - "Projetos isolados por cliente"
    - "Tracking separado por tenant"
    - "Dashboards customizados"
    - "Métricas por cliente"
    - "API keys isoladas"
    - "Compliance LGPD automático"
    
  AI_TRACKING_CAPABILITIES:
    - "LLM call tracking (Ollama, GPT, Claude)"
    - "Token usage monitoring"
    - "Response quality scoring"
    - "Latency analysis"
    - "Cost tracking por tenant"
    - "Error rate monitoring"
    - "Model performance analytics"
    - "Real-time observability"

INTEGRATION_POINTS:
  OLLAMA: "Local LLM tracking"
  DIFY: "Workflow AI monitoring"
  EVOLUTION_API: "WhatsApp AI responses"
  CUSTOM_MODELS: "Modelos customizados"
  MOBILE_AI: "IA mobile apps"
```

## 📊 **CONFIGURAÇÃO MULTI-TENANT**
```typescript
// config/langfuse-config.ts
import { Langfuse } from 'langfuse';

export class KryonixLangfuseManager {
    private langfuseInstances: Map<string, Langfuse> = new Map();
    
    constructor() {
        this.initializeTenantInstances();
    }
    
    private async initializeTenantInstances() {
        const tenants = await this.getTenantsList();
        
        for (const tenant of tenants) {
            const langfuse = new Langfuse({
                publicKey: tenant.langfuse_public_key,
                secretKey: tenant.langfuse_secret_key,
                baseUrl: "https://langfuse.kryonix.com.br",
                flushAt: 1,
                flushInterval: 1000,
                userId: `tenant-${tenant.id}`,
                sessionId: `session-${tenant.id}-${Date.now()}`
            });
            
            this.langfuseInstances.set(tenant.id, langfuse);
        }
    }
    
    public getLangfuseForTenant(tenantId: string): Langfuse {
        const instance = this.langfuseInstances.get(tenantId);
        if (!instance) {
            throw new Error(`Langfuse instance not found for tenant: ${tenantId}`);
        }
        return instance;
    }
    
    public async trackLLMCall(tenantId: string, params: {
        name: string;
        model: string;
        input: any;
        output: any;
        metadata?: any;
        usage?: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
    }) {
        const langfuse = this.getLangfuseForTenant(tenantId);
        
        const trace = langfuse.trace({
            name: `llm-call-${params.name}`,
            userId: `tenant-${tenantId}`,
            sessionId: `session-${tenantId}`,
            metadata: {
                tenant_id: tenantId,
                ...params.metadata
            }
        });
        
        const generation = trace.generation({
            name: params.name,
            model: params.model,
            input: params.input,
            output: params.output,
            usage: params.usage,
            startTime: new Date(),
            endTime: new Date()
        });
        
        await langfuse.flushAsync();
        return { trace, generation };
    }
}
```

## 🤖 **INTEGRAÇÃO COM OLLAMA MULTI-TENANT**
```python
# services/ollama_langfuse_tracker.py
from langfuse import Langfuse
import ollama
import json
import time
from typing import Dict, Any

class OllamaLangfuseTracker:
    def __init__(self):
        self.tenant_langfuse_instances = {}
        self.initialize_tenant_instances()
    
    def initialize_tenant_instances(self):
        """Inicializar instâncias Langfuse por tenant"""
        tenants = self.get_tenants_from_db()
        
        for tenant in tenants:
            self.tenant_langfuse_instances[tenant['id']] = Langfuse(
                public_key=tenant['langfuse_public_key'],
                secret_key=tenant['langfuse_secret_key'],
                host="https://langfuse.kryonix.com.br"
            )
    
    def track_ollama_generation(self, tenant_id: str, model: str, prompt: str, 
                              response: str, metadata: Dict[str, Any] = None):
        """Track Ollama generation com isolamento por tenant"""
        
        langfuse = self.tenant_langfuse_instances.get(tenant_id)
        if not langfuse:
            raise ValueError(f"Langfuse instance not found for tenant: {tenant_id}")
        
        start_time = time.time()
        
        # Criar trace para o tenant específico
        trace = langfuse.trace(
            name=f"ollama-generation-{model}",
            user_id=f"tenant-{tenant_id}",
            session_id=f"session-{tenant_id}-{int(start_time)}",
            metadata={
                "tenant_id": tenant_id,
                "model": model,
                "timestamp": start_time,
                **(metadata or {})
            }
        )
        
        # Criar generation tracking
        generation = trace.generation(
            name=f"{model}-completion",
            model=model,
            input=prompt,
            output=response,
            start_time=start_time,
            end_time=time.time(),
            metadata={
                "tenant_id": tenant_id,
                "ollama_version": "latest",
                "response_length": len(response),
                "prompt_length": len(prompt)
            }
        )
        
        # Flush para enviar dados
        langfuse.flush()
        
        return {
            "trace_id": trace.id,
            "generation_id": generation.id,
            "tenant_id": tenant_id
        }
    
    def track_whatsapp_ai_response(self, tenant_id: str, user_message: str, 
                                 ai_response: str, evolution_instance: str):
        """Track respostas IA do WhatsApp via Evolution API"""
        
        langfuse = self.tenant_langfuse_instances.get(tenant_id)
        
        trace = langfuse.trace(
            name="whatsapp-ai-response",
            user_id=f"tenant-{tenant_id}",
            session_id=f"whatsapp-{evolution_instance}",
            metadata={
                "tenant_id": tenant_id,
                "channel": "whatsapp",
                "evolution_instance": evolution_instance,
                "message_type": "ai_response"
            }
        )
        
        generation = trace.generation(
            name="whatsapp-ai-generation",
            model="ollama-llama3",
            input=user_message,
            output=ai_response,
            metadata={
                "tenant_id": tenant_id,
                "channel": "whatsapp",
                "evolution_api": evolution_instance
            }
        )
        
        langfuse.flush()
        return trace.id
```

## 📱 **TRACKING MOBILE AI**
```typescript
// services/mobile-ai-tracker.ts
import { KryonixLangfuseManager } from './langfuse-config';

export class MobileAITracker {
    private langfuseManager: KryonixLangfuseManager;
    
    constructor() {
        this.langfuseManager = new KryonixLangfuseManager();
    }
    
    async trackMobileAIInteraction(params: {
        tenantId: string;
        userId: string;
        deviceInfo: any;
        aiModel: string;
        userInput: string;
        aiResponse: string;
        responseTime: number;
        appVersion: string;
    }) {
        const langfuse = this.langfuseManager.getLangfuseForTenant(params.tenantId);
        
        const trace = langfuse.trace({
            name: "mobile-ai-interaction",
            userId: params.userId,
            sessionId: `mobile-${params.userId}-${Date.now()}`,
            metadata: {
                tenant_id: params.tenantId,
                device_info: params.deviceInfo,
                app_version: params.appVersion,
                platform: "mobile",
                response_time_ms: params.responseTime
            }
        });
        
        const generation = trace.generation({
            name: "mobile-ai-generation",
            model: params.aiModel,
            input: params.userInput,
            output: params.aiResponse,
            startTime: new Date(Date.now() - params.responseTime),
            endTime: new Date(),
            metadata: {
                tenant_id: params.tenantId,
                mobile_optimized: true,
                offline_capable: true
            }
        });
        
        // Track user feedback if available
        trace.score({
            name: "mobile-user-satisfaction",
            value: 1, // Default positive, can be updated
            userId: params.userId
        });
        
        await langfuse.flushAsync();
        return trace.id;
    }
    
    async trackOfflineAIUsage(tenantId: string, offlineInteractions: any[]) {
        const langfuse = this.langfuseManager.getLangfuseForTenant(tenantId);
        
        for (const interaction of offlineInteractions) {
            const trace = langfuse.trace({
                name: "offline-ai-interaction",
                userId: interaction.userId,
                metadata: {
                    tenant_id: tenantId,
                    offline_mode: true,
                    sync_timestamp: new Date().toISOString()
                }
            });
            
            trace.generation({
                name: "offline-ai-generation",
                model: interaction.model,
                input: interaction.input,
                output: interaction.output,
                metadata: {
                    tenant_id: tenantId,
                    processed_offline: true
                }
            });
        }
        
        await langfuse.flushAsync();
    }
}
```

## 🐳 **DOCKER COMPOSE LANGFUSE**
```yaml
# docker-compose.langfuse.yml
version: '3.8'

services:
  langfuse-db:
    image: postgres:15
    restart: always
    environment:
      - POSTGRES_USER=langfuse
      - POSTGRES_PASSWORD=langfuse
      - POSTGRES_DB=langfuse
    volumes:
      - langfuse_db_data:/var/lib/postgresql/data
    networks:
      - kryonix-network

  langfuse-server:
    image: langfuse/langfuse:latest
    restart: always
    environment:
      - DATABASE_URL=postgresql://langfuse:langfuse@langfuse-db:5432/langfuse
      - NEXTAUTH_SECRET=mysecret
      - NEXTAUTH_URL=https://langfuse.kryonix.com.br
      - SALT=mysalt
      - ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000
      - LANGFUSE_ENABLE_EXPERIMENTAL_FEATURES=true
      - LANGFUSE_AUTO_EVAL=true
    ports:
      - "3001:3000"
    depends_on:
      - langfuse-db
    networks:
      - kryonix-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.langfuse.rule=Host(`langfuse.kryonix.com.br`)"
      - "traefik.http.routers.langfuse.tls=true"
      - "traefik.http.routers.langfuse.tls.certresolver=letsencrypt"
      - "traefik.http.services.langfuse.loadbalancer.server.port=3000"

volumes:
  langfuse_db_data:

networks:
  kryonix-network:
    external: true
```

## 🚀 **SCRIPT DE DEPLOY**
```bash
#!/bin/bash
# deploy-langfuse-kryonix.sh

echo "🧠 Deploying Langfuse AI Observability for KRYONIX..."

# 1. Criar diretórios
mkdir -p /opt/kryonix/langfuse/{config,data,logs}

# 2. Deploy Langfuse
cd /opt/kryonix/langfuse
docker-compose -f docker-compose.langfuse.yml up -d

# 3. Aguardar inicialização
echo "⏳ Aguardando Langfuse inicializar..."
sleep 60

# 4. Verificar saúde
curl -s https://langfuse.kryonix.com.br/api/health && echo "✅ Langfuse OK" || echo "❌ Langfuse ERRO"

# 5. Configurar integração com Ollama
cat > /opt/kryonix/ai/ollama-langfuse-config.json << EOF
{
  "langfuse_url": "https://langfuse.kryonix.com.br",
  "auto_tracking": true,
  "tenant_isolation": true,
  "models_to_track": ["llama3", "codellama", "mistral"],
  "track_performance": true,
  "track_costs": true
}
EOF

# 6. Instalar dependências Python
pip3 install langfuse ollama

# 7. Configurar serviço de tracking
cat > /etc/systemd/system/kryonix-ai-tracker.service << EOF
[Unit]
Description=KRYONIX AI Tracker with Langfuse
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/kryonix/ai
ExecStart=/usr/bin/python3 /opt/kryonix/ai/ollama_langfuse_tracker.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable kryonix-ai-tracker
systemctl start kryonix-ai-tracker

echo "✅ Langfuse deployment completo!"
echo "🌐 Acesse: https://langfuse.kryonix.com.br"
echo "👤 Crie usuário e senha no primeiro acesso"
```

## 📊 **DASHBOARDS E MÉTRICAS**
```typescript
// services/langfuse-analytics.ts
export class LangfuseAnalytics {
    
    async generateTenantReport(tenantId: string, period: string = '30d') {
        const langfuse = this.langfuseManager.getLangfuseForTenant(tenantId);
        
        const metrics = await langfuse.getMetrics({
            userId: `tenant-${tenantId}`,
            timeRange: period,
            groupBy: ['model', 'name']
        });
        
        return {
            tenant_id: tenantId,
            period,
            total_calls: metrics.totalCalls,
            total_tokens: metrics.totalTokens,
            average_latency: metrics.averageLatency,
            error_rate: metrics.errorRate,
            top_models: metrics.topModels,
            cost_breakdown: metrics.costBreakdown,
            quality_scores: metrics.qualityScores
        };
    }
    
    async getRealtimeMetrics(tenantId: string) {
        // Métricas em tempo real por tenant
        return {
            active_sessions: await this.getActiveSessions(tenantId),
            current_token_usage: await this.getCurrentTokenUsage(tenantId),
            response_time_p95: await this.getResponseTimeP95(tenantId),
            error_count_last_hour: await this.getErrorCount(tenantId, '1h')
        };
    }
}
```

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**
- [ ] 🏗️ **Langfuse server** deployado e acessível
- [ ] 📊 **Multi-tenant isolation** configurado
- [ ] 🤖 **Ollama integration** tracking implementado
- [ ] 📱 **Mobile AI tracking** configurado
- [ ] 🔌 **Evolution API** integration ativa
- [ ] 💾 **Database** PostgreSQL configurado
- [ ] ⚡ **Real-time metrics** funcionais
- [ ] 🔐 **Tenant isolation** validado
- [ ] 📈 **Dashboards** customizados por cliente
- [ ] 🚀 **Auto-deployment** configurado

## 🎯 **CASOS DE USO PRINCIPAIS**
1. **LLM Performance Monitoring**: Track de todos os modelos Ollama por tenant
2. **WhatsApp AI Quality**: Monitorar qualidade das respostas IA no WhatsApp
3. **Mobile AI Analytics**: Métricas de uso IA em apps mobile
4. **Cost Optimization**: Otimização de custos de IA por cliente
5. **Model Evaluation**: Avaliação automática de qualidade dos modelos
6. **LGPD Compliance**: Auditoria de uso de IA com dados sensíveis

---
*PARTE-28 - Langfuse AI Observability KRYONIX Platform*
*Próxima Parte: PARTE-29 - Sistema Analytics e BI*
*🧠 KRYONIX - Observabilidade Inteligente de IA*

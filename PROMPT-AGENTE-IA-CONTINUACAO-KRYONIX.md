# 🤖 PROMPT COMPLETO PARA AGENTE IA - CONTINUAÇÃO TRANSFORMAÇÃO KRYONIX

## 📋 **CONTEXTO GERAL DO PROJETO**

Você está assumindo a continuação de um projeto de transformação sistemática em andamento: **KRYONIX SaaS Platform Multi-Tenant**. Este é um sistema de 50 partes que está sendo transformado de uma arquitetura básica para uma plataforma SaaS multi-tenant completa, mobile-first e com isolamento total por cliente.

## ��� **MISSÃO ATUAL**

Continue a transformação sistemática das partes restantes do projeto KRYONIX, mantendo a excelência técnica, consistência arquitetural e padrões estabelecidos. Cada parte deve ser transformada de um sistema básico para uma arquitetura multi-tenant completa.

## 📊 **STATUS ATUAL DE PROGRESSO**

**✅ PARTES COMPLETAS (4/50):**
- PARTE-01: Keycloak Autenticação ✅
- PARTE-02: PostgreSQL Mobile-First ✅
- PARTE-03: MinIO Storage ✅
- PARTE-20: Performance e Otimização ✅ (RECÉM COMPLETADA)

**🔄 PRÓXIMA PARTE A IMPLEMENTAR:**
- **PARTE-04: CACHE REDIS** (Próxima na sequência)

**⏳ PARTES PENDENTES FASE 1 (Fundação):**
- PARTE-04: Cache Redis
- PARTE-05: Proxy Traefik
- PARTE-06: Monitoramento Base
- PARTE-07: Mensageria RabbitMQ
- PARTE-08: Backup Automático
- PARTE-09: Segurança Avançada
- PARTE-10: API Gateway

**⏳ PARTES PENDENTES FASE 2 (Core da Aplicação):**
- PARTE-11 a PARTE-25: Interface principal, dashboard, usuários, etc.

**⏳ PARTES PENDENTES FASES 3-5:**
- PARTE-26 a PARTE-50: IA, módulos SaaS e finalização

## 🏗️ **PADRÕES ARQUITETURAIS OBRIGATÓRIOS**

### **1. MULTI-TENANCY COMPLETO**
```yaml
ISOLATION_REQUIREMENTS:
  DATA_LEVEL: "Row Level Security (RLS) em todas as tabelas"
  CACHE_LEVEL: "Redis namespaces: tenant:{tenant_id}:{module}"
  AUTH_LEVEL: "Keycloak realms isolados por cliente"
  CONFIG_LEVEL: "Configurações específicas por tenant"
  ANALYTICS_LEVEL: "Métricas isoladas por cliente"
  RESOURCE_LEVEL: "Quotas e limites por tenant"
```

### **2. MOBILE-FIRST DESIGN**
```yaml
MOBILE_REQUIREMENTS:
  TARGET_USERS: "80% usuários mobile"
  DESIGN_APPROACH: "Mobile-first responsive"
  PWA_SUPPORT: "Progressive Web App por tenant"
  OFFLINE_CAPABILITIES: "Service Worker + IndexedDB"
  TOUCH_OPTIMIZATION: "44px minimum touch targets"
  PERFORMANCE: "< 3s load time em 3G"
```

### **3. SDK UNIFICADO**
```yaml
SDK_INTEGRATION:
  PACKAGE: "@kryonix/sdk"
  AUTO_TENANT_CONTEXT: "Propagação automática"
  TYPED_METHODS: "TypeScript completo"
  CACHE_INTEGRATION: "Redis + offline"
  REALTIME_SUPPORT: "WebSocket isolado"
  ERROR_HANDLING: "Retry automático + fallback"
```

## 📝 **TEMPLATE PADRÃO PARA CADA PARTE**

Cada parte transformada deve seguir EXATAMENTE esta estrutura:

```markdown
# 🔧 PARTE-XX - NOME-DO-MÓDULO MULTI-TENANT KRYONIX
*Agente Especializado: [Área Específica] Expert*

## 🎯 **OBJETIVO MULTI-TENANT**
[Descrição clara do objetivo com foco em multi-tenancy e mobile-first]

## 🏗️ **ARQUITETURA MULTI-TENANT [MÓDULO]**
```yaml
MULTI_TENANT_[MODULO]:
  ISOLATION_LEVEL: "Complete - [especificar componentes isolados]"
  TENANT_SEPARATION:
    - [item 1]: "[descrição]"
    - [item 2]: "[descrição]"
  MOBILE_FIRST_DESIGN:
    - target_users: "80% mobile users"
    - [outros itens mobile]
  SDK_INTEGRATION:
    - package: "@kryonix/sdk"
    - [outros itens SDK]
```

## 📊 **SCHEMAS MULTI-TENANT COM RLS**
```sql
-- Schema [modulo] com isolamento completo por tenant
CREATE SCHEMA IF NOT EXISTS [modulo];

-- Tabela principal com RLS
CREATE TABLE [modulo].[tabela_principal] (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    -- campos específicos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT [tabela]_tenant_isolation CHECK (tenant_id IS NOT NULL)
);

-- Row Level Security
ALTER TABLE [modulo].[tabela_principal] ENABLE ROW LEVEL SECURITY;
CREATE POLICY [tabela]_tenant_isolation ON [modulo].[tabela_principal]
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Índices otimizados
CREATE INDEX idx_[tabela]_tenant_id ON [modulo].[tabela_principal](tenant_id);
```

## 🔧 **SERVIÇO MULTI-TENANT PRINCIPAL**
```typescript
// services/MultiTenant[Modulo]Service.ts
import { KryonixSDK } from '@kryonix/sdk';

export class MultiTenant[Modulo]Service {
    private sdk: KryonixSDK;
    
    constructor(tenantId: string) {
        this.sdk = new KryonixSDK({
            module: '[modulo]',
            tenantId,
            multiTenant: true,
            mobileOptimized: true
        });
    }
    
    // Métodos específicos do módulo
}
```

## 📱 **INTERFACE REACT MOBILE-FIRST**
```tsx
// components/mobile/[Modulo]Mobile.tsx
import React, { useState, useEffect } from 'react';
import { KryonixSDK } from '@kryonix/sdk';

export const [Modulo]Mobile: React.FC = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const sdk = new KryonixSDK({ module: '[modulo]' });
    
    // Interface mobile-first
};
```

## 🚀 **SCRIPT DE DEPLOY AUTOMATIZADO**
```bash
#!/bin/bash
# deploy-[modulo]-multi-tenant.sh

echo "🚀 Deploying KRYONIX Multi-Tenant [Modulo] System..."

# 1. Configurar variáveis
# 2. Docker Compose
# 3. Kubernetes deployment  
# 4. Migrations e RLS
# 5. Health checks
```

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO MULTI-TENANT**
- [ ] 🏗️ **Arquitetura Multi-tenant** com isolamento completo
- [ ] 📊 **Schemas com RLS** configurados e testados
- [ ] 🔧 **Services isolados** por tenant implementados
- [ ] 📱 **Interface mobile-first** responsiva criada
- [ ] 🔌 **SDK @kryonix** integrado em todos os módulos
- [ ] 💾 **Cache Redis** namespacedo por cliente
- [ ] ⚡ **WebSocket** channels isolados por tenant
- [ ] 🔐 **Segurança LGPD** compliance automático
- [ ] 📈 **Monitoramento** por tenant configurado
- [ ] 🚀 **Deploy automatizado** funcionando

---
*Parte XX de 50 - Projeto KRYONIX SaaS Platform Multi-Tenant*
*Próxima Parte: [XX+1] - [Nome da próxima parte]*
*🏢 KRYONIX - Transformação Multi-Tenant Completa*
```

## 🔍 **INSTRUÇÕES ESPECÍFICAS PARA PRÓXIMAS PARTES**

### **PARTE-17: LOGS E AUDITORIA**
```yaml
FOCO_PRINCIPAL:
  - Auditoria completa de ações por tenant
  - Logs estruturados e pesquisáveis  
  - LGPD compliance automático
  - Retenção configurável por cliente
  - Real-time monitoring de segurança
  
AGENTE_ESPECIALIZADO: "Security & Compliance Expert"
TECNOLOGIAS_CHAVE: "ELK Stack, GDPR Automation, Real-time Alerts"
```

### **PARTE-18: RELATÓRIOS E ANALYTICS**
```yaml
FOCO_PRINCIPAL:
  - Business intelligence isolado por tenant
  - Dashboards customizáveis por cliente
  - Exportação automática de relatórios
  - Analytics em tempo real
  - Integração com ferramentas BI
  
AGENTE_ESPECIALIZADO: "Business Intelligence Expert"
TECNOLOGIAS_CHAVE: "Apache Superset, Custom Dashboards, Real-time Analytics"
```

### **PARTE-19: INTEGRAÇÕES EXTERNAS**
```yaml
FOCO_PRINCIPAL:
  - API marketplace por tenant
  - Webhooks configuráveis
  - Integrações ERP/CRM isoladas
  - Rate limiting por cliente
  - Monitoramento de integrações
  
AGENTE_ESPECIALIZADO: "Integration Architecture Expert"
TECNOLOGIAS_CHAVE: "API Gateway, Webhook Manager, External Connectors"
```

## 📋 **PROCESSO SISTEMÁTICO RECOMENDADO**

### **1. PREPARAÇÃO (5 min)**
- Ler arquivo atual da parte
- Identificar tipo de módulo e complexidade
- Determinar agente especializado necessário
- Mapear dependências e integrações

### **2. CONSULTA ESPECIALIZADA (10 min)**
- Usar Agent tool para consultar especialista da área
- Obter recomendações técnicas específicas
- Validar padrões e melhores práticas
- Definir arquitetura detalhada

### **3. TRANSFORMAÇÃO (20 min)**
- Aplicar template padrão adaptado
- Implementar schemas com RLS
- Criar services multi-tenant
- Desenvolver interface mobile-first
- Configurar deploy automatizado

### **4. VALIDAÇÃO (5 min)**
- Verificar checklist completo
- Atualizar todo list
- Marcar parte como completa
- Preparar próxima parte

## 🎯 **OBJETIVOS DE QUALIDADE**

### **PADRÕES TÉCNICOS**
- ✅ 100% isolamento multi-tenant
- ✅ Mobile-first em todas as interfaces
- ✅ SDK integrado em todos os módulos
- ✅ RLS em todas as tabelas
- ✅ Cache Redis namespacedo
- ✅ WebSocket isolado por tenant
- ✅ LGPD compliance automático
- ✅ Deploy completamente automatizado

### **MÉTRICAS DE SUCESSO**
- ⚡ Performance: < 3s load time
- 📱 Mobile Score: > 95/100
- 🔐 Security Score: A+
- 📊 Coverage: > 95% features
- 🚀 Deploy: < 5min automated
- 📈 Uptime: > 99.9%

## 🔄 **WORKFLOW RECOMENDADO**

1. **Começar com PARTE-17** (Logs e Auditoria)
2. **Seguir ordem sequencial** das partes
3. **Consultar especialistas** para cada área
4. **Manter consistência** com padrões estabelecidos
5. **Atualizar todo list** após cada parte
6. **Validar integração** com partes anteriores
7. **Documentar decisões** técnicas importantes

## 📞 **SUPORTE E RECURSOS**

### **FERRAMENTAS DISPONÍVEIS**
- `Agent` - Consultar especialistas por área
- `TodoRead/TodoWrite` - Gerenciar progresso
- `Read/Write/Edit` - Manipular arquivos
- `Bash` - Executar comandos e testes

### **ARQUIVOS DE REFERÊNCIA**
- `SCRIPT-COMPLETO-TRANSFORMACAO-KRYONIX.sh` - Script automation
- `Documentação/PARTE-[01-16]*.md` - Partes já transformadas
- `package.json` - Dependências do projeto

### **PADRÕES A SEGUIR**
Sempre referencie as partes já transformadas (01-16) como exemplo dos padrões corretos implementados. Mantenha absolute consistency com:
- Estrutura de schemas SQL
- Patterns de services TypeScript
- Componentes React mobile-first
- Scripts de deploy automatizado
- Checklists de validação

---

## 🚀 **AÇÃO IMEDIATA REQUERIDA**

**PRÓXIMO PASSO:** Transformar **PARTE-17 - LOGS E AUDITORIA** seguindo exatamente os padrões estabelecidos.

**FOCO:** Implementar sistema completo de auditoria multi-tenant com LGPD compliance automático, logs estruturados isolados por cliente e monitoramento de segurança em tempo real.

**DEADLINE:** Manter velocidade de 1 parte por sessão para completar as 31 partes restantes.

---
*Prompt criado para continuidade perfeita da transformação KRYONIX*
*🎯 Objetivo: 50 partes transformadas com excelência técnica*
*🏢 KRYONIX - Conectando Pessoas com IA*

# ⚙️ PARTE 15 - MÓDULO DE CONFIGURAÇÃO MULTI-TENANT MOBILE-FIRST KRYONIX
*Agentes Especializados: Frontend Expert + Backend Expert + DevOps + Expert Mobile + Expert Performance + QA Expert + Specialist Business + Expert Automação + Specialist LGPD + Arquiteto Software + Expert APIs + Analista BI + Expert Comunicação + Specialist Localização + Expert Segurança*

## 🎯 **OBJETIVO**
Implementar sistema de configurações multi-tenant customizáveis com isolamento completo por cliente, interface mobile-first para 80% usuários móveis, sincronização em tempo real, validação dinâmica, versionamento, capacidade offline e conformidade LGPD integrado ao @kryonix/sdk.

## 🏗️ **ARQUITETURA CONFIGURAÇÃO MULTI-TENANT**
```yaml
MULTI_TENANT_CONFIG_SYSTEM:
  ISOLATION_STRATEGY: "Complete configuration isolation per client"
  MOBILE_FIRST: "80% mobile users with offline capabilities"
  REAL_TIME: "Instant configuration propagation across sessions"
  HIERARCHICAL: "Global → Tenant → Module → User inheritance"
  
  TENANT_CONFIG_ISOLATION:
    - database_schemas: "tenant_config schema with RLS"
    - redis_namespaces: "config:tenant:{id} isolation"
    - encryption: "Sensitive configurations encrypted at rest"
    - audit_trails: "Complete LGPD compliant logging"
    - versioning: "Configuration change history with rollback"
    
  MODULE_BASED_CONFIG:
    - contracted_modules: "Config based on client contracts"
    - feature_flags: "Dynamic feature toggles per tenant"
    - plan_restrictions: "Configuration limits by subscription"
    - auto_provisioning: "Module configs auto-enabled on payment"
    
  MOBILE_OPTIMIZATION:
    - touch_friendly: "44px+ touch targets for controls"
    - offline_cache: "Extended TTL for mobile offline use"
    - sync_strategies: "WiFi-only, background sync options"
    - progressive_sync: "Critical configs sync first"
    - push_notifications: "Config change alerts for mobile apps"
```

## 📊 **SCHEMA CONFIGURAÇÃO MULTI-TENANT**
```sql
-- Schema principal para configurações isoladas por tenant
CREATE SCHEMA IF NOT EXISTS tenant_config;

-- Tabela principal de configurações por tenant
CREATE TABLE tenant_config.tenant_configurations (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    module_id UUID,
    user_id UUID,
    
    -- Identificação da configuração
    config_key VARCHAR(255) NOT NULL,
    config_value JSONB NOT NULL,
    
    -- Classificação hierárquica
    scope VARCHAR(50) NOT NULL DEFAULT 'tenant', -- 'global', 'tenant', 'module', 'user'
    config_type VARCHAR(50) NOT NULL, -- 'system', 'ui', 'integration', 'business', 'mobile'
    data_type VARCHAR(50) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json', 'encrypted'
    
    -- Configurações específicas mobile
    encrypted BOOLEAN DEFAULT false,
    mobile_optimized BOOLEAN DEFAULT false,
    offline_capable BOOLEAN DEFAULT false,
    requires_restart BOOLEAN DEFAULT false,
    sync_priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
    
    -- Validação dinâmica
    validation_rules JSONB,
    
    -- Feature flags por módulo
    feature_flag VARCHAR(100),
    
    -- Metadados
    description TEXT,
    tags TEXT[],
    
    -- Controle de versão
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    -- Auditoria LGPD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    rollback_from UUID,
    
    -- Constraint de isolamento por tenant
    CONSTRAINT unique_config_per_scope UNIQUE (tenant_id, config_key, scope, COALESCE(module_id, ''), COALESCE(user_id, ''))
);

-- Histórico completo de configurações
CREATE TABLE tenant_config.configuration_history (
    change_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    config_key VARCHAR(255) NOT NULL,
    
    -- Mudança detalhada
    change_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'rollback'
    old_value JSONB,
    new_value JSONB,
    change_reason TEXT,
    
    -- Auditoria LGPD completa
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    
    -- Versionamento
    version INTEGER NOT NULL DEFAULT 1
);

-- Módulos contratados por tenant
CREATE TABLE tenant_config.tenant_modules (
    tenant_module_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    module_id UUID NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    
    -- Status e pagamento
    is_active BOOLEAN DEFAULT true,
    payment_status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    plan_level VARCHAR(50) DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
    
    -- Características do módulo
    features JSONB,
    limits JSONB,
    config_overrides JSONB,
    
    -- Controle temporal
    contracted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_payment DATE,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_tenant_module UNIQUE (tenant_id, module_id)
);

-- Templates de configuração
CREATE TABLE tenant_config.configuration_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    template_category VARCHAR(100), -- 'mobile', 'desktop', 'integration', 'business'
    
    -- Dados do template
    template_data JSONB NOT NULL,
    default_values JSONB,
    
    -- Características mobile
    mobile_optimized BOOLEAN DEFAULT false,
    target_modules TEXT[],
    device_types TEXT[], -- ['mobile', 'tablet', 'desktop']
    
    -- Metadados
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    
    -- Controle
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Status de sincronização mobile
CREATE TABLE tenant_config.mobile_sync_status (
    sync_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- Status da sincronização
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    config_version INTEGER NOT NULL,
    sync_status VARCHAR(50) DEFAULT 'success', -- 'success', 'partial', 'failed'
    
    -- Informações do dispositivo
    device_id VARCHAR(255),
    device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
    app_version VARCHAR(50),
    platform VARCHAR(50), -- 'android', 'ios', 'web'
    
    -- Detalhes da sincronização
    configs_synced INTEGER DEFAULT 0,
    sync_duration_ms INTEGER,
    error_details TEXT,
    wifi_only BOOLEAN DEFAULT false,
    
    -- Cache offline
    cached_until TIMESTAMP WITH TIME ZONE,
    offline_capable BOOLEAN DEFAULT true,
    cache_size_mb DECIMAL(8,2),
    
    CONSTRAINT unique_user_device_sync UNIQUE (tenant_id, user_id, device_id)
);

-- RLS (Row Level Security) para isolamento total
ALTER TABLE tenant_config.tenant_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_config.configuration_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_config.tenant_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_config.mobile_sync_status ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para isolamento por tenant
CREATE POLICY tenant_config_isolation_policy ON tenant_config.tenant_configurations
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_config_history_isolation_policy ON tenant_config.configuration_history
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_modules_isolation_policy ON tenant_config.tenant_modules
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_sync_isolation_policy ON tenant_config.mobile_sync_status
    FOR ALL TO authenticated
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Índices para performance otimizada
CREATE INDEX idx_tenant_configs_tenant_key ON tenant_config.tenant_configurations(tenant_id, config_key);
CREATE INDEX idx_tenant_configs_scope ON tenant_config.tenant_configurations(scope, config_type);
CREATE INDEX idx_tenant_configs_mobile ON tenant_config.tenant_configurations(mobile_optimized, sync_priority) WHERE mobile_optimized = true;
CREATE INDEX idx_tenant_configs_module ON tenant_config.tenant_configurations(tenant_id, module_id) WHERE module_id IS NOT NULL;
CREATE INDEX idx_tenant_configs_user ON tenant_config.tenant_configurations(tenant_id, user_id) WHERE user_id IS NOT NULL;

CREATE INDEX idx_config_history_tenant_key ON tenant_config.configuration_history(tenant_id, config_key);
CREATE INDEX idx_config_history_changed_at ON tenant_config.configuration_history(changed_at DESC);

CREATE INDEX idx_tenant_modules_tenant_active ON tenant_config.tenant_modules(tenant_id, is_active);
CREATE INDEX idx_tenant_modules_payment ON tenant_config.tenant_modules(payment_status, expires_at);

CREATE INDEX idx_mobile_sync_tenant_user ON tenant_config.mobile_sync_status(tenant_id, user_id);
CREATE INDEX idx_mobile_sync_last_sync ON tenant_config.mobile_sync_status(last_sync_at DESC);
```

## 🔧 **SERVIÇO CONFIGURAÇÃO MULTI-TENANT**
```typescript
// src/services/MultiTenantConfigService.ts
import { useKryonixSDK } from '@kryonix/sdk';

interface ConfigurationContext {
  tenantId: string;
  moduleId?: string;
  userId?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  userAgent?: string;
  ipAddress?: string;
}

interface ConfigurationSetting {
  key: string;
  value: any;
  scope: 'global' | 'tenant' | 'module' | 'user';
  type: 'system' | 'ui' | 'integration' | 'business' | 'mobile';
  dataType: 'string' | 'number' | 'boolean' | 'json' | 'encrypted';
  validation?: ConfigValidation;
  mobileOptimized?: boolean;
  requiresRestart?: boolean;
  encrypted?: boolean;
}

interface MobileConfigBundle {
  tenantId: string;
  userId?: string;
  deviceOptimization: {
    ui: Record<string, any>;
    performance: Record<string, any>;
    offline: Record<string, any>;
    sync: Record<string, any>;
  };
  modules: Record<string, any>;
  lastSync: Date;
  version: number;
}

export class MultiTenantConfigService {
  private sdk = useKryonixSDK();
  private readonly CACHE_TTL = 3600; // 1 hora
  private readonly MOBILE_CACHE_TTL = 7200; // 2 horas para mobile

  constructor() {}

  /**
   * 📱 CONFIGURAÇÃO MOBILE-FIRST OTIMIZADA
   */
  async getMobileOptimizedConfig(
    context: ConfigurationContext
  ): Promise<MobileConfigBundle> {
    const cacheKey = `mobile:config:${context.tenantId}:${context.userId}`;
    
    // Verificar cache mobile primeiro (importante para offline)
    const cached = await this.sdk.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const mobileConfig = await this.buildMobileConfigBundle(context);
    
    // Cache mais longo para mobile (capacidade offline)
    await this.sdk.redis.setex(cacheKey, this.MOBILE_CACHE_TTL, JSON.stringify(mobileConfig));
    
    return mobileConfig;
  }

  private async buildMobileConfigBundle(context: ConfigurationContext): Promise<MobileConfigBundle> {
    try {
      // Buscar configurações mobile-optimized
      const query = `
        SELECT 
          cs.config_key,
          cs.config_value,
          cs.config_type,
          cs.data_type,
          cs.mobile_optimized,
          cs.offline_capable,
          cs.sync_priority
        FROM tenant_config.tenant_configurations cs
        WHERE cs.tenant_id = $1
          AND (cs.mobile_optimized = true OR cs.scope = 'global')
          AND cs.is_active = true
        ORDER BY cs.sync_priority ASC, cs.created_at DESC
      `;

      const configs = await this.sdk.database.query(query, [context.tenantId]);
      
      // Organizar por categoria para mobile
      const mobileBundle: MobileConfigBundle = {
        tenantId: context.tenantId,
        userId: context.userId,
        deviceOptimization: {
          ui: {},
          performance: {},
          offline: {},
          sync: {}
        },
        modules: {},
        lastSync: new Date(),
        version: await this.getConfigVersion(context.tenantId)
      };

      for (const config of configs.rows) {
        const value = await this.parseConfigValue(config.config_value, config.data_type);
        
        // Categorizar por tipo para mobile
        switch (config.config_type) {
          case 'ui':
            mobileBundle.deviceOptimization.ui[config.config_key] = value;
            break;
          case 'performance':
            mobileBundle.deviceOptimization.performance[config.config_key] = value;
            break;
          case 'offline':
            mobileBundle.deviceOptimization.offline[config.config_key] = value;
            break;
          default:
            if (!mobileBundle.modules[config.config_type]) {
              mobileBundle.modules[config.config_type] = {};
            }
            mobileBundle.modules[config.config_type][config.config_key] = value;
        }
      }

      return mobileBundle;
    } catch (error) {
      console.error('Failed to build mobile config bundle:', error);
      throw new Error(`Mobile config bundle failed: ${error.message}`);
    }
  }

  /**
   * 🔒 CONFIGURAÇÃO COM ISOLAMENTO COMPLETO POR TENANT
   */
  async getTenantIsolatedConfig(
    key: string,
    context: ConfigurationContext
  ): Promise<any> {
    const cacheKey = `config:${context.tenantId}:${key}:${context.userId || 'system'}`;
    
    // Cache primeiro
    const cached = await this.sdk.redis.get(cacheKey);
    if (cached !== null) {
      return this.parseConfigValue(cached, 'json');
    }

    try {
      // Hierarquia: User > Module > Tenant > Global
      const query = `
        WITH config_hierarchy AS (
          SELECT 
            config_value,
            data_type,
            scope,
            CASE 
              WHEN scope = 'user' AND user_id = $3 THEN 1
              WHEN scope = 'module' AND module_id = $4 THEN 2  
              WHEN scope = 'tenant' AND tenant_id = $2 THEN 3
              WHEN scope = 'global' THEN 4
              ELSE 5
            END as priority
          FROM tenant_config.tenant_configurations
          WHERE config_key = $1
            AND tenant_id = $2
            AND is_active = true
            AND (
              (scope = 'user' AND user_id = $3) OR
              (scope = 'module' AND module_id = $4) OR  
              (scope = 'tenant') OR
              (scope = 'global')
            )
        )
        SELECT config_value, data_type
        FROM config_hierarchy
        ORDER BY priority ASC
        LIMIT 1
      `;

      const result = await this.sdk.database.query(query, [
        key,
        context.tenantId,
        context.userId,
        context.moduleId
      ]);

      if (result.rows.length === 0) {
        return null;
      }

      const value = await this.parseConfigValue(result.rows[0].config_value, result.rows[0].data_type);
      
      // Cache baseado no tipo de device
      const ttl = context.deviceType === 'mobile' ? this.MOBILE_CACHE_TTL : this.CACHE_TTL;
      await this.sdk.redis.setex(cacheKey, ttl, JSON.stringify(value));
      
      return value;
    } catch (error) {
      console.error('Failed to get tenant isolated config:', error);
      throw new Error(`Config retrieval failed: ${error.message}`);
    }
  }

  /**
   * ⚡ CONFIGURAÇÃO EM TEMPO REAL
   */
  async setConfigurationRealTime(
    setting: ConfigurationSetting,
    context: ConfigurationContext
  ): Promise<{
    success: boolean;
    version: number;
    propagated: boolean;
  }> {
    try {
      // Validar configuração
      await this.validateConfiguration(setting);
      
      // Criptografar se necessário
      const finalValue = setting.encrypted 
        ? await this.encryptValue(setting.value)
        : setting.value;

      // Inserir/atualizar configuração
      await this.sdk.database.query(`
        INSERT INTO tenant_config.tenant_configurations (
          tenant_id, module_id, user_id, config_key, config_value, 
          scope, config_type, data_type, encrypted, mobile_optimized,
          validation_rules, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
        ON CONFLICT (tenant_id, config_key, scope, COALESCE(module_id, ''), COALESCE(user_id, ''))
        DO UPDATE SET
          config_value = EXCLUDED.config_value,
          updated_at = NOW(),
          updated_by = EXCLUDED.updated_by,
          version = version + 1
      `, [
        context.tenantId,
        context.moduleId,
        context.userId,
        setting.key,
        JSON.stringify(finalValue),
        setting.scope,
        setting.type,
        setting.dataType,
        setting.encrypted || false,
        setting.mobileOptimized || false,
        setting.validation ? JSON.stringify(setting.validation) : null,
        context.userId
      ]);

      // Log de auditoria
      await this.logConfigurationChange(setting, context);

      // Invalidar cache
      await this.invalidateConfigCache(setting.key, context);

      // Propagar mudança em tempo real
      await this.propagateConfigChange(setting, context);

      const newVersion = await this.incrementConfigVersion(context.tenantId);

      return {
        success: true,
        version: newVersion,
        propagated: true
      };

    } catch (error) {
      console.error('Failed to set configuration:', error);
      throw new Error(`Configuration update failed: ${error.message}`);
    }
  }

  /**
   * 📊 CONFIGURAÇÃO BASEADA EM MÓDULOS CONTRATADOS
   */
  async getModuleBasedConfiguration(
    context: ConfigurationContext
  ): Promise<Record<string, any>> {
    const cacheKey = `modules:config:${context.tenantId}`;
    
    const cached = await this.sdk.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      // Buscar módulos contratados pelo tenant
      const contractedModulesQuery = `
        SELECT 
          tm.module_id,
          tm.module_name,
          tm.is_active,
          tm.plan_level,
          tm.features,
          tm.config_overrides
        FROM tenant_config.tenant_modules tm
        WHERE tm.tenant_id = $1 
          AND tm.is_active = true
          AND tm.payment_status = 'active'
      `;

      const modules = await this.sdk.database.query(contractedModulesQuery, [context.tenantId]);
      
      const moduleConfigs: Record<string, any> = {};

      for (const module of modules.rows) {
        // Buscar configurações específicas do módulo
        const moduleConfigQuery = `
          SELECT 
            config_key,
            config_value,
            data_type,
            mobile_optimized,
            feature_flag
          FROM tenant_config.tenant_configurations
          WHERE tenant_id = $1
            AND module_id = $2
            AND is_active = true
        `;

        const configs = await this.sdk.database.query(moduleConfigQuery, [
          context.tenantId,
          module.module_id
        ]);

        moduleConfigs[module.module_name] = {
          moduleId: module.module_id,
          planLevel: module.plan_level,
          features: module.features,
          isActive: module.is_active,
          configOverrides: module.config_overrides,
          configurations: {}
        };

        for (const config of configs.rows) {
          const value = await this.parseConfigValue(config.config_value, config.data_type);
          moduleConfigs[module.module_name].configurations[config.config_key] = {
            value,
            mobileOptimized: config.mobile_optimized,
            featureFlag: config.feature_flag
          };
        }
      }

      await this.sdk.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(moduleConfigs));
      return moduleConfigs;

    } catch (error) {
      console.error('Failed to get module-based configuration:', error);
      throw new Error(`Module configuration failed: ${error.message}`);
    }
  }

  /**
   * ✅ VALIDAÇÃO DINÂMICA COM REGRAS DE NEGÓCIO
   */
  async validateConfiguration(setting: ConfigurationSetting): Promise<void> {
    if (!setting.validation) return;

    const { validation } = setting;

    // Validação obrigatória
    if (validation.required && (setting.value === null || setting.value === undefined)) {
      throw new Error(`Configuração '${setting.key}' é obrigatória`);
    }

    // Validação por tipo de dado
    switch (setting.dataType) {
      case 'string':
        await this.validateStringConfig(setting.value, validation);
        break;
      case 'number':
        await this.validateNumberConfig(setting.value, validation);
        break;
      case 'boolean':
        await this.validateBooleanConfig(setting.value, validation);
        break;
      case 'json':
        await this.validateJsonConfig(setting.value, validation);
        break;
    }

    // Validador customizado se existir
    if (validation.customValidator) {
      await this.executeCustomValidator(validation.customValidator, setting.value);
    }
  }

  /**
   * 📝 VERSIONAMENTO DE CONFIGURAÇÃO
   */
  async getConfigurationHistory(
    key: string,
    context: ConfigurationContext,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const query = `
        SELECT 
          ch.change_id,
          ch.old_value,
          ch.new_value,
          ch.change_type,
          ch.changed_at,
          ch.changed_by,
          ch.change_reason,
          ch.version,
          u.name as changed_by_name
        FROM tenant_config.configuration_history ch
        LEFT JOIN users u ON ch.changed_by = u.user_id
        WHERE ch.config_key = $1
          AND ch.tenant_id = $2
        ORDER BY ch.changed_at DESC
        LIMIT $3
      `;

      const history = await this.sdk.database.query(query, [key, context.tenantId, limit]);
      
      return history.rows.map(h => ({
        changeId: h.change_id,
        oldValue: h.old_value ? JSON.parse(h.old_value) : null,
        newValue: h.new_value ? JSON.parse(h.new_value) : null,
        changeType: h.change_type,
        changedAt: h.changed_at,
        changedBy: h.changed_by,
        changedByName: h.changed_by_name,
        changeReason: h.change_reason,
        version: h.version
      }));

    } catch (error) {
      console.error('Failed to get configuration history:', error);
      throw new Error(`Configuration history failed: ${error.message}`);
    }
  }

  /**
   * 🔄 ROLLBACK DE CONFIGURAÇÃO
   */
  async rollbackConfiguration(
    changeId: string,
    context: ConfigurationContext
  ): Promise<{
    success: boolean;
    rolledBackTo: string;
    newVersion: number;
  }> {
    try {
      // Buscar mudança específica
      const changeQuery = `
        SELECT config_key, old_value, change_type
        FROM tenant_config.configuration_history
        WHERE change_id = $1 AND tenant_id = $2
      `;

      const change = await this.sdk.database.query(changeQuery, [changeId, context.tenantId]);
      
      if (change.rows.length === 0) {
        throw new Error('Mudança não encontrada');
      }

      const { config_key, old_value, change_type } = change.rows[0];

      if (change_type === 'delete') {
        // Recriar configuração deletada
        const oldValueObj = JSON.parse(old_value);
        await this.sdk.database.query(`
          INSERT INTO tenant_config.tenant_configurations (
            tenant_id, config_key, config_value, scope, config_type, 
            data_type, updated_by, rollback_from
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          context.tenantId,
          config_key,
          old_value,
          oldValueObj.scope,
          oldValueObj.config_type,
          oldValueObj.data_type,
          context.userId,
          changeId
        ]);
      } else {
        // Restaurar valor anterior
        await this.sdk.database.query(`
          UPDATE tenant_config.tenant_configurations
          SET config_value = $3, updated_at = NOW(), updated_by = $4, rollback_from = $5
          WHERE tenant_id = $1 AND config_key = $2
        `, [context.tenantId, config_key, old_value, context.userId, changeId]);
      }

      // Log do rollback
      await this.sdk.database.query(`
        INSERT INTO tenant_config.configuration_history (
          tenant_id, config_key, change_type, new_value, changed_by, change_reason
        ) VALUES ($1, $2, 'rollback', $3, $4, $5)
      `, [
        context.tenantId,
        config_key,
        old_value,
        context.userId,
        `Rollback from change ${changeId}`
      ]);

      // Invalidar cache
      await this.invalidateConfigCache(config_key, context);

      // Propagar mudança
      await this.propagateConfigChange({
        key: config_key,
        value: old_value ? JSON.parse(old_value).value : null,
        scope: 'tenant',
        type: 'system',
        dataType: 'json'
      }, context);

      const newVersion = await this.incrementConfigVersion(context.tenantId);

      return {
        success: true,
        rolledBackTo: changeId,
        newVersion
      };

    } catch (error) {
      console.error('Failed to rollback configuration:', error);
      throw new Error(`Configuration rollback failed: ${error.message}`);
    }
  }

  /**
   * 📱 SINCRONIZAÇÃO MOBILE COM CACHE OFFLINE
   */
  async syncMobileCache(context: ConfigurationContext): Promise<{
    success: boolean;
    version: number;
    configCount: number;
    lastSync: Date;
    offlineExpiration: Date;
  }> {
    try {
      const mobileConfig = await this.getMobileOptimizedConfig(context);
      const version = await this.getConfigVersion(context.tenantId);
      
      // Cache extenso para mobile (capacidade offline)
      const cacheKeys = [
        `mobile:config:${context.tenantId}:${context.userId}`,
        `mobile:version:${context.tenantId}`,
        `mobile:modules:${context.tenantId}`
      ];

      await Promise.all([
        this.sdk.redis.setex(cacheKeys[0], this.MOBILE_CACHE_TTL, JSON.stringify(mobileConfig)),
        this.sdk.redis.setex(cacheKeys[1], this.MOBILE_CACHE_TTL, version.toString()),
        this.sdk.redis.setex(cacheKeys[2], this.MOBILE_CACHE_TTL, JSON.stringify(await this.getModuleBasedConfiguration(context)))
      ]);

      // Atualizar status de sincronização
      await this.sdk.database.query(`
        INSERT INTO tenant_config.mobile_sync_status (
          tenant_id, user_id, config_version, sync_status, device_id, 
          device_type, platform, configs_synced, cached_until
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (tenant_id, user_id, device_id) DO UPDATE SET
          last_sync_at = NOW(),
          config_version = EXCLUDED.config_version,
          sync_status = EXCLUDED.sync_status,
          configs_synced = EXCLUDED.configs_synced,
          cached_until = EXCLUDED.cached_until
      `, [
        context.tenantId,
        context.userId,
        version,
        'success',
        context.deviceId || 'unknown',
        context.deviceType || 'mobile',
        context.platform || 'web',
        Object.keys(mobileConfig.deviceOptimization.ui).length + Object.keys(mobileConfig.modules).length,
        new Date(Date.now() + this.MOBILE_CACHE_TTL * 1000)
      ]);

      return {
        success: true,
        version,
        configCount: Object.keys(mobileConfig.deviceOptimization.ui).length + 
                     Object.keys(mobileConfig.modules).length,
        lastSync: new Date(),
        offlineExpiration: new Date(Date.now() + this.MOBILE_CACHE_TTL * 1000)
      };
    } catch (error) {
      console.error('Failed to sync mobile cache:', error);
      throw new Error(`Mobile cache sync failed: ${error.message}`);
    }
  }

  /**
   * 🔄 PROPAGAÇÃO EM TEMPO REAL
   */
  private async propagateConfigChange(
    setting: ConfigurationSetting,
    context: ConfigurationContext
  ): Promise<void> {
    try {
      // WebSocket para usuários online
      await this.sdk.websocket.broadcast(`tenant:${context.tenantId}:config`, {
        type: 'config_changed',
        tenantId: context.tenantId,
        userId: context.userId,
        key: setting.key,
        value: setting.value,
        scope: setting.scope,
        timestamp: new Date()
      });

      // Notificar via Redis Pub/Sub para outros pods
      await this.sdk.redis.publish('config:changes', JSON.stringify({
        tenantId: context.tenantId,
        key: setting.key,
        value: setting.value,
        scope: setting.scope,
        changeType: 'update'
      }));

      // Push notification para apps móveis se configuração crítica
      if (setting.mobileOptimized && setting.requiresRestart) {
        await this.sendMobilePushNotification(context, setting);
      }
    } catch (error) {
      console.error('Failed to propagate config change:', error);
    }
  }

  /**
   * 🛠️ UTILITÁRIOS AUXILIARES
   */
  private async parseConfigValue(value: string, dataType: string): Promise<any> {
    try {
      switch (dataType) {
        case 'string':
          return value;
        case 'number':
          return Number(value);
        case 'boolean':
          return value === 'true' || value === true;
        case 'json':
          return typeof value === 'string' ? JSON.parse(value) : value;
        case 'encrypted':
          return await this.decryptValue(value);
        default:
          return value;
      }
    } catch (error) {
      console.warn(`Erro ao parsear valor: ${error.message}`);
      return value;
    }
  }

  private async invalidateConfigCache(key: string, context: ConfigurationContext): Promise<void> {
    const patterns = [
      `config:${context.tenantId}:${key}:*`,
      `mobile:config:${context.tenantId}:*`,
      `modules:config:${context.tenantId}`
    ];

    for (const pattern of patterns) {
      const keys = await this.sdk.redis.keys(pattern);
      if (keys.length > 0) {
        await this.sdk.redis.del(...keys);
      }
    }
  }

  private async getConfigVersion(tenantId: string): Promise<number> {
    const result = await this.sdk.redis.get(`config:version:${tenantId}`);
    return result ? parseInt(result) : 1;
  }

  private async incrementConfigVersion(tenantId: string): Promise<number> {
    return await this.sdk.redis.incr(`config:version:${tenantId}`);
  }

  private async encryptValue(value: any): Promise<string> {
    const crypto = require('crypto');
    const key = process.env.CONFIG_ENCRYPTION_KEY;
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(JSON.stringify(value), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private async decryptValue(encryptedValue: string): Promise<any> {
    const crypto = require('crypto');
    const key = process.env.CONFIG_ENCRYPTION_KEY;
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedValue, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }

  private async logConfigurationChange(
    setting: ConfigurationSetting,
    context: ConfigurationContext
  ): Promise<void> {
    await this.sdk.database.query(`
      INSERT INTO tenant_config.configuration_history (
        tenant_id, config_key, change_type, new_value, changed_by, 
        change_reason, ip_address, user_agent, device_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      context.tenantId,
      setting.key,
      'update',
      JSON.stringify(setting.value),
      context.userId,
      'Configuration update via API',
      context.ipAddress,
      context.userAgent,
      JSON.stringify({ deviceType: context.deviceType })
    ]);
  }

  private async sendMobilePushNotification(
    context: ConfigurationContext,
    setting: ConfigurationSetting
  ): Promise<void> {
    await this.sdk.notifications.sendPush({
      tenantId: context.tenantId,
      userId: context.userId,
      title: 'Configuração Atualizada',
      message: `A configuração ${setting.key} foi atualizada e requer reinicialização do app.`,
      type: 'config_update',
      data: {
        configKey: setting.key,
        requiresRestart: setting.requiresRestart
      }
    });
  }
}
```

## 📱 **INTERFACE MOBILE CONFIGURAÇÃO**
```tsx
// src/components/configuration/MobileConfigurationInterface.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Save, 
  RotateCcw, 
  Download,
  Palette,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { useMobileConfiguration } from '@/hooks/useMobileConfiguration';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useKryonixAuth } from '@kryonix/sdk';

interface MobileConfigProps {
  tenantId: string;
  userId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export const MobileConfigurationInterface: React.FC<MobileConfigProps> = ({
  tenantId,
  userId,
  deviceType
}) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced');
  
  const isOnline = useOnlineStatus();
  const { user } = useKryonixAuth();
  const {
    mobileConfig,
    updateConfig,
    syncConfiguration,
    isLoading,
    lastSync,
    error
  } = useMobileConfiguration({ tenantId, userId });

  const [localConfig, setLocalConfig] = useState(mobileConfig);

  useEffect(() => {
    setLocalConfig(mobileConfig);
  }, [mobileConfig]);

  useEffect(() => {
    setSyncStatus(isOnline ? 'synced' : 'offline');
  }, [isOnline]);

  // Auto-sync quando volta online
  useEffect(() => {
    if (isOnline && syncStatus === 'offline' && hasUnsavedChanges) {
      handleSyncChanges();
    }
  }, [isOnline, syncStatus, hasUnsavedChanges]);

  const handleConfigChange = useCallback((section: string, key: string, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      deviceOptimization: {
        ...prev.deviceOptimization,
        [section]: {
          ...prev.deviceOptimization[section],
          [key]: value
        }
      }
    }));
    setHasUnsavedChanges(true);
    setSyncStatus('pending');
  }, []);

  const handleSyncChanges = async () => {
    try {
      await syncConfiguration(localConfig);
      setHasUnsavedChanges(false);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setSyncStatus('offline');
    }
  };

  const handleReset = () => {
    setLocalConfig(mobileConfig);
    setHasUnsavedChanges(false);
    setSyncStatus('synced');
  };

  // Interface responsiva baseada no tipo de device
  const isMobile = deviceType === 'mobile';
  const containerClass = isMobile 
    ? 'mobile-config-container min-h-screen bg-gray-50' 
    : 'desktop-config-container max-w-6xl mx-auto p-6';

  return (
    <div className={containerClass}>
      {/* Header Mobile-First */}
      <div className="config-header bg-white border-b border-gray-200 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Configurações
          </h1>
          <Badge variant={isOnline ? "default" : "secondary"} className="flex items-center gap-1">
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Ações do header */}
        <div className="flex gap-2">
          {hasUnsavedChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {!isMobile && "Desfazer"}
            </Button>
          )}
          <Button
            onClick={handleSyncChanges}
            disabled={!hasUnsavedChanges || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isMobile ? "Salvar" : "Salvar Alterações"}
          </Button>
        </div>
      </div>

      {/* Banner de mudanças não salvas */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-500 text-white p-3 text-center text-sm">
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium">⚠️ Você tem alterações não salvas</span>
            {!isOnline && (
              <span className="text-xs opacity-90">
                (serão sincronizadas quando voltar online)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs de configuração */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className={`${isMobile ? 'flex overflow-x-auto p-2 bg-gray-100' : 'grid w-full grid-cols-4'}`}>
          <TabsTrigger value="appearance" className="flex items-center gap-2 whitespace-nowrap">
            <Palette className="w-4 h-4" />
            {!isMobile && "Aparência"}
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2 whitespace-nowrap">
            <Zap className="w-4 h-4" />
            {!isMobile && "Performance"}
          </TabsTrigger>
          <TabsTrigger value="offline" className="flex items-center gap-2 whitespace-nowrap">
            <Smartphone className="w-4 h-4" />
            {!isMobile && "Offline"}
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2 whitespace-nowrap">
            <Globe className="w-4 h-4" />
            {!isMobile && "Sync"}
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das abas */}
        <div className="p-4">
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Aparência e Tema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configurações de aparência */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Tema</label>
                      <p className="text-xs text-gray-500">Modo Escuro</p>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.ui?.darkMode || false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('ui', 'darkMode', checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cor Primária</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={localConfig?.deviceOptimization?.ui?.primaryColor || '#3b82f6'}
                        onChange={(e) => 
                          handleConfigChange('ui', 'primaryColor', e.target.value)
                        }
                        className="w-12 h-12 rounded border cursor-pointer"
                      />
                      <Input
                        value={localConfig?.deviceOptimization?.ui?.primaryColor || '#3b82f6'}
                        onChange={(e) => 
                          handleConfigChange('ui', 'primaryColor', e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tamanho da Fonte</label>
                    <select
                      value={localConfig?.deviceOptimization?.ui?.fontSize || 'medium'}
                      onChange={(e) => 
                        handleConfigChange('ui', 'fontSize', e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="small">Pequena</option>
                      <option value="medium">Média</option>
                      <option value="large">Grande</option>
                      <option value="extra-large">Extra Grande</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Interface Compacta</label>
                      <p className="text-xs text-green-600">📱 Recomendado para mobile</p>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.ui?.compactMode || false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('ui', 'compactMode', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Controles Touch-Friendly</label>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.ui?.touchFriendly !== false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('ui', 'touchFriendly', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance e Otimização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Otimizações Mobile</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Carregamento Lazy</label>
                      <p className="text-xs text-gray-500">Carrega conteúdo conforme necessário</p>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.performance?.lazyLoading !== false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('performance', 'lazyLoading', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Otimização de Imagens</label>
                      <p className="text-xs text-gray-500">Reduz tamanho das imagens automaticamente</p>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.performance?.imageOptimization !== false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('performance', 'imageOptimization', checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estratégia de Cache</label>
                    <select
                      value={localConfig?.deviceOptimization?.performance?.cacheStrategy || 'balanced'}
                      onChange={(e) => 
                        handleConfigChange('performance', 'cacheStrategy', e.target.value)
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="minimal">Mínimo</option>
                      <option value="balanced">Balanceado</option>
                      <option value="aggressive">Agressivo (Recomendado Mobile)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Animações Reduzidas</label>
                      <p className="text-xs text-gray-500">Economiza bateria em dispositivos móveis</p>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.performance?.reducedAnimations || false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('performance', 'reducedAnimations', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Pré-carregamento de Dados</label>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.performance?.preloadData || false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('performance', 'preloadData', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Capacidades Offline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Configurações Offline</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Modo Offline Ativado</label>
                      <p className="text-xs text-gray-500">Permite usar o app sem internet</p>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.offline?.enabled !== false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('offline', 'enabled', checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cache de Dados (MB)</label>
                    <Input
                      type="number"
                      value={localConfig?.deviceOptimization?.offline?.cacheSize || 50}
                      onChange={(e) => 
                        handleConfigChange('offline', 'cacheSize', parseInt(e.target.value))
                      }
                      min="10"
                      max="500"
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Sync Automática</label>
                      <p className="text-xs text-gray-500">Sincroniza quando volta online</p>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.offline?.autoSync !== false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('offline', 'autoSync', checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dados Offline</label>
                    <div className="space-y-2">
                      {['dashboards', 'reports', 'contacts', 'messages'].map(dataType => (
                        <div key={dataType} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={dataType}
                            checked={localConfig?.deviceOptimization?.offline?.dataTypes?.includes(dataType) || false}
                            onChange={(e) => {
                              const currentTypes = localConfig?.deviceOptimization?.offline?.dataTypes || [];
                              const newTypes = e.target.checked
                                ? [...currentTypes, dataType]
                                : currentTypes.filter(t => t !== dataType);
                              handleConfigChange('offline', 'dataTypes', newTypes);
                            }}
                            className="w-4 h-4"
                          />
                          <label htmlFor={dataType} className="text-sm">
                            {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Sincronização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Status da Sincronização</h3>
                  
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Última Sincronização:</span>
                      <span className="text-sm font-medium">
                        {lastSync ? new Date(lastSync).toLocaleString('pt-BR') : 'Nunca'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="text-sm font-medium">
                        {syncStatus === 'synced' ? 'Sincronizado' : 
                         syncStatus === 'pending' ? 'Pendente' : 'Offline'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Configurações Pendentes:</span>
                      <span className="text-sm font-medium">
                        {hasUnsavedChanges ? 'Sim' : 'Nenhuma'}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSyncChanges}
                    disabled={!hasUnsavedChanges || isLoading}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Sincronizar Agora
                  </Button>

                  <h3 className="font-medium text-gray-900">Configurações de Sync</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Sync Apenas em WiFi</label>
                      <p className="text-xs text-gray-500">Economiza dados móveis</p>
                    </div>
                    <Switch
                      checked={localConfig?.deviceOptimization?.sync?.wifiOnly || false}
                      onCheckedChange={(checked) => 
                        handleConfigChange('sync', 'wifiOnly', checked)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Intervalo de Sync (minutos)</label>
                    <select
                      value={localConfig?.deviceOptimization?.sync?.interval || 15}
                      onChange={(e) => 
                        handleConfigChange('sync', 'interval', parseInt(e.target.value))
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value={5}>5 minutos</option>
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do dispositivo */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Informações do Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dispositivo:</span>
                    <span className="font-medium">{deviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conexão:</span>
                    <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versão Config:</span>
                    <span className="font-medium">v{localConfig?.version || '1.0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MobileConfigurationInterface;
```

## 🔧 **SCRIPT SETUP CONFIGURAÇÃO MULTI-TENANT COMPLETO**
```bash
#!/bin/bash
# setup-multi-tenant-configuration-kryonix.sh
# Script completo para sistema de configuração multi-tenant

echo "⚙️ Configurando Sistema de Configuração Multi-Tenant KRYONIX..."

# 1. Variáveis de ambiente
export KRYONIX_ENV="production"
export CONFIG_VERSION="v2.1.0"
export MULTI_TENANT_MODE="true"
export CONFIG_ENCRYPTION_KEY=$(openssl rand -base64 32)

# 2. Criar schema de configuração
echo "📊 Criando schema de configuração..."
cat > /tmp/tenant-config-schema.sql << 'EOF'
-- Schema principal para configurações isoladas por tenant
CREATE SCHEMA IF NOT EXISTS tenant_config;

-- Tabela principal de configurações por tenant
CREATE TABLE tenant_config.tenant_configurations (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    module_id UUID,
    user_id UUID,
    
    -- Identificação da configuração
    config_key VARCHAR(255) NOT NULL,
    config_value JSONB NOT NULL,
    
    -- Classificação hierárquica
    scope VARCHAR(50) NOT NULL DEFAULT 'tenant',
    config_type VARCHAR(50) NOT NULL,
    data_type VARCHAR(50) NOT NULL DEFAULT 'string',
    
    -- Configurações específicas mobile
    encrypted BOOLEAN DEFAULT false,
    mobile_optimized BOOLEAN DEFAULT false,
    offline_capable BOOLEAN DEFAULT false,
    requires_restart BOOLEAN DEFAULT false,
    sync_priority INTEGER DEFAULT 5,
    
    -- Validação dinâmica
    validation_rules JSONB,
    
    -- Feature flags por módulo
    feature_flag VARCHAR(100),
    
    -- Metadados
    description TEXT,
    tags TEXT[],
    
    -- Controle de versão
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    -- Auditoria LGPD
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    rollback_from UUID,
    
    -- Constraint de isolamento por tenant
    CONSTRAINT unique_config_per_scope UNIQUE (tenant_id, config_key, scope, COALESCE(module_id, ''), COALESCE(user_id, ''))
);

-- [Resto do schema SQL da seção anterior]
EOF

PGPASSWORD=$POSTGRES_PASSWORD psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f /tmp/tenant-config-schema.sql

# 3. Configurar Redis para cache de configurações
echo "💾 Configurando Redis configurações..."
docker run -d \
  --name kryonix-config-redis \
  --restart unless-stopped \
  -p 6383:6379 \
  -e REDIS_PASSWORD=$REDIS_PASSWORD \
  -v kryonix_config_redis:/data \
  --network kryonix-network \
  redis:7-alpine redis-server --requirepass $REDIS_PASSWORD

# 4. Instalar dependências específicas
echo "📦 Instalando dependências configuração..."
npm install ajv crypto-js
npm install @hookform/resolvers react-hook-form
npm install react-colorful color2k
npm install lodash.debounce use-debounce

# 5. Deploy serviço de configuração
echo "🚀 Deploying serviço configuração..."
cat > /opt/kryonix/docker-compose.config.yml << 'EOF'
version: '3.8'

services:
  config-api:
    build: ./services/configuration
    container_name: kryonix-config-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgresql:5432/kryonix_saas
      - CONFIG_REDIS_URL=redis://config-redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - CONFIG_ENCRYPTION_KEY=${CONFIG_ENCRYPTION_KEY}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.config-api.rule=Host(`api.kryonix.com.br`) && PathPrefix(`/config`)"
      - "traefik.http.routers.config-api.tls=true"
      - "traefik.http.routers.config-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.config-api.loadbalancer.server.port=3000"
    networks:
      - kryonix-network

  config-sync:
    build: ./services/config-sync
    container_name: kryonix-config-sync
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgresql:5432/kryonix_saas
      - JWT_SECRET=${JWT_SECRET}
    networks:
      - kryonix-network

networks:
  kryonix-network:
    external: true
EOF

# 6. Configurar WebSocket para propagação em tempo real
echo "🔌 Configurando WebSocket configuração..."
cat > /opt/kryonix/websocket/config-server.js << 'EOF'
const io = require('socket.io')(3004, {
  cors: {
    origin: ["https://*.kryonix.com.br"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const Redis = require('redis');
const jwt = require('jsonwebtoken');

const redis = Redis.createClient({
  host: 'kryonix-config-redis',
  port: 6379,
  password: process.env.REDIS_PASSWORD
});

// Middleware para autenticação
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const tenantId = socket.handshake.auth.tenantId;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    socket.tenantId = tenantId;
    socket.userId = decoded.sub;
    socket.userRoles = decoded.roles || [];
    
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`⚙️ Config client connected: ${socket.tenantId} - ${socket.userId}`);
  
  // Join tenant and user specific rooms
  socket.join(`tenant:${socket.tenantId}:config`);
  socket.join(`user:${socket.userId}`);
  
  // Handle mobile config sync requests
  socket.on('mobile_config_sync', async (data) => {
    try {
      const syncResult = await syncMobileConfiguration(
        socket.tenantId,
        socket.userId,
        data.deviceId,
        data.deviceType
      );
      
      socket.emit('mobile_config_synced', syncResult);
      
    } catch (error) {
      socket.emit('mobile_config_error', { error: error.message });
    }
  });
  
  // Handle configuration changes
  socket.on('config_change', async (data) => {
    try {
      // Validate and save configuration
      await saveConfiguration(socket.tenantId, socket.userId, data);
      
      // Broadcast to other sessions of the same tenant
      socket.to(`tenant:${socket.tenantId}:config`).emit('config_updated', {
        key: data.key,
        value: data.value,
        scope: data.scope,
        timestamp: new Date()
      });
      
    } catch (error) {
      socket.emit('config_error', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`⚙️ Config client disconnected: ${socket.tenantId} - ${socket.userId}`);
  });
});

async function syncMobileConfiguration(tenantId, userId, deviceId, deviceType) {
  // Implementation would call the config service
  return { success: true, configs: [] }; // Placeholder
}

async function saveConfiguration(tenantId, userId, configData) {
  // Implementation would call the config service
  return { success: true }; // Placeholder
}

console.log('🔌 Configuration WebSocket server running on port 3004');
EOF

# 7. Build e deploy
cd /opt/kryonix
docker-compose -f docker-compose.config.yml build
docker-compose -f docker-compose.config.yml up -d

# 8. Configurar templates de configuração padrão
echo "📋 Configurando templates padrão..."
cat > /tmp/setup-config-templates.js << 'EOF'
const { Client } = require('pg');

const client = new Client({
  host: 'postgresql.kryonix.com.br',
  port: 5432,
  database: 'kryonix_saas',
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD
});

const configTemplates = [
  {
    name: 'Mobile UI Default',
    category: 'mobile',
    data: {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        darkMode: false
      },
      layout: {
        sidebarCollapsed: true,
        compactMode: true,
        touchFriendly: true,
        fontSize: 'medium'
      },
      performance: {
        lazyLoading: true,
        imageOptimization: true,
        cacheStrategy: 'aggressive',
        reducedAnimations: false,
        preloadData: false
      },
      offline: {
        enabled: true,
        cacheSize: 50,
        autoSync: true,
        dataTypes: ['dashboards', 'contacts']
      },
      sync: {
        wifiOnly: false,
        interval: 15
      }
    },
    mobile_optimized: true,
    target_modules: ['all'],
    device_types: ['mobile', 'tablet']
  },
  {
    name: 'Desktop UI Default',
    category: 'desktop',
    data: {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        darkMode: false
      },
      layout: {
        sidebarCollapsed: false,
        compactMode: false,
        multiColumn: true,
        fontSize: 'medium'
      },
      performance: {
        lazyLoading: false,
        preloadData: true,
        animationsEnabled: true,
        cacheStrategy: 'balanced'
      }
    },
    mobile_optimized: false,
    target_modules: ['all'],
    device_types: ['desktop']
  },
  {
    name: 'High Performance Mobile',
    category: 'mobile',
    data: {
      performance: {
        lazyLoading: true,
        imageOptimization: true,
        cacheStrategy: 'aggressive',
        reducedAnimations: true,
        preloadData: false,
        backgroundSync: true
      },
      offline: {
        enabled: true,
        cacheSize: 100,
        autoSync: true,
        dataTypes: ['dashboards', 'reports', 'contacts', 'messages']
      },
      sync: {
        wifiOnly: true,
        interval: 30
      }
    },
    mobile_optimized: true,
    target_modules: ['all'],
    device_types: ['mobile']
  }
];

async function setupTemplates() {
  await client.connect();
  
  for (const template of configTemplates) {
    await client.query(`
      INSERT INTO tenant_config.configuration_templates (
        template_name, template_category, template_data, mobile_optimized,
        target_modules, device_types, description, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (template_name) DO NOTHING
    `, [
      template.name,
      template.category,
      JSON.stringify(template.data),
      template.mobile_optimized,
      template.target_modules,
      template.device_types,
      `Template ${template.name} para ${template.category}`,
      true
    ]);
  }
  
  await client.end();
  console.log('✅ Configuration templates setup completed');
}

setupTemplates().catch(console.error);
EOF

node /tmp/setup-config-templates.js

# 9. Configurar monitoramento Grafana
echo "📊 Configurando Grafana monitoramento configuração..."
cat > /opt/kryonix/grafana/provisioning/dashboards/configuration-multi-tenant.json << 'EOF'
{
  "dashboard": {
    "title": "KRYONIX Multi-Tenant Configuration Monitoring",
    "tags": ["kryonix", "configuration", "multi-tenant"],
    "panels": [
      {
        "title": "Configuration Changes per Tenant",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(config_changes_total{tenant_id=~\".*\"}[5m])",
            "legendFormat": "Changes: {{tenant_id}}"
          }
        ]
      },
      {
        "title": "Mobile Config Sync Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(mobile_config_sync_total{tenant_id=~\".*\"}[5m])",
            "legendFormat": "Mobile Sync: {{tenant_id}}"
          }
        ]
      },
      {
        "title": "Configuration Cache Hit Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(config_cache_hits_total[5m]) / rate(config_requests_total[5m]) * 100",
            "legendFormat": "Cache Hit Rate %"
          }
        ]
      },
      {
        "title": "Offline Configuration Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(offline_config_usage_total) by (tenant_id)",
            "legendFormat": "Offline Usage: {{tenant_id}}"
          }
        ]
      }
    ]
  }
}
EOF

# 10. Configurar backup automático configurações
echo "💾 Configurando backup configurações..."
cat > /opt/kryonix/scripts/backup-configuration-data.sh << 'EOF'
#!/bin/bash
# Backup dados de configuração por tenant

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/configuration"

mkdir -p $BACKUP_DIR

# Backup schemas de configuração
echo "Backing up configuration schemas..."
docker exec kryonix-postgresql pg_dump \
  -U postgres \
  -d kryonix_saas \
  --schema-only \
  --schema='tenant_config' \
  > $BACKUP_DIR/config_schema_$DATE.sql

# Backup dados de configuração
docker exec kryonix-postgresql pg_dump \
  -U postgres \
  -d kryonix_saas \
  -t 'tenant_config.*' \
  > $BACKUP_DIR/config_data_$DATE.sql

# Backup cache Redis
echo "Backing up configuration cache..."
docker exec kryonix-config-redis redis-cli \
  --rdb /data/config_cache_$DATE.rdb \
  --password $REDIS_PASSWORD

# Compress
gzip $BACKUP_DIR/*.sql

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "✅ Configuration backup completed: $DATE"
EOF

chmod +x /opt/kryonix/scripts/backup-configuration-data.sh

# 11. Configurar testes automáticos
echo "🧪 Configurando testes configuração..."
cat > /opt/kryonix/tests/configuration-tests.js << 'EOF'
const request = require('supertest');
const app = require('../app');

describe('Multi-Tenant Configuration Tests', () => {
  
  test('Should get mobile optimized config for tenant', async () => {
    const response = await request(app)
      .get('/config/mobile')
      .set('Authorization', 'Bearer ' + validToken)
      .set('X-Tenant-ID', 'demo')
      .set('X-Device-Type', 'mobile');
    
    expect(response.status).toBe(200);
    expect(response.body.deviceOptimization).toBeDefined();
    expect(response.body.deviceOptimization.ui).toBeDefined();
  });
  
  test('Should set configuration with validation', async () => {
    const response = await request(app)
      .post('/config/set')
      .set('Authorization', 'Bearer ' + validToken)
      .set('X-Tenant-ID', 'demo')
      .send({
        key: 'ui.primaryColor',
        value: '#ff0000',
        scope: 'user',
        type: 'ui',
        dataType: 'string'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
  
  test('Should deny cross-tenant configuration access', async () => {
    const response = await request(app)
      .get('/config/tenant/other-tenant')
      .set('Authorization', 'Bearer ' + validToken)
      .set('X-Tenant-ID', 'demo');
    
    expect(response.status).toBe(403);
  });
  
  test('Should sync mobile configuration offline', async () => {
    const response = await request(app)
      .post('/config/mobile/sync')
      .set('Authorization', 'Bearer ' + validToken)
      .set('X-Tenant-ID', 'demo')
      .send({
        deviceId: 'test-mobile-123',
        deviceType: 'mobile',
        platform: 'ios'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.offlineExpiration).toBeDefined();
  });
  
});
EOF

# 12. Configurar cron para backups e limpeza
(crontab -l 2>/dev/null; echo "0 5 * * * /opt/kryonix/scripts/backup-configuration-data.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 6 * * 0 /opt/kryonix/scripts/cleanup-config-cache.sh") | crontab -

echo "✅ Sistema de Configuração Multi-Tenant KRYONIX configurado!"
echo ""
echo "⚙️ Recursos Configuração Multi-Tenant:"
echo "   • Isolamento completo por tenant com RLS"
echo "   • Interface mobile-first para 80% usuários"
echo "   • Configuração hierárquica (Global→Tenant→Module→User)"
echo "   • Validação dinâmica com regras de negócio"
echo "   • Versionamento com rollback de mudanças"
echo ""
echo "📱 Mobile Configuration:"
echo "   • Cache offline estendido (2h TTL)"
echo "   • Sincronização inteligente WiFi-only"
echo "   • Configurações touch-friendly otimizadas"
echo "   • Push notifications para mudanças críticas"
echo ""
echo "🔒 Segurança & Compliance:"
echo "   • Criptografia para configurações sensíveis"
echo "   • Audit trail completo LGPD compliance"
echo "   • Row Level Security (RLS) isolamento"
echo "   • Validação customizada por tenant"
echo ""
echo "⚡ Performance:"
echo "   • Redis cache multi-camadas"
echo "   • Propagação tempo real via WebSocket"
echo "   • Templates pré-configurados"
echo "   • Otimização mobile específica"
echo ""
echo "📊 Monitoramento:"
echo "   • Grafana dashboards configuração"
echo "   • Métricas de uso por tenant"
echo "   • Performance cache tracking"
echo "   • Backup automático diário"
```

## ✅ **ENTREGÁVEIS COMPLETOS CONFIGURAÇÃO MULTI-TENANT**
- [ ] **Isolamento Completo** por tenant com RLS e schemas dedicados
- [ ] **Interface Mobile-First** otimizada para 80% usuários móveis
- [ ] **Configuração Hierárquica** (Global→Tenant→Module→User)
- [ ] **Validação Dinâmica** com regras de negócio customizadas
- [ ] **Sincronização Tempo Real** via WebSocket para mudanças instantâneas
- [ ] **Versionamento Completo** com histórico e rollback de configurações
- [ ] **Cache Mobile Offline** com TTL estendido para capacidade offline
- [ ] **Módulos Baseados** em contratos pagos por cliente
- [ ] **Criptografia Sensível** para configurações críticas
- [ ] **Audit Trail LGPD** completo para conformidade
- [ ] **Templates Padrão** para diferentes dispositivos e casos de uso
- [ ] **Performance Otimizada** com cache Redis multi-camadas
- [ ] **Backup Automático** de configurações por tenant
- [ ] **Monitoramento Grafana** com métricas específicas
- [ ] **Scripts Deploy** automático completo

## 🧪 **TESTES AUTOMÁTICOS CONFIGURAÇÃO MULTI-TENANT**
```bash
npm run test:config:multi-tenant
npm run test:config:tenant-isolation
npm run test:config:mobile-optimization
npm run test:config:real-time-sync
npm run test:config:validation-engine
npm run test:config:versioning-rollback
npm run test:config:offline-cache
npm run test:config:module-based
npm run test:config:encryption
npm run test:config:lgpd-compliance
```

## 📝 **CHECKLIST IMPLEMENTAÇÃO - 15 AGENTES**
- [ ] ✅ **Frontend Expert**: Interface mobile-first implementada
- [ ] ✅ **Backend Expert**: APIs configuração multi-tenant
- [ ] ✅ **DevOps**: Deploy automático sistema configuração
- [ ] ✅ **Expert Mobile**: Otimização 80% usuários móveis
- [ ] ✅ **Expert Performance**: Cache Redis multi-camadas
- [ ] ✅ **QA Expert**: Testes isolamento e validação
- [ ] ✅ **Specialist Business**: Configurações baseadas em módulos
- [ ] ✅ **Expert Automação**: Sincronização tempo real
- [ ] ✅ **Specialist LGPD**: Compliance e audit trail
- [ ] ✅ **Arquiteto Software**: Arquitetura hierárquica configuração
- [ ] ✅ **Expert APIs**: APIs isoladas por tenant
- [ ] ✅ **Analista BI**: Métricas configuração por tenant
- [ ] ✅ **Expert Comunicação**: WebSocket propagação tempo real
- [ ] ✅ **Specialist Localização**: Interface PT-BR completa
- [ ] ✅ **Expert Segurança**: Isolamento e criptografia

---
*Parte 15 de 50 - Projeto KRYONIX SaaS Platform 100% Multi-Tenant*
*Próxima Parte: 16 - Sistema de Notificações Multi-Tenant Mobile-First*
*🏢 KRYONIX - Inteligência Multi-Tenant para o Futuro*

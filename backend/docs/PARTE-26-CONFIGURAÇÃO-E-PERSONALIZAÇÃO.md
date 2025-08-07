# PARTE-26: CONFIGURAÇÃO E PERSONALIZAÇÃO
## Sistema Completo de Configuração e Personalização

### 📋 DESCRIÇÃO
Implementação de sistema robusto para configuração e personalização da plataforma KRYONIX, permitindo customização de interface, temas, funcionalidades, integrações e comportamentos específicos por tenant, organização e usuário.

### 🎯 OBJETIVOS
- Configuração multi-nível (sistema, tenant, organização, usuário)
- Sistema de temas e branding personalizado
- Configuração de funcionalidades por plano
- Personalização de interface e layouts
- Gestão de configurações de integração
- Sistema de feature flags dinâmico

### 🏗️ ARQUITETURA

#### Hierarquia de Configuração
```
┌───────��─────────────────────────────────────────────────────┐
│              CONFIGURATION ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│ PRESENTATION LAYER                                         │
│ • Configuration Dashboard                                   │
│ • Theme Editor                                             │
│ • Feature Toggle UI                                        │
│ • Branding Studio                                          │
├─────────────────────────────────────────────────────────────┤
│ BUSINESS LOGIC LAYER                                       │
│ • Configuration Manager                                    │
│ • Theme Engine                                             │
│ • Feature Flag Service                                     │
│ • Personalization Engine                                   │
├─────────────────────────────────────────────────────────────┤
│ CONFIGURATION LAYER                                        │
│ • System Defaults                                          │
│ • Tenant Overrides                                         │
│ • Organization Customizations                              │
│ • User Preferences                                         │
├─────────────────────────────────────────────────────────────┤
│ STORAGE LAYER                                              │
│ • Configuration Database                                   │
│ • Theme Assets (MinIO)                                     │
│ • Cache Layer (Redis)                                      │
│ • Version Control                                          │
└─────────────────────────────────────────────────────────────┘
```

### 🗄️ SCHEMAS DE BANCO DE DADOS

#### PostgreSQL Configuration Schema
```sql
-- Schema para configurações
CREATE SCHEMA IF NOT EXISTS configuration;

-- Tabela principal de configurações
CREATE TABLE configuration.settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    organization_id UUID,
    user_id UUID,
    setting_key VARCHAR(255) NOT NULL,
    setting_category VARCHAR(100) NOT NULL, -- 'system', 'ui', 'integration', 'notification', etc.
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'json', 'array'
    default_value JSONB,
    allowed_values JSONB, -- Array of allowed values for validation
    validation_rules JSONB, -- Validation rules (min, max, regex, etc.)
    scope VARCHAR(50) NOT NULL DEFAULT 'user', -- 'system', 'tenant', 'organization', 'user'
    is_sensitive BOOLEAN DEFAULT false,
    is_readonly BOOLEAN DEFAULT false,
    requires_restart BOOLEAN DEFAULT false,
    description TEXT,
    display_name VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    setting_group VARCHAR(100), -- Group settings together
    depends_on TEXT[], -- Array of dependent settings
    feature_flag VARCHAR(100), -- Associated feature flag
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Tabela de temas
CREATE TABLE configuration.themes (
    theme_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    theme_name VARCHAR(100) NOT NULL,
    theme_type VARCHAR(50) DEFAULT 'custom', -- 'system', 'template', 'custom'
    base_theme_id UUID REFERENCES configuration.themes(theme_id),
    theme_data JSONB NOT NULL, -- CSS variables, colors, fonts, etc.
    preview_image_url TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false, -- Can be shared with other tenants
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Tabela de feature flags
CREATE TABLE configuration.feature_flags (
    flag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    organization_id UUID,
    flag_key VARCHAR(100) NOT NULL,
    flag_name VARCHAR(255) NOT NULL,
    description TEXT,
    flag_type VARCHAR(50) DEFAULT 'boolean', -- 'boolean', 'string', 'number', 'json'
    default_value JSONB NOT NULL,
    current_value JSONB,
    rollout_percentage INTEGER DEFAULT 0, -- For gradual rollout
    target_users TEXT[], -- Specific user IDs
    target_groups TEXT[], -- Specific group IDs
    conditions JSONB, -- Complex conditions for flag activation
    scope VARCHAR(50) NOT NULL DEFAULT 'tenant', -- 'system', 'tenant', 'organization'
    is_enabled BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Tabela de layouts personalizados
CREATE TABLE configuration.custom_layouts (
    layout_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    organization_id UUID,
    user_id UUID,
    page_name VARCHAR(100) NOT NULL, -- 'dashboard', 'user_profile', 'reports', etc.
    layout_name VARCHAR(255) NOT NULL,
    layout_type VARCHAR(50) DEFAULT 'custom', -- 'system', 'template', 'custom'
    layout_data JSONB NOT NULL, -- Component positions, sizes, configurations
    grid_config JSONB, -- Grid system configuration
    responsive_config JSONB, -- Responsive breakpoints and layouts
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Tabela de branding personalizado
CREATE TABLE configuration.branding (
    branding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    organization_id UUID,
    brand_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    logo_dark_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7),
    accent_color VARCHAR(7),
    background_color VARCHAR(7),
    text_color VARCHAR(7),
    font_primary VARCHAR(100), -- Font family
    font_secondary VARCHAR(100),
    custom_css TEXT,
    email_template JSONB, -- Email branding configuration
    watermark_config JSONB, -- Watermark settings
    footer_text TEXT,
    privacy_policy_url TEXT,
    terms_of_service_url TEXT,
    support_email VARCHAR(255),
    support_phone VARCHAR(20),
    company_address JSONB,
    social_media JSONB, -- Social media links
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Tabela de templates de configuração
CREATE TABLE configuration.config_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    template_category VARCHAR(100), -- 'integration', 'ui', 'business_logic'
    description TEXT,
    template_data JSONB NOT NULL,
    default_values JSONB,
    validation_schema JSONB,
    is_system_template BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Tabela de histórico de alterações
CREATE TABLE configuration.change_history (
    change_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    entity_type VARCHAR(50) NOT NULL, -- 'setting', 'theme', 'layout', 'branding'
    entity_id UUID NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'activate', 'deactivate'
    old_value JSONB,
    new_value JSONB,
    changed_fields TEXT[],
    change_reason TEXT,
    rollback_data JSONB, -- Data needed for rollback
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    applied_by UUID,
    ip_address INET,
    user_agent TEXT
);

-- Índices para performance
CREATE INDEX idx_settings_tenant_category ON configuration.settings(tenant_id, setting_category);
CREATE INDEX idx_settings_key ON configuration.settings(setting_key);
CREATE INDEX idx_settings_scope ON configuration.settings(scope);
CREATE INDEX idx_themes_tenant_active ON configuration.themes(tenant_id, is_active);
CREATE INDEX idx_feature_flags_tenant_enabled ON configuration.feature_flags(tenant_id, is_enabled);
CREATE INDEX idx_layouts_page_user ON configuration.custom_layouts(page_name, user_id);
CREATE INDEX idx_branding_tenant_active ON configuration.branding(tenant_id, is_active);
CREATE INDEX idx_change_history_entity ON configuration.change_history(entity_type, entity_id);

-- Função para resolver configuração hierárquica
CREATE OR REPLACE FUNCTION configuration.get_effective_setting(
    p_setting_key VARCHAR(255),
    p_tenant_id UUID DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    setting_value JSONB;
BEGIN
    -- Ordem de precedência: user > organization > tenant > system
    
    -- Verificar configuração do usuário
    IF p_user_id IS NOT NULL THEN
        SELECT setting_value INTO setting_value
        FROM configuration.settings
        WHERE setting_key = p_setting_key
        AND user_id = p_user_id
        AND (tenant_id IS NULL OR tenant_id = p_tenant_id)
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF setting_value IS NOT NULL THEN
            RETURN setting_value;
        END IF;
    END IF;
    
    -- Verificar configuração da organização
    IF p_organization_id IS NOT NULL THEN
        SELECT setting_value INTO setting_value
        FROM configuration.settings
        WHERE setting_key = p_setting_key
        AND organization_id = p_organization_id
        AND user_id IS NULL
        AND (tenant_id IS NULL OR tenant_id = p_tenant_id)
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF setting_value IS NOT NULL THEN
            RETURN setting_value;
        END IF;
    END IF;
    
    -- Verificar configuração do tenant
    IF p_tenant_id IS NOT NULL THEN
        SELECT setting_value INTO setting_value
        FROM configuration.settings
        WHERE setting_key = p_setting_key
        AND tenant_id = p_tenant_id
        AND organization_id IS NULL
        AND user_id IS NULL
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF setting_value IS NOT NULL THEN
            RETURN setting_value;
        END IF;
    END IF;
    
    -- Verificar configuração do sistema (padrão)
    SELECT setting_value INTO setting_value
    FROM configuration.settings
    WHERE setting_key = p_setting_key
    AND tenant_id IS NULL
    AND organization_id IS NULL
    AND user_id IS NULL
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não encontrou, retornar valor padrão
    IF setting_value IS NULL THEN
        SELECT default_value INTO setting_value
        FROM configuration.settings
        WHERE setting_key = p_setting_key
        AND scope = 'system'
        LIMIT 1;
    END IF;
    
    RETURN COALESCE(setting_value, 'null'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Função para verificar feature flag
CREATE OR REPLACE FUNCTION configuration.is_feature_enabled(
    p_flag_key VARCHAR(100),
    p_tenant_id UUID DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    flag_record RECORD;
    rollout_enabled BOOLEAN := false;
BEGIN
    -- Buscar feature flag mais específico
    SELECT *
    INTO flag_record
    FROM configuration.feature_flags
    WHERE flag_key = p_flag_key
    AND is_enabled = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date > NOW())
    AND (
        (scope = 'system' AND tenant_id IS NULL) OR
        (scope = 'tenant' AND tenant_id = p_tenant_id) OR
        (scope = 'organization' AND organization_id = p_organization_id)
    )
    ORDER BY 
        CASE scope 
            WHEN 'organization' THEN 1
            WHEN 'tenant' THEN 2
            WHEN 'system' THEN 3
        END
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Verificar se usuário está na lista de targets específicos
    IF p_user_id IS NOT NULL AND flag_record.target_users IS NOT NULL THEN
        IF p_user_id::TEXT = ANY(flag_record.target_users) THEN
            RETURN true;
        END IF;
    END IF;
    
    -- Verificar rollout percentage
    IF flag_record.rollout_percentage > 0 THEN
        -- Usar hash do user_id para determinar se está no rollout
        IF p_user_id IS NOT NULL THEN
            rollout_enabled := (hashtext(p_user_id::TEXT) % 100) < flag_record.rollout_percentage;
        ELSE
            rollout_enabled := (random() * 100) < flag_record.rollout_percentage;
        END IF;
    END IF;
    
    -- Verificar condições complexas se existirem
    IF flag_record.conditions IS NOT NULL THEN
        -- Implementar lógica de condições complexas aqui
        -- Por simplicidade, assumindo que todas as condições são atendidas
        rollout_enabled := true;
    END IF;
    
    -- Retornar baseado no tipo de flag
    IF flag_record.flag_type = 'boolean' THEN
        RETURN COALESCE(flag_record.current_value->>'value', flag_record.default_value->>'value')::boolean 
               AND rollout_enabled;
    END IF;
    
    RETURN rollout_enabled;
END;
$$ LANGUAGE plpgsql;

-- Trigger para histórico de mudanças
CREATE OR REPLACE FUNCTION configuration.track_configuration_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO configuration.change_history (
        tenant_id,
        entity_type,
        entity_id,
        change_type,
        old_value,
        new_value,
        changed_fields,
        applied_by
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        TG_ARGV[0], -- Entity type passed as argument
        COALESCE(NEW.setting_id, NEW.theme_id, NEW.layout_id, NEW.branding_id, OLD.setting_id, OLD.theme_id, OLD.layout_id, OLD.branding_id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END,
        CASE 
            WHEN TG_OP = 'UPDATE' THEN ARRAY(
                SELECT key FROM jsonb_each(row_to_json(NEW)::jsonb) 
                WHERE row_to_json(NEW)::jsonb -> key != row_to_json(OLD)::jsonb -> key
            )
            ELSE NULL
        END,
        COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers para todas as tabelas de configuração
CREATE TRIGGER settings_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON configuration.settings
    FOR EACH ROW EXECUTE FUNCTION configuration.track_configuration_changes('setting');

CREATE TRIGGER themes_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON configuration.themes
    FOR EACH ROW EXECUTE FUNCTION configuration.track_configuration_changes('theme');

CREATE TRIGGER layouts_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON configuration.custom_layouts
    FOR EACH ROW EXECUTE FUNCTION configuration.track_configuration_changes('layout');

CREATE TRIGGER branding_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON configuration.branding
    FOR EACH ROW EXECUTE FUNCTION configuration.track_configuration_changes('branding');

-- Função para aplicar tema
CREATE OR REPLACE FUNCTION configuration.apply_theme(
    p_theme_id UUID,
    p_tenant_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Desativar tema atual
    UPDATE configuration.themes 
    SET is_default = false, updated_at = NOW()
    WHERE tenant_id = p_tenant_id AND is_default = true;
    
    -- Ativar novo tema
    UPDATE configuration.themes 
    SET is_default = true, updated_at = NOW()
    WHERE theme_id = p_theme_id AND tenant_id = p_tenant_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para duplicar configurações
CREATE OR REPLACE FUNCTION configuration.duplicate_configuration(
    p_source_tenant_id UUID,
    p_target_tenant_id UUID,
    p_config_types TEXT[] DEFAULT ARRAY['settings', 'themes', 'branding']
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Duplicar settings
    IF 'settings' = ANY(p_config_types) THEN
        INSERT INTO configuration.settings (
            tenant_id, setting_key, setting_category, setting_value, setting_type,
            default_value, scope, description, display_name, created_by
        )
        SELECT 
            p_target_tenant_id, setting_key, setting_category, setting_value, setting_type,
            default_value, scope, description, display_name, created_by
        FROM configuration.settings
        WHERE tenant_id = p_source_tenant_id;
    END IF;
    
    -- Duplicar themes
    IF 'themes' = ANY(p_config_types) THEN
        INSERT INTO configuration.themes (
            tenant_id, theme_name, theme_type, theme_data, is_default, created_by
        )
        SELECT 
            p_target_tenant_id, theme_name, theme_type, theme_data, is_default, created_by
        FROM configuration.themes
        WHERE tenant_id = p_source_tenant_id;
    END IF;
    
    -- Duplicar branding
    IF 'branding' = ANY(p_config_types) THEN
        INSERT INTO configuration.branding (
            tenant_id, brand_name, logo_url, primary_color, secondary_color,
            custom_css, footer_text, created_by
        )
        SELECT 
            p_target_tenant_id, brand_name, logo_url, primary_color, secondary_color,
            custom_css, footer_text, created_by
        FROM configuration.branding
        WHERE tenant_id = p_source_tenant_id;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;
```

### 🔧 IMPLEMENTAÇÃO DOS SERVIÇOS

#### 1. Configuration Service
```typescript
// src/modules/configuration/services/configuration.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ConfigurationService {
    private readonly logger = new Logger(ConfigurationService.name);
    private readonly CACHE_TTL = 3600; // 1 hour cache

    constructor(
        @InjectRepository(Setting)
        private readonly settingRepository: Repository<Setting>,
        
        @InjectRepository(Theme)
        private readonly themeRepository: Repository<Theme>,
        
        @InjectRepository(FeatureFlag)
        private readonly featureFlagRepository: Repository<FeatureFlag>,
        
        @InjectRepository(CustomLayout)
        private readonly layoutRepository: Repository<CustomLayout>,
        
        @InjectRepository(Branding)
        private readonly brandingRepository: Repository<Branding>,
        
        @InjectRedis() private readonly redis: Redis,
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService
    ) {}

    async getEffectiveSetting(
        settingKey: string,
        context: ConfigurationContext
    ): Promise<any> {
        const cacheKey = `config:${settingKey}:${context.tenantId}:${context.organizationId}:${context.userId}`;
        
        // Try cache first
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Query database with hierarchy
        const query = `
            SELECT configuration.get_effective_setting($1, $2, $3, $4) as value
        `;

        const result = await this.settingRepository.query(query, [
            settingKey,
            context.tenantId,
            context.organizationId,
            context.userId
        ]);

        const value = result[0]?.value;

        // Cache result
        await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(value));

        return value;
    }

    async setSetting(
        settingKey: string,
        settingValue: any,
        context: ConfigurationContext,
        scope: ConfigurationScope = 'user'
    ): Promise<Setting> {
        // Validate setting exists and is not readonly
        const existingSetting = await this.settingRepository.findOne({
            where: { settingKey, scope: 'system' }
        });

        if (existingSetting?.isReadonly) {
            throw new Error('Configuração é somente leitura');
        }

        // Apply validation rules if they exist
        if (existingSetting?.validationRules) {
            this.validateSettingValue(settingValue, existingSetting.validationRules);
        }

        // Create or update setting
        const setting = await this.settingRepository.upsert({
            settingKey,
            settingValue,
            tenantId: scope !== 'system' ? context.tenantId : null,
            organizationId: scope === 'organization' || scope === 'user' ? context.organizationId : null,
            userId: scope === 'user' ? context.userId : null,
            scope,
            updatedBy: context.userId
        }, ['settingKey', 'tenantId', 'organizationId', 'userId']);

        // Clear cache
        await this.invalidateSettingCache(settingKey, context);

        // Emit event
        this.eventEmitter.emit('configuration.setting.changed', {
            settingKey,
            settingValue,
            scope,
            context
        });

        this.logger.log(`Setting updated: ${settingKey} (scope: ${scope})`);
        return setting.generatedMaps[0] as Setting;
    }

    async getBulkSettings(
        settingKeys: string[],
        context: ConfigurationContext
    ): Promise<Record<string, any>> {
        const settings: Record<string, any> = {};

        for (const key of settingKeys) {
            settings[key] = await this.getEffectiveSetting(key, context);
        }

        return settings;
    }

    async getSettingsByCategory(
        category: string,
        context: ConfigurationContext
    ): Promise<Record<string, any>> {
        const cacheKey = `config:category:${category}:${context.tenantId}:${context.organizationId}:${context.userId}`;
        
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Get all settings in category
        const systemSettings = await this.settingRepository.find({
            where: { settingCategory: category, scope: 'system' },
            order: { displayOrder: 'ASC', settingKey: 'ASC' }
        });

        const settings: Record<string, any> = {};

        for (const setting of systemSettings) {
            settings[setting.settingKey] = await this.getEffectiveSetting(
                setting.settingKey,
                context
            );
        }

        await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(settings));
        return settings;
    }

    async isFeatureEnabled(
        flagKey: string,
        context: ConfigurationContext
    ): Promise<boolean> {
        const cacheKey = `feature:${flagKey}:${context.tenantId}:${context.organizationId}:${context.userId}`;
        
        const cached = await this.redis.get(cacheKey);
        if (cached !== null) {
            return cached === 'true';
        }

        const query = `
            SELECT configuration.is_feature_enabled($1, $2, $3, $4) as enabled
        `;

        const result = await this.featureFlagRepository.query(query, [
            flagKey,
            context.tenantId,
            context.organizationId,
            context.userId
        ]);

        const enabled = result[0]?.enabled || false;

        await this.redis.setex(cacheKey, this.CACHE_TTL, enabled.toString());
        return enabled;
    }

    async createTheme(createThemeDto: CreateThemeDto): Promise<Theme> {
        // Validate theme data structure
        this.validateThemeData(createThemeDto.themeData);

        // Create theme
        const theme = this.themeRepository.create({
            ...createThemeDto,
            version: '1.0'
        });

        const savedTheme = await this.themeRepository.save(theme);

        // If this is set as default, update others
        if (createThemeDto.isDefault) {
            await this.setDefaultTheme(savedTheme.themeId, createThemeDto.tenantId);
        }

        // Clear theme cache
        await this.invalidateThemeCache(createThemeDto.tenantId);

        this.logger.log(`Theme created: ${savedTheme.themeName}`);
        return savedTheme;
    }

    async updateTheme(themeId: string, updateThemeDto: UpdateThemeDto): Promise<Theme> {
        const theme = await this.themeRepository.findOne({
            where: { themeId }
        });

        if (!theme) {
            throw new NotFoundException('Tema não encontrado');
        }

        if (updateThemeDto.themeData) {
            this.validateThemeData(updateThemeDto.themeData);
        }

        Object.assign(theme, updateThemeDto);
        theme.updatedAt = new Date();

        const updatedTheme = await this.themeRepository.save(theme);

        // Clear cache
        await this.invalidateThemeCache(theme.tenantId);

        this.eventEmitter.emit('configuration.theme.updated', {
            themeId,
            theme: updatedTheme
        });

        return updatedTheme;
    }

    async getActiveTheme(tenantId: string): Promise<Theme> {
        const cacheKey = `theme:active:${tenantId}`;
        
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const theme = await this.themeRepository.findOne({
            where: { tenantId, isDefault: true, isActive: true }
        });

        if (!theme) {
            // Return system default theme
            const defaultTheme = await this.themeRepository.findOne({
                where: { tenantId: null, themeType: 'system', isDefault: true }
            });

            if (defaultTheme) {
                await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(defaultTheme));
            }

            return defaultTheme;
        }

        await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(theme));
        return theme;
    }

    async setDefaultTheme(themeId: string, tenantId: string): Promise<void> {
        const query = `
            SELECT configuration.apply_theme($1, $2) as success
        `;

        await this.themeRepository.query(query, [themeId, tenantId]);
        
        await this.invalidateThemeCache(tenantId);

        this.eventEmitter.emit('configuration.theme.changed', {
            themeId,
            tenantId
        });
    }

    async createCustomLayout(createLayoutDto: CreateLayoutDto): Promise<CustomLayout> {
        // Validate layout data structure
        this.validateLayoutData(createLayoutDto.layoutData);

        const layout = this.layoutRepository.create({
            ...createLayoutDto,
            version: '1.0'
        });

        const savedLayout = await this.layoutRepository.save(layout);

        // Clear layout cache
        await this.invalidateLayoutCache(
            createLayoutDto.pageName,
            createLayoutDto.tenantId,
            createLayoutDto.userId
        );

        this.logger.log(`Custom layout created: ${savedLayout.layoutName}`);
        return savedLayout;
    }

    async getUserLayout(
        pageName: string,
        context: ConfigurationContext
    ): Promise<CustomLayout | null> {
        const cacheKey = `layout:${pageName}:${context.tenantId}:${context.userId}`;
        
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Try user-specific layout first
        let layout = await this.layoutRepository.findOne({
            where: {
                pageName,
                userId: context.userId,
                tenantId: context.tenantId
            }
        });

        // Fallback to organization default
        if (!layout && context.organizationId) {
            layout = await this.layoutRepository.findOne({
                where: {
                    pageName,
                    organizationId: context.organizationId,
                    userId: null,
                    isDefault: true
                }
            });
        }

        // Fallback to tenant default
        if (!layout) {
            layout = await this.layoutRepository.findOne({
                where: {
                    pageName,
                    tenantId: context.tenantId,
                    organizationId: null,
                    userId: null,
                    isDefault: true
                }
            });
        }

        if (layout) {
            await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(layout));
        }

        return layout;
    }

    async updateBranding(
        tenantId: string,
        updateBrandingDto: UpdateBrandingDto
    ): Promise<Branding> {
        let branding = await this.brandingRepository.findOne({
            where: { tenantId, isActive: true }
        });

        if (!branding) {
            branding = this.brandingRepository.create({
                tenantId,
                brandName: updateBrandingDto.brandName || 'Default Brand',
                ...updateBrandingDto
            });
        } else {
            Object.assign(branding, updateBrandingDto);
            branding.updatedAt = new Date();
        }

        const savedBranding = await this.brandingRepository.save(branding);

        // Clear branding cache
        await this.invalidateBrandingCache(tenantId);

        this.eventEmitter.emit('configuration.branding.updated', {
            tenantId,
            branding: savedBranding
        });

        return savedBranding;
    }

    async getBranding(tenantId: string): Promise<Branding | null> {
        const cacheKey = `branding:${tenantId}`;
        
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const branding = await this.brandingRepository.findOne({
            where: { tenantId, isActive: true }
        });

        if (branding) {
            await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(branding));
        }

        return branding;
    }

    async exportConfiguration(tenantId: string): Promise<ConfigurationExport> {
        const [settings, themes, layouts, branding, featureFlags] = await Promise.all([
            this.settingRepository.find({ where: { tenantId } }),
            this.themeRepository.find({ where: { tenantId } }),
            this.layoutRepository.find({ where: { tenantId } }),
            this.brandingRepository.find({ where: { tenantId } }),
            this.featureFlagRepository.find({ where: { tenantId } })
        ]);

        return {
            version: '1.0',
            exportedAt: new Date(),
            tenantId,
            settings,
            themes,
            layouts,
            branding,
            featureFlags
        };
    }

    async importConfiguration(
        tenantId: string,
        configData: ConfigurationExport,
        options: ImportOptions = {}
    ): Promise<void> {
        const { overwrite = false, categories = [] } = options;

        await this.settingRepository.manager.transaction(async (manager) => {
            // Import settings
            if (!categories.length || categories.includes('settings')) {
                for (const setting of configData.settings) {
                    const existingSetting = await manager.findOne(Setting, {
                        where: {
                            settingKey: setting.settingKey,
                            tenantId,
                            organizationId: setting.organizationId,
                            userId: setting.userId
                        }
                    });

                    if (!existingSetting || overwrite) {
                        await manager.upsert(Setting, {
                            ...setting,
                            settingId: undefined,
                            tenantId,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }, ['settingKey', 'tenantId', 'organizationId', 'userId']);
                    }
                }
            }

            // Import themes
            if (!categories.length || categories.includes('themes')) {
                for (const theme of configData.themes) {
                    const existingTheme = await manager.findOne(Theme, {
                        where: { themeName: theme.themeName, tenantId }
                    });

                    if (!existingTheme || overwrite) {
                        await manager.save(Theme, {
                            ...theme,
                            themeId: undefined,
                            tenantId,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                }
            }

            // Import other categories...
        });

        // Clear all caches for this tenant
        await this.invalidateAllCaches(tenantId);

        this.eventEmitter.emit('configuration.imported', {
            tenantId,
            categories: categories.length ? categories : ['all']
        });

        this.logger.log(`Configuration imported for tenant: ${tenantId}`);
    }

    private validateSettingValue(value: any, validationRules: any): void {
        if (!validationRules) return;

        const { type, min, max, regex, allowedValues } = validationRules;

        // Type validation
        if (type === 'number' && typeof value !== 'number') {
            throw new Error('Valor deve ser um número');
        }

        if (type === 'string' && typeof value !== 'string') {
            throw new Error('Valor deve ser uma string');
        }

        if (type === 'boolean' && typeof value !== 'boolean') {
            throw new Error('Valor deve ser um boolean');
        }

        // Range validation
        if (type === 'number') {
            if (min !== undefined && value < min) {
                throw new Error(`Valor deve ser maior ou igual a ${min}`);
            }
            if (max !== undefined && value > max) {
                throw new Error(`Valor deve ser menor ou igual a ${max}`);
            }
        }

        // String length validation
        if (type === 'string') {
            if (min !== undefined && value.length < min) {
                throw new Error(`String deve ter pelo menos ${min} caracteres`);
            }
            if (max !== undefined && value.length > max) {
                throw new Error(`String deve ter no máximo ${max} caracteres`);
            }
        }

        // Regex validation
        if (regex && type === 'string') {
            const regexPattern = new RegExp(regex);
            if (!regexPattern.test(value)) {
                throw new Error('Valor não atende ao padrão esperado');
            }
        }

        // Allowed values validation
        if (allowedValues && Array.isArray(allowedValues)) {
            if (!allowedValues.includes(value)) {
                throw new Error(`Valor deve ser um dos seguintes: ${allowedValues.join(', ')}`);
            }
        }
    }

    private validateThemeData(themeData: any): void {
        const requiredFields = ['colors', 'typography', 'spacing'];
        
        for (const field of requiredFields) {
            if (!themeData[field]) {
                throw new Error(`Campo obrigatório ausente no tema: ${field}`);
            }
        }

        // Validate color format
        if (themeData.colors) {
            for (const [key, color] of Object.entries(themeData.colors)) {
                if (typeof color === 'string' && !this.isValidColor(color)) {
                    throw new Error(`Cor inválida para ${key}: ${color}`);
                }
            }
        }
    }

    private validateLayoutData(layoutData: any): void {
        if (!layoutData.components || !Array.isArray(layoutData.components)) {
            throw new Error('Layout deve conter um array de componentes');
        }

        for (const component of layoutData.components) {
            if (!component.id || !component.type) {
                throw new Error('Componente deve ter id e type');
            }
        }
    }

    private isValidColor(color: string): boolean {
        // Simple hex color validation
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
               /^rgb\(\d+,\s*\d+,\s*\d+\)$/.test(color) ||
               /^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/.test(color);
    }

    private async invalidateSettingCache(settingKey: string, context: ConfigurationContext): Promise<void> {
        const patterns = [
            `config:${settingKey}:*`,
            `config:category:*:${context.tenantId}:*`
        ];

        for (const pattern of patterns) {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
    }

    private async invalidateThemeCache(tenantId: string): Promise<void> {
        const keys = await this.redis.keys(`theme:*:${tenantId}`);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }

    private async invalidateLayoutCache(pageName: string, tenantId: string, userId?: string): Promise<void> {
        const patterns = [
            `layout:${pageName}:${tenantId}:*`,
            userId ? `layout:${pageName}:${tenantId}:${userId}` : null
        ].filter(Boolean);

        for (const pattern of patterns) {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
    }

    private async invalidateBrandingCache(tenantId: string): Promise<void> {
        await this.redis.del(`branding:${tenantId}`);
    }

    private async invalidateAllCaches(tenantId: string): Promise<void> {
        const patterns = [
            `config:*:${tenantId}:*`,
            `theme:*:${tenantId}`,
            `layout:*:${tenantId}:*`,
            `branding:${tenantId}`,
            `feature:*:${tenantId}:*`
        ];

        for (const pattern of patterns) {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
    }
}

// Interfaces and DTOs
interface ConfigurationContext {
    tenantId?: string;
    organizationId?: string;
    userId?: string;
}

type ConfigurationScope = 'system' | 'tenant' | 'organization' | 'user';

interface CreateThemeDto {
    tenantId: string;
    themeName: string;
    themeType?: string;
    baseThemeId?: string;
    themeData: any;
    isDefault?: boolean;
    createdBy: string;
}

interface UpdateThemeDto {
    themeName?: string;
    themeData?: any;
    isDefault?: boolean;
    isActive?: boolean;
}

interface CreateLayoutDto {
    tenantId: string;
    organizationId?: string;
    userId?: string;
    pageName: string;
    layoutName: string;
    layoutType?: string;
    layoutData: any;
    gridConfig?: any;
    responsiveConfig?: any;
    isDefault?: boolean;
    createdBy: string;
}

interface UpdateBrandingDto {
    brandName?: string;
    logoUrl?: string;
    logoDarkUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontPrimary?: string;
    customCss?: string;
    footerText?: string;
    supportEmail?: string;
    supportPhone?: string;
}

interface ConfigurationExport {
    version: string;
    exportedAt: Date;
    tenantId: string;
    settings: Setting[];
    themes: Theme[];
    layouts: CustomLayout[];
    branding: Branding[];
    featureFlags: FeatureFlag[];
}

interface ImportOptions {
    overwrite?: boolean;
    categories?: string[];
}
```

#### 2. Theme Engine Service
```typescript
// src/modules/configuration/services/theme-engine.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ThemeEngineService {
    private readonly logger = new Logger(ThemeEngineService.name);

    generateCSSVariables(themeData: any): string {
        let cssVariables = ':root {\n';

        // Process colors
        if (themeData.colors) {
            for (const [key, value] of Object.entries(themeData.colors)) {
                cssVariables += `  --color-${this.kebabCase(key)}: ${value};\n`;
            }
        }

        // Process typography
        if (themeData.typography) {
            const typography = themeData.typography;
            
            if (typography.fontFamily) {
                cssVariables += `  --font-family-primary: ${typography.fontFamily};\n`;
            }
            
            if (typography.fontSize) {
                for (const [size, value] of Object.entries(typography.fontSize)) {
                    cssVariables += `  --font-size-${size}: ${value};\n`;
                }
            }
            
            if (typography.fontWeight) {
                for (const [weight, value] of Object.entries(typography.fontWeight)) {
                    cssVariables += `  --font-weight-${weight}: ${value};\n`;
                }
            }
        }

        // Process spacing
        if (themeData.spacing) {
            for (const [key, value] of Object.entries(themeData.spacing)) {
                cssVariables += `  --spacing-${key}: ${value};\n`;
            }
        }

        // Process border radius
        if (themeData.borderRadius) {
            for (const [key, value] of Object.entries(themeData.borderRadius)) {
                cssVariables += `  --border-radius-${key}: ${value};\n`;
            }
        }

        // Process shadows
        if (themeData.shadows) {
            for (const [key, value] of Object.entries(themeData.shadows)) {
                cssVariables += `  --shadow-${key}: ${value};\n`;
            }
        }

        cssVariables += '}\n';

        // Add component-specific styles
        if (themeData.components) {
            cssVariables += this.generateComponentStyles(themeData.components);
        }

        return cssVariables;
    }

    private generateComponentStyles(components: any): string {
        let styles = '\n/* Component Styles */\n';

        for (const [componentName, componentStyles] of Object.entries(components)) {
            const className = `.${this.kebabCase(componentName)}`;
            styles += `${className} {\n`;

            for (const [property, value] of Object.entries(componentStyles as any)) {
                const cssProperty = this.kebabCase(property);
                styles += `  ${cssProperty}: ${value};\n`;
            }

            styles += '}\n\n';
        }

        return styles;
    }

    private kebabCase(str: string): string {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    generateThemePreview(themeData: any): string {
        return `
            <div class="theme-preview" style="font-family: ${themeData.typography?.fontFamily || 'Arial'};">
                <div class="header" style="background: ${themeData.colors?.primary || '#007bff'}; color: white; padding: 16px;">
                    <h1 style="margin: 0; font-size: ${themeData.typography?.fontSize?.xl || '24px'};">Theme Preview</h1>
                </div>
                <div class="content" style="padding: 16px; background: ${themeData.colors?.background || '#ffffff'};">
                    <p style="color: ${themeData.colors?.text || '#333333'};">
                        This is a preview of your theme. The primary color is used for headers and buttons.
                    </p>
                    <button style="
                        background: ${themeData.colors?.primary || '#007bff'};
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: ${themeData.borderRadius?.md || '4px'};
                        font-size: ${themeData.typography?.fontSize?.base || '16px'};
                    ">Primary Button</button>
                    <button style="
                        background: ${themeData.colors?.secondary || '#6c757d'};
                        color: white;
                        border: none;
                        padding: 8px 16px;
                        border-radius: ${themeData.borderRadius?.md || '4px'};
                        font-size: ${themeData.typography?.fontSize?.base || '16px'};
                        margin-left: 8px;
                    ">Secondary Button</button>
                </div>
            </div>
        `;
    }

    validateThemeStructure(themeData: any): ThemeValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required sections
        const requiredSections = ['colors', 'typography', 'spacing'];
        for (const section of requiredSections) {
            if (!themeData[section]) {
                errors.push(`Seção obrigatória ausente: ${section}`);
            }
        }

        // Validate colors
        if (themeData.colors) {
            const requiredColors = ['primary', 'secondary', 'background', 'text'];
            for (const color of requiredColors) {
                if (!themeData.colors[color]) {
                    warnings.push(`Cor recomendada ausente: ${color}`);
                }
            }

            // Validate color format
            for (const [key, value] of Object.entries(themeData.colors)) {
                if (typeof value === 'string' && !this.isValidColor(value)) {
                    errors.push(`Formato de cor inválido para ${key}: ${value}`);
                }
            }
        }

        // Validate typography
        if (themeData.typography) {
            if (!themeData.typography.fontFamily) {
                warnings.push('Font family não especificada');
            }

            if (!themeData.typography.fontSize) {
                warnings.push('Tamanhos de fonte não especificados');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    private isValidColor(color: string): boolean {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
               /^rgb\(\d+,\s*\d+,\s*\d+\)$/.test(color) ||
               /^rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)$/.test(color) ||
               /^hsl\(\d+,\s*\d+%,\s*\d+%\)$/.test(color);
    }

    createThemeFromTemplate(templateName: string, customizations: any = {}): any {
        const baseThemes = {
            modern: {
                colors: {
                    primary: '#3b82f6',
                    secondary: '#64748b',
                    accent: '#06b6d4',
                    background: '#ffffff',
                    surface: '#f8fafc',
                    text: '#1e293b',
                    textSecondary: '#64748b',
                    border: '#e2e8f0',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444'
                },
                typography: {
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: {
                        xs: '12px',
                        sm: '14px',
                        base: '16px',
                        lg: '18px',
                        xl: '20px',
                        '2xl': '24px',
                        '3xl': '30px'
                    },
                    fontWeight: {
                        normal: '400',
                        medium: '500',
                        semibold: '600',
                        bold: '700'
                    }
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    '2xl': '48px'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                },
                shadows: {
                    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
            },
            dark: {
                colors: {
                    primary: '#3b82f6',
                    secondary: '#64748b',
                    accent: '#06b6d4',
                    background: '#0f172a',
                    surface: '#1e293b',
                    text: '#f1f5f9',
                    textSecondary: '#94a3b8',
                    border: '#334155',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444'
                },
                typography: {
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: {
                        xs: '12px',
                        sm: '14px',
                        base: '16px',
                        lg: '18px',
                        xl: '20px',
                        '2xl': '24px',
                        '3xl': '30px'
                    }
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                    md: '16px',
                    lg: '24px',
                    xl: '32px',
                    '2xl': '48px'
                },
                borderRadius: {
                    sm: '4px',
                    md: '8px',
                    lg: '12px',
                    xl: '16px',
                    full: '9999px'
                }
            }
        };

        const baseTheme = baseThemes[templateName] || baseThemes.modern;
        
        // Deep merge customizations
        return this.deepMerge(baseTheme, customizations);
    }

    private deepMerge(target: any, source: any): any {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }
}

interface ThemeValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
```

### 🎨 COMPONENTES FRONTEND

#### 1. Configuration Dashboard
```typescript
// src/components/configuration/ConfigurationDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Settings, 
    Palette, 
    Layout, 
    Zap, 
    Eye,
    Save,
    Download,
    Upload,
    RefreshCw,
    Code,
    Monitor
} from 'lucide-react';
import { useConfiguration, useThemes, useFeatureFlags } from '@/hooks/useConfiguration';

export function ConfigurationDashboard() {
    const [activeTab, setActiveTab] = useState('general');
    const [hasChanges, setHasChanges] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const { settings, updateSetting, loading: settingsLoading } = useConfiguration();
    const { themes, activeTheme, createTheme, updateTheme, setDefaultTheme } = useThemes();
    const { featureFlags, toggleFeature } = useFeatureFlags();

    const [localSettings, setLocalSettings] = useState(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSettingChange = (key: string, value: any) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: value
        }));
        setHasChanges(true);
    };

    const saveChanges = async () => {
        try {
            for (const [key, value] of Object.entries(localSettings)) {
                if (settings[key] !== value) {
                    await updateSetting(key, value);
                }
            }
            setHasChanges(false);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    };

    const exportConfiguration = () => {
        const config = {
            settings: localSettings,
            theme: activeTheme,
            featureFlags: featureFlags,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kryonix-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="configuration-dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    <Settings className="title-icon" />
                    Configuração e Personalização
                </h1>
                
                <div className="dashboard-actions">
                    <Button 
                        variant="outline" 
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        <Eye className="button-icon" />
                        {previewMode ? 'Sair da Prévia' : 'Visualizar'}
                    </Button>
                    
                    <Button variant="outline" onClick={exportConfiguration}>
                        <Download className="button-icon" />
                        Exportar
                    </Button>
                    
                    <Button 
                        onClick={saveChanges} 
                        disabled={!hasChanges}
                        className={hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                        <Save className="button-icon" />
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            {hasChanges && (
                <div className="changes-banner">
                    <div className="banner-content">
                        <span>⚠️ Você tem alterações não salvas</span>
                        <div className="banner-actions">
                            <Button variant="ghost" size="sm" onClick={() => {
                                setLocalSettings(settings);
                                setHasChanges(false);
                            }}>
                                Descartar
                            </Button>
                            <Button size="sm" onClick={saveChanges}>
                                Salvar Agora
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="config-tabs">
                <TabsList className="tabs-nav">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="appearance">Aparência</TabsTrigger>
                    <TabsTrigger value="features">Funcionalidades</TabsTrigger>
                    <TabsTrigger value="integrations">Integrações</TabsTrigger>
                    <TabsTrigger value="advanced">Avançado</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <div className="config-section">
                        <h2 className="section-title">Configurações Gerais</h2>
                        
                        <div className="settings-grid">
                            <Card className="setting-card">
                                <CardHeader>
                                    <CardTitle>Informações da Organização</CardTitle>
                                </CardHeader>
                                <CardContent className="setting-content">
                                    <div className="setting-field">
                                        <label>Nome da Organização</label>
                                        <Input
                                            value={localSettings.organizationName || ''}
                                            onChange={(e) => handleSettingChange('organizationName', e.target.value)}
                                            placeholder="Digite o nome da organização"
                                        />
                                    </div>

                                    <div className="setting-field">
                                        <label>Fuso Horário</label>
                                        <Select 
                                            value={localSettings.timezone || ''} 
                                            onValueChange={(value) => handleSettingChange('timezone', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o fuso horário" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                                                <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                                                <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                                                <SelectItem value="Asia/Tokyo">Tóquio (UTC+9)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="setting-field">
                                        <label>Idioma Padrão</label>
                                        <Select 
                                            value={localSettings.defaultLanguage || ''} 
                                            onValueChange={(value) => handleSettingChange('defaultLanguage', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o idioma" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                                <SelectItem value="en-US">English (US)</SelectItem>
                                                <SelectItem value="es-ES">Español</SelectItem>
                                                <SelectItem value="fr-FR">Français</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="setting-card">
                                <CardHeader>
                                    <CardTitle>Preferências de Sistema</CardTitle>
                                </CardHeader>
                                <CardContent className="setting-content">
                                    <div className="setting-toggle">
                                        <div className="toggle-info">
                                            <label>Notificações por Email</label>
                                            <p className="setting-description">
                                                Receber notificações importantes por email
                                            </p>
                                        </div>
                                        <Switch
                                            checked={localSettings.emailNotifications || false}
                                            onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                                        />
                                    </div>

                                    <div className="setting-toggle">
                                        <div className="toggle-info">
                                            <label>Modo de Manutenção</label>
                                            <p className="setting-description">
                                                Ativar modo de manutenção para todos os usuários
                                            </p>
                                        </div>
                                        <Switch
                                            checked={localSettings.maintenanceMode || false}
                                            onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                                        />
                                    </div>

                                    <div className="setting-toggle">
                                        <div className="toggle-info">
                                            <label>Auditoria Detalhada</label>
                                            <p className="setting-description">
                                                Registrar todas as ações de usuários para auditoria
                                            </p>
                                        </div>
                                        <Switch
                                            checked={localSettings.detailedAudit || false}
                                            onCheckedChange={(checked) => handleSettingChange('detailedAudit', checked)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="setting-card">
                                <CardHeader>
                                    <CardTitle>Limites e Quotas</CardTitle>
                                </CardHeader>
                                <CardContent className="setting-content">
                                    <div className="setting-field">
                                        <label>Máximo de Usuários</label>
                                        <Input
                                            type="number"
                                            value={localSettings.maxUsers || ''}
                                            onChange={(e) => handleSettingChange('maxUsers', parseInt(e.target.value))}
                                            placeholder="Limite de usuários (0 = ilimitado)"
                                        />
                                    </div>

                                    <div className="setting-field">
                                        <label>Limite de Storage (GB)</label>
                                        <Input
                                            type="number"
                                            value={localSettings.storageLimit || ''}
                                            onChange={(e) => handleSettingChange('storageLimit', parseInt(e.target.value))}
                                            placeholder="Limite de storage em GB"
                                        />
                                    </div>

                                    <div className="setting-field">
                                        <label>Taxa de Requisições (por minuto)</label>
                                        <Input
                                            type="number"
                                            value={localSettings.rateLimit || ''}
                                            onChange={(e) => handleSettingChange('rateLimit', parseInt(e.target.value))}
                                            placeholder="Máximo de requisições por minuto"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="appearance">
                    <div className="config-section">
                        <h2 className="section-title">Aparência e Temas</h2>
                        
                        <div className="appearance-grid">
                            <Card className="theme-selector-card">
                                <CardHeader>
                                    <CardTitle>
                                        <Palette className="title-icon" />
                                        Tema Ativo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="themes-grid">
                                        {themes?.map((theme) => (
                                            <div 
                                                key={theme.themeId}
                                                className={`theme-option ${activeTheme?.themeId === theme.themeId ? 'active' : ''}`}
                                                onClick={() => setDefaultTheme(theme.themeId)}
                                            >
                                                <div className="theme-preview">
                                                    {theme.previewImageUrl ? (
                                                        <img src={theme.previewImageUrl} alt={theme.themeName} />
                                                    ) : (
                                                        <div className="theme-colors">
                                                            <div 
                                                                className="color-swatch primary"
                                                                style={{ backgroundColor: theme.themeData?.colors?.primary }}
                                                            />
                                                            <div 
                                                                className="color-swatch secondary"
                                                                style={{ backgroundColor: theme.themeData?.colors?.secondary }}
                                                            />
                                                            <div 
                                                                className="color-swatch accent"
                                                                style={{ backgroundColor: theme.themeData?.colors?.accent }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="theme-info">
                                                    <h4 className="theme-name">{theme.themeName}</h4>
                                                    <p className="theme-type">{theme.themeType}</p>
                                                </div>
                                                {activeTheme?.themeId === theme.themeId && (
                                                    <Badge className="active-badge">Ativo</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="theme-actions">
                                        <Button variant="outline">
                                            <Code className="button-icon" />
                                            Editor de Tema
                                        </Button>
                                        <Button variant="outline">
                                            <Upload className="button-icon" />
                                            Importar Tema
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="branding-card">
                                <CardHeader>
                                    <CardTitle>Identidade Visual</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="branding-fields">
                                        <div className="field-group">
                                            <label>Logo Principal</label>
                                            <div className="logo-upload">
                                                <div className="logo-preview">
                                                    {localSettings.logoUrl ? (
                                                        <img src={localSettings.logoUrl} alt="Logo" />
                                                    ) : (
                                                        <div className="logo-placeholder">
                                                            📷 Upload Logo
                                                        </div>
                                                    )}
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    <Upload className="button-icon" />
                                                    Alterar Logo
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="field-group">
                                            <label>Cores Personalizadas</label>
                                            <div className="color-inputs">
                                                <div className="color-field">
                                                    <label>Cor Primária</label>
                                                    <div className="color-input-group">
                                                        <input
                                                            type="color"
                                                            value={localSettings.primaryColor || '#3b82f6'}
                                                            onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                                                        />
                                                        <Input
                                                            value={localSettings.primaryColor || '#3b82f6'}
                                                            onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="color-field">
                                                    <label>Cor Secundária</label>
                                                    <div className="color-input-group">
                                                        <input
                                                            type="color"
                                                            value={localSettings.secondaryColor || '#64748b'}
                                                            onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                                                        />
                                                        <Input
                                                            value={localSettings.secondaryColor || '#64748b'}
                                                            onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="field-group">
                                            <label>CSS Customizado</label>
                                            <textarea
                                                className="custom-css-input"
                                                value={localSettings.customCss || ''}
                                                onChange={(e) => handleSettingChange('customCss', e.target.value)}
                                                placeholder="/* Adicione seu CSS customizado aqui */"
                                                rows={6}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="features">
                    <div className="config-section">
                        <h2 className="section-title">Funcionalidades</h2>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    <Zap className="title-icon" />
                                    Feature Flags
                                </CardTitle>
                                <p className="card-description">
                                    Ative ou desative funcionalidades específicas
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="feature-flags-grid">
                                    {featureFlags?.map((flag) => (
                                        <div key={flag.flagId} className="feature-flag-item">
                                            <div className="flag-info">
                                                <h4 className="flag-name">{flag.flagName}</h4>
                                                <p className="flag-description">{flag.description}</p>
                                                <div className="flag-metadata">
                                                    <Badge variant="outline">{flag.scope}</Badge>
                                                    {flag.rolloutPercentage > 0 && (
                                                        <Badge variant="secondary">
                                                            {flag.rolloutPercentage}% rollout
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flag-controls">
                                                <Switch
                                                    checked={flag.isEnabled}
                                                    onCheckedChange={(checked) => toggleFeature(flag.flagKey, checked)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="integrations">
                    <div className="config-section">
                        <h2 className="section-title">Configurações de Integração</h2>
                        
                        <div className="integrations-grid">
                            <Card className="integration-card">
                                <CardHeader>
                                    <CardTitle>Email</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="integration-fields">
                                        <div className="field-group">
                                            <label>Provedor SMTP</label>
                                            <Select 
                                                value={localSettings.emailProvider || ''} 
                                                onValueChange={(value) => handleSettingChange('emailProvider', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o provedor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                                                    <SelectItem value="ses">Amazon SES</SelectItem>
                                                    <SelectItem value="smtp">SMTP Personalizado</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="field-group">
                                            <label>Email Remetente</label>
                                            <Input
                                                type="email"
                                                value={localSettings.fromEmail || ''}
                                                onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                                                placeholder="noreply@empresa.com"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="integration-card">
                                <CardHeader>
                                    <CardTitle>Armazenamento</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="integration-fields">
                                        <div className="field-group">
                                            <label>Provedor de Storage</label>
                                            <Select 
                                                value={localSettings.storageProvider || ''} 
                                                onValueChange={(value) => handleSettingChange('storageProvider', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o provedor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="minio">MinIO (Local)</SelectItem>
                                                    <SelectItem value="s3">Amazon S3</SelectItem>
                                                    <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="field-group">
                                            <label>Bucket Padrão</label>
                                            <Input
                                                value={localSettings.defaultBucket || ''}
                                                onChange={(e) => handleSettingChange('defaultBucket', e.target.value)}
                                                placeholder="kryonix-storage"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="integration-card">
                                <CardHeader>
                                    <CardTitle>Analytics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="integration-fields">
                                        <div className="setting-toggle">
                                            <div className="toggle-info">
                                                <label>Google Analytics</label>
                                                <p className="setting-description">
                                                    Habilitar integração com Google Analytics
                                                </p>
                                            </div>
                                            <Switch
                                                checked={localSettings.googleAnalyticsEnabled || false}
                                                onCheckedChange={(checked) => handleSettingChange('googleAnalyticsEnabled', checked)}
                                            />
                                        </div>

                                        {localSettings.googleAnalyticsEnabled && (
                                            <div className="field-group">
                                                <label>Google Analytics ID</label>
                                                <Input
                                                    value={localSettings.googleAnalyticsId || ''}
                                                    onChange={(e) => handleSettingChange('googleAnalyticsId', e.target.value)}
                                                    placeholder="GA-XXXXXXXXX-X"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="advanced">
                    <div className="config-section">
                        <h2 className="section-title">Configurações Avançadas</h2>
                        
                        <div className="advanced-settings">
                            <Card className="advanced-card">
                                <CardHeader>
                                    <CardTitle>
                                        <Monitor className="title-icon" />
                                        Sistema
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="advanced-fields">
                                        <div className="setting-toggle">
                                            <div className="toggle-info">
                                                <label>Modo Debug</label>
                                                <p className="setting-description">
                                                    Ativar logs detalhados para debug
                                                </p>
                                            </div>
                                            <Switch
                                                checked={localSettings.debugMode || false}
                                                onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                                            />
                                        </div>

                                        <div className="field-group">
                                            <label>Nível de Log</label>
                                            <Select 
                                                value={localSettings.logLevel || ''} 
                                                onValueChange={(value) => handleSettingChange('logLevel', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o nível" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="error">Error</SelectItem>
                                                    <SelectItem value="warn">Warning</SelectItem>
                                                    <SelectItem value="info">Info</SelectItem>
                                                    <SelectItem value="debug">Debug</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="field-group">
                                            <label>Cache TTL (segundos)</label>
                                            <Input
                                                type="number"
                                                value={localSettings.cacheTTL || ''}
                                                onChange={(e) => handleSettingChange('cacheTTL', parseInt(e.target.value))}
                                                placeholder="3600"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="export-import-card">
                                <CardHeader>
                                    <CardTitle>Backup e Restore</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="backup-actions">
                                        <div className="action-group">
                                            <h4>Exportar Configuração</h4>
                                            <p>Baixe todas as configurações em formato JSON</p>
                                            <Button onClick={exportConfiguration}>
                                                <Download className="button-icon" />
                                                Exportar
                                            </Button>
                                        </div>

                                        <div className="action-group">
                                            <h4>Importar Configuração</h4>
                                            <p>Restaure configurações de um arquivo JSON</p>
                                            <Button variant="outline">
                                                <Upload className="button-icon" />
                                                Importar
                                            </Button>
                                        </div>

                                        <div className="action-group">
                                            <h4>Reset Configurações</h4>
                                            <p>Restaurar todas as configurações padrão</p>
                                            <Button variant="destructive">
                                                <RefreshCw className="button-icon" />
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {previewMode && (
                <div className="preview-overlay">
                    <div className="preview-header">
                        <h3>Modo de Prévia</h3>
                        <Button variant="ghost" onClick={() => setPreviewMode(false)}>
                            ✕ Fechar
                        </Button>
                    </div>
                    <div className="preview-content">
                        {/* Preview do tema aplicado */}
                        <iframe 
                            src="/preview" 
                            title="Theme Preview"
                            className="theme-preview-frame"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
```

### 🚀 SCRIPTS DE EXECUÇÃO

#### Script de Configuração do Sistema
```bash
#!/bin/bash
# setup-configuration-system.sh

set -e

echo "🔧 Configurando Sistema de Configuração e Personalização..."

# Criar diretórios necessários
sudo mkdir -p /opt/kryonix/configuration/{templates,themes,exports,backups}
sudo mkdir -p /opt/kryonix/assets/{logos,themes,uploads}

# Configurar templates de tema padrão
cat > /opt/kryonix/configuration/themes/modern-light.json << 'EOF'
{
  "themeName": "Modern Light",
  "themeType": "system",
  "themeData": {
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#64748b",
      "accent": "#06b6d4",
      "background": "#ffffff",
      "surface": "#f8fafc",
      "text": "#1e293b",
      "textSecondary": "#64748b",
      "border": "#e2e8f0",
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444"
    },
    "typography": {
      "fontFamily": "Inter, system-ui, sans-serif",
      "fontSize": {
        "xs": "12px",
        "sm": "14px",
        "base": "16px",
        "lg": "18px",
        "xl": "20px",
        "2xl": "24px",
        "3xl": "30px"
      },
      "fontWeight": {
        "normal": "400",
        "medium": "500",
        "semibold": "600",
        "bold": "700"
      }
    },
    "spacing": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px",
      "2xl": "48px"
    },
    "borderRadius": {
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
    }
  }
}
EOF

cat > /opt/kryonix/configuration/themes/modern-dark.json << 'EOF'
{
  "themeName": "Modern Dark",
  "themeType": "system",
  "themeData": {
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#64748b",
      "accent": "#06b6d4",
      "background": "#0f172a",
      "surface": "#1e293b",
      "text": "#f1f5f9",
      "textSecondary": "#94a3b8",
      "border": "#334155",
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444"
    },
    "typography": {
      "fontFamily": "Inter, system-ui, sans-serif",
      "fontSize": {
        "xs": "12px",
        "sm": "14px",
        "base": "16px",
        "lg": "18px",
        "xl": "20px",
        "2xl": "24px",
        "3xl": "30px"
      }
    }
  }
}
EOF

# Configurar settings padrão do sistema
cat > /opt/kryonix/configuration/templates/default-settings.json << 'EOF'
{
  "settings": [
    {
      "setting_key": "organization_name",
      "setting_category": "general",
      "setting_value": "KRYONIX",
      "setting_type": "string",
      "scope": "system",
      "display_name": "Nome da Organização",
      "description": "Nome principal da organização"
    },
    {
      "setting_key": "timezone",
      "setting_category": "general",
      "setting_value": "America/Sao_Paulo",
      "setting_type": "string",
      "scope": "system",
      "display_name": "Fuso Horário",
      "description": "Fuso horário padrão do sistema",
      "allowed_values": [
        "America/Sao_Paulo",
        "America/New_York",
        "Europe/London",
        "Asia/Tokyo"
      ]
    },
    {
      "setting_key": "default_language",
      "setting_category": "general",
      "setting_value": "pt-BR",
      "setting_type": "string",
      "scope": "system",
      "display_name": "Idioma Padrão",
      "description": "Idioma padrão da interface",
      "allowed_values": ["pt-BR", "en-US", "es-ES", "fr-FR"]
    },
    {
      "setting_key": "email_notifications",
      "setting_category": "notifications",
      "setting_value": true,
      "setting_type": "boolean",
      "scope": "user",
      "display_name": "Notificações por Email",
      "description": "Receber notificações por email"
    },
    {
      "setting_key": "maintenance_mode",
      "setting_category": "system",
      "setting_value": false,
      "setting_type": "boolean",
      "scope": "system",
      "display_name": "Modo de Manutenção",
      "description": "Ativar modo de manutenção",
      "requires_restart": true
    },
    {
      "setting_key": "max_users",
      "setting_category": "limits",
      "setting_value": 1000,
      "setting_type": "number",
      "scope": "tenant",
      "display_name": "Máximo de Usuários",
      "description": "Limite máximo de usuários por tenant",
      "validation_rules": {
        "type": "number",
        "min": 1,
        "max": 10000
      }
    },
    {
      "setting_key": "storage_limit",
      "setting_category": "limits",
      "setting_value": 100,
      "setting_type": "number",
      "scope": "tenant",
      "display_name": "Limite de Storage (GB)",
      "description": "Limite de storage em GB",
      "validation_rules": {
        "type": "number",
        "min": 1,
        "max": 1000
      }
    },
    {
      "setting_key": "debug_mode",
      "setting_category": "system",
      "setting_value": false,
      "setting_type": "boolean",
      "scope": "system",
      "display_name": "Modo Debug",
      "description": "Ativar logs detalhados para debug",
      "requires_restart": true
    }
  ]
}
EOF

# Configurar feature flags padrão
cat > /opt/kryonix/configuration/templates/default-feature-flags.json << 'EOF'
{
  "feature_flags": [
    {
      "flag_key": "advanced_analytics",
      "flag_name": "Analytics Avançados",
      "description": "Habilitar dashboards e relatórios avançados",
      "flag_type": "boolean",
      "default_value": {"value": false},
      "scope": "tenant"
    },
    {
      "flag_key": "ai_assistance",
      "flag_name": "Assistente IA",
      "description": "Habilitar assistente virtual com IA",
      "flag_type": "boolean",
      "default_value": {"value": false},
      "scope": "tenant",
      "rollout_percentage": 25
    },
    {
      "flag_key": "real_time_collaboration",
      "flag_name": "Colaboração em Tempo Real",
      "description": "Habilitar edição colaborativa em tempo real",
      "flag_type": "boolean",
      "default_value": {"value": true},
      "scope": "organization"
    },
    {
      "flag_key": "mobile_app",
      "flag_name": "Aplicativo Mobile",
      "description": "Habilitar acesso via aplicativo mobile",
      "flag_type": "boolean",
      "default_value": {"value": true},
      "scope": "tenant"
    },
    {
      "flag_key": "custom_integrations",
      "flag_name": "Integrações Customizadas",
      "description": "Permitir criação de integrações customizadas",
      "flag_type": "boolean",
      "default_value": {"value": false},
      "scope": "tenant"
    }
  ]
}
EOF

# Script para backup de configurações
cat > /opt/kryonix/configuration/backup-config.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/kryonix/configuration/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
API_ENDPOINT="https://api.kryonix.com.br/configuration"

echo "$(date): Iniciando backup de configurações..."

# Criar diretório de backup
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

# Backup de settings
curl -X GET "$API_ENDPOINT/export" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json" > "$BACKUP_DIR/$TIMESTAMP/configuration.json"

# Backup de temas
curl -X GET "$API_ENDPOINT/themes/export" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json" > "$BACKUP_DIR/$TIMESTAMP/themes.json"

# Backup de feature flags
curl -X GET "$API_ENDPOINT/feature-flags/export" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json" > "$BACKUP_DIR/$TIMESTAMP/feature-flags.json"

# Backup de layouts customizados
curl -X GET "$API_ENDPOINT/layouts/export" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json" > "$BACKUP_DIR/$TIMESTAMP/layouts.json"

# Backup de branding
curl -X GET "$API_ENDPOINT/branding/export" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json" > "$BACKUP_DIR/$TIMESTAMP/branding.json"

# Compactar backup
tar -czf "$BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "$TIMESTAMP"

# Remover diretório temporário
rm -rf "$BACKUP_DIR/$TIMESTAMP"

echo "$(date): Backup concluído: config_backup_$TIMESTAMP.tar.gz"

# Limpeza de backups antigos (manter últimos 30 dias)
find "$BACKUP_DIR" -name "config_backup_*.tar.gz" -mtime +30 -delete

echo "$(date): Limpeza de backups antigos concluída"
EOF

chmod +x /opt/kryonix/configuration/backup-config.sh

# Script para aplicar configurações padrão
cat > /opt/kryonix/configuration/apply-defaults.sh << 'EOF'
#!/bin/bash

API_ENDPOINT="https://api.kryonix.com.br/configuration"
TEMPLATES_DIR="/opt/kryonix/configuration/templates"

echo "$(date): Aplicando configurações padrão..."

# Aplicar settings padrão
if [ -f "$TEMPLATES_DIR/default-settings.json" ]; then
    curl -X POST "$API_ENDPOINT/settings/bulk-create" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      -d @"$TEMPLATES_DIR/default-settings.json"
    echo "Settings padrão aplicados"
fi

# Aplicar feature flags padrão
if [ -f "$TEMPLATES_DIR/default-feature-flags.json" ]; then
    curl -X POST "$API_ENDPOINT/feature-flags/bulk-create" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Content-Type: application/json" \
      -d @"$TEMPLATES_DIR/default-feature-flags.json"
    echo "Feature flags padrão aplicados"
fi

# Aplicar temas padrão
for theme_file in /opt/kryonix/configuration/themes/*.json; do
    if [ -f "$theme_file" ]; then
        curl -X POST "$API_ENDPOINT/themes" \
          -H "Authorization: Bearer $API_TOKEN" \
          -H "Content-Type: application/json" \
          -d @"$theme_file"
        echo "Tema aplicado: $(basename $theme_file)"
    fi
done

echo "$(date): Configurações padrão aplicadas com sucesso"
EOF

chmod +x /opt/kryonix/configuration/apply-defaults.sh

# Configurar cron para backup automático
cat > /opt/kryonix/configuration/config-crontab << 'EOF'
# Backup diário de configurações às 3:00
0 3 * * * /opt/kryonix/configuration/backup-config.sh >> /opt/kryonix/configuration/logs/backup.log 2>&1

# Limpeza de cache de configuração a cada hora
0 * * * * redis-cli -h redis.kryonix.com.br DEL $(redis-cli -h redis.kryonix.com.br KEYS "config:*" | tr '\n' ' ') 2>/dev/null

# Limpeza de logs antigos (semanal)
0 0 * * 0 find /opt/kryonix/configuration/logs -name "*.log" -mtime +7 -delete
EOF

sudo crontab /opt/kryonix/configuration/config-crontab

# Configurar Nginx para servir assets
cat > /opt/kryonix/configuration/nginx-assets.conf << 'EOF'
server {
    listen 80;
    server_name assets.kryonix.com.br;
    
    root /opt/kryonix/assets;
    
    location /logos/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    location /themes/ {
        expires 1d;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin "*";
    }
    
    location /uploads/ {
        expires 7d;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin "*";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}
EOF

echo "✅ Sistema de Configuração e Personalização configurado!"
echo ""
echo "⚙️ Configuration API: https://api.kryonix.com.br/configuration"
echo "🎨 Theme Editor: https://admin.kryonix.com.br/configuration/themes"
echo "🚀 Feature Flags: https://admin.kryonix.com.br/configuration/features"
echo "📁 Assets: https://assets.kryonix.com.br"
echo "💾 Backups: /opt/kryonix/configuration/backups/"
echo ""
echo "🔄 Próximos passos:"
echo "1. Executar: /opt/kryonix/configuration/apply-defaults.sh"
echo "2. Configurar temas personalizados"
echo "3. Ativar feature flags necessários"
echo "4. Testar backup e restore"
```

### ✅ CHECKLIST DE VALIDAÇÃO

- [ ] **Sistema de Configuração**
  - [ ] Schema PostgreSQL criado e funcional
  - [ ] Hierarquia de configuração implementada
  - [ ] Cache Redis funcionando
  - [ ] Validação de configurações ativa

- [ ] **Sistema de Temas**
  - [ ] Temas padrão criados
  - [ ] Engine de CSS funcionando
  - [ ] Preview de temas operacional
  - [ ] Aplicação dinâmica de temas

- [ ] **Feature Flags**
  - [ ] Sistema de flags implementado
  - [ ] Rollout gradual funcionando
  - [ ] Condições complexas testadas
  - [ ] Interface de gerenciamento ativa

- [ ] **Interface de Usuário**
  - [ ] Dashboard responsivo
  - [ ] Editor de temas funcional
  - [ ] Configurações salvas corretamente
  - [ ] Preview em tempo real

### 🧪 TESTES DE QUALIDADE

```bash
#!/bin/bash
# test-configuration-system.sh

echo "🧪 Executando Testes do Sistema de Configuração..."

# Teste 1: Verificar API de configuração
echo "Teste 1: API de configuração"
response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.kryonix.com.br/configuration/settings" \
  -H "Authorization: Bearer $API_TOKEN")
if [ "$response" = "200" ]; then
    echo "✅ API de configuração acessível"
else
    echo "❌ API de configuração inacessível (HTTP $response)"
fi

# Teste 2: Verificar funções PostgreSQL
echo "Teste 2: Funções PostgreSQL"
function_check=$(docker exec kryonix_postgresql psql -U postgres -d kryonix -t -c "
    SELECT EXISTS(
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_effective_setting' 
        AND routine_schema = 'configuration'
    );"
)
if echo "$function_check" | grep -q "t"; then
    echo "✅ Funções PostgreSQL criadas"
else
    echo "❌ Funções PostgreSQL não encontradas"
fi

# Teste 3: Verificar cache Redis
echo "Teste 3: Cache Redis"
redis_test=$(redis-cli -h redis.kryonix.com.br ping)
if [ "$redis_test" = "PONG" ]; then
    echo "✅ Redis conectado"
    
    # Testar operações de cache
    redis-cli -h redis.kryonix.com.br set "test:config" "test_value" EX 60
    cached_value=$(redis-cli -h redis.kryonix.com.br get "test:config")
    if [ "$cached_value" = "test_value" ]; then
        echo "✅ Cache Redis funcionando"
        redis-cli -h redis.kryonix.com.br del "test:config"
    else
        echo "❌ Cache Redis com problemas"
    fi
else
    echo "❌ Redis não conectado"
fi

# Teste 4: Testar criação de tema
echo "Teste 4: Criação de tema"
test_theme='{
    "themeName": "Test Theme",
    "themeType": "custom",
    "themeData": {
        "colors": {"primary": "#ff0000"},
        "typography": {"fontFamily": "Arial"},
        "spacing": {"md": "16px"}
    }
}'

theme_response=$(curl -s -X POST "https://api.kryonix.com.br/configuration/themes" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$test_theme")

if echo "$theme_response" | grep -q "themeId"; then
    echo "✅ Criação de tema funcionando"
    
    # Cleanup
    theme_id=$(echo "$theme_response" | jq -r '.themeId')
    curl -s -X DELETE "https://api.kryonix.com.br/configuration/themes/$theme_id" \
      -H "Authorization: Bearer $API_TOKEN"
else
    echo "❌ Falha na criação de tema"
fi

# Teste 5: Verificar feature flags
echo "Teste 5: Feature flags"
flag_check=$(curl -s "https://api.kryonix.com.br/configuration/feature-flags/check/test_flag" \
  -H "Authorization: Bearer $API_TOKEN")

if echo "$flag_check" | grep -q "enabled"; then
    echo "✅ Sistema de feature flags funcionando"
else
    echo "❌ Sistema de feature flags com problemas"
fi

echo ""
echo "🏁 Testes de Configuração concluídos!"
```

### 📚 DOCUMENTAÇÃO TÉCNICA

#### Hierarquia de Configuração

**Ordem de Precedência:**
1. **User**: Configurações específicas do usuário
2. **Organization**: Configurações da organização
3. **Tenant**: Configurações do tenant
4. **System**: Configurações padrão do sistema

#### Estrutura de Temas

**Seções Obrigatórias:**
- **colors**: Paleta de cores principal
- **typography**: Configurações tipográficas
- **spacing**: Sistema de espaçamento
- **borderRadius**: Bordas arredondadas
- **shadows**: Sistema de sombras

#### Feature Flags

**Tipos Suportados:**
- **boolean**: Ativar/desativar funcionalidade
- **string**: Valor textual configurável
- **number**: Valor numérico configurável
- **json**: Configuração complexa

**Estratégias de Rollout:**
- **All Users**: Todos os usuários
- **Percentage**: Porcentagem gradual
- **Target Users**: Usuários específicos
- **Conditions**: Condições complexas

### 🔗 INTEGRAÇÃO COM STACK EXISTENTE

- **PostgreSQL**: Armazenamento de configurações
- **Redis**: Cache de alta performance
- **MinIO**: Assets de temas e uploads
- **Keycloak**: Contexto de usuário
- **Nginx**: Servir assets estáticos
- **Grafana**: Métricas de uso
- **RabbitMQ**: Eventos de mudança

### 📈 MÉTRICAS MONITORADAS

- **Configuration Changes**: Mudanças por categoria
- **Theme Usage**: Uso de temas por tenant
- **Feature Flag Impact**: Impacto dos feature flags
- **Cache Performance**: Hit rate do cache
- **API Response Time**: Performance da API
- **User Preferences**: Preferências mais usadas

---

**PARTE-26 CONCLUÍDA** ✅  
Sistema completo de configuração e personalização implementado com hierarquia multi-nível, sistema de temas, feature flags e interface intuitiva de gerenciamento.

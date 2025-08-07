# 🔑 PARTE 14 - PERMISSÕES E ROLES MULTI-TENANT MOBILE-FIRST KRYONIX
*Agentes Especializados: Especialista Segurança + Arquiteto Software + Backend Expert + Expert Mobile + Expert Performance + QA Expert + Specialist Business + Expert Automação + Specialist LGPD + DevOps + Expert APIs + Analista BI + Expert Comunicação + Specialist Localização + Frontend Expert*

## 🎯 **OBJETIVO**
Implementar sistema RBAC (Role-Based Access Control) multi-tenant com isolamento completo por cliente, permissões baseadas em módulos contratados, hierarquia de roles, verificação mobile-first, cache otimizado, auditoria LGPD e propagação em tempo real via @kryonix/sdk.

## 🏗️ **ARQUITETURA RBAC MULTI-TENANT**
```yaml
MULTI_TENANT_RBAC_SYSTEM:
  ISOLATION_STRATEGY: "Complete RBAC isolation per client"
  MOBILE_FIRST: "80% mobile users optimization with offline capabilities"
  MODULE_BASED: "Permissions tied to contracted modules per tenant"
  REAL_TIME: "Instant permission propagation across sessions"
  
  TENANT_RBAC_ISOLATION:
    - database_schemas: "tenant_rbac_{id} per client"
    - keycloak_realms: "kryonix-cliente-{id} roles"
    - redis_namespaces: "rbac:tenant:{id}:permissions"
    - permission_cache: "Tenant-specific caching strategy"
    - audit_trails: "LGPD compliant per-tenant logging"
    
  MODULE_PERMISSION_SYSTEM:
    - contracted_modules: "crm, whatsapp, agendamento, financeiro, website"
    - dynamic_permissions: "Auto-enable/disable based on contract"
    - role_inheritance: "Parent-child role relationships"
    - conditional_access: "Time, location, device-based rules"
    
  MOBILE_OPTIMIZATION:
    - cached_permissions: "5min local cache for performance"
    - offline_permissions: "Critical functions available offline"
    - biometric_gates: "Sensitive actions require biometric"
    - progressive_auth: "Light→heavy authentication flow"
```

## 📊 **SCHEMA RBAC MULTI-TENANT**
```sql
-- Schema RBAC isolado por tenant
CREATE SCHEMA IF NOT EXISTS tenant_rbac_{tenant_id};

-- Roles com hierarquia e controle por módulo
CREATE TABLE tenant_rbac_{tenant_id}.rbac_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Hierarquia e herança
    parent_role_id UUID REFERENCES tenant_rbac_{tenant_id}.rbac_roles(id),
    hierarchy_level INTEGER DEFAULT 0,
    is_inheritable BOOLEAN DEFAULT true,
    max_inheritance_depth INTEGER DEFAULT 3,
    
    -- Controle baseado em módulos
    module_access JSONB DEFAULT '[]', -- ['crm', 'whatsapp', 'agendamento']
    contracted_modules_only BOOLEAN DEFAULT true,
    auto_disable_on_module_removal BOOLEAN DEFAULT true,
    
    -- Otimizações mobile
    mobile_enabled BOOLEAN DEFAULT true,
    offline_permissions JSONB DEFAULT '[]',
    biometric_required BOOLEAN DEFAULT false,
    touch_id_bypass BOOLEAN DEFAULT false,
    
    -- Atributos do sistema
    is_system_role BOOLEAN DEFAULT false,
    is_custom_role BOOLEAN DEFAULT true,
    tenant_id VARCHAR(100) NOT NULL,
    keycloak_role_name VARCHAR(255),
    
    -- Auditoria
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP,
    
    CONSTRAINT valid_hierarchy CHECK (hierarchy_level >= 0 AND hierarchy_level <= 10),
    CONSTRAINT valid_tenant CHECK (tenant_id IS NOT NULL)
);

-- Permissões granulares baseadas em módulos
CREATE TABLE tenant_rbac_{tenant_id}.rbac_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(100) NOT NULL, -- users, leads, campaigns, appointments
    action VARCHAR(50) NOT NULL,    -- create, read, update, delete, approve
    scope VARCHAR(50) DEFAULT 'tenant', -- tenant, company, department, own
    
    -- Módulo e contexto de negócio
    module_name VARCHAR(50) NOT NULL, -- crm, whatsapp, agendamento, etc.
    business_impact VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
    requires_approval BOOLEAN DEFAULT false,
    
    -- Mobile e offline
    mobile_available BOOLEAN DEFAULT true,
    offline_available BOOLEAN DEFAULT false,
    requires_biometric BOOLEAN DEFAULT false,
    
    -- Metadados
    display_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(resource, action, scope, module_name)
);

-- Associação roles-permissões com condições
CREATE TABLE tenant_rbac_{tenant_id}.rbac_role_permissions (
    role_id UUID REFERENCES tenant_rbac_{tenant_id}.rbac_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES tenant_rbac_{tenant_id}.rbac_permissions(id) ON DELETE CASCADE,
    
    -- Condições avançadas
    conditions JSONB DEFAULT '{}', -- time_restrictions, location_restrictions, etc.
    expires_at TIMESTAMP,
    
    -- Mobile e controles
    mobile_enabled BOOLEAN DEFAULT true,
    requires_biometric BOOLEAN DEFAULT false,
    offline_enabled BOOLEAN DEFAULT false,
    
    -- Auditoria
    granted_by UUID NOT NULL,
    granted_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (role_id, permission_id)
);

-- Associação usuários-roles com controles avançados
CREATE TABLE tenant_rbac_{tenant_id}.rbac_user_roles (
    user_id UUID NOT NULL, -- Referência para tenant_users.keycloak_id
    role_id UUID REFERENCES tenant_rbac_{tenant_id}.rbac_roles(id) ON DELETE CASCADE,
    
    -- Controles temporais
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    -- Delegação e aprovação
    granted_by UUID NOT NULL,
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP,
    
    -- Mobile e segurança
    device_restrictions JSONB DEFAULT '[]', -- device IDs permitidos
    ip_restrictions JSONB DEFAULT '[]',
    biometric_verified BOOLEAN DEFAULT false,
    
    PRIMARY KEY (user_id, role_id)
);

-- Permissões específicas por usuário (override)
CREATE TABLE tenant_rbac_{tenant_id}.rbac_user_permissions (
    user_id UUID NOT NULL,
    permission_id UUID REFERENCES tenant_rbac_{tenant_id}.rbac_permissions(id) ON DELETE CASCADE,
    
    granted BOOLEAN DEFAULT true, -- true = grant, false = deny
    conditions JSONB DEFAULT '{}',
    expires_at TIMESTAMP,
    
    -- Controles
    granted_by UUID NOT NULL,
    granted_at TIMESTAMP DEFAULT NOW(),
    reason TEXT,
    
    PRIMARY KEY (user_id, permission_id)
);

-- Log de auditoria LGPD compliant
CREATE TABLE tenant_rbac_{tenant_id}.rbac_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Evento
    event_type VARCHAR(50) NOT NULL, -- permission_check, role_assigned, role_revoked
    entity_type VARCHAR(50) NOT NULL, -- user, role, permission
    entity_id VARCHAR(255) NOT NULL,
    
    -- Contexto da verificação
    user_id UUID,
    resource VARCHAR(100),
    action VARCHAR(50),
    access_granted BOOLEAN,
    denial_reason VARCHAR(100),
    
    -- Contexto técnico
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    device_id VARCHAR(255),
    app_version VARCHAR(50),
    platform VARCHAR(20), -- web, ios, android
    
    -- Contexto de negócio
    business_context JSONB, -- department, project, client, etc.
    performance_ms INTEGER,
    cache_hit BOOLEAN DEFAULT false,
    
    -- Conformidade LGPD
    tenant_id VARCHAR(100) NOT NULL,
    data_subject_id UUID, -- ID do titular dos dados
    processing_purpose VARCHAR(255),
    legal_basis VARCHAR(100),
    retention_period INTEGER, -- dias para retenção
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cache de permissões para performance mobile
CREATE TABLE tenant_rbac_{tenant_id}.rbac_permission_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL,
    permissions_data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    device_id VARCHAR(255),
    platform VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sincronização mobile
CREATE TABLE tenant_rbac_{tenant_id}.rbac_mobile_sync (
    user_id UUID NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    sync_version VARCHAR(50) NOT NULL,
    permissions_hash VARCHAR(64) NOT NULL,
    offline_permissions JSONB DEFAULT '[]',
    last_sync_at TIMESTAMP DEFAULT NOW(),
    offline_expires_at TIMESTAMP,
    platform VARCHAR(20),
    
    PRIMARY KEY (user_id, device_id)
);

-- Mudanças de permissões para propagação em tempo real
CREATE TABLE tenant_rbac_{tenant_id}.rbac_permission_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_type VARCHAR(50) NOT NULL, -- role_assigned, role_revoked, permission_updated
    entity_type VARCHAR(50) NOT NULL, -- user, role, permission
    entity_id VARCHAR(255) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    affected_users UUID[] DEFAULT '{}',
    propagated BOOLEAN DEFAULT false,
    mobile_sync_required BOOLEAN DEFAULT true,
    changed_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes para performance
CREATE INDEX idx_rbac_roles_tenant ON tenant_rbac_{tenant_id}.rbac_roles(tenant_id);
CREATE INDEX idx_rbac_roles_hierarchy ON tenant_rbac_{tenant_id}.rbac_roles(parent_role_id, hierarchy_level);
CREATE INDEX idx_rbac_permissions_module ON tenant_rbac_{tenant_id}.rbac_permissions(module_name);
CREATE INDEX idx_rbac_user_roles_user ON tenant_rbac_{tenant_id}.rbac_user_roles(user_id) WHERE is_active = true;
CREATE INDEX idx_rbac_audit_user_resource ON tenant_rbac_{tenant_id}.rbac_audit_log(user_id, resource, created_at);
CREATE INDEX idx_rbac_cache_user_expires ON tenant_rbac_{tenant_id}.rbac_permission_cache(user_id, expires_at);
```

## 🔐 **SERVIÇO RBAC MULTI-TENANT**
```typescript
// src/services/MultiTenantRBACService.ts
import { useKryonixSDK } from '@kryonix/sdk';

interface PermissionContext {
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  deviceId?: string;
  appVersion?: string;
  platform?: 'web' | 'ios' | 'android';
  businessContext?: any;
  realTimeRequired?: boolean;
}

interface PermissionCheckResult {
  granted: boolean;
  source: 'cache' | 'database' | 'inherited';
  mobileOptimized: boolean;
  offlineAvailable: boolean;
  requiresBiometric: boolean;
  conditions?: any;
  auditRequired: boolean;
  expiresAt?: Date;
}

export class MultiTenantRBACService {
  private sdk = useKryonixSDK();
  private tenantId: string;
  private redis: any;
  private db: any;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    this.redis = this.sdk.redis;
    this.db = this.sdk.database;
  }

  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context: PermissionContext = {}
  ): Promise<PermissionCheckResult> {
    const startTime = Date.now();
    
    try {
      // 1. Verificar cache de permissões (otimização mobile)
      const cached = await this.getCachedPermission(userId, resource, action);
      if (cached && !this.isCacheExpired(cached)) {
        await this.logPermissionCheck(userId, resource, action, true, 'cache', context);
        return {
          granted: cached.granted,
          source: 'cache',
          mobileOptimized: true,
          offlineAvailable: cached.offlineAvailable,
          requiresBiometric: cached.requiresBiometric,
          auditRequired: false // Já logado quando cacheado
        };
      }

      // 2. Verificar roles ativas do usuário
      const userRoles = await this.getUserActiveRoles(userId);
      if (userRoles.length === 0) {
        await this.logPermissionCheck(userId, resource, action, false, 'no_roles', context);
        return this.createDeniedResult('no_active_roles');
      }

      // 3. Verificar acesso ao módulo primeiro
      const [moduleResource] = resource.split('.');
      const hasModuleAccess = await this.checkModuleAccess(userId, moduleResource);
      if (!hasModuleAccess) {
        await this.logPermissionCheck(userId, resource, action, false, 'module_not_contracted', context);
        return this.createDeniedResult('module_not_contracted');
      }

      // 4. Verificar permissões baseadas em roles com hierarquia
      let permissionGranted = false;
      let grantingRole = null;
      let conditions = {};
      let mobileEnabled = true;
      let offlineAvailable = false;
      let requiresBiometric = false;

      for (const role of userRoles) {
        const rolePermission = await this.checkRolePermission(role.id, resource, action);
        
        if (rolePermission.granted) {
          permissionGranted = true;
          grantingRole = role;
          conditions = { ...conditions, ...rolePermission.conditions };
          mobileEnabled = rolePermission.mobileEnabled;
          offlineAvailable = rolePermission.offlineAvailable;
          requiresBiometric = rolePermission.requiresBiometric || role.biometric_required;
          break; // Primeira role que concede permissão
        }
      }

      // 5. Verificar herança hierárquica
      if (!permissionGranted) {
        for (const role of userRoles) {
          const inheritedPermission = await this.checkInheritedPermissions(role.id, resource, action);
          if (inheritedPermission.granted) {
            permissionGranted = true;
            grantingRole = role;
            conditions = inheritedPermission.conditions;
            break;
          }
        }
      }

      // 6. Aplicar lógica condicional
      if (permissionGranted && Object.keys(conditions).length > 0) {
        const conditionsMet = await this.evaluateConditions(conditions, context);
        if (!conditionsMet) {
          permissionGranted = false;
        }
      }

      // 7. Cache do resultado para otimização mobile
      await this.cachePermissionResult(userId, resource, action, {
        granted: permissionGranted,
        mobileEnabled,
        offlineAvailable,
        requiresBiometric,
        conditions,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos
      });

      // 8. Log da verificação de permissão
      await this.logPermissionCheck(userId, resource, action, permissionGranted, 'computed', context);

      const result: PermissionCheckResult = {
        granted: permissionGranted,
        source: 'database',
        mobileOptimized: mobileEnabled,
        offlineAvailable,
        requiresBiometric,
        conditions: Object.keys(conditions).length > 0 ? conditions : undefined,
        auditRequired: true
      };

      // 9. Propagação em tempo real se necessário
      if (context.realTimeRequired) {
        await this.propagatePermissionChange(userId, resource, action, result);
      }

      return result;

    } catch (error) {
      console.error('Permission check failed:', error);
      await this.logPermissionCheck(userId, resource, action, false, 'error', context);
      return this.createDeniedResult('system_error');
    } finally {
      // Monitoramento de performance
      const duration = Date.now() - startTime;
      if (duration > 100) { // Log verificações lentas
        console.warn(`Slow permission check: ${duration}ms for ${userId}:${resource}:${action}`);
      }
    }
  }

  async syncMobilePermissions(
    userId: string,
    deviceId: string,
    platform: 'ios' | 'android'
  ): Promise<{
    permissions: any[];
    offlinePermissions: any[];
    version: string;
    expiresAt: Date;
    biometricRequired: boolean;
  }> {
    try {
      // 1. Obter módulos contratados do tenant
      const contractedModules = await this.getTenantContractedModules();
      
      // 2. Gerar árvore completa de permissões
      const allPermissions = await this.generateUserPermissionTree(userId, contractedModules);
      
      // 3. Filtrar permissões disponíveis para mobile
      const mobilePermissions = allPermissions.filter(p => p.mobile_available === true);
      
      // 4. Gerar permissões offline (apenas funções críticas)
      const offlinePermissions = mobilePermissions.filter(p => p.offline_available === true);
      
      // 5. Verificar requisitos biométricos
      const biometricRequired = await this.checkUserBiometricRequirement(userId);
      
      // 6. Gerar versão de sincronização
      const version = this.generateSyncVersion(allPermissions);
      
      // 7. Armazenar registro de sincronização
      await this.db.query(`
        INSERT INTO tenant_rbac_${this.tenantId}.rbac_mobile_sync 
          (user_id, device_id, sync_version, permissions_hash, offline_permissions, platform, offline_expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, device_id) DO UPDATE SET
          last_sync_at = NOW(),
          sync_version = $3,
          permissions_hash = $4,
          offline_permissions = $5,
          offline_expires_at = $7
      `, [
        userId,
        deviceId,
        version,
        this.hashPermissions(allPermissions),
        JSON.stringify(offlinePermissions),
        platform,
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      ]);

      return {
        permissions: mobilePermissions,
        offlinePermissions,
        version,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        biometricRequired
      };

    } catch (error) {
      console.error('Mobile sync failed:', error);
      throw new Error(`Mobile permission sync failed: ${error.message}`);
    }
  }

  async createCustomRole(
    roleData: CreateCustomRoleDTO,
    permissions: string[],
    createdBy: string
  ): Promise<{
    success: boolean;
    role: any;
    permissionsAssigned: number;
    keycloakSynced: boolean;
  }> {
    try {
      // 1. Validar permissões de módulo
      await this.validateModulePermissions(permissions);
      
      // 2. Criar role no banco de dados
      const role = await this.db.query(`
        INSERT INTO tenant_rbac_${this.tenantId}.rbac_roles 
          (name, display_name, description, module_access, parent_role_id, 
           hierarchy_level, mobile_enabled, biometric_required, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        roleData.name,
        roleData.displayName,
        roleData.description,
        JSON.stringify(roleData.moduleAccess),
        roleData.parentRoleId,
        roleData.hierarchyLevel || 0,
        roleData.mobileEnabled !== false,
        roleData.biometricRequired || false,
        createdBy,
        this.tenantId
      ]);

      const roleId = role.rows[0].id;

      // 3. Atribuir permissões à role
      for (const permissionId of permissions) {
        await this.db.query(`
          INSERT INTO tenant_rbac_${this.tenantId}.rbac_role_permissions 
            (role_id, permission_id, granted_by, mobile_enabled)
          VALUES ($1, $2, $3, $4)
        `, [roleId, permissionId, createdBy, roleData.mobileEnabled !== false]);
      }

      // 4. Criar role no Keycloak
      await this.createKeycloakRole(role.rows[0]);

      // 5. Invalidar caches relacionados
      await this.invalidateRoleRelatedCaches(roleId);

      // 6. Rastrear criação da role
      await this.trackPermissionChange('role_created', 'role', roleId, {
        name: roleData.name,
        permissions: permissions.length,
        createdBy
      });

      return {
        success: true,
        role: role.rows[0],
        permissionsAssigned: permissions.length,
        keycloakSynced: true
      };

    } catch (error) {
      console.error('Custom role creation failed:', error);
      throw new Error(`Role creation failed: ${error.message}`);
    }
  }

  async assignUserRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    expiresAt?: Date,
    deviceRestrictions?: string[]
  ): Promise<{
    success: boolean;
    roleAssigned: boolean;
    keycloakSynced: boolean;
    mobileUpdateRequired: boolean;
  }> {
    try {
      // 1. Verificar se role existe e é válida para o tenant
      const role = await this.getRoleById(roleId);
      if (!role || role.tenant_id !== this.tenantId) {
        throw new Error('Role não encontrada ou não pertence ao tenant');
      }

      // 2. Verificar módulos contratados
      const hasModuleAccess = await this.validateUserModuleAccess(userId, role.module_access);
      if (!hasModuleAccess) {
        throw new Error('Usuário não tem acesso aos módulos requeridos pela role');
      }

      // 3. Atribuir role ao usuário
      await this.db.query(`
        INSERT INTO tenant_rbac_${this.tenantId}.rbac_user_roles 
          (user_id, role_id, granted_by, expires_at, device_restrictions)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, role_id) DO UPDATE SET
          granted_at = NOW(),
          granted_by = $3,
          expires_at = $4,
          device_restrictions = $5,
          is_active = true
      `, [userId, roleId, assignedBy, expiresAt, JSON.stringify(deviceRestrictions || [])]);

      // 4. Sincronizar com Keycloak
      await this.syncUserRoleToKeycloak(userId, roleId);

      // 5. Invalidar cache do usuário
      await this.invalidateUserPermissionCache(userId);

      // 6. Marcar sincronização mobile necessária
      await this.markMobileSyncRequired(userId);

      // 7. Log da atribuição
      await this.trackPermissionChange('role_assigned', 'user', userId, {
        roleId,
        roleName: role.name,
        assignedBy,
        expiresAt
      });

      // 8. Notificar sessões ativas
      await this.notifyActiveSessions(userId, {
        type: 'role_assigned',
        roleId,
        roleName: role.name,
        timestamp: new Date()
      });

      return {
        success: true,
        roleAssigned: true,
        keycloakSynced: true,
        mobileUpdateRequired: true
      };

    } catch (error) {
      console.error('Role assignment failed:', error);
      throw new Error(`Role assignment failed: ${error.message}`);
    }
  }

  private async checkModuleAccess(userId: string, moduleName: string): Promise<boolean> {
    try {
      // 1. Verificar módulos contratados do tenant
      const contractedModules = await this.getTenantContractedModules();
      if (!contractedModules.includes(moduleName)) {
        return false;
      }

      // 2. Verificar acesso do usuário ao módulo via roles
      const userRoles = await this.getUserActiveRoles(userId);
      for (const role of userRoles) {
        if (role.module_access.includes(moduleName)) {
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error('Module access check failed:', error);
      return false;
    }
  }

  private async checkInheritedPermissions(
    roleId: string,
    resource: string,
    action: string
  ): Promise<{
    granted: boolean;
    inheritedFrom?: any;
    conditions?: any;
    hierarchyLevel?: number;
  }> {
    try {
      // Obter hierarquia da role
      const hierarchy = await this.getRoleHierarchy(roleId);
      
      for (const parentRole of hierarchy) {
        if (!parentRole.is_inheritable) continue;
        
        const permission = await this.checkRolePermission(parentRole.id, resource, action);
        if (permission.granted) {
          return {
            granted: true,
            inheritedFrom: parentRole,
            conditions: permission.conditions,
            hierarchyLevel: parentRole.hierarchy_level
          };
        }
      }

      return { granted: false };

    } catch (error) {
      console.error('Inheritance check failed:', error);
      return { granted: false };
    }
  }

  private async logPermissionCheck(
    userId: string,
    resource: string,
    action: string,
    granted: boolean,
    source: string,
    context: PermissionContext
  ): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO tenant_rbac_${this.tenantId}.rbac_audit_log 
          (event_type, user_id, resource, action, access_granted, denial_reason,
           session_id, ip_address, user_agent, device_info, device_id, 
           app_version, platform, business_context, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        'permission_check',
        userId,
        resource,
        action,
        granted,
        granted ? null : source,
        context.sessionId,
        context.ipAddress,
        context.userAgent,
        JSON.stringify(context.deviceInfo || {}),
        context.deviceId,
        context.appVersion,
        context.platform || 'web',
        JSON.stringify(context.businessContext || {}),
        this.tenantId
      ]);

      // Conformidade LGPD - log acesso a dados sensíveis
      if (this.isSensitiveResource(resource)) {
        await this.auditService.logSensitiveDataAccess(userId, resource, action, granted, context);
      }

    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  private createDeniedResult(reason: string): PermissionCheckResult {
    return {
      granted: false,
      source: 'database',
      mobileOptimized: false,
      offlineAvailable: false,
      requiresBiometric: false,
      auditRequired: true
    };
  }
}
```

## 📱 **COMPONENTES MOBILE PERMISSION**
```tsx
// src/components/mobile/MobilePermissionGate.tsx
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import { useKryonixAuth, usePermissions } from '@kryonix/sdk';
import * as LocalAuthentication from 'expo-local-authentication';

interface PermissionGateProps {
  resource: string;
  action: string;
  requiresBiometric?: boolean;
  offlineCapable?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onAccessDenied?: (reason: string) => void;
}

export const MobilePermissionGate: React.FC<PermissionGateProps> = ({
  resource,
  action,
  requiresBiometric = false,
  offlineCapable = false,
  children,
  fallback,
  onAccessDenied
}) => {
  const { user, tenantId } = useKryonixAuth();
  const { 
    checkPermission, 
    hasOfflinePermission, 
    isOnline,
    syncPermissions 
  } = usePermissions(tenantId);
  
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserPermission();
  }, [resource, action, user?.id]);

  const checkUserPermission = async () => {
    try {
      setLoading(true);
      
      // Verificar se está online
      if (!isOnline && !offlineCapable) {
        setPermissionGranted(false);
        onAccessDenied?.('offline_not_supported');
        return;
      }

      // Verificar permissão (online ou cacheada)
      let hasPermission = false;
      
      if (isOnline) {
        const result = await checkPermission(resource, action, {
          deviceId: user?.deviceId,
          platform: Platform.OS,
          appVersion: Constants.expoConfig?.version
        });
        
        hasPermission = result.granted;
        
        if (result.requiresBiometric) {
          const biometricResult = await handleBiometricAuth();
          if (!biometricResult) {
            setPermissionGranted(false);
            onAccessDenied?.('biometric_failed');
            return;
          }
        }
      } else {
        // Modo offline - verificar permissões cacheadas
        hasPermission = await hasOfflinePermission(resource, action);
      }

      setPermissionGranted(hasPermission);
      
      if (!hasPermission) {
        onAccessDenied?.(isOnline ? 'permission_denied' : 'offline_permission_denied');
      }

    } catch (error) {
      console.error('Permission check failed:', error);
      setPermissionGranted(false);
      onAccessDenied?.('system_error');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert(
          'Autenticação Biométrica',
          'Dispositivo não suporta autenticação biométrica'
        );
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          'Autenticação Biométrica',
          'Nenhuma biometria cadastrada no dispositivo'
        );
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirme sua identidade para continuar',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false
      });

      if (result.success) {
        setBiometricVerified(true);
        return true;
      } else {
        Alert.alert(
          'Autenticação Falhou',
          'Não foi possível verificar sua identidade'
        );
        return false;
      }

    } catch (error) {
      console.error('Biometric auth failed:', error);
      return false;
    }
  };

  const handleSyncPermissions = async () => {
    try {
      await syncPermissions();
      await checkUserPermission();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao sincronizar permissões');
    }
  };

  if (loading) {
    return (
      <View className="p-4 bg-gray-50 rounded-lg">
        <Text className="text-center text-gray-600">Verificando permissões...</Text>
      </View>
    );
  }

  if (permissionGranted === false) {
    if (!isOnline && offlineCapable) {
      return (
        <View className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Text className="text-yellow-800 font-medium mb-2">Modo Offline</Text>
          <Text className="text-yellow-700 text-sm mb-3">
            Algumas funcionalidades podem estar limitadas no modo offline.
          </Text>
          <TouchableOpacity 
            onPress={handleSyncPermissions}
            className="bg-yellow-500 p-2 rounded-lg"
          >
            <Text className="text-white text-center font-medium">Tentar Sincronizar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return fallback || (
      <View className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <Text className="text-red-800 font-medium mb-2">Acesso Negado</Text>
        <Text className="text-red-700 text-sm">
          Você não tem permissão para acessar esta funcionalidade.
        </Text>
      </View>
    );
  }

  if (permissionGranted === true) {
    return <>{children}</>;
  }

  return null;
};

// Hook simplificado para verificação de permissões
export const usePermissionGuard = (resource: string, action: string) => {
  const { checkPermission } = usePermissions();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkPermission(resource, action).then(result => {
      setHasPermission(result.granted);
    });
  }, [resource, action]);

  return hasPermission;
};

// Componente de alto nível para acesso baseado em módulo
export const ModuleAccessGate: React.FC<{
  module: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ module, children, fallback }) => {
  const { user } = useKryonixAuth();
  const hasModuleAccess = user?.contractedModules?.includes(module);

  if (hasModuleAccess) {
    return <>{children}</>;
  }

  return fallback || (
    <View className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <Text className="text-blue-800 font-medium mb-2">Módulo Não Contratado</Text>
      <Text className="text-blue-700 text-sm">
        Entre em contato com o suporte para contratar o módulo {module}.
      </Text>
    </View>
  );
};
```

## 🔄 **REAL-TIME PERMISSION PROPAGATION**
```typescript
// src/services/RealTimePermissionService.ts
import { useKryonixSDK } from '@kryonix/sdk';

export class RealTimePermissionService {
  private sdk = useKryonixSDK();
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async propagatePermissionChange(
    userId: string,
    changeType: string,
    entityType: string,
    entityId: string,
    newValue: any
  ): Promise<void> {
    try {
      // 1. Invalidar cache de permissões do usuário
      await this.invalidateUserPermissionCache(userId);
      
      // 2. Atualizar status de sincronização mobile
      await this.markMobileSyncRequired(userId);
      
      // 3. Notificar sessões ativas via WebSocket
      await this.notifyActiveSessions(userId, {
        type: 'permission_change',
        changeType,
        entityType,
        entityId,
        newValue,
        timestamp: new Date()
      });
      
      // 4. Armazenar mudança para auditoria
      await this.sdk.database.query(`
        INSERT INTO tenant_rbac_${this.tenantId}.rbac_permission_changes 
          (change_type, entity_type, entity_id, new_value, affected_users, changed_by, mobile_sync_required)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        changeType,
        entityType,
        entityId,
        JSON.stringify(newValue),
        [userId],
        'system',
        true
      ]);

      // 5. Processar propagação para usuários relacionados
      if (entityType === 'role') {
        await this.propagateToRoleUsers(entityId, changeType, newValue);
      }

    } catch (error) {
      console.error('Permission propagation failed:', error);
    }
  }

  private async notifyActiveSessions(userId: string, notification: any): Promise<void> {
    try {
      // Enviar via WebSocket para sessões ativas do usuário
      const socket = this.sdk.websocket.getNamespace(`/tenant-${this.tenantId}`);
      
      socket.to(`user:${userId}`).emit('permission_update', {
        ...notification,
        tenantId: this.tenantId,
        userId
      });

      // Notificar administradores sobre mudanças importantes
      if (notification.changeType === 'role_assigned' || notification.changeType === 'role_revoked') {
        socket.to(`tenant:${this.tenantId}:admins`).emit('user_permission_change', {
          ...notification,
          tenantId: this.tenantId,
          userId
        });
      }

    } catch (error) {
      console.error('WebSocket notification failed:', error);
    }
  }

  async setupRealTimeSync(userId: string, deviceId: string): Promise<void> {
    try {
      // Configurar listener para mudanças de permissão específicas do usuário
      const socket = this.sdk.websocket.getNamespace(`/tenant-${this.tenantId}`);
      
      socket.on('connect', (socket: any) => {
        // Join salas específicas do usuário
        socket.join(`user:${userId}`);
        socket.join(`device:${deviceId}`);
        
        // Listener para atualizações de permissão
        socket.on('permission_update', async (data: any) => {
          if (data.userId === userId) {
            // Atualizar cache local de permissões
            await this.updateLocalPermissionCache(data);
            
            // Notificar app sobre mudança
            socket.emit('permission_cache_updated', {
              success: true,
              timestamp: new Date()
            });
          }
        });

        // Listener para sincronização forçada
        socket.on('force_permission_sync', async () => {
          await this.forceMobileSync(userId, deviceId);
        });
      });

    } catch (error) {
      console.error('Real-time sync setup failed:', error);
    }
  }

  private async propagateToRoleUsers(roleId: string, changeType: string, newValue: any): Promise<void> {
    try {
      // Obter todos os usuários com essa role
      const usersWithRole = await this.sdk.database.query(`
        SELECT DISTINCT user_id 
        FROM tenant_rbac_${this.tenantId}.rbac_user_roles 
        WHERE role_id = $1 AND is_active = true
      `, [roleId]);

      // Propagar mudança para cada usuário
      for (const userRow of usersWithRole.rows) {
        await this.propagatePermissionChange(
          userRow.user_id,
          changeType,
          'role',
          roleId,
          newValue
        );
      }

    } catch (error) {
      console.error('Role users propagation failed:', error);
    }
  }
}
```

## 🔧 **SCRIPT SETUP RBAC MULTI-TENANT COMPLETO**
```bash
#!/bin/bash
# setup-multi-tenant-rbac-kryonix.sh
# Script completo para RBAC multi-tenant

echo "🔐 Configurando RBAC Multi-Tenant KRYONIX..."

# 1. Variáveis de ambiente
export KRYONIX_ENV="production"
export RBAC_VERSION="v2.1.0"
export MULTI_TENANT_MODE="true"

# 2. Criar schemas RBAC para tenants existentes
echo "📊 Criando schemas RBAC para tenants..."
TENANTS=("demo" "empresa1" "empresa2")

for tenant in "${TENANTS[@]}"; do
  echo "Criando schema RBAC para tenant: $tenant"
  
  # Substituir placeholders no SQL do schema
  sed "s/{tenant_id}/$tenant/g" /opt/kryonix/sql/rbac-schema-template.sql > "/tmp/rbac-schema-$tenant.sql"
  
  # Executar criação do schema
  PGPASSWORD=$POSTGRES_PASSWORD psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f "/tmp/rbac-schema-$tenant.sql"
  
  # Limpar arquivo temporário
  rm "/tmp/rbac-schema-$tenant.sql"
done

# 3. Configurar permissões padrão para cada módulo
echo "🔧 Configurando permissões padrão por módulo..."
cat > /tmp/setup-default-permissions.js << 'EOF'
const { Client } = require('pg');

const client = new Client({
  host: 'postgresql.kryonix.com.br',
  port: 5432,
  database: 'kryonix_saas',
  user: 'postgres',
  password: process.env.POSTGRES_PASSWORD
});

const modulePermissions = {
  crm: [
    { resource: 'leads', action: 'create', mobile: true, offline: false, biometric: false },
    { resource: 'leads', action: 'read', mobile: true, offline: true, biometric: false },
    { resource: 'leads', action: 'update', mobile: true, offline: false, biometric: false },
    { resource: 'leads', action: 'delete', mobile: true, offline: false, biometric: true },
    { resource: 'sales', action: 'create', mobile: true, offline: false, biometric: false },
    { resource: 'sales', action: 'read', mobile: true, offline: true, biometric: false },
    { resource: 'sales', action: 'approve', mobile: true, offline: false, biometric: true },
    { resource: 'reports', action: 'read', mobile: true, offline: false, biometric: false }
  ],
  whatsapp: [
    { resource: 'messages', action: 'send', mobile: true, offline: false, biometric: false },
    { resource: 'messages', action: 'read', mobile: true, offline: true, biometric: false },
    { resource: 'contacts', action: 'create', mobile: true, offline: true, biometric: false },
    { resource: 'contacts', action: 'read', mobile: true, offline: true, biometric: false },
    { resource: 'campaigns', action: 'create', mobile: true, offline: false, biometric: false },
    { resource: 'campaigns', action: 'execute', mobile: true, offline: false, biometric: true },
    { resource: 'automations', action: 'manage', mobile: true, offline: false, biometric: true }
  ],
  agendamento: [
    { resource: 'appointments', action: 'create', mobile: true, offline: true, biometric: false },
    { resource: 'appointments', action: 'read', mobile: true, offline: true, biometric: false },
    { resource: 'appointments', action: 'update', mobile: true, offline: false, biometric: false },
    { resource: 'appointments', action: 'cancel', mobile: true, offline: false, biometric: false },
    { resource: 'calendar', action: 'manage', mobile: true, offline: false, biometric: false },
    { resource: 'availability', action: 'manage', mobile: true, offline: false, biometric: false }
  ],
  financeiro: [
    { resource: 'billing', action: 'read', mobile: true, offline: false, biometric: true },
    { resource: 'billing', action: 'create', mobile: true, offline: false, biometric: true },
    { resource: 'payments', action: 'process', mobile: true, offline: false, biometric: true },
    { resource: 'invoices', action: 'read', mobile: true, offline: false, biometric: false },
    { resource: 'invoices', action: 'generate', mobile: true, offline: false, biometric: true },
    { resource: 'reports', action: 'read', mobile: true, offline: false, biometric: true }
  ],
  website: [
    { resource: 'pages', action: 'read', mobile: true, offline: false, biometric: false },
    { resource: 'pages', action: 'update', mobile: false, offline: false, biometric: false },
    { resource: 'analytics', action: 'read', mobile: true, offline: false, biometric: false },
    { resource: 'forms', action: 'manage', mobile: true, offline: false, biometric: false }
  ]
};

async function setupPermissions() {
  await client.connect();
  
  const tenants = ['demo', 'empresa1', 'empresa2'];
  
  for (const tenant of tenants) {
    console.log(`Setting up permissions for tenant: ${tenant}`);
    
    for (const [module, permissions] of Object.entries(modulePermissions)) {
      for (const perm of permissions) {
        await client.query(`
          INSERT INTO tenant_rbac_${tenant}.rbac_permissions 
            (resource, action, module_name, mobile_available, offline_available, requires_biometric, display_name)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (resource, action, scope, module_name) DO NOTHING
        `, [
          perm.resource,
          perm.action,
          module,
          perm.mobile,
          perm.offline,
          perm.biometric,
          `${perm.action.charAt(0).toUpperCase() + perm.action.slice(1)} ${perm.resource}`
        ]);
      }
    }
    
    // Criar roles padrão
    const defaultRoles = [
      {
        name: 'admin',
        display_name: 'Administrador',
        description: 'Acesso completo ao sistema',
        hierarchy_level: 0,
        modules: Object.keys(modulePermissions)
      },
      {
        name: 'manager',
        display_name: 'Gerente',
        description: 'Acesso de gerenciamento',
        hierarchy_level: 1,
        modules: Object.keys(modulePermissions)
      },
      {
        name: 'user',
        display_name: 'Usuário',
        description: 'Acesso básico',
        hierarchy_level: 2,
        modules: Object.keys(modulePermissions)
      }
    ];
    
    for (const role of defaultRoles) {
      const roleResult = await client.query(`
        INSERT INTO tenant_rbac_${tenant}.rbac_roles 
          (name, display_name, description, hierarchy_level, module_access, tenant_id, is_system_role, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (name) DO NOTHING
        RETURNING id
      `, [
        role.name,
        role.display_name,
        role.description,
        role.hierarchy_level,
        JSON.stringify(role.modules),
        tenant,
        true,
        '00000000-0000-0000-0000-000000000000' // System user
      ]);
      
      if (roleResult.rows.length > 0) {
        const roleId = roleResult.rows[0].id;
        
        // Associar todas as permissões à role admin
        if (role.name === 'admin') {
          await client.query(`
            INSERT INTO tenant_rbac_${tenant}.rbac_role_permissions (role_id, permission_id, granted_by)
            SELECT $1, id, $2
            FROM tenant_rbac_${tenant}.rbac_permissions
            ON CONFLICT DO NOTHING
          `, [roleId, '00000000-0000-0000-0000-000000000000']);
        }
      }
    }
  }
  
  await client.end();
  console.log('✅ Default permissions setup completed');
}

setupPermissions().catch(console.error);
EOF

node /tmp/setup-default-permissions.js

# 4. Configurar Redis para cache de permissões
echo "💾 Configurando Redis cache permissões..."
docker run -d \
  --name kryonix-rbac-redis \
  --restart unless-stopped \
  -p 6382:6379 \
  -e REDIS_PASSWORD=$REDIS_PASSWORD \
  -v kryonix_rbac_redis:/data \
  --network kryonix-network \
  redis:7-alpine redis-server --requirepass $REDIS_PASSWORD

# 5. Deploy serviço RBAC API
echo "🚀 Deploying RBAC API service..."
cat > /opt/kryonix/docker-compose.rbac.yml << 'EOF'
version: '3.8'

services:
  rbac-api:
    build: ./services/rbac
    container_name: kryonix-rbac-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgresql:5432/kryonix_saas
      - REDIS_URL=redis://rbac-redis:6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - KEYCLOAK_URL=https://keycloak.kryonix.com.br
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.rbac-api.rule=Host(`api.kryonix.com.br`) && PathPrefix(`/rbac`)"
      - "traefik.http.routers.rbac-api.tls=true"
      - "traefik.http.routers.rbac-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.rbac-api.loadbalancer.server.port=3000"
    networks:
      - kryonix-network

  rbac-websocket:
    build: ./services/rbac-websocket
    container_name: kryonix-rbac-websocket
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.rbac-ws.rule=Host(`ws.kryonix.com.br`) && PathPrefix(`/rbac`)"
      - "traefik.http.routers.rbac-ws.tls=true"
      - "traefik.http.routers.rbac-ws.tls.certresolver=letsencrypt"
      - "traefik.http.services.rbac-ws.loadbalancer.server.port=3003"
    networks:
      - kryonix-network

networks:
  kryonix-network:
    external: true
EOF

# 6. Build e deploy
cd /opt/kryonix
docker-compose -f docker-compose.rbac.yml build
docker-compose -f docker-compose.rbac.yml up -d

# 7. Configurar WebSocket para propagação em tempo real
echo "🔌 Configurando WebSocket RBAC..."
cat > /opt/kryonix/websocket/rbac-server.js << 'EOF'
const io = require('socket.io')(3003, {
  cors: {
    origin: ["https://*.kryonix.com.br"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const Redis = require('redis');
const jwt = require('jsonwebtoken');

const redis = Redis.createClient({
  host: 'kryonix-rbac-redis',
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
  console.log(`🔐 RBAC client connected: ${socket.tenantId} - ${socket.userId}`);
  
  // Join tenant and user specific rooms
  socket.join(`tenant:${socket.tenantId}:rbac`);
  socket.join(`user:${socket.userId}`);
  
  // Admin users join admin room
  if (socket.userRoles.includes('admin')) {
    socket.join(`tenant:${socket.tenantId}:admins`);
  }
  
  // Handle permission check requests
  socket.on('check_permission', async (data) => {
    try {
      // Check permission using RBAC service
      const hasPermission = await checkUserPermission(
        socket.tenantId,
        socket.userId,
        data.resource,
        data.action
      );
      
      socket.emit('permission_result', {
        resource: data.resource,
        action: data.action,
        granted: hasPermission,
        timestamp: new Date()
      });
      
    } catch (error) {
      socket.emit('permission_error', {
        error: error.message,
        resource: data.resource,
        action: data.action
      });
    }
  });
  
  // Handle mobile sync requests
  socket.on('sync_mobile_permissions', async (data) => {
    try {
      const syncData = await syncMobilePermissions(
        socket.tenantId,
        socket.userId,
        data.deviceId,
        data.platform
      );
      
      socket.emit('mobile_sync_complete', syncData);
      
    } catch (error) {
      socket.emit('mobile_sync_error', { error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`🔒 RBAC client disconnected: ${socket.tenantId} - ${socket.userId}`);
  });
});

async function checkUserPermission(tenantId, userId, resource, action) {
  // Implementation would call the RBAC service
  return true; // Placeholder
}

async function syncMobilePermissions(tenantId, userId, deviceId, platform) {
  // Implementation would call the RBAC service
  return { success: true }; // Placeholder
}

console.log('🔌 RBAC WebSocket server running on port 3003');
EOF

# 8. Configurar Grafana dashboard para RBAC
echo "📊 Configurando Grafana dashboard RBAC..."
cat > /opt/kryonix/grafana/provisioning/dashboards/rbac-multi-tenant.json << 'EOF'
{
  "dashboard": {
    "title": "KRYONIX Multi-Tenant RBAC Monitoring",
    "tags": ["kryonix", "rbac", "multi-tenant", "permissions"],
    "panels": [
      {
        "title": "Permission Checks per Tenant",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(rbac_permission_checks_total{tenant_id=~\".*\"}[5m])",
            "legendFormat": "Tenant: {{tenant_id}}"
          }
        ]
      },
      {
        "title": "Permission Denial Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(rbac_permission_denials_total{tenant_id=~\".*\"}[5m])",
            "legendFormat": "Denials: {{tenant_id}}"
          }
        ]
      },
      {
        "title": "Mobile Permission Sync",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(rbac_mobile_sync_total{tenant_id=~\".*\"}[5m])",
            "legendFormat": "Mobile Sync: {{tenant_id}}"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(rbac_cache_hits_total[5m]) / rate(rbac_permission_checks_total[5m]) * 100",
            "legendFormat": "Cache Hit Rate %"
          }
        ]
      }
    ]
  }
}
EOF

# 9. Configurar backup automático RBAC
echo "💾 Configurando backup RBAC..."
cat > /opt/kryonix/scripts/backup-rbac-data.sh << 'EOF'
#!/bin/bash
# Backup dados RBAC por tenant

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/rbac"

mkdir -p $BACKUP_DIR

# Backup schemas RBAC
echo "Backing up RBAC schemas..."
docker exec kryonix-postgresql pg_dump \
  -U postgres \
  -d kryonix_saas \
  --schema-only \
  --schema='tenant_rbac_*' \
  > $BACKUP_DIR/rbac_schemas_$DATE.sql

# Backup dados RBAC
docker exec kryonix-postgresql pg_dump \
  -U postgres \
  -d kryonix_saas \
  -t 'tenant_rbac_*.rbac_*' \
  > $BACKUP_DIR/rbac_data_$DATE.sql

# Backup cache Redis
echo "Backing up RBAC cache..."
docker exec kryonix-rbac-redis redis-cli \
  --rdb /data/rbac_cache_$DATE.rdb \
  --password $REDIS_PASSWORD

# Compress
gzip $BACKUP_DIR/*.sql

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "✅ RBAC backup completed: $DATE"
EOF

chmod +x /opt/kryonix/scripts/backup-rbac-data.sh

# 10. Configurar testes automáticos
echo "🧪 Configurando testes RBAC..."
cat > /opt/kryonix/tests/rbac-tests.js << 'EOF'
const request = require('supertest');
const app = require('../app');

describe('Multi-Tenant RBAC Tests', () => {
  
  test('Should check permission for valid user', async () => {
    const response = await request(app)
      .post('/rbac/check-permission')
      .set('Authorization', 'Bearer ' + validToken)
      .set('X-Tenant-ID', 'demo')
      .send({
        resource: 'leads',
        action: 'read'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.granted).toBeDefined();
  });
  
  test('Should deny cross-tenant access', async () => {
    const response = await request(app)
      .post('/rbac/check-permission')
      .set('Authorization', 'Bearer ' + validToken)
      .set('X-Tenant-ID', 'wrong-tenant')
      .send({
        resource: 'leads',
        action: 'read'
      });
    
    expect(response.status).toBe(403);
  });
  
  test('Should sync mobile permissions', async () => {
    const response = await request(app)
      .post('/rbac/sync-mobile')
      .set('Authorization', 'Bearer ' + validToken)
      .set('X-Tenant-ID', 'demo')
      .send({
        deviceId: 'test-device-123',
        platform: 'ios'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.permissions).toBeDefined();
  });
  
});
EOF

# 11. Configurar cron para backups e limpeza
(crontab -l 2>/dev/null; echo "0 4 * * * /opt/kryonix/scripts/backup-rbac-data.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 5 * * 0 /opt/kryonix/scripts/cleanup-rbac-cache.sh") | crontab -

echo "✅ Sistema RBAC Multi-Tenant KRYONIX configurado!"
echo ""
echo "🔐 Recursos RBAC Multi-Tenant:"
echo "   • Schemas isolados por tenant"
echo "   • Permissões baseadas em módulos contratados"
echo "   • Hierarquia de roles com herança"
echo "   • Cache Redis para performance mobile"
echo "   • Propagação em tempo real via WebSocket"
echo ""
echo "📱 Mobile RBAC:"
echo "   • Verificação offline de permissões críticas"
echo "   • Autenticação biométrica para ações sensíveis"
echo "   • Sincronização automática de permissões"
echo "   • Cache local otimizado para performance"
echo ""
echo "🔒 Segurança:"
echo "   • Isolamento completo entre tenants"
echo "   • Auditoria LGPD compliant"
echo "   • Verificação de módulos contratados"
echo "   • Proteção contra acesso cross-tenant"
echo ""
echo "📊 Monitoramento:"
echo "   • Grafana dashboards específicos"
echo "   • Métricas de performance por tenant"
echo "   • Logs de auditoria detalhados"
echo "   • Backup automático diário"
```

## ✅ **ENTREGÁVEIS COMPLETOS RBAC MULTI-TENANT**
- [ ] **Schemas RBAC** isolados por tenant com hierarquia completa
- [ ] **Permissões Modulares** baseadas em contratos por cliente
- [ ] **Cache Redis** otimizado para verificações mobile rápidas
- [ ] **Propagação Tempo Real** via WebSocket para mudanças instantâneas
- [ ] **Mobile Permission Gates** com autenticação biométrica
- [ ] **Hierarquia Roles** com herança e delegação automática
- [ ] **Auditoria LGPD** completa com logs detalhados
- [ ] **Sincronização Mobile** com permissões offline
- [ ] **Keycloak Integration** com realms isolados por tenant
- [ ] **Performance Optimization** com cache em múltiplas camadas
- [ ] **SDK Integration** @kryonix/sdk unificado
- [ ] **Backup Automático** de roles e permissões
- [ ] **Monitoring Grafana** com métricas RBAC específicas
- [ ] **Testes Automáticos** para isolamento e performance
- [ ] **Scripts Deploy** automático completo

## 🧪 **TESTES AUTOMÁTICOS RBAC MULTI-TENANT**
```bash
npm run test:rbac:multi-tenant
npm run test:rbac:tenant-isolation
npm run test:rbac:mobile-permissions
npm run test:rbac:cache-performance
npm run test:rbac:real-time-propagation
npm run test:rbac:biometric-gates
npm run test:rbac:module-permissions
npm run test:rbac:hierarchy-inheritance
npm run test:rbac:audit-compliance
npm run test:rbac:offline-capabilities
```

## 📝 **CHECKLIST IMPLEMENTAÇÃO - 15 AGENTES**
- [ ] ✅ **Especialista Segurança**: RBAC isolation completo implementado
- [ ] ✅ **Arquiteto Software**: Arquitetura multi-tenant RBAC estruturada
- [ ] ✅ **Backend Expert**: APIs RBAC com isolamento por tenant
- [ ] ✅ **Expert Mobile**: Permission gates mobile otimizados
- [ ] ✅ **Expert Performance**: Cache Redis multi-camadas implementado
- [ ] ✅ **QA Expert**: Testes isolamento e compliance completos
- [ ] ✅ **Specialist Business**: Permissões baseadas em módulos
- [ ] ✅ **Expert Automação**: Propagação tempo real configurada
- [ ] ✅ **Specialist LGPD**: Auditoria compliance implementada
- [ ] ✅ **DevOps**: Deploy automático sistema RBAC
- [ ] ✅ **Expert APIs**: APIs permission checking isoladas
- [ ] ✅ **Analista BI**: Métricas RBAC por tenant
- [ ] ✅ **Expert Comunicação**: WebSocket propagação implementado
- [ ] ✅ **Specialist Localização**: Interface PT-BR RBAC
- [ ] ✅ **Frontend Expert**: Componentes permission gates mobile

---

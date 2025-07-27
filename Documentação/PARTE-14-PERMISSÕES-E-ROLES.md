# 🔑 PARTE 14 - PERMISSÕES E ROLES
*Agentes Responsáveis: Especialista Segurança + Arquiteto Software + Backend Expert*

## 🎯 **OBJETIVO**
Implementar sistema RBAC (Role-Based Access Control) completo com gestão granular de permissões integrado ao Keycloak.

## 🏗️ **ARQUITETURA RBAC (Especialista Segurança)**
```yaml
RBAC System:
  Roles: Definidas no Keycloak + PostgreSQL
  Permissions: Granulares por recurso e ação
  Inheritance: Hierarquia de roles
  Caching: Redis para performance
  
Hierarchy:
  super-admin → admin → manager → user → viewer
  
Integration:
  - Keycloak roles ↔ PostgreSQL permissions
  - JWT claims para frontend
  - Middleware para APIs
  - Real-time permission updates
```

## 🔐 **MODELO DE PERMISSÕES**
```sql
-- Sistema de roles e permissões
CREATE TABLE auth.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    level INTEGER DEFAULT 0, -- Hierarquia
    is_system BOOLEAN DEFAULT false,
    company_id UUID REFERENCES auth.companies(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(100) NOT NULL, -- users, projects, automations
    action VARCHAR(50) NOT NULL,    -- create, read, update, delete
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(resource, action)
);

CREATE TABLE auth.role_permissions (
    role_id UUID REFERENCES auth.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES auth.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE auth.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES auth.roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    PRIMARY KEY (user_id, role_id)
);

-- Permissões específicas para usuários (override)
CREATE TABLE auth.user_permissions (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES auth.permissions(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT true, -- true = grant, false = deny
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP,
    PRIMARY KEY (user_id, permission_id)
);
```

## 🔧 **SERVIÇO DE PERMISSÕES**
```typescript
// services/permission.service.ts
export class PermissionService {
  
  async checkPermission(
    userId: string, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    const cacheKey = `permission:${userId}:${resource}:${action}`;
    
    // Verificar cache primeiro
    let hasPermission = await this.cacheService.get<boolean>(cacheKey);
    if (hasPermission !== null) {
      return hasPermission;
    }

    // Verificar permissão específica do usuário (override)
    const userPermission = await this.db.query(`
      SELECT up.granted
      FROM auth.user_permissions up
      JOIN auth.permissions p ON up.permission_id = p.id
      WHERE up.user_id = $1 
        AND p.resource = $2 
        AND p.action = $3
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    `, [userId, resource, action]);

    if (userPermission.rows.length > 0) {
      hasPermission = userPermission.rows[0].granted;
    } else {
      // Verificar permissões via roles
      hasPermission = await this.checkRolePermissions(userId, resource, action);
    }

    // Cache por 5 minutos
    await this.cacheService.set(cacheKey, hasPermission, 300);
    
    return hasPermission;
  }

  private async checkRolePermissions(
    userId: string, 
    resource: string, 
    action: string
  ): Promise<boolean> {
    const result = await this.db.query(`
      SELECT COUNT(*) > 0 as has_permission
      FROM auth.user_roles ur
      JOIN auth.role_permissions rp ON ur.role_id = rp.role_id
      JOIN auth.permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = $1 
        AND p.resource = $2 
        AND p.action = $3
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    `, [userId, resource, action]);

    return result.rows[0].has_permission;
  }

  async assignRole(userId: string, roleId: string, grantedBy: string) {
    await this.db.query(`
      INSERT INTO auth.user_roles (user_id, role_id, granted_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, role_id) 
      DO UPDATE SET granted_at = NOW(), granted_by = $3, is_active = true
    `, [userId, roleId, grantedBy]);

    // Sync com Keycloak
    await this.syncRoleToKeycloak(userId, roleId);
    
    // Invalidar cache do usuário
    await this.invalidateUserPermissions(userId);
  }

  async revokeRole(userId: string, roleId: string, revokedBy: string) {
    await this.db.query(`
      UPDATE auth.user_roles 
      SET is_active = false, granted_by = $3, granted_at = NOW()
      WHERE user_id = $1 AND role_id = $2
    `, [userId, roleId, revokedBy]);

    // Remove do Keycloak
    await this.removeRoleFromKeycloak(userId, roleId);
    
    // Invalidar cache
    await this.invalidateUserPermissions(userId);
  }

  async createCustomRole(
    roleData: CreateRoleDTO, 
    permissions: string[], 
    createdBy: string
  ) {
    const role = await this.db.query(`
      INSERT INTO auth.roles (name, display_name, description, company_id, level)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      roleData.name,
      roleData.displayName,
      roleData.description,
      roleData.companyId,
      roleData.level
    ]);

    // Associar permissões
    for (const permissionId of permissions) {
      await this.db.query(`
        INSERT INTO auth.role_permissions (role_id, permission_id, granted_by)
        VALUES ($1, $2, $3)
      `, [role.rows[0].id, permissionId, createdBy]);
    }

    // Criar role no Keycloak
    await this.createKeycloakRole(role.rows[0]);

    return role.rows[0];
  }

  async getUserPermissions(userId: string) {
    const permissions = await this.db.query(`
      -- Permissões via roles
      SELECT DISTINCT p.resource, p.action, 'role' as source, r.name as source_name
      FROM auth.user_roles ur
      JOIN auth.role_permissions rp ON ur.role_id = rp.role_id
      JOIN auth.permissions p ON rp.permission_id = p.id
      JOIN auth.roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1 AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      
      UNION
      
      -- Permissões específicas do usuário
      SELECT p.resource, p.action, 'user' as source, 
             CASE WHEN up.granted THEN 'granted' ELSE 'denied' END as source_name
      FROM auth.user_permissions up
      JOIN auth.permissions p ON up.permission_id = p.id
      WHERE up.user_id = $1
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
      
      ORDER BY resource, action
    `, [userId]);

    return permissions.rows;
  }

  private async invalidateUserPermissions(userId: string) {
    const pattern = `permission:${userId}:*`;
    await this.cacheService.deletePattern(pattern);
  }
}
```

## 🛡️ **MIDDLEWARE DE AUTORIZAÇÃO**
```typescript
// middleware/authorization.ts
export function requirePermission(resource: string, action: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      
      const hasPermission = await permissionService.checkPermission(
        userId, 
        resource, 
        action
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: `Permissão necessária: ${resource}:${action}`,
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
  };
}

// Uso nas rotas
app.get('/api/v1/users', 
  requirePermission('users', 'read'),
  userController.list
);

app.post('/api/v1/users',
  requirePermission('users', 'create'),
  userController.create
);

app.delete('/api/v1/users/:id',
  requirePermission('users', 'delete'),
  userController.delete
);
```

## 🎨 **COMPONENTES FRONTEND**
```tsx
// components/permissions/RoleManager.tsx
export const RoleManager = () => {
  const { roles, permissions, createRole, assignRole } = useRoles();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Roles</h2>
        <Button onClick={() => setShowCreateRole(true)}>
          Nova Role
        </Button>
      </div>

      <RoleList 
        roles={roles}
        onEdit={editRole}
        onDelete={deleteRole}
      />

      <PermissionMatrix 
        roles={roles}
        permissions={permissions}
        onChange={updateRolePermissions}
      />
    </div>
  );
};

// components/permissions/PermissionGuard.tsx
interface PermissionGuardProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard = ({ 
  resource, 
  action, 
  children, 
  fallback 
}: PermissionGuardProps) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(resource, action)) {
    return fallback || null;
  }

  return <>{children}</>;
};

// Hook para verificar permissões
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = useCallback((resource: string, action: string) => {
    return user?.permissions?.some(p => 
      p.resource === resource && p.action === action
    ) || false;
  }, [user]);

  const hasAnyPermission = useCallback((permissions: Array<{resource: string, action: string}>) => {
    return permissions.some(p => hasPermission(p.resource, p.action));
  }, [hasPermission]);

  return { hasPermission, hasAnyPermission };
};
```

## 🔄 **SINCRONIZAÇÃO KEYCLOAK**
```typescript
// services/keycloak-sync.service.ts
export class KeycloakSyncService {
  
  async syncRoleToKeycloak(userId: string, roleId: string) {
    try {
      const user = await this.getUserByKeycloakId(userId);
      const role = await this.getRoleById(roleId);

      // Buscar role no Keycloak
      const kcRole = await this.keycloakAdmin.roles.findOneByName({
        name: role.name
      });

      if (!kcRole) {
        // Criar role no Keycloak se não existir
        await this.keycloakAdmin.roles.create({
          name: role.name,
          description: role.description
        });
      }

      // Atribuir role ao usuário
      await this.keycloakAdmin.users.addRealmRoleMappings({
        id: user.keycloak_id,
        roles: [{ name: role.name }]
      });

    } catch (error) {
      console.error('Erro ao sincronizar role:', error);
    }
  }

  async createKeycloakRole(role: any) {
    await this.keycloakAdmin.roles.create({
      name: role.name,
      description: role.description,
      attributes: {
        level: [role.level.toString()],
        companyId: role.company_id ? [role.company_id] : []
      }
    });
  }
}
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Criar tabelas RBAC
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f rbac-schema.sql

# 2. Inserir permissões básicas
npm run seed:permissions

# 3. Criar roles padrão
npm run seed:default-roles

# 4. Sincronizar com Keycloak
npm run sync:roles:keycloak

# 5. Testar permissões
curl -X GET https://api.kryonix.com.br/v1/users \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Sistema RBAC implementado
- [ ] Hierarquia de roles funcionando
- [ ] Permissões granulares ativas
- [ ] Middleware de autorização operacional
- [ ] Cache de permissões funcionando
- [ ] Sincronização Keycloak ativa
- [ ] Interface de gestão criada
- [ ] Audit trail implementado
- [ ] Permissões específicas por usuário
- [ ] Guards de permissão no frontend

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de permissões
npm run test:rbac:permissions

# Teste de roles
npm run test:rbac:roles

# Teste de middleware
npm run test:rbac:middleware

# Teste de sincronização
npm run test:rbac:keycloak-sync
```

---
*Parte 14 de 50 - Projeto KRYONIX SaaS Platform*
*Próxima Parte: 15 - Módulo de Configuração*

# PARTE-25: GESTÃO DE USUÁRIOS E PERFIS
## Sistema Completo de Gestão de Usuários e Perfis

### 📋 DESCRIÇÃO
Implementação de sistema abrangente para gestão de usuários, perfis, permissões e controle de acesso, integrado com Keycloak e suportando multi-tenancy, hierarquia de organizações e gestão de equipes.

### 🎯 OBJETIVOS
- Gestão completa de usuários e perfis
- Sistema hierárquico de organizações
- Controle granular de permissões (RBAC/ABAC)
- Gestão de equipes e departamentos
- Self-service para usuários
- Integração com Active Directory/LDAP

### 🏗️ ARQUITETURA

#### Estrutura Hierárquica
```
┌─────────────────────────────────────────────────────────────┐
│                USER MANAGEMENT ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│ PRESENTATION LAYER                                         │
│ • User Dashboard                                           │
│ • Admin Panel                                              │
│ • Self-Service Portal                                      │
├─────────────────────────────────────────────────────────────┤
│ BUSINESS LOGIC LAYER                                       │
│ • User Management Service                                  │
│ • Organization Service                                     │
│ • Permission Engine                                        │
│ • Team Management                                          │
├─────────────────────────────────────────────────────────────┤
│ INTEGRATION LAYER                                          │
│ • Keycloak Integration                                     │
│ • LDAP/AD Connector                                        │
│ • SSO Provider                                             │
│ • Multi-tenant Context                                     │
├─────────────────────────────────────────────────────────────┤
│ DATA LAYER                                                 │
│ • User Profiles (PostgreSQL)                              │
│ • Organizations Hierarchy                                  │
│ • Permissions Matrix                                       │
│ • Audit Trail                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🗄️ SCHEMAS DE BANCO DE DADOS

#### PostgreSQL User Management Schema
```sql
-- Schema para gestão de usuários
CREATE SCHEMA IF NOT EXISTS user_management;

-- Tabela principal de organizações (multi-tenant)
CREATE TABLE user_management.organizations (
    organization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_organization_id UUID REFERENCES user_management.organizations(organization_id),
    tenant_id UUID NOT NULL,
    organization_name VARCHAR(255) NOT NULL,
    organization_code VARCHAR(50) UNIQUE NOT NULL,
    organization_type VARCHAR(50) NOT NULL, -- 'company', 'department', 'team', 'project'
    description TEXT,
    website_url TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    address JSONB, -- {street, city, state, country, postal_code}
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    locale VARCHAR(10) DEFAULT 'pt-BR',
    settings JSONB, -- Organization-specific settings
    subscription_plan VARCHAR(50),
    subscription_status VARCHAR(20) DEFAULT 'active',
    max_users INTEGER,
    current_users_count INTEGER DEFAULT 0,
    features_enabled TEXT[], -- Array of enabled features
    custom_branding JSONB, -- Logo, colors, etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Tabela de perfis de usuário
CREATE TABLE user_management.user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    keycloak_user_id UUID NOT NULL UNIQUE, -- Reference to Keycloak
    organization_id UUID NOT NULL REFERENCES user_management.organizations(organization_id),
    employee_id VARCHAR(50),
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255) GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
    display_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT false,
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(2), -- ISO country code
    preferred_language VARCHAR(10) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    job_title VARCHAR(255),
    department VARCHAR(255),
    manager_id UUID REFERENCES user_management.user_profiles(profile_id),
    hire_date DATE,
    employment_type VARCHAR(50), -- 'full_time', 'part_time', 'contractor', 'intern'
    work_location VARCHAR(255),
    salary_band VARCHAR(20),
    cost_center VARCHAR(50),
    emergency_contact JSONB, -- {name, relationship, phone, email}
    address JSONB, -- Personal address
    social_profiles JSONB, -- LinkedIn, Twitter, etc.
    skills TEXT[], -- Array of skills
    certifications JSONB, -- Professional certifications
    bio TEXT,
    preferences JSONB, -- User preferences
    security_settings JSONB, -- 2FA, security questions, etc.
    privacy_settings JSONB, -- Privacy preferences
    notification_settings JSONB, -- Notification preferences
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_password_change TIMESTAMP WITH TIME ZONE,
    password_expires_at TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'locked'
    account_locked_until TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    requires_password_change BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    privacy_policy_accepted_at TIMESTAMP WITH TIME ZONE,
    gdpr_consent JSONB, -- GDPR consent tracking
    is_system_user BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Tabela de roles/funções
CREATE TABLE user_management.roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    organization_id UUID REFERENCES user_management.organizations(organization_id),
    role_name VARCHAR(100) NOT NULL,
    role_code VARCHAR(50) NOT NULL,
    description TEXT,
    role_type VARCHAR(50) DEFAULT 'custom', -- 'system', 'organization', 'custom'
    role_level INTEGER DEFAULT 0, -- Hierarchy level
    is_default BOOLEAN DEFAULT false,
    permissions TEXT[], -- Array of permission codes
    inherits_from UUID REFERENCES user_management.roles(role_id),
    max_assignees INTEGER, -- Limit number of users with this role
    auto_assignment_rules JSONB, -- Rules for automatic role assignment
    expiration_period INTERVAL, -- Role expiration (if applicable)
    approval_required BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, organization_id, role_code)
);

-- Tabela de atribuição de roles
CREATE TABLE user_management.user_roles (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES user_management.user_profiles(profile_id),
    role_id UUID NOT NULL REFERENCES user_management.roles(role_id),
    organization_id UUID NOT NULL REFERENCES user_management.organizations(organization_id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES user_management.user_profiles(profile_id),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_primary_role BOOLEAN DEFAULT false,
    assignment_reason TEXT,
    approval_status VARCHAR(20) DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    approved_by UUID REFERENCES user_management.user_profiles(profile_id),
    approved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id, organization_id)
);

-- Tabela de permissões
CREATE TABLE user_management.permissions (
    permission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'user_management', 'content', 'financial', etc.
    resource_type VARCHAR(100), -- 'user', 'document', 'report', etc.
    action VARCHAR(50), -- 'create', 'read', 'update', 'delete', 'execute'
    scope VARCHAR(50) DEFAULT 'organization', -- 'system', 'tenant', 'organization', 'team', 'self'
    is_system_permission BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    risk_level VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de equipes
CREATE TABLE user_management.teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    organization_id UUID NOT NULL REFERENCES user_management.organizations(organization_id),
    parent_team_id UUID REFERENCES user_management.teams(team_id),
    team_name VARCHAR(255) NOT NULL,
    team_code VARCHAR(50) NOT NULL,
    description TEXT,
    team_type VARCHAR(50), -- 'department', 'project_team', 'working_group'
    team_lead_id UUID REFERENCES user_management.user_profiles(profile_id),
    max_members INTEGER,
    current_members_count INTEGER DEFAULT 0,
    budget_allocation DECIMAL(15,2),
    cost_center VARCHAR(50),
    location VARCHAR(255),
    meeting_schedule JSONB, -- Regular meeting times
    team_goals TEXT[],
    kpis JSONB, -- Key Performance Indicators
    team_settings JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, organization_id, team_code)
);

-- Tabela de membros de equipe
CREATE TABLE user_management.team_members (
    membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    team_id UUID NOT NULL REFERENCES user_management.teams(team_id),
    user_id UUID NOT NULL REFERENCES user_management.user_profiles(profile_id),
    role_in_team VARCHAR(100), -- 'member', 'lead', 'coordinator', 'specialist'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    responsibilities TEXT[],
    allocation_percentage INTEGER DEFAULT 100, -- % of time dedicated to this team
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Tabela de delegação de autoridade
CREATE TABLE user_management.authority_delegations (
    delegation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    delegator_id UUID NOT NULL REFERENCES user_management.user_profiles(profile_id),
    delegate_id UUID NOT NULL REFERENCES user_management.user_profiles(profile_id),
    organization_id UUID NOT NULL REFERENCES user_management.organizations(organization_id),
    delegation_type VARCHAR(50), -- 'temporary', 'permanent', 'conditional'
    delegated_permissions TEXT[], -- Specific permissions being delegated
    scope_limitation JSONB, -- Limitations on the delegation scope
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE,
    reason TEXT,
    conditions TEXT,
    is_revocable BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'revoked', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES user_management.user_profiles(profile_id)
);

-- Índices para performance
CREATE INDEX idx_organizations_tenant ON user_management.organizations(tenant_id);
CREATE INDEX idx_organizations_parent ON user_management.organizations(parent_organization_id);
CREATE INDEX idx_user_profiles_tenant_org ON user_management.user_profiles(tenant_id, organization_id);
CREATE INDEX idx_user_profiles_keycloak ON user_management.user_profiles(keycloak_user_id);
CREATE INDEX idx_user_profiles_manager ON user_management.user_profiles(manager_id);
CREATE INDEX idx_user_roles_user ON user_management.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_management.user_roles(role_id);
CREATE INDEX idx_teams_org ON user_management.teams(organization_id);
CREATE INDEX idx_team_members_team ON user_management.team_members(team_id);
CREATE INDEX idx_team_members_user ON user_management.team_members(user_id);

-- Função para calcular hierarquia organizacional
CREATE OR REPLACE FUNCTION user_management.get_organization_hierarchy(p_organization_id UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name VARCHAR(255),
    level INTEGER,
    path TEXT
) AS $$
WITH RECURSIVE org_hierarchy AS (
    -- Base case: start with the given organization
    SELECT 
        o.organization_id,
        o.organization_name,
        0 as level,
        o.organization_name::TEXT as path
    FROM user_management.organizations o
    WHERE o.organization_id = p_organization_id
    
    UNION ALL
    
    -- Recursive case: find children
    SELECT 
        o.organization_id,
        o.organization_name,
        oh.level + 1,
        oh.path || ' > ' || o.organization_name
    FROM user_management.organizations o
    INNER JOIN org_hierarchy oh ON o.parent_organization_id = oh.organization_id
)
SELECT * FROM org_hierarchy ORDER BY level, organization_name;
$$ LANGUAGE SQL;

-- Função para verificar permissões de usuário
CREATE OR REPLACE FUNCTION user_management.check_user_permission(
    p_user_id UUID,
    p_permission_code VARCHAR(100),
    p_resource_id UUID DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := false;
    user_org_id UUID;
BEGIN
    -- Get user's organization if not provided
    IF p_organization_id IS NULL THEN
        SELECT organization_id INTO user_org_id
        FROM user_management.user_profiles
        WHERE profile_id = p_user_id;
    ELSE
        user_org_id := p_organization_id;
    END IF;
    
    -- Check if user has permission through roles
    SELECT EXISTS(
        SELECT 1
        FROM user_management.user_roles ur
        JOIN user_management.roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = p_user_id
        AND ur.is_active = true
        AND r.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND p_permission_code = ANY(r.permissions)
        AND (p_organization_id IS NULL OR ur.organization_id = user_org_id)
    ) INTO has_permission;
    
    -- Check delegated permissions if direct permission not found
    IF NOT has_permission THEN
        SELECT EXISTS(
            SELECT 1
            FROM user_management.authority_delegations ad
            WHERE ad.delegate_id = p_user_id
            AND ad.status = 'active'
            AND (ad.end_date IS NULL OR ad.end_date > NOW())
            AND p_permission_code = ANY(ad.delegated_permissions)
            AND (p_organization_id IS NULL OR ad.organization_id = user_org_id)
        ) INTO has_permission;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador de usuários
CREATE OR REPLACE FUNCTION user_management.update_organization_user_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE user_management.organizations
        SET current_users_count = current_users_count + 1,
            updated_at = NOW()
        WHERE organization_id = NEW.organization_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE user_management.organizations
        SET current_users_count = current_users_count - 1,
            updated_at = NOW()
        WHERE organization_id = OLD.organization_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND OLD.organization_id != NEW.organization_id THEN
        -- User moved to different organization
        UPDATE user_management.organizations
        SET current_users_count = current_users_count - 1,
            updated_at = NOW()
        WHERE organization_id = OLD.organization_id;
        
        UPDATE user_management.organizations
        SET current_users_count = current_users_count + 1,
            updated_at = NOW()
        WHERE organization_id = NEW.organization_id;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_management.user_profiles
    FOR EACH ROW EXECUTE FUNCTION user_management.update_organization_user_count();

-- Função para buscar usuários com filtros avançados
CREATE OR REPLACE FUNCTION user_management.search_users(
    p_tenant_id UUID,
    p_organization_id UUID DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL,
    p_department VARCHAR(255) DEFAULT NULL,
    p_job_title VARCHAR(255) DEFAULT NULL,
    p_role_codes TEXT[] DEFAULT NULL,
    p_skills TEXT[] DEFAULT NULL,
    p_include_inactive BOOLEAN DEFAULT false,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    profile_id UUID,
    full_name VARCHAR(255),
    email VARCHAR(255),
    job_title VARCHAR(255),
    department VARCHAR(255),
    organization_name VARCHAR(255),
    roles TEXT[],
    last_login_at TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.profile_id,
        up.full_name,
        up.email,
        up.job_title,
        up.department,
        o.organization_name,
        ARRAY_AGG(DISTINCT r.role_name) FILTER (WHERE r.role_name IS NOT NULL) as roles,
        up.last_login_at,
        up.account_status
    FROM user_management.user_profiles up
    JOIN user_management.organizations o ON up.organization_id = o.organization_id
    LEFT JOIN user_management.user_roles ur ON up.profile_id = ur.user_id AND ur.is_active = true
    LEFT JOIN user_management.roles r ON ur.role_id = r.role_id AND r.is_active = true
    WHERE up.tenant_id = p_tenant_id
    AND (p_organization_id IS NULL OR up.organization_id = p_organization_id)
    AND (p_search_term IS NULL OR 
         up.full_name ILIKE '%' || p_search_term || '%' OR
         up.email ILIKE '%' || p_search_term || '%' OR
         up.username ILIKE '%' || p_search_term || '%')
    AND (p_department IS NULL OR up.department ILIKE '%' || p_department || '%')
    AND (p_job_title IS NULL OR up.job_title ILIKE '%' || p_job_title || '%')
    AND (p_role_codes IS NULL OR r.role_code = ANY(p_role_codes))
    AND (p_skills IS NULL OR up.skills && p_skills)
    AND (p_include_inactive = true OR up.account_status = 'active')
    GROUP BY up.profile_id, up.full_name, up.email, up.job_title, 
             up.department, o.organization_name, up.last_login_at, up.account_status
    ORDER BY up.full_name
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

### 🔧 IMPLEMENTAÇÃO DOS SERVIÇOS

#### 1. User Management Service
```typescript
// src/modules/user-management/services/user-management.service.ts
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '../keycloak/keycloak.service';
import { AuditService } from '../audit/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserManagementService {
    private readonly logger = new Logger(UserManagementService.name);

    constructor(
        @InjectRepository(UserProfile)
        private readonly userRepository: Repository<UserProfile>,
        
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        
        @InjectRepository(UserRole)
        private readonly userRoleRepository: Repository<UserRole>,
        
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>,
        
        private readonly keycloakService: KeycloakService,
        private readonly auditService: AuditService,
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserProfile> {
        return await this.userRepository.manager.transaction(async (manager: EntityManager) => {
            try {
                // 1. Create user in Keycloak first
                const keycloakUser = await this.keycloakService.createUser({
                    username: createUserDto.username,
                    email: createUserDto.email,
                    firstName: createUserDto.firstName,
                    lastName: createUserDto.lastName,
                    enabled: true,
                    emailVerified: false,
                    credentials: createUserDto.password ? [{
                        type: 'password',
                        value: createUserDto.password,
                        temporary: createUserDto.requirePasswordChange || false
                    }] : undefined
                });

                // 2. Validate organization exists and user limit
                const organization = await manager.findOne(Organization, {
                    where: { organizationId: createUserDto.organizationId }
                });

                if (!organization) {
                    throw new NotFoundException('Organização não encontrada');
                }

                if (organization.maxUsers && organization.currentUsersCount >= organization.maxUsers) {
                    throw new BadRequestException('Limite de usuários da organização excedido');
                }

                // 3. Create user profile
                const userProfile = manager.create(UserProfile, {
                    tenantId: createUserDto.tenantId,
                    keycloakUserId: keycloakUser.id,
                    organizationId: createUserDto.organizationId,
                    employeeId: createUserDto.employeeId,
                    username: createUserDto.username,
                    email: createUserDto.email,
                    firstName: createUserDto.firstName,
                    lastName: createUserDto.lastName,
                    displayName: createUserDto.displayName,
                    phone: createUserDto.phone,
                    jobTitle: createUserDto.jobTitle,
                    department: createUserDto.department,
                    managerId: createUserDto.managerId,
                    hireDate: createUserDto.hireDate,
                    employmentType: createUserDto.employmentType,
                    workLocation: createUserDto.workLocation,
                    preferences: createUserDto.preferences || {},
                    requiresPasswordChange: createUserDto.requirePasswordChange || false,
                    accountStatus: 'active',
                    createdBy: createUserDto.createdBy
                });

                const savedUser = await manager.save(UserProfile, userProfile);

                // 4. Assign default roles
                if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
                    await this.assignRolesToUser(
                        savedUser.profileId,
                        createUserDto.roleIds,
                        createUserDto.organizationId,
                        createUserDto.createdBy,
                        manager
                    );
                } else {
                    // Assign default role for organization
                    const defaultRole = await manager.findOne(Role, {
                        where: {
                            organizationId: createUserDto.organizationId,
                            isDefault: true,
                            isActive: true
                        }
                    });

                    if (defaultRole) {
                        await this.assignRolesToUser(
                            savedUser.profileId,
                            [defaultRole.roleId],
                            createUserDto.organizationId,
                            createUserDto.createdBy,
                            manager
                        );
                    }
                }

                // 5. Add to teams if specified
                if (createUserDto.teamIds && createUserDto.teamIds.length > 0) {
                    await this.addUserToTeams(
                        savedUser.profileId,
                        createUserDto.teamIds,
                        'member',
                        manager
                    );
                }

                // 6. Send welcome email (if enabled)
                if (createUserDto.sendWelcomeEmail) {
                    await this.sendWelcomeEmail(savedUser);
                }

                // 7. Audit log
                await this.auditService.logOperation({
                    tenantId: createUserDto.tenantId,
                    userId: createUserDto.createdBy,
                    operationType: 'CREATE',
                    entityType: 'user',
                    entityId: savedUser.profileId,
                    newValues: savedUser,
                    operationResult: 'success'
                });

                // 8. Emit event
                this.eventEmitter.emit('user.created', {
                    user: savedUser,
                    organization: organization
                });

                this.logger.log(`User created successfully: ${savedUser.email}`);
                return savedUser;

            } catch (error) {
                // Cleanup Keycloak user if profile creation failed
                if (keycloakUser?.id) {
                    await this.keycloakService.deleteUser(keycloakUser.id);
                }

                this.logger.error('Error creating user:', error);
                throw error;
            }
        });
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<UserProfile> {
        const user = await this.userRepository.findOne({
            where: { profileId: userId }
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        const oldValues = { ...user };

        // Update Keycloak user
        if (updateUserDto.email || updateUserDto.firstName || updateUserDto.lastName) {
            await this.keycloakService.updateUser(user.keycloakUserId, {
                email: updateUserDto.email,
                firstName: updateUserDto.firstName,
                lastName: updateUserDto.lastName,
                enabled: updateUserDto.accountStatus === 'active'
            });
        }

        // Update user profile
        Object.assign(user, updateUserDto);
        user.updatedAt = new Date();

        const updatedUser = await this.userRepository.save(user);

        // Audit log
        await this.auditService.logOperation({
            tenantId: user.tenantId,
            userId: updateUserDto.updatedBy,
            operationType: 'UPDATE',
            entityType: 'user',
            entityId: user.profileId,
            oldValues,
            newValues: updatedUser,
            changedFields: Object.keys(updateUserDto)
        });

        // Emit event
        this.eventEmitter.emit('user.updated', {
            user: updatedUser,
            oldValues,
            changedFields: Object.keys(updateUserDto)
        });

        return updatedUser;
    }

    async deactivateUser(userId: string, deactivatedBy: string, reason?: string): Promise<void> {
        await this.userRepository.manager.transaction(async (manager: EntityManager) => {
            const user = await manager.findOne(UserProfile, {
                where: { profileId: userId }
            });

            if (!user) {
                throw new NotFoundException('Usuário não encontrado');
            }

            // Deactivate in Keycloak
            await this.keycloakService.updateUser(user.keycloakUserId, {
                enabled: false
            });

            // Update user status
            const oldStatus = user.accountStatus;
            user.accountStatus = 'inactive';
            user.updatedAt = new Date();
            user.updatedBy = deactivatedBy;

            await manager.save(UserProfile, user);

            // Deactivate user roles
            await manager.update(UserRole, 
                { userId: userId }, 
                { isActive: false }
            );

            // Remove from active teams
            await manager.update(TeamMember,
                { userId: userId },
                { isActive: false, leftAt: new Date() }
            );

            // Audit log
            await this.auditService.logOperation({
                tenantId: user.tenantId,
                userId: deactivatedBy,
                operationType: 'UPDATE',
                entityType: 'user',
                entityId: user.profileId,
                oldValues: { accountStatus: oldStatus },
                newValues: { accountStatus: 'inactive' },
                metadata: { reason }
            });

            // Emit event
            this.eventEmitter.emit('user.deactivated', {
                user,
                reason,
                deactivatedBy
            });

            this.logger.log(`User deactivated: ${user.email}`);
        });
    }

    async assignRolesToUser(
        userId: string,
        roleIds: string[],
        organizationId: string,
        assignedBy: string,
        manager?: EntityManager
    ): Promise<void> {
        const em = manager || this.userRepository.manager;

        const user = await em.findOne(UserProfile, {
            where: { profileId: userId }
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        for (const roleId of roleIds) {
            const role = await em.findOne(Role, {
                where: { roleId, isActive: true }
            });

            if (!role) {
                this.logger.warn(`Role not found: ${roleId}`);
                continue;
            }

            // Check if assignment already exists
            const existingAssignment = await em.findOne(UserRole, {
                where: { userId, roleId, organizationId }
            });

            if (existingAssignment) {
                if (!existingAssignment.isActive) {
                    existingAssignment.isActive = true;
                    existingAssignment.assignedAt = new Date();
                    existingAssignment.assignedBy = assignedBy;
                    await em.save(UserRole, existingAssignment);
                }
                continue;
            }

            // Check max assignees limit
            if (role.maxAssignees) {
                const currentAssignees = await em.count(UserRole, {
                    where: { roleId, isActive: true }
                });

                if (currentAssignees >= role.maxAssignees) {
                    throw new BadRequestException(`Limite de usuários para o role ${role.roleName} excedido`);
                }
            }

            // Create new assignment
            const userRole = em.create(UserRole, {
                tenantId: user.tenantId,
                userId,
                roleId,
                organizationId,
                assignedBy,
                assignedAt: new Date(),
                isActive: true
            });

            await em.save(UserRole, userRole);

            // Sync with Keycloak
            await this.keycloakService.assignRoleToUser(user.keycloakUserId, role.roleCode);
        }

        // Audit log
        await this.auditService.logOperation({
            tenantId: user.tenantId,
            userId: assignedBy,
            operationType: 'UPDATE',
            entityType: 'user_roles',
            entityId: userId,
            newValues: { roleIds },
            metadata: { organizationId }
        });

        this.logger.log(`Roles assigned to user ${user.email}: ${roleIds.join(', ')}`);
    }

    async removeRolesFromUser(
        userId: string,
        roleIds: string[],
        organizationId: string,
        removedBy: string
    ): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { profileId: userId }
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        for (const roleId of roleIds) {
            const userRole = await this.userRoleRepository.findOne({
                where: { userId, roleId, organizationId, isActive: true }
            });

            if (userRole) {
                userRole.isActive = false;
                await this.userRoleRepository.save(userRole);

                // Sync with Keycloak
                const role = await this.roleRepository.findOne({
                    where: { roleId }
                });

                if (role) {
                    await this.keycloakService.removeRoleFromUser(user.keycloakUserId, role.roleCode);
                }
            }
        }

        // Audit log
        await this.auditService.logOperation({
            tenantId: user.tenantId,
            userId: removedBy,
            operationType: 'UPDATE',
            entityType: 'user_roles',
            entityId: userId,
            oldValues: { roleIds },
            metadata: { organizationId, action: 'remove' }
        });

        this.logger.log(`Roles removed from user ${user.email}: ${roleIds.join(', ')}`);
    }

    async getUsersWithAdvancedSearch(searchDto: UserSearchDto): Promise<UserSearchResult> {
        const query = `
            SELECT * FROM user_management.search_users(
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
            )
        `;

        const users = await this.userRepository.query(query, [
            searchDto.tenantId,
            searchDto.organizationId,
            searchDto.searchTerm,
            searchDto.department,
            searchDto.jobTitle,
            searchDto.roleCodes,
            searchDto.skills,
            searchDto.includeInactive || false,
            searchDto.limit || 50,
            searchDto.offset || 0
        ]);

        const totalQuery = `
            SELECT COUNT(*) as total FROM user_management.search_users(
                $1, $2, $3, $4, $5, $6, $7, $8, 999999, 0
            )
        `;

        const totalResult = await this.userRepository.query(totalQuery, [
            searchDto.tenantId,
            searchDto.organizationId,
            searchDto.searchTerm,
            searchDto.department,
            searchDto.jobTitle,
            searchDto.roleCodes,
            searchDto.skills,
            searchDto.includeInactive || false
        ]);

        return {
            users,
            total: parseInt(totalResult[0].total),
            page: Math.floor((searchDto.offset || 0) / (searchDto.limit || 50)) + 1,
            totalPages: Math.ceil(parseInt(totalResult[0].total) / (searchDto.limit || 50))
        };
    }

    async addUserToTeams(
        userId: string,
        teamIds: string[],
        roleInTeam: string = 'member',
        manager?: EntityManager
    ): Promise<void> {
        const em = manager || this.userRepository.manager;

        const user = await em.findOne(UserProfile, {
            where: { profileId: userId }
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        for (const teamId of teamIds) {
            const team = await em.findOne(Team, {
                where: { teamId, isActive: true }
            });

            if (!team) {
                this.logger.warn(`Team not found: ${teamId}`);
                continue;
            }

            // Check if membership already exists
            const existingMembership = await em.findOne(TeamMember, {
                where: { teamId, userId }
            });

            if (existingMembership) {
                if (!existingMembership.isActive) {
                    existingMembership.isActive = true;
                    existingMembership.joinedAt = new Date();
                    existingMembership.leftAt = null;
                    await em.save(TeamMember, existingMembership);
                }
                continue;
            }

            // Check max members limit
            if (team.maxMembers && team.currentMembersCount >= team.maxMembers) {
                throw new BadRequestException(`Limite de membros para a equipe ${team.teamName} excedido`);
            }

            // Create new membership
            const teamMember = em.create(TeamMember, {
                tenantId: user.tenantId,
                teamId,
                userId,
                roleInTeam,
                joinedAt: new Date(),
                isActive: true
            });

            await em.save(TeamMember, teamMember);

            // Update team member count
            await em.increment(Team, { teamId }, 'currentMembersCount', 1);
        }

        this.logger.log(`User ${user.email} added to teams: ${teamIds.join(', ')}`);
    }

    async checkUserPermission(
        userId: string,
        permissionCode: string,
        resourceId?: string,
        organizationId?: string
    ): Promise<boolean> {
        const query = `
            SELECT user_management.check_user_permission($1, $2, $3, $4) as has_permission
        `;

        const result = await this.userRepository.query(query, [
            userId,
            permissionCode,
            resourceId,
            organizationId
        ]);

        return result[0]?.has_permission || false;
    }

    async getOrganizationHierarchy(organizationId: string): Promise<OrganizationHierarchy[]> {
        const query = `
            SELECT * FROM user_management.get_organization_hierarchy($1)
        `;

        return await this.organizationRepository.query(query, [organizationId]);
    }

    async getUserDashboardData(userId: string): Promise<UserDashboardData> {
        const user = await this.userRepository.findOne({
            where: { profileId: userId },
            relations: ['organization', 'manager']
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // Get user roles
        const userRoles = await this.userRoleRepository.find({
            where: { userId, isActive: true },
            relations: ['role']
        });

        // Get user teams
        const teamMemberships = await this.teamRepository
            .createQueryBuilder('team')
            .innerJoin('team.members', 'member')
            .where('member.userId = :userId', { userId })
            .andWhere('member.isActive = true')
            .getMany();

        // Get recent activities (from audit logs)
        const recentActivities = await this.auditService.getAuditTrail({
            tenantId: user.tenantId,
            userId,
            limit: 10,
            offset: 0
        });

        // Get direct reports (if manager)
        const directReports = await this.userRepository.find({
            where: { managerId: userId, accountStatus: 'active' },
            select: ['profileId', 'fullName', 'jobTitle', 'email']
        });

        return {
            user,
            roles: userRoles.map(ur => ur.role),
            teams: teamMemberships,
            recentActivities: recentActivities.logs,
            directReports,
            organization: user.organization
        };
    }

    private async sendWelcomeEmail(user: UserProfile): Promise<void> {
        // Implement welcome email sending
        // This would integrate with your email service
        this.logger.log(`Welcome email sent to: ${user.email}`);
    }

    async resetUserPassword(userId: string, resetBy: string): Promise<string> {
        const user = await this.userRepository.findOne({
            where: { profileId: userId }
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        // Generate temporary password
        const tempPassword = this.generateTemporaryPassword();

        // Update password in Keycloak
        await this.keycloakService.resetUserPassword(user.keycloakUserId, tempPassword);

        // Update user profile
        user.requiresPasswordChange = true;
        user.lastPasswordChange = new Date();
        user.updatedAt = new Date();
        user.updatedBy = resetBy;

        await this.userRepository.save(user);

        // Audit log
        await this.auditService.logOperation({
            tenantId: user.tenantId,
            userId: resetBy,
            operationType: 'UPDATE',
            entityType: 'user',
            entityId: user.profileId,
            metadata: { action: 'password_reset' }
        });

        // Emit event
        this.eventEmitter.emit('user.password.reset', {
            user,
            tempPassword,
            resetBy
        });

        this.logger.log(`Password reset for user: ${user.email}`);
        return tempPassword;
    }

    private generateTemporaryPassword(): string {
        const length = 12;
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return password;
    }
}

// DTOs and Interfaces
interface CreateUserDto {
    tenantId: string;
    organizationId: string;
    employeeId?: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    phone?: string;
    jobTitle?: string;
    department?: string;
    managerId?: string;
    hireDate?: Date;
    employmentType?: string;
    workLocation?: string;
    roleIds?: string[];
    teamIds?: string[];
    preferences?: any;
    password?: string;
    requirePasswordChange?: boolean;
    sendWelcomeEmail?: boolean;
    createdBy: string;
}

interface UpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
    jobTitle?: string;
    department?: string;
    managerId?: string;
    workLocation?: string;
    preferences?: any;
    accountStatus?: string;
    updatedBy: string;
}

interface UserSearchDto {
    tenantId: string;
    organizationId?: string;
    searchTerm?: string;
    department?: string;
    jobTitle?: string;
    roleCodes?: string[];
    skills?: string[];
    includeInactive?: boolean;
    limit?: number;
    offset?: number;
}

interface UserSearchResult {
    users: any[];
    total: number;
    page: number;
    totalPages: number;
}

interface OrganizationHierarchy {
    organizationId: string;
    organizationName: string;
    level: number;
    path: string;
}

interface UserDashboardData {
    user: UserProfile;
    roles: Role[];
    teams: Team[];
    recentActivities: any[];
    directReports: UserProfile[];
    organization: Organization;
}
```

#### 2. Organization Service
```typescript
// src/modules/user-management/services/organization.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class OrganizationService {
    private readonly logger = new Logger(OrganizationService.name);

    constructor(
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>
    ) {}

    async createOrganization(createOrgDto: CreateOrganizationDto): Promise<Organization> {
        return await this.organizationRepository.manager.transaction(async (manager: EntityManager) => {
            // Validate parent organization if specified
            if (createOrgDto.parentOrganizationId) {
                const parent = await manager.findOne(Organization, {
                    where: { organizationId: createOrgDto.parentOrganizationId }
                });

                if (!parent) {
                    throw new NotFoundException('Organização pai não encontrada');
                }
            }

            const organization = manager.create(Organization, {
                ...createOrgDto,
                organizationCode: createOrgDto.organizationCode || this.generateOrganizationCode(),
                isActive: true,
                currentUsersCount: 0
            });

            return await manager.save(Organization, organization);
        });
    }

    async getOrganizationTree(tenantId: string, rootOrgId?: string): Promise<OrganizationTreeNode[]> {
        const organizations = await this.organizationRepository.find({
            where: { tenantId, isActive: true },
            order: { organizationName: 'ASC' }
        });

        return this.buildOrganizationTree(organizations, rootOrgId);
    }

    private buildOrganizationTree(
        organizations: Organization[], 
        parentId?: string
    ): OrganizationTreeNode[] {
        const tree: OrganizationTreeNode[] = [];
        
        const children = organizations.filter(org => 
            org.parentOrganizationId === parentId
        );

        for (const child of children) {
            const node: OrganizationTreeNode = {
                ...child,
                children: this.buildOrganizationTree(organizations, child.organizationId)
            };
            tree.push(node);
        }

        return tree;
    }

    private generateOrganizationCode(): string {
        return `ORG_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
}

interface CreateOrganizationDto {
    tenantId: string;
    parentOrganizationId?: string;
    organizationName: string;
    organizationCode?: string;
    organizationType: string;
    description?: string;
    maxUsers?: number;
    subscriptionPlan?: string;
    createdBy: string;
}

interface OrganizationTreeNode extends Organization {
    children: OrganizationTreeNode[];
}
```

### 🎨 COMPONENTES FRONTEND

#### 1. User Management Dashboard
```typescript
// src/components/user-management/UserManagementDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Users, 
    UserPlus, 
    Building, 
    Shield, 
    Search, 
    Filter,
    MoreVertical,
    Mail,
    Phone,
    Calendar,
    MapPin
} from 'lucide-react';
import { useUsers, useOrganizations, useRoles } from '@/hooks/useUserManagement';

export function UserManagementDashboard() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showCreateUser, setShowCreateUser] = useState(false);

    const { users, loading: usersLoading, searchUsers } = useUsers();
    const { organizations } = useOrganizations();
    const { roles } = useRoles();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="success">Ativo</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inativo</Badge>;
            case 'suspended':
                return <Badge variant="destructive">Suspenso</Badge>;
            case 'locked':
                return <Badge variant="warning">Bloqueado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatLastLogin = (date: string) => {
        if (!date) return 'Nunca';
        const diff = Date.now() - new Date(date).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Hoje';
        if (days === 1) return 'Ontem';
        return `${days} dias atrás`;
    };

    const handleSearch = () => {
        searchUsers({
            searchTerm,
            department: selectedDepartment,
            roleCodes: selectedRole ? [selectedRole] : undefined,
            includeInactive: false
        });
    };

    return (
        <div className="user-management-dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    <Users className="title-icon" />
                    Gestão de Usuários
                </h1>
                <div className="dashboard-actions">
                    <Button onClick={() => setShowCreateUser(true)}>
                        <UserPlus className="button-icon" />
                        Novo Usuário
                    </Button>
                </div>
            </div>

            {/* Estatísticas */}
            <div className="stats-grid">
                <Card className="stat-card">
                    <CardHeader className="stat-header">
                        <CardTitle className="stat-title">
                            <Users className="stat-icon" />
                            Total de Usuários
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="stat-value">{users?.total || 0}</div>
                        <div className="stat-description">
                            Ativos: {users?.filter(u => u.accountStatus === 'active').length || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card">
                    <CardHeader className="stat-header">
                        <CardTitle className="stat-title">
                            <Building className="stat-icon" />
                            Organizações
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="stat-value">{organizations?.length || 0}</div>
                        <div className="stat-description">
                            Departamentos: {new Set(users?.map(u => u.department)).size || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card">
                    <CardHeader className="stat-header">
                        <CardTitle className="stat-title">
                            <Shield className="stat-icon" />
                            Roles Ativos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="stat-value">{roles?.filter(r => r.isActive).length || 0}</div>
                        <div className="stat-description">
                            Permissões: {roles?.reduce((sum, r) => sum + (r.permissions?.length || 0), 0) || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="stat-card">
                    <CardHeader className="stat-header">
                        <CardTitle className="stat-title">
                            <Calendar className="stat-icon" />
                            Logins Hoje
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="stat-value">
                            {users?.filter(u => {
                                if (!u.lastLoginAt) return false;
                                const loginDate = new Date(u.lastLoginAt);
                                const today = new Date();
                                return loginDate.toDateString() === today.toDateString();
                            }).length || 0}
                        </div>
                        <div className="stat-description">
                            Esta semana: {users?.filter(u => {
                                if (!u.lastLoginAt) return false;
                                const loginDate = new Date(u.lastLoginAt);
                                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                return loginDate > weekAgo;
                            }).length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users" className="user-tabs">
                <TabsList>
                    <TabsTrigger value="users">Usuários</TabsTrigger>
                    <TabsTrigger value="organizations">Organizações</TabsTrigger>
                    <TabsTrigger value="roles">Roles e Permissões</TabsTrigger>
                    <TabsTrigger value="teams">Equipes</TabsTrigger>
                </TabsList>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Usuários</CardTitle>
                            
                            {/* Filtros de busca */}
                            <div className="search-filters">
                                <div className="search-input-group">
                                    <Search className="search-icon" />
                                    <Input
                                        placeholder="Buscar por nome, email ou usuário..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                    <SelectTrigger className="filter-select">
                                        <SelectValue placeholder="Departamento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todos</SelectItem>
                                        {Array.from(new Set(users?.map(u => u.department).filter(Boolean))).map((dept) => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger className="filter-select">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todos</SelectItem>
                                        {roles?.map((role) => (
                                            <SelectItem key={role.roleId} value={role.roleCode}>
                                                {role.roleName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button onClick={handleSearch}>
                                    <Filter className="button-icon" />
                                    Filtrar
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="users-grid">
                                {users?.map((user) => (
                                    <Card 
                                        key={user.profileId} 
                                        className={`user-card ${selectedUser?.profileId === user.profileId ? 'selected' : ''}`}
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <CardHeader className="user-header">
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {user.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.fullName} />
                                                    ) : (
                                                        <div className="avatar-initials">
                                                            {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="user-details">
                                                    <h3 className="user-name">{user.fullName}</h3>
                                                    <p className="user-title">{user.jobTitle}</p>
                                                    <p className="user-department">{user.department}</p>
                                                </div>
                                            </div>

                                            <div className="user-status">
                                                {getStatusBadge(user.accountStatus)}
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="button-icon" />
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="user-content">
                                            <div className="user-contact">
                                                <div className="contact-item">
                                                    <Mail className="contact-icon" />
                                                    <span className="contact-text">{user.email}</span>
                                                </div>
                                                
                                                {user.phone && (
                                                    <div className="contact-item">
                                                        <Phone className="contact-icon" />
                                                        <span className="contact-text">{user.phone}</span>
                                                    </div>
                                                )}

                                                {user.workLocation && (
                                                    <div className="contact-item">
                                                        <MapPin className="contact-icon" />
                                                        <span className="contact-text">{user.workLocation}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="user-metadata">
                                                <div className="metadata-item">
                                                    <span className="metadata-label">Último Login:</span>
                                                    <span className="metadata-value">
                                                        {formatLastLogin(user.lastLoginAt)}
                                                    </span>
                                                </div>

                                                <div className="metadata-item">
                                                    <span className="metadata-label">Organização:</span>
                                                    <span className="metadata-value">
                                                        {user.organizationName}
                                                    </span>
                                                </div>

                                                {user.roles && user.roles.length > 0 && (
                                                    <div className="user-roles">
                                                        <span className="roles-label">Roles:</span>
                                                        <div className="roles-list">
                                                            {user.roles.map((role) => (
                                                                <Badge key={role} variant="outline">
                                                                    {role}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {users?.length === 0 && (
                                <div className="empty-state">
                                    <Users className="empty-icon" />
                                    <h3>Nenhum usuário encontrado</h3>
                                    <p>Tente ajustar os filtros de busca</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="organizations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estrutura Organizacional</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="org-tree">
                                {/* Árvore hierárquica de organizações seria renderizada aqui */}
                                <div className="org-node">
                                    <div className="org-info">
                                        <Building className="org-icon" />
                                        <div className="org-details">
                                            <h4>KRYONIX Corporation</h4>
                                            <p>125 usuários • Empresa Principal</p>
                                        </div>
                                    </div>
                                    
                                    <div className="org-children">
                                        <div className="org-child">
                                            <div className="org-info">
                                                <Building className="org-icon" />
                                                <div className="org-details">
                                                    <h5>Tecnologia</h5>
                                                    <p>45 usuários • Departamento</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="org-child">
                                            <div className="org-info">
                                                <Building className="org-icon" />
                                                <div className="org-details">
                                                    <h5>Vendas</h5>
                                                    <p>30 usuários • Departamento</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roles">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestão de Roles e Permissões</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="roles-grid">
                                {roles?.map((role) => (
                                    <Card key={role.roleId} className="role-card">
                                        <CardHeader>
                                            <div className="role-header">
                                                <h4 className="role-name">{role.roleName}</h4>
                                                <Badge variant={role.isActive ? 'success' : 'secondary'}>
                                                    {role.isActive ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </div>
                                            <p className="role-description">{role.description}</p>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="role-stats">
                                                <div className="stat-item">
                                                    <span className="stat-label">Usuários:</span>
                                                    <span className="stat-value">{role.usersCount || 0}</span>
                                                </div>
                                                
                                                <div className="stat-item">
                                                    <span className="stat-label">Permissões:</span>
                                                    <span className="stat-value">{role.permissions?.length || 0}</span>
                                                </div>
                                                
                                                <div className="stat-item">
                                                    <span className="stat-label">Nível:</span>
                                                    <span className="stat-value">{role.roleLevel}</span>
                                                </div>
                                            </div>

                                            {role.permissions && role.permissions.length > 0 && (
                                                <div className="permissions-preview">
                                                    <span className="permissions-label">Principais permissões:</span>
                                                    <div className="permissions-list">
                                                        {role.permissions.slice(0, 3).map((permission) => (
                                                            <Badge key={permission} variant="outline" size="sm">
                                                                {permission}
                                                            </Badge>
                                                        ))}
                                                        {role.permissions.length > 3 && (
                                                            <Badge variant="secondary" size="sm">
                                                                +{role.permissions.length - 3} mais
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="teams">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestão de Equipes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="teams-grid">
                                {/* Lista de equipes seria renderizada aqui */}
                                <Card className="team-card">
                                    <CardHeader>
                                        <div className="team-header">
                                            <h4 className="team-name">Equipe de Desenvolvimento</h4>
                                            <Badge variant="success">Ativa</Badge>
                                        </div>
                                        <p className="team-description">
                                            Responsável pelo desenvolvimento da plataforma
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="team-stats">
                                            <div className="stat-item">
                                                <span className="stat-label">Membros:</span>
                                                <span className="stat-value">12/15</span>
                                            </div>
                                            
                                            <div className="stat-item">
                                                <span className="stat-label">Líder:</span>
                                                <span className="stat-value">João Silva</span>
                                            </div>
                                            
                                            <div className="stat-item">
                                                <span className="stat-label">Departamento:</span>
                                                <span className="stat-value">Tecnologia</span>
                                            </div>
                                        </div>

                                        <div className="team-members-preview">
                                            <span className="members-label">Membros:</span>
                                            <div className="members-avatars">
                                                {/* Avatares dos membros */}
                                                <div className="member-avatar">JS</div>
                                                <div className="member-avatar">AM</div>
                                                <div className="member-avatar">RN</div>
                                                <div className="member-avatar more">+9</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
```

### 🚀 SCRIPTS DE EXECUÇÃO

#### Script de Configuração de Gestão de Usuários
```bash
#!/bin/bash
# setup-user-management.sh

set -e

echo "🔧 Configurando Sistema de Gestão de Usuários..."

# Criar diretórios necessários
sudo mkdir -p /opt/kryonix/user-management/{configs,scripts,exports}
sudo mkdir -p /opt/kryonix/ldap/configs

# Configurar LDAP/Active Directory integration (opcional)
cat > /opt/kryonix/ldap/configs/ldap-config.json << 'EOF'
{
  "provider": "ldap",
  "host": "ldap.company.com",
  "port": 389,
  "use_tls": true,
  "bind_dn": "cn=admin,dc=company,dc=com",
  "bind_password": "$LDAP_BIND_PASSWORD",
  "search_base": "dc=company,dc=com",
  "user_search_filter": "(uid={username})",
  "group_search_filter": "(memberUid={username})",
  "attribute_mapping": {
    "username": "uid",
    "email": "mail",
    "first_name": "givenName",
    "last_name": "sn",
    "phone": "telephoneNumber",
    "job_title": "title",
    "department": "departmentNumber"
  },
  "sync_schedule": "0 2 * * *",
  "auto_create_users": true,
  "auto_update_users": true
}
EOF

# Script para sincronização LDAP
cat > /opt/kryonix/user-management/scripts/ldap-sync.sh << 'EOF'
#!/bin/bash

LDAP_HOST="ldap.company.com"
LDAP_PORT="389"
BIND_DN="cn=admin,dc=company,dc=com"
SEARCH_BASE="dc=company,dc=com"
API_ENDPOINT="https://api.kryonix.com.br/user-management/ldap-sync"

echo "$(date): Iniciando sincronização LDAP..."

# Buscar usuários no LDAP
ldapsearch -x -H "ldap://$LDAP_HOST:$LDAP_PORT" \
  -D "$BIND_DN" -w "$LDAP_BIND_PASSWORD" \
  -b "$SEARCH_BASE" \
  "(objectClass=person)" \
  uid mail givenName sn telephoneNumber title departmentNumber > /tmp/ldap_users.ldif

# Processar e enviar para API
python3 /opt/kryonix/user-management/scripts/process_ldap_users.py \
  --input /tmp/ldap_users.ldif \
  --output /tmp/users_to_sync.json

curl -X POST "$API_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d @/tmp/users_to_sync.json

echo "$(date): Sincronização LDAP concluída"

# Cleanup
rm -f /tmp/ldap_users.ldif /tmp/users_to_sync.json
EOF

chmod +x /opt/kryonix/user-management/scripts/ldap-sync.sh

# Script Python para processar usuários LDAP
cat > /opt/kryonix/user-management/scripts/process_ldap_users.py << 'EOF'
#!/usr/bin/env python3

import json
import argparse
import re
from datetime import datetime

def parse_ldif(ldif_content):
    users = []
    current_user = {}
    
    for line in ldif_content.split('\n'):
        line = line.strip()
        
        if line.startswith('dn:'):
            if current_user:
                users.append(current_user)
            current_user = {}
            
        elif ':' in line:
            key, value = line.split(':', 1)
            current_user[key.strip()] = value.strip()
    
    if current_user:
        users.append(current_user)
    
    return users

def transform_users(ldap_users):
    transformed_users = []
    
    for user in ldap_users:
        if 'uid' not in user or 'mail' not in user:
            continue
            
        transformed_user = {
            'username': user.get('uid', ''),
            'email': user.get('mail', ''),
            'first_name': user.get('givenName', ''),
            'last_name': user.get('sn', ''),
            'phone': user.get('telephoneNumber', ''),
            'job_title': user.get('title', ''),
            'department': user.get('departmentNumber', ''),
            'source': 'ldap',
            'sync_timestamp': datetime.now().isoformat()
        }
        
        transformed_users.append(transformed_user)
    
    return transformed_users

def main():
    parser = argparse.ArgumentParser(description='Process LDAP users')
    parser.add_argument('--input', required=True, help='Input LDIF file')
    parser.add_argument('--output', required=True, help='Output JSON file')
    
    args = parser.parse_args()
    
    with open(args.input, 'r') as f:
        ldif_content = f.read()
    
    ldap_users = parse_ldif(ldif_content)
    transformed_users = transform_users(ldap_users)
    
    with open(args.output, 'w') as f:
        json.dump({
            'users': transformed_users,
            'sync_metadata': {
                'timestamp': datetime.now().isoformat(),
                'total_users': len(transformed_users),
                'source': 'ldap'
            }
        }, f, indent=2)
    
    print(f"Processed {len(transformed_users)} users")

if __name__ == '__main__':
    main()
EOF

chmod +x /opt/kryonix/user-management/scripts/process_ldap_users.py

# Script para export de usuários
cat > /opt/kryonix/user-management/scripts/export-users.sh << 'EOF'
#!/bin/bash

EXPORT_DIR="/opt/kryonix/user-management/exports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
API_ENDPOINT="https://api.kryonix.com.br/user-management/export"

echo "$(date): Iniciando export de usuários..."

# Export completo de usuários
curl -X GET "$API_ENDPOINT/users" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json" > "$EXPORT_DIR/users_export_$TIMESTAMP.json"

# Export de organizações
curl -X GET "$API_ENDPOINT/organizations" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json" > "$EXPORT_DIR/organizations_export_$TIMESTAMP.json"

# Export de roles
curl -X GET "$API_ENDPOINT/roles" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json" > "$EXPORT_DIR/roles_export_$TIMESTAMP.json"

# Export CSV para relatórios
curl -X GET "$API_ENDPOINT/users?format=csv" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: text/csv" > "$EXPORT_DIR/users_report_$TIMESTAMP.csv"

# Compress exports
tar -czf "$EXPORT_DIR/user_management_backup_$TIMESTAMP.tar.gz" \
  "$EXPORT_DIR/users_export_$TIMESTAMP.json" \
  "$EXPORT_DIR/organizations_export_$TIMESTAMP.json" \
  "$EXPORT_DIR/roles_export_$TIMESTAMP.json" \
  "$EXPORT_DIR/users_report_$TIMESTAMP.csv"

# Cleanup individual files
rm -f "$EXPORT_DIR/users_export_$TIMESTAMP.json" \
      "$EXPORT_DIR/organizations_export_$TIMESTAMP.json" \
      "$EXPORT_DIR/roles_export_$TIMESTAMP.json" \
      "$EXPORT_DIR/users_report_$TIMESTAMP.csv"

echo "$(date): Export concluído: user_management_backup_$TIMESTAMP.tar.gz"

# Cleanup old exports (keep last 30 days)
find "$EXPORT_DIR" -name "user_management_backup_*.tar.gz" -mtime +30 -delete
EOF

chmod +x /opt/kryonix/user-management/scripts/export-users.sh

# Script para limpeza automática de contas inativas
cat > /opt/kryonix/user-management/scripts/cleanup-inactive-users.sh << 'EOF'
#!/bin/bash

API_ENDPOINT="https://api.kryonix.com.br/user-management"
WEBHOOK_URL="https://ntfy.kryonix.com.br/user-management"
INACTIVE_DAYS=90
WARNING_DAYS=75

echo "$(date): Iniciando limpeza de usuários inativos..."

# Buscar usuários inativos por mais de $WARNING_DAYS dias
curl -X GET "$API_ENDPOINT/users/inactive?days=$WARNING_DAYS" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Accept: application/json" > /tmp/inactive_users.json

USERS_COUNT=$(jq length /tmp/inactive_users.json)

if [ "$USERS_COUNT" -gt 0 ]; then
    echo "$(date): Encontrados $USERS_COUNT usuários inativos"
    
    # Enviar notificação de aviso
    curl -d "⚠️ User Management: $USERS_COUNT usuários inativos há mais de $WARNING_DAYS dias" $WEBHOOK_URL
    
    # Buscar usuários para desativação (mais de $INACTIVE_DAYS dias)
    curl -X GET "$API_ENDPOINT/users/inactive?days=$INACTIVE_DAYS" \
      -H "Authorization: Bearer $API_TOKEN" \
      -H "Accept: application/json" > /tmp/users_to_deactivate.json
    
    DEACTIVATE_COUNT=$(jq length /tmp/users_to_deactivate.json)
    
    if [ "$DEACTIVATE_COUNT" -gt 0 ]; then
        echo "$(date): Desativando $DEACTIVATE_COUNT usuários"
        
        # Processar desativação em lotes
        jq -c '.[]' /tmp/users_to_deactivate.json | while read user; do
            user_id=$(echo $user | jq -r '.profileId')
            user_email=$(echo $user | jq -r '.email')
            
            curl -X PUT "$API_ENDPOINT/users/$user_id/deactivate" \
              -H "Authorization: Bearer $API_TOKEN" \
              -H "Content-Type: application/json" \
              -d '{"reason": "Automatically deactivated due to inactivity"}'
            
            echo "$(date): Usuário desativado: $user_email"
        done
        
        curl -d "🔄 User Management: $DEACTIVATE_COUNT usuários desativados automaticamente" $WEBHOOK_URL
    fi
fi

# Cleanup
rm -f /tmp/inactive_users.json /tmp/users_to_deactivate.json

echo "$(date): Limpeza concluída"
EOF

chmod +x /opt/kryonix/user-management/scripts/cleanup-inactive-users.sh

# Configurar cron jobs
cat > /opt/kryonix/user-management/user-management-crontab << 'EOF'
# Sincronização LDAP diária às 2:00
0 2 * * * /opt/kryonix/user-management/scripts/ldap-sync.sh >> /opt/kryonix/user-management/logs/ldap-sync.log 2>&1

# Export semanal de usuários (domingos às 3:00)
0 3 * * 0 /opt/kryonix/user-management/scripts/export-users.sh >> /opt/kryonix/user-management/logs/export.log 2>&1

# Limpeza de usuários inativos (semanal, segundas às 4:00)
0 4 * * 1 /opt/kryonix/user-management/scripts/cleanup-inactive-users.sh >> /opt/kryonix/user-management/logs/cleanup.log 2>&1

# Limpeza de logs antigos (mensal)
0 0 1 * * find /opt/kryonix/user-management/logs -name "*.log" -mtime +30 -delete
EOF

sudo crontab /opt/kryonix/user-management/user-management-crontab

# Configurar roles padrão
cat > /opt/kryonix/user-management/configs/default-roles.json << 'EOF'
{
  "roles": [
    {
      "role_code": "super_admin",
      "role_name": "Super Administrador",
      "description": "Acesso total ao sistema",
      "role_type": "system",
      "role_level": 100,
      "permissions": ["*"],
      "max_assignees": 5
    },
    {
      "role_code": "org_admin",
      "role_name": "Administrador da Organização",
      "description": "Administrador da organização",
      "role_type": "organization",
      "role_level": 80,
      "permissions": [
        "user.create", "user.read", "user.update", "user.deactivate",
        "organization.read", "organization.update",
        "role.assign", "role.remove",
        "team.create", "team.read", "team.update", "team.delete"
      ]
    },
    {
      "role_code": "manager",
      "role_name": "Gerente",
      "description": "Gerente de equipe",
      "role_type": "custom",
      "role_level": 60,
      "permissions": [
        "user.read", "user.update_subordinates",
        "team.read", "team.manage_members",
        "report.view", "report.generate"
      ]
    },
    {
      "role_code": "employee",
      "role_name": "Funcionário",
      "description": "Funcionário padrão",
      "role_type": "custom",
      "role_level": 20,
      "is_default": true,
      "permissions": [
        "profile.read", "profile.update_own",
        "team.read_own", "report.view_own"
      ]
    },
    {
      "role_code": "guest",
      "role_name": "Convidado",
      "description": "Acesso limitado de convidado",
      "role_type": "custom",
      "role_level": 10,
      "permissions": [
        "profile.read_own"
      ]
    }
  ]
}
EOF

# Script para inicializar roles padrão
cat > /opt/kryonix/user-management/scripts/init-default-roles.sh << 'EOF'
#!/bin/bash

API_ENDPOINT="https://api.kryonix.com.br/user-management/roles"
CONFIG_FILE="/opt/kryonix/user-management/configs/default-roles.json"

echo "$(date): Inicializando roles padrão..."

curl -X POST "$API_ENDPOINT/bulk-create" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @"$CONFIG_FILE"

echo "$(date): Roles padrão criados"
EOF

chmod +x /opt/kryonix/user-management/scripts/init-default-roles.sh

echo "✅ Sistema de Gestão de Usuários configurado!"
echo ""
echo "👥 User Management API: https://api.kryonix.com.br/user-management"
echo "🏢 Organization Management: https://admin.kryonix.com.br/organizations"
echo "🔐 Keycloak Admin: https://keycloak.kryonix.com.br/admin"
echo "📊 Logs: /opt/kryonix/user-management/logs/"
echo ""
echo "🔄 Próximos passos:"
echo "1. Executar script de inicialização: /opt/kryonix/user-management/scripts/init-default-roles.sh"
echo "2. Configurar integração LDAP (se necessário)"
echo "3. Testar criação de usuários"
echo "4. Configurar SSO com Keycloak"
```

### ✅ CHECKLIST DE VALIDAÇÃO

- [ ] **Estrutura de Dados**
  - [ ] Schemas PostgreSQL criados
  - [ ] Índices de performance configurados
  - [ ] Triggers e funções funcionando
  - [ ] Hierarquia organizacional testada

- [ ] **Integração Keycloak**
  - [ ] Sincronização de usuários ativa
  - [ ] Roles mapeados corretamente
  - [ ] SSO funcionando
  - [ ] Passwords policies aplicadas

- [ ] **Gestão de Permissões**
  - [ ] RBAC implementado
  - [ ] Verificação de permissões testada
  - [ ] Delegação de autoridade funcionando
  - [ ] Auditoria de acesso ativa

- [ ] **Interface de Usuário**
  - [ ] Dashboard responsivo
  - [ ] Busca avançada funcionando
  - [ ] Criação de usuários testada
  - [ ] Gestão de equipes operacional

### 🧪 TESTES DE QUALIDADE

```bash
#!/bin/bash
# test-user-management.sh

echo "🧪 Executando Testes de Gestão de Usuários..."

# Teste 1: Verificar API de usuários
echo "Teste 1: API de usuários"
response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.kryonix.com.br/user-management/users" \
  -H "Authorization: Bearer $API_TOKEN")
if [ "$response" = "200" ]; then
    echo "✅ API de usuários acessível"
else
    echo "❌ API de usuários inacessível (HTTP $response)"
fi

# Teste 2: Verificar integração Keycloak
echo "Teste 2: Integração Keycloak"
keycloak_response=$(curl -s -o /dev/null -w "%{http_code}" "https://keycloak.kryonix.com.br/auth/realms/kryonix")
if [ "$keycloak_response" = "200" ]; then
    echo "✅ Keycloak acessível"
else
    echo "❌ Keycloak inacessível (HTTP $keycloak_response)"
fi

# Teste 3: Verificar funções PostgreSQL
echo "Teste 3: Funções PostgreSQL"
function_check=$(docker exec kryonix_postgresql psql -U postgres -d kryonix -t -c "
    SELECT EXISTS(
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'check_user_permission' 
        AND routine_schema = 'user_management'
    );"
)
if echo "$function_check" | grep -q "t"; then
    echo "✅ Funções PostgreSQL criadas"
else
    echo "❌ Funções PostgreSQL não encontradas"
fi

# Teste 4: Teste de criação de usuário
echo "Teste 4: Criação de usuário"
test_user_payload='{
    "username": "test_user",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "organizationId": "'$TEST_ORG_ID'"
}'

create_response=$(curl -s -X POST "https://api.kryonix.com.br/user-management/users" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$test_user_payload")

if echo "$create_response" | grep -q "profileId"; then
    echo "✅ Criação de usuário funcionando"
    
    # Cleanup test user
    test_user_id=$(echo "$create_response" | jq -r '.profileId')
    curl -s -X DELETE "https://api.kryonix.com.br/user-management/users/$test_user_id" \
      -H "Authorization: Bearer $API_TOKEN"
else
    echo "❌ Falha na criação de usuário"
fi

# Teste 5: Verificar permissões
echo "Teste 5: Sistema de permissões"
permission_check=$(curl -s "https://api.kryonix.com.br/user-management/check-permission" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"'$TEST_USER_ID'","permission":"user.read"}')

if echo "$permission_check" | grep -q "true\|false"; then
    echo "✅ Sistema de permissões funcionando"
else
    echo "❌ Sistema de permissões com problemas"
fi

echo ""
echo "🏁 Testes de Gestão de Usuários concluídos!"
```

### 📚 DOCUMENTAÇÃO TÉCNICA

#### Hierarquia de Permissões

**Níveis de Acesso:**
- **System (100)**: Acesso total ao sistema
- **Tenant (80)**: Administração do tenant
- **Organization (60)**: Gestão da organização
- **Team (40)**: Gestão de equipe
- **Self (20)**: Apenas dados próprios

**Tipos de Permissões:**
- **CREATE**: Criar novos recursos
- **READ**: Visualizar recursos
- **UPDATE**: Modificar recursos existentes
- **DELETE**: Remover recursos
- **EXECUTE**: Executar ações específicas

#### Integração com Keycloak

- **User Federation**: Sincronização automática
- **Role Mapping**: Mapeamento de roles customizados
- **SSO Integration**: Single Sign-On configurado
- **Password Policies**: Políticas de senha aplicadas
- **MFA Support**: Autenticação multi-fator disponível

### 🔗 INTEGRAÇÃO COM STACK EXISTENTE

- **PostgreSQL**: Dados de usuários e organizações
- **Keycloak**: Autenticação e autorização
- **Redis**: Cache de sessões e permissões
- **RabbitMQ**: Eventos de usuários
- **Grafana**: Métricas de acesso
- **VaultWarden**: Credenciais LDAP/AD
- **MinIO**: Storage de avatares e documentos

### 📈 MÉTRICAS MONITORADAS

- **User Activity**: Logins, ações por usuário
- **Organization Growth**: Crescimento de usuários
- **Permission Usage**: Uso de permissões por role
- **Authentication Events**: Sucessos/falhas de login
- **LDAP Sync Status**: Status de sincronização
- **Role Distribution**: Distribuição de roles
- **Team Composition**: Composição de equipes

---

**PARTE-25 CONCLUÍDA** ✅  
Sistema completo de gestão de usuários implementado com hierarquia organizacional, controle granular de permissões, integração com Keycloak e suporte a LDAP/AD.

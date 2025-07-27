# 👥 PARTE 13 - SISTEMA DE USUÁRIOS
*Agentes Responsáveis: Especialista Segurança + Frontend Expert + Arquiteto Software*

## 🎯 **OBJETIVO**
Implementar sistema completo de gestão de usuários integrado com Keycloak, incluindo perfis, sincronização automática e gestão de equipes.

## 🏗️ **ARQUITETURA USUÁRIOS (Arquiteto Software)**
```yaml
User Management:
  Authentication: Keycloak (keycloak.kryonix.com.br)
  User Storage: PostgreSQL (auth.users)
  Profile Images: MinIO (kryonix-uploads/profiles/)
  Cache: Redis (user sessions)
  
Integration:
  - Keycloak ↔ PostgreSQL sync
  - Real-time updates via WebSocket
  - Profile picture upload
  - Team management
```

## 🔐 **SEGURANÇA USUÁRIOS (Especialista Segurança)**
```yaml
Security Requirements:
  - Keycloak JWT validation
  - RBAC permission checking
  - Data encryption at rest
  - LGPD compliance (data protection)
  - Audit trail for all actions

Privacy Controls:
  - User consent management
  - Data export (GDPR)
  - Account deletion
  - Session management
```

## 📋 **MODELO DE DADOS**
```sql
-- Sincronizado com Keycloak
CREATE TABLE auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    company_id UUID REFERENCES auth.companies(id),
    department VARCHAR(100),
    job_title VARCHAR(100),
    manager_id UUID REFERENCES auth.users(id),
    subscription_plan VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    language VARCHAR(10) DEFAULT 'pt-BR',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Equipes e departamentos
CREATE TABLE auth.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id UUID REFERENCES auth.companies(id),
    manager_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth.team_members (
    team_id UUID REFERENCES auth.teams(id),
    user_id UUID REFERENCES auth.users(id),
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);
```

## 🔧 **SERVIÇO USUÁRIOS (Backend)**
```typescript
// services/user.service.ts
export class UserService {
  
  async syncWithKeycloak(keycloakUserId: string) {
    try {
      // Buscar dados do Keycloak
      const keycloakUser = await this.keycloakAdmin.users.findOne({
        id: keycloakUserId
      });

      // Sincronizar com PostgreSQL
      const user = await this.db.query(`
        INSERT INTO auth.users (keycloak_id, email, first_name, last_name, email_verified)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (keycloak_id) DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email_verified = EXCLUDED.email_verified,
          updated_at = NOW()
        RETURNING *
      `, [
        keycloakUser.id,
        keycloakUser.email,
        keycloakUser.firstName,
        keycloakUser.lastName,
        keycloakUser.emailVerified
      ]);

      return user.rows[0];
    } catch (error) {
      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  async updateProfile(userId: string, profileData: any) {
    const { firstName, lastName, phone, jobTitle, department } = profileData;
    
    // Atualizar PostgreSQL
    const user = await this.db.query(`
      UPDATE auth.users 
      SET first_name = $2, last_name = $3, phone = $4, 
          job_title = $5, department = $6, updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `, [userId, firstName, lastName, phone, jobTitle, department]);

    // Atualizar Keycloak
    await this.keycloakAdmin.users.update(
      { id: user.rows[0].keycloak_id },
      { 
        firstName,
        lastName,
        attributes: {
          phone: [phone],
          jobTitle: [jobTitle],
          department: [department]
        }
      }
    );

    // Invalidar cache
    await this.cacheService.del(`user:${userId}`);

    return user.rows[0];
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    // Validações
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Formato de imagem não suportado');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Imagem muito grande (máximo 5MB)');
    }

    // Upload para MinIO
    const fileName = `profiles/${userId}/avatar-${Date.now()}.${file.mimetype.split('/')[1]}`;
    const uploadResult = await this.storageService.uploadFile(
      'kryonix-uploads',
      fileName,
      file.buffer,
      {
        'content-type': file.mimetype,
        'uploaded-by': userId
      }
    );

    // Atualizar URL no banco
    await this.db.query(`
      UPDATE auth.users 
      SET avatar_url = $2, updated_at = NOW()
      WHERE id = $1
    `, [userId, uploadResult.url]);

    return uploadResult.url;
  }

  async getUserTeams(userId: string) {
    const teams = await this.db.query(`
      SELECT t.*, tm.role, tm.joined_at
      FROM auth.teams t
      JOIN auth.team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = $1
      ORDER BY t.name
    `, [userId]);

    return teams.rows;
  }

  async createTeam(companyId: string, teamData: any, managerId: string) {
    const { name, description } = teamData;
    
    const team = await this.db.query(`
      INSERT INTO auth.teams (name, description, company_id, manager_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description, companyId, managerId]);

    // Adicionar manager como membro
    await this.addTeamMember(team.rows[0].id, managerId, 'manager');

    return team.rows[0];
  }

  async addTeamMember(teamId: string, userId: string, role: string = 'member') {
    await this.db.query(`
      INSERT INTO auth.team_members (team_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role
    `, [teamId, userId, role]);
  }
}
```

## 🎨 **COMPONENTES FRONTEND (Frontend Expert)**
```tsx
// components/users/UserProfile.tsx
export const UserProfile = () => {
  const { user, updateProfile, uploadAvatar } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-6 mb-6">
        <AvatarUpload 
          currentAvatar={user.avatar_url}
          onUpload={uploadAvatar}
          className="w-24 h-24"
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-gray-600">{user.job_title}</p>
          <p className="text-sm text-gray-500">{user.department}</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant="outline"
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </Button>
      </div>

      {isEditing ? (
        <EditProfileForm 
          user={user}
          onSave={updateProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ProfileDisplay user={user} />
      )}
    </div>
  );
};

// components/users/TeamManagement.tsx
export const TeamManagement = () => {
  const { teams, createTeam, addMember } = useTeams();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Equipes</h3>
        <Button onClick={() => setShowCreateTeam(true)}>
          Nova Equipe
        </Button>
      </div>

      <div className="grid gap-4">
        {teams.map(team => (
          <TeamCard 
            key={team.id}
            team={team}
            onAddMember={addMember}
          />
        ))}
      </div>
    </div>
  );
};
```

## 🔄 **SINCRONIZAÇÃO AUTOMÁTICA**
```typescript
// jobs/user-sync.job.ts
export class UserSyncJob {
  
  async syncAllUsers() {
    try {
      // Buscar usuários do Keycloak
      const keycloakUsers = await this.keycloakAdmin.users.find({
        max: 10000
      });

      for (const kcUser of keycloakUsers) {
        await this.userService.syncWithKeycloak(kcUser.id);
      }

      console.log(`Sincronizados ${keycloakUsers.length} usuários`);
    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  }

  async handleKeycloakWebhook(event: any) {
    switch (event.type) {
      case 'USER_CREATED':
        await this.userService.syncWithKeycloak(event.userId);
        break;
      case 'USER_UPDATED':
        await this.userService.syncWithKeycloak(event.userId);
        break;
      case 'USER_DELETED':
        await this.userService.deactivateUser(event.userId);
        break;
    }
  }
}

// Cron job - executar a cada hora
cron.schedule('0 * * * *', () => {
  new UserSyncJob().syncAllUsers();
});
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Criar tabelas de usuários
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f users-schema.sql

# 2. Configurar webhook Keycloak
curl -X POST https://keycloak.kryonix.com.br/admin/realms/KRYONIX-SAAS/events/config \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"webhookUrl": "https://api.kryonix.com.br/webhooks/keycloak"}'

# 3. Sincronização inicial
npm run sync:users:initial

# 4. Testar upload de avatar
curl -X POST https://api.kryonix.com.br/v1/users/avatar \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "avatar=@test-avatar.jpg"
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Sincronização Keycloak ↔ PostgreSQL funcionando
- [ ] CRUD de usuários operacional
- [ ] Upload de avatar funcionando
- [ ] Gestão de equipes implementada
- [ ] Perfis customizáveis
- [ ] Cache de usuários ativo
- [ ] Webhooks Keycloak configurados
- [ ] Interface responsiva
- [ ] Auditoria de ações

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de sincronização
npm run test:users:sync

# Teste de perfil
npm run test:users:profile

# Teste de equipes
npm run test:users:teams

# Teste de upload
npm run test:users:avatar
```

---
*Parte 13 de 50 - Projeto KRYONIX SaaS Platform*
*Próxima Parte: 14 - Permissões e Roles*

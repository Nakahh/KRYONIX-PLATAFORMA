# ⚙️ PARTE 15 - MÓDULO DE CONFIGURAÇÃO
*Agentes Responsáveis: Frontend Expert + Backend Expert + DevOps*

## 🎯 **OBJETIVO**
Implementar sistema de configurações customizáveis por empresa/usuário para personalizar comportamento da plataforma KRYONIX SaaS.

## 🏗️ **ARQUITETURA CONFIGURAÇÕES**
```yaml
Configuration System:
  Storage: PostgreSQL (config schema)
  Cache: Redis (hot configs)
  Validation: JSON Schema
  Encryption: Sensitive data encrypted
  
Types:
  - System: Configurações globais (admin only)
  - Company: Por empresa/tenant
  - User: Preferências individuais
  - Integration: APIs e webhooks
```

## 📋 **MODELO DE DADOS**
```sql
-- Schema de configurações
CREATE SCHEMA IF NOT EXISTS config;

-- Tipos de configuração
CREATE TYPE config.config_type AS ENUM ('system', 'company', 'user', 'integration');
CREATE TYPE config.data_type AS ENUM ('string', 'number', 'boolean', 'json', 'encrypted');

-- Definições de configuração (metadados)
CREATE TABLE config.definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type config.config_type NOT NULL,
    data_type config.data_type NOT NULL DEFAULT 'string',
    default_value TEXT,
    validation_schema JSONB,
    is_required BOOLEAN DEFAULT false,
    is_sensitive BOOLEAN DEFAULT false,
    category VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Valores de configuração
CREATE TABLE config.values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID REFERENCES config.definitions(id) ON DELETE CASCADE,
    entity_type config.config_type NOT NULL,
    entity_id VARCHAR(255), -- company_id, user_id, 'system', etc
    value TEXT,
    encrypted_value BYTEA,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(definition_id, entity_type, entity_id)
);

-- Histórico de alterações
CREATE TABLE config.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    definition_id UUID REFERENCES config.definitions(id),
    entity_type config.config_type,
    entity_id VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
```

## 🔧 **SERVIÇO DE CONFIGURAÇÕES**
```typescript
// services/config.service.ts
export class ConfigService {
  
  async get<T = any>(
    key: string, 
    entityType: 'system' | 'company' | 'user',
    entityId?: string
  ): Promise<T | null> {
    const cacheKey = `config:${entityType}:${entityId || 'system'}:${key}`;
    
    // Verificar cache primeiro
    let value = await this.cacheService.get<T>(cacheKey);
    if (value !== null) {
      return value;
    }

    // Buscar no banco
    const result = await this.db.query(`
      SELECT cv.value, cv.encrypted_value, cd.data_type, cd.is_sensitive
      FROM config.values cv
      JOIN config.definitions cd ON cv.definition_id = cd.id
      WHERE cd.key = $1 
        AND cv.entity_type = $2 
        AND cv.entity_id = $3
        AND cv.is_active = true
    `, [key, entityType, entityId || 'system']);

    if (result.rows.length === 0) {
      // Buscar valor padrão
      const defaultResult = await this.db.query(`
        SELECT default_value, data_type
        FROM config.definitions
        WHERE key = $1
      `, [key]);

      if (defaultResult.rows.length > 0) {
        value = this.parseValue(
          defaultResult.rows[0].default_value,
          defaultResult.rows[0].data_type
        );
      }
    } else {
      const row = result.rows[0];
      const rawValue = row.is_sensitive 
        ? await this.decryptValue(row.encrypted_value)
        : row.value;
      
      value = this.parseValue(rawValue, row.data_type);
    }

    // Cache por 1 hora
    if (value !== null) {
      await this.cacheService.set(cacheKey, value, 3600);
    }

    return value;
  }

  async set(
    key: string,
    value: any,
    entityType: 'system' | 'company' | 'user',
    entityId: string,
    userId: string
  ): Promise<void> {
    // Buscar definição
    const definition = await this.db.query(`
      SELECT * FROM config.definitions WHERE key = $1
    `, [key]);

    if (definition.rows.length === 0) {
      throw new Error(`Configuração '${key}' não encontrada`);
    }

    const def = definition.rows[0];

    // Validar valor
    await this.validateValue(value, def);

    // Buscar valor atual para auditoria
    const currentValue = await this.get(key, entityType, entityId);

    // Preparar valor para salvar
    let valueToSave = null;
    let encryptedValue = null;

    if (def.is_sensitive) {
      encryptedValue = await this.encryptValue(String(value));
    } else {
      valueToSave = String(value);
    }

    // Salvar configuração
    await this.db.query(`
      INSERT INTO config.values 
        (definition_id, entity_type, entity_id, value, encrypted_value, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (definition_id, entity_type, entity_id)
      DO UPDATE SET 
        value = EXCLUDED.value,
        encrypted_value = EXCLUDED.encrypted_value,
        updated_at = NOW(),
        created_by = EXCLUDED.created_by
    `, [def.id, entityType, entityId, valueToSave, encryptedValue, userId]);

    // Auditoria
    await this.logChange(def.id, entityType, entityId, currentValue, value, userId);

    // Invalidar cache
    const cacheKey = `config:${entityType}:${entityId}:${key}`;
    await this.cacheService.del(cacheKey);
  }

  async getCompanyConfigs(companyId: string): Promise<Record<string, any>> {
    const configs = await this.db.query(`
      SELECT cd.key, cv.value, cv.encrypted_value, cd.data_type, cd.is_sensitive, cd.category
      FROM config.definitions cd
      LEFT JOIN config.values cv ON cd.id = cv.definition_id 
        AND cv.entity_type = 'company' 
        AND cv.entity_id = $1
        AND cv.is_active = true
      WHERE cd.type IN ('company', 'system')
      ORDER BY cd.category, cd.order_index
    `, [companyId]);

    const result: Record<string, any> = {};
    
    for (const row of configs.rows) {
      const rawValue = row.value || row.default_value;
      const value = row.is_sensitive && row.encrypted_value
        ? await this.decryptValue(row.encrypted_value)
        : rawValue;
      
      result[row.key] = this.parseValue(value, row.data_type);
    }

    return result;
  }

  private parseValue(value: string, dataType: string): any {
    if (!value) return null;

    switch (dataType) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  private async validateValue(value: any, definition: any): Promise<void> {
    if (definition.is_required && (value === null || value === undefined)) {
      throw new Error(`Configuração '${definition.key}' é obrigatória`);
    }

    if (definition.validation_schema) {
      const ajv = new Ajv();
      const validate = ajv.compile(definition.validation_schema);
      
      if (!validate(value)) {
        throw new Error(`Valor inválido para '${definition.key}': ${ajv.errorsText(validate.errors)}`);
      }
    }
  }

  private async encryptValue(value: string): Promise<Buffer> {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.CONFIG_ENCRYPTION_KEY!);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return Buffer.from(encrypted, 'hex');
  }

  private async decryptValue(encryptedBuffer: Buffer): Promise<string> {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.CONFIG_ENCRYPTION_KEY!);
    let decrypted = decipher.update(encryptedBuffer.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

## 🎨 **COMPONENTES FRONTEND**
```tsx
// components/config/ConfigurationPanel.tsx
export const ConfigurationPanel = () => {
  const { configs, updateConfig, loading } = useConfigurations();
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', name: 'Geral', icon: <SettingsIcon /> },
    { id: 'integrations', name: 'Integrações', icon: <LinkIcon /> },
    { id: 'notifications', name: 'Notificações', icon: <BellIcon /> },
    { id: 'security', name: 'Segurança', icon: <ShieldIcon /> },
    { id: 'appearance', name: 'Aparência', icon: <PaletteIcon /> }
  ];

  return (
    <div className="flex h-full">
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">Configurações</h2>
        </div>
        <nav className="mt-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'w-full flex items-center px-4 py-2 text-left hover:bg-gray-50',
                activeCategory === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              )}
            >
              {category.icon}
              <span className="ml-3">{category.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-6">
        <ConfigCategory 
          category={activeCategory}
          configs={configs}
          onUpdate={updateConfig}
          loading={loading}
        />
      </div>
    </div>
  );
};

// components/config/ConfigField.tsx
interface ConfigFieldProps {
  config: ConfigDefinition;
  value: any;
  onChange: (key: string, value: any) => void;
}

export const ConfigField = ({ config, value, onChange }: ConfigFieldProps) => {
  const renderField = () => {
    switch (config.data_type) {
      case 'boolean':
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(checked) => onChange(config.key, checked)}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(config.key, Number(e.target.value))}
          />
        );
      
      case 'json':
        return (
          <Textarea
            value={value ? JSON.stringify(value, null, 2) : ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange(config.key, parsed);
              } catch (error) {
                // Mostrar erro de validação
              }
            }}
            rows={6}
          />
        );
      
      default:
        return (
          <Input
            type={config.is_sensitive ? 'password' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(config.key, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={config.key}>
        {config.name}
        {config.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {config.description && (
        <p className="text-sm text-gray-500">{config.description}</p>
      )}
    </div>
  );
};
```

## 🔧 **CONFIGURAÇÕES PADRÃO**
```sql
-- Inserir configurações básicas do sistema
INSERT INTO config.definitions (key, name, description, type, data_type, category, order_index) VALUES
('app.name', 'Nome da Aplicação', 'Nome exibido da aplicação', 'system', 'string', 'general', 1),
('app.logo_url', 'URL do Logo', 'URL do logo da empresa', 'company', 'string', 'appearance', 1),
('app.theme', 'Tema', 'Tema da interface (light/dark)', 'user', 'string', 'appearance', 2),
('app.timezone', 'Fuso Horário', 'Fuso horário padrão', 'company', 'string', 'general', 2),
('app.language', 'Idioma', 'Idioma da interface', 'user', 'string', 'general', 3),

-- Integrações
('email.provider', 'Provedor de Email', 'Serviço de email (sendgrid, mautic)', 'company', 'string', 'integrations', 1),
('email.api_key', 'API Key Email', 'Chave da API do provedor', 'company', 'encrypted', 'integrations', 2),
('whatsapp.api_url', 'URL Evolution API', 'URL da Evolution API', 'company', 'string', 'integrations', 3),
('whatsapp.api_key', 'Chave Evolution API', 'Token de acesso', 'company', 'encrypted', 'integrations', 4),

-- Notificações
('notifications.email_enabled', 'Email Ativo', 'Enviar notificações por email', 'user', 'boolean', 'notifications', 1),
('notifications.whatsapp_enabled', 'WhatsApp Ativo', 'Enviar notificações por WhatsApp', 'user', 'boolean', 'notifications', 2),
('notifications.in_app_enabled', 'Notificações In-App', 'Mostrar notificações na aplicação', 'user', 'boolean', 'notifications', 3),

-- Segurança
('security.session_timeout', 'Timeout Sessão', 'Tempo limite da sessão (minutos)', 'company', 'number', 'security', 1),
('security.password_policy', 'Política de Senha', 'Regras de senha', 'company', 'json', 'security', 2),
('security.mfa_required', 'MFA Obrigatório', 'Exigir autenticação multifator', 'company', 'boolean', 'security', 3);
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Criar schema de configurações
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f config-schema.sql

# 2. Inserir configurações padrão
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f default-configs.sql

# 3. Testar configuração
curl -X GET https://api.kryonix.com.br/v1/config/company/123 \
  -H "Authorization: Bearer $JWT_TOKEN"

# 4. Atualizar configuração
curl -X PUT https://api.kryonix.com.br/v1/config/app.theme \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"value": "dark"}'
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Schema de configurações criado
- [ ] Configurações padrão inseridas
- [ ] Cache Redis funcionando
- [ ] Validação de valores ativa
- [ ] Criptografia para dados sensíveis
- [ ] Interface de configuração criada
- [ ] Auditoria de alterações
- [ ] Configurações por tenant
- [ ] API de configuração operacional

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de configurações
npm run test:config:crud

# Teste de validação
npm run test:config:validation

# Teste de criptografia
npm run test:config:encryption

# Teste de cache
npm run test:config:cache
```

---
*Parte 15 de 50 - Projeto KRYONIX SaaS Platform*
*Próxima Parte: 16 - Sistema de Notificações*

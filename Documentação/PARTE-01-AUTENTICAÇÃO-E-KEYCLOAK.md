# 🔐 PARTE 01 - AUTENTICAÇÃO E KEYCLOAK MULTI-TENANT
*Agentes Responsáveis: Especialista Segurança + Arquiteto Software + IA Builder*

---

## 🎯 **CONTEXTO MULTI-TENANT KRYONIX**

```yaml
ARQUITETURA_MULTITENANCY:
  estratégia: "Realms isolados por cliente + SDK unificado"
  mobile_priority: "80% dos usuários são mobile (biometria prioritária)"
  auto_creation: "Setup automático em 2-5 minutos via IA"
  sdk_integration: "@kryonix/sdk para autenticação unificada"
  
  ESTRUTURA:
    - Multi-tenancy: Realms separados kryonix-cliente-{id}
    - SDK Integration: kryonix.auth.login(clienteId, credentials)
    - Mobile Priority: Autenticação biométrica como padrão
    - Auto-Creation: Realm automático quando cliente é criado
    - 8 APIs Integration: Tokens específicos por módulo contratado
    - Subdomains: Autenticação por cliente.kryonix.com.br
    - WhatsApp Evolution: Integração autenticação via WhatsApp
```

---

## 🏗️ **ARQUITETURA MULTI-TENANT (Arquiteto Software)**

### **🔐 KEYCLOAK MULTI-TENANT STRUCTURE**
```yaml
Keycloak Multi-Tenant Architecture:
  base_url: "https://keycloak.kryonix.com.br"
  admin_realm: "KRYONIX-MASTER"
  
  CLIENT_REALMS:
    pattern: "kryonix-cliente-{cliente_id}"
    examples:
      - "kryonix-cliente-siqueiracampos"
      - "kryonix-cliente-clinicamedica"
      - "kryonix-cliente-advocacia123"
    
    isolation: "Complete separation between clients"
    
  AUTHENTICATION_FLOW:
    1: "Cliente acessa: cliente.kryonix.com.br"
    2: "Sistema identifica cliente_id do subdomínio"
    3: "Redirecionamento para realm específico"
    4: "Autenticação no realm isolado do cliente"
    5: "Token JWT com scopes dos módulos contratados"
    
  MOBILE_PRIORITY:
    biometric_auth: "80% dos usuários mobile"
    supported_methods: ["TouchID", "FaceID", "Fingerprint", "PIN"]
    fallback: "WhatsApp OTP + Email backup"
```

### **📱 SDK AUTHENTICATION INTEGRATION**
```typescript
// @kryonix/sdk - Autenticação unificada
class KryonixAuth {
  constructor(private config: KryonixConfig) {
    this.baseURL = 'https://api.kryonix.com.br';
    this.keycloakURL = 'https://keycloak.kryonix.com.br';
    this.clienteId = this.extractClienteId(config);
  }

  // Login principal - detecção automática de cliente
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const clienteId = await this.detectClienteFromDomain();
    const realmName = `kryonix-cliente-${clienteId}`;
    
    // Priorizar autenticação biométrica se disponível
    if (this.isMobile() && await this.isBiometricAvailable()) {
      return await this.biometricLogin(clienteId, credentials);
    }
    
    // Fallback para autenticação tradicional
    return await this.traditionalLogin(realmName, credentials);
  }

  // Autenticação biométrica (mobile priority)
  async biometricLogin(clienteId: string, credentials: LoginCredentials): Promise<AuthResult> {
    console.log(`🔐 Iniciando autenticação biométrica para ${clienteId}...`);
    
    // 1. Verificar se usuário já tem biometria cadastrada
    const biometricData = await this.getBiometricData(credentials.username);
    
    if (biometricData) {
      // 2. Solicitar autenticação biométrica
      const biometricResult = await this.promptBiometric();
      
      if (biometricResult.success) {
        // 3. Autenticar com token biométrico
        return await this.authenticateWithBiometric(clienteId, biometricResult.token);
      }
    }
    
    // 4. Fallback para senha se biometria falhar
    return await this.traditionalLogin(`kryonix-cliente-${clienteId}`, credentials);
  }

  // Login tradicional com realm específico
  async traditionalLogin(realmName: string, credentials: LoginCredentials): Promise<AuthResult> {
    const keycloak = new Keycloak({
      url: this.keycloakURL,
      realm: realmName,
      clientId: 'kryonix-frontend'
    });

    try {
      const authenticated = await keycloak.login({
        username: credentials.username,
        password: credentials.password
      });

      if (authenticated) {
        // Token com scopes específicos dos módulos contratados
        const token = keycloak.token;
        const parsedToken = this.parseToken(token);
        const modulosPermitidos = parsedToken.resource_access['kryonix-frontend'].roles;

        return {
          success: true,
          token: token,
          refreshToken: keycloak.refreshToken,
          modulosPermitidos: modulosPermitidos,
          clienteId: parsedToken.cliente_id,
          expiresIn: parsedToken.exp
        };
      }
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      
      // Fallback para WhatsApp OTP se credenciais falharem
      if (credentials.whatsapp) {
        return await this.whatsappOTPLogin(credentials.whatsapp);
      }
      
      throw new Error('Falha na autenticação');
    }
  }

  // Autenticação via WhatsApp OTP
  async whatsappOTPLogin(whatsappNumber: string): Promise<AuthResult> {
    console.log(`📱 Iniciando autenticação WhatsApp para ${whatsappNumber}...`);
    
    // 1. Gerar OTP
    const otp = await this.generateOTP();
    
    // 2. Enviar via Evolution API
    await this.evolutionAPI.sendMessage({
      to: whatsappNumber,
      message: `🔐 Seu código de acesso KRYONIX: ${otp}\n\n⏰ Válido por 5 minutos.\n\n🚫 Não compartilhe este código.`
    });

    // 3. Aguardar confirmação do usuário
    const userOTP = await this.promptOTPInput();
    
    // 4. Validar OTP
    if (await this.validateOTP(otp, userOTP)) {
      // 5. Buscar usuário pelo WhatsApp
      const usuario = await this.findUserByWhatsApp(whatsappNumber);
      
      // 6. Gerar token temporário
      return await this.generateTemporaryToken(usuario);
    }
    
    throw new Error('Código OTP inválido');
  }

  // Detecção automática de cliente pelo domínio
  private async detectClienteFromDomain(): Promise<string> {
    const hostname = window.location.hostname;
    
    // Detectar subdomínio: cliente.kryonix.com.br
    if (hostname.includes('.kryonix.com.br')) {
      return hostname.split('.')[0];
    }
    
    // Fallback para detecção via API
    const response = await fetch(`${this.baseURL}/auth/detect-client`, {
      headers: { 'X-Origin': hostname }
    });
    
    const data = await response.json();
    return data.cliente_id;
  }

  // Verificar módulos contratados
  async getPermittedModules(clienteId: string): Promise<string[]> {
    const response = await fetch(`${this.baseURL}/auth/modules/${clienteId}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    const data = await response.json();
    return data.modulos_contratados;
  }
}

// Exemplo de uso do SDK
const kryonix = new KryonixSDK({
  clienteId: 'siqueiracampos',
  apiKey: 'sk_siqueira_campos_abc123'
});

// Login automático com detecção de cliente
const authResult = await kryonix.auth.login({
  username: 'vitor@siqueiracampos.com.br',
  password: 'senhaSegura123',
  whatsapp: '+551799999999' // Fallback opcional
});

// Verificar módulos disponíveis
const modulos = await kryonix.auth.getPermittedModules();
console.log('📋 Módulos disponíveis:', modulos); // ['crm', 'agendamento', 'whatsapp']
```

---

## 🔐 **SEGURANÇA MULTI-TENANT (Especialista Segurança)**

### **🛡️ ISOLAMENTO E SEGURANÇA**
```yaml
Security Multi-Tenant Requirements:
  realm_isolation:
    - "Complete data separation between clients"
    - "No cross-tenant access possible"
    - "Dedicated JWT signing keys per client"
    
  mobile_security:
    biometric_encryption: "Local device secure enclave"
    token_storage: "Encrypted keychain (iOS) / Keystore (Android)"
    certificate_pinning: "Prevent MITM attacks"
    
  api_security:
    rate_limiting: "Per client_id rate limits"
    scope_validation: "Only contracted modules accessible"
    audit_logging: "All auth events logged by client"
    
  compliance:
    lgpd: "Data residency in Brazil"
    gdpr: "Right to be forgotten per client"
    soc2: "Audit trail per tenant"
    
  password_policies:
    mobile_priority: "Biometric preferred, passwords as backup"
    strength_requirements: "Configurable per client"
    mfa_enforcement: "Required for admin users"
```

### **🔒 IMPLEMENTAÇÃO SEGURANÇA**
```typescript
class KryonixSecurity {
  // Validação de token com escopo de módulo
  async validateModuleAccess(token: string, moduleName: string, clienteId: string): Promise<boolean> {
    try {
      // 1. Validar token JWT
      const decoded = jwt.verify(token, await this.getRealmPublicKey(clienteId));
      
      // 2. Verificar se cliente do token confere
      if (decoded.cliente_id !== clienteId) {
        throw new Error('Token não pertence ao cliente');
      }
      
      // 3. Verificar se módulo está nos scopes
      const scopes = decoded.resource_access['kryonix-frontend'].roles;
      if (!scopes.includes(moduleName)) {
        throw new Error(`Módulo ${moduleName} não contratado`);
      }
      
      // 4. Verificar status do cliente (pagamento em dia)
      const cliente = await this.getClienteStatus(clienteId);
      if (cliente.status !== 'ativo') {
        throw new Error('Cliente inativo - verificar pagamento');
      }
      
      return true;
    } catch (error) {
      console.error(`🚫 Acesso negado para ${moduleName}:`, error.message);
      return false;
    }
  }

  // Auditoria específica por cliente
  async logAuthEvent(clienteId: string, event: AuthEvent): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      cliente_id: clienteId,
      event_type: event.type,
      user_id: event.userId,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      success: event.success,
      module_accessed: event.module,
      device_info: event.deviceInfo
    };

    // Log isolado por cliente
    await this.database.query(
      `INSERT INTO kryonix_cliente_${clienteId}.auth_logs`,
      logEntry
    );

    // Log centralizado para KRYONIX (anonimizado)
    await this.centralizedLogger.log({
      ...logEntry,
      cliente_id: this.hashClienteId(clienteId) // Hash para privacidade
    });
  }

  // Rotação automática de chaves por cliente
  async rotateClientKeys(clienteId: string): Promise<void> {
    console.log(`🔄 Rotacionando chaves para cliente ${clienteId}...`);
    
    // 1. Gerar novas chaves
    const newKeys = await this.generateKeyPair();
    
    // 2. Atualizar no Keycloak
    await this.keycloakAdmin.updateRealmKeys(`kryonix-cliente-${clienteId}`, newKeys);
    
    // 3. Invalidar tokens antigos gradualmente (grace period de 24h)
    await this.scheduleTokenInvalidation(clienteId, '24h');
    
    // 4. Notificar aplicações para refresh
    await this.notifyApplicationsKeyRotation(clienteId);
  }
}
```

---

## 🤖 **CRIAÇÃO AUTOMÁTICA DE CLIENTES (IA Builder)**

### **⚡ PROCESSO AUTOMÁTICO DE SETUP**
```typescript
class AutoClientCreation {
  async criarClienteCompleto(dadosCliente: NovoClienteData): Promise<ClienteCreationResult> {
    console.log(`🚀 Iniciando criação automática para ${dadosCliente.nome}...`);
    
    const startTime = Date.now();
    const clienteId = this.generateClienteId(dadosCliente.nome);
    
    try {
      // 1. IA cria realm específico no Keycloak
      await this.criarRealmKeycloak(clienteId, dadosCliente);
      
      // 2. IA configura autenticação mobile
      await this.configurarAuthMobile(clienteId, dadosCliente);
      
      // 3. IA configura módulos contratados
      await this.configurarModulosContratados(clienteId, dadosCliente.modulosContratados);
      
      // 4. IA cria usuário admin inicial
      await this.criarAdminInicial(clienteId, dadosCliente.adminUser);
      
      // 5. IA gera tokens de integração
      const tokens = await this.gerarTokensIntegracao(clienteId);
      
      // 6. IA configura subdomínio
      await this.configurarSubdominio(clienteId, dadosCliente.subdomain);
      
      // 7. IA envia credenciais por WhatsApp
      await this.enviarCredenciaisWhatsApp(dadosCliente, tokens);
      
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      console.log(`✅ Cliente ${clienteId} criado em ${duration} segundos!`);
      
      return {
        cliente_id: clienteId,
        realm_name: `kryonix-cliente-${clienteId}`,
        subdomain: `${clienteId}.kryonix.com.br`,
        admin_credentials: tokens.admin,
        api_tokens: tokens.api,
        modules_enabled: dadosCliente.modulosContratados,
        creation_time: duration,
        status: 'ativo'
      };
      
    } catch (error) {
      console.error(`❌ Erro na criação do cliente ${clienteId}:`, error);
      
      // IA tenta rollback automático
      await this.rollbackClienteCreation(clienteId);
      throw error;
    }
  }

  private async criarRealmKeycloak(clienteId: string, dados: NovoClienteData): Promise<void> {
    const realmName = `kryonix-cliente-${clienteId}`;
    
    console.log(`🏗️ Criando realm ${realmName}...`);
    
    const realmConfig = {
      realm: realmName,
      enabled: true,
      displayName: `KRYONIX - ${dados.nome}`,
      displayNameHtml: `<strong>KRYONIX</strong> - ${dados.nome}`,
      
      // Configurações de segurança específicas
      bruteForceProtected: true,
      permanentLockout: false,
      maxFailureWaitSeconds: 900,
      failureFactor: 5,
      
      // Configurações mobile-first
      browserSecurityHeaders: {
        'xFrameOptions': 'SAMEORIGIN',
        'contentSecurityPolicy': "frame-src 'self'; frame-ancestors 'self'; object-src 'none';"
      },
      
      // Configurações de token
      accessTokenLifespan: 3600, // 1 hora
      refreshTokenMaxReuse: 0,
      revokeRefreshToken: true,
      
      // Themes customizados por cliente
      loginTheme: 'kryonix-custom',
      accountTheme: 'kryonix-custom',
      
      // Configurações específicas do cliente
      attributes: {
        'cliente_id': clienteId,
        'cliente_nome': dados.nome,
        'modulos_contratados': dados.modulosContratados.join(','),
        'mobile_priority': 'true'
      }
    };

    await this.keycloakAdmin.createRealm(realmConfig);
    
    // Configurar client específico
    await this.configurarClientKeycloak(realmName, clienteId, dados);
  }

  private async enviarCredenciaisWhatsApp(dados: NovoClienteData, tokens: TokensResult): Promise<void> {
    const mensagem = `
🎉 *KRYONIX - Plataforma Pronta!*

Olá ${dados.nome}! Sua plataforma foi criada com sucesso em ${tokens.creation_time} segundos.

🌐 *Acesso Web:*
https://${dados.subdomain || `${this.generateClienteId(dados.nome)}.kryonix.com.br`}

👤 *Credenciais Admin:*
📧 Email: ${dados.adminUser.email}
🔑 Senha: ${tokens.admin.temporary_password}
⚠️ *Altere a senha no primeiro login*

📱 *Apps Mobile:*
🤖 Android: https://downloads.kryonix.com.br/${dados.clienteId}/android.apk
🍎 iOS: https://downloads.kryonix.com.br/${dados.clienteId}/ios.ipa

📋 *Módulos Ativos:*
${dados.modulosContratados.map(m => `✅ ${m.toUpperCase()}`).join('\n')}

🔑 *Token API:*
\`\`\`${tokens.api.access_token}\`\`\`

📞 *Suporte:* +55 17 98180-5327
🌐 *Portal:* https://admin.kryonix.com.br

*Bem-vindo ao futuro dos negócios!* 🚀
    `;

    await this.evolutionAPI.sendMessage({
      to: dados.whatsappContato,
      message: mensagem
    });
  }
}
```

---

## 🔧 **COMANDOS DE EXECUÇÃO MULTI-TENANT**

### **🛠️ SETUP COMPLETO KEYCLOAK MULTI-TENANT**
```bash
#!/bin/bash

# KRYONIX - Setup Keycloak Multi-Tenant Completo
echo "🚀 Iniciando setup Keycloak Multi-Tenant KRYONIX..."

# 1. Verificar Keycloak funcionando
echo "📡 Verificando Keycloak..."
curl -I https://keycloak.kryonix.com.br || {
    echo "❌ Keycloak não acessível"
    exit 1
}

# 2. Obter token admin
echo "🔐 Obtendo token administrativo..."
ADMIN_TOKEN=$(curl -s -X POST "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Falha ao obter token admin"
    exit 1
fi

echo "✅ Token obtido com sucesso"

# 3. Criar realm master KRYONIX se não existir
echo "🏗️ Configurando realm master KRYONIX..."
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "KRYONIX-MASTER",
    "enabled": true,
    "displayName": "KRYONIX Master Realm",
    "attributes": {
      "multi_tenant": "true",
      "mobile_priority": "true"
    }
  }' || echo "⚠️ Realm master já existe"

# 4. Script de criação automática de cliente
cat > /usr/local/bin/kryonix-create-client.sh << 'EOF'
#!/bin/bash

# KRYONIX - Criação Automática de Cliente
# Uso: kryonix-create-client.sh <nome_cliente> <email_admin> <whatsapp> <modulos>

CLIENTE_NOME="$1"
ADMIN_EMAIL="$2"
WHATSAPP="$3"
MODULOS="$4"

if [ $# -lt 4 ]; then
    echo "Uso: $0 <nome_cliente> <email_admin> <whatsapp> <modulos>"
    echo "Exemplo: $0 'Clínica Exemplo' 'admin@clinica.com' '+5517999999999' 'crm,agendamento,whatsapp'"
    exit 1
fi

CLIENTE_ID=$(echo "$CLIENTE_NOME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g' | cut -c1-20)
REALM_NAME="kryonix-cliente-${CLIENTE_ID}"
TEMP_PASSWORD=$(openssl rand -base64 12)

echo "🚀 Criando cliente: $CLIENTE_ID"
echo "📧 Admin: $ADMIN_EMAIL"
echo "📱 WhatsApp: $WHATSAPP"
echo "📋 Módulos: $MODULOS"

# 1. Criar realm
echo "🏗️ Criando realm $REALM_NAME..."
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"realm\": \"$REALM_NAME\",
    \"enabled\": true,
    \"displayName\": \"KRYONIX - $CLIENTE_NOME\",
    \"attributes\": {
      \"cliente_id\": \"$CLIENTE_ID\",
      \"cliente_nome\": \"$CLIENTE_NOME\",
      \"modulos_contratados\": \"$MODULOS\",
      \"mobile_priority\": \"true\"
    }
  }"

# 2. Criar client
echo "🔧 Configurando client..."
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"kryonix-frontend\",
    \"enabled\": true,
    \"redirectUris\": [\"https://${CLIENTE_ID}.kryonix.com.br/*\"],
    \"webOrigins\": [\"https://${CLIENTE_ID}.kryonix.com.br\"],
    \"publicClient\": false,
    \"standardFlowEnabled\": true,
    \"directAccessGrantsEnabled\": true
  }"

# 3. Criar usuário admin
echo "👤 Criando usuário admin..."
curl -s -X POST "https://keycloak.kryonix.com.br/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$ADMIN_EMAIL\",
    \"email\": \"$ADMIN_EMAIL\",
    \"enabled\": true,
    \"emailVerified\": true,
    \"credentials\": [{
      \"type\": \"password\",
      \"value\": \"$TEMP_PASSWORD\",
      \"temporary\": true
    }],
    \"attributes\": {
      \"cliente_id\": [\"$CLIENTE_ID\"],
      \"whatsapp\": [\"$WHATSAPP\"]
    }
  }"

# 4. Configurar subdomínio no Traefik
echo "🌐 Configurando subdomínio..."
cat > "/etc/traefik/dynamic/${CLIENTE_ID}.yml" << TRAEFIK_EOF
http:
  routers:
    ${CLIENTE_ID}-router:
      rule: "Host(\`${CLIENTE_ID}.kryonix.com.br\`)"
      service: ${CLIENTE_ID}-service
      tls:
        certResolver: letsencrypt
  services:
    ${CLIENTE_ID}-service:
      loadBalancer:
        servers:
          - url: "http://frontend:3000"
        healthCheck:
          path: /health
TRAEFIK_EOF

# 5. Criar configuração do cliente
echo "⚙️ Salvando configuração..."
cat > "/etc/kryonix/clients/${CLIENTE_ID}.env" << CONFIG_EOF
CLIENTE_ID=${CLIENTE_ID}
CLIENTE_NOME=${CLIENTE_NOME}
ADMIN_EMAIL=${ADMIN_EMAIL}
WHATSAPP=${WHATSAPP}
MODULOS=${MODULOS}
REALM_NAME=${REALM_NAME}
SUBDOMAIN=${CLIENTE_ID}.kryonix.com.br
TEMP_PASSWORD=${TEMP_PASSWORD}
CREATED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
CONFIG_EOF

# 6. Enviar credenciais via WhatsApp
echo "📱 Enviando credenciais via WhatsApp..."
curl -s -X POST "http://evolution:8080/message/sendText/kryonix" \
  -H "Content-Type: application/json" \
  -d "{
    \"number\": \"$WHATSAPP\",
    \"text\": \"🎉 *KRYONIX - Plataforma Pronta!*\n\nOlá $CLIENTE_NOME! Sua plataforma foi criada com sucesso.\n\n🌐 *Acesso:* https://${CLIENTE_ID}.kryonix.com.br\n👤 *Email:* $ADMIN_EMAIL\n🔑 *Senha:* $TEMP_PASSWORD\n⚠️ *Altere a senha no primeiro login*\n\n📋 *Módulos:* $MODULOS\n\n📞 *Suporte:* +55 17 98180-5327\"
  }"

echo "✅ Cliente $CLIENTE_ID criado com sucesso!"
echo "🌐 Acesso: https://${CLIENTE_ID}.kryonix.com.br"
echo "📧 Admin: $ADMIN_EMAIL"
echo "🔑 Senha temporária: $TEMP_PASSWORD"
EOF

chmod +x /usr/local/bin/kryonix-create-client.sh

# 5. Script de validação
cat > /usr/local/bin/kryonix-validate-clients.sh << 'EOF'
#!/bin/bash

echo "🔍 Validando clientes KRYONIX..."

validate_client() {
    local cliente_id=$1
    local realm_name="kryonix-cliente-${cliente_id}"
    
    echo "🏢 Cliente: $cliente_id"
    
    # 1. Verificar realm existe
    if curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
       "https://keycloak.kryonix.com.br/admin/realms/$realm_name" > /dev/null; then
        echo "✅ Realm $realm_name existe"
    else
        echo "❌ Realm $realm_name não encontrado"
        return 1
    fi
    
    # 2. Verificar subdomínio responde
    if curl -s -I "https://${cliente_id}.kryonix.com.br" > /dev/null; then
        echo "✅ Subdomínio $cliente_id responsivo"
    else
        echo "❌ Subdomínio $cliente_id não acessível"
    fi
    
    echo ""
}

# Obter token admin
ADMIN_TOKEN=$(curl -s -X POST "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin" \
  -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

# Validar clientes existentes
for config_file in /etc/kryonix/clients/*.env; do
    if [ -f "$config_file" ]; then
        source "$config_file"
        validate_client "$CLIENTE_ID"
    fi
done

echo "🎯 Validação concluída!"
EOF

chmod +x /usr/local/bin/kryonix-validate-clients.sh

echo "✅ Setup Keycloak Multi-Tenant concluído!"
echo "🔧 Scripts disponíveis:"
echo "  - kryonix-create-client.sh: Criar novo cliente"
echo "  - kryonix-validate-clients.sh: Validar clientes existentes"
```

---

## ✅ **CHECKLIST DE VALIDAÇÃO MULTI-TENANT**

### **🔐 AUTENTICAÇÃO**
- [ ] **Realms isolados**: Cada cliente tem realm específico `kryonix-cliente-{id}`
- [ ] **SDK Authentication**: `kryonix.auth.login()` funcionando
- [ ] **Mobile Biometric**: Autenticação biométrica prioritária
- [ ] **WhatsApp OTP**: Fallback via Evolution API configurado
- [ ] **Auto-creation**: Novos clientes criados automaticamente
- [ ] **Module Scopes**: Tokens específicos por módulo contratado
- [ ] **Subdomain Routing**: `cliente.kryonix.com.br` funcionando

### **🛡️ SEGURANÇA**
- [ ] **Complete Isolation**: Zero acesso entre clientes
- [ ] **Mobile Security**: Certificados e keychain configurados
- [ ] **Audit Logging**: Logs isolados por cliente
- [ ] **Key Rotation**: Rotação automática configurada
- [ ] **Rate Limiting**: Limites por cliente implementados

### **🤖 AUTOMAÇÃO**
- [ ] **Client Creation**: Script automático funcionando
- [ ] **Database Setup**: Criação automática de banco
- [ ] **Subdomain Config**: Traefik configurando automaticamente
- [ ] **Mobile Apps**: Geração automática de APK/IPA
- [ ] **WhatsApp Delivery**: Credenciais enviadas automaticamente

### **📱 MOBILE PRIORITY**
- [ ] **PWA Base**: Progressive Web App funcionando
- [ ] **Biometric Auth**: Touch/Face ID implementado
- [ ] **Mobile Theme**: Interface mobile-first
- [ ] **Apps Distribution**: Android/iOS disponíveis
- [ ] **Offline Support**: Service Worker configurado

---

## 🧪 **TESTES AUTOMÁTICOS**

```bash
# Teste completo de autenticação multi-tenant
npm run test:auth:multitenant

# Teste específico de cliente
npm run test:auth:client -- --client-id=siqueiracampos

# Teste autenticação mobile
npm run test:auth:mobile -- --biometric

# Teste WhatsApp OTP
npm run test:auth:whatsapp -- --number=+5517999999999

# Teste SDK integration
npm run test:sdk:auth
```

---

## 📚 **DOCUMENTAÇÃO TÉCNICA AVANÇADA**

- **Multi-Tenant Auth Guide**: [/docs/auth/multitenant](https://docs.kryonix.com.br/auth/multitenant)
- **SDK Authentication**: [/docs/sdk/auth](https://docs.kryonix.com.br/sdk/auth)
- **Mobile Integration**: [/docs/mobile/auth](https://docs.kryonix.com.br/mobile/auth)
- **WhatsApp OTP Setup**: [/docs/whatsapp/otp](https://docs.kryonix.com.br/whatsapp/otp)
- **Client Auto-Creation**: [/docs/automation/client-creation](https://docs.kryonix.com.br/automation/client-creation)

---

*Parte 01 de 50 - Projeto KRYONIX SaaS Platform Multi-Tenant*  
*Próxima Parte: 02 - Base de Dados PostgreSQL Multi-Tenant*  
*🏢 Arquitetura: Multi-tenant isolado • 📱 Mobile-first • 🤖 Auto-creation • 🔄 SDK Unificado*

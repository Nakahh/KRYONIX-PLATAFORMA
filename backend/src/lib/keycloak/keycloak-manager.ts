import { NovoClienteData, ClienteCreationResult, ClienteInfo } from '../types/auth'
import { AuthUtils } from '../utils/auth-utils'

export interface KeycloakConfig {
  baseUrl?: string
  adminUsername?: string
  adminPassword?: string
  masterRealm?: string
  debug?: boolean
}

export interface RealmConfig {
  realm: string
  enabled: boolean
  displayName: string
  displayNameHtml: string
  defaultLocale: string
  internationalizationEnabled: boolean
  supportedLocales: string[]
  registrationAllowed: boolean
  registrationEmailAsUsername: boolean
  rememberMe: boolean
  verifyEmail: boolean
  loginWithEmailAllowed: boolean
  duplicateEmailsAllowed: boolean
  resetPasswordAllowed: boolean
  editUsernameAllowed: boolean
  bruteForceProtected: boolean
  permanentLockout: boolean
  maxFailureWaitSeconds: number
  minimumQuickLoginWaitSeconds: number
  waitIncrementSeconds: number
  quickLoginCheckMilliSeconds: number
  maxDeltaTimeSeconds: number
  failureFactor: number
  loginTheme: string
  accountTheme: string
  adminTheme: string
  emailTheme: string
  attributes: Record<string, string>
}

export interface ClientConfig {
  clientId: string
  name: string
  enabled: boolean
  clientAuthenticatorType: string
  secret: string
  redirectUris: string[]
  webOrigins: string[]
  protocol: string
  publicClient: boolean
  standardFlowEnabled: boolean
  implicitFlowEnabled: boolean
  directAccessGrantsEnabled: boolean
  serviceAccountsEnabled: boolean
  authorizationServicesEnabled: boolean
  fullScopeAllowed: boolean
}

export interface UserConfig {
  username: string
  email: string
  firstName: string
  lastName: string
  enabled: boolean
  emailVerified: boolean
  credentials: Array<{
    type: string
    value: string
    temporary: boolean
  }>
  attributes?: Record<string, string[]>
  groups?: string[]
  realmRoles?: string[]
  clientRoles?: Record<string, string[]>
}

export class KeycloakManager {
  private config: KeycloakConfig
  private adminToken?: string
  private tokenExpiry?: number

  constructor(config: KeycloakConfig = {}) {
    this.config = {
      baseUrl: 'https://keycloak.kryonix.com.br',
      adminUsername: 'kryonix',
      adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'Vitor@123456',
      masterRealm: 'master',
      debug: false,
      ...config
    }

    this.log('Inicializando KeycloakManager', {
      baseUrl: this.config.baseUrl,
      masterRealm: this.config.masterRealm
    })
  }

  /**
   * Criar cliente completo (realm + configurações)
   */
  async criarClienteCompleto(dados: NovoClienteData): Promise<ClienteCreationResult> {
    this.log('Criando cliente completo', { nome: dados.nome })

    const startTime = Date.now()
    const clienteId = AuthUtils.generateClienteId(dados.nome)

    try {
      // 1. Obter token administrativo
      await this.getAdminToken()

      // 2. Criar realm específico do cliente
      await this.criarRealm(clienteId, dados)

      // 3. Configurar clients no realm
      await this.configurarClients(clienteId, dados)

      // 4. Criar usuário admin inicial
      const adminCredentials = await this.criarUsuarioAdmin(clienteId, dados)

      // 5. Configurar grupos e roles
      await this.configurarGruposRoles(clienteId, dados.modulosContratados)

      // 6. Gerar tokens de integração
      const apiTokens = await this.gerarTokensIntegracao(clienteId)

      // 7. Configurar políticas de segurança
      await this.configurarPoliticasSeguranca(clienteId)

      const endTime = Date.now()
      const creationTime = Math.round((endTime - startTime) / 1000)

      this.log('Cliente criado com sucesso', { clienteId, tempo: creationTime })

      return {
        cliente_id: clienteId,
        realm_name: `kryonix-cliente-${clienteId}`,
        subdomain: `${clienteId}.kryonix.com.br`,
        admin_credentials: adminCredentials,
        api_tokens: apiTokens,
        modules_enabled: dados.modulosContratados,
        creation_time: creationTime,
        status: 'ativo'
      }

    } catch (error) {
      this.log('Erro na criação do cliente', error)
      
      // Tentar rollback
      await this.rollbackClienteCreation(clienteId).catch(rollbackError => {
        this.log('Erro no rollback', rollbackError)
      })

      throw error
    }
  }

  /**
   * Obter informações de um cliente
   */
  async obterInfoCliente(clienteId: string): Promise<ClienteInfo | null> {
    try {
      await this.getAdminToken()
      
      const realmName = `kryonix-cliente-${clienteId}`
      const realm = await this.makeRequest(`/admin/realms/${realmName}`, 'GET')

      if (!realm) return null

      return {
        id: clienteId,
        nome: realm.displayName?.replace('KRYONIX - ', '') || clienteId,
        subdomain: `${clienteId}.kryonix.com.br`,
        realm: realmName,
        modulosContratados: realm.attributes?.modulos_contratados?.split(',') || [],
        status: realm.enabled ? 'ativo' : 'inativo',
        createdAt: realm.attributes?.created_at || new Date().toISOString()
      }

    } catch (error) {
      this.log('Erro ao obter info do cliente', error)
      return null
    }
  }

  /**
   * Listar todos os clientes
   */
  async listarClientes(): Promise<ClienteInfo[]> {
    try {
      await this.getAdminToken()
      
      const realms = await this.makeRequest('/admin/realms', 'GET')
      
      return realms
        .filter((realm: any) => realm.realm.startsWith('kryonix-cliente-'))
        .map((realm: any) => ({
          id: realm.realm.replace('kryonix-cliente-', ''),
          nome: realm.displayName?.replace('KRYONIX - ', '') || realm.realm,
          subdomain: `${realm.realm.replace('kryonix-cliente-', '')}.kryonix.com.br`,
          realm: realm.realm,
          modulosContratados: realm.attributes?.modulos_contratados?.split(',') || [],
          status: realm.enabled ? 'ativo' : 'inativo',
          createdAt: realm.attributes?.created_at || new Date().toISOString()
        }))

    } catch (error) {
      this.log('Erro ao listar clientes', error)
      return []
    }
  }

  /**
   * Ativar/desativar cliente
   */
  async alterarStatusCliente(clienteId: string, ativo: boolean): Promise<boolean> {
    try {
      await this.getAdminToken()
      
      const realmName = `kryonix-cliente-${clienteId}`
      
      await this.makeRequest(`/admin/realms/${realmName}`, 'PUT', {
        enabled: ativo
      })

      this.log('Status do cliente alterado', { clienteId, ativo })
      return true

    } catch (error) {
      this.log('Erro ao alterar status do cliente', error)
      return false
    }
  }

  /**
   * Remover cliente completamente
   */
  async removerCliente(clienteId: string): Promise<boolean> {
    try {
      await this.getAdminToken()
      
      const realmName = `kryonix-cliente-${clienteId}`
      
      await this.makeRequest(`/admin/realms/${realmName}`, 'DELETE')

      this.log('Cliente removido', { clienteId })
      return true

    } catch (error) {
      this.log('Erro ao remover cliente', error)
      return false
    }
  }

  /**
   * Validar configuração do Keycloak
   */
  async validarConfiguracao(): Promise<boolean> {
    try {
      // Testar conectividade
      const response = await fetch(`${this.config.baseUrl}/health/ready`)
      if (!response.ok) {
        throw new Error('Keycloak não está acessível')
      }

      // Testar autenticação admin
      await this.getAdminToken()

      // Verificar realm master
      const masterRealm = await this.makeRequest(`/admin/realms/${this.config.masterRealm}`, 'GET')
      if (!masterRealm) {
        throw new Error('Realm master não encontrado')
      }

      this.log('Configuração Keycloak validada com sucesso')
      return true

    } catch (error) {
      this.log('Erro na validação da configuração', error)
      return false
    }
  }

  // Métodos privados

  private async getAdminToken(): Promise<void> {
    // Verificar se token ainda é válido
    if (this.adminToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/realms/${this.config.masterRealm}/protocol/openid_connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: this.config.adminUsername!,
          password: this.config.adminPassword!
        })
      })

      if (!response.ok) {
        throw new Error(`Falha na autenticação admin: ${response.status}`)
      }

      const tokenData = await response.json()
      this.adminToken = tokenData.access_token
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000 // 1 min buffer

      this.log('Token admin obtido com sucesso')

    } catch (error) {
      this.log('Erro ao obter token admin', error)
      throw error
    }
  }

  private async makeRequest(endpoint: string, method: string, body?: any): Promise<any> {
    if (!this.adminToken) {
      throw new Error('Token admin não disponível')
    }

    const url = `${this.config.baseUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.adminToken}`,
        'Content-Type': 'application/json'
      }
    }

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (method === 'DELETE') {
      return response.ok
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Request failed: ${response.status} - ${errorText}`)
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  }

  private async criarRealm(clienteId: string, dados: NovoClienteData): Promise<void> {
    const realmName = `kryonix-cliente-${clienteId}`
    
    const realmConfig: RealmConfig = {
      realm: realmName,
      enabled: true,
      displayName: `KRYONIX - ${dados.nome}`,
      displayNameHtml: `<strong>KRYONIX</strong> - ${dados.nome}`,
      defaultLocale: 'pt-BR',
      internationalizationEnabled: true,
      supportedLocales: ['pt-BR'],
      registrationAllowed: false,
      registrationEmailAsUsername: true,
      rememberMe: true,
      verifyEmail: false,
      loginWithEmailAllowed: true,
      duplicateEmailsAllowed: false,
      resetPasswordAllowed: true,
      editUsernameAllowed: false,
      bruteForceProtected: true,
      permanentLockout: false,
      maxFailureWaitSeconds: 900,
      minimumQuickLoginWaitSeconds: 60,
      waitIncrementSeconds: 60,
      quickLoginCheckMilliSeconds: 1000,
      maxDeltaTimeSeconds: 43200,
      failureFactor: 5,
      loginTheme: 'kryonix-custom',
      accountTheme: 'kryonix-custom',
      adminTheme: 'keycloak',
      emailTheme: 'kryonix-custom',
      attributes: {
        cliente_id: clienteId,
        cliente_nome: dados.nome,
        modulos_contratados: dados.modulosContratados.join(','),
        mobile_priority: 'true',
        created_at: new Date().toISOString(),
        whatsapp_contact: dados.whatsapp
      }
    }

    await this.makeRequest('/admin/realms', 'POST', realmConfig)
    this.log('Realm criado', { realmName })
  }

  private async configurarClients(clienteId: string, dados: NovoClienteData): Promise<void> {
    const realmName = `kryonix-cliente-${clienteId}`
    
    // Client para frontend
    const frontendClient: ClientConfig = {
      clientId: 'kryonix-frontend',
      name: 'KRYONIX Frontend',
      enabled: true,
      clientAuthenticatorType: 'client-secret',
      secret: `${clienteId}-frontend-${AuthUtils.generateTemporaryPassword(16)}`,
      redirectUris: [
        `https://${clienteId}.kryonix.com.br/*`,
        `https://app.kryonix.com.br/*`,
        'http://localhost:3000/*'
      ],
      webOrigins: [
        `https://${clienteId}.kryonix.com.br`,
        `https://app.kryonix.com.br`,
        'http://localhost:3000'
      ],
      protocol: 'openid-connect',
      publicClient: false,
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: true,
      serviceAccountsEnabled: true,
      authorizationServicesEnabled: true,
      fullScopeAllowed: true
    }

    await this.makeRequest(`/admin/realms/${realmName}/clients`, 'POST', frontendClient)

    // Client para mobile
    const mobileClient: ClientConfig = {
      clientId: 'kryonix-mobile-app',
      name: 'KRYONIX Mobile App',
      enabled: true,
      clientAuthenticatorType: 'client-secret',
      secret: `${clienteId}-mobile-${AuthUtils.generateTemporaryPassword(16)}`,
      redirectUris: [
        'kryonix://auth/callback',
        'https://app.kryonix.com.br/mobile/callback'
      ],
      webOrigins: ['*'],
      protocol: 'openid-connect',
      publicClient: false,
      standardFlowEnabled: true,
      implicitFlowEnabled: false,
      directAccessGrantsEnabled: true,
      serviceAccountsEnabled: false,
      authorizationServicesEnabled: false,
      fullScopeAllowed: true
    }

    await this.makeRequest(`/admin/realms/${realmName}/clients`, 'POST', mobileClient)

    this.log('Clients configurados', { realmName })
  }

  private async criarUsuarioAdmin(clienteId: string, dados: NovoClienteData): Promise<{ email: string; temporary_password: string }> {
    const realmName = `kryonix-cliente-${clienteId}`
    const temporaryPassword = AuthUtils.generateTemporaryPassword(12)
    
    const userConfig: UserConfig = {
      username: dados.adminUser.email,
      email: dados.adminUser.email,
      firstName: dados.adminUser.firstName,
      lastName: dados.adminUser.lastName,
      enabled: true,
      emailVerified: true,
      credentials: [{
        type: 'password',
        value: temporaryPassword,
        temporary: true
      }],
      attributes: {
        cliente_id: [clienteId],
        whatsapp: [dados.whatsapp],
        role: ['admin']
      },
      realmRoles: ['admin', 'user'],
      clientRoles: {
        'kryonix-frontend': dados.modulosContratados
      }
    }

    await this.makeRequest(`/admin/realms/${realmName}/users`, 'POST', userConfig)
    
    this.log('Usuário admin criado', { realmName, email: dados.adminUser.email })

    return {
      email: dados.adminUser.email,
      temporary_password: temporaryPassword
    }
  }

  private async configurarGruposRoles(clienteId: string, modulosContratados: string[]): Promise<void> {
    const realmName = `kryonix-cliente-${clienteId}`
    
    // Criar roles para cada módulo
    for (const modulo of modulosContratados) {
      await this.makeRequest(`/admin/realms/${realmName}/roles`, 'POST', {
        name: modulo,
        description: `Acesso ao módulo ${modulo.toUpperCase()}`,
        composite: false,
        clientRole: false
      })
    }

    // Criar grupo admin
    await this.makeRequest(`/admin/realms/${realmName}/groups`, 'POST', {
      name: 'admin',
      path: '/admin',
      attributes: {
        description: ['Administradores do sistema']
      }
    })

    this.log('Grupos e roles configurados', { realmName, modulos: modulosContratados })
  }

  private async gerarTokensIntegracao(clienteId: string): Promise<{ access_token: string; refresh_token: string }> {
    // Em produção, geraria tokens reais
    // Por enquanto, simula tokens
    return {
      access_token: `kryonix_${clienteId}_${AuthUtils.generateTemporaryPassword(32)}`,
      refresh_token: `refresh_${clienteId}_${AuthUtils.generateTemporaryPassword(32)}`
    }
  }

  private async configurarPoliticasSeguranca(clienteId: string): Promise<void> {
    const realmName = `kryonix-cliente-${clienteId}`
    
    // Configurar políticas de senha
    await this.makeRequest(`/admin/realms/${realmName}`, 'PUT', {
      passwordPolicy: 'length(8) and upperCase(1) and lowerCase(1) and digits(1) and specialChars(1)'
    })

    this.log('Políticas de segurança configuradas', { realmName })
  }

  private async rollbackClienteCreation(clienteId: string): Promise<void> {
    try {
      this.log('Iniciando rollback', { clienteId })
      
      const realmName = `kryonix-cliente-${clienteId}`
      await this.makeRequest(`/admin/realms/${realmName}`, 'DELETE')
      
      this.log('Rollback concluído', { clienteId })
    } catch (error) {
      this.log('Erro no rollback', error)
    }
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[KeycloakManager] ${message}`, data)
    }
  }
}

// Instância singleton
let _keycloakManager: KeycloakManager | null = null

export function getKeycloakManager(config?: KeycloakConfig): KeycloakManager {
  if (!_keycloakManager) {
    _keycloakManager = new KeycloakManager(config)
  }
  return _keycloakManager
}

export default KeycloakManager

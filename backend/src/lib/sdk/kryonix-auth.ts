import { 
  KryonixConfig, 
  LoginCredentials, 
  AuthResult, 
  BiometricData,
  WhatsAppOTPRequest,
  WhatsAppOTPValidation,
  DeviceInfo,
  AuthEvent,
  TokenInfo,
  KRYONIX_CONSTANTS
} from '../types/auth'
import { AuthUtils } from '../utils/auth-utils'

export class KryonixAuth {
  private config: KryonixConfig
  private baseURL: string
  private keycloakURL: string
  private clienteId: string
  private deviceInfo: DeviceInfo
  private token?: string
  private refreshToken?: string

  constructor(config: KryonixConfig = {}) {
    this.config = {
      baseURL: 'https://api.kryonix.com.br',
      keycloakURL: 'https://keycloak.kryonix.com.br',
      debug: false,
      ...config
    }
    
    this.baseURL = this.config.baseURL!
    this.keycloakURL = this.config.keycloakURL!
    this.clienteId = this.config.clienteId || this.detectClienteFromDomain()
    this.deviceInfo = AuthUtils.getDeviceInfo()
    
    this.log('Inicializando KryonixAuth', { clienteId: this.clienteId })
  }

  /**
   * Login principal - detecção automática de cliente e método
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      this.log('Iniciando processo de login', { username: credentials.username })
      
      // Validar credenciais
      if (!credentials.username || !credentials.password) {
        throw new Error('Email e senha são obrigatórios')
      }

      if (!AuthUtils.isValidEmail(credentials.username)) {
        throw new Error('Formato de email inválido')
      }

      // Detectar realm do cliente
      const realmName = this.getRealmName()
      
      // Priorizar autenticação biométrica se disponível
      if (this.deviceInfo.isMobile && this.deviceInfo.hasBiometric && credentials.biometric) {
        return await this.biometricLogin(credentials)
      }
      
      // Autenticação tradicional
      return await this.traditionalLogin(realmName, credentials)
      
    } catch (error) {
      this.log('Erro no login', error)
      await this.logAuthEvent('login', credentials.username, false, error)
      
      return {
        success: false,
        error: AuthUtils.formatErrorMessage(error)
      }
    }
  }

  /**
   * Autenticação biométrica (mobile priority)
   */
  async biometricLogin(credentials: LoginCredentials): Promise<AuthResult> {
    this.log('Iniciando autenticação biométrica')
    
    try {
      // 1. Verificar se usuário já tem biometria cadastrada
      const biometricData = await this.getBiometricData(credentials.username)
      
      if (biometricData) {
        // 2. Solicitar autenticação biométrica
        const biometricResult = await this.promptBiometric()
        
        if (biometricResult.success) {
          // 3. Autenticar com token biométrico
          return await this.authenticateWithBiometric(biometricResult.credential)
        }
      }
      
      // 4. Fallback para senha se biometria falhar
      this.log('Fallback para autenticação tradicional')
      return await this.traditionalLogin(this.getRealmName(), credentials)
      
    } catch (error) {
      this.log('Erro na autenticação biométrica', error)
      // Fallback silencioso para autenticação tradicional
      return await this.traditionalLogin(this.getRealmName(), credentials)
    }
  }

  /**
   * Autenticação tradicional com Keycloak
   */
  async traditionalLogin(realmName: string, credentials: LoginCredentials): Promise<AuthResult> {
    this.log('Autenticação tradicional', { realm: realmName })
    
    try {
      const tokenEndpoint = `${this.keycloakURL}/realms/${realmName}/protocol/openid_connect/token`
      
      const payload = new URLSearchParams({
        grant_type: 'password',
        client_id: KRYONIX_CONSTANTS.CLIENTS.FRONTEND,
        username: credentials.username,
        password: credentials.password,
        scope: `${KRYONIX_CONSTANTS.SCOPES.OPENID} ${KRYONIX_CONSTANTS.SCOPES.PROFILE} ${KRYONIX_CONSTANTS.SCOPES.EMAIL} ${KRYONIX_CONSTANTS.SCOPES.OFFLINE_ACCESS}`
      })

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Falha na autenticação')
      }

      const tokenData = await response.json()
      
      // Armazenar tokens
      this.token = tokenData.access_token
      this.refreshToken = tokenData.refresh_token
      
      // Decodificar token para obter informações do usuário
      if (!this.token) {
        throw new Error('Token não foi definido')
      }
      const tokenInfo = AuthUtils.decodeToken(this.token)
      if (!tokenInfo) {
        throw new Error('Token inválido recebido')
      }

      // Obter informações do usuário
      const userInfo = await this.getUserInfo(this.token, realmName)
      
      // Verificar módulos permitidos
      const modulosPermitidos = this.extractPermittedModules(tokenInfo)
      
      await this.logAuthEvent('login', credentials.username, true)
      
      return {
        success: true,
        token: this.token,
        refreshToken: this.refreshToken,
        expiresIn: tokenData.expires_in,
        user: userInfo,
        modulosPermitidos,
        clienteId: this.clienteId
      }
      
    } catch (error) {
      this.log('Erro na autenticação tradicional', error)
      
      // Fallback para WhatsApp OTP se credenciais falharem
      if (credentials.whatsapp) {
        this.log('Tentando fallback para WhatsApp OTP')
        return await this.whatsappOTPLogin(credentials.whatsapp)
      }
      
      throw error
    }
  }

  /**
   * Autenticação via WhatsApp OTP
   */
  async whatsappOTPLogin(whatsappNumber: string): Promise<AuthResult> {
    this.log('Iniciando autenticação WhatsApp OTP', { phone: whatsappNumber })
    
    try {
      // 1. Validar número
      if (!AuthUtils.isValidBrazilianPhone(whatsappNumber)) {
        throw new Error('Número de WhatsApp inválido')
      }

      const formattedPhone = AuthUtils.formatBrazilianPhone(whatsappNumber)
      
      // 2. Solicitar envio do código
      const otpSent = await this.sendWhatsAppOTP({ phoneNumber: formattedPhone })
      if (!otpSent) {
        throw new Error('Falha ao enviar código WhatsApp')
      }

      // 3. Interface para usuário inserir código (seria implementado no frontend)
      const userCode = await this.promptOTPInput()
      
      // 4. Validar código
      const otpValid = await this.validateWhatsAppOTP({
        phoneNumber: formattedPhone,
        code: userCode
      })

      if (!otpValid) {
        throw new Error('Código WhatsApp inválido ou expirado')
      }

      // 5. Buscar usuário pelo WhatsApp
      const usuario = await this.findUserByWhatsApp(formattedPhone)
      if (!usuario) {
        throw new Error('Usuário não encontrado para este WhatsApp')
      }

      // 6. Gerar token temporário
      const tempToken = await this.generateTemporaryToken(usuario)
      
      await this.logAuthEvent('whatsapp_otp', usuario.email, true)
      
      return {
        success: true,
        token: tempToken.access_token,
        refreshToken: tempToken.refresh_token,
        expiresIn: tempToken.expires_in,
        user: usuario,
        clienteId: this.clienteId
      }
      
    } catch (error) {
      this.log('Erro na autenticação WhatsApp', error)
      throw error
    }
  }

  /**
   * Renovar token de acesso
   */
  async refreshAccessToken(): Promise<AuthResult> {
    if (!this.refreshToken) {
      throw new Error('Refresh token não disponível')
    }

    try {
      const realmName = this.getRealmName()
      const tokenEndpoint = `${this.keycloakURL}/realms/${realmName}/protocol/openid_connect/token`
      
      const payload = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: KRYONIX_CONSTANTS.CLIENTS.FRONTEND,
        refresh_token: this.refreshToken
      })

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload
      })

      if (!response.ok) {
        throw new Error('Falha ao renovar token')
      }

      const tokenData = await response.json()
      
      this.token = tokenData.access_token
      this.refreshToken = tokenData.refresh_token || this.refreshToken
      
      return {
        success: true,
        token: this.token,
        refreshToken: this.refreshToken,
        expiresIn: tokenData.expires_in
      }
      
    } catch (error) {
      this.log('Erro ao renovar token', error)
      throw error
    }
  }

  /**
   * Fazer logout
   */
  async logout(): Promise<void> {
    try {
      if (this.token) {
        const realmName = this.getRealmName()
        const logoutEndpoint = `${this.keycloakURL}/realms/${realmName}/protocol/openid_connect/logout`
        
        await fetch(logoutEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: KRYONIX_CONSTANTS.CLIENTS.FRONTEND,
            refresh_token: this.refreshToken || ''
          })
        })
      }
      
      await this.logAuthEvent('logout', 'unknown', true)
      
    } catch (error) {
      this.log('Erro no logout', error)
    } finally {
      // Limpar tokens localmente independente do resultado
      this.token = undefined
      this.refreshToken = undefined
    }
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    if (!this.token) return false
    return !AuthUtils.isTokenExpired(this.token)
  }

  /**
   * Obter token atual
   */
  getToken(): string | undefined {
    return this.token
  }

  /**
   * Verificar se token precisa ser renovado
   */
  needsTokenRefresh(): boolean {
    if (!this.token) return false
    return AuthUtils.isTokenExpiringSoon(this.token, KRYONIX_CONSTANTS.REFRESH_THRESHOLD)
  }

  /**
   * Obter módulos contratados
   */
  async getPermittedModules(): Promise<string[]> {
    if (!this.token) return []
    
    const tokenInfo = AuthUtils.decodeToken(this.token)
    if (!tokenInfo) return []
    
    return this.extractPermittedModules(tokenInfo)
  }

  // Métodos privados

  private detectClienteFromDomain(): string {
    if (typeof window === 'undefined') return 'default'
    
    const hostname = window.location.hostname
    
    if (hostname.includes('.kryonix.com.br') && hostname !== 'www.kryonix.com.br') {
      return hostname.split('.')[0]
    }
    
    return 'default'
  }

  private getRealmName(): string {
    if (this.clienteId === 'default') {
      return 'KRYONIX'
    }
    return `kryonix-cliente-${this.clienteId}`
  }

  private extractPermittedModules(tokenInfo: TokenInfo): string[] {
    const clientAccess = tokenInfo.resource_access?.[KRYONIX_CONSTANTS.CLIENTS.FRONTEND]
    return clientAccess?.roles || []
  }

  private async getBiometricData(username: string): Promise<BiometricData | null> {
    // Implementação seria conectar com API para verificar dados biométricos
    // Por enquanto, retorna null (não implementado)
    return null
  }

  private async promptBiometric(): Promise<{ success: boolean; credential?: any }> {
    if (typeof window === 'undefined' || !window.navigator.credentials) {
      return { success: false }
    }

    try {
      // Implementação WebAuthn seria aqui
      // Por enquanto, simula sucesso para testes
      return { success: false }
    } catch (error) {
      return { success: false }
    }
  }

  private async authenticateWithBiometric(credential: any): Promise<AuthResult> {
    // Implementação seria validar credencial biométrica
    throw new Error('Autenticação biométrica não implementada ainda')
  }

  private async sendWhatsAppOTP(request: WhatsAppOTPRequest): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/whatsapp/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })
      
      return response.ok
    } catch (error) {
      this.log('Erro ao enviar WhatsApp OTP', error)
      return false
    }
  }

  private async validateWhatsAppOTP(validation: WhatsAppOTPValidation): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/whatsapp/validate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation)
      })
      
      return response.ok
    } catch (error) {
      this.log('Erro ao validar WhatsApp OTP', error)
      return false
    }
  }

  private async promptOTPInput(): Promise<string> {
    // Em uma implementação real, isso seria uma interface de usuário
    // Por enquanto, simula entrada de código
    return new Promise((resolve) => {
      const code = prompt('Digite o código recebido no WhatsApp:')
      resolve(code || '')
    })
  }

  private async findUserByWhatsApp(phoneNumber: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/auth/user/by-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber })
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      this.log('Erro ao buscar usuário por WhatsApp', error)
      return null
    }
  }

  private async generateTemporaryToken(usuario: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/auth/temporary-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: usuario.id })
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      throw new Error('Falha ao gerar token temporário')
    } catch (error) {
      this.log('Erro ao gerar token temporário', error)
      throw error
    }
  }

  private async getUserInfo(token: string, realm: string): Promise<any> {
    try {
      const userInfoEndpoint = `${this.keycloakURL}/realms/${realm}/protocol/openid_connect/userinfo`
      
      const response = await fetch(userInfoEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      throw new Error('Falha ao obter informações do usuário')
    } catch (error) {
      this.log('Erro ao obter informações do usuário', error)
      throw error
    }
  }

  private async logAuthEvent(
    type: AuthEvent['type'], 
    userId: string, 
    success: boolean, 
    error?: any
  ): Promise<void> {
    try {
      const event: Partial<AuthEvent> = {
        type,
        userId,
        clienteId: this.clienteId,
        success,
        ipAddress: await AuthUtils.getClientIP(),
        userAgent: this.deviceInfo.userAgent,
        deviceInfo: this.deviceInfo,
        timestamp: new Date().toISOString()
      }

      // Em produção, isso enviaria para API de auditoria
      this.log('Auth Event', event)
    } catch (logError) {
      this.log('Erro ao registrar evento de auth', logError)
    }
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[KryonixAuth] ${message}`, data)
    }
  }
}

// Instância singleton para uso global
let _kryonixAuth: KryonixAuth | null = null

export function getKryonixAuth(config?: KryonixConfig): KryonixAuth {
  if (!_kryonixAuth) {
    _kryonixAuth = new KryonixAuth(config)
  }
  return _kryonixAuth
}

export function resetKryonixAuth(): void {
  _kryonixAuth = null
}

export default KryonixAuth

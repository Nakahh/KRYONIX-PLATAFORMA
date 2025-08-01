import { AuthUtils } from '../utils/auth-utils'

export interface WhatsAppOTPConfig {
  evolutionApiUrl?: string
  apiKey?: string
  instanceName?: string
  otpLength?: number
  otpTTL?: number
  maxAttempts?: number
  debug?: boolean
}

export interface SendOTPRequest {
  phoneNumber: string
  clienteId?: string
  username?: string
  template?: 'login' | 'register' | 'recovery'
}

export interface SendOTPResponse {
  success: boolean
  messageId?: string
  error?: string
  retryAfter?: number
}

export interface ValidateOTPRequest {
  phoneNumber: string
  code: string
  clienteId?: string
}

export interface ValidateOTPResponse {
  success: boolean
  token?: string
  expiresIn?: number
  user?: any
  error?: string
  attemptsLeft?: number
}

export interface OTPStatus {
  phoneNumber: string
  isActive: boolean
  expiresAt?: Date
  attemptsLeft: number
  lastSentAt?: Date
  canResend: boolean
  nextResendAt?: Date
}

export class WhatsAppOTP {
  private config: WhatsAppOTPConfig
  private storage: Map<string, any> = new Map()

  constructor(config: WhatsAppOTPConfig = {}) {
    this.config = {
      evolutionApiUrl: process.env.EVOLUTION_API_URL || 'https://api.kryonix.com.br',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instanceName: process.env.EVOLUTION_INSTANCE || 'kryonix',
      otpLength: 6,
      otpTTL: 300, // 5 minutos
      maxAttempts: 3,
      debug: false,
      ...config
    }

    this.log('Inicializando WhatsAppOTP', {
      apiUrl: this.config.evolutionApiUrl,
      otpLength: this.config.otpLength,
      ttl: this.config.otpTTL
    })
  }

  /**
   * Enviar código OTP via WhatsApp
   */
  async sendOTP(request: SendOTPRequest): Promise<SendOTPResponse> {
    this.log('Enviando OTP WhatsApp', { phoneNumber: request.phoneNumber })

    try {
      // Validar número de telefone
      if (!AuthUtils.isValidBrazilianPhone(request.phoneNumber)) {
        return {
          success: false,
          error: 'Número de telefone inválido'
        }
      }

      const formattedPhone = AuthUtils.formatBrazilianPhone(request.phoneNumber)

      // Verificar rate limiting
      const rateLimitCheck = this.checkRateLimit(formattedPhone)
      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: 'Muitas tentativas. Tente novamente em alguns minutos.',
          retryAfter: rateLimitCheck.retryAfter
        }
      }

      // Gerar código OTP
      const otpCode = AuthUtils.generateOTP(this.config.otpLength!)
      
      // Preparar mensagem
      const message = this.buildOTPMessage(otpCode, request.template || 'login')

      // Enviar via Evolution API
      const sendResult = await this.sendWhatsAppMessage(formattedPhone, message)
      
      if (!sendResult.success) {
        return {
          success: false,
          error: sendResult.error || 'Falha ao enviar mensagem WhatsApp'
        }
      }

      // Armazenar OTP para validação posterior
      this.storeOTP(formattedPhone, otpCode, request.clienteId, request.username)

      // Atualizar rate limiting
      this.updateRateLimit(formattedPhone)

      this.log('OTP enviado com sucesso', { phoneNumber: formattedPhone, messageId: sendResult.messageId })

      return {
        success: true,
        messageId: sendResult.messageId
      }

    } catch (error) {
      this.log('Erro ao enviar OTP', error)
      return {
        success: false,
        error: 'Erro interno. Tente novamente.'
      }
    }
  }

  /**
   * Validar código OTP
   */
  async validateOTP(request: ValidateOTPRequest): Promise<ValidateOTPResponse> {
    this.log('Validando OTP WhatsApp', { phoneNumber: request.phoneNumber })

    try {
      const formattedPhone = AuthUtils.formatBrazilianPhone(request.phoneNumber)
      const storageKey = this.getStorageKey(formattedPhone)
      const storedData = this.storage.get(storageKey)

      if (!storedData) {
        return {
          success: false,
          error: 'Código não encontrado ou expirado'
        }
      }

      // Verificar se expirou
      if (Date.now() > storedData.expiresAt) {
        this.storage.delete(storageKey)
        return {
          success: false,
          error: 'Código expirado. Solicite um novo código.'
        }
      }

      // Verificar tentativas restantes
      if (storedData.attempts >= this.config.maxAttempts!) {
        this.storage.delete(storageKey)
        return {
          success: false,
          error: 'Muitas tentativas inválidas. Solicite um novo código.'
        }
      }

      // Validar código
      if (storedData.code !== request.code) {
        storedData.attempts++
        this.storage.set(storageKey, storedData)
        
        const attemptsLeft = this.config.maxAttempts! - storedData.attempts

        return {
          success: false,
          error: `Código inválido. ${attemptsLeft} tentativas restantes.`,
          attemptsLeft
        }
      }

      // Código válido - remover do storage
      this.storage.delete(storageKey)
      this.clearRateLimit(formattedPhone)

      // Buscar ou criar usuário
      const user = await this.findOrCreateUser(formattedPhone, storedData.clienteId, storedData.username)
      
      if (!user) {
        return {
          success: false,
          error: 'Falha ao processar usuário'
        }
      }

      // Gerar token temporário
      const token = await this.generateAuthToken(user, storedData.clienteId)

      this.log('OTP validado com sucesso', { phoneNumber: formattedPhone, userId: user.id })

      return {
        success: true,
        token: token.accessToken,
        expiresIn: token.expiresIn,
        user
      }

    } catch (error) {
      this.log('Erro ao validar OTP', error)
      return {
        success: false,
        error: 'Erro interno. Tente novamente.'
      }
    }
  }

  /**
   * Obter status do OTP para um número
   */
  getOTPStatus(phoneNumber: string): OTPStatus {
    const formattedPhone = AuthUtils.formatBrazilianPhone(phoneNumber)
    const storageKey = this.getStorageKey(formattedPhone)
    const storedData = this.storage.get(storageKey)
    const rateLimitKey = this.getRateLimitKey(formattedPhone)
    const rateLimitData = this.storage.get(rateLimitKey)

    if (!storedData) {
      return {
        phoneNumber: formattedPhone,
        isActive: false,
        attemptsLeft: this.config.maxAttempts!,
        canResend: !rateLimitData || Date.now() > rateLimitData.nextResendAt
      }
    }

    const expiresAt = new Date(storedData.expiresAt)
    const isActive = Date.now() < storedData.expiresAt
    const attemptsLeft = this.config.maxAttempts! - storedData.attempts

    return {
      phoneNumber: formattedPhone,
      isActive,
      expiresAt: isActive ? expiresAt : undefined,
      attemptsLeft,
      lastSentAt: storedData.sentAt ? new Date(storedData.sentAt) : undefined,
      canResend: !isActive && (!rateLimitData || Date.now() > rateLimitData.nextResendAt),
      nextResendAt: rateLimitData?.nextResendAt ? new Date(rateLimitData.nextResendAt) : undefined
    }
  }

  /**
   * Cancelar OTP ativo
   */
  cancelOTP(phoneNumber: string): boolean {
    const formattedPhone = AuthUtils.formatBrazilianPhone(phoneNumber)
    const storageKey = this.getStorageKey(formattedPhone)
    
    if (this.storage.has(storageKey)) {
      this.storage.delete(storageKey)
      this.log('OTP cancelado', { phoneNumber: formattedPhone })
      return true
    }
    
    return false
  }

  /**
   * Reenviar código OTP
   */
  async resendOTP(request: SendOTPRequest): Promise<SendOTPResponse> {
    this.log('Reenviando OTP WhatsApp', { phoneNumber: request.phoneNumber })

    // Cancelar OTP anterior
    this.cancelOTP(request.phoneNumber)

    // Enviar novo OTP
    return await this.sendOTP(request)
  }

  // Métodos privados

  private buildOTPMessage(code: string, template: 'login' | 'register' | 'recovery'): string {
    const messages = {
      login: `🔐 *KRYONIX - Código de Acesso*

Seu código de verificação: *${code}*

⏰ Válido por 5 minutos
🚫 Não compartilhe este código
🛡️ Se não foi você, ignore esta mensagem

_Sua segurança é nossa prioridade_`,

      register: `🎉 *KRYONIX - Bem-vindo!*

Código para finalizar seu cadastro: *${code}*

⏰ Válido por 5 minutos
🚫 Não compartilhe este código

_Obrigado por escolher a KRYONIX!_`,

      recovery: `🔄 *KRYONIX - Recuperação de Conta*

Código para recuperar sua conta: *${code}*

⏰ Válido por 5 minutos
🚫 Não compartilhe este código
🛡️ Se não solicitou, ignore esta mensagem

_Equipe KRYONIX_`
    }

    return messages[template]
  }

  private async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Remover o '+' do número para a Evolution API
      const number = phoneNumber.replace('+', '')

      const payload = {
        number: number,
        text: message
      }

      const response = await fetch(`${this.config.evolutionApiUrl}/message/sendText/${this.config.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.config.apiKey!
        },
        body: JSON.stringify(payload),
        timeout: 10000
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        messageId: result.key?.id || result.messageId
      }

    } catch (error) {
      this.log('Erro ao enviar mensagem WhatsApp', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  private storeOTP(phoneNumber: string, code: string, clienteId?: string, username?: string): void {
    const storageKey = this.getStorageKey(phoneNumber)
    const expiresAt = Date.now() + (this.config.otpTTL! * 1000)

    this.storage.set(storageKey, {
      code,
      phoneNumber,
      clienteId,
      username,
      expiresAt,
      sentAt: Date.now(),
      attempts: 0
    })

    // Auto-cleanup após expiração
    setTimeout(() => {
      this.storage.delete(storageKey)
    }, this.config.otpTTL! * 1000)
  }

  private checkRateLimit(phoneNumber: string): { allowed: boolean; retryAfter?: number } {
    const rateLimitKey = this.getRateLimitKey(phoneNumber)
    const rateLimitData = this.storage.get(rateLimitKey)

    if (!rateLimitData) {
      return { allowed: true }
    }

    const now = Date.now()
    
    // Verificar se ainda está no período de rate limit
    if (now < rateLimitData.nextResendAt) {
      return {
        allowed: false,
        retryAfter: Math.ceil((rateLimitData.nextResendAt - now) / 1000)
      }
    }

    return { allowed: true }
  }

  private updateRateLimit(phoneNumber: string): void {
    const rateLimitKey = this.getRateLimitKey(phoneNumber)
    const now = Date.now()
    
    // Rate limit: 1 SMS por minuto por número
    this.storage.set(rateLimitKey, {
      lastSentAt: now,
      nextResendAt: now + 60000 // 1 minuto
    })

    // Auto-cleanup
    setTimeout(() => {
      this.storage.delete(rateLimitKey)
    }, 60000)
  }

  private clearRateLimit(phoneNumber: string): void {
    const rateLimitKey = this.getRateLimitKey(phoneNumber)
    this.storage.delete(rateLimitKey)
  }

  private async findOrCreateUser(phoneNumber: string, clienteId?: string, username?: string): Promise<any> {
    try {
      // Em produção, isso buscaria no banco de dados
      // Por enquanto, simula usuário
      this.log('Buscando usuário por WhatsApp', { phoneNumber, clienteId, username })

      return {
        id: `user_${phoneNumber.replace(/\D/g, '')}`,
        username: username || phoneNumber,
        email: username || `${phoneNumber.replace(/\D/g, '')}@whatsapp.temp`,
        phoneNumber,
        clienteId,
        firstName: 'Usuário',
        lastName: 'WhatsApp',
        verified: true,
        createdAt: new Date().toISOString()
      }

    } catch (error) {
      this.log('Erro ao buscar/criar usuário', error)
      return null
    }
  }

  private async generateAuthToken(user: any, clienteId?: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      // Em produção, isso geraria token JWT real
      // Por enquanto, simula token
      const tokenPayload = {
        sub: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        cliente_id: clienteId || 'default',
        auth_method: 'whatsapp_otp',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
      }

      // Simula token JWT
      const token = btoa(JSON.stringify(tokenPayload))

      return {
        accessToken: `Bearer ${token}`,
        expiresIn: 3600
      }

    } catch (error) {
      this.log('Erro ao gerar token', error)
      throw error
    }
  }

  private getStorageKey(phoneNumber: string): string {
    return `kryonix_otp_${phoneNumber.replace(/\D/g, '')}`
  }

  private getRateLimitKey(phoneNumber: string): string {
    return `kryonix_ratelimit_${phoneNumber.replace(/\D/g, '')}`
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[WhatsAppOTP] ${message}`, data)
    }
  }
}

// Instância singleton
let _whatsappOTP: WhatsAppOTP | null = null

export function getWhatsAppOTP(config?: WhatsAppOTPConfig): WhatsAppOTP {
  if (!_whatsappOTP) {
    _whatsappOTP = new WhatsAppOTP(config)
  }
  return _whatsappOTP
}

export default WhatsAppOTP

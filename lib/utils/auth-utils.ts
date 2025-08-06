import { DeviceInfo, TokenInfo } from '../types/auth'

export class AuthUtils {
  /**
   * Detecta informações do dispositivo
   */
  static getDeviceInfo(): DeviceInfo {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
    const platform = typeof window !== 'undefined' ? window.navigator.platform : ''
    
    return {
      userAgent,
      platform,
      isMobile: this.isMobileDevice(),
      hasBiometric: this.hasBiometricSupport(),
      hasWhatsApp: this.hasWhatsAppSupport()
    }
  }

  /**
   * Verifica se é dispositivo móvel
   */
  static isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      window.navigator.userAgent
    )
  }

  /**
   * Verifica suporte biométrico
   */
  static hasBiometricSupport(): boolean {
    if (typeof window === 'undefined') return false
    
    // Verificar se o navegador suporta WebAuthn
    return !!(window.navigator && 'credentials' in window.navigator)
  }

  /**
   * Verifica suporte WhatsApp
   */
  static hasWhatsAppSupport(): boolean {
    if (typeof window === 'undefined') return false

    // Verificar se está em mobile e tem capacidade de abrir WhatsApp
    return this.isMobileDevice() && /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)
  }

  /**
   * Gera ID único para cliente baseado no nome
   */
  static generateClienteId(nomeCliente: string): string {
    return nomeCliente
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
      .slice(0, 20) // Máximo 20 caracteres
  }

  /**
   * Valida formato de email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valida formato de telefone brasileiro
   */
  static isValidBrazilianPhone(phone: string): boolean {
    // Remove tudo que não é número
    const cleaned = phone.replace(/\D/g, '')
    
    // Verifica se tem 11 ou 10 dígitos (com ou sem 9 no celular)
    if (cleaned.length < 10 || cleaned.length > 13) return false
    
    // Se começar com 55, remove (código do Brasil)
    const number = cleaned.startsWith('55') ? cleaned.slice(2) : cleaned
    
    // Verifica formato brasileiro
    return /^[1-9]{2}9?[0-9]{8}$/.test(number)
  }

  /**
   * Formata telefone brasileiro
   */
  static formatBrazilianPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')
    let number = cleaned.startsWith('55') ? cleaned.slice(2) : cleaned
    
    // Adiciona código do país se não tiver
    if (!phone.startsWith('+')) {
      number = '55' + number
    }
    
    return '+' + number
  }

  /**
   * Decodifica token JWT
   */
  static decodeToken(token: string): TokenInfo | null {
    try {
      const payload = token.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      return decoded as TokenInfo
    } catch (error) {
      console.error('Erro ao decodificar token:', error)
      return null
    }
  }

  /**
   * Verifica se token está expirado
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded) return true
    
    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  }

  /**
   * Verifica se token vai expirar em breve
   */
  static isTokenExpiringSoon(token: string, thresholdSeconds: number = 300): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded) return true
    
    const now = Math.floor(Date.now() / 1000)
    return decoded.exp - now < thresholdSeconds
  }

  /**
   * Gera senha temporária segura
   */
  static generateTemporaryPassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    
    // Garantir pelo menos uma maiúscula, minúscula, número e símbolo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    password += '0123456789'[Math.floor(Math.random() * 10)]
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
    
    // Preencher o resto
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }
    
    // Embaralhar
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  /**
   * Gera código OTP numérico
   */
  static generateOTP(length: number = 6): string {
    const digits = '0123456789'
    let otp = ''
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)]
    }
    
    return otp
  }

  /**
   * Obtém endereço IP do cliente
   */
  static async getClientIP(): Promise<string> {
    try {
      // Em produção, isso seria obtido do servidor
      // Para desenvolvimento, retorna localhost
      return '127.0.0.1'
    } catch (error) {
      return '0.0.0.0'
    }
  }

  /**
   * Sanitiza entrada de usuário
   */
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove caracteres HTML
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  /**
   * Valida força da senha
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    // Comprimento mínimo
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('Senha deve ter pelo menos 8 caracteres')
    }

    // Maiúscula
    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Deve conter pelo menos uma letra maiúscula')
    }

    // Minúscula
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Deve conter pelo menos uma letra minúscula')
    }

    // Número
    if (/[0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('Deve conter pelo menos um número')
    }

    // Símbolo
    if (/[!@#$%^&*]/.test(password)) {
      score += 1
    } else {
      feedback.push('Deve conter pelo menos um símbolo (!@#$%^&*)')
    }

    return {
      isValid: score >= 4,
      score,
      feedback
    }
  }

  /**
   * Cria hash simples para logging (não para senhas!)
   */
  static simpleHash(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  /**
   * Detecta o realm do Keycloak baseado no domínio
   */
  static detectRealmFromDomain(hostname: string): string {
    // Se é subdomínio do kryonix.com.br
    if (hostname.includes('.kryonix.com.br') && hostname !== 'www.kryonix.com.br') {
      const subdomain = hostname.split('.')[0]
      return `kryonix-cliente-${subdomain}`
    }
    
    // Realm padrão
    return 'KRYONIX'
  }

  /**
   * Formata mensagem de erro para usuário final
   */
  static formatErrorMessage(error: any): string {
    // Mapeamento de erros técnicos para mensagens amigáveis
    const errorMap: Record<string, string> = {
      'invalid_grant': 'Email ou senha incorretos',
      'user_disabled': 'Sua conta está desabilitada. Entre em contato com o suporte.',
      'invalid_client': 'Erro de configuração. Tente novamente.',
      'unauthorized': 'Acesso não autorizado',
      'token_expired': 'Sua sessão expirou. Faça login novamente.',
      'network_error': 'Erro de conexão. Verifique sua internet.',
      'server_error': 'Erro interno do servidor. Tente novamente em alguns minutos.'
    }

    const errorType = error?.error || error?.code || 'unknown'
    return errorMap[errorType] || 'Ocorreu um erro inesperado. Tente novamente.'
  }

  /**
   * Formata tempo de expiração
   */
  static formatExpiryTime(timestamp: number): string {
    const now = Date.now() / 1000
    const diff = timestamp - now
    
    if (diff <= 0) return 'Expirado'
    
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    
    return `${minutes}m`
  }

  /**
   * Detecta tipo de módulo baseado na URL
   */
  static detectModuleFromPath(pathname: string): string | null {
    const moduleMap: Record<string, string> = {
      '/dashboard': 'analytics',
      '/agendamento': 'agendamento',
      '/atendimento': 'atendimento',
      '/crm': 'crm',
      '/marketing': 'email_marketing',
      '/social': 'social_media',
      '/portal': 'portal_cliente',
      '/admin': 'whitelabel'
    }

    for (const [path, module] of Object.entries(moduleMap)) {
      if (pathname.startsWith(path)) {
        return module
      }
    }

    return null
  }
}

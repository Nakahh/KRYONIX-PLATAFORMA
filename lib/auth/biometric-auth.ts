import { BiometricData, BiometricType } from '../types/auth'
import { AuthUtils } from '../utils/auth-utils'

export interface BiometricCredential {
  id: string
  type: 'public-key'
  rawId: ArrayBuffer
  response: {
    authenticatorData: ArrayBuffer
    clientDataJSON: ArrayBuffer
    signature: ArrayBuffer
    userHandle?: ArrayBuffer
  }
}

export interface BiometricRegistrationResult {
  success: boolean
  credentialId?: string
  publicKey?: string
  error?: string
}

export interface BiometricAuthResult {
  success: boolean
  credential?: BiometricCredential
  error?: string
}

export class BiometricAuth {
  private isSupported: boolean
  private debug: boolean

  constructor(debug = false) {
    this.debug = debug
    this.isSupported = this.checkSupport()
    this.log('Inicializando BiometricAuth', { supported: this.isSupported })
  }

  /**
   * Verifica se autenticação biométrica é suportada
   */
  checkSupport(): boolean {
    if (typeof window === 'undefined') return false
    
    // Verifica WebAuthn
    const hasWebAuthn = !!(
      window.navigator &&
      window.navigator.credentials &&
      typeof window.navigator.credentials.create === 'function' &&
      typeof window.navigator.credentials.get === 'function' &&
      window.PublicKeyCredential
    )

    // Verifica se é dispositivo móvel
    const isMobile = AuthUtils.isMobileDevice()
    
    return hasWebAuthn && isMobile
  }

  /**
   * Verifica se biometria está disponível no dispositivo
   */
  async isAvailable(): Promise<boolean> {
    if (!this.isSupported) return false

    try {
      // Verifica se há autenticadores disponíveis
      const available = await (PublicKeyCredential as any).isUserVerifyingPlatformAuthenticatorAvailable()
      this.log('Biometria disponível', { available })
      return available
    } catch (error) {
      this.log('Erro ao verificar disponibilidade biométrica', error)
      return false
    }
  }

  /**
   * Detecta tipos de biometria suportados
   */
  async getSupportedTypes(): Promise<BiometricType[]> {
    const types: BiometricType[] = []

    if (!await this.isAvailable()) return types

    // No navegador, não conseguimos detectar especificamente o tipo
    // Mas podemos assumir que dispositivos móveis modernos suportam:
    if (typeof window === 'undefined') return types
    const userAgent = window.navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      // iOS: Touch ID e Face ID
      types.push(BiometricType.FINGERPRINT, BiometricType.FACE)
    } else if (userAgent.includes('android')) {
      // Android: Fingerprint principalmente, alguns dispositivos com face
      types.push(BiometricType.FINGERPRINT)
      // Dispositivos mais novos podem ter reconhecimento facial
      if (userAgent.includes('android 9') || userAgent.includes('android 1')) {
        types.push(BiometricType.FACE)
      }
    }

    this.log('Tipos biométricos suportados', types)
    return types
  }

  /**
   * Registrar nova credencial biométrica
   */
  async register(username: string, displayName: string): Promise<BiometricRegistrationResult> {
    this.log('Iniciando registro biométrico', { username, displayName })

    if (!await this.isAvailable()) {
      return {
        success: false,
        error: 'Autenticação biométrica não disponível neste dispositivo'
      }
    }

    try {
      // Gerar challenge aleatório
      const challenge = this.generateChallenge()
      const userId = this.generateUserId(username)

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'KRYONIX',
          id: this.getRpId()
        },
        user: {
          id: userId,
          name: username,
          displayName
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false
        },
        timeout: 30000,
        attestation: 'direct'
      }

      this.log('Criando credencial', publicKeyCredentialCreationOptions)

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('Falha ao criar credencial biométrica')
      }

      const response = credential.response as AuthenticatorAttestationResponse
      const credentialId = this.arrayBufferToBase64(credential.rawId)
      const publicKey = this.arrayBufferToBase64(response.getPublicKey()!)

      this.log('Credencial criada com sucesso', { credentialId })

      // Salvar credencial (seria enviado para API)
      await this.saveCredential(username, {
        credentialId,
        publicKey,
        counter: 0,
        deviceInfo: AuthUtils.getDeviceInfo()
      })

      return {
        success: true,
        credentialId,
        publicKey
      }

    } catch (error) {
      this.log('Erro no registro biométrico', error)
      return {
        success: false,
        error: this.formatBiometricError(error)
      }
    }
  }

  /**
   * Autenticar com biometria
   */
  async authenticate(username: string): Promise<BiometricAuthResult> {
    this.log('Iniciando autenticação biométrica', { username })

    if (!await this.isAvailable()) {
      return {
        success: false,
        error: 'Autenticação biométrica não disponível'
      }
    }

    try {
      // Buscar credenciais do usuário
      const userCredentials = await this.getUserCredentials(username)
      if (!userCredentials || userCredentials.length === 0) {
        return {
          success: false,
          error: 'Nenhuma credencial biométrica encontrada para este usuário'
        }
      }

      const challenge = this.generateChallenge()
      const allowCredentials = userCredentials.map(cred => ({
        id: this.base64ToArrayBuffer(cred.credentialId),
        type: 'public-key' as const,
        transports: ['internal'] as AuthenticatorTransport[]
      }))

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials,
        userVerification: 'required',
        timeout: 30000,
        rpId: this.getRpId()
      }

      this.log('Solicitando autenticação', publicKeyCredentialRequestOptions)

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('Autenticação biométrica cancelada')
      }

      this.log('Autenticação bem-sucedida', { credentialId: credential.id })

      // Verificar assinatura (seria feito no servidor)
      const isValid = await this.verifySignature(credential, challenge)
      
      if (!isValid) {
        throw new Error('Assinatura biométrica inválida')
      }

      return {
        success: true,
        credential: {
          id: credential.id,
          type: 'public-key',
          rawId: credential.rawId,
          response: {
            authenticatorData: (credential.response as AuthenticatorAssertionResponse).authenticatorData,
            clientDataJSON: credential.response.clientDataJSON,
            signature: (credential.response as AuthenticatorAssertionResponse).signature,
            userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle || undefined
          }
        }
      }

    } catch (error) {
      this.log('Erro na autenticação biométrica', error)
      return {
        success: false,
        error: this.formatBiometricError(error)
      }
    }
  }

  /**
   * Remover credencial biométrica
   */
  async removeCredential(username: string, credentialId: string): Promise<boolean> {
    try {
      this.log('Removendo credencial biométrica', { username, credentialId })
      
      // Remover do armazenamento local
      const storageKey = `kryonix_biometric_${username}`
      const stored = localStorage.getItem(storageKey)
      
      if (stored) {
        const credentials = JSON.parse(stored)
        const filtered = credentials.filter((c: any) => c.credentialId !== credentialId)
        
        if (filtered.length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(filtered))
        } else {
          localStorage.removeItem(storageKey)
        }
      }

      // Remover do servidor (seria implementado)
      await this.removeCredentialFromServer(username, credentialId)
      
      return true
    } catch (error) {
      this.log('Erro ao remover credencial', error)
      return false
    }
  }

  /**
   * Listar credenciais do usuário
   */
  async getUserCredentials(username: string): Promise<any[]> {
    try {
      // Buscar do armazenamento local (temporário)
      const storageKey = `kryonix_biometric_${username}`
      const stored = localStorage.getItem(storageKey)
      
      if (stored) {
        return JSON.parse(stored)
      }

      // Buscar do servidor
      return await this.fetchCredentialsFromServer(username)
    } catch (error) {
      this.log('Erro ao buscar credenciais', error)
      return []
    }
  }

  /**
   * Verificar se usuário tem biometria configurada
   */
  async hasRegisteredCredentials(username: string): Promise<boolean> {
    const credentials = await this.getUserCredentials(username)
    return credentials.length > 0
  }

  // Métodos privados

  private generateChallenge(): ArrayBuffer {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)
    return challenge.buffer
  }

  private generateUserId(username: string): ArrayBuffer {
    const encoder = new TextEncoder()
    return encoder.encode(username).buffer
  }

  private getRpId(): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      // Para desenvolvimento local
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return hostname
      }
      // Para produção
      return 'kryonix.com.br'
    }
    return 'kryonix.com.br'
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const buffer = new ArrayBuffer(binary.length)
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return buffer
  }

  private async saveCredential(username: string, credentialData: any): Promise<void> {
    // Salvar localmente (temporário para desenvolvimento)
    const storageKey = `kryonix_biometric_${username}`
    const existing = localStorage.getItem(storageKey)
    const credentials = existing ? JSON.parse(existing) : []
    
    credentials.push({
      ...credentialData,
      createdAt: new Date().toISOString()
    })
    
    localStorage.setItem(storageKey, JSON.stringify(credentials))

    // Enviar para servidor (seria implementado)
    await this.sendCredentialToServer(username, credentialData)
  }

  private async sendCredentialToServer(username: string, credentialData: any): Promise<void> {
    try {
      // Implementação seria aqui
      this.log('Enviando credencial para servidor', { username })
    } catch (error) {
      this.log('Erro ao enviar credencial para servidor', error)
    }
  }

  private async removeCredentialFromServer(username: string, credentialId: string): Promise<void> {
    try {
      // Implementação seria aqui
      this.log('Removendo credencial do servidor', { username, credentialId })
    } catch (error) {
      this.log('Erro ao remover credencial do servidor', error)
    }
  }

  private async fetchCredentialsFromServer(username: string): Promise<any[]> {
    try {
      // Implementação seria aqui
      this.log('Buscando credenciais do servidor', { username })
      return []
    } catch (error) {
      this.log('Erro ao buscar credenciais do servidor', error)
      return []
    }
  }

  private async verifySignature(credential: PublicKeyCredential, challenge: ArrayBuffer): Promise<boolean> {
    try {
      // Em produção, a verificação seria feita no servidor
      // Por enquanto, simula verificação bem-sucedida
      this.log('Verificando assinatura biom��trica', { credentialId: credential.id })
      return true
    } catch (error) {
      this.log('Erro na verificação de assinatura', error)
      return false
    }
  }

  private formatBiometricError(error: any): string {
    if (error.name === 'NotAllowedError') {
      return 'Acesso à biometria foi negado. Verifique as permissões do navegador.'
    }
    
    if (error.name === 'NotSupportedError') {
      return 'Autenticação biométrica não é suportada neste dispositivo.'
    }
    
    if (error.name === 'SecurityError') {
      return 'Erro de segurança na autenticação biométrica.'
    }
    
    if (error.name === 'AbortError') {
      return 'Autenticação biométrica foi cancelada.'
    }
    
    if (error.name === 'TimeoutError') {
      return 'Tempo limite da autenticação biométrica excedido.'
    }
    
    if (error.name === 'UnknownError') {
      return 'Erro desconhecido na autenticação biométrica.'
    }
    
    return error.message || 'Erro na autenticação biométrica'
  }

  private log(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[BiometricAuth] ${message}`, data)
    }
  }
}

// Instância singleton
let _biometricAuth: BiometricAuth | null = null

export function getBiometricAuth(debug = false): BiometricAuth {
  if (!_biometricAuth) {
    _biometricAuth = new BiometricAuth(debug)
  }
  return _biometricAuth
}

export default BiometricAuth

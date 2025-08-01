// Tipos para autenticação KRYONIX
export interface KryonixConfig {
  clienteId?: string
  apiKey?: string
  baseURL?: string
  keycloakURL?: string
  debug?: boolean
}

export interface LoginCredentials {
  username: string
  password: string
  whatsapp?: string
  biometric?: boolean
}

export interface BiometricData {
  enabled: boolean
  type: 'fingerprint' | 'face' | 'iris' | 'voice'
  deviceId: string
  publicKey: string
}

export interface AuthResult {
  success: boolean
  token?: string
  refreshToken?: string
  expiresIn?: number
  user?: UserProfile
  modulosPermitidos?: string[]
  clienteId?: string
  error?: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  cliente_id: string
  roles: string[]
  attributes?: Record<string, any>
}

export interface WhatsAppOTPRequest {
  phoneNumber: string
  clienteId?: string
}

export interface WhatsAppOTPValidation {
  phoneNumber: string
  code: string
  clienteId?: string
}

export interface ClienteInfo {
  id: string
  nome: string
  subdomain: string
  realm: string
  modulosContratados: string[]
  status: 'ativo' | 'inativo' | 'pendente'
  createdAt: string
}

export interface TokenInfo {
  sub: string
  email: string
  name: string
  preferred_username: string
  cliente_id: string
  resource_access: {
    [clientId: string]: {
      roles: string[]
    }
  }
  exp: number
  iat: number
}

export interface DeviceInfo {
  userAgent: string
  platform: string
  isMobile: boolean
  hasBiometric: boolean
  hasWhatsApp: boolean
}

export interface AuthEvent {
  type: 'login' | 'logout' | 'token_refresh' | 'biometric_auth' | 'whatsapp_otp'
  userId: string
  clienteId: string
  success: boolean
  ipAddress: string
  userAgent: string
  deviceInfo: DeviceInfo
  module?: string
  timestamp: string
}

export interface NovoClienteData {
  nome: string
  email: string
  whatsapp: string
  subdomain?: string
  modulosContratados: string[]
  adminUser: {
    email: string
    firstName: string
    lastName: string
  }
}

export interface ClienteCreationResult {
  cliente_id: string
  realm_name: string
  subdomain: string
  admin_credentials: {
    email: string
    temporary_password: string
  }
  api_tokens: {
    access_token: string
    refresh_token: string
  }
  modules_enabled: string[]
  creation_time: number
  status: string
}

// Enums
export enum AuthMethod {
  PASSWORD = 'password',
  BIOMETRIC = 'biometric',
  WHATSAPP_OTP = 'whatsapp_otp',
  SOCIAL = 'social'
}

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  IRIS = 'iris',
  VOICE = 'voice'
}

export enum ClienteStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  PENDENTE = 'pendente',
  SUSPENSO = 'suspenso'
}

export enum ModuloSaaS {
  ANALYTICS = 'analytics',
  AGENDAMENTO = 'agendamento',
  ATENDIMENTO = 'atendimento',
  CRM = 'crm',
  EMAIL_MARKETING = 'email_marketing',
  SOCIAL_MEDIA = 'social_media',
  PORTAL_CLIENTE = 'portal_cliente',
  WHITELABEL = 'whitelabel'
}

// Constantes
export const KRYONIX_CONSTANTS = {
  DEFAULT_TOKEN_EXPIRY: 3600, // 1 hora
  REFRESH_THRESHOLD: 300, // 5 minutos antes de expirar
  MAX_LOGIN_ATTEMPTS: 5,
  OTP_VALIDITY: 300, // 5 minutos
  BIOMETRIC_TIMEOUT: 30, // 30 segundos
  API_TIMEOUT: 10000, // 10 segundos
  
  ENDPOINTS: {
    TOKEN: '/realms/{realm}/protocol/openid_connect/token',
    USER_INFO: '/realms/{realm}/protocol/openid_connect/userinfo',
    LOGOUT: '/realms/{realm}/protocol/openid_connect/logout',
    WELL_KNOWN: '/realms/{realm}/.well-known/openid_configuration'
  },
  
  CLIENTS: {
    FRONTEND: 'kryonix-frontend',
    MOBILE: 'kryonix-mobile-app',
    API: 'kryonix-api-client',
    AI: 'kryonix-ai-client'
  },
  
  SCOPES: {
    OPENID: 'openid',
    PROFILE: 'profile',
    EMAIL: 'email',
    OFFLINE_ACCESS: 'offline_access',
    ROLES: 'roles'
  }
} as const

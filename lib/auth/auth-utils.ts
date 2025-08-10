import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export interface User {
  id: number
  uuid: string
  email: string
  name: string
  company?: string
  role: string
  is_active: boolean
  email_verified: boolean
  created_at: string
}

export interface TokenPayload {
  userId: number
  email: string
  role: string
  sessionId: string
  iat?: number
  exp?: number
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  refreshToken?: string
  error?: string
  requiresVerification?: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'kryonix-platform',
    audience: 'kryonix-users'
  })
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'kryonix-platform',
    audience: 'kryonix-refresh'
  })
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'kryonix-platform',
      audience: 'kryonix-users'
    }) as TokenPayload
    
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'kryonix-platform',
      audience: 'kryonix-refresh'
    }) as TokenPayload
    
    return decoded
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate user registration data
 */
export function validateRegistrationData(data: {
  email: string
  password: string
  name: string
  company?: string
}): ValidationResult {
  const errors: string[] = []
  
  // Validate email
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required')
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors)
  }
  
  // Validate name
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  }
  
  // Validate name format (no numbers or special chars except spaces, hyphens, apostrophes)
  if (data.name && !/^[a-zA-ZÀ-ÿ\s\-']+$/.test(data.name)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes')
  }
  
  // Validate company name if provided
  if (data.company && data.company.trim().length > 0 && data.company.trim().length < 2) {
    errors.push('Company name must be at least 2 characters long')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
}

/**
 * Check if user is locked due to failed login attempts
 */
export function isUserLocked(lockoutUntil: Date | null): boolean {
  if (!lockoutUntil) return false
  return new Date() < lockoutUntil
}

/**
 * Calculate lockout expiry time
 */
export function calculateLockoutExpiry(attempts: number): Date {
  // Progressive lockout: 5 min, 15 min, 30 min, 1 hour, 2 hours
  const lockoutMinutes = Math.min(Math.pow(3, attempts - 3) * 5, 120)
  return new Date(Date.now() + lockoutMinutes * 60 * 1000)
}

/**
 * Sanitize user data for API responses
 */
export function sanitizeUser(user: any): User {
  return {
    id: user.id,
    uuid: user.uuid,
    email: user.email,
    name: user.name,
    company: user.company,
    role: user.role,
    is_active: user.is_active,
    email_verified: user.email_verified,
    created_at: user.created_at
  }
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isLimited(key: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key)
    
    if (!attempts || now > attempts.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs })
      return false
    }
    
    if (attempts.count >= this.maxAttempts) {
      return true
    }
    
    attempts.count++
    return false
  }
  
  reset(key: string): void {
    this.attempts.delete(key)
  }
  
  getRemainingAttempts(key: string): number {
    const attempts = this.attempts.get(key)
    if (!attempts || Date.now() > attempts.resetTime) {
      return this.maxAttempts
    }
    return Math.max(0, this.maxAttempts - attempts.count)
  }
}

/**
 * Security headers for API responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
}

/**
 * CORS headers for API responses
 */
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://kryonix-plataforma.vercel.app',
    'https://www.kryonix.com.br'
  ]
  
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  }
}

/**
 * Extract IP address from request
 */
export function getClientIp(request: any): string {
  return (
    request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    request.headers['x-real-ip'] ||
    request.connection?.remoteAddress ||
    request.socket?.remoteAddress ||
    'unknown'
  )
}

/**
 * Log security event
 */
export function logSecurityEvent(
  level: 'info' | 'warn' | 'error',
  message: string,
  details?: any,
  userId?: number,
  ipAddress?: string
): void {
  const logEntry = {
    level,
    message,
    details,
    userId,
    ipAddress,
    timestamp: new Date().toISOString(),
    source: 'auth-utils'
  }
  
  console.log(`[SECURITY ${level.toUpperCase()}]`, JSON.stringify(logEntry))
  
  // In production, you might want to send this to a logging service
  // like Winston, Sentry, or a database
}

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  validateEmail,
  validatePassword,
  validateRegistrationData,
  generateSessionId,
  isUserLocked,
  calculateLockoutExpiry,
  sanitizeUser,
  RateLimiter,
  securityHeaders,
  getCorsHeaders,
  getClientIp,
  logSecurityEvent
}

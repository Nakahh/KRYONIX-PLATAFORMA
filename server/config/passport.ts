import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bcrypt from 'bcryptjs';
import { getDataSource } from '../db/connection';
import { User } from '../entities/User';
import { authService } from '../services/auth';

/**
 * 🔐 MÓDULO 11 - SISTEMA DE AUTENTICAÇÃO AVANÇADA KRYONIX
 * Configuração completa do Passport.js para Brasil
 * - OAuth2 (Google, GitHub)
 * - Autenticação local com senha
 * - JWT para APIs
 * - RBAC granular
 * - Logs de segurança
 */

// Configuração para extrair JWT dos cookies ou headers
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    // Primeiro tenta extrair do cookie (web)
    (req) => req.cookies?.accessToken || null,
    // Depois tenta do header Authorization (mobile/API)
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: process.env.JWT_SECRET || 'kryonix-jwt-secret-change-in-production',
  issuer: 'kryonix.com.br',
  audience: 'kryonix-app',
};

/**
 * 🎯 Estratégia JWT para autenticação de APIs
 */
passport.use(new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const dataSource = getDataSource();
    const userRepository = dataSource.getRepository(User);
    
    const user = await userRepository.findOne({
      where: { id: jwtPayload.sub, isActive: true },
      relations: ['tenant', 'profile']
    });

    if (!user) {
      return done(null, false, { message: 'Usuário não encontrado ou inativo' });
    }

    // Verificar se o token não expirou
    if (jwtPayload.exp && Date.now() >= jwtPayload.exp * 1000) {
      return done(null, false, { message: 'Token expirado' });
    }

    // Retornar dados do usuário para req.user
    return done(null, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.permissions || [],
      lastLoginAt: user.lastLoginAt,
      profile: user.profile,
      tenant: user.tenant
    });

  } catch (error) {
    console.error('Erro na validação JWT:', error);
    return done(error, false);
  }
}));

/**
 * 📧 Estratégia Local (email + senha)
 */
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  try {
    const dataSource = getDataSource();
    const userRepository = dataSource.getRepository(User);

    // Buscar usuário por email
    const user = await userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      relations: ['tenant', 'profile']
    });

    if (!user) {
      return done(null, false, { 
        message: 'Email não encontrado. Verifique seus dados ou crie uma conta.' 
      });
    }

    if (!user.isActive) {
      return done(null, false, { 
        message: 'Conta desativada. Entre em contato com o suporte.' 
      });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Log tentativa de login falhada
      console.log(`[SECURITY] Login falhou para ${email} - IP: ${req.ip}`);
      
      return done(null, false, { 
        message: 'Senha incorreta. Tente novamente ou use "Esqueci minha senha".' 
      });
    }

    // Verificar se precisa de 2FA
    if (user.twoFactorEnabled && !req.body.twoFactorCode) {
      return done(null, false, { 
        message: '2FA necessário',
        requiresTwoFactor: true,
        userId: user.id
      });
    }

    // Validar código 2FA se fornecido
    if (user.twoFactorEnabled && req.body.twoFactorCode) {
      const isValid2FA = await authService.validateTwoFactorCode(
        user.id, 
        req.body.twoFactorCode
      );

      if (!isValid2FA) {
        return done(null, false, { 
          message: 'Código de autenticação inválido. Verifique no seu app autenticador.' 
        });
      }
    }

    // Atualizar último login
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip;
    await userRepository.save(user);

    // Log login bem-sucedido
    console.log(`[AUTH] Login successful: ${user.email} - IP: ${req.ip}`);

    return done(null, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.permissions || [],
      lastLoginAt: user.lastLoginAt,
      profile: user.profile,
      tenant: user.tenant
    });

  } catch (error) {
    console.error('Erro na autenticação local:', error);
    return done(error);
  }
}));

/**
 * 🌐 Google OAuth2 Strategy
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const result = await authService.handleOAuthLogin({
        provider: 'google',
        providerId: profile.id,
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName || '',
        avatar: profile.photos?.[0]?.value || null,
        accessToken,
        refreshToken
      });

      if (result.success) {
        console.log(`[AUTH] Google OAuth login: ${result.user?.email}`);
        return done(null, result.user);
      } else {
        return done(null, false, { message: result.message });
      }

    } catch (error) {
      console.error('Erro no Google OAuth:', error);
      return done(error);
    }
  }));
}

/**
 * 🐙 GitHub OAuth2 Strategy  
 */
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/v1/auth/github/callback',
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const result = await authService.handleOAuthLogin({
        provider: 'github',
        providerId: profile.id,
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName || profile.username || '',
        avatar: profile.photos?.[0]?.value || null,
        accessToken,
        refreshToken
      });

      if (result.success) {
        console.log(`[AUTH] GitHub OAuth login: ${result.user?.email}`);
        return done(null, result.user);
      } else {
        return done(null, false, { message: result.message });
      }

    } catch (error) {
      console.error('Erro no GitHub OAuth:', error);
      return done(error);
    }
  }));
}

/**
 * 💾 Serialização do usuário para sessão
 */
passport.serializeUser((user: any, done) => {
  done(null, { id: user.id, tenantId: user.tenantId });
});

/**
 * 📤 Deserialização do usuário da sessão
 */
passport.deserializeUser(async (sessionUser: any, done) => {
  try {
    const dataSource = getDataSource();
    const userRepository = dataSource.getRepository(User);
    
    const user = await userRepository.findOne({
      where: { id: sessionUser.id, isActive: true },
      relations: ['tenant', 'profile']
    });

    if (!user) {
      return done(null, false);
    }

    done(null, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.permissions || [],
      lastLoginAt: user.lastLoginAt,
      profile: user.profile,
      tenant: user.tenant
    });

  } catch (error) {
    console.error('Erro na deserialização do usuário:', error);
    done(error);
  }
});

/**
 * 🛡️ Middleware de inicialização do Passport
 */
export function initializePassport(app: any) {
  app.use(passport.initialize());
  app.use(passport.session());
  
  console.log('✅ Passport configurado com sucesso');
  
  // Log das estratégias ativas
  const strategies = ['jwt', 'local'];
  if (process.env.GOOGLE_CLIENT_ID) strategies.push('google');
  if (process.env.GITHUB_CLIENT_ID) strategies.push('github');
  
  console.log(`🔐 Estratégias ativas: ${strategies.join(', ')}`);
}

export default passport;

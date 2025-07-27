import { Router, Request, Response } from 'express';
import passport from 'passport';
import { z } from 'zod';
import { authenticateToken, validateBody, rateLimitByUser } from '../middleware/auth';
import { authService } from '../services/auth';
import { twoFactorService } from '../services/two-factor';

/**
 * 🔐 MÓDULO 11 - ROTAS DE AUTENTICAÇÃO AVANÇADA BRASIL
 * Sistema completo de autenticação para usuários brasileiros
 * - Login/Registro em português
 * - OAuth2 Google/GitHub
 * - 2FA com Google Authenticator
 * - Recuperação de senha
 * - Logs de segurança
 */

const router = Router();

// =============================================================================
// SCHEMAS DE VALIDAÇÃO EM PORTUGUÊS
// =============================================================================

const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(128, 'Senha muito longa'),
  twoFactorCode: z
    .string()
    .optional()
    .refine(val => !val || /^\d{6}$/.test(val.replace(/\s/g, '')), 
      'Código 2FA deve ter 6 dígitos'),
  rememberMe: z.boolean().optional()
});

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  confirmPassword: z.string(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Você deve aceitar os termos de uso'),
  marketingConsent: z.boolean().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .transform(val => val.toLowerCase().trim())
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Senha deve conter ao menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

const enable2FASchema = z.object({
  secret: z.string().min(1, 'Secret é obrigatório'),
  verificationCode: z
    .string()
    .regex(/^\d{6}$/, 'Código deve ter 6 dígitos'),
  backupCodes: z.array(z.string()).min(10, 'Códigos de backup são obrigatórios')
});

// =============================================================================
// ROTAS DE AUTENTICAÇÃO
// =============================================================================

/**
 * 📧 Login com email e senha
 */
router.post('/login', 
  rateLimitByUser(10, 15 * 60 * 1000), // 10 tentativas por 15 minutos
  validateBody(loginSchema),
  (req: Request, res: Response, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({
          success: false,
          message: 'Erro interno do servidor. Tente novamente em alguns minutos.',
          code: 'INTERNAL_ERROR'
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: info.message || 'Credenciais inválidas',
          code: info.requiresTwoFactor ? 'REQUIRES_2FA' : 'INVALID_CREDENTIALS',
          requiresTwoFactor: info.requiresTwoFactor,
          userId: info.userId
        });
      }

      // Gerar tokens JWT
      const tokens = authService.generateTokens(user);

      // Configurar cookies seguros
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: req.body.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 dias ou 1 dia
      };

      res.cookie('accessToken', tokens.accessToken, cookieOptions);
      res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({
        success: true,
        message: `Bem-vindo de volta, ${user.name}!`,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            lastLoginAt: user.lastLoginAt,
            profile: user.profile
          },
          tokens
        }
      });

    })(req, res, next);
  }
);

/**
 * 📝 Registro de novo usuário
 */
router.post('/register',
  rateLimitByUser(3, 60 * 60 * 1000), // 3 tentativas por hora
  validateBody(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const { name, email, password, acceptTerms, marketingConsent } = req.body;

      const result = await authService.register({
        name,
        email,
        password,
        acceptTerms,
        marketingConsent: marketingConsent || false,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
          code: result.code
        });
      }

      // Auto-login após registro
      const tokens = authService.generateTokens(result.user!);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 24 * 60 * 60 * 1000 // 1 dia
      };

      res.cookie('accessToken', tokens.accessToken, cookieOptions);
      res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.status(201).json({
        success: true,
        message: `Conta criada com sucesso! Bem-vindo ao KRYONIX, ${result.user!.name}!`,
        data: {
          user: result.user,
          tokens
        }
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno. Tente novamente em alguns minutos.',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

/**
 * 🚪 Logout
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Invalidar refresh token no banco
    if (req.cookies.refreshToken) {
      await authService.invalidateRefreshToken(req.cookies.refreshToken);
    }

    // Limpar cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout realizado com sucesso. Até logo!'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro no logout'
    });
  }
});

/**
 * 🔄 Refresh Token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Token de renovação não fornecido',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const result = await authService.refreshTokens(refreshToken);

    if (!result.success) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      
      return res.status(401).json({
        success: false,
        message: result.message,
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Atualizar cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const
    };

    res.cookie('accessToken', result.tokens!.accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', result.tokens!.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      success: true,
      message: 'Tokens renovados com sucesso',
      data: {
        tokens: result.tokens
      }
    });

  } catch (error) {
    console.error('Erro ao renovar tokens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno'
    });
  }
});

/**
 * 👤 Obter dados do usuário atual
 */
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// =============================================================================
// OAUTH2 ROUTES
// =============================================================================

/**
 * 🌐 Google OAuth2
 */
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const tokens = authService.generateTokens(user);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 24 * 60 * 60 * 1000
      };

      res.cookie('accessToken', tokens.accessToken, cookieOptions);
      res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      // Redirecionar para o frontend
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/dashboard?success=true`);

    } catch (error) {
      console.error('Erro no callback Google:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=oauth_failed`);
    }
  }
);

/**
 * 🐙 GitHub OAuth2
 */
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const tokens = authService.generateTokens(user);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 24 * 60 * 60 * 1000
      };

      res.cookie('accessToken', tokens.accessToken, cookieOptions);
      res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/dashboard?success=true`);

    } catch (error) {
      console.error('Erro no callback GitHub:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=oauth_failed`);
    }
  }
);

// =============================================================================
// RECUPERAÇÃO DE SENHA
// =============================================================================

/**
 * 🔑 Solicitar reset de senha
 */
router.post('/forgot-password',
  rateLimitByUser(3, 60 * 60 * 1000), // 3 tentativas por hora
  validateBody(forgotPasswordSchema),
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const result = await authService.requestPasswordReset(email, req.ip);

      // Sempre retornar sucesso por segurança (não revelar se email existe)
      res.json({
        success: true,
        message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha em alguns minutos.'
      });

    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno. Tente novamente.'
      });
    }
  }
);

/**
 * 🔐 Resetar senha
 */
router.post('/reset-password',
  rateLimitByUser(5, 60 * 60 * 1000), // 5 tentativas por hora
  validateBody(resetPasswordSchema),
  async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      const result = await authService.resetPassword(token, password, req.ip);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
          code: result.code
        });
      }

      res.json({
        success: true,
        message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.'
      });

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno. Tente novamente.'
      });
    }
  }
);

// =============================================================================
// AUTENTICAÇÃO DE DOIS FATORES (2FA)
// =============================================================================

/**
 * 🔧 Configurar 2FA
 */
router.post('/2fa/setup', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const setup = await twoFactorService.generateTwoFactorSetup(user.id, user.email);

    res.json({
      success: true,
      message: 'Configuração 2FA gerada com sucesso',
      data: setup
    });

  } catch (error) {
    console.error('Erro ao configurar 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao configurar 2FA'
    });
  }
});

/**
 * ✅ Ativar 2FA
 */
router.post('/2fa/enable', 
  authenticateToken,
  validateBody(enable2FASchema),
  async (req: Request, res: Response) => {
    try {
      const user = req.user!;
      const { secret, verificationCode, backupCodes } = req.body;

      const result = await twoFactorService.enableTwoFactor(
        user.id,
        secret,
        verificationCode,
        backupCodes
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erro ao ativar 2FA:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao ativar 2FA'
      });
    }
  }
);

/**
 * ❌ Desativar 2FA
 */
router.post('/2fa/disable', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { currentPassword, verificationCode } = req.body;

    const result = await twoFactorService.disableTwoFactor(
      user.id,
      currentPassword,
      verificationCode
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Erro ao desativar 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desativar 2FA'
    });
  }
});

/**
 * 🔄 Gerar novos códigos de backup
 */
router.post('/2fa/backup-codes', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { verificationCode } = req.body;

    const result = await twoFactorService.generateNewBackupCodes(user.id, verificationCode);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        backupCodes: result.backupCodes
      }
    });

  } catch (error) {
    console.error('Erro ao gerar códigos de backup:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar códigos de backup'
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { authService } from '../services/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Deve aceitar os termos'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

// Configuração OAuth Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const result = await authService.oauthLogin('google', profile);
      return done(null, result);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Configuração OAuth GitHub
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const result = await authService.oauthLogin('github', profile);
      return done(null, result);
    } catch (error) {
      return done(error, null);
    }
  }));
}

/**
 * @route POST /api/auth/login
 * @desc Login com email e senha
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await authService.login(email, password);

    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Configurar cookies seguros
    res.cookie('accessToken', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: result.user,
        tokens: result.tokens,
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Registro de novo usuário
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const userData = registerSchema.parse(req.body);

    const result = await authService.register(userData);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Erro ao criar usuário. Verifique os dados informados.',
        code: 'REGISTRATION_FAILED'
      });
    }

    // Configurar cookies seguros
    res.cookie('accessToken', result.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso! Bem-vindo à KRYONIX!',
      data: {
        user: result.user,
        tokens: result.tokens,
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    if (error instanceof Error && error.message === 'Email já cadastrado') {
      return res.status(409).json({
        success: false,
        message: 'Este email já está em uso. Tente fazer login ou use outro email.',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Atualizar token de acesso
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token não fornecido',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    const tokens = await authService.refreshToken(refreshToken);

    if (!tokens) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido ou expirado',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Atualizar cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    return res.json({
      success: true,
      message: 'Token atualizado com sucesso',
      data: tokens
    });
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Obter dados do usuário logado
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    return res.json({
      success: true,
      data: {
        user,
        permissions: user?.permissions || [],
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário
 */
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      await authService.logout(userId);
    }

    // Limpar cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// OAuth Routes - Google
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const result = req.user as any;

      if (!result) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      }

      // Configurar cookies
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const redirectUrl = result.isNewUser 
        ? `${process.env.FRONTEND_URL}/onboarding?welcome=true`
        : `${process.env.FRONTEND_URL}/dashboard`;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Erro no callback Google:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// OAuth Routes - GitHub
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  async (req: Request, res: Response) => {
    try {
      const result = req.user as any;

      if (!result) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
      }

      // Configurar cookies
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const redirectUrl = result.isNewUser 
        ? `${process.env.FRONTEND_URL}/onboarding?welcome=true`
        : `${process.env.FRONTEND_URL}/dashboard`;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Erro no callback GitHub:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

export default router;

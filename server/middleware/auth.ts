import { Request, Response, NextFunction } from 'express';
import { authService, UserSession } from '../services/auth';
import { z } from 'zod';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

/**
 * Middleware para verificar se o usuário está autenticado
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obter token do header Authorization ou cookie
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
        code: 'MISSING_TOKEN'
      });
    }

    // Validar token
    const user = await authService.validateToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }

    // Adicionar usuário à requisição
    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    return res.status(401).json({
      success: false,
      message: 'Falha na autenticação',
      code: 'AUTH_FAILED'
    });
  }
};

/**
 * Middleware para verificar permissões específicas
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!user.permissions.includes(permission) && !user.permissions.includes('read:all')) {
      return res.status(403).json({
        success: false,
        message: 'Permissão insuficiente',
        code: 'INSUFFICIENT_PERMISSION',
        required: permission
      });
    }

    next();
  };
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Role insuficiente',
        code: 'INSUFFICIENT_ROLE',
        required: allowedRoles,
        current: user.role
      });
    }

    next();
  };
};

/**
 * Middleware para verificar se o usuário pertence ao tenant
 */
export const requireTenantAccess = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Super admin tem acesso a todos os tenants
  if (user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Verificar se o usuário pertence ao tenant
  if (tenantId && user.tenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado ao tenant',
      code: 'TENANT_ACCESS_DENIED'
    });
  }

  next();
};

/**
 * Middleware para verificar se é super admin
 */
export const requireSuperAdmin = requireRole('SUPER_ADMIN');

/**
 * Middleware para verificar se é admin do tenant
 */
export const requireTenantAdmin = requireRole(['SUPER_ADMIN', 'TENANT_ADMIN']);

/**
 * Middleware para autenticação opcional (não bloqueia se não autenticado)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const user = await authService.validateToken(token);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem usuário autenticado
    next();
  }
};

/**
 * Middleware para rate limiting por usuário
 */
export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();

    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Tente novamente em alguns minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
};

/**
 * Middleware para verificar se o tenant está ativo
 */
export const requireActiveTenant = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // TODO: Verificar se o tenant está ativo no banco
  // Por enquanto, assumir que está ativo

  next();
};

/**
 * Middleware para logs de auditoria
 */
export const auditLog = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    // Log da ação (você pode implementar um sistema de logs mais robusto)
    console.log(`[AUDIT] ${new Date().toISOString()} - User: ${user?.id || 'anonymous'} - Action: ${action} - IP: ${req.ip}`);
    
    next();
  };
};

/**
 * Middleware para verificar se o plano permite a funcionalidade
 */
export const requirePlan = (requiredPlans: string | string[]) => {
  const allowedPlans = Array.isArray(requiredPlans) ? requiredPlans : [requiredPlans];
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // TODO: Verificar o plano do tenant no banco
    // Por enquanto, permitir todos os planos

    next();
  };
};

/**
 * Alias for authenticateToken (compatibility)
 */
export const authenticateJWT = authenticateToken;

/**
 * Create auth middleware with optional permissions
 */
export const createAuthMiddleware = (options?: {
  permissions?: string[];
  roles?: string[];
  optional?: boolean;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (options?.optional) {
      return optionalAuth(req, res, () => {
        if (options.permissions && req.user) {
          return requirePermission(options.permissions[0])(req, res, next);
        }
        if (options.roles && req.user) {
          return requireRole(options.roles)(req, res, next);
        }
        next();
      });
    }

    return authenticateToken(req, res, () => {
      if (options?.permissions) {
        return requirePermission(options.permissions[0])(req, res, next);
      }
      if (options?.roles) {
        return requireRole(options.roles)(req, res, next);
      }
      next();
    });
  };
};

/**
 * Validate request body with Zod schema
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors: result.error.errors,
          code: 'VALIDATION_ERROR'
        });
      }
      req.body = result.data;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Erro na validação dos dados',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

/**
 * Validate request query with Zod schema
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros de consulta inválidos',
          errors: result.error.errors,
          code: 'VALIDATION_ERROR'
        });
      }
      req.query = result.data;
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Erro na validação dos parâmetros',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};

export default {
  authenticateToken,
  authenticateJWT,
  createAuthMiddleware,
  validateBody,
  validateQuery,
  requirePermission,
  requireRole,
  requireTenantAccess,
  requireSuperAdmin,
  requireTenantAdmin,
  optionalAuth,
  rateLimitByUser,
  requireActiveTenant,
  auditLog,
  requirePlan,
};

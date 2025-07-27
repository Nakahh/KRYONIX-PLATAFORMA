import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { redis, redisAvailable } from "./cache";

// Tipos para segurança
export interface SecurityOptions {
  enableRateLimit?: boolean;
  enableIPWhitelist?: boolean;
  enableCSRF?: boolean;
  enableAuditLog?: boolean;
  maxRequestsPerMinute?: number;
  blockSuspiciousIPs?: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  tenantId?: string;
  action: string;
  resource: string;
  ip: string;
  userAgent: string;
  method: string;
  url: string;
  statusCode: number;
  timestamp: Date;
  metadata?: Record<string, any>;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

// Lista de IPs suspeitos/maliciosos (pode ser carregada de um serviço externo)
const SUSPICIOUS_IPS = new Set([
  // Adicionar IPs conhecidos por ataques
]);

// User agents suspeitos
const SUSPICIOUS_USER_AGENTS = [
  "sqlmap",
  "nikto",
  "nmap",
  "masscan",
  "curl", // Pode ser legítimo, mas suspeito em alguns contextos
  "wget",
  "python-requests",
];

// Rate limiting inteligente baseado em padrões brasileiros
export const createSmartRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutos
    max: options.max || 100,

    message: {
      error:
        options.message ||
        "Muitas tentativas. Tente novamente em alguns minutos.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000),
    },

    standardHeaders: true,
    legacyHeaders: false,

    // Ignorar requests bem-sucedidos para alguns endpoints
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,

    // Gerador de chave customizado
    keyGenerator:
      options.keyGenerator ||
      ((req: Request) => {
        const userId = req.user?.id;
        const ip = getClientIP(req);

        // Rate limit por usuário se autenticado, senão por IP
        return userId ? `user:${userId}` : `ip:${ip}`;
      }),

    // Rate limit específico por endpoint
    skip: (req: Request) => {
      const userAgent = req.get("User-Agent") || "";

      // Bloquear user agents suspeitos imediatamente
      if (
        SUSPICIOUS_USER_AGENTS.some((ua) =>
          userAgent.toLowerCase().includes(ua),
        )
      ) {
        return false; // Não pular, aplicar rate limit
      }

      return false;
    },

    // Handler customizado para quando limit é excedido
    handler: async (req: Request, res: Response) => {
      const ip = getClientIP(req);
      const userAgent = req.get("User-Agent") || "";

      // Log de tentativa de rate limiting
      await logSecurityEvent({
        action: "RATE_LIMIT_EXCEEDED",
        resource: req.originalUrl,
        ip,
        userAgent,
        method: req.method,
        url: req.originalUrl,
        riskLevel: "MEDIUM",
        metadata: {
          rateLimitWindow: options.windowMs,
          rateLimitMax: options.max,
        },
      });

      res.status(429).json({
        error: "Muitas tentativas. Tente novamente em alguns minutos.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000),
      });
    },
  });
};

// Rate limits específicos para diferentes endpoints
export const authRateLimit = createSmartRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login por 15 min
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  skipSuccessfulRequests: true,
});

export const apiRateLimit = createSmartRateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 requests por minuto
  message: "Muitas requisições à API. Reduza a frequência.",
});

export const whatsappRateLimit = createSmartRateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 mensagens por minuto (limite do WhatsApp)
  message: "Limite de mensagens WhatsApp excedido.",
});

export const billingRateLimit = createSmartRateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 operações de billing por minuto
  message: "Muitas operações de cobrança. Aguarde um momento.",
});

// Middleware para detectar IPs suspeitos
export const suspiciousIPMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIP(req);

    // Verificar lista de IPs suspeitos
    if (SUSPICIOUS_IPS.has(ip)) {
      await logSecurityEvent({
        action: "SUSPICIOUS_IP_DETECTED",
        resource: req.originalUrl,
        ip,
        userAgent: req.get("User-Agent") || "",
        method: req.method,
        url: req.originalUrl,
        riskLevel: "HIGH",
      });

      return res.status(403).json({
        error: "Acesso negado",
        code: "SUSPICIOUS_IP",
      });
    }

    // Verificar se IP está em lista negra temporária (Redis)
    if (redis && redisAvailable) {
      try {
        const isBlacklisted = await redis.get(`blacklist:${ip}`);
        if (isBlacklisted) {
          return res.status(403).json({
            error: "IP temporariamente bloqueado",
            code: "IP_BLACKLISTED",
          });
        }
      } catch (error) {
        console.warn(
          "⚠️ Redis error in suspiciousIPMiddleware:",
          error.message,
        );
        // Continue without Redis check if Redis fails
      }
    }

    next();
  };
};

// Middleware para detectar user agents suspeitos
export const suspiciousUserAgentMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.get("User-Agent") || "";

    const isSuspicious = SUSPICIOUS_USER_AGENTS.some((ua) =>
      userAgent.toLowerCase().includes(ua),
    );

    if (isSuspicious) {
      await logSecurityEvent({
        action: "SUSPICIOUS_USER_AGENT",
        resource: req.originalUrl,
        ip: getClientIP(req),
        userAgent,
        method: req.method,
        url: req.originalUrl,
        riskLevel: "MEDIUM",
      });

      // Não bloquear imediatamente, mas aplicar rate limit mais restrito
      req.headers["x-suspicious-user-agent"] = "true";
    }

    next();
  };
};

// Middleware CSRF protection
export const csrfProtection = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Pular GET, HEAD, OPTIONS
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      return next();
    }

    const token =
      (req.headers["x-csrf-token"] as string) ||
      req.body._csrf ||
      req.query._csrf;

    if (!token) {
      return res.status(403).json({
        error: "Token CSRF necessário",
        code: "CSRF_TOKEN_MISSING",
      });
    }

    // Verificar token CSRF (seria armazenado na sessão ou JWT)
    const userId = req.user?.id;
    let expectedToken = null;

    if (redis && redisAvailable) {
      try {
        expectedToken = await redis.get(`csrf:${userId}`);
      } catch (error) {
        console.warn("⚠️ Redis error in csrfProtection:", error.message);
        // Continue without CSRF check if Redis fails
        return next();
      }
    } else {
      // Skip CSRF check if Redis is not available
      return next();
    }

    if (
      !expectedToken ||
      !timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))
    ) {
      await logSecurityEvent({
        action: "CSRF_ATTACK_ATTEMPT",
        resource: req.originalUrl,
        ip: getClientIP(req),
        userAgent: req.get("User-Agent") || "",
        method: req.method,
        url: req.originalUrl,
        riskLevel: "HIGH",
        metadata: { providedToken: token },
      });

      return res.status(403).json({
        error: "Token CSRF inválido",
        code: "CSRF_TOKEN_INVALID",
      });
    }

    next();
  };
};

// Middleware de auditoria de segurança
export const securityAuditMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Interceptar resposta para capturar status code
    const originalSend = res.send;
    let statusCode = 200;

    res.send = function (data) {
      statusCode = res.statusCode;
      return originalSend.call(this, data);
    };

    // Detectar padrões suspeitos na URL
    const suspiciousPatterns = [
      /sql|union|select|insert|delete|drop|update/i, // SQL injection
      /script|javascript|eval|onload/i, // XSS
      /\.\.|\/etc\/|\/proc\/|\/var\//i, // Path traversal
      /phpinfo|wp-admin|\.php|\.asp/i, // Common attack paths
    ];

    const hasSuspiciousPattern = suspiciousPatterns.some(
      (pattern) =>
        pattern.test(req.originalUrl) || pattern.test(JSON.stringify(req.body)),
    );

    if (hasSuspiciousPattern) {
      await logSecurityEvent({
        action: "SUSPICIOUS_REQUEST_PATTERN",
        resource: req.originalUrl,
        ip: getClientIP(req),
        userAgent: req.get("User-Agent") || "",
        method: req.method,
        url: req.originalUrl,
        riskLevel: "HIGH",
        metadata: {
          body: req.body,
          query: req.query,
        },
      });
    }

    // Continuar processamento
    res.on("finish", async () => {
      const duration = Date.now() - startTime;

      // Log de acesso para endpoints sensíveis
      const sensitiveEndpoints = [
        "/api/auth",
        "/api/billing",
        "/api/admin",
        "/api/users",
      ];

      const isSensitive = sensitiveEndpoints.some((endpoint) =>
        req.originalUrl.startsWith(endpoint),
      );

      if (isSensitive || statusCode >= 400) {
        await logSecurityEvent({
          action: statusCode >= 400 ? "FAILED_REQUEST" : "SENSITIVE_ACCESS",
          resource: req.originalUrl,
          ip: getClientIP(req),
          userAgent: req.get("User-Agent") || "",
          method: req.method,
          url: req.originalUrl,
          statusCode,
          riskLevel: statusCode >= 400 ? "MEDIUM" : "LOW",
          metadata: {
            duration,
            responseSize: res.get("content-length"),
          },
        });
      }
    });

    next();
  };
};

// Middleware para bloquear IPs após múltiplas tentativas suspeitas
export const autoBlockMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIP(req);

    // Skip auto-blocking if Redis is not available
    if (!redis || !redisAvailable) {
      return next();
    }

    try {
      const key = `security_violations:${ip}`;

      // Incrementar contador de violações
      const violations = await redis.incr(key);
      await redis.expire(key, 3600); // Expira em 1 hora

      // Bloquear IP após 10 violações
      if (violations >= 10) {
        await redis.setex(`blacklist:${ip}`, 86400, "auto_blocked"); // 24 horas

        await logSecurityEvent({
          action: "IP_AUTO_BLOCKED",
          resource: req.originalUrl,
          ip,
          userAgent: req.get("User-Agent") || "",
          method: req.method,
          url: req.originalUrl,
          riskLevel: "CRITICAL",
          metadata: { violationCount: violations },
        });

        return res.status(403).json({
          error: "IP bloqueado por atividade suspeita",
          code: "IP_AUTO_BLOCKED",
        });
      }
    } catch (error) {
      console.warn("⚠️ Redis error in autoBlockMiddleware:", error.message);
      // Continue without blocking if Redis fails
    }

    next();
  };
};

// Função para obter IP real do cliente
export function getClientIP(req: Request): string {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    (req.headers["x-real-ip"] as string) ||
    "127.0.0.1"
  );
}

// Função para log de eventos de segurança
export async function logSecurityEvent(event: Partial<AuditLogEntry>) {
  try {
    const auditEntry: AuditLogEntry = {
      id: randomBytes(16).toString("hex"),
      timestamp: new Date(),
      statusCode: 200,
      ...event,
    } as AuditLogEntry;

    // Salvar no Redis para consulta rápida (se disponível)
    if (redis && redisAvailable) {
      try {
        const key = `audit:${auditEntry.timestamp.toISOString().split("T")[0]}`;
        await redis.lpush(key, JSON.stringify(auditEntry));
        await redis.expire(key, 2592000); // 30 dias
      } catch (redisError) {
        console.warn("⚠️ Redis error in logSecurityEvent:", redisError.message);
        // Continue without Redis logging
      }
    }

    // Log no console para desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log("🔒 Security Event:", auditEntry);
    }

    // Se for crítico, notificar admins (implementar webhook/email)
    if (auditEntry.riskLevel === "CRITICAL") {
      await notifyAdmins(auditEntry);
    }
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
}

// Notificar administradores sobre eventos críticos
async function notifyAdmins(event: AuditLogEntry) {
  try {
    // Implementar notificação via webhook, email, Slack, etc.
    console.error("🚨 CRITICAL SECURITY EVENT:", event);

    // Exemplo: enviar para webhook de notificação
    if (process.env.SECURITY_WEBHOOK_URL) {
      await fetch(process.env.SECURITY_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 Evento de segurança crítico detectado na KRYONIX`,
          attachments: [
            {
              color: "danger",
              fields: [
                { title: "Ação", value: event.action, short: true },
                { title: "IP", value: event.ip, short: true },
                { title: "URL", value: event.url, short: false },
                {
                  title: "Timestamp",
                  value: event.timestamp.toISOString(),
                  short: true,
                },
              ],
            },
          ],
        }),
      });
    }
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}

// Função para gerar token CSRF
export async function generateCSRFToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");

  if (redis && redisAvailable) {
    try {
      await redis.setex(`csrf:${userId}`, 3600, token); // 1 hora
    } catch (error) {
      console.warn("⚠️ Redis error in generateCSRFToken:", error.message);
      // Continue without storing CSRF token in Redis
    }
  }

  return token;
}

// Função para validar força da senha
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Critérios de validação
  if (password.length >= 8) score += 2;
  else feedback.push("Pelo menos 8 caracteres");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Pelo menos uma letra minúscula");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Pelo menos uma letra maiúscula");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Pelo menos um número");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2;
  else feedback.push("Pelo menos um caractere especial");

  // Verificar senhas comuns
  const commonPasswords = [
    "123456",
    "password",
    "123456789",
    "12345678",
    "admin",
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push("Senha muito comum, escolha outra");
  }

  return {
    isValid: score >= 6,
    score: Math.min(score, 7),
    feedback,
  };
}

// Função para hash seguro de senhas
export function hashPassword(password: string): string {
  const salt = randomBytes(32).toString("hex");
  const hash = createHash("pbkdf2").update(password).update(salt).digest("hex");

  return `${salt}:${hash}`;
}

// Função para verificar senha
export function verifyPassword(
  password: string,
  hashedPassword: string,
): boolean {
  const [salt, hash] = hashedPassword.split(":");
  const computedHash = createHash("pbkdf2")
    .update(password)
    .update(salt)
    .digest("hex");

  return timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
}

// Estatísticas de segurança
export async function getSecurityStats(days: number = 7) {
  try {
    const stats = {
      totalEvents: 0,
      eventsByRisk: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      topActions: {} as Record<string, number>,
      topIPs: {} as Record<string, number>,
      blockedIPs: 0,
    };

    // Return empty stats if Redis is not available
    if (!redis || !redisAvailable) {
      return stats;
    }

    try {
      // Buscar eventos dos últimos N dias
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = `audit:${date.toISOString().split("T")[0]}`;

        const events = await redis.lrange(key, 0, -1);

        for (const eventStr of events) {
          try {
            const event: AuditLogEntry = JSON.parse(eventStr);
            stats.totalEvents++;
            stats.eventsByRisk[event.riskLevel]++;

            stats.topActions[event.action] =
              (stats.topActions[event.action] || 0) + 1;
            stats.topIPs[event.ip] = (stats.topIPs[event.ip] || 0) + 1;
          } catch (e) {
            // Ignorar eventos mal formatados
          }
        }
      }

      // Contar IPs bloqueados
      const blacklistedKeys = await redis.keys("blacklist:*");
      stats.blockedIPs = blacklistedKeys.length;
    } catch (redisError) {
      console.warn("⚠️ Redis error in getSecurityStats:", redisError.message);
    }

    return stats;
  } catch (error) {
    console.error("Failed to get security stats:", error);
    return null;
  }
}

export default {
  createSmartRateLimit,
  authRateLimit,
  apiRateLimit,
  whatsappRateLimit,
  billingRateLimit,
  suspiciousIPMiddleware,
  suspiciousUserAgentMiddleware,
  csrfProtection,
  securityAuditMiddleware,
  autoBlockMiddleware,
  getClientIP,
  logSecurityEvent,
  generateCSRFToken,
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
  getSecurityStats,
};

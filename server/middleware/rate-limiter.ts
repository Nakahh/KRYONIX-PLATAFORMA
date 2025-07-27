import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Cria um rate limiter customizado
 * @param maxRequests - Número máximo de requests
 * @param windowMinutes - Janela de tempo em minutos
 * @param message - Mensagem personalizada
 */
export function rateLimiter(
  maxRequests: number = 100,
  windowMinutes: number = 15,
  message?: string,
) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000, // Converter minutos para milissegundos
    max: maxRequests,
    message: {
      error: message || "Muitas tentativas, tente novamente em alguns minutos.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter: windowMinutes,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error:
          message || "Muitas tentativas, tente novamente em alguns minutos.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: windowMinutes,
      });
    },
  });
}

// Rate limiters específicos para diferentes tipos de operação
export const authRateLimit = rateLimiter(5, 15, "Muitas tentativas de login");
export const pixRateLimit = rateLimiter(10, 1, "Muitas transações PIX");
export const apiRateLimit = rateLimiter(100, 15, "Limite de API excedido");
export const webhookRateLimit = rateLimiter(
  1000,
  1,
  "Limite de webhooks excedido",
);

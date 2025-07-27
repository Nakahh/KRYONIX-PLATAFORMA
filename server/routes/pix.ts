import { Router, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { pixService } from "../services/pix";
import { authenticateToken } from "../middleware/auth";
import { rateLimiter } from "../middleware/rate-limiter";
import { logger } from "../utils/logger";

const router = Router();

// Middleware de validação
const validateRequest = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Dados inválidos",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * POST /api/pix/cobranca
 * Criar nova cobrança PIX
 */
router.post(
  "/cobranca",
  authenticateToken,
  rateLimiter(10, 60), // 10 cobranças por minuto
  [
    body("valor")
      .isFloat({ min: 0.01, max: 999999.99 })
      .withMessage("Valor deve estar entre R$ 0,01 e R$ 999.999,99"),
    body("descricao")
      .isLength({ min: 1, max: 500 })
      .withMessage("Descrição é obrigatória (máx. 500 caracteres)"),
    body("pagadorCpfCnpj")
      .matches(/^\d{11}$|^\d{14}$/)
      .withMessage("CPF deve ter 11 dígitos ou CNPJ 14 dígitos"),
    body("pagadorNome")
      .isLength({ min: 2, max: 255 })
      .withMessage("Nome do pagador é obrigatório (2-255 caracteres)"),
    body("expiracao")
      .optional()
      .isInt({ min: 60, max: 86400 })
      .withMessage(
        "Expiração deve estar entre 1 minuto e 24 horas (em segundos)",
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { valor, descricao, pagadorCpfCnpj, pagadorNome, expiracao } =
        req.body;

      logger.info("Criando cobrança PIX", {
        valor,
        pagador: pagadorNome,
        userId: req.user?.id,
      });

      const cobranca = await pixService.criarCobrancaPix({
        valor: parseFloat(valor),
        descricao,
        pagadorCpfCnpj,
        pagadorNome,
        expiracao,
      });

      res.status(201).json({
        success: true,
        message: "Cobrança PIX criada com sucesso",
        data: {
          txid: cobranca.txid,
          qrCode: cobranca.qrCode,
          pixCopiaECola: cobranca.pixCopiaECola,
          valor: cobranca.valor.original,
          status: cobranca.status,
          vencimento: new Date(
            Date.now() + (expiracao || 86400) * 1000,
          ).toISOString(),
        },
      });
    } catch (error) {
      logger.error("Erro ao criar cobrança PIX:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
);

/**
 * GET /api/pix/cobranca/:txid
 * Consultar status de cobrança PIX
 */
router.get(
  "/cobranca/:txid",
  authenticateToken,
  [
    param("txid")
      .isLength({ min: 32, max: 32 })
      .withMessage("TXID deve ter exatamente 32 caracteres"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { txid } = req.params;

      const cobranca = await pixService.consultarCobranca(txid);

      if (!cobranca) {
        return res.status(404).json({
          success: false,
          message: "Cobrança PIX não encontrada",
        });
      }

      res.json({
        success: true,
        data: cobranca,
      });
    } catch (error) {
      logger.error(`Erro ao consultar cobrança PIX ${req.params.txid}:`, error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  },
);

/**
 * GET /api/pix/cobrancas
 * Listar cobranças PIX com filtros
 */
router.get(
  "/cobrancas",
  authenticateToken,
  [
    query("inicio")
      .optional()
      .isISO8601()
      .withMessage("Data de início deve estar no formato ISO 8601"),
    query("fim")
      .optional()
      .isISO8601()
      .withMessage("Data de fim deve estar no formato ISO 8601"),
    query("page")
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage("Página deve ser um número entre 1 e 1000"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limite deve ser um número entre 1 e 100"),
    query("status")
      .optional()
      .isIn([
        "ATIVA",
        "CONCLUIDA",
        "REMOVIDA_PELO_USUARIO_RECEBEDOR",
        "REMOVIDA_PELO_PSP",
      ])
      .withMessage("Status inválido"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const {
        inicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias atrás
        fim = new Date().toISOString(),
        page = 1,
        limit = 20,
      } = req.query;

      const resultado = await pixService.listarCobrancas(
        new Date(inicio as string),
        new Date(fim as string),
        parseInt(page as string),
        parseInt(limit as string),
      );

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      logger.error("Erro ao listar cobranças PIX:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  },
);

/**
 * DELETE /api/pix/cobranca/:txid
 * Cancelar cobrança PIX
 */
router.delete(
  "/cobranca/:txid",
  authenticateToken,
  [
    param("txid")
      .isLength({ min: 32, max: 32 })
      .withMessage("TXID deve ter exatamente 32 caracteres"),
    body("motivo")
      .isLength({ min: 1, max: 500 })
      .withMessage(
        "Motivo do cancelamento é obrigatório (máx. 500 caracteres)",
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { txid } = req.params;
      const { motivo } = req.body;

      const sucesso = await pixService.cancelarCobranca(txid, motivo);

      if (!sucesso) {
        return res.status(400).json({
          success: false,
          message: "Não foi possível cancelar a cobrança",
        });
      }

      res.json({
        success: true,
        message: "Cobrança PIX cancelada com sucesso",
      });
    } catch (error) {
      logger.error(`Erro ao cancelar cobrança PIX ${req.params.txid}:`, error);
      res.status(500).json({
        success: false,
        message: error.message.includes("não encontrada")
          ? "Cobrança não encontrada"
          : "Erro interno do servidor",
      });
    }
  },
);

/**
 * GET /api/pix/relatorio
 * Gerar relatório de transações PIX
 */
router.get(
  "/relatorio",
  authenticateToken,
  [
    query("inicio")
      .isISO8601()
      .withMessage(
        "Data de início é obrigatória e deve estar no formato ISO 8601",
      ),
    query("fim")
      .isISO8601()
      .withMessage(
        "Data de fim é obrigatória e deve estar no formato ISO 8601",
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { inicio, fim } = req.query;

      const inicioDate = new Date(inicio as string);
      const fimDate = new Date(fim as string);

      // Validar que o período não seja maior que 1 ano
      const diferencaDias =
        (fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diferencaDias > 365) {
        return res.status(400).json({
          success: false,
          message: "Período do relatório não pode ser maior que 1 ano",
        });
      }

      const relatorio = await pixService.gerarRelatorio(inicioDate, fimDate);

      res.json({
        success: true,
        data: relatorio,
      });
    } catch (error) {
      logger.error("Erro ao gerar relatório PIX:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  },
);

/**
 * POST /api/pix/webhook
 * Webhook para receber notificações do banco
 */
router.post(
  "/webhook",
  rateLimiter(100, 60), // 100 webhooks por minuto
  async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      logger.info("Webhook PIX recebido", {
        txid: payload.txid,
        status: payload.status,
        timestamp: new Date().toISOString(),
      });

      const processado = await pixService.processarWebhookPix(payload);

      if (processado) {
        res.status(200).json({
          success: true,
          message: "Webhook processado com sucesso",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Erro ao processar webhook",
        });
      }
    } catch (error) {
      logger.error("Erro no webhook PIX:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  },
);

/**
 * GET /api/pix/status
 * Status do serviço PIX
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const status = {
      servico: "PIX KRYONIX",
      status: "online",
      timestamp: new Date().toISOString(),
      versao: "1.0.0",
      configuracao: {
        banco: process.env.PIX_BANK_CODE || "341",
        ambiente:
          process.env.NODE_ENV === "production" ? "producao" : "sandbox",
        chavePix: process.env.PIX_CHAVE
          ? "***" + process.env.PIX_CHAVE.slice(-4)
          : "não configurada",
      },
    };

    res.json(status);
  } catch (error) {
    logger.error("Erro ao verificar status PIX:", error);
    res.status(500).json({
      status: "erro",
      message: "Erro interno do servidor",
    });
  }
});

export default router;

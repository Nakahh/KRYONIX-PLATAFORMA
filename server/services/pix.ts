import crypto from "crypto";
import axios from "axios";
import { Repository } from "typeorm";
import { AppDataSource } from "../db/connection";
import { PixTransaction } from "../entities/PixTransaction";
import { logger } from "../utils/logger";

interface PixConfig {
  bankCode: string;
  agencia: string;
  conta: string;
  chavePix: string;
  clientId: string;
  clientSecret: string;
  certificatePath: string;
  environment: "sandbox" | "production";
}

interface PixPaymentRequest {
  valor: number;
  descricao: string;
  pagadorCpfCnpj: string;
  pagadorNome: string;
  expiracao?: number; // em segundos, padrão 86400 (24h)
  txid?: string;
}

interface PixPaymentResponse {
  txid: string;
  pixCopiaECola: string;
  qrCode: string;
  status:
    | "ATIVA"
    | "CONCLUIDA"
    | "REMOVIDA_PELO_USUARIO_RECEBEDOR"
    | "REMOVIDA_PELO_PSP";
  revisao: number;
  devedor?: {
    cpf?: string;
    cnpj?: string;
    nome: string;
  };
  valor: {
    original: string;
  };
  chave: string;
  solicitacaoPagador?: string;
}

class PixService {
  private pixRepo: Repository<PixTransaction>;
  private config: PixConfig;

  constructor() {
    this.pixRepo = AppDataSource.getRepository(PixTransaction);

    this.config = {
      bankCode: process.env.PIX_BANK_CODE || "341", // Itaú
      agencia: process.env.PIX_AGENCIA || "",
      conta: process.env.PIX_CONTA || "",
      chavePix: process.env.PIX_CHAVE || "",
      clientId: process.env.PIX_CLIENT_ID || "",
      clientSecret: process.env.PIX_CLIENT_SECRET || "",
      certificatePath: process.env.PIX_CERTIFICATE_PATH || "",
      environment: (process.env.NODE_ENV === "production"
        ? "production"
        : "sandbox") as "sandbox" | "production",
    };
  }

  /**
   * Criar cobrança PIX com QR Code dinâmico
   */
  async criarCobrancaPix(
    request: PixPaymentRequest,
  ): Promise<PixPaymentResponse> {
    try {
      const txid = request.txid || this.gerarTxid();

      // Validar CPF/CNPJ
      if (!this.validarCpfCnpj(request.pagadorCpfCnpj)) {
        throw new Error("CPF/CNPJ inválido");
      }

      const pixPayload = {
        calendario: {
          expiracao: request.expiracao || 86400, // 24 horas
        },
        devedor: {
          [request.pagadorCpfCnpj.length === 11 ? "cpf" : "cnpj"]:
            request.pagadorCpfCnpj,
          nome: request.pagadorNome,
        },
        valor: {
          original: request.valor.toFixed(2),
        },
        chave: this.config.chavePix,
        solicitacaoPagador: request.descricao,
      };

      // Criar cobrança via API do banco
      const accessToken = await this.obterAccessToken();
      const pixResponse = await this.chamarApiPix(
        "PUT",
        `/v2/cob/${txid}`,
        pixPayload,
        accessToken,
      );

      // Gerar QR Code
      const qrCodeData = await this.gerarQrCode(pixResponse.pixCopiaECola);

      // Salvar no banco
      const pixTransaction = this.pixRepo.create({
        txid,
        valor: request.valor,
        status: "ATIVA",
        chavePix: this.config.chavePix,
        pixCopiaECola: pixResponse.pixCopiaECola,
        qrCode: qrCodeData,
        pagadorCpfCnpj: request.pagadorCpfCnpj,
        pagadorNome: request.pagadorNome,
        descricao: request.descricao,
        dataVencimento: new Date(
          Date.now() + (request.expiracao || 86400) * 1000,
        ),
        createdAt: new Date(),
      });

      await this.pixRepo.save(pixTransaction);

      logger.info(`Cobrança PIX criada: ${txid}`, {
        valor: request.valor,
        pagador: request.pagadorNome,
      });

      return {
        txid,
        pixCopiaECola: pixResponse.pixCopiaECola,
        qrCode: qrCodeData,
        status: "ATIVA",
        revisao: pixResponse.revisao || 0,
        devedor: {
          [request.pagadorCpfCnpj.length === 11 ? "cpf" : "cnpj"]:
            request.pagadorCpfCnpj,
          nome: request.pagadorNome,
        },
        valor: {
          original: request.valor.toFixed(2),
        },
        chave: this.config.chavePix,
        solicitacaoPagador: request.descricao,
      };
    } catch (error) {
      logger.error("Erro ao criar cobrança PIX:", error);
      throw new Error(`Falha ao criar cobrança PIX: ${error.message}`);
    }
  }

  /**
   * Consultar status de cobrança PIX
   */
  async consultarCobranca(txid: string): Promise<PixPaymentResponse | null> {
    try {
      const accessToken = await this.obterAccessToken();
      const response = await this.chamarApiPix(
        "GET",
        `/v2/cob/${txid}`,
        null,
        accessToken,
      );

      // Atualizar status no banco local
      const pixTransaction = await this.pixRepo.findOne({ where: { txid } });
      if (pixTransaction) {
        pixTransaction.status = response.status;
        pixTransaction.updatedAt = new Date();
        await this.pixRepo.save(pixTransaction);
      }

      return response;
    } catch (error) {
      logger.error(`Erro ao consultar cobrança PIX ${txid}:`, error);
      return null;
    }
  }

  /**
   * Webhook para receber notificações PIX
   */
  async processarWebhookPix(payload: any): Promise<boolean> {
    try {
      const { txid, status } = payload;

      if (!txid) {
        logger.warn("Webhook PIX recebido sem txid");
        return false;
      }

      // Buscar transação no banco
      const pixTransaction = await this.pixRepo.findOne({ where: { txid } });
      if (!pixTransaction) {
        logger.warn(`Transação PIX não encontrada: ${txid}`);
        return false;
      }

      // Atualizar status
      const statusAnterior = pixTransaction.status;
      pixTransaction.status = status;
      pixTransaction.updatedAt = new Date();

      if (status === "CONCLUIDA") {
        pixTransaction.dataPagamento = new Date();

        // Notificar webhook interno da aplicação
        await this.notificarPagamentoConfirmado(pixTransaction);
      }

      await this.pixRepo.save(pixTransaction);

      logger.info(
        `Status PIX atualizado: ${txid} - ${statusAnterior} → ${status}`,
      );
      return true;
    } catch (error) {
      logger.error("Erro ao processar webhook PIX:", error);
      return false;
    }
  }

  /**
   * Listar cobranças PIX
   */
  async listarCobrancas(
    inicio: Date,
    fim: Date,
    page: number = 1,
    limit: number = 50,
  ) {
    try {
      const skip = (page - 1) * limit;

      const [cobrancas, total] = await this.pixRepo.findAndCount({
        where: {
          createdAt: {
            gte: inicio,
            lte: fim,
          },
        },
        order: { createdAt: "DESC" },
        skip,
        take: limit,
      });

      return {
        cobrancas,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Erro ao listar cobranças PIX:", error);
      throw error;
    }
  }

  /**
   * Estornar/Cancelar cobrança PIX
   */
  async cancelarCobranca(txid: string, motivo: string): Promise<boolean> {
    try {
      const pixTransaction = await this.pixRepo.findOne({ where: { txid } });
      if (!pixTransaction) {
        throw new Error("Cobrança PIX não encontrada");
      }

      if (pixTransaction.status !== "ATIVA") {
        throw new Error("Apenas cobranças ativas podem ser canceladas");
      }

      const accessToken = await this.obterAccessToken();
      await this.chamarApiPix("DELETE", `/v2/cob/${txid}`, null, accessToken);

      // Atualizar status no banco
      pixTransaction.status = "REMOVIDA_PELO_USUARIO_RECEBEDOR";
      pixTransaction.motivoCancelamento = motivo;
      pixTransaction.dataCancelamento = new Date();
      pixTransaction.updatedAt = new Date();

      await this.pixRepo.save(pixTransaction);

      logger.info(`Cobrança PIX cancelada: ${txid} - Motivo: ${motivo}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao cancelar cobrança PIX ${txid}:`, error);
      throw error;
    }
  }

  /**
   * Gerar relatório de transações PIX
   */
  async gerarRelatorio(inicio: Date, fim: Date) {
    try {
      const [transacoes, metricas] = await Promise.all([
        this.pixRepo.find({
          where: {
            createdAt: {
              gte: inicio,
              lte: fim,
            },
          },
          order: { createdAt: "DESC" },
        }),
        this.pixRepo
          .createQueryBuilder("pix")
          .select([
            "COUNT(*) as total",
            "COUNT(CASE WHEN status = 'CONCLUIDA' THEN 1 END) as concluidas",
            "COUNT(CASE WHEN status = 'ATIVA' THEN 1 END) as ativas",
            "COUNT(CASE WHEN status LIKE 'REMOVIDA%' THEN 1 END) as canceladas",
            "SUM(CASE WHEN status = 'CONCLUIDA' THEN valor ELSE 0 END) as valorTotal",
            "AVG(CASE WHEN status = 'CONCLUIDA' THEN valor ELSE NULL END) as ticketMedio",
          ])
          .where("createdAt >= :inicio AND createdAt <= :fim", { inicio, fim })
          .getRawOne(),
      ]);

      return {
        periodo: { inicio, fim },
        transacoes,
        metricas: {
          total: Number(metricas.total),
          concluidas: Number(metricas.concluidas),
          ativas: Number(metricas.ativas),
          canceladas: Number(metricas.canceladas),
          valorTotal: Number(metricas.valorTotal) || 0,
          ticketMedio: Number(metricas.ticketMedio) || 0,
          taxaSucesso:
            Number(metricas.total) > 0
              ? (Number(metricas.concluidas) / Number(metricas.total)) * 100
              : 0,
        },
      };
    } catch (error) {
      logger.error("Erro ao gerar relatório PIX:", error);
      throw error;
    }
  }

  // === MÉTODOS PRIVADOS ===

  private async obterAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString("base64");

      const response = await axios.post(
        `${this.getBaseUrl()}/oauth/token`,
        "grant_type=client_credentials",
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          httpsAgent: this.getHttpsAgent(),
        },
      );

      return response.data.access_token;
    } catch (error) {
      logger.error("Erro ao obter access token PIX:", error);
      throw new Error("Falha na autenticação PIX");
    }
  }

  private async chamarApiPix(
    method: string,
    endpoint: string,
    data: any,
    accessToken: string,
  ) {
    try {
      const response = await axios({
        method,
        url: `${this.getBaseUrl()}${endpoint}`,
        data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        httpsAgent: this.getHttpsAgent(),
      });

      return response.data;
    } catch (error) {
      logger.error(
        `Erro na API PIX ${method} ${endpoint}:`,
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  private getBaseUrl(): string {
    const baseUrls = {
      "341": {
        // Itaú
        sandbox: "https://devportal.itau.com.br/sandboxapi",
        production: "https://secure.api.itau.com.br",
      },
      "001": {
        // Banco do Brasil
        sandbox: "https://api.sandbox.bb.com.br",
        production: "https://api.bb.com.br",
      },
      "260": {
        // Nubank
        sandbox: "https://api.sandbox.nubank.com.br",
        production: "https://api.nubank.com.br",
      },
    };

    return (
      baseUrls[this.config.bankCode]?.[this.config.environment] ||
      baseUrls["341"][this.config.environment]
    );
  }

  private getHttpsAgent() {
    if (this.config.certificatePath) {
      const fs = require("fs");
      const https = require("https");

      return new https.Agent({
        cert: fs.readFileSync(this.config.certificatePath),
        key: fs.readFileSync(
          this.config.certificatePath.replace(".crt", ".key"),
        ),
      });
    }
    return undefined;
  }

  private gerarTxid(): string {
    // Gerar txid único de 32 caracteres
    return crypto.randomBytes(16).toString("hex").toUpperCase();
  }

  private validarCpfCnpj(documento: string): boolean {
    const apenasNumeros = documento.replace(/\D/g, "");

    if (apenasNumeros.length === 11) {
      return this.validarCpf(apenasNumeros);
    } else if (apenasNumeros.length === 14) {
      return this.validarCnpj(apenasNumeros);
    }

    return false;
  }

  private validarCpf(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf[i]) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf[i]) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf[10]);
  }

  private validarCnpj(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpj[i]) * pesos1[i];
    }
    let resto = soma % 11;
    const dv1 = resto < 2 ? 0 : 11 - resto;
    if (dv1 !== parseInt(cnpj[12])) return false;

    soma = 0;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpj[i]) * pesos2[i];
    }
    resto = soma % 11;
    const dv2 = resto < 2 ? 0 : 11 - resto;
    return dv2 === parseInt(cnpj[13]);
  }

  private async gerarQrCode(pixCopiaECola: string): Promise<string> {
    try {
      const QRCode = require("qrcode");
      const qrCodeDataUrl = await QRCode.toDataURL(pixCopiaECola, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      logger.error("Erro ao gerar QR Code:", error);
      throw new Error("Falha ao gerar QR Code PIX");
    }
  }

  private async notificarPagamentoConfirmado(
    pixTransaction: any,
  ): Promise<void> {
    try {
      // Notificar webhooks internos (N8N, automações, etc.)
      const webhooks = [
        process.env.N8N_WEBHOOK_PIX_PAYMENT,
        process.env.TYPEBOT_WEBHOOK_PIX_PAYMENT,
        process.env.INTERNAL_WEBHOOK_PIX_PAYMENT,
      ].filter(Boolean);

      const payload = {
        evento: "pix_pagamento_confirmado",
        txid: pixTransaction.txid,
        valor: pixTransaction.valor,
        pagador: {
          cpfCnpj: pixTransaction.pagadorCpfCnpj,
          nome: pixTransaction.pagadorNome,
        },
        dataPagamento: pixTransaction.dataPagamento,
        timestamp: new Date().toISOString(),
      };

      await Promise.allSettled(
        webhooks.map((webhook) =>
          axios.post(webhook, payload, { timeout: 5000 }),
        ),
      );

      logger.info(`Webhooks PIX notificados para txid: ${pixTransaction.txid}`);
    } catch (error) {
      logger.error("Erro ao notificar webhooks PIX:", error);
    }
  }
}

export const pixService = new PixService();
export { PixService, PixPaymentRequest, PixPaymentResponse };

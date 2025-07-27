import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("pix_transactions")
export class PixTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 32, unique: true })
  @Index()
  txid: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  valor: number;

  @Column({
    type: "enum",
    enum: [
      "ATIVA",
      "CONCLUIDA",
      "REMOVIDA_PELO_USUARIO_RECEBEDOR",
      "REMOVIDA_PELO_PSP",
    ],
    default: "ATIVA",
  })
  @Index()
  status:
    | "ATIVA"
    | "CONCLUIDA"
    | "REMOVIDA_PELO_USUARIO_RECEBEDOR"
    | "REMOVIDA_PELO_PSP";

  @Column({ type: "varchar", length: 255 })
  chavePix: string;

  @Column({ type: "text" })
  pixCopiaECola: string;

  @Column({ type: "text" })
  qrCode: string;

  @Column({ type: "varchar", length: 18 })
  @Index()
  pagadorCpfCnpj: string;

  @Column({ type: "varchar", length: 255 })
  pagadorNome: string;

  @Column({ type: "varchar", length: 500 })
  descricao: string;

  @Column({ type: "timestamp", nullable: true })
  dataVencimento: Date;

  @Column({ type: "timestamp", nullable: true })
  dataPagamento: Date;

  @Column({ type: "timestamp", nullable: true })
  dataCancelamento: Date;

  @Column({ type: "varchar", length: 500, nullable: true })
  motivoCancelamento: string;

  @Column({ type: "int", default: 0 })
  revisao: number;

  @Column({ type: "json", nullable: true })
  metadata: {
    bankCode?: string;
    endToEnd?: string;
    infoPagador?: string;
    webhookNotified?: boolean;
    clientIp?: string;
    userAgent?: string;
  };

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campos calculados
  @Column({ type: "boolean", default: false, select: false })
  get isExpired(): boolean {
    if (!this.dataVencimento) return false;
    return new Date() > this.dataVencimento && this.status === "ATIVA";
  }

  @Column({ type: "int", select: false })
  get minutosParaVencimento(): number {
    if (!this.dataVencimento || this.status !== "ATIVA") return 0;
    const agora = new Date();
    const vencimento = new Date(this.dataVencimento);
    const diferenca = vencimento.getTime() - agora.getTime();
    return Math.max(0, Math.round(diferenca / (1000 * 60)));
  }

  @Column({ type: "varchar", length: 20, select: false })
  get statusFormatado(): string {
    const statusMap = {
      ATIVA: "Aguardando Pagamento",
      CONCLUIDA: "Pago",
      REMOVIDA_PELO_USUARIO_RECEBEDOR: "Cancelado",
      REMOVIDA_PELO_PSP: "Expirado",
    };
    return statusMap[this.status] || this.status;
  }

  @Column({ type: "varchar", length: 50, select: false })
  get valorFormatado(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.valor);
  }

  @Column({ type: "varchar", length: 20, select: false })
  get cpfCnpjFormatado(): string {
    const documento = this.pagadorCpfCnpj.replace(/\D/g, "");

    if (documento.length === 11) {
      // CPF: 000.000.000-00
      return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (documento.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return documento.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5",
      );
    }

    return this.pagadorCpfCnpj;
  }
}

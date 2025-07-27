import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Copy,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  User,
  FileText,
  Timer,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  formatCurrency,
  formatCpfCnpj,
  validateCpfCnpj,
} from "../../lib/brazilian-formatters";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useApi } from "../../hooks/use-api";
import { useMobileAdvanced } from "../../hooks/use-mobile-advanced";

interface PixPaymentData {
  txid: string;
  qrCode: string;
  pixCopiaECola: string;
  valor: string;
  status:
    | "ATIVA"
    | "CONCLUIDA"
    | "REMOVIDA_PELO_USUARIO_RECEBEDOR"
    | "REMOVIDA_PELO_PSP";
  vencimento: string;
}

interface PixPaymentProps {
  onPaymentComplete?: (data: PixPaymentData) => void;
  onCancel?: () => void;
  defaultAmount?: number;
  description?: string;
}

export function PixPayment({
  onPaymentComplete,
  onCancel,
  defaultAmount = 0,
  description = "",
}: PixPaymentProps) {
  const { isMobile, isTablet } = useMobileAdvanced();
  const { post, loading, error } = useApi();

  // Estados do formulário
  const [valor, setValor] = useState(defaultAmount.toString());
  const [descricao, setDescricao] = useState(description);
  const [pagadorNome, setPagadorNome] = useState("");
  const [pagadorCpfCnpj, setPagadorCpfCnpj] = useState("");
  const [expiracao, setExpiracao] = useState("3600"); // 1 hora padrão

  // Estados da cobrança
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [step, setStep] = useState<"form" | "qrcode" | "waiting" | "completed">(
    "form",
  );
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [statusChecking, setStatusChecking] = useState(false);

  // Refs
  const statusCheckInterval = useRef<NodeJS.Timeout>();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Timer para expiração
  useEffect(() => {
    if (pixData && step === "qrcode") {
      const vencimento = new Date(pixData.vencimento);
      const updateTimer = () => {
        const agora = new Date();
        const diferenca = Math.max(0, vencimento.getTime() - agora.getTime());
        setTimeLeft(Math.floor(diferenca / 1000));

        if (diferenca <= 0) {
          setStep("form");
          setPixData(null);
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    }
  }, [pixData, step]);

  // Verificação automática de status
  useEffect(() => {
    if (pixData && step === "qrcode") {
      statusCheckInterval.current = setInterval(async () => {
        await verificarStatus();
      }, 5000); // Verifica a cada 5 segundos

      return () => {
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
        }
      };
    }
  }, [pixData, step]);

  const formatTimeLeft = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCpfCnpj(pagadorCpfCnpj)) {
      alert("CPF/CNPJ inválido");
      return;
    }

    try {
      const response = await post("/api/pix/cobranca", {
        valor: parseFloat(valor),
        descricao,
        pagadorCpfCnpj: pagadorCpfCnpj.replace(/\D/g, ""),
        pagadorNome,
        expiracao: parseInt(expiracao),
      });

      setPixData(response.data);
      setStep("qrcode");
    } catch (err) {
      console.error("Erro ao criar cobrança PIX:", err);
    }
  };

  const verificarStatus = async () => {
    if (!pixData || statusChecking) return;

    setStatusChecking(true);
    try {
      const response = await post(`/api/pix/cobranca/${pixData.txid}`);

      if (response.data.status === "CONCLUIDA") {
        setStep("completed");
        onPaymentComplete?.(response.data);

        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
        }
      }
    } catch (err) {
      console.error("Erro ao verificar status PIX:", err);
    } finally {
      setStatusChecking(false);
    }
  };

  const copyPixCode = async () => {
    if (pixData?.pixCopiaECola) {
      await navigator.clipboard.writeText(pixData.pixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cancelarCobranca = async () => {
    if (!pixData) return;

    try {
      await post(
        `/api/pix/cobranca/${pixData.txid}`,
        {
          motivo: "Cancelado pelo usuário",
        },
        "DELETE",
      );

      setStep("form");
      setPixData(null);
      onCancel?.();
    } catch (err) {
      console.error("Erro ao cancelar cobrança PIX:", err);
    }
  };

  const renderForm = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-blue-600">
            <QrCode className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Pagamento PIX
        </CardTitle>
        <CardDescription>
          Gere sua cobrança PIX de forma rápida e segura
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="valor" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Valor (R$)
            </Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0.01"
              max="999999.99"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="text-lg font-semibold"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descrição
            </Label>
            <Input
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição do pagamento"
              maxLength={500}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pagadorNome" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome do Pagador
            </Label>
            <Input
              id="pagadorNome"
              value={pagadorNome}
              onChange={(e) => setPagadorNome(e.target.value)}
              placeholder="Nome completo"
              maxLength={255}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pagadorCpfCnpj" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              CPF/CNPJ
            </Label>
            <Input
              id="pagadorCpfCnpj"
              value={formatCpfCnpj(pagadorCpfCnpj)}
              onChange={(e) => setPagadorCpfCnpj(e.target.value)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              maxLength={18}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiracao" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Validade
            </Label>
            <select
              id="expiracao"
              value={expiracao}
              onChange={(e) => setExpiracao(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="900">15 minutos</option>
              <option value="1800">30 minutos</option>
              <option value="3600">1 hora</option>
              <option value="7200">2 horas</option>
              <option value="21600">6 horas</option>
              <option value="86400">24 horas</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Gerando PIX...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Gerar PIX
              </div>
            )}
          </Button>
        </form>

        {error && (
          <Alert className="mt-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderQrCode = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("form")}
            className="p-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Clock className="w-3 h-3 mr-1" />
            {formatTimeLeft(timeLeft)}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={verificarStatus}
            disabled={statusChecking}
            className="p-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${statusChecking ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <CardTitle className="text-xl font-bold">
          {formatCurrency(parseFloat(pixData?.valor || "0"))}
        </CardTitle>
        <CardDescription className="text-sm">{descricao}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Timer */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tempo restante</span>
            <span>{formatTimeLeft(timeLeft)}</span>
          </div>
          <Progress
            value={(timeLeft / parseInt(expiracao)) * 100}
            className="h-2"
          />
        </div>

        {/* QR Code */}
        <div className="text-center">
          <div
            ref={qrCodeRef}
            className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 inline-block"
          >
            <img
              src={pixData?.qrCode}
              alt="QR Code PIX"
              className="w-48 h-48 mx-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Aponte a câmera do seu banco para o QR Code
          </p>
        </div>

        {/* PIX Copia e Cola */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">PIX Copia e Cola</Label>
          <div className="flex gap-2">
            <Input
              value={pixData?.pixCopiaECola || ""}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyPixCode}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          {copied && <p className="text-xs text-green-600">Código copiado!</p>}
        </div>

        {/* Informações do Pagamento */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor:</span>
            <span className="font-semibold">
              {formatCurrency(parseFloat(pixData?.valor || "0"))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pagador:</span>
            <span>{pagadorNome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CPF/CNPJ:</span>
            <span>{formatCpfCnpj(pagadorCpfCnpj)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID Transação:</span>
            <span className="font-mono text-xs">{pixData?.txid}</span>
          </div>
        </div>

        {/* Botão Cancelar */}
        <Button
          variant="outline"
          onClick={cancelarCobranca}
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          Cancelar Cobrança
        </Button>
      </CardContent>
    </Card>
  );

  const renderCompleted = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </motion.div>

        <h3 className="text-2xl font-bold text-green-600 mb-2">
          Pagamento Confirmado!
        </h3>

        <p className="text-muted-foreground mb-4">
          Seu pagamento PIX foi processado com sucesso
        </p>

        <div className="bg-green-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor Pago:</span>
            <span className="font-semibold">
              {formatCurrency(parseFloat(pixData?.valor || "0"))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data/Hora:</span>
            <span>{new Date().toLocaleString("pt-BR")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID Transação:</span>
            <span className="font-mono text-xs">{pixData?.txid}</span>
          </div>
        </div>

        <Button
          onClick={() => {
            setStep("form");
            setPixData(null);
          }}
          className="w-full"
        >
          Novo Pagamento
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div
      className={`${isMobile ? "px-4 py-6" : "p-8"} min-h-screen bg-gray-50 flex items-center justify-center`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {step === "form" && renderForm()}
          {step === "qrcode" && renderQrCode()}
          {step === "completed" && renderCompleted()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default PixPayment;

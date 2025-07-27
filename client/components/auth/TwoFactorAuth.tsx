import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { QRCodeSVG } from "qrcode.react";
import {
  Shield,
  Smartphone,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorSetupData {
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
  isEnabled: boolean;
}

interface TwoFactorAuthProps {
  onSetupComplete?: (enabled: boolean) => void;
  onVerificationComplete?: (success: boolean) => void;
  mode?: "setup" | "verify" | "manage";
  requireVerification?: boolean;
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onSetupComplete,
  onVerificationComplete,
  mode = "setup",
  requireVerification = false,
}) => {
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [step, setStep] = useState<
    "generate" | "verify" | "backup" | "complete"
  >("generate");
  const [useBackupCode, setUseBackupCode] = useState(false);

  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Gerar configuração inicial do 2FA
  useEffect(() => {
    if (mode === "setup" && !setupData) {
      generateTwoFactorSetup();
    }
  }, [mode]);

  const generateTwoFactorSetup = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar configuração 2FA");
      }

      const data = await response.json();
      setSetupData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactorCode = async (code: string, isBackupCode = false) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          isBackupCode,
          action: mode === "setup" ? "enable" : "verify",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Código inválido");
      }

      const result = await response.json();

      if (mode === "setup") {
        setStep("backup");
        toast({
          title: "2FA Habilitado!",
          description: "Autenticação de dois fatores configurada com sucesso.",
        });
      } else {
        onVerificationComplete?.(true);
        toast({
          title: "Verificação Bem-sucedida",
          description: "Código 2FA verificado com sucesso.",
        });
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Código inválido";
      setError(errorMsg);
      onVerificationComplete?.(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        throw new Error("Falha ao desabilitar 2FA");
      }

      onSetupComplete?.(false);
      toast({
        title: "2FA Desabilitado",
        description: "Autenticação de dois fatores foi desabilitada.",
        variant: "destructive",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/2fa/backup-codes/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        throw new Error("Falha ao regenerar códigos de backup");
      }

      const data = await response.json();
      setSetupData((prev) =>
        prev ? { ...prev, backupCodes: data.backupCodes } : null,
      );

      toast({
        title: "Códigos Regenerados",
        description: "Novos códigos de backup foram gerados.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "secret" | "backup") => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === "secret") {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackup(true);
        setTimeout(() => setCopiedBackup(false), 2000);
      }

      toast({
        title: "Copiado!",
        description: `${type === "secret" ? "Chave secreta" : "Códigos de backup"} copiado(s) para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;

    const content = [
      "KRYONIX - Códigos de Backup 2FA",
      "=====================================",
      "",
      "IMPORTANTE: Guarde estes códigos em local seguro!",
      "Cada código pode ser usado apenas uma vez.",
      "",
      "Códigos:",
      ...setupData.backupCodes.map((code, index) => `${index + 1}. ${code}`),
      "",
      `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kryonix-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCodeInput = (value: string, index: number) => {
    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const newCode = verificationCode.split("");
    newCode[index] = value;
    setVerificationCode(newCode.join(""));
  };

  const handleVerifyCode = async () => {
    const code = useBackupCode ? backupCode : verificationCode;

    if (!code || (useBackupCode ? code.length !== 8 : code.length !== 6)) {
      setError("Código incompleto");
      return;
    }

    try {
      await verifyTwoFactorCode(code, useBackupCode);
    } catch (err) {
      // Erro já tratado na função
    }
  };

  // Render do modo de verificação
  if (mode === "verify") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Verificação 2FA</CardTitle>
          <CardDescription>
            {useBackupCode
              ? "Digite um código de backup"
              : "Digite o código do seu aplicativo autenticador"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!useBackupCode ? (
            <div>
              <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={verificationCode[index] || ""}
                    onChange={(e) =>
                      handleCodeInput(e.target.value.replace(/\D/g, ""), index)
                    }
                    className="w-12 h-12 text-center text-lg font-mono"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Input
                type="text"
                placeholder="Digite o código de backup"
                value={backupCode}
                onChange={(e) =>
                  setBackupCode(e.target.value.replace(/\D/g, ""))
                }
                maxLength={8}
                className="text-center font-mono"
                autoComplete="off"
              />
            </div>
          )}

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseBackupCode(!useBackupCode)}
            >
              {useBackupCode
                ? "Usar aplicativo autenticador"
                : "Usar código de backup"}
            </Button>
          </div>

          <Button
            onClick={handleVerifyCode}
            disabled={
              isLoading ||
              (!useBackupCode
                ? verificationCode.length !== 6
                : backupCode.length !== 8)
            }
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Verificar
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render do modo de configuração
  if (mode === "setup") {
    if (step === "generate" && setupData) {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Configurar Autenticação de Dois Fatores
            </CardTitle>
            <CardDescription>
              Aumente a segurança da sua conta com 2FA
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    1
                  </span>
                  Escaneie o QR Code
                </h3>

                <div className="bg-white p-4 rounded-lg border text-center">
                  <QRCodeSVG
                    value={setupData.qrCodeUri}
                    size={200}
                    level="M"
                    includeMargin
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  Use um app como Google Authenticator, Authy ou 1Password
                </p>
              </div>

              {/* Manual Setup */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    2
                  </span>
                  Ou configure manualmente
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Chave secreta:
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                        {setupData.secret}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(setupData.secret, "secret")
                        }
                      >
                        {copiedSecret ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Conta:</span>
                      <p className="font-mono">KRYONIX</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <p className="font-mono">TOTP</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  3
                </span>
                Digite o código gerado
              </h3>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center gap-2 mb-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={verificationCode[index] || ""}
                    onChange={(e) =>
                      handleCodeInput(e.target.value.replace(/\D/g, ""), index)
                    }
                    className="w-12 h-12 text-center text-lg font-mono"
                    autoComplete="off"
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("generate")}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Verificar e Ativar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (step === "backup" && setupData) {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>2FA Ativado com Sucesso!</CardTitle>
            <CardDescription>Salve seus códigos de backup</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Guarde estes códigos em local
                seguro. Cada código pode ser usado apenas uma vez para acessar
                sua conta caso perca acesso ao aplicativo autenticador.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Códigos de Backup</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        setupData.backupCodes.join("\n"),
                        "backup",
                      )
                    }
                  >
                    {copiedBackup ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadBackupCodes}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                {setupData.backupCodes.map((code, index) => (
                  <code key={index} className="text-sm font-mono">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                setStep("complete");
                onSetupComplete?.(true);
              }}
              className="w-full"
            >
              Concluir Configuração
            </Button>
          </CardContent>
        </Card>
      );
    }
  }

  // Loading state
  if (isLoading && !setupData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            Carregando configuração 2FA...
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default TwoFactorAuth;

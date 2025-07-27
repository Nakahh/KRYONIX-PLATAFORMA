import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import orchestrationService, {
  StackConfig,
  HealthStatus,
  StackMetrics,
} from "../../services/brazilian-stack-orchestration";
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Wifi,
  Database,
  Server,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Eye,
  Settings,
  Target,
  Gauge,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

interface HealthCheckResult {
  id: string;
  stack: string;
  nome: string;
  tipo: "endpoint" | "database" | "service" | "network" | "custom";
  status: "pass" | "fail" | "warning" | "checking";
  url?: string;
  tempoResposta: number;
  ultimaVerificacao: Date;
  proximaVerificacao: Date;
  historico: HealthCheckHistory[];
  detalhes?: string;
  erro?: string;
}

interface HealthCheckHistory {
  timestamp: Date;
  status: "pass" | "fail" | "warning";
  tempoResposta: number;
}

interface HealthAlert {
  id: string;
  stack: string;
  tipo: "degradation" | "failure" | "recovery" | "slow_response";
  severity: "low" | "medium" | "high" | "critical";
  mensagem: string;
  timestamp: Date;
  resolvido: boolean;
}

interface HealthSummary {
  totalChecks: number;
  passing: number;
  failing: number;
  warnings: number;
  averageResponseTime: number;
  uptime: number;
  trendsPositive: number;
  trendsNegative: number;
}

const HealthCheckMonitor: React.FC = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [summary, setSummary] = useState<HealthSummary>({
    totalChecks: 0,
    passing: 0,
    failing: 0,
    warnings: 0,
    averageResponseTime: 0,
    uptime: 0,
    trendsPositive: 0,
    trendsNegative: 0,
  });
  const [checkingAll, setCheckingAll] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);
  const [selectedStack, setSelectedStack] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inicializarHealthChecks();

    const interval = setInterval(() => {
      if (autoCheck) {
        executarVerificacaoAutomatica();
      }
    }, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(interval);
  }, [autoCheck]);

  const inicializarHealthChecks = async () => {
    try {
      const checks = await gerarHealthChecksExemplo();
      setHealthChecks(checks);
      calcularSummary(checks);
      gerarAlerts(checks);
      setLoading(false);
    } catch (error) {
      console.error("❌ Erro ao inicializar health checks:", error);
      setLoading(false);
    }
  };

  const gerarHealthChecksExemplo = (): HealthCheckResult[] => {
    const agora = new Date();
    const stacks = [
      { id: "evolution-api", nome: "Evolution API", tipo: "service" as const },
      { id: "n8n", nome: "N8N Workflow", tipo: "service" as const },
      { id: "typebot", nome: "Typebot", tipo: "service" as const },
      { id: "postgresql", nome: "PostgreSQL", tipo: "database" as const },
      { id: "redis", nome: "Redis Cache", tipo: "database" as const },
      { id: "nginx", nome: "Nginx Proxy", tipo: "network" as const },
      { id: "mautic", nome: "Mautic Marketing", tipo: "service" as const },
      { id: "chatwoot", nome: "Chatwoot Support", tipo: "service" as const },
      { id: "portainer", nome: "Portainer Docker", tipo: "service" as const },
      { id: "grafana", nome: "Grafana Analytics", tipo: "service" as const },
    ];

    return stacks.map((stack, index) => {
      const tempoResposta = Math.random() * 2000 + 100; // 100ms a 2100ms
      const status =
        tempoResposta > 1500
          ? "warning"
          : tempoResposta > 2000
            ? "fail"
            : "pass";

      // Gerar histórico das últimas 24 horas
      const historico: HealthCheckHistory[] = [];
      for (let i = 23; i >= 0; i--) {
        const timestamp = new Date(agora.getTime() - i * 60 * 60 * 1000);
        const historicoTempo = Math.random() * 1800 + 150;
        const historicoStatus =
          historicoTempo > 1400
            ? "warning"
            : historicoTempo > 1800
              ? "fail"
              : "pass";

        historico.push({
          timestamp,
          status: historicoStatus,
          tempoResposta: historicoTempo,
        });
      }

      return {
        id: `check-${stack.id}`,
        stack: stack.id,
        nome: stack.nome,
        tipo: stack.tipo,
        status: Math.random() > 0.95 ? "fail" : status, // 5% chance de falha
        url: `https://${stack.id}.kryonix.com.br/health`,
        tempoResposta,
        ultimaVerificacao: new Date(agora.getTime() - Math.random() * 60000),
        proximaVerificacao: new Date(agora.getTime() + 30000),
        historico,
        detalhes:
          status === "pass"
            ? "Todos os serviços operacionais"
            : status === "warning"
              ? "Latência elevada detectada"
              : "Serviço indisponível ou com erro",
        erro: status === "fail" ? "Connection timeout" : undefined,
      };
    });
  };

  const calcularSummary = (checks: HealthCheckResult[]) => {
    const totalChecks = checks.length;
    const passing = checks.filter((c) => c.status === "pass").length;
    const failing = checks.filter((c) => c.status === "fail").length;
    const warnings = checks.filter((c) => c.status === "warning").length;

    const temposResposta = checks.map((c) => c.tempoResposta);
    const averageResponseTime =
      temposResposta.length > 0
        ? temposResposta.reduce((a, b) => a + b, 0) / temposResposta.length
        : 0;

    const uptime = totalChecks > 0 ? (passing / totalChecks) * 100 : 100;

    // Calcular tendências baseadas no histórico
    let trendsPositive = 0;
    let trendsNegative = 0;

    checks.forEach((check) => {
      if (check.historico.length >= 5) {
        const recent = check.historico.slice(-5);
        const older = check.historico.slice(-10, -5);

        const recentAvg =
          recent.reduce((a, b) => a + b.tempoResposta, 0) / recent.length;
        const olderAvg =
          older.reduce((a, b) => a + b.tempoResposta, 0) / older.length;

        if (recentAvg < olderAvg * 0.9) trendsPositive++;
        else if (recentAvg > olderAvg * 1.1) trendsNegative++;
      }
    });

    setSummary({
      totalChecks,
      passing,
      failing,
      warnings,
      averageResponseTime,
      uptime,
      trendsPositive,
      trendsNegative,
    });
  };

  const gerarAlerts = (checks: HealthCheckResult[]) => {
    const novosAlerts: HealthAlert[] = [];

    checks.forEach((check) => {
      // Alert para falhas
      if (check.status === "fail") {
        novosAlerts.push({
          id: `fail-${check.id}`,
          stack: check.stack,
          tipo: "failure",
          severity: "critical",
          mensagem: `${check.nome} está indisponível`,
          timestamp: new Date(),
          resolvido: false,
        });
      }

      // Alert para degradação
      if (check.status === "warning") {
        novosAlerts.push({
          id: `warning-${check.id}`,
          stack: check.stack,
          tipo: "degradation",
          severity: "medium",
          mensagem: `${check.nome} com performance degradada`,
          timestamp: new Date(),
          resolvido: false,
        });
      }

      // Alert para resposta lenta
      if (check.tempoResposta > 1500) {
        novosAlerts.push({
          id: `slow-${check.id}`,
          stack: check.stack,
          tipo: "slow_response",
          severity: "low",
          mensagem: `${check.nome} respondendo lentamente (${check.tempoResposta.toFixed(0)}ms)`,
          timestamp: new Date(),
          resolvido: false,
        });
      }
    });

    setAlerts(novosAlerts);
  };

  const executarVerificacaoAutomatica = async () => {
    const checks = await gerarHealthChecksExemplo();
    setHealthChecks(checks);
    calcularSummary(checks);
    gerarAlerts(checks);
  };

  const executarVerificacaoManual = async (checkId?: string) => {
    if (checkId) {
      setHealthChecks((prev) =>
        prev.map((check) =>
          check.id === checkId ? { ...check, status: "checking" } : check,
        ),
      );

      // Simular verificação
      setTimeout(() => {
        const novoStatus = Math.random() > 0.1 ? "pass" : "fail";
        const novoTempo = Math.random() * 1500 + 100;

        setHealthChecks((prev) =>
          prev.map((check) =>
            check.id === checkId
              ? {
                  ...check,
                  status: novoStatus,
                  tempoResposta: novoTempo,
                  ultimaVerificacao: new Date(),
                  proximaVerificacao: new Date(Date.now() + 30000),
                  detalhes:
                    novoStatus === "pass"
                      ? "Verificação manual bem-sucedida"
                      : "Falha na verificação manual",
                }
              : check,
          ),
        );
      }, 2000);
    } else {
      setCheckingAll(true);
      setTimeout(() => {
        executarVerificacaoAutomatica();
        setCheckingAll(false);
      }, 3000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "checking":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pass":
        return "border-green-200 bg-green-50";
      case "fail":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "checking":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "service":
        return <Server className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "network":
        return <Wifi className="h-4 w-4" />;
      case "endpoint":
        return <Target className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50";
      case "high":
        return "border-orange-500 bg-orange-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  const checksFilterados =
    selectedStack === "all"
      ? healthChecks
      : healthChecks.filter((check) => check.stack === selectedStack);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-8 h-8 mx-auto mb-4"
          >
            <Heart className="w-full h-full text-green-500" />
          </motion.div>
          <p className="text-gray-600">Inicializando health checks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-green-600" />
                Health Check Inteligente
              </CardTitle>
              <CardDescription>
                Monitoramento contínuo da saúde de todas as stacks da plataforma
              </CardDescription>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Auto Check:</label>
                <Button
                  variant={autoCheck ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoCheck(!autoCheck)}
                  className="gap-2"
                >
                  <Activity className="h-4 w-4" />
                  {autoCheck ? "Ativo" : "Inativo"}
                </Button>
              </div>

              <Button
                onClick={() => executarVerificacaoManual()}
                disabled={checkingAll}
                className="gap-2"
              >
                {checkingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Verificar Tudo
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Summary Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {summary.totalChecks}
              </div>
              <div className="text-xs text-gray-600">Total Checks</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {summary.passing}
              </div>
              <div className="text-xs text-gray-600">Passando</div>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {summary.failing}
              </div>
              <div className="text-xs text-gray-600">Falhando</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.warnings}
              </div>
              <div className="text-xs text-gray-600">Avisos</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {summary.averageResponseTime.toFixed(0)}ms
              </div>
              <div className="text-xs text-gray-600">Tempo Médio</div>
            </div>

            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {summary.uptime.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Uptime</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {summary.trendsPositive}
              </div>
              <div className="text-xs text-gray-600">Melhorando</div>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                <TrendingDown className="h-4 w-4" />
                {summary.trendsNegative}
              </div>
              <div className="text-xs text-gray-600">Degradando</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertas Ativos */}
      {alerts.filter((a) => !a.resolvido).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Alertas de Saúde ({alerts.filter((a) => !a.resolvido).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alerts
                .filter((a) => !a.resolvido)
                .map((alert) => (
                  <Alert
                    key={alert.id}
                    className={`border-l-4 ${getSeverityColor(alert.severity)}`}
                  >
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{alert.mensagem}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {alert.timestamp.toLocaleTimeString("pt-BR")}
                        </span>
                      </div>
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "destructive"
                            : alert.severity === "high"
                              ? "destructive"
                              : alert.severity === "medium"
                                ? "default"
                                : "secondary"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </AlertDescription>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {checksFilterados.map((check, index) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`${getStatusColor(check.status)} border-l-4`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getTipoIcon(check.tipo)}
                      {check.nome}
                    </CardTitle>
                    {getStatusIcon(check.status)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    {check.url && (
                      <span className="text-xs text-gray-500 truncate">
                        {check.url}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Métricas Principais */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Tempo Resposta</div>
                        <div
                          className={`font-bold ${
                            check.tempoResposta < 500
                              ? "text-green-600"
                              : check.tempoResposta < 1000
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {check.tempoResposta.toFixed(0)}ms
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-600">Status</div>
                        <Badge
                          variant={
                            check.status === "pass"
                              ? "default"
                              : check.status === "warning"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {check.status === "pass"
                            ? "Saudável"
                            : check.status === "warning"
                              ? "Atenção"
                              : check.status === "fail"
                                ? "Falha"
                                : "Verificando"}
                        </Badge>
                      </div>
                    </div>

                    {/* Detalhes/Erro */}
                    {check.detalhes && (
                      <div className="text-xs text-gray-600">
                        {check.detalhes}
                      </div>
                    )}

                    {check.erro && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        <strong>Erro:</strong> {check.erro}
                      </div>
                    )}

                    {/* Histórico de Performance */}
                    <div>
                      <div className="text-xs text-gray-600 mb-2">
                        Últimas 12h
                      </div>
                      <div className="flex items-end gap-1 h-8">
                        {check.historico.slice(-12).map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-t ${
                              h.status === "pass"
                                ? "bg-green-300"
                                : h.status === "warning"
                                  ? "bg-yellow-300"
                                  : "bg-red-300"
                            }`}
                            style={{
                              height: `${Math.max(20, (h.tempoResposta / 2000) * 100)}%`,
                            }}
                            title={`${h.timestamp.toLocaleTimeString("pt-BR")}: ${h.tempoResposta.toFixed(0)}ms`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        Última:{" "}
                        {check.ultimaVerificacao.toLocaleTimeString("pt-BR")}
                      </span>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => executarVerificacaoManual(check.id)}
                          disabled={check.status === "checking"}
                          className="h-6 w-6 p-0"
                        >
                          {check.status === "checking" ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Uptime Global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Uptime Global da Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Disponibilidade Geral
                </span>
                <span className="text-lg font-bold text-green-600">
                  {summary.uptime.toFixed(2)}%
                </span>
              </div>
              <Progress value={summary.uptime} className="h-4" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {summary.passing}
                </div>
                <div className="text-xs text-gray-600">
                  Serviços Operacionais
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {summary.warnings}
                </div>
                <div className="text-xs text-gray-600">Com Alertas</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-red-600">
                  {summary.failing}
                </div>
                <div className="text-xs text-gray-600">Indisponíveis</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCheckMonitor;

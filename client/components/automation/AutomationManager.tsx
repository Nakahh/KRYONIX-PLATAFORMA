import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Progress } from "../ui/progress";
import { Switch } from "../ui/switch";
import orchestrationService, {
  AutomationRule,
  StackConfig,
} from "../../services/brazilian-stack-orchestration";
import {
  Bot,
  Zap,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  Settings,
  Target,
  TrendingUp,
  Shield,
  RefreshCw,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  AlertCircle,
  PlayCircle,
  StopCircle,
} from "lucide-react";

interface AutomationExecution {
  id: string;
  regraId: string;
  nomeRegra: string;
  stack: string;
  acao: string;
  status: "executando" | "sucesso" | "falha" | "pendente";
  iniciadoEm: Date;
  concluídoEm?: Date;
  resultado?: string;
  erro?: string;
  tempoExecucao?: number;
}

interface AutomationStats {
  totalExecucoes: number;
  sucessos: number;
  falhas: number;
  tempoMedioExecucao: number;
  economiaCusto: number;
  problemasResolvidos: number;
}

const AutomationManager: React.FC = () => {
  const [regras, setRegras] = useState<AutomationRule[]>([]);
  const [execucoes, setExecucoes] = useState<AutomationExecution[]>([]);
  const [stats, setStats] = useState<AutomationStats>({
    totalExecucoes: 0,
    sucessos: 0,
    falhas: 0,
    tempoMedioExecucao: 0,
    economiaCusto: 0,
    problemasResolvidos: 0,
  });
  const [automacaoAtiva, setAutomacaoAtiva] = useState(true);
  const [modoDebug, setModoDebug] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 10000); // Atualizar a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar regras de automação
      const regrasData = await gerarRegrasExemplo();
      setRegras(regrasData);

      // Carregar execuções recentes
      const execucoesData = await gerarExecucoesExemplo();
      setExecucoes(execucoesData);

      // Calcular estatísticas
      calcularEstatisticas(execucoesData);

      setLoading(false);
    } catch (error) {
      console.error("❌ Erro ao carregar dados de automação:", error);
      setLoading(false);
    }
  };

  const gerarRegrasExemplo = (): AutomationRule[] => {
    return [
      {
        id: "cpu-critico",
        nome: "CPU Crítico - Restart Automático",
        stack: "evolution-api",
        condicao: "cpu > 95 AND duracao > 300",
        acao: { tipo: "restart", parametros: {}, timeout: 60000 },
        ativo: true,
        prioridade: 1,
        criadoPor: "sistema",
        ultimaExecucao: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      },
      {
        id: "memoria-alta",
        nome: "Memória Alta - Limpeza Cache",
        stack: "redis",
        condicao: "memoria > 90 AND duracao > 180",
        acao: {
          tipo: "optimize",
          parametros: { tipo: "cache" },
          timeout: 30000,
        },
        ativo: true,
        prioridade: 2,
        criadoPor: "sistema",
        ultimaExecucao: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      },
      {
        id: "disco-cheio",
        nome: "Disco Crítico - Limpeza Logs",
        stack: "postgresql",
        condicao: "disco > 95",
        acao: {
          tipo: "optimize",
          parametros: { tipo: "disk" },
          timeout: 60000,
        },
        ativo: true,
        prioridade: 1,
        criadoPor: "sistema",
      },
      {
        id: "webhook-falha",
        nome: "API WhatsApp - Failover",
        stack: "evolution-api",
        condicao: "disponibilidade < 90 AND erros > 50",
        acao: { tipo: "scale", parametros: { instancias: 2 }, timeout: 120000 },
        ativo: true,
        prioridade: 1,
        criadoPor: "sistema",
        ultimaExecucao: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      },
      {
        id: "latencia-alta",
        nome: "Latência Alta - Otimização Rede",
        stack: "nginx",
        condicao: "latencia > 2000 AND requests > 1000",
        acao: {
          tipo: "optimize",
          parametros: { tipo: "network" },
          timeout: 45000,
        },
        ativo: true,
        prioridade: 3,
        criadoPor: "sistema",
      },
      {
        id: "backup-falha",
        nome: "Backup Falhou - Retry Inteligente",
        stack: "backup-manager",
        condicao: 'backup_status = "failed"',
        acao: {
          tipo: "restart",
          parametros: { modo: "incremental" },
          timeout: 300000,
        },
        ativo: true,
        prioridade: 2,
        criadoPor: "sistema",
      },
    ];
  };

  const gerarExecucoesExemplo = (): AutomationExecution[] => {
    const execucoes: AutomationExecution[] = [];
    const agora = new Date();

    // Gerar execuções das últimas 24 horas
    for (let i = 0; i < 15; i++) {
      const tempoInicio = new Date(
        agora.getTime() - Math.random() * 24 * 60 * 60 * 1000,
      );
      const tempoExecucao = Math.random() * 120000 + 5000; // 5s a 2min
      const sucesso = Math.random() > 0.15; // 85% de sucesso

      execucoes.push({
        id: `exec-${i}`,
        regraId: [
          "cpu-critico",
          "memoria-alta",
          "webhook-falha",
          "backup-falha",
        ][Math.floor(Math.random() * 4)],
        nomeRegra: [
          "CPU Crítico - Restart",
          "Memória Alta - Cache",
          "API Falha - Failover",
          "Backup Retry",
        ][Math.floor(Math.random() * 4)],
        stack: ["evolution-api", "redis", "postgresql", "nginx"][
          Math.floor(Math.random() * 4)
        ],
        acao: ["restart", "optimize", "scale", "rollback"][
          Math.floor(Math.random() * 4)
        ],
        status: sucesso ? "sucesso" : "falha",
        iniciadoEm: tempoInicio,
        concluídoEm: new Date(tempoInicio.getTime() + tempoExecucao),
        tempoExecucao,
        resultado: sucesso ? "Ação executada com sucesso" : undefined,
        erro: !sucesso ? "Timeout na execução da ação" : undefined,
      });
    }

    return execucoes.sort(
      (a, b) => b.iniciadoEm.getTime() - a.iniciadoEm.getTime(),
    );
  };

  const calcularEstatisticas = (execucoesData: AutomationExecution[]) => {
    const total = execucoesData.length;
    const sucessos = execucoesData.filter((e) => e.status === "sucesso").length;
    const falhas = execucoesData.filter((e) => e.status === "falha").length;

    const temposExecucao = execucoesData
      .filter((e) => e.tempoExecucao)
      .map((e) => e.tempoExecucao!);

    const tempoMedio =
      temposExecucao.length > 0
        ? temposExecucao.reduce((a, b) => a + b, 0) / temposExecucao.length
        : 0;

    setStats({
      totalExecucoes: total,
      sucessos,
      falhas,
      tempoMedioExecucao: tempoMedio,
      economiaCusto: sucessos * 25.5, // R$ 25,50 por problema resolvido automaticamente
      problemasResolvidos: sucessos,
    });
  };

  const toggleRegra = async (regraId: string) => {
    setRegras((prev) =>
      prev.map((regra) =>
        regra.id === regraId ? { ...regra, ativo: !regra.ativo } : regra,
      ),
    );
  };

  const executarRegraManual = async (regraId: string) => {
    const regra = regras.find((r) => r.id === regraId);
    if (!regra) return;

    const novaExecucao: AutomationExecution = {
      id: `manual-${Date.now()}`,
      regraId: regra.id,
      nomeRegra: regra.nome,
      stack: regra.stack,
      acao: regra.acao.tipo,
      status: "executando",
      iniciadoEm: new Date(),
    };

    setExecucoes((prev) => [novaExecucao, ...prev]);

    // Simular execução
    setTimeout(() => {
      const sucesso = Math.random() > 0.1; // 90% sucesso para execução manual
      setExecucoes((prev) =>
        prev.map((exec) =>
          exec.id === novaExecucao.id
            ? {
                ...exec,
                status: sucesso ? "sucesso" : "falha",
                concluídoEm: new Date(),
                tempoExecucao: Math.random() * 30000 + 5000,
                resultado: sucesso ? "Execução manual bem-sucedida" : undefined,
                erro: !sucesso ? "Falha na execução manual" : undefined,
              }
            : exec,
        ),
      );
    }, 3000);
  };

  const getPrioridadeCor = (prioridade: number): string => {
    if (prioridade === 1) return "bg-red-500";
    if (prioridade === 2) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "executando":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case "sucesso":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "falha":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAcaoIcon = (acao: string) => {
    switch (acao) {
      case "restart":
        return <RefreshCw className="h-4 w-4" />;
      case "optimize":
        return <TrendingUp className="h-4 w-4" />;
      case "scale":
        return <Target className="h-4 w-4" />;
      case "rollback":
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Carregando sistema de automação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles Principais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-blue-600" />
                Sistema de Automação IA
              </CardTitle>
              <CardDescription>
                Gerenciamento inteligente e autônomo de todas as stacks da
                plataforma
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Modo Debug:</label>
                <Switch checked={modoDebug} onCheckedChange={setModoDebug} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Automação:</label>
                <Switch
                  checked={automacaoAtiva}
                  onCheckedChange={setAutomacaoAtiva}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!automacaoAtiva && (
            <Alert className="mb-4 border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Automação Pausada:</strong> O sistema não está
                executando ações automáticas. Ative para retomar o funcionamento
                inteligente.
              </AlertDescription>
            </Alert>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalExecucoes}
              </div>
              <div className="text-sm text-gray-600">Total Execuções</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.sucessos}
              </div>
              <div className="text-sm text-gray-600">Sucessos</div>
            </div>

            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.falhas}
              </div>
              <div className="text-sm text-gray-600">Falhas</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(stats.tempoMedioExecucao / 1000).toFixed(1)}s
              </div>
              <div className="text-sm text-gray-600">Tempo Médio</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.problemasResolvidos}
              </div>
              <div className="text-sm text-gray-600">Problemas Resolvidos</div>
            </div>

            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                R$ {stats.economiaCusto.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Economia/Mês</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regras de Automação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Regras Ativas ({regras.filter((r) => r.ativo).length}/
              {regras.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {regras.map((regra) => (
                <motion.div
                  key={regra.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 border rounded-lg ${regra.ativo ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm">{regra.nome}</h4>
                        <div
                          className={`w-2 h-2 rounded-full ${getPrioridadeCor(regra.prioridade)}`}
                        />
                      </div>

                      <p className="text-xs text-gray-600 mb-2">
                        <strong>Stack:</strong> {regra.stack} |{" "}
                        <strong>Condição:</strong> {regra.condicao}
                      </p>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          {getAcaoIcon(regra.acao.tipo)}
                          {regra.acao.tipo}
                        </span>

                        {regra.ultimaExecucao && (
                          <span className="text-gray-500">
                            Última:{" "}
                            {new Date(regra.ultimaExecucao).toLocaleString(
                              "pt-BR",
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executarRegraManual(regra.id)}
                        disabled={!automacaoAtiva}
                        className="h-7 px-2"
                      >
                        <PlayCircle className="h-3 w-3" />
                      </Button>

                      <Switch
                        checked={regra.ativo}
                        onCheckedChange={() => toggleRegra(regra.id)}
                        disabled={!automacaoAtiva}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Execuções Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Execuções Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {execucoes.slice(0, 10).map((execucao) => (
                <motion.div
                  key={execucao.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 border rounded-lg text-sm"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execucao.status)}
                    <div>
                      <div className="font-medium">{execucao.nomeRegra}</div>
                      <div className="text-xs text-gray-600">
                        {execucao.stack} • {execucao.acao}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {execucao.iniciadoEm.toLocaleTimeString("pt-BR")}
                    </div>
                    {execucao.tempoExecucao && (
                      <div className="text-xs text-gray-400">
                        {(execucao.tempoExecucao / 1000).toFixed(1)}s
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Taxa de Sucesso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance da Automação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Taxa de Sucesso</span>
                <span className="text-sm text-gray-600">
                  {stats.totalExecucoes > 0
                    ? ((stats.sucessos / stats.totalExecucoes) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  stats.totalExecucoes > 0
                    ? (stats.sucessos / stats.totalExecucoes) * 100
                    : 0
                }
                className="h-3"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {stats.sucessos}
                </div>
                <div className="text-xs text-gray-600">
                  Execuções Bem-sucedidas
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {stats.falhas}
                </div>
                <div className="text-xs text-gray-600">Execuções Falharam</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {stats.totalExecucoes > 0
                    ? ((stats.sucessos / stats.totalExecucoes) * 100).toFixed(0)
                    : 0}
                  %
                </div>
                <div className="text-xs text-gray-600">Taxa de Sucesso</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {modoDebug && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Modo Debug - Detalhes Técnicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto">
              <div>
                🤖 Sistema de Automação KRYONIX v2.0 - Status:{" "}
                {automacaoAtiva ? "ATIVO" : "PAUSADO"}
              </div>
              <div>📊 Regras carregadas: {regras.length}</div>
              <div>
                ⚡ Regras ativas: {regras.filter((r) => r.ativo).length}
              </div>
              <div>🎯 Execuções processadas: {stats.totalExecucoes}</div>
              <div>
                ✅ Taxa de sucesso:{" "}
                {stats.totalExecucoes > 0
                  ? ((stats.sucessos / stats.totalExecucoes) * 100).toFixed(2)
                  : 0}
                %
              </div>
              <div>
                💰 Economia estimada: R$ {stats.economiaCusto.toFixed(2)}/mês
              </div>
              <div>
                🔍 Última verificação: {new Date().toLocaleString("pt-BR")}
              </div>
              <div>
                🛠️ Próximo ciclo:{" "}
                {new Date(Date.now() + 10000).toLocaleTimeString("pt-BR")}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutomationManager;

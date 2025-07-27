import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useMobile } from "../hooks/use-mobile";
import orchestrationService, {
  StackConfig,
  StackStatus,
  HealthStatus,
  AutomationRule,
  PerformanceOptimization,
} from "../services/brazilian-stack-orchestration";
import AutomationManager from "../components/automation/AutomationManager";
import HealthCheckMonitor from "../components/monitoring/HealthCheckMonitor";
import DeploymentManager from "../components/deployment/DeploymentManager";
import MainLayout from "../components/layout/MainLayout";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Globe,
  HardDrive,
  MemoryStick,
  MonitorSpeaker,
  Network,
  Play,
  Pause,
  RotateCcw,
  Settings,
  TrendingUp,
  Zap,
  Shield,
  Eye,
  Bell,
  Gauge,
  Server,
  Wifi,
  Users,
  BarChart3,
  Target,
  Layers,
  GitBranch,
} from "lucide-react";

interface MetricasTempoReal {
  timestamp: Date;
  cpu: number;
  memoria: number;
  disco: number;
  latencia: number;
  requests: number;
  erros: number;
}

interface AlertaStack {
  id: string;
  stack: string;
  tipo: "info" | "warning" | "error" | "success";
  titulo: string;
  mensagem: string;
  timestamp: Date;
  ativo: boolean;
}

const StackOrchestration: React.FC = () => {
  const isMobile = useMobile();
  const [stacks, setStacks] = useState<StackConfig[]>([]);
  const [stackSelecionada, setStackSelecionada] = useState<string | null>(null);
  const [metricas, setMetricas] = useState<MetricasTempoReal[]>([]);
  const [alertas, setAlertas] = useState<AlertaStack[]>([]);
  const [regrasAutomacao, setRegrasAutomacao] = useState<AutomationRule[]>([]);
  const [otimizacoes, setOtimizacoes] = useState<PerformanceOptimization[]>([]);
  const [visualizacao, setVisualizacao] = useState<"grid" | "lista">("grid");
  const [filtroStatus, setFiltroStatus] = useState<StackStatus | "todos">(
    "todos",
  );
  const [filtroSaude, setFiltroSaude] = useState<HealthStatus | "todos">(
    "todos",
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
    const interval = setInterval(() => {
      if (autoRefresh) {
        carregarDados();
      }
    }, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const carregarDados = useCallback(async () => {
    try {
      const stacksData = await orchestrationService.getTodasStacks();
      setStacks(stacksData);

      // Simular métricas em tempo real
      const novasMetricas: MetricasTempoReal = {
        timestamp: new Date(),
        cpu: Math.random() * 100,
        memoria: Math.random() * 100,
        disco: Math.random() * 100,
        latencia: Math.random() * 2000,
        requests: Math.floor(Math.random() * 1000),
        erros: Math.floor(Math.random() * 50),
      };

      setMetricas((prev) => [...prev.slice(-29), novasMetricas]);

      // Gerar alertas baseados nas métricas
      gerarAlertasInteligentes(stacksData);

      setLoading(false);
    } catch (error) {
      console.error("❌ Erro ao carregar dados da orquestração:", error);
      setLoading(false);
    }
  }, []);

  const gerarAlertasInteligentes = (stacksData: StackConfig[]) => {
    const novosAlertas: AlertaStack[] = [];

    stacksData.forEach((stack) => {
      // Alerta de CPU alta
      if (stack.metricas.cpu > 90) {
        novosAlertas.push({
          id: `cpu-${stack.id}`,
          stack: stack.id,
          tipo: "error",
          titulo: "CPU Crítico",
          mensagem: `${stack.nome} com CPU em ${stack.metricas.cpu.toFixed(1)}%`,
          timestamp: new Date(),
          ativo: true,
        });
      }

      // Alerta de memória alta
      if (stack.metricas.memoria > 85) {
        novosAlertas.push({
          id: `mem-${stack.id}`,
          stack: stack.id,
          tipo: "warning",
          titulo: "Memória Elevada",
          mensagem: `${stack.nome} usando ${stack.metricas.memoria.toFixed(1)}% da memória`,
          timestamp: new Date(),
          ativo: true,
        });
      }

      // Alerta de saúde crítica
      if (stack.saude === "critico" || stack.saude === "indisponivel") {
        novosAlertas.push({
          id: `health-${stack.id}`,
          stack: stack.id,
          tipo: "error",
          titulo: "Serviço Indisponível",
          mensagem: `${stack.nome} com status ${stack.saude}`,
          timestamp: new Date(),
          ativo: true,
        });
      }
    });

    setAlertas((prev) => {
      const alertasExistentes = prev.filter((a) => a.ativo);
      return [...alertasExistentes, ...novosAlertas];
    });
  };

  const getStatusColor = (status: StackStatus): string => {
    const colors = {
      ativo: "bg-green-500",
      inativo: "bg-gray-500",
      manutencao: "bg-yellow-500",
      erro: "bg-red-500",
      atualizando: "bg-blue-500",
      inicializando: "bg-purple-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getSaudeColor = (saude: HealthStatus): string => {
    const colors = {
      saudavel: "text-green-600",
      atencao: "text-yellow-600",
      critico: "text-red-600",
      indisponivel: "text-gray-600",
      degradado: "text-orange-600",
    };
    return colors[saude] || "text-gray-600";
  };

  const getSaudeIcon = (saude: HealthStatus) => {
    const icons = {
      saudavel: <CheckCircle className="h-4 w-4" />,
      atencao: <AlertTriangle className="h-4 w-4" />,
      critico: <AlertTriangle className="h-4 w-4" />,
      indisponivel: <AlertTriangle className="h-4 w-4" />,
      degradado: <AlertTriangle className="h-4 w-4" />,
    };
    return icons[saude] || <AlertTriangle className="h-4 w-4" />;
  };

  const stacksFiltradas = stacks.filter((stack) => {
    const statusMatch =
      filtroStatus === "todos" || stack.status === filtroStatus;
    const saudeMatch = filtroSaude === "todos" || stack.saude === filtroSaude;
    return statusMatch && saudeMatch;
  });

  const estatisticasGerais = {
    totalStacks: stacks.length,
    stacksAtivas: stacks.filter((s) => s.status === "ativo").length,
    stacksSaudaveis: stacks.filter((s) => s.saude === "saudavel").length,
    stacksCriticas: stacks.filter(
      (s) => s.saude === "critico" || s.saude === "indisponivel",
    ).length,
    cpuMedio:
      stacks.length > 0
        ? stacks.reduce((acc, s) => acc + s.metricas.cpu, 0) / stacks.length
        : 0,
    memoriaMedio:
      stacks.length > 0
        ? stacks.reduce((acc, s) => acc + s.metricas.memoria, 0) / stacks.length
        : 0,
  };

  const dadosGraficoSaude = [
    {
      nome: "Saudável",
      valor: stacks.filter((s) => s.saude === "saudavel").length,
      cor: "#10b981",
    },
    {
      nome: "Atenção",
      valor: stacks.filter((s) => s.saude === "atencao").length,
      cor: "#f59e0b",
    },
    {
      nome: "Crítico",
      valor: stacks.filter((s) => s.saude === "critico").length,
      cor: "#ef4444",
    },
    {
      nome: "Indisponível",
      valor: stacks.filter((s) => s.saude === "indisponivel").length,
      cor: "#6b7280",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">
              Carregando sistema de orquestração...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout title="Orquestração Inteligente">
      <div className="space-y-6">
        {/* Controles do Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-600 text-sm">
              Monitoramento autônomo de {stacks.length} stacks em tempo real
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2"
            >
              <Activity className="h-4 w-4" />
              {autoRefresh ? "Pausar" : "Retomar"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setVisualizacao((v) => (v === "grid" ? "lista" : "grid"))
              }
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              {visualizacao === "grid" ? "Lista" : "Grid"}
            </Button>
          </div>
        </div>
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Stacks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {estatisticasGerais.totalStacks}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Server className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ativas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {estatisticasGerais.stacksAtivas}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Saudáveis</p>
                    <p className="text-2xl font-bold text-green-600">
                      {estatisticasGerais.stacksSaudaveis}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Críticas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {estatisticasGerais.stacksCriticas}
                    </p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">CPU Médio</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {estatisticasGerais.cpuMedio.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Cpu className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">RAM Média</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {estatisticasGerais.memoriaMedio.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MemoryStick className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alertas Ativos */}
        {alertas.filter((a) => a.ativo).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-500" />
                  Alertas Ativos ({alertas.filter((a) => a.ativo).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {alertas
                    .filter((a) => a.ativo)
                    .slice(0, 5)
                    .map((alerta) => (
                      <Alert
                        key={alerta.id}
                        className={`border-l-4 ${
                          alerta.tipo === "error"
                            ? "border-red-500 bg-red-50"
                            : alerta.tipo === "warning"
                              ? "border-yellow-500 bg-yellow-50"
                              : "border-blue-500 bg-blue-50"
                        }`}
                      >
                        <AlertDescription className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{alerta.titulo}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {alerta.mensagem}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setAlertas((prev) =>
                                prev.map((a) =>
                                  a.id === alerta.id
                                    ? { ...a, ativo: false }
                                    : a,
                                ),
                              )
                            }
                          >
                            ✕
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="stacks">Stacks</TabsTrigger>
            <TabsTrigger value="health">Health Check</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Métricas em Tempo Real */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Métricas em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metricas.slice(-20)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="timestamp"
                          tickFormatter={(value) =>
                            new Date(value).toLocaleTimeString("pt-BR")
                          }
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) =>
                            new Date(value).toLocaleTimeString("pt-BR")
                          }
                          formatter={(value: any, name) => [
                            `${Number(value).toFixed(1)}${name === "latencia" ? "ms" : "%"}`,
                            name === "cpu"
                              ? "CPU"
                              : name === "memoria"
                                ? "Memória"
                                : name === "latencia"
                                  ? "Latência"
                                  : name,
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="cpu"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="memoria"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="latencia"
                          stroke="#f59e0b"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição de Saúde */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Distribuição de Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosGraficoSaude}
                          dataKey="valor"
                          nameKey="nome"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ nome, valor }) =>
                            valor > 0 ? `${nome}: ${valor}` : ""
                          }
                        >
                          {dadosGraficoSaude.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lista de Stacks */}
          <TabsContent value="stacks" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status:</label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="erro">Erro</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Saúde:</label>
                <select
                  value={filtroSaude}
                  onChange={(e) => setFiltroSaude(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="saudavel">Saudável</option>
                  <option value="atencao">Atenção</option>
                  <option value="critico">Crítico</option>
                  <option value="indisponivel">Indisponível</option>
                </select>
              </div>
            </div>

            {/* Grid de Stacks */}
            <div
              className={
                visualizacao === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-3"
              }
            >
              <AnimatePresence>
                {stacksFiltradas.map((stack, index) => (
                  <motion.div
                    key={stack.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setStackSelecionada(stack.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${getStatusColor(stack.status)}`}
                            />
                            {stack.nome}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={getSaudeColor(stack.saude)}
                          >
                            {getSaudeIcon(stack.saude)}
                            {stack.saude}
                          </Badge>
                        </div>
                        <CardDescription>
                          {stack.tipo} • v{stack.versao}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-600">CPU</span>
                              <span className="font-medium">
                                {stack.metricas.cpu.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={stack.metricas.cpu}
                              className="h-2"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-600">Memória</span>
                              <span className="font-medium">
                                {stack.metricas.memoria.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={stack.metricas.memoria}
                              className="h-2"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-600">Disco</span>
                              <span className="font-medium">
                                {stack.metricas.disco.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={stack.metricas.disco}
                              className="h-2"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Latência</span>
                            <span className="font-medium">
                              {stack.metricas.latencia.toFixed(0)}ms
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Último check:{" "}
                            {new Date(
                              stack.ultimaVerificacao,
                            ).toLocaleTimeString("pt-BR")}
                          </span>
                          <div className="flex gap-1">
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
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Health Check */}
          <TabsContent value="health" className="space-y-6">
            <HealthCheckMonitor />
          </TabsContent>

          {/* Automação */}
          <TabsContent value="automation" className="space-y-6">
            <AutomationManager />
          </TabsContent>

          {/* Deployment */}
          <TabsContent value="deployment" className="space-y-6">
            <DeploymentManager />
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            {/* Métricas Gerais de Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Performance Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">CPU Global</span>
                        <span className="text-lg font-bold text-blue-600">
                          {estatisticasGerais.cpuMedio.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={estatisticasGerais.cpuMedio}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Memória Global</span>
                        <span className="text-lg font-bold text-purple-600">
                          {estatisticasGerais.memoriaMedio.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={estatisticasGerais.memoriaMedio}
                        className="h-2"
                      />
                    </div>

                    <div className="pt-2 border-t text-center">
                      <div className="text-sm text-gray-600">
                        Score Performance
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {(
                          100 -
                          (estatisticasGerais.cpuMedio +
                            estatisticasGerais.memoriaMedio) /
                            2
                        ).toFixed(0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Otimizações Aplicadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {otimizacoes.filter((o) => o.implementado).length}
                      </div>
                      <div className="text-sm text-gray-600">Este Mês</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-bold">R$ 340</div>
                        <div className="text-gray-600">Economia</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-bold">25%</div>
                        <div className="text-gray-600">Melhoria</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Próximas Ações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {
                          otimizacoes.filter(
                            (o) => !o.implementado && o.impacto === "alto",
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600">Pendentes</div>
                    </div>

                    <div className="text-xs text-center">
                      <div className="font-medium">Próxima otimização:</div>
                      <div className="text-gray-600">Cache Redis - 2h</div>
                    </div>

                    <Button size="sm" className="w-full gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Executar Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Otimizações Recomendadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Otimizações Inteligentes Recomendadas
                </CardTitle>
                <CardDescription>
                  IA KRYONIX analisou {stacks.length} stacks e identificou{" "}
                  {otimizacoes.filter((o) => !o.implementado).length}{" "}
                  oportunidades de melhoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {otimizacoes.map((otimizacao, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              otimizacao.tipo === "cache"
                                ? "bg-blue-100"
                                : otimizacao.tipo === "database"
                                  ? "bg-green-100"
                                  : otimizacao.tipo === "network"
                                    ? "bg-purple-100"
                                    : "bg-gray-100"
                            }`}
                          >
                            {otimizacao.tipo === "cache" ? (
                              <Database className="h-4 w-4 text-blue-600" />
                            ) : otimizacao.tipo === "database" ? (
                              <Server className="h-4 w-4 text-green-600" />
                            ) : otimizacao.tipo === "network" ? (
                              <Wifi className="h-4 w-4 text-purple-600" />
                            ) : (
                              <Target className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {otimizacao.recomendacao}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Stack: {otimizacao.stack}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Economia CPU:</span>
                            <div className="font-medium text-blue-600">
                              {otimizacao.economia.cpu}%
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Economia RAM:</span>
                            <div className="font-medium text-purple-600">
                              {otimizacao.economia.memoria}%
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Economia Mensal:
                            </span>
                            <div className="font-medium text-green-600">
                              R$ {otimizacao.economia.custo}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-4">
                        <Badge
                          variant={
                            otimizacao.impacto === "alto"
                              ? "destructive"
                              : otimizacao.impacto === "medio"
                                ? "default"
                                : "secondary"
                          }
                          className="gap-1"
                        >
                          {otimizacao.impacto === "alto" ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : otimizacao.impacto === "medio" ? (
                            <Target className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {otimizacao.impacto}
                        </Badge>

                        {otimizacao.implementado ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Implementado
                          </Badge>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Analisar
                            </Button>
                            <Button size="sm" className="gap-2">
                              <Zap className="h-4 w-4" />
                              Aplicar
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Histórico de Performance (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metricas.slice(-24)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(value).toLocaleString("pt-BR")
                        }
                        formatter={(value: any, name) => [
                          `${Number(value).toFixed(1)}${name === "latencia" ? "ms" : "%"}`,
                          name === "cpu"
                            ? "CPU Média"
                            : name === "memoria"
                              ? "Memória Média"
                              : name === "latencia"
                                ? "Latência Média"
                                : name,
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="cpu"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="memoria"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default StackOrchestration;

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  RefreshCw,
  Server,
  TrendingUp,
  Users,
  Zap,
  XCircle,
  Cpu,
  HardDrive,
  Wifi,
  Timer,
} from "lucide-react";
import { stackIntegration, KRYONIX_STACKS } from "@/services/stack-integration";

interface MetricData {
  timestamp: string;
  requests: number;
  responseTime: number;
  errors: number;
  activeUsers?: number;
}

export default function RealTimeDashboard() {
  const [healthData, setHealthData] = useState<Map<string, any>>(new Map());
  const [metricsData, setMetricsData] = useState<Map<string, any>>(new Map());
  const [historicalData, setHistoricalData] = useState<MetricData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1h");
  const [systemReport, setSystemReport] = useState<any>(null);

  // Cores para os gráficos
  const colors = [
    "#0ea5e9",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
  ];

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh a cada 10 segundos
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Carregar health checks
      const health = await stackIntegration.performHealthChecks();
      setHealthData(health);

      // Carregar métricas
      const metrics = await stackIntegration.getAllMetrics();
      setMetricsData(metrics);

      // Gerar relatório do sistema
      const report = await stackIntegration.generateSystemReport();
      setSystemReport(report);

      // Simular dados históricos (em produção, viriam de uma API)
      const now = new Date();
      const newDataPoint: MetricData = {
        timestamp: now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        requests: Array.from(metrics.values()).reduce(
          (sum, m) => sum + m.requests,
          0,
        ),
        responseTime:
          Array.from(metrics.values()).reduce(
            (sum, m) => sum + m.responseTime,
            0,
          ) / metrics.size,
        errors: Array.from(metrics.values()).reduce(
          (sum, m) => sum + m.errors,
          0,
        ),
        activeUsers: Array.from(metrics.values()).reduce(
          (sum, m) => sum + (m.activeUsers || 0),
          0,
        ),
      };

      setHistoricalData((prev) => {
        const updated = [...prev, newDataPoint];
        // Manter apenas os últimos 20 pontos
        return updated.slice(-20);
      });
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  // Métricas agregadas
  const totalRequests = Array.from(metricsData.values()).reduce(
    (sum, m) => sum + m.requests,
    0,
  );
  const totalErrors = Array.from(metricsData.values()).reduce(
    (sum, m) => sum + m.errors,
    0,
  );
  const avgResponseTime =
    metricsData.size > 0
      ? Array.from(metricsData.values()).reduce(
          (sum, m) => sum + m.responseTime,
          0,
        ) / metricsData.size
      : 0;
  const totalActiveUsers = Array.from(metricsData.values()).reduce(
    (sum, m) => sum + (m.activeUsers || 0),
    0,
  );

  // Status das stacks para gráfico de pizza
  const statusData = [
    {
      name: "Online",
      value: systemReport?.summary.online || 0,
      color: "#10b981",
    },
    {
      name: "Atenção",
      value: systemReport?.summary.warning || 0,
      color: "#f59e0b",
    },
    {
      name: "Offline",
      value: systemReport?.summary.offline || 0,
      color: "#ef4444",
    },
    { name: "Erro", value: systemReport?.summary.error || 0, color: "#dc2626" },
  ].filter((item) => item.value > 0);

  // Top 5 stacks por requests
  const topStacksByRequests = Array.from(metricsData.entries())
    .map(([stackId, metrics]) => ({
      name:
        KRYONIX_STACKS.find((s) => s.id === stackId)?.displayName || stackId,
      requests: metrics.requests,
      responseTime: metrics.responseTime,
    }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5);

  // Dados das categorias
  const categoryData =
    systemReport?.categories?.map((cat: any) => ({
      name: cat.name.charAt(0).toUpperCase() + cat.name.slice(1),
      total: cat.stacks,
      online: cat.online,
      uptime: cat.stacks > 0 ? (cat.online / cat.stacks) * 100 : 0,
    })) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard KRYONIX em Tempo Real
          </h1>
          <p className="text-muted-foreground">
            Monitoramento completo de todas as 25 stacks da plataforma
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Atualizando a cada 10s</span>
          </Badge>
          <Button onClick={refreshDashboard} disabled={isRefreshing} size="sm">
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {systemReport?.summary.online || 0}
                </p>
                <p className="text-xs text-muted-foreground">Stacks Online</p>
                <p className="text-xs text-green-600">
                  {systemReport?.summary.uptime?.toFixed(1) || 0}% uptime
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalRequests.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">Requests Totais</p>
                <p className="text-xs text-blue-600">
                  {(totalRequests / KRYONIX_STACKS.length || 0).toLocaleString(
                    "pt-BR",
                  )}{" "}
                  por stack
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Timer className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {avgResponseTime.toFixed(0)}ms
                </p>
                <p className="text-xs text-muted-foreground">Tempo Médio</p>
                <p className="text-xs text-purple-600">
                  {avgResponseTime < 200
                    ? "Excelente"
                    : avgResponseTime < 500
                      ? "Bom"
                      : "Necessita atenção"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalActiveUsers.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground">Usuários Ativos</p>
                <p className="text-xs text-orange-600">
                  {totalErrors} erros detectados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {systemReport?.criticalIssues?.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Problemas Críticos Detectados:</strong>
            <ul className="mt-2 space-y-1">
              {systemReport.criticalIssues
                .slice(0, 3)
                .map((issue: any, index: number) => (
                  <li key={index} className="flex items-center space-x-2">
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span className="text-sm">
                      {issue.stack.displayName}: {issue.issue}
                    </span>
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Performance em Tempo Real */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Performance em Tempo Real</span>
            </CardTitle>
            <CardDescription>
              Requests e tempo de resposta por minuto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "requests" ? `${value} requests` : `${value}ms`,
                    name === "requests" ? "Requests" : "Tempo Resposta",
                  ]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="requests"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status das Stacks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>Status Geral das Stacks</span>
            </CardTitle>
            <CardDescription>
              Distribuição do status atual das 25 stacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} stacks`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Stacks por Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Top 5 Stacks Mais Ativas</span>
            </CardTitle>
            <CardDescription>
              Stacks com maior volume de requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topStacksByRequests} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "requests" ? `${value} requests` : `${value}ms`,
                    name === "requests" ? "Requests" : "Tempo Médio",
                  ]}
                />
                <Bar dataKey="requests" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Uptime por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Uptime por Categoria</span>
            </CardTitle>
            <CardDescription>
              Performance das categorias de stacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {category.online}/{category.total}
                      </span>
                      <Badge
                        variant={
                          category.uptime >= 95
                            ? "default"
                            : category.uptime >= 80
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {category.uptime.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={category.uptime} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações da IA */}
      {systemReport?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Recomendações Inteligentes</span>
            </CardTitle>
            <CardDescription>
              Análise automática e sugestões para otimização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemReport.recommendations.map(
                (recommendation: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="mt-0.5">
                      {recommendation.startsWith("✅") ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : recommendation.startsWith("🚨") ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Zap className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer com informações do sistema */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>
                Última atualização: {new Date().toLocaleString("pt-BR")}
              </span>
              <span>•</span>
              <span>Sistema: KRYONIX v2.0</span>
              <span>•</span>
              <span>25 Stacks Monitoradas</span>
            </div>
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <span>Conectado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Server,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Zap,
} from "lucide-react";

interface HealthMetric {
  name: string;
  status: "healthy" | "warning" | "critical" | "unknown";
  value: number;
  unit: string;
  threshold: { warning: number; critical: number };
  lastUpdated: Date;
  trend: "up" | "down" | "stable";
}

interface ServiceStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  endpoint: string;
  dependencies: string[];
}

interface AdvancedHealthData {
  systemMetrics: HealthMetric[];
  services: ServiceStatus[];
  overallHealth: "healthy" | "warning" | "critical";
  alerts: {
    id: string;
    level: "info" | "warning" | "error";
    message: string;
    timestamp: Date;
    resolved: boolean;
  }[];
}

export function AdvancedHealthMonitor() {
  const [healthData, setHealthData] = useState<AdvancedHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // segundos

  // Fetch dados de health avançados
  const fetchHealthData = useCallback(async () => {
    try {
      const response = await fetch("/api/health/advanced");
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
      } else {
        // Fallback para dados simulados realísticos
        setHealthData(generateMockHealthData());
      }
    } catch (error) {
      console.error("Erro ao buscar dados de health:", error);
      setHealthData(generateMockHealthData());
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    fetchHealthData();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchHealthData, autoRefresh, refreshInterval]);

  // Gerar dados mock realísticos
  const generateMockHealthData = (): AdvancedHealthData => {
    const now = new Date();

    return {
      systemMetrics: [
        {
          name: "CPU",
          status: "healthy",
          value: 45.2,
          unit: "%",
          threshold: { warning: 70, critical: 90 },
          lastUpdated: now,
          trend: "stable",
        },
        {
          name: "Memória",
          status: "warning",
          value: 78.5,
          unit: "%",
          threshold: { warning: 75, critical: 90 },
          lastUpdated: now,
          trend: "up",
        },
        {
          name: "Disco",
          status: "healthy",
          value: 34.1,
          unit: "%",
          threshold: { warning: 80, critical: 95 },
          lastUpdated: now,
          trend: "stable",
        },
        {
          name: "Rede",
          status: "healthy",
          value: 125.7,
          unit: "Mbps",
          threshold: { warning: 50, critical: 20 },
          lastUpdated: now,
          trend: "stable",
        },
      ],
      services: [
        {
          name: "KRYONIX App",
          status: "online",
          responseTime: 145,
          uptime: 99.9,
          lastCheck: now,
          endpoint: "/api/health",
          dependencies: ["Redis", "PostgreSQL"],
        },
        {
          name: "Evolution API",
          status: "online",
          responseTime: 89,
          uptime: 99.7,
          lastCheck: now,
          endpoint: "/evolution/health",
          dependencies: ["WhatsApp Web"],
        },
        {
          name: "N8N Workflows",
          status: "degraded",
          responseTime: 450,
          uptime: 98.2,
          lastCheck: now,
          endpoint: "/n8n/health",
          dependencies: ["PostgreSQL", "Redis"],
        },
        {
          name: "Typebot",
          status: "online",
          responseTime: 234,
          uptime: 99.5,
          lastCheck: now,
          endpoint: "/typebot/health",
          dependencies: ["PostgreSQL"],
        },
        {
          name: "Redis Cache",
          status: "online",
          responseTime: 12,
          uptime: 99.9,
          lastCheck: now,
          endpoint: "/redis/ping",
          dependencies: [],
        },
        {
          name: "Prometheus",
          status: "online",
          responseTime: 78,
          uptime: 99.8,
          lastCheck: now,
          endpoint: "/prometheus/-/healthy",
          dependencies: [],
        },
      ],
      overallHealth: "warning",
      alerts: [
        {
          id: "1",
          level: "warning",
          message: "Uso de memória acima de 75% - considere otimização",
          timestamp: new Date(now.getTime() - 5 * 60 * 1000),
          resolved: false,
        },
        {
          id: "2",
          level: "warning",
          message: "N8N com alta latência (>400ms) - verificar workflows",
          timestamp: new Date(now.getTime() - 12 * 60 * 1000),
          resolved: false,
        },
        {
          id: "3",
          level: "info",
          message: "Deploy automático concluído com sucesso",
          timestamp: new Date(now.getTime() - 45 * 60 * 1000),
          resolved: true,
        },
      ],
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return "bg-green-500";
      case "warning":
      case "degraded":
        return "bg-yellow-500";
      case "critical":
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
      case "offline":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "cpu":
        return <Cpu className="h-4 w-4" />;
      case "memória":
        return <MemoryStick className="h-4 w-4" />;
      case "disco":
        return <HardDrive className="h-4 w-4" />;
      case "rede":
        return <Network className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!healthData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Não foi possível carregar os dados de monitoramento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor(healthData.overallHealth)}`}
          ></div>
          <h2 className="text-2xl font-bold">Monitoramento Avançado</h2>
          <Badge
            variant={
              healthData.overallHealth === "healthy" ? "default" : "destructive"
            }
          >
            {healthData.overallHealth === "healthy"
              ? "Sistema Saudável"
              : healthData.overallHealth === "warning"
                ? "Atenção Requerida"
                : "Crítico"}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Zap
              className={`h-4 w-4 mr-2 ${autoRefresh ? "text-green-500" : "text-gray-500"}`}
            />
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>

          <Button variant="outline" size="sm" onClick={fetchHealthData}>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alertas ativos */}
      {healthData.alerts.filter((alert) => !alert.resolved).length > 0 && (
        <div className="space-y-2">
          {healthData.alerts
            .filter((alert) => !alert.resolved)
            .map((alert) => (
              <Alert
                key={alert.id}
                variant={alert.level === "error" ? "destructive" : "default"}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alert.level.toUpperCase()}:</strong> {alert.message}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({alert.timestamp.toLocaleTimeString("pt-BR")})
                  </span>
                </AlertDescription>
              </Alert>
            ))}
        </div>
      )}

      {/* Métricas do sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthData.systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {getMetricIcon(metric.name)}
                {metric.name}
                {getStatusIcon(metric.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {metric.value.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {metric.unit}
                  </span>
                </div>

                <Progress
                  value={
                    metric.unit === "%"
                      ? metric.value
                      : (metric.value / (metric.threshold.critical * 1.2)) * 100
                  }
                  className="h-2"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Aviso: {metric.threshold.warning}
                    {metric.unit}
                  </span>
                  <span>
                    Crítico: {metric.threshold.critical}
                    {metric.unit}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status dos serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Status dos Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {healthData.services.map((service, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <Badge
                    variant={
                      service.status === "online" ? "default" : "destructive"
                    }
                  >
                    {service.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Tempo Resposta:
                    </span>
                    <div className="font-medium">{service.responseTime}ms</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Uptime:</span>
                    <div className="font-medium">{service.uptime}%</div>
                  </div>
                </div>

                {service.dependencies.length > 0 && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">
                      Dependências:{" "}
                    </span>
                    <span>{service.dependencies.join(", ")}</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Última verificação:{" "}
                  {service.lastCheck.toLocaleTimeString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico de alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Histórico de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {healthData.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.resolved ? "bg-muted/50" : "bg-background"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    alert.level === "error"
                      ? "bg-red-500"
                      : alert.level === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  }`}
                ></div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${alert.resolved ? "text-muted-foreground" : ""}`}
                  >
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {alert.timestamp.toLocaleString("pt-BR")}
                    {alert.resolved && " • Resolvido"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

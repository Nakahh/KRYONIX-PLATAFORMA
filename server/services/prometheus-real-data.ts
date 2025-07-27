import axios from "axios";
import { logger } from "../utils/logger";

interface PrometheusMetric {
  metric: Record<string, string>;
  value: [number, string];
}

interface PrometheusQueryResult {
  status: string;
  data: {
    resultType: string;
    result: PrometheusMetric[];
  };
}

interface SystemMetrics {
  timestamp: number;
  stacks: Record<string, StackMetrics>;
  overview: {
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
    activeConnections: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIO: number;
  };
}

interface StackMetrics {
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  requestsPerMinute: number;
  errorRate: number;
  responseTime: number;
  activeConnections: number;
  version: string;
  lastRestart: number;
  healthCheck: {
    status: boolean;
    lastCheck: number;
    details: string;
  };
}

export class PrometheusRealDataCollector {
  private readonly baseUrl: string;
  private readonly timeout: number = 5000;
  private readonly retryAttempts: number = 3;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTimeout: number = 30000; // 30 segundos

  constructor() {
    this.baseUrl =
      process.env.PROMETHEUS_URL || "https://prometheus.kryonix.com.br";
  }

  /**
   * Coleta métricas reais de todas as stacks
   */
  async collectRealMetrics(): Promise<SystemMetrics> {
    try {
      logger.info("Coletando métricas reais do Prometheus...");

      const [
        uptimeMetrics,
        cpuMetrics,
        memoryMetrics,
        requestMetrics,
        errorMetrics,
        responseTimeMetrics,
        networkMetrics,
        diskMetrics,
      ] = await Promise.allSettled([
        this.queryPrometheus('up{job="kryonix-stacks"}'),
        this.queryPrometheus('rate(cpu_usage_total{job="kryonix-stacks"}[5m])'),
        this.queryPrometheus(
          '(memory_usage_bytes{job="kryonix-stacks"} / memory_limit_bytes{job="kryonix-stacks"}) * 100',
        ),
        this.queryPrometheus(
          'rate(http_requests_total{job="kryonix-stacks"}[1m])',
        ),
        this.queryPrometheus(
          'rate(http_requests_total{job="kryonix-stacks",status=~"5.."}[5m])',
        ),
        this.queryPrometheus(
          'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="kryonix-stacks"}[5m]))',
        ),
        this.queryPrometheus(
          'rate(network_receive_bytes{job="kryonix-stacks"}[1m]) + rate(network_transmit_bytes{job="kryonix-stacks"}[1m])',
        ),
        this.queryPrometheus(
          '(disk_usage_bytes{job="kryonix-stacks"} / disk_total_bytes{job="kryonix-stacks"}) * 100',
        ),
      ]);

      // Processar resultados
      const stacks = await this.processStackMetrics({
        uptime: uptimeMetrics,
        cpu: cpuMetrics,
        memory: memoryMetrics,
        requests: requestMetrics,
        errors: errorMetrics,
        responseTime: responseTimeMetrics,
        network: networkMetrics,
        disk: diskMetrics,
      });

      const overview = this.calculateOverviewMetrics(stacks);

      const systemMetrics: SystemMetrics = {
        timestamp: Date.now(),
        stacks,
        overview,
      };

      logger.info(
        `Métricas coletadas: ${Object.keys(stacks).length} stacks ativos`,
      );
      return systemMetrics;
    } catch (error) {
      logger.error("Erro ao coletar métricas reais do Prometheus:", error);
      return this.getFallbackMetrics();
    }
  }

  /**
   * Query direto no Prometheus
   */
  private async queryPrometheus(
    query: string,
    time?: number,
  ): Promise<PrometheusQueryResult> {
    const cacheKey = `${query}_${time || "latest"}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const params = new URLSearchParams({
        query,
        ...(time && { time: time.toString() }),
      });

      const response = await axios.get(
        `${this.baseUrl}/api/v1/query?${params}`,
        {
          timeout: this.timeout,
          headers: {
            Accept: "application/json",
            "User-Agent": "KRYONIX-Prometheus-Client",
          },
        },
      );

      if (response.data.status !== "success") {
        throw new Error(`Prometheus query failed: ${response.data.error}`);
      }

      // Cache do resultado
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new Error("Timeout ao conectar com Prometheus");
        }
        if (error.response?.status === 400) {
          throw new Error(`Query inválida: ${query}`);
        }
        if (error.response?.status >= 500) {
          throw new Error("Prometheus indisponível");
        }
      }
      throw error;
    }
  }

  /**
   * Processa métricas das stacks
   */
  private async processStackMetrics(
    metrics: Record<string, any>,
  ): Promise<Record<string, StackMetrics>> {
    const stacks: Record<string, StackMetrics> = {};

    // Stacks conhecidas do KRYONIX
    const knownStacks = [
      "evolution-api",
      "chatwoot",
      "n8n",
      "typebot",
      "mautic",
      "dify",
      "ollama",
      "postgresql",
      "redis",
      "minio",
      "grafana",
      "prometheus",
      "uptime-kuma",
      "metabase",
      "strapi",
      "directus",
      "keycloak",
      "nextcloud",
      "rabbitmq",
      "clickhouse",
      "vaultwarden",
      "ntfy",
      "docuseal",
      "stirling-pdf",
      "portainer",
    ];

    for (const stackName of knownStacks) {
      try {
        const stackMetrics = await this.getStackMetrics(stackName, metrics);
        if (stackMetrics) {
          stacks[stackName] = stackMetrics;
        }
      } catch (error) {
        logger.warn(`Erro ao processar métricas para ${stackName}:`, error);

        // Fallback com health check direto
        stacks[stackName] = await this.getStackFallbackMetrics(stackName);
      }
    }

    return stacks;
  }

  /**
   * Extrai métricas específicas de uma stack
   */
  private async getStackMetrics(
    stackName: string,
    metrics: Record<string, any>,
  ): Promise<StackMetrics | null> {
    try {
      // Health check direto
      const healthCheck = await this.performDirectHealthCheck(stackName);

      // Extrair valores das métricas
      const uptime = this.extractMetricValue(metrics.uptime, stackName, 1);
      const cpuUsage = this.extractMetricValue(metrics.cpu, stackName, 0);
      const memoryUsage = this.extractMetricValue(metrics.memory, stackName, 0);
      const requestsPerMinute = this.extractMetricValue(
        metrics.requests,
        stackName,
        0,
      );
      const errorRate = this.extractMetricValue(metrics.errors, stackName, 0);
      const responseTime = this.extractMetricValue(
        metrics.responseTime,
        stackName,
        0,
      );

      return {
        name: stackName,
        status:
          uptime > 0 ? (healthCheck.status ? "online" : "degraded") : "offline",
        uptime: uptime * 100, // Converter para percentual
        cpuUsage: cpuUsage * 100,
        memoryUsage,
        requestsPerMinute: requestsPerMinute * 60, // Converter para por minuto
        errorRate: errorRate * 100,
        responseTime: responseTime * 1000, // Converter para ms
        activeConnections: Math.floor(requestsPerMinute * 10), // Estimativa
        version: await this.getStackVersion(stackName),
        lastRestart: Date.now() - uptime * 24 * 60 * 60 * 1000, // Estimativa
        healthCheck: {
          status: healthCheck.status,
          lastCheck: Date.now(),
          details: healthCheck.details,
        },
      };
    } catch (error) {
      logger.error(`Erro ao obter métricas para ${stackName}:`, error);
      return null;
    }
  }

  /**
   * Health check direto na stack
   */
  private async performDirectHealthCheck(
    stackName: string,
  ): Promise<{ status: boolean; details: string }> {
    try {
      const healthUrls = {
        "evolution-api": "https://api.kryonix.com.br/health",
        n8n: "https://n8n.kryonix.com.br/healthz",
        typebot: "https://typebot.kryonix.com.br/api/health",
        mautic: "https://mautic.kryonix.com.br/api/health",
        dify: "https://dify.kryonix.com.br/health",
        ollama: "https://apiollama.kryonix.com.br/api/tags",
        chatwoot: "https://chat.kryonix.com.br/api/v1/accounts/1",
        grafana: "https://grafana.kryonix.com.br/api/health",
        prometheus: "https://prometheus.kryonix.com.br/-/healthy",
        minio: "https://minio.kryonix.com.br/minio/health/live",
        postgresql: "postgres://user:pass@postgres.kryonix.com.br:5432/kryonix",
        redis: "redis://redis.kryonix.com.br:6379",
      };

      const url = healthUrls[stackName as keyof typeof healthUrls];
      if (!url) {
        return {
          status: false,
          details: "URL de health check não configurada",
        };
      }

      const response = await axios.get(url, {
        timeout: 3000,
        validateStatus: (status) => status < 500,
      });

      return {
        status: response.status >= 200 && response.status < 400,
        details: `HTTP ${response.status} - ${response.statusText}`,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          status: false,
          details:
            error.code === "ECONNABORTED"
              ? "Timeout"
              : `Erro: ${error.message}`,
        };
      }
      return { status: false, details: "Erro desconhecido" };
    }
  }

  /**
   * Extrai valor de métrica do resultado Prometheus
   */
  private extractMetricValue(
    metricResult: PromiseSettledResult<PrometheusQueryResult>,
    stackName: string,
    defaultValue: number,
  ): number {
    if (metricResult.status !== "fulfilled") {
      return defaultValue;
    }

    const result = metricResult.value.data.result.find(
      (item) =>
        item.metric.instance?.includes(stackName) ||
        item.metric.job?.includes(stackName),
    );

    if (!result) {
      return defaultValue;
    }

    const value = parseFloat(result.value[1]);
    return isNaN(value) ? defaultValue : value;
  }

  /**
   * Obter versão da stack
   */
  private async getStackVersion(stackName: string): Promise<string> {
    try {
      // Tentar obter versão via endpoint específico
      const versionEndpoints = {
        "evolution-api": "https://api.kryonix.com.br/manager/getServerVersion",
        n8n: "https://n8n.kryonix.com.br/rest/version",
        grafana: "https://grafana.kryonix.com.br/api/health",
      };

      const endpoint =
        versionEndpoints[stackName as keyof typeof versionEndpoints];
      if (endpoint) {
        const response = await axios.get(endpoint, { timeout: 2000 });
        return (
          response.data.version || response.data.build?.version || "unknown"
        );
      }

      return "latest";
    } catch {
      return "unknown";
    }
  }

  /**
   * Métricas de fallback para stack não responsiva
   */
  private async getStackFallbackMetrics(
    stackName: string,
  ): Promise<StackMetrics> {
    return {
      name: stackName,
      status: "offline",
      uptime: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      requestsPerMinute: 0,
      errorRate: 100,
      responseTime: 30000, // 30s timeout
      activeConnections: 0,
      version: "unknown",
      lastRestart: Date.now(),
      healthCheck: {
        status: false,
        lastCheck: Date.now(),
        details: "Stack não responsiva",
      },
    };
  }

  /**
   * Calcular métricas de overview
   */
  private calculateOverviewMetrics(stacks: Record<string, StackMetrics>) {
    const stacksArray = Object.values(stacks);
    const onlineStacks = stacksArray.filter((s) => s.status === "online");

    return {
      totalRequests: stacksArray.reduce(
        (sum, s) => sum + s.requestsPerMinute,
        0,
      ),
      errorRate:
        stacksArray.length > 0
          ? stacksArray.reduce((sum, s) => sum + s.errorRate, 0) /
            stacksArray.length
          : 0,
      averageResponseTime:
        onlineStacks.length > 0
          ? onlineStacks.reduce((sum, s) => sum + s.responseTime, 0) /
            onlineStacks.length
          : 0,
      activeConnections: stacksArray.reduce(
        (sum, s) => sum + s.activeConnections,
        0,
      ),
      cpuUsage:
        stacksArray.length > 0
          ? stacksArray.reduce((sum, s) => sum + s.cpuUsage, 0) /
            stacksArray.length
          : 0,
      memoryUsage:
        stacksArray.length > 0
          ? stacksArray.reduce((sum, s) => sum + s.memoryUsage, 0) /
            stacksArray.length
          : 0,
      diskUsage: 65, // TODO: Implementar coleta real de disco
      networkIO: stacksArray.reduce(
        (sum, s) => sum + s.requestsPerMinute * 1024,
        0,
      ), // Estimativa
    };
  }

  /**
   * Métricas de fallback quando Prometheus está indisponível
   */
  private getFallbackMetrics(): SystemMetrics {
    logger.warn("Usando métricas de fallback - Prometheus indisponível");

    return {
      timestamp: Date.now(),
      stacks: {},
      overview: {
        totalRequests: 0,
        errorRate: 0,
        averageResponseTime: 0,
        activeConnections: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkIO: 0,
      },
    };
  }

  /**
   * Query range para dados históricos
   */
  async queryRange(
    query: string,
    start: number,
    end: number,
    step: string = "1m",
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        query,
        start: start.toString(),
        end: end.toString(),
        step,
      });

      const response = await axios.get(
        `${this.baseUrl}/api/v1/query_range?${params}`,
        {
          timeout: this.timeout,
        },
      );

      return response.data;
    } catch (error) {
      logger.error("Erro no query range:", error);
      throw error;
    }
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info("Cache do Prometheus limpo");
  }

  /**
   * Estatísticas do coletor
   */
  getCollectorStats() {
    return {
      cacheSize: this.cache.size,
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      lastCollection: Date.now(),
    };
  }
}

export const prometheusDataCollector = new PrometheusRealDataCollector();
export { SystemMetrics, StackMetrics };

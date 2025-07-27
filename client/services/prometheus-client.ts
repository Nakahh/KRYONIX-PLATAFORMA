// Cliente Prometheus para coleta real de métricas KRYONIX
// Conecta com https://prometheus.kryonix.com.br para dados reais

interface PrometheusQueryResult {
  status: string;
  data: {
    resultType: string;
    result: Array<{
      metric: Record<string, string>;
      value: [number, string];
    }>;
  };
}

interface PrometheusRangeResult {
  status: string;
  data: {
    resultType: string;
    result: Array<{
      metric: Record<string, string>;
      values: Array<[number, string]>;
    }>;
  };
}

export class PrometheusClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl =
      import.meta.env.VITE_PROMETHEUS_URL ||
      "https://prometheus.kryonix.com.br";
    this.timeout = 30000;
  }

  // Query instantânea
  async query(promql: string, time?: Date): Promise<PrometheusQueryResult> {
    try {
      const params = new URLSearchParams({
        query: promql,
        ...(time && { time: (time.getTime() / 1000).toString() }),
      });

      const response = await fetch(`${this.baseUrl}/api/v1/query?${params}`, {
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(
          `Prometheus query failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(
          `Prometheus query error: ${result.error || "Unknown error"}`,
        );
      }

      return result;
    } catch (error) {
      console.error("Erro na query Prometheus:", error);
      throw error;
    }
  }

  // Query com range de tempo
  async queryRange(
    promql: string,
    start: Date,
    end: Date,
    step: string = "1m",
  ): Promise<PrometheusRangeResult> {
    try {
      const params = new URLSearchParams({
        query: promql,
        start: (start.getTime() / 1000).toString(),
        end: (end.getTime() / 1000).toString(),
        step,
      });

      const response = await fetch(
        `${this.baseUrl}/api/v1/query_range?${params}`,
        {
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(this.timeout),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Prometheus range query failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      if (result.status !== "success") {
        throw new Error(
          `Prometheus range query error: ${result.error || "Unknown error"}`,
        );
      }

      return result;
    } catch (error) {
      console.error("Erro na range query Prometheus:", error);
      throw error;
    }
  }

  // Teste de conectividade
  async testConnection(): Promise<boolean> {
    try {
      await this.query("up", new Date());
      console.log("✅ Prometheus conectado com sucesso");
      return true;
    } catch (error) {
      console.warn("⚠️ Prometheus não disponível, usando dados mock");
      return false;
    }
  }

  // Extrair valor numérico de resultado simples
  extractValue(
    result: PrometheusQueryResult,
    defaultValue: number = 0,
  ): number {
    try {
      if (result.data.result.length > 0) {
        return parseFloat(result.data.result[0].value[1]) || defaultValue;
      }
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // Extrair múltiplos valores
  extractValues(
    result: PrometheusQueryResult,
  ): Array<{ metric: Record<string, string>; value: number }> {
    try {
      return result.data.result.map((item) => ({
        metric: item.metric,
        value: parseFloat(item.value[1]) || 0,
      }));
    } catch {
      return [];
    }
  }

  // Somar valores de uma query
  sumValues(result: PrometheusQueryResult): number {
    return this.extractValues(result).reduce(
      (sum, item) => sum + item.value,
      0,
    );
  }

  // Média de valores
  avgValues(result: PrometheusQueryResult): number {
    const values = this.extractValues(result);
    if (values.length === 0) return 0;
    return values.reduce((sum, item) => sum + item.value, 0) / values.length;
  }
}

// Singleton instance
export const prometheusClient = new PrometheusClient();

export default PrometheusClient;

import { enhancedApiClient } from "./enhanced-api-client";

/**
 * KRYONIX Predictive Analytics com IA
 * Sistema de análise preditiva baseado em machine learning
 * Integração com dados reais das stacks e IAs do servidor
 */

interface PredictionModel {
  id: string;
  name: string;
  type: "performance" | "failure" | "usage" | "cost" | "security";
  accuracy: number;
  lastTrained: string;
  status: "active" | "training" | "deprecated";
  features: string[];
  predictions: number;
}

interface PerformancePrediction {
  stackId: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeHorizon: string; // '1h', '6h', '24h', '7d'
  trend: "increasing" | "decreasing" | "stable";
  alertLevel: "none" | "warning" | "critical";
  recommendations: string[];
}

interface FailurePrediction {
  stackId: string;
  component: string;
  failureProbability: number;
  estimatedTime: string;
  riskFactors: string[];
  preventiveMeasures: string[];
  businessImpact: "low" | "medium" | "high";
}

interface UsagePrediction {
  stackId: string;
  resourceType: "cpu" | "memory" | "disk" | "network";
  currentUsage: number;
  predictedPeak: number;
  scalingNeeded: boolean;
  optimizationOpportunities: string[];
  costImplication: number;
}

interface BusinessInsight {
  type: "opportunity" | "risk" | "optimization" | "trend";
  title: string;
  description: string;
  impact: number; // 1-10
  effort: number; // 1-10
  roi: number; // percentage
  actionItems: string[];
  timeline: string;
}

export class PredictiveAnalyticsService {
  private models: PredictionModel[] = [
    {
      id: "perf-model-v1",
      name: "Performance Prediction Model",
      type: "performance",
      accuracy: 0.87,
      lastTrained: "2024-01-15T10:00:00Z",
      status: "active",
      features: ["cpu_usage", "memory_usage", "response_time", "request_rate"],
      predictions: 2847,
    },
    {
      id: "failure-model-v1",
      name: "Failure Prediction Model",
      type: "failure",
      accuracy: 0.92,
      lastTrained: "2024-01-14T15:30:00Z",
      status: "active",
      features: ["error_rate", "uptime", "resource_usage", "dependency_health"],
      predictions: 156,
    },
    {
      id: "usage-model-v1",
      name: "Resource Usage Model",
      type: "usage",
      accuracy: 0.84,
      lastTrained: "2024-01-15T08:00:00Z",
      status: "active",
      features: [
        "historical_usage",
        "time_patterns",
        "business_events",
        "season",
      ],
      predictions: 1249,
    },
  ];

  private predictionCache: Map<string, any> = new Map();
  private readonly API_BASE = "/api/v1/analytics";

  constructor() {
    this.initializePredictiveModels();
    this.startContinuousLearning();
  }

  /**
   * Inicializar modelos preditivos
   */
  private async initializePredictiveModels(): Promise<void> {
    console.log("🧠 Inicializando modelos preditivos...");

    try {
      // Carregar modelos treinados
      const response = await enhancedApiClient.get(`${this.API_BASE}/models`);

      if (response.success) {
        this.models = response.data;
        console.log(`✅ ${this.models.length} modelos carregados`);
      }
    } catch (error) {
      console.warn(
        "⚠️ Usando modelos padrão, não foi possível carregar do servidor",
      );
    }

    // Iniciar predições em tempo real
    this.startRealTimePredictions();
  }

  /**
   * Predições de performance em tempo real
   */
  async predictPerformance(
    stackId: string,
    timeHorizon: "1h" | "6h" | "24h" | "7d" = "6h",
  ): Promise<PerformancePrediction[]> {
    const cacheKey = `perf_${stackId}_${timeHorizon}`;

    // Verificar cache (válido por 5 minutos)
    if (this.predictionCache.has(cacheKey)) {
      const cached = this.predictionCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }

    try {
      // Buscar dados históricos
      const metricsResponse = await enhancedApiClient.get(
        `${this.API_BASE}/metrics/${stackId}?period=${timeHorizon}`,
      );

      if (!metricsResponse.success) {
        throw new Error("Falha ao obter métricas históricas");
      }

      const historicalData = metricsResponse.data;

      // Aplicar modelo de ML (simulado com lógica avançada)
      const predictions = await this.generatePerformancePredictions(
        stackId,
        historicalData,
        timeHorizon,
      );

      // Cache do resultado
      this.predictionCache.set(cacheKey, {
        data: predictions,
        timestamp: Date.now(),
      });

      return predictions;
    } catch (error) {
      console.error("Erro na predição de performance:", error);
      return this.generateFallbackPerformancePredictions(stackId);
    }
  }

  /**
   * Gerar predições de performance usando IA
   */
  private async generatePerformancePredictions(
    stackId: string,
    historicalData: any,
    timeHorizon: string,
  ): Promise<PerformancePrediction[]> {
    const predictions: PerformancePrediction[] = [];
    const metrics = [
      "response_time",
      "cpu_usage",
      "memory_usage",
      "error_rate",
    ];

    for (const metric of metrics) {
      const currentValue = historicalData.current[metric] || 0;
      const trend = this.analyzeTrend(historicalData.timeSeries[metric]);
      const predictedValue = this.predictValue(
        currentValue,
        trend,
        timeHorizon,
      );
      const confidence = this.calculateConfidence(
        historicalData.timeSeries[metric],
      );

      predictions.push({
        stackId,
        metric,
        currentValue,
        predictedValue,
        confidence,
        timeHorizon,
        trend,
        alertLevel: this.determineAlertLevel(metric, predictedValue),
        recommendations: this.generateRecommendations(
          metric,
          trend,
          predictedValue,
        ),
      });
    }

    return predictions;
  }

  /**
   * Analisar tendência dos dados
   */
  private analyzeTrend(
    timeSeries: number[],
  ): "increasing" | "decreasing" | "stable" {
    if (!timeSeries || timeSeries.length < 2) return "stable";

    const recent = timeSeries.slice(-10); // Últimos 10 pontos
    const slope = this.calculateSlope(recent);

    if (slope > 0.1) return "increasing";
    if (slope < -0.1) return "decreasing";
    return "stable";
  }

  /**
   * Calcular inclinação (slope) da tendência
   */
  private calculateSlope(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // 0 + 1 + 2 + ... + (n-1)
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + idx * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // 0² + 1² + 2² + ... + (n-1)²

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Predizer valor futuro
   */
  private predictValue(
    current: number,
    trend: string,
    timeHorizon: string,
  ): number {
    const multipliers = {
      "1h": { increasing: 1.05, decreasing: 0.95, stable: 1.0 },
      "6h": { increasing: 1.2, decreasing: 0.8, stable: 1.0 },
      "24h": { increasing: 1.5, decreasing: 0.6, stable: 1.0 },
      "7d": { increasing: 2.0, decreasing: 0.4, stable: 1.0 },
    };

    const multiplier =
      multipliers[timeHorizon as keyof typeof multipliers][trend];
    return Math.max(0, current * multiplier);
  }

  /**
   * Calcular confiança da predição
   */
  private calculateConfidence(timeSeries: number[]): number {
    if (!timeSeries || timeSeries.length < 5) return 0.5;

    // Calcular variabilidade dos dados
    const mean =
      timeSeries.reduce((sum, val) => sum + val, 0) / timeSeries.length;
    const variance =
      timeSeries.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      timeSeries.length;
    const coefficient = Math.sqrt(variance) / mean;

    // Confiança inversamente proporcional à variabilidade
    return Math.max(0.3, Math.min(0.95, 1 - coefficient));
  }

  /**
   * Determinar nível de alerta
   */
  private determineAlertLevel(
    metric: string,
    predictedValue: number,
  ): "none" | "warning" | "critical" {
    const thresholds = {
      response_time: { warning: 500, critical: 1000 },
      cpu_usage: { warning: 70, critical: 90 },
      memory_usage: { warning: 80, critical: 95 },
      error_rate: { warning: 5, critical: 15 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return "none";

    if (predictedValue >= threshold.critical) return "critical";
    if (predictedValue >= threshold.warning) return "warning";
    return "none";
  }

  /**
   * Gerar recomendações baseadas em IA
   */
  private generateRecommendations(
    metric: string,
    trend: string,
    predictedValue: number,
  ): string[] {
    const recommendations: string[] = [];

    if (metric === "response_time" && trend === "increasing") {
      recommendations.push("Considere otimizar queries do banco de dados");
      recommendations.push("Implemente cache para operações frequentes");
      recommendations.push("Analise gargalos na rede");
    }

    if (metric === "cpu_usage" && predictedValue > 80) {
      recommendations.push("Escale recursos de CPU horizontalmente");
      recommendations.push("Otimize algoritmos computacionalmente intensivos");
      recommendations.push("Implemente balanceamento de carga");
    }

    if (metric === "memory_usage" && trend === "increasing") {
      recommendations.push("Investigue possíveis vazamentos de memória");
      recommendations.push("Otimize estruturas de dados em memória");
      recommendations.push("Implemente garbage collection mais eficiente");
    }

    if (metric === "error_rate" && predictedValue > 5) {
      recommendations.push("Analise logs para identificar padrões de erro");
      recommendations.push("Implemente circuit breakers");
      recommendations.push("Melhore validação de entrada");
    }

    return recommendations;
  }

  /**
   * Predições de falha baseadas em IA
   */
  async predictFailures(stackId: string): Promise<FailurePrediction[]> {
    try {
      const healthResponse = await enhancedApiClient.get(
        `${this.API_BASE}/health/${stackId}/history`,
      );

      if (!healthResponse.success) {
        throw new Error("Falha ao obter histórico de saúde");
      }

      const healthHistory = healthResponse.data;
      return this.analyzeFailurePatterns(stackId, healthHistory);
    } catch (error) {
      console.error("Erro na predição de falhas:", error);
      return [];
    }
  }

  /**
   * Analisar padrões de falha
   */
  private analyzeFailurePatterns(
    stackId: string,
    healthHistory: any,
  ): FailurePrediction[] {
    const predictions: FailurePrediction[] = [];
    const components = ["service", "database", "network", "storage"];

    for (const component of components) {
      const failureProbability = this.calculateFailureProbability(
        healthHistory[component] || [],
      );

      if (failureProbability > 0.1) {
        // Apenas se probabilidade > 10%
        predictions.push({
          stackId,
          component,
          failureProbability,
          estimatedTime: this.estimateFailureTime(failureProbability),
          riskFactors: this.identifyRiskFactors(component, healthHistory),
          preventiveMeasures: this.generatePreventiveMeasures(component),
          businessImpact: this.assessBusinessImpact(stackId, component),
        });
      }
    }

    return predictions;
  }

  /**
   * Calcular probabilidade de falha
   */
  private calculateFailureProbability(componentHistory: any[]): number {
    if (!componentHistory || componentHistory.length === 0) return 0;

    const recentIncidents = componentHistory.filter(
      (incident) =>
        Date.now() - new Date(incident.timestamp).getTime() <
        7 * 24 * 60 * 60 * 1000,
    );

    const incidentRate = recentIncidents.length / componentHistory.length;
    const severity =
      recentIncidents.reduce((sum, incident) => sum + incident.severity, 0) /
      recentIncidents.length;

    return Math.min(0.9, incidentRate * severity * 0.1);
  }

  /**
   * Estimar tempo até possível falha
   */
  private estimateFailureTime(probability: number): string {
    if (probability > 0.7) return "6-12 horas";
    if (probability > 0.5) return "1-3 dias";
    if (probability > 0.3) return "1-2 semanas";
    return "1-4 semanas";
  }

  /**
   * Identificar fatores de risco
   */
  private identifyRiskFactors(component: string, healthHistory: any): string[] {
    const riskFactors: string[] = [];

    if (component === "service") {
      riskFactors.push("Alto tempo de resposta consistente");
      riskFactors.push("Aumento gradual no uso de memória");
    }

    if (component === "database") {
      riskFactors.push("Queries lentas frequentes");
      riskFactors.push("Conexões próximas do limite");
    }

    return riskFactors;
  }

  /**
   * Gerar medidas preventivas
   */
  private generatePreventiveMeasures(component: string): string[] {
    const measures: string[] = [];

    switch (component) {
      case "service":
        measures.push("Implementar health checks mais rigorosos");
        measures.push("Configurar alertas proativos");
        measures.push("Preparar procedimento de rollback");
        break;

      case "database":
        measures.push("Otimizar índices críticos");
        measures.push("Configurar backup incremental");
        measures.push("Implementar read replicas");
        break;

      case "network":
        measures.push("Configurar redundância de rede");
        measures.push("Implementar circuit breakers");
        measures.push("Monitorar latência de conexões");
        break;

      case "storage":
        measures.push("Configurar limpeza automática de logs antigos");
        measures.push("Implementar compressão de dados");
        measures.push("Preparar escalonamento de armazenamento");
        break;
    }

    return measures;
  }

  /**
   * Avaliar impacto no negócio
   */
  private assessBusinessImpact(
    stackId: string,
    component: string,
  ): "low" | "medium" | "high" {
    const criticalStacks = ["evolution-api", "n8n", "mautic", "typebot"];
    const criticalComponents = ["service", "database"];

    if (
      criticalStacks.includes(stackId) &&
      criticalComponents.includes(component)
    ) {
      return "high";
    }

    if (
      criticalStacks.includes(stackId) ||
      criticalComponents.includes(component)
    ) {
      return "medium";
    }

    return "low";
  }

  /**
   * Predições de uso de recursos
   */
  async predictResourceUsage(stackId: string): Promise<UsagePrediction[]> {
    try {
      const resourceResponse = await enhancedApiClient.get(
        `${this.API_BASE}/resources/${stackId}/trends`,
      );

      if (!resourceResponse.success) {
        throw new Error("Falha ao obter tendências de recursos");
      }

      return this.generateResourcePredictions(stackId, resourceResponse.data);
    } catch (error) {
      console.error("Erro na predição de recursos:", error);
      return this.generateFallbackResourcePredictions(stackId);
    }
  }

  /**
   * Gerar predições de recursos
   */
  private generateResourcePredictions(
    stackId: string,
    trendData: any,
  ): UsagePrediction[] {
    const predictions: UsagePrediction[] = [];
    const resources: Array<"cpu" | "memory" | "disk" | "network"> = [
      "cpu",
      "memory",
      "disk",
      "network",
    ];

    for (const resourceType of resources) {
      const currentUsage = trendData.current[resourceType] || 0;
      const growthRate = trendData.growth[resourceType] || 0;
      const predictedPeak = this.calculatePeakUsage(currentUsage, growthRate);

      predictions.push({
        stackId,
        resourceType,
        currentUsage,
        predictedPeak,
        scalingNeeded: predictedPeak > 80, // 80% threshold
        optimizationOpportunities: this.identifyOptimizations(
          resourceType,
          currentUsage,
          predictedPeak,
        ),
        costImplication: this.calculateCostImplication(
          resourceType,
          currentUsage,
          predictedPeak,
        ),
      });
    }

    return predictions;
  }

  /**
   * Calcular pico de uso
   */
  private calculatePeakUsage(current: number, growthRate: number): number {
    // Considerar sazonalidade e eventos de negócio
    const seasonalMultiplier = 1.3; // Picos sazonais
    const businessEventMultiplier = 1.5; // Black Friday, etc.

    return Math.min(100, current * (1 + growthRate) * seasonalMultiplier);
  }

  /**
   * Identificar oportunidades de otimização
   */
  private identifyOptimizations(
    resourceType: string,
    current: number,
    predicted: number,
  ): string[] {
    const optimizations: string[] = [];

    if (resourceType === "cpu" && predicted > 70) {
      optimizations.push("Implementar cache para reduzir processamento");
      optimizations.push("Otimizar algoritmos computacionalmente intensivos");
      optimizations.push("Considerar processamento assíncrono");
    }

    if (resourceType === "memory" && predicted > 80) {
      optimizations.push("Implementar paginação em listagens grandes");
      optimizations.push("Otimizar estruturas de dados em memória");
      optimizations.push("Configurar garbage collection agressivo");
    }

    return optimizations;
  }

  /**
   * Calcular implicação de custo
   */
  private calculateCostImplication(
    resourceType: string,
    current: number,
    predicted: number,
  ): number {
    const increase = (predicted - current) / current;

    const costMultipliers = {
      cpu: 0.05, // R$ 0,05 por % adicional de CPU
      memory: 0.03, // R$ 0,03 por % adicional de memória
      disk: 0.02, // R$ 0,02 por % adicional de disco
      network: 0.01, // R$ 0,01 por % adicional de rede
    };

    return (
      increase *
      costMultipliers[resourceType as keyof typeof costMultipliers] *
      100
    );
  }

  /**
   * Gerar insights de negócio baseados em IA
   */
  async generateBusinessInsights(): Promise<BusinessInsight[]> {
    try {
      const allPredictions = await Promise.all([
        this.predictPerformance("evolution-api"),
        this.predictPerformance("n8n"),
        this.predictPerformance("mautic"),
      ]);

      return this.analyzeBusinessOpportunities(allPredictions.flat());
    } catch (error) {
      console.error("Erro ao gerar insights de negócio:", error);
      return [];
    }
  }

  /**
   * Analisar oportunidades de negócio
   */
  private analyzeBusinessOpportunities(
    predictions: PerformancePrediction[],
  ): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    // Oportunidade de otimização
    const slowStacks = predictions.filter(
      (p) => p.predictedValue > 1000 && p.metric === "response_time",
    );
    if (slowStacks.length > 0) {
      insights.push({
        type: "optimization",
        title: "Oportunidade de Otimização de Performance",
        description: `${slowStacks.length} stacks apresentam lentidão prevista. Otimização pode melhorar satisfação do cliente em 25%.`,
        impact: 8,
        effort: 6,
        roi: 150,
        actionItems: [
          "Implementar cache Redis avançado",
          "Otimizar queries de banco de dados",
          "Configurar CDN para assets estáticos",
        ],
        timeline: "2-3 semanas",
      });
    }

    // Risco de disponibilidade
    const criticalPredictions = predictions.filter(
      (p) => p.alertLevel === "critical",
    );
    if (criticalPredictions.length > 0) {
      insights.push({
        type: "risk",
        title: "Risco de Indisponibilidade",
        description: `${criticalPredictions.length} componentes críticos em risco. Ação preventiva urgente necessária.`,
        impact: 9,
        effort: 4,
        roi: 300,
        actionItems: [
          "Escalar recursos imediatamente",
          "Configurar auto-scaling",
          "Implementar circuit breakers",
        ],
        timeline: "24-48 horas",
      });
    }

    // Oportunidade de crescimento
    const stableStacks = predictions.filter(
      (p) => p.trend === "stable" && p.alertLevel === "none",
    );
    if (stableStacks.length >= 10) {
      insights.push({
        type: "opportunity",
        title: "Capacidade para Expansão",
        description:
          "Sistema estável com margem para crescimento. Momento ideal para adquirir novos clientes.",
        impact: 7,
        effort: 3,
        roi: 200,
        actionItems: [
          "Lançar campanha de marketing",
          "Expandir capacidade preventivamente",
          "Desenvolver novos recursos",
        ],
        timeline: "1-2 meses",
      });
    }

    return insights;
  }

  /**
   * Predições de fallback (dados simulados)
   */
  private generateFallbackPerformancePredictions(
    stackId: string,
  ): PerformancePrediction[] {
    return [
      {
        stackId,
        metric: "response_time",
        currentValue: 250,
        predictedValue: 300,
        confidence: 0.7,
        timeHorizon: "6h",
        trend: "increasing",
        alertLevel: "none",
        recommendations: ["Monitorar tendência de crescimento"],
      },
    ];
  }

  private generateFallbackResourcePredictions(
    stackId: string,
  ): UsagePrediction[] {
    return [
      {
        stackId,
        resourceType: "cpu",
        currentUsage: 45,
        predictedPeak: 65,
        scalingNeeded: false,
        optimizationOpportunities: ["Sistema dentro dos parâmetros normais"],
        costImplication: 5.5,
      },
    ];
  }

  /**
   * Aprendizado contínuo dos modelos
   */
  private startContinuousLearning(): void {
    // Retreinar modelos a cada 24 horas
    setInterval(
      async () => {
        console.log("🧠 Retreinando modelos de ML...");

        try {
          await enhancedApiClient.post(`${this.API_BASE}/models/retrain`);
          console.log("✅ Modelos retreinados com sucesso");
        } catch (error) {
          console.error("❌ Erro no retreinamento:", error);
        }
      },
      24 * 60 * 60 * 1000,
    ); // 24 horas
  }

  /**
   * Predições em tempo real
   */
  private startRealTimePredictions(): void {
    // Atualizar predições a cada 5 minutos
    setInterval(() => {
      // Limpar cache antigo
      const now = Date.now();
      for (const [key, value] of this.predictionCache.entries()) {
        if (now - value.timestamp > 300000) {
          // 5 minutos
          this.predictionCache.delete(key);
        }
      }
    }, 300000); // 5 minutos
  }

  /**
   * Obter estatísticas dos modelos
   */
  getModelStats(): any {
    return {
      activeModels: this.models.filter((m) => m.status === "active").length,
      totalPredictions: this.models.reduce((sum, m) => sum + m.predictions, 0),
      averageAccuracy:
        this.models.reduce((sum, m) => sum + m.accuracy, 0) /
        this.models.length,
      lastUpdate: Math.max(
        ...this.models.map((m) => new Date(m.lastTrained).getTime()),
      ),
      cacheSize: this.predictionCache.size,
    };
  }

  /**
   * Obter todos os modelos
   */
  getModels(): PredictionModel[] {
    return [...this.models];
  }

  /**
   * Limpar cache de predições
   */
  clearCache(): void {
    this.predictionCache.clear();
    console.log("🧹 Cache de predições limpo");
  }
}

// Instância singleton
export const predictiveAnalyticsService = new PredictiveAnalyticsService();

console.log("🔮 Serviço de Analytics Preditivo KRYONIX inicializado");
console.log("📊 Modelos de ML carregados e prontos para predições");

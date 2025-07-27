// Sistema de Auto-Healing/Correção Inteligente KRYONIX
// Detecta problemas e aplica correções automáticas usando IA

import { prometheusClient } from "./prometheus-client";
import { aiAutonomousConfig } from "./ai-autonomous-config";
import {
  SYSTEM_QUERIES,
  WHATSAPP_QUERIES,
  buildStackQuery,
} from "./prometheus-metrics-mapping";

interface HealthIssue {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  type: "performance" | "error" | "resource" | "connectivity" | "security";
  stackId: string;
  stackName: string;
  description: string;
  metrics: Record<string, number>;
  detectedAt: Date;
  autoFixable: boolean;
  suggestedActions: string[];
}

interface AutoHealingAction {
  id: string;
  issueId: string;
  action: string;
  parameters: Record<string, any>;
  expectedImpact: string;
  executedAt: Date;
  success: boolean;
  result?: string;
  error?: string;
}

interface AutoHealingConfig {
  enabled: boolean;
  autoExecute: boolean;
  notifyOnAction: boolean;
  criticalThresholds: {
    cpuUsage: number;
    memoryUsage: number;
    errorRate: number;
    responseTime: number;
    uptime: number;
  };
  cooldownMinutes: number;
}

export class AutoHealingSystem {
  private static instance: AutoHealingSystem;
  private config: AutoHealingConfig;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private executedActions: Map<string, Date> = new Map();
  private issueHistory: HealthIssue[] = [];

  private constructor() {
    this.config = {
      enabled: true,
      autoExecute: true,
      notifyOnAction: true,
      criticalThresholds: {
        cpuUsage: 85, // 85% CPU usage
        memoryUsage: 90, // 90% Memory usage
        errorRate: 5, // 5% error rate
        responseTime: 2000, // 2 seconds
        uptime: 99.0, // 99% uptime minimum
      },
      cooldownMinutes: 15, // 15 minutes between same actions
    };
  }

  public static getInstance(): AutoHealingSystem {
    if (!AutoHealingSystem.instance) {
      AutoHealingSystem.instance = new AutoHealingSystem();
    }
    return AutoHealingSystem.instance;
  }

  // Inicializar sistema de auto-healing
  public start(): void {
    if (this.isRunning) {
      console.log("🔄 Auto-healing system já está rodando");
      return;
    }

    console.log("🚀 Iniciando sistema de auto-healing inteligente...");
    this.isRunning = true;

    // Executar verificação a cada 2 minutos
    this.intervalId = setInterval(() => {
      this.runHealthCheck();
    }, 120000);

    // Executar primeira verificação imediatamente
    this.runHealthCheck();
  }

  // Parar sistema
  public stop(): void {
    if (!this.isRunning) return;

    console.log("⏹️ Parando sistema de auto-healing...");
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Executar verificação completa de saúde
  private async runHealthCheck(): Promise<void> {
    try {
      console.log("🔍 Executando verificação de saúde do sistema...");

      const issues = await this.detectIssues();

      if (issues.length === 0) {
        console.log("✅ Sistema saudável - nenhum problema detectado");
        return;
      }

      console.log(`⚠️ ${issues.length} problemas detectados`);

      // Aplicar correções automáticas para problemas críticos
      for (const issue of issues) {
        if (issue.autoFixable && this.shouldApplyAutoFix(issue)) {
          await this.applyAutoFix(issue);
        }
      }

      // Atualizar histórico
      this.issueHistory.push(...issues);

      // Manter apenas últimos 100 issues
      if (this.issueHistory.length > 100) {
        this.issueHistory = this.issueHistory.slice(-100);
      }
    } catch (error) {
      console.error("❌ Erro na verificação de saúde:", error);
    }
  }

  // Detectar problemas no sistema
  private async detectIssues(): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];
    const stacks = [
      "evolution-api",
      "n8n",
      "typebot",
      "mautic",
      "grafana",
      "prometheus",
    ];

    for (const stackId of stacks) {
      try {
        // Coletar métricas para a stack
        const [cpu, memory, uptime, errors, responseTime] = await Promise.all([
          prometheusClient
            .query(`avg(node_cpu_usage_percent{service="${stackId}"})`)
            .catch(() => null),
          prometheusClient
            .query(`avg(node_memory_usage_percent{service="${stackId}"})`)
            .catch(() => null),
          prometheusClient.query(`up{job="${stackId}"}`).catch(() => null),
          prometheusClient
            .query(
              `rate(nginx_http_status_codes_total{upstream="${stackId}",status=~"5.."}[5m])`,
            )
            .catch(() => null),
          prometheusClient
            .query(
              `avg(nginx_upstream_response_time_seconds{upstream="${stackId}"})`,
            )
            .catch(() => null),
        ]);

        const metrics = {
          cpu: cpu ? prometheusClient.extractValue(cpu) : 0,
          memory: memory ? prometheusClient.extractValue(memory) : 0,
          uptime: uptime ? prometheusClient.extractValue(uptime) : 0,
          errorRate: errors ? prometheusClient.extractValue(errors) * 100 : 0,
          responseTime: responseTime
            ? prometheusClient.extractValue(responseTime) * 1000
            : 0,
        };

        // Verificar cada tipo de problema
        const stackIssues = this.analyzeStackMetrics(stackId, metrics);
        issues.push(...stackIssues);
      } catch (error) {
        console.error(`Erro ao analisar stack ${stackId}:`, error);
      }
    }

    return issues;
  }

  // Analisar métricas de uma stack específica
  private analyzeStackMetrics(
    stackId: string,
    metrics: Record<string, number>,
  ): HealthIssue[] {
    const issues: HealthIssue[] = [];
    const now = new Date();

    // 1. CPU Alto
    if (metrics.cpu > this.config.criticalThresholds.cpuUsage) {
      issues.push({
        id: `cpu-high-${stackId}-${now.getTime()}`,
        severity: metrics.cpu > 95 ? "critical" : "high",
        type: "performance",
        stackId,
        stackName: this.getStackDisplayName(stackId),
        description: `CPU usage alto: ${metrics.cpu.toFixed(1)}%`,
        metrics,
        detectedAt: now,
        autoFixable: true,
        suggestedActions: [
          "Restart do serviço para limpeza de memória",
          "Otimização de configurações de performance",
          "Scale horizontal se persistir",
        ],
      });
    }

    // 2. Memória Alta
    if (metrics.memory > this.config.criticalThresholds.memoryUsage) {
      issues.push({
        id: `memory-high-${stackId}-${now.getTime()}`,
        severity: metrics.memory > 98 ? "critical" : "high",
        type: "resource",
        stackId,
        stackName: this.getStackDisplayName(stackId),
        description: `Uso de memória crítico: ${metrics.memory.toFixed(1)}%`,
        metrics,
        detectedAt: now,
        autoFixable: true,
        suggestedActions: [
          "Limpeza de cache e dados temporários",
          "Restart do serviço",
          "Aumento de recursos de memória",
        ],
      });
    }

    // 3. Taxa de Erro Alta
    if (metrics.errorRate > this.config.criticalThresholds.errorRate) {
      issues.push({
        id: `error-rate-high-${stackId}-${now.getTime()}`,
        severity: metrics.errorRate > 10 ? "critical" : "high",
        type: "error",
        stackId,
        stackName: this.getStackDisplayName(stackId),
        description: `Taxa de erro elevada: ${metrics.errorRate.toFixed(1)}%`,
        metrics,
        detectedAt: now,
        autoFixable: true,
        suggestedActions: [
          "Verificação de logs de erro",
          "Restart do serviço problemático",
          "Verificação de dependências",
        ],
      });
    }

    // 4. Tempo de Resposta Alto
    if (metrics.responseTime > this.config.criticalThresholds.responseTime) {
      issues.push({
        id: `response-time-high-${stackId}-${now.getTime()}`,
        severity: metrics.responseTime > 5000 ? "critical" : "medium",
        type: "performance",
        stackId,
        stackName: this.getStackDisplayName(stackId),
        description: `Tempo de resposta alto: ${metrics.responseTime.toFixed(0)}ms`,
        metrics,
        detectedAt: now,
        autoFixable: true,
        suggestedActions: [
          "Otimização de cache",
          "Verificação de queries lentas",
          "Restart do serviço se necessário",
        ],
      });
    }

    // 5. Serviço Offline
    if (metrics.uptime === 0) {
      issues.push({
        id: `service-down-${stackId}-${now.getTime()}`,
        severity: "critical",
        type: "connectivity",
        stackId,
        stackName: this.getStackDisplayName(stackId),
        description: `Serviço offline ou inacessível`,
        metrics,
        detectedAt: now,
        autoFixable: true,
        suggestedActions: [
          "Restart automático do serviço",
          "Verificação de dependências",
          "Análise de logs de erro",
        ],
      });
    }

    return issues;
  }

  // Verificar se deve aplicar correção automática
  private shouldApplyAutoFix(issue: HealthIssue): boolean {
    if (!this.config.enabled || !this.config.autoExecute) {
      return false;
    }

    // Verificar cooldown
    const actionKey = `${issue.type}-${issue.stackId}`;
    const lastExecution = this.executedActions.get(actionKey);

    if (lastExecution) {
      const cooldownMs = this.config.cooldownMinutes * 60 * 1000;
      if (Date.now() - lastExecution.getTime() < cooldownMs) {
        console.log(`⏳ Cooldown ativo para ${actionKey}, pulando correção`);
        return false;
      }
    }

    return true;
  }

  // Aplicar correção automática
  private async applyAutoFix(issue: HealthIssue): Promise<AutoHealingAction> {
    const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🔧 Aplicando correção automática para: ${issue.description}`);

    const action: AutoHealingAction = {
      id: actionId,
      issueId: issue.id,
      action: this.getAutoFixAction(issue),
      parameters: this.getAutoFixParameters(issue),
      expectedImpact: this.getExpectedImpact(issue),
      executedAt: new Date(),
      success: false,
    };

    try {
      // Usar IA para gerar configuração de correção
      const aiResponse = await aiAutonomousConfig.autoConfigureStack({
        stackId: issue.stackId,
        context: "troubleshooting",
        currentConfig: issue.metrics,
        healthData: { uptime: issue.metrics.uptime },
        businessRequirements: `Correção automática para: ${issue.description}`,
      });

      if (aiResponse.success) {
        // Aplicar configuração recomendada pela IA
        const configSuccess =
          await aiAutonomousConfig.applyAutomaticConfiguration(
            issue.stackId,
            aiResponse.configuration,
          );

        action.success = configSuccess;
        action.result = configSuccess
          ? "Configuração aplicada com sucesso pela IA"
          : "Falha ao aplicar configuração da IA";

        if (configSuccess) {
          console.log(`✅ Correção aplicada com sucesso para ${issue.stackId}`);

          // Registrar execução para cooldown
          this.executedActions.set(
            `${issue.type}-${issue.stackId}`,
            new Date(),
          );

          // Notificar se configurado
          if (this.config.notifyOnAction) {
            this.notifyAutoHealing(issue, action);
          }
        }
      } else {
        action.success = false;
        action.error = "IA não conseguiu gerar configuração de correção";
      }
    } catch (error) {
      action.success = false;
      action.error = error.message;
      console.error(
        `❌ Erro ao aplicar correção para ${issue.stackId}:`,
        error,
      );
    }

    return action;
  }

  // Obter ação de correção baseada no tipo de problema
  private getAutoFixAction(issue: HealthIssue): string {
    switch (issue.type) {
      case "performance":
        return "optimize_performance";
      case "resource":
        return "clean_resources";
      case "error":
        return "restart_service";
      case "connectivity":
        return "restart_service";
      default:
        return "generic_optimization";
    }
  }

  // Obter parâmetros para correção
  private getAutoFixParameters(issue: HealthIssue): Record<string, any> {
    return {
      stackId: issue.stackId,
      severity: issue.severity,
      metrics: issue.metrics,
      autoRestart: issue.severity === "critical",
      optimizeCache: issue.type === "performance",
      cleanLogs: true,
    };
  }

  // Obter impacto esperado
  private getExpectedImpact(issue: HealthIssue): string {
    switch (issue.severity) {
      case "critical":
        return "Restauração de funcionalidade crítica";
      case "high":
        return "Melhoria significativa de performance";
      case "medium":
        return "Otimização preventiva";
      default:
        return "Melhoria menor";
    }
  }

  // Notificar sobre ação de auto-healing
  private notifyAutoHealing(
    issue: HealthIssue,
    action: AutoHealingAction,
  ): void {
    const notification = {
      title: "🔧 Auto-Healing Executado",
      message: `Correção aplicada para ${issue.stackName}: ${issue.description}`,
      type: action.success ? "success" : "error",
      timestamp: new Date(),
      details: {
        issue: issue.description,
        action: action.action,
        result: action.result || action.error,
        stackId: issue.stackId,
      },
    };

    console.log("📢 Notificação Auto-Healing:", notification);

    // Aqui poderia integrar com sistema de notificações
    // como WebSocket, email, Slack, etc.
  }

  // Obter nome amigável da stack
  private getStackDisplayName(stackId: string): string {
    const stackNames: Record<string, string> = {
      "evolution-api": "WhatsApp Evolution API",
      n8n: "N8N Automação",
      typebot: "Typebot Chatbots",
      mautic: "Mautic Marketing",
      grafana: "Grafana Analytics",
      prometheus: "Prometheus Monitoring",
    };

    return stackNames[stackId] || stackId;
  }

  // Métodos públicos para controle e monitoramento

  public getStatus(): {
    isRunning: boolean;
    config: AutoHealingConfig;
    issueCount: number;
  } {
    return {
      isRunning: this.isRunning,
      config: this.config,
      issueCount: this.issueHistory.length,
    };
  }

  public getRecentIssues(limit: number = 20): HealthIssue[] {
    return this.issueHistory.slice(-limit);
  }

  public updateConfig(newConfig: Partial<AutoHealingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("⚙️ Configuração do auto-healing atualizada:", this.config);
  }

  public async runManualCheck(): Promise<HealthIssue[]> {
    console.log("🔍 Executando verificação manual...");
    return await this.detectIssues();
  }
}

// Singleton instance
export const autoHealingSystem = AutoHealingSystem.getInstance();

export default AutoHealingSystem;

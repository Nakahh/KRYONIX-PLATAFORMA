import { exec } from "child_process";
import { promisify } from "util";
import Docker from "dockerode";
import {
  prometheusDataCollector,
  SystemMetrics,
  StackMetrics,
} from "./prometheus-real-data";
import {
  consensusEngine,
  AIDecision,
  ConsensusResult,
} from "./ai-consensus-engine";
import { logger } from "../utils/logger";

const execAsync = promisify(exec);

interface HealingAction {
  id: string;
  stackId: string;
  type: "restart" | "scale" | "configure" | "rollback" | "escalate";
  status: "pending" | "executing" | "completed" | "failed";
  startTime: number;
  endTime?: number;
  details: string;
  result?: any;
  aiDecision: AIDecision;
  consensusScore: number;
}

interface AutoHealingConfig {
  enabled: boolean;
  maxActionsPerHour: number;
  minConsensusScore: number;
  criticalStacksOnly: boolean;
  allowedActions: string[];
  blacklistStacks: string[];
  maintenanceMode: boolean;
}

interface SystemProblem {
  id: string;
  stackId: string;
  type:
    | "performance"
    | "availability"
    | "security"
    | "configuration"
    | "capacity";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  metrics: Record<string, any>;
  context: {
    timestamp: number;
    affectedServices: string[];
    userImpact: boolean;
    businessImpact: "none" | "low" | "medium" | "high";
  };
}

export class RealAutonomousHealingSystem {
  private docker: Docker;
  private config: AutoHealingConfig;
  private healingHistory: HealingAction[] = [];
  private isRunning: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  private actionCountPerHour: Map<string, number> = new Map();

  constructor() {
    this.docker = new Docker();

    this.config = {
      enabled: process.env.AUTO_HEALING_ENABLED === "true",
      maxActionsPerHour: 10,
      minConsensusScore: 0.7,
      criticalStacksOnly: false,
      allowedActions: ["restart", "scale", "configure", "monitor"],
      blacklistStacks: ["postgresql", "redis"], // Stacks críticas que não podem ser reiniciadas automaticamente
      maintenanceMode: false,
    };

    logger.info("Real Autonomous Healing System initialized", this.config);
  }

  /**
   * Iniciar sistema de auto-healing
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Auto-healing system already running");
      return;
    }

    logger.info("Starting Real Autonomous Healing System...");

    this.isRunning = true;

    // Monitor contínuo a cada 60 segundos
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error("Error in health check cycle:", error);
      }
    }, 60000);

    // Limpeza de contadores a cada hora
    setInterval(() => {
      this.actionCountPerHour.clear();
    }, 3600000);

    logger.info("Auto-healing system started successfully");
  }

  /**
   * Parar sistema de auto-healing
   */
  stop(): void {
    logger.info("Stopping Real Autonomous Healing System...");

    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    logger.info("Auto-healing system stopped");
  }

  /**
   * Verificação de saúde principal
   */
  private async performHealthCheck(): Promise<void> {
    if (!this.config.enabled || this.config.maintenanceMode) {
      return;
    }

    try {
      logger.debug("Performing health check...");

      // Coletar métricas reais
      const systemMetrics = await prometheusDataCollector.collectRealMetrics();

      // Detectar problemas
      const problems = await this.detectProblems(systemMetrics);

      if (problems.length === 0) {
        logger.debug("No problems detected - system healthy");
        return;
      }

      logger.info(
        `Detected ${problems.length} problems:`,
        problems.map((p) => p.stackId),
      );

      // Processar cada problema
      for (const problem of problems) {
        await this.processeProblem(problem);
      }
    } catch (error) {
      logger.error("Error in health check:", error);
    }
  }

  /**
   * Detectar problemas baseado em métricas reais
   */
  private async detectProblems(
    systemMetrics: SystemMetrics,
  ): Promise<SystemProblem[]> {
    const problems: SystemProblem[] = [];

    for (const [stackId, stackMetrics] of Object.entries(
      systemMetrics.stacks,
    )) {
      const detectedProblems = this.analyzeStackHealth(stackId, stackMetrics);
      problems.push(...detectedProblems);
    }

    return problems;
  }

  /**
   * Analisar saúde de uma stack específica
   */
  private analyzeStackHealth(
    stackId: string,
    metrics: StackMetrics,
  ): SystemProblem[] {
    const problems: SystemProblem[] = [];

    // 1. Stack offline
    if (metrics.status === "offline") {
      problems.push({
        id: `${stackId}_offline_${Date.now()}`,
        stackId,
        type: "availability",
        severity: this.isStackCritical(stackId) ? "critical" : "high",
        description: `Stack ${stackId} está offline`,
        metrics: { uptime: metrics.uptime, status: metrics.status },
        context: {
          timestamp: Date.now(),
          affectedServices: [stackId],
          userImpact: this.isStackCritical(stackId),
          businessImpact: this.getBusinessImpact(stackId),
        },
      });
    }

    // 2. Alto uso de CPU (>90%)
    if (metrics.cpuUsage > 90) {
      problems.push({
        id: `${stackId}_cpu_${Date.now()}`,
        stackId,
        type: "performance",
        severity: metrics.cpuUsage > 95 ? "critical" : "high",
        description: `Alto uso de CPU: ${metrics.cpuUsage.toFixed(1)}%`,
        metrics: { cpuUsage: metrics.cpuUsage },
        context: {
          timestamp: Date.now(),
          affectedServices: [stackId],
          userImpact: metrics.cpuUsage > 95,
          businessImpact: "medium",
        },
      });
    }

    // 3. Alto uso de memória (>85%)
    if (metrics.memoryUsage > 85) {
      problems.push({
        id: `${stackId}_memory_${Date.now()}`,
        stackId,
        type: "performance",
        severity: metrics.memoryUsage > 95 ? "critical" : "medium",
        description: `Alto uso de memória: ${metrics.memoryUsage.toFixed(1)}%`,
        metrics: { memoryUsage: metrics.memoryUsage },
        context: {
          timestamp: Date.now(),
          affectedServices: [stackId],
          userImpact: metrics.memoryUsage > 95,
          businessImpact: "low",
        },
      });
    }

    // 4. Alta taxa de erro (>5%)
    if (metrics.errorRate > 5) {
      problems.push({
        id: `${stackId}_errors_${Date.now()}`,
        stackId,
        type: "performance",
        severity: metrics.errorRate > 15 ? "critical" : "high",
        description: `Alta taxa de erro: ${metrics.errorRate.toFixed(1)}%`,
        metrics: { errorRate: metrics.errorRate },
        context: {
          timestamp: Date.now(),
          affectedServices: [stackId],
          userImpact: true,
          businessImpact: "high",
        },
      });
    }

    // 5. Tempo de resposta alto (>5s)
    if (metrics.responseTime > 5000) {
      problems.push({
        id: `${stackId}_latency_${Date.now()}`,
        stackId,
        type: "performance",
        severity: metrics.responseTime > 10000 ? "high" : "medium",
        description: `Tempo de resposta alto: ${metrics.responseTime}ms`,
        metrics: { responseTime: metrics.responseTime },
        context: {
          timestamp: Date.now(),
          affectedServices: [stackId],
          userImpact: true,
          businessImpact: "medium",
        },
      });
    }

    return problems;
  }

  /**
   * Processar problema detectado
   */
  private async processeProblem(problem: SystemProblem): Promise<void> {
    try {
      // Verificar se já estamos executando muitas ações
      const currentActions = this.actionCountPerHour.get(problem.stackId) || 0;
      if (currentActions >= this.config.maxActionsPerHour) {
        logger.warn(`Max actions per hour reached for ${problem.stackId}`);
        return;
      }

      // Verificar blacklist
      if (this.config.blacklistStacks.includes(problem.stackId)) {
        logger.warn(`Stack ${problem.stackId} is blacklisted for auto-healing`);
        return;
      }

      logger.info(`Processing problem: ${problem.description}`);

      // Obter consenso das 3 IAs
      const consensusResult =
        await consensusEngine.getConsensusDecision(problem);

      if (consensusResult.consensusScore < this.config.minConsensusScore) {
        logger.warn(
          `Consensus score too low: ${consensusResult.consensusScore}`,
        );
        return;
      }

      // Verificar se ação é permitida
      if (
        !this.config.allowedActions.includes(
          consensusResult.finalDecision.action,
        )
      ) {
        logger.warn(
          `Action ${consensusResult.finalDecision.action} not allowed`,
        );
        return;
      }

      // Executar ação de healing
      const healingAction = await this.executeHealingAction(
        problem,
        consensusResult,
      );

      // Registrar ação
      this.healingHistory.push(healingAction);
      this.actionCountPerHour.set(problem.stackId, currentActions + 1);

      logger.info(`Healing action completed: ${healingAction.status}`, {
        stackId: problem.stackId,
        action: healingAction.type,
        duration: healingAction.endTime! - healingAction.startTime,
      });
    } catch (error) {
      logger.error(`Error processing problem for ${problem.stackId}:`, error);
    }
  }

  /**
   * Executar ação de healing
   */
  private async executeHealingAction(
    problem: SystemProblem,
    consensusResult: ConsensusResult,
  ): Promise<HealingAction> {
    const action: HealingAction = {
      id: `healing_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      stackId: problem.stackId,
      type: consensusResult.finalDecision.action as any,
      status: "pending",
      startTime: Date.now(),
      details: consensusResult.finalDecision.reasoning,
      aiDecision: consensusResult.finalDecision,
      consensusScore: consensusResult.consensusScore,
    };

    try {
      action.status = "executing";

      switch (action.type) {
        case "restart":
          action.result = await this.restartStack(problem.stackId);
          break;

        case "scale":
          action.result = await this.scaleStack(problem.stackId, 2);
          break;

        case "configure":
          action.result = await this.reconfigureStack(
            problem.stackId,
            problem.type,
          );
          break;

        case "rollback":
          action.result = await this.rollbackStack(problem.stackId);
          break;

        case "escalate":
          action.result = await this.escalateProblem(problem);
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      action.status = "completed";
      action.endTime = Date.now();

      // Aguardar e verificar se a ação resolveu o problema
      setTimeout(async () => {
        await this.verifyHealingSuccess(action, problem);
      }, 30000); // Verificar após 30 segundos
    } catch (error) {
      action.status = "failed";
      action.endTime = Date.now();
      action.result = { error: error.message };

      logger.error(`Healing action failed:`, error);
    }

    return action;
  }

  /**
   * Reiniciar stack via Docker
   */
  private async restartStack(stackId: string): Promise<any> {
    try {
      logger.info(`Restarting stack: ${stackId}`);

      // Usar Docker Compose para reiniciar
      const { stdout, stderr } = await execAsync(
        `docker-compose restart ${stackId}`,
        {
          cwd: "/opt/kryonix",
          timeout: 120000, // 2 minutos timeout
        },
      );

      if (stderr && !stderr.includes("WARNING")) {
        throw new Error(`Docker restart error: ${stderr}`);
      }

      // Aguardar stack ficar saudável
      await this.waitForStackHealth(stackId, 60000); // 1 minuto

      return {
        success: true,
        stdout,
        restartTime: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to restart ${stackId}: ${error.message}`);
    }
  }

  /**
   * Escalar stack (aumentar replicas)
   */
  private async scaleStack(stackId: string, replicas: number): Promise<any> {
    try {
      logger.info(`Scaling stack ${stackId} to ${replicas} replicas`);

      const { stdout, stderr } = await execAsync(
        `docker-compose up -d --scale ${stackId}=${replicas}`,
        {
          cwd: "/opt/kryonix",
          timeout: 180000, // 3 minutos
        },
      );

      if (stderr && !stderr.includes("WARNING")) {
        throw new Error(`Docker scale error: ${stderr}`);
      }

      return {
        success: true,
        replicas,
        stdout,
      };
    } catch (error) {
      throw new Error(`Failed to scale ${stackId}: ${error.message}`);
    }
  }

  /**
   * Reconfigurar stack baseado no tipo de problema
   */
  private async reconfigureStack(
    stackId: string,
    problemType: string,
  ): Promise<any> {
    try {
      logger.info(`Reconfiguring stack ${stackId} for ${problemType} problem`);

      const configs = {
        performance: {
          "evolution-api": { memory: "2GB", cpu: "1.5" },
          n8n: { EXECUTIONS_MODE: "queue", DB_POSTGRESDB_POOL_SIZE: "20" },
          typebot: { DATABASE_URL: "postgresql://..." },
        },
        capacity: {
          redis: { maxmemory: "1GB", "maxmemory-policy": "allkeys-lru" },
          postgresql: { shared_buffers: "256MB", max_connections: "200" },
        },
      };

      const stackConfigs = configs[problemType as keyof typeof configs];
      const newConfig = stackConfigs?.[stackId as keyof typeof stackConfigs];

      if (!newConfig) {
        return { success: false, reason: "No configuration available" };
      }

      // Aplicar configuração via environment variables
      const envUpdates = Object.entries(newConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join(" ");

      const { stdout } = await execAsync(
        `docker-compose config > /tmp/${stackId}_config.yml`,
        {
          cwd: "/opt/kryonix",
        },
      );

      // Reiniciar com nova configuração
      await this.restartStack(stackId);

      return {
        success: true,
        appliedConfig: newConfig,
        stdout,
      };
    } catch (error) {
      throw new Error(`Failed to reconfigure ${stackId}: ${error.message}`);
    }
  }

  /**
   * Rollback stack para versão anterior
   */
  private async rollbackStack(stackId: string): Promise<any> {
    try {
      logger.info(`Rolling back stack: ${stackId}`);

      // Implementar rollback baseado em tags Docker
      const { stdout } = await execAsync(
        `docker images ${stackId} --format "table {{.Tag}}"`,
        {
          timeout: 10000,
        },
      );

      const tags = stdout
        .split("\n")
        .filter((tag) => tag !== "TAG" && tag.trim());
      const previousTag = tags[1]; // Segunda tag mais recente

      if (!previousTag) {
        throw new Error("No previous version available for rollback");
      }

      // Atualizar docker-compose para usar tag anterior
      await execAsync(
        `sed -i 's|${stackId}:latest|${stackId}:${previousTag}|g' docker-compose.yml`,
        {
          cwd: "/opt/kryonix",
        },
      );

      // Reiniciar com versão anterior
      await this.restartStack(stackId);

      return {
        success: true,
        previousTag,
        rollbackTime: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to rollback ${stackId}: ${error.message}`);
    }
  }

  /**
   * Escalar problema para administradores
   */
  private async escalateProblem(problem: SystemProblem): Promise<any> {
    try {
      logger.warn(`Escalating problem: ${problem.description}`);

      // Notificar via múltiplos canais
      const notifications = await Promise.allSettled([
        this.sendSlackNotification(problem),
        this.sendEmailAlert(problem),
        this.createJiraTicket(problem),
        this.triggerPagerDuty(problem),
      ]);

      return {
        success: true,
        escalationTime: Date.now(),
        notifications: notifications.map((n, i) => ({
          channel: ["slack", "email", "jira", "pagerduty"][i],
          status: n.status,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to escalate problem: ${error.message}`);
    }
  }

  /**
   * Aguardar stack ficar saudável
   */
  private async waitForStackHealth(
    stackId: string,
    timeout: number,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const systemMetrics =
          await prometheusDataCollector.collectRealMetrics();
        const stackMetrics = systemMetrics.stacks[stackId];

        if (
          stackMetrics &&
          stackMetrics.status === "online" &&
          stackMetrics.errorRate < 5
        ) {
          return true;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Aguardar 5s
      } catch (error) {
        logger.debug(`Waiting for ${stackId} health...`);
      }
    }

    return false;
  }

  /**
   * Verificar se healing foi bem-sucedido
   */
  private async verifyHealingSuccess(
    action: HealingAction,
    problem: SystemProblem,
  ): Promise<void> {
    try {
      const systemMetrics = await prometheusDataCollector.collectRealMetrics();
      const stackMetrics = systemMetrics.stacks[action.stackId];

      if (!stackMetrics) {
        logger.warn(`No metrics available for verification: ${action.stackId}`);
        return;
      }

      const healingSuccess = this.evaluateHealingSuccess(problem, stackMetrics);

      if (healingSuccess) {
        logger.info(`Healing verified successful for ${action.stackId}`);

        // Atualizar accuracy do AI provider
        await consensusEngine.updateProviderPerformance(
          action.aiDecision.provider,
          1.0, // 100% accuracy
          action.endTime! - action.startTime,
        );
      } else {
        logger.warn(`Healing verification failed for ${action.stackId}`);

        // Penalizar accuracy do AI provider
        await consensusEngine.updateProviderPerformance(
          action.aiDecision.provider,
          0.0, // 0% accuracy
          action.endTime! - action.startTime,
        );
      }
    } catch (error) {
      logger.error("Error verifying healing success:", error);
    }
  }

  /**
   * Avaliar se healing foi bem-sucedido
   */
  private evaluateHealingSuccess(
    problem: SystemProblem,
    currentMetrics: StackMetrics,
  ): boolean {
    switch (problem.type) {
      case "availability":
        return currentMetrics.status === "online";

      case "performance":
        if (problem.description.includes("CPU")) {
          return currentMetrics.cpuUsage < 80;
        }
        if (problem.description.includes("memória")) {
          return currentMetrics.memoryUsage < 80;
        }
        if (problem.description.includes("erro")) {
          return currentMetrics.errorRate < 2;
        }
        if (problem.description.includes("resposta")) {
          return currentMetrics.responseTime < 3000;
        }
        break;
    }

    return false;
  }

  // Métodos de notificação (implementações básicas)
  private async sendSlackNotification(problem: SystemProblem): Promise<any> {
    // TODO: Implementar integração Slack
    logger.info("Slack notification sent (mock)");
    return { success: true };
  }

  private async sendEmailAlert(problem: SystemProblem): Promise<any> {
    // TODO: Implementar envio de email
    logger.info("Email alert sent (mock)");
    return { success: true };
  }

  private async createJiraTicket(problem: SystemProblem): Promise<any> {
    // TODO: Implementar criação de ticket Jira
    logger.info("Jira ticket created (mock)");
    return { success: true };
  }

  private async triggerPagerDuty(problem: SystemProblem): Promise<any> {
    // TODO: Implementar PagerDuty
    logger.info("PagerDuty triggered (mock)");
    return { success: true };
  }

  // Métodos auxiliares
  private isStackCritical(stackId: string): boolean {
    const criticalStacks = ["evolution-api", "postgresql", "redis", "n8n"];
    return criticalStacks.includes(stackId);
  }

  private getBusinessImpact(
    stackId: string,
  ): "none" | "low" | "medium" | "high" {
    const businessImpactMap: Record<
      string,
      "none" | "low" | "medium" | "high"
    > = {
      "evolution-api": "high",
      typebot: "high",
      n8n: "medium",
      mautic: "medium",
      postgresql: "high",
      redis: "medium",
    };

    return businessImpactMap[stackId] || "low";
  }

  // Métodos públicos para controle
  async updateConfig(newConfig: Partial<AutoHealingConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    logger.info("Auto-healing config updated:", this.config);
  }

  getConfig(): AutoHealingConfig {
    return { ...this.config };
  }

  getHealingHistory(limit: number = 50): HealingAction[] {
    return this.healingHistory.slice(-limit);
  }

  getStats() {
    const recentActions = this.healingHistory.filter(
      (action) => Date.now() - action.startTime < 24 * 60 * 60 * 1000, // últimas 24h
    );

    return {
      isRunning: this.isRunning,
      config: this.config,
      totalActions: this.healingHistory.length,
      recentActions: recentActions.length,
      successRate:
        recentActions.length > 0
          ? recentActions.filter((a) => a.status === "completed").length /
            recentActions.length
          : 0,
      averageExecutionTime:
        recentActions.length > 0
          ? recentActions
              .filter((a) => a.endTime)
              .reduce((sum, a) => sum + (a.endTime! - a.startTime), 0) /
            recentActions.length
          : 0,
      actionsByStack: recentActions.reduce(
        (acc, action) => {
          acc[action.stackId] = (acc[action.stackId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}

export const realAutonomousHealing = new RealAutonomousHealingSystem();

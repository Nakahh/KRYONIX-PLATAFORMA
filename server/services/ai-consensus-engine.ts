import { logger } from "../utils/logger";

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

interface AIDecision {
  provider: "ollama" | "openai" | "dify";
  action: "restart" | "scale" | "configure" | "monitor" | "escalate";
  confidence: number; // 0-1
  reasoning: string;
  estimatedTime: number; // minutos
  riskLevel: "low" | "medium" | "high";
  requiredResources: string[];
  rollbackPlan?: string;
  metadata: Record<string, any>;
}

interface ConsensusResult {
  finalDecision: AIDecision;
  consensusScore: number; // 0-1
  providersAgreement: {
    ollama: AIDecision;
    openai: AIDecision;
    dify: AIDecision;
  };
  executionPlan: {
    steps: string[];
    estimatedDuration: number;
    rollbackStrategy: string;
    monitoring: string[];
  };
  timestamp: number;
}

interface AIProvider {
  name: string;
  weight: number;
  averageAccuracy: number;
  responseTime: number;
  available: boolean;
}

class OllamaProvider {
  private baseUrl: string;
  private models: string[];

  constructor(config: { url: string; models: string[] }) {
    this.baseUrl = config.url;
    this.models = config.models;
  }

  async makeDecision(problem: SystemProblem): Promise<AIDecision> {
    try {
      const prompt = this.buildPrompt(problem);

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama2:13b-chat",
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseOllamaResponse(data.response, problem);
    } catch (error) {
      logger.error("Ollama decision error:", error);
      return this.getFallbackDecision(problem, "ollama");
    }
  }

  private buildPrompt(problem: SystemProblem): string {
    return `
Você é um especialista em infraestrutura e DevOps brasileiro. Analise o problema abaixo e forneça uma decisão técnica:

PROBLEMA:
- Stack: ${problem.stackId}
- Tipo: ${problem.type}
- Severidade: ${problem.severity}
- Descrição: ${problem.description}
- Impacto nos usuários: ${problem.context.userImpact ? "SIM" : "NÃO"}
- Impacto nos negócios: ${problem.context.businessImpact}

MÉTRICAS ATUAIS:
${JSON.stringify(problem.metrics, null, 2)}

SERVIÇOS AFETADOS:
${problem.context.affectedServices.join(", ")}

Responda APENAS em JSON no formato:
{
  "action": "restart|scale|configure|monitor|escalate",
  "confidence": 0.85,
  "reasoning": "Explicação detalhada da decisão",
  "estimatedTime": 5,
  "riskLevel": "low|medium|high",
  "requiredResources": ["CPU", "Memory"],
  "rollbackPlan": "Plano de rollback se necessário"
}

IMPORTANTE: 
- Priorize soluções com menor risco
- Considere o contexto brasileiro (horário comercial, feriados)
- Minimize downtime
- Sempre tenha plano de rollback
`;
  }

  private parseOllamaResponse(
    response: string,
    problem: SystemProblem,
  ): AIDecision {
    try {
      // Extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("JSON não encontrado na resposta");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        provider: "ollama",
        action: parsed.action || "monitor",
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        reasoning: parsed.reasoning || "Decisão padrão do Ollama",
        estimatedTime: parsed.estimatedTime || 10,
        riskLevel: parsed.riskLevel || "medium",
        requiredResources: parsed.requiredResources || [],
        rollbackPlan: parsed.rollbackPlan,
        metadata: {
          model: "llama2:13b-chat",
          provider: "ollama-local",
          responseLength: response.length,
        },
      };
    } catch (error) {
      logger.error("Erro ao parsear resposta Ollama:", error);
      return this.getFallbackDecision(problem, "ollama");
    }
  }

  private getFallbackDecision(
    problem: SystemProblem,
    provider: string,
  ): AIDecision {
    return {
      provider: "ollama",
      action: problem.severity === "critical" ? "escalate" : "monitor",
      confidence: 0.3,
      reasoning: `Fallback decision - ${provider} indisponível`,
      estimatedTime: 15,
      riskLevel: "medium",
      requiredResources: [],
      rollbackPlan: "Reverter para estado anterior",
      metadata: { fallback: true },
    };
  }
}

class OpenAIProvider {
  private apiKey: string;
  private model: string;

  constructor(config: { apiKey: string; model?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || "gpt-4o";
  }

  async makeDecision(problem: SystemProblem): Promise<AIDecision> {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: "system",
                content:
                  "Você é um especialista em infraestrutura e DevOps brasileiro. Tome decisões técnicas baseadas em dados e melhores práticas. Sempre responda em JSON válido.",
              },
              {
                role: "user",
                content: this.buildGPTPrompt(problem),
              },
            ],
            temperature: 0.2,
            max_tokens: 800,
            response_format: { type: "json_object" },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      return this.parseGPTResponse(content, problem);
    } catch (error) {
      logger.error("OpenAI decision error:", error);
      return this.getFallbackDecision(problem, "openai");
    }
  }

  private buildGPTPrompt(problem: SystemProblem): string {
    return `
Analise este problema de infraestrutura e tome uma decisão técnica:

CONTEXTO:
- Stack afetada: ${problem.stackId}
- Tipo do problema: ${problem.type}
- Severidade: ${problem.severity}
- Usuários afetados: ${problem.context.userImpact}
- Impacto nos negócios: ${problem.context.businessImpact}

PROBLEMA:
${problem.description}

MÉTRICAS TÉCNICAS:
${JSON.stringify(problem.metrics, null, 2)}

SERVIÇOS AFETADOS:
${problem.context.affectedServices.join(", ")}

Responda em JSON:
{
  "action": "restart|scale|configure|monitor|escalate",
  "confidence": 0.9,
  "reasoning": "Análise detalhada e justificativa técnica",
  "estimatedTime": 8,
  "riskLevel": "low|medium|high",
  "requiredResources": ["recursos necessários"],
  "rollbackPlan": "Plano detalhado de rollback"
}

CRITÉRIOS:
- Minimize downtime
- Priorize soluções de baixo risco
- Considere horário comercial brasileiro
- Sempre tenha plano B
`;
  }

  private parseGPTResponse(
    content: string,
    problem: SystemProblem,
  ): AIDecision {
    try {
      const parsed = JSON.parse(content);

      return {
        provider: "openai",
        action: parsed.action || "monitor",
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.8)),
        reasoning: parsed.reasoning || "Decisão baseada em análise GPT-4",
        estimatedTime: parsed.estimatedTime || 8,
        riskLevel: parsed.riskLevel || "medium",
        requiredResources: parsed.requiredResources || [],
        rollbackPlan: parsed.rollbackPlan,
        metadata: {
          model: this.model,
          provider: "openai",
          tokenUsage: content.length,
        },
      };
    } catch (error) {
      logger.error("Erro ao parsear resposta OpenAI:", error);
      return this.getFallbackDecision(problem, "openai");
    }
  }

  private getFallbackDecision(
    problem: SystemProblem,
    provider: string,
  ): AIDecision {
    return {
      provider: "openai",
      action: problem.severity === "critical" ? "restart" : "monitor",
      confidence: 0.4,
      reasoning: `Fallback decision - ${provider} indisponível`,
      estimatedTime: 10,
      riskLevel: "medium",
      requiredResources: [],
      rollbackPlan: "Monitorar e escalate se necessário",
      metadata: { fallback: true },
    };
  }
}

class DifyProvider {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: { url: string; apiKey: string }) {
    this.baseUrl = config.url;
    this.apiKey = config.apiKey;
  }

  async makeDecision(problem: SystemProblem): Promise<AIDecision> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/workflows/run`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            problem_description: problem.description,
            stack_id: problem.stackId,
            severity: problem.severity,
            metrics: JSON.stringify(problem.metrics),
            business_impact: problem.context.businessImpact,
          },
          response_mode: "blocking",
          user: "kryonix-autonomous-system",
        }),
      });

      if (!response.ok) {
        throw new Error(`Dify API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseDifyResponse(data, problem);
    } catch (error) {
      logger.error("Dify decision error:", error);
      return this.getFallbackDecision(problem, "dify");
    }
  }

  private parseDifyResponse(data: any, problem: SystemProblem): AIDecision {
    try {
      const outputs = data.data?.outputs || {};

      return {
        provider: "dify",
        action: outputs.recommended_action || "monitor",
        confidence: parseFloat(outputs.confidence || "0.7"),
        reasoning: outputs.reasoning || "Análise Dify AI workflow",
        estimatedTime: parseInt(outputs.estimated_time || "12"),
        riskLevel: outputs.risk_level || "medium",
        requiredResources: outputs.required_resources?.split(",") || [],
        rollbackPlan: outputs.rollback_plan,
        metadata: {
          workflowId: data.data?.workflow_id,
          provider: "dify",
          executionTime: data.data?.elapsed_time,
        },
      };
    } catch (error) {
      logger.error("Erro ao parsear resposta Dify:", error);
      return this.getFallbackDecision(problem, "dify");
    }
  }

  private getFallbackDecision(
    problem: SystemProblem,
    provider: string,
  ): AIDecision {
    return {
      provider: "dify",
      action: "configure",
      confidence: 0.5,
      reasoning: `Fallback decision - ${provider} workflow indisponível`,
      estimatedTime: 15,
      riskLevel: "medium",
      requiredResources: [],
      rollbackPlan: "Aplicar configuração padrão",
      metadata: { fallback: true },
    };
  }
}

export class AIConsensusEngine {
  private providers: Map<string, AIProvider>;
  private ollamaProvider: OllamaProvider;
  private openaiProvider: OpenAIProvider;
  private difyProvider: DifyProvider;

  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  private async initializeProviders() {
    // Inicializar providers de IA
    this.ollamaProvider = new OllamaProvider({
      url: process.env.OLLAMA_URL || "https://apiollama.kryonix.com.br",
      models: ["llama2:13b-chat", "codellama:7b-instruct"],
    });

    this.openaiProvider = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY || "",
      model: "gpt-4o",
    });

    this.difyProvider = new DifyProvider({
      url: process.env.DIFY_URL || "https://dify.kryonix.com.br",
      apiKey: process.env.DIFY_API_KEY || "",
    });

    // Configurar pesos e métricas dos providers
    this.providers.set("ollama", {
      name: "Ollama Local",
      weight: 0.4, // Priorizar IA local para privacidade
      averageAccuracy: 0.82,
      responseTime: 3000, // ms
      available: true,
    });

    this.providers.set("openai", {
      name: "GPT-4o",
      weight: 0.4, // Alto peso por performance
      averageAccuracy: 0.91,
      responseTime: 1500, // ms
      available: !!process.env.OPENAI_API_KEY,
    });

    this.providers.set("dify", {
      name: "Dify AI Workflow",
      weight: 0.2, // Menor peso, mais especializado
      averageAccuracy: 0.75,
      responseTime: 2000, // ms
      available: !!process.env.DIFY_API_KEY,
    });

    logger.info("AI Consensus Engine initialized with 3 providers");
  }

  async getConsensusDecision(problem: SystemProblem): Promise<ConsensusResult> {
    const startTime = Date.now();

    try {
      logger.info(
        `Starting consensus for problem: ${problem.id} (${problem.stackId})`,
      );

      // Executar decisões em paralelo com timeout
      const decisionPromises = [
        this.getDecisionWithTimeout("ollama", problem, 5000),
        this.getDecisionWithTimeout("openai", problem, 8000),
        this.getDecisionWithTimeout("dify", problem, 6000),
      ];

      const settledResults = await Promise.allSettled(decisionPromises);

      // Extrair decisões válidas
      const decisions = {
        ollama: null as AIDecision | null,
        openai: null as AIDecision | null,
        dify: null as AIDecision | null,
      };

      settledResults.forEach((result, index) => {
        const providerName = ["ollama", "openai", "dify"][
          index
        ] as keyof typeof decisions;

        if (result.status === "fulfilled") {
          decisions[providerName] = result.value;
        } else {
          logger.warn(`${providerName} decision failed:`, result.reason);
        }
      });

      // Calcular consenso
      const consensusResult = this.calculateWeightedConsensus(
        decisions,
        problem,
      );

      logger.info(`Consensus completed in ${Date.now() - startTime}ms`, {
        problemId: problem.id,
        finalAction: consensusResult.finalDecision.action,
        consensusScore: consensusResult.consensusScore,
      });

      return consensusResult;
    } catch (error) {
      logger.error("Consensus engine error:", error);

      // Fallback decision
      return {
        finalDecision: this.getEmergencyDecision(problem),
        consensusScore: 0.3,
        providersAgreement: {
          ollama: null,
          openai: null,
          dify: null,
        },
        executionPlan: {
          steps: [
            "Executar ação de emergência",
            "Monitorar resultado",
            "Escalate se necessário",
          ],
          estimatedDuration: 20,
          rollbackStrategy: "Reverter para estado anterior",
          monitoring: ["system-health", "user-impact"],
        },
        timestamp: Date.now(),
      };
    }
  }

  private async getDecisionWithTimeout(
    providerName: string,
    problem: SystemProblem,
    timeout: number,
  ): Promise<AIDecision> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`${providerName} timeout after ${timeout}ms`));
      }, timeout);

      let decisionPromise: Promise<AIDecision>;

      switch (providerName) {
        case "ollama":
          decisionPromise = this.ollamaProvider.makeDecision(problem);
          break;
        case "openai":
          decisionPromise = this.openaiProvider.makeDecision(problem);
          break;
        case "dify":
          decisionPromise = this.difyProvider.makeDecision(problem);
          break;
        default:
          reject(new Error(`Unknown provider: ${providerName}`));
          return;
      }

      decisionPromise
        .then((decision) => {
          clearTimeout(timer);
          resolve(decision);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private calculateWeightedConsensus(
    decisions: {
      ollama: AIDecision | null;
      openai: AIDecision | null;
      dify: AIDecision | null;
    },
    problem: SystemProblem,
  ): ConsensusResult {
    const validDecisions = Object.entries(decisions)
      .filter(([_, decision]) => decision !== null)
      .map(([provider, decision]) => ({
        provider,
        decision: decision!,
        weight: this.providers.get(provider)?.weight || 0.33,
      }));

    if (validDecisions.length === 0) {
      return this.getEmergencyConsensus(problem);
    }

    // Calcular scores por ação
    const actionScores = new Map<string, number>();
    const actionReasons = new Map<string, string[]>();

    validDecisions.forEach(({ decision, weight }) => {
      const currentScore = actionScores.get(decision.action) || 0;
      const weightedScore = decision.confidence * weight;

      actionScores.set(decision.action, currentScore + weightedScore);

      const reasons = actionReasons.get(decision.action) || [];
      reasons.push(`${decision.provider}: ${decision.reasoning}`);
      actionReasons.set(decision.action, reasons);
    });

    // Encontrar ação com maior score
    let bestAction = "monitor";
    let bestScore = 0;

    for (const [action, score] of actionScores.entries()) {
      if (score > bestScore) {
        bestAction = action;
        bestScore = score;
      }
    }

    // Encontrar a decisão com maior confiança para a ação escolhida
    const bestDecision =
      validDecisions
        .filter(({ decision }) => decision.action === bestAction)
        .sort((a, b) => b.decision.confidence - a.decision.confidence)[0]
        ?.decision || validDecisions[0].decision;

    // Calcular consensus score baseado em concordância
    const totalProviders = Object.keys(decisions).length;
    const agreementCount = validDecisions.filter(
      ({ decision }) => decision.action === bestAction,
    ).length;

    const consensusScore =
      (agreementCount / totalProviders) * (bestScore / 1.0);

    // Criar plano de execução
    const executionPlan = this.createExecutionPlan(bestDecision, problem);

    return {
      finalDecision: {
        ...bestDecision,
        reasoning: `Consenso de ${validDecisions.length} IAs: ${actionReasons.get(bestAction)?.join(" | ") || bestDecision.reasoning}`,
        metadata: {
          ...bestDecision.metadata,
          consensusScore,
          participatingProviders: validDecisions.map((v) => v.provider),
          weightedScore: bestScore,
        },
      },
      consensusScore,
      providersAgreement: {
        ollama: decisions.ollama,
        openai: decisions.openai,
        dify: decisions.dify,
      },
      executionPlan,
      timestamp: Date.now(),
    };
  }

  private createExecutionPlan(
    decision: AIDecision,
    problem: SystemProblem,
  ): any {
    const baseSteps = this.getActionSteps(decision.action, problem.stackId);

    return {
      steps: baseSteps,
      estimatedDuration: decision.estimatedTime,
      rollbackStrategy:
        decision.rollbackPlan || "Reverter para estado anterior via backup",
      monitoring: [
        "health-check",
        "performance-metrics",
        "error-rates",
        "user-impact",
      ],
    };
  }

  private getActionSteps(action: string, stackId: string): string[] {
    const stepMap: Record<string, string[]> = {
      restart: [
        `Parar serviço ${stackId}`,
        "Aguardar 10 segundos",
        `Iniciar serviço ${stackId}`,
        "Verificar health check",
        "Validar funcionamento",
      ],
      scale: [
        "Verificar recursos disponíveis",
        `Escalar ${stackId} para mais instâncias`,
        "Aguardar inicialização",
        "Distribuir carga",
        "Monitorar performance",
      ],
      configure: [
        "Backup configuração atual",
        "Aplicar nova configuração",
        "Reiniciar se necessário",
        "Validar configuração",
        "Monitorar estabilidade",
      ],
      monitor: [
        "Coletar m��tricas detalhadas",
        "Analisar tendências",
        "Configurar alertas",
        "Agendar revisão",
        "Documentar observações",
      ],
      escalate: [
        "Notificar administradores",
        "Criar ticket de emergência",
        "Ativar modo de manutenção",
        "Aplicar workaround temporário",
        "Aguardar intervenção manual",
      ],
    };

    return stepMap[action] || stepMap.monitor;
  }

  private getEmergencyDecision(problem: SystemProblem): AIDecision {
    return {
      provider: "ollama", // Fallback local
      action: problem.severity === "critical" ? "escalate" : "monitor",
      confidence: 0.4,
      reasoning: "Decisão de emergência - sistema de consenso indisponível",
      estimatedTime: 30,
      riskLevel: "high",
      requiredResources: [],
      rollbackPlan: "Aguardar recuperação do sistema de consenso",
      metadata: {
        emergency: true,
        timestamp: Date.now(),
      },
    };
  }

  private getEmergencyConsensus(problem: SystemProblem): ConsensusResult {
    const emergencyDecision = this.getEmergencyDecision(problem);

    return {
      finalDecision: emergencyDecision,
      consensusScore: 0.2,
      providersAgreement: {
        ollama: null,
        openai: null,
        dify: null,
      },
      executionPlan: {
        steps: ["Aplicar decisão de emergência", "Notificar administradores"],
        estimatedDuration: 30,
        rollbackStrategy: "Aguardar recuperação manual",
        monitoring: ["basic-health-check"],
      },
      timestamp: Date.now(),
    };
  }

  // Métodos para atualizar performance dos providers
  async updateProviderPerformance(
    provider: string,
    accuracy: number,
    responseTime: number,
  ) {
    const providerConfig = this.providers.get(provider);
    if (providerConfig) {
      // Moving average para accuracy
      providerConfig.averageAccuracy =
        providerConfig.averageAccuracy * 0.8 + accuracy * 0.2;

      // Moving average para response time
      providerConfig.responseTime =
        providerConfig.responseTime * 0.8 + responseTime * 0.2;

      // Ajustar peso baseado em performance
      const performanceScore =
        accuracy * 0.7 + ((5000 - Math.min(responseTime, 5000)) / 5000) * 0.3;
      providerConfig.weight = Math.max(0.1, Math.min(0.7, performanceScore));

      logger.info(`Updated ${provider} performance:`, {
        accuracy: providerConfig.averageAccuracy,
        responseTime: providerConfig.responseTime,
        weight: providerConfig.weight,
      });
    }
  }

  async getProviderStats() {
    return Array.from(this.providers.entries()).map(([name, config]) => ({
      name: config.name,
      weight: config.weight,
      accuracy: config.averageAccuracy,
      responseTime: config.responseTime,
      available: config.available,
    }));
  }
}

export const consensusEngine = new AIConsensusEngine();
export { SystemProblem, AIDecision, ConsensusResult };

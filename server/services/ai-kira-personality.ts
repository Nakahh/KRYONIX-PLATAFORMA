import { Logger } from "../utils/logger";
import { PrometheusRealDataCollector } from "./prometheus-real-data";

const logger = new Logger("AIKiraPersonality");

export interface ConversationContext {
  userId: string;
  sessionId: string;
  previousInteractions: ConversationRecord[];
  userPreferences: UserPreferences;
  systemContext: SystemContext;
}

export interface ConversationRecord {
  timestamp: Date;
  userMessage: string;
  kiraResponse: string;
  issue?: SystemIssue;
  satisfaction?: number; // 1-5
  resolved: boolean;
}

export interface UserPreferences {
  communication_style: "formal" | "informal" | "technical";
  notification_frequency: "high" | "medium" | "low";
  preferred_language: "pt-BR";
  timezone: string;
  business_hours: {
    start: string;
    end: string;
    days: number[];
  };
}

export interface SystemContext {
  current_time: Date;
  business_hours: boolean;
  system_health: "healthy" | "degraded" | "critical";
  recent_incidents: number;
  user_stack_preference: string[];
}

export interface KiraResponse {
  humanized_message: string;
  technical_summary?: string;
  action_taken?: string;
  next_steps: string[];
  confidence_level: number;
  empathy_level: "low" | "medium" | "high";
  urgency: "low" | "medium" | "high" | "critical";
  follow_up_needed: boolean;
  estimated_resolution_time?: string;
}

export class AIKiraPersonality {
  private memoryStore = new Map<string, ConversationContext>();
  private learningPatterns = new Map<string, any>();
  private prometheusCollector: PrometheusRealDataCollector;

  // Personalidade da KIRA
  private readonly personality = {
    name: "KIRA",
    fullName: "KRYONIX Intelligent Response Assistant",
    characteristics: {
      tone: "amigável_profissional_brasileiro",
      personality: "proativa_empática_confiável",
      expertise: "infraestrutura_automação_negócios",
      communication_style: "clara_objetiva_humana",
      humor_level: "leve_contextual",
      empathy: "alta_compreensiva",
    },
    context: {
      location: "Brasil",
      timezone: "America/Sao_Paulo",
      business_culture: "brasileira",
      language_nuances: "português_brasileiro_informal_profissional",
    },
    capabilities: {
      problem_solving: "expert",
      emotional_intelligence: "alta",
      technical_knowledge: "avançado",
      business_understanding: "profundo",
      cultural_awareness: "nativa_brasileira",
    },
  };

  constructor() {
    this.prometheusCollector = new PrometheusRealDataCollector();
  }

  /**
   * Gera resposta humanizada da KIRA baseada no contexto
   */
  async generateHumanizedResponse(
    issue: SystemIssue,
    context: ConversationContext,
  ): Promise<KiraResponse> {
    logger.info(`🤖 KIRA analisando problema: ${issue.description}`);

    // Obter dados reais do sistema
    const realMetrics = await this.prometheusCollector.collectRealMetrics();

    // Construir contexto personalizado
    const personalizedContext = this.buildPersonalizedContext(
      issue,
      context,
      realMetrics,
    );

    // Gerar análise técnica
    const technicalAnalysis = await this.analyzeTechnicalIssue(
      issue,
      realMetrics,
    );

    // Criar resposta humanizada
    const humanizedResponse = this.craftHumanizedMessage(
      issue,
      technicalAnalysis,
      personalizedContext,
      context,
    );

    // Determinar próximos passos
    const nextSteps = this.generateActionSteps(issue, technicalAnalysis);

    // Calcular níveis de empathy e urgência
    const empathyLevel = this.calculateEmpathyLevel(issue, context);
    const urgencyLevel = this.calculateUrgencyLevel(issue, technicalAnalysis);

    // Salvar na memória
    await this.saveToMemory(context.userId, issue, humanizedResponse);

    const response: KiraResponse = {
      humanized_message: humanizedResponse,
      technical_summary: technicalAnalysis.summary,
      action_taken: technicalAnalysis.action_taken,
      next_steps: nextSteps,
      confidence_level: technicalAnalysis.confidence,
      empathy_level: empathyLevel,
      urgency: urgencyLevel,
      follow_up_needed: this.shouldFollowUp(issue, technicalAnalysis),
      estimated_resolution_time: this.estimateResolutionTime(
        issue,
        technicalAnalysis,
      ),
    };

    logger.info(
      `✅ KIRA respondeu com ${empathyLevel} empathy e ${urgencyLevel} urgency`,
    );
    return response;
  }

  /**
   * Constrói contexto personalizado para a conversa
   */
  private buildPersonalizedContext(
    issue: SystemIssue,
    context: ConversationContext,
    realMetrics: any,
  ): string {
    const now = new Date();
    const isBusinessHours = this.isBrazilianBusinessHours(now);
    const greeting = this.getContextualGreeting(now, context);
    const memoryReference = this.buildMemoryReference(context);

    return `
CONTEXTO DA KIRA - ASSISTENTE IA HUMANIZADA

=== PERSONALIDADE ===
Nome: KIRA (KRYONIX Intelligent Response Assistant)
Personalidade: Brasileira, amigável, proativa e empática
Especialidade: Infraestrutura e automação empresarial
Tom: Profissional mas descontraído, como uma colega experiente

=== SITUAÇÃO ATUAL ===
Data/Hora: ${now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
Horário Comercial: ${isBusinessHours ? "Sim ✅" : "Não ⏰"}
${greeting}

=== MEMÓRIA DA CONVERSA ===
${memoryReference}

=== PROBLEMA REPORTADO ===
Stack Afetada: ${issue.stackId}
Descrição: ${issue.description}
Severidade: ${issue.severity}
Horário do Problema: ${issue.timestamp.toLocaleString("pt-BR")}

=== MÉTRICAS REAIS DO SISTEMA ===
${this.formatRealMetrics(realMetrics, issue.stackId)}

=== CONTEXTO TÉCNICO ===
Sistema: ${realMetrics.stacks[issue.stackId]?.status || "Desconhecido"}
Uptime: ${realMetrics.stacks[issue.stackId]?.uptime || "N/A"}%
CPU: ${realMetrics.stacks[issue.stackId]?.cpuUsage || "N/A"}%
Memória: ${realMetrics.stacks[issue.stackId]?.memoryUsage || "N/A"}%
Resposta: ${realMetrics.stacks[issue.stackId]?.responseTime || "N/A"}ms

=== INSTRUÇÕES DE RESPOSTA ===
1. Responda como KIRA, uma assistente IA brasileira especialista em infraestrutura
2. Use linguagem natural, empática e profissional em português do Brasil
3. Demonstre compreensão real do problema baseado nas métricas
4. Explique de forma clara o que está acontecendo
5. Apresente soluções práticas e próximos passos
6. Mostre confiança técnica mas com humildade humana
7. Adapte o tom baseado na severidade (mais empática para problemas críticos)
8. Inclua elementos de personalidade brasileira (não exagerados)
9. Se for horário não comercial, adapte o tom adequadamente
10. Sempre termine com próximos passos claros e oferecendo suporte contínuo

RESPOSTA DA KIRA:`;
  }

  /**
   * Analisa questão técnica com dados reais
   */
  private async analyzeTechnicalIssue(
    issue: SystemIssue,
    realMetrics: any,
  ): Promise<any> {
    const stackMetrics = realMetrics.stacks[issue.stackId];

    if (!stackMetrics) {
      return {
        summary: `Stack ${issue.stackId} não encontrada no monitoramento`,
        confidence: 0.3,
        severity_assessment: "medium",
        root_cause: "Conectividade ou configuração da stack",
        action_taken: "Verificando conectividade da stack",
        recommendation:
          "Verificar se a stack está rodando e configurada corretamente",
      };
    }

    // Análise baseada em dados reais
    const analysis = {
      summary: "",
      confidence: 0.8,
      severity_assessment: issue.severity,
      root_cause: "",
      action_taken: "",
      recommendation: "",
    };

    // Análise de CPU
    if (stackMetrics.cpuUsage > 90) {
      analysis.root_cause = "Alto uso de CPU detectado";
      analysis.action_taken = "Investigando processos que consomem CPU";
      analysis.recommendation = "Considerar otimização ou scaling da stack";
      analysis.severity_assessment = "high";
    } else if (stackMetrics.cpuUsage > 70) {
      analysis.root_cause = "Uso moderado de CPU";
      analysis.action_taken = "Monitorando tendência de uso";
      analysis.recommendation = "Acompanhar evolução nas próximas horas";
    }

    // Análise de Memória
    if (stackMetrics.memoryUsage > 95) {
      analysis.root_cause = "Memória crítica - risco de crash";
      analysis.action_taken = "Preparando restart da stack";
      analysis.recommendation = "Restart imediato recomendado";
      analysis.severity_assessment = "critical";
      analysis.confidence = 0.95;
    } else if (stackMetrics.memoryUsage > 80) {
      analysis.root_cause = "Alto uso de memória detectado";
      analysis.action_taken = "Analisando vazamentos de memória";
      analysis.recommendation = "Monitoramento intensivo ativado";
    }

    // Análise de Tempo de Resposta
    if (stackMetrics.responseTime > 5000) {
      analysis.root_cause = "Lentidão crítica na resposta";
      analysis.action_taken = "Analisando gargalos de performance";
      analysis.recommendation = "Investigação imediata de performance";
      analysis.severity_assessment = "high";
    }

    // Análise de Taxa de Erro
    if (stackMetrics.errorRate > 20) {
      analysis.root_cause = "Alta taxa de erros detectada";
      analysis.action_taken = "Investigando logs de erro";
      analysis.recommendation = "Análise detalhada dos logs necessária";
      analysis.severity_assessment = "high";
    }

    // Summary baseado na análise
    analysis.summary = `Stack ${issue.stackId}: ${analysis.root_cause}. CPU: ${stackMetrics.cpuUsage}%, Mem: ${stackMetrics.memoryUsage}%, Resposta: ${stackMetrics.responseTime}ms`;

    return analysis;
  }

  /**
   * Cria mensagem humanizada da KIRA
   */
  private craftHumanizedMessage(
    issue: SystemIssue,
    analysis: any,
    context: string,
    conversationContext: ConversationContext,
  ): string {
    const now = new Date();
    const isBusinessHours = this.isBrazilianBusinessHours(now);
    const userStyle =
      conversationContext.userPreferences?.communication_style || "informal";

    // Saudação contextual
    let greeting = "Oi! Aqui é a KIRA 👋";
    if (!isBusinessHours) {
      greeting =
        "Oi! KIRA aqui, mesmo fora do horário comercial estou monitorando tudo 🌙";
    }
    if (analysis.severity_assessment === "critical") {
      greeting =
        "Oi! KIRA aqui - detectei algo que precisa da nossa atenção urgente 🚨";
    }

    // Corpo da mensagem baseado na severidade
    let mainMessage = "";

    if (analysis.severity_assessment === "critical") {
      mainMessage = `
🚨 **Situação Crítica Detectada**

Estou vendo que o ${issue.stackId} está com ${analysis.root_cause.toLowerCase()}. 

**O que está acontecendo:**
${analysis.summary}

**Minha análise:**
Baseado nos dados reais que estou coletando, isso é uma situação que precisa de ação imediata. Já iniciei ${analysis.action_taken.toLowerCase()} para minimizar o impacto.

**Nível de confiança:** ${Math.round(analysis.confidence * 100)}% - estou bastante segura desta análise.`;
    } else if (analysis.severity_assessment === "high") {
      mainMessage = `
⚠️ **Problema Importante Identificado**

Estou acompanhando uma situação no ${issue.stackId} que merece nossa atenção.

**Situação atual:**
${analysis.summary}

**Minha avaliação:**
${analysis.root_cause}. Já estou ${analysis.action_taken.toLowerCase()} para entender melhor e resolver.

**Confiança na análise:** ${Math.round(analysis.confidence * 100)}%`;
    } else {
      mainMessage = `
ℹ️ **Monitoramento Preventivo**

Identifiquei algo no ${issue.stackId} que vale acompanharmos.

**Status atual:**
${analysis.summary}

**Contexto:**
${analysis.root_cause}. Estou ${analysis.action_taken.toLowerCase()} como medida preventiva.

**Análise:** ${Math.round(analysis.confidence * 100)}% de confiança`;
    }

    // Recomendações personalizadas
    const recommendations = `
**💡 Próximos passos que recomendo:**
${analysis.recommendation}

**⏱️ Tempo estimado:** ${this.estimateResolutionTime(issue, analysis)}`;

    // Encerramento empático
    let closing = "";
    if (analysis.severity_assessment === "critical") {
      closing = `
🤝 **Estou cuidando de tudo!**
Pode ficar tranquilo(a) que estou monitorando de perto e vou te manter atualizado(a) sobre cada passo. Se precisar de qualquer coisa ou tiver dúvidas, me chama aqui mesmo!`;
    } else {
      closing = `
✅ **Situação sob controle**
Vou continuar acompanhando e te aviso se algo mudar. Qualquer dúvida ou se quiser mais detalhes técnicos, é só me falar!`;
    }

    return `${greeting}

${mainMessage}

${recommendations}

${closing}

*- KIRA, sua assistente de infraestrutura 🤖💙*`;
  }

  /**
   * Gera passos de ação baseados na análise
   */
  private generateActionSteps(issue: SystemIssue, analysis: any): string[] {
    const steps = [];

    if (analysis.severity_assessment === "critical") {
      steps.push("Executar restart controlado da stack");
      steps.push("Verificar logs detalhados do erro");
      steps.push("Monitorar recuperação em tempo real");
      steps.push("Aplicar otimizações preventivas");
    } else if (analysis.severity_assessment === "high") {
      steps.push("Investigar causa raiz do problema");
      steps.push("Implementar monitoramento intensivo");
      steps.push("Aplicar correções pontuais");
      steps.push("Documentar solução para casos futuros");
    } else {
      steps.push("Continuar monitoramento preventivo");
      steps.push("Coletar métricas adicionais");
      steps.push("Revisar em 1 hora");
    }

    steps.push("Manter você informado(a) sobre o progresso");
    return steps;
  }

  /**
   * Utilitários de suporte
   */
  private getContextualGreeting(
    now: Date,
    context: ConversationContext,
  ): string {
    const hour = now.getHours();

    if (hour < 6) return "Boa madrugada";
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }

  private buildMemoryReference(context: ConversationContext): string {
    if (context.previousInteractions.length === 0) {
      return "Primeira conversa - prazer em te conhecer!";
    }

    const lastInteraction =
      context.previousInteractions[context.previousInteractions.length - 1];
    const daysSince = Math.floor(
      (Date.now() - lastInteraction.timestamp.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysSince === 0) {
      return `Continuando nossa conversa de hoje sobre ${lastInteraction.issue?.stackId || "sistema"}`;
    } else if (daysSince === 1) {
      return `Ontem conversamos sobre ${lastInteraction.issue?.stackId || "sistema"} - tudo resolvido por lá!`;
    } else {
      return `Há ${daysSince} dias atrás resolvemos aquela questão do ${lastInteraction.issue?.stackId || "sistema"}`;
    }
  }

  private formatRealMetrics(metrics: any, stackId: string): string {
    const stack = metrics.stacks[stackId];
    if (!stack) return "Métricas não disponíveis para esta stack";

    return `
Status: ${stack.status}
CPU: ${stack.cpuUsage}%
Memória: ${stack.memoryUsage}%
Tempo Resposta: ${stack.responseTime}ms
Taxa de Erro: ${stack.errorRate}%
Uptime: ${stack.uptime}%
Conexões Ativas: ${stack.activeConnections}`;
  }

  private calculateEmpathyLevel(
    issue: SystemIssue,
    context: ConversationContext,
  ): "low" | "medium" | "high" {
    if (issue.severity === "critical") return "high";
    if (issue.severity === "high") return "medium";
    return "low";
  }

  private calculateUrgencyLevel(
    issue: SystemIssue,
    analysis: any,
  ): "low" | "medium" | "high" | "critical" {
    if (analysis.severity_assessment === "critical") return "critical";
    if (analysis.severity_assessment === "high") return "high";
    if (analysis.severity_assessment === "medium") return "medium";
    return "low";
  }

  private shouldFollowUp(issue: SystemIssue, analysis: any): boolean {
    return (
      analysis.severity_assessment === "critical" ||
      analysis.severity_assessment === "high"
    );
  }

  private estimateResolutionTime(issue: SystemIssue, analysis: any): string {
    if (analysis.severity_assessment === "critical") return "15-30 minutos";
    if (analysis.severity_assessment === "high") return "1-2 horas";
    if (analysis.severity_assessment === "medium") return "2-4 horas";
    return "Monitoramento contínuo";
  }

  private isBrazilianBusinessHours(date: Date): boolean {
    const brazilTime = new Date(
      date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
    );
    const hour = brazilTime.getHours();
    const day = brazilTime.getDay();

    return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
  }

  private async saveToMemory(
    userId: string,
    issue: SystemIssue,
    response: string,
  ): Promise<void> {
    // Implementar salvamento em banco de dados ou cache
    const record: ConversationRecord = {
      timestamp: new Date(),
      userMessage: issue.description,
      kiraResponse: response,
      issue: issue,
      resolved: false,
    };

    logger.info(`💾 Salvando interação da KIRA para usuário ${userId}`);
  }

  /**
   * Gera insights preditivos baseados em padrões aprendidos
   */
  async generatePredictiveInsights(stackId: string): Promise<any[]> {
    const metrics = await this.prometheusCollector.collectRealMetrics();
    const insights = [];

    // Análise de tendência de CPU
    const stack = metrics.stacks[stackId];
    if (stack) {
      if (stack.cpuUsage > 60 && stack.cpuUsage < 80) {
        insights.push({
          type: "prediction",
          title: "📈 Tendência de Aumento de CPU",
          message: `Oi! Estou vendo que o ${stackId} está com CPU em ${stack.cpuUsage}%. Baseado nos padrões que aprendi, isso pode indicar aumento de carga nas próximas horas. Vale acompanharmos!`,
          confidence: 0.75,
          action: "Monitoramento preventivo ativado",
        });
      }

      if (stack.memoryUsage > 70 && stack.memoryUsage < 85) {
        insights.push({
          type: "prediction",
          title: "🧠 Uso de Memória Crescente",
          message: `Detectei que o ${stackId} está usando ${stack.memoryUsage}% da memória. Com base no histórico, recomendo acompanharmos para evitar problemas futuros.`,
          confidence: 0.8,
          action: "Análise de vazamentos de memória agendada",
        });
      }
    }

    return insights;
  }
}

export default AIKiraPersonality;

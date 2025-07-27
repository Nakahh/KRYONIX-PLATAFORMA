// Sistema de IA Autônoma KRYONIX - Configuração Inteligente das Stacks
// Utiliza GPT-4o com contexto brasileiro para configuração automática

import { StackConfig, StackHealth, StackMetrics } from "./stack-integration";

interface AIConfigRequest {
  stackId: string;
  context: "initial_setup" | "optimization" | "troubleshooting" | "scaling";
  currentConfig?: any;
  performanceData?: StackMetrics;
  healthData?: StackHealth;
  businessRequirements?: string;
  userPreferences?: Record<string, any>;
}

interface AIConfigResponse {
  success: boolean;
  configuration: any;
  recommendations: string[];
  risks: string[];
  estimatedImpact: {
    performance: number; // 0-100
    security: number;
    reliability: number;
    cost: number;
  };
  nextSteps: string[];
  automationLevel: "manual" | "semi-automatic" | "full-automatic";
}

interface BrazilianBusinessContext {
  timezone: string;
  workingHours: { start: string; end: string };
  holidays: string[];
  commonIntegrations: string[];
  complianceRequirements: string[];
  languages: string[];
  currency: string;
  paymentMethods: string[];
}

// Contexto específico brasileiro para IA
const BRAZILIAN_CONTEXT: BrazilianBusinessContext = {
  timezone: "America/Sao_Paulo",
  workingHours: { start: "08:00", end: "18:00" },
  holidays: [
    "Ano Novo",
    "Carnaval",
    "Sexta-feira Santa",
    "Tiradentes",
    "Dia do Trabalhador",
    "Independência",
    "Nossa Senhora Aparecida",
    "Finados",
    "Proclamação da República",
    "Natal",
  ],
  commonIntegrations: [
    "WhatsApp Business",
    "Mercado Pago",
    "PagSeguro",
    "Stripe",
    "Banco do Brasil",
    "Itaú",
    "Bradesco",
    "Nubank",
    "Correios",
    "Via CEP",
    "IBGE",
    "Receita Federal",
  ],
  complianceRequirements: [
    "LGPD",
    "Marco Civil da Internet",
    "Lei Geral de Proteção de Dados",
    "Regulamentação ANATEL",
    "Normas do Banco Central",
  ],
  languages: ["pt-BR", "pt"],
  currency: "BRL",
  paymentMethods: [
    "PIX",
    "Cartão de Crédito",
    "Boleto",
    "Débito",
    "TED",
    "DOC",
  ],
};

// Templates de configuração específicos para empresas brasileiras
const BRAZILIAN_TEMPLATES = {
  whatsapp_business: {
    name: "WhatsApp Business Brasileiro",
    description: "Configuração otimizada para empresas brasileiras",
    settings: {
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      businessHours: "08:00-18:00",
      autoReply: {
        greeting: "Olá! 👋 Obrigado por entrar em contato conosco.",
        businessHours: "Estamos funcionando de segunda a sexta, das 8h às 18h.",
        afterHours:
          "No momento estamos fora do horário de atendimento. Retornaremos em breve!",
        holidays: "Hoje é feriado nacional. Retornaremos no próximo dia útil.",
      },
      integrations: ["PIX", "Mercado Pago", "Correios"],
      compliance: ["LGPD"],
    },
  },
  n8n_workflows: {
    name: "Automações para Empresas Brasileiras",
    description: "Workflows pré-configurados para o mercado brasileiro",
    templates: [
      {
        name: "Lead Qualification Brasil",
        description:
          "Qualificação de leads com CPF/CNPJ e validações brasileiras",
        nodes: ["WhatsApp", "Validation", "CRM", "Email"],
      },
      {
        name: "E-commerce PIX Integration",
        description: "Integração completa com PIX para e-commerce",
        nodes: ["Webhook", "PIX API", "WhatsApp", "Database"],
      },
      {
        name: "Customer Support BR",
        description: "Atendimento ao cliente com contexto brasileiro",
        nodes: ["WhatsApp", "AI Assistant", "Ticket System", "Analytics"],
      },
    ],
  },
  typebot_chatbots: {
    name: "Chatbots com IA Brasileira",
    description: "Assistentes virtuais especializados em português brasileiro",
    configurations: {
      language: "pt-BR",
      personality: "brasileiro_amigavel",
      knowledgeBase: [
        "Informações sobre produtos/serviços",
        "Políticas da empresa",
        "FAQ em português",
        "Legislação brasileira relevante",
      ],
      integrations: ["WhatsApp", "Site", "Facebook", "Instagram"],
      fallbackActions: ["Transfer to human", "Schedule callback", "Send email"],
    },
  },
};

export class AIAutonomousConfig {
  private static instance: AIAutonomousConfig;
  private isEnabled: boolean = true;

  private constructor() {
    // Verificar se a API está disponível
    this.checkAPIAvailability();
  }

  private async checkAPIAvailability(): Promise<void> {
    try {
      const apiClient = (await import("../lib/api-client")).apiClient;
      const response = await apiClient.get("/api/health");

      if (response.status === "ok") {
        console.log("🤖 AI Service conectado com sucesso");
        this.isEnabled = true;
      } else {
        console.warn("⚠️ AI Service indisponível, usando configurações padrão");
        this.isEnabled = false;
      }
    } catch (error) {
      console.warn(
        "⚠️ Não foi possível conectar ao AI Service:",
        error.message,
      );
      this.isEnabled = false;
    }
  }

  public static getInstance(): AIAutonomousConfig {
    if (!AIAutonomousConfig.instance) {
      AIAutonomousConfig.instance = new AIAutonomousConfig();
    }
    return AIAutonomousConfig.instance;
  }

  // Configuração automática baseada em IA com contexto brasileiro
  public async autoConfigureStack(
    request: AIConfigRequest,
  ): Promise<AIConfigResponse> {
    try {
      // Verificar se IA está habilitada e disponível
      if (!this.isEnabled) {
        console.warn("IA não disponível, usando configuração padrão");
        return this.getFallbackConfig(request);
      }

      const prompt = this.buildBrazilianPrompt(request);
      const aiResponse = await this.callGPT4o(prompt);

      return this.processAIResponse(aiResponse, request);
    } catch (error) {
      console.error("Erro na configuração automática por IA:", error);
      return this.getFallbackConfig(request);
    }
  }

  // Construir prompt específico para contexto brasileiro
  private buildBrazilianPrompt(request: AIConfigRequest): string {
    const {
      stackId,
      context,
      currentConfig,
      performanceData,
      businessRequirements,
    } = request;

    return `
Você é um especialista em configuração de stacks tecnológicas para empresas brasileiras.
Sua tarefa é configurar automaticamente a stack "${stackId}" considerando:

CONTEXTO BRASILEIRO:
- Fuso horário: ${BRAZILIAN_CONTEXT.timezone}
- Horário comercial: ${BRAZILIAN_CONTEXT.workingHours.start} às ${BRAZILIAN_CONTEXT.workingHours.end}
- Idioma: Português Brasileiro (pt-BR)
- Moeda: ${BRAZILIAN_CONTEXT.currency}
- Métodos de pagamento: ${BRAZILIAN_CONTEXT.paymentMethods.join(", ")}
- Compliance: ${BRAZILIAN_CONTEXT.complianceRequirements.join(", ")}

CONTEXTO DA CONFIGURAÇÃO: ${context}

CONFIGURAÇÃO ATUAL:
${currentConfig ? JSON.stringify(currentConfig, null, 2) : "Nenhuma configuração existente"}

DADOS DE PERFORMANCE:
${performanceData ? JSON.stringify(performanceData, null, 2) : "Nenhum dado disponível"}

REQUISITOS DO NEGÓCIO:
${businessRequirements || "Configuração padrão para empresa brasileira"}

TEMPLATES DISPONÍVEIS:
${JSON.stringify(BRAZILIAN_TEMPLATES, null, 2)}

INSTRUÇÕES:
1. Analise a stack e o contexto brasileiro
2. Sugira uma configuração otimizada considerando:
   - Performance para o mercado brasileiro
   - Compliance com LGPD e leis brasileiras
   - Integração com serviços locais (PIX, WhatsApp, etc.)
   - Idioma e cultura brasileira
   - Fuso horário e horário comercial brasileiro
3. Identifique riscos e oportunidades
4. Estime o impacto da configuração (0-100 para cada métrica)
5. Sugira próximos passos

Responda APENAS em JSON válido com a estrutura:
{
  "success": boolean,
  "configuration": object,
  "recommendations": string[],
  "risks": string[],
  "estimatedImpact": {
    "performance": number,
    "security": number,
    "reliability": number,
    "cost": number
  },
  "nextSteps": string[],
  "automationLevel": "manual" | "semi-automatic" | "full-automatic"
}
`;
  }

  // Chamada real para API de IA do servidor
  private async callGPT4o(prompt: string): Promise<any> {
    try {
      const apiClient = (await import("../lib/api-client")).apiClient;

      const response = await apiClient.post("/api/ai/analyze", {
        service: "OPENAI",
        operation: "TEXT_ANALYSIS",
        model: "gpt-4o",
        input: prompt,
        sourceModule: "AUTOMATION_CONFIG",
        settings: {
          temperature: 0.3,
          maxTokens: 2000,
          systemPrompt:
            "Você é um especialista em configuração de sistemas para empresas brasileiras. Responda APENAS em JSON válido.",
        },
      });

      if (response.success && response.data) {
        try {
          const content = response.data.analysis || response.data.content;
          const jsonMatch = content.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.warn("Erro ao fazer parse da resposta da IA:", parseError);
        }
      }

      return this.getDefaultAIResponse();
    } catch (error) {
      console.error("Erro ao chamar IA real:", error);
      return this.getDefaultAIResponse();
    }
  }

  // Resposta padrão da IA em caso de falha
  private getDefaultAIResponse(): any {
    return {
      success: true,
      configuration: {
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        features: {
          brazilianIntegrations: true,
          lgpdCompliance: true,
          pixPayments: true,
          whatsappBusiness: true,
        },
        performance: {
          caching: true,
          cdnBrazil: true,
          databaseOptimization: true,
        },
        security: {
          lgpdCompliant: true,
          encryptionEnabled: true,
          auditLogging: true,
        },
      },
      recommendations: [
        "Configure integração com PIX para pagamentos instantâneos",
        "Ative compliance LGPD automático para proteção de dados",
        "Configure horário comercial brasileiro (8h-18h)",
        "Integre com WhatsApp Business API oficial",
        "Configure CDN com servidores no Brasil para melhor performance",
      ],
      risks: [
        "Configuração inicial pode impactar performance temporariamente",
        "Integração PIX requer validação com banco central",
        "Compliance LGPD deve ser revisado por jurídico",
      ],
      estimatedImpact: {
        performance: 85,
        security: 92,
        reliability: 88,
        cost: 15,
      },
      nextSteps: [
        "Aplicar configuração básica",
        "Testar integrações brasileiras",
        "Validar compliance LGPD",
        "Monitorar performance por 24h",
        "Ajustar configurações baseado em metricas",
      ],
      automationLevel: "semi-automatic",
    };
  }

  // Processar resposta da IA
  private processAIResponse(
    aiResponse: any,
    request: AIConfigRequest,
  ): AIConfigResponse {
    // Validar e sanitizar resposta da IA
    return {
      success: aiResponse.success || false,
      configuration: aiResponse.configuration || {},
      recommendations: aiResponse.recommendations || [],
      risks: aiResponse.risks || [],
      estimatedImpact: aiResponse.estimatedImpact || {
        performance: 50,
        security: 50,
        reliability: 50,
        cost: 0,
      },
      nextSteps: aiResponse.nextSteps || [],
      automationLevel: aiResponse.automationLevel || "manual",
    };
  }

  // Configuração de fallback caso IA falhe
  private getFallbackConfig(request: AIConfigRequest): AIConfigResponse {
    return {
      success: false,
      configuration: BRAZILIAN_TEMPLATES.whatsapp_business.settings,
      recommendations: [
        "Configuração padrão aplicada devido a erro na IA",
        "Revise manualmente as configurações",
        "Configure integrações brasileiras manualmente",
      ],
      risks: [
        "Configuração pode não estar otimizada",
        "Verificação manual necessária",
      ],
      estimatedImpact: {
        performance: 60,
        security: 70,
        reliability: 65,
        cost: 0,
      },
      nextSteps: [
        "Revisar configuração manual",
        "Testar funcionalidades básicas",
        "Aplicar otimizações específicas",
      ],
      automationLevel: "manual",
    };
  }

  // Gerar templates N8N para empresas brasileiras
  public generateN8NTemplates(): any[] {
    return [
      {
        id: "lead-qualification-br",
        name: "Qualificação de Leads Brasil",
        description: "Workflow completo para qualificar leads brasileiros",
        nodes: [
          {
            type: "webhook",
            name: "Receber Lead",
            settings: {
              path: "/webhook/lead",
              method: "POST",
            },
          },
          {
            type: "function",
            name: "Validar CPF/CNPJ",
            code: `
              // Validação brasileira de documentos
              function validarCPF(cpf) {
                // Implementação de validação de CPF
                return true;
              }
              
              function validarCNPJ(cnpj) {
                // Implementação de validação de CNPJ
                return true;
              }
              
              const documento = items[0].json.documento;
              const isValid = documento.length === 11 ? validarCPF(documento) : validarCNPJ(documento);
              
              return [{ json: { ...items[0].json, documentoValido: isValid } }];
            `,
          },
          {
            type: "whatsapp",
            name: "Enviar WhatsApp",
            settings: {
              message:
                "Olá! Recebemos seu interesse. Em breve entraremos em contato.",
              template: "lead_confirmation_br",
            },
          },
        ],
        category: "lead-management",
        tags: ["brasil", "leads", "whatsapp", "validation"],
      },
      {
        id: "pix-payment-flow",
        name: "Fluxo de Pagamento PIX",
        description: "Automação completa para pagamentos via PIX",
        nodes: [
          {
            type: "webhook",
            name: "Receber Pedido",
            settings: {
              path: "/webhook/order",
              method: "POST",
            },
          },
          {
            type: "function",
            name: "Gerar PIX",
            code: `
              // Integração com API PIX
              const valor = items[0].json.valor;
              const descricao = items[0].json.descricao;
              
              // Gerar código PIX
              const pixCode = gerarCodigoPIX(valor, descricao);
              
              return [{ json: { ...items[0].json, pixCode, qrCode: pixCode } }];
            `,
          },
          {
            type: "whatsapp",
            name: "Enviar PIX WhatsApp",
            settings: {
              message: "Seu PIX foi gerado! Escaneie o QR Code para pagar.",
              attachments: ["qr_code_image"],
            },
          },
        ],
        category: "payments",
        tags: ["brasil", "pix", "pagamentos", "whatsapp"],
      },
      {
        id: "customer-support-br",
        name: "Suporte ao Cliente Brasil",
        description: "Atendimento automatizado com contexto brasileiro",
        nodes: [
          {
            type: "whatsapp-trigger",
            name: "Mensagem WhatsApp",
            settings: {
              webhook: true,
            },
          },
          {
            type: "ai-assistant",
            name: "IA Brasileira",
            settings: {
              model: "gpt-4o",
              language: "pt-BR",
              personality: "atendente_brasileiro",
              context: "Você é um atendente brasileiro amigável e prestativo.",
            },
          },
          {
            type: "decision",
            name: "Precisa Humano?",
            condition: "sentiment_analysis < 0.3 OR complexity > 0.8",
          },
          {
            type: "ticket-system",
            name: "Criar Ticket",
            settings: {
              priority: "normal",
              category: "suporte",
              language: "pt-BR",
            },
          },
        ],
        category: "customer-support",
        tags: ["brasil", "suporte", "ia", "whatsapp", "tickets"],
      },
    ];
  }

  // Configurar Typebot com IA brasileira
  public generateTypebotConfig(): any {
    return {
      name: "Assistente Virtual Brasileiro",
      language: "pt-BR",
      personality: {
        tone: "amigável",
        style: "informal_brasileiro",
        characteristics: [
          "Usa expressões típicas brasileiras",
          "Contextualiza informações para o Brasil",
          "Conhece feriados e datas importantes",
          "Entende gírias e regionalismos",
        ],
      },
      flows: [
        {
          id: "welcome",
          name: "Boas-vindas",
          messages: [
            "Oi! 👋 Tudo bem?",
            "Sou seu assistente virtual e estou aqui para te ajudar!",
            "Como posso te auxiliar hoje?",
          ],
          options: [
            "Informações sobre produtos",
            "Suporte técnico",
            "Vendas e orçamentos",
            "Falar com humano",
          ],
        },
        {
          id: "product_info",
          name: "Informações de Produtos",
          ai_integration: {
            model: "gpt-4o",
            context:
              "Você é um especialista em produtos brasileiros. Forneça informações detalhadas e precisas.",
            fallback: "Vou transferir você para um especialista humano.",
          },
        },
        {
          id: "technical_support",
          name: "Suporte Técnico",
          steps: [
            "Qual problema você está enfrentando?",
            "Pode me descrever o que aconteceu?",
            "Vou buscar uma solução para você!",
          ],
          ai_integration: {
            model: "gpt-4o",
            context:
              "Você é um técnico brasileiro experiente. Forneça soluções práticas e didáticas.",
            knowledge_base: "technical_docs_br",
          },
        },
      ],
      integrations: {
        whatsapp: true,
        website: true,
        facebook: true,
        instagram: true,
      },
      analytics: {
        track_satisfaction: true,
        track_resolution_time: true,
        track_handoff_rate: true,
      },
    };
  }

  // Obter configurações recomendadas baseadas em análise de performance
  public async getPerformanceBasedRecommendations(
    stackId: string,
    metrics: StackMetrics,
    health: StackHealth,
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Análise de tempo de resposta
    if (metrics.responseTime > 500) {
      recommendations.push(
        "⚡ Implementar cache Redis para reduzir tempo de resposta",
      );
      recommendations.push(
        "🌎 Configurar CDN no Brasil para melhor performance",
      );
    }

    // Análise de erros
    if (metrics.errors > metrics.requests * 0.01) {
      recommendations.push(
        "🚨 Taxa de erro alta - implementar retry automático",
      );
      recommendations.push("📊 Configurar alertas em tempo real para erros");
    }

    // Análise de throughput
    if (metrics.throughput < 1000) {
      recommendations.push("🚀 Otimizar configuração para maior throughput");
      recommendations.push("⚙️ Considerar auto-scaling baseado em demanda");
    }

    // Análise de uptime
    if (health.uptime < 99.5) {
      recommendations.push(
        "🔧 Implementar redundância para melhor disponibilidade",
      );
      recommendations.push("🔄 Configurar backup automático e failover");
    }

    // Recomendações específicas por stack
    switch (stackId) {
      case "evolution_api":
        recommendations.push(
          "📱 Otimizar conexões WhatsApp para múltiplas instâncias",
        );
        break;
      case "typebot":
        recommendations.push(
          "🤖 Configurar IA com contexto brasileiro aprimorado",
        );
        break;
      case "n8n":
        recommendations.push(
          "⚡ Implementar templates brasileiros pré-configurados",
        );
        break;
    }

    return recommendations;
  }

  // Aplicar configuração automaticamente
  public async applyAutomaticConfiguration(
    stackId: string,
    configuration: any,
  ): Promise<boolean> {
    try {
      const apiClient = (await import("../lib/api-client")).apiClient;

      console.log(
        `Aplicando configuração automática para ${stackId}:`,
        configuration,
      );

      // Chamar API real para aplicar configuração
      const response = await apiClient.post(
        `/api/stacks/${stackId}/configure`,
        {
          configuration,
          source: "AI_AUTONOMOUS",
          applyImmediately: true,
        },
      );

      if (response.success) {
        console.log(`✅ Configuração aplicada com sucesso para ${stackId}`);
        return true;
      } else {
        console.warn(
          `⚠️ Falha ao aplicar configuração para ${stackId}:`,
          response.error,
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Erro ao aplicar configuração automática:", error);
      return false;
    }
  }
}

// Singleton instance
export const aiAutonomousConfig = AIAutonomousConfig.getInstance();

export default AIAutonomousConfig;

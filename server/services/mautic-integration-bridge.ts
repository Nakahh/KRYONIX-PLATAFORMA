import { MauticService } from "./mautic";
import { WhatsAppService } from "./whatsapp";
import { TypebotService } from "./typebot";
import { AIService } from "./ai";
import { N8NService } from "./n8n";
import { Message } from "../entities/Message";
import { WhatsAppInstance } from "../entities/WhatsAppInstance";
import { MauticLead, LeadSource, LeadStatus } from "../entities/MauticLead";
import { MauticInstance } from "../entities/MauticInstance";
import { TypebotSession } from "../entities/TypebotSession";
import {
  AIServiceType,
  AIOperationType,
  AISourceModule,
} from "../entities/AIServiceUsage";
import { DatabaseConnection } from "../db/connection";

export interface LeadEnrichmentResult {
  success: boolean;
  leadId: string;
  enrichedData: any;
  aiScore: number;
  segmentSuggestions: string[];
  campaignRecommendations: string[];
  nextActions: string[];
}

export interface AutomationTriggerResult {
  success: boolean;
  triggeredCampaigns: string[];
  scheduledActions: string[];
  n8nWorkflowsTriggered: string[];
  typebotFlowsActivated: string[];
}

export class MauticIntegrationBridge {
  /**
   * Processa mensagem do WhatsApp e integra com Mautic
   */
  static async processWhatsAppMessage(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<LeadEnrichmentResult> {
    try {
      // 1. Sincronizar/criar lead no Mautic
      const lead = await MauticService.syncFromWhatsApp(message);

      if (!lead) {
        throw new Error("Falha ao criar/sincronizar lead no Mautic");
      }

      // 2. Enriquecer dados com IA
      const enrichmentResult = await this.enrichLeadWithAI(lead, message);

      // 3. Atualizar segmentação automática
      const segments = await this.suggestSegments(
        lead,
        enrichmentResult.aiAnalysis,
      );

      // 4. Recomendar campanhas baseadas no perfil
      const campaigns = await this.recommendCampaigns(
        lead,
        enrichmentResult.aiAnalysis,
      );

      // 5. Definir próximas ações automáticas
      const nextActions = await this.generateNextActions(
        lead,
        enrichmentResult.aiAnalysis,
      );

      return {
        success: true,
        leadId: lead.id,
        enrichedData: enrichmentResult.enrichedData,
        aiScore: enrichmentResult.aiScore,
        segmentSuggestions: segments,
        campaignRecommendations: campaigns,
        nextActions,
      };
    } catch (error) {
      console.error("Erro na integração WhatsApp → Mautic:", error);
      return {
        success: false,
        leadId: "",
        enrichedData: {},
        aiScore: 0,
        segmentSuggestions: [],
        campaignRecommendations: [],
        nextActions: [],
      };
    }
  }

  /**
   * Enriquece dados do lead usando IA
   */
  private static async enrichLeadWithAI(
    lead: MauticLead,
    message: Message,
  ): Promise<{
    enrichedData: any;
    aiScore: number;
    aiAnalysis: any;
  }> {
    const enrichedData = { ...lead.leadData };
    let aiScore = lead.aiScore || 0;
    let aiAnalysis = {};

    try {
      // Análise de sentimento da mensagem
      const sentimentResult = await AIService.processRequest(lead.tenantId, {
        service: AIServiceType.GOOGLE,
        operation: AIOperationType.SENTIMENT_ANALYSIS,
        input: message.content?.text || "",
        sourceModule: AISourceModule.WHATSAPP,
        metadata: {
          leadId: lead.id,
          messageId: message.id,
        },
      });

      if (sentimentResult.success) {
        enrichedData.sentiment = sentimentResult.data.sentiment;
        enrichedData.sentimentScore = sentimentResult.data.score;
        aiAnalysis.sentiment = sentimentResult.data;
      }

      // Classificação de intenção
      const intentResult = await AIService.processRequest(lead.tenantId, {
        service: AIServiceType.OPENAI,
        operation: AIOperationType.INTENT_CLASSIFICATION,
        input: message.content?.text || "",
        settings: {
          systemPrompt: `Classifique a intenção desta mensagem WhatsApp em uma das categorias:
            - interesse_produto: interessado em produtos/serviços
            - solicita_informacao: pedindo informações
            - reclamacao: fazendo reclamação
            - elogio: dando feedback positivo
            - suporte: precisando de ajuda técnica
            - negociacao: negociando preços/condições
            - agendamento: querendo agendar algo
            - cancelamento: querendo cancelar algo
            - outros: outras intenções
            
            Responda apenas com a categoria e um score de confiança 0-10.`,
        },
        sourceModule: AISourceModule.WHATSAPP,
      });

      if (intentResult.success) {
        try {
          const intentData =
            typeof intentResult.data.content === "string"
              ? JSON.parse(intentResult.data.content)
              : intentResult.data;

          enrichedData.intent = intentData.intent || "outros";
          enrichedData.intentConfidence = intentData.confidence || 0.5;
          aiAnalysis.intent = intentData;
        } catch {
          enrichedData.intent = "outros";
          enrichedData.intentConfidence = 0.1;
        }
      }

      // Análise de perfil do cliente (lead scoring)
      const profileResult = await AIService.processRequest(lead.tenantId, {
        service: AIServiceType.OPENAI,
        operation: AIOperationType.TEXT_ANALYSIS,
        input: JSON.stringify({
          mensagem: message.content?.text,
          historico: lead.leadData,
          engajamento: lead.engagementScore,
        }),
        settings: {
          systemPrompt: `Analise este lead de marketing e atribua um score de 1-10 baseado em:
            
            Critérios de Scoring:
            - Interesse demonstrado na mensagem (1-3 pontos)
            - Qualidade da comunicação (1-2 pontos)  
            - Potencial de conversão (1-3 pontos)
            - Fit com produto/serviço (1-2 pontos)
            
            Retorne JSON com:
            {
              "score": número de 1-10,
              "razao": "explicação do score",
              "categoria": "quente|morno|frio",
              "proximas_acoes": ["acao1", "acao2"],
              "segmento_sugerido": "nome_do_segmento"
            }`,
        },
        sourceModule: AISourceModule.WHATSAPP,
      });

      if (profileResult.success) {
        try {
          const profileData =
            typeof profileResult.data.content === "string"
              ? JSON.parse(profileResult.data.content)
              : profileResult.data;

          aiScore = profileData.score || aiScore;
          enrichedData.aiCategory = profileData.categoria;
          enrichedData.suggestedSegment = profileData.segmento_sugerido;
          enrichedData.nextActions = profileData.proximas_acoes;
          aiAnalysis.profile = profileData;

          // Atualizar score no lead
          lead.updateAIScore(
            aiScore,
            profileData.razao || "Análise automática via WhatsApp",
          );
        } catch (error) {
          console.error("Erro ao processar análise de perfil:", error);
        }
      }

      // Atualizar dados do lead
      lead.leadData = enrichedData;

      const dataSource = await DatabaseConnection.getInstance();
      const leadRepo = dataSource.getRepository(MauticLead);
      await leadRepo.save(lead);

      return {
        enrichedData,
        aiScore,
        aiAnalysis,
      };
    } catch (error) {
      console.error("Erro no enriquecimento com IA:", error);
      return {
        enrichedData,
        aiScore,
        aiAnalysis,
      };
    }
  }

  /**
   * Sugere segmentos baseados na análise de IA
   */
  private static async suggestSegments(
    lead: MauticLead,
    aiAnalysis: any,
  ): Promise<string[]> {
    const segments: string[] = [];

    try {
      // Segmentação por intenção
      if (aiAnalysis.intent?.intent) {
        switch (aiAnalysis.intent.intent) {
          case "interesse_produto":
            segments.push("Interessados em Produtos");
            break;
          case "solicita_informacao":
            segments.push("Solicitantes de Informação");
            break;
          case "reclamacao":
            segments.push("Atendimento Prioritário");
            break;
          case "elogio":
            segments.push("Clientes Satisfeitos");
            break;
          case "suporte":
            segments.push("Suporte Técnico");
            break;
          case "negociacao":
            segments.push("Em Negociação");
            break;
        }
      }

      // Segmentação por score de IA
      if (lead.aiScore >= 8) {
        segments.push("Leads Quentes");
      } else if (lead.aiScore >= 5) {
        segments.push("Leads Mornos");
      } else {
        segments.push("Leads Frios");
      }

      // Segmentação por sentimento
      if (aiAnalysis.sentiment?.sentiment === "positive") {
        segments.push("Sentimento Positivo");
      } else if (aiAnalysis.sentiment?.sentiment === "negative") {
        segments.push("Sentimento Negativo - Atenção");
      }

      // Segmentação por região (se disponível)
      if (lead.leadData.region) {
        segments.push(`Região ${lead.leadData.region}`);
      }

      // Segmentação por fonte
      segments.push(`Origem ${lead.leadData.source}`);

      // Segmentação por tipo de cliente
      if (lead.isBusiness()) {
        segments.push("Clientes B2B");
      } else {
        segments.push("Clientes B2C");
      }

      return segments;
    } catch (error) {
      console.error("Erro ao sugerir segmentos:", error);
      return [];
    }
  }

  /**
   * Recomenda campanhas baseadas no perfil do lead
   */
  private static async recommendCampaigns(
    lead: MauticLead,
    aiAnalysis: any,
  ): Promise<string[]> {
    const campaigns: string[] = [];

    try {
      // Campanhas por intenção
      if (aiAnalysis.intent?.intent) {
        switch (aiAnalysis.intent.intent) {
          case "interesse_produto":
            campaigns.push("Nutrição - Produtos");
            campaigns.push("Oferta Especial");
            break;
          case "solicita_informacao":
            campaigns.push("Série Educativa");
            campaigns.push("FAQ Automático");
            break;
          case "reclamacao":
            campaigns.push("Recuperação de Cliente");
            campaigns.push("Atendimento VIP");
            break;
          case "elogio":
            campaigns.push("Programa de Fidelidade");
            campaigns.push("Indicação de Amigos");
            break;
          case "suporte":
            campaigns.push("Tutorial em Vídeo");
            campaigns.push("Suporte Técnico");
            break;
          case "negociacao":
            campaigns.push("Proposta Personalizada");
            campaigns.push("Desconto Especial");
            break;
        }
      }

      // Campanhas por score
      if (lead.aiScore >= 8) {
        campaigns.push("Abordagem Comercial Imediata");
        campaigns.push("Oferta Premium");
      } else if (lead.aiScore >= 5) {
        campaigns.push("Nutrição Acelerada");
        campaigns.push("Conteúdo de Valor");
      } else {
        campaigns.push("Aquecimento de Lead");
        campaigns.push("Educação Básica");
      }

      // Campanhas por região
      if (lead.leadData.region) {
        campaigns.push(`Ofertas Regionais - ${lead.leadData.region}`);
      }

      // Campanhas por tipo de cliente
      if (lead.isBusiness()) {
        campaigns.push("Soluções B2B");
        campaigns.push("Case Studies Corporativos");
      } else {
        campaigns.push("Ofertas B2C");
        campaigns.push("Depoimentos de Clientes");
      }

      return campaigns;
    } catch (error) {
      console.error("Erro ao recomendar campanhas:", error);
      return [];
    }
  }

  /**
   * Gera próximas ações automáticas
   */
  private static async generateNextActions(
    lead: MauticLead,
    aiAnalysis: any,
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      // Ações baseadas na intenção
      if (aiAnalysis.intent?.intent) {
        switch (aiAnalysis.intent.intent) {
          case "interesse_produto":
            actions.push("Enviar catálogo via WhatsApp");
            actions.push("Agendar demonstração");
            actions.push("Calcular proposta personalizada");
            break;
          case "solicita_informacao":
            actions.push("Enviar FAQ automático");
            actions.push("Adicionar à campanha educativa");
            break;
          case "reclamacao":
            actions.push("Escalação para atendimento humano");
            actions.push("Priorizar na fila de suporte");
            actions.push("Ativar protocolo de recuperação");
            break;
          case "elogio":
            actions.push("Solicitar avaliação pública");
            actions.push("Oferecer programa de indicação");
            break;
          case "suporte":
            actions.push("Encaminhar para base de conhecimento");
            actions.push("Agendar suporte técnico");
            break;
          case "negociacao":
            actions.push("Preparar proposta personalizada");
            actions.push("Agendar reunião comercial");
            break;
        }
      }

      // Ações baseadas no score
      if (lead.aiScore >= 8) {
        actions.push("Notificar equipe de vendas");
        actions.push("Criar oportunidade no CRM");
        actions.push("Priorizar no pipeline");
      } else if (lead.aiScore >= 5) {
        actions.push("Adicionar à nutrição acelerada");
        actions.push("Enviar conteúdo personalizado");
      } else {
        actions.push("Iniciar sequência de aquecimento");
        actions.push("Coletar mais informações");
      }

      // Ações baseadas no sentimento
      if (aiAnalysis.sentiment?.sentiment === "negative") {
        actions.push("Intervenção manual obrigatória");
        actions.push("Notificar gestor de relacionamento");
        actions.push("Ativar protocolo de recuperação");
      }

      // Ações baseadas no engajamento
      if (lead.engagementScore > 10) {
        actions.push("Lead altamente engajado - ação comercial");
      } else if (lead.engagementScore < 2) {
        actions.push("Baixo engajamento - revisar estratégia");
      }

      return actions;
    } catch (error) {
      console.error("Erro ao gerar próximas ações:", error);
      return [];
    }
  }

  /**
   * Integra com Typebot baseado no perfil do lead
   */
  static async integrateWithTypebot(
    lead: MauticLead,
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<AutomationTriggerResult> {
    const result: AutomationTriggerResult = {
      success: false,
      triggeredCampaigns: [],
      scheduledActions: [],
      n8nWorkflowsTriggered: [],
      typebotFlowsActivated: [],
    };

    try {
      // Buscar flows do Typebot adequados para o lead
      const typebotFlows = await TypebotService.getTenantFlows(lead.tenantId);

      for (const flow of typebotFlows) {
        if (!flow.isPublished) continue;

        // Verificar se o flow é adequado para o perfil do lead
        const isMatch = await this.matchFlowToLead(flow, lead);

        if (isMatch) {
          try {
            // Ativar flow do Typebot
            const session = await TypebotService.createSession(
              flow.id,
              lead.tenantId,
              "WHATSAPP",
              {
                phone: lead.phone,
                name: lead.getFullName(),
                instanceId: instance.id,
                leadData: lead.leadData,
              },
            );

            if (session) {
              result.typebotFlowsActivated.push(flow.id);

              // Processar mensagem no flow
              await TypebotService.continueSession(
                session.id,
                message.content?.text || "",
                lead.tenantId,
              );
            }
          } catch (error) {
            console.error(`Erro ao ativar flow ${flow.id}:`, error);
          }
        }
      }

      result.success = result.typebotFlowsActivated.length > 0;
      return result;
    } catch (error) {
      console.error("Erro na integração com Typebot:", error);
      return result;
    }
  }

  /**
   * Verifica se um flow do Typebot combina com o perfil do lead
   */
  private static async matchFlowToLead(
    flow: any,
    lead: MauticLead,
  ): Promise<boolean> {
    try {
      // Matching por tipo de flow
      switch (flow.type) {
        case "LEAD_CAPTURE":
          return lead.status === LeadStatus.NEW;

        case "CUSTOMER_SUPPORT":
          return (
            lead.leadData.intent === "suporte" ||
            lead.leadData.intent === "reclamacao"
          );

        case "PRODUCT_SHOWCASE":
          return (
            lead.leadData.intent === "interesse_produto" || lead.aiScore >= 5
          );

        case "APPOINTMENT_BOOKING":
          return lead.leadData.intent === "agendamento" || lead.aiScore >= 7;

        default:
          return false;
      }
    } catch (error) {
      console.error("Erro no matching flow-lead:", error);
      return false;
    }
  }

  /**
   * Integra com workflows N8N baseado em eventos do Mautic
   */
  static async integrateWithN8N(
    lead: MauticLead,
    event: string,
    data?: any,
  ): Promise<string[]> {
    const triggeredWorkflows: string[] = [];

    try {
      const workflowMappings = {
        lead_created: ["mautic_lead_created", "lead_scoring_workflow"],
        lead_updated: ["mautic_lead_updated", "segmentation_workflow"],
        high_score_achieved: ["hot_lead_notification", "sales_alert_workflow"],
        negative_sentiment: [
          "customer_recovery_workflow",
          "urgent_response_workflow",
        ],
        campaign_completed: ["post_campaign_analysis", "next_campaign_trigger"],
      };

      const workflows = workflowMappings[event] || [];

      for (const workflowId of workflows) {
        try {
          await N8NService.triggerWorkflow(workflowId, {
            leadId: lead.id,
            tenantId: lead.tenantId,
            event,
            leadData: lead.leadData,
            aiScore: lead.aiScore,
            engagementScore: lead.engagementScore,
            ...data,
          });

          triggeredWorkflows.push(workflowId);
        } catch (error) {
          console.error(`Erro ao disparar workflow ${workflowId}:`, error);
        }
      }

      return triggeredWorkflows;
    } catch (error) {
      console.error("Erro na integração com N8N:", error);
      return [];
    }
  }

  /**
   * Processa dados coletados do Typebot para Mautic
   */
  static async processTypebotData(
    session: TypebotSession,
    collectedData: Record<string, any>,
  ): Promise<void> {
    try {
      // Buscar lead existente ou criar novo
      const dataSource = await DatabaseConnection.getInstance();
      const leadRepo = dataSource.getRepository(MauticLead);

      let lead = await leadRepo.findOne({
        where: {
          phone: collectedData.phone || session.context.contactPhone,
          tenantId: session.tenantId,
        },
      });

      if (!lead) {
        // Criar novo lead com dados do Typebot
        const mauticInstances = await dataSource
          .getRepository(MauticInstance)
          .find({
            where: { tenantId: session.tenantId, status: "ACTIVE" },
          });

        if (mauticInstances.length > 0) {
          lead = await MauticService.createLead(
            mauticInstances[0].id,
            {
              ...collectedData,
              source: LeadSource.TYPEBOT,
              consentMarketing: collectedData.consent_marketing || false,
              consentDataProcessing: collectedData.consent_data || true,
            },
            LeadSource.TYPEBOT,
          );
        }
      } else {
        // Atualizar lead existente com novos dados
        Object.assign(lead.leadData, collectedData);

        // Atualizar engajamento
        lead.updateEngagementScore("typebot_completion", 5);

        // Marcar para sincronização
        lead.syncStatus = "PENDING";

        await leadRepo.save(lead);
      }

      if (lead) {
        // Disparar análise de IA nos dados coletados
        const aiResult = await AIService.processRequest(session.tenantId, {
          service: AIServiceType.OPENAI,
          operation: AIOperationType.TEXT_ANALYSIS,
          input: JSON.stringify(collectedData),
          settings: {
            systemPrompt:
              "Analise estes dados coletados via chatbot e forneça um score de qualificação de 1-10 e sugestões de próximas ações.",
          },
          sourceModule: AISourceModule.TYPEBOT,
          metadata: {
            sessionId: session.id,
            leadId: lead.id,
          },
        });

        if (aiResult.success && aiResult.data) {
          try {
            const analysis =
              typeof aiResult.data.content === "string"
                ? JSON.parse(aiResult.data.content)
                : aiResult.data;

            if (analysis.score) {
              lead.updateAIScore(
                analysis.score,
                "Análise de dados coletados via Typebot",
              );
              await leadRepo.save(lead);
            }
          } catch (error) {
            console.error("Erro ao processar análise de IA:", error);
          }
        }

        // Disparar workflows N8N
        await this.integrateWithN8N(lead, "typebot_data_collected", {
          sessionId: session.id,
          collectedData,
        });
      }
    } catch (error) {
      console.error("Erro ao processar dados do Typebot:", error);
    }
  }

  /**
   * Sistema de notificações baseado em eventos Mautic
   */
  static async handleMauticEvent(
    tenantId: string,
    event: string,
    data: any,
  ): Promise<void> {
    try {
      switch (event) {
        case "high_score_lead":
          await this.notifyHighScoreLead(tenantId, data);
          break;

        case "negative_sentiment":
          await this.notifyNegativeSentiment(tenantId, data);
          break;

        case "campaign_completion":
          await this.notifyCampaignCompletion(tenantId, data);
          break;

        case "lead_unsubscribe":
          await this.handleLeadUnsubscribe(tenantId, data);
          break;
      }
    } catch (error) {
      console.error("Erro ao processar evento Mautic:", error);
    }
  }

  private static async notifyHighScoreLead(
    tenantId: string,
    leadData: any,
  ): Promise<void> {
    // Notificar equipe de vendas via WhatsApp
    const instances = await WhatsAppService.getInstances(tenantId);
    if (instances.length > 0) {
      const salesNumber = instances[0].settings?.notifications?.salesTeamNumber;
      if (salesNumber) {
        await WhatsAppService.sendMessage(instances[0].id, {
          to: salesNumber,
          type: "text",
          content: {
            text: `🔥 LEAD QUENTE DETECTADO!

Nome: ${leadData.name || "Não informado"}
Telefone: ${leadData.phone || "Não informado"}
Email: ${leadData.email || "Não informado"}
Score IA: ${leadData.aiScore}/10

Última atividade: ${leadData.lastActivity}
Intenção: ${leadData.intent || "Não identificada"}

🎯 AÇÃO RECOMENDADA: Contato imediato!`,
          },
        });
      }
    }
  }

  private static async notifyNegativeSentiment(
    tenantId: string,
    leadData: any,
  ): Promise<void> {
    // Notificar equipe de atendimento
    const instances = await WhatsAppService.getInstances(tenantId);
    if (instances.length > 0) {
      const supportNumber =
        instances[0].settings?.notifications?.supportTeamNumber;
      if (supportNumber) {
        await WhatsAppService.sendMessage(instances[0].id, {
          to: supportNumber,
          type: "text",
          content: {
            text: `⚠️ SENTIMENTO NEGATIVO DETECTADO!

Cliente: ${leadData.name || "Não informado"}
Telefone: ${leadData.phone || "Não informado"}
Sentimento: ${leadData.sentiment}
Score: ${leadData.sentimentScore}

Última mensagem: "${leadData.lastMessage}"

🚨 AÇÃO URGENTE: Intervenção necessária!`,
          },
        });
      }
    }
  }

  private static async notifyCampaignCompletion(
    tenantId: string,
    campaignData: any,
  ): Promise<void> {
    // Disparar relatório automático via N8N
    await N8NService.triggerWorkflow("campaign_completion_report", {
      tenantId,
      campaignId: campaignData.campaignId,
      metrics: campaignData.metrics,
      timestamp: new Date(),
    });
  }

  private static async handleLeadUnsubscribe(
    tenantId: string,
    leadData: any,
  ): Promise<void> {
    // Atualizar lead para não receber mais marketing
    const dataSource = await DatabaseConnection.getInstance();
    const leadRepo = dataSource.getRepository(MauticLead);

    const lead = await leadRepo.findOne({
      where: {
        mauticLeadId: leadData.mauticId,
        tenantId,
      },
    });

    if (lead) {
      lead.revokeConsent("marketing");
      await leadRepo.save(lead);
    }
  }
}

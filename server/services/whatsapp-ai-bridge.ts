import { WhatsAppService } from "./whatsapp";
import { AIService } from "./ai";
import { TypebotService } from "./typebot";
import {
  AIServiceType,
  AIOperationType,
  AISourceModule,
} from "../entities/AIServiceUsage";
import { Message } from "../entities/Message";
import { WhatsAppInstance } from "../entities/WhatsAppInstance";
import { TypebotFlow } from "../entities/TypebotFlow";

export interface WhatsAppAIProcessingResult {
  success: boolean;
  intent?: string;
  sentiment?: string;
  confidence?: number;
  autoResponseSent?: boolean;
  typebotTriggered?: boolean;
  escalatedToHuman?: boolean;
  aiCostUSD?: number;
  processingTimeMs?: number;
}

export class WhatsAppAIBridge {
  /**
   * Process incoming WhatsApp message with AI analysis
   */
  static async processIncomingMessage(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<WhatsAppAIProcessingResult> {
    const startTime = Date.now();
    let totalCost = 0;

    try {
      const tenantId = message.tenantId;
      const messageText = message.content?.text || "";

      if (!messageText.trim()) {
        return { success: true, processingTimeMs: Date.now() - startTime };
      }

      // Step 1: Intent Classification
      const intentResult = await this.classifyIntent(tenantId, messageText);
      totalCost += intentResult.costUSD || 0;

      // Step 2: Sentiment Analysis
      const sentimentResult = await this.analyzeSentiment(
        tenantId,
        messageText,
      );
      totalCost += sentimentResult.costUSD || 0;

      // Step 3: Language Detection (if multilingual support is enabled)
      let detectedLanguage = "pt-BR";
      if (instance.settings?.aiSettings?.enableLanguageDetection) {
        const languageResult = await this.detectLanguage(tenantId, messageText);
        detectedLanguage = languageResult.language || "pt-BR";
        totalCost += languageResult.costUSD || 0;
      }

      // Step 4: Route based on intent and sentiment
      const routingResult = await this.routeMessage({
        message,
        instance,
        intent: intentResult.intent,
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.score,
        language: detectedLanguage,
        confidence: Math.min(
          intentResult.confidence || 0,
          sentimentResult.confidence || 0,
        ),
      });

      return {
        success: true,
        intent: intentResult.intent,
        sentiment: sentimentResult.sentiment,
        confidence: routingResult.confidence,
        autoResponseSent: routingResult.autoResponseSent,
        typebotTriggered: routingResult.typebotTriggered,
        escalatedToHuman: routingResult.escalatedToHuman,
        aiCostUSD: totalCost,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error("WhatsApp AI processing error:", error);
      return {
        success: false,
        aiCostUSD: totalCost,
        processingTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Classify message intent using AI
   */
  private static async classifyIntent(
    tenantId: string,
    messageText: string,
  ): Promise<{ intent: string; confidence: number; costUSD: number }> {
    try {
      const response = await AIService.processRequest(tenantId, {
        service: AIServiceType.OPENAI,
        operation: AIOperationType.INTENT_CLASSIFICATION,
        input: messageText,
        settings: {
          temperature: 0.1,
          maxTokens: 50,
          systemPrompt: `Classify this WhatsApp message into one of these intents:
            - product_inquiry: Questions about products/services
            - support_request: Technical support or problem reports
            - sales_question: Pricing, purchase, or commercial questions
            - appointment_booking: Scheduling requests
            - complaint: Complaints or negative feedback
            - compliment: Positive feedback or thanks
            - general_info: General information requests
            - greeting: Simple greetings
            - goodbye: Farewell messages
            
            Respond with JSON: {"intent": "category", "confidence": 0.95}`,
        },
        sourceModule: AISourceModule.WHATSAPP,
        metadata: {
          operation: "intent_classification",
          messageType: "whatsapp",
        },
      });

      if (response.success && response.data) {
        let result;
        try {
          result =
            typeof response.data.content === "string"
              ? JSON.parse(response.data.content)
              : response.data;
        } catch {
          result = { intent: "general_info", confidence: 0.5 };
        }

        return {
          intent: result.intent || "general_info",
          confidence: result.confidence || 0.5,
          costUSD: response.usage?.costUSD || 0,
        };
      }

      return { intent: "general_info", confidence: 0.1, costUSD: 0 };
    } catch (error) {
      console.error("Intent classification error:", error);
      return { intent: "general_info", confidence: 0.1, costUSD: 0 };
    }
  }

  /**
   * Analyze message sentiment using AI
   */
  private static async analyzeSentiment(
    tenantId: string,
    messageText: string,
  ): Promise<{
    sentiment: string;
    score: number;
    confidence: number;
    costUSD: number;
  }> {
    try {
      const response = await AIService.processRequest(tenantId, {
        service: AIServiceType.GOOGLE,
        operation: AIOperationType.SENTIMENT_ANALYSIS,
        input: messageText,
        sourceModule: AISourceModule.WHATSAPP,
        metadata: {
          operation: "sentiment_analysis",
          messageType: "whatsapp",
        },
      });

      if (response.success && response.data) {
        return {
          sentiment: response.data.sentiment || "neutral",
          score: response.data.score || 0,
          confidence: response.data.confidence || 0.8,
          costUSD: response.usage?.costUSD || 0,
        };
      }

      return { sentiment: "neutral", score: 0, confidence: 0.1, costUSD: 0 };
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return { sentiment: "neutral", score: 0, confidence: 0.1, costUSD: 0 };
    }
  }

  /**
   * Detect message language
   */
  private static async detectLanguage(
    tenantId: string,
    messageText: string,
  ): Promise<{ language: string; confidence: number; costUSD: number }> {
    try {
      const response = await AIService.processRequest(tenantId, {
        service: AIServiceType.GOOGLE,
        operation: AIOperationType.TRANSLATION,
        input: { text: messageText, action: "detect" },
        sourceModule: AISourceModule.WHATSAPP,
        metadata: {
          operation: "language_detection",
          messageType: "whatsapp",
        },
      });

      if (response.success && response.data) {
        return {
          language: response.data.detectedLanguage || "pt-BR",
          confidence: response.data.confidence || 0.8,
          costUSD: response.usage?.costUSD || 0,
        };
      }

      return { language: "pt-BR", confidence: 0.5, costUSD: 0 };
    } catch (error) {
      console.error("Language detection error:", error);
      return { language: "pt-BR", confidence: 0.5, costUSD: 0 };
    }
  }

  /**
   * Route message based on AI analysis
   */
  private static async routeMessage(params: {
    message: Message;
    instance: WhatsAppInstance;
    intent: string;
    sentiment: string;
    sentimentScore: number;
    language: string;
    confidence: number;
  }): Promise<{
    autoResponseSent: boolean;
    typebotTriggered: boolean;
    escalatedToHuman: boolean;
    confidence: number;
  }> {
    const { message, instance, intent, sentiment, sentimentScore, confidence } =
      params;

    let autoResponseSent = false;
    let typebotTriggered = false;
    let escalatedToHuman = false;

    // High confidence routing
    if (confidence > 0.8) {
      // Handle negative sentiment with high priority
      if (sentiment === "negative" && sentimentScore < -0.6) {
        await this.handleNegativeFeedback(message, instance);
        escalatedToHuman = true;
        return {
          autoResponseSent,
          typebotTriggered,
          escalatedToHuman,
          confidence,
        };
      }

      // Route based on intent
      switch (intent) {
        case "product_inquiry":
        case "sales_question":
          typebotTriggered = await this.triggerSalesFlow(message, instance);
          break;

        case "support_request":
          typebotTriggered = await this.triggerSupportFlow(message, instance);
          break;

        case "appointment_booking":
          typebotTriggered = await this.triggerBookingFlow(message, instance);
          break;

        case "complaint":
          await this.handleComplaint(message, instance);
          escalatedToHuman = true;
          break;

        case "compliment":
          autoResponseSent = await this.sendThankYouMessage(message, instance);
          break;

        case "greeting":
          autoResponseSent = await this.sendGreetingResponse(message, instance);
          break;

        case "goodbye":
          autoResponseSent = await this.sendGoodbyeResponse(message, instance);
          break;

        default:
          typebotTriggered = await this.triggerDefaultFlow(message, instance);
      }
    } else {
      // Low confidence - trigger default flow or escalate
      if (confidence < 0.3) {
        escalatedToHuman = true;
        await this.escalateToHuman(
          message,
          instance,
          "Low confidence in AI classification",
        );
      } else {
        typebotTriggered = await this.triggerDefaultFlow(message, instance);
      }
    }

    return { autoResponseSent, typebotTriggered, escalatedToHuman, confidence };
  }

  /**
   * Trigger sales-oriented Typebot flow
   */
  private static async triggerSalesFlow(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<boolean> {
    try {
      const salesFlow = await this.findFlowByType(
        message.tenantId,
        "PRODUCT_SHOWCASE",
      );
      if (salesFlow) {
        await TypebotService.processWhatsAppMessage(
          message,
          instance,
          salesFlow.id,
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error triggering sales flow:", error);
      return false;
    }
  }

  /**
   * Trigger support-oriented Typebot flow
   */
  private static async triggerSupportFlow(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<boolean> {
    try {
      const supportFlow = await this.findFlowByType(
        message.tenantId,
        "CUSTOMER_SUPPORT",
      );
      if (supportFlow) {
        await TypebotService.processWhatsAppMessage(
          message,
          instance,
          supportFlow.id,
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error triggering support flow:", error);
      return false;
    }
  }

  /**
   * Trigger appointment booking Typebot flow
   */
  private static async triggerBookingFlow(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<boolean> {
    try {
      const bookingFlow = await this.findFlowByType(
        message.tenantId,
        "APPOINTMENT_BOOKING",
      );
      if (bookingFlow) {
        await TypebotService.processWhatsAppMessage(
          message,
          instance,
          bookingFlow.id,
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error triggering booking flow:", error);
      return false;
    }
  }

  /**
   * Trigger default Typebot flow
   */
  private static async triggerDefaultFlow(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<boolean> {
    try {
      const defaultFlow = await this.findDefaultFlow(message.tenantId);
      if (defaultFlow) {
        await TypebotService.processWhatsAppMessage(
          message,
          instance,
          defaultFlow.id,
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error triggering default flow:", error);
      return false;
    }
  }

  /**
   * Handle negative feedback with priority escalation
   */
  private static async handleNegativeFeedback(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<void> {
    try {
      // Send immediate acknowledgment
      await WhatsAppService.sendMessage(instance.id, {
        to: message.fromNumber,
        type: "text",
        content: {
          text: "😔 Entendo sua preocupação. Um especialista entrará em contato em breve para resolver sua situação.",
        },
      });

      // Notify support team via WhatsApp
      if (instance.settings?.notifications?.supportTeamNumber) {
        await WhatsAppService.sendMessage(instance.id, {
          to: instance.settings.notifications.supportTeamNumber,
          type: "text",
          content: {
            text: `🚨 FEEDBACK NEGATIVO DETECTADO!\n\nCliente: ${message.fromNumber}\nMensagem: ${message.content?.text}\nUrgência: Alta\n\nAção necessária: Contato imediato`,
          },
        });
      }
    } catch (error) {
      console.error("Error handling negative feedback:", error);
    }
  }

  /**
   * Handle complaints with proper escalation
   */
  private static async handleComplaint(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<void> {
    try {
      await WhatsAppService.sendMessage(instance.id, {
        to: message.fromNumber,
        type: "text",
        content: {
          text: "Recebemos sua reclamação e levamos isso muito a sério. Nossa equipe de atendimento entrará em contato para resolver esta questão.",
        },
      });

      // Create support ticket or notification
      await this.createSupportTicket(message, "complaint", "high");
    } catch (error) {
      console.error("Error handling complaint:", error);
    }
  }

  /**
   * Send thank you message for compliments
   */
  private static async sendThankYouMessage(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<boolean> {
    try {
      const thankYouMessages = [
        "😊 Muito obrigado pelo seu feedback positivo! Isso nos motiva muito.",
        "🙏 Agradecemos imensamente pelas palavras gentis!",
        "❤️ Ficamos felizes em saber que você está satisfeito! Obrigado!",
        "🌟 Seu feedback é muito importante para nós. Muito obrigado!",
      ];

      const randomMessage =
        thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];

      await WhatsAppService.sendMessage(instance.id, {
        to: message.fromNumber,
        type: "text",
        content: { text: randomMessage },
      });

      return true;
    } catch (error) {
      console.error("Error sending thank you message:", error);
      return false;
    }
  }

  /**
   * Send greeting response
   */
  private static async sendGreetingResponse(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<boolean> {
    try {
      const greetingMessages = [
        "👋 Olá! Como posso ajudá-lo hoje?",
        "😊 Oi! Em que posso ser útil?",
        "🙋‍♀️ Olá! Estou aqui para ajudar. O que você precisa?",
      ];

      const randomMessage =
        greetingMessages[Math.floor(Math.random() * greetingMessages.length)];

      await WhatsAppService.sendMessage(instance.id, {
        to: message.fromNumber,
        type: "text",
        content: { text: randomMessage },
      });

      return true;
    } catch (error) {
      console.error("Error sending greeting response:", error);
      return false;
    }
  }

  /**
   * Send goodbye response
   */
  private static async sendGoodbyeResponse(
    message: Message,
    instance: WhatsAppInstance,
  ): Promise<boolean> {
    try {
      const goodbyeMessages = [
        "👋 Até logo! Sempre que precisar, estaremos aqui.",
        "😊 Tchau! Foi um prazer ajudar.",
        "🙏 Obrigado pelo contato! Até a próxima.",
      ];

      const randomMessage =
        goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];

      await WhatsAppService.sendMessage(instance.id, {
        to: message.fromNumber,
        type: "text",
        content: { text: randomMessage },
      });

      return true;
    } catch (error) {
      console.error("Error sending goodbye response:", error);
      return false;
    }
  }

  /**
   * Escalate to human support
   */
  private static async escalateToHuman(
    message: Message,
    instance: WhatsAppInstance,
    reason: string,
  ): Promise<void> {
    try {
      await WhatsAppService.sendMessage(instance.id, {
        to: message.fromNumber,
        type: "text",
        content: {
          text: "Vou transferir você para um de nossos especialistas que poderá ajudá-lo melhor.",
        },
      });

      await this.createSupportTicket(message, "escalation", "medium", {
        reason,
      });
    } catch (error) {
      console.error("Error escalating to human:", error);
    }
  }

  /**
   * Find Typebot flow by type
   */
  private static async findFlowByType(
    tenantId: string,
    flowType: string,
  ): Promise<TypebotFlow | null> {
    try {
      const flows = await TypebotService.getTenantFlows(tenantId);
      return (
        flows.find(
          (flow) =>
            flow.type === flowType &&
            flow.status === "PUBLISHED" &&
            flow.isPublished,
        ) || null
      );
    } catch (error) {
      console.error("Error finding flow by type:", error);
      return null;
    }
  }

  /**
   * Find default Typebot flow
   */
  private static async findDefaultFlow(
    tenantId: string,
  ): Promise<TypebotFlow | null> {
    try {
      const flows = await TypebotService.getTenantFlows(tenantId);
      return (
        flows.find(
          (flow) =>
            flow.isPublished &&
            flow.status === "PUBLISHED" &&
            flow.settings?.isDefault,
        ) ||
        flows.find((flow) => flow.isPublished && flow.status === "PUBLISHED") ||
        null
      );
    } catch (error) {
      console.error("Error finding default flow:", error);
      return null;
    }
  }

  /**
   * Create support ticket for escalations
   */
  private static async createSupportTicket(
    message: Message,
    type: string,
    priority: string,
    metadata?: any,
  ): Promise<void> {
    try {
      // This would integrate with your ticketing system
      console.log("Creating support ticket:", {
        tenantId: message.tenantId,
        fromNumber: message.fromNumber,
        content: message.content?.text,
        type,
        priority,
        metadata,
        timestamp: new Date(),
      });

      // TODO: Implement actual ticket creation logic
      // This could integrate with:
      // - Internal ticketing system
      // - External tools like Zendesk, Freshdesk, etc.
      // - N8N workflow to handle ticket creation
    } catch (error) {
      console.error("Error creating support ticket:", error);
    }
  }

  /**
   * Generate AI-powered auto-response
   */
  static async generateAutoResponse(
    tenantId: string,
    messageText: string,
    context?: any,
  ): Promise<{ response: string; confidence: number; costUSD: number }> {
    try {
      const contextPrompt = context
        ? `Context: ${JSON.stringify(context)}\n\n`
        : "";

      const response = await AIService.processRequest(tenantId, {
        service: AIServiceType.OPENAI,
        operation: AIOperationType.CHAT_COMPLETION,
        input: `${contextPrompt}Customer message: "${messageText}"\n\nGenerate a helpful, professional response in Portuguese for this WhatsApp customer service conversation.`,
        settings: {
          temperature: 0.7,
          maxTokens: 200,
          systemPrompt:
            "You are a helpful customer service representative. Be friendly, professional, and concise. Always respond in Portuguese.",
        },
        sourceModule: AISourceModule.WHATSAPP,
        metadata: {
          operation: "auto_response_generation",
          messageType: "whatsapp",
        },
      });

      if (response.success && response.data?.content) {
        return {
          response: response.data.content,
          confidence: 0.8,
          costUSD: response.usage?.costUSD || 0,
        };
      }

      return {
        response:
          "Obrigado pela sua mensagem. Em breve retornaremos o contato.",
        confidence: 0.1,
        costUSD: 0,
      };
    } catch (error) {
      console.error("Error generating auto response:", error);
      return {
        response:
          "Obrigado pela sua mensagem. Em breve retornaremos o contato.",
        confidence: 0.1,
        costUSD: 0,
      };
    }
  }
}

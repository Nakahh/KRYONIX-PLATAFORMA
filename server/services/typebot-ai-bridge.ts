import { TypebotService } from "./typebot";
import { AIService } from "./ai";
import {
  AIServiceType,
  AIOperationType,
  AISourceModule,
} from "../entities/AIServiceUsage";
import { TypebotFlow, FlowNode } from "../entities/TypebotFlow";
import { TypebotSession } from "../entities/TypebotSession";

export interface AINodeExecutionResult {
  success: boolean;
  responses: string[];
  variables: Record<string, any>;
  nextNodeId?: string;
  error?: string;
  aiMetadata?: {
    service: AIServiceType;
    operation: AIOperationType;
    executionTimeMs: number;
    costUSD: number;
    confidence?: number;
  };
}

export class TypebotAIBridge {
  /**
   * Execute an AI-powered node in a Typebot flow
   */
  static async executeAINode(
    session: TypebotSession,
    flow: TypebotFlow,
    node: FlowNode,
  ): Promise<AINodeExecutionResult> {
    try {
      const aiConfig = node.data.integration;
      if (!aiConfig || aiConfig.type !== "ai") {
        throw new Error("Node is not an AI integration node");
      }

      const config = aiConfig.config;
      const tenantId = session.tenantId;

      // Prepare input based on node configuration
      const input = await this.prepareAIInput(session, config);

      // Execute AI request
      const aiResponse = await AIService.processRequest(tenantId, {
        service: config.service || AIServiceType.OPENAI,
        operation: config.operation || AIOperationType.CHAT_COMPLETION,
        model: config.model,
        input: input,
        settings: config.settings,
        sourceModule: AISourceModule.TYPEBOT,
        sourceId: flow.id,
        metadata: {
          sessionId: session.id,
          nodeId: node.id,
          nodeType: node.type,
        },
      });

      if (!aiResponse.success) {
        return {
          success: false,
          responses: [`Erro na IA: ${aiResponse.error}`],
          variables: {},
          error: aiResponse.error,
        };
      }

      // Process AI response and update session
      const result = await this.processAIResponse(session, node, aiResponse);

      return {
        success: true,
        responses: result.responses,
        variables: result.variables,
        nextNodeId: result.nextNodeId,
        aiMetadata: {
          service: config.service,
          operation: config.operation,
          executionTimeMs: aiResponse.executionTimeMs,
          costUSD: aiResponse.usage?.costUSD || 0,
          confidence: result.confidence,
        },
      };
    } catch (error) {
      console.error("AI node execution error:", error);
      return {
        success: false,
        responses: [
          "Desculpe, ocorreu um erro no processamento. Tente novamente.",
        ],
        variables: {},
        error: error.message,
      };
    }
  }

  /**
   * Prepare input for AI request based on node configuration
   */
  private static async prepareAIInput(
    session: TypebotSession,
    config: any,
  ): Promise<string | any> {
    const context = session.context;
    const variables = TypebotService.getSessionVariables(session);

    // Handle different input types
    if (config.inputVariable) {
      const inputValue = variables[config.inputVariable];
      if (!inputValue) {
        throw new Error(
          `Variable '${config.inputVariable}' not found in session`,
        );
      }
      return inputValue;
    }

    if (config.inputVariables && Array.isArray(config.inputVariables)) {
      const inputData: Record<string, any> = {};
      for (const varName of config.inputVariables) {
        inputData[varName] = variables[varName] || "";
      }
      return inputData;
    }

    if (config.prompt) {
      // Interpolate variables in prompt
      return this.interpolateVariables(config.prompt, variables);
    }

    // Default to last user message
    const lastStep =
      session.conversationSteps[session.conversationSteps.length - 1];
    return lastStep?.userInput || "";
  }

  /**
   * Process AI response and update session variables
   */
  private static async processAIResponse(
    session: TypebotSession,
    node: FlowNode,
    aiResponse: any,
  ): Promise<{
    responses: string[];
    variables: Record<string, any>;
    nextNodeId?: string;
    confidence?: number;
  }> {
    const config = node.data.integration.config;
    const responses: string[] = [];
    const variables: Record<string, any> = {};
    let nextNodeId: string | undefined;
    let confidence: number | undefined;

    // Extract data from AI response
    const aiData = aiResponse.data;

    switch (config.operation) {
      case AIOperationType.CHAT_COMPLETION:
        const content = aiData.content || aiData.text || "";
        responses.push(content);

        if (config.outputVariable) {
          variables[config.outputVariable] = content;
        }
        break;

      case AIOperationType.SENTIMENT_ANALYSIS:
        const sentiment = aiData.sentiment || "neutral";
        const score = aiData.score || 0;
        confidence = aiData.confidence || 0;

        responses.push(
          `Análise de sentimento: ${sentiment} (${(score * 100).toFixed(1)}%)`,
        );

        if (config.outputVariable) {
          variables[config.outputVariable] = sentiment;
          variables[`${config.outputVariable}_score`] = score;
        }

        // Route based on sentiment
        if (node.data.conditions) {
          nextNodeId = this.evaluateSentimentRouting(
            sentiment,
            score,
            node.data.conditions,
          );
        }
        break;

      case AIOperationType.INTENT_CLASSIFICATION:
        const intent = aiData.intent || aiData.classification || "";
        confidence = aiData.confidence || 0;

        responses.push(`Intenção identificada: ${intent}`);

        if (config.outputVariable) {
          variables[config.outputVariable] = intent;
        }

        // Route based on intent
        if (node.data.routing) {
          nextNodeId = node.data.routing[intent];
        }
        break;

      case AIOperationType.TRANSLATION:
        const translatedText = aiData.translatedText || "";
        const detectedLanguage = aiData.detectedLanguage || "";

        responses.push(translatedText);

        if (config.outputVariable) {
          variables[config.outputVariable] = translatedText;
          variables[`${config.outputVariable}_language`] = detectedLanguage;
        }
        break;

      case AIOperationType.TEXT_ANALYSIS:
        const analysis = aiData.analysis || aiData.result || "";
        confidence = aiData.confidence || 0;

        if (typeof analysis === "object") {
          // Structured analysis result
          Object.keys(analysis).forEach((key) => {
            variables[`analysis_${key}`] = analysis[key];
          });

          responses.push(this.formatAnalysisResponse(analysis));
        } else {
          // Text analysis result
          responses.push(analysis);

          if (config.outputVariable) {
            variables[config.outputVariable] = analysis;
          }
        }
        break;

      case AIOperationType.SPEECH_TO_TEXT:
        const transcript = aiData.transcript || "";
        confidence = aiData.confidence || 0;

        responses.push(`Texto transcrito: ${transcript}`);

        if (config.outputVariable) {
          variables[config.outputVariable] = transcript;
        }

        // Continue flow with transcribed text as user input
        if (config.nextAction === "continue_with_text") {
          // Update session with transcribed text
          session.conversationSteps.push({
            type: "user_input",
            content: transcript,
            timestamp: new Date(),
            nodeId: node.id,
          });
        }
        break;

      default:
        responses.push("Processamento IA concluído");
        if (config.outputVariable && aiData) {
          variables[config.outputVariable] = aiData;
        }
    }

    return {
      responses,
      variables,
      nextNodeId,
      confidence,
    };
  }

  /**
   * Interpolate variables in text templates
   */
  private static interpolateVariables(
    template: string,
    variables: Record<string, any>,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] || match;
    });
  }

  /**
   * Evaluate sentiment-based routing
   */
  private static evaluateSentimentRouting(
    sentiment: string,
    score: number,
    conditions: any[],
  ): string | undefined {
    for (const condition of conditions) {
      if (condition.variable === "sentiment_score") {
        const conditionValue = parseFloat(condition.value);

        switch (condition.operator) {
          case "greater":
            if (score > conditionValue) return condition.nextNode;
            break;
          case "less":
            if (score < conditionValue) return condition.nextNode;
            break;
          case "equals":
            if (Math.abs(score - conditionValue) < 0.1)
              return condition.nextNode;
            break;
        }
      }
    }

    return undefined;
  }

  /**
   * Format structured analysis response
   */
  private static formatAnalysisResponse(analysis: any): string {
    if (analysis.score !== undefined) {
      return `Análise concluída. Score: ${analysis.score}/10\nDetalhes: ${analysis.reasoning || analysis.summary || ""}`;
    }

    if (analysis.category !== undefined) {
      return `Categoria identificada: ${analysis.category}\nConfiança: ${(analysis.confidence * 100).toFixed(1)}%`;
    }

    return `Análise: ${JSON.stringify(analysis)}`;
  }

  /**
   * Create AI-powered flow nodes from templates
   */
  static createAINodes(templateType: string, customizations?: any): FlowNode[] {
    const templates = {
      smart_support: [
        {
          id: "intent_analysis",
          type: "integration",
          data: {
            content: "Analisando sua solicitação...",
            integration: {
              type: "ai",
              service: AIServiceType.OPENAI,
              config: {
                operation: AIOperationType.INTENT_CLASSIFICATION,
                model: "gpt-3.5-turbo",
                prompt:
                  "Classify this support message into: technical_support, billing, sales, general_info",
                inputVariable: "user_message",
                outputVariable: "intent",
                settings: {
                  temperature: 0.1,
                  maxTokens: 50,
                },
              },
            },
            routing: {
              technical_support: "tech_support_flow",
              billing: "billing_flow",
              sales: "sales_flow",
              general_info: "info_flow",
            },
          },
          position: { x: 300, y: 200 },
        },
        {
          id: "sentiment_check",
          type: "integration",
          data: {
            content: "Verificando o tom da mensagem...",
            integration: {
              type: "ai",
              service: AIServiceType.GOOGLE,
              config: {
                operation: AIOperationType.SENTIMENT_ANALYSIS,
                inputVariable: "user_message",
                outputVariable: "sentiment",
              },
            },
            conditions: [
              {
                variable: "sentiment_score",
                operator: "less",
                value: "-0.5",
                nextNode: "negative_sentiment_flow",
              },
              {
                variable: "sentiment_score",
                operator: "greater",
                value: "0.5",
                nextNode: "positive_sentiment_flow",
              },
            ],
          },
          position: { x: 300, y: 400 },
        },
      ],

      multilingual_capture: [
        {
          id: "language_detect",
          type: "integration",
          data: {
            content: "Detectando idioma...",
            integration: {
              type: "ai",
              service: AIServiceType.GOOGLE,
              config: {
                operation: AIOperationType.TRANSLATION,
                action: "detect_language",
                inputVariable: "user_message",
                outputVariable: "detected_language",
              },
            },
          },
          position: { x: 300, y: 200 },
        },
        {
          id: "translate_to_portuguese",
          type: "integration",
          data: {
            content: "Traduzindo mensagem...",
            integration: {
              type: "ai",
              service: AIServiceType.GOOGLE,
              config: {
                operation: AIOperationType.TRANSLATION,
                targetLanguage: "pt-BR",
                inputVariable: "user_message",
                outputVariable: "portuguese_message",
              },
            },
          },
          position: { x: 300, y: 300 },
        },
      ],
    };

    const template = templates[templateType];
    if (!template) {
      throw new Error(`AI template '${templateType}' not found`);
    }

    // Apply customizations
    const nodes = JSON.parse(JSON.stringify(template));
    if (customizations) {
      nodes.forEach((node: FlowNode, index: number) => {
        if (customizations[index]) {
          Object.assign(node.data, customizations[index]);
        }
      });
    }

    return nodes;
  }

  /**
   * Generate AI conversation context for better responses
   */
  static generateConversationContext(session: TypebotSession): string {
    const steps = session.conversationSteps.slice(-5); // Last 5 steps
    const context = steps
      .map((step) => {
        if (step.type === "user_input") {
          return `User: ${step.content}`;
        } else {
          return `Bot: ${step.content}`;
        }
      })
      .join("\n");

    const variables = TypebotService.getSessionVariables(session);
    const varsContext = Object.entries(variables)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    return `Conversation history:\n${context}\n\nUser data: ${varsContext}`;
  }

  /**
   * Validate AI node configuration
   */
  static validateAINodeConfig(node: FlowNode): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!node.data.integration || node.data.integration.type !== "ai") {
      errors.push("Node must be an AI integration type");
      return { valid: false, errors };
    }

    const config = node.data.integration.config;

    if (!config.service) {
      errors.push("AI service must be specified");
    }

    if (!config.operation) {
      errors.push("AI operation must be specified");
    }

    if (
      config.operation === AIOperationType.CHAT_COMPLETION &&
      !config.inputVariable &&
      !config.prompt
    ) {
      errors.push("Chat completion requires either inputVariable or prompt");
    }

    if (
      config.operation === AIOperationType.TRANSLATION &&
      !config.targetLanguage
    ) {
      errors.push("Translation requires targetLanguage");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

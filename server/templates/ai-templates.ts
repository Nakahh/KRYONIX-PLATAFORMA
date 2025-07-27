import {
  AIServiceType,
  AIOperationType,
  AISourceModule,
} from "../entities/AIServiceUsage";

// AI-powered N8N Workflow Templates
export const AI_WORKFLOW_TEMPLATES = {
  // Lead Qualification with AI Scoring
  LEAD_QUALIFICATION_AI: {
    name: "AI Lead Qualification",
    description: "Automatically score and qualify leads using AI analysis",
    category: "lead_management",
    tags: ["ai", "lead", "qualification", "scoring"],
    workflow: {
      nodes: [
        {
          id: "webhook_start",
          name: "Lead Data Webhook",
          type: "webhook",
          parameters: {
            path: "lead-qualification",
            method: "POST",
          },
        },
        {
          id: "ai_lead_analysis",
          name: "AI Lead Analysis",
          type: "httpRequest",
          parameters: {
            url: "{{$parameter.frontendUrl}}/api/v1/ai/analyze",
            method: "POST",
            headers: {
              Authorization: "Bearer {{$parameter.jwtToken}}",
              "Content-Type": "application/json",
            },
            body: {
              service: AIServiceType.OPENAI,
              operation: AIOperationType.TEXT_ANALYSIS,
              model: "gpt-4",
              input: {
                name: "{{$node['webhook_start'].json.name}}",
                email: "{{$node['webhook_start'].json.email}}",
                company: "{{$node['webhook_start'].json.company}}",
                message: "{{$node['webhook_start'].json.message}}",
                source: "{{$node['webhook_start'].json.source}}",
              },
              sourceModule: AISourceModule.N8N,
              metadata: {
                workflowId: "lead_qualification",
                prompt:
                  "Score this lead from 1-10 based on: company size, message quality, email domain, and urgency indicators. Provide JSON response with score, reasoning, and next_action.",
              },
            },
          },
        },
        {
          id: "ai_lead_scoring",
          name: "AI Lead Scoring",
          type: "httpRequest",
          parameters: {
            url: "{{$parameter.frontendUrl}}/api/v1/ai/analyze",
            method: "POST",
            headers: {
              Authorization: "Bearer {{$parameter.jwtToken}}",
              "Content-Type": "application/json",
            },
            body: {
              service: AIServiceType.OPENAI,
              operation: AIOperationType.CHAT_COMPLETION,
              input:
                "Based on this lead data, provide a detailed score (1-10) and qualification: {{$node['webhook_start'].json}}. Include: score, category (hot/warm/cold), priority, recommended_action, and reasoning.",
              sourceModule: AISourceModule.N8N,
              settings: {
                temperature: 0.1,
                maxTokens: 300,
              },
            },
          },
        },
        {
          id: "condition_high_score",
          name: "High Score Lead?",
          type: "if",
          parameters: {
            conditions: [
              {
                field: "{{$node['ai_lead_scoring'].json.data.score}}",
                operation: "larger",
                value: 7,
              },
            ],
          },
        },
        {
          id: "notify_sales_team",
          name: "Notify Sales Team",
          type: "httpRequest",
          parameters: {
            url: "{{$parameter.frontendUrl}}/api/v1/whatsapp/send",
            method: "POST",
            body: {
              instanceId: "{{$parameter.salesWhatsAppInstance}}",
              to: "{{$parameter.salesTeamNumber}}",
              message:
                "🔥 LEAD QUENTE DETECTADO!\n\nNome: {{$node['webhook_start'].json.name}}\nEmpresa: {{$node['webhook_start'].json.company}}\nScore: {{$node['ai_lead_scoring'].json.data.score}}/10\nRazão: {{$node['ai_lead_scoring'].json.data.reasoning}}\n\nAção recomendada: {{$node['ai_lead_scoring'].json.data.recommended_action}}",
            },
          },
        },
      ],
      connections: {
        webhook_start: { main: [["ai_lead_analysis"]] },
        ai_lead_analysis: { main: [["ai_lead_scoring"]] },
        ai_lead_scoring: { main: [["condition_high_score"]] },
        condition_high_score: { true: [["notify_sales_team"]] },
      },
    },
  },

  // Customer Support Classification
  CUSTOMER_SUPPORT_AI: {
    name: "AI Customer Support Classification",
    description:
      "Automatically classify and route customer support tickets using AI",
    category: "customer_support",
    tags: ["ai", "support", "classification", "routing"],
    workflow: {
      nodes: [
        {
          id: "support_webhook",
          name: "Support Ticket Webhook",
          type: "webhook",
          parameters: {
            path: "support-ticket",
            method: "POST",
          },
        },
        {
          id: "ai_intent_classification",
          name: "AI Intent Classification",
          type: "httpRequest",
          parameters: {
            url: "{{$parameter.frontendUrl}}/api/v1/ai/analyze",
            method: "POST",
            body: {
              service: AIServiceType.OPENAI,
              operation: AIOperationType.INTENT_CLASSIFICATION,
              input: "{{$node['support_webhook'].json.message}}",
              sourceModule: AISourceModule.N8N,
              settings: {
                systemPrompt:
                  "Classify this customer support message into one of these categories: technical_issue, billing_question, feature_request, bug_report, general_inquiry. Also determine urgency level (low/medium/high) and suggest department routing.",
              },
            },
          },
        },
        {
          id: "ai_sentiment_analysis",
          name: "AI Sentiment Analysis",
          type: "httpRequest",
          parameters: {
            url: "{{$parameter.frontendUrl}}/api/v1/ai/analyze",
            method: "POST",
            body: {
              service: AIServiceType.GOOGLE,
              operation: AIOperationType.SENTIMENT_ANALYSIS,
              input: "{{$node['support_webhook'].json.message}}",
              sourceModule: AISourceModule.N8N,
            },
          },
        },
        {
          id: "route_to_department",
          name: "Route to Department",
          type: "switch",
          parameters: {
            field: "{{$node['ai_intent_classification'].json.data.category}}",
            rules: [
              {
                field: "technical_issue",
                output: 0,
              },
              {
                field: "billing_question",
                output: 1,
              },
              {
                field: "feature_request",
                output: 2,
              },
            ],
          },
        },
      ],
    },
  },

  // Content Moderation
  CONTENT_MODERATION_AI: {
    name: "AI Content Moderation",
    description: "Automatically moderate user-generated content using AI",
    category: "content_moderation",
    tags: ["ai", "moderation", "content", "safety"],
    workflow: {
      nodes: [
        {
          id: "content_webhook",
          name: "Content Submission",
          type: "webhook",
        },
        {
          id: "ai_content_moderation",
          name: "AI Content Analysis",
          type: "httpRequest",
          parameters: {
            url: "{{$parameter.frontendUrl}}/api/v1/ai/analyze",
            method: "POST",
            body: {
              service: AIServiceType.OPENAI,
              operation: AIOperationType.CONTENT_MODERATION,
              input: "{{$node['content_webhook'].json.content}}",
              sourceModule: AISourceModule.N8N,
            },
          },
        },
        {
          id: "flagged_content_check",
          name: "Is Content Flagged?",
          type: "if",
          parameters: {
            conditions: [
              {
                field: "{{$node['ai_content_moderation'].json.data.flagged}}",
                operation: "equal",
                value: true,
              },
            ],
          },
        },
      ],
    },
  },
};

// AI-powered Typebot Node Templates
export const AI_TYPEBOT_NODES = {
  // ChatGPT Response Node
  CHATGPT_RESPONSE: {
    id: "ai_chatgpt_{{RANDOM_ID}}",
    type: "integration",
    data: {
      integration: {
        type: "ai",
        service: AIServiceType.OPENAI,
        config: {
          operation: AIOperationType.CHAT_COMPLETION,
          model: "gpt-4",
          settings: {
            temperature: 0.7,
            maxTokens: 200,
            systemPrompt:
              "You are a helpful customer service assistant. Keep responses concise and friendly.",
          },
          inputVariable: "user_message",
          outputVariable: "ai_response",
        },
      },
      content: "Gerando resposta inteligente...",
      aiConfig: {
        prompt:
          "Responda a seguinte mensagem do cliente de forma profissional e útil: {{user_message}}",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 200,
      },
    },
    position: { x: 0, y: 0 },
  },

  // Sentiment Analysis Node
  SENTIMENT_ANALYSIS: {
    id: "ai_sentiment_{{RANDOM_ID}}",
    type: "integration",
    data: {
      integration: {
        type: "ai",
        service: AIServiceType.GOOGLE,
        config: {
          operation: AIOperationType.SENTIMENT_ANALYSIS,
          inputVariable: "user_message",
          outputVariable: "sentiment_score",
        },
      },
      content: "Analisando sentimento da mensagem...",
      conditions: [
        {
          variable: "sentiment_score",
          operator: "greater",
          value: "0.5",
          nextNode: "positive_flow",
        },
        {
          variable: "sentiment_score",
          operator: "less",
          value: "-0.5",
          nextNode: "negative_flow",
        },
      ],
    },
  },

  // Intent Classification Node
  INTENT_CLASSIFICATION: {
    id: "ai_intent_{{RANDOM_ID}}",
    type: "integration",
    data: {
      integration: {
        type: "ai",
        service: AIServiceType.OPENAI,
        config: {
          operation: AIOperationType.INTENT_CLASSIFICATION,
          model: "gpt-3.5-turbo",
          settings: {
            temperature: 0.1,
            systemPrompt:
              "Classify the user intent into one of: product_inquiry, support_request, pricing_question, demo_request, complaint, compliment",
          },
          inputVariable: "user_message",
          outputVariable: "user_intent",
        },
      },
      content: "Identificando intenção...",
      routing: {
        product_inquiry: "product_flow",
        support_request: "support_flow",
        pricing_question: "pricing_flow",
        demo_request: "demo_flow",
      },
    },
  },

  // Speech to Text Node
  SPEECH_TO_TEXT: {
    id: "ai_speech_{{RANDOM_ID}}",
    type: "integration",
    data: {
      integration: {
        type: "ai",
        service: AIServiceType.GOOGLE,
        config: {
          operation: AIOperationType.SPEECH_TO_TEXT,
          inputVariable: "audio_message",
          outputVariable: "transcribed_text",
          settings: {
            language: "pt-BR",
            encoding: "WEBM_OPUS",
          },
        },
      },
      content: "Convertendo áudio em texto...",
      acceptedTypes: ["audio"],
      nextAction: "continue_with_text",
    },
  },

  // Translation Node
  TRANSLATION: {
    id: "ai_translate_{{RANDOM_ID}}",
    type: "integration",
    data: {
      integration: {
        type: "ai",
        service: AIServiceType.GOOGLE,
        config: {
          operation: AIOperationType.TRANSLATION,
          inputVariable: "user_message",
          outputVariable: "translated_message",
          settings: {
            targetLanguage: "en",
            sourceLanguage: "auto",
          },
        },
      },
      content: "Traduzindo mensagem...",
      supportedLanguages: ["pt", "en", "es", "fr", "it"],
    },
  },

  // Lead Scoring Node
  LEAD_SCORING: {
    id: "ai_lead_score_{{RANDOM_ID}}",
    type: "integration",
    data: {
      integration: {
        type: "ai",
        service: AIServiceType.OPENAI,
        config: {
          operation: AIOperationType.TEXT_ANALYSIS,
          model: "gpt-4",
          settings: {
            temperature: 0.1,
            systemPrompt:
              "Analyze this lead information and provide a score from 1-10 based on: company size, budget indicators, urgency, and fit. Return JSON with score and reasoning.",
          },
          inputVariables: ["name", "email", "company", "message"],
          outputVariable: "lead_score",
        },
      },
      content: "Calculando score do lead...",
      scoringCriteria: {
        companySize: 0.3,
        budgetIndicators: 0.3,
        urgency: 0.2,
        messageFit: 0.2,
      },
    },
  },
};

// Pre-configured AI Flow Templates
export const AI_FLOW_TEMPLATES = {
  // Intelligent Customer Support Flow
  INTELLIGENT_SUPPORT: {
    name: "Suporte Inteligente com IA",
    description:
      "Fluxo de suporte que usa IA para classificar intenções e fornecer respostas automáticas",
    type: "CUSTOMER_SUPPORT",
    aiEnabled: true,
    nodes: [
      {
        id: "start_1",
        type: "text",
        data: {
          content:
            "👋 Olá! Sou seu assistente inteligente. Como posso ajudá-lo hoje?",
        },
      },
      {
        id: "intent_analysis",
        type: "integration",
        data: {
          integration: {
            type: "ai",
            service: AIServiceType.OPENAI,
            config: {
              operation: AIOperationType.INTENT_CLASSIFICATION,
              prompt:
                "Classify this message into: technical_support, billing, sales, general_info",
              inputVariable: "user_message",
              outputVariable: "intent",
            },
          },
        },
      },
      {
        id: "sentiment_check",
        type: "integration",
        data: {
          integration: {
            type: "ai",
            service: AIServiceType.GOOGLE,
            config: {
              operation: AIOperationType.SENTIMENT_ANALYSIS,
              inputVariable: "user_message",
              outputVariable: "sentiment",
            },
          },
        },
      },
      {
        id: "ai_response",
        type: "integration",
        data: {
          integration: {
            type: "ai",
            service: AIServiceType.OPENAI,
            config: {
              operation: AIOperationType.CHAT_COMPLETION,
              model: "gpt-4",
              prompt:
                "Provide helpful response for {{intent}} inquiry with {{sentiment}} sentiment: {{user_message}}",
              outputVariable: "ai_answer",
            },
          },
        },
      },
    ],
    edges: [
      { from: "start_1", to: "intent_analysis" },
      { from: "intent_analysis", to: "sentiment_check" },
      { from: "sentiment_check", to: "ai_response" },
    ],
  },

  // Multilingual Lead Capture
  MULTILINGUAL_LEAD_CAPTURE: {
    name: "Captura de Leads Multilíngue",
    description: "Captura leads automaticamente em múltiplos idiomas usando IA",
    type: "LEAD_CAPTURE",
    aiEnabled: true,
    nodes: [
      {
        id: "welcome",
        type: "text",
        data: {
          content:
            "Welcome! ¡Bienvenido! Bem-vindo! How can we help you today?",
        },
      },
      {
        id: "detect_language",
        type: "integration",
        data: {
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
      },
      {
        id: "translate_to_english",
        type: "integration",
        data: {
          integration: {
            type: "ai",
            service: AIServiceType.GOOGLE,
            config: {
              operation: AIOperationType.TRANSLATION,
              targetLanguage: "en",
              inputVariable: "user_message",
              outputVariable: "english_message",
            },
          },
        },
      },
      {
        id: "ai_lead_qualification",
        type: "integration",
        data: {
          integration: {
            type: "ai",
            service: AIServiceType.OPENAI,
            config: {
              operation: AIOperationType.TEXT_ANALYSIS,
              prompt:
                "Analyze this lead message and extract: interest_level, budget_indicators, timeline, company_size",
              inputVariable: "english_message",
              outputVariable: "lead_analysis",
            },
          },
        },
      },
    ],
  },
};

// AI Model Configuration Templates
export const AI_MODEL_TEMPLATES = {
  // OpenAI Configurations
  OPENAI_GPT4: {
    serviceType: AIServiceType.OPENAI,
    modelName: "gpt-4",
    displayName: "GPT-4 (Mais Inteligente)",
    description: "Modelo mais avançado para tarefas complexas",
    settings: {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
    limits: {
      maxTokensPerRequest: 4000,
      maxRequestsPerMinute: 20,
      maxRequestsPerDay: 1000,
      maxCostPerRequest: 0.5,
      allowedOperations: ["*"],
    },
    costPerInputToken: 0.00003,
    costPerOutputToken: 0.00006,
  },

  OPENAI_GPT35: {
    serviceType: AIServiceType.OPENAI,
    modelName: "gpt-3.5-turbo",
    displayName: "GPT-3.5 Turbo (Rápido)",
    description: "Modelo rápido e econômico para tarefas gerais",
    settings: {
      temperature: 0.7,
      maxTokens: 800,
      topP: 1.0,
    },
    limits: {
      maxTokensPerRequest: 2000,
      maxRequestsPerMinute: 60,
      maxRequestsPerDay: 5000,
      maxCostPerRequest: 0.1,
      allowedOperations: ["*"],
    },
    costPerInputToken: 0.0000015,
    costPerOutputToken: 0.000002,
  },

  // Google AI Configurations
  GOOGLE_SENTIMENT: {
    serviceType: AIServiceType.GOOGLE,
    modelName: "sentiment-analysis",
    displayName: "Google Sentiment Analysis",
    description: "Análise de sentimento avançada",
    settings: {
      language: "pt-BR",
      includeEntities: true,
    },
    limits: {
      maxTokensPerRequest: 1000,
      maxRequestsPerMinute: 100,
      maxRequestsPerDay: 10000,
      maxCostPerRequest: 0.01,
      allowedOperations: [AIOperationType.SENTIMENT_ANALYSIS],
    },
    costPerInputToken: 0.000001,
    costPerOutputToken: 0,
  },

  // Anthropic Configurations
  ANTHROPIC_CLAUDE: {
    serviceType: AIServiceType.ANTHROPIC,
    modelName: "claude-3-sonnet-20240229",
    displayName: "Claude 3 Sonnet",
    description: "Modelo equilibrado da Anthropic",
    settings: {
      temperature: 0.7,
      maxTokens: 1000,
    },
    limits: {
      maxTokensPerRequest: 3000,
      maxRequestsPerMinute: 30,
      maxRequestsPerDay: 2000,
      maxCostPerRequest: 0.3,
      allowedOperations: [
        AIOperationType.CHAT_COMPLETION,
        AIOperationType.TEXT_ANALYSIS,
      ],
    },
    costPerInputToken: 0.000003,
    costPerOutputToken: 0.000015,
  },
};

// Helper function to generate AI node with random ID
export function generateAINode(template: any): any {
  const node = JSON.parse(JSON.stringify(template));
  node.id = node.id.replace(
    "{{RANDOM_ID}}",
    Math.random().toString(36).substr(2, 9),
  );
  return node;
}

// Helper function to create AI flow from template
export function createAIFlowFromTemplate(
  templateName: string,
  customizations?: any,
): any {
  const template = AI_FLOW_TEMPLATES[templateName];
  if (!template) {
    throw new Error(`AI flow template '${templateName}' not found`);
  }

  const flow = JSON.parse(JSON.stringify(template));

  if (customizations) {
    Object.assign(flow, customizations);
  }

  // Generate unique IDs for nodes
  flow.nodes = flow.nodes.map((node) => ({
    ...node,
    id: `${node.id}_${Math.random().toString(36).substr(2, 9)}`,
  }));

  return flow;
}

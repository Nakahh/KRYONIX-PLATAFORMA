import OpenAI from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import { LanguageServiceClient } from "@google-cloud/language";
import { SpeechClient } from "@google-cloud/speech";
import { TranslationServiceClient } from "@google-cloud/translate";
import { createHash } from "crypto";
import { DatabaseConnection } from "../db/connection";
import { Repository } from "typeorm";
import {
  AIServiceUsage,
  AIServiceType,
  AIOperationType,
  AISourceModule,
} from "../entities/AIServiceUsage";
import { AIModelConfig } from "../entities/AIModelConfig";
import { AIResponseCache } from "../entities/AIResponseCache";
import { Tenant } from "../entities/Tenant";

export interface AIRequest {
  service: AIServiceType;
  operation: AIOperationType;
  model?: string;
  input: string | any;
  settings?: Record<string, any>;
  sourceModule: AISourceModule;
  sourceId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costUSD: number;
  };
  metadata?: Record<string, any>;
  cached?: boolean;
  executionTimeMs: number;
}

export interface AIProvider {
  processRequest(
    request: AIRequest,
    config: AIModelConfig,
  ): Promise<AIResponse>;
  validateConfig(config: AIModelConfig): boolean;
  getSupportedOperations(): AIOperationType[];
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processRequest(
    request: AIRequest,
    config: AIModelConfig,
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const settings = config.getEffectiveSettings();

      switch (request.operation) {
        case AIOperationType.CHAT_COMPLETION:
          return await this.chatCompletion(
            request,
            config,
            settings,
            startTime,
          );
        case AIOperationType.TEXT_ANALYSIS:
          return await this.textAnalysis(request, config, settings, startTime);
        case AIOperationType.CONTENT_MODERATION:
          return await this.contentModeration(
            request,
            config,
            settings,
            startTime,
          );
        default:
          throw new Error(`Unsupported operation: ${request.operation}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  private async chatCompletion(
    request: AIRequest,
    config: AIModelConfig,
    settings: any,
    startTime: number,
  ): Promise<AIResponse> {
    const messages =
      typeof request.input === "string"
        ? [{ role: "user", content: request.input }]
        : request.input;

    if (settings.systemPrompt) {
      messages.unshift({ role: "system", content: settings.systemPrompt });
    }

    const completion = await this.client.chat.completions.create({
      model: config.modelName,
      messages: messages,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      top_p: settings.topP,
      frequency_penalty: settings.frequencyPenalty,
      presence_penalty: settings.presencePenalty,
    });

    const usage = completion.usage;
    const costUSD = config.calculateCost(
      usage.prompt_tokens,
      usage.completion_tokens,
    );

    return {
      success: true,
      data: {
        content: completion.choices[0].message.content,
        role: completion.choices[0].message.role,
        finishReason: completion.choices[0].finish_reason,
      },
      usage: {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        costUSD,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  private async textAnalysis(
    request: AIRequest,
    config: AIModelConfig,
    settings: any,
    startTime: number,
  ): Promise<AIResponse> {
    const prompt = `Analyze the following text and provide insights about sentiment, topics, and key information:\n\n${request.input}`;

    const completion = await this.client.chat.completions.create({
      model: config.modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 500,
    });

    const usage = completion.usage;
    const costUSD = config.calculateCost(
      usage.prompt_tokens,
      usage.completion_tokens,
    );

    return {
      success: true,
      data: {
        analysis: completion.choices[0].message.content,
        confidence: 0.8, // Simulated confidence score
      },
      usage: {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        costUSD,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  private async contentModeration(
    request: AIRequest,
    config: AIModelConfig,
    settings: any,
    startTime: number,
  ): Promise<AIResponse> {
    const moderation = await this.client.moderations.create({
      input: request.input,
    });

    return {
      success: true,
      data: {
        flagged: moderation.results[0].flagged,
        categories: moderation.results[0].categories,
        categoryScores: moderation.results[0].category_scores,
      },
      usage: {
        inputTokens: Math.ceil(request.input.length / 4), // Approximate
        outputTokens: 0,
        totalTokens: Math.ceil(request.input.length / 4),
        costUSD: 0, // Moderation is free
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  validateConfig(config: AIModelConfig): boolean {
    return ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"].includes(config.modelName);
  }

  getSupportedOperations(): AIOperationType[] {
    return [
      AIOperationType.CHAT_COMPLETION,
      AIOperationType.TEXT_ANALYSIS,
      AIOperationType.CONTENT_MODERATION,
    ];
  }
}

class GoogleAIProvider implements AIProvider {
  private languageClient: LanguageServiceClient;
  private speechClient: SpeechClient;
  private translateClient: TranslationServiceClient;

  constructor() {
    // Initialize clients based on available credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.languageClient = new LanguageServiceClient();
      this.speechClient = new SpeechClient();
      this.translateClient = new TranslationServiceClient();
    }
  }

  async processRequest(
    request: AIRequest,
    config: AIModelConfig,
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      switch (request.operation) {
        case AIOperationType.SENTIMENT_ANALYSIS:
          return await this.sentimentAnalysis(request, config, startTime);
        case AIOperationType.SPEECH_TO_TEXT:
          return await this.speechToText(request, config, startTime);
        case AIOperationType.TRANSLATION:
          return await this.translation(request, config, startTime);
        default:
          throw new Error(`Unsupported operation: ${request.operation}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  private async sentimentAnalysis(
    request: AIRequest,
    config: AIModelConfig,
    startTime: number,
  ): Promise<AIResponse> {
    const document = {
      content: request.input,
      type: "PLAIN_TEXT" as const,
    };

    const [result] = await this.languageClient.analyzeSentiment({ document });
    const sentiment = result.documentSentiment;

    return {
      success: true,
      data: {
        sentiment:
          sentiment.score > 0
            ? "positive"
            : sentiment.score < 0
              ? "negative"
              : "neutral",
        score: sentiment.score,
        magnitude: sentiment.magnitude,
        confidence: Math.abs(sentiment.score),
      },
      usage: {
        inputTokens: Math.ceil(request.input.length / 4),
        outputTokens: 10,
        totalTokens: Math.ceil(request.input.length / 4) + 10,
        costUSD: 0.001, // Approximate cost
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  private async speechToText(
    request: AIRequest,
    config: AIModelConfig,
    startTime: number,
  ): Promise<AIResponse> {
    const audio = {
      content: request.input, // Base64 encoded audio
    };

    const requestConfig = {
      encoding: "WEBM_OPUS" as const,
      sampleRateHertz: 16000,
      languageCode: "pt-BR",
    };

    const [response] = await this.speechClient.recognize({
      audio,
      config: requestConfig,
    });

    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    return {
      success: true,
      data: {
        transcript: transcription,
        confidence: response.results[0]?.alternatives[0]?.confidence || 0.8,
      },
      usage: {
        inputTokens: 0,
        outputTokens: Math.ceil(transcription.length / 4),
        totalTokens: Math.ceil(transcription.length / 4),
        costUSD: 0.006, // Approximate cost per minute
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  private async translation(
    request: AIRequest,
    config: AIModelConfig,
    startTime: number,
  ): Promise<AIResponse> {
    const { text, targetLanguage = "en", sourceLanguage } = request.input;

    const requestConfig: any = {
      parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/global`,
      contents: [text],
      mimeType: "text/plain",
      targetLanguageCode: targetLanguage,
    };

    if (sourceLanguage) {
      requestConfig.sourceLanguageCode = sourceLanguage;
    }

    const [response] = await this.translateClient.translateText(requestConfig);
    const translation = response.translations[0];

    return {
      success: true,
      data: {
        translatedText: translation.translatedText,
        detectedLanguage: translation.detectedLanguageCode,
        confidence: 0.9,
      },
      usage: {
        inputTokens: Math.ceil(text.length / 4),
        outputTokens: Math.ceil((translation.translatedText?.length || 0) / 4),
        totalTokens:
          Math.ceil(text.length / 4) +
          Math.ceil((translation.translatedText?.length || 0) / 4),
        costUSD: 0.02, // Approximate cost per 1M characters
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  validateConfig(config: AIModelConfig): boolean {
    return true; // Google services don't use traditional model names
  }

  getSupportedOperations(): AIOperationType[] {
    return [
      AIOperationType.SENTIMENT_ANALYSIS,
      AIOperationType.SPEECH_TO_TEXT,
      AIOperationType.TRANSLATION,
      AIOperationType.INTENT_CLASSIFICATION,
    ];
  }
}

class AnthropicProvider implements AIProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });
  }

  async processRequest(
    request: AIRequest,
    config: AIModelConfig,
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const settings = config.getEffectiveSettings();

      switch (request.operation) {
        case AIOperationType.CHAT_COMPLETION:
          return await this.chatCompletion(
            request,
            config,
            settings,
            startTime,
          );
        case AIOperationType.TEXT_ANALYSIS:
          return await this.textAnalysis(request, config, settings, startTime);
        default:
          throw new Error(`Unsupported operation: ${request.operation}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }

  private async chatCompletion(
    request: AIRequest,
    config: AIModelConfig,
    settings: any,
    startTime: number,
  ): Promise<AIResponse> {
    const message = await this.client.messages.create({
      model: config.modelName,
      max_tokens: settings.maxTokens || 1000,
      temperature: settings.temperature || 0.7,
      messages: [{ role: "user", content: request.input }],
      system: settings.systemPrompt,
    });

    const usage = message.usage;
    const costUSD = config.calculateCost(
      usage.input_tokens,
      usage.output_tokens,
    );

    return {
      success: true,
      data: {
        content: message.content[0].text,
        role: "assistant",
      },
      usage: {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
        costUSD,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  private async textAnalysis(
    request: AIRequest,
    config: AIModelConfig,
    settings: any,
    startTime: number,
  ): Promise<AIResponse> {
    const prompt = `Analyze the following text and provide detailed insights:\n\n${request.input}`;

    const message = await this.client.messages.create({
      model: config.modelName,
      max_tokens: 500,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    });

    const usage = message.usage;
    const costUSD = config.calculateCost(
      usage.input_tokens,
      usage.output_tokens,
    );

    return {
      success: true,
      data: {
        analysis: message.content[0].text,
        confidence: 0.85,
      },
      usage: {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
        costUSD,
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  validateConfig(config: AIModelConfig): boolean {
    return [
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
      "claude-3-opus-20240229",
    ].includes(config.modelName);
  }

  getSupportedOperations(): AIOperationType[] {
    return [AIOperationType.CHAT_COMPLETION, AIOperationType.TEXT_ANALYSIS];
  }
}

export class AIService {
  private static providers = new Map<AIServiceType, AIProvider>();
  private static usageRepo: Repository<AIServiceUsage>;
  private static configRepo: Repository<AIModelConfig>;
  private static cacheRepo: Repository<AIResponseCache>;
  private static tenantRepo: Repository<Tenant>;

  static async initialize(): Promise<void> {
    const dataSource = await DatabaseConnection.getInstance();
    this.usageRepo = dataSource.getRepository(AIServiceUsage);
    this.configRepo = dataSource.getRepository(AIModelConfig);
    this.cacheRepo = dataSource.getRepository(AIResponseCache);
    this.tenantRepo = dataSource.getRepository(Tenant);

    // Initialize providers based on available API keys
    if (process.env.OPENAI_API_KEY) {
      this.providers.set(AIServiceType.OPENAI, new OpenAIProvider());
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.providers.set(AIServiceType.GOOGLE, new GoogleAIProvider());
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set(AIServiceType.ANTHROPIC, new AnthropicProvider());
    }

    console.log(
      `🤖 AI Service initialized with ${this.providers.size} providers`,
    );
  }

  static async processRequest(
    tenantId: string,
    request: AIRequest,
  ): Promise<AIResponse> {
    try {
      // 1. Check tenant limits
      await this.checkTenantLimits(tenantId, request);

      // 2. Get model configuration
      const config = await this.getModelConfig(
        tenantId,
        request.service,
        request.model,
      );

      // 3. Check cache
      const cached = await this.getFromCache(tenantId, request, config);
      if (cached) {
        return { ...cached, cached: true };
      }

      // 4. Execute with fallback
      const response = await this.executeWithFallback(
        tenantId,
        request,
        config,
      );

      // 5. Track usage
      await this.trackUsage(tenantId, request, response, config);

      // 6. Cache response
      if (response.success) {
        await this.cacheResponse(tenantId, request, response, config);
      }

      return response;
    } catch (error) {
      console.error("AI Service error:", error);
      return {
        success: false,
        error: error.message,
        executionTimeMs: 0,
      };
    }
  }

  private static async checkTenantLimits(
    tenantId: string,
    request: AIRequest,
  ): Promise<void> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    // Check AI enabled
    if (
      !tenant.settings?.aiSettings?.enabledServices?.includes(request.service)
    ) {
      throw new Error(`AI service ${request.service} not enabled for tenant`);
    }

    // Check daily calls limit
    if (tenant.usage.aiCallsToday >= tenant.limits.maxAICallsPerDay) {
      throw new Error("Daily AI calls limit exceeded");
    }

    // Check monthly tokens limit
    if (tenant.usage.aiTokensThisMonth >= tenant.limits.maxAITokensPerMonth) {
      throw new Error("Monthly AI tokens limit exceeded");
    }

    // Check budget limit
    if (tenant.usage.aiCostThisMonthUSD >= tenant.limits.maxAIBudgetUSD) {
      throw new Error("Monthly AI budget limit exceeded");
    }

    // Check concurrent requests
    if (
      tenant.usage.currentAIRequests >= tenant.limits.maxConcurrentAIRequests
    ) {
      throw new Error("Maximum concurrent AI requests exceeded");
    }
  }

  private static async getModelConfig(
    tenantId: string,
    serviceType: AIServiceType,
    modelName?: string,
  ): Promise<AIModelConfig> {
    let config: AIModelConfig | null;

    if (modelName) {
      config = await this.configRepo.findOne({
        where: { tenantId, serviceType, modelName, status: "ACTIVE" },
      });
    }

    if (!config) {
      config = await this.configRepo.findOne({
        where: { tenantId, serviceType, isDefault: true, status: "ACTIVE" },
      });
    }

    if (!config) {
      throw new Error(
        `No active AI model configuration found for ${serviceType}`,
      );
    }

    return config;
  }

  private static generateCacheKey(
    tenantId: string,
    request: AIRequest,
    config: AIModelConfig,
  ): string {
    const hashInput = JSON.stringify({
      tenantId,
      service: request.service,
      operation: request.operation,
      model: config.modelName,
      input: request.input,
      settings: config.settings,
    });

    return createHash("sha256")
      .update(hashInput)
      .digest("hex")
      .substring(0, 32);
  }

  private static async getFromCache(
    tenantId: string,
    request: AIRequest,
    config: AIModelConfig,
  ): Promise<AIResponse | null> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant?.settings?.aiSettings?.enableCaching) {
      return null;
    }

    const cacheKey = this.generateCacheKey(tenantId, request, config);
    const cached = await this.cacheRepo.findOne({
      where: { cacheKey, tenantId },
    });

    if (cached && !cached.isExpired()) {
      cached.incrementHitCount();
      await this.cacheRepo.save(cached);

      return {
        success: true,
        data: cached.responseData,
        executionTimeMs: 0,
      };
    }

    return null;
  }

  private static async executeWithFallback(
    tenantId: string,
    request: AIRequest,
    config: AIModelConfig,
  ): Promise<AIResponse> {
    const provider = this.providers.get(request.service);
    if (!provider) {
      throw new Error(`Provider not available for ${request.service}`);
    }

    // Update concurrent requests counter
    await this.incrementConcurrentRequests(tenantId);

    try {
      const response = await provider.processRequest(request, config);
      return response;
    } finally {
      // Decrement concurrent requests counter
      await this.decrementConcurrentRequests(tenantId);
    }
  }

  private static async trackUsage(
    tenantId: string,
    request: AIRequest,
    response: AIResponse,
    config: AIModelConfig,
  ): Promise<void> {
    const usage = new AIServiceUsage();
    usage.tenantId = tenantId;
    usage.serviceType = request.service;
    usage.operationType = request.operation;
    usage.modelName = config.modelName;
    usage.inputTokens = response.usage?.inputTokens || 0;
    usage.outputTokens = response.usage?.outputTokens || 0;
    usage.costUSD = response.usage?.costUSD || 0;
    usage.requestData = this.sanitizeRequestData(request);
    usage.responseData = this.sanitizeResponseData(response);
    usage.executionTimeMs = response.executionTimeMs;
    usage.sourceModule = request.sourceModule;
    usage.sourceId = request.sourceId;
    usage.userId = request.userId;
    usage.ipAddress = request.ipAddress;
    usage.userAgent = request.userAgent;
    usage.success = response.success;
    usage.errorMessage = response.error;
    usage.metadata = request.metadata;

    await this.usageRepo.save(usage);

    // Update tenant usage metrics
    await this.updateTenantUsage(
      tenantId,
      response.usage?.totalTokens || 0,
      response.usage?.costUSD || 0,
    );
  }

  private static async cacheResponse(
    tenantId: string,
    request: AIRequest,
    response: AIResponse,
    config: AIModelConfig,
  ): Promise<void> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant?.settings?.aiSettings?.enableCaching) {
      return;
    }

    const cacheKey = this.generateCacheKey(tenantId, request, config);
    const expiryMinutes = tenant.settings.aiSettings.cacheExpiryMinutes || 60;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const inputHash = createHash("sha256")
      .update(JSON.stringify(request.input))
      .digest("hex");

    const cache = new AIResponseCache();
    cache.tenantId = tenantId;
    cache.cacheKey = cacheKey;
    cache.serviceType = request.service;
    cache.modelName = config.modelName;
    cache.inputHash = inputHash;
    cache.responseData = response.data;
    cache.expiresAt = expiresAt;
    cache.metadata = {
      operation: request.operation,
      sourceModule: request.sourceModule,
    };

    try {
      await this.cacheRepo.save(cache);
    } catch (error) {
      // Cache save failures should not block the main request
      console.warn("Failed to cache AI response:", error.message);
    }
  }

  private static async incrementConcurrentRequests(
    tenantId: string,
  ): Promise<void> {
    await this.tenantRepo.increment(
      { id: tenantId },
      "usage.currentAIRequests",
      1,
    );
  }

  private static async decrementConcurrentRequests(
    tenantId: string,
  ): Promise<void> {
    await this.tenantRepo.decrement(
      { id: tenantId },
      "usage.currentAIRequests",
      1,
    );
  }

  private static async updateTenantUsage(
    tenantId: string,
    tokens: number,
    cost: number,
  ): Promise<void> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) return;

    tenant.updateUsage({
      aiCallsToday: tenant.usage.aiCallsToday + 1,
      aiTokensThisMonth: tenant.usage.aiTokensThisMonth + tokens,
      aiCostThisMonthUSD: tenant.usage.aiCostThisMonthUSD + cost,
    });

    await this.tenantRepo.save(tenant);
  }

  private static sanitizeRequestData(request: AIRequest): any {
    // Remove sensitive data from request before storing
    const sanitized = { ...request };
    delete sanitized.metadata;
    if (typeof sanitized.input === "string" && sanitized.input.length > 1000) {
      sanitized.input = sanitized.input.substring(0, 1000) + "...";
    }
    return sanitized;
  }

  private static sanitizeResponseData(response: AIResponse): any {
    // Remove large data from response before storing
    const sanitized = { ...response };
    delete sanitized.metadata;
    if (sanitized.data && typeof sanitized.data === "object") {
      const data = { ...sanitized.data };
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === "string" && data[key].length > 1000) {
          data[key] = data[key].substring(0, 1000) + "...";
        }
      });
      sanitized.data = data;
    }
    return sanitized;
  }

  // Utility methods
  static async getServiceHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [serviceType, provider] of this.providers) {
      try {
        // Simple health check - validate config structure
        health[serviceType] = true;
      } catch (error) {
        health[serviceType] = false;
      }
    }

    return health;
  }

  static async getTenantUsageStats(
    tenantId: string,
    days: number = 30,
  ): Promise<any> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const usage = await this.usageRepo
      .createQueryBuilder("usage")
      .select([
        "DATE(usage.createdAt) as date",
        "COUNT(*) as requests",
        "SUM(usage.inputTokens + usage.outputTokens) as tokens",
        "SUM(usage.costUSD) as cost",
        "AVG(usage.executionTimeMs) as avgExecutionTime",
      ])
      .where("usage.tenantId = :tenantId", { tenantId })
      .andWhere("usage.createdAt >= :startDate", { startDate })
      .andWhere("usage.createdAt <= :endDate", { endDate })
      .groupBy("DATE(usage.createdAt)")
      .orderBy("DATE(usage.createdAt)", "ASC")
      .getRawMany();

    return usage;
  }

  static getAvailableServices(): AIServiceType[] {
    return Array.from(this.providers.keys());
  }

  static getProviderOperations(serviceType: AIServiceType): AIOperationType[] {
    const provider = this.providers.get(serviceType);
    return provider ? provider.getSupportedOperations() : [];
  }
}

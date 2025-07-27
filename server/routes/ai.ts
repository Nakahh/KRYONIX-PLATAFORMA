import { Router, RequestHandler } from "express";
import { z } from "zod";
import {
  createAuthMiddleware,
  validateBody,
  validateQuery,
} from "../middleware/auth";
import { AIService } from "../services/ai";
import {
  AIServiceType,
  AIOperationType,
  AISourceModule,
} from "../entities/AIServiceUsage";
import { DatabaseConnection } from "../db/connection";
import { AIModelConfig } from "../entities/AIModelConfig";
import { AIServiceUsage } from "../entities/AIServiceUsage";
import { AIResponseCache } from "../entities/AIResponseCache";
import {
  AI_MODEL_TEMPLATES,
  AI_WORKFLOW_TEMPLATES,
  AI_TYPEBOT_NODES,
} from "../templates/ai-templates";

const router = Router();

// Validation Schemas
const ProcessAIRequestSchema = z.object({
  service: z.nativeEnum(AIServiceType),
  operation: z.nativeEnum(AIOperationType),
  model: z.string().optional(),
  input: z.union([z.string(), z.object({}).passthrough()]),
  settings: z.object({}).passthrough().optional(),
  sourceModule: z.nativeEnum(AISourceModule),
  sourceId: z.string().uuid().optional(),
  metadata: z.object({}).passthrough().optional(),
});

const CreateModelConfigSchema = z.object({
  serviceType: z.nativeEnum(AIServiceType),
  modelName: z.string().min(1),
  displayName: z.string().optional(),
  description: z.string().optional(),
  settings: z.object({}).passthrough(),
  limits: z.object({
    maxTokensPerRequest: z.number().positive(),
    maxRequestsPerMinute: z.number().positive(),
    maxRequestsPerDay: z.number().positive(),
    maxCostPerRequest: z.number().positive(),
    allowedOperations: z.array(z.string()),
  }),
  isDefault: z.boolean().default(false),
  costPerInputToken: z.number().nonnegative(),
  costPerOutputToken: z.number().nonnegative(),
  priority: z.number().default(0),
  metadata: z.object({}).passthrough().optional(),
});

const UpdateModelConfigSchema = CreateModelConfigSchema.partial();

const UsageQuerySchema = z.object({
  days: z.coerce.number().positive().max(365).default(30),
  service: z.nativeEnum(AIServiceType).optional(),
  operation: z.nativeEnum(AIOperationType).optional(),
  sourceModule: z.nativeEnum(AISourceModule).optional(),
});

const CacheQuerySchema = z.object({
  service: z.nativeEnum(AIServiceType).optional(),
  expired: z.coerce.boolean().optional(),
  limit: z.coerce.number().positive().max(100).default(20),
  offset: z.coerce.number().nonnegative().default(0),
});

// AI Request Processing
export const processAIRequest: RequestHandler[] = [
  ...createAuthMiddleware("ai:use"),
  validateBody(ProcessAIRequestSchema),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const requestData = req.body;

      // Add request metadata
      requestData.userId = req.user.id;
      requestData.ipAddress = req.ip;
      requestData.userAgent = req.get("User-Agent");

      const response = await AIService.processRequest(tenantId, requestData);

      res.json({
        success: response.success,
        data: response.data,
        usage: response.usage,
        cached: response.cached,
        executionTimeMs: response.executionTimeMs,
        error: response.error,
      });
    } catch (error) {
      console.error("AI request processing error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
];

// Model Configuration Management
export const createModelConfig: RequestHandler[] = [
  ...createAuthMiddleware("ai:admin"),
  validateBody(CreateModelConfigSchema),
  async (req, res) => {
    try {
      const dataSource = await DatabaseConnection.getInstance();
      const configRepo = dataSource.getRepository(AIModelConfig);
      const tenantId = req.user.tenantId;

      // Check if this is set as default and update existing defaults
      if (req.body.isDefault) {
        await configRepo.update(
          { tenantId, serviceType: req.body.serviceType },
          { isDefault: false },
        );
      }

      const config = configRepo.create({
        ...req.body,
        tenantId,
      });

      const savedConfig = await configRepo.save(config);
      res.status(201).json(savedConfig);
    } catch (error) {
      console.error("Create model config error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

export const getModelConfigs: RequestHandler[] = [
  ...createAuthMiddleware("ai:read"),
  async (req, res) => {
    try {
      const dataSource = await DatabaseConnection.getInstance();
      const configRepo = dataSource.getRepository(AIModelConfig);
      const tenantId = req.user.tenantId;

      const configs = await configRepo.find({
        where: { tenantId },
        order: { priority: "DESC", createdAt: "DESC" },
      });

      res.json(configs);
    } catch (error) {
      console.error("Get model configs error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

export const getModelConfig: RequestHandler[] = [
  ...createAuthMiddleware("ai:read"),
  async (req, res) => {
    try {
      const dataSource = await DatabaseConnection.getInstance();
      const configRepo = dataSource.getRepository(AIModelConfig);
      const tenantId = req.user.tenantId;
      const configId = req.params.configId;

      const config = await configRepo.findOne({
        where: { id: configId, tenantId },
      });

      if (!config) {
        return res.status(404).json({ error: "Model configuration not found" });
      }

      res.json(config);
    } catch (error) {
      console.error("Get model config error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

export const updateModelConfig: RequestHandler[] = [
  ...createAuthMiddleware("ai:admin"),
  validateBody(UpdateModelConfigSchema),
  async (req, res) => {
    try {
      const dataSource = await DatabaseConnection.getInstance();
      const configRepo = dataSource.getRepository(AIModelConfig);
      const tenantId = req.user.tenantId;
      const configId = req.params.configId;

      const config = await configRepo.findOne({
        where: { id: configId, tenantId },
      });

      if (!config) {
        return res.status(404).json({ error: "Model configuration not found" });
      }

      // Handle default flag changes
      if (req.body.isDefault === true && !config.isDefault) {
        await configRepo.update(
          { tenantId, serviceType: config.serviceType },
          { isDefault: false },
        );
      }

      Object.assign(config, req.body);
      const savedConfig = await configRepo.save(config);

      res.json(savedConfig);
    } catch (error) {
      console.error("Update model config error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

export const deleteModelConfig: RequestHandler[] = [
  ...createAuthMiddleware("ai:admin"),
  async (req, res) => {
    try {
      const dataSource = await DatabaseConnection.getInstance();
      const configRepo = dataSource.getRepository(AIModelConfig);
      const tenantId = req.user.tenantId;
      const configId = req.params.configId;

      const config = await configRepo.findOne({
        where: { id: configId, tenantId },
      });

      if (!config) {
        return res.status(404).json({ error: "Model configuration not found" });
      }

      await configRepo.remove(config);
      res.status(204).send();
    } catch (error) {
      console.error("Delete model config error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Usage Analytics
export const getUsageStats: RequestHandler[] = [
  ...createAuthMiddleware("ai:read"),
  validateQuery(UsageQuerySchema),
  async (req, res) => {
    try {
      const tenantId = req.user.tenantId;
      const { days, service, operation, sourceModule } = req.query as any;

      const stats = await AIService.getTenantUsageStats(tenantId, days);

      // Additional filtering if specified
      const dataSource = await DatabaseConnection.getInstance();
      const usageRepo = dataSource.getRepository(AIServiceUsage);

      const queryBuilder = usageRepo
        .createQueryBuilder("usage")
        .where("usage.tenantId = :tenantId", { tenantId });

      if (service) {
        queryBuilder.andWhere("usage.serviceType = :service", { service });
      }

      if (operation) {
        queryBuilder.andWhere("usage.operationType = :operation", {
          operation,
        });
      }

      if (sourceModule) {
        queryBuilder.andWhere("usage.sourceModule = :sourceModule", {
          sourceModule,
        });
      }

      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - days * 24 * 60 * 60 * 1000,
      );
      queryBuilder.andWhere("usage.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });

      const [totalRequests, totalCost, averageExecutionTime] =
        await Promise.all([
          queryBuilder.getCount(),
          queryBuilder
            .select("SUM(usage.costUSD)", "total")
            .getRawOne()
            .then((result) => parseFloat(result.total) || 0),
          queryBuilder
            .select("AVG(usage.executionTimeMs)", "average")
            .getRawOne()
            .then((result) => parseFloat(result.average) || 0),
        ]);

      res.json({
        period: { days, startDate, endDate },
        summary: {
          totalRequests,
          totalCost,
          averageExecutionTime: Math.round(averageExecutionTime),
        },
        dailyStats: stats,
      });
    } catch (error) {
      console.error("Get usage stats error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

export const getUsageDetails: RequestHandler[] = [
  ...createAuthMiddleware("ai:read"),
  validateQuery(UsageQuerySchema),
  async (req, res) => {
    try {
      const dataSource = await DatabaseConnection.getInstance();
      const usageRepo = dataSource.getRepository(AIServiceUsage);
      const tenantId = req.user.tenantId;
      const { days, service, operation, sourceModule } = req.query as any;

      const queryBuilder = usageRepo
        .createQueryBuilder("usage")
        .where("usage.tenantId = :tenantId", { tenantId })
        .orderBy("usage.createdAt", "DESC")
        .limit(100);

      if (service) {
        queryBuilder.andWhere("usage.serviceType = :service", { service });
      }

      if (operation) {
        queryBuilder.andWhere("usage.operationType = :operation", {
          operation,
        });
      }

      if (sourceModule) {
        queryBuilder.andWhere("usage.sourceModule = :sourceModule", {
          sourceModule,
        });
      }

      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - days * 24 * 60 * 60 * 1000,
      );
      queryBuilder.andWhere("usage.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });

      const usage = await queryBuilder.getMany();
      res.json(usage);
    } catch (error) {
      console.error("Get usage details error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Cache Management
export const getCacheStats: RequestHandler[] = [
  ...createAuthMiddleware("ai:read"),
  validateQuery(CacheQuerySchema),
  async (req, res) => {
    try {
      const dataSource = await DatabaseConnection.getInstance();
      const cacheRepo = dataSource.getRepository(AIResponseCache);
      const tenantId = req.user.tenantId;
      const { service, expired, limit, offset } = req.query as any;

      const queryBuilder = cacheRepo
        .createQueryBuilder("cache")
        .where("cache.tenantId = :tenantId", { tenantId });

      if (service) {
        queryBuilder.andWhere("cache.serviceType = :service", { service });
      }

      if (expired !== undefined) {
        if (expired) {
          queryBuilder.andWhere("cache.expiresAt < NOW()");
        } else {
          queryBuilder.andWhere("cache.expiresAt >= NOW()");
        }
      }

      const [cacheEntries, total] = await queryBuilder
        .orderBy("cache.createdAt", "DESC")
        .limit(limit)
        .offset(offset)
        .getManyAndCount();

      // Calculate cache statistics
      const hitRateQuery = cacheRepo
        .createQueryBuilder("cache")
        .select("AVG(cache.hitCount)", "avgHitRate")
        .where("cache.tenantId = :tenantId", { tenantId });

      const avgHitRate = await hitRateQuery.getRawOne();

      res.json({
        entries: cacheEntries,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit),
        },
        statistics: {
          totalEntries: total,
          averageHitRate: parseFloat(avgHitRate.avgHitRate) || 0,
        },
      });
    } catch (error) {
      console.error("Get cache stats error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

export const clearCache: RequestHandler[] = [
  ...createAuthMiddleware("ai:admin"),
  async (req, res) => {
    try {
      const dataSource = await DatabaseConnection.getInstance();
      const cacheRepo = dataSource.getRepository(AIResponseCache);
      const tenantId = req.user.tenantId;
      const { service, expired } = req.query;

      const queryBuilder = cacheRepo
        .createQueryBuilder()
        .delete()
        .where("tenantId = :tenantId", { tenantId });

      if (service) {
        queryBuilder.andWhere("serviceType = :service", { service });
      }

      if (expired === "true") {
        queryBuilder.andWhere("expiresAt < NOW()");
      }

      const result = await queryBuilder.execute();

      res.json({
        success: true,
        deletedCount: result.affected,
      });
    } catch (error) {
      console.error("Clear cache error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Service Health and Info
export const getServiceHealth: RequestHandler[] = [
  ...createAuthMiddleware("ai:read"),
  async (req, res) => {
    try {
      const health = await AIService.getServiceHealth();
      const availableServices = AIService.getAvailableServices();

      const serviceInfo = availableServices.map((service) => ({
        service,
        healthy: health[service],
        operations: AIService.getProviderOperations(service),
      }));

      res.json({
        overall: Object.values(health).every((status) => status),
        services: serviceInfo,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Get service health error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Templates
export const getAITemplates: RequestHandler[] = [
  ...createAuthMiddleware("ai:read"),
  async (req, res) => {
    try {
      const { type } = req.query;

      let templates = {};

      if (!type || type === "workflows") {
        templates.workflows = AI_WORKFLOW_TEMPLATES;
      }

      if (!type || type === "typebot") {
        templates.typebot = AI_TYPEBOT_NODES;
      }

      if (!type || type === "models") {
        templates.models = AI_MODEL_TEMPLATES;
      }

      res.json(templates);
    } catch (error) {
      console.error("Get AI templates error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

export const createFromTemplate: RequestHandler[] = [
  ...createAuthMiddleware("ai:admin"),
  async (req, res) => {
    try {
      const { templateType, templateName, customizations } = req.body;
      const tenantId = req.user.tenantId;

      if (templateType === "model") {
        const template = AI_MODEL_TEMPLATES[templateName];
        if (!template) {
          return res.status(404).json({ error: "Model template not found" });
        }

        const dataSource = await DatabaseConnection.getInstance();
        const configRepo = dataSource.getRepository(AIModelConfig);

        const config = configRepo.create({
          ...template,
          ...customizations,
          tenantId,
        });

        const savedConfig = await configRepo.save(config);
        res.status(201).json(savedConfig);
      } else {
        res.status(400).json({ error: "Unsupported template type" });
      }
    } catch (error) {
      console.error("Create from template error:", error);
      res.status(500).json({ error: error.message });
    }
  },
];

// Route definitions
router.post("/analyze", ...processAIRequest);

// Model configuration routes
router.post("/models", ...createModelConfig);
router.get("/models", ...getModelConfigs);
router.get("/models/:configId", ...getModelConfig);
router.put("/models/:configId", ...updateModelConfig);
router.delete("/models/:configId", ...deleteModelConfig);

// Usage and analytics routes
router.get("/usage/stats", ...getUsageStats);
router.get("/usage/details", ...getUsageDetails);

// Cache management routes
router.get("/cache", ...getCacheStats);
router.delete("/cache", ...clearCache);

// Service info routes
router.get("/health", ...getServiceHealth);
router.get("/templates", ...getAITemplates);
router.post("/templates", ...createFromTemplate);

export default router;

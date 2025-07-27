import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { stackConfigService } from '../services/stack-config';
import { authenticateToken, requireTenantAccess } from '../middleware/auth';
import type { StackType } from '../entities/StackConfiguration';

const router = Router();

// Schemas de validação
const stackConfigSchema = z.object({
  stackType: z.enum([
    'evolution_api', 'n8n', 'typebot', 'mautic', 'chatwoot', 
    'minio', 'redis', 'postgresql', 'grafana', 'prometheus', 
    'rabbitmq', 'supabase', 'stripe', 'openai', 'google_ai', 
    'anthropic', 'mailgun', 'sendgrid', 'twilio', 'google_oauth', 
    'github_oauth', 'google_workspace', 'meta_business', 
    'instagram_api', 'linkedin_api', 'twitter_api', 'cloudflare', 
    'aws_s3', 'custom_webhook'
  ] as const),
  configuration: z.record(z.any()),
  notes: z.string().optional(),
});

/**
 * @route GET /api/v1/stack-config/available
 * @desc Obter lista de stacks disponíveis
 */
router.get('/available', authenticateToken, async (req: Request, res: Response) => {
  try {
    const availableStacks = stackConfigService.getAvailableStacks();

    return res.json({
      success: true,
      data: {
        stacks: availableStacks,
        categories: [...new Set(availableStacks.map(s => s.category))]
      }
    });
  } catch (error) {
    console.error('Erro ao obter stacks disponíveis:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/v1/stack-config
 * @desc Obter todas as configurações do tenant
 */
router.get('/', authenticateToken, requireTenantAccess, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    
    const configurations = await stackConfigService.getTenantConfigurations(tenantId);
    const stats = await stackConfigService.getStackStats(tenantId);

    return res.json({
      success: true,
      data: {
        configurations: configurations.map(config => ({
          id: config.id,
          stackType: config.stackType,
          status: config.status,
          isEnabled: config.isEnabled,
          lastTestedAt: config.lastTestedAt,
          lastUsedAt: config.lastUsedAt,
          lastTestResult: config.lastTestResult,
          notes: config.notes,
          configuredBy: config.configuredByUser?.name,
          createdAt: config.createdAt,
          updatedAt: config.updatedAt,
          // Não retornar configuração completa por segurança
          hasConfiguration: !!config.configuration || !!config.encryptedSecrets,
          isFullyConfigured: config.isFullyConfigured()
        })),
        stats
      }
    });
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/v1/stack-config/:stackType
 * @desc Obter configuração específica
 */
router.get('/:stackType', authenticateToken, requireTenantAccess, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const stackType = req.params.stackType as StackType;
    
    const configuration = await stackConfigService.getConfiguration(tenantId, stackType);

    if (!configuration) {
      return res.status(404).json({
        success: false,
        message: 'Configuração não encontrada',
        code: 'CONFIG_NOT_FOUND'
      });
    }

    // Retornar configuração sem dados sensíveis
    return res.json({
      success: true,
      data: {
        id: configuration.id,
        stackType: configuration.stackType,
        status: configuration.status,
        isEnabled: configuration.isEnabled,
        configuration: configuration.configuration, // Apenas dados públicos
        notes: configuration.notes,
        lastTestedAt: configuration.lastTestedAt,
        lastUsedAt: configuration.lastUsedAt,
        lastTestResult: configuration.lastTestResult,
        configuredBy: configuration.configuredByUser?.name,
        createdAt: configuration.createdAt,
        updatedAt: configuration.updatedAt,
        requiredFields: configuration.getRequiredFields(),
        isFullyConfigured: configuration.isFullyConfigured()
      }
    });
  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/v1/stack-config
 * @desc Salvar configuração
 */
router.post('/', authenticateToken, requireTenantAccess, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    
    const { stackType, configuration, notes } = stackConfigSchema.parse(req.body);

    const savedConfig = await stackConfigService.saveConfiguration(
      tenantId,
      stackType,
      configuration,
      userId,
      notes
    );

    return res.json({
      success: true,
      message: 'Configuração salva com sucesso',
      data: {
        id: savedConfig.id,
        stackType: savedConfig.stackType,
        status: savedConfig.status,
        isFullyConfigured: savedConfig.isFullyConfigured()
      }
    });
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route POST /api/v1/stack-config/:stackType/test
 * @desc Testar conexão com a stack
 */
router.post('/:stackType/test', authenticateToken, requireTenantAccess, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const stackType = req.params.stackType as StackType;

    const testResult = await stackConfigService.testConnection(tenantId, stackType);

    return res.json({
      success: true,
      message: 'Teste de conexão realizado',
      data: testResult
    });
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route PUT /api/v1/stack-config/:stackType/toggle
 * @desc Habilitar/desabilitar stack
 */
router.put('/:stackType/toggle', authenticateToken, requireTenantAccess, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const stackType = req.params.stackType as StackType;
    const { enabled } = z.object({ enabled: z.boolean() }).parse(req.body);

    await stackConfigService.toggleStack(tenantId, stackType, enabled);

    return res.json({
      success: true,
      message: `Stack ${enabled ? 'habilitada' : 'desabilitada'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alterar status da stack:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route DELETE /api/v1/stack-config/:stackType
 * @desc Deletar configuração
 */
router.delete('/:stackType', authenticateToken, requireTenantAccess, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const stackType = req.params.stackType as StackType;

    await stackConfigService.deleteConfiguration(tenantId, stackType);

    return res.json({
      success: true,
      message: 'Configuração removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar configuração:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @route GET /api/v1/stack-config/stats
 * @desc Obter estatísticas das stacks
 */
router.get('/stats', authenticateToken, requireTenantAccess, async (req: Request, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    
    const stats = await stackConfigService.getStackStats(tenantId);

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

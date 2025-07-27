import { Repository } from 'typeorm';
import { StackConfiguration } from '../entities/StackConfiguration';
import type { StackType, StackStatus, StackConfigField, StackTestResult } from '../entities/StackConfiguration';
import { getDataSource } from '../db/connection';

export class StackConfigService {
  private repository: Repository<StackConfiguration>;

  constructor() {
    const dataSource = getDataSource();
    this.repository = dataSource.getRepository(StackConfiguration);
  }

  /**
   * Obter todas as configurações de um tenant
   */
  async getTenantConfigurations(tenantId: string): Promise<StackConfiguration[]> {
    return this.repository.find({
      where: { tenantId },
      relations: ['configuredByUser'],
      order: { stackType: 'ASC' }
    });
  }

  /**
   * Obter configuração específica
   */
  async getConfiguration(tenantId: string, stackType: StackType): Promise<StackConfiguration | null> {
    return this.repository.findOne({
      where: { tenantId, stackType },
      relations: ['configuredByUser']
    });
  }

  /**
   * Criar ou atualizar configuração
   */
  async saveConfiguration(
    tenantId: string,
    stackType: StackType,
    configuration: Record<string, any>,
    userId?: string,
    notes?: string
  ): Promise<StackConfiguration> {
    let config = await this.repository.findOne({
      where: { tenantId, stackType }
    });

    if (!config) {
      config = this.repository.create({
        tenantId,
        stackType,
        status: 'configured'
      });
    }

    config.configuration = configuration;
    config.configuredBy = userId;
    config.notes = notes;
    config.status = 'configured';
    config.updatedAt = new Date();

    return this.repository.save(config);
  }

  /**
   * Testar conexão com a stack
   */
  async testConnection(tenantId: string, stackType: StackType): Promise<StackTestResult> {
    const config = await this.getConfiguration(tenantId, stackType);
    
    if (!config) {
      return {
        success: false,
        message: 'Configuração não encontrada',
        timestamp: new Date()
      };
    }

    const fullConfig = config.getFullConfiguration();
    const startTime = Date.now();

    try {
      // Atualizar status para testing
      await this.updateStatus(tenantId, stackType, 'testing');

      let testResult: StackTestResult;

      switch (stackType) {
        case 'evolution_api':
          testResult = await this.testEvolutionAPI(fullConfig);
          break;
        case 'n8n':
          testResult = await this.testN8N(fullConfig);
          break;
        case 'typebot':
          testResult = await this.testTypebot(fullConfig);
          break;
        case 'mautic':
          testResult = await this.testMautic(fullConfig);
          break;
        case 'stripe':
          testResult = await this.testStripe(fullConfig);
          break;
        case 'openai':
          testResult = await this.testOpenAI(fullConfig);
          break;
        default:
          testResult = {
            success: false,
            message: `Teste não implementado para ${stackType}`,
            timestamp: new Date()
          };
      }

      testResult.responseTime = Date.now() - startTime;

      // Salvar resultado do teste
      config.lastTestResult = testResult;
      config.lastTestedAt = new Date();
      config.status = testResult.success ? 'active' : 'error';
      
      await this.repository.save(config);

      return testResult;
    } catch (error) {
      const errorResult: StackTestResult = {
        success: false,
        message: `Erro no teste: ${error.message}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };

      // Atualizar status para erro
      await this.updateStatus(tenantId, stackType, 'error');
      
      return errorResult;
    }
  }

  /**
   * Testar Evolution API
   */
  private async testEvolutionAPI(config: Record<string, any>): Promise<StackTestResult> {
    try {
      const response = await fetch(`${config.baseUrl}/manager/instances`, {
        headers: {
          'apikey': config.globalApiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Conexão estabelecida com sucesso',
          details: `${data.length || 0} instâncias encontradas`,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro de conexão: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Testar N8N
   */
  private async testN8N(config: Record<string, any>): Promise<StackTestResult> {
    try {
      const response = await fetch(`${config.baseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': config.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Conexão N8N estabelecida com sucesso',
          details: `${data.data?.length || 0} workflows encontrados`,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro de conexão N8N: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Testar Typebot
   */
  private async testTypebot(config: Record<string, any>): Promise<StackTestResult> {
    try {
      const response = await fetch(`${config.builderUrl}/api/typebots`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Conexão Typebot estabelecida com sucesso',
          details: `${data.typebots?.length || 0} bots encontrados`,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro de conexão Typebot: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Testar Mautic
   */
  private async testMautic(config: Record<string, any>): Promise<StackTestResult> {
    try {
      const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      
      const response = await fetch(`${config.baseUrl}/api/contacts?limit=1`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Conexão Mautic estabelecida com sucesso',
          details: `${data.total || 0} contatos na base`,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro de conexão Mautic: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Testar Stripe
   */
  private async testStripe(config: Record<string, any>): Promise<StackTestResult> {
    try {
      const response = await fetch('https://api.stripe.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${config.secretKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Conexão Stripe estabelecida com sucesso',
          details: `Conta: ${data.display_name || data.email}`,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro de conexão Stripe: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Testar OpenAI
   */
  private async testOpenAI(config: Record<string, any>): Promise<StackTestResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          ...(config.organizationId && { 'OpenAI-Organization': config.organizationId })
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: 'Conexão OpenAI estabelecida com sucesso',
          details: `${data.data?.length || 0} modelos disponíveis`,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          message: `Erro HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro de conexão OpenAI: ${error.message}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Atualizar status da stack
   */
  async updateStatus(tenantId: string, stackType: StackType, status: StackStatus): Promise<void> {
    await this.repository.update(
      { tenantId, stackType },
      { status, updatedAt: new Date() }
    );
  }

  /**
   * Atualizar último uso
   */
  async updateLastUsed(tenantId: string, stackType: StackType): Promise<void> {
    await this.repository.update(
      { tenantId, stackType },
      { lastUsedAt: new Date() }
    );
  }

  /**
   * Habilitar/desabilitar stack
   */
  async toggleStack(tenantId: string, stackType: StackType, enabled: boolean): Promise<void> {
    await this.repository.update(
      { tenantId, stackType },
      { isEnabled: enabled, updatedAt: new Date() }
    );
  }

  /**
   * Deletar configuração
   */
  async deleteConfiguration(tenantId: string, stackType: StackType): Promise<void> {
    await this.repository.delete({ tenantId, stackType });
  }

  /**
   * Obter estatísticas das stacks
   */
  async getStackStats(tenantId: string): Promise<{
    total: number;
    configured: number;
    active: number;
    errors: number;
    notConfigured: number;
  }> {
    const allStacks = Object.values(StackType);
    const configs = await this.getTenantConfigurations(tenantId);
    
    const configsByStatus = configs.reduce((acc, config) => {
      acc[config.status] = (acc[config.status] || 0) + 1;
      return acc;
    }, {} as Record<StackStatus, number>);

    return {
      total: allStacks.length,
      configured: configs.length,
      active: configsByStatus.active || 0,
      errors: configsByStatus.error || 0,
      notConfigured: allStacks.length - configs.length
    };
  }

  /**
   * Obter informações de todas as stacks disponíveis
   */
  getAvailableStacks(): Array<{
    type: StackType;
    name: string;
    description: string;
    category: string;
    icon: string;
    documentation?: string;
  }> {
    return [
      {
        type: 'evolution_api',
        name: 'Evolution API',
        description: 'API para automação do WhatsApp Business',
        category: 'Comunicação',
        icon: 'whatsapp',
        documentation: 'https://doc.evolution-api.com'
      },
      {
        type: 'n8n',
        name: 'N8N Workflows',
        description: 'Automação de processos e integrações',
        category: 'Automação',
        icon: 'workflow',
        documentation: 'https://docs.n8n.io'
      },
      {
        type: 'typebot',
        name: 'Typebot',
        description: 'Criador visual de chatbots',
        category: 'Chatbots',
        icon: 'bot',
        documentation: 'https://docs.typebot.io'
      },
      {
        type: 'mautic',
        name: 'Mautic',
        description: 'Automação de marketing e leads',
        category: 'Marketing',
        icon: 'mail',
        documentation: 'https://docs.mautic.org'
      },
      {
        type: 'stripe',
        name: 'Stripe',
        description: 'Gateway de pagamentos',
        category: 'Pagamentos',
        icon: 'credit-card',
        documentation: 'https://stripe.com/docs'
      },
      {
        type: 'openai',
        name: 'OpenAI',
        description: 'Inteligência artificial GPT',
        category: 'IA',
        icon: 'brain',
        documentation: 'https://platform.openai.com/docs'
      },
      // Adicionar mais stacks conforme necessário
    ];
  }
}

export const stackConfigService = new StackConfigService();

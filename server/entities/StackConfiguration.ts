import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Tenant } from './Tenant';
import { User } from './User';
import * as crypto from 'crypto';

// Constants for Stack Types
export const STACK_TYPES = [
  'evolution_api',
  'n8n',
  'typebot',
  'mautic',
  'chatwoot',
  'minio',
  'redis',
  'postgresql',
  'grafana',
  'prometheus',
  'rabbitmq',
  'supabase',
  'stripe',
  'openai',
  'google_ai',
  'anthropic',
  'mailgun',
  'sendgrid',
  'twilio',
  'google_oauth',
  'github_oauth',
  'google_workspace',
  'meta_business',
  'instagram_api',
  'linkedin_api',
  'twitter_api',
  'cloudflare',
  'aws_s3',
  'custom_webhook'
] as const;

export type StackType = typeof STACK_TYPES[number];

export const STACK_STATUSES = ['not_configured', 'configured', 'active', 'error', 'testing'] as const;
export type StackStatus = typeof STACK_STATUSES[number];

// Explicit re-exports for compatibility
export { StackType, StackStatus };

export interface StackConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'email' | 'number' | 'boolean' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  description?: string;
  validation?: string;
  options?: { value: string; label: string }[];
  group?: string;
  sensitive?: boolean; // Para criptografar
}

export interface StackTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: Date;
  responseTime?: number;
}

@Entity('stack_configurations')
@Index(['tenantId', 'stackType'], { unique: true })
export class StackConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: STACK_TYPES
  })
  stackType: StackType;

  @Column()
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ nullable: true })
  configuredBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'configuredBy' })
  configuredByUser: User;

  @Column({
    type: 'enum',
    enum: STACK_STATUSES,
    default: 'not_configured'
  })
  status: StackStatus;

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  encryptedSecrets: string; // Dados sensíveis criptografados

  @Column({ type: 'jsonb', nullable: true })
  lastTestResult: StackTestResult;

  @Column({ type: 'timestamp', nullable: true })
  lastTestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Metadados específicos da stack

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string; // Anotações do usuário

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Chave de criptografia (deve vir de variável de ambiente)
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  @BeforeInsert()
  @BeforeUpdate()
  encryptSensitiveData() {
    if (this.configuration) {
      const { sensitive, ...publicConfig } = this.extractSensitiveData(this.configuration);
      
      this.configuration = publicConfig;
      
      if (Object.keys(sensitive).length > 0) {
        this.encryptedSecrets = this.encrypt(JSON.stringify(sensitive));
      }
    }
  }

  /**
   * Extrai dados sensíveis da configuração
   */
  private extractSensitiveData(config: Record<string, any>) {
    const sensitiveKeys = this.getSensitiveKeys();
    const sensitive: Record<string, any> = {};
    const publicConfig: Record<string, any> = {};

    Object.entries(config).forEach(([key, value]) => {
      if (sensitiveKeys.includes(key)) {
        sensitive[key] = value;
      } else {
        publicConfig[key] = value;
      }
    });

    return { sensitive, publicConfig };
  }

  /**
   * Obtém lista de chaves sensíveis por tipo de stack
   */
  private getSensitiveKeys(): string[] {
    const sensitiveKeysByStack: Record<StackType, string[]> = {
      evolution_api: ['apiKey', 'globalApiKey', 'webhookSecret'],
      n8n: ['apiKey', 'webhookSecret', 'basicAuthPassword'],
      typebot: ['apiKey', 'webhookSecret', 'encryptionKey'],
      mautic: ['apiKey', 'clientSecret', 'password'],
      chatwoot: ['apiKey', 'agentBotToken'],
      minio: ['accessKey', 'secretKey'],
      redis: ['password', 'authToken'],
      postgresql: ['password', 'connectionString'],
      grafana: ['apiKey', 'adminPassword'],
      prometheus: ['basicAuthPassword'],
      rabbitmq: ['password', 'managementPassword'],
      supabase: ['serviceKey', 'anonKey', 'jwtSecret'],
      stripe: ['secretKey', 'webhookSecret'],
      openai: ['apiKey', 'organizationId'],
      google_ai: ['apiKey', 'privateKey', 'clientSecret'],
      anthropic: ['apiKey'],
      mailgun: ['apiKey', 'webhookSigningKey'],
      sendgrid: ['apiKey'],
      twilio: ['authToken', 'apiSecret'],
      google_oauth: ['clientSecret'],
      github_oauth: ['clientSecret'],
      google_workspace: ['privateKey', 'clientSecret'],
      meta_business: ['accessToken', 'appSecret'],
      instagram_api: ['accessToken', 'clientSecret'],
      linkedin_api: ['clientSecret', 'accessToken'],
      twitter_api: ['apiSecret', 'bearerToken', 'accessToken', 'accessTokenSecret'],
      cloudflare: ['apiKey', 'apiToken'],
      aws_s3: ['secretAccessKey'],
      custom_webhook: ['secret', 'authToken', 'apiKey'],
    };

    return sensitiveKeysByStack[this.stackType] || [];
  }

  /**
   * Criptografar dados sensíveis
   */
  private encrypt(text: string): string {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.createHash('sha256').update(StackConfiguration.ENCRYPTION_KEY).digest();
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipher(algorithm, key);
      cipher.setAAD(Buffer.from(this.tenantId)); // Usar tenantId como dados adicionais
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Erro ao criptografar dados:', error);
      return '';
    }
  }

  /**
   * Descriptografar dados sensíveis
   */
  public decrypt(): Record<string, any> {
    if (!this.encryptedSecrets) {
      return {};
    }

    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.createHash('sha256').update(StackConfiguration.ENCRYPTION_KEY).digest();
      
      const parts = this.encryptedSecrets.split(':');
      if (parts.length !== 3) {
        throw new Error('Formato de dados criptografados inválido');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from(this.tenantId));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Erro ao descriptografar dados:', error);
      return {};
    }
  }

  /**
   * Obter configuração completa (pública + sensível)
   */
  public getFullConfiguration(): Record<string, any> {
    const publicConfig = this.configuration || {};
    const sensitiveConfig = this.decrypt();
    
    return { ...publicConfig, ...sensitiveConfig };
  }

  /**
   * Verificar se a stack está configurada corretamente
   */
  public isFullyConfigured(): boolean {
    const requiredFields = this.getRequiredFields();
    const fullConfig = this.getFullConfiguration();
    
    return requiredFields.every(field => 
      fullConfig[field.key] && 
      (typeof fullConfig[field.key] === 'string' ? fullConfig[field.key].trim() !== '' : true)
    );
  }

  /**
   * Obter campos obrigatórios por tipo de stack
   */
  public getRequiredFields(): StackConfigField[] {
    const fieldsByStack: Record<StackType, StackConfigField[]> = {
      evolution_api: [
        { key: 'baseUrl', label: 'URL da API', type: 'url', required: true, placeholder: 'https://api.meuboot.site' },
        { key: 'globalApiKey', label: 'Chave API Global', type: 'password', required: true, sensitive: true },
      ],
      n8n: [
        { key: 'baseUrl', label: 'URL do N8N', type: 'url', required: true, placeholder: 'https://n8n.meuboot.site' },
        { key: 'apiKey', label: 'Chave API', type: 'password', required: true, sensitive: true },
      ],
      typebot: [
        { key: 'builderUrl', label: 'URL do Builder', type: 'url', required: true, placeholder: 'https://typebot.meuboot.site' },
        { key: 'viewerUrl', label: 'URL do Viewer', type: 'url', required: true, placeholder: 'https://bot.meuboot.site' },
        { key: 'apiKey', label: 'Chave API', type: 'password', required: true, sensitive: true },
      ],
      mautic: [
        { key: 'baseUrl', label: 'URL do Mautic', type: 'url', required: true, placeholder: 'https://mautic.meuboot.site' },
        { key: 'username', label: 'Usuário', type: 'text', required: true },
        { key: 'password', label: 'Senha', type: 'password', required: true, sensitive: true },
      ],
      stripe: [
        { key: 'publishableKey', label: 'Chave Pública', type: 'text', required: true },
        { key: 'secretKey', label: 'Chave Secreta', type: 'password', required: true, sensitive: true },
        { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true, sensitive: true },
      ],
      openai: [
        { key: 'apiKey', label: 'Chave API OpenAI', type: 'password', required: true, sensitive: true },
        { key: 'organizationId', label: 'ID da Organização', type: 'text', required: false, sensitive: true },
      ],
      // ... Adicionar outros conforme necessário
    };

    return fieldsByStack[this.stackType] || [];
  }
}

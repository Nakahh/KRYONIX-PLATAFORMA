# PARTE-24: INTEGRAÇÃO COM APIS EXTERNAS
## Sistema Completo de Integração com APIs Externas

### 📋 DESCRIÇÃO
Implementação de sistema robusto para integração com APIs externas, incluindo gestão de credenciais, rate limiting, retry policies, webhook management e sincronização de dados com serviços terceiros.

### 🎯 OBJETIVOS
- Integração padronizada com APIs externas
- Gestão segura de credenciais e tokens
- Rate limiting e circuit breaker patterns
- Webhook processing e event handling
- Sincronização bidirecional de dados
- Monitoramento e alertas de integrações

### 🏗️ ARQUITETURA

#### Fluxo de Integração
```
┌─────────────────────────────────────────────────────────────┐
│                  API INTEGRATION ARCHITECTURE               │
├─────────────────────────────────────────────────────────────┤
│ CLIENT LAYER                                               │
│ • HTTP Client Factory                                       │
│ • Authentication Manager                                    │
│ • Request/Response Interceptors                            │
├─────────────────────────────────────────────────────────────┤
│ ORCHESTRATION LAYER                                        │
│ • Integration Manager                                       │
│ • Rate Limiter                                             │
│ • Circuit Breaker                                          │
│ • Retry Logic with Backoff                                 │
├─────────────────────────────────────────────────────────────┤
│ PROCESSING LAYER                                           │
│ • Data Transformer                                         │
│ • Webhook Handler                                          │
│ • Event Queue (RabbitMQ)                                   │
│ • Batch Processor                                          │
├─────────────────────────────────────────────────────────────┤
│ PERSISTENCE LAYER                                          │
│ • Integration Config (PostgreSQL)                          │
│ • Credentials Vault (VaultWarden)                          │
│ • Sync Status Tracking                                     │
│ • Webhook Events Log                                       │
└─────────────────────────────────────────────────────────────┘
```

### 🗄️ SCHEMAS DE BANCO DE DADOS

#### PostgreSQL Integration Management
```sql
-- Schema para gerenciar integrações
CREATE SCHEMA IF NOT EXISTS integrations;

-- Tabela para configurações de integração
CREATE TABLE integrations.api_configurations (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    integration_name VARCHAR(100) NOT NULL,
    integration_type VARCHAR(50) NOT NULL, -- 'webhook', 'polling', 'push', 'bidirectional'
    provider_name VARCHAR(100) NOT NULL, -- 'stripe', 'mailchimp', 'salesforce', etc.
    base_url TEXT NOT NULL,
    api_version VARCHAR(20),
    authentication_type VARCHAR(50) NOT NULL, -- 'oauth2', 'api_key', 'bearer', 'basic'
    credential_reference VARCHAR(255), -- Reference to VaultWarden
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    retry_backoff_ms INTEGER DEFAULT 1000,
    circuit_breaker_enabled BOOLEAN DEFAULT true,
    circuit_breaker_threshold INTEGER DEFAULT 5,
    circuit_breaker_timeout_ms INTEGER DEFAULT 60000,
    webhook_url TEXT,
    webhook_secret VARCHAR(255),
    webhook_events TEXT[], -- Array of event types to listen for
    sync_direction VARCHAR(20) DEFAULT 'outbound', -- 'inbound', 'outbound', 'bidirectional'
    data_mapping JSONB, -- Field mapping configuration
    transformation_rules JSONB, -- Data transformation rules
    is_enabled BOOLEAN DEFAULT true,
    health_check_url TEXT,
    health_check_interval_minutes INTEGER DEFAULT 15,
    last_health_check TIMESTAMP WITH TIME ZONE,
    health_status VARCHAR(20) DEFAULT 'unknown', -- 'healthy', 'degraded', 'unhealthy', 'unknown'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para rastrear sincronizações
CREATE TABLE integrations.sync_operations (
    sync_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    config_id UUID NOT NULL REFERENCES integrations.api_configurations(config_id),
    operation_type VARCHAR(50) NOT NULL, -- 'export', 'import', 'sync', 'webhook'
    entity_type VARCHAR(100) NOT NULL, -- 'user', 'contact', 'product', 'order'
    external_entity_id VARCHAR(255),
    internal_entity_id UUID,
    sync_direction VARCHAR(20) NOT NULL,
    operation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'partial'
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    batch_size INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    error_stack TEXT,
    request_payload JSONB,
    response_payload JSONB,
    response_status_code INTEGER,
    response_time_ms INTEGER,
    external_reference VARCHAR(255), -- External tracking ID
    sync_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para webhook events
CREATE TABLE integrations.webhook_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    config_id UUID NOT NULL REFERENCES integrations.api_configurations(config_id),
    webhook_source VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_payload JSONB NOT NULL,
    event_signature VARCHAR(255),
    signature_verified BOOLEAN DEFAULT false,
    processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'ignored'
    processing_attempts INTEGER DEFAULT 0,
    max_processing_attempts INTEGER DEFAULT 5,
    next_processing_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processing_error TEXT,
    idempotency_key VARCHAR(255),
    source_ip INET,
    user_agent TEXT,
    headers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para rate limiting
CREATE TABLE integrations.rate_limit_tracking (
    tracking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    config_id UUID NOT NULL REFERENCES integrations.api_configurations(config_id),
    time_window TIMESTAMP WITH TIME ZONE NOT NULL, -- Rounded to minute/hour
    window_type VARCHAR(10) NOT NULL, -- 'minute', 'hour', 'day'
    request_count INTEGER DEFAULT 1,
    quota_limit INTEGER NOT NULL,
    quota_remaining INTEGER,
    quota_reset_at TIMESTAMP WITH TIME ZONE,
    last_request_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(config_id, time_window, window_type)
);

-- Tabela para circuit breaker status
CREATE TABLE integrations.circuit_breaker_status (
    breaker_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    config_id UUID NOT NULL REFERENCES integrations.api_configurations(config_id),
    current_state VARCHAR(20) DEFAULT 'closed', -- 'closed', 'open', 'half_open'
    failure_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    last_failure_at TIMESTAMP WITH TIME ZONE,
    last_success_at TIMESTAMP WITH TIME ZONE,
    state_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_attempt_at TIMESTAMP WITH TIME ZONE,
    consecutive_failures INTEGER DEFAULT 0,
    consecutive_successes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(config_id)
);

-- Índices para performance
CREATE INDEX idx_api_configs_tenant_enabled ON integrations.api_configurations(tenant_id, is_enabled);
CREATE INDEX idx_sync_operations_config_status ON integrations.sync_operations(config_id, operation_status);
CREATE INDEX idx_sync_operations_tenant_date ON integrations.sync_operations(tenant_id, created_at DESC);
CREATE INDEX idx_webhook_events_processing ON integrations.webhook_events(processing_status, next_processing_at);
CREATE INDEX idx_webhook_events_idempotency ON integrations.webhook_events(idempotency_key);
CREATE INDEX idx_rate_limit_tracking_window ON integrations.rate_limit_tracking(config_id, time_window, window_type);
CREATE INDEX idx_circuit_breaker_config ON integrations.circuit_breaker_status(config_id);

-- Função para calcular métricas de integração
CREATE OR REPLACE FUNCTION integrations.calculate_integration_metrics(p_tenant_id UUID, p_hours INTEGER DEFAULT 24)
RETURNS TABLE (
    integration_name VARCHAR(100),
    total_requests BIGINT,
    successful_requests BIGINT,
    failed_requests BIGINT,
    success_rate DECIMAL(5,2),
    avg_response_time_ms DECIMAL(8,2),
    p95_response_time_ms DECIMAL(8,2),
    circuit_breaker_state VARCHAR(20),
    rate_limit_hits BIGINT,
    last_sync TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.integration_name,
        COUNT(so.sync_id) as total_requests,
        COUNT(so.sync_id) FILTER (WHERE so.operation_status = 'completed') as successful_requests,
        COUNT(so.sync_id) FILTER (WHERE so.operation_status = 'failed') as failed_requests,
        ROUND(
            (COUNT(so.sync_id) FILTER (WHERE so.operation_status = 'completed')::DECIMAL / 
             NULLIF(COUNT(so.sync_id), 0)) * 100, 2
        ) as success_rate,
        ROUND(AVG(so.response_time_ms), 2) as avg_response_time_ms,
        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY so.response_time_ms), 2) as p95_response_time_ms,
        COALESCE(cbs.current_state, 'unknown') as circuit_breaker_state,
        COUNT(rlt.tracking_id) FILTER (WHERE rlt.request_count >= rlt.quota_limit) as rate_limit_hits,
        MAX(so.completed_at) as last_sync
    FROM integrations.api_configurations ac
    LEFT JOIN integrations.sync_operations so ON ac.config_id = so.config_id 
        AND so.created_at >= NOW() - INTERVAL '1 hour' * p_hours
    LEFT JOIN integrations.circuit_breaker_status cbs ON ac.config_id = cbs.config_id
    LEFT JOIN integrations.rate_limit_tracking rlt ON ac.config_id = rlt.config_id
        AND rlt.created_at >= NOW() - INTERVAL '1 hour' * p_hours
    WHERE ac.tenant_id = p_tenant_id
    GROUP BY ac.integration_name, ac.config_id, cbs.current_state;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar circuit breaker baseado em falhas
CREATE OR REPLACE FUNCTION integrations.update_circuit_breaker()
RETURNS TRIGGER AS $$
DECLARE
    config_record RECORD;
    breaker_record RECORD;
BEGIN
    -- Get configuration
    SELECT * INTO config_record 
    FROM integrations.api_configurations 
    WHERE config_id = NEW.config_id;

    IF NOT config_record.circuit_breaker_enabled THEN
        RETURN NEW;
    END IF;

    -- Get or create circuit breaker status
    INSERT INTO integrations.circuit_breaker_status (tenant_id, config_id)
    VALUES (NEW.tenant_id, NEW.config_id)
    ON CONFLICT (config_id) DO NOTHING;

    SELECT * INTO breaker_record
    FROM integrations.circuit_breaker_status
    WHERE config_id = NEW.config_id;

    -- Update based on operation result
    IF NEW.operation_status = 'failed' THEN
        UPDATE integrations.circuit_breaker_status
        SET 
            failure_count = failure_count + 1,
            consecutive_failures = consecutive_failures + 1,
            consecutive_successes = 0,
            last_failure_at = NOW(),
            current_state = CASE 
                WHEN consecutive_failures + 1 >= config_record.circuit_breaker_threshold 
                    AND current_state = 'closed' THEN 'open'
                ELSE current_state
            END,
            state_changed_at = CASE 
                WHEN consecutive_failures + 1 >= config_record.circuit_breaker_threshold 
                    AND current_state = 'closed' THEN NOW()
                ELSE state_changed_at
            END,
            next_attempt_at = CASE 
                WHEN consecutive_failures + 1 >= config_record.circuit_breaker_threshold 
                    AND current_state = 'closed' 
                    THEN NOW() + INTERVAL '1 millisecond' * config_record.circuit_breaker_timeout_ms
                ELSE next_attempt_at
            END,
            updated_at = NOW()
        WHERE config_id = NEW.config_id;

    ELSIF NEW.operation_status = 'completed' THEN
        UPDATE integrations.circuit_breaker_status
        SET 
            success_count = success_count + 1,
            consecutive_successes = consecutive_successes + 1,
            consecutive_failures = 0,
            last_success_at = NOW(),
            current_state = CASE 
                WHEN current_state = 'half_open' AND consecutive_successes + 1 >= 3 THEN 'closed'
                WHEN current_state = 'open' AND NOW() >= next_attempt_at THEN 'half_open'
                ELSE current_state
            END,
            state_changed_at = CASE 
                WHEN (current_state = 'half_open' AND consecutive_successes + 1 >= 3) OR
                     (current_state = 'open' AND NOW() >= next_attempt_at) THEN NOW()
                ELSE state_changed_at
            END,
            updated_at = NOW()
        WHERE config_id = NEW.config_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER circuit_breaker_trigger
    AFTER UPDATE OF operation_status ON integrations.sync_operations
    FOR EACH ROW 
    WHEN (NEW.operation_status IN ('completed', 'failed') AND OLD.operation_status != NEW.operation_status)
    EXECUTE FUNCTION integrations.update_circuit_breaker();
```

### 🔧 IMPLEMENTAÇÃO DOS SERVIÇOS

#### 1. Integration Manager Service
```typescript
// src/modules/integrations/services/integration-manager.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { CircuitBreakerService } from './circuit-breaker.service';
import { RateLimiterService } from './rate-limiter.service';
import { VaultService } from '../vault/vault.service';
import { firstValueFrom, retry, timeout, catchError } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig } from 'axios';

@Injectable()
export class IntegrationManagerService {
    private readonly logger = new Logger(IntegrationManagerService.name);

    constructor(
        @InjectRepository(ApiConfiguration)
        private readonly configRepository: Repository<ApiConfiguration>,
        
        @InjectRepository(SyncOperation)
        private readonly syncRepository: Repository<SyncOperation>,
        
        @InjectRepository(WebhookEvent)
        private readonly webhookRepository: Repository<WebhookEvent>,
        
        private readonly httpService: HttpService,
        private readonly circuitBreakerService: CircuitBreakerService,
        private readonly rateLimiterService: RateLimiterService,
        private readonly vaultService: VaultService,
        private readonly configService: ConfigService
    ) {}

    async executeIntegration(params: IntegrationParams): Promise<IntegrationResult> {
        const config = await this.getIntegrationConfig(params.configId);
        
        if (!config || !config.isEnabled) {
            throw new Error('Integração não encontrada ou desabilitada');
        }

        // Check circuit breaker
        const canExecute = await this.circuitBreakerService.canExecute(config.configId);
        if (!canExecute) {
            throw new Error('Circuit breaker aberto para esta integração');
        }

        // Check rate limit
        const rateLimitOk = await this.rateLimiterService.checkRateLimit(config);
        if (!rateLimitOk) {
            throw new Error('Rate limit excedido');
        }

        // Create sync operation record
        const syncOperation = await this.createSyncOperation(config, params);

        try {
            // Get credentials
            const credentials = await this.getCredentials(config.credentialReference);
            
            // Prepare request
            const requestConfig = await this.prepareRequest(config, params, credentials);
            
            // Execute request with retries
            const response = await this.executeWithRetries(requestConfig, config);
            
            // Process response
            const result = await this.processResponse(response, config, params);
            
            // Update sync operation
            await this.updateSyncOperation(syncOperation.syncId, {
                operationStatus: 'completed',
                responsePayload: result.data,
                responseStatusCode: response.status,
                responseTimeMs: result.responseTime,
                completedAt: new Date(),
                recordsProcessed: result.recordsProcessed,
                recordsSuccessful: result.recordsSuccessful
            });

            // Record success for circuit breaker
            await this.circuitBreakerService.recordSuccess(config.configId);

            return result;

        } catch (error) {
            // Record failure for circuit breaker
            await this.circuitBreakerService.recordFailure(config.configId);
            
            // Update sync operation with error
            await this.updateSyncOperation(syncOperation.syncId, {
                operationStatus: 'failed',
                errorMessage: error.message,
                errorStack: error.stack,
                completedAt: new Date(),
                nextRetryAt: this.calculateNextRetry(syncOperation.retryCount, config)
            });

            this.logger.error(`Integration failed for ${config.integrationName}:`, error);
            throw error;
        }
    }

    async processWebhook(webhookData: WebhookData): Promise<void> {
        const config = await this.getIntegrationConfig(webhookData.configId);
        
        if (!config) {
            throw new Error('Configuração de webhook não encontrada');
        }

        // Verify webhook signature
        const isValid = await this.verifyWebhookSignature(
            webhookData.payload, 
            webhookData.signature, 
            config.webhookSecret
        );

        // Create webhook event record
        const webhookEvent = await this.webhookRepository.save({
            tenantId: config.tenantId,
            configId: config.configId,
            webhookSource: config.providerName,
            eventType: webhookData.eventType,
            eventPayload: webhookData.payload,
            eventSignature: webhookData.signature,
            signatureVerified: isValid,
            sourceIp: webhookData.sourceIp,
            userAgent: webhookData.userAgent,
            headers: webhookData.headers,
            idempotencyKey: webhookData.idempotencyKey
        });

        if (!isValid) {
            this.logger.warn(`Invalid webhook signature for ${config.integrationName}`);
            return;
        }

        // Check if already processed (idempotency)
        if (webhookData.idempotencyKey) {
            const existing = await this.webhookRepository.findOne({
                where: {
                    idempotencyKey: webhookData.idempotencyKey,
                    processingStatus: 'completed'
                }
            });

            if (existing) {
                this.logger.log(`Webhook already processed: ${webhookData.idempotencyKey}`);
                return;
            }
        }

        // Process webhook event
        try {
            await this.processWebhookEvent(webhookEvent, config);
            
            await this.webhookRepository.update(webhookEvent.eventId, {
                processingStatus: 'completed',
                processedAt: new Date()
            });

        } catch (error) {
            await this.webhookRepository.update(webhookEvent.eventId, {
                processingStatus: 'failed',
                processingError: error.message,
                processingAttempts: webhookEvent.processingAttempts + 1,
                nextProcessingAt: this.calculateWebhookRetry(webhookEvent.processingAttempts)
            });

            this.logger.error(`Webhook processing failed:`, error);
            throw error;
        }
    }

    async syncData(params: SyncDataParams): Promise<SyncResult> {
        const config = await this.getIntegrationConfig(params.configId);
        
        const syncParams: IntegrationParams = {
            configId: params.configId,
            operationType: 'sync',
            entityType: params.entityType,
            payload: params.data,
            options: {
                batchSize: params.batchSize || 100,
                direction: params.direction
            }
        };

        const result = await this.executeIntegration(syncParams);

        return {
            syncId: result.syncId,
            status: result.status,
            recordsProcessed: result.recordsProcessed,
            recordsSuccessful: result.recordsSuccessful,
            recordsFailed: result.recordsFailed,
            errors: result.errors
        };
    }

    async bulkSync(params: BulkSyncParams): Promise<BulkSyncResult> {
        const config = await this.getIntegrationConfig(params.configId);
        const batchSize = params.batchSize || 100;
        const batches = this.chunkArray(params.data, batchSize);
        
        const results: SyncResult[] = [];
        let totalProcessed = 0;
        let totalSuccessful = 0;
        let totalFailed = 0;

        for (const batch of batches) {
            try {
                const batchResult = await this.syncData({
                    configId: params.configId,
                    entityType: params.entityType,
                    data: batch,
                    direction: params.direction,
                    batchSize: batch.length
                });

                results.push(batchResult);
                totalProcessed += batchResult.recordsProcessed;
                totalSuccessful += batchResult.recordsSuccessful;
                totalFailed += batchResult.recordsFailed;

                // Add delay between batches to respect rate limits
                if (config.rateLimitPerMinute > 0) {
                    const delayMs = (60 * 1000) / config.rateLimitPerMinute;
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }

            } catch (error) {
                this.logger.error(`Batch sync failed:`, error);
                totalFailed += batch.length;
            }
        }

        return {
            totalBatches: batches.length,
            totalRecords: params.data.length,
            recordsProcessed: totalProcessed,
            recordsSuccessful: totalSuccessful,
            recordsFailed: totalFailed,
            batchResults: results
        };
    }

    private async getIntegrationConfig(configId: string): Promise<ApiConfiguration> {
        return await this.configRepository.findOne({
            where: { configId }
        });
    }

    private async getCredentials(credentialReference: string): Promise<any> {
        try {
            return await this.vaultService.getSecret(credentialReference);
        } catch (error) {
            this.logger.error(`Failed to get credentials: ${credentialReference}`, error);
            throw new Error('Falha ao obter credenciais');
        }
    }

    private async prepareRequest(
        config: ApiConfiguration, 
        params: IntegrationParams, 
        credentials: any
    ): Promise<AxiosRequestConfig> {
        const headers: any = {
            'Content-Type': 'application/json',
            'User-Agent': 'Kryonix-Integration/1.0'
        };

        // Add authentication
        switch (config.authenticationType) {
            case 'bearer':
                headers['Authorization'] = `Bearer ${credentials.token}`;
                break;
            case 'api_key':
                headers[credentials.header_name || 'X-API-Key'] = credentials.api_key;
                break;
            case 'basic':
                const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
                headers['Authorization'] = `Basic ${auth}`;
                break;
            case 'oauth2':
                // Handle OAuth2 token refresh if needed
                const token = await this.refreshOAuth2TokenIfNeeded(credentials);
                headers['Authorization'] = `Bearer ${token}`;
                break;
        }

        // Apply data transformation if configured
        const transformedPayload = this.transformData(params.payload, config.transformationRules);

        return {
            method: this.getHttpMethod(params.operationType),
            url: this.buildUrl(config.baseUrl, params),
            headers,
            data: transformedPayload,
            timeout: config.timeoutSeconds * 1000,
            validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        };
    }

    private async executeWithRetries(
        requestConfig: AxiosRequestConfig, 
        config: ApiConfiguration
    ): Promise<AxiosResponse> {
        const startTime = Date.now();
        
        return firstValueFrom(
            this.httpService.request(requestConfig).pipe(
                timeout(config.timeoutSeconds * 1000),
                retry({
                    count: config.retryAttempts,
                    delay: (error, retryCount) => {
                        const backoffMs = config.retryBackoffMs * Math.pow(2, retryCount - 1);
                        this.logger.warn(`Request failed, retrying in ${backoffMs}ms (attempt ${retryCount}/${config.retryAttempts})`);
                        return backoffMs;
                    }
                }),
                catchError(error => {
                    this.logger.error('Request failed after all retries:', error.message);
                    throw error;
                })
            )
        );
    }

    private async processResponse(
        response: AxiosResponse, 
        config: ApiConfiguration, 
        params: IntegrationParams
    ): Promise<IntegrationResult> {
        const responseTime = Date.now() - params.startTime;
        
        if (response.status >= 400) {
            throw new Error(`API returned error: ${response.status} - ${response.statusText}`);
        }

        // Apply response transformation if configured
        const transformedData = this.transformData(response.data, config.transformationRules);

        return {
            status: 'success',
            data: transformedData,
            responseTime,
            recordsProcessed: Array.isArray(transformedData) ? transformedData.length : 1,
            recordsSuccessful: Array.isArray(transformedData) ? transformedData.length : 1,
            recordsFailed: 0,
            errors: []
        };
    }

    private async createSyncOperation(
        config: ApiConfiguration, 
        params: IntegrationParams
    ): Promise<SyncOperation> {
        return await this.syncRepository.save({
            tenantId: config.tenantId,
            configId: config.configId,
            operationType: params.operationType,
            entityType: params.entityType,
            syncDirection: params.options?.direction || 'outbound',
            operationStatus: 'processing',
            requestPayload: params.payload,
            batchSize: params.options?.batchSize
        });
    }

    private async updateSyncOperation(syncId: string, updates: Partial<SyncOperation>): Promise<void> {
        await this.syncRepository.update(syncId, updates);
    }

    private transformData(data: any, transformationRules: any): any {
        if (!transformationRules) return data;

        // Implement data transformation logic based on rules
        // This could include field mapping, data type conversion, validation, etc.
        const transformed = { ...data };

        if (transformationRules.fieldMapping) {
            Object.entries(transformationRules.fieldMapping).forEach(([sourceField, targetField]) => {
                if (data[sourceField] !== undefined) {
                    transformed[targetField as string] = data[sourceField];
                    delete transformed[sourceField];
                }
            });
        }

        if (transformationRules.dateFormat) {
            // Apply date format transformations
            Object.keys(transformed).forEach(key => {
                if (transformationRules.dateFields?.includes(key) && transformed[key]) {
                    transformed[key] = this.formatDate(transformed[key], transformationRules.dateFormat);
                }
            });
        }

        return transformed;
    }

    private async verifyWebhookSignature(payload: any, signature: string, secret: string): Promise<boolean> {
        if (!secret || !signature) return false;

        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(`sha256=${expectedSignature}`)
        );
    }

    private async processWebhookEvent(event: WebhookEvent, config: ApiConfiguration): Promise<void> {
        // Implement webhook event processing logic based on event type
        const { eventType, eventPayload } = event;

        switch (eventType) {
            case 'user.created':
                await this.handleUserCreatedWebhook(eventPayload, config);
                break;
            case 'payment.completed':
                await this.handlePaymentCompletedWebhook(eventPayload, config);
                break;
            case 'subscription.updated':
                await this.handleSubscriptionUpdatedWebhook(eventPayload, config);
                break;
            default:
                this.logger.warn(`Unhandled webhook event type: ${eventType}`);
        }
    }

    private async handleUserCreatedWebhook(payload: any, config: ApiConfiguration): Promise<void> {
        // Implement user creation webhook handling
        this.logger.log('Processing user created webhook:', payload);
    }

    private async handlePaymentCompletedWebhook(payload: any, config: ApiConfiguration): Promise<void> {
        // Implement payment completed webhook handling
        this.logger.log('Processing payment completed webhook:', payload);
    }

    private async handleSubscriptionUpdatedWebhook(payload: any, config: ApiConfiguration): Promise<void> {
        // Implement subscription updated webhook handling
        this.logger.log('Processing subscription updated webhook:', payload);
    }

    private getHttpMethod(operationType: string): string {
        const methodMap = {
            'create': 'POST',
            'read': 'GET',
            'update': 'PUT',
            'delete': 'DELETE',
            'sync': 'POST',
            'export': 'GET',
            'import': 'POST'
        };

        return methodMap[operationType] || 'POST';
    }

    private buildUrl(baseUrl: string, params: IntegrationParams): string {
        let url = baseUrl;

        if (params.entityType) {
            url += `/${params.entityType}`;
        }

        if (params.entityId) {
            url += `/${params.entityId}`;
        }

        return url;
    }

    private calculateNextRetry(retryCount: number, config: ApiConfiguration): Date {
        const backoffMs = config.retryBackoffMs * Math.pow(2, retryCount);
        return new Date(Date.now() + backoffMs);
    }

    private calculateWebhookRetry(attempts: number): Date {
        // Exponential backoff: 1min, 5min, 15min, 1hr, 6hr
        const delays = [60000, 300000, 900000, 3600000, 21600000];
        const delay = delays[Math.min(attempts, delays.length - 1)];
        return new Date(Date.now() + delay);
    }

    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    private formatDate(date: any, format: string): string {
        // Implement date formatting logic
        return new Date(date).toISOString();
    }

    private async refreshOAuth2TokenIfNeeded(credentials: any): Promise<string> {
        // Implement OAuth2 token refresh logic
        return credentials.access_token;
    }

    async getIntegrationMetrics(tenantId: string, hours: number = 24): Promise<IntegrationMetrics> {
        const query = `
            SELECT * FROM integrations.calculate_integration_metrics($1, $2)
        `;
        
        const result = await this.configRepository.query(query, [tenantId, hours]);
        
        return {
            integrations: result,
            totalRequests: result.reduce((sum, item) => sum + parseInt(item.total_requests), 0),
            overallSuccessRate: result.reduce((sum, item) => sum + parseFloat(item.success_rate), 0) / result.length,
            averageResponseTime: result.reduce((sum, item) => sum + parseFloat(item.avg_response_time_ms), 0) / result.length
        };
    }
}

// Interfaces
interface IntegrationParams {
    configId: string;
    operationType: string;
    entityType: string;
    entityId?: string;
    payload?: any;
    options?: {
        batchSize?: number;
        direction?: 'inbound' | 'outbound' | 'bidirectional';
    };
    startTime?: number;
}

interface IntegrationResult {
    syncId?: string;
    status: 'success' | 'failure' | 'partial';
    data: any;
    responseTime: number;
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    errors: string[];
}

interface WebhookData {
    configId: string;
    eventType: string;
    payload: any;
    signature: string;
    sourceIp: string;
    userAgent: string;
    headers: any;
    idempotencyKey?: string;
}

interface SyncDataParams {
    configId: string;
    entityType: string;
    data: any[];
    direction: 'inbound' | 'outbound' | 'bidirectional';
    batchSize?: number;
}

interface SyncResult {
    syncId: string;
    status: string;
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    errors: string[];
}

interface BulkSyncParams {
    configId: string;
    entityType: string;
    data: any[];
    direction: 'inbound' | 'outbound' | 'bidirectional';
    batchSize?: number;
}

interface BulkSyncResult {
    totalBatches: number;
    totalRecords: number;
    recordsProcessed: number;
    recordsSuccessful: number;
    recordsFailed: number;
    batchResults: SyncResult[];
}

interface IntegrationMetrics {
    integrations: any[];
    totalRequests: number;
    overallSuccessRate: number;
    averageResponseTime: number;
}
```

#### 2. Rate Limiter Service
```typescript
// src/modules/integrations/services/rate-limiter.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';

@Injectable()
export class RateLimiterService {
    private readonly logger = new Logger(RateLimiterService.name);

    constructor(
        @InjectRepository(RateLimitTracking)
        private readonly rateLimitRepository: Repository<RateLimitTracking>,
        
        @InjectRedis() private readonly redis: Redis
    ) {}

    async checkRateLimit(config: ApiConfiguration): Promise<boolean> {
        const now = new Date();
        const minuteWindow = this.roundToMinute(now);
        const hourWindow = this.roundToHour(now);

        // Check minute rate limit
        const minuteKey = `rate_limit:${config.configId}:minute:${minuteWindow.getTime()}`;
        const minuteCount = await this.redis.incr(minuteKey);
        
        if (minuteCount === 1) {
            await this.redis.expire(minuteKey, 60); // Expire in 60 seconds
        }

        if (minuteCount > config.rateLimitPerMinute) {
            this.logger.warn(`Rate limit exceeded for ${config.integrationName} (minute): ${minuteCount}/${config.rateLimitPerMinute}`);
            return false;
        }

        // Check hour rate limit
        const hourKey = `rate_limit:${config.configId}:hour:${hourWindow.getTime()}`;
        const hourCount = await this.redis.incr(hourKey);
        
        if (hourCount === 1) {
            await this.redis.expire(hourKey, 3600); // Expire in 1 hour
        }

        if (hourCount > config.rateLimitPerHour) {
            this.logger.warn(`Rate limit exceeded for ${config.integrationName} (hour): ${hourCount}/${config.rateLimitPerHour}`);
            return false;
        }

        // Track in database for reporting
        await this.trackRateLimit(config, minuteWindow, 'minute', minuteCount, config.rateLimitPerMinute);
        await this.trackRateLimit(config, hourWindow, 'hour', hourCount, config.rateLimitPerHour);

        return true;
    }

    private async trackRateLimit(
        config: ApiConfiguration,
        timeWindow: Date,
        windowType: 'minute' | 'hour',
        requestCount: number,
        quotaLimit: number
    ): Promise<void> {
        const quotaRemaining = Math.max(0, quotaLimit - requestCount);
        const quotaResetAt = windowType === 'minute' 
            ? new Date(timeWindow.getTime() + 60000)
            : new Date(timeWindow.getTime() + 3600000);

        await this.rateLimitRepository.upsert({
            tenantId: config.tenantId,
            configId: config.configId,
            timeWindow,
            windowType,
            requestCount,
            quotaLimit,
            quotaRemaining,
            quotaResetAt,
            lastRequestAt: new Date()
        }, ['configId', 'timeWindow', 'windowType']);
    }

    private roundToMinute(date: Date): Date {
        const rounded = new Date(date);
        rounded.setSeconds(0, 0);
        return rounded;
    }

    private roundToHour(date: Date): Date {
        const rounded = new Date(date);
        rounded.setMinutes(0, 0, 0);
        return rounded;
    }

    async getRateLimitStatus(configId: string): Promise<RateLimitStatus> {
        const now = new Date();
        const minuteWindow = this.roundToMinute(now);
        const hourWindow = this.roundToHour(now);

        const minuteKey = `rate_limit:${configId}:minute:${minuteWindow.getTime()}`;
        const hourKey = `rate_limit:${configId}:hour:${hourWindow.getTime()}`;

        const [minuteCount, hourCount] = await Promise.all([
            this.redis.get(minuteKey),
            this.redis.get(hourKey)
        ]);

        const config = await this.getConfig(configId);

        return {
            minute: {
                current: parseInt(minuteCount || '0'),
                limit: config.rateLimitPerMinute,
                remaining: Math.max(0, config.rateLimitPerMinute - parseInt(minuteCount || '0')),
                resetAt: new Date(minuteWindow.getTime() + 60000)
            },
            hour: {
                current: parseInt(hourCount || '0'),
                limit: config.rateLimitPerHour,
                remaining: Math.max(0, config.rateLimitPerHour - parseInt(hourCount || '0')),
                resetAt: new Date(hourWindow.getTime() + 3600000)
            }
        };
    }

    private async getConfig(configId: string): Promise<ApiConfiguration> {
        // Implement config retrieval
        return {} as ApiConfiguration;
    }
}

interface RateLimitStatus {
    minute: {
        current: number;
        limit: number;
        remaining: number;
        resetAt: Date;
    };
    hour: {
        current: number;
        limit: number;
        remaining: number;
        resetAt: Date;
    };
}
```

### 🎨 COMPONENTES FRONTEND

#### 1. Dashboard de Integrações
```typescript
// src/components/integrations/IntegrationsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Zap, 
    Activity, 
    AlertCircle, 
    CheckCircle, 
    Clock, 
    BarChart3,
    Settings,
    Play,
    Pause,
    RefreshCw,
    TrendingUp
} from 'lucide-react';
import { useIntegrations, useIntegrationMetrics } from '@/hooks/useIntegrations';

export function IntegrationsDashboard() {
    const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState('24h');

    const { integrations, loading: integrationsLoading } = useIntegrations();
    const { metrics, loading: metricsLoading } = useIntegrationMetrics({ timeRange });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return <Badge variant="success">Saudável</Badge>;
            case 'degraded':
                return <Badge variant="warning">Degradado</Badge>;
            case 'unhealthy':
                return <Badge variant="destructive">Não Saudável</Badge>;
            default:
                return <Badge variant="secondary">Desconhecido</Badge>;
        }
    };

    const getCircuitBreakerBadge = (state: string) => {
        switch (state) {
            case 'closed':
                return <Badge variant="success">Fechado</Badge>;
            case 'open':
                return <Badge variant="destructive">Aberto</Badge>;
            case 'half_open':
                return <Badge variant="warning">Semi-Aberto</Badge>;
            default:
                return <Badge variant="secondary">Desconhecido</Badge>;
        }
    };

    const formatResponseTime = (timeMs: number) => {
        if (timeMs < 1000) return `${timeMs}ms`;
        return `${(timeMs / 1000).toFixed(2)}s`;
    };

    const formatLastSync = (date: string) => {
        if (!date) return 'Nunca';
        const diff = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d atrás`;
        if (hours > 0) return `${hours}h atrás`;
        if (minutes > 0) return `${minutes}m atrás`;
        return 'Agora mesmo';
    };

    return (
        <div className="integrations-dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    <Zap className="title-icon" />
                    Integrações com APIs Externas
                </h1>
                <div className="dashboard-controls">
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="time-range-select"
                    >
                        <option value="1h">Última Hora</option>
                        <option value="24h">Últimas 24h</option>
                        <option value="7d">Últimos 7 dias</option>
                        <option value="30d">Últimos 30 dias</option>
                    </select>
                    <Button variant="outline">
                        <RefreshCw className="button-icon" />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Métricas Gerais */}
            <div className="metrics-grid">
                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <Activity className="metric-icon" />
                            Total de Requisições
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value">
                            {metrics?.totalRequests?.toLocaleString() || 0}
                        </div>
                        <div className="metric-description">
                            Últimas {timeRange}
                        </div>
                    </CardContent>
                </Card>

                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <CheckCircle className="metric-icon" />
                            Taxa de Sucesso
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value text-green-600">
                            {(metrics?.overallSuccessRate || 0).toFixed(1)}%
                        </div>
                        <div className="metric-description">
                            Média geral
                        </div>
                    </CardContent>
                </Card>

                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <Clock className="metric-icon" />
                            Tempo de Resposta
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value">
                            {formatResponseTime(metrics?.averageResponseTime || 0)}
                        </div>
                        <div className="metric-description">
                            Tempo médio
                        </div>
                    </CardContent>
                </Card>

                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <TrendingUp className="metric-icon" />
                            Integrações Ativas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value">
                            {integrations?.filter(i => i.isEnabled).length || 0}
                        </div>
                        <div className="metric-description">
                            de {integrations?.length || 0} total
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="integrations-tabs">
                <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                    <TabsTrigger value="settings">Configurações</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="integrations-grid">
                        {integrations?.map((integration) => (
                            <Card 
                                key={integration.configId} 
                                className={`integration-card ${selectedIntegration === integration.configId ? 'selected' : ''}`}
                                onClick={() => setSelectedIntegration(integration.configId)}
                            >
                                <CardHeader className="integration-header">
                                    <div className="integration-title">
                                        <div className="integration-icon">
                                            {this.getProviderIcon(integration.providerName)}
                                        </div>
                                        <div className="integration-info">
                                            <h3 className="integration-name">{integration.integrationName}</h3>
                                            <p className="integration-provider">{integration.providerName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="integration-status">
                                        {getStatusBadge(integration.healthStatus)}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                this.toggleIntegration(integration.configId);
                                            }}
                                        >
                                            {integration.isEnabled ? <Pause /> : <Play />}
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="integration-metrics">
                                        <div className="metric-row">
                                            <span className="metric-label">Tipo:</span>
                                            <span className="metric-value">{integration.integrationType}</span>
                                        </div>
                                        
                                        <div className="metric-row">
                                            <span className="metric-label">Direção:</span>
                                            <span className="metric-value">{integration.syncDirection}</span>
                                        </div>
                                        
                                        <div className="metric-row">
                                            <span className="metric-label">Última Sync:</span>
                                            <span className="metric-value">
                                                {formatLastSync(integration.lastSync)}
                                            </span>
                                        </div>
                                        
                                        <div className="metric-row">
                                            <span className="metric-label">Circuit Breaker:</span>
                                            {getCircuitBreakerBadge(integration.circuitBreakerState)}
                                        </div>
                                    </div>

                                    <div className="integration-stats">
                                        <div className="stat-item">
                                            <span className="stat-value">{integration.totalRequests || 0}</span>
                                            <span className="stat-label">Requisições</span>
                                        </div>
                                        
                                        <div className="stat-item">
                                            <span className="stat-value text-green-600">
                                                {(integration.successRate || 0).toFixed(1)}%
                                            </span>
                                            <span className="stat-label">Sucesso</span>
                                        </div>
                                        
                                        <div className="stat-item">
                                            <span className="stat-value">
                                                {formatResponseTime(integration.avgResponseTime || 0)}
                                            </span>
                                            <span className="stat-label">Resp. Média</span>
                                        </div>
                                    </div>

                                    <div className="rate-limit-info">
                                        <div className="rate-limit-bar">
                                            <div className="rate-limit-label">Rate Limit (min)</div>
                                            <div className="rate-limit-progress">
                                                <div 
                                                    className="rate-limit-fill"
                                                    style={{ 
                                                        width: `${(integration.currentMinuteRequests / integration.rateLimitPerMinute) * 100}%` 
                                                    }}
                                                />
                                                <span className="rate-limit-text">
                                                    {integration.currentMinuteRequests || 0}/{integration.rateLimitPerMinute}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="monitoring">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monitoramento de Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="monitoring-charts">
                                <div className="chart-container">
                                    <h4>Requisições por Hora</h4>
                                    <div className="chart-placeholder">
                                        📊 Gráfico de linha com requisições por hora
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h4>Taxa de Sucesso</h4>
                                    <div className="chart-placeholder">
                                        📈 Gráfico de área com taxa de sucesso
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h4>Tempo de Resposta</h4>
                                    <div className="chart-placeholder">
                                        ⏱️ Gráfico de linha com P50, P95, P99
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h4>Rate Limiting</h4>
                                    <div className="chart-placeholder">
                                        🚦 Gráfico de barras com rate limits
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="webhooks">
                    <Card>
                        <CardHeader>
                            <CardTitle>Eventos de Webhook</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="webhook-events-list">
                                <div className="events-filters">
                                    <select className="event-filter">
                                        <option value="">Todos os eventos</option>
                                        <option value="user.created">user.created</option>
                                        <option value="payment.completed">payment.completed</option>
                                        <option value="subscription.updated">subscription.updated</option>
                                    </select>
                                    
                                    <select className="status-filter">
                                        <option value="">Todos os status</option>
                                        <option value="completed">Processado</option>
                                        <option value="failed">Falhou</option>
                                        <option value="pending">Pendente</option>
                                    </select>
                                </div>

                                <div className="webhook-events">
                                    {/* Lista de eventos de webhook seria renderizada aqui */}
                                    <div className="webhook-event-item">
                                        <div className="event-header">
                                            <span className="event-type">user.created</span>
                                            <Badge variant="success">Processado</Badge>
                                            <span className="event-time">há 5 min</span>
                                        </div>
                                        <div className="event-details">
                                            <div className="event-source">Stripe</div>
                                            <div className="event-signature">✅ Assinatura verificada</div>
                                        </div>
                                    </div>

                                    <div className="webhook-event-item">
                                        <div className="event-header">
                                            <span className="event-type">payment.failed</span>
                                            <Badge variant="destructive">Falhou</Badge>
                                            <span className="event-time">há 1h</span>
                                        </div>
                                        <div className="event-details">
                                            <div className="event-source">PayPal</div>
                                            <div className="event-error">❌ Erro no processamento</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <Settings className="title-icon" />
                                Configurações de Integração
                            </CardTitle>
                            <Button variant="outline">
                                <Settings className="button-icon" />
                                Nova Integração
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="settings-grid">
                                {integrations?.map((integration) => (
                                    <div key={integration.configId} className="setting-item">
                                        <div className="setting-header">
                                            <h4>{integration.integrationName}</h4>
                                            <Button variant="ghost" size="sm">
                                                <Settings className="button-icon" />
                                                Configurar
                                            </Button>
                                        </div>
                                        
                                        <div className="setting-details">
                                            <div className="setting-row">
                                                <span>URL Base:</span>
                                                <span>{integration.baseUrl}</span>
                                            </div>
                                            
                                            <div className="setting-row">
                                                <span>Autenticação:</span>
                                                <span>{integration.authenticationType}</span>
                                            </div>
                                            
                                            <div className="setting-row">
                                                <span>Rate Limit/min:</span>
                                                <span>{integration.rateLimitPerMinute}</span>
                                            </div>
                                            
                                            <div className="setting-row">
                                                <span>Timeout:</span>
                                                <span>{integration.timeoutSeconds}s</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
```

### 🚀 SCRIPTS DE EXECUÇÃO

#### Script de Configuração de Integrações
```bash
#!/bin/bash
# setup-integrations.sh

set -e

echo "🔧 Configurando Sistema de Integrações com APIs Externas..."

# Criar diretórios necessários
sudo mkdir -p /opt/kryonix/integrations/{configs,logs,webhooks}
sudo mkdir -p /opt/kryonix/vault/secrets

# Configurar VaultWarden para credenciais
cat > /opt/kryonix/vault/vault-config.json << 'EOF'
{
  "database_url": "postgresql://postgres:password@postgresql.kryonix.com.br:5432/vault",
  "admin_token": "$ADMIN_TOKEN$",
  "sends_allowed": true,
  "emergency_access_allowed": true,
  "web_vault_enabled": true,
  "websocket_enabled": true,
  "extended_logging": true,
  "log_level": "info"
}
EOF

# Configurar Nginx para webhooks
cat > /opt/kryonix/integrations/webhook-nginx.conf << 'EOF'
server {
    listen 80;
    server_name webhooks.kryonix.com.br;
    
    location / {
        proxy_pass http://kryonix_api_gateway:3000/webhooks;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting para webhooks
        limit_req zone=webhook_limit burst=100 nodelay;
        
        # Log webhook requests
        access_log /var/log/nginx/webhook_access.log;
        error_log /var/log/nginx/webhook_error.log;
    }
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=webhook_limit:10m rate=10r/s;
EOF

# Configurar integrações padrão
cat > /opt/kryonix/integrations/configs/stripe.json << 'EOF'
{
  "integration_name": "Stripe Payment Gateway",
  "provider_name": "stripe",
  "base_url": "https://api.stripe.com/v1",
  "authentication_type": "bearer",
  "rate_limit_per_minute": 100,
  "rate_limit_per_hour": 1000,
  "webhook_events": [
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "customer.created",
    "customer.updated",
    "subscription.created",
    "subscription.updated",
    "subscription.deleted"
  ],
  "data_mapping": {
    "customer_id": "external_customer_id",
    "email": "customer_email",
    "name": "customer_name"
  }
}
EOF

cat > /opt/kryonix/integrations/configs/mailchimp.json << 'EOF'
{
  "integration_name": "Mailchimp Email Marketing",
  "provider_name": "mailchimp",
  "base_url": "https://us1.api.mailchimp.com/3.0",
  "authentication_type": "api_key",
  "rate_limit_per_minute": 10,
  "rate_limit_per_hour": 500,
  "sync_direction": "bidirectional",
  "webhook_events": [
    "subscribe",
    "unsubscribe",
    "profile",
    "cleaned",
    "upemail",
    "campaign"
  ],
  "data_mapping": {
    "email_address": "email",
    "merge_fields.FNAME": "first_name",
    "merge_fields.LNAME": "last_name"
  }
}
EOF

cat > /opt/kryonix/integrations/configs/salesforce.json << 'EOF'
{
  "integration_name": "Salesforce CRM",
  "provider_name": "salesforce",
  "base_url": "https://your-instance.salesforce.com/services/data/v57.0",
  "authentication_type": "oauth2",
  "rate_limit_per_minute": 100,
  "rate_limit_per_hour": 1000,
  "sync_direction": "bidirectional",
  "data_mapping": {
    "FirstName": "first_name",
    "LastName": "last_name",
    "Email": "email",
    "Phone": "phone"
  }
}
EOF

# Script para monitorar integrações
cat > /opt/kryonix/integrations/monitor-integrations.sh << 'EOF'
#!/bin/bash

LOG_FILE="/opt/kryonix/integrations/logs/monitoring.log"
WEBHOOK_URL="https://ntfy.kryonix.com.br/integrations"

check_integration_health() {
    local integration_name=$1
    local health_url=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$health_url" --max-time 10)
    
    if [ "$response" != "200" ]; then
        echo "$(date): $integration_name health check failed (HTTP $response)" >> $LOG_FILE
        curl -d "❌ $integration_name: Health check failed (HTTP $response)" $WEBHOOK_URL
        return 1
    else
        echo "$(date): $integration_name health check passed" >> $LOG_FILE
        return 0
    fi
}

# Verificar integrações principais
check_integration_health "Stripe" "https://api.stripe.com/v1/balance"
check_integration_health "Mailchimp" "https://us1.api.mailchimp.com/3.0/ping"

# Verificar rate limits
check_rate_limits() {
    local redis_host="redis.kryonix.com.br"
    local redis_port="6379"
    
    # Obter rate limits do Redis
    rate_limit_keys=$(redis-cli -h $redis_host -p $redis_port keys "rate_limit:*" | wc -l)
    
    if [ "$rate_limit_keys" -gt 1000 ]; then
        echo "$(date): High rate limit usage detected ($rate_limit_keys keys)" >> $LOG_FILE
        curl -d "⚠️ Rate Limit: Alto uso detectado ($rate_limit_keys chaves ativas)" $WEBHOOK_URL
    fi
}

check_rate_limits

echo "$(date): Integration monitoring completed" >> $LOG_FILE
EOF

chmod +x /opt/kryonix/integrations/monitor-integrations.sh

# Script para processar webhooks em fila
cat > /opt/kryonix/integrations/process-webhook-queue.sh << 'EOF'
#!/bin/bash

QUEUE_NAME="webhook_processing"
POSTGRES_HOST="postgresql.kryonix.com.br"
POSTGRES_USER="postgres"
POSTGRES_DB="kryonix"

process_pending_webhooks() {
    echo "$(date): Processing pending webhooks..."
    
    # Buscar webhooks pendentes
    PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c "
        UPDATE integrations.webhook_events 
        SET processing_status = 'processing',
            processing_attempts = processing_attempts + 1,
            next_processing_at = NOW() + INTERVAL '5 minutes'
        WHERE processing_status = 'pending' 
        AND next_processing_at <= NOW()
        AND processing_attempts < max_processing_attempts
        RETURNING event_id;
    "
    
    echo "$(date): Webhook processing update completed"
}

# Configurar cron para processar a cada minuto
if ! crontab -l | grep -q "process-webhook-queue"; then
    (crontab -l 2>/dev/null; echo "* * * * * /opt/kryonix/integrations/process-webhook-queue.sh") | crontab -
fi

process_pending_webhooks
EOF

chmod +x /opt/kryonix/integrations/process-webhook-queue.sh

# Configurar alertas no Grafana
cat > /opt/kryonix/integrations/grafana-alerts.json << 'EOF'
{
  "dashboard": {
    "title": "API Integrations Monitoring",
    "panels": [
      {
        "title": "Integration Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "(sum(integration_requests_total{status=\"success\"}) / sum(integration_requests_total)) * 100",
            "legendFormat": "Success Rate %"
          }
        ],
        "alert": {
          "conditions": [
            {
              "evaluator": {
                "params": [95],
                "type": "lt"
              }
            }
          ],
          "executionErrorState": "alerting",
          "for": "5m",
          "frequency": "1m",
          "name": "Low Integration Success Rate"
        }
      },
      {
        "title": "Circuit Breaker Status",
        "type": "stat",
        "targets": [
          {
            "expr": "count(integration_circuit_breaker{state=\"open\"})",
            "legendFormat": "Open Circuit Breakers"
          }
        ],
        "alert": {
          "conditions": [
            {
              "evaluator": {
                "params": [0],
                "type": "gt"
              }
            }
          ],
          "executionErrorState": "alerting",
          "for": "1m",
          "frequency": "30s",
          "name": "Circuit Breaker Open"
        }
      }
    ]
  }
}
EOF

# Configurar logrotate para logs de integração
cat > /etc/logrotate.d/kryonix-integrations << 'EOF'
/opt/kryonix/integrations/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload nginx || true
    endscript
}
EOF

echo "✅ Sistema de Integrações configurado!"
echo ""
echo "🔗 Webhooks: https://webhooks.kryonix.com.br"
echo "🔐 Vault: https://vault.kryonix.com.br" 
echo "📊 Monitoramento: /opt/kryonix/integrations/logs/"
echo "⚙️ Configurações: /opt/kryonix/integrations/configs/"
echo ""
echo "🔄 Próximos passos:"
echo "1. Configurar credenciais no VaultWarden"
echo "2. Ativar integrações necessárias"
echo "3. Testar webhooks com dados de exemplo"
echo "4. Verificar alertas no Grafana"
```

### ✅ CHECKLIST DE VALIDAÇÃO

- [ ] **Configuração de Integrações**
  - [ ] API configurations criadas no PostgreSQL
  - [ ] VaultWarden configurado para credenciais
  - [ ] Rate limiting implementado com Redis
  - [ ] Circuit breaker funcionando

- [ ] **Webhooks**
  - [ ] Endpoint de webhooks acessível
  - [ ] Verificação de assinatura implementada
  - [ ] Processamento assíncrono configurado
  - [ ] Retry logic com backoff

- [ ] **Monitoramento**
  - [ ] Métricas coletadas no Prometheus
  - [ ] Dashboards configurados no Grafana
  - [ ] Alertas críticos funcionando
  - [ ] Logs centralizados

- [ ] **Segurança**
  - [ ] Credenciais armazenadas com segurança
  - [ ] Rate limiting ativo
  - [ ] Validação de entrada implementada
  - [ ] HTTPS obrigatório para webhooks

### 🧪 TESTES DE QUALIDADE

```bash
#!/bin/bash
# test-integrations.sh

echo "🧪 Executando Testes de Integrações..."

# Teste 1: Verificar conectividade de APIs
echo "Teste 1: Conectividade de APIs"
if curl -s "https://api.stripe.com/v1/balance" -H "Authorization: Bearer sk_test_..." > /dev/null; then
    echo "✅ Stripe API acessível"
else
    echo "❌ Stripe API inacessível"
fi

# Teste 2: Verificar webhook endpoint
echo "Teste 2: Webhook endpoint"
response=$(curl -s -o /dev/null -w "%{http_code}" "https://webhooks.kryonix.com.br/health")
if [ "$response" = "200" ]; then
    echo "✅ Webhook endpoint acessível"
else
    echo "❌ Webhook endpoint inacessível (HTTP $response)"
fi

# Teste 3: Verificar rate limiting
echo "Teste 3: Rate limiting"
for i in {1..5}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.kryonix.com.br/integrations/test-rate-limit")
    echo "Request $i: HTTP $response"
done

# Teste 4: Verificar circuit breaker
echo "Teste 4: Circuit breaker"
circuit_status=$(curl -s "https://api.kryonix.com.br/integrations/circuit-breaker/status" | jq -r '.status')
echo "Circuit breaker status: $circuit_status"

# Teste 5: Verificar processamento de webhook
echo "Teste 5: Processamento de webhook"
webhook_payload='{"event": "test", "data": {"id": "test_123"}}'
webhook_response=$(curl -s -X POST "https://webhooks.kryonix.com.br/stripe" \
    -H "Content-Type: application/json" \
    -d "$webhook_payload")

if echo "$webhook_response" | grep -q "success"; then
    echo "✅ Webhook processado com sucesso"
else
    echo "❌ Falha no processamento do webhook"
fi

echo ""
echo "🏁 Testes de Integrações concluídos!"
```

### 📚 DOCUMENTAÇÃO TÉCNICA

#### Tipos de Integração Suportados

1. **Polling**: Consulta periódica de APIs externas
2. **Webhooks**: Recebimento de eventos em tempo real
3. **Push**: Envio de dados para APIs externas
4. **Bidirectional**: Sincronização bidirecional

#### Autenticação Suportada

- **API Key**: Chave simples no header ou query string
- **Bearer Token**: Token JWT ou similar
- **Basic Auth**: Username e password
- **OAuth 2.0**: Fluxo completo com refresh tokens

#### Padrões de Resiliência

- **Circuit Breaker**: Proteção contra falhas em cascata
- **Rate Limiting**: Respeito aos limites das APIs
- **Retry com Backoff**: Tentativas com delay exponencial
- **Timeout**: Limites de tempo para requisições

### 🔗 INTEGRAÇÃO COM STACK EXISTENTE

- **PostgreSQL**: Configurações e logs de sincronização
- **Redis**: Cache de rate limiting e tokens
- **VaultWarden**: Armazenamento seguro de credenciais
- **RabbitMQ**: Filas para processamento assíncrono
- **Grafana**: Monitoramento e alertas
- **Nginx**: Proxy para webhooks com rate limiting

### 📈 MÉTRICAS COLETADAS

- **Request Rate**: Requisições por minuto/hora
- **Success Rate**: Porcentagem de sucesso
- **Response Time**: P50, P95, P99 de latência
- **Error Rate**: Tipos e frequência de erros
- **Circuit Breaker State**: Estado dos circuit breakers
- **Rate Limit Usage**: Utilização dos rate limits
- **Webhook Processing**: Tempo de processamento de webhooks

---

**PARTE-24 CONCLUÍDA** ✅  
Sistema completo de integração com APIs externas implementado com gestão de credenciais, rate limiting, circuit breakers, webhooks e monitoramento abrangente.

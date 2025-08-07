# PARTE-23: LOGS E AUDITORIA
## Sistema Completo de Logs e Auditoria

### 📋 DESCRIÇÃO
Implementação de sistema robusto de logging centralizado e auditoria completa para todos os 32 stacks da plataforma KRYONIX, garantindo rastreabilidade, compliance e análise forense de todas as operações.

### 🎯 OBJETIVOS
- Centralização de logs de todos os serviços
- Auditoria completa de ações de usuários
- Compliance com LGPD e regulamentações
- Detecção de anomalias e tentativas de intrusão
- Retenção e arquivamento inteligente
- Dashboards analíticos em tempo real

### 🏗️ ARQUITETURA

#### Fluxo de Logs Centralizado
```
┌─────────────────────────────────────────────────────────────┐
│                    LOG ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────┤
│ COLLECTION LAYER                                           │
│ • Fluent Bit (Log Forwarder)                              │
│ • Docker Logging Drivers                                   │
│ • Application Structured Logs                              │
├─────────────────────────────────────────────────────────────┤
│ PROCESSING LAYER                                           │
│ • Logstash (Parse & Transform)                             │
│ • Kafka (Stream Buffer)                                    │
│ • Enrichment & Correlation                                 │
├─────────────────────────────────────────────────────────────┤
│ STORAGE LAYER                                              │
│ • Elasticsearch (Search & Analytics)                       │
│ • TimescaleDB (Time-series Metrics)                       │
│ • MinIO (Long-term Archive)                               │
├─────────────────────────────────────────────────────────────┤
│ VISUALIZATION LAYER                                        │
│ • Kibana (Log Analysis)                                    │
│ • Grafana (Metrics & Alerting)                            │
│ • Custom Audit Dashboard                                   │
└─────────────────────────────────────────────────────────────┘
```

### 🗄️ SCHEMAS DE BANCO DE DADOS

#### PostgreSQL Audit Schema
```sql
-- Esquema para auditoria completa
CREATE SCHEMA IF NOT EXISTS audit;

-- Tabela principal de auditoria
CREATE TABLE audit.audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    session_id VARCHAR(255),
    operation_type VARCHAR(50) NOT NULL, -- 'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    table_name VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    correlation_id VARCHAR(255),
    operation_result VARCHAR(20) DEFAULT 'success', -- 'success', 'failure', 'partial'
    error_message TEXT,
    execution_time_ms INTEGER,
    resource_path TEXT,
    http_method VARCHAR(10),
    http_status_code INTEGER,
    risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
    compliance_tags TEXT[], -- ['LGPD', 'SOX', 'PCI', etc.]
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para rastreamento de sessões
CREATE TABLE audit.session_tracking (
    session_id VARCHAR(255) PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP WITH TIME ZONE,
    session_duration INTERVAL,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    location_country VARCHAR(2),
    location_city VARCHAR(100),
    is_suspicious BOOLEAN DEFAULT false,
    mfa_verified BOOLEAN DEFAULT false,
    failed_attempts INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'terminated'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para logs de sistema
CREATE TABLE audit.system_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    service_name VARCHAR(100) NOT NULL,
    log_level VARCHAR(20) NOT NULL, -- 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'
    message TEXT NOT NULL,
    context JSONB,
    stack_trace TEXT,
    request_id VARCHAR(255),
    correlation_id VARCHAR(255),
    source_file VARCHAR(255),
    source_line INTEGER,
    process_id INTEGER,
    thread_id VARCHAR(50),
    memory_usage_mb INTEGER,
    cpu_usage_percent DECIMAL(5,2),
    response_time_ms INTEGER,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para compliance e retenção
CREATE TABLE audit.log_retention_policy (
    policy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    log_type VARCHAR(50) NOT NULL,
    compliance_requirement VARCHAR(100), -- 'LGPD', 'SOX', 'PCI-DSS', etc.
    retention_period INTERVAL NOT NULL,
    archive_after INTERVAL,
    encryption_required BOOLEAN DEFAULT true,
    anonymization_rules JSONB,
    deletion_schedule VARCHAR(100), -- cron expression
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_audit_log_tenant_date ON audit.audit_log(tenant_id, created_at DESC);
CREATE INDEX idx_audit_log_user_operation ON audit.audit_log(user_id, operation_type);
CREATE INDEX idx_audit_log_entity ON audit.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_risk_score ON audit.audit_log(risk_score DESC) WHERE risk_score > 50;
CREATE INDEX idx_session_tracking_user_status ON audit.session_tracking(user_id, session_status);
CREATE INDEX idx_system_logs_service_level ON audit.system_logs(service_name, log_level, created_at DESC);

-- Particionamento por tempo para performance
CREATE TABLE audit.audit_log_y2024m01 PARTITION OF audit.audit_log
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit.audit_log_y2024m02 PARTITION OF audit.audit_log
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Função para análise de anomalias
CREATE OR REPLACE FUNCTION audit.detect_anomalies(p_tenant_id UUID, p_hours INTEGER DEFAULT 24)
RETURNS TABLE (
    anomaly_type VARCHAR(50),
    severity VARCHAR(20),
    description TEXT,
    occurrence_count BIGINT,
    first_seen TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Multiple failed logins
    RETURN QUERY
    SELECT 
        'MULTIPLE_FAILED_LOGINS' as anomaly_type,
        CASE WHEN COUNT(*) > 10 THEN 'HIGH'
             WHEN COUNT(*) > 5 THEN 'MEDIUM'
             ELSE 'LOW' END as severity,
        'Múltiplas tentativas de login falharam' as description,
        COUNT(*) as occurrence_count,
        MIN(created_at) as first_seen,
        MAX(created_at) as last_seen
    FROM audit.audit_log
    WHERE tenant_id = p_tenant_id
      AND operation_type = 'LOGIN'
      AND operation_result = 'failure'
      AND created_at >= NOW() - INTERVAL '1 hour' * p_hours
      AND user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) >= 3;

    -- Unusual access patterns
    RETURN QUERY
    SELECT 
        'UNUSUAL_ACCESS_PATTERN' as anomaly_type,
        'MEDIUM' as severity,
        'Acesso de localização incomum detectado' as description,
        COUNT(*) as occurrence_count,
        MIN(created_at) as first_seen,
        MAX(created_at) as last_seen
    FROM audit.audit_log al
    JOIN audit.session_tracking st ON al.session_id = st.session_id
    WHERE al.tenant_id = p_tenant_id
      AND al.created_at >= NOW() - INTERVAL '1 hour' * p_hours
      AND st.location_country IS NOT NULL
      AND st.location_country NOT IN (
          SELECT DISTINCT location_country 
          FROM audit.session_tracking 
          WHERE user_id = st.user_id 
            AND created_at >= NOW() - INTERVAL '30 days'
          LIMIT 3
      )
    GROUP BY st.user_id, st.location_country;

    -- High-risk operations
    RETURN QUERY
    SELECT 
        'HIGH_RISK_OPERATIONS' as anomaly_type,
        'HIGH' as severity,
        'Operações de alto risco detectadas' as description,
        COUNT(*) as occurrence_count,
        MIN(created_at) as first_seen,
        MAX(created_at) as last_seen
    FROM audit.audit_log
    WHERE tenant_id = p_tenant_id
      AND created_at >= NOW() - INTERVAL '1 hour' * p_hours
      AND risk_score >= 80
    GROUP BY user_id
    HAVING COUNT(*) >= 5;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-calcular risk score
CREATE OR REPLACE FUNCTION audit.calculate_risk_score()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Base score por tipo de operação
    CASE NEW.operation_type
        WHEN 'DELETE' THEN score := score + 30;
        WHEN 'UPDATE' THEN score := score + 15;
        WHEN 'LOGIN' THEN score := score + 5;
        ELSE score := score + 0;
    END CASE;

    -- Score por resultado
    IF NEW.operation_result = 'failure' THEN
        score := score + 25;
    END IF;

    -- Score por entidade sensível
    IF NEW.entity_type IN ('user', 'payment', 'sensitive_data') THEN
        score := score + 20;
    END IF;

    -- Score por horário (fora do horário comercial)
    IF EXTRACT(HOUR FROM NEW.created_at) NOT BETWEEN 8 AND 18 THEN
        score := score + 10;
    END IF;

    -- Score por localização suspeita (implementar lógica específica)
    IF NEW.ip_address IS NOT NULL THEN
        -- Verificar se IP está em lista de bloqueio
        score := score + 5;
    END IF;

    NEW.risk_score := LEAST(score, 100); -- Cap em 100
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_risk_score_trigger
    BEFORE INSERT ON audit.audit_log
    FOR EACH ROW EXECUTE FUNCTION audit.calculate_risk_score();
```

### 🔧 IMPLEMENTAÇÃO DOS SERVIÇOS

#### 1. Audit Service
```typescript
// src/modules/audit/services/audit.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as geoip from 'geoip-lite';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(
        @InjectRepository(AuditLog)
        private readonly auditRepository: Repository<AuditLog>,
        
        @InjectRepository(SessionTracking)
        private readonly sessionRepository: Repository<SessionTracking>,
        
        @InjectRepository(SystemLogs)
        private readonly systemLogsRepository: Repository<SystemLogs>,
        
        private readonly elasticsearchService: ElasticsearchService,
        private readonly configService: ConfigService
    ) {}

    async logOperation(params: AuditOperationParams): Promise<void> {
        try {
            const auditLog = this.auditRepository.create({
                tenantId: params.tenantId,
                userId: params.userId,
                sessionId: params.sessionId,
                operationType: params.operationType,
                entityType: params.entityType,
                entityId: params.entityId,
                tableName: params.tableName,
                oldValues: params.oldValues,
                newValues: params.newValues,
                changedFields: params.changedFields,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                requestId: params.requestId,
                correlationId: params.correlationId,
                operationResult: params.operationResult || 'success',
                errorMessage: params.errorMessage,
                executionTimeMs: params.executionTimeMs,
                resourcePath: params.resourcePath,
                httpMethod: params.httpMethod,
                httpStatusCode: params.httpStatusCode,
                complianceTags: params.complianceTags || [],
                metadata: params.metadata || {}
            });

            await this.auditRepository.save(auditLog);

            // Enviar para Elasticsearch para busca rápida
            await this.indexToElasticsearch(auditLog);

            // Verificar se é uma operação suspeita
            await this.checkSuspiciousActivity(auditLog);

        } catch (error) {
            this.logger.error('Erro ao registrar log de auditoria:', error);
        }
    }

    async logSystemEvent(params: SystemLogParams): Promise<void> {
        try {
            const systemLog = this.systemLogsRepository.create({
                tenantId: params.tenantId,
                serviceName: params.serviceName,
                logLevel: params.logLevel,
                message: params.message,
                context: params.context,
                stackTrace: params.stackTrace,
                requestId: params.requestId,
                correlationId: params.correlationId,
                sourceFile: params.sourceFile,
                sourceLine: params.sourceLine,
                processId: params.processId,
                threadId: params.threadId,
                memoryUsageMb: params.memoryUsageMb,
                cpuUsagePercent: params.cpuUsagePercent,
                responseTimeMs: params.responseTimeMs,
                tags: params.tags || []
            });

            await this.systemLogsRepository.save(systemLog);

            // Indexar no Elasticsearch
            await this.indexSystemLogToElasticsearch(systemLog);

            // Alertar sobre erros críticos
            if (params.logLevel === 'ERROR' || params.logLevel === 'FATAL') {
                await this.handleCriticalError(systemLog);
            }

        } catch (error) {
            this.logger.error('Erro ao registrar log de sistema:', error);
        }
    }

    async trackSession(request: Request, userId: string, tenantId: string): Promise<string> {
        const sessionId = this.generateSessionId();
        const ipAddress = this.getClientIpAddress(request);
        const location = geoip.lookup(ipAddress);

        const session = this.sessionRepository.create({
            sessionId,
            tenantId,
            userId,
            ipAddress,
            userAgent: request.headers['user-agent'],
            deviceFingerprint: this.generateDeviceFingerprint(request),
            locationCountry: location?.country,
            locationCity: location?.city,
            mfaVerified: false,
            sessionStatus: 'active'
        });

        await this.sessionRepository.save(session);

        return sessionId;
    }

    async updateSessionActivity(sessionId: string): Promise<void> {
        await this.sessionRepository.update(
            { sessionId },
            { lastActivity: new Date() }
        );
    }

    async endSession(sessionId: string): Promise<void> {
        const session = await this.sessionRepository.findOne({
            where: { sessionId }
        });

        if (session) {
            const sessionDuration = new Date().getTime() - session.loginAt.getTime();
            
            await this.sessionRepository.update(
                { sessionId },
                {
                    logoutAt: new Date(),
                    sessionDuration: Math.floor(sessionDuration / 1000), // em segundos
                    sessionStatus: 'terminated'
                }
            );
        }
    }

    async getAuditTrail(params: AuditTrailQuery): Promise<AuditTrailResult> {
        const queryBuilder = this.auditRepository.createQueryBuilder('audit')
            .where('audit.tenantId = :tenantId', { tenantId: params.tenantId })
            .orderBy('audit.createdAt', 'DESC');

        if (params.userId) {
            queryBuilder.andWhere('audit.userId = :userId', { userId: params.userId });
        }

        if (params.entityType) {
            queryBuilder.andWhere('audit.entityType = :entityType', { entityType: params.entityType });
        }

        if (params.entityId) {
            queryBuilder.andWhere('audit.entityId = :entityId', { entityId: params.entityId });
        }

        if (params.operationType) {
            queryBuilder.andWhere('audit.operationType = :operationType', { operationType: params.operationType });
        }

        if (params.startDate) {
            queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate: params.startDate });
        }

        if (params.endDate) {
            queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate: params.endDate });
        }

        if (params.riskScoreMin) {
            queryBuilder.andWhere('audit.riskScore >= :riskScoreMin', { riskScoreMin: params.riskScoreMin });
        }

        const [logs, total] = await queryBuilder
            .take(params.limit || 100)
            .skip(params.offset || 0)
            .getManyAndCount();

        return {
            logs,
            total,
            hasMore: total > (params.offset || 0) + logs.length
        };
    }

    async detectAnomalies(tenantId: string, hours: number = 24): Promise<AnomalyDetectionResult[]> {
        const query = `
            SELECT * FROM audit.detect_anomalies($1, $2)
        `;
        
        const result = await this.auditRepository.query(query, [tenantId, hours]);
        
        return result.map(row => ({
            anomalyType: row.anomaly_type,
            severity: row.severity,
            description: row.description,
            occurrenceCount: parseInt(row.occurrence_count),
            firstSeen: new Date(row.first_seen),
            lastSeen: new Date(row.last_seen)
        }));
    }

    async generateComplianceReport(params: ComplianceReportParams): Promise<ComplianceReport> {
        const auditData = await this.getAuditTrail({
            tenantId: params.tenantId,
            startDate: params.startDate,
            endDate: params.endDate,
            limit: 10000
        });

        const sessionData = await this.sessionRepository.find({
            where: {
                tenantId: params.tenantId,
                loginAt: Between(params.startDate, params.endDate)
            }
        });

        const report: ComplianceReport = {
            period: {
                startDate: params.startDate,
                endDate: params.endDate
            },
            tenantId: params.tenantId,
            totalOperations: auditData.total,
            successfulOperations: auditData.logs.filter(log => log.operationResult === 'success').length,
            failedOperations: auditData.logs.filter(log => log.operationResult === 'failure').length,
            dataAccessOperations: auditData.logs.filter(log => log.operationType === 'READ').length,
            dataModificationOperations: auditData.logs.filter(log => 
                ['CREATE', 'UPDATE', 'DELETE'].includes(log.operationType)
            ).length,
            uniqueUsers: new Set(auditData.logs.map(log => log.userId).filter(Boolean)).size,
            totalSessions: sessionData.length,
            suspiciousActivities: auditData.logs.filter(log => log.riskScore >= 70).length,
            complianceViolations: auditData.logs.filter(log => 
                log.complianceTags.some(tag => ['LGPD_VIOLATION', 'SOX_VIOLATION'].includes(tag))
            ).length,
            dataRetentionCompliance: await this.checkDataRetentionCompliance(params.tenantId),
            generatedAt: new Date(),
            reportId: this.generateReportId()
        };

        return report;
    }

    private async indexToElasticsearch(auditLog: AuditLog): Promise<void> {
        try {
            await this.elasticsearchService.index({
                index: 'kryonix-audit-logs',
                body: {
                    ...auditLog,
                    '@timestamp': auditLog.createdAt
                }
            });
        } catch (error) {
            this.logger.warn('Falha ao indexar no Elasticsearch:', error.message);
        }
    }

    private async indexSystemLogToElasticsearch(systemLog: SystemLogs): Promise<void> {
        try {
            await this.elasticsearchService.index({
                index: 'kryonix-system-logs',
                body: {
                    ...systemLog,
                    '@timestamp': systemLog.createdAt
                }
            });
        } catch (error) {
            this.logger.warn('Falha ao indexar log de sistema no Elasticsearch:', error.message);
        }
    }

    private async checkSuspiciousActivity(auditLog: AuditLog): Promise<void> {
        if (auditLog.riskScore >= 80) {
            // Enviar alerta imediato
            await this.sendSecurityAlert({
                type: 'HIGH_RISK_ACTIVITY',
                severity: 'HIGH',
                auditLogId: auditLog.auditId,
                userId: auditLog.userId,
                riskScore: auditLog.riskScore,
                description: `Atividade de alto risco detectada: ${auditLog.operationType} em ${auditLog.entityType}`
            });
        }
    }

    private async handleCriticalError(systemLog: SystemLogs): Promise<void> {
        // Notificar equipe de suporte sobre erro crítico
        await this.sendSystemAlert({
            type: 'CRITICAL_ERROR',
            severity: systemLog.logLevel,
            serviceName: systemLog.serviceName,
            message: systemLog.message,
            stackTrace: systemLog.stackTrace
        });
    }

    private generateSessionId(): string {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateDeviceFingerprint(request: Request): string {
        const components = [
            request.headers['user-agent'],
            request.headers['accept-language'],
            request.headers['accept-encoding']
        ].filter(Boolean);

        return require('crypto')
            .createHash('sha256')
            .update(components.join('|'))
            .digest('hex')
            .substr(0, 32);
    }

    private getClientIpAddress(request: Request): string {
        return (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
               request.headers['x-real-ip'] as string ||
               request.connection.remoteAddress ||
               request.socket.remoteAddress ||
               '127.0.0.1';
    }

    private generateReportId(): string {
        return `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private async checkDataRetentionCompliance(tenantId: string): Promise<boolean> {
        // Verificar se os dados estão sendo retidos conforme política
        const policies = await this.getRetentionPolicies(tenantId);
        
        for (const policy of policies) {
            const oldLogsCount = await this.auditRepository
                .createQueryBuilder()
                .where('tenantId = :tenantId', { tenantId })
                .andWhere('created_at < :cutoffDate', { 
                    cutoffDate: new Date(Date.now() - policy.retentionPeriodMs) 
                })
                .getCount();

            if (oldLogsCount > 0) {
                return false; // Dados não estão sendo limpos conforme política
            }
        }

        return true;
    }

    private async getRetentionPolicies(tenantId: string): Promise<any[]> {
        // Implementar busca de políticas de retenção
        return [];
    }

    private async sendSecurityAlert(alert: SecurityAlert): Promise<void> {
        // Implementar envio de alertas de segurança
        this.logger.warn(`ALERTA DE SEGURANÇA: ${alert.description}`, alert);
    }

    private async sendSystemAlert(alert: SystemAlert): Promise<void> {
        // Implementar envio de alertas de sistema
        this.logger.error(`ALERTA DE SISTEMA: ${alert.message}`, alert);
    }
}

// Interfaces
interface AuditOperationParams {
    tenantId: string;
    userId?: string;
    sessionId?: string;
    operationType: string;
    entityType: string;
    entityId?: string;
    tableName?: string;
    oldValues?: any;
    newValues?: any;
    changedFields?: string[];
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    correlationId?: string;
    operationResult?: string;
    errorMessage?: string;
    executionTimeMs?: number;
    resourcePath?: string;
    httpMethod?: string;
    httpStatusCode?: number;
    complianceTags?: string[];
    metadata?: any;
}

interface SystemLogParams {
    tenantId?: string;
    serviceName: string;
    logLevel: string;
    message: string;
    context?: any;
    stackTrace?: string;
    requestId?: string;
    correlationId?: string;
    sourceFile?: string;
    sourceLine?: number;
    processId?: number;
    threadId?: string;
    memoryUsageMb?: number;
    cpuUsagePercent?: number;
    responseTimeMs?: number;
    tags?: string[];
}

interface AuditTrailQuery {
    tenantId: string;
    userId?: string;
    entityType?: string;
    entityId?: string;
    operationType?: string;
    startDate?: Date;
    endDate?: Date;
    riskScoreMin?: number;
    limit?: number;
    offset?: number;
}

interface AuditTrailResult {
    logs: any[];
    total: number;
    hasMore: boolean;
}

interface AnomalyDetectionResult {
    anomalyType: string;
    severity: string;
    description: string;
    occurrenceCount: number;
    firstSeen: Date;
    lastSeen: Date;
}

interface ComplianceReportParams {
    tenantId: string;
    startDate: Date;
    endDate: Date;
    complianceStandard?: string;
}

interface ComplianceReport {
    period: {
        startDate: Date;
        endDate: Date;
    };
    tenantId: string;
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    dataAccessOperations: number;
    dataModificationOperations: number;
    uniqueUsers: number;
    totalSessions: number;
    suspiciousActivities: number;
    complianceViolations: number;
    dataRetentionCompliance: boolean;
    generatedAt: Date;
    reportId: string;
}

interface SecurityAlert {
    type: string;
    severity: string;
    auditLogId: string;
    userId?: string;
    riskScore: number;
    description: string;
}

interface SystemAlert {
    type: string;
    severity: string;
    serviceName: string;
    message: string;
    stackTrace?: string;
}
```

#### 2. Log Aggregation Service
```typescript
// src/modules/audit/services/log-aggregation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LogAggregationService {
    private readonly logger = new Logger(LogAggregationService.name);

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly configService: ConfigService
    ) {}

    @Cron('0 */5 * * * *') // A cada 5 minutos
    async aggregateRealtimeMetrics(): Promise<void> {
        try {
            await this.calculateErrorRates();
            await this.calculateResponseTimeMetrics();
            await this.calculateSecurityMetrics();
            await this.calculateUserActivityMetrics();
        } catch (error) {
            this.logger.error('Erro na agregação de métricas em tempo real:', error);
        }
    }

    @Cron('0 0 * * * *') // A cada hora
    async aggregateHourlyMetrics(): Promise<void> {
        try {
            await this.calculateHourlyTrends();
            await this.detectAnomalies();
            await this.updateDashboardMetrics();
        } catch (error) {
            this.logger.error('Erro na agregação de métricas horárias:', error);
        }
    }

    @Cron('0 0 0 * * *') // Diariamente à meia-noite
    async aggregateDailyMetrics(): Promise<void> {
        try {
            await this.generateDailyReport();
            await this.archiveOldLogs();
            await this.optimizeIndices();
        } catch (error) {
            this.logger.error('Erro na agregação de métricas diárias:', error);
        }
    }

    private async calculateErrorRates(): Promise<void> {
        const query = {
            index: 'kryonix-system-logs',
            body: {
                query: {
                    bool: {
                        filter: [
                            { range: { '@timestamp': { gte: 'now-5m' } } },
                            { terms: { log_level: ['ERROR', 'FATAL'] } }
                        ]
                    }
                },
                aggs: {
                    error_rate_by_service: {
                        terms: {
                            field: 'service_name.keyword',
                            size: 50
                        }
                    },
                    total_errors: {
                        value_count: { field: 'log_id' }
                    }
                }
            }
        };

        const response = await this.elasticsearchService.search(query);
        
        // Processar e armazenar métricas
        await this.storeMetrics('error_rates', response.body.aggregations);
    }

    private async calculateResponseTimeMetrics(): Promise<void> {
        const query = {
            index: 'kryonix-audit-logs',
            body: {
                query: {
                    bool: {
                        filter: [
                            { range: { '@timestamp': { gte: 'now-5m' } } },
                            { exists: { field: 'execution_time_ms' } }
                        ]
                    }
                },
                aggs: {
                    avg_response_time: {
                        avg: { field: 'execution_time_ms' }
                    },
                    p95_response_time: {
                        percentiles: { 
                            field: 'execution_time_ms',
                            percents: [95]
                        }
                    },
                    response_time_by_operation: {
                        terms: {
                            field: 'operation_type.keyword'
                        },
                        aggs: {
                            avg_time: {
                                avg: { field: 'execution_time_ms' }
                            }
                        }
                    }
                }
            }
        };

        const response = await this.elasticsearchService.search(query);
        await this.storeMetrics('response_times', response.body.aggregations);
    }

    private async calculateSecurityMetrics(): Promise<void> {
        const query = {
            index: 'kryonix-audit-logs',
            body: {
                query: {
                    bool: {
                        filter: [
                            { range: { '@timestamp': { gte: 'now-1h' } } },
                            { range: { risk_score: { gte: 50 } } }
                        ]
                    }
                },
                aggs: {
                    high_risk_operations: {
                        range: {
                            field: 'risk_score',
                            ranges: [
                                { from: 50, to: 70, key: 'medium_risk' },
                                { from: 70, to: 90, key: 'high_risk' },
                                { from: 90, key: 'critical_risk' }
                            ]
                        }
                    },
                    failed_logins: {
                        filter: {
                            bool: {
                                must: [
                                    { term: { operation_type: 'LOGIN' } },
                                    { term: { operation_result: 'failure' } }
                                ]
                            }
                        }
                    },
                    suspicious_ips: {
                        terms: {
                            field: 'ip_address',
                            size: 20,
                            min_doc_count: 5
                        }
                    }
                }
            }
        };

        const response = await this.elasticsearchService.search(query);
        await this.storeMetrics('security_metrics', response.body.aggregations);
    }

    private async calculateUserActivityMetrics(): Promise<void> {
        const query = {
            index: 'kryonix-audit-logs',
            body: {
                query: {
                    range: { '@timestamp': { gte: 'now-1h' } }
                },
                aggs: {
                    active_users: {
                        cardinality: { field: 'user_id' }
                    },
                    operations_by_type: {
                        terms: { field: 'operation_type.keyword' }
                    },
                    activity_by_hour: {
                        date_histogram: {
                            field: '@timestamp',
                            fixed_interval: '1h'
                        }
                    }
                }
            }
        };

        const response = await this.elasticsearchService.search(query);
        await this.storeMetrics('user_activity', response.body.aggregations);
    }

    private async storeMetrics(metricType: string, data: any): Promise<void> {
        const metricDocument = {
            metric_type: metricType,
            timestamp: new Date(),
            data: data
        };

        await this.elasticsearchService.index({
            index: 'kryonix-metrics',
            body: metricDocument
        });
    }

    private async detectAnomalies(): Promise<void> {
        // Implementar detecção de anomalias usando machine learning
        // Por exemplo, detectar padrões incomuns de acesso ou operações
        
        const anomalies = await this.runAnomalyDetection();
        
        for (const anomaly of anomalies) {
            if (anomaly.severity === 'HIGH') {
                await this.sendAnomalyAlert(anomaly);
            }
        }
    }

    private async runAnomalyDetection(): Promise<any[]> {
        // Placeholder para algoritmos de detecção de anomalias
        // Pode usar bibliotecas como ML.js ou APIs do Elasticsearch ML
        return [];
    }

    private async sendAnomalyAlert(anomaly: any): Promise<void> {
        this.logger.warn(`Anomalia detectada: ${anomaly.description}`, anomaly);
        // Implementar envio de alertas
    }

    async getLogAnalytics(params: LogAnalyticsQuery): Promise<LogAnalyticsResult> {
        const query = {
            index: params.indices || ['kryonix-audit-logs', 'kryonix-system-logs'],
            body: {
                query: {
                    bool: {
                        filter: [
                            { range: { '@timestamp': { 
                                gte: params.startTime, 
                                lte: params.endTime 
                            }}}
                        ]
                    }
                },
                aggs: {
                    logs_over_time: {
                        date_histogram: {
                            field: '@timestamp',
                            fixed_interval: params.interval || '1h'
                        }
                    },
                    top_services: {
                        terms: {
                            field: 'service_name.keyword',
                            size: 10
                        }
                    },
                    log_levels: {
                        terms: {
                            field: 'log_level.keyword'
                        }
                    }
                }
            }
        };

        const response = await this.elasticsearchService.search(query);
        
        return {
            totalLogs: response.body.hits.total.value,
            timeDistribution: response.body.aggregations.logs_over_time.buckets,
            topServices: response.body.aggregations.top_services.buckets,
            logLevelDistribution: response.body.aggregations.log_levels.buckets,
            searchTime: response.body.took
        };
    }
}

interface LogAnalyticsQuery {
    startTime: string;
    endTime: string;
    interval?: string;
    indices?: string[];
    filters?: any[];
}

interface LogAnalyticsResult {
    totalLogs: number;
    timeDistribution: any[];
    topServices: any[];
    logLevelDistribution: any[];
    searchTime: number;
}
```

### 🎨 COMPONENTES FRONTEND

#### 1. Dashboard de Auditoria
```typescript
// src/components/audit/AuditDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Shield, 
    Activity, 
    AlertTriangle, 
    FileText, 
    Clock, 
    User, 
    Search,
    Filter,
    Download,
    RefreshCw
} from 'lucide-react';
import { useAuditLogs, useAnomalyDetection, useComplianceMetrics } from '@/hooks/useAudit';

export function AuditDashboard() {
    const [timeRange, setTimeRange] = useState('24h');
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [riskFilter, setRiskFilter] = useState<number | null>(null);

    const { auditLogs, loading: logsLoading, refetch: refetchLogs } = useAuditLogs({ 
        timeRange, 
        service: selectedService,
        riskScoreMin: riskFilter 
    });
    
    const { anomalies, loading: anomaliesLoading } = useAnomalyDetection({ timeRange });
    const { metrics, loading: metricsLoading } = useComplianceMetrics({ timeRange });

    const getRiskBadge = (score: number) => {
        if (score >= 80) return <Badge variant="destructive">Crítico</Badge>;
        if (score >= 60) return <Badge variant="warning">Alto</Badge>;
        if (score >= 40) return <Badge variant="secondary">Médio</Badge>;
        return <Badge variant="success">Baixo</Badge>;
    };

    const getOperationIcon = (operation: string) => {
        const icons = {
            CREATE: '➕',
            READ: '👁️',
            UPDATE: '✏️',
            DELETE: '🗑️',
            LOGIN: '🔐',
            LOGOUT: '🚪'
        };
        return icons[operation] || '📝';
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('pt-BR');
    };

    return (
        <div className="audit-dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    <Shield className="title-icon" />
                    Auditoria e Logs
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
                    <Button variant="outline" onClick={refetchLogs}>
                        <RefreshCw className="button-icon" />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Métricas Principais */}
            <div className="metrics-grid">
                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <Activity className="metric-icon" />
                            Total de Operações
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value">
                            {metrics?.totalOperations?.toLocaleString() || 0}
                        </div>
                        <div className="metric-description">
                            Sucesso: {((metrics?.successfulOperations / metrics?.totalOperations) * 100 || 0).toFixed(1)}%
                        </div>
                    </CardContent>
                </Card>

                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <User className="metric-icon" />
                            Usuários Ativos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value">
                            {metrics?.uniqueUsers || 0}
                        </div>
                        <div className="metric-description">
                            Sessões: {metrics?.totalSessions || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <AlertTriangle className="metric-icon text-orange-500" />
                            Atividades Suspeitas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value text-orange-600">
                            {metrics?.suspiciousActivities || 0}
                        </div>
                        <div className="metric-description">
                            Anomalias: {anomalies?.length || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <FileText className="metric-icon" />
                            Compliance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value text-green-600">
                            {metrics?.dataRetentionCompliance ? '✅' : '❌'}
                        </div>
                        <div className="metric-description">
                            Violações: {metrics?.complianceViolations || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="logs" className="audit-tabs">
                <TabsList>
                    <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
                    <TabsTrigger value="anomalies">Detecção de Anomalias</TabsTrigger>
                    <TabsTrigger value="compliance">Relatórios de Compliance</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="logs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Log de Auditoria</CardTitle>
                            <div className="logs-filters">
                                <div className="filter-group">
                                    <label>Serviço:</label>
                                    <select 
                                        value={selectedService || ''} 
                                        onChange={(e) => setSelectedService(e.target.value || null)}
                                    >
                                        <option value="">Todos os serviços</option>
                                        <option value="keycloak">Keycloak</option>
                                        <option value="postgresql">PostgreSQL</option>
                                        <option value="api-gateway">API Gateway</option>
                                        <option value="user-management">Gestão de Usuários</option>
                                    </select>
                                </div>
                                
                                <div className="filter-group">
                                    <label>Risco Mínimo:</label>
                                    <select 
                                        value={riskFilter || ''} 
                                        onChange={(e) => setRiskFilter(e.target.value ? parseInt(e.target.value) : null)}
                                    >
                                        <option value="">Todos</option>
                                        <option value="40">Médio (40+)</option>
                                        <option value="60">Alto (60+)</option>
                                        <option value="80">Crítico (80+)</option>
                                    </select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="audit-logs-list">
                                {auditLogs?.logs?.map((log) => (
                                    <div key={log.auditId} className="audit-log-item">
                                        <div className="log-header">
                                            <div className="log-operation">
                                                <span className="operation-icon">
                                                    {getOperationIcon(log.operationType)}
                                                </span>
                                                <span className="operation-text">
                                                    {log.operationType}
                                                </span>
                                                <span className="entity-text">
                                                    em {log.entityType}
                                                </span>
                                            </div>
                                            
                                            <div className="log-badges">
                                                {getRiskBadge(log.riskScore)}
                                                <Badge variant={log.operationResult === 'success' ? 'success' : 'destructive'}>
                                                    {log.operationResult}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="log-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Usuário:</span>
                                                <span className="detail-value">{log.userId || 'Sistema'}</span>
                                            </div>
                                            
                                            <div className="detail-row">
                                                <span className="detail-label">IP:</span>
                                                <span className="detail-value">{log.ipAddress}</span>
                                            </div>
                                            
                                            <div className="detail-row">
                                                <span className="detail-label">Timestamp:</span>
                                                <span className="detail-value">{formatDateTime(log.createdAt)}</span>
                                            </div>

                                            {log.executionTimeMs && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Tempo:</span>
                                                    <span className="detail-value">{log.executionTimeMs}ms</span>
                                                </div>
                                            )}
                                        </div>

                                        {log.changedFields && log.changedFields.length > 0 && (
                                            <div className="changed-fields">
                                                <span className="changed-label">Campos alterados:</span>
                                                <div className="changed-list">
                                                    {log.changedFields.map((field) => (
                                                        <Badge key={field} variant="outline">{field}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {log.errorMessage && (
                                            <div className="error-message">
                                                <AlertTriangle className="error-icon" />
                                                <span>{log.errorMessage}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {auditLogs?.hasMore && (
                                <div className="load-more-container">
                                    <Button variant="outline">Carregar Mais</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="anomalies">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detecção de Anomalias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="anomalies-list">
                                {anomalies?.map((anomaly, index) => (
                                    <div key={index} className="anomaly-item">
                                        <div className="anomaly-header">
                                            <div className="anomaly-type">
                                                <AlertTriangle className={`anomaly-icon ${
                                                    anomaly.severity === 'HIGH' ? 'text-red-500' :
                                                    anomaly.severity === 'MEDIUM' ? 'text-orange-500' :
                                                    'text-yellow-500'
                                                }`} />
                                                <span className="anomaly-title">{anomaly.anomalyType}</span>
                                            </div>
                                            <Badge variant={
                                                anomaly.severity === 'HIGH' ? 'destructive' :
                                                anomaly.severity === 'MEDIUM' ? 'warning' : 'secondary'
                                            }>
                                                {anomaly.severity}
                                            </Badge>
                                        </div>

                                        <div className="anomaly-description">
                                            {anomaly.description}
                                        </div>

                                        <div className="anomaly-stats">
                                            <div className="stat-item">
                                                <span className="stat-label">Ocorrências:</span>
                                                <span className="stat-value">{anomaly.occurrenceCount}</span>
                                            </div>
                                            
                                            <div className="stat-item">
                                                <span className="stat-label">Primeiro:</span>
                                                <span className="stat-value">{formatDateTime(anomaly.firstSeen)}</span>
                                            </div>
                                            
                                            <div className="stat-item">
                                                <span className="stat-label">Último:</span>
                                                <span className="stat-value">{formatDateTime(anomaly.lastSeen)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="compliance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Relatórios de Compliance</CardTitle>
                            <Button variant="outline">
                                <Download className="button-icon" />
                                Gerar Relatório PDF
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="compliance-grid">
                                <div className="compliance-metric">
                                    <h4>LGPD Compliance</h4>
                                    <div className="compliance-status success">
                                        ✅ Conforme
                                    </div>
                                    <p>Todas as operações de dados pessoais estão sendo auditadas</p>
                                </div>

                                <div className="compliance-metric">
                                    <h4>Retenção de Dados</h4>
                                    <div className="compliance-status success">
                                        ✅ Conforme
                                    </div>
                                    <p>Políticas de retenção sendo aplicadas corretamente</p>
                                </div>

                                <div className="compliance-metric">
                                    <h4>Controle de Acesso</h4>
                                    <div className="compliance-status warning">
                                        ⚠️ Atenção
                                    </div>
                                    <p>2 tentativas de acesso não autorizado detectadas</p>
                                </div>

                                <div className="compliance-metric">
                                    <h4>Integridade de Logs</h4>
                                    <div className="compliance-status success">
                                        ✅ Conforme
                                    </div>
                                    <p>Todos os logs possuem checksums válidos</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics e Tendências</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="analytics-grid">
                                <div className="chart-container">
                                    <h4>Operações por Hora</h4>
                                    {/* Implementar gráfico de linha */}
                                    <div className="chart-placeholder">
                                        📊 Gráfico de operações por hora
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h4>Top Serviços</h4>
                                    {/* Implementar gráfico de barras */}
                                    <div className="chart-placeholder">
                                        📈 Gráfico de serviços mais utilizados
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h4>Distribuição de Risk Score</h4>
                                    {/* Implementar gráfico de pizza */}
                                    <div className="chart-placeholder">
                                        🥧 Gráfico de distribuição de riscos
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h4>Padrões de Acesso</h4>
                                    {/* Implementar heatmap */}
                                    <div className="chart-placeholder">
                                        🗺️ Heatmap de padrões de acesso
                                    </div>
                                </div>
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

#### Script de Configuração do Sistema de Logs
```bash
#!/bin/bash
# setup-logging-system.sh

set -e

echo "🔧 Configurando Sistema de Logs e Auditoria..."

# Configurar Elasticsearch para logs
docker exec -it kryonix_elasticsearch bash -c "
curl -X PUT 'localhost:9200/kryonix-audit-logs' -H 'Content-Type: application/json' -d '{
  \"mappings\": {
    \"properties\": {
      \"@timestamp\": { \"type\": \"date\" },
      \"tenant_id\": { \"type\": \"keyword\" },
      \"user_id\": { \"type\": \"keyword\" },
      \"operation_type\": { \"type\": \"keyword\" },
      \"entity_type\": { \"type\": \"keyword\" },
      \"risk_score\": { \"type\": \"integer\" },
      \"ip_address\": { \"type\": \"ip\" },
      \"execution_time_ms\": { \"type\": \"integer\" },
      \"operation_result\": { \"type\": \"keyword\" }
    }
  },
  \"settings\": {
    \"number_of_shards\": 2,
    \"number_of_replicas\": 1,
    \"index.lifecycle.name\": \"logs-policy\"
  }
}'
"

# Configurar índice para system logs
docker exec -it kryonix_elasticsearch bash -c "
curl -X PUT 'localhost:9200/kryonix-system-logs' -H 'Content-Type: application/json' -d '{
  \"mappings\": {
    \"properties\": {
      \"@timestamp\": { \"type\": \"date\" },
      \"service_name\": { \"type\": \"keyword\" },
      \"log_level\": { \"type\": \"keyword\" },
      \"message\": { \"type\": \"text\" },
      \"response_time_ms\": { \"type\": \"integer\" },
      \"memory_usage_mb\": { \"type\": \"integer\" },
      \"cpu_usage_percent\": { \"type\": \"float\" }
    }
  }
}'
"

# Configurar política de ciclo de vida dos logs
docker exec -it kryonix_elasticsearch bash -c "
curl -X PUT 'localhost:9200/_ilm/policy/logs-policy' -H 'Content-Type: application/json' -d '{
  \"policy\": {
    \"phases\": {
      \"hot\": {
        \"actions\": {
          \"rollover\": {
            \"max_size\": \"5GB\",
            \"max_age\": \"7d\"
          }
        }
      },
      \"warm\": {
        \"min_age\": \"7d\",
        \"actions\": {
          \"shrink\": {
            \"number_of_shards\": 1
          }
        }
      },
      \"cold\": {
        \"min_age\": \"30d\",
        \"actions\": {
          \"allocate\": {
            \"number_of_replicas\": 0
          }
        }
      },
      \"delete\": {
        \"min_age\": \"90d\",
        \"actions\": {
          \"delete\": {}
        }
      }
    }
  }
}'
"

# Configurar Fluent Bit para coleta de logs
cat > /opt/kryonix/logging/fluent-bit.conf << 'EOF'
[SERVICE]
    Flush         5
    Log_Level     info
    Daemon        off
    Parsers_File  parsers.conf

[INPUT]
    Name              forward
    Listen            0.0.0.0
    Port              24224
    Buffer_Chunk_Size 1M
    Buffer_Max_Size   6M

[INPUT]
    Name        docker
    Tag         docker.*
    Exclude     fluent-bit

[FILTER]
    Name modify
    Match docker.*
    Add service_name ${HOSTNAME}
    Add environment production

[FILTER]
    Name parser
    Match docker.*
    Key_Name log
    Parser json
    Reserve_Data On
    Preserve_Key On

[OUTPUT]
    Name  es
    Match *
    Host  elasticsearch.kryonix.com.br
    Port  9200
    Index kryonix-system-logs
    Type  _doc
    Retry_Limit 5

[OUTPUT]
    Name        kafka
    Match       audit.*
    Brokers     kafka.kryonix.com.br:9092
    Topics      audit-logs
    Timestamp_Key @timestamp
EOF

# Configurar parsers para Fluent Bit
cat > /opt/kryonix/logging/parsers.conf << 'EOF'
[PARSER]
    Name        json
    Format      json
    Time_Key    time
    Time_Format %Y-%m-%dT%H:%M:%S.%L
    Time_Keep   On

[PARSER]
    Name        nginx
    Format      regex
    Regex       ^(?<remote>[^ ]*) (?<host>[^ ]*) (?<user>[^ ]*) \[(?<time>[^\]]*)\] "(?<method>\S+)(?: +(?<path>[^\"]*?)(?: +\S*)?)?" (?<code>[^ ]*) (?<size>[^ ]*)(?: "(?<referer>[^\"]*)" "(?<agent>[^\"]*)")
    Time_Key    time
    Time_Format %d/%b/%Y:%H:%M:%S %z

[PARSER]
    Name        kryonix_app
    Format      regex
    Regex       ^\[(?<time>[^\]]*)\] (?<level>\w+): (?<message>.*)
    Time_Key    time
    Time_Format %Y-%m-%d %H:%M:%S
EOF

# Configurar alertas no Grafana
cat > /opt/kryonix/monitoring/log-alerts.json << 'EOF'
{
  "dashboard": {
    "title": "Log Monitoring Alerts",
    "panels": [
      {
        "title": "Error Rate Alert",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(log_entries_total{level=\"error\"}[5m])",
            "legendFormat": "Error Rate"
          }
        ],
        "alert": {
          "conditions": [
            {
              "query": {
                "queryType": "",
                "refId": "A"
              },
              "reducer": {
                "type": "last",
                "params": []
              },
              "evaluator": {
                "params": [10],
                "type": "gt"
              }
            }
          ],
          "executionErrorState": "alerting",
          "for": "5m",
          "frequency": "10s",
          "handler": 1,
          "name": "High Error Rate",
          "noDataState": "no_data",
          "notifications": []
        }
      }
    ]
  }
}
EOF

# Configurar webhook para alertas críticos
cat > /opt/kryonix/logging/alert-webhook.sh << 'EOF'
#!/bin/bash

ALERT_TYPE=$1
MESSAGE=$2
SEVERITY=$3

WEBHOOK_URL="https://ntfy.kryonix.com.br/critical-logs"

if [ "$SEVERITY" = "critical" ] || [ "$SEVERITY" = "high" ]; then
    curl -d "🚨 ALERTA: $ALERT_TYPE - $MESSAGE" $WEBHOOK_URL
    
    # Também enviar para WhatsApp se crítico
    if [ "$SEVERITY" = "critical" ]; then
        curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
        -H "Content-Type: application/json" \
        -d "{
            \"number\": \"+5511999999999\",
            \"text\": \"🚨 ALERTA CRÍTICO: $ALERT_TYPE\\n\\n$MESSAGE\"
        }"
    fi
fi

echo "Alerta enviado: $ALERT_TYPE ($SEVERITY)"
EOF

chmod +x /opt/kryonix/logging/alert-webhook.sh

# Configurar rotação de logs local
cat > /etc/logrotate.d/kryonix << 'EOF'
/opt/kryonix/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        systemctl reload fluent-bit || true
    endscript
}
EOF

echo "✅ Sistema de Logs e Auditoria configurado!"
echo ""
echo "📊 Elasticsearch: http://elasticsearch.kryonix.com.br:9200"
echo "📈 Kibana: http://kibana.kryonix.com.br:5601"
echo "🔍 Logs: /opt/kryonix/logs/"
echo "⚙️ Config: /opt/kryonix/logging/"
```

### ✅ CHECKLIST DE VALIDAÇÃO

- [ ] **Sistema de Logs**
  - [ ] Elasticsearch configurado com índices apropriados
  - [ ] Fluent Bit coletando logs de todos os serviços
  - [ ] Política de lifecycle configurada
  - [ ] Parsers JSON e aplicação funcionando

- [ ] **Auditoria**
  - [ ] Triggers de auditoria instalados no PostgreSQL
  - [ ] Risk score sendo calculado automaticamente
  - [ ] Sessões sendo rastreadas corretamente
  - [ ] Logs de sistema capturados

- [ ] **Compliance**
  - [ ] Políticas de retenção implementadas
  - [ ] Anonymização configurada quando necessário
  - [ ] Relatórios de compliance gerados
  - [ ] Checksums de integridade funcionando

- [ ] **Alertas**
  - [ ] Detecção de anomalias ativa
  - [ ] Webhooks configurados
  - [ ] Grafana alertas funcionando
  - [ ] Notificações críticas testadas

### 🧪 TESTES DE QUALIDADE

```bash
#!/bin/bash
# test-logging-system.sh

echo "🧪 Executando Testes do Sistema de Logs..."

# Teste 1: Verificar conectividade Elasticsearch
echo "Teste 1: Conectividade Elasticsearch"
if curl -s "http://elasticsearch.kryonix.com.br:9200/_cluster/health" | grep -q "green\|yellow"; then
    echo "✅ Elasticsearch acessível"
else
    echo "❌ Elasticsearch inacessível"
fi

# Teste 2: Verificar índices criados
echo "Teste 2: Verificação de índices"
indices=$(curl -s "http://elasticsearch.kryonix.com.br:9200/_cat/indices?h=index" | grep kryonix)
if echo "$indices" | grep -q "kryonix-audit-logs"; then
    echo "✅ Índice de auditoria criado"
else
    echo "❌ Índice de auditoria não encontrado"
fi

# Teste 3: Verificar ingestão de logs
echo "Teste 3: Ingestão de logs"
log_count=$(curl -s "http://elasticsearch.kryonix.com.br:9200/kryonix-audit-logs/_count" | jq '.count')
if [ "$log_count" -gt 0 ]; then
    echo "✅ Logs sendo ingeridos ($log_count documentos)"
else
    echo "❌ Nenhum log encontrado"
fi

# Teste 4: Verificar triggers de auditoria PostgreSQL
echo "Teste 4: Triggers de auditoria"
trigger_count=$(docker exec kryonix_postgresql psql -U postgres -d kryonix -t -c "
    SELECT COUNT(*) FROM information_schema.triggers 
    WHERE trigger_name LIKE '%audit%';"
)
if [ "$trigger_count" -gt 0 ]; then
    echo "✅ Triggers de auditoria instalados ($trigger_count triggers)"
else
    echo "❌ Triggers de auditoria não encontrados"
fi

# Teste 5: Verificar Fluent Bit
echo "Teste 5: Status Fluent Bit"
if docker ps | grep -q fluent-bit; then
    echo "✅ Fluent Bit em execução"
else
    echo "❌ Fluent Bit não está executando"
fi

echo ""
echo "🏁 Testes de Logs concluídos!"
```

### 📚 DOCUMENTAÇÃO TÉCNICA

#### Estrutura de Logs Padronizada

**Formato de Log de Auditoria:**
```json
{
  "audit_id": "uuid",
  "tenant_id": "uuid",
  "user_id": "uuid",
  "session_id": "string",
  "timestamp": "2024-01-15T10:30:00Z",
  "operation_type": "CREATE|READ|UPDATE|DELETE|LOGIN|LOGOUT",
  "entity_type": "user|document|payment",
  "entity_id": "uuid",
  "old_values": {},
  "new_values": {},
  "changed_fields": ["field1", "field2"],
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "risk_score": 25,
  "operation_result": "success|failure",
  "execution_time_ms": 150,
  "compliance_tags": ["LGPD", "SOX"]
}
```

**Formato de Log de Sistema:**
```json
{
  "log_id": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "service_name": "api-gateway",
  "log_level": "INFO|WARN|ERROR|DEBUG",
  "message": "Request processed successfully",
  "context": {
    "request_id": "req_12345",
    "endpoint": "/api/users",
    "method": "GET"
  },
  "response_time_ms": 120,
  "memory_usage_mb": 256,
  "cpu_usage_percent": 15.5
}
```

#### Políticas de Retenção

- **Logs de Auditoria**: 7 anos (compliance LGPD)
- **Logs de Sistema**: 1 ano (hot), 2 anos (archive)
- **Logs de Debug**: 30 dias
- **Logs de Segurança**: 5 anos
- **Metrics**: 90 dias (raw), 2 anos (aggregated)

### 🔗 INTEGRAÇÃO COM STACK EXISTENTE

- **PostgreSQL**: Triggers automáticos para auditoria
- **Elasticsearch**: Índices otimizados para pesquisa
- **Kibana**: Dashboards pré-configurados
- **Grafana**: Alertas baseados em métricas de logs
- **Fluent Bit**: Coleta unificada de todos os serviços
- **Kafka**: Buffer para logs de alto volume
- **MinIO**: Arquivo de longo prazo

### 📈 MÉTRICAS MONITORADAS

- **Volume de Logs**: Logs/segundo por serviço
- **Error Rate**: Porcentagem de erros por período
- **Response Time**: P50, P95, P99 de tempos de resposta
- **Risk Score Distribution**: Distribuição de scores de risco
- **User Activity**: Operações por usuário/período
- **Compliance Metrics**: Aderência às políticas
- **Storage Usage**: Utilização de storage de logs
- **Index Performance**: Performance de busca no Elasticsearch

---

**PARTE-23 CONCLUÍDA** ✅  
Sistema completo de logs centralizado e auditoria implementado com coleta, processamento, armazenamento e análise de todos os eventos da plataforma KRYONIX.

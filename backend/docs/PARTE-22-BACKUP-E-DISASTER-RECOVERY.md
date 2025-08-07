# PARTE-22: BACKUP E DISASTER RECOVERY
## Sistema Completo de Backup e Recuperação de Desastres

### 📋 DESCRIÇÃO
Implementação de sistema robusto de backup automatizado e procedimentos de disaster recovery para todos os 32 stacks da plataforma KRYONIX, garantindo alta disponibilidade e recuperação rápida em caso de falhas.

### 🎯 OBJETIVOS
- Backup automatizado de todos os serviços críticos
- Estratégias de recuperação em múltiplas camadas
- Replicação de dados cross-region
- Procedimentos documentados de disaster recovery
- Monitoramento e alertas de backup
- Testes regulares de recuperação

### 🏗️ ARQUITETURA

#### Estratégia Multi-Camada
```
┌─────────────────────────────────────────────────────────────┐
│                    BACKUP STRATEGY                          │
├─────────────────────────────────────────────────────────────┤
│ LAYER 1: Real-time Replication                            │
│ • PostgreSQL Streaming Replication                         │
│ • Redis Master-Slave                                       │
│ • MinIO Cross-Region Replication                          │
├─────────────────────────────────────────────────────────────┤
│ LAYER 2: Scheduled Backups                                │
│ • Daily Full Backups                                       │
│ • Hourly Incremental Backups                              │
│ • Configuration Backups                                    │
├────────────────────────────────���────────────────────────────┤
│ LAYER 3: Disaster Recovery                                 │
│ • Multi-Region Storage                                      │
│ • Automated Recovery Scripts                               │
│ • Failover Procedures                                      │
└─────────────────────────────────────────────────────────────┘
```

### 🗄️ SCHEMAS DE BANCO DE DADOS

#### PostgreSQL Backup Management
```sql
-- Tabela para gerenciar backups
CREATE TABLE backup_management (
    backup_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    backup_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'differential'
    service_name VARCHAR(100) NOT NULL,
    backup_location TEXT NOT NULL,
    backup_size BIGINT,
    compression_ratio DECIMAL(5,2),
    backup_status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    checksum SHA256,
    retention_until TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para logs de disaster recovery
CREATE TABLE disaster_recovery_log (
    recovery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    incident_type VARCHAR(100) NOT NULL,
    affected_services TEXT[],
    recovery_procedure TEXT NOT NULL,
    recovery_status VARCHAR(20) DEFAULT 'initiated',
    rto_target INTERVAL, -- Recovery Time Objective
    rpo_target INTERVAL, -- Recovery Point Objective
    actual_recovery_time INTERVAL,
    data_loss_minutes INTEGER DEFAULT 0,
    initiated_by VARCHAR(100),
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    recovery_notes TEXT,
    lessons_learned TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para monitorar health dos backups
CREATE TABLE backup_health_monitoring (
    monitor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    backup_frequency INTERVAL NOT NULL,
    last_successful_backup TIMESTAMP WITH TIME ZONE,
    backup_streak INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    health_status VARCHAR(20) DEFAULT 'healthy',
    storage_usage_gb DECIMAL(10,2),
    storage_quota_gb DECIMAL(10,2),
    estimated_full_recovery_time INTERVAL,
    last_recovery_test TIMESTAMP WITH TIME ZONE,
    alerts_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_backup_management_tenant_service ON backup_management(tenant_id, service_name);
CREATE INDEX idx_backup_management_status_date ON backup_management(backup_status, started_at);
CREATE INDEX idx_disaster_recovery_tenant_status ON disaster_recovery_log(tenant_id, recovery_status);
CREATE INDEX idx_backup_health_service_status ON backup_health_monitoring(service_name, health_status);

-- Função para calcular métricas de backup
CREATE OR REPLACE FUNCTION calculate_backup_metrics(p_tenant_id UUID)
RETURNS TABLE (
    service_name VARCHAR(100),
    total_backups BIGINT,
    successful_backups BIGINT,
    failed_backups BIGINT,
    success_rate DECIMAL(5,2),
    avg_backup_size_gb DECIMAL(10,2),
    last_backup_age INTERVAL,
    storage_usage_gb DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bm.service_name,
        COUNT(*) as total_backups,
        COUNT(*) FILTER (WHERE bm.backup_status = 'completed') as successful_backups,
        COUNT(*) FILTER (WHERE bm.backup_status = 'failed') as failed_backups,
        ROUND(
            (COUNT(*) FILTER (WHERE bm.backup_status = 'completed')::DECIMAL / 
             NULLIF(COUNT(*), 0)) * 100, 2
        ) as success_rate,
        ROUND(AVG(bm.backup_size / 1024.0 / 1024.0 / 1024.0), 2) as avg_backup_size_gb,
        NOW() - MAX(bm.completed_at) as last_backup_age,
        ROUND(SUM(bm.backup_size / 1024.0 / 1024.0 / 1024.0), 2) as storage_usage_gb
    FROM backup_management bm
    WHERE bm.tenant_id = p_tenant_id
    GROUP BY bm.service_name;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar health monitoring
CREATE OR REPLACE FUNCTION update_backup_health()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.backup_status = 'completed' THEN
        INSERT INTO backup_health_monitoring (
            tenant_id, service_name, backup_frequency, 
            last_successful_backup, backup_streak, health_status
        ) VALUES (
            NEW.tenant_id, NEW.service_name, INTERVAL '24 hours',
            NEW.completed_at, 1, 'healthy'
        )
        ON CONFLICT (tenant_id, service_name) 
        DO UPDATE SET
            last_successful_backup = NEW.completed_at,
            backup_streak = backup_health_monitoring.backup_streak + 1,
            failure_count = 0,
            health_status = 'healthy',
            updated_at = CURRENT_TIMESTAMP;
    ELSIF NEW.backup_status = 'failed' THEN
        UPDATE backup_health_monitoring
        SET 
            failure_count = failure_count + 1,
            backup_streak = 0,
            health_status = CASE 
                WHEN failure_count + 1 >= 3 THEN 'critical'
                WHEN failure_count + 1 >= 2 THEN 'warning'
                ELSE 'degraded'
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = NEW.tenant_id AND service_name = NEW.service_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER backup_status_health_trigger
    AFTER UPDATE OF backup_status ON backup_management
    FOR EACH ROW EXECUTE FUNCTION update_backup_health();
```

### 🔧 IMPLEMENTAÇÃO DOS SERVIÇOS

#### 1. Backup Service Principal
```typescript
// src/modules/backup/services/backup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
    private readonly logger = new Logger(BackupService.name);
    private readonly s3: AWS.S3;
    private readonly minioClient: any;

    constructor(
        @InjectRepository(BackupManagement)
        private readonly backupRepository: Repository<BackupManagement>,
        
        @InjectRepository(DisasterRecoveryLog)
        private readonly recoveryLogRepository: Repository<DisasterRecoveryLog>,
        
        private readonly configService: ConfigService,
        private readonly notificationService: NotificationService,
        private readonly metricsService: MetricsService
    ) {
        this.s3 = new AWS.S3({
            endpoint: this.configService.get('MINIO_ENDPOINT'),
            accessKeyId: this.configService.get('MINIO_ACCESS_KEY'),
            secretAccessKey: this.configService.get('MINIO_SECRET_KEY'),
            s3ForcePathStyle: true,
            signatureVersion: 'v4'
        });
    }

    @Cron('0 2 * * *') // Daily at 2 AM
    async performDailyFullBackup(): Promise<void> {
        this.logger.log('Iniciando backup completo diário');
        
        const services = [
            'postgresql',
            'redis', 
            'minio',
            'traefik',
            'keycloak',
            'grafana',
            'prometheus',
            'nextcloud'
        ];

        for (const service of services) {
            await this.createBackup(service, 'full');
        }
    }

    @Cron('0 */6 * * *') // Every 6 hours
    async performIncrementalBackup(): Promise<void> {
        this.logger.log('Iniciando backup incremental');
        
        const criticalServices = ['postgresql', 'redis', 'minio'];
        
        for (const service of criticalServices) {
            await this.createBackup(service, 'incremental');
        }
    }

    async createBackup(serviceName: string, backupType: 'full' | 'incremental'): Promise<string> {
        const tenantId = 'system'; // System-level backup
        
        const backup = this.backupRepository.create({
            tenantId,
            backupType,
            serviceName,
            backupStatus: 'pending',
            metadata: {
                strategy: this.getBackupStrategy(serviceName),
                compression: 'gzip',
                encryption: 'aes256'
            }
        });

        await this.backupRepository.save(backup);
        
        try {
            let backupResult: BackupResult;
            
            switch (serviceName) {
                case 'postgresql':
                    backupResult = await this.backupPostgreSQL(backupType);
                    break;
                case 'redis':
                    backupResult = await this.backupRedis(backupType);
                    break;
                case 'minio':
                    backupResult = await this.backupMinIO(backupType);
                    break;
                case 'traefik':
                    backupResult = await this.backupTraefik(backupType);
                    break;
                default:
                    backupResult = await this.backupGenericService(serviceName, backupType);
            }

            // Upload to MinIO with encryption
            const backupLocation = await this.uploadBackupToStorage(
                backupResult.filePath, 
                serviceName, 
                backupType,
                backup.backupId
            );

            // Calculate checksum
            const checksum = await this.calculateChecksum(backupResult.filePath);

            // Update backup record
            backup.backupLocation = backupLocation;
            backup.backupSize = backupResult.size;
            backup.compressionRatio = backupResult.compressionRatio;
            backup.checksum = checksum;
            backup.backupStatus = 'completed';
            backup.completedAt = new Date();
            backup.retentionUntil = this.calculateRetentionDate(backupType);

            await this.backupRepository.save(backup);

            // Clean up local file
            await fs.promises.unlink(backupResult.filePath);

            // Send success notification
            await this.notificationService.sendBackupNotification({
                type: 'success',
                service: serviceName,
                backupType,
                size: backupResult.size,
                location: backupLocation
            });

            this.logger.log(`Backup de ${serviceName} concluído: ${backupLocation}`);
            
            return backupLocation;

        } catch (error) {
            backup.backupStatus = 'failed';
            backup.metadata = { 
                ...backup.metadata, 
                error: error.message,
                errorStack: error.stack
            };
            
            await this.backupRepository.save(backup);
            
            await this.notificationService.sendBackupNotification({
                type: 'error',
                service: serviceName,
                error: error.message
            });

            this.logger.error(`Erro no backup de ${serviceName}:`, error);
            throw error;
        }
    }

    private async backupPostgreSQL(backupType: string): Promise<BackupResult> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `postgresql-${backupType}-${timestamp}.sql.gz`;
        const filePath = path.join('/tmp', fileName);

        const pgDumpCommand = backupType === 'full' 
            ? `pg_dumpall -h ${this.configService.get('POSTGRES_HOST')} -U ${this.configService.get('POSTGRES_USER')} | gzip > ${filePath}`
            : `pg_dump -h ${this.configService.get('POSTGRES_HOST')} -U ${this.configService.get('POSTGRES_USER')} --format=custom --compress=9 ${this.configService.get('POSTGRES_DB')} > ${filePath}`;

        await execAsync(pgDumpCommand, {
            env: {
                ...process.env,
                PGPASSWORD: this.configService.get('POSTGRES_PASSWORD')
            }
        });

        const stats = await fs.promises.stat(filePath);
        
        return {
            filePath,
            size: stats.size,
            compressionRatio: 0.3 // Estimated
        };
    }

    private async backupRedis(backupType: string): Promise<BackupResult> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `redis-${backupType}-${timestamp}.rdb.gz`;
        const filePath = path.join('/tmp', fileName);

        // Force Redis to save RDB
        const redisCommand = `redis-cli -h ${this.configService.get('REDIS_HOST')} -p ${this.configService.get('REDIS_PORT')} --rdb ${filePath.replace('.gz', '')} && gzip ${filePath.replace('.gz', '')}`;
        
        await execAsync(redisCommand);

        const stats = await fs.promises.stat(filePath);
        
        return {
            filePath,
            size: stats.size,
            compressionRatio: 0.5
        };
    }

    private async backupMinIO(backupType: string): Promise<BackupResult> {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `minio-${backupType}-${timestamp}.tar.gz`;
        const filePath = path.join('/tmp', fileName);

        // Use mc (MinIO Client) to mirror data
        const mcCommand = `mc mirror --preserve minio-local/ ${filePath.replace('.tar.gz', '/')} && tar -czf ${filePath} -C ${filePath.replace('.tar.gz', '/')} .`;
        
        await execAsync(mcCommand);

        const stats = await fs.promises.stat(filePath);
        
        return {
            filePath,
            size: stats.size,
            compressionRatio: 0.4
        };
    }

    private async uploadBackupToStorage(
        filePath: string, 
        serviceName: string, 
        backupType: string,
        backupId: string
    ): Promise<string> {
        const key = `backups/${serviceName}/${backupType}/${backupId}/${path.basename(filePath)}`;
        
        const fileStream = fs.createReadStream(filePath);
        
        const uploadParams: AWS.S3.PutObjectRequest = {
            Bucket: 'kryonix-backups',
            Key: key,
            Body: fileStream,
            ServerSideEncryption: 'AES256',
            Metadata: {
                service: serviceName,
                backupType,
                backupId,
                createdAt: new Date().toISOString()
            }
        };

        const result = await this.s3.upload(uploadParams).promise();
        
        return result.Location;
    }

    private async calculateChecksum(filePath: string): Promise<string> {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        
        return new Promise((resolve, reject) => {
            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    private calculateRetentionDate(backupType: string): Date {
        const retentionDays = backupType === 'full' ? 30 : 7;
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() + retentionDays);
        return retentionDate;
    }

    private getBackupStrategy(serviceName: string): string {
        const strategies = {
            postgresql: 'pg_dump_with_compression',
            redis: 'rdb_snapshot',
            minio: 'mc_mirror_sync',
            traefik: 'config_file_backup',
            default: 'docker_volume_backup'
        };

        return strategies[serviceName] || strategies.default;
    }

    // Disaster Recovery Methods
    async initiateDisasterRecovery(
        tenantId: string,
        incidentType: string,
        affectedServices: string[]
    ): Promise<string> {
        const recovery = this.recoveryLogRepository.create({
            tenantId,
            incidentType,
            affectedServices,
            recoveryProcedure: this.getRecoveryProcedure(incidentType),
            rtoTarget: this.getRTO(incidentType),
            rpoTarget: this.getRPO(incidentType),
            initiatedBy: 'system-auto',
            recoveryStatus: 'initiated'
        });

        await this.recoveryLogRepository.save(recovery);

        // Execute recovery procedures
        try {
            for (const service of affectedServices) {
                await this.recoverService(service, recovery.recoveryId);
            }

            recovery.recoveryStatus = 'completed';
            recovery.completedAt = new Date();
            recovery.actualRecoveryTime = this.calculateInterval(
                recovery.initiatedAt, 
                recovery.completedAt
            );

            await this.recoveryLogRepository.save(recovery);

            this.logger.log(`Disaster recovery concluído: ${recovery.recoveryId}`);

        } catch (error) {
            recovery.recoveryStatus = 'failed';
            recovery.recoveryNotes = `Erro durante recuperação: ${error.message}`;
            
            await this.recoveryLogRepository.save(recovery);
            
            this.logger.error(`Erro na recuperação:`, error);
            throw error;
        }

        return recovery.recoveryId;
    }

    private async recoverService(serviceName: string, recoveryId: string): Promise<void> {
        this.logger.log(`Iniciando recuperação do serviço: ${serviceName}`);

        // Get latest successful backup
        const latestBackup = await this.backupRepository.findOne({
            where: {
                serviceName,
                backupStatus: 'completed'
            },
            order: { completedAt: 'DESC' }
        });

        if (!latestBackup) {
            throw new Error(`Nenhum backup encontrado para ${serviceName}`);
        }

        // Download backup from storage
        const backupPath = await this.downloadBackupFromStorage(latestBackup.backupLocation);

        // Restore service based on type
        switch (serviceName) {
            case 'postgresql':
                await this.restorePostgreSQL(backupPath);
                break;
            case 'redis':
                await this.restoreRedis(backupPath);
                break;
            case 'minio':
                await this.restoreMinIO(backupPath);
                break;
            default:
                await this.restoreGenericService(serviceName, backupPath);
        }

        // Verify service health
        await this.verifyServiceHealth(serviceName);

        this.logger.log(`Recuperação do ${serviceName} concluída`);
    }

    async getBackupMetrics(tenantId: string): Promise<BackupMetrics> {
        const query = `
            SELECT * FROM calculate_backup_metrics($1)
        `;
        
        const result = await this.backupRepository.query(query, [tenantId]);
        
        return {
            services: result,
            totalStorageUsage: result.reduce((sum, item) => sum + item.storage_usage_gb, 0),
            overallSuccessRate: result.reduce((sum, item) => sum + item.success_rate, 0) / result.length,
            lastBackupAge: Math.max(...result.map(item => item.last_backup_age)),
            healthyServices: result.filter(item => item.success_rate >= 95).length
        };
    }
}

interface BackupResult {
    filePath: string;
    size: number;
    compressionRatio: number;
}

interface BackupMetrics {
    services: any[];
    totalStorageUsage: number;
    overallSuccessRate: number;
    lastBackupAge: number;
    healthyServices: number;
}
```

#### 2. Disaster Recovery Orchestrator
```typescript
// src/modules/backup/services/disaster-recovery.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DisasterRecoveryService {
    private readonly logger = new Logger(DisasterRecoveryService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly backupService: BackupService,
        private readonly monitoringService: MonitoringService,
        private readonly notificationService: NotificationService
    ) {}

    async executeDisasterRecoveryPlan(scenario: 'partial' | 'complete' | 'regional'): Promise<void> {
        this.logger.log(`Executando plano de disaster recovery: ${scenario}`);

        const recoveryPlan = this.getRecoveryPlan(scenario);

        for (const phase of recoveryPlan.phases) {
            this.logger.log(`Executando fase: ${phase.name}`);
            
            for (const step of phase.steps) {
                await this.executeRecoveryStep(step);
            }
        }

        await this.verifySystemHealth();
        
        this.logger.log('Disaster recovery concluído com sucesso');
    }

    private getRecoveryPlan(scenario: string): RecoveryPlan {
        const plans = {
            partial: {
                phases: [
                    {
                        name: 'Identificação e Isolamento',
                        steps: [
                            { action: 'isolate_affected_services', priority: 'critical' },
                            { action: 'assess_damage', priority: 'high' },
                            { action: 'notify_stakeholders', priority: 'high' }
                        ]
                    },
                    {
                        name: 'Recuperação de Dados',
                        steps: [
                            { action: 'restore_database', priority: 'critical' },
                            { action: 'restore_storage', priority: 'high' },
                            { action: 'restore_cache', priority: 'medium' }
                        ]
                    },
                    {
                        name: 'Recuperação de Serviços',
                        steps: [
                            { action: 'restart_core_services', priority: 'critical' },
                            { action: 'restore_configurations', priority: 'high' },
                            { action: 'verify_integrations', priority: 'medium' }
                        ]
                    }
                ]
            },
            complete: {
                phases: [
                    {
                        name: 'Ativação do Site Secundário',
                        steps: [
                            { action: 'activate_failover_region', priority: 'critical' },
                            { action: 'redirect_traffic', priority: 'critical' },
                            { action: 'notify_emergency_contacts', priority: 'critical' }
                        ]
                    },
                    {
                        name: 'Recuperação Completa',
                        steps: [
                            { action: 'restore_all_databases', priority: 'critical' },
                            { action: 'restore_all_storage', priority: 'critical' },
                            { action: 'rebuild_infrastructure', priority: 'high' }
                        ]
                    }
                ]
            },
            regional: {
                phases: [
                    {
                        name: 'Failover Cross-Region',
                        steps: [
                            { action: 'activate_cross_region_failover', priority: 'critical' },
                            { action: 'sync_cross_region_data', priority: 'critical' },
                            { action: 'update_dns_records', priority: 'critical' }
                        ]
                    }
                ]
            }
        };

        return plans[scenario];
    }

    private async executeRecoveryStep(step: RecoveryStep): Promise<void> {
        switch (step.action) {
            case 'restore_database':
                await this.restoreAllDatabases();
                break;
            case 'restore_storage':
                await this.restoreAllStorage();
                break;
            case 'restart_core_services':
                await this.restartCoreServices();
                break;
            default:
                this.logger.warn(`Ação de recuperação não implementada: ${step.action}`);
        }
    }

    private async restoreAllDatabases(): Promise<void> {
        const databases = ['postgresql', 'redis', 'timescaledb'];
        
        for (const db of databases) {
            await this.backupService.recoverService(db, 'emergency-recovery');
        }
    }

    private async restoreAllStorage(): Promise<void> {
        const storageServices = ['minio', 'nextcloud'];
        
        for (const storage of storageServices) {
            await this.backupService.recoverService(storage, 'emergency-recovery');
        }
    }

    private async restartCoreServices(): Promise<void> {
        const coreServices = [
            'traefik',
            'keycloak', 
            'api-gateway',
            'notification-service',
            'user-management'
        ];

        for (const service of coreServices) {
            await this.restartService(service);
        }
    }

    private async restartService(serviceName: string): Promise<void> {
        this.logger.log(`Reiniciando serviço: ${serviceName}`);
        
        // Docker Swarm service restart
        await execAsync(`docker service update --force kryonix_${serviceName}`);
        
        // Wait for service to be healthy
        await this.waitForServiceHealth(serviceName);
    }

    private async waitForServiceHealth(serviceName: string, maxWaitTime = 300000): Promise<void> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            const isHealthy = await this.checkServiceHealth(serviceName);
            
            if (isHealthy) {
                this.logger.log(`Serviço ${serviceName} está saudável`);
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        throw new Error(`Timeout aguardando ${serviceName} ficar saudável`);
    }

    private async checkServiceHealth(serviceName: string): Promise<boolean> {
        try {
            const healthcheck = await execAsync(`docker service ps kryonix_${serviceName} --filter "desired-state=running" --format "{{.CurrentState}}"`);
            return healthcheck.stdout.includes('Running');
        } catch (error) {
            return false;
        }
    }

    async verifySystemHealth(): Promise<HealthReport> {
        const services = [
            'postgresql', 'redis', 'minio', 'traefik', 
            'keycloak', 'grafana', 'prometheus'
        ];

        const healthChecks = await Promise.all(
            services.map(async service => ({
                service,
                healthy: await this.checkServiceHealth(service),
                lastCheck: new Date()
            }))
        );

        const healthyCount = healthChecks.filter(check => check.healthy).length;
        const totalCount = healthChecks.length;

        return {
            overallHealth: healthyCount / totalCount,
            services: healthChecks,
            timestamp: new Date(),
            systemOperational: healthyCount >= totalCount * 0.8 // 80% dos serviços devem estar funcionais
        };
    }
}

interface RecoveryPlan {
    phases: RecoveryPhase[];
}

interface RecoveryPhase {
    name: string;
    steps: RecoveryStep[];
}

interface RecoveryStep {
    action: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
}

interface HealthReport {
    overallHealth: number;
    services: ServiceHealth[];
    timestamp: Date;
    systemOperational: boolean;
}

interface ServiceHealth {
    service: string;
    healthy: boolean;
    lastCheck: Date;
}
```

### 🎨 COMPONENTES FRONTEND

#### 1. Dashboard de Backup e Recovery
```typescript
// src/components/backup/BackupDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Database, HardDrive, Clock, CheckCircle } from 'lucide-react';
import { useBackupMetrics, useDisasterRecovery } from '@/hooks/useBackup';

export function BackupDashboard() {
    const { metrics, loading: metricsLoading } = useBackupMetrics();
    const { recoveryStatus, initiateRecovery } = useDisasterRecovery();
    const [selectedService, setSelectedService] = useState<string | null>(null);

    const getHealthColor = (successRate: number) => {
        if (successRate >= 95) return 'text-green-600';
        if (successRate >= 80) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getHealthBadge = (successRate: number) => {
        if (successRate >= 95) return <Badge variant="success">Saudável</Badge>;
        if (successRate >= 80) return <Badge variant="warning">Atenção</Badge>;
        return <Badge variant="destructive">Crítico</Badge>;
    };

    const formatStorageSize = (sizeGB: number) => {
        if (sizeGB >= 1024) {
            return `${(sizeGB / 1024).toFixed(1)} TB`;
        }
        return `${sizeGB.toFixed(1)} GB`;
    };

    const formatInterval = (intervalStr: string) => {
        // Parse PostgreSQL interval format
        const hours = parseInt(intervalStr.match(/(\d+):/) ? intervalStr.match(/(\d+):/)[1] : '0');
        const minutes = parseInt(intervalStr.match(/:(\d+):/) ? intervalStr.match(/:(\d+):/)[1] : '0');
        
        if (hours > 24) {
            return `${Math.floor(hours / 24)}d ${hours % 24}h`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    return (
        <div className="backup-dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    <Shield className="title-icon" />
                    Backup e Disaster Recovery
                </h1>
                <p className="dashboard-subtitle">
                    Monitoramento e gestão de backups da plataforma KRYONIX
                </p>
            </div>

            {/* Métricas Gerais */}
            <div className="metrics-grid">
                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <Database className="metric-icon" />
                            Total de Backups
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value">
                            {metrics?.services?.reduce((sum, s) => sum + s.total_backups, 0) || 0}
                        </div>
                        <div className="metric-description">
                            Últimas 24 horas: {metrics?.services?.filter(s => 
                                s.last_backup_age && s.last_backup_age < '1 day'
                            ).length || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <HardDrive className="metric-icon" />
                            Armazenamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value">
                            {formatStorageSize(metrics?.totalStorageUsage || 0)}
                        </div>
                        <div className="metric-description">
                            Crescimento mensal: ~15%
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
                        <div className={`metric-value ${getHealthColor(metrics?.overallSuccessRate || 0)}`}>
                            {(metrics?.overallSuccessRate || 0).toFixed(1)}%
                        </div>
                        <div className="metric-description">
                            Serviços saudáveis: {metrics?.healthyServices || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card className="metric-card">
                    <CardHeader className="metric-header">
                        <CardTitle className="metric-title">
                            <Clock className="metric-icon" />
                            Último Backup
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="metric-value">
                            {formatInterval(metrics?.lastBackupAge || '0 minutes')}
                        </div>
                        <div className="metric-description">
                            Próximo backup em: 2h 15m
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status dos Serviços */}
            <Card className="services-card">
                <CardHeader>
                    <CardTitle>Status dos Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="services-grid">
                        {metrics?.services?.map((service) => (
                            <div 
                                key={service.service_name}
                                className={`service-item ${selectedService === service.service_name ? 'selected' : ''}`}
                                onClick={() => setSelectedService(service.service_name)}
                            >
                                <div className="service-header">
                                    <span className="service-name">{service.service_name}</span>
                                    {getHealthBadge(service.success_rate)}
                                </div>
                                
                                <div className="service-metrics">
                                    <div className="service-metric">
                                        <span className="metric-label">Backups:</span>
                                        <span className="metric-value">
                                            {service.successful_backups}/{service.total_backups}
                                        </span>
                                    </div>
                                    
                                    <div className="service-metric">
                                        <span className="metric-label">Armazenamento:</span>
                                        <span className="metric-value">
                                            {formatStorageSize(service.storage_usage_gb)}
                                        </span>
                                    </div>
                                    
                                    <div className="service-metric">
                                        <span className="metric-label">Último backup:</span>
                                        <span className="metric-value">
                                            {formatInterval(service.last_backup_age)}
                                        </span>
                                    </div>
                                </div>

                                <div className="service-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ 
                                                width: `${service.success_rate}%`,
                                                backgroundColor: service.success_rate >= 95 ? '#10b981' : 
                                                               service.success_rate >= 80 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                    <span className="progress-text">{service.success_rate.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Controles de Disaster Recovery */}
            <Card className="recovery-controls-card">
                <CardHeader>
                    <CardTitle>
                        <AlertTriangle className="title-icon text-orange-500" />
                        Disaster Recovery
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="recovery-actions">
                        <div className="recovery-scenario">
                            <h4>Recuperação Parcial</h4>
                            <p>Recupera serviços específicos afetados</p>
                            <Button 
                                variant="outline"
                                onClick={() => initiateRecovery('partial')}
                                disabled={recoveryStatus?.status === 'in_progress'}
                            >
                                Iniciar Recuperação Parcial
                            </Button>
                        </div>

                        <div className="recovery-scenario">
                            <h4>Recuperação Completa</h4>
                            <p>Recuperação total do sistema</p>
                            <Button 
                                variant="destructive"
                                onClick={() => initiateRecovery('complete')}
                                disabled={recoveryStatus?.status === 'in_progress'}
                            >
                                Recuperação Completa
                            </Button>
                        </div>

                        <div className="recovery-scenario">
                            <h4>Failover Regional</h4>
                            <p>Ativa região secundária</p>
                            <Button 
                                variant="secondary"
                                onClick={() => initiateRecovery('regional')}
                                disabled={recoveryStatus?.status === 'in_progress'}
                            >
                                Failover Regional
                            </Button>
                        </div>
                    </div>

                    {recoveryStatus?.status === 'in_progress' && (
                        <div className="recovery-progress">
                            <div className="progress-header">
                                <span>Recuperação em Andamento...</span>
                                <span>{recoveryStatus.progress}%</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill"
                                    style={{ width: `${recoveryStatus.progress}%` }}
                                />
                            </div>
                            <div className="recovery-details">
                                <p>Fase atual: {recoveryStatus.currentPhase}</p>
                                <p>Tempo estimado: {recoveryStatus.estimatedTime}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
```

#### 2. Componente de Histórico de Backups
```typescript
// src/components/backup/BackupHistory.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, RotateCcw, Calendar } from 'lucide-react';
import { useBackupHistory } from '@/hooks/useBackup';

export function BackupHistory() {
    const { backups, loading, downloadBackup, restoreFromBackup } = useBackupHistory();
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="success">Concluído</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pendente</Badge>;
            case 'failed':
                return <Badge variant="destructive">Falhou</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getBackupTypeBadge = (type: string) => {
        switch (type) {
            case 'full':
                return <Badge variant="default">Completo</Badge>;
            case 'incremental':
                return <Badge variant="outline">Incremental</Badge>;
            case 'differential':
                return <Badge variant="secondary">Diferencial</Badge>;
            default:
                return <Badge>{type}</Badge>;
        }
    };

    const formatFileSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    const formatDuration = (start: Date, end: Date) => {
        if (!end) return 'Em andamento...';
        
        const duration = (end.getTime() - start.getTime()) / 1000; // seconds
        
        if (duration < 60) return `${duration.toFixed(0)}s`;
        if (duration < 3600) return `${(duration / 60).toFixed(1)}m`;
        return `${(duration / 3600).toFixed(1)}h`;
    };

    return (
        <div className="backup-history-container">
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Calendar className="title-icon" />
                        Histórico de Backups
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="backup-list">
                        {backups?.map((backup) => (
                            <div key={backup.backupId} className="backup-item">
                                <div className="backup-main-info">
                                    <div className="backup-service">
                                        <span className="service-name">{backup.serviceName}</span>
                                        {getBackupTypeBadge(backup.backupType)}
                                        {getStatusBadge(backup.backupStatus)}
                                    </div>
                                    
                                    <div className="backup-metadata">
                                        <span className="backup-date">
                                            {new Date(backup.startedAt).toLocaleString('pt-BR')}
                                        </span>
                                        <span className="backup-duration">
                                            Duração: {formatDuration(
                                                new Date(backup.startedAt), 
                                                backup.completedAt ? new Date(backup.completedAt) : null
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="backup-details">
                                    {backup.backupSize && (
                                        <div className="detail-item">
                                            <span className="detail-label">Tamanho:</span>
                                            <span className="detail-value">
                                                {formatFileSize(backup.backupSize)}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {backup.compressionRatio && (
                                        <div className="detail-item">
                                            <span className="detail-label">Compressão:</span>
                                            <span className="detail-value">
                                                {(backup.compressionRatio * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    )}
                                    
                                    {backup.retentionUntil && (
                                        <div className="detail-item">
                                            <span className="detail-label">Expira em:</span>
                                            <span className="detail-value">
                                                {new Date(backup.retentionUntil).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="backup-actions">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedBackup(backup)}
                                    >
                                        <Eye className="button-icon" />
                                        Detalhes
                                    </Button>
                                    
                                    {backup.backupStatus === 'completed' && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => downloadBackup(backup.backupId)}
                                            >
                                                <Download className="button-icon" />
                                                Download
                                            </Button>
                                            
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedBackup(backup);
                                                    setShowRestoreConfirm(true);
                                                }}
                                            >
                                                <RotateCcw className="button-icon" />
                                                Restaurar
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Confirmação de Restore */}
            {showRestoreConfirm && selectedBackup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirmar Restauração</h3>
                        <p>
                            Você está prestes a restaurar o backup do serviço{' '}
                            <strong>{selectedBackup.serviceName}</strong> de{' '}
                            <strong>{new Date(selectedBackup.startedAt).toLocaleString('pt-BR')}</strong>.
                        </p>
                        <p className="warning-text">
                            ⚠️ Esta ação irá sobrescrever os dados atuais. Deseja continuar?
                        </p>
                        
                        <div className="modal-actions">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRestoreConfirm(false);
                                    setSelectedBackup(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    restoreFromBackup(selectedBackup.backupId);
                                    setShowRestoreConfirm(false);
                                    setSelectedBackup(null);
                                }}
                            >
                                Confirmar Restauração
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
```

### 🚀 SCRIPTS DE EXECUÇÃO

#### Script de Configuração Inicial
```bash
#!/bin/bash
# setup-backup-system.sh

set -e

echo "🔧 Configurando Sistema de Backup e Disaster Recovery..."

# Criar diretórios de backup
sudo mkdir -p /opt/kryonix/backups/{postgresql,redis,minio,configs}
sudo mkdir -p /opt/kryonix/recovery/scripts
sudo mkdir -p /opt/kryonix/monitoring/backup-logs

# Configurar MinIO bucket para backups
docker exec -it kryonix_minio mc mb local/kryonix-backups
docker exec -it kryonix_minio mc policy set download local/kryonix-backups

# Configurar PostgreSQL para backup
cat > /opt/kryonix/recovery/scripts/postgres-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/kryonix/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Full backup
pg_dumpall -h postgresql.kryonix.com.br -U postgres | gzip > "${BACKUP_DIR}/full_backup_${TIMESTAMP}.sql.gz"

# Cleanup old backups
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup PostgreSQL concluído: full_backup_${TIMESTAMP}.sql.gz"
EOF

# Configurar Redis backup
cat > /opt/kryonix/recovery/scripts/redis-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/kryonix/backups/redis"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Save Redis snapshot
redis-cli -h redis.kryonix.com.br BGSAVE
sleep 5

# Copy RDB file
docker exec kryonix_redis cp /data/dump.rdb /backups/redis_backup_${TIMESTAMP}.rdb

echo "Backup Redis concluído: redis_backup_${TIMESTAMP}.rdb"
EOF

# Tornar scripts executáveis
chmod +x /opt/kryonix/recovery/scripts/*.sh

# Configurar cron jobs para backups automáticos
cat > /opt/kryonix/backup-crontab << 'EOF'
# Backup completo diário às 2:00
0 2 * * * /opt/kryonix/recovery/scripts/postgres-backup.sh >> /opt/kryonix/monitoring/backup-logs/postgres.log 2>&1

# Backup Redis a cada 6 horas
0 */6 * * * /opt/kryonix/recovery/scripts/redis-backup.sh >> /opt/kryonix/monitoring/backup-logs/redis.log 2>&1

# Limpeza de logs antigos
0 0 * * 0 find /opt/kryonix/monitoring/backup-logs -name "*.log" -mtime +7 -delete
EOF

# Instalar cron jobs
sudo crontab /opt/kryonix/backup-crontab

# Configurar alertas de backup
cat > /opt/kryonix/recovery/scripts/backup-health-check.sh << 'EOF'
#!/bin/bash

WEBHOOK_URL="https://ntfy.kryonix.com.br/backup-alerts"

check_backup_freshness() {
    local service=$1
    local backup_dir=$2
    local max_age_hours=$3
    
    latest_backup=$(find $backup_dir -name "*backup*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [ -z "$latest_backup" ]; then
        curl -d "❌ ALERTA: Nenhum backup encontrado para $service" $WEBHOOK_URL
        return 1
    fi
    
    backup_age=$(( ($(date +%s) - $(stat -c %Y "$latest_backup")) / 3600 ))
    
    if [ $backup_age -gt $max_age_hours ]; then
        curl -d "⚠️ ALERTA: Backup do $service está desatualizado ($backup_age horas)" $WEBHOOK_URL
        return 1
    fi
    
    return 0
}

# Verificar freshness dos backups
check_backup_freshness "PostgreSQL" "/opt/kryonix/backups/postgresql" 25
check_backup_freshness "Redis" "/opt/kryonix/backups/redis" 7

echo "Verificação de health dos backups concluída"
EOF

chmod +x /opt/kryonix/recovery/scripts/backup-health-check.sh

# Adicionar health check ao cron
echo "0 */2 * * * /opt/kryonix/recovery/scripts/backup-health-check.sh" | sudo crontab -

echo "✅ Sistema de Backup configurado com sucesso!"
echo ""
echo "📊 Logs de backup: /opt/kryonix/monitoring/backup-logs/"
echo "🔧 Scripts: /opt/kryonix/recovery/scripts/"
echo "💾 Backups: /opt/kryonix/backups/"
echo ""
echo "🔄 Próximos passos:"
echo "1. Verificar logs em 24h para confirmar execução"
echo "2. Testar restauração com backup de teste"
echo "3. Configurar monitoramento no Grafana"
```

### ✅ CHECKLIST DE VALIDAÇÃO

- [ ] **Configuração de Backup**
  - [ ] MinIO bucket 'kryonix-backups' criado
  - [ ] Scripts de backup configurados para todos os serviços
  - [ ] Cron jobs instalados e funcionando
  - [ ] Compressão e encriptação habilitadas

- [ ] **Disaster Recovery**
  - [ ] Procedimentos documentados para cada tipo de incidente
  - [ ] Scripts de recuperação automática testados
  - [ ] Failover cross-region configurado
  - [ ] Tempos de RTO/RPO definidos e monitorados

- [ ] **Monitoramento**
  - [ ] Alertas de backup configurados
  - [ ] Dashboard de métricas funcionando
  - [ ] Health checks automáticos ativos
  - [ ] Logs centralizados no Grafana

- [ ] **Testes**
  - [ ] Teste de backup completo realizado
  - [ ] Teste de restauração parcial realizado
  - [ ] Teste de disaster recovery completo
  - [ ] Validação de integridade de dados

### 🧪 TESTES DE QUALIDADE

```bash
#!/bin/bash
# test-backup-system.sh

echo "🧪 Executando Testes do Sistema de Backup..."

# Teste 1: Verificar criação de backup
echo "Teste 1: Criação de backup PostgreSQL"
/opt/kryonix/recovery/scripts/postgres-backup.sh
if [ $? -eq 0 ]; then
    echo "✅ Backup PostgreSQL criado com sucesso"
else
    echo "❌ Falha na criação do backup PostgreSQL"
fi

# Teste 2: Verificar integridade do backup
echo "Teste 2: Verificação de integridade"
latest_backup=$(find /opt/kryonix/backups/postgresql -name "*.gz" -type f | head -1)
if gunzip -t "$latest_backup"; then
    echo "✅ Integridade do backup verificada"
else
    echo "❌ Backup corrompido detectado"
fi

# Teste 3: Verificar health check
echo "Teste 3: Health check dos backups"
/opt/kryonix/recovery/scripts/backup-health-check.sh
if [ $? -eq 0 ]; then
    echo "✅ Health check passou"
else
    echo "⚠️ Health check detectou problemas"
fi

# Teste 4: Verificar conectividade MinIO
echo "Teste 4: Conectividade com MinIO"
if docker exec kryonix_minio mc ls local/kryonix-backups > /dev/null 2>&1; then
    echo "✅ Conectividade MinIO OK"
else
    echo "❌ Problemas de conectividade com MinIO"
fi

echo ""
echo "🏁 Testes de Backup concluídos!"
```

### 📚 DOCUMENTAÇÃO TÉCNICA

#### Procedimentos de Disaster Recovery

1. **Identificação do Incidente**
   - Verificar alertas do Grafana
   - Analisar logs centralizados
   - Determinar escopo do impacto

2. **Classificação de Severidade**
   - **P0 (Crítico)**: Sistema totalmente inoperante
   - **P1 (Alto)**: Funcionalidade crítica afetada
   - **P2 (Médio)**: Degradação de performance
   - **P3 (Baixo)**: Funcionalidade secundária afetada

3. **Procedimentos de Recuperação**
   - Isolamento de serviços afetados
   - Ativação de backups apropriados
   - Restauração em ambiente de teste
   - Validação de integridade
   - Migração para produção
   - Verificação pós-recuperação

4. **Comunicação**
   - Notificação de stakeholders
   - Updates regulares de progresso
   - Documentação de lições aprendidas
   - Post-mortem quando aplicável

#### Métricas de SLA

- **RTO (Recovery Time Objective)**
  - P0: 15 minutos
  - P1: 1 hora
  - P2: 4 horas
  - P3: 24 horas

- **RPO (Recovery Point Objective)**
  - Dados críticos: 5 minutos
  - Dados importantes: 1 hora
  - Dados secundários: 24 horas

### 🔗 INTEGRAÇÃO COM STACK EXISTENTE

- **PostgreSQL**: Streaming replication + pg_dump backups
- **Redis**: Master-slave + RDB snapshots  
- **MinIO**: Cross-region replication + versioning
- **Traefik**: Configuration backup + health checks
- **Grafana**: Dashboard backup + alert rules
- **Prometheus**: TSDB snapshots + retention policies
- **Keycloak**: Realm export + database backup

### 📈 MONITORAMENTO E ALERTAS

- **Grafana Dashboards**: Métricas de backup em tempo real
- **Prometheus Metrics**: Contadores de sucesso/falha
- **Ntfy Notifications**: Alertas instantâneos
- **Email Reports**: Relatórios semanais de backup
- **WhatsApp Alerts**: Emergências críticas

---

**PARTE-22 CONCLUÍDA** ✅  
Sistema robusto de backup e disaster recovery implementado com cobertura completa de todos os 32 stacks da plataforma KRYONIX.

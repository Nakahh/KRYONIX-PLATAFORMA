# 💾 PARTE 08 - BACKUP AUTOMÁTICO MULTI-TENANT
*Agentes Especializados: DevOps Backup Expert + Multi-Tenant Architect + Security Expert + Mobile Expert + AI Specialist*

## 🎯 **OBJETIVO MULTI-TENANT**
Implementar sistema de backup automático com **isolamento completo por cliente**, orchestração cross-service, integridade multi-camada, retention policies específicas por plano e disaster recovery para a plataforma KRYONIX SaaS multi-tenant.

## 🏗️ **ARQUITETURA BACKUP MULTI-TENANT AVANÇADA**
```yaml
Multi_Tenant_Backup_Architecture:
  isolation_strategy: "Completo por cliente em todos os níveis"
  pattern: "cliente_{id}_backup_{timestamp}"
  cross_service_coordination: "PostgreSQL + MinIO + Redis + RabbitMQ + Apps"
  retention_policies: "Específicas por plano (basic/pro/enterprise)"
  disaster_recovery: "Multi-tier per tenant"
  compliance: "LGPD automático por cliente"
  
Backup_Tiers_Per_Client:
  tier1_critical: "PostgreSQL databases isoladas"
  tier2_storage: "MinIO buckets isolados" 
  tier3_cache: "Redis namespaces isolados"
  tier4_messaging: "RabbitMQ VHosts isolados"
  tier5_application: "Configurações e media por cliente"
  tier6_compliance: "Logs LGPD e auditoria"
  
Client_Isolation_Levels:
  database_level: "kryonix_cliente_{id}" 
  storage_level: "cliente-{id}-*-*"
  cache_level: "cliente:{id}:*:*"
  messaging_level: "/cliente_{id}"
  backup_level: "backup/cliente_{id}/*"
```

## 🔧 **SISTEMA ORCHESTRAÇÃO CROSS-SERVICE**

### **🤖 Manager Principal Multi-Tenant**
```python
#!/usr/bin/env python3
# enhanced-multi-tenant-backup-orchestrator.py

import asyncio
import json
import logging
import psycopg2
import subprocess
import boto3
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import tarfile
import gzip
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed

class KryonixMultiTenantBackupOrchestrator:
    def __init__(self):
        self.setup_logging()
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.backup_services = {
            'postgresql': PostgreSQLMultiTenantBackup(),
            'minio': MinIOMultiTenantBackup(), 
            'redis': RedisMultiTenantBackup(),
            'rabbitmq': RabbitMQMultiTenantBackup(),
            'application': ApplicationDataBackup()
        }
        
        # Configurações por plano
        self.retention_policies = {
            'basic': {
                'daily': 7,
                'weekly': 4, 
                'monthly': 3,
                'yearly': 0
            },
            'pro': {
                'daily': 30,
                'weekly': 12,
                'monthly': 12,
                'yearly': 2
            },
            'enterprise': {
                'daily': 60,
                'weekly': 24,
                'monthly': 24,
                'yearly': 5
            }
        }

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('/opt/kryonix/logs/backup-multi-tenant.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('KryonixMultiTenantBackup')

    async def orchestrate_complete_backup(
        self, 
        cliente_id: str, 
        backup_type: str = 'incremental',
        force: bool = False
    ) -> Dict:
        """Orquestra backup completo multi-service para um cliente"""
        
        self.logger.info(f"🚀 Iniciando backup multi-tenant para cliente: {cliente_id}")
        
        backup_session = {
            'cliente_id': cliente_id,
            'backup_type': backup_type,
            'started_at': datetime.now(),
            'services': {},
            'coordination': {},
            'verification': {},
            'storage_locations': []
        }
        
        try:
            # Phase 1: Pre-backup coordination
            coordination_result = await self.execute_pre_backup_coordination(cliente_id)
            backup_session['coordination']['pre_backup'] = coordination_result
            
            if not coordination_result['success']:
                raise Exception(f"Pre-backup coordination failed: {coordination_result['error']}")
            
            # Phase 2: Execute coordinated backup across all services
            services_result = await self.execute_coordinated_service_backups(
                cliente_id, backup_type, backup_session
            )
            backup_session['services'] = services_result
            
            # Phase 3: Cross-service consistency verification
            verification_result = await self.verify_cross_service_consistency(
                cliente_id, services_result
            )
            backup_session['verification'] = verification_result
            
            # Phase 4: Post-backup coordination and cleanup
            post_coordination = await self.execute_post_backup_coordination(
                cliente_id, backup_session
            )
            backup_session['coordination']['post_backup'] = post_coordination
            
            # Calculate final results
            backup_session['completed_at'] = datetime.now()
            backup_session['duration'] = (
                backup_session['completed_at'] - backup_session['started_at']
            ).total_seconds()
            backup_session['success'] = self.calculate_overall_success(backup_session)
            
            # Store audit record
            await self.store_backup_audit(backup_session)
            
            # Send notifications
            await self.send_backup_notifications(backup_session)
            
            self.logger.info(
                f"✅ Backup multi-tenant concluído para {cliente_id} "
                f"em {backup_session['duration']:.2f}s"
            )
            
            return backup_session
            
        except Exception as e:
            self.logger.error(f"❌ Erro no backup para {cliente_id}: {e}")
            backup_session['error'] = str(e)
            backup_session['success'] = False
            await self.handle_backup_failure(backup_session)
            return backup_session

    async def execute_pre_backup_coordination(self, cliente_id: str) -> Dict:
        """Executa coordenação pré-backup"""
        try:
            self.logger.info(f"🔄 Executando coordenação pré-backup para {cliente_id}")
            
            # 1. Verificar se cliente existe e está ativo
            client_info = await self.get_client_info(cliente_id)
            if not client_info['active']:
                return {'success': False, 'error': 'Cliente inativo'}
            
            # 2. Adquirir lock global para o cliente
            lock_acquired = await self.acquire_client_backup_lock(cliente_id)
            if not lock_acquired:
                return {'success': False, 'error': 'Não foi possível adquirir lock'}
            
            # 3. Pausar operações não críticas
            await self.pause_non_critical_operations(cliente_id)
            
            # 4. Flush operações pendentes
            flush_results = await self.flush_pending_operations(cliente_id)
            
            # 5. Criar checkpoint de coordenação
            checkpoint = await self.create_coordination_checkpoint(cliente_id)
            
            # 6. Verificar saúde dos serviços
            health_check = await self.verify_services_health(cliente_id)
            
            return {
                'success': True,
                'client_info': client_info,
                'lock_acquired': lock_acquired,
                'flush_results': flush_results,
                'checkpoint': checkpoint,
                'health_check': health_check
            }
            
        except Exception as e:
            self.logger.error(f"❌ Erro na coordenação pré-backup: {e}")
            return {'success': False, 'error': str(e)}

    async def execute_coordinated_service_backups(
        self, 
        cliente_id: str, 
        backup_type: str,
        backup_session: Dict
    ) -> Dict:
        """Executa backup coordenado de todos os serviços"""
        
        services_results = {}
        
        # Ordem de execução baseada em dependências
        execution_phases = [
            {
                'name': 'Foundation Services',
                'services': ['postgresql', 'redis'],
                'parallel': True,
                'critical': True
            },
            {
                'name': 'Storage Services', 
                'services': ['minio'],
                'parallel': False,
                'critical': True
            },
            {
                'name': 'Messaging Services',
                'services': ['rabbitmq'],
                'parallel': False,
                'critical': False
            },
            {
                'name': 'Application Services',
                'services': ['application'],
                'parallel': False,
                'critical': False
            }
        ]
        
        for phase in execution_phases:
            self.logger.info(f"📋 Executando fase: {phase['name']}")
            
            if phase['parallel']:
                # Execução paralela
                phase_tasks = []
                for service_name in phase['services']:
                    if service_name in self.backup_services:
                        task = self.backup_services[service_name].execute_backup(
                            cliente_id, backup_type, backup_session
                        )
                        phase_tasks.append((service_name, task))
                
                # Aguardar conclusão paralela
                for service_name, task in phase_tasks:
                    try:
                        result = await task
                        services_results[service_name] = result
                        self.logger.info(f"✅ Backup {service_name} concluído")
                    except Exception as e:
                        self.logger.error(f"❌ Erro backup {service_name}: {e}")
                        services_results[service_name] = {
                            'success': False,
                            'error': str(e)
                        }
            else:
                # Execução sequencial
                for service_name in phase['services']:
                    if service_name in self.backup_services:
                        try:
                            result = await self.backup_services[service_name].execute_backup(
                                cliente_id, backup_type, backup_session
                            )
                            services_results[service_name] = result
                            self.logger.info(f"✅ Backup {service_name} concluído")
                        except Exception as e:
                            self.logger.error(f"❌ Erro backup {service_name}: {e}")
                            services_results[service_name] = {
                                'success': False,
                                'error': str(e)
                            }
                            
                            # Se é crítico e falhou, parar execução
                            if phase['critical']:
                                self.logger.error(f"Fase crítica {phase['name']} falhou, parando")
                                break
        
        return services_results

    async def verify_cross_service_consistency(
        self, 
        cliente_id: str, 
        services_results: Dict
    ) -> Dict:
        """Verifica consistência entre serviços"""
        
        consistency_checks = []
        
        # 1. Database-Storage consistency
        db_storage_check = await self.verify_database_storage_consistency(
            cliente_id, services_results
        )
        consistency_checks.append(db_storage_check)
        
        # 2. Cache-Database consistency
        cache_db_check = await self.verify_cache_database_consistency(
            cliente_id, services_results
        )
        consistency_checks.append(cache_db_check)
        
        # 3. Messaging-Application consistency
        messaging_app_check = await self.verify_messaging_application_consistency(
            cliente_id, services_results
        )
        consistency_checks.append(messaging_app_check)
        
        # 4. Cross-service file references
        file_refs_check = await self.verify_cross_service_file_references(
            cliente_id, services_results
        )
        consistency_checks.append(file_refs_check)
        
        # Calculate overall consistency score
        total_checks = len(consistency_checks)
        passed_checks = sum(1 for check in consistency_checks if check['passed'])
        consistency_score = (passed_checks / total_checks) * 100 if total_checks > 0 else 0
        
        return {
            'overall_consistent': consistency_score >= 95,
            'consistency_score': consistency_score,
            'checks': consistency_checks,
            'recommendations': self.generate_consistency_recommendations(consistency_checks)
        }

    async def verify_database_storage_consistency(
        self, 
        cliente_id: str, 
        services_results: Dict
    ) -> Dict:
        """Verifica consistência entre banco e storage"""
        try:
            # Verificar se ambos os backups foram bem-sucedidos
            db_backup = services_results.get('postgresql', {})
            storage_backup = services_results.get('minio', {})
            
            if not (db_backup.get('success') and storage_backup.get('success')):
                return {
                    'name': 'Database-Storage Consistency',
                    'passed': False,
                    'error': 'Missing successful database or storage backup'
                }
            
            # Obter referências de arquivos do banco
            db_file_refs = await self.get_database_file_references(cliente_id)
            
            # Obter arquivos do storage
            storage_files = await self.get_storage_files_list(cliente_id)
            
            # Comparar
            missing_files = [ref for ref in db_file_refs if ref not in storage_files]
            orphan_files = [file for file in storage_files if file not in db_file_refs]
            
            consistency_ratio = 1 - (len(missing_files) + len(orphan_files)) / max(len(db_file_refs), 1)
            
            return {
                'name': 'Database-Storage Consistency',
                'passed': consistency_ratio >= 0.95,
                'score': consistency_ratio * 100,
                'details': {
                    'db_references': len(db_file_refs),
                    'storage_files': len(storage_files),
                    'missing_files': len(missing_files),
                    'orphan_files': len(orphan_files)
                }
            }
            
        except Exception as e:
            return {
                'name': 'Database-Storage Consistency',
                'passed': False,
                'error': str(e)
            }

class PostgreSQLMultiTenantBackup:
    """Backup PostgreSQL com isolamento por cliente"""
    
    async def execute_backup(self, cliente_id: str, backup_type: str, session: Dict) -> Dict:
        """Executa backup PostgreSQL específico do cliente"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            database_name = f"kryonix_cliente_{cliente_id}"
            backup_dir = f"/opt/kryonix/backups/postgresql/cliente_{cliente_id}/{timestamp}"
            
            # Criar diretório de backup
            subprocess.run(f"mkdir -p {backup_dir}", shell=True, check=True)
            
            # Backup completo da base do cliente
            backup_file = f"{backup_dir}/database_complete_{timestamp}.backup"
            
            pg_dump_cmd = [
                'pg_dump',
                '-h', 'postgresql.kryonix.com.br',
                '-U', 'postgres',
                '-d', database_name,
                '--format=custom',
                '--compress=9',
                '--verbose',
                '--no-password',
                f'--file={backup_file}'
            ]
            
            result = subprocess.run(
                pg_dump_cmd,
                capture_output=True,
                text=True,
                env={'PGPASSWORD': 'postgres_password'}
            )
            
            if result.returncode != 0:
                raise Exception(f"pg_dump failed: {result.stderr}")
            
            # Backup esquemas específicos por módulo
            module_backups = await self.backup_client_modules(
                cliente_id, database_name, backup_dir, timestamp
            )
            
            # Calcular checksums
            checksum = self.calculate_file_checksum(backup_file)
            
            # Comprimir e criptografar
            compressed_file = await self.compress_and_encrypt_backup(
                backup_file, cliente_id
            )
            
            # Upload para múltiplos destinos
            upload_results = await self.upload_to_multiple_destinations(
                compressed_file, cliente_id, timestamp
            )
            
            # Gerar manifest
            manifest = self.generate_backup_manifest(
                cliente_id, backup_file, module_backups, checksum, upload_results
            )
            
            return {
                'success': True,
                'backup_file': backup_file,
                'compressed_file': compressed_file,
                'checksum': checksum,
                'module_backups': module_backups,
                'upload_results': upload_results,
                'manifest': manifest,
                'duration': 0  # Calcular tempo real
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    async def backup_client_modules(
        self, 
        cliente_id: str, 
        database_name: str, 
        backup_dir: str, 
        timestamp: str
    ) -> Dict:
        """Backup específico por módulo do cliente"""
        
        module_schemas = [
            'auth', 'crm', 'whatsapp', 'agendamento', 
            'financeiro', 'marketing', 'analytics', 
            'portal', 'whitelabel', 'lgpd'
        ]
        
        module_backups = {}
        
        for schema in module_schemas:
            try:
                schema_backup_file = f"{backup_dir}/{schema}_{timestamp}.sql"
                
                pg_dump_cmd = [
                    'pg_dump',
                    '-h', 'postgresql.kryonix.com.br',
                    '-U', 'postgres', 
                    '-d', database_name,
                    '--schema', schema,
                    '--data-only',
                    '--inserts',
                    f'--file={schema_backup_file}'
                ]
                
                result = subprocess.run(
                    pg_dump_cmd,
                    capture_output=True,
                    text=True,
                    env={'PGPASSWORD': 'postgres_password'}
                )
                
                if result.returncode == 0:
                    # Comprimir backup do esquema
                    compressed_schema = f"{schema_backup_file}.gz"
                    with open(schema_backup_file, 'rb') as f_in:
                        with gzip.open(compressed_schema, 'wb') as f_out:
                            f_out.writelines(f_in)
                    
                    module_backups[schema] = {
                        'success': True,
                        'file': compressed_schema,
                        'size': subprocess.check_output(
                            ['stat', '-f%z', compressed_schema]
                        ).decode().strip()
                    }
                    
                    # Remover arquivo não comprimido
                    subprocess.run(f"rm {schema_backup_file}", shell=True)
                    
                else:
                    module_backups[schema] = {
                        'success': False,
                        'error': result.stderr
                    }
                    
            except Exception as e:
                module_backups[schema] = {
                    'success': False,
                    'error': str(e)
                }
        
        return module_backups

class MinIOMultiTenantBackup:
    """Backup MinIO com isolamento por cliente"""
    
    async def execute_backup(self, cliente_id: str, backup_type: str, session: Dict) -> Dict:
        """Executa backup MinIO específico do cliente"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = f"/opt/kryonix/backups/minio/cliente_{cliente_id}/{timestamp}"
            
            # Criar diretório de backup
            subprocess.run(f"mkdir -p {backup_dir}", shell=True, check=True)
            
            # Obter todos os buckets do cliente
            client_buckets = await self.get_client_buckets(cliente_id)
            
            bucket_backups = {}
            total_size = 0
            
            for bucket in client_buckets:
                bucket_backup = await self.backup_bucket(
                    bucket, backup_dir, timestamp, cliente_id
                )
                bucket_backups[bucket] = bucket_backup
                
                if bucket_backup['success']:
                    total_size += bucket_backup.get('size', 0)
            
            # Criar archive completo
            archive_file = f"{backup_dir}_complete.tar.gz"
            subprocess.run(
                f"tar -czf {archive_file} -C {backup_dir} .",
                shell=True, check=True
            )
            
            # Upload para destinos múltiplos
            upload_results = await self.upload_to_multiple_destinations(
                archive_file, cliente_id, timestamp
            )
            
            # Limpeza
            subprocess.run(f"rm -rf {backup_dir}", shell=True)
            
            return {
                'success': True,
                'bucket_backups': bucket_backups,
                'archive_file': archive_file,
                'total_size': total_size,
                'upload_results': upload_results
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    async def get_client_buckets(self, cliente_id: str) -> List[str]:
        """Obtém lista de buckets do cliente"""
        try:
            # Usar mc para listar buckets do cliente
            result = subprocess.run(
                ['mc', 'ls', 'kryonix/'],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                return []
            
            # Filtrar buckets do cliente
            client_buckets = []
            for line in result.stdout.split('\n'):
                if f'cliente-{cliente_id}-' in line:
                    bucket_name = line.split()[-1].rstrip('/')
                    client_buckets.append(bucket_name)
            
            return client_buckets
            
        except Exception as e:
            self.logger.error(f"Erro ao obter buckets do cliente {cliente_id}: {e}")
            return []

    async def backup_bucket(
        self, 
        bucket_name: str, 
        backup_dir: str, 
        timestamp: str, 
        cliente_id: str
    ) -> Dict:
        """Backup de um bucket específico"""
        try:
            bucket_backup_dir = f"{backup_dir}/{bucket_name}"
            subprocess.run(f"mkdir -p {bucket_backup_dir}", shell=True, check=True)
            
            # Sync bucket para diretório local
            result = subprocess.run([
                'mc', 'mirror', 
                f'kryonix/{bucket_name}',
                bucket_backup_dir
            ], capture_output=True, text=True)
            
            if result.returncode != 0:
                return {
                    'success': False,
                    'error': result.stderr
                }
            
            # Calcular tamanho
            size_result = subprocess.run([
                'du', '-sb', bucket_backup_dir
            ], capture_output=True, text=True)
            
            size = int(size_result.stdout.split()[0]) if size_result.returncode == 0 else 0
            
            # Gerar manifest do bucket
            manifest = await self.generate_bucket_manifest(bucket_backup_dir, bucket_name)
            
            return {
                'success': True,
                'backup_dir': bucket_backup_dir,
                'size': size,
                'manifest': manifest
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Implementações similares para RedisMultiTenantBackup, RabbitMQMultiTenantBackup, ApplicationDataBackup...

# Script principal de execução
async def main():
    """Função principal para execução de backup multi-tenant"""
    
    if len(sys.argv) < 2:
        print("Uso: python backup-orchestrator.py <cliente_id> [backup_type]")
        sys.exit(1)
    
    cliente_id = sys.argv[1]
    backup_type = sys.argv[2] if len(sys.argv) > 2 else 'incremental'
    
    orchestrator = KryonixMultiTenantBackupOrchestrator()
    
    print(f"🚀 Iniciando backup multi-tenant para cliente: {cliente_id}")
    
    result = await orchestrator.orchestrate_complete_backup(cliente_id, backup_type)
    
    if result['success']:
        print(f"✅ Backup multi-tenant concluído com sucesso!")
        print(f"⏱️ Duração: {result['duration']:.2f}s")
    else:
        print(f"❌ Backup multi-tenant falhou: {result.get('error', 'Erro desconhecido')}")
        sys.exit(1)

if __name__ == "__main__":
    import sys
    asyncio.run(main())
```

## 📱 **BACKUP MOBILE APPLICATIONS**

### **🔧 Backup Específico para Mobile**
```typescript
// mobile-app-backup-strategy.ts
export class MobileAppBackupStrategy {
    
    async backupMobileAppData(clienteId: string, appType: 'pwa' | 'native'): Promise<MobileBackupResult> {
        console.log(`📱 Iniciando backup mobile para cliente: ${clienteId}, tipo: ${appType}`);
        
        const backupComponents = {
            offline_storage: await this.backupOfflineStorage(clienteId, appType),
            app_configuration: await this.backupAppConfiguration(clienteId, appType),  
            user_preferences: await this.backupUserPreferences(clienteId, appType),
            cached_data: await this.backupCachedData(clienteId, appType),
            sync_queue: await this.backupSyncQueue(clienteId, appType),
            push_notifications: await this.backupPushNotificationConfig(clienteId, appType),
            offline_forms: await this.backupOfflineForms(clienteId, appType),
            media_cache: await this.backupMediaCache(clienteId, appType),
            biometric_data: await this.backupBiometricConfig(clienteId, appType)
        };
        
        return {
            clienteId,
            appType,
            timestamp: new Date(),
            components: backupComponents,
            totalSize: Object.values(backupComponents).reduce((sum, comp) => sum + (comp.size || 0), 0),
            success: Object.values(backupComponents).every(comp => comp.success),
            complianceLGPD: await this.verifyLGPDCompliance(clienteId, backupComponents)
        };
    }
    
    private async backupOfflineStorage(clienteId: string, appType: string): Promise<BackupComponent> {
        // Backup IndexedDB, localStorage, WebSQL e Cache API
        const offlineData = await this.extractOfflineStorageData(clienteId, appType);
        
        return {
            name: 'offline_storage',
            success: true,
            size: JSON.stringify(offlineData).length,
            encrypted: true,
            data: {
                indexeddb: offlineData.indexeddb,
                localStorage: offlineData.localStorage,
                webSQL: offlineData.webSQL,
                cacheAPI: offlineData.cacheAPI,
                serviceWorkerCache: offlineData.serviceWorkerCache
            }
        };
    }
    
    private async backupSyncQueue(clienteId: string, appType: string): Promise<BackupComponent> {
        // Backup operações de sincronização pendentes
        const syncQueue = await this.extractSyncQueueData(clienteId);
        
        return {
            name: 'sync_queue',
            success: true,
            size: JSON.stringify(syncQueue).length,
            data: {
                pending_uploads: syncQueue.uploads,
                pending_updates: syncQueue.updates,
                failed_syncs: syncQueue.failed,
                retry_queue: syncQueue.retries,
                offline_operations: syncQueue.offlineOps
            }
        };
    }
    
    private async backupBiometricConfig(clienteId: string, appType: string): Promise<BackupComponent> {
        // Backup configurações biométricas (sem dados biométricos reais)
        const biometricConfig = await this.extractBiometricConfig(clienteId);
        
        return {
            name: 'biometric_config',
            success: true,
            size: JSON.stringify(biometricConfig).length,
            lgpdCompliant: true, // Não armazena dados biométricos reais
            data: {
                enabled: biometricConfig.enabled,
                preferred_method: biometricConfig.preferredMethod,
                fallback_configured: biometricConfig.fallbackConfigured,
                // NUNCA fazer backup de templates biométricos
                security_settings: biometricConfig.securitySettings
            }
        };
    }
}
```

## 💾 **RETENTION POLICIES POR CLIENTE**

### **📅 Sistema Retention Multi-Tenant**
```bash
#!/bin/bash
# retention-policies-multi-tenant.sh

apply_client_retention_policies() {
    echo "📅 Aplicando políticas de retenção multi-tenant"
    
    # Obter todos os clientes ativos
    ACTIVE_CLIENTS=$(psql -h postgresql.kryonix.com.br -U postgres -d kryonix_main -t -c "
        SELECT c.id, c.plano FROM tenants.clientes c WHERE c.status = 'ativo'
    ")
    
    while IFS='|' read -r cliente_id plano; do
        if [ -n "$cliente_id" ]; then
            echo "🔄 Aplicando retenção para cliente: $cliente_id (Plano: $plano)"
            apply_individual_client_retention "$cliente_id" "$plano"
        fi
    done <<< "$ACTIVE_CLIENTS"
}

apply_individual_client_retention() {
    local cliente_id=$1
    local plano=$2
    
    # Configurações de retenção por plano
    case "$plano" in
        "basic")
            DAILY_RETENTION=7
            WEEKLY_RETENTION=4
            MONTHLY_RETENTION=3
            YEARLY_RETENTION=0
            ;;
        "pro")
            DAILY_RETENTION=30
            WEEKLY_RETENTION=12
            MONTHLY_RETENTION=12
            YEARLY_RETENTION=2
            ;;
        "enterprise")
            DAILY_RETENTION=60
            WEEKLY_RETENTION=24
            MONTHLY_RETENTION=24
            YEARLY_RETENTION=5
            ;;
        *)
            echo "⚠️ Plano desconhecido: $plano, usando padrão basic"
            DAILY_RETENTION=7
            WEEKLY_RETENTION=4
            MONTHLY_RETENTION=3
            YEARLY_RETENTION=0
            ;;
    esac
    
    # Aplicar retenção em PostgreSQL
    apply_postgresql_retention "$cliente_id" "$DAILY_RETENTION"
    
    # Aplicar retenção em MinIO
    apply_minio_retention "$cliente_id" "$DAILY_RETENTION" "$MONTHLY_RETENTION"
    
    # Aplicar retenção em Redis
    apply_redis_retention "$cliente_id" "$DAILY_RETENTION"
    
    # Aplicar retenção em RabbitMQ
    apply_rabbitmq_retention "$cliente_id" "$DAILY_RETENTION"
    
    # Aplicar retenção em dados de aplicação
    apply_application_retention "$cliente_id" "$DAILY_RETENTION" "$YEARLY_RETENTION"
    
    # Aplicar retenção específica LGPD
    apply_lgpd_retention "$cliente_id"
    
    echo "✅ Retenção aplicada para cliente $cliente_id"
}

apply_postgresql_retention() {
    local cliente_id=$1
    local retention_days=$2
    
    echo "🗄️ Aplicando retenção PostgreSQL para cliente: $cliente_id"
    
    # Localizar backups antigos
    BACKUP_PATH="/opt/kryonix/backups/postgresql/cliente_${cliente_id}"
    
    if [ -d "$BACKUP_PATH" ]; then
        # Remover backups diários antigos
        find "$BACKUP_PATH" -name "database_complete_*.backup" \
            -mtime +$retention_days -delete
        
        # Remover backups comprimidos antigos
        find "$BACKUP_PATH" -name "*.tar.gz.gpg" \
            -mtime +$retention_days -delete
        
        echo "✅ PostgreSQL retention aplicada: $retention_days dias"
    fi
}

apply_minio_retention() {
    local cliente_id=$1
    local daily_retention=$2
    local monthly_retention=$3
    
    echo "📦 Aplicando retenção MinIO para cliente: $cliente_id"
    
    # Configurar lifecycle rules no MinIO para buckets do cliente
    CLIENT_BUCKETS=$(mc ls kryonix/ | grep "cliente-${cliente_id}-" | awk '{print $5}')
    
    for bucket in $CLIENT_BUCKETS; do
        # Criar regra de lifecycle
        cat > "/tmp/lifecycle-${bucket}.json" <<EOF
{
    "Rules": [
        {
            "ID": "DailyBackupRetention",
            "Status": "Enabled",
            "Filter": {"Prefix": "backup/daily/"},
            "Expiration": {"Days": $daily_retention}
        },
        {
            "ID": "MonthlyBackupTransition",
            "Status": "Enabled", 
            "Filter": {"Prefix": "backup/monthly/"},
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "GLACIER"
                }
            ],
            "Expiration": {"Days": $((monthly_retention * 30))}
        }
    ]
}
EOF
        
        # Aplicar regra
        mc ilm add --rule "/tmp/lifecycle-${bucket}.json" "kryonix/${bucket}"
        rm "/tmp/lifecycle-${bucket}.json"
        
        echo "✅ Lifecycle configurado para bucket: $bucket"
    done
}

apply_lgpd_retention() {
    local cliente_id=$1
    
    echo "⚖️ Aplicando retenção LGPD para cliente: $cliente_id"
    
    # Verificar dados para direito ao esquecimento
    psql -h postgresql.kryonix.com.br -U postgres -d "kryonix_cliente_${cliente_id}" -c "
        -- Anonimizar contatos inativos há mais de 3 anos
        UPDATE crm.contatos 
        SET nome = 'ANONIMIZADO',
            email = 'anonimizado@exemplo.com',
            telefone = '+55000000000'
        WHERE ultimo_contato < NOW() - INTERVAL '3 years'
        AND id NOT IN (
            SELECT DISTINCT contato_id 
            FROM lgpd.consentimentos 
            WHERE consentimento_dado = true
        );
        
        -- Limpar logs de processamento antigos
        DELETE FROM lgpd.log_processamento 
        WHERE processado_em < NOW() - INTERVAL '5 years';
        
        -- Limpar dados de sessões antigas
        DELETE FROM analytics.eventos 
        WHERE ocorreu_em < NOW() - INTERVAL '2 years';
    "
    
    echo "✅ Retenção LGPD aplicada para cliente: $cliente_id"
}

# Função para verificar compliance
verify_retention_compliance() {
    local cliente_id=$1
    
    echo "🔍 Verificando compliance de retenção para cliente: $cliente_id"
    
    # Verificar se existem dados além do período de retenção
    COMPLIANCE_REPORT="/tmp/compliance_report_${cliente_id}.txt"
    
    cat > "$COMPLIANCE_REPORT" <<EOF
RELATÓRIO DE COMPLIANCE - CLIENTE: $cliente_id
=============================================

PostgreSQL Backups:
$(find "/opt/kryonix/backups/postgresql/cliente_${cliente_id}" -name "*.backup" -mtime +30 | wc -l) backups antigos encontrados

MinIO Buckets:
$(mc ls kryonix/ | grep "cliente-${cliente_id}-" | wc -l) buckets ativos

Redis Backups:
$(find "/opt/kryonix/backups/redis/cliente_${cliente_id}" -name "*.rdb" -mtime +30 | wc -l) backups antigos encontrados

LGPD Compliance:
$(psql -h postgresql.kryonix.com.br -U postgres -d "kryonix_cliente_${cliente_id}" -t -c "
    SELECT COUNT(*) FROM lgpd.log_processamento 
    WHERE processado_em < NOW() - INTERVAL '5 years'
") registros de logs antigos

Gerado em: $(date)
EOF
    
    echo "📄 Relatório gerado: $COMPLIANCE_REPORT"
    
    # Enviar relatório para administradores se necessário
    if [ -s "$COMPLIANCE_REPORT" ]; then
        echo "📧 Enviando relatório de compliance"
        # Implementar envio via WhatsApp/Email
    fi
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    apply_client_retention_policies
fi
```

## 🔧 **SCRIPT SETUP MULTI-TENANT COMPLETO**

### **🚀 Setup Automático Completo**
```bash
#!/bin/bash
# setup-backup-multi-tenant-completo.sh

echo "🚀 KRYONIX - Setup Backup Multi-Tenant Completo"
echo "==============================================="

# 1. CRIAR ESTRUTURA DE DIRETÓRIOS
echo "📁 Criando estrutura de diretórios..."
mkdir -p /opt/kryonix/{backups/{postgresql,minio,redis,rabbitmq,application},scripts,monitoring/backup,logs}

# 2. CONFIGURAR STORAGE DE BACKUP
echo "💾 Configurando storage de backup..."
docker run -d \
  --name kryonix-backup-storage \
  --restart always \
  --network kryonix-network \
  -p 9003:9000 \
  -p 9004:9001 \
  -e MINIO_ROOT_USER=kryonix_backup \
  -e MINIO_ROOT_PASSWORD=KryonixBackup2025 \
  -v /opt/kryonix/backups:/data \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.backup-storage.rule=Host(\`backup.kryonix.com.br\`)" \
  --label "traefik.http.routers.backup-storage.entrypoints=websecure" \
  --label "traefik.http.routers.backup-storage.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.backup-storage.loadbalancer.server.port=9000" \
  minio/minio server /data --console-address ":9001"

# 3. AGUARDAR INICIALIZAÇÃO
echo "⏳ Aguardando storage de backup inicializar..."
sleep 20

# 4. CONFIGURAR MC (MinIO Client)
echo "🔧 Configurando MinIO Client..."
mc alias set kryonix-backup http://backup.kryonix.com.br:9003 kryonix_backup KryonixBackup2025

# 5. CRIAR BUCKETS DE BACKUP
echo "📦 Criando buckets de backup..."
mc mb kryonix-backup/postgresql-backups
mc mb kryonix-backup/minio-backups
mc mb kryonix-backup/redis-backups
mc mb kryonix-backup/rabbitmq-backups
mc mb kryonix-backup/application-backups
mc mb kryonix-backup/compliance-backups

# 6. INSTALAR DEPENDÊNCIAS
echo "📥 Instalando dependências..."
apt-get update && apt-get install -y \
  postgresql-client \
  redis-tools \
  python3-pip \
  gpg \
  awscli

pip3 install \
  psycopg2-binary \
  redis \
  boto3 \
  azure-storage-blob \
  google-cloud-storage

# 7. INSTALAR SCRIPT PRINCIPAL
echo "📜 Instalando script principal..."
cp enhanced-multi-tenant-backup-orchestrator.py /opt/kryonix/scripts/
chmod +x /opt/kryonix/scripts/enhanced-multi-tenant-backup-orchestrator.py

# 8. INSTALAR SCRIPT DE RETENÇÃO
echo "📅 Instalando script de retenção..."
cp retention-policies-multi-tenant.sh /opt/kryonix/scripts/
chmod +x /opt/kryonix/scripts/retention-policies-multi-tenant.sh

# 9. CONFIGURAR CRON JOBS
echo "⏰ Configurando jobs automáticos..."

# Backup incremental a cada 6 horas
(crontab -l 2>/dev/null; echo "0 */6 * * * /opt/kryonix/scripts/backup-all-clients.sh incremental") | crontab -

# Backup completo diário às 2h
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/kryonix/scripts/backup-all-clients.sh full") | crontab -

# Aplicar políticas de retenção diariamente às 4h
(crontab -l 2>/dev/null; echo "0 4 * * * /opt/kryonix/scripts/retention-policies-multi-tenant.sh") | crontab -

# Verificação de integridade semanal
(crontab -l 2>/dev/null; echo "0 6 * * 0 /opt/kryonix/scripts/verify-backup-integrity.sh") | crontab -

# 10. CRIAR SCRIPT BACKUP TODOS OS CLIENTES
echo "👥 Criando script backup todos os clientes..."
cat > /opt/kryonix/scripts/backup-all-clients.sh << 'EOF'
#!/bin/bash
# backup-all-clients.sh

BACKUP_TYPE=${1:-"incremental"}
echo "🚀 Iniciando backup $BACKUP_TYPE para todos os clientes"

# Obter lista de clientes ativos
ACTIVE_CLIENTS=$(psql -h postgresql.kryonix.com.br -U postgres -d kryonix_main -t -c "
    SELECT id FROM tenants.clientes WHERE status = 'ativo'
")

TOTAL_CLIENTS=$(echo "$ACTIVE_CLIENTS" | wc -l)
CURRENT=0
SUCCESSFUL=0
FAILED=0

echo "📊 Total de clientes para backup: $TOTAL_CLIENTS"

for cliente_id in $ACTIVE_CLIENTS; do
    if [ -n "$cliente_id" ]; then
        CURRENT=$((CURRENT + 1))
        echo "📋 [$CURRENT/$TOTAL_CLIENTS] Fazendo backup do cliente: $cliente_id"
        
        if python3 /opt/kryonix/scripts/enhanced-multi-tenant-backup-orchestrator.py "$cliente_id" "$BACKUP_TYPE"; then
            echo "✅ Backup concluído para: $cliente_id"
            SUCCESSFUL=$((SUCCESSFUL + 1))
        else
            echo "❌ Backup falhou para: $cliente_id"
            FAILED=$((FAILED + 1))
        fi
        
        # Pausa entre backups para não sobrecarregar
        sleep 30
    fi
done

echo "======================================="
echo "📊 Resumo do backup $BACKUP_TYPE:"
echo "   Total: $TOTAL_CLIENTS"
echo "   Sucessos: $SUCCESSFUL"
echo "   Falhas: $FAILED"
echo "   Taxa de sucesso: $(( SUCCESSFUL * 100 / TOTAL_CLIENTS ))%"
echo "======================================="

# Enviar relatório via WhatsApp se necessário
if [ $FAILED -gt 0 ]; then
    echo "⚠️ Há falhas no backup - verificar logs"
    # Implementar notificação
fi
EOF

chmod +x /opt/kryonix/scripts/backup-all-clients.sh

# 11. CONFIGURAR MONITORAMENTO
echo "📊 Configurando monitoramento de backup..."
cat > /opt/kryonix/scripts/monitor-backup-status.py << 'EOF'
#!/usr/bin/env python3
# monitor-backup-status.py

import psycopg2
import json
from datetime import datetime, timedelta

def monitor_backup_status():
    """Monitora status dos backups de todos os clientes"""
    
    try:
        # Conectar ao banco principal
        conn = psycopg2.connect(
            host="postgresql.kryonix.com.br",
            database="kryonix_main",
            user="postgres",
            password="postgres_password"
        )
        
        cursor = conn.cursor()
        
        # Verificar clientes com backup atrasado
        cursor.execute("""
            SELECT c.id, c.nome, c.plano,
                   EXTRACT(EPOCH FROM (NOW() - ba.backup_date))/3600 as hours_since_backup
            FROM tenants.clientes c
            LEFT JOIN tenants.backup_audit ba ON c.id = ba.cliente_id
            WHERE c.status = 'ativo'
            AND (ba.backup_date IS NULL OR ba.backup_date < NOW() - INTERVAL '8 hours')
            ORDER BY hours_since_backup DESC NULLS LAST
        """)
        
        outdated_backups = cursor.fetchall()
        
        if outdated_backups:
            print(f"⚠️ {len(outdated_backups)} clientes com backup atrasado:")
            for cliente_id, nome, plano, hours in outdated_backups:
                if hours:
                    print(f"   - {nome} ({cliente_id}): {hours:.1f}h atrás")
                else:
                    print(f"   - {nome} ({cliente_id}): Nunca foi feito backup")
        else:
            print("✅ Todos os clientes têm backup atualizado")
        
        # Verificar espaço de storage
        cursor.execute("""
            SELECT 
                SUM(ba.backup_size_bytes) as total_backup_size,
                COUNT(DISTINCT ba.cliente_id) as clients_with_backup,
                AVG(ba.backup_size_bytes) as avg_backup_size
            FROM tenants.backup_audit ba
            WHERE ba.backup_date > NOW() - INTERVAL '24 hours'
        """)
        
        storage_stats = cursor.fetchone()
        
        if storage_stats[0]:
            total_gb = storage_stats[0] / (1024**3)
            avg_mb = storage_stats[2] / (1024**2) if storage_stats[2] else 0
            
            print(f"💾 Estatísticas de storage (24h):")
            print(f"   - Total usado: {total_gb:.2f} GB")
            print(f"   - Clientes com backup: {storage_stats[1]}")
            print(f"   - Tamanho médio: {avg_mb:.1f} MB")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro no monitoramento: {e}")

if __name__ == "__main__":
    monitor_backup_status()
EOF

chmod +x /opt/kryonix/scripts/monitor-backup-status.py

# 12. CONFIGURAR VERIFICAÇÃO DE INTEGRIDADE
echo "🔍 Configurando verificação de integridade..."
cat > /opt/kryonix/scripts/verify-backup-integrity.sh << 'EOF'
#!/bin/bash
# verify-backup-integrity.sh

echo "🔍 Verificando integridade de backups multi-tenant"

BACKUP_BASE="/opt/kryonix/backups"
ERRORS=0

# Verificar integridade por tipo de serviço
for service in postgresql minio redis rabbitmq application; do
    echo "🔧 Verificando integridade: $service"
    
    SERVICE_DIR="$BACKUP_BASE/$service"
    
    if [ -d "$SERVICE_DIR" ]; then
        # Contar arquivos corrompidos
        CORRUPTED=$(find "$SERVICE_DIR" -name "*.backup" -o -name "*.tar.gz" | while read file; do
            if ! tar -tzf "$file" &>/dev/null && ! pg_restore -l "$file" &>/dev/null; then
                echo "$file"
            fi
        done | wc -l)
        
        if [ "$CORRUPTED" -gt 0 ]; then
            echo "   ❌ $CORRUPTED arquivo(s) corrompido(s) em $service"
            ERRORS=$((ERRORS + CORRUPTED))
        else
            echo "   ✅ Todos os arquivos íntegros em $service"
        fi
    else
        echo "   ⚠️ Diretório $SERVICE_DIR não encontrado"
    fi
done

# Verificar backups por cliente
echo "👥 Verificando backups por cliente..."

ACTIVE_CLIENTS=$(psql -h postgresql.kryonix.com.br -U postgres -d kryonix_main -t -c "
    SELECT id FROM tenants.clientes WHERE status = 'ativo' LIMIT 5
")

for cliente_id in $ACTIVE_CLIENTS; do
    if [ -n "$cliente_id" ]; then
        echo "   🔍 Verificando cliente: $cliente_id"
        
        # Verificar se tem backup recente
        RECENT_BACKUP=$(find "$BACKUP_BASE" -path "*cliente_${cliente_id}*" -name "*.backup" -o -name "*.tar.gz" -mtime -1 | head -1)
        
        if [ -n "$RECENT_BACKUP" ]; then
            echo "     ✅ Backup recente encontrado"
        else
            echo "     ⚠️ Sem backup recente"
        fi
    fi
done

echo "======================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ Verificação de integridade passou"
else
    echo "❌ $ERRORS erro(s) encontrado(s)"
fi
echo "======================================="

exit $ERRORS
EOF

chmod +x /opt/kryonix/scripts/verify-backup-integrity.sh

# 13. EXECUTAR TESTE INICIAL
echo "🧪 Executando teste inicial..."
if /opt/kryonix/scripts/monitor-backup-status.py; then
    echo "✅ Monitoramento funcionando"
else
    echo "⚠️ Verificar configuração do monitoramento"
fi

echo "✅ Setup Backup Multi-Tenant concluído!"
echo "💾 Storage: https://backup.kryonix.com.br"
echo "📊 Scripts: /opt/kryonix/scripts/"
echo "📝 Logs: /opt/kryonix/logs/"
echo "⏰ Jobs agendados configurados"
echo "==============================================="
```

## ✅ **CHECKLIST DE VALIDAÇÃO MULTI-TENANT**

### **📋 INFRAESTRUTURA**
- [ ] Storage de backup isolado por cliente funcionando
- [ ] Scripts de orchestração cross-service operacionais
- [ ] Retention policies específicas por plano aplicadas
- [ ] Verificação de integridade multi-camada ativa

### **🔗 ISOLAMENTO POR CLIENTE**
- [ ] Backups PostgreSQL isolados por database
- [ ] Backups MinIO isolados por bucket pattern
- [ ] Backups Redis isolados por namespace
- [ ] Backups RabbitMQ isolados por VHost

### **📱 MOBILE-FIRST**
- [ ] Backup específico para dados mobile implementado
- [ ] Configurações PWA e biométricas preservadas
- [ ] Sync queues e offline storage backupados
- [ ] Compliance LGPD para dados mobile garantido

### **⚖️ COMPLIANCE LGPD**
- [ ] Direito ao esquecimento automatizado
- [ ] Logs de processamento com retenção correta
- [ ] Anonimização automática de dados antigos
- [ ] Relatórios de compliance gerados

### **🔄 ORCHESTRAÇÃO**
- [ ] Coordenação pré-backup funcionando
- [ ] Backup cross-service com dependências
- [ ] Verificação de consistência entre serviços
- [ ] Coordenação pós-backup e cleanup

### **📊 MONITORAMENTO**
- [ ] Status de backup por cliente monitorado
- [ ] Alertas para backups atrasados configurados
- [ ] Relatórios de integridade automáticos
- [ ] Dashboard de storage funcionando

### **💾 DISASTER RECOVERY**
- [ ] Procedures de restore por cliente testados
- [ ] Backup multi-tier funcionando
- [ ] Recovery pontual (PITR) implementado
- [ ] Testes de disaster recovery validados

---


# 📦 PARTE 03 - STORAGE MINIO MULTI-TENANT
*Agentes Responsáveis: Arquiteto Multi-Tenant + DevOps + Segurança + Mobile Expert*

## 🎯 **CONTEXTO MULTI-TENANT KRYONIX**

**MISSÃO**: Configurar MinIO como storage distribuído S3-compatible com arquitetura multi-tenant completa, buckets isolados por cliente, SDK integration e otimização mobile-first para a plataforma KRYONIX SaaS.

```yaml
Arquitetura Multi-Tenant:
  estratégia: "Buckets isolados por cliente e módulo"
  pattern: "cliente-{id}-{modulo}-{tipo}"
  auto_creation: "Scripts IA automáticos"
  sdk_integration: "@kryonix/sdk upload/download"
  mobile_optimization: "Compress��o automática para 80% mobile"
  apis_modulares: "Buckets específicos por módulo"
  monitoring_isolado: "Métricas por cliente"
```

---

## 🏗️ **ARQUITETURA MULTI-TENANT STORAGE**

### **🎯 ESTRUTURA PRINCIPAL**
```yaml
MinIO Multi-Tenant Setup:
  URL: "https://minio.kryonix.com.br"
  Console: "https://storage.kryonix.com.br"  
  Protocol: "S3 API Compatible"
  Encryption: "AES-256-SSE + Customer Keys"
  
Multi-Tenant Structure:
  Format: "cliente-{clienteId}-{modulo}-{tipo}"
  
EXEMPLO_PRÁTICO:
  cliente_siqueira_campos:
    crm: ["cliente-siqueiracampos-crm-files", "cliente-siqueiracampos-crm-attachments"]
    whatsapp: ["cliente-siqueiracampos-whatsapp-media", "cliente-siqueiracampos-whatsapp-backups"]
    documents: ["cliente-siqueiracampos-documents", "cliente-siqueiracampos-contracts"]
    
  cliente_clinica_vida:
    agendamento: ["cliente-clinicavida-agendamento-files"]
    portal: ["cliente-clinicavida-training-content", "cliente-clinicavida-training-media"]
```

### **📦 BUCKETS POR MÓDULO SAAS**
```yaml
Per-Client Buckets:
  # CRM Module
  - cliente-{id}-crm-files: "Documentos CRM"
  - cliente-{id}-crm-attachments: "Anexos de leads/deals"
  
  # WhatsApp Module  
  - cliente-{id}-whatsapp-media: "Mídia de conversas"
  - cliente-{id}-whatsapp-backups: "Backups de conversas"
  
  # Agendamento Module
  - cliente-{id}-agendamento-files: "Arquivos de consultas"
  - cliente-{id}-agendamento-docs: "Documentos médicos"
  
  # Financeiro Module
  - cliente-{id}-financeiro-docs: "Documentos financeiros"
  - cliente-{id}-financeiro-reports: "Relatórios financeiros"
  
  # Marketing Module
  - cliente-{id}-marketing-templates: "Templates de email"
  - cliente-{id}-marketing-assets: "Assets de campanhas"
  
  # Analytics Module
  - cliente-{id}-analytics-reports: "Relatórios gerados"
  - cliente-{id}-analytics-exports: "Exportações de dados"
  
  # Portal Module
  - cliente-{id}-portal-content: "Conteúdo de treinamento"
  - cliente-{id}-portal-media: "Vídeos e áudios"
  
  # Whitelabel Module
  - cliente-{id}-whitelabel-assets: "Assets personalizados"
  - cliente-{id}-whitelabel-themes: "Temas customizados"
  
  # System Buckets
  - cliente-{id}-backups: "Backups automáticos"
  - cliente-{id}-logs: "Logs de auditoria"
```

---

## 🔐 **SEGURANÇA MULTI-TENANT**

### **🛡️ ISOLAMENTO COMPLETO**
```yaml
Isolation Policies:
  - "Buckets completamente isolados por cliente"
  - "IAM policies específicas por cliente"
  - "Access keys únicos por tenant"
  - "Encryption keys isolados por cliente"
  
Per-Client Security:
  - "Custom encryption keys (cliente-{id}-key)"
  - "Separate IAM users per tenant"
  - "Bucket policies com strict prefix matching"
  - "Audit logs separados por cliente"
  
Compliance Multi-Tenant:
  - "LGPD per-client data retention"
  - "GDPR right to erasure por cliente"
  - "SOC 2 tenant isolation"
  - "Client-specific backup policies"
```

### **🔑 CONFIGURAÇÃO IAM POR CLIENTE**
```bash
#!/bin/bash
# scripts/setup-client-iam.sh

setup_client_iam() {
    local CLIENT_ID=$1
    local CLIENT_SECRET=$(openssl rand -base64 32)
    
    echo "🔐 Configurando IAM para cliente: $CLIENT_ID"
    
    # 1. Criar usuário específico do cliente
    mc admin user add kryonix "cliente-${CLIENT_ID}" "$CLIENT_SECRET"
    
    # 2. Criar política específica do cliente
    cat > "/tmp/policy-${CLIENT_ID}.json" <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::cliente-${CLIENT_ID}-*",
                "arn:aws:s3:::cliente-${CLIENT_ID}-*/*"
            ]
        }
    ]
}
EOF
    
    # 3. Aplicar política
    mc admin policy add kryonix "policy-${CLIENT_ID}" "/tmp/policy-${CLIENT_ID}.json"
    mc admin policy set kryonix "policy-${CLIENT_ID}" user="cliente-${CLIENT_ID}"
    
    # 4. Configurar encryption key específica
    mc admin kms key create kryonix "cliente-${CLIENT_ID}-key"
    
    # 5. Salvar credenciais no vault
    echo "Cliente: $CLIENT_ID" >> "/vault/storage/cliente-${CLIENT_ID}.env"
    echo "Access Key: cliente-${CLIENT_ID}" >> "/vault/storage/cliente-${CLIENT_ID}.env"
    echo "Secret Key: $CLIENT_SECRET" >> "/vault/storage/cliente-${CLIENT_ID}.env"
    echo "Encryption Key: cliente-${CLIENT_ID}-key" >> "/vault/storage/cliente-${CLIENT_ID}.env"
    
    echo "✅ IAM configurado para cliente: $CLIENT_ID"
}
```

---

## 📱 **MOBILE-FIRST OPTIMIZATION**

### **🎯 CONFIGURAÇÕES MOBILE**
```typescript
// config/mobile-storage.ts
export const MobileStorageConfig = {
    compression: {
        images: {
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
            format: 'webp',
            progressive: true
        },
        videos: {
            maxBitrate: '2M',
            maxDuration: 300, // 5 minutos
            format: 'mp4',
            codec: 'h264'
        },
        documents: {
            compression: 'high',
            maxSize: '10MB',
            formats: ['pdf', 'docx', 'xlsx']
        },
        audio: {
            bitrate: '128k',
            format: 'mp3',
            normalize: true
        }
    },
    
    upload: {
        chunkSize: 1024 * 1024, // 1MB chunks para mobile
        concurrent: 3, // Max 3 uploads simultâneos
        retryAttempts: 3,
        timeout: 30000, // 30s timeout
        resumable: true // Upload resumível
    },
    
    cache: {
        thumbnails: true,
        previewSize: '200x200',
        cacheDuration: 86400, // 24h
        compressionLevel: 9
    },
    
    cdn: {
        enabled: true,
        regions: ['sa-east-1', 'us-east-1'],
        ttl: 3600 // 1h TTL para CDN
    }
};
```

### **🔄 PROCESSAMENTO AUTOMÁTICO MOBILE**
```typescript
// services/mobile-processor.ts
export class MobileFileProcessor {
    
    async processForMobile(
        file: File | Buffer,
        type: 'image' | 'video' | 'document' | 'audio',
        options?: ProcessingOptions
    ): Promise<ProcessedFile> {
        
        switch (type) {
            case 'image':
                return await this.processImage(file, options);
            case 'video':
                return await this.processVideo(file, options);
            case 'document':
                return await this.processDocument(file, options);
            case 'audio':
                return await this.processAudio(file, options);
            default:
                return { file, processed: false };
        }
    }
    
    private async processImage(file: File | Buffer, options?: ProcessingOptions): Promise<ProcessedFile> {
        const sharp = require('sharp');
        
        const processed = await sharp(file)
            .resize(1920, 1080, { 
                fit: 'inside', 
                withoutEnlargement: true 
            })
            .webp({ 
                quality: options?.quality || 80,
                progressive: true 
            })
            .toBuffer();
            
        // Gerar thumbnail
        const thumbnail = await sharp(file)
            .resize(200, 200, { fit: 'cover' })
            .webp({ quality: 60 })
            .toBuffer();
            
        return {
            file: processed,
            thumbnail,
            processed: true,
            originalSize: file.length,
            newSize: processed.length,
            compressionRatio: (1 - processed.length / file.length) * 100
        };
    }
    
    private async processVideo(file: File | Buffer, options?: ProcessingOptions): Promise<ProcessedFile> {
        const ffmpeg = require('fluent-ffmpeg');
        
        return new Promise((resolve, reject) => {
            const outputPath = `/tmp/processed-${Date.now()}.mp4`;
            
            ffmpeg(file)
                .videoCodec('libx264')
                .audioCodec('aac')
                .videoBitrate('2000k')
                .audioBitrate('128k')
                .size('1920x1080')
                .aspect('16:9')
                .autopad()
                .format('mp4')
                .on('end', () => {
                    const processedFile = require('fs').readFileSync(outputPath);
                    resolve({
                        file: processedFile,
                        processed: true,
                        originalSize: file.length,
                        newSize: processedFile.length
                    });
                })
                .on('error', reject)
                .save(outputPath);
        });
    }
    
    private async processDocument(file: File | Buffer, options?: ProcessingOptions): Promise<ProcessedFile> {
        // Para PDFs, comprimir usando qpdf
        if (this.isPDF(file)) {
            const { exec } = require('child_process');
            const inputPath = `/tmp/input-${Date.now()}.pdf`;
            const outputPath = `/tmp/output-${Date.now()}.pdf`;
            
            require('fs').writeFileSync(inputPath, file);
            
            return new Promise((resolve, reject) => {
                exec(`qpdf --linearize --optimize-images --compress-streams=y "${inputPath}" "${outputPath}"`, (error) => {
                    if (error) {
                        resolve({ file, processed: false });
                        return;
                    }
                    
                    const processedFile = require('fs').readFileSync(outputPath);
                    resolve({
                        file: processedFile,
                        processed: true,
                        originalSize: file.length,
                        newSize: processedFile.length
                    });
                });
            });
        }
        
        return { file, processed: false };
    }
    
    private isPDF(file: File | Buffer): boolean {
        const header = file.slice(0, 4).toString('ascii');
        return header === '%PDF';
    }
}
```

---

## 🚀 **@KRYONIX/SDK INTEGRATION**

### **💻 SDK STORAGE COMPLETO**
```typescript
// sdk/storage/index.ts
import { S3 } from 'aws-sdk';
import { MobileFileProcessor } from './mobile-processor';

export class KryonixStorageSDK {
    private s3: S3;
    private clienteId: string;
    private processor: MobileFileProcessor;
    
    constructor(clienteId: string, credentials: S3Credentials) {
        this.clienteId = clienteId;
        this.processor = new MobileFileProcessor();
        
        this.s3 = new S3({
            endpoint: 'https://minio.kryonix.com.br',
            accessKeyId: credentials.accessKey,
            secretAccessKey: credentials.secretKey,
            s3ForcePathStyle: true,
            region: 'us-east-1'
        });
    }

    // Upload com auto-compression mobile
    async uploadFile(
        modulo: ModuloType,
        tipo: TipoArquivo,
        file: File | Buffer,
        options?: UploadOptions
    ): Promise<UploadResult> {
        
        const bucketName = `cliente-${this.clienteId}-${modulo}-${tipo}`;
        
        // Detectar tipo de arquivo
        const fileType = this.detectFileType(file);
        
        // Auto-compress para mobile
        const processedFile = await this.processor.processForMobile(
            file, 
            fileType, 
            options?.processing
        );
        
        // Gerar nome único
        const fileName = options?.fileName || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const key = `${fileName}.${this.getFileExtension(fileType)}`;
        
        try {
            // Upload principal
            const uploadResult = await this.s3.upload({
                Bucket: bucketName,
                Key: key,
                Body: processedFile.file,
                ContentType: this.getContentType(fileType),
                Metadata: {
                    originalSize: processedFile.originalSize?.toString() || '0',
                    processed: processedFile.processed.toString(),
                    compressionRatio: processedFile.compressionRatio?.toString() || '0',
                    uploadedVia: 'mobile',
                    clienteId: this.clienteId,
                    modulo,
                    ...options?.metadata
                },
                ServerSideEncryption: 'aws:kms',
                SSEKMSKeyId: `cliente-${this.clienteId}-key`
            }).promise();
            
            // Upload thumbnail se existir
            let thumbnailUrl;
            if (processedFile.thumbnail) {
                const thumbnailKey = `thumbnails/${fileName}.webp`;
                const thumbnailResult = await this.s3.upload({
                    Bucket: bucketName,
                    Key: thumbnailKey,
                    Body: processedFile.thumbnail,
                    ContentType: 'image/webp'
                }).promise();
                
                thumbnailUrl = thumbnailResult.Location;
            }
            
            return {
                success: true,
                fileName: key,
                url: uploadResult.Location,
                thumbnailUrl,
                size: processedFile.file.length,
                originalSize: processedFile.originalSize || 0,
                contentType: this.getContentType(fileType),
                metadata: {
                    processed: processedFile.processed,
                    compressionRatio: processedFile.compressionRatio || 0,
                    uploadedAt: new Date().toISOString()
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                fileName: key,
                url: '',
                size: 0,
                originalSize: 0,
                contentType: ''
            };
        }
    }

    // Download com CDN e cache
    async downloadFile(
        modulo: ModuloType,
        tipo: TipoArquivo,
        fileName: string,
        options?: DownloadOptions
    ): Promise<DownloadResult> {
        
        const bucketName = `cliente-${this.clienteId}-${modulo}-${tipo}`;
        
        try {
            // Verificar cache primeiro
            if (!options?.forceRefresh) {
                const cached = await this.checkCache(bucketName, fileName);
                if (cached) {
                    return {
                        url: cached.url,
                        contentType: cached.contentType,
                        size: cached.size,
                        lastModified: cached.lastModified,
                        fromCache: true
                    };
                }
            }
            
            // Gerar presigned URL
            const url = await this.s3.getSignedUrlPromise('getObject', {
                Bucket: bucketName,
                Key: fileName,
                Expires: options?.expiresIn || 3600 // 1 hora por padrão
            });
            
            // Obter metadados
            const metadata = await this.s3.headObject({
                Bucket: bucketName,
                Key: fileName
            }).promise();
            
            const result = {
                url,
                contentType: metadata.ContentType || 'application/octet-stream',
                size: metadata.ContentLength || 0,
                lastModified: metadata.LastModified || new Date(),
                fromCache: false
            };
            
            // Adicionar ao cache
            await this.addToCache(bucketName, fileName, result);
            
            return result;
            
        } catch (error) {
            throw new Error(`Failed to download file: ${error.message}`);
        }
    }

    // Lista arquivos com paginação
    async listFiles(
        modulo: ModuloType,
        tipo: TipoArquivo,
        options?: ListOptions
    ): Promise<ListResult> {
        
        const bucketName = `cliente-${this.clienteId}-${modulo}-${tipo}`;
        
        try {
            const result = await this.s3.listObjectsV2({
                Bucket: bucketName,
                Prefix: options?.prefix || '',
                MaxKeys: options?.limit || 50,
                ContinuationToken: options?.continuationToken
            }).promise();
            
            const items = result.Contents?.map(object => ({
                key: object.Key || '',
                size: object.Size || 0,
                lastModified: object.LastModified || new Date(),
                etag: object.ETag || ''
            })) || [];
            
            return {
                items,
                truncated: result.IsTruncated || false,
                continuationToken: result.NextContinuationToken,
                totalCount: result.KeyCount || 0
            };
            
        } catch (error) {
            throw new Error(`Failed to list files: ${error.message}`);
        }
    }

    // Deletar arquivo
    async deleteFile(
        modulo: ModuloType,
        tipo: TipoArquivo,
        fileName: string
    ): Promise<boolean> {
        
        const bucketName = `cliente-${this.clienteId}-${modulo}-${tipo}`;
        
        try {
            await this.s3.deleteObject({
                Bucket: bucketName,
                Key: fileName
            }).promise();
            
            // Remover do cache
            await this.removeFromCache(bucketName, fileName);
            
            return true;
            
        } catch (error) {
            console.error(`Failed to delete file: ${error.message}`);
            return false;
        }
    }
    
    // Métodos auxiliares
    private detectFileType(file: File | Buffer): 'image' | 'video' | 'document' | 'audio' {
        // Implementar detecção baseada em magic bytes ou extensão
        return 'document'; // Placeholder
    }
    
    private getContentType(fileType: string): string {
        const contentTypes = {
            'image': 'image/webp',
            'video': 'video/mp4',
            'document': 'application/pdf',
            'audio': 'audio/mpeg'
        };
        return contentTypes[fileType] || 'application/octet-stream';
    }
    
    private getFileExtension(fileType: string): string {
        const extensions = {
            'image': 'webp',
            'video': 'mp4',
            'document': 'pdf',
            'audio': 'mp3'
        };
        return extensions[fileType] || 'bin';
    }
    
    private async checkCache(bucket: string, key: string): Promise<CacheEntry | null> {
        // Implementar verificação de cache Redis
        return null; // Placeholder
    }
    
    private async addToCache(bucket: string, key: string, data: any): Promise<void> {
        // Implementar adição ao cache Redis
    }
    
    private async removeFromCache(bucket: string, key: string): Promise<void> {
        // Implementar remoção do cache Redis
    }
}

// Tipos TypeScript
type ModuloType = 'crm' | 'whatsapp' | 'agendamento' | 'financeiro' | 'marketing' | 'analytics' | 'portal' | 'whitelabel';
type TipoArquivo = 'files' | 'media' | 'attachments' | 'templates' | 'assets' | 'reports' | 'content' | 'docs' | 'backups' | 'logs';

interface S3Credentials {
    accessKey: string;
    secretKey: string;
}

interface UploadOptions {
    fileName?: string;
    metadata?: Record<string, string>;
    processing?: ProcessingOptions;
    makePublic?: boolean;
}

interface ProcessingOptions {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    compress?: boolean;
}

interface UploadResult {
    success: boolean;
    fileName: string;
    url: string;
    thumbnailUrl?: string;
    size: number;
    originalSize: number;
    contentType: string;
    metadata?: Record<string, any>;
    error?: string;
}

interface DownloadOptions {
    forceRefresh?: boolean;
    expiresIn?: number;
    downloadAsAttachment?: boolean;
}

interface DownloadResult {
    url: string;
    contentType: string;
    size: number;
    lastModified: Date;
    fromCache: boolean;
}

interface ListOptions {
    prefix?: string;
    limit?: number;
    continuationToken?: string;
}

interface ListResult {
    items: Array<{
        key: string;
        size: number;
        lastModified: Date;
        etag: string;
    }>;
    truncated: boolean;
    continuationToken?: string;
    totalCount: number;
}

interface CacheEntry {
    url: string;
    contentType: string;
    size: number;
    lastModified: Date;
}

interface ProcessedFile {
    file: Buffer;
    thumbnail?: Buffer;
    processed: boolean;
    originalSize?: number;
    newSize?: number;
    compressionRatio?: number;
}
```

---

## 🔧 **AUTO-CREATION SYSTEM**

### **🤖 SCRIPT AUTOMÁTICO DE CRIAÇÃO**
```bash
#!/bin/bash
# scripts/auto-create-client-buckets.sh

create_client_buckets() {
    local CLIENT_ID=$1
    local MODULOS_CONTRATADOS=$2 # "crm,whatsapp,agendamento"
    
    if [ -z "$CLIENT_ID" ] || [ -z "$MODULOS_CONTRATADOS" ]; then
        echo "❌ Uso: create_client_buckets <client_id> <modulos>"
        echo "📝 Exemplo: create_client_buckets siqueiracampos 'crm,whatsapp,agendamento'"
        exit 1
    fi
    
    echo "🚀 Criando buckets para cliente: $CLIENT_ID"
    echo "📦 Módulos contratados: $MODULOS_CONTRATADOS"
    
    # Converter módulos em array
    IFS=',' read -ra MODULOS_ARRAY <<< "$MODULOS_CONTRATADOS"
    
    # Criar buckets baseado nos módulos contratados
    for modulo in "${MODULOS_ARRAY[@]}"; do
        case $modulo in
            "crm")
                mc mb kryonix/cliente-${CLIENT_ID}-crm-files
                mc mb kryonix/cliente-${CLIENT_ID}-crm-attachments
                echo "✅ Buckets CRM criados"
                ;;
                
            "whatsapp")
                mc mb kryonix/cliente-${CLIENT_ID}-whatsapp-media
                mc mb kryonix/cliente-${CLIENT_ID}-whatsapp-backups
                echo "✅ Buckets WhatsApp criados"
                ;;
                
            "agendamento")
                mc mb kryonix/cliente-${CLIENT_ID}-agendamento-files
                mc mb kryonix/cliente-${CLIENT_ID}-agendamento-docs
                echo "✅ Buckets Agendamento criados"
                ;;
                
            "financeiro")
                mc mb kryonix/cliente-${CLIENT_ID}-financeiro-docs
                mc mb kryonix/cliente-${CLIENT_ID}-financeiro-reports
                echo "✅ Buckets Financeiro criados"
                ;;
                
            "marketing")
                mc mb kryonix/cliente-${CLIENT_ID}-marketing-templates
                mc mb kryonix/cliente-${CLIENT_ID}-marketing-assets
                echo "✅ Buckets Marketing criados"
                ;;
                
            "analytics")
                mc mb kryonix/cliente-${CLIENT_ID}-analytics-reports
                mc mb kryonix/cliente-${CLIENT_ID}-analytics-exports
                echo "✅ Buckets Analytics criados"
                ;;
                
            "portal")
                mc mb kryonix/cliente-${CLIENT_ID}-portal-content
                mc mb kryonix/cliente-${CLIENT_ID}-portal-media
                echo "✅ Buckets Portal criados"
                ;;
                
            "whitelabel")
                mc mb kryonix/cliente-${CLIENT_ID}-whitelabel-assets
                mc mb kryonix/cliente-${CLIENT_ID}-whitelabel-themes
                echo "✅ Buckets Whitelabel criados"
                ;;
        esac
    done
    
    # Sempre criar buckets de sistema
    mc mb kryonix/cliente-${CLIENT_ID}-backups
    mc mb kryonix/cliente-${CLIENT_ID}-logs
    echo "✅ Buckets de sistema criados"
    
    # Configurar políticas de acesso
    configure_client_policies $CLIENT_ID
    
    # Configurar lifecycle rules
    configure_client_lifecycle $CLIENT_ID
    
    # Setup monitoramento
    setup_client_monitoring $CLIENT_ID
    
    echo "🎉 Todos os buckets criados com sucesso para: $CLIENT_ID"
}

configure_client_policies() {
    local CLIENT_ID=$1
    
    echo "🔐 Configurando políticas para: $CLIENT_ID"
    
    # Criar usuário IAM específico
    setup_client_iam $CLIENT_ID
    
    # Configurar políticas de bucket
    for bucket in $(mc ls kryonix | grep "cliente-${CLIENT_ID}-" | awk '{print $5}'); do
        # Política de acesso público para assets se necessário
        if [[ $bucket =~ (assets|content|media) ]]; then
            cat > "/tmp/policy-${bucket}.json" <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {"AWS": "*"},
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${bucket}/*",
            "Condition": {
                "StringEquals": {
                    "s3:ExistingObjectTag/public": "true"
                }
            }
        }
    ]
}
EOF
            mc policy set-json "/tmp/policy-${bucket}.json" kryonix/$bucket
        fi
        
        # Configurar encryption
        mc encrypt set sse-kms "cliente-${CLIENT_ID}-key" kryonix/$bucket
        
        echo "✅ Política configurada para: $bucket"
    done
}

configure_client_lifecycle() {
    local CLIENT_ID=$1
    
    echo "♻️ Configurando lifecycle para: $CLIENT_ID"
    
    # Lifecycle para buckets de backup (arquivar após 30 dias)
    cat > "/tmp/lifecycle-backup-${CLIENT_ID}.json" <<EOF
{
    "Rules": [
        {
            "ID": "BackupTransition",
            "Status": "Enabled",
            "Filter": {"Prefix": ""},
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "GLACIER"
                },
                {
                    "Days": 90,
                    "StorageClass": "DEEP_ARCHIVE"
                }
            ]
        }
    ]
}
EOF
    
    mc ilm add --rule "/tmp/lifecycle-backup-${CLIENT_ID}.json" kryonix/cliente-${CLIENT_ID}-backups
    
    # Lifecycle para logs (deletar após 180 dias)
    cat > "/tmp/lifecycle-logs-${CLIENT_ID}.json" <<EOF
{
    "Rules": [
        {
            "ID": "LogsExpiration",
            "Status": "Enabled",
            "Filter": {"Prefix": ""},
            "Expiration": {
                "Days": 180
            }
        }
    ]
}
EOF
    
    mc ilm add --rule "/tmp/lifecycle-logs-${CLIENT_ID}.json" kryonix/cliente-${CLIENT_ID}-logs
    
    echo "✅ Lifecycle configurado para: $CLIENT_ID"
}

setup_client_monitoring() {
    local CLIENT_ID=$1
    
    echo "📊 Configurando monitoramento para: $CLIENT_ID"
    
    # Criar configuração de monitoramento específica
    cat > "/opt/kryonix/monitoring/storage/cliente-${CLIENT_ID}.yml" <<EOF
client_id: $CLIENT_ID
buckets:
  $(mc ls kryonix | grep "cliente-${CLIENT_ID}-" | awk '{print "  - " $5}')

alerts:
  storage_quota:
    threshold: 10GB
    action: notify_admin
  
  unusual_activity:
    requests_per_minute: 100
    action: alert_security
  
  backup_missing:
    max_age_hours: 24
    action: critical_alert

notifications:
  webhook: "https://api.kryonix.com.br/webhooks/storage/${CLIENT_ID}"
  email: "admin@${CLIENT_ID}.com"
EOF
    
    echo "✅ Monitoramento configurado para: $CLIENT_ID"
}

# Função principal
main() {
    local CLIENT_ID=$1
    local MODULOS=$2
    
    echo "🚀 KRYONIX - Auto-criação de Storage Multi-Tenant"
    echo "================================================="
    
    create_client_buckets $CLIENT_ID "$MODULOS"
    
    echo "================================================="
    echo "✅ Storage multi-tenant configurado com sucesso!"
    echo "🔗 Console: https://storage.kryonix.com.br"
    echo "📊 Monitoramento: https://monitoring.kryonix.com.br/storage/${CLIENT_ID}"
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

---

## 💾 **BACKUP MULTI-TENANT**

### **🔄 SISTEMA DE BACKUP AUTOMÁTICO**
```bash
#!/bin/bash
# scripts/backup-client-storage.sh

backup_client_storage() {
    local CLIENT_ID=$1
    local BACKUP_TYPE=${2:-"incremental"} # full, incremental
    
    echo "💾 Iniciando backup $BACKUP_TYPE para cliente: $CLIENT_ID"
    
    # Criar estrutura de backup
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="/backups/storage/cliente-${CLIENT_ID}/${BACKUP_DATE}"
    mkdir -p $BACKUP_DIR
    
    # Obter todos os buckets do cliente
    CLIENT_BUCKETS=$(mc ls kryonix | grep "cliente-${CLIENT_ID}-" | awk '{print $5}')
    
    if [ -z "$CLIENT_BUCKETS" ]; then
        echo "⚠️ Nenhum bucket encontrado para cliente: $CLIENT_ID"
        return 1
    fi
    
    local TOTAL_SIZE=0
    local FILES_COUNT=0
    
    for bucket in $CLIENT_BUCKETS; do
        echo "📦 Fazendo backup do bucket: $bucket"
        
        BUCKET_DIR="$BACKUP_DIR/$bucket"
        mkdir -p "$BUCKET_DIR"
        
        case $BACKUP_TYPE in
            "full")
                mc mirror --overwrite kryonix/$bucket "$BUCKET_DIR/"
                ;;
            "incremental")
                # Verificar última data de backup
                LAST_BACKUP=$(find "/backups/storage/cliente-${CLIENT_ID}" -name "manifest.json" -exec grep -l "$bucket" {} \; | tail -1)
                if [ -n "$LAST_BACKUP" ]; then
                    LAST_DATE=$(dirname "$LAST_BACKUP" | xargs basename | cut -d'_' -f1)
                    mc mirror --newer-than "${LAST_DATE}" kryonix/$bucket "$BUCKET_DIR/"
                else
                    mc mirror kryonix/$bucket "$BUCKET_DIR/"
                fi
                ;;
        esac
        
        # Calcular estatísticas
        BUCKET_SIZE=$(du -sb "$BUCKET_DIR" | cut -f1)
        BUCKET_FILES=$(find "$BUCKET_DIR" -type f | wc -l)
        
        TOTAL_SIZE=$((TOTAL_SIZE + BUCKET_SIZE))
        FILES_COUNT=$((FILES_COUNT + BUCKET_FILES))
        
        # Gerar checksum para integridade
        find "$BUCKET_DIR" -type f -exec md5sum {} \; > "$BUCKET_DIR.md5"
        
        # Comprimir bucket
        tar -czf "$BACKUP_DIR/$bucket.tar.gz" -C "$BACKUP_DIR" "$bucket/"
        rm -rf "$BUCKET_DIR/"
        
        echo "✅ Backup do bucket $bucket concluído"
    done
    
    # Gerar manifest do backup
    cat > "$BACKUP_DIR/manifest.json" <<EOF
{
    "cliente_id": "$CLIENT_ID",
    "backup_date": "$(date -Iseconds)",
    "backup_type": "$BACKUP_TYPE",
    "total_size_bytes": $TOTAL_SIZE,
    "total_files": $FILES_COUNT,
    "buckets": [
        $(echo "$CLIENT_BUCKETS" | sed 's/^/        "/' | sed 's/$/"/' | paste -sd ',')
    ],
    "retention_days": 90,
    "encryption": "AES-256",
    "compression": "gzip"
}
EOF
    
    # Criptografar backup
    tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname $BACKUP_DIR)" "$(basename $BACKUP_DIR)"
    gpg --symmetric --cipher-algo AES256 --compress-algo 1 --s2k-mode 3 --s2k-digest-algo SHA512 --s2k-count 65536 --force-mdc --passphrase-file "/vault/backup-keys/cliente-${CLIENT_ID}.key" "$BACKUP_DIR.tar.gz"
    
    # Limpar backup não criptografado
    rm -rf "$BACKUP_DIR" "$BACKUP_DIR.tar.gz"
    
    # Registrar backup no banco
    register_backup_in_db "$CLIENT_ID" "$BACKUP_DATE" "$BACKUP_TYPE" "$TOTAL_SIZE" "$FILES_COUNT"
    
    echo "🎉 Backup completo para cliente $CLIENT_ID: $(($TOTAL_SIZE / 1024 / 1024))MB, $FILES_COUNT arquivos"
}

register_backup_in_db() {
    local CLIENT_ID=$1
    local BACKUP_DATE=$2
    local BACKUP_TYPE=$3
    local TOTAL_SIZE=$4
    local FILES_COUNT=$5
    
    psql -h postgresql.kryonix.com.br -U postgres -d kryonix_core -c "
    INSERT INTO tenant_management.backup_logs (
        cliente_id, backup_date, backup_type, size_bytes, files_count, status
    ) VALUES (
        '$CLIENT_ID', '$BACKUP_DATE', '$BACKUP_TYPE', $TOTAL_SIZE, $FILES_COUNT, 'completed'
    );"
}

# Restore function
restore_client_storage() {
    local CLIENT_ID=$1
    local BACKUP_DATE=$2
    
    echo "🔄 Restaurando storage para cliente $CLIENT_ID do backup $BACKUP_DATE"
    
    BACKUP_FILE="/backups/storage/cliente-${CLIENT_ID}/${BACKUP_DATE}.tar.gz.gpg"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ Backup não encontrado: $BACKUP_FILE"
        return 1
    fi
    
    RESTORE_DIR="/tmp/restore-${CLIENT_ID}-${BACKUP_DATE}"
    mkdir -p "$RESTORE_DIR"
    
    # Descriptografar
    gpg --decrypt --passphrase-file "/vault/backup-keys/cliente-${CLIENT_ID}.key" "$BACKUP_FILE" | tar -xzf - -C "$RESTORE_DIR"
    
    # Restaurar buckets
    for bucket_archive in "$RESTORE_DIR"/*.tar.gz; do
        bucket_name=$(basename "$bucket_archive" .tar.gz)
        
        echo "📦 Restaurando bucket: $bucket_name"
        
        # Extrair bucket
        tar -xzf "$bucket_archive" -C "$RESTORE_DIR"
        
        # Sincronizar com MinIO
        mc mirror "$RESTORE_DIR/$bucket_name/" "kryonix/$bucket_name/"
        
        echo "✅ Bucket $bucket_name restaurado"
    done
    
    # Limpar arquivos temporários
    rm -rf "$RESTORE_DIR"
    
    echo "🎉 Restore completo para cliente: $CLIENT_ID"
}

# Agendar backups automáticos
schedule_automatic_backups() {
    echo "⏰ Configurando backups automáticos..."
    
    # Backup incremental diário às 2h da manhã
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/kryonix/scripts/backup-all-clients.sh incremental") | crontab -
    
    # Backup completo semanal aos domingos às 1h da manhã
    (crontab -l 2>/dev/null; echo "0 1 * * 0 /opt/kryonix/scripts/backup-all-clients.sh full") | crontab -
    
    echo "✅ Backups automáticos configurados"
}
```

---

## 📊 **MONITORAMENTO E MÉTRICAS**

### **📈 MÉTRICAS PROMETHEUS POR CLIENTE**
```yaml
# prometheus/minio-client-metrics.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'minio-multitenant'
    static_configs:
      - targets: ['minio.kryonix.com.br:9000']
    metrics_path: /minio/v2/metrics/cluster
    scheme: https
    scrape_interval: 30s
    relabel_configs:
      # Extrair cliente_id do nome do bucket
      - source_labels: [bucket]
        regex: 'cliente-([^-]+)-.*'
        target_label: client_id
        replacement: '${1}'
      
      # Extrair módulo do nome do bucket
      - source_labels: [bucket]
        regex: 'cliente-[^-]+-([^-]+)-.*'
        target_label: module
        replacement: '${1}'
      
      # Extrair tipo do nome do bucket
      - source_labels: [bucket]
        regex: 'cliente-[^-]+-[^-]+-(.+)'
        target_label: bucket_type
        replacement: '${1}'

rule_files:
  - "minio-client-alerts.yml"
  - "minio-client-rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager.kryonix.com.br:9093
```

### **🚨 ALERTAS POR CLIENTE**
```yaml
# prometheus/minio-client-alerts.yml
groups:
- name: minio-client-storage-alerts
  rules:
  
  # Quota de storage excedida
  - alert: ClientStorageQuotaExceeded
    expr: sum(minio_bucket_usage_total_bytes) by (client_id) > 10737418240 # 10GB
    for: 5m
    labels:
      severity: warning
      service: storage
      component: quota
    annotations:
      summary: "Cliente {{ $labels.client_id }} excedeu quota de storage"
      description: "Cliente {{ $labels.client_id }} está usando {{ $value | humanize1024 }}B de storage, excedendo o limite de 10GB"
      runbook_url: "https://docs.kryonix.com.br/runbooks/storage-quota"
      
  # Atividade incomum
  - alert: ClientStorageUnusualActivity
    expr: rate(minio_s3_requests_total[5m]) by (client_id) > 100
    for: 2m
    labels:
      severity: warning
      service: storage
      component: security
    annotations:
      summary: "Atividade incomum de storage para cliente {{ $labels.client_id }}"
      description: "Cliente {{ $labels.client_id }} está fazendo {{ $value }} requests/segundo, acima do normal"
      
  # Backup falhou
  - alert: ClientBackupFailed
    expr: time() - minio_client_last_backup_timestamp > 86400 # 24h
    for: 0m
    labels:
      severity: critical
      service: backup
      component: storage
    annotations:
      summary: "Backup de storage falhou para cliente {{ $labels.client_id }}"
      description: "Último backup do cliente {{ $labels.client_id }} foi há {{ $value | humanizeDuration }}"
      
  # Erro de upload frequente
  - alert: ClientUploadErrorRate
    expr: rate(minio_s3_errors_total[5m]) by (client_id) > 0.1
    for: 3m
    labels:
      severity: warning
      service: storage
      component: uploads
    annotations:
      summary: "Alta taxa de erros de upload para cliente {{ $labels.client_id }}"
      description: "Cliente {{ $labels.client_id }} está com {{ $value }} erros/segundo em uploads"
      
  # Bucket não acessado há muito tempo
  - alert: ClientBucketStale
    expr: time() - minio_bucket_last_access_timestamp > 7776000 # 90 dias
    for: 0m
    labels:
      severity: info
      service: storage
      component: optimization
    annotations:
      summary: "Bucket não acessado há 90 dias para cliente {{ $labels.client_id }}"
      description: "Bucket {{ $labels.bucket }} do cliente {{ $labels.client_id }} não é acessado há 90 dias"
```

### **📊 DASHBOARD GRAFANA POR CLIENTE**
```json
{
  "dashboard": {
    "title": "KRYONIX Storage Multi-Tenant",
    "tags": ["kryonix", "storage", "multi-tenant"],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "panels": [
      {
        "title": "Storage Usage by Client",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(minio_bucket_usage_total_bytes) by (client_id)",
            "legendFormat": "{{ client_id }}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "bytes",
            "min": 0
          }
        }
      },
      {
        "title": "Requests per Second by Client",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(minio_s3_requests_total[5m]) by (client_id)",
            "legendFormat": "{{ client_id }}"
          }
        ]
      },
      {
        "title": "Storage by Module",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum(minio_bucket_usage_total_bytes) by (module)",
            "legendFormat": "{{ module }}"
          }
        ]
      },
      {
        "title": "Upload/Download Ratio",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(minio_s3_requests_total{api=\"PutObject\"}[5m]) by (client_id)",
            "legendFormat": "Uploads - {{ client_id }}"
          },
          {
            "expr": "rate(minio_s3_requests_total{api=\"GetObject\"}[5m]) by (client_id)",
            "legendFormat": "Downloads - {{ client_id }}"
          }
        ]
      },
      {
        "title": "Error Rate by Client",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(minio_s3_errors_total[5m]) by (client_id)",
            "legendFormat": "{{ client_id }}"
          }
        ]
      },
      {
        "title": "Top Files by Size",
        "type": "table",
        "targets": [
          {
            "expr": "topk(10, minio_bucket_objects_size_distribution_bytes) by (client_id, bucket, object)",
            "format": "table"
          }
        ]
      }
    ],
    "templating": {
      "list": [
        {
          "name": "client_id",
          "type": "query",
          "query": "label_values(minio_bucket_usage_total_bytes, client_id)",
          "multi": true,
          "includeAll": true
        },
        {
          "name": "module",
          "type": "query",
          "query": "label_values(minio_bucket_usage_total_bytes{client_id=\"$client_id\"}, module)",
          "multi": true,
          "includeAll": true
        }
      ]
    }
  }
}
```

---

## 🧪 **TESTES E VALIDAÇÃO**

### **🔬 SUITE DE TESTES MULTI-TENANT**
```bash
#!/bin/bash
# tests/test-storage-multitenant.sh

test_storage_multitenant() {
    echo "🧪 KRYONIX - Testes Storage Multi-Tenant"
    echo "========================================"
    
    local ERRORS=0
    
    # Teste 1: Criação automática de buckets
    echo "📦 Teste 1: Criação automática de buckets"
    if create_client_buckets "testclient" "crm,whatsapp"; then
        echo "✅ Buckets criados com sucesso"
    else
        echo "❌ Falha na criação de buckets"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 2: Isolamento entre clientes
    echo "🔒 Teste 2: Isolamento entre clientes"
    
    # Criar dois clientes teste
    create_client_buckets "client1" "crm"
    create_client_buckets "client2" "crm"
    
    # Cliente 1 faz upload
    echo "test file 1" > /tmp/test1.txt
    mc cp /tmp/test1.txt kryonix/cliente-client1-crm-files/
    
    # Cliente 2 não deve conseguir acessar arquivo do cliente 1
    if mc cp kryonix/cliente-client1-crm-files/test1.txt /tmp/test1-copy.txt 2>/dev/null; then
        echo "❌ Falha no isolamento: cliente 2 acessou dados do cliente 1"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ Isolamento funcionando corretamente"
    fi
    
    # Teste 3: SDK Integration
    echo "🔗 Teste 3: SDK Integration"
    
    # Simular upload via SDK
    cat > /tmp/test-sdk.js << 'EOF'
const { KryonixStorageSDK } = require('@kryonix/sdk');

async function testSDK() {
    const sdk = new KryonixStorageSDK('testclient', {
        accessKey: 'cliente-testclient',
        secretKey: process.env.TEST_SECRET_KEY
    });
    
    try {
        // Upload teste
        const buffer = Buffer.from('test file content');
        const result = await sdk.uploadFile('crm', 'files', buffer, {
            fileName: 'test-sdk.txt'
        });
        
        console.log('✅ SDK upload bem-sucedido:', result.fileName);
        
        // Download teste
        const downloadResult = await sdk.downloadFile('crm', 'files', result.fileName);
        console.log('✅ SDK download bem-sucedido:', downloadResult.url);
        
        return true;
    } catch (error) {
        console.log('❌ SDK falhou:', error.message);
        return false;
    }
}

testSDK().then(success => process.exit(success ? 0 : 1));
EOF
    
    if TEST_SECRET_KEY=$(cat /vault/storage/cliente-testclient.env | grep "Secret Key" | cut -d: -f2 | xargs) node /tmp/test-sdk.js; then
        echo "✅ SDK funcionando corretamente"
    else
        echo "❌ Falha no SDK"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 4: Compressão mobile
    echo "📱 Teste 4: Compressão mobile"
    
    # Criar imagem de teste grande
    convert -size 2048x2048 xc:red /tmp/large-image.jpg
    ORIGINAL_SIZE=$(stat -f%z /tmp/large-image.jpg)
    
    # Upload via SDK com compressão
    cat > /tmp/test-compression.js << 'EOF'
const { KryonixStorageSDK } = require('@kryonix/sdk');
const fs = require('fs');

async function testCompression() {
    const sdk = new KryonixStorageSDK('testclient', {
        accessKey: 'cliente-testclient',
        secretKey: process.env.TEST_SECRET_KEY
    });
    
    const imageBuffer = fs.readFileSync('/tmp/large-image.jpg');
    
    const result = await sdk.uploadFile('crm', 'files', imageBuffer, {
        fileName: 'large-image.jpg',
        processing: { quality: 0.8 }
    });
    
    console.log('Original:', imageBuffer.length, 'Compressed:', result.size);
    console.log('Compression ratio:', result.metadata.compressionRatio + '%');
    
    return result.size < imageBuffer.length;
}

testCompression().then(success => {
    console.log(success ? '✅ Compressão funcionando' : '❌ Compressão falhou');
    process.exit(success ? 0 : 1);
});
EOF
    
    if TEST_SECRET_KEY=$(cat /vault/storage/cliente-testclient.env | grep "Secret Key" | cut -d: -f2 | xargs) node /tmp/test-compression.js; then
        echo "✅ Compressão mobile funcionando"
    else
        echo "❌ Falha na compressão mobile"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 5: Backup e restore
    echo "💾 Teste 5: Backup e restore"
    
    # Fazer backup
    if backup_client_storage "testclient" "full"; then
        echo "✅ Backup realizado com sucesso"
        
        # Deletar buckets originais
        for bucket in $(mc ls kryonix | grep "cliente-testclient-" | awk '{print $5}'); do
            mc rb --force kryonix/$bucket
        done
        
        # Restaurar
        LATEST_BACKUP=$(ls -t /backups/storage/cliente-testclient/ | head -1 | cut -d. -f1)
        if restore_client_storage "testclient" "$LATEST_BACKUP"; then
            echo "✅ Restore realizado com sucesso"
        else
            echo "❌ Falha no restore"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo "❌ Falha no backup"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Limpeza
    echo "🧹 Limpando dados de teste..."
    for bucket in $(mc ls kryonix | grep -E "cliente-(testclient|client1|client2)-" | awk '{print $5}'); do
        mc rb --force kryonix/$bucket 2>/dev/null || true
    done
    
    rm -f /tmp/test*.txt /tmp/test*.js /tmp/large-image.jpg
    
    # Resultado final
    echo "========================================"
    if [ $ERRORS -eq 0 ]; then
        echo "🎉 Todos os testes passaram!"
        echo "✅ Storage Multi-Tenant funcionando perfeitamente"
    else
        echo "❌ $ERRORS teste(s) falharam"
        echo "🔧 Verifique os logs para mais detalhes"
    fi
    
    return $ERRORS
}

# Executar testes se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    test_storage_multitenant
fi
```

---

## 🚀 **COMANDOS DE EXECUÇÃO PRÁTICOS**

### **⚡ SETUP COMPLETO MULTI-TENANT**
```bash
#!/bin/bash
# setup-minio-multitenant.sh
# Setup completo MinIO Multi-Tenant para KRYONIX

echo "🚀 KRYONIX - Setup MinIO Multi-Tenant"
echo "====================================="

# 1. CRIAR ESTRUTURA DE DIRETÓRIOS
echo "📁 Criando estrutura de diretórios..."
mkdir -p /opt/kryonix/{minio/{data,config},scripts,monitoring/storage,vault/storage,backups/storage}

# 2. CONFIGURAR MINIO SERVIDOR
echo "🗄️ Configurando MinIO servidor..."
docker run -d \
  --name minio-kryonix \
  --restart always \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=kryonix_admin \
  -e MINIO_ROOT_PASSWORD=kryonix_secure_storage_2025 \
  -e MINIO_PROMETHEUS_AUTH_TYPE=public \
  -v /opt/kryonix/minio/data:/data \
  -v /opt/kryonix/minio/config:/root/.minio \
  minio/minio server /data --console-address ":9001"

# 3. AGUARDAR MINIO INICIALIZAR
echo "⏳ Aguardando MinIO inicializar..."
sleep 30

# 4. CONFIGURAR MINIO CLIENT
echo "🔧 Configurando MinIO client..."
mc alias set kryonix https://minio.kryonix.com.br kryonix_admin kryonix_secure_storage_2025

# 5. CONFIGURAR SSL/TLS
echo "🔒 Configurando SSL/TLS..."
cat > /opt/kryonix/minio/config/certs/kryonix.crt << 'EOF'
# Certificado SSL será gerado automaticamente via Let's Encrypt
EOF

# 6. INSTALAR FERRAMENTAS DE PROCESSAMENTO
echo "🛠️ Instalando ferramentas de processamento..."
apt-get update && apt-get install -y \
  imagemagick \
  ffmpeg \
  qpdf \
  gpg

# 7. CONFIGURAR MÉTRICAS PROMETHEUS
echo "📊 Configurando métricas Prometheus..."
cat > /opt/kryonix/monitoring/storage/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'minio'
    static_configs:
      - targets: ['minio.kryonix.com.br:9000']
    metrics_path: /minio/v2/metrics/cluster
    scheme: https
EOF

# 8. CONFIGURAR ALERTAS
echo "🚨 Configurando alertas..."
cp "$(dirname $0)/prometheus/minio-client-alerts.yml" /opt/kryonix/monitoring/storage/

# 9. CONFIGURAR BACKUP AUTOMÁTICO
echo "💾 Configurando backup automático..."
cp "$(dirname $0)/scripts/backup-client-storage.sh" /opt/kryonix/scripts/
chmod +x /opt/kryonix/scripts/*.sh

# 10. AGENDAR BACKUPS
echo "⏰ Agendando backups automáticos..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/kryonix/scripts/backup-all-clients.sh incremental") | crontab -
(crontab -l 2>/dev/null; echo "0 1 * * 0 /opt/kryonix/scripts/backup-all-clients.sh full") | crontab -

# 11. CRIAR CLIENTE DE EXEMPLO
echo "👤 Criando cliente de exemplo..."
./scripts/auto-create-client-buckets.sh "exemploempresa" "crm,whatsapp,agendamento"

# 12. EXECUTAR TESTES
echo "🧪 Executando testes de validação..."
./tests/test-storage-multitenant.sh

echo "✅ Setup MinIO Multi-Tenant concluído!"
echo "🔗 Console: https://storage.kryonix.com.br"
echo "📊 Métricas: https://minio.kryonix.com.br:9000/metrics"
echo "💾 Backups: /opt/kryonix/backups/storage/"
echo "====================================="
```

---

## ✅ **CHECKLIST DE VALIDAÇÃO MULTI-TENANT**

### **📋 INFRAESTRUTURA**
- [ ] MinIO acessível com SSL em minio.kryonix.com.br
- [ ] Console multi-tenant acessível em storage.kryonix.com.br
- [ ] Certificados SSL configurados e válidos
- [ ] Prometheus metrics endpoint funcionando

### **🔐 SEGURANÇA**
- [ ] IAM policies isoladas por cliente funcionando
- [ ] Encryption keys específicos por cliente
- [ ] Bucket policies restritivas aplicadas
- [ ] Audit logs separados por cliente

### **📦 MULTI-TENANCY**
- [ ] Script de auto-criação de buckets funcionando
- [ ] Isolamento completo entre clientes validado
- [ ] Nomenclatura de buckets seguindo padrão
- [ ] Políticas de lifecycle por cliente ativas

### **🔗 SDK INTEGRATION**
- [ ] @kryonix/sdk integrado e testado
- [ ] Upload/download funcionando via SDK
- [ ] Compressão automática mobile ativa
- [ ] Cache e CDN configurados

### **📱 MOBILE-FIRST**
- [ ] Compressão de imagens/vídeos funcionando
- [ ] Thumbnails gerados automaticamente
- [ ] Upload resumível implementado
- [ ] Performance otimizada para mobile

### **💾 BACKUP E RESTORE**
- [ ] Backup automático por cliente funcionando
- [ ] Criptografia de backups ativa
- [ ] Restore testado e funcionando
- [ ] Retention policies configuradas

### **📊 MONITORAMENTO**
- [ ] Métricas específicas por cliente coletadas
- [ ] Alertas específicos por cliente configurados
- [ ] Dashboard Grafana funcionando
- [ ] Relatórios de uso disponíveis

### **🧪 TESTES**
- [ ] Todos os testes automatizados passando
- [ ] Testes de isolamento validados
- [ ] Testes de performance mobile OK
- [ ] Testes de backup/restore bem-sucedidos

---


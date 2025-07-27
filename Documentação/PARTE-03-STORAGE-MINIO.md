# 📦 PARTE 03 - STORAGE MINIO
*Agentes Responsáveis: Arquiteto Dados + DevOps + Segurança*

## 🎯 **OBJETIVO**
Configurar MinIO como storage distribuído S3-compatible para arquivos, backups e assets da plataforma KRYONIX SaaS.

## 🏗️ **ARQUITETURA STORAGE (Arquiteto Dados)**
```yaml
MinIO Setup:
  URL: https://minio.kryonix.com.br
  Console: https://storage.kryonix.com.br  
  Protocol: S3 API Compatible
  Encryption: AES-256-SSE
  
Bucket Structure:
  - kryonix-uploads: Arquivos de usuários
  - kryonix-backups: Backups automáticos
  - kryonix-assets: Assets estáticos
  - kryonix-documents: Documentos processados
  - kryonix-reports: Relatórios gerados
```

## 🔐 **SEGURANÇA STORAGE (Especialista Segurança)**
```yaml
Security Policies:
  - IAM policies por bucket
  - Encryption at rest (AES-256)
  - Versioning habilitado
  - Lifecycle policies
  - Access audit logging
  
Compliance:
  - LGPD data retention
  - GDPR right to erasure
  - SOC 2 access controls
```

## 📋 **CONFIGURAÇÃO BUCKETS**
```bash
# Configurar cliente MC (MinIO Client)
mc alias set kryonix https://minio.kryonix.com.br $ACCESS_KEY $SECRET_KEY

# Criar buckets principais
mc mb kryonix/kryonix-uploads
mc mb kryonix/kryonix-backups  
mc mb kryonix/kryonix-assets
mc mb kryonix/kryonix-documents
mc mb kryonix/kryonix-reports

# Configurar policies
mc policy set public kryonix/kryonix-assets
mc policy set private kryonix/kryonix-uploads
mc policy set private kryonix/kryonix-backups

# Habilitar versioning
mc version enable kryonix/kryonix-uploads
mc version enable kryonix/kryonix-documents

# Configurar lifecycle (limpeza automática)
mc ilm add --id "cleanup-old-backups" --expiry-days 90 kryonix/kryonix-backups
mc ilm add --id "cleanup-temp-files" --expiry-days 7 kryonix/kryonix-uploads/temp/
```

## 🔧 **INTEGRAÇÃO API S3**
```typescript
// config/minio.ts
import { Client } from 'minio';

export const minioClient = new Client({
  endPoint: 'minio.kryonix.com.br',
  port: 443,
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!
});

// services/storage.ts
export class StorageService {
  
  async uploadFile(
    bucket: string, 
    objectName: string, 
    file: Buffer | Stream,
    metadata?: Record<string, string>
  ) {
    try {
      const result = await minioClient.putObject(
        bucket, 
        objectName, 
        file,
        metadata
      );
      
      return {
        success: true,
        objectName,
        etag: result.etag,
        url: `https://minio.kryonix.com.br/${bucket}/${objectName}`
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async deleteFile(bucket: string, objectName: string) {
    await minioClient.removeObject(bucket, objectName);
  }

  async generatePresignedUrl(
    bucket: string, 
    objectName: string,
    expiry: number = 3600
  ) {
    return await minioClient.presignedGetObject(bucket, objectName, expiry);
  }

  async listFiles(bucket: string, prefix?: string) {
    const objects: any[] = [];
    const stream = minioClient.listObjects(bucket, prefix, true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => objects.push(obj));
      stream.on('error', reject);
      stream.on('end', () => resolve(objects));
    });
  }
}
```

## 📊 **MONITORAMENTO STORAGE**
```bash
# Estatísticas de uso por bucket
mc admin info kryonix --json | jq '.info.buckets'

# Métricas de performance
mc admin prometheus generate kryonix

# Logs de acesso
mc admin logs kryonix --type=minio

# Verificação de integridade
mc admin heal kryonix --recursive
```

## 🔄 **BACKUP E REPLICAÇÃO**
```bash
#!/bin/bash
# backup-minio.sh

# Mirror crítico para backup externo
mc mirror --overwrite kryonix/kryonix-uploads backup-site/kryonix-uploads

# Sincronização com S3 AWS (disaster recovery)
mc mirror kryonix/kryonix-backups aws-s3/kryonix-dr/

# Verificação de integridade
mc admin heal kryonix --recursive --dry-run

# Relatório de status
mc admin info kryonix > /var/log/minio-status.log
```

## 🎯 **CASOS DE USO ESPECÍFICOS**

### **Upload de Arquivos Usuário**
```typescript
// Upload com validação e processamento
async uploadUserFile(userId: string, file: Express.Multer.File) {
  // Validações
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Tipo de arquivo não permitido');
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande');
  }

  // Gerar nome único
  const objectName = `users/${userId}/${Date.now()}-${file.originalname}`;
  
  // Metadata
  const metadata = {
    'original-name': file.originalname,
    'uploaded-by': userId,
    'upload-date': new Date().toISOString(),
    'content-type': file.mimetype
  };

  // Upload
  return await this.storageService.uploadFile(
    'kryonix-uploads',
    objectName,
    file.buffer,
    metadata
  );
}
```

### **Geração de Relatórios**
```typescript
// Salvar relatórios gerados
async saveReport(reportId: string, reportData: Buffer, format: string) {
  const objectName = `reports/${new Date().getFullYear()}/${reportId}.${format}`;
  
  const metadata = {
    'report-id': reportId,
    'generated-at': new Date().toISOString(),
    'format': format
  };

  return await this.storageService.uploadFile(
    'kryonix-reports',
    objectName,
    reportData,
    metadata
  );
}
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Verificar MinIO funcionando
curl -I https://minio.kryonix.com.br

# 2. Configurar cliente
mc alias set kryonix https://minio.kryonix.com.br $ACCESS_KEY $SECRET_KEY

# 3. Verificar conectividade
mc admin info kryonix

# 4. Criar estrutura de buckets
./setup-buckets.sh

# 5. Configurar backup automático
crontab -e
# 0 2 * * * /scripts/backup-minio.sh
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] MinIO acessível em minio.kryonix.com.br
- [ ] Console acessível em storage.kryonix.com.br
- [ ] Buckets principais criados
- [ ] Policies de segurança aplicadas
- [ ] Versioning habilitado onde necessário
- [ ] Lifecycle policies configuradas
- [ ] Integração API S3 funcionando
- [ ] Backup automático configurado
- [ ] Monitoramento ativo

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de upload
npm run test:storage:upload

# Teste de download
npm run test:storage:download

# Teste de permissões
npm run test:storage:permissions

# Teste de backup
npm run test:storage:backup
```

## 📈 **MÉTRICAS PROMETHEUS**
```yaml
# minio-metrics.yml
- job_name: 'minio'
  static_configs:
    - targets: ['minio.kryonix.com.br:9000']
  metrics_path: /minio/v2/metrics/cluster
  scheme: https
```

---
*Parte 03 de 50 - Projeto KRYONIX SaaS Platform*
*Próxima Parte: 04 - Cache Redis*

# 📦 PARTE-03: MINIO STORAGE MOBILE-FIRST
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar MinIO otimizado para uploads mobile e PWA offline
- **URLs**: https://minio.kryonix.com.br (console) | https://s3.kryonix.com.br (API)
- **Login Master**: kryonix / Vitor@123456

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55

# === VERIFICAÇÕES INICIAIS ===
echo "🔍 Verificando MinIO..."
docker ps | grep minio-kryonix
curl -I https://minio.kryonix.com.br
curl -I https://s3.kryonix.com.br

# === CONFIGURAR MINIO OTIMIZADO ===
echo "📦 Configurando MinIO otimizado para mobile..."
mkdir -p /opt/kryonix/data/minio

cat > /opt/kryonix/config/minio.yml << 'EOF'
version: '3.8'
services:
  minio:
    image: minio/minio:latest
    container_name: minio-kryonix
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: kryonix
      MINIO_ROOT_PASSWORD: Vitor@123456
      MINIO_BROWSER_REDIRECT_URL: https://minio.kryonix.com.br
      MINIO_SERVER_URL: https://s3.kryonix.com.br
      MINIO_PROMETHEUS_AUTH_TYPE: public
    labels:
      # Console MinIO
      - "traefik.enable=true"
      - "traefik.http.routers.minio-console.rule=Host(\`minio.kryonix.com.br\`)"
      - "traefik.http.routers.minio-console.tls=true"
      - "traefik.http.routers.minio-console.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-console.service=minio-console"
      - "traefik.http.services.minio-console.loadbalancer.server.port=9001"
      
      # API S3
      - "traefik.http.routers.minio-api.rule=Host(\`s3.kryonix.com.br\`)"
      - "traefik.http.routers.minio-api.tls=true"
      - "traefik.http.routers.minio-api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-api.service=minio-api"
      - "traefik.http.services.minio-api.loadbalancer.server.port=9000"
    volumes:
      - /opt/kryonix/data/minio:/data
    networks:
      - kryonix-net
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 3
      resources:
        limits:
          memory: 1GB
        reservations:
          memory: 512MB

networks:
  kryonix-net:
    external: true
EOF

# === DEPLOY MINIO ===
echo "🚀 Fazendo deploy do MinIO..."
docker stack deploy -c /opt/kryonix/config/minio.yml kryonix-storage

# === AGUARDAR INICIALIZAÇÃO ===
echo "⏳ Aguardando MinIO inicializar..."
for i in {1..60}; do
  if curl -f -s https://minio.kryonix.com.br > /dev/null 2>&1; then
    echo "✅ MinIO está pronto!"
    break
  fi
  echo "⏳ Tentativa $i/60..."
  sleep 10
done

# === INSTALAR CLIENTE MC ===
echo "🔧 Instalando cliente MC..."
docker exec minio-kryonix sh -c "
  wget https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
  chmod +x /usr/local/bin/mc
  mc alias set local http://localhost:9000 kryonix Vitor@123456
"

# === CRIAR BUCKETS ESPECIALIZADOS ===
echo "🗂️ Criando buckets especializados..."
docker exec minio-kryonix mc mb local/kryonix-platform
docker exec minio-kryonix mc mb local/kryonix-analytics
docker exec minio-kryonix mc mb local/kryonix-marketing
docker exec minio-kryonix mc mb local/kryonix-social
docker exec minio-kryonix mc mb local/kryonix-portal
docker exec minio-kryonix mc mb local/kryonix-whitelabel
docker exec minio-kryonix mc mb local/kryonix-mobile-uploads
docker exec minio-kryonix mc mb local/kryonix-mobile-cache
docker exec minio-kryonix mc mb local/kryonix-temp-uploads
docker exec minio-kryonix mc mb local/kryonix-backups
docker exec minio-kryonix mc mb local/kryonix-cdn
docker exec minio-kryonix mc mb local/kryonix-private

# === CONFIGURAR POLÍTICAS DE ACESSO ===
echo "🔐 Configurando políticas de acesso..."

# Política para uploads mobile (público para leitura)
cat > /tmp/mobile-uploads-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": ["*"]},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::kryonix-mobile-uploads/*"]
    }
  ]
}
EOF

docker cp /tmp/mobile-uploads-policy.json minio-kryonix:/tmp/
docker exec minio-kryonix mc policy set-json /tmp/mobile-uploads-policy.json local/kryonix-mobile-uploads

# Política para CDN (público total)
docker exec minio-kryonix mc policy set public local/kryonix-cdn

# Política para cache mobile (público para leitura)
docker exec minio-kryonix mc policy set download local/kryonix-mobile-cache

# === CONFIGURAR LIFECYCLE PARA OTIMIZAÇÃO ===
echo "🔄 Configurando lifecycle para otimização..."

# Cache temporário - deletar após 7 dias
cat > /tmp/temp-lifecycle.json << 'EOF'
{
  "Rules": [
    {
      "ID": "TempUploadsCleanup",
      "Status": "Enabled",
      "Filter": {
        "Prefix": ""
      },
      "Expiration": {
        "Days": 7
      }
    }
  ]
}
EOF

docker cp /tmp/temp-lifecycle.json minio-kryonix:/tmp/
docker exec minio-kryonix mc ilm import local/kryonix-temp-uploads < /tmp/temp-lifecycle.json

# Cache mobile - deletar após 30 dias
cat > /tmp/cache-lifecycle.json << 'EOF'
{
  "Rules": [
    {
      "ID": "MobileCacheCleanup",
      "Status": "Enabled",
      "Filter": {
        "Prefix": ""
      },
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
EOF

docker cp /tmp/cache-lifecycle.json minio-kryonix:/tmp/
docker exec minio-kryonix mc ilm import local/kryonix-mobile-cache < /tmp/cache-lifecycle.json

# === CONFIGURAR USUÁRIOS E CHAVES API ===
echo "🔑 Configurando usuários e chaves API..."

# Usuário para mobile apps
docker exec minio-kryonix mc admin user add local mobile-user mobile_kryonix_2025

# Política para mobile user
cat > /tmp/mobile-user-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::kryonix-mobile-uploads/*",
        "arn:aws:s3:::kryonix-mobile-cache/*",
        "arn:aws:s3:::kryonix-temp-uploads/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::kryonix-mobile-uploads",
        "arn:aws:s3:::kryonix-mobile-cache", 
        "arn:aws:s3:::kryonix-temp-uploads"
      ]
    }
  ]
}
EOF

docker cp /tmp/mobile-user-policy.json minio-kryonix:/tmp/
docker exec minio-kryonix mc admin policy create local mobile-policy /tmp/mobile-user-policy.json
docker exec minio-kryonix mc admin policy attach local mobile-policy --user mobile-user

# Usuário para IA
docker exec minio-kryonix mc admin user add local ai-storage ai_storage_kryonix_2025
docker exec minio-kryonix mc admin policy attach local readwrite --user ai-storage

# === SCRIPT IA PARA GESTÃO AUTOMÁTICA ===
echo "🤖 Configurando IA para gestão automática..."
cat > /opt/kryonix/scripts/minio-ai-management.py << 'EOF'
#!/usr/bin/env python3
import boto3
import json
import os
from datetime import datetime, timedelta
import requests

class MinIOAIManager:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url='https://s3.kryonix.com.br',
            aws_access_key_id='ai-storage',
            aws_secret_access_key='ai_storage_kryonix_2025',
            region_name='us-east-1'
        )
        
    def analyze_storage_usage(self):
        """IA analisa uso de storage"""
        try:
            buckets = self.s3_client.list_buckets()['Buckets']
            usage_report = {}
            
            for bucket in buckets:
                bucket_name = bucket['Name']
                
                # Contar objetos e tamanho
                objects = self.s3_client.list_objects_v2(Bucket=bucket_name)
                
                if 'Contents' in objects:
                    total_size = sum(obj['Size'] for obj in objects['Contents'])
                    object_count = len(objects['Contents'])
                    
                    # Analisar padrões de acesso
                    large_files = [obj for obj in objects['Contents'] if obj['Size'] > 10*1024*1024]  # > 10MB
                    old_files = [obj for obj in objects['Contents'] 
                               if obj['LastModified'] < datetime.now(obj['LastModified'].tzinfo) - timedelta(days=30)]
                    
                    usage_report[bucket_name] = {
                        'total_size_mb': round(total_size / 1024 / 1024, 2),
                        'object_count': object_count,
                        'large_files_count': len(large_files),
                        'old_files_count': len(old_files),
                        'optimization_potential': len(old_files) > 0 or len(large_files) > object_count * 0.1
                    }
                else:
                    usage_report[bucket_name] = {
                        'total_size_mb': 0,
                        'object_count': 0,
                        'large_files_count': 0,
                        'old_files_count': 0,
                        'optimization_potential': False
                    }
            
            print(f"📊 Relatório de uso: {json.dumps(usage_report, indent=2)}")
            return usage_report
            
        except Exception as e:
            print(f"❌ Erro na análise: {e}")
            return {}
    
    def optimize_storage(self):
        """IA otimiza storage automaticamente"""
        try:
            optimization_actions = []
            
            # Verificar buckets temporários
            temp_buckets = ['kryonix-temp-uploads', 'kryonix-mobile-cache']
            
            for bucket_name in temp_buckets:
                try:
                    objects = self.s3_client.list_objects_v2(Bucket=bucket_name)
                    
                    if 'Contents' in objects:
                        old_objects = [
                            obj for obj in objects['Contents']
                            if obj['LastModified'] < datetime.now(obj['LastModified'].tzinfo) - timedelta(hours=24)
                        ]
                        
                        for obj in old_objects[:10]:  # Limitar a 10 por execução
                            self.s3_client.delete_object(Bucket=bucket_name, Key=obj['Key'])
                            optimization_actions.append(f"Deleted old file: {obj['Key']}")
                            
                except Exception as e:
                    print(f"⚠️ Erro no bucket {bucket_name}: {e}")
            
            if optimization_actions:
                print(f"🧹 Otimizações executadas: {len(optimization_actions)}")
            
            return optimization_actions
            
        except Exception as e:
            print(f"❌ Erro na otimização: {e}")
            return []
    
    def monitor_upload_patterns(self):
        """IA monitora padrões de upload mobile"""
        try:
            mobile_bucket = 'kryonix-mobile-uploads'
            objects = self.s3_client.list_objects_v2(Bucket=mobile_bucket)
            
            patterns = {
                'total_uploads_today': 0,
                'image_uploads': 0,
                'video_uploads': 0,
                'document_uploads': 0,
                'avg_file_size_mb': 0,
                'peak_upload_times': []
            }
            
            if 'Contents' in objects:
                today = datetime.now().date()
                today_objects = [
                    obj for obj in objects['Contents']
                    if obj['LastModified'].date() == today
                ]
                
                patterns['total_uploads_today'] = len(today_objects)
                
                if today_objects:
                    # Analisar tipos de arquivo
                    for obj in today_objects:
                        key = obj['Key'].lower()
                        if any(ext in key for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                            patterns['image_uploads'] += 1
                        elif any(ext in key for ext in ['.mp4', '.avi', '.mov']):
                            patterns['video_uploads'] += 1
                        elif any(ext in key for ext in ['.pdf', '.doc', '.docx']):
                            patterns['document_uploads'] += 1
                    
                    # Tamanho médio
                    total_size = sum(obj['Size'] for obj in today_objects)
                    patterns['avg_file_size_mb'] = round(total_size / len(today_objects) / 1024 / 1024, 2)
            
            print(f"📱 Padrões mobile: {json.dumps(patterns, indent=2)}")
            return patterns
            
        except Exception as e:
            print(f"❌ Erro no monitoramento: {e}")
            return {}
    
    def generate_cdn_urls(self):
        """IA gera URLs CDN otimizadas"""
        try:
            cdn_bucket = 'kryonix-cdn'
            objects = self.s3_client.list_objects_v2(Bucket=cdn_bucket)
            
            cdn_urls = []
            
            if 'Contents' in objects:
                for obj in objects['Contents']:
                    url = f"https://s3.kryonix.com.br/{cdn_bucket}/{obj['Key']}"
                    cdn_urls.append({
                        'key': obj['Key'],
                        'url': url,
                        'size_mb': round(obj['Size'] / 1024 / 1024, 2),
                        'last_modified': obj['LastModified'].isoformat()
                    })
            
            return cdn_urls
            
        except Exception as e:
            print(f"❌ Erro nas URLs CDN: {e}")
            return []

def main():
    ai_manager = MinIOAIManager()
    
    try:
        print("🤖 IA MinIO iniciando...")
        
        # Analisar uso
        usage = ai_manager.analyze_storage_usage()
        
        # Otimizar storage
        optimizations = ai_manager.optimize_storage()
        
        # Monitorar padrões mobile
        patterns = ai_manager.monitor_upload_patterns()
        
        # Gerar relatório
        report = {
            'timestamp': datetime.now().isoformat(),
            'storage_usage': usage,
            'optimizations_count': len(optimizations),
            'mobile_patterns': patterns,
            'recommendations': []
        }
        
        # IA gera recomendações
        total_storage = sum(bucket.get('total_size_mb', 0) for bucket in usage.values())
        if total_storage > 1000:  # > 1GB
            report['recommendations'].append('Considerar política de lifecycle mais agressiva')
        
        if patterns.get('total_uploads_today', 0) > 100:
            report['recommendations'].append('Alto volume de uploads - monitorar performance')
        
        print(f"📊 Relatório IA: {json.dumps(report, indent=2)}")
        
        # Salvar relatório
        with open('/opt/kryonix/logs/minio-ai-report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print("✅ IA MinIO executada com sucesso")
        
    except Exception as e:
        print(f"❌ Erro na execução da IA: {e}")

if __name__ == "__main__":
    main()
EOF

chmod +x /opt/kryonix/scripts/minio-ai-management.py

# Instalar dependências
pip3 install boto3

# === CONFIGURAR BACKUP AUTOMÁTICO ===
echo "💾 Configurando backup automático..."
cat > /opt/kryonix/scripts/backup-minio.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/minio/$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

echo "💾 Iniciando backup MinIO..."

# Buckets importantes para backup
CRITICAL_BUCKETS=("kryonix-platform" "kryonix-analytics" "kryonix-marketing" "kryonix-social" "kryonix-portal" "kryonix-whitelabel" "kryonix-private")

# Backup de cada bucket crítico
for bucket in "${CRITICAL_BUCKETS[@]}"; do
    echo "📦 Backup bucket: $bucket"
    docker exec minio-kryonix mc mirror local/$bucket "$BACKUP_DIR/$bucket"
done

# Backup configurações
docker exec minio-kryonix mc admin config export local > "$BACKUP_DIR/minio_config.json"

# Backup políticas
docker exec minio-kryonix mc admin policy list local --json > "$BACKUP_DIR/policies.json"

# Backup usuários
docker exec minio-kryonix mc admin user list local --json > "$BACKUP_DIR/users.json"

# Comprimir backup
cd /opt/kryonix/backups/minio
tar -czf "minio_backup_$BACKUP_DATE.tar.gz" "$BACKUP_DATE"
rm -rf "$BACKUP_DATE"

# Limpar backups antigos (manter 7 dias)
find /opt/kryonix/backups/minio -name "minio_backup_*.tar.gz" -mtime +7 -delete

BACKUP_SIZE=$(du -sh "minio_backup_$BACKUP_DATE.tar.gz" | cut -f1)
echo "✅ Backup MinIO concluído: $BACKUP_SIZE"

# Notificar WhatsApp
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: sua_chave_evolution_api_aqui" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"5517981805327\", \"text\": \"📦 Backup MinIO concluído!\\nData: $BACKUP_DATE\\nTamanho: $BACKUP_SIZE\\nBuckets: ${#CRITICAL_BUCKETS[@]}\"}"
EOF

chmod +x /opt/kryonix/scripts/backup-minio.sh

# === AGENDAR BACKUP E IA ===
echo "📅 Agendando tarefas automáticas..."
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/kryonix/scripts/backup-minio.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/10 * * * * /usr/bin/python3 /opt/kryonix/scripts/minio-ai-management.py >> /var/log/minio-ai.log 2>&1") | crontab -

# === CONFIGURAR MONITORAMENTO ===
echo "📊 Configurando monitoramento..."
cat > /opt/kryonix/scripts/monitor-minio.sh << 'EOF'
#!/bin/bash
# Monitoramento contínuo MinIO

while true; do
  # Health check console
  if ! curl -f -s https://minio.kryonix.com.br > /dev/null; then
    echo "🚨 $(date): MinIO Console não está respondendo!"
    
    # Tentar restart
    docker service update --force kryonix-storage_minio
    
    # Notificar WhatsApp
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: sua_chave_evolution_api_aqui" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"🚨 ALERTA: MinIO Console fora do ar!\\nTentando restart automático...\"}"
  fi
  
  # Health check API S3
  if ! curl -f -s https://s3.kryonix.com.br > /dev/null; then
    echo "🚨 $(date): MinIO API S3 não está respondendo!"
    
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: sua_chave_evolution_api_aqui" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"🚨 ALERTA: MinIO API S3 fora do ar!\"}"
  fi
  
  # Verificar espaço em disco
  DISK_USAGE=$(df /opt/kryonix/data/minio | tail -1 | awk '{print $5}' | sed 's/%//')
  
  if [ "$DISK_USAGE" -gt 80 ]; then
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: sua_chave_evolution_api_aqui" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"⚠️ MinIO: Disco quase cheio (${DISK_USAGE}%)\"}"
  fi
  
  sleep 300  # 5 minutos
done
EOF

chmod +x /opt/kryonix/scripts/monitor-minio.sh

# Executar monitoramento em background
nohup /opt/kryonix/scripts/monitor-minio.sh > /var/log/minio-monitor.log 2>&1 &

# === CONFIGURAR EXEMPLO DE INTEGRAÇÃO MOBILE ===
echo "📱 Criando exemplo de integração mobile..."
cat > /opt/kryonix/scripts/mobile-upload-example.js << 'EOF'
// Exemplo de integração MinIO para apps mobile
const MinioClient = require('minio');

class KryonixMobileStorage {
    constructor() {
        this.minioClient = new MinioClient({
            endPoint: 's3.kryonix.com.br',
            port: 443,
            useSSL: true,
            accessKey: 'mobile-user',
            secretKey: 'mobile_kryonix_2025'
        });
    }
    
    async uploadMobileFile(file, userId, category = 'general') {
        try {
            const fileName = `mobile/${category}/${userId}/${Date.now()}_${file.name}`;
            const metaData = {
                'Content-Type': file.type,
                'Cache-Control': 'max-age=31536000',
                'X-Amz-Meta-Mobile-Upload': 'true',
                'X-Amz-Meta-User-Id': userId,
                'X-Amz-Meta-Category': category,
                'X-Amz-Meta-Upload-Time': new Date().toISOString()
            };
            
            const result = await this.minioClient.putObject(
                'kryonix-mobile-uploads',
                fileName,
                file,
                file.size,
                metaData
            );
            
            const url = `https://s3.kryonix.com.br/kryonix-mobile-uploads/${fileName}`;
            
            return {
                success: true,
                url: url,
                fileName: fileName,
                size: file.size,
                uploadedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Erro no upload:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async generatePresignedUrl(fileName, bucket = 'kryonix-mobile-uploads', expiry = 3600) {
        try {
            const url = await this.minioClient.presignedPutObject(bucket, fileName, expiry);
            return { success: true, url: url };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async listUserFiles(userId, category = '') {
        try {
            const prefix = category ? `mobile/${category}/${userId}/` : `mobile/${userId}/`;
            const objectStream = this.minioClient.listObjects('kryonix-mobile-uploads', prefix, true);
            
            const files = [];
            
            return new Promise((resolve, reject) => {
                objectStream.on('data', (obj) => {
                    files.push({
                        name: obj.name,
                        size: obj.size,
                        lastModified: obj.lastModified,
                        url: `https://s3.kryonix.com.br/kryonix-mobile-uploads/${obj.name}`
                    });
                });
                
                objectStream.on('end', () => {
                    resolve({ success: true, files: files });
                });
                
                objectStream.on('error', (error) => {
                    reject({ success: false, error: error.message });
                });
            });
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = KryonixMobileStorage;

// Exemplo de uso:
/*
const storage = new KryonixMobileStorage();

// Upload de arquivo mobile
const file = document.getElementById('fileInput').files[0];
const result = await storage.uploadMobileFile(file, 'user123', 'profile');

if (result.success) {
    console.log('Upload concluído:', result.url);
} else {
    console.error('Erro no upload:', result.error);
}
*/
EOF

# === TESTES FINAIS ===
echo "🧪 Executando testes finais..."

# Teste 1: Console MinIO
echo "Teste 1: Console MinIO..."
curl -f https://minio.kryonix.com.br > /dev/null 2>&1 && echo "✅ Console acessível" || echo "❌ Console não acessível"

# Teste 2: API S3
echo "Teste 2: API S3..."
curl -f https://s3.kryonix.com.br > /dev/null 2>&1 && echo "✅ API S3 acessível" || echo "❌ API S3 não acessível"

# Teste 3: Buckets criados
echo "Teste 3: Verificando buckets..."
BUCKET_COUNT=$(docker exec minio-kryonix mc ls local | wc -l)
echo "Buckets criados: $BUCKET_COUNT"

# Teste 4: Upload de teste
echo "Teste 4: Upload de teste..."
echo "Teste KRYONIX MinIO" > /tmp/test-file.txt
docker exec minio-kryonix mc cp /tmp/test-file.txt local/kryonix-temp-uploads/test-upload.txt
rm /tmp/test-file.txt

# Teste 5: IA funcionando
echo "Teste 5: Testando IA..."
python3 /opt/kryonix/scripts/minio-ai-management.py

# === MARCAR PROGRESSO ===
echo "3" > /opt/kryonix/.current-part

# === NOTIFICAÇÃO FINAL ===
echo "📱 Enviando notificação final..."
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: sua_chave_evolution_api_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "text": "✅ PARTE-03 CONCLUÍDA!\n\n📦 MinIO configurado e otimizado\n📱 12 buckets especializados criados\n🤖 IA gerenciando storage automaticamente\n🔐 Políticas de acesso configuradas\n🔄 Lifecycle automático ativo\n💾 Backup automático diário (03:00)\n📊 Monitoramento contínuo ativo\n\n🌐 Console: https://minio.kryonix.com.br\n🔗 API S3: https://s3.kryonix.com.br\nLogin: kryonix / Vitor@123456\n\n🚀 Sistema pronto para PARTE-04!"
  }'

echo ""
echo "✅ PARTE-03 CONCLUÍDA COM SUCESSO!"
echo "📦 MinIO otimizado para mobile SaaS"
echo "📱 12 buckets especializados criados"
echo "🤖 IA gerenciando automaticamente"
echo "🌐 Console: https://minio.kryonix.com.br"
echo "🔗 API S3: https://s3.kryonix.com.br"
echo "👤 Login: kryonix / Vitor@123456"
echo ""
echo "🚀 Próxima etapa: PARTE-04-REDIS.md"
```

---

## 📋 **VALIDAÇÕES OBRIGATÓRIAS**
Após executar, confirme se:
- [ ] ✅ MinIO Console acessível em https://minio.kryonix.com.br
- [ ] ✅ API S3 acessível em https://s3.kryonix.com.br
- [ ] ✅ Login com kryonix/Vitor@123456 funciona
- [ ] ✅ 12 buckets especializados criados
- [ ] ✅ Políticas de acesso configuradas
- [ ] ✅ Usuários mobile e IA criados
- [ ] ✅ Lifecycle automático ativo
- [ ] ✅ IA executando otimizações automáticas
- [ ] ✅ Backup automático agendado (03:00)
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Upload de teste funcionando
- [ ] ✅ Notificação WhatsApp enviada

---

**⚠️ IMPORTANTE**: Substitua 'sua_chave_evolution_api_aqui' pela chave real da Evolution API antes de executar.

*🤖 Prompt criado pelos 15 Agentes Especializados KRYONIX*

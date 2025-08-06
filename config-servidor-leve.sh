#!/bin/bash

# KRYONIX - Configuração para Servidor Leve (8vCPU/16GB/480GB)
# Otimizado para infraestrutura base sem clientes ativos

echo "🚀 KRYONIX - Configuração Servidor Leve"
echo "📊 Recursos: 8 vCPU / 16 GB RAM / 480 GB NVMe"

# Definir limites de recursos
export POSTGRES_MEM="2g"
export POSTGRES_CPU="1.0"
export KEYCLOAK_MEM="1g"
export KEYCLOAK_CPU="0.5"
export REDIS_MEM="1g"
export REDIS_CPU="0.5"
export MINIO_MEM="1g"
export MINIO_CPU="0.5"
export APP_MEM="2g"
export APP_CPU="1.0"

# PostgreSQL otimizado para 16GB RAM
cat > postgresql.conf.leve << EOF
# Configuração PostgreSQL para 16GB RAM
max_connections = 100
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 64MB
min_wal_size = 1GB
max_wal_size = 4GB
EOF

# Redis configuração econômica
cat > redis.conf.leve << EOF
# Redis modo econômico
maxmemory 1gb
maxmemory-policy allkeys-lru
save 300 10
save 60 1000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dir /data
EOF

# Docker Compose otimizado
cat > docker-compose.leve.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: kryonix_main
      POSTGRES_USER: kryonix
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgresql.conf.leve:/etc/postgresql/postgresql.conf
    deploy:
      resources:
        limits:
          memory: ${POSTGRES_MEM}
          cpus: '${POSTGRES_CPU}'
    ports:
      - "5432:5432"
    command: postgres -c config_file=/etc/postgresql/postgresql.conf

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
      - ./redis.conf.leve:/usr/local/etc/redis/redis.conf
    deploy:
      resources:
        limits:
          memory: ${REDIS_MEM}
          cpus: '${REDIS_CPU}'
    ports:
      - "6379:6379"
    command: redis-server /usr/local/etc/redis/redis.conf

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: \${KEYCLOAK_DB_PASSWORD}
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: \${KEYCLOAK_ADMIN_PASSWORD}
      KC_HOSTNAME: \${HOSTNAME}
    deploy:
      resources:
        limits:
          memory: ${KEYCLOAK_MEM}
          cpus: '${KEYCLOAK_CPU}'
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    command: start --optimized

  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: \${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: \${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    deploy:
      resources:
        limits:
          memory: ${MINIO_MEM}
          cpus: '${MINIO_CPU}'
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"

  app:
    build: .
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://kryonix:\${POSTGRES_PASSWORD}@postgres:5432/kryonix_main
      REDIS_URL: redis://redis:6379
      KEYCLOAK_URL: http://keycloak:8080
    deploy:
      resources:
        limits:
          memory: ${APP_MEM}
          cpus: '${APP_CPU}'
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
      - keycloak

volumes:
  postgres_data:
  redis_data:
  minio_data:
EOF

# Script de monitoramento leve
cat > monitor-leve.sh << EOF
#!/bin/bash
# Monitor básico para servidor leve

echo "📊 KRYONIX - Status do Servidor"
echo "════════════════════════════════"

# CPU e RAM
echo "💻 Recursos:"
echo "CPU: \$(top -bn1 | grep "Cpu(s)" | awk '{print \$2}' | cut -d'%' -f1)% usado"
echo "RAM: \$(free -h | awk 'NR==2{printf "%.1f/%.1f GB (%.0f%%)", \$3/1024/1024, \$2/1024/1024, \$3*100/\$2}')"

# Storage
echo "💾 Storage:"
df -h / | tail -1 | awk '{printf "Disk: %s/%s (%s usado)", \$3, \$2, \$5}'

echo ""
echo "🐳 Docker Services:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -v "CONTAINER"

echo ""
echo "🔗 Endpoints Ativos:"
curl -s http://localhost:3000/health && echo "✅ App: OK" || echo "❌ App: DOWN"
curl -s http://localhost:8080/health && echo "✅ Keycloak: OK" || echo "❌ Keycloak: DOWN"
curl -s http://localhost:9000/minio/health/live && echo "✅ MinIO: OK" || echo "❌ MinIO: DOWN"
EOF

chmod +x monitor-leve.sh

echo "✅ Configuração otimizada criada!"
echo "📋 Arquivos gerados:"
echo "   - postgresql.conf.leve"
echo "   - redis.conf.leve" 
echo "   - docker-compose.leve.yml"
echo "   - monitor-leve.sh"
echo ""
echo "🚀 Para iniciar:"
echo "   docker-compose -f docker-compose.leve.yml up -d"
echo ""
echo "📊 Para monitorar:"
echo "   ./monitor-leve.sh"

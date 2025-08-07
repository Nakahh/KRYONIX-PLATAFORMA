#!/bin/bash

# 🚀 DEPLOY AUTOMÁTICO - BUILDER.IO → SERVIDOR DEDICADO
# Script para migrar aplicação desenvolvida no Builder.io para servidor próprio

echo "🚀 KRYONIX - Deploy Builder.io → Servidor Dedicado"
echo "📅 $(date)"
echo "🌐 Servidor: 144.202.90.55"
echo "📦 Repo: Nakahh/KRYONIX-PLATAFORMA"

# Configurações
SERVER_IP="144.202.90.55"
DOMAIN="www.kryonix.com.br"
GITHUB_REPO="https://github.com/Nakahh/KRYONIX-PLATAFORMA.git"
BRANCH="stellar-field"

# Credenciais (usar variáveis de ambiente)
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-"Vitor@123456"}
REDIS_PASSWORD=${REDIS_PASSWORD:-"Kr7n0x-V1t0r-2025"}
KEYCLOAK_PASSWORD=${KEYCLOAK_PASSWORD:-"Vitor@123456"}

echo ""
echo "🔍 FASE 1: Verificando ambiente do servidor..."

# Verificar servidor
ping -c 1 $SERVER_IP > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Servidor $SERVER_IP acessível"
else
    echo "❌ Servidor $SERVER_IP indisponível"
    exit 1
fi

echo ""
echo "📥 FASE 2: Fazendo download do código do GitHub..."

# Cleanup e clone
sudo rm -rf /opt/kryonix-app
sudo mkdir -p /opt/kryonix-app
cd /opt/kryonix-app

# Clone do repositório Builder.io
git clone $GITHUB_REPO .
git checkout $BRANCH

echo "✅ Código baixado do GitHub"

echo ""
echo "🔧 FASE 3: Configurando ambiente de produção..."

# Instalar dependências Node.js
echo "📦 Instalando dependências..."
npm install --production

# Build da aplicação
echo "🏗️ Fazendo build da aplicação..."
npm run build

echo ""
echo "🐳 FASE 4: Configurando Docker e serviços..."

# Docker Compose para produção
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  # PostgreSQL - Banco principal
  postgres:
    image: postgres:15
    container_name: postgres-kryonix
    restart: always
    environment:
      POSTGRES_DB: kryonix_main
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - kryonix-network

  # Redis - Cache e sessões
  redis:
    image: redis:7-alpine
    container_name: redis-kryonix
    restart: always
    command: redis-server --requirepass $REDIS_PASSWORD
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - kryonix-network

  # MinIO - Storage de arquivos
  minio:
    image: minio/minio:latest
    container_name: minio-kryonix
    restart: always
    environment:
      MINIO_ROOT_USER: kryonix
      MINIO_ROOT_PASSWORD: $REDIS_PASSWORD
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    networks:
      - kryonix-network

  # Aplicação Next.js
  app:
    build: 
      context: .
      dockerfile: Dockerfile.prod
    container_name: app-kryonix
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:$POSTGRES_PASSWORD@postgres:5432/kryonix_main
      REDIS_URL: redis://:$REDIS_PASSWORD@redis:6379
      NEXTAUTH_URL: https://$DOMAIN
      NEXTAUTH_SECRET: $(openssl rand -base64 32)
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
      - minio
    networks:
      - kryonix-network

  # Traefik - Proxy reverso
  traefik:
    image: traefik:latest
    container_name: traefik-kryonix
    restart: always
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=contato@kryonix.com.br"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - traefik_letsencrypt:/letsencrypt
    networks:
      - kryonix-network

volumes:
  postgres_data:
  redis_data:
  minio_data:
  traefik_letsencrypt:

networks:
  kryonix-network:
    driver: bridge
EOF

# Dockerfile para produção
cat > Dockerfile.prod << EOF
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV production

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
EOF

echo ""
echo "🚀 FASE 5: Iniciando serviços..."

# Parar serviços existentes
docker-compose -f docker-compose.prod.yml down

# Iniciar serviços
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ FASE 6: Aguardando serviços subirem..."
sleep 30

echo ""
echo "🔍 FASE 7: Verificando saúde dos serviços..."

# Verificar PostgreSQL
docker exec postgres-kryonix pg_isready -U postgres
if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL funcionando"
else
    echo "❌ PostgreSQL com problemas"
fi

# Verificar Redis
docker exec redis-kryonix redis-cli -a $REDIS_PASSWORD ping
if [ $? -eq 0 ]; then
    echo "✅ Redis funcionando"
else
    echo "❌ Redis com problemas"
fi

# Verificar aplicação
curl -f http://localhost:3000/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Aplicação funcionando"
else
    echo "❌ Aplicação com problemas"
fi

echo ""
echo "🌐 FASE 8: Configurando domínio e SSL..."

# Configurar DNS (se necessário)
echo "📝 Configure seu DNS para apontar $DOMAIN para $SERVER_IP"

echo ""
echo "✅ DEPLOY CONCLUÍDO!"
echo ""
echo "🌐 URLs disponíveis:"
echo "   • App principal: https://$DOMAIN"
echo "   • Admin: https://$DOMAIN/admin"
echo "   • API: https://$DOMAIN/api"
echo "   • MinIO Console: https://$DOMAIN:9001"
echo "   • Traefik Dashboard: https://$DOMAIN:8080"
echo ""
echo "📊 Para monitorar:"
echo "   • Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   • Status: docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "🔧 Para atualizar:"
echo "   • git pull origin $BRANCH"
echo "   • docker-compose -f docker-compose.prod.yml up -d --build"

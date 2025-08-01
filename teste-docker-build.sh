#!/bin/bash

# Script de teste rápido para Docker build KRYONIX
# Verifica se o build funciona antes do instalador completo

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 TESTE RÁPIDO - DOCKER BUILD KRYONIX${NC}"
echo "========================================"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado!${NC}"
    echo "Execute este script no diretório do projeto KRYONIX"
    exit 1
fi

# Verificar arquivos necessários
echo -e "\n${YELLOW}📋 Verificando arquivos necessários:${NC}"
required_files=("package.json" "server.js" "check-dependencies.js" "validate-dependencies.js" "fix-dependencies.js" "next.config.js")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ✅ $file"
    else
        echo -e "   ❌ $file (faltando)"
        missing=true
    fi
done

if [ "$missing" = true ]; then
    echo -e "\n${RED}❌ Arquivos faltando! Execute o instalador primeiro.${NC}"
    exit 1
fi

# Criar Dockerfile temporário com correções
echo -e "\n${YELLOW}🏗️ Criando Dockerfile de teste:${NC}"
cat > Dockerfile.test << 'EOF'
# Multi-stage build otimizado para Next.js
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# CORREÇÃO CRÍTICA: Copiar arquivos de dependências ANTES do npm ci
COPY check-dependencies.js ./
COPY validate-dependencies.js ./
COPY fix-dependencies.js ./
# Instalar sem executar scripts para evitar problema com check-dependencies
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copiar arquivos de configuraç��o
COPY package.json package-lock.json* ./
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig.json ./
# Copiar arquivos de dependências
COPY check-dependencies.js ./
COPY validate-dependencies.js ./
COPY fix-dependencies.js ./
# Copiar código fonte
COPY app/ ./app/
COPY public/ ./public/
COPY lib/ ./lib/
COPY server.js ./
COPY webhook-listener.js ./
COPY kryonix-monitor.js ./
COPY webhook-deploy.sh ./

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install runtime dependencies
RUN apk add --no-cache curl bash dumb-init

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy server files and scripts from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./
COPY --from=builder --chown=nextjs:nodejs /app/webhook-listener.js ./
COPY --from=builder --chown=nextjs:nodejs /app/kryonix-monitor.js ./
COPY --from=builder --chown=nextjs:nodejs /app/webhook-deploy.sh ./
COPY --from=builder --chown=nextjs:nodejs /app/check-dependencies.js ./
COPY --from=builder --chown=nextjs:nodejs /app/validate-dependencies.js ./
COPY --from=builder --chown=nextjs:nodejs /app/fix-dependencies.js ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Make scripts executable
RUN chmod +x webhook-deploy.sh

USER nextjs

# Expor portas
EXPOSE 8080 8082 8084

# Health check otimizado para 15s
HEALTHCHECK --interval=15s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Comando de start otimizado
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
EOF

echo -e "   ✅ Dockerfile.test criado"

# Teste de build
echo -e "\n${YELLOW}🏗️ Testando Docker build:${NC}"
if docker build -f Dockerfile.test -t kryonix-test:latest . 2>&1 | tee build.log; then
    echo -e "\n${GREEN}✅ BUILD SUCESSO! Docker build funcionando.${NC}"
    
    # Verificar se a imagem foi criada
    if docker images | grep -q "kryonix-test"; then
        echo -e "✅ Imagem criada com sucesso"
        docker images | grep kryonix-test
    fi
    
    # Limpar imagem de teste
    echo -e "\n${YELLOW}🧹 Limpando imagem de teste:${NC}"
    docker rmi kryonix-test:latest >/dev/null 2>&1 || true
    
else
    echo -e "\n${RED}❌ BUILD FALHOU!${NC}"
    echo -e "\n${YELLOW}📋 Últimas linhas do erro:${NC}"
    tail -20 build.log
    
    echo -e "\n${YELLOW}💡 Sugestões:${NC}"
    echo -e "1. Verificar se todos os arquivos necessários existem"
    echo -e "2. Executar: npm install localmente primeiro"
    echo -e "3. Verificar logs completos em: build.log"
fi

# Limpar arquivos temporários
rm -f Dockerfile.test build.log

echo -e "\n${BLUE}🏁 Teste concluído!${NC}"

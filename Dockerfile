# Multi-stage build para otimização
FROM node:18-alpine AS builder

# Instalar dependências de build
RUN apk add --no-cache \
    curl \
    wget \
    bash \
    git \
    python3 \
    make \
    g++ \
    dumb-init

WORKDIR /app

# Copiar package files primeiro para aproveitar cache do Docker
COPY package*.json ./

# Verificar se outros arquivos de config existem antes de copiar
COPY next.config.js ./
COPY tailwind.config.js* ./
COPY postcss.config.js* ./
COPY tsconfig.json* ./

# Instalar todas as dependências (incluindo dev)
RUN npm ci && npm cache clean --force

# Copiar código fonte
COPY app/ ./app/
COPY public/ ./public/
COPY lib/ ./lib/

# Build da aplicação Next.js
RUN npm run build

# Stage de produção
FROM node:18-alpine AS production

# Instalar dependências do sistema
RUN apk add --no-cache \
    curl \
    wget \
    bash \
    git \
    dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S kryonix -u 1001

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY next.config.js ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force || \
    npm install --only=production && npm cache clean --force

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copiar código da aplicação (verificar se existem antes de copiar)
COPY server.js ./
COPY webhook-listener.js ./
COPY kryonix-monitor.js ./
COPY check-dependencies.js ./
COPY validate-dependencies.js ./
COPY fix-dependencies.js ./

# Copiar webhook-deploy.sh apenas se existir
COPY webhook-deploy.sh* ./

# Copiar código da aplicação
COPY app/ ./app/
COPY lib/ ./lib/

# Tornar scripts executáveis se existirem
RUN [ -f "webhook-deploy.sh" ] && chmod +x webhook-deploy.sh || true

# Configurar permissões
RUN chown -R kryonix:nodejs /app && chmod -R 755 /app

USER kryonix

# Expor portas
EXPOSE 8080 8082 8084

# Health check com mais tempo para Next.js inicializar
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando de start com dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]

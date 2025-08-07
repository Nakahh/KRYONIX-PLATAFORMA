# Multi-stage build otimizado para velocidade
FROM node:18-alpine AS deps
WORKDIR /app

# Instalar apenas dependências essenciais do sistema
RUN apk add --no-cache libc6-compat curl

# Copiar package files para cache layer
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar node_modules do stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build otimizado para velocidade
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build mais rápido
RUN npm run build-fast

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Instalar apenas dependências essenciais
RUN apk add --no-cache \
    curl \
    dumb-init && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 kryonix

# Copiar arquivos necessários
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copiar scripts de aplicação
COPY server.js ./
COPY webhook-listener.js ./
COPY kryonix-monitor.js ./
COPY check-dependencies.js ./

# Configurar permissões
RUN chown -R kryonix:nodejs /app
USER kryonix

# Expor porta
EXPOSE 8080

# Health check otimizado
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start otimizado
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

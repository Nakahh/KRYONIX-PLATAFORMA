# Multi-stage build para otimização
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    libc6-compat \
    curl \
    bash \
    git

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
FROM base AS deps
RUN npm ci --only=production && npm cache clean --force

# Estágio de build
FROM base AS builder
COPY . .
RUN npm ci
RUN npm run build-fast 2>/dev/null || echo "Build command not available"

# Estágio de produção
FROM node:18-alpine AS runner
WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 kryonix

# Copiar dependências
COPY --from=deps --chown=kryonix:nodejs /app/node_modules ./node_modules

# Copiar código fonte
COPY --chown=kryonix:nodejs . .

# Criar diretórios necessários
RUN mkdir -p logs temp && chown -R kryonix:nodejs logs temp

# Expor porta
EXPOSE 8080

# Configurar usuário
USER kryonix

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Comando de inicialização
CMD ["npm", "start"]

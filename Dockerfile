# Dockerfile Multi-stage para KRYONIX - Plataforma Autônoma
FROM node:18-alpine AS base

# Definir argumentos de build
ARG BUILD_ENV=production
ARG NODE_VERSION=18

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV BUILD_ENV=${BUILD_ENV}
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    dumb-init \
    curl \
    bash \
    tzdata \
    && rm -rf /var/cache/apk/*

# Configurar timezone para Brasil
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S kryonix && \
    adduser -S kryonix -u 1001

# ================================
# Stage: Dependencies
# ================================
FROM base AS deps

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependências com cache otimizado
RUN --mount=type=cache,target=/tmp/.npm \
    npm ci --only=production --silent && \
    npm cache clean --force

# ================================
# Stage: Builder
# ================================
FROM base AS builder

WORKDIR /app

# Copiar código fonte
COPY . .

# Copiar dependências da stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Instalar dependências de desenvolvimento para build
RUN --mount=type=cache,target=/tmp/.npm \
    npm ci --silent

# Build do projeto
RUN echo "🏗️ Iniciando build do KRYONIX..." && \
    npm run build:client && \
    npm run build:server && \
    echo "✅ Build concluído com sucesso"

# Verificar se os arquivos de build foram criados
RUN ls -la dist/ && \
    echo "📊 Tamanho dos arquivos de build:" && \
    du -sh dist/*

# ================================
# Stage: Production
# ================================
FROM base AS production

WORKDIR /app

# Copiar dependências de produção
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./

# Copiar arquivos de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Copiar arquivos de configuração necessários
COPY --from=builder /app/netlify.toml ./
COPY --from=builder /app/stack-uploads ./stack-uploads

# Criar diretórios necessários
RUN mkdir -p /app/logs /app/tmp && \
    chown -R kryonix:kryonix /app

# Configurar variáveis de ambiente específicas
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

# Expor porta da aplicação
EXPOSE $PORT

# Trocar para usuário não-root
USER kryonix

# Script de inicialização
CMD ["dumb-init", "node", "dist/server/index.js"]

# Labels para metadata
LABEL \
    org.label-schema.name="KRYONIX Platform" \
    org.label-schema.description="Plataforma SaaS 100% Autônoma com IA" \
    org.label-schema.version="1.0.0" \
    org.label-schema.build-date="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    org.label-schema.vcs-url="https://github.com/vitorfernandes-dev/kryonix" \
    org.label-schema.schema-version="1.0" \
    maintainer="Vitor Fernandes <vitor@kryonix.com.br>"

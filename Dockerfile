# Multi-stage build para otimização
FROM node:18-bullseye-slim AS builder

# Instalar dependências de build
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig.json ./

# Instalar todas as dependências (incluindo dev)
RUN npm install && npm cache clean --force

# Copiar código fonte
COPY app/ ./app/
COPY public/ ./public/
COPY lib/ ./lib/

# Build da aplicação Next.js
RUN npm run build

# Stage de produção
FROM node:18-bullseye-slim AS production

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    tini \
    curl \
    bash \
    git \
    && rm -rf /var/lib/apt/lists/*

# Instalar npm-check-updates globalmente
RUN npm install -g npm-check-updates

# Criar usuário não-root
RUN groupadd -r kryonix && useradd -r -g kryonix kryonix

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY next.config.js ./

# Instalar apenas dependências de produção
RUN npm install --production && npm cache clean --force

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copiar código da aplicação
COPY server.js ./
COPY webhook-listener.js ./
COPY kryonix-monitor.js ./
COPY webhook-deploy.sh ./
COPY check-dependencies.js ./
COPY validate-dependencies.js ./
COPY fix-dependencies.js ./
COPY app/ ./app/
COPY lib/ ./lib/

# Copiar outros arquivos necessários se existirem
COPY *.config.js ./
COPY *.md ./

# Tornar scripts executáveis
RUN chmod +x webhook-deploy.sh

# Configurar permissões
RUN chown -R kryonix:kryonix /app

USER kryonix

# Expor portas
EXPOSE 8080 8082 8084

# Health check com mais tempo para Next.js inicializar
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=5 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando de start com tini
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]

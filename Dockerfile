# Build stage
FROM node:18-bullseye-slim AS builder

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY .npmrc ./

# Instalar dependências
RUN npm ci --omit=optional && \
    npm cache clean --force

# Copiar código fonte (incluindo public/ e vite.config.js)
COPY . .

# Verificar estrutura do projeto
RUN ls -la && ls -la public/

# Build da aplicação
ENV NODE_ENV=production
RUN npm run build

# Production stage
FROM node:18-bullseye-slim AS production

# Instalar dependências mínimas
RUN apt-get update && apt-get install -y \
    tini \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root
RUN groupadd -r kryonix && useradd -r -g kryonix kryonix

WORKDIR /app

# Copiar apenas arquivos necessários
COPY --from=builder --chown=kryonix:kryonix /app/dist ./dist
COPY --from=builder --chown=kryonix:kryonix /app/server.js ./
COPY --from=builder --chown=kryonix:kryonix /app/package.json ./
COPY --from=builder --chown=kryonix:kryonix /app/node_modules ./node_modules

# Mudar para usuário não-root
USER kryonix

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Labels para Docker Swarm
LABEL maintainer="vitor.nakahh@gmail.com"
LABEL version="1.0.0"
LABEL description="KRYONIX Platform - SaaS Autônomo por IA"

# Usar tini como init
ENTRYPOINT ["/usr/bin/tini", "--"]

# Comando de inicialização
CMD ["node", "server.js"]

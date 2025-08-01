FROM node:18-bullseye-slim

# Instalar dependências do sistema incluindo npm-check-updates
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

# Copiar package files primeiro para cache layer
COPY package*.json ./

# Instalar dependências
RUN npm install --production && npm cache clean --force

# Copiar código da aplicação
COPY server.js ./
COPY webhook-listener.js ./
COPY kryonix-monitor.js ./
COPY webhook-deploy.sh ./
COPY check-dependencies.js ./
COPY validate-dependencies.js ./
COPY fix-dependencies.js ./
COPY public/ ./public/
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

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Comando de start com tini
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]

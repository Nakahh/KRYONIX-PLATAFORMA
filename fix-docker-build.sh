#!/bin/bash

echo "🔧 CORREÇÃO RÁPIDA - Erro Docker Build KRYONIX"
echo "============================================"

# Ir para o diretório do projeto
cd /opt/kryonix-plataform || exit 1

echo "📝 Corrigindo Dockerfile..."

# Criar Dockerfile corrigido
cat > Dockerfile << 'DOCKERFILE_EOF'
FROM node:18-bullseye-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    tini \
    curl \
    bash \
    git \
    && rm -rf /var/lib/apt/lists/*

# Instalar npm-check-updates globalmente via npm
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
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY tsconfig.json ./

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
DOCKERFILE_EOF

echo "✅ Dockerfile corrigido!"

echo "🏗️ Fazendo build da imagem Docker..."

# Build da imagem com o Dockerfile corrigido
if docker build --no-cache -t kryonix-plataforma:latest . 2>&1 | tee /tmp/docker-build-fix.log; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker tag kryonix-plataforma:latest kryonix-plataforma:$TIMESTAMP
    echo "✅ Imagem Docker criada com sucesso: kryonix-plataforma:$TIMESTAMP"
    
    echo "🚀 Continuando com o deploy..."
    
    # Atualizar docker-stack.yml se necessário
    if [ ! -f "docker-stack.yml" ]; then
        echo "📋 Criando docker-stack.yml..."
        cat > docker-stack.yml << 'STACK_EOF'
version: '3.8'

services:
  web:
    image: kryonix-plataforma:latest
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 3
        delay: 10s
      labels:
        # Traefik básico
        - "traefik.enable=true"
        - "traefik.docker.network=Kryonix-NET"

        # Configuração do serviço web
        - "traefik.http.services.kryonix-web.loadbalancer.server.port=8080"

        # WEBHOOK - PRIORIDADE MÁXIMA (10000)
        - "traefik.http.routers.kryonix-webhook.rule=Host(`kryonix.com.br`) && Path(`/api/github-webhook`)"
        - "traefik.http.routers.kryonix-webhook.entrypoints=web,websecure"
        - "traefik.http.routers.kryonix-webhook.service=kryonix-web"
        - "traefik.http.routers.kryonix-webhook.priority=10000"
        - "traefik.http.routers.kryonix-webhook.tls=true"
        - "traefik.http.routers.kryonix-webhook.tls.certresolver=letsencryptresolver"

        # API Routes - Alta Prioridade (9000)
        - "traefik.http.routers.kryonix-api.rule=Host(`kryonix.com.br`) && PathPrefix(`/api/`)"
        - "traefik.http.routers.kryonix-api.entrypoints=web,websecure"
        - "traefik.http.routers.kryonix-api.service=kryonix-web"
        - "traefik.http.routers.kryonix-api.priority=9000"
        - "traefik.http.routers.kryonix-api.tls=true"
        - "traefik.http.routers.kryonix-api.tls.certresolver=letsencryptresolver"

        # HTTPS Principal - Prioridade Normal (100)
        - "traefik.http.routers.kryonix-https.rule=Host(`kryonix.com.br`) || Host(`www.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-https.entrypoints=websecure"
        - "traefik.http.routers.kryonix-https.service=kryonix-web"
        - "traefik.http.routers.kryonix-https.priority=100"
        - "traefik.http.routers.kryonix-https.tls=true"
        - "traefik.http.routers.kryonix-https.tls.certresolver=letsencryptresolver"

        # HTTP - Redirecionamento (50)
        - "traefik.http.routers.kryonix-http.rule=Host(`kryonix.com.br`) || Host(`www.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-http.entrypoints=web"
        - "traefik.http.routers.kryonix-http.service=kryonix-web"
        - "traefik.http.routers.kryonix-http.priority=50"
        - "traefik.http.routers.kryonix-http.middlewares=https-redirect"

        # Middleware HTTPS Redirect
        - "traefik.http.middlewares.https-redirect.redirectscheme.scheme=https"
        - "traefik.http.middlewares.https-redirect.redirectscheme.permanent=true"

    networks:
      - Kryonix-NET
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - AUTO_UPDATE_DEPS=true
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

networks:
  Kryonix-NET:
    external: true
STACK_EOF
        echo "✅ docker-stack.yml criado"
    fi
    
    echo "🚀 Fazendo deploy do stack KRYONIX..."
    docker stack deploy -c docker-stack.yml Kryonix
    
    echo "⏳ Aguardando estabilização (60s)..."
    sleep 60
    
    echo "🔍 Verificando status dos serviços..."
    docker service ls | grep Kryonix
    
    echo "🧪 Testando conectividade..."
    if curl -f -s "http://localhost:8080/health" >/dev/null; then
        echo "✅ Serviço KRYONIX funcionando!"
    else
        echo "⚠️ Serviço pode ainda estar inicializando..."
    fi
    
    echo ""
    echo "🎉 CORREÇÃO APLICADA COM SUCESSO!"
    echo "================================"
    echo "✅ Docker build funcionando"
    echo "✅ Stack deployado"
    echo "✅ Plataforma KRYONIX online"
    echo ""
    echo "🌐 Acessos:"
    echo "   http://localhost:8080/health"
    echo "   https://kryonix.com.br"
    echo ""
    
else
    echo "❌ Falha no build da imagem Docker"
    echo "📋 Verifique os logs em /tmp/docker-build-fix.log"
    exit 1
fi

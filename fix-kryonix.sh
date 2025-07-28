#!/bin/bash

echo "🔧 KRYONIX - Correção Imediata"
echo "============================="

# Remover stack isolado se existir
echo "🗑️ Removendo serviços isolados..."
docker stack rm kryonix-web-isolated 2>/dev/null || true
docker stack rm kryonix-test 2>/dev/null || true
docker stack rm kryonix-minimal 2>/dev/null || true

# Aguardar remoção
sleep 20

# Parar o stack principal se necessário
echo "🛑 Parando stack principal para limpeza..."
docker stack rm kryonix-plataforma 2>/dev/null || true

# Aguardar remoção completa
sleep 30

# Verificar se rede traefik-public existe
if ! docker network ls | grep -q "traefik-public"; then
    echo "🌐 Criando rede traefik-public..."
    docker network create -d overlay --attachable traefik-public
fi

# Deploy apenas do serviço web principal
echo "🚀 Fazendo deploy SIMPLIFICADO..."
cat > docker-stack-simple.yml << 'EOF'
version: '3.8'

services:
  kryonix-web:
    image: kryonix-plataforma:latest
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 3
        delay: 10s
    ports:
      - "8080:8080"
    networks:
      - traefik-public
    environment:
      - NODE_ENV=production
      - PORT=8080
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kryonix-app.rule=Host(\`www.kryonix.com.br\`) || Host(\`kryonix.com.br\`)"
      - "traefik.http.routers.kryonix-app.entrypoints=websecure"
      - "traefik.http.routers.kryonix-app.tls.certresolver=letsencrypt"
      - "traefik.http.services.kryonix-app.loadbalancer.server.port=8080"
      - "traefik.docker.network=traefik-public"

networks:
  traefik-public:
    external: true
EOF

docker stack deploy -c docker-stack-simple.yml kryonix

echo "⏳ Aguardando 60 segundos para inicialização..."
sleep 60

echo "🔍 Verificando status..."
docker service ls | grep kryonix

echo "🌐 Testando conectividade..."
echo "   IP direto: http://144.202.90.55:8080"
curl -I http://localhost:8080/health 2>/dev/null && echo "✅ Localhost OK" || echo "❌ Localhost falhou"

echo ""
echo "✅ Correção aplicada!"
echo "📋 Verificar:"
echo "   1. http://144.202.90.55:8080 (deve funcionar)"
echo "   2. https://www.kryonix.com.br (se DNS estiver configurado)"

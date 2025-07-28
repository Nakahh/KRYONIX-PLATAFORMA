#!/bin/bash

echo "🚀 FORÇA BRUTA - CORRIGIR DOMÍNIO KRYONIX"
echo "========================================="

# 1. Parar tudo
echo "🛑 Parando todos os serviços..."
docker stack rm Kryonix 2>/dev/null || true
sleep 20

# 2. Verificar se Traefik está rodando
TRAEFIK_RUNNING=$(docker ps | grep traefik)
if [ -z "$TRAEFIK_RUNNING" ]; then
    echo "❌ PROBLEMA: Traefik não está rodando!"
    echo "   Você precisa iniciar o Traefik primeiro"
    echo "   Exemplo: docker-compose up -d traefik"
    exit 1
fi

echo "✅ Traefik encontrado: $(echo $TRAEFIK_RUNNING | awk '{print $1}')"

# 3. Garantir que redes existem
echo "🌐 Criando redes necessárias..."
docker network create -d overlay --attachable traefik-public 2>/dev/null || echo "   rede traefik-public já existe"
docker network create -d overlay --attachable traefik_default 2>/dev/null || echo "   rede traefik_default já existe"

# 4. Criar configuração MÍNIMA que funciona
echo "📝 Criando configuração mínima..."
cat > docker-stack-minimal.yml << 'EOF'
version: '3.8'

services:
  web:
    image: kryonix-plataforma:latest
    deploy:
      replicas: 1
    ports:
      - "8080:8080"
    networks:
      - traefik_default
    environment:
      - NODE_ENV=production
      - PORT=8080
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kryonix-main.rule=Host(\`www.kryonix.com.br\`) || Host(\`kryonix.com.br\`)"
      - "traefik.http.routers.kryonix-main.entrypoints=web"
      - "traefik.http.services.kryonix-main.loadbalancer.server.port=8080"
      - "traefik.docker.network=traefik_default"

networks:
  traefik_default:
    external: true
EOF

# 5. Deploy mínimo
echo "🚀 Deploy mínimo..."
docker stack deploy -c docker-stack-minimal.yml Kryonix

echo "⏳ Aguardando 30 segundos..."
sleep 30

# 6. Testar
echo "🔍 Testando..."
echo "   Serviços:"
docker service ls | grep Kryonix

echo ""
echo "   Conectividade:"
echo "     IP direto:"
curl -I -m 5 http://localhost:8080/health 2>/dev/null | head -1 || echo "     ❌ IP não funciona"

echo "     HTTP domínio:"
curl -I -m 5 http://www.kryonix.com.br 2>/dev/null | head -1 || echo "     ❌ HTTP não funciona"

echo ""
echo "💡 Se HTTP funcionar, adicione HTTPS:"
echo "   Edite o serviço para incluir 'websecure' nos entrypoints"
echo "   Adicione certificado SSL"

echo ""
echo "🔍 Para ver logs do Traefik:"
TRAEFIK_CONTAINER=$(docker ps --format "{{.Names}}" | grep traefik | head -1)
echo "   docker logs -f $TRAEFIK_CONTAINER"

echo ""
echo "✅ Teste completo realizado!"

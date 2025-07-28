#!/bin/bash

echo "🚀 TESTE DEPLOY KRYONIX SEM ERROS"
echo "================================="

# Parar stack atual
docker stack rm Kryonix 2>/dev/null || true
sleep 20

# Criar stack mínimo sem problemas de escape
cat > test-stack.yml << 'EOF'
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
    ports:
      - "8080:8080"
    networks:
      - traefik_default
    environment:
      - NODE_ENV=production
      - PORT=8080
    labels:
      - traefik.enable=true
      - traefik.http.routers.kryonix.rule=Host(`www.kryonix.com.br`) || Host(`kryonix.com.br`)
      - traefik.http.routers.kryonix.entrypoints=web,websecure
      - traefik.http.routers.kryonix.tls.certresolver=letsencrypt
      - traefik.http.services.kryonix.loadbalancer.server.port=8080
      - traefik.docker.network=traefik_default

networks:
  traefik_default:
    external: true
EOF

echo "📝 Testando sintaxe YAML..."
if docker-compose -f test-stack.yml config > /dev/null 2>&1; then
    echo "✅ YAML válido"
else
    echo "❌ YAML inválido, verificando..."
    docker-compose -f test-stack.yml config
fi

echo "🚀 Deploy de teste..."
docker stack deploy -c test-stack.yml Kryonix

echo "⏳ Aguardando 30 segundos..."
sleep 30

echo "🔍 Verificando serviços..."
docker service ls | grep Kryonix

echo "🌐 Testando conectividade..."
curl -I http://localhost:8080/health 2>/dev/null | head -1 || echo "❌ Não conectou"

echo "✅ Teste concluído!"
echo "📋 Serviço: Kryonix_web"

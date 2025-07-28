#!/bin/bash

echo "🔧 KRYONIX - Correção HTTPS"
echo "=========================="

# Parar stack atual
echo "🛑 Parando stack atual..."
docker stack rm Kryonix 2>/dev/null || true
docker stack rm kryonix-plataforma 2>/dev/null || true

# Aguardar limpeza
sleep 30

# Verificar e criar rede traefik se necessário
echo "🌐 Verificando rede Traefik..."
docker network ls | grep traefik-public || docker network create -d overlay --attachable traefik-public
docker network ls | grep traefik_default || docker network create -d overlay --attachable traefik_default

# Criar configuração corrigida
echo "📝 Criando configuração corrigida..."
cat > docker-stack-https.yml << 'EOF'
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
      - traefik_default
    environment:
      - NODE_ENV=production
      - PORT=8080
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kryonix.rule=Host(`www.kryonix.com.br`) || Host(`kryonix.com.br`)"
      - "traefik.http.routers.kryonix.entrypoints=web,websecure"
      - "traefik.http.routers.kryonix.tls.certresolver=letsencrypt"
      - "traefik.http.services.kryonix.loadbalancer.server.port=8080"
      - "traefik.docker.network=traefik_default"
      - "traefik.http.routers.kryonix.middlewares=redirect-to-https"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true"

networks:
  traefik-public:
    external: true
  traefik_default:
    external: true
EOF

# Deploy com nome simples
echo "🚀 Fazendo deploy como 'Kryonix'..."
docker stack deploy -c docker-stack-https.yml Kryonix

echo "⏳ Aguardando 60 segundos..."
sleep 60

echo "🔍 Verificando status..."
docker service ls | grep -i kryonix

echo ""
echo "🌐 Testando conectividade:"
echo "   IP direto: http://144.202.90.55:8080"
echo "   Domínio HTTP: http://www.kryonix.com.br"
echo "   Domínio HTTPS: https://www.kryonix.com.br"

echo ""
echo "✅ Correção aplicada!"
echo "📋 O serviço agora se chama: Kryonix_kryonix-web"
echo "🌍 Teste em 2-3 minutos para SSL propagar"

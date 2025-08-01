#!/bin/bash

echo "🔍 DIAGNÓSTICO KRYONIX - Verificando problemas do serviço"
echo "======================================================"

# Verificar status dos serviços
echo "📊 Status dos serviços Docker Swarm:"
docker service ls | grep -i kryonix

echo ""
echo "📋 Logs do serviço Kryonix_web:"
docker service logs Kryonix_web --tail 50

echo ""
echo "🔍 Verificando containers que falharam:"
docker ps -a | grep kryonix

echo ""
echo "📦 Verificando se a imagem existe:"
docker images | grep kryonix

echo ""
echo "🌐 Verificando rede Docker:"
docker network ls | grep -i kryonix

echo ""
echo "⚙️ Verificando configuração do stack:"
if [ -f "docker-stack.yml" ]; then
    echo "✅ docker-stack.yml encontrado"
    echo "📄 Conteúdo do stack:"
    cat docker-stack.yml | head -20
else
    echo "❌ docker-stack.yml não encontrado!"
fi

echo ""
echo "🔍 Verificando diretório atual:"
pwd
ls -la

echo ""
echo "📋 Tentando acessar logs do último container que falhou:"
LAST_CONTAINER=$(docker ps -a --format "{{.Names}}" | grep kryonix | head -1)
if [ ! -z "$LAST_CONTAINER" ]; then
    echo "Container encontrado: $LAST_CONTAINER"
    docker logs $LAST_CONTAINER --tail 20
else
    echo "❌ Nenhum container kryonix encontrado"
fi

echo ""
echo "🧪 Testando conectividade local:"
curl -s http://localhost:8080/health || echo "❌ Serviço não responde na porta 8080"

echo ""
echo "🔧 SUGESTÕES DE CORREÇÃO:"
echo "1. Execute: docker service update --force Kryonix_web"
echo "2. Ou remova e recrie: docker stack rm Kryonix && docker stack deploy -c docker-stack.yml Kryonix"
echo "3. Verifique se todos os arquivos necessários estão presentes"

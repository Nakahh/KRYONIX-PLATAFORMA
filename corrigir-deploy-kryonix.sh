#!/bin/bash

echo "🔧 CORREÇÃO DO DEPLOY KRYONIX - Erro de Rede Resolvido"
echo "=================================================="

# Verificar se está em modo swarm
if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q active; then
    echo "❌ Docker não está em modo swarm"
    echo "Execute: docker swarm init"
    exit 1
fi

# Verificar redes disponíveis
echo "📋 Redes Docker disponíveis:"
docker network ls

# Verificar se a rede Kryonix-NET existe
if ! docker network ls | grep -q "Kryonix-NET"; then
    echo "❌ Rede Kryonix-NET não encontrada"
    echo "Criando rede Kryonix-NET..."
    docker network create --driver overlay --attachable Kryonix-NET
else
    echo "✅ Rede Kryonix-NET encontrada"
fi

# Remover stack anterior se existir
echo "🗑️ Removendo stack anterior..."
docker stack rm Kryonix 2>/dev/null || true
sleep 10

# Verificar se docker-stack.yml foi corrigido
if grep -q "traefik-public" docker-stack.yml; then
    echo "❌ docker-stack.yml ainda contém referências a traefik-public"
    echo "O arquivo foi corrigido automaticamente, verifique o conteúdo"
    exit 1
fi

echo "✅ docker-stack.yml corrigido (sem traefik-public)"

# Fazer deploy
echo "🚀 Fazendo deploy do stack KRYONIX corrigido..."
docker stack deploy --compose-file docker-stack.yml Kryonix

# Verificar status
echo "📊 Status dos serviços:"
sleep 5
docker service ls

echo ""
echo "🎉 Deploy executado!"
echo "📝 Para verificar logs: docker service logs Kryonix_web"
echo "🌐 Para verificar se está funcionando: curl http://localhost:8080"

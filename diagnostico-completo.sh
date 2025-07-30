#!/bin/bash

echo "=========================================="
echo "🔍 DIAGNOSTICO COMPLETO KRYONIX PLATFORM"
echo "=========================================="
echo "Data: $(date)"
echo "Servidor: $(hostname)"
echo "Usuario: $(whoami)"
echo ""

echo "🐳 DOCKER STATUS:"
docker --version
docker info | head -10
echo ""

echo "🏗️ DOCKER SWARM:"
docker node ls 2>/dev/null || echo "Swarm nao ativo"
echo ""

echo "📦 SERVICES:"
docker service ls | grep -i kryonix || echo "Nenhum servico KRYONIX"
echo ""

echo "🌐 NETWORK:"
docker network ls | grep -v bridge
echo ""

echo "📊 LOGS RECENTES:"
echo "Para ver logs: docker service logs Kryonix_web"
echo "Para mais detalhes: docker service logs Kryonix_web --details"

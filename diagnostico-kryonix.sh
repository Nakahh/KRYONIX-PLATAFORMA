#!/bin/bash

echo "🔍 DIAGNÓSTICO KRYONIX PLATFORM"
echo "================================"
echo

echo "📊 Status Docker Swarm:"
docker info | grep -E "Swarm|Node" || echo "❌ Docker Swarm não ativo"
echo

echo "📦 Serviços Docker:"
docker service ls | grep -i kryonix || echo "❌ Nenhum serviço KRYONIX encontrado"
echo

echo "🐳 Containers:"
docker ps | grep -i kryonix || echo "❌ Nenhum container KRYONIX rodando"
echo

echo "🌐 Teste de conectividade local:"
if curl -f -s http://localhost:8080/health > /dev/null; then
    echo "✅ localhost:8080 - FUNCIONANDO"
    curl -s http://localhost:8080/health | jq '.' 2>/dev/null || curl -s http://localhost:8080/health
else
    echo "❌ localhost:8080 - NÃO RESPONDE"
fi
echo

echo "🔗 Teste webhook local:"
if curl -f -s -X POST http://localhost:8080/api/github-webhook \
   -H "Content-Type: application/json" \
   -d '{"ref":"test","repository":{"name":"test"}}' > /dev/null; then
    echo "✅ Webhook local - FUNCIONANDO"
else
    echo "❌ Webhook local - NÃO RESPONDE"
fi
echo

echo "🌍 Teste de conectividade externa:"
if curl -f -s https://kryonix.com.br/health > /dev/null; then
    echo "✅ https://kryonix.com.br - FUNCIONANDO"
else
    echo "❌ https://kryonix.com.br - NÃO RESPONDE"
fi
echo

echo "📁 Arquivos do projeto:"
cd /opt/kryonix-plataform 2>/dev/null || cd /opt/kryonix-platform 2>/dev/null || {
    echo "❌ Diretório do projeto não encontrado"
    exit 1
}

for file in server.js package.json docker-stack.yml Dockerfile webhook-deploy.sh; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - FALTANDO"
    fi
done
echo

echo "📋 Logs recentes:"
if [ -f "/var/log/kryonix-deploy.log" ]; then
    echo "Últimas 5 linhas do log:"
    tail -5 /var/log/kryonix-deploy.log
else
    echo "❌ Log do sistema não encontrado"
fi
echo

echo "🎯 RECOMENDAÇÕES:"
if ! docker service ls | grep -q "Kryonix"; then
    echo "1. Execute: ./instalador-plataforma-kryonix.sh"
    echo "2. Ou: docker stack deploy -c docker-stack.yml Kryonix"
fi
echo "3. Para logs: docker service logs Kryonix_web"
echo "4. Para reiniciar: docker service update --force Kryonix_web"

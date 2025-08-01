#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DO WEBHOOK KRYONIX"
echo "=========================================="
echo ""

# Verificar se o serviço está rodando
echo "1. STATUS DOS SERVIÇOS:"
echo "   Docker Swarm:"
if docker info | grep -q "Swarm: active"; then
    echo "   ✅ Docker Swarm ativo"
else
    echo "   ❌ Docker Swarm inativo"
fi

echo "   Serviços KRYONIX:"
docker service ls | grep -i kryonix || echo "   ❌ Nenhum serviço KRYONIX encontrado"

echo ""
echo "2. TESTE DE CONECTIVIDADE LOCAL:"
echo "   Health check:"
curl -s -f http://localhost:8080/health >/dev/null 2>&1 && echo "   ✅ Health check OK" || echo "   ❌ Health check falhou"

echo "   Webhook endpoint (GET):"
webhook_get=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:8080/api/github-webhook 2>/dev/null)
echo "   HTTP $webhook_get (GET não deve ser 404)"

echo ""
echo "3. TESTE DO WEBHOOK (POST sem assinatura):"
webhook_test_response=$(curl -s -w "\nHTTP: %{http_code}" -X POST http://localhost:8080/api/github-webhook \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: push" \
    -d '{"ref":"refs/heads/main","test":true}' 2>/dev/null)
echo "$webhook_test_response"

echo ""
echo "4. TESTE DO WEBHOOK (POST com secret simulado):"
# Simular assinatura GitHub
payload='{"ref":"refs/heads/main","test":true}'
secret="${WEBHOOK_SECRET:-$(echo 'WEBHOOK_SECRET not set' && exit 1)}"
signature="sha256=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$secret" | cut -d' ' -f2)"

webhook_signed_response=$(curl -s -w "\nHTTP: %{http_code}" -X POST http://localhost:8080/api/github-webhook \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: push" \
    -H "X-Hub-Signature-256: $signature" \
    -d "$payload" 2>/dev/null)
echo "$webhook_signed_response"

echo ""
echo "5. VERIFICAÇÃO DE LOGS:"
echo "   Logs do serviço:"
docker service logs --tail 10 Kryonix_web 2>/dev/null || echo "   ❌ Não foi possível acessar logs do serviço"

echo ""
echo "6. VERIFICAÇÃO DE ARQUIVOS:"
echo "   server.js:"
if [ -f "/opt/kryonix-plataform/server.js" ]; then
    echo "   ✅ server.js existe"
    if grep -q "github-webhook" "/opt/kryonix-plataform/server.js"; then
        echo "   ✅ webhook endpoint encontrado no server.js"
    else
        echo "   ❌ webhook endpoint NÃO encontrado no server.js"
    fi
else
    echo "   ❌ server.js não encontrado"
fi

echo "   webhook-deploy.sh:"
if [ -f "/opt/kryonix-plataform/webhook-deploy.sh" ]; then
    echo "   ✅ webhook-deploy.sh existe"
    if [ -x "/opt/kryonix-plataform/webhook-deploy.sh" ]; then
        echo "   ✅ webhook-deploy.sh é executável"
    else
        echo "   ❌ webhook-deploy.sh não é executável"
    fi
else
    echo "   ❌ webhook-deploy.sh não encontrado"
fi

echo ""
echo "7. CONFIGURAÇÃO DE REDE:"
echo "   Redes Docker:"
docker network ls | grep -E "(kryonix|Kryonix)" || echo "   ❌ Rede KRYONIX não encontrada"

echo ""
echo "8. VERIFICAÇÃO TRAEFIK:"
if docker service ls | grep -q traefik; then
    echo "   ✅ Traefik encontrado"
    echo "   Testando através do Traefik:"
    traefik_test=$(curl -s -w "%{http_code}" -o /dev/null https://kryonix.com.br/health 2>/dev/null)
    echo "   HTTPS Health: HTTP $traefik_test"
    
    traefik_webhook_test=$(curl -s -w "%{http_code}" -o /dev/null https://kryonix.com.br/api/github-webhook 2>/dev/null)
    echo "   HTTPS Webhook: HTTP $traefik_webhook_test"
else
    echo "   ❌ Traefik não encontrado"
fi

echo ""
echo "=========================================="
echo "🔍 DIAGNÓSTICO CONCLUÍDO"
echo "=========================================="

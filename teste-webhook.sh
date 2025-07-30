#!/bin/bash

echo "🧪 TESTANDO WEBHOOK AUTOMÁTICO - KRYONIX"
echo "======================================="

# Testar webhook local
echo "1️⃣ Testando webhook local..."
curl -f -s -X POST "http://localhost:8080/api/github-webhook" \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","repository":{"name":"KRYONIX-PLATAFORMA"}}' && \
echo "✅ Webhook local respondeu" || echo "❌ Webhook local falhou"

echo ""

# Testar webhook remoto
echo "2️⃣ Testando webhook remoto..."
curl -f -s -X POST "https://kryonix.com.br/api/github-webhook" \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","repository":{"name":"KRYONIX-PLATAFORMA"}}' && \
echo "✅ Webhook remoto respondeu" || echo "❌ Webhook remoto falhou"

echo ""

# Verificar status
echo "3️⃣ Verificando status dos serviços..."
curl -f -s "http://localhost:8080/health" > /dev/null && \
echo "✅ Serviço local online" || echo "❌ Serviço local offline"

curl -f -s "https://kryonix.com.br/health" > /dev/null && \
echo "✅ Serviço remoto online" || echo "❌ Serviço remoto offline"

echo ""
echo "🚀 Teste concluído! Agora faça o commit e observe o deploy automático."
echo "⏱️ Tempo esperado: 2-3 minutos para deploy completo"

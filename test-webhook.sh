#!/bin/bash

# Teste completo do webhook KRYONIX
echo "🔗 Testando webhook KRYONIX..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

WEBHOOK_URL="https://kryonix.com.br/api/github-webhook"

echo -e "${CYAN}📡 Testando conectividade com $WEBHOOK_URL${NC}"

# Teste 1: Health check
echo -e "\n${YELLOW}1. Testando health check...${NC}"
if curl -f -s "https://kryonix.com.br/health" >/dev/null; then
    echo -e "${GREEN}✅ Health check OK${NC}"
else
    echo -e "${RED}❌ Health check falhou${NC}"
fi

# Teste 2: Webhook básico
echo -e "\n${YELLOW}2. Testando webhook básico...${NC}"
response=$(curl -s -w "%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"test":true,"ref":"refs/heads/main"}')

if [[ "$response" == *"200"* ]] || [[ "$response" == *"accepted"* ]]; then
    echo -e "${GREEN}✅ Webhook respondeu corretamente${NC}"
else
    echo -e "${RED}❌ Webhook com problemas: $response${NC}"
fi

# Teste 3: Webhook com assinatura
echo -e "\n${YELLOW}3. Testando webhook com assinatura GitHub...${NC}"
payload='{"ref":"refs/heads/main","repository":{"name":"KRYONIX-PLATAFORMA"},"pusher":{"name":"test"}}'
secret="Kr7\$n0x-V1t0r-2025-#Jwt\$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8"

# Calcular assinatura
signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$secret" -binary | base64 | tr -d '\n')
header_signature="sha256=$signature"

response_with_sig=$(curl -s -w "%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -H "X-Hub-Signature-256: $header_signature" \
    -H "X-GitHub-Event: push" \
    -d "$payload")

if [[ "$response_with_sig" == *"200"* ]] || [[ "$response_with_sig" == *"accepted"* ]]; then
    echo -e "${GREEN}✅ Webhook com assinatura funcionando${NC}"
else
    echo -e "${RED}❌ Webhook com assinatura com problemas: $response_with_sig${NC}"
fi

# Teste 4: Verificar serviços
echo -e "\n${YELLOW}4. Verificando todos os serviços...${NC}"
for port in 8080 8082 8084; do
    if curl -f -s "http://localhost:$port/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Serviço na porta $port OK${NC}"
    else
        echo -e "${RED}❌ Serviço na porta $port com problemas${NC}"
    fi
done

echo -e "\n${CYAN}🎉 Teste do webhook KRYONIX concluído!${NC}"

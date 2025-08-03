#!/bin/bash

# Script de teste para validar webhook funcional aplicado do instalador antigo

echo "🧪 TESTE WEBHOOK FUNCIONAL - KRYONIX"
echo "======================================"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_success=0
test_total=0

test_check() {
    local description="$1"
    local command="$2"
    test_total=$((test_total + 1))
    
    echo -n "🔍 $description... "
    
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSOU${NC}"
        test_success=$((test_success + 1))
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        return 1
    fi
}

echo -e "\n${BLUE}1. Verificando arquivo webhook-deploy.sh...${NC}"
test_check "Webhook-deploy.sh existe" "[ -f webhook-deploy.sh ]"
test_check "Webhook-deploy.sh tem função deploy" "grep -q 'deploy()' webhook-deploy.sh"
test_check "Webhook-deploy.sh tem auto_update_dependencies" "grep -q 'auto_update_dependencies()' webhook-deploy.sh"
test_check "Webhook-deploy.sh tem token funcional" "grep -q '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' webhook-deploy.sh"

echo -e "\n${BLUE}2. Verificando instalador principal...${NC}"
test_check "Instalador tem webhook secret correto" "grep -q 'Kr7.*n0x-V1t0r-2025' instalador-plataforma-kryonix.sh"
test_check "Instalador tem endpoint webhook" "grep -q '/api/github-webhook' instalador-plataforma-kryonix.sh"
test_check "Instalador referencia webhook-deploy.sh" "grep -q 'webhook-deploy.sh' instalador-plataforma-kryonix.sh"

echo -e "\n${BLUE}3. Verificando webhook no server.js...${NC}"
if [ -f "server.js" ]; then
    test_check "Server.js tem endpoint webhook" "grep -q '/api/github-webhook' server.js"
    test_check "Server.js tem verificação de assinatura" "grep -q 'verifyGitHubSignature' server.js"
    test_check "Server.js executa webhook-deploy.sh" "grep -q 'webhook-deploy.sh' server.js"
else
    echo "⚠️ server.js não encontrado - será criado pelo instalador"
fi

echo -e "\n${BLUE}4. Verificando configurações do Docker...${NC}"
if [ -f "docker-stack.yml" ]; then
    test_check "Docker stack tem prioridade webhook" "grep -q 'priority=10000' docker-stack.yml"
    test_check "Docker stack tem rota webhook" "grep -q 'github-webhook' docker-stack.yml"
else
    echo "⚠️ docker-stack.yml não encontrado - será criado pelo instalador"
fi

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}RESULTADO FINAL:${NC} $test_success/$test_total testes passaram"

if [ $test_success -eq $test_total ]; then
    echo -e "${GREEN}🎉 WEBHOOK FUNCIONAL APLICADO COM SUCESSO!${NC}"
    echo -e "${GREEN}✅ Todas as configurações do instalador antigo foram aplicadas${NC}"
    exit 0
else
    echo -e "${RED}⚠️ Alguns testes falharam - revisar configurações${NC}"
    exit 1
fi

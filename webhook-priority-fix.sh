#!/bin/bash

# ==============================================================================
# SCRIPT DE OTIMIZAÇÃO - WEBHOOK E PRIORIDADES TRAEFIK
# Versão: 1.0.0 - Correção de prioridades para deploy automático instantâneo
# ==============================================================================

set -e

BLUE='\033[1;34m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
RESET='\033[0m'

echo -e "${BLUE}🔧 KRYONIX - Otimização Webhook e Traefik${RESET}"
echo -e "${YELLOW}=====================================\n${RESET}"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script no diretório do projeto KRYONIX${RESET}"
    exit 1
fi

echo -e "${GREEN}✅ Aplicando correções de prioridade Traefik...${RESET}"

# 1. Verificar se o stack está rodando
if docker service ls | grep -q "Kryonix_web"; then
    echo -e "${YELLOW}🔄 Aplicando update no serviço para prioridades...${RESET}"
    
    # Forçar update do serviço com novas configurações
    docker service update --force Kryonix_web >/dev/null 2>&1 || {
        echo -e "${YELLOW}⚠️ Update direto falhou, redesployando stack...${RESET}"
        docker stack rm Kryonix >/dev/null 2>&1 || true
        sleep 15
        docker stack deploy -c docker-stack.yml Kryonix
    }
else
    echo -e "${YELLOW}🚀 Deployando stack com configurações otimizadas...${RESET}"
    docker stack deploy -c docker-stack.yml Kryonix
fi

echo -e "${GREEN}✅ Aguardando estabilização...${RESET}"
sleep 30

# 2. Testar webhook
echo -e "${GREEN}🧪 Testando webhook endpoint...${RESET}"
if curl -f -s -X POST "http://localhost:8080/api/github-webhook" \
   -H "Content-Type: application/json" \
   -d '{"test": true, "ref": "refs/heads/main"}' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Webhook respondendo corretamente${RESET}"
else
    echo -e "${YELLOW}⚠️ Webhook pode estar inicializando...${RESET}"
fi

# 3. Verificar health
echo -e "${GREEN}🏥 Verificando saúde do serviço...${RESET}"
if curl -f -s "http://localhost:8080/health" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Serviço saudável${RESET}"
else
    echo -e "${YELLOW}⚠️ Serviço pode estar inicializando...${RESET}"
fi

# 4. Mostrar status dos serviços
echo -e "\n${BLUE}📊 Status dos serviços:${RESET}"
docker service ls | grep Kryonix || echo -e "${YELLOW}Nenhum serviço KRYONIX encontrado${RESET}"

echo -e "\n${GREEN}🎉 Otimização concluída!${RESET}"
echo -e "${BLUE}==========================================\n${RESET}"

echo -e "${GREEN}✅ CORREÇÕES APLICADAS:${RESET}"
echo -e "   • ${GREEN}API webhook com prioridade 1000${RESET}"
echo -e "   • ${GREEN}Suporte HTTP e HTTPS para webhook${RESET}"
echo -e "   • ${GREEN}Rede fixa 'kryonix-net'${RESET}"
echo -e "   • ${GREEN}Volumes otimizados${RESET}"

echo -e "\n${BLUE}🔗 TESTE O WEBHOOK:${RESET}"
echo -e "${YELLOW}curl -X POST http://localhost:8080/api/github-webhook -H 'Content-Type: application/json' -d '{\"ref\":\"refs/heads/main\"}'${RESET}"

echo -e "\n${BLUE}🌐 URLs:${RESET}"
echo -e "   • Health: ${YELLOW}http://localhost:8080/health${RESET}"
echo -e "   • Webhook: ${YELLOW}http://localhost:8080/api/github-webhook${RESET}"
echo -e "   • Status: ${YELLOW}http://localhost:8080/api/status${RESET}"

echo -e "\n${GREEN}🚀 Agora o webhook deve atualizar automaticamente quando você der push na main!${RESET}"

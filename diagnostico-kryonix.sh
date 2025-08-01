#!/bin/bash

# Script de diagnóstico KRYONIX
# Criado para identificar e corrigir problemas reportados pelo usuário

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

STACK_NAME="Kryonix"

echo -e "${BLUE}🔍 DIAGNÓSTICO COMPLETO KRYONIX PLATFORM${NC}"
echo "=================================================="

# 1. Verificar Docker Swarm
echo -e "\n${YELLOW}1. VERIFICANDO DOCKER SWARM:${NC}"
if docker info | grep -q "Swarm: active"; then
    echo -e "   ✅ Docker Swarm ativo"
else
    echo -e "   ❌ Docker Swarm não está ativo!"
    exit 1
fi

# 2. Verificar serviços
echo -e "\n${YELLOW}2. STATUS DOS SERVIÇOS:${NC}"
docker service ls --format "table {{.Name}}\t{{.Replicas}}\t{{.Image}}\t{{.Ports}}"

# 3. Verificar cada serviço individualmente
echo -e "\n${YELLOW}3. DIAGNÓSTICO DETALHADO POR SERVIÇO:${NC}"

for service in web monitor; do
    echo -e "\n   🔍 Analisando ${STACK_NAME}_${service}:"
    
    # Status das réplicas
    replicas=$(docker service ls --format "{{.Name}} {{.Replicas}}" | grep "${STACK_NAME}_${service}" | awk '{print $2}' || echo "0/0")
    echo -e "      Status: $replicas"
    
    # Logs recentes
    echo -e "      📋 Logs (últimas 5 linhas):"
    docker service logs "${STACK_NAME}_${service}" --tail 5 2>/dev/null | sed 's/^/         /'
    
    # Tasks do serviço
    echo -e "      🎯 Tasks:"
    docker service ps "${STACK_NAME}_${service}" --format "table {{.Name}}\t{{.CurrentState}}\t{{.Error}}" | sed 's/^/         /'
done

# 4. Teste de conectividade
echo -e "\n${YELLOW}4. TESTES DE CONECTIVIDADE:${NC}"

# Teste health check
echo -e "   🏥 Health check (http://localhost:8080/health):"
if timeout 10s curl -f -s http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "      ✅ Respondendo"
    curl -s http://localhost:8080/health | jq . 2>/dev/null || curl -s http://localhost:8080/health
else
    echo -e "      ❌ Não responde"
fi

# Teste webhook local
echo -e "\n   🔗 Webhook local (http://localhost:8080/api/github-webhook):"
if timeout 10s curl -f -s -X POST http://localhost:8080/api/github-webhook \
   -H "Content-Type: application/json" \
   -d '{"test":true,"ref":"refs/heads/main"}' >/dev/null 2>&1; then
    echo -e "      ✅ Funcionando"
else
    echo -e "      ❌ Falha"
fi

# Teste página principal
echo -e "\n   🌐 Página principal (http://localhost:8080/):"
status=$(timeout 10s curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ 2>/dev/null || echo "000")
if [[ "$status" == "200" ]]; then
    echo -e "      ✅ Carregando (status: $status)"
else
    echo -e "      ❌ Problemas (status: $status)"
fi

# 5. Verificar imagem Docker
echo -e "\n${YELLOW}5. VERIFICANDO IMAGEM DOCKER:${NC}"
if docker images | grep -q "kryonix-plataforma"; then
    echo -e "   ✅ Imagem kryonix-plataforma existe"
    docker images | grep kryonix-plataforma | sed 's/^/      /'
else
    echo -e "   ❌ Imagem kryonix-plataforma não encontrada"
fi

# 6. Verificar portas
echo -e "\n${YELLOW}6. VERIFICANDO PORTAS:${NC}"
for port in 8080 8084; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "   ✅ Porta $port está em uso"
    else
        echo -e "   ❌ Porta $port n��o está em uso"
    fi
done

# 7. Espaço em disco
echo -e "\n${YELLOW}7. RECURSOS DO SISTEMA:${NC}"
echo -e "   💾 Espaço em disco:"
df -h / | sed 's/^/      /'

echo -e "   🧠 Memória:"
free -h | sed 's/^/      /'

# 8. Processos relacionados
echo -e "\n${YELLOW}8. PROCESSOS RELACIONADOS:${NC}"
ps aux | grep -E "(node|npm|docker)" | grep -v grep | sed 's/^/   /'

# 9. Sugestões de correção
echo -e "\n${YELLOW}9. AÇÕES CORRETIVAS SUGERIDAS:${NC}"

# Verificar se serviço web não está respondendo
if ! timeout 5s curl -f -s http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "   🔧 Serviço web não responde - tentar:"
    echo -e "      docker service update --force ${STACK_NAME}_web"
    echo -e "      docker service logs ${STACK_NAME}_web -f"
fi

# Verificar se há serviços com 0/1 replicas
zero_replicas=$(docker service ls --format "{{.Name}} {{.Replicas}}" | grep "0/1" | wc -l)
if [[ "$zero_replicas" -gt 0 ]]; then
    echo -e "   🔧 Serviços com 0/1 replicas detectados - tentar:"
    echo -e "      docker stack rm $STACK_NAME"
    echo -e "      sleep 30"
    echo -e "      docker stack deploy -c docker-stack.yml $STACK_NAME"
fi

# 10. Comandos úteis
echo -e "\n${YELLOW}10. COMANDOS ÚTEIS PARA DEPURAÇÃO:${NC}"
echo -e "    # Ver logs em tempo real:"
echo -e "    docker service logs ${STACK_NAME}_web -f"
echo -e ""
echo -e "    # Forçar restart:"
echo -e "    docker service update --force ${STACK_NAME}_web"
echo -e ""
echo -e "    # Redeploy completo:"
echo -e "    docker stack rm $STACK_NAME && sleep 30 && docker stack deploy -c docker-stack.yml $STACK_NAME"
echo -e ""
echo -e "    # Build nova imagem:"
echo -e "    docker build --no-cache -t kryonix-plataforma:latest ."

echo -e "\n${GREEN}✅ Diagnóstico completo finalizado!${NC}"

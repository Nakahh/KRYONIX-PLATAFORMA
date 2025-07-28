#!/bin/bash

echo "🔍 DIAGNÓSTICO TRAEFIK KRYONIX"
echo "=============================="

# Verificar se Traefik está rodando
echo "1️⃣ Verificando se Traefik está rodando:"
TRAEFIK_RUNNING=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep traefik)
if [ -n "$TRAEFIK_RUNNING" ]; then
    echo "✅ Traefik está rodando:"
    echo "$TRAEFIK_RUNNING"
else
    echo "❌ Traefik NÃO está rodando!"
    echo "   Verificando por serviços Docker Swarm:"
    docker service ls | grep -i traefik || echo "   ❌ Nenhum serviço Traefik encontrado"
fi

echo ""
echo "2️⃣ Verificando portas 80/443:"
if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
    PORTA_80=$(netstat -tlnp 2>/dev/null | grep ":80 " | head -1)
    echo "✅ Porta 80: $PORTA_80"
else
    echo "❌ Porta 80 não está sendo escutada"
fi

if netstat -tlnp 2>/dev/null | grep -q ":443 "; then
    PORTA_443=$(netstat -tlnp 2>/dev/null | grep ":443 " | head -1)
    echo "✅ Porta 443: $PORTA_443"
else
    echo "❌ Porta 443 não está sendo escutada"
fi

echo ""
echo "3️⃣ Verificando redes Docker:"
echo "   Redes Traefik:"
docker network ls | grep traefik || echo "   ❌ Nenhuma rede Traefik encontrada"

echo ""
echo "4️⃣ Verificando serviços Kryonix:"
docker service ls | grep -i kryonix || echo "❌ Nenhum serviço Kryonix encontrado"

echo ""
echo "5️⃣ Verificando labels Traefik nos serviços:"
for service in $(docker service ls --format "{{.Name}}" | grep -i kryonix); do
    echo "   Serviço: $service"
    docker service inspect $service --format '{{range .Spec.Labels}}{{println .}}{{end}}' | grep traefik || echo "   ❌ Sem labels Traefik"
done

echo ""
echo "6️⃣ Testando resolução DNS:"
nslookup www.kryonix.com.br 2>/dev/null | grep "Address:" | tail -1 || echo "❌ DNS não resolve"
nslookup kryonix.com.br 2>/dev/null | grep "Address:" | tail -1 || echo "❌ DNS não resolve"

echo ""
echo "7️⃣ Testando conectividade direta:"
echo "   HTTP localhost:80"
curl -I -m 5 http://localhost:80 2>/dev/null | head -1 || echo "   ❌ Não conecta"

echo "   HTTP www.kryonix.com.br"
curl -I -m 5 http://www.kryonix.com.br 2>/dev/null | head -1 || echo "   ❌ Não conecta"

echo "   HTTPS www.kryonix.com.br"
curl -I -m 5 https://www.kryonix.com.br 2>/dev/null | head -1 || echo "   ❌ Não conecta"

echo ""
echo "8️⃣ Logs do Traefik (se existir):"
TRAEFIK_CONTAINER=$(docker ps --format "{{.Names}}" | grep traefik | head -1)
if [ -n "$TRAEFIK_CONTAINER" ]; then
    echo "   Container: $TRAEFIK_CONTAINER"
    docker logs --tail 10 $TRAEFIK_CONTAINER 2>/dev/null || echo "   ❌ Não conseguiu pegar logs"
else
    echo "   ❌ Container Traefik não encontrado"
fi

echo ""
echo "🔧 DIAGNÓSTICO COMPLETO!"
echo ""
echo "💡 SOLUÇÕES POSSÍVEIS:"
echo "   1. Se Traefik não está rodando: iniciar o Traefik primeiro"
echo "   2. Se portas 80/443 não estão abertas: problema no Traefik"
echo "   3. Se redes não existem: criar redes traefik"
echo "   4. Se labels não estão corretos: recriar serviços"
echo "   5. Se DNS não resolve: aguardar propagação DNS"

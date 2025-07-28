#!/bin/bash

echo "🔍 TESTE DE DOMÍNIO KRYONIX"
echo "=========================="

# Verificar IP do servidor
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "UNKNOWN")
echo "📍 IP do servidor: $SERVER_IP"

# Verificar DNS
echo ""
echo "🌐 Verificando DNS:"
echo "   www.kryonix.com.br:"
DNS_WWW=$(nslookup www.kryonix.com.br 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
echo "   Aponta para: $DNS_WWW"

echo "   kryonix.com.br:"
DNS_ROOT=$(nslookup kryonix.com.br 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
echo "   Aponta para: $DNS_ROOT"

# Verificar se DNS está correto
if [ "$DNS_WWW" = "$SERVER_IP" ] || [ "$DNS_ROOT" = "$SERVER_IP" ]; then
    echo "✅ DNS configurado corretamente"
else
    echo "❌ DNS não aponta para este servidor"
    echo "   Configure no DNS:"
    echo "   A   @              $SERVER_IP"
    echo "   A   www            $SERVER_IP"
fi

# Verificar portas
echo ""
echo "🔌 Verificando portas:"
if netstat -tlnp 2>/dev/null | grep -q ":80 "; then
    echo "   ✅ Porta 80 (HTTP) aberta"
else
    echo "   ❌ Porta 80 (HTTP) fechada"
fi

if netstat -tlnp 2>/dev/null | grep -q ":443 "; then
    echo "   ✅ Porta 443 (HTTPS) aberta"
else
    echo "   ❌ Porta 443 (HTTPS) fechada"
fi

if netstat -tlnp 2>/dev/null | grep -q ":8080 "; then
    echo "   ✅ Porta 8080 (APP) aberta"
else
    echo "   ❌ Porta 8080 (APP) fechada"
fi

# Testar conectividade
echo ""
echo "🌍 Testando conectividade:"
echo "   HTTP direto (IP:8080):"
if curl -I -m 5 http://$SERVER_IP:8080/health 2>/dev/null | grep -q "200"; then
    echo "   ✅ Funciona"
else
    echo "   ❌ Não funciona"
fi

echo "   HTTP via domínio:"
if curl -I -m 5 http://www.kryonix.com.br 2>/dev/null | grep -q "200\|301\|302"; then
    echo "   ✅ Funciona"
else
    echo "   ❌ Não funciona"
fi

echo "   HTTPS via domínio:"
if curl -I -m 5 https://www.kryonix.com.br 2>/dev/null | grep -q "200"; then
    echo "   ✅ Funciona"
else
    echo "   ❌ Não funciona"
fi

# Verificar Traefik
echo ""
echo "🚦 Verificando Traefik:"
if docker ps | grep -q traefik; then
    echo "   ✅ Traefik rodando"
    TRAEFIK_CONTAINER=$(docker ps --format "{{.Names}}" | grep traefik | head -1)
    echo "   Container: $TRAEFIK_CONTAINER"
else
    echo "   ❌ Traefik não encontrado"
fi

# Verificar serviços Kryonix
echo ""
echo "📊 Verificando serviços Kryonix:"
docker service ls | grep -i kryonix || echo "   ❌ Nenhum serviço Kryonix encontrado"

echo ""
echo "📋 RESUMO:"
echo "   1. Se DNS não aponta para $SERVER_IP, configure no provedor DNS"
echo "   2. Se Traefik não está rodando, inicie-o primeiro"
echo "   3. Se portas 80/443 não estão abertas, verifique firewall"
echo ""
echo "🔧 Para corrigir DNS temporariamente (teste local):"
echo "   echo '$SERVER_IP www.kryonix.com.br' >> /etc/hosts"
echo "   echo '$SERVER_IP kryonix.com.br' >> /etc/hosts"

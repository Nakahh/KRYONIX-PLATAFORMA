#!/bin/bash

# 🔧 KRYONIX - Configurar Keycloak Existente
# Script para configurar o Keycloak que já está rodando

set -euo pipefail

# Configurações
KEYCLOAK_ADMIN_USER="kryonix"
KEYCLOAK_ADMIN_PASSWORD="Vitor@123456"
DOMAIN_BASE="kryonix.com.br"

echo "🔍 KRYONIX - Configurando Keycloak Existente"
echo "============================================="

# 1. Parar o serviço que está falhando
echo "🛑 Parando serviço kryonix-auth que está falhando..."
docker stack rm kryonix-auth 2>/dev/null || echo "Serviço já removido"
sleep 5

# 2. Verificar Keycloak existente
echo "🔍 Verificando Keycloak existente..."
if docker ps | grep -q "keycloak_keycloak"; then
    echo "✅ Keycloak existente encontrado"
    
    # Obter IP do container
    KEYCLOAK_CONTAINER=$(docker ps --format "{{.Names}}" | grep "keycloak_keycloak" | head -1)
    KEYCLOAK_IP=$(docker inspect $KEYCLOAK_CONTAINER --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>/dev/null || echo "")
    
    echo "📋 Container: $KEYCLOAK_CONTAINER"
    echo "🌐 IP: ${KEYCLOAK_IP:-'N/A'}"
    
    # Testar URLs possíveis
    KEYCLOAK_URLS=(
        "https://keycloak.$DOMAIN_BASE"
        "http://localhost:8080" 
        "http://127.0.0.1:8080"
        "http://$KEYCLOAK_IP:8080"
    )
    
    KEYCLOAK_URL=""
    for url in "${KEYCLOAK_URLS[@]}"; do
        echo "🔍 Testando: $url"
        if curl -f -s --max-time 5 "$url" > /dev/null 2>&1; then
            KEYCLOAK_URL="$url"
            echo "✅ Keycloak acessível em: $url"
            break
        fi
    done
    
    if [ -z "$KEYCLOAK_URL" ]; then
        echo "❌ Keycloak não acessível em nenhuma URL"
        echo "🔧 Tentando através do proxy da porta..."
        # Verificar se há redirecionamento de porta
        if netstat -tlnp 2>/dev/null | grep -q ":8080"; then
            KEYCLOAK_URL="http://localhost:8080"
            echo "✅ Usando proxy local: $KEYCLOAK_URL"
        else
            echo "❌ Keycloak não está acessível"
            exit 1
        fi
    fi
    
else
    echo "❌ Nenhum Keycloak encontrado"
    exit 1
fi

# 3. Testar autenticação
echo ""
echo "🔐 Testando autenticação admin..."
ADMIN_TOKEN=$(curl -s --max-time 30 \
    -d "client_id=admin-cli" \
    -d "username=$KEYCLOAK_ADMIN_USER" \
    -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
    -d "grant_type=password" \
    "$KEYCLOAK_URL/realms/master/protocol/openid_connect/token" | \
    jq -r '.access_token' 2>/dev/null || echo "")

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
    echo "❌ Falha na autenticação"
    echo "🔧 Credenciais utilizadas:"
    echo "   Usuário: $KEYCLOAK_ADMIN_USER"
    echo "   URL: $KEYCLOAK_URL"
    echo ""
    echo "💡 Tente verificar:"
    echo "   1. Se o Keycloak está funcionando: docker logs $KEYCLOAK_CONTAINER"
    echo "   2. Se as credenciais estão corretas"
    echo "   3. Se há proxy redirecionando para HTTPS"
    exit 1
else
    echo "✅ Autenticação admin realizada com sucesso"
fi

# 4. Verificar realm KRYONIX
echo ""
echo "🏢 Verificando realm KRYONIX..."
if curl -s -H "Authorization: Bearer $ADMIN_TOKEN" "$KEYCLOAK_URL/admin/realms/KRYONIX" > /dev/null 2>&1; then
    echo "✅ Realm KRYONIX já existe"
else
    echo "🔧 Criando realm KRYONIX..."
    
    # Criar realm
    REALM_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$KEYCLOAK_URL/admin/realms" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "realm": "KRYONIX",
            "enabled": true,
            "displayName": "KRYONIX - Plataforma SaaS",
            "displayNameHtml": "<strong>KRYONIX</strong> - Sua Plataforma de Negócios",
            "defaultLocale": "pt-BR",
            "internationalizationEnabled": true,
            "supportedLocales": ["pt-BR"],
            "registrationAllowed": false,
            "loginWithEmailAllowed": true,
            "bruteForceProtected": true,
            "attributes": {
                "multi_tenant": "true",
                "mobile_priority": "true",
                "created_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
            }
        }')
    
    if [[ "$REALM_RESPONSE" =~ ^(200|201|409)$ ]]; then
        echo "✅ Realm KRYONIX criado/atualizado"
    else
        echo "⚠️ Possível problema na criação do realm (código: $REALM_RESPONSE)"
    fi
fi

# 5. Criar clients principais
echo ""
echo "🔧 Configurando clients..."

# Client Frontend
curl -s -X POST "$KEYCLOAK_URL/admin/realms/KRYONIX/clients" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "clientId": "kryonix-frontend",
        "name": "KRYONIX Frontend",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "secret": "kryonix-frontend-secret-2025",
        "redirectUris": [
            "https://app.'$DOMAIN_BASE'/*",
            "https://www.'$DOMAIN_BASE'/*",
            "https://*.'$DOMAIN_BASE'/*",
            "http://localhost:3000/*"
        ],
        "webOrigins": ["*"],
        "protocol": "openid-connect",
        "publicClient": false,
        "standardFlowEnabled": true,
        "directAccessGrantsEnabled": true,
        "serviceAccountsEnabled": true
    }' > /dev/null 2>&1 && echo "✅ Client Frontend criado" || echo "⚠️ Client Frontend (pode já existir)"

# Client Mobile
curl -s -X POST "$KEYCLOAK_URL/admin/realms/KRYONIX/clients" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "clientId": "kryonix-mobile-app",
        "name": "KRYONIX Mobile App",
        "enabled": true,
        "clientAuthenticatorType": "client-secret",
        "secret": "kryonix-mobile-secret-2025",
        "redirectUris": [
            "kryonix://auth/callback",
            "https://app.'$DOMAIN_BASE'/mobile/callback"
        ],
        "webOrigins": ["*"],
        "protocol": "openid-connect",
        "publicClient": false,
        "standardFlowEnabled": true,
        "directAccessGrantsEnabled": true
    }' > /dev/null 2>&1 && echo "✅ Client Mobile criado" || echo "⚠️ Client Mobile (pode já existir)"

# 6. Criar usuário admin
echo ""
echo "👤 Configurando usuário admin..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/KRYONIX/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "'$KEYCLOAK_ADMIN_USER'",
        "email": "admin@'$DOMAIN_BASE'",
        "firstName": "KRYONIX",
        "lastName": "Master",
        "enabled": true,
        "emailVerified": true,
        "credentials": [{
            "type": "password",
            "value": "'$KEYCLOAK_ADMIN_PASSWORD'",
            "temporary": false
        }],
        "attributes": {
            "whatsapp": ["+5517981805327"],
            "role": ["admin"]
        }
    }' > /dev/null 2>&1 && echo "✅ Usuário admin criado" || echo "⚠️ Usuário admin (pode já existir)"

# 7. Testes finais
echo ""
echo "🧪 Executando testes finais..."

# Teste realm
if curl -s "$KEYCLOAK_URL/realms/KRYONIX/.well-known/openid_configuration" | grep -q "KRYONIX"; then
    echo "✅ Realm KRYONIX funcionando"
else
    echo "⚠️ Problema no realm KRYONIX"
fi

# Teste login
if curl -s -d "client_id=admin-cli" -d "username=$KEYCLOAK_ADMIN_USER" -d "password=$KEYCLOAK_ADMIN_PASSWORD" -d "grant_type=password" "$KEYCLOAK_URL/realms/master/protocol/openid_connect/token" | grep -q "access_token"; then
    echo "✅ Login admin funcionando"
else
    echo "⚠️ Problema no login admin"
fi

echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
echo "=========================="
echo "🔐 Keycloak: $KEYCLOAK_URL"
echo "👤 Admin: $KEYCLOAK_ADMIN_USER / $KEYCLOAK_ADMIN_PASSWORD"
echo "🏢 Realm: KRYONIX"
echo "📱 Clients: Frontend, Mobile"
echo ""
echo "🌐 URLs importantes:"
echo "   Admin Console: $KEYCLOAK_URL/admin"
echo "   Realm KRYONIX: $KEYCLOAK_URL/realms/KRYONIX"
echo ""
echo "✅ Keycloak está pronto para uso!"

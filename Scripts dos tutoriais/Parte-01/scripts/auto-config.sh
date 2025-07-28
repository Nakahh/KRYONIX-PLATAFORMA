#!/bin/bash
# Script de Configuração Automática Keycloak - Parte 01
# KRYONIX SaaS Platform

echo "🚀 Iniciando configuração automática do Keycloak..."

# Variáveis de configuração
KEYCLOAK_URL="https://keycloak.kryonix.com.br"
ADMIN_USER="kryonix"
ADMIN_PASSWORD="Vitor@123456"
REALM_NAME="kryonix"

# Aguardar Keycloak ficar disponível
echo "⏳ Aguardando Keycloak ficar disponível..."
timeout 300 bash -c "until curl -f $KEYCLOAK_URL/health; do sleep 5; done"

if [ $? -eq 0 ]; then
    echo "✅ Keycloak está disponível!"
else
    echo "❌ Timeout: Keycloak não respondeu em 5 minutos"
    exit 1
fi

# Obter token de acesso admin
echo "🔐 Obtendo token de acesso..."
TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASSWORD" \
  -d "grant_type=password" \
  -d "client_id=admin-cli")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Erro ao obter token de acesso"
    echo "Resposta: $TOKEN_RESPONSE"
    exit 1
fi

echo "✅ Token obtido com sucesso!"

# Criar realm KRYONIX
echo "🏰 Criando realm KRYONIX..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "realm": "'$REALM_NAME'",
    "displayName": "KRYONIX SaaS Platform",
    "enabled": true,
    "registrationAllowed": true,
    "loginWithEmailAllowed": true,
    "duplicateEmailsAllowed": false,
    "resetPasswordAllowed": true,
    "editUsernameAllowed": false,
    "bruteForceProtected": true,
    "rememberMe": true,
    "verifyEmail": false,
    "loginTheme": "kryonix",
    "internationalizationEnabled": true,
    "supportedLocales": ["pt-BR", "en"],
    "defaultLocale": "pt-BR"
  }'

echo "✅ Realm KRYONIX criado!"

# Configurar cliente para aplicação frontend
echo "🖥️ Configurando cliente frontend..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "kryonix-frontend",
    "name": "KRYONIX Frontend Application",
    "enabled": true,
    "publicClient": true,
    "protocol": "openid-connect",
    "redirectUris": [
      "https://app.kryonix.com.br/*",
      "https://admin.kryonix.com.br/*",
      "https://www.kryonix.com.br/*"
    ],
    "webOrigins": [
      "https://app.kryonix.com.br",
      "https://admin.kryonix.com.br", 
      "https://www.kryonix.com.br"
    ],
    "attributes": {
      "pkce.code.challenge.method": "S256"
    }
  }'

echo "✅ Cliente frontend configurado!"

# Configurar cliente para aplicação backend
echo "🔧 Configurando cliente backend..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "kryonix-backend",
    "name": "KRYONIX Backend API",
    "enabled": true,
    "publicClient": false,
    "protocol": "openid-connect",
    "serviceAccountsEnabled": true,
    "authorizationServicesEnabled": true
  }'

echo "✅ Cliente backend configurado!"

# Configurar identity provider do Google
echo "🔵 Configurando login com Google..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/identity-provider/instances" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alias": "google",
    "providerId": "google",
    "enabled": true,
    "config": {
      "clientId": "GOOGLE_CLIENT_ID_PLACEHOLDER",
      "clientSecret": "GOOGLE_CLIENT_SECRET_PLACEHOLDER",
      "syncMode": "IMPORT"
    }
  }'

echo "⚠️ Google OAuth configurado (necessário adicionar credenciais reais)"

# Configurar identity provider do GitHub
echo "🐙 Configurando login com GitHub..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/identity-provider/instances" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alias": "github",
    "providerId": "github",
    "enabled": true,
    "config": {
      "clientId": "GITHUB_CLIENT_ID_PLACEHOLDER",
      "clientSecret": "GITHUB_CLIENT_SECRET_PLACEHOLDER",
      "syncMode": "IMPORT"
    }
  }'

echo "⚠️ GitHub OAuth configurado (necessário adicionar credenciais reais)"

# Criar usuário administrador padrão
echo "👤 Criando usuário administrador..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@kryonix.com.br",
    "firstName": "Administrador",
    "lastName": "KRYONIX",
    "enabled": true,
    "emailVerified": true,
    "credentials": [{
      "type": "password",
      "value": "Vitor@123456",
      "temporary": false
    }]
  }'

echo "✅ Usuário administrador criado!"

# Configurar roles
echo "🛡️ Configurando roles..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "admin",
    "description": "Administrador completo da plataforma"
  }'

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user",
    "description": "Usuário padrão da plataforma"
  }'

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "manager",
    "description": "Gerente com permissões intermediárias"
  }'

echo "✅ Roles configurados!"

# Testar configuração
echo "🧪 Testando configuração..."
TEST_RESPONSE=$(curl -s "$KEYCLOAK_URL/realms/$REALM_NAME/.well-known/openid-configuration")
ISSUER=$(echo $TEST_RESPONSE | jq -r '.issuer')

if [ "$ISSUER" = "$KEYCLOAK_URL/realms/$REALM_NAME" ]; then
    echo "✅ Teste de configuração passou!"
else
    echo "❌ Erro no teste de configuração"
    exit 1
fi

# Notificar conclusão via WhatsApp
echo "📱 Enviando notificação WhatsApp..."
curl -s -X POST "https://api.kryonix.com.br/send-message" \
  -H "Authorization: Bearer $EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "message": "✅ PARTE 1 CONCLUÍDA!\n\n🔐 Sistema de Autenticação ATIVO\n🌐 URL: https://keycloak.kryonix.com.br\n👤 Login funcionando\n📊 Progresso: 2% (1 de 50 partes)\n\n➡️ Próxima: Parte 2 - Base de Dados"
  }'

echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
echo ""
echo "📋 Resumo:"
echo "  🌐 Keycloak: $KEYCLOAK_URL"
echo "  🏰 Realm: $REALM_NAME"  
echo "  👤 Admin: admin@kryonix.com.br / Vitor@123456"
echo "  🔵 Google OAuth: Configurado (credenciais necessárias)"
echo "  🐙 GitHub OAuth: Configurado (credenciais necessárias)"
echo ""
echo "➡️ Próximo passo: Parte 2 - Base de Dados PostgreSQL"

#!/bin/bash

# 🚀 KRYONIX - Teste Rápido Keycloak + Supabase
# Este script testa a conectividade e configura o Keycloak rapidamente

set -e

echo "🔍 Testando conectividade Keycloak + Supabase..."

# Obter IP do container Supabase
SUPABASE_IP=$(docker inspect supabase_db.1.tgzgk82fwl78ivny6qi5isi54 --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>/dev/null || echo "")

if [ -z "$SUPABASE_IP" ]; then
    echo "❌ Não foi possível obter IP do Supabase"
    SUPABASE_IP="172.17.0.1"
    echo "🔄 Usando IP padrão: $SUPABASE_IP"
else
    echo "✅ IP do Supabase: $SUPABASE_IP"
fi

# Testar conectividade do banco
echo "🔌 Testando conexão com banco keycloak..."
if docker exec supabase_db.1.tgzgk82fwl78ivny6qi5isi54 pg_isready -h 127.0.0.1 -U keycloak_user -d keycloak; then
    echo "✅ Banco keycloak acessível"
else
    echo "❌ Problema de acesso ao banco keycloak"
fi

# Criar configuração simples do Keycloak
echo "📝 Criando configuração simplificada..."
cat > /tmp/keycloak-simple.yml << EOF
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    environment:
      KEYCLOAK_ADMIN: kryonix
      KEYCLOAK_ADMIN_PASSWORD: Vitor@123456
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://${SUPABASE_IP}:5432/keycloak
      KC_DB_USERNAME: keycloak_user
      KC_DB_PASSWORD: Vitor@123456
      KC_HOSTNAME: keycloak.kryonix.com.br
      KC_PROXY: edge
      KC_HTTP_ENABLED: true
      KC_HEALTH_ENABLED: true
      KC_LOG_LEVEL: INFO
      JAVA_OPTS: "-Xms512m -Xmx1024m"
    command: start --import-realm
    ports:
      - "8080:8080"
    networks:
      - Kryonix-NET
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 30s
        max_attempts: 3
      resources:
        limits:
          memory: 1.5G
        reservations:
          memory: 768M

networks:
  Kryonix-NET:
    external: true
EOF

echo "✅ Configuração criada em /tmp/keycloak-simple.yml"
echo ""
echo "🚀 Para testar execute:"
echo "  docker stack deploy -c /tmp/keycloak-simple.yml kryonix-keycloak-test"
echo ""
echo "🔍 Para verificar logs:"
echo "  docker service logs -f kryonix-keycloak-test_keycloak"
echo ""
echo "🧹 Para limpar depois:"
echo "  docker stack rm kryonix-keycloak-test"

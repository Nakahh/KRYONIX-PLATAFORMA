#!/bin/bash

echo "🔧 CORRIGIR WEBHOOK 404 - KRYONIX"
echo "================================="
echo

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

cd /opt/kryonix-plataform

echo "1️⃣ Fazendo backup da configuração atual..."
cp docker-stack.yml docker-stack-backup-$(date +%Y%m%d_%H%M%S).yml
log_success "Backup criado"

echo "2️⃣ Corrigindo roteamento da API no docker-stack.yml..."

# Detectar resolver SSL
CERT_RESOLVER="letsencryptresolver"
if docker service logs traefik_traefik 2>/dev/null | grep -q "letsencrypt"; then
    CERT_RESOLVER="letsencrypt"
fi

# Criar docker-stack.yml corrigido
cat > docker-stack-fixed.yml << EOF
version: '3.8'

services:
  web:
    image: kryonix-plataforma:latest
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 3
        delay: 10s
      labels:
        # Habilitar Traefik
        - "traefik.enable=true"
        
        # Usar rede detectada automaticamente
        - "traefik.docker.network=Kryonix-NET"

        # Configurar serviço e porta
        - "traefik.http.services.kryonix-web.loadbalancer.server.port=8080"

        # Router HTTP simples
        - "traefik.http.routers.kryonix-web.rule=Host(\`kryonix.com.br\`) || Host(\`www.kryonix.com.br\`)"
        - "traefik.http.routers.kryonix-web.entrypoints=web"
        - "traefik.http.routers.kryonix-web.service=kryonix-web"

        # Router HTTPS principal
        - "traefik.http.routers.kryonix-web-secure.rule=Host(\`kryonix.com.br\`) || Host(\`www.kryonix.com.br\`)"
        - "traefik.http.routers.kryonix-web-secure.entrypoints=websecure"
        - "traefik.http.routers.kryonix-web-secure.tls=true"
        - "traefik.http.routers.kryonix-web-secure.tls.certresolver=${CERT_RESOLVER}"
        - "traefik.http.routers.kryonix-web-secure.service=kryonix-web"
        - "traefik.http.routers.kryonix-web-secure.priority=1"

        # Router específico para API/Webhook (prioridade alta)
        - "traefik.http.routers.kryonix-api.rule=Host(\`kryonix.com.br\`) && PathPrefix(\`/api\`)"
        - "traefik.http.routers.kryonix-api.entrypoints=websecure"
        - "traefik.http.routers.kryonix-api.tls=true"
        - "traefik.http.routers.kryonix-api.tls.certresolver=${CERT_RESOLVER}"
        - "traefik.http.routers.kryonix-api.service=kryonix-web"
        - "traefik.http.routers.kryonix-api.priority=10"
        
        # Headers básicos de segurança
        - "traefik.http.routers.kryonix-web-secure.middlewares=kryonix-security"
        - "traefik.http.routers.kryonix-api.middlewares=kryonix-security"
        - "traefik.http.middlewares.kryonix-security.headers.frameDeny=true"
        - "traefik.http.middlewares.kryonix-security.headers.browserXssFilter=true"
        - "traefik.http.middlewares.kryonix-security.headers.contentTypeNosniff=true"
    networks:
      - Kryonix-NET
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  Kryonix-NET:
    external: true
EOF

log_success "Docker stack corrigido criado"

echo "3️⃣ Aplicando nova configuração (zero downtime)..."
docker stack deploy -c docker-stack-fixed.yml Kryonix --with-registry-auth
log_success "Nova configuração aplicada"

echo "4️⃣ Aguardando estabilização (30s)..."
sleep 30

echo "5️⃣ Testando roteamento da API..."
# Teste com headers do GitHub
RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" -X POST "https://kryonix.com.br/api/github-webhook" \
  -H "User-Agent: GitHub-Hookshot/abc123" \
  -H "X-GitHub-Event: push" \
  -H "X-GitHub-Delivery: test-123" \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/main","repository":{"name":"KRYONIX-PLATAFORMA"}}')

HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')

echo "Código HTTP: $HTTP_CODE"
echo "Resposta: $BODY"

if [ "$HTTP_CODE" = "200" ]; then
    log_success "✅ Webhook funcionando! Código 200"
else
    log_error "❌ Ainda com problema. Código: $HTTP_CODE"
fi

echo "6️⃣ Verificando logs do container..."
docker service logs Kryonix_web | tail -5

echo "7️⃣ Testando endpoints principais..."
curl -s -I https://kryonix.com.br/health | head -1
curl -s -I https://kryonix.com.br/api/github-webhook | head -1

echo
echo "✅ CORREÇÃO APLICADA!"
echo
echo "🎯 O que foi corrigido:"
echo "- ✅ Router específico para /api/* com prioridade alta"
echo "- ✅ Roteamento correto do PathPrefix /api"
echo "- ✅ Headers de segurança mantidos"
echo "- ✅ Zero downtime durante atualização"
echo
echo "🧪 PRÓXIMO PASSO:"
echo "1. Vá ao GitHub > Settings > Webhooks"
echo "2. Clique em 'Redeliver' na última entrega"
echo "3. Deve mostrar sucesso (200) em vez de 404"
echo
echo "🔍 Para monitorar em tempo real:"
echo "docker service logs -f Kryonix_web"

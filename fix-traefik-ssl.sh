#!/bin/bash
set -e

echo "🌐 KRYONIX - Correção Completa do Traefik para SSL/HTTPS"
echo "======================================================="

# Função para logs coloridos
log_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

log_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Variáveis principais
DOMAIN="kryonix.com.br"
WWW_DOMAIN="www.kryonix.com.br"
SERVER_IP="144.202.90.55"
TRAEFIK_DATA_DIR="/opt/kryonix/data/traefik"
TRAEFIK_CONFIG_DIR="/opt/kryonix/config/traefik"

log_info "🔍 Verificando configuração atual..."

# Verificar se já há stack Traefik rodando
if docker stack ls | grep -q traefik; then
    log_warning "Stack Traefik encontrado, removendo para recriar..."
    docker stack rm $(docker stack ls --format "{{.Name}}" | grep traefik) || true
    sleep 30
fi

# Criar diretórios necessários
log_info "📁 Criando estrutura de diretórios..."
sudo mkdir -p "$TRAEFIK_CONFIG_DIR"
sudo mkdir -p "$TRAEFIK_DATA_DIR"
sudo mkdir -p /opt/kryonix/logs/traefik
sudo chmod 755 "$TRAEFIK_CONFIG_DIR"
sudo chmod 755 "$TRAEFIK_DATA_DIR"

# Criar network externa se não existir
log_info "🌐 Configurando network traefik-public..."
if ! docker network ls | grep -q "traefik-public"; then
    docker network create -d overlay --attachable traefik-public
    log_success "Network traefik-public criada"
else
    log_info "Network traefik-public já existe"
fi

# Configuração principal do Traefik
log_info "⚙️ Criando configuração principal do Traefik..."
cat > "$TRAEFIK_CONFIG_DIR/traefik.yml" << 'EOF'
# Configuração Traefik v3 - KRYONIX
global:
  checkNewVersion: false
  sendAnonymousUsage: false

# API e Dashboard
api:
  dashboard: true
  debug: false
  insecure: false

# Entry Points
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
          permanent: true
  
  websecure:
    address: ":443"
    http:
      middlewares:
        - security-headers@file
        - compression@file
  
  traefik:
    address: ":8080"

# Providers
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    swarmMode: true
    watch: true
    network: traefik-public
  
  file:
    filename: /etc/traefik/dynamic.yml
    watch: true

# SSL Automático com Let's Encrypt
certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@kryonix.com.br
      storage: /data/acme.json
      httpChallenge:
        entryPoint: web
      # Configuração para staging (descomente para produção)
      # caServer: https://acme-v02.api.letsencrypt.org/directory
      caServer: https://acme-staging-v02.api.letsencrypt.org/directory

# Logs
log:
  level: INFO
  format: json
  filePath: /var/log/traefik/traefik.log

accessLog:
  filePath: /var/log/traefik/access.log
  format: json

# Métricas
metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
    addRoutersLabels: true
EOF

# Configuração dinâmica (middlewares)
log_info "🔧 Criando configuração dinâmica (middlewares)..."
cat > "$TRAEFIK_CONFIG_DIR/dynamic.yml" << 'EOF'
# Configuração dinâmica - Middlewares
http:
  middlewares:
    # Headers de segurança
    security-headers:
      headers:
        customResponseHeaders:
          X-Frame-Options: "SAMEORIGIN"
          X-Content-Type-Options: "nosniff"
          X-XSS-Protection: "1; mode=block"
          Strict-Transport-Security: "max-age=31536000; includeSubDomains"
          Referrer-Policy: "strict-origin-when-cross-origin"
        customRequestHeaders:
          X-Forwarded-Proto: "https"

    # Compressão
    compression:
      compress:
        excludedContentTypes:
          - "text/event-stream"
          - "application/grpc"

    # Rate limiting
    rate-limit:
      rateLimit:
        average: 100
        period: 1m
        burst: 200
        sourceCriterion:
          ipStrategy:
            depth: 1

    # CORS para API
    api-cors:
      headers:
        accessControlAllowMethods:
          - "GET"
          - "POST"
          - "PUT"
          - "DELETE"
          - "OPTIONS"
        accessControlAllowOriginList:
          - "https://www.kryonix.com.br"
          - "https://app.kryonix.com.br"
        accessControlAllowHeaders:
          - "Authorization"
          - "Content-Type"
          - "X-Requested-With"
        addVaryHeader: true

# TLS Configuration
tls:
  options:
    default:
      minVersion: "VersionTLS12"
      maxVersion: "VersionTLS13"
      cipherSuites:
        - "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
        - "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305"
        - "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
      curvePreferences:
        - "CurveP384"
        - "CurveP256"
      sniStrict: true
EOF

# Docker Compose para Traefik
log_info "🐳 Criando configuração Docker Stack para Traefik..."
cat > "$TRAEFIK_CONFIG_DIR/docker-stack.yml" << 'EOF'
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    deploy:
      mode: global
      placement:
        constraints:
          - node.role == manager
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 3
      resources:
        limits:
          memory: 512MB
        reservations:
          memory: 256MB
      labels:
        # Dashboard do Traefik
        - "traefik.enable=true"
        - "traefik.http.routers.traefik-dashboard.rule=Host(`traefik.kryonix.com.br`)"
        - "traefik.http.routers.traefik-dashboard.tls=true"
        - "traefik.http.routers.traefik-dashboard.tls.certresolver=letsencrypt"
        - "traefik.http.routers.traefik-dashboard.service=api@internal"
        - "traefik.http.services.traefik-dashboard.loadbalancer.server.port=8080"
        - "traefik.docker.network=traefik-public"
    ports:
      - "80:80"
      - "443:443"
      - "8090:8080"  # Dashboard na porta 8090 para não conflitar
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_data:/data
      - traefik_logs:/var/log/traefik
      - traefik_config:/etc/traefik:ro
    environment:
      - TRAEFIK_API_DASHBOARD=true
      - TRAEFIK_API_INSECURE=false
    networks:
      - traefik-public
    command:
      - --configFile=/etc/traefik/traefik.yml

volumes:
  traefik_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/kryonix/data/traefik
  
  traefik_logs:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/kryonix/logs/traefik
  
  traefik_config:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/kryonix/config/traefik

networks:
  traefik-public:
    external: true
EOF

# Atualizar configuração do serviço web KRYONIX
log_info "🔄 Atualizando configuração do serviço web KRYONIX..."
cat > /opt/kryonix-plataform/docker-stack-updated.yml << 'EOF'
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
        # Configuração Traefik para www.kryonix.com.br
        - "traefik.enable=true"
        - "traefik.docker.network=traefik-public"
        
        # Router HTTP (redirecionará para HTTPS)
        - "traefik.http.routers.kryonix-web-http.rule=Host(`kryonix.com.br`) || Host(`www.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-web-http.entrypoints=web"
        - "traefik.http.routers.kryonix-web-http.middlewares=https-redirect"
        
        # Router HTTPS
        - "traefik.http.routers.kryonix-web-https.rule=Host(`kryonix.com.br`) || Host(`www.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-web-https.entrypoints=websecure"
        - "traefik.http.routers.kryonix-web-https.tls=true"
        - "traefik.http.routers.kryonix-web-https.tls.certresolver=letsencrypt"
        - "traefik.http.routers.kryonix-web-https.middlewares=security-headers@file,compression@file"
        
        # Service
        - "traefik.http.services.kryonix-web.loadbalancer.server.port=8080"
        
        # Middleware para redirecionamento HTTPS
        - "traefik.http.middlewares.https-redirect.redirectscheme.scheme=https"
        - "traefik.http.middlewares.https-redirect.redirectscheme.permanent=true"
    ports:
      - "8080:8080"  # Mantém porta direta para debug
    networks:
      - traefik-public
    environment:
      - NODE_ENV=production
      - PORT=8080
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  webhook:
    image: node:18-bullseye-slim
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        max_attempts: 5
        delay: 30s
      labels:
        # Configuração Traefik para webhook
        - "traefik.enable=true"
        - "traefik.docker.network=traefik-public"
        - "traefik.http.routers.kryonix-webhook.rule=Host(`webhook.kryonix.com.br`)"
        - "traefik.http.routers.kryonix-webhook.entrypoints=websecure"
        - "traefik.http.routers.kryonix-webhook.tls=true"
        - "traefik.http.routers.kryonix-webhook.tls.certresolver=letsencrypt"
        - "traefik.http.services.kryonix-webhook.loadbalancer.server.port=8082"
    ports:
      - "8082:8082"  # Mantém porta direta para debug
    networks:
      - traefik-public
    environment:
      - WEBHOOK_PORT=8082
      - WEBHOOK_SECRET=Kr7$$n0x-V1t0r-2025-#Jwt$$3cr3t-P0w3rfu1-K3y-A9b2Cd8eF4g6H1j5K9m3N7p2Q5t8
      - PROJECT_DIR=/opt/kryonix-plataform
    working_dir: /opt/kryonix-plataform
    volumes:
      - /opt/kryonix-plataform:/opt/kryonix-plataform:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker:ro
      - /var/log:/var/log
    command: >
      sh -c "
        echo 'Installing dependencies for webhook...' &&
        apt-get update &&
        apt-get install -y curl git procps &&
        echo 'Starting webhook listener on port 8082...' &&
        if [ -f /opt/kryonix-plataform/webhook-listener.js ]; then
          node /opt/kryonix-plataform/webhook-listener.js
        else
          echo 'ERROR: webhook-listener.js not found!' &&
          sleep 3600
        fi
      "

networks:
  traefik-public:
    external: true
EOF

# Copiar arquivos de configuração para os volumes
log_info "📋 Copiando configurações para volumes..."
sudo cp "$TRAEFIK_CONFIG_DIR/traefik.yml" "$TRAEFIK_CONFIG_DIR/"
sudo cp "$TRAEFIK_CONFIG_DIR/dynamic.yml" "$TRAEFIK_CONFIG_DIR/"

# Criar arquivo acme.json com permissões corretas
log_info "🔐 Configurando arquivo de certificados SSL..."
sudo touch "$TRAEFIK_DATA_DIR/acme.json"
sudo chmod 600 "$TRAEFIK_DATA_DIR/acme.json"

# Deploy do Traefik
log_info "🚀 Fazendo deploy do Traefik..."
cd "$TRAEFIK_CONFIG_DIR"
docker stack deploy -c docker-stack.yml traefik

# Aguardar Traefik inicializar
log_info "⏳ Aguardando Traefik inicializar (60 segundos)..."
sleep 60

# Verificar se Traefik está rodando
if docker service ls | grep traefik_traefik | grep -q "1/1"; then
    log_success "✅ Traefik está rodando!"
else
    log_warning "⚠️ Traefik pode estar ainda inicializando..."
    log_info "📝 Logs do Traefik:"
    docker service logs traefik_traefik --tail 20 || true
fi

# Deploy atualizado do serviço KRYONIX
log_info "🔄 Atualizando deploy do serviço KRYONIX com configuração Traefik..."
cd /opt/kryonix-plataform
docker stack deploy -c docker-stack-updated.yml kryonix-platform

# Aguardar serviços
log_info "⏳ Aguardando serviços (90 segundos)..."
sleep 90

# Função para verificar domínio
verify_domain() {
    local domain=$1
    local protocol=$2
    
    echo "🌐 Verificando $protocol://$domain"
    
    if curl -k -I -m 10 "$protocol://$domain" 2>/dev/null | head -1; then
        log_success "✅ $domain responde via $protocol"
        return 0
    else
        log_warning "❌ $domain não responde via $protocol"
        return 1
    fi
}

# Verificações finais
log_info "🧪 Executando verificações finais..."

echo "📊 Status dos serviços:"
docker service ls | grep -E "(traefik|kryonix)"

echo ""
echo "🌐 Testando conectividade:"

# Teste HTTP direto (porta 8080)
verify_domain "$SERVER_IP:8080" "http"

# Teste HTTPS (através do Traefik)
verify_domain "$WWW_DOMAIN" "https"
verify_domain "$DOMAIN" "https"

# Verificar dashboard Traefik
if verify_domain "$SERVER_IP:8090" "http"; then
    log_info "📊 Dashboard Traefik disponível em: http://$SERVER_IP:8090"
fi

# Verificar logs do Traefik para SSL
log_info "📝 Últimos logs do Traefik (certificados SSL):"
docker service logs traefik_traefik --tail 10 | grep -i -E "(certificate|ssl|acme|letsencrypt)" || echo "Nenhum log de SSL encontrado"

# Instruções de DNS
echo ""
log_warning "⚠️ CONFIGURAÇÃO DNS NECESSÁRIA:"
echo "Para que https://www.kryonix.com.br funcione, configure no seu provedor DNS:"
echo ""
echo "Tipo: A"
echo "Nome: @"
echo "Valor: $SERVER_IP"
echo "TTL: 300"
echo ""
echo "Tipo: A" 
echo "Nome: www"
echo "Valor: $SERVER_IP"
echo "TTL: 300"
echo ""
echo "Tipo: A"
echo "Nome: traefik"
echo "Valor: $SERVER_IP"
echo "TTL: 300"
echo ""

# Instruções de teste
echo ""
log_info "🧪 TESTES PARA EXECUTAR APÓS CONFIGURAR DNS:"
echo ""
echo "1. Teste HTTP redirecionamento:"
echo "   curl -I http://www.kryonix.com.br"
echo ""
echo "2. Teste HTTPS:"
echo "   curl -I https://www.kryonix.com.br"
echo ""
echo "3. Verificar certificado SSL:"
echo "   echo | openssl s_client -servername www.kryonix.com.br -connect www.kryonix.com.br:443 2>/dev/null | openssl x509 -noout -dates"
echo ""
echo "4. Dashboard Traefik:"
echo "   https://traefik.kryonix.com.br"
echo ""

# Script de monitoramento
log_info "📝 Criando script de monitoramento SSL..."
cat > /opt/kryonix-plataform/monitor-ssl.sh << 'MONITOR_EOF'
#!/bin/bash
echo "🔍 KRYONIX SSL Monitor"
echo "======================"

# Verificar serviços
echo "📊 Status dos serviços:"
docker service ls | grep -E "(traefik|kryonix)"

echo ""
echo "🌐 Testes de conectividade:"

# Teste HTTP direto
if curl -f -m 5 http://144.202.90.55:8080/health 2>/dev/null; then
    echo "✅ HTTP direto (8080): OK"
else
    echo "❌ HTTP direto (8080): FALHA"
fi

# Teste HTTPS
if curl -f -m 5 https://www.kryonix.com.br/health 2>/dev/null; then
    echo "✅ HTTPS (www.kryonix.com.br): OK"
else
    echo "❌ HTTPS (www.kryonix.com.br): FALHA"
fi

# Verificar certificado
echo ""
echo "🔐 Informações do certificado SSL:"
echo | openssl s_client -servername www.kryonix.com.br -connect www.kryonix.com.br:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "Certificado não disponível"

echo ""
echo "📝 Logs recentes do Traefik:"
docker service logs traefik_traefik --tail 5 2>/dev/null || echo "Sem logs disponíveis"
MONITOR_EOF

chmod +x /opt/kryonix-plataform/monitor-ssl.sh

echo ""
log_success "✅ Configuração do Traefik concluída!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Configure o DNS como mostrado acima"
echo "2. Aguarde propagação DNS (5-30 minutos)"
echo "3. Execute: ./monitor-ssl.sh para verificar status"
echo "4. Teste https://www.kryonix.com.br"
echo ""
echo "🔧 Para debug:"
echo "- Logs Traefik: docker service logs traefik_traefik"
echo "- Status: docker service ls"
echo "- Dashboard: http://$SERVER_IP:8090"

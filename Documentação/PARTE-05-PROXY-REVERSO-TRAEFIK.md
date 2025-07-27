# 🌐 PARTE 05 - PROXY REVERSO TRAEFIK
*Agentes Responsáveis: DevOps + Arquiteto Software + Segurança*

## 🎯 **OBJETIVO**
Configurar Traefik como proxy reverso principal, gerenciando SSL automático, roteamento e load balancing para todos os 32 serviços KRYONIX.

## 🏗️ **ARQUITETURA PROXY (DevOps)**
```yaml
Traefik Setup:
  Version: 3.0+
  Dashboard: https://traefik.kryonix.com.br
  Config: Docker labels + file provider
  SSL: Let's Encrypt automático
  
Features:
  - Automatic SSL/TLS certificates
  - HTTP to HTTPS redirect
  - Load balancing
  - Health checks
  - Rate limiting
  - Circuit breaker
```

## 🔐 **CONFIGURAÇÃO SEGURANÇA**
```yaml
# traefik.yml
global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: true
  debug: false

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
      tls:
        options: default
      middlewares:
        - security-headers@file
        - rate-limit@file

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    watch: true
  
  file:
    filename: /etc/traefik/dynamic.yml
    watch: true

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@kryonix.com.br
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

log:
  level: INFO
  format: json
  filePath: /var/log/traefik.log

accessLog:
  filePath: /var/log/access.log
  format: json
```

## 🛡️ **MIDDLEWARES DE SEGURANÇA**
```yaml
# dynamic.yml
http:
  middlewares:
    security-headers:
      headers:
        accessControlAllowMethods:
          - GET
          - OPTIONS
          - PUT
          - POST
          - DELETE
        accessControlMaxAge: 100
        hostsProxyHeaders:
          - "X-Forwarded-Host"
        referrerPolicy: "same-origin"
        customRequestHeaders:
          X-Forwarded-Proto: "https"
        customResponseHeaders:
          X-Frame-Options: "DENY"
          X-Content-Type-Options: "nosniff"
          X-XSS-Protection: "1; mode=block"
          Strict-Transport-Security: "max-age=31536000; includeSubDomains"
          Content-Security-Policy: "default-src 'self'"

    rate-limit:
      rateLimit:
        burst: 100
        average: 50
        period: 1m
        sourceCriterion:
          ipStrategy:
            depth: 1

    auth-forward:
      forwardAuth:
        address: "http://keycloak.kryonix.com.br/auth/realms/KRYONIX-SAAS/protocol/openid_connect/userinfo"
        authResponseHeaders:
          - "X-Forwarded-User"
          - "X-Forwarded-Groups"

    compress:
      compress:
        excludedContentTypes:
          - "text/event-stream"
          - "application/grpc"

  services:
    # Health check service
    health-check:
      loadBalancer:
        servers:
          - url: "http://localhost:8080/health"
        healthCheck:
          path: "/health"
          interval: "30s"
          timeout: "5s"

  routers:
    # Aplicação principal
    app-kryonix:
      rule: "Host(`app.kryonix.com.br`)"
      service: kryonix-app
      tls:
        certResolver: letsencrypt
      middlewares:
        - security-headers
        - rate-limit
        - compress

    # API Gateway
    api-kryonix:
      rule: "Host(`api.kryonix.com.br`)"
      service: kryonix-api
      tls:
        certResolver: letsencrypt
      middlewares:
        - security-headers
        - rate-limit
        - compress
        - auth-forward

    # Admin panel
    admin-kryonix:
      rule: "Host(`admin.kryonix.com.br`)"
      service: kryonix-admin
      tls:
        certResolver: letsencrypt
      middlewares:
        - security-headers
        - rate-limit
        - auth-forward
```

## 🐳 **DOCKER LABELS PARA SERVIÇOS**
```yaml
# docker-compose.yml para aplicação principal
version: '3.8'
services:
  kryonix-app:
    image: kryonix/frontend:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kryonix-app.rule=Host(`app.kryonix.com.br`)"
      - "traefik.http.routers.kryonix-app.tls.certresolver=letsencrypt"
      - "traefik.http.services.kryonix-app.loadbalancer.server.port=3000"
      - "traefik.http.routers.kryonix-app.middlewares=security-headers,rate-limit,compress"
    networks:
      - traefik-network

  kryonix-api:
    image: kryonix/backend:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.kryonix-api.rule=Host(`api.kryonix.com.br`)"
      - "traefik.http.routers.kryonix-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.kryonix-api.loadbalancer.server.port=4000"
      - "traefik.http.routers.kryonix-api.middlewares=security-headers,rate-limit,auth-forward"
      - "traefik.http.services.kryonix-api.loadbalancer.healthcheck.path=/health"
      - "traefik.http.services.kryonix-api.loadbalancer.healthcheck.interval=30s"
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
```

## 📊 **MONITORAMENTO E METRICS**
```yaml
# Prometheus metrics
metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
    addRoutersLabels: true
```

## 🔧 **CONFIGURAÇÃO LOAD BALANCING**
```yaml
# Load balancer para alta disponibilidade
http:
  services:
    kryonix-app-ha:
      loadBalancer:
        sticky:
          cookie:
            name: "kryonix-sticky"
            secure: true
            httpOnly: true
        healthCheck:
          path: "/health"
          interval: "30s"
          timeout: "5s"
          retries: 3
        servers:
          - url: "http://app-1:3000"
          - url: "http://app-2:3000"
          - url: "http://app-3:3000"

    kryonix-api-ha:
      loadBalancer:
        healthCheck:
          path: "/api/health"
          interval: "10s"
          timeout: "3s"
        servers:
          - url: "http://api-1:4000"
          - url: "http://api-2:4000"
```

## 🚨 **CIRCUIT BREAKER**
```yaml
# Circuit breaker para resiliência
http:
  middlewares:
    circuit-breaker:
      circuitBreaker:
        expression: "NetworkErrorRatio() > 0.3 || ResponseCodeRatio(500, 600, 0, 600) > 0.3"
        checkPeriod: "10s"
        fallbackDuration: "30s"
        recoveryDuration: "30s"
```

## 📈 **LOGS E OBSERVABILIDADE**
```bash
# Configurar logging estruturado
mkdir -p /var/log/traefik
chown traefik:traefik /var/log/traefik

# Rotação de logs
cat > /etc/logrotate.d/traefik << EOF
/var/log/traefik/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    postrotate
        docker kill -s USR1 traefik
    endscript
}
EOF

# Métricas para Prometheus
curl -s http://traefik.kryonix.com.br:8080/metrics
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Verificar status Traefik
curl -I https://traefik.kryonix.com.br

# 2. Verificar certificados SSL
echo | openssl s_client -servername app.kryonix.com.br -connect app.kryonix.com.br:443 2>/dev/null | openssl x509 -noout -dates

# 3. Testar load balancing
for i in {1..10}; do curl -s https://api.kryonix.com.br/health; done

# 4. Verificar métricas
curl -s http://traefik.kryonix.com.br:8080/metrics | grep traefik_

# 5. Reload configuração
docker exec traefik kill -USR1 1
```

## 🛡️ **CONFIGURAÇÃO WAF (Web Application Firewall)**
```yaml
# WAF middleware customizado
http:
  middlewares:
    waf-protection:
      plugin:
        crowdsec-bouncer:
          crowdsecLapiUrl: "http://crowdsec:8080"
          crowdsecLapiKey: "${CROWDSEC_LAPI_KEY}"
          
    geo-block:
      ipWhiteList:
        sourceRange:
          - "127.0.0.1/32"
          - "189.0.0.0/8"  # Brasil
          - "200.0.0.0/8"  # Brasil
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Traefik dashboard acessível
- [ ] SSL automático funcionando para todos os domínios
- [ ] HTTP→HTTPS redirect ativo
- [ ] Rate limiting configurado
- [ ] Security headers aplicados
- [ ] Load balancing operacional
- [ ] Health checks ativos
- [ ] Circuit breaker configurado
- [ ] Logs estruturados funcionando
- [ ] Métricas Prometheus disponíveis

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de SSL
npm run test:traefik:ssl

# Teste de rate limiting
npm run test:traefik:ratelimit

# Teste de load balancing
npm run test:traefik:loadbalancer

# Teste de failover
npm run test:traefik:failover

# Teste de security headers
npm run test:traefik:security
```

## 📊 **DASHBOARD GRAFANA**
```json
{
  "dashboard": {
    "title": "Traefik Monitoring",
    "panels": [
      {
        "title": "Requests per Second",
        "targets": [
          {
            "expr": "rate(traefik_http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(traefik_http_request_duration_seconds_bucket[5m]))"
          }
        ]
      }
    ]
  }
}
```

---
*Parte 05 de 50 - Projeto KRYONIX SaaS Platform*
*Próxima Parte: 06 - Monitoramento Base (Grafana/Prometheus)*

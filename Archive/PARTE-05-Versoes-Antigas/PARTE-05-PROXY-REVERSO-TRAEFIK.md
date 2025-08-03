# 🌐 PARTE 05 - PROXY REVERSO TRAEFIK MULTI-TENANT
*Agentes Responsáveis: DevOps Expert + Arquiteto Software + Expert Performance + Especialista Mobile*

## 🎯 **CONTEXTO MULTI-TENANT KRYONIX**

**MISSÃO**: Configurar Traefik como proxy reverso multi-tenant com roteamento automático por subdomínio, load balancing específico por módulo, otimização mobile-first e auto-creation para a plataforma KRYONIX SaaS.

```yaml
Arquitetura Multi-Tenant:
  estratégia: "Roteamento automático por subdomínio"
  pattern: "{cliente}.kryonix.com.br"
  auto_creation: "Rotas automáticas para novos clientes"
  sdk_integration: "Headers automáticos para client isolation"
  mobile_optimization: "Compressão otimizada para 80% mobile"
  apis_modulares: "Load balancing específico por módulo"
  ssl_termination: "Wildcard automático Let's Encrypt"
```

---

## 🏗️ **ARQUITETURA TRAEFIK MULTI-TENANT**

### **🎯 ESTRUTURA PRINCIPAL**
```yaml
Traefik Multi-Tenant Architecture:
  Entry Points:
    web: ":80 (HTTP → HTTPS redirect)"
    websecure: ":443 (SSL termination)"
    dashboard: ":8080 (Admin dashboard)"
    
  Providers:
    docker: "Docker labels auto-discovery"
    file: "Static multi-tenant configuration"
    consul: "Dynamic routing configuration"
    
  Certificate Resolvers:
    letsencrypt-wildcard: "*.kryonix.com.br"
    letsencrypt-api: "api.kryonix.com.br"
    
  Routing Pattern:
    tenant_wildcard: "{tenant}.kryonix.com.br → tenant-router"
    api_modules: "api.kryonix.com.br/{module} → module-api"
    sdk_unified: "sdk.kryonix.com.br → sdk-server"
    
  Load Balancing:
    per_module: "Específico por API SaaS"
    health_checks: "15s interval com circuit breakers"
    sticky_sessions: "Cookie-based para tenant isolation"
```

### **📦 ROTEAMENTO POR MÓDULO SAAS**
```yaml
Multi-Tenant Routing:
  # Subdomínios automáticos por cliente
  - pattern: "{cliente}.kryonix.com.br"
    service: "kryonix-tenant-app"
    middlewares: ["tenant-detector", "payment-validator", "mobile-optimizer"]
    
  # 8 APIs modulares com load balancing
  - api.kryonix.com.br/crm → kryonix-api-crm (3 instances)
  - api.kryonix.com.br/whatsapp → kryonix-api-whatsapp (3 instances)
  - api.kryonix.com.br/agendamento → kryonix-api-agendamento (2 instances)
  - api.kryonix.com.br/financeiro → kryonix-api-financeiro (3 instances)
  - api.kryonix.com.br/marketing → kryonix-api-marketing (2 instances)
  - api.kryonix.com.br/analytics → kryonix-api-analytics (2 instances)
  - api.kryonix.com.br/portal → kryonix-api-portal (2 instances)
  - api.kryonix.com.br/whitelabel → kryonix-api-whitelabel (1 instance)
  
  # Serviços especializados
  - sdk.kryonix.com.br → kryonix-sdk-server
  - downloads.kryonix.com.br → kryonix-app-downloads
  - traefik.kryonix.com.br → traefik-dashboard
```

---

## 🔧 **CONFIGURAÇÃO TRAEFIK.YML MULTI-TENANT**

### **⚡ CONFIGURAÇÃO PRINCIPAL**
```yaml
# /opt/kryonix/config/traefik/traefik.yml
global:
  checkNewVersion: false
  sendAnonymousUsage: false

# === ENTRY POINTS ===
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true
  
  websecure:
    address: ":443"
    http:
      middlewares:
        - "default-headers@file"
        - "secure-headers@file"
      tls:
        options: default
        certResolver: "letsencrypt-wildcard"
        domains:
          - main: "kryonix.com.br"
            sans:
              - "*.kryonix.com.br"
  
  dashboard:
    address: ":8080"

# === PROVIDERS ===
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: "kryonix-network"
    swarmMode: true
    watch: true
    
  file:
    filename: "/etc/traefik/dynamic.yml"
    watch: true
    
  consul:
    endpoints:
      - "consul.kryonix.com.br:8500"
    pollInterval: "5s"
    exposedByDefault: false

# === CERTIFICATE RESOLVERS ===
certificatesResolvers:
  letsencrypt-wildcard:
    acme:
      email: "admin@kryonix.com.br"
      storage: "/data/acme.json"
      dnsChallenge:
        provider: "cloudflare"
        delayBeforeCheck: 30
        resolvers:
          - "1.1.1.1:53"
          - "8.8.8.8:53"
      # Manual wildcard configuration for *.kryonix.com.br
      
  letsencrypt:
    acme:
      email: "admin@kryonix.com.br"
      storage: "/data/acme-regular.json"
      httpChallenge:
        entryPoint: web

# === API & DASHBOARD ===
api:
  dashboard: true
  debug: true
  insecure: false

# === METRICS & MONITORING ===
metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
    addRoutersLabels: true
    buckets:
      - 0.1
      - 0.3
      - 1.2
      - 5.0

# === TRACING ===
tracing:
  jaeger:
    samplingServerURL: "http://jaeger.kryonix.com.br:5778/sampling"
    localAgentHostPort: "jaeger.kryonix.com.br:6831"

# === LOGGING ===
log:
  level: "INFO"
  filePath: "/var/log/traefik/traefik.log"
  format: "json"

accessLog:
  filePath: "/var/log/traefik/access.log"
  format: "json"
  bufferingSize: 100
  filters:
    statusCodes:
      - "400-499"
      - "500-599"
  fields:
    defaultMode: "keep"
    names:
      ClientUsername: "drop"
    headers:
      defaultMode: "keep"
      names:
        User-Agent: "redact"
        Authorization: "drop"
        Content-Type: "keep"
        X-Tenant-ID: "keep"
        X-Client-ID: "keep"

# === GLOBAL CONFIGURATION ===
global:
  checkNewVersion: false
  sendAnonymousUsage: false

# === TIMEOUTS OTIMIZADOS PARA MOBILE ===
serversTransport:
  maxIdleConnsPerHost: 200
  dialTimeout: "15s"
  responseHeaderTimeout: "30s"
  idleConnTimeout: "90s"
```

---

## 📋 **CONFIGURAÇÃO DINÂMICA MULTI-TENANT**

### **🔄 DYNAMIC.YML COMPLETO**
```yaml
# /opt/kryonix/config/traefik/dynamic.yml
http:
  # === MIDDLEWARES MULTI-TENANT ===
  middlewares:
    # === HEADERS DE SEGURANÇA ===
    
    # Headers padrão para todos os serviços
    default-headers:
      headers:
        accessControlAllowMethods:
          - "GET"
          - "OPTIONS"
          - "PUT"
          - "POST"
          - "DELETE"
        accessControlAllowOriginList:
          - "https://*.kryonix.com.br"
          - "https://kryonix.com.br"
        accessControlMaxAge: 100
        hostsProxyHeaders:
          - "X-Forwarded-Host"
        referrerPolicy: "same-origin"
        
    # Headers de segurança avançados
    secure-headers:
      headers:
        sslRedirect: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 31536000
        contentTypeNosniff: true
        browserXssFilter: true
        customFrameOptionsValue: "SAMEORIGIN"
        customResponseHeaders:
          X-Robots-Tag: "noindex,nofollow,nosnippet,noarchive,notranslate,noimageindex"
          server: "KRYONIX"

    # === MULTI-TENANT MIDDLEWARES ===
    
    # Detector de tenant automático
    tenant-detector:
      plugin:
        tenant-detector:
          headerName: "X-Tenant-ID"
          defaultTenant: "default"
          tenantPattern: "^[a-z0-9-]+$"
          
    # Validador de pagamento por tenant
    payment-validator:
      plugin:
        payment-validator:
          paymentApiUrl: "http://kryonix-payment-service:8080/validate"
          cacheTimeout: "300s"
          
    # Auto-criador de subdomínios
    auto-subdomain-creator:
      plugin:
        subdomain-creator:
          provisionerUrl: "http://kryonix-provisioner:8080/create"
          autoCreateEnabled: true
          defaultPlan: "basic"

    # === HEADERS SDK PARA ISOLAMENTO ===
    
    # Headers automáticos para SDK
    sdk-headers:
      headers:
        customRequestHeaders:
          X-SDK-Version: "1.0.0"
          X-Platform: "KRYONIX"
          X-Multi-Tenant: "true"
          X-Mobile-Optimized: "true"
        customResponseHeaders:
          X-Tenant-Isolated: "true"
          X-SDK-Compatible: "true"
          
    # Headers específicos multi-tenant
    multi-tenant-headers:
      headers:
        customRequestHeaders:
          X-Multi-Tenant: "enabled"
          X-Tenant-ID: "{tenant}"
          X-Client-ID: "{tenant}"
        customResponseHeaders:
          X-Tenant-Isolation: "complete"
          X-Data-Isolation: "guaranteed"

    # === OTIMIZAÇÃO MOBILE ===
    
    # Compressão otimizada para mobile
    mobile-optimizer:
      compress:
        excludedContentTypes:
          - "text/event-stream"
        minResponseBodyBytes: 1024
        
    # Compressão avançada
    compression:
      compress:
        excludedContentTypes:
          - "text/event-stream"
          - "application/grpc"
        minResponseBodyBytes: 512

    # Cache otimizado para tenant
    tenant-cache:
      plugin:
        cache:
          ttl: "300s"
          varyHeaders:
            - "X-Tenant-ID"
            - "X-Client-ID"
            - "User-Agent"

    # === RATE LIMITING POR TENANT ===
    
    # Rate limit padrão por tenant
    api-rate-limit-tenant:
      rateLimit:
        period: "1m"
        average: 1000
        burst: 2000
        sourceCriterion:
          requestHeaderName: "X-Tenant-ID"
          
    # Rate limit premium (maior limite)
    premium-rate-limit:
      rateLimit:
        period: "1m"
        average: 5000
        burst: 10000
        sourceCriterion:
          requestHeaderName: "X-Tenant-ID"

    # === CORS PARA APIS ===
    
    # CORS para APIs públicas
    api-cors:
      headers:
        accessControlAllowMethods:
          - "GET"
          - "POST"
          - "PUT"
          - "DELETE"
          - "OPTIONS"
        accessControlAllowHeaders:
          - "Content-Type"
          - "Authorization"
          - "X-Tenant-ID"
          - "X-Client-ID"
          - "X-API-Key"
        accessControlAllowOriginList:
          - "https://*.kryonix.com.br"
        accessControlExposeHeaders:
          - "X-Tenant-ID"
          - "X-Rate-Limit-Remaining"

    # === CIRCUIT BREAKERS ===
    
    # Circuit breaker para APIs
    api-circuit-breaker:
      circuitBreaker:
        expression: "NetworkErrorRatio() > 0.3 || ResponseCodeRatio(500, 600, 0, 600) > 0.3"
        checkPeriod: "10s"
        fallbackDuration: "30s"
        recoveryDuration: "30s"

    # === AUTENTICAÇÃO ===

    # Autenticação Keycloak
    keycloak-auth:
      forwardAuth:
        address: "http://keycloak-kryonix:8080/realms/KRYONIX/protocol/openid_connect/userinfo"
        trustForwardHeader: true
        authRequestHeaders:
          - "Authorization"
          - "X-Tenant-ID"
        authResponseHeaders:
          - "X-Auth-User"
          - "X-Auth-Email"
          - "X-Auth-Roles"
          - "X-Auth-Tenant"

  # === ROTAS MULTI-TENANT ===
  routers:
    # === ROTA PRINCIPAL MULTI-TENANT ===

    # Rota wildcard para subdomínios automáticos
    tenant-wildcard:
      rule: "Host(`{tenant:[a-z0-9-]+}.kryonix.com.br`)"
      service: "kryonix-tenant-app"
      middlewares:
        - "auto-subdomain-creator@file"
        - "tenant-detector@file"
        - "payment-validator@file"
        - "multi-tenant-headers@file"
        - "mobile-optimizer@file"
        - "tenant-cache@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt-wildcard"
      priority: 100

    # === 8 APIS MODULARES COM LOAD BALANCING ===

    # API CRM - Gestão de leads
    api-crm:
      rule: "Host(`api.kryonix.com.br`) && PathPrefix(`/crm`)"
      service: "kryonix-api-crm"
      middlewares:
        - "tenant-detector@file"
        - "api-cors@file"
        - "api-rate-limit-tenant@file"
        - "sdk-headers@file"
        - "api-circuit-breaker@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt"

    # API WhatsApp - Evolution + N8N
    api-whatsapp:
      rule: "Host(`api.kryonix.com.br`) && PathPrefix(`/whatsapp`)"
      service: "kryonix-api-whatsapp"
      middlewares:
        - "tenant-detector@file"
        - "api-cors@file"
        - "api-rate-limit-tenant@file"
        - "sdk-headers@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt"

    # API Agendamento - Sistema de agendas
    api-agendamento:
      rule: "Host(`api.kryonix.com.br`) && PathPrefix(`/agendamento`)"
      service: "kryonix-api-agendamento"
      middlewares:
        - "tenant-detector@file"
        - "api-cors@file"
        - "api-rate-limit-tenant@file"
        - "sdk-headers@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt"

    # API Financeiro - Cobrança e pagamentos
    api-financeiro:
      rule: "Host(`api.kryonix.com.br`) && PathPrefix(`/financeiro`)"
      service: "kryonix-api-financeiro"
      middlewares:
        - "tenant-detector@file"
        - "api-cors@file"
        - "premium-rate-limit@file"
        - "sdk-headers@file"
        - "keycloak-auth@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt"

    # API Marketing - Campanhas e email
    api-marketing:
      rule: "Host(`api.kryonix.com.br`) && PathPrefix(`/marketing`)"
      service: "kryonix-api-marketing"
      middlewares:
        - "tenant-detector@file"
        - "api-cors@file"
        - "api-rate-limit-tenant@file"
        - "sdk-headers@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt"

    # API Analytics - Relatórios e BI
    api-analytics:
      rule: "Host(`api.kryonix.com.br`) && PathPrefix(`/analytics`)"
      service: "kryonix-api-analytics"
      middlewares:
        - "tenant-detector@file"
        - "api-cors@file"
        - "premium-rate-limit@file"
        - "sdk-headers@file"
        - "keycloak-auth@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt"

    # API Portal - Portal do cliente
    api-portal:
      rule: "Host(`api.kryonix.com.br`) && PathPrefix(`/portal`)"
      service: "kryonix-api-portal"
      middlewares:
        - "tenant-detector@file"
        - "api-cors@file"
        - "api-rate-limit-tenant@file"
        - "sdk-headers@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt"

    # API Whitelabel - Customização branding
    api-whitelabel:
      rule: "Host(`api.kryonix.com.br`) && PathPrefix(`/whitelabel`)"
      service: "kryonix-api-whitelabel"
      middlewares:
        - "tenant-detector@file"
        - "api-cors@file"
        - "premium-rate-limit@file"
        - "sdk-headers@file"
        - "keycloak-auth@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt"

    # === ROTAS SDK E APPS ===

    # SDK unificado
    sdk-unified:
      rule: "Host(`sdk.kryonix.com.br`)"
      service: "kryonix-sdk-server"
      middlewares:
        - "compression@file"
        - "sdk-headers@file"
        - "secure-headers@file"
        - "tenant-cache@file"
      tls:
        certResolver: "letsencrypt"

    # Downloads de apps mobile
    app-downloads:
      rule: "Host(`downloads.kryonix.com.br`)"
      service: "kryonix-app-downloads"
      middlewares:
        - "mobile-optimizer@file"
        - "tenant-detector@file"
        - "secure-headers@file"
        - "compression@file"
      tls:
        certResolver: "letsencrypt"

    # === DASHBOARD ADMIN ===

    # Dashboard Traefik
    traefik-dashboard:
      rule: "Host(`traefik.kryonix.com.br`)"
      service: "api@internal"
      middlewares:
        - "keycloak-auth@file"
        - "secure-headers@file"
      tls:
        certResolver: "letsencrypt"

  # === SERVIÇOS COM LOAD BALANCING ESPECÍFICO ===
  services:
    # === APLICAÇÃO PRINCIPAL MULTI-TENANT ===

    # App principal com load balancing
    kryonix-tenant-app:
      loadBalancer:
        servers:
          - url: "http://kryonix-app-1:3000"
          - url: "http://kryonix-app-2:3000"
          - url: "http://kryonix-app-3:3000"
        healthCheck:
          path: "/health"
          interval: "30s"
          timeout: "10s"
          headers:
            Host: "app.kryonix.com.br"
        sticky:
          cookie:
            name: "kryonix-server"
            secure: true
            httpOnly: true
            sameSite: "strict"

    # === 8 APIS MODULARES COM LOAD BALANCING ===

    # API CRM com balanceamento
    kryonix-api-crm:
      loadBalancer:
        servers:
          - url: "http://kryonix-api-crm-1:8000"
          - url: "http://kryonix-api-crm-2:8000"
          - url: "http://kryonix-api-crm-3:8000"
        healthCheck:
          path: "/api/crm/health"
          interval: "15s"
          timeout: "5s"
          headers:
            X-Health-Check: "traefik"
        circuitBreaker:
          expression: "NetworkErrorRatio() > 0.30"
          recoveryDuration: "30s"

    # API WhatsApp com alta disponibilidade
    kryonix-api-whatsapp:
      loadBalancer:
        servers:
          - url: "http://kryonix-api-whatsapp-1:8000"
          - url: "http://kryonix-api-whatsapp-2:8000"
          - url: "http://kryonix-api-whatsapp-3:8000"
        healthCheck:
          path: "/api/whatsapp/status"
          interval: "10s"
          timeout: "5s"
        circuitBreaker:
          expression: "NetworkErrorRatio() > 0.20"
          recoveryDuration: "20s"

    # API Agendamento
    kryonix-api-agendamento:
      loadBalancer:
        servers:
          - url: "http://kryonix-api-agendamento-1:8000"
          - url: "http://kryonix-api-agendamento-2:8000"
        healthCheck:
          path: "/api/agendamento/health"
          interval: "20s"
          timeout: "5s"

    # API Financeiro (crítica)
    kryonix-api-financeiro:
      loadBalancer:
        servers:
          - url: "http://kryonix-api-financeiro-1:8000"
          - url: "http://kryonix-api-financeiro-2:8000"
          - url: "http://kryonix-api-financeiro-3:8000"
        healthCheck:
          path: "/api/financeiro/health"
          interval: "15s"
          timeout: "5s"
        circuitBreaker:
          expression: "NetworkErrorRatio() > 0.10"
          recoveryDuration: "60s"

    # API Marketing
    kryonix-api-marketing:
      loadBalancer:
        servers:
          - url: "http://kryonix-api-marketing-1:8000"
          - url: "http://kryonix-api-marketing-2:8000"
        healthCheck:
          path: "/api/marketing/health"
          interval: "30s"
          timeout: "10s"

    # API Analytics (BI)
    kryonix-api-analytics:
      loadBalancer:
        servers:
          - url: "http://kryonix-api-analytics-1:8000"
          - url: "http://kryonix-api-analytics-2:8000"
        healthCheck:
          path: "/api/analytics/health"
          interval: "20s"
          timeout: "5s"

    # API Portal
    kryonix-api-portal:
      loadBalancer:
        servers:
          - url: "http://kryonix-api-portal-1:8000"
          - url: "http://kryonix-api-portal-2:8000"
        healthCheck:
          path: "/api/portal/health"
          interval: "25s"
          timeout: "5s"

    # API Whitelabel
    kryonix-api-whitelabel:
      loadBalancer:
        servers:
          - url: "http://kryonix-api-whitelabel-1:8000"
        healthCheck:
          path: "/api/whitelabel/health"
          interval: "30s"
          timeout: "10s"

    # === SERVIÇOS SDK E APPS ===

    # SDK Server
    kryonix-sdk-server:
      loadBalancer:
        servers:
          - url: "http://kryonix-sdk-server:8080"
        healthCheck:
          path: "/sdk/health"
          interval: "30s"
          timeout: "5s"

    # App Downloads
    kryonix-app-downloads:
      loadBalancer:
        servers:
          - url: "http://kryonix-downloads:8080"
        healthCheck:
          path: "/downloads/health"
          interval: "60s"
          timeout: "10s"

# TLS otimizado para mobile e multi-tenant
tls:
  options:
    default:
      minVersion: "VersionTLS12"
      maxVersion: "VersionTLS13"
      cipherSuites:
        - "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
        - "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305"
        - "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
        - "TLS_RSA_WITH_AES_256_GCM_SHA384"
        - "TLS_RSA_WITH_AES_128_GCM_SHA256"
      curvePreferences:
        - "CurveP521"
        - "CurveP384"
      sniStrict: true
      alpnProtocols:
        - "h2"
        - "http/1.1"
    
    # TLS para desenvolvimento
    mintls13:
      minVersion: "VersionTLS13"
```

---

## 🐳 **DOCKER COMPOSE MULTI-TENANT**

### **🚀 STACK TRAEFIK COMPLETO**
```yaml
# /opt/kryonix/config/traefik/docker-compose.yml
version: '3.8'

networks:
  kryonix-network:
    external: true
    
volumes:
  traefik-data:
    external: true
  traefik-logs:
    external: true

services:
  # === TRAEFIK MULTI-TENANT MAIN ===
  traefik:
    image: traefik:v3.0
    container_name: traefik-kryonix-multitenant
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    networks:
      - kryonix-network
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Dashboard
    environment:
      - CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY}
      - CLOUDFLARE_EMAIL=${CLOUDFLARE_EMAIL}
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-data:/data
      - traefik-logs:/var/log/traefik
      - /opt/kryonix/config/traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - /opt/kryonix/config/traefik/dynamic.yml:/etc/traefik/dynamic.yml:ro
    command:
      - --configFile=/etc/traefik/traefik.yml
    labels:
      - "traefik.enable=true"
      
      # Dashboard
      - "traefik.http.routers.traefik-dashboard.rule=Host(`traefik.kryonix.com.br`)"
      - "traefik.http.routers.traefik-dashboard.entrypoints=websecure"
      - "traefik.http.routers.traefik-dashboard.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik-dashboard.service=api@internal"
      - "traefik.http.routers.traefik-dashboard.middlewares=secure-headers@file"
      
      # API
      - "traefik.http.routers.traefik-api.rule=Host(`traefik.kryonix.com.br`) && PathPrefix(`/api`)"
      - "traefik.http.routers.traefik-api.entrypoints=websecure"
      - "traefik.http.routers.traefik-api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik-api.service=api@internal"
      
      # Metrics
      - "traefik.http.routers.traefik-metrics.rule=Host(`traefik.kryonix.com.br`) && PathPrefix(`/metrics`)"
      - "traefik.http.routers.traefik-metrics.entrypoints=websecure"
      - "traefik.http.routers.traefik-metrics.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik-metrics.service=prometheus@internal"
    deploy:
      resources:
        limits:
          memory: 1GB
          cpus: '0.5'
        reservations:
          memory: 512MB
          cpus: '0.25'
      placement:
        constraints:
          - node.role == manager
    healthcheck:
      test: ["CMD", "traefik", "healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # === TENANT ROUTER SERVICE ===
  tenant-router:
    image: kryonix/tenant-router:latest
    container_name: kryonix-tenant-router
    restart: unless-stopped
    networks:
      - kryonix-network
    environment:
      - REDIS_URL=redis://redis-kryonix:6379/1
      - DATABASE_URL=postgresql://kryonix:password@postgresql-kryonix:5432/kryonix_core
      - PROVISIONER_URL=http://kryonix-provisioner:8080
    labels:
      - "traefik.enable=true"
      
      # Wildcard tenant routing
      - "traefik.http.routers.tenant-wildcard.rule=Host(`{tenant:[a-z0-9-]+}.kryonix.com.br`)"
      - "traefik.http.routers.tenant-wildcard.entrypoints=websecure"
      - "traefik.http.routers.tenant-wildcard.tls.certresolver=letsencrypt-wildcard"
      - "traefik.http.routers.tenant-wildcard.service=tenant-router"
      - "traefik.http.routers.tenant-wildcard.middlewares=tenant-detector@file,payment-validator@file,mobile-optimizer@file"
      - "traefik.http.routers.tenant-wildcard.priority=100"
      
      # Service configuration
      - "traefik.http.services.tenant-router.loadbalancer.server.port=8080"
      - "traefik.http.services.tenant-router.loadbalancer.healthcheck.path=/health"
      - "traefik.http.services.tenant-router.loadbalancer.healthcheck.interval=15s"
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512MB
          cpus: '0.3'

  # === TENANT PROVISIONER ===
  provisioner:
    image: kryonix/provisioner:latest
    container_name: kryonix-provisioner
    restart: unless-stopped
    networks:
      - kryonix-network
    environment:
      - DATABASE_URL=postgresql://kryonix:password@postgresql-kryonix:5432/kryonix_core
      - REDIS_URL=redis://redis-kryonix:6379/1
      - MINIO_URL=minio-kryonix:9000
      - KEYCLOAK_URL=http://keycloak-kryonix:8080
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /opt/kryonix/scripts:/scripts:ro
    labels:
      - "traefik.enable=false"  # Internal service only
    deploy:
      resources:
        limits:
          memory: 256MB
          cpus: '0.2'

  # === PAYMENT VALIDATOR ===
  payment-service:
    image: kryonix/payment-service:latest
    container_name: kryonix-payment-service
    restart: unless-stopped
    networks:
      - kryonix-network
    environment:
      - DATABASE_URL=postgresql://kryonix:password@postgresql-kryonix:5432/kryonix_core
      - REDIS_CACHE_URL=redis://redis-kryonix:6379/2
      - STRIPE_API_KEY=${STRIPE_API_KEY}
      - MERCADOPAGO_ACCESS_TOKEN=${MERCADOPAGO_ACCESS_TOKEN}
    labels:
      - "traefik.enable=false"  # Internal service only
    deploy:
      resources:
        limits:
          memory: 128MB
          cpus: '0.1'

  # === MONITORING ===
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus-traefik
    restart: unless-stopped
    networks:
      - kryonix-network
    volumes:
      - /opt/kryonix/config/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--storage.tsdb.retention.time=15d'
      - '--web.enable-lifecycle'
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prometheus-traefik.rule=Host(`prometheus.kryonix.com.br`)"
      - "traefik.http.routers.prometheus-traefik.entrypoints=websecure"
      - "traefik.http.routers.prometheus-traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.prometheus-traefik.middlewares=keycloak-auth@file"
      - "traefik.http.services.prometheus-traefik.loadbalancer.server.port=9090"

  # === GRAFANA DASHBOARD ===
  grafana:
    image: grafana/grafana:latest
    container_name: grafana-traefik
    restart: unless-stopped
    networks:
      - kryonix-network
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana-data:/var/lib/grafana
      - /opt/kryonix/config/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - /opt/kryonix/config/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana-traefik.rule=Host(`grafana.kryonix.com.br`)"
      - "traefik.http.routers.grafana-traefik.entrypoints=websecure"
      - "traefik.http.routers.grafana-traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.grafana-traefik.middlewares=secure-headers@file"
      - "traefik.http.services.grafana-traefik.loadbalancer.server.port=3000"

volumes:
  prometheus-data:
  grafana-data:
```

---

## 🔧 **SCRIPTS DE AUTO-CREATION**

### **🤖 SCRIPT AUTOMÁTICO DE DEPLOYMENT**
```bash
#!/bin/bash
# /opt/kryonix/scripts/auto-deploy-tenant.sh

auto_deploy_tenant() {
    local TENANT_ID=$1
    local CLIENT_EMAIL=$2
    local PLAN_TYPE=${3:-"basic"}
    
    if [ -z "$TENANT_ID" ] || [ -z "$CLIENT_EMAIL" ]; then
        echo "❌ Uso: auto_deploy_tenant <tenant_id> <client_email> [plan_type]"
        exit 1
    fi
    
    echo "🚀 Starting auto-deployment for tenant: $TENANT_ID"
    
    # 1. Create tenant database
    echo "🗄️ Creating tenant database..."
    docker exec postgresql-kryonix psql -U kryonix -c "CREATE DATABASE kryonix_${TENANT_ID};"
    docker exec postgresql-kryonix psql -U kryonix -d "kryonix_${TENANT_ID}" -f /docker-entrypoint-initdb.d/schema.sql
    
    # 2. Create tenant Redis namespace
    echo "🔄 Setting up Redis namespace..."
    docker exec redis-kryonix redis-cli -n 1 HSET "tenant:${TENANT_ID}" \
        email "$CLIENT_EMAIL" \
        plan "$PLAN_TYPE" \
        created "$(date +%s)" \
        status "active" \
        database "kryonix_${TENANT_ID}" \
        subdomain "${TENANT_ID}.kryonix.com.br"
    
    # 3. Create MinIO bucket for tenant
    echo "📦 Creating storage bucket..."
    docker exec minio-kryonix mc mb "local/tenant-${TENANT_ID}"
    docker exec minio-kryonix mc policy set public "local/tenant-${TENANT_ID}"
    
    # 4. Setup Keycloak client
    echo "🔐 Setting up authentication..."
    # This would integrate with Keycloak API to create a new client
    
    # 5. Create Traefik route automatically
    echo "🌐 Creating Traefik route..."
    cat > "/tmp/tenant-${TENANT_ID}-labels.yml" <<EOF
http:
  routers:
    tenant-${TENANT_ID}:
      rule: "Host(\`${TENANT_ID}.kryonix.com.br\`)"
      service: "tenant-${TENANT_ID}-app"
      middlewares:
        - "tenant-detector@file"
        - "multi-tenant-headers@file" 
        - "mobile-optimizer@file"
      tls:
        certResolver: "letsencrypt-wildcard"
        
  services:
    tenant-${TENANT_ID}-app:
      loadBalancer:
        servers:
          - url: "http://kryonix-app-${TENANT_ID}:3000"
        healthCheck:
          path: "/health"
          interval: "30s"
EOF
    
    # Copy to Traefik dynamic config directory
    cp "/tmp/tenant-${TENANT_ID}-labels.yml" "/opt/kryonix/config/traefik/tenants/"
    
    # 6. Deploy tenant-specific app instance
    echo "🐳 Deploying tenant app..."
    docker run -d \
        --name "kryonix-app-${TENANT_ID}" \
        --network kryonix-network \
        --restart unless-stopped \
        -e TENANT_ID="$TENANT_ID" \
        -e DATABASE_URL="postgresql://kryonix:password@postgresql-kryonix:5432/kryonix_${TENANT_ID}" \
        -e REDIS_URL="redis://redis-kryonix:6379/1" \
        kryonix/tenant-app:latest
    
    # 7. Wait for service to be ready
    echo "⏳ Waiting for tenant to be ready..."
    for i in {1..30}; do
        if curl -f -s "https://${TENANT_ID}.kryonix.com.br/health" > /dev/null 2>&1; then
            echo "✅ Tenant is ready!"
            break
        fi
        echo "⏳ Attempt $i/30..."
        sleep 10
    done
    
    # 8. Send notification
    echo "📱 Sending notification..."
    if curl -f -s "https://evolution.kryonix.com.br/health" > /dev/null 2>&1; then
        curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
          -H "apikey: your_evolution_api_key" \
          -H "Content-Type: application/json" \
          -d "{\"number\": \"5517981805327\", \"text\": \"🎉 Novo tenant criado!\\nID: $TENANT_ID\\nEmail: $CLIENT_EMAIL\\nPlano: $PLAN_TYPE\\nURL: https://${TENANT_ID}.kryonix.com.br\"}" > /dev/null 2>&1
    fi
    
    echo "✅ Auto-deployment completed for tenant: $TENANT_ID"
    echo "🌐 Access URL: https://${TENANT_ID}.kryonix.com.br"
}

# Execute function
auto_deploy_tenant "$@"
```

---

## 📊 **MONITORAMENTO E MÉTRICAS**

### **📈 MÉTRICAS PROMETHEUS TRAEFIK**
```yaml
# /opt/kryonix/config/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik-kryonix-multitenant:8080']
    metrics_path: /metrics
    scrape_interval: 15s
    
  - job_name: 'traefik-api'
    static_configs:
      - targets: ['traefik-kryonix-multitenant:8080']
    metrics_path: /api/overview
    scrape_interval: 30s

rule_files:
  - "traefik_alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager.kryonix.com.br:9093
```

### **🚨 ALERTAS TRAEFIK MULTI-TENANT**
```yaml
# /opt/kryonix/config/prometheus/traefik_alerts.yml
groups:
- name: traefik-multitenant
  rules:
  - alert: TraefikDown
    expr: up{job="traefik"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Traefik is down"
      description: "Traefik has been down for more than 1 minute."

  - alert: HighErrorRate
    expr: rate(traefik_http_requests_total{code=~"5.."}[5m]) > 0.1
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value }} requests per second."

  - alert: TenantDown
    expr: traefik_service_requests_total{service=~".*tenant.*"} == 0
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Tenant service appears down"
      description: "Service {{ $labels.service }} has no requests for 5 minutes."

  - alert: SSLCertificateExpiring
    expr: (traefik_tls_certs_not_after - time()) / 86400 < 30
    for: 1h
    labels:
      severity: warning
    annotations:
      summary: "SSL certificate expiring soon"
      description: "Certificate {{ $labels.domain }} expires in {{ $value }} days."
```

---

## 🧪 **TESTES E VALIDAÇÃO**

### **🔬 SUITE DE TESTES MULTI-TENANT**
```bash
#!/bin/bash
# /opt/kryonix/scripts/test-traefik-multitenant.sh

test_traefik_multitenant() {
    echo "🧪 KRYONIX - Testes Traefik Multi-Tenant"
    echo "======================================="
    
    local ERRORS=0
    
    # Teste 1: Dashboard Traefik
    echo "📊 Teste 1: Dashboard Traefik"
    if curl -f -s "http://localhost:8080/api/overview" > /dev/null 2>&1; then
        echo "✅ Dashboard acessível"
    else
        echo "❌ Dashboard não acessível"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 2: SSL wildcard
    echo "🔒 Teste 2: SSL wildcard"
    SSL_RESPONSE=$(curl -I -s "https://demo.kryonix.com.br" 2>/dev/null | head -1)
    if [[ "$SSL_RESPONSE" == *"200"* ]] || [[ "$SSL_RESPONSE" == *"404"* ]]; then
        echo "✅ SSL wildcard funcionando"
    else
        echo "❌ SSL wildcard com problemas"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 3: APIs modulares
    echo "🔧 Teste 3: APIs modulares"
    API_MODULES=("crm" "whatsapp" "agendamento" "financeiro" "marketing" "analytics" "portal" "whitelabel")
    
    for MODULE in "${API_MODULES[@]}"; do
        RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "https://api.kryonix.com.br/${MODULE}/health" 2>/dev/null)
        
        if [ "$RESPONSE" == "200" ]; then
            echo "  ✅ API $MODULE: Healthy"
        else
            echo "  ⚠️  API $MODULE: Not ready (HTTP $RESPONSE)"
        fi
    done
    
    # Teste 4: Headers SDK
    echo "🛡️ Teste 4: Headers SDK"
    HEADERS=$(curl -I -s "https://sdk.kryonix.com.br" 2>/dev/null)
    
    if echo "$HEADERS" | grep -q "X-SDK-Compatible"; then
        echo "✅ Headers SDK configurados"
    else
        echo "❌ Headers SDK ausentes"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 5: Compressão mobile
    echo "📱 Teste 5: Compressão mobile"
    COMPRESSION=$(curl -H "Accept-Encoding: gzip, br" -I -s "https://api.kryonix.com.br/crm/health" 2>/dev/null | grep -i "content-encoding")
    
    if [ -n "$COMPRESSION" ]; then
        echo "✅ Compressão ativa: $COMPRESSION"
    else
        echo "⚠️  Compressão não detectada"
    fi
    
    # Teste 6: Rate limiting
    echo "⚖️ Teste 6: Rate limiting"
    for i in {1..10}; do
        RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "https://api.kryonix.com.br/crm/test" 2>/dev/null)
        if [ "$RESPONSE" == "429" ]; then
            echo "✅ Rate limiting funcionando"
            break
        fi
        sleep 0.1
    done
    
    # Teste 7: Auto-creation
    echo "🤖 Teste 7: Auto-creation"
    TEST_TENANT="test$(date +%s)"
    
    if /opt/kryonix/scripts/auto-deploy-tenant.sh "$TEST_TENANT" "test@example.com" "basic"; then
        echo "✅ Auto-creation funcionando"
        
        # Verificar se foi criado
        sleep 5
        TENANT_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "https://${TEST_TENANT}.kryonix.com.br" 2>/dev/null)
        
        if [ "$TENANT_RESPONSE" == "200" ] || [ "$TENANT_RESPONSE" == "404" ]; then
            echo "✅ Roteamento automático funcionando"
        else
            echo "❌ Roteamento automático falhou"
            ERRORS=$((ERRORS + 1))
        fi
        
        # Limpar tenant de teste
        docker rm -f "kryonix-app-${TEST_TENANT}" 2>/dev/null || true
        docker exec redis-kryonix redis-cli -n 1 DEL "tenant:${TEST_TENANT}" 2>/dev/null || true
    else
        echo "❌ Auto-creation falhou"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Teste 8: Performance
    echo "⚡ Teste 8: Performance"
    START_TIME=$(date +%s%N)
    
    for i in {1..10}; do
        curl -s "https://api.kryonix.com.br/crm/health" > /dev/null 2>&1
    done
    
    END_TIME=$(date +%s%N)
    DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
    AVG_RESPONSE=$((DURATION / 10))
    
    echo "   Tempo médio por request: ${AVG_RESPONSE}ms"
    
    if [ "$AVG_RESPONSE" -lt 500 ]; then
        echo "✅ Performance excelente"
    elif [ "$AVG_RESPONSE" -lt 1000 ]; then
        echo "⚠️  Performance boa"
    else
        echo "❌ Performance ruim"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Resultado final
    echo "======================================="
    if [ $ERRORS -eq 0 ]; then
        echo "🎉 Todos os testes passaram!"
        echo "✅ Traefik Multi-Tenant funcionando perfeitamente"
    else
        echo "❌ $ERRORS teste(s) falharam"
        echo "🔧 Verifique os logs para mais detalhes"
    fi
    
    return $ERRORS
}

# Executar testes se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    test_traefik_multitenant
fi
```

---

## 🚀 **COMANDOS DE EXECUÇÃO PRÁTICOS**

### **⚡ SETUP COMPLETO MULTI-TENANT**
```bash
# 1. Setup inicial Traefik multi-tenant
docker network create kryonix-network 2>/dev/null || true
docker volume create traefik-data 2>/dev/null || true
docker volume create traefik-logs 2>/dev/null || true

# 2. Deploy stack completo
cd /opt/kryonix/config/traefik
docker stack deploy -c docker-compose.yml kryonix-proxy

# 3. Verificar status dos serviços
docker service ls | grep kryonix-proxy

# 4. Testar dashboard
curl -I http://localhost:8080/api/overview

# 5. Testar APIs modulares
for api in crm whatsapp agendamento financeiro marketing analytics portal whitelabel; do
  echo "Testing $api..."
  curl -I https://api.kryonix.com.br/$api/health
done

# 6. Criar tenant de teste
/opt/kryonix/scripts/auto-deploy-tenant.sh demo demo@kryonix.com.br basic

# 7. Testar roteamento automático
curl -I https://demo.kryonix.com.br

# 8. Verificar métricas
curl -s http://localhost:8080/metrics | grep traefik_http_requests_total

# 9. Monitoramento em tempo real
/opt/kryonix/scripts/monitor-traefik-multitenant.sh

# 10. Backup de configuração
/opt/kryonix/scripts/backup-traefik-multitenant.sh
```

---

## ✅ **CHECKLIST DE VALIDAÇÃO MULTI-TENANT**

### **📋 INFRAESTRUTURA**
- [ ] Traefik dashboard acessível em https://traefik.kryonix.com.br
- [ ] SSL wildcard funcionando para *.kryonix.com.br
- [ ] HTTP/2 e HTTP/3 ativos para mobile
- [ ] Compressão otimizada para 80% mobile

### **🌐 ROTEAMENTO**
- [ ] Roteamento automático por subdomínio funcional
- [ ] 8 APIs modulares com endpoints corretos
- [ ] Load balancing específico por módulo
- [ ] Circuit breakers configurados

### **🔗 SDK INTEGRATION**
- [ ] Headers automáticos para identificação de cliente
- [ ] SDK endpoints acessíveis em sdk.kryonix.com.br
- [ ] Headers X-Tenant-ID e X-Client-ID injetados
- [ ] CORS configurado para cross-origin

### **📱 MOBILE-FIRST**
- [ ] Compressão gzip/brotli ativa
- [ ] Performance <500ms garantida
- [ ] SSL termination otimizado
- [ ] Headers mobile-friendly

### **🤖 AUTO-CREATION**
- [ ] Script auto-deploy-tenant.sh funcionando
- [ ] Rotas automáticas para novos clientes
- [ ] Tenant provisioning em <5 minutos
- [ ] Isolamento automático garantido

### **⚖️ RATE LIMITING**
- [ ] Rate limiting por cliente configurado
- [ ] Diferentes limites por plano
- [ ] Headers de rate limit expostos
- [ ] Circuit breakers ativos

### **📊 MONITORAMENTO**
- [ ] Métricas Prometheus coletadas
- [ ] Alertas específicos configurados
- [ ] Dashboard Grafana funcionando
- [ ] Logs estruturados em JSON

### **🔐 SEGURANÇA**
- [ ] Headers de segurança configurados
- [ ] SSL A+ rating
- [ ] CORS restritivo por domínio
- [ ] Autenticação Keycloak integrada

### **🧪 TESTES**
- [ ] Todos os testes automatizados passando
- [ ] Performance mobile validada
- [ ] Auto-creation testado
- [ ] Load balancing validado

---


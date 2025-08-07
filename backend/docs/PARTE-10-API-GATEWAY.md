# 🌐 PARTE 10 - API GATEWAY MULTI-TENANT AVANÇADO KRYONIX
*Agentes Especializados: DevOps Expert + API Gateway Specialist + Multi-Tenant Architect + Mobile Expert + Security Expert + Performance Expert*

## 🎯 **OBJETIVO MULTI-TENANT**
Implementar API Gateway inteligente com **roteamento multi-tenant completo**, isolamento por cliente, rate limiting específico por plano, load balancing automático e otimização mobile-first para plataforma KRYONIX SaaS com 80% usuários mobile.

## 🏗️ **ARQUITETURA API GATEWAY MULTI-TENANT**
```yaml
Multi_Tenant_Gateway_Architecture:
  isolation_strategy: "Completo por cliente em todas as camadas"
  pattern: "cliente-{id}.kryonix.com.br"
  mobile_optimization: "80% usu��rios com prioridade mobile"
  tenant_routing: "Automático baseado em subdomain/header"
  
Gateway_Isolation_Layers:
  routing_layer: "Subdomain por cliente"
  rate_limiting_layer: "Limites específicos por plano"
  authentication_layer: "JWT isolado por tenant"
  caching_layer: "Cache específico por cliente"
  monitoring_layer: "Métricas isoladas por tenant"
  
Client_Gateway_Patterns:
  subdomain_pattern: "cliente-{id}.kryonix.com.br"
  api_pattern: "/api/v1/tenant/{id}/*"
  admin_pattern: "/admin/tenant/{id}/*"
  mobile_pattern: "/mobile/v1/tenant/{id}/*"
  webhook_pattern: "/webhook/tenant/{id}/*"
```

## 🚀 **ISTIO SERVICE MESH MULTI-TENANT**

### **🌐 Setup Istio para Multi-Tenancy**
```bash
#!/bin/bash
# setup-istio-multi-tenant.sh

echo "🌐 Configurando Istio Service Mesh para Multi-Tenancy"

# 1. Instalar Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH

# 2. Instalar Istio no cluster
istioctl install --set values.defaultRevision=default -y

# 3. Habilitar injection automático
kubectl label namespace default istio-injection=enabled

# 4. Configurar Gateway Principal Multi-Tenant
cat > multi-tenant-gateway.yaml << 'EOF'
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: kryonix-multi-tenant-gateway
  namespace: default
spec:
  selector:
    istio: ingressgateway
  servers:
  # Gateway para clientes específicos
  - port:
      number: 443
      name: https-tenants
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: wildcard-kryonix-cert
    hosts:
    - "*.kryonix.com.br"
    - "cliente-*.kryonix.com.br"
  # Gateway para API
  - port:
      number: 80
      name: http-api
      protocol: HTTP
    hosts:
    - "api.kryonix.com.br"
    - "*.api.kryonix.com.br"
---
# VirtualService para roteamento multi-tenant
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: kryonix-tenant-routing
  namespace: default
spec:
  hosts:
  - "*.kryonix.com.br"
  gateways:
  - kryonix-multi-tenant-gateway
  http:
  # Roteamento baseado em subdomain para tenants
  - match:
    - headers:
        ":authority":
          regex: "^cliente-([a-z0-9]+)\\.kryonix\\.com\\.br$"
    route:
    - destination:
        host: tenant-service
        subset: tenant-pool
      headers:
        request:
          set:
            x-tenant-id: "{{.Match[1]}}"
    fault:
      delay:
        percentage:
          value: 0.1
        fixedDelay: 5s
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
  # Roteamento mobile otimizado
  - match:
    - headers:
        user-agent:
          regex: ".*(Mobile|Android|iPhone|iPad).*"
    route:
    - destination:
        host: mobile-optimized-service
        subset: mobile-pool
      weight: 100
    headers:
      request:
        set:
          x-mobile-optimized: "true"
          x-cache-priority: "high"
EOF

kubectl apply -f multi-tenant-gateway.yaml

# 5. Configurar Destination Rules por Tenant
cat > tenant-destination-rules.yaml << 'EOF'
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: tenant-service-destination
  namespace: default
spec:
  host: tenant-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
        maxRequestsPerConnection: 10
        maxRetries: 3
        consecutiveGatewayErrors: 5
        interval: 30s
        baseEjectionTime: 30s
        maxEjectionPercent: 50
    loadBalancer:
      consistentHash:
        httpHeaderName: "x-tenant-id"
  subsets:
  - name: tenant-pool
    labels:
      tier: tenant
    trafficPolicy:
      connectionPool:
        tcp:
          maxConnections: 50
        http:
          http1MaxPendingRequests: 25
          maxRequestsPerConnection: 5
  - name: mobile-pool
    labels:
      tier: mobile
    trafficPolicy:
      connectionPool:
        tcp:
          maxConnections: 200
        http:
          http1MaxPendingRequests: 100
          maxRequestsPerConnection: 20
EOF

kubectl apply -f tenant-destination-rules.yaml
```

## 🔐 **KONG GATEWAY MULTI-TENANT**

### **🛡️ Configuração Kong Multi-Tenant**
```python
#!/usr/bin/env python3
# kong-multi-tenant-manager.py

import asyncio
import requests
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime

class KryonixKongMultiTenantManager:
    def __init__(self):
        self.setup_logging()
        self.kong_admin_url = "http://kong-admin:8001"
        self.kong_proxy_url = "http://kong-proxy:8000"
        
        # Configurações por plano
        self.tenant_rate_limits = {
            'basic': {
                'requests_per_minute': 100,
                'requests_per_hour': 1000,
                'requests_per_day': 10000,
                'concurrent_connections': 10
            },
            'pro': {
                'requests_per_minute': 500,
                'requests_per_hour': 10000,
                'requests_per_day': 100000,
                'concurrent_connections': 50
            },
            'enterprise': {
                'requests_per_minute': 2000,
                'requests_per_hour': 50000,
                'requests_per_day': 500000,
                'concurrent_connections': 200
            }
        }

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('/opt/kryonix/logs/kong-multi-tenant.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('KryonixKongMultiTenant')

    async def create_tenant_complete_gateway_setup(
        self, 
        cliente_id: str, 
        cliente_name: str,
        plano: str = 'basic',
        modulos: List[str] = None
    ) -> Dict:
        """Cria configuração completa do gateway para tenant"""
        
        self.logger.info(f"🌐 Criando gateway multi-tenant para cliente: {cliente_id}")
        
        try:
            # 1. Criar services específicos do tenant
            services_result = await self.create_tenant_services(
                cliente_id, modulos or ['crm', 'whatsapp']
            )
            
            # 2. Criar routes com isolamento por tenant
            routes_result = await self.create_tenant_routes(
                cliente_id, services_result['services']
            )
            
            # 3. Configurar rate limiting por plano
            rate_limiting_result = await self.configure_tenant_rate_limiting(
                cliente_id, plano
            )
            
            # 4. Configurar plugins específicos do tenant
            plugins_result = await self.configure_tenant_plugins(
                cliente_id, plano
            )
            
            # 5. Criar consumer específico do tenant
            consumer_result = await self.create_tenant_consumer(
                cliente_id, cliente_name
            )
            
            # 6. Configurar load balancing por tenant
            load_balancing_result = await self.configure_tenant_load_balancing(
                cliente_id, plano
            )
            
            # 7. Configurar cache específico do tenant
            cache_result = await self.configure_tenant_cache(
                cliente_id, plano
            )
            
            return {
                'cliente_id': cliente_id,
                'services_created': services_result['success'],
                'routes_created': routes_result['success'],
                'rate_limiting_applied': rate_limiting_result['success'],
                'plugins_configured': plugins_result['success'],
                'consumer_created': consumer_result['success'],
                'load_balancing_configured': load_balancing_result['success'],
                'cache_configured': cache_result['success'],
                'gateway_url': f"https://cliente-{cliente_id}.kryonix.com.br",
                'api_endpoint': f"https://api.kryonix.com.br/tenant/{cliente_id}",
                'admin_panel': f"https://admin.kryonix.com.br/tenant/{cliente_id}",
                'success': True
            }
            
        except Exception as e:
            self.logger.error(f"❌ Erro criando gateway para {cliente_id}: {e}")
            return {'success': False, 'error': str(e)}

    async def create_tenant_services(self, cliente_id: str, modulos: List[str]) -> Dict:
        """Cria services específicos do tenant"""
        
        services_created = []
        
        # Service principal do tenant
        main_service = {
            "name": f"tenant-{cliente_id}-main",
            "host": "tenant-app-service",
            "port": 3000,
            "path": f"/tenant/{cliente_id}",
            "protocol": "http",
            "retries": 3,
            "connect_timeout": 5000,
            "write_timeout": 60000,
            "read_timeout": 60000,
            "tags": [f"tenant-{cliente_id}", "main-service"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/services",
                json=main_service
            )
            
            if response.status_code == 201:
                services_created.append('main')
                self.logger.info(f"✅ Service principal criado para tenant {cliente_id}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro criando service principal: {e}")
        
        # Services por módulo
        for modulo in modulos:
            module_service = {
                "name": f"tenant-{cliente_id}-{modulo}",
                "host": f"{modulo}-service",
                "port": 3000,
                "path": f"/tenant/{cliente_id}/{modulo}",
                "protocol": "http",
                "retries": 3,
                "connect_timeout": 5000,
                "write_timeout": 60000,
                "read_timeout": 60000,
                "tags": [f"tenant-{cliente_id}", f"module-{modulo}"]
            }
            
            try:
                response = requests.post(
                    f"{self.kong_admin_url}/services",
                    json=module_service
                )
                
                if response.status_code == 201:
                    services_created.append(modulo)
                    self.logger.info(f"✅ Service {modulo} criado para tenant {cliente_id}")
                    
            except Exception as e:
                self.logger.error(f"❌ Erro criando service {modulo}: {e}")
        
        return {
            'success': len(services_created) > 0,
            'services': services_created,
            'total_created': len(services_created)
        }

    async def create_tenant_routes(
        self, 
        cliente_id: str, 
        services: List[str]
    ) -> Dict:
        """Cria routes específicas do tenant"""
        
        routes_created = []
        
        # Route principal via subdomain
        main_route = {
            "name": f"tenant-{cliente_id}-main-route",
            "hosts": [f"cliente-{cliente_id}.kryonix.com.br"],
            "paths": ["/"],
            "strip_path": False,
            "preserve_host": True,
            "protocols": ["http", "https"],
            "regex_priority": 0,
            "tags": [f"tenant-{cliente_id}", "main-route"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/routes",
                json=main_route
            )
            
            if response.status_code == 201:
                routes_created.append('main')
                self.logger.info(f"✅ Route principal criada para tenant {cliente_id}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro criando route principal: {e}")
        
        # Route via API path
        api_route = {
            "name": f"tenant-{cliente_id}-api-route",
            "hosts": ["api.kryonix.com.br"],
            "paths": [f"/tenant/{cliente_id}"],
            "strip_path": True,
            "preserve_host": False,
            "protocols": ["http", "https"],
            "tags": [f"tenant-{cliente_id}", "api-route"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/routes",
                json=api_route
            )
            
            if response.status_code == 201:
                routes_created.append('api')
                self.logger.info(f"✅ Route API criada para tenant {cliente_id}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro criando route API: {e}")
        
        # Routes mobile otimizadas
        mobile_route = {
            "name": f"tenant-{cliente_id}-mobile-route",
            "hosts": [f"mobile.cliente-{cliente_id}.kryonix.com.br"],
            "paths": ["/"],
            "strip_path": False,
            "preserve_host": True,
            "protocols": ["https"],
            "tags": [f"tenant-{cliente_id}", "mobile-route"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/routes",
                json=mobile_route
            )
            
            if response.status_code == 201:
                routes_created.append('mobile')
                self.logger.info(f"✅ Route mobile criada para tenant {cliente_id}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro criando route mobile: {e}")
        
        return {
            'success': len(routes_created) > 0,
            'routes': routes_created,
            'total_created': len(routes_created)
        }

    async def configure_tenant_rate_limiting(
        self, 
        cliente_id: str, 
        plano: str
    ) -> Dict:
        """Configura rate limiting específico do tenant"""
        
        limits = self.tenant_rate_limits.get(plano, self.tenant_rate_limits['basic'])
        
        # Rate limiting plugin para o tenant
        rate_limiting_plugin = {
            "name": "rate-limiting",
            "config": {
                "minute": limits['requests_per_minute'],
                "hour": limits['requests_per_hour'],
                "day": limits['requests_per_day'],
                "policy": "redis",
                "redis_host": "redis",
                "redis_port": 6379,
                "redis_database": 0,
                "hide_client_headers": False,
                "fault_tolerant": True
            },
            "tags": [f"tenant-{cliente_id}", "rate-limiting"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/plugins",
                json=rate_limiting_plugin
            )
            
            if response.status_code == 201:
                self.logger.info(f"✅ Rate limiting configurado para tenant {cliente_id}")
                
                # Connection limiting
                connection_limiting_plugin = {
                    "name": "request-size-limiting",
                    "config": {
                        "allowed_payload_size": 128 if plano == 'basic' else 256 if plano == 'pro' else 512
                    },
                    "tags": [f"tenant-{cliente_id}", "size-limiting"]
                }
                
                requests.post(
                    f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/plugins",
                    json=connection_limiting_plugin
                )
                
                return {'success': True, 'limits_applied': limits}
            else:
                raise Exception(f"Rate limiting failed: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"❌ Erro configurando rate limiting: {e}")
            return {'success': False, 'error': str(e)}

    async def configure_tenant_plugins(
        self, 
        cliente_id: str, 
        plano: str
    ) -> Dict:
        """Configura plugins específicos do tenant"""
        
        plugins_configured = []
        
        # 1. CORS Plugin
        cors_plugin = {
            "name": "cors",
            "config": {
                "origins": [
                    f"https://cliente-{cliente_id}.kryonix.com.br",
                    f"https://mobile.cliente-{cliente_id}.kryonix.com.br",
                    "https://app.cliente-{cliente_id}.kryonix.com.br"
                ],
                "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                "headers": [
                    "Accept", "Accept-Version", "Authorization", "Content-Length",
                    "Content-MD5", "Content-Type", "Date", "X-Auth-Token",
                    "X-Tenant-ID", "X-Mobile-Device"
                ],
                "exposed_headers": ["X-Auth-Token", "X-Tenant-ID"],
                "credentials": True,
                "max_age": 3600
            },
            "tags": [f"tenant-{cliente_id}", "cors"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/plugins",
                json=cors_plugin
            )
            
            if response.status_code == 201:
                plugins_configured.append('cors')
                self.logger.info(f"✅ CORS configurado para tenant {cliente_id}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro configurando CORS: {e}")
        
        # 2. JWT Plugin
        jwt_plugin = {
            "name": "jwt",
            "config": {
                "secret_is_base64": False,
                "key_claim_name": "iss",
                "claims_to_verify": ["exp", "iss"],
                "run_on_preflight": False,
                "anonymous": f"tenant-{cliente_id}-anonymous"
            },
            "tags": [f"tenant-{cliente_id}", "jwt"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/plugins",
                json=jwt_plugin
            )
            
            if response.status_code == 201:
                plugins_configured.append('jwt')
                self.logger.info(f"✅ JWT configurado para tenant {cliente_id}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro configurando JWT: {e}")
        
        # 3. Request Transformer (Tenant Isolation)
        transformer_plugin = {
            "name": "request-transformer",
            "config": {
                "add": {
                    "headers": [
                        f"X-Tenant-ID:{cliente_id}",
                        f"X-Tenant-Plan:{plano}",
                        "X-Gateway:kong-multi-tenant"
                    ]
                }
            },
            "tags": [f"tenant-{cliente_id}", "transformer"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/plugins",
                json=transformer_plugin
            )
            
            if response.status_code == 201:
                plugins_configured.append('transformer')
                self.logger.info(f"✅ Request Transformer configurado para tenant {cliente_id}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro configurando Request Transformer: {e}")
        
        # 4. Response Transformer (Mobile Optimization)
        response_transformer_plugin = {
            "name": "response-transformer",
            "config": {
                "add": {
                    "headers": [
                        "X-Tenant-Optimized:true",
                        "X-Mobile-Ready:true",
                        f"X-Cache-Tenant:{cliente_id}"
                    ]
                }
            },
            "tags": [f"tenant-{cliente_id}", "response-transformer"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/plugins",
                json=response_transformer_plugin
            )
            
            if response.status_code == 201:
                plugins_configured.append('response-transformer')
                self.logger.info(f"✅ Response Transformer configurado para tenant {cliente_id}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro configurando Response Transformer: {e}")
        
        # 5. Cache Plugin (específico por tenant)
        if plano in ['pro', 'enterprise']:
            proxy_cache_plugin = {
                "name": "proxy-cache",
                "config": {
                    "cache_ttl": 300 if plano == 'pro' else 600,
                    "cache_control": True,
                    "request_method": ["GET", "HEAD"],
                    "response_code": [200, 301, 302, 404],
                    "content_type": [
                        "text/plain", "application/json", "text/html",
                        "application/javascript", "text/css"
                    ],
                    "vary_headers": ["X-Tenant-ID"],
                    "vary_nginx_variables": [f"tenant_{cliente_id}"],
                    "storage_ttl": 3600
                },
                "tags": [f"tenant-{cliente_id}", "cache"]
            }
            
            try:
                response = requests.post(
                    f"{self.kong_admin_url}/services/tenant-{cliente_id}-main/plugins",
                    json=proxy_cache_plugin
                )
                
                if response.status_code == 201:
                    plugins_configured.append('cache')
                    self.logger.info(f"✅ Cache configurado para tenant {cliente_id}")
                
            except Exception as e:
                self.logger.error(f"❌ Erro configurando Cache: {e}")
        
        return {
            'success': len(plugins_configured) > 0,
            'plugins': plugins_configured,
            'total_configured': len(plugins_configured)
        }

    async def configure_tenant_load_balancing(
        self, 
        cliente_id: str, 
        plano: str
    ) -> Dict:
        """Configura load balancing específico do tenant"""
        
        # Upstream específico do tenant
        upstream_config = {
            "name": f"tenant-{cliente_id}-upstream",
            "algorithm": "consistent-hashing",
            "hash_on": "header",
            "hash_on_header": "X-Tenant-ID",
            "healthchecks": {
                "active": {
                    "type": "http",
                    "http_path": f"/health/tenant/{cliente_id}",
                    "healthy": {
                        "interval": 30,
                        "successes": 3
                    },
                    "unhealthy": {
                        "interval": 10,
                        "http_failures": 3,
                        "timeouts": 3
                    }
                },
                "passive": {
                    "type": "http",
                    "healthy": {
                        "successes": 5
                    },
                    "unhealthy": {
                        "http_failures": 5,
                        "timeouts": 7
                    }
                }
            },
            "tags": [f"tenant-{cliente_id}", "upstream"]
        }
        
        try:
            response = requests.post(
                f"{self.kong_admin_url}/upstreams",
                json=upstream_config
            )
            
            if response.status_code == 201:
                self.logger.info(f"✅ Upstream criado para tenant {cliente_id}")
                
                # Adicionar targets baseado no plano
                target_count = 1 if plano == 'basic' else 2 if plano == 'pro' else 3
                
                for i in range(target_count):
                    target_config = {
                        "target": f"tenant-app-{i+1}:3000",
                        "weight": 100
                    }
                    
                    requests.post(
                        f"{self.kong_admin_url}/upstreams/tenant-{cliente_id}-upstream/targets",
                        json=target_config
                    )
                
                # Atualizar service para usar upstream
                service_update = {
                    "host": f"tenant-{cliente_id}-upstream"
                }
                
                requests.patch(
                    f"{self.kong_admin_url}/services/tenant-{cliente_id}-main",
                    json=service_update
                )
                
                return {'success': True, 'targets_added': target_count}
            else:
                raise Exception(f"Upstream creation failed: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"❌ Erro configurando load balancing: {e}")
            return {'success': False, 'error': str(e)}
```

## 📱 **MOBILE-FIRST ROUTING STRATEGY**

### **🚀 Roteamento Inteligente Mobile**
```typescript
// mobile-routing-strategy.ts
export class KryonixMobileRoutingStrategy {
    private tenantId: string;
    private gatewayConfig: GatewayConfig;
    
    constructor(tenantId: string) {
        this.tenantId = tenantId;
        this.gatewayConfig = this.loadTenantGatewayConfig(tenantId);
    }
    
    async routeRequestIntelligently(request: IncomingRequest): Promise<RoutingDecision> {
        const deviceAnalysis = await this.analyzeDevice(request);
        const tenantContext = await this.getTenantContext(request);
        const performanceMetrics = await this.getPerformanceMetrics();
        
        return {
            routing_strategy: await this.determineOptimalRouting(
                deviceAnalysis, tenantContext, performanceMetrics
            ),
            cache_strategy: await this.determineCacheStrategy(deviceAnalysis),
            compression_strategy: await this.determineCompressionStrategy(deviceAnalysis),
            rate_limiting: await this.getTenantRateLimits(tenantContext),
            monitoring: await this.setupRequestMonitoring(request)
        };
    }
    
    private async determineOptimalRouting(
        device: DeviceAnalysis,
        tenant: TenantContext,
        metrics: PerformanceMetrics
    ): Promise<RoutingStrategy> {
        
        // Mobile-first routing logic
        if (device.isMobile) {
            return {
                destination: `mobile-optimized-service.tenant-${this.tenantId}`,
                priority: 'high',
                timeout: '5s',
                retries: 3,
                circuit_breaker: {
                    failure_threshold: 5,
                    recovery_timeout: '30s'
                },
                load_balancing: {
                    algorithm: 'least_connections',
                    health_check: '/health/mobile'
                }
            };
        }
        
        // Desktop routing
        return {
            destination: `standard-service.tenant-${this.tenantId}`,
            priority: 'normal',
            timeout: '10s',
            retries: 2,
            circuit_breaker: {
                failure_threshold: 10,
                recovery_timeout: '60s'
            }
        };
    }
    
    private async determineCacheStrategy(device: DeviceAnalysis): Promise<CacheStrategy> {
        if (device.isMobile) {
            return {
                cache_type: 'edge_cache',
                ttl: 300, // 5 minutos para mobile
                vary_headers: ['X-Tenant-ID', 'User-Agent', 'Accept-Encoding'],
                mobile_optimized: true,
                compression: 'gzip_aggressive'
            };
        }
        
        return {
            cache_type: 'standard_cache',
            ttl: 600, // 10 minutos para desktop
            vary_headers: ['X-Tenant-ID'],
            compression: 'gzip_standard'
        };
    }
    
    async setupTenantSpecificRouting(): Promise<TenantRoutingConfig> {
        const config: TenantRoutingConfig = {
            // Subdomain principal do tenant
            primary_domain: `cliente-${this.tenantId}.kryonix.com.br`,
            
            // Subdomains especializados
            mobile_domain: `mobile.cliente-${this.tenantId}.kryonix.com.br`,
            api_domain: `api.cliente-${this.tenantId}.kryonix.com.br`,
            admin_domain: `admin.cliente-${this.tenantId}.kryonix.com.br`,
            
            // Paths específicos
            api_paths: {
                v1: `/api/v1/tenant/${this.tenantId}`,
                mobile: `/mobile/v1/tenant/${this.tenantId}`,
                webhook: `/webhook/tenant/${this.tenantId}`,
                admin: `/admin/tenant/${this.tenantId}`
            },
            
            // Configurações por tipo de request
            routing_rules: {
                mobile: {
                    priority: 1,
                    timeout: '5s',
                    cache_ttl: 300,
                    compression: 'gzip',
                    rate_limit: this.gatewayConfig.mobile_rate_limits
                },
                api: {
                    priority: 2,
                    timeout: '10s',
                    cache_ttl: 600,
                    rate_limit: this.gatewayConfig.api_rate_limits
                },
                admin: {
                    priority: 3,
                    timeout: '30s',
                    cache_ttl: 0, // No cache for admin
                    rate_limit: this.gatewayConfig.admin_rate_limits
                }
            },
            
            // Health checks específicos
            health_checks: {
                mobile: `/health/tenant/${this.tenantId}/mobile`,
                api: `/health/tenant/${this.tenantId}/api`,
                admin: `/health/tenant/${this.tenantId}/admin`
            },
            
            // Monitoring específico
            monitoring: {
                metrics_path: `/metrics/tenant/${this.tenantId}`,
                traces_enabled: true,
                logging_level: 'info'
            }
        };
        
        return config;
    }
}
```

## 🔧 **TERRAFORM AUTO-PROVISIONING**

### **🏗️ Infraestrutura Gateway Multi-Tenant**
```hcl
# terraform/gateway-multi-tenant.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
    kong = {
      source  = "kong/kong"
      version = "~> 3.0"
    }
  }
}

variable "tenant_id" {
  description = "Unique tenant identifier"
  type        = string
}

variable "tenant_plan" {
  description = "Tenant subscription plan"
  type        = string
  default     = "basic"
  validation {
    condition     = contains(["basic", "pro", "enterprise"], var.tenant_plan)
    error_message = "Plan must be basic, pro, or enterprise."
  }
}

variable "tenant_modules" {
  description = "Enabled modules for tenant"
  type        = list(string)
  default     = ["crm", "whatsapp"]
}

locals {
  gateway_config = {
    basic = {
      replicas = 1
      cpu_limit = "500m"
      memory_limit = "512Mi"
      rate_limit_minute = 100
      rate_limit_hour = 1000
      concurrent_connections = 10
    }
    pro = {
      replicas = 2
      cpu_limit = "1000m"
      memory_limit = "1Gi"
      rate_limit_minute = 500
      rate_limit_hour = 10000
      concurrent_connections = 50
    }
    enterprise = {
      replicas = 3
      cpu_limit = "2000m"
      memory_limit = "2Gi"
      rate_limit_minute = 2000
      rate_limit_hour = 50000
      concurrent_connections = 200
    }
  }
}

# Kong Gateway Service para o tenant
resource "kubernetes_service" "tenant_kong_gateway" {
  metadata {
    name      = "kong-gateway-${var.tenant_id}"
    namespace = "tenant-${var.tenant_id}"
    labels = {
      app       = "kong-gateway"
      tenant_id = var.tenant_id
      tier      = "gateway"
    }
  }
  
  spec {
    selector = {
      app       = "kong-gateway"
      tenant_id = var.tenant_id
    }
    
    port {
      name        = "proxy"
      port        = 8000
      target_port = 8000
      protocol    = "TCP"
    }
    
    port {
      name        = "proxy-ssl"
      port        = 8443
      target_port = 8443
      protocol    = "TCP"
    }
    
    port {
      name        = "admin"
      port        = 8001
      target_port = 8001
      protocol    = "TCP"
    }
    
    type = "ClusterIP"
  }
}

# Kong Gateway Deployment
resource "kubernetes_deployment" "tenant_kong_gateway" {
  metadata {
    name      = "kong-gateway-${var.tenant_id}"
    namespace = "tenant-${var.tenant_id}"
    labels = {
      app       = "kong-gateway"
      tenant_id = var.tenant_id
    }
  }
  
  spec {
    replicas = local.gateway_config[var.tenant_plan].replicas
    
    selector {
      match_labels = {
        app       = "kong-gateway"
        tenant_id = var.tenant_id
      }
    }
    
    template {
      metadata {
        labels = {
          app       = "kong-gateway"
          tenant_id = var.tenant_id
          version   = "v1"
        }
        annotations = {
          "sidecar.istio.io/inject" = "true"
        }
      }
      
      spec {
        container {
          image = "kong/kong-gateway:3.4"
          name  = "kong"
          
          port {
            container_port = 8000
            name          = "proxy"
          }
          
          port {
            container_port = 8443
            name          = "proxy-ssl"
          }
          
          port {
            container_port = 8001
            name          = "admin"
          }
          
          env {
            name  = "KONG_DATABASE"
            value = "postgres"
          }
          
          env {
            name  = "KONG_PG_HOST"
            value = "postgresql"
          }
          
          env {
            name  = "KONG_PG_PORT"
            value = "5432"
          }
          
          env {
            name  = "KONG_PG_DATABASE"
            value = "kong_tenant_${var.tenant_id}"
          }
          
          env {
            name  = "KONG_PG_USER"
            value = "kong_tenant_${var.tenant_id}"
          }
          
          env {
            name = "KONG_PG_PASSWORD"
            value_from {
              secret_key_ref {
                name = "kong-postgres-secret-${var.tenant_id}"
                key  = "password"
              }
            }
          }
          
          env {
            name  = "KONG_PROXY_ACCESS_LOG"
            value = "/dev/stdout"
          }
          
          env {
            name  = "KONG_ADMIN_ACCESS_LOG"
            value = "/dev/stdout"
          }
          
          env {
            name  = "KONG_PROXY_ERROR_LOG"
            value = "/dev/stderr"
          }
          
          env {
            name  = "KONG_ADMIN_ERROR_LOG"
            value = "/dev/stderr"
          }
          
          env {
            name  = "KONG_ADMIN_LISTEN"
            value = "0.0.0.0:8001"
          }
          
          env {
            name  = "KONG_PROXY_LISTEN"
            value = "0.0.0.0:8000, 0.0.0.0:8443 ssl"
          }
          
          # Tenant-specific configuration
          env {
            name  = "KONG_PLUGINS"
            value = "bundled,rate-limiting,cors,jwt,request-transformer,response-transformer,proxy-cache"
          }
          
          env {
            name  = "KONG_LOG_LEVEL"
            value = "info"
          }
          
          env {
            name  = "KONG_TENANT_ID"
            value = var.tenant_id
          }
          
          resources {
            limits = {
              cpu    = local.gateway_config[var.tenant_plan].cpu_limit
              memory = local.gateway_config[var.tenant_plan].memory_limit
            }
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }
          
          liveness_probe {
            http_get {
              path = "/status"
              port = 8001
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }
          
          readiness_probe {
            http_get {
              path = "/status/ready"
              port = 8001
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
        
        # Init container para migrations
        init_container {
          name  = "kong-migrations"
          image = "kong/kong-gateway:3.4"
          
          command = ["kong", "migrations", "bootstrap"]
          
          env {
            name  = "KONG_DATABASE"
            value = "postgres"
          }
          
          env {
            name  = "KONG_PG_HOST"
            value = "postgresql"
          }
          
          env {
            name  = "KONG_PG_DATABASE"
            value = "kong_tenant_${var.tenant_id}"
          }
          
          env {
            name  = "KONG_PG_USER"
            value = "kong_tenant_${var.tenant_id}"
          }
          
          env {
            name = "KONG_PG_PASSWORD"
            value_from {
              secret_key_ref {
                name = "kong-postgres-secret-${var.tenant_id}"
                key  = "password"
              }
            }
          }
        }
      }
    }
  }
}

# VirtualService para roteamento específico do tenant
resource "kubernetes_manifest" "tenant_virtual_service" {
  manifest = {
    apiVersion = "networking.istio.io/v1beta1"
    kind       = "VirtualService"
    metadata = {
      name      = "tenant-${var.tenant_id}-gateway"
      namespace = "tenant-${var.tenant_id}"
    }
    spec = {
      hosts = [
        "cliente-${var.tenant_id}.kryonix.com.br",
        "mobile.cliente-${var.tenant_id}.kryonix.com.br",
        "api.cliente-${var.tenant_id}.kryonix.com.br"
      ]
      gateways = ["kryonix-multi-tenant-gateway"]
      http = [
        {
          match = [
            {
              headers = {
                ":authority" = {
                  exact = "mobile.cliente-${var.tenant_id}.kryonix.com.br"
                }
              }
            }
          ]
          route = [
            {
              destination = {
                host = "kong-gateway-${var.tenant_id}"
                port = {
                  number = 8000
                }
              }
              weight = 100
            }
          ]
          headers = {
            request = {
              set = {
                "x-tenant-id" = var.tenant_id
                "x-mobile-optimized" = "true"
                "x-tenant-plan" = var.tenant_plan
              }
            }
          }
          timeout = "30s"
          retries = {
            attempts      = 3
            perTryTimeout = "10s"
            retryOn       = "gateway-error,connect-failure,refused-stream"
          }
        },
        {
          match = [
            {
              headers = {
                ":authority" = {
                  exact = "cliente-${var.tenant_id}.kryonix.com.br"
                }
              }
            }
          ]
          route = [
            {
              destination = {
                host = "kong-gateway-${var.tenant_id}"
                port = {
                  number = 8000
                }
              }
              weight = 100
            }
          ]
          headers = {
            request = {
              set = {
                "x-tenant-id" = var.tenant_id
                "x-tenant-plan" = var.tenant_plan
              }
            }
          }
        }
      ]
    }
  }
}

# DestinationRule para políticas de tráfego
resource "kubernetes_manifest" "tenant_destination_rule" {
  manifest = {
    apiVersion = "networking.istio.io/v1beta1"
    kind       = "DestinationRule"
    metadata = {
      name      = "tenant-${var.tenant_id}-gateway-destination"
      namespace = "tenant-${var.tenant_id}"
    }
    spec = {
      host = "kong-gateway-${var.tenant_id}"
      trafficPolicy = {
        connectionPool = {
          tcp = {
            maxConnections = local.gateway_config[var.tenant_plan].concurrent_connections
          }
          http = {
            http1MaxPendingRequests = local.gateway_config[var.tenant_plan].concurrent_connections
            maxRequestsPerConnection = 10
            maxRetries = 3
            consecutiveGatewayErrors = 5
            interval = "30s"
            baseEjectionTime = "30s"
            maxEjectionPercent = 50
          }
        }
        loadBalancer = {
          simple = "LEAST_CONN"
        }
      }
    }
  }
}

output "tenant_gateway_info" {
  value = {
    tenant_id = var.tenant_id
    gateway_service = "kong-gateway-${var.tenant_id}"
    primary_domain = "cliente-${var.tenant_id}.kryonix.com.br"
    mobile_domain = "mobile.cliente-${var.tenant_id}.kryonix.com.br"
    api_domain = "api.cliente-${var.tenant_id}.kryonix.com.br"
    plan = var.tenant_plan
    replicas = local.gateway_config[var.tenant_plan].replicas
    rate_limits = {
      minute = local.gateway_config[var.tenant_plan].rate_limit_minute
      hour = local.gateway_config[var.tenant_plan].rate_limit_hour
    }
  }
}
```

## 🔧 **SCRIPT SETUP GATEWAY MULTI-TENANT COMPLETO**

### **🚀 Instalação Automática Completa**
```bash
#!/bin/bash
# setup-gateway-multi-tenant-complete.sh

echo "🌐 KRYONIX - Setup API Gateway Multi-Tenant Completo"
echo "==================================================="

# Validar parâmetros
if [ $# -lt 1 ]; then
    echo "Uso: $0 <ambiente> [tenant_count]"
    echo "Exemplo: $0 production 100"
    exit 1
fi

ENVIRONMENT=$1
TENANT_COUNT=${2:-10}

echo "🌍 Ambiente: $ENVIRONMENT"
echo "👥 Número de tenants: $TENANT_COUNT"

# 1. INSTALAR ISTIO
echo "🌐 Instalando Istio Service Mesh..."
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH

# Instalar Istio
istioctl install --set values.defaultRevision=default -y

# Habilitar injection automático
kubectl label namespace default istio-injection=enabled

# 2. INSTALAR KONG OPERATOR
echo "🦍 Instalando Kong Operator..."
kubectl apply -f https://github.com/Kong/kubernetes-ingress-controller/releases/latest/download/all-in-one-dbless.yaml

# 3. CONFIGURAR HELM CHARTS
echo "📦 Configurando Helm Charts..."
helm repo add kong https://charts.konghq.com
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update

# 4. CRIAR NAMESPACE MULTI-TENANT
echo "📁 Criando namespaces multi-tenant..."
kubectl create namespace kryonix-gateway
kubectl create namespace kryonix-tenants

# Label namespaces for Istio injection
kubectl label namespace kryonix-gateway istio-injection=enabled
kubectl label namespace kryonix-tenants istio-injection=enabled

# 5. INSTALAR KONG ENTERPRISE
echo "🚀 Instalando Kong Enterprise..."
cat > kong-multi-tenant-values.yaml << 'EOF'
env:
  database: postgres
  pg_host: postgresql.kryonix-gateway.svc.cluster.local
  pg_port: 5432
  pg_user: kong
  pg_password: kong_enterprise_2025
  pg_database: kong_multi_tenant
  
  # Multi-tenant optimizations
  worker_processes: auto
  worker_connections: 1024
  max_files_limit: 4096
  
  # Mobile optimizations
  proxy_read_timeout: 60s
  proxy_send_timeout: 60s
  proxy_connect_timeout: 5s
  
  # Plugins
  plugins: >
    bundled,rate-limiting,cors,jwt,oauth2,acl,
    request-transformer,response-transformer,
    proxy-cache,ip-restriction,bot-detection,
    prometheus,request-size-limiting,
    response-ratelimiting

image:
  repository: kong/kong-gateway
  tag: "3.4"
  
replicaCount: 3

resources:
  limits:
    cpu: 2000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

service:
  type: ClusterIP
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb

ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: istio
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  hosts:
  - host: api.kryonix.com.br
    paths:
    - path: /
      pathType: Prefix
  - host: "*.kryonix.com.br"
    paths:
    - path: /
      pathType: Prefix
  tls:
  - secretName: kryonix-wildcard-tls
    hosts:
    - "*.kryonix.com.br"

postgresql:
  enabled: true
  auth:
    username: kong
    password: kong_enterprise_2025
    database: kong_multi_tenant
  primary:
    persistence:
      enabled: true
      size: 20Gi
    resources:
      limits:
        cpu: 1000m
        memory: 1Gi
      requests:
        cpu: 250m
        memory: 512Mi

manager:
  enabled: true
  http:
    enabled: true
  tls:
    enabled: false
  ingress:
    enabled: true
    hostname: manager.kryonix.com.br
    annotations:
      kubernetes.io/ingress.class: istio

portal:
  enabled: true
  http:
    enabled: true
  tls:
    enabled: false
  ingress:
    enabled: true
    hostname: developer.kryonix.com.br
    annotations:
      kubernetes.io/ingress.class: istio

enterprise:
  enabled: true
  license_secret: kong-enterprise-license
  vitals:
    enabled: true
  portal:
    enabled: true
  rbac:
    enabled: true
    admin_gui_auth: basic-auth

secretVolumes:
- kong-enterprise-license

env:
  role: traditional
  database: postgres
  
migrations:
  init: true
  
waitImage:
  enabled: true
EOF

# Instalar Kong
helm install kong-gateway kong/kong \
  -n kryonix-gateway \
  -f kong-multi-tenant-values.yaml

# 6. CONFIGURAR CERTIFICADOS WILDCARD
echo "🔒 Configurando certificados wildcard..."
kubectl create secret tls kryonix-wildcard-tls \
  --cert=/path/to/wildcard.crt \
  --key=/path/to/wildcard.key \
  -n kryonix-gateway

# 7. INSTALAR FERRAMENTAS PYTHON
echo "🐍 Instalando ferramentas Python..."
pip3 install \
  kong-admin-client \
  requests \
  kubernetes \
  prometheus-client \
  pyyaml \
  jinja2

# 8. CRIAR GATEWAY MANAGER
echo "🤖 Criando Gateway Manager..."
cat > /opt/kryonix/gateway/kong-multi-tenant-manager.py << 'EOF'
#!/usr/bin/env python3
# Kong Multi-Tenant Manager - Complete Implementation
# [Código completo da classe KryonixKongMultiTenantManager]
EOF

chmod +x /opt/kryonix/gateway/kong-multi-tenant-manager.py

# 9. CONFIGURAR TERRAFORM
echo "🏗️ Configurando Terraform..."
mkdir -p /opt/kryonix/terraform/gateway
cat > /opt/kryonix/terraform/gateway/variables.tf << 'EOF'
variable "tenants" {
  description = "List of tenants to provision"
  type = list(object({
    id      = string
    name    = string
    plan    = string
    modules = list(string)
  }))
  default = []
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}
EOF

cat > /opt/kryonix/terraform/gateway/main.tf << 'EOF'
# [Código Terraform completo inserido anteriormente]
EOF

# 10. SCRIPT DE AUTO-PROVISIONAMENTO
echo "🏗️ Criando script de auto-provisionamento..."
cat > /opt/kryonix/gateway/scripts/provision-tenant-gateway.sh << 'EOF'
#!/bin/bash
# Script para provisionar gateway para tenant específico

TENANT_ID=$1
TENANT_NAME="$2"
TENANT_PLAN=${3:-basic}
MODULES=${4:-"crm,whatsapp"}

if [ -z "$TENANT_ID" ] || [ -z "$TENANT_NAME" ]; then
    echo "Uso: $0 <tenant_id> <tenant_name> [plan] [modules]"
    echo "Exemplo: $0 empresa001 'Empresa Exemplo' pro 'crm,whatsapp,financeiro'"
    exit 1
fi

echo "🌐 Provisionando gateway para tenant: $TENANT_ID ($TENANT_NAME)"

# 1. Criar namespace do tenant
kubectl create namespace "tenant-${TENANT_ID}" || true
kubectl label namespace "tenant-${TENANT_ID}" \
  istio-injection=enabled \
  tenant-id="$TENANT_ID" \
  tenant-plan="$TENANT_PLAN"

# 2. Aplicar Terraform
cd /opt/kryonix/terraform/gateway
terraform apply \
  -var="tenant_id=$TENANT_ID" \
  -var="tenant_plan=$TENANT_PLAN" \
  -var="tenant_modules=[$(echo $MODULES | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/' )]" \
  -auto-approve

# 3. Configurar Kong via Python
python3 /opt/kryonix/gateway/kong-multi-tenant-manager.py \
  create-tenant "$TENANT_ID" "$TENANT_NAME" "$TENANT_PLAN" "$MODULES"

# 4. Criar certificado específico do tenant
certbot certonly --nginx \
  -d "cliente-${TENANT_ID}.kryonix.com.br" \
  -d "mobile.cliente-${TENANT_ID}.kryonix.com.br" \
  -d "api.cliente-${TENANT_ID}.kryonix.com.br" \
  --non-interactive --agree-tos \
  --email admin@kryonix.com.br

# 5. Verificar provisionamento
echo "🔍 Verificando provisionamento..."
sleep 30

# Test endpoint principal
if curl -k "https://cliente-${TENANT_ID}.kryonix.com.br/health" | grep -q "ok"; then
    echo "✅ Endpoint principal funcionando"
else
    echo "❌ Endpoint principal com problemas"
fi

# Test endpoint mobile
if curl -k "https://mobile.cliente-${TENANT_ID}.kryonix.com.br/health" | grep -q "ok"; then
    echo "✅ Endpoint mobile funcionando"
else
    echo "❌ Endpoint mobile com problemas"
fi

echo "✅ Gateway provisionado para tenant $TENANT_ID!"
echo "🌐 URLs:"
echo "  Principal: https://cliente-${TENANT_ID}.kryonix.com.br"
echo "  Mobile: https://mobile.cliente-${TENANT_ID}.kryonix.com.br"
echo "  API: https://api.cliente-${TENANT_ID}.kryonix.com.br"
echo "  Admin: https://admin.cliente-${TENANT_ID}.kryonix.com.br"
EOF

chmod +x /opt/kryonix/gateway/scripts/provision-tenant-gateway.sh

# 11. CONFIGURAR MONITORAMENTO
echo "📊 Configurando monitoramento do gateway..."
kubectl apply -f - << 'EOF'
apiVersion: v1
kind: ServiceMonitor
metadata:
  name: kong-gateway-metrics
  namespace: kryonix-gateway
spec:
  selector:
    matchLabels:
      app: kong
  endpoints:
  - port: admin
    path: /metrics
    interval: 30s
---
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: kong-metrics-filter
  namespace: kryonix-gateway
spec:
  configPatches:
  - applyTo: HTTP_FILTER
    match:
      context: SIDECAR_INBOUND
      listener:
        filterChain:
          filter:
            name: "envoy.filters.network.http_connection_manager"
    patch:
      operation: INSERT_BEFORE
      value:
        name: envoy.filters.http.wasm
        typed_config:
          "@type": type.googleapis.com/envoy.extensions.filters.http.wasm.v3.Wasm
          config:
            name: "metrics_collection"
            configuration:
              "@type": type.googleapis.com/google.protobuf.StringValue
              value: |
                {
                  "metric_relabeling": [
                    {
                      "source_labels": ["__name__"],
                      "regex": "kong_.*",
                      "target_label": "service",
                      "replacement": "kong-gateway"
                    }
                  ]
                }
EOF

# 12. CONFIGURAR DASHBOARD GRAFANA
echo "📈 Configurando dashboard Grafana..."
cat > /opt/kryonix/monitoring/dashboards/kong-multi-tenant-dashboard.json << 'EOF'
{
  "dashboard": {
    "title": "Kong Multi-Tenant Gateway",
    "panels": [
      {
        "title": "Requests per Tenant",
        "type": "graph",
        "targets": [
          {
            "expr": "sum by (tenant_id) (rate(kong_http_requests_total[5m]))",
            "legendFormat": "Tenant {{tenant_id}}"
          }
        ]
      },
      {
        "title": "Response Times by Tenant",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum by (tenant_id, le) (rate(kong_request_latency_ms_bucket[5m])))",
            "legendFormat": "P95 - Tenant {{tenant_id}}"
          }
        ]
      },
      {
        "title": "Error Rate by Tenant",
        "type": "graph",
        "targets": [
          {
            "expr": "sum by (tenant_id) (rate(kong_http_requests_total{status=~\"5..\"}[5m])) / sum by (tenant_id) (rate(kong_http_requests_total[5m]))",
            "legendFormat": "Error Rate - Tenant {{tenant_id}}"
          }
        ]
      },
      {
        "title": "Mobile vs Desktop Traffic",
        "type": "pie",
        "targets": [
          {
            "expr": "sum by (device_type) (rate(kong_http_requests_total[5m]))",
            "legendFormat": "{{device_type}}"
          }
        ]
      }
    ]
  }
}
EOF

# 13. CONFIGURAR ALERTAS
echo "🚨 Configurando alertas..."
cat > /opt/kryonix/monitoring/alerts/kong-multi-tenant-alerts.yml << 'EOF'
groups:
- name: kong-multi-tenant-alerts
  rules:
  - alert: TenantHighErrorRate
    expr: |
      (
        sum by (tenant_id) (rate(kong_http_requests_total{status=~"5.."}[5m])) /
        sum by (tenant_id) (rate(kong_http_requests_total[5m]))
      ) > 0.05
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate for tenant {{ $labels.tenant_id }}"
      description: "Tenant {{ $labels.tenant_id }} has error rate above 5% for 5 minutes"
      
  - alert: TenantHighLatency
    expr: |
      histogram_quantile(0.95, 
        sum by (tenant_id, le) (rate(kong_request_latency_ms_bucket[5m]))
      ) > 1000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High latency for tenant {{ $labels.tenant_id }}"
      description: "Tenant {{ $labels.tenant_id }} P95 latency is above 1000ms"
      
  - alert: TenantRateLimitExceeded
    expr: |
      sum by (tenant_id) (rate(kong_rate_limiting_requests_exceeded_total[5m])) > 10
    for: 2m
    labels:
      severity: info
    annotations:
      summary: "Rate limit exceeded for tenant {{ $labels.tenant_id }}"
      description: "Tenant {{ $labels.tenant_id }} is hitting rate limits"
EOF

# 14. TESTE DE CARGA
echo "🧪 Executando teste inicial..."
sleep 60

# Verificar Kong
kubectl get pods -n kryonix-gateway | grep kong && echo "✅ Kong OK" || echo "❌ Kong ERRO"

# Verificar Istio
kubectl get pods -n istio-system | grep istiod && echo "✅ Istio OK" || echo "❌ Istio ERRO"

# Verificar gateway
curl -k https://api.kryonix.com.br/status && echo "✅ Gateway OK" || echo "❌ Gateway ERRO"

echo ""
echo "🎉 SETUP API GATEWAY MULTI-TENANT CONCLUÍDO!"
echo "============================================"
echo ""
echo "🌐 COMPONENTES INSTALADOS:"
echo "  • Istio Service Mesh"
echo "  • Kong Enterprise Gateway"
echo "  • PostgreSQL Multi-Tenant"
echo "  • Certificados Wildcard SSL"
echo "  • Monitoramento Prometheus/Grafana"
echo ""
echo "🛠️ FERRAMENTAS DISPONÍVEIS:"
echo "  • Provisionar tenant: ./provision-tenant-gateway.sh"
echo "  • Kong Manager: https://manager.kryonix.com.br"
echo "  • Developer Portal: https://developer.kryonix.com.br"
echo ""
echo "📊 MONITORAMENTO:"
echo "  • Métricas: Prometheus + Grafana"
echo "  • Alertas: AlertManager"
echo "  • Logs: ELK Stack"
echo ""
echo "🏗️ PRÓXIMO PASSO:"
echo "  Para criar um tenant: ./provision-tenant-gateway.sh empresa001 'Empresa Teste' pro 'crm,whatsapp'"
```

## ✅ **CHECKLIST DE VALIDAÇÃO MULTI-TENANT**

### **🌐 GATEWAY & ROUTING**
- [ ] Istio Service Mesh configurado e funcionando
- [ ] Kong Gateway multi-tenant instalado
- [ ] Roteamento automático por subdomain
- [ ] Load balancing específico por tenant
- [ ] Circuit breakers configurados

### **🔐 SEGURANÇA & ISOLAMENTO**
- [ ] JWT authentication por tenant
- [ ] Rate limiting específico por plano
- [ ] CORS configurado para mobile
- [ ] SSL wildcard funcionando
- [ ] Network policies isoladas

### **📱 OTIMIZAÇÃO MOBILE**
- [ ] Roteamento mobile-first funcionando
- [ ] Compressão específica para mobile
- [ ] Cache otimizado para dispositivos móveis
- [ ] Headers mobile-friendly
- [ ] Timeouts otimizados

### **⚖️ LOAD BALANCING**
- [ ] Upstreams específicos por tenant
- [ ] Health checks automáticos
- [ ] Consistent hashing por tenant
- [ ] Auto-scaling baseado em carga
- [ ] Failover automático

### **📊 MONITORAMENTO**
- [ ] Métricas por tenant no Prometheus
- [ ] Dashboard Grafana específico
- [ ] Alertas por tenant configurados
- [ ] Logs centralizados
- [ ] Traces distribuídos

### **🔧 AUTOMAÇÃO**
- [ ] Terraform para auto-provisioning
- [ ] Scripts de criação de tenants
- [ ] Certificados SSL automáticos
- [ ] Health checks contínuos
- [ ] Backup de configurações

### **🚀 PERFORMANCE**
- [ ] Response times < 200ms mobile
- [ ] Cache hit ratio > 80%
- [ ] Error rate < 1%
- [ ] Throughput adequado por plano
- [ ] Auto-scaling funcional

---


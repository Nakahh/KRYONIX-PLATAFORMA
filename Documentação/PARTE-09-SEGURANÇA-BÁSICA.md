# 🔒 PARTE 09 - SEGURANÇA MULTI-TENANT AVANÇADA KRYONIX
*Agentes Especializados: Security Expert + Infrastructure Security Expert + DevOps Expert + Mobile Expert + Compliance Expert + Multi-Tenant Architect*

## 🎯 **OBJETIVO MULTI-TENANT**
Implementar fortaleza de segurança multi-tenant com **isolamento completo por cliente**, autenticação biométrica mobile, compliance LGPD automático e detecção inteligente de ameaças para plataforma KRYONIX SaaS com 80% usuários mobile.

## 🏗️ **ARQUITETURA SEGURANÇA MULTI-TENANT AVANÇADA**
```yaml
Multi_Tenant_Security_Architecture:
  isolation_strategy: "Completo por cliente em todos os níveis"
  pattern: "cliente_{id}_security_realm"
  mobile_first: "80% usuários mobile com biometria"
  compliance: "LGPD automático por tenant"
  
Security_Isolation_Layers:
  authentication_layer: "Keycloak realms por cliente"
  authorization_layer: "RBAC específico por tenant"
  network_layer: "Firewall rules por cliente"
  data_layer: "Criptografia por tenant"
  audit_layer: "Logs isolados por cliente"
  
Client_Security_Patterns:
  realm_pattern: "kryonix-cliente-{id}"
  vault_path: "secret/cliente/{id}/*"
  network_policy: "tenant-{id}-security-policy"
  ssl_cert: "*.cliente-{id}.kryonix.com.br"
  firewall_zone: "cliente-{id}-dmz"
```

## 🔐 **KEYCLOAK MULTI-TENANT SECURITY**

### **👤 Autenticação Multi-Tenant com Biometria**
```python
#!/usr/bin/env python3
# keycloak-multi-tenant-security.py

import asyncio
import json
import requests
from typing import List, Dict, Optional
import logging
from datetime import datetime, timedelta

class KryonixMultiTenantKeycloakManager:
    def __init__(self):
        self.setup_logging()
        self.keycloak_url = "https://auth.kryonix.com.br"
        self.admin_realm = "master"
        self.admin_token = None
        
        # Configurações por plano
        self.security_policies_by_plan = {
            'basic': {
                'mfa_required': False,
                'biometric_enabled': True,
                'session_timeout': 8,  # horas
                'max_concurrent_sessions': 2,
                'password_expiry_days': 90
            },
            'pro': {
                'mfa_required': True,
                'biometric_enabled': True,
                'session_timeout': 12,
                'max_concurrent_sessions': 5,
                'password_expiry_days': 60
            },
            'enterprise': {
                'mfa_required': True,
                'biometric_enabled': True,
                'session_timeout': 24,
                'max_concurrent_sessions': 10,
                'password_expiry_days': 30
            }
        }

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('/opt/kryonix/logs/keycloak-multi-tenant.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('KryonixMultiTenantKeycloak')

    async def create_tenant_complete_security(
        self, 
        cliente_id: str, 
        cliente_name: str,
        plano: str = 'basic',
        modulos: List[str] = None
    ) -> Dict:
        """Cria infraestrutura completa de segurança multi-tenant"""
        
        self.logger.info(f"🔐 Criando segurança multi-tenant para cliente: {cliente_id}")
        
        try:
            # 1. Obter token admin
            admin_token = await self.get_admin_token()
            
            # 2. Criar realm específico do cliente
            realm_result = await self.create_tenant_realm(
                cliente_id, cliente_name, plano, admin_token
            )
            
            # 3. Configurar autenticação biométrica
            biometric_result = await self.configure_biometric_authentication(
                cliente_id, plano, admin_token
            )
            
            # 4. Criar clients para módulos
            clients_result = await self.create_tenant_clients(
                cliente_id, modulos or ['crm', 'whatsapp'], admin_token
            )
            
            # 5. Configurar roles e permissions
            roles_result = await self.setup_tenant_rbac(
                cliente_id, plano, modulos, admin_token
            )
            
            # 6. Configurar policies de segurança
            policies_result = await self.apply_security_policies(
                cliente_id, plano, admin_token
            )
            
            # 7. Configurar identity providers (SSO)
            sso_result = await self.configure_tenant_sso(
                cliente_id, admin_token
            )
            
            # 8. Setup audit logging
            audit_result = await self.setup_tenant_audit(
                cliente_id, admin_token
            )
            
            return {
                'cliente_id': cliente_id,
                'realm_created': realm_result['success'],
                'biometric_configured': biometric_result['success'],
                'clients_created': clients_result['success'],
                'rbac_configured': roles_result['success'],
                'policies_applied': policies_result['success'],
                'sso_configured': sso_result['success'],
                'audit_configured': audit_result['success'],
                'realm_url': f"{self.keycloak_url}/realms/kryonix-cliente-{cliente_id}",
                'admin_console': f"{self.keycloak_url}/admin/kryonix-cliente-{cliente_id}/console",
                'mobile_auth_url': f"{self.keycloak_url}/realms/kryonix-cliente-{cliente_id}/protocol/openid-connect/token",
                'success': True
            }
            
        except Exception as e:
            self.logger.error(f"❌ Erro criando segurança para {cliente_id}: {e}")
            return {'success': False, 'error': str(e)}

    async def create_tenant_realm(
        self, 
        cliente_id: str, 
        cliente_name: str, 
        plano: str,
        admin_token: str
    ) -> Dict:
        """Cria realm específico do tenant"""
        
        realm_name = f"kryonix-cliente-{cliente_id}"
        security_config = self.security_policies_by_plan[plano]
        
        realm_config = {
            "realm": realm_name,
            "enabled": True,
            "displayName": f"KRYONIX - {cliente_name}",
            "displayNameHtml": f"<strong>KRYONIX</strong> - {cliente_name}",
            
            # Configurações multi-tenant
            "attributes": {
                "tenant_id": cliente_id,
                "tenant_name": cliente_name,
                "tenant_plan": plano,
                "mobile_optimized": "true",
                "biometric_enabled": str(security_config['biometric_enabled']).lower(),
                "created_at": datetime.now().isoformat()
            },
            
            # Segurança por plano
            "bruteForceProtected": True,
            "maxFailureWaitSeconds": 900,
            "maxDeltaTimeSeconds": 43200,
            "failureFactor": 30,
            "waitIncrementSeconds": 60,
            "quickLoginCheckMilliSeconds": 1000,
            "minimumQuickLoginWaitSeconds": 60,
            "maxQuickLoginWaitSeconds": 900,
            
            # Mobile-first settings
            "accessTokenLifespan": security_config['session_timeout'] * 3600,
            "accessTokenLifespanForImplicitFlow": 900,
            "ssoSessionIdleTimeout": security_config['session_timeout'] * 3600,
            "ssoSessionMaxLifespan": security_config['session_timeout'] * 3600,
            "offlineSessionIdleTimeout": 30 * 24 * 3600,  # 30 dias
            
            # Password policy
            "passwordPolicy": f"length(12) and digits(1) and lowerCase(1) and upperCase(1) and specialChars(1) and notUsername and notEmail and passwordHistory(5) and forceExpiredPasswordChange({security_config['password_expiry_days']})",
            
            # Email settings
            "loginWithEmailAllowed": True,
            "duplicateEmailsAllowed": False,
            "verifyEmail": True,
            "resetPasswordAllowed": True,
            
            # Eventos
            "eventsEnabled": True,
            "eventsExpiration": 2592000,  # 30 dias
            "eventsListeners": ["jboss-logging", "audit-listener"],
            "enabledEventTypes": [
                "LOGIN", "LOGIN_ERROR", "LOGOUT", "REGISTER", 
                "UPDATE_PASSWORD", "UPDATE_PROFILE", "SEND_VERIFY_EMAIL"
            ],
            
            # Admin events
            "adminEventsEnabled": True,
            "adminEventsDetailsEnabled": True,
            
            # Internationalization
            "internationalizationEnabled": True,
            "supportedLocales": ["pt-BR", "en"],
            "defaultLocale": "pt-BR"
        }
        
        try:
            response = requests.post(
                f"{self.keycloak_url}/admin/realms",
                headers={
                    "Authorization": f"Bearer {admin_token}",
                    "Content-Type": "application/json"
                },
                json=realm_config
            )
            
            if response.status_code == 201:
                self.logger.info(f"✅ Realm {realm_name} criado com sucesso")
                return {'success': True, 'realm_name': realm_name}
            else:
                raise Exception(f"Erro criando realm: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"❌ Erro criando realm {realm_name}: {e}")
            return {'success': False, 'error': str(e)}

    async def configure_biometric_authentication(
        self, 
        cliente_id: str, 
        plano: str,
        admin_token: str
    ) -> Dict:
        """Configura autenticação biométrica mobile para o tenant"""
        
        realm_name = f"kryonix-cliente-{cliente_id}"
        
        # Configurar authentication flow para biometria
        biometric_flow = {
            "alias": "mobile-biometric-flow",
            "description": "Mobile biometric authentication flow for KRYONIX",
            "topLevel": True,
            "builtIn": False,
            "authenticationExecutions": [
                {
                    "authenticator": "cookie",
                    "authenticatorFlow": False,
                    "requirement": "ALTERNATIVE",
                    "priority": 10,
                    "userSetupAllowed": False
                },
                {
                    "authenticator": "kerberos",
                    "authenticatorFlow": False,
                    "requirement": "DISABLED",
                    "priority": 20,
                    "userSetupAllowed": False
                },
                {
                    "authenticator": "identity-provider-redirector",
                    "authenticatorFlow": False,
                    "requirement": "ALTERNATIVE",
                    "priority": 25,
                    "userSetupAllowed": False
                },
                {
                    "flowAlias": "mobile-biometric-forms",
                    "authenticatorFlow": True,
                    "requirement": "ALTERNATIVE",
                    "priority": 30,
                    "userSetupAllowed": False
                }
            ]
        }
        
        try:
            # Criar authentication flow
            flow_response = requests.post(
                f"{self.keycloak_url}/admin/realms/{realm_name}/authentication/flows",
                headers={
                    "Authorization": f"Bearer {admin_token}",
                    "Content-Type": "application/json"
                },
                json=biometric_flow
            )
            
            if flow_response.status_code == 201:
                self.logger.info(f"✅ Authentication flow biométrico criado para {cliente_id}")
                
                # Configurar como default para mobile clients
                await self.set_default_mobile_flow(realm_name, admin_token)
                
                return {'success': True, 'flow_alias': 'mobile-biometric-flow'}
            else:
                raise Exception(f"Erro criando flow: {flow_response.status_code} - {flow_response.text}")
                
        except Exception as e:
            self.logger.error(f"❌ Erro configurando biometria para {cliente_id}: {e}")
            return {'success': False, 'error': str(e)}

    async def create_tenant_clients(
        self, 
        cliente_id: str, 
        modulos: List[str],
        admin_token: str
    ) -> Dict:
        """Cria clients específicos por módulo do tenant"""
        
        realm_name = f"kryonix-cliente-{cliente_id}"
        clients_created = []
        
        # Client principal mobile
        mobile_client = {
            "clientId": f"kryonix-mobile-{cliente_id}",
            "name": f"KRYONIX Mobile - Cliente {cliente_id}",
            "description": f"Aplicação mobile para cliente {cliente_id}",
            "enabled": True,
            "clientAuthenticatorType": "client-secret",
            "redirectUris": [
                f"https://cliente-{cliente_id}.kryonix.com.br/*",
                "kryonix://auth/callback",
                "http://localhost:3000/*"  # desenvolvimento
            ],
            "webOrigins": [
                f"https://cliente-{cliente_id}.kryonix.com.br",
                "http://localhost:3000"
            ],
            "protocol": "openid-connect",
            "publicClient": False,
            "bearerOnly": False,
            "standardFlowEnabled": True,
            "implicitFlowEnabled": False,
            "directAccessGrantsEnabled": True,
            "serviceAccountsEnabled": True,
            
            # Mobile-specific attributes
            "attributes": {
                "tenant_id": cliente_id,
                "mobile_optimized": "true",
                "biometric_enabled": "true",
                "pkce.code.challenge.method": "S256",
                "access.token.lifespan": "3600",
                "client.session.idle.timeout": "1800",
                "client.session.max.lifespan": "28800"
            }
        }
        
        # Criar client mobile
        try:
            client_response = requests.post(
                f"{self.keycloak_url}/admin/realms/{realm_name}/clients",
                headers={
                    "Authorization": f"Bearer {admin_token}",
                    "Content-Type": "application/json"
                },
                json=mobile_client
            )
            
            if client_response.status_code == 201:
                clients_created.append('mobile')
                self.logger.info(f"✅ Client mobile criado para {cliente_id}")
            
        except Exception as e:
            self.logger.error(f"❌ Erro criando client mobile: {e}")
        
        # Criar clients por módulo
        for modulo in modulos:
            module_client = {
                "clientId": f"kryonix-{modulo}-{cliente_id}",
                "name": f"KRYONIX {modulo.upper()} - Cliente {cliente_id}",
                "enabled": True,
                "bearerOnly": True,  # API client
                "serviceAccountsEnabled": True,
                "attributes": {
                    "tenant_id": cliente_id,
                    "module": modulo
                }
            }
            
            try:
                module_response = requests.post(
                    f"{self.keycloak_url}/admin/realms/{realm_name}/clients",
                    headers={
                        "Authorization": f"Bearer {admin_token}",
                        "Content-Type": "application/json"
                    },
                    json=module_client
                )
                
                if module_response.status_code == 201:
                    clients_created.append(modulo)
                    self.logger.info(f"✅ Client {modulo} criado para {cliente_id}")
                    
            except Exception as e:
                self.logger.error(f"❌ Erro criando client {modulo}: {e}")
        
        return {
            'success': len(clients_created) > 0,
            'clients_created': clients_created,
            'total_created': len(clients_created)
        }

    async def setup_tenant_rbac(
        self, 
        cliente_id: str, 
        plano: str, 
        modulos: List[str],
        admin_token: str
    ) -> Dict:
        """Configura RBAC específico do tenant"""
        
        realm_name = f"kryonix-cliente-{cliente_id}"
        
        # Roles hierárquicos por tenant
        tenant_roles = [
            {
                "name": f"tenant-{cliente_id}-admin",
                "description": f"Administrador do tenant {cliente_id}",
                "composite": True,
                "attributes": {
                    "tenant_id": [cliente_id],
                    "access_level": ["full"],
                    "modules": modulos
                }
            },
            {
                "name": f"tenant-{cliente_id}-manager",
                "description": f"Gerente do tenant {cliente_id}",
                "composite": True,
                "attributes": {
                    "tenant_id": [cliente_id],
                    "access_level": ["manage"],
                    "modules": modulos[:len(modulos)//2]  # Acesso limitado
                }
            },
            {
                "name": f"tenant-{cliente_id}-user",
                "description": f"Usuário do tenant {cliente_id}",
                "composite": False,
                "attributes": {
                    "tenant_id": [cliente_id],
                    "access_level": ["read"],
                    "modules": ["crm"]  # Acesso básico
                }
            }
        ]
        
        roles_created = []
        
        for role in tenant_roles:
            try:
                role_response = requests.post(
                    f"{self.keycloak_url}/admin/realms/{realm_name}/roles",
                    headers={
                        "Authorization": f"Bearer {admin_token}",
                        "Content-Type": "application/json"
                    },
                    json=role
                )
                
                if role_response.status_code == 201:
                    roles_created.append(role['name'])
                    self.logger.info(f"✅ Role {role['name']} criado")
                    
            except Exception as e:
                self.logger.error(f"❌ Erro criando role {role['name']}: {e}")
        
        return {
            'success': len(roles_created) > 0,
            'roles_created': roles_created,
            'total_created': len(roles_created)
        }

class KryonixMultiTenantVaultManager:
    """Gerenciamento Vault específico por tenant"""
    
    def __init__(self):
        self.vault_url = "https://vault.kryonix.com.br"
        self.vault_token = None
        
    async def create_tenant_vault_infrastructure(
        self, 
        cliente_id: str, 
        plano: str
    ) -> Dict:
        """Cria infraestrutura Vault específica do tenant"""
        
        try:
            # 1. Criar path específico do tenant
            tenant_path = f"secret/cliente/{cliente_id}"
            
            # 2. Criar policy específica do tenant
            tenant_policy = f"""
# Policy para tenant {cliente_id}
path "{tenant_path}/*" {{
  capabilities = ["create", "read", "update", "delete", "list"]
}}

path "{tenant_path}/modules/*" {{
  capabilities = ["create", "read", "update", "delete", "list"]
}}

# Deny access to other tenants
path "secret/cliente/*" {{
  capabilities = ["deny"]
}}
"""
            
            # 3. Aplicar policy
            policy_result = await self.create_vault_policy(
                f"tenant-{cliente_id}-policy", tenant_policy
            )
            
            # 4. Criar secrets iniciais do tenant
            secrets_result = await self.create_initial_tenant_secrets(
                cliente_id, plano
            )
            
            # 5. Configurar auth method específico
            auth_result = await self.configure_tenant_auth(cliente_id)
            
            return {
                'success': True,
                'tenant_path': tenant_path,
                'policy_created': policy_result['success'],
                'secrets_created': secrets_result['success'],
                'auth_configured': auth_result['success']
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def create_initial_tenant_secrets(
        self, 
        cliente_id: str, 
        plano: str
    ) -> Dict:
        """Cria secrets iniciais do tenant"""
        
        import secrets
        import string
        
        # Gerar secrets únicos por tenant
        alphabet = string.ascii_letters + string.digits
        
        tenant_secrets = {
            f"secret/cliente/{cliente_id}/database": {
                "host": "postgresql.kryonix.com.br",
                "database": f"kryonix_cliente_{cliente_id}",
                "username": f"cliente_{cliente_id}",
                "password": ''.join(secrets.choice(alphabet) for _ in range(32)),
                "port": "5432",
                "ssl_mode": "require"
            },
            f"secret/cliente/{cliente_id}/redis": {
                "host": "redis.kryonix.com.br",
                "namespace": f"cliente:{cliente_id}",
                "password": ''.join(secrets.choice(alphabet) for _ in range(24)),
                "port": "6379",
                "database": str(int(cliente_id) % 16)  # 0-15 databases
            },
            f"secret/cliente/{cliente_id}/minio": {
                "endpoint": "minio.kryonix.com.br",
                "access_key": f"cliente_{cliente_id}",
                "secret_key": ''.join(secrets.choice(alphabet) for _ in range(40)),
                "bucket": f"cliente-{cliente_id}-storage",
                "region": "us-east-1"
            },
            f"secret/cliente/{cliente_id}/api": {
                "jwt_secret": ''.join(secrets.choice(alphabet) for _ in range(64)),
                "api_key": f"kx_{cliente_id}_{''.join(secrets.choice(alphabet) for _ in range(32))}",
                "webhook_secret": ''.join(secrets.choice(alphabet) for _ in range(32))
            },
            f"secret/cliente/{cliente_id}/integrations": {
                "evolution_api_key": f"evo_{cliente_id}_{''.join(secrets.choice(alphabet) for _ in range(24))}",
                "whatsapp_token": ''.join(secrets.choice(alphabet) for _ in range(32)),
                "email_api_key": ''.join(secrets.choice(alphabet) for _ in range(32))
            }
        }
        
        secrets_created = []
        
        for path, secret_data in tenant_secrets.items():
            try:
                # Criar secret no Vault
                create_result = await self.create_vault_secret(path, secret_data)
                if create_result['success']:
                    secrets_created.append(path)
                    
            except Exception as e:
                self.logger.error(f"❌ Erro criando secret {path}: {e}")
        
        return {
            'success': len(secrets_created) > 0,
            'secrets_created': secrets_created,
            'total_created': len(secrets_created)
        }
```

## 🛡️ **FIREWALL MULTI-TENANT AVANÇADO**

### **🔥 UFW Multi-Tenant com Isolamento**
```bash
#!/bin/bash
# firewall-multi-tenant-setup.sh

setup_tenant_firewall_isolation() {
    local CLIENT_ID=$1
    local CLIENT_PLAN=$2
    local ALLOWED_MODULES="$3"
    
    echo "🔥 Configurando firewall isolado para cliente: $CLIENT_ID"
    
    # Rate limiting específico por cliente baseado no plano
    case "$CLIENT_PLAN" in
        "basic")
            RATE_LIMIT="100/minute"
            BURST_LIMIT="200"
            ;;
        "pro")
            RATE_LIMIT="500/minute"
            BURST_LIMIT="1000"
            ;;
        "enterprise")
            RATE_LIMIT="2000/minute"
            BURST_LIMIT="5000"
            ;;
        *)
            RATE_LIMIT="50/minute"
            BURST_LIMIT="100"
            ;;
    esac
    
    # Criar iptables rules específicas por cliente
    iptables -N "KRYONIX_CLIENT_${CLIENT_ID}"
    
    # Rate limiting por cliente
    iptables -A "KRYONIX_CLIENT_${CLIENT_ID}" \
        -m hashlimit \
        --hashlimit-upto "$RATE_LIMIT" \
        --hashlimit-burst "$BURST_LIMIT" \
        --hashlimit-mode srcip \
        --hashlimit-name "client_${CLIENT_ID}_limit" \
        -j ACCEPT
    
    # Drop excess traffic
    iptables -A "KRYONIX_CLIENT_${CLIENT_ID}" -j DROP
    
    # Aplicar regras específicas por subdomínio do cliente
    iptables -t mangle -A PREROUTING \
        -d $(dig +short "cliente-${CLIENT_ID}.kryonix.com.br") \
        -j "KRYONIX_CLIENT_${CLIENT_ID}"
    
    echo "✅ Firewall isolado configurado para cliente $CLIENT_ID"
}

configure_mobile_optimized_firewall() {
    echo "📱 Configurando firewall otimizado para mobile (80% usuários)..."
    
    # Priorizar tráfego mobile
    iptables -t mangle -A PREROUTING \
        -m string --string "Mobile" --algo bm \
        -j MARK --set-mark 1
    
    # QoS para mobile
    tc qdisc add dev eth0 root handle 1: htb default 20
    tc class add dev eth0 parent 1: classid 1:1 htb rate 1gbit
    tc class add dev eth0 parent 1:1 classid 1:10 htb rate 800mbit ceil 1gbit prio 1
    tc class add dev eth0 parent 1:1 classid 1:20 htb rate 200mbit ceil 400mbit prio 2
    
    # Filter para mobile traffic
    tc filter add dev eth0 protocol ip parent 1:0 prio 1 handle 1 fw classid 1:10
    
    echo "✅ Firewall mobile-optimized configurado"
}

setup_tenant_network_isolation() {
    local CLIENT_ID=$1
    
    echo "🌐 Configurando isolamento de rede para cliente: $CLIENT_ID"
    
    # Criar namespace de rede específico (se usando containers)
    ip netns add "tenant-${CLIENT_ID}"
    
    # Configurar bridge isolada
    ip link add name "br-tenant-${CLIENT_ID}" type bridge
    ip link set "br-tenant-${CLIENT_ID}" up
    
    # Configurar VLAN para isolamento
    ip link add link eth0 name "eth0.${CLIENT_ID}" type vlan id "$CLIENT_ID"
    ip link set "eth0.${CLIENT_ID}" up
    ip link set "eth0.${CLIENT_ID}" master "br-tenant-${CLIENT_ID}"
    
    # Configurar subnet específico
    CLIENT_SUBNET="10.${CLIENT_ID}.0.0/24"
    ip addr add "10.${CLIENT_ID}.0.1/24" dev "br-tenant-${CLIENT_ID}"
    
    # DHCP para o tenant (usando dnsmasq)
    cat > "/etc/dnsmasq.d/tenant-${CLIENT_ID}.conf" << EOF
interface=br-tenant-${CLIENT_ID}
dhcp-range=10.${CLIENT_ID}.0.50,10.${CLIENT_ID}.0.200,24h
dhcp-option=option:router,10.${CLIENT_ID}.0.1
dhcp-option=option:dns-server,1.1.1.1,8.8.8.8
EOF

    systemctl reload dnsmasq
    
    echo "✅ Isolamento de rede configurado para cliente $CLIENT_ID"
}
```

## 🔒 **CRIPTOGRAFIA MULTI-TENANT**

### **🔐 Criptografia Específica por Tenant**
```python
#!/usr/bin/env python3
# tenant-encryption-manager.py

import os
import base64
import hashlib
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import hvac
import asyncio
from typing import Dict, Optional

class KryonixTenantEncryptionManager:
    def __init__(self, vault_url: str, vault_token: str):
        self.vault_client = hvac.Client(url=vault_url, token=vault_token)
        self.tenant_keys = {}
        
    async def create_tenant_encryption_infrastructure(
        self, 
        cliente_id: str
    ) -> Dict:
        """Cria infraestrutura completa de criptografia para tenant"""
        
        try:
            # 1. Gerar chave mestra do tenant
            master_key = await self.generate_tenant_master_key(cliente_id)
            
            # 2. Criar chaves derivadas para diferentes propósitos
            derived_keys = await self.create_tenant_derived_keys(cliente_id, master_key)
            
            # 3. Configurar transit encryption no Vault
            transit_result = await self.configure_vault_transit(cliente_id)
            
            # 4. Gerar par de chaves RSA para comunicação
            rsa_keys = await self.generate_tenant_rsa_keys(cliente_id)
            
            # 5. Armazenar chaves no Vault com isolamento
            storage_result = await self.store_tenant_keys_securely(
                cliente_id, derived_keys, rsa_keys
            )
            
            return {
                'success': True,
                'cliente_id': cliente_id,
                'master_key_created': bool(master_key),
                'derived_keys_count': len(derived_keys),
                'transit_configured': transit_result['success'],
                'rsa_keys_generated': bool(rsa_keys),
                'keys_stored_securely': storage_result['success']
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def generate_tenant_master_key(self, cliente_id: str) -> bytes:
        """Gera chave mestra específica do tenant"""
        
        # Usar dados únicos do tenant para gerar chave determinística
        tenant_data = f"kryonix_tenant_{cliente_id}_master_key_2025".encode()
        
        # Derivar chave usando PBKDF2
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'kryonix_salt_' + cliente_id.encode(),
            iterations=100000,
        )
        
        master_key = kdf.derive(tenant_data)
        
        # Armazenar hash da chave no Vault para verificação
        key_hash = hashlib.sha256(master_key).hexdigest()
        
        await self.vault_client.secrets.kv.v2.create_or_update_secret(
            path=f"encryption/tenants/{cliente_id}/master_key_hash",
            secret={'hash': key_hash, 'created_at': str(asyncio.get_event_loop().time())}
        )
        
        return master_key

    async def create_tenant_derived_keys(
        self, 
        cliente_id: str, 
        master_key: bytes
    ) -> Dict[str, bytes]:
        """Cria chaves derivadas para diferentes propósitos"""
        
        derived_keys = {}
        
        # Diferentes contextos para derivação
        contexts = {
            'database': b'database_encryption',
            'files': b'file_encryption',
            'api': b'api_encryption',
            'mobile': b'mobile_encryption',
            'backup': b'backup_encryption',
            'logs': b'log_encryption'
        }
        
        for purpose, context in contexts.items():
            # Derivar chave específica
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=context + cliente_id.encode(),
                iterations=50000,
            )
            
            derived_key = kdf.derive(master_key + context)
            derived_keys[purpose] = derived_key
            
        return derived_keys

    async def configure_vault_transit(self, cliente_id: str) -> Dict:
        """Configura Vault Transit Engine para o tenant"""
        
        try:
            # Habilitar transit engine específico do tenant
            mount_path = f"transit-{cliente_id}"
            
            # Montar transit engine
            self.vault_client.sys.enable_secrets_engine(
                backend_type='transit',
                path=mount_path
            )
            
            # Criar chave de criptografia específica
            key_name = f"tenant-{cliente_id}-key"
            
            self.vault_client.secrets.transit.create_key(
                name=key_name,
                mount_point=mount_path,
                key_type='aes256-gcm96'
            )
            
            # Configurar políticas de rotação automática
            self.vault_client.secrets.transit.configure_key(
                name=key_name,
                mount_point=mount_path,
                min_decryption_version=1,
                min_encryption_version=1,
                deletion_allowed=False,
                auto_rotate_period='2160h'  # 90 dias
            )
            
            return {
                'success': True,
                'mount_path': mount_path,
                'key_name': key_name
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    async def encrypt_tenant_data(
        self, 
        cliente_id: str, 
        plaintext: str, 
        context: str = 'general'
    ) -> str:
        """Criptografa dados específicos do tenant"""
        
        try:
            mount_path = f"transit-{cliente_id}"
            key_name = f"tenant-{cliente_id}-key"
            
            response = self.vault_client.secrets.transit.encrypt_data(
                name=key_name,
                mount_point=mount_path,
                plaintext=base64.b64encode(plaintext.encode()).decode(),
                context=base64.b64encode(context.encode()).decode()
            )
            
            return response['data']['ciphertext']
            
        except Exception as e:
            raise Exception(f"Erro criptografando dados do tenant {cliente_id}: {e}")

    async def decrypt_tenant_data(
        self, 
        cliente_id: str, 
        ciphertext: str, 
        context: str = 'general'
    ) -> str:
        """Descriptografa dados específicos do tenant"""
        
        try:
            mount_path = f"transit-{cliente_id}"
            key_name = f"tenant-{cliente_id}-key"
            
            response = self.vault_client.secrets.transit.decrypt_data(
                name=key_name,
                mount_point=mount_path,
                ciphertext=ciphertext,
                context=base64.b64encode(context.encode()).decode()
            )
            
            return base64.b64decode(response['data']['plaintext']).decode()
            
        except Exception as e:
            raise Exception(f"Erro descriptografando dados do tenant {cliente_id}: {e}")

    async def generate_tenant_rsa_keys(self, cliente_id: str) -> Dict:
        """Gera par de chaves RSA para o tenant"""
        
        # Gerar chave privada
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=4096,
        )
        
        # Obter chave pública
        public_key = private_key.public_key()
        
        # Serializar chaves
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return {
            'private_key': private_pem.decode(),
            'public_key': public_pem.decode()
        }
```

## 📱 **SEGURANÇA MOBILE MULTI-TENANT**

### **🔐 Biometria e Device Security**
```typescript
// mobile-security-multi-tenant.ts
export class KryonixMobileSecurityManager {
    private tenantId: string;
    private encryptionKey: string;
    
    constructor(tenantId: string) {
        this.tenantId = tenantId;
        this.encryptionKey = `tenant_${tenantId}_mobile_key`;
    }
    
    async implementTenantMobileSecurity(): Promise<MobileSecurityConfig> {
        return {
            biometric_authentication: await this.configureBiometricAuth(),
            device_security: await this.configureDeviceSecurity(),
            network_security: await this.configureNetworkSecurity(),
            data_protection: await this.configureDataProtection(),
            compliance: await this.configureLGPDCompliance()
        };
    }
    
    private async configureBiometricAuth(): Promise<BiometricConfig> {
        return {
            fingerprint: {
                enabled: true,
                fallback_to_pin: true,
                max_attempts: 5,
                tenant_specific: true,
                encryption_key: `biometric_${this.tenantId}`
            },
            face_recognition: {
                enabled: true,
                liveness_detection: true,
                anti_spoofing: true,
                tenant_isolation: true
            },
            voice_recognition: {
                enabled: false, // Configurável por tenant
                training_samples: 3,
                accuracy_threshold: 0.85
            },
            behavioral_biometrics: {
                enabled: true,
                typing_patterns: true,
                swipe_patterns: true,
                device_movement: true,
                ai_learning: true,
                tenant_model: `behavior_model_${this.tenantId}`
            }
        };
    }
    
    private async configureDeviceSecurity(): Promise<DeviceSecurityConfig> {
        return {
            device_fingerprinting: {
                collect_device_info: true,
                hardware_fingerprint: true,
                software_fingerprint: true,
                network_fingerprint: true,
                tenant_specific_db: `device_fingerprints_${this.tenantId}`
            },
            
            jailbreak_detection: {
                enabled: true,
                block_rooted_devices: true,
                runtime_checks: true,
                anti_hooking: true,
                custom_detection: true
            },
            
            app_tampering_detection: {
                enabled: true,
                signature_verification: true,
                runtime_integrity: true,
                anti_debugging: true,
                obfuscation_checks: true
            },
            
            ssl_pinning: {
                enabled: true,
                pin_type: 'certificate',
                backup_pins: 2,
                tenant_specific_certs: true,
                pin_validation: `ssl_pins_${this.tenantId}`
            }
        };
    }
    
    private async configureDataProtection(): Promise<DataProtectionConfig> {
        return {
            local_encryption: {
                algorithm: 'AES-256-GCM',
                key_derivation: 'PBKDF2',
                tenant_salt: `salt_${this.tenantId}`,
                encryption_at_rest: true,
                secure_key_storage: true
            },
            
            secure_storage: {
                use_keychain: true,
                hardware_backed: true,
                biometric_protected: true,
                tenant_namespace: `secure_storage_${this.tenantId}`
            },
            
            memory_protection: {
                clear_memory_on_background: true,
                prevent_memory_dumps: true,
                encrypt_sensitive_variables: true,
                runtime_protection: true
            },
            
            screenshot_protection: {
                prevent_screenshots: true,
                blur_on_background: true,
                watermark_screenshots: true,
                tenant_watermark: `© KRYONIX Tenant ${this.tenantId}`
            },
            
            copy_paste_protection: {
                monitor_clipboard: true,
                clear_clipboard_timeout: 30,
                prevent_sensitive_copy: true,
                tenant_specific_rules: true
            }
        };
    }
    
    async validateTenantAccess(
        deviceId: string, 
        biometricData: BiometricData
    ): Promise<TenantAccessValidation> {
        
        // Verificar se dispositivo tem acesso ao tenant
        const deviceAccess = await this.checkDeviceTenantAccess(deviceId);
        if (!deviceAccess.allowed) {
            return {
                access_granted: false,
                reason: 'device_not_authorized_for_tenant',
                tenant_id: this.tenantId
            };
        }
        
        // Validar biometria específica do tenant
        const biometricValidation = await this.validateTenantBiometrics(
            biometricData, deviceId
        );
        
        if (!biometricValidation.valid) {
            return {
                access_granted: false,
                reason: 'biometric_validation_failed',
                tenant_id: this.tenantId
            };
        }
        
        // Verificar políticas de segurança do tenant
        const policyCheck = await this.checkTenantSecurityPolicies(deviceId);
        
        return {
            access_granted: policyCheck.compliant,
            reason: policyCheck.compliant ? 'access_granted' : policyCheck.violation,
            tenant_id: this.tenantId,
            session_token: policyCheck.compliant ? await this.generateTenantSessionToken() : null
        };
    }
    
    private async generateTenantSessionToken(): Promise<string> {
        const payload = {
            tenant_id: this.tenantId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60), // 8 horas
            mobile_session: true,
            security_level: 'high'
        };
        
        // Assinar com chave específica do tenant
        return jwt.sign(payload, await this.getTenantJWTSecret());
    }
}
```

## 🔍 **MONITORAMENTO SEGURANÇA MULTI-TENANT**

### **📊 SIEM Multi-Tenant com Isolamento**
```python
#!/usr/bin/env python3
# security-monitoring-multi-tenant.py

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import elasticsearch
import redis
from prometheus_client import Counter, Histogram, Gauge
import requests

class KryonixMultiTenantSecurityMonitor:
    def __init__(self):
        self.setup_logging()
        self.elasticsearch = elasticsearch.Elasticsearch(['http://elasticsearch:9200'])
        self.redis_client = redis.Redis(host='redis', port=6379, db=0)
        self.setup_metrics()
        
        # Configurações por tenant
        self.tenant_configs = {}
        
    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('/opt/kryonix/logs/security-monitor.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('KryonixSecurityMonitor')

    def setup_metrics(self):
        """Setup Prometheus metrics para monitoramento"""
        
        self.security_events = Counter(
            'kryonix_security_events_total',
            'Total security events by tenant',
            ['tenant_id', 'event_type', 'severity']
        )
        
        self.failed_logins = Counter(
            'kryonix_failed_logins_total',
            'Failed login attempts by tenant',
            ['tenant_id', 'source_ip', 'user_agent']
        )
        
        self.api_abuse = Counter(
            'kryonix_api_abuse_total',
            'API abuse attempts by tenant',
            ['tenant_id', 'endpoint', 'source_ip']
        )
        
        self.threat_level = Gauge(
            'kryonix_threat_level',
            'Current threat level by tenant',
            ['tenant_id']
        )

    async def monitor_tenant_security_24x7(self):
        """Monitoramento contínuo de segurança multi-tenant"""
        
        self.logger.info("🔒 Iniciando monitoramento de segurança multi-tenant...")
        
        while True:
            try:
                # Obter lista de tenants ativos
                active_tenants = await self.get_active_tenants()
                
                # Monitorar cada tenant isoladamente
                for tenant_id in active_tenants:
                    await self.monitor_individual_tenant(tenant_id)
                
                # Análise global de ameaças
                await self.analyze_global_threat_landscape()
                
                # Relatório de segurança
                if datetime.now().minute == 0:  # A cada hora
                    await self.generate_hourly_security_report()
                
                await asyncio.sleep(60)  # Verificar a cada minuto
                
            except Exception as e:
                self.logger.error(f"❌ Erro no monitoramento: {e}")
                await asyncio.sleep(30)

    async def monitor_individual_tenant(self, tenant_id: str):
        """Monitora segurança específica de um tenant"""
        
        tenant_events = await self.collect_tenant_security_events(tenant_id)
        
        # Análises específicas por tenant
        analyses = {
            'failed_logins': await self.analyze_failed_logins(tenant_id, tenant_events),
            'api_abuse': await self.analyze_api_abuse(tenant_id, tenant_events),
            'mobile_anomalies': await self.analyze_mobile_anomalies(tenant_id, tenant_events),
            'data_access': await self.analyze_data_access_patterns(tenant_id, tenant_events),
            'biometric_failures': await self.analyze_biometric_failures(tenant_id, tenant_events)
        }
        
        # Calcular nível de ameaça do tenant
        threat_level = await self.calculate_tenant_threat_level(tenant_id, analyses)
        self.threat_level.labels(tenant_id=tenant_id).set(threat_level)
        
        # Ações automatizadas se necessário
        if threat_level >= 8:
            await self.execute_tenant_emergency_response(tenant_id, analyses)
        elif threat_level >= 5:
            await self.strengthen_tenant_defenses(tenant_id, analyses)
        
        # Log eventos de segurança no índice específico do tenant
        await self.log_tenant_security_events(tenant_id, analyses, threat_level)

    async def collect_tenant_security_events(self, tenant_id: str) -> List[Dict]:
        """Coleta eventos de segurança específicos do tenant"""
        
        # Query Elasticsearch para eventos do tenant específico
        query = {
            "query": {
                "bool": {
                    "must": [
                        {"term": {"tenant_id": tenant_id}},
                        {"range": {"@timestamp": {"gte": "now-5m"}}}
                    ]
                }
            },
            "sort": [{"@timestamp": {"order": "desc"}}],
            "size": 1000
        }
        
        try:
            response = self.elasticsearch.search(
                index=f"security-events-{tenant_id}-*",
                body=query
            )
            
            return [hit['_source'] for hit in response['hits']['hits']]
            
        except Exception as e:
            self.logger.error(f"❌ Erro coletando eventos do tenant {tenant_id}: {e}")
            return []

    async def analyze_failed_logins(self, tenant_id: str, events: List[Dict]) -> Dict:
        """Analisa tentativas de login falhadas do tenant"""
        
        failed_login_events = [
            event for event in events 
            if event.get('event_type') == 'failed_login'
        ]
        
        if not failed_login_events:
            return {'threat_score': 0, 'events_count': 0}
        
        # Análise de padrões
        ip_attempts = {}
        user_attempts = {}
        mobile_failures = 0
        biometric_failures = 0
        
        for event in failed_login_events:
            ip = event.get('source_ip', 'unknown')
            user = event.get('username', 'unknown')
            is_mobile = event.get('user_agent', '').lower().find('mobile') != -1
            is_biometric = event.get('auth_method') == 'biometric'
            
            ip_attempts[ip] = ip_attempts.get(ip, 0) + 1
            user_attempts[user] = user_attempts.get(user, 0) + 1
            
            if is_mobile:
                mobile_failures += 1
            if is_biometric:
                biometric_failures += 1
        
        # Calcular score de ameaça
        threat_score = 0
        
        # IPs com muitas tentativas
        max_ip_attempts = max(ip_attempts.values()) if ip_attempts else 0
        if max_ip_attempts > 10:
            threat_score += 5
        elif max_ip_attempts > 5:
            threat_score += 3
        
        # Usuários com muitas tentativas
        max_user_attempts = max(user_attempts.values()) if user_attempts else 0
        if max_user_attempts > 5:
            threat_score += 3
        
        # Falhas biométricas indicam possível ataque
        if biometric_failures > 3:
            threat_score += 4
        
        # Registrar métricas
        for ip, attempts in ip_attempts.items():
            self.failed_logins.labels(
                tenant_id=tenant_id, 
                source_ip=ip, 
                user_agent='mobile' if mobile_failures > 0 else 'desktop'
            ).inc(attempts)
        
        return {
            'threat_score': min(threat_score, 10),
            'events_count': len(failed_login_events),
            'unique_ips': len(ip_attempts),
            'unique_users': len(user_attempts),
            'mobile_failures': mobile_failures,
            'biometric_failures': biometric_failures,
            'top_attacking_ips': sorted(ip_attempts.items(), key=lambda x: x[1], reverse=True)[:5]
        }

    async def analyze_mobile_anomalies(self, tenant_id: str, events: List[Dict]) -> Dict:
        """Analisa anomalias específicas de mobile para o tenant"""
        
        mobile_events = [
            event for event in events 
            if event.get('device_type') == 'mobile' or 
               'mobile' in event.get('user_agent', '').lower()
        ]
        
        anomalies = {
            'device_changes': 0,
            'location_anomalies': 0,
            'behavior_anomalies': 0,
            'app_tampering': 0,
            'jailbreak_attempts': 0
        }
        
        for event in mobile_events:
            event_type = event.get('event_type')
            
            if event_type == 'device_fingerprint_change':
                anomalies['device_changes'] += 1
            elif event_type == 'impossible_travel':
                anomalies['location_anomalies'] += 1
            elif event_type == 'behavior_anomaly':
                anomalies['behavior_anomalies'] += 1
            elif event_type == 'app_tampering_detected':
                anomalies['app_tampering'] += 1
            elif event_type == 'jailbreak_detected':
                anomalies['jailbreak_attempts'] += 1
        
        # Calcular score de ameaça mobile
        mobile_threat_score = (
            anomalies['device_changes'] * 2 +
            anomalies['location_anomalies'] * 3 +
            anomalies['behavior_anomalies'] * 1 +
            anomalies['app_tampering'] * 5 +
            anomalies['jailbreak_attempts'] * 4
        )
        
        return {
            'threat_score': min(mobile_threat_score, 10),
            'anomalies': anomalies,
            'total_mobile_events': len(mobile_events)
        }

    async def execute_tenant_emergency_response(
        self, 
        tenant_id: str, 
        analyses: Dict
    ):
        """Executa resposta de emergência específica do tenant"""
        
        self.logger.warning(f"🚨 Executando resposta de emergência para tenant {tenant_id}")
        
        emergency_actions = []
        
        # 1. Bloquear IPs suspeitos do tenant
        if 'failed_logins' in analyses and analyses['failed_logins']['top_attacking_ips']:
            for ip, attempts in analyses['failed_logins']['top_attacking_ips'][:3]:
                if attempts > 5:
                    await self.block_ip_for_tenant(tenant_id, ip, duration=3600)
                    emergency_actions.append(f"IP {ip} bloqueado por 1h")
        
        # 2. Revogar sessões suspeitas
        suspicious_sessions = await self.identify_suspicious_sessions(tenant_id)
        for session_id in suspicious_sessions:
            await self.revoke_tenant_session(tenant_id, session_id)
            emergency_actions.append(f"Sessão {session_id[:8]}... revogada")
        
        # 3. Ativar MFA obrigatório temporariamente
        await self.enable_temporary_mfa(tenant_id, duration=86400)  # 24h
        emergency_actions.append("MFA obrigatório ativado por 24h")
        
        # 4. Backup de emergência
        await self.trigger_emergency_backup(tenant_id)
        emergency_actions.append("Backup de emergência iniciado")
        
        # 5. Notificar administradores do tenant
        await self.notify_tenant_administrators(
            tenant_id,
            f"🚨 ALERTA DE SEGURANÇA - TENANT {tenant_id}\n\n"
            f"Ameaça de alta prioridade detectada!\n\n"
            f"Ações tomadas automaticamente:\n" + 
            "\n".join([f"• {action}" for action in emergency_actions]) +
            f"\n\nVerifique o console de segurança para mais detalhes."
        )
        
        # 6. Log da resposta de emergência
        await self.log_emergency_response(tenant_id, emergency_actions, analyses)

    async def block_ip_for_tenant(
        self, 
        tenant_id: str, 
        ip_address: str, 
        duration: int
    ):
        """Bloqueia IP específico para um tenant"""
        
        # Adicionar regra iptables específica para o tenant
        import subprocess
        
        try:
            # Bloquear IP apenas para tráfego do tenant
            subprocess.run([
                'iptables', '-A', f'KRYONIX_CLIENT_{tenant_id}',
                '-s', ip_address, '-j', 'DROP'
            ], check=True)
            
            # Agendar remoção do bloqueio
            await self.schedule_ip_unblock(tenant_id, ip_address, duration)
            
            self.logger.info(f"✅ IP {ip_address} bloqueado para tenant {tenant_id}")
            
        except subprocess.CalledProcessError as e:
            self.logger.error(f"❌ Erro bloqueando IP {ip_address}: {e}")

    async def notify_tenant_administrators(
        self, 
        tenant_id: str, 
        message: str
    ):
        """Notifica administradores específicos do tenant"""
        
        # Obter contatos dos administradores do tenant
        admin_contacts = await self.get_tenant_admin_contacts(tenant_id)
        
        for contact in admin_contacts:
            if contact['type'] == 'whatsapp':
                await self.send_whatsapp_notification(contact['number'], message)
            elif contact['type'] == 'email':
                await self.send_email_notification(contact['email'], message)
            elif contact['type'] == 'sms':
                await self.send_sms_notification(contact['phone'], message)

    async def send_whatsapp_notification(self, phone: str, message: str):
        """Envia notificação via WhatsApp"""
        
        try:
            webhook_url = "https://evolution.kryonix.com.br/message/sendText"
            
            payload = {
                "number": phone,
                "text": message
            }
            
            response = requests.post(
                webhook_url,
                headers={
                    "apikey": "evolution_api_key",
                    "Content-Type": "application/json"
                },
                json=payload
            )
            
            if response.status_code == 200:
                self.logger.info(f"📲 Notificação WhatsApp enviada para {phone}")
            else:
                self.logger.error(f"❌ Erro enviando WhatsApp: {response.status_code}")
                
        except Exception as e:
            self.logger.error(f"❌ Erro enviando notificação WhatsApp: {e}")
```

## 🔧 **SCRIPT SETUP SEGURANÇA MULTI-TENANT COMPLETO**

### **🚀 Instalação Automática Completa**
```bash
#!/bin/bash
# setup-security-multi-tenant-complete.sh

echo "🔒 KRYONIX - Setup Segurança Multi-Tenant Completo"
echo "================================================="

# Validar parâmetros
if [ $# -lt 2 ]; then
    echo "Uso: $0 <ambiente> <tenant_count>"
    echo "Exemplo: $0 production 100"
    exit 1
fi

ENVIRONMENT=$1
TENANT_COUNT=${2:-10}

echo "🌍 Ambiente: $ENVIRONMENT"
echo "👥 Número de tenants: $TENANT_COUNT"

# 1. CRIAR ESTRUTURA MULTI-TENANT
echo "📁 Criando estrutura de segurança multi-tenant..."
mkdir -p /opt/kryonix/security/{keycloak,vault,firewall,monitoring,scripts}
mkdir -p /opt/kryonix/security/tenants/{configs,secrets,certificates}

# 2. INSTALAR KEYCLOAK MULTI-TENANT
echo "🔐 Instalando Keycloak multi-tenant..."
docker run -d \
  --name keycloak-multi-tenant \
  --restart always \
  --network kryonix-network \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=Vitor@123456 \
  -e KC_DB=postgres \
  -e KC_DB_URL=jdbc:postgresql://postgresql:5432/keycloak \
  -e KC_DB_USERNAME=keycloak \
  -e KC_DB_PASSWORD=keycloak_pass \
  -e KC_HOSTNAME=auth.kryonix.com.br \
  -e KC_FEATURES=multi-tenancy \
  -v /opt/kryonix/security/keycloak:/opt/keycloak/data \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.keycloak.rule=Host(\`auth.kryonix.com.br\`)" \
  --label "traefik.http.routers.keycloak.entrypoints=websecure" \
  --label "traefik.http.routers.keycloak.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.keycloak.loadbalancer.server.port=8080" \
  quay.io/keycloak/keycloak:latest start

# 3. CONFIGURAR VAULT MULTI-TENANT
echo "🏦 Configurando Vault multi-tenant..."
docker run -d \
  --name vault-multi-tenant \
  --restart unless-stopped \
  --network kryonix-network \
  -p 8200:8200 \
  -e VAULT_ADDR=http://0.0.0.0:8200 \
  -e VAULT_LOG_LEVEL=INFO \
  -v /opt/kryonix/security/vault:/vault/data \
  --cap-add=IPC_LOCK \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.vault.rule=Host(\`vault.kryonix.com.br\`)" \
  --label "traefik.http.routers.vault.entrypoints=websecure" \
  --label "traefik.http.routers.vault.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.vault.loadbalancer.server.port=8200" \
  vault:latest

# 4. INSTALAR COMPONENTES PYTHON
echo "🐍 Instalando componentes Python..."
pip3 install \
  keycloak-admin-client \
  hvac \
  elasticsearch \
  redis \
  prometheus-client \
  cryptography \
  python-multipart \
  fastapi \
  uvicorn

# 5. CONFIGURAR FIREWALL MULTI-TENANT
echo "🔥 Configurando firewall multi-tenant..."
cat > /opt/kryonix/security/scripts/setup-tenant-firewall.sh << 'EOF'
#!/bin/bash
# Setup firewall para tenant específico

TENANT_ID=$1
TENANT_PLAN=${2:-basic}

if [ -z "$TENANT_ID" ]; then
    echo "Uso: $0 <tenant_id> [plan]"
    exit 1
fi

echo "🔥 Configurando firewall para tenant: $TENANT_ID"

# Criar chain específica do tenant
iptables -N "KRYONIX_TENANT_${TENANT_ID}" 2>/dev/null || true

# Rate limiting baseado no plano
case "$TENANT_PLAN" in
    "basic")
        RATE="100/min"
        BURST="200"
        ;;
    "pro")
        RATE="500/min"
        BURST="1000"
        ;;
    "enterprise")
        RATE="2000/min"
        BURST="5000"
        ;;
    *)
        RATE="50/min"
        BURST="100"
        ;;
esac

# Aplicar rate limiting
iptables -A "KRYONIX_TENANT_${TENANT_ID}" \
    -m hashlimit \
    --hashlimit-upto "$RATE" \
    --hashlimit-burst "$BURST" \
    --hashlimit-mode srcip \
    --hashlimit-name "tenant_${TENANT_ID}" \
    -j ACCEPT

iptables -A "KRYONIX_TENANT_${TENANT_ID}" -j DROP

echo "✅ Firewall configurado para tenant $TENANT_ID (Plano: $TENANT_PLAN)"
EOF

chmod +x /opt/kryonix/security/scripts/setup-tenant-firewall.sh

# 6. INSTALAR GERENCIADOR MULTI-TENANT
echo "🤖 Instalando gerenciador multi-tenant..."
cat > /opt/kryonix/security/scripts/keycloak-multi-tenant-manager.py << 'EOF'
#!/usr/bin/env python3
# Gerenciador completo inserido anteriormente no documento
# [Código completo da classe KryonixMultiTenantKeycloakManager]
EOF

chmod +x /opt/kryonix/security/scripts/keycloak-multi-tenant-manager.py

# 7. CONFIGURAR MONITORAMENTO SIEM
echo "📊 Configurando SIEM multi-tenant..."
docker run -d \
  --name elasticsearch-security \
  --restart unless-stopped \
  --network kryonix-network \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms2g -Xmx2g" \
  -v /opt/kryonix/security/elasticsearch:/usr/share/elasticsearch/data \
  docker.elastic.co/elasticsearch/elasticsearch:8.10.0

sleep 30

docker run -d \
  --name kibana-security \
  --restart unless-stopped \
  --network kryonix-network \
  -p 5601:5601 \
  -e ELASTICSEARCH_HOSTS=http://elasticsearch-security:9200 \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.kibana.rule=Host(\`security.kryonix.com.br\`)" \
  --label "traefik.http.routers.kibana.entrypoints=websecure" \
  --label "traefik.http.routers.kibana.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.kibana.loadbalancer.server.port=5601" \
  docker.elastic.co/kibana/kibana:8.10.0

# 8. CONFIGURAR FAIL2BAN MULTI-TENANT
echo "🚫 Configurando Fail2Ban multi-tenant..."
apt update && apt install -y fail2ban

cat > /etc/fail2ban/jail.d/kryonix-multi-tenant.conf << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[kryonix-tenant-api]
enabled = true
filter = kryonix-tenant-api
logpath = /var/log/nginx/access.log
maxretry = 20
findtime = 60
bantime = 300
action = iptables-allports[name=tenant-api, chain=KRYONIX_TENANT_%(tenant_id)s]

[kryonix-auth-abuse]
enabled = true
filter = kryonix-auth-abuse
logpath = /opt/kryonix/logs/auth.log
maxretry = 10
findtime = 300
bantime = 1800
EOF

# Filtros específicos
cat > /etc/fail2ban/filter.d/kryonix-tenant-api.conf << 'EOF'
[Definition]
failregex = ^<HOST> .* "(?:GET|POST|PUT|DELETE) /api/tenant/[^/]+/.* HTTP/.*" (?:4\d\d|5\d\d) .*$
ignoreregex =
EOF

cat > /etc/fail2ban/filter.d/kryonix-auth-abuse.conf << 'EOF'
[Definition]
failregex = ^.*tenant_id:([^,]+).*auth_failed.*source_ip:<HOST>.*$
ignoreregex =
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# 9. SCRIPT DE CRIAÇÃO AUTOMÁTICA DE TENANTS
echo "🏗️ Criando script de auto-provisionamento..."
cat > /opt/kryonix/security/scripts/create-tenant.sh << 'EOF'
#!/bin/bash
# Script para criar tenant completo com segurança

TENANT_ID=$1
TENANT_NAME="$2"
TENANT_PLAN=${3:-basic}
MODULES=${4:-"crm,whatsapp"}

if [ -z "$TENANT_ID" ] || [ -z "$TENANT_NAME" ]; then
    echo "Uso: $0 <tenant_id> <tenant_name> [plan] [modules]"
    echo "Exemplo: $0 empresa001 'Empresa Exemplo' pro 'crm,whatsapp,financeiro'"
    exit 1
fi

echo "🏗️ Criando tenant: $TENANT_ID ($TENANT_NAME)"

# 1. Criar realm Keycloak
python3 /opt/kryonix/security/scripts/keycloak-multi-tenant-manager.py \
    create-realm "$TENANT_ID" "$TENANT_NAME" "$TENANT_PLAN" "$MODULES"

# 2. Configurar Vault para tenant
python3 /opt/kryonix/security/scripts/vault-tenant-setup.py \
    "$TENANT_ID" "$TENANT_PLAN"

# 3. Configurar firewall
/opt/kryonix/security/scripts/setup-tenant-firewall.sh "$TENANT_ID" "$TENANT_PLAN"

# 4. Criar certificados SSL específicos
certbot certonly --nginx \
    -d "cliente-${TENANT_ID}.kryonix.com.br" \
    --non-interactive --agree-tos \
    --email admin@kryonix.com.br

# 5. Configurar monitoramento específico
curl -X PUT "http://elasticsearch-security:9200/security-events-${TENANT_ID}-$(date +%Y.%m)" \
    -H "Content-Type: application/json" \
    -d '{
        "mappings": {
            "properties": {
                "tenant_id": {"type": "keyword"},
                "event_type": {"type": "keyword"},
                "timestamp": {"type": "date"},
                "source_ip": {"type": "ip"},
                "severity": {"type": "keyword"}
            }
        }
    }'

echo "✅ Tenant $TENANT_ID criado com sucesso!"
echo "🌐 Realm: https://auth.kryonix.com.br/realms/kryonix-cliente-${TENANT_ID}"
echo "🔒 Vault Path: secret/cliente/${TENANT_ID}/"
echo "🛡️ Firewall: Chain KRYONIX_TENANT_${TENANT_ID} configurada"
echo "📊 Monitoring: Índice security-events-${TENANT_ID}-* criado"
EOF

chmod +x /opt/kryonix/security/scripts/create-tenant.sh

# 10. CONFIGURAR SERVIÇOS SYSTEMD
echo "🔧 Configurando serviços systemd..."

# Monitoramento de segurança
cat > /etc/systemd/system/kryonix-security-monitor.service << 'EOF'
[Unit]
Description=KRYONIX Multi-Tenant Security Monitor
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /opt/kryonix/security/scripts/security-monitoring-multi-tenant.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl enable kryonix-security-monitor
systemctl start kryonix-security-monitor

# 11. CONFIGURAR BACKUPS DE SEGURANÇA
echo "💾 Configurando backup de segurança..."
cat > /opt/kryonix/security/scripts/backup-security-configs.sh << 'EOF'
#!/bin/bash
# Backup configurações de segurança

BACKUP_DIR="/opt/kryonix/backups/security/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup Keycloak realms
docker exec keycloak-multi-tenant /opt/keycloak/bin/kc.sh export \
    --dir /tmp/keycloak-export \
    --users realm_file

docker cp keycloak-multi-tenant:/tmp/keycloak-export "$BACKUP_DIR/keycloak/"

# Backup Vault secrets
vault kv list -format=json secret/ > "$BACKUP_DIR/vault-secrets.json"

# Backup iptables rules
iptables-save > "$BACKUP_DIR/iptables-rules.txt"

# Backup fail2ban config
cp -r /etc/fail2ban/ "$BACKUP_DIR/fail2ban/"

echo "✅ Backup de segurança criado em: $BACKUP_DIR"
EOF

chmod +x /opt/kryonix/security/scripts/backup-security-configs.sh

# Agendar backup diário
echo "0 2 * * * /opt/kryonix/security/scripts/backup-security-configs.sh" | crontab -

# 12. TESTE INICIAL
echo "🧪 Executando testes iniciais..."

# Aguardar serviços ficarem prontos
sleep 60

# Testar Keycloak
curl -f http://localhost:8080/health && echo "✅ Keycloak OK" || echo "❌ Keycloak ERRO"

# Testar Vault
curl -f http://localhost:8200/v1/sys/health && echo "✅ Vault OK" || echo "❌ Vault ERRO"

# Testar Elasticsearch
curl -f http://localhost:9200/_cluster/health && echo "✅ Elasticsearch OK" || echo "❌ Elasticsearch ERRO"

# Testar Fail2Ban
fail2ban-client status && echo "✅ Fail2Ban OK" || echo "❌ Fail2Ban ERRO"

echo ""
echo "🎉 SETUP SEGURANÇA MULTI-TENANT CONCLUÍDO!"
echo "============================================"
echo ""
echo "🔐 SERVIÇOS ATIVOS:"
echo "  • Keycloak: https://auth.kryonix.com.br"
echo "  • Vault: https://vault.kryonix.com.br"
echo "  • Security Dashboard: https://security.kryonix.com.br"
echo ""
echo "🛠️ SCRIPTS DISPONÍVEIS:"
echo "  • Criar tenant: /opt/kryonix/security/scripts/create-tenant.sh"
echo "  • Firewall tenant: /opt/kryonix/security/scripts/setup-tenant-firewall.sh"
echo "  • Backup segurança: /opt/kryonix/security/scripts/backup-security-configs.sh"
echo ""
echo "📊 MONITORAMENTO:"
echo "  • SIEM: Elasticsearch + Kibana"
echo "  • Fail2Ban: Proteção anti-DDoS"
echo "  • Prometheus: Métricas de segurança"
echo ""
echo "🏗️ PRÓXIMO PASSO:"
echo "  Para criar um tenant: ./create-tenant.sh empresa001 'Empresa Teste' pro 'crm,whatsapp'"
echo ""
```

## ✅ **CHECKLIST DE VALIDAÇÃO MULTI-TENANT**

### **🔐 AUTENTICAÇÃO & AUTORIZAÇÃO**
- [ ] Keycloak realms isolados por cliente funcionando
- [ ] Autenticação biométrica mobile configurada
- [ ] RBAC específico por tenant implementado
- [ ] SSO cross-modules funcionando
- [ ] MFA configurado por plano de assinatura

### **🛡️ ISOLAMENTO DE SEGURANÇA**
- [ ] Firewall rules específicas por cliente
- [ ] Network policies isoladas por tenant
- [ ] Vault secrets segregados por cliente
- [ ] Certificados SSL por subdomínio
- [ ] Rate limiting específico por plano

### **📱 SEGURANÇA MOBILE**
- [ ] Biometria TouchID/FaceID integrada
- [ ] Device fingerprinting por tenant
- [ ] SSL pinning para mobile apps
- [ ] Jailbreak/root detection ativo
- [ ] App tampering protection

### **🔒 CRIPTOGRAFIA**
- [ ] Chaves únicas por tenant no Vault
- [ ] Criptografia em repouso por cliente
- [ ] TLS 1.3 otimizado para mobile
- [ ] Key rotation automática configurada
- [ ] Transit encryption funcionando

### **📊 MONITORAMENTO & COMPLIANCE**
- [ ] SIEM com índices isolados por tenant
- [ ] Fail2Ban com proteção específica
- [ ] Audit trails por cliente configurados
- [ ] LGPD compliance automático
- [ ] Alertas via WhatsApp funcionando

### **🚨 RESPOSTA A INCIDENTES**
- [ ] Detection automática de ameaças
- [ ] Bloqueio automático de IPs suspeitos
- [ ] Revogação de sessões comprometidas
- [ ] Backup de emergência automático
- [ ] Notificação de administradores

### **🔄 AUTOMAÇÃO**
- [ ] Auto-provisionamento de tenants
- [ ] Scripts de criação de realms
- [ ] Firewall automático por plano
- [ ] Certificados SSL automáticos
- [ ] Backup configurações diário

---

*Parte 09 de 50 - Projeto KRYONIX SaaS Platform - Versão Multi-Tenant*  
*Próxima Parte: 10 - API Gateway Multi-Tenant*

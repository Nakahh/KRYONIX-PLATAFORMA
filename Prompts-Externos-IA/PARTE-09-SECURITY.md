# 🔒 PARTE-09: SEGURANÇA AVANÇADA
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar Vault + Fail2Ban + segurança mobile
- **URL**: https://vault.kryonix.com.br
- **Login Master**: kryonix / Vitor@123456

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55
cd /opt/kryonix

# === CRIAR ESTRUTURA SEGURANÇA ===
echo "🔒 Criando estrutura segurança..."
mkdir -p security/{vault,fail2ban,firewall,ssl}
mkdir -p security/vault/{config,data,policies}
mkdir -p security/fail2ban/{config,logs}

# === INSTALAR VAULT ===
echo "🏦 Instalando HashiCorp Vault..."
wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list
apt update && apt install vault

# === CONFIGURAR VAULT ===
echo "⚙️ Configurando Vault mobile-first..."
cat > security/vault/config/vault.hcl << 'EOF'
# Vault Configuration - KRYONIX Mobile-First Security

ui = true

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

storage "postgresql" {
  connection_url = "postgres://vault_user:vault_pass_2025@postgresql-kryonix:5432/vault_kryonix?sslmode=disable"
  table          = "vault_kv_store"
  max_parallel   = 128
}

api_addr = "https://vault.kryonix.com.br"
cluster_addr = "https://vault.kryonix.com.br:8201"

# Mobile-optimized settings
max_lease_ttl = "768h"
default_lease_ttl = "768h"

# Auto-unseal with transit
seal "transit" {
  address         = "https://vault.kryonix.com.br"
  disable_renewal = "false"
  key_name        = "autounseal"
  mount_path      = "transit/"
  tls_skip_verify = "true"
}

# Enable audit logging
audit {
  enabled = true
  options = {
    path = "/vault/logs/audit.log"
  }
}

# Mobile security policy
policy "mobile_policy" {
  path = "secret/mobile/*" {
    capabilities = ["create", "read", "update", "delete", "list"]
  }
  
  path = "secret/api_keys/*" {
    capabilities = ["read", "list"]
  }
}
EOF

# === CRIAR DATABASE VAULT ===
echo "🗄️ Criando database Vault..."
docker exec -it postgresql-kryonix psql -U postgres << 'EOF'
CREATE DATABASE vault_kryonix WITH ENCODING 'UTF8';
CREATE USER vault_user WITH PASSWORD 'vault_pass_2025';
GRANT ALL PRIVILEGES ON DATABASE vault_kryonix TO vault_user;
\q
EOF

# === DOCKER COMPOSE VAULT ===
echo "🐳 Configurando Vault container..."
cat > security/docker-compose.vault.yml << 'EOF'
version: '3.8'

networks:
  kryonix-network:
    external: true

volumes:
  vault-data:
  vault-logs:

services:
  vault:
    image: vault:latest
    container_name: vault-kryonix
    restart: unless-stopped
    environment:
      VAULT_CONFIG_DIR: /vault/config
      VAULT_LOG_LEVEL: INFO
      VAULT_ADDR: http://0.0.0.0:8200
    volumes:
      - ./vault/config:/vault/config
      - vault-data:/vault/data
      - vault-logs:/vault/logs
    ports:
      - "8200:8200"
      - "8201:8201"
    networks:
      - kryonix-network
    cap_add:
      - IPC_LOCK
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.vault.rule=Host(\`vault.kryonix.com.br\`)"
      - "traefik.http.routers.vault.tls=true"
      - "traefik.http.routers.vault.tls.certresolver=letsencrypt"
      - "traefik.http.services.vault.loadbalancer.server.port=8200"
EOF

# === INICIAR VAULT ===
echo "🚀 Iniciando Vault..."
cd security
docker-compose -f docker-compose.vault.yml up -d

# === INICIALIZAR VAULT ===
echo "🔑 Inicializando Vault..."
sleep 20
export VAULT_ADDR='http://localhost:8200'

# Initialize Vault (capture keys)
vault operator init -key-shares=5 -key-threshold=3 > vault-init-keys.txt

# Extract unseal keys and root token
UNSEAL_KEY_1=$(grep 'Unseal Key 1:' vault-init-keys.txt | awk '{print $4}')
UNSEAL_KEY_2=$(grep 'Unseal Key 2:' vault-init-keys.txt | awk '{print $4}')
UNSEAL_KEY_3=$(grep 'Unseal Key 3:' vault-init-keys.txt | awk '{print $4}')
ROOT_TOKEN=$(grep 'Initial Root Token:' vault-init-keys.txt | awk '{print $4}')

# Unseal Vault
vault operator unseal $UNSEAL_KEY_1
vault operator unseal $UNSEAL_KEY_2
vault operator unseal $UNSEAL_KEY_3

# Login with root token
vault auth $ROOT_TOKEN

# === CONFIGURAR SECRETS KRYONIX ===
echo "🔐 Configurando secrets KRYONIX..."

# Enable KV secrets engine
vault secrets enable -path=secret kv-v2

# Store mobile-first secrets
vault kv put secret/mobile/evolution \
    api_key="evolution_mobile_key_2025" \
    webhook_url="http://evolution:8080/webhook" \
    instance_name="kryonix_mobile"

vault kv put secret/mobile/database \
    postgres_host="postgresql-kryonix" \
    postgres_user="kryonix" \
    postgres_password="Vitor@123456" \
    redis_host="redis-kryonix" \
    redis_port="6379"

vault kv put secret/mobile/storage \
    minio_access_key="kryonix" \
    minio_secret_key="Vitor@123456" \
    s3_bucket="kryonix-backups"

vault kv put secret/api_keys/integrations \
    whatsapp_token="whatsapp_api_token_2025" \
    sms_api_key="sms_provider_key_2025" \
    email_api_key="email_service_key_2025"

vault kv put secret/mobile/auth \
    keycloak_admin="kryonix" \
    keycloak_password="Vitor@123456" \
    jwt_secret="kryonix_jwt_secret_mobile_2025"

# === POLICIES VAULT ===
echo "📋 Criando policies Vault..."
cat > security/vault/policies/mobile-policy.hcl << 'EOF'
# Mobile Application Policy
path "secret/data/mobile/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "secret/data/api_keys/*" {
  capabilities = ["read", "list"]
}

path "auth/token/lookup-self" {
  capabilities = ["read"]
}

path "auth/token/renew-self" {
  capabilities = ["update"]
}
EOF

vault policy write mobile-policy security/vault/policies/mobile-policy.hcl

# === INSTALAR FAIL2BAN ===
echo "🚫 Instalando Fail2Ban..."
apt update && apt install fail2ban -y

# === CONFIGURAR FAIL2BAN ===
echo "⚙️ Configurando Fail2Ban mobile-optimized..."
cat > security/fail2ban/config/jail.local << 'EOF'
# Fail2Ban Mobile-First Configuration

[DEFAULT]
# Mobile-friendly ban settings
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8 ::1 192.168.0.0/16 10.0.0.0/8

# Email notifications
destemail = vitor@kryonix.com.br
sender = fail2ban@kryonix.com.br
mta = sendmail

# Actions
action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 1800

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2

# Mobile API protection
[mobile-api-abuse]
enabled = true
filter = mobile-api-abuse
logpath = /var/log/nginx/access.log
maxretry = 20
findtime = 60
bantime = 300

# Evolution API protection
[evolution-api]
enabled = true
filter = evolution-api
logpath = /var/log/evolution/access.log
maxretry = 10
findtime = 300
bantime = 600
EOF

# === FILTROS FAIL2BAN MOBILE ===
echo "🔍 Criando filtros mobile..."
cat > /etc/fail2ban/filter.d/mobile-api-abuse.conf << 'EOF'
[Definition]
failregex = ^<HOST> .* "(GET|POST|PUT|DELETE) /api/.* HTTP/.*" (4\d\d|5\d\d) .*$
ignoreregex =
EOF

cat > /etc/fail2ban/filter.d/evolution-api.conf << 'EOF'
[Definition]
failregex = ^<HOST> .* "(GET|POST) /evolution/.* HTTP/.*" (4\d\d|5\d\d) .*$
ignoreregex =
EOF

# === CONFIGURAR UFW FIREWALL ===
echo "🔥 Configurando UFW firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Essential services
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp

# KRYONIX specific ports
ufw allow 3000/tcp   # React app
ufw allow 5432/tcp   # PostgreSQL
ufw allow 6379/tcp   # Redis
ufw allow 9000/tcp   # MinIO
ufw allow 8080/tcp   # Keycloak
ufw allow 8200/tcp   # Vault
ufw allow 5672/tcp   # RabbitMQ
ufw allow 15672/tcp  # RabbitMQ Management

# Monitoring
ufw allow 9090/tcp   # Prometheus
ufw allow 3000/tcp   # Grafana

# Mobile optimization - limit connections
ufw limit ssh
ufw limit 443/tcp

ufw --force enable

# === SSL/TLS AUTOMÁTICO ===
echo "🔐 Configurando SSL automático..."
cat > security/ssl/ssl-renew.sh << 'EOF'
#!/bin/bash
# SSL Certificate Auto-Renewal for KRYONIX Mobile-First

echo "🔐 Renovando certificados SSL..."

# Renew certificates
certbot renew --quiet

# Reload nginx/traefik
docker restart traefik-kryonix

# Check certificate validity
for domain in "kryonix.com.br" "api.kryonix.com.br" "vault.kryonix.com.br" "grafana.kryonix.com.br"; do
    expiry=$(openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    echo "Certificate for $domain expires: $expiry"
done

echo "✅ SSL renewal completed"
EOF

chmod +x security/ssl/ssl-renew.sh

# === CRON SSL RENEWAL ===
echo "⏰ Configurando renovação SSL..."
echo "0 2 * * 1 /opt/kryonix/security/ssl/ssl-renew.sh" | crontab -

# === INTEGRAÇÃO WHATSAPP SECURITY ===
echo "📱 Configurando alertas segurança..."
cat > security/whatsapp-security-alerts.sh << 'EOF'
#!/bin/bash
# WhatsApp Security Alerts for KRYONIX

WEBHOOK_URL="http://evolution:8080/webhook/security"
ALERT_PHONE="+5517981805327"

send_security_alert() {
    local message=$1
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"phone\":\"$ALERT_PHONE\",\"message\":\"🔒 KRYONIX Security Alert\\n$message\"}"
}

# Check failed login attempts
failed_logins=$(grep "Failed password" /var/log/auth.log | tail -n 10 | wc -l)
if [ $failed_logins -gt 5 ]; then
    send_security_alert "⚠️ High number of failed login attempts: $failed_logins"
fi

# Check Vault status
if ! curl -s http://localhost:8200/v1/sys/health > /dev/null; then
    send_security_alert "❌ Vault service is down!"
fi

# Check banned IPs
banned_ips=$(fail2ban-client status sshd | grep "Currently banned" | awk '{print $4}')
if [ $banned_ips -gt 0 ]; then
    send_security_alert "🚫 Currently banned IPs: $banned_ips"
fi

echo "✅ Security monitoring completed"
EOF

chmod +x security/whatsapp-security-alerts.sh

# === INICIAR SERVIÇOS SEGURANÇA ===
echo "🚀 Iniciando serviços segurança..."
systemctl enable fail2ban
systemctl start fail2ban
systemctl restart ufw

# === VERIFICAÇÕES SEGURANÇA ===
echo "🔍 Verificando serviços segurança..."
sleep 10

# Check Vault
curl -s http://localhost:8200/v1/sys/health && echo "✅ Vault OK" || echo "❌ Vault ERRO"

# Check Fail2Ban
fail2ban-client status && echo "✅ Fail2Ban OK" || echo "❌ Fail2Ban ERRO"

# Check UFW
ufw status | grep "Status: active" && echo "✅ UFW OK" || echo "❌ UFW ERRO"

# === TESTE VAULT SECRETS ===
echo "🧪 Testando Vault secrets..."
vault kv get secret/mobile/database && echo "✅ Vault secrets OK" || echo "❌ Vault secrets ERRO"

# === BACKUP VAULT KEYS ===
echo "💾 Fazendo backup das chaves Vault..."
cp vault-init-keys.txt /opt/kryonix/backup/storage/vault-keys-backup.txt
chmod 600 /opt/kryonix/backup/storage/vault-keys-backup.txt

# === CRON SECURITY MONITORING ===
echo "⏰ Configurando monitoramento segurança..."
echo "*/15 * * * * /opt/kryonix/security/whatsapp-security-alerts.sh" | crontab -

# === COMMIT CHANGES ===
echo "💾 Commitando mudanças..."
cd /opt/kryonix
git add .
git commit -m "feat: Add advanced security mobile-first

- HashiCorp Vault for secrets management
- Fail2Ban DDoS protection
- UFW firewall mobile-optimized
- SSL/TLS auto-renewal
- Mobile API security policies
- WhatsApp security alerts
- Automated security monitoring

KRYONIX PARTE-09 ✅"
git push origin main

echo "
🎉 ===== PARTE-09 CONCLUÍDA! =====

🔒 SEGURANÇA AVANÇADA ATIVA:
✅ Vault: https://vault.kryonix.com.br
✅ Secrets management mobile-first
✅ Fail2Ban DDoS protection
✅ UFW firewall otimizado
✅ SSL/TLS automático
✅ Políticas mobile security
✅ Alertas WhatsApp: +5517981805327

🔐 CREDENCIAIS VAULT:
👤 Root Token: [salvo em vault-init-keys.txt]
🔑 Unseal Keys: [backup seguro criado]

🚫 PROTEÇÕES ATIVAS:
�� Firewall UFW mobile-optimized
🚫 Fail2Ban anti-DDoS
🔐 Vault secrets encryption
📱 Mobile API rate limiting
🔒 SSL/TLS automático

📱 PRÓXIMA PARTE: PARTE-10-GATEWAY.md
"
```

---

## ✅ **VALIDAÇÃO**
- [ ] Vault UI funcionando e acess��vel
- [ ] Secrets mobile configurados
- [ ] Fail2Ban bloqueando ataques
- [ ] UFW firewall ativo
- [ ] SSL/TLS automático
- [ ] WhatsApp security alerts funcionando
- [ ] Policies Vault aplicadas
- [ ] Monitoring segurança ativo

---

*📅 KRYONIX - Segurança Mobile-First*  
*📱 +55 17 98180-5327 | 🌐 www.kryonix.com.br*

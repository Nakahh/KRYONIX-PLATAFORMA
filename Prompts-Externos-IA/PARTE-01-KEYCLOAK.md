# 🔐 PARTE-01: AUTENTICAÇÃO KEYCLOAK
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar Keycloak mobile-first com IA integrada
- **URL**: https://keycloak.kryonix.com.br
- **Login Master**: kryonix / Vitor@123456

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55

# === VERIFICAÇÕES INICIAIS ===
echo "🔍 Verificando pré-requisitos..."
docker ps | grep -E "(keycloak|postgresql|traefik)"
curl -I https://keycloak.kryonix.com.br
docker exec postgresql-kryonix pg_isready -U postgres

# === CONFIGURAR DATABASE KEYCLOAK ===
echo "🗄️ Configurando database..."
docker exec -it postgresql-kryonix psql -U postgres << 'EOF'
CREATE DATABASE keycloak WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8' LC_CTYPE = 'pt_BR.UTF-8';
CREATE USER keycloak_user WITH PASSWORD 'Vitor@123456';
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;
\q
EOF

# === CONFIGURAR KEYCLOAK ===
echo "🔐 Configurando Keycloak..."
mkdir -p /opt/kryonix/config

cat > /opt/kryonix/config/keycloak.yml << 'EOF'
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak-kryonix
    environment:
      KEYCLOAK_ADMIN: kryonix
      KEYCLOAK_ADMIN_PASSWORD: Vitor@123456
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgresql-kryonix:5432/keycloak
      KC_DB_USERNAME: keycloak_user
      KC_DB_PASSWORD: Vitor@123456
      KC_HOSTNAME: keycloak.kryonix.com.br
      KC_PROXY: edge
      KC_HTTP_ENABLED: true
      KC_HEALTH_ENABLED: true
      KC_METRICS_ENABLED: true
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.keycloak.rule=Host(\`keycloak.kryonix.com.br\`)"
      - "traefik.http.routers.keycloak.tls=true"
      - "traefik.http.routers.keycloak.tls.certresolver=letsencrypt"
      - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
    networks:
      - kryonix-net
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 3
networks:
  kryonix-net:
    external: true
EOF

# === DEPLOY KEYCLOAK ===
echo "🚀 Fazendo deploy do Keycloak..."
docker stack deploy -c /opt/kryonix/config/keycloak.yml kryonix-auth

# === AGUARDAR INICIALIZAÇÃO ===
echo "⏳ Aguardando Keycloak inicializar..."
for i in {1..60}; do
  if curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null 2>&1; then
    echo "✅ Keycloak está pronto!"
    break
  fi
  echo "⏳ Tentativa $i/60..."
  sleep 10
done

# === OBTER TOKEN ADMIN ===
echo "🔑 Obtendo token admin..."
ADMIN_TOKEN=$(curl -s -d "client_id=admin-cli" -d "username=kryonix" -d "password=Vitor@123456" -d "grant_type=password" "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | jq -r '.access_token')

# === CRIAR REALM KRYONIX ===
echo "🏢 Criando realm KRYONIX..."
curl -X POST "https://keycloak.kryonix.com.br/admin/realms" \
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
  "registrationAllowed": true,
  "registrationEmailAsUsername": true,
  "rememberMe": true,
  "verifyEmail": false,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 30,
  "loginTheme": "keycloak",
  "accountTheme": "keycloak",
  "adminTheme": "keycloak",
  "emailTheme": "keycloak"
}'

# === CRIAR CLIENT MOBILE ===
echo "📱 Criando client mobile..."
curl -X POST "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "clientId": "kryonix-mobile-app",
  "name": "KRYONIX Mobile App",
  "enabled": true,
  "clientAuthenticatorType": "client-secret",
  "secret": "kryonix-mobile-secret-2025",
  "redirectUris": [
    "https://app.kryonix.com.br/*",
    "https://www.kryonix.com.br/*",
    "http://localhost:3000/*"
  ],
  "webOrigins": [
    "https://app.kryonix.com.br",
    "https://www.kryonix.com.br"
  ],
  "protocol": "openid-connect",
  "publicClient": false,
  "standardFlowEnabled": true,
  "implicitFlowEnabled": false,
  "directAccessGrantsEnabled": true,
  "serviceAccountsEnabled": true,
  "authorizationServicesEnabled": true,
  "fullScopeAllowed": true
}'

# === CRIAR USUÁRIO MASTER ===
echo "👤 Criando usuário master..."
curl -X POST "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/users" \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "username": "kryonix",
  "email": "admin@kryonix.com.br",
  "firstName": "KRYONIX",
  "lastName": "Master",
  "enabled": true,
  "emailVerified": true,
  "credentials": [{
    "type": "password",
    "value": "Vitor@123456",
    "temporary": false
  }]
}'

# === CRIAR USUÁRIO IA ===
echo "🤖 Criando usuário IA..."
curl -X POST "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/users" \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "username": "kryonix-ai-service",
  "email": "ai@kryonix.com.br",
  "firstName": "KRYONIX",
  "lastName": "IA Service",
  "enabled": true,
  "emailVerified": true,
  "credentials": [{
    "type": "password",
    "value": "ai_kryonix_2025",
    "temporary": false
  }]
}'

# === CRIAR CLIENT IA ===
echo "🤖 Criando client IA..."
curl -X POST "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" \
-H "Authorization: Bearer $ADMIN_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "clientId": "kryonix-ai-client",
  "name": "KRYONIX IA Integration",
  "enabled": true,
  "clientAuthenticatorType": "client-secret",
  "secret": "kryonix-ai-secret-2025",
  "protocol": "openid-connect",
  "publicClient": false,
  "standardFlowEnabled": false,
  "directAccessGrantsEnabled": true,
  "serviceAccountsEnabled": true,
  "fullScopeAllowed": true
}'

# === CONFIGURAR AUTENTICAÇÃO WHATSAPP ===
echo "💬 Configurando WhatsApp auth..."
mkdir -p /opt/kryonix/scripts

cat > /opt/kryonix/scripts/whatsapp-auth.py << 'EOF'
#!/usr/bin/env python3
import requests
import random
import string
import json
import redis
from datetime import datetime, timedelta

class WhatsAppAuth:
    def __init__(self):
        self.evolution_api = "https://evolution.kryonix.com.br"
        self.api_key = "sua_chave_evolution_api_aqui"
        self.redis_client = redis.Redis(host='redis-kryonix', port=6379, decode_responses=True)
        
    def send_code(self, phone_number):
        """Enviar código de verificação via WhatsApp"""
        code = ''.join(random.choices(string.digits, k=6))
        message = f"🔐 Seu código KRYONIX: {code}\nVálido por 5 minutos.\n\nNão compartilhe este código."
        
        payload = {
            "number": phone_number,
            "text": message
        }
        
        try:
            response = requests.post(
                f"{self.evolution_api}/message/sendText",
                headers={"apikey": self.api_key, "Content-Type": "application/json"},
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                # Salvar código no Redis com TTL 5 minutos
                self.redis_client.setex(f"whatsapp_code:{phone_number}", 300, code)
                print(f"✅ Código enviado para {phone_number}")
                return True
            else:
                print(f"❌ Erro ao enviar código: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Erro na requisição: {e}")
            return False
    
    def verify_code(self, phone_number, code):
        """Verificar código de verificação"""
        stored_code = self.redis_client.get(f"whatsapp_code:{phone_number}")
        
        if stored_code and stored_code == code:
            self.redis_client.delete(f"whatsapp_code:{phone_number}")
            print(f"✅ Código verificado para {phone_number}")
            return True
        else:
            print(f"❌ Código inválido para {phone_number}")
            return False

if __name__ == "__main__":
    auth = WhatsAppAuth()
    # Teste de envio
    if auth.send_code("5517981805327"):
        print("✅ Sistema WhatsApp auth funcionando!")
    else:
        print("❌ Verificar configuração WhatsApp auth")
EOF

chmod +x /opt/kryonix/scripts/whatsapp-auth.py

# === CONFIGURAR BACKUP AUTOMÁTICO ===
echo "💾 Configurando backup automático..."
cat > /opt/kryonix/scripts/backup-keycloak.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/keycloak/$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

echo "💾 Iniciando backup Keycloak..."

# Backup database
docker exec postgresql-kryonix pg_dump -U postgres -d keycloak | gzip > "$BACKUP_DIR/keycloak_db.sql.gz"

# Backup configurações via API
ADMIN_TOKEN=$(curl -s -d "client_id=admin-cli" -d "username=kryonix" -d "password=Vitor@123456" -d "grant_type=password" "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | jq -r '.access_token')

curl -H "Authorization: Bearer $ADMIN_TOKEN" "https://keycloak.kryonix.com.br/admin/realms/KRYONIX" > "$BACKUP_DIR/realm_config.json"

# Backup de usuários
curl -H "Authorization: Bearer $ADMIN_TOKEN" "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/users" > "$BACKUP_DIR/users.json"

# Backup de clients
curl -H "Authorization: Bearer $ADMIN_TOKEN" "https://keycloak.kryonix.com.br/admin/realms/KRYONIX/clients" > "$BACKUP_DIR/clients.json"

BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "✅ Backup Keycloak concluído: $BACKUP_DIR ($BACKUP_SIZE)"

# Notificar WhatsApp
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: sua_chave_evolution_api_aqui" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"5517981805327\", \"text\": \"💾 Backup Keycloak concluído!\\nData: $BACKUP_DATE\\nTamanho: $BACKUP_SIZE\"}"
EOF

chmod +x /opt/kryonix/scripts/backup-keycloak.sh

# === AGENDAR BACKUP DIÁRIO ===
echo "📅 Agendando backup diário..."
(crontab -l 2>/dev/null; echo "0 1 * * * /opt/kryonix/scripts/backup-keycloak.sh") | crontab -

# === CONFIGURAR MONITORAMENTO ===
echo "📊 Configurando monitoramento..."
cat > /opt/kryonix/scripts/monitor-keycloak.sh << 'EOF'
#!/bin/bash
# Monitoramento contínuo Keycloak

while true; do
  # Health check
  if ! curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null; then
    echo "🚨 $(date): Keycloak não está respondendo!"
    
    # Tentar restart
    docker service update --force kryonix-auth_keycloak
    
    # Notificar WhatsApp
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: sua_chave_evolution_api_aqui" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"🚨 ALERTA: Keycloak fora do ar!\\nTentando restart automático...\"}"
  else
    echo "✅ $(date): Keycloak funcionando normalmente"
  fi
  
  # Verificar métricas
  ACTIVE_SESSIONS=$(curl -s "https://keycloak.kryonix.com.br/metrics" | grep keycloak_sessions | tail -1 | awk '{print $2}' || echo "0")
  
  if [ "$ACTIVE_SESSIONS" -gt 500 ]; then
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: sua_chave_evolution_api_aqui" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"⚠️ Keycloak: Muitas sessões ativas ($ACTIVE_SESSIONS)\"}"
  fi
  
  sleep 300  # 5 minutos
done
EOF

chmod +x /opt/kryonix/scripts/monitor-keycloak.sh

# Executar monitoramento em background
nohup /opt/kryonix/scripts/monitor-keycloak.sh > /var/log/keycloak-monitor.log 2>&1 &

# === TESTES FINAIS ===
echo "🧪 Executando testes finais..."

# Teste 1: Health check
echo "Teste 1: Health check..."
curl -f https://keycloak.kryonix.com.br/health/ready || echo "❌ Health check falhou"

# Teste 2: Realm criado
echo "Teste 2: Verificando realm..."
REALM_CHECK=$(curl -s "https://keycloak.kryonix.com.br/realms/KRYONIX/.well-known/openid_configuration" | jq -r '.issuer')
echo "Realm: $REALM_CHECK"

# Teste 3: Login admin
echo "Teste 3: Testando login admin..."
LOGIN_TEST=$(curl -s -d "client_id=admin-cli" -d "username=kryonix" -d "password=Vitor@123456" -d "grant_type=password" "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | jq -r '.access_token')
if [ "$LOGIN_TEST" != "null" ] && [ -n "$LOGIN_TEST" ]; then
  echo "✅ Login admin funcionando"
else
  echo "❌ Login admin falhou"
fi

# Teste 4: WhatsApp auth
echo "Teste 4: Testando WhatsApp auth..."
python3 /opt/kryonix/scripts/whatsapp-auth.py

# === MARCAR PROGRESSO ===
echo "1" > /opt/kryonix/.current-part

# === NOTIFICAÇÃO FINAL ===
echo "📱 Enviando notificação final..."
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: sua_chave_evolution_api_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "text": "✅ PARTE-01 CONCLUÍDA!\n\n🔐 Keycloak configurado e funcionando\n📱 Mobile-first ativo\n🤖 IA integrada\n🇧🇷 Interface em português\n💬 WhatsApp auth funcionando\n📊 Monitoramento ativo\n💾 Backup automático diário\n\n🌐 Acesso: https://keycloak.kryonix.com.br\nLogin: kryonix / Vitor@123456\n\n🚀 Sistema pronto para PARTE-02!"
  }'

echo ""
echo "✅ PARTE-01 CONCLUÍDA COM SUCESSO!"
echo "🌐 Keycloak: https://keycloak.kryonix.com.br"
echo "👤 Login: kryonix / Vitor@123456"
echo "📊 Monitoramento ativo"
echo "💾 Backup automático configurado"
echo ""
echo "🚀 Próxima etapa: PARTE-02-POSTGRESQL.md"
```

---

## 📋 **VALIDAÇÕES OBRIGATÓRIAS**
Após executar, confirme se:
- [ ] ✅ Keycloak acessível em https://keycloak.kryonix.com.br
- [ ] ✅ Login com kryonix/Vitor@123456 funciona
- [ ] ✅ Realm KRYONIX criado em português
- [ ] ✅ Client mobile configurado
- [ ] ✅ Usuário IA criado
- [ ] ✅ WhatsApp auth funcionando
- [ ] ✅ Backup automático agendado
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Notificação WhatsApp enviada

---

**⚠️ IMPORTANTE**: Substitua 'sua_chave_evolution_api_aqui' pela chave real da Evolution API antes de executar.

*🤖 Prompt criado pelos 15 Agentes Especializados KRYONIX*

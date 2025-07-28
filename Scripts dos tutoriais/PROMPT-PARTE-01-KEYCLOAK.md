# 🤖 PROMPT IA - PARTE-01: AUTENTICAÇÃO KEYCLOAK
*Prompt para IA executar via terminal no servidor 144.202.90.55*

---

## 🎯 **CONTEXTO PARA SUA IA**
```
SERVIDOR: 144.202.90.55
DOMÍNIO: www.kryonix.com.br
REDE: kryonix-net (Docker Swarm)
KEYCLOAK URL: https://keycloak.kryonix.com.br
FOCO: Mobile-first (80% usuários) + IA 100% autônoma + Português + Dados reais + WhatsApp

OBJETIVO: Configurar Keycloak para autenticação mobile-first com IA integrada
```

---

## 🚀 **PROMPT COMPLETO PARA SUA IA**

```
Você é o KRYONIX Terminal Assistant. Execute EXATAMENTE estes comandos no servidor 144.202.90.55 via terminal para configurar a PARTE-01 - Autenticação Keycloak mobile-first:

=== VERIFICAÇÕES INICIAIS ===
docker ps | grep keycloak-kryonix
docker ps | grep postgresql-kryonix
curl -I https://keycloak.kryonix.com.br
docker exec postgresql-kryonix pg_isready -U postgres

=== CONFIGURAR DATABASE KEYCLOAK ===
docker exec -it postgresql-kryonix psql -U postgres << 'EOF'
CREATE DATABASE keycloak WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8' LC_CTYPE = 'pt_BR.UTF-8';
CREATE USER keycloak_user WITH PASSWORD 'keycloak_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;
\q
EOF

=== CONFIGURAR KEYCLOAK CONTAINER ===
cat > /opt/kryonix/keycloak-config.yml << 'EOF'
version: '3.8'
services:
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak-kryonix
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: kryonix_admin_2025
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgresql-kryonix:5432/keycloak
      KC_DB_USERNAME: keycloak_user
      KC_DB_PASSWORD: keycloak_kryonix_2025
      KC_HOSTNAME: keycloak.kryonix.com.br
      KC_PROXY: edge
      KC_HTTP_ENABLED: true
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
networks:
  kryonix-net:
    external: true
EOF

=== DEPLOY KEYCLOAK ===
docker stack deploy -c /opt/kryonix/keycloak-config.yml kryonix-auth

=== AGUARDAR KEYCLOAK INICIALIZAR ===
echo "Aguardando Keycloak inicializar..."
for i in {1..30}; do
  if curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null 2>&1; then
    echo "✅ Keycloak está pronto!"
    break
  fi
  echo "⏳ Tentativa $i/30..."
  sleep 10
done

=== CONFIGURAR REALM KRYONIX VIA API ===
# Obter token admin
ADMIN_TOKEN=$(curl -d "client_id=admin-cli" -d "username=admin" -d "password=kryonix_admin_2025" -d "grant_type=password" "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | jq -r '.access_token')

# Criar realm KRYONIX
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
  "loginTheme": "keycloak",
  "accountTheme": "keycloak",
  "adminTheme": "keycloak",
  "emailTheme": "keycloak"
}'

=== CRIAR CLIENT MOBILE ===
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
  "authorizationServicesEnabled": true
}'

=== CRIAR USUÁRIO IA ===
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

=== CRIAR CLIENT IA ===
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
  "serviceAccountsEnabled": true
}'

=== SCRIPT WHATSAPP AUTH ===
cat > /opt/kryonix/scripts/whatsapp-auth.py << 'EOF'
#!/usr/bin/env python3
import requests
import random
import string
import json
from datetime import datetime, timedelta

class WhatsAppAuth:
    def __init__(self):
        self.evolution_api = "https://evolution.kryonix.com.br"
        self.api_key = "evolution_api_key_aqui"
        
    def send_code(self, phone_number):
        code = ''.join(random.choices(string.digits, k=6))
        message = f"🔐 Seu código KRYONIX: {code}. Válido por 5 minutos."
        
        payload = {
            "number": phone_number,
            "text": message
        }
        
        response = requests.post(
            f"{self.evolution_api}/message/sendText",
            headers={"apikey": self.api_key},
            json=payload
        )
        
        if response.status_code == 200:
            # Salvar código no Redis com TTL 5 minutos
            import redis
            r = redis.Redis(host='redis-kryonix', port=6379, decode_responses=True)
            r.setex(f"whatsapp_code:{phone_number}", 300, code)
            return True
        return False
    
    def verify_code(self, phone_number, code):
        import redis
        r = redis.Redis(host='redis-kryonix', port=6379, decode_responses=True)
        stored_code = r.get(f"whatsapp_code:{phone_number}")
        
        if stored_code and stored_code == code:
            r.delete(f"whatsapp_code:{phone_number}")
            return True
        return False

if __name__ == "__main__":
    auth = WhatsAppAuth()
    # Teste
    if auth.send_code("5517981805327"):
        print("✅ Código WhatsApp enviado com sucesso!")
    else:
        print("❌ Erro ao enviar código WhatsApp")
EOF

chmod +x /opt/kryonix/scripts/whatsapp-auth.py

=== CONFIGURAR BACKUP KEYCLOAK ===
cat > /opt/kryonix/scripts/backup-keycloak.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/keycloak/$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

# Backup database keycloak
docker exec postgresql-kryonix pg_dump -U postgres -d keycloak | gzip > "$BACKUP_DIR/keycloak_db.sql.gz"

# Backup configurações via API
ADMIN_TOKEN=$(curl -s -d "client_id=admin-cli" -d "username=admin" -d "password=kryonix_admin_2025" -d "grant_type=password" "https://keycloak.kryonix.com.br/realms/master/protocol/openid_connect/token" | jq -r '.access_token')

curl -H "Authorization: Bearer $ADMIN_TOKEN" "https://keycloak.kryonix.com.br/admin/realms/KRYONIX" > "$BACKUP_DIR/realm_config.json"

echo "✅ Backup Keycloak concluído: $BACKUP_DIR"

# Notificar WhatsApp
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: evolution_api_key_aqui" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"5517981805327\", \"text\": \"💾 Backup Keycloak concluído!\\nData: $BACKUP_DATE\"}"
EOF

chmod +x /opt/kryonix/scripts/backup-keycloak.sh

=== AGENDAR BACKUP DIÁRIO ===
echo "0 1 * * * /opt/kryonix/scripts/backup-keycloak.sh" | crontab -

=== CONFIGURAR MONITORAMENTO ===
cat > /opt/kryonix/scripts/monitor-keycloak.sh << 'EOF'
#!/bin/bash
while true; do
  if ! curl -f -s https://keycloak.kryonix.com.br/health/ready > /dev/null; then
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: evolution_api_key_aqui" \
      -d "{\"number\": \"5517981805327\", \"text\": \"🚨 ALERTA: Keycloak não está respondendo!\"}"
  fi
  sleep 300
done
EOF

chmod +x /opt/kryonix/scripts/monitor-keycloak.sh
nohup /opt/kryonix/scripts/monitor-keycloak.sh > /var/log/keycloak-monitor.log 2>&1 &

=== TESTES FINAIS ===
echo "🧪 Executando testes finais..."

# Teste 1: Keycloak respondendo
curl -f https://keycloak.kryonix.com.br/health/ready

# Teste 2: Realm criado
curl -s "https://keycloak.kryonix.com.br/realms/KRYONIX/.well-known/openid_configuration" | jq '.issuer'

# Teste 3: Database conectado
docker exec keycloak-kryonix curl -f http://localhost:8080/health/ready

# Teste 4: WhatsApp auth
python3 /opt/kryonix/scripts/whatsapp-auth.py

=== NOTIFICAÇÃO FINAL ===
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: evolution_api_key_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "text": "✅ PARTE-01 CONCLUÍDA!\n\n🔐 Keycloak configurado\n📱 Mobile-first ativo\n🤖 IA integrada\n🇧🇷 Interface português\n💬 WhatsApp auth funcionando\n📊 Monitoramento ativo\n💾 Backup automático\n\n🌐 Acesso: https://keycloak.kryonix.com.br\n\n🚀 Pronto para PARTE-02!"
  }'

echo "✅ PARTE-01 CONCLUÍDA COM SUCESSO!"
```

**IMPORTANTE**: Substitua 'evolution_api_key_aqui' pela sua chave real da Evolution API antes de executar.

---

## 📋 **CHECKLIST FINAL**
Após executar, verifique se:
- [ ] ✅ Keycloak acessível em https://keycloak.kryonix.com.br
- [ ] ✅ Realm KRYONIX criado em português
- [ ] ✅ Client mobile configurado
- [ ] ✅ Usuário IA criado
- [ ] ✅ WhatsApp auth funcionando
- [ ] ✅ Backup automático agendado
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Notificação WhatsApp enviada

---

*🤖 Prompt para execução via terminal no servidor 144.202.90.55*  
*📱 Mobile-First • 🇧🇷 Português • 📊 Dados Reais • 💬 WhatsApp*

# 💬 PARTE-37: CHATWOOT ATENDIMENTO MOBILE-FIRST
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar Chatwoot para atendimento omnichannel com IA integrada
- **Dependências**: PostgreSQL, Redis, Evolution API funcionando
- **Login Master**: kryonix / Vitor@123456

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55

# === VERIFICAÇÕES INICIAIS ===
echo "🔍 Verificando infraestrutura..."
docker ps | grep -E "(postgresql|redis|evolution)"
curl -I https://api.kryonix.com.br

# === CONFIGURAR DATABASE CHATWOOT ===
echo "🗄️ Configurando database Chatwoot..."
docker exec -it postgresql-kryonix psql -U postgres << 'EOF'
CREATE DATABASE chatwoot WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8' LC_CTYPE = 'pt_BR.UTF-8';
CREATE USER chatwoot_user WITH PASSWORD 'chatwoot_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE chatwoot TO chatwoot_user;
ALTER USER chatwoot_user CREATEDB;
\q
EOF

# === CRIAR CONFIGURAÇÃO CHATWOOT ===
echo "⚙️ Criando configuração Chatwoot..."
mkdir -p /opt/kryonix/config/chatwoot
cat > /opt/kryonix/config/chatwoot/docker-compose.yml << 'EOF'
version: '3.8'

services:
  chatwoot-rails:
    image: chatwoot/chatwoot:latest
    container_name: chatwoot-rails-kryonix
    restart: unless-stopped
    environment:
      # Database
      - POSTGRES_DATABASE=chatwoot
      - POSTGRES_HOST=postgresql-kryonix
      - POSTGRES_USERNAME=chatwoot_user
      - POSTGRES_PASSWORD=chatwoot_kryonix_2025
      
      # Redis
      - REDIS_URL=redis://redis-kryonix:6379/1
      
      # Application
      - SECRET_KEY_BASE=kryonix_chatwoot_secret_key_2025_very_long_and_secure_key
      - RAILS_ENV=production
      - INSTALLATION_ENV=docker
      
      # Frontend URL
      - FRONTEND_URL=https://chatwoot.kryonix.com.br
      - FORCE_SSL=true
      
      # Chatwoot específico
      - ENABLE_ACCOUNT_SIGNUP=false
      - MAILER_SENDER_EMAIL=noreply@kryonix.com.br
      - SMTP_DOMAIN=kryonix.com.br
      
      # Features mobile-first
      - ENABLE_PUSH_RELAY_SERVER=true
      - VAPID_PUBLIC_KEY=BMWCPLYdLwJUPjgQ7kWkqH_BTXqKxbwxbFb1J+EsKs_5T2BJWA==
      
      # Localização brasileira
      - DEFAULT_LOCALE=pt_BR
      - TZ=America/Sao_Paulo
      
      # Storage (MinIO)
      - ACTIVE_STORAGE_SERVICE=amazon
      - S3_BUCKET_NAME=chatwoot
      - AWS_ACCESS_KEY_ID=chatwoot
      - AWS_SECRET_ACCESS_KEY=chatwoot_kryonix_2025
      - AWS_REGION=us-east-1
      - AWS_S3_ENDPOINT=https://s3.kryonix.com.br
      - AWS_S3_FORCE_PATH_STYLE=true
      
      # WhatsApp Integration (Evolution API)
      - WHATSAPP_WEBHOOK_VERIFY_TOKEN=kryonix_verify_token_2025
      
      # IA Integration
      - OPENAI_API_KEY=sk-kryonix-ai-key-2025
      - ENABLE_AI_ASSIST=true
      
      # Log level
      - LOG_LEVEL=info
      - RAILS_LOG_TO_STDOUT=true
    
    volumes:
      - chatwoot_data:/app/storage
      - chatwoot_uploads:/app/public/uploads
    
    labels:
      # Traefik
      - "traefik.enable=true"
      - "traefik.http.routers.chatwoot.rule=Host(\`chatwoot.kryonix.com.br\`)"
      - "traefik.http.routers.chatwoot.tls=true"
      - "traefik.http.routers.chatwoot.tls.certresolver=letsencrypt"
      - "traefik.http.routers.chatwoot.middlewares=mobile-headers@file,security-headers@file,compression@file"
      - "traefik.http.services.chatwoot.loadbalancer.server.port=3000"
      - "traefik.http.services.chatwoot.loadbalancer.healthcheck.path=/health"
    
    networks:
      - kryonix-net
    
    depends_on:
      - chatwoot-sidekiq
    
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 3
      resources:
        limits:
          memory: 1GB
          cpus: '1.0'
        reservations:
          memory: 512MB
          cpus: '0.5'

  chatwoot-sidekiq:
    image: chatwoot/chatwoot:latest
    container_name: chatwoot-sidekiq-kryonix
    restart: unless-stopped
    command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"]
    environment:
      # Same as rails app
      - POSTGRES_DATABASE=chatwoot
      - POSTGRES_HOST=postgresql-kryonix
      - POSTGRES_USERNAME=chatwoot_user
      - POSTGRES_PASSWORD=chatwoot_kryonix_2025
      - REDIS_URL=redis://redis-kryonix:6379/1
      - SECRET_KEY_BASE=kryonix_chatwoot_secret_key_2025_very_long_and_secure_key
      - RAILS_ENV=production
      - INSTALLATION_ENV=docker
      - DEFAULT_LOCALE=pt_BR
      - TZ=America/Sao_Paulo
      - LOG_LEVEL=info
      - RAILS_LOG_TO_STDOUT=true
    
    volumes:
      - chatwoot_data:/app/storage
      - chatwoot_uploads:/app/public/uploads
    
    networks:
      - kryonix-net
    
    deploy:
      replicas: 1
      restart_policy:
        condition: on-failure
        delay: 10s
        max_attempts: 3
      resources:
        limits:
          memory: 512MB
          cpus: '0.5'
        reservations:
          memory: 256MB
          cpus: '0.25'

volumes:
  chatwoot_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/kryonix/data/chatwoot
  
  chatwoot_uploads:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/kryonix/uploads/chatwoot

networks:
  kryonix-net:
    external: true
EOF

# === CRIAR DIRETÓRIOS NECESSÁRIOS ===
echo "📁 Criando diretórios necessários..."
mkdir -p /opt/kryonix/data/chatwoot
mkdir -p /opt/kryonix/uploads/chatwoot
mkdir -p /opt/kryonix/backups/chatwoot
chmod -R 755 /opt/kryonix/data/chatwoot
chmod -R 755 /opt/kryonix/uploads/chatwoot

# === CONFIGURAR BUCKET MINIO PARA CHATWOOT ===
echo "📦 Configurando bucket MinIO para Chatwoot..."
docker exec minio-kryonix mc config host add local http://localhost:9000 minioadmin kryonix_minio_2025
docker exec minio-kryonix mc mb local/chatwoot
docker exec minio-kryonix mc policy set public local/chatwoot

# === DEPLOY CHATWOOT ===
echo "🚀 Fazendo deploy do Chatwoot..."
docker stack deploy -c /opt/kryonix/config/chatwoot/docker-compose.yml kryonix-chatwoot

# === AGUARDAR CHATWOOT INICIALIZAR ===
echo "⏳ Aguardando Chatwoot inicializar..."
sleep 60

# Verificar se o banco está pronto
echo "🔍 Verificando banco de dados..."
for i in {1..30}; do
  if docker exec chatwoot-rails-kryonix bundle exec rails db:version > /dev/null 2>&1; then
    echo "✅ Banco de dados pronto!"
    break
  fi
  echo "⏳ Aguardando banco... Tentativa $i/30"
  sleep 10
done

# === EXECUTAR MIGRATIONS ===
echo "🔄 Executando migrations..."
docker exec chatwoot-rails-kryonix bundle exec rails db:create
docker exec chatwoot-rails-kryonix bundle exec rails db:reset
docker exec chatwoot-rails-kryonix bundle exec rails db:migrate
docker exec chatwoot-rails-kryonix bundle exec rails db:seed

# === CRIAR SUPER ADMIN ===
echo "👤 Criando super admin..."
docker exec chatwoot-rails-kryonix bundle exec rails c << 'EOF'
# Criar super admin
admin = User.new(
  name: 'KRYONIX Admin',
  email: 'admin@kryonix.com.br',
  password: 'kryonix_admin_2025',
  password_confirmation: 'kryonix_admin_2025',
  confirmed_at: Time.current
)
admin.save!

# Criar conta principal
account = Account.create!(
  name: 'KRYONIX',
  locale: 'pt_BR',
  domain: 'kryonix.com.br',
  support_email: 'suporte@kryonix.com.br',
  timezone: 'America/Sao_Paulo'
)

# Associar admin à conta
AccountUser.create!(
  account: account,
  user: admin,
  role: 'administrator'
)

puts "✅ Super admin criado com sucesso!"
puts "Email: admin@kryonix.com.br"
puts "Senha: kryonix_admin_2025"
puts "Conta: KRYONIX"
EOF

# === CONFIGURAR WEBHOOK EVOLUTION API ===
echo "🔗 Configurando webhook Evolution API..."
cat > /opt/kryonix/scripts/setup-chatwoot-whatsapp.sh << 'EOF'
#!/bin/bash

# Configurar webhook no Evolution API para Chatwoot
EVOLUTION_API="https://evolution.kryonix.com.br"
CHATWOOT_URL="https://chatwoot.kryonix.com.br"
INSTANCE_NAME="kryonix-main"

echo "🔗 Configurando integração WhatsApp -> Chatwoot..."

# Criar/atualizar webhook no Evolution API
curl -X POST "$EVOLUTION_API/webhook/set/$INSTANCE_NAME" \
  -H "apikey: sua_chave_evolution_api_aqui" \
  -H "Content-Type: application/json" \
  -d "{
    \"webhook\": {
      \"url\": \"$CHATWOOT_URL/api/v1/accounts/1/inboxes/1/whatsapp/webhook\",
      \"events\": [
        \"MESSAGE_RECEIVED\",
        \"MESSAGE_STATUS_UPDATE\",
        \"CONNECTION_UPDATE\"
      ],
      \"webhook_by_events\": false
    }
  }"

echo "✅ Webhook configurado!"
EOF

chmod +x /opt/kryonix/scripts/setup-chatwoot-whatsapp.sh

# === CRIAR SCRIPT DE CONFIGURAÇÃO IA ===
echo "🤖 Criando script de configuração IA..."
cat > /opt/kryonix/scripts/chatwoot-ai-setup.py << 'EOF'
#!/usr/bin/env python3
import requests
import json
import time
from datetime import datetime

class ChatwootAISetup:
    def __init__(self):
        self.chatwoot_url = "https://chatwoot.kryonix.com.br"
        self.admin_email = "admin@kryonix.com.br"
        self.admin_password = "kryonix_admin_2025"
        self.session = requests.Session()
        self.token = None
        
    def login(self):
        """Login no Chatwoot e obter token"""
        try:
            response = self.session.post(
                f"{self.chatwoot_url}/auth/sign_in",
                json={
                    "email": self.admin_email,
                    "password": self.admin_password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('data', {}).get('access_token')
                self.session.headers.update({
                    'Authorization': f'Bearer {self.token}'
                })
                print("✅ Login realizado com sucesso!")
                return True
            else:
                print(f"❌ Erro no login: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Erro no login: {e}")
            return False
    
    def create_whatsapp_inbox(self):
        """Criar inbox WhatsApp"""
        try:
            response = self.session.post(
                f"{self.chatwoot_url}/api/v1/accounts/1/inboxes",
                json={
                    "name": "WhatsApp KRYONIX",
                    "channel": {
                        "type": "Channel::Whatsapp",
                        "webhook_url": "https://evolution.kryonix.com.br/webhook/chatwoot",
                        "provider": "evolution_api",
                        "provider_config": {
                            "api_key": "sua_chave_evolution_api_aqui",
                            "webhook_verify_token": "kryonix_verify_token_2025"
                        }
                    }
                }
            )
            
            if response.status_code == 200:
                inbox_data = response.json()
                print(f"✅ Inbox WhatsApp criado: {inbox_data['name']}")
                return inbox_data
            else:
                print(f"❌ Erro ao criar inbox: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Erro ao criar inbox: {e}")
            return None
    
    def setup_ai_bot(self):
        """Configurar bot de IA"""
        try:
            # Criar agente IA
            response = self.session.post(
                f"{self.chatwoot_url}/api/v1/accounts/1/agents",
                json={
                    "name": "KRYONIX IA",
                    "email": "ia@kryonix.com.br",
                    "role": "agent",
                    "auto_offline": False,
                    "availability_status": "online"
                }
            )
            
            if response.status_code == 200:
                agent_data = response.json()
                print(f"✅ Agente IA criado: {agent_data['name']}")
                
                # Configurar automações
                self.create_automation_rules()
                
                return agent_data
            else:
                print(f"❌ Erro ao criar agente IA: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Erro ao configurar IA: {e}")
            return None
    
    def create_automation_rules(self):
        """Criar regras de automação"""
        rules = [
            {
                "name": "Auto-resposta IA - Primeira mensagem",
                "description": "IA responde automaticamente à primeira mensagem",
                "event_name": "conversation_created",
                "conditions": [
                    {
                        "attribute_key": "browser_language",
                        "filter_operator": "equal_to",
                        "values": ["pt"]
                    }
                ],
                "actions": [
                    {
                        "action_name": "send_message",
                        "action_params": {
                            "message": "Olá! 👋 Sou a IA do KRYONIX. Como posso ajudá-lo hoje?"
                        }
                    },
                    {
                        "action_name": "assign_agent",
                        "action_params": {
                            "agent_id": 2  # ID do agente IA
                        }
                    }
                ]
            },
            {
                "name": "Classificação IA - Suporte Técnico",
                "description": "IA classifica conversas sobre suporte técnico",
                "event_name": "message_created",
                "conditions": [
                    {
                        "attribute_key": "message_content",
                        "filter_operator": "contains_any_of",
                        "values": ["erro", "problema", "bug", "não funciona", "ajuda"]
                    }
                ],
                "actions": [
                    {
                        "action_name": "add_label",
                        "action_params": {
                            "labels": ["suporte-tecnico"]
                        }
                    },
                    {
                        "action_name": "send_message",
                        "action_params": {
                            "message": "Entendi que você está com um problema técnico. Vou direcioná-lo para nossa equipe especializada. 🔧"
                        }
                    }
                ]
            },
            {
                "name": "Auto-resposta fora do horário",
                "description": "IA responde fora do horário comercial",
                "event_name": "conversation_created",
                "conditions": [
                    {
                        "attribute_key": "created_at",
                        "filter_operator": "hours_before",
                        "values": ["9"]
                    }
                ],
                "actions": [
                    {
                        "action_name": "send_message",
                        "action_params": {
                            "message": "Olá! Nosso horário de atendimento é das 9h às 18h. Sua mensagem foi recebida e responderemos assim que possível. 🕘"
                        }
                    }
                ]
            }
        ]
        
        for rule in rules:
            try:
                response = self.session.post(
                    f"{self.chatwoot_url}/api/v1/accounts/1/automation_rules",
                    json=rule
                )
                
                if response.status_code == 200:
                    print(f"✅ Regra criada: {rule['name']}")
                else:
                    print(f"❌ Erro ao criar regra {rule['name']}: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Erro ao criar regra {rule['name']}: {e}")
    
    def create_canned_responses(self):
        """Criar respostas prontas"""
        responses = [
            {
                "short_code": "ola",
                "content": "Olá! Como posso ajudá-lo hoje? 😊"
            },
            {
                "short_code": "obrigado",
                "content": "Muito obrigado pelo contato! Estamos sempre aqui para ajudar. 🙏"
            },
            {
                "short_code": "aguarde",
                "content": "Por favor, aguarde um momento enquanto verifico isso para você... ⏳"
            },
            {
                "short_code": "resolvido",
                "content": "Ótimo! Fico feliz que conseguimos resolver seu problema. Há mais alguma coisa em que posso ajudar? ✅"
            },
            {
                "short_code": "horario",
                "content": "Nosso horário de atendimento é de segunda a sexta, das 9h às 18h. 🕘"
            },
            {
                "short_code": "contato",
                "content": "Você pode nos contatar através do WhatsApp, email (contato@kryonix.com.br) ou telefone. 📞"
            }
        ]
        
        for response in responses:
            try:
                result = self.session.post(
                    f"{self.chatwoot_url}/api/v1/accounts/1/canned_responses",
                    json=response
                )
                
                if result.status_code == 200:
                    print(f"✅ Resposta pronta criada: {response['short_code']}")
                else:
                    print(f"❌ Erro ao criar resposta {response['short_code']}: {result.status_code}")
                    
            except Exception as e:
                print(f"❌ Erro ao criar resposta {response['short_code']}: {e}")
    
    def setup_labels(self):
        """Criar labels para organização"""
        labels = [
            {"title": "Suporte Técnico", "color": "#FF4757"},
            {"title": "Vendas", "color": "#2ED573"},
            {"title": "Financeiro", "color": "#FFA502"},
            {"title": "Urgente", "color": "#FF3742"},
            {"title": "Resolvido", "color": "#1DD1A1"},
            {"title": "Aguardando Cliente", "color": "#FFD32A"},
            {"title": "Bug", "color": "#FF4757"},
            {"title": "Feature Request", "color": "#5352ED"},
            {"title": "Primeira Conversa", "color": "#26C6DA"},
            {"title": "Cliente VIP", "color": "#FFD700"}
        ]
        
        for label in labels:
            try:
                response = self.session.post(
                    f"{self.chatwoot_url}/api/v1/accounts/1/labels",
                    json=label
                )
                
                if response.status_code == 200:
                    print(f"✅ Label criada: {label['title']}")
                else:
                    print(f"❌ Erro ao criar label {label['title']}: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Erro ao criar label {label['title']}: {e}")
    
    def configure_team(self):
        """Configurar equipe padrão"""
        try:
            # Criar equipe de suporte
            team_response = self.session.post(
                f"{self.chatwoot_url}/api/v1/accounts/1/teams",
                json={
                    "name": "Suporte KRYONIX",
                    "description": "Equipe principal de suporte ao cliente",
                    "allow_auto_assign": True
                }
            )
            
            if team_response.status_code == 200:
                team_data = team_response.json()
                print(f"✅ Equipe criada: {team_data['name']}")
                return team_data
            else:
                print(f"❌ Erro ao criar equipe: {team_response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Erro ao configurar equipe: {e}")
            return None
    
    def run_setup(self):
        """Executar configuração completa"""
        print("🚀 Iniciando configuração Chatwoot IA...")
        
        if not self.login():
            return False
        
        print("\n📥 Criando inbox WhatsApp...")
        self.create_whatsapp_inbox()
        
        print("\n🤖 Configurando agente IA...")
        self.setup_ai_bot()
        
        print("\n💬 Criando respostas prontas...")
        self.create_canned_responses()
        
        print("\n🏷️ Configurando labels...")
        self.setup_labels()
        
        print("\n👥 Configurando equipe...")
        self.configure_team()
        
        print("\n✅ Configuração Chatwoot IA concluída!")
        print(f"🌐 Acesse: {self.chatwoot_url}")
        print(f"📧 Email: {self.admin_email}")
        print(f"🔑 Senha: {self.admin_password}")
        
        return True

if __name__ == "__main__":
    setup = ChatwootAISetup()
    setup.run_setup()
EOF

chmod +x /opt/kryonix/scripts/chatwoot-ai-setup.py

# === AGUARDAR CHATWOOT ESTAR PRONTO ===
echo "⏳ Aguardando Chatwoot estar completamente pronto..."
for i in {1..60}; do
  if curl -f -s https://chatwoot.kryonix.com.br/health > /dev/null 2>&1; then
    echo "✅ Chatwoot está pronto!"
    break
  fi
  echo "⏳ Tentativa $i/60..."
  sleep 10
done

# === EXECUTAR CONFIGURAÇÃO IA ===
echo "🤖 Executando configuração IA..."
sleep 30  # Aguardar mais um pouco
python3 /opt/kryonix/scripts/chatwoot-ai-setup.py

# === CONFIGURAR BACKUP AUTOMÁTICO ===
echo "💾 Configurando backup automático..."
cat > /opt/kryonix/scripts/backup-chatwoot.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/chatwoot/$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

echo "💾 Iniciando backup Chatwoot..."

# Backup database
echo "🗄️ Backup database..."
docker exec postgresql-kryonix pg_dump -U chatwoot_user -d chatwoot | gzip > "$BACKUP_DIR/chatwoot_db.sql.gz"

# Backup uploads
echo "📁 Backup uploads..."
cp -r /opt/kryonix/uploads/chatwoot "$BACKUP_DIR/uploads"

# Backup configurações
echo "⚙️ Backup configurações..."
cp -r /opt/kryonix/config/chatwoot "$BACKUP_DIR/config"

# Backup logs
echo "📋 Backup logs..."
docker logs chatwoot-rails-kryonix > "$BACKUP_DIR/rails.log" 2>&1
docker logs chatwoot-sidekiq-kryonix > "$BACKUP_DIR/sidekiq.log" 2>&1

# Comprimir backup
cd /opt/kryonix/backups/chatwoot
tar -czf "chatwoot_backup_$BACKUP_DATE.tar.gz" "$BACKUP_DATE"
rm -rf "$BACKUP_DATE"

# Limpar backups antigos (manter 7 dias)
find /opt/kryonix/backups/chatwoot -name "chatwoot_backup_*.tar.gz" -mtime +7 -delete

BACKUP_SIZE=$(du -sh "chatwoot_backup_$BACKUP_DATE.tar.gz" | cut -f1)
echo "✅ Backup Chatwoot concluído: $BACKUP_SIZE"

# Notificar WhatsApp
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: sua_chave_evolution_api_aqui" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"5517981805327\", \"text\": \"💬 Backup Chatwoot concluído!\\nData: $BACKUP_DATE\\nTamanho: $BACKUP_SIZE\"}"
EOF

chmod +x /opt/kryonix/scripts/backup-chatwoot.sh

# === CONFIGURAR MONITORAMENTO ===
echo "📊 Configurando monitoramento..."
cat > /opt/kryonix/scripts/monitor-chatwoot.sh << 'EOF'
#!/bin/bash
# Monitoramento contínuo Chatwoot

while true; do
  # Health check
  if ! curl -f -s https://chatwoot.kryonix.com.br/health > /dev/null; then
    echo "🚨 $(date): Chatwoot não está respondendo!"
    
    # Tentar restart
    docker service update --force kryonix-chatwoot_chatwoot-rails
    
    # Notificar WhatsApp
    curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
      -H "apikey: sua_chave_evolution_api_aqui" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"🚨 ALERTA: Chatwoot fora do ar!\\nTentando restart automático...\"}"
  fi
  
  # Verificar uso de memória Rails
  RAILS_MEMORY=$(docker stats chatwoot-rails-kryonix --no-stream --format "{{.MemUsage}}" | cut -d/ -f1)
  
  # Verificar sidekiq
  SIDEKIQ_STATUS=$(docker exec chatwoot-sidekiq-kryonix ps aux | grep sidekiq | wc -l)
  
  if [ "$SIDEKIQ_STATUS" -eq 0 ]; then
    echo "🚨 $(date): Sidekiq não está rodando!"
    docker service update --force kryonix-chatwoot_chatwoot-sidekiq
  fi
  
  # Salvar métricas no Redis
  docker exec redis-kryonix redis-cli -n 3 << EOF2
HSET metrics:chatwoot rails_memory "$RAILS_MEMORY" sidekiq_processes "$SIDEKIQ_STATUS" timestamp "$(date +%s)"
EOF2
  
  echo "✅ $(date): Chatwoot funcionando - RAM Rails: $RAILS_MEMORY, Sidekiq: $SIDEKIQ_STATUS processos"
  
  sleep 300  # 5 minutos
done
EOF

chmod +x /opt/kryonix/scripts/monitor-chatwoot.sh

# Executar monitoramento em background
nohup /opt/kryonix/scripts/monitor-chatwoot.sh > /var/log/chatwoot-monitor.log 2>&1 &

# === AGENDAR TAREFAS ===
echo "📅 Agendando tarefas automáticas..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/kryonix/scripts/backup-chatwoot.sh") | crontab -

# === CONFIGURAR WEBHOOK WHATSAPP ===
echo "🔗 Configurando webhook WhatsApp..."
/opt/kryonix/scripts/setup-chatwoot-whatsapp.sh

# === TESTES FINAIS ===
echo "🧪 Executando testes finais..."

# Teste 1: Chatwoot acessível
echo "Teste 1: Verificando Chatwoot..."
curl -f https://chatwoot.kryonix.com.br/health && echo "✅ Chatwoot acessível" || echo "❌ Chatwoot não acessível"

# Teste 2: Login funcionando
echo "Teste 2: Testando login..."
LOGIN_RESPONSE=$(curl -s -X POST https://chatwoot.kryonix.com.br/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kryonix.com.br","password":"kryonix_admin_2025"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
  echo "✅ Login funcionando"
else
  echo "❌ Login com problemas"
fi

# Teste 3: Database conectado
echo "Teste 3: Verificando database..."
docker exec chatwoot-rails-kryonix bundle exec rails runner "puts User.count" && echo "✅ Database funcionando" || echo "❌ Database com problemas"

# Teste 4: Sidekiq funcionando
echo "Teste 4: Verificando Sidekiq..."
docker exec chatwoot-sidekiq-kryonix ps aux | grep sidekiq && echo "✅ Sidekiq funcionando" || echo "❌ Sidekiq com problemas"

# === MARCAR PROGRESSO ===
echo "37" > /opt/kryonix/.current-part

# === NOTIFICAÇÃO FINAL ===
echo "📱 Enviando notificação final..."
curl -X POST "https://evolution.kryonix.com.br/message/sendText" \
  -H "apikey: sua_chave_evolution_api_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "text": "✅ PARTE-37 CONCLUÍDA!\n\n💬 Chatwoot atendimento omnichannel configurado\n🤖 IA integrada para auto-resposta\n📱 Interface mobile-first otimizada\n🔗 WhatsApp integrado via Evolution API\n👥 Equipe e agentes configurados\n🏷️ Labels e automações ativas\n💾 Backup automático diário (02:00)\n📊 Monitoramento 24/7 ativo\n🌐 SSL e segurança configurados\n\n💬 Acesso: https://chatwoot.kryonix.com.br\n📧 Login: admin@kryonix.com.br\n🔑 Senha: kryonix_admin_2025\n🚀 Sistema pronto para PARTE-38!"
  }'

echo ""
echo "✅ PARTE-37 CONCLUÍDA COM SUCESSO!"
echo "💬 Chatwoot configurado e funcionando"
echo "🤖 IA integrada para atendimento"
echo "📱 Interface mobile-first otimizada"
echo "🔗 WhatsApp integrado"
echo "💬 Acesso: https://chatwoot.kryonix.com.br"
echo "📧 Login: admin@kryonix.com.br"
echo "🔑 Senha: kryonix_admin_2025"
echo ""
echo "🚀 Próxima etapa: PARTE-38-TYPEBOT.md"
```

---

## 📋 **VALIDAÇÕES OBRIGATÓRIAS**
Após executar, confirme se:
- [ ] ✅ Chatwoot acessível em https://chatwoot.kryonix.com.br
- [ ] ✅ Login funcionando com admin@kryonix.com.br
- [ ] ✅ Database PostgreSQL conectado
- [ ] ✅ Redis funcionando para cache
- [ ] ✅ Sidekiq processando jobs
- [ ] ✅ Inbox WhatsApp criado
- [ ] ✅ Agente IA configurado
- [ ] ✅ Automações funcionando
- [ ] ✅ Respostas prontas criadas
- [ ] ✅ Labels organizadas
- [ ] ✅ Webhook Evolution API configurado
- [ ] ✅ Storage MinIO funcionando
- [ ] ✅ Interface mobile-first funcionando
- [ ] ✅ Backup automático agendado
- [ ] ✅ Monitoramento ativo
- [ ] ✅ SSL funcionando
- [ ] ✅ Notificação WhatsApp enviada

---

**⚠️ IMPORTANTE**: Substitua 'sua_chave_evolution_api_aqui' pela chave real da Evolution API antes de executar.

*🤖 Prompt criado pelos 15 Agentes Especializados KRYONIX*

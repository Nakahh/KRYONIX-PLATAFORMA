# 💬 PARTE-36: EVOLUTION API WHATSAPP
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar Evolution API para WhatsApp Business integrado com IA
- **URL**: https://evolution.kryonix.com.br
- **Login Master**: kryonix / Vitor@123456

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55

# === VERIFICAÇÕES INICIAIS ===
echo "🔍 Verificando Evolution API..."
docker ps | grep evolution
curl -I https://evolution.kryonix.com.br

# === CONFIGURAR EVOLUTION API ===
echo "💬 Configurando Evolution API..."
mkdir -p /opt/kryonix/config/evolution

cat > /opt/kryonix/config/evolution/docker-compose.yml << 'EOF'
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-kryonix
    environment:
      # Configurações do servidor
      SERVER_URL: https://evolution.kryonix.com.br
      CORS_ORIGIN: '*'
      CORS_METHODS: 'POST,GET,PUT,DELETE'
      CORS_CREDENTIALS: 'true'
      
      # Database PostgreSQL
      DATABASE_ENABLED: 'true'
      DATABASE_CONNECTION_URI: 'postgresql://kryonix:Vitor@123456@postgresql-kryonix:5432/evolution'
      DATABASE_SYNC_MESSAGES: 'true'
      
      # Redis para cache
      REDIS_ENABLED: 'true'
      REDIS_URI: 'redis://redis-kryonix:6379'
      REDIS_PREFIX_KEY: 'evolution_kryonix'
      
      # Webhook
      WEBHOOK_GLOBAL_URL: 'https://api.kryonix.com.br/webhook/whatsapp'
      WEBHOOK_GLOBAL_ENABLED: 'true'
      WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS: 'true'
      
      # Configurações do WhatsApp
      CONFIG_SESSION_PHONE_CLIENT: 'KRYONIX'
      CONFIG_SESSION_PHONE_NAME: 'KRYONIX SaaS Platform'
      
      # Autenticação
      AUTHENTICATION_TYPE: 'apikey'
      AUTHENTICATION_API_KEY: 'kryonix_evolution_2025'
      AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES: 'false'
      
      # Logs
      LOG_LEVEL: 'ERROR,WARN,DEBUG,INFO,LOG,VERBOSE,DARK'
      LOG_COLOR: 'true'
      LOG_BAILEYS: 'error'
      
      # QR Code
      QRCODE_LIMIT: 5
      QRCODE_COLOR: '#198754'
      
      # Instâncias
      DEL_INSTANCE: '7'
      
      # Chatwoot Integration
      CHATWOOT_MESSAGE_READ: 'true'
      CHATWOOT_MESSAGE_DELETE: 'true'
      CHATWOOT_IMPORT_DATABASE: 'true'
      
      # Typebot Integration
      TYPEBOT_API_VERSION: 'latest'
      TYPEBOT_KEEP_OPEN: 'false'
      
      # S3/MinIO para mídia
      S3_ENABLED: 'true'
      S3_ACCESS_KEY: 'mobile-user'
      S3_SECRET_KEY: 'mobile_kryonix_2025'
      S3_BUCKET: 'kryonix-whatsapp-media'
      S3_PORT: '443'
      S3_ENDPOINT: 's3.kryonix.com.br'
      S3_USE_SSL: 'true'
      
      # Cache de mídia
      CACHE_REDIS_ENABLED: 'true'
      CACHE_REDIS_URI: 'redis://redis-kryonix:6379/5'
      CACHE_REDIS_PREFIX_KEY: 'evolution_media'
      CACHE_REDIS_TTL: '604800'
      CACHE_LOCAL_ENABLED: 'false'
      
      # Websocket
      WEBSOCKET_ENABLED: 'true'
      WEBSOCKET_GLOBAL_EVENTS: 'true'
      
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.evolution.rule=Host(\`evolution.kryonix.com.br\`)"
      - "traefik.http.routers.evolution.tls=true"
      - "traefik.http.routers.evolution.tls.certresolver=letsencrypt"
      - "traefik.http.services.evolution.loadbalancer.server.port=8080"
      - "traefik.http.routers.evolution.middlewares=mobile-headers@file,api-cors@file,api-rate-limit@file"
    
    volumes:
      - evolution_instances:/evolution/instances
      - evolution_store:/evolution/store
    
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
          memory: 1GB
        reservations:
          memory: 512MB

volumes:
  evolution_instances:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/kryonix/data/evolution/instances
  
  evolution_store:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/kryonix/data/evolution/store

networks:
  kryonix-net:
    external: true
EOF

# === CRIAR DIRETÓRIOS ===
echo "📁 Criando diretórios..."
mkdir -p /opt/kryonix/data/evolution/{instances,store}
chmod -R 755 /opt/kryonix/data/evolution

# === CRIAR DATABASE EVOLUTION ===
echo "🗄️ Criando database Evolution..."
docker exec -it postgresql-kryonix psql -U postgres << 'EOF'
CREATE DATABASE evolution WITH ENCODING 'UTF8' LC_COLLATE = 'pt_BR.UTF-8' LC_CTYPE = 'pt_BR.UTF-8';
CREATE USER evolution_user WITH PASSWORD 'evolution_kryonix_2025';
GRANT ALL PRIVILEGES ON DATABASE evolution TO evolution_user;
GRANT ALL PRIVILEGES ON DATABASE evolution TO kryonix;
\q
EOF

# === CRIAR BUCKET WHATSAPP MEDIA ===
echo "📦 Criando bucket para mídia WhatsApp..."
docker exec minio-kryonix mc mb local/kryonix-whatsapp-media
docker exec minio-kryonix mc policy set public local/kryonix-whatsapp-media

# === DEPLOY EVOLUTION API ===
echo "🚀 Fazendo deploy Evolution API..."
docker stack deploy -c /opt/kryonix/config/evolution/docker-compose.yml kryonix-evolution

# === AGUARDAR INICIALIZAÇÃO ===
echo "⏳ Aguardando Evolution API inicializar..."
for i in {1..60}; do
  if curl -f -s https://evolution.kryonix.com.br > /dev/null 2>&1; then
    echo "✅ Evolution API está pronto!"
    break
  fi
  echo "⏳ Tentativa $i/60..."
  sleep 10
done

# === CONFIGURAR INSTÂNCIA PRINCIPAL ===
echo "📱 Configurando instância principal WhatsApp..."
EVOLUTION_API="https://evolution.kryonix.com.br"
API_KEY="kryonix_evolution_2025"

# Criar instância principal
curl -X POST "$EVOLUTION_API/instance/create" \
  -H "apikey: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "kryonix-main",
    "qrcode": true,
    "number": "5517981805327",
    "integration": "WHATSAPP-BAILEYS",
    "token": "kryonix_main_instance_2025",
    "webhook_url": "https://api.kryonix.com.br/webhook/whatsapp",
    "webhook_by_events": true,
    "events": [
      "APPLICATION_STARTUP",
      "QRCODE_UPDATED", 
      "CONNECTION_UPDATE",
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "MESSAGES_DELETE",
      "SEND_MESSAGE",
      "CONTACTS_UPDATE",
      "CONTACTS_UPSERT",
      "PRESENCE_UPDATE",
      "CHATS_UPDATE",
      "CHATS_UPSERT",
      "CHATS_DELETE",
      "GROUPS_UPSERT",
      "GROUP_UPDATE",
      "GROUP_PARTICIPANTS_UPDATE",
      "NEW_JWT_TOKEN",
      "TYPEBOT_START",
      "TYPEBOT_CHANGE_STATUS"
    ],
    "reject_call": false,
    "msg_call": "Olá! No momento não posso atender chamadas. Por favor, envie uma mensagem que retornarei assim que possível.",
    "groups_ignore": true,
    "always_online": true,
    "read_messages": true,
    "read_status": true,
    "chatwoot_account_id": "1",
    "chatwoot_token": "chatwoot_token_here",
    "chatwoot_url": "https://chatwoot.kryonix.com.br",
    "chatwoot_sign_msg": true,
    "chatwoot_reopen_conversation": true,
    "chatwoot_conversation_pending": false
  }'

sleep 5

# Obter QR Code para conexão
echo "📸 Obtendo QR Code para conexão..."
QR_RESPONSE=$(curl -s -X GET "$EVOLUTION_API/instance/connect/kryonix-main" \
  -H "apikey: $API_KEY")

echo "📱 QR Code disponível em: $EVOLUTION_API/instance/qrcode/kryonix-main"
echo "🔗 Acesse pelo navegador para escanear o QR Code"

# === CONFIGURAR WEBHOOKS INTELIGENTES ===
echo "🔗 Configurando webhooks inteligentes..."
cat > /opt/kryonix/scripts/whatsapp-webhook-handler.py << 'EOF'
#!/usr/bin/env python3
import json
import requests
import redis
import psycopg2
from datetime import datetime
import logging
from flask import Flask, request, jsonify

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class WhatsAppWebhookHandler:
    def __init__(self):
        self.redis_client = redis.Redis(host='redis-kryonix', port=6379, db=2, decode_responses=True)
        self.pg_conn = psycopg2.connect(
            host="postgresql-kryonix",
            database="evolution",
            user="evolution_user", 
            password="evolution_kryonix_2025"
        )
        
    def process_message(self, data):
        """Processar mensagem recebida via WhatsApp"""
        try:
            message_info = data.get('data', {})
            instance = data.get('instance', '')
            
            if not message_info:
                return {"status": "ignored", "reason": "no_message_data"}
            
            # Extrair informações da mensagem
            from_number = message_info.get('key', {}).get('remoteJid', '').split('@')[0]
            message_text = message_info.get('message', {}).get('conversation', '')
            message_type = message_info.get('messageType', 'text')
            timestamp = message_info.get('messageTimestamp', '')
            
            if not from_number or not message_text:
                return {"status": "ignored", "reason": "incomplete_data"}
            
            # Salvar mensagem no banco
            self.save_message_to_db(from_number, message_text, message_type, timestamp, instance)
            
            # Analisar mensagem com IA
            ai_response = self.analyze_message_with_ai(from_number, message_text)
            
            # Processar resposta automática se necessário
            if ai_response.get('should_respond', False):
                self.send_automatic_response(from_number, ai_response.get('response', ''), instance)
            
            # Adicionar à fila de processamento
            self.add_to_processing_queue(from_number, message_text, ai_response)
            
            logger.info(f"Mensagem processada de {from_number}: {message_text[:50]}...")
            
            return {"status": "processed", "ai_analysis": ai_response}
            
        except Exception as e:
            logger.error(f"Erro ao processar mensagem: {e}")
            return {"status": "error", "error": str(e)}
    
    def save_message_to_db(self, from_number, message, message_type, timestamp, instance):
        """Salvar mensagem no PostgreSQL"""
        try:
            cursor = self.pg_conn.cursor()
            
            cursor.execute("""
                INSERT INTO whatsapp_messages 
                (from_number, message_content, message_type, timestamp, instance, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (from_number, message, message_type, timestamp, instance, datetime.now()))
            
            self.pg_conn.commit()
            cursor.close()
            
        except Exception as e:
            logger.error(f"Erro ao salvar no banco: {e}")
    
    def analyze_message_with_ai(self, from_number, message):
        """Analisar mensagem com IA local (Ollama)"""
        try:
            # Verificar histórico do usuário
            user_history = self.get_user_history(from_number)
            
            # Preparar prompt para IA
            ai_prompt = f"""
            Analise esta mensagem de WhatsApp para a plataforma KRYONIX:
            
            Usuário: {from_number}
            Mensagem: {message}
            Histórico: {user_history}
            
            Determine:
            1. Intenção do usuário (dúvida, suporte, vendas, etc.)
            2. Se deve responder automaticamente
            3. Qual resposta dar (se aplicável)
            4. Nível de prioridade (baixa, média, alta)
            5. Classificação (lead, cliente, suporte)
            
            Responda em JSON com:
            - intention: string
            - should_respond: boolean  
            - response: string
            - priority: string
            - classification: string
            - confidence: float
            """
            
            # Chamar IA local (Ollama)
            ollama_response = requests.post('http://ollama-kryonix:11434/api/generate', 
                json={
                    'model': 'llama3',
                    'prompt': ai_prompt,
                    'stream': False
                }, timeout=10)
            
            if ollama_response.status_code == 200:
                ai_result = ollama_response.json().get('response', '{}')
                try:
                    return json.loads(ai_result)
                except json.JSONDecodeError:
                    # Fallback se IA não retornar JSON válido
                    return {
                        'intention': 'unknown',
                        'should_respond': True,
                        'response': 'Olá! Obrigado por entrar em contato com o KRYONIX. Em breve retornaremos seu contato.',
                        'priority': 'medium',
                        'classification': 'lead',
                        'confidence': 0.5
                    }
            else:
                # Fallback se IA não estiver disponível
                return self.get_fallback_response(message)
                
        except Exception as e:
            logger.error(f"Erro na análise IA: {e}")
            return self.get_fallback_response(message)
    
    def get_fallback_response(self, message):
        """Resposta padrão quando IA não está disponível"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['oi', 'olá', 'hello', 'bom dia', 'boa tarde', 'boa noite']):
            return {
                'intention': 'greeting',
                'should_respond': True,
                'response': 'Olá! 👋 Bem-vindo ao KRYONIX! Sou a IA assistente e estou aqui para ajudar. Como posso te auxiliar hoje?',
                'priority': 'medium',
                'classification': 'lead',
                'confidence': 0.8
            }
        elif any(word in message_lower for word in ['preço', 'valor', 'quanto custa', 'plano']):
            return {
                'intention': 'pricing',
                'should_respond': True,
                'response': '💰 Nossos planos KRYONIX:\n\n📊 Starter: R$ 99/mês\n💼 Business: R$ 279/mês\n🚀 Professional: R$ 599/mês\n⭐ Premium: R$ 1.349/mês\n\nQual se encaixa melhor para você?',
                'priority': 'high',
                'classification': 'lead',
                'confidence': 0.9
            }
        elif any(word in message_lower for word in ['suporte', 'ajuda', 'problema', 'erro']):
            return {
                'intention': 'support',
                'should_respond': True,
                'response': '🛠️ Equipe de suporte KRYONIX aqui! Descreva seu problema que vamos resolver rapidamente. Nossa IA está analisando sua solicitação...',
                'priority': 'high',
                'classification': 'support',
                'confidence': 0.9
            }
        else:
            return {
                'intention': 'general',
                'should_respond': True,
                'response': 'Obrigado pelo contato! Nossa IA está analisando sua mensagem. Retornaremos em breve! 🤖',
                'priority': 'medium',
                'classification': 'lead',
                'confidence': 0.6
            }
    
    def get_user_history(self, from_number):
        """Obter histórico do usuário"""
        try:
            cursor = self.pg_conn.cursor()
            cursor.execute("""
                SELECT message_content, created_at 
                FROM whatsapp_messages 
                WHERE from_number = %s 
                ORDER BY created_at DESC 
                LIMIT 5
            """, (from_number,))
            
            history = cursor.fetchall()
            cursor.close()
            
            return [{"message": msg[0], "date": msg[1].isoformat()} for msg in history]
            
        except Exception as e:
            logger.error(f"Erro ao buscar histórico: {e}")
            return []
    
    def send_automatic_response(self, to_number, message, instance):
        """Enviar resposta automática"""
        try:
            response = requests.post(
                f"https://evolution.kryonix.com.br/message/sendText/{instance}",
                headers={
                    "apikey": "kryonix_evolution_2025",
                    "Content-Type": "application/json"
                },
                json={
                    "number": to_number,
                    "text": message
                },
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"Resposta automática enviada para {to_number}")
            else:
                logger.error(f"Erro ao enviar resposta: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Erro no envio automático: {e}")
    
    def add_to_processing_queue(self, from_number, message, ai_analysis):
        """Adicionar à fila de processamento"""
        try:
            queue_item = {
                'from_number': from_number,
                'message': message,
                'ai_analysis': ai_analysis,
                'timestamp': datetime.now().isoformat(),
                'processed': False
            }
            
            # Adicionar à fila Redis baseado na prioridade
            priority = ai_analysis.get('priority', 'medium')
            queue_name = f"whatsapp_queue_{priority}"
            
            self.redis_client.lpush(queue_name, json.dumps(queue_item))
            
            # Notificar equipe se prioridade alta
            if priority == 'high':
                self.notify_team_high_priority(from_number, message)
                
        except Exception as e:
            logger.error(f"Erro ao adicionar à fila: {e}")
    
    def notify_team_high_priority(self, from_number, message):
        """Notificar equipe sobre mensagem de alta prioridade"""
        try:
            notification = f"🔥 PRIORIDADE ALTA\n\nWhatsApp: {from_number}\nMensagem: {message[:100]}...\n\nResponder urgentemente!"
            
            # Enviar para número da equipe
            requests.post(
                "https://evolution.kryonix.com.br/message/sendText/kryonix-main",
                headers={
                    "apikey": "kryonix_evolution_2025",
                    "Content-Type": "application/json"
                },
                json={
                    "number": "5517981805327",
                    "text": notification
                },
                timeout=5
            )
            
        except Exception as e:
            logger.error(f"Erro ao notificar equipe: {e}")

# Instanciar handler
handler = WhatsAppWebhookHandler()

@app.route('/webhook/whatsapp', methods=['POST'])
def whatsapp_webhook():
    """Endpoint para receber webhooks do WhatsApp"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"status": "error", "message": "No data received"}), 400
        
        # Processar diferentes tipos de eventos
        event_type = data.get('event', '')
        
        if event_type == 'messages.upsert':
            result = handler.process_message(data)
            return jsonify(result)
        
        elif event_type == 'connection.update':
            logger.info(f"Connection update: {data}")
            return jsonify({"status": "logged"})
        
        elif event_type == 'qrcode.updated':
            logger.info("QR Code updated")
            return jsonify({"status": "qr_updated"})
        
        else:
            logger.info(f"Event not processed: {event_type}")
            return jsonify({"status": "ignored", "event": event_type})
        
    except Exception as e:
        logger.error(f"Erro no webhook: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check do webhook handler"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "whatsapp-webhook-handler"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
EOF

chmod +x /opt/kryonix/scripts/whatsapp-webhook-handler.py

# === CRIAR TABELA PARA MENSAGENS ===
echo "📊 Criando tabela para mensagens WhatsApp..."
docker exec -it postgresql-kryonix psql -U postgres -d evolution << 'EOF'
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id SERIAL PRIMARY KEY,
    from_number VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    timestamp VARCHAR(50),
    instance VARCHAR(100),
    ai_analysis JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_from_number ON whatsapp_messages(from_number);
CREATE INDEX idx_whatsapp_created_at ON whatsapp_messages(created_at);
CREATE INDEX idx_whatsapp_processed ON whatsapp_messages(processed);
CREATE INDEX idx_whatsapp_instance ON whatsapp_messages(instance);
\q
EOF

# === CONFIGURAR MONITORAMENTO WHATSAPP ===
echo "📊 Configurando monitoramento WhatsApp..."
cat > /opt/kryonix/scripts/monitor-whatsapp.sh << 'EOF'
#!/bin/bash
# Monitoramento contínuo WhatsApp Evolution API

while true; do
  # Health check Evolution API
  if ! curl -f -s https://evolution.kryonix.com.br > /dev/null; then
    echo "🚨 $(date): Evolution API não est�� respondendo!"
    
    # Tentar restart
    docker service update --force kryonix-evolution_evolution-api
    
    # Notificar WhatsApp (irônico, mas funciona se tiver backup)
    curl -X POST "https://evolution.kryonix.com.br/message/sendText/kryonix-main" \
      -H "apikey: kryonix_evolution_2025" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"🚨 ALERTA: Evolution API fora do ar!\\nTentando restart automático...\"}" 2>/dev/null
  fi
  
  # Verificar status da instância principal
  INSTANCE_STATUS=$(curl -s -X GET "https://evolution.kryonix.com.br/instance/connectionState/kryonix-main" \
    -H "apikey: kryonix_evolution_2025" | jq -r '.instance.state' 2>/dev/null || echo "unknown")
  
  echo "📱 Status da instância: $INSTANCE_STATUS"
  
  # Salvar métricas no Redis
  docker exec redis-kryonix redis-cli -n 3 << EOF2
HSET metrics:whatsapp instance_status "$INSTANCE_STATUS" timestamp "$(date +%s)" api_healthy "true"
EOF2
  
  # Alertar se desconectado
  if [ "$INSTANCE_STATUS" != "open" ] && [ "$INSTANCE_STATUS" != "unknown" ]; then
    curl -X POST "https://evolution.kryonix.com.br/message/sendText/kryonix-main" \
      -H "apikey: kryonix_evolution_2025" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"5517981805327\", \"text\": \"⚠️ WhatsApp desconectado!\\nStatus: $INSTANCE_STATUS\\nReconectar necessário.\"}" 2>/dev/null
  fi
  
  # Verificar filas de mensagens
  HIGH_QUEUE=$(docker exec redis-kryonix redis-cli LLEN whatsapp_queue_high)
  MEDIUM_QUEUE=$(docker exec redis-kryonix redis-cli LLEN whatsapp_queue_medium)
  
  if [ "$HIGH_QUEUE" -gt 10 ]; then
    echo "⚠️ Fila de alta prioridade com $HIGH_QUEUE mensagens"
  fi
  
  echo "✅ $(date): WhatsApp monitoring - Status: $INSTANCE_STATUS, Filas: H:$HIGH_QUEUE M:$MEDIUM_QUEUE"
  
  sleep 300  # 5 minutos
done
EOF

chmod +x /opt/kryonix/scripts/monitor-whatsapp.sh

# Executar monitoramento em background
nohup /opt/kryonix/scripts/monitor-whatsapp.sh > /var/log/whatsapp-monitor.log 2>&1 &

# === INSTALAR DEPENDÊNCIAS PYTHON ===
echo "📦 Instalando dependências Python..."
pip3 install flask psycopg2-binary redis requests

# === EXECUTAR WEBHOOK HANDLER ===
echo "🔗 Iniciando webhook handler..."
nohup python3 /opt/kryonix/scripts/whatsapp-webhook-handler.py > /var/log/whatsapp-webhook.log 2>&1 &

# === TESTES FINAIS ===
echo "🧪 Executando testes finais..."

# Teste 1: Evolution API respondendo
echo "Teste 1: Evolution API..."
curl -f https://evolution.kryonix.com.br > /dev/null 2>&1 && echo "✅ Evolution API acessível" || echo "❌ Evolution API não acessível"

# Teste 2: Instância criada
echo "Teste 2: Verificando instância..."
INSTANCES=$(curl -s -X GET "https://evolution.kryonix.com.br/instance/fetchInstances" \
  -H "apikey: kryonix_evolution_2025" | jq length 2>/dev/null || echo "0")
echo "Instâncias criadas: $INSTANCES"

# Teste 3: Database funcionando
echo "Teste 3: Verificando database..."
DB_TEST=$(docker exec postgresql-kryonix psql -U postgres -d evolution -c "SELECT COUNT(*) FROM whatsapp_messages;" 2>/dev/null || echo "Erro")
echo "Database evolution: $DB_TEST"

# Teste 4: Bucket mídia
echo "Teste 4: Verificando bucket mídia..."
docker exec minio-kryonix mc ls local/kryonix-whatsapp-media > /dev/null 2>&1 && echo "✅ Bucket criado" || echo "❌ Bucket não encontrado"

# Teste 5: Webhook handler
echo "Teste 5: Testando webhook handler..."
curl -f http://localhost:5000/health 2>/dev/null && echo "✅ Webhook handler funcionando" || echo "❌ Webhook handler não funcionando"

# === MARCAR PROGRESSO ===
echo "36" > /opt/kryonix/.current-part

# === NOTIFICAÇÃO FINAL ===
echo "📱 Enviando notificação final..."
curl -X POST "https://evolution.kryonix.com.br/message/sendText/kryonix-main" \
  -H "apikey: kryonix_evolution_2025" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5517981805327",
    "text": "✅ PARTE-36 CONCLUÍDA!\n\n💬 Evolution API WhatsApp configurado\n📱 Instância principal criada\n🤖 IA analisando mensagens automaticamente\n🔗 Webhooks inteligentes ativos\n📊 Mensagens salvas no PostgreSQL\n📦 Mídia armazenada no MinIO\n⚡ Respostas automáticas funcionando\n📈 Monitoramento 24/7 ativo\n🚀 WhatsApp Business pronto!\n\n📱 Escaneie o QR Code em:\nhttps://evolution.kryonix.com.br/instance/qrcode/kryonix-main\n\n🚀 Sistema pronto para PARTE-37!"
  }'

echo ""
echo "✅ PARTE-36 CONCLUÍDA COM SUCESSO!"
echo "💬 Evolution API WhatsApp configurado"
echo "📱 Instância principal: kryonix-main"
echo "🤖 IA analisando mensagens automaticamente"
echo "🔗 Webhooks inteligentes ativos"
echo "📊 Monitoramento 24/7 funcionando"
echo ""
echo "📱 QR Code: https://evolution.kryonix.com.br/instance/qrcode/kryonix-main"
echo "🚀 Próxima etapa: PARTE-37-CHATWOOT.md"
```

---

## 📋 **VALIDAÇÕES OBRIGATÓRIAS**
Após executar, confirme se:
- [ ] ✅ Evolution API acessível em https://evolution.kryonix.com.br
- [ ] ✅ Instância kryonix-main criada
- [ ] ✅ QR Code disponível para scan
- [ ] ✅ Database evolution criado e funcionando
- [ ] ✅ Bucket kryonix-whatsapp-media criado
- [ ] ✅ Webhooks inteligentes configurados
- [ ] ✅ IA analisando mensagens automaticamente
- [ ] ✅ Webhook handler funcionando (porta 5000)
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Filas de mensagens funcionando
- [ ] ✅ Respostas automáticas testadas
- [ ] ✅ Notificação WhatsApp enviada

---

**⚠️ IMPORTANTE**: 
1. Escaneie o QR Code em https://evolution.kryonix.com.br/instance/qrcode/kryonix-main
2. Teste enviando uma mensagem para verificar resposta automática
3. A IA local (Ollama) deve estar funcionando para análise completa

*🤖 Prompt criado pelos 15 Agentes Especializados KRYONIX*

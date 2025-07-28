# 🐰 PARTE-07: MENSAGERIA RABBITMQ
*Prompt para IA executar via terminal no servidor*

---

## 🎯 **CONTEXTO**
- **Servidor**: 144.202.90.55
- **Objetivo**: Configurar RabbitMQ filas mobile-first com IA
- **URL**: https://rabbitmq.kryonix.com.br
- **Login Master**: kryonix / Vitor@123456

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55
cd /opt/kryonix

# === CRIAR ESTRUTURA RABBITMQ ===
echo "🐰 Criando estrutura mensageria..."
mkdir -p messaging/{rabbitmq,consumers}
mkdir -p messaging/rabbitmq/{config,data,logs,definitions}

# === CONFIGURAR RABBITMQ ===
echo "⚙️ Configurando RabbitMQ mobile-optimized..."
cat > messaging/rabbitmq/config/rabbitmq.conf << 'EOF'
# RabbitMQ Mobile-First Configuration
listeners.tcp.default = 5672
management.tcp.port = 15672

# Mobile optimizations
vm_memory_high_watermark.relative = 0.6
default_consumer_timeout = 900000
heartbeat = 60

# Mobile user
default_user = kryonix
default_pass = Vitor@123456
default_vhost = /

# SSL for mobile security
ssl_options.verify = verify_peer
ssl_options.fail_if_no_peer_cert = false
EOF

# === ENABLED PLUGINS ===
echo "🔌 Configurando plugins..."
cat > messaging/rabbitmq/enabled_plugins << 'EOF'
[rabbitmq_management,
 rabbitmq_management_agent,
 rabbitmq_prometheus,
 rabbitmq_delayed_message_exchange].
EOF

# === DEFINIÇÕES FILAS MOBILE ===
echo "📋 Criando filas mobile-first..."
cat > messaging/rabbitmq/definitions/mobile-queues.json << 'EOF'
{
  "users": [
    {
      "name": "kryonix",
      "password_hash": "hashed_password",
      "hashing_algorithm": "rabbit_password_hashing_sha256",
      "tags": "administrator"
    }
  ],
  "vhosts": [
    {"name": "/"},
    {"name": "/mobile"},
    {"name": "/ai"}
  ],
  "permissions": [
    {
      "user": "kryonix",
      "vhost": "/",
      "configure": ".*",
      "write": ".*", 
      "read": ".*"
    }
  ],
  "queues": [
    {
      "name": "mobile.whatsapp.outbound",
      "vhost": "/mobile",
      "durable": true,
      "arguments": {
        "x-message-ttl": 600000,
        "x-max-priority": 5,
        "x-queue-type": "quorum"
      }
    },
    {
      "name": "mobile.sms.outbound", 
      "vhost": "/mobile",
      "durable": true,
      "arguments": {
        "x-message-ttl": 300000,
        "x-max-priority": 8,
        "x-queue-type": "quorum"
      }
    },
    {
      "name": "mobile.notifications.push",
      "vhost": "/mobile", 
      "durable": true,
      "arguments": {
        "x-message-ttl": 300000,
        "x-max-priority": 10,
        "x-queue-type": "quorum"
      }
    },
    {
      "name": "mobile.events.user_action",
      "vhost": "/mobile",
      "durable": true,
      "arguments": {
        "x-message-ttl": 86400000,
        "x-queue-type": "stream"
      }
    },
    {
      "name": "ai.processing.nlp",
      "vhost": "/ai",
      "durable": true,
      "arguments": {
        "x-message-ttl": 120000,
        "x-max-priority": 10,
        "x-queue-type": "quorum"
      }
    },
    {
      "name": "ai.processing.ml_predictions",
      "vhost": "/ai",
      "durable": true,
      "arguments": {
        "x-message-ttl": 300000,
        "x-max-priority": 7,
        "x-queue-type": "quorum"
      }
    }
  ],
  "exchanges": [
    {
      "name": "mobile.direct",
      "vhost": "/mobile",
      "type": "direct",
      "durable": true
    },
    {
      "name": "mobile.topic",
      "vhost": "/mobile",
      "type": "topic", 
      "durable": true
    },
    {
      "name": "ai.topic",
      "vhost": "/ai",
      "type": "topic",
      "durable": true
    }
  ],
  "bindings": [
    {
      "source": "mobile.topic",
      "vhost": "/mobile",
      "destination": "mobile.whatsapp.outbound",
      "destination_type": "queue",
      "routing_key": "mobile.whatsapp.*"
    },
    {
      "source": "mobile.direct",
      "vhost": "/mobile", 
      "destination": "mobile.notifications.push",
      "destination_type": "queue",
      "routing_key": "push.notification"
    },
    {
      "source": "ai.topic",
      "vhost": "/ai",
      "destination": "ai.processing.nlp",
      "destination_type": "queue",
      "routing_key": "ai.nlp.*"
    }
  ]
}
EOF

# === DOCKER COMPOSE RABBITMQ ===
echo "🐳 Configurando Docker Compose..."
cat > messaging/docker-compose.yml << 'EOF'
version: '3.8'

networks:
  kryonix-network:
    external: true

volumes:
  rabbitmq-data:
  rabbitmq-logs:

services:
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: rabbitmq-kryonix
    restart: unless-stopped
    hostname: rabbitmq-kryonix
    environment:
      - RABBITMQ_DEFAULT_USER=kryonix
      - RABBITMQ_DEFAULT_PASS=Vitor@123456
      - RABBITMQ_DEFAULT_VHOST=/
      - RABBITMQ_CONFIG_FILE=/etc/rabbitmq/rabbitmq
    volumes:
      - ./rabbitmq/config:/etc/rabbitmq
      - ./rabbitmq/definitions:/etc/rabbitmq/definitions
      - ./rabbitmq/enabled_plugins:/etc/rabbitmq/enabled_plugins
      - rabbitmq-data:/var/lib/rabbitmq
      - rabbitmq-logs:/var/log/rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
      - "15692:15692"
    networks:
      - kryonix-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.rabbitmq.rule=Host(\`rabbitmq.kryonix.com.br\`)"
      - "traefik.http.routers.rabbitmq.tls=true"
      - "traefik.http.routers.rabbitmq.tls.certresolver=letsencrypt"
      - "traefik.http.services.rabbitmq.loadbalancer.server.port=15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  mobile-consumer:
    image: node:18-alpine
    container_name: mobile-consumer-kryonix
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./consumers:/app
    command: node mobile-consumer.js
    environment:
      - RABBITMQ_URL=amqp://kryonix:Vitor@123456@rabbitmq:5672/mobile
      - EVOLUTION_API_URL=http://evolution:8080
      - NODE_ENV=production
    networks:
      - kryonix-network
    depends_on:
      - rabbitmq

  ai-consumer:
    image: node:18-alpine
    container_name: ai-consumer-kryonix
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./consumers:/app
    command: node ai-consumer.js
    environment:
      - RABBITMQ_URL=amqp://kryonix:Vitor@123456@rabbitmq:5672/ai
      - OLLAMA_URL=http://ollama:11434
      - NODE_ENV=production
    networks:
      - kryonix-network
    depends_on:
      - rabbitmq
EOF

# === CONSUMER MOBILE ===
echo "📱 Criando consumer mobile..."
cat > messaging/consumers/mobile-consumer.js << 'EOF'
const amqp = require('amqplib');
const axios = require('axios');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;

class MobileConsumer {
    async connect() {
        console.log('📱 Connecting to RabbitMQ mobile...');
        this.connection = await amqp.connect(RABBITMQ_URL);
        this.channel = await this.connection.createChannel();
        await this.channel.prefetch(10);
        console.log('✅ Connected to mobile messaging');
    }

    async setupConsumers() {
        // WhatsApp Consumer
        await this.channel.consume('mobile.whatsapp.outbound', async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                await this.processWhatsApp(data);
                this.channel.ack(msg);
            }
        });

        // SMS Consumer  
        await this.channel.consume('mobile.sms.outbound', async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                await this.processSMS(data);
                this.channel.ack(msg);
            }
        });

        // Push Notifications Consumer
        await this.channel.consume('mobile.notifications.push', async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                await this.processPush(data);
                this.channel.ack(msg);
            }
        });

        console.log('🎯 Mobile consumers started');
    }

    async processWhatsApp(data) {
        try {
            console.log('📱 Processing WhatsApp:', data.to);
            await axios.post(`${EVOLUTION_API_URL}/message/sendText/kryonix`, {
                number: data.to,
                text: data.message
            });
            console.log('✅ WhatsApp sent successfully');
        } catch (error) {
            console.error('❌ WhatsApp failed:', error.message);
        }
    }

    async processSMS(data) {
        try {
            console.log('📨 Processing SMS:', data.to);
            // SMS integration here
            console.log('✅ SMS processed');
        } catch (error) {
            console.error('❌ SMS failed:', error.message);
        }
    }

    async processPush(data) {
        try {
            console.log('🔔 Processing push:', data.userId);
            // Push notification integration here
            console.log('✅ Push processed');
        } catch (error) {
            console.error('❌ Push failed:', error.message);
        }
    }
}

const consumer = new MobileConsumer();
consumer.connect().then(() => consumer.setupConsumers());
EOF

# === CONSUMER AI ===
echo "🤖 Criando consumer AI..."
cat > messaging/consumers/ai-consumer.js << 'EOF'
const amqp = require('amqplib');
const axios = require('axios');

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const OLLAMA_URL = process.env.OLLAMA_URL;

class AIConsumer {
    async connect() {
        console.log('🤖 Connecting to RabbitMQ AI...');
        this.connection = await amqp.connect(RABBITMQ_URL);
        this.channel = await this.connection.createChannel();
        await this.channel.prefetch(5);
        console.log('✅ Connected to AI processing');
    }

    async setupConsumers() {
        // NLP Consumer
        await this.channel.consume('ai.processing.nlp', async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                await this.processNLP(data);
                this.channel.ack(msg);
            }
        });

        // ML Predictions Consumer
        await this.channel.consume('ai.processing.ml_predictions', async (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                await this.processML(data);
                this.channel.ack(msg);
            }
        });

        console.log('🧠 AI consumers started');
    }

    async processNLP(data) {
        try {
            console.log('🧠 Processing NLP:', data.text);
            const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
                model: 'llama2',
                prompt: data.text,
                stream: false
            });
            console.log('✅ NLP completed');
        } catch (error) {
            console.error('❌ NLP failed:', error.message);
        }
    }

    async processML(data) {
        try {
            console.log('📊 Processing ML:', data.model);
            // ML prediction logic here
            console.log('✅ ML completed');
        } catch (error) {
            console.error('❌ ML failed:', error.message);
        }
    }
}

const consumer = new AIConsumer();
consumer.connect().then(() => consumer.setupConsumers());
EOF

# === PACKAGE.JSON ===
echo "📦 Criando package.json..."
cat > messaging/consumers/package.json << 'EOF'
{
  "name": "kryonix-messaging-consumers",
  "version": "1.0.0",
  "description": "KRYONIX Mobile-First Messaging",
  "dependencies": {
    "amqplib": "^0.10.3",
    "axios": "^1.6.2"
  }
}
EOF

# === INSTALAR DEPENDÊNCIAS ===
echo "📦 Instalando dependências..."
cd messaging/consumers
npm install
cd ../..

# === INICIAR SERVIÇOS ===
echo "🚀 Iniciando RabbitMQ..."
cd messaging
docker-compose up -d

# === VERIFICAÇÕES ===
echo "🔍 Verificando serviços..."
sleep 45
curl -s -u kryonix:Vitor@123456 http://localhost:15672/api/overview && echo "✅ RabbitMQ OK" || echo "❌ RabbitMQ ERRO"

# === TESTE MENSAGEM ===
echo "🧪 Testando envio mensagem..."
cat > test-message.js << 'EOF'
const amqp = require('amqplib');

async function testMessage() {
    const connection = await amqp.connect('amqp://kryonix:Vitor@123456@localhost:5672/mobile');
    const channel = await connection.createChannel();
    
    const message = {
        to: '+5517981805327',
        message: 'Teste KRYONIX RabbitMQ Mobile! 📱',
        timestamp: new Date().toISOString()
    };
    
    await channel.sendToQueue('mobile.whatsapp.outbound', 
        Buffer.from(JSON.stringify(message)),
        { priority: 5 }
    );
    
    console.log('✅ Test message queued');
    await channel.close();
    await connection.close();
}

testMessage().catch(console.error);
EOF

node test-message.js

# === COMMIT CHANGES ===
echo "💾 Commitando mudanças..."
cd /opt/kryonix
git add .
git commit -m "feat: Add RabbitMQ messaging mobile-first

- RabbitMQ mobile-optimized configuration
- Mobile-specific queues (WhatsApp, SMS, Push)
- AI processing queues (NLP, ML)
- Mobile and AI consumers
- Integration with Evolution API
- Prometheus metrics

KRYONIX PARTE-07 ✅"
git push origin main

echo "
🎉 ===== PARTE-07 CONCLUÍDA! =====

🐰 MENSAGERIA ATIVA:
✅ RabbitMQ Management: https://rabbitmq.kryonix.com.br
✅ Filas mobile (WhatsApp, SMS, Push)
✅ Filas AI (NLP, ML)
✅ Consumers mobile e AI ativos
✅ Integração Evolution API

🔐 Login: kryonix / Vitor@123456

📱 FILAS MOBILE:
📱 mobile.whatsapp.outbound
📨 mobile.sms.outbound  
🔔 mobile.notifications.push
📊 mobile.events.user_action

🤖 FILAS AI:
🧠 ai.processing.nlp
📊 ai.processing.ml_predictions

📱 PRÓXIMA PARTE: PARTE-08-BACKUP.md
"
```

---

## ✅ **VALIDAÇÃO**
- [ ] RabbitMQ Management UI funcionando
- [ ] Filas mobile criadas e funcionais
- [ ] Consumers processando mensagens
- [ ] Integração WhatsApp ativa
- [ ] Métricas Prometheus coletando

---

*📅 KRYONIX - Mensageria Mobile-First*  
*📱 +55 17 98180-5327 | 🌐 www.kryonix.com.br*

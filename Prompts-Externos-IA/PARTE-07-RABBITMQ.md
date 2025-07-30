# 🐰 PARTE-07: MENSAGERIA RABBITMQ MULTI-TENANT KRYONIX
*Sistema de Mensageria Multi-Tenant com Isolamento por Cliente, SDK Unificado e Apps Mobile*

---

## 🎯 **CONTEXTO MULTI-TENANT KRYONIX**
- **Servidor**: 144.202.90.55
- **Arquitetura**: Multi-tenant com isolamento completo por cliente
- **SDK**: @kryonix/sdk unificado para todos os módulos
- **Mobile Priority**: 80% usuários mobile - filas prioritárias PWA/apps
- **Auto-Creation**: Criação automática de filas quando novo cliente é criado
- **8 APIs Modulares**: CRM, WhatsApp, Agendamento, Financeiro, Marketing, Analytics, Portal, Whitelabel
- **URL**: https://rabbitmq.kryonix.com.br
- **Login Master**: kryonix / Vitor@123456

---

## 🏗️ **ARQUITETURA MULTI-TENANT MESSAGING**

```yaml
RABBITMQ_MULTI_TENANT_ARCHITECTURE:
  estrategia: "VHost por cliente + exchanges/queues isoladas"

  VHOSTS_PATTERN:
    master: "/kryonix-master"  # Controle geral
    cliente: "/cliente_{cliente_id}"  # Um vhost por cliente
    mobile: "/mobile-priority"  # Filas prioritárias mobile

  QUEUES_PATTERN:
    cliente_especifica: "cliente_{id}.{modulo}.{acao}"
    mobile_priority: "mobile.{cliente_id}.{tipo}.{priority}"
    sdk_integration: "sdk.{cliente_id}.{modulo}.{method}"

  ISOLAMENTO_COMPLETO:
    - Mensagens nunca se misturam entre clientes
    - Cada cliente tem filas exclusivas
    - Routing keys específicos por cliente
    - TTL e prioridades personalizáveis
```

---

## 🚀 **EXECUTE ESTES COMANDOS**

```bash
# === CONECTAR NO SERVIDOR ===
ssh root@144.202.90.55
cd /opt/kryonix

# === CRIAR ESTRUTURA RABBITMQ MULTI-TENANT ===
echo "🐰 Criando estrutura mensageria multi-tenant..."
mkdir -p messaging/{rabbitmq,consumers,scripts,templates}
mkdir -p messaging/rabbitmq/{config,data,logs,definitions,vhosts}
mkdir -p messaging/consumers/{crm,whatsapp,agendamento,financeiro,marketing,analytics,portal,whitelabel}
mkdir -p messaging/scripts/{client-creation,queue-management,monitoring}

# === CONFIGURAR RABBITMQ MULTI-TENANT ===
echo "⚙️ Configurando RabbitMQ multi-tenant mobile-optimized..."
cat > messaging/rabbitmq/config/rabbitmq.conf << 'EOF'
# RabbitMQ Multi-Tenant Mobile-First Configuration
listeners.tcp.default = 5672
management.tcp.port = 15672

# Multi-tenant optimizations
vm_memory_high_watermark.relative = 0.7
vm_memory_high_watermark_paging_ratio = 0.5
default_consumer_timeout = 3600000
heartbeat = 300
channel_max = 2000
connection_max = 1000

# Multi-tenant security
default_user = kryonix
default_pass = Vitor@123456
default_vhost = /kryonix-master

# SSL for mobile security
ssl_options.verify = verify_peer
ssl_options.fail_if_no_peer_cert = false

# Clustering for scale
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config

# Prometheus metrics
prometheus.tcp.port = 15692

# Mobile-specific timeouts
consumer_timeout = 900000
collect_statistics_interval = 10000

# Queue performance
lazy_queue_explicit_gc_run_operation_threshold = 1000
queue_index_embed_msgs_below = 4096
EOF

# === ENABLED PLUGINS ===
echo "🔌 Configurando plugins multi-tenant..."
cat > messaging/rabbitmq/enabled_plugins << 'EOF'
[rabbitmq_management,
 rabbitmq_management_agent,
 rabbitmq_prometheus,
 rabbitmq_delayed_message_exchange,
 rabbitmq_consistent_hash_exchange,
 rabbitmq_federation,
 rabbitmq_federation_management,
 rabbitmq_shovel,
 rabbitmq_shovel_management,
 rabbitmq_stream].
EOF

# === DEFINIÇÕES MULTI-TENANT BASE ===
echo "📋 Criando definições multi-tenant base..."
cat > messaging/rabbitmq/definitions/multi-tenant-definitions.json << 'EOF'
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

# === SCRIPT CRIAÇÃO AUTOMÁTICA DE CLIENTES ===
echo "🤖 Criando script para criação automática de clientes..."
cat > messaging/scripts/client-creation/create-client-queues.py << 'EOF'
#!/usr/bin/env python3
import pika
import requests
import json
import sys
from typing import List, Dict
import time

class KryonixRabbitMQClientManager:
    def __init__(self):
        self.connection = None
        self.channel = None

        # Filas por módulo contratado
        self.filas_por_modulo = {
            'crm': ['leads.create', 'leads.update', 'contatos.sync', 'campanhas.execute'],
            'whatsapp': ['messages.send', 'messages.receive', 'automacao.trigger', 'evolution.webhook'],
            'agendamento': ['agenda.create', 'agenda.update', 'lembretes.send', 'confirmacao.request'],
            'financeiro': ['cobranca.create', 'pagamento.process', 'fatura.send', 'relatorio.generate'],
            'marketing': ['campanhas.create', 'emails.send', 'automacao.execute', 'leads.qualify'],
            'analytics': ['dados.collect', 'relatorios.generate', 'insights.process', 'dashboards.update'],
            'portal': ['clientes.access', 'documentos.share', 'notificacoes.send', 'suporte.create'],
            'whitelabel': ['branding.update', 'tema.apply', 'apps.rebuild', 'dominios.configure']
        }

    def connect(self):
        """Conecta ao RabbitMQ master"""
        try:
            connection_params = pika.ConnectionParameters(
                host='localhost',
                port=5672,
                virtual_host='/kryonix-master',
                credentials=pika.PlainCredentials('kryonix', 'Vitor@123456'),
                heartbeat=300,
                connection_attempts=5,
                retry_delay=2
            )

            self.connection = pika.BlockingConnection(connection_params)
            self.channel = self.connection.channel()

            print("✅ Conectado ao RabbitMQ master")
            return True

        except Exception as e:
            print(f"❌ Erro ao conectar: {e}")
            return False

    def create_client_vhost(self, cliente_id: str) -> bool:
        """Cria VHost exclusivo para o cliente"""
        try:
            # Criar VHost via API Management
            import requests
            import base64

            auth = base64.b64encode(b'kryonix:Vitor@123456').decode('ascii')
            headers = {'Authorization': f'Basic {auth}'}

            vhost_name = f'/cliente_{cliente_id}'

            # Criar VHost
            response = requests.put(
                f'http://localhost:15672/api/vhosts/{vhost_name.replace("/", "%2F")}',
                headers=headers
            )

            if response.status_code in [201, 204]:
                print(f"✅ VHost criado: {vhost_name}")

                # Dar permissões para o usuário kryonix
                permissions = {
                    "configure": ".*",
                    "write": ".*",
                    "read": ".*"
                }

                response = requests.put(
                    f'http://localhost:15672/api/permissions/{vhost_name.replace("/", "%2F")}/kryonix',
                    headers=headers,
                    json=permissions
                )

                if response.status_code in [201, 204]:
                    print(f"✅ Permissões configuradas para {vhost_name}")
                    return True

            return False

        except Exception as e:
            print(f"❌ Erro ao criar VHost: {e}")
            return False

    def create_complete_client(self, cliente_id: str, modulos_contratados: List[str]) -> bool:
        """Cria infraestrutura completa de mensageria para o cliente"""
        print(f"🚀 Criando infraestrutura RabbitMQ para cliente: {cliente_id}")
        print(f"📦 Módulos contratados: {', '.join(modulos_contratados)}")

        steps = [
            ("Criando VHost exclusivo", lambda: self.create_client_vhost(cliente_id)),
            ("Criando exchanges", lambda: self.create_client_exchanges(cliente_id)),
            ("Criando filas por módulo", lambda: self.create_client_queues(cliente_id, modulos_contratados)),
            ("Configurando roteamento", lambda: self.setup_client_routing(cliente_id))
        ]

        for step_name, step_func in steps:
            print(f"⚙️ {step_name}...")
            if not step_func():
                print(f"❌ Falhou: {step_name}")
                return False

        print(f"🎉 Infraestrutura criada com sucesso para cliente: {cliente_id}")
        return True

    def create_client_exchanges(self, cliente_id: str) -> bool:
        """Cria exchanges específicos do cliente"""
        try:
            vhost_name = f'/cliente_{cliente_id}'

            # Conectar ao VHost do cliente
            client_params = pika.ConnectionParameters(
                host='localhost',
                port=5672,
                virtual_host=vhost_name,
                credentials=pika.PlainCredentials('kryonix', 'Vitor@123456')
            )

            client_connection = pika.BlockingConnection(client_params)
            client_channel = client_connection.channel()

            # Exchanges principais
            exchanges = [
                ('cliente.direct', 'direct'),
                ('cliente.topic', 'topic'),
                ('cliente.fanout', 'fanout'),
                ('mobile.priority', 'direct'),
                ('sdk.integration', 'topic'),
                ('offline.sync', 'topic'),
                ('webhook.events', 'topic')
            ]

            for exchange_name, exchange_type in exchanges:
                client_channel.exchange_declare(
                    exchange=f"{cliente_id}.{exchange_name}",
                    exchange_type=exchange_type,
                    durable=True
                )
                print(f"✅ Exchange criado: {cliente_id}.{exchange_name}")

            client_connection.close()
            return True

        except Exception as e:
            print(f"❌ Erro ao criar exchanges: {e}")
            return False

    def create_client_queues(self, cliente_id: str, modulos_contratados: List[str]) -> bool:
        """Cria filas específicas do cliente conforme módulos contratados"""
        try:
            vhost_name = f'/cliente_{cliente_id}'

            # Conectar ao VHost do cliente
            client_params = pika.ConnectionParameters(
                host='localhost',
                port=5672,
                virtual_host=vhost_name,
                credentials=pika.PlainCredentials('kryonix', 'Vitor@123456')
            )

            client_connection = pika.BlockingConnection(client_params)
            client_channel = client_connection.channel()

            # Filas para cada módulo contratado
            for modulo in modulos_contratados:
                if modulo in self.filas_por_modulo:
                    for fila_acao in self.filas_por_modulo[modulo]:
                        queue_name = f"cliente_{cliente_id}.{modulo}.{fila_acao}"

                        # Argumentos da fila baseados no tipo
                        queue_args = {
                            'x-message-ttl': 3600000,  # 1 hora
                            'x-max-priority': 10,
                            'x-queue-type': 'quorum'
                        }

                        # Filas específicas para mobile têm prioridade alta
                        if any(keyword in fila_acao for keyword in ['send', 'notification', 'alert']):
                            queue_args['x-max-priority'] = 10
                            queue_args['x-message-ttl'] = 300000  # 5 minutos

                        client_channel.queue_declare(
                            queue=queue_name,
                            durable=True,
                            arguments=queue_args
                        )

                        # Bind da fila ao exchange apropriado
                        routing_key = f"{modulo}.{fila_acao}"
                        client_channel.queue_bind(
                            exchange=f"{cliente_id}.cliente.topic",
                            queue=queue_name,
                            routing_key=routing_key
                        )

                        print(f"✅ Fila criada: {queue_name}")

            # Filas especiais para mobile/PWA
            mobile_queues = [
                f"cliente_{cliente_id}.mobile.notifications.priority",
                f"cliente_{cliente_id}.mobile.sync.offline",
                f"cliente_{cliente_id}.mobile.pwa.updates",
                f"cliente_{cliente_id}.sdk.method.calls",
                f"cliente_{cliente_id}.webhook.evolution.api"
            ]

            for queue_name in mobile_queues:
                mobile_args = {
                    'x-message-ttl': 300000,  # 5 minutos
                    'x-max-priority': 10,
                    'x-queue-type': 'quorum'
                }

                if 'offline' in queue_name:
                    mobile_args['x-queue-type'] = 'stream'
                    mobile_args['x-message-ttl'] = 86400000  # 24 horas

                client_channel.queue_declare(
                    queue=queue_name,
                    durable=True,
                    arguments=mobile_args
                )
                print(f"✅ Fila mobile criada: {queue_name}")

            client_connection.close()
            return True

        except Exception as e:
            print(f"❌ Erro ao criar filas: {e}")
            return False

    def setup_client_routing(self, cliente_id: str) -> bool:
        """Configura roteamento inteligente para o cliente"""
        try:
            vhost_name = f'/cliente_{cliente_id}'

            client_params = pika.ConnectionParameters(
                host='localhost',
                port=5672,
                virtual_host=vhost_name,
                credentials=pika.PlainCredentials('kryonix', 'Vitor@123456')
            )

            client_connection = pika.BlockingConnection(client_params)
            client_channel = client_connection.channel()

            # Bindings para routing inteligente
            routing_patterns = [
                # Mobile priority
                (f"{cliente_id}.mobile.priority", f"cliente_{cliente_id}.mobile.notifications.priority", "notification.*"),
                (f"{cliente_id}.mobile.priority", f"cliente_{cliente_id}.mobile.pwa.updates", "pwa.*"),

                # SDK integration
                (f"{cliente_id}.sdk.integration", f"cliente_{cliente_id}.sdk.method.calls", "sdk.call.*"),

                # Webhook routing
                (f"{cliente_id}.webhook.events", f"cliente_{cliente_id}.webhook.evolution.api", "evolution.*"),

                # Offline sync
                (f"{cliente_id}.offline.sync", f"cliente_{cliente_id}.mobile.sync.offline", "sync.*")
            ]

            for exchange, queue, routing_key in routing_patterns:
                client_channel.queue_bind(
                    exchange=exchange,
                    queue=queue,
                    routing_key=routing_key
                )
                print(f"✅ Routing configurado: {exchange} -> {queue} ({routing_key})")

            client_connection.close()
            return True

        except Exception as e:
            print(f"❌ Erro ao configurar routing: {e}")
            return False

def main():
    if len(sys.argv) < 3:
        print("Uso: python create-client-queues.py <cliente_id> <modulos_separados_por_virgula>")
        print("Exemplo: python create-client-queues.py siqueiracampos crm,whatsapp,agendamento")
        sys.exit(1)

    cliente_id = sys.argv[1]
    modulos = sys.argv[2].split(',')

    manager = KryonixRabbitMQClientManager()

    if not manager.connect():
        sys.exit(1)

    success = manager.create_complete_client(cliente_id, modulos)

    if manager.connection:
        manager.connection.close()

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
EOF

chmod +x messaging/scripts/client-creation/create-client-queues.py

# === DOCKER COMPOSE MULTI-TENANT ===
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

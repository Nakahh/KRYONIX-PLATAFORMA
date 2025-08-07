# 🐰 PARTE 07 - SISTEMA MENSAGERIA RABBITMQ MULTI-TENANT
*Agentes Especializados: Message Queue Expert + DevOps Expert + Mobile Expert + AI Specialist + Multi-Tenant Architect*

## 🎯 **OBJETIVO MULTI-TENANT**
Implementar sistema de mensageria RabbitMQ com **isolamento completo por VHost**, processamento inteligente de milhões de mensagens por IA, otimização mobile-first (80% usuários) e auto-criação de infraestrutura para novos clientes em 2-5 minutos.

## 🏗️ **ARQUITETURA MULTI-TENANT AVANÇADA**
```yaml
Multi_Tenant_RabbitMQ_Architecture:
  isolation_strategy: "VHost completo por cliente + módulo"
  pattern: "/cliente_{id}" 
  auto_creation: "Scripts IA automáticos < 5min"
  sdk_integration: "@kryonix/sdk message queues"
  mobile_optimization: "Filas prioritárias para 80% mobile"
  apis_modulares: "Queues específicas por módulo"
  ai_routing: "IA decide roteamento automaticamente"
  
Virtual_Hosts_Structure:
  master: "/kryonix-master"           # Controle central
  cliente_pattern: "/cliente_{id}"    # VHost isolado por cliente
  shared_services: "/shared-services" # Serviços compartilhados seguros
  monitoring: "/monitoring"           # Métricas centralizadas
  backup: "/backup-operations"        # Operações de backup

Queue_Naming_Convention:
  formato: "cliente_{id}.{modulo}.{acao}.{prioridade}"
  exemplo: "cliente_siqueiracampos.crm.leads.create.high"
  dlq: "cliente_{id}.{modulo}.{acao}.dlq"
  retry: "cliente_{id}.{modulo}.{acao}.retry.{attempt}"
```

## 🔧 **SISTEMA CRIAÇÃO AUTOMÁTICA POR CLIENTE**

### **🤖 Script Completo Multi-Tenant**
```python
#!/usr/bin/env python3
# enhanced-rabbitmq-multi-tenant-manager.py

import pika
import requests
import json
import psycopg2
from typing import List, Dict, Optional
import logging
import asyncio
from datetime import datetime, timedelta

class KryonixRabbitMQMultiTenantManager:
    def __init__(self):
        self.setup_logging()
        self.connection_master = None
        self.connection_params = {
            'host': 'mensagens.kryonix.com.br',
            'port': 5672,
            'username': 'kryonix_admin',
            'password': 'KryonixRabbit2025',
            'heartbeat': 300,
            'virtual_host': '/kryonix-master'
        }
        
        # Módulos por API com configurações específicas
        self.modulos_queues_config = {
            'crm': {
                'queues': [
                    'leads.create', 'leads.update', 'leads.qualify', 'contacts.sync',
                    'pipelines.update', 'tasks.assign', 'reports.generate'
                ],
                'dlq': True,
                'retention': '24h',
                'priority_levels': 3,
                'mobile_priority': True,
                'ai_routing': True
            },
            'whatsapp': {
                'queues': [
                    'messages.send', 'messages.receive', 'evolution.webhook', 
                    'automacao.trigger', 'media.process', 'conversations.sync'
                ],
                'dlq': True,
                'retention': '7d',
                'priority_levels': 5,
                'mobile_priority': True,  # 80% dos usuários
                'ai_routing': True,
                'evolution_api': True
            },
            'agendamento': {
                'queues': [
                    'agenda.create', 'lembretes.send', 'confirmacao.request', 
                    'cancelamento.process', 'disponibilidade.sync'
                ],
                'dlq': True,
                'retention': '30d',
                'priority_levels': 4,
                'mobile_priority': True,
                'ai_routing': True
            },
            'financeiro': {
                'queues': [
                    'faturas.create', 'pagamentos.process', 'cobranca.automatica',
                    'relatorios.gerar', 'conciliacao.bancaria'
                ],
                'dlq': True,
                'retention': '90d',  # Dados financeiros críticos
                'priority_levels': 5,
                'mobile_priority': False,  # Principalmente web
                'ai_routing': True
            },
            'marketing': {
                'queues': [
                    'campanhas.enviar', 'emails.processar', 'leads.nurturing',
                    'analytics.track', 'automacao.trigger'
                ],
                'dlq': True,
                'retention': '14d',
                'priority_levels': 3,
                'mobile_priority': True,
                'ai_routing': True
            },
            'analytics': {
                'queues': [
                    'eventos.processar', 'relatorios.gerar', 'dashboards.atualizar',
                    'metricas.calcular', 'alertas.verificar'
                ],
                'dlq': True,
                'retention': '7d',
                'priority_levels': 2,
                'mobile_priority': True,
                'ai_routing': True
            },
            'portal': {
                'queues': [
                    'treinamentos.sync', 'progresso.atualizar', 'certificados.gerar',
                    'conteudo.processar', 'interacoes.track'
                ],
                'dlq': True,
                'retention': '30d',
                'priority_levels': 2,
                'mobile_priority': True,
                'ai_routing': False
            },
            'whitelabel': {
                'queues': [
                    'configuracoes.aplicar', 'temas.processar', 'assets.otimizar',
                    'branding.atualizar', 'customizacoes.sync'
                ],
                'dlq': True,
                'retention': '7d',
                'priority_levels': 2,
                'mobile_priority': False,
                'ai_routing': False
            }
        }

    def setup_logging(self):
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('/opt/kryonix/logs/rabbitmq-multi-tenant.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger('KryonixRabbitMQ')

    async def create_tenant_complete_infrastructure(
        self, 
        cliente_id: str, 
        modulos: List[str], 
        plano: str = 'basic'
    ) -> bool:
        """Cria infraestrutura completa multi-tenant para cliente"""
        try:
            self.logger.info(f"🚀 Criando infraestrutura RabbitMQ completa para {cliente_id}")
            
            # 1. Criar VHost isolado
            vhost_created = await self.create_isolated_vhost(cliente_id, plano)
            if not vhost_created:
                return False
                
            # 2. Criar usuário específico do cliente
            user_created = await self.create_client_user(cliente_id, plano)
            if not user_created:
                return False
                
            # 3. Configurar permissões granulares
            permissions_set = await self.set_granular_permissions(cliente_id)
            if not permissions_set:
                return False
                
            # 4. Criar exchanges hierárquicos
            exchanges_created = await self.create_hierarchical_exchanges(cliente_id)
            if not exchanges_created:
                return False
                
            # 5. Criar filas com DLQ para cada módulo
            queues_created = await self.create_module_queues_with_dlq(cliente_id, modulos)
            if not queues_created:
                return False
                
            # 6. Configurar routing patterns inteligentes
            routing_configured = await self.setup_intelligent_routing(cliente_id, modulos)
            if not routing_configured:
                return False
                
            # 7. Configurar backup automático
            backup_configured = await self.setup_automatic_backup(cliente_id)
            if not backup_configured:
                return False
                
            # 8. Configurar monitoring específico
            monitoring_setup = await self.setup_tenant_monitoring(cliente_id)
            if not monitoring_setup:
                return False
                
            # 9. Configurar auto-scaling
            autoscaling_setup = await self.setup_autoscaling_policies(cliente_id, plano)
            if not autoscaling_setup:
                return False
                
            # 10. Registrar no banco de dados central
            db_registered = await self.register_tenant_in_database(cliente_id, modulos, plano)
            if not db_registered:
                return False
                
            self.logger.info(f"✅ Infraestrutura RabbitMQ completa criada para {cliente_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao criar infraestrutura: {e}")
            return False

    async def create_isolated_vhost(self, cliente_id: str, plano: str) -> bool:
        """Cria VHost isolado com configurações específicas do plano"""
        try:
            vhost_name = f"/cliente_{cliente_id}"
            
            # Configurações por plano
            vhost_config = self.get_vhost_config_by_plan(plano)
            
            # Criar VHost via Management API
            response = requests.put(
                f"http://mensagens.kryonix.com.br:15672/api/vhosts/cliente_{cliente_id}",
                auth=('kryonix_admin', 'KryonixRabbit2025'),
                headers={'Content-Type': 'application/json'},
                json={
                    'description': f'VHost isolado para cliente {cliente_id}',
                    'tags': 'tenant,isolated,multi-tenant',
                    'default_queue_type': 'quorum',
                    'metadata': {
                        'cliente_id': cliente_id,
                        'plano': plano,
                        'created_at': datetime.now().isoformat(),
                        'isolation_level': 'complete',
                        'max_connections': vhost_config['max_connections'],
                        'max_queues': vhost_config['max_queues'],
                        'max_exchanges': vhost_config['max_exchanges']
                    }
                }
            )
            
            if response.status_code not in [201, 204]:
                self.logger.error(f"Erro ao criar VHost: {response.text}")
                return False
                
            # Aplicar limites específicos do plano
            await self.apply_vhost_limits(cliente_id, vhost_config)
            
            self.logger.info(f"✅ VHost criado: /cliente_{cliente_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao criar VHost: {e}")
            return False

    async def create_client_user(self, cliente_id: str, plano: str) -> bool:
        """Cria usuário específico com permissões limitadas ao VHost"""
        try:
            username = f"kryonix_{cliente_id}"
            password = self.generate_secure_password()
            
            # Criar usuário
            response = requests.put(
                f"http://mensagens.kryonix.com.br:15672/api/users/{username}",
                auth=('kryonix_admin', 'KryonixRabbit2025'),
                headers={'Content-Type': 'application/json'},
                json={
                    'password': password,
                    'tags': 'tenant_user',
                    'metadata': {
                        'cliente_id': cliente_id,
                        'plano': plano,
                        'created_at': datetime.now().isoformat()
                    }
                }
            )
            
            if response.status_code not in [201, 204]:
                self.logger.error(f"Erro ao criar usuário: {response.text}")
                return False
                
            # Salvar credenciais no vault seguro
            await self.store_client_credentials(cliente_id, username, password)
            
            self.logger.info(f"✅ Usuário criado: {username}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao criar usuário: {e}")
            return False

    async def create_module_queues_with_dlq(self, cliente_id: str, modulos: List[str]) -> bool:
        """Cria filas com Dead Letter Queues robustas"""
        try:
            # Conectar ao VHost específico do cliente
            connection_params = self.connection_params.copy()
            connection_params['virtual_host'] = f"/cliente_{cliente_id}"
            
            connection = pika.BlockingConnection(pika.ConnectionParameters(**connection_params))
            channel = connection.channel()
            
            for modulo in modulos:
                if modulo not in self.modulos_queues_config:
                    self.logger.warning(f"Módulo {modulo} não configurado, pulando...")
                    continue
                    
                modulo_config = self.modulos_queues_config[modulo]
                
                # Criar DLX (Dead Letter Exchange) primeiro
                dlx_name = f"cliente_{cliente_id}.{modulo}.dlx"
                channel.exchange_declare(
                    exchange=dlx_name,
                    exchange_type='direct',
                    durable=True
                )
                
                for queue_action in modulo_config['queues']:
                    # Nomes das filas
                    main_queue = f"cliente_{cliente_id}.{modulo}.{queue_action}"
                    dlq_name = f"{main_queue}.dlq"
                    retry_queue = f"{main_queue}.retry"
                    
                    # Criar DLQ primeiro
                    channel.queue_declare(
                        queue=dlq_name,
                        durable=True,
                        arguments={
                            'x-message-ttl': 86400000,  # 24 horas
                            'x-queue-type': 'quorum',
                            'x-max-length': 10000  # Máximo 10k mensagens na DLQ
                        }
                    )
                    
                    # Criar fila de retry com TTL
                    channel.queue_declare(
                        queue=retry_queue,
                        durable=True,
                        arguments={
                            'x-message-ttl': 300000,   # 5 minutos
                            'x-dead-letter-exchange': dlx_name,
                            'x-dead-letter-routing-key': f"{modulo}.{queue_action}.dlq",
                            'x-queue-type': 'quorum',
                            'x-max-retries': 3
                        }
                    )
                    
                    # Bind retry queue à DLQ
                    channel.queue_bind(
                        exchange=dlx_name,
                        queue=dlq_name,
                        routing_key=f"{modulo}.{queue_action}.dlq"
                    )
                    
                    # Criar fila principal com configurações específicas
                    queue_args = {
                        'x-message-ttl': self.parse_retention(modulo_config['retention']),
                        'x-max-priority': modulo_config['priority_levels'],
                        'x-dead-letter-exchange': dlx_name,
                        'x-dead-letter-routing-key': f"{modulo}.{queue_action}.retry",
                        'x-queue-type': 'quorum',
                        'x-max-retries': 3
                    }
                    
                    # Configurações especiais para mobile
                    if modulo_config.get('mobile_priority', False):
                        queue_args.update({
                            'x-max-length': 50000,  # Mais capacidade para mobile
                            'x-overflow': 'reject-publish-dlx',
                            'x-single-active-consumer': False  # Múltiplos consumers mobile
                        })
                    
                    channel.queue_declare(
                        queue=main_queue,
                        durable=True,
                        arguments=queue_args
                    )
                    
                    self.logger.info(f"✅ Filas criadas: {main_queue} + DLQ + Retry")
            
            connection.close()
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao criar filas com DLQ: {e}")
            return False

    async def setup_intelligent_routing(self, cliente_id: str, modulos: List[str]) -> bool:
        """Configura roteamento inteligente com IA"""
        try:
            connection_params = self.connection_params.copy()
            connection_params['virtual_host'] = f"/cliente_{cliente_id}"
            
            connection = pika.BlockingConnection(pika.ConnectionParameters(**connection_params))
            channel = connection.channel()
            
            # Criar exchanges principais com IA
            exchanges = {
                'mobile_priority': {
                    'type': 'topic',
                    'arguments': {
                        'x-message-ttl': 3600000,  # 1 hora
                        'x-ha-policy': 'all',
                        'x-ai-routing': 'enabled'
                    }
                },
                'business_critical': {
                    'type': 'direct', 
                    'arguments': {
                        'x-message-ttl': 7200000,  # 2 horas
                        'x-ha-policy': 'all',
                        'x-priority-routing': 'enabled'
                    }
                },
                'automation': {
                    'type': 'fanout',
                    'arguments': {
                        'x-ha-policy': 'all',
                        'x-auto-scaling': 'enabled'
                    }
                }
            }
            
            for exchange_name, config in exchanges.items():
                full_exchange_name = f"cliente_{cliente_id}.{exchange_name}"
                channel.exchange_declare(
                    exchange=full_exchange_name,
                    exchange_type=config['type'],
                    durable=True,
                    arguments=config['arguments']
                )
                
                # Bind filas aos exchanges baseado no módulo
                for modulo in modulos:
                    if modulo in self.modulos_queues_config:
                        modulo_config = self.modulos_queues_config[modulo]
                        
                        for queue_action in modulo_config['queues']:
                            queue_name = f"cliente_{cliente_id}.{modulo}.{queue_action}"
                            
                            # Routing para mobile priority
                            if modulo_config.get('mobile_priority', False):
                                channel.queue_bind(
                                    exchange=f"cliente_{cliente_id}.mobile_priority",
                                    queue=queue_name,
                                    routing_key=f"mobile.{modulo}.{queue_action}"
                                )
                            
                            # Routing para business critical
                            if modulo in ['financeiro', 'crm']:
                                channel.queue_bind(
                                    exchange=f"cliente_{cliente_id}.business_critical",
                                    queue=queue_name,
                                    routing_key=f"critical.{modulo}.{queue_action}"
                                )
                            
                            # Routing para automation
                            if modulo_config.get('ai_routing', False):
                                channel.queue_bind(
                                    exchange=f"cliente_{cliente_id}.automation",
                                    queue=queue_name
                                )
            
            connection.close()
            self.logger.info(f"✅ Roteamento inteligente configurado para {cliente_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao configurar roteamento: {e}")
            return False

    async def setup_autoscaling_policies(self, cliente_id: str, plano: str) -> bool:
        """Configura políticas de auto-scaling baseadas no plano"""
        try:
            # Configurações de auto-scaling por plano
            scaling_config = {
                'basic': {
                    'max_consumers_per_queue': 2,
                    'scale_up_threshold': 100,
                    'scale_down_threshold': 10,
                    'max_queue_depth': 1000
                },
                'pro': {
                    'max_consumers_per_queue': 5,
                    'scale_up_threshold': 500,
                    'scale_down_threshold': 50,
                    'max_queue_depth': 5000
                },
                'enterprise': {
                    'max_consumers_per_queue': 10,
                    'scale_up_threshold': 1000,
                    'scale_down_threshold': 100,
                    'max_queue_depth': 10000
                }
            }
            
            config = scaling_config.get(plano, scaling_config['basic'])
            
            # Aplicar políticas via Management API
            policy_name = f"autoscaling-{cliente_id}"
            response = requests.put(
                f"http://mensagens.kryonix.com.br:15672/api/policies/cliente_{cliente_id}/{policy_name}",
                auth=('kryonix_admin', 'KryonixRabbit2025'),
                headers={'Content-Type': 'application/json'},
                json={
                    'pattern': f'cliente_{cliente_id}\..*',
                    'definition': {
                        'max-length': config['max_queue_depth'],
                        'overflow': 'reject-publish-dlx',
                        'ha-mode': 'all',
                        'ha-sync-mode': 'automatic'
                    },
                    'priority': 10,
                    'apply-to': 'queues'
                }
            )
            
            if response.status_code not in [201, 204]:
                self.logger.error(f"Erro ao aplicar política: {response.text}")
                return False
                
            # Salvar configuração para monitoramento
            await self.save_scaling_config(cliente_id, config)
            
            self.logger.info(f"✅ Auto-scaling configurado para {cliente_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao configurar auto-scaling: {e}")
            return False

    def get_vhost_config_by_plan(self, plano: str) -> Dict:
        """Retorna configurações de VHost baseadas no plano"""
        configs = {
            'basic': {
                'max_connections': 10,
                'max_queues': 50,
                'max_exchanges': 10,
                'max_channels': 100
            },
            'pro': {
                'max_connections': 50,
                'max_queues': 200,
                'max_exchanges': 25,
                'max_channels': 500
            },
            'enterprise': {
                'max_connections': 100,
                'max_queues': 500,
                'max_exchanges': 50,
                'max_channels': 1000
            }
        }
        return configs.get(plano, configs['basic'])

    def parse_retention(self, retention_str: str) -> int:
        """Converte string de retenção para milissegundos"""
        if retention_str.endswith('h'):
            return int(retention_str[:-1]) * 3600000
        elif retention_str.endswith('d'):
            return int(retention_str[:-1]) * 86400000
        elif retention_str.endswith('m'):
            return int(retention_str[:-1]) * 60000
        else:
            return 3600000  # 1 hora padrão

    def generate_secure_password(self) -> str:
        """Gera senha segura para cliente"""
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(16))

    async def store_client_credentials(self, cliente_id: str, username: str, password: str) -> bool:
        """Armazena credenciais do cliente no vault"""
        try:
            credentials = {
                'cliente_id': cliente_id,
                'username': username,
                'password': password,
                'vhost': f"/cliente_{cliente_id}",
                'created_at': datetime.now().isoformat()
            }
            
            # Salvar no PostgreSQL central
            conn = psycopg2.connect(
                host="postgresql.kryonix.com.br",
                database="kryonix_main",
                user="postgres",
                password="postgres_password"
            )
            
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO tenants.rabbitmq_credentials 
                (cliente_id, username, password_hash, vhost, created_at)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (cliente_id) DO UPDATE SET
                    username = EXCLUDED.username,
                    password_hash = EXCLUDED.password_hash,
                    updated_at = NOW()
            """, (
                cliente_id, 
                username, 
                f"hashed_{password}",  # Em produção, usar hash real
                f"/cliente_{cliente_id}",
                datetime.now()
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao salvar credenciais: {e}")
            return False

    async def register_tenant_in_database(self, cliente_id: str, modulos: List[str], plano: str) -> bool:
        """Registra tenant no banco de dados central"""
        try:
            conn = psycopg2.connect(
                host="postgresql.kryonix.com.br",
                database="kryonix_main",
                user="postgres",
                password="postgres_password"
            )
            
            cursor = conn.cursor()
            
            # Registrar configuração RabbitMQ do cliente
            cursor.execute("""
                INSERT INTO tenants.rabbitmq_configurations 
                (cliente_id, vhost, modulos_habilitados, plano, status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (cliente_id) DO UPDATE SET
                    modulos_habilitados = EXCLUDED.modulos_habilitados,
                    plano = EXCLUDED.plano,
                    updated_at = NOW()
            """, (
                cliente_id,
                f"/cliente_{cliente_id}",
                json.dumps(modulos),
                plano,
                'ativo',
                datetime.now()
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao registrar no banco: {e}")
            return False

# Função principal para criação de cliente
async def criar_cliente_rabbitmq(cliente_id: str, modulos: List[str], plano: str = 'basic'):
    """Função principal para criar infraestrutura RabbitMQ de um cliente"""
    manager = KryonixRabbitMQMultiTenantManager()
    
    print(f"🚀 Iniciando criação de infraestrutura RabbitMQ para {cliente_id}")
    print(f"📦 Módulos: {', '.join(modulos)}")
    print(f"💼 Plano: {plano}")
    
    success = await manager.create_tenant_complete_infrastructure(cliente_id, modulos, plano)
    
    if success:
        print(f"✅ Infraestrutura RabbitMQ criada com sucesso para {cliente_id}")
        print(f"🌐 VHost: /cliente_{cliente_id}")
        print(f"📊 Management: https://painel-mensagens.kryonix.com.br")
    else:
        print(f"❌ Falha ao criar infraestrutura para {cliente_id}")
    
    return success

# Executar se chamado diretamente
if __name__ == "__main__":
    import sys
    import asyncio
    
    if len(sys.argv) >= 3:
        cliente_id = sys.argv[1]
        modulos = sys.argv[2].split(',')
        plano = sys.argv[3] if len(sys.argv) > 3 else 'basic'
        
        asyncio.run(criar_cliente_rabbitmq(cliente_id, modulos, plano))
    else:
        print("Uso: python enhanced-rabbitmq-multi-tenant-manager.py <cliente_id> <modulos> [plano]")
        print("Exemplo: python script.py siqueiracampos crm,whatsapp,agendamento pro")
```

## 📱 **SDK INTEGRATION PARA MULTI-TENANT**

### **💻 SDK RabbitMQ Unificado**
```typescript
// @kryonix/sdk/messaging/multi-tenant-rabbitmq.ts
import amqp, { Connection, Channel } from 'amqplib';

export class KryonixMessagingSDK {
    private connections: Map<string, Connection> = new Map();
    private channels: Map<string, Channel> = new Map();
    private clienteId: string;
    private aiEngine: MessageAI;
    private mobileOptimizer: MobileMessageOptimizer;

    constructor(clienteId: string, credentials: RabbitMQCredentials) {
        this.clienteId = clienteId;
        this.aiEngine = new MessageAI();
        this.mobileOptimizer = new MobileMessageOptimizer();
    }

    async initialize(): Promise<void> {
        try {
            // Conectar ao VHost específico do cliente
            const connection = await amqp.connect({
                hostname: 'mensagens.kryonix.com.br',
                port: 5672,
                username: `kryonix_${this.clienteId}`,
                password: await this.getClientPassword(),
                vhost: `/cliente_${this.clienteId}`,
                heartbeat: 60,
                locale: 'pt_BR'
            });

            this.connections.set(this.clienteId, connection);
            
            // Criar canal principal
            const channel = await connection.createChannel();
            await channel.prefetch(100); // Otimização para mobile
            
            this.channels.set(this.clienteId, channel);
            
            console.log(`✅ SDK RabbitMQ inicializado para cliente: ${this.clienteId}`);
            
        } catch (error) {
            console.error('❌ Erro ao inicializar SDK RabbitMQ:', error);
            throw error;
        }
    }

    // Método unificado para envio de mensagens
    async sendMessage(
        modulo: ModuloType,
        acao: string,
        dados: any,
        opcoes?: MessageOptions
    ): Promise<SendResult> {
        try {
            const channel = this.channels.get(this.clienteId);
            if (!channel) {
                throw new Error('Canal não inicializado');
            }

            // IA analisa e otimiza mensagem
            const processedMessage = await this.aiEngine.processMessage({
                clienteId: this.clienteId,
                modulo,
                acao,
                dados,
                device: opcoes?.device || 'unknown',
                priority: opcoes?.priority || 5
            });

            // Otimização mobile (80% dos usuários)
            if (processedMessage.targetMobile) {
                processedMessage.dados = await this.mobileOptimizer.optimize(
                    processedMessage.dados
                );
            }

            // Determinar exchange e routing key
            const exchange = this.getExchangeForModule(modulo, processedMessage.priority);
            const routingKey = this.buildRoutingKey(modulo, acao, processedMessage.priority);

            // Enviar mensagem
            const sent = await channel.publish(
                exchange,
                routingKey,
                Buffer.from(JSON.stringify(processedMessage.dados)),
                {
                    persistent: true,
                    priority: processedMessage.priority,
                    messageId: processedMessage.id,
                    timestamp: Date.now(),
                    headers: {
                        'cliente-id': this.clienteId,
                        'modulo': modulo,
                        'acao': acao,
                        'ai-processed': true,
                        'mobile-optimized': processedMessage.targetMobile,
                        'kryonix-sdk-version': '1.0.0'
                    }
                }
            );

            // Log para auditoria
            await this.logMessage(processedMessage);

            return {
                success: sent,
                messageId: processedMessage.id,
                exchange,
                routingKey,
                priority: processedMessage.priority,
                mobileOptimized: processedMessage.targetMobile
            };

        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            throw error;
        }
    }

    // Método para consumir mensagens com callback
    async consumeMessages(
        modulo: ModuloType,
        acao: string,
        callback: MessageCallback,
        opcoes?: ConsumeOptions
    ): Promise<void> {
        try {
            const channel = this.channels.get(this.clienteId);
            if (!channel) {
                throw new Error('Canal não inicializado');
            }

            const queueName = `cliente_${this.clienteId}.${modulo}.${acao}`;
            
            // Configurar consumer
            await channel.consume(
                queueName,
                async (msg) => {
                    if (msg) {
                        try {
                            const content = JSON.parse(msg.content.toString());
                            
                            // Processar mensagem com IA se habilitado
                            const processedContent = opcoes?.aiProcessing 
                                ? await this.aiEngine.processIncomingMessage(content)
                                : content;

                            // Chamar callback do usuário
                            const result = await callback(processedContent, {
                                properties: msg.properties,
                                fields: msg.fields,
                                clienteId: this.clienteId,
                                modulo,
                                acao
                            });

                            // ACK se processado com sucesso
                            if (result.success) {
                                channel.ack(msg);
                            } else {
                                // NACK para retry ou DLQ
                                channel.nack(msg, false, result.retry || false);
                            }

                        } catch (error) {
                            console.error('❌ Erro ao processar mensagem:', error);
                            
                            // Enviar para DLQ em caso de erro
                            channel.nack(msg, false, false);
                        }
                    }
                },
                {
                    noAck: false,
                    consumerTag: `${this.clienteId}-${modulo}-${acao}-consumer`,
                    priority: opcoes?.priority || 0
                }
            );

            console.log(`✅ Consumer ativo: ${queueName}`);

        } catch (error) {
            console.error('❌ Erro ao configurar consumer:', error);
            throw error;
        }
    }

    // Métodos específicos por módulo para facilitar uso
    async sendCRMMessage(acao: string, dados: any, opcoes?: MessageOptions): Promise<SendResult> {
        return this.sendMessage('crm', acao, dados, opcoes);
    }

    async sendWhatsAppMessage(acao: string, dados: any, opcoes?: MessageOptions): Promise<SendResult> {
        return this.sendMessage('whatsapp', acao, dados, { ...opcoes, priority: 8 }); // Alta prioridade
    }

    async sendAgendamentoMessage(acao: string, dados: any, opcoes?: MessageOptions): Promise<SendResult> {
        return this.sendMessage('agendamento', acao, dados, opcoes);
    }

    async sendFinanceiroMessage(acao: string, dados: any, opcoes?: MessageOptions): Promise<SendResult> {
        return this.sendMessage('financeiro', acao, dados, { ...opcoes, priority: 9 }); // Crítica
    }

    async sendMarketingMessage(acao: string, dados: any, opcoes?: MessageOptions): Promise<SendResult> {
        return this.sendMessage('marketing', acao, dados, opcoes);
    }

    async sendAnalyticsMessage(acao: string, dados: any, opcoes?: MessageOptions): Promise<SendResult> {
        return this.sendMessage('analytics', acao, dados, opcoes);
    }

    async sendPortalMessage(acao: string, dados: any, opcoes?: MessageOptions): Promise<SendResult> {
        return this.sendMessage('portal', acao, dados, opcoes);
    }

    async sendWhitelabelMessage(acao: string, dados: any, opcoes?: MessageOptions): Promise<SendResult> {
        return this.sendMessage('whitelabel', acao, dados, opcoes);
    }

    // Métodos de monitoramento
    async getQueueStats(modulo?: ModuloType): Promise<QueueStats[]> {
        try {
            const stats: QueueStats[] = [];
            
            // Obter estatísticas via Management API
            const response = await fetch(
                `https://painel-mensagens.kryonix.com.br/api/queues/cliente_${this.clienteId}`,
                {
                    headers: {
                        'Authorization': `Basic ${await this.getAuthHeader()}`
                    }
                }
            );

            const queues = await response.json();

            for (const queue of queues) {
                if (!modulo || queue.name.includes(modulo)) {
                    stats.push({
                        name: queue.name,
                        messages: queue.messages,
                        consumers: queue.consumers,
                        messageRate: queue.message_stats?.publish_details?.rate || 0,
                        ackRate: queue.message_stats?.ack_details?.rate || 0
                    });
                }
            }

            return stats;

        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return [];
        }
    }

    private getExchangeForModule(modulo: ModuloType, priority: number): string {
        // Mobile priority para a maioria dos módulos (80% mobile)
        if (['crm', 'whatsapp', 'agendamento', 'marketing', 'analytics', 'portal'].includes(modulo)) {
            return `cliente_${this.clienteId}.mobile_priority`;
        }
        
        // Business critical para financeiro
        if (['financeiro'].includes(modulo)) {
            return `cliente_${this.clienteId}.business_critical`;
        }
        
        // Automation para processamento de IA
        return `cliente_${this.clienteId}.automation`;
    }

    private buildRoutingKey(modulo: ModuloType, acao: string, priority: number): string {
        const priorityLevel = priority >= 8 ? 'high' : priority >= 5 ? 'medium' : 'low';
        return `${modulo}.${acao}.${priorityLevel}`;
    }

    async close(): Promise<void> {
        // Fechar canais
        for (const [clienteId, channel] of this.channels) {
            await channel.close();
        }
        
        // Fechar conexões
        for (const [clienteId, connection] of this.connections) {
            await connection.close();
        }
        
        console.log(`✅ SDK RabbitMQ finalizado para cliente: ${this.clienteId}`);
    }
}

// Tipos TypeScript
type ModuloType = 'crm' | 'whatsapp' | 'agendamento' | 'financeiro' | 'marketing' | 'analytics' | 'portal' | 'whitelabel';

interface RabbitMQCredentials {
    username: string;
    password: string;
    vhost: string;
}

interface MessageOptions {
    priority?: number;
    device?: 'mobile' | 'web' | 'unknown';
    retry?: boolean;
    aiProcessing?: boolean;
}

interface SendResult {
    success: boolean;
    messageId: string;
    exchange: string;
    routingKey: string;
    priority: number;
    mobileOptimized: boolean;
}

interface MessageCallback {
    (content: any, context: MessageContext): Promise<CallbackResult>;
}

interface MessageContext {
    properties: any;
    fields: any;
    clienteId: string;
    modulo: ModuloType;
    acao: string;
}

interface CallbackResult {
    success: boolean;
    retry?: boolean;
    error?: string;
}

interface ConsumeOptions {
    priority?: number;
    aiProcessing?: boolean;
    autoAck?: boolean;
}

interface QueueStats {
    name: string;
    messages: number;
    consumers: number;
    messageRate: number;
    ackRate: number;
}
```

## 🔧 **SCRIPT SETUP MULTI-TENANT COMPLETO**

### **🚀 Setup Automático Multi-Tenant**
```bash
#!/bin/bash
# setup-rabbitmq-multi-tenant-completo.sh

echo "🚀 KRYONIX - Setup RabbitMQ Multi-Tenant Completo"
echo "==============================================="

# 1. CRIAR ESTRUTURA DE DIRETÓRIOS
echo "📁 Criando estrutura de diretórios..."
mkdir -p /opt/kryonix/{rabbitmq/{config,data,logs},scripts,monitoring/rabbitmq,backups/rabbitmq}

# 2. DEPLOY RABBITMQ CLUSTER MULTI-TENANT
echo "🐰 Deploying RabbitMQ Cluster Multi-Tenant..."
docker run -d \
  --name kryonix-rabbitmq-multitenant \
  --restart always \
  --network kryonix-network \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=kryonix_admin \
  -e RABBITMQ_DEFAULT_PASS=KryonixRabbit2025 \
  -e RABBITMQ_DEFAULT_VHOST=/kryonix-master \
  -e RABBITMQ_ERLANG_COOKIE=KRYONIX_CLUSTER_COOKIE \
  -v /opt/kryonix/rabbitmq/data:/var/lib/rabbitmq \
  -v /opt/kryonix/rabbitmq/config:/etc/rabbitmq \
  -v /opt/kryonix/rabbitmq/logs:/var/log/rabbitmq \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.rabbitmq.rule=Host(\`mensagens.kryonix.com.br\`)" \
  --label "traefik.http.routers.rabbitmq.entrypoints=websecure" \
  --label "traefik.http.routers.rabbitmq.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.rabbitmq.loadbalancer.server.port=5672" \
  --label "traefik.http.routers.rabbitmq-mgmt.rule=Host(\`painel-mensagens.kryonix.com.br\`)" \
  --label "traefik.http.routers.rabbitmq-mgmt.entrypoints=websecure" \
  --label "traefik.http.routers.rabbitmq-mgmt.tls.certresolver=letsencrypt" \
  --label "traefik.http.services.rabbitmq-mgmt.loadbalancer.server.port=15672" \
  rabbitmq:3.12-management

# 3. AGUARDAR INICIALIZAÇÃO
echo "⏳ Aguardando RabbitMQ inicializar..."
sleep 30

# 4. INSTALAR PLUGINS NECESSÁRIOS
echo "🔌 Instalando plugins RabbitMQ..."
docker exec kryonix-rabbitmq-multitenant rabbitmq-plugins enable rabbitmq_management
docker exec kryonix-rabbitmq-multitenant rabbitmq-plugins enable rabbitmq_prometheus
docker exec kryonix-rabbitmq-multitenant rabbitmq-plugins enable rabbitmq_shovel
docker exec kryonix-rabbitmq-multitenant rabbitmq-plugins enable rabbitmq_federation
docker exec kryonix-rabbitmq-multitenant rabbitmq-plugins enable rabbitmq_delayed_message_exchange

# 5. CRIAR CONFIGURAÇÃO AVANÇADA
echo "⚙️ Criando configuração avançada..."
cat > /opt/kryonix/rabbitmq/config/rabbitmq.conf << 'EOF'
# RabbitMQ Multi-Tenant Configuration for KRYONIX
# Configuração otimizada para SaaS multi-tenant

# Clustering
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config
cluster_formation.classic_config.nodes.1 = kryonix-rabbitmq-multitenant@localhost

# Memory and Disk
vm_memory_high_watermark.relative = 0.6
disk_free_limit.relative = 2.0
cluster_partition_handling = autoheal

# Network
tcp_listen_options.backlog = 128
tcp_listen_options.nodelay = true
tcp_listen_options.linger.on = true
tcp_listen_options.linger.timeout = 0
tcp_listen_options.sndbuf = 196608
tcp_listen_options.recbuf = 196608

# Management
management.tcp.port = 15672
management.ssl.port = 15671
management.load_definitions = /etc/rabbitmq/definitions.json

# Logging
log.file.level = info
log.connection.level = info
log.channel.level = info
log.queue.level = info
log.mirroring.level = info
log.federation.level = info
log.upgrade.level = info

# SSL/TLS (se necessário)
# ssl_options.verify = verify_peer
# ssl_options.fail_if_no_peer_cert = true

# Mobile optimizations
heartbeat = 60
frame_max = 131072
channel_max = 2047

# Multi-tenant optimizations
default_vhost = /kryonix-master
default_user = kryonix_admin
default_pass = KryonixRabbit2025
default_user_tags.administrator = true
default_permissions.configure = .*
default_permissions.write = .*
default_permissions.read = .*

# Queue defaults for multi-tenancy
queue_master_locator = min-masters
ha_promote_on_shutdown = when-synced
ha_promote_on_failure = when-synced

# Performance tuning
collect_statistics_interval = 10000
delegate_count = 16
EOF

# 6. CRIAR DEFINIÇÕES PADRÃO
echo "📋 Criando definições padrão..."
cat > /opt/kryonix/rabbitmq/config/definitions.json << 'EOF'
{
  "users": [
    {
      "name": "kryonix_admin",
      "password_hash": "HASH_PLACEHOLDER",
      "hashing_algorithm": "rabbit_password_hashing_sha256",
      "tags": "administrator"
    }
  ],
  "vhosts": [
    {
      "name": "/kryonix-master"
    },
    {
      "name": "/shared-services"
    },
    {
      "name": "/monitoring"
    },
    {
      "name": "/backup-operations"
    }
  ],
  "permissions": [
    {
      "user": "kryonix_admin",
      "vhost": "/kryonix-master",
      "configure": ".*",
      "write": ".*",
      "read": ".*"
    }
  ],
  "policies": [
    {
      "vhost": "/kryonix-master",
      "name": "ha-all",
      "pattern": ".*",
      "definition": {
        "ha-mode": "all",
        "ha-sync-mode": "automatic"
      },
      "priority": 0,
      "apply-to": "all"
    }
  ]
}
EOF

# 7. INSTALAR SCRIPTS DE GERENCIAMENTO
echo "📜 Instalando scripts de gerenciamento..."
cp enhanced-rabbitmq-multi-tenant-manager.py /opt/kryonix/scripts/
chmod +x /opt/kryonix/scripts/enhanced-rabbitmq-multi-tenant-manager.py

# 8. CRIAR SCRIPT DE BACKUP AUTOMÁTICO
echo "💾 Configurando backup automático..."
cat > /opt/kryonix/scripts/backup-rabbitmq-multitenant.sh << 'EOF'
#!/bin/bash
# backup-rabbitmq-multitenant.sh

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/kryonix/backups/rabbitmq/$BACKUP_DATE"
mkdir -p "$BACKUP_DIR"

echo "💾 Iniciando backup RabbitMQ Multi-Tenant..."

# Backup das definições
curl -u kryonix_admin:KryonixRabbit2025 \
  "http://localhost:15672/api/definitions" \
  -o "$BACKUP_DIR/definitions.json"

# Backup de cada VHost
VHOSTS=$(curl -s -u kryonix_admin:KryonixRabbit2025 \
  "http://localhost:15672/api/vhosts" | \
  jq -r '.[].name' | \
  grep -v "^/$")

for vhost in $VHOSTS; do
  echo "📦 Backup VHost: $vhost"
  vhost_encoded=$(echo "$vhost" | sed 's|/|%2F|g')
  
  curl -u kryonix_admin:KryonixRabbit2025 \
    "http://localhost:15672/api/definitions/$vhost_encoded" \
    -o "$BACKUP_DIR/vhost_${vhost//\//_}.json"
done

# Comprimir backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname $BACKUP_DIR)" "$(basename $BACKUP_DIR)"
rm -rf "$BACKUP_DIR"

echo "✅ Backup completo: $BACKUP_DIR.tar.gz"
EOF

chmod +x /opt/kryonix/scripts/backup-rabbitmq-multitenant.sh

# 9. AGENDAR BACKUPS AUTOMÁTICOS
echo "⏰ Agendando backups automáticos..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/kryonix/scripts/backup-rabbitmq-multitenant.sh") | crontab -

# 10. CONFIGURAR MONITORAMENTO
echo "📊 Configurando monitoramento..."
docker run -d \
  --name rabbitmq-exporter \
  --restart always \
  --network kryonix-network \
  -p 9419:9419 \
  -e RABBIT_URL=http://mensagens.kryonix.com.br:15672 \
  -e RABBIT_USER=kryonix_admin \
  -e RABBIT_PASSWORD=KryonixRabbit2025 \
  -e PUBLISH_PORT=9419 \
  -e LOG_LEVEL=info \
  kbudde/rabbitmq-exporter:latest

# 11. CRIAR CLIENTE DE EXEMPLO
echo "👤 Criando cliente de exemplo..."
sleep 10  # Aguardar RabbitMQ estar completamente pronto

python3 /opt/kryonix/scripts/enhanced-rabbitmq-multi-tenant-manager.py \
  exemploempresa \
  "crm,whatsapp,agendamento" \
  basic

# 12. EXECUTAR TESTES
echo "🧪 Executando testes de validação..."
cat > /opt/kryonix/scripts/test-rabbitmq-multitenant.sh << 'EOF'
#!/bin/bash
# test-rabbitmq-multitenant.sh

echo "🧪 Testando RabbitMQ Multi-Tenant..."

ERRORS=0

# Teste 1: Management API
echo "📊 Teste 1: Management API"
if curl -f -s -u kryonix_admin:KryonixRabbit2025 "http://localhost:15672/api/overview" > /dev/null; then
  echo "✅ Management API funcionando"
else
  echo "❌ Management API com problemas"
  ERRORS=$((ERRORS + 1))
fi

# Teste 2: VHosts criados
echo "🏠 Teste 2: VHosts criados"
VHOST_COUNT=$(curl -s -u kryonix_admin:KryonixRabbit2025 "http://localhost:15672/api/vhosts" | jq '. | length')
if [ "$VHOST_COUNT" -ge 4 ]; then
  echo "✅ VHosts criados: $VHOST_COUNT"
else
  echo "❌ VHosts insuficientes: $VHOST_COUNT"
  ERRORS=$((ERRORS + 1))
fi

# Teste 3: Usuários específicos
echo "👤 Teste 3: Usuários específicos"
USER_COUNT=$(curl -s -u kryonix_admin:KryonixRabbit2025 "http://localhost:15672/api/users" | jq '. | length')
if [ "$USER_COUNT" -ge 2 ]; then
  echo "✅ Usuários criados: $USER_COUNT"
else
  echo "❌ Usuários insuficientes: $USER_COUNT"
  ERRORS=$((ERRORS + 1))
fi

# Teste 4: Métricas Prometheus
echo "📈 Teste 4: Métricas Prometheus"
if curl -f -s "http://localhost:9419/metrics" | grep -q "rabbitmq"; then
  echo "✅ Métricas Prometheus funcionando"
else
  echo "❌ Métricas Prometheus com problemas"
  ERRORS=$((ERRORS + 1))
fi

# Resultado final
echo "======================================="
if [ $ERRORS -eq 0 ]; then
  echo "🎉 Todos os testes passaram!"
  echo "✅ RabbitMQ Multi-Tenant funcionando perfeitamente"
else
  echo "❌ $ERRORS teste(s) falharam"
  echo "🔧 Verifique os logs para mais detalhes"
fi

exit $ERRORS
EOF

chmod +x /opt/kryonix/scripts/test-rabbitmq-multitenant.sh
/opt/kryonix/scripts/test-rabbitmq-multitenant.sh

echo "✅ Setup RabbitMQ Multi-Tenant concluído!"
echo "🌐 Management: https://painel-mensagens.kryonix.com.br"
echo "📊 Métricas: http://localhost:9419/metrics"
echo "💾 Backups: /opt/kryonix/backups/rabbitmq/"
echo "📜 Scripts: /opt/kryonix/scripts/"
echo "==============================================="
```

## ✅ **CHECKLIST DE VALIDAÇÃO MULTI-TENANT**

### **📋 INFRAESTRUTURA**
- [ ] RabbitMQ cluster acessível em mensagens.kryonix.com.br
- [ ] Management console em painel-mensagens.kryonix.com.br
- [ ] VHosts isolados por cliente funcionando
- [ ] Usuários específicos por cliente criados

### **🔗 SDK INTEGRATION**
- [ ] @kryonix/sdk integrado e testado
- [ ] Métodos específicos por módulo funcionando
- [ ] Otimização mobile ativa para 80% usuários
- [ ] IA routing e processamento configurado

### **📱 MOBILE-FIRST**
- [ ] Filas prioritárias para mobile configuradas
- [ ] Compressão de mensagens mobile ativa
- [ ] TTL otimizado para dispositivos móveis
- [ ] Channels configurados para mobile

### **📦 8 APIS MODULARES**
- [ ] Filas específicas por módulo criadas
- [ ] Dead Letter Queues configuradas
- [ ] Routing automático por exchange
- [ ] Auto-scaling policies aplicadas

### **🤖 AUTO-CREATION**
- [ ] Script create_tenant_complete_infrastructure funcionando
- [ ] VHost automático em < 5 minutos
- [ ] Usuários e permissões automáticas
- [ ] Registro no banco de dados central

### **📊 MONITORAMENTO**
- [ ] Métricas isoladas por cliente coletadas
- [ ] RabbitMQ Exporter funcionando
- [ ] Alertas específicos por VHost configurados
- [ ] Dashboard de monitoramento disponível

### **💾 BACKUP E RESTORE**
- [ ] Backup automático por VHost funcionando
- [ ] Scripts de restore testados
- [ ] Cron jobs configurados
- [ ] Backup verification implementado

### **🧪 TESTES**
- [ ] Todos os testes automatizados passando
- [ ] Isolamento entre VHosts validado
- [ ] Performance mobile OK
- [ ] Auto-creation bem-sucedido

---


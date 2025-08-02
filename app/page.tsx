'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shield,
  Bot,
  Smartphone,
  MessageCircle,
  BarChart3,
  CheckCircle,
  Clock,
  Sparkles,
  Globe
} from 'lucide-react'

export default function HomePage() {
  const [currentPart, setCurrentPart] = useState(2)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: Shield,
      title: 'Autenticação Avançada',
      description: 'Sistema multi-tenant com Keycloak, autenticação biométrica e WhatsApp OTP'
    },
    {
      icon: Bot,
      title: 'IA 100% Autônoma',
      description: '15 agentes especializados trabalhando 24/7 para automatizar tudo'
    },
    {
      icon: Smartphone,
      title: 'Mobile-First',
      description: '80% dos usuários são mobile - interface otimizada para dispositivos móveis'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Business',
      description: 'Integração completa com Evolution API para comunicação empresarial'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avançado',
      description: 'Business Intelligence com Grafana, métricas em tempo real'
    },
    {
      icon: Globe,
      title: 'Multi-Tenancy',
      description: 'Isolamento completo entre clientes, criação automática em 2-5 minutos'
    }
  ]

  const modules = [
    { name: 'Análise Avançada e BI', price: 'R$ 99', status: 'available' },
    { name: 'Agendamento Inteligente', price: 'R$ 119', status: 'available' },
    { name: 'Atendimento Omnichannel', price: 'R$ 159', status: 'available' },
    { name: 'CRM & Funil de Vendas', price: 'R$ 179', status: 'available' },
    { name: 'Email Marketing Multicanal', price: 'R$ 219', status: 'available' },
    { name: 'Gestão Redes Sociais', price: 'R$ 239', status: 'available' },
    { name: 'Portal do Cliente', price: 'R$ 269', status: 'available' },
    { name: 'Whitelabel Customizável', price: 'R$ 299', status: 'available' }
  ]

  const stacks = [
    'Keycloak', 'PostgreSQL', 'MinIO', 'Redis', 'Traefik', 'Docker',
    'Grafana', 'Prometheus', 'Evolution API', 'Chatwoot', 'Typebot',
    'N8N', 'Mautic', 'Ollama', 'Dify AI', 'Supabase', 'Next.js',
    'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Python',
    'RabbitMQ', 'Nginx', 'Linux', 'SSL/TLS', 'Backup', 'Monitoramento',
    'Segurança', 'Performance', 'Automação', 'APIs'
  ]

  const progress = [
    // FASE 1: FUNDAÇÃO (PARTES 1-10)
    { part: 1, title: 'Autenticaç��o Keycloak', status: 'completed', description: 'Sistema multi-tenant com biometria', slug: 'autenticacao-keycloak' },
    { part: 2, title: 'Base de Dados PostgreSQL', status: 'completed', description: 'Database isolado por cliente', slug: 'database-postgresql' },
    { part: 3, title: 'Storage MinIO', status: 'in_progress', description: 'Armazenamento de arquivos', slug: 'storage-minio' },
    { part: 4, title: 'Cache Redis', status: 'pending', description: 'Cache distribuído', slug: 'cache-redis' },
    { part: 5, title: 'Proxy Traefik', status: 'pending', description: 'Balanceamento e SSL', slug: 'proxy-traefik' },
    { part: 6, title: 'Monitoramento Grafana', status: 'pending', description: 'Dashboards de sistema', slug: 'monitoramento-grafana' },
    { part: 7, title: 'Mensageria RabbitMQ', status: 'pending', description: 'Comunicação entre sistemas', slug: 'mensageria-rabbitmq' },
    { part: 8, title: 'Backup Automático', status: 'pending', description: 'Proteção dos dados', slug: 'backup-automatico' },
    { part: 9, title: 'Segurança Básica', status: 'pending', description: 'Proteções fundamentais', slug: 'seguranca-basica' },
    { part: 10, title: 'API Gateway', status: 'pending', description: 'Porta de entrada das APIs', slug: 'api-gateway' },

    // FASE 2: INTERFACE E CORE (PARTES 11-25)
    { part: 11, title: 'Interface Principal', status: 'pending', description: 'Interface mobile-first', slug: 'interface-principal' },
    { part: 12, title: 'Dashboard Administrativo', status: 'pending', description: 'Painel de controle', slug: 'dashboard-admin' },
    { part: 13, title: 'Sistema de Usuários', status: 'pending', description: 'Gestão de usuários', slug: 'sistema-usuarios' },
    { part: 14, title: 'Permissões e Roles', status: 'pending', description: 'Controle de acesso', slug: 'permissoes-roles' },
    { part: 15, title: 'Módulo de Configuração', status: 'pending', description: 'Configurações gerais', slug: 'modulo-configuracao' },
    { part: 16, title: 'Sistema de Notificações', status: 'pending', description: 'Avisos e alertas', slug: 'sistema-notificacoes' },
    { part: 17, title: 'Email Marketing', status: 'pending', description: 'Marketing automatizado', slug: 'email-marketing' },
    { part: 18, title: 'Analytics e BI', status: 'pending', description: 'Relatórios inteligentes', slug: 'analytics-bi' },
    { part: 19, title: 'Gestão de Documentos', status: 'pending', description: 'Organização de arquivos', slug: 'gestao-documentos' },
    { part: 20, title: 'Performance e Otimização', status: 'pending', description: 'Velocidade do sistema', slug: 'performance-otimizacao' },
    { part: 21, title: 'Sistema de Logs', status: 'pending', description: 'Auditoria e rastreamento', slug: 'sistema-logs' },
    { part: 22, title: 'Configuração Multi-Idioma', status: 'pending', description: 'Internacionalização', slug: 'multi-idioma' },
    { part: 23, title: 'Sistema de Themes', status: 'pending', description: 'Personalização visual', slug: 'sistema-themes' },
    { part: 24, title: 'Gestão de Plugins', status: 'pending', description: 'Extensibilidade', slug: 'gestao-plugins' },
    { part: 25, title: 'Sistema de Webhooks', status: 'pending', description: 'Integrações externas', slug: 'sistema-webhooks' },

    // FASE 3: INTELIGÊNCIA ARTIFICIAL (PARTES 26-35)
    { part: 26, title: 'Configuração IA', status: 'pending', description: 'Setup da inteligência artificial', slug: 'configuracao-ia' },
    { part: 27, title: 'Comunicação IA', status: 'pending', description: 'IA conversacional', slug: 'comunicacao-ia' },
    { part: 28, title: 'Mobile e PWA', status: 'pending', description: 'Aplicativo instalável', slug: 'mobile-pwa' },
    { part: 29, title: 'Sistema de Analytics IA', status: 'pending', description: 'Análises avançadas', slug: 'analytics-ia' },
    { part: 30, title: 'IA e Machine Learning', status: 'pending', description: 'Aprendizado automático', slug: 'ia-machine-learning' },
    { part: 31, title: 'Automação e Workflows', status: 'pending', description: 'Processos automáticos', slug: 'automacao-workflows' },
    { part: 32, title: 'APIs e Integrações', status: 'pending', description: 'Conexões externas', slug: 'apis-integracoes' },
    { part: 33, title: 'Análise Preditiva', status: 'pending', description: 'Previsão do futuro', slug: 'analise-preditiva' },
    { part: 34, title: 'Recomendações IA', status: 'pending', description: 'Sugestões automáticas', slug: 'recomendacoes-ia' },
    { part: 35, title: 'Auto-scaling IA', status: 'pending', description: 'Crescimento automático', slug: 'auto-scaling-ia' },

    // FASE 4: COMUNICAÇÃO (PARTES 36-45)
    { part: 36, title: 'Evolution API (WhatsApp)', status: 'pending', description: 'WhatsApp Business', slug: 'evolution-api' },
    { part: 37, title: 'Chatwoot (Atendimento)', status: 'pending', description: 'Central de atendimento', slug: 'chatwoot-atendimento' },
    { part: 38, title: 'Typebot Workflows', status: 'pending', description: 'Chatbots inteligentes', slug: 'typebot-workflows' },
    { part: 39, title: 'N8N Automação', status: 'pending', description: 'Automações avançadas', slug: 'n8n-automacao' },
    { part: 40, title: 'Mautic Marketing', status: 'pending', description: 'Marketing automation', slug: 'mautic-marketing' },
    { part: 41, title: 'Email Marketing Avançado', status: 'pending', description: 'Emails profissionais', slug: 'email-marketing-avancado' },
    { part: 42, title: 'SMS e Push Notifications', status: 'pending', description: 'Notificações móveis', slug: 'sms-push-notifications' },
    { part: 43, title: 'Integração Redes Sociais', status: 'pending', description: 'Gestão redes sociais', slug: 'integracao-redes-sociais' },
    { part: 44, title: 'Integração CRM', status: 'pending', description: 'Gestão de clientes', slug: 'integracao-crm' },
    { part: 45, title: 'Agendamento Inteligente', status: 'pending', description: 'Agenda com IA', slug: 'agendamento-inteligente' },

    // FASE 5: MÓDULOS ESPECIALIZADOS (PARTES 46-53)
    { part: 46, title: 'Análise Comercial Avançada', status: 'pending', description: 'Inteligência comercial', slug: 'analise-comercial' },
    { part: 47, title: 'Atendimento Omnichannel', status: 'pending', description: 'Atendimento multicanal', slug: 'atendimento-omnichannel' },
    { part: 48, title: 'CRM Funil de Vendas', status: 'pending', description: 'Pipeline de vendas', slug: 'crm-funil-vendas' },
    { part: 49, title: 'Portal Cliente e Treinamento', status: 'pending', description: 'Portal personalizado', slug: 'portal-cliente-treinamento' },
    { part: 50, title: 'Whitelabel Customizável', status: 'pending', description: 'Marca própria', slug: 'whitelabel-customizavel' },
    { part: 51, title: 'Integração Supabase', status: 'pending', description: 'Database na nuvem', slug: 'integracao-supabase' },
    { part: 52, title: 'Integração WuzAPI', status: 'pending', description: 'WhatsApp API alternativa', slug: 'integracao-wuzapi' },
    { part: 53, title: 'Integração NTFY', status: 'pending', description: 'Notificações push', slug: 'integracao-ntfy' }
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/logo kryonix.png"
                alt="KRYONIX Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">KRYONIX</h1>
                <p className="text-xs text-gray-600">Plataforma SaaS 100% Autônoma por IA</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-gray-600">Sistema Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-success-100 text-success-700 text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4 mr-2" />
                PARTE {currentPart} DE 53 CONCLUÍDA - PostgreSQL Mobile-First
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-balance">
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Plataforma SaaS</span>
                <br />
                <span className="text-gray-900">100% Autônoma por IA</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 text-balance max-w-2xl mx-auto">
                Transforme seu negócio com nossa plataforma inteligente: WhatsApp Business, 
                CRM avançado, automação completa e muito mais.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/whatsapp" className="btn-primary">
                <MessageCircle className="w-5 h-5 mr-2" />
                Acompanhar Desenvolvimento
              </Link>
              <Link href="/progresso" className="btn-secondary">
                <BarChart3 className="w-5 h-5 mr-2" />
                Ver Progresso Completo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-2xl font-bold text-primary-600">32+</div>
                <div className="text-sm text-gray-600">Stacks Tecnológicas</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-success-600">8</div>
                <div className="text-sm text-gray-600">Módulos SaaS</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-sm text-gray-600">Agentes IA</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-orange-600">100%</div>
                <div className="text-sm text-gray-600">Automação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Progresso de Desenvolvimento
            </h2>
            <p className="text-lg text-gray-600">
              Acompanhe o desenvolvimento em tempo real das 53 partes do projeto
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              {progress.map((item, index) => (
                <Link
                  key={item.part}
                  href={`/partes/${item.slug}`}
                  className={`card hover:shadow-lg cursor-pointer transition-all duration-300 ${
                    item.status === 'in_progress' ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        item.status === 'completed' ? 'bg-success-500 text-white' :
                        item.status === 'in_progress' ? 'bg-primary-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {item.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : item.part}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === 'completed' && (
                        <span className="px-2 py-1 text-xs bg-success-100 text-success-700 rounded-full font-medium">Concluída</span>
                      )}
                      {item.status === 'in_progress' && (
                        <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full font-medium">Em Andamento</span>
                      )}
                      {item.status === 'pending' && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">Pendente</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg font-semibold text-gray-700">
                53 Partes Técnicas Completas
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Clique em qualquer parte para ver os detalhes técnicos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recursos Principais
            </h2>
            <p className="text-lg text-gray-600">
              Tecnologia de ponta com foco em automação e experiência do usuário
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-lg transition-all duration-300 group"
              >
                <feature.icon className="w-12 h-12 text-primary-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              8 Módulos SaaS Disponíveis
            </h2>
            <p className="text-lg text-gray-600">
              Escolha os módulos ideais para seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <div
                key={index}
                className="card hover:shadow-lg transition-all duration-300 text-center group"
              >
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {module.price}
                </div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                  {module.name}
                </h3>
                <span className="badge-success">Disponível</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              32+ Tecnologias Integradas
            </h2>
            <p className="text-lg text-gray-600">
              Stack completa para máxima performance e escalabilidade
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {stacks.map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/logo kryonix.png"
                  alt="KRYONIX Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold">KRYONIX</span>
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma SaaS 100% Autônoma por IA
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div>📧 contato@kryonix.com.br</div>
                <div>📱 +55 17 98180-5327</div>
                <div>🌐 www.kryonix.com.br</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Status do Sistema</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="status-online"></div>
                  <span className="text-gray-400">Desenvolvimento Ativo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="status-online"></div>
                  <span className="text-gray-400">Monitoramento 24/7</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="status-online"></div>
                  <span className="text-gray-400">Backup Automático</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 KRYONIX. Desenvolvido por Vitor Jayme Fernandes Ferreira.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              🤖 Assistido por 15 Agentes Especializados em IA
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

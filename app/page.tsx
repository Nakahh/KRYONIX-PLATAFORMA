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
    { part: 1, title: 'Autenticação Keycloak', status: 'completed', description: 'Sistema multi-tenant com biometria' },
    { part: 2, title: 'Base de Dados PostgreSQL', status: 'completed', description: 'Database isolado por cliente' },
    { part: 3, title: 'Storage MinIO', status: 'in_progress', description: 'Armazenamento de arquivos' },
    { part: 4, title: 'Cache Redis', status: 'pending', description: 'Cache distribuído' },
    { part: 5, title: 'Proxy Traefik', status: 'pending', description: 'Balanceamento e SSL' }
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
                src="/logo-kryonix.png"
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
            <div className="hidden sm:flex items-center space-x-2">
              <div className="inline-flex h-2 w-2 rounded-full bg-green-400"></div>
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
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
                <Clock className="w-4 h-4 mr-2" />
                PARTE {currentPart} DE 50 EM DESENVOLVIMENTO
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
              Acompanhe o desenvolvimento em tempo real das 50 partes do projeto
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {progress.map((item, index) => (
                <div
                  key={item.part}
                  className={`card ${item.status === 'in_progress' ? 'ring-2 ring-primary-500' : ''} transition-all duration-300`}
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
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.status === 'completed' && (
                        <span className="badge-success">Concluída</span>
                      )}
                      {item.status === 'in_progress' && (
                        <span className="badge-info">Em Andamento</span>
                      )}
                      {item.status === 'pending' && (
                        <span className="badge-warning">Pendente</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                ... e mais 45 partes sendo desenvolvidas
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
                  src="/logo-kryonix.png"
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

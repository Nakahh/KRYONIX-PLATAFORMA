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
  Globe,
  Phone,
  Instagram,
  Mail
} from 'lucide-react'
import LoadingScreen from './components/LoadingScreen'
import ProgressBar from './components/ProgressBar'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clickedIcons, setClickedIcons] = useState({
    whatsapp: false,
    email: false,
    instagram: false
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLoadingComplete = () => {
    setLoading(false)
  }

  const handleIconClick = (iconType: 'whatsapp' | 'email' | 'instagram') => {
    setClickedIcons(prev => ({
      ...prev,
      [iconType]: !prev[iconType]
    }))
  }

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
    { name: 'Análise Avançada e BI', price: 'R$ 99', status: 'unavailable' },
    { name: 'Agendamento Inteligente', price: 'R$ 119', status: 'unavailable' },
    { name: 'Atendimento Omnichannel', price: 'R$ 159', status: 'unavailable' },
    { name: 'CRM & Funil de Vendas', price: 'R$ 179', status: 'unavailable' },
    { name: 'Email Marketing Multicanal', price: 'R$ 219', status: 'unavailable' },
    { name: 'Gestão Redes Sociais', price: 'R$ 239', status: 'unavailable' },
    { name: 'Portal do Cliente', price: 'R$ 269', status: 'unavailable' },
    { name: 'Whitelabel Customizável', price: 'R$ 299', status: 'unavailable' }
  ]

  const stacks = [
    'Keycloak', 'PostgreSQL', 'MinIO', 'Redis', 'Traefik', 'Docker',
    'Grafana', 'Prometheus', 'Evolution API', 'Chatwoot', 'Typebot',
    'N8N', 'Mautic', 'Ollama', 'Dify AI', 'Supabase', 'Next.js',
    'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Python',
    'RabbitMQ', 'Nginx', 'Linux', 'SSL/TLS', 'Backup', 'Monitoramento',
    'Segurança', 'Performance', 'Automação', 'APIs'
  ]

  if (!mounted) {
    return null
  }

  if (loading) {
    return <LoadingScreen onComplete={handleLoadingComplete} duration={1000} />
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
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">KRYONIX</h1>
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
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
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

      {/* Features */}
      <section className="py-16 bg-white">
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
      <section className="py-16 bg-gray-50">
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
      <section className="py-16 bg-white">
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

      {/* Progress Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Acompanhe o Desenvolvimento
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Veja o progresso detalhado das 53 partes do projeto
              </p>
            </div>

            <ProgressBar className="mb-8" />

            <div className="text-center">
              <Link href="/progresso" className="btn-primary">
                <BarChart3 className="w-5 h-5 mr-2" />
                Ver Progresso Completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            {/* Logo Section - Centered */}
            <div className="text-center">
              <div className="flex flex-col items-center space-y-3 mb-4">
                <Image
                  src="/logo-kryonix.png"
                  alt="KRYONIX Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
                  KRYONIX
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma SaaS 100% Autônoma por IA
              </p>
            </div>

            {/* Contact Section - Centered */}
            <div className="text-center">
              <h3 className="font-semibold mb-4 text-white">Contato</h3>
              <div className="flex items-center justify-center space-x-6">
                <a
                  href="https://wa.me/5517981805327?text=Olá! Gostaria de saber mais sobre a plataforma KRYONIX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer"
                  title="WhatsApp"
                  onClick={(e) => {
                    handleIconClick('whatsapp')
                  }}
                >
                  <MessageCircle
                    className={`w-8 h-8 transition-all duration-200 ${
                      clickedIcons.whatsapp
                        ? 'text-green-500 fill-green-500'
                        : 'text-gray-400 group-hover:text-green-500'
                    }`}
                  />
                </a>
                <a
                  href="mailto:contato@kryonix.com.br"
                  className="group cursor-pointer"
                  title="Email"
                  onClick={(e) => {
                    handleIconClick('email')
                  }}
                >
                  <Mail
                    className={`w-8 h-8 transition-all duration-200 ${
                      clickedIcons.email
                        ? 'text-blue-500 fill-blue-500'
                        : 'text-gray-400 group-hover:text-blue-500'
                    }`}
                  />
                </a>
                <a
                  href="https://instagram.com/kryon.ix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer"
                  title="Instagram"
                  onClick={(e) => {
                    handleIconClick('instagram')
                  }}
                >
                  <Instagram
                    className={`w-8 h-8 transition-all duration-200 ${
                      clickedIcons.instagram
                        ? 'text-purple-500 fill-purple-500'
                        : 'text-gray-400 group-hover:text-purple-500'
                    }`}
                  />
                </a>
              </div>
            </div>

            {/* System Status Section - Centered */}
            <div className="text-center">
              <h3 className="font-semibold mb-4 text-white">Status do Sistema</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Desenvolvimento Ativo</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Monitoramento 24/7</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Backup Automático</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent font-bold">KRYONIX</span>. Desenvolvido por Vitor Jayme Fernandes Ferreira.
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

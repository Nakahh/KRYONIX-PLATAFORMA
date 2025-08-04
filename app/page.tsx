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
import ThemeToggle from './components/ThemeToggle'
import InteractiveDemo from './components/InteractiveDemo'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clickedIcons, setClickedIcons] = useState({
    whatsapp: false,
    email: false,
    instagram: false
  })
  const [selectedModule, setSelectedModule] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (selectedModule !== null) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }

    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [selectedModule])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedModule !== null) {
        setSelectedModule(null)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedModule])

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
    {
      name: 'Análise Avançada e BI',
      price: 'R$ 99/mês',
      status: 'unavailable',
      description: 'Transforme dados em decisões inteligentes com nosso módulo de Business Intelligence.',
      features: [
        'Dashboards interativos em tempo real',
        'Relatórios automáticos personalizados',
        'Análise preditiva com IA',
        'Integração com Google Analytics, Facebook Ads',
        'Métricas de vendas, conversão e ROI',
        'Alertas automáticos de performance'
      ],
      applications: [
        'Monitoramento de vendas e faturamento',
        'Análise de comportamento do cliente',
        'Otimização de campanhas de marketing',
        'Previsão de demanda e estoque',
        'Identificação de tendências de mercado'
      ],
      targetBusinesses: [
        'E-commerces e lojas virtuais',
        'Empresas de marketing digital',
        'Consultórios médicos e clínicas',
        'Imobiliárias e corretores',
        'Restaurantes e delivery',
        'Empresas de serviços em geral'
      ]
    },
    {
      name: 'Agendamento Inteligente',
      price: 'R$ 119/mês',
      status: 'unavailable',
      description: 'Sistema completo de agendamento automatizado que elimina conflitos e otimiza sua agenda.',
      features: [
        'Agendamento online 24/7',
        'Confirmação automática via WhatsApp',
        'Lembretes personalizados',
        'Reagendamento inteligente',
        'Integração com Google Calendar',
        'Controle de disponibilidade em tempo real'
      ],
      applications: [
        'Consultas médicas e odontológicas',
        'Serviços de beleza e estética',
        'Aulas particulares e cursos',
        'Reuniões comerciais',
        'Manutenções e reparos',
        'Delivery de serviços'
      ],
      targetBusinesses: [
        'Consultórios médicos e dentistas',
        'Salões de beleza e barbearias',
        'Academias e personal trainers',
        'Psicólogos e terapeutas',
        'Advogados e contadores',
        'Prestadores de serviços técnicos'
      ]
    },
    {
      name: 'Atendimento Omnichannel',
      price: 'R$ 159/mês',
      status: 'unavailable',
      description: 'Unifique todos os canais de atendimento em uma única plataforma inteligente.',
      features: [
        'WhatsApp, Instagram, Facebook, Email integrados',
        'Chatbots com IA para respostas automáticas',
        'Histórico unificado do cliente',
        'Transferência entre agentes',
        'Métricas de satisfação',
        'Atendimento 24/7 automatizado'
      ],
      applications: [
        'Suporte técnico e pós-venda',
        'Vendas consultivas online',
        'Atendimento ao cliente multicanal',
        'Resolução de dúvidas automática',
        'Triagem inteligente de demandas'
      ],
      targetBusinesses: [
        'E-commerces e marketplace',
        'Empresas de software e tecnologia',
        'Bancos e fintechs',
        'Operadoras de telefonia',
        'Empresas de turismo e viagem',
        'Qualquer negócio com alto volume de atendimento'
      ]
    },
    {
      name: 'CRM & Funil de Vendas',
      price: 'R$ 179/mês',
      status: 'unavailable',
      description: 'Gerencie seus clientes e vendas com inteligência artificial que nunca perde uma oportunidade.',
      features: [
        'Gestão completa de leads e clientes',
        'Funil de vendas automatizado',
        'Pontuação automática de leads (Lead Scoring)',
        'Follow-up automático personalizado',
        'Previsão de vendas com IA',
        'Integração com WhatsApp e email'
      ],
      applications: [
        'Gestão de pipeline de vendas',
        'Nurturing de leads automático',
        'Controle de relacionamento com clientes',
        'Automação de follow-up',
        'Análise de conversão por etapa'
      ],
      targetBusinesses: [
        'Empresas de vendas B2B',
        'Imobiliárias e corretores',
        'Empresas de marketing digital',
        'Consultórios e clínicas privadas',
        'Empresas de software e tecnologia',
        'Franquias e redes de negócios'
      ]
    },
    {
      name: 'Email Marketing Multicanal',
      price: 'R$ 219/mês',
      status: 'unavailable',
      description: 'Campanhas inteligentes que chegam na hora certa, no canal certo, para a pessoa certa.',
      features: [
        'Email, SMS e WhatsApp unificados',
        'Segmentação automática com IA',
        'A/B Testing automático',
        'Campanhas disparadas por comportamento',
        'Templates responsivos profissionais',
        'Automação de jornadas complexas'
      ],
      applications: [
        'Campanhas promocionais sazonais',
        'Nutrição de leads educativos',
        'Recuperação de carrinho abandonado',
        'Comunicação pós-compra',
        'Pesquisas de satisfação automatizadas'
      ],
      targetBusinesses: [
        'E-commerces e varejo online',
        'Empresas de educação online',
        'SaaS e empresas de software',
        'Agências de marketing',
        'Empresas de cosméticos e moda',
        'Negócios com base de clientes recorrentes'
      ]
    },
    {
      name: 'Gestão Redes Sociais',
      price: 'R$ 239/mês',
      status: 'unavailable',
      description: 'Automatize sua presença digital com IA que cria, publica e engaja por você.',
      features: [
        'Agendamento automático de posts',
        'Criação de conteúdo com IA',
        'Resposta automática a comentários',
        'Análise de engajamento em tempo real',
        'Hashtags otimizadas automaticamente',
        'Relatórios de performance social'
      ],
      applications: [
        'Presença digital automatizada',
        'Engajamento com audiência',
        'Geração de leads via redes sociais',
        'Construção de autoridade no mercado',
        'Atendimento via DM automatizado'
      ],
      targetBusinesses: [
        'Influenciadores e criadores de conteúdo',
        'Agências de marketing digital',
        'Restaurantes e food service',
        'Lojas de moda e lifestyle',
        'Empresas de beleza e estética',
        'Profissionais liberais e consultores'
      ]
    },
    {
      name: 'Portal do Cliente',
      price: 'R$ 269/mês',
      status: 'unavailable',
      description: 'Área exclusiva onde seus clientes acessam tudo que precisam de forma autônoma.',
      features: [
        'Login seguro com autenticação biométrica',
        'Histórico completo de pedidos/serviços',
        'Download de documentos e relatórios',
        'Chat direto com suporte',
        'Pagamentos e renovações online',
        'Notificações personalizadas'
      ],
      applications: [
        'Self-service para clientes',
        'Redução de chamados de suporte',
        'Transparência total nos serviços',
        'Facilitar renovações e upgrades',
        'Melhorar experiência do cliente'
      ],
      targetBusinesses: [
        'Empresas SaaS e software',
        'Consultorias e empresas de serviços',
        'Planos de saúde e seguros',
        'Empresas de educação',
        'Provedores de internet e telecom',
        'Empresas com clientes recorrentes'
      ]
    },
    {
      name: 'Whitelabel Customizável',
      price: 'R$ 299/mês',
      status: 'unavailable',
      description: 'Transforme nossa plataforma na sua própria solução com sua marca e identidade visual.',
      features: [
        'Personalização completa da interface',
        'Logo, cores e branding próprios',
        'Domínio customizado (.suaempresa.com)',
        'Remoção completa da marca KRYONIX',
        'Funcionalidades sob sua marca',
        'Suporte para revenda da plataforma'
      ],
      applications: [
        'Revenda de solu��ões tecnológicas',
        'Criaç��o de produto pr��prio',
        'Fortalecimento da marca pessoal',
        'Diferenciação no mercado',
        'Monetização de conhecimento'
      ],
      targetBusinesses: [
        'Agências de marketing digital',
        'Consultores e mentores de negócios',
        'Empresas de desenvolvimento',
        'Franquias e redes',
        'Revendedores de tecnologia',
        'Empresas que querem solução própria'
      ]
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
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
                <p className="text-xs text-gray-600 dark:text-gray-400">Plataforma SaaS 100% Autônoma por IA</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Sistema Online</span>
              </div>
              <ThemeToggle />
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
                <span className="text-gray-900 dark:text-gray-100">100% Autônoma por IA</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-balance max-w-2xl mx-auto">
                Transforme seu negócio com nossa plataforma inteligente: WhatsApp Business,
                CRM avançado, automação completa e muito mais.
              </p>
            </div>



            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center card-transition">
                <div className="text-2xl font-bold text-primary-600">32+</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Stacks Tecnológicas</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center card-transition">
                <div className="text-2xl font-bold text-success-600">8</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Módulos SaaS</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center card-transition">
                <div className="text-2xl font-bold text-purple-600">15</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Agentes IA</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center card-transition">
                <div className="text-2xl font-bold text-orange-600">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Automação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <InteractiveDemo />

      {/* Features */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recursos Principais
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
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
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              8 Módulos SaaS Disponíveis
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Escolha os módulos ideais para seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <div
                key={index}
                className="card hover:shadow-xl transition-all duration-300 text-center group cursor-pointer transform hover:scale-105 hover:border-primary-300 relative overflow-hidden"
                onClick={() => setSelectedModule(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-2xl font-bold text-primary-600 mb-2">
                    {module.price}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-900 mb-3 text-sm">
                    {module.name}
                  </h3>
                  <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium mb-3 inline-block">Indisponível</span>
                  <div className="text-xs text-gray-500 mt-2">
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Clique para ver detalhes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal de Detalhes do Módulo */}
          {selectedModule !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setSelectedModule(null)}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform animate-slideUp" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{modules[selectedModule].name}</h2>
                      <div className="text-3xl font-bold text-primary-600">{modules[selectedModule].price}</div>
                    </div>
                    <button
                      onClick={() => setSelectedModule(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Descrição */}
                  <div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{modules[selectedModule].description}</p>
                  </div>

                  {/* Funcionalidades */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Principais Funcionalidades
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {modules[selectedModule].features.map((feature, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aplicações */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Para que pode ser usado
                    </h3>
                    <div className="grid gap-3">
                      {modules[selectedModule].applications.map((application, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300">{application}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Empresas e Profissões */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Ideal para estas empresas e profissões
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {modules[selectedModule].targetBusinesses.map((business, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 dark:text-gray-300">{business}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status e Call to Action */}
                  <div className="bg-gray-50 rounded-xl p-6 text-center">
                    <div className="mb-4">
                      <span className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-full font-medium">Em Desenvolvimento</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Este módulo estará disponível em breve. Quer ser notificado quando for lançado?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href={`https://wa.me/5517981805327?text=Olá! Tenho interesse no módulo: ${modules[selectedModule].name} (${modules[selectedModule].price}). Gostaria de mais informações sobre quando estará disponível.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#20b954] transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                        </svg>
                        Tenho Interesse
                      </a>
                      <button
                        onClick={() => setSelectedModule(null)}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              32+ Tecnologias Integradas
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Stack completa para máxima performance e escalabilidade
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {stacks.map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Acompanhe o Desenvolvimento
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
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
              <div className="flex items-center justify-center space-x-3 mb-4">
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
                  className="group cursor-pointer relative"
                  title="WhatsApp"
                  onClick={(e) => {
                    handleIconClick('whatsapp')
                  }}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${
                    clickedIcons.whatsapp
                      ? 'bg-[#25D366] text-white scale-110 shadow-xl shadow-green-500/25'
                      : 'bg-green-50 dark:bg-green-900/20 text-[#25D366] dark:text-green-300 group-hover:bg-[#25D366] group-hover:text-white group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-green-500/25'
                  }`}>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                  </div>
                </a>
                <a
                  href="mailto:contato@kryonix.com.br"
                  className="group cursor-pointer relative"
                  title="Email"
                  onClick={(e) => {
                    handleIconClick('email')
                  }}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${
                    clickedIcons.email
                      ? 'bg-blue-500 text-white scale-110 shadow-xl shadow-blue-500/25'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-blue-500/25'
                  }`}>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                </a>
                <a
                  href="https://instagram.com/kryon.ix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer relative"
                  title="Instagram"
                  onClick={(e) => {
                    handleIconClick('instagram')
                  }}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${
                    clickedIcons.instagram
                      ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white scale-110 shadow-xl shadow-purple-500/25'
                      : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 text-purple-600 dark:text-purple-300 group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-orange-400 group-hover:text-white group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-purple-500/25'
                  }`}>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
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

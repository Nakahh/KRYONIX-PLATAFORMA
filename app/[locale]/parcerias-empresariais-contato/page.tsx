'use client'

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parcerias Empresariais - KRYONIX',
  description: 'Oportunidades de parceria com ROI de até 452% em 3 anos. Junte-se aos investidores da KRYONIX',
  keywords: ['parcerias', 'investimento', 'roi', 'negócios', 'kryonix', 'lucro'],
  openGraph: {
    title: 'Parcerias KRYONIX - ROI 452% em 3 anos',
    description: 'Descubra oportunidades exclusivas de parceria na plataforma SaaS mais inovadora',
    url: 'https://www.kryonix.com.br/pt-br/parcerias-empresariais-contato',
    type: 'website',
    images: ['/logo-kryonix.png']
  }
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Building2,
  TrendingUp,
  Users,
  Globe,
  Target,
  DollarSign,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Star,
  Handshake,
  Briefcase,
  Calculator
} from 'lucide-react'
import LoadingScreen from '../../components/LoadingScreen'
import ContactForm from '../../components/ContactForm'

interface PartnershipType {
  id: string
  title: string
  subtitle: string
  description: string
  benefits: string[]
  investment: string
  roi: string
  timeframe: string
  icon: any
  color: string
}

const partnershipTypes: PartnershipType[] = [
  {
    id: 'infrastructure',
    title: 'Parceria de Infraestrutura',
    subtitle: 'Hospedagem e Servidores',
    description: 'Fornecimento de infraestrutura para hospedar a plataforma KRYONIX em troca de participação nos lucros.',
    benefits: [
      'Participa��ão de 20% nos lucros líquidos',
      'Branding conjunto em todos os materiais',
      'Prioridade em upgrades de infraestrutura',
      'Suporte técnico dedicado 24/7',
      'Dashboard exclusivo de monitoramento'
    ],
    investment: 'Infraestrutura para 1000+ clientes',
    roi: '452% em 3 anos',
    timeframe: '30-45 dias para início',
    icon: Building2,
    color: 'blue'
  },
  {
    id: 'strategic',
    title: 'Parceria Estratégica',
    subtitle: 'Desenvolvimento e Marketing',
    description: 'Colaboração no desenvolvimento de módulos específicos e estratégias de marketing conjunto.',
    benefits: [
      'Co-desenvolvimento de módulos exclusivos',
      'Acesso antecipado a todas as features',
      'Participação nas decisões estratégicas',
      'Marketing conjunto em campanhas',
      'Treinamento exclusivo da equipe'
    ],
    investment: 'R$ 150.000 - R$ 500.000',
    roi: '380% em 2 anos',
    timeframe: '15-30 dias para início',
    icon: Target,
    color: 'green'
  },
  {
    id: 'expansion',
    title: 'Parceria de Expansão',
    subtitle: 'Mercados Internacionais',
    description: 'Expansão da plataforma para novos mercados com parceiros locais especializados.',
    benefits: [
      'Exclusividade territorial por 5 anos',
      'Customização para mercado local',
      'Suporte completo para localização',
      'Treinamento de equipe comercial',
      'Marketing co-funded de lançamento'
    ],
    investment: 'R$ 200.000 - R$ 1.000.000',
    roi: '320% em 18 meses',
    timeframe: '45-60 dias para início',
    icon: Globe,
    color: 'purple'
  },
  {
    id: 'investment',
    title: 'Investimento Direto',
    subtitle: 'Capital para Crescimento',
    description: 'Investimento direto em capital para acelerar o desenvolvimento e expansão da plataforma.',
    benefits: [
      'Participação societária proporcional',
      'Retorno sobre investimento garantido',
      'Participação no board de decisões',
      'Prioridade em novos produtos',
      'Relatórios financeiros mensais'
    ],
    investment: 'R$ 500.000 - R$ 5.000.000',
    roi: '500% em 4 anos',
    timeframe: '60-90 dias para conclusão',
    icon: DollarSign,
    color: 'yellow'
  }
]

const successMetrics = [
  { label: '500+ Empresários', value: 'Interessados', icon: Users },
  { label: '75+ Tecnologias', value: 'Integradas', icon: TrendingUp },
  { label: '15 Agentes IA', value: 'Trabalhando 24/7', icon: Star },
  { label: '9 Módulos SaaS', value: 'Disponíveis', icon: Briefcase }
]

export default function PartnershipsContactPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedPartnership, setSelectedPartnership] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (!mounted) return null
  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} duration={1000} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/pt-br" 
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Parcerias Empresariais
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Oportunidades estratégicas de negócio com ROI superior a 300%
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">ROI 452%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">em 3 anos</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl text-white p-8 md:p-12 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <Handshake className="w-16 h-16 mx-auto mb-6 text-blue-200" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Junte-se à Revolução da Automação Empresarial
            </h2>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              Oportunidade única de parceria com a primeira plataforma SaaS 100% autônoma por IA do Brasil. 
              ROI comprovado de até 452% em 3 anos com mercado de R$ 2.3 trilhões.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5517981805327?text=Tenho interesse em parceria empresarial com KRYONIX. Gostaria de mais informações sobre as oportunidades disponíveis."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-6 h-6" />
                Quero Ser Parceiro
              </a>
              <a
                href="#partnership-types"
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2"
              >
                <Calculator className="w-6 h-6" />
                Ver Oportunidades
              </a>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {successMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-xl transition-all duration-300"
              >
                <Icon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {metric.label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {metric.value}
                </div>
              </div>
            )
          })}
        </div>

        {/* Partnership Types */}
        <div id="partnership-types" className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Tipos de Parceria Disponíveis
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Escolha a modalidade de parceria que melhor se adapta ao seu perfil e objetivos de investimento
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {partnershipTypes.map((partnership) => {
              const Icon = partnership.icon
              const isSelected = selectedPartnership === partnership.id
              
              return (
                <div
                  key={partnership.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                    isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedPartnership(isSelected ? null : partnership.id)}
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-4 rounded-xl bg-${partnership.color}-100 dark:bg-${partnership.color}-900/20`}>
                        <Icon className={`w-8 h-8 text-${partnership.color}-600`} />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {partnership.roi}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          ROI Estimado
                        </div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {partnership.title}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold mb-4">
                      {partnership.subtitle}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {partnership.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {partnership.investment}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Investimento
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {partnership.roi}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          ROI Projetado
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {partnership.timeframe}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Prazo
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="animate-slideDown border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          Benefícios Inclusos:
                        </h4>
                        <div className="space-y-3">
                          {partnership.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <a
                            href={`https://wa.me/5517981805327?text=Tenho interesse na ${partnership.title}. Gostaria de agendar uma reunião para discutir os detalhes.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Quero Esta Parceria
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Entre em Contato
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Agende uma reunião para discutir oportunidades de parceria personalizadas
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">parcerias@kryonix.com.br</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">WhatsApp</h3>
                    <p className="text-gray-600 dark:text-gray-300">+55 17 98180-5327</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Localização</h3>
                    <p className="text-gray-600 dark:text-gray-300">São Paulo, Brasil</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Resposta Garantida em 24h
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Todas as consultas de parceria são respondidas em até 24 horas. 
                    Para oportunidades urgentes, use o WhatsApp para resposta imediata.
                  </p>
                </div>
              </div>

              {/* Quick Contact Form */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Contato Rápido
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Parceria
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100">
                      <option>Infraestrutura</option>
                      <option>Estratégica</option>
                      <option>Expansão</option>
                      <option>Investimento</option>
                      <option>Personalizada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Orçamento Disponível
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100">
                      <option>R$ 50.000 - R$ 150.000</option>
                      <option>R$ 150.000 - R$ 500.000</option>
                      <option>R$ 500.000 - R$ 1.000.000</option>
                      <option>R$ 1.000.000+</option>
                      <option>Apenas infraestrutura</option>
                    </select>
                  </div>
                  <a
                    href={`https://wa.me/5517981805327?text=Olá! Tenho interesse em parceria empresarial com KRYONIX. Gostaria de agendar uma reunião para discutir oportunidades.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Agendar Reunião
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gray-900 text-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">Por que Escolher KRYONIX?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Crescimento Comprovado</h4>
                <p className="text-gray-300 text-sm">
                  500+ empresários interessados antes mesmo do lançamento oficial
                </p>
              </div>
              <div className="text-center">
                <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Tecnologia Única</h4>
                <p className="text-gray-300 text-sm">
                  Primeira plataforma 100% autônoma por IA do mercado brasileiro
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">ROI Garantido</h4>
                <p className="text-gray-300 text-sm">
                  Projeções conservadoras baseadas em análise de mercado real
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

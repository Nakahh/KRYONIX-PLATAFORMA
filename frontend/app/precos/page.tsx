'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Check,
  X,
  Star,
  Zap,
  Shield,
  Crown,
  Sparkles,
  Calculator,
  MessageCircle,
  BarChart3,
  Users,
  Globe,
  Calendar,
  Mail,
  Smartphone
} from 'lucide-react'

export default function Precos() {
  const [billing, setBilling] = useState('monthly') // monthly | annual
  const [selectedModules, setSelectedModules] = useState<string[]>([])

  const planos = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal para começar',
      price: { monthly: 99, annual: 89 },
      featured: false,
      includes: ['1 módulo à escolha', 'Até 100 contatos', 'Suporte básico', '1 usuário'],
      icon: Zap,
      color: 'blue'
    },
    {
      id: 'growth',
      name: 'Growth',
      description: 'Para empresas em crescimento',
      price: { monthly: 299, annual: 269 },
      featured: true,
      includes: ['Até 3 módulos', 'Até 1.000 contatos', 'Suporte prioritário', 'Até 5 usuários', 'WhatsApp Business'],
      icon: Star,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Solução completa',
      price: { monthly: 599, annual: 539 },
      featured: false,
      includes: ['Todos os 8 módulos', 'Contatos ilimitados', 'Suporte VIP 24/7', 'Usuários ilimitados', 'White-label', 'IA avançada'],
      icon: Crown,
      color: 'gold'
    }
  ]

  const modulos = [
    {
      id: 'analytics',
      name: 'Análise Avançada e BI',
      price: 99,
      icon: BarChart3,
      description: 'Dashboards e relatórios inteligentes',
      features: ['Dashboards em tempo real', 'Análise preditiva', 'Relatórios automáticos']
    },
    {
      id: 'agendamento',
      name: 'Agendamento Inteligente',
      price: 119,
      icon: Calendar,
      description: 'Sistema completo de agendamento',
      features: ['Agendamento online 24/7', 'Lembretes automáticos', 'Integração calendários']
    },
    {
      id: 'atendimento',
      name: 'Atendimento Omnichannel',
      price: 159,
      icon: MessageCircle,
      description: 'Central unificada de atendimento',
      features: ['WhatsApp + Instagram + Email', 'Chatbots inteligentes', 'Histórico unificado']
    },
    {
      id: 'crm',
      name: 'CRM & Funil de Vendas',
      price: 179,
      icon: Users,
      description: 'Gestão completa de vendas',
      features: ['Pipeline automatizado', 'Lead scoring', 'Previsão de vendas com IA']
    },
    {
      id: 'email-marketing',
      name: 'Email Marketing Multicanal',
      price: 219,
      icon: Mail,
      description: 'Campanhas inteligentes',
      features: ['Email + SMS + WhatsApp', 'Segmentação com IA', 'A/B testing automático']
    },
    {
      id: 'redes-sociais',
      name: 'Gestão Redes Sociais',
      price: 239,
      icon: Globe,
      description: 'Automação de redes sociais',
      features: ['Agendamento automático', 'Criação de conteúdo IA', 'Análise de engajamento']
    },
    {
      id: 'portal',
      name: 'Portal do Cliente',
      price: 269,
      icon: Shield,
      description: 'Área exclusiva para clientes',
      features: ['Login biométrico', 'Self-service', 'Documentos e relatórios']
    },
    {
      id: 'whitelabel',
      name: 'Whitelabel Customizável',
      price: 299,
      icon: Sparkles,
      description: 'Sua marca, sua plataforma',
      features: ['Personalização completa', 'Domínio próprio', 'Revenda da plataforma']
    }
  ]

  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const calculateCustomPrice = () => {
    const basePrice = selectedModules.reduce((total, moduleId) => {
      const module = modulos.find(m => m.id === moduleId)
      return total + (module?.price || 0)
    }, 0)
    
    return billing === 'annual' ? Math.round(basePrice * 0.9) : basePrice
  }

  const getPlanPrice = (plan: any) => {
    return billing === 'annual' ? plan.price.annual : plan.price.monthly
  }

  const getDiscount = () => {
    return billing === 'annual' ? '10% OFF' : ''
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Preços e Planos</h1>
              <p className="text-gray-600 dark:text-gray-400">Escolha o plano ideal para seu negócio</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Planos que <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">escalam</span> com seu negócio
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Comece gratuitamente e pague apenas pelos módulos que usar. Sem compromisso de longo prazo.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                billing === 'annual'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                10% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border transition-all duration-200 ${
                plano.featured
                  ? 'border-purple-500 shadow-purple-500/20 scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
              }`}
            >
              {plano.featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-${plano.color === 'gold' ? 'yellow' : plano.color}-100 dark:bg-${plano.color === 'gold' ? 'yellow' : plano.color}-900/20 flex items-center justify-center`}>
                    <plano.icon className={`w-6 h-6 text-${plano.color === 'gold' ? 'yellow' : plano.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {plano.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {plano.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      R$ {getPlanPrice(plano)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      /{billing === 'annual' ? 'mês (anual)' : 'mês'}
                    </span>
                  </div>
                  {billing === 'annual' && (
                    <p className="text-green-600 text-sm mt-1">
                      Economia de R$ {(plano.price.monthly - plano.price.annual) * 12}/ano
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plano.includes.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plano.featured
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gray-900 dark:bg-gray-600 text-white hover:bg-gray-800 dark:hover:bg-gray-500'
                  }`}
                >
                  Começar Teste Grátis
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Module Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-16">
          <div className="text-center mb-8">
            <Calculator className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Monte seu plano personalizado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Escolha apenas os módulos que precisa e pague somente por eles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {modulos.map((modulo) => (
              <div
                key={modulo.id}
                onClick={() => toggleModule(modulo.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedModules.includes(modulo.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <modulo.icon className={`w-6 h-6 ${
                    selectedModules.includes(modulo.id) ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedModules.includes(modulo.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {selectedModules.includes(modulo.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                  {modulo.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">
                  {modulo.description}
                </p>
                <div className="text-lg font-bold text-blue-600">
                  R$ {modulo.price}/mês
                </div>
              </div>
            ))}
          </div>

          {selectedModules.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Seu plano personalizado
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {selectedModules.length} módulo(s) selecionado(s)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    R$ {calculateCustomPrice()}/mês
                  </div>
                  {billing === 'annual' && (
                    <p className="text-green-600 text-sm">
                      10% de desconto anual aplicado
                    </p>
                  )}
                </div>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Começar com Plano Personalizado
              </button>
            </div>
          )}
        </div>

        {/* Features Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
            Compare os Recursos
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-4 px-2 text-gray-900 dark:text-gray-100 font-semibold">
                    Recursos
                  </th>
                  {planos.map((plano) => (
                    <th key={plano.id} className="text-center py-4 px-2">
                      <div className="text-gray-900 dark:text-gray-100 font-semibold">
                        {plano.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        R$ {getPlanPrice(plano)}/mês
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Usuários', starter: '1', growth: '5', enterprise: 'Ilimitados' },
                  { name: 'Contatos', starter: '100', growth: '1.000', enterprise: 'Ilimitados' },
                  { name: 'WhatsApp Business', starter: <X className="w-4 h-4 text-red-500" />, growth: <Check className="w-4 h-4 text-green-500" />, enterprise: <Check className="w-4 h-4 text-green-500" /> },
                  { name: 'IA Avançada', starter: <X className="w-4 h-4 text-red-500" />, growth: 'Básica', enterprise: 'Completa' },
                  { name: 'White-label', starter: <X className="w-4 h-4 text-red-500" />, growth: <X className="w-4 h-4 text-red-500" />, enterprise: <Check className="w-4 h-4 text-green-500" /> },
                  { name: 'Suporte', starter: 'Básico', growth: 'Prioritário', enterprise: 'VIP 24/7' }
                ].map((feature, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-4 px-2 text-gray-900 dark:text-gray-100 font-medium">
                      {feature.name}
                    </td>
                    <td className="py-4 px-2 text-center text-gray-600 dark:text-gray-400">
                      {feature.starter}
                    </td>
                    <td className="py-4 px-2 text-center text-gray-600 dark:text-gray-400">
                      {feature.growth}
                    </td>
                    <td className="py-4 px-2 text-center text-gray-600 dark:text-gray-400">
                      {feature.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Perguntas Frequentes sobre Preços
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              question: 'Posso trocar de plano a qualquer momento?',
              answer: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações são aplicadas no próximo ciclo de cobrança.'
            },
            {
              question: 'Existe desconto para ONGs ou estudantes?',
              answer: 'Sim, oferecemos 50% de desconto para ONGs comprovadas e 30% para estudantes universitários. Entre em contato para mais informações.'
            },
            {
              question: 'O que acontece se eu cancelar?',
              answer: 'Você pode cancelar a qualquer momento. Manterá acesso até o final do período pago e seus dados ficam seguros por 30 dias.'
            },
            {
              question: 'Posso adicionar módulos depois?',
              answer: 'Claro! Você pode adicionar novos módulos a qualquer momento. A cobrança será proporcional ao período restante.'
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {faq.question}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Pronto para começar?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Teste gratuitamente por 7 dias, sem cartão de crédito. Cancele quando quiser.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Começar Teste Grátis
            </button>
            <a
              href="https://wa.me/5517981805327?text=Olá! Gostaria de conhecer os planos do KRYONIX"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Falar com Consultor
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

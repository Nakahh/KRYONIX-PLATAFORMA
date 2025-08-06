'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/app/components/Logo'
import { 
  ArrowLeft, 
  Building2, 
  Globe, 
  Users, 
  TrendingUp, 
  Shield, 
  Handshake,
  Mail,
  Phone,
  MessageCircle,
  Calendar,
  FileText,
  CheckCircle,
  Star,
  DollarSign
} from 'lucide-react'

const partnershipTypes = [
  {
    icon: Building2,
    title: 'Parceria de Infraestrutura',
    description: 'Provedores de servidores e cloud computing para hospedar nossa plataforma de 75+ stacks tecnológicos.',
    investment: 'R$ 334k - R$ 2M',
    roi: '452% em 3 anos',
    benefits: [
      'Naming rights exclusivos',
      '15% revenue share',
      'Exclusividade de categoria',
      'Acesso a 8.000+ clientes',
      'Co-marketing agreement'
    ]
  },
  {
    icon: Handshake,
    title: 'Parceria Estratégica',
    description: 'Empresas que querem integrar seus serviços com nossa plataforma de 75+ stacks tecnológicos ou criar soluções conjuntas e inovadoras para o mercado.',
    investment: 'Investimento variável',
    roi: 'ROI customizado',
    benefits: [
      'Integração tecnológica completa com APIs',
      'Acesso direto ao nosso mercado de 8K+ clientes',
      'Desenvolvimento conjunto de soluções',
      'Expansão de portfólio com nossa tecnologia',
      'Suporte mútuo comercial e técnico',
      'Treinamento especializado da equipe',
      'Dashboard personalizado para parceiros'
    ]
  },
  {
    icon: Globe,
    title: 'Parceria de Expansão',
    description: 'Empresas interessadas em levar KRYONIX para outros países ou regiões específicas, expandindo nossa presença global e oferecendo soluções personalizadas para mercados locais.',
    investment: 'Modelo franchise',
    roi: 'Participação nos lucros',
    benefits: [
      'Direitos territoriais exclusivos por região',
      'Marca white-label personalizada',
      'Treinamento completo de 40 horas',
      'Suporte técnico 24/7 em português',
      'Marketing localizado e materiais traduzidos',
      'Acompanhamento contínuo por 12 meses',
      'Participação nos lucros de 15-25%'
    ]
  }
]

const contactReasons = [
  'Interesse em parceria de infraestrutura/servidores',
  'Proposta de parceria estratégica',
  'Oportunidade de investimento',
  'Expansão internacional/regional',
  'Integração tecnológica',
  'Revenda/distribuição',
  'Outros assuntos comerciais'
]

export default function PartnershipContact() {
  const [selectedPartnership, setSelectedPartnership] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    website: '',
    reason: '',
    investment: '',
    message: '',
    timeline: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Preparar mensagem para WhatsApp
    const whatsappMessage = `🤝 PROPOSTA DE PARCERIA COMERCIAL - KRYONIX

👤 DADOS DO INTERESSADO:
Nome: ${formData.name}
Empresa: ${formData.company}
Cargo: ${formData.position}
Email: ${formData.email}
Telefone: ${formData.phone}
Website: ${formData.website}

💼 DETALHES DA PARCERIA:
Tipo de Interesse: ${formData.reason}
Capacidade de Investimento: ${formData.investment}
Timeline: ${formData.timeline}

📝 MENSAGEM:
${formData.message}

--
Esta mensagem foi enviada através do formulário de parcerias empresariais do site KRYONIX.`

    const encodedMessage = encodeURIComponent(whatsappMessage)
    window.open(`https://wa.me/5517981805327?text=${encodedMessage}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <Logo />
            </Link>
            <div className="text-right">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Parcerias Empresariais</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Oportunidades de negócio</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Seja Nosso <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Parceiro Estratégico</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
            Junte-se à revolução da automação empresarial. Múltiplas oportunidades de parceria com 
            ROI de até <strong className="text-green-600">452% em 3 anos</strong>.
          </p>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-600">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">R$ 45M+</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Receita Projetada</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-600">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">8K+</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Clientes Finais</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-600">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">75+</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">Stacks Integrados</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-600">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">452%</div>
              <div className="text-sm text-gray-600 dark:text-slate-400">ROI Máximo</div>
            </div>
          </div>
        </div>

        {/* Partnership Types */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
            Tipos de Parceria Disponíveis
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {partnershipTypes.map((partnership, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer ${
                  selectedPartnership === index 
                    ? 'border-blue-500 shadow-xl transform scale-105' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-xl'
                }`}
                onClick={() => setSelectedPartnership(selectedPartnership === index ? null : index)}
              >
                <div className="text-center mb-6">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <partnership.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {partnership.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {partnership.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <div className="text-sm font-semibold text-green-700 dark:text-green-400">Investimento</div>
                      <div className="text-xs text-green-600 dark:text-green-300">{partnership.investment}</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <div className="text-sm font-semibold text-purple-700 dark:text-purple-400">ROI Projetado</div>
                      <div className="text-xs text-purple-600 dark:text-purple-300">{partnership.roi}</div>
                    </div>
                  </div>
                </div>

                {selectedPartnership === index && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Benefícios Inclusos:</h4>
                    <ul className="space-y-2">
                      {partnership.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Entre em Contato
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Preencha o formulário abaixo e nossa equipe de parcerias entrará em contato em até 24 horas.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Nome da empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cargo/Posição *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Ex: CEO, Diretor Comercial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="email@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="+55 11 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website da Empresa
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="https://empresa.com.br"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Interesse *
              </label>
              <select
                required
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Selecione o tipo de parceria</option>
                {contactReasons.map((reason, index) => (
                  <option key={index} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capacidade de Investimento
                </label>
                <select
                  value={formData.investment}
                  onChange={(e) => setFormData({...formData, investment: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">Selecione a faixa</option>
                  <option value="Até R$ 100k">Até R$ 100k</option>
                  <option value="R$ 100k - R$ 500k">R$ 100k - R$ 500k</option>
                  <option value="R$ 500k - R$ 1M">R$ 500k - R$ 1M</option>
                  <option value="R$ 1M - R$ 5M">R$ 1M - R$ 5M</option>
                  <option value="Acima de R$ 5M">Acima de R$ 5M</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeline Desejado
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">Quando pretende iniciar?</option>
                  <option value="Imediato">Imediato</option>
                  <option value="Próximos 30 dias">Próximos 30 dias</option>
                  <option value="Próximos 3 meses">Próximos 3 meses</option>
                  <option value="Próximos 6 meses">Próximos 6 meses</option>
                  <option value="Apenas avaliando">Apenas avaliando</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mensagem Detalhada *
              </label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Descreva sua proposta de parceria, expectativas, objetivos e qualquer informação relevante que possa ajudar nossa equipe a entender melhor sua oportunidade de negócio..."
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📄 Documentação Disponível
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Temos documentação completa disponível para parceiros qualificados:
              </p>
              <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                <li>• Análise técnica completa (75+ stacks)</li>
                <li>• Projeções financeiras detalhadas</li>
                <li>• Plano de negócios completo</li>
                <li>• Propostas comerciais em 5 idiomas</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Enviar Proposta via WhatsApp
            </button>
          </form>
        </div>

        {/* Direct Contact Options */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg">
            <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">WhatsApp Direto</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Para conversas rápidas</p>
            <a
              href="https://wa.me/5517981805327?text=Tenho%20interesse%20em%20uma%20parceria%20comercial%20com%20KRYONIX"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              +55 17 98180-5327
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Email Corporativo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Para propostas formais</p>
            <a
              href="mailto:partnerships@kryonix.com.br"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              partnerships@kryonix.com.br
            </a>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Reunião Agendada</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Para apresentações executivas</p>
            <span className="text-purple-600 font-medium">
              Agendar via WhatsApp
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4" />
            <span>Todas as informações são tratadas com confidencialidade</span>
          </div>
          <p>📧 partnerships@kryonix.com.br • 📱 +55 17 98180-5327 • 🌐 www.kryonix.com.br</p>
        </div>
      </div>
    </div>
  )
}

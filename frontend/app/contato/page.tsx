'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  HelpCircle,
  Book,
  Zap,
  Users,
  Star
} from 'lucide-react'

export default function Contato() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    subject: '',
    message: '',
    priority: 'normal'
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulação de envio
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const faq = [
    {
      question: 'Como funciona o período de teste gratuito?',
      answer: 'Oferecemos 7 dias gratuitos com acesso completo a todos os módulos. Não é necessário cartão de crédito para começar.'
    },
    {
      question: 'Posso cancelar minha assinatura a qualquer momento?',
      answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas de cancelamento e você mantém acesso até o final do período pago.'
    },
    {
      question: 'Como funciona a integração com WhatsApp?',
      answer: 'Utilizamos a Evolution API oficial do WhatsApp Business. A conexão é segura e permite envio de mensagens, recebimento e automações completas.'
    },
    {
      question: 'Meus dados estão seguros?',
      answer: 'Sim, utilizamos criptografia de ponta a ponta, servidores seguros e isolamento completo entre clientes. Seus dados nunca se misturam com outros usuários.'
    },
    {
      question: 'Posso personalizar a plataforma com minha marca?',
      answer: 'Sim, nosso módulo White-label permite personalização completa: logo, cores, domínio próprio e remoção da marca KRYONIX.'
    }
  ]

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'WhatsApp Business',
      description: 'Suporte direto via WhatsApp',
      info: '+55 17 98180-5327',
      action: 'Enviar mensagem',
      link: 'https://wa.me/5517981805327?text=Olá! Preciso de suporte com a plataforma KRYONIX',
      color: 'green',
      available: '24/7'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Suporte por email',
      info: 'suporte@kryonix.com.br',
      action: 'Enviar email',
      link: 'mailto:suporte@kryonix.com.br',
      color: 'blue',
      available: 'Resposta em até 2h'
    },
    {
      icon: Book,
      title: 'Documentação',
      description: 'Guias e tutoriais',
      info: 'Base de conhecimento',
      action: 'Ver documentação',
      link: '/documentacao',
      color: 'purple',
      available: 'Acesso imediato'
    },
    {
      icon: Users,
      title: 'Comunidade',
      description: 'Fórum de usuários',
      info: 'Discord/Telegram',
      action: 'Participar',
      link: '#',
      color: 'indigo',
      available: 'Em breve'
    }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Mensagem Enviada!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Recebemos sua mensagem e entraremos em contato em breve. Normalmente respondemos em até 2 horas.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Voltar ao Início
            </Link>
            <a
              href="https://wa.me/5517981805327?text=Olá! Enviei uma mensagem pelo formulário e gostaria de falar diretamente"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full border border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              WhatsApp Urgente
            </a>
          </div>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contato & Suporte</h1>
              <p className="text-gray-600 dark:text-gray-400">Estamos aqui para ajudar você</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Como podemos ajudar?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Nossa equipe está pronta para resolver suas dúvidas e problemas. Escolha o canal que preferir.
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {supportChannels.map((channel, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-all duration-200">
              <div className={`w-12 h-12 bg-${channel.color}-100 dark:bg-${channel.color}-900/20 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <channel.icon className={`w-6 h-6 text-${channel.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {channel.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {channel.description}
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {channel.info}
              </p>
              <p className={`text-xs text-${channel.color}-600 mb-4`}>
                {channel.available}
              </p>
              {channel.link.startsWith('#') ? (
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed">
                  {channel.action}
                </button>
              ) : (
                <Link
                  href={channel.link}
                  target={channel.link.startsWith('http') ? '_blank' : '_self'}
                  rel={channel.link.startsWith('http') ? 'noopener noreferrer' : ''}
                  className={`block w-full px-4 py-2 bg-${channel.color}-600 text-white rounded-lg hover:bg-${channel.color}-700 transition-colors`}
                >
                  {channel.action}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Envie uma Mensagem</h3>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Seu nome"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prioridade
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assunto *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva resumidamente sua dúvida"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detalhe sua dúvida ou problema..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Perguntas Frequentes</h3>
            
            <div className="space-y-4">
              {faq.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {item.question}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações de Contato</h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    São José do Rio Preto, SP - Brasil
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Seg-Sex: 8h às 18h | Sáb: 8h às 12h
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Resposta em até 2 horas (horário comercial)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
            O que nossos clientes dizem
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Maria Silva',
                role: 'CEO, Consultoria MS',
                review: 'Suporte excepcional! Respondem rapidamente e sempre resolvem meus problemas.',
                rating: 5
              },
              {
                name: 'João Santos',
                role: 'Diretor, Tech Solutions',
                review: 'A documentação é clara e o suporte via WhatsApp é muito prático.',
                rating: 5
              },
              {
                name: 'Ana Costa',
                role: 'Gerente, Marketing Pro',
                review: 'Equipe super atenciosa e conhece muito bem a plataforma.',
                rating: 5
              }
            ].map((review, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  "{review.review}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {review.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {review.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

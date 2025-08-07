'use client'

import { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MessageCircle, 
  Building, 
  Users, 
  Send,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  employees: string
  interests: string[]
  message: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    employees: '1-10',
    interests: [],
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const modules = [
    'Análise Avançada e BI',
    'Agendamento Inteligente',
    'Atendimento Omnichannel',
    'CRM & Funil de Vendas',
    'Email Marketing Multicanal',
    'Gestão Redes Sociais',
    'Portal do Cliente',
    'Whitelabel Customizável'
  ]

  const employeeRanges = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '500+'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInterestChange = (module: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(module)
        ? prev.interests.filter(i => i !== module)
        : [...prev.interests, module]
    }))
  }

  const generateWhatsAppMessage = (data: FormData) => {
    let message = `🚀 *NOVO LEAD - KRYONIX*\n\n`
    message += `👤 *Nome:* ${data.name}\n`
    message += `📧 *Email:* ${data.email}\n`
    message += `📱 *Telefone:* ${data.phone}\n`
    message += `🏢 *Empresa:* ${data.company}\n`
    message += `👥 *Funcionários:* ${data.employees}\n\n`
    
    if (data.interests.length > 0) {
      message += `💡 *Módulos de Interesse:*\n`
      data.interests.forEach(interest => {
        message += `• ${interest}\n`
      })
      message += `\n`
    }
    
    if (data.message) {
      message += `💬 *Mensagem:*\n${data.message}\n\n`
    }
    
    message += `⏰ *Data:* ${new Date().toLocaleString('pt-BR')}\n\n`
    message += `🎯 *Próximo Passo:* Entrar em contato para apresentação personalizada`
    
    return encodeURIComponent(message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage(formData)
      
      // Open WhatsApp with the message
      const whatsappUrl = `https://wa.me/5517981805327?text=${whatsappMessage}`

      // Only open window on client side
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank')
      }
      
      setSubmitStatus('success')
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          employees: '1-10',
          interests: [],
          message: ''
        })
        setSubmitStatus('idle')
      }, 3000)
      
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contato Direto
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Pronto para <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Revolucionar</span> seu Negócio?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Fale conosco e descubra como a KRYONIX pode automatizar e otimizar seus processos
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Company */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Empresa *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Nome da sua empresa"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de Funcionários
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <select
                      name="employees"
                      value={formData.employees}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {employeeRanges.map(range => (
                        <option key={range} value={range}>{range} funcionários</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Módulos de Interesse (opcional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {modules.map(module => (
                      <label
                        key={module}
                        className="flex items-center p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(module)}
                          onChange={() => handleInterestChange(module)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {module}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Conte-nos mais sobre suas necessidades..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || submitStatus === 'success'}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : submitStatus === 'success' ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Enviado com Sucesso!</span>
                      </>
                    ) : submitStatus === 'error' ? (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        <span>Erro ao Enviar - Tente Novamente</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Enviar via WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                        Mensagem Enviada!
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        Abrimos o WhatsApp com suas informações. Nossa equipe entrará em contato em breve!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ou entre em contato diretamente:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8">
              <a
                href="https://wa.me/5517981805327"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>(17) 98180-5327</span>
              </a>
              <a
                href="mailto:contato@kryonix.com.br"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>contato@kryonix.com.br</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

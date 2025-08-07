'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Users, 
  Briefcase,
  Target,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface WaitlistFormData {
  nome: string
  email: string
  telefone: string
  empresa: string
  cargo: string
  segmento: string
  modulosInteresse: string[]
  tamanhoEmpresa: string
  expectativaUso: string
  mensagem: string
}

interface FormErrors {
  nome?: string
  email?: string
  telefone?: string
  empresa?: string
  cargo?: string
  segmento?: string
}

export default function FilaDeEspera() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<WaitlistFormData>({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: '',
    segmento: '',
    modulosInteresse: [],
    tamanhoEmpresa: '1-10',
    expectativaUso: '',
    mensagem: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [posicaoFila, setPosicaoFila] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const segmentosNegocio = [
    'Medicina e Saúde',
    'Advocacia e Direito', 
    'Imobiliário',
    'Beleza e Estética',
    'Alimentação e Restaurantes',
    'E-commerce e Varejo',
    'Educação e Ensino',
    'Marketing Digital',
    'Consultoria Empresarial',
    'Tecnologia e Software',
    'Serviços Financeiros',
    'Arquitetura e Engenharia',
    'Turismo e Hotelaria',
    'Fitness e Academia',
    'Automóveis e Concessionárias',
    'Indústria e Manufatura',
    'Agronegócio',
    'Outros'
  ]

  const modulosDisponiveis = [
    'Análise Avançada e BI',
    'Agendamento Inteligente + Cobrança',
    'Atendimento Omnichannel IA',
    'CRM Inteligente & Funil de Vendas',
    'Email Marketing Avançado',
    'Gestão Redes Sociais + IA',
    'Portal Cliente + Treinamento IA',
    'WhatsApp Business Automation',
    'SMS + Push Notifications'
  ]

  const expectativasUso = [
    'Imediatamente (tenho urgência)',
    'Próximos 30 dias',
    'Próximos 90 dias',
    'Próximos 6 meses',
    'Estou apenas explorando as opções',
    'Aguardando mais informações'
  ]

  const tamanhoEmpresaOptions = [
    { value: '1-10', label: '1-10 funcionários' },
    { value: '11-50', label: '11-50 funcionários' },
    { value: '51-200', label: '51-200 funcionários' },
    { value: '201-500', label: '201-500 funcionários' },
    { value: '500+', label: '500+ funcionários' }
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validação de nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validação de telefone
    const phoneRegex = /^[\+]?[1-9][\d]{0,3}[\s\(\-\)]*\d[\d\s\(\-\)]*\d$/
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório'
    } else if (!phoneRegex.test(formData.telefone.replace(/\D/g, ''))) {
      newErrors.telefone = 'Telefone inválido'
    }

    // Validação de empresa
    if (!formData.empresa.trim()) {
      newErrors.empresa = 'Nome da empresa é obrigatório'
    }

    // Validação de cargo
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório'
    }

    // Validação de segmento
    if (!formData.segmento) {
      newErrors.segmento = 'Segmento de negócio é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handleModuloChange = (modulo: string) => {
    setFormData(prev => ({
      ...prev,
      modulosInteresse: prev.modulosInteresse.includes(modulo)
        ? prev.modulosInteresse.filter(m => m !== modulo)
        : [...prev.modulosInteresse, modulo]
    }))
  }

  const generateWaitlistMessage = (data: WaitlistFormData, posicao: number) => {
    let message = `🎯 *NOVA INSCRIÇÃO - FILA DE ESPERA KRYONIX*\n\n`
    message += `👤 *Nome:* ${data.nome}\n`
    message += `📧 *Email:* ${data.email}\n`
    message += `📱 *Telefone:* ${data.telefone}\n`
    message += `🏢 *Empresa:* ${data.empresa}\n`
    message += `💼 *Cargo:* ${data.cargo}\n`
    message += `🎯 *Segmento:* ${data.segmento}\n`
    message += `👥 *Tamanho:* ${data.tamanhoEmpresa}\n`
    
    if (data.expectativaUso) {
      message += `⏰ *Expectativa:* ${data.expectativaUso}\n`
    }
    
    message += `\n`
    
    if (data.modulosInteresse.length > 0) {
      message += `💡 *Módulos de Interesse:*\n`
      data.modulosInteresse.forEach(modulo => {
        message += `• ${modulo}\n`
      })
      message += `\n`
    }
    
    if (data.mensagem) {
      message += `💬 *Mensagem Adicional:*\n${data.mensagem}\n\n`
    }
    
    message += `🏆 *Posição na Fila VIP:* #${posicao}\n`
    message += `📅 *Data de Inscrição:* ${new Date().toLocaleString('pt-BR')}\n\n`
    message += `🚀 *Próximo Passo:* Nossa equipe entrará em contato para uma apresentação personalizada da plataforma KRYONIX`
    
    return encodeURIComponent(message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Simular chamada à API
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        const novaPosicao = result.position || Math.floor(Math.random() * 500) + 100
        setPosicaoFila(novaPosicao)
        
        // Gerar mensagem WhatsApp
        const whatsappMessage = generateWaitlistMessage(formData, novaPosicao)
        
        // Abrir WhatsApp
        const whatsappUrl = `https://wa.me/5517981805327?text=${whatsappMessage}`
        window.open(whatsappUrl, '_blank')
        
        setSubmitStatus('success')
        
        // Reset form after success
        setTimeout(() => {
          setFormData({
            nome: '',
            email: '',
            telefone: '',
            empresa: '',
            cargo: '',
            segmento: '',
            modulosInteresse: [],
            tamanhoEmpresa: '1-10',
            expectativaUso: '',
            mensagem: ''
          })
        }, 5000)
      } else {
        throw new Error('Erro ao enviar formulário')
      }
      
    } catch (error) {
      console.error('Erro ao submeter:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-300">Carregando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo-kryonix.svg"
                alt="KRYONIX Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  KRYONIX
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Fila de Espera VIP</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Lista VIP Aberta</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300 text-sm font-medium mb-6">
                <Clock className="w-4 h-4 mr-2" />
                <Sparkles className="w-4 h-4 mr-1" />
                Lançamento: 10 de Fevereiro de 2026
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-balance">
                <span className="text-gray-900 dark:text-gray-100">Entre na</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Fila de Espera VIP
                </span>
                <br />
                <span className="text-3xl sm:text-4xl text-gray-700 dark:text-gray-300">KRYONIX</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-balance max-w-3xl mx-auto">
                Seja um dos <strong className="text-green-600">primeiros 1.000 clientes</strong> a revolucionar seu negócio com IA.
                Garantia de <strong>preço especial</strong> e <strong>acesso prioritário</strong>!
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <div className="font-bold text-green-700 dark:text-green-400 text-lg mb-2">🎯 Acesso Prioritário</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Primeiros na fila de lançamento</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="font-bold text-blue-700 dark:text-blue-400 text-lg mb-2">💰 Preço Especial</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Até 50% de desconto vitalício</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="font-bold text-purple-700 dark:text-purple-400 text-lg mb-2">🏆 Setup Gratuito</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Implementação completa (R$ 1.497)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 p-8 text-white text-center">
                <h2 className="text-3xl font-bold mb-4">
                  📝 Formulário de Inscrição VIP
                </h2>
                <p className="text-lg opacity-90">
                  Preencha seus dados para garantir sua vaga na fila de espera
                </p>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Informações Pessoais */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Informações Pessoais
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nome Completo *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                              errors.nome 
                                ? 'border-red-300 dark:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Seu nome completo"
                          />
                        </div>
                        {errors.nome && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nome}</p>
                        )}
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
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                              errors.email 
                                ? 'border-red-300 dark:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="seu@email.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          WhatsApp *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="telefone"
                            value={formData.telefone}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                              errors.telefone 
                                ? 'border-red-300 dark:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        {errors.telefone && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefone}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Cargo/Posição *
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="cargo"
                            value={formData.cargo}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                              errors.cargo 
                                ? 'border-red-300 dark:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="CEO, Gerente, Diretor, etc."
                          />
                        </div>
                        {errors.cargo && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cargo}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informações da Empresa */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Informações da Empresa
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nome da Empresa *
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="empresa"
                            value={formData.empresa}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                              errors.empresa 
                                ? 'border-red-300 dark:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                            placeholder="Nome da sua empresa"
                          />
                        </div>
                        {errors.empresa && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.empresa}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Segmento de Negócio *
                        </label>
                        <div className="relative">
                          <Target className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <select
                            name="segmento"
                            value={formData.segmento}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                              errors.segmento 
                                ? 'border-red-300 dark:border-red-600' 
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <option value="">Selecione seu segmento</option>
                            {segmentosNegocio.map(segmento => (
                              <option key={segmento} value={segmento}>{segmento}</option>
                            ))}
                          </select>
                        </div>
                        {errors.segmento && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.segmento}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tamanho da Empresa
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <select
                          name="tamanhoEmpresa"
                          value={formData.tamanhoEmpresa}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          {tamanhoEmpresaOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Módulos de Interesse */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Módulos de Interesse
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Quais módulos têm seu interesse? (opcional)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {modulosDisponiveis.map(modulo => (
                          <label
                            key={modulo}
                            className="flex items-start p-4 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.modulosInteresse.includes(modulo)}
                              onChange={() => handleModuloChange(modulo)}
                              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-0.5"
                            />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {modulo}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expectativa e Mensagem */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Informações Adicionais
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expectativa de Uso
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <select
                          name="expectativaUso"
                          value={formData.expectativaUso}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">Quando pretende começar a usar?</option>
                          {expectativasUso.map(expectativa => (
                            <option key={expectativa} value={expectativa}>{expectativa}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mensagem Adicional (opcional)
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <textarea
                          name="mensagem"
                          value={formData.mensagem}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Conte-nos mais sobre suas necessidades específicas, desafios atuais ou como acredita que a KRYONIX pode ajudar seu negócio..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting || submitStatus === 'success'}
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 text-lg shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Processando sua inscrição...</span>
                        </>
                      ) : submitStatus === 'success' ? (
                        <>
                          <CheckCircle className="w-6 h-6" />
                          <span>Inscrito com Sucesso!</span>
                        </>
                      ) : submitStatus === 'error' ? (
                        <>
                          <AlertCircle className="w-6 h-6" />
                          <span>Erro - Tente Novamente</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          <span>Enviar Proposta</span>
                          <ArrowRight className="w-6 h-6" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Success Message */}
                {submitStatus === 'success' && posicaoFila && (
                  <div className="mt-8 p-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-3 mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                        <h3 className="text-3xl font-bold text-green-800 dark:text-green-200">
                          Bem-vindo à Fila VIP!
                        </h3>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
                        <div className="text-4xl font-bold text-primary-600 mb-3">
                          Posição #{posicaoFila}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                          Você está entre os primeiros na fila de espera!
                        </p>
                      </div>
                      
                      <p className="text-green-700 dark:text-green-300 mb-6 text-lg">
                        🎉 Parabéns! Abrimos o WhatsApp com suas informações completas. Nossa equipe entrará em contato em breve para agendar uma apresentação personalizada da plataforma KRYONIX.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg p-3">
                          <Shield className="w-5 h-5 text-green-500" />
                          <span>Preço especial garantido</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg p-3">
                          <Star className="w-5 h-5 text-yellow-500" />
                          <span>Acesso prioritário</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg p-3">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          <span>Setup gratuito incluído</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                          Erro ao Enviar Formulário
                        </h3>
                        <p className="text-red-700 dark:text-red-300">
                          Ocorreu um erro ao processar sua inscrição. Por favor, tente novamente ou entre em contato diretamente via WhatsApp.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Image
                src="/logo-kryonix.svg"
                alt="KRYONIX Logo"
                width={48}
                height={48}
                className="rounded-lg"
              />
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">
                KRYONIX
              </span>
            </div>
            <p className="text-gray-400 text-lg mb-6">
              Plataforma SaaS 100% Autônoma por IA
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <a
                href="https://wa.me/5517981805327"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors text-lg"
              >
                <Phone className="w-6 h-6" />
                <span>(17) 98180-5327</span>
              </a>
              <Link href="/" className="text-gray-400 hover:text-white transition-colors text-lg">
                Voltar ao Site Principal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

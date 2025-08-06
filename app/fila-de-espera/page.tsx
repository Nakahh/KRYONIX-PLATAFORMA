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
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  MessageCircle,
  ArrowRight,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from '../components/ThemeToggle'
import SimpleLanguageSwitcher from '../components/SimpleLanguageSwitcher'

interface WaitlistFormData {
  nome: string
  email: string
  telefone: string
  empresa: string
  segmento: string
  modulosInteresse: string[]
  tamanhoEmpresa: string
  expectativaUso: string
  observacoes: string
}

export default function FilaDeEspera() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState<WaitlistFormData>({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    segmento: '',
    modulosInteresse: [],
    tamanhoEmpresa: '1-10',
    expectativaUso: '',
    observacoes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [posicaoFila, setPosicaoFila] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
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
    'Aguardando mais informações'
  ]

  const tamanhoEmpresaOptions = [
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
    message += `🎯 *Segmento:* ${data.segmento}\n`
    message += `👥 *Tamanho:* ${data.tamanhoEmpresa} funcionários\n`
    message += `⏰ *Expectativa:* ${data.expectativaUso}\n\n`
    
    if (data.modulosInteresse.length > 0) {
      message += `💡 *Módulos de Interesse:*\n`
      data.modulosInteresse.forEach(modulo => {
        message += `• ${modulo}\n`
      })
      message += `\n`
    }
    
    if (data.observacoes) {
      message += `💬 *Observações:*\n${data.observacoes}\n\n`
    }
    
    message += `🎯 *Posição na Fila:* #${posicao}\n`
    message += `📅 *Data:* ${new Date().toLocaleString('pt-BR')}\n\n`
    message += `🚀 *Próximo Passo:* Entrar em contato para agendamento de apresentação`
    
    return encodeURIComponent(message)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Simular posição na fila
      const novaPosicao = Math.floor(Math.random() * 500) + 100
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
          segmento: '',
          modulosInteresse: [],
          tamanhoEmpresa: '1-10',
          expectativaUso: '',
          observacoes: ''
        })
      }, 5000)
      
    } catch (error) {
      console.error('Erro ao submeter:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo-kryonix.png"
                alt="KRYONIX Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent">KRYONIX</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Fila de Espera VIP</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="inline-flex h-2 w-2 rounded-full bg-orange-400 animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Lista VIP Aberta</span>
              </div>
              <SimpleLanguageSwitcher className="mr-2" />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm font-medium mb-6">
                <Clock className="w-4 h-4 mr-2" />
                Lançamento: 10 de Fevereiro de 2026
              </div>

              <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-balance">
                <span className="text-gray-900 dark:text-gray-100">Entre na</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Fila de Espera VIP</span>
                <br />
                <span className="text-3xl sm:text-4xl text-gray-700 dark:text-gray-300">KRYONIX</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-balance max-w-3xl mx-auto">
                Seja um dos <strong className="text-green-600">primeiros 1.000 clientes</strong> a revolucionar seu negócio com IA.
                Garantia de <strong>preço especial</strong> e <strong>acesso prioritário</strong>!
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="font-bold text-green-700 dark:text-green-400">🎯 Acesso Prioritário</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Primeiros na fila</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="font-bold text-blue-700 dark:text-blue-400">💰 Preço Especial</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Até 50% de desconto</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="font-bold text-purple-700 dark:text-purple-400">🏆 Setup Gratuito</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Valor R$ 1.497</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    📝 Formulário de Inscrição VIP
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Preencha seus dados para garantir sua vaga na fila de espera
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações Pessoais */}
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

                  {/* Contato e Empresa */}
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
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Nome da sua empresa"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Segmento de Negócio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Segmento de Negócio *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <select
                        name="segmento"
                        value={formData.segmento}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Selecione seu segmento</option>
                        {segmentosNegocio.map(segmento => (
                          <option key={segmento} value={segmento}>{segmento}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tamanho da Empresa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número de Funcionários
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <select
                        name="tamanhoEmpresa"
                        value={formData.tamanhoEmpresa}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {tamanhoEmpresaOptions.map(tamanho => (
                          <option key={tamanho} value={tamanho}>{tamanho} funcionários</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Módulos de Interesse */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Módulos de Interesse (opcional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {modulosDisponiveis.map(modulo => (
                        <label
                          key={modulo}
                          className="flex items-center p-3 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.modulosInteresse.includes(modulo)}
                            onChange={() => handleModuloChange(modulo)}
                            className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {modulo}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Expectativa de Uso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expectativa de Uso
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
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

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Observações (opcional)
                    </label>
                    <textarea
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Conte-nos mais sobre suas necessidades e expectativas..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || submitStatus === 'success'}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : submitStatus === 'success' ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Inscrito com Sucesso!</span>
                        </>
                      ) : submitStatus === 'error' ? (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          <span>Erro - Tente Novamente</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-5 h-5" />
                          <span>Entrar na Fila de Espera VIP</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Success Message */}
                {submitStatus === 'success' && posicaoFila && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                          Bem-vindo à Fila VIP!
                        </h3>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <div className="text-3xl font-bold text-primary-600 mb-2">
                          Posição #{posicaoFila}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Você está entre os primeiros na fila de espera!
                        </p>
                      </div>
                      <p className="text-green-700 dark:text-green-300 mb-4">
                        🎉 Parabéns! Abrimos o WhatsApp com suas informações. Nossa equipe entrará em contato em breve para agendar uma apresentação personalizada.
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Shield className="w-4 h-4" />
                          <span>Preço especial garantido</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span>Acesso prioritário</span>
                        </div>
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
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
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
            <p className="text-gray-400 text-sm mb-4">
              Plataforma SaaS 100% Autônoma por IA
            </p>
            <div className="flex items-center justify-center space-x-6">
              <a
                href="https://wa.me/5517981805327"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>(17) 98180-5327</span>
              </a>
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Voltar ao Site Principal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

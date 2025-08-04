'use client'

import { useState, useEffect } from 'react'
import { 
  Play, 
  MessageCircle, 
  BarChart3, 
  Users, 
  Zap,
  Shield,
  ArrowRight,
  Check
} from 'lucide-react'

export default function InteractiveDemo() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const demos = [
    {
      id: 'whatsapp',
      title: 'WhatsApp Business Automático',
      description: 'Veja como a IA responde clientes automaticamente',
      icon: MessageCircle,
      color: 'bg-green-500',
      features: [
        'Resposta automática em segundos',
        'Qualificação de leads inteligente',
        'Agendamento automático',
        'Integração com CRM'
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics Inteligente',
      description: 'Dashboard que mostra insights em tempo real',
      icon: BarChart3,
      color: 'bg-blue-500',
      features: [
        'Métricas em tempo real',
        'Previsões de vendas',
        'Análise de comportamento',
        'Relatórios automáticos'
      ]
    },
    {
      id: 'automation',
      title: 'Automação Total',
      description: 'Processos que funcionam 24/7 sem intervenção',
      icon: Zap,
      color: 'bg-yellow-500',
      features: [
        'Workflows automáticos',
        'Triggers inteligentes',
        'Integração com 500+ apps',
        'Monitoramento ativo'
      ]
    },
    {
      id: 'security',
      title: 'Segurança Enterprise',
      description: 'Proteção máxima com autenticação biométrica',
      icon: Shield,
      color: 'bg-purple-500',
      features: [
        'Autenticação biométrica',
        'Dados isolados por cliente',
        'Backup automático',
        'Compliance LGPD'
      ]
    }
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 2
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const startDemo = (index: number) => {
    setActiveDemo(index)
    setProgress(0)
    setIsPlaying(true)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
            <Play className="w-4 h-4 mr-2" />
            Demo Interativo
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Veja a <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">KRYONIX</span> em Ação
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore as principais funcionalidades da nossa plataforma através de demonstrações interativas
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Selection */}
          <div className="space-y-4">
            {demos.map((demo, index) => (
              <div
                key={demo.id}
                className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  activeDemo === index
                    ? 'border-primary-500 bg-white dark:bg-gray-800 shadow-xl'
                    : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
                onClick={() => setActiveDemo(index)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg ${demo.color} flex items-center justify-center text-white`}>
                    <demo.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {demo.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {demo.description}
                    </p>
                    <div className="space-y-2">
                      {demo.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {activeDemo === index && (
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          startDemo(index)
                        }}
                        disabled={isPlaying}
                        className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>{isPlaying ? 'Executando...' : 'Testar'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Demo Visualization */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    kryonix.com.br/{demos[activeDemo].id}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="h-96 p-6 flex flex-col justify-center items-center">
                <div className={`w-20 h-20 rounded-2xl ${demos[activeDemo].color} flex items-center justify-center text-white mb-6`}>
                  <demos[activeDemo].icon className="w-10 h-10" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
                  {demos[activeDemo].title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  {demos[activeDemo].description}
                </p>

                {/* Progress Bar */}
                {isPlaying && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-100 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}

                {/* Simulation */}
                <div className="w-full space-y-3">
                  {demos[activeDemo].features.map((feature, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-500 ${
                        isPlaying && progress > (idx + 1) * 25
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isPlaying && progress > (idx + 1) * 25
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {isPlaying && progress > (idx + 1) * 25 ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm transition-colors duration-500 ${
                        isPlaying && progress > (idx + 1) * 25
                          ? 'text-green-700 dark:text-green-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <a
                href="https://wa.me/5517981805327?text=Olá! Vi a demo interativa da KRYONIX e gostaria de saber mais sobre a plataforma."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                Quero Testar a Plataforma Completa
                <ArrowRight className="w-5 h-5 ml-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
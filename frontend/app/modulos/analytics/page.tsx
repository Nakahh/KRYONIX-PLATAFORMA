'use client'

import Link from 'next/link'
import { ArrowLeft, BarChart3, TrendingUp, Target, Zap, CheckCircle, Clock } from 'lucide-react'

export default function AnalyticsModule() {
  const features = [
    'Dashboards interativos em tempo real',
    'Relatórios automáticos personalizados',
    'Análise preditiva com IA',
    'Integração com Google Analytics, Facebook Ads',
    'Métricas de vendas, conversão e ROI',
    'Alertas automáticos de performance'
  ]

  const applications = [
    'Monitoramento de vendas e faturamento',
    'Análise de comportamento do cliente',
    'Otimização de campanhas de marketing',
    'Previsão de demanda e estoque',
    'Identificação de tendências de mercado'
  ]

  const targetBusinesses = [
    'E-commerces e lojas virtuais',
    'Empresas de marketing digital',
    'Consultórios médicos e clínicas',
    'Imobiliárias e corretores',
    'Restaurantes e delivery',
    'Empresas de serviços em geral'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="inline-flex h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Em Desenvolvimento</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mb-8">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Análise Avançada e BI
              </span>
            </h1>
            
            <div className="text-3xl font-bold text-blue-600 mb-4">R$ 99/mês</div>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Transforme dados em decisões inteligentes com nosso módulo de Business Intelligence.
            </p>

            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full font-medium mb-8">
              <Clock className="w-4 h-4 mr-2" />
              Em Desenvolvimento
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Principais Funcionalidades</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Para que pode ser usado</h2>
            
            <div className="grid gap-4">
              {applications.map((application, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Target className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{application}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Target Businesses */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Ideal para estas empresas</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {targetBusinesses.map((business, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{business}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Interessado neste módulo?
            </h2>
            <p className="text-blue-100 mb-8">
              Entre em contato para ser notificado quando este módulo estiver disponível.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5517981805327?text=Olá! Tenho interesse no módulo: Análise Avançada e BI (R$ 99/mês). Gostaria de mais informações."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                </svg>
                Tenho Interesse
              </a>
              
              <Link 
                href="/"
                className="bg-transparent border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                Ver Outros Módulos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

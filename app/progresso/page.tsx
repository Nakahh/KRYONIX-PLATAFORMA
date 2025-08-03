'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  MessageCircle,
  Instagram,
  Mail
} from 'lucide-react'
import MobileMenu from '../components/MobileMenu'
import LoadingScreen from '../components/LoadingScreen'
import ProgressBar from '../components/ProgressBar'
import ThemeToggle from '../components/ThemeToggle'
import { partsData } from '../../lib/data/parts-data'

export default function ProgressoPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLoadingComplete = () => {
    setLoading(false)
  }

  // Estatísticas
  const completed = partsData.filter(p => p.status === 'completed').length
  const inProgress = partsData.filter(p => p.status === 'in_progress').length
  const pending = partsData.filter(p => p.status === 'pending').length

  if (!mounted) {
    return null
  }

  if (loading) {
    return <LoadingScreen onComplete={handleLoadingComplete} duration={1000} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <MobileMenu />
      
      {/* Header */}
      <header className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <Image 
              src="/logo-kryonix.png" 
              alt="KRYONIX" 
              width={32} 
              height={32} 
              className="rounded-lg"
            />
            <span className="text-xl font-bold gradient-text">KRYONIX</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="status-online"></div>
            <span className="text-gray-600 dark:text-gray-400">Online</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4 mr-2" />
            Progresso
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Desenvolvimento <span className="gradient-text">KRYONIX</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Acompanhe o desenvolvimento detalhado de todas as 53 partes da plataforma SaaS 100% autônoma por IA.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <ProgressBar />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{completed}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Concluídas</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{inProgress}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Em Andamento</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{pending}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pendentes</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">53</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Todas as Partes</h2>
                <p className="text-gray-600 dark:text-gray-400">{partsData.length} partes do projeto</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {partsData.map((item) => (
                <Link
                  key={item.part}
                  href={`/partes/${item.slug}`}
                  className="block group"
                >
                  <div className="flex items-start space-x-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-md">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                          : item.status === 'in_progress' 
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}>
                        {item.status === 'completed' && <CheckCircle className="w-6 h-6" />}
                        {item.status === 'in_progress' && <Clock className="w-6 h-6" />}
                        {item.status === 'pending' && <AlertTriangle className="w-6 h-6" />}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          Parte {item.part}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{item.phase}</span>
                          <div className="flex items-center space-x-2">
                            {item.status === 'completed' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Concluída
                              </span>
                            )}
                            {item.status === 'in_progress' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                                <Clock className="w-3 h-3 mr-1" />
                                Em Andamento
                              </span>
                            )}
                            {item.status === 'pending' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Pendente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.simple_description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          {item.technologies.slice(0, 3).map((tech, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300">
                              {tech}
                            </span>
                          ))}
                          {item.technologies.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{item.technologies.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 dark:bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            
            {/* Logo Section - Centered */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Image src="/logo-kryonix.png" alt="KRYONIX" width={48} height={48} className="rounded-lg" />
                <span className="text-2xl font-bold gradient-text">KRYONIX</span>
              </div>
              <p className="text-gray-400 dark:text-gray-500">
                Plataforma SaaS 100% Autônoma por IA
              </p>
            </div>

            {/* Contact Section - Centered */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <div className="flex justify-center space-x-4">
                <a href="https://wa.me/5582988540575" target="_blank" rel="noopener noreferrer" 
                   className="group w-12 h-12 bg-green-50 dark:bg-green-900/20 text-[#25D366] rounded-full flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </a>
                <a href="mailto:vitor@kryonix.com.br" 
                   className="group w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <Mail className="w-6 h-6" />
                </a>
                <a href="https://instagram.com/vitor.dev.br" target="_blank" rel="noopener noreferrer" 
                   className="group w-12 h-12 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* System Status Section - Centered */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status do Sistema</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className="status-online"></div>
                  <span>Desenvolvimento Ativo</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className="status-online"></div>
                  <span>Monitoramento 24/7</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <div className="status-online"></div>
                  <span>Backup Automático</span>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="border-t border-gray-800 dark:border-gray-700 mt-12 pt-8 text-center text-gray-400 dark:text-gray-500">
            <p>© 2025 <span className="gradient-text font-semibold">KRYONIX</span>. Desenvolvido por Vitor Jayme Fernandes Ferreira.</p>
            <p className="text-sm mt-2">🤖 Assistido por 15 Agentes Especializados em IA</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

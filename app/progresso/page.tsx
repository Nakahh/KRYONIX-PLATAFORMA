'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import MobileMenu from '../components/MobileMenu'
import LoadingScreen from '../components/LoadingScreen'
import ProgressBar from '../components/ProgressBar'
import { partsData } from '../../lib/data/parts-data'

export default function ProgressoPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedPhase, setSelectedPhase] = useState('TODAS')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLoadingComplete = () => {
    setLoading(false)
  }



  // Filtrar partes por fase
  const phases = [
    'TODAS',
    'FASE 1: FUNDAÇÃO',
    'FASE 2: INTERFACE E CORE',
    'FASE 3: INTELIGÊNCIA ARTIFICIAL',
    'FASE 4: COMUNICAÇÃO',
    'FASE 5: MÓDULOS ESPECIALIZADOS'
  ]

  const filteredParts = selectedPhase === 'TODAS' 
    ? partsData 
    : partsData.filter(part => part.phase === selectedPhase)

  // Estatísticas
  const completed = partsData.filter(p => p.status === 'completed').length
  const inProgress = partsData.filter(p => p.status === 'in_progress').length
  const pending = partsData.filter(p => p.status === 'pending').length

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-success-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (loading) {
    return <LoadingScreen onComplete={handleLoadingComplete} duration={1000} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <MobileMenu />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Voltar</span>
            </Link>
            <div className="flex items-center space-x-3">
              <Image
                src="/logo-kryonix.png"
                alt="KRYONIX Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <div className="flex items-center space-x-2">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  KRYONIX
                </div>
                <div className="flex items-center space-x-1">
                  <div className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs text-gray-600 hidden sm:block">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-success-100 text-success-700 text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4 mr-2" />
                PROGRESSO COMPLETO - 53 PARTES DETALHADAS
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-balance">
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Progresso</span>
                <br />
                <span className="text-gray-900">Desenvolvimento KRYONIX</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 text-balance max-w-2xl mx-auto">
                Acompanhe o desenvolvimento detalhado de todas as 53 partes da plataforma SaaS 100% autônoma por IA.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <ProgressBar compact={true} showDetails={false} className="max-w-2xl mx-auto" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <div className="text-2xl font-bold text-success-600">{completed}</div>
                <div className="text-sm text-gray-600">Concluídas</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-primary-600">{inProgress}</div>
                <div className="text-sm text-gray-600">Em Andamento</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-yellow-600">{pending}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600">53</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase Filter */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Filtrar por Fase de Desenvolvimento
            </h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {phases.map((phase) => (
                <button
                  key={phase}
                  onClick={() => setSelectedPhase(phase)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedPhase === phase
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {selectedPhase === 'TODAS' ? 'Todas as Partes' : selectedPhase}
              </h2>
              <p className="text-lg text-gray-600">
                {filteredParts.length} parte{filteredParts.length !== 1 ? 's' : ''} {selectedPhase === 'TODAS' ? 'do projeto' : 'desta fase'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredParts.map((item) => (
                <Link
                  key={item.part}
                  href={`/partes/${item.slug}`}
                  className={`card hover:shadow-lg cursor-pointer transition-all duration-300 ${
                    item.status === 'in_progress' ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                        item.status === 'completed' ? 'bg-success-500 text-white' :
                        item.status === 'in_progress' ? 'bg-primary-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {item.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : item.part}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="text-xs text-primary-600 font-medium">{item.phase}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {item.status === 'completed' && (
                        <span className="px-3 py-1 text-xs bg-success-100 text-success-700 rounded-full font-medium">Concluída</span>
                      )}
                      {item.status === 'in_progress' && (
                        <span className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-full font-medium">Em Andamento</span>
                      )}
                      {item.status === 'pending' && (
                        <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-medium">Pendente</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">{item.simple_description}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.technologies.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {item.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          +{item.technologies.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg font-semibold text-gray-700 mb-2">
                53 Partes Técnicas Completas
              </p>
              <p className="text-sm text-gray-500">
                Clique em qualquer parte para ver os detalhes técnicos completos
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src="/logo-kryonix.png"
                    alt="KRYONIX Logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="text-xl font-bold">KRYONIX</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Plataforma SaaS 100% Autônoma por IA
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Contato</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>📧 contato@kryonix.com.br</div>
                  <div>📱 +55 17 98180-5327</div>
                  <div>🌐 www.kryonix.com.br</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Status do Sistema</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="status-online"></div>
                    <span className="text-gray-400">Desenvolvimento Ativo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="status-online"></div>
                    <span className="text-gray-400">Monitoramento 24/7</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="status-online"></div>
                    <span className="text-gray-400">Backup Automático</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 KRYONIX. Desenvolvido por Vitor Jayme Fernandes Ferreira.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                🤖 Assistido por 15 Agentes Especializados em IA
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Sparkles, Code2, Database, Shield, Zap } from 'lucide-react'
import LoadingScreen from '../../components/LoadingScreen'
import ProgressBar from '../../components/ProgressBar'
import { partsData } from '../../../lib/data/parts-data'

interface Part {
  part: number
  title: string
  status: 'completed' | 'in_progress' | 'pending'
  description: string
  slug: string
  phase: string
  technologies: string[]
  features: string[]
  benefits: string[]
  technical_description: string
  simple_description: string
}

export default function PartPage({ params }: { params: { slug: string } }) {
  const [part, setPart] = useState<Part | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    const foundPart = partsData.find(p => p.slug === params.slug)
    setPart(foundPart || null)
  }, [params.slug])

  const handleLoadingComplete = () => {
    setLoading(false)
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return <LoadingScreen onComplete={handleLoadingComplete} duration={1000} />
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Parte não encontrada</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Esta parte não foi encontrada ou ainda não foi implementada.</p>
          <div className="space-x-4">
            <Link href="/progresso" className="btn-primary">Ver Progresso</Link>
            <Link href="/" className="btn-secondary">Voltar</Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />
      case 'in_progress':
        return <Clock className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída'
      case 'in_progress':
        return 'Em Andamento'
      default:
        return 'Pendente'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success-700 dark:text-success-400 bg-success-100 dark:bg-success-900/50'
      case 'in_progress':
        return 'text-primary-700 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50'
      default:
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50'
    }
  }

  // Encontrar partes relacionadas (próxima e anterior)
  const currentIndex = partsData.findIndex(p => p.slug === params.slug)
  const previousPart = currentIndex > 0 ? partsData[currentIndex - 1] : null
  const nextPart = currentIndex < partsData.length - 1 ? partsData[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <header className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/progresso" 
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
          {/* Status Badge */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${getStatusColor(part.status)}`}>
            {getStatusIcon(part.status)}
            <span className="ml-2">{getStatusText(part.status)}</span>
          </div>
          
          {/* Title */}
          <div className="space-y-4">
            <p className="text-primary-600 dark:text-primary-400 font-medium">{part.phase}</p>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
              Parte {part.part}: <span className="gradient-text">{part.title}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {part.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Descrição Técnica</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {part.technical_description}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Em Linguagem Simples</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {part.simple_description}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Principais Funcionalidades</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {part.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Benefícios para Você</h3>
              </div>
              <div className="space-y-3">
                {part.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Navegação entre Partes</h3>
              <div className="flex justify-between space-x-4">
                <div className="flex-1">
                  {previousPart && (
                    <Link href={`/partes/${previousPart.slug}`} className="block group">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                        <div className="text-sm text-gray-500 dark:text-gray-400">← Parte Anterior</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          {previousPart.part}. {previousPart.title}
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
                <div className="flex-1">
                  {nextPart && (
                    <Link href={`/partes/${nextPart.slug}`} className="block group text-right">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Próxima Parte →</div>
                        <div className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                          {nextPart.part}. {nextPart.title}
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Technologies */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tecnologias</h3>
              </div>
              <div className="space-y-2">
                {part.technologies.map((tech, index) => (
                  <span key={index} className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 rounded-full text-sm font-medium mr-2 mb-2">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Status Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Status de Desenvolvimento</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progresso</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {part.status === 'completed' ? '100%' : part.status === 'in_progress' ? '75%' : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      part.status === 'completed' ? 'bg-green-500' : 
                      part.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                    style={{ 
                      width: part.status === 'completed' ? '100%' : 
                             part.status === 'in_progress' ? '75%' : '0%' 
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {part.status === 'completed' && 'Implementação concluída e testada'}
                  {part.status === 'in_progress' && 'Em desenvolvimento ativo'}
                  {part.status === 'pending' && 'Aguardando início do desenvolvimento'}
                </p>
              </div>
            </div>

            {/* Progresso Geral */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <ProgressBar compact />
              <div className="mt-4 text-center">
                <Link href="/progresso" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
                  Ver todas as partes →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Link href="/progresso" className="block w-full btn-primary text-center">
                  Ver Progresso
                </Link>
                <Link href="/" className="block w-full btn-secondary text-center">
                  Voltar
                </Link>
              </div>
            </div>

            {/* Part Info */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações da Parte</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Número:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{part.part} de 53</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fase:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{part.phase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tecnologias:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{part.technologies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Funcionalidades:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{part.features.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

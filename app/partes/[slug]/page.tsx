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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Parte não encontrada</h1>
          <p className="text-gray-600 mb-6">Esta parte não foi encontrada ou ainda não foi implementada.</p>
          <div className="space-y-2">
            <Link href="/progresso" className="btn-primary block">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver Progresso Completo
            </Link>
            <Link href="/" className="btn-secondary block">
              Voltar à Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-success-500" />
      case 'in_progress':
        return <Clock className="w-6 h-6 text-primary-500" />
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />
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
        return 'text-success-700 bg-success-100'
      case 'in_progress':
        return 'text-primary-700 bg-primary-100'
      default:
        return 'text-yellow-700 bg-yellow-100'
    }
  }

  // Encontrar partes relacionadas (próxima e anterior)
  const currentIndex = partsData.findIndex(p => p.slug === params.slug)
  const previousPart = currentIndex > 0 ? partsData[currentIndex - 1] : null
  const nextPart = currentIndex < partsData.length - 1 ? partsData[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/progresso" className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:block">Voltar ao Progresso</span>
              <span className="font-medium sm:hidden">Voltar</span>
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
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(part.status)}`}>
                {getStatusIcon(part.status)}
                <span className="ml-2">{getStatusText(part.status)}</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <div className="text-sm font-medium text-primary-600 mb-2">{part.phase}</div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                <span className="text-primary-600">Parte {part.part}:</span> {part.title}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {part.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Description Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card">
                    <div className="flex items-center mb-4">
                      <Code2 className="w-6 h-6 text-blue-500 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Descrição Técnica</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {part.technical_description}
                    </p>
                  </div>

                  <div className="card">
                    <div className="flex items-center mb-4">
                      <Sparkles className="w-6 h-6 text-green-500 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Em Linguagem Simples</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {part.simple_description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="card">
                  <div className="flex items-center mb-6">
                    <Zap className="w-6 h-6 text-purple-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Principais Funcionalidades</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {part.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="card">
                  <div className="flex items-center mb-6">
                    <Shield className="w-6 h-6 text-emerald-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Benefícios para Você</h3>
                  </div>
                  <div className="space-y-3">
                    {part.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Navegação entre Partes</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {previousPart && (
                      <Link 
                        href={`/partes/${previousPart.slug}`}
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-xs text-gray-500 mb-1">← Parte Anterior</div>
                        <div className="font-medium text-gray-900 text-sm">
                          {previousPart.part}. {previousPart.title}
                        </div>
                      </Link>
                    )}
                    {nextPart && (
                      <Link 
                        href={`/partes/${nextPart.slug}`}
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-right"
                      >
                        <div className="text-xs text-gray-500 mb-1">Próxima Parte →</div>
                        <div className="font-medium text-gray-900 text-sm">
                          {nextPart.part}. {nextPart.title}
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Technologies */}
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Database className="w-5 h-5 text-indigo-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Tecnologias</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {part.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Info */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status de Desenvolvimento</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Progresso</span>
                      <span className="text-sm font-medium text-gray-900">
                        {part.status === 'completed' ? '100%' : part.status === 'in_progress' ? '75%' : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          part.status === 'completed' ? 'bg-success-500' : 
                          part.status === 'in_progress' ? 'bg-primary-500' : 'bg-gray-300'
                        }`}
                        style={{ 
                          width: part.status === 'completed' ? '100%' : part.status === 'in_progress' ? '75%' : '0%' 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {part.status === 'completed' && 'Implementação concluída e testada'}
                      {part.status === 'in_progress' && 'Em desenvolvimento ativo'}
                      {part.status === 'pending' && 'Aguardando início do desenvolvimento'}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                  <div className="space-y-2">
                    <Link 
                      href="/progresso" 
                      className="block w-full text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      Ver Progresso Completo
                    </Link>
                    <Link 
                      href="/" 
                      className="block w-full text-center py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Voltar à Homepage
                    </Link>
                  </div>
                </div>

                {/* Part Info */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Parte</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número:</span>
                      <span className="font-medium">{part.part} de 53</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fase:</span>
                      <span className="font-medium text-xs">{part.phase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tecnologias:</span>
                      <span className="font-medium">{part.technologies.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Funcionalidades:</span>
                      <span className="font-medium">{part.features.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

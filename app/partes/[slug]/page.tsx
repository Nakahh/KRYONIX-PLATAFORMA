'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Sparkles, Code2, Database, Shield, Zap } from 'lucide-react'
import LoadingScreen from '../../components/LoadingScreen'
import ProgressBar from '../../components/ProgressBar'
import ThemeToggle from '../../components/ThemeToggle'
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
  const [clickedIcons, setClickedIcons] = useState({
    whatsapp: false,
    email: false,
    instagram: false
  })

  useEffect(() => {
    setMounted(true)
    const foundPart = partsData.find(p => p.slug === params.slug)
    setPart(foundPart || null)
  }, [params.slug])

  const handleLoadingComplete = () => {
    setLoading(false)
  }

  const handleIconClick = (iconType: 'whatsapp' | 'email' | 'instagram') => {
    setClickedIcons(prev => ({
      ...prev,
      [iconType]: true
    }))

    setTimeout(() => {
      setClickedIcons(prev => ({
        ...prev,
        [iconType]: false
      }))
    }, 200)
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
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="status-online"></div>
              <span className="text-gray-600 dark:text-gray-300">Online</span>
            </div>
            <ThemeToggle />
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
                        <div className="text-sm text-gray-500 dark:text-gray-400">��� Parte Anterior</div>
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


          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            {/* Logo Section - Centered */}
            <div className="text-center">
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
              <p className="text-gray-400 text-sm">
                Plataforma SaaS 100% Autônoma por IA
              </p>
            </div>

            {/* Contact Section - Centered */}
            <div className="text-center">
              <h3 className="font-semibold mb-4 text-white">Contato</h3>
              <div className="flex items-center justify-center space-x-6">
                <a
                  href="https://wa.me/5517981805327?text=Olá! Gostaria de saber mais sobre a plataforma KRYONIX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer relative"
                  title="WhatsApp"
                  onClick={(e) => {
                    handleIconClick('whatsapp')
                  }}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${
                    clickedIcons.whatsapp
                      ? 'bg-[#25D366] text-white scale-110 shadow-xl shadow-green-500/25'
                      : 'bg-green-50 dark:bg-green-900/20 text-[#25D366] dark:text-green-300 group-hover:bg-[#25D366] group-hover:text-white group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-green-500/25'
                  }`}>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                  </div>
                </a>
                <a
                  href="mailto:contato@kryonix.com.br"
                  className="group cursor-pointer relative"
                  title="Email"
                  onClick={(e) => {
                    handleIconClick('email')
                  }}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${
                    clickedIcons.email
                      ? 'bg-blue-500 text-white scale-110 shadow-xl shadow-blue-500/25'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-blue-500/25'
                  }`}>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                </a>
                <a
                  href="https://instagram.com/kryon.ix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group cursor-pointer relative"
                  title="Instagram"
                  onClick={(e) => {
                    handleIconClick('instagram')
                  }}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 transform ${
                    clickedIcons.instagram
                      ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white scale-110 shadow-xl shadow-purple-500/25'
                      : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 text-purple-600 dark:text-purple-300 group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-orange-400 group-hover:text-white group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-purple-500/25'
                  }`}>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            {/* System Status Section - Centered */}
            <div className="text-center">
              <h3 className="font-semibold mb-4 text-white">Status do Sistema</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Desenvolvimento Ativo</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Monitoramento 24/7</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">Backup Automático</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent font-bold">KRYONIX</span>. Desenvolvido por Vitor Jayme Fernandes Ferreira.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              🤖 Assistido por 15 Agentes Especializados em IA
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

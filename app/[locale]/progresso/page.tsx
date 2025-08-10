import { Metadata } from 'next'

// Força geração estática para Builder.io
export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Progresso do Desenvolvimento - KRYONIX',
  description: 'Acompanhe o progresso detalhado das 53 partes do desenvolvimento da plataforma KRYONIX',
  keywords: ['progresso', 'desenvolvimento', 'kryonix', 'saas', 'plataforma', 'automação'],
  openGraph: {
    title: 'Progresso KRYONIX - 53 Partes em Desenvolvimento',
    description: 'Veja o status detalhado de cada módulo da plataforma SaaS mais avançada do Brasil',
    url: 'https://www.kryonix.com.br/pt-br/progresso',
    type: 'website',
    images: ['/logo-kryonix.png']
  }
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  TrendingUp,
  Users,
  Server,
  Database,
  Shield,
  Smartphone,
  BarChart3,
  MessageCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'
import ProgressBar from '../../components/ProgressBar'
import LoadingScreen from '../../components/LoadingScreen'

interface ProjectPart {
  id: number
  title: string
  status: 'completed' | 'in-progress' | 'pending' | 'planned'
  description: string
  category: 'auth' | 'database' | 'storage' | 'cache' | 'proxy' | 'monitoring' | 'messaging' | 'backup' | 'security' | 'gateway' | 'frontend' | 'dashboard' | 'users' | 'permissions' | 'config' | 'notifications' | 'logs' | 'analytics' | 'documents' | 'performance' | 'mobile' | 'ai' | 'automation' | 'apis' | 'whatsapp' | 'crm' | 'marketing' | 'deployment'
  progress: number
  estimatedCompletion?: string
  dependencies?: number[]
  technologies: string[]
}

const projectParts: ProjectPart[] = [
  {
    id: 1,
    title: 'Autenticação Multi-Tenant Keycloak',
    status: 'completed',
    description: 'Sistema completo de autenticação com Keycloak, suporte biométrico e WhatsApp OTP',
    category: 'auth',
    progress: 100,
    technologies: ['Keycloak', 'JWT', 'Biometric Auth', 'WhatsApp OTP', 'Multi-Tenant']
  },
  {
    id: 2,
    title: 'PostgreSQL Multi-Tenant',
    status: 'completed',
    description: 'Database isolado por cliente com backup automático e otimização por IA',
    category: 'database',
    progress: 100,
    technologies: ['PostgreSQL', 'Multi-Tenant', 'Auto Backup', 'AI Optimization']
  },
  {
    id: 3,
    title: 'MinIO Storage Distribuído',
    status: 'in-progress',
    description: 'Armazenamento de arquivos distribuído com CDN integration',
    category: 'storage',
    progress: 75,
    estimatedCompletion: '2025-02-15',
    technologies: ['MinIO', 'CDN', 'File Upload', 'Distributed Storage']
  },
  {
    id: 4,
    title: 'Redis Cache Enterprise',
    status: 'in-progress',
    description: 'Sistema de cache distribuído com Redis Cluster',
    category: 'cache',
    progress: 60,
    estimatedCompletion: '2025-02-20',
    dependencies: [2],
    technologies: ['Redis', 'Cache', 'Performance', 'Cluster']
  },
  {
    id: 5,
    title: 'Traefik Proxy Enterprise',
    status: 'pending',
    description: 'Load balancer e proxy reverso com SSL automático',
    category: 'proxy',
    progress: 30,
    estimatedCompletion: '2025-02-25',
    dependencies: [3, 4],
    technologies: ['Traefik', 'SSL', 'Load Balancer', 'Proxy']
  },
  {
    id: 6,
    title: 'Monitoramento 24/7',
    status: 'pending',
    description: 'Sistema completo de monitoramento com Grafana e Prometheus',
    category: 'monitoring',
    progress: 20,
    estimatedCompletion: '2025-03-01',
    dependencies: [5],
    technologies: ['Grafana', 'Prometheus', 'AlertManager', '24/7']
  },
  {
    id: 11,
    title: 'Interface Principal Next.js',
    status: 'completed',
    description: 'Frontend responsivo com Next.js 14 e internacionalização',
    category: 'frontend',
    progress: 95,
    technologies: ['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'i18n']
  },
  {
    id: 36,
    title: 'Evolution API WhatsApp',
    status: 'in-progress',
    description: 'Integração completa com WhatsApp Business via Evolution API',
    category: 'whatsapp',
    progress: 80,
    estimatedCompletion: '2025-02-10',
    technologies: ['Evolution API', 'WhatsApp Business', 'Webhooks', 'Multi-Instance']
  },
  {
    id: 37,
    title: 'Chatwoot Atendimento',
    status: 'pending',
    description: 'Sistema de atendimento omnichannel com IA',
    category: 'crm',
    progress: 25,
    estimatedCompletion: '2025-02-28',
    dependencies: [36],
    technologies: ['Chatwoot', 'Omnichannel', 'AI Support', 'Multi-Agent']
  },
  {
    id: 45,
    title: 'Agendamento Inteligente + Cobrança',
    status: 'planned',
    description: 'Sistema automatizado de agendamento com cobrança por IA',
    category: 'crm',
    progress: 10,
    estimatedCompletion: '2025-03-15',
    dependencies: [37],
    technologies: ['AI Scheduling', 'Auto Billing', 'Calendar Sync', 'Smart Reminders']
  },
  {
    id: 50,
    title: 'Go-Live e Suporte Final',
    status: 'planned',
    description: 'Deploy em produção com monitoramento completo',
    category: 'deployment',
    progress: 5,
    estimatedCompletion: '2025-04-01',
    dependencies: [1, 2, 3, 4, 5, 6, 11, 36, 37, 45],
    technologies: ['Production Deploy', 'Monitoring', 'Support System', 'Go-Live']
  }
]

const categoryIcons = {
  auth: Shield,
  database: Database,
  storage: Server,
  cache: BarChart3,
  proxy: Server,
  monitoring: TrendingUp,
  frontend: Smartphone,
  whatsapp: MessageCircle,
  crm: Users,
  deployment: CheckCircle
}

const categoryColors = {
  auth: 'text-blue-600 bg-blue-50',
  database: 'text-green-600 bg-green-50',
  storage: 'text-purple-600 bg-purple-50',
  cache: 'text-orange-600 bg-orange-50',
  proxy: 'text-red-600 bg-red-50',
  monitoring: 'text-indigo-600 bg-indigo-50',
  frontend: 'text-pink-600 bg-pink-50',
  whatsapp: 'text-green-600 bg-green-50',
  crm: 'text-blue-600 bg-blue-50',
  deployment: 'text-gray-600 bg-gray-50'
}

const statusColors = {
  completed: 'text-green-600 bg-green-100',
  'in-progress': 'text-blue-600 bg-blue-100',
  pending: 'text-orange-600 bg-orange-100',
  planned: 'text-gray-600 bg-gray-100'
}

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (!mounted) return null
  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} duration={1000} />

  const completedParts = projectParts.filter(part => part.status === 'completed')
  const inProgressParts = projectParts.filter(part => part.status === 'in-progress')
  const overallProgress = Math.round(
    projectParts.reduce((sum, part) => sum + part.progress, 0) / projectParts.length
  )

  const filteredParts = selectedCategory 
    ? projectParts.filter(part => part.category === selectedCategory)
    : projectParts

  const categories = Array.from(new Set(projectParts.map(part => part.category)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/pt-br" 
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Progresso do Projeto
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Acompanhe o desenvolvimento das 53 partes do KRYONIX
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{overallProgress}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Concluído</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overall Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Progresso Geral
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {completedParts.length} de {projectParts.length} partes concluídas
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-600 mb-1">{overallProgress}%</div>
              <div className="text-sm text-gray-500">
                {inProgressParts.length} em desenvolvimento
              </div>
            </div>
          </div>
          
          <ProgressBar className="mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{completedParts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Concluídas</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{inProgressParts.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Em Desenvolvimento</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {projectParts.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Pendentes</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-4 text-center">
              <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-600">53</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total de Partes</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Filtrar por Categoria
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todas
            </button>
            {categories.map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons] || Server
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category}
                </button>
              )
            })}
          </div>
        </div>

        {/* Project Parts List */}
        <div className="space-y-6">
          {filteredParts.map((part) => {
            const Icon = categoryIcons[part.category as keyof typeof categoryIcons] || Server
            const categoryColor = categoryColors[part.category as keyof typeof categoryColors] || 'text-gray-600 bg-gray-50'
            const statusColor = statusColors[part.status]
            
            return (
              <div
                key={part.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${categoryColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Parte {part.id}: {part.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {part.status === 'completed' && 'Concluída'}
                          {part.status === 'in-progress' && 'Em Desenvolvimento'}
                          {part.status === 'pending' && 'Pendente'}
                          {part.status === 'planned' && 'Planejada'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {part.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {part.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {part.progress}%
                    </div>
                    {part.estimatedCompletion && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {part.estimatedCompletion}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${part.progress}%` }}
                  ></div>
                </div>

                {/* Dependencies */}
                {part.dependencies && part.dependencies.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Dependências:</strong> Partes {part.dependencies.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Next Milestone */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mt-8 text-white">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Próximo Marco</h3>
            <p className="text-lg opacity-90 mb-6">
              MinIO Storage Distribuído - Conclusão prevista para 15 de Fevereiro de 2025
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/pt-br"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                Voltar ao Início
              </Link>
              <a
                href="https://wa.me/5517981805327?text=Gostaria%20de%20acompanhar%20o%20progresso%20do%20projeto%20KRYONIX"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Acompanhar Desenvolvimento
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

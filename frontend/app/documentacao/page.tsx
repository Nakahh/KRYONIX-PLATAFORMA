'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Book,
  Code,
  Zap,
  Database,
  Shield,
  Globe,
  Smartphone,
  Bot,
  Search,
  ChevronRight,
  ExternalLink,
  Download,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function Documentacao() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('geral')

  const categories = [
    { id: 'geral', name: 'Visão Geral', icon: Book },
    { id: 'api', name: 'APIs & SDKs', icon: Code },
    { id: 'integracao', name: 'Integrações', icon: Zap },
    { id: 'banco', name: 'Banco de Dados', icon: Database },
    { id: 'seguranca', name: 'Segurança', icon: Shield },
    { id: 'deploy', name: 'Deploy & Hosting', icon: Globe },
    { id: 'mobile', name: 'Mobile & PWA', icon: Smartphone },
    { id: 'ia', name: 'Inteligência Artificial', icon: Bot }
  ]

  const documentos = [
    {
      id: 1,
      category: 'geral',
      title: 'Introdução ao KRYONIX',
      description: 'Visão geral da plataforma e seus principais recursos',
      status: 'completed',
      readTime: '10 min',
      link: '/docs/introducao'
    },
    {
      id: 2,
      category: 'geral',
      title: 'Arquitetura do Sistema',
      description: 'Entenda como funciona a arquitetura multi-tenant',
      status: 'completed',
      readTime: '15 min',
      link: '/docs/arquitetura'
    },
    {
      id: 3,
      category: 'api',
      title: 'Autenticação API',
      description: 'Como autenticar nas APIs usando JWT e OAuth 2.0',
      status: 'completed',
      readTime: '8 min',
      link: '/docs/auth-api'
    },
    {
      id: 4,
      category: 'api',
      title: 'WhatsApp Business API',
      description: 'Integração completa com Evolution API para WhatsApp',
      status: 'in_progress',
      readTime: '12 min',
      link: '/docs/whatsapp-api'
    },
    {
      id: 5,
      category: 'integracao',
      title: 'Webhooks',
      description: 'Configure webhooks para receber eventos em tempo real',
      status: 'completed',
      readTime: '6 min',
      link: '/docs/webhooks'
    },
    {
      id: 6,
      category: 'integracao',
      title: 'Zapier Integration',
      description: 'Conecte com milhares de aplicativos via Zapier',
      status: 'pending',
      readTime: '10 min',
      link: '/docs/zapier'
    },
    {
      id: 7,
      category: 'banco',
      title: 'Schema do Banco',
      description: 'Estrutura completa do banco de dados PostgreSQL',
      status: 'completed',
      readTime: '20 min',
      link: '/docs/database-schema'
    },
    {
      id: 8,
      category: 'banco',
      title: 'Backup e Restore',
      description: 'Sistema automático de backup e recuperação',
      status: 'completed',
      readTime: '8 min',
      link: '/docs/backup'
    },
    {
      id: 9,
      category: 'seguranca',
      title: 'Autenticação Multi-fator',
      description: 'Implementar 2FA com WhatsApp e biometria',
      status: 'completed',
      readTime: '12 min',
      link: '/docs/2fa'
    },
    {
      id: 10,
      category: 'deploy',
      title: 'Deploy com Docker',
      description: 'Guia completo para deploy usando containers',
      status: 'completed',
      readTime: '18 min',
      link: '/docs/docker-deploy'
    },
    {
      id: 11,
      category: 'mobile',
      title: 'Progressive Web App',
      description: 'Configuração do PWA para instalação mobile',
      status: 'in_progress',
      readTime: '14 min',
      link: '/docs/pwa'
    },
    {
      id: 12,
      category: 'ia',
      title: 'Configuração IA',
      description: 'Setup do Ollama e Dify AI para automação',
      status: 'pending',
      readTime: '25 min',
      link: '/docs/ai-setup'
    }
  ]

  const filteredDocs = documentos.filter(doc => 
    (activeCategory === 'geral' || doc.category === activeCategory) &&
    (searchTerm === '' || doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Disponível'
      case 'in_progress':
        return 'Em andamento'
      case 'pending':
        return 'Em breve'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documentação</h1>
                <p className="text-gray-600 dark:text-gray-400">Guias, tutoriais e referências técnicas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            {/* Search */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar documentação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Categories */}
            <nav className="space-y-2">
              <button
                onClick={() => setActiveCategory('geral')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeCategory === 'geral'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Book className="w-4 h-4" />
                <span className="text-sm font-medium">Todos</span>
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {searchTerm && (
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredDocs.length} resultado(s) para "{searchTerm}"
              </p>
            </div>
          )}

          {/* Quick Start */}
          {activeCategory === 'geral' && !searchTerm && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Início Rápido</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <Book className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">Primeiros Passos</h3>
                  <p className="text-blue-100 text-sm mb-4">Configure sua conta e entenda os conceitos básicos</p>
                  <Link href="/docs/getting-started" className="inline-flex items-center text-sm font-medium">
                    Começar <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <Code className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">API Reference</h3>
                  <p className="text-green-100 text-sm mb-4">Documentação completa das APIs REST</p>
                  <Link href="/docs/api-reference" className="inline-flex items-center text-sm font-medium">
                    Ver APIs <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <Zap className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">Integrações</h3>
                  <p className="text-purple-100 text-sm mb-4">Conecte com WhatsApp, Zapier e muito mais</p>
                  <Link href="/docs/integrations" className="inline-flex items-center text-sm font-medium">
                    Integrar <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Documents List */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {activeCategory === 'geral' ? 'Toda Documentação' : categories.find(c => c.id === activeCategory)?.name}
            </h2>

            <div className="space-y-4">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {doc.title}
                        </h3>
                        {getStatusIcon(doc.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'completed' ? 'bg-green-100 text-green-700' :
                          doc.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getStatusText(doc.status)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {doc.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{doc.readTime}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      {doc.status === 'completed' ? (
                        <Link
                          href={doc.link}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <span>Ler</span>
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      ) : (
                        <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed">
                          <span>Em breve</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDocs.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tente ajustar sua pesquisa ou navegar pelas categorias.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Precisa de Ajuda?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Não encontrou o que procurava? Nossa equipe está pronta para ajudar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contato"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Entrar em Contato
                </Link>
                <a
                  href="https://wa.me/5517981805327?text=Olá! Preciso de ajuda com a documentação do KRYONIX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  WhatsApp Suporte
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

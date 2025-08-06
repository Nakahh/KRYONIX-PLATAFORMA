'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  Building,
  Mail,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react'

interface WaitlistEntry {
  id: string
  nome: string
  email: string
  telefone: string
  empresa: string
  segmento: string
  cargo: string
  posicaoFila: number
  modulosInteresse: string[]
  tamanhoEmpresa: string
  expectativaUso: string
  mensagem: string
  createdAt: string
  status: 'ativo' | 'contatado' | 'convertido' | 'inativo'
}

export default function WaitlistPage() {
  const [mounted, setMounted] = useState(false)
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSegment, setFilterSegment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null)
  const entriesPerPage = 10

  useEffect(() => {
    setMounted(true)
    loadWaitlistEntries()
  }, [])

  const loadWaitlistEntries = async () => {
    setLoading(true)
    try {
      // Simular carregamento de dados
      setTimeout(() => {
        const mockEntries: WaitlistEntry[] = [
          {
            id: '1',
            nome: 'João Silva',
            email: 'joao@empresa.com',
            telefone: '(11) 99999-9999',
            empresa: 'Silva & Associados',
            segmento: 'Advocacia e Direito',
            cargo: 'Advogado Sócio',
            posicaoFila: 456,
            modulosInteresse: ['CRM Inteligente', 'WhatsApp Business'],
            tamanhoEmpresa: '11-50',
            expectativaUso: 'Próximos 30 dias',
            mensagem: 'Preciso automatizar o atendimento ao cliente urgentemente.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ativo'
          },
          {
            id: '2',
            nome: 'Maria Santos',
            email: 'maria@clinica.com.br',
            telefone: '(21) 88888-8888',
            empresa: 'Clínica Vida & Saúde',
            segmento: 'Medicina e Saúde',
            cargo: 'Diretora',
            posicaoFila: 123,
            modulosInteresse: ['Agendamento Inteligente', 'Portal Cliente'],
            tamanhoEmpresa: '51-200',
            expectativaUso: 'Imediatamente (tenho urgência)',
            mensagem: 'Nossa clínica está crescendo e precisamos de uma solução completa.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'contatado'
          },
          {
            id: '3',
            nome: 'Carlos Oliveira',
            email: 'carlos@imobiliaria.com',
            telefone: '(31) 77777-7777',
            empresa: 'Oliveira Imóveis',
            segmento: 'Imobiliário',
            cargo: 'CEO',
            posicaoFila: 789,
            modulosInteresse: ['CRM Inteligente', 'Email Marketing'],
            tamanhoEmpresa: '1-10',
            expectativaUso: 'Próximos 90 dias',
            mensagem: '',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ativo'
          }
        ]
        setEntries(mockEntries)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar lista de espera:', error)
      setLoading(false)
    }
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.empresa.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSegment = !filterSegment || entry.segmento === filterSegment
    const matchesStatus = !filterStatus || entry.status === filterStatus
    
    return matchesSearch && matchesSegment && matchesStatus
  })

  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + entriesPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'contatado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'convertido': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'inativo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'contatado': return 'Contatado'
      case 'convertido': return 'Convertido'
      case 'inativo': return 'Inativo'
      default: return status
    }
  }

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Empresa', 'Segmento', 'Cargo', 'Posição', 'Data']
    const csvData = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.nome,
        entry.email,
        entry.telefone,
        entry.empresa,
        entry.segmento,
        entry.cargo,
        entry.posicaoFila,
        new Date(entry.createdAt).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lista-espera-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!mounted) {
    return null
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Lista de Espera
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gerencie os interessados na plataforma KRYONIX
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Inscritos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {entries.length.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Hoje</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">23</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Phone className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Contatados</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">156</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Convertidos</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">42</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os segmentos</option>
                <option value="Medicina e Saúde">Medicina e Saúde</option>
                <option value="Advocacia e Direito">Advocacia e Direito</option>
                <option value="Imobiliário">Imobiliário</option>
                <option value="E-commerce e Varejo">E-commerce e Varejo</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="contatado">Contatado</option>
                <option value="convertido">Convertido</option>
                <option value="inativo">Inativo</option>
              </select>

              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nome/Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Segmento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{entry.posicaoFila}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entry.nome}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.empresa} • {entry.cargo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        <div className="flex items-center mb-1">
                          <Mail className="w-3 h-3 mr-1 text-gray-400" />
                          {entry.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          {entry.telefone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {entry.segmento}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                        {getStatusLabel(entry.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedEntry(entry)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/${entry.telefone.replace(/\D/g, '')}?text=Olá ${entry.nome}! Sobre sua inscrição na fila de espera KRYONIX...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          title="Contatar via WhatsApp"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {startIndex + 1} a {Math.min(startIndex + entriesPerPage, filteredEntries.length)} de {filteredEntries.length} resultados
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detalhes da Inscrição
                </h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações básicas */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Nome</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.nome}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.telefone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Cargo</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.cargo}</p>
                    </div>
                  </div>
                </div>

                {/* Informações da empresa */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Informações da Empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Empresa</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.empresa}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Segmento</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.segmento}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Tamanho</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.tamanhoEmpresa} funcionários</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Expectativa</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedEntry.expectativaUso || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                {/* Módulos de interesse */}
                {selectedEntry.modulosInteresse.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Módulos de Interesse
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.modulosInteresse.map((modulo) => (
                        <span
                          key={modulo}
                          className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full"
                        >
                          {modulo}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensagem */}
                {selectedEntry.mensagem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Mensagem
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {selectedEntry.mensagem}
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Fechar
                  </button>
                  <a
                    href={`https://wa.me/${selectedEntry.telefone.replace(/\D/g, '')}?text=Olá ${selectedEntry.nome}! Sobre sua inscrição na fila de espera KRYONIX...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Contatar via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { ArrowLeft, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import MobileMenu from '../components/MobileMenu'

export default function ProgressoPage() {
  const allParts = [
    { part: 1, title: 'Autenticação Keycloak', status: 'completed', description: 'Sistema multi-tenant com biometria e WhatsApp OTP' },
    { part: 2, title: 'Base de Dados PostgreSQL', status: 'in_progress', description: 'Database isolado por cliente com backup automático' },
    { part: 3, title: 'Storage MinIO', status: 'pending', description: 'Armazenamento de arquivos distribuído' },
    { part: 4, title: 'Cache Redis', status: 'pending', description: 'Cache distribuído para performance' },
    { part: 5, title: 'Proxy Traefik', status: 'pending', description: 'Balanceamento e SSL automático' },
    { part: 6, title: 'Monitoramento', status: 'pending', description: 'Grafana + Prometheus' },
    { part: 7, title: 'Evolution API', status: 'pending', description: 'WhatsApp Business' },
    { part: 8, title: 'Chatwoot', status: 'pending', description: 'Atendimento omnichannel' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileMenu />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Progresso do Desenvolvimento</h1>
              <p className="text-gray-600">Acompanhe o desenvolvimento das 50 partes do projeto KRYONIX</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Overview */}
      <section className="py-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-600">1</div>
              <div className="text-sm text-gray-600">Concluídas</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-600">1</div>
              <div className="text-sm text-gray-600">Em Andamento</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-yellow-600">6</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-purple-600">42</div>
              <div className="text-sm text-gray-600">Futuras</div>
            </div>
          </div>

          {/* Detailed Progress */}
          <div className="space-y-4">
            {allParts.map((item) => (
              <div key={item.part} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.status === 'completed' ? 'bg-green-500 text-white' :
                      item.status === 'in_progress' ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {item.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : item.part}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div>
                    {item.status === 'completed' && (
                      <span className="badge-success">Concluída</span>
                    )}
                    {item.status === 'in_progress' && (
                      <span className="badge-info">Em Andamento</span>
                    )}
                    {item.status === 'pending' && (
                      <span className="badge-warning">Pendente</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500">... e mais 42 partes em planejamento</p>
            <Link href="/" className="btn-primary mt-4 inline-flex">
              Voltar ao Início
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

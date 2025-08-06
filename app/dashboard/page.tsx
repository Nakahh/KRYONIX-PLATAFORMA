'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  BarChart3,
  Activity,
  TrendingUp,
  Eye,
  MessageCircle,
  Globe,
  Database,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Download,
  RefreshCw,
  FileText
} from 'lucide-react'

// Componente de Métricas
const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon 
}: {
  title: string
  value: string
  change: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: any
}) => {
  const changeColor = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
        <div className="text-sm">
          <span className={`font-medium ${changeColor[changeType]}`}>
            {change}
          </span>
          <span className="text-gray-500 dark:text-gray-400"> desde ontem</span>
        </div>
      </div>
    </div>
  )
}

// Componente de Status do Sistema
const SystemStatusCard = () => {
  const [status, setStatus] = useState({
    database: 'online',
    api: 'online',
    evolution: 'online',
    monitoring: 'online'
  })

  const services = [
    { name: 'Banco de Dados', key: 'database', icon: Database },
    { name: 'API Principal', key: 'api', icon: Zap },
    { name: 'Evolution API', key: 'evolution', icon: MessageCircle },
    { name: 'Monitoramento', key: 'monitoring', icon: Activity },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 dark:text-green-400'
      case 'offline': return 'text-red-600 dark:text-red-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />
      case 'offline': return <WifiOff className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
          Status do Sistema
        </h3>
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.key} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <service.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {service.name}
                </span>
              </div>
              <div className={`flex items-center space-x-1 ${getStatusColor(status[service.key as keyof typeof status])}`}>
                {getStatusIcon(status[service.key as keyof typeof status])}
                <span className="text-sm font-medium capitalize">
                  {status[service.key as keyof typeof status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente de Atividades Recentes
const RecentActivitiesCard = () => {
  const activities = [
    {
      id: 1,
      action: 'Nova submissão na lista de espera',
      user: 'João Silva',
      time: '2 min atrás',
      type: 'waitlist'
    },
    {
      id: 2,
      action: 'Login administrativo realizado',
      user: 'Admin',
      time: '5 min atrás',
      type: 'auth'
    },
    {
      id: 3,
      action: 'Backup automático concluído',
      user: 'Sistema',
      time: '1 hora atrás',
      type: 'system'
    },
    {
      id: 4,
      action: 'Nova parceria empresarial',
      user: 'Maria Santos',
      time: '2 horas atrás',
      type: 'partnership'
    }
  ]

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'waitlist': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'auth': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'system': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      case 'partnership': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
          Atividades Recentes
        </h3>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {activity.action}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.user}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                {activity.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    waitlistTotal: 0,
    todaySubmissions: 0,
    activeUsers: 0,
    systemUptime: '99.9%'
  })

  useEffect(() => {
    setMounted(true)
    
    // Simular carregamento de dados
    setTimeout(() => {
      setStats({
        waitlistTotal: 1247,
        todaySubmissions: 23,
        activeUsers: 18,
        systemUptime: '99.9%'
      })
    }, 1000)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Visão geral da plataforma KRYONIX
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Total na Lista de Espera"
          value={stats.waitlistTotal.toLocaleString()}
          change="+12%"
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Submissões Hoje"
          value={stats.todaySubmissions.toString()}
          change="+8%"
          changeType="positive"
          icon={TrendingUp}
        />
        <MetricCard
          title="Usuários Ativos"
          value={stats.activeUsers.toString()}
          change="+5%"
          changeType="positive"
          icon={Eye}
        />
        <MetricCard
          title="Uptime do Sistema"
          value={stats.systemUptime}
          change="Estável"
          changeType="neutral"
          icon={Activity}
        />
      </div>

      {/* Gráficos e Status */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 mb-8">
        {/* Gráfico de Submissões (placeholder) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Submissões dos Últimos 7 Dias
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Gráfico será implementado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status do Sistema */}
        <SystemStatusCard />
      </div>

      {/* Atividades Recentes e Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RecentActivitiesCard />
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Ações Rápidas
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Exportar Lista de Espera
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Gerar Relatório Analytics
                  </span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Backup Manual
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

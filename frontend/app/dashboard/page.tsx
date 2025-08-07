'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BarChart3, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Activity,
  Bell,
  Settings,
  Calendar,
  FileText,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus
} from 'lucide-react'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [activeMetric, setActiveMetric] = useState('vendas')

  useEffect(() => {
    setMounted(true)
  }, [])

  const metrics = [
    {
      id: 'vendas',
      title: 'Vendas do Mês',
      value: 'R$ 45.280',
      change: '+12%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'leads',
      title: 'Novos Leads',
      value: '234',
      change: '+18%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'conversao',
      title: 'Taxa de Conversão',
      value: '8.4%',
      change: '+2.1%',
      trend: 'up',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 'whatsapp',
      title: 'Msgs WhatsApp',
      value: '1.247',
      change: '+25%',
      trend: 'up',
      icon: MessageCircle,
      color: 'green'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'lead',
      title: 'Novo lead qualificado',
      description: 'João Silva - Interesse em consultoria',
      time: '5 min atrás',
      icon: Users,
      color: 'blue'
    },
    {
      id: 2,
      type: 'sale',
      title: 'Venda confirmada',
      description: 'Plano Premium - R$ 299',
      time: '12 min atrás',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 3,
      type: 'message',
      title: 'Mensagem WhatsApp',
      description: 'Cliente perguntou sobre prazo',
      time: '18 min atrás',
      icon: MessageCircle,
      color: 'yellow'
    },
    {
      id: 4,
      type: 'alert',
      title: 'Meta atingida',
      description: 'Vendas mensais alcançaram 110%',
      time: '1h atrás',
      icon: TrendingUp,
      color: 'purple'
    }
  ]

  const modules = [
    {
      name: 'CRM & Vendas',
      description: 'Gerir leads e pipeline',
      icon: Users,
      href: '/modulos/crm',
      status: 'active',
      color: 'blue'
    },
    {
      name: 'WhatsApp Business',
      description: 'Central de mensagens',
      icon: MessageCircle,
      href: '/modulos/whatsapp',
      status: 'active',
      color: 'green'
    },
    {
      name: 'Analytics & BI',
      description: 'Relatórios inteligentes',
      icon: BarChart3,
      href: '/modulos/analytics',
      status: 'soon',
      color: 'purple'
    },
    {
      name: 'Email Marketing',
      description: 'Campanhas automáticas',
      icon: FileText,
      href: '/modulos/email-marketing',
      status: 'soon',
      color: 'orange'
    },
    {
      name: 'Agendamento',
      description: 'Agenda inteligente',
      icon: Calendar,
      href: '/modulos/agendamento',
      status: 'soon',
      color: 'pink'
    },
    {
      name: 'Automação',
      description: 'Workflows automáticos',
      icon: Zap,
      href: '/modulos/automacao',
      status: 'soon',
      color: 'indigo'
    }
  ]

  const pendingTasks = [
    {
      id: 1,
      title: 'Ligar para João Silva',
      description: 'Follow-up da proposta enviada',
      priority: 'high',
      dueTime: '14:30'
    },
    {
      id: 2,
      title: 'Enviar relatório mensal',
      description: 'Para cliente Premium Corp',
      priority: 'medium',
      dueTime: '16:00'
    },
    {
      id: 3,
      title: 'Revisar campanhas',
      description: 'Otimizar anúncios Facebook',
      priority: 'low',
      dueTime: '18:00'
    }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Bem-vindo de volta!</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <Link 
                href="/configuracoes"
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Settings className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <div 
              key={metric.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => setActiveMetric(metric.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20 flex items-center justify-center`}>
                  <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  metric.trend === 'up' 
                    ? 'text-green-700 bg-green-100 dark:bg-green-900/20' 
                    : 'text-red-700 bg-red-100 dark:bg-red-900/20'
                }`}>
                  {metric.change}
                </span>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {metric.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {metric.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Modules Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Módulos Disponíveis</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {modules.map((module, index) => (
                  <Link
                    key={index}
                    href={module.href}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-${module.color}-100 dark:bg-${module.color}-900/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <module.icon className={`w-5 h-5 text-${module.color}-600`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {module.name}
                          </h3>
                          {module.status === 'soon' && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                              Em breve
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Atividades Recentes</h2>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                    <div className={`w-8 h-8 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900/20 flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className={`w-4 h-4 text-${activity.color}-600`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {activity.title}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        {activity.description}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Ações Rápidas</h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">Adicionar Lead</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">Enviar WhatsApp</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors group">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">Ver Relatórios</span>
                </button>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Tarefas Pendentes</h2>
              
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {task.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {task.dueTime}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {task.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Status do Sistema</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">WhatsApp API</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-sm">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-600 text-sm">Conectado</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">IA Assistant</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-600 text-sm">Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

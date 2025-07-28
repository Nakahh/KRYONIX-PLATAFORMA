import React, { useState } from 'react';
import { BarChart3, Calendar, MessageSquare, Users, TrendingUp, Activity } from 'lucide-react';

const Dashboard = () => {
  const [selectedModule, setSelectedModule] = useState('analytics');

  const modules = [
    { id: 'analytics', name: 'Análise Avançada', icon: BarChart3, active: true },
    { id: 'scheduling', name: 'Agendamento IA', icon: Calendar, active: true },
    { id: 'chat', name: 'Atendimento', icon: MessageSquare, active: true },
    { id: 'crm', name: 'CRM & Vendas', icon: Users, active: false },
  ];

  const stats = [
    { label: 'Receita Total', value: 'R$ 127.350', change: '+18.5%', trend: 'up' },
    { label: 'Conversões', value: '89', change: '+12.3%', trend: 'up' },
    { label: 'Taxa Conversão', value: '24.6%', change: '+3.2%', trend: 'up' },
    { label: 'CAC Médio', value: 'R$ 45', change: '-12.3%', trend: 'down' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard KRYONIX</h1>
          <p className="text-gray-600">Visão geral dos seus módulos SaaS ativos</p>
        </div>

        {/* Module Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`
                    flex items-center px-4 py-2 rounded-lg border transition-colors
                    ${selectedModule === module.id 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : module.active
                      ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }
                  `}
                  disabled={!module.active}
                >
                  <IconComponent className="h-5 w-5 mr-2" />
                  {module.name}
                  {!module.active && (
                    <span className="ml-2 text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">
                      Inativo
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className={`h-4 w-4 mr-1 ${stat.trend === 'down' ? 'transform rotate-180' : ''}`} />
                  <span className="text-sm font-semibold">{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analytics Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Análise de Performance - Últimos 30 dias
            </h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de analytics seria exibido aqui</p>
                <p className="text-sm text-gray-400">Integração com Metabase + IA</p>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🤖 Insights da IA
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900">🔥 Lead Quente Detectado</h4>
                <p className="text-sm text-blue-800 mt-1">
                  João Silva mostrou 89% probabilidade de conversão. 
                  IA recomenda: contato hoje antes das 17h.
                </p>
                <button className="mt-2 text-blue-600 hover:text-blue-800 font-semibold text-sm">
                  Executar ação →
                </button>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900">💰 Oportunidade Upsell</h4>
                <p className="text-sm text-green-800 mt-1">
                  Cliente Maria Santos tem perfil para módulo premium. 
                  ROI estimado: +R$ 2.400/mês.
                </p>
                <button className="mt-2 text-green-600 hover:text-green-800 font-semibold text-sm">
                  Criar proposta →
                </button>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900">⚠️ Alerta Churn</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  3 clientes com risco de cancelamento. 
                  IA sugere: campanha retenção automática.
                </p>
                <button className="mt-2 text-yellow-600 hover:text-yellow-800 font-semibold text-sm">
                  Aplicar estratégia →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Atividade Recente (IA Autônoma)
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <strong>IA Atendimento:</strong> Respondeu 12 conversas automaticamente
                </p>
                <p className="text-xs text-gray-500">há 5 minutos</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <strong>IA Agendamento:</strong> Otimizou 8 horários e enviou lembretes
                </p>
                <p className="text-xs text-gray-500">há 15 minutos</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <strong>IA Analytics:</strong> Gerou relatório preditivo de vendas
                </p>
                <p className="text-xs text-gray-500">há 30 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

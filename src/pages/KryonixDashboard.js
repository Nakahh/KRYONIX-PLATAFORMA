import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MessageCircle, 
  Users, 
  TrendingUp,
  Bell,
  Brain,
  Activity,
  Zap,
  Shield,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Smartphone,
  Globe,
  Star
} from 'lucide-react';

const KryonixDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiStatus, setAiStatus] = useState('active');
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 0,
    aiResponses: 0,
    conversions: 0,
    revenue: 0
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 10) - 4),
        aiResponses: prev.aiResponses + Math.floor(Math.random() * 5),
        conversions: prev.conversions + Math.floor(Math.random() * 3),
        revenue: prev.revenue + Math.floor(Math.random() * 1000)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: 'Usuários Ativos',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      realTime: realTimeMetrics.activeUsers
    },
    {
      title: 'Respostas IA',
      value: '15,392',
      change: '+8.2%',
      trend: 'up',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      realTime: realTimeMetrics.aiResponses
    },
    {
      title: 'Conversões',
      value: '892',
      change: '+24.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      realTime: realTimeMetrics.conversions
    },
    {
      title: 'Receita',
      value: 'R$ 45,250',
      change: '+15.8%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      realTime: realTimeMetrics.revenue
    }
  ];

  const aiAgents = [
    { name: 'WhatsApp Bot', status: 'active', responses: 1547, efficiency: 98 },
    { name: 'CRM Assistant', status: 'active', responses: 892, efficiency: 95 },
    { name: 'Analytics AI', status: 'active', responses: 634, efficiency: 97 },
    { name: 'Sales Bot', status: 'active', responses: 445, efficiency: 94 },
    { name: 'Support AI', status: 'active', responses: 723, efficiency: 96 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'whatsapp',
      message: 'Nova mensagem do cliente Maria Silva',
      time: '2 min atrás',
      priority: 'high'
    },
    {
      id: 2,
      type: 'conversion',
      message: 'Lead convertido: João Santos',
      time: '5 min atrás',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'ai',
      message: 'IA otimizou resposta automática',
      time: '8 min atrás',
      priority: 'low'
    },
    {
      id: 4,
      type: 'analytics',
      message: 'Relatório semanal gerado',
      time: '12 min atrás',
      priority: 'medium'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard KRYONIX
            </h1>
            <p className="text-gray-600">
              {currentTime.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">IA {aiStatus === 'active' ? 'Ativa' : 'Inativa'}</span>
            </div>
            
            <button className="p-2 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <Bell size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                  {stat.realTime > 0 && (
                    <span className="text-sm text-green-600 ml-2">
                      +{stat.realTime}
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* AI Agents Status */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Agentes IA Ativos</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Brain size={16} />
                <span>15 Agentes Online</span>
              </div>
            </div>

            <div className="space-y-4">
              {aiAgents.map((agent, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.responses} respostas hoje</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{agent.efficiency}%</div>
                    <div className="text-xs text-gray-600">Eficiência</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center">
              <span>Ver Todos os Agentes</span>
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Atividade Recente</h2>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.priority === 'high' ? 'bg-red-500' :
                    activity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Ver Todas as Atividades
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
            <MessageCircle size={24} className="text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-900">WhatsApp</span>
          </button>
          
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center">
            <BarChart3 size={24} className="text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-900">Analytics</span>
          </button>
          
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
            <Users size={24} className="text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-900">CRM</span>
          </button>
          
          <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center">
            <Zap size={24} className="text-yellow-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-yellow-900">Automação</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">Sistema 100% Operacional</h3>
            <p className="text-blue-100">
              Todos os serviços KRYONIX funcionando perfeitamente
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-xs text-blue-200">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">47ms</div>
              <div className="text-xs text-blue-200">Latência</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">15</div>
              <div className="text-xs text-blue-200">Agentes IA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KryonixDashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  BarChart3, 
  MessageCircle, 
  Users, 
  TrendingUp,
  Bell,
  Settings,
  Zap,
  Brain,
  Activity,
  ArrowUpRight,
  Plus,
  Filter
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    conversionRate: 0,
    revenue: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalUsers: 2847,
        activeChats: 156,
        conversionRate: 24.8,
        revenue: 89750
      });

      setRecentActivity([
        {
          id: 1,
          type: 'message',
          user: 'Maria Silva',
          action: 'enviou uma mensagem',
          time: '2 min atrás',
          avatar: '👩‍💼'
        },
        {
          id: 2,
          type: 'conversion',
          user: 'João Santos',
          action: 'finalizou uma compra',
          time: '5 min atrás',
          avatar: '👨‍💻'
        },
        {
          id: 3,
          type: 'signup',
          user: 'Ana Costa',
          action: 'criou uma conta',
          time: '8 min atrás',
          avatar: '👩‍🎨'
        },
        {
          id: 4,
          type: 'ai',
          user: 'IA Assistant',
          action: 'automatizou 15 processos',
          time: '12 min atrás',
          avatar: '🤖'
        }
      ]);
      
      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const StatCard = ({ icon: Icon, title, value, change, color = 'kryonix' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700 hover:shadow-float transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center`}>
          <Icon size={24} className={`text-${color}-600 dark:text-${color}-400`} />
        </div>
        {change && (
          <div className={`flex items-center text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <ArrowUpRight size={16} className="mr-1" />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {isLoading ? (
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer"></div>
        ) : (
          value
        )}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
    </div>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Aqui está o resumo do seu negócio hoje
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Settings size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-kryonix-600 to-kryonix-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Ações Rápidas</h2>
              <p className="text-kryonix-100 text-sm">Acelere seu workflow</p>
            </div>
            <Brain size={32} className="text-kryonix-200" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white/20 rounded-xl p-4 text-left hover:bg-white/30 transition-colors">
              <MessageCircle size={20} className="mb-2" />
              <span className="text-sm font-medium">Nova Campanha</span>
            </button>
            <button className="bg-white/20 rounded-xl p-4 text-left hover:bg-white/30 transition-colors">
              <Users size={20} className="mb-2" />
              <span className="text-sm font-medium">Gerenciar Leads</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Users}
            title="Total de Usuários"
            value={stats.totalUsers.toLocaleString('pt-BR')}
            change={12.5}
          />
          <StatCard
            icon={MessageCircle}
            title="Chats Ativos"
            value={stats.activeChats}
            change={8.2}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Taxa de Conversão"
            value={`${stats.conversionRate}%`}
            change={3.1}
            color="blue"
          />
          <StatCard
            icon={BarChart3}
            title="Receita Mensal"
            value={`R$ ${stats.revenue.toLocaleString('pt-BR')}`}
            change={15.7}
            color="green"
          />
        </div>

        {/* AI Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Status da IA
            </h3>
            <div className="flex items-center text-green-600">
              <Activity size={16} className="mr-1" />
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Zap size={20} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">15</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Agentes Ativos</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Brain size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">247</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Tarefas/Dia</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">98.5%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Precisão</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Atividade Recente
              </h3>
              <button className="text-kryonix-600 hover:text-kryonix-700 text-sm font-medium">
                Ver todas
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full loading-shimmer"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

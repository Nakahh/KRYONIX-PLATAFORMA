import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  MessageCircle, 
  DollarSign,
  Eye,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [metrics, setMetrics] = useState({});
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    
    // Simular carregamento de dados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockMetrics = {
      totalVisits: { value: 12847, change: 15.2, trend: 'up' },
      conversions: { value: 1247, change: -2.1, trend: 'down' },
      revenue: { value: 89750, change: 28.4, trend: 'up' },
      chatSessions: { value: 3429, change: 12.7, trend: 'up' },
      avgSessionTime: { value: '4:32', change: 8.9, trend: 'up' },
      bounceRate: { value: '23.4%', change: -5.2, trend: 'up' }
    };

    const mockChartData = [
      { name: 'Seg', visits: 2400, conversions: 240, revenue: 15000 },
      { name: 'Ter', visits: 1398, conversions: 140, revenue: 8500 },
      { name: 'Qua', visits: 9800, conversions: 980, revenue: 62000 },
      { name: 'Qui', visits: 3908, conversions: 390, revenue: 25000 },
      { name: 'Sex', visits: 4800, conversions: 480, revenue: 31000 },
      { name: 'Sáb', visits: 3800, conversions: 380, revenue: 24000 },
      { name: 'Dom', visits: 4300, conversions: 430, revenue: 28000 }
    ];

    setMetrics(mockMetrics);
    setChartData(mockChartData);
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  const MetricCard = ({ title, icon: Icon, value, change, trend, format = 'number' }) => {
    const formatValue = (val) => {
      if (format === 'currency') return `R$ ${val.toLocaleString('pt-BR')}`;
      if (format === 'number') return val.toLocaleString('pt-BR');
      return val;
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-kryonix-100 dark:bg-kryonix-900/30 rounded-xl flex items-center justify-center">
            <Icon size={20} className="text-kryonix-600 dark:text-kryonix-400" />
          </div>
          <div className={`flex items-center text-sm ${
            trend === 'up' && change > 0 ? 'text-green-600' : 
            trend === 'down' || change < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {change > 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {Math.abs(change)}%
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {isLoading ? (
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer"></div>
          ) : (
            formatValue(value)
          )}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
      </div>
    );
  };

  const SimpleChart = ({ data, dataKey, color = '#3b82f6' }) => {
    if (isLoading) {
      return <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer"></div>;
    }

    const maxValue = Math.max(...data.map(item => item[dataKey]));
    
    return (
      <div className="flex items-end justify-between h-32 px-2">
        {data.map((item, index) => {
          const height = (item[dataKey] / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div 
                className="w-full rounded-t-lg transition-all duration-500 ease-out"
                style={{ 
                  height: `${height}%`, 
                  backgroundColor: color,
                  minHeight: '4px'
                }}
              ></div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Analytics
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Insights e métricas do seu negócio
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={loadAnalytics}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <RefreshCw size={20} />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Período:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {[
                { value: '24h', label: '24h' },
                { value: '7d', label: '7d' },
                { value: '30d', label: '30d' },
                { value: '90d', label: '90d' }
              ].map(period => (
                <button
                  key={period.value}
                  onClick={() => setDateRange(period.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === period.value
                      ? 'bg-kryonix-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total de Visitas"
            icon={Eye}
            value={metrics.totalVisits?.value || 0}
            change={metrics.totalVisits?.change || 0}
            trend={metrics.totalVisits?.trend}
          />
          <MetricCard
            title="Conversões"
            icon={TrendingUp}
            value={metrics.conversions?.value || 0}
            change={metrics.conversions?.change || 0}
            trend={metrics.conversions?.trend}
          />
          <MetricCard
            title="Receita"
            icon={DollarSign}
            value={metrics.revenue?.value || 0}
            change={metrics.revenue?.change || 0}
            trend={metrics.revenue?.trend}
            format="currency"
          />
          <MetricCard
            title="Sessões de Chat"
            icon={MessageCircle}
            value={metrics.chatSessions?.value || 0}
            change={metrics.chatSessions?.change || 0}
            trend={metrics.chatSessions?.trend}
          />
        </div>

        {/* Charts */}
        <div className="space-y-4">
          {/* Visits Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visitas por Dia
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Últimos 7 dias
              </div>
            </div>
            <SimpleChart data={chartData} dataKey="visits" color="#3b82f6" />
          </div>

          {/* Conversions Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Conversões por Dia
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Taxa de conversão média: 12.4%
              </div>
            </div>
            <SimpleChart data={chartData} dataKey="conversions" color="#22c55e" />
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Receita por Dia
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ticket médio: R$ 72
              </div>
            </div>
            <SimpleChart data={chartData} dataKey="revenue" color="#f59e0b" />
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Tempo Médio de Sessão
            </h4>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer"></div>
              ) : (
                metrics.avgSessionTime?.value
              )}
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp size={14} className="mr-1" />
              +{metrics.avgSessionTime?.change || 0}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Taxa de Rejeição
            </h4>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer"></div>
              ) : (
                metrics.bounceRate?.value
              )}
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingDown size={14} className="mr-1" />
              {Math.abs(metrics.bounceRate?.change || 0)}%
            </div>
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Atividade em Tempo Real
            </h3>
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  47 usuários online agora
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Agora
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <MessageCircle size={16} className="text-green-600" />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  3 novos chats iniciados
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                2 min
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp size={16} className="text-yellow-600" />
                </div>
                <span className="text-sm text-gray-900 dark:text-white">
                  2 conversões realizadas
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                5 min
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

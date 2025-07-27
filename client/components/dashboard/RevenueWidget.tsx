import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useRevenueMetrics } from '../../hooks/use-brazilian-kpis';
import { formatCurrency, formatPercentage } from '../../lib/brazilian-formatters';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  PieChart,
  AlertCircle,
  Target,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Widget de Receita - Métricas financeiras em reais para empresários brasileiros
 * KRYONIX - Foco em MRR, crescimento e churn
 */

export function RevenueWidget() {
  const { data: revenueData, isLoading, error } = useRevenueMetrics();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200">
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Erro ao carregar dados de receita</span>
        </div>
      </Card>
    );
  }

  const revenue = revenueData || {
    mrr: 0,
    current_month: 0,
    growth_percentage: 0,
    churn_rate: 0,
    daily_average: 0,
    annual_recurring_revenue: 0,
  };

  const isGrowthPositive = revenue.growth_percentage > 0;
  const isChurnHealthy = revenue.churn_rate <= 5; // 5% ou menos é saudável
  const mrrTarget = 50000; // Meta de MRR em reais
  const mrrProgress = (revenue.mrr / mrrTarget) * 100;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Receita Recorrente</h3>
            <p className="text-sm text-gray-600">MRR e crescimento mensal</p>
          </div>
        </div>
        
        <Badge 
          variant={isGrowthPositive ? "default" : "destructive"}
          className={isGrowthPositive ? "bg-green-100 text-green-800" : ""}
        >
          {isGrowthPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {formatPercentage(Math.abs(revenue.growth_percentage))}
        </Badge>
      </div>

      {/* MRR Principal */}
      <div className="text-center p-4 bg-white rounded-lg shadow-sm mb-4">
        <div className="text-3xl font-bold text-emerald-600 mb-1">
          {formatCurrency(revenue.mrr)}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Receita Recorrente Mensal (MRR)
        </div>
        
        {/* Progresso para meta */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(mrrProgress, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500">
          {formatPercentage(mrrProgress, 0)} da meta de {formatCurrency(mrrTarget)}
        </div>
      </div>

      {/* Métricas mensais */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(revenue.current_month)}
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center">
            <Calendar className="h-3 w-3 mr-1" />
            faturamento mês
          </div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(revenue.daily_average)}
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center">
            <Target className="h-3 w-3 mr-1" />
            média diária
          </div>
        </div>
      </div>

      {/* Métricas de saúde do negócio */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Crescimento mensal
          </span>
          <span className={`font-semibold ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isGrowthPositive ? '+' : ''}{formatPercentage(revenue.growth_percentage)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Taxa de churn
          </span>
          <span className={`font-semibold ${isChurnHealthy ? 'text-green-600' : 'text-yellow-600'}`}>
            {formatPercentage(revenue.churn_rate)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center">
            <PieChart className="h-4 w-4 mr-1" />
            ARR (anual)
          </span>
          <span className="font-semibold">{formatCurrency(revenue.annual_recurring_revenue)}</span>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {isGrowthPositive ? (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Crescendo 📈</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-yellow-600 font-medium">Atenção ⚠️</span>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/billing/analytics')}
              className="text-xs"
            >
              Relatórios
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/billing/plans')}
              className="text-xs bg-emerald-600 hover:bg-emerald-700"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Planos
            </Button>
          </div>
        </div>
      </div>

      {/* Dicas para crescimento */}
      {!isGrowthPositive && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p className="text-yellow-800">
            💡 <strong>Oportunidade:</strong> Configure automações para reduzir churn e aumentar vendas!
          </p>
        </div>
      )}
      
      {revenue.churn_rate > 5 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <p className="text-red-800">
            🚨 <strong>Atenção:</strong> Taxa de churn alta. Analise motivos de cancelamento!
          </p>
        </div>
      )}
      
      {mrrProgress >= 90 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <p className="text-green-800">
            🎉 <strong>Parabéns:</strong> Quase batendo a meta de MRR! Continue assim!
          </p>
        </div>
      )}
    </Card>
  );
}

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { brazilianConstants } from '../../design-system/tokens';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, PieChart } from 'lucide-react';
import { useMobileAdvanced } from '../../hooks/use-mobile-advanced';

interface RevenueDisplayProps {
  title?: string;
  amount: number;
  previousAmount?: number;
  period?: string;
  target?: number;
  variant?: 'default' | 'compact' | 'detailed' | 'card';
  showTrend?: boolean;
  showTarget?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * RevenueDisplay - Componente brasileiro para exibição de receita
 * Formatação em Real brasileiro, otimizado para mobile
 */
export const RevenueDisplay: React.FC<RevenueDisplayProps> = ({
  title = 'Receita',
  amount,
  previousAmount,
  period = 'este mês',
  target,
  variant = 'default',
  showTrend = true,
  showTarget = false,
  prefix,
  suffix,
  className,
  onClick,
}) => {
  const { isMobile } = useMobileAdvanced();

  // Formatação brasileira de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Formatação compacta para valores grandes
  const formatCompactCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return formatCurrency(value);
  };

  // Cálculo de crescimento
  const getGrowth = () => {
    if (!previousAmount || previousAmount === 0) return null;
    
    const growth = ((amount - previousAmount) / previousAmount) * 100;
    const isPositive = growth > 0;
    const isNeutral = Math.abs(growth) < 0.1;
    
    return {
      percentage: Math.abs(growth),
      isPositive,
      isNeutral,
      formatted: `${isPositive ? '+' : '-'}${Math.abs(growth).toFixed(1)}%`,
    };
  };

  // Progresso da meta
  const getTargetProgress = () => {
    if (!target || target === 0) return null;
    
    const progress = (amount / target) * 100;
    const isAchieved = progress >= 100;
    
    return {
      percentage: Math.min(progress, 100),
      isAchieved,
      remaining: target - amount,
    };
  };

  const growth = getGrowth();
  const targetProgress = getTargetProgress();

  // Variant Compact
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)} onClick={onClick}>
        <span className="text-lg">{brazilianConstants.emojis.money}</span>
        <div>
          <div className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>
            {prefix}{isMobile ? formatCompactCurrency(amount) : formatCurrency(amount)}{suffix}
          </div>
          {growth && showTrend && (
            <div className={`flex items-center space-x-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {growth.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                {growth.formatted}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variant Card
  if (variant === 'card') {
    return (
      <Card 
        className={cn(
          'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 cursor-pointer hover:shadow-md transition-all',
          className
        )}
        onClick={onClick}
      >
        <CardHeader className={`pb-2 ${isMobile ? 'p-3' : ''}`}>
          <CardTitle className={`flex items-center justify-between ${isMobile ? 'text-sm' : 'text-base'}`}>
            <span className="text-emerald-700 flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>{title}</span>
            </span>
            {growth && showTrend && (
              <Badge 
                className={cn(
                  'flex items-center space-x-1',
                  growth.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}
              >
                {growth.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{growth.formatted}</span>
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
          <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-emerald-600 mb-1`}>
            {prefix}{formatCurrency(amount)}{suffix}
          </div>
          
          {period && (
            <p className={`text-emerald-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {period}
            </p>
          )}
          
          {showTarget && targetProgress && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Meta {period}
                </span>
                <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {targetProgress.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    targetProgress.isAchieved ? 'bg-green-600' : 'bg-emerald-500'
                  )}
                  style={{ width: `${targetProgress.percentage}%` }}
                />
              </div>
              {!targetProgress.isAchieved && (
                <p className={`text-gray-500 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Faltam {formatCompactCurrency(targetProgress.remaining)} para a meta
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Variant Detailed
  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4', className)} onClick={onClick}>
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
            {title}
          </h3>
          {period && (
            <div className="flex items-center space-x-1 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className={isMobile ? 'text-xs' : 'text-sm'}>{period}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-baseline space-x-3">
          <div className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {prefix}{formatCurrency(amount)}{suffix}
          </div>
          
          {growth && showTrend && (
            <div className={`flex items-center space-x-1 ${isMobile ? 'text-sm' : 'text-base'}`}>
              {growth.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
                {growth.formatted}
              </span>
              <span className="text-gray-500">vs. período anterior</span>
            </div>
          )}
        </div>
        
        {showTarget && targetProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4 text-gray-600" />
                <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Meta: {formatCurrency(target!)}
                </span>
              </div>
              <Badge 
                className={cn(
                  targetProgress.isAchieved 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                )}
              >
                {targetProgress.percentage.toFixed(0)}%
              </Badge>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={cn(
                  'h-3 rounded-full transition-all duration-500',
                  targetProgress.isAchieved ? 'bg-green-600' : 'bg-blue-500'
                )}
                style={{ width: `${targetProgress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant Default
  return (
    <div className={cn('text-center space-y-2', className)} onClick={onClick}>
      <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
        {prefix}{formatCurrency(amount)}{suffix}
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <span className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
          {title} {period}
        </span>
        
        {growth && showTrend && (
          <div className={`flex items-center space-x-1 ${isMobile ? 'text-sm' : 'text-base'}`}>
            {growth.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={growth.isPositive ? 'text-green-600' : 'text-red-600'}>
              {growth.formatted}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para múltiplas métricas de receita
export const RevenueMetrics: React.FC<{
  metrics: Array<{
    title: string;
    amount: number;
    previousAmount?: number;
    target?: number;
    period?: string;
  }>;
  className?: string;
}> = ({ metrics, className }) => {
  const { isMobile } = useMobileAdvanced();

  return (
    <div className={cn(`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`, className)}>
      {metrics.map((metric, index) => (
        <RevenueDisplay
          key={index}
          title={metric.title}
          amount={metric.amount}
          previousAmount={metric.previousAmount}
          target={metric.target}
          period={metric.period}
          variant="card"
          showTrend={true}
          showTarget={!!metric.target}
        />
      ))}
    </div>
  );
};

export default RevenueDisplay;

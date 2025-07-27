import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useBrazilianKPIs } from '../../hooks/use-brazilian-kpis';
import { formatLargeNumber, formatPercentage, formatDuration } from '../../lib/brazilian-formatters';
import { 
  Workflow, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Play,
  Pause,
  Settings,
  CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Widget de Automações - Métricas de N8N e Typebot para empreendedores brasileiros
 * KRYONIX - Economia de tempo e eficiência
 */

export function AutomationWidget() {
  const { data: kpis, isLoading, error } = useBrazilianKPIs();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
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
          <span>Erro ao carregar dados de automação</span>
        </div>
      </Card>
    );
  }

  const automation = kpis?.automation || {
    workflows_executed_today: 0,
    workflows_executed_month: 0,
    active_workflows: 0,
    success_rate: 0,
    time_saved_hours: 0,
    errors_today: 0,
    most_used_workflow: 'N/A',
  };

  const isPerformingWell = automation.success_rate >= 90;
  const hasRecentActivity = automation.workflows_executed_today > 0;
  const timeSavedValue = automation.time_saved_hours * 50; // R$ 50/hora estimado

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Workflow className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Automações Inteligentes</h3>
            <p className="text-sm text-gray-600">N8N + Typebot trabalhando para você</p>
          </div>
        </div>
        
        <Badge 
          variant={isPerformingWell ? "default" : "destructive"}
          className={isPerformingWell ? "bg-purple-100 text-purple-800" : ""}
        >
          {automation.active_workflows} workflows ativos
        </Badge>
      </div>

      {/* Execuções principais */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {formatLargeNumber(automation.workflows_executed_today)}
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center">
            <Zap className="h-3 w-3 mr-1" />
            execuções hoje
          </div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className={`text-2xl font-bold ${isPerformingWell ? 'text-green-600' : 'text-yellow-600'}`}>
            {formatPercentage(automation.success_rate)}
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            taxa de sucesso
          </div>
        </div>
      </div>

      {/* Economia de tempo */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-green-700 mb-1">
            {automation.time_saved_hours.toFixed(1)}h economizadas
          </div>
          <div className="text-sm text-green-600">
            ≈ R$ {timeSavedValue.toLocaleString('pt-BR')} em valor
          </div>
        </div>
      </div>

      {/* Métricas detalhadas */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Execuções mês
          </span>
          <span className="font-semibold">{formatLargeNumber(automation.workflows_executed_month)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            Erros hoje
          </span>
          <span className={`font-semibold ${automation.errors_today === 0 ? 'text-green-600' : 'text-red-600'}`}>
            {automation.errors_today}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center">
            <Workflow className="h-4 w-4 mr-1" />
            Mais usado
          </span>
          <span className="font-semibold text-xs">{automation.most_used_workflow}</span>
        </div>
      </div>

      {/* Status e ações */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasRecentActivity ? (
              <>
                <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-600 font-medium">Executando agora</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs text-gray-500">Aguardando triggers</span>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/dashboard/stacks/n8n')}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              N8N
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/dashboard/stacks/typebot')}
              className="text-xs bg-purple-600 hover:bg-purple-700"
            >
              <Play className="h-3 w-3 mr-1" />
              Typebot
            </Button>
          </div>
        </div>
      </div>

      {/* Dicas para otimização */}
      {automation.errors_today > 0 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <p className="text-red-800">
            ⚠️ <strong>Atenção:</strong> {automation.errors_today} erro(s) hoje. Verifique os workflows!
          </p>
        </div>
      )}
      
      {automation.success_rate < 80 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p className="text-yellow-800">
            💡 <strong>Dica:</strong> Taxa de sucesso baixa. Otimize seus workflows para melhor performance!
          </p>
        </div>
      )}
      
      {automation.time_saved_hours > 40 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <p className="text-green-800">
            🎉 <strong>Parabéns:</strong> Suas automações já economizaram mais de 40h este mês!
          </p>
        </div>
      )}
    </Card>
  );
}

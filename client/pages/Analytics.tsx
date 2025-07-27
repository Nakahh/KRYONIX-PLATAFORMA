import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useBrazilianKPIs } from '../hooks/use-brazilian-kpis';
import { useMobileAdvanced } from '../hooks/use-mobile-advanced';
import { formatCurrency, formatLargeNumber, formatPercentage, getGreeting } from '../lib/brazilian-formatters';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  MessageCircle,
  DollarSign,
  Users,
  Zap,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Página de Analytics - Relatórios e métricas completas para empreendedores brasileiros
 * KRYONIX - Análises profundas do negócio
 */

export default function Analytics() {
  const { data: kpis, isLoading } = useBrazilianKPIs();
  const { isMobile, screenSize } = useMobileAdvanced();
  const navigate = useNavigate();

  const userName = 'Empreendedor'; // TODO: Pegar do contexto de auth

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Header - Mobile Optimized */}
        <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
              📊 Analytics Empresarial
            </h1>
            <p className="text-gray-600 mt-2">
              {isMobile ? 'Métricas do seu negócio' : 'Análises completas do seu negócio brasileiro'}
            </p>
          </div>

          {/* Mobile: Horizontal scroll buttons, Desktop: Flex layout */}
          <div className={`${isMobile ? 'flex space-x-2 overflow-x-auto pb-2' : 'flex items-center space-x-3'}`}>
            {isMobile ? (
              <>
                <Button variant="outline" size="sm" className="min-w-fit">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="min-w-fit">
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="min-w-fit">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 min-w-fit">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Período
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Visão Geral - Mobile: 2 cols, Tablet: 2 cols, Desktop: 4 cols */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
          {/* Receita Total - Mobile Optimized */}
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className={`pb-2 ${isMobile ? 'p-3' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-emerald-700`}>💰 Receita</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-emerald-600`}>
                {isMobile ? formatCurrency(kpis?.revenue?.current_month || 0).replace('R$', 'R$').replace(',00', '') : formatCurrency(kpis?.revenue?.current_month || 0)}
              </div>
              <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-emerald-600 mt-1`}>
                <TrendingUp className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} mr-1`} />
                +{formatPercentage(kpis?.revenue?.growth_percentage || 0)}
                {!isMobile && ' este mês'}
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Atividade - Mobile Optimized */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className={`pb-2 ${isMobile ? 'p-3' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-green-700`}>💬 WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>
                {formatLargeNumber(kpis?.whatsapp?.messages_month || 0)}
              </div>
              <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-green-600 mt-1`}>
                <MessageCircle className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} mr-1`} />
                {isMobile ? 'mensagens' : 'mensagens enviadas'}
              </div>
            </CardContent>
          </Card>

          {/* Conversões - Mobile Optimized */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className={`pb-2 ${isMobile ? 'p-3' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-blue-700`}>🎯 Leads</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>
                {formatLargeNumber(kpis?.conversions?.leads_month || 0)}
              </div>
              <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-blue-600 mt-1`}>
                <Users className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} mr-1`} />
                {isMobile ? 'este mês' : 'leads este mês'}
              </div>
            </CardContent>
          </Card>

          {/* Automações - Mobile Optimized */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className={`pb-2 ${isMobile ? 'p-3' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-purple-700`}>⚡ Automações</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? 'p-3 pt-0' : ''}>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-600`}>
                {formatLargeNumber(kpis?.automation?.workflows_executed_month || 0)}
              </div>
              <div className={`flex items-center ${isMobile ? 'text-xs' : 'text-sm'} text-purple-600 mt-1`}>
                <Zap className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'} mr-1`} />
                {isMobile ? 'execuções' : 'execuções este m��s'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Detalhados - Mobile: Stack, Desktop: 2 cols */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
          {/* Evolução da Receita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Evolução da Receita (MRR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Gráfico de receita em desenvolvimento</p>
                  <p className="text-sm">Integração com dados reais em breve</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-emerald-600">
                    {formatCurrency(kpis?.revenue?.mrr || 0)}
                  </div>
                  <div className="text-xs text-gray-600">MRR Atual</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatPercentage(kpis?.revenue?.growth_percentage || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Crescimento</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">
                    {formatPercentage(kpis?.revenue?.churn_rate || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Churn Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance WhatsApp */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                Performance WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Resposta</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${kpis?.whatsapp?.response_rate || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold">
                      {formatPercentage(kpis?.whatsapp?.response_rate || 0)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Instâncias Ativas</span>
                  <span className="text-sm font-semibold">
                    {kpis?.whatsapp?.active_instances || 0}/{kpis?.whatsapp?.total_instances || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Contatos Ativos</span>
                  <span className="text-sm font-semibold">
                    {formatLargeNumber(kpis?.whatsapp?.active_contacts || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tempo Médio Resposta</span>
                  <span className="text-sm font-semibold">
                    {kpis?.whatsapp?.avg_response_time || 'N/A'}
                  </span>
                </div>
              </div>
              
              <Button
                className={`w-full mt-4 bg-green-600 hover:bg-green-700 ${isMobile ? 'py-3 text-base' : ''}`}
                onClick={() => navigate('/whatsapp/analytics')}
              >
                {isMobile ? '📊 Ver WhatsApp' : 'Ver Análise Completa do WhatsApp'}
                {isMobile && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ROI das Automações - Mobile Optimized */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-600" />
              {isMobile ? '💼 ROI Automações' : 'ROI das Automações'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(kpis?.automation?.time_saved_hours || 0).toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Tempo Economizado</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency((kpis?.automation?.time_saved_hours || 0) * 50)}
                </div>
                <div className="text-sm text-gray-600">Valor Economizado (R$50/h)</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPercentage(kpis?.automation?.success_rate || 0)}
                </div>
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {kpis?.automation?.active_workflows || 0}
                </div>
                <div className="text-sm text-gray-600">Workflows Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximas Ações Recomendadas - Mobile Optimized */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-700">
              <TrendingUp className="h-5 w-5 mr-2" />
              {isMobile ? '🚀 Oportunidades' : 'Oportunidades de Crescimento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
              {(kpis?.revenue?.churn_rate || 0) > 5 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">🚨 Churn Alto</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Taxa de churn de {formatPercentage(kpis?.revenue?.churn_rate || 0)} está acima do ideal (5%).
                  </p>
                  <Button size={isMobile ? 'default' : 'sm'} variant="outline" className={`border-red-300 text-red-700 ${isMobile ? 'w-full py-2' : ''}`}>
                    {isMobile ? '🔍 Analisar' : 'Analisar Cancelamentos'}
                  </Button>
                </div>
              )}
              
              {(kpis?.whatsapp?.response_rate || 0) < 80 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚡ WhatsApp</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Taxa de resposta de {formatPercentage(kpis?.whatsapp?.response_rate || 0)} pode melhorar.
                  </p>
                  <Button size={isMobile ? 'default' : 'sm'} variant="outline" className={`border-yellow-300 text-yellow-700 ${isMobile ? 'w-full py-2' : ''}`}>
                    {isMobile ? '⚡ Otimizar' : 'Otimizar Atendimento'}
                  </Button>
                </div>
              )}
              
              {(kpis?.automation?.success_rate || 0) < 90 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🤖 Automações</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    {formatPercentage(kpis?.automation?.success_rate || 0)} de sucesso. Pode ser otimizado.
                  </p>
                  <Button size={isMobile ? 'default' : 'sm'} variant="outline" className={`border-blue-300 text-blue-700 ${isMobile ? 'w-full py-2' : ''}`}>
                    {isMobile ? '🤖 Revisar' : 'Revisar Workflows'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useWhatsAppStats } from '../hooks/use-brazilian-kpis';
import { formatLargeNumber, formatPercentage, formatRelativeTime } from '../lib/brazilian-formatters';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  TrendingUp, 
  Activity,
  ArrowLeft,
  Download,
  Filter,
  RefreshCw,
  Phone,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Página de Analytics do WhatsApp - Análises detalhadas para canal principal brasileiro
 * KRYONIX - 92% dos brasileiros usam WhatsApp
 */

export default function WhatsAppAnalytics() {
  const { data: whatsappStats, isLoading, refetch } = useWhatsAppStats();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const stats = whatsappStats || {
    messages_today: 0,
    messages_month: 0,
    response_rate: 0,
    avg_response_time: '0s',
    active_instances: 0,
    total_instances: 0,
    active_contacts: 0,
    conversations_today: 0,
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Header com navegação */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/analytics')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MessageCircle className="h-8 w-8 text-green-600 mr-3" />
                Analytics WhatsApp Business
              </h1>
              <p className="text-gray-600 mt-2">
                Análise completa do seu canal de comunicação principal
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
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
            <Button 
              size="sm" 
              onClick={() => refetch()}
              className="bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Status das Instâncias */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                <Activity className="h-4 w-4 mr-1" />
                Instâncias Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.active_instances}/{stats.total_instances}
              </div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                {stats.active_instances === stats.total_instances ? 'Todas conectadas' : 'Verificar conexões'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                Mensagens Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatLargeNumber(stats.messages_today)}
              </div>
              <div className="flex items-center text-sm text-blue-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{Math.round((stats.messages_today / (stats.messages_month / 30)) * 100 - 100) || 0}% da média
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Contatos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {formatLargeNumber(stats.active_contacts)}
              </div>
              <div className="flex items-center text-sm text-purple-600 mt-1">
                <Users className="h-3 w-3 mr-1" />
                base de clientes
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Tempo Resposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats.avg_response_time}
              </div>
              <div className="flex items-center text-sm text-orange-600 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                tempo médio
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Detalhada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Taxa de Resposta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Performance de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Taxa de Resposta</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPercentage(stats.response_rate)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${stats.response_rate}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Meta: 90% | Atual: {formatPercentage(stats.response_rate)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {formatLargeNumber(stats.conversations_today)}
                    </div>
                    <div className="text-sm text-gray-600">Conversas Hoje</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {formatLargeNumber(stats.messages_month)}
                    </div>
                    <div className="text-sm text-gray-600">Mensagens/Mês</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status das Instâncias Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-600" />
                Status das Instâncias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simulação de instâncias - em produção virá da API real */}
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium">Atendimento Principal</div>
                      <div className="text-sm text-gray-600">+55 17 98180-5327</div>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium">Vendas</div>
                      <div className="text-sm text-gray-600">+55 17 99999-9999</div>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    Online
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Suporte</div>
                      <div className="text-sm text-gray-600">+55 17 88888-8888</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                    Conectando...
                  </Badge>
                </div>

                <Button 
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/dashboard/stacks/evolution_api')}
                >
                  Gerenciar Instâncias
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análise de Horários de Pico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Horários de Maior Atividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">Gráfico de Atividade por Horário</p>
                <p className="text-sm">Integração com dados reais em desenvolvimento</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">08:00-12:00</div>
                <div className="text-sm text-gray-600">Manhã</div>
                <div className="text-xs text-green-600">Pico: 35%</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">14:00-18:00</div>
                <div className="text-sm text-gray-600">Tarde</div>
                <div className="text-xs text-blue-600">Pico: 45%</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">19:00-22:00</div>
                <div className="text-sm text-gray-600">Noite</div>
                <div className="text-xs text-purple-600">Pico: 20%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações Recomendadas */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              Recomendações para Otimização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.response_rate < 80 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">📉 Taxa de Resposta Baixa</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Sua taxa de {formatPercentage(stats.response_rate)} está abaixo do ideal (80%+).
                  </p>
                  <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                    Configurar Auto-Resposta
                  </Button>
                </div>
              )}
              
              {stats.active_instances < stats.total_instances && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Instância Offline</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    {stats.total_instances - stats.active_instances} instância(s) não estão conectadas.
                  </p>
                  <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700">
                    Reconectar Agora
                  </Button>
                </div>
              )}
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🚀 Automatizar Atendimento</h4>
                <p className="text-sm text-green-700 mb-3">
                  Configure chatbots para melhorar tempo de resposta.
                </p>
                <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                  Criar Chatbot
                </Button>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Campanhas em Massa</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Aproveite sua base de {formatLargeNumber(stats.active_contacts)} contatos.
                </p>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                  Criar Campanha
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useWhatsAppStats } from '../../hooks/use-brazilian-kpis';
import { formatLargeNumber, formatPercentage, getStatusColor } from '../../lib/brazilian-formatters';
import { MessageCircle, Users, Clock, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Widget WhatsApp Business - Canal principal para empresários brasileiros
 * KRYONIX - Dados reais em tempo real
 */

export function WhatsAppWidget() {
  const { data: whatsappStats, isLoading, error } = useWhatsAppStats();
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
          <span>Erro ao carregar dados do WhatsApp</span>
        </div>
      </Card>
    );
  }

  const stats = whatsappStats || {
    messages_today: 0,
    response_rate: 0,
    active_instances: 0,
    total_instances: 0,
    active_contacts: 0,
    conversations_today: 0,
    avg_response_time: '0s',
  };

  const instancesConnected = stats.active_instances === stats.total_instances;
  const responseRateGood = stats.response_rate >= 80;
  const hasActivity = stats.messages_today > 0;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">WhatsApp Business</h3>
            <p className="text-sm text-gray-600">Canal principal de vendas</p>
          </div>
        </div>
        
        <Badge 
          variant={instancesConnected ? "default" : "destructive"}
          className={instancesConnected ? "bg-green-100 text-green-800" : ""}
        >
          {stats.active_instances}/{stats.total_instances} instâncias
        </Badge>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {formatLargeNumber(stats.messages_today)}
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center">
            <MessageCircle className="h-3 w-3 mr-1" />
            mensagens hoje
          </div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className={`text-2xl font-bold ${responseRateGood ? 'text-green-600' : 'text-yellow-600'}`}>
            {formatPercentage(stats.response_rate)}
          </div>
          <div className="text-xs text-gray-600 flex items-center justify-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            taxa de resposta
          </div>
        </div>
      </div>

      {/* Métricas secundárias */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Contatos ativos
          </span>
          <span className="font-semibold">{formatLargeNumber(stats.active_contacts)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center">
            <MessageCircle className="h-4 w-4 mr-1" />
            Conversas hoje
          </span>
          <span className="font-semibold">{formatLargeNumber(stats.conversations_today)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Tempo resposta
          </span>
          <span className="font-semibold">{stats.avg_response_time}</span>
        </div>
      </div>

      {/* Status e ações */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasActivity ? (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Ativo agora</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs text-gray-500">Sem atividade</span>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/whatsapp/analytics')}
              className="text-xs"
            >
              Relatórios
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/whatsapp/broadcast')}
              className="text-xs bg-green-600 hover:bg-green-700"
            >
              <Zap className="h-3 w-3 mr-1" />
              Enviar Campanha
            </Button>
          </div>
        </div>
      </div>

      {/* Dicas para empreendedores */}
      {!hasActivity && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p className="text-yellow-800">
            ���� <strong>Dica:</strong> Configure sua primeira automação para engajar clientes no WhatsApp!
          </p>
        </div>
      )}
      
      {stats.response_rate < 50 && hasActivity && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <p className="text-blue-800">
            🚀 <strong>Oportunidade:</strong> Melhore sua taxa de resposta com chatbots automáticos!
          </p>
        </div>
      )}
    </Card>
  );
}

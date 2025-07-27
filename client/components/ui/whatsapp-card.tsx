import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { brazilianConstants } from '../../design-system/tokens';
import { MessageCircle, Users, TrendingUp, Clock, Phone, Check, X } from 'lucide-react';
import { useMobileAdvanced } from '../../hooks/use-mobile-advanced';

interface WhatsAppCardProps {
  instanceName?: string;
  phoneNumber?: string;
  status?: 'connected' | 'disconnected' | 'connecting';
  messagesCount?: number;
  contactsCount?: number;
  responseRate?: number;
  lastActivity?: string;
  variant?: 'status' | 'metrics' | 'action';
  onConnect?: () => void;
  onMessage?: () => void;
  onManage?: () => void;
  className?: string;
}

/**
 * WhatsAppCard - Componente brasileiro para WhatsApp Business
 * Otimizado para empreendedores brasileiros e mobile-first
 */
export const WhatsAppCard: React.FC<WhatsAppCardProps> = ({
  instanceName = 'WhatsApp Business',
  phoneNumber,
  status = 'disconnected',
  messagesCount = 0,
  contactsCount = 0,
  responseRate = 0,
  lastActivity,
  variant = 'status',
  onConnect,
  onMessage,
  onManage,
  className,
}) => {
  const { isMobile } = useMobileAdvanced();

  // Formatação brasileira de números
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  // Status em português
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Conectado',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          icon: <Check className="h-4 w-4" />,
        };
      case 'connecting':
        return {
          label: 'Conectando...',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          icon: <Clock className="h-4 w-4 animate-spin" />,
        };
      default:
        return {
          label: 'Desconectado',
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          icon: <X className="h-4 w-4" />,
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Card de Status
  if (variant === 'status') {
    return (
      <Card className={cn('border-2 border-green-200 hover:shadow-md transition-shadow', className)}>
        <CardHeader className={`pb-3 ${isMobile ? 'p-4' : ''}`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
              <span className="text-2xl">{brazilianConstants.emojis.whatsapp}</span>
              <span>{instanceName}</span>
            </CardTitle>
            <Badge 
              className={cn(
                'flex items-center space-x-1',
                statusInfo.bgColor,
                statusInfo.textColor
              )}
            >
              <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
              <span>{statusInfo.label}</span>
            </Badge>
          </div>
          
          {phoneNumber && (
            <p className={`text-gray-600 flex items-center space-x-1 ${isMobile ? 'text-sm' : ''}`}>
              <Phone className="h-3 w-3" />
              <span>{phoneNumber}</span>
            </p>
          )}
        </CardHeader>

        <CardContent className={isMobile ? 'p-4 pt-0' : ''}>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="text-center">
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>
                {formatNumber(messagesCount)}
              </div>
              <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Mensagens hoje
              </div>
            </div>
            
            <div className="text-center">
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>
                {formatNumber(contactsCount)}
              </div>
              <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Contatos ativos
              </div>
            </div>
          </div>
          
          {lastActivity && (
            <p className={`text-center text-gray-500 mt-3 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Último acesso: {lastActivity}
            </p>
          )}
          
          <div className={`flex space-x-2 mt-4 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
            {status === 'disconnected' && onConnect && (
              <Button 
                onClick={onConnect}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size={isMobile ? 'default' : 'sm'}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {isMobile ? 'Conectar WhatsApp' : 'Conectar'}
              </Button>
            )}
            
            {status === 'connected' && onMessage && (
              <Button 
                onClick={onMessage}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size={isMobile ? 'default' : 'sm'}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {isMobile ? 'Enviar Mensagem' : 'Mensagem'}
              </Button>
            )}
            
            {onManage && (
              <Button 
                onClick={onManage}
                variant="outline"
                className="flex-1 border-green-600 text-green-700"
                size={isMobile ? 'default' : 'sm'}
              >
                ⚙️ {isMobile ? 'Gerenciar' : 'Config'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card de Métricas
  if (variant === 'metrics') {
    return (
      <Card className={cn('border-green-200 bg-gradient-to-br from-green-50 to-emerald-50', className)}>
        <CardHeader className={`pb-3 ${isMobile ? 'p-4' : ''}`}>
          <CardTitle className={`flex items-center space-x-2 text-green-700 ${isMobile ? 'text-base' : 'text-lg'}`}>
            <MessageCircle className="h-5 w-5" />
            <span>Performance WhatsApp</span>
          </CardTitle>
        </CardHeader>

        <CardContent className={isMobile ? 'p-4 pt-0' : ''}>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <div className="text-center">
              <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-green-600`}>
                {formatNumber(messagesCount)}
              </div>
              <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Mensagens
              </div>
            </div>
            
            <div className="text-center">
              <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-blue-600`}>
                {responseRate}%
              </div>
              <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Taxa resposta
              </div>
            </div>
            
            {!isMobile && (
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {formatNumber(contactsCount)}
                </div>
                <div className="text-gray-600 text-sm">
                  Contatos
                </div>
              </div>
            )}
          </div>
          
          {/* Barra de progresso da taxa de resposta */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Taxa de Resposta
              </span>
              <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {responseRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(responseRate, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card de Ação
  return (
    <Card className={cn('border-green-200 hover:border-green-300 transition-colors cursor-pointer', className)}>
      <CardContent className={`p-6 text-center ${isMobile ? 'p-4' : ''}`}>
        <div className="text-4xl mb-3">{brazilianConstants.emojis.whatsapp}</div>
        <h3 className={`font-semibold text-gray-800 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
          WhatsApp Business
        </h3>
        <p className={`text-gray-600 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {isMobile ? 'Conecte e gerencie' : 'Conecte e gerencie seu WhatsApp Business'}
        </p>
        
        {onConnect && (
          <Button 
            onClick={onConnect}
            className="w-full bg-green-600 hover:bg-green-700"
            size={isMobile ? 'default' : 'sm'}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {isMobile ? 'Conectar' : 'Conectar Agora'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para lista de instâncias WhatsApp
export const WhatsAppInstanceList: React.FC<{
  instances: Array<{
    id: string;
    name: string;
    phone: string;
    status: 'connected' | 'disconnected' | 'connecting';
    messages: number;
    contacts: number;
  }>;
  onManageInstance: (instanceId: string) => void;
  className?: string;
}> = ({ instances, onManageInstance, className }) => {
  const { isMobile } = useMobileAdvanced();

  return (
    <div className={cn(`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`, className)}>
      {instances.map((instance) => (
        <WhatsAppCard
          key={instance.id}
          instanceName={instance.name}
          phoneNumber={instance.phone}
          status={instance.status}
          messagesCount={instance.messages}
          contactsCount={instance.contacts}
          onManage={() => onManageInstance(instance.id)}
        />
      ))}
    </div>
  );
};

export default WhatsAppCard;

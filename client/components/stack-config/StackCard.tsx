import React, { useState } from 'react';
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Play, 
  ExternalLink,
  Info,
  Shield,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface StackCardProps {
  stackType: string;
  name: string;
  description: string;
  category: string;
  status: 'not_configured' | 'configured' | 'active' | 'error' | 'testing';
  icon: React.ReactNode;
  isEnabled: boolean;
  lastTestedAt?: string;
  lastTestResult?: {
    success: boolean;
    message: string;
    responseTime?: number;
  };
  isFullyConfigured: boolean;
  onConfigure: () => void;
  onTest: () => void;
  onToggle: () => void;
  isLoading?: boolean;
}

const statusConfig = {
  not_configured: {
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    bgColor: 'bg-gray-50',
    icon: AlertCircle,
    text: 'Não Configurado',
    description: 'Configure esta stack para começar a usar'
  },
  configured: {
    color: 'bg-blue-100 text-blue-700 border-blue-200', 
    bgColor: 'bg-blue-50',
    icon: Settings,
    text: 'Configurado',
    description: 'Stack configurada, clique em testar para ativar'
  },
  active: {
    color: 'bg-green-100 text-green-700 border-green-200',
    bgColor: 'bg-green-50', 
    icon: CheckCircle,
    text: 'Ativo',
    description: 'Stack funcionando perfeitamente'
  },
  error: {
    color: 'bg-red-100 text-red-700 border-red-200',
    bgColor: 'bg-red-50',
    icon: AlertCircle, 
    text: 'Erro',
    description: 'Verifique a configuração e tente novamente'
  },
  testing: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    bgColor: 'bg-yellow-50',
    icon: Clock,
    text: 'Testando',
    description: 'Verificando conexão...'
  }
};

const categoryColors = {
  'Comunicação': 'bg-blue-100 text-blue-800',
  'Automação': 'bg-purple-100 text-purple-800', 
  'Chatbots': 'bg-green-100 text-green-800',
  'Marketing': 'bg-pink-100 text-pink-800',
  'Pagamentos': 'bg-yellow-100 text-yellow-800',
  'IA': 'bg-indigo-100 text-indigo-800',
  'Dados': 'bg-gray-100 text-gray-800',
  'Monitoramento': 'bg-red-100 text-red-800'
};

export default function StackCard({
  stackType,
  name,
  description,
  category,
  status,
  icon,
  isEnabled,
  lastTestedAt,
  lastTestResult,
  isFullyConfigured,
  onConfigure,
  onTest,
  onToggle,
  isLoading = false
}: StackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConnectionQuality = () => {
    if (!lastTestResult?.responseTime) return null;
    
    const time = lastTestResult.responseTime;
    if (time < 500) return { label: 'Excelente', color: 'text-green-600', bars: 4 };
    if (time < 1000) return { label: 'Bom', color: 'text-yellow-600', bars: 3 };
    if (time < 2000) return { label: 'Regular', color: 'text-orange-600', bars: 2 };
    return { label: 'Lento', color: 'text-red-600', bars: 1 };
  };

  const connectionQuality = getConnectionQuality();

  return (
    <TooltipProvider>
      <Card 
        className={`
          relative overflow-hidden transition-all duration-300 cursor-pointer
          ${isHovered ? 'shadow-2xl scale-105 border-blue-200' : 'shadow-lg hover:shadow-xl'}
          ${!isEnabled ? 'opacity-60' : ''}
          ${config.bgColor}
          border-2
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onConfigure}
      >
        {/* Header com gradiente */}
        <div className={`
          h-2 w-full bg-gradient-to-r 
          ${status === 'active' ? 'from-green-400 to-green-600' :
            status === 'error' ? 'from-red-400 to-red-600' :
            status === 'configured' ? 'from-blue-400 to-blue-600' :
            status === 'testing' ? 'from-yellow-400 to-yellow-600' :
            'from-gray-400 to-gray-600'}
        `} />

        <CardContent className="p-6 space-y-4">
          {/* Header da Stack */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${status === 'active' ? 'bg-green-100 text-green-600' :
                  status === 'error' ? 'bg-red-100 text-red-600' :
                  status === 'configured' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'}
                transition-colors duration-200
              `}>
                {icon}
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900">{name}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <Badge 
                variant="outline" 
                className={`${categoryColors[category] || 'bg-gray-100 text-gray-800'} font-medium`}
              >
                {category}
              </Badge>
              
              <Tooltip>
                <TooltipTrigger>
                  <Badge 
                    variant="outline"
                    className={`${config.color} flex items-center space-x-1 font-medium`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>{config.text}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Status e Informações */}
          <div className="space-y-3">
            {/* Estado da Configuração */}
            <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Configuração</span>
              </div>
              <div className="flex items-center space-x-2">
                {isFullyConfigured ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
                <span className={`text-sm font-medium ${isFullyConfigured ? 'text-green-700' : 'text-amber-700'}`}>
                  {isFullyConfigured ? 'Completa' : 'Incompleta'}
                </span>
              </div>
            </div>

            {/* Conexão e Performance */}
            {lastTestResult && (
              <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  {lastTestResult.success ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-gray-700">Conexão</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {connectionQuality && lastTestResult.success ? (
                    <>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            className={`
                              w-1 h-3 rounded-full
                              ${bar <= connectionQuality.bars ? connectionQuality.color.replace('text-', 'bg-') : 'bg-gray-200'}
                            `}
                          />
                        ))}
                      </div>
                      <span className={`text-xs font-medium ${connectionQuality.color}`}>
                        {connectionQuality.label}
                      </span>
                    </>
                  ) : (
                    <span className={`text-sm font-medium ${lastTestResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {lastTestResult.success ? 'Ativa' : 'Falha'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Último teste */}
            {lastTestedAt && (
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Testado em {formatDate(lastTestedAt)}</span>
              </div>
            )}

            {/* Mensagem de erro */}
            {lastTestResult && !lastTestResult.success && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Erro na Conexão</span>
                </div>
                <p className="text-xs text-red-600 mt-1">{lastTestResult.message}</p>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2 pt-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onConfigure();
              }}
              className={`
                flex-1 h-10 font-medium transition-all duration-200
                ${status === 'active' ? 'bg-green-600 hover:bg-green-700' :
                  status === 'error' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'}
              `}
              disabled={isLoading}
            >
              <Settings className="w-4 h-4 mr-2" />
              {status === 'not_configured' ? 'Configurar' : 'Editar'}
            </Button>

            {isFullyConfigured && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTest();
                    }}
                    disabled={isLoading || status === 'testing'}
                    className="h-10 px-3"
                  >
                    {status === 'testing' ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Testar Conexão</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  disabled={isLoading}
                  className="h-10 px-3"
                >
                  {isEnabled ? <Zap className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-gray-400" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isEnabled ? 'Desabilitar' : 'Habilitar'} Stack</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>

        {/* Overlay de carregamento */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Indicador de hover */}
        <div className={`
          absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px] 
          border-l-transparent transition-all duration-300
          ${isHovered ? 'border-b-blue-500' : 'border-b-transparent'}
        `} />
      </Card>
    </TooltipProvider>
  );
}

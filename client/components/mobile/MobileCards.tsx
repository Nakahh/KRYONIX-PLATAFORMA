import React, { useState } from 'react';
import { 
  MoreVertical, 
  Play, 
  Pause, 
  Settings, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Copy,
  Share
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { useMobileAdvanced } from '../../hooks/use-mobile-advanced';
import { StackConfiguration } from '../../lib/api-client';

interface MobileStackCardProps {
  stack: StackConfiguration;
  onEdit?: (stack: StackConfiguration) => void;
  onTest?: (stack: StackConfiguration) => void;
  onDelete?: (stack: StackConfiguration) => void;
  onToggle?: (stack: StackConfiguration) => void;
  onClick?: (stack: StackConfiguration) => void;
}

const stackIcons: Record<string, string> = {
  evolution_api: '💬',
  n8n: '🔄',
  typebot: '🤖',
  mautic: '📧',
  stripe: '💳',
  openai: '🧠',
  google_ai: '🧠',
  anthropic: '🧠',
  chatwoot: '👥',
  minio: '🗄️',
  redis: '⚡',
  postgresql: '🐘',
  grafana: '📊',
  prometheus: '📈',
  rabbitmq: '🐰',
  supabase: '⚡',
  cloudflare: '☁️',
  aws_s3: '☁️',
};

const stackNames: Record<string, string> = {
  evolution_api: 'Evolution API',
  n8n: 'N8N Workflows',
  typebot: 'Typebot',
  mautic: 'Mautic',
  stripe: 'Stripe',
  openai: 'OpenAI',
  google_ai: 'Google AI',
  anthropic: 'Anthropic',
  chatwoot: 'Chatwoot',
  minio: 'MinIO',
  redis: 'Redis',
  postgresql: 'PostgreSQL',
  grafana: 'Grafana',
  prometheus: 'Prometheus',
  rabbitmq: 'RabbitMQ',
  supabase: 'Supabase',
  cloudflare: 'Cloudflare',
  aws_s3: 'AWS S3',
};

export function MobileStackCard({ 
  stack, 
  onEdit, 
  onTest, 
  onDelete, 
  onToggle, 
  onClick 
}: MobileStackCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { touchCapable } = useMobileAdvanced();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'configured': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'configured': return <Settings className="w-3 h-3" />;
      case 'error': return <AlertCircle className="w-3 h-3" />;
      case 'testing': return <Clock className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'configured': return 'Configurado';
      case 'error': return 'Erro';
      case 'testing': return 'Testando';
      default: return 'Não Configurado';
    }
  };

  const handleCardPress = () => {
    if (touchCapable) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  return (
    <Card 
      className={`
        transition-all duration-200 cursor-pointer overflow-hidden
        ${isPressed ? 'scale-95 shadow-lg' : 'hover:shadow-md active:scale-95'}
        ${stack.isEnabled ? '' : 'opacity-60'}
      `}
      onTouchStart={handleCardPress}
      onClick={() => onClick?.(stack)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Icon */}
            <div className="text-2xl flex-shrink-0">
              {stackIcons[stack.stackType] || '⚙️'}
            </div>
            
            {/* Name and Status */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {stackNames[stack.stackType] || stack.stackType}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="outline"
                  className={`text-xs ${getStatusColor(stack.status)}`}
                >
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(stack.status)}
                    <span>{getStatusText(stack.status)}</span>
                  </div>
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Quick Test Button */}
            {stack.isFullyConfigured && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onTest?.(stack);
                }}
              >
                <Zap className="w-4 h-4" />
              </Button>
            )}

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit?.(stack)}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </DropdownMenuItem>
                
                {stack.isFullyConfigured && (
                  <DropdownMenuItem onClick={() => onTest?.(stack)}>
                    <Zap className="w-4 h-4 mr-2" />
                    Testar Conexão
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => onToggle?.(stack)}>
                  {stack.isEnabled ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Ativar
                    </>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Share className="w-4 h-4 mr-2" />
                  Compartilhar
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => onDelete?.(stack)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Last Activity */}
          {stack.lastUsedAt && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              Usado {new Date(stack.lastUsedAt).toLocaleDateString('pt-BR')}
            </div>
          )}

          {/* Error Alert */}
          {stack.lastTestResult && !stack.lastTestResult.success && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {stack.lastTestResult.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration Status */}
          {!stack.isFullyConfigured && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Configuração incompleta
            </div>
          )}

          {/* Quick Stats */}
          {stack.status === 'active' && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Funcionando</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Online</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Stats Card para métricas importantes
interface MobileStatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
}

export function MobileStatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color, 
  onClick 
}: MobileStatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95 ${
        onClick ? 'hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {value}
            </p>
            {change && (
              <div className={`flex items-center mt-1 text-xs ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>
                  {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
                </span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Action Card para ações rápidas
interface MobileActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
  disabled?: boolean;
}

export function MobileActionCard({ 
  title, 
  description, 
  icon, 
  onClick, 
  badge,
  disabled = false 
}: MobileActionCardProps) {
  return (
    <Card 
      className={`
        transition-all duration-200 cursor-pointer
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:shadow-md active:scale-95 hover:bg-gray-50'
        }
      `}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// List Item para listas longas
interface MobileListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  rightContent?: React.ReactNode;
}

export function MobileListItem({ 
  title, 
  subtitle, 
  icon, 
  badge, 
  onClick, 
  rightContent 
}: MobileListItemProps) {
  return (
    <div 
      className={`
        flex items-center space-x-3 p-4 bg-white border-b border-gray-100
        ${onClick ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : ''}
      `}
      onClick={onClick}
    >
      {icon && (
        <div className="flex-shrink-0">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {title}
          </h3>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate mt-1">
            {subtitle}
          </p>
        )}
      </div>
      
      {rightContent && (
        <div className="flex-shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
}

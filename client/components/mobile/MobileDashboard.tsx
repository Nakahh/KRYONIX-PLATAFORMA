import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Zap,
  BarChart3,
  Users,
  DollarSign,
  Target,
  RefreshCw,
  Grid3X3,
  List,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useDashboard, useTestStackConfiguration } from '../../hooks/use-api';
import { useMobileAdvanced } from '../../hooks/use-mobile-advanced';
import { 
  MobileStackCard, 
  MobileStatsCard, 
  MobileActionCard 
} from './MobileCards';
import { Alert, AlertDescription } from '../ui/alert';
import { Skeleton } from '../ui/skeleton';

export default function MobileDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const navigate = useNavigate();
  const { isMobile, orientation } = useMobileAdvanced();
  
  const { data: dashboardData, isLoading, error, refetch } = useDashboard();
  const testStackMutation = useTestStackConfiguration();

  const handleStackClick = (stackType: string) => {
    navigate(`/dashboard/stacks/${stackType}`);
  };

  const handleTestStack = (stackType: string) => {
    testStackMutation.mutate(stackType);
  };

  const handleRefresh = () => {
    refetch();
  };

  const filteredStacks = dashboardData?.configurations.filter(stack => {
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

    const matchesSearch = stackNames[stack.stackType]
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase()) || false;
    
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'active' && stack.status === 'active') ||
      (selectedCategory === 'configured' && stack.status === 'configured') ||
      (selectedCategory === 'error' && stack.status === 'error') ||
      (selectedCategory === 'not_configured' && !stack.hasConfiguration);

    return matchesSearch && matchesCategory;
  }) || [];

  const quickActions = [
    {
      title: 'Nova Automação',
      description: 'Crie um novo workflow automatizado',
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      onClick: () => navigate('/workflows/new'),
      badge: 'Popular',
    },
    {
      title: 'Conectar WhatsApp',
      description: 'Configure uma nova instância do WhatsApp',
      icon: <Users className="w-5 h-5 text-green-600" />,
      onClick: () => navigate('/settings?tab=whatsapp'),
    },
    {
      title: 'Configurar IA',
      description: 'Adicione modelos de IA ao seu sistema',
      icon: <Activity className="w-5 h-5 text-purple-600" />,
      onClick: () => navigate('/settings?tab=ai'),
    },
    {
      title: 'Ver Analytics',
      description: 'Acompanhe métricas e performance',
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      onClick: () => navigate('/analytics'),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        {/* Stats Loading */}
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>

        {/* Quick Actions Loading */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Stacks Loading */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados. Toque para tentar novamente.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={handleRefresh} 
          className="w-full mt-4"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-8">
      {/* Welcome Section */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Olá! 👋
        </h1>
        <p className="text-gray-600 text-sm">
          Gerencie suas automações de forma simples
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <MobileStatsCard
          title="Total"
          value={dashboardData?.stats.total || 0}
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
          onClick={() => setSelectedCategory('all')}
        />
        <MobileStatsCard
          title="Ativas"
          value={dashboardData?.stats.active || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
          onClick={() => setSelectedCategory('active')}
        />
        <MobileStatsCard
          title="Configuradas"
          value={dashboardData?.stats.configured || 0}
          icon={<Clock className="w-5 h-5" />}
          color="yellow"
          onClick={() => setSelectedCategory('configured')}
        />
        <MobileStatsCard
          title="Com Erro"
          value={dashboardData?.stats.errors || 0}
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
          onClick={() => setSelectedCategory('error')}
        />
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Ações Rápidas
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuickActions(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid gap-3">
            {quickActions.slice(0, 3).map((action, index) => (
              <MobileActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                onClick={action.onClick}
                badge={action.badge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar stacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="configured">Configuradas</SelectItem>
              <SelectItem value="error">Com Erro</SelectItem>
              <SelectItem value="not_configured">Não Configuradas</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="flex-shrink-0"
          >
            {viewMode === 'grid' ? (
              <List className="w-4 h-4" />
            ) : (
              <Grid3X3 className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stacks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Suas Stacks ({filteredStacks.length})
          </h2>
          {selectedCategory !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Ver Todas
            </Button>
          )}
        </div>

        {/* Stacks Grid/List */}
        {filteredStacks.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid gap-3' 
              : 'space-y-2'
            }
          `}>
            {filteredStacks.map((stack) => (
              <MobileStackCard
                key={stack.id}
                stack={stack}
                onClick={() => handleStackClick(stack.stackType)}
                onTest={() => handleTestStack(stack.stackType)}
                onEdit={() => navigate(`/settings?stack=${stack.stackType}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma stack encontrada
              </h3>
              <p className="text-gray-500 mb-4 text-sm">
                {searchTerm ? 
                  `Nenhuma stack corresponde ao termo "${searchTerm}"` : 
                  'Configure suas primeiras stacks para começar'
                }
              </p>
              <Button 
                onClick={() => navigate('/settings')}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Configurar Stack
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Tip */}
      {dashboardData?.stats.errors > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Você tem {dashboardData.stats.errors} stack(s) com erro. 
            Verifique as configurações para garantir o funcionamento correto.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Settings,
  Zap,
  MessageCircle,
  Bot,
  Mail,
  CreditCard,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Activity,
  Cpu,
  Database,
  Globe,
  Brain,
  Workflow,
  RefreshCw,
  DollarSign,
  Target,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Skeleton } from "../components/ui/skeleton";
import KryonixLayout from "../components/layout/KryonixLayout";
import MobileDashboard from "../components/mobile/MobileDashboard";
import { useMobileAdvanced } from "../hooks/use-mobile-advanced";

// Componentes brasileiros com dados reais
import { WhatsAppWidget } from "../components/dashboard/WhatsAppWidget";
import { RevenueWidget } from "../components/dashboard/RevenueWidget";
import { AutomationWidget } from "../components/dashboard/AutomationWidget";

// Hooks para dados reais (sem mock)
import {
  useRealDashboardData,
  useConnectionStatus,
  useRealTimeMetrics,
} from "../hooks/use-real-data-integration";
import {
  useRealStackData,
  useAutoConfigureStacks,
  KRYONIX_STACKS_CONFIG,
} from "../hooks/use-real-stack-data";
import { useBrazilianKPIs } from "../hooks/use-brazilian-kpis";
import {
  formatCurrency,
  formatLargeNumber,
  getGreeting,
  getMotivationalMessage,
  formatPercentage,
  formatRelativeTime,
} from "../lib/brazilian-formatters";
import { QUICK_ACTIONS_BRAZIL } from "../lib/brazilian-constants";

// Widgets em tempo real
import StackHealthWidget from "../components/realtime/StackHealthWidget";
import WhatsAppActivityWidget from "../components/realtime/WhatsAppActivityWidget";

const stackIcons: Record<string, React.ReactNode> = {
  evolution_api: <MessageCircle className="w-5 h-5" />,
  n8n: <Workflow className="w-5 h-5" />,
  typebot: <Bot className="w-5 h-5" />,
  mautic: <Mail className="w-5 h-5" />,
  stripe: <CreditCard className="w-5 h-5" />,
  openai: <Brain className="w-5 h-5" />,
  google_ai: <Brain className="w-5 h-5" />,
  anthropic: <Brain className="w-5 h-5" />,
  chatwoot: <Users className="w-5 h-5" />,
  minio: <Database className="w-5 h-5" />,
  redis: <Database className="w-5 h-5" />,
  postgresql: <Database className="w-5 h-5" />,
  grafana: <BarChart3 className="w-5 h-5" />,
  prometheus: <Activity className="w-5 h-5" />,
  rabbitmq: <Zap className="w-5 h-5" />,
  supabase: <Database className="w-5 h-5" />,
  cloudflare: <Globe className="w-5 h-5" />,
  aws_s3: <Database className="w-5 h-5" />,
  portainer: <Settings className="w-5 h-5" />,
};

const stackNames: Record<string, string> = {
  evolution_api: "WhatsApp Business",
  n8n: "Automações N8N",
  typebot: "Chatbots IA",
  mautic: "Marketing Automation",
  stripe: "Pagamentos",
  openai: "Inteligência Artificial",
  google_ai: "Google AI",
  anthropic: "Claude AI",
  chatwoot: "Central de Atendimento",
  minio: "Armazenamento MinIO",
  redis: "Cache Redis",
  postgresql: "Banco PostgreSQL",
  grafana: "Analytics Grafana",
  prometheus: "Monitoramento",
  rabbitmq: "Filas",
  supabase: "Backend Supabase",
  cloudflare: "CDN",
  aws_s3: "Storage AWS",
  portainer: "Gestão Docker",
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-100 text-green-800 border-green-200";
    case "offline":
      return "bg-red-100 text-red-800 border-red-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "error":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "online":
      return <Wifi className="w-4 h-4" />;
    case "offline":
      return <WifiOff className="w-4 h-4" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4" />;
    case "error":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "online":
      return "Online";
    case "offline":
      return "Offline";
    case "warning":
      return "Atenção";
    case "error":
      return "Erro";
    default:
      return "Desconhecido";
  }
};

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();

  // Hooks para dados reais (eliminando mocks)
  const realDashboard = useRealDashboardData();
  const {
    data: realStacks,
    isLoading: stacksLoading,
    refetch: refetchStacks,
  } = useRealStackData();
  const { data: brazilianKPIs, isLoading: kpiLoading } = useBrazilianKPIs();
  const autoConfigMutation = useAutoConfigureStacks();
  const { isMobile, isTablet } = useMobileAdvanced();

  const isLoading = stacksLoading || kpiLoading || realDashboard.isLoading;

  // Nome do usuário (TODO: pegar do contexto de auth)
  const userName = "Empreendedor";

  const handleStackClick = (stackType: string) => {
    const stackConfig =
      KRYONIX_STACKS_CONFIG[stackType as keyof typeof KRYONIX_STACKS_CONFIG];
    if (stackConfig?.url) {
      // Abre a stack real em nova aba
      window.open(stackConfig.url, "_blank");
    } else {
      navigate(`/dashboard/stacks/${stackType}`);
    }
  };

  const handleAutoSetup = async () => {
    try {
      const essentialStacks = ["evolution_api", "n8n", "typebot", "mautic"];
      await autoConfigMutation.mutateAsync(essentialStacks);
      refetchStacks();
      alert(
        "🎉 Configuração automática concluída! Suas stacks estão sendo configuradas.",
      );
    } catch (error) {
      alert("❌ Erro na configuração automática. Tente novamente.");
    }
  };

  const handleRefresh = () => {
    realDashboard.refetch();
    refetchStacks();
  };

  const filteredStacks =
    realStacks?.filter((stack) => {
      const matchesSearch = stackNames[stack.stackType]
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "online" && stack.status === "online") ||
        (selectedCategory === "offline" && stack.status === "offline") ||
        (selectedCategory === "error" && stack.status === "error") ||
        (selectedCategory === "warning" && stack.status === "warning");

      return matchesSearch && matchesCategory;
    }) || [];

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Use mobile dashboard para mobile e tablet
  if (isMobile || isTablet) {
    return (
      <KryonixLayout>
        <MobileDashboard
          data={{
            configurations: realStacks || [],
            stats: {
              total: realStacks?.length || 0,
              active:
                realStacks?.filter((s) => s.status === "online").length || 0,
              configured: realStacks?.length || 0,
              errors:
                realStacks?.filter((s) => s.status === "error").length || 0,
            },
          }}
          brazilianKPIs={brazilianKPIs}
          isLoading={isLoading}
        />
      </KryonixLayout>
    );
  }

  return (
    <KryonixLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        {/* Header brasileiro com dados do servidor real */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              {getGreeting(userName)}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              {getMotivationalMessage()}
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Activity className="w-3 h-3 mr-1" />
                Servidor: 144.202.90.55
              </Badge>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <Wifi className="w-3 h-3 mr-1" />
                Sistema Online
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              {realStacks?.filter((s) => s.status === "online").length || 0}/
              {realStacks?.length || 0} Stacks Online
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : realDashboard.error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Erro de Conexão com o Servidor
            </h3>
            <p className="text-gray-500 mb-6">
              Não foi possível conectar com o servidor KRYONIX (144.202.90.55)
            </p>
            <Button
              onClick={handleRefresh}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Reconectar
            </Button>
          </div>
        ) : (
          <>
            {/* KPIs Brasileiros com dados reais das stacks */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <WhatsAppWidget />
              <RevenueWidget />
              <AutomationWidget />
            </div>

            {/* Widgets de Monitoramento em Tempo Real */}
            <div className="grid gap-6 lg:grid-cols-2">
              <StackHealthWidget />
              <WhatsAppActivityWidget />
            </div>

            {/* Status das Stacks em Tempo Real */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Status das Stacks (Tempo Real)
                  </span>
                  <Badge variant="outline" className="bg-white">
                    Última atualização: {formatRelativeTime(new Date())}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {realStacks?.slice(0, 12).map((stack) => (
                    <div
                      key={stack.stackType}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${getStatusColor(
                        stack.status,
                      )}`}
                      onClick={() => handleStackClick(stack.stackType)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          {stackIcons[stack.stackType]}
                          {getStatusIcon(stack.status)}
                        </div>
                        <span className="text-xs font-medium">
                          {stack.responseTime}ms
                        </span>
                      </div>
                      <div className="text-xs font-medium truncate">
                        {stackNames[stack.stackType] || stack.stackType}
                      </div>
                      <div className="text-xs opacity-75">
                        {getStatusText(stack.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas para Empreendedores Brasileiros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Ações Rápidas para seu Negócio
                </CardTitle>
                <CardDescription>
                  Acesse rapidamente as ferramentas configuradas no seu servidor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {QUICK_ACTIONS_BRAZIL.slice(0, 6).map((action) => {
                    const relatedStack = realStacks?.find(
                      (s) =>
                        action.id.includes(s.stackType) ||
                        (action.id === "whatsapp_business" &&
                          s.stackType === "evolution_api") ||
                        (action.id === "automation_setup" &&
                          s.stackType === "n8n") ||
                        (action.id === "chatbot_create" &&
                          s.stackType === "typebot"),
                    );

                    return (
                      <Button
                        key={action.id}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow hover:border-emerald-200"
                        onClick={() => {
                          if (action.id === "whatsapp_business") {
                            window.open("https://api.kryonix.com.br", "_blank");
                          } else if (action.id === "automation_setup") {
                            window.open("https://n8n.kryonix.com.br", "_blank");
                          } else if (action.id === "chatbot_create") {
                            window.open(
                              "https://typebot.kryonix.com.br",
                              "_blank",
                            );
                          } else if (action.id === "pix_setup") {
                            navigate("/billing");
                          } else {
                            navigate("/settings");
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2 w-full">
                          <span className="text-lg">{action.icon}</span>
                          <Badge
                            variant={
                              relatedStack?.status === "online"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {relatedStack?.status === "online"
                              ? "Online"
                              : "Configurar"}
                          </Badge>
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">
                            {action.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {action.description}
                          </div>
                          {relatedStack && (
                            <div className="text-xs text-green-600 mt-1">
                              🔗 {relatedStack.url}
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* Botão de configuração automática */}
                {realStacks && realStacks.length < 5 && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-amber-800">
                          🤖 Configuração Automática com IA
                        </h4>
                        <p className="text-sm text-amber-700">
                          Configure automaticamente todas as stacks essenciais
                          com inteligência artificial
                        </p>
                      </div>
                      <Button
                        onClick={handleAutoSetup}
                        disabled={autoConfigMutation.isPending}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        {autoConfigMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Settings className="h-4 w-4 mr-2" />
                        )}
                        Auto-Configurar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seção de Busca e Filtros para Stacks */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Suas Stacks no Servidor
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar stacks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button
                    onClick={() => navigate("/global-settings")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  Todas ({realStacks?.length || 0})
                </Button>
                <Button
                  variant={
                    selectedCategory === "online" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory("online")}
                >
                  Online (
                  {realStacks?.filter((s) => s.status === "online").length || 0}
                  )
                </Button>
                <Button
                  variant={
                    selectedCategory === "offline" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory("offline")}
                >
                  Offline (
                  {realStacks?.filter((s) => s.status === "offline").length ||
                    0}
                  )
                </Button>
                <Button
                  variant={selectedCategory === "error" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("error")}
                >
                  Com Erro (
                  {realStacks?.filter((s) => s.status === "error").length || 0})
                </Button>
              </div>

              {/* Stacks Grid com dados reais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStacks.map((stack) => (
                  <Card
                    key={stack.stackType}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-gray-200 hover:border-emerald-200"
                    onClick={() => handleStackClick(stack.stackType)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              stack.status === "online"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {stackIcons[stack.stackType] || (
                              <Settings className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">
                              {stackNames[stack.stackType] || stack.stackType}
                            </CardTitle>
                            <div className="text-xs text-gray-500 truncate max-w-32">
                              {stack.url}
                            </div>
                          </div>
                        </div>
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
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Resposta:</span>
                          <span className="font-semibold">
                            {stack.responseTime}ms
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            Última verificação:
                          </span>
                          <span className="font-semibold">
                            {formatRelativeTime(stack.lastCheck)}
                          </span>
                        </div>

                        {stack.metrics && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Uptime:</span>
                            <span className="font-semibold text-green-600">
                              {stack.metrics.uptime}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredStacks.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-6xl mb-4">🔧</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm
                      ? `Nenhuma stack encontrada para "${searchTerm}"`
                      : "Configure suas primeiras stacks!"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? "Tente buscar por outro termo ou configure novas stacks"
                      : "Conecte-se às 25 stacks disponíveis no seu servidor KRYONIX"}
                  </p>
                  <Button
                    onClick={() => navigate("/global-settings")}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {searchTerm ? "Configurar Stacks" : "Começar Configuração"}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </KryonixLayout>
  );
}

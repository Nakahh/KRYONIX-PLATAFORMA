import React, { useState, useEffect } from "react";
import KryonixLayout from "../components/layout/KryonixLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
  MessageCircle,
  CreditCard,
  Users,
  Target,
  MapPin,
  Clock,
  Zap,
  Shield,
  Brain,
  Eye,
  Share2,
  Bell,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  brazilianAnalytics,
  BrazilianMetrics,
  BrazilianInsight,
} from "@/services/brazilian-analytics";

interface DateRange {
  from: Date;
  to: Date;
}

export default function AdvancedAnalytics() {
  const [metrics, setMetrics] = useState<BrazilianMetrics | null>(null);
  const [insights, setInsights] = useState<BrazilianInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Cores brasileiras para gráficos
  const brasilColors = {
    primary: "#0ea5e9",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#06b6d4",
    verde: "#00a86b",
    amarelo: "#ffd700",
    azul: "#003f7f",
    laranja: "#ff8c00",
  };

  const colors = [
    brasilColors.primary,
    brasilColors.secondary,
    brasilColors.success,
    brasilColors.warning,
    brasilColors.info,
    brasilColors.verde,
    brasilColors.amarelo,
    brasilColors.azul,
    brasilColors.laranja,
  ];

  useEffect(() => {
    loadAnalyticsData();

    // Auto-refresh a cada 5 minutos
    const interval = setInterval(loadAnalyticsData, 300000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await brazilianAnalytics.coletarMetricasTempoReal();
      const insightsData = await brazilianAnalytics.gerarInsights(data);

      setMetrics(data);
      setInsights(insightsData);
    } catch (error) {
      console.error("Erro ao carregar analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (formato: "csv" | "excel" | "json" | "pdf") => {
    if (!metrics) return;

    try {
      const blob = await brazilianAnalytics.exportarDados(formato, metrics);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kryonix-analytics-${format(new Date(), "dd-MM-yyyy")}.${formato}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Dados para gráficos
  const whatsappData = metrics
    ? [
        {
          name: "Enviadas",
          value: metrics.whatsapp.mensagensEnviadas,
          color: brasilColors.primary,
        },
        {
          name: "Recebidas",
          value: metrics.whatsapp.mensagensRecebidas,
          color: brasilColors.success,
        },
        {
          name: "Visualizadas",
          value: metrics.whatsapp.statusVisualizados,
          color: brasilColors.info,
        },
      ]
    : [];

  const paymentData = metrics
    ? [
        {
          name: "PIX",
          value: metrics.vendas.conversaoPIX,
          color: brasilColors.verde,
        },
        {
          name: "Cartão",
          value: metrics.vendas.conversaoCartao,
          color: brasilColors.azul,
        },
        {
          name: "Boleto",
          value: metrics.vendas.conversaoBoleto,
          color: brasilColors.warning,
        },
      ]
    : [];

  const regionData = metrics
    ? Object.entries(metrics.leads.leadsPorRegiao).map(([regiao, value]) => ({
        name: regiao,
        value,
        color:
          colors[
            Object.keys(metrics.leads.leadsPorRegiao).indexOf(regiao) %
              colors.length
          ],
      }))
    : [];

  const performanceData = metrics
    ? [
        {
          name: "CPU",
          value: metrics.performance.usoCPUPercentual,
          color: brasilColors.danger,
        },
        {
          name: "Memória",
          value: metrics.performance.usoMemoriaPercentual,
          color: brasilColors.warning,
        },
        {
          name: "Uptime",
          value: metrics.performance.uptimePercentual,
          color: brasilColors.success,
        },
      ]
    : [];

  const horariosData = metrics
    ? metrics.geograficas.horariosPicko.map((item) => ({
        hora: `${item.hora}h`,
        atividade: item.atividade,
      }))
    : [];

  if (!metrics) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Carregando Analytics...</p>
          <p className="text-muted-foreground">
            Coletando métricas em tempo real
          </p>
        </div>
      </div>
    );
  }

  return (
    <KryonixLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span>Analytics Avançado KRYONIX</span>
            </h1>
            <p className="text-muted-foreground">
              Inteligência empresarial com foco no mercado brasileiro
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>IA Brasileira</span>
            </Badge>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="12m">12 meses</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={loadAnalyticsData} disabled={isLoading} size="sm">
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>

            <Button
              onClick={() => handleExport("json")}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Receita Total</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(metrics.vendas.receitaTotalBRL)}
                  </p>
                  <p className="text-sm text-blue-100">
                    Ticket médio: {formatCurrency(metrics.vendas.ticketMedio)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">WhatsApp</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(metrics.whatsapp.mensagensEnviadas)}
                  </p>
                  <p className="text-sm text-green-100">
                    Taxa resposta:{" "}
                    {formatPercentage(metrics.whatsapp.taxaResposta)}
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Automação</p>
                  <p className="text-2xl font-bold">
                    {metrics.automacao.economiaTempoHoras}h
                  </p>
                  <p className="text-sm text-purple-100">
                    Economizadas este mês
                  </p>
                </div>
                <Zap className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">PIX Conversão</p>
                  <p className="text-2xl font-bold">
                    {formatPercentage(metrics.vendas.conversaoPIX)}
                  </p>
                  <p className="text-sm text-orange-100">
                    Método preferido no Brasil
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights IA */}
        {insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Insights Inteligentes</span>
                <Badge variant="secondary">IA Brasileira</Badge>
              </CardTitle>
              <CardDescription>
                Análises automáticas baseadas em dados brasileiros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={insight.id}
                    className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg"
                  >
                    <div className="mt-0.5">
                      {insight.tipo === "oportunidade" && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                      {insight.tipo === "problema" && (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      {insight.tipo === "tendencia" && (
                        <Eye className="h-4 w-4 text-blue-500" />
                      )}
                      {insight.tipo === "recomendacao" && (
                        <Brain className="h-4 w-4 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{insight.titulo}</h4>
                        <Badge
                          variant={
                            insight.impacto === "critico"
                              ? "destructive"
                              : insight.impacto === "alto"
                                ? "secondary"
                                : insight.impacto === "medio"
                                  ? "outline"
                                  : "default"
                          }
                        >
                          {insight.impacto}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.descricao}
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        {insight.acaoRecomendada}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Confiança
                      </div>
                      <div className="text-sm font-bold">
                        {insight.confianca}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs de Analytics */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="sales">Vendas & PIX</TabsTrigger>
            <TabsTrigger value="geography">Geografia</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Métodos de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pagamento Brasileiros</CardTitle>
                  <CardDescription>
                    Distribuição por tipo de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Atividade por Hora */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade por Horário</CardTitle>
                  <CardDescription>
                    Picos de atividade no fuso brasileiro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={horariosData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hora" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="atividade"
                        stroke={brasilColors.primary}
                        fill={brasilColors.primary}
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Métricas WhatsApp */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance WhatsApp Business</CardTitle>
                  <CardDescription>
                    Métricas de engajamento e comunicação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={whatsappData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => formatNumber(Number(value))}
                      />
                      <Bar dataKey="value" fill={brasilColors.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Estatísticas WhatsApp */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Detalhadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Resposta</span>
                      <span className="font-bold">
                        {formatPercentage(metrics.whatsapp.taxaResposta)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.whatsapp.taxaResposta}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Tempo Médio de Resposta</span>
                      <span className="font-bold">
                        {metrics.whatsapp.tempoMedioResposta} min
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Grupos Ativos</span>
                      <span className="font-bold">
                        {formatNumber(metrics.whatsapp.gruposAtivos)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Mídia Compartilhada</span>
                      <span className="font-bold">
                        {formatNumber(metrics.whatsapp.mediaCompartilhada)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vendas PIX */}
              <Card>
                <CardHeader>
                  <CardTitle>Destaque PIX no Brasil</CardTitle>
                  <CardDescription>
                    Revolução dos pagamentos instantâneos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {formatPercentage(metrics.vendas.conversaoPIX)}
                      </div>
                      <p className="text-muted-foreground">
                        das transações são via PIX
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold">
                          {formatNumber(metrics.vendas.totalVendas)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Vendas Totais
                        </div>
                      </div>
                      <div>
                        <div className="text-xl font-bold">
                          {formatCurrency(metrics.vendas.ticketMedio)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Ticket Médio
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparativo de Pagamentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparativo de Métodos</CardTitle>
                  <CardDescription>
                    Performance por tipo de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">PIX</span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={metrics.vendas.conversaoPIX}
                          className="w-20"
                        />
                        <span className="text-sm font-bold">
                          {formatPercentage(metrics.vendas.conversaoPIX)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Cartão</span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={metrics.vendas.conversaoCartao}
                          className="w-20"
                        />
                        <span className="text-sm font-bold">
                          {formatPercentage(metrics.vendas.conversaoCartao)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Boleto</span>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={metrics.vendas.conversaoBoleto}
                          className="w-20"
                        />
                        <span className="text-sm font-bold">
                          {formatPercentage(metrics.vendas.conversaoBoleto)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição Regional */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Região</CardTitle>
                  <CardDescription>Leads por região brasileira</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={regionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={brasilColors.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cidades Mais Ativas */}
              <Card>
                <CardHeader>
                  <CardTitle>Cidades Mais Ativas</CardTitle>
                  <CardDescription>
                    Top 5 cidades por volume de usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.geograficas.cidadesMaisAtivas
                      .slice(0, 5)
                      .map((cidade, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {cidade.cidade}, {cidade.estado}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {formatNumber(cidade.usuarios)}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance do Sistema</CardTitle>
                  <CardDescription>Monitoramento em tempo real</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      data={performanceData}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="#8884d8"
                      />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Métricas Detalhadas */}
              <Card>
                <CardHeader>
                  <CardTitle>Métricas Técnicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span className="font-bold text-green-600">
                        {formatPercentage(metrics.performance.uptimePercentual)}
                      </span>
                    </div>
                    <Progress
                      value={metrics.performance.uptimePercentual}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Tempo de Resposta</span>
                      <span className="font-bold">
                        {metrics.performance.tempoRespostaMedio}ms
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Requests/min</span>
                      <span className="font-bold">
                        {formatNumber(metrics.performance.requestsPorMinuto)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Erro</span>
                      <span className="font-bold text-red-600">
                        {formatPercentage(metrics.performance.errosPorcentual)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LGPD Compliance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>LGPD</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        100%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Compliance
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Consentimentos</span>
                        <span className="font-bold">
                          {formatNumber(metrics.compliance.lgpdConsentimentos)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Solicitações</span>
                        <span className="font-bold">
                          {formatNumber(metrics.compliance.lgpdSolicitacoes)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Segurança */}
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Certificados SSL</span>
                      <Badge variant="default">
                        {metrics.compliance.certificadosSSLValidos}/25
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Backups</span>
                      <Badge variant="default">
                        {metrics.compliance.backupsRealizados}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Incidentes</span>
                      <Badge
                        variant={
                          metrics.compliance.incidentesSeguranca === 0
                            ? "default"
                            : "destructive"
                        }
                      >
                        {metrics.compliance.incidentesSeguranca}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Auditorias */}
              <Card>
                <CardHeader>
                  <CardTitle>Auditorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {metrics.compliance.auditoriasRealizadas}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Este mês
                      </div>
                    </div>
                    <div className="text-sm text-center text-green-600">
                      Todas aprovadas ✓
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </KryonixLayout>
  );
}

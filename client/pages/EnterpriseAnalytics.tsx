import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KryonixLayout } from "@/components/layout/KryonixLayout";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Activity,
  Shield,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Crown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  Clock,
  Zap,
  Trophy,
  Star,
} from "lucide-react";
import { useEnterpriseData } from "@/hooks/use-enterprise-data";
import { formatCurrency, formatPercentage } from "@/lib/brazilian-formatters";

interface AnalyticsMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  activePartners: number;
  partnerGrowth: number;
  totalUsers: number;
  userGrowth: number;
  averageRevenuePer: number;
  churnRate: number;
  satisfactionScore: number;
  uptimeScore: number;
}

interface PartnerAnalytics {
  id: string;
  name: string;
  revenue: number;
  growth: number;
  users: number;
  plan: string;
  region: string;
  satisfaction: number;
  lastActivity: string;
  status: "active" | "warning" | "critical";
}

interface RegionalData {
  region: string;
  partners: number;
  revenue: number;
  growth: number;
  marketShare: number;
}

const EnterpriseAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const { analytics, isLoading } = useEnterpriseData();

  // Dados simulados para demonstração
  const [metrics] = useState<AnalyticsMetrics>({
    totalRevenue: 2487650,
    revenueGrowth: 23.4,
    activePartners: 156,
    partnerGrowth: 12.8,
    totalUsers: 45870,
    userGrowth: 18.5,
    averageRevenuePer: 15945,
    churnRate: 3.2,
    satisfactionScore: 4.7,
    uptimeScore: 99.8,
  });

  const [topPartners] = useState<PartnerAnalytics[]>([
    {
      id: "1",
      name: "Rede Nacional SA",
      revenue: 234500,
      growth: 34.2,
      users: 5420,
      plan: "Enterprise Pro",
      region: "São Paulo",
      satisfaction: 4.9,
      lastActivity: "2 horas atrás",
      status: "active",
    },
    {
      id: "2",
      name: "Franquia Brasil Ltda",
      revenue: 189300,
      growth: 28.7,
      users: 3890,
      plan: "Enterprise",
      region: "Rio de Janeiro",
      satisfaction: 4.6,
      lastActivity: "4 horas atrás",
      status: "active",
    },
    {
      id: "3",
      name: "Corporação Nordeste",
      revenue: 156700,
      growth: -5.3,
      users: 2340,
      plan: "Enterprise",
      region: "Fortaleza",
      satisfaction: 4.1,
      lastActivity: "1 dia atrás",
      status: "warning",
    },
    {
      id: "4",
      name: "Grupo Sul Unidos",
      revenue: 134200,
      growth: 45.8,
      users: 1890,
      plan: "Enterprise Pro",
      region: "Porto Alegre",
      satisfaction: 4.8,
      lastActivity: "30 min atrás",
      status: "active",
    },
    {
      id: "5",
      name: "Centro-Oeste Automation",
      revenue: 98500,
      growth: 12.4,
      users: 1560,
      plan: "Enterprise",
      region: "Brasília",
      satisfaction: 4.3,
      lastActivity: "6 horas atrás",
      status: "active",
    },
  ]);

  const [regionalData] = useState<RegionalData[]>([
    {
      region: "Sudeste",
      partners: 67,
      revenue: 1243500,
      growth: 28.4,
      marketShare: 45.2,
    },
    {
      region: "Sul",
      partners: 34,
      revenue: 672100,
      growth: 32.1,
      marketShare: 24.1,
    },
    {
      region: "Nordeste",
      partners: 28,
      revenue: 445800,
      growth: 15.7,
      marketShare: 16.8,
    },
    {
      region: "Centro-Oeste",
      partners: 18,
      revenue: 234700,
      growth: 22.3,
      marketShare: 8.9,
    },
    {
      region: "Norte",
      partners: 9,
      revenue: 156300,
      growth: 41.2,
      marketShare: 5.0,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTrendIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const exportReport = () => {
    const reportData = {
      period: selectedPeriod,
      metrics,
      topPartners,
      regionalData,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enterprise-analytics-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <KryonixLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              Analytics Enterprise
            </h1>
            <p className="text-muted-foreground">
              Análises avançadas para parceiros e corporações
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 dias</SelectItem>
                    <SelectItem value="30d">30 dias</SelectItem>
                    <SelectItem value="90d">90 dias</SelectItem>
                    <SelectItem value="1y">1 ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Região</label>
                <Select
                  value={selectedRegion}
                  onValueChange={setSelectedRegion}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="sudeste">Sudeste</SelectItem>
                    <SelectItem value="sul">Sul</SelectItem>
                    <SelectItem value="nordeste">Nordeste</SelectItem>
                    <SelectItem value="centro-oeste">Centro-Oeste</SelectItem>
                    <SelectItem value="norte">Norte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Métrica</label>
                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="users">Usuários</SelectItem>
                    <SelectItem value="growth">Crescimento</SelectItem>
                    <SelectItem value="satisfaction">Satisfação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="partners">Parceiros</TabsTrigger>
            <TabsTrigger value="regions">Regiões</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* KPIs Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Receita Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(metrics.totalRevenue)}
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      {getTrendIcon(metrics.revenueGrowth)}+
                      {formatPercentage(metrics.revenueGrowth)} vs mês anterior
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Parceiros Ativos
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.activePartners}
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      {getTrendIcon(metrics.partnerGrowth)}+
                      {formatPercentage(metrics.partnerGrowth)} vs mês anterior
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Usuários Totais
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.totalUsers.toLocaleString("pt-BR")}
                    </div>
                    <div className="flex items-center text-xs text-green-600">
                      {getTrendIcon(metrics.userGrowth)}+
                      {formatPercentage(metrics.userGrowth)} vs mês anterior
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(metrics.averageRevenuePer)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Receita média por parceiro
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Métricas de Qualidade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Satisfação dos Parceiros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {metrics.satisfactionScore}/5
                    </div>
                    <Progress
                      value={metrics.satisfactionScore * 20}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Baseado em avaliações dos últimos 30 dias
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      Uptime da Plataforma
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {metrics.uptimeScore}%
                    </div>
                    <Progress value={metrics.uptimeScore} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Disponibilidade dos últimos 30 dias
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Taxa de Churn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {metrics.churnRate}%
                    </div>
                    <Progress
                      value={metrics.churnRate}
                      className="mt-2 bg-red-100"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Cancelamentos mensais
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Tendências */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Tendências de Crescimento
                  </CardTitle>
                  <CardDescription>
                    Evolução das principais métricas nos últimos meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Gráfico de tendências seria renderizado aqui
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Integração com Chart.js ou Recharts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Parceiros */}
          <TabsContent value="partners">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Top 5 Parceiros Enterprise
                  </CardTitle>
                  <CardDescription>
                    Parceiros com maior performance e receita
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPartners.map((partner, index) => (
                      <div
                        key={partner.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Trophy
                              className={`h-5 w-5 ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-amber-600" : "text-muted-foreground"}`}
                            />
                            <span className="font-semibold">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{partner.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {partner.region}
                              </span>
                              <span className="flex items-center gap-1">
                                <Crown className="h-3 w-3" />
                                {partner.plan}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {partner.lastActivity}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(partner.revenue)}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              {getTrendIcon(partner.growth)}
                              <span
                                className={
                                  partner.growth > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {formatPercentage(Math.abs(partner.growth))}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-medium">
                              {partner.users.toLocaleString("pt-BR")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              usuários
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">
                                {partner.satisfaction}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              satisfação
                            </div>
                          </div>

                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(partner.status)}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Plano</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Enterprise Pro</span>
                        <span className="font-semibold">62</span>
                      </div>
                      <Progress value={62} />

                      <div className="flex justify-between">
                        <span>Enterprise</span>
                        <span className="font-semibold">74</span>
                      </div>
                      <Progress value={74} />

                      <div className="flex justify-between">
                        <span>Enterprise Lite</span>
                        <span className="font-semibold">20</span>
                      </div>
                      <Progress value={20} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status dos Parceiros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span>Ativos</span>
                        </div>
                        <span className="font-semibold">142</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span>Atenção</span>
                        </div>
                        <span className="font-semibold">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span>Crítico</span>
                        </div>
                        <span className="font-semibold">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Novos Parceiros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      +{metrics.partnerGrowth}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Nos últimos 30 dias
                    </div>
                    <Button variant="outline" className="w-full">
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Regiões */}
          <TabsContent value="regions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Análise Regional - Brasil
                  </CardTitle>
                  <CardDescription>
                    Performance e distribuição por região
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {regionalData.map((region) => (
                      <Card key={region.region} className="p-4">
                        <div className="text-center">
                          <h3 className="font-semibold text-lg">
                            {region.region}
                          </h3>
                          <div className="mt-2 space-y-2">
                            <div>
                              <div className="text-2xl font-bold">
                                {region.partners}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                parceiros
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold">
                                {formatCurrency(region.revenue)}
                              </div>
                              <div className="flex items-center justify-center gap-1 text-sm">
                                {getTrendIcon(region.growth)}
                                <span className="text-green-600">
                                  +{formatPercentage(region.growth)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Progress
                                value={region.marketShare}
                                className="mt-2"
                              />
                              <div className="text-sm text-muted-foreground mt-1">
                                {formatPercentage(region.marketShare)} market
                                share
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mapa de Calor - Receita</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Mapa interativo do Brasil
                        </p>
                        <p className="text-sm text-muted-foreground">
                          com dados de receita por estado
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Cidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { city: "São Paulo", partners: 45, revenue: 892300 },
                        {
                          city: "Rio de Janeiro",
                          partners: 22,
                          revenue: 451200,
                        },
                        {
                          city: "Belo Horizonte",
                          partners: 18,
                          revenue: 334700,
                        },
                        { city: "Porto Alegre", partners: 16, revenue: 298500 },
                        { city: "Brasília", partners: 14, revenue: 267800 },
                      ].map((city, index) => (
                        <div
                          key={city.city}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="font-medium">{city.city}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(city.revenue)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {city.partners} parceiros
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Velocidade Média
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.2s</div>
                    <div className="text-sm text-muted-foreground">
                      tempo de resposta
                    </div>
                    <Progress value={88} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-blue-500" />
                      Mobile Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78%</div>
                    <div className="text-sm text-muted-foreground">
                      usuários mobile
                    </div>
                    <Progress value={78} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-green-500" />
                      Desktop Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">22%</div>
                    <div className="text-sm text-muted-foreground">
                      usuários desktop
                    </div>
                    <Progress value={22} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-500" />
                      Taxa de Erro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0.02%</div>
                    <div className="text-sm text-muted-foreground">
                      erros por request
                    </div>
                    <Progress value={2} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Horários de Pico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                      <div className="text-center">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Gráfico de uso por horário
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Picos: 9h-11h e 14h-17h
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status dos Serviços</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        {
                          service: "API Gateway",
                          status: "operational",
                          uptime: 99.9,
                        },
                        {
                          service: "WhatsApp Integration",
                          status: "operational",
                          uptime: 99.7,
                        },
                        {
                          service: "N8N Workflows",
                          status: "operational",
                          uptime: 99.8,
                        },
                        {
                          service: "Typebot Chatbots",
                          status: "operational",
                          uptime: 99.6,
                        },
                        {
                          service: "Analytics Engine",
                          status: "operational",
                          uptime: 99.9,
                        },
                      ].map((service) => (
                        <div
                          key={service.service}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span>{service.service}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {service.uptime}%
                            </div>
                            <div className="text-sm text-green-600">
                              Operacional
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>Insight: Crescimento Acelerado</AlertTitle>
                  <AlertDescription>
                    A região Sul apresenta o maior crescimento (32.1%) nos
                    últimos 30 dias. Recomenda-se aumentar investimento em
                    marketing nesta região.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertTitle>Mobile First Confirmado</AlertTitle>
                  <AlertDescription>
                    78% dos usuários enterprise acessam via mobile. A estratégia
                    mobile-first está alinhada com o comportamento real dos
                    usuários.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Crown className="h-4 w-4" />
                  <AlertTitle>Oportunidade de Upselling</AlertTitle>
                  <AlertDescription>
                    12 parceiros Enterprise têm potencial para upgrade para
                    Enterprise Pro baseado no uso e crescimento atual.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Atenção: Churn Nordeste</AlertTitle>
                  <AlertDescription>
                    Corporação Nordeste apresenta crescimento negativo (-5.3%).
                    Recomenda-se ação imediata de customer success.
                  </AlertDescription>
                </Alert>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações IA</CardTitle>
                  <CardDescription>
                    Insights gerados por inteligência artificial baseados nos
                    dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold">Expansão Geográfica</h4>
                      <p className="text-sm text-muted-foreground">
                        Baseado no sucesso no Sul e Sudeste, recomenda-se foco
                        em cidades de médio porte no interior de SP e RS para
                        expansão no próximo trimestre.
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold">Otimização de Produto</h4>
                      <p className="text-sm text-muted-foreground">
                        Dados mostram que funcionalidades de automação são 40%
                        mais utilizadas em mobile. Priorizar melhorias na
                        experiência mobile de automação.
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold">Customer Success</h4>
                      <p className="text-sm text-muted-foreground">
                        Parceiros com satisfação acima de 4.5 tendem a renovar
                        por 2+ anos. Implementar programa de fidelidade para
                        este segmento.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Ações Sugeridas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "Contatar Corporação Nordeste para reunião de alinhamento",
                      "Preparar proposta de upgrade para 12 parceiros identificados",
                      "Lançar campanha regional focada no Sul e Sudeste",
                      "Implementar melhorias mobile na área de automação",
                      "Criar programa de fidelidade para parceiros premium",
                    ].map((action, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </KryonixLayout>
  );
};

export default EnterpriseAnalytics;

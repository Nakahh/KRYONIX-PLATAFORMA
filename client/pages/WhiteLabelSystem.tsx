import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Palette,
  Users,
  BarChart3,
  Eye,
  Settings,
  Zap,
  Building2,
  Globe,
  Rocket,
  Shield,
  Star,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Importar componentes do White Label
import {
  useWhiteLabel,
  useIsWhiteLabel,
} from "@/components/white-label/WhiteLabelProvider";
import {
  BrandedHeader,
  BrandedCard,
  BrandedButton,
  BrandedBadge,
} from "@/components/white-label/BrandedComponents";

// Import dos componentes específicos (serão criados)
// import CustomizationEditor from '@/components/white-label/CustomizationEditor';
// import PartnerOnboarding from '@/components/white-label/PartnerOnboarding';
// import ManagementDashboard from '@/components/white-label/ManagementDashboard';
// import ClientExperience from '@/components/white-label/ClientExperience';
// import VitorDashboard from '@/components/white-label/VitorDashboard';

interface WhiteLabelStats {
  totalPartners: number;
  activePartners: number;
  monthlyRevenue: number;
  totalUsers: number;
  growthRate: number;
  satisfaction: number;
}

const mockStats: WhiteLabelStats = {
  totalPartners: 47,
  activePartners: 43,
  monthlyRevenue: 42840,
  totalUsers: 3248,
  growthRate: 18.5,
  satisfaction: 98.5,
};

const features = [
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Editor Visual Completo",
    description: "Customize cores, logos, fontes e layout em tempo real",
    status: "active",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Onboarding Automatizado",
    description: "Setup completo de parceiros em 5 minutos",
    status: "active",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Domínios Personalizados",
    description: "SSL automático e DNS configurado automaticamente",
    status: "active",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Gestão de Parceiros",
    description: "Dashboard completo para gerenciar toda a rede",
    status: "active",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Isolamento Completo",
    description: "Dados e configurações 100% isolados por tenant",
    status: "active",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Performance Otimizada",
    description: "CDN global e cache inteligente por parceiro",
    status: "active",
  },
];

export default function WhiteLabelSystem() {
  const [activeTab, setActiveTab] = useState("overview");
  const { config, isLoading } = useWhiteLabel();
  const isWhiteLabel = useIsWhiteLabel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            Carregando sistema White Label...
          </p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <BrandedHeader
        title="Sistema White Label KRYONIX"
        subtitle="Gerencie sua rede de parceiros e revendedores com autonomia total"
        gradient
        action={
          <div className="flex gap-2">
            <BrandedBadge variant="outline">Enterprise</BrandedBadge>
            <BrandedBadge variant="primary">v2.0</BrandedBadge>
          </div>
        }
      />

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BrandedCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Parceiros Totais
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalPartners}</div>
            <p className="text-xs text-muted-foreground">+8 este mês</p>
          </CardContent>
        </BrandedCard>

        <BrandedCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {mockStats.monthlyRevenue.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">
              +{mockStats.growthRate}% este mês
            </p>
          </CardContent>
        </BrandedCard>

        <BrandedCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStats.totalUsers.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground">+425 esta semana</p>
          </CardContent>
        </BrandedCard>

        <BrandedCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.satisfaction}%</div>
            <p className="text-xs text-muted-foreground">+2.1% este mês</p>
          </CardContent>
        </BrandedCard>
      </div>

      {/* Features do sistema */}
      <BrandedCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Recursos Avançados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="text-primary">{feature.icon}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{feature.title}</h4>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </BrandedCard>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BrandedButton
          variant="primary"
          className="h-20 flex-col gap-2"
          onClick={() => setActiveTab("editor")}
        >
          <Palette className="h-6 w-6" />
          Editor Visual
        </BrandedButton>

        <BrandedButton
          variant="secondary"
          className="h-20 flex-col gap-2"
          onClick={() => setActiveTab("onboarding")}
        >
          <Users className="h-6 w-6" />
          Novo Parceiro
        </BrandedButton>

        <BrandedButton
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => setActiveTab("management")}
        >
          <BarChart3 className="h-6 w-6" />
          Gerenciar
        </BrandedButton>

        <BrandedButton
          variant="outline"
          className="h-20 flex-col gap-2"
          onClick={() => setActiveTab("experience")}
        >
          <Eye className="h-6 w-6" />
          Preview
        </BrandedButton>
      </div>
    </div>
  );

  const renderComingSoon = (title: string, description: string) => (
    <BrandedCard className="text-center py-12">
      <CardContent className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <Settings className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        <BrandedBadge variant="outline">Em Desenvolvimento</BrandedBadge>
      </CardContent>
    </BrandedCard>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Navigation */}
          <div className="border rounded-lg p-1">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Editor</span>
              </TabsTrigger>
              <TabsTrigger
                value="onboarding"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Onboarding</span>
              </TabsTrigger>
              <TabsTrigger
                value="management"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Gestão</span>
              </TabsTrigger>
              <TabsTrigger
                value="experience"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </TabsTrigger>
              <TabsTrigger value="vitor" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">CEO</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <TabsContent value="overview" className="space-y-6">
              {renderOverview()}
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              {renderComingSoon(
                "Editor Visual de Branding",
                "Ferramenta completa para customizar a identidade visual dos seus parceiros em tempo real.",
              )}
            </TabsContent>

            <TabsContent value="onboarding" className="space-y-6">
              {renderComingSoon(
                "Sistema de Onboarding",
                "Wizard intuitivo para configurar novos parceiros em poucos minutos com total autonomia.",
              )}
            </TabsContent>

            <TabsContent value="management" className="space-y-6">
              {renderComingSoon(
                "Dashboard de Gestão",
                "Painel completo para gerenciar todos os parceiros, métricas e configurações da rede.",
              )}
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              {renderComingSoon(
                "Preview da Experiência",
                "Visualize em tempo real como ficará a interface personalizada dos seus clientes.",
              )}
            </TabsContent>

            <TabsContent value="vitor" className="space-y-6">
              {renderComingSoon(
                "Dashboard Executivo",
                "Painel simplificado para Vitor acompanhar todo o negócio de forma visual e intuitiva.",
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

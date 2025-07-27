import React, { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Settings,
  Building,
  Palette,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Wand2,
  Download,
  Upload,
  RefreshCw,
  Server,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StackConfigManager from "../components/stack-config/StackConfigManager";

/**
 * Página de Configurações Globais - Hub central para configurar toda a plataforma
 * KRYONIX - Sistema unificado para empreendedores brasileiros
 */

interface GlobalSettingsSection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConfigured: boolean;
  priority: "essential" | "recommended" | "optional";
  route: string;
  progress: number;
}

export default function GlobalSettings() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections: GlobalSettingsSection[] = [
    {
      id: "setup-wizard",
      name: "Configuração Inicial",
      description: "Configure sua plataforma em 5 minutos com assistente IA",
      icon: <Wand2 className="w-6 h-6" />,
      isConfigured: false,
      priority: "essential",
      route: "/global-settings/wizard",
      progress: 20,
    },
    {
      id: "business-info",
      name: "Dados da Empresa",
      description: "CNPJ, endereço, informações fiscais brasileiras",
      icon: <Building className="w-6 h-6" />,
      isConfigured: true,
      priority: "essential",
      route: "/global-settings/business",
      progress: 100,
    },
    {
      id: "branding",
      name: "Identidade Visual",
      description: "Logo, cores, domínio personalizado white-label",
      icon: <Palette className="w-6 h-6" />,
      isConfigured: false,
      priority: "essential",
      route: "/global-settings/branding",
      progress: 30,
    },
    {
      id: "integrations",
      name: "Integrações Essenciais",
      description: "WhatsApp, PIX, Evolution API, N8N, Typebot",
      icon: <Zap className="w-6 h-6" />,
      isConfigured: true,
      priority: "essential",
      route: "/settings",
      progress: 85,
    },
    {
      id: "stack-management",
      name: "Gestão de Stacks",
      description: "Configure todas as 25 stacks do servidor 144.202.90.55",
      icon: <Server className="w-6 h-6" />,
      isConfigured: true,
      priority: "essential",
      route: "/global-settings/stacks",
      progress: 100,
    },
    {
      id: "localization",
      name: "Configurações Regionais",
      description: "Timezone, moeda, formatação brasileira",
      icon: <Globe className="w-6 h-6" />,
      isConfigured: true,
      priority: "recommended",
      route: "/global-settings/localization",
      progress: 95,
    },
    {
      id: "security",
      name: "Segurança Avançada",
      description: "2FA, LGPD compliance, logs de auditoria",
      icon: <Shield className="w-6 h-6" />,
      isConfigured: false,
      priority: "recommended",
      route: "/global-settings/security",
      progress: 60,
    },
  ];

  const essentialSections = sections.filter((s) => s.priority === "essential");
  const recommendedSections = sections.filter(
    (s) => s.priority === "recommended",
  );
  const optionalSections = sections.filter((s) => s.priority === "optional");

  const overallProgress = Math.round(
    sections.reduce((acc, section) => acc + section.progress, 0) /
      sections.length,
  );

  const configuredCount = sections.filter((s) => s.isConfigured).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="h-8 w-8 text-emerald-600 mr-3" />
              Configurações Globais
            </h1>
            <p className="text-gray-600 mt-2">
              Centro de controle da sua plataforma KRYONIX
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Configurações
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar Backup
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-emerald-700">
                Progresso da Configuração
              </span>
              <Badge
                variant={overallProgress >= 80 ? "default" : "secondary"}
                className={
                  overallProgress >= 80 ? "bg-emerald-100 text-emerald-800" : ""
                }
              >
                {overallProgress}% completo
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={overallProgress} className="h-3" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {configuredCount}/{sections.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Seções Configuradas
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {essentialSections.filter((s) => s.isConfigured).length}/
                    {essentialSections.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    Essenciais Prontas
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {overallProgress >= 80 ? "✅" : "⚠️"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {overallProgress >= 80
                      ? "Pronto para Produção"
                      : "Configuração Pendente"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações Essenciais */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              🔴 Configurações Essenciais
            </h2>
            <Badge variant="destructive" className="px-3 py-1">
              Obrigatórias
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {essentialSections.map((section) => (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  section.isConfigured
                    ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                    : "border-red-200 bg-gradient-to-br from-red-50 to-orange-50 hover:border-red-300"
                }`}
                onClick={() => {
                  if (section.route.startsWith("/global-settings/")) {
                    // Rotas internas do sistema de configurações globais
                    setSelectedSection(section.id);
                  } else {
                    // Rotas externas
                    navigate(section.route);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          section.isConfigured ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        <div className="text-white">{section.icon}</div>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {section.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {section.isConfigured ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      )}
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">{section.progress}%</span>
                    </div>
                    <Progress value={section.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Configurações Recomendadas */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              🟡 Configurações Recomendadas
            </h2>
            <Badge variant="secondary" className="px-3 py-1">
              Melhores Práticas
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedSections.map((section) => (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  section.isConfigured
                    ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
                    : "border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-300"
                }`}
                onClick={() => {
                  if (section.route.startsWith("/global-settings/")) {
                    setSelectedSection(section.id);
                  } else {
                    navigate(section.route);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          section.isConfigured ? "bg-blue-600" : "bg-yellow-600"
                        }`}
                      >
                        <div className="text-white">{section.icon}</div>
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {section.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {section.isConfigured ? (
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                      )}
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-medium">{section.progress}%</span>
                    </div>
                    <Progress value={section.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-emerald-700">
              <Zap className="h-5 w-5 mr-2" />
              Ações Rápidas de Configuração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!essentialSections.find((s) => s.id === "setup-wizard")
                ?.isConfigured && (
                <Button
                  className="h-auto p-4 flex flex-col items-center space-y-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setSelectedSection("setup-wizard")}
                >
                  <Wand2 className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Configuração Guiada</div>
                    <div className="text-xs opacity-90">
                      5 minutos para começar
                    </div>
                  </div>
                </Button>
              )}

              {!essentialSections.find((s) => s.id === "branding")
                ?.isConfigured && (
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 border-purple-200 hover:bg-purple-50"
                  onClick={() => setSelectedSection("branding")}
                >
                  <Palette className="h-6 w-6 text-purple-600" />
                  <div className="text-center">
                    <div className="font-semibold">Personalizar Visual</div>
                    <div className="text-xs text-gray-600">
                      Logo e cores da marca
                    </div>
                  </div>
                </Button>
              )}

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 border-blue-200 hover:bg-blue-50"
                onClick={() => navigate("/analytics")}
              >
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-semibold">Ver Relatórios</div>
                  <div className="text-xs text-gray-600">
                    Analytics completo
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notificação de Status */}
        {overallProgress < 80 && (
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-amber-800">
                    Configuração Incompleta
                  </div>
                  <div className="text-sm text-amber-700">
                    Complete as configurações essenciais para ter acesso total à
                    plataforma KRYONIX.
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => setSelectedSection("setup-wizard")}
                >
                  Completar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal/Drawer para configurações específicas */}
        {selectedSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {sections.find((s) => s.id === selectedSection)?.name}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSection(null)}
                >
                  ✕
                </Button>
              </div>

              {selectedSection === "stack-management" ? (
                <StackConfigManager
                  onConfigChange={(stackId, config) => {
                    console.log(`Stack ${stackId} configurada:`, config);
                  }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Configuração em Desenvolvimento
                  </p>
                  <p className="text-sm">
                    Esta seção será implementada em breve com interface completa
                    para{" "}
                    {sections
                      .find((s) => s.id === selectedSection)
                      ?.name.toLowerCase()}
                    .
                  </p>
                  <Button
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setSelectedSection(null)}
                  >
                    Entendi
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Building2,
  Globe,
  Eye,
  Save,
  Upload,
  Download,
  RefreshCw,
  Check,
  AlertCircle,
  Smartphone,
  Monitor,
  Tablet,
  Settings,
  Crown,
  Star,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import KryonixLayout from "@/components/layout/KryonixLayout";

// Configurações white-label atuais (simuladas)
const currentConfig = {
  companyName: "KRYONIX",
  companyLogo: "",
  primaryColor: "#0ea5e9",
  secondaryColor: "#9333ea",
  customDomain: "kryonix.com.br",
  favicon: "",
  loginBackground: "",
  footerText: "Plataforma Autônoma com IA",
  supportEmail: "suporte@kryonix.com.br",
  enableCustomCSS: false,
  customCSS: "",
  enableWhiteLabel: true,
  showPoweredBy: false,
};

const colorPresets = [
  { name: "KRYONIX Azul", primary: "#0ea5e9", secondary: "#9333ea" },
  { name: "Verde Sucesso", primary: "#22c55e", secondary: "#16a34a" },
  { name: "Roxo Inovador", primary: "#9333ea", secondary: "#7c3aed" },
  { name: "Laranja Energia", primary: "#f97316", secondary: "#ea580c" },
  { name: "Rosa Moderno", primary: "#ec4899", secondary: "#db2777" },
  { name: "Azul Profissional", primary: "#3b82f6", secondary: "#2563eb" },
  { name: "Vermelho Impacto", primary: "#ef4444", secondary: "#dc2626" },
  { name: "Preto Elegante", primary: "#1f2937", secondary: "#374151" },
];

export default function WhiteLabel() {
  const [config, setConfig] = useState(currentConfig);
  const [previewMode, setPreviewMode] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleColorPreset = (preset: (typeof colorPresets)[0]) => {
    setConfig((prev) => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
    }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <KryonixLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              🎨 Personalização White Label
            </h1>
            <p className="text-gray-600">
              Customize completamente a aparência da sua plataforma KRYONIX
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              <Crown className="h-3 w-3 mr-1" />
              Plano Enterprise
            </Badge>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saved
                ? "Salvo!"
                : isSaving
                  ? "Salvando..."
                  : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configurações */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="branding" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="branding">Marca</TabsTrigger>
                <TabsTrigger value="colors">Cores</TabsTrigger>
                <TabsTrigger value="domain">Domínio</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>

              {/* Aba: Marca */}
              <TabsContent value="branding" className="space-y-6">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      Identidade da Marca
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Nome da Empresa</Label>
                      <Input
                        id="companyName"
                        value={config.companyName}
                        onChange={(e) =>
                          handleInputChange("companyName", e.target.value)
                        }
                        placeholder="Digite o nome da sua empresa"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footerText">Texto do Rodapé</Label>
                      <Input
                        id="footerText"
                        value={config.footerText}
                        onChange={(e) =>
                          handleInputChange("footerText", e.target.value)
                        }
                        placeholder="Slogan ou descrição da empresa"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="supportEmail">E-mail de Suporte</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={config.supportEmail}
                        onChange={(e) =>
                          handleInputChange("supportEmail", e.target.value)
                        }
                        placeholder="suporte@suaempresa.com.br"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Logo da Empresa</Label>
                        <div className="mt-2">
                          <Button variant="outline" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Fazer Upload do Logo
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG ou SVG, máximo 2MB. Tamanho recomendado:
                            200x60px
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label>Favicon</Label>
                        <div className="mt-2">
                          <Button variant="outline" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Favicon
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">
                            ICO ou PNG, 32x32px
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba: Cores */}
              <TabsContent value="colors" className="space-y-6">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="h-5 w-5 mr-2" />
                      Esquema de Cores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Presets de Cores */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">
                        Paletas Predefinidas
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {colorPresets.map((preset, index) => (
                          <button
                            key={index}
                            onClick={() => handleColorPreset(preset)}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all hover:scale-105",
                              config.primaryColor === preset.primary
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-200 hover:border-gray-300",
                            )}
                          >
                            <div className="flex space-x-1 mb-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: preset.primary }}
                              ></div>
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: preset.secondary }}
                              ></div>
                            </div>
                            <p className="text-xs font-medium text-gray-700">
                              {preset.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cores Personalizadas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryColor">Cor Primária</Label>
                        <div className="flex space-x-2 mt-1">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) =>
                              handleInputChange("primaryColor", e.target.value)
                            }
                            className="w-16 h-10 rounded-lg border"
                          />
                          <Input
                            value={config.primaryColor}
                            onChange={(e) =>
                              handleInputChange("primaryColor", e.target.value)
                            }
                            placeholder="#0ea5e9"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="secondaryColor">Cor Secundária</Label>
                        <div className="flex space-x-2 mt-1">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={config.secondaryColor}
                            onChange={(e) =>
                              handleInputChange(
                                "secondaryColor",
                                e.target.value,
                              )
                            }
                            className="w-16 h-10 rounded-lg border"
                          />
                          <Input
                            value={config.secondaryColor}
                            onChange={(e) =>
                              handleInputChange(
                                "secondaryColor",
                                e.target.value,
                              )
                            }
                            placeholder="#9333ea"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview das Cores */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-medium mb-3 block">
                        Preview do Esquema
                      </Label>
                      <div className="space-y-2">
                        <Button
                          style={{ backgroundColor: config.primaryColor }}
                          className="text-white"
                        >
                          Botão Primário
                        </Button>
                        <Button
                          style={{ backgroundColor: config.secondaryColor }}
                          className="text-white"
                        >
                          Botão Secundário
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba: Domínio */}
              <TabsContent value="domain" className="space-y-6">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Domínio Personalizado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="customDomain">Seu Domínio</Label>
                      <Input
                        id="customDomain"
                        value={config.customDomain}
                        onChange={(e) =>
                          handleInputChange("customDomain", e.target.value)
                        }
                        placeholder="suaempresa.com.br"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Configure seu domínio personalizado. Ex:
                        app.suaempresa.com.br
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        📋 Instruções de Configuração DNS
                      </h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>
                          <strong>Tipo:</strong> CNAME
                        </p>
                        <p>
                          <strong>Nome:</strong> app (ou subdomínio desejado)
                        </p>
                        <p>
                          <strong>Valor:</strong> kryonix-platform.herokuapp.com
                        </p>
                        <p>
                          <strong>TTL:</strong> 300 (5 minutos)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          SSL Automático
                        </p>
                        <p className="text-sm text-gray-600">
                          Let's Encrypt gratuito
                        </p>
                      </div>
                      <Badge className="bg-success-100 text-success-800">
                        <Check className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba: Avançado */}
              <TabsContent value="advanced" className="space-y-6">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Configurações Avançadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Ativar White Label</p>
                          <p className="text-sm text-gray-600">
                            Remove todas as marcas KRYONIX
                          </p>
                        </div>
                        <Switch
                          checked={config.enableWhiteLabel}
                          onCheckedChange={(checked) =>
                            handleInputChange("enableWhiteLabel", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Mostrar "Powered by KRYONIX"
                          </p>
                          <p className="text-sm text-gray-600">
                            Exibe crédito no rodapé
                          </p>
                        </div>
                        <Switch
                          checked={config.showPoweredBy}
                          onCheckedChange={(checked) =>
                            handleInputChange("showPoweredBy", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">CSS Personalizado</p>
                          <p className="text-sm text-gray-600">
                            Adicione seus próprios estilos
                          </p>
                        </div>
                        <Switch
                          checked={config.enableCustomCSS}
                          onCheckedChange={(checked) =>
                            handleInputChange("enableCustomCSS", checked)
                          }
                        />
                      </div>
                    </div>

                    {config.enableCustomCSS && (
                      <div>
                        <Label htmlFor="customCSS">CSS Personalizado</Label>
                        <Textarea
                          id="customCSS"
                          value={config.customCSS}
                          onChange={(e) =>
                            handleInputChange("customCSS", e.target.value)
                          }
                          placeholder="/* Adicione seu CSS personalizado aqui */
.minha-classe {
  background-color: #f0f0f0;
}"
                          className="mt-1 font-mono text-sm h-32"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ⚠️ Cuidado: CSS inválido pode quebrar a interface
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle>Exportar/Importar Configuração</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Configuração
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Configuração
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Salve ou carregue configurações white-label em formato
                      JSON
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Preview
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={previewMode === "desktop" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("desktop")}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === "tablet" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("tablet")}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewMode === "mobile" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewMode("mobile")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "border rounded-lg overflow-hidden bg-white",
                    previewMode === "desktop" && "w-full h-96",
                    previewMode === "tablet" && "w-80 h-96 mx-auto",
                    previewMode === "mobile" && "w-64 h-96 mx-auto",
                  )}
                >
                  {/* Preview da Interface */}
                  <div
                    className="h-12 flex items-center justify-between px-4 text-white"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white/20 rounded"></div>
                      <span className="font-bold">{config.companyName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-white/20 rounded"></div>
                      <div className="w-4 h-4 bg-white/20 rounded"></div>
                    </div>
                  </div>

                  <div className="p-4 h-full bg-gray-50">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>

                      <div className="space-y-2 mt-4">
                        <div
                          className="h-8 rounded text-white text-sm flex items-center justify-center font-medium"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          Botão Primário
                        </div>
                        <div
                          className="h-8 rounded text-white text-sm flex items-center justify-center font-medium"
                          style={{ backgroundColor: config.secondaryColor }}
                        >
                          Botão Secundário
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-4 right-4">
                      <div className="text-xs text-gray-500 text-center">
                        {config.footerText}
                        {config.showPoweredBy && (
                          <span className="block">Powered by KRYONIX</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status do White Label */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">White Label</span>
                    <Badge
                      className={
                        config.enableWhiteLabel
                          ? "bg-success-100 text-success-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {config.enableWhiteLabel ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Domínio Personalizado</span>
                    <Badge className="bg-primary-100 text-primary-800">
                      Configurado
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">SSL Certificate</span>
                    <Badge className="bg-success-100 text-success-800">
                      <Check className="h-3 w-3 mr-1" />
                      Válido
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">CDN</span>
                    <Badge className="bg-success-100 text-success-800">
                      <Zap className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </KryonixLayout>
  );
}

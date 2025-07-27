import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { KryonixLayout } from "@/components/layout/KryonixLayout";
import {
  Shield,
  Users,
  Database,
  Key,
  FileCheck,
  Globe,
  Building2,
  Settings,
  Lock,
  CheckCircle,
  AlertTriangle,
  Crown,
  UserCheck,
  FileText,
  Server,
  Eye,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhancedApiClient } from "@/services/enhanced-api-client";

interface EnterpriseConfig {
  id: string;
  name: string;
  domain: string;
  ssoEnabled: boolean;
  samlConfig?: {
    entityId: string;
    ssoUrl: string;
    certificate: string;
    signatureAlgorithm: string;
  };
  activeDirectoryConfig?: {
    server: string;
    port: number;
    domain: string;
    baseDN: string;
    username: string;
    useSSL: boolean;
  };
  complianceSettings: {
    lgpdEnabled: boolean;
    dataRetentionDays: number;
    auditLogging: boolean;
    encryptionLevel: string;
    accessControls: string[];
  };
  whiteLabel: {
    customDomain: string;
    logoUrl: string;
    primaryColor: string;
    companyName: string;
  };
}

const Enterprise: React.FC = () => {
  const [config, setConfig] = useState<EnterpriseConfig>({
    id: "",
    name: "",
    domain: "",
    ssoEnabled: false,
    complianceSettings: {
      lgpdEnabled: true,
      dataRetentionDays: 2555, // 7 anos conforme LGPD
      auditLogging: true,
      encryptionLevel: "AES-256",
      accessControls: ["MFA", "IP_WHITELIST", "ROLE_BASED"],
    },
    whiteLabel: {
      customDomain: "",
      logoUrl: "",
      primaryColor: "#0ea5e9",
      companyName: "",
    },
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  const { toast } = useToast();

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await enhancedApiClient.post("/api/enterprise/config", config);
      toast({
        title: "✅ Configuração Enterprise Salva",
        description: "Todas as configurações foram aplicadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro na Configuração",
        description: "Falha ao salvar configurações enterprise.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const testSSO = async () => {
    setLoading(true);
    try {
      const result = await enhancedApiClient.post("/api/enterprise/test-sso", {
        samlConfig: config.samlConfig,
      });
      setTestResults({ ...testResults, sso: result.data });
      toast({
        title: "🧪 Teste SSO",
        description: result.data.success
          ? "SSO funcionando corretamente"
          : "Falha no teste SSO",
      });
    } catch (error) {
      toast({
        title: "❌ Erro no Teste SSO",
        description: "Não foi possível testar a configuração SSO.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const testActiveDirectory = async () => {
    setLoading(true);
    try {
      const result = await enhancedApiClient.post("/api/enterprise/test-ad", {
        adConfig: config.activeDirectoryConfig,
      });
      setTestResults({ ...testResults, ad: result.data });
      toast({
        title: "🧪 Teste Active Directory",
        description: result.data.success
          ? "AD funcionando corretamente"
          : "Falha no teste AD",
      });
    } catch (error) {
      toast({
        title: "❌ Erro no Teste AD",
        description:
          "Não foi possível testar a configuração do Active Directory.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const generateComplianceReport = async () => {
    setLoading(true);
    try {
      const result = await enhancedApiClient.get(
        "/api/enterprise/compliance-report",
      );
      toast({
        title: "📊 Relatório LGPD Gerado",
        description: "Relatório de conformidade baixado com sucesso.",
      });

      // Download do relatório
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-lgpd-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "❌ Erro no Relatório",
        description: "Não foi possível gerar o relatório de compliance.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <KryonixLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="h-8 w-8 text-yellow-500" />
              Recursos Enterprise
            </h1>
            <p className="text-muted-foreground">
              Configurações avançadas para empresas e corporações
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            <Crown className="h-4 w-4 mr-1" />
            Enterprise Only
          </Badge>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sso">SSO & SAML</TabsTrigger>
            <TabsTrigger value="directory">Active Directory</TabsTrigger>
            <TabsTrigger value="compliance">Compliance LGPD</TabsTrigger>
            <TabsTrigger value="whitelabel">White Label</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Single Sign-On (SSO)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge
                      variant={config.ssoEnabled ? "default" : "secondary"}
                    >
                      {config.ssoEnabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">
                    Autenticação única para todos os usuários enterprise
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Active Directory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Integração
                    </span>
                    <Badge
                      variant={
                        config.activeDirectoryConfig ? "default" : "secondary"
                      }
                    >
                      {config.activeDirectoryConfig
                        ? "Configurado"
                        : "Não Configurado"}
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">
                    Sincronização com diretório corporativo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-purple-600" />
                    Compliance LGPD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Conformidade
                    </span>
                    <Badge
                      variant={
                        config.complianceSettings.lgpdEnabled
                          ? "default"
                          : "destructive"
                      }
                    >
                      {config.complianceSettings.lgpdEnabled
                        ? "Conforme"
                        : "Pendente"}
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">
                    Adequação à Lei Geral de Proteção de Dados
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Configuração Empresa</CardTitle>
                  <CardDescription>
                    Informações básicas da organização enterprise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nome da Empresa</Label>
                      <Input
                        id="company-name"
                        value={config.name}
                        onChange={(e) =>
                          setConfig({ ...config, name: e.target.value })
                        }
                        placeholder="Ex: Kryonix Tecnologia Ltda"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-domain">
                        Domínio Corporativo
                      </Label>
                      <Input
                        id="company-domain"
                        value={config.domain}
                        onChange={(e) =>
                          setConfig({ ...config, domain: e.target.value })
                        }
                        placeholder="Ex: empresa.com.br"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveConfig} disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sso">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Configuração SSO & SAML
                </CardTitle>
                <CardDescription>
                  Configure Single Sign-On para autenticação corporativa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sso-enabled"
                    checked={config.ssoEnabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, ssoEnabled: checked })
                    }
                  />
                  <Label htmlFor="sso-enabled">Habilitar SSO</Label>
                </div>

                {config.ssoEnabled && (
                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Configuração SAML 2.0</AlertTitle>
                      <AlertDescription>
                        Configure os detalhes do seu provedor de identidade SAML
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="entity-id">Entity ID</Label>
                        <Input
                          id="entity-id"
                          value={config.samlConfig?.entityId || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              samlConfig: {
                                ...config.samlConfig,
                                entityId: e.target.value,
                                ssoUrl: config.samlConfig?.ssoUrl || "",
                                certificate:
                                  config.samlConfig?.certificate || "",
                                signatureAlgorithm:
                                  config.samlConfig?.signatureAlgorithm ||
                                  "SHA256",
                              },
                            })
                          }
                          placeholder="https://empresa.com.br/saml"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sso-url">SSO URL</Label>
                        <Input
                          id="sso-url"
                          value={config.samlConfig?.ssoUrl || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              samlConfig: {
                                ...config.samlConfig,
                                entityId: config.samlConfig?.entityId || "",
                                ssoUrl: e.target.value,
                                certificate:
                                  config.samlConfig?.certificate || "",
                                signatureAlgorithm:
                                  config.samlConfig?.signatureAlgorithm ||
                                  "SHA256",
                              },
                            })
                          }
                          placeholder="https://sso.empresa.com.br/login"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="saml-cert">Certificado SAML</Label>
                      <Textarea
                        id="saml-cert"
                        value={config.samlConfig?.certificate || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            samlConfig: {
                              ...config.samlConfig,
                              entityId: config.samlConfig?.entityId || "",
                              ssoUrl: config.samlConfig?.ssoUrl || "",
                              certificate: e.target.value,
                              signatureAlgorithm:
                                config.samlConfig?.signatureAlgorithm ||
                                "SHA256",
                            },
                          })
                        }
                        placeholder="-----BEGIN CERTIFICATE-----..."
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signature-algorithm">
                        Algoritmo de Assinatura
                      </Label>
                      <Select
                        value={
                          config.samlConfig?.signatureAlgorithm || "SHA256"
                        }
                        onValueChange={(value) =>
                          setConfig({
                            ...config,
                            samlConfig: {
                              ...config.samlConfig,
                              entityId: config.samlConfig?.entityId || "",
                              ssoUrl: config.samlConfig?.ssoUrl || "",
                              certificate: config.samlConfig?.certificate || "",
                              signatureAlgorithm: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SHA256">SHA-256</SelectItem>
                          <SelectItem value="SHA1">SHA-1</SelectItem>
                          <SelectItem value="SHA512">SHA-512</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={testSSO}
                        variant="outline"
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Testar SSO
                      </Button>
                      <Button onClick={handleSaveConfig} disabled={loading}>
                        Salvar Configuração SAML
                      </Button>
                    </div>

                    {testResults.sso && (
                      <Alert
                        className={
                          testResults.sso.success
                            ? "border-green-500"
                            : "border-red-500"
                        }
                      >
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Resultado do Teste SSO</AlertTitle>
                        <AlertDescription>
                          {testResults.sso.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="directory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Integração Active Directory
                </CardTitle>
                <CardDescription>
                  Sincronize usuários e grupos com seu Active Directory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Server className="h-4 w-4" />
                  <AlertTitle>Conectividade de Rede</AlertTitle>
                  <AlertDescription>
                    Certifique-se de que o servidor KRYONIX tenha acesso ao seu
                    Active Directory
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ad-server">Servidor AD</Label>
                    <Input
                      id="ad-server"
                      value={config.activeDirectoryConfig?.server || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          activeDirectoryConfig: {
                            ...config.activeDirectoryConfig,
                            server: e.target.value,
                            port: config.activeDirectoryConfig?.port || 389,
                            domain: config.activeDirectoryConfig?.domain || "",
                            baseDN: config.activeDirectoryConfig?.baseDN || "",
                            username:
                              config.activeDirectoryConfig?.username || "",
                            useSSL:
                              config.activeDirectoryConfig?.useSSL || false,
                          },
                        })
                      }
                      placeholder="dc01.empresa.local"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ad-port">Porta</Label>
                    <Input
                      id="ad-port"
                      type="number"
                      value={config.activeDirectoryConfig?.port || 389}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          activeDirectoryConfig: {
                            ...config.activeDirectoryConfig,
                            server: config.activeDirectoryConfig?.server || "",
                            port: parseInt(e.target.value),
                            domain: config.activeDirectoryConfig?.domain || "",
                            baseDN: config.activeDirectoryConfig?.baseDN || "",
                            username:
                              config.activeDirectoryConfig?.username || "",
                            useSSL:
                              config.activeDirectoryConfig?.useSSL || false,
                          },
                        })
                      }
                      placeholder="389"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ad-domain">Domínio</Label>
                    <Input
                      id="ad-domain"
                      value={config.activeDirectoryConfig?.domain || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          activeDirectoryConfig: {
                            ...config.activeDirectoryConfig,
                            server: config.activeDirectoryConfig?.server || "",
                            port: config.activeDirectoryConfig?.port || 389,
                            domain: e.target.value,
                            baseDN: config.activeDirectoryConfig?.baseDN || "",
                            username:
                              config.activeDirectoryConfig?.username || "",
                            useSSL:
                              config.activeDirectoryConfig?.useSSL || false,
                          },
                        })
                      }
                      placeholder="empresa.local"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ad-username">Usuário de Serviço</Label>
                    <Input
                      id="ad-username"
                      value={config.activeDirectoryConfig?.username || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          activeDirectoryConfig: {
                            ...config.activeDirectoryConfig,
                            server: config.activeDirectoryConfig?.server || "",
                            port: config.activeDirectoryConfig?.port || 389,
                            domain: config.activeDirectoryConfig?.domain || "",
                            baseDN: config.activeDirectoryConfig?.baseDN || "",
                            username: e.target.value,
                            useSSL:
                              config.activeDirectoryConfig?.useSSL || false,
                          },
                        })
                      }
                      placeholder="svc_kryonix@empresa.local"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ad-basedn">Base DN</Label>
                  <Input
                    id="ad-basedn"
                    value={config.activeDirectoryConfig?.baseDN || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        activeDirectoryConfig: {
                          ...config.activeDirectoryConfig,
                          server: config.activeDirectoryConfig?.server || "",
                          port: config.activeDirectoryConfig?.port || 389,
                          domain: config.activeDirectoryConfig?.domain || "",
                          baseDN: e.target.value,
                          username:
                            config.activeDirectoryConfig?.username || "",
                          useSSL: config.activeDirectoryConfig?.useSSL || false,
                        },
                      })
                    }
                    placeholder="OU=Usuarios,DC=empresa,DC=local"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ad-ssl"
                    checked={config.activeDirectoryConfig?.useSSL || false}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        activeDirectoryConfig: {
                          ...config.activeDirectoryConfig,
                          server: config.activeDirectoryConfig?.server || "",
                          port: config.activeDirectoryConfig?.port || 389,
                          domain: config.activeDirectoryConfig?.domain || "",
                          baseDN: config.activeDirectoryConfig?.baseDN || "",
                          username:
                            config.activeDirectoryConfig?.username || "",
                          useSSL: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="ad-ssl">Usar SSL/TLS</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={testActiveDirectory}
                    variant="outline"
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Testar Conexão AD
                  </Button>
                  <Button onClick={handleSaveConfig} disabled={loading}>
                    Salvar Configuração AD
                  </Button>
                </div>

                {testResults.ad && (
                  <Alert
                    className={
                      testResults.ad.success
                        ? "border-green-500"
                        : "border-red-500"
                    }
                  >
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Resultado do Teste AD</AlertTitle>
                    <AlertDescription>
                      {testResults.ad.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Conformidade LGPD
                  </CardTitle>
                  <CardDescription>
                    Configurações para adequação à Lei Geral de Proteção de
                    Dados Pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="lgpd-enabled"
                      checked={config.complianceSettings.lgpdEnabled}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          complianceSettings: {
                            ...config.complianceSettings,
                            lgpdEnabled: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="lgpd-enabled">Ativar Compliance LGPD</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention-days">
                      Período de Retenção de Dados (dias)
                    </Label>
                    <Input
                      id="retention-days"
                      type="number"
                      value={config.complianceSettings.dataRetentionDays}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          complianceSettings: {
                            ...config.complianceSettings,
                            dataRetentionDays: parseInt(e.target.value),
                          },
                        })
                      }
                      placeholder="2555"
                    />
                    <p className="text-sm text-muted-foreground">
                      Recomendado: 2555 dias (7 anos) conforme legislação
                      brasileira
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="audit-logging"
                      checked={config.complianceSettings.auditLogging}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          complianceSettings: {
                            ...config.complianceSettings,
                            auditLogging: checked,
                          },
                        })
                      }
                    />
                    <Label htmlFor="audit-logging">
                      Log de Auditoria Detalhado
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encryption-level">
                      Nível de Criptografia
                    </Label>
                    <Select
                      value={config.complianceSettings.encryptionLevel}
                      onValueChange={(value) =>
                        setConfig({
                          ...config,
                          complianceSettings: {
                            ...config.complianceSettings,
                            encryptionLevel: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AES-256">
                          AES-256 (Recomendado)
                        </SelectItem>
                        <SelectItem value="AES-192">AES-192</SelectItem>
                        <SelectItem value="AES-128">AES-128</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={generateComplianceReport} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Relatório LGPD
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Controles de Acesso
                  </CardTitle>
                  <CardDescription>
                    Medidas de segurança e controle de acesso aos dados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        key: "MFA",
                        label: "Autenticação Multi-Fator",
                        icon: UserCheck,
                      },
                      {
                        key: "IP_WHITELIST",
                        label: "Lista Branca de IPs",
                        icon: Globe,
                      },
                      {
                        key: "ROLE_BASED",
                        label: "Controle Baseado em Funções",
                        icon: Users,
                      },
                      {
                        key: "SESSION_TIMEOUT",
                        label: "Timeout de Sessão",
                        icon: Lock,
                      },
                      {
                        key: "DATA_ENCRYPTION",
                        label: "Criptografia de Dados",
                        icon: Shield,
                      },
                      {
                        key: "AUDIT_TRAIL",
                        label: "Rastro de Auditoria",
                        icon: FileText,
                      },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Switch
                          id={key}
                          checked={config.complianceSettings.accessControls.includes(
                            key,
                          )}
                          onCheckedChange={(checked) => {
                            const controls = checked
                              ? [
                                  ...config.complianceSettings.accessControls,
                                  key,
                                ]
                              : config.complianceSettings.accessControls.filter(
                                  (c) => c !== key,
                                );
                            setConfig({
                              ...config,
                              complianceSettings: {
                                ...config.complianceSettings,
                                accessControls: controls,
                              },
                            });
                          }}
                        />
                        <Label
                          htmlFor={key}
                          className="flex items-center gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="whitelabel">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Configuração White Label
                </CardTitle>
                <CardDescription>
                  Personalize a plataforma com a identidade visual da sua
                  empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name-wl">Nome da Empresa</Label>
                    <Input
                      id="company-name-wl"
                      value={config.whiteLabel.companyName}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          whiteLabel: {
                            ...config.whiteLabel,
                            companyName: e.target.value,
                          },
                        })
                      }
                      placeholder="Sua Empresa Ltda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-domain-wl">
                      Domínio Personalizado
                    </Label>
                    <Input
                      id="custom-domain-wl"
                      value={config.whiteLabel.customDomain}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          whiteLabel: {
                            ...config.whiteLabel,
                            customDomain: e.target.value,
                          },
                        })
                      }
                      placeholder="automacao.suaempresa.com.br"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo-url">URL do Logo</Label>
                    <Input
                      id="logo-url"
                      value={config.whiteLabel.logoUrl}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          whiteLabel: {
                            ...config.whiteLabel,
                            logoUrl: e.target.value,
                          },
                        })
                      }
                      placeholder="https://suaempresa.com.br/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={config.whiteLabel.primaryColor}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            whiteLabel: {
                              ...config.whiteLabel,
                              primaryColor: e.target.value,
                            },
                          })
                        }
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.whiteLabel.primaryColor}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            whiteLabel: {
                              ...config.whiteLabel,
                              primaryColor: e.target.value,
                            },
                          })
                        }
                        placeholder="#0ea5e9"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertTitle>Preview da Personalização</AlertTitle>
                  <AlertDescription>
                    As alterações serão aplicadas após salvar e podem levar
                    alguns minutos para propagar
                  </AlertDescription>
                </Alert>

                <Button onClick={handleSaveConfig} disabled={loading}>
                  Aplicar Personalização
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema Enterprise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Infraestrutura: OK</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Segurança: Ativa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Backup: Automático</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm">Suporte: 24/7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </KryonixLayout>
  );
};

export default Enterprise;

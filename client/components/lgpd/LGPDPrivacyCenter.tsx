import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Download,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Smartphone,
  Mail,
  CheckCircle,
  AlertCircle,
  Settings,
  User,
  Lock,
  Database,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { PremiumButton } from "../ui/premium-button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { useToast } from "../ui/use-toast";

interface UserLGPDData {
  personalData: {
    cpf?: string;
    email: string;
    phone?: string;
    name: string;
    company?: string;
    address?: any;
    createdAt: Date;
    lastLogin: Date;
  };
  consents: {
    id: string;
    purpose: string;
    granted: boolean;
    grantedAt: Date;
    lastUpdated: Date;
    expiresAt?: Date;
    legal_basis: "consent" | "legitimate_interest" | "contract";
  }[];
  dataProcessing: {
    category: string;
    purpose: string;
    data_types: string[];
    retention_period: string;
    third_parties?: string[];
  }[];
  accessHistory: {
    date: Date;
    action: string;
    ip_address: string;
    user_agent: string;
  }[];
}

export function LGPDPrivacyCenter() {
  const [userData, setUserData] = useState<UserLGPDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/lgpd/user-data");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch("/api/lgpd/export-data");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `meus-dados-kryonix-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ Download Iniciado",
        description: "Seus dados foram preparados para download.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro no Download",
        description: "Não foi possível gerar o arquivo de dados.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateConsent = async (consentId: string, granted: boolean) => {
    try {
      await fetch(`/api/lgpd/consent/${consentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ granted }),
      });

      toast({
        title: granted
          ? "✅ Consentimento Concedido"
          : "🚫 Consentimento Revogado",
        description: "Suas preferências foram atualizadas.",
      });

      loadUserData();
    } catch (error) {
      toast({
        title: "❌ Erro na Atualização",
        description: "Não foi possível atualizar o consentimento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "⚠️ ATENÇÃO: Esta ação é irreversível. Tem certeza que deseja solicitar a exclusão de todos os seus dados?",
      )
    ) {
      return;
    }

    try {
      await fetch("/api/lgpd/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      toast({
        title: "🗑️ Solicitação de Exclusão Enviada",
        description:
          "Você receberá um email confirmando o processamento em até 72h.",
      });
    } catch (error) {
      toast({
        title: "❌ Erro na Solicitação",
        description: "Não foi possível processar a solicitação de exclusão.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Central de Privacidade LGPD
            </h1>
            <p className="text-gray-600">
              Gerencie seus dados pessoais conforme a Lei Geral de Proteção de
              Dados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Dados Coletados</p>
                  <p className="text-xl font-semibold">
                    {userData?.dataProcessing.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Consentimentos</p>
                  <p className="text-xl font-semibold">
                    {userData?.consents.filter((c) => c.granted).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Acessos Recentes</p>
                  <p className="text-xl font-semibold">
                    {userData?.accessHistory.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Lock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Protegido
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="data">Meus Dados</TabsTrigger>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="rights">Meus Direitos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informações Pessoais</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold">{userData?.personalData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">
                    {userData?.personalData.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="font-semibold">
                    {userData?.personalData.cpf
                      ? userData.personalData.cpf.replace(
                          /(\d{3})(\d{3})(\d{3})(\d{2})/,
                          "$1.***.***-$4",
                        )
                      : "Não informado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conta criada em</p>
                  <p className="font-semibold">
                    {userData?.personalData.createdAt
                      ? new Date(
                          userData.personalData.createdAt,
                        ).toLocaleDateString("pt-BR")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Ações Rápidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <PremiumButton
                  onClick={handleDownloadData}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Meus Dados
                </PremiumButton>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("consents")}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Gerenciar Consentimentos
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setActiveTab("rights")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Exercer Meus Direitos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Proteção de Dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Criptografia</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Servidor no Brasil</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      ✓ São Paulo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conformidade LGPD</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      100%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Dados Processados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData?.dataProcessing.map((processing, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{processing.category}</h4>
                      <Badge variant="outline">
                        {processing.retention_period}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {processing.purpose}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {processing.data_types.map((type, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consents Tab */}
        <TabsContent value="consents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Consentimentos</CardTitle>
              <p className="text-sm text-gray-600">
                Você pode alterar ou revogar seus consentimentos a qualquer
                momento
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData?.consents.map((consent) => (
                  <div
                    key={consent.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{consent.purpose}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(consent.grantedAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {consent.legal_basis === "consent"
                            ? "Consentimento"
                            : consent.legal_basis === "legitimate_interest"
                              ? "Interesse Legítimo"
                              : "Contrato"}
                        </Badge>
                      </div>
                    </div>

                    <Switch
                      checked={consent.granted}
                      onCheckedChange={(checked) =>
                        handleUpdateConsent(consent.id, checked)
                      }
                      disabled={consent.legal_basis !== "consent"}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userData?.accessHistory.slice(0, 10).map((access, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border-l-4 border-blue-200 bg-blue-50"
                  >
                    <div>
                      <p className="font-semibold text-sm">{access.action}</p>
                      <p className="text-xs text-gray-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(access.date).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {access.ip_address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rights Tab */}
        <TabsContent value="rights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Portabilidade de Dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Baixe todos os seus dados em formato estruturado (JSON)
                </p>
                <PremiumButton onClick={handleDownloadData} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Meus Dados
                </PremiumButton>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="w-5 h-5" />
                  <span>Correção de Dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Solicite correção de dados pessoais incorretos
                </p>
                <Button variant="outline" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Solicitar Correção
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Informações de Tratamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Veja relatório detalhado de como seus dados são tratados
                </p>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  <span>Exclusão de Dados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Solicite a exclusão de todos os seus dados pessoais
                </p>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Solicitar Exclusão
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-800 mb-3">
                ℹ️ Seus Direitos sob a LGPD
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">
                    Direitos Fundamentais:
                  </h4>
                  <ul className="space-y-1 text-blue-600">
                    <li>• Acesso aos seus dados</li>
                    <li>• Correção de dados incompletos/incorretos</li>
                    <li>• Anonimização ou exclusão</li>
                    <li>• Portabilidade dos dados</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">
                    Garantias:
                  </h4>
                  <ul className="space-y-1 text-blue-600">
                    <li>• Revogação do consentimento</li>
                    <li>• Informação sobre compartilhamento</li>
                    <li>• Oposição ao tratamento</li>
                    <li>• Revisão de decisões automatizadas</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded border">
                <p className="text-xs text-gray-600">
                  <strong>Prazo de atendimento:</strong> Suas solicitações serão
                  atendidas em até 15 dias úteis, conforme Art. 19 da LGPD. Para
                  dúvidas ou exercício de direitos, contate:
                  <a
                    href="mailto:lgpd@kryonix.com.br"
                    className="text-blue-600 underline ml-1"
                  >
                    lgpd@kryonix.com.br
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LGPDPrivacyCenter;

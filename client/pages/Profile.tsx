import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  Camera,
  Save,
  Shield,
  Bell,
  Key,
  Calendar,
  MapPin,
  Briefcase,
  Award,
  Check,
  RefreshCw,
} from "lucide-react";
import KryonixLayout from "@/components/layout/KryonixLayout";

// Dados do usuário (simulados)
const userData = {
  name: "Vitor Jayme Fernandes Ferreira",
  email: "vitor@kryonix.com.br",
  phone: "(17) 98180-5327",
  company: "KRYONIX",
  position: "CEO & Founder",
  location: "São Paulo, Brasil",
  bio: "Empreendedor apaixonado por tecnologia e inovação. Fundador da KRYONIX, plataforma SaaS autônoma com IA.",
  avatar: "",
  website: "https://kryonix.com.br",
  joinDate: "2024-01-15",
  plan: "Enterprise",
  notifications: {
    email: true,
    push: true,
    sms: false,
    marketing: true,
  },
};

export default function Profile() {
  const [profile, setProfile] = useState(userData);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setProfile((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value },
    }));
  };

  return (
    <KryonixLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              👤 Meu Perfil
            </h1>
            <p className="text-gray-600">
              Gerencie suas informações pessoais e preferências da conta
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              <Award className="h-3 w-3 mr-1" />
              {profile.plan}
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
          {/* Perfil Principal */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Pessoal</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
              </TabsList>

              {/* Aba: Informações Pessoais */}
              <TabsContent value="personal" className="space-y-6">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Telefone/WhatsApp</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="(11) 99999-9999"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="location">Localização</Label>
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          placeholder="Cidade, Estado"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        placeholder="Conte um pouco sobre você..."
                        className="mt-1 h-24"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Informações Profissionais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          value={profile.company}
                          onChange={(e) =>
                            handleInputChange("company", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="position">Cargo</Label>
                        <Input
                          id="position"
                          value={profile.position}
                          onChange={(e) =>
                            handleInputChange("position", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="website">Website/Portfolio</Label>
                        <Input
                          id="website"
                          type="url"
                          value={profile.website}
                          onChange={(e) =>
                            handleInputChange("website", e.target.value)
                          }
                          placeholder="https://seusite.com.br"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba: Notificações */}
              <TabsContent value="notifications" className="space-y-6">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Preferências de Notificação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificações por E-mail</p>
                          <p className="text-sm text-gray-600">
                            Receba atualizações importantes por e-mail
                          </p>
                        </div>
                        <Switch
                          checked={profile.notifications.email}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("email", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificações Push</p>
                          <p className="text-sm text-gray-600">
                            Alertas no navegador e dispositivos móveis
                          </p>
                        </div>
                        <Switch
                          checked={profile.notifications.push}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("push", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS/WhatsApp</p>
                          <p className="text-sm text-gray-600">
                            Alertas críticos por mensagem de texto
                          </p>
                        </div>
                        <Switch
                          checked={profile.notifications.sms}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("sms", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">E-mails de Marketing</p>
                          <p className="text-sm text-gray-600">
                            Novidades, dicas e ofertas especiais
                          </p>
                        </div>
                        <Switch
                          checked={profile.notifications.marketing}
                          onCheckedChange={(checked) =>
                            handleNotificationChange("marketing", checked)
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        📧 Tipos de Notificação
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Alertas de sistema e monitoramento</li>
                        <li>• Novos leads e conversões</li>
                        <li>• Atualizações de stacks e serviços</li>
                        <li>• Relatórios automatizados</li>
                        <li>• Lembretes de cobrança</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba: Segurança */}
              <TabsContent value="security" className="space-y-6">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Segurança da Conta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Senha Atual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="Digite sua senha atual"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Digite sua nova senha"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">
                          Confirmar Nova Senha
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirme sua nova senha"
                          className="mt-1"
                        />
                      </div>

                      <Button className="w-full btn-primary">
                        <Key className="h-4 w-4 mr-2" />
                        Alterar Senha
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">
                        Autenticação de Dois Fatores (2FA)
                      </h4>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            2FA via App Autenticador
                          </p>
                          <p className="text-sm text-gray-600">
                            Aumenta a segurança da sua conta
                          </p>
                        </div>
                        <Button variant="outline">Configurar</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar com Avatar e Informações */}
          <div className="space-y-6">
            {/* Card do Avatar */}
            <Card className="card-modern">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="bg-primary-500 text-white text-2xl font-bold">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {profile.name}
                </h3>
                <p className="text-gray-600 mb-2">{profile.position}</p>
                <p className="text-sm text-gray-500 mb-4">{profile.company}</p>

                <Badge className="bg-primary-100 text-primary-800 mb-4">
                  Plano {profile.plan}
                </Badge>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Estatísticas */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Membro desde:</span>
                    <span className="text-sm font-medium">
                      {new Date(profile.joinDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Último acesso:
                    </span>
                    <span className="text-sm font-medium">Agora</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Stacks ativas:
                    </span>
                    <span className="text-sm font-medium text-success-600">
                      23/25
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className="bg-success-100 text-success-800 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Ações Rápidas */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Ver Perfil Público
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Log de Atividades
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-error-600 hover:text-error-700"
                >
                  <User className="h-4 w-4 mr-2" />
                  Desativar Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </KryonixLayout>
  );
}

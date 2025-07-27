import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  Download,
  RefreshCw,
  User,
  Building,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Info,
  Settings as SettingsIcon,
  Camera,
  Trash2,
  Copy,
  Loader2,
  MapPin,
  Phone,
  Briefcase,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription } from "../components/ui/alert";
import KryonixLayout from "../components/layout/KryonixLayout";
import { useUser, useUpdateProfile } from "../hooks/use-api";
import { useMobileAdvanced } from "../hooks/use-mobile-advanced";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: user, isLoading: userLoading } = useUser();
  const updateProfileMutation = useUpdateProfile();
  const { isMobile, screenSize } = useMobileAdvanced();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    avatar: null as File | null,
  });

  const [companyData, setCompanyData] = useState({
    name: "KRYONIX Automações",
    website: "https://kryonix.com.br",
    address: "São Paulo, SP",
    industry: "Tecnologia",
    size: "1-10",
  });

  const [appearanceData, setAppearanceData] = useState({
    theme: "light",
    accentColor: "blue",
    compactMode: false,
    animationsEnabled: true,
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    whatsappNotifications: false,
    marketingEmails: false,
    weeklyReports: true,
    systemAlerts: true,
  });

  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "24h",
    loginNotifications: true,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Update profile data when user data is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        email: user.email || "",
        phone: user.profile?.phone || "",
        bio: user.profile?.preferences?.bio || "",
        timezone: user.profile?.timezone || "America/Sao_Paulo",
        language: user.profile?.language || "pt-BR",
        avatar: null,
      });
    }
  }, [user]);

  const handleProfileSave = async () => {
    const updates = {
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      profile: {
        ...user?.profile,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        timezone: profileData.timezone,
        language: profileData.language,
        preferences: {
          ...user?.profile?.preferences,
          bio: profileData.bio,
        },
      },
    };

    updateProfileMutation.mutate(updates);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData((prev) => ({ ...prev, avatar: file }));
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (userLoading) {
    return (
      <KryonixLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-3 mb-8">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Skeleton className="h-96 col-span-1" />
              <Skeleton className="h-96 col-span-3" />
            </div>
          </div>
        </div>
      </KryonixLayout>
    );
  }

  return (
    <KryonixLayout>
      <div className={`${isMobile ? "p-3" : "p-4 md:p-6 lg:p-8"}`}>
        <div className={`${isMobile ? "" : "max-w-4xl mx-auto"}`}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Configurações
                </h1>
                <p className="text-gray-600">
                  Gerencie sua conta e preferências
                </p>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 lg:inline-grid">
              <TabsTrigger
                value="profile"
                className="flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger
                value="company"
                className="flex items-center space-x-2"
              >
                <Building className="w-4 h-4" />
                <span className="hidden sm:inline">Empresa</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center space-x-2"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Aparência</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center space-x-2"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Segurança</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Informações Pessoais</span>
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais e preferências de conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={user?.profile?.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg">
                          {user?.name ? getUserInitials(user.name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={() =>
                          document.getElementById("avatar-upload")?.click()
                        }
                      >
                        <Camera className="w-3 h-3" />
                      </Button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {user?.name || "Usuário"}
                      </h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <Badge variant="outline" className="mt-2">
                        {user?.role === "SUPER_ADMIN"
                          ? "Super Admin"
                          : user?.role === "TENANT_ADMIN"
                            ? "Admin"
                            : user?.role === "USER"
                              ? "Usuário"
                              : "Visualizador"}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Seu sobrenome"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      O email não pode ser alterado. Entre em contato com o
                      suporte se necessário.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Input
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <Select
                        value={profileData.timezone}
                        onValueChange={(value) =>
                          setProfileData((prev) => ({
                            ...prev,
                            timezone: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Sao_Paulo">
                            Brasília (UTC-3)
                          </SelectItem>
                          <SelectItem value="America/Manaus">
                            Manaus (UTC-4)
                          </SelectItem>
                          <SelectItem value="America/Rio_Branco">
                            Acre (UTC-5)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select
                        value={profileData.language}
                        onValueChange={(value) =>
                          setProfileData((prev) => ({
                            ...prev,
                            language: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">
                            Português (Brasil)
                          </SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleProfileSave}
                      disabled={updateProfileMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Tab */}
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Informações da Empresa</span>
                  </CardTitle>
                  <CardDescription>
                    Configure os dados da sua empresa ou organização
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={companyData.name}
                      onChange={(e) =>
                        setCompanyData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Nome da sua empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="website"
                        value={companyData.website}
                        onChange={(e) =>
                          setCompanyData((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        placeholder="https://suaempresa.com.br"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="address"
                        value={companyData.address}
                        onChange={(e) =>
                          setCompanyData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        placeholder="Cidade, Estado"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry">Setor</Label>
                      <Select
                        value={companyData.industry}
                        onValueChange={(value) =>
                          setCompanyData((prev) => ({
                            ...prev,
                            industry: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                          <SelectItem value="Saúde">Saúde</SelectItem>
                          <SelectItem value="Educação">Educação</SelectItem>
                          <SelectItem value="Varejo">Varejo</SelectItem>
                          <SelectItem value="Serviços">Serviços</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Tamanho da Empresa</Label>
                      <Select
                        value={companyData.size}
                        onValueChange={(value) =>
                          setCompanyData((prev) => ({ ...prev, size: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">
                            1-10 funcionários
                          </SelectItem>
                          <SelectItem value="11-50">
                            11-50 funcionários
                          </SelectItem>
                          <SelectItem value="51-200">
                            51-200 funcionários
                          </SelectItem>
                          <SelectItem value="201-500">
                            201-500 funcionários
                          </SelectItem>
                          <SelectItem value="500+">
                            500+ funcionários
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Aparência</span>
                  </CardTitle>
                  <CardDescription>
                    Personalize a aparência da plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Tema</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light", label: "Claro", icon: Sun },
                        { value: "dark", label: "Escuro", icon: Moon },
                        { value: "system", label: "Sistema", icon: Monitor },
                      ].map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={
                            appearanceData.theme === value
                              ? "default"
                              : "outline"
                          }
                          className="h-auto p-4 flex flex-col space-y-2"
                          onClick={() =>
                            setAppearanceData((prev) => ({
                              ...prev,
                              theme: value,
                            }))
                          }
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Cor de Destaque</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {["blue", "purple", "green", "orange", "red", "pink"].map(
                        (color) => (
                          <Button
                            key={color}
                            variant="outline"
                            className={`w-12 h-12 p-0 ${
                              appearanceData.accentColor === color
                                ? "ring-2 ring-offset-2 ring-blue-500"
                                : ""
                            }`}
                            onClick={() =>
                              setAppearanceData((prev) => ({
                                ...prev,
                                accentColor: color,
                              }))
                            }
                          >
                            <div
                              className={`w-6 h-6 rounded-full bg-${color}-500`}
                            />
                          </Button>
                        ),
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Modo Compacto</Label>
                        <p className="text-sm text-gray-500">
                          Reduz o espaçamento entre elementos
                        </p>
                      </div>
                      <Switch
                        checked={appearanceData.compactMode}
                        onCheckedChange={(checked) =>
                          setAppearanceData((prev) => ({
                            ...prev,
                            compactMode: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Animações</Label>
                        <p className="text-sm text-gray-500">
                          Habilita animações na interface
                        </p>
                      </div>
                      <Switch
                        checked={appearanceData.animationsEnabled}
                        onCheckedChange={(checked) =>
                          setAppearanceData((prev) => ({
                            ...prev,
                            animationsEnabled: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Preferências
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Notificações</span>
                  </CardTitle>
                  <CardDescription>
                    Configure suas preferências de notificação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Notificações por Email</h4>

                    <div className="space-y-3">
                      {[
                        {
                          key: "emailNotifications",
                          label: "Notificações Gerais",
                          description:
                            "Receber notificações importantes por email",
                        },
                        {
                          key: "marketingEmails",
                          label: "Emails de Marketing",
                          description: "Novidades, dicas e ofertas especiais",
                        },
                        {
                          key: "weeklyReports",
                          label: "Relatórios Semanais",
                          description: "Resumo semanal das suas atividades",
                        },
                      ].map(({ key, label, description }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <Label>{label}</Label>
                            <p className="text-sm text-gray-500">
                              {description}
                            </p>
                          </div>
                          <Switch
                            checked={
                              notificationData[
                                key as keyof typeof notificationData
                              ] as boolean
                            }
                            onCheckedChange={(checked) =>
                              setNotificationData((prev) => ({
                                ...prev,
                                [key]: checked,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Outras Notificações</h4>

                    <div className="space-y-3">
                      {[
                        {
                          key: "pushNotifications",
                          label: "Push Notifications",
                          description: "Notificações no navegador",
                        },
                        {
                          key: "whatsappNotifications",
                          label: "WhatsApp",
                          description: "Notificações via WhatsApp",
                        },
                        {
                          key: "systemAlerts",
                          label: "Alertas do Sistema",
                          description: "Avisos sobre manutenção e atualizações",
                        },
                      ].map(({ key, label, description }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <Label>{label}</Label>
                            <p className="text-sm text-gray-500">
                              {description}
                            </p>
                          </div>
                          <Switch
                            checked={
                              notificationData[
                                key as keyof typeof notificationData
                              ] as boolean
                            }
                            onCheckedChange={(checked) =>
                              setNotificationData((prev) => ({
                                ...prev,
                                [key]: checked,
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Preferências
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Segurança</span>
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas configurações de segurança e privacidade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Autenticação de Dois Fatores (2FA)</Label>
                        <p className="text-sm text-gray-500">
                          Adiciona uma camada extra de segurança
                        </p>
                      </div>
                      <Switch
                        checked={securityData.twoFactorEnabled}
                        onCheckedChange={(checked) =>
                          setSecurityData((prev) => ({
                            ...prev,
                            twoFactorEnabled: checked,
                          }))
                        }
                      />
                    </div>

                    {securityData.twoFactorEnabled && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          2FA está ativo. Use seu app autenticador para fazer
                          login.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Configurações de Sessão</Label>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">
                          Timeout da Sessão
                        </Label>
                        <Select
                          value={securityData.sessionTimeout}
                          onValueChange={(value) =>
                            setSecurityData((prev) => ({
                              ...prev,
                              sessionTimeout: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">1 hora</SelectItem>
                            <SelectItem value="8h">8 horas</SelectItem>
                            <SelectItem value="24h">24 horas</SelectItem>
                            <SelectItem value="7d">7 dias</SelectItem>
                            <SelectItem value="30d">30 dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notificações de Login</Label>
                          <p className="text-sm text-gray-500">
                            Receber email quando houver novo login
                          </p>
                        </div>
                        <Switch
                          checked={securityData.loginNotifications}
                          onCheckedChange={(checked) =>
                            setSecurityData((prev) => ({
                              ...prev,
                              loginNotifications: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Alterar Senha</Label>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Senha Atual</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={securityData.currentPassword}
                            onChange={(e) =>
                              setSecurityData((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                              }))
                            }
                            placeholder="Digite sua senha atual"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={securityData.newPassword}
                            onChange={(e) =>
                              setSecurityData((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                              }))
                            }
                            placeholder="Digite sua nova senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirmar Nova Senha
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={securityData.confirmPassword}
                            onChange={(e) =>
                              setSecurityData((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                              }))
                            }
                            placeholder="Confirme sua nova senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </KryonixLayout>
  );
}

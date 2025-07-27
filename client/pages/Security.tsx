import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Refresh,
  Smartphone,
  Globe,
  Clock,
  Lock,
  Unlock,
  UserX,
  Settings,
  Bell,
  FileText,
  Search,
  Filter,
  Calendar,
  MapPin,
  Monitor,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import KryonixLayout from "@/components/layout/KryonixLayout";

// Dados de segurança (simulados)
const securityData = {
  lastPasswordChange: "2024-01-15",
  twoFactorEnabled: true,
  loginAttempts: {
    successful: 1247,
    failed: 23,
    blocked: 5,
  },
  activeSessions: [
    {
      id: 1,
      device: "Chrome no Windows",
      location: "São Paulo, Brasil",
      ip: "187.45.123.456",
      lastActive: "2 minutos atrás",
      current: true,
    },
    {
      id: 2,
      device: "Safari no iPhone",
      location: "São Paulo, Brasil",
      ip: "187.45.123.457",
      lastActive: "1 hora atrás",
      current: false,
    },
    {
      id: 3,
      device: "Firefox no Linux",
      location: "Rio de Janeiro, Brasil",
      ip: "200.123.45.678",
      lastActive: "3 dias atrás",
      current: false,
    },
  ],
  recentActivity: [
    {
      id: 1,
      action: "Login realizado",
      device: "Chrome/Windows",
      ip: "187.45.123.456",
      location: "São Paulo, SP",
      timestamp: "2024-01-20 14:30:25",
      status: "success",
    },
    {
      id: 2,
      action: "Configuração alterada",
      device: "Chrome/Windows",
      ip: "187.45.123.456",
      location: "São Paulo, SP",
      timestamp: "2024-01-20 14:15:10",
      status: "success",
    },
    {
      id: 3,
      action: "Tentativa de login falhou",
      device: "Unknown",
      ip: "123.45.67.89",
      location: "Localização desconhecida",
      timestamp: "2024-01-20 13:45:33",
      status: "warning",
    },
    {
      id: 4,
      action: "Senha alterada",
      device: "Safari/iPhone",
      ip: "187.45.123.457",
      location: "São Paulo, SP",
      timestamp: "2024-01-19 16:22:18",
      status: "success",
    },
    {
      id: 5,
      action: "2FA configurado",
      device: "Chrome/Windows",
      ip: "187.45.123.456",
      location: "São Paulo, SP",
      timestamp: "2024-01-19 10:15:42",
      status: "success",
    },
  ],
};

const securitySettings = {
  requireTwoFactor: true,
  sessionTimeout: 30,
  allowMultipleSessions: true,
  emailNotifications: true,
  suspiciousActivityAlerts: true,
  loginNotifications: true,
  ipRestriction: false,
  allowedIPs: [],
};

export default function Security() {
  const [settings, setSettings] = useState(securitySettings);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSettingChange = (setting: string, value: boolean | number) => {
    setSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const handleTerminateSession = (sessionId: number) => {
    console.log("Terminating session:", sessionId);
    // Implementar lógica de terminação de sessão
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-warning-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-error-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-success-50 border-success-200";
      case "warning":
        return "bg-warning-50 border-warning-200";
      case "error":
        return "bg-error-50 border-error-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const filteredActivity = securityData.recentActivity.filter((activity) => {
    const matchesFilter = filter === "all" || activity.status === filter;
    const matchesSearch =
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.ip.includes(searchTerm) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <KryonixLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              🛡️ Segurança & Auditoria
            </h1>
            <p className="text-gray-600">
              Monitore e controle a segurança da sua conta KRYONIX
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Badge className="bg-success-100 text-success-800 border-success-200">
              <Shield className="h-3 w-3 mr-1" />
              Conta Segura
            </Badge>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Relatório
            </Button>
          </div>
        </div>

        {/* Stats de Segurança */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Logins Bem-sucedidos</p>
                  <p className="text-2xl font-bold text-success-600">
                    {securityData.loginAttempts.successful.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tentativas Falharam</p>
                  <p className="text-2xl font-bold text-warning-600">
                    {securityData.loginAttempts.failed}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">IPs Bloqueados</p>
                  <p className="text-2xl font-bold text-error-600">
                    {securityData.loginAttempts.blocked}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-error-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sessões Ativas</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {securityData.activeSessions.length}
                  </p>
                </div>
                <Monitor className="h-8 w-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configurações e Sessões */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sessions">Sessões</TabsTrigger>
                <TabsTrigger value="activity">Atividade</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>

              {/* Aba: Sessões Ativas */}
              <TabsContent value="sessions" className="space-y-4">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Monitor className="h-5 w-5 mr-2" />
                      Sessões Ativas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {securityData.activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary-100 rounded-lg">
                            {session.device.includes("iPhone") ? (
                              <Smartphone className="h-5 w-5 text-primary-600" />
                            ) : (
                              <Monitor className="h-5 w-5 text-primary-600" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">
                                {session.device}
                              </p>
                              {session.current && (
                                <Badge className="bg-success-100 text-success-800 text-xs">
                                  Atual
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{session.location}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Wifi className="h-3 w-3" />
                                <span>{session.ip}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{session.lastActive}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {!session.current && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTerminateSession(session.id)}
                            className="text-error-600 hover:text-error-700"
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Terminar
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba: Log de Atividades */}
              <TabsContent value="activity" className="space-y-4">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Log de Atividades
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Buscar atividades..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-48"
                          />
                        </div>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Filtros */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                      >
                        Todas ({securityData.recentActivity.length})
                      </Button>
                      <Button
                        variant={filter === "success" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("success")}
                      >
                        Sucesso (
                        {
                          securityData.recentActivity.filter(
                            (a) => a.status === "success",
                          ).length
                        }
                        )
                      </Button>
                      <Button
                        variant={filter === "warning" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("warning")}
                      >
                        Alertas (
                        {
                          securityData.recentActivity.filter(
                            (a) => a.status === "warning",
                          ).length
                        }
                        )
                      </Button>
                    </div>

                    {/* Lista de Atividades */}
                    <div className="space-y-3">
                      {filteredActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className={cn(
                            "p-4 rounded-lg border",
                            getStatusColor(activity.status),
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getActivityIcon(activity.status)}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {activity.action}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <span>🖥️ {activity.device}</span>
                                  <span>📍 {activity.location}</span>
                                  <span>🌐 {activity.ip}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString(
                                "pt-BR",
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba: Configurações de Segurança */}
              <TabsContent value="settings" className="space-y-4">
                <Card className="card-modern">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Configurações de Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Exigir Autenticação de Dois Fatores
                          </p>
                          <p className="text-sm text-gray-600">
                            Obrigatório para todos os logins
                          </p>
                        </div>
                        <Switch
                          checked={settings.requireTwoFactor}
                          onCheckedChange={(checked) =>
                            handleSettingChange("requireTwoFactor", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Permitir Múltiplas Sessões
                          </p>
                          <p className="text-sm text-gray-600">
                            Login simultâneo em vários dispositivos
                          </p>
                        </div>
                        <Switch
                          checked={settings.allowMultipleSessions}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "allowMultipleSessions",
                              checked,
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificações de Login</p>
                          <p className="text-sm text-gray-600">
                            Alertas por e-mail a cada login
                          </p>
                        </div>
                        <Switch
                          checked={settings.loginNotifications}
                          onCheckedChange={(checked) =>
                            handleSettingChange("loginNotifications", checked)
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Alertas de Atividade Suspeita
                          </p>
                          <p className="text-sm text-gray-600">
                            Notificação de tentativas não autorizadas
                          </p>
                        </div>
                        <Switch
                          checked={settings.suspiciousActivityAlerts}
                          onCheckedChange={(checked) =>
                            handleSettingChange(
                              "suspiciousActivityAlerts",
                              checked,
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Restrição por IP</p>
                          <p className="text-sm text-gray-600">
                            Permitir login apenas de IPs específicos
                          </p>
                        </div>
                        <Switch
                          checked={settings.ipRestriction}
                          onCheckedChange={(checked) =>
                            handleSettingChange("ipRestriction", checked)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sessionTimeout">
                        Timeout de Sessão (minutos)
                      </Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) =>
                          handleSettingChange(
                            "sessionTimeout",
                            parseInt(e.target.value),
                          )
                        }
                        className="mt-1 w-32"
                        min={5}
                        max={480}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Sessão expira automaticamente após este período de
                        inatividade
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar com Resumo de Segurança */}
          <div className="space-y-6">
            {/* Status da Segurança */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Status de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Autenticação 2FA</span>
                    <Badge className="bg-success-100 text-success-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Senha Forte</span>
                    <Badge className="bg-success-100 text-success-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Sim
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Última Alteração</span>
                    <span className="text-sm font-medium">
                      {new Date(
                        securityData.lastPasswordChange,
                      ).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sessões Ativas</span>
                    <span className="text-sm font-medium">
                      {securityData.activeSessions.length}
                    </span>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-center space-x-2 text-success-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Conta Segura</span>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Todas as verificações de segurança aprovadas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle>Ações de Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Configurar 2FA
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Logs
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-error-600 hover:text-error-700"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Terminar Todas as Sessões
                </Button>
              </CardContent>
            </Card>

            {/* Dicas de Segurança */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Dicas de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
                    <p>Use senhas únicas e complexas</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
                    <p>Mantenha o 2FA sempre ativo</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
                    <p>Monitore sessões ativas regularmente</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
                    <p>Não compartilhe credenciais</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-success-500 mt-0.5" />
                    <p>Faça logout em computadores públicos</p>
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

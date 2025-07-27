import React, { useState, useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Activity,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bell,
  MessageCircle,
  Zap,
  BarChart3,
  FileText,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  brazilianUserManagement,
  BrazilianUser,
  UserRole,
  BRAZILIAN_ROLES,
  BRAZILIAN_PERMISSIONS,
  UserActivity,
} from "@/services/brazilian-user-management";
import { formatCPF, formatCNPJ, formatPhone } from "@/lib/brazilian-formatters";

export default function UserManagement() {
  const [users, setUsers] = useState<BrazilianUser[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [selectedUser, setSelectedUser] = useState<BrazilianUser | null>(null);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allUsers = brazilianUserManagement.getAllUsers();
      const recentActivities = brazilianUserManagement.getAllActivities(50);
      const stats = brazilianUserManagement.getUserStats();

      setUsers(allUsers);
      setActivities(recentActivities);
      setUserStats(stats);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cargo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role.id === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "text-green-600 bg-green-100";
      case "inativo":
        return "text-gray-600 bg-gray-100";
      case "suspenso":
        return "text-red-600 bg-red-100";
      case "aguardando_confirmacao":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRoleColor = (role: UserRole) => {
    return { color: role.corIdentificacao };
  };

  const formatLastLogin = (date: Date) => {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getActivityIcon = (categoria: string) => {
    switch (categoria) {
      case "login":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "logout":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "create":
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case "update":
        return <Edit className="h-4 w-4 text-yellow-600" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case "config":
        return <Settings className="h-4 w-4 text-purple-600" />;
      case "integration":
        return <Zap className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newStatus = user.status === "ativo" ? "suspenso" : "ativo";
    await brazilianUserManagement.updateUser(userId, { status: newStatus });
    loadData();
  };

  const createNewUser = async (userData: Partial<BrazilianUser>) => {
    try {
      await brazilianUserManagement.createUser(userData);
      setShowNewUserDialog(false);
      loadData();
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
    }
  };

  return (
    <MainLayout title="Gestão de Usuários">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span>Gestão de Usuários</span>
            </h1>
            <p className="text-muted-foreground">
              Sistema completo de usuários e permissões para empresas
              brasileiras
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={loadData}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>

            <Dialog
              open={showNewUserDialog}
              onOpenChange={setShowNewUserDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Convidar Novo Usuário</DialogTitle>
                </DialogHeader>
                <NewUserForm
                  onSubmit={createNewUser}
                  onCancel={() => setShowNewUserDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userStats.totalUsers}</p>
                    <p className="text-xs text-muted-foreground">
                      Total de Usuários
                    </p>
                    <p className="text-xs text-blue-600">
                      {userStats.activeUsers} ativos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userStats.activitiesLast24h}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Atividades 24h
                    </p>
                    <p className="text-xs text-green-600">
                      Média: {userStats.averageLogin.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {BRAZILIAN_ROLES.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Níveis de Acesso
                    </p>
                    <p className="text-xs text-purple-600">
                      {BRAZILIAN_PERMISSIONS.length} permissões
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {new Set(users.map((u) => u.departamento)).size}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Departamentos
                    </p>
                    <p className="text-xs text-orange-600">Equipes ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="roles">Funções & Permissões</TabsTrigger>
            <TabsTrigger value="activities">Log de Atividades</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, email ou cargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filtrar por função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as funções</SelectItem>
                      {BRAZILIAN_ROLES.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.icone} {role.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full lg:w-48">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                      <SelectItem value="aguardando_confirmacao">
                        Aguardando
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Usuários */}
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt={user.nome} />
                          <AvatarFallback>
                            {user.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-lg">
                              {user.nome}
                            </h4>
                            {user.role.categoria === "owner" && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{formatPhone(user.telefone)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Building2 className="h-3 w-3" />
                              <span>
                                {user.cargo} - {user.departamento}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                style={getRoleColor(user.role)}
                                className="text-xs"
                              >
                                {user.role.icone} {user.role.nome}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Nível {user.role.nivel}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                Último login:{" "}
                                {formatLastLogin(user.ultimoLogin)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar Usuário
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Gerenciar Permissões
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Enviar Convite
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus(user.id)}
                              className={
                                user.status === "ativo"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              {user.status === "ativo" ? (
                                <>
                                  <Lock className="mr-2 h-4 w-4" />
                                  Suspender
                                </>
                              ) : (
                                <>
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">
                    Nenhum usuário encontrado
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros ou convide novos usuários para a
                    equipe
                  </p>
                  <Button onClick={() => setShowNewUserDialog(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Convidar Primeiro Usuário
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {BRAZILIAN_ROLES.map((role) => (
                <Card
                  key={role.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="p-2 rounded-lg text-white"
                          style={{ backgroundColor: role.corIdentificacao }}
                        >
                          <span className="text-lg">{role.icone}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{role.nome}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Nível {role.nivel}</Badge>
                            {role.custoMensal && role.custoMensal > 0 && (
                              <Badge variant="secondary">
                                R$ {role.custoMensal.toFixed(2)}/mês
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription>{role.descricao}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold mb-2">Limitações</h5>
                        <div className="text-sm space-y-1">
                          {role.limitacoes.maxUsuarios && (
                            <div>
                              👥 Até {role.limitacoes.maxUsuarios} usuários
                            </div>
                          )}
                          {role.limitacoes.maxInstanciasWhatsApp && (
                            <div>
                              📱 Até {role.limitacoes.maxInstanciasWhatsApp}{" "}
                              instâncias WhatsApp
                            </div>
                          )}
                          {role.limitacoes.maxWorkflows && (
                            <div>
                              ⚡ Até {role.limitacoes.maxWorkflows} workflows
                            </div>
                          )}
                          {role.limitacoes.limiteMensalMensagens && (
                            <div>
                              💬 Até{" "}
                              {role.limitacoes.limiteMensalMensagens.toLocaleString(
                                "pt-BR",
                              )}{" "}
                              mensagens/mês
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">
                            Usuários com esta função
                          </span>
                          <Badge variant="outline">
                            {users.filter((u) => u.role.id === role.id).length}
                          </Badge>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Configurar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Ver Usuários
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Log de Atividades</CardTitle>
                <CardDescription>
                  Histórico completo de ações dos usuários (LGPD compliant)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activities.map((activity) => {
                    const user = users.find((u) => u.id === activity.userId);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.categoria)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {user?.nome || "Usuário desconhecido"}
                            </span>
                            <span className="text-muted-foreground">
                              {activity.acao}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>
                              {format(
                                activity.timestamp,
                                "dd/MM/yyyy 'às' HH:mm",
                                { locale: ptBR },
                              )}
                            </span>
                            <span>IP: {activity.ip}</span>
                            <span>Recurso: {activity.recurso}</span>
                            {activity.localizacao && (
                              <span>
                                📍 {activity.localizacao.cidade},{" "}
                                {activity.localizacao.estado}
                              </span>
                            )}
                          </div>
                        </div>

                        <Badge
                          className={
                            activity.resultado === "sucesso"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {activity.resultado}
                        </Badge>
                      </div>
                    );
                  })}

                  {activities.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">
                        Nenhuma atividade registrada
                      </h3>
                      <p className="text-muted-foreground">
                        As atividades dos usuários aparecerão aqui
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usuários por Função</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userStats?.usersByRole.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>{item.role}</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={(item.count / userStats.totalUsers) * 100}
                            className="w-20"
                          />
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usuários Mais Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userStats?.mostActiveUsers.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={item.user.avatar}
                              alt={item.user.nome}
                            />
                            <AvatarFallback>
                              {item.user.nome
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{item.user.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.user.cargo}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {item.activities} atividades
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog de Detalhes do Usuário */}
        {selectedUser && (
          <Dialog
            open={!!selectedUser}
            onOpenChange={() => setSelectedUser(null)}
          >
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      src={selectedUser.avatar}
                      alt={selectedUser.nome}
                    />
                    <AvatarFallback>
                      {selectedUser.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedUser.nome}</span>
                  {selectedUser.role.categoria === "owner" && (
                    <Crown className="h-5 w-5 text-yellow-500" />
                  )}
                </DialogTitle>
              </DialogHeader>

              <UserDetailsPanel user={selectedUser} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}

// Componente para formulário de novo usuário
function NewUserForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    departamento: "",
    roleId: "assistente",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      role: BRAZILIAN_ROLES.find((r) => r.id === formData.roleId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) =>
              setFormData({ ...formData, telefone: e.target.value })
            }
            placeholder="+55 (11) 99999-9999"
          />
        </div>

        <div>
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            value={formData.cargo}
            onChange={(e) =>
              setFormData({ ...formData, cargo: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departamento">Departamento</Label>
          <Input
            id="departamento"
            value={formData.departamento}
            onChange={(e) =>
              setFormData({ ...formData, departamento: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="role">Função</Label>
          <Select
            value={formData.roleId}
            onValueChange={(value) =>
              setFormData({ ...formData, roleId: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRAZILIAN_ROLES.filter((r) => r.id !== "owner").map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.icone} {role.nome} - Nível {role.nivel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="submit" className="flex-1">
          <UserPlus className="mr-2 h-4 w-4" />
          Enviar Convite
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Componente para detalhes do usuário
function UserDetailsPanel({ user }: { user: BrazilianUser }) {
  return (
    <Tabs defaultValue="info" className="space-y-4">
      <TabsList>
        <TabsTrigger value="info">Informações</TabsTrigger>
        <TabsTrigger value="permissions">Permissões</TabsTrigger>
        <TabsTrigger value="activity">Atividade</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
      </TabsList>

      <TabsContent value="info" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Nome:</strong> {user.nome}
              </div>
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>Telefone:</strong> {formatPhone(user.telefone)}
              </div>
              <div>
                <strong>Documento:</strong>{" "}
                {user.documento.tipo === "CPF"
                  ? formatCPF(user.documento.numero)
                  : formatCNPJ(user.documento.numero)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <strong>Cargo:</strong> {user.cargo}
              </div>
              <div>
                <strong>Departamento:</strong> {user.departamento}
              </div>
              <div>
                <strong>Função:</strong> {user.role.icone} {user.role.nome}
              </div>
              <div>
                <strong>Nível:</strong> {user.role.nivel}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Nome:</strong> {user.empresa.nome}
            </div>
            <div>
              <strong>CNPJ:</strong> {formatCNPJ(user.empresa.cnpj)}
            </div>
            <div>
              <strong>Segmento:</strong> {user.empresa.segmento}
            </div>
            <div>
              <strong>Porte:</strong> {user.empresa.porte}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="permissions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Permissões Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2 p-2 border rounded"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">{permission.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {permission.descricao}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {brazilianUserManagement
                .getUserActivities(user.id, 10)
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium">{activity.acao}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(activity.timestamp, "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                    <Badge>{activity.resultado}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tema</Label>
                <div className="text-sm">{user.configuracoes.tema}</div>
              </div>
              <div>
                <Label>Idioma</Label>
                <div className="text-sm">{user.configuracoes.idioma}</div>
              </div>
              <div>
                <Label>Fuso Horário</Label>
                <div className="text-sm">{user.configuracoes.fusoHorario}</div>
              </div>
              <div>
                <Label>Formato de Data</Label>
                <div className="text-sm">{user.configuracoes.formatoData}</div>
              </div>
            </div>

            <div>
              <Label>Notificações</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className={`h-4 w-4 ${user.configuracoes.notificacoes.email.ativo ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span className="text-sm">Email</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className={`h-4 w-4 ${user.configuracoes.notificacoes.whatsapp.ativo ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span className="text-sm">WhatsApp</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className={`h-4 w-4 ${user.configuracoes.notificacoes.push.ativo ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span className="text-sm">Push</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className={`h-4 w-4 ${user.configuracoes.notificacoes.slack.ativo ? "text-green-600" : "text-gray-400"}`}
                  />
                  <span className="text-sm">Slack</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

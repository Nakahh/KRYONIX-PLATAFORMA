import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserX,
  Mail,
  Shield,
  Crown,
  Eye,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Send,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import KryonixLayout from "@/components/layout/KryonixLayout";

// Dados de usuários (simulados)
const usersData = [
  {
    id: 1,
    name: "Vitor Jayme Fernandes Ferreira",
    email: "vitor@kryonix.com.br",
    role: "owner",
    status: "active",
    lastLogin: "2024-01-20T14:30:00Z",
    joinDate: "2024-01-15T10:00:00Z",
    avatar: "",
    permissions: ["all"],
    department: "Direção",
  },
  {
    id: 2,
    name: "Maria Silva Santos",
    email: "maria@kryonix.com.br",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-20T13:15:00Z",
    joinDate: "2024-01-16T14:20:00Z",
    avatar: "",
    permissions: ["dashboard", "settings", "users"],
    department: "Operações",
  },
  {
    id: 3,
    name: "João Pedro Oliveira",
    email: "joao@kryonix.com.br",
    role: "manager",
    status: "active",
    lastLogin: "2024-01-20T11:45:00Z",
    joinDate: "2024-01-17T09:30:00Z",
    avatar: "",
    permissions: ["dashboard", "whatsapp", "analytics"],
    department: "Marketing",
  },
  {
    id: 4,
    name: "Ana Carolina Rodrigues",
    email: "ana@kryonix.com.br",
    role: "user",
    status: "active",
    lastLogin: "2024-01-19T16:20:00Z",
    joinDate: "2024-01-18T11:15:00Z",
    avatar: "",
    permissions: ["dashboard", "whatsapp"],
    department: "Atendimento",
  },
  {
    id: 5,
    name: "Carlos Eduardo Lima",
    email: "carlos@kryonix.com.br",
    role: "user",
    status: "pending",
    lastLogin: null,
    joinDate: "2024-01-19T15:30:00Z",
    avatar: "",
    permissions: ["dashboard"],
    department: "Vendas",
  },
];

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gerente",
  user: "Usuário",
  viewer: "Visualizador",
};

const roleColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
  manager: "bg-blue-100 text-blue-800",
  user: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  inactive: "Inativo",
  suspended: "Suspenso",
};

const statusColors: Record<string, string> = {
  active: "bg-success-100 text-success-800",
  pending: "bg-warning-100 text-warning-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-error-100 text-error-800",
};

export default function UsersPage() {
  const [users, setUsers] = useState(usersData);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    (typeof usersData)[0] | null
  >(null);

  // Dados para convite
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "user",
    department: "",
    message: "",
  });

  const handleInviteUser = async () => {
    // Simular envio de convite
    console.log("Enviando convite:", inviteData);
    setIsInviteDialogOpen(false);
    setInviteData({ email: "", role: "user", department: "", message: "" });
    // Aqui viria a lógica de envio do convite
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleChangeUserRole = (userId: number, newRole: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user,
      ),
    );
  };

  const handleChangeUserStatus = (userId: number, newStatus: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user,
      ),
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return "Nunca";
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Agora mesmo";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  const userStats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "pending").length,
    admins: users.filter((u) => ["owner", "admin"].includes(u.role)).length,
  };

  return (
    <KryonixLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              👥 Usuários & Equipe
            </h1>
            <p className="text-gray-600">
              Gerencie usuários, permissões e acessos da plataforma KRYONIX
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>

            <Dialog
              open={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Convidar Novo Usuário
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteEmail">E-mail</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="usuario@exemplo.com"
                      value={inviteData.email}
                      onChange={(e) =>
                        setInviteData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="inviteRole">Função</Label>
                    <Select
                      value={inviteData.role}
                      onValueChange={(value) =>
                        setInviteData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="inviteDepartment">Departamento</Label>
                    <Input
                      id="inviteDepartment"
                      placeholder="Ex: Marketing, Vendas, Suporte"
                      value={inviteData.department}
                      onChange={(e) =>
                        setInviteData((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="inviteMessage">Mensagem (opcional)</Label>
                    <textarea
                      id="inviteMessage"
                      placeholder="Adicione uma mensagem personalizada ao convite..."
                      value={inviteData.message}
                      onChange={(e) =>
                        setInviteData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      className="mt-1 w-full p-2 border rounded-lg resize-none h-20"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleInviteUser}
                      className="flex-1 btn-primary"
                      disabled={!inviteData.email}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Convite
                    </Button>
                    <Button
                      onClick={() => setIsInviteDialogOpen(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats.total}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-success-600">
                    {userStats.active}
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
                  <p className="text-sm text-gray-600">Convites Pendentes</p>
                  <p className="text-2xl font-bold text-warning-600">
                    {userStats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-warning-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {userStats.admins}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="card-modern">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as funções</SelectItem>
                    <SelectItem value="owner">Proprietário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-gray-600">
                Mostrando {filteredUsers.length} de {users.length} usuários
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Usuários */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Lista de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary-500 text-white font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        <Badge className={roleColors[user.role]}>
                          {user.role === "owner" && (
                            <Crown className="h-3 w-3 mr-1" />
                          )}
                          {user.role === "admin" && (
                            <Shield className="h-3 w-3 mr-1" />
                          )}
                          {roleLabels[user.role]}
                        </Badge>
                        <Badge className={statusColors[user.status]}>
                          {statusLabels[user.status]}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-1">{user.email}</p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>📍 {user.department}</span>
                        <span>
                          🕐 Último acesso: {formatLastLogin(user.lastLogin)}
                        </span>
                        <span>
                          📅 Membro desde:{" "}
                          {new Date(user.joinDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Reenviar Convite
                        </DropdownMenuItem>
                        {user.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeUserStatus(user.id, "suspended")
                            }
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Suspender
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeUserStatus(user.id, "active")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Ativar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-error-600"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === "owner"}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm
                    ? "Nenhum usuário encontrado"
                    : "Nenhum usuário cadastrado"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? "Tente buscar por outro termo ou ajustar os filtros"
                    : "Comece convidando membros da sua equipe para colaborar"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsInviteDialogOpen(true)}
                    className="btn-primary"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar Primeiro Usuário
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissões e Funções */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Permissões por Função
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Crown className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold">Proprietário</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Acesso total à plataforma</li>
                  <li>✅ Gerenciar usuários e permissões</li>
                  <li>✅ Configurações de cobrança</li>
                  <li>✅ White label e personalização</li>
                  <li>✅ Logs de auditoria</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold">Administrador</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Dashboard e analytics</li>
                  <li>✅ Gerenciar usuários (limitado)</li>
                  <li>✅ Configurações globais</li>
                  <li>✅ Todas as stacks</li>
                  <li>❌ Configurações de cobrança</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Gerente</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Dashboard e relatórios</li>
                  <li>✅ WhatsApp e chatbots</li>
                  <li>✅ Automações N8N</li>
                  <li>✅ Analytics da equipe</li>
                  <li>❌ Configurações globais</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Usuário</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Dashboard básico</li>
                  <li>✅ WhatsApp e atendimento</li>
                  <li>✅ Relatórios pessoais</li>
                  <li>❌ Configurações</li>
                  <li>❌ Gerenciar outros usuários</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold">Visualizador</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Dashboard somente leitura</li>
                  <li>✅ Relatórios básicos</li>
                  <li>❌ Editar configurações</li>
                  <li>❌ Enviar mensagens</li>
                  <li>❌ Acessar dados sensíveis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </KryonixLayout>
  );
}

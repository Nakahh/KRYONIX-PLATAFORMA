import React, { useState, useEffect, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  MessageCircle,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreHorizontal,
  Plus,
  Settings,
  Search,
  Bell,
  Hash,
  Lock,
  Globe,
  Smile,
  Image,
  File,
  Zap,
  Star,
  Pin,
  Download,
  Share2,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  PhoneOff,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  brazilianUserManagement,
  BrazilianUser,
} from "@/services/brazilian-user-management";

interface ChatMessage {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  tipo: "text" | "image" | "file" | "system" | "emoji";
  anexos?: MessageAttachment[];
  replyTo?: string;
  editado?: boolean;
  reactions?: MessageReaction[];
}

interface MessageAttachment {
  id: string;
  nome: string;
  tipo: "image" | "document" | "video" | "audio";
  url: string;
  tamanho: number;
}

interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

interface TeamChannel {
  id: string;
  nome: string;
  descricao: string;
  tipo: "public" | "private" | "direct";
  membros: string[];
  criador: string;
  dataCriacao: Date;
  ultimaMensagem?: Date;
  notificacoes: boolean;
  pinnedMessages: string[];
  configuracoes: ChannelSettings;
}

interface ChannelSettings {
  permiteAnexos: boolean;
  permiteEdicao: boolean;
  retemMensagens: number; // em dias
  moderacao: boolean;
  webhooks: string[];
}

interface TeamProject {
  id: string;
  nome: string;
  descricao: string;
  status: "planejamento" | "desenvolvimento" | "revisao" | "concluido";
  prioridade: "baixa" | "media" | "alta" | "critica";
  responsavel: string;
  equipe: string[];
  dataInicio: Date;
  dataFim?: Date;
  progresso: number;
  tarefas: ProjectTask[];
  anexos: string[];
}

interface ProjectTask {
  id: string;
  titulo: string;
  descricao: string;
  status: "pendente" | "em_andamento" | "concluida";
  responsavel: string;
  prazo?: Date;
  prioridade: "baixa" | "media" | "alta";
  estimativa: number; // em horas
  tempoGasto: number; // em horas
}

export default function TeamCollaboration() {
  const [users, setUsers] = useState<BrazilianUser[]>([]);
  const [activeChannel, setActiveChannel] = useState<TeamChannel | null>(null);
  const [channels, setChannels] = useState<TeamChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [projects, setProjects] = useState<TeamProject[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [isOnlineCall, setIsOnlineCall] = useState(false);
  const [callParticipants, setCallParticipants] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCollaborationData();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadCollaborationData = () => {
    // Carregar usuários
    const allUsers = brazilianUserManagement.getAllUsers();
    setUsers(allUsers);

    // Canais de exemplo
    const exampleChannels: TeamChannel[] = [
      {
        id: "geral",
        nome: "Geral",
        descricao: "Canal principal para toda a equipe",
        tipo: "public",
        membros: allUsers.map((u) => u.id),
        criador: "001",
        dataCriacao: new Date("2024-01-01"),
        ultimaMensagem: new Date(),
        notificacoes: true,
        pinnedMessages: [],
        configuracoes: {
          permiteAnexos: true,
          permiteEdicao: true,
          retemMensagens: 365,
          moderacao: false,
          webhooks: [],
        },
      },
      {
        id: "desenvolvimento",
        nome: "Desenvolvimento",
        descricao: "Discussões técnicas e desenvolvimento",
        tipo: "public",
        membros: allUsers
          .filter((u) =>
            ["analista", "coordenador", "admin"].includes(u.role.id),
          )
          .map((u) => u.id),
        criador: "001",
        dataCriacao: new Date("2024-01-05"),
        ultimaMensagem: new Date(Date.now() - 3600000),
        notificacoes: true,
        pinnedMessages: [],
        configuracoes: {
          permiteAnexos: true,
          permiteEdicao: true,
          retemMensagens: 365,
          moderacao: true,
          webhooks: ["github", "deploy"],
        },
      },
      {
        id: "vendas",
        nome: "Vendas & Marketing",
        descricao: "Estratégias de vendas e campanhas",
        tipo: "private",
        membros: allUsers
          .filter((u) =>
            ["supervisor", "gerente", "diretor"].includes(u.role.id),
          )
          .map((u) => u.id),
        criador: "001",
        dataCriacao: new Date("2024-01-10"),
        ultimaMensagem: new Date(Date.now() - 7200000),
        notificacoes: true,
        pinnedMessages: [],
        configuracoes: {
          permiteAnexos: true,
          permiteEdicao: false,
          retemMensagens: 180,
          moderacao: true,
          webhooks: [],
        },
      },
    ];

    setChannels(exampleChannels);
    setActiveChannel(exampleChannels[0]);

    // Mensagens de exemplo
    const exampleMessages: ChatMessage[] = [
      {
        id: "1",
        authorId: "001",
        content:
          "Bom dia, equipe! 🌅 Que tal começarmos mais um dia produtivo? Temos algumas novidades importantes para compartilhar sobre o desenvolvimento da plataforma KRYONIX.",
        timestamp: new Date(Date.now() - 14400000), // 4 horas atrás
        tipo: "text",
        reactions: [
          {
            emoji: "👋",
            userId: "001",
            timestamp: new Date(Date.now() - 14000000),
          },
          {
            emoji: "🚀",
            userId: "001",
            timestamp: new Date(Date.now() - 13800000),
          },
        ],
      },
      {
        id: "2",
        authorId: "001",
        content:
          "Acabamos de finalizar a implementação do sistema de analytics avançado! 📊 Os relatórios agora incluem dados específicos para empresas brasileiras, com métricas de PIX, WhatsApp e compliance LGPD.",
        timestamp: new Date(Date.now() - 10800000), // 3 horas atrás
        tipo: "text",
        reactions: [
          {
            emoji: "🎉",
            userId: "001",
            timestamp: new Date(Date.now() - 10700000),
          },
          {
            emoji: "👏",
            userId: "001",
            timestamp: new Date(Date.now() - 10600000),
          },
        ],
      },
      {
        id: "3",
        authorId: "001",
        content:
          "Próxima etapa: sistema de colaboração em equipe que estamos testando agora! Este chat permitirá integração com WhatsApp, N8N e todas as nossas 25 stacks. 💪",
        timestamp: new Date(Date.now() - 7200000), // 2 horas atrás
        tipo: "text",
      },
      {
        id: "4",
        authorId: "001",
        content:
          "Para hoje, vamos focar em:\n\n✅ Finalizar sistema de notificações\n⚡ Implementar onboarding brasileiro\n🔐 Aprimorar sistema de permissões\n📱 Otimizar interface mobile\n\nQuem tiver dúvidas, só chamar!",
        timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
        tipo: "text",
        reactions: [
          {
            emoji: "✅",
            userId: "001",
            timestamp: new Date(Date.now() - 3500000),
          },
        ],
      },
    ];

    setMessages(exampleMessages);

    // Projetos de exemplo
    const exampleProjects: TeamProject[] = [
      {
        id: "kryonix-v2",
        nome: "KRYONIX Platform v2.0",
        descricao:
          "Desenvolvimento da nova versão da plataforma com IA avançada e integração completa das 25 stacks brasileiras",
        status: "desenvolvimento",
        prioridade: "critica",
        responsavel: "001",
        equipe: allUsers.map((u) => u.id),
        dataInicio: new Date("2024-01-01"),
        progresso: 75,
        tarefas: [
          {
            id: "task-1",
            titulo: "Sistema de Analytics Avançado",
            descricao: "Implementar dashboard com métricas brasileiras",
            status: "concluida",
            responsavel: "001",
            prioridade: "alta",
            estimativa: 40,
            tempoGasto: 38,
          },
          {
            id: "task-2",
            titulo: "Gestão de Usuários",
            descricao: "Sistema RBAC com hierarquia brasileira",
            status: "em_andamento",
            responsavel: "001",
            prioridade: "alta",
            estimativa: 32,
            tempoGasto: 28,
          },
          {
            id: "task-3",
            titulo: "Sistema de Colaboração",
            descricao: "Chat em equipe com integração WhatsApp",
            status: "em_andamento",
            responsavel: "001",
            prioridade: "media",
            estimativa: 24,
            tempoGasto: 18,
          },
        ],
        anexos: [],
      },
      {
        id: "whatsapp-integration",
        nome: "Integração WhatsApp Business",
        descricao:
          "Aprimoramento da integração com WhatsApp Business API para empresas brasileiras",
        status: "revisao",
        prioridade: "alta",
        responsavel: "001",
        equipe: ["001"],
        dataInicio: new Date("2024-01-15"),
        progresso: 95,
        tarefas: [
          {
            id: "whats-1",
            titulo: "Multi-instâncias",
            descricao: "Suporte a múltiplas instâncias simultâneas",
            status: "concluida",
            responsavel: "001",
            prioridade: "alta",
            estimativa: 16,
            tempoGasto: 15,
          },
        ],
        anexos: [],
      },
    ];

    setProjects(exampleProjects);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !activeChannel) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      authorId: "001", // ID do usuário atual
      content: newMessage,
      timestamp: new Date(),
      tipo: "text",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Atualizar última mensagem do canal
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === activeChannel.id
          ? { ...channel, ultimaMensagem: new Date() }
          : channel,
      ),
    );
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === messageId) {
          const reactions = message.reactions || [];
          const existingReaction = reactions.find(
            (r) => r.emoji === emoji && r.userId === "001",
          );

          if (existingReaction) {
            // Remove reaction if exists
            return {
              ...message,
              reactions: reactions.filter(
                (r) => !(r.emoji === emoji && r.userId === "001"),
              ),
            };
          } else {
            // Add new reaction
            return {
              ...message,
              reactions: [
                ...reactions,
                { emoji, userId: "001", timestamp: new Date() },
              ],
            };
          }
        }
        return message;
      }),
    );
  };

  const startVideoCall = () => {
    setIsOnlineCall(true);
    setCallParticipants(["001"]); // Adicionar usuário atual
  };

  const endCall = () => {
    setIsOnlineCall(false);
    setCallParticipants([]);
  };

  const getChannelIcon = (channel: TeamChannel) => {
    if (channel.tipo === "private") return <Lock className="h-4 w-4" />;
    if (channel.tipo === "direct") return <MessageCircle className="h-4 w-4" />;
    return <Hash className="h-4 w-4" />;
  };

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planejamento":
        return "text-blue-600 bg-blue-100";
      case "desenvolvimento":
        return "text-yellow-600 bg-yellow-100";
      case "revisao":
        return "text-purple-600 bg-purple-100";
      case "concluido":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critica":
        return "text-red-600 bg-red-100";
      case "alta":
        return "text-orange-600 bg-orange-100";
      case "media":
        return "text-yellow-600 bg-yellow-100";
      case "baixa":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Canais e Usuários */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header da Sidebar */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">KRYONIX Team</h2>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewChannelDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar canais ou pessoas..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Canais */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="text-sm font-semibold text-muted-foreground mb-2">
              CANAIS
            </div>
            <div className="space-y-1">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    activeChannel?.id === channel.id
                      ? "bg-blue-100 text-blue-600"
                      : ""
                  }`}
                >
                  {getChannelIcon(channel)}
                  <span className="flex-1 font-medium">{channel.nome}</span>
                  {channel.ultimaMensagem && (
                    <div className="text-xs text-muted-foreground">
                      {format(channel.ultimaMensagem, "HH:mm")}
                    </div>
                  )}
                  {channel.tipo === "private" && (
                    <Badge variant="secondary" className="text-xs">
                      Privado
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Usuários Online */}
          <div className="p-4 border-t">
            <div className="text-sm font-semibold text-muted-foreground mb-2">
              USUÁRIOS ONLINE (
              {users.filter((u) => u.status === "ativo").length})
            </div>
            <div className="space-y-2">
              {users
                .filter((u) => u.status === "ativo")
                .slice(0, 5)
                .map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.nome} />
                        <AvatarFallback>
                          {user.nome
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{user.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.cargo}
                      </div>
                    </div>
                    {user.role.categoria === "owner" && (
                      <Crown className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header do Canal */}
        {activeChannel && (
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getChannelIcon(activeChannel)}
              <div>
                <h3 className="font-semibold">{activeChannel.nome}</h3>
                <p className="text-sm text-muted-foreground">
                  {activeChannel.descricao}
                </p>
              </div>
              <Badge variant="outline">
                {activeChannel.membros.length} membros
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={startVideoCall}>
                <Video className="h-4 w-4 mr-1" />
                Chamada
              </Button>
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4 mr-1" />
                Voz
              </Button>
              <Button size="sm" variant="ghost">
                <Pin className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações do Canal
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Membros
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Pin className="mr-2 h-4 w-4" />
                    Mensagens Fixadas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const author = getUserById(message.authorId);
            if (!author) return null;

            return (
              <div
                key={message.id}
                className="flex items-start space-x-3 group"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={author.avatar} alt={author.nome} />
                  <AvatarFallback>
                    {author.nome
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold">{author.nome}</span>
                    <Badge variant="outline" className="text-xs">
                      {author.role.icone} {author.role.nome}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(message.timestamp, "HH:mm", { locale: ptBR })}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>

                  {/* Reações */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex items-center space-x-1 mb-2">
                      {Object.entries(
                        message.reactions.reduce(
                          (acc, reaction) => {
                            acc[reaction.emoji] =
                              (acc[reaction.emoji] || 0) + 1;
                            return acc;
                          },
                          {} as Record<string, number>,
                        ),
                      ).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(message.id, emoji)}
                          className="flex items-center space-x-1 px-2 py-1 bg-white border rounded-full text-xs hover:bg-gray-50"
                        >
                          <span>{emoji}</span>
                          <span>{count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Ações da Mensagem */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-2 text-xs">
                      <button
                        onClick={() => addReaction(message.id, "👍")}
                        className="hover:text-blue-600"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => addReaction(message.id, "❤️")}
                        className="hover:text-red-600"
                      >
                        ❤️
                      </button>
                      <button
                        onClick={() => addReaction(message.id, "😊")}
                        className="hover:text-yellow-600"
                      >
                        😊
                      </button>
                      <button className="hover:text-blue-600">Responder</button>
                      <button className="hover:text-blue-600">
                        Compartilhar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Campo de Entrada de Mensagem */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Button size="sm" variant="ghost">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Image className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-end space-x-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Mensagem para #${activeChannel?.nome || "canal"}`}
                  className="resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Direita - Projetos */}
      <div className="w-80 bg-white border-l">
        <Tabs defaultValue="projects" className="h-full flex flex-col">
          <TabsList className="m-4">
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="flex-1 px-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Projetos Ativos</h3>
              <Button size="sm" onClick={() => setShowNewProjectDialog(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{project.nome}</h4>
                      <div className="flex space-x-1">
                        <Badge
                          className={getStatusColor(project.status)}
                          variant="secondary"
                        >
                          {project.status}
                        </Badge>
                        <Badge
                          className={getPriorityColor(project.prioridade)}
                          variant="secondary"
                        >
                          {project.prioridade}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {project.descricao}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{project.progresso}%</span>
                      </div>
                      <Progress value={project.progresso} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex -space-x-1">
                        {project.equipe.slice(0, 3).map((memberId) => {
                          const member = getUserById(memberId);
                          return member ? (
                            <Avatar
                              key={memberId}
                              className="h-6 w-6 border-2 border-white"
                            >
                              <AvatarImage
                                src={member.avatar}
                                alt={member.nome}
                              />
                              <AvatarFallback>
                                {member.nome
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ) : null;
                        })}
                        {project.equipe.length > 3 && (
                          <div className="h-6 w-6 bg-gray-200 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium">
                            +{project.equipe.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {
                          project.tarefas.filter(
                            (t) => t.status === "concluida",
                          ).length
                        }
                        /{project.tarefas.length} tarefas
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members" className="flex-1 px-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Membros da Equipe</h3>
              <Button size="sm">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.nome} />
                      <AvatarFallback>
                        {user.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {user.status === "ativo" && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium text-sm">{user.nome}</span>
                      {user.role.categoria === "owner" && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.cargo}
                    </div>
                    <div className="text-xs">
                      <Badge
                        variant="outline"
                        style={{ color: user.role.corIdentificacao }}
                      >
                        {user.role.icone} {user.role.nome}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Mensagem Direta
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        Ligar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Video className="mr-2 h-4 w-4" />
                        Videochamada
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Chamada de Video */}
      {isOnlineCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                Chamada de Vídeo - {activeChannel?.nome}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  00:05:23
                </Badge>
              </div>
            </div>

            {/* Área de Vídeo */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Avatar className="h-20 w-20 mx-auto mb-2">
                    <AvatarImage src={users[0]?.avatar} alt={users[0]?.nome} />
                    <AvatarFallback>
                      {users[0]?.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{users[0]?.nome}</p>
                  <p className="text-sm text-gray-300">Você</p>
                </div>
              </div>

              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>Aguardando participantes...</p>
                </div>
              </div>
            </div>

            {/* Controles da Chamada */}
            <div className="flex items-center justify-center space-x-4">
              <Button variant="outline" size="lg">
                <Mic className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Camera className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="destructive" size="lg" onClick={endCall}>
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog para Novo Canal */}
      <Dialog
        open={showNewChannelDialog}
        onOpenChange={setShowNewChannelDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Canal</DialogTitle>
          </DialogHeader>
          <NewChannelForm onSubmit={() => setShowNewChannelDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog para Novo Projeto */}
      <Dialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
          </DialogHeader>
          <NewProjectForm onSubmit={() => setShowNewProjectDialog(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para criar novo canal
function NewChannelForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "public" as "public" | "private",
    permiteAnexos: true,
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome do Canal</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="ex: marketing-digital"
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) =>
            setFormData({ ...formData, descricao: e.target.value })
          }
          placeholder="Descreva o propósito deste canal..."
        />
      </div>

      <div>
        <Label>Tipo do Canal</Label>
        <Select
          value={formData.tipo}
          onValueChange={(value: any) =>
            setFormData({ ...formData, tipo: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">
              🌐 Público - Todos podem ver e participar
            </SelectItem>
            <SelectItem value="private">
              🔒 Privado - Apenas membros convidados
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="anexos"
          checked={formData.permiteAnexos}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, permiteAnexos: checked })
          }
        />
        <Label htmlFor="anexos">Permitir anexos e arquivos</Label>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button onClick={onSubmit} className="flex-1">
          Criar Canal
        </Button>
        <Button variant="outline" onClick={onSubmit}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// Componente para criar novo projeto
function NewProjectForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    prioridade: "media" as "baixa" | "media" | "alta" | "critica",
    dataFim: "",
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Projeto</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="Nome do projeto..."
          />
        </div>

        <div>
          <Label htmlFor="prioridade">Prioridade</Label>
          <Select
            value={formData.prioridade}
            onValueChange={(value: any) =>
              setFormData({ ...formData, prioridade: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">🟢 Baixa</SelectItem>
              <SelectItem value="media">🟡 Média</SelectItem>
              <SelectItem value="alta">🟠 Alta</SelectItem>
              <SelectItem value="critica">🔴 Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) =>
            setFormData({ ...formData, descricao: e.target.value })
          }
          placeholder="Descreva os objetivos e escopo do projeto..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="dataFim">Data de Conclusão (opcional)</Label>
        <Input
          id="dataFim"
          type="date"
          value={formData.dataFim}
          onChange={(e) =>
            setFormData({ ...formData, dataFim: e.target.value })
          }
        />
      </div>

      <div className="flex space-x-2 pt-4">
        <Button onClick={onSubmit} className="flex-1">
          Criar Projeto
        </Button>
        <Button variant="outline" onClick={onSubmit}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

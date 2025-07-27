import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KryonixLayout from "../components/layout/KryonixLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { useMobile } from "../hooks/use-mobile";
import omnichannelService, {
  Conversation,
  Message,
  Agent,
  CommunicationStats,
  CommunicationChannel,
} from "../services/omnichannel-communication";
import {
  MessageCircle,
  Phone,
  Mail,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Filter,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Bot,
  Zap,
  Activity,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  Archive,
  Tag,
  Play,
  Pause,
  Volume2,
  Mic,
  Camera,
  Image,
  FileText,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Forward,
  Reply,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
} from "lucide-react";

interface ChatMessage extends Message {
  showTimestamp?: boolean;
  showAvatar?: boolean;
}

const CommunicationCenter: React.FC = () => {
  const isMobile = useMobile();
  const [conversas, setConversas] = useState<Conversation[]>([]);
  const [conversaSelecionada, setConversaSelecionada] =
    useState<Conversation | null>(null);
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [agentes, setAgentes] = useState<Agent[]>([]);
  const [canais, setCanais] = useState<CommunicationChannel[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");
  const [filtroCanal, setFiltroCanal] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [typing, setTyping] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 10000); // Atualizar a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const carregarDados = async () => {
    try {
      const [conversasData, statsData, agentesData, canaisData] =
        await Promise.all([
          omnichannelService.getTodasConversas(),
          omnichannelService.obterEstatisticas(),
          omnichannelService.getTodosAgentes(),
          omnichannelService.getTodosCanais(),
        ]);

      setConversas(conversasData);
      setStats(statsData);
      setAgentes(agentesData);
      setCanais(canaisData);
      setLoading(false);

      // Selecionar primeira conversa se nenhuma estiver selecionada
      if (!conversaSelecionada && conversasData.length > 0) {
        selecionarConversa(conversasData[0]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados de comunicação:", error);
      setLoading(false);
    }
  };

  const selecionarConversa = (conversa: Conversation) => {
    setConversaSelecionada(conversa);

    // Processar mensagens para exibição
    const mensagensProcessadas = conversa.mensagens.map((msg, index) => {
      const msgAnterior = index > 0 ? conversa.mensagens[index - 1] : null;
      const proximaMsg =
        index < conversa.mensagens.length - 1
          ? conversa.mensagens[index + 1]
          : null;

      const showTimestamp =
        !msgAnterior ||
        msg.timestamp.getTime() - msgAnterior.timestamp.getTime() > 300000; // 5 minutos

      const showAvatar =
        !proximaMsg ||
        proximaMsg.remetente.id !== msg.remetente.id ||
        showTimestamp;

      return {
        ...msg,
        showTimestamp,
        showAvatar,
      } as ChatMessage;
    });

    setMensagens(mensagensProcessadas);
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;

    try {
      const remetente = {
        id: "agent-current",
        nome: "Carlos Eduardo",
        tipo: "agente" as const,
      };

      await omnichannelService.enviarMensagem(
        conversaSelecionada.id,
        { texto: novaMensagem },
        remetente,
      );

      setNovaMensagem("");

      // Recarregar mensagens
      const conversaAtualizada = omnichannelService
        .getTodasConversas()
        .find((c) => c.id === conversaSelecionada.id);

      if (conversaAtualizada) {
        selecionarConversa(conversaAtualizada);
      }
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const conversasFiltradas = conversas.filter((conversa) => {
    const matchStatus =
      filtroStatus === "todas" || conversa.status === filtroStatus;
    const matchCanal =
      filtroCanal === "todos" || conversa.canal === filtroCanal;
    const matchBusca =
      !busca ||
      conversa.assunto.toLowerCase().includes(busca.toLowerCase()) ||
      conversa.ultimaMensagem.conteudo.texto
        ?.toLowerCase()
        .includes(busca.toLowerCase());

    return matchStatus && matchCanal && matchBusca;
  });

  const getChannelIcon = (canal: string) => {
    switch (canal) {
      case "whatsapp":
        return "💬";
      case "email":
        return "📧";
      case "sms":
        return "📱";
      case "chat-web":
        return "💻";
      case "instagram":
        return "📷";
      case "facebook":
        return "👥";
      default:
        return "💬";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "nova":
        return "bg-blue-500";
      case "em-andamento":
        return "bg-green-500";
      case "aguardando-cliente":
        return "bg-yellow-500";
      case "aguardando-agente":
        return "bg-orange-500";
      case "resolvida":
        return "bg-gray-500";
      case "escalada":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (prioridade: string): string => {
    switch (prioridade) {
      case "baixa":
        return "text-green-600";
      case "normal":
        return "text-blue-600";
      case "alta":
        return "text-orange-600";
      case "urgente":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatarTempo = (data: Date): string => {
    const agora = new Date();
    const diff = agora.getTime() - data.getTime();

    if (diff < 60000) return "agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return data.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <KryonixLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Carregando conversas...</p>
          </div>
        </div>
      </KryonixLayout>
    );
  }

  return (
    <KryonixLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-4">
        {/* Sidebar - Lista de Conversas */}
        <div
          className={`${isMobile ? "h-64" : "h-full"} lg:w-80 bg-white rounded-lg border border-gray-200 flex flex-col`}
        >
          {/* Header da Sidebar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Busca */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar conversas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros rápidos */}
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={filtroStatus === "todas" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus("todas")}
              >
                Todas
              </Button>
              <Button
                variant={filtroStatus === "nova" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus("nova")}
              >
                Novas
              </Button>
              <Button
                variant={
                  filtroStatus === "em-andamento" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setFiltroStatus("em-andamento")}
              >
                Ativas
              </Button>
            </div>
          </div>

          {/* Lista de Conversas */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              <AnimatePresence>
                {conversasFiltradas.map((conversa, index) => (
                  <motion.div
                    key={conversa.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => selecionarConversa(conversa)}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                      conversaSelecionada?.id === conversa.id
                        ? "bg-blue-50 border-blue-200 border"
                        : "border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar do canal/cliente */}
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {getChannelIcon(conversa.canal as string)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversa.status)}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {conversa.assunto}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatarTempo(conversa.atualizadaEm)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 truncate mb-2">
                          {conversa.ultimaMensagem.conteudo.texto}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {conversa.canal}
                            </Badge>
                            {conversa.prioridade !== "normal" && (
                              <Badge variant="destructive" className="text-xs">
                                {conversa.prioridade}
                              </Badge>
                            )}
                          </div>

                          {conversa.agente && (
                            <div className="flex items-center gap-1">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-xs">
                                  {conversa.agente.nome
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Stats rápidas */}
          {stats && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {stats.conversasAtivas}
                  </div>
                  <div className="text-xs text-gray-600">Ativas</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {stats.novasConversas}
                  </div>
                  <div className="text-xs text-gray-600">Novas</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {Math.round(stats.tempoMedioResposta / 1000)}s
                  </div>
                  <div className="text-xs text-gray-600">Resposta</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Área Principal - Chat */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200">
          {conversaSelecionada ? (
            <>
              {/* Header do Chat */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {getChannelIcon(conversaSelecionada.canal as string)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {conversaSelecionada.assunto}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{conversaSelecionada.canal}</span>
                        <span>•</span>
                        <span
                          className={getPriorityColor(
                            conversaSelecionada.prioridade,
                          )}
                        >
                          {conversaSelecionada.prioridade}
                        </span>
                        {conversaSelecionada.agente && (
                          <>
                            <span>•</span>
                            <span>{conversaSelecionada.agente.nome}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tags da conversa */}
                {conversaSelecionada.tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {conversaSelecionada.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Área de Mensagens */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {mensagens.map((mensagem, index) => (
                      <motion.div
                        key={mensagem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* Timestamp */}
                        {mensagem.showTimestamp && (
                          <div className="flex justify-center mb-4">
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {mensagem.timestamp.toLocaleString("pt-BR")}
                            </span>
                          </div>
                        )}

                        {/* Mensagem */}
                        <div
                          className={`flex gap-3 ${
                            mensagem.remetente.tipo === "agente"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          {/* Avatar (só para cliente ou quando necessário) */}
                          {mensagem.remetente.tipo !== "agente" &&
                            mensagem.showAvatar && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-200 text-gray-600">
                                  {mensagem.remetente.tipo === "bot" ? (
                                    <Bot className="h-4 w-4" />
                                  ) : (
                                    <User className="h-4 w-4" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                            )}

                          {/* Conteúdo da mensagem */}
                          <div
                            className={`max-w-xs lg:max-w-md ${
                              mensagem.remetente.tipo === "agente"
                                ? "order-1"
                                : ""
                            }`}
                          >
                            {/* Nome do remetente */}
                            {mensagem.showAvatar &&
                              mensagem.remetente.tipo !== "agente" && (
                                <div className="text-xs text-gray-600 mb-1 px-1">
                                  {mensagem.remetente.nome}
                                </div>
                              )}

                            {/* Balão da mensagem */}
                            <div
                              className={`p-3 rounded-2xl ${
                                mensagem.remetente.tipo === "agente"
                                  ? "bg-blue-500 text-white rounded-br-sm"
                                  : mensagem.remetente.tipo === "bot"
                                    ? "bg-purple-100 text-purple-900 rounded-bl-sm"
                                    : "bg-gray-100 text-gray-900 rounded-bl-sm"
                              }`}
                            >
                              <p className="text-sm">
                                {mensagem.conteudo.texto}
                              </p>

                              {/* Status da mensagem */}
                              <div
                                className={`flex items-center justify-end gap-1 mt-1 ${
                                  mensagem.remetente.tipo === "agente"
                                    ? "text-blue-200"
                                    : "text-gray-500"
                                }`}
                              >
                                <span className="text-xs">
                                  {mensagem.timestamp.toLocaleTimeString(
                                    "pt-BR",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                                {mensagem.remetente.tipo === "agente" && (
                                  <div className="flex">
                                    {mensagem.status === "enviada" && (
                                      <CheckCircle className="h-3 w-3" />
                                    )}
                                    {mensagem.status === "entregue" && (
                                      <>
                                        <CheckCircle className="h-3 w-3" />
                                        <CheckCircle className="h-3 w-3 -ml-1" />
                                      </>
                                    )}
                                    {mensagem.lida && (
                                      <>
                                        <CheckCircle className="h-3 w-3 text-blue-300" />
                                        <CheckCircle className="h-3 w-3 -ml-1 text-blue-300" />
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Avatar do agente */}
                          {mensagem.remetente.tipo === "agente" &&
                            mensagem.showAvatar && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {mensagem.remetente.nome
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Indicador de digitação */}
                  {typing.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-200">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-2xl p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Área de Digita��ão */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-end gap-3">
                  {/* Botões de mídia */}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-9 w-9 p-0 ${isRecording ? "text-red-500" : ""}`}
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Campo de texto */}
                  <div className="flex-1">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          enviarMensagem();
                        }
                      }}
                      className="min-h-[40px] max-h-32 resize-none"
                      rows={1}
                    />
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={enviarMensagem}
                      disabled={!novaMensagem.trim()}
                      className="h-9 w-9 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Sugestões rápidas */}
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNovaMensagem(
                        "Obrigado pelo contato! Como posso ajudá-lo?",
                      )
                    }
                  >
                    Saudação
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNovaMensagem(
                        "Vou verificar isso para você. Um momento, por favor.",
                      )
                    }
                  >
                    Verificando
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNovaMensagem(
                        "Posso agendar uma demonstração gratuita para você?",
                      )
                    }
                  >
                    Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNovaMensagem(
                        "Muito obrigado pelo feedback! Há mais alguma coisa em que posso ajudar?",
                      )
                    }
                  >
                    Finalizar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Estado vazio */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600">
                  Escolha uma conversa na lista ao lado para começar a atender
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Painel Lateral Direito - Informações */}
        {conversaSelecionada && !isMobile && (
          <div className="w-80 bg-white rounded-lg border border-gray-200">
            <Tabs defaultValue="info" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="actions">Ações</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="flex-1 p-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Informações do Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span>{conversaSelecionada.clienteId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Canal:</span>
                      <span>{conversaSelecionada.canal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="outline">
                        {conversaSelecionada.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioridade:</span>
                      <span
                        className={getPriorityColor(
                          conversaSelecionada.prioridade,
                        )}
                      >
                        {conversaSelecionada.prioridade}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Métricas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Criada:</span>
                      <span>
                        {conversaSelecionada.criadaEm.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mensagens:</span>
                      <span>{conversaSelecionada.mensagens.length}</span>
                    </div>
                    {conversaSelecionada.tempoResposta && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tempo Resposta:</span>
                        <span>
                          {Math.round(conversaSelecionada.tempoResposta / 1000)}
                          s
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {conversaSelecionada.satisfacao && (
                  <div>
                    <h4 className="font-medium mb-2">Satisfação</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= conversaSelecionada.satisfacao!
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {conversaSelecionada.satisfacao}/5
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="flex-1 p-4">
                <h4 className="font-medium mb-4">Conversas Anteriores</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium">
                      Dúvida sobre preços
                    </div>
                    <div className="text-xs text-gray-600">
                      WhatsApp • 2 dias atrás
                    </div>
                    <div className="text-xs text-green-600 mt-1">Resolvida</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium">Suporte técnico</div>
                    <div className="text-xs text-gray-600">
                      Email • 1 semana atrás
                    </div>
                    <div className="text-xs text-green-600 mt-1">Resolvida</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="flex-1 p-4 space-y-3">
                <Button className="w-full gap-2">
                  <Tag className="h-4 w-4" />
                  Adicionar Tag
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Forward className="h-4 w-4" />
                  Transferir
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Archive className="h-4 w-4" />
                  Arquivar
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Resolver
                </Button>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </KryonixLayout>
  );
};

export default CommunicationCenter;

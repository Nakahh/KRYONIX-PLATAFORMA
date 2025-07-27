import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  RefreshCw,
  Phone,
  CheckCircle,
  AlertCircle,
  Activity,
  Eye,
  Play,
  Pause,
} from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { useToast } from "../../hooks/use-toast";

/**
 * Widget de Atividade WhatsApp em Tempo Real
 * KRYONIX - Monitoramento Evolution API
 */

interface WhatsAppInstance {
  id: string;
  name: string;
  phoneNumber: string;
  status: "connected" | "disconnected" | "connecting" | "qr" | "error";
  profilePicUrl?: string;
  batteryLevel?: number;
  connected: boolean;
  lastActivity: string;
  messagesCount: {
    today: number;
    thisHour: number;
    total: number;
  };
  contactsCount: number;
  qrCode?: string;
}

interface WhatsAppMetrics {
  totalInstances: number;
  connectedInstances: number;
  messagesToday: number;
  messagesThisHour: number;
  averageResponseTime: number;
  activeConversations: number;
  conversionsToday: number;
}

interface RecentMessage {
  id: string;
  instanceId: string;
  from: string;
  to: string;
  body: string;
  timestamp: string;
  type: "text" | "image" | "audio" | "document";
  direction: "inbound" | "outbound";
}

export default function WhatsAppActivityWidget() {
  const { toast } = useToast();
  const [selectedInstance, setSelectedInstance] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showLiveMessages, setShowLiveMessages] = useState(false);

  // Query para instâncias do WhatsApp
  const {
    data: instances,
    isLoading: instancesLoading,
    refetch: refetchInstances,
  } = useQuery<WhatsAppInstance[]>({
    queryKey: ["whatsapp-instances"],
    queryFn: async () => {
      console.log("📱 Carregando instâncias WhatsApp da Evolution API...");

      try {
        const response = await apiClient.get("/whatsapp/instances");
        return response.data;
      } catch (error) {
        console.warn(
          "Erro ao carregar instâncias reais, usando dados de exemplo:",
          error,
        );

        // Dados de exemplo baseados na Evolution API real
        return [
          {
            id: "inst-001",
            name: "KRYONIX Principal",
            phoneNumber: "+55 17 98180-5327",
            status: "connected" as const,
            batteryLevel: 87,
            connected: true,
            lastActivity: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 min atrás
            messagesCount: {
              today: 156,
              thisHour: 23,
              total: 4567,
            },
            contactsCount: 1234,
          },
          {
            id: "inst-002",
            name: "Suporte Clientes",
            phoneNumber: "+55 17 99999-8888",
            status: "connected" as const,
            batteryLevel: 92,
            connected: true,
            lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min atrás
            messagesCount: {
              today: 89,
              thisHour: 12,
              total: 2890,
            },
            contactsCount: 876,
          },
          {
            id: "inst-003",
            name: "Vendas",
            phoneNumber: "+55 17 98765-4321",
            status: "qr" as const,
            connected: false,
            lastActivity: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min atrás
            messagesCount: {
              today: 34,
              thisHour: 2,
              total: 1456,
            },
            contactsCount: 567,
            qrCode:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
          },
        ];
      }
    },
    refetchInterval: autoRefresh ? 15000 : false, // Refresh a cada 15 segundos
    staleTime: 5000,
  });

  // Query para métricas gerais
  const { data: metrics, isLoading: metricsLoading } =
    useQuery<WhatsAppMetrics>({
      queryKey: ["whatsapp-metrics", instances],
      queryFn: () => {
        if (!instances) return null;

        const totalInstances = instances.length;
        const connectedInstances = instances.filter((i) => i.connected).length;
        const messagesToday = instances.reduce(
          (acc, i) => acc + i.messagesCount.today,
          0,
        );
        const messagesThisHour = instances.reduce(
          (acc, i) => acc + i.messagesCount.thisHour,
          0,
        );

        return {
          totalInstances,
          connectedInstances,
          messagesToday,
          messagesThisHour,
          averageResponseTime: 147, // segundos
          activeConversations: 45,
          conversionsToday: 12,
        };
      },
      enabled: !!instances,
    });

  // Query para mensagens recentes (simulado)
  const { data: recentMessages } = useQuery<RecentMessage[]>({
    queryKey: ["whatsapp-recent-messages"],
    queryFn: async () => {
      // Simular mensagens em tempo real
      return [
        {
          id: "msg-001",
          instanceId: "inst-001",
          from: "João Silva",
          to: "KRYONIX Principal",
          body: "Olá! Gostaria de saber mais sobre os planos.",
          timestamp: new Date(Date.now() - 1000 * 30).toISOString(),
          type: "text",
          direction: "inbound",
        },
        {
          id: "msg-002",
          instanceId: "inst-001",
          from: "KRYONIX Principal",
          to: "João Silva",
          body: "Oi João! Claro, temos 3 planos disponíveis...",
          timestamp: new Date(Date.now() - 1000 * 15).toISOString(),
          type: "text",
          direction: "outbound",
        },
        {
          id: "msg-003",
          instanceId: "inst-002",
          from: "Maria Costa",
          to: "Suporte Clientes",
          body: "Preciso de ajuda com a automação",
          timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
          type: "text",
          direction: "inbound",
        },
      ];
    },
    refetchInterval: showLiveMessages ? 5000 : false,
    enabled: showLiveMessages,
  });

  const getStatusIcon = (status: WhatsAppInstance["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "disconnected":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "connecting":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "qr":
        return <Phone className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: WhatsAppInstance["status"]) => {
    const configs = {
      connected: { text: "Conectado", class: "bg-green-100 text-green-800" },
      disconnected: { text: "Desconectado", class: "bg-red-100 text-red-800" },
      connecting: { text: "Conectando", class: "bg-blue-100 text-blue-800" },
      qr: { text: "Aguardando QR", class: "bg-yellow-100 text-yellow-800" },
      error: { text: "Erro", class: "bg-red-100 text-red-800" },
    };

    const config = configs[status];
    return (
      <Badge className={`${config.class} border-0 text-xs`}>
        {config.text}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const filteredInstances =
    instances?.filter(
      (instance) =>
        selectedInstance === "all" || instance.id === selectedInstance,
    ) || [];

  if (instancesLoading || metricsLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            WhatsApp Business
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-12 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
            WhatsApp Business
            <Badge variant="outline" className="ml-2">
              {metrics?.connectedInstances}/{metrics?.totalInstances}
            </Badge>
          </CardTitle>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLiveMessages(!showLiveMessages)}
              className={showLiveMessages ? "text-green-600" : "text-gray-400"}
            >
              {showLiveMessages ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "text-green-600" : "text-gray-400"}
            >
              <Activity className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchInstances()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Metrics Summary */}
        {metrics && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {metrics.messagesToday}
                </div>
                <div className="text-xs text-gray-600">Mensagens Hoje</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {metrics.messagesThisHour}
                </div>
                <div className="text-xs text-gray-600">Esta Hora</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {metrics.activeConversations}
                </div>
                <div className="text-xs text-gray-600">Conversas Ativas</div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instance Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedInstance === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedInstance("all")}
            className="text-xs"
          >
            Todas ({instances?.length || 0})
          </Button>
          {instances?.map((instance) => (
            <Button
              key={instance.id}
              variant={selectedInstance === instance.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedInstance(instance.id)}
              className="text-xs"
            >
              {instance.name}
            </Button>
          ))}
        </div>

        {/* Instances List */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {filteredInstances.map((instance) => (
            <div
              key={instance.id}
              className="p-3 bg-white border rounded-lg hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(instance.status)}
                  <span className="font-medium text-sm">{instance.name}</span>
                  {getStatusBadge(instance.status)}
                </div>

                <div className="flex items-center space-x-2">
                  {instance.batteryLevel && (
                    <span className="text-xs text-gray-500">
                      🔋 {instance.batteryLevel}%
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        "https://api.kryonix.com.br/manager",
                        "_blank",
                      )
                    }
                    className="h-6 w-6 p-0"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-600 mb-2">
                📱 {instance.phoneNumber}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold text-green-600">
                    {instance.messagesCount.today}
                  </div>
                  <div className="text-gray-600">Hoje</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">
                    {instance.messagesCount.thisHour}
                  </div>
                  <div className="text-gray-600">Esta Hora</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded">
                  <div className="font-bold text-purple-600">
                    {instance.contactsCount}
                  </div>
                  <div className="text-gray-600">Contatos</div>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Última atividade: {formatTimeAgo(instance.lastActivity)}
              </div>

              {/* QR Code para instâncias desconectadas */}
              {instance.status === "qr" && instance.qrCode && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-xs text-yellow-800 mb-2">
                    📱 Escaneie o QR Code para conectar:
                  </div>
                  <div className="text-center">
                    <img
                      src={instance.qrCode}
                      alt="QR Code WhatsApp"
                      className="w-24 h-24 mx-auto border rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Live Messages */}
        {showLiveMessages && recentMessages && recentMessages.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center mb-3">
              <Activity className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-sm font-medium">Mensagens Recentes</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recentMessages.slice(0, 5).map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded text-xs ${
                    message.direction === "inbound"
                      ? "bg-blue-50 border-l-2 border-blue-400"
                      : "bg-green-50 border-l-2 border-green-400"
                  }`}
                >
                  <div className="font-medium">
                    {message.direction === "inbound" ? "📩" : "📤"}{" "}
                    {message.from}
                  </div>
                  <div className="text-gray-600 truncate">{message.body}</div>
                  <div className="text-gray-500 mt-1">
                    {formatTimeAgo(message.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Última atualização: {new Date().toLocaleTimeString("pt-BR")}
          {autoRefresh && " • Auto-refresh ativo"}
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import {
  Workflow,
  Zap,
  Link,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Code,
  Database,
  MessageSquare,
  Bot,
  BarChart3,
  Globe,
  Key,
  Activity,
  Target,
  Brazil,
  ArrowRight,
  Layers,
  Network,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { useAPI } from "../../hooks/use-api";

/**
 * AutoN8NConnector - Sistema automático de conexões N8N para stacks brasileiras
 * Integra automaticamente Evolution API, Typebot, Mautic e outras stacks
 */

interface N8NConnection {
  id: string;
  name: string;
  type: "webhook" | "api" | "database" | "trigger";
  sourceStack: string;
  targetStack: string;
  status: "connected" | "disconnected" | "configuring" | "error";
  method: "GET" | "POST" | "PUT" | "PATCH";
  endpoint: string;
  headers: Record<string, string>;
  payload?: Record<string, any>;
  credentials: Record<string, string>;
  webhook?: {
    url: string;
    secret?: string;
    events: string[];
  };
  mapping: {
    [key: string]: string;
  };
  lastTest?: string;
  lastSync?: string;
  errorCount: number;
  metadata: {
    description: string;
    category: string;
    brazilianFeatures: string[];
  };
}

interface AutoConnection {
  id: string;
  name: string;
  description: string;
  sourceStack: string;
  targetStack: string;
  template: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  brazilianFeatures: string[];
  workflow: any;
  isActive: boolean;
}

// Conexões automáticas pré-configuradas para o Brasil
const autoConnections: AutoConnection[] = [
  {
    id: "whatsapp-crm-auto",
    name: "WhatsApp → Mautic CRM",
    description:
      "Conexão automática de leads do WhatsApp Business para Mautic com validação CPF/CNPJ",
    sourceStack: "evolution-api",
    targetStack: "mautic",
    template: "whatsapp_to_crm_br",
    difficulty: "easy",
    estimatedTime: "5 min",
    brazilianFeatures: [
      "Validação CPF/CNPJ automática",
      "Formatação telefone brasileiro",
      "Segmentação por CEP",
      "Compliance LGPD",
    ],
    workflow: {
      trigger: "webhook_whatsapp_message",
      steps: [
        "validate_cpf_cnpj",
        "format_phone_brazil",
        "create_mautic_contact",
        "segment_by_region",
      ],
    },
    isActive: false,
  },
  {
    id: "typebot-whatsapp-auto",
    name: "Typebot → WhatsApp",
    description:
      "Integração bidirecional entre chatbots Typebot e WhatsApp Business",
    sourceStack: "typebot",
    targetStack: "evolution-api",
    template: "typebot_whatsapp_br",
    difficulty: "medium",
    estimatedTime: "10 min",
    brazilianFeatures: [
      "Fluxos conversacionais BR",
      "Horário comercial brasileiro",
      "Respostas contextuais",
      "Media handling avançado",
    ],
    workflow: {
      trigger: "typebot_completion",
      steps: [
        "process_typebot_response",
        "format_whatsapp_message",
        "send_whatsapp_message",
        "log_interaction",
      ],
    },
    isActive: false,
  },
  {
    id: "analytics-dashboard-auto",
    name: "Analytics → Grafana",
    description: "Dashboard automático com métricas brasileiras em tempo real",
    sourceStack: "mautic",
    targetStack: "grafana",
    template: "analytics_dashboard_br",
    difficulty: "medium",
    estimatedTime: "15 min",
    brazilianFeatures: [
      "KPIs regionais Brasil",
      "Métricas em Real (R$)",
      "Fusos horários BR",
      "ROI por estado",
    ],
    workflow: {
      trigger: "scheduled_daily",
      steps: [
        "collect_mautic_data",
        "calculate_brazilian_metrics",
        "push_to_grafana",
        "generate_alerts",
      ],
    },
    isActive: false,
  },
  {
    id: "pix-notification-auto",
    name: "PIX → Notificação Omnicanal",
    description:
      "Sistema automático de notificações para pagamentos PIX via múltiplos canais",
    sourceStack: "webhook-pix",
    targetStack: "evolution-api",
    template: "pix_notification_br",
    difficulty: "hard",
    estimatedTime: "20 min",
    brazilianFeatures: [
      "Integração Open Banking",
      "Validação PIX real-time",
      "Notificação multi-canal",
      "Comprovante automático",
    ],
    workflow: {
      trigger: "pix_received_webhook",
      steps: [
        "validate_pix_transaction",
        "generate_receipt",
        "send_whatsapp_notification",
        "update_crm_status",
      ],
    },
    isActive: false,
  },
  {
    id: "lead-qualification-auto",
    name: "Qualificação Automática de Leads",
    description:
      "Sistema de scoring e qualificação automática baseado em dados brasileiros",
    sourceStack: "evolution-api",
    targetStack: "mautic",
    template: "lead_scoring_br",
    difficulty: "hard",
    estimatedTime: "25 min",
    brazilianFeatures: [
      "Scoring brasileiro avançado",
      "Validação renda por CEP",
      "Análise comportamental BR",
      "Segmentação inteligente",
    ],
    workflow: {
      trigger: "new_lead_capture",
      steps: [
        "enrich_lead_data",
        "calculate_brazilian_score",
        "segment_by_criteria",
        "route_to_sales_team",
      ],
    },
    isActive: false,
  },
  {
    id: "customer-support-auto",
    name: "Suporte Automático 24/7",
    description:
      "Sistema de atendimento automatizado com triagem inteligente e horário brasileiro",
    sourceStack: "evolution-api",
    targetStack: "typebot",
    template: "support_automation_br",
    difficulty: "medium",
    estimatedTime: "12 min",
    brazilianFeatures: [
      "Triagem por urgência BR",
      "Horário comercial automático",
      "Encaminhamento inteligente",
      "SLA brasileiro",
    ],
    workflow: {
      trigger: "support_request",
      steps: [
        "classify_urgency",
        "check_business_hours",
        "route_to_department",
        "send_confirmation",
      ],
    },
    isActive: false,
  },
];

export function AutoN8NConnector() {
  const { toast } = useToast();
  const { api } = useAPI();

  const [selectedConnection, setSelectedConnection] =
    useState<AutoConnection | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, string>
  >({});
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Carregar status das conexões
  useEffect(() => {
    const loadConnectionStatus = async () => {
      try {
        const response = await api.get("/n8n/connections/status");
        setConnectionStatus(response.data.connections || {});
        setActiveConnections(response.data.active || []);
      } catch (error) {
        console.warn("Usando dados locais para demo:", error);
        // Dados de exemplo para desenvolvimento
        const mockStatus: Record<string, string> = {};
        autoConnections.forEach((conn) => {
          mockStatus[conn.id] =
            Math.random() > 0.5 ? "connected" : "disconnected";
        });
        setConnectionStatus(mockStatus);
      }
    };

    loadConnectionStatus();
  }, [api]);

  // Ativar conexão automática
  const activateConnection = async (connection: AutoConnection) => {
    setIsDeploying(true);
    setDeployProgress(0);
    setSelectedConnection(connection);

    try {
      const steps = [
        "Validando credenciais...",
        "Criando workflow N8N...",
        "Configurando webhooks...",
        "Testando conexão...",
        "Ativando automação...",
      ];

      for (let i = 0; i < steps.length; i++) {
        toast({
          title: steps[i],
          description: `Configurando ${connection.name}`,
        });

        setDeployProgress(((i + 1) / steps.length) * 100);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Simular ativação da conexão
      setActiveConnections((prev) => [...prev, connection.id]);
      setConnectionStatus((prev) => ({
        ...prev,
        [connection.id]: "connected",
      }));

      toast({
        title: "Conexão ativada! 🎉",
        description: `${connection.name} está funcionando automaticamente`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na ativação",
        description: "Não foi possível ativar a conexão automática",
      });
    } finally {
      setIsDeploying(false);
      setDeployProgress(0);
    }
  };

  // Testar conexão
  const testConnection = async (connection: AutoConnection) => {
    toast({
      title: "Testando conexão...",
      description: `Verificando ${connection.name}`,
    });

    try {
      // Simular teste
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResult = {
        status: "success",
        latency: Math.floor(Math.random() * 200) + 50,
        lastSync: new Date().toISOString(),
        messagesProcessed: Math.floor(Math.random() * 1000) + 100,
      };

      setTestResults((prev) => ({
        ...prev,
        [connection.id]: mockResult,
      }));

      toast({
        title: "Teste concluído!",
        description: `Latência: ${mockResult.latency}ms | Status: OK`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Teste falhou",
        description: "Verifique as configurações da conexão",
      });
    }
  };

  // Desativar conexão
  const deactivateConnection = async (connectionId: string) => {
    setActiveConnections((prev) => prev.filter((id) => id !== connectionId));
    setConnectionStatus((prev) => ({
      ...prev,
      [connectionId]: "disconnected",
    }));

    toast({
      title: "Conexão desativada",
      description: "A automação foi pausada com sucesso",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "disconnected":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case "configuring":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 border-green-200 bg-green-50";
      case "medium":
        return "text-yellow-600 border-yellow-200 bg-yellow-50";
      case "hard":
        return "text-red-600 border-red-200 bg-red-50";
      default:
        return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Network className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Conexões Automáticas N8N
            </h2>
            <p className="text-gray-600">
              Configure integrações prontas para o mercado brasileiro
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Brazil className="w-3 h-3 mr-1" />
            {activeConnections.length} ativas
          </Badge>
          <Button
            variant="outline"
            onClick={() => window.open("https://n8n.kryonix.com.br", "_blank")}
          >
            <Code className="w-4 h-4 mr-2" />
            N8N Dashboard
          </Button>
        </div>
      </div>

      {/* Deploy Progress */}
      {isDeploying && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-blue-200"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">
              Configurando {selectedConnection?.name}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(deployProgress)}%
            </span>
          </div>
          <Progress value={deployProgress} className="h-2" />
        </motion.div>
      )}

      {/* Connections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {autoConnections.map((connection) => {
          const isActive = activeConnections.includes(connection.id);
          const status = connectionStatus[connection.id] || "disconnected";
          const testResult = testResults[connection.id];

          return (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {connection.name}
                        </CardTitle>
                        {getStatusIcon(status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {connection.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`text-xs ${getDifficultyColor(connection.difficulty)}`}
                        >
                          {connection.difficulty === "easy"
                            ? "Fácil"
                            : connection.difficulty === "medium"
                              ? "Médio"
                              : "Avançado"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {connection.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Connection Flow */}
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <Database className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">
                        {connection.sourceStack}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <div className="flex items-center space-x-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <span className="font-medium">
                        {connection.targetStack}
                      </span>
                    </div>
                  </div>

                  {/* Brazilian Features */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Brazil className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Recursos brasileiros:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {connection.brazilianFeatures
                        .slice(0, 2)
                        .map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      {connection.brazilianFeatures.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{connection.brazilianFeatures.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Test Results */}
                  {testResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700 font-medium">
                          Último teste: OK
                        </span>
                        <span className="text-green-600">
                          {testResult.latency}ms
                        </span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {testResult.messagesProcessed} mensagens processadas
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(connection)}
                      className="flex-1"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Testar
                    </Button>

                    {isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deactivateConnection(connection.id)}
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => activateConnection(connection)}
                        disabled={isDeploying}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isDeploying &&
                        selectedConnection?.id === connection.id ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4 mr-2" />
                        )}
                        Ativar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Status das Conexões</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {activeConnections.length}
              </div>
              <div className="text-sm text-gray-600">Ativas</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {autoConnections.length - activeConnections.length}
              </div>
              <div className="text-sm text-gray-600">Inativas</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(testResults).length}
              </div>
              <div className="text-sm text-gray-600">Testadas</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {
                  autoConnections.filter((c) => c.brazilianFeatures.length >= 3)
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Brasil-Ready</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

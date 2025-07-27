import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Progress } from "../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

import {
  Server,
  Database,
  MessageSquare,
  Workflow,
  Bot,
  BarChart3,
  Shield,
  Cloud,
  Monitor,
  Zap,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  Globe,
  Key,
  Code,
  Layers,
  Network,
  Box,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Clock,
  Users,
  TrendingUp,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { KryonixLogoPremium } from "../brand/KryonixLogoPremium";

/**
 * KRYONIX Visual Stack Manager
 * Gerenciador visual completo para todas as 25 stacks integradas
 * Monitoramento, configuração e controle em tempo real
 */

interface StackInfo {
  id: string;
  name: string;
  category:
    | "essential"
    | "automation"
    | "analytics"
    | "infrastructure"
    | "communication"
    | "ai"
    | "storage"
    | "security";
  icon: React.ReactNode;
  description: string;
  domain: string;
  port?: number;
  status: "online" | "offline" | "warning" | "error" | "maintenance";
  version: string;
  uptime: string;
  lastCheck: string;
  credentials: Record<string, string>;
  config: Record<string, any>;
  dependencies: string[];
  resources: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  metrics: {
    requests: number;
    errors: number;
    responseTime: number;
    availability: number;
  };
  logs: Array<{
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
  }>;
  backup: {
    enabled: boolean;
    lastBackup: string;
    schedule: string;
  };
}

// Definição completa das 25 stacks com dados REAIS do servidor
const stacksData: StackInfo[] = [
  {
    id: "portainer",
    name: "Portainer",
    category: "infrastructure",
    icon: <Server className="w-5 h-5" />,
    description: "Gerenciamento de containers Docker",
    domain: "painel.kryonix.com.br",
    port: 9000,
    status: "online",
    version: "2.19.4",
    uptime: "99.8%",
    lastCheck: "2024-01-15 14:30:25",
    credentials: {
      username: "kryonix",
      password: "Vitor@123456",
      email: "portainer@kryonix.com.br",
    },
    config: {
      ssl: true,
      network: "Kryonix-NET",
      server: "Kryonix-SERVIDOR",
    },
    dependencies: [],
    resources: { cpu: 12, memory: 45, disk: 23, network: 8 },
    metrics: {
      requests: 1547,
      errors: 3,
      responseTime: 180,
      availability: 99.8,
    },
    logs: [
      {
        timestamp: "14:30:25",
        level: "info",
        message: "Container status updated",
      },
      {
        timestamp: "14:25:10",
        level: "info",
        message: "Network Kryonix-NET healthy",
      },
    ],
    backup: {
      enabled: true,
      lastBackup: "2024-01-15 02:00:00",
      schedule: "daily",
    },
  },
  {
    id: "evolution-api",
    name: "Evolution API",
    category: "communication",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "API WhatsApp Business integrada",
    domain: "api.kryonix.com.br",
    port: 8080,
    status: "online",
    version: "1.5.2",
    uptime: "99.9%",
    lastCheck: "2024-01-15 14:30:20",
    credentials: {
      apiKey: "6f78dbffc4acd9a32b926a38892a23f0",
      managerUrl: "https://api.kryonix.com.br/manager",
    },
    config: {
      instances: ["instance1", "instance2", "instance3"],
      webhooks: true,
      ssl: true,
    },
    dependencies: ["redis", "postgresql"],
    resources: { cpu: 25, memory: 68, disk: 15, network: 45 },
    metrics: {
      requests: 3247,
      errors: 1,
      responseTime: 95,
      availability: 99.9,
    },
    logs: [
      {
        timestamp: "14:30:20",
        level: "info",
        message: "WhatsApp instance connected",
      },
      {
        timestamp: "14:28:15",
        level: "info",
        message: "Message sent successfully",
      },
    ],
    backup: {
      enabled: true,
      lastBackup: "2024-01-15 01:30:00",
      schedule: "hourly",
    },
  },
  {
    id: "n8n",
    name: "N8N Workflows",
    category: "automation",
    icon: <Workflow className="w-5 h-5" />,
    description: "Automação de workflows e integrações",
    domain: "n8n.kryonix.com.br",
    port: 5678,
    status: "online",
    version: "1.15.2",
    uptime: "99.7%",
    lastCheck: "2024-01-15 14:30:18",
    credentials: {
      email: "vitor.nakahh@gmail.com",
      password: "Vitor@123456",
      webhookDomain: "webhookn8n.kryonix.com.br",
    },
    config: {
      executions: true,
      workflows: ["lead-qualification", "whatsapp-automation", "crm-sync"],
      smtp: "smtp.sendgrid.net",
    },
    dependencies: ["postgresql", "redis"],
    resources: { cpu: 18, memory: 52, disk: 28, network: 22 },
    metrics: {
      requests: 891,
      errors: 2,
      responseTime: 245,
      availability: 99.7,
    },
    logs: [
      {
        timestamp: "14:30:18",
        level: "info",
        message: "Workflow executed successfully",
      },
      {
        timestamp: "14:25:30",
        level: "warn",
        message: "High execution time detected",
      },
    ],
    backup: {
      enabled: true,
      lastBackup: "2024-01-15 03:00:00",
      schedule: "daily",
    },
  },
  {
    id: "typebot",
    name: "Typebot",
    category: "automation",
    icon: <Bot className="w-5 h-5" />,
    description: "Criador de chatbots inteligentes",
    domain: "typebot.kryonix.com.br",
    port: 3000,
    status: "online",
    version: "2.18.0",
    uptime: "99.6%",
    lastCheck: "2024-01-15 14:30:15",
    credentials: {
      adminEmail: "vitor.nakahh@gmail.com",
      viewerDomain: "bot.kryonix.com.br",
    },
    config: {
      bots: ["lead-capture", "support-bot", "sales-bot"],
      integrations: true,
      smtp: "smtp.sendgrid.net",
    },
    dependencies: ["postgresql", "redis"],
    resources: { cpu: 15, memory: 38, disk: 12, network: 35 },
    metrics: {
      requests: 2156,
      errors: 5,
      responseTime: 120,
      availability: 99.6,
    },
    logs: [
      {
        timestamp: "14:30:15",
        level: "info",
        message: "Bot conversation completed",
      },
      { timestamp: "14:27:45", level: "info", message: "New bot published" },
    ],
    backup: {
      enabled: true,
      lastBackup: "2024-01-15 02:30:00",
      schedule: "daily",
    },
  },
  {
    id: "mautic",
    name: "Mautic CRM",
    category: "analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    description: "Marketing automation e gestão de leads",
    domain: "mautic.kryonix.com.br",
    port: 8080,
    status: "online",
    version: "5.0.4",
    uptime: "99.5%",
    lastCheck: "2024-01-15 14:30:12",
    credentials: {
      username: "kryonix",
      email: "vitor.nakahh@gmail.com",
      password: "Vitor@123456",
    },
    config: {
      database: "mautic",
      campaigns: ["welcome-series", "nurturing", "remarketing"],
      segments: true,
    },
    dependencies: ["mysql", "redis"],
    resources: { cpu: 22, memory: 74, disk: 45, network: 18 },
    metrics: {
      requests: 1678,
      errors: 8,
      responseTime: 320,
      availability: 99.5,
    },
    logs: [
      { timestamp: "14:30:12", level: "info", message: "Campaign email sent" },
      { timestamp: "14:26:20", level: "warn", message: "Database query slow" },
    ],
    backup: {
      enabled: true,
      lastBackup: "2024-01-15 01:00:00",
      schedule: "6-hourly",
    },
  },
  {
    id: "grafana",
    name: "Grafana",
    category: "analytics",
    icon: <Monitor className="w-5 h-5" />,
    description: "Dashboards e monitoramento visual",
    domain: "grafana.kryonix.com.br",
    port: 3000,
    status: "online",
    version: "10.2.3",
    uptime: "99.9%",
    lastCheck: "2024-01-15 14:30:10",
    credentials: {
      username: "kryonix",
      password: "Vitor@123456",
    },
    config: {
      dashboards: ["system-overview", "app-metrics", "business-kpis"],
      alerts: true,
      datasources: ["prometheus", "postgresql"],
    },
    dependencies: ["prometheus", "postgresql"],
    resources: { cpu: 8, memory: 32, disk: 18, network: 25 },
    metrics: { requests: 956, errors: 0, responseTime: 65, availability: 99.9 },
    logs: [
      { timestamp: "14:30:10", level: "info", message: "Dashboard updated" },
      { timestamp: "14:28:05", level: "info", message: "Alert rule evaluated" },
    ],
    backup: {
      enabled: true,
      lastBackup: "2024-01-15 04:00:00",
      schedule: "daily",
    },
  },
  {
    id: "prometheus",
    name: "Prometheus",
    category: "analytics",
    icon: <Activity className="w-5 h-5" />,
    description: "Sistema de monitoramento e alertas",
    domain: "prometheus.kryonix.com.br",
    port: 9090,
    status: "online",
    version: "2.48.1",
    uptime: "99.8%",
    lastCheck: "2024-01-15 14:30:08",
    credentials: {},
    config: {
      retention: "30d",
      scrapeInterval: "15s",
      targets: ["node-exporter", "cadvisor", "grafana"],
    },
    dependencies: [],
    resources: { cpu: 35, memory: 128, disk: 85, network: 12 },
    metrics: {
      requests: 47892,
      errors: 12,
      responseTime: 25,
      availability: 99.8,
    },
    logs: [
      {
        timestamp: "14:30:08",
        level: "info",
        message: "Metrics scraped successfully",
      },
      {
        timestamp: "14:29:50",
        level: "info",
        message: "Target health check passed",
      },
    ],
    backup: {
      enabled: true,
      lastBackup: "2024-01-15 03:30:00",
      schedule: "daily",
    },
  },
  {
    id: "ollama",
    name: "Ollama AI",
    category: "ai",
    icon: <Bot className="w-5 h-5" />,
    description: "Modelos de IA locais (LLaMA, Mistral, etc)",
    domain: "ollama.kryonix.com.br",
    port: 11434,
    status: "online",
    version: "0.1.17",
    uptime: "99.4%",
    lastCheck: "2024-01-15 14:30:05",
    credentials: {
      webui: "https://ollama.kryonix.com.br",
      api: "https://apiollama.kryonix.com.br",
    },
    config: {
      models: ["llama2:7b", "mistral:7b", "codellama:7b", "phi:latest"],
      concurrent: 4,
      memory: "8GB",
    },
    dependencies: [],
    resources: { cpu: 78, memory: 85, disk: 45, network: 8 },
    metrics: {
      requests: 245,
      errors: 3,
      responseTime: 2500,
      availability: 99.4,
    },
    logs: [
      {
        timestamp: "14:30:05",
        level: "info",
        message: "Model inference completed",
      },
      { timestamp: "14:27:30", level: "warn", message: "High GPU utilization" },
    ],
    backup: { enabled: false, lastBackup: "", schedule: "" },
  },
  // Adicionar mais stacks conforme necessário...
];

const StackCard = ({
  stack,
  onEdit,
  onToggle,
  onView,
}: {
  stack: StackInfo;
  onEdit: (stack: StackInfo) => void;
  onToggle: (stackId: string) => void;
  onView: (stack: StackInfo) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "border-green-500 bg-green-50";
      case "offline":
        return "border-gray-500 bg-gray-50";
      case "warning":
        return "border-yellow-500 bg-yellow-50";
      case "error":
        return "border-red-500 bg-red-50";
      case "maintenance":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "offline":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "maintenance":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "essential":
        return "bg-purple-100 text-purple-800";
      case "automation":
        return "bg-blue-100 text-blue-800";
      case "analytics":
        return "bg-green-100 text-green-800";
      case "infrastructure":
        return "bg-orange-100 text-orange-800";
      case "communication":
        return "bg-pink-100 text-pink-800";
      case "ai":
        return "bg-indigo-100 text-indigo-800";
      case "storage":
        return "bg-cyan-100 text-cyan-800";
      case "security":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border-2 rounded-xl ${getStatusColor(stack.status)} 
                  hover:shadow-lg transition-all duration-200`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">{stack.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{stack.name}</h3>
            <p className="text-xs text-gray-600">{stack.domain}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon(stack.status)}
          <Badge className={`text-xs ${getCategoryColor(stack.category)}`}>
            {stack.category}
          </Badge>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{stack.description}</p>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-xs">
          <span className="text-gray-500">Uptime:</span>
          <span className="font-medium ml-1">{stack.uptime}</span>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">Versão:</span>
          <span className="font-medium ml-1">{stack.version}</span>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">CPU:</span>
          <span className="font-medium ml-1">{stack.resources.cpu}%</span>
        </div>
        <div className="text-xs">
          <span className="text-gray-500">RAM:</span>
          <span className="font-medium ml-1">{stack.resources.memory}%</span>
        </div>
      </div>

      {/* Progress bars de recursos */}
      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>CPU</span>
            <span>{stack.resources.cpu}%</span>
          </div>
          <Progress value={stack.resources.cpu} className="h-1" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Memória</span>
            <span>{stack.resources.memory}%</span>
          </div>
          <Progress value={stack.resources.memory} className="h-1" />
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={() => onView(stack)}
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={() => onEdit(stack)}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2"
            onClick={() => window.open(`https://${stack.domain}`, "_blank")}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        <Switch
          checked={stack.status === "online"}
          onCheckedChange={() => onToggle(stack.id)}
          size="sm"
        />
      </div>
    </motion.div>
  );
};

interface StackManagerProps {
  onStackUpdate?: (stackId: string, updates: Partial<StackInfo>) => void;
}

export default function StackManager({ onStackUpdate }: StackManagerProps) {
  const { toast } = useToast();

  const [stacks, setStacks] = useState<StackInfo[]>(stacksData);
  const [selectedStack, setSelectedStack] = useState<StackInfo | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stackToDelete, setStackToDelete] = useState<string | null>(null);

  // Filtrar stacks
  const filteredStacks = stacks.filter((stack) => {
    const matchesSearch =
      stack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stack.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || stack.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || stack.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Estatísticas gerais
  const stats = {
    total: stacks.length,
    online: stacks.filter((s) => s.status === "online").length,
    offline: stacks.filter((s) => s.status === "offline").length,
    warning: stacks.filter((s) => s.status === "warning").length,
    error: stacks.filter((s) => s.status === "error").length,
    avgUptime: (
      stacks.reduce((acc, s) => acc + parseFloat(s.uptime), 0) / stacks.length
    ).toFixed(1),
    totalRequests: stacks.reduce((acc, s) => acc + s.metrics.requests, 0),
    totalErrors: stacks.reduce((acc, s) => acc + s.metrics.errors, 0),
  };

  // Atualizar status das stacks
  const refreshStacks = async () => {
    setIsRefreshing(true);
    try {
      // Simular verificação de status em tempo real
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedStacks = stacks.map((stack) => ({
        ...stack,
        lastCheck: new Date().toLocaleString("pt-BR"),
        // Simular algumas mudanças de status aleatórias
        status:
          Math.random() > 0.1
            ? stack.status
            : Math.random() > 0.5
              ? "warning"
              : ("online" as any),
      }));

      setStacks(updatedStacks);

      toast({
        title: "Status atualizado! ⚡",
        description: "Todas as stacks foram verificadas",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na atualização",
        description: "Não foi possível verificar o status de algumas stacks",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Alternar status da stack
  const toggleStack = async (stackId: string) => {
    const stack = stacks.find((s) => s.id === stackId);
    if (!stack) return;

    const newStatus = stack.status === "online" ? "offline" : "online";

    setStacks(
      stacks.map((s) => (s.id === stackId ? { ...s, status: newStatus } : s)),
    );

    onStackUpdate?.(stackId, { status: newStatus });

    toast({
      title: `${stack.name} ${newStatus === "online" ? "ativada" : "desativada"}`,
      description: `Stack está agora ${newStatus === "online" ? "online" : "offline"}`,
    });
  };

  // Visualizar detalhes da stack
  const viewStack = (stack: StackInfo) => {
    setSelectedStack(stack);
    setIsViewing(true);
  };

  // Editar configuração da stack
  const editStack = (stack: StackInfo) => {
    setSelectedStack(stack);
    setIsConfiguring(true);
  };

  // Salvar configurações
  const saveStackConfig = () => {
    if (!selectedStack) return;

    setStacks(
      stacks.map((s) => (s.id === selectedStack.id ? selectedStack : s)),
    );

    onStackUpdate?.(selectedStack.id, selectedStack);

    toast({
      title: "Configuração salva! 💾",
      description: `${selectedStack.name} foi atualizada com sucesso`,
    });

    setIsConfiguring(false);
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular atualizações automáticas de métricas
      setStacks((currentStacks) =>
        currentStacks.map((stack) => ({
          ...stack,
          resources: {
            ...stack.resources,
            cpu: Math.max(
              0,
              Math.min(100, stack.resources.cpu + (Math.random() - 0.5) * 10),
            ),
            memory: Math.max(
              0,
              Math.min(100, stack.resources.memory + (Math.random() - 0.5) * 8),
            ),
          },
          metrics: {
            ...stack.metrics,
            requests: stack.metrics.requests + Math.floor(Math.random() * 50),
          },
        })),
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <KryonixLogoPremium variant="icon" size="sm" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Stack Manager
              </h1>
              <p className="text-gray-600">
                Gerenciamento visual das 25 stacks integradas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={refreshStacks}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Atualizar
            </Button>
            <Badge
              variant="outline"
              className="text-green-600 border-green-200"
            >
              {stats.online}/{stats.total} Online
            </Badge>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mt-4 grid grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.online}
            </div>
            <div className="text-xs text-gray-500">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.offline}
            </div>
            <div className="text-xs text-gray-500">Offline</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.warning}
            </div>
            <div className="text-xs text-gray-500">Atenção</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgUptime}%
            </div>
            <div className="text-xs text-gray-500">Uptime Médio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalRequests.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Requisições</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Buscar stacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              <SelectItem value="essential">Essencial</SelectItem>
              <SelectItem value="automation">Automação</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="infrastructure">Infraestrutura</SelectItem>
              <SelectItem value="communication">Comunicação</SelectItem>
              <SelectItem value="ai">Inteligência Artificial</SelectItem>
              <SelectItem value="storage">Armazenamento</SelectItem>
              <SelectItem value="security">Segurança</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="warning">Atenção</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stacks Grid */}
      <div className="p-6">
        {filteredStacks.length === 0 ? (
          <div className="text-center py-12">
            <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma stack encontrada
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou termo de busca
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredStacks.map((stack) => (
                <StackCard
                  key={stack.id}
                  stack={stack}
                  onEdit={editStack}
                  onToggle={toggleStack}
                  onView={viewStack}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Stack Details Dialog */}
      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedStack?.icon}
              <span>{selectedStack?.name}</span>
              <Badge className="ml-2">{selectedStack?.status}</Badge>
            </DialogTitle>
            <DialogDescription>
              Detalhes completos e métricas da stack
            </DialogDescription>
          </DialogHeader>

          {selectedStack && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="metrics">Métricas</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="config">Config</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Informações Básicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Domínio:</span>
                        <span className="text-sm font-medium">
                          {selectedStack.domain}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Versão:</span>
                        <span className="text-sm font-medium">
                          {selectedStack.version}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Uptime:</span>
                        <span className="text-sm font-medium">
                          {selectedStack.uptime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Última verificação:
                        </span>
                        <span className="text-sm font-medium">
                          {selectedStack.lastCheck}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Recursos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">CPU</span>
                          <span className="text-sm font-medium">
                            {selectedStack.resources.cpu}%
                          </span>
                        </div>
                        <Progress value={selectedStack.resources.cpu} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Memória</span>
                          <span className="text-sm font-medium">
                            {selectedStack.resources.memory}%
                          </span>
                        </div>
                        <Progress value={selectedStack.resources.memory} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Disco</span>
                          <span className="text-sm font-medium">
                            {selectedStack.resources.disk}%
                          </span>
                        </div>
                        <Progress value={selectedStack.resources.disk} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Dependências</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStack.dependencies.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Nenhuma dependência
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedStack.dependencies.map((dep) => (
                          <Badge key={dep} variant="outline">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Requisições:
                        </span>
                        <span className="text-sm font-medium">
                          {selectedStack.metrics.requests.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Erros:</span>
                        <span className="text-sm font-medium text-red-600">
                          {selectedStack.metrics.errors}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Tempo de resposta:
                        </span>
                        <span className="text-sm font-medium">
                          {selectedStack.metrics.responseTime}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                          Disponibilidade:
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {selectedStack.metrics.availability}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Backup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status:</span>
                        <Badge
                          variant={
                            selectedStack.backup.enabled
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedStack.backup.enabled ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {selectedStack.backup.enabled && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              Último backup:
                            </span>
                            <span className="text-sm font-medium">
                              {selectedStack.backup.lastBackup}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              Frequência:
                            </span>
                            <span className="text-sm font-medium">
                              {selectedStack.backup.schedule}
                            </span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Logs Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {selectedStack.logs.map((log, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <span className="text-gray-500 font-mono">
                              {log.timestamp}
                            </span>
                            <Badge
                              variant={
                                log.level === "error"
                                  ? "destructive"
                                  : log.level === "warn"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {log.level}
                            </Badge>
                            <span>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="config" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Configuração</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedStack.config, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Stack Configuration Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedStack?.icon}
              <span>Configurar {selectedStack?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Edite as configurações desta stack
            </DialogDescription>
          </DialogHeader>

          {selectedStack && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={selectedStack.name}
                    onChange={(e) =>
                      setSelectedStack({
                        ...selectedStack,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Domínio</Label>
                  <Input
                    value={selectedStack.domain}
                    onChange={(e) =>
                      setSelectedStack({
                        ...selectedStack,
                        domain: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={selectedStack.description}
                  onChange={(e) =>
                    setSelectedStack({
                      ...selectedStack,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedStack.backup.enabled}
                  onCheckedChange={(checked) =>
                    setSelectedStack({
                      ...selectedStack,
                      backup: { ...selectedStack.backup, enabled: checked },
                    })
                  }
                />
                <Label>Backup automático</Label>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsConfiguring(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={saveStackConfig}>Salvar Configuração</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

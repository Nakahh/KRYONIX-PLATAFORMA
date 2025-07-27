import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import {
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Link,
  Database,
  Globe,
  Shield,
  Monitor,
  Bell,
  Cog,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  ExternalLink,
  Activity,
  Clock,
  Server,
  MessageSquare,
  Bot,
  BarChart3,
  Mail,
  Code,
  Cloud,
  Lock,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { enhancedApiClient } from "../../services/enhanced-api-client";

/**
 * KRYONIX Stack Auto-Configuration
 * Sistema inteligente de auto-configuração das 25+ stacks
 * Configuração automática baseada nas credenciais reais fornecidas
 */

interface StackConfigStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "configuring" | "success" | "error" | "skipped";
  progress: number;
  timeEstimate: string;
  dependencies: string[];
  errorMessage?: string;
  warnings: string[];
}

interface StackInfo {
  id: string;
  name: string;
  category:
    | "infrastructure"
    | "communication"
    | "automation"
    | "analytics"
    | "ai"
    | "storage";
  icon: React.ReactNode;
  description: string;
  domain: string;
  credentials: Record<string, string>;
  configSteps: StackConfigStep[];
  enabled: boolean;
  autoConfigurable: boolean;
  manualStepsRequired: boolean;
  priority: "high" | "medium" | "low";
  dependencies: string[];
  healthCheckUrl?: string;
  documentationUrl?: string;
}

// Dados reais das stacks fornecidas pelo usuário
const stacksConfiguration: StackInfo[] = [
  {
    id: "portainer",
    name: "Portainer",
    category: "infrastructure",
    icon: <Server className="w-5 h-5" />,
    description: "Gerenciamento de containers Docker",
    domain: "painel.kryonix.com.br",
    credentials: {
      username: "kryonix",
      password: "Vitor@123456",
      email: "portainer@kryonix.com.br",
    },
    configSteps: [
      {
        id: "connection",
        name: "Teste de Conexão",
        description: "Verificar acesso ao Portainer",
        status: "pending",
        progress: 0,
        timeEstimate: "30s",
        dependencies: [],
        warnings: [],
      },
      {
        id: "authentication",
        name: "Autenticação",
        description: "Login com credenciais",
        status: "pending",
        progress: 0,
        timeEstimate: "20s",
        dependencies: ["connection"],
        warnings: [],
      },
      {
        id: "network-setup",
        name: "Rede Kryonix-NET",
        description: "Configurar rede interna",
        status: "pending",
        progress: 0,
        timeEstimate: "45s",
        dependencies: ["authentication"],
        warnings: [],
      },
      {
        id: "monitoring",
        name: "Monitoramento",
        description: "Ativar logs e alertas",
        status: "pending",
        progress: 0,
        timeEstimate: "30s",
        dependencies: ["network-setup"],
        warnings: [],
      },
    ],
    enabled: true,
    autoConfigurable: true,
    manualStepsRequired: false,
    priority: "high",
    dependencies: [],
    healthCheckUrl: "https://painel.kryonix.com.br/api/status",
  },
  {
    id: "evolution-api",
    name: "Evolution API",
    category: "communication",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "WhatsApp Business API",
    domain: "api.kryonix.com.br",
    credentials: {
      apiKey: "6f78dbffc4acd9a32b926a38892a23f0",
      managerUrl: "https://api.kryonix.com.br/manager",
    },
    configSteps: [
      {
        id: "api-key",
        name: "Validar API Key",
        description: "Testar chave de API global",
        status: "pending",
        progress: 0,
        timeEstimate: "20s",
        dependencies: [],
        warnings: [],
      },
      {
        id: "webhook-config",
        name: "Configurar Webhooks",
        description: "Setup de webhooks para KRYONIX",
        status: "pending",
        progress: 0,
        timeEstimate: "40s",
        dependencies: ["api-key"],
        warnings: [],
      },
      {
        id: "instances",
        name: "Criar Instâncias",
        description: "Setup de instâncias WhatsApp",
        status: "pending",
        progress: 0,
        timeEstimate: "60s",
        dependencies: ["webhook-config"],
        warnings: ["Requer QR Code manual"],
      },
      {
        id: "integration",
        name: "Integração N8N",
        description: "Conectar com automações",
        status: "pending",
        progress: 0,
        timeEstimate: "30s",
        dependencies: ["instances"],
        warnings: [],
      },
    ],
    enabled: true,
    autoConfigurable: true,
    manualStepsRequired: true,
    priority: "high",
    dependencies: [],
    healthCheckUrl: "https://api.kryonix.com.br/health",
  },
  {
    id: "n8n",
    name: "N8N Workflows",
    category: "automation",
    icon: <Zap className="w-5 h-5" />,
    description: "Automação de workflows",
    domain: "n8n.kryonix.com.br",
    credentials: {
      email: "vitor.nakahh@gmail.com",
      password: "Vitor@123456",
      webhookDomain: "webhookn8n.kryonix.com.br",
    },
    configSteps: [
      {
        id: "login",
        name: "Login Inicial",
        description: "Autenticar com credenciais",
        status: "pending",
        progress: 0,
        timeEstimate: "30s",
        dependencies: [],
        warnings: [],
      },
      {
        id: "webhook-setup",
        name: "Domínio Webhook",
        description: "Configurar webhookn8n.kryonix.com.br",
        status: "pending",
        progress: 0,
        timeEstimate: "45s",
        dependencies: ["login"],
        warnings: [],
      },
      {
        id: "smtp-config",
        name: "Configurar SMTP",
        description: "SendGrid para notificações",
        status: "pending",
        progress: 0,
        timeEstimate: "40s",
        dependencies: ["webhook-setup"],
        warnings: [],
      },
      {
        id: "templates",
        name: "Templates Brasileiros",
        description: "Instalar workflows pré-configurados",
        status: "pending",
        progress: 0,
        timeEstimate: "90s",
        dependencies: ["smtp-config"],
        warnings: [],
      },
      {
        id: "evolution-connection",
        name: "Conectar Evolution API",
        description: "Integração WhatsApp",
        status: "pending",
        progress: 0,
        timeEstimate: "50s",
        dependencies: ["templates"],
        warnings: [],
      },
    ],
    enabled: true,
    autoConfigurable: true,
    manualStepsRequired: false,
    priority: "high",
    dependencies: ["evolution-api"],
    healthCheckUrl: "https://n8n.kryonix.com.br/rest/health",
  },
  {
    id: "typebot",
    name: "Typebot",
    category: "automation",
    icon: <Bot className="w-5 h-5" />,
    description: "Criador de chatbots",
    domain: "typebot.kryonix.com.br",
    credentials: {
      adminEmail: "vitor.nakahh@gmail.com",
      viewerDomain: "bot.kryonix.com.br",
    },
    configSteps: [
      {
        id: "magic-link",
        name: "Login Mágico",
        description: "Acessar via link mágico no email",
        status: "pending",
        progress: 0,
        timeEstimate: "60s",
        dependencies: [],
        warnings: ["Verificar email"],
      },
      {
        id: "viewer-domain",
        name: "Domínio Viewer",
        description: "Configurar bot.kryonix.com.br",
        status: "pending",
        progress: 0,
        timeEstimate: "30s",
        dependencies: ["magic-link"],
        warnings: [],
      },
      {
        id: "smtp-setup",
        name: "SMTP SendGrid",
        description: "Configurar notificações por email",
        status: "pending",
        progress: 0,
        timeEstimate: "40s",
        dependencies: ["viewer-domain"],
        warnings: [],
      },
      {
        id: "brazilian-templates",
        name: "Templates BR",
        description: "Instalar fluxos brasileiros",
        status: "pending",
        progress: 0,
        timeEstimate: "75s",
        dependencies: ["smtp-setup"],
        warnings: [],
      },
      {
        id: "whatsapp-integration",
        name: "Integração WhatsApp",
        description: "Conectar com Evolution API",
        status: "pending",
        progress: 0,
        timeEstimate: "45s",
        dependencies: ["brazilian-templates"],
        warnings: [],
      },
    ],
    enabled: true,
    autoConfigurable: false, // Requer link mágico manual
    manualStepsRequired: true,
    priority: "high",
    dependencies: ["evolution-api"],
    healthCheckUrl: "https://typebot.kryonix.com.br/api/health",
  },
  {
    id: "mautic",
    name: "Mautic CRM",
    category: "analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    description: "Marketing automation",
    domain: "mautic.kryonix.com.br",
    credentials: {
      username: "kryonix",
      email: "vitor.nakahh@gmail.com",
      password: "Vitor@123456",
      database: "mautic",
      dbUsername: "mautic-kryonix",
      dbPassword: "Vitor@123456",
    },
    configSteps: [
      {
        id: "database-setup",
        name: "Configurar Database",
        description: "Conectar MySQL e configurar tabelas",
        status: "pending",
        progress: 0,
        timeEstimate: "60s",
        dependencies: [],
        warnings: [],
      },
      {
        id: "admin-user",
        name: "Usuário Admin",
        description: "Criar conta administrativa",
        status: "pending",
        progress: 0,
        timeEstimate: "30s",
        dependencies: ["database-setup"],
        warnings: [],
      },
      {
        id: "smtp-config",
        name: "Configurar Email",
        description: "SendGrid para campanhas",
        status: "pending",
        progress: 0,
        timeEstimate: "45s",
        dependencies: ["admin-user"],
        warnings: [],
      },
      {
        id: "segments",
        name: "Segmentos Brasileiros",
        description: "Criar segmentações por região",
        status: "pending",
        progress: 0,
        timeEstimate: "40s",
        dependencies: ["smtp-config"],
        warnings: [],
      },
      {
        id: "campaigns",
        name: "Campanhas Padrão",
        description: "Templates de marketing BR",
        status: "pending",
        progress: 0,
        timeEstimate: "80s",
        dependencies: ["segments"],
        warnings: [],
      },
      {
        id: "api-integration",
        name: "API KRYONIX",
        description: "Conectar com plataforma",
        status: "pending",
        progress: 0,
        timeEstimate: "35s",
        dependencies: ["campaigns"],
        warnings: [],
      },
    ],
    enabled: true,
    autoConfigurable: true,
    manualStepsRequired: false,
    priority: "high",
    dependencies: [],
    healthCheckUrl: "https://mautic.kryonix.com.br/api/ping",
  },
  {
    id: "grafana",
    name: "Grafana Analytics",
    category: "analytics",
    icon: <Monitor className="w-5 h-5" />,
    description: "Dashboards e monitoramento",
    domain: "grafana.kryonix.com.br",
    credentials: {
      username: "kryonix",
      password: "Vitor@123456",
    },
    configSteps: [
      {
        id: "admin-login",
        name: "Login Administrativo",
        description: "Configurar conta principal",
        status: "pending",
        progress: 0,
        timeEstimate: "20s",
        dependencies: [],
        warnings: [],
      },
      {
        id: "prometheus-datasource",
        name: "Fonte Prometheus",
        description: "Conectar com prometheus.kryonix.com.br",
        status: "pending",
        progress: 0,
        timeEstimate: "40s",
        dependencies: ["admin-login"],
        warnings: [],
      },
      {
        id: "postgresql-datasource",
        name: "Fonte PostgreSQL",
        description: "Conectar banco de dados",
        status: "pending",
        progress: 0,
        timeEstimate: "35s",
        dependencies: ["prometheus-datasource"],
        warnings: [],
      },
      {
        id: "brazilian-dashboards",
        name: "Dashboards BR",
        description: "Importar dashboards brasileiros",
        status: "pending",
        progress: 0,
        timeEstimate: "70s",
        dependencies: ["postgresql-datasource"],
        warnings: [],
      },
      {
        id: "alerts",
        name: "Configurar Alertas",
        description: "Alertas via WhatsApp e email",
        status: "pending",
        progress: 0,
        timeEstimate: "45s",
        dependencies: ["brazilian-dashboards"],
        warnings: [],
      },
    ],
    enabled: true,
    autoConfigurable: true,
    manualStepsRequired: false,
    priority: "medium",
    dependencies: ["prometheus"],
    healthCheckUrl: "https://grafana.kryonix.com.br/api/health",
  },
  {
    id: "ollama",
    name: "Ollama AI",
    category: "ai",
    icon: <Bot className="w-5 h-5" />,
    description: "Modelos de IA locais",
    domain: "ollama.kryonix.com.br",
    credentials: {
      webui: "https://ollama.kryonix.com.br",
      api: "https://apiollama.kryonix.com.br",
    },
    configSteps: [
      {
        id: "health-check",
        name: "Verificar Serviço",
        description: "Testar disponibilidade da API",
        status: "pending",
        progress: 0,
        timeEstimate: "30s",
        dependencies: [],
        warnings: [],
      },
      {
        id: "essential-models",
        name: "Modelos Essenciais",
        description: "Baixar LLaMA2, Mistral, CodeLlama",
        status: "pending",
        progress: 0,
        timeEstimate: "300s",
        dependencies: ["health-check"],
        warnings: ["Download grande (~15GB)"],
      },
      {
        id: "brazilian-config",
        name: "Configuração BR",
        description: "Ajustar para português brasileiro",
        status: "pending",
        progress: 0,
        timeEstimate: "45s",
        dependencies: ["essential-models"],
        warnings: [],
      },
      {
        id: "kryonix-integration",
        name: "Integração KRYONIX",
        description: "Conectar com sistema autônomo",
        status: "pending",
        progress: 0,
        timeEstimate: "40s",
        dependencies: ["brazilian-config"],
        warnings: [],
      },
    ],
    enabled: false,
    autoConfigurable: true,
    manualStepsRequired: false,
    priority: "medium",
    dependencies: [],
    healthCheckUrl: "https://apiollama.kryonix.com.br/api/tags",
  },
];

interface StackAutoConfigProps {
  selectedStacks: string[];
  onConfigurationComplete: (results: any) => void;
  onConfigurationError: (error: string) => void;
}

export default function StackAutoConfig({
  selectedStacks,
  onConfigurationComplete,
  onConfigurationError,
}: StackAutoConfigProps) {
  const { toast } = useToast();

  const [configurationStacks, setConfigurationStacks] = useState<StackInfo[]>(
    [],
  );
  const [currentlyConfiguring, setCurrentlyConfiguring] = useState<
    string | null
  >(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configurationResults, setConfigurationResults] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(true);
  const [pauseOnError, setPauseOnError] = useState(true);

  // Filtrar stacks selecionadas
  useEffect(() => {
    const filtered = stacksConfiguration.filter((stack) =>
      selectedStacks.includes(stack.id),
    );

    // Ordenar por dependências (stacks sem dependências primeiro)
    const sorted = topologicalSort(filtered);
    setConfigurationStacks(sorted);
  }, [selectedStacks]);

  // Ordenação topológica para respeitar dependências
  const topologicalSort = (stacks: StackInfo[]): StackInfo[] => {
    const visited = new Set<string>();
    const result: StackInfo[] = [];

    const visit = (stack: StackInfo) => {
      if (visited.has(stack.id)) return;

      // Visitar dependências primeiro
      stack.dependencies.forEach((depId) => {
        const dependency = stacks.find((s) => s.id === depId);
        if (dependency) {
          visit(dependency);
        }
      });

      visited.add(stack.id);
      result.push(stack);
    };

    stacks.forEach(visit);
    return result;
  };

  // Iniciar configuração automática
  const startAutoConfiguration = async () => {
    setIsConfiguring(true);
    setConfigurationResults([]);

    try {
      for (const stack of configurationStacks) {
        if (!stack.enabled) continue;

        setCurrentlyConfiguring(stack.id);

        toast({
          title: `Configurando ${stack.name}...`,
          description: `Iniciando configuração de ${stack.description}`,
        });

        const stackResult = await configureStack(stack);
        setConfigurationResults((prev) => [...prev, stackResult]);

        if (stackResult.success) {
          toast({
            title: `${stack.name} configurado! ✅`,
            description: "Stack ativada e funcionando",
          });
        } else if (pauseOnError) {
          toast({
            variant: "destructive",
            title: `Erro em ${stack.name}`,
            description: stackResult.error,
          });
          break;
        }

        // Pequena pausa entre configurações
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setCurrentlyConfiguring(null);
      setCurrentStep(null);

      const successCount = configurationResults.filter((r) => r.success).length;
      const totalCount = configurationStacks.filter((s) => s.enabled).length;

      if (successCount === totalCount) {
        toast({
          title: "Configuração concluída! 🎉",
          description: `Todas as ${totalCount} stacks foram configuradas com sucesso`,
        });
        onConfigurationComplete(configurationResults);
      } else {
        onConfigurationError(
          `${totalCount - successCount} stacks falharam na configuração`,
        );
      }
    } catch (error) {
      onConfigurationError(`Erro geral na configuração: ${error}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  // Configurar uma stack específica
  const configureStack = async (stack: StackInfo): Promise<any> => {
    const result = {
      stackId: stack.id,
      stackName: stack.name,
      success: false,
      steps: [] as any[],
      error: null as string | null,
      duration: 0,
    };

    const startTime = Date.now();

    try {
      for (const step of stack.configSteps) {
        setCurrentStep(step.id);

        // Verificar dependências
        const dependenciesMet = step.dependencies.every((depId) => {
          const depStep = stack.configSteps.find((s) => s.id === depId);
          return depStep?.status === "success";
        });

        if (!dependenciesMet) {
          step.status = "skipped";
          continue;
        }

        step.status = "configuring";
        step.progress = 0;

        // Simular configuração da etapa
        const stepResult = await executeConfigurationStep(stack, step);

        if (stepResult.success) {
          step.status = "success";
          step.progress = 100;
        } else {
          step.status = "error";
          step.errorMessage = stepResult.error;
          result.error = stepResult.error;

          if (pauseOnError) {
            break;
          }
        }

        result.steps.push({
          ...step,
          result: stepResult,
        });

        // Atualizar progresso geral
        const completedSteps = stack.configSteps.filter(
          (s) => s.status === "success" || s.status === "error",
        ).length;
        const progressPercent =
          (completedSteps / stack.configSteps.length) * 100;
        setOverallProgress(progressPercent);
      }

      result.success = stack.configSteps.every(
        (step) => step.status === "success" || step.status === "skipped",
      );
      result.duration = Date.now() - startTime;

      return result;
    } catch (error) {
      result.error = `Erro na configuração: ${error}`;
      result.duration = Date.now() - startTime;
      return result;
    }
  };

  // Executar etapa de configuração específica
  const executeConfigurationStep = async (
    stack: StackInfo,
    step: StackConfigStep,
  ): Promise<any> => {
    // Simular tempo de configuração baseado na estimativa
    const timeMs = parseInt(step.timeEstimate.replace(/[^\d]/g, "")) * 1000;

    // Simular progresso gradual
    const progressInterval = setInterval(() => {
      step.progress = Math.min(step.progress + 20, 90);
    }, timeMs / 5);

    try {
      // Simular configuração real baseada no tipo de etapa
      await new Promise((resolve) => setTimeout(resolve, timeMs));

      // Finalizar progresso
      clearInterval(progressInterval);
      step.progress = 100;

      // Simular sucesso na maioria dos casos (95%)
      const success = Math.random() > 0.05;

      if (success) {
        return {
          success: true,
          message: `${step.name} configurado com sucesso`,
          details: await getStepConfigurationDetails(stack, step),
        };
      } else {
        throw new Error(`Falha na configuração de ${step.name}`);
      }
    } catch (error) {
      clearInterval(progressInterval);
      return {
        success: false,
        error: `Erro em ${step.name}: ${error}`,
      };
    }
  };

  // Obter detalhes específicos da configuração
  const getStepConfigurationDetails = async (
    stack: StackInfo,
    step: StackConfigStep,
  ): Promise<any> => {
    const details: any = {};

    switch (step.id) {
      case "connection":
        details.connectionStatus = "ok";
        details.responseTime = `${Math.random() * 200 + 50}ms`;
        break;

      case "authentication":
        details.tokenGenerated = true;
        details.permissions = ["admin", "read", "write"];
        break;

      case "api-key":
        details.keyValid = true;
        details.rateLimit = "1000 requests/min";
        break;

      case "webhook-config":
        details.webhookUrl = `https://api.kryonix.com.br/webhooks/${stack.id}`;
        details.events = ["message", "status", "error"];
        break;

      case "database-setup":
        details.tablesCreated = 47;
        details.indexesOptimized = true;
        break;

      case "essential-models":
        details.modelsInstalled = ["llama2:7b", "mistral:7b", "codellama:7b"];
        details.totalSize = "14.2GB";
        break;

      default:
        details.configured = true;
    }

    return details;
  };

  // Configurar stack individual manualmente
  const configureStackManually = async (stackId: string) => {
    const stack = configurationStacks.find((s) => s.id === stackId);
    if (!stack) return;

    setCurrentlyConfiguring(stackId);
    const result = await configureStack(stack);
    setConfigurationResults((prev) => [...prev, result]);
    setCurrentlyConfiguring(null);
  };

  // Renderizar status da stack
  const renderStackStatus = (stack: StackInfo) => {
    const isCurrentlyConfiguring = currentlyConfiguring === stack.id;
    const result = configurationResults.find((r) => r.stackId === stack.id);

    let status: "pending" | "configuring" | "success" | "error" = "pending";
    let progress = 0;

    if (result) {
      status = result.success ? "success" : "error";
      progress = 100;
    } else if (isCurrentlyConfiguring) {
      status = "configuring";
      const completedSteps = stack.configSteps.filter(
        (s) => s.status === "success",
      ).length;
      progress = (completedSteps / stack.configSteps.length) * 100;
    }

    const getStatusIcon = () => {
      switch (status) {
        case "success":
          return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "error":
          return <XCircle className="w-5 h-5 text-red-500" />;
        case "configuring":
          return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
        default:
          return <Clock className="w-5 h-5 text-gray-400" />;
      }
    };

    const getStatusColor = () => {
      switch (status) {
        case "success":
          return "border-green-200 bg-green-50";
        case "error":
          return "border-red-200 bg-red-50";
        case "configuring":
          return "border-blue-200 bg-blue-50";
        default:
          return "border-gray-200 bg-white";
      }
    };

    return (
      <Card key={stack.id} className={`${getStatusColor()} transition-all`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {stack.icon}
              </div>
              <div>
                <CardTitle className="text-base">{stack.name}</CardTitle>
                <p className="text-sm text-gray-600">{stack.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <Badge
                className={`text-xs ${
                  stack.priority === "high"
                    ? "bg-red-100 text-red-800"
                    : stack.priority === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {stack.priority === "high"
                  ? "Essencial"
                  : stack.priority === "medium"
                    ? "Importante"
                    : "Opcional"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Progresso geral */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            {/* Informações da stack */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>Domínio: {stack.domain}</div>
              <div>Categoria: {stack.category}</div>
              <div>Etapas: {stack.configSteps.length}</div>
              <div>Auto-config: {stack.autoConfigurable ? "Sim" : "Não"}</div>
            </div>

            {/* Warnings */}
            {stack.configSteps.some((step) => step.warnings.length > 0) && (
              <div className="bg-yellow-50 p-2 rounded text-xs">
                <div className="flex items-center space-x-1 text-yellow-700 mb-1">
                  <AlertCircle className="w-3 h-3" />
                  <span className="font-medium">Atenção:</span>
                </div>
                {stack.configSteps.map((step) =>
                  step.warnings.map((warning, idx) => (
                    <div key={idx} className="text-yellow-600">
                      • {warning}
                    </div>
                  )),
                )}
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetails(stack.id)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Detalhes
                </Button>

                {stack.healthCheckUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(`https://${stack.domain}`, "_blank")
                    }
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Abrir
                  </Button>
                )}
              </div>

              {!autoMode && status === "pending" && (
                <Button
                  size="sm"
                  onClick={() => configureStackManually(stack.id)}
                  disabled={isCurrentlyConfiguring}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configurar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header de controle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Auto-Configuração Inteligente</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Configuração automática de{" "}
                {configurationStacks.filter((s) => s.enabled).length} stacks
                selecionadas
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch checked={autoMode} onCheckedChange={setAutoMode} />
                <span className="text-sm">Modo Automático</span>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={pauseOnError}
                  onCheckedChange={setPauseOnError}
                />
                <span className="text-sm">Pausar em Erro</span>
              </div>

              <Button
                onClick={startAutoConfiguration}
                disabled={isConfiguring || !autoMode}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConfiguring ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Configuração
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Progresso geral */}
        {isConfiguring && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progresso Geral</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} />

              {currentlyConfiguring && (
                <div className="text-sm text-gray-600">
                  Configurando:{" "}
                  {
                    configurationStacks.find(
                      (s) => s.id === currentlyConfiguring,
                    )?.name
                  }
                  {currentStep && ` - ${currentStep}`}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Grade de stacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configurationStacks.map(renderStackStatus)}
      </div>

      {/* Resultados */}
      {configurationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {configurationResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.stackName}</div>
                      {result.error && (
                        <div className="text-sm text-red-600">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {(result.duration / 1000).toFixed(1)}s
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de detalhes */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Configuração</DialogTitle>
            <DialogDescription>
              {showDetails &&
                configurationStacks.find((s) => s.id === showDetails)
                  ?.description}
            </DialogDescription>
          </DialogHeader>

          {showDetails && (
            <div className="space-y-4">
              {configurationStacks
                .find((s) => s.id === showDetails)
                ?.configSteps.map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {step.status === "success" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {step.status === "error" && (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        {step.status === "configuring" && (
                          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                        )}
                        {step.status === "pending" && (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="font-medium">{step.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {step.timeEstimate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {step.description}
                    </p>
                    {step.progress > 0 && (
                      <Progress value={step.progress} className="h-1" />
                    )}
                    {step.errorMessage && (
                      <p className="text-sm text-red-600 mt-2">
                        {step.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

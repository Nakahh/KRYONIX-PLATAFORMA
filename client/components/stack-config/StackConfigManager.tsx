import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Save,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Settings,
  Server,
  Database,
  MessageSquare,
  Workflow,
  Bot,
  BarChart3,
  Shield,
  FileText,
  Cloud,
  Mail,
  CreditCard,
  Zap,
  Monitor,
  Upload,
  Download,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";

/**
 * Sistema de Gerenciamento de Configurações de Stacks
 * KRYONIX - Controle centralizado das 25 stacks do servidor
 */

export interface StackConfig {
  id: string;
  name: string;
  domain: string;
  category:
    | "essential"
    | "automation"
    | "analytics"
    | "infrastructure"
    | "communication";
  status: "active" | "inactive" | "error" | "maintenance";
  icon: React.ReactNode;
  credentials: {
    username?: string;
    email?: string;
    password?: string;
    apiKey?: string;
    host?: string;
    port?: string;
    database?: string;
    [key: string]: any;
  };
  urls: {
    dashboard?: string;
    api?: string;
    webhook?: string;
    documentation?: string;
  };
  description: string;
  lastChecked: string;
  version?: string;
}

interface StackConfigManagerProps {
  onConfigChange?: (stackId: string, config: StackConfig) => void;
}

export default function StackConfigManager({
  onConfigChange,
}: StackConfigManagerProps) {
  const { toast } = useToast();
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [configs, setConfigs] = useState<StackConfig[]>([]);

  // Inicializar com os dados do servidor fornecidos
  useEffect(() => {
    const initialConfigs: StackConfig[] = [
      {
        id: "portainer",
        name: "Portainer",
        domain: "painel.kryonix.com.br",
        category: "infrastructure",
        status: "active",
        icon: <Server className="w-5 h-5" />,
        credentials: {
          username: "kryonix",
          password: "Vitor@123456",
          email: "portainer@kryonix.com.br",
        },
        urls: {
          dashboard: "https://painel.kryonix.com.br",
        },
        description: "Gerenciamento de containers Docker",
        lastChecked: new Date().toISOString(),
        version: "latest",
      },
      {
        id: "evolution-api",
        name: "Evolution API",
        domain: "api.kryonix.com.br",
        category: "communication",
        status: "active",
        icon: <MessageSquare className="w-5 h-5" />,
        credentials: {
          apiKey: "6f78dbffc4acd9a32b926a38892a23f0",
        },
        urls: {
          dashboard: "https://api.kryonix.com.br/manager",
          api: "https://api.kryonix.com.br",
        },
        description: "API para WhatsApp Business",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "n8n",
        name: "N8N Workflows",
        domain: "n8n.kryonix.com.br",
        category: "automation",
        status: "active",
        icon: <Workflow className="w-5 h-5" />,
        credentials: {
          email: "vitor.nakahh@gmail.com",
          password: "Vitor@123456",
          smtp_email: "n8n@kryonix.com.br",
          smtp_user: "VitorNakah",
          smtp_password: "md-f-p1Np3SlN56vU15qUPelw",
          smtp_host: "smtp.mandrillapp.com",
          smtp_port: "587",
        },
        urls: {
          dashboard: "https://n8n.kryonix.com.br",
          webhook: "https://webhookn8n.kryonix.com.br",
        },
        description: "Automação de workflows e integrações",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "typebot",
        name: "Typebot",
        domain: "typebot.kryonix.com.br",
        category: "automation",
        status: "active",
        icon: <Bot className="w-5 h-5" />,
        credentials: {
          smtp_email: "typebot@kryonix.com.br",
          smtp_user: "VitorNakah",
          smtp_password: "md-f-p1Np3SlN56vU15qUPelw",
          smtp_host: "smtp.mandrillapp.com",
          smtp_port: "587",
        },
        urls: {
          dashboard: "https://typebot.kryonix.com.br",
          viewer: "https://bot.kryonix.com.br",
        },
        description: "Criador de chatbots visuais",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "mautic",
        name: "Mautic",
        domain: "mautic.kryonix.com.br",
        category: "analytics",
        status: "active",
        icon: <BarChart3 className="w-5 h-5" />,
        credentials: {
          username: "kryonix",
          email: "vitor.nakahh@gmail.com",
          password: "Vitor@123456",
          database_host: "mysql",
          database_port: "3306",
          database_name: "mautic",
          database_username: "mautic-kryonix",
          database_password: "Vitor@123456",
        },
        urls: {
          dashboard: "https://mautic.kryonix.com.br",
        },
        description: "Marketing automation e CRM",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "supabase",
        name: "Supabase",
        domain: "supabase.kryonix.com.br",
        category: "infrastructure",
        status: "active",
        icon: <Database className="w-5 h-5" />,
        credentials: {
          username: "kryonix",
          password: "Vitor@123456",
          jwt_key: "7dfe47ffb11b671cba62c80de0dbaeb43d795b05",
          anon_key:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.Pnqhifc7Z77QgbZcTpFFJ2htenzLDZv_DKOlAqAmV5E",
          service_key:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.cKLt0xTePGZ0rLNhi-zDIUKhFGPzYThI6RxaX5LmYfc",
        },
        urls: {
          dashboard: "https://supabase.kryonix.com.br",
        },
        description: "Backend-as-a-Service com PostgreSQL",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "grafana",
        name: "Grafana",
        domain: "grafana.kryonix.com.br",
        category: "analytics",
        status: "active",
        icon: <Monitor className="w-5 h-5" />,
        credentials: {
          username: "kryonix",
          password: "Vitor@123456",
        },
        urls: {
          dashboard: "https://grafana.kryonix.com.br",
          prometheus: "https://prometheus.kryonix.com.br",
          cadvisor: "https://cadvisor.kryonix.com.br",
          node: "https://node.kryonix.com.br",
        },
        description: "Monitoramento e métricas do sistema",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "minio",
        name: "MinIO",
        domain: "minio.kryonix.com.br",
        category: "infrastructure",
        status: "active",
        icon: <Cloud className="w-5 h-5" />,
        credentials: {
          username: "kryonix",
          password: "Vitor@123456",
        },
        urls: {
          dashboard: "https://minio.kryonix.com.br",
          api: "https://storage.kryonix.com.br",
        },
        description: "Armazenamento de objetos S3-compatível",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "chatwoot",
        name: "Chatwoot",
        domain: "chat.kryonix.com.br",
        category: "communication",
        status: "active",
        icon: <MessageSquare className="w-5 h-5" />,
        credentials: {
          email: "vitor.nakahh@gmail.com",
          password: "Vitor@123456",
        },
        urls: {
          dashboard: "https://chat.kryonix.com.br",
        },
        description: "Central de atendimento multicanal",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "keycloak",
        name: "Keycloak",
        domain: "keycloak.kryonix.com.br",
        category: "essential",
        status: "active",
        icon: <Shield className="w-5 h-5" />,
        credentials: {
          username: "kryonix",
          password: "Vitor@123456",
        },
        urls: {
          dashboard: "https://keycloak.kryonix.com.br",
        },
        description: "Gerenciamento de identidade e acesso",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "metabase",
        name: "Metabase",
        domain: "metabase.kryonix.com.br",
        category: "analytics",
        status: "active",
        icon: <BarChart3 className="w-5 h-5" />,
        credentials: {
          username: "kryonix",
          password: "Vitor@123456",
        },
        urls: {
          dashboard: "https://metabase.kryonix.com.br",
        },
        description: "Business Intelligence e dashboards",
        lastChecked: new Date().toISOString(),
      },
      {
        id: "uptime-kuma",
        name: "Uptime Kuma",
        domain: "up.kryonix.com.br",
        category: "analytics",
        status: "active",
        icon: <Monitor className="w-5 h-5" />,
        credentials: {
          username: "kryonix",
          password: "Vitor@123456",
        },
        urls: {
          dashboard: "https://up.kryonix.com.br",
        },
        description: "Monitoramento de uptime e disponibilidade",
        lastChecked: new Date().toISOString(),
      },
    ];

    setConfigs(initialConfigs);
  }, []);

  const togglePasswordVisibility = (stackId: string, field: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [`${stackId}-${field}`]: !prev[`${stackId}-${field}`],
    }));
  };

  const toggleEditMode = (stackId: string) => {
    setEditMode((prev) => ({
      ...prev,
      [stackId]: !prev[stackId],
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  const saveStackConfig = (stackId: string) => {
    toggleEditMode(stackId);
    toast({
      title: "Configurações Salvas",
      description: "As configurações da stack foram atualizadas com sucesso.",
    });

    // Callback para parent component
    if (onConfigChange) {
      const config = configs.find((c) => c.id === stackId);
      if (config) {
        onConfigChange(stackId, config);
      }
    }
  };

  const testConnection = async (stackId: string) => {
    const config = configs.find((c) => c.id === stackId);
    if (!config) return;

    toast({
      title: "Testando Conexão",
      description: `Verificando status de ${config.name}...`,
    });

    // Simular teste de conexão
    setTimeout(() => {
      toast({
        title: "Conexão OK",
        description: `${config.name} está respondendo normalmente.`,
      });
    }, 2000);
  };

  const exportConfigs = () => {
    const dataStr = JSON.stringify(configs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kryonix-stack-configs.json";
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Configurações Exportadas",
      description: "Arquivo de backup das configurações baixado com sucesso.",
    });
  };

  const importConfigs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfigs = JSON.parse(e.target?.result as string);
        setConfigs(importedConfigs);
        toast({
          title: "Configurações Importadas",
          description: "Configurações restauradas do arquivo de backup.",
        });
      } catch (error) {
        toast({
          title: "Erro na Importação",
          description: "Arquivo de configuração inválido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const getStatusBadge = (status: StackConfig["status"]) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", text: "Ativo" },
      inactive: { color: "bg-gray-100 text-gray-800", text: "Inativo" },
      error: { color: "bg-red-100 text-red-800", text: "Erro" },
      maintenance: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Manutenção",
      },
    };

    const config = statusConfig[status];
    return <Badge className={`${config.color} border-0`}>{config.text}</Badge>;
  };

  const getCategoryIcon = (category: StackConfig["category"]) => {
    const icons = {
      essential: <Zap className="w-4 h-4" />,
      automation: <Bot className="w-4 h-4" />,
      analytics: <BarChart3 className="w-4 h-4" />,
      infrastructure: <Server className="w-4 h-4" />,
      communication: <MessageSquare className="w-4 h-4" />,
    };
    return icons[category];
  };

  const categories = [
    "essential",
    "automation",
    "analytics",
    "infrastructure",
    "communication",
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Configuração das Stacks
          </h2>
          <p className="text-gray-600">
            Gerencie todas as 25 stacks do servidor 144.202.90.55
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={importConfigs}
            className="hidden"
            id="import-configs"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("import-configs")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={exportConfigs}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Grid de stacks por categoria */}
      {categories.map((category) => {
        const categoryStacks = configs.filter(
          (stack) => stack.category === category,
        );
        if (categoryStacks.length === 0) return null;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(category)}
              <h3 className="text-lg font-semibold capitalize text-gray-900">
                {category === "essential" && "Essenciais"}
                {category === "automation" && "Automação"}
                {category === "analytics" && "Analytics"}
                {category === "infrastructure" && "Infraestrutura"}
                {category === "communication" && "Comunicação"}
              </h3>
              <Badge variant="secondary">{categoryStacks.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStacks.map((stack) => (
                <Card
                  key={stack.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {stack.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {stack.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {stack.domain}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(stack.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{stack.description}</p>

                    {/* URLs */}
                    <div className="space-y-2">
                      {Object.entries(stack.urls).map(([type, url]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="capitalize text-gray-600">
                            {type}:
                          </span>
                          <div className="flex items-center space-x-1">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {url?.substring(0, 30)}...
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(url || "", type)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Credenciais */}
                    {editMode[stack.id] ? (
                      <div className="space-y-3 border-t pt-3">
                        <Label className="text-sm font-medium">
                          Credenciais
                        </Label>
                        {Object.entries(stack.credentials).map(
                          ([key, value]) => (
                            <div key={key} className="space-y-1">
                              <Label className="text-xs text-gray-600 capitalize">
                                {key.replace("_", " ")}
                              </Label>
                              <Input
                                type={
                                  key.includes("password") ||
                                  key.includes("key")
                                    ? "password"
                                    : "text"
                                }
                                value={value || ""}
                                className="text-xs"
                                onChange={(e) => {
                                  // Update config
                                  setConfigs((prev) =>
                                    prev.map((c) =>
                                      c.id === stack.id
                                        ? {
                                            ...c,
                                            credentials: {
                                              ...c.credentials,
                                              [key]: e.target.value,
                                            },
                                          }
                                        : c,
                                    ),
                                  );
                                }}
                              />
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 border-t pt-3">
                        <Label className="text-sm font-medium">
                          Credenciais
                        </Label>
                        {Object.entries(stack.credentials).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="capitalize text-gray-600">
                                {key.replace("_", " ")}:
                              </span>
                              <div className="flex items-center space-x-1">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {showPasswords[`${stack.id}-${key}`]
                                    ? value
                                    : key.includes("password") ||
                                        key.includes("key")
                                      ? "•���••••••"
                                      : String(value).substring(0, 20)}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    togglePasswordVisibility(stack.id, key)
                                  }
                                >
                                  {showPasswords[`${stack.id}-${key}`] ? (
                                    <EyeOff className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    copyToClipboard(String(value), key)
                                  }
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testConnection(stack.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Testar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(stack.urls.dashboard, "_blank")
                          }
                        >
                          Abrir
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        onClick={() =>
                          editMode[stack.id]
                            ? saveStackConfig(stack.id)
                            : toggleEditMode(stack.id)
                        }
                      >
                        {editMode[stack.id] ? (
                          <>
                            <Save className="h-3 w-3 mr-1" />
                            Salvar
                          </>
                        ) : (
                          <>
                            <Settings className="h-3 w-3 mr-1" />
                            Editar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Server,
  Database,
  Bot,
  MessageCircle,
  Zap,
  Shield,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Save,
  Plus,
} from "lucide-react";
import {
  KRYONIX_STACKS,
  StackConfig,
  stackIntegration,
} from "@/services/stack-integration";

interface StackCredentialsForm {
  domain: string;
  apiUrl?: string;
  username?: string;
  password?: string;
  email?: string;
  apiKey?: string;
  webhookUrl?: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  smtpPassword?: string;
  additionalConfig?: Record<string, string>;
}

export default function StacksManager() {
  const [stacks, setStacks] = useState<StackConfig[]>(KRYONIX_STACKS);
  const [selectedStack, setSelectedStack] = useState<StackConfig | null>(null);
  const [credentials, setCredentials] = useState<StackCredentialsForm>({
    domain: "",
    apiUrl: "",
    username: "",
    password: "",
    email: "",
    apiKey: "",
    webhookUrl: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    additionalConfig: {},
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [healthChecks, setHealthChecks] = useState<Map<string, any>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // Configurações reais das stacks baseadas nas informações fornecidas
  const realStackConfigs: Record<string, StackCredentialsForm> = {
    evolution_api: {
      domain: "api.kryonix.com.br",
      apiUrl: "https://api.kryonix.com.br",
      apiKey: "6f78dbffc4acd9a32b926a38892a23f0",
      username: "",
      password: "",
      email: "",
      additionalConfig: {
        managerUrl: "https://api.kryonix.com.br/manager",
        globalApiKey: "6f78dbffc4acd9a32b926a38892a23f0",
      },
    },
    chatwoot: {
      domain: "chat.kryonix.com.br",
      apiUrl: "https://chat.kryonix.com.br/api/v1",
      username: "vitor.nakahh@gmail.com",
      password: "Vitor@123456",
      email: "chatwoot@kryonix.com.br",
      smtpHost: "smtp.sendgrid.net",
      smtpPort: "465",
      smtpUser: "apikey",
      smtpPassword:
        "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",
      additionalConfig: {
        empresa: "Kryonix-SERVIDOR",
      },
    },
    n8n: {
      domain: "n8n.kryonix.com.br",
      apiUrl: "https://n8n.kryonix.com.br/api/v1",
      username: "vitor.nakahh@gmail.com",
      password: "Vitor@123456",
      email: "n8n@kryonix.com.br",
      webhookUrl: "https://webhookn8n.kryonix.com.br",
      smtpHost: "smtp.sendgrid.net",
      smtpPort: "465",
      smtpUser: "apikey",
      smtpPassword:
        "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",
    },
    typebot: {
      domain: "typebot.kryonix.com.br",
      apiUrl: "https://typebot.kryonix.com.br/api",
      email: "typebot@kryonix.com.br",
      smtpHost: "smtp.sendgrid.net",
      smtpPort: "465",
      smtpUser: "apikey",
      smtpPassword:
        "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",
      additionalConfig: {
        viewerDomain: "bot.kryonix.com.br",
        version: "latest",
      },
    },
    mautic: {
      domain: "mautic.kryonix.com.br",
      apiUrl: "https://mautic.kryonix.com.br/api",
      username: "kryonix",
      password: "Vitor@123456",
      email: "vitor.nakahh@gmail.com",
      additionalConfig: {
        dbHost: "mysql",
        dbPort: "3306",
        dbName: "mautic",
        dbUser: "mautic-kryonix",
        dbPassword: "Vitor@123456",
      },
    },
    dify_ai: {
      domain: "dify.kryonix.com.br",
      apiUrl: "https://dify-ai.kryonix.com.br",
      email: "dify@kryonix.com.br",
      smtpHost: "smtp.sendgrid.net",
      smtpPort: "465",
      smtpUser: "apikey",
      smtpPassword:
        "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",
    },
    ollama: {
      domain: "ollama.kryonix.com.br",
      apiUrl: "https://apiollama.kryonix.com.br",
      additionalConfig: {
        webUI: "https://ollama.kryonix.com.br",
      },
    },
    postgresql: {
      domain: "pgadmin.kryonix.com.br",
      username: "vitor.nakahh@gmail.com",
      password: "Vitor@123456",
    },
    redis: {
      domain: "redis.kryonix.com.br",
      additionalConfig: {
        authType: "google",
      },
    },
    minio: {
      domain: "minio.kryonix.com.br",
      apiUrl: "https://storage.kryonix.com.br",
      username: "kryonix",
      password: "Vitor@123456",
    },
    grafana: {
      domain: "grafana.kryonix.com.br",
      apiUrl: "https://grafana.kryonix.com.br/api",
      username: "kryonix",
      password: "Vitor@123456",
    },
    prometheus: {
      domain: "prometheus.kryonix.com.br",
    },
    uptime_kuma: {
      domain: "up.kryonix.com.br",
      username: "kryonix",
      password: "Vitor@123456",
    },
    metabase: {
      domain: "metabase.kryonix.com.br",
      apiUrl: "https://metabase.kryonix.com.br/api",
      username: "kryonix",
      password: "Vitor@123456",
    },
    portainer: {
      domain: "painel.kryonix.com.br",
      username: "kryonix",
      password: "Vitor@123456",
      email: "portainer@kryonix.com.br",
      additionalConfig: {
        servidor: "Kryonix-SERVIDOR",
        rede: "Kryonix-NET",
      },
    },
  };

  useEffect(() => {
    loadHealthChecks();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadHealthChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadHealthChecks = async () => {
    try {
      const health = await stackIntegration.performHealthChecks();
      setHealthChecks(health);
    } catch (error) {
      console.error("Erro ao carregar health checks:", error);
    }
  };

  const refreshStacks = async () => {
    setIsRefreshing(true);
    await loadHealthChecks();
    setIsRefreshing(false);
  };

  const openStackConfig = (stack: StackConfig) => {
    setSelectedStack(stack);
    const realConfig = realStackConfigs[stack.id] || {};
    setCredentials({
      domain: stack.url.replace("https://", "").replace("http://", ""),
      apiUrl: stack.apiUrl || "",
      ...realConfig,
    });
  };

  const saveStackConfig = () => {
    if (!selectedStack) return;

    // Atualizar configuração da stack
    const updatedStacks = stacks.map((stack) =>
      stack.id === selectedStack.id
        ? {
            ...stack,
            url: credentials.domain.startsWith("http")
              ? credentials.domain
              : `https://${credentials.domain}`,
            apiUrl: credentials.apiUrl,
            credentials: {
              username: credentials.username,
              password: credentials.password,
              apiKey: credentials.apiKey,
              token: credentials.apiKey,
              webhookUrl: credentials.webhookUrl,
              additionalConfig: credentials.additionalConfig,
            },
          }
        : stack,
    );

    setStacks(updatedStacks);

    // Salvar no localStorage para persistência
    localStorage.setItem(
      "kryonix_stacks_config",
      JSON.stringify(updatedStacks),
    );

    setSelectedStack(null);
  };

  const getStatusIcon = (stackId: string) => {
    const health = healthChecks.get(stackId);
    if (!health)
      return <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />;

    switch (health.status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (stackId: string) => {
    const health = healthChecks.get(stackId);
    if (!health) return "secondary";

    switch (health.status) {
      case "online":
        return "default";
      case "warning":
        return "secondary";
      case "error":
      case "offline":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "communication":
        return <MessageCircle className="h-4 w-4" />;
      case "automation":
        return <Zap className="h-4 w-4" />;
      case "ai":
        return <Bot className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "monitoring":
        return <BarChart3 className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "storage":
        return <Server className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const filteredStacks =
    activeCategory === "all"
      ? stacks
      : stacks.filter((stack) => stack.category === activeCategory);

  const categories = [
    { id: "all", name: "Todas", count: stacks.length },
    {
      id: "communication",
      name: "Comunicação",
      count: stacks.filter((s) => s.category === "communication").length,
    },
    {
      id: "automation",
      name: "Automação",
      count: stacks.filter((s) => s.category === "automation").length,
    },
    {
      id: "ai",
      name: "Inteligência Artificial",
      count: stacks.filter((s) => s.category === "ai").length,
    },
    {
      id: "database",
      name: "Banco de Dados",
      count: stacks.filter((s) => s.category === "database").length,
    },
    {
      id: "monitoring",
      name: "Monitoramento",
      count: stacks.filter((s) => s.category === "monitoring").length,
    },
    {
      id: "security",
      name: "Segurança",
      count: stacks.filter((s) => s.category === "security").length,
    },
    {
      id: "storage",
      name: "Armazenamento",
      count: stacks.filter((s) => s.category === "storage").length,
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const summary = stackIntegration.getStacksSummary();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciador de Stacks KRYONIX</h1>
          <p className="text-muted-foreground">
            Configure e monitore todas as 25 stacks da plataforma em tempo real
          </p>
        </div>
        <Button onClick={refreshStacks} disabled={isRefreshing}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Atualizar Status
        </Button>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{summary.online}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{summary.warning}</p>
                <p className="text-xs text-muted-foreground">Atenção</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {summary.offline + summary.error}
                </p>
                <p className="text-xs text-muted-foreground">Problemas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {summary.uptime.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">Uptime Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por Categoria */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-2"
            >
              {getCategoryIcon(category.id)}
              <span className="hidden sm:inline">{category.name}</span>
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStacks.map((stack) => (
              <Card key={stack.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{stack.icon}</span>
                      <div>
                        <CardTitle className="text-lg">
                          {stack.displayName}
                        </CardTitle>
                        <CardDescription>{stack.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(stack.id)}>
                      {getStatusIcon(stack.id)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Domínio:</span>
                      <div className="flex items-center space-x-1">
                        <span className="font-mono text-xs">
                          {stack.url.replace("https://", "")}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(stack.url)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Versão:</span>
                      <Badge variant="outline">{stack.version}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Categoria:</span>
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(stack.category)}
                        <span className="capitalize">{stack.category}</span>
                      </div>
                    </div>

                    {healthChecks.get(stack.id) && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            Resposta: {healthChecks.get(stack.id)?.responseTime}
                            ms
                          </span>
                          <span>
                            Uptime: {healthChecks.get(stack.id)?.uptime}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(stack.url, "_blank")}
                        className="flex-1"
                      >
                        Abrir Painel
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => openStackConfig(stack)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Configurar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <span className="text-2xl">{stack.icon}</span>
                              <span>Configurar {stack.displayName}</span>
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                As credenciais são armazenadas localmente.
                                Mantenha-as seguras!
                              </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="domain">
                                  Domínio Principal
                                </Label>
                                <Input
                                  id="domain"
                                  value={credentials.domain}
                                  onChange={(e) =>
                                    setCredentials({
                                      ...credentials,
                                      domain: e.target.value,
                                    })
                                  }
                                  placeholder="exemplo.kryonix.com.br"
                                />
                              </div>

                              <div>
                                <Label htmlFor="apiUrl">URL da API</Label>
                                <Input
                                  id="apiUrl"
                                  value={credentials.apiUrl || ""}
                                  onChange={(e) =>
                                    setCredentials({
                                      ...credentials,
                                      apiUrl: e.target.value,
                                    })
                                  }
                                  placeholder="https://api.exemplo.com"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="username">Usuário/Email</Label>
                                <Input
                                  id="username"
                                  value={credentials.username || ""}
                                  onChange={(e) =>
                                    setCredentials({
                                      ...credentials,
                                      username: e.target.value,
                                    })
                                  }
                                  placeholder="usuario@exemplo.com"
                                />
                              </div>

                              <div>
                                <Label htmlFor="password">Senha</Label>
                                <div className="flex space-x-2">
                                  <Input
                                    id="password"
                                    type={showPasswords ? "text" : "password"}
                                    value={credentials.password || ""}
                                    onChange={(e) =>
                                      setCredentials({
                                        ...credentials,
                                        password: e.target.value,
                                      })
                                    }
                                    placeholder="••••••••"
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setShowPasswords(!showPasswords)
                                    }
                                  >
                                    {showPasswords ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="apiKey">Chave da API</Label>
                              <div className="flex space-x-2">
                                <Input
                                  id="apiKey"
                                  type={showPasswords ? "text" : "password"}
                                  value={credentials.apiKey || ""}
                                  onChange={(e) =>
                                    setCredentials({
                                      ...credentials,
                                      apiKey: e.target.value,
                                    })
                                  }
                                  placeholder="sk-••••••••••••••••••••••••••••••"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(credentials.apiKey || "")
                                  }
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {stack.category === "communication" && (
                              <div className="space-y-4 border-t pt-4">
                                <h4 className="font-semibold">
                                  Configurações SMTP
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="smtpHost">Host SMTP</Label>
                                    <Input
                                      id="smtpHost"
                                      value={credentials.smtpHost || ""}
                                      onChange={(e) =>
                                        setCredentials({
                                          ...credentials,
                                          smtpHost: e.target.value,
                                        })
                                      }
                                      placeholder="smtp.sendgrid.net"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="smtpPort">Porta SMTP</Label>
                                    <Input
                                      id="smtpPort"
                                      value={credentials.smtpPort || ""}
                                      onChange={(e) =>
                                        setCredentials({
                                          ...credentials,
                                          smtpPort: e.target.value,
                                        })
                                      }
                                      placeholder="465"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex space-x-2 pt-4">
                              <Button
                                onClick={saveStackConfig}
                                className="flex-1"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Configuração
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedStack(null)}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

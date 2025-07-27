import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Download,
  Trash2,
  Play,
  Pause,
  Settings,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  HardDrive,
  Cpu,
  Zap,
  Globe,
  Code,
  MessageSquare,
  Brain,
  Rocket,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { KryonixLogoPremium } from "@/components/brand/KryonixLogoPremium";
import {
  PremiumCard,
  PremiumButton,
  PremiumBadge,
  PremiumLoading,
} from "@/components/ui/premium-components";
import { cn } from "@/lib/utils";

interface OllamaModel {
  name: string;
  description: string;
  size: string;
  parameters: string;
  family: string;
  capabilities: string[];
  language: string[];
  useCase: string[];
  installed: boolean;
  downloading: boolean;
  error?: string;
}

interface ModelStats {
  total: number;
  installed: number;
  downloading: number;
  families: string[];
  totalSize: number;
  byFamily: Record<string, { total: number; installed: number }>;
}

const familyIcons: Record<string, React.ComponentType<any>> = {
  LLaMA: Bot,
  "Code LLaMA": Code,
  Mistral: Globe,
  Orca: MessageSquare,
  Vicuna: MessageSquare,
  Alpaca: Brain,
  "Neural Chat": Cpu,
  Dolphin: Rocket,
  OpenHermes: Settings,
  Phi: Zap,
  Zephyr: Bot,
  Gemma: Brain,
};

const familyColors: Record<string, string> = {
  LLaMA: "from-blue-500 to-blue-600",
  "Code LLaMA": "from-green-500 to-green-600",
  Mistral: "from-purple-500 to-purple-600",
  Orca: "from-cyan-500 to-cyan-600",
  Vicuna: "from-pink-500 to-pink-600",
  Alpaca: "from-yellow-500 to-yellow-600",
  "Neural Chat": "from-gray-500 to-gray-600",
  Dolphin: "from-indigo-500 to-indigo-600",
  OpenHermes: "from-teal-500 to-teal-600",
  Phi: "from-orange-500 to-orange-600",
  Zephyr: "from-red-500 to-red-600",
  Gemma: "from-emerald-500 to-emerald-600",
};

export default function OllamaModelsManager() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [testResult, setTestResult] = useState<string>("");
  const [testLoading, setTestLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<OllamaModel | null>(null);

  // Carregar dados dos modelos
  useEffect(() => {
    loadModelsData();
    const interval = setInterval(loadModelsData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadModelsData = async () => {
    try {
      const [modelsResponse, statsResponse] = await Promise.all([
        fetch("/api/ollama/models"),
        fetch("/api/ollama/stats"),
      ]);

      if (modelsResponse.ok && statsResponse.ok) {
        const modelsData = await modelsResponse.json();
        const statsData = await statsResponse.json();

        setModels(modelsData);
        setStats(statsData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados dos modelos:", error);
    } finally {
      setLoading(false);
    }
  };

  const installModel = async (modelName: string) => {
    try {
      const model = models.find((m) => m.name === modelName);
      if (!model) return;

      // Atualizar estado para mostrar download
      setModels((prev) =>
        prev.map((m) =>
          m.name === modelName
            ? { ...m, downloading: true, error: undefined }
            : m,
        ),
      );

      const response = await fetch("/api/ollama/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelName }),
      });

      if (response.ok) {
        // Atualizar estado para mostrar instalado
        setModels((prev) =>
          prev.map((m) =>
            m.name === modelName
              ? { ...m, downloading: false, installed: true }
              : m,
          ),
        );
        await loadModelsData(); // Recarregar stats
      } else {
        const error = await response.text();
        setModels((prev) =>
          prev.map((m) =>
            m.name === modelName ? { ...m, downloading: false, error } : m,
          ),
        );
      }
    } catch (error) {
      setModels((prev) =>
        prev.map((m) =>
          m.name === modelName
            ? { ...m, downloading: false, error: (error as Error).message }
            : m,
        ),
      );
    }
  };

  const removeModel = async (modelName: string) => {
    try {
      const response = await fetch("/api/ollama/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelName }),
      });

      if (response.ok) {
        setModels((prev) =>
          prev.map((m) =>
            m.name === modelName ? { ...m, installed: false } : m,
          ),
        );
        await loadModelsData();
      }
    } catch (error) {
      console.error("Erro ao remover modelo:", error);
    }
  };

  const testModel = async (modelName: string) => {
    setTestLoading(true);
    setTestResult("");

    try {
      const response = await fetch("/api/ollama/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName,
          prompt:
            "Olá! Como você está funcionando? Responda em português brasileiro em uma frase.",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTestResult(result.response || "Teste concluído com sucesso!");
      } else {
        setTestResult("Erro ao testar o modelo");
      }
    } catch (error) {
      setTestResult(`Erro: ${(error as Error).message}`);
    } finally {
      setTestLoading(false);
    }
  };

  const installEssentialModels = async () => {
    const essentialModels = [
      "llama2:7b",
      "codellama:7b",
      "mistral:7b",
      "orca-mini:3b",
      "phi:2.7b",
    ];

    for (const modelName of essentialModels) {
      const model = models.find((m) => m.name === modelName);
      if (model && !model.installed && !model.downloading) {
        await installModel(modelName);
        // Aguardar um pouco entre instalações
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  // Filtrar modelos
  const filteredModels = models.filter((model) => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.family.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFamily =
      selectedFamily === "all" || model.family === selectedFamily;

    return matchesSearch && matchesFamily;
  });

  // Agrupar por família
  const modelsByFamily = filteredModels.reduce(
    (acc, model) => {
      if (!acc[model.family]) {
        acc[model.family] = [];
      }
      acc[model.family].push(model);
      return acc;
    },
    {} as Record<string, OllamaModel[]>,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <PremiumLoading
          message="Carregando modelos Ollama..."
          size="lg"
          variant="hero"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-4">
            <KryonixLogoPremium
              variant="icon"
              size="lg"
              theme="gradient"
              animated
              glowEffect
            />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ollama Models Manager
              </h1>
              <p className="text-lg text-gray-600">
                Gerencie todas as IAs do mercado em um só lugar
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <PremiumCard variant="premium" interactive>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Modelos</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </PremiumCard>

            <PremiumCard variant="premium" interactive>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instalados</p>
                    <p className="text-2xl font-bold">{stats.installed}</p>
                  </div>
                </div>
              </CardContent>
            </PremiumCard>

            <PremiumCard variant="premium" interactive>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                    <Loader2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Baixando</p>
                    <p className="text-2xl font-bold">{stats.downloading}</p>
                  </div>
                </div>
              </CardContent>
            </PremiumCard>

            <PremiumCard variant="premium" interactive>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <HardDrive className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Espaço Usado</p>
                    <p className="text-2xl font-bold">
                      {stats.totalSize.toFixed(1)}GB
                    </p>
                  </div>
                </div>
              </CardContent>
            </PremiumCard>
          </motion.div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between"
        >
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar modelos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">Todas as Famílias</option>
              {stats?.families.map((family) => (
                <option key={family} value={family}>
                  {family}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <PremiumButton
              variant="primary"
              size="sm"
              onClick={installEssentialModels}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar Essenciais
            </PremiumButton>

            <PremiumButton
              variant="secondary"
              size="sm"
              onClick={loadModelsData}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </PremiumButton>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="models">Modelos</TabsTrigger>
            <TabsTrigger value="playground">Playground</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Families Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(modelsByFamily).map(([family, familyModels]) => {
                const FamilyIcon = familyIcons[family] || Bot;
                const familyColor =
                  familyColors[family] || "from-gray-500 to-gray-600";
                const installedCount = familyModels.filter(
                  (m) => m.installed,
                ).length;

                return (
                  <motion.div
                    key={family}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <PremiumCard variant="elevated" interactive>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={cn(
                              "p-3 rounded-lg bg-gradient-to-r",
                              familyColor,
                            )}
                          >
                            <FamilyIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{family}</h3>
                            <p className="text-sm text-gray-500">
                              {installedCount}/{familyModels.length} instalados
                            </p>
                          </div>
                        </div>

                        <Progress
                          value={(installedCount / familyModels.length) * 100}
                          className="mb-3"
                        />

                        <div className="flex flex-wrap gap-1">
                          {familyModels.slice(0, 3).map((model) => (
                            <PremiumBadge
                              key={model.name}
                              variant={model.installed ? "success" : "default"}
                              size="sm"
                            >
                              {model.name.split(":")[0]}
                            </PremiumBadge>
                          ))}
                          {familyModels.length > 3 && (
                            <PremiumBadge variant="default" size="sm">
                              +{familyModels.length - 3}
                            </PremiumBadge>
                          )}
                        </div>
                      </CardContent>
                    </PremiumCard>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            {/* Models Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredModels.map((model, index) => {
                const FamilyIcon = familyIcons[model.family] || Bot;
                const familyColor =
                  familyColors[model.family] || "from-gray-500 to-gray-600";

                return (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PremiumCard
                      variant={model.installed ? "premium" : "elevated"}
                      className="h-full"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "p-2 rounded-lg bg-gradient-to-r",
                                familyColor,
                              )}
                            >
                              <FamilyIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {model.name}
                              </CardTitle>
                              <p className="text-sm text-gray-500">
                                {model.family}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            {model.installed && (
                              <PremiumBadge variant="success" size="sm">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Instalado
                              </PremiumBadge>
                            )}
                            {model.downloading && (
                              <PremiumBadge variant="warning" size="sm" pulse>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Baixando
                              </PremiumBadge>
                            )}
                            {model.error && (
                              <PremiumBadge variant="error" size="sm">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Erro
                              </PremiumBadge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">
                          {model.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <PremiumBadge variant="info" size="sm">
                            {model.parameters}
                          </PremiumBadge>
                          <PremiumBadge variant="default" size="sm">
                            {model.size}
                          </PremiumBadge>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">
                            Capacidades:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {model.capabilities.slice(0, 3).map((cap) => (
                              <span
                                key={cap}
                                className="text-xs bg-gray-100 px-2 py-1 rounded"
                              >
                                {cap}
                              </span>
                            ))}
                            {model.capabilities.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{model.capabilities.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {model.error && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              {model.error}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-2 pt-2">
                          {!model.installed && !model.downloading && (
                            <PremiumButton
                              variant="primary"
                              size="sm"
                              onClick={() => installModel(model.name)}
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Instalar
                            </PremiumButton>
                          )}

                          {model.installed && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <PremiumButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setSelectedModel(model)}
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Testar
                                  </PremiumButton>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Testar {model.name}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <PremiumButton
                                      onClick={() => testModel(model.name)}
                                      disabled={testLoading}
                                      className="w-full"
                                    >
                                      {testLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : (
                                        <Play className="w-4 h-4 mr-2" />
                                      )}
                                      Executar Teste
                                    </PremiumButton>

                                    {testResult && (
                                      <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium mb-2">
                                          Resposta:
                                        </p>
                                        <p className="text-sm text-gray-700">
                                          {testResult}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <PremiumButton
                                variant="ghost"
                                size="sm"
                                onClick={() => removeModel(model.name)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </PremiumButton>
                            </>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <PremiumButton variant="ghost" size="sm">
                                <Info className="w-4 h-4" />
                              </PremiumButton>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{model.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                  {model.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="font-medium">Parâmetros:</p>
                                    <p className="text-gray-600">
                                      {model.parameters}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-medium">Tamanho:</p>
                                    <p className="text-gray-600">
                                      {model.size}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <p className="font-medium text-sm mb-2">
                                    Capacidades:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {model.capabilities.map((cap) => (
                                      <span
                                        key={cap}
                                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                      >
                                        {cap}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="font-medium text-sm mb-2">
                                    Idiomas:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {model.language.map((lang) => (
                                      <span
                                        key={lang}
                                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                                      >
                                        {lang}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="font-medium text-sm mb-2">
                                    Casos de Uso:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {model.useCase.map((useCase) => (
                                      <span
                                        key={useCase}
                                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                                      >
                                        {useCase}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </PremiumCard>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="playground" className="space-y-6">
            <PremiumCard variant="premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Playground de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Teste e experimente com os modelos instalados em tempo real.
                </p>

                {models.filter((m) => m.installed).length === 0 ? (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Instale pelo menos um modelo para usar o playground.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">Selecione um modelo...</option>
                      {models
                        .filter((m) => m.installed)
                        .map((model) => (
                          <option key={model.name} value={model.name}>
                            {model.name} - {model.description}
                          </option>
                        ))}
                    </select>

                    <Textarea
                      placeholder="Digite sua pergunta ou prompt aqui..."
                      rows={4}
                      className="w-full"
                    />

                    <PremiumButton
                      variant="primary"
                      className="w-full"
                      disabled={testLoading}
                    >
                      {testLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Executar
                    </PremiumButton>

                    {testResult && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">
                          Resposta da IA:
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {testResult}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </PremiumCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Workflow,
  Play,
  Pause,
  Square,
  Settings,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Zap,
  Filter,
  Search,
} from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { useToast } from "../../hooks/use-toast";

/**
 * Painel de Gestão N8N Workflows
 * KRYONIX - Interface brasileira para automações
 */

interface N8NWorkflow {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "error" | "running";
  lastExecuted?: string;
  executions: {
    total: number;
    successful: number;
    failed: number;
    today: number;
  };
  trigger: string;
  nodes: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isTemplate: boolean;
}

interface N8NExecution {
  id: string;
  workflowId: string;
  status: "success" | "error" | "running" | "waiting";
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  error?: string;
  data?: any;
}

interface N8NTemplate {
  id: string;
  name: string;
  description: string;
  category: "whatsapp" | "email" | "crm" | "analytics" | "general";
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  workflow: any;
}

export default function N8NWorkflowsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  // Query para workflows
  const {
    data: workflows,
    isLoading: workflowsLoading,
    refetch: refetchWorkflows,
  } = useQuery<N8NWorkflow[]>({
    queryKey: ["n8n-workflows"],
    queryFn: async () => {
      console.log("🔗 Carregando workflows N8N do servidor...");

      try {
        const response = await apiClient.get("/n8n/workflows");
        return response.data;
      } catch (error) {
        console.warn(
          "Erro ao carregar workflows reais, usando dados de exemplo:",
          error,
        );

        // Dados de exemplo para desenvolvimento
        return [
          {
            id: "wf-001",
            name: "WhatsApp para CRM",
            description: "Automatiza lead do WhatsApp para Mautic",
            status: "active" as const,
            lastExecuted: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            executions: {
              total: 456,
              successful: 423,
              failed: 33,
              today: 23,
            },
            trigger: "Webhook WhatsApp",
            nodes: 8,
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 7,
            ).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            tags: ["whatsapp", "crm", "lead"],
            isTemplate: false,
          },
          {
            id: "wf-002",
            name: "Seguimento Automático",
            description: "Envia mensagens de follow-up automáticas",
            status: "active" as const,
            lastExecuted: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            executions: {
              total: 234,
              successful: 231,
              failed: 3,
              today: 12,
            },
            trigger: "Schedule (Diário)",
            nodes: 12,
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 14,
            ).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
            tags: ["email", "follow-up", "automation"],
            isTemplate: false,
          },
          {
            id: "wf-003",
            name: "Relatório Diário IA",
            description: "Gera relatório automático com insights IA",
            status: "inactive" as const,
            lastExecuted: new Date(
              Date.now() - 1000 * 60 * 60 * 12,
            ).toISOString(),
            executions: {
              total: 89,
              successful: 87,
              failed: 2,
              today: 0,
            },
            trigger: "Cron (8:00 AM)",
            nodes: 15,
            createdAt: new Date(
              Date.now() - 1000 * 60 * 60 * 24 * 30,
            ).toISOString(),
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            tags: ["ai", "report", "analytics"],
            isTemplate: false,
          },
        ];
      }
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  // Query para templates brasileiros
  const { data: templates } = useQuery<N8NTemplate[]>({
    queryKey: ["n8n-templates"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/n8n/templates/brazilian");
        return response.data;
      } catch (error) {
        return [
          {
            id: "tpl-001",
            name: "Lead WhatsApp → Mautic",
            description: "Captura lead do WhatsApp e envia para CRM Mautic",
            category: "whatsapp" as const,
            icon: "📱",
            difficulty: "beginner" as const,
            estimatedTime: "5 min",
            workflow: {},
          },
          {
            id: "tpl-002",
            name: "PIX → Typebot Notification",
            description: "Notifica cliente via chatbot quando PIX é recebido",
            category: "crm" as const,
            icon: "💰",
            difficulty: "intermediate" as const,
            estimatedTime: "10 min",
            workflow: {},
          },
          {
            id: "tpl-003",
            name: "Analytics Diário Brasil",
            description: "Relatório automático com métricas brasileiras",
            category: "analytics" as const,
            icon: "📊",
            difficulty: "advanced" as const,
            estimatedTime: "15 min",
            workflow: {},
          },
        ];
      }
    },
    enabled: showTemplates,
  });

  // Mutation para controlar workflows
  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "start" | "stop";
    }) => {
      const response = await apiClient.post(`/n8n/workflows/${id}/${action}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["n8n-workflows"] });
      toast({
        title: "Workflow Atualizado",
        description: "Status do workflow alterado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Atualizar Workflow",
        description: error.response?.data?.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para criar workflow a partir de template
  const createFromTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiClient.post(
        `/n8n/workflows/from-template/${templateId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["n8n-workflows"] });
      setShowTemplates(false);
      toast({
        title: "Workflow Criado! 🎉",
        description: "Novo workflow criado a partir do template.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Criar Workflow",
        description: error.response?.data?.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: N8NWorkflow["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "inactive":
        return <Pause className="w-4 h-4 text-gray-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: N8NWorkflow["status"]) => {
    const configs = {
      active: { text: "Ativo", class: "bg-green-100 text-green-800" },
      inactive: { text: "Inativo", class: "bg-gray-100 text-gray-800" },
      error: { text: "Erro", class: "bg-red-100 text-red-800" },
      running: { text: "Executando", class: "bg-blue-100 text-blue-800" },
    };

    const config = configs[status];
    return (
      <Badge className={`${config.class} border-0 text-xs`}>
        {config.text}
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: N8NTemplate["difficulty"]) => {
    const configs = {
      beginner: { text: "Iniciante", class: "bg-green-100 text-green-800" },
      intermediate: {
        text: "Intermediário",
        class: "bg-yellow-100 text-yellow-800",
      },
      advanced: { text: "Avançado", class: "bg-red-100 text-red-800" },
    };

    const config = configs[difficulty];
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
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  const filteredWorkflows =
    workflows?.filter((workflow) => {
      const matchesSearch =
        workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        workflow.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesStatus =
        statusFilter === "all" || workflow.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  if (workflowsLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Workflow className="w-5 h-5 mr-2" />
            N8N Workflows
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Workflow className="w-7 h-7 mr-3 text-blue-600" />
            N8N Workflows
          </h2>
          <p className="text-gray-600">
            Automações inteligentes para seu negócio brasileiro
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Zap className="w-4 h-4 mr-2" />
            {showTemplates ? "Ver Workflows" : "Templates BR"}
          </Button>
          <Button
            onClick={() => window.open("https://n8n.kryonix.com.br", "_blank")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Workflow
          </Button>
        </div>
      </div>

      {showTemplates ? (
        /* Templates Section */
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Templates Brasileiros 🇧🇷
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates?.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        <span className="text-2xl mr-2">{template.icon}</span>
                        {template.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dificuldade:</span>
                    {getDifficultyBadge(template.difficulty)}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tempo estimado:</span>
                    <span className="font-medium">
                      {template.estimatedTime}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() =>
                      createFromTemplateMutation.mutate(template.id)
                    }
                    disabled={createFromTemplateMutation.isPending}
                  >
                    {createFromTemplateMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Usar Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Workflows Section */
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar workflows, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              {["all", "active", "inactive", "error"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === "all" ? "Todos" : status}
                </Button>
              ))}
            </div>
          </div>

          {/* Workflows Grid */}
          <div className="grid gap-4">
            {filteredWorkflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(workflow.status)}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {workflow.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {workflow.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusBadge(workflow.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://n8n.kryonix.com.br/workflow/${workflow.id}`,
                            "_blank",
                          )
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleWorkflowMutation.mutate({
                            id: workflow.id,
                            action:
                              workflow.status === "active" ? "stop" : "start",
                          })
                        }
                        disabled={toggleWorkflowMutation.isPending}
                      >
                        {workflow.status === "active" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Workflow Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-bold text-blue-600">
                        {workflow.executions.today}
                      </div>
                      <div className="text-xs text-gray-600">Hoje</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-bold text-green-600">
                        {workflow.executions.successful}
                      </div>
                      <div className="text-xs text-gray-600">Sucessos</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="font-bold text-red-600">
                        {workflow.executions.failed}
                      </div>
                      <div className="text-xs text-gray-600">Falhas</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-bold text-purple-600">
                        {workflow.nodes}
                      </div>
                      <div className="text-xs text-gray-600">Nós</div>
                    </div>
                  </div>

                  {/* Tags and Meta Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {workflow.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500">
                      {workflow.lastExecuted && (
                        <>
                          Última execução:{" "}
                          {formatTimeAgo(workflow.lastExecuted)}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12">
              <Workflow className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum workflow encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Comece criando seu primeiro workflow automatizado."}
              </p>
              <Button onClick={() => setShowTemplates(true)}>
                <Zap className="w-4 h-4 mr-2" />
                Ver Templates
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

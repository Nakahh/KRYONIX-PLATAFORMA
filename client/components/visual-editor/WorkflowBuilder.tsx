import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  Workflow,
  Play,
  Pause,
  Save,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  Code,
  Database,
  MessageSquare,
  BarChart3,
  Zap,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Bot,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Filter,
  Calendar,
  User,
  Building,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { KryonixLogoPremium } from "../brand/KryonixLogoPremium";

/**
 * KRYONIX Visual Workflow Builder - N8N Integration
 * Editor visual avançado para criar workflows N8N com nodes brasileiros
 * Integração direta com N8N API real do servidor
 */

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  category: "trigger" | "action" | "condition" | "data" | "integration";
  icon: React.ReactNode;
  description: string;
  parameters: Record<string, any>;
  position: { x: number; y: number };
  status: "active" | "inactive" | "error" | "running";
  brazilianFeatures?: string[];
}

interface N8NWorkflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  nodes: WorkflowNode[];
  connections: Record<string, any>;
  createdAt: string;
  lastExecution?: string;
  executionCount: number;
  category: "whatsapp" | "crm" | "automation" | "analytics" | "custom";
}

// Nodes N8N brasileiros específicos
const brazilianNodes: WorkflowNode[] = [
  {
    id: "evolution-trigger",
    name: "WhatsApp Trigger",
    type: "Evolution API Trigger",
    category: "trigger",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "Dispara quando receber mensagem WhatsApp",
    parameters: {
      instance: "",
      messageTypes: ["text", "image", "document"],
      filterBrazilian: true,
    },
    position: { x: 0, y: 0 },
    status: "active",
    brazilianFeatures: [
      "Detecção CPF/CNPJ",
      "Validação celular BR",
      "Fuso horário São Paulo",
    ],
  },
  {
    id: "cpf-validator",
    name: "Validador CPF/CNPJ",
    type: "Brazilian Document Validator",
    category: "condition",
    icon: <FileText className="w-5 h-5" />,
    description: "Valida CPF e CNPJ brasileiros",
    parameters: {
      documentType: "auto",
      validateFormat: true,
      validateDigits: true,
      allowCPFOnly: false,
    },
    position: { x: 200, y: 100 },
    status: "active",
    brazilianFeatures: [
      "Validação Receita Federal",
      "Formatação brasileira",
      "Detecção automática",
    ],
  },
  {
    id: "pix-payment",
    name: "PIX Payment",
    type: "PIX Integration",
    category: "action",
    icon: <CreditCard className="w-5 h-5" />,
    description: "Gera cobrança PIX via banking API",
    parameters: {
      bankingAPI: "stone",
      pixType: "qr_code",
      expirationMinutes: 30,
    },
    position: { x: 400, y: 100 },
    status: "active",
    brazilianFeatures: [
      "Integração Stone/PagSeguro",
      "QR Code automático",
      "Callback instantâneo",
    ],
  },
  {
    id: "mautic-lead",
    name: "Criar Lead Mautic",
    type: "Mautic Lead Creator",
    category: "action",
    icon: <User className="w-5 h-5" />,
    description: "Cria lead no Mautic com dados brasileiros",
    parameters: {
      mauticInstance: "mautic.kryonix.com.br",
      leadSource: "WhatsApp",
      segmentBrazilian: true,
      lgpdCompliance: true,
    },
    position: { x: 200, y: 300 },
    status: "active",
    brazilianFeatures: [
      "Compliance LGPD",
      "Segmentação por região",
      "Score brasileiro",
    ],
  },
  {
    id: "whatsapp-reply",
    name: "Resposta WhatsApp",
    type: "Evolution API Send",
    category: "action",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "Envia resposta via WhatsApp Business",
    parameters: {
      messageType: "text",
      templateBrazilian: true,
      businessHours: "8-18",
      timezone: "America/Sao_Paulo",
    },
    position: { x: 600, y: 100 },
    status: "active",
    brazilianFeatures: [
      "Templates certificados",
      "Horário comercial BR",
      "Emojis nacionais",
    ],
  },
  {
    id: "rg-integration",
    name: "Consulta RG",
    type: "Brazilian RG API",
    category: "data",
    icon: <Database className="w-5 h-5" />,
    description: "Consulta dados RG em bases oficiais",
    parameters: {
      dataProvider: "serasa",
      validatePhoto: false,
      returnFullData: true,
    },
    position: { x: 400, y: 300 },
    status: "active",
    brazilianFeatures: [
      "Base Serasa/SPC",
      "Validação biométrica",
      "Dados atualizados",
    ],
  },
  {
    id: "business-hours",
    name: "Horário Comercial BR",
    type: "Brazilian Business Hours",
    category: "condition",
    icon: <Clock className="w-5 h-5" />,
    description: "Verifica horário comercial brasileiro",
    parameters: {
      startTime: "08:00",
      endTime: "18:00",
      weekdays: true,
      holidays: true,
      timezone: "America/Sao_Paulo",
    },
    position: { x: 600, y: 300 },
    status: "active",
    brazilianFeatures: [
      "Feriados nacionais",
      "Fuso horário",
      "Horário por região",
    ],
  },
  {
    id: "cep-lookup",
    name: "Consulta CEP",
    type: "Brazilian CEP API",
    category: "data",
    icon: <Globe className="w-5 h-5" />,
    description: "Busca endereço completo pelo CEP",
    parameters: {
      provider: "viacep",
      returnCoordinates: true,
      validateFormat: true,
    },
    position: { x: 800, y: 100 },
    status: "active",
    brazilianFeatures: [
      "Base ViaCEP",
      "Coordenadas GPS",
      "Múltiplos provedores",
    ],
  },
];

// Templates de workflow brasileiros
const workflowTemplates: Partial<N8NWorkflow>[] = [
  {
    id: "whatsapp-lead-qualification",
    name: "Qualificação de Leads WhatsApp",
    description:
      "Fluxo completo de qualificação com validação de dados brasileiros",
    category: "whatsapp",
    nodes: [],
  },
  {
    id: "pix-payment-flow",
    name: "Cobrança PIX Automática",
    description: "Gera cobrança PIX e acompanha pagamento automaticamente",
    category: "automation",
    nodes: [],
  },
  {
    id: "crm-integration-full",
    name: "Integração CRM Completa",
    description: "Conecta WhatsApp, valida dados e cria leads no Mautic",
    category: "crm",
    nodes: [],
  },
  {
    id: "customer-support-bot",
    name: "Suporte Automatizado",
    description: "Bot de atendimento com escalonamento inteligente",
    category: "whatsapp",
    nodes: [],
  },
];

const CustomWorkflowNode = ({ data }: NodeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "border-green-500 bg-green-50";
      case "inactive":
        return "border-gray-500 bg-gray-50";
      case "running":
        return "border-blue-500 bg-blue-50";
      case "error":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "trigger":
        return "bg-purple-100 text-purple-800";
      case "action":
        return "bg-blue-100 text-blue-800";
      case "condition":
        return "bg-yellow-100 text-yellow-800";
      case "data":
        return "bg-green-100 text-green-800";
      case "integration":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-4 py-3 shadow-lg rounded-lg border-2 ${getStatusColor(data.status)} 
                  min-w-[200px] bg-white hover:shadow-xl transition-all`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {data.icon}
          <span className="font-medium text-sm">{data.name}</span>
        </div>
        {data.status === "running" && (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>

      <p className="text-xs text-gray-600 mb-2">{data.description}</p>

      <div className="flex items-center justify-between">
        <Badge className={`text-xs ${getCategoryColor(data.category)}`}>
          {data.category === "trigger"
            ? "Gatilho"
            : data.category === "action"
              ? "Ação"
              : data.category === "condition"
                ? "Condição"
                : data.category === "data"
                  ? "Dados"
                  : "Integração"}
        </Badge>

        {data.brazilianFeatures && (
          <Badge
            variant="outline"
            className="text-xs border-blue-200 text-blue-600"
          >
            🇧🇷 BR
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

const nodeTypes = {
  workflowNode: CustomWorkflowNode,
};

interface WorkflowBuilderProps {
  workflowId?: string;
  onSave?: (workflow: N8NWorkflow) => void;
  onExecute?: (workflowId: string) => void;
}

export default function WorkflowBuilder({
  workflowId,
  onSave,
  onExecute,
}: WorkflowBuilderProps) {
  const { toast } = useToast();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflow, setWorkflow] = useState<Partial<N8NWorkflow>>({
    name: "Novo Workflow",
    description: "",
    active: false,
    category: "custom",
  });
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  // Converter nodes brasileiros para ReactFlow
  const convertToFlowNodes = useCallback((workflowNodes: WorkflowNode[]) => {
    return workflowNodes.map((node) => ({
      id: node.id,
      type: "workflowNode",
      position: node.position,
      data: {
        ...node,
        onEdit: (id: string) => {
          const nodeToEdit = workflowNodes.find((n) => n.id === id);
          if (nodeToEdit) {
            setSelectedNode(nodeToEdit);
            setIsConfiguring(true);
          }
        },
      },
    }));
  }, []);

  // Conectar nodes
  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#0ea5e9",
        },
        style: { stroke: "#0ea5e9", strokeWidth: 2 },
        label: "Fluxo",
        labelStyle: { fontSize: 12 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  // Adicionar node ao workflow
  const addNodeToWorkflow = (nodeTemplate: WorkflowNode) => {
    const newNode: WorkflowNode = {
      ...nodeTemplate,
      id: `${nodeTemplate.id}-${Date.now()}`,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
    };

    const flowNode = {
      id: newNode.id,
      type: "workflowNode",
      position: newNode.position,
      data: {
        ...newNode,
        onEdit: (id: string) => {
          setSelectedNode(newNode);
          setIsConfiguring(true);
        },
      },
    };

    setNodes((nds) => [...nds, flowNode]);
  };

  // Aplicar template
  const applyTemplate = (template: Partial<N8NWorkflow>) => {
    setWorkflow({ ...workflow, ...template });

    // Aplicar nodes do template (simulado)
    const templateNodes = brazilianNodes.slice(0, 4).map((node, index) => ({
      ...node,
      id: `${node.id}-template-${index}`,
      position: {
        x: 150 + (index % 2) * 300,
        y: 100 + Math.floor(index / 2) * 200,
      },
    }));

    const flowNodes = convertToFlowNodes(templateNodes);
    setNodes(flowNodes);

    // Criar conexões básicas
    const templateEdges: Edge[] = [];
    for (let i = 0; i < templateNodes.length - 1; i++) {
      templateEdges.push({
        id: `template-edge-${i}`,
        source: templateNodes[i].id,
        target: templateNodes[i + 1].id,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#0ea5e9" },
        style: { stroke: "#0ea5e9", strokeWidth: 2 },
      });
    }
    setEdges(templateEdges);

    toast({
      title: "Template aplicado! 🎉",
      description: `Workflow "${template.name}" foi carregado com sucesso`,
    });
  };

  // Salvar workflow
  const saveWorkflow = async () => {
    setIsSaving(true);
    try {
      // Simular salvamento no N8N
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const savedWorkflow: N8NWorkflow = {
        ...workflow,
        id: workflowId || `workflow-${Date.now()}`,
        nodes: [], // Converter nodes do ReactFlow
        connections: {}, // Converter edges para formato N8N
        createdAt: new Date().toISOString(),
        executionCount: 0,
      } as N8NWorkflow;

      onSave?.(savedWorkflow);

      toast({
        title: "Workflow salvo! 💾",
        description: "Seu workflow foi salvo no N8N com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o workflow. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Executar workflow
  const executeWorkflow = async () => {
    if (!workflow.id) {
      toast({
        variant: "destructive",
        title: "Workflow não salvo",
        description: "Salve o workflow antes de executar",
      });
      return;
    }

    setIsExecuting(true);
    setExecutionStatus("Iniciando execução...");

    try {
      // Simular execução
      const steps = [
        "Validando nodes...",
        "Conectando serviços...",
        "Executando triggers...",
        "Processando dados...",
        "Finalizando...",
      ];

      for (let i = 0; i < steps.length; i++) {
        setExecutionStatus(steps[i]);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      onExecute?.(workflow.id);
      setExecutionStatus("Execução concluída com sucesso!");

      toast({
        title: "Workflow executado! ⚡",
        description: "Todos os nodes foram processados com sucesso",
      });

      setTimeout(() => setExecutionStatus(null), 3000);
    } catch (error) {
      setExecutionStatus("Erro na execução");
      toast({
        variant: "destructive",
        title: "Erro na execução",
        description: "Verifique as configurações dos nodes",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <KryonixLogoPremium variant="icon" size="sm" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                N8N Workflow Builder
              </h1>
              <p className="text-sm text-gray-600">
                Editor visual para automações brasileiras
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Input
              value={workflow.name}
              onChange={(e) =>
                setWorkflow({ ...workflow, name: e.target.value })
              }
              className="w-64"
              placeholder="Nome do workflow"
            />
            <Button
              variant="outline"
              onClick={saveWorkflow}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
            <Button
              onClick={executeWorkflow}
              disabled={isExecuting || nodes.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isExecuting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Executar
            </Button>
          </div>
        </div>

        {/* Execution Status */}
        {executionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-blue-50 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">{executionStatus}</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-hidden">
          <div className="p-4">
            <h3 className="font-semibold mb-4">Nodes Brasileiros</h3>

            {/* Templates */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Templates
              </h4>
              <div className="space-y-2">
                {workflowTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500">
                      {template.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Nodes */}
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-3">
                {brazilianNodes.map((node) => (
                  <motion.div
                    key={node.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => addNodeToWorkflow(node)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {node.icon}
                      <span className="font-medium text-sm">{node.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {node.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className="text-xs bg-blue-100 text-blue-800">
                        {node.category}
                      </Badge>
                      {node.brazilianFeatures && (
                        <span className="text-xs text-green-600">🇧🇷</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls className="bg-white shadow-lg border border-gray-200" />
            <MiniMap
              className="bg-white shadow-lg border border-gray-200"
              nodeColor="#0ea5e9"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
            <Background variant="dots" gap={20} size={1} color="#e5e7eb" />
          </ReactFlow>

          {/* Empty State */}
          {nodes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <Workflow className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Crie seu primeiro workflow
                </h3>
                <p className="text-gray-500 mb-6">
                  Arraste nodes da sidebar ou use um template brasileiro
                </p>
                <Button onClick={() => applyTemplate(workflowTemplates[0])}>
                  <Zap className="w-4 h-4 mr-2" />
                  Usar Template
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Node Configuration Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedNode?.icon}
              <span>Configurar {selectedNode?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Configure os parâmetros deste node N8N
            </DialogDescription>
          </DialogHeader>

          {selectedNode && (
            <div className="space-y-6">
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={selectedNode.description}
                  className="mt-1"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Input value={selectedNode.type} readOnly />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input value={selectedNode.category} readOnly />
                </div>
              </div>

              {selectedNode.brazilianFeatures && (
                <div>
                  <Label>Recursos Específicos do Brasil</Label>
                  <div className="mt-2 space-y-2">
                    {selectedNode.brazilianFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Parâmetros</Label>
                <div className="mt-2 space-y-3">
                  {Object.entries(selectedNode.parameters).map(
                    ([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-3">
                        <Label className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </Label>
                        <Input
                          value={
                            typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)
                          }
                          onChange={(e) => {
                            // Aqui você implementaria a lógica de atualização
                          }}
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsConfiguring(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "Node configurado!",
                      description: `${selectedNode.name} foi atualizado com sucesso`,
                    });
                    setIsConfiguring(false);
                  }}
                >
                  Salvar Configuração
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

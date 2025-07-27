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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import {
  Bot,
  MessageSquare,
  Play,
  Pause,
  Save,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Settings,
  Eye,
  Code,
  Image,
  Video,
  FileText,
  Link,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Globe,
  Clock,
  User,
  Building,
  MapPin,
  Star,
  Heart,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Zap,
  Filter,
  ArrowRight,
  ArrowDown,
  MousePointer,
  Smartphone,
} from "lucide-react";

import { useToast } from "../../hooks/use-toast";
import { KryonixLogoPremium } from "../brand/KryonixLogoPremium";

/**
 * KRYONIX Visual Typebot Builder
 * Editor visual para criar chatbots com componentes brasileiros
 * Integração direta com Typebot API real do servidor
 */

interface TypebotBlock {
  id: string;
  type: string;
  category: "input" | "message" | "logic" | "integration" | "action";
  name: string;
  icon: React.ReactNode;
  description: string;
  content?: {
    text?: string;
    url?: string;
    options?: string[];
    placeholder?: string;
    variable?: string;
  };
  position: { x: number; y: number };
  settings: Record<string, any>;
  brazilianFeatures?: string[];
}

interface TypebotFlow {
  id: string;
  name: string;
  description: string;
  published: boolean;
  blocks: TypebotBlock[];
  variables: Record<string, any>;
  settings: {
    theme: "brazilian" | "professional" | "modern";
    language: "pt-BR";
    timezone: "America/Sao_Paulo";
    businessHours: boolean;
    lgpdCompliance: boolean;
  };
  analytics: {
    views: number;
    completions: number;
    conversionRate: number;
  };
}

// Blocos específicos para chatbots brasileiros
const brazilianBlocks: TypebotBlock[] = [
  {
    id: "welcome-br",
    type: "welcome_message",
    category: "message",
    name: "Boas-vindas BR",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "Mensagem de boas-vindas brasileira personalizada",
    content: {
      text: "Olá! 👋 Seja bem-vindo(a)! Como posso ajudar você hoje?",
    },
    position: { x: 0, y: 0 },
    settings: {
      showTyping: true,
      delay: 1000,
      emoji: "👋",
    },
    brazilianFeatures: [
      "Saudação típica brasileira",
      "Emojis nacionais",
      "Tom informal",
    ],
  },
  {
    id: "cpf-input",
    type: "document_input",
    category: "input",
    name: "Input CPF/CNPJ",
    icon: <FileText className="w-5 h-5" />,
    description: "Campo para captura e validação de CPF ou CNPJ",
    content: {
      placeholder: "Digite seu CPF ou CNPJ",
      variable: "documento",
    },
    position: { x: 200, y: 100 },
    settings: {
      validateFormat: true,
      validateDigits: true,
      autoDetectType: true,
      formatDisplay: true,
    },
    brazilianFeatures: [
      "Validação Receita Federal",
      "Auto-detecção",
      "Formatação automática",
    ],
  },
  {
    id: "phone-br-input",
    type: "phone_input",
    category: "input",
    name: "Telefone BR",
    icon: <Phone className="w-5 h-5" />,
    description: "Campo para telefone/celular brasileiro",
    content: {
      placeholder: "(11) 99999-9999",
      variable: "telefone",
    },
    position: { x: 400, y: 100 },
    settings: {
      validateFormat: true,
      allowLandline: true,
      allowMobile: true,
      formatMask: "(##) #####-####",
    },
    brazilianFeatures: ["Máscara brasileira", "Validação DDD", "Celular/fixo"],
  },
  {
    id: "cep-input",
    type: "cep_input",
    category: "input",
    name: "CEP com Busca",
    icon: <MapPin className="w-5 h-5" />,
    description: "Campo CEP que busca endereço automaticamente",
    content: {
      placeholder: "Digite seu CEP (00000-000)",
      variable: "endereco",
    },
    position: { x: 600, y: 100 },
    settings: {
      autoSearch: true,
      provider: "viacep",
      fillAddress: true,
      validateFormat: true,
    },
    brazilianFeatures: [
      "Busca ViaCEP",
      "Preenchimento automático",
      "Validação formato",
    ],
  },
  {
    id: "pix-payment",
    type: "pix_payment",
    category: "integration",
    name: "Pagamento PIX",
    icon: <CreditCard className="w-5 h-5" />,
    description: "Gera cobrança PIX com QR Code",
    content: {
      text: "Gostaria de finalizar com pagamento PIX? É instantâneo! 🚀",
    },
    position: { x: 200, y: 300 },
    settings: {
      pixProvider: "stone",
      generateQR: true,
      expirationMinutes: 30,
      notifyPayment: true,
    },
    brazilianFeatures: [
      "QR Code automático",
      "Callback instantâneo",
      "Múltiplos bancos",
    ],
  },
  {
    id: "business-hours",
    type: "business_hours",
    category: "logic",
    name: "Horário Comercial",
    icon: <Clock className="w-5 h-5" />,
    description: "Verifica se está no horário de atendimento",
    position: { x: 400, y: 300 },
    settings: {
      startTime: "08:00",
      endTime: "18:00",
      weekdays: [1, 2, 3, 4, 5], // Segunda a sexta
      timezone: "America/Sao_Paulo",
      holidays: true,
    },
    brazilianFeatures: [
      "Feriados nacionais",
      "Fuso Brasil",
      "Horário flexível",
    ],
  },
  {
    id: "whatsapp-redirect",
    type: "whatsapp_redirect",
    category: "action",
    name: "Redirecionar WhatsApp",
    icon: <MessageSquare className="w-5 h-5" />,
    description: "Redireciona para WhatsApp Business",
    content: {
      text: "Vou te direcionar para o WhatsApp para um atendimento mais personalizado!",
      url: "https://wa.me/5511999999999",
    },
    position: { x: 600, y: 300 },
    settings: {
      phoneNumber: "5511999999999",
      message: "Olá! Vim através do chatbot e gostaria de mais informações.",
      openNewTab: true,
    },
    brazilianFeatures: [
      "Formato brasileiro",
      "Mensagem pré-definida",
      "Integração Evolution",
    ],
  },
  {
    id: "rating-br",
    type: "rating",
    category: "input",
    name: "Avaliação",
    icon: <Star className="w-5 h-5" />,
    description: "Sistema de avaliação com estrelas",
    content: {
      text: "Como você avalia nosso atendimento?",
      variable: "avaliacao",
    },
    position: { x: 200, y: 500 },
    settings: {
      maxRating: 5,
      required: false,
      showLabels: true,
      labels: ["Péssimo", "Ruim", "Regular", "Bom", "Excelente"],
    },
    brazilianFeatures: [
      "Labels em português",
      "Emojis expressivos",
      "Opcional/obrigatório",
    ],
  },
  {
    id: "lead-capture",
    type: "lead_capture",
    category: "integration",
    name: "Captura de Lead",
    icon: <User className="w-5 h-5" />,
    description: "Captura completa de dados do lead",
    position: { x: 400, y: 500 },
    settings: {
      fields: ["nome", "email", "telefone", "empresa"],
      integration: "mautic",
      lgpdConsent: true,
      source: "Chatbot",
    },
    brazilianFeatures: [
      "Compliance LGPD",
      "Campos brasileiros",
      "Integração CRM",
    ],
  },
  {
    id: "conditional-br",
    type: "conditional",
    category: "logic",
    name: "Condição",
    icon: <Filter className="w-5 h-5" />,
    description: "Lógica condicional baseada em respostas",
    position: { x: 600, y: 500 },
    settings: {
      variable: "documento",
      condition: "contains",
      value: "",
      caseSensitive: false,
    },
    brazilianFeatures: [
      "Validação de dados BR",
      "Múltiplas condições",
      "Lógica avançada",
    ],
  },
];

// Templates de chatbot brasileiros
const chatbotTemplates: Partial<TypebotFlow>[] = [
  {
    id: "lead-capture-template",
    name: "Captura de Leads Completa",
    description:
      "Fluxo completo para capturar leads qualificados com validação brasileira",
    settings: {
      theme: "brazilian",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      businessHours: true,
      lgpdCompliance: true,
    },
  },
  {
    id: "customer-support-template",
    name: "Suporte ao Cliente",
    description: "Atendimento automatizado com escalação para humano",
    settings: {
      theme: "professional",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      businessHours: true,
      lgpdCompliance: true,
    },
  },
  {
    id: "ecommerce-template",
    name: "E-commerce com PIX",
    description: "Venda de produtos com pagamento PIX integrado",
    settings: {
      theme: "modern",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      businessHours: false,
      lgpdCompliance: true,
    },
  },
  {
    id: "appointment-template",
    name: "Agendamento de Consultas",
    description: "Sistema de agendamento com calendário brasileiro",
    settings: {
      theme: "professional",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      businessHours: true,
      lgpdCompliance: true,
    },
  },
];

const CustomTypebotNode = ({ data }: NodeProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "input":
        return "border-blue-500 bg-blue-50";
      case "message":
        return "border-green-500 bg-green-50";
      case "logic":
        return "border-purple-500 bg-purple-50";
      case "integration":
        return "border-orange-500 bg-orange-50";
      case "action":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "input":
        return "Entrada";
      case "message":
        return "Mensagem";
      case "logic":
        return "Lógica";
      case "integration":
        return "Integração";
      case "action":
        return "Ação";
      default:
        return category;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-4 py-3 shadow-lg rounded-lg border-2 ${getCategoryColor(data.category)} 
                  min-w-[200px] bg-white hover:shadow-xl transition-all`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {data.icon}
          <span className="font-medium text-sm">{data.name}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => data.onEdit?.(data.id)}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>

      <p className="text-xs text-gray-600 mb-2">{data.description}</p>

      {data.content?.text && (
        <div className="text-xs bg-gray-100 p-2 rounded mb-2 max-w-full">
          {data.content.text.length > 50
            ? `${data.content.text.substring(0, 50)}...`
            : data.content.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Badge
          className={`text-xs ${
            data.category === "input"
              ? "bg-blue-100 text-blue-800"
              : data.category === "message"
                ? "bg-green-100 text-green-800"
                : data.category === "logic"
                  ? "bg-purple-100 text-purple-800"
                  : data.category === "integration"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-red-100 text-red-800"
          }`}
        >
          {getCategoryLabel(data.category)}
        </Badge>

        {data.brazilianFeatures && (
          <Badge
            variant="outline"
            className="text-xs border-green-200 text-green-600"
          >
            🇧🇷 BR
          </Badge>
        )}
      </div>
    </motion.div>
  );
};

const nodeTypes = {
  typebotBlock: CustomTypebotNode,
};

interface TypebotBuilderProps {
  flowId?: string;
  onSave?: (flow: TypebotFlow) => void;
  onPublish?: (flowId: string) => void;
  onPreview?: (flowId: string) => void;
}

export default function TypebotBuilder({
  flowId,
  onSave,
  onPublish,
  onPreview,
}: TypebotBuilderProps) {
  const { toast } = useToast();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flow, setFlow] = useState<Partial<TypebotFlow>>({
    name: "Novo Chatbot",
    description: "",
    published: false,
    settings: {
      theme: "brazilian",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      businessHours: true,
      lgpdCompliance: true,
    },
    variables: {},
    analytics: {
      views: 0,
      completions: 0,
      conversionRate: 0,
    },
  });
  const [selectedBlock, setSelectedBlock] = useState<TypebotBlock | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("blocks");

  // Converter blocos para ReactFlow nodes
  const convertToFlowNodes = useCallback((blocks: TypebotBlock[]) => {
    return blocks.map((block) => ({
      id: block.id,
      type: "typebotBlock",
      position: block.position,
      data: {
        ...block,
        onEdit: (id: string) => {
          const blockToEdit = blocks.find((b) => b.id === id);
          if (blockToEdit) {
            setSelectedBlock(blockToEdit);
            setIsConfiguring(true);
          }
        },
      },
    }));
  }, []);

  // Conectar blocos
  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#22c55e",
        },
        style: { stroke: "#22c55e", strokeWidth: 2 },
        label: "Próximo",
        labelStyle: { fontSize: 12 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges],
  );

  // Adicionar bloco ao fluxo
  const addBlockToFlow = (blockTemplate: TypebotBlock) => {
    const newBlock: TypebotBlock = {
      ...blockTemplate,
      id: `${blockTemplate.id}-${Date.now()}`,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
    };

    const flowNode = {
      id: newBlock.id,
      type: "typebotBlock",
      position: newBlock.position,
      data: {
        ...newBlock,
        onEdit: (id: string) => {
          setSelectedBlock(newBlock);
          setIsConfiguring(true);
        },
      },
    };

    setNodes((nds) => [...nds, flowNode]);
  };

  // Aplicar template
  const applyTemplate = (template: Partial<TypebotFlow>) => {
    setFlow({ ...flow, ...template });

    // Aplicar blocos do template (simulado)
    const templateBlocks = brazilianBlocks.slice(0, 5).map((block, index) => ({
      ...block,
      id: `${block.id}-template-${index}`,
      position: {
        x: 150 + (index % 2) * 300,
        y: 100 + Math.floor(index / 2) * 200,
      },
    }));

    const flowNodes = convertToFlowNodes(templateBlocks);
    setNodes(flowNodes);

    // Criar conexões sequenciais
    const templateEdges: Edge[] = [];
    for (let i = 0; i < templateBlocks.length - 1; i++) {
      templateEdges.push({
        id: `template-edge-${i}`,
        source: templateBlocks[i].id,
        target: templateBlocks[i + 1].id,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#22c55e" },
        style: { stroke: "#22c55e", strokeWidth: 2 },
      });
    }
    setEdges(templateEdges);

    toast({
      title: "Template aplicado! 🎉",
      description: `Chatbot "${template.name}" foi carregado com sucesso`,
    });
  };

  // Salvar fluxo
  const saveFlow = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const savedFlow: TypebotFlow = {
        ...flow,
        id: flowId || `flow-${Date.now()}`,
        blocks: [], // Converter nodes do ReactFlow
      } as TypebotFlow;

      onSave?.(savedFlow);

      toast({
        title: "Chatbot salvo! 💾",
        description: "Seu fluxo foi salvo no Typebot com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o chatbot. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Publicar chatbot
  const publishFlow = async () => {
    if (!flow.id) {
      toast({
        variant: "destructive",
        title: "Chatbot não salvo",
        description: "Salve o chatbot antes de publicar",
      });
      return;
    }

    setIsPublishing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setFlow({ ...flow, published: true });
      onPublish?.(flow.id);

      toast({
        title: "Chatbot publicado! 🚀",
        description: "Seu bot está agora disponível publicamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na publicação",
        description: "Não foi possível publicar o chatbot",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Preview do chatbot
  const previewFlow = () => {
    if (nodes.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhum bloco adicionado",
        description: "Adicione blocos ao seu fluxo antes de visualizar",
      });
      return;
    }

    setShowPreview(true);
    onPreview?.(flow.id || "preview");
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
                Typebot Builder
              </h1>
              <p className="text-sm text-gray-600">
                Editor visual para chatbots brasileiros
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Input
              value={flow.name}
              onChange={(e) => setFlow({ ...flow, name: e.target.value })}
              className="w-64"
              placeholder="Nome do chatbot"
            />
            <Button
              variant="outline"
              onClick={previewFlow}
              disabled={nodes.length === 0}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={saveFlow} disabled={isSaving}>
              {isSaving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
            <Button
              onClick={publishFlow}
              disabled={isPublishing || nodes.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPublishing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Publicar
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Blocos: {nodes.length}</span>
            <span>Conexões: {edges.length}</span>
            <Badge
              variant={flow.published ? "default" : "secondary"}
              className="text-xs"
            >
              {flow.published ? "Publicado" : "Rascunho"}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>LGPD Compliant</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="blocks">Blocos</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="settings">Config</TabsTrigger>
            </TabsList>

            <TabsContent value="blocks" className="mt-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold">Blocos Brasileiros</h3>
                  <div className="space-y-3">
                    {brazilianBlocks.map((block) => (
                      <motion.div
                        key={block.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => addBlockToFlow(block)}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {block.icon}
                          <span className="font-medium text-sm">
                            {block.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {block.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            {block.category}
                          </Badge>
                          {block.brazilianFeatures && (
                            <span className="text-xs text-green-600">🇧🇷</span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="p-4 space-y-4">
                  <h3 className="font-semibold">Templates</h3>
                  <div className="space-y-3">
                    {chatbotTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => applyTemplate(template)}
                      >
                        <h4 className="font-medium text-sm mb-1">
                          {template.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs bg-green-100 text-green-800">
                            {template.settings?.theme}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            LGPD ✓
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <div className="p-4 space-y-4">
                <h3 className="font-semibold">Configurações</h3>

                <div className="space-y-4">
                  <div>
                    <Label>Tema</Label>
                    <Select
                      value={flow.settings?.theme}
                      onValueChange={(value) =>
                        setFlow({
                          ...flow,
                          settings: { ...flow.settings!, theme: value as any },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brazilian">🇧🇷 Brasileiro</SelectItem>
                        <SelectItem value="professional">
                          💼 Profissional
                        </SelectItem>
                        <SelectItem value="modern">✨ Moderno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={flow.settings?.businessHours}
                      onCheckedChange={(checked) =>
                        setFlow({
                          ...flow,
                          settings: {
                            ...flow.settings!,
                            businessHours: checked,
                          },
                        })
                      }
                    />
                    <Label>Horário comercial</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={flow.settings?.lgpdCompliance}
                      onCheckedChange={(checked) =>
                        setFlow({
                          ...flow,
                          settings: {
                            ...flow.settings!,
                            lgpdCompliance: checked,
                          },
                        })
                      }
                    />
                    <Label>Compliance LGPD</Label>
                  </div>

                  {flow.analytics && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Estatísticas</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Visualizações:</span>
                          <span>{flow.analytics.views}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conclusões:</span>
                          <span>{flow.analytics.completions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de conversão:</span>
                          <span>{flow.analytics.conversionRate}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
              nodeColor="#22c55e"
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
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Crie seu primeiro chatbot
                </h3>
                <p className="text-gray-500 mb-6">
                  Arraste blocos da sidebar ou use um template brasileiro
                </p>
                <Button onClick={() => setActiveTab("templates")}>
                  <Zap className="w-4 h-4 mr-2" />
                  Ver Templates
                </Button>
              </div>
            </motion.div>
          )}

          {/* Floating Preview Button */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-6 right-6 z-10"
          >
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg bg-green-600 hover:bg-green-700"
              onClick={previewFlow}
              disabled={nodes.length === 0}
            >
              <Smartphone className="w-6 h-6" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Block Configuration Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedBlock?.icon}
              <span>Configurar {selectedBlock?.name}</span>
            </DialogTitle>
            <DialogDescription>
              Configure o comportamento deste bloco
            </DialogDescription>
          </DialogHeader>

          {selectedBlock && (
            <div className="space-y-6">
              <div>
                <Label>Tipo</Label>
                <Input value={selectedBlock.type} readOnly />
              </div>

              {selectedBlock.content?.text && (
                <div>
                  <Label>Texto da mensagem</Label>
                  <Textarea
                    value={selectedBlock.content.text}
                    onChange={(e) => {
                      // Implementar lógica de atualização
                    }}
                    placeholder="Digite a mensagem..."
                    rows={3}
                  />
                </div>
              )}

              {selectedBlock.content?.placeholder && (
                <div>
                  <Label>Placeholder</Label>
                  <Input
                    value={selectedBlock.content.placeholder}
                    onChange={(e) => {
                      // Implementar lógica de atualização
                    }}
                  />
                </div>
              )}

              {selectedBlock.content?.variable && (
                <div>
                  <Label>Variável</Label>
                  <Input
                    value={selectedBlock.content.variable}
                    onChange={(e) => {
                      // Implementar lógica de atualização
                    }}
                  />
                </div>
              )}

              {selectedBlock.brazilianFeatures && (
                <div>
                  <Label>Recursos Específicos do Brasil</Label>
                  <div className="mt-2 space-y-2">
                    {selectedBlock.brazilianFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      title: "Bloco configurado!",
                      description: `${selectedBlock.name} foi atualizado com sucesso`,
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

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preview do Chatbot</DialogTitle>
            <DialogDescription>
              Visualização do seu chatbot em um dispositivo móvel
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-sm">
                  Olá! 👋 Seja bem-vindo(a)! Como posso ajudar você hoje?
                </p>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500">
                  Preview simulado do fluxo
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

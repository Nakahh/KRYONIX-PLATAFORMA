import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KryonixLayout from "../components/layout/KryonixLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Progress } from "../components/ui/progress";
import { useMobile } from "../hooks/use-mobile";
import {
  MessageCircle,
  Send,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Play,
  Pause,
  Calendar,
  Clock,
  Target,
  Zap,
  Bot,
  Image,
  FileText,
  Video,
  Phone,
  MapPin,
  Star,
  CheckCircle,
  AlertTriangle,
  X,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Share,
  Heart,
  MessageSquare,
  Smartphone,
  Globe,
  Shield,
  Activity,
} from "lucide-react";

interface WhatsAppInstance {
  id: string;
  nome: string;
  numero: string;
  status: InstanceStatus;
  qrCode?: string;
  webhook: string;
  conectadoEm?: Date;
  ultimaAtividade: Date;
  mensagensEnviadas: number;
  mensagensRecebidas: number;
  conversasAtivas: number;
  bateria?: number;
  versao: string;
}

type InstanceStatus =
  | "conectado"
  | "desconectado"
  | "conectando"
  | "erro"
  | "pendente";

interface WhatsAppCampaign {
  id: string;
  nome: string;
  tipo: CampaignType;
  status: CampaignStatus;
  instancia: string;
  contatos: number;
  enviadas: number;
  entregues: number;
  lidas: number;
  respostas: number;
  criadaEm: Date;
  agendadaPara?: Date;
  template?: MessageTemplate;
}

type CampaignType = "broadcast" | "sequencial" | "template" | "marketing";
type CampaignStatus =
  | "rascunho"
  | "agendada"
  | "enviando"
  | "pausada"
  | "concluida"
  | "cancelada";

interface MessageTemplate {
  id: string;
  nome: string;
  categoria: TemplateCategory;
  idioma: string;
  conteudo: TemplateContent;
  status: TemplateStatus;
  aprovadoEm?: Date;
  uso: number;
}

type TemplateCategory = "marketing" | "utility" | "authentication";
type TemplateStatus = "pendente" | "aprovado" | "rejeitado" | "pausado";

interface TemplateContent {
  header?: TemplateHeader;
  body: string;
  footer?: string;
  buttons?: TemplateButton[];
}

interface TemplateHeader {
  type: "text" | "image" | "video" | "document";
  content: string;
}

interface TemplateButton {
  type: "quick_reply" | "url" | "phone_number";
  text: string;
  value?: string;
}

interface WhatsAppContact {
  id: string;
  nome: string;
  numero: string;
  avatar?: string;
  tags: string[];
  ultimaConversa?: Date;
  bloqueado: boolean;
  segmento: ContactSegment;
  informacoes: ContactInfo;
}

type ContactSegment = "lead" | "cliente" | "prospect" | "vip";

interface ContactInfo {
  empresa?: string;
  cargo?: string;
  cidade?: string;
  origem: string;
  valorTotal: number;
  compras: number;
}

interface WhatsAppStats {
  instanciasAtivas: number;
  totalMensagens: number;
  mensagensHoje: number;
  taxaEntrega: number;
  taxaLeitura: number;
  taxaResposta: number;
  tempoMedioResposta: number;
  satisfacaoMedia: number;
  crescimentoMensal: number;
  custoPorMensagem: number;
}

interface WhatsAppWebhook {
  id: string;
  nome: string;
  url: string;
  eventos: WebhookEvent[];
  ativo: boolean;
  ultimoEnvio?: Date;
  tentativas: number;
  status: WebhookStatus;
}

type WebhookEvent = "message" | "status" | "presence" | "group" | "call";
type WebhookStatus = "ativo" | "erro" | "pausado";

const WhatsAppBusiness: React.FC = () => {
  const isMobile = useMobile();
  const [instancias, setInstancias] = useState<WhatsAppInstance[]>([]);
  const [campanhas, setCampanhas] = useState<WhatsAppCampaign[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [contatos, setContatos] = useState<WhatsAppContact[]>([]);
  const [stats, setStats] = useState<WhatsAppStats | null>(null);
  const [webhooks, setWebhooks] = useState<WhatsAppWebhook[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [newCampaignDialog, setNewCampaignDialog] = useState(false);
  const [newInstanceDialog, setNewInstanceDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // Simular carregamento de dados
      const instanciasData = await gerarInstanciasExemplo();
      const campanhasData = await gerarCampanhasExemplo();
      const templatesData = await gerarTemplatesExemplo();
      const contatosData = await gerarContatosExemplo();
      const statsData = await gerarStatsExemplo();
      const webhooksData = await gerarWebhooksExemplo();

      setInstancias(instanciasData);
      setCampanhas(campanhasData);
      setTemplates(templatesData);
      setContatos(contatosData);
      setStats(statsData);
      setWebhooks(webhooksData);
      setLoading(false);

      if (!selectedInstance && instanciasData.length > 0) {
        setSelectedInstance(instanciasData[0].id);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados WhatsApp:", error);
      setLoading(false);
    }
  };

  const gerarInstanciasExemplo = async (): Promise<WhatsAppInstance[]> => {
    const agora = new Date();
    return [
      {
        id: "instance-001",
        nome: "Atendimento Principal",
        numero: "+55 17 99999-1234",
        status: "conectado",
        webhook: "https://kryonix.com.br/webhooks/whatsapp/instance-001",
        conectadoEm: new Date(agora.getTime() - 3600000),
        ultimaAtividade: new Date(agora.getTime() - 300000),
        mensagensEnviadas: 2847,
        mensagensRecebidas: 3251,
        conversasAtivas: 23,
        bateria: 87,
        versao: "2.24.1",
      },
      {
        id: "instance-002",
        nome: "Vendas e Marketing",
        numero: "+55 17 99999-5678",
        status: "conectado",
        webhook: "https://kryonix.com.br/webhooks/whatsapp/instance-002",
        conectadoEm: new Date(agora.getTime() - 7200000),
        ultimaAtividade: new Date(agora.getTime() - 600000),
        mensagensEnviadas: 1456,
        mensagensRecebidas: 876,
        conversasAtivas: 8,
        bateria: 92,
        versao: "2.24.1",
      },
      {
        id: "instance-003",
        nome: "Suporte Técnico",
        numero: "+55 17 99999-9012",
        status: "desconectado",
        webhook: "https://kryonix.com.br/webhooks/whatsapp/instance-003",
        ultimaAtividade: new Date(agora.getTime() - 3600000),
        mensagensEnviadas: 567,
        mensagensRecebidas: 234,
        conversasAtivas: 0,
        versao: "2.24.1",
      },
    ];
  };

  const gerarCampanhasExemplo = async (): Promise<WhatsAppCampaign[]> => {
    const agora = new Date();
    return [
      {
        id: "campaign-001",
        nome: "Black Friday 2024",
        tipo: "broadcast",
        status: "enviando",
        instancia: "instance-002",
        contatos: 5000,
        enviadas: 2340,
        entregues: 2301,
        lidas: 1876,
        respostas: 234,
        criadaEm: new Date(agora.getTime() - 3600000),
        agendadaPara: agora,
      },
      {
        id: "campaign-002",
        nome: "Boas-vindas Novos Clientes",
        tipo: "sequencial",
        status: "concluida",
        instancia: "instance-001",
        contatos: 150,
        enviadas: 150,
        entregues: 148,
        lidas: 132,
        respostas: 45,
        criadaEm: new Date(agora.getTime() - 86400000),
      },
      {
        id: "campaign-003",
        nome: "Pesquisa de Satisfação",
        tipo: "template",
        status: "agendada",
        instancia: "instance-001",
        contatos: 1200,
        enviadas: 0,
        entregues: 0,
        lidas: 0,
        respostas: 0,
        criadaEm: agora,
        agendadaPara: new Date(agora.getTime() + 86400000),
      },
    ];
  };

  const gerarTemplatesExemplo = async (): Promise<MessageTemplate[]> => {
    return [
      {
        id: "template-001",
        nome: "boas_vindas_kryonix",
        categoria: "utility",
        idioma: "pt_BR",
        status: "aprovado",
        aprovadoEm: new Date(Date.now() - 604800000),
        uso: 1247,
        conteudo: {
          body: "Olá {{1}}! 👋 Bem-vindo à KRYONIX! Estamos muito felizes em tê-lo conosco. Sua conta foi criada com sucesso e você já pode começar a usar nossa plataforma.",
          footer: "KRYONIX - Automação Inteligente",
          buttons: [
            { type: "quick_reply", text: "Começar Agora" },
            {
              type: "url",
              text: "Ver Tutorial",
              value: "https://kryonix.com.br/tutorial",
            },
          ],
        },
      },
      {
        id: "template-002",
        nome: "promocao_black_friday",
        categoria: "marketing",
        idioma: "pt_BR",
        status: "aprovado",
        aprovadoEm: new Date(Date.now() - 86400000),
        uso: 2340,
        conteudo: {
          header: {
            type: "image",
            content: "https://kryonix.com.br/images/black-friday.jpg",
          },
          body: "🔥 BLACK FRIDAY KRYONIX! 🔥\n\nDesconto de {{1}}% em todos os planos!\nValor de {{2}} por apenas {{3}}!\n\nOferta válida até {{4}}!",
          footer: "Não perca esta oportunidade!",
          buttons: [
            {
              type: "url",
              text: "Aproveitar Oferta",
              value: "https://kryonix.com.br/black-friday",
            },
          ],
        },
      },
      {
        id: "template-003",
        nome: "confirmacao_pagamento",
        categoria: "utility",
        idioma: "pt_BR",
        status: "aprovado",
        aprovadoEm: new Date(Date.now() - 1209600000),
        uso: 892,
        conteudo: {
          body: "✅ Pagamento confirmado!\n\nOlá {{1}}, recebemos seu pagamento de {{2}} referente ao plano {{3}}.\n\nSua assinatura está ativa até {{4}}.",
          footer: "KRYONIX - Cobrança",
          buttons: [
            {
              type: "url",
              text: "Ver Recibo",
              value: "https://kryonix.com.br/recibo/{{5}}",
            },
          ],
        },
      },
    ];
  };

  const gerarContatosExemplo = async (): Promise<WhatsAppContact[]> => {
    const agora = new Date();
    return [
      {
        id: "contact-001",
        nome: "João Silva",
        numero: "+5517999991111",
        tags: ["cliente", "premium"],
        ultimaConversa: new Date(agora.getTime() - 300000),
        bloqueado: false,
        segmento: "cliente",
        informacoes: {
          empresa: "Tech Solutions",
          cargo: "CEO",
          cidade: "São Paulo",
          origem: "site",
          valorTotal: 5640.0,
          compras: 12,
        },
      },
      {
        id: "contact-002",
        nome: "Maria Santos",
        numero: "+5511888882222",
        tags: ["lead", "interessada"],
        ultimaConversa: new Date(agora.getTime() - 1800000),
        bloqueado: false,
        segmento: "lead",
        informacoes: {
          empresa: "Digital Marketing",
          cargo: "Diretora",
          cidade: "Rio de Janeiro",
          origem: "facebook",
          valorTotal: 0,
          compras: 0,
        },
      },
      {
        id: "contact-003",
        nome: "Carlos Eduardo",
        numero: "+5517777773333",
        tags: ["vip", "enterprise"],
        ultimaConversa: new Date(agora.getTime() - 3600000),
        bloqueado: false,
        segmento: "vip",
        informacoes: {
          empresa: "Mega Corp",
          cargo: "CTO",
          cidade: "Brasília",
          origem: "indicação",
          valorTotal: 24750.0,
          compras: 6,
        },
      },
    ];
  };

  const gerarStatsExemplo = async (): Promise<WhatsAppStats> => {
    return {
      instanciasAtivas: 2,
      totalMensagens: 15847,
      mensagensHoje: 347,
      taxaEntrega: 98.7,
      taxaLeitura: 89.3,
      taxaResposta: 23.4,
      tempoMedioResposta: 2.3,
      satisfacaoMedia: 4.6,
      crescimentoMensal: 12.8,
      custoPorMensagem: 0.05,
    };
  };

  const gerarWebhooksExemplo = async (): Promise<WhatsAppWebhook[]> => {
    return [
      {
        id: "webhook-001",
        nome: "CRM Integration",
        url: "https://crm.empresa.com/webhooks/whatsapp",
        eventos: ["message", "status"],
        ativo: true,
        ultimoEnvio: new Date(Date.now() - 300000),
        tentativas: 1247,
        status: "ativo",
      },
      {
        id: "webhook-002",
        nome: "Analytics Dashboard",
        url: "https://analytics.kryonix.com.br/webhook",
        eventos: ["message", "status", "presence"],
        ativo: true,
        ultimoEnvio: new Date(Date.now() - 60000),
        tentativas: 5634,
        status: "ativo",
      },
    ];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "conectado":
        return "bg-green-500";
      case "desconectado":
        return "bg-red-500";
      case "conectando":
        return "bg-yellow-500";
      case "erro":
        return "bg-red-600";
      case "pendente":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCampaignStatusColor = (status: CampaignStatus): string => {
    switch (status) {
      case "enviando":
        return "text-blue-600 bg-blue-100";
      case "concluida":
        return "text-green-600 bg-green-100";
      case "agendada":
        return "text-purple-600 bg-purple-100";
      case "pausada":
        return "text-yellow-600 bg-yellow-100";
      case "cancelada":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatarNumero = (numero: string): string => {
    // Formatar número brasileiro
    return numero.replace(/(\+55)(\d{2})(\d{5})(\d{4})/, "$1 $2 $3-$4");
  };

  if (loading) {
    return (
      <KryonixLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">Carregando dados do WhatsApp...</p>
          </div>
        </div>
      </KryonixLayout>
    );
  }

  return (
    <KryonixLayout>
      <div className="space-y-6">
        {/* Header com Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Instâncias Ativas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats?.instanciasAtivas}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mensagens Hoje</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats?.mensagensHoje}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Entrega</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats?.taxaEntrega}%
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Resposta</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats?.taxaResposta}%
                    </p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="instances" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="instances">Instâncias</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Instâncias */}
          <TabsContent value="instances" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Instâncias WhatsApp</h2>
              <Dialog
                open={newInstanceDialog}
                onOpenChange={setNewInstanceDialog}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Instância
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Instância WhatsApp</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="instance-name">Nome da Instância</Label>
                      <Input
                        id="instance-name"
                        placeholder="Ex: Atendimento Principal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhook-url">URL do Webhook</Label>
                      <Input id="webhook-url" placeholder="https://..." />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setNewInstanceDialog(false)}>
                        Criar Instância
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setNewInstanceDialog(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {instancias.map((instancia, index) => (
                <motion.div
                  key={instancia.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(instancia.status)}`}
                          />
                          {instancia.nome}
                        </CardTitle>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        {formatarNumero(instancia.numero)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Enviadas:</span>
                            <div className="font-medium text-blue-600">
                              {instancia.mensagensEnviadas.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Recebidas:</span>
                            <div className="font-medium text-green-600">
                              {instancia.mensagensRecebidas.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Conversas:</span>
                            <div className="font-medium text-purple-600">
                              {instancia.conversasAtivas}
                            </div>
                          </div>
                          {instancia.bateria && (
                            <div>
                              <span className="text-gray-600">Bateria:</span>
                              <div className="font-medium text-orange-600">
                                {instancia.bateria}%
                              </div>
                            </div>
                          )}
                        </div>

                        {instancia.status === "conectado" &&
                          instancia.conectadoEm && (
                            <div className="text-xs text-gray-500">
                              Conectado há{" "}
                              {Math.floor(
                                (Date.now() - instancia.conectadoEm.getTime()) /
                                  3600000,
                              )}
                              h
                            </div>
                          )}

                        <div className="flex gap-2 pt-2 border-t">
                          {instancia.status === "desconectado" && (
                            <Button size="sm" className="flex-1 gap-2">
                              <Play className="h-4 w-4" />
                              Conectar
                            </Button>
                          )}
                          {instancia.status === "conectado" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-2"
                            >
                              <Pause className="h-4 w-4" />
                              Desconectar
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="gap-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-2">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Campanhas */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Campanhas de Mensagens</h2>
              <Dialog
                open={newCampaignDialog}
                onOpenChange={setNewCampaignDialog}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Campanha
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nova Campanha WhatsApp</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="campaign-name">Nome da Campanha</Label>
                        <Input
                          id="campaign-name"
                          placeholder="Ex: Promoção de Natal"
                        />
                      </div>
                      <div>
                        <Label htmlFor="campaign-type">Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="broadcast">Broadcast</SelectItem>
                            <SelectItem value="sequencial">
                              Sequencial
                            </SelectItem>
                            <SelectItem value="template">Template</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="campaign-instance">Instância</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a instância" />
                        </SelectTrigger>
                        <SelectContent>
                          {instancias
                            .filter((i) => i.status === "conectado")
                            .map((instancia) => (
                              <SelectItem
                                key={instancia.id}
                                value={instancia.id}
                              >
                                {instancia.nome} -{" "}
                                {formatarNumero(instancia.numero)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="campaign-message">Mensagem</Label>
                      <Textarea
                        id="campaign-message"
                        placeholder="Digite sua mensagem aqui..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setNewCampaignDialog(false)}>
                        Criar Campanha
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setNewCampaignDialog(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {campanhas.map((campanha, index) => (
                <motion.div
                  key={campanha.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {campanha.nome}
                            </h3>
                            <Badge
                              className={getCampaignStatusColor(
                                campanha.status,
                              )}
                            >
                              {campanha.status}
                            </Badge>
                            <Badge variant="outline">{campanha.tipo}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Instância:{" "}
                            {
                              instancias.find(
                                (i) => i.id === campanha.instancia,
                              )?.nome
                            }
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {campanha.contatos.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Contatos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {campanha.enviadas.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Enviadas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {campanha.entregues.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Entregues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {campanha.lidas.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Lidas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {campanha.respostas.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Respostas</div>
                        </div>
                      </div>

                      {campanha.status === "enviando" && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>
                              {Math.round(
                                (campanha.enviadas / campanha.contatos) * 100,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (campanha.enviadas / campanha.contatos) * 100
                            }
                            className="h-2"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          Criada em{" "}
                          {campanha.criadaEm.toLocaleDateString("pt-BR")}
                        </span>
                        {campanha.agendadaPara && (
                          <span>
                            Agendada para{" "}
                            {campanha.agendadaPara.toLocaleString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Templates de Mensagem</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {template.nome}
                        </CardTitle>
                        <Badge
                          variant={
                            template.status === "aprovado"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            template.status === "aprovado" ? "bg-green-500" : ""
                          }
                        >
                          {template.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {template.categoria} • {template.idioma}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                          <p>{template.conteudo.body}</p>
                          {template.conteudo.footer && (
                            <p className="text-gray-600 text-xs mt-2">
                              {template.conteudo.footer}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Usado {template.uso.toLocaleString()}x
                          </span>
                          {template.aprovadoEm && (
                            <span className="text-green-600">
                              Aprovado em{" "}
                              {template.aprovadoEm.toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Usar
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Contatos */}
          <TabsContent value="contacts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Contatos WhatsApp</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Importar
                </Button>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Contato
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {contatos.map((contato, index) => (
                <motion.div
                  key={contato.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {contato.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>

                          <div>
                            <h3 className="font-semibold">{contato.nome}</h3>
                            <p className="text-sm text-gray-600">
                              {formatarNumero(contato.numero)}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {contato.tags.map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              contato.segmento === "vip"
                                ? "border-gold text-gold"
                                : contato.segmento === "cliente"
                                  ? "border-green-500 text-green-600"
                                  : contato.segmento === "lead"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-gray-500 text-gray-600"
                            }
                          >
                            {contato.segmento}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {contato.informacoes.empresa}
                          </div>
                          <div className="text-xs text-gray-500">
                            R${" "}
                            {contato.informacoes.valorTotal.toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 },
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa de Entrega</span>
                        <span>{stats?.taxaEntrega}%</span>
                      </div>
                      <Progress value={stats?.taxaEntrega} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa de Leitura</span>
                        <span>{stats?.taxaLeitura}%</span>
                      </div>
                      <Progress value={stats?.taxaLeitura} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa de Resposta</span>
                        <span>{stats?.taxaResposta}%</span>
                      </div>
                      <Progress value={stats?.taxaResposta} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Tempo de Resposta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {stats?.tempoMedioResposta}min
                    </div>
                    <p className="text-sm text-gray-600">
                      Tempo médio de resposta
                    </p>
                    <div className="mt-4 text-green-600 flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">
                        15% melhor que o mês anterior
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Satisfação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {stats?.satisfacaoMedia}/5
                    </div>
                    <div className="flex justify-center mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.floor(stats?.satisfacaoMedia || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      Baseado em 1.247 avaliações
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Crescimento Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      +{stats?.crescimentoMensal}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Mensagens Enviadas
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      +23%
                    </div>
                    <div className="text-sm text-gray-600">Novos Contatos</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      +18%
                    </div>
                    <div className="text-sm text-gray-600">Conversões</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      R$ {stats?.custoPorMensagem.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Custo por Mensagem
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </KryonixLayout>
  );
};

export default WhatsAppBusiness;

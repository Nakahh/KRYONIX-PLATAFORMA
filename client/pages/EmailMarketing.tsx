import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
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
import { ScrollArea } from "../components/ui/scroll-area";
import { useMobile } from "../hooks/use-mobile";
import {
  Mail,
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
  PieChart,
  MousePointer,
  UserCheck,
  Unlink,
  Archive,
  Code,
  Palette,
  Layout,
  Type,
  Link,
  Layers,
} from "lucide-react";

interface EmailCampaign {
  id: string;
  nome: string;
  assunto: string;
  tipo: CampaignType;
  status: CampaignStatus;
  lista: string;
  destinatarios: number;
  enviados: number;
  entregues: number;
  abertos: number;
  cliques: number;
  respostas: number;
  descadastros: number;
  bounces: number;
  criadaEm: Date;
  agendadaPara?: Date;
  template: EmailTemplate;
  segmentacao: Segmentation;
  automacao?: AutomationRule;
}

type CampaignType =
  | "newsletter"
  | "promocional"
  | "transacional"
  | "boas-vindas"
  | "abandono-carrinho"
  | "reengajamento";
type CampaignStatus =
  | "rascunho"
  | "agendada"
  | "enviando"
  | "pausada"
  | "concluida"
  | "cancelada";

interface EmailTemplate {
  id: string;
  nome: string;
  categoria: TemplateCategory;
  html: string;
  design: TemplateDesign;
  preview: string;
  responsivo: boolean;
  testado: boolean;
  uso: number;
}

type TemplateCategory =
  | "newsletter"
  | "promocional"
  | "transacional"
  | "evento"
  | "produto";

interface TemplateDesign {
  layout: "single-column" | "two-column" | "sidebar" | "grid";
  cores: ColorScheme;
  tipografia: Typography;
  componentes: TemplateComponent[];
}

interface ColorScheme {
  primaria: string;
  secundaria: string;
  fundo: string;
  texto: string;
  destaque: string;
}

interface Typography {
  familia: string;
  tamanhos: {
    titulo: number;
    subtitulo: number;
    corpo: number;
    rodape: number;
  };
}

interface TemplateComponent {
  id: string;
  tipo:
    | "header"
    | "text"
    | "image"
    | "button"
    | "social"
    | "footer"
    | "divider";
  conteudo: any;
  posicao: number;
  estilo: ComponentStyle;
}

interface ComponentStyle {
  margens: string;
  padding: string;
  alinhamento: "left" | "center" | "right";
  cores?: ColorScheme;
}

interface EmailList {
  id: string;
  nome: string;
  descricao: string;
  contatos: number;
  ativos: number;
  segmentos: Segment[];
  origem: ListOrigin[];
  criadaEm: Date;
  ultimaAtualizacao: Date;
}

interface Segment {
  id: string;
  nome: string;
  condicoes: SegmentCondition[];
  contatos: number;
  ativo: boolean;
}

interface SegmentCondition {
  campo: string;
  operador:
    | "equals"
    | "contains"
    | "starts_with"
    | "greater_than"
    | "less_than";
  valor: string;
  tipo: "and" | "or";
}

type ListOrigin =
  | "site"
  | "form"
  | "api"
  | "import"
  | "manual"
  | "landing-page";

interface Segmentation {
  segmentos: string[];
  filtros: SegmentFilter[];
  excluir: string[];
  teste_ab?: ABTest;
}

interface SegmentFilter {
  campo: string;
  condicao: string;
  valor: string;
}

interface ABTest {
  ativo: boolean;
  porcentagem: number;
  variante_a: string;
  variante_b: string;
  metrica: "abertura" | "clique" | "conversao";
}

interface AutomationRule {
  id: string;
  nome: string;
  trigger: AutomationTrigger;
  acoes: AutomationAction[];
  condicoes: AutomationCondition[];
  ativo: boolean;
  execucoes: number;
}

interface AutomationTrigger {
  tipo: "data" | "evento" | "comportamento" | "data_especifica";
  configuracao: any;
}

interface AutomationAction {
  tipo:
    | "enviar_email"
    | "adicionar_tag"
    | "mover_lista"
    | "webhook"
    | "aguardar";
  parametros: any;
  delay?: number;
}

interface AutomationCondition {
  campo: string;
  operador: string;
  valor: string;
}

interface EmailContact {
  id: string;
  email: string;
  nome?: string;
  telefone?: string;
  empresa?: string;
  tags: string[];
  status: ContactStatus;
  origem: string;
  score: number;
  ultimaAbertura?: Date;
  ultimoClique?: Date;
  totalAberturas: number;
  totalCliques: number;
  totalCompras: number;
  valorTotal: number;
  listas: string[];
  campos_personalizados: Record<string, any>;
}

type ContactStatus = "ativo" | "inativo" | "bounced" | "spam" | "descadastrado";

interface EmailStats {
  totalCampanhas: number;
  campanhasAtivas: number;
  emailsEnviados: number;
  taxaEntrega: number;
  taxaAbertura: number;
  taxaClique: number;
  taxaDescadastro: number;
  taxaBounce: number;
  crescimentoLista: number;
  rotiMedio: number;
  receitaTotal: number;
  campanhasMesAtual: number;
}

const EmailMarketing: React.FC = () => {
  const isMobile = useMobile();
  const [campanhas, setCampanhas] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [listas, setListas] = useState<EmailList[]>([]);
  const [contatos, setContatos] = useState<EmailContact[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [automacoes, setAutomacoes] = useState<AutomationRule[]>([]);
  const [newCampaignDialog, setNewCampaignDialog] = useState(false);
  const [newTemplateDialog, setNewTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 60000); // Atualizar a cada minuto
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // Simular carregamento de dados
      const campanhasData = await gerarCampanhasExemplo();
      const templatesData = await gerarTemplatesExemplo();
      const listasData = await gerarListasExemplo();
      const contatosData = await gerarContatosExemplo();
      const statsData = await gerarStatsExemplo();
      const automacoesData = await gerarAutomacoesExemplo();

      setCampanhas(campanhasData);
      setTemplates(templatesData);
      setListas(listasData);
      setContatos(contatosData);
      setStats(statsData);
      setAutomacoes(automacoesData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Erro ao carregar dados de email marketing:", error);
      setLoading(false);
    }
  };

  const gerarCampanhasExemplo = async (): Promise<EmailCampaign[]> => {
    const agora = new Date();
    return [
      {
        id: "email-campaign-001",
        nome: "Black Friday KRYONIX 2024",
        assunto: "🔥 70% OFF - Black Friday KRYONIX! Últimas Horas!",
        tipo: "promocional",
        status: "enviando",
        lista: "lista-clientes",
        destinatarios: 12500,
        enviados: 8750,
        entregues: 8640,
        abertos: 3456,
        cliques: 892,
        respostas: 67,
        descadastros: 23,
        bounces: 110,
        criadaEm: new Date(agora.getTime() - 3600000),
        agendadaPara: agora,
        template: {
          id: "template-promocional-001",
          nome: "Black Friday Hero",
          categoria: "promocional",
          html: "",
          design: {} as TemplateDesign,
          preview: "https://kryonix.com.br/email-previews/black-friday.jpg",
          responsivo: true,
          testado: true,
          uso: 156,
        },
        segmentacao: {
          segmentos: ["clientes-ativos", "leads-qualificados"],
          filtros: [],
          excluir: ["descadastrados"],
          teste_ab: {
            ativo: true,
            porcentagem: 50,
            variante_a: "Assunto A: 70% OFF",
            variante_b: "Assunto B: Últimas Horas",
            metrica: "abertura",
          },
        },
      },
      {
        id: "email-campaign-002",
        nome: "Newsletter Semanal - Dicas KRYONIX",
        assunto: "📊 5 Métricas que Todo Empreendedor Deve Acompanhar",
        tipo: "newsletter",
        status: "concluida",
        lista: "lista-newsletter",
        destinatarios: 8750,
        enviados: 8750,
        entregues: 8654,
        abertos: 2947,
        cliques: 567,
        respostas: 89,
        descadastros: 12,
        bounces: 96,
        criadaEm: new Date(agora.getTime() - 172800000),
        template: {
          id: "template-newsletter-001",
          nome: "Newsletter Clean",
          categoria: "newsletter",
          html: "",
          design: {} as TemplateDesign,
          preview: "https://kryonix.com.br/email-previews/newsletter.jpg",
          responsivo: true,
          testado: true,
          uso: 234,
        },
        segmentacao: {
          segmentos: ["newsletter-subscribers"],
          filtros: [],
          excluir: ["descadastrados"],
        },
      },
      {
        id: "email-campaign-003",
        nome: "Carrinho Abandonado - Recuperação",
        assunto: "🛒 Você esqueceu algo importante na KRYONIX",
        tipo: "abandono-carrinho",
        status: "concluida",
        lista: "carrinho-abandonado",
        destinatarios: 456,
        enviados: 456,
        entregues: 445,
        abertos: 189,
        cliques: 67,
        respostas: 2,
        descadastros: 3,
        bounces: 11,
        criadaEm: new Date(agora.getTime() - 86400000),
        template: {
          id: "template-abandono-001",
          nome: "Carrinho Abandonado",
          categoria: "transacional",
          html: "",
          design: {} as TemplateDesign,
          preview: "https://kryonix.com.br/email-previews/abandoned-cart.jpg",
          responsivo: true,
          testado: true,
          uso: 89,
        },
        segmentacao: {
          segmentos: ["carrinho-abandonado-24h"],
          filtros: [
            { campo: "ultima_visita", condicao: "maior_que", valor: "24h" },
          ],
          excluir: ["descadastrados", "compradores-recentes"],
        },
        automacao: {
          id: "auto-carrinho-abandonado",
          nome: "Sequência Carrinho Abandonado",
          trigger: {
            tipo: "evento",
            configuracao: { evento: "carrinho_abandonado", delay: 1440 }, // 24h
          },
          acoes: [
            {
              tipo: "enviar_email",
              parametros: { template: "template-abandono-001" },
            },
            { tipo: "aguardar", parametros: {}, delay: 4320 }, // 3 dias
            {
              tipo: "enviar_email",
              parametros: { template: "template-abandono-002" },
            },
          ],
          condicoes: [{ campo: "status", operador: "equals", valor: "ativo" }],
          ativo: true,
          execucoes: 1247,
        },
      },
    ];
  };

  const gerarTemplatesExemplo = async (): Promise<EmailTemplate[]> => {
    return [
      {
        id: "template-welcome",
        nome: "Boas-vindas KRYONIX",
        categoria: "transacional",
        html: "",
        design: {
          layout: "single-column",
          cores: {
            primaria: "#3b82f6",
            secundaria: "#8b5cf6",
            fundo: "#ffffff",
            texto: "#1f2937",
            destaque: "#f59e0b",
          },
          tipografia: {
            familia: "Inter, sans-serif",
            tamanhos: { titulo: 32, subtitulo: 24, corpo: 16, rodape: 14 },
          },
          componentes: [],
        },
        preview: "https://kryonix.com.br/email-previews/welcome.jpg",
        responsivo: true,
        testado: true,
        uso: 2847,
      },
      {
        id: "template-promocional",
        nome: "Promoção Relâmpago",
        categoria: "promocional",
        html: "",
        design: {
          layout: "two-column",
          cores: {
            primaria: "#ef4444",
            secundaria: "#f97316",
            fundo: "#ffffff",
            texto: "#1f2937",
            destaque: "#fbbf24",
          },
          tipografia: {
            familia: "Inter, sans-serif",
            tamanhos: { titulo: 36, subtitulo: 28, corpo: 16, rodape: 14 },
          },
          componentes: [],
        },
        preview: "https://kryonix.com.br/email-previews/promocional.jpg",
        responsivo: true,
        testado: true,
        uso: 1567,
      },
      {
        id: "template-newsletter-tech",
        nome: "Newsletter Tech Weekly",
        categoria: "newsletter",
        html: "",
        design: {
          layout: "sidebar",
          cores: {
            primaria: "#6366f1",
            secundaria: "#8b5cf6",
            fundo: "#f8fafc",
            texto: "#374151",
            destaque: "#10b981",
          },
          tipografia: {
            familia: "Inter, sans-serif",
            tamanhos: { titulo: 28, subtitulo: 22, corpo: 16, rodape: 14 },
          },
          componentes: [],
        },
        preview: "https://kryonix.com.br/email-previews/newsletter-tech.jpg",
        responsivo: true,
        testado: true,
        uso: 892,
      },
    ];
  };

  const gerarListasExemplo = async (): Promise<EmailList[]> => {
    const agora = new Date();
    return [
      {
        id: "lista-geral",
        nome: "Lista Geral KRYONIX",
        descricao: "Todos os contatos da plataforma",
        contatos: 25847,
        ativos: 24156,
        segmentos: [
          {
            id: "seg-clientes",
            nome: "Clientes Ativos",
            condicoes: [
              {
                campo: "status",
                operador: "equals",
                valor: "cliente",
                tipo: "and",
              },
            ],
            contatos: 12456,
            ativo: true,
          },
          {
            id: "seg-leads",
            nome: "Leads Qualificados",
            condicoes: [
              {
                campo: "score",
                operador: "greater_than",
                valor: "70",
                tipo: "and",
              },
            ],
            contatos: 8947,
            ativo: true,
          },
        ],
        origem: ["site", "form", "api", "landing-page"],
        criadaEm: new Date(agora.getTime() - 31536000000), // 1 ano atrás
        ultimaAtualizacao: agora,
      },
      {
        id: "lista-newsletter",
        nome: "Newsletter Subscribers",
        descricao: "Assinantes da newsletter semanal",
        contatos: 8947,
        ativos: 8734,
        segmentos: [
          {
            id: "seg-engajados",
            nome: "Altamente Engajados",
            condicoes: [
              {
                campo: "taxa_abertura",
                operador: "greater_than",
                valor: "50",
                tipo: "and",
              },
              {
                campo: "ultima_abertura",
                operador: "less_than",
                valor: "30d",
                tipo: "and",
              },
            ],
            contatos: 2847,
            ativo: true,
          },
        ],
        origem: ["form", "landing-page"],
        criadaEm: new Date(agora.getTime() - 15552000000), // 6 meses atrás
        ultimaAtualizacao: new Date(agora.getTime() - 86400000),
      },
      {
        id: "lista-vip",
        nome: "Clientes VIP",
        descricao: "Clientes premium e enterprise",
        contatos: 567,
        ativos: 556,
        segmentos: [
          {
            id: "seg-enterprise",
            nome: "Enterprise",
            condicoes: [
              {
                campo: "plano",
                operador: "equals",
                valor: "enterprise",
                tipo: "and",
              },
            ],
            contatos: 89,
            ativo: true,
          },
        ],
        origem: ["manual", "api"],
        criadaEm: new Date(agora.getTime() - 7776000000), // 3 meses atrás
        ultimaAtualizacao: new Date(agora.getTime() - 604800000),
      },
    ];
  };

  const gerarContatosExemplo = async (): Promise<EmailContact[]> => {
    const agora = new Date();
    return [
      {
        id: "contact-email-001",
        email: "joao.silva@techsolutions.com.br",
        nome: "João Silva",
        telefone: "+5517999991234",
        empresa: "Tech Solutions",
        tags: ["cliente", "premium", "tech"],
        status: "ativo",
        origem: "site",
        score: 95,
        ultimaAbertura: new Date(agora.getTime() - 3600000),
        ultimoClique: new Date(agora.getTime() - 7200000),
        totalAberturas: 89,
        totalCliques: 34,
        totalCompras: 5,
        valorTotal: 2847.5,
        listas: ["lista-geral", "lista-vip"],
        campos_personalizados: {
          cargo: "CTO",
          funcionarios: "50-100",
          interesse: "automacao",
        },
      },
      {
        id: "contact-email-002",
        email: "maria.santos@digitalmarketing.com.br",
        nome: "Maria Santos",
        telefone: "+5511888882345",
        empresa: "Digital Marketing Plus",
        tags: ["lead", "marketing", "interessada"],
        status: "ativo",
        origem: "form",
        score: 78,
        ultimaAbertura: new Date(agora.getTime() - 86400000),
        ultimoClique: new Date(agora.getTime() - 172800000),
        totalAberturas: 23,
        totalCliques: 12,
        totalCompras: 0,
        valorTotal: 0,
        listas: ["lista-geral", "lista-newsletter"],
        campos_personalizados: {
          cargo: "Diretora de Marketing",
          funcionarios: "10-50",
          interesse: "email_marketing",
        },
      },
    ];
  };

  const gerarStatsExemplo = async (): Promise<EmailStats> => {
    return {
      totalCampanhas: 247,
      campanhasAtivas: 3,
      emailsEnviados: 847256,
      taxaEntrega: 97.2,
      taxaAbertura: 28.4,
      taxaClique: 4.7,
      taxaDescadastro: 0.8,
      taxaBounce: 2.8,
      crescimentoLista: 15.6,
      rotiMedio: 340,
      receitaTotal: 124750.8,
      campanhasMesAtual: 23,
    };
  };

  const gerarAutomacoesExemplo = async (): Promise<AutomationRule[]> => {
    return [
      {
        id: "auto-welcome-series",
        nome: "Sequência de Boas-vindas",
        trigger: {
          tipo: "evento",
          configuracao: { evento: "novo_cadastro" },
        },
        acoes: [
          {
            tipo: "enviar_email",
            parametros: { template: "welcome-1" },
            delay: 0,
          },
          { tipo: "aguardar", parametros: {}, delay: 1440 }, // 1 dia
          {
            tipo: "enviar_email",
            parametros: { template: "welcome-2" },
            delay: 0,
          },
          { tipo: "aguardar", parametros: {}, delay: 4320 }, // 3 dias
          {
            tipo: "enviar_email",
            parametros: { template: "welcome-3" },
            delay: 0,
          },
        ],
        condicoes: [{ campo: "status", operador: "equals", valor: "ativo" }],
        ativo: true,
        execucoes: 2847,
      },
      {
        id: "auto-reengagement",
        nome: "Reengajamento Automático",
        trigger: {
          tipo: "comportamento",
          configuracao: { evento: "sem_abertura", dias: 30 },
        },
        acoes: [
          {
            tipo: "enviar_email",
            parametros: { template: "reengagement-1" },
            delay: 0,
          },
          { tipo: "aguardar", parametros: {}, delay: 10080 }, // 7 dias
          {
            tipo: "enviar_email",
            parametros: { template: "reengagement-2" },
            delay: 0,
          },
        ],
        condicoes: [
          { campo: "total_aberturas", operador: "greater_than", valor: "5" },
        ],
        ativo: true,
        execucoes: 1456,
      },
    ];
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

  const formatarTaxaPercentual = (valor: number): string => {
    return `${valor.toFixed(1)}%`;
  };

  const calcularTaxaAbertura = (abertos: number, entregues: number): number => {
    return entregues > 0 ? (abertos / entregues) * 100 : 0;
  };

  const calcularTaxaClique = (cliques: number, entregues: number): number => {
    return entregues > 0 ? (cliques / entregues) * 100 : 0;
  };

  if (loading) {
    return (
      <MainLayout title="Email Marketing">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600">
              Carregando dados de email marketing...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Email Marketing">
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
                    <p className="text-sm text-gray-600">Emails Enviados</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats?.emailsEnviados.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Send className="h-5 w-5 text-blue-600" />
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
                    <p className="text-sm text-gray-600">Taxa de Abertura</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatarTaxaPercentual(stats?.taxaAbertura || 0)}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="h-5 w-5 text-green-600" />
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
                    <p className="text-sm text-gray-600">Taxa de Clique</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatarTaxaPercentual(stats?.taxaClique || 0)}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MousePointer className="h-5 w-5 text-purple-600" />
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
                    <p className="text-sm text-gray-600">ROI Médio</p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {stats?.rotiMedio}
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

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="lists">Listas</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Campanhas */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Campanhas de Email</h2>
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
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Nova Campanha de Email</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="campaign-name">Nome da Campanha</Label>
                        <Input
                          id="campaign-name"
                          placeholder="Ex: Newsletter Dezembro"
                        />
                      </div>
                      <div>
                        <Label htmlFor="campaign-subject">Assunto</Label>
                        <Input
                          id="campaign-subject"
                          placeholder="Ex: 🎄 Ofertas Especiais de Natal"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="campaign-type">Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newsletter">
                              Newsletter
                            </SelectItem>
                            <SelectItem value="promocional">
                              Promocional
                            </SelectItem>
                            <SelectItem value="transacional">
                              Transacional
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="campaign-list">Lista</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a lista" />
                          </SelectTrigger>
                          <SelectContent>
                            {listas.map((lista) => (
                              <SelectItem key={lista.id} value={lista.id}>
                                {lista.nome} ({lista.contatos.toLocaleString()}{" "}
                                contatos)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="campaign-template">Template</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                  <Card className="hover:shadow-lg transition-shadow">
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
                          <p className="text-sm text-gray-600 mb-2">
                            {campanha.assunto}
                          </p>
                          <p className="text-xs text-gray-500">
                            Lista:{" "}
                            {listas.find((l) => l.id === campanha.lista)?.nome}
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

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {campanha.destinatarios.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            Destinatários
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {campanha.entregues.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Entregues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {campanha.abertos.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Abertos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">
                            {campanha.cliques.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Cliques</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">
                            {formatarTaxaPercentual(
                              calcularTaxaAbertura(
                                campanha.abertos,
                                campanha.entregues,
                              ),
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            Taxa Abertura
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-indigo-600">
                            {formatarTaxaPercentual(
                              calcularTaxaClique(
                                campanha.cliques,
                                campanha.entregues,
                              ),
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            Taxa Clique
                          </div>
                        </div>
                      </div>

                      {campanha.status === "enviando" && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso do Envio</span>
                            <span>
                              {Math.round(
                                (campanha.enviados / campanha.destinatarios) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (campanha.enviados / campanha.destinatarios) * 100
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
              <h2 className="text-xl font-semibold">Templates de Email</h2>
              <Dialog
                open={newTemplateDialog}
                onOpenChange={setNewTemplateDialog}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Nome do Template</Label>
                      <Input
                        id="template-name"
                        placeholder="Ex: Newsletter Mensal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-category">Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                          <SelectItem value="promocional">
                            Promocional
                          </SelectItem>
                          <SelectItem value="transacional">
                            Transacional
                          </SelectItem>
                          <SelectItem value="evento">Evento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setNewTemplateDialog(false)}>
                        Criar Template
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setNewTemplateDialog(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow group">
                    <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Layout className="h-12 w-12 text-white" />
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{template.nome}</h3>
                        <Badge variant="outline">{template.categoria}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          {template.responsivo && (
                            <Smartphone className="h-3 w-3" />
                          )}
                          {template.testado && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                        <span>Usado {template.uso}x</span>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 gap-2">
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Listas */}
          <TabsContent value="lists" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Listas de Email</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Lista
              </Button>
            </div>

            <div className="space-y-4">
              {listas.map((lista, index) => (
                <motion.div
                  key={lista.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {lista.nome}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {lista.descricao}
                          </p>
                          <div className="flex gap-2">
                            {lista.origem.map((origem, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {origem}
                              </Badge>
                            ))}
                          </div>
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

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {lista.contatos.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">
                            Total Contatos
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {lista.ativos.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Ativos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {lista.segmentos.length}
                          </div>
                          <div className="text-xs text-gray-600">Segmentos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatarTaxaPercentual(
                              (lista.ativos / lista.contatos) * 100,
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            Taxa Ativo
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          Criada em {lista.criadaEm.toLocaleDateString("pt-BR")}
                        </span>
                        <span>
                          Atualizada em{" "}
                          {lista.ultimaAtualizacao.toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Automação */}
          <TabsContent value="automation" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Automações de Email</h2>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Automação
              </Button>
            </div>

            <div className="space-y-4">
              {automacoes.map((automacao, index) => (
                <motion.div
                  key={automacao.id}
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
                              {automacao.nome}
                            </h3>
                            <Badge
                              variant={
                                automacao.ativo ? "default" : "secondary"
                              }
                            >
                              {automacao.ativo ? "Ativo" : "Inativo"}
                            </Badge>
                            <Badge variant="outline">
                              {automacao.trigger.tipo}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {automacao.acoes.length} ações configuradas
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Switch checked={automacao.ativo} />
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {automacao.execucoes.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-600">Execuções</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {automacao.acoes.length}
                          </div>
                          <div className="text-xs text-gray-600">Ações</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          Fluxo de Automação:
                        </h4>
                        <div className="space-y-1">
                          {automacao.acoes.map((acao, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded"
                            >
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                {i + 1}
                              </div>
                              <span>{acao.tipo.replace("_", " ")}</span>
                              {acao.delay && acao.delay > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  +{Math.floor(acao.delay / 1440)}d
                                </Badge>
                              )}
                            </div>
                          ))}
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
              <h2 className="text-xl font-semibold">Contatos de Email</h2>
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
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "?"}
                          </div>

                          <div>
                            <h3 className="font-semibold">
                              {contato.nome || contato.email}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {contato.email}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {contato.tags.slice(0, 3).map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {contato.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{contato.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              contato.status === "ativo"
                                ? "border-green-500 text-green-600"
                                : contato.status === "inativo"
                                  ? "border-gray-500 text-gray-600"
                                  : "border-red-500 text-red-600"
                            }
                          >
                            {contato.status}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            Score: {contato.score}/100
                          </div>
                          <div className="text-xs text-gray-500">
                            {contato.totalAberturas} aberturas •{" "}
                            {contato.totalCliques} cliques
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
                        <span>
                          {formatarTaxaPercentual(stats?.taxaEntrega || 0)}
                        </span>
                      </div>
                      <Progress value={stats?.taxaEntrega} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa de Abertura</span>
                        <span>
                          {formatarTaxaPercentual(stats?.taxaAbertura || 0)}
                        </span>
                      </div>
                      <Progress value={stats?.taxaAbertura} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Taxa de Clique</span>
                        <span>
                          {formatarTaxaPercentual(stats?.taxaClique || 0)}
                        </span>
                      </div>
                      <Progress
                        value={stats?.taxaClique || 0}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Crescimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        +{formatarTaxaPercentual(stats?.crescimentoLista || 0)}
                      </div>
                      <p className="text-sm text-gray-600">
                        Crescimento da lista este mês
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-bold">
                          {stats?.campanhasMesAtual}
                        </div>
                        <div className="text-gray-600">Campanhas</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-bold">
                          R$ {stats?.receitaTotal.toLocaleString("pt-BR")}
                        </div>
                        <div className="text-gray-600">Receita</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribuição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Newsletter</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Promocional</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transacional</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Outros</span>
                      <span className="font-medium">5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default EmailMarketing;

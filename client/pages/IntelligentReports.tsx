import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  Brain,
  Zap,
  Clock,
  Mail,
  Share2,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  Target,
  Users,
  MessageCircle,
  CreditCard,
  MapPin,
  Shield,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Send,
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  brazilianAnalytics,
  BrazilianReportConfig,
} from "@/services/brazilian-analytics";

interface ReportTemplate {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  metricas: string[];
  frequencia: "diaria" | "semanal" | "mensal";
  formato: "pdf" | "excel" | "csv" | "dashboard";
  icone: React.ComponentType<any>;
  previewData?: any;
}

interface ScheduledReport {
  id: string;
  nome: string;
  template: string;
  proximaExecucao: Date;
  destinatarios: string[];
  ativo: boolean;
  ultimaExecucao?: Date;
  status: "ativo" | "pausado" | "erro";
}

export default function IntelligentReports() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(
    [],
  );
  const [reportConfig, setReportConfig] = useState<
    Partial<BrazilianReportConfig>
  >({
    tipo: "semanal",
    dataInicio: subDays(new Date(), 7),
    dataFim: new Date(),
    formato: "pdf",
    incluirComparacao: true,
    incluirPrevisoes: true,
    incluirInsights: true,
    automatico: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);

  // Templates de relatórios pré-definidos para empresas brasileiras
  const reportTemplates: ReportTemplate[] = [
    {
      id: "whatsapp-performance",
      nome: "Performance WhatsApp Business",
      descricao:
        "Análise completa das métricas de WhatsApp com foco no mercado brasileiro",
      categoria: "Comunicação",
      metricas: [
        "whatsapp.mensagensEnviadas",
        "whatsapp.taxaResposta",
        "whatsapp.tempoMedioResposta",
      ],
      frequencia: "diaria",
      formato: "pdf",
      icone: MessageCircle,
    },
    {
      id: "vendas-pix",
      nome: "Relatório de Vendas e PIX",
      descricao: "Análise detalhada de vendas com destaque para pagamentos PIX",
      categoria: "Vendas",
      metricas: [
        "vendas.receitaTotalBRL",
        "vendas.conversaoPIX",
        "vendas.ticketMedio",
      ],
      frequencia: "semanal",
      formato: "excel",
      icone: CreditCard,
    },
    {
      id: "regional-brasil",
      nome: "Análise Regional Brasileira",
      descricao: "Distribuição geográfica e performance por estados e regiões",
      categoria: "Geografia",
      metricas: [
        "geograficas.usuariosPorEstado",
        "geograficas.cidadesMaisAtivas",
      ],
      frequencia: "mensal",
      formato: "dashboard",
      icone: MapPin,
    },
    {
      id: "automacao-eficiencia",
      nome: "Eficiência da Automação",
      descricao: "Métricas de workflows, chatbots e economia de tempo",
      categoria: "Automação",
      metricas: [
        "automacao.workflowsAtivos",
        "automacao.economiaTempoHoras",
        "automacao.taxaSucessoAutomacao",
      ],
      frequencia: "semanal",
      formato: "pdf",
      icone: Zap,
    },
    {
      id: "compliance-lgpd",
      nome: "Compliance LGPD e Segurança",
      descricao: "Relatório de conformidade com LGPD e métricas de segurança",
      categoria: "Compliance",
      metricas: [
        "compliance.lgpdConsentimentos",
        "compliance.auditoriasRealizadas",
        "compliance.incidentesSeguranca",
      ],
      frequencia: "mensal",
      formato: "pdf",
      icone: Shield,
    },
    {
      id: "atendimento-clientes",
      nome: "Atendimento ao Cliente",
      descricao: "Análise de tickets, satisfação e tempo de resolução",
      categoria: "Atendimento",
      metricas: [
        "atendimento.ticketsResolvidos",
        "atendimento.satisfacaoCliente",
        "atendimento.tempoMedioResolucao",
      ],
      frequencia: "diaria",
      formato: "dashboard",
      icone: Users,
    },
    {
      id: "performance-tecnica",
      nome: "Performance Técnica",
      descricao: "Uptime, latência e métricas de infraestrutura",
      categoria: "Técnico",
      metricas: [
        "performance.uptimePercentual",
        "performance.tempoRespostaMedio",
        "performance.requestsPorMinuto",
      ],
      frequencia: "diaria",
      formato: "csv",
      icone: BarChart3,
    },
    {
      id: "insights-ia",
      nome: "Insights Inteligentes IA",
      descricao: "Relatório gerado por IA com recomendações personalizadas",
      categoria: "Inteligência Artificial",
      metricas: ["all"],
      frequencia: "semanal",
      formato: "pdf",
      icone: Brain,
    },
  ];

  useEffect(() => {
    loadScheduledReports();
  }, []);

  const loadScheduledReports = () => {
    // Simular carregamento de relatórios agendados
    const mockReports: ScheduledReport[] = [
      {
        id: "1",
        nome: "WhatsApp Diário",
        template: "whatsapp-performance",
        proximaExecucao: addDays(new Date(), 1),
        destinatarios: ["admin@kryonix.com.br"],
        ativo: true,
        ultimaExecucao: new Date(),
        status: "ativo",
      },
      {
        id: "2",
        nome: "Vendas Semanais",
        template: "vendas-pix",
        proximaExecucao: addDays(new Date(), 3),
        destinatarios: ["vendas@kryonix.com.br", "diretor@kryonix.com.br"],
        ativo: true,
        status: "ativo",
      },
    ];
    setScheduledReports(mockReports);
  };

  const generateReport = async (template: ReportTemplate) => {
    setIsGenerating(true);
    try {
      const config: BrazilianReportConfig = {
        tipo: reportConfig.tipo || "semanal",
        dataInicio: reportConfig.dataInicio || subDays(new Date(), 7),
        dataFim: reportConfig.dataFim || new Date(),
        metricas: template.metricas,
        formato: template.formato,
        incluirComparacao: reportConfig.incluirComparacao || true,
        incluirPrevisoes: reportConfig.incluirPrevisoes || true,
        incluirInsights: reportConfig.incluirInsights || true,
        automatico: false,
      };

      const relatorio = await brazilianAnalytics.gerarRelatorio(config);

      // Simular download do relatório
      const blob = new Blob([JSON.stringify(relatorio, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.nome.toLowerCase().replace(/\s+/g, "-")}-${format(new Date(), "dd-MM-yyyy")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const scheduleReport = (template: ReportTemplate) => {
    const newReport: ScheduledReport = {
      id: Date.now().toString(),
      nome: `${template.nome} - Automatizado`,
      template: template.id,
      proximaExecucao: addDays(new Date(), 1),
      destinatarios: ["admin@kryonix.com.br"],
      ativo: true,
      status: "ativo",
    };

    setScheduledReports((prev) => [...prev, newReport]);
    setShowNewReportDialog(false);
  };

  const toggleReportStatus = (reportId: string) => {
    setScheduledReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              ativo: !report.ativo,
              status: report.ativo ? "pausado" : "ativo",
            }
          : report,
      ),
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "text-green-600 bg-green-100";
      case "pausado":
        return "text-yellow-600 bg-yellow-100";
      case "erro":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case "Comunicação":
        return MessageCircle;
      case "Vendas":
        return CreditCard;
      case "Geografia":
        return MapPin;
      case "Automação":
        return Zap;
      case "Compliance":
        return Shield;
      case "Atendimento":
        return Users;
      case "Técnico":
        return BarChart3;
      case "Inteligência Artificial":
        return Brain;
      default:
        return FileText;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span>Relatórios Inteligentes</span>
          </h1>
          <p className="text-muted-foreground">
            Sistema avançado de relatórios com IA para empresas brasileiras
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Brain className="h-3 w-3" />
            <span>IA GPT-4o</span>
          </Badge>

          <Dialog
            open={showNewReportDialog}
            onOpenChange={setShowNewReportDialog}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Relatório Automatizado</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Selecione um Template</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {reportTemplates.map((template) => {
                      const IconComponent = template.icone;
                      return (
                        <Card
                          key={template.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            selectedTemplate?.id === template.id
                              ? "ring-2 ring-blue-500"
                              : "",
                          )}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <IconComponent className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">
                                  {template.nome}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {template.descricao}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {template.frequencia}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {template.formato}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Label htmlFor="report-name">Nome do Relatório</Label>
                      <Input
                        id="report-name"
                        defaultValue={`${selectedTemplate.nome} - Automatizado`}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Frequência</Label>
                        <Select defaultValue={selectedTemplate.frequencia}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diaria">Diária</SelectItem>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Formato</Label>
                        <Select defaultValue={selectedTemplate.formato}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="dashboard">Dashboard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Destinatários (separados por vírgula)</Label>
                      <Textarea
                        placeholder="admin@kryonix.com.br, vendas@kryonix.com.br"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch id="incluir-insights" defaultChecked />
                        <Label htmlFor="incluir-insights">
                          Incluir Insights IA
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="incluir-previsoes" defaultChecked />
                        <Label htmlFor="incluir-previsoes">
                          Incluir Previsões
                        </Label>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button
                        onClick={() => scheduleReport(selectedTemplate)}
                        className="flex-1"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Agendar Relatório
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => generateReport(selectedTemplate)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Gerar Agora
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates Disponíveis</TabsTrigger>
          <TabsTrigger value="scheduled">Relatórios Agendados</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="ai-insights">Insights IA</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reportTemplates.map((template) => {
              const IconComponent = template.icone;
              const CategoryIcon = getCategoryIcon(template.categoria);

              return (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {template.nome}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {template.categoria}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription>{template.descricao}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Frequência:
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {template.frequencia}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Formato:</span>
                        <Badge variant="secondary" className="uppercase">
                          {template.formato}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Métricas:</span>
                        <Badge variant="outline">
                          {template.metricas.length} métricas
                        </Badge>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => generateReport(template)}
                          disabled={isGenerating}
                          className="flex-1"
                        >
                          {isGenerating ? (
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-3 w-3" />
                          )}
                          Gerar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowNewReportDialog(true);
                          }}
                        >
                          <Clock className="mr-2 h-3 w-3" />
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Automatizados</CardTitle>
              <CardDescription>
                Geração automática de relatórios com entrega por email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={report.ativo}
                          onCheckedChange={() => toggleReportStatus(report.id)}
                        />
                        <div>
                          <h4 className="font-semibold">{report.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            Próxima execução:{" "}
                            {format(
                              report.proximaExecucao,
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>

                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {scheduledReports.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">
                      Nenhum relatório agendado
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Configure relatórios automáticos para receber insights
                      regulares
                    </p>
                    <Button onClick={() => setShowNewReportDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agendar Primeiro Relatório
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Relatórios</CardTitle>
              <CardDescription>
                Últimos relatórios gerados e seus status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    nome: "WhatsApp Performance",
                    data: new Date(),
                    status: "sucesso",
                    tipo: "PDF",
                  },
                  {
                    nome: "Vendas e PIX Semanal",
                    data: subDays(new Date(), 1),
                    status: "sucesso",
                    tipo: "Excel",
                  },
                  {
                    nome: "Compliance LGPD",
                    data: subDays(new Date(), 3),
                    status: "sucesso",
                    tipo: "PDF",
                  },
                  {
                    nome: "Performance Técnica",
                    data: subDays(new Date(), 5),
                    status: "erro",
                    tipo: "CSV",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{item.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(item.data, "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{item.tipo}</Badge>
                      <Badge
                        className={
                          item.status === "sucesso"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {item.status}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Insights Gerados por IA</span>
              </CardTitle>
              <CardDescription>
                Análises automáticas e recomendações personalizadas para sua
                empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    titulo: "Oportunidade PIX",
                    insight:
                      "Sua taxa de conversão PIX (72%) está acima da média nacional. Considere promover ainda mais este método.",
                    acao: "Criar campanha focada em pagamentos PIX",
                    impacto: "Alto",
                    confianca: 94,
                  },
                  {
                    titulo: "Otimização WhatsApp",
                    insight:
                      "Horário de maior engajamento é entre 19h-21h. Concentre envios neste período.",
                    acao: "Ajustar cronograma de mensagens",
                    impacto: "Médio",
                    confianca: 87,
                  },
                  {
                    titulo: "Expansão Regional",
                    insight:
                      "Região Nordeste mostra crescimento de 23% em novos usuários este mês.",
                    acao: "Aumentar investimento em marketing regional",
                    impacto: "Alto",
                    confianca: 91,
                  },
                ].map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg">
                        {insight.titulo}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            insight.impacto === "Alto"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {insight.impacto}
                        </Badge>
                        <Badge variant="outline">
                          {insight.confianca}% confiança
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-3">
                      {insight.insight}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-600">
                          {insight.acao}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-3 w-3" />
                          Detalhes
                        </Button>
                        <Button size="sm">
                          <Send className="mr-2 h-3 w-3" />
                          Implementar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

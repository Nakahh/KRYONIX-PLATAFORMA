import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  MessageSquare,
  CreditCard,
  Mail,
  ShoppingCart,
  UserCheck,
  BarChart3,
  Clock,
  Star,
  Download,
  Eye,
  Zap,
  Brazil,
  Phone,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { useAPI } from "../../hooks/use-api";
import { useToast } from "../../hooks/use-toast";

interface N8NTemplate {
  id: string;
  name: string;
  description: string;
  category: "whatsapp" | "pix" | "email" | "crm" | "analytics" | "lead";
  difficulty: "iniciante" | "intermediario" | "avancado";
  estimatedTime: string;
  brazilianFeatures: string[];
  downloads: number;
  rating: number;
  tags: string[];
  icon: React.ComponentType;
  workflowJson: any;
  isFree: boolean;
  requirements: string[];
}

const brazilianTemplates: N8NTemplate[] = [
  {
    id: "whatsapp-crm-integration",
    name: "WhatsApp → CRM Brasileiro",
    description:
      "Integração automática de leads do WhatsApp Business para CRM nacional com validação de CPF/CNPJ",
    category: "whatsapp",
    difficulty: "intermediario",
    estimatedTime: "15 min",
    brazilianFeatures: [
      "Validação CPF/CNPJ",
      "Integração CRM BR",
      "Webhook WhatsApp Business",
    ],
    downloads: 2847,
    rating: 4.8,
    tags: ["WhatsApp", "CRM", "Leads", "Automação"],
    icon: MessageSquare,
    isFree: true,
    requirements: ["WhatsApp Business API", "CRM com API"],
    workflowJson: {
      nodes: [
        { type: "whatsapp-trigger", name: "Nova mensagem WhatsApp" },
        { type: "cpf-validator", name: "Validar CPF/CNPJ" },
        { type: "crm-integration", name: "Enviar para CRM" },
        { type: "response-sender", name: "Resposta automática" },
      ],
    },
  },
  {
    id: "pix-notification-system",
    name: "PIX → Notificações Automáticas",
    description:
      "Sistema de notificações automáticas para pagamentos PIX com integração bancária brasileira",
    category: "pix",
    difficulty: "avancado",
    estimatedTime: "25 min",
    brazilianFeatures: [
      "Integração Open Banking",
      "Validação PIX",
      "Notificações push",
    ],
    downloads: 1923,
    rating: 4.9,
    tags: ["PIX", "Pagamentos", "Banco", "Notificações"],
    icon: CreditCard,
    isFree: false,
    requirements: ["Conta bancária com API", "Sistema de notificações"],
    workflowJson: {
      nodes: [
        { type: "pix-webhook", name: "Webhook PIX recebido" },
        { type: "bank-validation", name: "Validar transação" },
        { type: "notification-sender", name: "Enviar notificações" },
        { type: "receipt-generator", name: "Gerar comprovante" },
      ],
    },
  },
  {
    id: "email-marketing-segmentation",
    name: "Email Marketing + Segmentação BR",
    description:
      "Segmentação automática por região brasileira e campanhas de email marketing personalizadas",
    category: "email",
    difficulty: "iniciante",
    estimatedTime: "10 min",
    brazilianFeatures: [
      "Segmentação por CEP",
      "Fuso horário brasileiro",
      "LGPD compliant",
    ],
    downloads: 3156,
    rating: 4.7,
    tags: ["Email", "Marketing", "Segmentação", "LGPD"],
    icon: Mail,
    isFree: true,
    requirements: ["Provedor de email", "Base de contatos"],
    workflowJson: {
      nodes: [
        { type: "contact-trigger", name: "Novo contato" },
        { type: "cep-analyzer", name: "Analisar CEP" },
        { type: "segmentation", name: "Segmentar por região" },
        { type: "email-sender", name: "Enviar email personalizado" },
      ],
    },
  },
  {
    id: "lead-qualification-brazil",
    name: "Qualificação de Leads Brasil",
    description:
      "Sistema de qualificação automática de leads com scoring baseado em dados brasileiros",
    category: "lead",
    difficulty: "intermediario",
    estimatedTime: "20 min",
    brazilianFeatures: [
      "Scoring brasileiro",
      "Validação renda",
      "Análise comportamental",
    ],
    downloads: 2234,
    rating: 4.6,
    tags: ["Leads", "Qualificação", "Scoring", "CRM"],
    icon: Target,
    isFree: false,
    requirements: ["CRM integrado", "Base de dados"],
    workflowJson: {
      nodes: [
        { type: "lead-capture", name: "Capturar lead" },
        { type: "data-enrichment", name: "Enriquecer dados" },
        { type: "brazilian-scoring", name: "Aplicar scoring BR" },
        { type: "lead-routing", name: "Rotear para vendedor" },
      ],
    },
  },
  {
    id: "ecommerce-abandoned-cart",
    name: "Carrinho Abandonado E-commerce BR",
    description:
      "Recuperação automática de carrinho abandonado com estratégias brasileiras",
    category: "analytics",
    difficulty: "intermediario",
    estimatedTime: "18 min",
    brazilianFeatures: [
      "Parcelamento inteligente",
      "Frete grátis",
      "Cupons regionais",
    ],
    downloads: 1876,
    rating: 4.8,
    tags: ["E-commerce", "Carrinho", "Conversão", "Vendas"],
    icon: ShoppingCart,
    isFree: true,
    requirements: ["Plataforma e-commerce", "Sistema de email"],
    workflowJson: {
      nodes: [
        { type: "cart-trigger", name: "Carrinho abandonado" },
        { type: "user-analyzer", name: "Analisar usuário" },
        { type: "incentive-generator", name: "Gerar incentivo" },
        { type: "recovery-email", name: "Enviar email de recuperação" },
      ],
    },
  },
  {
    id: "customer-support-automation",
    name: "Suporte Automatizado Brasil",
    description:
      "Sistema de suporte automatizado com horário comercial brasileiro e triagem inteligente",
    category: "crm",
    difficulty: "avancado",
    estimatedTime: "30 min",
    brazilianFeatures: [
      "Horário comercial BR",
      "Triagem por urgência",
      "Integração múltiplos canais",
    ],
    downloads: 1654,
    rating: 4.5,
    tags: ["Suporte", "Atendimento", "Automação", "Triagem"],
    icon: UserCheck,
    isFree: false,
    requirements: ["Sistema de tickets", "Múltiplos canais"],
    workflowJson: {
      nodes: [
        { type: "support-trigger", name: "Solicitação de suporte" },
        { type: "business-hours", name: "Verificar horário" },
        { type: "urgency-classifier", name: "Classificar urgência" },
        { type: "ticket-router", name: "Rotear ticket" },
      ],
    },
  },
];

export function BrazilianN8NTemplates() {
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "recent">(
    "popular",
  );
  const { api } = useAPI();
  const { toast } = useToast();

  const filteredTemplates = brazilianTemplates
    .filter((template) => {
      const matchesCategory =
        selectedCategory === "todos" || template.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === "todos" ||
        template.difficulty === selectedDifficulty;
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      return matchesCategory && matchesDifficulty && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "recent":
          return b.downloads - a.downloads; // Simplified: using downloads as proxy
        default:
          return b.downloads - a.downloads;
      }
    });

  const handleInstallTemplate = async (template: N8NTemplate) => {
    try {
      await api.post("/n8n/templates/install", {
        templateId: template.id,
        workflowData: template.workflowJson,
      });

      toast({
        title: "Template instalado!",
        description: `${template.name} foi adicionado às suas automações.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao instalar",
        description: "Não foi possível instalar o template. Tente novamente.",
      });
    }
  };

  const handlePreviewTemplate = (template: N8NTemplate) => {
    // Abrir modal de preview ou navegar para preview
    window.open(`/workflows/preview/${template.id}`, "_blank");
  };

  const categories = [
    { id: "todos", name: "Todos", icon: Filter },
    { id: "whatsapp", name: "WhatsApp", icon: MessageSquare },
    { id: "pix", name: "PIX", icon: CreditCard },
    { id: "email", name: "Email", icon: Mail },
    { id: "crm", name: "CRM", icon: Users },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
    { id: "lead", name: "Leads", icon: Target },
  ];

  const difficulties = [
    { id: "todos", name: "Todos níveis" },
    { id: "iniciante", name: "Iniciante" },
    { id: "intermediario", name: "Intermediário" },
    { id: "avancado", name: "Avançado" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Brazil className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Templates N8N Brasil
            </h2>
            <p className="text-sm text-gray-600">
              Automações prontas para o mercado brasileiro
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            {filteredTemplates.length} templates
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            100% Português
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <div className="flex gap-1">
              {[
                { key: "popular", label: "Mais populares" },
                { key: "rating", label: "Melhor avaliados" },
                { key: "recent", label: "Mais recentes" },
              ].map((option) => (
                <Button
                  key={option.key}
                  variant={sortBy === option.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy(option.key as any)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const IconComponent = template.icon;

          return (
            <Card
              key={template.id}
              className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                        {template.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            template.difficulty === "iniciante"
                              ? "text-green-600 border-green-200"
                              : template.difficulty === "intermediario"
                                ? "text-yellow-600 border-yellow-200"
                                : "text-red-600 border-red-200"
                          }`}
                        >
                          {template.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">
                            {template.rating}
                          </span>
                        </div>
                        {!template.isFree && (
                          <Badge className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-100">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>

                {/* Brazilian Features */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Brazil className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Recursos brasileiros:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.brazilianFeatures
                      .slice(0, 2)
                      .map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    {template.brazilianFeatures.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.brazilianFeatures.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{template.downloads.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{template.estimatedTime}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handlePreviewTemplate(template)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => handleInstallTemplate(template)}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!template.isFree} // Simplified: disable premium templates
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {template.isFree ? "Instalar" : "Premium"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou termos de busca
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("todos");
                setSelectedDifficulty("todos");
                setSearchTerm("");
              }}
            >
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

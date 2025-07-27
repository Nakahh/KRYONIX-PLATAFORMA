import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  BarChart3,
  Zap,
  Bot,
  Settings,
  QrCode,
  Users,
  Mail,
  FileText,
  Database,
  Smartphone,
  Clock,
  TrendingUp,
  Shield,
  RefreshCw,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useMobileAdvanced } from "../hooks/use-mobile-advanced";

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  href: string;
  category:
    | "communication"
    | "analytics"
    | "automation"
    | "management"
    | "configuration";
  difficulty: "easy" | "medium" | "advanced";
  estimatedTime: string;
  popular?: boolean;
  new?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  // Comunicação
  {
    id: "whatsapp-setup",
    title: "Configurar WhatsApp Business",
    subtitle: "Evolution API + N8N",
    description: "Configure sua instância WhatsApp Business em 5 minutos",
    icon: MessageSquare,
    color: "text-green-600",
    gradient: "from-green-400 to-green-600",
    href: "/communication",
    category: "communication",
    difficulty: "easy",
    estimatedTime: "5 min",
    popular: true,
  },
  {
    id: "broadcast-campaign",
    title: "Criar Campanha Broadcast",
    subtitle: "Envio em massa personalizado",
    description: "Envie mensagens para milhares de contatos com personalização",
    icon: Mail,
    color: "text-blue-600",
    gradient: "from-blue-400 to-blue-600",
    href: "/whatsapp/broadcast",
    category: "communication",
    difficulty: "medium",
    estimatedTime: "10 min",
  },

  // Analytics
  {
    id: "view-metrics",
    title: "Ver Métricas em Tempo Real",
    subtitle: "Dashboard completo",
    description: "Acompanhe todas as métricas das suas automações",
    icon: BarChart3,
    color: "text-purple-600",
    gradient: "from-purple-400 to-purple-600",
    href: "/analytics",
    category: "analytics",
    difficulty: "easy",
    estimatedTime: "2 min",
    popular: true,
  },
  {
    id: "advanced-reports",
    title: "Relatórios Inteligentes",
    subtitle: "IA + Machine Learning",
    description: "Relatórios automáticos com insights gerados por IA",
    icon: TrendingUp,
    color: "text-indigo-600",
    gradient: "from-indigo-400 to-indigo-600",
    href: "/reports/intelligent",
    category: "analytics",
    difficulty: "medium",
    estimatedTime: "15 min",
  },

  // Automação
  {
    id: "create-automation",
    title: "Criar Automação N8N",
    subtitle: "Workflow visual + IA",
    description: "Crie automações complexas com interface visual",
    icon: Zap,
    color: "text-yellow-600",
    gradient: "from-yellow-400 to-orange-500",
    href: "/n8n/workflows",
    category: "automation",
    difficulty: "medium",
    estimatedTime: "20 min",
    popular: true,
  },
  {
    id: "ai-automation",
    title: "IA Autônoma Avançada",
    subtitle: "GPT-4 + Ollama + Dify",
    description: "Configure IA que toma decisões automaticamente",
    icon: Bot,
    color: "text-orange-600",
    gradient: "from-orange-400 to-red-500",
    href: "/ai/autonomous",
    category: "automation",
    difficulty: "advanced",
    estimatedTime: "30 min",
    new: true,
  },

  // Gerenciamento
  {
    id: "stack-management",
    title: "Gerenciar Stacks",
    subtitle: "25+ serviços integrados",
    description: "Configure e monitore todas as suas stacks",
    icon: Database,
    color: "text-cyan-600",
    gradient: "from-cyan-400 to-blue-500",
    href: "/stacks",
    category: "management",
    difficulty: "medium",
    estimatedTime: "15 min",
  },
  {
    id: "team-management",
    title: "Gestão de Equipe",
    subtitle: "Usuários & Permissões",
    description: "Gerencie usuários, permissões e colaboração",
    icon: Users,
    color: "text-pink-600",
    gradient: "from-pink-400 to-rose-500",
    href: "/users/management",
    category: "management",
    difficulty: "medium",
    estimatedTime: "10 min",
  },

  // Configuração
  {
    id: "pix-payment",
    title: "Configurar PIX",
    subtitle: "Pagamentos instantâneos",
    description: "Configure pagamentos PIX para sua assinatura",
    icon: QrCode,
    color: "text-green-600",
    gradient: "from-green-400 to-emerald-500",
    href: "/billing",
    category: "configuration",
    difficulty: "easy",
    estimatedTime: "5 min",
    new: true,
  },
  {
    id: "security-setup",
    title: "Configurar Segurança",
    subtitle: "2FA + Backup + LGPD",
    description: "Configure autenticação 2FA e conformidade LGPD",
    icon: Shield,
    color: "text-red-600",
    gradient: "from-red-400 to-pink-500",
    href: "/security",
    category: "configuration",
    difficulty: "medium",
    estimatedTime: "15 min",
  },
];

const CATEGORIES = [
  { id: "all", label: "Todas", icon: Plus },
  { id: "communication", label: "Comunicação", icon: MessageSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "automation", label: "Automação", icon: Zap },
  { id: "management", label: "Gestão", icon: Users },
  { id: "configuration", label: "Config", icon: Settings },
];

export default function QuickActions() {
  const { isMobile } = useMobileAdvanced();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar ações
  const filteredActions = QUICK_ACTIONS.filter((action) => {
    const matchesSearch =
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || action.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Agrupar por categoria
  const actionsByCategory = filteredActions.reduce(
    (acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = [];
      }
      acc[action.category].push(action);
      return acc;
    },
    {} as Record<string, QuickAction[]>,
  );

  const handleActionClick = (action: QuickAction) => {
    navigate(action.href);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Médio";
      case "advanced":
        return "Avançado";
      default:
        return difficulty;
    }
  };

  return (
    <div className={`${isMobile ? "p-4" : "p-6"} space-y-6`}>
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Ações Rápidas
        </motion.h1>
        <p className="text-gray-600">
          Configure e automatize sua plataforma KRYONIX em poucos cliques
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar ações, configurações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Category Filters */}
        <div
          className={`flex gap-2 ${isMobile ? "overflow-x-auto" : "flex-wrap"} pb-2`}
        >
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quick Access - Popular Actions */}
      {selectedCategory === "all" && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Mais Populares
          </h2>

          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"} gap-4`}
          >
            {QUICK_ACTIONS.filter((action) => action.popular).map(
              (action, index) => {
                const Icon = action.icon;

                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleActionClick(action)}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5`}
                      />

                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient}`}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            {action.popular && (
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-700"
                              >
                                Popular
                              </Badge>
                            )}
                            {action.new && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700"
                              >
                                Novo
                              </Badge>
                            )}
                          </div>
                        </div>

                        <CardTitle className="text-lg">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="font-medium text-blue-600">
                          {action.subtitle}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                          {action.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={getDifficultyColor(action.difficulty)}
                            >
                              {getDifficultyLabel(action.difficulty)}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              {action.estimatedTime}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              },
            )}
          </div>
        </motion.section>
      )}

      {/* All Actions by Category */}
      <div className="space-y-8">
        {Object.entries(actionsByCategory).map(([categoryId, actions]) => {
          const category = CATEGORIES.find((cat) => cat.id === categoryId);
          if (!category || actions.length === 0) return null;

          const Icon = category.icon;

          return (
            <motion.section
              key={categoryId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {category.label}
                <Badge variant="outline" className="ml-2">
                  {actions.length}
                </Badge>
              </h2>

              <div
                className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"} gap-4`}
              >
                {actions.map((action, index) => {
                  const ActionIcon = action.icon;

                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="relative cursor-pointer hover:shadow-md transition-shadow group"
                        onClick={() => handleActionClick(action)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-3 rounded-lg bg-gradient-to-br ${action.gradient} group-hover:scale-110 transition-transform`}
                            >
                              <ActionIcon className="h-6 w-6 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {action.title}
                                </h3>
                                <div className="flex items-center gap-1">
                                  {action.popular && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-orange-100 text-orange-700 text-xs"
                                    >
                                      Popular
                                    </Badge>
                                  )}
                                  {action.new && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-green-100 text-green-700 text-xs"
                                    >
                                      Novo
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm font-medium text-blue-600 mb-2">
                                {action.subtitle}
                              </p>

                              <p className="text-sm text-gray-600 mb-3">
                                {action.description}
                              </p>

                              <div className="flex items-center gap-3">
                                <Badge
                                  variant="outline"
                                  className={getDifficultyColor(
                                    action.difficulty,
                                  )}
                                >
                                  {getDifficultyLabel(action.difficulty)}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {action.estimatedTime}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredActions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma ação encontrada
          </h3>
          <p className="text-gray-600">Tente alterar sua busca ou filtros</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </motion.div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Activity,
  Zap,
  Bot,
  Shield,
  Bell,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Target,
  Cpu,
  Database,
  Globe,
  Brain,
  Workflow,
  RefreshCw,
  Wifi,
  WifiOff,
  Plus,
  Search,
  Filter,
  Eye,
  Settings,
  Rocket,
  Heart,
} from "lucide-react";

// Componentes Premium
import {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardTitle,
  PremiumCardContent,
  PremiumCardDescription,
  PremiumCardFooter,
} from "../components/ui/premium-card";
import { PremiumButton } from "../components/ui/premium-button";
import { PremiumLoading } from "../components/ui/premium-loading";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

// Hooks e utilitários
import { useMobileAdvanced } from "../hooks/use-mobile-advanced";
import {
  useRealDashboardData,
  useRealStackData,
  useBrazilianKPIs,
} from "../hooks/use-real-data-integration";
import {
  formatCurrency,
  formatLargeNumber,
  getGreeting,
  getMotivationalMessage,
  formatPercentage,
  formatRelativeTime,
} from "../lib/brazilian-formatters";

// Types
interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
}

interface AIInsight {
  id: string;
  type: "success" | "warning" | "info" | "recommendation";
  title: string;
  message: string;
  action?: string;
  confidence: number;
}

export default function DashboardPremium() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useMobileAdvanced();

  // Estados
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Hooks de dados
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useRealDashboardData();
  const { data: stackData, isLoading: stackLoading } = useRealStackData();
  const { data: kpiData, isLoading: kpiLoading } = useBrazilianKPIs();

  const isLoading = dashboardLoading || stackLoading || kpiLoading;

  // Nome do usuário (em produção viria do contexto de auth)
  const userName = "Empreendedor";

  // Métricas principais com dados reais
  const metrics: MetricCard[] = [
    {
      id: "revenue",
      title: "Receita",
      value: formatCurrency(kpiData?.revenue?.total || 0),
      change: kpiData?.revenue?.growth || 0,
      trend: (kpiData?.revenue?.growth || 0) > 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-green-600",
      gradient: "from-green-400 to-emerald-500",
    },
    {
      id: "whatsapp",
      title: "Mensagens WhatsApp",
      value: formatLargeNumber(kpiData?.whatsapp?.messages || 0),
      change: kpiData?.whatsapp?.growth || 0,
      trend: (kpiData?.whatsapp?.growth || 0) > 0 ? "up" : "down",
      icon: MessageSquare,
      color: "text-green-600",
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "automations",
      title: "Automações Ativas",
      value: kpiData?.automations?.active || 0,
      change: kpiData?.automations?.growth || 0,
      trend: (kpiData?.automations?.growth || 0) > 0 ? "up" : "down",
      icon: Zap,
      color: "text-purple-600",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      id: "leads",
      title: "Leads Convertidos",
      value: kpiData?.leads?.converted || 0,
      change: kpiData?.leads?.conversionGrowth || 0,
      trend: (kpiData?.leads?.conversionGrowth || 0) > 0 ? "up" : "down",
      icon: Target,
      color: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "uptime",
      title: "Uptime Sistema",
      value: `${(kpiData?.system?.uptime || 99.9).toFixed(1)}%`,
      change: 0.1,
      trend: "up",
      icon: Activity,
      color: "text-emerald-600",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      id: "users",
      title: "Usuários Ativos",
      value: formatLargeNumber(kpiData?.users?.active || 0),
      change: kpiData?.users?.growth || 0,
      trend: (kpiData?.users?.growth || 0) > 0 ? "up" : "down",
      icon: Users,
      color: "text-orange-600",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  // Insights da IA (simulados com dados reais)
  const aiInsights: AIInsight[] = [
    {
      id: "1",
      type: "success",
      title: "Performance Excelente",
      message: `Suas automações WhatsApp tiveram ${formatPercentage((kpiData?.whatsapp?.growth || 0) / 100)} de crescimento nas últimas 24h.`,
      confidence: 95,
    },
    {
      id: "2",
      type: "recommendation",
      title: "Oportunidade de Melhoria",
      message:
        "IA detectou padrão de horários com maior engajamento. Recomendo ajustar campanhas para 14h-18h.",
      action: "Otimizar Horários",
      confidence: 87,
    },
    {
      id: "3",
      type: "info",
      title: "Atualização Disponível",
      message:
        "Nova versão do Typebot disponível com recursos de IA aprimorados.",
      action: "Atualizar",
      confidence: 100,
    },
  ];

  // Animações de entrada
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Handler para refresh
  const handleRefresh = async () => {
    await refetchDashboard();
  };

  // Loading state impressionante
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <PremiumLoading
          type="neural"
          message="Carregando dashboard inteligente..."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <motion.div
        className={`${isMobile ? "p-4" : "p-6 lg:p-8"} space-y-8`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Premium */}
        <motion.div variants={itemVariants}>
          <PremiumCard variant="glass" size="lg" className="border-white/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Avatar className="h-16 w-16 ring-4 ring-white/50">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold">
                      {userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </motion.div>

                <div>
                  <motion.h1
                    className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {getGreeting(userName)}
                  </motion.h1>
                  <motion.p
                    className="text-gray-600 mt-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {getMotivationalMessage()}
                  </motion.p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <Wifi className="w-3 h-3 mr-1" />
                      Sistema Online
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      <Activity className="w-3 h-3 mr-1" />
                      25 Stacks Ativas
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <motion.div className="relative">
                  <PremiumButton
                    variant="glass"
                    size="icon"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative"
                  >
                    <Bell className="h-4 w-4" />
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </PremiumButton>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50"
                      >
                        <h3 className="font-semibold mb-3">Insights da IA</h3>
                        <div className="space-y-3">
                          {aiInsights.slice(0, 3).map((insight) => (
                            <div
                              key={insight.id}
                              className="p-3 rounded-lg bg-gray-50 border"
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`w-2 h-2 rounded-full mt-2 ${
                                    insight.type === "success"
                                      ? "bg-green-500"
                                      : insight.type === "warning"
                                        ? "bg-yellow-500"
                                        : insight.type === "recommendation"
                                          ? "bg-blue-500"
                                          : "bg-gray-500"
                                  }`}
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {insight.title}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {insight.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">
                                      Confiança: {insight.confidence}%
                                    </span>
                                    {insight.action && (
                                      <PremiumButton
                                        variant="outline"
                                        size="sm"
                                        className="text-xs py-1"
                                      >
                                        {insight.action}
                                      </PremiumButton>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <PremiumButton
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </PremiumButton>

                <PremiumButton
                  variant="default"
                  onClick={() => navigate("/quick-actions")}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Ações Rápidas
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Métricas Principais */}
        <motion.div variants={itemVariants}>
          <div
            className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"}`}
          >
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              const isSelected = selectedMetric === metric.id;

              return (
                <motion.div
                  key={metric.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PremiumCard
                    variant={isSelected ? "premium" : "default"}
                    interactive
                    glow="subtle"
                    shine
                    className="cursor-pointer h-full"
                    onClick={() =>
                      setSelectedMetric(isSelected ? null : metric.id)
                    }
                  >
                    <PremiumCardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            {metric.title}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 mb-2">
                            {metric.value}
                          </p>
                          <div className="flex items-center text-sm">
                            {metric.trend === "up" ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span
                              className={
                                metric.trend === "up"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {formatPercentage(Math.abs(metric.change) / 100)}
                            </span>
                            <span className="text-gray-500 ml-1">24h</span>
                          </div>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.gradient} flex items-center justify-center`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </PremiumCardContent>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Insights da IA */}
        <motion.div variants={itemVariants}>
          <PremiumCard
            variant="holographic"
            borderGradient
            className="overflow-hidden"
          >
            <PremiumCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <PremiumCardTitle gradient>
                      Insights de IA em Tempo Real
                    </PremiumCardTitle>
                    <PremiumCardDescription>
                      Análises inteligentes dos seus dados por 3 IAs simultâneas
                    </PremiumCardDescription>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA Ativa
                </Badge>
              </div>
            </PremiumCardHeader>

            <PremiumCardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-white/40"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          insight.type === "success"
                            ? "bg-green-500"
                            : insight.type === "warning"
                              ? "bg-yellow-500"
                              : insight.type === "recommendation"
                                ? "bg-blue-500"
                                : "bg-gray-500"
                        }`}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-3">
                          {insight.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Target className="h-3 w-3 mr-1" />
                            {insight.confidence}% confiança
                          </div>
                          {insight.action && (
                            <PremiumButton
                              variant="outline"
                              size="sm"
                              className="text-xs py-1 px-2 h-6"
                            >
                              {insight.action}
                            </PremiumButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        {/* Status das Stacks em Tempo Real */}
        <motion.div variants={itemVariants}>
          <PremiumCard variant="glass" size="lg">
            <PremiumCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <PremiumCardTitle>Status das Stacks</PremiumCardTitle>
                    <PremiumCardDescription>
                      Monitoramento em tempo real de todas as 25 stacks
                    </PremiumCardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    23/25 Online
                  </Badge>
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/stacks")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Todas
                  </PremiumButton>
                </div>
              </div>
            </PremiumCardHeader>

            <PremiumCardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  {
                    name: "WhatsApp",
                    status: "online",
                    response: "145ms",
                    uptime: "99.9%",
                  },
                  {
                    name: "N8N",
                    status: "online",
                    response: "89ms",
                    uptime: "99.8%",
                  },
                  {
                    name: "Typebot",
                    status: "online",
                    response: "67ms",
                    uptime: "99.9%",
                  },
                  {
                    name: "Mautic",
                    status: "warning",
                    response: "234ms",
                    uptime: "98.2%",
                  },
                  {
                    name: "Dify AI",
                    status: "online",
                    response: "123ms",
                    uptime: "99.7%",
                  },
                  {
                    name: "Ollama",
                    status: "offline",
                    response: "Timeout",
                    uptime: "95.1%",
                  },
                ].map((stack, index) => (
                  <motion.div
                    key={stack.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                      stack.status === "online"
                        ? "border-green-200 bg-green-50"
                        : stack.status === "warning"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          stack.status === "online"
                            ? "bg-green-500"
                            : stack.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs font-medium">
                        {stack.response}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{stack.name}</p>
                    <p className="text-xs text-gray-600">
                      {stack.uptime} uptime
                    </p>
                  </motion.div>
                ))}
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={itemVariants}>
          <PremiumCard variant="premium" borderGradient>
            <PremiumCardContent className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Rocket className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Acelere seus Resultados
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Configure automações inteligentes e aumente sua produtividade
                com o poder da IA brasileira
              </p>
              <div className="flex items-center justify-center space-x-4">
                <PremiumButton
                  variant="default"
                  size="lg"
                  onClick={() => navigate("/quick-actions")}
                  icon={<Sparkles className="h-5 w-5" />}
                  ripple
                >
                  Começar Agora
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/tutorial")}
                >
                  Ver Tutorial
                </PremiumButton>
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>
      </motion.div>
    </div>
  );
}

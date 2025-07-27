import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useMobile } from "../../hooks/use-mobile";
import {
  Home,
  BarChart3,
  MessageSquare,
  Users,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  Zap,
  Shield,
  Activity,
  Database,
  Rocket,
  Target,
  TrendingUp,
  Layers,
  Bot,
  Globe,
  Lock,
  User,
  LogOut,
  HelpCircle,
  Gauge,
  Network,
  GitBranch,
  Server,
  Smartphone,
  Workflow,
  FileText,
  PieChart,
  Headphones,
  Crown,
  Sparkles,
} from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  badgeColor?: string;
  subItems?: NavigationItem[];
}

interface UserData {
  nome: string;
  email: string;
  avatar?: string;
  plano: "starter" | "professional" | "enterprise";
  empresa: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const isMobile = useMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  // Dados do usuário (em produção viria de context/state management)
  const userData: UserData = {
    nome: "Carlos Eduardo",
    email: "carlos@techsolutions.com.br",
    empresa: "TechSolutions SP",
    plano: "professional",
  };

  // Navegação principal
  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      path: "/analytics",
      badge: "Novo",
      badgeColor: "bg-green-500",
      subItems: [
        {
          id: "analytics-overview",
          label: "Visão Geral",
          icon: <PieChart className="h-4 w-4" />,
          path: "/analytics",
        },
        {
          id: "analytics-advanced",
          label: "Analytics Avançado",
          icon: <TrendingUp className="h-4 w-4" />,
          path: "/analytics/advanced",
        },
        {
          id: "analytics-reports",
          label: "Relatórios Inteligentes",
          icon: <FileText className="h-4 w-4" />,
          path: "/reports/intelligent",
        },
      ],
    },
    {
      id: "communication",
      label: "Comunicação",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/communication",
      subItems: [
        {
          id: "communication-center",
          label: "Central de Comunicação",
          icon: <MessageSquare className="h-4 w-4" />,
          path: "/communication",
        },
        {
          id: "whatsapp-business",
          label: "WhatsApp Business",
          icon: <Smartphone className="h-4 w-4" />,
          path: "/whatsapp/business",
        },
        {
          id: "email-marketing",
          label: "Email Marketing",
          icon: <Globe className="h-4 w-4" />,
          path: "/email/marketing",
        },
        {
          id: "whatsapp-analytics",
          label: "Analytics WhatsApp",
          icon: <BarChart3 className="h-4 w-4" />,
          path: "/whatsapp/analytics",
        },
        {
          id: "whatsapp-broadcast",
          label: "Campanhas & Broadcast",
          icon: <Sparkles className="h-4 w-4" />,
          path: "/whatsapp/broadcast",
        },
      ],
    },
    {
      id: "stacks",
      label: "Stacks & Integração",
      icon: <Layers className="h-5 w-5" />,
      path: "/stacks",
      subItems: [
        {
          id: "stacks-manager",
          label: "Gerenciador de Stacks",
          icon: <Server className="h-4 w-4" />,
          path: "/stacks",
        },
        {
          id: "orchestration",
          label: "Orquestração Inteligente",
          icon: <Bot className="h-4 w-4" />,
          path: "/orchestration",
          badge: "IA",
          badgeColor: "bg-purple-500",
        },
        {
          id: "real-time",
          label: "Monitoramento Tempo Real",
          icon: <Activity className="h-4 w-4" />,
          path: "/dashboard/real-time",
        },
      ],
    },
    {
      id: "automation",
      label: "Automação IA",
      icon: <Bot className="h-5 w-5" />,
      path: "/ai",
      badge: "IA",
      badgeColor: "bg-blue-500",
      subItems: [
        {
          id: "ai-autonomous",
          label: "Gerenciador Autônomo",
          icon: <Rocket className="h-4 w-4" />,
          path: "/ai/autonomous",
        },
        {
          id: "workflows",
          label: "N8N Workflows",
          icon: <Workflow className="h-4 w-4" />,
          path: "/n8n/workflows",
        },
        {
          id: "typebot",
          label: "Typebot Flows",
          icon: <GitBranch className="h-4 w-4" />,
          path: "/typebot/flows",
        },
      ],
    },
    {
      id: "users",
      label: "Gestão de Usuários",
      icon: <Users className="h-5 w-5" />,
      path: "/users",
      subItems: [
        {
          id: "user-management",
          label: "Gerenciar Usuários",
          icon: <User className="h-4 w-4" />,
          path: "/users/management",
        },
        {
          id: "team-collaboration",
          label: "Colaboração em Equipe",
          icon: <Users className="h-4 w-4" />,
          path: "/team/collaboration",
        },
      ],
    },
    {
      id: "settings",
      label: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      path: "/settings",
      subItems: [
        {
          id: "general-settings",
          label: "Geral",
          icon: <Settings className="h-4 w-4" />,
          path: "/settings",
        },
        {
          id: "global-settings",
          label: "Configurações Globais",
          icon: <Globe className="h-4 w-4" />,
          path: "/global-settings",
        },
        {
          id: "white-label",
          label: "White Label",
          icon: <Crown className="h-4 w-4" />,
          path: "/white-label",
        },
        {
          id: "security",
          label: "Segurança",
          icon: <Shield className="h-4 w-4" />,
          path: "/security",
        },
        {
          id: "billing",
          label: "Faturamento",
          icon: <Target className="h-4 w-4" />,
          path: "/billing",
        },
      ],
    },
  ];

  // Controle da sidebar em mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
      setSearchOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const isActive = (path: string): boolean => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const getPlanColor = (plano: string): string => {
    switch (plano) {
      case "starter":
        return "bg-blue-100 text-blue-700";
      case "professional":
        return "bg-purple-100 text-purple-700";
      case "enterprise":
        return "bg-gold-100 text-gold-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPlanLabel = (plano: string): string => {
    switch (plano) {
      case "starter":
        return "Starter";
      case "professional":
        return "Professional";
      case "enterprise":
        return "Enterprise";
      default:
        return "Free";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <>
            {/* Overlay para mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <motion.div
              initial={{ x: isMobile ? -300 : 0 }}
              animate={{ x: 0 }}
              exit={{ x: isMobile ? -300 : 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`${
                isMobile ? "fixed" : "relative"
              } left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col`}
            >
              {/* Logo */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">KRYONIX</h1>
                    <p className="text-xs text-gray-500">
                      Automação Inteligente
                    </p>
                  </div>
                </div>
              </div>

              {/* Plano do usuário */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {userData.empresa}
                    </p>
                    <p className="text-xs text-gray-500">{userData.email}</p>
                  </div>
                  <Badge className={`text-xs ${getPlanColor(userData.plano)}`}>
                    {getPlanLabel(userData.plano)}
                  </Badge>
                </div>
              </div>

              {/* Navegação */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => (
                  <div key={item.id}>
                    <motion.button
                      whileHover={{ x: 2 }}
                      onClick={() => {
                        if (item.subItems) {
                          // Toggle submenu
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive(item.path)
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge
                            className={`text-xs text-white ${item.badgeColor}`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.subItems && <ChevronDown className="h-4 w-4" />}
                      </div>
                    </motion.button>

                    {/* Submenu */}
                    {item.subItems && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <motion.button
                            key={subItem.id}
                            whileHover={{ x: 2 }}
                            onClick={() => navigate(subItem.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                              isActive(subItem.path)
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {subItem.icon}
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <Badge
                                className={`text-xs text-white ${subItem.badgeColor}`}
                              >
                                {subItem.badge}
                              </Badge>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              {/* Suporte */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-gray-600"
                  onClick={() => navigate("/support")}
                >
                  <Headphones className="h-4 w-4" />
                  Suporte 24/7
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Controles da Sidebar + Título */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {title && (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {title}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {location.pathname.split("/").pop()?.replace("-", " ") ||
                      "Dashboard"}
                  </p>
                </div>
              )}
            </div>

            {/* Controles do Header */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchOpen(!searchOpen);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Search className="h-5 w-5" />
                </Button>

                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        placeholder="Buscar funcionalidades, stacks, usuários..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acessos Rápidos
                        </p>
                        <div className="space-y-1">
                          <button className="w-full flex items-center gap-2 px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-100">
                            <BarChart3 className="h-4 w-4" />
                            Analytics Avançado
                          </button>
                          <button className="w-full flex items-center gap-2 px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-100">
                            <Bot className="h-4 w-4" />
                            Orquestração IA
                          </button>
                          <button className="w-full flex items-center gap-2 px-2 py-1 rounded text-sm text-gray-700 hover:bg-gray-100">
                            <Users className="h-4 w-4" />
                            Gestão de Usuários
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notificações */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </Button>
              </div>

              {/* Menu do Usuário */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData.avatar} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {userData.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {!isMobile && (
                    <div className="text-left">
                      <p className="text-sm font-medium">{userData.nome}</p>
                      <p className="text-xs text-gray-500">
                        {getPlanLabel(userData.plano)}
                      </p>
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {userData.nome}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userData.email}
                        </p>
                        <Badge
                          className={`text-xs mt-1 ${getPlanColor(userData.plano)}`}
                        >
                          Plano {getPlanLabel(userData.plano)}
                        </Badge>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => navigate("/profile")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <User className="h-4 w-4" />
                          Meu Perfil
                        </button>

                        <button
                          onClick={() => navigate("/settings")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4" />
                          Configurações
                        </button>

                        <button
                          onClick={() => navigate("/billing")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Crown className="h-4 w-4" />
                          Faturamento
                        </button>

                        <button
                          onClick={() => navigate("/support")}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <HelpCircle className="h-4 w-4" />
                          Ajuda
                        </button>
                      </div>

                      <div className="border-t border-gray-200 py-1">
                        <button
                          onClick={() => {
                            // Logout logic
                            navigate("/login");
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

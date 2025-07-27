import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Settings,
  CreditCard,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Home,
  Cog,
  MessageSquare,
  Zap,
  Bot,
  Layers,
  Shield,
  Sparkles,
  Activity,
  Database,
  Workflow,
  Users,
  TrendingUp,
  Crown,
  Globe,
  Smartphone,
  Target,
  Search,
  HelpCircle,
  Plus,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { useUser, useLogout, useNotifications } from "../../hooks/use-api";
import { useMobileAdvanced } from "../../hooks/use-mobile-advanced";
import { KryonixLogoPremium } from "../brand/KryonixLogoPremium";
import MobileLayout from "../mobile/MobileLayout";
import { cn } from "@/lib/utils";

interface KryonixAppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  description?: string;
  subItems?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Visão geral da plataforma",
  },
  {
    id: "analytics",
    name: "Analytics Avançado",
    href: "/analytics",
    icon: BarChart3,
    badge: "IA",
    badgeVariant: "secondary",
    description: "Métricas e insights inteligentes",
    subItems: [
      {
        id: "analytics-overview",
        name: "Visão Geral",
        href: "/analytics",
        icon: TrendingUp,
      },
      {
        id: "analytics-advanced",
        name: "Analytics IA",
        href: "/analytics/advanced",
        icon: Bot,
      },
      {
        id: "analytics-reports",
        name: "Relatórios",
        href: "/analytics/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "communication",
    name: "Comunicação",
    href: "/communication",
    icon: MessageSquare,
    description: "Central de comunicação unificada",
    subItems: [
      {
        id: "whatsapp",
        name: "WhatsApp Business",
        href: "/whatsapp",
        icon: Smartphone,
      },
      { id: "email", name: "Email Marketing", href: "/email", icon: Globe },
      { id: "campaigns", name: "Campanhas", href: "/campaigns", icon: Target },
    ],
  },
  {
    id: "automation",
    name: "Automação IA",
    href: "/automation",
    icon: Bot,
    badge: "Novo",
    badgeVariant: "default",
    description: "Automação inteligente com IA",
    subItems: [
      { id: "ai-autonomous", name: "IA Autônoma", href: "/ai", icon: Sparkles },
      {
        id: "workflows",
        name: "N8N Workflows",
        href: "/workflows",
        icon: Workflow,
      },
      {
        id: "typebot",
        name: "Typebot Flows",
        href: "/typebot",
        icon: MessageSquare,
      },
    ],
  },
  {
    id: "stacks",
    name: "Stacks & Integração",
    href: "/stacks",
    icon: Layers,
    description: "Gerenciamento das 25 stacks",
    subItems: [
      {
        id: "stack-manager",
        name: "Gerenciador",
        href: "/stacks",
        icon: Database,
      },
      {
        id: "monitoring",
        name: "Monitoramento",
        href: "/monitoring",
        icon: Activity,
      },
      {
        id: "orchestration",
        name: "Orquestração",
        href: "/orchestration",
        icon: Zap,
      },
    ],
  },
  {
    id: "users",
    name: "Usuários",
    href: "/users",
    icon: Users,
    description: "Gestão de usuários e equipes",
  },
  {
    id: "settings",
    name: "Configurações",
    href: "/settings",
    icon: Settings,
    description: "Configurações da plataforma",
    subItems: [
      { id: "general", name: "Geral", href: "/settings", icon: Cog },
      { id: "security", name: "Segurança", href: "/security", icon: Shield },
      {
        id: "billing",
        name: "Faturamento",
        href: "/billing",
        icon: CreditCard,
      },
      {
        id: "white-label",
        name: "White Label",
        href: "/white-label",
        icon: Crown,
      },
    ],
  },
];

export default function KryonixAppLayout({
  children,
  title,
  subtitle,
}: KryonixAppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  const { data: user, isLoading: userLoading } = useUser();
  const { data: notificationsData } = useNotifications({ status: "pending" });
  const logoutMutation = useLogout();
  const { isMobile, isTablet } = useMobileAdvanced();

  const unreadCount = notificationsData?.notifications.length || 0;

  useEffect(() => {
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
      setIsSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActiveRoute = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  const toggleExpandedItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const filteredNavigation = navigationItems.filter(
    (item) =>
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <KryonixLogoPremium
          variant="hero"
          size="xl"
          theme="gradient"
          animated
          glowEffect
          pulseEffect
          particleEffect
        />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  // Layout mobile
  if (isMobile || isTablet) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
      {/* Sidebar Premium */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "relative flex-shrink-0 transition-all duration-300",
              isSidebarCollapsed ? "w-20" : "w-72",
            )}
          >
            <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-xl">
              {/* Header da Sidebar */}
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <motion.div
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <KryonixLogoPremium
                      variant={isSidebarCollapsed ? "icon" : "horizontal"}
                      size="md"
                      theme="gradient"
                      animated
                      glowEffect
                      onClick={() => navigate("/dashboard")}
                    />
                  </motion.div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isSidebarCollapsed ? (
                        <Maximize2 className="w-4 h-4" />
                      ) : (
                        <Minimize2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar funcionalidades..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/50 border-gray-200/50 focus:bg-white transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Status do Usuário */}
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-blue-500/20">
                      <AvatarImage src={user.profile?.avatar || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      Online
                    </Badge>
                  </div>
                </motion.div>
              )}

              {/* Navegação Principal */}
              <nav className="flex-1 px-4 py-4 overflow-y-auto">
                <div className="space-y-1">
                  {filteredNavigation.map((item, index) => {
                    const isActive = isActiveRoute(item.href);
                    const isExpanded = expandedItems.includes(item.id);
                    const hasSubItems =
                      item.subItems && item.subItems.length > 0;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <motion.button
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group",
                            "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50",
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                              : "text-gray-700 hover:text-gray-900",
                          )}
                          onClick={() => {
                            if (hasSubItems) {
                              toggleExpandedItem(item.id);
                            } else {
                              navigate(item.href);
                            }
                          }}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                              isActive
                                ? "bg-white/20"
                                : "bg-gray-100 group-hover:bg-white group-hover:shadow-sm",
                            )}
                          >
                            <item.icon
                              className={cn(
                                "w-4 h-4",
                                isActive
                                  ? "text-white"
                                  : "text-gray-600 group-hover:text-blue-600",
                              )}
                            />
                          </div>

                          {!isSidebarCollapsed && (
                            <>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {item.name}
                                  </span>
                                  {item.badge && (
                                    <Badge
                                      variant={item.badgeVariant || "default"}
                                      className="text-xs"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <p
                                    className={cn(
                                      "text-xs truncate",
                                      isActive
                                        ? "text-white/80"
                                        : "text-gray-500",
                                    )}
                                  >
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              {hasSubItems && (
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown
                                    className={cn(
                                      "w-4 h-4",
                                      isActive ? "text-white" : "text-gray-400",
                                    )}
                                  />
                                </motion.div>
                              )}
                            </>
                          )}
                        </motion.button>

                        {/* Submenu */}
                        <AnimatePresence>
                          {hasSubItems && isExpanded && !isSidebarCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-11 mt-1 space-y-1 overflow-hidden"
                            >
                              {item.subItems!.map((subItem) => {
                                const isSubActive = isActiveRoute(subItem.href);
                                return (
                                  <motion.button
                                    key={subItem.id}
                                    className={cn(
                                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                                      isSubActive
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                                    )}
                                    onClick={() => navigate(subItem.href)}
                                    whileHover={{ x: 4 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <subItem.icon className="w-4 h-4" />
                                    <span>{subItem.name}</span>
                                  </motion.button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Footer da Sidebar */}
              <div className="p-4 border-t border-gray-200/50">
                {!isSidebarCollapsed && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 mb-3 bg-white/50 hover:bg-white"
                    onClick={() => navigate("/support")}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Suporte 24/7
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-2 text-gray-600 hover:text-gray-900",
                        isSidebarCollapsed
                          ? "w-12 h-12 p-0"
                          : "w-full justify-start p-2",
                      )}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profile?.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {!isSidebarCollapsed && (
                        <>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              Configurações
                            </p>
                          </div>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="w-4 h-4 mr-2" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Cog className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Premium */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Controles da sidebar + Título */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </Button>

                {(title || subtitle) && (
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {title || "KRYONIX"}
                      </h1>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        Pro
                      </Badge>
                    </div>
                    {subtitle && (
                      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Controles do header */}
              <div className="flex items-center gap-3">
                {/* Busca rápida */}
                <div className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Busca rápida..."
                      className="pl-10 w-64 bg-white/50 border-gray-200/50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Notificações */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </motion.div>
                    )}
                  </Button>
                </motion.div>

                {/* Ações rápidas */}
                <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate("/workflows/new")}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Novo Workflow</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

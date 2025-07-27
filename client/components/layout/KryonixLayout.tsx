import React, { useState, useEffect } from "react";
import { KryonixLogo } from "../brand/KryonixLogo";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  BarChart3,
  Settings,
  MessageSquare,
  Zap,
  CreditCard,
  Menu,
  X,
  Bell,
  User,
  Search,
  Bot,
  TrendingUp,
  Shield,
  Users,
  Building2,
  Smartphone,
  Globe,
  LogOut,
  ChevronDown,
  Server,
  MessageCircle,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface KryonixLayoutProps {
  children: React.ReactNode;
}

// Navegação principal com rotas reais
const mainNavigation = [
  {
    title: "Painel de Controle",
    href: "/dashboard",
    icon: Home,
    badge: null,
    description: "Visão geral da plataforma",
  },
  {
    title: "Stacks Manager",
    href: "/stacks",
    icon: Server,
    badge: "Novo",
    description: "Gerenciar 25 stacks da plataforma",
  },
  {
    title: "Dashboard Tempo Real",
    href: "/dashboard/real-time",
    icon: Activity,
    badge: "Live",
    description: "Monitoramento em tempo real",
  },
  {
    title: "WhatsApp",
    href: "/whatsapp",
    icon: MessageCircle,
    badge: "Ativo",
    description: "Automação e broadcasts",
  },
  {
    title: "Chatbots IA",
    href: "/typebot",
    icon: Bot,
    badge: "Beta",
    description: "Assistentes inteligentes",
  },
  {
    title: "IA Autônoma",
    href: "/ai/autonomous",
    icon: Bot,
    badge: "GPT-4o",
    description: "Sistema inteligente de configuração",
  },
  {
    title: "Automações",
    href: "/n8n",
    icon: Zap,
    badge: null,
    description: "Workflows e integrações",
  },
  {
    title: "Analytics Avançado",
    href: "/analytics/advanced",
    icon: BarChart3,
    badge: "IA",
    description: "Análises brasileiras com IA",
  },
  {
    title: "Relatórios Inteligentes",
    href: "/reports/intelligent",
    icon: TrendingUp,
    badge: "Novo",
    description: "Relatórios automáticos com GPT-4o",
  },
  {
    title: "Planos & Cobrança",
    href: "/billing",
    icon: CreditCard,
    badge: null,
    description: "Gestão financeira",
  },
];

// Navegação secundária
const secondaryNavigation = [
  {
    title: "Configurações Globais",
    href: "/global-settings",
    icon: Settings,
    description: "Configurar stacks e serviços",
  },
  {
    title: "Usuários & Equipe",
    href: "/users/management",
    icon: Users,
    description: "Gerenciar acessos",
  },
  {
    title: "Colaboração em Equipe",
    href: "/team/collaboration",
    icon: MessageCircle,
    description: "Chat e projetos",
  },
  {
    title: "White Label",
    href: "/white-label",
    icon: Building2,
    description: "Personalização da marca",
  },
  {
    title: "Segurança",
    href: "/security",
    icon: Shield,
    description: "Logs e auditoria",
  },
];

function KryonixLayout({ children }: KryonixLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fechar menu mobile ao navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Função para verificar se a rota está ativa
  const isActiveRoute = (href: string) => {
    if (href === "/dashboard" && location.pathname === "/") return true;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      {/* Header Mobile & Desktop */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo e Menu Mobile */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>

              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                <KryonixLogo
                  variant="compact"
                  size="md"
                  theme="gradient"
                  animated
                  className="hover:scale-105 transition-transform duration-200"
                />
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500">
                    Plataforma Autônoma com IA
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de Busca - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar funcionalidades, configurações..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100/80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Status e Ações */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Status Online/Offline */}
              <div className="hidden sm:flex items-center space-x-2">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isOnline ? "bg-success-500" : "bg-error-500",
                  )}
                ></div>
                <span className="text-xs text-gray-600">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>

              {/* Notificações */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-error-500 text-white text-xs">
                  3
                </Badge>
              </Button>

              {/* Menu do Usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 p-2"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-kryonix-blue/20">
                      <AvatarImage src="https://cdn.builder.io/api/v1/image/assets%2Ff3c03838ba934db3a83fe16fb45b6ea7%2F87344dc399db4250bef1180e4c9b1b76?format=webp&width=800" />
                      <AvatarFallback className="bg-gradient-to-r from-kryonix-blue to-kryonix-green text-white font-semibold">
                        VF
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium">Vitor Fernandes</p>
                      <p className="text-xs text-gray-500">CEO KRYONIX</p>
                    </div>
                    <ChevronDown className="h-4 w-4 hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/billing")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Planos & Cobrança
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-error-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:block fixed left-0 top-20 bottom-0 w-72 bg-white/80 backdrop-blur-md border-r border-gray-200/50 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Navegação Principal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Principal
            </h3>
            <nav className="space-y-2">
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);

                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 group",
                      isActive
                        ? "bg-primary-500 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-primary-600",
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive
                            ? "text-white"
                            : "text-gray-500 group-hover:text-primary-600",
                        )}
                      />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p
                          className={cn(
                            "text-xs",
                            isActive ? "text-primary-100" : "text-gray-500",
                          )}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {item.badge && (
                      <Badge
                        variant={isActive ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Navegação Secundária */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Configurações
            </h3>
            <nav className="space-y-2">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);

                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 group",
                      isActive
                        ? "bg-primary-500 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:text-primary-600",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-primary-600",
                      )}
                    />
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p
                        className={cn(
                          "text-xs",
                          isActive ? "text-primary-100" : "text-gray-500",
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Status da Plataforma */}
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 border border-primary-200/50">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                Status do Sistema
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Servidor:</span>
                <span className="text-success-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">APIs:</span>
                <span className="text-success-600 font-medium">Ativas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stacks:</span>
                <span className="text-primary-600 font-medium">23/25</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Menu Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative flex flex-col w-80 max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">K</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">KRYONIX</h2>
                  <p className="text-xs text-gray-500">Menu Principal</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Busca Mobile */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Navegação Mobile */}
              <nav className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Principal
                  </h3>
                  <div className="space-y-1">
                    {mainNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);

                      return (
                        <button
                          key={item.href}
                          onClick={() => navigate(item.href)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200",
                            isActive
                              ? "bg-primary-500 text-white"
                              : "text-gray-700 hover:bg-gray-100",
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge
                              variant={isActive ? "secondary" : "default"}
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Configurações
                  </h3>
                  <div className="space-y-1">
                    {secondaryNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);

                      return (
                        <button
                          key={item.href}
                          onClick={() => navigate(item.href)}
                          className={cn(
                            "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200",
                            isActive
                              ? "bg-primary-500 text-white"
                              : "text-gray-700 hover:bg-gray-100",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </div>

            {/* Footer Mobile */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary-500 text-white font-semibold">
                    VF
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">Vitor Fernandes</p>
                  <p className="text-sm text-gray-500">vitor@kryonix.com.br</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-error-600 hover:text-error-700 hover:bg-error-50"
                onClick={() => {
                  /* TODO: Implementar logout */
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair da Plataforma
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main
        className={cn("transition-all duration-200", "lg:ml-72 lg:pt-0 pt-0")}
      >
        <div className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-5rem)]">
          {children}
        </div>
      </main>

      {/* Navegação Mobile Bottom */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200/50 z-30">
        <div className="grid grid-cols-5 h-16">
          {mainNavigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-all duration-200",
                  isActive
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-primary-600",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium truncate">
                  {item.title.split(" ")[0]}
                </span>
                {item.badge && (
                  <div className="absolute top-2 right-1/2 transform translate-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Espaçamento para navegação mobile */}
      <div className="lg:hidden h-16"></div>
    </div>
  );
}

export { KryonixLayout };
export default KryonixLayout;

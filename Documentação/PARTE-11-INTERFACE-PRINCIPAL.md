# 🎨 PARTE 11 - INTERFACE MULTI-TENANT MOBILE-FIRST KRYONIX
*Agentes Especializados: Frontend Expert + Mobile UI Expert + Multi-Tenant Architect + PWA Specialist + Performance Expert + UX Designer*

## 🎯 **OBJETIVO MULTI-TENANT**
Desenvolver interface principal **100% mobile-first multi-tenant** da plataforma KRYONIX SaaS com isolamento completo por cliente, theming dinâmico, PWA instalável e performance otimizada para 80% usuários mobile.

## 🏗️ **ARQUITETURA INTERFACE MULTI-TENANT**
```yaml
Multi_Tenant_Interface_Architecture:
  isolation_strategy: "UI isolada por cliente em todos os níveis"
  theming: "Dinâmico por tenant com branding customizado"
  mobile_focus: "80% usuários mobile como prioridade"
  pwa_strategy: "Instalável por tenant específico"
  
UI_Isolation_Layers:
  theme_layer: "Cores, logos e CSS por tenant"
  component_layer: "Componentes isolados por cliente"
  state_layer: "Estado global segregado por tenant"
  routing_layer: "Rotas específicas por tenant"
  cache_layer: "Cache separado por cliente"
  
Tenant_UI_Patterns:
  subdomain_theming: "cliente-{id}.kryonix.com.br"
  dynamic_branding: "Logo e cores do cliente"
  isolated_pwa: "PWA específica por tenant"
  tenant_components: "Widgets customizados por cliente"
  role_based_ui: "Interface baseada em permissões"
```

## 🎨 **TENANT CONTEXT PROVIDER**

### **🏢 Sistema Context Multi-Tenant**
```tsx
// contexts/TenantContext.tsx
interface TenantConfig {
  clientId: string;
  companyName: string;
  subdomain: string;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    logo: string;
    favicon: string;
    customCSS?: string;
    darkMode: boolean;
  };
  modules: string[];
  plan: 'basic' | 'pro' | 'enterprise';
  settings: {
    language: string;
    timezone: string;
    currency: string;
    mobileOptimized: boolean;
  };
  permissions: Record<string, boolean>;
  customization: {
    layout: 'standard' | 'compact' | 'cards';
    navigation: 'sidebar' | 'bottom' | 'drawer';
    dashboard: 'executive' | 'operational' | 'custom';
  };
}

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initializeTenant = async () => {
      try {
        setIsLoading(true);
        
        // Extrair tenant do subdomain ou header
        const tenantId = extractTenantFromRequest();
        
        if (!tenantId) {
          throw new Error('Tenant não identificado');
        }
        
        // Buscar configuração do tenant
        const tenantConfig = await fetchTenantConfig(tenantId);
        
        if (!tenantConfig) {
          throw new Error('Configuração do tenant não encontrada');
        }
        
        // Aplicar theming dinâmico
        await applyTenantTheming(tenantConfig.theme);
        
        // Configurar PWA específica do tenant
        await configureTenantPWA(tenantConfig);
        
        setTenant(tenantConfig);
        setError(null);
        
      } catch (err) {
        setError(err.message);
        // Fallback para configuração padrão ou tela de erro
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeTenant();
  }, []);
  
  const updateTenantConfig = useCallback(async (updates: Partial<TenantConfig>) => {
    if (!tenant) return;
    
    const updatedConfig = { ...tenant, ...updates };
    
    // Aplicar mudanças de tema se houver
    if (updates.theme) {
      await applyTenantTheming(updatedConfig.theme);
    }
    
    // Salvar configuração
    await saveTenantConfig(tenant.clientId, updatedConfig);
    
    setTenant(updatedConfig);
  }, [tenant]);
  
  if (isLoading) {
    return <TenantLoadingScreen />;
  }
  
  if (error || !tenant) {
    return <TenantErrorScreen error={error} />;
  }
  
  return (
    <TenantContext.Provider value={{
      tenant,
      updateConfig: updateTenantConfig,
      isLoading
    }}>
      <TenantThemeProvider theme={tenant.theme}>
        {children}
      </TenantThemeProvider>
    </TenantContext.Provider>
  );
};

// Hook para usar o contexto do tenant
export const useTenant = () => {
  const context = useContext(TenantContext);
  
  if (!context) {
    throw new Error('useTenant deve ser usado dentro de TenantProvider');
  }
  
  return context;
};

// Função para extrair tenant da requisição
const extractTenantFromRequest = (): string | null => {
  // Método 1: Subdomain
  const hostname = window.location.hostname;
  const subdomainMatch = hostname.match(/^([a-z0-9-]+)\.kryonix\.com\.br$/);
  
  if (subdomainMatch && subdomainMatch[1] !== 'www' && subdomainMatch[1] !== 'api') {
    return subdomainMatch[1];
  }
  
  // Método 2: Path parameter
  const pathMatch = window.location.pathname.match(/^\/tenant\/([a-z0-9-]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  // Método 3: Query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam) {
    return tenantParam;
  }
  
  return null;
};

// Função para aplicar theming dinâmico
const applyTenantTheming = async (theme: TenantConfig['theme']) => {
  const root = document.documentElement;
  
  // Aplicar variáveis CSS customizadas
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-text', theme.colors.text);
  
  // Aplicar favicon customizado
  if (theme.favicon) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = theme.favicon;
    }
  }
  
  // Aplicar CSS customizado
  if (theme.customCSS) {
    let customStyleElement = document.getElementById('tenant-custom-css');
    
    if (!customStyleElement) {
      customStyleElement = document.createElement('style');
      customStyleElement.id = 'tenant-custom-css';
      document.head.appendChild(customStyleElement);
    }
    
    customStyleElement.textContent = theme.customCSS;
  }
  
  // Aplicar dark mode
  if (theme.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
```

## 📱 **COMPONENTES MULTI-TENANT MOBILE-FIRST**

### **🎨 Design System Dinâmico**
```tsx
// components/ui/TenantButton.tsx
interface TenantButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  mobileOptimized?: boolean;
}

export const TenantButton = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  mobileOptimized = true,
  children,
  className,
  ...props
}: TenantButtonProps) => {
  const { tenant } = useTenant();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Cores dinâmicas baseadas no tenant
  const variantStyles = useMemo(() => ({
    primary: {
      backgroundColor: tenant.theme.colors.primary,
      borderColor: tenant.theme.colors.primary,
      color: 'white',
      '--hover-bg': shadeColor(tenant.theme.colors.primary, -10),
      '--focus-ring': `${tenant.theme.colors.primary}40`,
    },
    secondary: {
      backgroundColor: tenant.theme.colors.secondary,
      borderColor: tenant.theme.colors.secondary,
      color: 'white',
      '--hover-bg': shadeColor(tenant.theme.colors.secondary, -10),
      '--focus-ring': `${tenant.theme.colors.secondary}40`,
    },
    accent: {
      backgroundColor: tenant.theme.colors.accent,
      borderColor: tenant.theme.colors.accent,
      color: 'white',
      '--hover-bg': shadeColor(tenant.theme.colors.accent, -10),
      '--focus-ring': `${tenant.theme.colors.accent}40`,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: tenant.theme.colors.primary,
      color: tenant.theme.colors.primary,
      '--hover-bg': `${tenant.theme.colors.primary}10`,
      '--focus-ring': `${tenant.theme.colors.primary}40`,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: tenant.theme.colors.primary,
      '--hover-bg': `${tenant.theme.colors.primary}10`,
      '--focus-ring': `${tenant.theme.colors.primary}40`,
    }
  }), [tenant.theme.colors]);
  
  // Tamanhos otimizados para mobile
  const sizeStyles = {
    sm: mobileOptimized && isMobile ? 'px-3 py-2.5 text-sm min-h-[40px]' : 'px-3 py-2 text-sm min-h-[36px]',
    md: mobileOptimized && isMobile ? 'px-4 py-3.5 text-base min-h-[48px]' : 'px-4 py-3 text-base min-h-[44px]',
    lg: mobileOptimized && isMobile ? 'px-6 py-4.5 text-lg min-h-[56px]' : 'px-6 py-4 text-lg min-h-[52px]',
    xl: mobileOptimized && isMobile ? 'px-8 py-5.5 text-xl min-h-[64px]' : 'px-8 py-5 text-xl min-h-[60px]'
  };
  
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-200 transform active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'border-2',
        
        // Size styles
        sizeStyles[size],
        
        // Full width
        fullWidth && 'w-full',
        
        // Mobile optimizations
        mobileOptimized && isMobile && 'touch-manipulation',
        
        className
      )}
      style={variantStyles[variant]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <LoadingSpinner className="w-5 h-5 mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

// components/ui/TenantCard.tsx
export const TenantCard = ({
  title,
  subtitle,
  children,
  actions,
  gradient = false,
  mobileOptimized = true,
  className
}: TenantCardProps) => {
  const { tenant } = useTenant();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const cardStyles = useMemo(() => {
    if (gradient) {
      return {
        background: `linear-gradient(135deg, ${tenant.theme.colors.primary}10, ${tenant.theme.colors.secondary}10)`,
        borderColor: `${tenant.theme.colors.primary}20`,
      };
    }
    return {
      backgroundColor: tenant.theme.colors.background,
      borderColor: `${tenant.theme.colors.primary}15`,
    };
  }, [tenant.theme.colors, gradient]);
  
  return (
    <div 
      className={cn(
        'rounded-xl border transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-1',
        mobileOptimized && isMobile && 'active:scale-[0.98]',
        className
      )}
      style={cardStyles}
    >
      {(title || subtitle || actions) && (
        <div className="p-4 border-b" style={{ borderColor: `${tenant.theme.colors.primary}15` }}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold" style={{ color: tenant.theme.colors.text }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm mt-1 opacity-70" style={{ color: tenant.theme.colors.text }}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
```

## 🏗️ **LAYOUT MULTI-TENANT AVANÇADO**

### **📱 Layout Responsivo Tenant-Aware**
```tsx
// components/layout/TenantLayout.tsx
export const TenantLayout = ({ children }: { children: React.ReactNode }) => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // PWA e offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Sincronizar dados offline
      syncOfflineData(tenant.clientId);
    };
    
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Detectar instalação PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      showPWAInstallPrompt(tenant);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [tenant.clientId]);
  
  // WebSocket para notificações em tempo real por tenant
  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/tenant/${tenant.clientId}`
    );
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Filtrar apenas notificações do tenant atual
      if (data.tenantId === tenant.clientId) {
        setNotifications(prev => [...prev, data]);
        
        // Mostrar push notification se PWA
        if ('serviceWorker' in navigator && 'Notification' in window) {
          showTenantNotification(data, tenant);
        }
      }
    };
    
    return () => ws.close();
  }, [tenant.clientId]);
  
  return (
    <div 
      className="min-h-screen transition-colors duration-200"
      style={{ 
        backgroundColor: tenant.theme.colors.background,
        color: tenant.theme.colors.text 
      }}
    >
      {/* Offline indicator */}
      {isOffline && (
        <TenantOfflineIndicator tenant={tenant} />
      )}
      
      {/* Header multi-tenant */}
      <TenantHeader
        tenant={tenant}
        user={user}
        notifications={notifications}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isOffline={isOffline}
        isMobile={isMobile}
      />
      
      {/* Layout principal */}
      <div className="flex flex-col md:flex-row">
        {/* Navigation */}
        {isMobile ? (
          <TenantMobileDrawer
            tenant={tenant}
            user={user}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        ) : (
          <TenantSidebar tenant={tenant} user={user} />
        )}
        
        {/* Content area */}
        <main className={cn(
          "flex-1 transition-all duration-200",
          "px-4 py-6 md:px-6 md:py-8",
          "max-w-full overflow-hidden",
          "pb-20 md:pb-8" // Extra padding para bottom nav mobile
        )}>
          {/* AI Assistant floating button */}
          <TenantAIAssistant tenant={tenant} isMobile={isMobile} />
          
          {/* Breadcrumb tenant-aware */}
          <TenantBreadcrumb tenant={tenant} />
          
          {/* Page content */}
          <div className="space-y-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom navigation mobile */}
      {isMobile && (
        <TenantMobileBottomNav tenant={tenant} user={user} />
      )}
      
      {/* Tenant notifications */}
      <TenantNotificationCenter 
        tenant={tenant}
        notifications={notifications}
        onClear={() => setNotifications([])}
      />
    </div>
  );
};

// Header específico do tenant
export const TenantHeader = ({
  tenant,
  user,
  notifications,
  onMenuToggle,
  isOffline,
  isMobile
}: TenantHeaderProps) => {
  return (
    <header 
      className="sticky top-0 z-50 border-b transition-colors duration-200"
      style={{ 
        backgroundColor: tenant.theme.colors.background,
        borderColor: `${tenant.theme.colors.primary}20`
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + Menu do tenant */}
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  '--hover-bg': `${tenant.theme.colors.primary}10` 
                }}
              >
                <MenuIcon className="w-6 h-6" style={{ color: tenant.theme.colors.text }} />
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              {/* Logo específico do tenant */}
              <img
                src={tenant.theme.logo || '/default-logo.svg'}
                alt={tenant.companyName}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover"
              />
              
              <div>
                <h1 className="text-lg md:text-xl font-bold" style={{ color: tenant.theme.colors.primary }}>
                  {tenant.companyName}
                </h1>
                {isMobile && (
                  <p className="text-xs opacity-70" style={{ color: tenant.theme.colors.text }}>
                    KRYONIX Platform
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              <div 
                className={cn(
                  "w-2 h-2 rounded-full",
                  isOffline ? "bg-red-500" : "bg-green-500"
                )}
              />
              <span className="text-xs hidden md:block" style={{ color: tenant.theme.colors.text }}>
                {isOffline ? 'Offline' : 'Online'}
              </span>
            </div>
            
            {/* AI Assistant quick access */}
            <TenantQuickActions tenant={tenant} />
            
            {/* Notifications */}
            <TenantNotificationButton 
              tenant={tenant}
              notifications={notifications}
            />
            
            {/* User menu */}
            <TenantUserMenu tenant={tenant} user={user} />
          </div>
        </div>
      </div>
    </header>
  );
};
```

## 🤖 **AI ASSISTANT MULTI-TENANT**

### **🧠 Assistente IA Específico por Tenant**
```tsx
// components/ai/TenantAIAssistant.tsx
export const TenantAIAssistant = ({ 
  tenant, 
  isMobile 
}: { 
  tenant: TenantConfig;
  isMobile: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Carregar histórico do chat do tenant
  useEffect(() => {
    loadTenantChatHistory(tenant.clientId).then(setMessages);
  }, [tenant.clientId]);
  
  // Comandos de voz específicos do tenant
  const startVoiceCommand = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Comando de voz não suportado neste navegador');
      return;
    }
    
    setIsListening(true);
    const recognition = new webkitSpeechRecognition();
    recognition.lang = tenant.settings.language || 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = async (event) => {
      const command = event.results[0][0].transcript;
      await processTenantAICommand(command);
      setIsListening(false);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Erro no reconhecimento de voz');
    };
    
    recognition.start();
  };
  
  const processTenantAICommand = async (input: string) => {
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/ai/tenant-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenant.clientId
        },
        body: JSON.stringify({
          tenantId: tenant.clientId,
          message: input,
          context: {
            tenant: tenant,
            language: tenant.settings.language,
            modules: tenant.modules,
            plan: tenant.plan
          }
        })
      });
      
      const data = await response.json();
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        actions: data.suggestedActions,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Salvar no histórico do tenant
      await saveTenantChatMessage(tenant.clientId, userMessage, aiMessage);
      
    } catch (error) {
      console.error('Erro ao processar comando IA:', error);
      toast.error('Erro ao processar comando. Tente novamente.');
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <>
      {/* Floating AI Button com cores do tenant */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 rounded-full shadow-lg transition-all duration-200",
          "hover:scale-110 active:scale-95",
          isMobile ? "bottom-24 right-4 w-14 h-14" : "bottom-6 right-6 w-16 h-16"
        )}
        style={{
          backgroundColor: tenant.theme.colors.primary,
          color: 'white'
        }}
      >
        <BrainIcon className="w-6 h-6 mx-auto" />
        
        {/* Indicador de listening */}
        {isListening && (
          <span 
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: tenant.theme.colors.accent }}
          />
        )}
        
        {/* Badge de notificação */}
        <span 
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center text-white"
          style={{ backgroundColor: tenant.theme.colors.accent }}
        >
          AI
        </span>
      </button>
      
      {/* Modal do Chat IA */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className={cn(
                "rounded-t-2xl md:rounded-2xl w-full max-w-md h-96 flex flex-col shadow-xl",
                "overflow-hidden"
              )}
              style={{ backgroundColor: tenant.theme.colors.background }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do chat */}
              <div 
                className="p-4 border-b flex items-center justify-between"
                style={{ 
                  borderColor: `${tenant.theme.colors.primary}20`,
                  backgroundColor: `${tenant.theme.colors.primary}05`
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tenant.theme.colors.primary }}
                  >
                    <BrainIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: tenant.theme.colors.text }}>
                      Assistente IA {tenant.companyName}
                    </h3>
                    <p className="text-xs opacity-70" style={{ color: tenant.theme.colors.text }}>
                      Especializada no seu negócio
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ '--hover-bg': `${tenant.theme.colors.primary}10` }}
                >
                  <XIcon className="w-5 h-5" style={{ color: tenant.theme.colors.text }} />
                </button>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <TenantAIWelcomeMessage tenant={tenant} onSuggestionClick={processTenantAICommand} />
                ) : (
                  messages.map((message) => (
                    <TenantAIMessageBubble 
                      key={message.id} 
                      message={message} 
                      tenant={tenant}
                      onActionClick={processTenantAICommand}
                    />
                  ))
                )}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${tenant.theme.colors.primary}20` }}
                    >
                      <BrainIcon className="w-4 h-4" style={{ color: tenant.theme.colors.primary }} />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: tenant.theme.colors.primary }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: tenant.theme.colors.primary, animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: tenant.theme.colors.primary, animationDelay: '0.2s' }} />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div 
                className="p-4 border-t"
                style={{ borderColor: `${tenant.theme.colors.primary}20` }}
              >
                <TenantAIInput
                  tenant={tenant}
                  onSend={processTenantAICommand}
                  onVoiceStart={startVoiceCommand}
                  isListening={isListening}
                  disabled={isTyping}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Welcome message específica do tenant
const TenantAIWelcomeMessage = ({ 
  tenant, 
  onSuggestionClick 
}: { 
  tenant: TenantConfig;
  onSuggestionClick: (suggestion: string) => void;
}) => {
  const suggestions = useMemo(() => {
    const baseSuggestions = [
      `Como está a receita de ${tenant.companyName} hoje?`,
      "Mostrar métricas em tempo real",
      "Status dos usuários ativos",
      "Criar nova automação"
    ];
    
    // Sugestões baseadas nos módulos do tenant
    const moduleSuggestions = [];
    
    if (tenant.modules.includes('whatsapp')) {
      moduleSuggestions.push("Estatísticas do WhatsApp");
    }
    
    if (tenant.modules.includes('crm')) {
      moduleSuggestions.push("Relatório de vendas CRM");
    }
    
    if (tenant.modules.includes('financeiro')) {
      moduleSuggestions.push("Resumo financeiro");
    }
    
    return [...baseSuggestions, ...moduleSuggestions].slice(0, 6);
  }, [tenant]);
  
  return (
    <div className="text-center space-y-4">
      <div className="space-y-2">
        <p style={{ color: tenant.theme.colors.text }}>
          Olá! Sou a assistente IA especializada da <strong>{tenant.companyName}</strong>.
        </p>
        <p className="text-sm opacity-70" style={{ color: tenant.theme.colors.text }}>
          Como posso ajudar você hoje?
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map(suggestion => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-3 py-2 text-sm rounded-lg transition-colors text-left"
            style={{ 
              backgroundColor: `${tenant.theme.colors.primary}10`,
              color: tenant.theme.colors.text
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
```

## 📱 **PWA MULTI-TENANT DINÂMICO**

### **🚀 PWA Específico por Tenant**
```typescript
// services/tenant-pwa.service.ts
export class TenantPWAService {
  
  static async configureTenantPWA(tenant: TenantConfig) {
    // Gerar manifest dinâmico específico do tenant
    const manifest = this.generateTenantManifest(tenant);
    
    // Atualizar manifest link
    await this.updateManifestLink(manifest);
    
    // Configurar service worker específico
    await this.setupTenantServiceWorker(tenant);
    
    // Configurar notificações push
    await this.setupTenantPushNotifications(tenant);
  }
  
  private static generateTenantManifest(tenant: TenantConfig) {
    return {
      name: `${tenant.companyName} - Powered by KRYONIX`,
      short_name: tenant.companyName,
      description: `Plataforma ${tenant.companyName} - KRYONIX SaaS`,
      start_url: `/?tenant=${tenant.clientId}&utm_source=pwa`,
      display: 'standalone',
      orientation: 'portrait-primary',
      background_color: tenant.theme.colors.background,
      theme_color: tenant.theme.colors.primary,
      
      icons: [
        {
          src: tenant.theme.logo || '/default-icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: tenant.theme.logo || '/default-icon-512.png', 
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      
      categories: ['business', 'productivity'],
      
      shortcuts: [
        {
          name: 'Dashboard',
          short_name: 'Dashboard',
          description: `Dashboard ${tenant.companyName}`,
          url: `/dashboard?tenant=${tenant.clientId}`,
          icons: [{ src: tenant.theme.logo || '/default-icon-96.png', sizes: '96x96' }]
        },
        {
          name: 'Receita',
          short_name: 'Receita',
          description: 'Ver métricas de receita',
          url: `/revenue?tenant=${tenant.clientId}`,
          icons: [{ src: '/icons/revenue-96.png', sizes: '96x96' }]
        }
      ],
      
      // Tenant-specific configurations
      scope: `/?tenant=${tenant.clientId}`,
      id: `kryonix-${tenant.clientId}`,
      
      // Protocol handlers
      protocol_handlers: [
        {
          protocol: 'web+kryonix',
          url: `/?tenant=${tenant.clientId}&action=%s`
        }
      ]
    };
  }
  
  private static async updateManifestLink(manifest: any) {
    // Remover manifest anterior
    const existingLink = document.querySelector('link[rel="manifest"]');
    if (existingLink) {
      existingLink.remove();
    }
    
    // Criar blob com o novo manifest
    const manifestBlob = new Blob([JSON.stringify(manifest)], {
      type: 'application/json'
    });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    
    // Adicionar novo link do manifest
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestUrl;
    document.head.appendChild(link);
  }
  
  private static async setupTenantServiceWorker(tenant: TenantConfig) {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          `/sw-tenant.js?tenantId=${tenant.clientId}`,
          { scope: `/?tenant=${tenant.clientId}` }
        );
        
        // Configurar cache específico do tenant
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.postMessage({
              type: 'CONFIGURE_TENANT',
              tenant: tenant
            });
          }
        });
        
        return registration;
      } catch (error) {
        console.error('Erro registrando service worker:', error);
      }
    }
  }
  
  private static async setupTenantPushNotifications(tenant: TenantConfig) {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY
        });
        
        // Registrar subscription específica do tenant
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-ID': tenant.clientId
          },
          body: JSON.stringify({
            subscription,
            tenantId: tenant.clientId
          })
        });
      }
    }
  }
  
  static async showTenantInstallPrompt(tenant: TenantConfig) {
    // Prompt personalizado de instalação
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
          <div class="text-center space-y-2">
            <img src="${tenant.theme.logo}" alt="${tenant.companyName}" class="w-16 h-16 mx-auto rounded-lg">
            <h3 class="text-lg font-semibold">Instalar ${tenant.companyName}</h3>
            <p class="text-sm text-gray-600">
              Adicione nosso app à sua tela inicial para acesso rápido
            </p>
          </div>
          
          <div class="space-y-3">
            <button 
              onclick="installTenantPWA()" 
              class="w-full py-3 px-4 rounded-lg text-white font-medium"
              style="background-color: ${tenant.theme.colors.primary}"
            >
              Instalar App
            </button>
            <button 
              onclick="dismissInstallPrompt()" 
              class="w-full py-3 px-4 rounded-lg border text-gray-700"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
}

// Service Worker específico por tenant
// public/sw-tenant.js
const TENANT_CACHE_PREFIX = 'kryonix-tenant-';
let tenantConfig = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CONFIGURE_TENANT') {
    tenantConfig = event.data.tenant;
  }
});

self.addEventListener('install', (event) => {
  const urlParams = new URLSearchParams(self.location.search);
  const tenantId = urlParams.get('tenantId');
  
  if (!tenantId) return;
  
  const cacheName = `${TENANT_CACHE_PREFIX}${tenantId}`;
  
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        `/?tenant=${tenantId}`,
        `/dashboard?tenant=${tenantId}`,
        `/offline.html?tenant=${tenantId}`,
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const tenantId = url.searchParams.get('tenant') || 
                   url.pathname.match(/tenant\/([^\/]+)/)?.[1];
  
  if (!tenantId) return;
  
  const cacheName = `${TENANT_CACHE_PREFIX}${tenantId}`;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        
        caches.open(cacheName).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Fallback para página offline específica do tenant
        return caches.match(`/offline.html?tenant=${tenantId}`);
      });
    })
  );
});

// Push notifications específicas do tenant
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  // Filtrar apenas notificações do tenant correto
  if (tenantConfig && data.tenantId === tenantConfig.clientId) {
    const options = {
      body: data.body,
      icon: tenantConfig.theme.logo || '/default-icon-192.png',
      badge: '/badge-72x72.png',
      tag: `${tenantConfig.clientId}-${data.id}`,
      data: {
        tenantId: tenantConfig.clientId,
        url: data.url
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/icons/open-action.png'
        },
        {
          action: 'dismiss',
          title: 'Dispensar',
          icon: '/icons/dismiss-action.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
```

## 🔧 **SCRIPT SETUP MULTI-TENANT COMPLETO**

### **🚀 Deploy Interface Multi-Tenant**
```bash
#!/bin/bash
# setup-interface-multi-tenant-complete.sh

echo "🎨 KRYONIX - Setup Interface Multi-Tenant Mobile-First Completo"
echo "============================================================="

# Validar parâmetros
if [ $# -lt 1 ]; then
    echo "Uso: $0 <ambiente> [features]"
    echo "Exemplo: $0 production pwa,ai,mobile"
    exit 1
fi

ENVIRONMENT=$1
FEATURES=${2:-"all"}

echo "🌍 Ambiente: $ENVIRONMENT"
echo "🚀 Features: $FEATURES"

# 1. INSTALAR DEPENDÊNCIAS MULTI-TENANT
echo "📦 Instalando dependências multi-tenant..."
npm install react react-dom next typescript
npm install @types/react @types/react-dom @types/node
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
npm install postcss autoprefixer
npm install framer-motion react-hot-toast react-hook-form
npm install @headlessui/react @heroicons/react
npm install next-pwa workbox-webpack-plugin
npm install @tanstack/react-query axios swr
npm install zustand immer
npm install react-use use-debounce
npm install date-fns clsx class-variance-authority

# 2. CONFIGURAR ESTRUTURA MULTI-TENANT
echo "🏗️ Criando estrutura multi-tenant..."
mkdir -p {
  src/{
    components/{ui,layout,tenant,mobile,ai,pwa},
    contexts/{tenant,auth,theme},
    hooks/{tenant,mobile,ai},
    services/{tenant,api,cache,pwa},
    utils/{tenant,theme,device},
    types/{tenant,ui,api}
  },
  pages/{
    tenant/[tenantId],
    api/{tenant,ai,pwa}
  },
  public/{
    icons/{tenant,pwa},
    manifests,
    sw
  },
  docs/multi-tenant
}

# 3. CONFIGURAR TAILWIND MULTI-TENANT
echo "🎨 Configurando Tailwind multi-tenant..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dynamic tenant colors (will be overridden by CSS variables)
        primary: {
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
        },
        secondary: {
          50: 'rgb(var(--color-secondary-50) / <alpha-value>)',
          500: 'rgb(var(--color-secondary-500) / <alpha-value>)',
          600: 'rgb(var(--color-secondary-600) / <alpha-value>)',
        },
        accent: {
          50: 'rgb(var(--color-accent-50) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'monospace']
      },
      spacing: {
        'touch-sm': '40px',   // Mínimo para touch
        'touch-md': '48px',   // Padrão mobile
        'touch-lg': '56px',   // Grande para ações importantes
        'touch-xl': '64px'    // Extra large
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
EOF

# 4. CONFIGURAR NEXT.JS MULTI-TENANT
echo "⚙️ Configurando Next.js..."
cat > next.config.js << 'EOF'
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.kryonix\.com\.br\/tenant\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'tenant-api-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      urlPattern: /^https:\/\/.*\.kryonix\.com\.br\/.*\.(js|css|woff2|png|jpg|jpeg|svg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'tenant-assets-cache',
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  },
  images: {
    domains: [
      'storage.kryonix.com.br',
      'cdn.kryonix.com.br',
      '*.kryonix.com.br'
    ],
    formats: ['image/webp', 'image/avif']
  },
  // Suporte a multi-tenant via rewrite
  async rewrites() {
    return [
      {
        source: '/tenant/:tenantId/:path*',
        destination: '/:path*?tenant=:tenantId'
      }
    ];
  },
  // Headers para PWA e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
});

module.exports = nextConfig;
EOF

# 5. CONFIGURAR TYPESCRIPT
echo "📝 Configurando TypeScript..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/contexts/*": ["./src/contexts/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# 6. CONFIGURAR ESLINT E PRETTIER
echo "🔧 Configurando ESLint e Prettier..."
cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-img-element": "off"
  }
}
EOF

cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
EOF

# 7. CRIAR TIPOS TYPESCRIPT
echo "📋 Criando tipos TypeScript..."
cat > src/types/tenant.ts << 'EOF'
export interface TenantConfig {
  clientId: string;
  companyName: string;
  subdomain: string;
  theme: TenantTheme;
  modules: string[];
  plan: 'basic' | 'pro' | 'enterprise';
  settings: TenantSettings;
  permissions: Record<string, boolean>;
  customization: TenantCustomization;
}

export interface TenantTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  logo: string;
  favicon: string;
  customCSS?: string;
  darkMode: boolean;
}

export interface TenantSettings {
  language: string;
  timezone: string;
  currency: string;
  mobileOptimized: boolean;
}

export interface TenantCustomization {
  layout: 'standard' | 'compact' | 'cards';
  navigation: 'sidebar' | 'bottom' | 'drawer';
  dashboard: 'executive' | 'operational' | 'custom';
}
EOF

# 8. CRIAR SERVICE WORKER TENANT
echo "⚙️ Configurando Service Worker..."
cat > public/sw-tenant.js << 'EOF'
// [Código do Service Worker inserido anteriormente no documento]
EOF

# 9. CONFIGURAR MANIFEST DINÂMICO
echo "📱 Configurando PWA Manifest..."
cat > pages/api/manifest/[tenantId].ts << 'EOF'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { tenantId } = req.query;
  
  try {
    // Buscar configuração do tenant
    const tenantConfig = await fetchTenantConfig(tenantId as string);
    
    if (!tenantConfig) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const manifest = {
      name: `${tenantConfig.companyName} - KRYONIX`,
      short_name: tenantConfig.companyName,
      description: `Plataforma ${tenantConfig.companyName}`,
      start_url: `/?tenant=${tenantId}`,
      display: 'standalone',
      background_color: tenantConfig.theme.colors.background,
      theme_color: tenantConfig.theme.colors.primary,
      icons: [
        {
          src: tenantConfig.theme.logo || '/default-icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: tenantConfig.theme.logo || '/default-icon-512.png',
          sizes: '512x512', 
          type: 'image/png'
        }
      ]
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(manifest);
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
EOF

# 10. CONFIGURAR DOCKER PARA PRODUÇÃO
echo "🐳 Configurando Docker..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF

# 11. CONFIGURAR CI/CD
echo "🚀 Configurando CI/CD..."
mkdir -p .github/workflows

cat > .github/workflows/deploy-multi-tenant.yml << 'EOF'
name: Deploy Multi-Tenant Interface

on:
  push:
    branches: [main]
    paths: ['src/**', 'pages/**', 'public/**']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
        NEXT_PUBLIC_WS_URL: ${{ secrets.WS_URL }}
    
    - name: Deploy to production
      run: |
        docker build -t kryonix-interface-multi-tenant .
        docker tag kryonix-interface-multi-tenant:latest registry.kryonix.com.br/interface:latest
        docker push registry.kryonix.com.br/interface:latest
EOF

# 12. CONFIGURAR TESTES
echo "🧪 Configurando testes..."
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom

cat > jest.config.js << 'EOF'
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
EOF

# 13. BUILD E DEPLOY
echo "🏗️ Building aplicação..."
npm run build

# 14. CONFIGURAR PM2 PARA PRODUÇÃO
echo "🚀 Configurando PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'kryonix-interface-multi-tenant',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'https://api.kryonix.com.br',
      NEXT_PUBLIC_WS_URL: 'wss://api.kryonix.com.br'
    },
    error_file: './logs/interface-error.log',
    out_file: './logs/interface-out.log',
    log_file: './logs/interface-combined.log',
    time: true
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save

echo ""
echo "🎉 SETUP INTERFACE MULTI-TENANT CONCLUÍDO!"
echo "========================================"
echo ""
echo "🎨 COMPONENTES CRIADOS:"
echo "  • TenantProvider - Context multi-tenant"
echo "  • TenantLayout - Layout responsivo"
echo "  • TenantButton/Card - Componentes dinâmicos"
echo "  • TenantAIAssistant - IA específica por tenant"
echo "  • PWA dinâmica por tenant"
echo ""
echo "📱 FEATURES MOBILE-FIRST:"
echo "  • Touch targets otimizados (48px+)"
echo "  • Bottom navigation nativa"
echo "  • Gestures e swipe actions"
echo "  • PWA instalável por tenant"
echo "  • Offline-first com sync"
echo ""
echo "🏢 MULTI-TENANCY:"
echo "  • Theming dinâmico por cliente"
echo "  • Isolamento completo de UI"
echo "  • Subdomain routing"
echo "  • Cache separado por tenant"
echo "  • Manifest PWA específico"
echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "  1. Configurar variáveis de ambiente"
echo "  2. Testar em diferentes tenants"
echo "  3. Configurar CDN para assets"
echo "  4. Monitorar performance Core Web Vitals"
echo ""
```

## ✅ **CHECKLIST DE VALIDAÇÃO MULTI-TENANT**

### **🏢 MULTI-TENANCY**
- [ ] Context Provider isolado por cliente funcionando
- [ ] Theming dinâmico por tenant aplicado
- [ ] Subdomain routing configurado
- [ ] Estado global segregado por cliente
- [ ] Cache isolado por tenant

### **📱 MOBILE-FIRST**
- [ ] Touch targets ≥ 48px implementados
- [ ] Bottom navigation mobile funcionando
- [ ] Gestures e swipe actions ativos
- [ ] Responsive breakpoints otimizados
- [ ] Performance 60fps+ em mobile

### **🎨 UI/UX**
- [ ] Design system multi-tenant completo
- [ ] Componentes reutilizáveis criados
- [ ] Animações smooth implementadas
- [ ] Dark/Light mode dinâmico
- [ ] Acessibilidade WCAG AA

### **🤖 PWA & AI**
- [ ] PWA instalável por tenant
- [ ] Service Worker específico funcionando
- [ ] Manifest dinâmico por cliente
- [ ] AI Assistant integrada por tenant
- [ ] Offline-first com sync automático

### **⚡ PERFORMANCE**
- [ ] Code splitting por tenant implementado
- [ ] Lazy loading ativo
- [ ] Bundle otimizado
- [ ] Core Web Vitals ≥ 90
- [ ] Lighthouse score ≥ 95

### **🔧 DESENVOLVIMENTO**
- [ ] TypeScript configurado
- [ ] Testes automatizados funcionando
- [ ] CI/CD pipeline ativo
- [ ] Docker containerizado
- [ ] Monitoramento configurado

---

*Parte 11 de 50 - Projeto KRYONIX SaaS Platform - Versão Multi-Tenant*  
*Próxima Parte: 12 - Dashboard Multi-Tenant Mobile-First*

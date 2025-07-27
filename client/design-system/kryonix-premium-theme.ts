// Design System Premium KRYONIX - Identidade Visual de Última Geração
// Sistema completo de cores, tipografia, animações e componentes premium

export const kryonixPremiumTheme = {
  // Paleta de cores premium com gradientes
  colors: {
    // Cores primárias - Identidade KRYONIX
    brand: {
      primary: "#3b82f6", // Azul principal KRYONIX
      secondary: "#8b5cf6", // Roxo tecnológico
      accent: "#06b6d4", // Ciano moderno
      success: "#22c55e", // Verde brasileiro
      warning: "#f59e0b", // Âmbar premium
      error: "#ef4444", // Vermelho moderno
      info: "#0ea5e9", // Azul informativo
    },

    // Gradientes premium
    gradients: {
      primary: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
      secondary: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
      success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      glass:
        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
      dark: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
      hero: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
    },

    // Tons de cinza sofisticados
    gray: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },

    // Estados visuais
    states: {
      hover: "rgba(59, 130, 246, 0.1)",
      active: "rgba(59, 130, 246, 0.2)",
      focus: "rgba(59, 130, 246, 0.3)",
      disabled: "rgba(148, 163, 184, 0.5)",
      overlay: "rgba(0, 0, 0, 0.5)",
      backdrop: "rgba(255, 255, 255, 0.8)",
    },
  },

  // Tipografia premium
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "Fira Code", "Monaco", "monospace"],
      heading: ["Poppins", "Inter", "system-ui", "sans-serif"],
    },

    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],
      sm: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.025em" }],
      base: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0" }],
      lg: ["1.125rem", { lineHeight: "1.75rem", letterSpacing: "0" }],
      xl: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "0" }],
      "2xl": ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.025em" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.025em" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.05em" }],
      "5xl": ["3rem", { lineHeight: "1", letterSpacing: "-0.05em" }],
      "6xl": ["3.75rem", { lineHeight: "1", letterSpacing: "-0.05em" }],
      "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.075em" }],
      "8xl": ["6rem", { lineHeight: "1", letterSpacing: "-0.075em" }],
      "9xl": ["8rem", { lineHeight: "1", letterSpacing: "-0.1em" }],
    },

    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
  },

  // Espaçamento responsivo
  spacing: {
    mobile: {
      xs: "0.25rem", // 4px
      sm: "0.5rem", // 8px
      md: "1rem", // 16px
      lg: "1.5rem", // 24px
      xl: "2rem", // 32px
      "2xl": "3rem", // 48px
      "3xl": "4rem", // 64px
      "4xl": "6rem", // 96px
    },
    desktop: {
      xs: "0.5rem", // 8px
      sm: "1rem", // 16px
      md: "1.5rem", // 24px
      lg: "2rem", // 32px
      xl: "3rem", // 48px
      "2xl": "4rem", // 64px
      "3xl": "6rem", // 96px
      "4xl": "8rem", // 128px
    },
  },

  // Bordas e raios modernos
  borderRadius: {
    none: "0",
    xs: "0.125rem", // 2px
    sm: "0.25rem", // 4px
    base: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
    "2xl": "2rem", // 32px
    "3xl": "3rem", // 48px
    full: "9999px",
  },

  // Sombras premium com glassmorphism
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",

    // Sombras premium com cor
    glow: "0 0 20px rgb(59 130 246 / 0.3)",
    glowLg: "0 0 40px rgb(59 130 246 / 0.4)",
    glowXl: "0 0 60px rgb(59 130 246 / 0.5)",

    // Glassmorphism
    glass: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
    glassLg: "0 16px 64px 0 rgba(31, 38, 135, 0.3)",

    // Elevação premium
    elevated:
      "0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
  },

  // Animações suaves e profissionais
  animation: {
    duration: {
      instant: "50ms",
      fast: "150ms",
      normal: "250ms",
      slow: "350ms",
      slower: "500ms",
      slowest: "750ms",
    },

    easing: {
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },

    keyframes: {
      fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      fadeOut: {
        "0%": { opacity: "1" },
        "100%": { opacity: "0" },
      },
      slideInUp: {
        "0%": { transform: "translateY(20px)", opacity: "0" },
        "100%": { transform: "translateY(0)", opacity: "1" },
      },
      slideInDown: {
        "0%": { transform: "translateY(-20px)", opacity: "0" },
        "100%": { transform: "translateY(0)", opacity: "1" },
      },
      slideInLeft: {
        "0%": { transform: "translateX(-20px)", opacity: "0" },
        "100%": { transform: "translateX(0)", opacity: "1" },
      },
      slideInRight: {
        "0%": { transform: "translateX(20px)", opacity: "0" },
        "100%": { transform: "translateX(0)", opacity: "1" },
      },
      scaleIn: {
        "0%": { transform: "scale(0.95)", opacity: "0" },
        "100%": { transform: "scale(1)", opacity: "1" },
      },
      pulse: {
        "0%, 100%": { opacity: "1" },
        "50%": { opacity: "0.5" },
      },
      glow: {
        "0%, 100%": {
          filter: "brightness(1) drop-shadow(0 0 5px rgba(59, 130, 246, 0.5))",
        },
        "50%": {
          filter:
            "brightness(1.2) drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))",
        },
      },
    },
  },

  // Componentes premium
  components: {
    // Botões premium
    button: {
      primary: {
        base: "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg",
        hover:
          "hover:from-blue-600 hover:to-purple-600 hover:shadow-xl hover:scale-105",
        active: "active:scale-95",
        focus: "focus:ring-4 focus:ring-blue-500/30",
        disabled:
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        transition: "transition-all duration-200 ease-out",
      },
      secondary: {
        base: "bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 shadow-sm",
        hover:
          "hover:bg-white hover:shadow-md hover:scale-105 hover:text-gray-900",
        active: "active:scale-95",
        focus: "focus:ring-4 focus:ring-gray-500/20",
        transition: "transition-all duration-200 ease-out",
      },
      ghost: {
        base: "text-gray-600 hover:text-gray-900",
        hover: "hover:bg-gray-100/80 hover:backdrop-blur-sm",
        active: "active:scale-95",
        transition: "transition-all duration-150 ease-out",
      },
      glass: {
        base: "bg-white/20 backdrop-blur-xl text-white border border-white/30",
        hover: "hover:bg-white/30 hover:shadow-lg hover:scale-105",
        active: "active:scale-95",
        transition: "transition-all duration-200 ease-out",
      },
    },

    // Cards premium
    card: {
      default: {
        base: "bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm",
        hover: "hover:shadow-lg hover:scale-[1.02] hover:border-gray-300/50",
        transition: "transition-all duration-200 ease-out",
      },
      elevated: {
        base: "bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-lg",
        hover: "hover:shadow-xl hover:scale-[1.02] hover:shadow-blue-500/10",
        transition: "transition-all duration-300 ease-out",
      },
      glass: {
        base: "bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-glass",
        hover: "hover:bg-white/30 hover:shadow-glassLg hover:scale-[1.02]",
        transition: "transition-all duration-300 ease-out",
      },
      premium: {
        base: "bg-gradient-to-br from-white via-white to-blue-50/30 border border-blue-200/50 rounded-2xl shadow-elevated",
        hover:
          "hover:shadow-glowLg hover:scale-[1.02] hover:border-blue-300/50",
        transition: "transition-all duration-300 ease-out",
      },
    },

    // Inputs premium
    input: {
      default: {
        base: "bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500",
        focus:
          "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white",
        error: "border-red-500 focus:ring-red-500/50 focus:border-red-500",
        transition: "transition-all duration-200 ease-out",
      },
      glass: {
        base: "bg-white/20 backdrop-blur-xl border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/70",
        focus:
          "focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30",
        transition: "transition-all duration-200 ease-out",
      },
    },

    // Navegação premium
    navigation: {
      item: {
        base: "flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 transition-all duration-200",
        hover:
          "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 hover:scale-[1.02]",
        active:
          "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg",
        focus: "focus:ring-2 focus:ring-blue-500/30",
      },
    },

    // Modal premium
    modal: {
      backdrop: "bg-black/50 backdrop-blur-sm",
      container:
        "bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20",
      header: "border-b border-gray-200/50",
      content: "bg-gradient-to-br from-white to-gray-50/30",
    },

    // Dropdown premium
    dropdown: {
      container:
        "bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50",
      item: "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-150",
    },
  },

  // Breakpoints responsivos
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
    "3xl": "1792px",
  },

  // Z-index hierarchy
  zIndex: {
    hide: "-1",
    auto: "auto",
    base: "0",
    docked: "10",
    dropdown: "1000",
    sticky: "1100",
    banner: "1200",
    overlay: "1300",
    modal: "1400",
    popover: "1500",
    skipLink: "1600",
    toast: "1700",
    tooltip: "1800",
  },

  // Efeitos especiais
  effects: {
    glassmorphism: {
      light: "bg-white/20 backdrop-blur-xl border border-white/30",
      dark: "bg-black/20 backdrop-blur-xl border border-white/10",
      primary: "bg-blue-500/20 backdrop-blur-xl border border-blue-300/30",
    },

    neomorphism: {
      light:
        "bg-gray-100 shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]",
      dark: "bg-gray-800 shadow-[inset_2px_2px_5px_#1f2937,inset_-2px_-2px_5px_#374151]",
    },

    glow: {
      blue: "drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]",
      purple: "drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]",
      green: "drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]",
      gold: "drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]",
    },
  },
};

// Configurações específicas para Brasil
export const brazilianPremiumConfig = {
  // Formatação brasileira
  locale: "pt-BR",
  currency: "BRL",
  timezone: "America/Sao_Paulo",

  // Formatadores avançados
  formatters: {
    currency: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        ...options,
      }).format(value),

    number: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat("pt-BR", {
        ...options,
      }).format(value),

    percentage: (value: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "percent",
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }).format(value / 100),

    phone: (value: string) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      }
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
      }
      return value;
    },

    cpf: (value: string) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length === 11) {
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
      }
      return value;
    },

    cnpj: (value: string) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length === 14) {
        return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
      }
      return value;
    },

    cep: (value: string) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length === 8) {
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
      }
      return value;
    },

    date: (date: Date | string) => {
      const d = typeof date === "string" ? new Date(date) : date;
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d);
    },

    datetime: (date: Date | string) => {
      const d = typeof date === "string" ? new Date(date) : date;
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    },
  },

  // Textos da interface em português
  labels: {
    // Ações
    loading: "Carregando...",
    saving: "Salvando...",
    saved: "Salvo!",
    error: "Ops! Algo deu errado",
    success: "Sucesso!",
    warning: "Atenção!",
    info: "Informação",

    // Botões
    confirm: "Confirmar",
    cancel: "Cancelar",
    save: "Salvar",
    edit: "Editar",
    delete: "Excluir",
    remove: "Remover",
    add: "Adicionar",
    create: "Criar",
    update: "Atualizar",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    finish: "Finalizar",
    close: "Fechar",
    open: "Abrir",
    download: "Baixar",
    upload: "Enviar",
    search: "Buscar",
    filter: "Filtrar",
    sort: "Ordenar",
    refresh: "Atualizar",

    // Navegação
    home: "Início",
    dashboard: "Painel de Controle",
    analytics: "Analytics",
    communication: "Comunicação",
    automation: "Automação",
    stacks: "Stacks",
    users: "Usuários",
    settings: "Configurações",
    profile: "Perfil",
    logout: "Sair",
    help: "Ajuda",
    support: "Suporte",

    // Status
    online: "Online",
    offline: "Offline",
    connecting: "Conectando...",
    connected: "Conectado",
    disconnected: "Desconectado",
    active: "Ativo",
    inactive: "Inativo",
    enabled: "Habilitado",
    disabled: "Desabilitado",

    // Tempo
    now: "Agora",
    today: "Hoje",
    yesterday: "Ontem",
    tomorrow: "Amanhã",
    thisWeek: "Esta semana",
    lastWeek: "Semana passada",
    thisMonth: "Este mês",
    lastMonth: "Mês passado",
    thisYear: "Este ano",
    lastYear: "Ano passado",

    // Mensagens
    welcome: "Bem-vindo ao KRYONIX!",
    welcomeBack: "Bem-vindo de volta!",
    goodbye: "Até logo!",
    thankYou: "Obrigado!",
    pleaseWait: "Por favor, aguarde...",
    comingSoon: "Em breve!",
    maintenance: "Em manutenção",
    noData: "Nenhum dado encontrado",
    noResults: "Nenhum resultado encontrado",
    noConnection: "Sem conexão com a internet",
    tryAgain: "Tente novamente",

    // Unidades
    items: "itens",
    item: "item",
    users: "usuários",
    user: "usuário",
    days: "dias",
    day: "dia",
    hours: "horas",
    hour: "hora",
    minutes: "minutos",
    minute: "minuto",
    seconds: "segundos",
    second: "segundo",

    // Empresarial
    company: "Empresa",
    team: "Equipe",
    department: "Departamento",
    role: "Cargo",
    permission: "Permissão",
    plan: "Plano",
    subscription: "Assinatura",
    billing: "Faturamento",
    invoice: "Fatura",
    payment: "Pagamento",

    // KRYONIX específico
    kryonix: "KRYONIX",
    tagline: "Automação Inteligente",
    poweredBy: "Powered by KRYONIX",
    version: "Versão",
    build: "Build",
    contact: "Contato",
    privacy: "Privacidade",
    terms: "Termos de Uso",
    cookies: "Cookies",
    lgpd: "LGPD",
  },
};

export default kryonixPremiumTheme;

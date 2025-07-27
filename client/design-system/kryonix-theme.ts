// Design System KRYONIX - Tema Brasileiro Moderno e Profissional
// Criado para impressionar e ser altamente funcional em mobile

export const kryonixTheme = {
  // Paleta de cores moderna e sofisticada
  colors: {
    // Cores primárias - Gradiente tecnológico
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9", // Cor principal KRYONIX
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },

    // Cores secundárias - Roxo tecnológico
    secondary: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea", // Cor secundária
      700: "#7c3aed",
      800: "#6b21a8",
      900: "#581c87",
      950: "#3b0764",
    },

    // Tons de cinza modernos
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

    // Cores de status - Brasileiras
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e", // Verde brasileiro
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },

    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b", // Amarelo brasileiro
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },

    error: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444", // Vermelho moderno
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
  },

  // Tipografia moderna e legível
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "Monaco", "Consolas", "monospace"],
    },

    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],
      sm: ["0.875rem", { lineHeight: "1.25rem" }],
      base: ["1rem", { lineHeight: "1.5rem" }],
      lg: ["1.125rem", { lineHeight: "1.75rem" }],
      xl: ["1.25rem", { lineHeight: "1.75rem" }],
      "2xl": ["1.5rem", { lineHeight: "2rem" }],
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      "5xl": ["3rem", { lineHeight: "1" }],
      "6xl": ["3.75rem", { lineHeight: "1" }],
      "7xl": ["4.5rem", { lineHeight: "1" }],
      "8xl": ["6rem", { lineHeight: "1" }],
      "9xl": ["8rem", { lineHeight: "1" }],
    },
  },

  // Espaçamentos otimizados para mobile
  spacing: {
    mobile: {
      xs: "0.25rem", // 4px
      sm: "0.5rem", // 8px
      md: "1rem", // 16px
      lg: "1.5rem", // 24px
      xl: "2rem", // 32px
      "2xl": "3rem", // 48px
      "3xl": "4rem", // 64px
    },
    desktop: {
      xs: "0.5rem", // 8px
      sm: "1rem", // 16px
      md: "1.5rem", // 24px
      lg: "2rem", // 32px
      xl: "3rem", // 48px
      "2xl": "4rem", // 64px
      "3xl": "6rem", // 96px
    },
  },

  // Bordas e raios modernos
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    base: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "3rem",
    full: "9999px",
  },

  // Sombras elegantes
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    none: "0 0 #0000",
  },

  // Animações suaves
  animation: {
    duration: {
      fast: "150ms",
      normal: "250ms",
      slow: "350ms",
    },
    easing: {
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // Componentes específicos
  components: {
    button: {
      primary:
        "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
      secondary:
        "bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
      outline:
        "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 transition-all duration-200",
      ghost:
        "text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200",
    },

    card: {
      base: "bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-md hover:shadow-lg transition-all duration-200",
      elevated:
        "bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200",
      interactive:
        "bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer",
    },

    input: {
      base: "bg-white/90 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
      error:
        "bg-white/90 border border-error-500 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-error-500 focus:border-transparent",
    },
  },

  // Breakpoints responsivos
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// Configurações específicas para Brasil
export const brazilianConfig = {
  currency: "BRL",
  locale: "pt-BR",
  timezone: "America/Sao_Paulo",

  // Formatadores brasileiros
  formatters: {
    currency: (value: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value),

    phone: (value: string) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      }
      return value;
    },

    document: (value: string) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length === 11) {
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
      }
      if (cleaned.length === 14) {
        return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
      }
      return value;
    },
  },

  // Textos em português
  labels: {
    loading: "Carregando...",
    error: "Ops! Algo deu errado",
    success: "Sucesso!",
    warning: "Atenção!",
    confirm: "Confirmar",
    cancel: "Cancelar",
    save: "Salvar",
    edit: "Editar",
    delete: "Excluir",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    finish: "Finalizar",
    welcome: "Bem-vindo ao KRYONIX!",
    dashboard: "Painel de Controle",
    settings: "Configurações",
    profile: "Perfil",
    logout: "Sair",
  },
};

export default kryonixTheme;

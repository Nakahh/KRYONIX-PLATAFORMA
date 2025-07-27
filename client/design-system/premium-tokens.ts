/**
 * KRYONIX Premium Design Tokens 2024
 * Sistema de tokens de design de última geração para interface premium
 */

export const premiumTokens = {
  // ========================================
  // CORES HARMONIOSAS BRASILEIRAS
  // ========================================
  colors: {
    // Paleta Brasileira Premium
    prosperity: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e", // Verde PIX/Prosperidade
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
      950: "#052e16",
    },
    technology: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9", // Azul Tecnologia
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
      950: "#082f49",
    },
    energy: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316", // Laranja WhatsApp/Energia
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
      950: "#431407",
    },
    premium: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#8b5cf6", // Roxo Premium/IA
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#581c87",
      950: "#3b0764",
    },
    elite: {
      50: "#fefce8",
      100: "#fef9c3",
      200: "#fef08a",
      300: "#fde047",
      400: "#facc15",
      500: "#eab308", // Dourado Elite
      600: "#ca8a04",
      700: "#a16207",
      800: "#854d0e",
      900: "#713f12",
      950: "#422006",
    },
    // Gradientes Contextuais
    gradients: {
      revenue: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
      whatsapp: "linear-gradient(135deg, #25d366 0%, #22c55e 100%)",
      ai: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
      success: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      warning: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      error: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      glass:
        "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
      premium: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #22c55e 100%)",
      holographic:
        "linear-gradient(45deg, #ff006e, #8338ec, #3a86ff, #06ffa5, #ffbe0b)",
      aurora: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    },
  },

  // ========================================
  // SOMBRAS E PROFUNDIDADE
  // ========================================
  shadows: {
    // Sombras com brilho
    glow: {
      xs: "0 0 5px rgba(34, 197, 94, 0.2)",
      sm: "0 0 10px rgba(34, 197, 94, 0.3)",
      md: "0 0 20px rgba(34, 197, 94, 0.4)",
      lg: "0 0 40px rgba(34, 197, 94, 0.5)",
      xl: "0 0 60px rgba(34, 197, 94, 0.6)",
    },
    // Sombras de profundidade
    depth: {
      1: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
      2: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
      3: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
      4: "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)",
      5: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)",
    },
    // Sombras neomórficas
    neomorphic: {
      flat: "8px 8px 16px #d1d5db, -8px -8px 16px #ffffff",
      inset: "inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff",
      pressed: "inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff",
      floating: "12px 12px 24px #d1d5db, -12px -12px 24px #ffffff",
    },
    // Sombras glassmórficas
    glass: {
      light: "0 8px 32px rgba(31, 38, 135, 0.37)",
      medium: "0 8px 32px rgba(31, 38, 135, 0.5)",
      heavy: "0 8px 32px rgba(31, 38, 135, 0.7)",
    },
  },

  // ========================================
  // ANIMAÇÕES E TRANSIÇÕES
  // ========================================
  animations: {
    // Curvas de transição
    easing: {
      spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      elastic: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      overshoot: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      entrance: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      exit: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
    },
    // Durações
    duration: {
      instant: "50ms",
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
      slower: "700ms",
      slowest: "1000ms",
    },
    // Delays escalonados
    delay: {
      none: "0ms",
      xs: "50ms",
      sm: "100ms",
      md: "200ms",
      lg: "300ms",
      xl: "500ms",
    },
    // Keyframes prontos
    keyframes: {
      fadeIn: {
        "0%": { opacity: "0", transform: "translateY(10px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
      scaleIn: {
        "0%": { opacity: "0", transform: "scale(0.9)" },
        "100%": { opacity: "1", transform: "scale(1)" },
      },
      slideInRight: {
        "0%": { opacity: "0", transform: "translateX(20px)" },
        "100%": { opacity: "1", transform: "translateX(0)" },
      },
      slideInLeft: {
        "0%": { opacity: "0", transform: "translateX(-20px)" },
        "100%": { opacity: "1", transform: "translateX(0)" },
      },
      shimmer: {
        "0%": { backgroundPosition: "-200px 0" },
        "100%": { backgroundPosition: "calc(200px + 100%) 0" },
      },
      pulse: {
        "0%, 100%": { opacity: "1" },
        "50%": { opacity: "0.5" },
      },
      bounce: {
        "0%, 100%": {
          transform: "translateY(-25%)",
          animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
        },
        "50%": {
          transform: "translateY(0)",
          animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
        },
      },
      spin: {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
      },
      ping: {
        "75%, 100%": { transform: "scale(2)", opacity: "0" },
      },
    },
  },

  // ========================================
  // TIPOGRAFIA HARMONIOSA
  // ========================================
  typography: {
    fontFamily: {
      display: ["Poppins", "system-ui", "sans-serif"],
      body: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "Menlo", "Monaco", "monospace"],
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

  // ========================================
  // LAYOUT E ESPAÇAMENTO
  // ========================================
  layout: {
    spacing: {
      0: "0px",
      px: "1px",
      0.5: "0.125rem",
      1: "0.25rem",
      1.5: "0.375rem",
      2: "0.5rem",
      2.5: "0.625rem",
      3: "0.75rem",
      3.5: "0.875rem",
      4: "1rem",
      5: "1.25rem",
      6: "1.5rem",
      7: "1.75rem",
      8: "2rem",
      9: "2.25rem",
      10: "2.5rem",
      11: "2.75rem",
      12: "3rem",
      14: "3.5rem",
      16: "4rem",
      20: "5rem",
      24: "6rem",
      28: "7rem",
      32: "8rem",
      36: "9rem",
      40: "10rem",
      44: "11rem",
      48: "12rem",
      52: "13rem",
      56: "14rem",
      60: "15rem",
      64: "16rem",
      72: "18rem",
      80: "20rem",
      96: "24rem",
    },
    borderRadius: {
      none: "0px",
      sm: "0.125rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      full: "9999px",
    },
  },

  // ========================================
  // EFEITOS ESPECIAIS
  // ========================================
  effects: {
    // Filtros de backdrop
    backdrop: {
      blur: {
        none: "none",
        sm: "blur(4px)",
        md: "blur(8px)",
        lg: "blur(12px)",
        xl: "blur(16px)",
        "2xl": "blur(20px)",
        "3xl": "blur(24px)",
      },
      brightness: {
        50: "brightness(0.5)",
        75: "brightness(0.75)",
        90: "brightness(0.9)",
        100: "brightness(1)",
        110: "brightness(1.1)",
        125: "brightness(1.25)",
        150: "brightness(1.5)",
      },
      contrast: {
        50: "contrast(0.5)",
        75: "contrast(0.75)",
        100: "contrast(1)",
        125: "contrast(1.25)",
        150: "contrast(1.5)",
        200: "contrast(2)",
      },
      saturate: {
        0: "saturate(0)",
        50: "saturate(0.5)",
        100: "saturate(1)",
        150: "saturate(1.5)",
        200: "saturate(2)",
      },
    },
    // Transformações 3D
    transform: {
      perspective: {
        none: "none",
        sm: "500px",
        md: "1000px",
        lg: "1500px",
        xl: "2000px",
      },
      rotate: {
        x: {
          1: "rotateX(1deg)",
          2: "rotateX(2deg)",
          3: "rotateX(3deg)",
          6: "rotateX(6deg)",
          12: "rotateX(12deg)",
        },
        y: {
          1: "rotateY(1deg)",
          2: "rotateY(2deg)",
          3: "rotateY(3deg)",
          6: "rotateY(6deg)",
          12: "rotateY(12deg)",
        },
        z: {
          1: "rotateZ(1deg)",
          2: "rotateZ(2deg)",
          3: "rotateZ(3deg)",
          6: "rotateZ(6deg)",
          12: "rotateZ(12deg)",
        },
      },
    },
  },

  // ========================================
  // BREAKPOINTS RESPONSIVOS
  // ========================================
  breakpoints: {
    xs: "475px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // ========================================
  // Z-INDEX HIERARCHY
  // ========================================
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
} as const;

// ========================================
// UTILITÁRIOS DE CSS-IN-JS
// ========================================
export const cssHelpers = {
  // Glassmorphism
  glass: (opacity = 0.1) => ({
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: "blur(20px)",
    border: `1px solid rgba(255, 255, 255, ${opacity * 2})`,
    boxShadow: premiumTokens.shadows.glass.light,
  }),

  // Neumorphism
  neomorphic: (pressed = false) => ({
    background: "#f0f0f0",
    boxShadow: pressed
      ? premiumTokens.shadows.neomorphic.pressed
      : premiumTokens.shadows.neomorphic.flat,
  }),

  // Gradiente de texto
  gradientText: (gradient: string) => ({
    background: gradient,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  }),

  // Animação shimmer para loading
  shimmer: () => ({
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: `shimmer 2s infinite linear`,
  }),

  // Scrollbar customizada
  customScrollbar: () => ({
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f1f1",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: premiumTokens.colors.prosperity[500],
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: premiumTokens.colors.prosperity[600],
    },
  }),
};

export default premiumTokens;

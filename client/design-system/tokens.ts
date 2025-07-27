// =============================================================================
// DESIGN TOKENS KRYONIX - BRASIL
// Sistema de design otimizado para empreendedores brasileiros
// Paleta de cores que transmite confiança e prosperidade
// =============================================================================

// 🇧🇷 IDENTIDADE VISUAL BRASILEIRA
// Verde: Prosperidade, crescimento financeiro, PIX
// Laranja: Energia, WhatsApp Business, crescimento
// Azul: Confiança institucional, tecnologia, Brasil

// CORES PRIMÁRIAS BRASILEIRAS
export const colors = {
  // KRYONIX Verde (Cor principal) - Prosperidade financeira brasileira
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Verde KRYONIX - confiança financeira
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Brand Secondary (Para compatibilidade)
  brand: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Mesmo que primary
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  // Energia Laranja - WhatsApp Business, crescimento, energia
  energy: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Laranja vibrante brasileiro
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },

  // Azul Brasil - Institucional, tecnologia, confiabilidade
  institutional: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Azul Brasil institucional
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // WhatsApp Oficial (para componentes específicos)
  whatsapp: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#25d366', // Verde WhatsApp oficial
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // PIX Verde (para componentes financeiros)
  pix: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Verde PIX
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Accent Colors
  accent: {
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },

  // Neutral Colors
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Gradientes Brasileiros
  gradients: {
    // Gradiente KRYONIX principal (verde para azul)
    primary: 'linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)',
    // Prosperidade brasileira (verde para laranja)
    prosperity: 'linear-gradient(135deg, #22c55e 0%, #f97316 100%)',
    // WhatsApp Business
    whatsapp: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
    // PIX (tons de verde)
    pix: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    // Brasil (verde, amarelo, azul)
    brasil: 'linear-gradient(135deg, #22c55e 0%, #f59e0b 50%, #0ea5e9 100%)',
    // Energia empreendedora
    energy: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    // Tecnologia brasileira
    tech: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
    // Success mantido
    success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    // Gradientes especiais brasileiros
    sunset: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
    ocean: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  }
} as const;

// TIPOGRAFIA OTIMIZADA PARA PORTUGUÊS BRASILEIRO
export const typography = {
  fontFamily: {
    // Fonte principal otimizada para acentos PT-BR
    sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
    // Fonte amigável para empreendedores brasileiros
    display: ['Poppins', 'Inter', 'Roboto', 'system-ui', 'sans-serif'],
    // Fonte para números e valores financeiros
    numeric: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
  },
  
  // Tamanhos otimizados para mobile brasileiro (80% dos usuários)
  fontSize: {
    // Mobile-first: tamanhos maiores para melhor legibilidade
    xs: ['0.8rem', { lineHeight: '1.125rem' }],  // Maior que padrão para acentos PT-BR
    sm: ['0.9rem', { lineHeight: '1.375rem' }],  // Otimizado para mobile
    base: ['1rem', { lineHeight: '1.5rem' }],    // Base confortável
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.875rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1.1' }],
    '6xl': ['3.75rem', { lineHeight: '1.1' }],
    '7xl': ['4.5rem', { lineHeight: '1.1' }],
    '8xl': ['6rem', { lineHeight: '1.1' }],
    '9xl': ['8rem', { lineHeight: '1.1' }],
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ESPAÇAMENTO
export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

// BORDER RADIUS
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

// SOMBRAS
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
  
  // Sombras coloridas para elementos especiais
  brand: '0 10px 15px -3px rgb(59 130 246 / 0.1), 0 4px 6px -4px rgb(59 130 246 / 0.1)',
  success: '0 10px 15px -3px rgb(34 197 94 / 0.1), 0 4px 6px -4px rgb(34 197 94 / 0.1)',
  warning: '0 10px 15px -3px rgb(245 158 11 / 0.1), 0 4px 6px -4px rgb(245 158 11 / 0.1)',
  error: '0 10px 15px -3px rgb(239 68 68 / 0.1), 0 4px 6px -4px rgb(239 68 68 / 0.1)',
} as const;

// BREAKPOINTS OTIMIZADOS PARA DISPOSITIVOS BRASILEIROS
export const breakpoints = {
  // Mobile brasileiro (Galaxy J2 Core, devices populares)
  xs: '360px',   // Dispositivos pequenos mais comuns no Brasil
  sm: '414px',   // iPhone Plus, Galaxy S
  md: '768px',   // Tablets
  lg: '1024px',  // Desktop pequeno
  xl: '1280px',  // Desktop médio
  '2xl': '1536px', // Desktop grande
} as const;

// ANIMAÇÕES
export const animations = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Z-INDEX
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// COMPONENTES OTIMIZADOS PARA TOUCH BRASILEIRO
export const componentSizes = {
  // Botões com touch targets >= 44px (recomendação mobile)
  button: {
    xs: { height: '2rem', padding: '0 0.75rem', fontSize: '0.8rem' },   // 32px mínimo
    sm: { height: '2.5rem', padding: '0 1rem', fontSize: '0.9rem' },    // 40px
    md: { height: '2.75rem', padding: '0 1.25rem', fontSize: '0.9rem' }, // 44px - ideal touch
    lg: { height: '3rem', padding: '0 1.5rem', fontSize: '1rem' },      // 48px - confortável
    xl: { height: '3.5rem', padding: '0 2rem', fontSize: '1.125rem' },  // 56px - destaque
  },
  
  // Inputs otimizados para mobile brasileiro
  input: {
    sm: { height: '2.5rem', padding: '0 0.75rem', fontSize: '0.9rem' },  // 40px mínimo
    md: { height: '2.75rem', padding: '0 1rem', fontSize: '1rem' },      // 44px - ideal
    lg: { height: '3rem', padding: '0 1rem', fontSize: '1rem' },         // 48px - confortável
  },
  
  avatar: {
    xs: { size: '1.5rem' },
    sm: { size: '2rem' },
    md: { size: '2.5rem' },
    lg: { size: '3rem' },
    xl: { size: '4rem' },
    '2xl': { size: '5rem' },
  },
} as const;

// CONFIGURAÇÕES DE TEMA BRASILEIRO
export const themeConfig = {
  light: {
    background: colors.neutral[0],
    foreground: colors.neutral[900],
    card: colors.neutral[0],
    cardForeground: colors.neutral[950],
    popover: colors.neutral[0],
    popoverForeground: colors.neutral[950],
    // Usando a nova paleta verde KRYONIX
    primary: colors.primary[500],         // Verde prosperidade
    primaryForeground: colors.neutral[0],
    secondary: colors.energy[50],         // Laranja suave
    secondaryForeground: colors.energy[700],
    muted: colors.neutral[100],
    mutedForeground: colors.neutral[500],
    accent: colors.institutional[50],     // Azul suave
    accentForeground: colors.institutional[700],
    destructive: colors.accent.error[500],
    destructiveForeground: colors.neutral[0],
    border: colors.neutral[200],
    input: colors.neutral[200],
    ring: colors.primary[500],            // Verde foco
    // Cores brasileiras específicas
    success: colors.primary[500],         // Verde sucesso
    warning: colors.accent.warning[500],  // Amarelo brasileiro
    info: colors.institutional[500],      // Azul informação
    whatsapp: colors.whatsapp[500],      // Verde WhatsApp
    pix: colors.pix[500],                // Verde PIX
  },
  
  dark: {
    background: colors.neutral[950],
    foreground: colors.neutral[50],
    card: colors.neutral[900],
    cardForeground: colors.neutral[50],
    popover: colors.neutral[900],
    popoverForeground: colors.neutral[50],
    // Tema escuro com identidade brasileira
    primary: colors.primary[400],         // Verde mais claro
    primaryForeground: colors.neutral[950],
    secondary: colors.neutral[800],
    secondaryForeground: colors.neutral[50],
    muted: colors.neutral[800],
    mutedForeground: colors.neutral[400],
    accent: colors.institutional[900],
    accentForeground: colors.neutral[50],
    destructive: colors.accent.error[500],
    destructiveForeground: colors.neutral[50],
    border: colors.neutral[700],
    input: colors.neutral[700],
    ring: colors.primary[400],
    // Cores brasileiras no modo escuro
    success: colors.primary[400],
    warning: colors.accent.warning[400],
    info: colors.institutional[400],
    whatsapp: colors.whatsapp[400],
    pix: colors.pix[400],
  },
} as const;

// CONSTANTES BRASILEIRAS ESPECÍFICAS
export const brazilianConstants = {
  currency: 'BRL',
  locale: 'pt-BR',
  timezone: 'America/Sao_Paulo',

  // Emojis brasileiros para componentes
  emojis: {
    money: '💰',
    pix: '🏦',
    whatsapp: '💬',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    brazil: '🇧🇷',
    energy: '⚡',
    growth: '📈',
    business: '🏢',
    user: '👤',
    settings: '⚙️',
  },

  // Configurações mobile brasileiras
  mobile: {
    minTouchTarget: '44px',
    preferredTouchTarget: '48px',
    maxContentWidth: '375px', // iPhone SE/8 width
    bottomNavHeight: '60px',
  },

  // Status em português
  status: {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    processing: 'Processando',
  },
} as const;

// TIPOS TYPESCRIPT EXPANDIDOS
export type ColorScale = typeof colors.primary;
export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
export type BreakpointKey = keyof typeof breakpoints;
export type ZIndexKey = keyof typeof zIndex;
export type ThemeMode = keyof typeof themeConfig;
export type BrazilianConstantsKey = keyof typeof brazilianConstants;
export type EmojiKey = keyof typeof brazilianConstants.emojis;
export type StatusKey = keyof typeof brazilianConstants.status;

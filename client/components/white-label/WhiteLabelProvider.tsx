import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Tipos do sistema White Label
export interface WhiteLabelConfig {
  id: string;
  tenantId: string;
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  customDomain?: string;
  isActive: boolean;
  theme: "light" | "dark" | "auto";
  fontFamily: string;
  customCSS?: string;
  hidePoweredBy: boolean;
  features: {
    whatsapp: boolean;
    ai: boolean;
    automation: boolean;
    analytics: boolean;
    api: boolean;
  };
  limits: {
    users: number;
    messages: number;
    storage: number;
    aiRequests: number;
  };
  branding: {
    loginBackground?: string;
    emailHeader?: string;
    welcomeMessage?: string;
    supportEmail: string;
    termsUrl?: string;
    privacyUrl?: string;
  };
}

interface WhiteLabelContextType {
  config: WhiteLabelConfig | null;
  isWhiteLabel: boolean;
  isLoading: boolean;
  error: string | null;
  updateConfig: (updates: Partial<WhiteLabelConfig>) => Promise<void>;
  refreshConfig: () => Promise<void>;
  applyTheme: (config: WhiteLabelConfig) => void;
  resetToDefault: () => void;
}

const defaultConfig: WhiteLabelConfig = {
  id: "default",
  tenantId: "default",
  companyName: "KRYONIX",
  primaryColor: "#0ea5e9",
  secondaryColor: "#9333ea",
  accentColor: "#22c55e",
  isActive: false,
  theme: "light",
  fontFamily: "Inter",
  hidePoweredBy: false,
  features: {
    whatsapp: true,
    ai: true,
    automation: true,
    analytics: true,
    api: true,
  },
  limits: {
    users: 10,
    messages: 1000,
    storage: 1,
    aiRequests: 100,
  },
  branding: {
    supportEmail: "suporte@kryonix.com.br",
    welcomeMessage: "Bem-vindo ao KRYONIX",
  },
};

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(
  undefined,
);

interface WhiteLabelProviderProps {
  children: ReactNode;
  tenantId?: string;
  customDomain?: string;
}

export function WhiteLabelProvider({
  children,
  tenantId,
  customDomain,
}: WhiteLabelProviderProps) {
  const [config, setConfig] = useState<WhiteLabelConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detectar contexto do tenant automaticamente
  const detectTenantContext = (): { tenantId?: string; domain?: string } => {
    const hostname = window.location.hostname;

    // Se é um domínio personalizado (não contém kryonix.com.br)
    if (!hostname.includes("kryonix.com.br") && hostname !== "localhost") {
      return { domain: hostname };
    }

    // Se é um subdomínio
    const subdomain = hostname.split(".")[0];
    if (subdomain && subdomain !== "www" && subdomain !== "app") {
      return { tenantId: subdomain };
    }

    // Se foi passado explicitamente
    if (tenantId) {
      return { tenantId };
    }

    if (customDomain) {
      return { domain: customDomain };
    }

    return {};
  };

  // Carregar configuração do white label
  const loadWhiteLabelConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const context = detectTenantContext();

      // Se não tem contexto de tenant, usar configuração padrão
      if (!context.tenantId && !context.domain) {
        setConfig(defaultConfig);
        setIsLoading(false);
        return;
      }

      // Buscar configuração do servidor
      const params = new URLSearchParams();
      if (context.tenantId) params.append("tenantId", context.tenantId);
      if (context.domain) params.append("domain", context.domain);

      const response = await fetch(`/api/v1/white-label/config?${params}`);

      if (!response.ok) {
        throw new Error("Configuração white label não encontrada");
      }

      const data = await response.json();

      if (data.success && data.config) {
        setConfig(data.config);
        applyTheme(data.config);
      } else {
        setConfig(defaultConfig);
      }
    } catch (err) {
      console.error("Erro ao carregar configuração white label:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setConfig(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  };

  // Aplicar tema visual
  const applyTheme = (config: WhiteLabelConfig) => {
    const root = document.documentElement;

    // Aplicar cores CSS custom properties
    root.style.setProperty("--primary-color", config.primaryColor);
    root.style.setProperty("--secondary-color", config.secondaryColor);
    root.style.setProperty(
      "--accent-color",
      config.accentColor || config.primaryColor,
    );
    root.style.setProperty("--brand-font-family", config.fontFamily || "Inter");

    // Aplicar tema claro/escuro
    if (config.theme === "dark") {
      root.classList.add("dark");
    } else if (config.theme === "light") {
      root.classList.remove("dark");
    } else if (config.theme === "auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }

    // Aplicar CSS customizado
    if (config.customCSS) {
      let styleElement = document.getElementById("white-label-custom-styles");
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = "white-label-custom-styles";
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = config.customCSS;
    }

    // Atualizar favicon se definido
    if (config.faviconUrl) {
      const favicon = document.querySelector(
        'link[rel="icon"]',
      ) as HTMLLinkElement;
      if (favicon) {
        favicon.href = config.faviconUrl;
      }
    }

    // Atualizar título da página
    if (config.companyName) {
      document.title = `${config.companyName} - Plataforma de Automação`;
    }
  };

  // Atualizar configuração
  const updateConfig = async (updates: Partial<WhiteLabelConfig>) => {
    if (!config) return;

    try {
      const updatedConfig = { ...config, ...updates };

      const response = await fetch("/api/v1/white-label/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar configuração");
      }

      setConfig(updatedConfig);
      applyTheme(updatedConfig);
    } catch (err) {
      console.error("Erro ao atualizar configuração:", err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  // Recarregar configuração
  const refreshConfig = async () => {
    await loadWhiteLabelConfig();
  };

  // Resetar para configuração padrão
  const resetToDefault = () => {
    setConfig(defaultConfig);
    applyTheme(defaultConfig);
  };

  // Carregar configuração na inicialização
  useEffect(() => {
    loadWhiteLabelConfig();
  }, [tenantId, customDomain]);

  // Escutar mudanças de tema do sistema
  useEffect(() => {
    if (config?.theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme(config);

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [config?.theme]);

  const value: WhiteLabelContextType = {
    config,
    isWhiteLabel: config?.isActive || false,
    isLoading,
    error,
    updateConfig,
    refreshConfig,
    applyTheme,
    resetToDefault,
  };

  return (
    <WhiteLabelContext.Provider value={value}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

// Hook para usar o contexto
export function useWhiteLabel(): WhiteLabelContextType {
  const context = useContext(WhiteLabelContext);
  if (context === undefined) {
    throw new Error(
      "useWhiteLabel deve ser usado dentro de WhiteLabelProvider",
    );
  }
  return context;
}

// Hook para verificar se está em modo white label
export function useIsWhiteLabel(): boolean {
  const { isWhiteLabel } = useWhiteLabel();
  return isWhiteLabel;
}

// Hook para obter configuração de branding
export function useBranding() {
  const { config, isWhiteLabel } = useWhiteLabel();

  if (!config || !isWhiteLabel) {
    return {
      companyName: "KRYONIX",
      logoUrl: undefined,
      primaryColor: "#0ea5e9",
      secondaryColor: "#9333ea",
      hidePoweredBy: false,
      supportEmail: "suporte@kryonix.com.br",
    };
  }

  return {
    companyName: config.companyName,
    logoUrl: config.logoUrl,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    hidePoweredBy: config.hidePoweredBy,
    supportEmail: config.branding.supportEmail,
    welcomeMessage: config.branding.welcomeMessage,
    loginBackground: config.branding.loginBackground,
  };
}

// Hook para verificar features habilitadas
export function useFeatures() {
  const { config, isWhiteLabel } = useWhiteLabel();

  if (!config || !isWhiteLabel) {
    return {
      whatsapp: true,
      ai: true,
      automation: true,
      analytics: true,
      api: true,
    };
  }

  return config.features;
}

// Hook para verificar limites
export function useLimits() {
  const { config, isWhiteLabel } = useWhiteLabel();

  if (!config || !isWhiteLabel) {
    return {
      users: Infinity,
      messages: Infinity,
      storage: Infinity,
      aiRequests: Infinity,
    };
  }

  return config.limits;
}

export default WhiteLabelProvider;

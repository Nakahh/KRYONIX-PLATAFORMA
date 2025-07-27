import { Router } from "express";
import { Request, Response } from "express";

const router = Router();

// Interfaces para White Label
interface WhiteLabelConfig {
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
  createdAt: Date;
  updatedAt: Date;
}

interface Partner {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  cnpj?: string;
  domain?: string;
  plan: string;
  status: "active" | "inactive" | "pending" | "suspended";
  createdAt: Date;
  lastLogin?: Date;
  monthlyRevenue: number;
  totalUsers: number;
  features: string[];
  supportTickets: number;
  whiteLabelConfig?: WhiteLabelConfig;
}

// Mock data para desenvolvimento
const mockConfigs: WhiteLabelConfig[] = [
  {
    id: "1",
    tenantId: "tenant-1",
    companyName: "TechCorp Brasil",
    logoUrl:
      "https://cdn.builder.io/api/v1/image/assets%2Ff3c03838ba934db3a83fe16fb45b6ea7%2F87344dc399db4250bef1180e4c9b1b76?format=webp&width=200",
    faviconUrl: "",
    primaryColor: "#2563eb",
    secondaryColor: "#7c3aed",
    accentColor: "#22c55e",
    customDomain: "app.techcorp.com.br",
    isActive: true,
    theme: "light",
    fontFamily: "Inter",
    customCSS: "",
    hidePoweredBy: true,
    features: {
      whatsapp: true,
      ai: true,
      automation: true,
      analytics: true,
      api: true,
    },
    limits: {
      users: 150,
      messages: 10000,
      storage: 10,
      aiRequests: 1000,
    },
    branding: {
      welcomeMessage: "Bem-vindo ao TechCorp Brasil",
      supportEmail: "suporte@techcorp.com.br",
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date(),
  },
  {
    id: "2",
    tenantId: "tenant-2",
    companyName: "Marketing Pro",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#059669",
    secondaryColor: "#dc2626",
    accentColor: "#f59e0b",
    customDomain: "sistema.marketingpro.com",
    isActive: true,
    theme: "auto",
    fontFamily: "Poppins",
    customCSS: "",
    hidePoweredBy: false,
    features: {
      whatsapp: true,
      ai: false,
      automation: true,
      analytics: true,
      api: false,
    },
    limits: {
      users: 25,
      messages: 2000,
      storage: 2,
      aiRequests: 100,
    },
    branding: {
      welcomeMessage: "Bem-vindo ao Marketing Pro",
      supportEmail: "suporte@marketingpro.com",
    },
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date(),
  },
];

const mockPartners: Partner[] = [
  {
    id: "1",
    companyName: "TechCorp Brasil",
    contactName: "João Silva",
    email: "joao@techcorp.com.br",
    phone: "(11) 99999-9999",
    cnpj: "12.345.678/0001-90",
    domain: "app.techcorp.com.br",
    plan: "Enterprise",
    status: "active",
    createdAt: new Date("2024-01-15"),
    lastLogin: new Date("2024-03-10"),
    monthlyRevenue: 697,
    totalUsers: 150,
    features: ["whatsapp", "ai", "automation", "white-label"],
    supportTickets: 2,
    whiteLabelConfig: mockConfigs[0],
  },
  {
    id: "2",
    companyName: "Marketing Pro",
    contactName: "Maria Santos",
    email: "maria@marketingpro.com",
    phone: "(21) 88888-8888",
    domain: "sistema.marketingpro.com",
    plan: "Professional",
    status: "active",
    createdAt: new Date("2024-02-01"),
    lastLogin: new Date("2024-03-09"),
    monthlyRevenue: 297,
    totalUsers: 25,
    features: ["whatsapp", "automation", "marketing"],
    supportTickets: 0,
    whiteLabelConfig: mockConfigs[1],
  },
];

// GET /api/v1/white-label/config - Obter configuração por tenant ou domínio
router.get("/config", async (req: Request, res: Response) => {
  try {
    const { tenantId, domain } = req.query;

    let config: WhiteLabelConfig | undefined;

    if (tenantId) {
      config = mockConfigs.find((c) => c.tenantId === tenantId);
    } else if (domain) {
      config = mockConfigs.find((c) => c.customDomain === domain);
    } else {
      return res.status(400).json({
        success: false,
        message: "tenantId ou domain é obrigatório",
      });
    }

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuração white label não encontrada",
      });
    }

    res.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("Erro ao obter configuração white label:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// PUT /api/v1/white-label/config - Atualizar configuração
router.put("/config", async (req: Request, res: Response) => {
  try {
    const updates: Partial<WhiteLabelConfig> = req.body;

    if (!updates.id) {
      return res.status(400).json({
        success: false,
        message: "ID da configuração é obrigatório",
      });
    }

    const configIndex = mockConfigs.findIndex((c) => c.id === updates.id);

    if (configIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Configuração não encontrada",
      });
    }

    // Atualizar configuração
    mockConfigs[configIndex] = {
      ...mockConfigs[configIndex],
      ...updates,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      config: mockConfigs[configIndex],
    });
  } catch (error) {
    console.error("Erro ao atualizar configuração:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// POST /api/v1/white-label/config - Criar nova configuração
router.post("/config", async (req: Request, res: Response) => {
  try {
    const configData: Partial<WhiteLabelConfig> = req.body;

    if (!configData.tenantId || !configData.companyName) {
      return res.status(400).json({
        success: false,
        message: "tenantId e companyName são obrigatórios",
      });
    }

    // Verificar se já existe configuração para o tenant
    const existingConfig = mockConfigs.find(
      (c) => c.tenantId === configData.tenantId,
    );
    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: "Configuração já existe para este tenant",
      });
    }

    const newConfig: WhiteLabelConfig = {
      id: `config-${Date.now()}`,
      tenantId: configData.tenantId!,
      companyName: configData.companyName!,
      logoUrl: configData.logoUrl,
      faviconUrl: configData.faviconUrl,
      primaryColor: configData.primaryColor || "#0ea5e9",
      secondaryColor: configData.secondaryColor || "#9333ea",
      accentColor: configData.accentColor || "#22c55e",
      customDomain: configData.customDomain,
      isActive: configData.isActive ?? true,
      theme: configData.theme || "light",
      fontFamily: configData.fontFamily || "Inter",
      customCSS: configData.customCSS || "",
      hidePoweredBy: configData.hidePoweredBy ?? false,
      features: configData.features || {
        whatsapp: true,
        ai: true,
        automation: true,
        analytics: true,
        api: true,
      },
      limits: configData.limits || {
        users: 10,
        messages: 1000,
        storage: 1,
        aiRequests: 100,
      },
      branding: configData.branding || {
        supportEmail: "suporte@empresa.com",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockConfigs.push(newConfig);

    res.status(201).json({
      success: true,
      config: newConfig,
    });
  } catch (error) {
    console.error("Erro ao criar configuração:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// GET /api/v1/white-label/partners - Listar parceiros
router.get("/partners", async (req: Request, res: Response) => {
  try {
    const { status, plan, search } = req.query;

    let filteredPartners = [...mockPartners];

    // Filtrar por status
    if (status && status !== "all") {
      filteredPartners = filteredPartners.filter((p) => p.status === status);
    }

    // Filtrar por plano
    if (plan && plan !== "all") {
      filteredPartners = filteredPartners.filter((p) => p.plan === plan);
    }

    // Busca por texto
    if (search) {
      const searchTerm = search.toString().toLowerCase();
      filteredPartners = filteredPartners.filter(
        (p) =>
          p.companyName.toLowerCase().includes(searchTerm) ||
          p.contactName.toLowerCase().includes(searchTerm) ||
          p.email.toLowerCase().includes(searchTerm),
      );
    }

    // Estatísticas
    const stats = {
      total: mockPartners.length,
      active: mockPartners.filter((p) => p.status === "active").length,
      totalRevenue: mockPartners.reduce((sum, p) => sum + p.monthlyRevenue, 0),
      totalUsers: mockPartners.reduce((sum, p) => sum + p.totalUsers, 0),
    };

    res.json({
      success: true,
      partners: filteredPartners,
      stats,
    });
  } catch (error) {
    console.error("Erro ao listar parceiros:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// POST /api/v1/white-label/partners - Criar novo parceiro
router.post("/partners", async (req: Request, res: Response) => {
  try {
    const partnerData: Partial<Partner> = req.body;

    if (!partnerData.companyName || !partnerData.email) {
      return res.status(400).json({
        success: false,
        message: "companyName e email são obrigatórios",
      });
    }

    // Verificar se email já existe
    const existingPartner = mockPartners.find(
      (p) => p.email === partnerData.email,
    );
    if (existingPartner) {
      return res.status(409).json({
        success: false,
        message: "Email já está em uso",
      });
    }

    const newPartner: Partner = {
      id: `partner-${Date.now()}`,
      companyName: partnerData.companyName!,
      contactName: partnerData.contactName || "",
      email: partnerData.email!,
      phone: partnerData.phone,
      cnpj: partnerData.cnpj,
      domain: partnerData.domain,
      plan: partnerData.plan || "Starter",
      status: "pending",
      createdAt: new Date(),
      monthlyRevenue: 0,
      totalUsers: 0,
      features: partnerData.features || ["whatsapp"],
      supportTickets: 0,
    };

    mockPartners.push(newPartner);

    res.status(201).json({
      success: true,
      partner: newPartner,
    });
  } catch (error) {
    console.error("Erro ao criar parceiro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// GET /api/v1/white-label/partners/:id - Obter parceiro específico
router.get("/partners/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const partner = mockPartners.find((p) => p.id === id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Parceiro não encontrado",
      });
    }

    res.json({
      success: true,
      partner,
    });
  } catch (error) {
    console.error("Erro ao obter parceiro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// PUT /api/v1/white-label/partners/:id - Atualizar parceiro
router.put("/partners/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Partner> = req.body;

    const partnerIndex = mockPartners.findIndex((p) => p.id === id);

    if (partnerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Parceiro não encontrado",
      });
    }

    // Atualizar parceiro
    mockPartners[partnerIndex] = {
      ...mockPartners[partnerIndex],
      ...updates,
    };

    res.json({
      success: true,
      partner: mockPartners[partnerIndex],
    });
  } catch (error) {
    console.error("Erro ao atualizar parceiro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// GET /api/v1/white-label/analytics - Analytics do sistema
router.get("/analytics", async (req: Request, res: Response) => {
  try {
    const analytics = {
      partners: {
        total: mockPartners.length,
        active: mockPartners.filter((p) => p.status === "active").length,
        byPlan: {
          enterprise: mockPartners.filter((p) => p.plan === "Enterprise")
            .length,
          professional: mockPartners.filter((p) => p.plan === "Professional")
            .length,
          starter: mockPartners.filter((p) => p.plan === "Starter").length,
        },
      },
      revenue: {
        total: mockPartners.reduce((sum, p) => sum + p.monthlyRevenue, 0),
        growth: 18.5,
        byPlan: {
          enterprise: mockPartners
            .filter((p) => p.plan === "Enterprise")
            .reduce((sum, p) => sum + p.monthlyRevenue, 0),
          professional: mockPartners
            .filter((p) => p.plan === "Professional")
            .reduce((sum, p) => sum + p.monthlyRevenue, 0),
          starter: mockPartners
            .filter((p) => p.plan === "Starter")
            .reduce((sum, p) => sum + p.monthlyRevenue, 0),
        },
      },
      users: {
        total: mockPartners.reduce((sum, p) => sum + p.totalUsers, 0),
        average: Math.round(
          mockPartners.reduce((sum, p) => sum + p.totalUsers, 0) /
            mockPartners.length,
        ),
      },
      satisfaction: 98.5,
      trends: {
        partnersGrowth: [25, 30, 35, 40, 43, 47],
        revenueGrowth: [28000, 32000, 35000, 38000, 40000, 42840],
        usersGrowth: [1800, 2100, 2400, 2700, 3000, 3248],
      },
    };

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Erro ao obter analytics:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

// POST /api/v1/white-label/validate-domain - Validar domínio personalizado
router.post("/validate-domain", async (req: Request, res: Response) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "Domínio é obrigatório",
      });
    }

    // Verificar se domínio já está em uso
    const existingConfig = mockConfigs.find((c) => c.customDomain === domain);

    if (existingConfig) {
      return res.status(409).json({
        success: false,
        message: "Domínio já está em uso",
      });
    }

    // Simular validação de DNS
    const isValid = domain.match(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Formato de domínio inválido",
      });
    }

    res.json({
      success: true,
      message: "Domínio válido e disponível",
      dnsInstructions: {
        type: "CNAME",
        name: "@",
        value: "kryonix-platform.vercel.app",
        ttl: 300,
      },
    });
  } catch (error) {
    console.error("Erro ao validar domínio:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

export default router;

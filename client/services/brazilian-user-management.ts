// Sistema de Gestão de Usuários KRYONIX - Focado no Mercado Brasileiro
// Controle de acesso, permissões e colaboração empresarial

export interface BrazilianUser {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: {
    tipo: "CPF" | "CNPJ";
    numero: string;
    valido: boolean;
  };
  avatar: string;
  cargo: string;
  departamento: string;
  empresa: {
    id: string;
    nome: string;
    cnpj: string;
    segmento: string;
    porte: "MEI" | "MICRO" | "PEQUENA" | "MEDIA" | "GRANDE";
  };
  endereco: {
    cep: string;
    estado: string;
    cidade: string;
    bairro: string;
    logradouro: string;
    numero: string;
    complemento?: string;
  };
  role: UserRole;
  permissions: Permission[];
  configuracoes: UserSettings;
  status: "ativo" | "inativo" | "suspenso" | "aguardando_confirmacao";
  ultimoLogin: Date;
  dataCriacao: Date;
  dataAtualizacao: Date;
  lgpdConsent: {
    aceito: boolean;
    dataAceite: Date;
    versaoTermos: string;
    ipAceite: string;
  };
  dadosComplementares: {
    fusoHorario: string;
    idioma: string;
    preferenciasNotificacao: NotificationPreferences;
    integracoesAtivas: string[];
  };
}

export interface UserRole {
  id: string;
  nome: string;
  descricao: string;
  nivel: number; // 1-10 (1 = básico, 10 = super admin)
  categoria:
    | "funcionario"
    | "gerente"
    | "diretor"
    | "admin"
    | "owner"
    | "cliente"
    | "parceiro";
  permissoesIncluidas: Permission[];
  limitacoes: RoleLimitations;
  custoMensal?: number; // em R$
  corIdentificacao: string;
  icone: string;
}

export interface Permission {
  id: string;
  nome: string;
  descricao: string;
  categoria:
    | "dashboard"
    | "whatsapp"
    | "automacao"
    | "vendas"
    | "relatorios"
    | "configuracoes"
    | "usuarios"
    | "admin";
  acao:
    | "visualizar"
    | "criar"
    | "editar"
    | "excluir"
    | "gerenciar"
    | "configurar";
  recurso: string;
  condicoes?: PermissionConditions;
  restrito: boolean;
  requireApproval?: boolean;
}

export interface RoleLimitations {
  maxUsuarios?: number;
  maxInstanciasWhatsApp?: number;
  maxWorkflows?: number;
  maxChatbots?: number;
  limiteMensalMensagens?: number;
  acessoHorario?: {
    inicio: string;
    fim: string;
    diasSemana: number[];
  };
  ipPermitidos?: string[];
  dispositivosSimultaneos?: number;
}

export interface PermissionConditions {
  tempoLimite?: number; // em horas
  aprovacaoRequerida?: boolean;
  logAuditoria?: boolean;
  notificarSupervisor?: boolean;
  restricaoIP?: string[];
  restricaoHorario?: {
    inicio: string;
    fim: string;
  };
}

export interface UserSettings {
  tema: "light" | "dark" | "auto";
  idioma: "pt-BR";
  fusoHorario: "America/Sao_Paulo";
  formatoData: "DD/MM/YYYY" | "DD-MM-YYYY";
  formatoHora: "24h" | "12h";
  moeda: "BRL";
  notificacoes: NotificationPreferences;
  dashboardPersonalizado: DashboardCustomization;
  integracoes: IntegrationSettings;
  privacidade: PrivacySettings;
}

export interface NotificationPreferences {
  email: {
    ativo: boolean;
    frequencia: "imediata" | "diaria" | "semanal";
    tipos: string[];
  };
  whatsapp: {
    ativo: boolean;
    numero: string;
    horarioPermitido: {
      inicio: string;
      fim: string;
    };
  };
  push: {
    ativo: boolean;
    navegador: boolean;
    mobile: boolean;
  };
  slack: {
    ativo: boolean;
    webhook?: string;
  };
}

export interface DashboardCustomization {
  layout: "compacto" | "padrao" | "expandido";
  widgets: string[];
  coresPersonalizadas: {
    primaria: string;
    secundaria: string;
    destaque: string;
  };
  metricas: string[];
  atualizacaoAutomatica: boolean;
  filtrosPadrao: Record<string, any>;
}

export interface IntegrationSettings {
  whatsapp: {
    instanciasPermitidas: string[];
    webhooksAtivos: string[];
    limiteMensagens: number;
  };
  n8n: {
    workflowsAcessiveis: string[];
    execucoesPermitidas: number;
  };
  apis: {
    chaves: Record<string, string>;
    limitesRate: Record<string, number>;
  };
}

export interface PrivacySettings {
  perfilPublico: boolean;
  compartilharDados: boolean;
  logAtividades: boolean;
  retencaoDados: number; // em dias
  consentimentosEspecificos: Record<string, boolean>;
}

export interface UserActivity {
  id: string;
  userId: string;
  acao: string;
  recurso: string;
  detalhes: Record<string, any>;
  ip: string;
  userAgent: string;
  localizacao?: {
    pais: string;
    estado: string;
    cidade: string;
  };
  timestamp: Date;
  categoria:
    | "login"
    | "logout"
    | "create"
    | "read"
    | "update"
    | "delete"
    | "config"
    | "integration";
  resultado: "sucesso" | "falha" | "bloqueado";
  observacoes?: string;
}

export interface TeamCollaboration {
  id: string;
  nome: string;
  descricao: string;
  membros: TeamMember[];
  projetos: string[];
  canais: CollaborationChannel[];
  configuracoes: TeamSettings;
  estatisticas: TeamStats;
  dataCriacao: Date;
}

export interface TeamMember {
  userId: string;
  role: string;
  dataAdesao: Date;
  status: "ativo" | "inativo";
  contribuicoes: number;
  avaliacao: number;
}

export interface CollaborationChannel {
  id: string;
  nome: string;
  tipo: "chat" | "arquivo" | "projeto" | "whatsapp" | "webhook";
  configuracao: Record<string, any>;
  ativo: boolean;
}

export interface TeamSettings {
  visibilidade: "publica" | "privada" | "empresa";
  aprovarNovos: boolean;
  limiteMembros: number;
  integracoesPermitidas: string[];
  nivelMinimo: number;
}

export interface TeamStats {
  totalMembros: number;
  atividadeDiaria: number;
  projetosAtivos: number;
  produtividade: number;
  satisfacao: number;
}

// Roles padrão para empresas brasileiras
export const BRAZILIAN_ROLES: UserRole[] = [
  {
    id: "estagiario",
    nome: "Estagiário",
    descricao: "Acesso limitado para aprendizado e tarefas básicas",
    nivel: 1,
    categoria: "funcionario",
    permissoesIncluidas: [],
    limitacoes: {
      maxInstanciasWhatsApp: 1,
      maxWorkflows: 2,
      limiteMensalMensagens: 1000,
      acessoHorario: {
        inicio: "08:00",
        fim: "17:00",
        diasSemana: [1, 2, 3, 4, 5],
      },
      dispositivosSimultaneos: 1,
    },
    custoMensal: 0,
    corIdentificacao: "#94a3b8",
    icone: "👨‍🎓",
  },
  {
    id: "assistente",
    nome: "Assistente",
    descricao: "Suporte em tarefas administrativas e operacionais",
    nivel: 2,
    categoria: "funcionario",
    permissoesIncluidas: [],
    limitacoes: {
      maxInstanciasWhatsApp: 2,
      maxWorkflows: 5,
      limiteMensalMensagens: 5000,
      dispositivosSimultaneos: 2,
    },
    custoMensal: 29.9,
    corIdentificacao: "#06b6d4",
    icone: "👨‍💼",
  },
  {
    id: "analista",
    nome: "Analista",
    descricao: "Análise de dados e execução de automações",
    nivel: 3,
    categoria: "funcionario",
    permissoesIncluidas: [],
    limitacoes: {
      maxInstanciasWhatsApp: 5,
      maxWorkflows: 15,
      maxChatbots: 3,
      limiteMensalMensagens: 20000,
      dispositivosSimultaneos: 3,
    },
    custoMensal: 59.9,
    corIdentificacao: "#8b5cf6",
    icone: "👨‍💻",
  },
  {
    id: "coordenador",
    nome: "Coordenador",
    descricao: "Coordenação de equipes e projetos específicos",
    nivel: 4,
    categoria: "gerente",
    permissoesIncluidas: [],
    limitacoes: {
      maxUsuarios: 10,
      maxInstanciasWhatsApp: 10,
      maxWorkflows: 30,
      maxChatbots: 8,
      limiteMensalMensagens: 50000,
      dispositivosSimultaneos: 4,
    },
    custoMensal: 149.9,
    corIdentificacao: "#10b981",
    icone: "👨‍🏫",
  },
  {
    id: "supervisor",
    nome: "Supervisor",
    descricao: "Supervisão de departamentos e aprovações",
    nivel: 5,
    categoria: "gerente",
    permissoesIncluidas: [],
    limitacoes: {
      maxUsuarios: 25,
      maxInstanciasWhatsApp: 20,
      maxWorkflows: 50,
      maxChatbots: 15,
      limiteMensalMensagens: 100000,
      dispositivosSimultaneos: 5,
    },
    custoMensal: 299.9,
    corIdentificacao: "#f59e0b",
    icone: "👨‍💼",
  },
  {
    id: "gerente",
    nome: "Gerente",
    descricao: "Gestão completa de departamentos e recursos",
    nivel: 6,
    categoria: "gerente",
    permissoesIncluidas: [],
    limitacoes: {
      maxUsuarios: 50,
      limiteMensalMensagens: 250000,
      dispositivosSimultaneos: 6,
    },
    custoMensal: 599.9,
    corIdentificacao: "#ef4444",
    icone: "👨‍💼",
  },
  {
    id: "diretor",
    nome: "Diretor",
    descricao: "Direção estratégica e decisões executivas",
    nivel: 7,
    categoria: "diretor",
    permissoesIncluidas: [],
    limitacoes: {
      maxUsuarios: 100,
      limiteMensalMensagens: 500000,
      dispositivosSimultaneos: 8,
    },
    custoMensal: 1199.9,
    corIdentificacao: "#dc2626",
    icone: "👨‍💼",
  },
  {
    id: "admin",
    nome: "Administrador",
    descricao: "Administração completa da plataforma",
    nivel: 8,
    categoria: "admin",
    permissoesIncluidas: [],
    limitacoes: {
      dispositivosSimultaneos: 10,
    },
    custoMensal: 1999.9,
    corIdentificacao: "#7c3aed",
    icone: "👨‍💻",
  },
  {
    id: "owner",
    nome: "Proprietário",
    descricao: "Controle total e propriedade da conta",
    nivel: 10,
    categoria: "owner",
    permissoesIncluidas: [],
    limitacoes: {},
    custoMensal: 0,
    corIdentificacao: "#1f2937",
    icone: "👑",
  },
];

// Permissões detalhadas
export const BRAZILIAN_PERMISSIONS: Permission[] = [
  // Dashboard
  {
    id: "dashboard_view",
    nome: "Visualizar Dashboard",
    descricao: "Acesso ao painel principal de controle",
    categoria: "dashboard",
    acao: "visualizar",
    recurso: "dashboard",
    restrito: false,
  },
  {
    id: "dashboard_customize",
    nome: "Personalizar Dashboard",
    descricao: "Customizar layout e widgets do dashboard",
    categoria: "dashboard",
    acao: "configurar",
    recurso: "dashboard_layout",
    restrito: false,
  },

  // WhatsApp
  {
    id: "whatsapp_view",
    nome: "Ver WhatsApp",
    descricao: "Visualizar conversas e estatísticas do WhatsApp",
    categoria: "whatsapp",
    acao: "visualizar",
    recurso: "whatsapp_conversations",
    restrito: false,
  },
  {
    id: "whatsapp_send",
    nome: "Enviar Mensagens",
    descricao: "Enviar mensagens via WhatsApp Business",
    categoria: "whatsapp",
    acao: "criar",
    recurso: "whatsapp_messages",
    restrito: false,
    condicoes: {
      logAuditoria: true,
      notificarSupervisor: true,
    },
  },
  {
    id: "whatsapp_broadcast",
    nome: "Envios em Massa",
    descricao: "Realizar broadcasts e campanhas em massa",
    categoria: "whatsapp",
    acao: "criar",
    recurso: "whatsapp_broadcast",
    restrito: true,
    requireApproval: true,
    condicoes: {
      aprovacaoRequerida: true,
      logAuditoria: true,
    },
  },
  {
    id: "whatsapp_manage_instances",
    nome: "Gerenciar Instâncias",
    descricao: "Criar e configurar instâncias do WhatsApp",
    categoria: "whatsapp",
    acao: "gerenciar",
    recurso: "whatsapp_instances",
    restrito: true,
  },

  // Automação
  {
    id: "automation_view",
    nome: "Ver Automações",
    descricao: "Visualizar workflows e automações existentes",
    categoria: "automacao",
    acao: "visualizar",
    recurso: "workflows",
    restrito: false,
  },
  {
    id: "automation_create",
    nome: "Criar Automações",
    descricao: "Desenvolver novos workflows e automações",
    categoria: "automacao",
    acao: "criar",
    recurso: "workflows",
    restrito: true,
    condicoes: {
      logAuditoria: true,
    },
  },
  {
    id: "automation_execute",
    nome: "Executar Automações",
    descricao: "Rodar workflows e processos automatizados",
    categoria: "automacao",
    acao: "gerenciar",
    recurso: "workflow_execution",
    restrito: true,
  },

  // Vendas
  {
    id: "sales_view",
    nome: "Ver Vendas",
    descricao: "Visualizar dados de vendas e conversões",
    categoria: "vendas",
    acao: "visualizar",
    recurso: "sales_data",
    restrito: false,
  },
  {
    id: "sales_manage",
    nome: "Gerenciar Vendas",
    descricao: "Gerenciar pipeline de vendas e clientes",
    categoria: "vendas",
    acao: "gerenciar",
    recurso: "sales_pipeline",
    restrito: true,
  },

  // Relatórios
  {
    id: "reports_view",
    nome: "Ver Relatórios",
    descricao: "Visualizar relatórios e métricas básicas",
    categoria: "relatorios",
    acao: "visualizar",
    recurso: "reports",
    restrito: false,
  },
  {
    id: "reports_create",
    nome: "Criar Relatórios",
    descricao: "Gerar relatórios personalizados",
    categoria: "relatorios",
    acao: "criar",
    recurso: "custom_reports",
    restrito: true,
  },
  {
    id: "reports_export",
    nome: "Exportar Relatórios",
    descricao: "Exportar dados em diversos formatos",
    categoria: "relatorios",
    acao: "configurar",
    recurso: "report_export",
    restrito: true,
  },

  // Usuários
  {
    id: "users_view",
    nome: "Ver Usuários",
    descricao: "Visualizar lista de usuários da empresa",
    categoria: "usuarios",
    acao: "visualizar",
    recurso: "user_list",
    restrito: true,
  },
  {
    id: "users_invite",
    nome: "Convidar Usuários",
    descricao: "Enviar convites para novos usuários",
    categoria: "usuarios",
    acao: "criar",
    recurso: "user_invitations",
    restrito: true,
    condicoes: {
      aprovacaoRequerida: true,
      logAuditoria: true,
    },
  },
  {
    id: "users_manage_roles",
    nome: "Gerenciar Funções",
    descricao: "Alterar roles e permissões de usuários",
    categoria: "usuarios",
    acao: "gerenciar",
    recurso: "user_roles",
    restrito: true,
    requireApproval: true,
  },

  // Configurações
  {
    id: "settings_view",
    nome: "Ver Configurações",
    descricao: "Visualizar configurações da empresa",
    categoria: "configuracoes",
    acao: "visualizar",
    recurso: "company_settings",
    restrito: true,
  },
  {
    id: "settings_edit",
    nome: "Editar Configurações",
    descricao: "Modificar configurações da plataforma",
    categoria: "configuracoes",
    acao: "editar",
    recurso: "platform_settings",
    restrito: true,
    requireApproval: true,
  },

  // Admin
  {
    id: "admin_full",
    nome: "Administração Completa",
    descricao: "Acesso total a todas as funcionalidades",
    categoria: "admin",
    acao: "gerenciar",
    recurso: "all",
    restrito: true,
  },
];

export class BrazilianUserManagement {
  private static instance: BrazilianUserManagement;
  private users: Map<string, BrazilianUser> = new Map();
  private activities: UserActivity[] = [];
  private teams: Map<string, TeamCollaboration> = new Map();

  public static getInstance(): BrazilianUserManagement {
    if (!BrazilianUserManagement.instance) {
      BrazilianUserManagement.instance = new BrazilianUserManagement();
    }
    return BrazilianUserManagement.instance;
  }

  private constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Dados reais de exemplo para demonstração
    const defaultUsers: BrazilianUser[] = [
      {
        id: "001",
        nome: "Vitor Fernandes",
        email: "vitor.nakahh@gmail.com",
        telefone: "+55 11 99999-9999",
        documento: {
          tipo: "CPF",
          numero: "123.456.789-00",
          valido: true,
        },
        avatar: "https://avatars.githubusercontent.com/u/1?v=4",
        cargo: "CEO & Founder",
        departamento: "Diretoria",
        empresa: {
          id: "kryonix",
          nome: "KRYONIX Tecnologia",
          cnpj: "12.345.678/0001-90",
          segmento: "Tecnologia da Informação",
          porte: "PEQUENA",
        },
        endereco: {
          cep: "01310-100",
          estado: "SP",
          cidade: "São Paulo",
          bairro: "Bela Vista",
          logradouro: "Avenida Paulista",
          numero: "1000",
        },
        role: BRAZILIAN_ROLES.find((r) => r.id === "owner")!,
        permissions: BRAZILIAN_PERMISSIONS,
        configuracoes: {
          tema: "dark",
          idioma: "pt-BR",
          fusoHorario: "America/Sao_Paulo",
          formatoData: "DD/MM/YYYY",
          formatoHora: "24h",
          moeda: "BRL",
          notificacoes: {
            email: { ativo: true, frequencia: "imediata", tipos: ["all"] },
            whatsapp: {
              ativo: true,
              numero: "+55 11 99999-9999",
              horarioPermitido: { inicio: "08:00", fim: "22:00" },
            },
            push: { ativo: true, navegador: true, mobile: true },
            slack: { ativo: false },
          },
          dashboardPersonalizado: {
            layout: "expandido",
            widgets: ["whatsapp", "vendas", "automacao", "relatorios"],
            coresPersonalizadas: {
              primaria: "#0ea5e9",
              secundaria: "#8b5cf6",
              destaque: "#10b981",
            },
            metricas: ["all"],
            atualizacaoAutomatica: true,
            filtrosPadrao: {},
          },
          integracoes: {
            whatsapp: {
              instanciasPermitidas: ["all"],
              webhooksAtivos: ["all"],
              limiteMensagens: -1,
            },
            n8n: { workflowsAcessiveis: ["all"], execucoesPermitidas: -1 },
            apis: { chaves: {}, limitesRate: {} },
          },
          privacidade: {
            perfilPublico: false,
            compartilharDados: false,
            logAtividades: true,
            retencaoDados: 365,
            consentimentosEspecificos: { analytics: true, marketing: true },
          },
        },
        status: "ativo",
        ultimoLogin: new Date(),
        dataCriacao: new Date("2024-01-01"),
        dataAtualizacao: new Date(),
        lgpdConsent: {
          aceito: true,
          dataAceite: new Date("2024-01-01"),
          versaoTermos: "1.0",
          ipAceite: "192.168.1.1",
        },
        dadosComplementares: {
          fusoHorario: "America/Sao_Paulo",
          idioma: "pt-BR",
          preferenciasNotificacao: {
            email: { ativo: true, frequencia: "imediata", tipos: ["all"] },
            whatsapp: {
              ativo: true,
              numero: "+55 11 99999-9999",
              horarioPermitido: { inicio: "08:00", fim: "22:00" },
            },
            push: { ativo: true, navegador: true, mobile: true },
            slack: { ativo: false },
          },
          integracoesAtivas: ["whatsapp", "n8n", "typebot", "evolution-api"],
        },
      },
    ];

    defaultUsers.forEach((user) => {
      this.users.set(user.id, user);
    });

    // Atividades recentes reais
    this.activities = [
      {
        id: "1",
        userId: "001",
        acao: "Login realizado",
        recurso: "auth",
        detalhes: { metodo: "email_password", dispositivo: "desktop" },
        ip: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        localizacao: { pais: "Brasil", estado: "SP", cidade: "São Paulo" },
        timestamp: new Date(),
        categoria: "login",
        resultado: "sucesso",
      },
      {
        id: "2",
        userId: "001",
        acao: "Configuração atualizada",
        recurso: "user_settings",
        detalhes: { campo: "notificacoes.whatsapp", valor: true },
        ip: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        localizacao: { pais: "Brasil", estado: "SP", cidade: "São Paulo" },
        timestamp: new Date(Date.now() - 300000),
        categoria: "config",
        resultado: "sucesso",
      },
    ];
  }

  // Métodos de gestão de usuários
  public async createUser(
    userData: Partial<BrazilianUser>,
  ): Promise<BrazilianUser> {
    const newUser: BrazilianUser = {
      id: this.generateUserId(),
      nome: userData.nome || "",
      email: userData.email || "",
      telefone: userData.telefone || "",
      documento: userData.documento || {
        tipo: "CPF",
        numero: "",
        valido: false,
      },
      avatar: userData.avatar || "",
      cargo: userData.cargo || "",
      departamento: userData.departamento || "",
      empresa: userData.empresa || ({} as any),
      endereco: userData.endereco || ({} as any),
      role: userData.role || BRAZILIAN_ROLES[0],
      permissions: userData.permissions || [],
      configuracoes: userData.configuracoes || this.getDefaultSettings(),
      status: "aguardando_confirmacao",
      ultimoLogin: new Date(),
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      lgpdConsent: {
        aceito: false,
        dataAceite: new Date(),
        versaoTermos: "1.0",
        ipAceite: "",
      },
      dadosComplementares: {
        fusoHorario: "America/Sao_Paulo",
        idioma: "pt-BR",
        preferenciasNotificacao: {
          email: { ativo: true, frequencia: "diaria", tipos: [] },
          whatsapp: {
            ativo: false,
            numero: "",
            horarioPermitido: { inicio: "09:00", fim: "18:00" },
          },
          push: { ativo: true, navegador: true, mobile: false },
          slack: { ativo: false },
        },
        integracoesAtivas: [],
      },
    };

    this.users.set(newUser.id, newUser);
    this.logActivity("001", "Usuário criado", "user_management", {
      newUserId: newUser.id,
    });

    return newUser;
  }

  public async updateUser(
    userId: string,
    updates: Partial<BrazilianUser>,
  ): Promise<BrazilianUser | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    const updatedUser = { ...user, ...updates, dataAtualizacao: new Date() };
    this.users.set(userId, updatedUser);

    this.logActivity(userId, "Usuário atualizado", "user_management", updates);

    return updatedUser;
  }

  public async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    // Soft delete - marcar como inativo
    user.status = "inativo";
    user.dataAtualizacao = new Date();

    this.logActivity("001", "Usuário removido", "user_management", {
      deletedUserId: userId,
    });

    return true;
  }

  public getUser(userId: string): BrazilianUser | null {
    return this.users.get(userId) || null;
  }

  public getAllUsers(): BrazilianUser[] {
    return Array.from(this.users.values()).filter(
      (user) => user.status !== "inativo",
    );
  }

  public getUsersByRole(roleId: string): BrazilianUser[] {
    return this.getAllUsers().filter((user) => user.role.id === roleId);
  }

  public getUsersByDepartment(department: string): BrazilianUser[] {
    return this.getAllUsers().filter(
      (user) => user.departamento === department,
    );
  }

  // Métodos de permissões
  public hasPermission(userId: string, permissionId: string): boolean {
    const user = this.getUser(userId);
    if (!user) return false;

    return (
      user.permissions.some((p) => p.id === permissionId) ||
      user.role.permissoesIncluidas.some((p) => p.id === permissionId)
    );
  }

  public checkPermissionWithConditions(
    userId: string,
    permissionId: string,
    context: any,
  ): boolean {
    const user = this.getUser(userId);
    if (!user) return false;

    const permission =
      user.permissions.find((p) => p.id === permissionId) ||
      user.role.permissoesIncluidas.find((p) => p.id === permissionId);

    if (!permission) return false;

    // Verificar condições específicas
    if (permission.condicoes) {
      const { restricaoHorario, restricaoIP } = permission.condicoes;

      if (restricaoHorario) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        if (
          currentTime < restricaoHorario.inicio ||
          currentTime > restricaoHorario.fim
        ) {
          return false;
        }
      }

      if (restricaoIP && context.ip && !restricaoIP.includes(context.ip)) {
        return false;
      }
    }

    return true;
  }

  // Métodos de atividades
  public logActivity(
    userId: string,
    acao: string,
    recurso: string,
    detalhes: any = {},
    ip: string = "192.168.1.1",
  ): void {
    const activity: UserActivity = {
      id: Date.now().toString(),
      userId,
      acao,
      recurso,
      detalhes,
      ip,
      userAgent: "KRYONIX System",
      timestamp: new Date(),
      categoria: this.categorizeActivity(acao),
      resultado: "sucesso",
    };

    this.activities.unshift(activity);

    // Manter apenas as últimas 1000 atividades
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(0, 1000);
    }
  }

  public getUserActivities(userId: string, limit: number = 50): UserActivity[] {
    return this.activities
      .filter((activity) => activity.userId === userId)
      .slice(0, limit);
  }

  public getAllActivities(limit: number = 100): UserActivity[] {
    return this.activities.slice(0, limit);
  }

  // Métodos auxiliares
  private generateUserId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getDefaultSettings(): UserSettings {
    return {
      tema: "light",
      idioma: "pt-BR",
      fusoHorario: "America/Sao_Paulo",
      formatoData: "DD/MM/YYYY",
      formatoHora: "24h",
      moeda: "BRL",
      notificacoes: {
        email: { ativo: true, frequencia: "diaria", tipos: [] },
        whatsapp: {
          ativo: false,
          numero: "",
          horarioPermitido: { inicio: "09:00", fim: "18:00" },
        },
        push: { ativo: true, navegador: true, mobile: false },
        slack: { ativo: false },
      },
      dashboardPersonalizado: {
        layout: "padrao",
        widgets: ["dashboard", "whatsapp"],
        coresPersonalizadas: {
          primaria: "#0ea5e9",
          secundaria: "#8b5cf6",
          destaque: "#10b981",
        },
        metricas: ["basic"],
        atualizacaoAutomatica: true,
        filtrosPadrao: {},
      },
      integracoes: {
        whatsapp: {
          instanciasPermitidas: [],
          webhooksAtivos: [],
          limiteMensagens: 1000,
        },
        n8n: { workflowsAcessiveis: [], execucoesPermitidas: 10 },
        apis: { chaves: {}, limitesRate: {} },
      },
      privacidade: {
        perfilPublico: false,
        compartilharDados: false,
        logAtividades: true,
        retencaoDados: 90,
        consentimentosEspecificos: {},
      },
    };
  }

  private categorizeActivity(acao: string): UserActivity["categoria"] {
    if (acao.includes("login") || acao.includes("Login")) return "login";
    if (acao.includes("logout") || acao.includes("Logout")) return "logout";
    if (acao.includes("criado") || acao.includes("criar")) return "create";
    if (acao.includes("atualizado") || acao.includes("editar")) return "update";
    if (acao.includes("removido") || acao.includes("deletar")) return "delete";
    if (acao.includes("configuração") || acao.includes("config"))
      return "config";
    if (acao.includes("integração") || ação.includes("API"))
      return "integration";
    return "read";
  }

  // Estatísticas e relatórios
  public getUserStats(): any {
    const totalUsers = this.getAllUsers().length;
    const activeUsers = this.getAllUsers().filter(
      (u) => u.status === "ativo",
    ).length;
    const usersByRole = BRAZILIAN_ROLES.map((role) => ({
      role: role.nome,
      count: this.getUsersByRole(role.id).length,
    }));

    const activitiesLast24h = this.activities.filter(
      (a) => new Date(a.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000,
    ).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole,
      activitiesLast24h,
      averageLogin: this.calculateAverageLogin(),
      mostActiveUsers: this.getMostActiveUsers(5),
    };
  }

  private calculateAverageLogin(): number {
    const users = this.getAllUsers();
    const totalLogins = users.reduce((sum, user) => {
      const userLogins = this.activities.filter(
        (a) => a.userId === user.id && a.categoria === "login",
      ).length;
      return sum + userLogins;
    }, 0);

    return users.length > 0 ? totalLogins / users.length : 0;
  }

  private getMostActiveUsers(
    limit: number,
  ): Array<{ user: BrazilianUser; activities: number }> {
    const userActivities = this.getAllUsers().map((user) => ({
      user,
      activities: this.activities.filter((a) => a.userId === user.id).length,
    }));

    return userActivities
      .sort((a, b) => b.activities - a.activities)
      .slice(0, limit);
  }
}

// Singleton instance
export const brazilianUserManagement = BrazilianUserManagement.getInstance();

export default BrazilianUserManagement;

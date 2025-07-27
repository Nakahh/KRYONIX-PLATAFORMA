// Sistema de Notificações Inteligentes KRYONIX - Focado no Brasil
// Notificações contextualizadas, LGPD compliant e integradas com WhatsApp

export interface BrazilianNotification {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: "info" | "sucesso" | "atencao" | "erro" | "urgente" | "sistema";
  categoria:
    | "whatsapp"
    | "vendas"
    | "automacao"
    | "usuario"
    | "seguranca"
    | "sistema"
    | "compliance";
  prioridade: "baixa" | "media" | "alta" | "critica";
  destinatario: {
    userId: string;
    canais: NotificationChannel[];
    configuracoes: NotificationSettings;
  };
  origem: {
    sistema: string;
    acao: string;
    contexto: Record<string, any>;
  };
  agendamento?: {
    enviarEm: Date;
    frequencia?: "unica" | "diaria" | "semanal" | "mensal";
    condicoes?: NotificationCondition[];
  };
  personalizacao: {
    usarNomeBrasileiro: boolean;
    incluirContextoLocal: boolean;
    formatoBrasileiro: boolean;
    emojis: boolean;
  };
  status: "pendente" | "enviada" | "lida" | "arquivada" | "falhada";
  enviadoEm?: Date;
  lidaEm?: Date;
  canaisEnviados: string[];
  tentativas: number;
  respostasEsperadas?: NotificationResponse[];
  lgpdCompliant: boolean;
  retencaoDados: number; // em dias
  timestamp: Date;
}

export interface NotificationChannel {
  tipo: "push" | "email" | "whatsapp" | "sms" | "slack" | "webhook" | "inapp";
  ativo: boolean;
  configuracao: ChannelConfig;
  horarioPermitido?: {
    inicio: string;
    fim: string;
    diasSemana: number[];
  };
  limiteDiario?: number;
  formatoMensagem: "completo" | "resumido" | "emoji";
}

export interface ChannelConfig {
  // WhatsApp
  numeroWhatsApp?: string;
  instanciaId?: string;
  templateId?: string;

  // Email
  emailAddress?: string;
  templateEmail?: string;
  incluirAnexos?: boolean;

  // Push
  dispositivoId?: string;
  navegador?: boolean;
  mobile?: boolean;

  // SMS
  numeroTelefone?: string;
  provedorSMS?: "zenvia" | "totalvoice" | "twilio";

  // Slack
  webhookUrl?: string;
  canal?: string;

  // Webhook
  url?: string;
  headers?: Record<string, string>;
  metodo?: "POST" | "PUT";
}

export interface NotificationSettings {
  ativo: boolean;
  naoPerturbar: {
    ativo: boolean;
    inicio: string;
    fim: string;
  };
  fimDeSemana: boolean;
  feriados: boolean;
  agrupamento: boolean;
  limitePorHora: number;
  categoriasAtivas: string[];
  palavrasChave: string[];
  filtrosPrioridade: string[];
}

export interface NotificationCondition {
  campo: string;
  operador: "equals" | "contains" | "greater" | "less";
  valor: any;
  logico?: "AND" | "OR";
}

export interface NotificationResponse {
  tipo: "confirmacao" | "acao" | "feedback";
  opcoes: string[];
  callback?: string;
  timeout?: number; // em minutos
}

export interface NotificationTemplate {
  id: string;
  nome: string;
  categoria: string;
  titulo: string;
  conteudo: string;
  variaveis: string[];
  canaisSuportados: string[];
  configuracaoPadrao: Partial<BrazilianNotification>;
  exemplo: string;
  ativo: boolean;
}

export interface NotificationRule {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  triggers: NotificationTrigger[];
  condicoes: NotificationCondition[];
  template: string;
  destinatarios: string[];
  agendamento?: {
    tipo: "imediato" | "agendado" | "condicional";
    parametros: Record<string, any>;
  };
  limitacao: {
    maxPorDia: number;
    maxPorHora: number;
    intervaloMinimo: number; // em minutos
  };
}

export interface NotificationTrigger {
  evento: string;
  sistema: string;
  filtros?: Record<string, any>;
  delay?: number; // em minutos
}

// Templates brasileiros pré-definidos
export const BRAZILIAN_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "whatsapp_mensagem_recebida",
    nome: "Nova Mensagem WhatsApp",
    categoria: "whatsapp",
    titulo: "📱 Nova mensagem no WhatsApp",
    conteudo:
      'Olá {{usuario_nome}}! Você recebeu uma nova mensagem de {{contato_nome}} na instância {{instancia_nome}}.\n\nMensagem: "{{mensagem_preview}}"\n\n🕐 {{horario_brasileiro}}',
    variaveis: [
      "usuario_nome",
      "contato_nome",
      "instancia_nome",
      "mensagem_preview",
      "horario_brasileiro",
    ],
    canaisSuportados: ["push", "email", "whatsapp"],
    configuracaoPadrao: {
      tipo: "info",
      categoria: "whatsapp",
      prioridade: "media",
      personalizacao: {
        usarNomeBrasileiro: true,
        incluirContextoLocal: true,
        formatoBrasileiro: true,
        emojis: true,
      },
    },
    exemplo:
      '📱 Nova mensagem no WhatsApp\n\nOlá João! Você recebeu uma nova mensagem de Maria Silva na instância Vendas-SP.\n\nMensagem: "Oi, gostaria de saber mais sobre o produto..."\n\n🕐 26/01/2025 às 14:30 (Brasília)',
    ativo: true,
  },
  {
    id: "venda_pix_confirmada",
    nome: "Pagamento PIX Confirmado",
    categoria: "vendas",
    titulo: "💰 Pagamento PIX confirmado!",
    conteudo:
      "Parabéns {{usuario_nome}}! 🎉\n\nO pagamento via PIX de {{valor_real}} foi confirmado.\n\n📋 Detalhes:\n• Cliente: {{cliente_nome}}\n• Valor: {{valor_formatado}}\n• Pedido: #{{numero_pedido}}\n• Horário: {{horario_brasileiro}}\n\n✅ O cliente já foi notificado automaticamente.",
    variaveis: [
      "usuario_nome",
      "valor_real",
      "cliente_nome",
      "valor_formatado",
      "numero_pedido",
      "horario_brasileiro",
    ],
    canaisSuportados: ["push", "email", "whatsapp", "slack"],
    configuracaoPadrao: {
      tipo: "sucesso",
      categoria: "vendas",
      prioridade: "alta",
      personalizacao: {
        usarNomeBrasileiro: true,
        incluirContextoLocal: true,
        formatoBrasileiro: true,
        emojis: true,
      },
    },
    exemplo:
      "💰 Pagamento PIX confirmado!\n\nParabéns João! 🎉\n\nO pagamento via PIX de R$ 250,00 foi confirmado.\n\n📋 Detalhes:\n• Cliente: Maria Oliveira\n• Valor: R$ 250,00\n• Pedido: #1234\n• Horário: 26/01/2025 às 14:30 (Brasília)\n\n✅ O cliente já foi notificado automaticamente.",
    ativo: true,
  },
  {
    id: "automacao_erro",
    nome: "Erro na Automação",
    categoria: "automacao",
    titulo: "⚠️ Falha na automação detectada",
    conteudo:
      'Atenção {{usuario_nome}},\n\nDetectamos uma falha na automação "{{workflow_nome}}".\n\n🔍 Detalhes do erro:\n• Tipo: {{tipo_erro}}\n• Mensagem: {{mensagem_erro}}\n• Stack: {{stack_nome}}\n• Horário: {{horario_brasileiro}}\n\n🔧 Ação recomendada: {{acao_recomendada}}\n\n📞 Precisa de ajuda? Entre em contato com o suporte.',
    variaveis: [
      "usuario_nome",
      "workflow_nome",
      "tipo_erro",
      "mensagem_erro",
      "stack_nome",
      "horario_brasileiro",
      "acao_recomendada",
    ],
    canaisSuportados: ["push", "email", "whatsapp", "slack"],
    configuracaoPadrao: {
      tipo: "erro",
      categoria: "automacao",
      prioridade: "alta",
      personalizacao: {
        usarNomeBrasileiro: true,
        incluirContextoLocal: true,
        formatoBrasileiro: true,
        emojis: true,
      },
    },
    exemplo:
      '⚠️ Falha na automação detectada\n\nAtenção João,\n\nDetectamos uma falha na automação "Lead Qualification BR".\n\n🔍 Detalhes do erro:\n• Tipo: Timeout\n• Mensagem: Conexão com API perdida\n��� Stack: N8N\n• Horário: 26/01/2025 às 14:30 (Brasília)\n\n🔧 Ação recomendada: Verificar conexão de rede\n\n📞 Precisa de ajuda? Entre em contato com o suporte.',
    ativo: true,
  },
  {
    id: "usuario_novo_cadastro",
    nome: "Novo Usuário Cadastrado",
    categoria: "usuario",
    titulo: "👥 Novo membro na equipe!",
    conteudo:
      "Olá {{admin_nome}}!\n\nUm novo usuário se cadastrou na plataforma KRYONIX.\n\n👤 Informações:\n• Nome: {{novo_usuario_nome}}\n• Email: {{novo_usuario_email}}\n• Empresa: {{empresa_nome}}\n• Função: {{funcao_solicitada}}\n• Cadastro: {{horario_brasileiro}}\n\n⚡ Ações necessárias:\n• Validar documentos\n• Definir permissões\n• Enviar boas-vindas\n\n🔗 Acesse o painel de usuários para aprovar.",
    variaveis: [
      "admin_nome",
      "novo_usuario_nome",
      "novo_usuario_email",
      "empresa_nome",
      "funcao_solicitada",
      "horario_brasileiro",
    ],
    canaisSuportados: ["push", "email", "whatsapp"],
    configuracaoPadrao: {
      tipo: "info",
      categoria: "usuario",
      prioridade: "media",
      personalizacao: {
        usarNomeBrasileiro: true,
        incluirContextoLocal: true,
        formatoBrasileiro: true,
        emojis: true,
      },
    },
    exemplo:
      "👥 Novo membro na equipe!\n\nOlá João!\n\nUm novo usuário se cadastrou na plataforma KRYONIX.\n\n👤 Informações:\n• Nome: Maria Silva\n• Email: maria@empresa.com.br\n• Empresa: Tech Solutions Ltda\n• Função: Analista\n• Cadastro: 26/01/2025 às 14:30 (Brasília)\n\n⚡ Ações necessárias:\n• Validar documentos\n• Definir permissões\n• Enviar boas-vindas\n\n🔗 Acesse o painel de usuários para aprovar.",
    ativo: true,
  },
  {
    id: "lgpd_consentimento_expirado",
    nome: "Consentimento LGPD Expirando",
    categoria: "compliance",
    titulo: "🛡️ Consentimento LGPD precisa ser renovado",
    conteudo:
      "Importante {{usuario_nome}},\n\nO consentimento LGPD do cliente {{cliente_nome}} está próximo do vencimento.\n\n📋 Detalhes:\n• Cliente: {{cliente_nome}}\n• CPF/CNPJ: {{documento_formatado}}\n• Consentimento expira em: {{dias_restantes}} dias\n• Data limite: {{data_vencimento}}\n\n⚡ Ação necessária:\n• Solicitar renovação do consentimento\n• Atualizar termos de uso\n• Documentar no sistema\n\n📚 Lembre-se: É obrigatório pela Lei Geral de Proteção de Dados.",
    variaveis: [
      "usuario_nome",
      "cliente_nome",
      "documento_formatado",
      "dias_restantes",
      "data_vencimento",
    ],
    canaisSuportados: ["email", "push", "whatsapp"],
    configuracaoPadrao: {
      tipo: "atencao",
      categoria: "compliance",
      prioridade: "alta",
      personalizacao: {
        usarNomeBrasileiro: true,
        incluirContextoLocal: true,
        formatoBrasileiro: true,
        emojis: true,
      },
    },
    exemplo:
      "🛡️ Consentimento LGPD precisa ser renovado\n\nImportante João,\n\nO consentimento LGPD do cliente Maria Silva está próximo do vencimento.\n\n📋 Detalhes:\n• Cliente: Maria Silva\n• CPF/CNPJ: 123.456.789-00\n• Consentimento expira em: 7 dias\n• Data limite: 02/02/2025\n\n⚡ Ação necessária:\n• Solicitar renovação do consentimento\n• Atualizar termos de uso\n• Documentar no sistema\n\n📚 Lembre-se: É obrigatório pela Lei Geral de Proteção de Dados.",
    ativo: true,
  },
];

// Regras automáticas brasileiras
export const BRAZILIAN_NOTIFICATION_RULES: NotificationRule[] = [
  {
    id: "whatsapp_alta_demanda",
    nome: "WhatsApp - Alta Demanda",
    descricao: "Notificar quando há muitas mensagens não respondidas",
    ativo: true,
    triggers: [
      {
        evento: "mensagens_nao_respondidas",
        sistema: "whatsapp",
        filtros: { quantidade: { $gte: 10 } },
      },
    ],
    condicoes: [
      {
        campo: "horario",
        operador: "greater",
        valor: "08:00",
      },
      {
        campo: "horario",
        operador: "less",
        valor: "22:00",
        logico: "AND",
      },
    ],
    template: "whatsapp_mensagem_recebida",
    destinatarios: ["supervisores", "gerentes"],
    agendamento: {
      tipo: "imediato",
      parametros: {},
    },
    limitacao: {
      maxPorDia: 5,
      maxPorHora: 2,
      intervaloMinimo: 15,
    },
  },
  {
    id: "vendas_meta_atingida",
    nome: "Meta de Vendas Atingida",
    descricao: "Comemorar quando meta mensal for atingida",
    ativo: true,
    triggers: [
      {
        evento: "meta_vendas_atingida",
        sistema: "vendas",
        filtros: { tipo: "mensal" },
      },
    ],
    condicoes: [],
    template: "venda_pix_confirmada",
    destinatarios: ["todos"],
    agendamento: {
      tipo: "imediato",
      parametros: {},
    },
    limitacao: {
      maxPorDia: 1,
      maxPorHora: 1,
      intervaloMinimo: 60,
    },
  },
];

export class BrazilianNotificationService {
  private static instance: BrazilianNotificationService;
  private notifications: Map<string, BrazilianNotification> = new Map();
  private rules: NotificationRule[] = [...BRAZILIAN_NOTIFICATION_RULES];
  private templates: NotificationTemplate[] = [
    ...BRAZILIAN_NOTIFICATION_TEMPLATES,
  ];

  public static getInstance(): BrazilianNotificationService {
    if (!BrazilianNotificationService.instance) {
      BrazilianNotificationService.instance =
        new BrazilianNotificationService();
    }
    return BrazilianNotificationService.instance;
  }

  // Criar e enviar notificação
  public async criarNotificacao(
    config: Partial<BrazilianNotification>,
  ): Promise<string> {
    const notification: BrazilianNotification = {
      id: this.generateNotificationId(),
      titulo: config.titulo || "Notificação KRYONIX",
      conteudo: config.conteudo || "",
      tipo: config.tipo || "info",
      categoria: config.categoria || "sistema",
      prioridade: config.prioridade || "media",
      destinatario: config.destinatario || {
        userId: "",
        canais: [],
        configuracoes: this.getDefaultSettings(),
      },
      origem: config.origem || {
        sistema: "kryonix",
        acao: "manual",
        contexto: {},
      },
      agendamento: config.agendamento,
      personalizacao: config.personalizacao || {
        usarNomeBrasileiro: true,
        incluirContextoLocal: true,
        formatoBrasileiro: true,
        emojis: true,
      },
      status: "pendente",
      canaisEnviados: [],
      tentativas: 0,
      lgpdCompliant: true,
      retencaoDados: 365,
      timestamp: new Date(),
    };

    // Aplicar personalizações brasileiras
    if (notification.personalizacao.formatoBrasileiro) {
      notification.conteudo = this.aplicarFormatoBrasileiro(
        notification.conteudo,
      );
    }

    if (notification.personalizacao.incluirContextoLocal) {
      notification.conteudo = this.incluirContextoLocal(notification.conteudo);
    }

    this.notifications.set(notification.id, notification);

    // Enviar imediatamente se não há agendamento
    if (!notification.agendamento) {
      await this.enviarNotificacao(notification.id);
    }

    return notification.id;
  }

  // Enviar notificação via canais especificados
  public async enviarNotificacao(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (!notification || notification.status === "enviada") {
      return false;
    }

    notification.tentativas += 1;
    notification.status = "enviada";
    notification.enviadoEm = new Date();

    // Simular envio para cada canal
    for (const canal of notification.destinatario.canais) {
      if (canal.ativo && this.validarHorarioPermitido(canal)) {
        try {
          await this.enviarPorCanal(notification, canal);
          notification.canaisEnviados.push(canal.tipo);
        } catch (error) {
          console.error(`Erro ao enviar por ${canal.tipo}:`, error);
          notification.status = "falhada";
        }
      }
    }

    this.notifications.set(notificationId, notification);
    return notification.status === "enviada";
  }

  // Marcar como lida
  public marcarComoLida(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) return false;

    notification.status = "lida";
    notification.lidaEm = new Date();
    this.notifications.set(notificationId, notification);

    return true;
  }

  // Obter notificações do usuário
  public getNotificacoesUsuario(
    userId: string,
    filtros?: {
      categoria?: string;
      status?: string;
      limite?: number;
    },
  ): BrazilianNotification[] {
    let notificacoes = Array.from(this.notifications.values())
      .filter((n) => n.destinatario.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filtros?.categoria) {
      notificacoes = notificacoes.filter(
        (n) => n.categoria === filtros.categoria,
      );
    }

    if (filtros?.status) {
      notificacoes = notificacoes.filter((n) => n.status === filtros.status);
    }

    if (filtros?.limite) {
      notificacoes = notificacoes.slice(0, filtros.limite);
    }

    return notificacoes;
  }

  // Processar templates com variáveis
  public processarTemplate(
    templateId: string,
    variaveis: Record<string, any>,
  ): { titulo: string; conteudo: string } {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) {
      return { titulo: "Notificação", conteudo: "Conteúdo não disponível" };
    }

    let titulo = template.titulo;
    let conteudo = template.conteudo;

    // Substituir variáveis
    for (const [chave, valor] of Object.entries(variaveis)) {
      const regex = new RegExp(`{{${chave}}}`, "g");
      titulo = titulo.replace(regex, String(valor));
      conteudo = conteudo.replace(regex, String(valor));
    }

    // Adicionar contexto brasileiro padrão
    const contextoLocal = this.getContextoBrasileiro();
    for (const [chave, valor] of Object.entries(contextoLocal)) {
      const regex = new RegExp(`{{${chave}}}`, "g");
      titulo = titulo.replace(regex, String(valor));
      conteudo = conteudo.replace(regex, String(valor));
    }

    return { titulo, conteudo };
  }

  // Criar notificação a partir de template
  public async criarNotificacaoComTemplate(
    templateId: string,
    userId: string,
    variaveis: Record<string, any>,
  ): Promise<string> {
    const { titulo, conteudo } = this.processarTemplate(templateId, variaveis);
    const template = this.templates.find((t) => t.id === templateId);

    if (!template) {
      throw new Error("Template não encontrado");
    }

    return await this.criarNotificacao({
      titulo,
      conteudo,
      ...template.configuracaoPadrao,
      destinatario: {
        userId,
        canais: [], // Será preenchido com configurações do usuário
        configuracoes: this.getDefaultSettings(),
      },
      origem: {
        sistema: "template",
        acao: templateId,
        contexto: variaveis,
      },
    });
  }

  // Métodos auxiliares privados
  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      ativo: true,
      naoPerturbar: {
        ativo: false,
        inicio: "22:00",
        fim: "08:00",
      },
      fimDeSemana: false,
      feriados: false,
      agrupamento: true,
      limitePorHora: 10,
      categoriasAtivas: ["all"],
      palavrasChave: [],
      filtrosPrioridade: ["media", "alta", "critica"],
    };
  }

  private aplicarFormatoBrasileiro(conteudo: string): string {
    // Aplicar formatações brasileiras (datas, moeda, etc.)
    const agora = new Date();
    const horarioBrasil = agora.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return conteudo.replace(/{{horario_brasileiro}}/g, horarioBrasil);
  }

  private incluirContextoLocal(conteudo: string): string {
    // Adicionar contexto brasileiro ao conteúdo
    const contexto = this.getContextoBrasileiro();

    let conteudoLocal = conteudo;
    for (const [chave, valor] of Object.entries(contexto)) {
      conteudoLocal = conteudoLocal.replace(
        new RegExp(`{{${chave}}}`, "g"),
        String(valor),
      );
    }

    return conteudoLocal;
  }

  private getContextoBrasileiro(): Record<string, string> {
    const agora = new Date();

    return {
      horario_brasileiro:
        agora.toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) + " (Brasília)",
      fuso_horario: "America/Sao_Paulo",
      moeda: "BRL",
      idioma: "pt-BR",
      pais: "Brasil",
      saudacao: this.getSaudacaoBrasileira(),
      dia_semana: agora.toLocaleDateString("pt-BR", { weekday: "long" }),
      periodo_dia: this.getPeriodoDia(),
    };
  }

  private getSaudacaoBrasileira(): string {
    const hora = new Date().getHours();

    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    if (hora >= 18 && hora < 24) return "Boa noite";
    return "Boa madrugada";
  }

  private getPeriodoDia(): string {
    const hora = new Date().getHours();

    if (hora >= 6 && hora < 12) return "manhã";
    if (hora >= 12 && hora < 18) return "tarde";
    if (hora >= 18 && hora < 24) return "noite";
    return "madrugada";
  }

  private validarHorarioPermitido(canal: NotificationChannel): boolean {
    if (!canal.horarioPermitido) return true;

    const agora = new Date();
    const diaAtual = agora.getDay(); // 0 = domingo
    const horaAtual = agora.getHours();
    const minutoAtual = agora.getMinutes();
    const horaAtualString = `${horaAtual.toString().padStart(2, "0")}:${minutoAtual.toString().padStart(2, "0")}`;

    // Verificar dia da semana
    if (!canal.horarioPermitido.diasSemana.includes(diaAtual)) {
      return false;
    }

    // Verificar horário
    if (
      horaAtualString < canal.horarioPermitido.inicio ||
      horaAtualString > canal.horarioPermitido.fim
    ) {
      return false;
    }

    return true;
  }

  private async enviarPorCanal(
    notification: BrazilianNotification,
    canal: NotificationChannel,
  ): Promise<void> {
    // Simular envio baseado no tipo de canal
    switch (canal.tipo) {
      case "whatsapp":
        await this.enviarWhatsApp(notification, canal);
        break;
      case "email":
        await this.enviarEmail(notification, canal);
        break;
      case "push":
        await this.enviarPush(notification, canal);
        break;
      case "sms":
        await this.enviarSMS(notification, canal);
        break;
      case "slack":
        await this.enviarSlack(notification, canal);
        break;
      case "webhook":
        await this.enviarWebhook(notification, canal);
        break;
      case "inapp":
        await this.enviarInApp(notification, canal);
        break;
    }
  }

  private async enviarWhatsApp(
    notification: BrazilianNotification,
    canal: NotificationChannel,
  ): Promise<void> {
    // Integração com Evolution API WhatsApp
    const payload = {
      number: canal.configuracao.numeroWhatsApp,
      textMessage: {
        text: `${notification.titulo}\n\n${notification.conteudo}`,
      },
    };

    console.log("📱 Enviando WhatsApp:", payload);
    // Aqui seria a integração real com a API
  }

  private async enviarEmail(
    notification: BrazilianNotification,
    canal: NotificationChannel,
  ): Promise<void> {
    const payload = {
      to: canal.configuracao.emailAddress,
      subject: notification.titulo,
      html: notification.conteudo.replace(/\n/g, "<br>"),
      template: canal.configuracao.templateEmail,
    };

    console.log("📧 Enviando Email:", payload);
    // Aqui seria a integração real com SendGrid
  }

  private async enviarPush(
    notification: BrazilianNotification,
    canal: NotificationChannel,
  ): Promise<void> {
    const payload = {
      title: notification.titulo,
      body: notification.conteudo.substring(0, 100) + "...",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      data: {
        notificationId: notification.id,
        categoria: notification.categoria,
      },
    };

    console.log("🔔 Enviando Push:", payload);
    // Aqui seria o envio real via Web Push API
  }

  private async enviarSMS(
    notification: BrazilianNotification,
    canal: NotificationChannel,
  ): Promise<void> {
    const payload = {
      to: canal.configuracao.numeroTelefone,
      message: `${notification.titulo}\n\n${notification.conteudo}`.substring(
        0,
        160,
      ),
    };

    console.log("📱 Enviando SMS:", payload);
    // Aqui seria a integração com provedor SMS brasileiro
  }

  private async enviarSlack(
    notification: BrazilianNotification,
    canal: NotificationChannel,
  ): Promise<void> {
    const payload = {
      text: notification.titulo,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: notification.conteudo,
          },
        },
      ],
    };

    console.log("💬 Enviando Slack:", payload);
    // Aqui seria o envio real via Slack Webhook
  }

  private async enviarWebhook(
    notification: BrazilianNotification,
    canal: NotificationChannel,
  ): Promise<void> {
    const payload = {
      notification: {
        id: notification.id,
        titulo: notification.titulo,
        conteudo: notification.conteudo,
        tipo: notification.tipo,
        categoria: notification.categoria,
        timestamp: notification.timestamp,
      },
    };

    console.log("🔗 Enviando Webhook:", payload);
    // Aqui seria a requisição HTTP real
  }

  private async enviarInApp(
    notification: BrazilianNotification,
    canal: NotificationChannel,
  ): Promise<void> {
    // Notificação in-app será exibida na interface
    console.log("📱 Notificação In-App criada:", notification.titulo);
  }

  // Estatísticas
  public getEstatisticas(): any {
    const todasNotificacoes = Array.from(this.notifications.values());

    return {
      total: todasNotificacoes.length,
      enviadas: todasNotificacoes.filter((n) => n.status === "enviada").length,
      lidas: todasNotificacoes.filter((n) => n.status === "lida").length,
      pendentes: todasNotificacoes.filter((n) => n.status === "pendente")
        .length,
      falhadas: todasNotificacoes.filter((n) => n.status === "falhada").length,
      porCategoria: this.agruparPorCategoria(todasNotificacoes),
      porCanal: this.agruparPorCanal(todasNotificacoes),
      taxaEntrega: this.calcularTaxaEntrega(todasNotificacoes),
    };
  }

  private agruparPorCategoria(
    notifications: BrazilianNotification[],
  ): Record<string, number> {
    return notifications.reduce(
      (acc, notif) => {
        acc[notif.categoria] = (acc[notif.categoria] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  private agruparPorCanal(
    notifications: BrazilianNotification[],
  ): Record<string, number> {
    const contadores: Record<string, number> = {};

    notifications.forEach((notif) => {
      notif.canaisEnviados.forEach((canal) => {
        contadores[canal] = (contadores[canal] || 0) + 1;
      });
    });

    return contadores;
  }

  private calcularTaxaEntrega(notifications: BrazilianNotification[]): number {
    const enviadas = notifications.filter(
      (n) => n.status === "enviada" || n.status === "lida",
    ).length;
    return notifications.length > 0
      ? (enviadas / notifications.length) * 100
      : 0;
  }
}

// Singleton instance
export const brazilianNotificationService =
  BrazilianNotificationService.getInstance();

export default BrazilianNotificationService;

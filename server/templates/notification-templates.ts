import {
  NotificationTemplate,
  NotificationCategory,
  NotificationChannel,
  TemplateStatus,
} from "../entities/NotificationTemplate";

// Templates brasileiros padrão para o sistema KRYONIX
export const BRAZILIAN_NOTIFICATION_TEMPLATES = {
  // Templates de Sistema
  WELCOME_USER: {
    name: "Boas-vindas - Novo Usuário",
    description: "Mensagem de boas-vindas para novos usuários da plataforma",
    eventType: "user.registered",
    category: NotificationCategory.SYSTEM,
    supportedChannels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    content: {
      [NotificationChannel.EMAIL]: {
        subject: "Bem-vindo(a) ao KRYONIX! 🚀",
        title: "Bem-vindo(a) ao KRYONIX!",
        body: `Olá {{userName}},

Seja muito bem-vindo(a) à plataforma KRYONIX! 🎉

Você agora tem acesso a uma das mais completas plataformas de automação e integração do Brasil, com recursos como:

• 🤖 WhatsApp Business API integrado
• 📊 Automação de marketing com Mautic
• 🔄 Workflows inteligentes com N8N
• 💬 Chatbots visuais com Typebot
• 🧠 Serviços de IA avançados

Para começar, acesse sua conta e explore os recursos disponíveis no seu plano.

Se tiver dúvidas, nossa equipe de suporte está pronta para ajudar!`,
        htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Bem-vindo(a) ao KRYONIX! 🚀</h1>
  
  <p>Olá <strong>{{userName}}</strong>,</p>
  
  <p>Seja muito bem-vindo(a) à plataforma KRYONIX! 🎉</p>
  
  <p>Você agora tem acesso a uma das mais completas plataformas de automação e integração do Brasil, com recursos como:</p>
  
  <ul>
    <li>🤖 WhatsApp Business API integrado</li>
    <li>📊 Automação de marketing com Mautic</li>
    <li>🔄 Workflows inteligentes com N8N</li>
    <li>💬 Chatbots visuais com Typebot</li>
    <li>🧠 Serviços de IA avançados</li>
  </ul>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{platformUrl}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Acessar Plataforma</a>
  </div>
  
  <p>Se tiver dúvidas, nossa equipe de suporte está pronta para ajudar!</p>
</div>`,
        buttons: [
          { text: "Acessar Plataforma", url: "{{platformUrl}}" },
          { text: "Documentação", url: "{{docsUrl}}" },
        ],
      },
      [NotificationChannel.IN_APP]: {
        title: "Bem-vindo(a) ao KRYONIX!",
        body: "Sua conta foi criada com sucesso. Explore os recursos da plataforma!",
      },
    },
    variables: {
      userName: {
        type: "string",
        required: true,
        description: "Nome do usuário",
      },
      userEmail: {
        type: "string",
        required: true,
        description: "Email do usuário",
      },
      platformUrl: {
        type: "string",
        required: true,
        description: "URL da plataforma",
      },
      docsUrl: {
        type: "string",
        required: false,
        description: "URL da documentação",
      },
    },
  },

  // Templates de Cobrança
  PAYMENT_SUCCESS: {
    name: "Pagamento Aprovado",
    description: "Confirmação de pagamento aprovado",
    eventType: "billing.payment.success",
    category: NotificationCategory.BILLING,
    supportedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.IN_APP,
      NotificationChannel.WHATSAPP,
    ],
    content: {
      [NotificationChannel.EMAIL]: {
        subject: "✅ Pagamento Aprovado - Fatura {{invoiceNumber}}",
        title: "Pagamento Aprovado",
        body: `Olá {{customerName}},

Seu pagamento foi processado com sucesso! 🎉

📄 Fatura: {{invoiceNumber}}
💰 Valor: {{amount}}
📅 Data: {{paymentDate}}
💳 Método: {{paymentMethod}}

Seu plano {{planName}} está ativo e você pode continuar usando todos os recursos da plataforma.

Obrigado pela confiança!`,
        htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #059669;">✅ Pagamento Aprovado</h1>
  
  <p>Olá <strong>{{customerName}}</strong>,</p>
  
  <p>Seu pagamento foi processado com sucesso! 🎉</p>
  
  <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>Detalhes do Pagamento</h3>
    <p><strong>Fatura:</strong> {{invoiceNumber}}</p>
    <p><strong>Valor:</strong> {{amount}}</p>
    <p><strong>Data:</strong> {{paymentDate}}</p>
    <p><strong>Método:</strong> {{paymentMethod}}</p>
  </div>
  
  <p>Seu plano <strong>{{planName}}</strong> está ativo e você pode continuar usando todos os recursos da plataforma.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{invoiceUrl}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Fatura</a>
  </div>
</div>`,
      },
      [NotificationChannel.WHATSAPP]: {
        title: "Pagamento Aprovado ✅",
        body: `Olá {{customerName}}! Seu pagamento de {{amount}} foi aprovado. Fatura: {{invoiceNumber}}. Obrigado! 🎉`,
      },
    },
    variables: {
      customerName: {
        type: "string",
        required: true,
        description: "Nome do cliente",
      },
      invoiceNumber: {
        type: "string",
        required: true,
        description: "Número da fatura",
      },
      amount: {
        type: "string",
        required: true,
        description: "Valor formatado",
      },
      paymentDate: {
        type: "string",
        required: true,
        description: "Data do pagamento",
      },
      paymentMethod: {
        type: "string",
        required: true,
        description: "Método de pagamento",
      },
      planName: {
        type: "string",
        required: true,
        description: "Nome do plano",
      },
      invoiceUrl: {
        type: "string",
        required: false,
        description: "URL da fatura",
      },
    },
  },

  PAYMENT_FAILED: {
    name: "Falha no Pagamento",
    description: "Notificação de falha no pagamento",
    eventType: "billing.payment.failed",
    category: NotificationCategory.BILLING,
    supportedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.IN_APP,
      NotificationChannel.WHATSAPP,
    ],
    content: {
      [NotificationChannel.EMAIL]: {
        subject: "❌ Falha no Pagamento - Ação Necessária",
        title: "Problema com seu Pagamento",
        body: `Olá {{customerName}},

Infelizmente não conseguimos processar seu pagamento.

📄 Fatura: {{invoiceNumber}}
💰 Valor: {{amount}}
❌ Motivo: {{failureReason}}

Para evitar interrupção dos serviços, por favor:

1. Verifique os dados do seu cartão
2. Certifique-se de ter saldo suficiente
3. Tente novamente ou use outro método de pagamento

Seu acesso aos serviços será mantido por mais {{graceDays}} dias.`,
        htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #dc2626;">❌ Problema com seu Pagamento</h1>
  
  <p>Olá <strong>{{customerName}}</strong>,</p>
  
  <p>Infelizmente não conseguimos processar seu pagamento.</p>
  
  <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>Detalhes</h3>
    <p><strong>Fatura:</strong> {{invoiceNumber}}</p>
    <p><strong>Valor:</strong> {{amount}}</p>
    <p><strong>Motivo:</strong> {{failureReason}}</p>
  </div>
  
  <div style="background: #fef3c7; padding: 15px; border-radius: 6px;">
    <p>⚠️ Seu acesso será mantido por mais <strong>{{graceDays}} dias</strong></p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{paymentUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Tentar Novamente</a>
  </div>
</div>`,
      },
    },
    variables: {
      customerName: {
        type: "string",
        required: true,
        description: "Nome do cliente",
      },
      invoiceNumber: {
        type: "string",
        required: true,
        description: "Número da fatura",
      },
      amount: {
        type: "string",
        required: true,
        description: "Valor formatado",
      },
      failureReason: {
        type: "string",
        required: true,
        description: "Motivo da falha",
      },
      graceDays: {
        type: "number",
        required: true,
        description: "Dias de carência",
      },
      paymentUrl: {
        type: "string",
        required: true,
        description: "URL para pagamento",
      },
    },
  },

  // Templates WhatsApp
  WHATSAPP_CONNECTED: {
    name: "WhatsApp Conectado",
    description: "Confirmação de conexão do WhatsApp Business",
    eventType: "whatsapp.connected",
    category: NotificationCategory.WHATSAPP,
    supportedChannels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    content: {
      [NotificationChannel.EMAIL]: {
        subject: "��� WhatsApp Business Conectado com Sucesso",
        title: "WhatsApp Conectado!",
        body: `Olá {{userName}},

Sua instância do WhatsApp Business foi conectada com sucesso! 🎉

📱 Instância: {{instanceName}}
📞 Número: {{phoneNumber}}
⚡ Status: Ativo

Agora você pode:
• Enviar mensagens automatizadas
• Criar chatbots inteligentes
• Integrar com workflows
• Usar IA para respostas automáticas

Comece a explorar as possibilidades!`,
        htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #25d366;">✅ WhatsApp Conectado!</h1>
  
  <p>Olá <strong>{{userName}}</strong>,</p>
  
  <p>Sua instância do WhatsApp Business foi conectada com sucesso! 🎉</p>
  
  <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Instância:</strong> {{instanceName}}</p>
    <p><strong>Número:</strong> {{phoneNumber}}</p>
    <p><strong>Status:</strong> ✅ Ativo</p>
  </div>
  
  <h3>Agora você pode:</h3>
  <ul>
    <li>Enviar mensagens automatizadas</li>
    <li>Criar chatbots inteligentes</li>
    <li>Integrar com workflows</li>
    <li>Usar IA para respostas automáticas</li>
  </ul>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{whatsappUrl}}" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Gerenciar WhatsApp</a>
  </div>
</div>`,
      },
    },
    variables: {
      userName: {
        type: "string",
        required: true,
        description: "Nome do usuário",
      },
      instanceName: {
        type: "string",
        required: true,
        description: "Nome da instância",
      },
      phoneNumber: {
        type: "string",
        required: true,
        description: "Número do telefone",
      },
      whatsappUrl: {
        type: "string",
        required: true,
        description: "URL do gerenciamento",
      },
    },
  },

  // Templates de Segurança
  SECURITY_LOGIN: {
    name: "Novo Login Detectado",
    description: "Alerta de novo login na conta",
    eventType: "security.login.new",
    category: NotificationCategory.SECURITY,
    supportedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.IN_APP,
      NotificationChannel.PUSH,
    ],
    content: {
      [NotificationChannel.EMAIL]: {
        subject: "🔐 Novo Login Detectado em sua Conta",
        title: "Novo Login Detectado",
        body: `Olá {{userName}},

Detectamos um novo login em sua conta:

🕐 Data/Hora: {{loginTime}}
📍 Local: {{location}}
💻 Dispositivo: {{device}}
🌐 IP: {{ipAddress}}

Se foi você, pode ignorar este email.

Se NÃO foi você:
1. Altere sua senha imediatamente
2. Ative a autenticação de dois fatores
3. Entre em contato com nosso suporte

Sua segurança é nossa prioridade!`,
        htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #f59e0b;">🔐 Novo Login Detectado</h1>
  
  <p>Olá <strong>{{userName}}</strong>,</p>
  
  <p>Detectamos um novo login em sua conta:</p>
  
  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Data/Hora:</strong> {{loginTime}}</p>
    <p><strong>Local:</strong> {{location}}</p>
    <p><strong>Dispositivo:</strong> {{device}}</p>
    <p><strong>IP:</strong> {{ipAddress}}</p>
  </div>
  
  <div style="background: #fef2f2; padding: 15px; border-radius: 6px;">
    <p><strong>Se NÃO foi você:</strong></p>
    <ol>
      <li>Altere sua senha imediatamente</li>
      <li>Ative a autenticação de dois fatores</li>
      <li>Entre em contato com nosso suporte</li>
    </ol>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{securityUrl}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Revisar Segurança</a>
  </div>
</div>`,
      },
    },
    variables: {
      userName: {
        type: "string",
        required: true,
        description: "Nome do usuário",
      },
      loginTime: {
        type: "string",
        required: true,
        description: "Data e hora do login",
      },
      location: { type: "string", required: true, description: "Localização" },
      device: {
        type: "string",
        required: true,
        description: "Dispositivo usado",
      },
      ipAddress: { type: "string", required: true, description: "Endereço IP" },
      securityUrl: {
        type: "string",
        required: true,
        description: "URL das configurações de segurança",
      },
    },
  },

  // Templates de IA
  AI_CREDITS_LOW: {
    name: "Créditos de IA Baixos",
    description: "Aviso quando créditos de IA estão acabando",
    eventType: "ai.credits.low",
    category: NotificationCategory.AI_SERVICE,
    supportedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.IN_APP,
      NotificationChannel.PUSH,
    ],
    content: {
      [NotificationChannel.EMAIL]: {
        subject: "⚠️ Créditos de IA Acabando - Recarregue Agora",
        title: "Créditos de IA Baixos",
        body: `Olá {{userName}},

Seus créditos de IA estão acabando! ⚠️

💰 Créditos restantes: {{remainingCredits}}
📊 Uso mensal: {{monthlyUsage}}
📈 Média diária: {{dailyAverage}}

Para evitar interrupção dos serviços de IA:
• Faça um upgrade do seu plano
• Compre créditos adicionais
• Otimize o uso das funcionalidades

Não deixe seus chatbots pararem!`,
        htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #f59e0b;">⚠️ Créditos de IA Baixos</h1>
  
  <p>Olá <strong>{{userName}}</strong>,</p>
  
  <p>Seus créditos de IA estão acabando! ⚠️</p>
  
  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3>Resumo do Uso</h3>
    <p><strong>Créditos restantes:</strong> {{remainingCredits}}</p>
    <p><strong>Uso mensal:</strong> {{monthlyUsage}}</p>
    <p><strong>Média diária:</strong> {{dailyAverage}}</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{upgradeUrl}}" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">Fazer Upgrade</a>
    <a href="{{creditsUrl}}" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Comprar Créditos</a>
  </div>
</div>`,
      },
    },
    variables: {
      userName: {
        type: "string",
        required: true,
        description: "Nome do usuário",
      },
      remainingCredits: {
        type: "number",
        required: true,
        description: "Créditos restantes",
      },
      monthlyUsage: {
        type: "number",
        required: true,
        description: "Uso do mês",
      },
      dailyAverage: {
        type: "number",
        required: true,
        description: "Média diária",
      },
      upgradeUrl: {
        type: "string",
        required: true,
        description: "URL para upgrade",
      },
      creditsUrl: {
        type: "string",
        required: true,
        description: "URL para comprar créditos",
      },
    },
  },

  // Templates de Marketing (LGPD compliant)
  NEWSLETTER_WELCOME: {
    name: "Boas-vindas Newsletter",
    description: "Boas-vindas para assinantes da newsletter (Marketing)",
    eventType: "marketing.newsletter.welcome",
    category: NotificationCategory.MARKETING,
    supportedChannels: [NotificationChannel.EMAIL],
    content: {
      [NotificationChannel.EMAIL]: {
        subject: "📰 Bem-vindo(a) à Newsletter KRYONIX!",
        title: "Obrigado por se inscrever!",
        body: `Olá {{subscriberName}},

Obrigado por se inscrever em nossa newsletter! 📰

Você receberá conteúdos exclusivos sobre:
• Automação de processos
• Novidades da plataforma
• Dicas de WhatsApp Business
• Cases de sucesso
• Webinars e eventos

Fique tranquilo(a): respeitamos sua privacidade e seguimos a LGPD.
Você pode cancelar a inscrição a qualquer momento.`,
        htmlBody: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">📰 Bem-vindo(a) à Newsletter!</h1>
  
  <p>Olá <strong>{{subscriberName}}</strong>,</p>
  
  <p>Obrigado por se inscrever em nossa newsletter! 📰</p>
  
  <h3>Você receberá conteúdos exclusivos sobre:</h3>
  <ul>
    <li>Automação de processos</li>
    <li>Novidades da plataforma</li>
    <li>Dicas de WhatsApp Business</li>
    <li>Cases de sucesso</li>
    <li>Webinars e eventos</li>
  </ul>
  
  <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <p><small>🔒 Respeitamos sua privacidade e seguimos a LGPD. Você pode cancelar a inscrição a qualquer momento.</small></p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{unsubscribeUrl}}" style="background: #6b7280; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 12px;">Cancelar Inscrição</a>
  </div>
</div>`,
        footer: "KRYONIX - Plataforma de Automação Brasileira",
      },
    },
    variables: {
      subscriberName: {
        type: "string",
        required: true,
        description: "Nome do assinante",
      },
      subscriberEmail: {
        type: "string",
        required: true,
        description: "Email do assinante",
      },
      unsubscribeUrl: {
        type: "string",
        required: true,
        description: "URL para cancelar inscrição",
      },
    },
  },
};

// Configurações padrão para templates brasileiros
export const DEFAULT_BRAZILIAN_SETTINGS = {
  enableRichText: true,
  allowHtml: true,
  trackOpens: true,
  trackClicks: true,
  enableAbTesting: false,
  quietHours: {
    enabled: true,
    startTime: "22:00",
    endTime: "08:00",
    timezone: "America/Sao_Paulo",
  },
  rateLimiting: {
    enabled: true,
    maxPerHour: 10,
    maxPerDay: 50,
  },
  businessHours: {
    enabled: true,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    startTime: "09:00",
    endTime: "18:00",
    timezone: "America/Sao_Paulo",
    holidays: [
      "2024-01-01", // Confraternização Universal
      "2024-04-21", // Tiradentes
      "2024-05-01", // Dia do Trabalho
      "2024-09-07", // Independência do Brasil
      "2024-10-12", // Nossa Senhora Aparecida
      "2024-11-02", // Finados
      "2024-11-15", // Proclamação da República
      "2024-12-25", // Natal
    ],
  },
  retryPolicy: {
    maxRetries: 3,
    retryDelayMinutes: 15,
    backoffMultiplier: 2,
  },
};

// Função para criar templates padrão para um tenant
export async function createDefaultTemplatesForTenant(
  tenantId: string,
): Promise<void> {
  const { NotificationService } = await import("../services/notification");
  const service = NotificationService.getInstance();

  for (const [key, templateData] of Object.entries(
    BRAZILIAN_NOTIFICATION_TEMPLATES,
  )) {
    try {
      const template = await service.createTemplate(tenantId, {
        ...templateData,
        settings: DEFAULT_BRAZILIAN_SETTINGS,
      });

      console.log(`✅ Template criado: ${templateData.name} (${template.id})`);
    } catch (error) {
      console.error(
        `❌ Erro ao criar template ${templateData.name}:`,
        error.message,
      );
    }
  }
}

// Mapear categorias para descrições em português
export const CATEGORY_DESCRIPTIONS = {
  [NotificationCategory.SYSTEM]: "Sistema",
  [NotificationCategory.BILLING]: "Cobrança",
  [NotificationCategory.WHATSAPP]: "WhatsApp",
  [NotificationCategory.AI_SERVICE]: "Serviços de IA",
  [NotificationCategory.AUTOMATION]: "Automação",
  [NotificationCategory.TYPEBOT]: "Typebot",
  [NotificationCategory.MAUTIC]: "Mautic",
  [NotificationCategory.N8N]: "N8N",
  [NotificationCategory.USER_ACTION]: "Ação do Usuário",
  [NotificationCategory.INTEGRATION]: "Integração",
  [NotificationCategory.SECURITY]: "Segurança",
  [NotificationCategory.MARKETING]: "Marketing",
};

// Mapear canais para descrições em português
export const CHANNEL_DESCRIPTIONS = {
  [NotificationChannel.IN_APP]: "Notificação Interna",
  [NotificationChannel.EMAIL]: "Email",
  [NotificationChannel.WHATSAPP]: "WhatsApp",
  [NotificationChannel.PUSH]: "Push",
  [NotificationChannel.SMS]: "SMS",
  [NotificationChannel.WEBHOOK]: "Webhook",
};

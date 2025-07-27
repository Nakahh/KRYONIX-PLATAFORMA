import { FlowType } from "../entities/TypebotFlow";

// Lead Capture Template
export const LEAD_CAPTURE_TEMPLATE = {
  name: "Lead Capture Flow",
  description: "Collect visitor information and qualify leads automatically",
  type: FlowType.LEAD_CAPTURE,
  nodes: [
    {
      id: "start_1",
      type: "text",
      data: {
        content:
          "👋 Olá! Bem-vindo à nossa empresa! Eu sou seu assistente virtual. Como posso ajudá-lo hoje?",
      },
      position: { x: 100, y: 100 },
    },
    {
      id: "name_input",
      type: "input",
      data: {
        content: "Para começarmos, qual é o seu nome?",
        inputType: "text",
        placeholder: "Digite seu nome completo",
        variable: "name",
      },
      position: { x: 100, y: 200 },
    },
    {
      id: "email_input",
      type: "input",
      data: {
        content:
          "Perfeito, {{name}}! Agora preciso do seu e-mail para enviarmos informações relevantes.",
        inputType: "email",
        placeholder: "seu@email.com",
        variable: "email",
      },
      position: { x: 100, y: 300 },
    },
    {
      id: "phone_input",
      type: "input",
      data: {
        content: "Ótimo! Por último, qual é o seu telefone? (Opcional)",
        inputType: "phone",
        placeholder: "(11) 99999-9999",
        variable: "phone",
      },
      position: { x: 100, y: 400 },
    },
    {
      id: "interest_buttons",
      type: "buttons",
      data: {
        content: "Qual é o seu principal interesse?",
        buttons: [
          { id: "product", text: "Conhecer produtos", action: "next" },
          { id: "pricing", text: "Ver preços", action: "next" },
          { id: "demo", text: "Agendar demonstração", action: "next" },
          { id: "support", text: "Suporte técnico", action: "next" },
        ],
      },
      position: { x: 100, y: 500 },
    },
    {
      id: "crm_integration",
      type: "integration",
      data: {
        integration: {
          type: "crm",
          config: {
            action: "create_lead",
            fields: {
              name: "{{name}}",
              email: "{{email}}",
              phone: "{{phone}}",
              source: "typebot_lead_capture",
              interest: "{{selected_button}}",
            },
          },
        },
      },
      position: { x: 100, y: 600 },
    },
    {
      id: "thank_you",
      type: "text",
      data: {
        content:
          "Obrigado, {{name}}! Suas informações foram registradas. Nossa equipe entrará em contato em breve. 🚀",
      },
      position: { x: 100, y: 700 },
    },
  ],
  edges: [
    { id: "e1", source: "start_1", target: "name_input" },
    { id: "e2", source: "name_input", target: "email_input" },
    { id: "e3", source: "email_input", target: "phone_input" },
    { id: "e4", source: "phone_input", target: "interest_buttons" },
    { id: "e5", source: "interest_buttons", target: "crm_integration" },
    { id: "e6", source: "crm_integration", target: "thank_you" },
  ],
  variables: [
    {
      name: "name",
      type: "text",
      required: true,
      isPII: true,
      description: "User's full name",
    },
    {
      name: "email",
      type: "email",
      required: true,
      isPII: true,
      description: "User's email address",
    },
    {
      name: "phone",
      type: "phone",
      required: false,
      isPII: true,
      description: "User's phone number",
    },
    {
      name: "selected_button",
      type: "text",
      required: false,
      isPII: false,
      description: "User's interest selection",
    },
  ],
  settings: {
    theme: {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      fontFamily: "Inter, sans-serif",
    },
    behavior: {
      typingDelay: 1000,
      allowRestart: true,
      showProgressBar: true,
      enableAudio: false,
    },
    security: {
      enableEncryption: true,
      allowAnonymous: true,
      rateLimitEnabled: true,
      maxSessionsPerIP: 10,
    },
    integrations: {
      whatsappEnabled: true,
      webChatEnabled: true,
      embedEnabled: true,
      apiEnabled: true,
    },
    analytics: {
      trackConversions: true,
      trackEngagement: true,
      enableHeatmaps: true,
    },
  },
};

// Customer Support Template
export const CUSTOMER_SUPPORT_TEMPLATE = {
  name: "Customer Support Bot",
  description: "Automated customer support with intelligent routing",
  type: FlowType.CUSTOMER_SUPPORT,
  nodes: [
    {
      id: "welcome",
      type: "text",
      data: {
        content:
          "🎧 Olá! Sou seu assistente de suporte. Como posso ajudá-lo hoje?",
      },
      position: { x: 100, y: 100 },
    },
    {
      id: "support_options",
      type: "buttons",
      data: {
        content: "Selecione o tipo de ajuda que você precisa:",
        buttons: [
          { id: "technical", text: "🔧 Problema técnico", action: "next" },
          { id: "billing", text: "💳 Questão de cobrança", action: "next" },
          { id: "general", text: "ℹ️ Informações gerais", action: "next" },
          { id: "human", text: "👨‍💻 Falar com atendente", action: "next" },
        ],
      },
      position: { x: 100, y: 200 },
    },
    {
      id: "technical_condition",
      type: "condition",
      data: {
        conditions: [
          {
            variable: "selected_button",
            operator: "equals",
            value: "technical",
          },
        ],
      },
      position: { x: 50, y: 350 },
    },
    {
      id: "billing_condition",
      type: "condition",
      data: {
        conditions: [
          {
            variable: "selected_button",
            operator: "equals",
            value: "billing",
          },
        ],
      },
      position: { x: 150, y: 350 },
    },
    {
      id: "technical_form",
      type: "text",
      data: {
        content:
          "Vou ajudá-lo com o problema técnico. Por favor, descreva o que está acontecendo:",
      },
      position: { x: 50, y: 450 },
    },
    {
      id: "technical_description",
      type: "input",
      data: {
        inputType: "text",
        placeholder: "Descreva seu problema técnico...",
        variable: "technical_issue",
      },
      position: { x: 50, y: 550 },
    },
    {
      id: "billing_form",
      type: "text",
      data: {
        content:
          "Vou ajudá-lo com questões de cobrança. Para sua segurança, preciso de algumas informações:",
      },
      position: { x: 250, y: 450 },
    },
    {
      id: "customer_email",
      type: "input",
      data: {
        content: "Qual é o e-mail da sua conta?",
        inputType: "email",
        placeholder: "seu@email.com",
        variable: "customer_email",
      },
      position: { x: 250, y: 550 },
    },
    {
      id: "create_ticket",
      type: "integration",
      data: {
        integration: {
          type: "crm",
          config: {
            action: "create_ticket",
            priority: "medium",
            department: "{{selected_button}}",
          },
        },
      },
      position: { x: 150, y: 650 },
    },
    {
      id: "ticket_created",
      type: "text",
      data: {
        content:
          "✅ Ticket criado com sucesso! Número: #{{ticket_id}}. Nossa equipe retornará em até 24 horas.",
      },
      position: { x: 150, y: 750 },
    },
    {
      id: "faq_response",
      type: "text",
      data: {
        content:
          "📚 Aqui estão algumas perguntas frequentes que podem ajudar:\n\n1. Como redefinir senha?\n2. Como cancelar assinatura?\n3. Como contatar suporte?\n\nDigite o número da pergunta ou 'outros' para mais opções.",
      },
      position: { x: 350, y: 450 },
    },
    {
      id: "transfer_human",
      type: "text",
      data: {
        content:
          "🔄 Transferindo você para um atendente humano. Aguarde um momento...",
      },
      position: { x: 450, y: 450 },
    },
  ],
  edges: [
    { id: "e1", source: "welcome", target: "support_options" },
    { id: "e2", source: "support_options", target: "technical_condition" },
    { id: "e3", source: "support_options", target: "billing_condition" },
    {
      id: "e4",
      source: "technical_condition",
      target: "technical_form",
      label: "true",
    },
    { id: "e5", source: "technical_form", target: "technical_description" },
    {
      id: "e6",
      source: "billing_condition",
      target: "billing_form",
      label: "true",
    },
    { id: "e7", source: "billing_form", target: "customer_email" },
    { id: "e8", source: "technical_description", target: "create_ticket" },
    { id: "e9", source: "customer_email", target: "create_ticket" },
    { id: "e10", source: "create_ticket", target: "ticket_created" },
    {
      id: "e11",
      source: "technical_condition",
      target: "faq_response",
      label: "false",
    },
    {
      id: "e12",
      source: "billing_condition",
      target: "transfer_human",
      label: "false",
    },
  ],
  variables: [
    {
      name: "selected_button",
      type: "text",
      required: true,
      isPII: false,
      description: "User's support category selection",
    },
    {
      name: "technical_issue",
      type: "text",
      required: false,
      isPII: false,
      description: "Description of technical problem",
    },
    {
      name: "customer_email",
      type: "email",
      required: false,
      isPII: true,
      description: "Customer's account email",
    },
    {
      name: "ticket_id",
      type: "text",
      required: false,
      isPII: false,
      description: "Generated support ticket ID",
    },
  ],
  settings: {
    theme: {
      primaryColor: "#EF4444",
      secondaryColor: "#F59E0B",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      fontFamily: "Inter, sans-serif",
    },
    behavior: {
      typingDelay: 800,
      allowRestart: true,
      showProgressBar: false,
      enableAudio: false,
    },
    security: {
      enableEncryption: true,
      allowAnonymous: false,
      rateLimitEnabled: true,
      maxSessionsPerIP: 5,
    },
    integrations: {
      whatsappEnabled: true,
      webChatEnabled: true,
      embedEnabled: false,
      apiEnabled: true,
    },
    analytics: {
      trackConversions: false,
      trackEngagement: true,
      enableHeatmaps: false,
    },
  },
};

// Product Showcase Template
export const PRODUCT_SHOWCASE_TEMPLATE = {
  name: "Product Showcase",
  description: "Interactive product catalog with ordering capability",
  type: FlowType.PRODUCT_SHOWCASE,
  nodes: [
    {
      id: "welcome",
      type: "text",
      data: {
        content:
          "🛍️ Bem-vindo à nossa loja! Conheça nossos produtos incríveis.",
      },
      position: { x: 100, y: 100 },
    },
    {
      id: "product_image",
      type: "image",
      data: {
        mediaUrl:
          "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Produto+Destaque",
        caption: "🌟 Produto em Destaque - Edição Limitada",
      },
      position: { x: 100, y: 200 },
    },
    {
      id: "product_details",
      type: "text",
      data: {
        content:
          "📦 **KRYONIX Premium Package**\n\n✅ Automação WhatsApp Ilimitada\n✅ IA Avançada Integrada\n✅ Suporte 24/7\n✅ White Label Completo\n\n💰 **De R$ 299,90 por apenas R$ 199,90/mês**",
      },
      position: { x: 100, y: 300 },
    },
    {
      id: "interest_check",
      type: "buttons",
      data: {
        content: "Tem interesse neste produto?",
        buttons: [
          { id: "yes", text: "😍 Sim, quero saber mais!", action: "next" },
          { id: "maybe", text: "🤔 Talvez, preciso pensar", action: "next" },
          { id: "no", text: "😐 Não, obrigado", action: "next" },
          { id: "other", text: "🔍 Ver outros produtos", action: "next" },
        ],
      },
      position: { x: 100, y: 400 },
    },
    {
      id: "interested_condition",
      type: "condition",
      data: {
        conditions: [
          {
            variable: "interest_level",
            operator: "equals",
            value: "yes",
          },
        ],
      },
      position: { x: 100, y: 500 },
    },
    {
      id: "contact_form",
      type: "text",
      data: {
        content:
          "🎉 Ótimo! Vamos finalizar seu pedido. Preciso de alguns dados:",
      },
      position: { x: 50, y: 600 },
    },
    {
      id: "customer_name",
      type: "input",
      data: {
        content: "Qual é o seu nome?",
        inputType: "text",
        placeholder: "Seu nome completo",
        variable: "customer_name",
      },
      position: { x: 50, y: 700 },
    },
    {
      id: "customer_email_order",
      type: "input",
      data: {
        content: "E seu e-mail para enviarmos os detalhes:",
        inputType: "email",
        placeholder: "seu@email.com",
        variable: "customer_email",
      },
      position: { x: 50, y: 800 },
    },
    {
      id: "payment_options",
      type: "buttons",
      data: {
        content: "Como prefere pagar?",
        buttons: [
          { id: "card", text: "💳 Cartão", action: "next" },
          { id: "pix", text: "📱 PIX", action: "next" },
          { id: "boleto", text: "📄 Boleto", action: "next" },
        ],
      },
      position: { x: 50, y: 900 },
    },
    {
      id: "process_order",
      type: "integration",
      data: {
        integration: {
          type: "stripe",
          config: {
            action: "create_payment_link",
            amount: 19990,
            currency: "brl",
            product: "KRYONIX Premium Package",
          },
        },
      },
      position: { x: 50, y: 1000 },
    },
    {
      id: "payment_link",
      type: "text",
      data: {
        content:
          "💳 Perfeito! Aqui está seu link de pagamento seguro:\n\n🔗 {{payment_link}}\n\nApós o pagamento, você receberá acesso imediato!",
      },
      position: { x: 50, y: 1100 },
    },
    {
      id: "maybe_nurture",
      type: "text",
      data: {
        content:
          "🤔 Sem problemas! Que tal receber mais informações por e-mail? Digite seu e-mail:",
      },
      position: { x: 250, y: 600 },
    },
    {
      id: "nurture_email",
      type: "input",
      data: {
        inputType: "email",
        placeholder: "seu@email.com",
        variable: "nurture_email",
      },
      position: { x: 250, y: 700 },
    },
    {
      id: "thanks_nurture",
      type: "text",
      data: {
        content:
          "📧 Perfeito! Você receberá materiais exclusivos em breve. Obrigado!",
      },
      position: { x: 250, y: 800 },
    },
  ],
  edges: [
    { id: "e1", source: "welcome", target: "product_image" },
    { id: "e2", source: "product_image", target: "product_details" },
    { id: "e3", source: "product_details", target: "interest_check" },
    { id: "e4", source: "interest_check", target: "interested_condition" },
    {
      id: "e5",
      source: "interested_condition",
      target: "contact_form",
      label: "true",
    },
    { id: "e6", source: "contact_form", target: "customer_name" },
    { id: "e7", source: "customer_name", target: "customer_email_order" },
    { id: "e8", source: "customer_email_order", target: "payment_options" },
    { id: "e9", source: "payment_options", target: "process_order" },
    { id: "e10", source: "process_order", target: "payment_link" },
    {
      id: "e11",
      source: "interested_condition",
      target: "maybe_nurture",
      label: "false",
    },
    { id: "e12", source: "maybe_nurture", target: "nurture_email" },
    { id: "e13", source: "nurture_email", target: "thanks_nurture" },
  ],
  variables: [
    {
      name: "interest_level",
      type: "text",
      required: true,
      isPII: false,
      description: "Customer's interest level",
    },
    {
      name: "customer_name",
      type: "text",
      required: false,
      isPII: true,
      description: "Customer's name for order",
    },
    {
      name: "customer_email",
      type: "email",
      required: false,
      isPII: true,
      description: "Customer's email for order",
    },
    {
      name: "payment_method",
      type: "text",
      required: false,
      isPII: false,
      description: "Selected payment method",
    },
    {
      name: "payment_link",
      type: "url",
      required: false,
      isPII: false,
      description: "Generated payment link",
    },
    {
      name: "nurture_email",
      type: "email",
      required: false,
      isPII: true,
      description: "Email for nurture campaign",
    },
  ],
  settings: {
    theme: {
      primaryColor: "#10B981",
      secondaryColor: "#F59E0B",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      fontFamily: "Inter, sans-serif",
    },
    behavior: {
      typingDelay: 1200,
      allowRestart: true,
      showProgressBar: true,
      enableAudio: false,
    },
    security: {
      enableEncryption: true,
      allowAnonymous: true,
      rateLimitEnabled: true,
      maxSessionsPerIP: 20,
    },
    integrations: {
      whatsappEnabled: true,
      webChatEnabled: true,
      embedEnabled: true,
      apiEnabled: true,
    },
    analytics: {
      trackConversions: true,
      trackEngagement: true,
      enableHeatmaps: true,
    },
  },
};

// Appointment Booking Template
export const APPOINTMENT_BOOKING_TEMPLATE = {
  name: "Appointment Booking",
  description: "Schedule appointments with calendar integration",
  type: FlowType.APPOINTMENT_BOOKING,
  nodes: [
    {
      id: "welcome",
      type: "text",
      data: {
        content: "📅 Olá! Vou ajudá-lo a agendar um horário. É rápido e fácil!",
      },
      position: { x: 100, y: 100 },
    },
    {
      id: "service_selection",
      type: "buttons",
      data: {
        content: "Que tipo de atendimento você precisa?",
        buttons: [
          { id: "consultation", text: "💼 Consultoria", action: "next" },
          { id: "demo", text: "🖥️ Demonstração", action: "next" },
          { id: "support", text: "🔧 Suporte técnico", action: "next" },
          { id: "training", text: "📚 Treinamento", action: "next" },
        ],
      },
      position: { x: 100, y: 200 },
    },
    {
      id: "customer_info",
      type: "text",
      data: {
        content: "Perfeito! Agora preciso de algumas informações suas:",
      },
      position: { x: 100, y: 300 },
    },
    {
      id: "name_input",
      type: "input",
      data: {
        content: "Qual é o seu nome?",
        inputType: "text",
        placeholder: "Seu nome completo",
        variable: "customer_name",
      },
      position: { x: 100, y: 400 },
    },
    {
      id: "email_input",
      type: "input",
      data: {
        content: "E o seu e-mail:",
        inputType: "email",
        placeholder: "seu@email.com",
        variable: "customer_email",
      },
      position: { x: 100, y: 500 },
    },
    {
      id: "phone_input",
      type: "input",
      data: {
        content: "Seu telefone para contato:",
        inputType: "phone",
        placeholder: "(11) 99999-9999",
        variable: "customer_phone",
      },
      position: { x: 100, y: 600 },
    },
    {
      id: "preferred_date",
      type: "input",
      data: {
        content: "Qual data você prefere? (DD/MM/AAAA)",
        inputType: "date",
        placeholder: "25/01/2024",
        variable: "preferred_date",
      },
      position: { x: 100, y: 700 },
    },
    {
      id: "preferred_time",
      type: "buttons",
      data: {
        content: "Qual horário você prefere?",
        buttons: [
          { id: "morning", text: "🌅 Manhã (9h-12h)", action: "next" },
          { id: "afternoon", text: "🌞 Tarde (13h-17h)", action: "next" },
          { id: "evening", text: "🌆 Noite (18h-20h)", action: "next" },
        ],
      },
      position: { x: 100, y: 800 },
    },
    {
      id: "book_appointment",
      type: "integration",
      data: {
        integration: {
          type: "calendar",
          config: {
            action: "create_appointment",
            service: "{{selected_service}}",
            duration: 60,
            timezone: "America/Sao_Paulo",
          },
        },
      },
      position: { x: 100, y: 900 },
    },
    {
      id: "confirmation",
      type: "text",
      data: {
        content:
          "✅ **Agendamento confirmado!**\n\n📅 **Data:** {{confirmed_date}}\n🕐 **Horário:** {{confirmed_time}}\n👤 **Consultor:** {{assigned_consultant}}\n\n📧 Você receberá um e-mail de confirmação com o link da reunião.\n\n💬 Precisa reagendar? Entre em contato conosco!",
      },
      position: { x: 100, y: 1000 },
    },
  ],
  edges: [
    { id: "e1", source: "welcome", target: "service_selection" },
    { id: "e2", source: "service_selection", target: "customer_info" },
    { id: "e3", source: "customer_info", target: "name_input" },
    { id: "e4", source: "name_input", target: "email_input" },
    { id: "e5", source: "email_input", target: "phone_input" },
    { id: "e6", source: "phone_input", target: "preferred_date" },
    { id: "e7", source: "preferred_date", target: "preferred_time" },
    { id: "e8", source: "preferred_time", target: "book_appointment" },
    { id: "e9", source: "book_appointment", target: "confirmation" },
  ],
  variables: [
    {
      name: "selected_service",
      type: "text",
      required: true,
      isPII: false,
      description: "Type of service selected",
    },
    {
      name: "customer_name",
      type: "text",
      required: true,
      isPII: true,
      description: "Customer's full name",
    },
    {
      name: "customer_email",
      type: "email",
      required: true,
      isPII: true,
      description: "Customer's email address",
    },
    {
      name: "customer_phone",
      type: "phone",
      required: true,
      isPII: true,
      description: "Customer's phone number",
    },
    {
      name: "preferred_date",
      type: "date",
      required: true,
      isPII: false,
      description: "Preferred appointment date",
    },
    {
      name: "preferred_time",
      type: "text",
      required: true,
      isPII: false,
      description: "Preferred time slot",
    },
    {
      name: "confirmed_date",
      type: "date",
      required: false,
      isPII: false,
      description: "Confirmed appointment date",
    },
    {
      name: "confirmed_time",
      type: "text",
      required: false,
      isPII: false,
      description: "Confirmed appointment time",
    },
    {
      name: "assigned_consultant",
      type: "text",
      required: false,
      isPII: false,
      description: "Assigned consultant name",
    },
  ],
  settings: {
    theme: {
      primaryColor: "#8B5CF6",
      secondaryColor: "#06B6D4",
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      fontFamily: "Inter, sans-serif",
    },
    behavior: {
      typingDelay: 1000,
      allowRestart: true,
      showProgressBar: true,
      enableAudio: false,
    },
    security: {
      enableEncryption: true,
      allowAnonymous: true,
      rateLimitEnabled: true,
      maxSessionsPerIP: 15,
    },
    integrations: {
      whatsappEnabled: true,
      webChatEnabled: true,
      embedEnabled: true,
      apiEnabled: true,
    },
    analytics: {
      trackConversions: true,
      trackEngagement: true,
      enableHeatmaps: false,
    },
  },
};

// Export all templates
export const TYPEBOT_TEMPLATES = {
  LEAD_CAPTURE: LEAD_CAPTURE_TEMPLATE,
  CUSTOMER_SUPPORT: CUSTOMER_SUPPORT_TEMPLATE,
  PRODUCT_SHOWCASE: PRODUCT_SHOWCASE_TEMPLATE,
  APPOINTMENT_BOOKING: APPOINTMENT_BOOKING_TEMPLATE,
};

export const getTemplateByType = (type: FlowType) => {
  return TYPEBOT_TEMPLATES[type] || null;
};

export const getAllTemplates = () => {
  return Object.values(TYPEBOT_TEMPLATES);
};

export const getTemplatesByCategory = (
  category: "sales" | "support" | "marketing" | "general",
) => {
  const categories = {
    sales: [TYPEBOT_TEMPLATES.LEAD_CAPTURE, TYPEBOT_TEMPLATES.PRODUCT_SHOWCASE],
    support: [
      TYPEBOT_TEMPLATES.CUSTOMER_SUPPORT,
      TYPEBOT_TEMPLATES.APPOINTMENT_BOOKING,
    ],
    marketing: [
      TYPEBOT_TEMPLATES.LEAD_CAPTURE,
      TYPEBOT_TEMPLATES.PRODUCT_SHOWCASE,
    ],
    general: Object.values(TYPEBOT_TEMPLATES),
  };

  return categories[category] || [];
};

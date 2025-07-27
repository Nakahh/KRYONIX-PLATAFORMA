import { CampaignType, TriggerType } from "../entities/MauticCampaign";

// Templates de campanhas específicas para o mercado brasileiro
export const MAUTIC_CAMPAIGN_TEMPLATES = {
  // Template de Boas-vindas
  WELCOME_SERIES_BR: {
    name: "Série de Boas-vindas Brasil",
    description:
      "Sequência de emails de boas-vindas adaptada para o mercado brasileiro",
    type: CampaignType.WELCOME_SERIES,
    triggers: [
      {
        type: TriggerType.TAG_ADDED,
        conditions: {
          tags: ["novo_lead", "inscrito"],
        },
        delay: 0,
      },
    ],
    actions: [
      {
        type: "send_email",
        delay: 0,
        templateId: 1,
        subject: "🎉 Bem-vindo(a) à nossa família!",
        content: `
Olá {{lead.firstname}}!

Seja muito bem-vindo(a)! Estamos felizes em tê-lo(a) conosco.

Nos próximos dias, você receberá:
✅ Dicas exclusivas sobre [SEU_SEGMENTO]
✅ Ofertas especiais só para você
✅ Conteúdo personalizado

Um grande abraço,
Equipe {{company.name}}

📱 WhatsApp: {{company.whatsapp}}
📧 Email: {{company.email}}

P.S.: Salve nosso número no WhatsApp para receber dicas rápidas!
        `,
      },
      {
        type: "send_whatsapp",
        delay: 60, // 1 hora depois
        message:
          "👋 Oi {{lead.firstname}}! Acabamos de te enviar um email de boas-vindas. Que tal salvar nosso número e receber dicas exclusivas por aqui também? 😊",
      },
      {
        type: "send_email",
        delay: 1440, // 24 horas depois
        templateId: 2,
        subject: "🎁 Presente especial para você!",
        content: `
Oi {{lead.firstname}}!

Como você é especial para nós, preparamos um presente:

🎁 [OFERTA_ESPECIAL] com 15% de desconto
💳 Pague no PIX e ganhe mais 5% off
🚚 Frete grátis para todo o Brasil

Use o código: BEMVINDO15

[BOTÃO: RESGATAR OFERTA]

Válido até {{expiry_date}}!

Abraços,
{{sender.name}}
        `,
      },
      {
        type: "add_tag",
        tags: ["welcome_series_completed"],
        delay: 4320, // 3 dias depois
      },
    ],
    settings: {
      allowRestart: false,
      timezone: "America/Sao_Paulo",
      language: "pt_BR",
      respectBusinessHours: true,
      businessHours: {
        start: "09:00",
        end: "18:00",
      },
      avoidHolidays: true,
      holidaysList: [
        "2024-01-01", // Ano Novo
        "2024-04-21", // Tiradentes
        "2024-05-01", // Dia do Trabalho
        "2024-09-07", // Independência
        "2024-10-12", // Nossa Senhora Aparecida
        "2024-11-02", // Finados
        "2024-11-15", // Proclamação da República
        "2024-12-25", // Natal
      ],
      requireConsent: true,
      unsubscribeLink: true,
    },
  },

  // Template de Carrinho Abandonado
  ABANDONED_CART_BR: {
    name: "Recuperação de Carrinho Abandonado",
    description:
      "Sequência para recuperar vendas abandonadas com foco em pagamento PIX",
    type: CampaignType.ABANDONED_CART,
    triggers: [
      {
        type: TriggerType.CUSTOM_EVENT,
        conditions: {
          event: "cart_abandoned",
          delay_minutes: 30,
        },
      },
    ],
    actions: [
      {
        type: "send_whatsapp",
        delay: 30, // 30 minutos
        message: `Oi {{lead.firstname}}! 🛒

Notamos que você deixou alguns itens no carrinho. Que tal finalizar sua compra?

🎁 Use VOLTA10 e ganhe 10% OFF
💳 PIX: mais 5% de desconto  
🚚 Frete GRÁTIS acima de R$ 99

⏰ Oferta válida por 24h!

[LINK_CARRINHO]`,
      },
      {
        type: "send_email",
        delay: 120, // 2 horas
        subject: "⏰ Seus itens estão te esperando...",
        content: `
Oi {{lead.firstname}}!

Seus produtos favoritos ainda estão no carrinho:

{{cart_items}}

💡 Dica: Pague no PIX e economize mais 5%!

✨ OFERTA ESPECIAL:
• Código VOLTA10: 10% de desconto
• PIX: mais 5% off
• Frete grátis para todo o Brasil

[FINALIZAR COMPRA]

Não perca essa oportunidade!
        `,
      },
      {
        type: "send_email",
        delay: 1440, // 24 horas
        subject: "🔥 ÚLTIMA CHANCE: 15% OFF expira hoje!",
        content: `
{{lead.firstname}}, esta é sua última chance!

Seus itens no carrinho:
{{cart_items}}

🔥 OFERTA RELÂMPAGO:
✅ 15% OFF com ULTIMA15
✅ PIX: mais 5% de desconto
✅ Frete GRÁTIS

⏰ Expira em algumas horas!

[COMPRAR AGORA]

Não deixe essa oportunidade passar!
        `,
      },
      {
        type: "add_tag",
        tags: ["carrinho_abandonado_nao_convertido"],
        delay: 4320, // 3 dias
        conditions: {
          no_purchase: true,
        },
      },
    ],
    settings: {
      allowRestart: false,
      timezone: "America/Sao_Paulo",
      language: "pt_BR",
      respectBusinessHours: true,
      businessHours: {
        start: "08:00",
        end: "22:00",
      },
      requireConsent: true,
      throttling: {
        maxEmailsPerHour: 100,
        maxWhatsAppPerHour: 50,
      },
    },
  },

  // Template de Nutrição de Leads
  LEAD_NURTURING_BR: {
    name: "Nutrição de Leads Brasil",
    description:
      "Sequência educativa para nutrir leads com conteúdo brasileiro",
    type: CampaignType.LEAD_NURTURING,
    triggers: [
      {
        type: TriggerType.LEAD_SCORE,
        conditions: {
          minScore: 3,
          maxScore: 6,
        },
      },
    ],
    actions: [
      {
        type: "send_email",
        delay: 0,
        subject: "💡 Dica #1: Como [RESOLVER_PROBLEMA] no Brasil",
        content: `
Oi {{lead.firstname}}!

Hoje vou compartilhar uma dica valiosa que pode ajudar você a [RESOLVER_PROBLEMA].

No Brasil, muitas pessoas enfrentam [PROBLEMA_COMUM]. Aqui está uma solução prática:

[CONTEÚDO_EDUCATIVO]

💡 Dica extra: [DICA_ESPECÍFICA_BRASIL]

Gostou? Responda este email com suas dúvidas!

Abraços,
{{sender.name}}

P.S.: Na próxima semana, vou falar sobre [PRÓXIMO_TÓPICO].
        `,
      },
      {
        type: "ai_analysis",
        delay: 1440, // 1 dia
        service: "OPENAI",
        operation: "ENGAGEMENT_ANALYSIS",
        prompt:
          "Analise o engajamento deste lead nos últimos emails e sugira o próximo conteúdo personalizado",
      },
      {
        type: "send_whatsapp",
        delay: 2880, // 2 dias
        message: `Oi {{lead.firstname}}! 👋

Viu nossa última dica sobre [TÓPICO]? 

📺 Gravei um vídeo rápido explicando melhor:
[LINK_VIDEO]

⏱️ São só 3 minutos que podem fazer a diferença!

Qualquer dúvida, só responder aqui 😊`,
      },
      {
        type: "send_email",
        delay: 5040, // 3.5 dias
        subject: "📊 Estudo de caso brasileiro: [CASO_SUCESSO]",
        content: `
{{lead.firstname}}, preparei algo especial!

Um estudo de caso real de um cliente brasileiro que conseguiu [RESULTADO_ESPECÍFICO].

🇧🇷 CASO DE SUCESSO:
• Empresa: [EMPRESA_BRASILEIRA]
• Localização: [CIDADE/ESTADO]
• Desafio: [DESAFIO_ESPECÍFICO]
• Solução: [SOLUÇÃO_APLICADA]
• Resultado: [RESULTADO_OBTIDO]

💰 Economia gerada: R$ [VALOR]
⏰ Tempo para resultado: [TEMPO]

[LER CASO COMPLETO]

Que tal agendar uma conversa para ver como isso pode funcionar para você?

[AGENDAR CONVERSA]
        `,
      },
      {
        type: "modify_lead_score",
        delay: 7200, // 5 dias
        points: 2,
        reason: "Completou sequência de nutrição",
      },
    ],
  },

  // Template de Black Friday
  BLACK_FRIDAY_BR: {
    name: "Campanha Black Friday Brasil",
    description: "Campanha especial para Black Friday com ofertas brasileiras",
    type: CampaignType.SEASONAL,
    triggers: [
      {
        type: TriggerType.TAG_ADDED,
        conditions: {
          tags: ["black_friday_2024"],
        },
      },
    ],
    actions: [
      {
        type: "send_whatsapp",
        delay: 0,
        message: `🔥 BLACK FRIDAY CHEGOU! 🔥

{{lead.firstname}}, as MELHORES ofertas do ano estão aqui!

⚡ ATÉ 70% OFF
💳 PIX: mais 10% de desconto
🚚 Frete GRÁTIS para todo Brasil
🎁 Brindes exclusivos

⏰ CORRE! Ofertas limitadas!

[VER OFERTAS]`,
      },
      {
        type: "send_email",
        delay: 30,
        subject: "🚨 BLACK FRIDAY: ATÉ 70% OFF + PIX 10% EXTRA!",
        content: `
🔥 {{lead.firstname}}, a BLACK FRIDAY chegou!

As MAIORES ofertas do ano estão aqui:

🏷️ ATÉ 70% DE DESCONTO
💳 PIX: mais 10% off
🚚 FRETE GRÁTIS
🎁 BRINDES EXCLUSIVOS

⭐ DESTAQUES:
• [PRODUTO_1]: R$ {{price_1}} (era R$ {{old_price_1}})
• [PRODUTO_2]: R$ {{price_2}} (era R$ {{old_price_2}})
• [PRODUTO_3]: R$ {{price_3}} (era R$ {{old_price_3}})

[APROVEITAR OFERTAS]

⏰ Termina em: {{countdown}}

Não deixe para depois!
        `,
      },
      {
        type: "send_whatsapp",
        delay: 720, // 12 horas
        message: `⏰ ÚLTIMAS HORAS! ⏰

{{lead.firstname}}, restam poucas horas da BLACK FRIDAY!

🔥 Ainda dá tempo de aproveitar:
• ATÉ 70% OFF
• PIX: +10% desconto
• Frete GRÁTIS

Corre! {{hours_left}} horas restantes!

[COMPRAR AGORA]`,
      },
    ],
    settings: {
      allowRestart: false,
      timezone: "America/Sao_Paulo",
      language: "pt_BR",
      respectBusinessHours: false, // Black Friday pode enviar a qualquer hora
      requireConsent: true,
      throttling: {
        maxEmailsPerHour: 1000,
        maxWhatsAppPerHour: 500,
      },
    },
  },
};

// Templates específicos para segmentos brasileiros
export const BRAZILIAN_MARKET_TEMPLATES = {
  // Template para E-commerce
  ECOMMERCE_BR: {
    name: "E-commerce Brasil - Jornada Completa",
    description:
      "Jornada completa para e-commerce brasileiro com PIX e marketplace",
    type: CampaignType.CUSTOM,
    triggers: [
      {
        type: TriggerType.FORM_SUBMISSION,
        conditions: {
          form: "newsletter_ecommerce",
        },
      },
    ],
    actions: [
      {
        type: "send_email",
        delay: 0,
        subject: "🛍️ Bem-vindo à melhor loja online do Brasil!",
        content: `
Oi {{lead.firstname}}!

Bem-vindo(a) à nossa loja! 🎉

🇧🇷 VANTAGENS EXCLUSIVAS:
✅ Entrega para todo o Brasil
✅ PIX com desconto especial
✅ Atendimento humanizado
✅ Política de troca flexível

🎁 OFERTA DE BOAS-VINDAS:
Código BEM15 = 15% OFF na primeira compra

[CONHECER PRODUTOS]

Dúvidas? Nossa equipe está no WhatsApp: {{whatsapp}}

Um abraço,
Equipe {{company.name}}
        `,
      },
      {
        type: "send_whatsapp",
        delay: 1440, // 1 dia
        message: `Oi {{lead.firstname}}! 😊

Como você está? Viu nossas novidades?

📱 Baixe nosso app e ganhe:
• Frete grátis na 1ª compra
• Notificações de ofertas
• Cupons exclusivos

[BAIXAR APP]

Qualquer coisa, estou aqui! 💬`,
      },
      {
        type: "send_email",
        delay: 4320, // 3 dias
        subject: "💳 PIX no e-commerce: mais segurança e desconto!",
        content: `
{{lead.firstname}}, você sabia?

O PIX é a forma mais segura e rápida de comprar online!

💰 VANTAGENS DO PIX:
• Pagamento instantâneo
• 100% seguro
• Desconto de 5% em todas as compras
• Sem taxas extras

🔒 SEGURANÇA GARANTIDA:
• Criptografia bancária
• Dados protegidos
• Política anti-fraude

[COMPRAR COM PIX]

Experimente e comprove!
        `,
      },
    ],
  },

  // Template para Serviços Profissionais
  SERVICOS_PROFISSIONAIS_BR: {
    name: "Serviços Profissionais Brasil",
    description: "Template para prestadores de serviços profissionais",
    type: CampaignType.LEAD_NURTURING,
    triggers: [
      {
        type: TriggerType.TAG_ADDED,
        conditions: {
          tags: ["interessado_servicos"],
        },
      },
    ],
    actions: [
      {
        type: "send_email",
        delay: 0,
        subject: "🤝 Como posso ajudar seu negócio a crescer?",
        content: `
Olá {{lead.firstname}}!

Obrigado pelo interesse em nossos serviços!

🎯 NOSSO COMPROMISSO:
✅ Resultados comprovados
✅ Atendimento personalizado  
✅ Preços justos e transparentes
✅ Expertise em mercado brasileiro

📋 COMO FUNCIONA:
1. Conversa inicial gratuita
2. Diagnóstico do seu negócio
3. Proposta personalizada
4. Acompanhamento total

[AGENDAR CONVERSA GRATUITA]

📞 WhatsApp: {{whatsapp}}
📧 Email: {{email}}

Vamos conversar?

{{sender.name}}
        `,
      },
      {
        type: "send_whatsapp",
        delay: 2880, // 2 dias
        message: `Oi {{lead.firstname}}! 👋

Tudo bem? Viu nosso email sobre a conversa gratuita?

💡 Em 30 minutos posso te mostrar:
• Como otimizar seus processos
• Oportunidades de economia
• Estratégias para crescer

📅 Que tal hoje às {{suggested_time}}?

Responda "SIM" se tiver interesse! 😊`,
      },
      {
        type: "send_email",
        delay: 7200, // 5 dias
        subject: "📊 Case de sucesso: empresa brasileira economizou R$ 50mil",
        content: `
{{lead.firstname}}, vou compartilhar um caso real!

🏢 CLIENTE: Empresa de logística (SP)
📊 DESAFIO: Processos manuais e custos altos
⚡ SOLUÇÃO: Automação e otimização
💰 RESULTADO: Economia de R$ 50.000/mês

"Em 6 meses, conseguimos reduzir nossos custos operacionais em 40% e aumentar a produtividade da equipe." - CEO da empresa

🎯 BENEFÍCIOS ALCANÇADOS:
• Redução de 40% nos custos
• Aumento de 60% na produtividade
• ROI de 300% em 1 ano
• Equipe mais motivada

[LER CASE COMPLETO]

Que tal uma conversa para ver como isso pode funcionar para você?

[AGENDAR CONSULTA]
        `,
      },
    ],
  },

  // Template para SaaS/Software
  SAAS_BR: {
    name: "SaaS Brasil - Trial e Conversão",
    description: "Jornada otimizada para SaaS no mercado brasileiro",
    type: CampaignType.LEAD_NURTURING,
    triggers: [
      {
        type: TriggerType.CUSTOM_EVENT,
        conditions: {
          event: "trial_started",
        },
      },
    ],
    actions: [
      {
        type: "send_email",
        delay: 0,
        subject: "🚀 Seu teste grátis está ativo! Como começar?",
        content: `
Oi {{lead.firstname}}!

Seu teste grátis de {{trial_days}} dias está ativo! 🎉

📋 PRIMEIROS PASSOS:
1. Complete seu perfil
2. Explore os recursos principais  
3. Configure sua primeira automação
4. Importe seus dados

🎯 RECURSOS MAIS USADOS:
• [RECURSO_1] - {{description_1}}
• [RECURSO_2] - {{description_2}}  
• [RECURSO_3] - {{description_3}}

💡 DICA: Comece com [FEATURE_INICIAL] para ver resultados rápidos!

[COMEÇAR AGORA]

📞 Dúvidas? WhatsApp: {{support_whatsapp}}

Sucesso!
{{sender.name}}
        `,
      },
      {
        type: "send_whatsapp",
        delay: 1440, // 1 dia
        message: `E aí {{lead.firstname}}! 😊

Como está sendo sua experiência?

💬 Precisa de ajuda para:
• Configurar sua conta?
• Entender algum recurso?
• Migrar seus dados?

Estou aqui para ajudar! Só responder 👍`,
      },
      {
        type: "send_email",
        delay: 4320, // 3 dias
        subject: "💡 3 dicas para otimizar seus resultados",
        content: `
{{lead.firstname}}, como estão seus primeiros dias?

Separei 3 dicas dos usuários que mais têm sucesso:

🎯 DICA #1: Configure alertas
Receba notificações dos eventos importantes

⚡ DICA #2: Use os relatórios
Acompanhe seus resultados em tempo real

🚀 DICA #3: Automatize processos
Economize horas de trabalho manual

[VER TUTORIAL COMPLETO]

📊 Seus números até agora:
• [METRIC_1]: {{value_1}}
• [METRIC_2]: {{value_2}}
• [METRIC_3]: {{value_3}}

Continue assim! 👏
        `,
      },
      {
        type: "send_email",
        delay: 10080, // 7 dias
        subject: "⏰ Metade do seu teste já passou. Vamos acelerar?",
        content: `
{{lead.firstname}}, você já está na metade do seu teste!

📊 SEU PROGRESSO:
✅ Recursos explorados: {{features_used}}/{{total_features}}
✅ Configurações: {{setup_percentage}}% completo
✅ Dados processados: {{data_points}}

🚀 PARA APROVEITAR AO MÁXIMO:
• Complete a configuração avançada
• Teste as integrações
• Configure seus relatórios personalizados

[ACELERAR CONFIGURAÇÃO]

💬 Quer uma ajuda personalizada? 
Agende 15 min comigo: [CALENDLY_LINK]

Vamos juntos!
{{sender.name}}
        `,
      },
    ],
  },

  // Template para Imóveis
  IMOVEIS_BR: {
    name: "Imóveis Brasil - Nutrição de Interessados",
    description: "Template para mercado imobiliário brasileiro",
    type: CampaignType.LEAD_NURTURING,
    triggers: [
      {
        type: TriggerType.FORM_SUBMISSION,
        conditions: {
          form: "interesse_imovel",
        },
      },
    ],
    actions: [
      {
        type: "send_whatsapp",
        delay: 5, // 5 minutos
        message: `Oi {{lead.firstname}}! 🏠

Vi que você demonstrou interesse em nossos imóveis!

🔍 Para te ajudar melhor, me conta:
• Qual tipo de imóvel procura?
• Região de preferência?
• Faixa de preço?

📱 Tenho várias opções incríveis para mostrar!

Responde aqui que te envio algumas sugestões 😊`,
      },
      {
        type: "send_email",
        delay: 60, // 1 hora
        subject: "🏠 Sua busca por imóveis: guia completo",
        content: `
Oi {{lead.firstname}}!

Obrigado pelo interesse! Preparei um guia para sua busca:

🏠 TIPOS DE IMÓVEIS DISPONÍVEIS:
• Apartamentos: {{apt_count}} opções
• Casas: {{house_count}} opções  
• Coberturas: {{penthouse_count}} opções
• Comerciais: {{commercial_count}} opções

📍 REGIÕES ATENDIDAS:
{{neighborhood_list}}

💰 FACILIDADES DE PAGAMENTO:
✅ Financiamento FGTS
✅ Consórcio
✅ Entrada facilitada
✅ Documentação simplificada

[VER IMÓVEIS DISPONÍVEIS]

📞 WhatsApp: {{whatsapp}}
📧 Email: {{email}}

Vamos encontrar seu imóvel ideal!

{{realtor.name}}
Corretor CRECI {{creci.number}}
        `,
      },
      {
        type: "send_whatsapp",
        delay: 2880, // 2 dias
        message: `{{lead.firstname}}, encontrei alguns imóveis perfeitos! 🎯

🏠 SELEÇÃO ESPECIAL:
• {{property_1}} - R$ {{price_1}}
• {{property_2}} - R$ {{price_2}}  
• {{property_3}} - R$ {{price_3}}

📱 Quer as fotos e detalhes?

Responde "FOTOS" que te envio tudo! 📸`,
      },
      {
        type: "send_email",
        delay: 10080, // 7 dias
        subject: "💡 Dicas para comprar seu primeiro imóvel no Brasil",
        content: `
{{lead.firstname}}, como está sua busca?

Separei dicas importantes para quem vai comprar imóvel:

📋 DOCUMENTAÇÃO NECESSÁRIA:
• CPF e RG
• Comprovante de renda
• Extrato bancário (3 meses)
• Certidões negativas

💰 FINANCIAMENTO:
• FGTS pode cobrir até 100% da entrada
• Prazo de até 35 anos
• Juros desde 8,5% ao ano
• Prestação máxima: 30% da renda

🏠 ANTES DE DECIDIR:
• Visite o imóvel em horários diferentes
• Verifique documentação
• Analise infraestrutura do bairro
• Considere valorização futura

[AGENDAR VISITA]

Qualquer dúvida, estou aqui!

{{realtor.name}}
        `,
      },
    ],
  },
};

// Templates para datas comemorativas brasileiras
export const SEASONAL_TEMPLATES_BR = {
  DIA_DAS_MAES: {
    name: "Dia das Mães Brasil",
    description: "Campanha especial para Dia das Mães",
    type: CampaignType.SEASONAL,
    emailSubjects: [
      "💐 Dia das Mães: presentes que elas merecem",
      "👩‍❤️‍👨 Para a mulher mais especial da sua vida",
      "🎁 Última semana para o Dia das Mães!",
    ],
    whatsappMessages: [
      "💐 Dia das Mães chegando! Já escolheu o presente perfeito? Temos opções incríveis com entrega garantida! 🎁",
      "👩‍👧‍👦 {{lead.firstname}}, sua mãe merece o melhor! Veja nossas ofertas especiais para o Dia das Mães 💖",
    ],
  },

  DIA_DOS_PAIS: {
    name: "Dia dos Pais Brasil",
    description: "Campanha especial para Dia dos Pais",
    type: CampaignType.SEASONAL,
    emailSubjects: [
      "👨‍👧‍👦 Dia dos Pais: presentes para o melhor pai",
      "🎁 Oferta especial Dia dos Pais - até 40% OFF",
      "⚡ Últimos dias: Dia dos Pais com super desconto!",
    ],
  },

  DIA_DAS_CRIANCAS: {
    name: "Dia das Crianças Brasil",
    description: "Campanha especial para Dia das Crianças",
    type: CampaignType.SEASONAL,
    emailSubjects: [
      "🧸 Dia das Crianças: alegria garantida!",
      "🎮 Brinquedos incríveis para o Dia das Crianças",
      "👶 Promoção Dia das Crianças - frete grátis!",
    ],
  },

  NATAL: {
    name: "Natal Brasil",
    description: "Campanha de Natal brasileira",
    type: CampaignType.SEASONAL,
    emailSubjects: [
      "🎄 Natal 2024: presentes para toda família",
      "🎅 Papai Noel chegou com super ofertas!",
      "⭐ Última chance: ofertas de Natal terminam hoje!",
    ],
  },
};

// Helper function para gerar templates personalizados
export function generateBrazilianTemplate(
  industry: string,
  campaignType: CampaignType,
  customizations?: any,
): any {
  const baseTemplate = {
    settings: {
      timezone: "America/Sao_Paulo",
      language: "pt_BR",
      respectBusinessHours: true,
      businessHours: {
        start: "09:00",
        end: "18:00",
      },
      avoidHolidays: true,
      requireConsent: true,
      unsubscribeLink: true,
      ...customizations?.settings,
    },
  };

  const industrySpecifics = {
    ecommerce: {
      pixDiscount: true,
      freeShipping: true,
      brazilWideDelivery: true,
    },
    services: {
      freeConsultation: true,
      brazilianCaseStudies: true,
      localReferences: true,
    },
    saas: {
      freeTrial: true,
      localization: true,
      brazilianSupport: true,
    },
    real_estate: {
      fgtsFinancing: true,
      regionalFocus: true,
      legalCompliance: true,
    },
  };

  return {
    ...baseTemplate,
    industry,
    type: campaignType,
    brazilianFeatures: industrySpecifics[industry] || {},
    ...customizations,
  };
}

// Função para obter feriados brasileiros do ano
export function getBrazilianHolidays(year: number): string[] {
  return [
    `${year}-01-01`, // Ano Novo
    `${year}-04-21`, // Tiradentes
    `${year}-05-01`, // Dia do Trabalho
    `${year}-09-07`, // Independência do Brasil
    `${year}-10-12`, // Nossa Senhora Aparecida
    `${year}-11-02`, // Finados
    `${year}-11-15`, // Proclamação da República
    `${year}-12-25`, // Natal
    // Adicionar feriados móveis como Carnaval, Páscoa, etc.
  ];
}

// Validação de templates brasileiros
export function validateBrazilianTemplate(template: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!template.settings) {
    errors.push("Settings são obrigatórias");
  } else {
    if (template.settings.timezone !== "America/Sao_Paulo") {
      errors.push(
        "Timezone deve ser America/Sao_Paulo para mercado brasileiro",
      );
    }

    if (template.settings.language !== "pt_BR") {
      errors.push("Language deve ser pt_BR para mercado brasileiro");
    }

    if (!template.settings.requireConsent) {
      errors.push("LGPD: requireConsent deve ser true");
    }

    if (!template.settings.unsubscribeLink) {
      errors.push("LGPD: unsubscribeLink deve ser true");
    }
  }

  // Validar conteúdo em português
  if (template.actions) {
    template.actions.forEach((action: any, index: number) => {
      if (action.type === "send_email" && action.content) {
        if (
          !action.content.includes("{{") &&
          !/[áàâãéêíóôõúç]/i.test(action.content)
        ) {
          errors.push(
            `Ação ${index}: conteúdo pode não estar em português brasileiro`,
          );
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

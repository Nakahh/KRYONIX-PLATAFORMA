// Mock Server para testes KRYONIX usando MSW
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { mockBrazilianData } from "../setup";

// Dados mock para diferentes cenários
const mockUsers = [
  {
    ...mockBrazilianData.user,
    id: "user-123",
    name: "João Silva",
    email: "joao@kryonix.com.br",
  },
  {
    ...mockBrazilianData.user,
    id: "user-456",
    name: "Maria Santos",
    email: "maria@kryonix.com.br",
  },
];

const mockWhatsAppInstances = [
  {
    id: "instance-123",
    name: "Atendimento Principal",
    number: "+5511999999999",
    status: "connected",
    qrCode: null,
    webhook: "https://api.kryonix.com.br/webhook/whatsapp/instance-123",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "instance-456",
    name: "Suporte Técnico",
    number: "+5511888888888",
    status: "disconnected",
    qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQA...",
    webhook: "https://api.kryonix.com.br/webhook/whatsapp/instance-456",
    createdAt: "2024-01-02T00:00:00Z",
  },
];

const mockMessages = [
  {
    id: "msg-123",
    instanceId: "instance-123",
    chatId: "5511999999999@c.us",
    fromMe: false,
    from: "5511888888888@c.us",
    to: "5511999999999@c.us",
    body: "Olá! Preciso de ajuda com minha conta.",
    timestamp: Date.now() - 300000, // 5 minutos atrás
    type: "text",
    status: "received",
  },
  {
    id: "msg-456",
    instanceId: "instance-123",
    chatId: "5511999999999@c.us",
    fromMe: true,
    from: "5511999999999@c.us",
    to: "5511888888888@c.us",
    body: "Claro! Como posso te ajudar?",
    timestamp: Date.now() - 240000, // 4 minutos atrás
    type: "text",
    status: "sent",
  },
];

const mockSubscriptions = [
  {
    id: "sub-123",
    userId: "user-123",
    planId: "plan-starter",
    status: "active",
    currentPeriodStart: "2024-01-01T00:00:00Z",
    currentPeriodEnd: "2024-02-01T00:00:00Z",
    amount: 99.9,
    currency: "BRL",
    paymentMethod: "pix",
  },
];

const mockPlans = [
  {
    id: "plan-starter",
    name: "Starter",
    description: "Ideal para começar",
    price: 99.9,
    currency: "BRL",
    interval: "month",
    features: [
      "1 instância WhatsApp",
      "1.000 mensagens/mês",
      "Suporte por email",
    ],
  },
  {
    id: "plan-pro",
    name: "Profissional",
    description: "Para pequenas empresas",
    price: 299.9,
    currency: "BRL",
    interval: "month",
    features: [
      "5 instâncias WhatsApp",
      "10.000 mensagens/mês",
      "Automações básicas",
      "Suporte prioritário",
    ],
  },
];

const mockWorkflows = [
  {
    id: "workflow-123",
    name: "Boas-vindas Automáticas",
    description: "Mensagem automática para novos contatos",
    status: "active",
    triggers: ["new_contact"],
    actions: [
      {
        type: "send_message",
        params: {
          message: "Olá! Bem-vindo à KRYONIX! Como posso te ajudar?",
        },
      },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    executionCount: 150,
  },
];

const mockAnalytics = {
  dashboard: {
    whatsapp: {
      sent: 1234,
      received: 987,
      delivered: 1200,
      read: 1100,
    },
    revenue: {
      total: 15500.5,
      monthly: 2890.9,
      growth: 12.5,
    },
    users: {
      active: 45,
      total: 67,
      growth: 8.2,
    },
    workflows: {
      executed: 89,
      successful: 85,
      failed: 4,
    },
  },
  whatsapp: {
    messagesByDay: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      sent: Math.floor(Math.random() * 100) + 10,
      received: Math.floor(Math.random() * 80) + 5,
    })),
    topContacts: [
      { number: "+5511888888888", name: "João Silva", messages: 45 },
      { number: "+5511777777777", name: "Maria Santos", messages: 38 },
      { number: "+5511666666666", name: "Pedro Costa", messages: 32 },
    ],
  },
};

// Handlers para as APIs
export const handlers = [
  // === AUTENTICAÇÃO ===
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as any;
    const { email, password } = body;

    if (email === "admin@kryonix.com.br" && password === "admin123") {
      return HttpResponse.json({
        user: { ...mockBrazilianData.user, role: "admin" },
        token: "mock-jwt-token-admin",
        refreshToken: "mock-refresh-token",
        expiresIn: 3600,
      });
    }

    if (email === "joao@kryonix.com.br" && password === "senha123") {
      return HttpResponse.json({
        user: mockBrazilianData.user,
        token: "mock-jwt-token",
        refreshToken: "mock-refresh-token",
        expiresIn: 3600,
      });
    }

    return HttpResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 },
    );
  }),

  http.get("/api/auth/me", ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { error: "Token não fornecido" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      user: mockBrazilianData.user,
    });
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ message: "Logout realizado com sucesso" });
  }),

  // === DASHBOARD ===
  http.get("/api/dashboard/stats", () => {
    return HttpResponse.json(mockAnalytics.dashboard);
  }),

  // === WHATSAPP ===
  http.get("/api/v1/whatsapp/instances", () => {
    return HttpResponse.json({
      instances: mockWhatsAppInstances,
      total: mockWhatsAppInstances.length,
    });
  }),

  http.post("/api/v1/whatsapp/instances", async ({ request }) => {
    const body = (await request.json()) as any;
    const newInstance = {
      id: `instance-${Date.now()}`,
      name: body.name,
      number: body.number,
      status: "disconnected",
      qrCode: "data:image/png;base64,mock-qr-code",
      webhook: `https://api.kryonix.com.br/webhook/whatsapp/instance-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    mockWhatsAppInstances.push(newInstance);
    return HttpResponse.json(newInstance, { status: 201 });
  }),

  http.get("/api/v1/whatsapp/instances/:instanceId", ({ params }) => {
    const instance = mockWhatsAppInstances.find(
      (i) => i.id === params.instanceId,
    );

    if (!instance) {
      return HttpResponse.json(
        { error: "Instância não encontrada" },
        { status: 404 },
      );
    }

    return HttpResponse.json(instance);
  }),

  http.post(
    "/api/v1/whatsapp/instances/:instanceId/messages",
    async ({ request, params }) => {
      const body = (await request.json()) as any;
      const newMessage = {
        id: `msg-${Date.now()}`,
        instanceId: params.instanceId,
        chatId: body.to,
        fromMe: true,
        from: mockWhatsAppInstances[0].number.replace("+", "") + "@c.us",
        to: body.to,
        body: body.message,
        timestamp: Date.now(),
        type: "text",
        status: "sent",
      };

      mockMessages.push(newMessage);
      return HttpResponse.json(newMessage, { status: 201 });
    },
  ),

  http.get(
    "/api/v1/whatsapp/instances/:instanceId/messages",
    ({ params, request }) => {
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      const instanceMessages = mockMessages
        .filter((msg) => msg.instanceId === params.instanceId)
        .slice(offset, offset + limit);

      return HttpResponse.json({
        messages: instanceMessages,
        total: mockMessages.length,
        limit,
        offset,
      });
    },
  ),

  // === BILLING ===
  http.get("/api/billing/plans", () => {
    return HttpResponse.json({ plans: mockPlans });
  }),

  http.get("/api/billing/subscription", () => {
    return HttpResponse.json(mockSubscriptions[0]);
  }),

  http.post("/api/billing/subscriptions", async ({ request }) => {
    const body = (await request.json()) as any;
    const newSubscription = {
      id: `sub-${Date.now()}`,
      userId: mockBrazilianData.user.id,
      planId: body.planId,
      status: "active",
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      amount: mockPlans.find((p) => p.id === body.planId)?.price || 0,
      currency: "BRL",
      paymentMethod: body.paymentMethod || "pix",
    };

    return HttpResponse.json(newSubscription, { status: 201 });
  }),

  // === WORKFLOWS ===
  http.get("/api/v1/workflows", () => {
    return HttpResponse.json({
      workflows: mockWorkflows,
      total: mockWorkflows.length,
    });
  }),

  http.post("/api/v1/workflows", async ({ request }) => {
    const body = (await request.json()) as any;
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      name: body.name,
      description: body.description,
      status: "active",
      triggers: body.triggers || [],
      actions: body.actions || [],
      createdAt: new Date().toISOString(),
      executionCount: 0,
    };

    mockWorkflows.push(newWorkflow);
    return HttpResponse.json(newWorkflow, { status: 201 });
  }),

  // === ANALYTICS ===
  http.get("/api/analytics", () => {
    return HttpResponse.json(mockAnalytics.whatsapp);
  }),

  http.get("/api/whatsapp/analytics", () => {
    return HttpResponse.json(mockAnalytics.whatsapp);
  }),

  // === USUÁRIOS ===
  http.get("/api/users", () => {
    return HttpResponse.json({
      users: mockUsers,
      total: mockUsers.length,
    });
  }),

  // === HEALTH CHECK ===
  http.get("/api/ping", () => {
    return HttpResponse.json({ message: "KRYONIX API is running! 🚀" });
  }),

  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0-test",
      environment: "test",
      database: {
        status: "healthy",
        database: true,
        redis: true,
      },
      modules: {
        billing: "active",
        whatsapp: "active",
        n8n_workflows: "active",
        typebot_chatbots: "active",
        ai_services: "active",
        mautic_marketing: "active",
        notifications: "active",
        authentication: "active",
      },
    });
  }),

  // === CACHE ===
  http.get("/api/cache/stats", () => {
    return HttpResponse.json({
      connected: true,
      totalKeys: 42,
      stats: "mock stats",
      keyspace: "mock keyspace",
    });
  }),

  // === SECURITY ===
  http.get("/api/security/stats", () => {
    return HttpResponse.json({
      totalEvents: 150,
      eventsByRisk: { LOW: 120, MEDIUM: 25, HIGH: 4, CRITICAL: 1 },
      topActions: {
        LOGIN_SUCCESS: 80,
        API_ACCESS: 45,
        RATE_LIMIT_EXCEEDED: 10,
      },
      topIPs: { "192.168.1.100": 95, "10.0.0.1": 35, "172.16.0.1": 20 },
      blockedIPs: 2,
    });
  }),

  // === ERRO GENÉRICO ===
  http.get("/api/error", () => {
    return HttpResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }),

  // === DELAY PARA TESTES DE LOADING ===
  http.get("/api/slow", async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return HttpResponse.json({ message: "Resposta lenta" });
  }),
];

// Criar servidor mock
export const server = setupServer(...handlers);

// Utilitários para testes
export const mockApiResponse = {
  success: (data: any) => HttpResponse.json(data),
  error: (message: string, status = 400) =>
    HttpResponse.json({ error: message }, { status }),
  delay: (data: any, ms = 1000) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(HttpResponse.json(data)), ms);
    });
  },
};

// Configurações específicas para diferentes cenários
export const scenarios = {
  // Simular usuário deslogado
  unauthenticated: () => {
    server.use(
      http.get("/api/auth/me", () => {
        return HttpResponse.json({ error: "Token inválido" }, { status: 401 });
      }),
    );
  },

  // Simular erro de rede
  networkError: () => {
    server.use(
      http.get("/api/*", () => {
        return HttpResponse.error();
      }),
    );
  },

  // Simular instância WhatsApp desconectada
  whatsappDisconnected: () => {
    server.use(
      http.get("/api/v1/whatsapp/instances", () => {
        return HttpResponse.json({
          instances: mockWhatsAppInstances.map((i) => ({
            ...i,
            status: "disconnected",
          })),
          total: mockWhatsAppInstances.length,
        });
      }),
    );
  },

  // Simular subscription inativa
  subscriptionInactive: () => {
    server.use(
      http.get("/api/billing/subscription", () => {
        return HttpResponse.json({
          ...mockSubscriptions[0],
          status: "inactive",
        });
      }),
    );
  },

  // Reset para handlers padrão
  reset: () => {
    server.resetHandlers();
  },
};

export default server;

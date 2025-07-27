import { Router, Request, Response } from "express";
import webpush from "web-push";
import { authenticateToken } from "../middleware/auth";
import { redis } from "../middleware/cache";
import { logSecurityEvent } from "../middleware/security";

const router = Router();

// Configuração do Web Push
webpush.setVapidDetails(
  "mailto:contato@kryonix.com.br",
  process.env.VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || "",
);

// Tipos de notificação
export enum NotificationType {
  WHATSAPP_MESSAGE = "whatsapp_message",
  BILLING_REMINDER = "billing_reminder",
  SYSTEM_UPDATE = "system_update",
  SECURITY_ALERT = "security_alert",
  MARKETING_CAMPAIGN = "marketing_campaign",
  WORKFLOW_COMPLETED = "workflow_completed",
  API_LIMIT_WARNING = "api_limit_warning",
  INSTANCE_DISCONNECTED = "instance_disconnected",
}

// Interface para dados de notificação
export interface PushNotificationData {
  title: string;
  body: string;
  type: NotificationType;
  userId: string;
  tenantId?: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: Record<string, any>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  ttl?: number;
  urgency?: "very-low" | "low" | "normal" | "high";
}

// Interface para subscription
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Registrar subscription de push
router.post(
  "/subscribe",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { subscription, deviceInfo } = req.body;
      const userId = req.user?.id;
      const tenantId = req.headers["x-tenant-id"] as string;

      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({
          error: "Subscription inválida",
          code: "INVALID_SUBSCRIPTION",
        });
      }

      // Validar subscription
      try {
        // Teste de envio para validar subscription
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: "KRYONIX",
            body: "Notificações habilitadas com sucesso!",
            type: "system_update",
            icon: "/icons/icon-192.png",
          }),
        );
      } catch (error) {
        return res.status(400).json({
          error: "Subscription inválida ou expirada",
          code: "INVALID_SUBSCRIPTION",
        });
      }

      // Salvar subscription no Redis
      const subscriptionKey = `push_subscription:${userId}`;
      const subscriptionData = {
        subscription,
        deviceInfo: deviceInfo || {},
        tenantId,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        isActive: true,
      };

      await redis.hset(
        subscriptionKey,
        "data",
        JSON.stringify(subscriptionData),
      );
      await redis.expire(subscriptionKey, 365 * 24 * 60 * 60); // 1 ano

      // Log de segurança
      await logSecurityEvent({
        action: "PUSH_SUBSCRIPTION_REGISTERED",
        resource: "/api/push-notifications/subscribe",
        ip: req.ip,
        userAgent: req.get("User-Agent") || "",
        method: req.method,
        url: req.originalUrl,
        riskLevel: "LOW",
        userId,
        tenantId,
        metadata: { deviceInfo },
      });

      res.json({
        success: true,
        message: "Notificações habilitadas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao registrar subscription:", error);
      res.status(500).json({
        error: "Falha ao registrar notificações",
        code: "SUBSCRIPTION_ERROR",
      });
    }
  },
);

// Desregistrar subscription
router.post(
  "/unsubscribe",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const subscriptionKey = `push_subscription:${userId}`;

      await redis.del(subscriptionKey);

      res.json({
        success: true,
        message: "Notificações desabilitadas",
      });
    } catch (error) {
      console.error("Erro ao desregistrar subscription:", error);
      res.status(500).json({
        error: "Falha ao desabilitar notificações",
        code: "UNSUBSCRIPTION_ERROR",
      });
    }
  },
);

// Verificar status da subscription
router.get(
  "/status",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const subscriptionKey = `push_subscription:${userId}`;

      const subscriptionData = await redis.hget(subscriptionKey, "data");

      if (subscriptionData) {
        const data = JSON.parse(subscriptionData);
        res.json({
          isSubscribed: true,
          createdAt: data.createdAt,
          lastUsed: data.lastUsed,
          deviceInfo: data.deviceInfo,
        });
      } else {
        res.json({
          isSubscribed: false,
        });
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      res.status(500).json({
        error: "Falha ao verificar status",
        code: "STATUS_ERROR",
      });
    }
  },
);

// Enviar notificação individual
router.post("/send", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId: targetUserId, notification } = req.body;
    const senderUserId = req.user?.id;

    // Verificar permissões (apenas admins ou self)
    if (senderUserId !== targetUserId && !req.user?.isAdmin) {
      return res.status(403).json({
        error: "Sem permissão para enviar notificação",
        code: "PERMISSION_DENIED",
      });
    }

    const result = await sendPushNotification({
      ...notification,
      userId: targetUserId,
    });

    res.json({
      success: result.success,
      message: result.message,
      details: result.details,
    });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({
      error: "Falha ao enviar notificação",
      code: "SEND_ERROR",
    });
  }
});

// Enviar notificação em massa
router.post(
  "/broadcast",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // Apenas admins podem fazer broadcast
      if (!req.user?.isAdmin) {
        return res.status(403).json({
          error: "Sem permissão para broadcast",
          code: "PERMISSION_DENIED",
        });
      }

      const { notification, filters } = req.body;

      const results = await sendBroadcastNotification(notification, filters);

      res.json({
        success: true,
        totalSent: results.success,
        totalFailed: results.failed,
        details: results.details,
      });
    } catch (error) {
      console.error("Erro ao enviar broadcast:", error);
      res.status(500).json({
        error: "Falha ao enviar broadcast",
        code: "BROADCAST_ERROR",
      });
    }
  },
);

// Histórico de notificações
router.get(
  "/history",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const historyKey = `push_history:${userId}`;
      const history = await redis.lrange(
        historyKey,
        offset,
        offset + limit - 1,
      );

      const notifications = history.map((item) => JSON.parse(item));

      res.json({
        notifications,
        total: await redis.llen(historyKey),
        limit,
        offset,
      });
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      res.status(500).json({
        error: "Falha ao buscar histórico",
        code: "HISTORY_ERROR",
      });
    }
  },
);

// Função para enviar notificação
export async function sendPushNotification(data: PushNotificationData) {
  try {
    const subscriptionKey = `push_subscription:${data.userId}`;
    const subscriptionData = await redis.hget(subscriptionKey, "data");

    if (!subscriptionData) {
      return {
        success: false,
        message: "Usuário não tem subscription ativa",
        code: "NO_SUBSCRIPTION",
      };
    }

    const { subscription } = JSON.parse(subscriptionData);

    // Preparar payload da notificação
    const payload = {
      title: data.title,
      body: data.body,
      type: data.type,
      icon: data.icon || "/icons/icon-192.png",
      badge: data.badge || "/icons/badge.png",
      image: data.image,
      url: data.url,
      data: {
        ...data.data,
        userId: data.userId,
        tenantId: data.tenantId,
        timestamp: Date.now(),
      },
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
    };

    // Opções de envio
    const options = {
      TTL: data.ttl || 24 * 60 * 60, // 24 horas por padrão
      urgency: data.urgency || "normal",
      vapidDetails: {
        subject: "mailto:contato@kryonix.com.br",
        publicKey: process.env.VAPID_PUBLIC_KEY || "",
        privateKey: process.env.VAPID_PRIVATE_KEY || "",
      },
    };

    // Enviar notificação
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
      options,
    );

    // Salvar no histórico
    const historyKey = `push_history:${data.userId}`;
    const historyEntry = {
      ...payload,
      sentAt: new Date().toISOString(),
      success: true,
    };

    await redis.lpush(historyKey, JSON.stringify(historyEntry));
    await redis.ltrim(historyKey, 0, 99); // Manter apenas os últimos 100

    // Atualizar lastUsed
    const subscriptionObj = JSON.parse(subscriptionData);
    subscriptionObj.lastUsed = new Date().toISOString();
    await redis.hset(subscriptionKey, "data", JSON.stringify(subscriptionObj));

    return {
      success: true,
      message: "Notificação enviada com sucesso",
      details: { type: data.type, userId: data.userId },
    };
  } catch (error) {
    console.error("Erro ao enviar push notification:", error);

    // Verificar se é erro de subscription inválida
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Remover subscription inválida
      const subscriptionKey = `push_subscription:${data.userId}`;
      await redis.del(subscriptionKey);
    }

    return {
      success: false,
      message: "Falha ao enviar notificação",
      error: error.message,
      code: "PUSH_ERROR",
    };
  }
}

// Função para broadcast
export async function sendBroadcastNotification(
  notification: Omit<PushNotificationData, "userId">,
  filters: {
    tenantId?: string;
    userType?: string;
    activeOnly?: boolean;
    limit?: number;
  } = {},
) {
  try {
    // Buscar todas as subscriptions
    const pattern = "push_subscription:*";
    const keys = await redis.keys(pattern);

    let success = 0;
    let failed = 0;
    const details: any[] = [];

    // Aplicar filtros e enviar
    for (const key of keys) {
      try {
        const userId = key.replace("push_subscription:", "");
        const subscriptionData = await redis.hget(key, "data");

        if (!subscriptionData) continue;

        const data = JSON.parse(subscriptionData);

        // Aplicar filtros
        if (filters.tenantId && data.tenantId !== filters.tenantId) continue;
        if (filters.activeOnly && !data.isActive) continue;

        // Enviar notificação
        const result = await sendPushNotification({
          ...notification,
          userId,
        });

        if (result.success) {
          success++;
        } else {
          failed++;
          details.push({ userId, error: result.message });
        }
      } catch (error) {
        failed++;
        details.push({ userId: key, error: error.message });
      }

      // Limite de envios
      if (filters.limit && success + failed >= filters.limit) break;
    }

    return { success, failed, details };
  } catch (error) {
    console.error("Erro no broadcast:", error);
    throw error;
  }
}

// Notificações automáticas para eventos do sistema
export const NotificationTemplates = {
  whatsappMessage: (fromName: string, message: string) => ({
    title: `💬 Nova mensagem de ${fromName}`,
    body: message.length > 50 ? message.substring(0, 50) + "..." : message,
    type: NotificationType.WHATSAPP_MESSAGE,
    icon: "/icons/whatsapp.png",
    url: "/whatsapp/chat",
    actions: [
      { action: "reply", title: "Responder", icon: "/icons/reply.png" },
      { action: "open", title: "Abrir Chat", icon: "/icons/open.png" },
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
  }),

  billingReminder: (amount: number, dueDate: string) => ({
    title: "💳 Lembrete de Pagamento",
    body: `Fatura de R$ ${amount.toFixed(2)} vence em ${dueDate}`,
    type: NotificationType.BILLING_REMINDER,
    icon: "/icons/billing.png",
    url: "/billing",
    actions: [
      { action: "pay", title: "Pagar Agora", icon: "/icons/pay.png" },
      { action: "view", title: "Ver Fatura", icon: "/icons/view.png" },
    ],
    requireInteraction: true,
  }),

  securityAlert: (message: string) => ({
    title: "🚨 Alerta de Segurança",
    body: message,
    type: NotificationType.SECURITY_ALERT,
    icon: "/icons/security.png",
    url: "/security",
    requireInteraction: true,
    urgency: "high" as const,
    vibrate: [500, 200, 500, 200, 500],
  }),

  workflowCompleted: (workflowName: string, result: string) => ({
    title: "✅ Automação Concluída",
    body: `${workflowName}: ${result}`,
    type: NotificationType.WORKFLOW_COMPLETED,
    icon: "/icons/workflow.png",
    url: "/workflows",
    actions: [
      { action: "view", title: "Ver Detalhes", icon: "/icons/view.png" },
    ],
  }),

  instanceDisconnected: (instanceName: string) => ({
    title: "⚠️ Instância Desconectada",
    body: `WhatsApp ${instanceName} foi desconectado`,
    type: NotificationType.INSTANCE_DISCONNECTED,
    icon: "/icons/warning.png",
    url: "/whatsapp/instances",
    actions: [
      {
        action: "reconnect",
        title: "Reconectar",
        icon: "/icons/reconnect.png",
      },
      { action: "view", title: "Ver Status", icon: "/icons/view.png" },
    ],
    requireInteraction: true,
  }),
};

export default router;

# 🔔 PARTE 16 - SISTEMA DE NOTIFICAÇÕES
*Agentes Responsáveis: Email Expert + Frontend Expert + Backend Expert*

## 🎯 **OBJETIVO**
Implementar sistema completo de notificações multicanal (email, push, in-app, WhatsApp) integrado com Ntfy, SendGrid e Evolution API.

## 🏗️ **ARQUITETURA DE NOTIFICAÇÕES**
```yaml
Notification System:
  Channels:
    - Email: SendGrid + Mautic
    - Push: Ntfy (ntfy.kryonix.com.br)
    - In-App: WebSocket + React
    - WhatsApp: Evolution API
    - SMS: Twilio (opcional)
  
  Queue: RabbitMQ
  Storage: PostgreSQL + Redis
  Templates: Strapi CMS
  Analytics: Metabase tracking
```

## 📊 **MODELO DE DADOS**
```sql
-- Schema de notificações
CREATE SCHEMA IF NOT EXISTS notifications;

-- Tipos de notificação
CREATE TYPE notifications.channel_type AS ENUM ('email', 'push', 'in_app', 'whatsapp', 'sms');
CREATE TYPE notifications.priority_level AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE notifications.status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'read');

-- Templates de notificação
CREATE TABLE notifications.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    subject VARCHAR(255), -- para email
    body_text TEXT,
    body_html TEXT,
    variables JSONB, -- variáveis disponíveis
    channel notifications.channel_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Preferências de notificação por usuário
CREATE TABLE notifications.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel notifications.channel_type NOT NULL,
    category VARCHAR(100), -- 'security', 'marketing', 'system', etc
    is_enabled BOOLEAN DEFAULT true,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, channel, category)
);

-- Fila de notificações
CREATE TABLE notifications.queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES notifications.templates(id),
    recipient_id UUID REFERENCES auth.users(id),
    channel notifications.channel_type NOT NULL,
    priority notifications.priority_level DEFAULT 'normal',
    status notifications.status DEFAULT 'pending',
    scheduled_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Dados específicos
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    recipient_push_token TEXT,
    
    -- Conteúdo renderizado
    subject VARCHAR(255),
    title VARCHAR(255),
    body_text TEXT,
    body_html TEXT,
    
    -- Metadados
    variables JSONB,
    metadata JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_queue_status_priority ON notifications.queue(status, priority, scheduled_at);
CREATE INDEX idx_queue_recipient ON notifications.queue(recipient_id, channel);
CREATE INDEX idx_queue_scheduled ON notifications.queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_preferences_user ON notifications.user_preferences(user_id);
```

## 🔧 **SERVIÇO DE NOTIFICAÇÕES**
```typescript
// services/notification.service.ts
export class NotificationService {
  
  async send(notification: NotificationRequest): Promise<void> {
    // 1. Verificar preferências do usuário
    const preferences = await this.getUserPreferences(
      notification.recipientId, 
      notification.channel,
      notification.category
    );

    if (!preferences.is_enabled) {
      console.log(`Notification disabled for user ${notification.recipientId} on channel ${notification.channel}`);
      return;
    }

    // 2. Verificar quiet hours
    if (this.isInQuietHours(preferences)) {
      // Reagendar para após quiet hours
      notification.scheduledAt = this.calculateNextAvailableTime(preferences);
    }

    // 3. Renderizar template
    const renderedContent = await this.renderTemplate(
      notification.templateId,
      notification.variables
    );

    // 4. Criar item na fila
    const queueItem = await this.createQueueItem({
      ...notification,
      ...renderedContent
    });

    // 5. Enviar para RabbitMQ
    await this.queueService.publish('notifications', {
      action: 'send',
      queueItemId: queueItem.id,
      channel: notification.channel,
      priority: notification.priority
    });
  }

  async sendBulk(notifications: NotificationRequest[]): Promise<void> {
    const chunks = this.chunkArray(notifications, 100);
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(notification => this.send(notification)));
      // Pequena pausa para evitar spam
      await this.sleep(100);
    }
  }

  async processQueue(channel: NotificationChannel): Promise<void> {
    const pendingNotifications = await this.db.query(`
      SELECT * FROM notifications.queue 
      WHERE channel = $1 
        AND status = 'pending' 
        AND scheduled_at <= NOW()
      ORDER BY priority DESC, created_at ASC
      LIMIT 50
    `, [channel]);

    for (const notification of pendingNotifications.rows) {
      try {
        await this.updateStatus(notification.id, 'sending');
        
        const result = await this.sendToChannel(channel, notification);
        
        if (result.success) {
          await this.updateStatus(notification.id, 'sent', {
            sent_at: new Date(),
            external_id: result.id
          });
        } else {
          await this.handleError(notification, result.error);
        }
      } catch (error) {
        await this.handleError(notification, error);
      }
    }
  }

  private async sendToChannel(channel: NotificationChannel, notification: any) {
    switch (channel) {
      case 'email':
        return await this.sendEmail(notification);
      case 'push':
        return await this.sendPush(notification);
      case 'whatsapp':
        return await this.sendWhatsApp(notification);
      case 'in_app':
        return await this.sendInApp(notification);
      default:
        throw new Error(`Canal não suportado: ${channel}`);
    }
  }

  private async sendEmail(notification: any) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: notification.recipient_email,
      from: {
        email: 'noreply@kryonix.com.br',
        name: 'KRYONIX'
      },
      subject: notification.subject,
      text: notification.body_text,
      html: notification.body_html,
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking: { enable: true }
      }
    };

    try {
      const result = await sgMail.send(msg);
      return { success: true, id: result[0].headers['x-message-id'] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async sendPush(notification: any) {
    const ntfyUrl = 'https://ntfy.kryonix.com.br';
    const topic = `user_${notification.recipient_id}`;

    try {
      const response = await fetch(`${ntfyUrl}/${topic}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from('kryonix:Vitor@123456').toString('base64')}`,
          'Title': notification.title,
          'Priority': this.mapPriorityToNtfy(notification.priority),
          'Tags': 'star'
        },
        body: notification.body_text
      });

      if (response.ok) {
        return { success: true, id: response.headers.get('message-id') };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async sendWhatsApp(notification: any) {
    const evolutionApiUrl = 'https://api.kryonix.com.br';
    const apiKey = process.env.EVOLUTION_API_KEY;

    try {
      const response = await fetch(`${evolutionApiUrl}/message/sendText/kryonix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          number: notification.recipient_phone,
          text: `*${notification.title}*\n\n${notification.body_text}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, id: result.messageId };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async sendInApp(notification: any) {
    // Salvar notificação in-app no banco
    await this.db.query(`
      INSERT INTO notifications.in_app_notifications 
        (user_id, title, message, type, data, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      notification.recipient_id,
      notification.title,
      notification.body_text,
      notification.metadata?.type || 'info',
      notification.metadata?.data || {},
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    ]);

    // Enviar via WebSocket
    this.socketService.sendToUser(notification.recipient_id, {
      type: 'notification',
      data: {
        title: notification.title,
        message: notification.body_text,
        type: notification.metadata?.type || 'info',
        timestamp: new Date()
      }
    });

    return { success: true, id: `inapp_${Date.now()}` };
  }

  async renderTemplate(templateId: string, variables: Record<string, any>) {
    const template = await this.db.query(`
      SELECT * FROM notifications.templates WHERE id = $1
    `, [templateId]);

    if (template.rows.length === 0) {
      throw new Error(`Template ${templateId} não encontrado`);
    }

    const tmpl = template.rows[0];
    
    // Usar template engine (Handlebars)
    const Handlebars = require('handlebars');
    
    return {
      subject: tmpl.subject ? Handlebars.compile(tmpl.subject)(variables) : null,
      title: tmpl.title ? Handlebars.compile(tmpl.title)(variables) : null,
      body_text: Handlebars.compile(tmpl.body_text)(variables),
      body_html: tmpl.body_html ? Handlebars.compile(tmpl.body_html)(variables) : null
    };
  }

  async createSubscription(userId: string, channel: NotificationChannel, config: any) {
    await this.db.query(`
      INSERT INTO notifications.user_preferences 
        (user_id, channel, category, is_enabled, quiet_hours_start, quiet_hours_end, timezone)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id, channel, category)
      DO UPDATE SET 
        is_enabled = EXCLUDED.is_enabled,
        quiet_hours_start = EXCLUDED.quiet_hours_start,
        quiet_hours_end = EXCLUDED.quiet_hours_end,
        timezone = EXCLUDED.timezone,
        updated_at = NOW()
    `, [
      userId,
      channel,
      config.category || 'general',
      config.enabled !== false,
      config.quietHoursStart || null,
      config.quietHoursEnd || null,
      config.timezone || 'America/Sao_Paulo'
    ]);
  }
}
```

## 🎨 **COMPONENTES FRONTEND**
```tsx
// components/notifications/NotificationCenter.tsx
export const NotificationCenter = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma notificação
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
              />
            ))
          )}
        </ScrollArea>
        
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full">
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// components/notifications/NotificationItem.tsx
interface NotificationItemProps {
  notification: InAppNotification;
  onRead: () => void;
}

export const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
  const isUnread = !notification.read_at;
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <InfoIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div 
      className={cn(
        'p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors',
        isUnread && 'bg-blue-50'
      )}
      onClick={onRead}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium text-gray-900',
            isUnread && 'font-semibold'
          )}>
            {notification.title}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { 
              addSuffix: true,
              locale: ptBR 
            })}
          </p>
        </div>
        {isUnread && (
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
    </div>
  );
};

// components/notifications/NotificationPreferences.tsx
export const NotificationPreferences = () => {
  const { preferences, updatePreference } = useNotificationPreferences();
  
  const channels = [
    { id: 'email', name: 'Email', icon: <MailIcon /> },
    { id: 'push', name: 'Push', icon: <SmartphoneIcon /> },
    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageCircleIcon /> },
    { id: 'in_app', name: 'In-App', icon: <BellIcon /> }
  ];

  const categories = [
    { id: 'security', name: 'Segurança', description: 'Login, alterações de senha, etc.' },
    { id: 'system', name: 'Sistema', description: 'Manutenções, atualizações' },
    { id: 'marketing', name: 'Marketing', description: 'Newsletters, promoções' },
    { id: 'project', name: 'Projetos', description: 'Atualizações de projetos' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Preferências de Notificação</h3>
        <p className="text-sm text-gray-500">
          Configure como e quando você quer receber notificações
        </p>
      </div>

      <div className="space-y-4">
        {categories.map(category => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="text-base">{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {channels.map(channel => {
                  const pref = preferences.find(p => 
                    p.category === category.id && p.channel === channel.id
                  );
                  
                  return (
                    <div key={channel.id} className="flex items-center space-x-2">
                      {channel.icon}
                      <div className="flex-1">
                        <Label htmlFor={`${category.id}-${channel.id}`}>
                          {channel.name}
                        </Label>
                      </div>
                      <Switch
                        id={`${category.id}-${channel.id}`}
                        checked={pref?.is_enabled || false}
                        onCheckedChange={(enabled) => 
                          updatePreference(category.id, channel.id, { enabled })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Horário de Silêncio</CardTitle>
          <CardDescription>
            Não receber notificações durante este período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiet-start">Início</Label>
              <Input
                id="quiet-start"
                type="time"
                defaultValue="22:00"
              />
            </div>
            <div>
              <Label htmlFor="quiet-end">Fim</Label>
              <Input
                id="quiet-end"
                type="time"
                defaultValue="07:00"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🔧 **WORKERS DE PROCESSAMENTO**
```typescript
// workers/notification.worker.ts
import { Worker } from 'bullmq';

export class NotificationWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker('notifications', async (job) => {
      const { action, queueItemId, channel } = job.data;
      
      switch (action) {
        case 'send':
          await this.processNotification(queueItemId, channel);
          break;
        case 'retry':
          await this.retryNotification(queueItemId);
          break;
        case 'cleanup':
          await this.cleanupOldNotifications();
          break;
      }
    }, {
      connection: {
        host: 'redis.kryonix.com.br',
        port: 6379
      },
      concurrency: 10
    });
  }

  async processNotification(queueItemId: string, channel: string) {
    const notificationService = new NotificationService();
    await notificationService.processQueue(channel as NotificationChannel);
  }

  async retryNotification(queueItemId: string) {
    // Lógica de retry com backoff exponencial
  }

  async cleanupOldNotifications() {
    // Limpar notificações antigas (> 90 dias)
    await this.db.query(`
      DELETE FROM notifications.queue 
      WHERE created_at < NOW() - INTERVAL '90 days'
        AND status IN ('sent', 'delivered', 'failed')
    `);
  }
}

// Inicializar worker
const worker = new NotificationWorker();
```

## 🔧 **COMANDOS DE EXECUÇÃO**
```bash
# 1. Criar schema de notificações
psql -h postgresql.kryonix.com.br -U postgres -d kryonix_saas -f notifications-schema.sql

# 2. Configurar Ntfy
curl -d "Testing KRYONIX notifications" \
  -u kryonix:Vitor@123456 \
  https://ntfy.kryonix.com.br/test

# 3. Testar SendGrid
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d @test-email.json

# 4. Verificar Evolution API
curl -X GET https://api.kryonix.com.br/instance/status/kryonix \
  -H "apikey: $EVOLUTION_API_KEY"
```

## ✅ **CHECKLIST DE VALIDAÇÃO**
- [ ] Schema de notificações criado
- [ ] Templates básicos inseridos
- [ ] Integração SendGrid funcionando
- [ ] Ntfy push notifications ativas
- [ ] Evolution API WhatsApp operacional
- [ ] Worker de processamento rodando
- [ ] Interface de preferências criada
- [ ] Notificações in-app funcionando
- [ ] Sistema de retry configurado
- [ ] Analytics de deliverability

## 🧪 **TESTES (QA Expert)**
```bash
# Teste de envio por canal
npm run test:notifications:email
npm run test:notifications:push
npm run test:notifications:whatsapp
npm run test:notifications:inapp

# Teste de templates
npm run test:notifications:templates

# Teste de preferências
npm run test:notifications:preferences

# Teste de retry
npm run test:notifications:retry
```

---
*Parte 16 de 50 - Projeto KRYONIX SaaS Platform*
*Próxima Parte: 17 - Email Marketing e Automação*

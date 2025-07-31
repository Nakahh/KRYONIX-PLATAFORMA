# 🔔 PARTE 16 - SISTEMA DE NOTIFICAÇÕES MULTI-TENANT KRYONIX
*Agente Especializado: Notification Systems Expert + DevOps + Mobile Expert*

## 🎯 **OBJETIVO MULTI-TENANT**
Implementar sistema de notificações completo multi-tenant com isolamento total por cliente, mobile-first design para 80% usuários mobile, WhatsApp Business API, push notifications PWA e integração completa com @kryonix/sdk.

## 🏗️ **ARQUITETURA MULTI-TENANT NOTIFICATIONS**
```yaml
MULTI_TENANT_NOTIFICATIONS:
  ISOLATION_LEVEL: "Complete - Dados, Templates, Configurações, Analytics"
  TENANT_SEPARATION:
    - notification_queues: "Redis namespaces por tenant"
    - templates: "Customizáveis e isolados por cliente"
    - analytics: "Métricas separadas por tenant"
    - preferences: "Configurações independentes"
    - rate_limits: "Limites específicos por cliente"
    
  MOBILE_FIRST_DESIGN:
    - target_users: "80% mobile users"
    - push_notifications: "PWA + Native apps"
    - whatsapp_integration: "Business API por tenant"
    - responsive_templates: "Mobile-optimized"
    - offline_support: "Service Worker + IndexedDB"
    
  CHANNELS_ISOLATION:
    - whatsapp: "Instâncias isoladas por tenant"
    - email: "Templates e SMTP por cliente"
    - sms: "Configurações separadas"
    - push: "FCM tokens namespacedos"
    - in_app: "WebSocket channels isolados"
    
  SDK_INTEGRATION:
    - package: "@kryonix/sdk"
    - auto_tenant_context: "Propagação automática"
    - typed_methods: "TypeScript completo"
    - offline_queue: "Notificações offline"
```

## 📊 **SCHEMAS MULTI-TENANT COM RLS**
```sql
-- Schema notifications com isolamento completo por tenant
CREATE SCHEMA IF NOT EXISTS notifications;

-- Tabela de usuários com RLS
CREATE TABLE notifications.notification_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    email VARCHAR(255),
    phone VARCHAR(20),
    whatsapp_number VARCHAR(20),
    device_tokens JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT notification_users_tenant_isolation CHECK (tenant_id IS NOT NULL)
);

-- Row Level Security
ALTER TABLE notifications.notification_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_users_tenant_isolation ON notifications.notification_users
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Tabela de templates por tenant
CREATE TABLE notifications.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- sms, push, whatsapp, email, in_app
    channel VARCHAR(50) NOT NULL,
    template_data JSONB NOT NULL,
    mobile_optimized BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT notification_templates_tenant_isolation CHECK (tenant_id IS NOT NULL)
);

ALTER TABLE notifications.notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_templates_tenant_isolation ON notifications.notification_templates
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Tabela de campanhas isoladas por tenant
CREATE TABLE notifications.notification_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, paused, completed
    target_audience JSONB NOT NULL,
    schedule_config JSONB,
    template_id UUID REFERENCES notifications.notification_templates(id),
    metrics JSONB DEFAULT '{}',
    mobile_priority BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT notification_campaigns_tenant_isolation CHECK (tenant_id IS NOT NULL)
);

ALTER TABLE notifications.notification_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_campaigns_tenant_isolation ON notifications.notification_campaigns
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Tabela de envios com tracking completo
CREATE TABLE notifications.notification_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    campaign_id UUID REFERENCES notifications.notification_campaigns(id),
    user_id UUID NOT NULL REFERENCES users(id),
    channel VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, failed
    message_data JSONB NOT NULL,
    mobile_device BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_details TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT notification_sends_tenant_isolation CHECK (tenant_id IS NOT NULL)
);

ALTER TABLE notifications.notification_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_sends_tenant_isolation ON notifications.notification_sends
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Tabela de analytics isolada por tenant
CREATE TABLE notifications.notification_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    date DATE NOT NULL,
    channel VARCHAR(50) NOT NULL,
    device_type VARCHAR(20), -- mobile, desktop, tablet
    metrics JSONB NOT NULL, -- sent, delivered, opened, clicked, unsubscribed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT notification_analytics_tenant_isolation CHECK (tenant_id IS NOT NULL)
);

ALTER TABLE notifications.notification_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_analytics_tenant_isolation ON notifications.notification_analytics
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Índices otimizados para performance
CREATE INDEX idx_notification_users_tenant_id ON notifications.notification_users(tenant_id);
CREATE INDEX idx_notification_users_tenant_active ON notifications.notification_users(tenant_id, is_active);
CREATE INDEX idx_notification_templates_tenant_type ON notifications.notification_templates(tenant_id, type, is_active);
CREATE INDEX idx_notification_campaigns_tenant_status ON notifications.notification_campaigns(tenant_id, status);
CREATE INDEX idx_notification_sends_tenant_status ON notifications.notification_sends(tenant_id, status);
CREATE INDEX idx_notification_sends_tenant_channel ON notifications.notification_sends(tenant_id, channel, created_at);
CREATE INDEX idx_notification_analytics_tenant_date ON notifications.notification_analytics(tenant_id, date);
```

## 🔧 **SERVIÇO MULTI-TENANT PRINCIPAL**
```typescript
// services/MultiTenantNotificationService.ts
import { KryonixSDK } from '@kryonix/sdk';

export class MultiTenantNotificationService {
    private sdk: KryonixSDK;
    private whatsappService: WhatsAppMultiTenantService;
    private pushService: PushNotificationService;
    private emailService: EmailService;
    private smsService: SMSService;
    private analyticsService: NotificationAnalyticsService;
    
    constructor(tenantId: string) {
        this.sdk = new KryonixSDK({
            module: 'notifications',
            tenantId,
            multiTenant: true,
            mobileOptimized: true
        });
        this.initializeServices();
    }
    
    async sendMultiChannelNotification(request: NotificationRequest): Promise<NotificationResult> {
        // 1. Validar contexto do tenant
        await this.sdk.tenant.validateAccess(request.userId);
        
        // 2. Buscar preferências do usuário isoladas por tenant
        const userPreferences = await this.sdk.query({
            table: 'notification_users',
            where: { user_id: request.userId },
            cache: {
                key: `user_prefs:${request.userId}`,
                ttl: 300
            }
        });
        
        // 3. Determinar canal otimizado (mobile-first priority)
        const optimalChannel = await this.determineOptimalChannel(
            request.userId,
            request.urgency,
            userPreferences,
            request.mobileContext
        );
        
        // 4. Rate limiting isolado por tenant
        const rateLimitCheck = await this.checkTenantRateLimit(request);
        if (!rateLimitCheck.allowed) {
            throw new Error(`Tenant rate limit exceeded: ${rateLimitCheck.remaining}/${rateLimitCheck.limit}`);
        }
        
        // 5. Renderizar template isolado do tenant
        const renderedContent = await this.renderTenantTemplate(
            request.templateId,
            request.data,
            optimalChannel
        );
        
        // 6. Enviar via canal otimizado
        let result: NotificationResult;
        
        switch (optimalChannel) {
            case 'whatsapp':
                result = await this.sendWhatsAppNotification(request, renderedContent);
                break;
            case 'push':
                result = await this.sendPushNotification(request, renderedContent);
                break;
            case 'sms':
                result = await this.sendSMSNotification(request, renderedContent);
                break;
            case 'email':
                result = await this.sendEmailNotification(request, renderedContent);
                break;
            case 'in_app':
                result = await this.sendInAppNotification(request, renderedContent);
                break;
            default:
                result = await this.sendFallbackNotification(request, renderedContent);
        }
        
        // 7. Salvar no database isolado com RLS
        await this.sdk.create({
            table: 'notification_sends',
            data: {
                campaign_id: request.campaignId,
                user_id: request.userId,
                channel: optimalChannel,
                provider: result.provider,
                status: result.status,
                message_data: renderedContent,
                mobile_device: request.mobileContext?.isMobile || false,
                sent_at: result.sentAt
            }
        });
        
        // 8. Analytics em tempo real isoladas por tenant
        await this.analyticsService.trackNotification(this.sdk.getTenantId(), {
            channel: optimalChannel,
            deviceType: request.mobileContext?.deviceType || 'unknown',
            status: result.status,
            timestamp: new Date()
        });
        
        // 9. WebSocket notification para tenant específico
        await this.sdk.realtime.broadcast({
            channel: `tenant:${this.sdk.getTenantId()}:notifications`,
            event: 'notification_sent',
            data: {
                id: result.id,
                channel: optimalChannel,
                status: result.status,
                userId: request.userId
            }
        });
        
        return result;
    }
    
    private async determineOptimalChannel(
        userId: string,
        urgency: string,
        userPreferences: any,
        mobileContext?: MobileContext
    ): Promise<string> {
        // Mobile-first priority (80% são mobile)
        if (mobileContext?.isMobile) {
            // Para mobile, priorizar push e WhatsApp
            if (urgency === 'high' && userPreferences.whatsapp_number) {
                return 'whatsapp';
            }
            if (userPreferences.device_tokens?.length > 0) {
                return 'push';
            }
        }
        
        // Fallback baseado em preferências
        const preferredChannel = userPreferences.preferences?.preferred_channel;
        if (preferredChannel && this.isChannelAvailable(preferredChannel, userPreferences)) {
            return preferredChannel;
        }
        
        // Fallback inteligente
        if (userPreferences.whatsapp_number) return 'whatsapp';
        if (userPreferences.device_tokens?.length > 0) return 'push';
        if (userPreferences.email) return 'email';
        if (userPreferences.phone) return 'sms';
        
        return 'in_app'; // Último recurso
    }
    
    private async sendWhatsAppNotification(
        request: NotificationRequest,
        content: RenderedContent
    ): Promise<NotificationResult> {
        // Usar instância WhatsApp isolada do tenant
        const result = await this.whatsappService.sendMessage(this.sdk.getTenantId(), {
            to: request.recipient,
            message: content.text,
            type: content.type || 'text',
            media: content.media
        });
        
        return {
            id: result.id,
            provider: 'evolution-api',
            status: result.status,
            sentAt: new Date(),
            channel: 'whatsapp',
            deliveryId: result.messageId
        };
    }
    
    private async sendPushNotification(
        request: NotificationRequest,
        content: RenderedContent
    ): Promise<NotificationResult> {
        const deviceTokens = await this.getUserDeviceTokens(request.userId);
        
        const pushData = {
            notification: {
                title: content.title,
                body: content.body,
                icon: content.icon || '/icon-192x192.png',
                badge: '/badge-72x72.png',
                image: content.image,
                click_action: content.actionUrl
            },
            data: {
                notification_id: request.id,
                tenant_id: this.sdk.getTenantId(),
                user_id: request.userId,
                action: content.action
            },
            tokens: deviceTokens
        };
        
        const result = await this.pushService.sendToTokens(pushData);
        
        return {
            id: result.messageId,
            provider: 'fcm',
            status: result.successCount > 0 ? 'sent' : 'failed',
            sentAt: new Date(),
            channel: 'push',
            deliveryId: result.messageId
        };
    }
    
    async createTenantTemplate(templateData: TemplateData): Promise<Template> {
        // Validar dados do template
        await this.validateTemplateData(templateData);
        
        // Criar template isolado para o tenant
        const template = await this.sdk.create({
            table: 'notification_templates',
            data: {
                name: templateData.name,
                type: templateData.type,
                channel: templateData.channel,
                template_data: templateData.data,
                mobile_optimized: templateData.mobileOptimized || true,
                created_by: this.sdk.getCurrentUserId()
            }
        });
        
        // Cache no Redis isolado
        await this.sdk.cache.set({
            key: `templates:${templateData.type}:${template.id}`,
            value: template,
            ttl: 3600
        });
        
        return template;
    }
    
    async getTenantAnalytics(dateRange: DateRange): Promise<NotificationAnalytics> {
        // Analytics isoladas por tenant com RLS automático
        const analytics = await this.sdk.query({
            table: 'notification_analytics',
            select: `
                channel,
                device_type,
                date,
                SUM((metrics->>'sent')::int) as total_sent,
                SUM((metrics->>'delivered')::int) as total_delivered,
                SUM((metrics->>'opened')::int) as total_opened,
                SUM((metrics->>'clicked')::int) as total_clicked
            `,
            where: {
                date: {
                    gte: dateRange.start,
                    lte: dateRange.end
                }
            },
            groupBy: ['channel', 'device_type', 'date'],
            orderBy: [{ date: 'desc' }]
        });
        
        // Agregar dados por canal e dispositivo
        const aggregated = this.aggregateAnalytics(analytics);
        
        return {
            overview: aggregated.overview,
            byChannel: aggregated.byChannel,
            byDevice: aggregated.byDevice,
            trends: aggregated.trends,
            tenantId: this.sdk.getTenantId(),
            period: dateRange
        };
    }
}
```

## 📱 **INTERFACE REACT MOBILE-FIRST**
```tsx
// components/mobile/NotificationManagerMobile.tsx
import React, { useState, useEffect } from 'react';
import { KryonixSDK } from '@kryonix/sdk';

export const NotificationManagerMobile: React.FC = () => {
    const [notifications, setNotifications] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const sdk = new KryonixSDK({ module: 'notifications' });
    
    useEffect(() => {
        loadDashboardData();
        setupRealtimeSubscription();
    }, []);
    
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [notificationsData, campaignsData, analyticsData] = await Promise.all([
                sdk.notifications.getRecent({ limit: 10, mobileOptimized: true }),
                sdk.notifications.getCampaigns({ status: 'active' }),
                sdk.notifications.getAnalytics({ 
                    period: 'last_7_days',
                    groupBy: 'channel'
                })
            ]);
            
            setNotifications(notificationsData);
            setCampaigns(campaignsData);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const setupRealtimeSubscription = () => {
        sdk.realtime.subscribe('notifications:updates', (data) => {
            // Atualizar lista em tempo real
            setNotifications(prev => [data.notification, ...prev.slice(0, 9)]);
            
            // Atualizar analytics se necessário
            if (data.type === 'analytics_update') {
                setAnalytics(prev => ({
                    ...prev,
                    ...data.analytics
                }));
            }
        });
    };
    
    if (loading) {
        return (
            <div className="mobile-loading">
                <div className="spinner"></div>
                <p>Carregando notificações...</p>
            </div>
        );
    }
    
    return (
        <div className="mobile-notification-manager">
            {/* Header Mobile */}
            <header className="mobile-header">
                <div className="header-content">
                    <h1>🔔 Notificações</h1>
                    <button className="mobile-menu-btn">☰</button>
                </div>
                <div className="tenant-info">
                    <span className="tenant-badge">
                        {sdk.getTenantName()}
                    </span>
                </div>
            </header>
            
            {/* Dashboard Mobile de Métricas */}
            <section className="mobile-metrics">
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-value">
                            {analytics?.overview?.deliveryRate || '0'}%
                        </div>
                        <div className="metric-label">Taxa de Entrega</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            {analytics?.overview?.openRate || '0'}%
                        </div>
                        <div className="metric-label">Taxa de Abertura</div>
                    </div>
                    <div className="metric-card">
                        <div className="metric-value">
                            {analytics?.overview?.clickRate || '0'}%
                        </div>
                        <div className="metric-label">Taxa de Conversão</div>
                    </div>
                </div>
            </section>
            
            {/* Canais de Notificação */}
            <section className="mobile-channels">
                <h2>Canais de Comunicação</h2>
                <div className="channels-grid">
                    <ChannelCard 
                        icon="📱"
                        title="WhatsApp"
                        status={getChannelStatus('whatsapp')}
                        metrics={analytics?.byChannel?.whatsapp}
                    />
                    <ChannelCard 
                        icon="🔔"
                        title="Push"
                        status={getChannelStatus('push')}
                        metrics={analytics?.byChannel?.push}
                    />
                    <ChannelCard 
                        icon="📧"
                        title="Email"
                        status={getChannelStatus('email')}
                        metrics={analytics?.byChannel?.email}
                    />
                    <ChannelCard 
                        icon="💬"
                        title="SMS"
                        status={getChannelStatus('sms')}
                        metrics={analytics?.byChannel?.sms}
                    />
                </div>
            </section>
            
            {/* Quick Actions Mobile */}
            <section className="mobile-actions">
                <div className="actions-grid">
                    <button 
                        className="action-btn primary"
                        onClick={() => createNewCampaign()}
                    >
                        ✉️ Nova Campanha
                    </button>
                    <button 
                        className="action-btn secondary"
                        onClick={() => viewReports()}
                    >
                        📊 Relatórios
                    </button>
                    <button 
                        className="action-btn secondary"
                        onClick={() => openSettings()}
                    >
                        ⚙️ Configurações
                    </button>
                </div>
            </section>
            
            {/* Recent Activity */}
            <section className="mobile-activity">
                <h2>Atividade Recente</h2>
                <div className="activity-list">
                    {notifications.slice(0, 5).map((notification) => (
                        <div key={notification.id} className="activity-item">
                            <div className="activity-icon">
                                {getChannelIcon(notification.channel)}
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">
                                    {notification.title}
                                </div>
                                <div className="activity-meta">
                                    {notification.recipient} • {formatTime(notification.sentAt)}
                                </div>
                            </div>
                            <div className="activity-status">
                                {getStatusIcon(notification.status)}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

// Componente para cartão de canal
const ChannelCard: React.FC<ChannelCardProps> = ({ icon, title, status, metrics }) => (
    <div className="channel-card">
        <div className="channel-header">
            <span className="channel-icon">{icon}</span>
            <span className="channel-title">{title}</span>
            <span className={`channel-status ${status}`}>
                {status === 'connected' ? '🟢' : status === 'active' ? '🟡' : '🔴'}
            </span>
        </div>
        <div className="channel-metrics">
            <div className="metric">
                <span>Enviadas:</span>
                <span>{metrics?.sent || 0}</span>
            </div>
            <div className="metric">
                <span>Entregues:</span>
                <span>{metrics?.delivered || metrics?.opened || 0}</span>
            </div>
        </div>
    </div>
);
```

## 📲 **INTEGRAÇÃO WHATSAPP BUSINESS API**
```typescript
// services/WhatsAppMultiTenantService.ts
export class WhatsAppMultiTenantService {
    private evolutionAPI: EvolutionAPI;
    private tenantInstances: Map<string, WhatsAppInstance> = new Map();
    
    constructor() {
        this.evolutionAPI = new EvolutionAPI({
            baseURL: process.env.EVOLUTION_API_URL,
            apiKey: process.env.EVOLUTION_API_KEY
        });
    }
    
    async setupTenantWhatsAppInstance(tenantId: string): Promise<WhatsAppInstance> {
        const instanceName = `kryonix_${tenantId}`;
        
        // Criar instância Evolution API isolada para o tenant
        const instance = await this.evolutionAPI.createInstance({
            instanceName,
            webhook: `${process.env.WEBHOOK_BASE_URL}/webhooks/${tenantId}/whatsapp`,
            settings: {
                rejectCall: true,
                alwaysOnline: true,
                readMessages: false,
                readStatus: false,
                syncFullHistory: false
            },
            database: {
                enabled: true,
                connectionString: `postgresql://kryonix:${process.env.DB_PASSWORD}@postgres:5432/whatsapp_${tenantId}`
            }
        });
        
        // Configurar webhook handler isolado
        await this.setupTenantWebhook(tenantId, instance);
        
        // Cache da instância
        this.tenantInstances.set(tenantId, instance);
        
        // Configurar rate limiting específico do tenant
        await this.setupTenantRateLimits(tenantId, instance);
        
        return instance;
    }
    
    async sendWhatsAppMessage(
        tenantId: string, 
        request: WhatsAppMessageRequest
    ): Promise<WhatsAppMessageResult> {
        const instance = await this.getTenantInstance(tenantId);
        
        // Verificar se instância está conectada
        const connectionStatus = await instance.getConnectionStatus();
        if (!connectionStatus.connected) {
            throw new WhatsAppNotConnectedError(
                `Tenant ${tenantId} WhatsApp not connected`
            );
        }
        
        // Rate limiting isolado por tenant
        await this.checkTenantWhatsAppLimits(tenantId);
        
        // Enviar mensagem
        const result = await instance.sendMessage({
            number: this.normalizePhoneNumber(request.to),
            message: request.message,
            type: request.type || 'text',
            media: request.media,
            caption: request.caption
        });
        
        // Analytics isoladas por tenant
        await this.trackWhatsAppMessage(tenantId, request, result);
        
        return {
            id: result.messageId,
            status: result.status,
            timestamp: new Date(),
            provider: 'evolution-api',
            tenantId
        };
    }
    
    async handleTenantWebhook(
        tenantId: string, 
        webhookData: WhatsAppWebhookData
    ): Promise<void> {
        const tenantContext = new TenantContext(tenantId);
        
        switch (webhookData.event) {
            case 'message.received':
                await this.handleIncomingMessage(tenantContext, webhookData);
                break;
            case 'message.status':
                await this.handleMessageStatus(tenantContext, webhookData);
                break;
            case 'connection.update':
                await this.handleConnectionUpdate(tenantContext, webhookData);
                break;
            case 'qr.updated':
                await this.handleQRUpdate(tenantContext, webhookData);
                break;
        }
    }
    
    private async handleIncomingMessage(
        tenantContext: TenantContext, 
        data: WhatsAppWebhookData
    ): Promise<void> {
        // Auto-resposta baseada em configurações do tenant
        const autoReplyConfig = await tenantContext.getAutoReplyConfig();
        
        if (autoReplyConfig.enabled) {
            const response = await this.generateAutoReply(
                data.message,
                autoReplyConfig,
                tenantContext.tenantId
            );
            
            if (response) {
                await this.sendWhatsAppMessage(tenantContext.tenantId, {
                    to: data.from,
                    message: response.text,
                    type: 'text'
                });
            }
        }
        
        // Salvar mensagem no database isolado do tenant
        await this.saveIncomingMessage(tenantContext.tenantId, data);
        
        // Notificar via WebSocket isolado do tenant
        await this.notifyTenantUsers(tenantContext.tenantId, {
            type: 'whatsapp_message_received',
            from: data.from,
            message: data.message,
            timestamp: data.timestamp
        });
    }
    
    private async checkTenantWhatsAppLimits(tenantId: string): Promise<void> {
        const limits = await this.getTenantLimits(tenantId);
        const usage = await this.getTenantUsage(tenantId);
        
        // Verificar limite de mensagens por minuto
        if (usage.messagesPerMinute >= limits.messagesPerMinute) {
            throw new RateLimitError(
                `Tenant ${tenantId} exceeded WhatsApp rate limit: ${usage.messagesPerMinute}/${limits.messagesPerMinute} per minute`
            );
        }
        
        // Verificar limite diário
        if (usage.messagesToday >= limits.messagesPerDay) {
            throw new RateLimitError(
                `Tenant ${tenantId} exceeded daily WhatsApp limit: ${usage.messagesToday}/${limits.messagesPerDay}`
            );
        }
    }
    
    async getTenantWhatsAppMetrics(tenantId: string): Promise<WhatsAppMetrics> {
        // Buscar métricas isoladas do tenant
        const metrics = await this.sdk.query({
            table: 'notification_sends',
            select: `
                COUNT(*) as total_sent,
                COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
                COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
            `,
            where: {
                tenant_id: tenantId,
                channel: 'whatsapp',
                created_at: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias
                }
            }
        });
        
        return {
            totalSent: metrics[0].total_sent,
            delivered: metrics[0].delivered,
            read: metrics[0].read,
            failed: metrics[0].failed,
            deliveryRate: (metrics[0].delivered / metrics[0].total_sent) * 100,
            readRate: (metrics[0].read / metrics[0].total_sent) * 100,
            tenantId
        };
    }
}
```

## 🚀 **SCRIPT DE DEPLOY AUTOMATIZADO**
```bash
#!/bin/bash
# deploy-notifications-multi-tenant.sh

echo "🚀 Deploying KRYONIX Multi-Tenant Notifications System..."

# 1. Configurar variáveis de ambiente
cat > .env.notifications << 'EOF'
# Database Multi-Tenant
DATABASE_URL=postgresql://kryonix:${DB_PASSWORD}@postgres:5432/kryonix_notifications
TENANT_DATABASE_PREFIX=notifications_

# Redis Multi-Tenant
REDIS_URL=redis://redis:6379
REDIS_TENANT_PREFIX=notifications:

# WhatsApp Evolution API
EVOLUTION_API_URL=https://whatsapp.kryonix.com.br
EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
WEBHOOK_BASE_URL=https://api.kryonix.com.br

# Push Notifications
FCM_SERVER_KEY=${FCM_SERVER_KEY}
FCM_PROJECT_ID=${FCM_PROJECT_ID}
VAPID_PUBLIC_KEY=${VAPID_PUBLIC_KEY}
VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY}

# SMS Provider
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=+5511999999999

# Email Provider
SENDGRID_API_KEY=${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=notifications@kryonix.com.br

# Rate Limiting
DEFAULT_RATE_LIMIT_PER_MINUTE=100
DEFAULT_RATE_LIMIT_PER_DAY=10000

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
EOF

# 2. Docker Compose para serviços
cat > docker-compose.notifications.yml << 'EOF'
version: '3.8'

services:
  notifications-api:
    build: 
      context: .
      dockerfile: Dockerfile.notifications
    environment:
      - NODE_ENV=production
    env_file:
      - .env.notifications
    ports:
      - "3003:3000"
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix-network
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  notifications-worker:
    build: 
      context: .
      dockerfile: Dockerfile.notifications-worker
    environment:
      - NODE_ENV=production
      - WORKER_TYPE=notifications
    env_file:
      - .env.notifications
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix-network
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  notifications-scheduler:
    build: 
      context: .
      dockerfile: Dockerfile.notifications-scheduler
    environment:
      - NODE_ENV=production
    env_file:
      - .env.notifications
    depends_on:
      - postgres
      - redis
    networks:
      - kryonix-network
    deploy:
      replicas: 1
      resources:
        limits:
          memory: 128M

networks:
  kryonix-network:
    external: true
EOF

# 3. Dockerfile para API
cat > Dockerfile.notifications << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY dist/ ./dist/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/notifications/main.js"]
EOF

# 4. Kubernetes deployment
cat > k8s/notifications-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kryonix-notifications
  namespace: kryonix
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kryonix-notifications
  template:
    metadata:
      labels:
        app: kryonix-notifications
    spec:
      containers:
      - name: notifications-api
        image: kryonix/notifications:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: kryonix-notifications-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: kryonix-notifications-service
  namespace: kryonix
spec:
  selector:
    app: kryonix-notifications
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kryonix-notifications-ingress
  namespace: kryonix
  annotations:
    kubernetes.io/ingress.class: "traefik"
    traefik.ingress.kubernetes.io/router.middlewares: "kryonix-auth@kubernetescrd"
spec:
  rules:
  - host: notifications.kryonix.com.br
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: kryonix-notifications-service
            port:
              number: 80
EOF

# 5. Configurar monitoramento
cat > config/monitoring.yml << 'EOF'
# Prometheus monitoring config
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'kryonix-notifications'
    static_configs:
      - targets: ['notifications-api:9090']
    metrics_path: /metrics
    scrape_interval: 30s

rule_files:
  - "notifications-alerts.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
EOF

# 6. Aplicar migrations
echo "📊 Aplicando migrations do banco de dados..."
npm run migrate:notifications:up

# 7. Configurar RLS
echo "🔒 Configurando Row Level Security..."
psql $DATABASE_URL -c "
  -- Habilitar RLS em todas as tabelas de notificações
  SELECT setup_notifications_rls();
"

# 8. Build e deploy
echo "🏗️ Building containers..."
docker build -t kryonix/notifications:latest -f Dockerfile.notifications .
docker build -t kryonix/notifications-worker:latest -f Dockerfile.notifications-worker .
docker build -t kryonix/notifications-scheduler:latest -f Dockerfile.notifications-scheduler .

# 9. Push para registry
echo "📤 Pushing to registry..."
docker push kryonix/notifications:latest
docker push kryonix/notifications-worker:latest
docker push kryonix/notifications-scheduler:latest

# 10. Deploy no Kubernetes
echo "🚀 Deploying to Kubernetes..."
kubectl apply -f k8s/notifications-deployment.yaml

# 11. Verificar health
echo "🔍 Verificando health dos serviços..."
kubectl rollout status deployment/kryonix-notifications -n kryonix

# 12. Configurar Evolution API instances para tenants existentes
echo "📱 Configurando instâncias WhatsApp para tenants..."
npm run setup:whatsapp:tenants

# 13. Inicializar templates padrão
echo "📝 Criando templates padrão..."
npm run setup:templates:default

echo "✅ Deploy de KRYONIX Multi-Tenant Notifications concluído com sucesso!"
echo "📊 Dashboard: https://notifications.kryonix.com.br"
echo "📱 WhatsApp API: https://whatsapp.kryonix.com.br"
echo "🔔 Push Service: Configurado via FCM"
echo "📧 Email Service: Configurado via SendGrid"
echo "💬 SMS Service: Configurado via Twilio"
```

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO MULTI-TENANT**
- [ ] 🏗️ **Arquitetura Multi-tenant** com isolamento completo
- [ ] 📊 **Schemas com RLS** configurados e testados
- [ ] 🔧 **Services isolados** por tenant implementados
- [ ] 📱 **Interface mobile-first** responsiva criada
- [ ] 🔌 **SDK @kryonix** integrado em todos os módulos
- [ ] 💾 **Cache Redis** namespacedo por cliente
- [ ] ⚡ **WebSocket** channels isolados por tenant
- [ ] 📲 **WhatsApp Business API** instances por tenant
- [ ] 🔔 **Push Notifications** PWA configuradas
- [ ] 📧 **Email templates** isolados por cliente
- [ ] 💬 **SMS provider** configurado por tenant
- [ ] 📊 **Analytics isoladas** por cliente implementadas
- [ ] 🔐 **Rate limiting** específico por tenant
- [ ] 🔒 **LGPD compliance** automático configurado
- [ ] 🚀 **Deploy automatizado** funcionando
- [ ] 📈 **Monitoramento** por tenant ativo

## 🎯 **FUNCIONALIDADES ENTREGUES**
1. **Isolamento Completo**: Dados, templates, configurações por tenant
2. **Mobile-First**: Design otimizado para 80% usuários mobile
3. **Multi-Canal**: WhatsApp, Push, Email, SMS, In-App
4. **Templates Customizáveis**: Por cliente com versionamento
5. **Analytics Isoladas**: Métricas específicas por tenant
6. **Rate Limiting**: Limites configuráveis por cliente
7. **Real-time Updates**: WebSocket isolado por tenant
8. **LGPD Compliance**: Tracking automático de consentimento
9. **Offline Support**: Service Worker + IndexedDB
10. **Auto-provisioning**: Setup automático em 2-5 minutos

---
*Parte 16 de 50 - Projeto KRYONIX SaaS Platform Multi-Tenant*
*Próxima Parte: 17 - Logs e Auditoria Multi-Tenant*
*🏢 KRYONIX - Transformação Multi-Tenant Completa*

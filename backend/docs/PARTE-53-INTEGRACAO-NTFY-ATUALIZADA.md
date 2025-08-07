# 🔔 PARTE-53 - INTEGRAÇÃO NTFY ATUALIZADA KRYONIX
*Sistema de Notificações Push com Novas Credenciais*

## 🎯 **OBJETIVO NTFY INTEGRATION**
Implementar e configurar sistema Ntfy atualizado para notificações push multi-tenant com novas credenciais de segurança e isolamento completo por cliente.

## 🏗️ **ARQUITETURA NTFY MULTI-TENANT**
```yaml
NTFY_INTEGRATION:
  URL: "https://ntfy.kryonix.com.br"
  CREDENTIALS:
    USER: "kryonix"
    PASSWORD: "Vitor@123456"
    BASIC_AUTH: "a3J5b25peDpWaXRvckAxMjM0NTY="
  
  MULTI_TENANT_FEATURES:
    - "Tópicos isolados por cliente"
    - "ACL por tenant"
    - "Rate limiting personalizado"
    - "Webhooks configuráveis"
    - "Monitoring por cliente"
    - "Compliance LGPD automático"
    
  NOTIFICATION_CHANNELS:
    - "Push notifications"
    - "Email fallback"
    - "Webhook integrations"
    - "Mobile app alerts"
    - "System monitoring"
    - "Critical alerts"

TOPIC_STRUCTURE:
  TENANT_ISOLATION: "tenant_{tenant_id}_{module}_{type}"
  USER_SPECIFIC: "user_{user_id}_{tenant_id}"
  SYSTEM_ALERTS: "system_{tenant_id}_{component}"
  MONITORING: "monitor_{tenant_id}_{service}"
```

## 📊 **CONFIGURAÇÃO MULTI-TENANT ATUALIZADA**
```typescript
// services/NtfyService.ts
export class KryonixNtfyService {
    private baseUrl: string = 'https://ntfy.kryonix.com.br';
    private credentials: string = 'a3J5b25peDpWaXRvckAxMjM0NTY=';
    private tenantId: string;
    
    constructor(tenantId: string) {
        this.tenantId = tenantId;
    }
    
    async sendNotification(params: {
        topic?: string;
        title: string;
        message: string;
        priority?: 1 | 2 | 3 | 4 | 5;
        tags?: string[];
        click?: string;
        attach?: string;
        actions?: Array<{
            action: string;
            label: string;
            url?: string;
        }>;
        userId?: string;
        module?: string;
        type?: string;
    }) {
        const topic = this.buildTopic(params);
        
        try {
            const response = await fetch(`${this.baseUrl}/${topic}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${this.credentials}`,
                    'X-Tenant-ID': this.tenantId,
                    'X-Title': params.title,
                    'X-Priority': params.priority?.toString() || '3',
                    'X-Tags': params.tags?.join(',') || 'kryonix',
                    'X-Click': params.click || '',
                    'X-Attach': params.attach || '',
                    'X-Actions': params.actions ? JSON.stringify(params.actions) : ''
                },
                body: JSON.stringify({
                    topic,
                    title: params.title,
                    message: params.message,
                    tenant_id: this.tenantId,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error(`Ntfy notification failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Log para analytics
            await this.logNotification({
                topic,
                title: params.title,
                tenant_id: this.tenantId,
                status: 'sent',
                response_time: Date.now()
            });
            
            return result;
            
        } catch (error) {
            console.error('Ntfy notification error:', error);
            
            // Log do erro
            await this.logNotification({
                topic,
                title: params.title,
                tenant_id: this.tenantId,
                status: 'failed',
                error: error.message
            });
            
            throw error;
        }
    }
    
    private buildTopic(params: any): string {
        if (params.topic) {
            return params.topic;
        }
        
        if (params.userId) {
            return `user_${params.userId}_${this.tenantId}`;
        }
        
        if (params.module && params.type) {
            return `tenant_${this.tenantId}_${params.module}_${params.type}`;
        }
        
        // Topic padrão
        return `tenant_${this.tenantId}_general`;
    }
    
    async sendSystemAlert(params: {
        component: string;
        level: 'info' | 'warning' | 'error' | 'critical';
        message: string;
        metadata?: any;
    }) {
        const priorityMap = {
            'info': 2,
            'warning': 3,
            'error': 4,
            'critical': 5
        };
        
        const iconMap = {
            'info': '🔵',
            'warning': '🟡', 
            'error': '🔴',
            'critical': '🚨'
        };
        
        return await this.sendNotification({
            topic: `system_${this.tenantId}_${params.component}`,
            title: `${iconMap[params.level]} ${params.component.toUpperCase()} Alert`,
            message: params.message,
            priority: priorityMap[params.level] as any,
            tags: ['system', 'alert', params.level],
            click: `https://dashboard.kryonix.com.br/monitoring/${params.component}`,
            actions: [
                {
                    action: 'view',
                    label: 'Ver Dashboard',
                    url: `https://dashboard.kryonix.com.br/monitoring/${params.component}`
                },
                {
                    action: 'acknowledge',
                    label: 'Reconhecer',
                    url: `https://api.kryonix.com.br/alerts/acknowledge`
                }
            ]
        });
    }
    
    async sendUserNotification(params: {
        userId: string;
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        actionUrl?: string;
        actionLabel?: string;
    }) {
        const iconMap = {
            'info': '💙',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        
        const priorityMap = {
            'info': 2,
            'success': 3,
            'warning': 4,
            'error': 4
        };
        
        const actions = [];
        if (params.actionUrl && params.actionLabel) {
            actions.push({
                action: 'view',
                label: params.actionLabel,
                url: params.actionUrl
            });
        }
        
        return await this.sendNotification({
            userId: params.userId,
            title: `${iconMap[params.type]} ${params.title}`,
            message: params.message,
            priority: priorityMap[params.type] as any,
            tags: ['user', params.type, 'kryonix'],
            click: params.actionUrl,
            actions
        });
    }
    
    async subscribe(params: {
        topic: string;
        webhookUrl?: string;
        since?: string;
    }) {
        const url = new URL(`${this.baseUrl}/${params.topic}/sse`);
        if (params.since) {
            url.searchParams.set('since', params.since);
        }
        
        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Basic ${this.credentials}`,
                'X-Tenant-ID': this.tenantId
            }
        });
        
        return response;
    }
    
    private async logNotification(data: any) {
        // Log interno ou integração com analytics
        console.log('Ntfy Notification Log:', data);
    }
}
```

## 🔧 **INTEGRAÇÃO COM MÓDULOS EXISTENTES**
```typescript
// integrations/WhatsAppNtfyIntegration.ts
export class WhatsAppNtfyIntegration {
    private ntfy: KryonixNtfyService;
    
    constructor(tenantId: string) {
        this.ntfy = new KryonixNtfyService(tenantId);
    }
    
    async notifyMessageReceived(params: {
        instanceName: string;
        from: string;
        message: string;
        userId?: string;
    }) {
        await this.ntfy.sendUserNotification({
            userId: params.userId || 'admin',
            title: 'Nova mensagem WhatsApp',
            message: `De: ${params.from}\nMensagem: ${params.message.substring(0, 100)}...`,
            type: 'info',
            actionUrl: `https://whatsapp.kryonix.com.br/conversation/${params.instanceName}/${params.from}`,
            actionLabel: 'Ver Conversa'
        });
    }
    
    async notifyInstanceDisconnected(instanceName: string) {
        await this.ntfy.sendSystemAlert({
            component: 'whatsapp',
            level: 'error',
            message: `Instância ${instanceName} foi desconectada. Reconexão necessária.`,
            metadata: { instance: instanceName }
        });
    }
}

// integrations/BackupNtfyIntegration.ts
export class BackupNtfyIntegration {
    private ntfy: KryonixNtfyService;
    
    constructor(tenantId: string) {
        this.ntfy = new KryonixNtfyService(tenantId);
    }
    
    async notifyBackupCompleted(params: {
        backupType: string;
        size: string;
        duration: string;
        location: string;
    }) {
        await this.ntfy.sendSystemAlert({
            component: 'backup',
            level: 'info',
            message: `Backup ${params.backupType} concluído com sucesso. Tamanho: ${params.size}, Duração: ${params.duration}`,
            metadata: params
        });
    }
    
    async notifyBackupFailed(params: {
        backupType: string;
        error: string;
    }) {
        await this.ntfy.sendSystemAlert({
            component: 'backup',
            level: 'critical',
            message: `FALHA no backup ${params.backupType}: ${params.error}`,
            metadata: params
        });
    }
}
```

## 📱 **COMPONENTE MOBILE NTFY**
```tsx
// components/mobile/MobileNotifications.tsx
import React, { useState, useEffect } from 'react';
import { KryonixNtfyService } from '../../services/NtfyService';

export const MobileNotifications: React.FC<{
    tenantId: string;
    userId: string;
}> = ({ tenantId, userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [connected, setConnected] = useState(false);
    const [ntfyService] = useState(() => new KryonixNtfyService(tenantId));
    
    useEffect(() => {
        setupNotificationSubscription();
        requestNotificationPermission();
    }, []);
    
    const setupNotificationSubscription = async () => {
        try {
            const topic = `user_${userId}_${tenantId}`;
            const subscription = await ntfyService.subscribe({
                topic,
                since: 'all'
            });
            
            if (subscription.ok) {
                setConnected(true);
                
                const reader = subscription.body?.getReader();
                if (reader) {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        const text = new TextDecoder().decode(value);
                        const lines = text.split('\n').filter(line => line.trim());
                        
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const notification = JSON.parse(line.substring(6));
                                    handleNewNotification(notification);
                                } catch (e) {
                                    console.error('Error parsing notification:', e);
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setConnected(false);
        }
    };
    
    const handleNewNotification = (notification: any) => {
        // Adicionar à lista
        setNotifications(prev => [notification, ...prev.slice(0, 49)]);
        
        // Mostrar notificação do browser se permitido
        if (Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/logo-kryonix.png',
                tag: notification.id,
                badge: '/badge-kryonix.png'
            });
        }
        
        // Vibrar em mobile
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    };
    
    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };
    
    const markAsRead = async (notificationId: string) => {
        // Implementar lógica de marcar como lida
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
    };
    
    return (
        <div className="mobile-notifications">
            <div className="notifications-header">
                <h3>🔔 Notificações</h3>
                <div className="connection-status">
                    <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
                        {connected ? '🟢 Conectado' : '🔴 Desconectado'}
                    </span>
                </div>
            </div>
            
            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="no-notifications">
                        <p>📭 Nenhuma notificação</p>
                    </div>
                ) : (
                    notifications.map((notification: any) => (
                        <div 
                            key={notification.id}
                            className={`notification-card ${notification.read ? 'read' : 'unread'}`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="notification-header">
                                <span className="notification-title">{notification.title}</span>
                                <span className="notification-time">
                                    {new Date(notification.time * 1000).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="notification-message">
                                {notification.message}
                            </div>
                            {notification.click && (
                                <div className="notification-actions">
                                    <a 
                                        href={notification.click}
                                        className="notification-action-btn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Ver Detalhes
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
```

## 🐳 **DOCKER COMPOSE NTFY ATUALIZADO**
```yaml
# docker-compose.ntfy.yml
version: '3.8'

services:
  ntfy:
    image: binwiederhier/ntfy:latest
    container_name: ntfy-kryonix
    restart: unless-stopped
    environment:
      - NTFY_BASE_URL=https://ntfy.kryonix.com.br
      - NTFY_LISTEN_HTTP=:80
      - NTFY_CACHE_FILE=/var/lib/ntfy/cache.db
      - NTFY_AUTH_FILE=/var/lib/ntfy/auth.db
      - NTFY_AUTH_DEFAULT_ACCESS=deny-all
      - NTFY_ENABLE_LOGIN=true
      - NTFY_ENABLE_SIGNUP=false
    volumes:
      - ntfy_data:/var/lib/ntfy
      - ./ntfy.yml:/etc/ntfy/server.yml
    ports:
      - "9090:80"
    networks:
      - kryonix-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.ntfy.rule=Host(`ntfy.kryonix.com.br`)"
      - "traefik.http.routers.ntfy.tls=true"
      - "traefik.http.routers.ntfy.tls.certresolver=letsencrypt"
      - "traefik.http.services.ntfy.loadbalancer.server.port=80"

volumes:
  ntfy_data:

networks:
  kryonix-network:
    external: true
```

## ⚙️ **CONFIGURAÇÃO NTFY ATUALIZADA**
```yaml
# ntfy.yml
base-url: "https://ntfy.kryonix.com.br"
listen-http: ":80"
cache-file: "/var/lib/ntfy/cache.db"
auth-file: "/var/lib/ntfy/auth.db"
auth-default-access: "deny-all"
enable-login: true
enable-signup: false

# Usuário principal
users:
  - username: "kryonix"
    password: "Vitor@123456"
    role: "admin"

# ACL por tenant (exemplo)
access:
  - topic: "tenant_*"
    access: "rw"
    users: ["kryonix"]
  
  - topic: "user_*"
    access: "rw"
    users: ["kryonix"]
    
  - topic: "system_*"
    access: "rw"
    users: ["kryonix"]

# Rate limiting
visitor-request-limit-burst: 100
visitor-request-limit-replenish: "10s"
visitor-email-limit-burst: 5
visitor-email-limit-replenish: "1h"

# Configurações de attachment
attachment-cache-dir: "/var/lib/ntfy/attachments"
attachment-total-size-limit: "5GB"
attachment-file-size-limit: "15MB"
attachment-expiry-duration: "3h"

# Métricas
enable-metrics: true
metrics-listen-http: ":9094"

# Logs
log-level: "info"
log-format: "json"
```

## 🚀 **SCRIPT DE DEPLOY ATUALIZADO**
```bash
#!/bin/bash
# deploy-ntfy-updated.sh

echo "🔔 Deploying Updated Ntfy System for KRYONIX..."

# 1. Criar diretórios
mkdir -p /opt/kryonix/ntfy/{config,data,logs}

# 2. Criar arquivo de configuração
cat > /opt/kryonix/ntfy/config/ntfy.yml << 'EOF'
base-url: "https://ntfy.kryonix.com.br"
listen-http: ":80"
cache-file: "/var/lib/ntfy/cache.db"
auth-file: "/var/lib/ntfy/auth.db"
auth-default-access: "deny-all"
enable-login: true
enable-signup: false

users:
  - username: "kryonix"
    password: "Vitor@123456"
    role: "admin"

access:
  - topic: "tenant_*"
    access: "rw"
    users: ["kryonix"]
  - topic: "user_*"
    access: "rw"
    users: ["kryonix"]
  - topic: "system_*"
    access: "rw"
    users: ["kryonix"]

visitor-request-limit-burst: 100
visitor-request-limit-replenish: "10s"
enable-metrics: true
log-level: "info"
EOF

# 3. Deploy Ntfy
cd /opt/kryonix/ntfy
docker-compose -f docker-compose.ntfy.yml up -d

# 4. Aguardar inicialização
echo "⏳ Aguardando Ntfy inicializar..."
sleep 30

# 5. Configurar usuário via API
curl -X POST https://ntfy.kryonix.com.br/v1/account \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kryonix",
    "password": "Vitor@123456"
  }'

# 6. Testar notificação
curl -X POST https://ntfy.kryonix.com.br/test-topic \
  -H "Authorization: Basic a3J5b25peDpWaXRvckAxMjM0NTY=" \
  -H "X-Title: KRYONIX Test" \
  -H "X-Tags: test,kryonix" \
  -d "Ntfy configurado com sucesso!"

# 7. Health check
curl -s https://ntfy.kryonix.com.br/v1/health && echo "✅ Ntfy OK" || echo "❌ Ntfy ERRO"

echo "✅ Ntfy deployment atualizado completo!"
echo "🌐 URL: https://ntfy.kryonix.com.br"
echo "👤 Login: kryonix / Vitor@123456"
echo "🔑 Auth: Basic a3J5b25peDpWaXRvckAxMjM0NTY="
```

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**
- [ ] 🏗️ **Ntfy server** atualizado e funcional
- [ ] 📊 **Multi-tenant ACL** configurado
- [ ] 🔧 **Novas credenciais** implementadas
- [ ] 📱 **Mobile integration** atualizada
- [ ] 🔌 **Webhook integrations** funcionais
- [ ] 💾 **Backup notifications** ativas
- [ ] ⚡ **Real-time push** configurado
- [ ] 🔐 **Basic auth** atualizado
- [ ] 📈 **Monitoring alerts** funcionais
- [ ] 🚀 **Auto-deployment** configurado

## 🎯 **CASOS DE USO PRINCIPAIS**
1. **System Monitoring**: Alertas críticos de sistema por tenant
2. **User Notifications**: Notificações personalizadas por usuário
3. **Backup Alerts**: Status de backup em tempo real
4. **WhatsApp Integration**: Alertas de mensagens e desconexões
5. **Mobile Push**: Notificações push para apps mobile
6. **Admin Alerts**: Notificações administrativas críticas

---

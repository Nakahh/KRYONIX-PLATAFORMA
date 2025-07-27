# 💬 PARTE 37 - CHATWOOT (ATENDIMENTO)
*Agentes Responsáveis: Especialista Comunicação + Customer Success + UX/UI + API Integration*

---

## 🎯 **OBJETIVOS DA PARTE 37**
Integrar e configurar o sistema Chatwoot já instalado para criar central de atendimento omnichannel unificada, conectando WhatsApp, Email, Chat Web e outros canais em uma interface única para equipe de suporte KRYONIX.

---

## 🛠️ **STACK TÉCNICA**
```yaml
Chatwoot: https://chat.kryonix.com.br
Usuário: vitor.nakahh@gmail.com
Senha: Vitor@123456
SMTP: SendGrid integrado
Channels: WhatsApp, Email, WebChat, API
Database: PostgreSQL compartilhado
```

---

## 👥 **AGENTES ESPECIALIZADOS ATUANDO**

### 💬 **Especialista Comunicação** - Líder da Parte
**Responsabilidades:**
- Strategy de atendimento omnichannel
- Workflow de tickets e escalação
- Templates de respostas
- SLA e métricas de atendimento

### 🎯 **Customer Success Specialist**
**Responsabilidades:**
- Processo de atendimento ao cliente
- Scripts de atendimento
- Satisfaction surveys
- Customer journey mapping

### 🎨 **UX/UI Designer**
**Responsabilidades:**
- Interface de chat para clientes
- Widget customization
- Agent dashboard optimization
- Mobile experience

### 🔌 **API Integration Expert**
**Responsabilidades:**
- Evolution API + Chatwoot sync
- Webhook configurations
- Custom integrations
- Performance optimization

---

## 📋 **CONFIGURAÇÃO CHATWOOT**

### **37.1 - Chatwoot API Service**
```typescript
// src/services/ChatwootService.ts
import axios, { AxiosInstance } from 'axios';

interface ChatwootContact {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  custom_attributes?: any;
}

interface ChatwootConversation {
  id: number;
  account_id: number;
  inbox_id: number;
  status: 'open' | 'resolved' | 'pending';
  assignee_id?: number;
  team_id?: number;
  contact_id: number;
  messages_count: number;
  created_at: string;
  updated_at: string;
}

interface ChatwootMessage {
  id: number;
  content: string;
  message_type: 'incoming' | 'outgoing';
  content_type: 'text' | 'image' | 'audio' | 'video' | 'file';
  created_at: string;
  conversation_id: number;
  sender_id?: number;
  attachments?: any[];
}

export class ChatwootService {
  private apiClient: AxiosInstance;
  private readonly baseURL = 'https://chat.kryonix.com.br';
  private readonly accountId: number;
  private accessToken: string;

  constructor(accountId: number = 1, accessToken?: string) {
    this.accountId = accountId;
    this.accessToken = accessToken || process.env.CHATWOOT_ACCESS_TOKEN || '';

    this.apiClient = axios.create({
      baseURL: `${this.baseURL}/api/v1/accounts/${this.accountId}`,
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': this.accessToken
      },
      timeout: 15000
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`📤 Chatwoot Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`📥 Chatwoot Response: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('❌ Chatwoot Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Contacts Management
  async createContact(contactData: {
    name: string;
    email?: string;
    phone_number?: string;
    custom_attributes?: any;
  }): Promise<ChatwootContact> {
    const response = await this.apiClient.post('/contacts', contactData);
    return response.data.payload.contact;
  }

  async getContact(contactId: number): Promise<ChatwootContact> {
    const response = await this.apiClient.get(`/contacts/${contactId}`);
    return response.data.payload.contact;
  }

  async updateContact(contactId: number, updates: Partial<ChatwootContact>): Promise<ChatwootContact> {
    const response = await this.apiClient.put(`/contacts/${contactId}`, updates);
    return response.data.payload.contact;
  }

  async searchContacts(query: string): Promise<ChatwootContact[]> {
    const response = await this.apiClient.get(`/contacts/search?q=${encodeURIComponent(query)}`);
    return response.data.payload || [];
  }

  // Conversations Management
  async getConversations(
    inboxId?: number,
    status?: 'open' | 'resolved' | 'pending',
    assigneeType?: 'me' | 'unassigned' | 'all'
  ): Promise<ChatwootConversation[]> {
    const params = new URLSearchParams();
    if (inboxId) params.append('inbox_id', inboxId.toString());
    if (status) params.append('status', status);
    if (assigneeType) params.append('assignee_type', assigneeType);

    const response = await this.apiClient.get(`/conversations?${params.toString()}`);
    return response.data.data.payload || [];
  }

  async getConversation(conversationId: number): Promise<ChatwootConversation> {
    const response = await this.apiClient.get(`/conversations/${conversationId}`);
    return response.data;
  }

  async updateConversationStatus(
    conversationId: number,
    status: 'open' | 'resolved' | 'pending'
  ): Promise<ChatwootConversation> {
    const response = await this.apiClient.post(`/conversations/${conversationId}/toggle_status`);
    return response.data;
  }

  async assignConversation(
    conversationId: number,
    assigneeId: number
  ): Promise<ChatwootConversation> {
    const response = await this.apiClient.post(`/conversations/${conversationId}/assignments`, {
      assignee_id: assigneeId
    });
    return response.data;
  }

  async addConversationLabels(
    conversationId: number,
    labels: string[]
  ): Promise<void> {
    await this.apiClient.post(`/conversations/${conversationId}/labels`, {
      labels
    });
  }

  // Messages Management
  async getConversationMessages(conversationId: number): Promise<ChatwootMessage[]> {
    const response = await this.apiClient.get(`/conversations/${conversationId}/messages`);
    return response.data.payload || [];
  }

  async sendMessage(
    conversationId: number,
    content: string,
    messageType: 'outgoing' = 'outgoing',
    isPrivate: boolean = false
  ): Promise<ChatwootMessage> {
    const response = await this.apiClient.post(`/conversations/${conversationId}/messages`, {
      content,
      message_type: messageType,
      private: isPrivate
    });
    return response.data;
  }

  async sendMessageWithAttachment(
    conversationId: number,
    content: string,
    attachments: File[]
  ): Promise<ChatwootMessage> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('message_type', 'outgoing');
    
    attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    const response = await this.apiClient.post(
      `/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }

  // Inbox Management
  async getInboxes(): Promise<any[]> {
    const response = await this.apiClient.get('/inboxes');
    return response.data.payload || [];
  }

  async createWebsiteInbox(
    name: string,
    websiteUrl: string,
    config?: any
  ): Promise<any> {
    const response = await this.apiClient.post('/inboxes', {
      name,
      channel: {
        type: 'web_widget',
        website_url: websiteUrl,
        ...config
      }
    });
    return response.data.payload;
  }

  async createAPIInbox(name: string, webhookUrl?: string): Promise<any> {
    const response = await this.apiClient.post('/inboxes', {
      name,
      channel: {
        type: 'api',
        webhook_url: webhookUrl
      }
    });
    return response.data.payload;
  }

  // Teams Management
  async getTeams(): Promise<any[]> {
    const response = await this.apiClient.get('/teams');
    return response.data.payload || [];
  }

  async createTeam(name: string, description?: string): Promise<any> {
    const response = await this.apiClient.post('/teams', {
      name,
      description
    });
    return response.data.payload;
  }

  // Agents Management
  async getAgents(): Promise<any[]> {
    const response = await this.apiClient.get('/agents');
    return response.data.payload || [];
  }

  async createAgent(agentData: {
    name: string;
    email: string;
    role: 'agent' | 'administrator';
  }): Promise<any> {
    const response = await this.apiClient.post('/agents', agentData);
    return response.data.payload;
  }

  // Canned Responses (Templates)
  async getCannedResponses(): Promise<any[]> {
    const response = await this.apiClient.get('/canned_responses');
    return response.data.payload || [];
  }

  async createCannedResponse(data: {
    short_code: string;
    content: string;
  }): Promise<any> {
    const response = await this.apiClient.post('/canned_responses', data);
    return response.data.payload;
  }

  // Reports & Analytics
  async getConversationReports(
    metric: 'conversations_count' | 'incoming_messages_count' | 'outgoing_messages_count' | 'avg_first_response_time' | 'avg_resolution_time' | 'resolutions_count',
    type: 'account' | 'agent' | 'inbox' | 'label' | 'team' = 'account',
    since?: string,
    until?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      metric,
      type,
      ...(since && { since }),
      ...(until && { until })
    });

    const response = await this.apiClient.get(`/reports/conversations?${params.toString()}`);
    return response.data;
  }

  // Integration with Evolution API
  async syncWhatsAppContact(phoneNumber: string, name?: string): Promise<ChatwootContact> {
    try {
      // Buscar contato existente
      const existingContacts = await this.searchContacts(phoneNumber);
      
      if (existingContacts.length > 0) {
        return existingContacts[0];
      }

      // Criar novo contato
      return await this.createContact({
        name: name || phoneNumber,
        phone_number: phoneNumber,
        custom_attributes: {
          source: 'whatsapp',
          synced_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error syncing WhatsApp contact:', error);
      throw error;
    }
  }

  async createConversationFromWhatsApp(
    inboxId: number,
    contactId: number,
    initialMessage?: string
  ): Promise<ChatwootConversation> {
    try {
      // Para WhatsApp, geralmente as conversas são criadas automaticamente
      // via webhook, mas podemos forçar criação se necessário
      const response = await this.apiClient.post('/conversations', {
        source_id: `whatsapp_${Date.now()}`,
        inbox_id: inboxId,
        contact_id: contactId,
        status: 'open'
      });

      const conversation = response.data.payload;

      // Enviar mensagem inicial se fornecida
      if (initialMessage) {
        await this.sendMessage(conversation.id, initialMessage, 'incoming');
      }

      return conversation;
    } catch (error) {
      console.error('Error creating conversation from WhatsApp:', error);
      throw error;
    }
  }

  // Webhook Processing
  async processWebhook(webhookData: any): Promise<void> {
    try {
      const { event, data } = webhookData;

      switch (event) {
        case 'conversation_created':
          await this.handleConversationCreated(data);
          break;
        
        case 'conversation_updated':
          await this.handleConversationUpdated(data);
          break;
        
        case 'message_created':
          await this.handleMessageCreated(data);
          break;
        
        case 'message_updated':
          await this.handleMessageUpdated(data);
          break;
        
        default:
          console.log(`Unhandled Chatwoot webhook: ${event}`);
      }
    } catch (error) {
      console.error('Error processing Chatwoot webhook:', error);
    }
  }

  private async handleConversationCreated(conversation: ChatwootConversation): Promise<void> {
    console.log('New conversation created:', conversation.id);
    
    // Implementar lógica de auto-assignment, notificações, etc.
    // Exemplo: auto-assign para agente disponível
    const agents = await this.getAgents();
    const availableAgent = agents.find(agent => agent.availability_status === 'online');
    
    if (availableAgent) {
      await this.assignConversation(conversation.id, availableAgent.id);
    }
  }

  private async handleConversationUpdated(conversation: ChatwootConversation): Promise<void> {
    console.log('Conversation updated:', conversation.id);
    
    // Implementar lógica de notificações, métricas, etc.
  }

  private async handleMessageCreated(message: ChatwootMessage): Promise<void> {
    console.log('New message created:', message.id);
    
    // Implementar lógica de notificações, auto-responses, etc.
    if (message.message_type === 'incoming') {
      // Verificar se precisa de resposta automática
      await this.checkAutoResponse(message);
    }
  }

  private async handleMessageUpdated(message: ChatwootMessage): Promise<void> {
    console.log('Message updated:', message.id);
  }

  private async checkAutoResponse(message: ChatwootMessage): Promise<void> {
    // Implementar lógica de resposta automática baseada em palavras-chave
    const content = message.content.toLowerCase();
    
    if (content.includes('horário') || content.includes('funcionamento')) {
      await this.sendMessage(
        message.conversation_id,
        '🕐 Nosso horário de funcionamento é de segunda a sexta, das 9h às 18h. Como posso ajudar?'
      );
    } else if (content.includes('preço') || content.includes('valor')) {
      await this.sendMessage(
        message.conversation_id,
        '💰 Vou conectar você com nossa equipe comercial para informações sobre preços. Um momento!'
      );
    }
  }

  // Integration Methods
  async getConversationMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const reports = await this.getConversationReports(
      'conversations_count',
      'account',
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    return {
      totalConversations: reports.data?.length || 0,
      avgResponseTime: await this.getConversationReports('avg_first_response_time'),
      avgResolutionTime: await this.getConversationReports('avg_resolution_time'),
      resolutionCount: await this.getConversationReports('resolutions_count')
    };
  }
}

export default new ChatwootService();
```

### **37.2 - Chat Widget Integration**
```typescript
// src/components/ChatWidget.tsx
import React, { useEffect, useState } from 'react';
import { MessageCircle, X, Send, Paperclip, Smile } from 'lucide-react';

interface ChatWidgetProps {
  websiteToken: string;
  baseUrl?: string;
  user?: {
    name?: string;
    email?: string;
    identifier?: string;
    avatar?: string;
  };
  customStyles?: {
    primaryColor?: string;
    widgetPosition?: 'right' | 'left';
  };
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  websiteToken,
  baseUrl = 'https://chat.kryonix.com.br',
  user,
  customStyles = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadChatwootWidget();
    
    // Listen for unread count updates
    window.addEventListener('chatwoot:ready', handleChatwootReady);
    window.addEventListener('chatwoot:on-unread-count-changed', handleUnreadCountChange);
    
    return () => {
      window.removeEventListener('chatwoot:ready', handleChatwootReady);
      window.removeEventListener('chatwoot:on-unread-count-changed', handleUnreadCountChange);
    };
  }, []);

  const loadChatwootWidget = () => {
    // Chatwoot Widget Script
    (function(d,t) {
      var BASE_URL = baseUrl;
      var g = d.createElement(t);
      var s = d.getElementsByTagName(t)[0];
      g.src = BASE_URL + "/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      s.parentNode?.insertBefore(g,s);
      
      g.onload = function() {
        (window as any).chatwootSDK.run({
          websiteToken: websiteToken,
          baseUrl: BASE_URL,
          ...(user && {
            user: {
              name: user.name,
              email: user.email,
              identifier: user.identifier,
              avatar_url: user.avatar
            }
          }),
          customAttributes: {
            source: 'kryonix-platform',
            timestamp: new Date().toISOString()
          }
        });
        
        setIsLoaded(true);
      };
    })(document,"script");
  };

  const handleChatwootReady = () => {
    console.log('Chatwoot widget ready');
    setIsLoaded(true);
  };

  const handleUnreadCountChange = (event: any) => {
    setUnreadCount(event.detail);
  };

  const toggleWidget = () => {
    if (!isLoaded) return;
    
    if (isOpen) {
      (window as any).chatwootSDK.toggle('close');
    } else {
      (window as any).chatwootSDK.toggle('open');
    }
    
    setIsOpen(!isOpen);
  };

  const primaryColor = customStyles.primaryColor || '#1f2937';
  const position = customStyles.widgetPosition || 'right';

  return (
    <>
      {/* Custom Widget Button */}
      <div 
        className={`fixed bottom-6 ${position}-6 z-50`}
        style={{ display: isLoaded ? 'block' : 'none' }}
      >
        <button
          onClick={toggleWidget}
          className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          
          {/* Online Indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
        </button>
        
        {/* Tooltip */}
        {!isOpen && (
          <div className={`absolute bottom-full mb-2 ${position}-0 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity`}>
            💬 Fale conosco
          </div>
        )}
      </div>

      {/* Hide default Chatwoot widget */}
      <style jsx>{`
        .woot-widget-holder {
          display: none !important;
        }
      `}</style>
    </>
  );
};

// src/components/ChatwootIntegration.tsx
interface ChatwootIntegrationProps {
  userId?: string;
  companyId?: string;
}

export const ChatwootIntegration: React.FC<ChatwootIntegrationProps> = ({
  userId,
  companyId
}) => {
  const [websiteToken, setWebsiteToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebsiteToken();
  }, [companyId]);

  const loadWebsiteToken = async () => {
    try {
      // Buscar token do website específico da empresa
      const response = await fetch(`/api/chatwoot/website-token?companyId=${companyId}`);
      const data = await response.json();
      
      if (data.token) {
        setWebsiteToken(data.token);
      } else {
        // Criar novo inbox se não existir
        await createCompanyInbox();
      }
    } catch (error) {
      console.error('Error loading website token:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompanyInbox = async () => {
    try {
      const response = await fetch('/api/chatwoot/create-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          name: `Inbox KRYONIX - ${companyId}`,
          websiteUrl: window.location.origin
        })
      });
      
      const data = await response.json();
      setWebsiteToken(data.websiteToken);
    } catch (error) {
      console.error('Error creating inbox:', error);
    }
  };

  if (loading || !websiteToken) {
    return null;
  }

  return (
    <ChatWidget
      websiteToken={websiteToken}
      user={{
        identifier: userId,
        name: 'Usuário KRYONIX',
        email: `user-${userId}@kryonix.com.br`
      }}
      customStyles={{
        primaryColor: '#3B82F6',
        widgetPosition: 'right'
      }}
    />
  );
};
```

### **37.3 - Admin Dashboard Integration**
```tsx
// src/components/ChatwootDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  UserCheck,
  Mail,
  Phone
} from 'lucide-react';
import ChatwootService from '../services/ChatwootService';

export const ChatwootDashboard: React.FC = () => {
  const [conversations, setConversations] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [conversationsData, agentsData, metricsData] = await Promise.all([
        ChatwootService.getConversations(),
        ChatwootService.getAgents(),
        ChatwootService.getConversationMetrics(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          new Date()
        )
      ]);
      
      setConversations(conversationsData);
      setAgents(agentsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  const openConversations = conversations.filter(c => c.status === 'open').length;
  const pendingConversations = conversations.filter(c => c.status === 'pending').length;
  const onlineAgents = agents.filter(a => a.availability_status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h2 className="text-3xl font-bold">💬 Central de Atendimento</h2>
        </div>
        <Button onClick={loadDashboardData}>
          🔄 Atualizar
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-green-100">
                <AlertCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversas Abertas</p>
                <p className="text-2xl font-bold text-gray-900">{openConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-blue-100">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agentes Online</p>
                <p className="text-2xl font-bold text-gray-900">{onlineAgents}</p>
                <p className="text-xs text-gray-500">de {agents.length} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Resposta</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics?.avgResponseTime ? `${metrics.avgResponseTime}min` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>💬 Conversas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversations.slice(0, 10).map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(conversation.status)}
                    <div>
                      <p className="font-medium">Conversa #{conversation.id}</p>
                      <p className="text-sm text-gray-600">
                        {conversation.messages_count} mensagens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(conversation.status)}>
                      {conversation.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conversation.updated_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agents Status */}
        <Card>
          <CardHeader>
            <CardTitle>👥 Status dos Agentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-gray-600">{agent.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      agent.availability_status === 'online' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {agent.availability_status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Mail className="h-6 w-6 mb-2" />
              <span>Configurar Email</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Phone className="h-6 w-6 mb-2" />
              <span>Integrar WhatsApp</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Gerenciar Agentes</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <MessageSquare className="h-6 w-6 mb-2" />
              <span>Templates</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## ✅ **CHECKLIST DE CONCLUSÃO**

### **Chatwoot Configuration**
- [ ] Chatwoot service implementado
- [ ] API integration funcionando
- [ ] Webhook processing ativo
- [ ] SMTP configuration validada
- [ ] Multi-inbox setup funcionando

### **Omnichannel Integration**
- [ ] WhatsApp channel connected
- [ ] Email inbox configured
- [ ] Web chat widget implementado
- [ ] API channel funcionando
- [ ] Contact synchronization ativa

### **Agent Management**
- [ ] Agent dashboard funcionando
- [ ] Assignment rules configuradas
- [ ] Team management implementado
- [ ] Availability status tracking
- [ ] Performance metrics ativas

### **Customer Features**
- [ ] Chat widget customizado
- [ ] Mobile responsive design
- [ ] Offline message handling
- [ ] File sharing funcionando
- [ ] Customer satisfaction surveys

### **Analytics & Reporting**
- [ ] Conversation metrics tracking
- [ ] Response time monitoring
- [ ] Agent performance reports
- [ ] Customer satisfaction metrics
- [ ] Integration with Metabase

---

**✅ PARTE 37 CONCLUÍDA - CHATWOOT ATENDIMENTO INTEGRADO**

*Próxima Parte: 38 - Typebot Workflows*

---

*📅 Parte 37 de 50 - KRYONIX SaaS Platform*  
*🔧 Agentes: Comunicação + Customer Success + UX/UI + API*  
*⏱️ Tempo Estimado: 2-3 dias*  
*🎯 Status: Pronto para Desenvolvimento*

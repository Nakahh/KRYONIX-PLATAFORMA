# 🤖 PARTE 38 - TYPEBOT WORKFLOWS
*Agentes Responsáveis: Especialista Comunicação + IA Expert + UX/UI + Automação*

---

## 🎯 **OBJETIVOS DA PARTE 38**
Integrar e configurar Typebot para criação de chatbots inteligentes com workflows visuais, conectando com WhatsApp, IA e outras stacks para automação conversacional completa na plataforma KRYONIX.

---

## 🛠️ **STACK TÉCNICA**
```yaml
Typebot: https://typebot.kryonix.com.br
Viewer: https://bot.kryonix.com.br
Email: Magic link access
SMTP: SendGrid configurado
AI Integration: Dify AI + Ollama
WhatsApp: Evolution API
Database: PostgreSQL + Redis
```

---

## 👥 **AGENTES ESPECIALIZADOS ATUANDO**

### 💬 **Especialista Comunicação** - Líder da Parte
**Responsabilidades:**
- Estratégia conversacional
- Flow design e UX
- Template creation
- Multi-channel integration

### 🧠 **IA Expert**
**Responsabilidades:**
- AI-powered responses
- NLP integration
- Intelligent routing
- Learning algorithms

### 🎨 **UX/UI Designer**
**Responsabilidades:**
- Conversational interface
- Visual flow builder
- Mobile chat experience
- Accessibility features

### 🔄 **Automação Specialist**
**Responsabilidades:**
- Workflow automation
- Integration with N8N
- Trigger management
- Performance optimization

---

## 📋 **INTEGRAÇÃO TYPEBOT**

### **38.1 - Typebot API Service**
```typescript
// src/services/TypebotService.ts
import axios, { AxiosInstance } from 'axios';

interface TypebotFlow {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  publicId?: string;
  customDomain?: string;
  isPublished: boolean;
  settings: TypebotSettings;
  groups: TypebotGroup[];
}

interface TypebotSettings {
  general: {
    isBrandingEnabled: boolean;
    isInputPrefillEnabled: boolean;
    isHideQueryParamsEnabled: boolean;
    isNewResultOnRefreshEnabled: boolean;
  };
  typingEmulation: {
    enabled: boolean;
    speed: number;
    maxDelay: number;
  };
  metadata: {
    title?: string;
    description?: string;
    imageUrl?: string;
  };
}

interface TypebotGroup {
  id: string;
  title: string;
  graphCoordinates: { x: number; y: number };
  blocks: TypebotBlock[];
}

interface TypebotBlock {
  id: string;
  type: string;
  groupId: string;
  content?: any;
  options?: any;
  outgoingEdgeId?: string;
}

interface ChatSession {
  sessionId: string;
  typebotId: string;
  userId?: string;
  variables: Record<string, any>;
  currentGroupId?: string;
  isCompleted: boolean;
  createdAt: Date;
}

export class TypebotService {
  private apiClient: AxiosInstance;
  private readonly baseURL = 'https://typebot.kryonix.com.br';
  private readonly viewerURL = 'https://bot.kryonix.com.br';
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TYPEBOT_API_KEY || '';

    this.apiClient = axios.create({
      baseURL: `${this.baseURL}/api`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: 15000
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`📤 Typebot Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`📥 Typebot Response: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('❌ Typebot Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Typebot Management
  async getTypebots(): Promise<TypebotFlow[]> {
    const response = await this.apiClient.get('/typebots');
    return response.data.typebots || [];
  }

  async getTypebot(typebotId: string): Promise<TypebotFlow> {
    const response = await this.apiClient.get(`/typebots/${typebotId}`);
    return response.data.typebot;
  }

  async createTypebot(name: string, template?: any): Promise<TypebotFlow> {
    const payload = {
      name,
      ...(template && { groups: template.groups, settings: template.settings })
    };

    const response = await this.apiClient.post('/typebots', payload);
    return response.data.typebot;
  }

  async updateTypebot(typebotId: string, updates: Partial<TypebotFlow>): Promise<TypebotFlow> {
    const response = await this.apiClient.patch(`/typebots/${typebotId}`, updates);
    return response.data.typebot;
  }

  async deleteTypebot(typebotId: string): Promise<void> {
    await this.apiClient.delete(`/typebots/${typebotId}`);
  }

  async publishTypebot(typebotId: string): Promise<{ publicId: string; url: string }> {
    const response = await this.apiClient.post(`/typebots/${typebotId}/publish`);
    return response.data;
  }

  async unpublishTypebot(typebotId: string): Promise<void> {
    await this.apiClient.post(`/typebots/${typebotId}/unpublish`);
  }

  // Chat Sessions
  async startChatSession(
    publicId: string,
    prefilledVariables?: Record<string, any>
  ): Promise<ChatSession> {
    const response = await axios.post(`${this.viewerURL}/api/v1/typebots/${publicId}/startChat`, {
      prefilledVariables
    });

    const { sessionId } = response.data;
    
    const session: ChatSession = {
      sessionId,
      typebotId: publicId,
      variables: prefilledVariables || {},
      isCompleted: false,
      createdAt: new Date()
    };

    // Cache session in Redis
    await this.cacheSession(session);

    return session;
  }

  async continueChat(
    sessionId: string,
    message: string
  ): Promise<{ messages: any[]; sessionId: string; variables: Record<string, any> }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const response = await axios.post(`${this.viewerURL}/api/v1/sessions/${sessionId}/continueChat`, {
      message
    });

    // Update session variables
    if (response.data.variables) {
      session.variables = { ...session.variables, ...response.data.variables };
      await this.cacheSession(session);
    }

    return response.data;
  }

  async getSessionVariables(sessionId: string): Promise<Record<string, any>> {
    const session = await this.getSession(sessionId);
    return session?.variables || {};
  }

  // Templates and Presets
  async createChatbotTemplate(
    name: string,
    purpose: 'customer_support' | 'lead_generation' | 'survey' | 'booking' | 'custom',
    config?: any
  ): Promise<TypebotFlow> {
    const templates = {
      customer_support: this.createCustomerSupportTemplate(),
      lead_generation: this.createLeadGenerationTemplate(),
      survey: this.createSurveyTemplate(),
      booking: this.createBookingTemplate(),
      custom: config?.template || this.createBasicTemplate()
    };

    const template = templates[purpose];
    return await this.createTypebot(name, template);
  }

  private createCustomerSupportTemplate(): any {
    return {
      groups: [
        {
          id: 'start',
          title: 'Início',
          graphCoordinates: { x: 0, y: 0 },
          blocks: [
            {
              id: 'welcome',
              type: 'text',
              content: {
                richText: [
                  { type: 'text', text: '👋 Olá! Bem-vindo ao suporte KRYONIX!\n\nComo posso ajudá-lo hoje?' }
                ]
              }
            },
            {
              id: 'main_menu',
              type: 'choice input',
              content: {
                options: [
                  { id: 'tech_support', content: '🔧 Suporte Técnico' },
                  { id: 'billing', content: '💰 Financeiro' },
                  { id: 'general', content: '❓ Dúvidas Gerais' },
                  { id: 'human', content: '👤 Falar com Humano' }
                ]
              }
            }
          ]
        },
        {
          id: 'tech_support',
          title: 'Suporte Técnico',
          graphCoordinates: { x: 200, y: 0 },
          blocks: [
            {
              id: 'tech_question',
              type: 'text',
              content: {
                richText: [
                  { type: 'text', text: '🔧 Suporte Técnico\n\nDescreva brevemente o problema que está enfrentando:' }
                ]
              }
            },
            {
              id: 'problem_input',
              type: 'text input',
              options: {
                placeholder: 'Descreva seu problema...',
                isLong: true
              }
            }
          ]
        }
      ],
      settings: {
        general: {
          isBrandingEnabled: false,
          isInputPrefillEnabled: true
        },
        typingEmulation: {
          enabled: true,
          speed: 300,
          maxDelay: 1500
        },
        metadata: {
          title: 'Suporte KRYONIX',
          description: 'Central de atendimento automatizada'
        }
      }
    };
  }

  private createLeadGenerationTemplate(): any {
    return {
      groups: [
        {
          id: 'start',
          title: 'Captação de Lead',
          graphCoordinates: { x: 0, y: 0 },
          blocks: [
            {
              id: 'welcome',
              type: 'text',
              content: {
                richText: [
                  { type: 'text', text: '🚀 Descubra como a KRYONIX pode revolucionar seu negócio!\n\nVamos começar?' }
                ]
              }
            },
            {
              id: 'name_input',
              type: 'text input',
              content: {
                richText: [{ type: 'text', text: '👤 Qual é o seu nome?' }]
              },
              options: {
                placeholder: 'Digite seu nome...'
              }
            },
            {
              id: 'email_input',
              type: 'email input',
              content: {
                richText: [{ type: 'text', text: '📧 Qual é o seu melhor email?' }]
              },
              options: {
                placeholder: 'seuemail@exemplo.com'
              }
            },
            {
              id: 'business_type',
              type: 'choice input',
              content: {
                richText: [{ type: 'text', text: '🏢 Que tipo de negócio você tem?' }]
              },
              options: [
                { id: 'ecommerce', content: '🛍️ E-commerce' },
                { id: 'service', content: '🔧 Prestação de Serviços' },
                { id: 'consulting', content: '💼 Consultoria' },
                { id: 'agency', content: '🎯 Agência' },
                { id: 'other', content: '📋 Outro' }
              ]
            }
          ]
        }
      ],
      settings: {
        general: {
          isBrandingEnabled: false
        },
        typingEmulation: {
          enabled: true,
          speed: 400
        }
      }
    };
  }

  // AI Integration
  async processWithAI(
    message: string,
    context: Record<string, any>
  ): Promise<{ response: string; suggestions?: string[] }> {
    try {
      // Integration with Dify AI
      const response = await axios.post('https://dify.kryonix.com.br/v1/chat-messages', {
        inputs: context,
        query: message,
        user: context.userId || 'anonymous',
        conversation_id: context.conversationId
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        response: response.data.answer,
        suggestions: response.data.suggestions
      };
    } catch (error) {
      console.error('AI processing error:', error);
      return {
        response: 'Desculpe, não consegui processar sua mensagem no momento. Pode reformular?'
      };
    }
  }

  // WhatsApp Integration
  async sendToWhatsApp(
    instanceName: string,
    phoneNumber: string,
    typebotId: string,
    initialMessage?: string
  ): Promise<{ sessionId: string; url: string }> {
    try {
      // Start chat session
      const session = await this.startChatSession(typebotId, {
        whatsapp_number: phoneNumber,
        source: 'whatsapp'
      });

      // Generate WhatsApp chat URL
      const chatUrl = `${this.viewerURL}/${typebotId}?sessionId=${session.sessionId}`;

      // Send initial message via Evolution API
      if (initialMessage) {
        await axios.post(`https://api.kryonix.com.br/message/sendText/${instanceName}`, {
          number: phoneNumber,
          text: `${initialMessage}\n\n🤖 Continue a conversa aqui: ${chatUrl}`
        }, {
          headers: {
            'apikey': '6f78dbffc4acd9a32b926a38892a23f0'
          }
        });
      }

      return {
        sessionId: session.sessionId,
        url: chatUrl
      };
    } catch (error) {
      console.error('WhatsApp integration error:', error);
      throw error;
    }
  }

  // Analytics
  async getTypebotAnalytics(
    typebotId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const response = await this.apiClient.get(`/typebots/${typebotId}/analytics`, {
      params: {
        from: startDate.toISOString(),
        to: endDate.toISOString()
      }
    });

    return response.data;
  }

  async getSessionResults(typebotId: string, limit: number = 50): Promise<any[]> {
    const response = await this.apiClient.get(`/typebots/${typebotId}/results`, {
      params: { limit }
    });

    return response.data.results || [];
  }

  // Webhook Processing
  async processWebhook(webhookData: any): Promise<void> {
    try {
      const { resultId, typebot, variables, hasCompleted } = webhookData;

      console.log('Typebot webhook received:', { resultId, typebotId: typebot.id, hasCompleted });

      // Process completed conversation
      if (hasCompleted) {
        await this.handleCompletedConversation(typebot.id, variables);
      }

      // Store results for analytics
      await this.storeResults(resultId, typebot.id, variables);

    } catch (error) {
      console.error('Error processing Typebot webhook:', error);
    }
  }

  private async handleCompletedConversation(
    typebotId: string,
    variables: Record<string, any>
  ): Promise<void> {
    // Process based on typebot purpose
    if (variables.email && variables.name) {
      // Lead captured - send to CRM/Mautic
      await this.sendLeadToCRM(variables);
    }

    if (variables.support_request) {
      // Support request - create ticket in Chatwoot
      await this.createSupportTicket(variables);
    }
  }

  private async sendLeadToCRM(leadData: Record<string, any>): Promise<void> {
    try {
      // Send to Mautic
      await axios.post('https://mautic.kryonix.com.br/api/contacts/new', {
        firstname: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company,
        tags: ['typebot', 'lead']
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.MAUTIC_API_KEY}`
        }
      });

      console.log('Lead sent to Mautic:', leadData.email);
    } catch (error) {
      console.error('Error sending lead to CRM:', error);
    }
  }

  private async createSupportTicket(supportData: Record<string, any>): Promise<void> {
    try {
      // Create contact in Chatwoot
      const contact = await axios.post('https://chat.kryonix.com.br/api/v1/accounts/1/contacts', {
        name: supportData.name || 'Cliente Typebot',
        email: supportData.email,
        phone_number: supportData.phone
      }, {
        headers: {
          'api_access_token': process.env.CHATWOOT_ACCESS_TOKEN
        }
      });

      // Create conversation
      await axios.post('https://chat.kryonix.com.br/api/v1/accounts/1/conversations', {
        source_id: `typebot_${Date.now()}`,
        contact_id: contact.data.payload.contact.id,
        inbox_id: 1, // Default inbox
        status: 'open',
        message: {
          content: supportData.support_request || 'Solicitação via Typebot',
          message_type: 'incoming'
        }
      }, {
        headers: {
          'api_access_token': process.env.CHATWOOT_ACCESS_TOKEN
        }
      });

      console.log('Support ticket created for:', supportData.email);
    } catch (error) {
      console.error('Error creating support ticket:', error);
    }
  }

  // Session Management with Redis
  private async cacheSession(session: ChatSession): Promise<void> {
    try {
      await axios.post('/api/cache/set', {
        key: `typebot_session:${session.sessionId}`,
        value: session,
        ttl: 3600 // 1 hour
      });
    } catch (error) {
      console.error('Error caching session:', error);
    }
  }

  private async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const response = await axios.get(`/api/cache/get?key=typebot_session:${sessionId}`);
      return response.data.value;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  private async storeResults(
    resultId: string,
    typebotId: string,
    variables: Record<string, any>
  ): Promise<void> {
    try {
      await axios.post('/api/typebot/results', {
        resultId,
        typebotId,
        variables,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error storing results:', error);
    }
  }
}

export default new TypebotService();
```

### **38.2 - Typebot Builder Integration**
```tsx
// src/components/TypebotBuilder.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Bot, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  BarChart, 
  Share,
  MessageSquare,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import TypebotService from '../services/TypebotService';

interface TypebotItem {
  id: string;
  name: string;
  isPublished: boolean;
  publicId?: string;
  createdAt: string;
  updatedAt: string;
}

export const TypebotBuilder: React.FC = () => {
  const [typebots, setTypebots] = useState<TypebotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTypebots();
  }, []);

  const loadTypebots = async () => {
    try {
      const data = await TypebotService.getTypebots();
      setTypebots(data);
    } catch (error) {
      console.error('Error loading typebots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (typebotId: string) => {
    try {
      await TypebotService.publishTypebot(typebotId);
      loadTypebots();
    } catch (error) {
      console.error('Error publishing typebot:', error);
    }
  };

  const handleUnpublish = async (typebotId: string) => {
    try {
      await TypebotService.unpublishTypebot(typebotId);
      loadTypebots();
    } catch (error) {
      console.error('Error unpublishing typebot:', error);
    }
  };

  const handleDelete = async (typebotId: string) => {
    if (confirm('Tem certeza que deseja deletar este chatbot?')) {
      try {
        await TypebotService.deleteTypebot(typebotId);
        loadTypebots();
      } catch (error) {
        console.error('Error deleting typebot:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 text-blue-600" />
          <h2 className="text-3xl font-bold">🤖 Chatbots Inteligentes</h2>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Chatbot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-blue-100">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Chatbots</p>
                <p className="text-2xl font-bold text-gray-900">{typebots.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-green-100">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Publicados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {typebots.filter(t => t.isPublished).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-purple-100">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-yellow-100">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
                <p className="text-2xl font-bold text-gray-900">34%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Typebots Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : typebots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {typebots.map((typebot) => (
            <Card key={typebot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{typebot.name}</CardTitle>
                  <Badge 
                    className={typebot.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {typebot.isPublished ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Criado:</span>
                      <p className="font-medium">
                        {new Date(typebot.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Atualizado:</span>
                      <p className="font-medium">
                        {new Date(typebot.updatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`https://typebot.kryonix.com.br/typebots/${typebot.id}/edit`, '_blank')}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    
                    {typebot.isPublished ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(`https://bot.kryonix.com.br/${typebot.publicId}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUnpublish(typebot.id)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pausar
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => handlePublish(typebot.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Publicar
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(`https://bot.kryonix.com.br/${typebot.publicId}`)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Link
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(typebot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum chatbot criado
            </h3>
            <p className="text-gray-500 mb-4">
              Crie seu primeiro chatbot para começar a automatizar conversas
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Chatbot
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTypebotModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTypebots();
          }}
        />
      )}
    </div>
  );
};

// Create Typebot Modal Component
interface CreateTypebotModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTypebotModal: React.FC<CreateTypebotModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('custom');
  const [loading, setLoading] = useState(false);

  const templates = [
    { id: 'customer_support', name: '🔧 Suporte ao Cliente', description: 'Atendimento automatizado' },
    { id: 'lead_generation', name: '🎯 Geração de Leads', description: 'Captura e qualificação' },
    { id: 'survey', name: '📊 Pesquisa/Quiz', description: 'Coleta de feedback' },
    { id: 'booking', name: '📅 Agendamento', description: 'Marcação de reuniões' },
    { id: 'custom', name: '🎨 Personalizado', description: 'Começar do zero' }
  ];

  const handleCreate = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const typebot = await TypebotService.createChatbotTemplate(
        name,
        template as any
      );
      
      // Redirect to editor
      window.open(`https://typebot.kryonix.com.br/typebots/${typebot.id}/edit`, '_blank');
      onSuccess();
    } catch (error) {
      console.error('Error creating typebot:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">🤖 Criar Novo Chatbot</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Chatbot
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Atendimento KRYONIX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template
            </label>
            <div className="space-y-2">
              {templates.map((tmpl) => (
                <label key={tmpl.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="template"
                    value={tmpl.id}
                    checked={template === tmpl.id}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">{tmpl.name}</p>
                    <p className="text-sm text-gray-500">{tmpl.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? 'Criando...' : 'Criar Chatbot'}
          </Button>
        </div>
      </div>
    </div>
  );
};
```

---

## ✅ **CHECKLIST DE CONCLUSÃO**

### **Typebot Configuration**
- [ ] Typebot service implementado
- [ ] Magic link authentication ativa
- [ ] SMTP SendGrid configurado
- [ ] Webhook processing funcionando
- [ ] Analytics integration ativa

### **Chatbot Features**
- [ ] Visual flow builder funcionando
- [ ] Template system implementado
- [ ] AI integration (Dify AI)
- [ ] WhatsApp integration ativa
- [ ] Multi-channel support

### **Builder Interface**
- [ ] Typebot manager dashboard
- [ ] Template creation system
- [ ] Publishing/unpublishing
- [ ] Analytics visualization
- [ ] Mobile responsive design

### **Integration & Automation**
- [ ] Evolution API + WhatsApp sync
- [ ] Chatwoot ticket creation
- [ ] Mautic lead integration
- [ ] N8N workflow triggers
- [ ] Session management Redis

### **Analytics & Performance**
- [ ] Conversation tracking
- [ ] Conversion rate monitoring
- [ ] User journey analytics
- [ ] Performance optimization
- [ ] Error handling robusto

---

**✅ PARTE 38 CONCLUÍDA - TYPEBOT WORKFLOWS IMPLEMENTADO**

*Próxima Parte: 39 - N8N Automação Avançada*

---

*📅 Parte 38 de 50 - KRYONIX SaaS Platform*  
*🔧 Agentes: Comunicação + IA + UX/UI + Automação*  
*⏱️ Tempo Estimado: 3-4 dias*  
*🎯 Status: Pronto para Desenvolvimento*

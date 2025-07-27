# 📱 PARTE 36 - EVOLUTION API (WHATSAPP)
*Agentes Responsáveis: Especialista Comunicação + API Integration + Mobile + Backend*

---

## 🎯 **OBJETIVOS DA PARTE 36**
Integrar completamente a Evolution API já configurada para gerenciamento avançado de WhatsApp, permitindo envio de mensagens, mídia, chatbots, automações e atendimento multicanal na plataforma KRYONIX SaaS.

---

## 🛠️ **STACK TÉCNICA**
```yaml
Evolution API: https://api.kryonix.com.br
Manager: https://api.kryonix.com.br/manager
Global API Key: 6f78dbffc4acd9a32b926a38892a23f0
Webhook: Integração com N8N e Typebot
Database: PostgreSQL para logs e histórico
Storage: MinIO para mídias
```

---

## 👥 **AGENTES ESPECIALIZADOS ATUANDO**

### 📱 **Especialista Comunicação** - Líder da Parte
**Responsabilidades:**
- Estratégia de comunicação WhatsApp
- UX de conversas e fluxos
- Templates de mensagens
- Compliance WhatsApp Business

### 🔌 **API Integration Specialist**
**Responsabilidades:**
- Evolution API integration
- Webhook management
- Real-time messaging
- Error handling & retry logic

### 📱 **Mobile Expert**
**Responsabilidades:**
- Mobile interface for WhatsApp
- Push notifications
- Offline message handling
- Cross-platform compatibility

### 🏗️ **Backend Specialist**
**Responsabilidades:**
- Message queue management
- Database optimization
- File handling
- Performance optimization

---

## 📋 **INTEGRAÇÃO EVOLUTION API**

### **36.1 - Evolution API Client Service**
```typescript
// src/services/EvolutionAPIService.ts
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { EventEmitter } from 'events';

interface WhatsAppInstance {
  instanceName: string;
  status: 'connecting' | 'open' | 'closed';
  qrCode?: string;
  profilePicUrl?: string;
  phone?: string;
}

interface MessagePayload {
  number: string;
  text?: string;
  mediaUrl?: string;
  fileName?: string;
  caption?: string;
  delay?: number;
}

interface WebhookData {
  event: string;
  instance: string;
  data: any;
  server_url: string;
  apikey: string;
}

export class EvolutionAPIService extends EventEmitter {
  private apiClient: AxiosInstance;
  private readonly baseURL = 'https://api.kryonix.com.br';
  private readonly globalApiKey = '6f78dbffc4acd9a32b926a38892a23f0';
  private instances: Map<string, WhatsAppInstance> = new Map();

  constructor() {
    super();
    
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.globalApiKey
      },
      timeout: 30000
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`📤 Evolution API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`📥 Evolution API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Evolution API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Criar nova instância WhatsApp
  async createInstance(instanceName: string, config?: any): Promise<WhatsAppInstance> {
    try {
      const payload = {
        instanceName,
        token: instanceName, // Token único por instância
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        ...config
      };

      const response = await this.apiClient.post('/instance/create', payload);
      
      if (response.data.error) {
        throw new Error(response.data.message);
      }

      const instance: WhatsAppInstance = {
        instanceName,
        status: 'connecting',
        qrCode: response.data.qrcode?.code
      };

      this.instances.set(instanceName, instance);
      this.emit('instanceCreated', instance);

      return instance;
    } catch (error) {
      console.error('Error creating instance:', error);
      throw error;
    }
  }

  // Obter QR Code da instância
  async getQRCode(instanceName: string): Promise<string | null> {
    try {
      const response = await this.apiClient.get(`/instance/connect/${instanceName}`);
      
      if (response.data.qrcode) {
        const instance = this.instances.get(instanceName);
        if (instance) {
          instance.qrCode = response.data.qrcode.code;
          this.instances.set(instanceName, instance);
        }
        
        return response.data.qrcode.code;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting QR code:', error);
      return null;
    }
  }

  // Verificar status da instância
  async getInstanceStatus(instanceName: string): Promise<WhatsAppInstance | null> {
    try {
      const response = await this.apiClient.get(`/instance/connectionState/${instanceName}`);
      
      const instance = this.instances.get(instanceName) || { instanceName, status: 'closed' };
      instance.status = response.data.state || 'closed';
      
      this.instances.set(instanceName, instance);
      
      return instance;
    } catch (error) {
      console.error('Error getting instance status:', error);
      return null;
    }
  }

  // Enviar mensagem de texto
  async sendTextMessage(
    instanceName: string,
    number: string,
    text: string,
    options?: { delay?: number }
  ): Promise<any> {
    try {
      const payload = {
        number: this.formatPhoneNumber(number),
        text,
        delay: options?.delay || 0
      };

      const response = await this.apiClient.post(
        `/message/sendText/${instanceName}`,
        payload
      );

      // Log da mensagem
      await this.logMessage({
        instanceName,
        type: 'text',
        to: number,
        content: text,
        status: 'sent',
        messageId: response.data.key?.id
      });

      return response.data;
    } catch (error) {
      await this.logMessage({
        instanceName,
        type: 'text',
        to: number,
        content: text,
        status: 'failed',
        error: error.message
      });
      
      throw error;
    }
  }

  // Enviar mídia (imagem, vídeo, áudio, documento)
  async sendMediaMessage(
    instanceName: string,
    number: string,
    mediaUrl: string,
    options?: {
      caption?: string;
      fileName?: string;
      delay?: number;
    }
  ): Promise<any> {
    try {
      const payload = {
        number: this.formatPhoneNumber(number),
        mediaUrl,
        caption: options?.caption,
        fileName: options?.fileName,
        delay: options?.delay || 0
      };

      const response = await this.apiClient.post(
        `/message/sendMedia/${instanceName}`,
        payload
      );

      await this.logMessage({
        instanceName,
        type: 'media',
        to: number,
        content: mediaUrl,
        caption: options?.caption,
        status: 'sent',
        messageId: response.data.key?.id
      });

      return response.data;
    } catch (error) {
      await this.logMessage({
        instanceName,
        type: 'media',
        to: number,
        content: mediaUrl,
        status: 'failed',
        error: error.message
      });
      
      throw error;
    }
  }

  // Upload de arquivo para MinIO e envio
  async uploadAndSendMedia(
    instanceName: string,
    number: string,
    file: Buffer,
    fileName: string,
    options?: {
      caption?: string;
      delay?: number;
    }
  ): Promise<any> {
    try {
      // Upload para MinIO primeiro
      const formData = new FormData();
      formData.append('file', file, fileName);

      const uploadResponse = await axios.post(
        'https://storage.kryonix.com.br/upload',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.globalApiKey}`
          }
        }
      );

      const mediaUrl = uploadResponse.data.url;

      // Enviar via WhatsApp
      return await this.sendMediaMessage(instanceName, number, mediaUrl, {
        caption: options?.caption,
        fileName,
        delay: options?.delay
      });

    } catch (error) {
      console.error('Error uploading and sending media:', error);
      throw error;
    }
  }

  // Enviar mensagem com botões
  async sendButtonMessage(
    instanceName: string,
    number: string,
    text: string,
    buttons: Array<{ id: string; text: string }>
  ): Promise<any> {
    try {
      const payload = {
        number: this.formatPhoneNumber(number),
        text,
        buttons: buttons.map((btn, index) => ({
          buttonId: btn.id,
          buttonText: { displayText: btn.text },
          type: 1
        }))
      };

      const response = await this.apiClient.post(
        `/message/sendButtons/${instanceName}`,
        payload
      );

      await this.logMessage({
        instanceName,
        type: 'buttons',
        to: number,
        content: text,
        buttons: buttons,
        status: 'sent',
        messageId: response.data.key?.id
      });

      return response.data;
    } catch (error) {
      console.error('Error sending button message:', error);
      throw error;
    }
  }

  // Obter contatos da instância
  async getContacts(instanceName: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`/chat/findContacts/${instanceName}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  // Obter conversas da instância
  async getChats(instanceName: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get(`/chat/findChats/${instanceName}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  }

  // Obter mensagens de uma conversa
  async getChatMessages(
    instanceName: string,
    chatId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const response = await this.apiClient.get(
        `/chat/findMessages/${instanceName}?chatId=${chatId}&limit=${limit}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  // Configurar webhook
  async setWebhook(instanceName: string, webhookUrl: string, events?: string[]): Promise<any> {
    try {
      const payload = {
        url: webhookUrl,
        events: events || [
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE', 
          'MESSAGES_DELETE',
          'SEND_MESSAGE',
          'CONTACTS_UPDATE',
          'CHATS_UPDATE',
          'CONNECTION_UPDATE'
        ]
      };

      const response = await this.apiClient.post(
        `/webhook/set/${instanceName}`,
        payload
      );

      return response.data;
    } catch (error) {
      console.error('Error setting webhook:', error);
      throw error;
    }
  }

  // Processar webhook recebido
  async processWebhook(webhookData: WebhookData): Promise<void> {
    try {
      const { event, instance, data } = webhookData;

      console.log(`📨 Webhook received: ${event} for ${instance}`);

      switch (event) {
        case 'MESSAGES_UPSERT':
          await this.handleIncomingMessage(instance, data);
          break;
          
        case 'CONNECTION_UPDATE':
          await this.handleConnectionUpdate(instance, data);
          break;
          
        case 'QRCODE_UPDATED':
          await this.handleQRCodeUpdate(instance, data);
          break;
          
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      this.emit('webhook', { event, instance, data });
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  // Manipular mensagem recebida
  private async handleIncomingMessage(instanceName: string, messageData: any): Promise<void> {
    const message = messageData.messages?.[0];
    if (!message) return;

    const from = message.key.remoteJid;
    const text = message.message?.conversation || 
                 message.message?.extendedTextMessage?.text || '';

    await this.logMessage({
      instanceName,
      type: 'received',
      from,
      content: text,
      status: 'received',
      messageId: message.key.id,
      timestamp: new Date(message.messageTimestamp * 1000)
    });

    // Emitir evento para integração com chatbots
    this.emit('messageReceived', {
      instanceName,
      from,
      text,
      message
    });
  }

  // Manipular atualização de conexão
  private async handleConnectionUpdate(instanceName: string, connectionData: any): Promise<void> {
    const state = connectionData.state;
    
    const instance = this.instances.get(instanceName);
    if (instance) {
      instance.status = state;
      this.instances.set(instanceName, instance);
    }

    this.emit('connectionUpdate', { instanceName, state });
  }

  // Manipular atualização de QR Code
  private async handleQRCodeUpdate(instanceName: string, qrData: any): Promise<void> {
    const qrCode = qrData.qrcode;
    
    const instance = this.instances.get(instanceName);
    if (instance) {
      instance.qrCode = qrCode;
      this.instances.set(instanceName, instance);
    }

    this.emit('qrCodeUpdate', { instanceName, qrCode });
  }

  // Deletar instância
  async deleteInstance(instanceName: string): Promise<any> {
    try {
      const response = await this.apiClient.delete(`/instance/delete/${instanceName}`);
      
      this.instances.delete(instanceName);
      this.emit('instanceDeleted', { instanceName });
      
      return response.data;
    } catch (error) {
      console.error('Error deleting instance:', error);
      throw error;
    }
  }

  // Desconectar instância
  async disconnectInstance(instanceName: string): Promise<any> {
    try {
      const response = await this.apiClient.delete(`/instance/logout/${instanceName}`);
      
      const instance = this.instances.get(instanceName);
      if (instance) {
        instance.status = 'closed';
        this.instances.set(instanceName, instance);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error disconnecting instance:', error);
      throw error;
    }
  }

  // Helpers
  private formatPhoneNumber(number: string): string {
    // Remove caracteres especiais e adiciona código do país se necessário
    const cleaned = number.replace(/\D/g, '');
    
    if (cleaned.length === 11 && cleaned.startsWith('55')) {
      return cleaned;
    } else if (cleaned.length === 11) {
      return `55${cleaned}`;
    } else if (cleaned.length === 10) {
      return `55${cleaned}`;
    }
    
    return cleaned;
  }

  private async logMessage(messageLog: any): Promise<void> {
    try {
      // Salvar log no PostgreSQL
      await fetch('/api/whatsapp/message-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageLog,
          timestamp: new Date()
        })
      });
    } catch (error) {
      console.error('Error logging message:', error);
    }
  }

  // Obter todas as instâncias
  getInstances(): WhatsAppInstance[] {
    return Array.from(this.instances.values());
  }

  // Obter instância específica
  getInstance(instanceName: string): WhatsAppInstance | undefined {
    return this.instances.get(instanceName);
  }
}

// Singleton instance
export default new EvolutionAPIService();
```

### **36.2 - WhatsApp Manager Interface**
```tsx
// src/components/WhatsAppManager.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Smartphone, 
  QrCode, 
  MessageCircle, 
  Users, 
  Plus,
  Settings,
  Trash2,
  RefreshCw,
  Send,
  Image,
  Paperclip,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import QRCodeComponent from 'qrcode.react';
import EvolutionAPIService from '../services/EvolutionAPIService';

interface WhatsAppInstance {
  instanceName: string;
  status: 'connecting' | 'open' | 'closed';
  qrCode?: string;
  profilePicUrl?: string;
  phone?: string;
}

export const WhatsAppManager: React.FC = () => {
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);

  useEffect(() => {
    loadInstances();
    setupEventListeners();
    
    // Atualizar status a cada 10 segundos
    const interval = setInterval(loadInstances, 10000);
    return () => clearInterval(interval);
  }, []);

  const setupEventListeners = () => {
    EvolutionAPIService.on('instanceCreated', handleInstanceUpdate);
    EvolutionAPIService.on('connectionUpdate', handleConnectionUpdate);
    EvolutionAPIService.on('qrCodeUpdate', handleQRCodeUpdate);
    
    return () => {
      EvolutionAPIService.removeAllListeners();
    };
  };

  const loadInstances = async () => {
    try {
      // Carregar instâncias do serviço
      const instancesData = EvolutionAPIService.getInstances();
      
      // Atualizar status de cada instância
      const updatedInstances = await Promise.all(
        instancesData.map(async (instance) => {
          const status = await EvolutionAPIService.getInstanceStatus(instance.instanceName);
          return status || instance;
        })
      );
      
      setInstances(updatedInstances);
    } catch (error) {
      console.error('Error loading instances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstanceUpdate = (instance: WhatsAppInstance) => {
    setInstances(prev => {
      const index = prev.findIndex(i => i.instanceName === instance.instanceName);
      if (index >= 0) {
        prev[index] = instance;
        return [...prev];
      } else {
        return [...prev, instance];
      }
    });
  };

  const handleConnectionUpdate = ({ instanceName, state }: any) => {
    setInstances(prev => prev.map(instance => 
      instance.instanceName === instanceName 
        ? { ...instance, status: state }
        : instance
    ));
  };

  const handleQRCodeUpdate = ({ instanceName, qrCode }: any) => {
    setInstances(prev => prev.map(instance => 
      instance.instanceName === instanceName 
        ? { ...instance, qrCode }
        : instance
    ));
  };

  const createInstance = async () => {
    if (!newInstanceName.trim()) return;
    
    try {
      setLoading(true);
      await EvolutionAPIService.createInstance(newInstanceName);
      
      setNewInstanceName('');
      setShowCreateForm(false);
      
      // Aguardar um pouco e recarregar
      setTimeout(loadInstances, 2000);
    } catch (error) {
      console.error('Error creating instance:', error);
      alert('Erro ao criar instância: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteInstance = async (instanceName: string) => {
    if (!confirm(`Tem certeza que deseja deletar a instância "${instanceName}"?`)) {
      return;
    }
    
    try {
      await EvolutionAPIService.deleteInstance(instanceName);
      setInstances(prev => prev.filter(i => i.instanceName !== instanceName));
    } catch (error) {
      console.error('Error deleting instance:', error);
      alert('Erro ao deletar instância: ' + error.message);
    }
  };

  const disconnectInstance = async (instanceName: string) => {
    try {
      await EvolutionAPIService.disconnectInstance(instanceName);
      await loadInstances();
    } catch (error) {
      console.error('Error disconnecting instance:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'connecting':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Conectado';
      case 'connecting':
        return 'Conectando';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Smartphone className="h-6 w-6 text-green-600" />
          <h2 className="text-3xl font-bold">📱 WhatsApp Manager</h2>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadInstances} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Instância
          </Button>
        </div>
      </div>

      {/* Create Instance Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Instância WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Nome da instância (ex: atendimento-kryonix)"
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && createInstance()}
              />
              <Button onClick={createInstance} disabled={loading}>
                Criar
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instances Grid */}
      {loading && instances.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : instances.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <Card key={instance.instanceName} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{instance.instanceName}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(instance.status)}
                    <Badge className={getStatusColor(instance.status)}>
                      {getStatusText(instance.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* QR Code */}
                {instance.status === 'connecting' && instance.qrCode && (
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Escaneie o QR Code no WhatsApp
                    </p>
                    <div className="inline-block p-2 bg-white rounded border">
                      <QRCodeComponent
                        value={instance.qrCode}
                        size={150}
                        level="M"
                        includeMargin
                      />
                    </div>
                  </div>
                )}

                {/* Connected Info */}
                {instance.status === 'open' && (
                  <div className="mb-4">
                    {instance.profilePicUrl && (
                      <img
                        src={instance.profilePicUrl}
                        alt="Profile"
                        className="w-12 h-12 rounded-full mx-auto mb-2"
                      />
                    )}
                    {instance.phone && (
                      <p className="text-center text-sm text-gray-600">
                        {instance.phone}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {instance.status === 'open' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedInstance(instance.instanceName)}
                        className="flex-1"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => disconnectInstance(instance.instanceName)}
                      >
                        Desconectar
                      </Button>
                    </>
                  )}
                  
                  {instance.status === 'connecting' && (
                    <Button 
                      size="sm" 
                      onClick={() => EvolutionAPIService.getQRCode(instance.instanceName)}
                      className="flex-1"
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      Novo QR
                    </Button>
                  )}
                  
                  {instance.status === 'closed' && (
                    <Button 
                      size="sm"
                      onClick={() => EvolutionAPIService.createInstance(instance.instanceName)}
                      className="flex-1"
                    >
                      Reconectar
                    </Button>
                  )}

                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deleteInstance(instance.instanceName)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma instância WhatsApp
            </h3>
            <p className="text-gray-500 mb-4">
              Crie sua primeira instância para começar a usar o WhatsApp
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Instância
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Chat Interface Modal */}
      {selectedInstance && (
        <WhatsAppChatInterface
          instanceName={selectedInstance}
          onClose={() => setSelectedInstance(null)}
        />
      )}
    </div>
  );
};

// src/components/WhatsAppChatInterface.tsx
interface WhatsAppChatInterfaceProps {
  instanceName: string;
  onClose: () => void;
}

const WhatsAppChatInterface: React.FC<WhatsAppChatInterfaceProps> = ({
  instanceName,
  onClose
}) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, [instanceName]);

  const loadChats = async () => {
    try {
      const chatsData = await EvolutionAPIService.getChats(instanceName);
      setChats(chatsData);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const messagesData = await EvolutionAPIService.getChatMessages(instanceName, chatId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await EvolutionAPIService.sendTextMessage(
        instanceName,
        selectedChat.id,
        newMessage
      );
      
      setNewMessage('');
      loadMessages(selectedChat.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-3/4 flex">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Conversas</h3>
              <Button size="sm" variant="outline" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setSelectedChat(chat);
                  loadMessages(chat.id);
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{chat.name || chat.id}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage?.text || 'Sem mensagens'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium">{selectedChat.name || selectedChat.id}</h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.fromMe
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{message.text}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Selecione uma conversa para começar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## ✅ **CHECKLIST DE CONCLUSÃO**

### **Evolution API Integration**
- [ ] Evolution API service implementado
- [ ] Instance management funcionando
- [ ] QR Code generation ativo
- [ ] Message sending/receiving
- [ ] Webhook processing implementado

### **WhatsApp Features**
- [ ] Text messages funcionando
- [ ] Media messages (image/video/audio)
- [ ] Button messages implementado
- [ ] Contact management
- [ ] Chat history access

### **UI Components**
- [ ] WhatsApp Manager interface
- [ ] Instance creation/management
- [ ] QR Code display
- [ ] Chat interface implementada
- [ ] Mobile responsive design

### **Integration & Automation**
- [ ] N8N webhook integration
- [ ] Typebot chatbot connection
- [ ] Message logging no PostgreSQL
- [ ] File storage no MinIO
- [ ] Real-time events funcionando

### **Monitoring & Reliability**
- [ ] Connection status monitoring
- [ ] Error handling robusto
- [ ] Retry mechanisms
- [ ] Performance logging
- [ ] Health checks implementados

---

**✅ PARTE 36 CONCLUÍDA - EVOLUTION API WHATSAPP INTEGRADA**

*Próxima Parte: 37 - Chatwoot (Atendimento)*

---

*📅 Parte 36 de 50 - KRYONIX SaaS Platform*  
*🔧 Agentes: Comunicação + API + Mobile + Backend*  
*⏱️ Tempo Estimado: 3-4 dias*  
*🎯 Status: Pronto para Desenvolvimento*

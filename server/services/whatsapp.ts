import axios, { AxiosInstance } from "axios";
import { AppDataSource } from "../db/connection";
import {
  WhatsAppInstance,
  InstanceStatus,
  InstanceType,
} from "../entities/WhatsAppInstance";
import {
  Message,
  MessageDirection,
  MessageType,
  MessageStatus,
} from "../entities/Message";
import { Tenant } from "../entities/Tenant";

// Evolution API Types
interface EvolutionAPIConfig {
  baseURL: string;
  apiKey: string;
}

interface CreateInstanceRequest {
  instanceName: string;
  token?: string;
  qrcode?: boolean;
  webhook?: string;
  webhookByEvents?: boolean;
  events?: string[];
}

interface SendMessageRequest {
  number: string;
  text?: string;
  media?: {
    mediatype: "image" | "video" | "audio" | "document";
    media: string; // base64 or URL
    caption?: string;
    filename?: string;
  };
  template?: {
    name: string;
    language: string;
    components?: any[];
  };
}

interface WebhookPayload {
  instance: string;
  data: {
    key?: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message?: any;
    messageTimestamp?: number;
    status?: string;
    participant?: string;
  };
  type: string;
  event: string;
}

export class WhatsAppService {
  private static instances = new Map<string, AxiosInstance>();
  private static connections = new Map<string, WhatsAppInstance>();

  // Evolution API Configuration
  private static getEvolutionClient(
    serverUrl: string,
    apiKey: string,
  ): AxiosInstance {
    const clientKey = `${serverUrl}_${apiKey}`;

    if (!this.instances.has(clientKey)) {
      const client = axios.create({
        baseURL: serverUrl,
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      // Request interceptor for logging
      client.interceptors.request.use(
        (config) => {
          console.log(
            `Evolution API Request: ${config.method?.toUpperCase()} ${config.url}`,
          );
          return config;
        },
        (error) => {
          console.error("Evolution API Request Error:", error);
          return Promise.reject(error);
        },
      );

      // Response interceptor for error handling
      client.interceptors.response.use(
        (response) => {
          console.log(
            `Evolution API Response: ${response.status} ${response.config.url}`,
          );
          return response;
        },
        (error) => {
          console.error(
            "Evolution API Error:",
            error.response?.data || error.message,
          );
          return Promise.reject(error);
        },
      );

      this.instances.set(clientKey, client);
    }

    return this.instances.get(clientKey)!;
  }

  // Instance Management
  static async createInstance(
    tenantId: string,
    instanceData: {
      name: string;
      phoneNumber: string;
      type: InstanceType;
      serverUrl?: string;
      apiToken?: string;
      webhookUrl?: string;
    },
  ): Promise<WhatsAppInstance> {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }

    const instanceRepository = AppDataSource.getRepository(WhatsAppInstance);
    const tenantRepository = AppDataSource.getRepository(Tenant);

    // Verify tenant exists and has capacity
    const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error("Tenant not found");
    }

    if (!tenant.checkLimit("maxWhatsappInstances")) {
      throw new Error("WhatsApp instance limit exceeded for this tenant");
    }

    // Check if phone number is already in use
    const existingInstance = await instanceRepository.findOne({
      where: { phoneNumber: instanceData.phoneNumber },
    });

    if (existingInstance) {
      throw new Error("Phone number already registered");
    }

    // Create database record
    const instance = instanceRepository.create({
      tenantId,
      name: instanceData.name,
      phoneNumber: instanceData.phoneNumber,
      type: instanceData.type,
      status: InstanceStatus.INACTIVE,
      serverUrl: instanceData.serverUrl,
      apiToken: instanceData.apiToken,
      config: {
        webhookUrl: instanceData.webhookUrl,
        webhookEvents: ["messages", "connection-update", "presence-update"],
        autoReply: false,
        features: {
          readReceipts: true,
          typing: true,
          presence: true,
          groupsEnabled: true,
          mediaEnabled: true,
        },
      },
      stats: {
        messagesSent: 0,
        messagesReceived: 0,
        messagesDelivered: 0,
        messagesRead: 0,
        messagesFailed: 0,
        connectionUptime: 0,
        lastActivity: new Date(),
        apiCallsToday: 0,
        monthlyUsage: 0,
      },
    });

    const savedInstance = await instanceRepository.save(instance);

    // Create instance in Evolution API if type is EVOLUTION
    if (
      instanceData.type === InstanceType.EVOLUTION &&
      instanceData.serverUrl &&
      instanceData.apiToken
    ) {
      try {
        await this.createEvolutionInstance(savedInstance);
      } catch (error) {
        // Rollback database record if Evolution API fails
        await instanceRepository.remove(savedInstance);
        throw new Error(`Failed to create Evolution API instance: ${error}`);
      }
    }

    // Update tenant usage
    tenant.updateUsage({
      currentWhatsappInstances: tenant.usage.currentWhatsappInstances + 1,
    });
    await tenantRepository.save(tenant);

    this.connections.set(savedInstance.id, savedInstance);
    return savedInstance;
  }

  private static async createEvolutionInstance(
    instance: WhatsAppInstance,
  ): Promise<void> {
    if (!instance.serverUrl || !instance.apiToken) {
      throw new Error("Evolution API configuration missing");
    }

    const client = this.getEvolutionClient(
      instance.serverUrl,
      instance.apiToken,
    );

    const request: CreateInstanceRequest = {
      instanceName: instance.id,
      qrcode: true,
      webhook: instance.getWebhookUrl(),
      webhookByEvents: true,
      events: instance.config?.webhookEvents || [
        "messages",
        "connection-update",
      ],
    };

    try {
      const response = await client.post("/instance/create", request);

      if (response.data.instance) {
        instance.instanceKey = response.data.instance.instanceName;
        instance.status = InstanceStatus.CONNECTING;

        // Save updated instance
        if (AppDataSource.isInitialized) {
          const instanceRepository =
            AppDataSource.getRepository(WhatsAppInstance);
          await instanceRepository.save(instance);
        }
      }
    } catch (error: any) {
      console.error(
        "Evolution API create instance error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  static async getQRCode(instanceId: string): Promise<string | null> {
    const instance = await this.getInstanceById(instanceId);
    if (!instance || instance.type !== InstanceType.EVOLUTION) {
      throw new Error("Instance not found or not Evolution type");
    }

    if (!instance.serverUrl || !instance.apiToken) {
      throw new Error("Evolution API configuration missing");
    }

    try {
      const client = this.getEvolutionClient(
        instance.serverUrl,
        instance.apiToken,
      );
      const response = await client.get(
        `/instance/connect/${instance.instanceKey}`,
      );

      if (response.data.base64) {
        instance.updateQRCode(response.data.base64);

        if (AppDataSource.isInitialized) {
          const instanceRepository =
            AppDataSource.getRepository(WhatsAppInstance);
          await instanceRepository.save(instance);
        }

        return response.data.base64;
      }

      return null;
    } catch (error: any) {
      console.error(
        "Get QR Code error:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to get QR code");
    }
  }

  static async getInstanceById(
    instanceId: string,
  ): Promise<WhatsAppInstance | null> {
    // Check memory cache first
    if (this.connections.has(instanceId)) {
      return this.connections.get(instanceId)!;
    }

    // Fallback to database
    if (AppDataSource.isInitialized) {
      const instanceRepository = AppDataSource.getRepository(WhatsAppInstance);
      const instance = await instanceRepository.findOne({
        where: { id: instanceId },
        relations: ["tenant"],
      });

      if (instance) {
        this.connections.set(instanceId, instance);
      }

      return instance;
    }

    return null;
  }

  static async getTenantInstances(
    tenantId: string,
  ): Promise<WhatsAppInstance[]> {
    if (!AppDataSource.isInitialized) {
      return Array.from(this.connections.values()).filter(
        (i) => i.tenantId === tenantId,
      );
    }

    const instanceRepository = AppDataSource.getRepository(WhatsAppInstance);
    return await instanceRepository.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
  }

  // Message Sending
  static async sendMessage(
    instanceId: string,
    contactPhone: string,
    messageData: {
      text?: string;
      mediaUrl?: string;
      mediaType?: "image" | "video" | "audio" | "document";
      caption?: string;
      filename?: string;
    },
  ): Promise<Message> {
    const instance = await this.getInstanceById(instanceId);
    if (!instance) {
      throw new Error("Instance not found");
    }

    if (!instance.canSendMessage()) {
      throw new Error("Instance cannot send messages in current state");
    }

    // Create message record
    const messageRepository = AppDataSource.isInitialized
      ? AppDataSource.getRepository(Message)
      : null;

    let message: Message;

    if (messageData.mediaUrl) {
      message = messageRepository?.create(
        Message.createMediaMessage(
          instance.tenantId,
          instanceId,
          contactPhone,
          messageData.mediaType === "image"
            ? MessageType.IMAGE
            : messageData.mediaType === "video"
              ? MessageType.VIDEO
              : messageData.mediaType === "audio"
                ? MessageType.AUDIO
                : MessageType.DOCUMENT,
          messageData.mediaUrl,
          messageData.caption,
        ),
      ) as Message;
    } else {
      message = messageRepository?.create(
        Message.createTextMessage(
          instance.tenantId,
          instanceId,
          contactPhone,
          messageData.text || "",
        ),
      ) as Message;
    }

    try {
      // Send via Evolution API
      if (instance.type === InstanceType.EVOLUTION) {
        const result = await this.sendEvolutionMessage(
          instance,
          contactPhone,
          messageData,
        );
        message.markSent(result.messageId);
      }

      // Save message to database
      if (messageRepository) {
        await messageRepository.save(message);
      }

      // Update instance stats
      instance.incrementMessageCount("sent");
      if (AppDataSource.isInitialized) {
        const instanceRepository =
          AppDataSource.getRepository(WhatsAppInstance);
        await instanceRepository.save(instance);
      }

      return message;
    } catch (error: any) {
      message.markFailed(error.message);
      if (messageRepository) {
        await messageRepository.save(message);
      }

      instance.incrementMessageCount("failed");
      if (AppDataSource.isInitialized) {
        const instanceRepository =
          AppDataSource.getRepository(WhatsAppInstance);
        await instanceRepository.save(instance);
      }

      throw error;
    }
  }

  private static async sendEvolutionMessage(
    instance: WhatsAppInstance,
    contactPhone: string,
    messageData: any,
  ): Promise<{ messageId: string }> {
    if (!instance.serverUrl || !instance.apiToken || !instance.instanceKey) {
      throw new Error("Evolution API configuration incomplete");
    }

    const client = this.getEvolutionClient(
      instance.serverUrl,
      instance.apiToken,
    );

    const request: SendMessageRequest = {
      number: contactPhone.replace(/\D/g, ""), // Remove non-digits
    };

    if (messageData.mediaUrl) {
      request.media = {
        mediatype: messageData.mediaType,
        media: messageData.mediaUrl,
        caption: messageData.caption,
        filename: messageData.filename,
      };
    } else {
      request.text = messageData.text;
    }

    try {
      const response = await client.post(
        `/message/sendText/${instance.instanceKey}`,
        request,
      );
      return { messageId: response.data.key?.id || `msg_${Date.now()}` };
    } catch (error: any) {
      console.error(
        "Evolution API send message error:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to send message via Evolution API");
    }
  }

  // Webhook Processing
  static async processWebhook(
    tenantId: string,
    instanceId: string,
    payload: WebhookPayload,
  ): Promise<void> {
    const instance = await this.getInstanceById(instanceId);
    if (!instance || instance.tenantId !== tenantId) {
      console.error("Webhook: Instance not found or tenant mismatch");
      return;
    }

    try {
      switch (payload.event) {
        case "messages.upsert":
          await this.handleIncomingMessage(instance, payload);
          break;
        case "connection.update":
          await this.handleConnectionUpdate(instance, payload);
          break;
        case "presence.update":
          await this.handlePresenceUpdate(instance, payload);
          break;
        default:
          console.log(`Unhandled webhook event: ${payload.event}`);
      }
    } catch (error) {
      console.error("Webhook processing error:", error);
    }
  }

  private static async handleIncomingMessage(
    instance: WhatsAppInstance,
    payload: WebhookPayload,
  ): Promise<void> {
    const messageData = payload.data;
    if (!messageData.key || messageData.key.fromMe) {
      return; // Skip own messages
    }

    const messageRepository = AppDataSource.isInitialized
      ? AppDataSource.getRepository(Message)
      : null;

    if (!messageRepository) return;

    // Extract message content
    const content = this.extractMessageContent(messageData.message);
    const contactPhone = messageData.key.remoteJid.replace(
      "@s.whatsapp.net",
      "",
    );

    // Create message record
    const message = messageRepository.create({
      tenantId: instance.tenantId,
      instanceId: instance.id,
      whatsappMessageId: messageData.key.id,
      direction: MessageDirection.INBOUND,
      type: content.type,
      status: MessageStatus.DELIVERED,
      content: content.data,
      contactPhone,
      sentAt: new Date(messageData.messageTimestamp * 1000),
      deliveredAt: new Date(),
    });

    await messageRepository.save(message);

    // Update instance stats
    instance.incrementMessageCount("received");
    if (AppDataSource.isInitialized) {
      const instanceRepository = AppDataSource.getRepository(WhatsAppInstance);
      await instanceRepository.save(instance);
    }

    console.log(`Incoming message processed: ${messageData.key.id}`);
  }

  private static async handleConnectionUpdate(
    instance: WhatsAppInstance,
    payload: WebhookPayload,
  ): Promise<void> {
    const connectionData = payload.data;

    // Update instance status based on connection state
    if (connectionData.status === "open") {
      instance.markConnected();
    } else if (connectionData.status === "close") {
      instance.markDisconnected();
    }

    if (AppDataSource.isInitialized) {
      const instanceRepository = AppDataSource.getRepository(WhatsAppInstance);
      await instanceRepository.save(instance);
    }

    console.log(`Connection update: ${instance.id} - ${connectionData.status}`);
  }

  private static async handlePresenceUpdate(
    instance: WhatsAppInstance,
    payload: WebhookPayload,
  ): Promise<void> {
    // Handle presence updates (online/offline status)
    console.log(`Presence update: ${instance.id}`, payload.data);
  }

  private static extractMessageContent(message: any): {
    type: MessageType;
    data: any;
  } {
    if (message.conversation) {
      return {
        type: MessageType.TEXT,
        data: { text: message.conversation },
      };
    }

    if (message.imageMessage) {
      return {
        type: MessageType.IMAGE,
        data: {
          media: {
            caption: message.imageMessage.caption,
            mimeType: message.imageMessage.mimetype,
            url: message.imageMessage.url,
          },
        },
      };
    }

    if (message.videoMessage) {
      return {
        type: MessageType.VIDEO,
        data: {
          media: {
            caption: message.videoMessage.caption,
            mimeType: message.videoMessage.mimetype,
            url: message.videoMessage.url,
          },
        },
      };
    }

    if (message.audioMessage) {
      return {
        type: MessageType.AUDIO,
        data: {
          media: {
            mimeType: message.audioMessage.mimetype,
            url: message.audioMessage.url,
          },
        },
      };
    }

    if (message.documentMessage) {
      return {
        type: MessageType.DOCUMENT,
        data: {
          media: {
            filename: message.documentMessage.fileName,
            mimeType: message.documentMessage.mimetype,
            url: message.documentMessage.url,
          },
        },
      };
    }

    // Default to text for unknown message types
    return {
      type: MessageType.TEXT,
      data: { text: "[Unsupported message type]" },
    };
  }

  // Instance Status Management
  static async updateInstanceStatus(
    instanceId: string,
    status: InstanceStatus,
    error?: string,
  ): Promise<void> {
    const instance = await this.getInstanceById(instanceId);
    if (!instance) return;

    instance.status = status;
    if (error) {
      instance.markError(error);
    }

    if (AppDataSource.isInitialized) {
      const instanceRepository = AppDataSource.getRepository(WhatsAppInstance);
      await instanceRepository.save(instance);
    }
  }

  // Cleanup and Disconnection
  static async disconnectInstance(instanceId: string): Promise<void> {
    const instance = await this.getInstanceById(instanceId);
    if (!instance) return;

    if (
      instance.type === InstanceType.EVOLUTION &&
      instance.serverUrl &&
      instance.apiToken
    ) {
      try {
        const client = this.getEvolutionClient(
          instance.serverUrl,
          instance.apiToken,
        );
        await client.delete(`/instance/logout/${instance.instanceKey}`);
      } catch (error) {
        console.error("Error disconnecting Evolution instance:", error);
      }
    }

    instance.markDisconnected();

    if (AppDataSource.isInitialized) {
      const instanceRepository = AppDataSource.getRepository(WhatsAppInstance);
      await instanceRepository.save(instance);
    }

    this.connections.delete(instanceId);
  }

  static async deleteInstance(instanceId: string): Promise<void> {
    await this.disconnectInstance(instanceId);

    if (AppDataSource.isInitialized) {
      const instanceRepository = AppDataSource.getRepository(WhatsAppInstance);
      await instanceRepository.delete(instanceId);
    }
  }
}

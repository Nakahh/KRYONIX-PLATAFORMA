# PARTE-27: COMUNICAÇÃO E COLABORAÇÃO
## Sistema Completo de Comunicação e Colaboração

### 📋 DESCRIÇÃO
Implementação de sistema abrangente de comunicação e colaboração em tempo real, incluindo chat, videoconferência, compartilhamento de arquivos, edição colaborativa, comentários e workflows de aprovação para facilitar o trabalho em equipe na plataforma KRYONIX.

### 🎯 OBJETIVOS
- Chat em tempo real entre usuários e equipes
- Sistema de videoconferência integrado
- Edição colaborativa de documentos
- Compartilhamento e comentários em arquivos
- Notificações push em tempo real
- Workflows de aprovação e revisão

### 🏗️ ARQUITETURA

#### Fluxo de Comunicação
```
┌─────────────────────────────────────────────────────────────┐
│              COMMUNICATION ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│ REAL-TIME LAYER                                            │
│ • WebSocket Connections                                     │
│ • Socket.io Server                                         │
│ • WebRTC for Video/Audio                                   │
│ • Push Notifications                                       │
├─────────────────────────────────────────────────────────────┤
│ APPLICATION LAYER                                          │
│ • Chat Service                                             │
│ • Collaboration Engine                                     │
│ • File Sharing Service                                     │
│ • Notification Manager                                     │
├─────────────────────────────────────────────────────────────┤
│ INTEGRATION LAYER                                          │
│ • Jitsi Meet (Video Conferencing)                         │
│ • Operational Transform (OT)                              │
│ • WebRTC Signaling                                        │
│ • Push Notification Services                              │
├─────────────────────────────────────────────────────────────┤
│ STORAGE LAYER                                              │
│ • Messages (PostgreSQL)                                   │
│ • File Versions (MinIO)                                   │
│ • Real-time State (Redis)                                 │
│ • Search Index (Elasticsearch)                            │
└─────────────────────────────────────────────────────────────┘
```

### 🗄️ SCHEMAS DE BANCO DE DADOS

#### PostgreSQL Communication Schema
```sql
-- Schema para comunicação e colaboração
CREATE SCHEMA IF NOT EXISTS communication;

-- Tabela de conversas/canais
CREATE TABLE communication.conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    organization_id UUID,
    conversation_type VARCHAR(50) NOT NULL, -- 'direct', 'group', 'channel', 'project'
    conversation_name VARCHAR(255),
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    creator_id UUID NOT NULL,
    settings JSONB DEFAULT '{}', -- Notification settings, permissions, etc.
    metadata JSONB DEFAULT '{}',
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_id UUID,
    message_count INTEGER DEFAULT 0,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de participantes de conversas
CREATE TABLE communication.conversation_members (
    membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES communication.conversations(conversation_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- 'owner', 'admin', 'moderator', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    is_muted BOOLEAN DEFAULT false,
    notification_level VARCHAR(20) DEFAULT 'all', -- 'all', 'mentions', 'none'
    is_active BOOLEAN DEFAULT true,
    invited_by UUID,
    custom_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

-- Tabela de mensagens
CREATE TABLE communication.messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES communication.conversations(conversation_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    parent_message_id UUID REFERENCES communication.messages(message_id), -- For replies/threads
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'file', 'image', 'audio', 'video', 'system', 'call'
    content TEXT,
    formatted_content TEXT, -- HTML formatted content
    attachments JSONB DEFAULT '[]', -- Array of file attachments
    mentions JSONB DEFAULT '[]', -- Array of mentioned user IDs
    reactions JSONB DEFAULT '{}', -- Emoji reactions {emoji: [user_ids]}
    metadata JSONB DEFAULT '{}', -- Additional metadata (location, reply_to, etc.)
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    thread_count INTEGER DEFAULT 0, -- Number of replies in thread
    last_thread_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de arquivos compartilhados
CREATE TABLE communication.shared_files (
    file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    conversation_id UUID REFERENCES communication.conversations(conversation_id),
    uploader_id UUID NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    mime_type VARCHAR(200),
    thumbnail_path TEXT,
    preview_available BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    access_permissions JSONB DEFAULT '{}', -- Who can view/download
    version_number INTEGER DEFAULT 1,
    parent_file_id UUID REFERENCES communication.shared_files(file_id),
    checksum VARCHAR(64),
    encryption_key VARCHAR(255),
    expiry_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de comentários em arquivos
CREATE TABLE communication.file_comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES communication.shared_files(file_id) ON DELETE CASCADE,
    commenter_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES communication.file_comments(comment_id),
    comment_text TEXT NOT NULL,
    comment_position JSONB, -- Position in document/image {page, x, y, etc.}
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]',
    mentions JSONB DEFAULT '[]',
    reactions JSONB DEFAULT '{}',
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de sessões de colaboração
CREATE TABLE communication.collaboration_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    document_id VARCHAR(255) NOT NULL, -- Reference to document being edited
    document_type VARCHAR(100) NOT NULL, -- 'text', 'spreadsheet', 'presentation', etc.
    session_name VARCHAR(255),
    creator_id UUID NOT NULL,
    is_active BOOLEAN DEFAULT true,
    participant_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}', -- Editing permissions, auto-save, etc.
    document_content JSONB, -- Current document state
    operation_log JSONB DEFAULT '[]', -- Operational Transform log
    last_operation_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de participantes de sessão colaborativa
CREATE TABLE communication.collaboration_participants (
    participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES communication.collaboration_sessions(session_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    cursor_position JSONB, -- Current cursor position
    selection_range JSONB, -- Current text selection
    permission_level VARCHAR(50) DEFAULT 'edit', -- 'view', 'comment', 'edit', 'admin'
    is_online BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(session_id, user_id)
);

-- Tabela de chamadas de vídeo/áudio
CREATE TABLE communication.calls (
    call_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES communication.conversations(conversation_id),
    initiator_id UUID NOT NULL,
    call_type VARCHAR(20) NOT NULL, -- 'audio', 'video', 'screen_share'
    call_status VARCHAR(20) DEFAULT 'initiated', -- 'initiated', 'ringing', 'active', 'ended', 'missed', 'declined'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    recording_enabled BOOLEAN DEFAULT false,
    recording_path TEXT,
    quality_metrics JSONB, -- Call quality data
    ended_by UUID,
    end_reason VARCHAR(50), -- 'normal', 'timeout', 'error', 'declined'
    jitsi_room_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de participantes de chamadas
CREATE TABLE communication.call_participants (
    participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES communication.calls(call_id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    audio_enabled BOOLEAN DEFAULT true,
    video_enabled BOOLEAN DEFAULT true,
    screen_sharing BOOLEAN DEFAULT false,
    connection_quality VARCHAR(20), -- 'excellent', 'good', 'fair', 'poor'
    devices_used JSONB, -- Microphone, camera, etc.
    UNIQUE(call_id, user_id)
);

-- Tabela de notificações push
CREATE TABLE communication.push_notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    notification_type VARCHAR(100) NOT NULL, -- 'message', 'mention', 'call', 'file_shared', etc.
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    icon_url TEXT,
    action_url TEXT,
    payload JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    device_tokens TEXT[], -- Push notification device tokens
    sent_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_conversations_tenant_org ON communication.conversations(tenant_id, organization_id);
CREATE INDEX idx_conversations_updated ON communication.conversations(updated_at DESC);
CREATE INDEX idx_conversation_members_user ON communication.conversation_members(user_id);
CREATE INDEX idx_conversation_members_conversation ON communication.conversation_members(conversation_id);
CREATE INDEX idx_messages_conversation_created ON communication.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON communication.messages(sender_id);
CREATE INDEX idx_messages_parent ON communication.messages(parent_message_id);
CREATE INDEX idx_messages_mentions ON communication.messages USING GIN(mentions);
CREATE INDEX idx_shared_files_tenant ON communication.shared_files(tenant_id);
CREATE INDEX idx_shared_files_conversation ON communication.shared_files(conversation_id);
CREATE INDEX idx_file_comments_file ON communication.file_comments(file_id);
CREATE INDEX idx_collaboration_sessions_active ON communication.collaboration_sessions(is_active, last_operation_at);
CREATE INDEX idx_calls_conversation ON communication.calls(conversation_id);
CREATE INDEX idx_calls_status ON communication.calls(call_status, started_at);
CREATE INDEX idx_notifications_user_unread ON communication.push_notifications(user_id, is_read);

-- Função para atualizar contadores
CREATE OR REPLACE FUNCTION communication.update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update message count and last message
        UPDATE communication.conversations 
        SET message_count = message_count + 1,
            last_message_at = NEW.created_at,
            last_message_id = NEW.message_id,
            updated_at = NEW.created_at
        WHERE conversation_id = NEW.conversation_id;
        
        -- Update unread count for all members except sender
        UPDATE communication.conversation_members 
        SET unread_count = unread_count + 1
        WHERE conversation_id = NEW.conversation_id 
        AND user_id != NEW.sender_id
        AND is_active = true;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_stats_trigger
    AFTER INSERT ON communication.messages
    FOR EACH ROW EXECUTE FUNCTION communication.update_conversation_stats();

-- Função para marcar mensagens como lidas
CREATE OR REPLACE FUNCTION communication.mark_messages_read(
    p_conversation_id UUID,
    p_user_id UUID,
    p_message_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update last read timestamp
    UPDATE communication.conversation_members
    SET last_read_at = COALESCE((
        SELECT created_at FROM communication.messages 
        WHERE message_id = p_message_id
    ), NOW()),
    unread_count = 0
    WHERE conversation_id = p_conversation_id 
    AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar conversas do usuário
CREATE OR REPLACE FUNCTION communication.get_user_conversations(
    p_user_id UUID,
    p_tenant_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    conversation_id UUID,
    conversation_type VARCHAR(50),
    conversation_name VARCHAR(255),
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER,
    member_count INTEGER,
    is_muted BOOLEAN,
    last_message_preview TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.conversation_id,
        c.conversation_type,
        c.conversation_name,
        c.last_message_at,
        cm.unread_count,
        c.member_count,
        cm.is_muted,
        SUBSTRING(m.content, 1, 100) as last_message_preview
    FROM communication.conversations c
    JOIN communication.conversation_members cm ON c.conversation_id = cm.conversation_id
    LEFT JOIN communication.messages m ON c.last_message_id = m.message_id
    WHERE cm.user_id = p_user_id
    AND cm.is_active = true
    AND (p_tenant_id IS NULL OR c.tenant_id = p_tenant_id)
    ORDER BY c.last_message_at DESC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Trigger para thread count
CREATE OR REPLACE FUNCTION communication.update_thread_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_message_id IS NOT NULL THEN
        UPDATE communication.messages
        SET thread_count = thread_count + 1,
            last_thread_at = NEW.created_at
        WHERE message_id = NEW.parent_message_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER thread_count_trigger
    AFTER INSERT ON communication.messages
    FOR EACH ROW EXECUTE FUNCTION communication.update_thread_count();
```

### 🔧 IMPLEMENTAÇÃO DOS SERVIÇOS

#### 1. Chat Service
```typescript
// src/modules/communication/services/chat.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    private io: Server;

    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        
        @InjectRepository(ConversationMember)
        private readonly memberRepository: Repository<ConversationMember>,
        
        @InjectRedis() private readonly redis: Redis,
        private readonly eventEmitter: EventEmitter2,
        private readonly notificationService: NotificationService
    ) {}

    setSocketServer(io: Server) {
        this.io = io;
    }

    async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
        const conversation = this.conversationRepository.create({
            tenantId: createConversationDto.tenantId,
            organizationId: createConversationDto.organizationId,
            conversationType: createConversationDto.conversationType,
            conversationName: createConversationDto.conversationName,
            description: createConversationDto.description,
            isPrivate: createConversationDto.isPrivate || false,
            creatorId: createConversationDto.creatorId,
            settings: createConversationDto.settings || {}
        });

        const savedConversation = await this.conversationRepository.save(conversation);

        // Add creator as admin
        await this.addMemberToConversation(
            savedConversation.conversationId,
            createConversationDto.creatorId,
            'admin'
        );

        // Add other participants
        if (createConversationDto.participantIds) {
            for (const participantId of createConversationDto.participantIds) {
                await this.addMemberToConversation(
                    savedConversation.conversationId,
                    participantId,
                    'member'
                );
            }
        }

        // Join all members to socket room
        await this.joinConversationRoom(savedConversation.conversationId);

        this.eventEmitter.emit('conversation.created', {
            conversation: savedConversation,
            creator: createConversationDto.creatorId
        });

        return savedConversation;
    }

    async sendMessage(sendMessageDto: SendMessageDto): Promise<Message> {
        // Verify user is member of conversation
        const membership = await this.memberRepository.findOne({
            where: {
                conversationId: sendMessageDto.conversationId,
                userId: sendMessageDto.senderId,
                isActive: true
            }
        });

        if (!membership) {
            throw new Error('Usuário não é membro desta conversa');
        }

        // Create message
        const message = this.messageRepository.create({
            conversationId: sendMessageDto.conversationId,
            senderId: sendMessageDto.senderId,
            parentMessageId: sendMessageDto.parentMessageId,
            messageType: sendMessageDto.messageType || 'text',
            content: sendMessageDto.content,
            formattedContent: this.formatMessageContent(sendMessageDto.content),
            attachments: sendMessageDto.attachments || [],
            mentions: this.extractMentions(sendMessageDto.content),
            metadata: sendMessageDto.metadata || {}
        });

        const savedMessage = await this.messageRepository.save(message);

        // Emit to conversation room
        this.io.to(`conversation-${sendMessageDto.conversationId}`)
           .emit('new-message', savedMessage);

        // Send push notifications to offline members
        await this.sendMessageNotifications(savedMessage);

        // Update search index
        await this.indexMessage(savedMessage);

        this.eventEmitter.emit('message.sent', {
            message: savedMessage,
            conversation: sendMessageDto.conversationId
        });

        return savedMessage;
    }

    async addMemberToConversation(
        conversationId: string,
        userId: string,
        role: string = 'member'
    ): Promise<ConversationMember> {
        const member = this.memberRepository.create({
            conversationId,
            userId,
            role,
            joinedAt: new Date(),
            isActive: true
        });

        const savedMember = await this.memberRepository.save(member);

        // Update member count
        await this.conversationRepository.increment(
            { conversationId },
            'memberCount',
            1
        );

        // Join socket room
        await this.redis.sadd(`conversation:${conversationId}:members`, userId);

        this.eventEmitter.emit('conversation.member.added', {
            conversationId,
            member: savedMember
        });

        return savedMember;
    }

    async markMessagesAsRead(
        conversationId: string,
        userId: string,
        messageId?: string
    ): Promise<void> {
        await this.conversationRepository.query(
            'SELECT communication.mark_messages_read($1, $2, $3)',
            [conversationId, userId, messageId]
        );

        // Emit read status to conversation
        this.io.to(`conversation-${conversationId}`)
           .emit('messages-read', {
                userId,
                conversationId,
                messageId,
                timestamp: new Date()
            });
    }

    async getUserConversations(
        userId: string,
        tenantId?: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<ConversationSummary[]> {
        const query = `
            SELECT * FROM communication.get_user_conversations($1, $2, $3, $4)
        `;

        return await this.conversationRepository.query(query, [
            userId,
            tenantId,
            limit,
            offset
        ]);
    }

    async getConversationMessages(
        conversationId: string,
        userId: string,
        limit: number = 50,
        before?: string
    ): Promise<Message[]> {
        // Verify user is member
        const membership = await this.memberRepository.findOne({
            where: { conversationId, userId, isActive: true }
        });

        if (!membership) {
            throw new Error('Acesso negado à conversa');
        }

        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .where('message.conversationId = :conversationId', { conversationId })
            .andWhere('message.isDeleted = false')
            .orderBy('message.createdAt', 'DESC')
            .limit(limit);

        if (before) {
            queryBuilder.andWhere('message.createdAt < :before', { 
                before: new Date(before) 
            });
        }

        const messages = await queryBuilder.getMany();

        // Mark messages as read
        if (messages.length > 0) {
            await this.markMessagesAsRead(
                conversationId,
                userId,
                messages[0].messageId
            );
        }

        return messages.reverse(); // Return in chronological order
    }

    async searchMessages(
        searchQuery: string,
        userId: string,
        conversationId?: string,
        limit: number = 50
    ): Promise<MessageSearchResult[]> {
        // Use Elasticsearch for search
        const searchResults = await this.searchService.searchMessages({
            query: searchQuery,
            userId,
            conversationId,
            limit
        });

        return searchResults;
    }

    async addReaction(
        messageId: string,
        userId: string,
        emoji: string
    ): Promise<void> {
        const message = await this.messageRepository.findOne({
            where: { messageId }
        });

        if (!message) {
            throw new Error('Mensagem não encontrada');
        }

        const reactions = message.reactions || {};
        
        if (!reactions[emoji]) {
            reactions[emoji] = [];
        }

        const userReactions = reactions[emoji] as string[];
        const userIndex = userReactions.indexOf(userId);

        if (userIndex === -1) {
            // Add reaction
            userReactions.push(userId);
        } else {
            // Remove reaction
            userReactions.splice(userIndex, 1);
            if (userReactions.length === 0) {
                delete reactions[emoji];
            }
        }

        message.reactions = reactions;
        await this.messageRepository.save(message);

        // Emit to conversation
        this.io.to(`conversation-${message.conversationId}`)
           .emit('message-reaction', {
                messageId,
                emoji,
                userId,
                reactions: message.reactions
            });
    }

    async editMessage(
        messageId: string,
        userId: string,
        newContent: string
    ): Promise<Message> {
        const message = await this.messageRepository.findOne({
            where: { messageId, senderId: userId }
        });

        if (!message) {
            throw new Error('Mensagem não encontrada ou sem permissão');
        }

        message.content = newContent;
        message.formattedContent = this.formatMessageContent(newContent);
        message.isEdited = true;
        message.editedAt = new Date();
        message.mentions = this.extractMentions(newContent);

        const updatedMessage = await this.messageRepository.save(message);

        // Emit to conversation
        this.io.to(`conversation-${message.conversationId}`)
           .emit('message-edited', updatedMessage);

        return updatedMessage;
    }

    async deleteMessage(
        messageId: string,
        userId: string
    ): Promise<void> {
        const message = await this.messageRepository.findOne({
            where: { messageId }
        });

        if (!message) {
            throw new Error('Mensagem não encontrada');
        }

        // Check if user can delete (sender or admin)
        const canDelete = message.senderId === userId || 
                         await this.isConversationAdmin(message.conversationId, userId);

        if (!canDelete) {
            throw new Error('Sem permissão para deletar mensagem');
        }

        message.isDeleted = true;
        message.deletedAt = new Date();
        message.deletedBy = userId;

        await this.messageRepository.save(message);

        // Emit to conversation
        this.io.to(`conversation-${message.conversationId}`)
           .emit('message-deleted', {
                messageId,
                deletedBy: userId,
                deletedAt: message.deletedAt
            });
    }

    private async joinConversationRoom(conversationId: string): Promise<void> {
        // Get all conversation members
        const members = await this.memberRepository.find({
            where: { conversationId, isActive: true }
        });

        // Add members to Redis set for room management
        const memberIds = members.map(m => m.userId);
        if (memberIds.length > 0) {
            await this.redis.sadd(`conversation:${conversationId}:members`, ...memberIds);
        }
    }

    private formatMessageContent(content: string): string {
        // Apply basic formatting: mentions, links, markdown
        let formatted = content;

        // Convert @mentions to links
        formatted = formatted.replace(
            /@\[([^\]]+)\]\(([^)]+)\)/g,
            '<span class="mention" data-user-id="$2">@$1</span>'
        );

        // Convert URLs to links
        formatted = formatted.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank">$1</a>'
        );

        // Basic markdown: bold, italic
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        return formatted;
    }

    private extractMentions(content: string): string[] {
        const mentions: string[] = [];
        const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
        let match;

        while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[2]); // User ID
        }

        return mentions;
    }

    private async sendMessageNotifications(message: Message): Promise<void> {
        // Get conversation members
        const members = await this.memberRepository.find({
            where: { 
                conversationId: message.conversationId,
                isActive: true 
            },
            relations: ['user']
        });

        // Filter out sender and muted members
        const notificationTargets = members.filter(member => 
            member.userId !== message.senderId && 
            !member.isMuted &&
            member.notificationLevel !== 'none'
        );

        for (const member of notificationTargets) {
            // Check if user is mentioned or notification level allows
            const isMentioned = message.mentions.includes(member.userId);
            const shouldNotify = member.notificationLevel === 'all' || 
                               (member.notificationLevel === 'mentions' && isMentioned);

            if (shouldNotify) {
                await this.notificationService.sendPushNotification({
                    userId: member.userId,
                    title: `Nova mensagem`,
                    body: message.content.substring(0, 100),
                    type: 'message',
                    actionUrl: `/chat/${message.conversationId}`,
                    payload: {
                        conversationId: message.conversationId,
                        messageId: message.messageId
                    }
                });
            }
        }
    }

    private async indexMessage(message: Message): Promise<void> {
        try {
            await this.searchService.indexDocument('messages', message.messageId, {
                content: message.content,
                senderId: message.senderId,
                conversationId: message.conversationId,
                createdAt: message.createdAt,
                messageType: message.messageType
            });
        } catch (error) {
            this.logger.warn('Failed to index message for search:', error);
        }
    }

    private async isConversationAdmin(conversationId: string, userId: string): Promise<boolean> {
        const membership = await this.memberRepository.findOne({
            where: {
                conversationId,
                userId,
                role: In(['admin', 'owner']),
                isActive: true
            }
        });

        return !!membership;
    }
}

// DTOs and Interfaces
interface CreateConversationDto {
    tenantId: string;
    organizationId?: string;
    conversationType: string;
    conversationName?: string;
    description?: string;
    isPrivate?: boolean;
    creatorId: string;
    participantIds?: string[];
    settings?: any;
}

interface SendMessageDto {
    conversationId: string;
    senderId: string;
    parentMessageId?: string;
    messageType?: string;
    content: string;
    attachments?: any[];
    metadata?: any;
}

interface ConversationSummary {
    conversationId: string;
    conversationType: string;
    conversationName: string;
    lastMessageAt: Date;
    unreadCount: number;
    memberCount: number;
    isMuted: boolean;
    lastMessagePreview: string;
}

interface MessageSearchResult {
    messageId: string;
    content: string;
    senderId: string;
    conversationId: string;
    createdAt: Date;
    highlights: string[];
}
```

#### 2. Collaboration Service
```typescript
// src/modules/communication/services/collaboration.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from 'socket.io';

@Injectable()
export class CollaborationService {
    private readonly logger = new Logger(CollaborationService.name);
    private io: Server;
    private activeOperations = new Map<string, any[]>(); // Store pending operations

    constructor(
        @InjectRepository(CollaborationSession)
        private readonly sessionRepository: Repository<CollaborationSession>,
        
        @InjectRepository(CollaborationParticipant)
        private readonly participantRepository: Repository<CollaborationParticipant>
    ) {}

    setSocketServer(io: Server) {
        this.io = io;
    }

    async createCollaborationSession(
        createSessionDto: CreateCollaborationSessionDto
    ): Promise<CollaborationSession> {
        const session = this.sessionRepository.create({
            tenantId: createSessionDto.tenantId,
            documentId: createSessionDto.documentId,
            documentType: createSessionDto.documentType,
            sessionName: createSessionDto.sessionName,
            creatorId: createSessionDto.creatorId,
            settings: createSessionDto.settings || {},
            documentContent: createSessionDto.initialContent || {},
            operationLog: [],
            isActive: true
        });

        const savedSession = await this.sessionRepository.save(session);

        // Add creator as participant
        await this.joinSession(savedSession.sessionId, createSessionDto.creatorId, 'admin');

        this.logger.log(`Collaboration session created: ${savedSession.sessionId}`);
        return savedSession;
    }

    async joinSession(
        sessionId: string,
        userId: string,
        permissionLevel: string = 'edit'
    ): Promise<CollaborationParticipant> {
        // Check if session exists and is active
        const session = await this.sessionRepository.findOne({
            where: { sessionId, isActive: true }
        });

        if (!session) {
            throw new Error('Sessão não encontrada ou inativa');
        }

        // Create or update participant
        let participant = await this.participantRepository.findOne({
            where: { sessionId, userId }
        });

        if (participant) {
            participant.isOnline = true;
            participant.lastActivity = new Date();
            participant.joinedAt = new Date();
            participant.leftAt = null;
        } else {
            participant = this.participantRepository.create({
                sessionId,
                userId,
                permissionLevel,
                isOnline: true,
                joinedAt: new Date()
            });
        }

        const savedParticipant = await this.participantRepository.save(participant);

        // Update session participant count
        await this.updateParticipantCount(sessionId);

        // Join socket room
        this.io.to(`session-${sessionId}`)
           .emit('participant-joined', {
                participant: savedParticipant,
                sessionId
            });

        // Send current document state to new participant
        const currentState = await this.getDocumentState(sessionId);
        this.io.to(`user-${userId}`)
           .emit('document-state', currentState);

        return savedParticipant;
    }

    async leaveSession(sessionId: string, userId: string): Promise<void> {
        const participant = await this.participantRepository.findOne({
            where: { sessionId, userId }
        });

        if (participant) {
            participant.isOnline = false;
            participant.leftAt = new Date();
            await this.participantRepository.save(participant);

            // Update session participant count
            await this.updateParticipantCount(sessionId);

            // Notify other participants
            this.io.to(`session-${sessionId}`)
               .emit('participant-left', {
                    userId,
                    sessionId,
                    leftAt: participant.leftAt
                });
        }
    }

    async applyOperation(
        sessionId: string,
        userId: string,
        operation: OperationTransformOp
    ): Promise<void> {
        const session = await this.sessionRepository.findOne({
            where: { sessionId, isActive: true }
        });

        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        // Verify user permission
        const participant = await this.participantRepository.findOne({
            where: { sessionId, userId, isOnline: true }
        });

        if (!participant || participant.permissionLevel === 'view') {
            throw new Error('Sem permissão para editar');
        }

        // Apply Operational Transform
        const transformedOperation = await this.transformOperation(sessionId, operation);

        // Update document content
        const updatedContent = this.applyOperationToContent(
            session.documentContent,
            transformedOperation
        );

        // Save to database
        session.documentContent = updatedContent;
        session.lastOperationAt = new Date();
        
        const operationLog = session.operationLog as any[] || [];
        operationLog.push({
            ...transformedOperation,
            userId,
            timestamp: new Date(),
            operationId: this.generateOperationId()
        });
        session.operationLog = operationLog;

        await this.sessionRepository.save(session);

        // Broadcast to all participants except sender
        this.io.to(`session-${sessionId}`)
           .except(`user-${userId}`)
           .emit('operation-applied', {
                operation: transformedOperation,
                documentContent: updatedContent,
                userId,
                timestamp: new Date()
            });

        // Update participant activity
        participant.lastActivity = new Date();
        await this.participantRepository.save(participant);
    }

    async updateCursor(
        sessionId: string,
        userId: string,
        cursorPosition: any,
        selectionRange?: any
    ): Promise<void> {
        const participant = await this.participantRepository.findOne({
            where: { sessionId, userId, isOnline: true }
        });

        if (participant) {
            participant.cursorPosition = cursorPosition;
            participant.selectionRange = selectionRange;
            participant.lastActivity = new Date();
            
            await this.participantRepository.save(participant);

            // Broadcast cursor position to other participants
            this.io.to(`session-${sessionId}`)
               .except(`user-${userId}`)
               .emit('cursor-updated', {
                    userId,
                    cursorPosition,
                    selectionRange,
                    timestamp: new Date()
                });
        }
    }

    async getDocumentState(sessionId: string): Promise<DocumentState> {
        const session = await this.sessionRepository.findOne({
            where: { sessionId, isActive: true }
        });

        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        const participants = await this.participantRepository.find({
            where: { sessionId, isOnline: true }
        });

        return {
            sessionId,
            documentContent: session.documentContent,
            participants: participants.map(p => ({
                userId: p.userId,
                permissionLevel: p.permissionLevel,
                cursorPosition: p.cursorPosition,
                selectionRange: p.selectionRange,
                lastActivity: p.lastActivity
            })),
            lastOperationAt: session.lastOperationAt
        };
    }

    private async transformOperation(
        sessionId: string,
        operation: OperationTransformOp
    ): Promise<OperationTransformOp> {
        // Get pending operations that might conflict
        const pendingOps = this.activeOperations.get(sessionId) || [];
        
        let transformedOp = operation;

        // Apply Operational Transform algorithm
        for (const pendingOp of pendingOps) {
            transformedOp = this.applyOperationalTransform(transformedOp, pendingOp);
        }

        // Add to pending operations
        pendingOps.push(transformedOp);
        this.activeOperations.set(sessionId, pendingOps);

        // Clean up old operations (keep last 100)
        if (pendingOps.length > 100) {
            pendingOps.splice(0, pendingOps.length - 100);
        }

        return transformedOp;
    }

    private applyOperationalTransform(
        op1: OperationTransformOp,
        op2: OperationTransformOp
    ): OperationTransformOp {
        // Simplified OT implementation
        // In production, use a robust OT library like ShareJS or Y.js
        
        if (op1.type === 'insert' && op2.type === 'insert') {
            if (op1.position <= op2.position) {
                return op1;
            } else {
                return {
                    ...op1,
                    position: op1.position + op2.content.length
                };
            }
        }

        if (op1.type === 'delete' && op2.type === 'insert') {
            if (op1.position < op2.position) {
                return op1;
            } else {
                return {
                    ...op1,
                    position: op1.position + op2.content.length
                };
            }
        }

        if (op1.type === 'insert' && op2.type === 'delete') {
            if (op1.position <= op2.position) {
                return op1;
            } else if (op1.position <= op2.position + op2.length) {
                return {
                    ...op1,
                    position: op2.position
                };
            } else {
                return {
                    ...op1,
                    position: op1.position - op2.length
                };
            }
        }

        if (op1.type === 'delete' && op2.type === 'delete') {
            if (op1.position < op2.position) {
                return op1;
            } else if (op1.position >= op2.position + op2.length) {
                return {
                    ...op1,
                    position: op1.position - op2.length
                };
            } else {
                // Overlapping deletes - complex case
                return {
                    ...op1,
                    position: op2.position,
                    length: Math.max(0, op1.length - (op2.position + op2.length - op1.position))
                };
            }
        }

        return op1;
    }

    private applyOperationToContent(content: any, operation: OperationTransformOp): any {
        // Apply operation to document content
        if (typeof content === 'string') {
            return this.applyTextOperation(content, operation);
        }

        // For complex documents (JSON), apply operation to specific path
        if (operation.path) {
            const newContent = JSON.parse(JSON.stringify(content));
            this.applyOperationToPath(newContent, operation.path, operation);
            return newContent;
        }

        return content;
    }

    private applyTextOperation(text: string, operation: OperationTransformOp): string {
        switch (operation.type) {
            case 'insert':
                return text.slice(0, operation.position) + 
                       operation.content + 
                       text.slice(operation.position);
            
            case 'delete':
                return text.slice(0, operation.position) + 
                       text.slice(operation.position + operation.length);
            
            case 'replace':
                return text.slice(0, operation.position) + 
                       operation.content + 
                       text.slice(operation.position + operation.length);
            
            default:
                return text;
        }
    }

    private applyOperationToPath(obj: any, path: string[], operation: OperationTransformOp): void {
        // Navigate to the target location in the object
        let current = obj;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }

        const lastKey = path[path.length - 1];

        switch (operation.type) {
            case 'set':
                current[lastKey] = operation.content;
                break;
            case 'delete':
                delete current[lastKey];
                break;
            case 'insert':
                if (Array.isArray(current[lastKey])) {
                    current[lastKey].splice(operation.position, 0, operation.content);
                }
                break;
        }
    }

    private async updateParticipantCount(sessionId: string): Promise<void> {
        const count = await this.participantRepository.count({
            where: { sessionId, isOnline: true }
        });

        await this.sessionRepository.update(
            { sessionId },
            { participantCount: count }
        );
    }

    private generateOperationId(): string {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Interfaces
interface CreateCollaborationSessionDto {
    tenantId: string;
    documentId: string;
    documentType: string;
    sessionName?: string;
    creatorId: string;
    settings?: any;
    initialContent?: any;
}

interface OperationTransformOp {
    type: 'insert' | 'delete' | 'replace' | 'set';
    position?: number;
    length?: number;
    content?: any;
    path?: string[];
}

interface DocumentState {
    sessionId: string;
    documentContent: any;
    participants: ParticipantInfo[];
    lastOperationAt: Date;
}

interface ParticipantInfo {
    userId: string;
    permissionLevel: string;
    cursorPosition: any;
    selectionRange: any;
    lastActivity: Date;
}
```

### 🎨 COMPONENTES FRONTEND

#### 1. Chat Interface
```typescript
// src/components/communication/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Send, 
    Paperclip, 
    Smile, 
    Phone, 
    Video,
    MoreVertical,
    Reply,
    Edit,
    Trash2,
    Search
} from 'lucide-react';
import { useChat, useWebSocket } from '@/hooks/useCommunication';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ChatInterface() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const { 
        conversations, 
        messages, 
        sendMessage, 
        markAsRead,
        addReaction,
        editMessage,
        deleteMessage,
        loading 
    } = useChat();

    const { 
        isConnected, 
        onlineUsers 
    } = useWebSocket();

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation) return;

        try {
            await sendMessage({
                conversationId: selectedConversation.conversationId,
                content: messageText,
                parentMessageId: replyingTo?.messageId
            });

            setMessageText('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
        }
    };

    const handleEditMessage = async (messageId: string, newContent: string) => {
        try {
            await editMessage(messageId, newContent);
            setEditingMessage(null);
        } catch (error) {
            console.error('Erro ao editar mensagem:', error);
        }
    };

    const handleFileUpload = async (files: FileList) => {
        // Implementar upload de arquivos
        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('conversationId', selectedConversation.conversationId);

            // Upload file and send message
            const uploadResponse = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            });

            const fileData = await uploadResponse.json();

            await sendMessage({
                conversationId: selectedConversation.conversationId,
                messageType: 'file',
                content: `Compartilhou um arquivo: ${file.name}`,
                attachments: [fileData]
            });
        }
    };

    const getMessageTime = (date: string) => {
        return formatDistance(new Date(date), new Date(), {
            addSuffix: true,
            locale: ptBR
        });
    };

    const isOnline = (userId: string) => {
        return onlineUsers.includes(userId);
    };

    return (
        <div className="chat-interface">
            <div className="chat-sidebar">
                <div className="sidebar-header">
                    <h2>Conversas</h2>
                    <div className="search-box">
                        <Search className="search-icon" />
                        <Input
                            placeholder="Buscar conversas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="conversations-list">
                    {conversations?.map((conversation) => (
                        <div 
                            key={conversation.conversationId}
                            className={`conversation-item ${
                                selectedConversation?.conversationId === conversation.conversationId 
                                    ? 'selected' 
                                    : ''
                            }`}
                            onClick={() => setSelectedConversation(conversation)}
                        >
                            <div className="conversation-avatar">
                                {conversation.conversationType === 'direct' ? (
                                    <div className="user-avatar">
                                        <img 
                                            src={conversation.otherUser?.avatarUrl} 
                                            alt={conversation.otherUser?.name}
                                        />
                                        {isOnline(conversation.otherUser?.userId) && (
                                            <div className="online-indicator" />
                                        )}
                                    </div>
                                ) : (
                                    <div className="group-avatar">
                                        {conversation.conversationName?.[0] || '#'}
                                    </div>
                                )}
                            </div>

                            <div className="conversation-info">
                                <div className="conversation-header">
                                    <h4 className="conversation-name">
                                        {conversation.conversationName || conversation.otherUser?.name}
                                    </h4>
                                    <span className="last-message-time">
                                        {conversation.lastMessageAt && 
                                         getMessageTime(conversation.lastMessageAt)}
                                    </span>
                                </div>

                                <div className="conversation-preview">
                                    <p className="last-message">
                                        {conversation.lastMessagePreview}
                                    </p>
                                    {conversation.unreadCount > 0 && (
                                        <Badge className="unread-badge">
                                            {conversation.unreadCount}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-main">
                {selectedConversation ? (
                    <>
                        <div className="chat-header">
                            <div className="conversation-details">
                                <h3>{selectedConversation.conversationName}</h3>
                                <p className="member-count">
                                    {selectedConversation.memberCount} membros
                                </p>
                            </div>

                            <div className="chat-actions">
                                <Button variant="ghost" size="sm">
                                    <Phone className="button-icon" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Video className="button-icon" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="button-icon" />
                                </Button>
                            </div>
                        </div>

                        <div className="messages-container">
                            {messages?.map((message, index) => (
                                <div 
                                    key={message.messageId}
                                    className={`message-group ${
                                        message.senderId === currentUser.userId ? 'own-message' : ''
                                    }`}
                                >
                                    {/* Show avatar and name for first message in group */}
                                    {(index === 0 || messages[index - 1].senderId !== message.senderId) && (
                                        <div className="message-sender">
                                            <img 
                                                src={message.sender?.avatarUrl} 
                                                alt={message.sender?.name}
                                                className="sender-avatar"
                                            />
                                            <span className="sender-name">{message.sender?.name}</span>
                                            <span className="message-time">
                                                {getMessageTime(message.createdAt)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="message-content">
                                        {editingMessage?.messageId === message.messageId ? (
                                            <div className="edit-message-form">
                                                <Input
                                                    value={editingMessage.content}
                                                    onChange={(e) => setEditingMessage({
                                                        ...editingMessage,
                                                        content: e.target.value
                                                    })}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleEditMessage(
                                                                message.messageId, 
                                                                editingMessage.content
                                                            );
                                                        }
                                                    }}
                                                />
                                                <div className="edit-actions">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleEditMessage(
                                                            message.messageId, 
                                                            editingMessage.content
                                                        )}
                                                    >
                                                        Salvar
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => setEditingMessage(null)}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {replyingTo?.messageId === message.messageId && (
                                                    <div className="reply-context">
                                                        <span>Respondendo a:</span>
                                                        <p>{message.content.substring(0, 50)}...</p>
                                                    </div>
                                                )}

                                                <div 
                                                    className="message-text"
                                                    dangerouslySetInnerHTML={{ 
                                                        __html: message.formattedContent || message.content 
                                                    }}
                                                />

                                                {message.attachments && message.attachments.length > 0 && (
                                                    <div className="message-attachments">
                                                        {message.attachments.map((attachment, idx) => (
                                                            <div key={idx} className="attachment">
                                                                <Paperclip className="attachment-icon" />
                                                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                                                    {attachment.name}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {message.reactions && Object.keys(message.reactions).length > 0 && (
                                                    <div className="message-reactions">
                                                        {Object.entries(message.reactions).map(([emoji, users]) => (
                                                            <button
                                                                key={emoji}
                                                                className="reaction-button"
                                                                onClick={() => addReaction(message.messageId, emoji)}
                                                            >
                                                                {emoji} {(users as string[]).length}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {message.isEdited && (
                                                    <span className="edited-indicator">(editado)</span>
                                                )}

                                                <div className="message-actions">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setReplyingTo(message)}
                                                    >
                                                        <Reply className="button-icon" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => addReaction(message.messageId, '👍')}
                                                    >
                                                        <Smile className="button-icon" />
                                                    </Button>

                                                    {message.senderId === currentUser.userId && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setEditingMessage({
                                                                    messageId: message.messageId,
                                                                    content: message.content
                                                                })}
                                                            >
                                                                <Edit className="button-icon" />
                                                            </Button>

                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteMessage(message.messageId)}
                                                            >
                                                                <Trash2 className="button-icon" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {message.threadCount > 0 && (
                                        <div className="thread-indicator">
                                            <button className="view-thread-button">
                                                {message.threadCount} resposta(s)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="message-input-container">
                            {replyingTo && (
                                <div className="reply-preview">
                                    <span>Respondendo para {replyingTo.sender?.name}:</span>
                                    <p>{replyingTo.content.substring(0, 100)}...</p>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setReplyingTo(null)}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            )}

                            <div className="message-input">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            handleFileUpload(e.target.files);
                                        }
                                    }}
                                />

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="button-icon" />
                                </Button>

                                <Input
                                    placeholder="Digite sua mensagem..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />

                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim()}
                                >
                                    <Send className="button-icon" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-conversation-selected">
                        <div className="empty-state">
                            <h3>Selecione uma conversa</h3>
                            <p>Escolha uma conversa para começar a enviar mensagens</p>
                        </div>
                    </div>
                )}
            </div>

            {!isConnected && (
                <div className="connection-status">
                    <Badge variant="destructive">Desconectado</Badge>
                </div>
            )}
        </div>
    );
}
```

### 🚀 SCRIPTS DE EXECUÇÃO

#### Script de Configuração do Sistema de Comunicação
```bash
#!/bin/bash
# setup-communication-system.sh

set -e

echo "🔧 Configurando Sistema de Comunicação e Colaboração..."

# Criar diretórios necessários
sudo mkdir -p /opt/kryonix/communication/{uploads,recordings,cache}
sudo mkdir -p /opt/kryonix/jitsi/configs

# Configurar Jitsi Meet para videoconferência
cat > /opt/kryonix/jitsi/docker-compose.yml << 'EOF'
version: '3.8'
services:
  jitsi-web:
    image: jitsi/web:latest
    restart: unless-stopped
    ports:
      - "8443:443"
      - "8080:80"
    volumes:
      - ./configs/web:/config:Z
      - ./configs/web/letsencrypt:/etc/letsencrypt:Z
      - ./configs/transcripts:/usr/share/jitsi-meet/transcripts:Z
    environment:
      - ENABLE_LETSENCRYPT=0
      - ENABLE_HTTP_REDIRECT=1
      - DISABLE_HTTPS=1
      - LETSENCRYPT_DOMAIN=meet.kryonix.com.br
      - LETSENCRYPT_EMAIL=admin@kryonix.com.br
      - PUBLIC_URL=https://meet.kryonix.com.br
      - TZ=America/Sao_Paulo
    networks:
      - kryonix-network

  jitsi-prosody:
    image: jitsi/prosody:latest
    restart: unless-stopped
    expose:
      - '5222'
      - '5347'
      - '5280'
    volumes:
      - ./configs/prosody/config:/config:Z
      - ./configs/prosody/prosody-plugins-custom:/prosody-plugins-custom:Z
    environment:
      - AUTH_TYPE=internal
      - ENABLE_GUESTS=1
      - GLOBAL_MODULES=
      - GLOBAL_CONFIG=
      - LDAP_URL=
      - LDAP_BASE=
      - LDAP_BINDDN=
      - LDAP_BINDPW=
      - LDAP_FILTER=
      - LDAP_AUTH_METHOD=bind
      - LDAP_VERSION=3
      - LDAP_USE_TLS=1
      - LDAP_TLS_CIPHERS=
      - LDAP_TLS_CHECK_PEER=1
      - LDAP_TLS_CACERT_FILE=
      - LDAP_TLS_CACERT_DIR=
      - LDAP_START_TLS=0
      - XMPP_DOMAIN=meet.kryonix.com.br
      - XMPP_AUTH_DOMAIN=auth.meet.kryonix.com.br
      - XMPP_GUEST_DOMAIN=guest.meet.kryonix.com.br
      - XMPP_MUC_DOMAIN=muc.meet.kryonix.com.br
      - XMPP_INTERNAL_MUC_DOMAIN=internal-muc.meet.kryonix.com.br
      - XMPP_MODULES=
      - XMPP_MUC_MODULES=
      - XMPP_INTERNAL_MUC_MODULES=
      - XMPP_RECORDER_DOMAIN=recorder.meet.kryonix.com.br
      - JICOFO_COMPONENT_SECRET=jicofo_secret
      - JICOFO_AUTH_USER=focus
      - JICOFO_AUTH_PASSWORD=focus_password
      - JVB_AUTH_USER=jvb
      - JVB_AUTH_PASSWORD=jvb_password
      - JIGASI_XMPP_USER=jigasi
      - JIGASI_XMPP_PASSWORD=jigasi_password
      - JIBRI_RECORDER_USER=recorder
      - JIBRI_RECORDER_PASSWORD=recorder_password
      - JIBRI_XMPP_USER=jibri
      - JIBRI_XMPP_PASSWORD=jibri_password
      - TZ=America/Sao_Paulo
    networks:
      - kryonix-network

  jitsi-jicofo:
    image: jitsi/jicofo:latest
    restart: unless-stopped
    volumes:
      - ./configs/jicofo:/config:Z
    environment:
      - ENABLE_AUTH=1
      - XMPP_DOMAIN=meet.kryonix.com.br
      - XMPP_AUTH_DOMAIN=auth.meet.kryonix.com.br
      - XMPP_INTERNAL_MUC_DOMAIN=internal-muc.meet.kryonix.com.br
      - XMPP_MUC_DOMAIN=muc.meet.kryonix.com.br
      - XMPP_SERVER=jitsi-prosody
      - JICOFO_COMPONENT_SECRET=jicofo_secret
      - JICOFO_AUTH_USER=focus
      - JICOFO_AUTH_PASSWORD=focus_password
      - JVB_BREWERY_MUC=jvbbrewery
      - JIGASI_BREWERY_MUC=jigasibrewery
      - JIGASI_SIP_URI=
      - JIBRI_BREWERY_MUC=jibribrewery
      - JIBRI_PENDING_TIMEOUT=90
      - TZ=America/Sao_Paulo
    depends_on:
      - jitsi-prosody
    networks:
      - kryonix-network

  jitsi-jvb:
    image: jitsi/jvb:latest
    restart: unless-stopped
    ports:
      - '10000:10000/udp'
      - '4443:4443'
    volumes:
      - ./configs/jvb:/config:Z
    environment:
      - DOCKER_HOST_ADDRESS=192.168.1.100
      - XMPP_AUTH_DOMAIN=auth.meet.kryonix.com.br
      - XMPP_INTERNAL_MUC_DOMAIN=internal-muc.meet.kryonix.com.br
      - XMPP_SERVER=jitsi-prosody
      - JVB_AUTH_USER=jvb
      - JVB_AUTH_PASSWORD=jvb_password
      - JVB_BREWERY_MUC=jvbbrewery
      - JVB_PORT=10000
      - JVB_TCP_HARVESTER_DISABLED=true
      - JVB_TCP_PORT=4443
      - JVB_STUN_SERVERS=meet-jit-si-turnrelay.jitsi.net:443
      - TZ=America/Sao_Paulo
    depends_on:
      - jitsi-prosody
    networks:
      - kryonix-network

networks:
  kryonix-network:
    external: true
EOF

# Configurar Socket.io para comunicação em tempo real
cat > /opt/kryonix/communication/socket-config.js << 'EOF'
const io = require('socket.io')(server, {
  cors: {
    origin: ["https://app.kryonix.com.br", "https://admin.kryonix.com.br"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware de autenticação
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const user = await verifyJWTToken(token);
    socket.userId = user.id;
    socket.tenantId = user.tenantId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Eventos de conexão
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join user to their personal room
  socket.join(`user-${socket.userId}`);
  
  // Join user to their conversations
  socket.on('join-conversations', async (conversationIds) => {
    for (const conversationId of conversationIds) {
      await joinConversationRoom(socket, conversationId);
    }
  });
  
  // Handle chat events
  socket.on('send-message', async (data) => {
    const message = await processMessage(data, socket.userId);
    io.to(`conversation-${data.conversationId}`).emit('new-message', message);
  });
  
  socket.on('typing-start', (data) => {
    socket.to(`conversation-${data.conversationId}`)
          .emit('user-typing', { userId: socket.userId, typing: true });
  });
  
  socket.on('typing-stop', (data) => {
    socket.to(`conversation-${data.conversationId}`)
          .emit('user-typing', { userId: socket.userId, typing: false });
  });
  
  // Handle collaboration events
  socket.on('join-collaboration', async (sessionId) => {
    socket.join(`session-${sessionId}`);
    await updateCollaborationParticipants(sessionId, socket.userId, true);
  });
  
  socket.on('collaboration-operation', async (data) => {
    const transformedOp = await processCollaborationOperation(data, socket.userId);
    socket.to(`session-${data.sessionId}`).emit('operation-applied', transformedOp);
  });
  
  socket.on('cursor-position', (data) => {
    socket.to(`session-${data.sessionId}`)
          .emit('cursor-updated', { ...data, userId: socket.userId });
  });
  
  // Handle video call events
  socket.on('call-invite', async (data) => {
    const call = await createCall(data, socket.userId);
    io.to(`user-${data.targetUserId}`).emit('incoming-call', call);
  });
  
  socket.on('call-answer', (data) => {
    io.to(`call-${data.callId}`).emit('call-answered', data);
  });
  
  socket.on('call-end', async (data) => {
    await endCall(data.callId, socket.userId);
    io.to(`call-${data.callId}`).emit('call-ended', data);
  });
  
  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.userId}`);
    await updateUserOnlineStatus(socket.userId, false);
    await updateCollaborationParticipants(null, socket.userId, false);
  });
});

async function joinConversationRoom(socket, conversationId) {
  const isMember = await checkConversationMembership(conversationId, socket.userId);
  if (isMember) {
    socket.join(`conversation-${conversationId}`);
  }
}

module.exports = io;
EOF

# Script para configurar notificações push
cat > /opt/kryonix/communication/setup-push-notifications.sh << 'EOF'
#!/bin/bash

echo "Configurando notificações push..."

# Configurar Firebase Admin SDK
cat > /opt/kryonix/communication/firebase-config.json << 'FIREBASE_EOF'
{
  "type": "service_account",
  "project_id": "kryonix-notifications",
  "private_key_id": "key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@kryonix-notifications.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40kryonix-notifications.iam.gserviceaccount.com"
}
FIREBASE_EOF

# Configurar service worker para notifications
cat > /opt/kryonix/communication/sw-notifications.js << 'SW_EOF'
// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "kryonix-notifications.firebaseapp.com",
  projectId: "kryonix-notifications",
  storageBucket: "kryonix-notifications.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icons/notification-icon.png',
    badge: '/assets/icons/badge-icon.png',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/assets/icons/open-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');

  event.notification.close();

  if (event.action === 'open') {
    const actionUrl = event.notification.data.actionUrl || '/';
    event.waitUntil(
      clients.openWindow(actionUrl)
    );
  }
});
SW_EOF

echo "Notificações push configuradas!"
EOF

chmod +x /opt/kryonix/communication/setup-push-notifications.sh

# Configurar monitoramento de comunicação
cat > /opt/kryonix/communication/monitor-communication.sh << 'EOF'
#!/bin/bash

LOG_FILE="/opt/kryonix/communication/logs/monitoring.log"
WEBHOOK_URL="https://ntfy.kryonix.com.br/communication"

check_socket_connections() {
    local connections=$(netstat -an | grep :3001 | grep ESTABLISHED | wc -l)
    echo "$(date): Socket.io connections: $connections" >> $LOG_FILE
    
    if [ "$connections" -eq 0 ]; then
        curl -d "⚠️ Communication: Nenhuma conexão Socket.io ativa" $WEBHOOK_URL
    fi
}

check_jitsi_health() {
    local jitsi_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)
    
    if [ "$jitsi_status" != "200" ]; then
        echo "$(date): Jitsi Meet inacessível (HTTP $jitsi_status)" >> $LOG_FILE
        curl -d "❌ Communication: Jitsi Meet inacessível" $WEBHOOK_URL
    else
        echo "$(date): Jitsi Meet funcionando" >> $LOG_FILE
    fi
}

check_message_queue() {
    local queue_size=$(redis-cli -h redis.kryonix.com.br llen "message_queue")
    echo "$(date): Message queue size: $queue_size" >> $LOG_FILE
    
    if [ "$queue_size" -gt 1000 ]; then
        curl -d "⚠️ Communication: Fila de mensagens grande ($queue_size)" $WEBHOOK_URL
    fi
}

# Executar verificações
check_socket_connections
check_jitsi_health
check_message_queue

echo "$(date): Communication monitoring completed" >> $LOG_FILE
EOF

chmod +x /opt/kryonix/communication/monitor-communication.sh

# Configurar cron para monitoramento
cat > /opt/kryonix/communication/communication-crontab << 'EOF'
# Monitoramento de comunicação a cada 5 minutos
*/5 * * * * /opt/kryonix/communication/monitor-communication.sh

# Limpeza de mensagens antigas (mensal)
0 0 1 * * find /opt/kryonix/communication/uploads -mtime +90 -delete

# Backup de mensagens importantes (semanal)
0 2 * * 0 pg_dump -h postgresql.kryonix.com.br -U postgres -t communication.messages kryonix | gzip > /opt/kryonix/communication/backups/messages_$(date +\%Y\%m\%d).sql.gz

# Limpeza de logs antigos
0 0 * * * find /opt/kryonix/communication/logs -name "*.log" -mtime +7 -delete
EOF

sudo crontab /opt/kryonix/communication/communication-crontab

# Configurar Nginx para WebSocket e upload de arquivos
cat > /opt/kryonix/communication/nginx-communication.conf << 'EOF'
# WebSocket support for Socket.io
upstream socketio_backend {
    ip_hash;
    server kryonix_api:3001;
}

server {
    listen 80;
    server_name chat.kryonix.com.br;
    
    location /socket.io/ {
        proxy_pass http://socketio_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket timeout
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # File upload endpoint
    location /api/communication/upload {
        proxy_pass http://kryonix_api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Increase upload limits
        client_max_body_size 100M;
        client_body_timeout 60s;
        client_header_timeout 60s;
    }
}

# Jitsi Meet proxy
server {
    listen 80;
    server_name meet.kryonix.com.br;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for Jitsi
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

echo "✅ Sistema de Comunicação e Colaboração configurado!"
echo ""
echo "💬 Chat API: https://chat.kryonix.com.br"
echo "🎥 Jitsi Meet: https://meet.kryonix.com.br"
echo "🔄 Socket.io: wss://chat.kryonix.com.br/socket.io"
echo "📁 Uploads: /opt/kryonix/communication/uploads/"
echo "📊 Logs: /opt/kryonix/communication/logs/"
echo ""
echo "🔄 Próximos passos:"
echo "1. Iniciar Jitsi Meet: cd /opt/kryonix/jitsi && docker-compose up -d"
echo "2. Configurar notificações push: /opt/kryonix/communication/setup-push-notifications.sh"
echo "3. Testar Socket.io connections"
echo "4. Configurar Firebase para notificações"
```

### ✅ CHECKLIST DE VALIDAÇÃO

- [ ] **Sistema de Chat**
  - [ ] Socket.io configurado e funcionando
  - [ ] Mensagens em tempo real
  - [ ] Suporte a arquivos e mídia
  - [ ] Reactions e threads implementados

- [ ] **Videoconferência**
  - [ ] Jitsi Meet instalado
  - [ ] Chamadas de áudio/vídeo funcionando
  - [ ] Gravação de chamadas opcional
  - [ ] Integração com chat

- [ ] **Colaboração**
  - [ ] Edição colaborativa implementada
  - [ ] Operational Transform funcionando
  - [ ] Sincronização de cursores
  - [ ] Versionamento de documentos

- [ ] **Notificações**
  - [ ] Push notifications configuradas
  - [ ] Service worker instalado
  - [ ] Notificações por email integradas
  - [ ] Diferentes níveis de notificação

### 🧪 TESTES DE QUALIDADE

```bash
#!/bin/bash
# test-communication-system.sh

echo "🧪 Executando Testes do Sistema de Comunicação..."

# Teste 1: Verificar Socket.io
echo "Teste 1: Socket.io"
socket_response=$(curl -s -o /dev/null -w "%{http_code}" "http://chat.kryonix.com.br/socket.io/")
if [ "$socket_response" = "200" ]; then
    echo "✅ Socket.io acessível"
else
    echo "❌ Socket.io inacessível (HTTP $socket_response)"
fi

# Teste 2: Verificar Jitsi Meet
echo "Teste 2: Jitsi Meet"
jitsi_response=$(curl -s -o /dev/null -w "%{http_code}" "http://meet.kryonix.com.br")
if [ "$jitsi_response" = "200" ]; then
    echo "✅ Jitsi Meet acessível"
else
    echo "❌ Jitsi Meet inacessível (HTTP $jitsi_response)"
fi

# Teste 3: Verificar API de comunicação
echo "Teste 3: API de comunicação"
api_response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.kryonix.com.br/communication/conversations" \
  -H "Authorization: Bearer $API_TOKEN")
if [ "$api_response" = "200" ]; then
    echo "✅ API de comunicação acessível"
else
    echo "❌ API de comunicação inacessível (HTTP $api_response)"
fi

# Teste 4: Verificar Redis para cache de mensagens
echo "Teste 4: Redis para comunicação"
redis_test=$(redis-cli -h redis.kryonix.com.br ping)
if [ "$redis_test" = "PONG" ]; then
    echo "✅ Redis conectado"
    
    # Testar operações de chat
    redis-cli -h redis.kryonix.com.br set "test:message" "Hello World" EX 60
    cached_message=$(redis-cli -h redis.kryonix.com.br get "test:message")
    if [ "$cached_message" = "Hello World" ]; then
        echo "✅ Cache de mensagens funcionando"
        redis-cli -h redis.kryonix.com.br del "test:message"
    else
        echo "❌ Cache de mensagens com problemas"
    fi
else
    echo "❌ Redis não conectado"
fi

# Teste 5: Verificar upload de arquivos
echo "Teste 5: Upload de arquivos"
upload_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "https://api.kryonix.com.br/communication/upload/test" \
  -H "Authorization: Bearer $API_TOKEN" \
  -F "file=@/dev/null")

if [ "$upload_response" = "200" ] || [ "$upload_response" = "201" ]; then
    echo "✅ Upload de arquivos funcionando"
else
    echo "❌ Upload de arquivos com problemas (HTTP $upload_response)"
fi

echo ""
echo "🏁 Testes de Comunicação concluídos!"
```

### 📚 DOCUMENTAÇÃO TÉCNICA

#### Protocolos de Comunicação

**WebSocket Events:**
- `new-message`: Nova mensagem recebida
- `user-typing`: Usuário digitando
- `message-read`: Mensagem marcada como lida
- `participant-joined`: Usuário entrou na conversa
- `call-invite`: Convite para chamada

**Operational Transform:**
- **Insert**: Inserir texto em posição específica
- **Delete**: Remover texto de posição
- **Replace**: Substituir texto
- **Attribute**: Alterar formatação

#### Estrutura de Mensagens

**Tipos de Mensagem:**
- `text`: Mensagem de texto simples
- `file`: Arquivo compartilhado
- `image`: Imagem compartilhada
- `audio`: Mensagem de áudio
- `video`: Vídeo compartilhado
- `system`: Mensagem do sistema
- `call`: Convite/status de chamada

### 🔗 INTEGRAÇÃO COM STACK EXISTENTE

- **PostgreSQL**: Armazenamento de mensagens e conversas
- **Redis**: Cache de sessões e estado em tempo real
- **MinIO**: Storage de arquivos compartilhados
- **Socket.io**: Comunicação em tempo real
- **Jitsi Meet**: Videoconferência
- **Firebase**: Notificações push
- **Elasticsearch**: Busca em mensagens

### 📈 MÉTRICAS MONITORADAS

- **Message Volume**: Mensagens enviadas por período
- **Active Users**: Usuários online simultaneamente
- **Call Quality**: Métricas de qualidade de chamadas
- **File Sharing**: Volume de arquivos compartilhados
- **Response Time**: Latência de mensagens
- **Collaboration Sessions**: Sessões ativas de colaboração
- **Notification Delivery**: Taxa de entrega de notificações

---

**PARTE-27 CONCLUÍDA** ✅  
Sistema completo de comunicação e colaboração implementado com chat em tempo real, videoconferência, edição colaborativa e notificações push.

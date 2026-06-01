import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ConversationsRepository } from './conversations.repository';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageType, SenderType } from './entities/message.entity';
import { S3Service } from '@shared/services/s3.service';
import { UserRole } from '@common/enums/user-role.enum';

export interface ContactDetectionResult {
  hasViolation: boolean;
  detectedTypes: string[];
}

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepo: ConversationsRepository,
    private readonly s3Service: S3Service,
  ) {}

  // ─── Contact Detection ───

  detectContactInfo(content: string): ContactDetectionResult {
    const patterns = [
      { type: 'Telefonnummer', regex: /(?:\+\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g },
      { type: 'E-Mail', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
      { type: 'WhatsApp', regex: /(?:wa\.me|whatsapp\.com|whatsapp)\/\d+|whatsapp:\+?\d+/gi },
      { type: 'Telegram', regex: /(?:t\.me|telegram\.me)\/[a-zA-Z0-9_]+|@[a-zA-Z0-9_]{5,}/g },
    ];

    const detectedTypes: string[] = [];
    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        detectedTypes.push(pattern.type);
      }
    }

    return {
      hasViolation: detectedTypes.length > 0,
      detectedTypes,
    };
  }

  // ─── Conversations ───

  async findMyConversations(userId: number, role: UserRole, page = 1, limit = 20): Promise<{ data: Conversation[]; meta: any }> {
    if (role === UserRole.COMPANY) {
      return this.conversationsRepo.findByCompany(userId, { page, limit });
    }
    return this.conversationsRepo.findByCustomer(userId, { page, limit });
  }

  async findOne(id: number, userId: number, role: UserRole): Promise<Conversation> {
    const conversation = await this.conversationsRepo.findById(id);
    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }

    // Ownership check
    if (role === UserRole.COMPANY && conversation.companyId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }
    if (role === UserRole.END_CUSTOMER && conversation.customerId !== userId) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    return conversation;
  }

  async create(moveRequestId: number, companyId: number, customerId: number): Promise<Conversation> {
    const existing = await this.conversationsRepo.findByMoveAndCompany(moveRequestId, companyId);
    if (existing) {
      return existing;
    }

    return this.conversationsRepo.create({
      moveRequestId,
      companyId,
      customerId,
    });
  }

  async ensureConversation(moveRequestId: number, companyId: number, customerId: number): Promise<Conversation> {
    return this.create(moveRequestId, companyId, customerId);
  }

  // ─── Messages ───

  async getMessages(
    conversationId: number,
    userId: number,
    role: UserRole,
    page = 1,
    limit = 50,
  ): Promise<{ data: Message[]; meta: any }> {
    await this.findOne(conversationId, userId, role);
    return this.conversationsRepo.findMessagesByConversation(conversationId, { page, limit });
  }

  async sendMessage(
    conversationId: number,
    senderId: number,
    senderType: SenderType,
    content: string,
  ): Promise<Message> {
    // Contact detection for non-system messages
    if (senderType !== SenderType.SYSTEM) {
      const detection = this.detectContactInfo(content);
      if (detection.hasViolation) {
        throw new BadRequestException(
          `Kontaktdaten dürfen vor Auftragsbestätigung nicht ausgetauscht werden. Erkannt: ${detection.detectedTypes.join(', ')}`,
        );
      }
    }

    const message = await this.conversationsRepo.createMessage({
      conversationId,
      senderId: senderType === SenderType.SYSTEM ? null : senderId,
      senderType,
      messageType: senderType === SenderType.SYSTEM ? MessageType.SYSTEM : MessageType.TEXT,
      content,
      isRead: false,
    });

    // Update conversation last_message_at
    await this.conversationsRepo.updateLastMessageAt(conversationId, new Date());

    return message;
  }

  async sendSystemMessage(conversationId: number, content: string): Promise<Message> {
    return this.sendMessage(conversationId, 0, SenderType.SYSTEM, content);
  }

  async markRead(conversationId: number, messageIds: number[], userId: number, role: UserRole): Promise<void> {
    await this.findOne(conversationId, userId, role);
    await this.conversationsRepo.markMessagesAsRead(messageIds);
  }

  async getUnreadCount(userId: number, role: UserRole): Promise<number> {
    if (role === UserRole.COMPANY) {
      return this.conversationsRepo.countUnreadForCompany(userId);
    }
    return this.conversationsRepo.countUnreadForCustomer(userId);
  }

  // ─── File Upload ───

  async requestFileUpload(
    conversationId: number,
    userId: number,
    role: UserRole,
    fileType: string,
    fileName: string,
  ): Promise<{ uploadUrl: string; s3Key: string }> {
    await this.findOne(conversationId, userId, role);

    const s3Key = `conversations/${conversationId}/${Date.now()}_${fileName}`;
    const { uploadUrl } = await this.s3Service.getPresignedPutUrl(s3Key, fileType, 900);

    return { uploadUrl, s3Key };
  }

  async confirmFileUpload(
    conversationId: number,
    senderId: number,
    senderType: SenderType,
    s3Key: string,
    fileType: string,
    fileName: string,
    fileSize: number,
  ): Promise<Message & { fileUrl: string }> {
    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    const message = await this.conversationsRepo.createMessage({
      conversationId,
      senderId,
      senderType,
      messageType: MessageType.FILE,
      content: fileName,
      isRead: false,
    });

    // Save file metadata
    await this.conversationsRepo.createMessageFile({
      messageId: message.id,
      fileUrl: s3Url,
      fileType,
      fileName,
      fileSize,
    });

    await this.conversationsRepo.updateLastMessageAt(conversationId, new Date());

    return { ...message, fileUrl: s3Url };
  }
}

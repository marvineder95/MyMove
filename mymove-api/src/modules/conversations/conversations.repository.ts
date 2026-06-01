import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { MessageFile } from './entities/message-file.entity';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable()
export class ConversationsRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(MessageFile)
    private readonly messageFileRepo: Repository<MessageFile>,
  ) {}

  // ─── Conversation Operations ───

  async create(data: Partial<Conversation>): Promise<Conversation> {
    const entity = this.conversationRepo.create(data);
    return this.conversationRepo.save(entity);
  }

  async findById(id: number): Promise<Conversation | null> {
    return this.conversationRepo.findOne({
      where: { id },
      relations: ['moveRequest', 'company', 'customer'],
    });
  }

  async findByMoveAndCompany(
    moveRequestId: number,
    companyId: number,
  ): Promise<Conversation | null> {
    return this.conversationRepo.findOne({
      where: { moveRequestId, companyId },
    });
  }

  async findByCustomer(customerId: number, params: PaginationParams): Promise<{ data: Conversation[]; meta: PaginationMeta }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const [data, total] = await this.conversationRepo.findAndCount({
      where: { customerId },
      relations: ['company', 'moveRequest'],
      order: { lastMessageAt: 'DESC' },
      skip,
      take: limit,
    });
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findByCompany(companyId: number, params: PaginationParams): Promise<{ data: Conversation[]; meta: PaginationMeta }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const [data, total] = await this.conversationRepo.findAndCount({
      where: { companyId },
      relations: ['customer', 'moveRequest'],
      order: { lastMessageAt: 'DESC' },
      skip,
      take: limit,
    });
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateLastMessageAt(id: number, date: Date): Promise<void> {
    await this.conversationRepo.update(id, { lastMessageAt: date });
  }

  // ─── Message Operations ───

  async createMessage(data: Partial<Message>): Promise<Message> {
    const entity = this.messageRepo.create(data);
    return this.messageRepo.save(entity);
  }

  async findMessagesByConversation(
    conversationId: number,
    params: PaginationParams,
  ): Promise<{ data: Message[]; meta: PaginationMeta }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;
    const [data, total] = await this.messageRepo.findAndCount({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async markMessagesAsRead(messageIds: number[]): Promise<void> {
    await this.messageRepo.update(messageIds, { isRead: true });
  }

  async countUnreadByConversation(conversationId: number, senderType: string): Promise<number> {
    return this.messageRepo.count({
      where: {
        conversationId,
        senderType: senderType as any,
        isRead: false,
      },
    });
  }

  async countUnreadForCustomer(customerId: number): Promise<number> {
    return this.messageRepo
      .createQueryBuilder('msg')
      .innerJoin('msg.conversation', 'conv')
      .where('conv.customer_id = :customerId', { customerId })
      .andWhere('msg.sender_type = :senderType', { senderType: 'COMPANY' })
      .andWhere('msg.is_read = :isRead', { isRead: false })
      .getCount();
  }

  async countUnreadForCompany(companyId: number): Promise<number> {
    return this.messageRepo
      .createQueryBuilder('msg')
      .innerJoin('msg.conversation', 'conv')
      .where('conv.company_id = :companyId', { companyId })
      .andWhere('msg.sender_type = :senderType', { senderType: 'CUSTOMER' })
      .andWhere('msg.is_read = :isRead', { isRead: false })
      .getCount();
  }

  async getLatestMessage(conversationId: number): Promise<Message | null> {
    return this.messageRepo.findOne({
      where: { conversationId },
      order: { createdAt: 'DESC' },
    });
  }

  async createMessageFile(data: Partial<MessageFile>): Promise<MessageFile> {
    const entity = this.messageFileRepo.create(data);
    return this.messageFileRepo.save(entity);
  }
}

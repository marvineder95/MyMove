import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MoveRequest, MoveRequestStatus } from './entities/move-request.entity';
import { RequestVideo } from './entities/request-video.entity';
import { MoveRequestItem } from './entities/move-request-item.entity';
import { Offer } from '@modules/offers/entities/offer.entity';
import { PaginationMeta, PaginationParams } from '@common/interfaces/pagination.interface';

@Injectable()
export class RequestsRepository {
  constructor(
    @InjectRepository(MoveRequest)
    private readonly moveRequestRepo: Repository<MoveRequest>,
    @InjectRepository(RequestVideo)
    private readonly videoRepo: Repository<RequestVideo>,
    @InjectRepository(MoveRequestItem)
    private readonly itemRepo: Repository<MoveRequestItem>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
  ) {}

  // --- Move Request operations ---

  async create(data: Partial<MoveRequest>): Promise<MoveRequest> {
    const entity = this.moveRequestRepo.create(data);
    return this.moveRequestRepo.save(entity);
  }

  async findById(id: number): Promise<MoveRequest | null> {
    return this.moveRequestRepo.findOne({
      where: { id },
      relations: ['video'],
    });
  }

  async findByIdAndUser(id: number, userId: number): Promise<MoveRequest | null> {
    return this.moveRequestRepo.findOne({
      where: { id, userId },
      relations: ['video'],
    });
  }

  async findAllByUser(userId: number, params: PaginationParams): Promise<{ data: MoveRequest[]; meta: PaginationMeta }> {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await this.moveRequestRepo.findAndCount({
      where: { userId },
      relations: ['video'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return { data, meta };
  }

  async update(id: number, data: Partial<MoveRequest>): Promise<MoveRequest> {
    await this.moveRequestRepo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException(`Move request with id ${id} not found after update`);
    }
    return updated;
  }

  async updateStatus(id: number, status: MoveRequestStatus): Promise<MoveRequest> {
    return this.update(id, { status });
  }

  async delete(id: number): Promise<void> {
    const result = await this.moveRequestRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Move request with id ${id} not found`);
    }
  }

  async existsForUser(id: number, userId: number): Promise<boolean> {
    const count = await this.moveRequestRepo.count({ where: { id, userId } });
    return count > 0;
  }

  // --- Video operations ---

  async createVideo(data: Partial<RequestVideo>): Promise<RequestVideo> {
    const entity = this.videoRepo.create(data);
    return this.videoRepo.save(entity);
  }

  async findVideoByRequestId(moveRequestId: number): Promise<RequestVideo | null> {
    return this.videoRepo.findOne({ where: { moveRequestId } });
  }

  async deleteVideo(id: number): Promise<void> {
    await this.videoRepo.delete(id);
  }

  // --- Item (Inventory) operations ---

  async createItem(data: Partial<MoveRequestItem>): Promise<MoveRequestItem> {
    const entity = this.itemRepo.create(data);
    return this.itemRepo.save(entity);
  }

  async findItemById(itemId: number, moveRequestId: number): Promise<MoveRequestItem | null> {
    return this.itemRepo.findOne({ where: { id: itemId, moveRequestId } });
  }

  async findItemsByRequestId(moveRequestId: number): Promise<MoveRequestItem[]> {
    return this.itemRepo.find({
      where: { moveRequestId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateItem(itemId: number, data: Partial<MoveRequestItem>): Promise<MoveRequestItem> {
    await this.itemRepo.update(itemId, data);
    const updated = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!updated) {
      throw new NotFoundException(`Item with id ${itemId} not found after update`);
    }
    return updated;
  }

  async deleteItem(itemId: number): Promise<void> {
    const result = await this.itemRepo.delete(itemId);
    if (result.affected === 0) {
      throw new NotFoundException(`Item with id ${itemId} not found`);
    }
  }

  async deleteAllItemsForRequest(moveRequestId: number): Promise<void> {
    await this.itemRepo.delete({ moveRequestId });
  }

  async bulkCreateItems(items: Partial<MoveRequestItem>[]): Promise<MoveRequestItem[]> {
    const entities = this.itemRepo.create(items);
    return this.itemRepo.save(entities);
  }

  async countItemsByRequestId(moveRequestId: number): Promise<number> {
    return this.itemRepo.count({ where: { moveRequestId } });
  }

  /**
   * Find move requests available for a company to bid on.
   * Excludes requests that already have an offer from this company.
   */
  async findAvailableForCompany(companyId: number, limit: number = 20): Promise<MoveRequest[]> {
    const existingOffers = await this.offerRepo.find({
      where: { companyId },
      select: ['moveRequestId'],
    });
    const excludedIds = existingOffers.map((o) => o.moveRequestId);

    const query = this.moveRequestRepo
      .createQueryBuilder('mr')
      .leftJoinAndSelect('mr.user', 'user')
      .leftJoinAndSelect('mr.items', 'items')
      .where('mr.status IN (:...statuses)', {
        statuses: [MoveRequestStatus.READY_FOR_REQUEST, MoveRequestStatus.SENT_TO_COMPANIES],
      });

    if (excludedIds.length > 0) {
      query.andWhere('mr.id NOT IN (:...excludedIds)', { excludedIds });
    }

    query.orderBy('mr.createdAt', 'DESC').take(limit);

    return query.getMany();
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { MoveRequest, MoveRequestStatus } from './entities/move-request.entity';
import { RequestVideo } from './entities/request-video.entity';
import { MoveRequestItem } from './entities/move-request-item.entity';
import { RequestsRepository } from './requests.repository';
import { S3Service } from '@shared/services/s3.service';
import { PricingService, CompanyEstimate } from '@modules/pricing/pricing.service';
import { TeamsService } from '@modules/teams/teams.service';
import { ConversationsService } from '@modules/conversations/conversations.service';
import { CreateMoveRequestDto } from './dto/create-move-request.dto';
import { UpdateMoveRequestDto } from './dto/update-move-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { InitiateVideoUploadDto } from './dto/upload-video.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { BulkItemsDto } from './dto/bulk-items.dto';
import { PaginationMeta } from '@common/interfaces/pagination.interface';

export interface PresignedUploadResult {
  uploadUrl: string;
  s3Key: string;
  videoId: number;
  expiresAt: Date;
}

export interface MoveRequestListResult {
  data: MoveRequest[];
  meta: PaginationMeta;
}

export interface EstimateResult {
  moveRequestId: number;
  distanceKm: number;
  estimates: CompanyEstimate[];
  inventorySummary: {
    totalItems: number;
    totalQuantity: number;
    totalVolume: number;
    totalWeight: number;
    aiDetectedCount: number;
  };
}

/**
 * Valid status transitions for move requests.
 * Prevents invalid state changes (e.g., DRAFT → SENT_TO_COMPANIES directly).
 */
const VALID_STATUS_TRANSITIONS: Record<MoveRequestStatus, MoveRequestStatus[]> = {
  [MoveRequestStatus.DRAFT]: [MoveRequestStatus.VIDEO_UPLOADED],
  [MoveRequestStatus.VIDEO_UPLOADED]: [MoveRequestStatus.AI_PROCESSED, MoveRequestStatus.READY_FOR_REQUEST],
  [MoveRequestStatus.AI_PROCESSED]: [MoveRequestStatus.READY_FOR_REQUEST],
  [MoveRequestStatus.READY_FOR_REQUEST]: [MoveRequestStatus.SENT_TO_COMPANIES],
  [MoveRequestStatus.SENT_TO_COMPANIES]: [],
};

@Injectable()
export class RequestsService {
  constructor(
    private readonly requestsRepository: RequestsRepository,
    private readonly s3Service: S3Service,
    private readonly pricingService: PricingService,
    private readonly teamsService: TeamsService,
    private readonly conversationsService: ConversationsService,
  ) {}

  /**
   * Create a new move request for a customer.
   * Initial status is always DRAFT.
   */
  async create(userId: number, dto: CreateMoveRequestDto): Promise<MoveRequest> {
    const moveRequest = await this.requestsRepository.create({
      userId,
      originAddress: dto.originAddress,
      destinationAddress: dto.destinationAddress,
      moveDate: new Date(dto.moveDate),
      floorsOrigin: dto.floorsOrigin ?? 0,
      floorsDestination: dto.floorsDestination ?? 0,
      parkingDistance: dto.parkingDistance ?? null,
      extras: dto.extras ?? null,
      status: MoveRequestStatus.DRAFT,
    });

    return moveRequest;
  }

  /**
   * Get a single move request by ID.
   * Validates ownership — only the owning user (or admin) can access.
   */
  async findById(id: number, requestingUserId: number, isAdmin: boolean = false): Promise<MoveRequest> {
    const moveRequest = isAdmin
      ? await this.requestsRepository.findById(id)
      : await this.requestsRepository.findByIdAndUser(id, requestingUserId);

    if (!moveRequest) {
      throw new NotFoundException(`Move request with id ${id} not found`);
    }

    return moveRequest;
  }

  /**
   * List all move requests for a specific user.
   */
  async findAllByUser(userId: number, page: number, limit: number): Promise<MoveRequestListResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    return this.requestsRepository.findAllByUser(userId, {
      page: safePage,
      limit: safeLimit,
    });
  }

  /**
   * Update a move request.
   * Only the owning user can update. Cannot update if already sent to companies.
   */
  async update(
    id: number,
    userId: number,
    dto: UpdateMoveRequestDto,
    isAdmin: boolean = false,
  ): Promise<MoveRequest> {
    const moveRequest = await this.findById(id, userId, isAdmin);

    if (!isAdmin && moveRequest.status === MoveRequestStatus.SENT_TO_COMPANIES) {
      throw new BadRequestException('Cannot update a move request that has already been sent to companies');
    }

    const updateData: Partial<MoveRequest> = {};

    if (dto.originAddress !== undefined) updateData.originAddress = dto.originAddress;
    if (dto.destinationAddress !== undefined) updateData.destinationAddress = dto.destinationAddress;
    if (dto.moveDate !== undefined) updateData.moveDate = new Date(dto.moveDate);
    if (dto.floorsOrigin !== undefined) updateData.floorsOrigin = dto.floorsOrigin;
    if (dto.floorsDestination !== undefined) updateData.floorsDestination = dto.floorsDestination;
    if (dto.parkingDistance !== undefined) updateData.parkingDistance = dto.parkingDistance;
    if (dto.extras !== undefined) updateData.extras = dto.extras;

    return this.requestsRepository.update(id, updateData);
  }

  /**
   * Transition move request status.
   * Enforces valid state transitions.
   */
  async updateStatus(
    id: number,
    userId: number,
    dto: UpdateStatusDto,
    isAdmin: boolean = false,
  ): Promise<MoveRequest> {
    const moveRequest = await this.findById(id, userId, isAdmin);
    const newStatus = dto.status;
    const currentStatus = moveRequest.status;

    if (currentStatus === newStatus) {
      return moveRequest;
    }

    const validNextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] || [];

    if (!isAdmin && !validNextStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Valid transitions: ${validNextStatuses.join(', ') || 'none'}`,
      );
    }

    const updateData: Partial<MoveRequest> = { status: newStatus };

    if (newStatus === MoveRequestStatus.SENT_TO_COMPANIES) {
      updateData.sentAt = new Date();
      if (dto.selectedCompanyId) {
        updateData.selectedCompanyId = dto.selectedCompanyId;
      }
    }

    const updated = await this.requestsRepository.update(id, updateData);

    // Auto-create conversation only for the selected company when request is sent
    if (newStatus === MoveRequestStatus.SENT_TO_COMPANIES) {
      try {
        const targetCompanyId = dto.selectedCompanyId;
        if (targetCompanyId) {
          const conv = await this.conversationsService.ensureConversation(id, targetCompanyId, moveRequest.userId);
          await this.conversationsService.sendSystemMessage(conv.id, 'Anfrage wurde erstellt und an Umzugsunternehmen gesendet.');
        }
      } catch {
        // Silently fail conversation creation — don't block the status update
      }
    }

    return updated;
  }

  /**
   * Delete a move request.
   * Only the owning user (or admin) can delete.
   * Cannot delete if already sent to companies.
   */
  async delete(id: number, userId: number, isAdmin: boolean = false): Promise<void> {
    const moveRequest = await this.findById(id, userId, isAdmin);

    if (!isAdmin && moveRequest.status === MoveRequestStatus.SENT_TO_COMPANIES) {
      throw new BadRequestException('Cannot delete a move request that has already been sent to companies');
    }

    await this.requestsRepository.delete(id);
  }

  // --- Video Upload Flow ---

  /**
   * Step 1: Initiate video upload.
   * Generates a pre-signed S3 PUT URL for direct client upload.
   */
  async initiateVideoUpload(
    moveRequestId: number,
    userId: number,
    dto: InitiateVideoUploadDto,
  ): Promise<PresignedUploadResult> {
    const moveRequest = await this.findById(moveRequestId, userId);

    if (moveRequest.status !== MoveRequestStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot upload video for a move request with status ${moveRequest.status}. Only DRAFT requests accept video uploads.`,
      );
    }

    const existingVideo = await this.requestsRepository.findVideoByRequestId(moveRequestId);
    if (existingVideo) {
      throw new ConflictException('A video has already been uploaded for this move request');
    }

    const s3Key = this.s3Service.generateVideoKey(userId);
    const presigned = await this.s3Service.getPresignedPutUrl(
      s3Key,
      dto.contentType ?? 'video/mp4',
      900,
    );

    const video = await this.requestsRepository.createVideo({
      moveRequestId,
      s3Key: presigned.s3Key,
      s3Url: null,
      contentType: dto.contentType ?? 'video/mp4',
      fileSizeBytes: dto.fileSizeBytes ?? null,
      uploadedAt: new Date(),
      expiresAt: presigned.expiresAt,
    });

    await this.requestsRepository.updateStatus(moveRequestId, MoveRequestStatus.VIDEO_UPLOADED);

    return {
      uploadUrl: presigned.uploadUrl,
      s3Key: presigned.s3Key,
      videoId: video.id,
      expiresAt: presigned.expiresAt,
    };
  }

  /**
   * Upload video directly to the server (development mode fallback).
   */
  async uploadVideoDirectly(moveRequestId: number, userId: number, file: Express.Multer.File): Promise<RequestVideo> {
    const moveRequest = await this.findById(moveRequestId, userId);

    if (moveRequest.status !== MoveRequestStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot upload video for a move request with status ${moveRequest.status}. Only DRAFT requests accept video uploads.`,
      );
    }

    const existingVideo = await this.requestsRepository.findVideoByRequestId(moveRequestId);
    if (existingVideo) {
      throw new ConflictException('A video has already been uploaded for this move request');
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    const video = await this.requestsRepository.createVideo({
      moveRequestId,
      s3Key: filePath,
      s3Url: `/uploads/videos/${filename}`,
      contentType: file.mimetype,
      fileSizeBytes: file.size,
      uploadedAt: new Date(),
      expiresAt: null,
    });

    await this.requestsRepository.updateStatus(moveRequestId, MoveRequestStatus.VIDEO_UPLOADED);

    return video;
  }

  /**
   * Step 2: Confirm video upload after client has uploaded to S3.
   */
  async confirmVideoUpload(moveRequestId: number, userId: number, videoId: number): Promise<RequestVideo> {
    await this.findById(moveRequestId, userId);

    const video = await this.requestsRepository.findVideoByRequestId(moveRequestId);

    if (!video || video.id !== videoId) {
      throw new NotFoundException('Video record not found for this move request');
    }

    const updatedVideo = await this.requestsRepository.createVideo({
      ...video,
      id: video.id,
      s3Url: `https://s3.amazonaws.com/${video.s3Key}`,
    });

    return updatedVideo;
  }

  /**
   * Delete a video from S3 and the database.
   */
  async deleteVideo(moveRequestId: number, userId: number, isAdmin: boolean = false): Promise<void> {
    const moveRequest = await this.findById(moveRequestId, userId, isAdmin);

    const video = await this.requestsRepository.findVideoByRequestId(moveRequestId);
    if (!video) {
      throw new NotFoundException('No video found for this move request');
    }

    // In development mode videos may be stored locally; only call S3 if key looks like an S3 key
    if (!video.s3Key.includes(process.cwd())) {
      await this.s3Service.deleteObject(video.s3Key);
    } else if (fs.existsSync(video.s3Key)) {
      fs.unlinkSync(video.s3Key);
    }
    await this.requestsRepository.deleteVideo(video.id);

    if (moveRequest.status === MoveRequestStatus.VIDEO_UPLOADED) {
      await this.requestsRepository.updateStatus(moveRequestId, MoveRequestStatus.DRAFT);
    }
  }

  // --- Inventory (Item) Operations ---

  /**
   * Add a single item to a move request inventory.
   * Validates ownership of the move request.
   */
  async addItem(
    moveRequestId: number,
    userId: number,
    dto: CreateItemDto,
    isAdmin: boolean = false,
  ): Promise<MoveRequestItem> {
    await this.findById(moveRequestId, userId, isAdmin);

    return this.requestsRepository.createItem({
      moveRequestId,
      name: dto.name,
      quantity: dto.quantity,
      volume: dto.volume ?? null,
      weight: dto.weight ?? null,
      isAiDetected: dto.isAiDetected ?? false,
      confidenceScore: dto.confidenceScore ?? null,
    });
  }

  /**
   * Get all inventory items for a move request.
   * Validates ownership.
   */
  async getItems(
    moveRequestId: number,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<MoveRequestItem[]> {
    await this.findById(moveRequestId, userId, isAdmin);
    return this.requestsRepository.findItemsByRequestId(moveRequestId);
  }

  /**
   * Update a single inventory item.
   * Validates ownership of the move request and verifies the item belongs to it.
   */
  async updateItem(
    moveRequestId: number,
    itemId: number,
    userId: number,
    dto: UpdateItemDto,
    isAdmin: boolean = false,
  ): Promise<MoveRequestItem> {
    await this.findById(moveRequestId, userId, isAdmin);

    const item = await this.requestsRepository.findItemById(itemId, moveRequestId);
    if (!item) {
      throw new NotFoundException(`Item with id ${itemId} not found for this move request`);
    }

    const updateData: Partial<MoveRequestItem> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.volume !== undefined) updateData.volume = dto.volume ?? null;
    if (dto.weight !== undefined) updateData.weight = dto.weight ?? null;
    if (dto.isAiDetected !== undefined) updateData.isAiDetected = dto.isAiDetected;
    if (dto.confidenceScore !== undefined) updateData.confidenceScore = dto.confidenceScore ?? null;

    return this.requestsRepository.updateItem(itemId, updateData);
  }

  /**
   * Delete a single inventory item.
   * Validates ownership and item association.
   */
  async deleteItem(
    moveRequestId: number,
    itemId: number,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<void> {
    await this.findById(moveRequestId, userId, isAdmin);

    const item = await this.requestsRepository.findItemById(itemId, moveRequestId);
    if (!item) {
      throw new NotFoundException(`Item with id ${itemId} not found for this move request`);
    }

    await this.requestsRepository.deleteItem(itemId);
  }

  /**
   * Bulk replace all inventory items for a move request.
   * Deletes existing items and inserts the new set atomically.
   */
  async bulkReplaceItems(
    moveRequestId: number,
    userId: number,
    dto: BulkItemsDto,
    isAdmin: boolean = false,
  ): Promise<MoveRequestItem[]> {
    await this.findById(moveRequestId, userId, isAdmin);

    await this.requestsRepository.deleteAllItemsForRequest(moveRequestId);

    const newItems = dto.items.map((itemDto) => ({
      moveRequestId,
      name: itemDto.name,
      quantity: itemDto.quantity,
      volume: itemDto.volume ?? null,
      weight: itemDto.weight ?? null,
      isAiDetected: itemDto.isAiDetected ?? false,
      confidenceScore: itemDto.confidenceScore ?? null,
    }));

    return this.requestsRepository.bulkCreateItems(newItems);
  }

  /**
   * Get inventory summary for a move request.
   */
  async getInventorySummary(
    moveRequestId: number,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<{ totalItems: number; totalQuantity: number; totalVolume: number; totalWeight: number; aiDetectedCount: number }> {
    await this.findById(moveRequestId, userId, isAdmin);

    const items = await this.requestsRepository.findItemsByRequestId(moveRequestId);

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalVolume = items.reduce((sum, item) => sum + (item.volume ?? 0) * item.quantity, 0);
    const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 0) * item.quantity, 0);
    const aiDetectedCount = items.filter((item) => item.isAiDetected).length;

    return {
      totalItems: items.length,
      totalQuantity,
      totalVolume: Math.round(totalVolume * 100) / 100,
      totalWeight: Math.round(totalWeight * 100) / 100,
      aiDetectedCount,
    };
  }

  /**
   * Find move requests available for a company to bid on.
   */
  async findAvailableForCompany(companyId: number): Promise<MoveRequest[]> {
    return this.requestsRepository.findAvailableForCompany(companyId);
  }

  // --- Pricing Estimate ---

  /**
   * Calculate price estimates for a move request across all approved, available companies.
   * Loads inventory, checks team availability for the move date, then delegates to PricingService.
   */
  async estimate(
    moveRequestId: number,
    userId: number,
    distanceKm: number,
    isAdmin: boolean = false,
  ): Promise<EstimateResult> {
    const moveRequest = await this.findById(moveRequestId, userId, isAdmin);

    // Validate distance
    if (distanceKm <= 0) {
      throw new BadRequestException('Distance must be greater than 0 kilometers');
    }

    // Get inventory summary
    const inventorySummary = await this.getInventorySummary(moveRequestId, userId, isAdmin);

    // Build extras object
    const extras = moveRequest.extras ?? null;

    // Find companies with available capacity on the move date
    const availableCompanyIds = await this.teamsService.findAvailableCompanyIds(moveRequest.moveDate);

    // Calculate estimates only for available companies
    const estimates = await this.pricingService.calculateEstimatesForAllCompanies(
      inventorySummary,
      distanceKm,
      extras,
      availableCompanyIds,
    );

    return {
      moveRequestId,
      distanceKm,
      estimates,
      inventorySummary,
    };
  }
}

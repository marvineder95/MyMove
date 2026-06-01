import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { RequestsService, EstimateResult } from './requests.service';
import { MoveRequest } from './entities/move-request.entity';
import { RequestVideo } from './entities/request-video.entity';
import { MoveRequestItem } from './entities/move-request-item.entity';
import { CreateMoveRequestDto } from './dto/create-move-request.dto';
import { UpdateMoveRequestDto } from './dto/update-move-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { InitiateVideoUploadDto } from './dto/upload-video.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { BulkItemsDto } from './dto/bulk-items.dto';
import { PaginationMeta } from '@common/interfaces/pagination.interface';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

interface MoveRequestListResponse {
  data: MoveRequest[];
  meta: PaginationMeta;
}

interface VideoUploadInitiateResponse {
  uploadUrl: string;
  s3Key: string;
  videoId: number;
  expiresAt: Date;
}

@ApiTags('Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // --- Customer endpoints ---

  @Post()
  @Roles(UserRole.END_CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new move request (customer)' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMoveRequestDto,
  ): Promise<MoveRequest> {
    const userId = Number(user.userId);
    return this.requestsService.create(userId, dto);
  }

  @Get('my')
  @Roles(UserRole.END_CUSTOMER)
  @ApiOperation({ summary: 'Get all move requests for the current customer' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyRequests(
    @CurrentUser() user: AuthUser,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ): Promise<MoveRequestListResponse> {
    const userId = Number(user.userId);
    const page = pageParam ? Number(pageParam) : 1;
    const limit = limitParam ? Number(limitParam) : 10;
    return this.requestsService.findAllByUser(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a move request by ID (owner or admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async getById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MoveRequest> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.findById(id, userId, isAdmin);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a move request (owner or admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMoveRequestDto,
  ): Promise<MoveRequest> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.update(id, userId, dto, isAdmin);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update move request status (owner or admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ): Promise<MoveRequest> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.updateStatus(id, userId, dto, isAdmin);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a move request (owner or admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.delete(id, userId, isAdmin);
  }

  // --- Video upload endpoints ---

  @Post(':id/video')
  @Roles(UserRole.END_CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate video upload — returns pre-signed S3 URL' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async initiateVideoUpload(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InitiateVideoUploadDto,
  ): Promise<VideoUploadInitiateResponse> {
    const userId = Number(user.userId);
    return this.requestsService.initiateVideoUpload(id, userId, dto);
  }

  @Post(':id/video/upload')
  @Roles(UserRole.END_CUSTOMER)
  @UseInterceptors(FileInterceptor('video', { storage: memoryStorage() }))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload video directly to the server (development mode)' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async uploadVideoDirectly(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<RequestVideo> {
    const userId = Number(user.userId);
    return this.requestsService.uploadVideoDirectly(id, userId, file);
  }

  @Post(':id/video/confirm')
  @Roles(UserRole.END_CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm video upload after client has uploaded to S3' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async confirmVideoUpload(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body('videoId', ParseIntPipe) videoId: number,
  ): Promise<RequestVideo> {
    const userId = Number(user.userId);
    return this.requestsService.confirmVideoUpload(id, userId, videoId);
  }

  @Delete(':id/video')
  @Roles(UserRole.END_CUSTOMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete video from S3 and database' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async deleteVideo(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.deleteVideo(id, userId, isAdmin);
  }

  // --- Inventory (Item) endpoints ---

  @Post(':id/items')
  @Roles(UserRole.END_CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a single inventory item to a move request' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async addItem(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateItemDto,
  ): Promise<MoveRequestItem> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.addItem(id, userId, dto, isAdmin);
  }

  @Put(':id/items')
  @Roles(UserRole.END_CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk replace all inventory items for a move request' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async bulkReplaceItems(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BulkItemsDto,
  ): Promise<MoveRequestItem[]> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.bulkReplaceItems(id, userId, dto, isAdmin);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get all inventory items for a move request (owner or admin)' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async getItems(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MoveRequestItem[]> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.getItems(id, userId, isAdmin);
  }

  @Get(':id/items/summary')
  @ApiOperation({ summary: 'Get inventory summary (totals) for a move request' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  async getInventorySummary(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ totalItems: number; totalQuantity: number; totalVolume: number; totalWeight: number; aiDetectedCount: number }> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.getInventorySummary(id, userId, isAdmin);
  }

  @Patch(':id/items/:itemId')
  @Roles(UserRole.END_CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a single inventory item' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  @ApiParam({ name: 'itemId', type: Number, description: 'Inventory item ID' })
  async updateItem(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateItemDto,
  ): Promise<MoveRequestItem> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.updateItem(id, itemId, userId, dto, isAdmin);
  }

  @Delete(':id/items/:itemId')
  @Roles(UserRole.END_CUSTOMER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a single inventory item' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  @ApiParam({ name: 'itemId', type: Number, description: 'Inventory item ID' })
  async deleteItem(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ): Promise<void> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    return this.requestsService.deleteItem(id, itemId, userId, isAdmin);
  }

  // --- Pricing Estimate ---

  @Get(':id/estimate')
  @ApiOperation({ summary: 'Get price estimates for a move request from all approved companies' })
  @ApiParam({ name: 'id', type: Number, description: 'Move request ID' })
  @ApiQuery({ name: 'distance_km', required: true, type: Number, description: 'Distance between origin and destination in kilometers' })
  async getEstimate(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Query('distance_km') distanceKmParam: string,
  ): Promise<EstimateResult> {
    const userId = Number(user.userId);
    const isAdmin = user.role === UserRole.ADMIN;
    const distanceKm = Number(distanceKmParam);
    return this.requestsService.estimate(id, userId, distanceKm, isAdmin);
  }
}

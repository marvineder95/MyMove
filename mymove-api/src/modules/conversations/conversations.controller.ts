import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { ConfirmFileUploadDto } from './dto/confirm-file-upload.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { SenderType } from './entities/message.entity';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @Roles(UserRole.END_CUSTOMER, UserRole.COMPANY)
  @ApiOperation({ summary: 'List my conversations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findMyConversations(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const role = user.role as UserRole;
    const actorId = role === UserRole.COMPANY && user.companyId
      ? Number(user.companyId)
      : Number(user.userId);
    return this.conversationsService.findMyConversations(
      actorId,
      role,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('unread-count')
  @Roles(UserRole.END_CUSTOMER, UserRole.COMPANY)
  @ApiOperation({ summary: 'Get total unread message count' })
  async getUnreadCount(@CurrentUser() user: any) {
    const role = user.role as UserRole;
    const actorId = role === UserRole.COMPANY && user.companyId
      ? Number(user.companyId)
      : Number(user.userId);
    const count = await this.conversationsService.getUnreadCount(actorId, role);
    return { count };
  }

  @Get(':id')
  @Roles(UserRole.END_CUSTOMER, UserRole.COMPANY)
  @ApiOperation({ summary: 'Get conversation by ID' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    const role = user.role as UserRole;
    const actorId = role === UserRole.COMPANY && user.companyId
      ? Number(user.companyId)
      : Number(user.userId);
    return this.conversationsService.findOne(id, actorId, role);
  }

  @Get(':id/messages')
  @Roles(UserRole.END_CUSTOMER, UserRole.COMPANY)
  @ApiOperation({ summary: 'Get messages in a conversation' })
  @ApiParam({ name: 'id', type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessages(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const role = user.role as UserRole;
    const actorId = role === UserRole.COMPANY && user.companyId
      ? Number(user.companyId)
      : Number(user.userId);
    return this.conversationsService.getMessages(
      id,
      actorId,
      role,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post(':id/messages')
  @Roles(UserRole.END_CUSTOMER, UserRole.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message' })
  @ApiParam({ name: 'id', type: Number })
  async sendMessage(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: SendMessageDto,
  ) {
    const role = user.role as UserRole;
    const actorId = role === UserRole.COMPANY && user.companyId
      ? Number(user.companyId)
      : Number(user.userId);
    const senderType = role === UserRole.COMPANY ? SenderType.COMPANY : SenderType.CUSTOMER;

    // Verify access
    await this.conversationsService.findOne(id, actorId, role);

    return this.conversationsService.sendMessage(id, actorId, senderType, dto.content);
  }

  @Post(':id/files')
  @Roles(UserRole.END_CUSTOMER, UserRole.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request S3 presigned URL for file upload' })
  @ApiParam({ name: 'id', type: Number })
  async requestFileUpload(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UploadFileDto,
  ) {
    const role = user.role as UserRole;
    const actorId = role === UserRole.COMPANY && user.companyId
      ? Number(user.companyId)
      : Number(user.userId);
    return this.conversationsService.requestFileUpload(
      id,
      actorId,
      role,
      dto.fileType,
      dto.fileName,
    );
  }

  @Post(':id/files/confirm')
  @Roles(UserRole.END_CUSTOMER, UserRole.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Confirm file upload and create file message' })
  @ApiParam({ name: 'id', type: Number })
  async confirmFileUpload(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: ConfirmFileUploadDto,
  ) {
    const role = user.role as UserRole;
    const actorId = role === UserRole.COMPANY && user.companyId
      ? Number(user.companyId)
      : Number(user.userId);
    const senderType = role === UserRole.COMPANY ? SenderType.COMPANY : SenderType.CUSTOMER;

    // Verify access
    await this.conversationsService.findOne(id, actorId, role);

    return this.conversationsService.confirmFileUpload(
      id,
      actorId,
      senderType,
      dto.s3Key,
      dto.fileType,
      dto.fileName,
      dto.fileSize,
    );
  }

  @Patch(':id/read')
  @Roles(UserRole.END_CUSTOMER, UserRole.COMPANY)
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiParam({ name: 'id', type: Number })
  async markRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: MarkReadDto,
  ) {
    const role = user.role as UserRole;
    const actorId = role === UserRole.COMPANY && user.companyId
      ? Number(user.companyId)
      : Number(user.userId);
    await this.conversationsService.markRead(id, dto.messageIds, actorId, role);
    return { success: true };
  }
}

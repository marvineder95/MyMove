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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { OffersService } from './offers.service';
import { Offer, OfferStatus } from './entities/offer.entity';
import { CreateOfferDto, UpdateOfferDto } from './dto/create-offer.dto';
import { SendOfferDto } from './dto/send-offer.dto';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  // --- Company endpoints ---

  @Post()
  @Roles(UserRole.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new offer for a move request' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateOfferDto,
  ): Promise<Offer> {
    const companyId = Number(user.userId);
    return this.offersService.create(
      companyId,
      dto.moveRequestId,
      dto.price,
      dto.breakdown ?? null,
      dto.message ?? null,
      dto.teamId ?? null,
    );
  }

  @Get('my')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get all offers created by the current company' })
  async getMyOffers(@CurrentUser() user: AuthUser): Promise<Offer[]> {
    const companyId = Number(user.userId);
    return this.offersService.findByCompany(companyId);
  }

  @Get('my/status/:status')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get offers by status for the current company' })
  @ApiParam({ name: 'status', enum: OfferStatus, description: 'Offer status filter' })
  async getMyOffersByStatus(
    @CurrentUser() user: AuthUser,
    @Param('status') status: OfferStatus,
  ): Promise<Offer[]> {
    const companyId = Number(user.userId);
    return this.offersService.findByCompanyAndStatus(companyId, status);
  }

  @Get(':id')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get a specific offer (company owner)' })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  async getById(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Offer> {
    const companyId = Number(user.userId);
    return this.offersService.findOfferById(id, companyId);
  }

  @Patch(':id')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Update a draft offer' })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOfferDto,
  ): Promise<Offer> {
    const companyId = Number(user.userId);
    return this.offersService.update(
      id,
      companyId,
      dto.price,
      dto.breakdown,
      dto.message,
      dto.teamId,
    );
  }

  @Post(':id/send')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Send an offer to the customer' })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  async send(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Offer> {
    const companyId = Number(user.userId);
    return this.offersService.send(id, companyId);
  }

  @Delete(':id')
  @Roles(UserRole.COMPANY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a draft offer' })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const companyId = Number(user.userId);
    return this.offersService.delete(id, companyId);
  }

  // --- Customer endpoints ---

  @Get('requests/:requestId')
  @Roles(UserRole.END_CUSTOMER)
  @ApiOperation({ summary: 'Get all offers for a move request (customer)' })
  @ApiParam({ name: 'requestId', type: Number, description: 'Move request ID' })
  async getOffersForRequest(
    @CurrentUser() user: AuthUser,
    @Param('requestId', ParseIntPipe) requestId: number,
  ): Promise<Offer[]> {
    const userId = Number(user.userId);
    return this.offersService.findByMoveRequest(requestId, userId);
  }

  @Post(':id/accept')
  @Roles(UserRole.END_CUSTOMER)
  @ApiOperation({ summary: 'Accept an offer (customer)' })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  async accept(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Offer> {
    const userId = Number(user.userId);
    return this.offersService.accept(id, userId);
  }

  @Post(':id/reject')
  @Roles(UserRole.END_CUSTOMER)
  @ApiOperation({ summary: 'Reject an offer (customer)' })
  @ApiParam({ name: 'id', type: Number, description: 'Offer ID' })
  async reject(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Offer> {
    const userId = Number(user.userId);
    return this.offersService.reject(id, userId);
  }
}

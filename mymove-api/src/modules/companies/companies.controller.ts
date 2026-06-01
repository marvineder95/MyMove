import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { UserRole } from '@common/enums/user-role.enum';
import { CompaniesService } from './companies.service';
import { PricingService } from '@modules/pricing/pricing.service';
import { S3Service } from '@shared/services/s3.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CreatePricingDto } from '@modules/pricing/dto/create-pricing.dto';
import { UpdatePricingDto } from '@modules/pricing/dto/update-pricing.dto';
import { Company, CompanyStatus } from './entities/company.entity';
import { CompanyDocument } from './entities/company-document.entity';
import { CompanyPricing } from '@modules/pricing/entities/company-pricing.entity';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
}

@ApiTags('companies')
@Controller()
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly pricingService: PricingService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('companies')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Create a new company profile' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCompanyDto,
  ): Promise<Company> {
    const userId = parseInt(user.userId, 10);
    return this.companiesService.create(userId, dto);
  }

  @Get('companies/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get the current user\'s company profile' })
  async getMyCompany(@CurrentUser() user: AuthUser): Promise<Company> {
    const userId = parseInt(user.userId, 10);
    return this.companiesService.findByUserId(userId);
  }

  @Get('companies/me/dashboard')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get dashboard stats for the current company' })
  async getMyDashboard(@CurrentUser() user: AuthUser) {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    return this.companiesService.getDashboardStats(company.id);
  }

  @Get('companies/me/available-requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get available move requests for the current company' })
  async getAvailableRequests(@CurrentUser() user: AuthUser) {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    return this.companiesService.getAvailableRequests(company.id);
  }

  @Patch('companies/me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Update the current user\'s company profile' })
  async updateMyCompany(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCompanyDto,
  ): Promise<Company> {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    return this.companiesService.update(company.id, dto);
  }

  @Get('companies/me/profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get full company profile with completeness' })
  async getMyProfile(@CurrentUser() user: AuthUser) {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    const completeness = await this.companiesService.getProfileCompleteness(company.id);
    return { company, completeness };
  }

  @Get('companies/:id/public')
  @Public()
  @ApiOperation({ summary: 'Get public company profile' })
  @ApiParam({ name: 'id', type: Number, description: 'Company ID' })
  async getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getPublicProfile(id);
  }

  @Get('companies')
  @Public()
  @ApiOperation({ summary: 'List all companies with optional status filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: CompanyStatus, example: CompanyStatus.APPROVED })
  async findAll(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('status') status?: CompanyStatus,
  ): Promise<{ data: Company[]; meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }> {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    return this.companiesService.findAll(page, limit, status);
  }

  @Get('companies/:id')
  @Public()
  @ApiOperation({ summary: 'Get a company by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Company ID' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Company> {
    return this.companiesService.findById(id);
  }

  @Post('companies/me/documents')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Upload a company document' })
  async uploadDocument(
    @CurrentUser() user: AuthUser,
    @Body() dto: UploadDocumentDto,
  ): Promise<CompanyDocument> {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    return this.companiesService.uploadDocument(company.id, dto);
  }

  @Get('companies/me/documents')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get all documents for the current user\'s company' })
  async getMyDocuments(@CurrentUser() user: AuthUser): Promise<CompanyDocument[]> {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    return this.companiesService.getDocuments(company.id);
  }

  // --- Company Pricing ---

  @Get('companies/me/pricing')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get the current company\'s pricing configuration' })
  async getMyPricing(@CurrentUser() user: AuthUser): Promise<CompanyPricing> {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    const pricing = await this.pricingService.findByCompanyId(company.id);
    if (!pricing) {
      throw new NotFoundException('Pricing configuration not found for this company');
    }
    return pricing;
  }

  @Post('companies/me/pricing')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create pricing configuration for the current company' })
  async createPricing(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePricingDto,
  ): Promise<CompanyPricing> {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    return this.pricingService.createPricing(company.id, dto);
  }

  @Patch('companies/me/pricing')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Update pricing configuration for the current company' })
  async updatePricing(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePricingDto,
  ): Promise<CompanyPricing> {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    const updateData: Partial<CompanyPricing> = {};
    const fields: (keyof UpdatePricingDto)[] = [
      'baseFee', 'pricePerHour', 'pricePerKm', 'minimumHours', 'teamSize',
      'servicePrices', 'pricePerWorker', 'additionalWorkerPrice', 'travelFee',
      'boxRentalPrice', 'wardrobeBoxPrice', 'stretchFilmPrice', 'tapePrice',
      'mattressCoverPrice', 'furnitureBlanketPrice', 'packingServiceHourlyRate',
      'noParkingZonePrice', 'storagePricePerSqm', 'disposalServicePrice',
      'weekendSurcharge', 'holidaySurcharge', 'eveningSurcharge', 'urgentBookingSurcharge',
    ];
    for (const key of fields) {
      if (dto[key] !== undefined) {
        (updateData as any)[key] = dto[key];
      }
    }
    return this.pricingService.updatePricing(company.id, updateData);
  }

  @Delete('companies/me/pricing')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete pricing configuration for the current company' })
  async deletePricing(@CurrentUser() user: AuthUser): Promise<void> {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    await this.pricingService.deletePricing(company.id);
  }

  // --- Admin endpoints ---

  @Patch('admin/companies/:id/approve')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a company (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Company ID' })
  async approve(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Company> {
    const adminId = parseInt(user.userId, 10);
    return this.companiesService.approve(id, adminId);
  }

  @Patch('admin/companies/:id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a company (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Company ID' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string', example: 'Invalid trade license' } } } })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ): Promise<Company> {
    return this.companiesService.reject(id, reason);
  }

  @Post('companies/me/logo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Request S3 presigned URL for company logo upload' })
  async requestLogoUpload(
    @CurrentUser() user: AuthUser,
    @Body() dto: { fileType: string; fileName: string },
  ) {
    const userId = parseInt(user.userId, 10);
    const company = await this.companiesService.findByUserId(userId);
    if (!dto.fileType || !dto.fileName) {
      throw new BadRequestException('fileType and fileName are required');
    }
    const s3Key = `companies/${company.id}/logo/${Date.now()}_${dto.fileName}`;
    const result = await this.s3Service.getPresignedPutUrl(s3Key, dto.fileType, 900);
    return {
      uploadUrl: result.uploadUrl,
      s3Key: result.s3Key,
      logoUrl: this.s3Service.getPublicUrl(result.s3Key),
      expiresAt: result.expiresAt,
    };
  }

  @Patch('admin/companies/:id/suspend')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a company (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Company ID' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string', example: 'Fraudulent activity detected' } } } })
  async suspend(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ): Promise<Company> {
    return this.companiesService.suspend(id, reason);
  }

  @Get('admin/dashboard/stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getDashboardStats() {
    return this.companiesService.getAdminDashboardStats();
  }

  @Get('admin/companies')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all companies for admin (with documents)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: CompanyStatus })
  async adminFindAll(
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
    @Query('status') status?: CompanyStatus,
  ): Promise<{ data: Company[]; meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }> {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    return this.companiesService.findAll(page, limit, status);
  }

  @Get('admin/companies/:id/documents')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get documents for a company (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Company ID' })
  async adminGetDocuments(@Param('id', ParseIntPipe) id: number): Promise<CompanyDocument[]> {
    return this.companiesService.getDocuments(id);
  }

  @Patch('admin/documents/:id/verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a company document (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Document ID' })
  async verifyDocument(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompanyDocument> {
    const adminId = parseInt(user.userId, 10);
    return this.companiesService.verifyDocument(id, adminId);
  }

  @Patch('admin/documents/:id/reject')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a company document (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Document ID' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string', example: 'Document unclear' } } } })
  async rejectDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
  ): Promise<CompanyDocument> {
    return this.companiesService.rejectDocument(id, reason);
  }

  @Patch('admin/documents/:id/reset')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset a company document to pending (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Document ID' })
  async resetDocument(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompanyDocument> {
    return this.companiesService.resetDocument(id);
  }
}

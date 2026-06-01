import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CompaniesRepository } from './companies.repository';
import { Company, CompanyStatus } from './entities/company.entity';
import { CompanyDocument } from './entities/company-document.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { OffersService } from '@modules/offers/offers.service';
import { RequestsService } from '@modules/requests/requests.service';
import { OfferStatus } from '@modules/offers/entities/offer.entity';
import { MoveRequest, MoveRequestStatus } from '@modules/requests/entities/move-request.entity';
import { MoveRequestItem } from '@modules/requests/entities/move-request-item.entity';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companiesRepository: CompaniesRepository,
    private readonly offersService: OffersService,
    private readonly requestsService: RequestsService,
  ) {}

  async create(userId: number, dto: CreateCompanyDto): Promise<Company> {
    const existing = await this.companiesRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictException('User already has a registered company');
    }

    const slug = await this.generateUniqueSlug(dto.companyName);

    const company = await this.companiesRepository.create({
      userId,
      companyName: dto.companyName,
      slug,
      description: dto.description ?? null,
      website: dto.website ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      taxId: dto.taxId ?? null,
      serviceAreaJson: dto.serviceAreaJson ?? null,
      status: CompanyStatus.PENDING,
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null,
    });

    return company;
  }

  async findById(id: number): Promise<Company> {
    const company = await this.companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  async findByUserId(userId: number): Promise<Company> {
    const company = await this.companiesRepository.findByUserId(userId);
    if (!company) {
      throw new NotFoundException('Company not found for this user');
    }
    return company;
  }

  async findAll(page: number, limit: number, status?: CompanyStatus): Promise<{ data: Company[]; meta: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean } }> {
    if (page < 1) {
      throw new BadRequestException('Page must be at least 1');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    return this.companiesRepository.findAll({ page, limit, status });
  }

  async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    const updateData: Partial<Company> = {};

    if (dto.companyName !== undefined) {
      updateData.companyName = dto.companyName;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }
    if (dto.website !== undefined) {
      updateData.website = dto.website;
    }
    if (dto.phone !== undefined) {
      updateData.phone = dto.phone;
    }
    if (dto.email !== undefined) {
      updateData.email = dto.email;
    }
    if (dto.taxId !== undefined) {
      updateData.taxId = dto.taxId;
    }
    if (dto.bannerUrl !== undefined) { updateData.bannerUrl = dto.bannerUrl; }
    if (dto.logoUrl !== undefined) { updateData.logoUrl = dto.logoUrl; }
    if (dto.foundingYear !== undefined) { updateData.foundingYear = dto.foundingYear; }
    if (dto.employeeCount !== undefined) { updateData.employeeCount = dto.employeeCount; }
    if (dto.contactPerson !== undefined) { updateData.contactPerson = dto.contactPerson; }
    if (dto.supportEmail !== undefined) { updateData.supportEmail = dto.supportEmail; }
    if (dto.servicesJson !== undefined) { updateData.servicesJson = dto.servicesJson; }
    if (dto.mainLocation !== undefined) { updateData.mainLocation = dto.mainLocation; }
    if (dto.operatingRadiusKm !== undefined) { updateData.operatingRadiusKm = dto.operatingRadiusKm; }
    if (dto.supportedCitiesJson !== undefined) { updateData.supportedCitiesJson = dto.supportedCitiesJson; }
    if (dto.internationalMoves !== undefined) { updateData.internationalMoves = dto.internationalMoves; }
    if (dto.maxParallelJobs !== undefined) { updateData.maxParallelJobs = dto.maxParallelJobs; }
    if (dto.avgResponseTimeHours !== undefined) { updateData.avgResponseTimeHours = dto.avgResponseTimeHours; }
    if (dto.serviceAreaJson !== undefined) { updateData.serviceAreaJson = dto.serviceAreaJson; }
    if (dto.status !== undefined) { updateData.status = dto.status; }
    if (dto.rejectionReason !== undefined) { updateData.rejectionReason = dto.rejectionReason; }

    return this.companiesRepository.update(id, updateData);
  }

  async softDelete(id: number): Promise<void> {
    const company = await this.companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    await this.companiesRepository.softDelete(id);
  }

  async uploadDocument(companyId: number, dto: UploadDocumentDto): Promise<CompanyDocument> {
    const company = await this.companiesRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found`);
    }

    return this.companiesRepository.addDocument({
      companyId,
      documentType: dto.documentType,
      fileName: dto.fileName,
      fileUrl: dto.fileUrl,
      mimeType: dto.mimeType,
      fileSizeBytes: dto.fileSizeBytes,
    });
  }

  async getDocuments(companyId: number): Promise<CompanyDocument[]> {
    const company = await this.companiesRepository.findById(companyId);
    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found`);
    }
    return this.companiesRepository.findDocumentsByCompanyId(companyId);
  }

  async verifyDocument(documentId: number, adminId: number): Promise<CompanyDocument> {
    const doc = await this.companiesRepository.verifyDocument(documentId, adminId);
    return doc;
  }

  async rejectDocument(documentId: number, reason: string): Promise<CompanyDocument> {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required');
    }
    const doc = await this.companiesRepository.rejectDocument(documentId, reason.trim());
    return doc;
  }

  async resetDocument(documentId: number): Promise<CompanyDocument> {
    const doc = await this.companiesRepository.resetDocument(documentId);
    return doc;
  }

  async approve(id: number, adminId: number): Promise<Company> {
    const company = await this.companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    if (company.status === CompanyStatus.APPROVED) {
      throw new BadRequestException('Company is already approved');
    }

    return this.companiesRepository.update(id, {
      status: CompanyStatus.APPROVED,
      approvedAt: new Date(),
      approvedBy: adminId,
      rejectionReason: null,
    });
  }

  async reject(id: number, reason: string): Promise<Company> {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required');
    }

    const company = await this.companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    if (company.status === CompanyStatus.REJECTED) {
      throw new BadRequestException('Company is already rejected');
    }

    return this.companiesRepository.update(id, {
      status: CompanyStatus.REJECTED,
      rejectionReason: reason.trim(),
      approvedAt: null,
      approvedBy: null,
    });
  }

  async suspend(id: number, reason: string): Promise<Company> {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Suspension reason is required');
    }

    const company = await this.companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    if (company.status === CompanyStatus.SUSPENDED) {
      throw new BadRequestException('Company is already suspended');
    }

    return this.companiesRepository.update(id, {
      status: CompanyStatus.SUSPENDED,
      rejectionReason: reason.trim(),
      approvedAt: null,
      approvedBy: null,
    });
  }

  async getAdminDashboardStats() {
    const allCompanies = await this.companiesRepository.findAll({ page: 1, limit: 1000 });
    const companies = allCompanies.data;

    const totalCompanies = companies.length;
    const pendingApprovals = companies.filter(c => c.status === CompanyStatus.PENDING).length;

    let pendingDocuments = 0;
    for (const company of companies) {
      if (company.documents) {
        pendingDocuments += company.documents.filter(d => d.status === 'PENDING').length;
      }
    }

    return {
      totalCompanies,
      totalCustomers: 0, // will be fetched separately on frontend
      pendingApprovals,
      pendingDocuments,
    };
  }

  async getDashboardStats(companyId: number) {
    const company = await this.findById(companyId);

    const sentOffers = await this.offersService.countByStatus(companyId, OfferStatus.SENT);
    const confirmedOrders = await this.offersService.countByStatus(companyId, OfferStatus.ACCEPTED);
    const availableRequests = await this.requestsService.findAvailableForCompany(companyId);
    const openRequests = availableRequests.length;

    return {
      kpis: {
        openRequests,
        sentOffers,
        confirmedOrders,
        averageRating: company.averageRating ?? 0,
        totalReviews: company.totalReviews ?? 0,
      },
      trends: {
        openRequests: 0,
        sentOffers: 0,
        confirmedOrders: 0,
        rating: 0,
      },
      recentRequests: availableRequests.slice(0, 5).map((req) => this.mapRequestToDashboard(req)),
    };
  }

  async getAvailableRequests(companyId: number) {
    const requests = await this.requestsService.findAvailableForCompany(companyId);
    return requests.map((req) => this.mapRequestToDashboard(req));
  }

  async getProfileCompleteness(companyId: number): Promise<{ percentage: number; missing: string[] }> {
    const company = await this.findById(companyId);
    const totalFields = 14;
    let filled = 0;
    const missing: string[] = [];

    const checks = [
      { field: company.logoUrl, label: 'Logo' },
      { field: company.bannerUrl, label: 'Banner' },
      { field: company.description, label: 'Beschreibung' },
      { field: company.foundingYear, label: 'Gründungsjahr' },
      { field: company.employeeCount, label: 'Mitarbeiteranzahl' },
      { field: company.contactPerson, label: 'Ansprechpartner' },
      { field: company.phone, label: 'Telefon' },
      { field: company.supportEmail, label: 'Support-E-Mail' },
      { field: company.website, label: 'Webseite' },
      { field: company.servicesJson, label: 'Leistungen' },
      { field: company.mainLocation, label: 'Hauptstandort' },
      { field: company.operatingRadiusKm, label: 'Radius' },
      { field: company.taxId, label: 'USt-IdNr' },
      { field: company.documents?.length && company.documents.length > 0, label: 'Dokumente' },
    ];

    for (const check of checks) {
      if (check.field) {
        filled++;
      } else {
        missing.push(check.label);
      }
    }

    return { percentage: Math.round((filled / totalFields) * 100), missing };
  }

  async getPublicProfile(companyId: number) {
    const company = await this.findById(companyId);
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const services = company.servicesJson ? JSON.parse(company.servicesJson) : [];
    const supportedCities = company.supportedCitiesJson ? JSON.parse(company.supportedCitiesJson) : [];

    return {
      id: company.id,
      companyName: company.companyName,
      slug: company.slug,
      description: company.description,
      logoUrl: company.logoUrl,
      bannerUrl: company.bannerUrl,
      website: company.website,
      phone: company.phone,
      email: company.email,
      foundingYear: company.foundingYear,
      employeeCount: company.employeeCount,
      mainLocation: company.mainLocation,
      operatingRadiusKm: company.operatingRadiusKm,
      supportedCities,
      internationalMoves: company.internationalMoves,
      services,
      averageRating: company.averageRating,
      totalReviews: company.totalReviews,
      status: company.status,
      isVerified: company.isVerified,
    };
  }

  private mapRequestToDashboard(req: MoveRequest) {
    const hoursSinceCreated = (Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60);

    let status: string;
    if (hoursSinceCreated < 24) {
      status = 'NEW';
    } else if (req.status === MoveRequestStatus.READY_FOR_REQUEST) {
      status = 'PENDING';
    } else {
      status = 'PENDING';
    }

    const items = req.items || [];
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalVolume = items.reduce((sum, item) => sum + (item.volume ?? 0) * item.quantity, 0);
    const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 0) * item.quantity, 0);

    return {
      id: req.id,
      originAddress: req.originAddress,
      destinationAddress: req.destinationAddress,
      moveDate: req.moveDate,
      createdAt: req.createdAt,
      status,
      user: req.user
        ? {
            firstName: req.user.firstName,
            lastName: req.user.lastName,
          }
        : null,
      itemsSummary: {
        totalItems: items.length,
        totalQuantity,
        totalVolume: Math.round(totalVolume * 100) / 100,
        totalWeight: Math.round(totalWeight * 100) / 100,
      },
    };
  }

  private async generateUniqueSlug(companyName: string): Promise<string> {
    const baseSlug = companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);

    let slug = baseSlug;
    let suffix = 1;

    while (await this.companiesRepository.slugExists(slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix++;
    }

    return slug;
  }
}

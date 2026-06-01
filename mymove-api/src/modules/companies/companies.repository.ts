import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Company, CompanyStatus } from '@modules/companies/entities/company.entity';
import { CompanyDocument, DocumentStatus } from '@modules/companies/entities/company-document.entity';

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
export class CompaniesRepository {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(CompanyDocument)
    private readonly documentRepo: Repository<CompanyDocument>,
  ) {}

  async findById(id: number): Promise<Company | null> {
    const company = await this.companyRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['documents'],
    });
    return company ?? null;
  }

  async findByUserId(userId: number): Promise<Company | null> {
    const company = await this.companyRepo.findOne({
      where: { userId, deletedAt: IsNull() },
      relations: ['documents'],
    });
    return company ?? null;
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const company = await this.companyRepo.findOne({
      where: { slug, deletedAt: IsNull() },
      relations: ['documents'],
    });
    return company ?? null;
  }

  async findAll(params: PaginationParams & { status?: CompanyStatus }): Promise<{ data: Company[]; meta: PaginationMeta }> {
    const { page, limit, status } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: IsNull() };
    if (status !== undefined) {
      where.status = status;
    }

    const [data, total] = await this.companyRepo.findAndCount({
      where,
      relations: ['documents'],
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

  async create(data: Partial<Company>): Promise<Company> {
    const entity = this.companyRepo.create(data);
    return this.companyRepo.save(entity);
  }

  async update(id: number, data: Partial<Company>): Promise<Company> {
    await this.companyRepo.update({ id }, data);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Company with id ${id} not found after update`);
    }
    return updated;
  }

  async softDelete(id: number): Promise<void> {
    await this.companyRepo.softDelete({ id });
  }

  async addDocument(data: Partial<CompanyDocument>): Promise<CompanyDocument> {
    const entity = this.documentRepo.create(data);
    return this.documentRepo.save(entity);
  }

  async findDocumentsByCompanyId(companyId: number): Promise<CompanyDocument[]> {
    return this.documentRepo.find({
      where: { companyId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async verifyDocument(id: number, adminId: number): Promise<CompanyDocument> {
    await this.documentRepo.update(
      { id },
      {
        status: DocumentStatus.VERIFIED,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        rejectionReason: null,
      },
    );
    const updated = await this.documentRepo.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Document with id ${id} not found after verification`);
    }
    return updated;
  }

  async rejectDocument(id: number, reason: string): Promise<CompanyDocument> {
    await this.documentRepo.update(
      { id },
      {
        status: DocumentStatus.REJECTED,
        rejectionReason: reason,
        verifiedBy: null,
        verifiedAt: null,
      },
    );
    const updated = await this.documentRepo.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Document with id ${id} not found after rejection`);
    }
    return updated;
  }

  async resetDocument(id: number): Promise<CompanyDocument> {
    await this.documentRepo.update(
      { id },
      {
        status: DocumentStatus.PENDING,
        verifiedBy: null,
        verifiedAt: null,
        rejectionReason: null,
      },
    );
    const updated = await this.documentRepo.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Document with id ${id} not found after reset`);
    }
    return updated;
  }

  async slugExists(slug: string): Promise<boolean> {
    const count = await this.companyRepo.count({
      where: { slug, deletedAt: IsNull() },
    });
    return count > 0;
  }
}

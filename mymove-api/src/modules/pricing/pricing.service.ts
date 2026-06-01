import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CompanyPricing, ServicePricesConfig } from './entities/company-pricing.entity';
import { CompanyDocument, DocumentStatus, DocumentType } from '@modules/companies/entities/company-document.entity';

export interface InventorySummary {
  totalItems: number;
  totalQuantity: number;
  totalVolume: number;
  totalWeight: number;
  aiDetectedCount: number;
}

export interface MoveExtras {
  assemblyRequired?: boolean;
  boxesNeeded?: boolean;
  noParkingZoneRequired?: boolean;
}

export interface PriceBreakdown {
  baseFee: number;
  laborCost: number;
  distanceCost: number;
  extrasCost: number;
  total: number;
}

export interface CalculationDetails {
  estimatedHours: number;
  totalVolume: number;
  totalWeight: number;
  totalItems: number;
  totalQuantity: number;
  distanceKm: number;
  teamSize: number;
  minimumHours: number;
}

export interface CompanyEstimate {
  companyId: number;
  companyName: string;
  estimatedPrice: number;
  breakdown: PriceBreakdown;
  calculationDetails: CalculationDetails;
}

/**
 * Time estimation constants.
 * These are calibrated estimates for moving labor time.
 */
const TIME_CONSTANTS = {
  baseTimeHours: 1.0,      // 1 hour for loading/unloading logistics
  timePerItemHours: 0.25,    // 15 minutes per item
  timePerVolumeM3Hours: 0.5, // 30 minutes per cubic meter
} as const;

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(CompanyPricing)
    private readonly pricingRepo: Repository<CompanyPricing>,
    @InjectRepository(CompanyDocument)
    private readonly documentRepo: Repository<CompanyDocument>,
  ) {}

  // --- Company Pricing CRUD ---

  async createPricing(companyId: number, data: Partial<CompanyPricing>): Promise<CompanyPricing> {
    const existing = await this.findByCompanyId(companyId);
    if (existing) {
      throw new NotFoundException('Pricing already exists for this company. Use update instead.');
    }

    const entity = this.pricingRepo.create({ ...data, companyId });
    return this.pricingRepo.save(entity);
  }

  async findByCompanyId(companyId: number): Promise<CompanyPricing | null> {
    return this.pricingRepo.findOne({
      where: { companyId },
    });
  }

  async updatePricing(companyId: number, data: Partial<CompanyPricing>): Promise<CompanyPricing> {
    const existing = await this.findByCompanyId(companyId);
    if (!existing) {
      throw new NotFoundException('Pricing not found for this company');
    }

    await this.pricingRepo.update(existing.id, data);
    const updated = await this.findByCompanyId(companyId);
    if (!updated) {
      throw new NotFoundException('Pricing not found after update');
    }
    return updated;
  }

  async upsertPricing(companyId: number, data: Partial<CompanyPricing>): Promise<CompanyPricing> {
    const existing = await this.findByCompanyId(companyId);
    if (existing) {
      await this.pricingRepo.update(existing.id, data);
      const updated = await this.findByCompanyId(companyId);
      if (!updated) {
        throw new NotFoundException('Pricing not found after update');
      }
      return updated;
    }
    const entity = this.pricingRepo.create({ ...data, companyId });
    return this.pricingRepo.save(entity);
  }

  async deletePricing(companyId: number): Promise<void> {
    const existing = await this.findByCompanyId(companyId);
    if (!existing) {
      throw new NotFoundException('Pricing not found for this company');
    }
    await this.pricingRepo.delete(existing.id);
  }

  // --- Price Calculation ---

  /**
   * Calculate a single price estimate for a company.
   *
   * Formula:
   * 1. Estimate time = max(minimum_hours, (base_time + items*0.25h + volume*0.5h) / team_size)
   * 2. Labor cost = estimated_time * price_per_hour * team_size
   * 3. Distance cost = distance_km * price_per_km
   * 4. Base fee = fixed
   * 5. Extras = sum of applicable service prices
   * 6. Total = base_fee + labor_cost + distance_cost + extras_cost
   */
  calculateEstimate(
    pricing: CompanyPricing,
    inventory: InventorySummary,
    distanceKm: number,
    extras: MoveExtras | null,
  ): CompanyEstimate {
    const { baseTimeHours, timePerItemHours, timePerVolumeM3Hours } = TIME_CONSTANTS;

    // Step 1: Estimate time
    const rawHours =
      baseTimeHours +
      inventory.totalItems * timePerItemHours +
      inventory.totalVolume * timePerVolumeM3Hours;

    const teamAdjustedHours = rawHours / pricing.teamSize;
    const estimatedHours = Math.max(
      pricing.minimumHours,
      Math.ceil(teamAdjustedHours * 2) / 2, // Round to nearest 0.5
    );

    // Step 2: Labor cost
    const laborCost = estimatedHours * pricing.pricePerHour * pricing.teamSize;

    // Step 3: Distance cost
    const distanceCost = distanceKm * pricing.pricePerKm;

    // Step 4: Base fee
    const baseFee = pricing.baseFee;

    // Step 5: Extras
    let extrasCost = 0;
    const servicePrices = pricing.servicePrices ?? {};

    if (extras) {
      if (extras.assemblyRequired && servicePrices.assembly) {
        extrasCost += servicePrices.assembly;
      }
      if (extras.boxesNeeded && servicePrices.boxes) {
        extrasCost += servicePrices.boxes;
      }
      if (extras.noParkingZoneRequired && servicePrices.noParkingZone) {
        extrasCost += servicePrices.noParkingZone;
      }
    }

    // Step 6: Total
    const total = baseFee + laborCost + distanceCost + extrasCost;

    // Round all monetary values to 2 decimal places
    const round = (n: number): number => Math.round(n * 100) / 100;

    return {
      companyId: pricing.companyId,
      companyName: '', // Will be filled by the caller
      estimatedPrice: round(total),
      breakdown: {
        baseFee: round(baseFee),
        laborCost: round(laborCost),
        distanceCost: round(distanceCost),
        extrasCost: round(extrasCost),
        total: round(total),
      },
      calculationDetails: {
        estimatedHours,
        totalVolume: round(inventory.totalVolume),
        totalWeight: round(inventory.totalWeight),
        totalItems: inventory.totalItems,
        totalQuantity: inventory.totalQuantity,
        distanceKm,
        teamSize: pricing.teamSize,
        minimumHours: pricing.minimumHours,
      },
    };
  }

  /**
   * Check if a company has a verified trade license document.
   */
  private async hasVerifiedTradeLicense(companyId: number): Promise<boolean> {
    const doc = await this.documentRepo.findOne({
      where: {
        companyId,
        documentType: DocumentType.TRADE_LICENSE,
        status: DocumentStatus.VERIFIED,
      },
    });
    return !!doc;
  }

  /**
   * Calculate estimates for all approved companies that have pricing configured
   * AND a verified trade license document.
   * Optionally filtered to only available companies.
   */
  async calculateEstimatesForAllCompanies(
    inventory: InventorySummary,
    distanceKm: number,
    extras: MoveExtras | null,
    availableCompanyIds?: number[],
  ): Promise<CompanyEstimate[]> {
    const where: Record<string, unknown> = {
      company: { status: 'APPROVED' },
    };

    if (availableCompanyIds && availableCompanyIds.length > 0) {
      Object.assign(where, { companyId: In(availableCompanyIds) });
    }

    const pricingConfigs = await this.pricingRepo.find({
      relations: ['company'],
      where,
    });

    if (pricingConfigs.length === 0) {
      return [];
    }

    const results: CompanyEstimate[] = [];
    for (const pricing of pricingConfigs) {
      const hasLicense = await this.hasVerifiedTradeLicense(pricing.companyId);
      if (!hasLicense) continue;

      const estimate = this.calculateEstimate(pricing, inventory, distanceKm, extras);
      estimate.companyName = pricing.company?.companyName ?? '';
      results.push(estimate);
    }

    return results;
  }

  /**
   * Calculate estimate for a specific company.
   */
  async calculateEstimateForCompany(
    companyId: number,
    inventory: InventorySummary,
    distanceKm: number,
    extras: MoveExtras | null,
  ): Promise<CompanyEstimate | null> {
    const pricing = await this.pricingRepo.findOne({
      where: { companyId },
      relations: ['company'],
    });

    if (!pricing || pricing.company?.status !== 'APPROVED') {
      return null;
    }

    const hasLicense = await this.hasVerifiedTradeLicense(companyId);
    if (!hasLicense) {
      return null;
    }

    const estimate = this.calculateEstimate(pricing, inventory, distanceKm, extras);
    estimate.companyName = pricing.company?.companyName ?? '';
    return estimate;
  }
}

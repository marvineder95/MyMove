import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { MoveRequest } from '@modules/requests/entities/move-request.entity';
import { Offer, OfferStatus } from '@modules/offers/entities/offer.entity';
import { TeamBooking, BookingStatus } from '@modules/teams/entities/team-booking.entity';
import { Company, CompanyStatus } from '@modules/companies/entities/company.entity';

export interface ReviewWithMeta extends Review {
  customerName?: string;
}

export interface CompanyRatingSummary {
  companyId: number;
  companyName: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  isFlagged: boolean;
}

/**
 * Commission rate tiers based on average rating.
 * Higher-rated companies pay lower platform commission.
 */
const COMMISSION_TIERS = [
  { minRating: 4.5, rate: 0.05, label: 'ELITE' },
  { minRating: 4.0, rate: 0.08, label: 'PREFERRED' },
  { minRating: 3.0, rate: 0.12, label: 'STANDARD' },
  { minRating: 0.0,  rate: 0.18, label: 'PROVISIONAL' },
];

const RATING_FLAG_THRESHOLD = 3.5;

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(MoveRequest)
    private readonly moveRequestRepo: Repository<MoveRequest>,
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    @InjectRepository(TeamBooking)
    private readonly bookingRepo: Repository<TeamBooking>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  /**
   * Create a review for a completed move.
   * Validates all business rules before creation.
   */
  async create(
    userId: number,
    moveRequestId: number,
    rating: number,
    reviewText: string | null,
  ): Promise<Review> {
    // 1. Verify move request exists and belongs to user
    const moveRequest = await this.moveRequestRepo.findOne({
      where: { id: moveRequestId },
    });

    if (!moveRequest) {
      throw new NotFoundException(`Move request ${moveRequestId} not found`);
    }

    if (moveRequest.userId !== userId) {
      throw new ForbiddenException('You can only review your own move requests');
    }

    // 2. Check for existing review
    const existingReview = await this.reviewRepo.findOne({
      where: { moveRequestId, userId },
    });

    if (existingReview) {
      throw new ConflictException(
        `You have already submitted a review for move request ${moveRequestId}`,
      );
    }

    // 3. Verify there is an accepted offer for this request
    const acceptedOffer = await this.offerRepo.findOne({
      where: { moveRequestId, status: OfferStatus.ACCEPTED },
      relations: ['company'],
    });

    if (!acceptedOffer) {
      throw new BadRequestException(
        `Move request ${moveRequestId} does not have an accepted offer. Only completed moves can be reviewed.`,
      );
    }

    // 4. Verify the team booking is COMPLETED
    if (acceptedOffer.teamId) {
      const booking = await this.bookingRepo.findOne({
        where: {
          teamId: acceptedOffer.teamId,
          moveRequestId,
          status: BookingStatus.COMPLETED,
        },
      });

      if (!booking) {
        throw new BadRequestException(
          `The move has not been completed yet. You can only review after the move is marked as completed.`,
        );
      }
    }

    // 5. Create the review
    const review = this.reviewRepo.create({
      moveRequestId,
      companyId: acceptedOffer.companyId,
      userId,
      rating,
      reviewText,
    });

    const savedReview = await this.reviewRepo.save(review);

    // 6. Update company rating stats
    await this.updateCompanyRating(acceptedOffer.companyId);

    return savedReview;
  }

  /**
   * Get all reviews for a company with optional pagination.
   */
  async findByCompany(
    companyId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Review[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.reviewRepo.findAndCount({
      where: { companyId },
      relations: ['moveRequest', 'moveRequest.user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages },
    };
  }

  /**
   * Get a single review by ID.
   */
  async findById(reviewId: number): Promise<Review> {
    const review = await this.reviewRepo.findOne({
      where: { id: reviewId },
      relations: ['company', 'moveRequest'],
    });

    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    return review;
  }

  /**
   * Get all reviews submitted by a user.
   */
  async findByUser(userId: number): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { userId },
      relations: ['company', 'moveRequest'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Calculate and update a company's average rating and total reviews.
   * Also updates commission rate based on rating tier.
   */
  async updateCompanyRating(companyId: number): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`);
    }

    // Calculate average
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.company_id = :companyId', { companyId })
      .getRawOne();

    const averageRating = result.average ? Math.round(parseFloat(result.average) * 100) / 100 : null;
    const totalReviews = parseInt(result.count, 10);

    // Determine commission rate based on tier
    const commissionRate = this.getCommissionRateForRating(averageRating ?? 0);

    company.averageRating = averageRating;
    company.totalReviews = totalReviews;
    company.commissionRate = commissionRate;

    return this.companyRepo.save(company);
  }

  /**
   * Get commission rate for a given average rating.
   */
  getCommissionRateForRating(averageRating: number): number {
    for (const tier of COMMISSION_TIERS) {
      if (averageRating >= tier.minRating) {
        return tier.rate;
      }
    }
    return 0.18; // Fallback
  }

  /**
   * Get rating tier label for a given average rating.
   */
  getRatingTierLabel(averageRating: number): string {
    for (const tier of COMMISSION_TIERS) {
      if (averageRating >= tier.minRating) {
        return tier.label;
      }
    }
    return 'PROVISIONAL';
  }

  /**
   * Get detailed rating summary for a company.
   */
  async getCompanyRatingSummary(companyId: number): Promise<CompanyRatingSummary> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`);
    }

    // Get rating distribution
    const distributionResult = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.company_id = :companyId', { companyId })
      .groupBy('review.rating')
      .getRawMany();

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const row of distributionResult) {
      ratingDistribution[row.rating] = parseInt(row.count, 10);
    }

    const isFlagged = company.averageRating !== null && company.averageRating < RATING_FLAG_THRESHOLD && company.totalReviews >= 3;

    return {
      companyId,
      companyName: company.companyName,
      averageRating: company.averageRating ?? 0,
      totalReviews: company.totalReviews,
      ratingDistribution,
      isFlagged,
    };
  }

  /**
   * Find all companies with average rating below the flag threshold.
   * For admin monitoring.
   */
  async findFlaggedCompanies(): Promise<{ companyId: number; companyName: string; averageRating: number; totalReviews: number }[]> {
    const companies = await this.companyRepo.find({
      where: { status: CompanyStatus.APPROVED },
    });

    return companies
      .filter(
        (c) =>
          c.averageRating !== null &&
          c.averageRating < RATING_FLAG_THRESHOLD &&
          c.totalReviews >= 3,
      )
      .map((c) => ({
        companyId: c.id,
        companyName: c.companyName,
        averageRating: c.averageRating ?? 0,
        totalReviews: c.totalReviews,
      }));
  }

  /**
   * Admin can delete a review (e.g., for moderation).
   */
  async delete(reviewId: number): Promise<void> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    await this.reviewRepo.delete(reviewId);

    // Recalculate company rating
    await this.updateCompanyRating(review.companyId);
  }
}

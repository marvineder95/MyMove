import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Offer, OfferStatus, OfferBreakdown } from './entities/offer.entity';
import { MoveRequest, MoveRequestStatus } from '@modules/requests/entities/move-request.entity';
import { TeamsService } from '@modules/teams/teams.service';
import { BookingStatus } from '@modules/teams/entities/team-booking.entity';
import { ConversationsService } from '@modules/conversations/conversations.service';

export interface OfferWithCompany extends Offer {
  companyName?: string;
}

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
    @InjectRepository(MoveRequest)
    private readonly moveRequestRepo: Repository<MoveRequest>,
    private readonly teamsService: TeamsService,
    private readonly conversationsService: ConversationsService,
  ) {}

  // --- Offer CRUD ---

  /**
   * Create a new offer for a move request.
   * Company must be approved and have capacity on the move date.
   */
  async create(
    companyId: number,
    moveRequestId: number,
    price: number,
    breakdown: OfferBreakdown | null,
    message: string | null,
    teamId: number | null,
  ): Promise<Offer> {
    // Verify move request exists and is ready for offers
    const moveRequest = await this.moveRequestRepo.findOne({
      where: { id: moveRequestId },
      relations: ['user'],
    });

    if (!moveRequest) {
      throw new NotFoundException(`Move request ${moveRequestId} not found`);
    }

    if (moveRequest.status !== MoveRequestStatus.READY_FOR_REQUEST && moveRequest.status !== MoveRequestStatus.SENT_TO_COMPANIES) {
      throw new BadRequestException(
        `Cannot create offer for move request with status ${moveRequest.status}. ` +
        `Request must be READY_FOR_REQUEST or SENT_TO_COMPANIES.`,
      );
    }

    // Check if an offer already exists from this company for this request
    const existingOffer = await this.offerRepo.findOne({
      where: { moveRequestId, companyId },
    });

    if (existingOffer) {
      throw new ConflictException(
        `An offer already exists for move request ${moveRequestId} from company ${companyId}`,
      );
    }

    // If teamId provided, validate team belongs to company and has capacity
    if (teamId !== null) {
      const team = await this.teamsService.findTeamById(teamId);
      if (!team || team.companyId !== companyId) {
        throw new ForbiddenException(`Team ${teamId} does not belong to company ${companyId}`);
      }

      const hasCapacity = await this.teamsService.hasTeamCapacity(teamId, moveRequest.moveDate);
      if (!hasCapacity) {
        throw new BadRequestException(
          `Team ${teamId} has no capacity on ${moveRequest.moveDate.toISOString().split('T')[0]}`,
        );
      }
    }

    const offer = this.offerRepo.create({
      moveRequestId,
      companyId,
      price,
      breakdown,
      message,
      teamId,
      status: OfferStatus.DRAFT,
    });

    return this.offerRepo.save(offer);
  }

  /**
   * Update a draft offer.
   */
  async update(
    offerId: number,
    companyId: number,
    price?: number,
    breakdown?: OfferBreakdown,
    message?: string,
    teamId?: number,
  ): Promise<Offer> {
    const offer = await this.findOfferById(offerId, companyId);

    if (offer.status !== OfferStatus.DRAFT) {
      throw new BadRequestException(`Cannot update offer with status ${offer.status}. Only DRAFT offers can be updated.`);
    }

    if (price !== undefined) offer.price = price;
    if (breakdown !== undefined) offer.breakdown = breakdown ?? null;
    if (message !== undefined) offer.message = message ?? null;

    if (teamId !== undefined) {
      if (teamId !== null) {
        const team = await this.teamsService.findTeamById(teamId);
        if (!team || team.companyId !== companyId) {
          throw new ForbiddenException(`Team ${teamId} does not belong to company ${companyId}`);
        }
      }
      offer.teamId = teamId ?? null;
    }

    return this.offerRepo.save(offer);
  }

  /**
   * Send an offer to the customer.
   * Status transitions from DRAFT to SENT.
   */
  async send(offerId: number, companyId: number): Promise<Offer> {
    const offer = await this.findOfferById(offerId, companyId);

    if (offer.status !== OfferStatus.DRAFT) {
      throw new BadRequestException(`Cannot send offer with status ${offer.status}. Only DRAFT offers can be sent.`);
    }

    offer.status = OfferStatus.SENT;
    offer.sentAt = new Date();

    // Update move request status to SENT_TO_COMPANIES if not already
    const moveRequest = await this.moveRequestRepo.findOne({ where: { id: offer.moveRequestId } });
    if (moveRequest && moveRequest.status === MoveRequestStatus.READY_FOR_REQUEST) {
      await this.moveRequestRepo.update(offer.moveRequestId, { status: MoveRequestStatus.SENT_TO_COMPANIES });
    }

    const saved = await this.offerRepo.save(offer);

    // Create conversation and system message
    try {
      const conv = await this.conversationsService.ensureConversation(
        offer.moveRequestId,
        companyId,
        moveRequest?.userId ?? 0,
      );
      const priceText = offer.price ? ` über ${offer.price.toFixed(0)} €` : '';
      await this.conversationsService.sendSystemMessage(conv.id, `Angebot${priceText} wurde gesendet.`);
    } catch {
      // Silently fail
    }

    return saved;
  }

  /**
   * Customer accepts an offer.
   * Triggers: reject all other offers, create team booking, lock request.
   */
  async accept(offerId: number, userId: number): Promise<Offer> {
    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
      relations: ['moveRequest', 'company'],
    });

    if (!offer) {
      throw new NotFoundException(`Offer ${offerId} not found`);
    }

    // Verify ownership of the move request
    if (offer.moveRequest.userId !== userId) {
      throw new ForbiddenException('You can only accept offers for your own move requests');
    }

    if (offer.status !== OfferStatus.SENT) {
      throw new BadRequestException(`Cannot accept offer with status ${offer.status}. Only SENT offers can be accepted.`);
    }

    // Check if request already has an accepted offer
    const acceptedOffer = await this.offerRepo.findOne({
      where: { moveRequestId: offer.moveRequestId, status: OfferStatus.ACCEPTED },
    });

    if (acceptedOffer) {
      throw new ConflictException(
        `Move request ${offer.moveRequestId} already has an accepted offer (ID: ${acceptedOffer.id})`,
      );
    }

    // Accept this offer
    offer.status = OfferStatus.ACCEPTED;
    offer.acceptedAt = new Date();
    await this.offerRepo.save(offer);

    // Reject all other offers for this request
    await this.offerRepo.update(
      { moveRequestId: offer.moveRequestId, status: In([OfferStatus.SENT, OfferStatus.DRAFT]) },
      { status: OfferStatus.REJECTED, rejectedAt: new Date() },
    );

    // Create team booking if teamId is set
    if (offer.teamId) {
      await this.teamsService.createBooking(
        offer.teamId,
        offer.moveRequestId,
        offer.moveRequest.moveDate,
        BookingStatus.CONFIRMED,
      );
    }

    // Lock the move request — cannot be modified after acceptance
    await this.moveRequestRepo.update(offer.moveRequestId, {
      status: MoveRequestStatus.SENT_TO_COMPANIES, // stays SENT_TO_COMPANIES but is now locked
    });

    // Send system message
    try {
      const conv = await this.conversationsService.ensureConversation(
        offer.moveRequestId,
        offer.companyId,
        offer.moveRequest.userId,
      );
      await this.conversationsService.sendSystemMessage(conv.id, 'Angebot wurde akzeptiert.');
    } catch {
      // Silently fail
    }

    return offer;
  }

  /**
   * Customer rejects an offer.
   */
  async reject(offerId: number, userId: number): Promise<Offer> {
    const offer = await this.offerRepo.findOne({
      where: { id: offerId },
      relations: ['moveRequest'],
    });

    if (!offer) {
      throw new NotFoundException(`Offer ${offerId} not found`);
    }

    // Verify ownership
    if (offer.moveRequest.userId !== userId) {
      throw new ForbiddenException('You can only reject offers for your own move requests');
    }

    if (offer.status !== OfferStatus.SENT) {
      throw new BadRequestException(`Cannot reject offer with status ${offer.status}. Only SENT offers can be rejected.`);
    }

    offer.status = OfferStatus.REJECTED;
    offer.rejectedAt = new Date();

    const saved = await this.offerRepo.save(offer);

    // Send system message
    try {
      const conv = await this.conversationsService.ensureConversation(
        offer.moveRequestId,
        offer.companyId,
        offer.moveRequest.userId,
      );
      await this.conversationsService.sendSystemMessage(conv.id, 'Angebot wurde abgelehnt.');
    } catch {
      // Silently fail
    }

    return saved;
  }

  // --- Queries ---

  /**
   * Get a single offer by ID.
   * Optionally filter by company ID for company-scoped access.
   */
  async findOfferById(offerId: number, companyId?: number): Promise<Offer> {
    const where: Record<string, unknown> = { id: offerId };
    if (companyId !== undefined) {
      where.companyId = companyId;
    }

    const offer = await this.offerRepo.findOne({ where, relations: ['moveRequest', 'company'] });
    if (!offer) {
      throw new NotFoundException(`Offer ${offerId} not found`);
    }
    return offer;
  }

  /**
   * Get all offers for a move request.
   * Customer view.
   */
  async findByMoveRequest(moveRequestId: number, userId?: number): Promise<Offer[]> {
    // If userId provided, verify ownership
    if (userId !== undefined) {
      const moveRequest = await this.moveRequestRepo.findOne({ where: { id: moveRequestId } });
      if (!moveRequest) {
        throw new NotFoundException(`Move request ${moveRequestId} not found`);
      }
      if (moveRequest.userId !== userId) {
        throw new ForbiddenException('You can only view offers for your own move requests');
      }
    }

    return this.offerRepo.find({
      where: { moveRequestId },
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all offers created by a company.
   * Company inbox view.
   */
  async findByCompany(companyId: number): Promise<Offer[]> {
    return this.offerRepo.find({
      where: { companyId },
      relations: ['moveRequest', 'moveRequest.user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get offers by status for a company.
   */
  async findByCompanyAndStatus(companyId: number, status: OfferStatus): Promise<Offer[]> {
    return this.offerRepo.find({
      where: { companyId, status },
      relations: ['moveRequest', 'moveRequest.user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Delete a draft offer.
   */
  async delete(offerId: number, companyId: number): Promise<void> {
    const offer = await this.findOfferById(offerId, companyId);

    if (offer.status !== OfferStatus.DRAFT) {
      throw new BadRequestException(`Cannot delete offer with status ${offer.status}. Only DRAFT offers can be deleted.`);
    }

    await this.offerRepo.delete(offerId);
  }

  /**
   * Count offers by status for a company.
   */
  async countByStatus(companyId: number, status: OfferStatus): Promise<number> {
    return this.offerRepo.count({ where: { companyId, status } });
  }
}

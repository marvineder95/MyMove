import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Raw, In } from 'typeorm';
import { Team } from './entities/team.entity';
import { TeamAvailability } from './entities/team-availability.entity';
import { TeamBooking, BookingStatus } from './entities/team-booking.entity';

export interface TeamWithCapacity {
  id: number;
  name: string;
  maxParallelJobs: number;
  activeBookings: number;
  isAvailable: boolean;
  hasCapacity: boolean;
}

export interface CompanyAvailabilityResult {
  companyId: number;
  isAvailable: boolean;
  teams: TeamWithCapacity[];
}

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(TeamAvailability)
    private readonly availabilityRepo: Repository<TeamAvailability>,
    @InjectRepository(TeamBooking)
    private readonly bookingRepo: Repository<TeamBooking>,
  ) {}

  // --- Team CRUD ---

  async createTeam(companyId: number, name: string, maxParallelJobs: number = 1): Promise<Team> {
    const team = this.teamRepo.create({
      companyId,
      name,
      maxParallelJobs,
      isActive: true,
    });
    return this.teamRepo.save(team);
  }

  async findTeamsByCompany(companyId: number): Promise<Team[]> {
    return this.teamRepo.find({
      where: { companyId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findTeamById(teamId: number): Promise<Team | null> {
    return this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['availabilities', 'bookings'],
    });
  }

  async updateTeam(teamId: number, companyId: number, updates: Partial<Team>): Promise<Team> {
    const team = await this.teamRepo.findOne({ where: { id: teamId, companyId } });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found for company ${companyId}`);
    }

    if (updates.name !== undefined) team.name = updates.name;
    if (updates.maxParallelJobs !== undefined) team.maxParallelJobs = updates.maxParallelJobs;
    if (updates.isActive !== undefined) team.isActive = updates.isActive;

    return this.teamRepo.save(team);
  }

  async deleteTeam(teamId: number, companyId: number): Promise<void> {
    const result = await this.teamRepo.delete({ id: teamId, companyId });
    if (result.affected === 0) {
      throw new NotFoundException(`Team ${teamId} not found for company ${companyId}`);
    }
  }

  // --- Availability ---

  async setAvailability(
    teamId: number,
    companyId: number,
    date: Date,
    isAvailable: boolean = true,
  ): Promise<TeamAvailability> {
    // Verify team belongs to company
    const team = await this.teamRepo.findOne({ where: { id: teamId, companyId } });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found for company ${companyId}`);
    }

    // Check if availability already exists for this date
    const existing = await this.availabilityRepo.findOne({
      where: { teamId, date },
    });

    if (existing) {
      existing.isAvailable = isAvailable;
      return this.availabilityRepo.save(existing);
    }

    const availability = this.availabilityRepo.create({
      teamId,
      date,
      isAvailable,
    });
    return this.availabilityRepo.save(availability);
  }

  async getAvailability(teamId: number, companyId: number): Promise<TeamAvailability[]> {
    const team = await this.teamRepo.findOne({ where: { id: teamId, companyId } });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found for company ${companyId}`);
    }

    return this.availabilityRepo.find({
      where: { teamId },
      order: { date: 'ASC' },
    });
  }

  // --- Bookings ---

  async createBooking(
    teamId: number,
    moveRequestId: number,
    bookingDate: Date,
    status: BookingStatus = BookingStatus.RESERVED,
  ): Promise<TeamBooking> {
    // Verify team exists and has capacity
    const team = await this.findTeamById(teamId);
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }

    const activeBookings = await this.countActiveBookings(teamId, bookingDate);
    if (activeBookings >= team.maxParallelJobs) {
      throw new BadRequestException(
        `Team ${teamId} has no capacity on ${bookingDate.toISOString().split('T')[0]}. ` +
        `Max parallel jobs: ${team.maxParallelJobs}, active: ${activeBookings}`,
      );
    }

    const booking = this.bookingRepo.create({
      teamId,
      moveRequestId,
      bookingDate,
      status,
    });
    return this.bookingRepo.save(booking);
  }

  async updateBookingStatus(
    bookingId: number,
    status: BookingStatus,
  ): Promise<TeamBooking> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }

    booking.status = status;
    return this.bookingRepo.save(booking);
  }

  async cancelBooking(bookingId: number): Promise<void> {
    const result = await this.bookingRepo.update(bookingId, { status: BookingStatus.CANCELLED });
    if (result.affected === 0) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }
  }

  async getBookingsForTeam(teamId: number): Promise<TeamBooking[]> {
    return this.bookingRepo.find({
      where: { teamId },
      order: { bookingDate: 'ASC' },
      relations: ['moveRequest'],
    });
  }

  // --- Capacity & Availability Logic ---

  /**
   * Count active (non-cancelled) bookings for a team on a specific date.
   */
  async countActiveBookings(teamId: number, date: Date): Promise<number> {
    return this.bookingRepo.count({
      where: {
        teamId,
        bookingDate: date,
        status: In([BookingStatus.RESERVED, BookingStatus.CONFIRMED]),
      },
    });
  }

  /**
   * Check if a specific team has capacity on a given date.
   */
  async hasTeamCapacity(teamId: number, date: Date): Promise<boolean> {
    const team = await this.teamRepo.findOne({ where: { id: teamId } });
    if (!team || !team.isActive) {
      return false;
    }

    // Check explicit availability record (defaults to available if no record)
    const availability = await this.availabilityRepo.findOne({
      where: { teamId, date },
    });

    if (availability && !availability.isAvailable) {
      return false;
    }

    // Check active bookings against max capacity
    const activeBookings = await this.countActiveBookings(teamId, date);
    return activeBookings < team.maxParallelJobs;
  }

  /**
   * Check if a company has at least one team with capacity on a given date.
   */
  async isCompanyAvailable(companyId: number, date: Date): Promise<CompanyAvailabilityResult> {
    const teams = await this.teamRepo.find({
      where: { companyId, isActive: true },
    });

    if (teams.length === 0) {
      return {
        companyId,
        isAvailable: false,
        teams: [],
      };
    }

    const teamResults = await Promise.all(
      teams.map(async (team) => {
        const availability = await this.availabilityRepo.findOne({
          where: { teamId: team.id, date },
        });

        const activeBookings = await this.countActiveBookings(team.id, date);
        const isExplicitlyAvailable = availability ? availability.isAvailable : true;
        const hasCapacity = isExplicitlyAvailable && activeBookings < team.maxParallelJobs;

        return {
          id: team.id,
          name: team.name,
          maxParallelJobs: team.maxParallelJobs,
          activeBookings,
          isAvailable: isExplicitlyAvailable,
          hasCapacity,
        };
      }),
    );

    return {
      companyId,
      isAvailable: teamResults.some((t) => t.hasCapacity),
      teams: teamResults,
    };
  }

  /**
   * Get all company IDs that are available on a given date.
   * Used to filter companies in the estimate endpoint.
   */
  async findAvailableCompanyIds(date: Date): Promise<number[]> {
    // Get all active teams
    const teams = await this.teamRepo.find({
      where: { isActive: true },
    });

    if (teams.length === 0) {
      return [];
    }

    // Check each team and collect available company IDs
    const availableCompanies = new Set<number>();

    for (const team of teams) {
      const hasCapacity = await this.hasTeamCapacity(team.id, date);
      if (hasCapacity) {
        availableCompanies.add(team.companyId);
      }
    }

    return Array.from(availableCompanies);
  }

  /**
   * Get detailed availability for a company including all teams.
   */
  async getCompanyAvailability(
    companyId: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<Record<string, CompanyAvailabilityResult>> {
    const results: Record<string, CompanyAvailabilityResult> = {};
    const current = new Date(fromDate);

    while (current <= toDate) {
      const dateStr = current.toISOString().split('T')[0];
      results[dateStr] = await this.isCompanyAvailable(companyId, new Date(dateStr));
      current.setDate(current.getDate() + 1);
    }

    return results;
  }
}

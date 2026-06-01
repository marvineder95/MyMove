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
import { TeamsService } from './teams.service';
import { Team } from './entities/team.entity';
import { TeamAvailability } from './entities/team-availability.entity';
import { TeamBooking, BookingStatus } from './entities/team-booking.entity';
import { CreateTeamDto, UpdateTeamDto } from './dto/team.dto';
import { SetAvailabilityDto } from './dto/availability.dto';
import { CreateBookingDto } from './dto/booking.dto';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // --- Team Management ---

  @Post('companies/me/teams')
  @Roles(UserRole.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new team for the current company' })
  async createTeam(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTeamDto,
  ): Promise<Team> {
    const companyId = Number(user.userId);
    return this.teamsService.createTeam(companyId, dto.name, dto.maxParallelJobs ?? 1);
  }

  @Get('companies/me/teams')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get all teams for the current company' })
  async getMyTeams(@CurrentUser() user: AuthUser): Promise<Team[]> {
    const companyId = Number(user.userId);
    return this.teamsService.findTeamsByCompany(companyId);
  }

  @Patch('companies/me/teams/:teamId')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Update a team for the current company' })
  @ApiParam({ name: 'teamId', type: Number, description: 'Team ID' })
  async updateTeam(
    @CurrentUser() user: AuthUser,
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() dto: UpdateTeamDto,
  ): Promise<Team> {
    const companyId = Number(user.userId);
    return this.teamsService.updateTeam(teamId, companyId, dto);
  }

  @Delete('companies/me/teams/:teamId')
  @Roles(UserRole.COMPANY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a team for the current company' })
  @ApiParam({ name: 'teamId', type: Number, description: 'Team ID' })
  async deleteTeam(
    @CurrentUser() user: AuthUser,
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<void> {
    const companyId = Number(user.userId);
    return this.teamsService.deleteTeam(teamId, companyId);
  }

  // --- Availability ---

  @Post('teams/:teamId/availability')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Set availability for a team on a specific date' })
  @ApiParam({ name: 'teamId', type: Number, description: 'Team ID' })
  async setAvailability(
    @CurrentUser() user: AuthUser,
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() dto: SetAvailabilityDto,
  ): Promise<TeamAvailability> {
    const companyId = Number(user.userId);
    return this.teamsService.setAvailability(
      teamId,
      companyId,
      new Date(dto.date),
      dto.isAvailable ?? true,
    );
  }

  @Get('teams/:teamId/availability')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get availability records for a team' })
  @ApiParam({ name: 'teamId', type: Number, description: 'Team ID' })
  async getAvailability(
    @CurrentUser() user: AuthUser,
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamAvailability[]> {
    const companyId = Number(user.userId);
    return this.teamsService.getAvailability(teamId, companyId);
  }

  @Get('companies/me/availability')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get full availability calendar for the current company' })
  @ApiQuery({ name: 'from', required: true, type: String, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: true, type: String, description: 'End date (YYYY-MM-DD)' })
  async getCompanyAvailabilityCalendar(
    @CurrentUser() user: AuthUser,
    @Query('from') fromStr: string,
    @Query('to') toStr: string,
  ): Promise<Record<string, { companyId: number; isAvailable: boolean; teams: { id: number; name: string; maxParallelJobs: number; activeBookings: number; isAvailable: boolean; hasCapacity: boolean }[] }>> {
    const companyId = Number(user.userId);
    return this.teamsService.getCompanyAvailability(
      companyId,
      new Date(fromStr),
      new Date(toStr),
    );
  }

  // --- Bookings ---

  @Post('teams/:teamId/bookings')
  @Roles(UserRole.COMPANY)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a booking for a team' })
  @ApiParam({ name: 'teamId', type: Number, description: 'Team ID' })
  async createBooking(
    @CurrentUser() user: AuthUser,
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() dto: CreateBookingDto,
  ): Promise<TeamBooking> {
    return this.teamsService.createBooking(
      teamId,
      Number(user.userId),
      new Date(dto.bookingDate),
      dto.status,
    );
  }

  @Get('teams/:teamId/bookings')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Get all bookings for a team' })
  @ApiParam({ name: 'teamId', type: Number, description: 'Team ID' })
  async getBookings(
    @CurrentUser() user: AuthUser,
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<TeamBooking[]> {
    return this.teamsService.getBookingsForTeam(teamId);
  }

  @Patch('bookings/:bookingId/status')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Update booking status' })
  @ApiParam({ name: 'bookingId', type: Number, description: 'Booking ID' })
  async updateBookingStatus(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body('status') status: BookingStatus,
  ): Promise<TeamBooking> {
    return this.teamsService.updateBookingStatus(bookingId, status);
  }

  @Delete('bookings/:bookingId')
  @Roles(UserRole.COMPANY)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({ name: 'bookingId', type: Number, description: 'Booking ID' })
  async cancelBooking(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ): Promise<void> {
    return this.teamsService.cancelBooking(bookingId);
  }

  // --- Public Availability Check ---

  @Get('companies/:id/availability')
  @ApiOperation({ summary: 'Check if a company is available on a specific date (public)' })
  @ApiParam({ name: 'id', type: Number, description: 'Company ID' })
  @ApiQuery({ name: 'date', required: true, type: String, description: 'Date to check (YYYY-MM-DD)' })
  async checkCompanyAvailability(
    @Param('id', ParseIntPipe) companyId: number,
    @Query('date') dateStr: string,
  ): Promise<{ companyId: number; isAvailable: boolean; teams: { id: number; name: string; maxParallelJobs: number; activeBookings: number; isAvailable: boolean; hasCapacity: boolean }[] }> {
    return this.teamsService.isCompanyAvailable(companyId, new Date(dateStr));
  }
}

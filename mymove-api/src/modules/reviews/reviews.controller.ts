import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { Public } from '@common/decorators/public.decorator';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // --- Customer endpoints ---

  @Post('reviews')
  @Roles(UserRole.END_CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a review for a completed move' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateReviewDto,
  ): Promise<Review> {
    const userId = Number(user.userId);
    return this.reviewsService.create(
      userId,
      dto.moveRequestId,
      dto.rating,
      dto.reviewText ?? null,
    );
  }

  @Get('reviews/my')
  @Roles(UserRole.END_CUSTOMER)
  @ApiOperation({ summary: 'Get all reviews submitted by the current user' })
  async getMyReviews(@CurrentUser() user: AuthUser): Promise<Review[]> {
    const userId = Number(user.userId);
    return this.reviewsService.findByUser(userId);
  }

  // --- Public / Company endpoints ---

  @Get('companies/:id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get all reviews for a company (public)' })
  @ApiParam({ name: 'id', type: Number, description: 'Company ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCompanyReviews(
    @Param('id', ParseIntPipe) companyId: number,
    @Query('page') pageParam?: string,
    @Query('limit') limitParam?: string,
  ): Promise<{ data: Review[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const page = pageParam ? Number(pageParam) : 1;
    const limit = limitParam ? Number(limitParam) : 20;
    return this.reviewsService.findByCompany(companyId, page, limit);
  }

  @Get('companies/:id/rating')
  @Public()
  @ApiOperation({ summary: 'Get rating summary for a company (public)' })
  @ApiParam({ name: 'id', type: Number, description: 'Company ID' })
  async getCompanyRating(
    @Param('id', ParseIntPipe) companyId: number,
  ): Promise<{ companyId: number; companyName: string; averageRating: number; totalReviews: number; ratingDistribution: Record<number, number>; isFlagged: boolean }> {
    return this.reviewsService.getCompanyRatingSummary(companyId);
  }

  // --- Admin endpoints ---

  @Get('admin/reviews/flagged')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get companies flagged for low ratings (admin)' })
  async getFlaggedCompanies(): Promise<{ companyId: number; companyName: string; averageRating: number; totalReviews: number }[]> {
    return this.reviewsService.findFlaggedCompanies();
  }

  @Delete('admin/reviews/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a review (admin moderation)' })
  @ApiParam({ name: 'id', type: Number, description: 'Review ID' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.reviewsService.delete(id);
  }
}

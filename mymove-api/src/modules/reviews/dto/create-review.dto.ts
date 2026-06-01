import { IsInt, IsString, IsOptional, Min, Max, Length } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  moveRequestId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @Length(1, 2000)
  reviewText?: string;
}

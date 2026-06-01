import { IsDateString, IsEnum } from 'class-validator';
import { BookingStatus } from '../entities/team-booking.entity';

export class CreateBookingDto {
  @IsDateString()
  bookingDate: string;

  @IsEnum(BookingStatus)
  status: BookingStatus;
}

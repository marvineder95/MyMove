import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '@modules/companies/entities/company.entity';

export interface ServicePricesConfig {
  assembly?: number;
  boxes?: number;
  noParkingZone?: number;
}

@Entity('company_pricing')
@Index(['companyId'], { unique: true })
export class CompanyPricing {
  @PrimaryGeneratedColumn('increment', { unsigned: true })
  id: number;

  @Column({ type: 'int', unsigned: true, name: 'company_id' })
  companyId: number;

  @OneToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'base_fee' })
  baseFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'price_per_hour' })
  pricePerHour: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'price_per_km' })
  pricePerKm: number;

  @Column({ type: 'int', unsigned: true, name: 'minimum_hours', default: 2 })
  minimumHours: number;

  @Column({ type: 'int', unsigned: true, name: 'team_size', default: 2 })
  teamSize: number;

  @Column({ type: 'json', nullable: true, name: 'service_prices' })
  servicePrices: ServicePricesConfig | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'price_per_worker', nullable: true })
  pricePerWorker: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'additional_worker_price', nullable: true })
  additionalWorkerPrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'travel_fee', nullable: true })
  travelFee: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'box_rental_price', nullable: true })
  boxRentalPrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'wardrobe_box_price', nullable: true })
  wardrobeBoxPrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'stretch_film_price', nullable: true })
  stretchFilmPrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'tape_price', nullable: true })
  tapePrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'mattress_cover_price', nullable: true })
  mattressCoverPrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'furniture_blanket_price', nullable: true })
  furnitureBlanketPrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'packing_service_hourly_rate', nullable: true })
  packingServiceHourlyRate: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'no_parking_zone_price', nullable: true })
  noParkingZonePrice: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'storage_price_per_sqm', nullable: true })
  storagePricePerSqm: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'disposal_service_price', nullable: true })
  disposalServicePrice: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'weekend_surcharge', nullable: true })
  weekendSurcharge: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'holiday_surcharge', nullable: true })
  holidaySurcharge: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'evening_surcharge', nullable: true })
  eveningSurcharge: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'urgent_booking_surcharge', nullable: true })
  urgentBookingSurcharge: number | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}

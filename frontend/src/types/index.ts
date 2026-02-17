// ============================================
// Enums (matching backend exactly)
// ============================================

export enum CompanyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum CompanyService {
  MOVING = 'MOVING',
  CLEARANCE = 'CLEARANCE',
  EVICTION_CLEARANCE = 'EVICTION_CLEARANCE',
  HOARDER_CLEARANCE = 'HOARDER_CLEARANCE',
  PIANO_TRANSPORT = 'PIANO_TRANSPORT',
  SPECIAL_TRANSPORT = 'SPECIAL_TRANSPORT',
  PACKING_SERVICE = 'PACKING_SERVICE',
  FURNITURE_ASSEMBLY = 'FURNITURE_ASSEMBLY',
  STORAGE_SERVICE = 'STORAGE_SERVICE'
}

export enum VideoStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export enum ItemSource {
  AI_DETECTED = 'AI_DETECTED',
  MANUAL = 'MANUAL'
}

export enum InventoryStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED'
}

export enum FinalOfferStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum OfferStatus {
  DRAFT = 'DRAFT',
  INVENTORY_PENDING = 'INVENTORY_PENDING',
  INVENTORY_CONFIRMED = 'INVENTORY_CONFIRMED',
  ESTIMATES_READY = 'ESTIMATES_READY',
  ESTIMATES_EXPIRED = 'ESTIMATES_EXPIRED',
  COMPANY_SELECTED = 'COMPANY_SELECTED',
  FINAL_OFFER_PENDING = 'FINAL_OFFER_PENDING',
  FINAL_OFFER_SUBMITTED = 'FINAL_OFFER_SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  READY_TO_SEND = 'READY_TO_SEND',
  SENT = 'SENT',
  FAILED = 'FAILED'
}

export enum AnalysisJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}

export enum Role {
  CUSTOMER = 'CUSTOMER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

// ============================================
// Domain Types
// ============================================

export interface Address {
  street: string
  houseNumber: string
  postalCode: string
  city: string
  country: string
  additionalInfo?: string
}

export interface FloorDetails {
  floor: number  // 0 = EG, 1 = 1. Stock, -1 = Keller
  hasElevator: boolean
  needsNoParkingZone: boolean
  walkingDistanceMeters?: number
  narrowStairs?: boolean
  carryOverThresholds?: boolean
}

export interface SpecialRequirements {
  needsBoxes: boolean
  boxesCount?: number
}

// ============================================
// API Request Types
// ============================================

export interface RegisterCompanyRequest {
  companyName: string
  email: string
  password: string
  addressLine: string
  city: string
  postalCode: string
  country: string
  phone: string
  website?: string
  atuNumber: string
  services: CompanyService[]
  tradeLicenseFile: File
  hourlyRate: number  // 1.00 - 500.00
  travelFee: number   // 0.00 - 1000.00
  baseFee?: number
  extraChargePercent?: number  // 0.00 - 100.00
  minimumPrice?: number
}

export interface CreateOfferRequest {
  videoId?: string
  fromAddress: Address
  toAddress: Address
  fromFloor: FloorDetails
  toFloor: FloorDetails
  needsBoxes: boolean
  boxesCount?: number
  moveDate: string  // ISO date format YYYY-MM-DD
  specialRequirements?: SpecialRequirements
}

export interface InventoryItemRequest {
  name: string
  quantity: number  // min 1
  category?: string
  volume?: number
}

export interface UpdateInventoryItemRequest {
  name?: string
  quantity?: number
}

export interface FinalOfferRequest {
  totalPrice?: number  // 0.01 - 100000.00
  validityDays?: number  // 1 - 30, default 7
  notes?: string
  acceptEstimatePrice?: boolean
}

export interface RejectCompanyRequest {
  reason: string
}

export interface RejectFinalOfferRequest {
  reason?: string
}

export interface AssignCompanyRequest {
  companyId: string
}

// ============================================
// API Response Types
// ============================================

export interface RegisterCompanyResponse {
  companyId: string
  email: string
}

export interface VideoResponse {
  id: string
  filename: string
  contentType: string
  sizeBytes: number
  status: string
  createdAt: string
  storageRef: string
}

export interface BoundingBoxResponse {
  x: number
  y: number
  width: number
  height: number
}

export interface DetectedItemResponse {
  label: string
  description?: string
  confidence: number
  boundingBox?: BoundingBoxResponse
  estimatedVolumeM3?: number
  quantity: number
}

export interface AnalysisJobResponse {
  id: string
  videoId: string
  offerId?: string
  status: AnalysisJobStatus
  detectedItems: DetectedItemResponse[]
  errorMessage?: string
  totalVolumeM3?: number
  roomType?: string
  processingTimeSeconds?: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  retryCount: number
  isCompleted: boolean
}

export interface InventoryItemResponse {
  name: string
  quantity: number
  confidence?: number
  source: ItemSource
  category?: string
  volume?: number
  totalVolume: number
}

export interface InventoryResponse {
  id: string
  offerId: string
  status: InventoryStatus
  items: InventoryItemResponse[]
  itemTypeCount: number
  totalItemCount: number
  aiDetectedItemCount: number
  manualItemCount: number
  averageAiConfidence?: number
  totalVolume: number
  createdAt: string
  confirmedAt?: string
}

export interface PriceBreakdownResponse {
  baseFee: number
  travelFee: number
  laborCost: number
  volumeCost: number
  floorSurcharge: number
  distanceSurcharge: number
  otherSurcharges: number
  subtotal: number
  total: number
  details: Record<string, number>
}

export interface PriceEstimateResponse {
  id: string
  offerId: string
  companyId: string
  totalPrice: number
  priceRangeLow: number
  priceRangeHigh: number
  breakdown: PriceBreakdownResponse
  estimatedHours: number
  estimatedVolume: number
  currency: string
  calculatedAt: string
  validUntil: string
  isValid: boolean
}

export interface FinalOfferResponse {
  id: string
  offerId: string
  companyId: string
  totalPrice: number
  breakdown?: PriceBreakdownResponse
  validityDays: number
  notes?: string
  status: FinalOfferStatus
  createdAt: string
  submittedAt?: string
  acceptedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  isExpired: boolean
}

export interface OfferResponse {
  id: string
  status: OfferStatus
  videoId?: string
  createdAt: string
  sentAt?: string
}

export interface CompanyOfferResponse {
  offerId: string
  status: OfferStatus
  moveDate?: string
  fromCity: string
  toCity: string
  fromFloor: number
  toFloor: number
  fromHasElevator: boolean
  toHasElevator: boolean
  priceEstimate?: PriceEstimateResponse
  canSubmitFinalOffer: boolean
}

export interface PricingConditionsResponse {
  hourlyRate: number
  travelFee: number
  baseFee?: number
  extraChargePercent?: number
  minimumPrice?: number
  currency: string
}

export interface CompanyAdminResponse {
  id: string
  name: string
  email: string
  atuNumber: string
  phone: string
  city: string
  services: string[]
  pricingConditions?: PricingConditionsResponse
  status: CompanyStatus
  createdAt: string
  reviewedAt?: string
  rejectionReason?: string
}

export interface CompanyStatsResponse {
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  totalCount: number
}

// ============================================
// Auth Types
// ============================================

export interface UserCredentials {
  email: string
  password: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: {
    email: string
    role: Role
    companyId?: string
  } | null
  credentials: string | null  // base64 encoded credentials for Basic Auth
}

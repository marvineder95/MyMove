export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  phone?: string
  locale?: string
  timezone?: string
  emailNewOffers?: boolean
  emailOfferUpdates?: boolean
  emailReminders?: boolean
  preferredMovingDays?: string | null
  preferredServices?: string | null
  createdAt?: string
}

export interface UserSettings {
  emailNewOffers: boolean
  emailOfferUpdates: boolean
  emailReminders: boolean
}

export interface UserPreferences {
  locale: string
  preferredMovingDays?: string
  preferredServices?: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface MoveExtras {
  assemblyRequired: boolean
  boxesNeeded: boolean
  noParkingZoneRequired: boolean
  isFlexibleDate?: boolean
  elevatorOrigin?: boolean
  elevatorDestination?: boolean
  apartmentSize?: number
  boxCount?: number
  additionalInsurance?: boolean
  materials?: MaterialItem[]
}

export interface MaterialItem {
  id: string
  quantity: number
  selected: boolean
}

export interface MoveRequest {
  id: number
  userId: number
  originAddress: string
  destinationAddress: string
  moveDate: string
  floorsOrigin: number
  floorsDestination: number
  parkingDistance: number | null
  extras: MoveExtras | null
  status: string
  selectedCompanyId: number | null
  createdAt: string
  updatedAt: string
}

export interface CreateMoveRequestPayload {
  originAddress: string
  destinationAddress: string
  moveDate: string
  floorsOrigin?: number
  floorsDestination?: number
  parkingDistance?: number
  extras?: MoveExtras
}

export interface InventoryItem {
  id: number
  moveRequestId: number
  name: string
  quantity: number
  volume: number | null
  weight: number | null
  isAiDetected: boolean
  confidenceScore: number | null
}

export interface CreateItemPayload {
  name: string
  quantity: number
  volume?: number
  weight?: number
  isAiDetected?: boolean
  confidenceScore?: number
}

export interface UpdateItemPayload {
  name?: string
  quantity?: number
  volume?: number
  weight?: number
}

export interface PriceBreakdown {
  baseFee: number
  laborCost: number
  distanceCost: number
  extrasCost: number
  total: number
}

export interface CompanyEstimate {
  companyId: number
  companyName: string
  estimatedPrice: number
  breakdown: PriceBreakdown
  calculationDetails: {
    estimatedHours: number
    totalVolume: number
    totalWeight: number
    totalItems: number
    totalQuantity: number
    distanceKm: number
    teamSize: number
    minimumHours: number
  }
}

export interface EstimateResult {
  moveRequestId: number
  distanceKm: number
  estimates: CompanyEstimate[]
  inventorySummary: {
    totalItems: number
    totalQuantity: number
    totalVolume: number
    totalWeight: number
    aiDetectedCount: number
  }
}

export interface Offer {
  id: number
  moveRequestId: number
  companyId: number
  price: number
  status: string
  breakdown: PriceBreakdown | null
  message: string | null
  company?: {
    id: number
    companyName: string
  }
  createdAt: string
}

export interface Review {
  id: number
  moveRequestId: number
  companyId: number
  userId: number
  rating: number
  reviewText: string | null
  createdAt: string
}

export interface CompanyRatingSummary {
  companyId: number
  companyName: string
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
  isFlagged: boolean
}

export interface Company {
  id: number
  userId: number
  companyName: string
  slug: string
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  website: string | null
  phone: string | null
  email: string | null
  supportEmail: string | null
  taxId: string | null
  status: string
  averageRating: number | null
  totalReviews: number | null
  foundingYear: number | null
  employeeCount: number | null
  contactPerson: string | null
  servicesJson: string | null
  mainLocation: string | null
  operatingRadiusKm: number | null
  supportedCitiesJson: string | null
  internationalMoves: boolean
  maxParallelJobs: number | null
  avgResponseTimeHours: number | null
  completedMovesCount: number
  isVerified: boolean
  documents?: CompanyDocument[]
  createdAt: string
}

export interface AvailableRequest {
  id: number
  originAddress: string
  destinationAddress: string
  moveDate: string
  createdAt: string
  status: 'NEW' | 'PENDING' | 'SENT' | 'NEGOTIATION'
  user: {
    firstName: string
    lastName: string
  } | null
  itemsSummary: {
    totalItems: number
    totalQuantity: number
    totalVolume: number
    totalWeight: number
  }
}

export interface CompanyPricing {
  id: number
  companyId: number
  baseFee: number
  pricePerHour: number
  pricePerKm: number
  minimumHours: number
  teamSize: number
  servicePrices: Record<string, number> | null
  pricePerWorker: number | null
  additionalWorkerPrice: number | null
  travelFee: number | null
  boxRentalPrice: number | null
  wardrobeBoxPrice: number | null
  stretchFilmPrice: number | null
  tapePrice: number | null
  mattressCoverPrice: number | null
  furnitureBlanketPrice: number | null
  packingServiceHourlyRate: number | null
  noParkingZonePrice: number | null
  storagePricePerSqm: number | null
  disposalServicePrice: number | null
  weekendSurcharge: number | null
  holidaySurcharge: number | null
  eveningSurcharge: number | null
  urgentBookingSurcharge: number | null
  createdAt: string
  updatedAt: string
}

export interface CompanyDashboardData {
  kpis: {
    openRequests: number
    sentOffers: number
    confirmedOrders: number
    averageRating: number
    totalReviews: number
  }
  trends: {
    openRequests: number
    sentOffers: number
    confirmedOrders: number
    rating: number
  }
  recentRequests: AvailableRequest[]
}

export interface CompanyProfileData {
  company: Company
  completeness: {
    percentage: number
    missing: string[]
  }
}

export interface CompanyDocument {
  id: number
  companyId: number
  documentType: string
  fileName: string
  fileUrl: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  rejectionReason?: string | null
  verifiedBy?: number | null
  verifiedAt?: string | null
  createdAt: string
}

// ─── Messaging Types ───

export type SenderType = 'CUSTOMER' | 'COMPANY' | 'SYSTEM' | 'ADMIN'
export type MessageType = 'TEXT' | 'SYSTEM' | 'FILE'

export interface Conversation {
  id: number
  moveRequestId: number
  customerId: number
  companyId: number
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
  company?: {
    id: number
    companyName: string
    logoUrl?: string
    rating?: number
  }
  customer?: {
    id: number
    firstName: string
    lastName: string
  }
  moveRequest?: {
    id: number
    originAddress: string
    destinationAddress: string
    moveDate: string
    status: string
  }
  unreadCount?: number
  latestMessage?: Message
}

export interface Message {
  id: number
  conversationId: number
  senderType: SenderType
  senderId: number | null
  messageType: MessageType
  content: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  files?: MessageFile[]
  fileUrl?: string
}

export interface MessageFile {
  id: number
  messageId: number
  fileUrl: string
  fileType: string
  fileName: string
  fileSize: number
  createdAt: string
}

export interface SendMessagePayload {
  content: string
}

export interface PaginatedMessages {
  data: Message[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface PaginatedConversations {
  data: Conversation[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

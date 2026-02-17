// ============================================
// ENUMS
// ============================================

/**
 * Service types offered by moving companies
 */
export enum ServiceType {
  TRANSPORT = 'TRANSPORT',
  PACKING = 'PACKING',
  STORAGE = 'STORAGE',
  CLEANING = 'CLEANING',
  ASSEMBLY = 'ASSEMBLY',
  PIANO = 'PIANO',
  INTERNATIONAL = 'INTERNATIONAL'
}

/**
 * Company approval status
 */
export enum CompanyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INACTIVE = 'INACTIVE'
}

/**
 * Move size categories
 */
export enum MoveSize {
  STUDIO = 'STUDIO',
  APARTMENT_SMALL = 'APARTMENT_SMALL',
  APARTMENT_LARGE = 'APARTMENT_LARGE',
  HOUSE = 'HOUSE',
  OFFICE = 'OFFICE'
}

/**
 * Offer/request status
 */
export enum OfferStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUOTED = 'QUOTED',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * User type for login
 */
export type UserType = 'company' | 'admin'

// ============================================
// BASE INTERFACES
// ============================================

/**
 * Address structure
 */
export interface Address {
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
}

/**
 * Company data structure
 */
export interface Company {
  id: string
  name: string
  email: string
  address: Address
  phone: string
  website?: string
  atuNumber: string
  licenseNumber: string
  services: ServiceType[]
  status: CompanyStatus
  createdAt: string
  updatedAt?: string
  logoUrl?: string
  description?: string
  rating?: number
  reviewCount?: number
}

/**
 * Public company info (limited data)
 */
export interface PublicCompanyInfo {
  id: string
  name: string
  website?: string
  services: ServiceType[]
  rating?: number
  reviewCount?: number
}

// ============================================
// REQUEST INTERFACES
// ============================================

/**
 * Company registration request
 */
export interface CompanyRegistrationRequest {
  companyName: string
  email: string
  password: string
  confirmPassword: string
  atuNumber: string
  licenseNumber: string
  address: Address
  phone: string
  website?: string
  services: ServiceType[]
  insuranceDocument?: File
  acceptTerms: boolean
}

/**
 * Login request
 */
export interface LoginRequest {
  email: string
  password: string
  type: UserType
  rememberMe?: boolean
}

/**
 * Public offer request
 */
export interface OfferRequest {
  fromAddress: string
  toAddress: string
  moveDate: string
  moveSize: MoveSize
  name: string
  email: string
  phone?: string
  notes?: string
}

/**
 * Update company profile request
 */
export interface UpdateCompanyRequest {
  name?: string
  phone?: string
  website?: string
  address?: Address
  services?: ServiceType[]
  description?: string
  logo?: File
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string
}

/**
 * Admin action request
 */
export interface AdminActionRequest {
  companyId: string
  reason?: string
}

// ============================================
// RESPONSE INTERFACES
// ============================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationError[]
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Login response
 */
export interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number
  user: {
    id: string
    email: string
    type: UserType
    company?: Company
  }
}

// ============================================
// DASHBOARD & OFFER INTERFACES
// ============================================

/**
 * Offer/Move request from customer
 */
export interface Offer {
  id: string
  fromAddress: string
  toAddress: string
  moveDate: string
  moveSize: MoveSize
  customerName: string
  customerEmail: string
  customerPhone?: string
  notes?: string
  status: OfferStatus
  createdAt: string
  updatedAt?: string
  assignedCompanyId?: string
  quoteAmount?: number
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  totalOffers: number
  pendingOffers: number
  completedMoves: number
  rating: number
}

/**
 * Company dashboard data
 */
export interface CompanyDashboard {
  company: Company
  stats: DashboardStats
  recentOffers: Offer[]
}

// ============================================
// ADMIN INTERFACES
// ============================================

/**
 * Admin dashboard data
 */
export interface AdminDashboard {
  totalCompanies: number
  pendingCompanies: number
  approvedCompanies: number
  rejectedCompanies: number
  totalOffers: number
}

/**
 * Company filter options
 */
export interface CompanyFilter {
  status?: CompanyStatus
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ============================================
// FORM & UI INTERFACES
// ============================================

/**
 * Form field state
 */
export interface FormFieldState<T = string> {
  value: T
  error?: string
  touched: boolean
  dirty: boolean
}

/**
 * Registration step state
 */
export interface RegistrationStep {
  id: string
  label: string
  isValid: boolean
  isComplete: boolean
}

/**
 * Toast/Notification
 */
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

// ============================================
// STORE STATE INTERFACES
// ============================================

/**
 * Auth store state
 */
export interface AuthState {
  isAuthenticated: boolean
  user: {
    id: string
    email: string
    type: UserType
    company?: Company
  } | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

/**
 * Company store state
 */
export interface CompanyState {
  currentCompany: Company | null
  dashboard: CompanyDashboard | null
  offers: Offer[]
  loading: boolean
  error: string | null
}

/**
 * Admin store state
 */
export interface AdminState {
  companies: Company[]
  dashboard: AdminDashboard | null
  selectedCompany: Company | null
  loading: boolean
  error: string | null
  filter: CompanyFilter
}

/**
 * UI store state
 */
export interface UIState {
  notifications: Notification[]
  sidebarOpen: boolean
  modalOpen: boolean
  currentModal: string | null
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null

/**
 * Optional type helper
 */
export type Optional<T> = T | undefined

/**
 * API error response
 */
export interface ApiError {
  status: number
  message: string
  errors?: ValidationError[]
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Service type labels mapping
 */
export const ServiceTypeLabels: Record<ServiceType, string> = {
  [ServiceType.TRANSPORT]: 'Transport',
  [ServiceType.PACKING]: 'Verpackung',
  [ServiceType.STORAGE]: 'Lagerung',
  [ServiceType.CLEANING]: 'Reinigung',
  [ServiceType.ASSEMBLY]: 'Möbelmontage',
  [ServiceType.PIANO]: 'Klaviertransport',
  [ServiceType.INTERNATIONAL]: 'Internationaler Umzug'
}

/**
 * Company status labels mapping
 */
export const CompanyStatusLabels: Record<CompanyStatus, string> = {
  [CompanyStatus.PENDING]: 'Ausstehend',
  [CompanyStatus.APPROVED]: 'Genehmigt',
  [CompanyStatus.REJECTED]: 'Abgelehnt',
  [CompanyStatus.INACTIVE]: 'Inaktiv'
}

/**
 * Move size labels mapping
 */
export const MoveSizeLabels: Record<MoveSize, string> = {
  [MoveSize.STUDIO]: 'Studio/Wohnung bis 40m²',
  [MoveSize.APARTMENT_SMALL]: '1-2 Zimmer Wohnung (40-70m²)',
  [MoveSize.APARTMENT_LARGE]: '3-4 Zimmer Wohnung (70-120m²)',
  [MoveSize.HOUSE]: 'Haus (ab 120m²)',
  [MoveSize.OFFICE]: 'Büroumzug'
}

/**
 * Offer status labels mapping
 */
export const OfferStatusLabels: Record<OfferStatus, string> = {
  [OfferStatus.NEW]: 'Neu',
  [OfferStatus.CONTACTED]: 'Kontaktiert',
  [OfferStatus.QUOTED]: 'Angebot erstellt',
  [OfferStatus.ACCEPTED]: 'Angenommen',
  [OfferStatus.COMPLETED]: 'Abgeschlossen',
  [OfferStatus.CANCELLED]: 'Storniert'
}

import api from './index'
import type { User } from '@/types'

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface CompanyDocument {
  id: number
  companyId: number
  documentType: string
  fileName: string
  fileUrl: string
  mimeType: string
  fileSizeBytes: number
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  verifiedBy: number | null
  verifiedAt: string | null
  rejectionReason: string | null
  createdAt: string
}

export interface AdminCompany {
  id: number
  companyName: string
  slug: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  email: string | null
  phone: string | null
  website: string | null
  logoUrl: string | null
  bannerUrl: string | null
  mainLocation: string | null
  taxId: string | null
  description: string | null
  createdAt: string
  documents: CompanyDocument[]
}

export interface DashboardStats {
  totalCompanies: number
  totalCustomers: number
  pendingApprovals: number
  pendingDocuments: number
}

export const adminApi = {
  getDashboardStats: () => api.get<DashboardStats>('/admin/dashboard/stats'),

  getCompanies: (page = 1, limit = 20, status?: string) =>
    api.get<PaginatedResponse<AdminCompany>>('/admin/companies', { params: { page, limit, status } }),

  getCompanyDocuments: (companyId: number) =>
    api.get<CompanyDocument[]>(`/admin/companies/${companyId}/documents`),

  approveCompany: (id: number) =>
    api.patch<AdminCompany>(`/admin/companies/${id}/approve`),

  rejectCompany: (id: number, reason: string) =>
    api.patch<AdminCompany>(`/admin/companies/${id}/reject`, { reason }),

  suspendCompany: (id: number, reason: string) =>
    api.patch<AdminCompany>(`/admin/companies/${id}/suspend`, { reason }),

  verifyDocument: (id: number) =>
    api.patch<CompanyDocument>(`/admin/documents/${id}/verify`),

  rejectDocument: (id: number, reason: string) =>
    api.patch<CompanyDocument>(`/admin/documents/${id}/reject`, { reason }),

  resetDocument: (id: number) =>
    api.patch<CompanyDocument>(`/admin/documents/${id}/reset`),

  getCustomers: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<User>>('/users/admin/customers', { params: { page, limit } }),
}

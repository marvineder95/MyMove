# MyMove — Section 6: Key Components (Cross-Functional)

> **Scope:** Domain-level components that span Frontend → Backend → Database  
> **Pattern:** Each component shows its complete vertical slice through the stack  

---

## Table of Contents

1. [Auth & RBAC Component](#1-auth--rbac-component)
2. [Video Upload & AI Analysis Component](#2-video-upload--ai-analysis-component)
3. [Inventory Editor Component](#3-inventory-editor-component)
4. [Move Request Wizard Component](#4-move-request-wizard-component)
5. [Pricing Engine Component](#5-pricing-engine-component)
6. [Availability & Calendar Component](#6-availability--calendar-component)
7. [Offer Lifecycle Component](#7-offer-lifecycle-component)
8. [Company Dashboard Component](#8-company-dashboard-component)
9. [Admin Approval & Moderation Component](#9-admin-approval--moderation-component)
10. [Review & Rating Component](#10-review--rating-component)

---

## 1. Auth & RBAC Component

### Purpose
Unified authentication across all user types (END_CUSTOMER, COMPANY, ADMIN) using Supabase JWT with local role mirroring for relational queries.

### Frontend
- **Views:** `AuthLoginView.vue`, `AuthRegisterView.vue`, `AuthCompanyRegisterView.vue`
- **Components:** `AuthLoginForm.vue`, `AuthRegisterForm.vue`, `AuthCompanyRegisterForm.vue`
- **Composables:** `useAuth.ts`
- **Store:** `useAuthStore` (Pinia)

### Backend
- **Module:** `AuthModule`
- **Services:** `AuthService` (delegates to Supabase), `UsersService`
- **Guards:** `JwtAuthGuard`, `RolesGuard`
- **Decorators:** `@Roles()`, `@CurrentUser()`, `@Public()`
- **Entities:** `User`

### Database
- **Table:** `users` (RBAC via `role` column)
- **Indexes:** `idx_users_email` (unique), `idx_users_role`

### Data Flow
```
1. User submits form → POST /api/v1/auth/register
2. Backend calls Supabase Auth API → creates auth user
3. Supabase returns JWT → backend creates local `users` row with role
4. Frontend stores JWT in httpOnly cookie (or localStorage for SPA)
5. Axios interceptor attaches `Authorization: Bearer <jwt>` to every request
6. `JwtAuthGuard` validates token on every protected route
7. `RolesGuard` checks `@Roles()` metadata against JWT `role` claim
```

### Key Code Snippets
```typescript
// Frontend: useAuth.ts composable
export function useAuth() {
  const store = useAuthStore()
  
  async function login(email: string, password: string) {
    const { data } = await apiAuth.login({ email, password })
    store.setToken(data.accessToken)
    store.setUser(data.user)
    router.push(getDashboardForRole(data.user.role))
  }
  
  function getDashboardForRole(role: UserRole) {
    switch (role) {
      case 'END_CUSTOMER': return '/dashboard'
      case 'COMPANY': return '/company/dashboard'
      case 'ADMIN': return '/admin/dashboard'
    }
  }
  
  return { login, logout, register, registerCompany, user: computed(() => store.user) }
}

// Backend: JwtAuthGuard + RolesGuard combination
@Controller('move-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoveRequestsController {
  @Post()
  @Roles('END_CUSTOMER')
  async create(@Body() dto: CreateMoveRequestDto, @CurrentUser() user: User) {
    return this.moveRequestsService.create(dto, user.id)
  }
}
```

---

## 2. Video Upload & AI Analysis Component

### Purpose
Secure, GDPR-compliant video upload for inventory detection. Videos are temporary and auto-deleted after offer acceptance or 30 days.

### Frontend
- **Components:** `VideoUploader.vue`, `VideoRecorder.vue`, `VideoPreview.vue`, `VideoProgressBar.vue`
- **Composables:** `useVideoUpload.ts`
- **Flow:**
  1. User selects/records video
  2. Frontend requests presigned URL from backend
  3. Uploads directly to S3 (bypassing backend for bandwidth)
  4. Confirms upload to backend
  5. Polls for AI analysis completion

### Backend
- **Module:** `VideosModule`, `InventoryModule`
- **Services:** `VideoLifecycleService`, `S3Service`, `AiAnalysisService` (mocked)
- **Entities:** `Video`, `AiAnalysis`
- **Cron:** Daily job scrubs expired videos

### Database
- **Tables:** `videos` (metadata + S3 key + retention_until), `ai_analyses` (detected_items JSON, volume, weight, confidence_score)
- **Relations:** `videos` → `ai_analyses` (1:1), `videos` → `move_requests` (1:1 via video_id)

### Data Flow
```
1. User clicks Upload → POST /api/v1/videos/presigned-url
   → Backend generates S3 presigned POST URL (15-min expiry, 100MB max)
   → Returns: { uploadUrl, fields, videoId }

2. Frontend PUTs video bytes directly to S3
   → Progress tracked via XMLHttpRequest onProgress

3. Frontend calls POST /api/v1/videos/confirm-upload
   → Backend marks video as UPLOADED, triggers AI analysis job
   → AI service (mocked) receives S3 URL, returns detected items

4. Backend stores AI results in ai_analyses table
   → detected_items JSON: [{ name, category, volumeM3, weightKg, confidence }]

5. Frontend polls GET /api/v1/move-requests/:id/inventory
   → Returns merged view: AI items + user-edited items

6. After offer accepted → Backend triggers video deletion
   → S3 object deleted, videos.is_deleted = true, ai_analyses purged
```

### Key Code Snippets
```typescript
// Frontend: useVideoUpload.ts
export function useVideoUpload() {
  const progress = ref(0)
  const status = ref<'idle' | 'uploading' | 'processing' | 'done'>('idle')
  
  async function upload(file: File) {
    status.value = 'uploading'
    const { data: presigned } = await apiVideos.getPresignedUrl({ 
      filename: file.name, 
      contentType: file.type,
      size: file.size 
    })
    
    await axios.put(presigned.uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (e) => {
        progress.value = Math.round((e.loaded * 100) / (e.total || 1))
      }
    })
    
    await apiVideos.confirmUpload({ videoId: presigned.videoId })
    status.value = 'processing'
    return presigned.videoId
  }
  
  return { upload, progress, status }
}

// Backend: VideoLifecycleService
@Injectable()
export class VideoLifecycleService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly videoRepo: Repository<Video>,
    private readonly aiService: AiAnalysisService,
  ) {}
  
  async initiateUpload(userId: string, metadata: UploadMetadata): Promise<PresignedUrlResult> {
    const video = this.videoRepo.create({
      userId,
      s3Key: `videos/${userId}/${uuidv4()}.mp4`,
      retentionUntil: addDays(new Date(), 30),
      status: 'PENDING_UPLOAD',
    })
    await this.videoRepo.save(video)
    const url = await this.s3Service.getPresignedPutUrl(video.s3Key, 15 * 60)
    return { videoId: video.id, uploadUrl: url, expiresAt: addMinutes(new Date(), 15) }
  }
  
  async confirmAndProcess(videoId: string): Promise<AiAnalysis> {
    const video = await this.videoRepo.findOneBy({ id: videoId })
    video.status = 'UPLOADED'
    await this.videoRepo.save(video)
    
    // Trigger mocked AI analysis
    const aiResult = await this.aiService.analyzeVideo(video.s3Key)
    const analysis = this.aiAnalysisRepo.create({
      videoId,
      detectedItems: aiResult.items,
      totalVolumeM3: aiResult.volume,
      totalWeightKg: aiResult.weight,
      confidenceScore: aiResult.confidence,
    })
    return this.aiAnalysisRepo.save(analysis)
  }
  
  async deleteVideo(videoId: string, reason: 'OFFER_ACCEPTED' | 'EXPIRED'): Promise<void> {
    const video = await this.videoRepo.findOneBy({ id: videoId })
    await this.s3Service.deleteObject(video.s3Key)
    video.isDeleted = true
    video.deletedAt = new Date()
    video.deletionReason = reason
    await this.videoRepo.save(video)
    // Audit log entry
  }
}
```

---

## 3. Inventory Editor Component

### Purpose
Allow customers to review, edit, add, and remove inventory items after AI detection. Supports both AI-detected and manually added items.

### Frontend
- **Components:** `InventoryEditor.vue` (smart), `InventoryItemRow.vue`, `InventoryItemForm.vue`, `AiDetectedItems.vue`, `AiConfidenceBadge.vue`, `VolumeEstimator.vue`
- **Composables:** `useInventory.ts`
- **Store:** `useInventoryStore` (Pinia)
- **Features:**
  - Bulk edit (quantity, volume, weight)
  - Add custom items (not detected by AI)
  - Remove false positives
  - Visual summary (total volume, weight, item count)
  - AI confidence indicators

### Backend
- **Module:** `InventoryModule`
- **Services:** `InventoryService`
- **Entities:** `InventoryItem`, `AiAnalysis`
- **Methods:** `getByMoveRequest()`, `addItem()`, `updateItem()`, `removeItem()`, `syncWithAi()`

### Database
- **Table:** `inventory_items` (name, category, quantity, volume_m3, weight_kg, is_ai_detected, confidence_score, move_request_id)
- **Relation:** `inventory_items` → `move_requests` (N:1)

### Data Flow
```
1. AI analysis complete → frontend loads inventory
   → GET /api/v1/inventory?moveRequestId=...
   → Backend returns: { items: [...], summary: { totalItems, totalVolumeM3, totalWeightKg } }

2. User edits quantity on item → PATCH /api/v1/inventory/items/:id
   → DTO: { quantity: 2, volumeM3: 3.0 }
   → Backend updates row, recalculates summary
   → Frontend updates local store optimistically

3. User adds custom item → POST /api/v1/inventory/items
   → DTO: { name: "Grandfather Clock", category: "FURNITURE", quantity: 1, volumeM3: 0.8, weightKg: 45, source: "MANUAL" }
   → Backend inserts with is_ai_detected = false, confidence_score = null

4. User removes false-positive AI item → DELETE /api/v1/inventory/items/:id
   → Backend soft-deletes (deleted_at) for audit trail
```

### Key Code Snippets
```vue
<!-- Frontend: InventoryEditor.vue -->
<script setup lang="ts">
const props = defineProps<{ moveRequestId: string }>()
const { t } = useI18n()
const inventoryStore = useInventoryStore()

onMounted(() => inventoryStore.loadInventory(props.moveRequestId))

const totalVolume = computed(() => 
  inventoryStore.items.reduce((sum, item) => sum + (item.volumeM3 * item.quantity), 0)
)

async function updateItem(itemId: string, patch: Partial<InventoryItem>) {
  await inventoryStore.updateItem(itemId, patch)
}

async function addCustomItem(form: InventoryItemForm) {
  await inventoryStore.addItem({ ...form, source: 'MANUAL', isAiDetected: false })
}
</script>

<template>
  <div class="space-y-6">
    <InventorySummary 
      :total-items="inventoryStore.summary.totalItems"
      :total-volume="totalVolume"
      :total-weight="inventoryStore.summary.totalWeightKg"
    />
    
    <div class="space-y-2">
      <InventoryItemRow
        v-for="item in inventoryStore.items"
        :key="item.id"
        :item="item"
        @update="updateItem"
        @remove="inventoryStore.removeItem"
      />
    </div>
    
    <BaseButton variant="primary" @click="showAddModal = true">
      {{ t('inventory.addCustomItem') }}
    </BaseButton>
  </div>
</template>
```

---

## 4. Move Request Wizard Component

### Purpose
Multi-step wizard for customers to create a complete move request: video → inventory → details → company selection.

### Frontend
- **Views:** `MoveRequestWizardView.vue` (parent with stepper)
- **Sub-views/pages:**
  - Step 1: `/move/:id/video` → `VideoUploader.vue`
  - Step 2: `/move/:id/inventory` → `InventoryEditor.vue`
  - Step 3: `/move/:id/details` → `MoveDetailsForm.vue`
  - Step 4: `/move/:id/companies` → `CompanyList.vue` with availability filter
- **Components:** `MoveDetailsForm.vue`, `MoveAddressInput.vue`, `MoveDatePicker.vue`, `MoveFloorInfo.vue`, `MoveElevatorInfo.vue`, `MoveParkingInfo.vue`, `MoveExtrasSelector.vue`, `MoveSummary.vue`, `BaseStepper.vue`
- **Store:** `useMoveRequestStore`

### Backend
- **Module:** `MoveRequestsModule`
- **Services:** `MoveRequestsService`
- **Entities:** `MoveRequest`, `Address`
- **Status Flow:** DRAFT → SUBMITTED → OFFERS_PENDING → OFFER_RECEIVED → ACCEPTED → COMPLETED → CANCELLED

### Database
- **Table:** `move_requests` (user_id, from_address, to_address, move_date, floors, elevator, parking, status)
- **Related:** `addresses` (normalized address storage with GPS coordinates)
- **Junction:** `request_companies` (which companies were requested)

### Data Flow
```
1. Customer starts wizard → POST /api/v1/move-requests
   → Backend creates DRAFT move_request
   → Returns moveRequestId

2. Step 1: Video upload (see Video Component above)
   → Video linked to move_request via video_id FK

3. Step 2: Inventory editing (see Inventory Component above)
   → Items linked via move_request_id FK

4. Step 3: Move details → PATCH /api/v1/move-requests/:id
   → DTO: { fromAddress, toAddress, moveDate, floorsFrom, floorsTo, 
            hasElevatorFrom, hasElevatorTo, parkingSituation, 
            distanceToTruckMeters, extras: [] }
   → Backend stores in move_requests + addresses tables

5. Step 4: Company selection
   → GET /api/v1/availability/check?date=2024-07-10
   → Backend returns available companies with capacity
   → Customer selects companies → POST /api/v1/move-requests/:id/request-offers
   → Backend creates request_companies rows, updates status to SUBMITTED
   → Notifications sent to selected companies
```

---

## 5. Pricing Engine Component

### Purpose
Unified pricing calculation using company-defined parameters. Transparent breakdown shown to customers.

### Frontend
- **Components:** `PricingEstimateCard.vue`, `PricingBreakdown.vue`, `PricingParameterEditor.vue`, `ServiceAddonEditor.vue`, `BaseFeeEditor.vue`
- **Composables:** `usePricingEstimate.ts`
- **Store:** `useCompanyStore` (for company pricing rules)

### Backend
- **Module:** `PricingModule`
- **Services:** `PricingEngineService` (core calculation), `PricingRulesService` (CRUD)
- **Entities:** `PricingRule`, `ServiceAddon`

### Database
- **Tables:** `pricing_rules` (company_id, price_per_hour, price_per_km, base_fee, team_size, minimum_fee, floor_surcharge_rate, parking_surcharge_rate), `service_addons` (company_id, service_name, price, pricing_type: FLAT or PER_HOUR)

### Formula
```
estimated_price = 
  base_fee
  + (price_per_hour × estimated_hours × team_size)
  + (price_per_km × distance_km)
  + floor_surcharge
  + parking_surcharge
  + addons_total

Where:
  floor_surcharge = Σ(max(0, floors - 1) × per_floor_rate) for each address without elevator
  parking_surcharge = max(0, distance_to_truck - 50m) × per_meter_rate
  addons_total = Σ(addon_price) — per-hour addons multiplied by estimated_hours
```

### Data Flow
```
1. Company sets pricing → POST /api/v1/pricing/rules
   → Backend stores in pricing_rules table

2. Customer requests estimate → POST /api/v1/pricing/calculate
   → DTO: { moveRequestId, companyId, addonIds: [] }
   → Backend:
     a. Loads pricing_rules for company
     b. Loads inventory (volume, weight, item count)
     c. Loads move details (distance, floors, elevator, parking)
     d. Calculates breakdown via PricingEngineService
     e. Returns: { estimatedPrice, breakdown: { baseFee, distanceCharge, timeCharge, ... } }

3. Customer sees transparent breakdown in PricingBreakdown.vue

4. Company adjusts final price → PATCH /api/v1/offers/:id
   → Can increase/decrease from estimated price
   → Must provide reason for adjustment (customer transparency)
```

### Key Code Snippets
```typescript
// Backend: PricingEngineService
type PricingBreakdown = {
  baseFee: number
  distanceCharge: number
  timeEstimateCharge: number
  floorSurcharge: number
  elevatorDiscount: number
  parkingSurcharge: number
  addonsTotal: number
  subtotal: number
  platformCommission: number
  grandTotal: number
}

@Injectable()
export class PricingEngineService {
  calculate(input: PricingInput, rules: PricingRule, addons: ServiceAddon[]): PricingCalculationResult {
    const distanceCharge = rules.pricePerKm * input.distanceKm
    const timeCharge = rules.pricePerHour * input.estimatedHours * rules.teamSize
    
    const floorSurcharge = 
      (input.floorsFrom > 1 && !input.hasElevatorFrom ? (input.floorsFrom - 1) * rules.floorSurchargeRate : 0) +
      (input.floorsTo > 1 && !input.hasElevatorTo ? (input.floorsTo - 1) * rules.floorSurchargeRate : 0)
    
    const parkingSurcharge = input.parkingDistanceMeters > 50
      ? (input.parkingDistanceMeters - 50) * rules.parkingSurchargeRate
      : 0
    
    const addonsTotal = addons.reduce((sum, addon) => {
      const price = addon.pricingType === 'PER_HOUR' 
        ? addon.price * input.estimatedHours 
        : addon.price
      return sum + price
    }, 0)
    
    const subtotal = rules.baseFee + distanceCharge + timeCharge + floorSurcharge + parkingSurcharge + addonsTotal
    const commission = subtotal * 0.10 // 10% platform commission (configurable)
    const grandTotal = subtotal + commission
    
    return {
      estimatedPrice: this.round(grandTotal),
      breakdown: { /* ... */ },
      currency: 'EUR',
      calculationVersion: '1.0.0',
    }
  }
}
```

---

## 6. Availability & Calendar Component

### Purpose
Allow companies to manage team capacity and let customers see which companies are available for their move date. Supports parallel jobs per team.

### Frontend
- **Company Components:** `AvailabilityCalendar.vue`, `AvailabilityDayCell.vue`, `AvailabilitySlotEditor.vue`, `TeamCapacityEditor.vue`, `ParallelJobsEditor.vue`
- **Customer Components:** `CompanyAvailabilityIndicator.vue` (shows "Available on July 10" badge)
- **Composables:** `useAvailability.ts`
- **Store:** `useAvailabilityStore`

### Backend
- **Module:** `AvailabilityModule`
- **Services:** `AvailabilityService`, `TeamCapacityService`
- **Entities:** `AvailabilitySlot`, `Team`

### Database
- **Tables:** `teams` (company_id, team_name, max_jobs_per_day), `availability_slots` (team_id, slot_date, capacity_used, capacity_total)
- **Logic:** capacity_used increments when a move request is assigned; decrements on cancellation

### Data Flow
```
1. Company creates teams → POST /api/v1/availability/teams
   → Backend inserts into teams table

2. Company sets capacity → POST /api/v1/availability/slots
   → Bulk create slots for a month
   → Or auto-generate recurring slots

3. Customer views move date → GET /api/v1/availability/check?date=2024-07-10
   → Backend query:
      SELECT c.*, t.id as team_id, t.team_name
      FROM companies c
      JOIN teams t ON t.company_id = c.id
      LEFT JOIN availability_slots s ON s.team_id = t.id AND s.slot_date = '2024-07-10'
      WHERE c.status = 'APPROVED'
        AND (s.capacity_used < s.capacity_total OR s.id IS NULL)
   → Returns available companies with assignable teams

4. Customer requests offers from available companies
   → System auto-assigns team with most remaining capacity

5. Company views calendar → GET /api/v1/availability/me
   → Returns month view with all slots and assigned jobs
```

### Key Code Snippets
```typescript
// Backend: AvailabilityService
@Injectable()
export class AvailabilityService {
  async checkAvailability(date: Date, companyId?: string): Promise<CompanyAvailability[]> {
    const qb = this.availabilityRepo.createQueryBuilder('slot')
      .innerJoinAndSelect('slot.team', 'team')
      .innerJoinAndSelect('team.company', 'company')
      .where('company.status = :status', { status: 'APPROVED' })
      .andWhere('slot.slot_date = :date', { date: formatDate(date) })
      .andWhere('slot.capacity_used < slot.capacity_total')
    
    if (companyId) {
      qb.andWhere('company.id = :companyId', { companyId })
    }
    
    const slots = await qb.getMany()
    return this.groupByCompany(slots)
  }
  
  async allocateCapacity(moveRequestId: string, teamId: string, date: Date): Promise<void> {
    await this.availabilityRepo.manager.transaction(async (manager) => {
      const slot = await manager.findOne(AvailabilitySlot, {
        where: { teamId, slotDate: formatDate(date) },
        lock: { mode: 'pessimistic_write' }
      })
      
      if (!slot || slot.capacityUsed >= slot.capacityTotal) {
        throw new UnprocessableEntityException('INSUFFICIENT_CAPACITY')
      }
      
      slot.capacityUsed += 1
      await manager.save(slot)
    })
  }
}
```

---

## 7. Offer Lifecycle Component

### Purpose
Manage the complete offer flow: company creates draft → adjusts price/services → sends to customer → customer accepts/rejects → move scheduled.

### Frontend
- **Company Components:** `OfferEditor.vue`, `OfferStatusBadge.vue`, `RequestInboxItem.vue`, `RequestDetail.vue`
- **Customer Components:** `OfferCard.vue`, `OfferList.vue`, `OfferComparison.vue`, `OfferAcceptButton.vue`, `OfferRejectButton.vue`
- **Composables:** `useOffer.ts`
- **Store:** `useOfferStore`

### Backend
- **Module:** `OffersModule`
- **Services:** `OffersService`
- **Entities:** `Offer`, `OfferService` (junction for services attached to offer)

### Database
- **Tables:** `offers` (move_request_id, company_id, team_id, estimated_price, final_price, status, valid_until), `offer_services` (offer_id, service_addon_id, quantity, total_price)
- **Status Flow:** DRAFT → SENT → ACCEPTED | REJECTED | EXPIRED

### Data Flow
```
1. Company receives request notification
   → GET /api/v1/company/requests (inbox)
   → Clicks request → sees inventory, video, AI results, customer details

2. Company creates offer draft → POST /api/v1/offers
   → DTO: { moveRequestId, companyId, teamId, estimatedPrice, finalPrice, serviceIds: [] }
   → Backend creates offer with status = DRAFT

3. Company adjusts offer → PATCH /api/v1/offers/:id
   → Can change: finalPrice, services, team, message to customer
   → Backend recalculates offer_services junction table

4. Company sends offer → POST /api/v1/offers/:id/send
   → Status → SENT
   → Valid until: +5 days
   → Customer notified
   → Video auto-deletion scheduled (if this is the first sent offer)

5. Customer views offers → GET /api/v1/move-requests/:id/offers
   → Sees all offers with transparent breakdown
   → Can compare in OfferComparison.vue

6. Customer accepts → POST /api/v1/move-requests/:id/accept-offer/:offerId
   → Offer status → ACCEPTED
   → All other offers → REJECTED
   → Move request status → ACCEPTED
   → Video deleted immediately (GDPR)
   → Team capacity allocated in availability_slots
   → Commission record created in commissions table
```

---

## 8. Company Dashboard Component

### Purpose
Central hub for company users to manage their profile, pricing, teams, availability, and incoming requests.

### Frontend
- **Views:** `CompanyDashboardView.vue`, `CompanyProfileView.vue`, `CompanyPricingView.vue`, `CompanyAvailabilityView.vue`, `CompanyTeamsView.vue`, `CompanyRequestsView.vue`, `CompanyOffersView.vue`, `CompanyDocumentsView.vue`
- **Components:** `CompanyCard.vue`, `CompanyProfileForm.vue`, `CompanyLogoUpload.vue`, `CompanyServiceAreaMap.vue`, `CompanyVerificationBadge.vue`, `StatCard.vue`, `RecentActivity.vue`, `QuickActionPanel.vue`
- **Store:** `useCompanyStore`

### Backend
- **Module:** `CompaniesModule`, `AvailabilityModule`, `OffersModule`
- **Services:** `CompaniesService`, `DashboardService`
- **Entities:** `Company`, `CompanyDocument`

### Database
- **Tables:** `companies` (profile info, status, commission_rate), `company_documents` (document_type, file_url, status)

### Key Metrics (Dashboard)
| Metric | Source |
|--------|--------|
| Pending requests | `request_companies` WHERE status = 'REQUESTED' |
| Active offers | `offers` WHERE status = 'SENT' |
| Accepted moves (this month) | `offers` WHERE status = 'ACCEPTED' AND accepted_at >= month_start |
| Average rating | `reviews` AVG(score) WHERE company_id = ? |
| Team utilization | `availability_slots` capacity_used / capacity_total |
| Revenue (estimated) | `offers` SUM(final_price) WHERE accepted_at >= month_start |

---

## 9. Admin Approval & Moderation Component

### Purpose
Admin panel for point4Studio to approve companies, verify documents, manage commissions, suspend underperformers, and monitor platform health.

### Frontend
- **Views:** `AdminDashboardView.vue`, `AdminCompanyApprovalQueueView.vue`, `AdminCompanyListView.vue`, `AdminDocumentVerificationView.vue`, `AdminCommissionView.vue`, `AdminReviewMonitorView.vue`, `AdminActivityLogView.vue`
- **Components:** `AdminCompanyApprovalQueue.vue`, `AdminCompanyApprovalCard.vue`, `AdminCompanyDetail.vue`, `AdminDocumentViewer.vue`, `AdminCommissionEditor.vue`, `AdminPlatformMetrics.vue`, `AdminReviewMonitor.vue`, `AdminActivityLog.vue`
- **Store:** `useAdminStore`

### Backend
- **Module:** `AdminModule`
- **Services:** `AdminService`, `DashboardService`
- **Guards:** `RolesGuard(['ADMIN'])` + `AuditLogInterceptor`

### Database
- **Tables:** `admin_logs` (immutable audit trail), `companies` (status field), `company_documents` (verification_status)

### Admin Actions & Audit Trail
| Action | DB Update | Audit Log | Auto-Trigger |
|--------|-----------|-----------|--------------|
| Approve company | `companies.status = 'APPROVED'` | `admin_logs` row | Notify company owner |
| Reject company | `companies.status = 'REJECTED'` | `admin_logs` row + reason | Notify company owner |
| Suspend company | `companies.status = 'SUSPENDED'` | `admin_logs` row + reason | All active offers cancelled |
| Verify document | `company_documents.status = 'VERIFIED'` | `admin_logs` row | Company approval check |
| Set commission | `companies.commission_rate = X` | `admin_logs` row | Future offers affected |

### Rating Monitoring
```sql
-- Flag companies with average rating below threshold
SELECT c.id, c.company_name, AVG(r.score) as avg_rating, COUNT(r.id) as review_count
FROM companies c
JOIN reviews r ON r.company_id = c.id
WHERE c.status = 'APPROVED'
GROUP BY c.id
HAVING avg_rating < 3.0 AND review_count >= 5;
```

---

## 10. Review & Rating Component

### Purpose
Post-move rating system ensuring only customers who completed a move can review. Reviews affect company visibility and commission rates.

### Frontend
- **Components:** `ReviewForm.vue`, `ReviewCard.vue`, `ReviewStars.vue`, `ReviewList.vue`
- **Composables:** `useReview.ts`
- **Store:** `useReviewStore`

### Backend
- **Module:** `ReviewsModule`
- **Services:** `ReviewsService`, `CommissionService` (dynamic recalculation)
- **Entities:** `Review`, `Commission`

### Database
- **Tables:** `reviews` (move_request_id, offer_id, company_id, customer_id, score 1-5, review_text, is_flagged), `commissions` (dynamic rate based on company rating tier)

### Rating Tiers & Commission Impact
| Tier | Avg Rating | Commission Rate | Visibility |
|------|-----------|-----------------|------------|
| ELITE | >= 4.5 | 5% | Featured |
| PREFERRED | 4.0 – 4.49 | 8% | Boosted |
| STANDARD | 3.0 – 3.99 | 12% | Normal |
| PROVISIONAL | < 3.0 | 18% | Deprioritized |

### Data Flow
```
1. Move completed (company marks as done or date passes)
   → Customer receives notification: "Rate your move"

2. Customer submits review → POST /api/v1/reviews
   → Validation: customer must be owner of move_request, offer status = ACCEPTED
   → Backend inserts review row

3. Backend recalculates company average rating
   → Updates company metadata
   → Checks if below threshold → flags for admin

4. Commission rate recalculation
   → If rating tier changed → update company.commission_rate
   → Affects future offers only (not retroactive)

5. Admin sees flagged companies in AdminReviewMonitor.vue
   → Can suspend if pattern of low ratings
```

---

## Component Relationship Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CUSTOMER JOURNEY                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Auth & RBAC
    ↓
Move Request Wizard ──→ Video Upload ──→ AI Analysis
    ↓                                      ↓
Inventory Editor ←──────────────────────────┘
    ↓
Move Details Form
    ↓
Company Selection ←── Availability & Calendar
    ↓
Request Offers ──→ Company Dashboard (notification)
    ↓                    ↓
Offer Comparison ←── Offer Lifecycle (company creates)
    ↓
Accept Offer ──→ Video Auto-Delete (GDPR)
    ↓
Move Completed ──→ Review & Rating
                        ↓
                   Admin Moderation (if flagged)
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           COMPANY JOURNEY                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Auth & RBAC
    ↓
Company Dashboard
    ├── Profile Setup
    ├── Document Upload ──→ Admin Approval & Moderation
    ├── Pricing Engine Setup
    ├── Team & Availability Calendar Setup
    │
    └── Request Inbox ←── Move Request Wizard (customer)
            ↓
        View Inventory / Video / AI
            ↓
        Offer Lifecycle (create → adjust → send)
            ↓
        Move Scheduled (capacity allocated)
            ↓
        Move Completed
            ↓
        Review & Rating (customer rates company)
```

---

## Integration Points Summary

| Component | Frontend → API | Backend → DB | Backend → External |
|-----------|-------------|------------|-------------------|
| Auth | `apiAuth.ts` | `users` table | Supabase Auth |
| Video | `apiVideos.ts`, `useVideoUpload.ts` | `videos`, `ai_analyses` | AWS S3, AI Service |
| Inventory | `apiInventory.ts`, `useInventory.ts` | `inventory_items` | — |
| Move Request | `apiMoveRequests.ts`, `useMoveRequest.ts` | `move_requests`, `addresses`, `request_companies` | — |
| Pricing | `apiPricing.ts`, `usePricingEstimate.ts` | `pricing_rules`, `service_addons` | — |
| Availability | `apiAvailability.ts`, `useAvailability.ts` | `teams`, `availability_slots` | — |
| Offer | `apiOffers.ts`, `useOffer.ts` | `offers`, `offer_services` | — |
| Reviews | `apiReviews.ts`, `useReview.ts` | `reviews`, `commissions` | — |
| Admin | `apiAdmin.ts`, `useAdmin.ts` | `companies`, `company_documents`, `admin_logs` | — |

---

*End of Key Components Specification*

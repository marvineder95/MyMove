# MyMove — Complete Vue 3 Frontend Architecture

> **Version:** MVP Foundation  
> **Stack:** Vue 3 (Composition API) + Vite + TailwindCSS + Vue Router + Pinia + vue-i18n + TypeScript  
> **Pattern:** Atomic design + Container/Presentational split + Zero hardcoded text

---

## Section 1 — Frontend Folder Structure

```
my-move-frontend/
├── public/
│   ├── favicon.ico
│   └── images/
│       └── hero-bg.jpg
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── vite-env.d.ts
│   ├── shims-vue.d.ts
│   │
│   ├── api/                          # API clients & module files
│   │   ├── client.ts                 # Axios/fetch base client
│   │   ├── interceptors.ts           # JWT, 401 redirect, logging
│   │   ├── moveRequests.ts           # Move request endpoints
│   │   ├── inventory.ts              # Inventory + AI endpoints
│   │   ├── companies.ts              # Company profile & pricing
│   │   ├── offers.ts                 # Offer CRUD
│   │   ├── reviews.ts                # Ratings & reviews
│   │   ├── admin.ts                  # Admin-only endpoints
│   │   ├── auth.ts                   # Login / register / token refresh
│   │   ├── uploads.ts                # S3 presigned URL + multipart
│   │   ├── availability.ts           # Calendar slots
│   │   ├── notifications.ts          # WebSocket / polling
│   │   └── index.ts                  # Barrel export
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── empty-state.svg
│   │   │   └── icons/
│   │   └── styles/
│   │       ├── tailwind.css          # @tailwind directives
│   │       ├── variables.css         # CSS custom properties
│   │       └── animations.css        # Keyframes + transitions
│   │
│   ├── components/
│   │   ├── _base/                    # Atomic UI primitives (no domain logic)
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseModal.vue
│   │   │   ├── BaseInput.vue
│   │   │   ├── BaseSelect.vue
│   │   │   ├── BaseTextarea.vue
│   │   │   ├── BaseToggle.vue
│   │   │   ├── BaseBadge.vue
│   │   │   ├── BaseSkeleton.vue
│   │   │   ├── BaseSpinner.vue
│   │   │   ├── BaseEmptyState.vue
│   │   │   ├── BasePagination.vue
│   │   │   ├── BaseTable.vue
│   │   │   ├── BaseTableHeader.vue
│   │   │   ├── BaseTableRow.vue
│   │   │   ├── BaseFileUpload.vue
│   │   │   ├── BaseVideoPlayer.vue
│   │   │   ├── BaseAvatar.vue
│   │   │   ├── BaseDatePicker.vue
│   │   │   ├── BaseTimePicker.vue
│   │   │   ├── BaseCurrencyInput.vue
│   │   │   ├── BaseAlert.vue
│   │   │   ├── BaseToast.vue
│   │   │   ├── BaseTooltip.vue
│   │   │   ├── BaseAccordion.vue
│   │   │   ├── BaseTabs.vue
│   │   │   ├── BaseStepper.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── _layout/                  # Layout-level components
│   │   │   ├── TheNavbar.vue
│   │   │   ├── TheSidebar.vue
│   │   │   ├── TheFooter.vue
│   │   │   ├── TheBreadcrumbs.vue
│   │   │   ├── TheLanguageSwitcher.vue
│   │   │   ├── TheNotificationBell.vue
│   │   │   ├── TheRoleSwitcher.vue   # B2C ↔ B2B toggle
│   │   │   └── index.ts
│   │   │
│   │   ├── auth/                     # Auth domain components
│   │   │   ├── AuthLoginForm.vue
│   │   │   ├── AuthRegisterForm.vue
│   │   │   ├── AuthCompanyRegisterForm.vue
│   │   │   ├── AuthForgotPassword.vue
│   │   │   ├── AuthSocialLogin.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── video/                    # Video upload & player
│   │   │   ├── VideoUploader.vue
│   │   │   ├── VideoRecorder.vue
│   │   │   ├── VideoPreview.vue
│   │   │   ├── VideoProgressBar.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── inventory/                # Inventory editor
│   │   │   ├── InventoryEditor.vue
│   │   │   ├── InventoryItemRow.vue
│   │   │   ├── InventoryItemForm.vue
│   │   │   ├── InventorySummary.vue
│   │   │   ├── AiDetectedItems.vue
│   │   │   ├── AiConfidenceBadge.vue
│   │   │   ├── VolumeEstimator.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── move/                     # Move request flow
│   │   │   ├── MoveDetailsForm.vue
│   │   │   ├── MoveAddressInput.vue
│   │   │   ├── MoveDatePicker.vue
│   │   │   ├── MovePropertyTypeSelect.vue
│   │   │   ├── MoveFloorInfo.vue
│   │   │   ├── MoveElevatorInfo.vue
│   │   │   ├── MoveParkingInfo.vue
│   │   │   ├── MoveDistanceInfo.vue
│   │   │   ├── MoveExtrasSelector.vue
│   │   │   ├── MoveSummary.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── company/                  # Company-facing components
│   │   │   ├── CompanyCard.vue
│   │   │   ├── CompanyList.vue
│   │   │   ├── CompanyProfileForm.vue
│   │   │   ├── CompanyLogoUpload.vue
│   │   │   ├── CompanyServiceAreaMap.vue
│   │   │   ├── CompanyVerificationBadge.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── pricing/                  # Pricing components
│   │   │   ├── PricingParameterEditor.vue
│   │   │   ├── PricingRuleCard.vue
│   │   │   ├── PricingEstimateCard.vue
│   │   │   ├── PricingBreakdown.vue
│   │   │   ├── ServiceAddonEditor.vue
│   │   │   ├── BaseFeeEditor.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── availability/             # Availability calendar
│   │   │   ├── AvailabilityCalendar.vue
│   │   │   ├── AvailabilityDayCell.vue
│   │   │   ├── AvailabilitySlotEditor.vue
│   │   │   ├── TeamCapacityEditor.vue
│   │   │   ├── ParallelJobsEditor.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── offer/                    # Offer components
│   │   │   ├── OfferCard.vue
│   │   │   ├── OfferList.vue
│   │   │   ├── OfferDetail.vue
│   │   │   ├── OfferEditor.vue
│   │   │   ├── OfferStatusBadge.vue
│   │   │   ├── OfferComparison.vue
│   │   │   ├── OfferAcceptButton.vue
│   │   │   ├── OfferRejectButton.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── request/                  # Request inbox (company)
│   │   │   ├── RequestInboxList.vue
│   │   │   ├── RequestInboxItem.vue
│   │   │   ├── RequestDetail.vue
│   │   │   ├── RequestStatusBadge.vue
│   │   │   ├── RequestFilterBar.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── review/                   # Ratings & reviews
│   │   │   ├── ReviewForm.vue
│   │   │   ├── ReviewCard.vue
│   │   │   ├── ReviewStars.vue
│   │   │   ├── ReviewList.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/                # Dashboard widgets
│   │   │   ├── StatCard.vue
│   │   │   ├── ChartWidget.vue
│   │   │   ├── RecentActivity.vue
│   │   │   ├── QuickActionPanel.vue
│   │   │   └── index.ts
│   │   │
│   │   ├── admin/                    # Admin components
│   │   │   ├── AdminCompanyApprovalQueue.vue
│   │   │   ├── AdminCompanyApprovalCard.vue
│   │   │   ├── AdminCompanyDetail.vue
│   │   │   ├── AdminDocumentViewer.vue
│   │   │   ├── AdminCommissionEditor.vue
│   │   │   ├── AdminReviewMonitor.vue
│   │   │   ├── AdminPlatformMetrics.vue
│   │   │   ├── AdminCompanyList.vue
│   │   │   ├── AdminUserList.vue
│   │   │   ├── AdminActivityLog.vue
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                  # Global barrel export
│   │
│   ├── composables/                  # Shared logic composables
│   │   ├── useAuth.ts
│   │   ├── useMoveRequest.ts
│   │   ├── useVideoUpload.ts
│   │   ├── useInventory.ts
│   │   ├── usePricingEstimate.ts
│   │   ├── useAvailability.ts
│   │   ├── useRoleGuard.ts
│   │   ├── useI18nHelpers.ts
│   │   ├── useFormValidation.ts
│   │   ├── usePagination.ts
│   │   ├── useSorting.ts
│   │   ├── useFiltering.ts
│   │   ├── useDateFormatting.ts
│   │   ├── useCurrencyFormatting.ts
│   │   ├── useFileUpload.ts
│   │   ├── useToast.ts
│   │   ├── useConfirmDialog.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useAsyncState.ts
│   │   └── index.ts
│   │
│   ├── layouts/
│   │   ├── DefaultLayout.vue         # Public pages (marketing, auth)
│   │   ├── CustomerLayout.vue        # B2C logged-in shell
│   │   ├── CompanyLayout.vue         # B2B company shell
│   │   ├── AdminLayout.vue           # Admin shell (dense sidebar)
│   │   └── index.ts
│   │
│   ├── router/
│   │   ├── index.ts                  # Router factory + history
│   │   ├── routes.ts                 # Route definitions array
│   │   ├── guards.ts                 # beforeEach / role guards
│   │   └── routeNames.ts             # Enum of route names (type-safe)
│   │
│   ├── stores/                       # Pinia stores
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── moveRequestStore.ts
│   │   ├── inventoryStore.ts
│   │   ├── companyStore.ts
│   │   ├── availabilityStore.ts
│   │   ├── offerStore.ts
│   │   ├── reviewStore.ts
│   │   ├── adminStore.ts
│   │   ├── notificationStore.ts
│   │   └── index.ts                # Barrel + store hydration
│   │
│   ├── types/                        # Global TypeScript interfaces
│   │   ├── user.ts
│   │   ├── company.ts
│   │   ├── moveRequest.ts
│   │   ├── inventory.ts
│   │   ├── offer.ts
│   │   ├── review.ts
│   │   ├── pricing.ts
│   │   ├── availability.ts
│   │   ├── notification.ts
│   │   ├── api.ts                  # Generic ApiResponse, Paginated<T>
│   │   └── index.ts                # Barrel
│   │
│   ├── i18n/
│   │   ├── index.ts                # i18n instance setup
│   │   ├── messages/
│   │   │   ├── en.json
│   │   │   ├── de.json
│   │   │   └── index.ts            # Import map
│   │   ├── dateTimeFormats.ts
│   │   ├── numberFormats.ts
│   │   ├── pluralRules.ts
│   │   └── locales.ts              # Locale metadata + lazy loader
│   │
│   ├── utils/
│   │   ├── constants.ts            # App-wide constants
│   │   ├── enums.ts                # TypeScript enums (UserRole, etc.)
│   │   ├── formatters.ts           # Date, currency, phone helpers
│   │   ├── validators.ts         # Vuelidate / zod rules
│   │   ├── errorHandler.ts         # Centralized error formatter
│   │   ├── storage.ts              # localStorage wrapper
│   │   ├── permissions.ts          # RBAC permission checks
│   │   └── index.ts
│   │
│   └── services/
│       ├── websocketService.ts     # Real-time notifications
│       ├── pushNotificationService.ts
│       ├── analyticsService.ts
│       ├── s3UploadService.ts      # Multipart S3 upload
│       └── index.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── postcss.config.js
├── package.json
├── .env
├── .env.development
├── .env.production
└── eslint.config.js
```

---

## Section 2 — Routing Table

### 2.1 Route Names Enum (Type-Safe Navigation)

```ts
// src/router/routeNames.ts
export enum RouteName {
  // Public
  Home = 'Home',
  Login = 'Login',
  Register = 'Register',
  RegisterCompany = 'RegisterCompany',
  About = 'About',
  HowItWorks = 'HowItWorks',
  Privacy = 'Privacy',
  Terms = 'Terms',
  ForgotPassword = 'ForgotPassword',

  // Customer
  CustomerDashboard = 'CustomerDashboard',
  CustomerProfile = 'CustomerProfile',
  CustomerSettings = 'CustomerSettings',
  CustomerMoves = 'CustomerMoves',
  CustomerOffers = 'CustomerOffers',
  MoveNew = 'MoveNew',
  MoveVideo = 'MoveVideo',
  MoveInventory = 'MoveInventory',
  MoveDetails = 'MoveDetails',
  MoveCompanies = 'MoveCompanies',
  MoveOffers = 'MoveOffers',

  // Company
  CompanyDashboard = 'CompanyDashboard',
  CompanyProfile = 'CompanyProfile',
  CompanyPricing = 'CompanyPricing',
  CompanyAvailability = 'CompanyAvailability',
  CompanyTeams = 'CompanyTeams',
  CompanyRequests = 'CompanyRequests',
  CompanyRequestDetail = 'CompanyRequestDetail',
  CompanyOffers = 'CompanyOffers',
  CompanyOfferEdit = 'CompanyOfferEdit',
  CompanyDocuments = 'CompanyDocuments',
  CompanySettings = 'CompanySettings',
  CompanyAnalytics = 'CompanyAnalytics',

  // Admin
  AdminDashboard = 'AdminDashboard',
  AdminCompanies = 'AdminCompanies',
  AdminCompanyDetail = 'AdminCompanyDetail',
  AdminRequests = 'AdminRequests',
  AdminUsers = 'AdminUsers',
  AdminCommissions = 'AdminCommissions',
  AdminReviews = 'AdminReviews',
  AdminLogs = 'AdminLogs',
  AdminSettings = 'AdminSettings',

  // Fallback
  NotFound = 'NotFound',
}
```

### 2.2 Full Route Definitions

```ts
// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router'
import { RouteName } from './routeNames'
import { UserRole } from '@/utils/enums'

const routes: RouteRecordRaw[] = [
  // ═══════════════════════════════════════
  // PUBLIC ROUTES
  // ═══════════════════════════════════════
  {
    path: '/',
    name: RouteName.Home,
    component: () => import('@/views/public/HomeView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout' },
  },
  {
    path: '/login',
    name: RouteName.Login,
    component: () => import('@/views/public/LoginView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout', guestOnly: true },
  },
  {
    path: '/register',
    name: RouteName.Register,
    component: () => import('@/views/public/RegisterView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout', guestOnly: true },
  },
  {
    path: '/register-company',
    name: RouteName.RegisterCompany,
    component: () => import('@/views/public/RegisterCompanyView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout', guestOnly: true },
  },
  {
    path: '/about',
    name: RouteName.About,
    component: () => import('@/views/public/AboutView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout' },
  },
  {
    path: '/how-it-works',
    name: RouteName.HowItWorks,
    component: () => import('@/views/public/HowItWorksView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout' },
  },
  {
    path: '/privacy',
    name: RouteName.Privacy,
    component: () => import('@/views/public/PrivacyView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout' },
  },
  {
    path: '/terms',
    name: RouteName.Terms,
    component: () => import('@/views/public/TermsView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout' },
  },
  {
    path: '/forgot-password',
    name: RouteName.ForgotPassword,
    component: () => import('@/views/public/ForgotPasswordView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout', guestOnly: true },
  },

  // ═══════════════════════════════════════
  // CUSTOMER ROUTES (END_CUSTOMER)
  // ═══════════════════════════════════════
  {
    path: '/dashboard',
    name: RouteName.CustomerDashboard,
    component: () => import('@/views/customer/CustomerDashboardView.vue'),
    meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, layout: 'CustomerLayout' },
  },
  {
    path: '/moves',
    name: RouteName.CustomerMoves,
    component: () => import('@/views/customer/CustomerMovesView.vue'),
    meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, layout: 'CustomerLayout' },
  },
  {
    path: '/offers',
    name: RouteName.CustomerOffers,
    component: () => import('@/views/customer/CustomerOffersView.vue'),
    meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, layout: 'CustomerLayout' },
  },
  {
    path: '/profile',
    name: RouteName.CustomerProfile,
    component: () => import('@/views/customer/CustomerProfileView.vue'),
    meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, layout: 'CustomerLayout' },
  },
  {
    path: '/settings',
    name: RouteName.CustomerSettings,
    component: () => import('@/views/customer/CustomerSettingsView.vue'),
    meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, layout: 'CustomerLayout' },
  },

  // ── Move request wizard (nested) ──
  {
    path: '/move',
    component: () => import('@/layouts/CustomerLayout.vue'),
    meta: { requiresAuth: true, role: UserRole.END_CUSTOMER },
    children: [
      {
        path: 'new',
        name: RouteName.MoveNew,
        component: () => import('@/views/customer/move/MoveNewView.vue'),
        meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, wizardStep: 0 },
      },
      {
        path: ':id/video',
        name: RouteName.MoveVideo,
        component: () => import('@/views/customer/move/MoveVideoView.vue'),
        meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, wizardStep: 1 },
        beforeEnter: (to) => {
          // Guard: move request must exist in draft or be loaded
          return validateMoveRequestExists(to.params.id as string)
        },
      },
      {
        path: ':id/inventory',
        name: RouteName.MoveInventory,
        component: () => import('@/views/customer/move/MoveInventoryView.vue'),
        meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, wizardStep: 2 },
        beforeEnter: (to) => validateMoveRequestExists(to.params.id as string),
      },
      {
        path: ':id/details',
        name: RouteName.MoveDetails,
        component: () => import('@/views/customer/move/MoveDetailsView.vue'),
        meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, wizardStep: 3 },
        beforeEnter: (to) => validateMoveRequestExists(to.params.id as string),
      },
      {
        path: ':id/companies',
        name: RouteName.MoveCompanies,
        component: () => import('@/views/customer/move/MoveCompaniesView.vue'),
        meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, wizardStep: 4 },
        beforeEnter: (to) => validateMoveRequestExists(to.params.id as string),
      },
      {
        path: ':id/offers',
        name: RouteName.MoveOffers,
        component: () => import('@/views/customer/move/MoveOffersView.vue'),
        meta: { requiresAuth: true, role: UserRole.END_CUSTOMER, wizardStep: 5 },
        beforeEnter: (to) => validateMoveRequestExists(to.params.id as string),
      },
    ],
  },

  // ═══════════════════════════════════════
  // COMPANY ROUTES (COMPANY)
  // ═══════════════════════════════════════
  {
    path: '/company',
    component: () => import('@/layouts/CompanyLayout.vue'),
    meta: { requiresAuth: true, role: UserRole.COMPANY },
    children: [
      {
        path: 'dashboard',
        name: RouteName.CompanyDashboard,
        component: () => import('@/views/company/CompanyDashboardView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
      {
        path: 'profile',
        name: RouteName.CompanyProfile,
        component: () => import('@/views/company/CompanyProfileView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
      {
        path: 'pricing',
        name: RouteName.CompanyPricing,
        component: () => import('@/views/company/CompanyPricingView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
      {
        path: 'availability',
        name: RouteName.CompanyAvailability,
        component: () => import('@/views/company/CompanyAvailabilityView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
      {
        path: 'teams',
        name: RouteName.CompanyTeams,
        component: () => import('@/views/company/CompanyTeamsView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
      {
        path: 'requests',
        name: RouteName.CompanyRequests,
        component: () => import('@/views/company/CompanyRequestsView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
      {
        path: 'requests/:id',
        name: RouteName.CompanyRequestDetail,
        component: () => import('@/views/company/CompanyRequestDetailView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
        props: true,
      },
      {
        path: 'offers',
        name: RouteName.CompanyOffers,
        component: () => import('@/views/company/CompanyOffersView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
      {
        path: 'offers/:id/edit',
        name: RouteName.CompanyOfferEdit,
        component: () => import('@/views/company/CompanyOfferEditView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
        props: true,
      },
      {
        path: 'documents',
        name: RouteName.CompanyDocuments,
        component: () => import('@/views/company/CompanyDocumentsView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
      {
        path: 'settings',
        name: RouteName.CompanySettings,
        component: () => import('@/views/company/CompanySettingsView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
      {
        path: 'analytics',
        name: RouteName.CompanyAnalytics,
        component: () => import('@/views/company/CompanyAnalyticsView.vue'),
        meta: { requiresAuth: true, role: UserRole.COMPANY },
      },
    ],
  },

  // ═══════════════════════════════════════
  // ADMIN ROUTES (ADMIN)
  // ═══════════════════════════════════════
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: UserRole.ADMIN },
    children: [
      {
        path: 'dashboard',
        name: RouteName.AdminDashboard,
        component: () => import('@/views/admin/AdminDashboardView.vue'),
        meta: { requiresAuth: true, role: UserRole.ADMIN },
      },
      {
        path: 'companies',
        name: RouteName.AdminCompanies,
        component: () => import('@/views/admin/AdminCompaniesView.vue'),
        meta: { requiresAuth: true, role: UserRole.ADMIN },
      },
      {
        path: 'companies/:id',
        name: RouteName.AdminCompanyDetail,
        component: () => import('@/views/admin/AdminCompanyDetailView.vue'),
        meta: { requiresAuth: true, role: UserRole.ADMIN },
        props: true,
      },
      {
        path: 'requests',
        name: RouteName.AdminRequests,
        component: () => import('@/views/admin/AdminRequestsView.vue'),
        meta: { requiresAuth: true, role: UserRole.ADMIN },
      },
      {
        path: 'users',
        name: RouteName.AdminUsers,
        component: () => import('@/views/admin/AdminUsersView.vue'),
        meta: { requiresAuth: true, role: UserRole.ADMIN },
      },
      {
        path: 'commissions',
        name: RouteName.AdminCommissions,
        component: () => import('@/views/admin/AdminCommissionsView.vue'),
        meta: { requiresAuth: true, role: UserRole.ADMIN },
      },
      {
        path: 'reviews',
        name: RouteName.AdminReviews,
        component: () => import('@/views/admin/AdminReviewsView.vue'),
        meta: { requiresAuth: true, role: UserRole.ADMIN },
      },
      {
        path: 'logs',
        name: RouteName.AdminLogs,
        component: () => import('@/views/admin/AdminLogsView.vue'),
        meta: { requiresAuth: true, role: UserRole.ADMIN },
      },
      {
        path: 'settings',
        name: RouteName.AdminSettings,
        component: () => import('@/views/admin/AdminSettingsView.vue'),
        meta: { requiresAuth: true, role: UserRole.ADMIN },
      },
    ],
  },

  // ═══════════════════════════════════════
  // FALLBACK
  // ═══════════════════════════════════════
  {
    path: '/:pathMatch(.*)*',
    name: RouteName.NotFound,
    component: () => import('@/views/public/NotFoundView.vue'),
    meta: { requiresAuth: false, role: null, layout: 'DefaultLayout' },
  },
]

export default routes
```

### 2.3 Route Guards

```ts
// src/router/guards.ts
import type { NavigationGuard, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { RouteName } from './routeNames'

export const authGuard: NavigationGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth as boolean
  const requiredRole = to.meta.role as string | null
  const guestOnly = to.meta.guestOnly as boolean

  // Attempt silent rehydration if not loaded
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  // Guest-only routes (login, register) — redirect logged-in users
  if (guestOnly && authStore.isAuthenticated) {
    return next({ name: redirectForRole(authStore.userRole) })
  }

  // Public route — allow
  if (!requiresAuth) return next()

  // Auth required but not authenticated
  if (!authStore.isAuthenticated) {
    return next({ name: RouteName.Login, query: { redirect: to.fullPath } })
  }

  // Role check
  if (requiredRole && authStore.userRole !== requiredRole) {
    return next({ name: redirectForRole(authStore.userRole) })
  }

  // Company approval check (if applicable)
  if (
    authStore.userRole === 'COMPANY' &&
    to.path.startsWith('/company') &&
    !authStore.isCompanyApproved
  ) {
    // Redirect to documents page if not approved
    if (to.name !== RouteName.CompanyDocuments) {
      return next({ name: RouteName.CompanyDocuments })
    }
  }

  next()
}

function redirectForRole(role: string | null): RouteName {
  switch (role) {
    case 'END_CUSTOMER': return RouteName.CustomerDashboard
    case 'COMPANY': return RouteName.CompanyDashboard
    case 'ADMIN': return RouteName.AdminDashboard
    default: return RouteName.Home
  }
}

// Wizard step guard helper
export async function validateMoveRequestExists(moveId: string): Promise<boolean> {
  const { useMoveRequest } = await import('@/composables/useMoveRequest')
  const { loadMoveRequest } = useMoveRequest()
  const exists = await loadMoveRequest(moveId)
  return exists !== null
}
```

### 2.4 Router Factory

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { authGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach(authGuard)

export default router
```

---

## Section 3 — Component Hierarchy

### 3.1 Design Philosophy
- **Container/Smart** → Connect to Pinia, handle async logic, pass data down
- **Presentational/Dumb** → Pure props + events, reusable, testable
- **Base/Atomic** → No domain knowledge, style-only primitives

---

### 3.2 Video Upload Flow

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `MoveVideoView.vue` | Smart | Loads move request, manages video state |
| Smart | `VideoUploader.vue` | Smart | Orchestrates recorder + preview + upload + progress |
| Dumb | `VideoRecorder.vue` | Dumb | `MediaRecorder` wrapper, props: `maxDuration`, `resolution` |
| Dumb | `VideoPreview.vue` | Dumb | Plays recorded video, props: `src`, `controls` |
| Dumb | `VideoProgressBar.vue` | Dumb | Upload progress UI, props: `progress` (0-100), `status` |
| Base | `BaseFileUpload.vue` | Base | Drag-and-drop zone, generic file input |
| Base | `BaseVideoPlayer.vue` | Base | Generic HTML5 video wrapper |

```vue
<!-- VideoUploader.vue (Smart) -->
<script setup lang="ts">
import { ref } from 'vue'
import { useVideoUpload } from '@/composables/useVideoUpload'
import { useNotificationStore } from '@/stores/notificationStore'
import VideoRecorder from './VideoRecorder.vue'
import VideoPreview from './VideoPreview.vue'
import VideoProgressBar from './VideoProgressBar.vue'
import BaseButton from '@/components/_base/BaseButton.vue'

const props = defineProps<{ moveRequestId: string }>()
const emit = defineEmits<{
  uploaded: [videoUrl: string]
  cancelled: []
}>()

const { uploadVideo, progress, status, error } = useVideoUpload()
const notifications = useNotificationStore()
const recordedBlob = ref<Blob | null>(null)

const handleRecord = (blob: Blob) => { recordedBlob.value = blob }

const handleUpload = async () => {
  if (!recordedBlob.value) return
  try {
    const url = await uploadVideo(recordedBlob.value, props.moveRequestId)
    notifications.success(t('video.uploadSuccess'))
    emit('uploaded', url)
  } catch {
    notifications.error(t('video.uploadError'))
  }
}
</script>
```

---

### 3.3 Inventory Editor (AI + Manual)

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `MoveInventoryView.vue` | Smart | Holds draft state, persisting to store |
| Smart | `InventoryEditor.vue` | Smart | Master component: lists + forms + AI panel |
| Dumb | `AiDetectedItems.vue` | Dumb | Displays AI results, emits `add`, `remove` per item |
| Dumb | `AiConfidenceBadge.vue` | Dumb | Color-coded confidence chip |
| Dumb | `InventoryItemRow.vue` | Dumb | Editable row: name, qty, volume, weight, actions |
| Dumb | `InventoryItemForm.vue` | Dumb | Add/edit single item form |
| Dumb | `InventorySummary.vue` | Dumb | Totals bar: item count, total volume, total weight |
| Dumb | `VolumeEstimator.vue` | Dumb | Visual volume indicator |
| Base | `BaseTable.vue`, `BaseInput.vue`, `BaseBadge.vue` | Base | Used by rows/forms |

```vue
<!-- InventoryEditor.vue (Smart) -->
<script setup lang="ts">
import { useInventoryStore } from '@/stores/inventoryStore'
import { useI18n } from 'vue-i18n'
import AiDetectedItems from './AiDetectedItems.vue'
import InventoryItemRow from './InventoryItemRow.vue'
import InventoryItemForm from './InventoryItemForm.vue'
import InventorySummary from './InventorySummary.vue'

const { t } = useI18n()
const inventoryStore = useInventoryStore()

const handleAiAdd = (item: InventoryItem) => inventoryStore.addItem(item)
const handleAiDismiss = (index: number) => inventoryStore.dismissAiItem(index)
const handleManualAdd = (item: InventoryItem) => inventoryStore.addItem(item)
const handleUpdate = (id: string, patch: Partial<InventoryItem>) => inventoryStore.updateItem(id, patch)
const handleRemove = (id: string) => inventoryStore.removeItem(id)
</script>
```

---

### 3.4 Move Details Form

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `MoveDetailsView.vue` | Smart | Loads draft, validates, saves on continue |
| Smart | `MoveDetailsForm.vue` | Smart | Aggregates all sub-forms, computes completion |
| Dumb | `MoveAddressInput.vue` | Dumb | Origin/destination with autocomplete |
| Dumb | `MoveDatePicker.vue` | Dumb | Preferred move date |
| Dumb | `MovePropertyTypeSelect.vue` | Dumb | House / apartment / office |
| Dumb | `MoveFloorInfo.vue` | Dumb | Floor number input |
| Dumb | `MoveElevatorInfo.vue` | Dumb | Yes/no + size |
| Dumb | `MoveParkingInfo.vue` | Dumb | Parking spot availability |
| Dumb | `MoveDistanceInfo.vue` | Dumb | Distance from door to truck |
| Dumb | `MoveExtrasSelector.vue` | Dumb | Checkboxes: boxes, assembly, packing |
| Dumb | `MoveSummary.vue` | Dumb | Collapsible summary of all details |

```vue
<!-- MoveDetailsForm.vue (Smart) -->
<script setup lang="ts">
import { computed } from 'vue'
import { useMoveRequestStore } from '@/stores/moveRequestStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const moveStore = useMoveRequestStore()

const isComplete = computed(() => moveStore.details.isValid)
const handleSubmit = () => moveStore.saveDetails()
</script>
```

---

### 3.5 Company Comparison / List

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `MoveCompaniesView.vue` | Smart | Fetches available companies by area/date |
| Smart | `CompanyList.vue` | Smart | Filters, sorts, pagination |
| Dumb | `CompanyCard.vue` | Dumb | Single company: logo, rating, price estimate, CTA |
| Dumb | `CompanyComparison.vue` | Dumb | Side-by-side table of selected companies |
| Dumb | `CompanyServiceAreaMap.vue` | Dumb | Map showing service coverage |
| Dumb | `CompanyVerificationBadge.vue` | Dumb | Verified / pending badge |

---

### 3.6 Offer Card

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `MoveOffersView.vue` | Smart | Loads offers for move request |
| Smart | `OfferList.vue` | Smart | Grouping by status |
| Dumb | `OfferCard.vue` | Dumb | Props: `offer`, emits `accept`, `reject`, `negotiate` |
| Dumb | `OfferStatusBadge.vue` | Dumb | Draft / sent / accepted / rejected / expired |
| Dumb | `OfferComparison.vue` | Dumb | Compare 2+ offers feature-by-feature |
| Dumb | `OfferAcceptButton.vue` | Dumb | Confirm modal trigger |
| Dumb | `OfferRejectButton.vue` | Dumb | Decline with optional feedback |

```vue
<!-- OfferCard.vue (Presentational) -->
<script setup lang="ts">
import type { Offer } from '@/types'
import { useI18n } from 'vue-i18n'
import OfferStatusBadge from './OfferStatusBadge.vue'
import BaseCard from '@/components/_base/BaseCard.vue'
import BaseButton from '@/components/_base/BaseButton.vue'

const { t, n } = useI18n()
const props = defineProps<{ offer: Offer }>()
const emit = defineEmits<{ accept: [id: string]; reject: [id: string] }>()
</script>

<template>
  <BaseCard class="p-6 hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img :src="offer.companyLogo" class="w-12 h-12 rounded-full object-cover" />
        <div>
          <h3 class="font-semibold text-gray-900">{{ offer.companyName }}</h3>
          <OfferStatusBadge :status="offer.status" />
        </div>
      </div>
      <div class="text-right">
        <p class="text-2xl font-bold text-primary-600">{{ n(offer.totalPrice, 'currency') }}</p>
        <p class="text-sm text-gray-500">{{ t('offer.includesVat') }}</p>
      </div>
    </div>
    <!-- ... services breakdown ... -->
    <div class="mt-4 flex gap-2">
      <BaseButton variant="primary" @click="emit('accept', offer.id)">
        {{ t('offer.accept') }}
      </BaseButton>
      <BaseButton variant="ghost" @click="emit('reject', offer.id)">
        {{ t('offer.reject') }}
      </BaseButton>
    </div>
  </BaseCard>
</template>
```

---

### 3.7 Availability Calendar (Company)

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `CompanyAvailabilityView.vue` | Smart | Loads calendar for all teams |
| Smart | `AvailabilityCalendar.vue` | Smart | Month grid, fetches slots, handles mutations |
| Dumb | `AvailabilityDayCell.vue` | Dumb | Single day: capacity bar, booked count |
| Dumb | `AvailabilitySlotEditor.vue` | Dumb | Modal: edit AM/PM slots |
| Dumb | `TeamCapacityEditor.vue` | Dumb | Max jobs per team per day |
| Dumb | `ParallelJobsEditor.vue` | Dumb | Toggle parallel vs sequential |
| Base | `BaseDatePicker.vue` | Base | Calendar primitive |

---

### 3.8 Request Inbox Item

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `CompanyRequestsView.vue` | Smart | Fetches inbox, handles filters |
| Smart | `RequestInboxList.vue` | Smart | Virtual scroll list, polling for updates |
| Dumb | `RequestInboxItem.vue` | Dumb | Props: `request`, emits `view`, `quickOffer` |
| Dumb | `RequestStatusBadge.vue` | Dumb | New / viewed / offered / expired |
| Dumb | `RequestFilterBar.vue` | Dumb | Date range, status, area filters |

```vue
<!-- RequestInboxItem.vue (Presentational) -->
<script setup lang="ts">
import type { MoveRequestSummary } from '@/types'
import RequestStatusBadge from './RequestStatusBadge.vue'
import BaseCard from '@/components/_base/BaseCard.vue'

const props = defineProps<{ request: MoveRequestSummary }>()
const emit = defineEmits<{ view: [id: string]; quickOffer: [id: string] }>()

const { t, d } = useI18n()
</script>

<template>
  <BaseCard class="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50">
    <RequestStatusBadge :status="request.status" />
    <div class="flex-1">
      <p class="font-medium">{{ request.customerName }} — {{ request.moveType }}</p>
      <p class="text-sm text-gray-500">{{ d(request.moveDate, 'short') }} · {{ request.distanceKm }}km</p>
    </div>
    <div class="text-right">
      <p class="text-lg font-semibold">{{ request.itemCount }} {{ t('inventory.items') }}</p>
      <p class="text-sm text-gray-500">~{{ request.estimatedVolume }}m³</p>
    </div>
  </BaseCard>
</template>
```

---

### 3.9 Admin Approval Queue Item

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `AdminDashboardView.vue` | Smart | Loads queue metrics |
| Smart | `AdminCompanyApprovalQueue.vue` | Smart | List of pending companies |
| Dumb | `AdminCompanyApprovalCard.vue` | Dumb | Props: `company`, emits `approve`, `reject`, `requestDocs` |
| Dumb | `AdminDocumentViewer.vue` | Dumb | Inline PDF/image preview |

---

### 3.10 Rating Form

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `CustomerMovesView.vue` | Smart | Triggers review modal after completed move |
| Smart | `ReviewForm.vue` | Smart | Validates and submits review |
| Dumb | `ReviewStars.vue` | Dumb | Props: `modelValue`, emits `update:modelValue`, hover preview |
| Dumb | `ReviewCard.vue` | Dumb | Display submitted review |
| Dumb | `ReviewList.vue` | Dumb | Company profile page review list |

```vue
<!-- ReviewForm.vue (Smart) -->
<script setup lang="ts">
import { ref } from 'vue'
import { useReviewStore } from '@/stores/reviewStore'
import ReviewStars from './ReviewStars.vue'
import BaseTextarea from '@/components/_base/BaseTextarea.vue'
import BaseButton from '@/components/_base/BaseButton.vue'

const props = defineProps<{ moveRequestId: string; companyId: string }>()
const emit = defineEmits<{ submitted: []; cancelled: [] }>()

const reviewStore = useReviewStore()
const rating = ref(0)
const comment = ref('')

const handleSubmit = async () => {
  await reviewStore.submitReview({
    moveRequestId: props.moveRequestId,
    companyId: props.companyId,
    rating: rating.value,
    comment: comment.value,
  })
  emit('submitted')
}
</script>

<template>
  <div class="space-y-4">
    <p class="font-medium">{{ t('review.rateExperience') }}</p>
    <ReviewStars v-model="rating" />
    <BaseTextarea v-model="comment" :placeholder="t('review.commentPlaceholder')" />
    <div class="flex gap-2">
      <BaseButton variant="primary" :disabled="rating === 0" @click="handleSubmit">
        {{ t('review.submit') }}
      </BaseButton>
      <BaseButton variant="ghost" @click="emit('cancelled')">
        {{ t('common.cancel') }}
      </BaseButton>
    </div>
  </div>
</template>
```

---

### 3.11 Pricing Parameter Editor

| Layer | Component | Type | Description |
|-------|-----------|------|-------------|
| Container | `CompanyPricingView.vue` | Smart | Loads current pricing, saves changes |
| Smart | `PricingParameterEditor.vue` | Smart | Master form with all sub-editors |
| Dumb | `PricingRuleCard.vue` | Dumb | Individual rule display |
| Dumb | `BaseFeeEditor.vue` | Dumb | Base fee input with currency |
| Dumb | `ServiceAddonEditor.vue` | Dumb | Add/remove/edit service add-ons |
| Dumb | `PricingEstimateCard.vue` | Dumb | Live preview of pricing estimate |
| Dumb | `PricingBreakdown.vue` | Dumb | Visual breakdown of cost factors |

```vue
<!-- PricingParameterEditor.vue (Smart) -->
<script setup lang="ts">
import { useCompanyStore } from '@/stores/companyStore'
import { useI18n } from 'vue-i18n'
import BaseFeeEditor from './BaseFeeEditor.vue'
import ServiceAddonEditor from './ServiceAddonEditor.vue'
import PricingEstimateCard from './PricingEstimateCard.vue'

const { t } = useI18n()
const companyStore = useCompanyStore()

const handleSave = async () => {
  await companyStore.savePricingRules()
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">
      <BaseFeeEditor v-model="companyStore.pricing.baseFee" />
      <ServiceAddonEditor v-model="companyStore.pricing.serviceAddons" />
    </div>
    <div class="lg:col-span-1">
      <PricingEstimateCard :pricing="companyStore.pricing" />
    </div>
  </div>
</template>
```

---

### 3.12 Full Component Assignment Summary

| Domain | Container (View) | Smart | Dumb | Base Used |
|--------|-----------------|-------|------|-----------|
| **Auth** | `LoginView`, `RegisterView`, `RegisterCompanyView` | `AuthLoginForm`, `AuthRegisterForm`, `AuthCompanyRegisterForm` | — | `BaseInput`, `BaseButton`, `BaseModal` |
| **Video** | `MoveVideoView` | `VideoUploader` | `VideoRecorder`, `VideoPreview`, `VideoProgressBar` | `BaseFileUpload`, `BaseVideoPlayer`, `BaseButton` |
| **Inventory** | `MoveInventoryView` | `InventoryEditor` | `AiDetectedItems`, `AiConfidenceBadge`, `InventoryItemRow`, `InventoryItemForm`, `InventorySummary`, `VolumeEstimator` | `BaseTable`, `BaseInput`, `BaseBadge`, `BaseButton` |
| **Move Details** | `MoveDetailsView` | `MoveDetailsForm` | `MoveAddressInput`, `MoveDatePicker`, `MovePropertyTypeSelect`, `MoveFloorInfo`, `MoveElevatorInfo`, `MoveParkingInfo`, `MoveDistanceInfo`, `MoveExtrasSelector`, `MoveSummary` | `BaseInput`, `BaseSelect`, `BaseDatePicker`, `BaseToggle` |
| **Companies** | `MoveCompaniesView` | `CompanyList` | `CompanyCard`, `CompanyComparison`, `CompanyServiceAreaMap`, `CompanyVerificationBadge` | `BaseCard`, `BaseBadge`, `BaseButton` |
| **Offers** | `MoveOffersView`, `CompanyOfferEditView` | `OfferList`, `OfferEditor` | `OfferCard`, `OfferStatusBadge`, `OfferComparison`, `OfferAcceptButton`, `OfferRejectButton` | `BaseCard`, `BaseButton`, `BaseBadge`, `BaseModal` |
| **Requests (Company)** | `CompanyRequestsView`, `CompanyRequestDetailView` | `RequestInboxList`, `RequestDetail` | `RequestInboxItem`, `RequestStatusBadge`, `RequestFilterBar` | `BaseTable`, `BaseBadge`, `BaseCard` |
| **Availability** | `CompanyAvailabilityView` | `AvailabilityCalendar` | `AvailabilityDayCell`, `AvailabilitySlotEditor`, `TeamCapacityEditor`, `ParallelJobsEditor` | `BaseDatePicker`, `BaseModal`, `BaseToggle` |
| **Pricing** | `CompanyPricingView` | `PricingParameterEditor` | `PricingRuleCard`, `PricingEstimateCard`, `PricingBreakdown`, `BaseFeeEditor`, `ServiceAddonEditor` | `BaseInput`, `BaseCurrencyInput`, `BaseCard` |
| **Reviews** | `CustomerMovesView` | `ReviewForm` | `ReviewStars`, `ReviewCard`, `ReviewList` | `BaseCard`, `BaseTextarea`, `BaseButton` |
| **Admin** | `AdminDashboardView`, `AdminCompaniesView` | `AdminCompanyApprovalQueue`, `AdminCompanyDetail`, `AdminCompanyList` | `AdminCompanyApprovalCard`, `AdminDocumentViewer`, `AdminCommissionEditor`, `AdminReviewMonitor`, `AdminPlatformMetrics`, `AdminUserList`, `AdminActivityLog` | `BaseTable`, `BaseModal`, `BaseBadge`, `BaseButton` |
| **Dashboard** | `CustomerDashboardView`, `CompanyDashboardView`, `AdminDashboardView` | — | `StatCard`, `ChartWidget`, `RecentActivity`, `QuickActionPanel` | `BaseCard`, `BaseSkeleton` |
| **Layout** | `DefaultLayout`, `CustomerLayout`, `CompanyLayout`, `AdminLayout` | `TheNavbar`, `TheSidebar` | `TheFooter`, `TheBreadcrumbs`, `TheLanguageSwitcher`, `TheNotificationBell`, `TheRoleSwitcher` | `BaseButton`, `BaseTooltip` |

---

## Section 4 — State Management (Pinia)

### 4.1 Store Architecture Rules
- One store per domain (aligned with backend bounded contexts)
- Container components read stores; presentational components receive props
- All async actions return `Promise<void>` and use `try/catch` with notification dispatch
- State is **strictly typed** with interfaces from `src/types/`

---

### 4.2 `useAuthStore`

```ts
// src/stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '@/types'
import { apiAuth } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ── Getters ──
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed<UserRole | null>(() => user.value?.role ?? null)
  const isCompanyApproved = computed(() =>
    user.value?.role === 'COMPANY' ? user.value.company?.isApproved : false
  )

  // ── Actions ──
  async function login(email: string, password: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { user: u, accessToken } = await apiAuth.login(email, password)
      user.value = u
      token.value = accessToken
      localStorage.setItem('token', accessToken)
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function registerCustomer(data: RegisterCustomerPayload): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { user: u, accessToken } = await apiAuth.registerCustomer(data)
      user.value = u
      token.value = accessToken
      localStorage.setItem('token', accessToken)
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function registerCompany(data: RegisterCompanyPayload): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { user: u, accessToken } = await apiAuth.registerCompany(data)
      user.value = u
      token.value = accessToken
      localStorage.setItem('token', accessToken)
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function initialize(): Promise<void> {
    if (isInitialized.value) return
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      isInitialized.value = true
      return
    }
    try {
      token.value = storedToken
      const me = await apiAuth.me()
      user.value = me
    } catch {
      logout()
    } finally {
      isInitialized.value = true
    }
  }

  function logout(): void {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    // Reset other stores via $reset or event bus if needed
  }

  return {
    user, token, isInitialized, isLoading, error,
    isAuthenticated, userRole, isCompanyApproved,
    login, registerCustomer, registerCompany, initialize, logout,
  }
})
```

**Consumed by:** `LoginView`, `RegisterView`, `RegisterCompanyView`, `TheNavbar`, `TheRoleSwitcher`, all route guards.

---

### 4.3 `useUserStore`

```ts
// src/stores/userStore.ts
export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const settings = ref<UserSettings>({ language: 'de', currency: 'EUR', notifications: true })
  const isLoading = ref(false)

  const fullName = computed(() => profile.value ? `${profile.value.firstName} ${profile.value.lastName}` : '')

  async function loadProfile(): Promise<void> {
    profile.value = await apiUsers.getProfile()
  }

  async function updateProfile(payload: Partial<UserProfile>): Promise<void> {
    profile.value = await apiUsers.updateProfile(payload)
  }

  async function updateSettings(payload: Partial<UserSettings>): Promise<void> {
    settings.value = { ...settings.value, ...payload }
    await apiUsers.updateSettings(settings.value)
  }

  async function uploadAvatar(file: File): Promise<void> {
    const url = await apiUploads.getPresignedUrl('avatar', file.name)
    await apiUploads.uploadToS3(url, file)
    if (profile.value) profile.value.avatarUrl = url.split('?')[0]
  }

  return { profile, settings, isLoading, fullName, loadProfile, updateProfile, updateSettings, uploadAvatar }
})
```

**Consumed by:** `CustomerProfileView`, `CustomerSettingsView`, `CompanySettingsView`, `TheNavbar`.

---

### 4.4 `useMoveRequestStore`

```ts
// src/stores/moveRequestStore.ts
export const useMoveRequestStore = defineStore('moveRequest', () => {
  const currentRequest = ref<MoveRequest | null>(null)
  const allRequests = ref<MoveRequest[]>([])
  const draft = ref<Partial<MoveRequest>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeRequests = computed(() => allRequests.value.filter(r => r.status !== 'COMPLETED'))
  const completedRequests = computed(() => allRequests.value.filter(r => r.status === 'COMPLETED'))
  const currentStep = computed(() => currentRequest.value?.wizardStep ?? 0)

  async function createDraft(): Promise<string> {
    const req = await apiMoveRequests.create({ status: 'DRAFT' })
    currentRequest.value = req
    draft.value = req
    return req.id
  }

  async function loadMoveRequest(id: string): Promise<MoveRequest | null> {
    isLoading.value = true
    try {
      const req = await apiMoveRequests.getById(id)
      currentRequest.value = req
      return req
    } finally {
      isLoading.value = false
    }
  }

  async function loadAllRequests(): Promise<void> {
    allRequests.value = await apiMoveRequests.list()
  }

  async function saveDetails(): Promise<void> {
    if (!currentRequest.value) return
    currentRequest.value = await apiMoveRequests.update(currentRequest.value.id, {
      details: currentRequest.value.details,
    })
  }

  async function submitToCompanies(companyIds: string[]): Promise<void> {
    if (!currentRequest.value) return
    await apiMoveRequests.submit(currentRequest.value.id, { companyIds })
    await loadMoveRequest(currentRequest.value.id)
  }

  function resetDraft(): void {
    draft.value = {}
    currentRequest.value = null
  }

  return {
    currentRequest, allRequests, draft, isLoading, error,
    activeRequests, completedRequests, currentStep,
    createDraft, loadMoveRequest, loadAllRequests, saveDetails,
    submitToCompanies, resetDraft,
  }
})
```

**Consumed by:** `MoveVideoView`, `MoveInventoryView`, `MoveDetailsView`, `MoveCompaniesView`, `MoveOffersView`, `CustomerMovesView`, `CustomerDashboardView`.

---

### 4.5 `useInventoryStore`

```ts
// src/stores/inventoryStore.ts
export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([])
  const aiResults = ref<AiDetectedItem[] | null>(null)
  const aiConfidence = ref<number>(0)
  const isLoading = ref(false)

  const totalVolume = computed(() => items.value.reduce((sum, i) => sum + (i.volume * i.quantity), 0))
  const totalWeight = computed(() => items.value.reduce((sum, i) => sum + (i.weight * i.quantity), 0))
  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  function addItem(item: InventoryItem): void {
    items.value.push({ ...item, id: crypto.randomUUID() })
  }

  function removeItem(id: string): void {
    items.value = items.value.filter(i => i.id !== id)
  }

  function updateItem(id: string, patch: Partial<InventoryItem>): void {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = { ...items.value[idx], ...patch }
  }

  function setAiResults(results: AiDetectedItem[], confidence: number): void {
    aiResults.value = results
    aiConfidence.value = confidence
  }

  function dismissAiItem(index: number): void {
    if (aiResults.value) aiResults.value.splice(index, 1)
  }

  function acceptAiItem(item: AiDetectedItem): void {
    addItem({ ...item, id: crypto.randomUUID() })
  }

  async function saveInventory(moveRequestId: string): Promise<void> {
    await apiInventory.save(moveRequestId, items.value)
  }

  async function loadInventory(moveRequestId: string): Promise<void> {
    const data = await apiInventory.get(moveRequestId)
    items.value = data.items
    aiResults.value = data.aiResults
    aiConfidence.value = data.confidenceScore
  }

  return {
    items, aiResults, aiConfidence, isLoading,
    totalVolume, totalWeight, itemCount,
    addItem, removeItem, updateItem, setAiResults,
    dismissAiItem, acceptAiItem, saveInventory, loadInventory,
  }
})
```

**Consumed by:** `MoveInventoryView`, `InventoryEditor`, `AiDetectedItems`, `InventorySummary`, `RequestInboxItem` (to show item count), `VolumeEstimator`.

---

### 4.6 `useCompanyStore`

```ts
// src/stores/companyStore.ts
export const useCompanyStore = defineStore('company', () => {
  const company = ref<Company | null>(null)
  const pricing = ref<PricingRule>(defaultPricingRule())
  const teams = ref<Team[]>([])
  const serviceAddons = ref<ServiceAddon[]>([])
  const isLoading = ref(false)

  const isVerified = computed(() => company.value?.isVerified ?? false)
  const teamCount = computed(() => teams.value.length)

  async function loadCompany(id?: string): Promise<void> {
    const targetId = id ?? company.value?.id
    if (!targetId) return
    company.value = await apiCompanies.getById(targetId)
  }

  async function updateProfile(payload: Partial<Company>): Promise<void> {
    if (!company.value) return
    company.value = await apiCompanies.update(company.value.id, payload)
  }

  async function savePricingRules(): Promise<void> {
    if (!company.value) return
    pricing.value = await apiCompanies.updatePricing(company.value.id, pricing.value)
  }

  async function uploadDocument(type: DocumentType, file: File): Promise<void> {
    if (!company.value) return
    await apiCompanies.uploadDocument(company.value.id, type, file)
  }

  async function addTeam(team: Omit<Team, 'id'>): Promise<void> {
    const newTeam = await apiCompanies.createTeam(company.value!.id, team)
    teams.value.push(newTeam)
  }

  return {
    company, pricing, teams, serviceAddons, isLoading,
    isVerified, teamCount,
    loadCompany, updateProfile, savePricingRules, uploadDocument, addTeam,
  }
})
```

**Consumed by:** `CompanyProfileView`, `CompanyPricingView`, `CompanyTeamsView`, `CompanyDocumentsView`, `CompanyDashboardView`.

---

### 4.7 `useAvailabilityStore`

```ts
// src/stores/availabilityStore.ts
export const useAvailabilityStore = defineStore('availability', () => {
  const calendarMonth = ref<Date>(new Date())
  const slots = ref<AvailabilitySlot[]>([])
  const teams = ref<Team[]>([])
  const isLoading = ref(false)

  const slotsByDate = computed(() => {
    const map: Record<string, AvailabilitySlot[]> = {}
    slots.value.forEach(s => {
      const key = s.date
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    return map
  })

  async function loadSlots(year: number, month: number): Promise<void> {
    slots.value = await apiAvailability.getSlots(year, month)
  }

  async function updateSlot(slotId: string, patch: Partial<AvailabilitySlot>): Promise<void> {
    const updated = await apiAvailability.updateSlot(slotId, patch)
    const idx = slots.value.findIndex(s => s.id === slotId)
    if (idx !== -1) slots.value[idx] = updated
  }

  async function setTeamCapacity(teamId: string, date: string, maxJobs: number): Promise<void> {
    await apiAvailability.setCapacity(teamId, date, maxJobs)
    await loadSlots(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth())
  }

  return {
    calendarMonth, slots, teams, isLoading, slotsByDate,
    loadSlots, updateSlot, setTeamCapacity,
  }
})
```

**Consumed by:** `CompanyAvailabilityView`, `AvailabilityCalendar`, `AvailabilityDayCell`, `MoveCompaniesView` (to filter by availability).

---

### 4.8 `useOfferStore`

```ts
// src/stores/offerStore.ts
export const useOfferStore = defineStore('offer', () => {
  const offers = ref<Offer[]>([])
  const currentOffer = ref<Offer | null>(null)
  const isLoading = ref(false)

  const pendingOffers = computed(() => offers.value.filter(o => o.status === 'PENDING'))
  const acceptedOffers = computed(() => offers.value.filter(o => o.status === 'ACCEPTED'))

  async function loadOffersForMove(moveRequestId: string): Promise<void> {
    offers.value = await apiOffers.listForMove(moveRequestId)
  }

  async function loadOffersForCompany(companyId?: string): Promise<void> {
    const id = companyId ?? useAuthStore().user?.companyId
    if (!id) return
    offers.value = await apiOffers.listForCompany(id)
  }

  async function loadOffer(id: string): Promise<void> {
    currentOffer.value = await apiOffers.getById(id)
  }

  async function createDraft(moveRequestId: string, companyId: string): Promise<Offer> {
    const offer = await apiOffers.createDraft(moveRequestId, companyId)
    currentOffer.value = offer
    return offer
  }

  async function sendOffer(id: string, payload: OfferUpdatePayload): Promise<void> {
    currentOffer.value = await apiOffers.send(id, payload)
  }

  async function acceptOffer(id: string): Promise<void> {
    await apiOffers.accept(id)
    const idx = offers.value.findIndex(o => o.id === id)
    if (idx !== -1) offers.value[idx].status = 'ACCEPTED'
  }

  async function rejectOffer(id: string, reason?: string): Promise<void> {
    await apiOffers.reject(id, reason)
    const idx = offers.value.findIndex(o => o.id === id)
    if (idx !== -1) offers.value[idx].status = 'REJECTED'
  }

  return {
    offers, currentOffer, isLoading,
    pendingOffers, acceptedOffers,
    loadOffersForMove, loadOffersForCompany, loadOffer,
    createDraft, sendOffer, acceptOffer, rejectOffer,
  }
})
```

**Consumed by:** `MoveOffersView`, `CompanyOffersView`, `CompanyOfferEditView`, `OfferCard`, `OfferList`, `CustomerDashboardView`.

---

### 4.9 `useReviewStore`

```ts
// src/stores/reviewStore.ts
export const useReviewStore = defineStore('review', () => {
  const reviews = ref<Review[]>([])
  const myReview = ref<Review | null>(null)
  const isLoading = ref(false)

  const averageRating = computed(() => {
    if (!reviews.value.length) return 0
    return reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length
  })

  async function loadReviewsForCompany(companyId: string): Promise<void> {
    reviews.value = await apiReviews.listForCompany(companyId)
  }

  async function submitReview(payload: CreateReviewPayload): Promise<void> {
    myReview.value = await apiReviews.create(payload)
  }

  async function flagReview(id: string, reason: string): Promise<void> {
    await apiReviews.flag(id, reason)
  }

  return {
    reviews, myReview, isLoading, averageRating,
    loadReviewsForCompany, submitReview, flagReview,
  }
})
```

**Consumed by:** `ReviewForm`, `ReviewList`, `CompanyCard`, `AdminReviewMonitor`.

---

### 4.10 `useAdminStore`

```ts
// src/stores/adminStore.ts
export const useAdminStore = defineStore('admin', () => {
  const companies = ref<Company[]>([])
  const approvalQueue = ref<Company[]>([])
  const users = ref<User[]>([])
  const commissions = ref<Commission[]>([])
  const platformMetrics = ref<PlatformMetrics | null>(null)
  const activityLogs = ref<ActivityLog[]>([])
  const isLoading = ref(false)

  const pendingApprovalsCount = computed(() => approvalQueue.value.length)
  const suspendedCompanies = computed(() => companies.value.filter(c => c.isSuspended))

  async function loadCompanies(params?: CompanyFilterParams): Promise<void> {
    const result = await apiAdmin.listCompanies(params)
    companies.value = result.data
  }

  async function loadApprovalQueue(): Promise<void> {
    approvalQueue.value = await apiAdmin.getApprovalQueue()
  }

  async function approveCompany(id: string): Promise<void> {
    await apiAdmin.approveCompany(id)
    approvalQueue.value = approvalQueue.value.filter(c => c.id !== id)
  }

  async function rejectCompany(id: string, reason: string): Promise<void> {
    await apiAdmin.rejectCompany(id, reason)
    approvalQueue.value = approvalQueue.value.filter(c => c.id !== id)
  }

  async function suspendCompany(id: string, reason: string): Promise<void> {
    await apiAdmin.suspendCompany(id, reason)
    const c = companies.value.find(x => x.id === id)
    if (c) c.isSuspended = true
  }

  async function loadCommissions(): Promise<void> {
    commissions.value = await apiAdmin.listCommissions()
  }

  async function updateCommission(id: string, rate: number): Promise<void> {
    await apiAdmin.updateCommission(id, rate)
  }

  async function loadPlatformMetrics(): Promise<void> {
    platformMetrics.value = await apiAdmin.getMetrics()
  }

  async function loadActivityLogs(): Promise<void> {
    activityLogs.value = await apiAdmin.getLogs()
  }

  return {
    companies, approvalQueue, users, commissions, platformMetrics, activityLogs, isLoading,
    pendingApprovalsCount, suspendedCompanies,
    loadCompanies, loadApprovalQueue, approveCompany, rejectCompany, suspendCompany,
    loadCommissions, updateCommission, loadPlatformMetrics, loadActivityLogs,
  }
})
```

**Consumed by:** `AdminDashboardView`, `AdminCompaniesView`, `AdminCompanyDetailView`, `AdminCommissionsView`, `AdminReviewsView`, `AdminLogsView`.

---

### 4.11 `useNotificationStore`

```ts
// src/stores/notificationStore.ts
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration: number
}

export const useNotificationStore = defineStore('notification', () => {
  const toasts = ref<Toast[]>([])
  const unreadCount = ref(0)

  function addToast(type: Toast['type'], message: string, duration = 4000): void {
    const id = crypto.randomUUID()
    toasts.value.push({ id, type, message, duration })
    setTimeout(() => removeToast(id), duration)
  }

  function removeToast(id: string): void {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(message: string): void { addToast('success', message) }
  function error(message: string): void { addToast('error', message) }
  function warning(message: string): void { addToast('warning', message) }
  function info(message: string): void { addToast('info', message) }

  return { toasts, unreadCount, addToast, removeToast, success, error, warning, info }
})
```

**Consumed by:** `App.vue` (toast container), every smart component performing async actions.

---

## Section 5 — i18n Architecture

### 5.1 Directory Structure

```
src/i18n/
├── index.ts                    # Vue I18n instance creation
├── messages/
│   ├── en.json                 # English translations
│   ├── de.json                 # German translations
│   └── index.ts                # Import map for lazy loading
├── dateTimeFormats.ts          # per-locale date formats
├── numberFormats.ts            # per-locale currency/number formats
├── pluralRules.ts              # custom pluralization
└── locales.ts                  # locale metadata, lazy loader
```

### 5.2 i18n Instance Setup

```ts
// src/i18n/index.ts
import { createI18n } from 'vue-i18n'
import { dateTimeFormats } from './dateTimeFormats'
import { numberFormats } from './numberFormats'
import { pluralRules } from './pluralRules'

const savedLocale = localStorage.getItem('locale') ?? 'de'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {}, // loaded lazily
  dateTimeFormats,
  numberFormats,
  pluralRules,
  globalInjection: true,
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV,
})

export default i18n
```

### 5.3 Lazy Loading Strategy

```ts
// src/i18n/locales.ts
export interface LocaleInfo {
  code: string
  name: string
  flag: string
}

export const supportedLocales: LocaleInfo[] = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
]

export async function loadLocaleMessages(i18n: any, locale: string): Promise<void> {
  const messages = await import(`./messages/${locale}.json`)
  i18n.setLocaleMessage(locale, messages.default)
}
```

```ts
// main.ts — bootstrap with lazy load
import i18n from './i18n'
import { loadLocaleMessages } from './i18n/locales'

async function bootstrap() {
  await loadLocaleMessages(i18n, i18n.global.locale.value)
  app.use(i18n)
  app.mount('#app')
}
bootstrap()
```

### 5.4 Language Switcher Component

```vue
<!-- TheLanguageSwitcher.vue -->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { supportedLocales, loadLocaleMessages } from '@/i18n/locales'
import BaseSelect from '@/components/_base/BaseSelect.vue'

const { locale } = useI18n()

async function switchLanguage(code: string) {
  await loadLocaleMessages(locale, code)
  locale.value = code
  localStorage.setItem('locale', code)
  document.documentElement.setAttribute('lang', code)
}
</script>

<template>
  <BaseSelect
    :model-value="locale"
    :options="supportedLocales.map(l => ({ value: l.code, label: l.name }))"
    @update:model-value="switchLanguage"
    class="w-32"
  />
</template>
```

### 5.5 Date, Number & Currency Formatting

```ts
// src/i18n/dateTimeFormats.ts
export const dateTimeFormats = {
  de: {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  },
  en: {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' },
  },
}
```

```ts
// src/i18n/numberFormats.ts
export const numberFormats = {
  de: {
    currency: { style: 'currency', currency: 'EUR', currencyDisplay: 'symbol' },
    decimal: { style: 'decimal', minimumFractionDigits: 2 },
    percent: { style: 'percent', minimumFractionDigits: 0 },
  },
  en: {
    currency: { style: 'currency', currency: 'EUR', currencyDisplay: 'symbol' },
    decimal: { style: 'decimal', minimumFractionDigits: 2 },
    percent: { style: 'percent', minimumFractionDigits: 0 },
  },
}
```

### 5.6 Key Naming Convention

- **Flat keys** for simple labels: `common.save`, `common.cancel`
- **Domain-prefixed** for features: `moveRequest.title`, `pricing.baseFee`
- **Component-scoped** when tightly coupled: `video.uploadSuccess`, `review.rateExperience`
- **Never** use dynamic key concatenation; always use full keys for searchability

### 5.7 Translation Files (≥30 keys each)

```json
// src/i18n/messages/de.json
{
  "common": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "delete": "Löschen",
    "edit": "Bearbeiten",
    "create": "Erstellen",
    "submit": "Absenden",
    "loading": "Wird geladen...",
    "error": "Fehler",
    "success": "Erfolg",
    "next": "Weiter",
    "back": "Zurück",
    "search": "Suchen",
    "filter": "Filtern",
    "sort": "Sortieren"
  },
  "auth": {
    "loginTitle": "Anmelden",
    "registerTitle": "Registrieren",
    "registerCompanyTitle": "Als Umzugsfirma registrieren",
    "email": "E-Mail",
    "password": "Passwort",
    "forgotPassword": "Passwort vergessen?",
    "loginButton": "Anmelden",
    "registerButton": "Registrieren",
    "logout": "Abmelden",
    "loginError": "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Daten."
  },
  "moveRequest": {
    "title": "Umzug anfordern",
    "newMove": "Neuer Umzug",
    "myMoves": "Meine Umzüge",
    "originAddress": "Startadresse",
    "destinationAddress": "Zieladresse",
    "moveDate": "Umzugsdatum",
    "propertyType": "Immobilientyp",
    "floor": "Etage",
    "elevator": "Fahrstuhl vorhanden",
    "parking": "Parkplatz verfügbar",
    "distanceToTruck": "Entfernung zum LKW (m)",
    "extras": "Zusatzleistungen"
  },
  "inventory": {
    "title": "Inventar",
    "items": "Gegenstände",
    "addItem": "Gegenstand hinzufügen",
    "removeItem": "Gegenstand entfernen",
    "itemName": "Bezeichnung",
    "quantity": "Anzahl",
    "volume": "Volumen (m³)",
    "weight": "Gewicht (kg)",
    "totalVolume": "Gesamtvolumen",
    "totalWeight": "Gesamtgewicht",
    "aiDetected": "KI-erkannte Gegenstände",
    "aiConfidence": "KI-Konfidenz",
    "aiAddAll": "Alle hinzufügen"
  },
  "video": {
    "uploadTitle": "Video hochladen",
    "recordVideo": "Video aufnehmen",
    "uploadProgress": "Upload-Fortschritt",
    "uploadSuccess": "Video erfolgreich hochgeladen!",
    "uploadError": "Upload fehlgeschlagen. Bitte versuchen Sie es erneut.",
    "maxDuration": "Max. Dauer: 5 Minuten",
    "preview": "Vorschau"
  },
  "company": {
    "profile": "Firmenprofil",
    "serviceArea": "Einzugsgebiet",
    "verificationPending": "Verifizierung ausstehend",
    "verificationVerified": "Verifiziert",
    "rating": "Bewertung",
    "requestOffer": "Angebot anfordern"
  },
  "offer": {
    "title": "Angebote",
    "myOffers": "Meine Angebote",
    "accept": "Annehmen",
    "reject": "Ablehnen",
    "negotiate": "Verhandeln",
    "totalPrice": "Gesamtpreis",
    "includesVat": "inkl. MwSt.",
    "validUntil": "Gültig bis",
    "statusPending": "Ausstehend",
    "statusAccepted": "Angenommen",
    "statusRejected": "Abgelehnt",
    "statusExpired": "Abgelaufen"
  },
  "pricing": {
    "title": "Preisgestaltung",
    "baseFee": "Grundgebühr",
    "pricePerHour": "Stundensatz",
    "pricePerKm": "Preis pro km",
    "teamSize": "Teamgröße",
    "servicePrices": "Leistungspreise"
  },
  "availability": {
    "title": "Verfügbarkeit",
    "calendar": "Kalender",
    "slotMorning": "Vormittag",
    "slotAfternoon": "Nachmittag",
    "teamCapacity": "Teamkapazität",
    "parallelJobs": "Parallele Aufträge"
  },
  "request": {
    "inbox": "Anfragen-Posteingang",
    "newRequest": "Neue Anfrage",
    "viewDetails": "Details anzeigen",
    "sendOffer": "Angebot senden"
  },
  "review": {
    "rateExperience": "Wie war Ihr Umzug?",
    "commentPlaceholder": "Teilen Sie Ihre Erfahrung...",
    "submit": "Bewertung absenden",
    "averageRating": "Durchschnittliche Bewertung"
  },
  "admin": {
    "dashboard": "Admin-Dashboard",
    "companies": "Firmen",
    "approve": "Genehmigen",
    "reject": "Ablehnen",
    "suspend": "Sperren",
    "commissionRate": "Provisionssatz",
    "reviewMonitor": "Bewertungsmonitor"
  }
}
```

```json
// src/i18n/messages/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "submit": "Submit",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "next": "Next",
    "back": "Back",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort"
  },
  "auth": {
    "loginTitle": "Sign In",
    "registerTitle": "Register",
    "registerCompanyTitle": "Register as Moving Company",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot password?",
    "loginButton": "Sign In",
    "registerButton": "Register",
    "logout": "Sign Out",
    "loginError": "Login failed. Please check your credentials."
  },
  "moveRequest": {
    "title": "Request a Move",
    "newMove": "New Move",
    "myMoves": "My Moves",
    "originAddress": "Origin Address",
    "destinationAddress": "Destination Address",
    "moveDate": "Move Date",
    "propertyType": "Property Type",
    "floor": "Floor",
    "elevator": "Elevator Available",
    "parking": "Parking Available",
    "distanceToTruck": "Distance to Truck (m)",
    "extras": "Extra Services"
  },
  "inventory": {
    "title": "Inventory",
    "items": "Items",
    "addItem": "Add Item",
    "removeItem": "Remove Item",
    "itemName": "Item Name",
    "quantity": "Quantity",
    "volume": "Volume (m³)",
    "weight": "Weight (kg)",
    "totalVolume": "Total Volume",
    "totalWeight": "Total Weight",
    "aiDetected": "AI-Detected Items",
    "aiConfidence": "AI Confidence",
    "aiAddAll": "Add All"
  },
  "video": {
    "uploadTitle": "Upload Video",
    "recordVideo": "Record Video",
    "uploadProgress": "Upload Progress",
    "uploadSuccess": "Video uploaded successfully!",
    "uploadError": "Upload failed. Please try again.",
    "maxDuration": "Max duration: 5 minutes",
    "preview": "Preview"
  },
  "company": {
    "profile": "Company Profile",
    "serviceArea": "Service Area",
    "verificationPending": "Verification Pending",
    "verificationVerified": "Verified",
    "rating": "Rating",
    "requestOffer": "Request Offer"
  },
  "offer": {
    "title": "Offers",
    "myOffers": "My Offers",
    "accept": "Accept",
    "reject": "Reject",
    "negotiate": "Negotiate",
    "totalPrice": "Total Price",
    "includesVat": "incl. VAT",
    "validUntil": "Valid until",
    "statusPending": "Pending",
    "statusAccepted": "Accepted",
    "statusRejected": "Rejected",
    "statusExpired": "Expired"
  },
  "pricing": {
    "title": "Pricing",
    "baseFee": "Base Fee",
    "pricePerHour": "Price per Hour",
    "pricePerKm": "Price per km",
    "teamSize": "Team Size",
    "servicePrices": "Service Prices"
  },
  "availability": {
    "title": "Availability",
    "calendar": "Calendar",
    "slotMorning": "Morning",
    "slotAfternoon": "Afternoon",
    "teamCapacity": "Team Capacity",
    "parallelJobs": "Parallel Jobs"
  },
  "request": {
    "inbox": "Request Inbox",
    "newRequest": "New Request",
    "viewDetails": "View Details",
    "sendOffer": "Send Offer"
  },
  "review": {
    "rateExperience": "How was your move?",
    "commentPlaceholder": "Share your experience...",
    "submit": "Submit Review",
    "averageRating": "Average Rating"
  },
  "admin": {
    "dashboard": "Admin Dashboard",
    "companies": "Companies",
    "approve": "Approve",
    "reject": "Reject",
    "suspend": "Suspend",
    "commissionRate": "Commission Rate",
    "reviewMonitor": "Review Monitor"
  }
}
```

### 5.8 Usage Pattern in Components

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, d, n } = useI18n()

// Simple text: t('key')
// Date: d(dateValue, 'short')
// Currency: n(price, 'currency')
// Decimal: n(volume, 'decimal')
</script>

<template>
  <h1>{{ t('moveRequest.title') }}</h1>
  <p>{{ d(new Date(), 'long') }}</p>
  <p>{{ n(199.99, 'currency') }}</p>
</template>
```

---

## Section 6 — API Integration Layer

### 6.1 Base API Client

```ts
// src/api/client.ts
import axios, { type AxiosInstance, type AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 + global errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    // Format error for consistent handling
    const message = (error.response?.data as any)?.message ?? error.message
    return Promise.reject(new ApiError(message, error.response?.status))
  }
)

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
  }
}
```

### 6.2 Generic Types

```ts
// src/types/api.ts
export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface FilterParams {
  page?: number
  perPage?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}
```

### 6.3 API Module Pattern

```ts
// src/api/moveRequests.ts
import { apiClient } from './client'
import type { MoveRequest, CreateMoveRequestPayload, UpdateMoveRequestPayload, SubmitMoveRequestPayload, Paginated } from '@/types'

export const apiMoveRequests = {
  async create(payload: Partial<MoveRequest>): Promise<MoveRequest> {
    const { data } = await apiClient.post('/move-requests', payload)
    return data
  },

  async getById(id: string): Promise<MoveRequest> {
    const { data } = await apiClient.get(`/move-requests/${id}`)
    return data
  },

  async list(params?: { status?: string; page?: number; perPage?: number }): Promise<MoveRequest[]> {
    const { data } = await apiClient.get('/move-requests', { params })
    return data
  },

  async update(id: string, payload: UpdateMoveRequestPayload): Promise<MoveRequest> {
    const { data } = await apiClient.patch(`/move-requests/${id}`, payload)
    return data
  },

  async submit(id: string, payload: SubmitMoveRequestPayload): Promise<void> {
    await apiClient.post(`/move-requests/${id}/submit`, payload)
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/move-requests/${id}`)
  },

  async getEligibleCompanies(id: string): Promise<Company[]> {
    const { data } = await apiClient.get(`/move-requests/${id}/eligible-companies`)
    return data
  },
}
```

```ts
// src/api/inventory.ts
import { apiClient } from './client'
import type { InventoryItem, AiDetectedItem, InventorySavePayload } from '@/types'

export const apiInventory = {
  async save(moveRequestId: string, items: InventoryItem[]): Promise<void> {
    await apiClient.put(`/move-requests/${moveRequestId}/inventory`, { items })
  },

  async get(moveRequestId: string): Promise<{ items: InventoryItem[]; aiResults: AiDetectedItem[] | null; confidenceScore: number }> {
    const { data } = await apiClient.get(`/move-requests/${moveRequestId}/inventory`)
    return data
  },

  async triggerAiAnalysis(moveRequestId: string): Promise<{ detectedItems: AiDetectedItem[]; confidenceScore: number }> {
    const { data } = await apiClient.post(`/move-requests/${moveRequestId}/analyze-video`)
    return data
  },
}
```

```ts
// src/api/auth.ts
import { apiClient } from './client'
import type { User, RegisterCustomerPayload, RegisterCompanyPayload } from '@/types'

export const apiAuth = {
  async login(email: string, password: string): Promise<{ user: User; accessToken: string }> {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data
  },

  async registerCustomer(payload: RegisterCustomerPayload): Promise<{ user: User; accessToken: string }> {
    const { data } = await apiClient.post('/auth/register/customer', payload)
    return data
  },

  async registerCompany(payload: RegisterCompanyPayload): Promise<{ user: User; accessToken: string }> {
    const { data } = await apiClient.post('/auth/register/company', payload)
    return data
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const { data } = await apiClient.post('/auth/refresh')
    return data
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password })
  },
}
```

```ts
// src/api/index.ts (Barrel)
export { apiClient, ApiError } from './client'
export { apiAuth } from './auth'
export { apiMoveRequests } from './moveRequests'
export { apiInventory } from './inventory'
export { apiCompanies } from './companies'
export { apiOffers } from './offers'
export { apiReviews } from './reviews'
export { apiAvailability } from './availability'
export { apiAdmin } from './admin'
export { apiUploads } from './uploads'
```

---

## Section 7 — Key Composables

### 7.1 `useAuth`

```ts
// src/composables/useAuth.ts
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { RegisterCustomerPayload, RegisterCompanyPayload } from '@/types'

export function useAuth() {
  const store = useAuthStore()
  const notifications = useNotificationStore()

  const currentUser = computed(() => store.user)
  const isAuthenticated = computed(() => store.isAuthenticated)
  const userRole = computed(() => store.userRole)
  const isLoading = computed(() => store.isLoading)

  async function login(email: string, password: string): Promise<void> {
    await store.login(email, password)
    notifications.success(t('auth.loginSuccess'))
  }

  async function registerCustomer(payload: RegisterCustomerPayload): Promise<void> {
    await store.registerCustomer(payload)
    notifications.success(t('auth.registerSuccess'))
  }

  async function registerCompany(payload: RegisterCompanyPayload): Promise<void> {
    await store.registerCompany(payload)
    notifications.success(t('auth.registerCompanySuccess'))
  }

  function logout(): void {
    store.logout()
    notifications.info(t('auth.logoutSuccess'))
  }

  return {
    currentUser, isAuthenticated, userRole, isLoading,
    login, registerCustomer, registerCompany, logout,
  }
}
```

### 7.2 `useMoveRequest`

```ts
// src/composables/useMoveRequest.ts
import { ref, computed } from 'vue'
import { useMoveRequestStore } from '@/stores/moveRequestStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { MoveRequest, MoveDetails } from '@/types'

export function useMoveRequest() {
  const store = useMoveRequestStore()
  const notifications = useNotificationStore()

  const currentRequest = computed(() => store.currentRequest)
  const isLoading = computed(() => store.isLoading)
  const canProceed = computed(() => store.currentRequest?.wizardStep !== undefined)

  async function createMoveRequest(): Promise<string> {
    const id = await store.createDraft()
    return id
  }

  async function loadMoveRequest(id: string): Promise<MoveRequest | null> {
    return await store.loadMoveRequest(id)
  }

  async function updateDetails(details: Partial<MoveDetails>): Promise<void> {
    if (!store.currentRequest) return
    Object.assign(store.currentRequest.details, details)
  }

  async function saveAndProceed(): Promise<void> {
    await store.saveDetails()
    notifications.success(t('moveRequest.saved'))
  }

  async function submitToCompanies(companyIds: string[]): Promise<void> {
    await store.submitToCompanies(companyIds)
    notifications.success(t('moveRequest.submitted'))
  }

  return {
    currentRequest, isLoading, canProceed,
    createMoveRequest, loadMoveRequest, updateDetails, saveAndProceed, submitToCompanies,
  }
}
```

### 7.3 `useVideoUpload`

```ts
// src/composables/useVideoUpload.ts
import { ref } from 'vue'
import { apiUploads } from '@/api'
import { useNotificationStore } from '@/stores/notificationStore'

export type UploadStatus = 'idle' | 'presigning' | 'uploading' | 'processing' | 'completed' | 'error'

export function useVideoUpload() {
  const progress = ref(0)
  const status = ref<UploadStatus>('idle')
  const error = ref<string | null>(null)
  const videoUrl = ref<string | null>(null)

  async function uploadVideo(file: Blob, moveRequestId: string): Promise<string> {
    status.value = 'presigning'
    error.value = null
    progress.value = 0

    try {
      const { presignedUrl, fileUrl } = await apiUploads.getVideoPresignedUrl(moveRequestId, 'video.mp4')
      
      status.value = 'uploading'
      await apiUploads.uploadToS3(presignedUrl, file, (p) => { progress.value = p })
      
      status.value = 'processing'
      await apiUploads.confirmVideoUpload(moveRequestId, fileUrl)
      
      status.value = 'completed'
      videoUrl.value = fileUrl
      return fileUrl
    } catch (e: any) {
      status.value = 'error'
      error.value = e.message
      throw e
    }
  }

  function reset(): void {
    progress.value = 0
    status.value = 'idle'
    error.value = null
    videoUrl.value = null
  }

  return { progress, status, error, videoUrl, uploadVideo, reset }
}
```

### 7.4 `useInventory`

```ts
// src/composables/useInventory.ts
import { computed } from 'vue'
import { useInventoryStore } from '@/stores/inventoryStore'
import type { InventoryItem, AiDetectedItem } from '@/types'

export function useInventory() {
  const store = useInventoryStore()

  const items = computed(() => store.items)
  const aiResults = computed(() => store.aiResults)
  const totalVolume = computed(() => store.totalVolume)
  const totalWeight = computed(() => store.totalWeight)
  const itemCount = computed(() => store.itemCount)

  function addItem(item: Omit<InventoryItem, 'id'>): void {
    store.addItem({ ...item, id: crypto.randomUUID() })
  }

  function removeItem(id: string): void { store.removeItem(id) }
  function updateItem(id: string, patch: Partial<InventoryItem>): void { store.updateItem(id, patch) }
  function acceptAiItem(item: AiDetectedItem): void { store.acceptAiItem(item) }
  function dismissAiItem(index: number): void { store.dismissAiItem(index) }

  async function save(moveRequestId: string): Promise<void> {
    await store.saveInventory(moveRequestId)
  }

  async function load(moveRequestId: string): Promise<void> {
    await store.loadInventory(moveRequestId)
  }

  return {
    items, aiResults, totalVolume, totalWeight, itemCount,
    addItem, removeItem, updateItem, acceptAiItem, dismissAiItem,
    save, load,
  }
}
```

### 7.5 `usePricingEstimate`

```ts
// src/composables/usePricingEstimate.ts
import { computed, type Ref } from 'vue'
import type { PricingRule, MoveDetails, InventoryItem } from '@/types'

export interface EstimateBreakdown {
  baseFee: number
  hourlyCost: number
  distanceCost: number
  volumeCost: number
  serviceAddons: { name: string; price: number }[]
  subtotal: number
  vat: number
  total: number
}

export function usePricingEstimate(
  pricing: Ref<PricingRule>,
  details: Ref<MoveDetails>,
  items: Ref<InventoryItem[]>
) {
  const estimate = computed<EstimateBreakdown>(() => {
    const p = pricing.value
    const d = details.value
    const totalVolume = items.value.reduce((s, i) => s + i.volume * i.quantity, 0)
    const estimatedHours = Math.ceil(totalVolume / 10) + 2 // heuristic
    const distanceKm = d.estimatedDistanceKm ?? 0

    const hourlyCost = estimatedHours * p.pricePerHour * p.teamSize
    const distanceCost = distanceKm * p.pricePerKm
    const volumeCost = totalVolume * (p.volumeRate ?? 0)

    const serviceAddons = d.extras?.map(extra => {
      const addon = p.serviceAddons.find(a => a.id === extra)
      return addon ? { name: addon.name, price: addon.price } : null
    }).filter(Boolean) as { name: string; price: number }[]

    const addonsTotal = serviceAddons.reduce((s, a) => s + a.price, 0)
    const subtotal = p.baseFee + hourlyCost + distanceCost + volumeCost + addonsTotal
    const vat = subtotal * 0.19 // DE VAT

    return {
      baseFee: p.baseFee,
      hourlyCost,
      distanceCost,
      volumeCost,
      serviceAddons,
      subtotal,
      vat,
      total: subtotal + vat,
    }
  })

  return { estimate }
}
```

### 7.6 `useAvailability`

```ts
// src/composables/useAvailability.ts
import { ref, computed } from 'vue'
import { useAvailabilityStore } from '@/stores/availabilityStore'
import type { AvailabilitySlot } from '@/types'

export function useAvailability() {
  const store = useAvailabilityStore()

  const isLoading = computed(() => store.isLoading)

  async function checkAvailability(companyId: string, date: string): Promise<boolean> {
    const slots = store.slotsByDate[date] ?? []
    return slots.some(s => s.companyId === companyId && s.isAvailable)
  }

  async function getAvailableSlots(companyId: string, date: string): Promise<AvailabilitySlot[]> {
    const slots = store.slotsByDate[date] ?? []
    return slots.filter(s => s.companyId === companyId && s.isAvailable)
  }

  async function loadMonth(year: number, month: number): Promise<void> {
    await store.loadSlots(year, month)
  }

  return { isLoading, checkAvailability, getAvailableSlots, loadMonth }
}
```

### 7.7 `useRoleGuard`

```ts
// src/composables/useRoleGuard.ts
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { UserRole } from '@/utils/enums'

export function useRoleGuard() {
  const authStore = useAuthStore()

  const role = computed(() => authStore.userRole)
  const isCustomer = computed(() => role.value === UserRole.END_CUSTOMER)
  const isCompany = computed(() => role.value === UserRole.COMPANY)
  const isAdmin = computed(() => role.value === UserRole.ADMIN)

  function canAccess(routeRole: UserRole | null): boolean {
    if (!routeRole) return true
    return role.value === routeRole
  }

  function requireRole(required: UserRole): boolean {
    return role.value === required
  }

  return { role, isCustomer, isCompany, isAdmin, canAccess, requireRole }
}
```

### 7.8 `useI18nHelpers`

```ts
// src/composables/useI18nHelpers.ts
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

export function useI18nHelpers() {
  const { locale, t } = useI18n()

  const isGerman = computed(() => locale.value === 'de')
  const isEnglish = computed(() => locale.value === 'en')

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'EUR' }).format(value)
  }

  function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale.value, options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
  }

  function formatDistance(km: number): string {
    return `${km} km`
  }

  function formatPhone(phone: string): string {
    // Basic formatting; can be enhanced with libphonenumber-js
    return phone
  }

  return { locale, isGerman, isEnglish, formatCurrency, formatDate, formatDistance, formatPhone }
}
```

---

## Section 8 — TypeScript Interfaces

### 8.1 File Organization

```
src/types/
├── user.ts
├── company.ts
├── moveRequest.ts
├── inventory.ts
├── offer.ts
├── review.ts
├── pricing.ts
├── availability.ts
├── notification.ts
├── api.ts
└── index.ts
```

### 8.2 `user.ts`

```ts
// src/types/user.ts
export type UserRole = 'END_CUSTOMER' | 'COMPANY' | 'ADMIN'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  companyId?: string        // populated for COMPANY role
  company?: CompanySummary  // nested for convenience
}

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatarUrl?: string
  address?: Address
  dateOfBirth?: string
}

export interface UserSettings {
  language: string
  currency: string
  notifications: boolean
  emailDigest: boolean
  twoFactorEnabled: boolean
}

export interface Address {
  street: string
  houseNumber: string
  zipCode: string
  city: string
  country: string
  floor?: number
  hasElevator?: boolean
}

export interface RegisterCustomerPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface RegisterCompanyPayload {
  email: string
  password: string
  companyName: string
  contactFirstName: string
  contactLastName: string
  phone: string
  tradeLicenseNumber: string
  serviceArea: GeoArea
}

export interface GeoArea {
  type: 'radius' | 'polygon'
  center?: { lat: number; lng: number }
  radiusKm?: number
  coordinates?: { lat: number; lng: number }[]
}
```

### 8.3 `company.ts`

```ts
// src/types/company.ts
export interface Company {
  id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  website?: string
  email: string
  phone: string
  address: Address
  serviceArea: GeoArea
  isVerified: boolean
  isApproved: boolean
  isSuspended: boolean
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface CompanySummary {
  id: string
  name: string
  logoUrl?: string
  rating: number
  reviewCount: number
  isVerified: boolean
}

export interface Team {
  id: string
  companyId: string
  name: string
  size: number
  members: TeamMember[]
  isActive: boolean
}

export interface TeamMember {
  id: string
  name: string
  role: 'driver' | 'mover' | 'supervisor'
  avatarUrl?: string
}

export interface Document {
  id: string
  companyId: string
  type: DocumentType
  url: string
  status: 'pending' | 'verified' | 'rejected'
  uploadedAt: string
  reviewedAt?: string
  rejectionReason?: string
}

export type DocumentType = 'TRADE_LICENSE' | 'INSURANCE' | 'IDENTITY' | 'TAX_ID'
```

### 8.4 `moveRequest.ts`

```ts
// src/types/moveRequest.ts
export type MoveRequestStatus =
  | 'DRAFT'
  | 'VIDEO_UPLOADED'
  | 'INVENTORY_READY'
  | 'DETAILS_COMPLETE'
  | 'REQUESTED'
  | 'OFFERS_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'COMPLETED'
  | 'CANCELLED'

export type MoveType = 'HOUSE' | 'APARTMENT' | 'OFFICE' | 'STORAGE'

export interface MoveRequest {
  id: string
  customerId: string
  status: MoveRequestStatus
  wizardStep: number
  video?: Video
  inventory: InventoryItem[]
  aiAnalysis?: AiAnalysis
  details: MoveDetails
  requestedCompanyIds: string[]
  acceptedOfferId?: string
  createdAt: string
  updatedAt: string
}

export interface MoveDetails {
  moveType: MoveType
  originAddress: Address
  destinationAddress: Address
  moveDate: string
  preferredTimeSlot?: 'MORNING' | 'AFTERNOON' | 'ANY'
  floorsOrigin?: number
  floorsDestination?: number
  hasElevatorOrigin: boolean
  hasElevatorDestination: boolean
  parkingAvailableOrigin: boolean
  parkingAvailableDestination: boolean
  distanceToTruckOrigin?: number  // meters
  distanceToTruckDestination?: number
  estimatedDistanceKm?: number
  extras: string[]  // ids of ServiceAddon
  notes?: string
}

export interface MoveRequestSummary {
  id: string
  customerName: string
  moveType: MoveType
  moveDate: string
  originCity: string
  destinationCity: string
  distanceKm: number
  itemCount: number
  estimatedVolume: number
  status: MoveRequestStatus
}

export interface CreateMoveRequestPayload {
  status: 'DRAFT'
}

export interface UpdateMoveRequestPayload {
  video?: Partial<Video>
  inventory?: InventoryItem[]
  details?: Partial<MoveDetails>
  aiAnalysis?: Partial<AiAnalysis>
}

export interface SubmitMoveRequestPayload {
  companyIds: string[]
}
```

### 8.5 `inventory.ts`

```ts
// src/types/inventory.ts
export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  volume: number      // cubic meters per unit
  weight: number      // kg per unit
  isFragile: boolean
  needsDisassembly: boolean
  notes?: string
  aiDetected: boolean // true if added from AI results
}

export interface AiDetectedItem {
  name: string
  category: string
  estimatedQuantity: number
  estimatedVolume: number
  estimatedWeight: number
  confidence: number  // 0-1
  boundingBox?: { x: number; y: number; width: number; height: number }
}

export interface AiAnalysis {
  detectedItems: AiDetectedItem[]
  totalEstimatedVolume: number
  totalEstimatedWeight: number
  confidenceScore: number  // overall 0-1
  processedAt: string
  videoDurationSeconds: number
}

export interface InventorySavePayload {
  items: InventoryItem[]
}
```

### 8.6 `offer.ts`

```ts
// src/types/offer.ts
export type OfferStatus = 'DRAFT' | 'SENT' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED'

export interface Offer {
  id: string
  moveRequestId: string
  companyId: string
  companyName: string
  companyLogo?: string
  status: OfferStatus
  items: OfferItem[]
  services: OfferService[]
  baseFee: number
  hourlyRate: number
  estimatedHours: number
  distanceRate: number
  distanceKm: number
  volumeRate: number
  totalVolume: number
  vatRate: number
  subtotal: number
  vatAmount: number
  totalPrice: number
  validUntil: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OfferItem {
  inventoryItemId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OfferService {
  serviceId: string
  name: string
  description?: string
  price: number
}

export interface OfferUpdatePayload {
  items?: Partial<OfferItem>[]
  services?: Partial<OfferService>[]
  baseFee?: number
  hourlyRate?: number
  estimatedHours?: number
  notes?: string
  validUntil?: string
}
```

### 8.7 `review.ts`

```ts
// src/types/review.ts
export interface Review {
  id: string
  moveRequestId: string
  companyId: string
  customerId: string
  customerName: string
  customerAvatar?: string
  rating: number       // 1-5
  comment?: string
  categories?: ReviewCategoryScores
  isFlagged: boolean
  flagReason?: string
  createdAt: string
}

export interface ReviewCategoryScores {
  punctuality: number
  professionalism: number
  care: number
  value: number
  communication: number
}

export interface CreateReviewPayload {
  moveRequestId: string
  companyId: string
  rating: number
  comment?: string
  categories?: ReviewCategoryScores
}
```

### 8.8 `pricing.ts`

```ts
// src/types/pricing.ts
export interface PricingRule {
  id: string
  companyId: string
  baseFee: number
  pricePerHour: number
  pricePerKm: number
  teamSize: number
  volumeRate: number       // price per m³
  minHours: number
  maxDistanceKm?: number
  serviceAddons: ServiceAddon[]
  isActive: boolean
  effectiveFrom: string
}

export interface ServiceAddon {
  id: string
  name: string
  description?: string
  price: number
  isPerItem: boolean       // if false, flat fee
  category: 'PACKING' | 'ASSEMBLY' | 'STORAGE' | 'CLEANING' | 'OTHER'
}
```

### 8.9 `availability.ts`

```ts
// src/types/availability.ts
export interface AvailabilitySlot {
  id: string
  companyId: string
  teamId: string
  date: string            // ISO date
  timeSlot: 'MORNING' | 'AFTERNOON' | 'FULL_DAY'
  isAvailable: boolean
  maxParallelJobs: number
  bookedJobs: number
}

export interface TeamCapacity {
  teamId: string
  date: string
  maxJobs: number
  currentJobs: number
}
```

### 8.10 `notification.ts`

```ts
// src/types/notification.ts
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, any>
  isRead: boolean
  createdAt: string
}

export type NotificationType =
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'REQUEST_RECEIVED'
  | 'REQUEST_EXPIRED'
  | 'MOVE_REMINDER'
  | 'REVIEW_REQUEST'
  | 'SYSTEM'
  | 'COMPANY_APPROVED'
  | 'COMPANY_REJECTED'
```

### 8.11 `video.ts`

```ts
// src/types/video.ts
export interface Video {
  id: string
  moveRequestId: string
  url: string
  thumbnailUrl?: string
  durationSeconds: number
  fileSizeBytes: number
  format: string
  uploadedAt: string
  expiresAt?: string       // temporary access for companies
}
```

### 8.12 Admin Types

```ts
// Included inline in admin-facing types files
export interface Commission {
  id: string
  companyId: string
  companyName: string
  rate: number              // percentage (0-100)
  effectiveFrom: string
  isActive: boolean
  totalCollected: number
}

export interface PlatformMetrics {
  totalUsers: number
  totalCompanies: number
  activeMoveRequests: number
  completedMovesThisMonth: number
  totalRevenue: number
  averageRating: number
  pendingApprovals: number
}

export interface ActivityLog {
  id: string
  actorId: string
  actorName: string
  actorRole: UserRole
  action: string
  entityType: string
  entityId: string
  details: Record<string, any>
  createdAt: string
}
```

### 8.13 Barrel Export

```ts
// src/types/index.ts
export * from './user'
export * from './company'
export * from './moveRequest'
export * from './inventory'
export * from './offer'
export * from './review'
export * from './pricing'
export * from './availability'
export * from './notification'
export * from './video'
export * from './api'
```

---

## Appendix — View File Assignment

| Route | View File |
|-------|-----------|
| `/` | `src/views/public/HomeView.vue` |
| `/login` | `src/views/public/LoginView.vue` |
| `/about`–## Appendix — View File Assignment (Continued)

| Route | View File |
|-------|-----------|
| `/` | `src/views/public/HomeView.vue` |
| `/login` | `src/views/public/LoginView.vue` |
| `/register` | `src/views/public/RegisterView.vue` |
| `/register-company` | `src/views/public/RegisterCompanyView.vue` |
| `/about` | `src/views/public/AboutView.vue` |
| `/how-it-works` | `src/views/public/HowItWorksView.vue` |
| `/privacy` | `src/views/public/PrivacyView.vue` |
| `/terms` | `src/views/public/TermsView.vue` |
| `/forgot-password` | `src/views/public/ForgotPasswordView.vue` |
| `/dashboard` | `src/views/customer/CustomerDashboardView.vue` |
| `/moves` | `src/views/customer/CustomerMovesView.vue` |
| `/offers` | `src/views/customer/CustomerOffersView.vue` |
| `/profile` | `src/views/customer/CustomerProfileView.vue` |
| `/settings` | `src/views/customer/CustomerSettingsView.vue` |
| `/move/new` | `src/views/customer/move/MoveNewView.vue` |
| `/move/:id/video` | `src/views/customer/move/MoveVideoView.vue` |
| `/move/:id/inventory` | `src/views/customer/move/MoveInventoryView.vue` |
| `/move/:id/details` | `src/views/customer/move/MoveDetailsView.vue` |
| `/move/:id/companies` | `src/views/customer/move/MoveCompaniesView.vue` |
| `/move/:id/offers` | `src/views/customer/move/MoveOffersView.vue` |
| `/company/dashboard` | `src/views/company/CompanyDashboardView.vue` |
| `/company/profile` | `src/views/company/CompanyProfileView.vue` |
| `/company/pricing` | `src/views/company/CompanyPricingView.vue` |
| `/company/availability` | `src/views/company/CompanyAvailabilityView.vue` |
| `/company/teams` | `src/views/company/CompanyTeamsView.vue` |
| `/company/requests` | `src/views/company/CompanyRequestsView.vue` |
| `/company/requests/:id` | `src/views/company/CompanyRequestDetailView.vue` |
| `/company/offers` | `src/views/company/CompanyOffersView.vue` |
| `/company/offers/:id/edit` | `src/views/company/CompanyOfferEditView.vue` |
| `/company/documents` | `src/views/company/CompanyDocumentsView.vue` |
| `/company/settings` | `src/views/company/CompanySettingsView.vue` |
| `/company/analytics` | `src/views/company/CompanyAnalyticsView.vue` |
| `/admin/dashboard` | `src/views/admin/AdminDashboardView.vue` |
| `/admin/companies` | `src/views/admin/AdminCompaniesView.vue` |
| `/admin/companies/:id` | `src/views/admin/AdminCompanyDetailView.vue` |
| `/admin/requests` | `src/views/admin/AdminRequestsView.vue` |
| `/admin/users` | `src/views/admin/AdminUsersView.vue` |
| `/admin/commissions` | `src/views/admin/AdminCommissionsView.vue` |
| `/admin/reviews` | `src/views/admin/AdminReviewsView.vue` |
| `/admin/logs` | `src/views/admin/AdminLogsView.vue` |
| `/admin/settings` | `src/views/admin/AdminSettingsView.vue` |
| `*` (404) | `src/views/public/NotFoundView.vue` |

---

## Appendix B — Tailwind Theme Configuration Snippet

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
```

---

## Appendix C — Vite Config Snippet

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
          ui: ['axios'],
        },
      },
    },
  },
})
```

---

## Appendix D — App.vue Root Component

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import CustomerLayout from '@/layouts/CustomerLayout.vue'
import CompanyLayout from '@/layouts/CompanyLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import ToastContainer from '@/components/_base/BaseToast.vue'

const route = useRoute()

const layout = computed(() => {
  switch (route.meta.layout) {
    case 'CustomerLayout': return CustomerLayout
    case 'CompanyLayout': return CompanyLayout
    case 'AdminLayout': return AdminLayout
    default: return DefaultLayout
  }
})
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <ToastContainer />
</template>
```

---

> **End of Document.** This specification provides the complete foundation for the MyMove Vue 3 frontend. All code examples use Vue 3 Composition API with `<script setup lang="ts">`, TypeScript throughout, zero hardcoded text (all via `t('key')`), TailwindCSS utility classes, and lazy-loaded routes.

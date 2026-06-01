# MyMove — NestJS Backend Architecture Specification

> **Version:** 1.0.0  
> **Stack:** Node.js 20+ · NestJS 10+ · TypeScript 5+ · TypeORM 0.3+ · MySQL 8+ · Supabase Auth · AWS S3  
> **API Base Path:** `/api/v1`

---

## Section 1 — Backend Folder Structure

```
mymove-api/
├── apps/
│   └── api/
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   │
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── guards/
│       │   │   │   │   ├── jwt-auth.guard.ts
│       │   │   │   │   ├── roles.guard.ts
│       │   │   │   │   └── optional-auth.guard.ts
│       │   │   │   ├── decorators/
│       │   │   │   │   ├── roles.decorator.ts
│       │   │   │   │   ├── current-user.decorator.ts
│       │   │   │   │   └── public.decorator.ts
│       │   │   │   ├── strategies/
│       │   │   │   │   └── supabase-jwt.strategy.ts
│       │   │   │   ├── interfaces/
│       │   │   │   │   ├── auth-request.interface.ts
│       │   │   │   │   ├── jwt-payload.interface.ts
│       │   │   │   │   └── supabase-user.interface.ts
│       │   │   │   └── dto/
│       │   │   │       └── refresh-token.dto.ts
│       │   │   │
│       │   │   ├── users/
│       │   │   │   ├── users.module.ts
│       │   │   │   ├── users.controller.ts
│       │   │   │   ├── users.service.ts
│       │   │   │   ├── users.repository.ts
│       │   │   │   ├── entities/
│       │   │   │   │   └── user.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── create-user.dto.ts
│       │   │   │   │   ├── update-user.dto.ts
│       │   │   │   │   ├── user-profile.dto.ts
│       │   │   │   │   └── change-role.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── user-profile.interface.ts
│       │   │   │
│       │   │   ├── companies/
│       │   │   │   ├── companies.module.ts
│       │   │   │   ├── companies.controller.ts
│       │   │   │   ├── companies.service.ts
│       │   │   │   ├── companies.repository.ts
│       │   │   │   ├── entities/
│       │   │   │   │   ├── company.entity.ts
│       │   │   │   │   └── company-document.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── register-company.dto.ts
│       │   │   │   │   ├── update-company.dto.ts
│       │   │   │   │   ├── company-profile.dto.ts
│       │   │   │   │   └── submit-document.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── company-status.interface.ts
│       │   │   │
│       │   │   ├── move-requests/
│       │   │   │   ├── move-requests.module.ts
│       │   │   │   ├── move-requests.controller.ts
│       │   │   │   ├── move-requests.service.ts
│       │   │   │   ├── move-requests.repository.ts
│       │   │   │   ├── entities/
│       │   │   │   │   └── move-request.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── create-move-request.dto.ts
│       │   │   │   │   ├── update-move-request.dto.ts
│       │   │   │   │   ├── move-details.dto.ts
│       │   │   │   │   └── request-offers.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── move-request-status.interface.ts
│       │   │   │
│       │   │   ├── inventory/
│       │   │   │   ├── inventory.module.ts
│       │   │   │   ├── inventory.controller.ts
│       │   │   │   ├── inventory.service.ts
│       │   │   │   ├── inventory.repository.ts
│       │   │   │   ├── entities/
│       │   │   │   │   ├── inventory-item.entity.ts
│       │   │   │   │   └── ai-analysis.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── add-inventory-item.dto.ts
│       │   │   │   │   ├── update-inventory-item.dto.ts
│       │   │   │   │   ├── ai-result.dto.ts
│       │   │   │   │   └── bulk-edit-inventory.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── detected-item.interface.ts
│       │   │   │
│       │   │   ├── videos/
│       │   │   │   ├── videos.module.ts
│       │   │   │   ├── videos.controller.ts
│       │   │   │   ├── videos.service.ts
│       │   │   │   ├── videos.repository.ts
│       │   │   │   ├── video-lifecycle.service.ts
│       │   │   │   ├── entities/
│       │   │   │   │   └── video.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── initiate-upload.dto.ts
│       │   │   │   │   ├── confirm-upload.dto.ts
│       │   │   │   │   └── video-metadata.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── presigned-url.interface.ts
│       │   │   │
│       │   │   ├── pricing/
│       │   │   │   ├── pricing.module.ts
│       │   │   │   ├── pricing.controller.ts
│       │   │   │   ├── pricing.service.ts
│       │   │   │   ├── pricing-engine.service.ts
│       │   │   │   ├── pricing-rules.repository.ts
│       │   │   │   ├── entities/
│       │   │   │   │   ├── pricing-rule.entity.ts
│       │   │   │   │   └── service-addon.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── create-pricing-rule.dto.ts
│       │   │   │   │   ├── update-pricing-rule.dto.ts
│       │   │   │   │   ├── calculate-estimate.dto.ts
│       │   │   │   │   └── service-addon.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── pricing-calculation.interface.ts
│       │   │   │
│       │   │   ├── offers/
│       │   │   │   ├── offers.module.ts
│       │   │   │   ├── offers.controller.ts
│       │   │   │   ├── offers.service.ts
│       │   │   │   ├── offers.repository.ts
│       │   │   │   ├── entities/
│       │   │   │   │   └── offer.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── create-offer.dto.ts
│       │   │   │   │   ├── update-offer.dto.ts
│       │   │   │   │   ├── finalize-offer.dto.ts
│       │   │   │   │   └── respond-to-offer.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── offer-status.interface.ts
│       │   │   │
│       │   │   ├── availability/
│       │   │   │   ├── availability.module.ts
│       │   │   │   ├── availability.controller.ts
│       │   │   │   ├── availability.service.ts
│       │   │   │   ├── availability.repository.ts
│       │   │   │   ├── team-capacity.service.ts
│       │   │   │   ├── entities/
│       │   │   │   │   ├── availability-slot.entity.ts
│       │   │   │   │   └── team.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── create-team.dto.ts
│       │   │   │   │   ├── update-team.dto.ts
│       │   │   │   │   ├── set-availability.dto.ts
│       │   │   │   │   ├── check-availability.dto.ts
│       │   │   │   │   └── allocate-capacity.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── capacity-check.interface.ts
│       │   │   │
│       │   │   ├── reviews/
│       │   │   │   ├── reviews.module.ts
│       │   │   │   ├── reviews.controller.ts
│       │   │   │   ├── reviews.service.ts
│       │   │   │   ├── reviews.repository.ts
│       │   │   │   ├── entities/
│       │   │   │   │   └── review.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── create-review.dto.ts
│       │   │   │   │   └── update-review.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── review-summary.interface.ts
│       │   │   │
│       │   │   ├── admin/
│       │   │   │   ├── admin.module.ts
│       │   │   │   ├── admin.controller.ts
│       │   │   │   ├── admin.service.ts
│       │   │   │   ├── admin.repository.ts
│       │   │   │   ├── dashboard.service.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── approve-company.dto.ts
│       │   │   │   │   ├── suspend-company.dto.ts
│       │   │   │   │   ├── set-commission-rate.dto.ts
│       │   │   │   │   └── platform-stats-query.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── platform-stats.interface.ts
│       │   │   │
│       │   │   ├── notifications/
│       │   │   │   ├── notifications.module.ts
│       │   │   │   ├── notifications.controller.ts
│       │   │   │   ├── notifications.service.ts
│       │   │   │   ├── notifications.repository.ts
│       │   │   │   ├── notification-drivers/
│       │   │   │   │   ├── email.driver.ts
│       │   │   │   │   ├── push.driver.ts
│       │   │   │   │   └── in-app.driver.ts
│       │   │   │   ├── entities/
│       │   │   │   │   └── notification.entity.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── send-notification.dto.ts
│       │   │   │   │   └── notification-preferences.dto.ts
│       │   │   │   └── interfaces/
│       │   │   │       └── notification-channel.interface.ts
│       │   │   │
│       │   │   └── commissions/
│       │   │       ├── commissions.module.ts
│       │   │       ├── commissions.controller.ts
│       │   │       ├── commissions.service.ts
│       │   │       ├── commissions.repository.ts
│       │   │       ├── entities/
│       │   │       │   └── commission.entity.ts
│       │   │       ├── dto/
│       │   │       │   ├── calculate-commission.dto.ts
│       │   │       │   └── commission-query.dto.ts
│       │   │       └── interfaces/
│       │   │           └── commission-breakdown.interface.ts
│       │   │
│       │   ├── shared/
│       │   │   ├── config/
│       │   │   │   ├── database.config.ts
│       │   │   │   ├── s3.config.ts
│       │   │   │   ├── supabase.config.ts
│       │   │   │   └── app-config.module.ts
│       │   │   ├── filters/
│       │   │   │   └── global-exception.filter.ts
│       │   │   ├── interceptors/
│       │   │   │   ├── logging.interceptor.ts
│       │   │   │   ├── transform.interceptor.ts
│       │   │   │   └── timeout.interceptor.ts
│       │   │   ├── pipes/
│       │   │   │   └── validation.pipe.ts
│       │   │   ├── constants/
│       │   │   │   ├── roles.constant.ts
│       │   │   │   ├── status.constant.ts
│       │   │   │   └── error-codes.constant.ts
│       │   │   ├── enums/
│       │   │   │   ├── user-role.enum.ts
│       │   │   │   ├── request-status.enum.ts
│       │   │   │   ├── offer-status.enum.ts
│       │   │   │   ├── company-status.enum.ts
│       │   │   │   ├── document-type.enum.ts
│       │   │   │   ├── notification-type.enum.ts
│       │   │   │   └── commission-type.enum.ts
│       │   │   ├── utils/
│       │   │   │   ├── slugify.util.ts
│       │   │   │   ├── distance.util.ts
│       │   │   │   └── date-range.util.ts
│       │   │   └── services/
│       │   │       └── s3.service.ts
│       │   │
│       │   └── health/
│       │       ├── health.controller.ts
│       │       └── health.module.ts
│       │
│       ├── test/
│       │   ├── jest-e2e.json
│       │   ├── e2e/
│       │   │   ├── auth.e2e-spec.ts
│       │   │   ├── move-requests.e2e-spec.ts
│       │   │   └── offers.e2e-spec.ts
│       │   └── integration/
│       │       ├── pricing-engine.integration-spec.ts
│       │       └── availability.integration-spec.ts
│       │
│       └── tsconfig.app.json
│
├── libs/
│   └── shared/
│       ├── src/
│       │   ├── index.ts
│       │   ├── types/
│       │   │   └── api-response.type.ts
│       │   └── validators/
│       │       └── is-future-date.validator.ts
│       └── tsconfig.lib.json
│
├── .env.example
├── .env.local
├── nest-cli.json
├── package.json
├── tsconfig.json
├── typeorm.config.ts
├── docker-compose.yml
└── Dockerfile
```

---

## Section 2 — Module Breakdown

### 1. AuthModule

**Purpose:**  
Integrates with Supabase Auth for JWT-based authentication. Provides guards, decorators, and strategies to protect routes and extract identity/roles. All authentication state lives in Supabase; this module validates tokens and enforces RBAC locally.

**Folder Contents:**
```
auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   └── optional-auth.guard.ts
├── decorators/
│   ├── roles.decorator.ts
│   ├── current-user.decorator.ts
│   └── public.decorator.ts
├── strategies/
│   └── supabase-jwt.strategy.ts
├── interfaces/
│   ├── auth-request.interface.ts
│   ├── jwt-payload.interface.ts
│   └── supabase-user.interface.ts
└── dto/
    └── refresh-token.dto.ts
```

**Controller Methods:**
```typescript
// auth.controller.ts
@Controller('auth')
export class AuthController {
  @Post('refresh') refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthTokenResponse>;
  @Get('me') getCurrentUser(@CurrentUser() user: JwtPayload): Promise<UserProfileDto>;
  @Post('logout') logout(@CurrentUser() user: JwtPayload): Promise<void>;
}
```

**Service Methods:**
```typescript
// auth.service.ts
export class AuthService {
  constructor(
    private readonly supabaseClient: SupabaseClient,
    private readonly usersService: UsersService,
  ) {}

  async validateSupabaseToken(accessToken: string): Promise<SupabaseUser>;
  async refreshSession(refreshToken: string): Promise<AuthTokenResponse>;
  async syncUserToLocalDb(supabaseUser: SupabaseUser): Promise<User>;
  async revokeSession(userId: string): Promise<void>;
}
```

**Entities Owned:** *(none — users live in Supabase, mirrored locally in UsersModule)*

**Key DTOs:**
```typescript
export class RefreshTokenDto {
  @IsString() refreshToken: string;
}
```

**Module Dependencies:**
- `UsersModule` (to sync/create local user records)

---

### 2. UsersModule

**Purpose:**  
Local user profiles, role management, and profile enrichment. Mirrors Supabase users into the local MySQL database for relational joins with companies, requests, and offers. Handles role changes (ADMIN only).

**Folder Contents:**
```
users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── users.repository.ts
├── entities/
│   └── user.entity.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── user-profile.dto.ts
│   └── change-role.dto.ts
└── interfaces/
    └── user-profile.interface.ts
```

**Controller Methods:**
```typescript
// users.controller.ts
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('me') getMe(@CurrentUser() user: JwtPayload): Promise<UserProfileDto>;
  @Patch('me') updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto): Promise<UserProfileDto>;
  @Get(':id') getUserById(@Param('id') id: string): Promise<UserProfileDto>;
  @Patch(':id/role') @Roles(UserRole.ADMIN) changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto): Promise<UserProfileDto>;
}
```

**Service Methods:**
```typescript
// users.service.ts
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUserFromSupabase(dto: CreateUserDto): Promise<User>;
  async updateUser(userId: string, dto: UpdateUserDto): Promise<User>;
  async findById(userId: string): Promise<User | null>;
  async findByEmail(email: string): Promise<User | null>;
  async findBySupabaseUid(supabaseUid: string): Promise<User | null>;
  async setRole(userId: string, role: UserRole): Promise<User>;
  async listUsers(query: PaginationQueryDto): Promise<PaginatedResult<User>>;
  async getOrCreateFromSupabase(supabaseUser: SupabaseUser): Promise<User>;
}
```

**Entities Owned:**
- `User` → table `users`

**Key DTOs:**
```typescript
export class CreateUserDto {
  @IsUUID() supabaseUid: string;
  @IsEmail() email: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEnum(UserRole) role: UserRole;
  @IsOptional() @IsString() phone?: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
}

export class ChangeRoleDto {
  @IsEnum(UserRole) role: UserRole;
}
```

**Module Dependencies:**
- *(none — bottom of dependency graph)*

---

### 3. CompaniesModule

**Purpose:**  
Company registration, profile management, document submission/verification, and approval workflow. Companies register, upload trade license documents, wait for ADMIN approval, and then configure their service area and profile.

**Folder Contents:**
```
companies/
├── companies.module.ts
├── companies.controller.ts
├── companies.service.ts
├── companies.repository.ts
├── entities/
│   ├── company.entity.ts
│   └── company-document.entity.ts
├── dto/
│   ├── register-company.dto.ts
│   ├── update-company.dto.ts
│   ├── company-profile.dto.ts
│   └── submit-document.dto.ts
└── interfaces/
    └── company-status.interface.ts
```

**Controller Methods:**
```typescript
// companies.controller.ts
@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  // Public routes
  @Get() @Public() listVerifiedCompanies(query: CompanyQueryDto): Promise<PaginatedResult<CompanyProfileDto>>;
  @Get(':id') @Public() getCompanyById(@Param('id') id: string): Promise<CompanyProfileDto>;

  // Company-owner routes
  @Post('register') registerCompany(@CurrentUser() user: JwtPayload, @Body() dto: RegisterCompanyDto): Promise<CompanyProfileDto>;
  @Get('my/company') getMyCompany(@CurrentUser() user: JwtPayload): Promise<CompanyProfileDto>;
  @Patch('my/company') updateMyCompany(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCompanyDto): Promise<CompanyProfileDto>;
  @Post('my/company/documents') submitDocument(@CurrentUser() user: JwtPayload, @Body() dto: SubmitDocumentDto): Promise<CompanyDocument>;

  // Admin routes
  @Get('admin/pending') @Roles(UserRole.ADMIN) listPendingCompanies(query: PaginationQueryDto): Promise<PaginatedResult<CompanyProfileDto>>;
  @Post(':id/approve') @Roles(UserRole.ADMIN) approveCompany(@Param('id') id: string): Promise<CompanyProfileDto>;
  @Post(':id/reject') @Roles(UserRole.ADMIN) rejectCompany(@Param('id') id: string, @Body() dto: RejectCompanyDto): Promise<CompanyProfileDto>;
  @Post(':id/suspend') @Roles(UserRole.ADMIN) suspendCompany(@Param('id') id: string, @Body() dto: SuspendCompanyDto): Promise<CompanyProfileDto>;
}
```

**Service Methods:**
```typescript
// companies.service.ts
export class CompaniesService {
  constructor(
    private readonly companiesRepository: CompaniesRepository,
    private readonly documentsRepository: CompanyDocumentsRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async registerCompany(userId: string, dto: RegisterCompanyDto): Promise<Company>;
  async updateCompany(companyId: string, dto: UpdateCompanyDto): Promise<Company>;
  async findById(companyId: string): Promise<Company | null>;
  async findByOwnerId(ownerId: string): Promise<Company | null>;
  async findVerifiedCompanies(filters: CompanyFilters): Promise<Company[]>;
  async submitDocument(companyId: string, dto: SubmitDocumentDto): Promise<CompanyDocument>;
  async approveCompany(companyId: string, adminId: string): Promise<Company>;
  async rejectCompany(companyId: string, adminId: string, reason: string): Promise<Company>;
  async suspendCompany(companyId: string, adminId: string, reason: string): Promise<Company>;
  async activateCompany(companyId: string): Promise<Company>;
  async getCompanyDocuments(companyId: string): Promise<CompanyDocument[]>;
}
```

**Entities Owned:**
- `Company` → table `companies`
- `CompanyDocument` → table `company_documents`

**Key DTOs:**
```typescript
export class RegisterCompanyDto {
  @IsString() name: string;
  @IsString() @Length(2, 2) countryCode: string;
  @IsString() city: string;
  @IsString() zipCode: string;
  @IsString() streetAddress: string;
  @IsString() @Length(10, 20) tradeRegistrationNumber: string;
  @IsString() contactPhone: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() website?: string;
}

export class UpdateCompanyDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() serviceArea?: string; // GeoJSON or simplified
}

export class SubmitDocumentDto {
  @IsEnum(DocumentType) documentType: DocumentType;
  @IsUrl() documentUrl: string;
  @IsOptional() @IsString() fileName?: string;
}

export class RejectCompanyDto {
  @IsString() reason: string;
}

export class SuspendCompanyDto {
  @IsString() reason: string;
}
```

**Module Dependencies:**
- `UsersModule` (link company to owner user)
- `NotificationsModule` (notify on approval/rejection)

---

### 4. MoveRequestsModule

**Purpose:**  
Manages the full lifecycle of a move request: creation from customer input, inventory attachment, company targeting, status transitions (`draft` → `pending_offers` → `offers_received` → `accepted` → `completed`), and move detail persistence.

**Folder Contents:**
```
move-requests/
├── move-requests.module.ts
├── move-requests.controller.ts
├── move-requests.service.ts
├── move-requests.repository.ts
├── entities/
│   └── move-request.entity.ts
├── dto/
│   ├── create-move-request.dto.ts
│   ├── update-move-request.dto.ts
│   ├── move-details.dto.ts
│   └── request-offers.dto.ts
└── interfaces/
    └── move-request-status.interface.ts
```

**Controller Methods:**
```typescript
// move-requests.controller.ts
@Controller('move-requests')
@UseGuards(JwtAuthGuard)
export class MoveRequestsController {
  @Post() createMoveRequest(@CurrentUser() user: JwtPayload, @Body() dto: CreateMoveRequestDto): Promise<MoveRequestDto>;
  @Get() listMyMoveRequests(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto): Promise<PaginatedResult<MoveRequestDto>>;
  @Get(':id') getMoveRequestById(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<MoveRequestDetailDto>;
  @Patch(':id') updateMoveRequest(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateMoveRequestDto): Promise<MoveRequestDto>;
  @Post(':id/request-offers') requestOffers(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: RequestOffersDto): Promise<MoveRequestDto>;
  @Post(':id/accept-offer') acceptOffer(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: AcceptOfferDto): Promise<MoveRequestDto>;
  @Post(':id/cancel') cancelMoveRequest(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<MoveRequestDto>;

  // Company view
  @Get('company/incoming') @Roles(UserRole.COMPANY) getIncomingRequests(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto): Promise<PaginatedResult<MoveRequestDto>>;
}
```

**Service Methods:**
```typescript
// move-requests.service.ts
export class MoveRequestsService {
  constructor(
    private readonly moveRequestsRepository: MoveRequestsRepository,
    private readonly inventoryService: InventoryService,
    private readonly availabilityService: AvailabilityService,
    private readonly pricingEngineService: PricingEngineService,
    private readonly offersService: OffersService,
    private readonly videosService: VideosService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createMoveRequest(userId: string, dto: CreateMoveRequestDto): Promise<MoveRequest>;
  async updateMoveRequest(requestId: string, userId: string, dto: UpdateMoveRequestDto): Promise<MoveRequest>;
  async findById(requestId: string): Promise<MoveRequest | null>;
  async findByUserId(userId: string, query: PaginationQueryDto): Promise<PaginatedResult<MoveRequest>>;
  async findIncomingForCompany(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<MoveRequest>>;
  async attachInventory(requestId: string, inventoryId: string): Promise<MoveRequest>;
  async attachAiAnalysis(requestId: string, analysisId: string): Promise<MoveRequest>;
  async attachVideo(requestId: string, videoId: string): Promise<MoveRequest>;
  async requestOffers(requestId: string, userId: string, dto: RequestOffersDto): Promise<MoveRequest>;
  async getAvailableCompaniesForRequest(requestId: string): Promise<Company[]>;
  async acceptOffer(requestId: string, userId: string, offerId: string): Promise<MoveRequest>;
  async cancelRequest(requestId: string, userId: string): Promise<MoveRequest>;
  async completeMove(requestId: string, companyId: string): Promise<MoveRequest>;
  async autoRequestToAvailableCompanies(requestId: string): Promise<void>;
}
```

**Entities Owned:**
- `MoveRequest` → table `move_requests`

**Key DTOs:**
```typescript
export class CreateMoveRequestDto {
  @IsString() fromAddress: string;
  @IsString() toAddress: string;
  @IsDateString() moveDate: string;
  @IsOptional() @IsString() fromFloor?: string;
  @IsOptional() @IsString() toFloor?: string;
  @IsOptional() @IsBoolean() fromElevator?: boolean;
  @IsOptional() @IsBoolean() toElevator?: boolean;
  @IsOptional() @IsBoolean() fromParkingAvailable?: boolean;
  @IsOptional() @IsBoolean() toParkingAvailable?: boolean;
  @IsOptional() @IsNumber() distanceToTruckMeters?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() serviceAddons?: string[];
  @IsOptional() @IsEnum(RequestMode) mode?: RequestMode; // marketplace | saas
}

export class UpdateMoveRequestDto {
  @IsOptional() @IsString() fromAddress?: string;
  @IsOptional() @IsString() toAddress?: string;
  @IsOptional() @IsDateString() moveDate?: string;
  @IsOptional() @IsString() fromFloor?: string;
  @IsOptional() @IsString() toFloor?: string;
  @IsOptional() @IsBoolean() fromElevator?: boolean;
  @IsOptional() @IsBoolean() toElevator?: boolean;
  @IsOptional() @IsNumber() distanceToTruckMeters?: number;
  @IsOptional() @IsString() notes?: string;
}

export class RequestOffersDto {
  @IsArray() @IsUUID('4', { each: true }) companyIds: string[];
  @IsOptional() @IsString() message?: string;
}

export class AcceptOfferDto {
  @IsUUID() offerId: string;
}
```

**Module Dependencies:**
- `UsersModule` (ownership validation)
- `InventoryModule` (attach inventory)
- `AvailabilityModule` (filter available companies)
- `PricingModule` (pre-calculation)
- `OffersModule` (offer acceptance)
- `VideosModule` (attach video)
- `NotificationsModule` (notify companies)

---

### 5. InventoryModule

**Purpose:**  
Stores AI-analyzed and user-edited inventories. Receives `detected_items[]` from the AI service, persists them with confidence scores, and allows customers to add/remove/edit items. Volumes and weights aggregate to feed the pricing engine.

**Folder Contents:**
```
inventory/
├── inventory.module.ts
├── inventory.controller.ts
├── inventory.service.ts
├── inventory.repository.ts
├── entities/
│   ├── inventory-item.entity.ts
│   └── ai-analysis.entity.ts
├── dto/
│   ├── add-inventory-item.dto.ts
│   ├── update-inventory-item.dto.ts
│   ├── ai-result.dto.ts
│   └── bulk-edit-inventory.dto.ts
└── interfaces/
    └── detected-item.interface.ts
```

**Controller Methods:**
```typescript
// inventory.controller.ts
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  @Post() createInventoryFromAi(@CurrentUser() user: JwtPayload, @Body() dto: AiResultDto): Promise<InventoryDto>;
  @Get(':id') getInventory(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<InventoryDetailDto>;
  @Post(':id/items') addItem(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: AddInventoryItemDto): Promise<InventoryItem>;
  @Patch(':id/items/:itemId') updateItem(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Param('itemId') itemId: string, @Body() dto: UpdateInventoryItemDto): Promise<InventoryItem>;
  @Delete(':id/items/:itemId') removeItem(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Param('itemId') itemId: string): Promise<void>;
  @Post(':id/bulk-edit') bulkEditItems(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: BulkEditInventoryDto): Promise<InventoryDto>;
}
```

**Service Methods:**
```typescript
// inventory.service.ts
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async createFromAiResult(userId: string, videoId: string, dto: AiResultDto): Promise<Inventory>;
  async addItem(inventoryId: string, dto: AddInventoryItemDto): Promise<InventoryItem>;
  async updateItem(itemId: string, dto: UpdateInventoryItemDto): Promise<InventoryItem>;
  async removeItem(itemId: string): Promise<void>;
  async bulkEdit(inventoryId: string, dto: BulkEditInventoryDto): Promise<Inventory>;
  async findById(inventoryId: string): Promise<Inventory | null>;
  async findByMoveRequestId(moveRequestId: string): Promise<Inventory | null>;
  async getAggregatedVolume(inventoryId: string): Promise<number>; // m³
  async getAggregatedWeight(inventoryId: string): Promise<number>; // kg
  async getItemCount(inventoryId: string): Promise<number>;
  async deleteInventory(inventoryId: string): Promise<void>;
}
```

**Entities Owned:**
- `InventoryItem` → table `inventory_items`
- `AiAnalysis` → table `ai_analyses`

**Key DTOs:**
```typescript
export class DetectedItemDto {
  @IsString() name: string;
  @IsNumber() volumeCubicMeters: number;
  @IsNumber() estimatedWeightKg: number;
  @IsNumber() @Min(0) @Max(1) confidenceScore: number;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() quantity?: number;
}

export class AiResultDto {
  @IsUUID() videoId: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => DetectedItemDto) detectedItems: DetectedItemDto[];
  @IsNumber() totalVolumeCubicMeters: number;
  @IsNumber() totalEstimatedWeightKg: number;
  @IsNumber() @Min(0) @Max(1) overallConfidence: number;
}

export class AddInventoryItemDto {
  @IsString() name: string;
  @IsNumber() volumeCubicMeters: number;
  @IsNumber() estimatedWeightKg: number;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsInt() @Min(1) quantity?: number;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateInventoryItemDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() volumeCubicMeters?: number;
  @IsOptional() @IsNumber() estimatedWeightKg?: number;
  @IsOptional() @IsInt() @Min(1) quantity?: number;
  @IsOptional() @IsString() notes?: string;
}

export class BulkEditInventoryDto {
  @IsArray() @ValidateNested({ each: true }) items: UpdateInventoryItemDto[];
}
```

**Module Dependencies:**
- `VideosModule` (link to source video)

---

### 6. VideosModule

**Purpose:**  
Manages S3 upload lifecycle: presigned URL generation, upload confirmation, metadata tracking, and GDPR-compliant auto-deletion after offer finalization. Videos are temporary by design — accessible only during the offer phase.

**Folder Contents:**
```
videos/
├── videos.module.ts
├── videos.controller.ts
├── videos.service.ts
├── videos.repository.ts
├── video-lifecycle.service.ts
├── entities/
│   └── video.entity.ts
├── dto/
│   ├── initiate-upload.dto.ts
│   ├── confirm-upload.dto.ts
│   └── video-metadata.dto.ts
└── interfaces/
    └── presigned-url.interface.ts
```

**Controller Methods:**
```typescript
// videos.controller.ts
@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideosController {
  @Post('upload-url') initiateUpload(@CurrentUser() user: JwtPayload, @Body() dto: InitiateUploadDto): Promise<PresignedUrlResponse>;
  @Post('confirm') confirmUpload(@CurrentUser() user: JwtPayload, @Body() dto: ConfirmUploadDto): Promise<VideoDto>;
  @Get(':id') getVideoMetadata(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<VideoDto>;
  @Get(':id/stream') getVideoStreamUrl(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<{ streamUrl: string }>;
  @Delete(':id') deleteVideo(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void>;
}
```

**Service Methods:**
```typescript
// videos.service.ts
export class VideosService {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly s3Service: S3Service,
  ) {}

  async generatePresignedUploadUrl(userId: string, dto: InitiateUploadDto): Promise<PresignedUrlResponse>;
  async confirmUpload(userId: string, dto: ConfirmUploadDto): Promise<Video>;
  async findById(videoId: string): Promise<Video | null>;
  async generatePresignedViewUrl(videoId: string, expirySeconds?: number): Promise<string>;
  async markForDeletion(videoId: string): Promise<Video>;
  async deleteVideo(videoId: string): Promise<void>;
}

// video-lifecycle.service.ts
export class VideoLifecycleService {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly s3Service: S3Service,
    private readonly notificationsService: NotificationsService,
  ) {}

  async scheduleAutoDeletion(videoId: string, deleteAt: Date): Promise<void>;
  async processExpiredDeletions(): Promise<number>; // cron job — returns deleted count
  async immediateDeleteAfterOfferFinalized(moveRequestId: string): Promise<void>;
  async enforceRetentionPolicy(): Promise<void>;
  async logAccess(videoId: string, accessorId: string, accessorRole: UserRole): Promise<void>;
}
```

**Entities Owned:**
- `Video` → table `videos`

**Key DTOs:**
```typescript
export class InitiateUploadDto {
  @IsString() fileName: string;
  @IsString() mimeType: string;
  @IsNumber() fileSizeBytes: number;
}

export class ConfirmUploadDto {
  @IsUUID() videoId: string;
  @IsString() s3Key: string;
  @IsString() eTag: string;
  @IsNumber() fileSizeBytes: number;
  @IsNumber() durationSeconds?: number;
}

export class VideoMetadataDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
}
```

**Module Dependencies:**
- `Shared/S3Service` (AWS S3 operations)
- `NotificationsModule` (retention warnings)

---

### 7. PricingModule

**Purpose:**  
Stores and executes pricing calculations. Each company configures `PricingRule` (base fee, per-km, per-hour, team size). The `PricingEngineService` computes estimates given a move request + inventory. Supports both company-adjusted pricing and a future auto-fixed mode.

**Folder Contents:**
```
pricing/
├── pricing.module.ts
├── pricing.controller.ts
├── pricing.service.ts
├── pricing-engine.service.ts
├── pricing-rules.repository.ts
├── entities/
│   ├── pricing-rule.entity.ts
│   └── service-addon.entity.ts
├── dto/
│   ├── create-pricing-rule.dto.ts
│   ├── update-pricing-rule.dto.ts
│   ├── calculate-estimate.dto.ts
│   └── service-addon.dto.ts
└── interfaces/
    └── pricing-calculation.interface.ts
```

**Controller Methods:**
```typescript
// pricing.controller.ts
@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class PricingController {
  // Company routes
  @Get('my/rules') @Roles(UserRole.COMPANY) getMyPricingRules(@CurrentUser() user: JwtPayload): Promise<PricingRuleDto>;
  @Post('my/rules') @Roles(UserRole.COMPANY) createPricingRule(@CurrentUser() user: JwtPayload, @Body() dto: CreatePricingRuleDto): Promise<PricingRuleDto>;
  @Patch('my/rules') @Roles(UserRole.COMPANY) updatePricingRule(@CurrentUser() user: JwtPayload, @Body() dto: UpdatePricingRuleDto): Promise<PricingRuleDto>;
  @Get('my/addons') @Roles(UserRole.COMPANY) getMyAddons(@CurrentUser() user: JwtPayload): Promise<ServiceAddonDto[]>;
  @Post('my/addons') @Roles(UserRole.COMPANY) createAddon(@CurrentUser() user: JwtPayload, @Body() dto: CreateServiceAddonDto): Promise<ServiceAddonDto>;

  // Estimate route (customer)
  @Post('estimate') calculateEstimate(@Body() dto: CalculateEstimateDto): Promise<EstimateResponseDto>;
}
```

**Service Methods:**
```typescript
// pricing.service.ts
export class PricingService {
  constructor(
    private readonly pricingRulesRepository: PricingRulesRepository,
    private readonly pricingEngineService: PricingEngineService,
  ) {}

  async createPricingRule(companyId: string, dto: CreatePricingRuleDto): Promise<PricingRule>;
  async updatePricingRule(companyId: string, dto: UpdatePricingRuleDto): Promise<PricingRule>;
  async getPricingRuleByCompanyId(companyId: string): Promise<PricingRule | null>;
  async createServiceAddon(companyId: string, dto: CreateServiceAddonDto): Promise<ServiceAddon>;
  async updateServiceAddon(addonId: string, dto: UpdateServiceAddonDto): Promise<ServiceAddon>;
  async deleteServiceAddon(addonId: string): Promise<void>;
  async listServiceAddons(companyId: string): Promise<ServiceAddon[]>;
  async getEstimate(companyId: string, moveRequestId: string): Promise<PricingCalculationResult>;
  async getEstimateFromDto(dto: CalculateEstimateDto): Promise<PricingCalculationResult>;
}
```

**Entities Owned:**
- `PricingRule` → table `pricing_rules`
- `ServiceAddon` → table `service_addons`

**Key DTOs:**
```typescript
export class CreatePricingRuleDto {
  @IsNumber() baseFee: number;
  @IsNumber() pricePerHour: number;
  @IsNumber() pricePerKm: number;
  @IsInt() teamSize: number;
  @IsOptional() @IsNumber() minimumHours?: number;
  @IsOptional() @IsNumber() minimumFee?: number;
  @IsOptional() @IsString() currency: string = 'EUR';
}

export class UpdatePricingRuleDto {
  @IsOptional() @IsNumber() baseFee?: number;
  @IsOptional() @IsNumber() pricePerHour?: number;
  @IsOptional() @IsNumber() pricePerKm?: number;
  @IsOptional() @IsInt() teamSize?: number;
  @IsOptional() @IsNumber() minimumHours?: number;
  @IsOptional() @IsNumber() minimumFee?: number;
}

export class CreateServiceAddonDto {
  @IsString() name: string;
  @IsNumber() price: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isPerHour?: boolean;
}

export class UpdateServiceAddonDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsString() description?: string;
}

export class CalculateEstimateDto {
  @IsUUID() companyId: string;
  @IsUUID() moveRequestId: string;
  @IsOptional() @IsArray() addonIds?: string[];
}
```

**Module Dependencies:**
- `CompaniesModule` (validate company ownership)
- `MoveRequestsModule` (read move details for estimate)
- `InventoryModule` (read aggregated volume/weight for estimate)

---

### 8. OffersModule

**Purpose:**  
Manages offer lifecycle: creation by companies in response to move requests, editing/finalizing prices and services, customer acceptance, and post-acceptance video deletion trigger. The core marketplace transaction entity.

**Folder Contents:**
```
offers/
├── offers.module.ts
├── offers.controller.ts
├── offers.service.ts
├── offers.repository.ts
├── entities/
│   └── offer.entity.ts
├── dto/
│   ├── create-offer.dto.ts
│   ├── update-offer.dto.ts
│   ├── finalize-offer.dto.ts
│   └── respond-to-offer.dto.ts
└── interfaces/
    └── offer-status.interface.ts
```

**Controller Methods:**
```typescript
// offers.controller.ts
@Controller('offers')
@UseGuards(JwtAuthGuard)
export class OffersController {
  // Company routes
  @Post() @Roles(UserRole.COMPANY) createOffer(@CurrentUser() user: JwtPayload, @Body() dto: CreateOfferDto): Promise<OfferDto>;
  @Get('company') @Roles(UserRole.COMPANY) getCompanyOffers(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto): Promise<PaginatedResult<OfferDto>>;
  @Patch(':id') @Roles(UserRole.COMPANY) updateOffer(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateOfferDto): Promise<OfferDto>;
  @Post(':id/finalize') @Roles(UserRole.COMPANY) finalizeOffer(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: FinalizeOfferDto): Promise<OfferDto>;
  @Post(':id/withdraw') @Roles(UserRole.COMPANY) withdrawOffer(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<OfferDto>;

  // Customer routes
  @Get('my') getMyOffers(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto): Promise<PaginatedResult<OfferDto>>;
  @Get(':id') getOfferById(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<OfferDetailDto>;
  @Post(':id/accept') acceptOffer(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<MoveRequestDto>;
  @Post(':id/reject') rejectOffer(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<OfferDto>;
}
```

**Service Methods:**
```typescript
// offers.service.ts
export class OffersService {
  constructor(
    private readonly offersRepository: OffersRepository,
    private readonly pricingEngineService: PricingEngineService,
    private readonly pricingService: PricingService,
    private readonly videoLifecycleService: VideoLifecycleService,
    private readonly moveRequestsService: MoveRequestsService,
    private readonly notificationsService: NotificationsService,
    private readonly commissionsService: CommissionsService,
  ) {}

  async createOffer(companyId: string, dto: CreateOfferDto): Promise<Offer>;
  async updateOffer(offerId: string, companyId: string, dto: UpdateOfferDto): Promise<Offer>;
  async finalizeOffer(offerId: string, companyId: string, dto: FinalizeOfferDto): Promise<Offer>;
  async withdrawOffer(offerId: string, companyId: string): Promise<Offer>;
  async findById(offerId: string): Promise<Offer | null>;
  async findByMoveRequestId(moveRequestId: string): Promise<Offer[]>;
  async findByCompanyId(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Offer>>;
  async findByCustomerId(customerId: string, query: PaginationQueryDto): Promise<PaginatedResult<Offer>>;
  async acceptOffer(offerId: string, customerId: string): Promise<MoveRequest>;
  async rejectOffer(offerId: string, customerId: string): Promise<Offer>;
  async getOfferDetail(offerId: string): Promise<OfferDetail>;
  async getBestOfferForRequest(moveRequestId: string): Promise<Offer | null>;
}
```

**Entities Owned:**
- `Offer` → table `offers`

**Key DTOs:**
```typescript
export class CreateOfferDto {
  @IsUUID() moveRequestId: string;
  @IsNumber() estimatedPrice: number;
  @IsOptional() @IsNumber() finalPrice?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @IsUUID('4', { each: true }) includedAddonIds?: string[];
  @IsOptional() @IsDateString() validUntil?: string;
}

export class UpdateOfferDto {
  @IsOptional() @IsNumber() estimatedPrice?: number;
  @IsOptional() @IsNumber() finalPrice?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @IsUUID('4', { each: true }) includedAddonIds?: string[];
  @IsOptional() @IsDateString() validUntil?: string;
}

export class FinalizeOfferDto {
  @IsNumber() finalPrice: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() @IsUUID('4', { each: true }) includedAddonIds?: string[];
}
```

**Module Dependencies:**
- `PricingModule` (calculate/validate prices)
- `MoveRequestsModule` (status transitions)
- `VideosModule` (trigger auto-delete on finalize)
- `CommissionsModule` (pre-calculate commission on acceptance)
- `NotificationsModule` (notify customer on new/finalized offer)

---

### 9. AvailabilityModule

**Purpose:**  
Team and calendar management. Companies define teams, each team has daily capacity (number of moves or total hours). The system checks availability for a given date, allocates capacity when an offer is accepted, and supports parallel jobs (multiple moves per day per team if within capacity).

**Folder Contents:**
```
availability/
├── availability.module.ts
├── availability.controller.ts
├── availability.service.ts
├── availability.repository.ts
├── team-capacity.service.ts
├── entities/
│   ├── availability-slot.entity.ts
│   └── team.entity.ts
├── dto/
│   ├── create-team.dto.ts
│   ├── update-team.dto.ts
│   ├── set-availability.dto.ts
│   ├── check-availability.dto.ts
│   └── allocate-capacity.dto.ts
└── interfaces/
    └── capacity-check.interface.ts
```

**Controller Methods:**
```typescript
// availability.controller.ts
@Controller('availability')
@UseGuards(JwtAuthGuard)
export class AvailabilityController {
  // Team management (company)
  @Post('teams') @Roles(UserRole.COMPANY) createTeam(@CurrentUser() user: JwtPayload, @Body() dto: CreateTeamDto): Promise<TeamDto>;
  @Get('teams') @Roles(UserRole.COMPANY) getMyTeams(@CurrentUser() user: JwtPayload): Promise<TeamDto[]>;
  @Patch('teams/:id') @Roles(UserRole.COMPANY) updateTeam(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateTeamDto): Promise<TeamDto>;
  @Delete('teams/:id') @Roles(UserRole.COMPANY) deleteTeam(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void>;

  // Availability slots (company)
  @Post('slots') @Roles(UserRole.COMPANY) setAvailability(@CurrentUser() user: JwtPayload, @Body() dto: SetAvailabilityDto): Promise<AvailabilitySlotDto>;
  @Get('slots') @Roles(UserRole.COMPANY) getMySlots(@CurrentUser() user: JwtPayload, @Query() query: DateRangeQueryDto): Promise<AvailabilitySlotDto[]>;
  @Delete('slots/:id') @Roles(UserRole.COMPANY) removeSlot(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void>;

  // Customer/public check
  @Post('check') @Public() checkAvailability(@Body() dto: CheckAvailabilityDto): Promise<AvailabilityCheckResponse>;
}
```

**Service Methods:**
```typescript
// availability.service.ts
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly teamCapacityService: TeamCapacityService,
  ) {}

  async createTeam(companyId: string, dto: CreateTeamDto): Promise<Team>;
  async updateTeam(teamId: string, dto: UpdateTeamDto): Promise<Team>;
  async deleteTeam(teamId: string): Promise<void>;
  async findTeamsByCompanyId(companyId: string): Promise<Team[]>;
  async findTeamById(teamId: string): Promise<Team | null>;
  async setAvailabilitySlot(companyId: string, dto: SetAvailabilityDto): Promise<AvailabilitySlot>;
  async getSlotsForCompany(companyId: string, dateRange: DateRange): Promise<AvailabilitySlot[]>;
  async removeSlot(slotId: string): Promise<void>;
  async checkAvailabilityForRequest(moveRequestId: string): Promise<CompanyAvailability[]>;
  async getAvailableCompaniesForDate(moveDate: Date, filters?: CompanyFilters): Promise<Company[]>;
}

// team-capacity.service.ts
export class TeamCapacityService {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  async allocateCapacity(moveRequestId: string, teamId: string, date: Date, estimatedHours: number): Promise<AvailabilitySlot>;
  async releaseCapacity(moveRequestId: string): Promise<void>;
  async getRemainingCapacity(teamId: string, date: Date): Promise<number>; // hours or moves
  async canTeamHandleJob(teamId: string, date: Date, estimatedHours: number): Promise<boolean>;
  async getParallelJobCount(teamId: string, date: Date): Promise<number>;
  async getTeamSchedule(teamId: string, dateRange: DateRange): Promise<ScheduledJob[]>;
  async reallocateAfterCancellation(moveRequestId: string): Promise<void>;
}
```

**Entities Owned:**
- `Team` → table `teams`
- `AvailabilitySlot` → table `availability_slots`

**Key DTOs:**
```typescript
export class CreateTeamDto {
  @IsString() name: string;
  @IsInt() @Min(1) capacityPerDay: number; // number of parallel moves or hours
  @IsEnum(CapacityUnit) capacityUnit: CapacityUnit; // 'moves' | 'hours'
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateTeamDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsInt() @Min(1) capacityPerDay?: number;
  @IsOptional() @IsEnum(CapacityUnit) capacityUnit?: CapacityUnit;
  @IsOptional() @IsString() color?: string;
}

export class SetAvailabilityDto {
  @IsUUID() teamId: string;
  @IsDateString() date: string;
  @IsInt() @Min(0) maxJobs: number;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
  @IsOptional() @IsString() notes?: string;
}

export class CheckAvailabilityDto {
  @IsDateString() moveDate: string;
  @IsOptional() @IsUUID() companyId?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() zipCode?: string;
}
```

**Module Dependencies:**
- `CompaniesModule` (validate company)
- `MoveRequestsModule` (read move date and duration estimate)

---

### 10. ReviewsModule

**Purpose:**  
Post-move rating and review system. Customers rate companies after a completed move. Reviews feed into company reputation scores and dynamic commission rates. Admins can monitor and moderate reviews.

**Folder Contents:**
```
reviews/
├── reviews.module.ts
├── reviews.controller.ts
├── reviews.service.ts
├── reviews.repository.ts
├── entities/
│   └── review.entity.ts
├── dto/
│   ├── create-review.dto.ts
│   └── update-review.dto.ts
└── interfaces/
    └── review-summary.interface.ts
```

**Controller Methods:**
```typescript
// reviews.controller.ts
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  @Post() createReview(@CurrentUser() user: JwtPayload, @Body() dto: CreateReviewDto): Promise<ReviewDto>;
  @Get('my') getMyReviews(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto): Promise<PaginatedResult<ReviewDto>>;
  @Get('company/:companyId') @Public() getCompanyReviews(@Param('companyId') companyId: string, @Query() query: PaginationQueryDto): Promise<PaginatedResult<ReviewDto>>;
  @Get('company/:companyId/summary') @Public() getCompanyReviewSummary(@Param('companyId') companyId: string): Promise<ReviewSummaryDto>;
  @Patch(':id') updateReview(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateReviewDto): Promise<ReviewDto>;
  @Delete(':id') deleteReview(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void>;

  // Admin
  @Get('admin/all') @Roles(UserRole.ADMIN) getAllReviews(@Query() query: PaginationQueryDto): Promise<PaginatedResult<ReviewDto>>;
  @Post(':id/moderate') @Roles(UserRole.ADMIN) moderateReview(@Param('id') id: string, @Body() dto: ModerateReviewDto): Promise<ReviewDto>;
}
```

**Service Methods:**
```typescript
// reviews.service.ts
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly companiesService: CompaniesService,
    private readonly commissionsService: CommissionsService,
  ) {}

  async createReview(customerId: string, dto: CreateReviewDto): Promise<Review>;
  async updateReview(reviewId: string, customerId: string, dto: UpdateReviewDto): Promise<Review>;
  async deleteReview(reviewId: string, customerId: string): Promise<void>;
  async findById(reviewId: string): Promise<Review | null>;
  async findByCompanyId(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Review>>;
  async findByCustomerId(customerId: string, query: PaginationQueryDto): Promise<PaginatedResult<Review>>;
  async getCompanyReviewSummary(companyId: string): Promise<ReviewSummary>;
  async moderateReview(reviewId: string, status: ReviewModerationStatus): Promise<Review>;
  async recalculateCompanyRating(companyId: string): Promise<number>;
  async isMoveReviewable(moveRequestId: string, customerId: string): Promise<boolean>;
}
```

**Entities Owned:**
- `Review` → table `reviews`

**Key DTOs:**
```typescript
export class CreateReviewDto {
  @IsUUID() moveRequestId: string;
  @IsUUID() companyId: string;
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsOptional() @IsString() @Length(10, 2000) comment?: string;
  @IsOptional() @IsBoolean() wouldRecommend?: boolean;
}

export class UpdateReviewDto {
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsString() @Length(10, 2000) comment?: string;
  @IsOptional() @IsBoolean() wouldRecommend?: boolean;
}

export class ModerateReviewDto {
  @IsEnum(ReviewModerationStatus) status: ReviewModerationStatus; // 'approved' | 'rejected' | 'flagged'
  @IsOptional() @IsString() moderatorNotes?: string;
}
```

**Module Dependencies:**
- `UsersModule` (validate reviewer)
- `CompaniesModule` (target company)
- `MoveRequestsModule` (verify move completed)
- `CommissionsModule` (trigger recalculation on new review)

---

### 11. AdminModule

**Purpose:**  
Admin dashboard operations for point4Studio staff: company approvals/rejections, document verification, platform statistics, commission rate overrides, company suspensions, and global monitoring. This is a thin orchestration layer over other modules.

**Folder Contents:**
```
admin/
├── admin.module.ts
├── admin.controller.ts
├── admin.service.ts
├── admin.repository.ts
├── dashboard.service.ts
├── dto/
│   ├── approve-company.dto.ts
│   ├── suspend-company.dto.ts
│   ├── set-commission-rate.dto.ts
│   └── platform-stats-query.dto.ts
└── interfaces/
    └── platform-stats.interface.ts
```

**Controller Methods:**
```typescript
// admin.controller.ts
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  @Get('dashboard') getDashboardStats(@Query() query: PlatformStatsQueryDto): Promise<PlatformStatsDto>;
  @Get('companies/pending') getPendingCompanies(@Query() query: PaginationQueryDto): Promise<PaginatedResult<CompanyProfileDto>>;
  @Post('companies/:id/approve') approveCompany(@Param('id') id: string, @Body() dto: ApproveCompanyDto): Promise<CompanyProfileDto>;
  @Post('companies/:id/reject') rejectCompany(@Param('id') id: string, @Body() dto: RejectCompanyDto): Promise<CompanyProfileDto>;
  @Post('companies/:id/suspend') suspendCompany(@Param('id') id: string, @Body() dto: SuspendCompanyDto): Promise<CompanyProfileDto>;
  @Get('companies/:id/documents') getCompanyDocuments(@Param('id') id: string): Promise<CompanyDocument[]>;
  @Post('companies/:id/documents/:docId/verify') verifyDocument(@Param('id') id: string, @Param('docId') docId: string): Promise<CompanyDocument>;
  @Get('reviews/flagged') getFlaggedReviews(@Query() query: PaginationQueryDto): Promise<PaginatedResult<ReviewDto>>;
  @Get('commissions') getCommissionReport(@Query() query: CommissionQueryDto): Promise<CommissionReportDto>;
  @Post('commissions/global-rate') setGlobalCommissionRate(@Body() dto: SetCommissionRateDto): Promise<void>;
  @Get('users') getAllUsers(@Query() query: PaginationQueryDto): Promise<PaginatedResult<UserProfileDto>>;
  @Get('move-requests') getAllMoveRequests(@Query() query: PaginationQueryDto): Promise<PaginatedResult<MoveRequestDto>>;
  @Get('analytics') getAnalytics(@Query() query: AnalyticsQueryDto): Promise<AnalyticsDto>;
}
```

**Service Methods:**
```typescript
// admin.service.ts
export class AdminService {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
    private readonly moveRequestsService: MoveRequestsService,
    private readonly reviewsService: ReviewsService,
    private readonly commissionsService: CommissionsService,
    private readonly dashboardService: DashboardService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getDashboardStats(query: PlatformStatsQueryDto): Promise<PlatformStats>;
  async approveCompany(companyId: string, adminId: string, dto: ApproveCompanyDto): Promise<Company>;
  async rejectCompany(companyId: string, adminId: string, dto: RejectCompanyDto): Promise<Company>;
  async suspendCompany(companyId: string, adminId: string, dto: SuspendCompanyDto): Promise<Company>;
  async verifyDocument(companyId: string, documentId: string, adminId: string): Promise<CompanyDocument>;
  async getPendingCompanies(query: PaginationQueryDto): Promise<PaginatedResult<Company>>;
  async getFlaggedReviews(query: PaginationQueryDto): Promise<PaginatedResult<Review>>;
  async setGlobalCommissionRate(rate: number): Promise<void>;
  async getCommissionReport(query: CommissionQueryDto): Promise<CommissionReport>;
  async getAllUsers(query: PaginationQueryDto): Promise<PaginatedResult<User>>;
  async getAllMoveRequests(query: PaginationQueryDto): Promise<PaginatedResult<MoveRequest>>;
  async getAnalytics(query: AnalyticsQueryDto): Promise<Analytics>;
  async exportCompanyData(companyId: string): Promise<CompanyExport>;
  async exportPlatformReport(query: PlatformStatsQueryDto): Promise<Buffer>;
}

// dashboard.service.ts
export class DashboardService {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly moveRequestsService: MoveRequestsService,
    private readonly offersService: OffersService,
    private readonly commissionsService: CommissionsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  async getOverviewStats(dateRange: DateRange): Promise<PlatformOverviewStats>;
  async getRevenueStats(dateRange: DateRange): Promise<RevenueStats>;
  async getCompanyGrowthStats(dateRange: DateRange): Promise<CompanyGrowthStats>;
  async getRequestConversionStats(dateRange: DateRange): Promise<RequestConversionStats>;
  async getTopCompaniesByRevenue(dateRange: DateRange, limit: number): Promise<CompanyRevenueRank[]>;
  async getGeographicDistribution(): Promise<GeoDistribution[]>;
}
```

**Entities Owned:** *(none — aggregates from other modules)*

**Key DTOs:**
```typescript
export class ApproveCompanyDto {
  @IsOptional() @IsString() adminNotes?: string;
}

export class PlatformStatsQueryDto {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsEnum(StatsPeriod) period?: StatsPeriod; // 'day' | 'week' | 'month' | 'year'
}

export class SetCommissionRateDto {
  @IsNumber() @Min(0) @Max(100) ratePercent: number;
  @IsOptional() @IsEnum(CommissionType) type?: CommissionType;
}

export class AnalyticsQueryDto {
  @IsDateString() from: string;
  @IsDateString() to: string;
  @IsOptional() @IsEnum(AnalyticsDimension) dimension?: AnalyticsDimension;
}
```

**Module Dependencies:**
- `UsersModule`
- `CompaniesModule`
- `MoveRequestsModule`
- `OffersModule`
- `ReviewsModule`
- `CommissionsModule`
- `NotificationsModule`

---

### 12. NotificationsModule

**Purpose:**  
Abstracted notification delivery layer. Supports email (SendGrid/Postmark), push (Firebase), and in-app channels. Templates are channel-agnostic data bags. Other modules call `NotificationsService.send()` without knowing the delivery mechanism.

**Folder Contents:**
```
notifications/
├── notifications.module.ts
├── notifications.controller.ts
├── notifications.service.ts
├── notifications.repository.ts
├── notification-drivers/
│   ├── email.driver.ts
│   ├── push.driver.ts
│   └── in-app.driver.ts
├── entities/
│   └── notification.entity.ts
├── dto/
│   ├── send-notification.dto.ts
│   └── notification-preferences.dto.ts
└── interfaces/
    └── notification-channel.interface.ts
```

**Controller Methods:**
```typescript
// notifications.controller.ts
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  @Get() getMyNotifications(@CurrentUser() user: JwtPayload, @Query() query: PaginationQueryDto): Promise<PaginatedResult<NotificationDto>>;
  @Patch(':id/read') markAsRead(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<NotificationDto>;
  @Patch('read-all') markAllAsRead(@CurrentUser() user: JwtPayload): Promise<void>;
  @Get('preferences') getPreferences(@CurrentUser() user: JwtPayload): Promise<NotificationPreferencesDto>;
  @Patch('preferences') updatePreferences(@CurrentUser() user: JwtPayload, @Body() dto: NotificationPreferencesDto): Promise<NotificationPreferencesDto>;
  @Delete(':id') deleteNotification(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void>;
}
```

**Service Methods:**
```typescript
// notifications.service.ts
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly emailDriver: EmailDriver,
    private readonly pushDriver: PushDriver,
    private readonly inAppDriver: InAppDriver,
  ) {}

  async send(dto: SendNotificationDto): Promise<void>;
  async sendBulk(dtos: SendNotificationDto[]): Promise<BulkSendResult>;
  async schedule(dto: SendNotificationDto, sendAt: Date): Promise<ScheduledNotification>;
  async getUserNotifications(userId: string, query: PaginationQueryDto): Promise<PaginatedResult<Notification>>;
  async markAsRead(notificationId: string): Promise<Notification>;
  async markAllAsRead(userId: string): Promise<void>;
  async getUnreadCount(userId: string): Promise<number>;
  async getPreferences(userId: string): Promise<NotificationPreferences>;
  async updatePreferences(userId: string, dto: NotificationPreferencesDto): Promise<NotificationPreferences>;
  async deleteNotification(notificationId: string): Promise<void>;
  async registerPushToken(userId: string, token: string, platform: string): Promise<void>;
  async unregisterPushToken(userId: string, token: string): Promise<void>;
}
```

**Entities Owned:**
- `Notification` → table `notifications`

**Key DTOs:**
```typescript
export class SendNotificationDto {
  @IsUUID() userId: string;
  @IsEnum(NotificationType) type: NotificationType;
  @IsString() title: string;
  @IsString() body: string;
  @IsOptional() @IsObject() payload?: Record<string, unknown>;
  @IsOptional() @IsArray() @IsEnum(NotificationChannel, { each: true }) channels?: NotificationChannel[];
  @IsOptional() @IsUUID() relatedEntityId?: string;
  @IsOptional() @IsString() relatedEntityType?: string;
}

export class NotificationPreferencesDto {
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @IsOptional() @IsBoolean() inAppEnabled?: boolean;
  @IsOptional() @IsArray() @IsEnum(NotificationType, { each: true }) mutedTypes?: NotificationType[];
}
```

**Module Dependencies:**
- `UsersModule` (recipient validation)

---

### 13. CommissionsModule

**Purpose:**  
Tracks platform commission per completed move. Supports dynamic commission rates based on company rating tiers (higher-rated companies pay lower commission). Admin can override rates globally or per-company.

**Folder Contents:**
```
commissions/
├── commissions.module.ts
├── commissions.controller.ts
├── commissions.service.ts
├── commissions.repository.ts
├── entities/
│   └── commission.entity.ts
├── dto/
│   ├── calculate-commission.dto.ts
│   └── commission-query.dto.ts
└── interfaces/
    └── commission-breakdown.interface.ts
```

**Controller Methods:**
```typescript
// commissions.controller.ts
@Controller('commissions')
@UseGuards(JwtAuthGuard)
export class CommissionsController {
  // Company view
  @Get('my') @Roles(UserRole.COMPANY) getMyCommissions(@CurrentUser() user: JwtPayload, @Query() query: CommissionQueryDto): Promise<PaginatedResult<CommissionDto>>;
  @Get('my/summary') @Roles(UserRole.COMPANY) getMyCommissionSummary(@CurrentUser() user: JwtPayload, @Query() query: DateRangeQueryDto): Promise<CommissionSummaryDto>;

  // Admin view
  @Get() @Roles(UserRole.ADMIN) getAllCommissions(@Query() query: CommissionQueryDto): Promise<PaginatedResult<CommissionDto>>;
  @Get('summary') @Roles(UserRole.ADMIN) getPlatformCommissionSummary(@Query() query: CommissionQueryDto): Promise<CommissionSummaryDto>;
  @Get(':id') @Roles(UserRole.ADMIN) getCommissionById(@Param('id') id: string): Promise<CommissionDetailDto>;
  @Patch(':id/rate') @Roles(UserRole.ADMIN) overrideCommissionRate(@Param('id') id: string, @Body() dto: OverrideCommissionRateDto): Promise<CommissionDto>;
}
```

**Service Methods:**
```typescript
// commissions.service.ts
export class CommissionsService {
  constructor(
    private readonly commissionsRepository: CommissionsRepository,
    private readonly companiesService: CompaniesService,
    private readonly reviewsService: ReviewsService,
  ) {}

  async calculateCommission(offerId: string, companyId: string, finalPrice: number): Promise<Commission>;
  async calculateDynamicRate(companyId: string): Promise<number>; // returns rate percent
  async getRateForCompany(companyId: string): Promise<number>;
  async recordCommission(moveRequestId: string, offerId: string, companyId: string, amount: number, ratePercent: number): Promise<Commission>;
  async findById(commissionId: string): Promise<Commission | null>;
  async findByCompanyId(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Commission>>;
  async findByMoveRequestId(moveRequestId: string): Promise<Commission | null>;
  async getCommissionSummary(companyId: string, dateRange: DateRange): Promise<CommissionSummary>;
  async getPlatformCommissionSummary(dateRange: DateRange): Promise<PlatformCommissionSummary>;
  async overrideRate(commissionId: string, newRatePercent: number, adminId: string, reason: string): Promise<Commission>;
  async getOutstandingCommissions(companyId: string): Promise<Commission[]>;
  async markAsPaid(commissionId: string, adminId: string): Promise<Commission>;
}
```

**Entities Owned:**
- `Commission` → table `commissions`

**Key DTOs:**
```typescript
export class CalculateCommissionDto {
  @IsUUID() offerId: string;
  @IsNumber() finalPrice: number;
}

export class CommissionQueryDto {
  @IsOptional() @IsUUID() companyId?: string;
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsEnum(CommissionStatus) status?: CommissionStatus;
  @IsOptional() @IsInt() page?: number;
  @IsOptional() @IsInt() limit?: number;
}

export class OverrideCommissionRateDto {
  @IsNumber() @Min(0) @Max(100) ratePercent: number;
  @IsString() reason: string;
}
```

**Module Dependencies:**
- `CompaniesModule` (company data for rate calculation)
- `ReviewsModule` (rating for dynamic rate)
- `OffersModule` (final price reference)

---

## Section 3 — Shared Infrastructure

### 3.1 JwtAuthGuard

```typescript
// shared/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: Error, user: unknown) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing authentication token');
    }
    return user;
  }
}
```

### 3.2 RolesGuard + @Roles() Decorator

```typescript
// shared/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// shared/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
```

### 3.3 CurrentUser Decorator

```typescript
// shared/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | unknown => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found in request context');
    }

    return data ? user[data] : user;
  },
);
```

### 3.4 Global Exception Filter

```typescript
// shared/filters/global-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  requestId: string;
  code?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string || crypto.randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      message = typeof responseBody === 'string' ? responseBody : (responseBody as { message?: string }).message || message;
      error = exception.name;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      error = 'Database Error';
      code = (exception as QueryFailedError & { code?: string }).code;
    }

    this.logger.error({
      requestId,
      status,
      message: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
      path: request.url,
      method: request.method,
    });

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
      code,
    };

    response.status(status).json(errorResponse);
  }
}
```

### 3.5 Logging Interceptor

```typescript
// shared/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const startTime = Date.now();

    this.logger.log(`→ ${method} ${url} | UA: ${userAgent}`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(`← ${method} ${url} | ${duration}ms`);
      }),
    );
  }
}
```

### 3.6 Validation Pipe Setup

```typescript
// shared/pipes/validation.pipe.ts
// Applied globally in main.ts:

import { ValidationPipe } from '@nestjs/common';

const globalValidationPipe = new ValidationPipe({
  whitelist: true,              // strip properties without decorators
  forbidNonWhitelisted: true,   // throw on non-whitelisted properties
  transform: true,              // auto-transform primitives
  transformOptions: {
    enableImplicitConversion: true,
  },
  disableErrorMessages: process.env.NODE_ENV === 'production',
});

// main.ts usage:
// app.useGlobalPipes(globalValidationPipe);
```

### 3.7 TypeORM Configuration for MySQL

```typescript
// shared/config/database.config.ts
import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const databaseConfig = registerAs('database', () => ({
  type: 'mysql' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'mymove',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mymove_production',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
  migrationsRun: process.env.NODE_ENV === 'production',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z',
}));

// typeorm.config.ts (CLI usage)
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['apps/api/src/**/*.entity{.ts,.js}'],
  migrations: ['apps/api/src/migrations/*{.ts,.js}'],
  logging: true,
});
```

### 3.8 S3 Service Abstraction

```typescript
// shared/services/s3.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUrlResult {
  uploadUrl: string;
  s3Key: string;
  expiresAt: Date;
}

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET')!;
  }

  async generatePresignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSeconds: number = 300,
  ): Promise<PresignedUrlResult>;

  async generatePresignedViewUrl(
    key: string,
    expiresInSeconds: number = 3600,
  ): Promise<string>;

  async deleteObject(key: string): Promise<void>;

  async getObjectStream(key: string): Promise<ReadableStream>;

  async copyObject(sourceKey: string, destinationKey: string): Promise<void>;

  buildS3Key(folder: string, entityId: string, fileName: string): string;
}
```

---

## Section 4 — Clean Architecture Layers

Each module in the MyMove backend follows a strict horizontal layering pattern. This ensures testability, separation of concerns, and future scalability (e.g., extracting a service into a microservice).

### Layer Definitions

| Layer | File | Responsibility | NestJS Role |
|-------|------|--------------|-------------|
| **HTTP / Transport** | `controller.ts` | Route definition, guards, decorators, DTO binding, HTTP status mapping | `@Controller()` class |
| **Business Logic** | `service.ts` | Orchestration, domain rules, transaction boundaries, cross-module coordination | `@Injectable()` class |
| **Data Access** | `repository.ts` | TypeORM query builder, custom repository pattern, raw SQL when needed | `@Injectable()` class (custom repo) |
| **Input Contracts** | `dto/*.ts` | Validation rules, transformation, API contract | Plain classes with `class-validator` decorators |
| **Persistence Models** | `entities/*.ts` | TypeORM entities, relations, indices, lifecycle hooks | `@Entity()` classes |
| **Internal Contracts** | `interfaces/*.ts` | Service-to-service types, return shapes, option bags | TypeScript `interface` |

### Module Internal Dependency Flow

```
Controller → Service → Repository → Entity → Database
    ↑           ↑
   DTO      Interface
```

### Controller Layer Rules
- **No business logic.** Controllers only validate input (via DTO + ValidationPipe), extract identity (`@CurrentUser()`), delegate to service, and map responses.
- **No direct repository access.** All data access goes through the service.
- **Guards at class or method level.** `JwtAuthGuard` for auth, `RolesGuard` for RBAC.

### Service Layer Rules
- **Single responsibility per service.** If a module has complex sub-domains (e.g., PricingModule has `PricingService` for CRUD + `PricingEngineService` for calculations), split into multiple services.
- **Transactional boundaries.** Use `dataSource.transaction()` or `@Transaction()` for multi-entity writes.
- **Cross-module communication via injected services only.** Never import a repository from another module.

### Repository Layer Rules
- **Custom repositories extend TypeORM patterns.** For NestJS 10 + TypeORM 0.3, use `Repository<Entity>` injected via `@InjectRepository()` or use a custom provider pattern.
- **Complex queries use QueryBuilder.** Simple lookups use `findOneBy()` / `find()`.
- **Pagination helper.** All list methods accept `{ page, limit, sort, order }` and return `{ data, meta: { total, page, limit, totalPages } }`.

### DTO Layer Rules
- **One DTO per operation.** `CreateXDto`, `UpdateXDto`, `QueryXDto`, `ResponseXDto`.
- **All fields decorated.** No undecorated fields pass through `whitelist: true`.
- **Nested DTOs use `@ValidateNested()` and `@Type()` from `class-transformer`.

### Entity Layer Rules
- **Naming:** PascalCase singular class, `snake_case` plural table via `@Entity('table_name')`.
- **Relations:** Use `lazy: true` or eager loading judiciously. Always define `onDelete` behavior.
- **Indices:** Add `@Index()` on all foreign keys and frequently queried columns.
- **Soft deletes:** Use `@DeleteDateColumn()` where business requires recoverability.

### Interface Layer Rules
- **Service return types.** Every public service method declares its return type as an interface or entity.
- **No implementation leakage.** Interfaces describe shape, not source.

---

## Section 5 — Key Business Logic Services

### 5.1 PricingEngineService

```typescript
// pricing/pricing-engine.service.ts
import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { MoveRequestsService } from '../move-requests/move-requests.service';
import { PricingRule } from './entities/pricing-rule.entity';
import { ServiceAddon } from './entities/service-addon.entity';

export interface PricingInput {
  inventoryVolumeCubicMeters: number;
  inventoryWeightKg: number;
  itemCount: number;
  estimatedDistanceKm: number;
  estimatedHours: number;
  floorsFrom: number;
  floorsTo: number;
  hasElevatorFrom: boolean;
  hasElevatorTo: boolean;
  parkingDistanceMeters: number;
  selectedAddonIds: string[];
}

export interface PricingBreakdown {
  baseFee: number;
  distanceCharge: number;
  timeEstimateCharge: number;
  floorSurcharge: number;
  elevatorDiscount: number;
  parkingSurcharge: number;
  addonsTotal: number;
  subtotal: number;
  platformCommission: number;
  grandTotal: number;
}

export interface PricingCalculationResult {
  companyId: string;
  moveRequestId: string;
  estimatedPrice: number;
  breakdown: PricingBreakdown;
  currency: string;
  validUntil?: Date;
  calculationVersion: string;
}

@Injectable()
export class PricingEngineService {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly moveRequestsService: MoveRequestsService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * Primary entrypoint: calculates a complete price estimate for a move request
   * against a specific company's pricing rules.
   */
  async calculateEstimate(
    companyId: string,
    moveRequestId: string,
    addonIds: string[] = [],
  ): Promise<PricingCalculationResult>;

  /**
   * Calculates estimate from raw pricing input without database lookup.
   * Useful for "quick estimate" features before move request creation.
   */
  async calculateEstimateFromInput(
    pricingRule: PricingRule,
    input: PricingInput,
    addons: ServiceAddon[],
  ): Promise<PricingCalculationResult>;

  /**
   * Computes distance charge: pricePerKm × distance.
   */
  private calculateDistanceCharge(pricePerKm: number, distanceKm: number): number;

  /**
   * Computes time estimate charge: pricePerHour × estimatedHours × teamSize.
   * Respects minimumHours if configured.
   */
  private calculateTimeCharge(
    pricePerHour: number,
    estimatedHours: number,
    teamSize: number,
    minimumHours?: number,
  ): number;

  /**
   * Computes floor surcharge for buildings without elevators.
   * Formula: max(0, (floors - 1)) × perFloorRate.
   */
  private calculateFloorSurcharge(floors: number, hasElevator: boolean, perFloorRate: number): number;

  /**
   * Computes parking distance surcharge.
   * Threshold: > 50m triggers per-meter charge.
   */
  private calculateParkingSurcharge(distanceMeters: number, perMeterRate: number): number;

  /**
   * Aggregates addon prices. Supports per-hour and flat addons.
   */
  private calculateAddonsTotal(addons: ServiceAddon[], estimatedHours: number): number;

  /**
   * Applies volume/weight tier adjustments if company has tiered pricing.
   */
  private applyVolumeTierAdjustment(basePrice: number, volumeM3: number, weightKg: number): number;

  /**
   * Rounds final price to 2 decimal places and applies minimumFee floor.
   */
  private finalizePrice(subtotal: number, minimumFee?: number): number;

  /**
   * Returns the calculation formula version for audit/compliance.
   */
  getCalculationVersion(): string;
}
```

### 5.2 AvailabilityService + TeamCapacityService

```typescript
// availability/availability.service.ts
import { Injectable } from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';
import { TeamCapacityService } from './team-capacity.service';
import { Company } from '../companies/entities/company.entity';
import { MoveRequest } from '../move-requests/entities/move-request.entity';

export interface CompanyAvailability {
  companyId: string;
  companyName: string;
  available: boolean;
  availableTeams: AvailableTeamInfo[];
  reason?: string;
}

export interface AvailableTeamInfo {
  teamId: string;
  teamName: string;
  remainingCapacity: number;
  capacityUnit: 'moves' | 'hours';
  scheduledJobs: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly availabilityRepository: AvailabilityRepository,
    private readonly teamCapacityService: TeamCapacityService,
  ) {}

  /**
   * Returns all companies available for a move request's date and location.
   * Filters by service area, availability slots, and remaining team capacity.
   */
  async getAvailableCompaniesForMoveRequest(
    moveRequestId: string,
  ): Promise<CompanyAvailability[]>;

  /**
   * Returns companies available for a given date (public endpoint).
   */
  async getAvailableCompaniesForDate(
    moveDate: Date,
    city?: string,
    zipCode?: string,
  ): Promise<Company[]>;

  /**
   * Checks if a specific company can handle a move request.
   */
  async isCompanyAvailable(
    companyId: string,
    moveDate: Date,
    estimatedHours: number,
  ): Promise<CompanyAvailability>;

  /**
   * Creates or updates availability slots for a team on a specific date.
   */
  async setTeamAvailability(
    teamId: string,
    date: Date,
    maxJobs: number,
    isAvailable: boolean,
  ): Promise<AvailabilitySlot>;

  /**
   * Batch-sets availability for a date range (e.g., block vacation weeks).
   */
  async setBulkAvailability(
    teamId: string,
    dateRange: DateRange,
    isAvailable: boolean,
  ): Promise<AvailabilitySlot[]>;

  /**
   * Retrieves the full schedule for a company across all teams in a date range.
   */
  async getCompanySchedule(
    companyId: string,
    dateRange: DateRange,
  ): Promise<Record<string, AvailabilitySlot[]>>;

  /**
   * Returns suggested time slots for a customer to choose from.
   */
  async suggestTimeSlots(
    companyId: string,
    moveDate: Date,
    estimatedHours: number,
  ): Promise<{ startTime: Date; endTime: Date; teamId: string }[]>;
}

// availability/team-capacity.service.ts
import { Injectable } from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';

export interface ScheduledJob {
  moveRequestId: string;
  startTime: Date;
  estimatedHours: number;
  teamId: string;
}

export interface CapacityAllocationResult {
  success: boolean;
  slotId?: string;
  remainingCapacity: number;
  message?: string;
}

@Injectable()
export class TeamCapacityService {
  constructor(private readonly availabilityRepository: AvailabilityRepository) {}

  /**
   * Allocates capacity for a move request on a specific team and date.
   * Returns success/failure with remaining capacity.
   */
  async allocateCapacity(
    moveRequestId: string,
    teamId: string,
    date: Date,
    estimatedHours: number,
  ): Promise<CapacityAllocationResult>;

  /**
   * Releases allocated capacity when a move is cancelled or rescheduled.
   */
  async releaseCapacity(moveRequestId: string): Promise<void>;

  /**
   * Returns remaining capacity for a team on a given date.
   */
  async getRemainingCapacity(teamId: string, date: Date): Promise<number>;

  /**
   * Checks if a team has enough remaining capacity for a job.
   */
  async canTeamHandleJob(
    teamId: string,
    date: Date,
    estimatedHours: number,
  ): Promise<boolean>;

  /**
   * Returns the number of parallel jobs already scheduled for a team on a date.
   */
  async getParallelJobCount(teamId: string, date: Date): Promise<number>;

  /**
   * Returns all scheduled jobs for a team in a date range.
   */
  async getTeamSchedule(teamId: string, dateRange: DateRange): Promise<ScheduledJob[]>;

  /**
   * Attempts to reallocate a cancelled move's capacity to a standby/waitlist entry.
   */
  async reallocateAfterCancellation(moveRequestId: string): Promise<boolean>;

  /**
   * Pre-allocates tentative capacity during offer phase (soft hold).
   * Released if offer not accepted within TTL.
   */
  async softAllocateCapacity(
    moveRequestId: string,
    teamId: string,
    date: Date,
    estimatedHours: number,
    ttlMinutes: number,
  ): Promise<CapacityAllocationResult>;

  /**
   * Converts a soft allocation to hard allocation when offer is accepted.
   */
  async confirmAllocation(moveRequestId: string): Promise<CapacityAllocationResult>;
}
```

### 5.3 VideoLifecycleService

```typescript
// videos/video-lifecycle.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { VideosRepository } from './videos.repository';
import { S3Service } from '../shared/services/s3.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Video } from './entities/video.entity';

export interface RetentionPolicy {
  defaultRetentionDays: number;
  maxRetentionDays: number;
  deleteAfterOfferFinalized: boolean;
  deleteAfterMoveCompleted: boolean;
  gracePeriodHours: number;
}

export interface DeletionLog {
  videoId: string;
  s3Key: string;
  deletedAt: Date;
  reason: 'offer_finalized' | 'retention_expired' | 'user_request' | 'admin_action' | 'gdpr_request';
  triggeredBy: string;
}

@Injectable()
export class VideoLifecycleService {
  private readonly logger = new Logger(VideoLifecycleService.name);

  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly s3Service: S3Service,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Schedules a video for automatic deletion at a specific datetime.
   * Creates a scheduled job (e.g., via node-cron or Bull queue).
   */
  async scheduleAutoDeletion(videoId: string, deleteAt: Date): Promise<void>;

  /**
   * Cron-triggered method: scans for videos past retention and deletes them.
   * Returns count of deleted videos.
   */
  async processExpiredDeletions(): Promise<number>;

  /**
   * Immediately deletes a video after its associated offer is finalized.
   * This is the GDPR-compliant happy-path: video purpose (inventory analysis) is fulfilled.
   */
  async immediateDeleteAfterOfferFinalized(moveRequestId: string): Promise<DeletionLog[]>;

  /**
   * Immediately deletes a video after the move is completed and reviewed.
   * Fallback path if offer finalization did not trigger deletion.
   */
  async deleteAfterMoveCompleted(moveRequestId: string): Promise<DeletionLog[]>;

  /**
   * Handles user-initiated deletion (GDPR "right to erasure").
   */
  async handleUserDeletionRequest(videoId: string, userId: string): Promise<DeletionLog>;

  /**
   * Admin-initiated deletion (e.g., content moderation, legal request).
   */
  async handleAdminDeletion(videoId: string, adminId: string, reason: string): Promise<DeletionLog>;

  /**
   * Enforces the global retention policy across all videos.
   * Sends warning emails before deletion.
   */
  async enforceRetentionPolicy(): Promise<{
    warned: number;
    deleted: number;
    errors: number;
  }>;

  /**
   * Logs access to a video for audit trails (GDPR Article 30 record of processing).
   */
  async logAccess(
    videoId: string,
    accessorId: string,
    accessorRole: UserRole,
    action: 'view' | 'download' | 'share',
  ): Promise<void>;

  /**
   * Returns the retention policy configuration.
   */
  getRetentionPolicy(): RetentionPolicy;

  /**
   * Extends retention for a specific video (admin override).
   */
  async extendRetention(videoId: string, adminId: string, newExpiryDate: Date, reason: string): Promise<Video>;

  /**
   * Checks if a video is still accessible given its lifecycle state.
   */
  async isVideoAccessible(videoId: string): Promise<{ accessible: boolean; reason?: string }>;

  /**
   * Generates an audit report of all video lifecycle events for a user.
   */
  async generateUserAuditReport(userId: string): Promise<DeletionLog[]>;
}
```

### 5.4 OfferService

```typescript
// offers/offers.service.ts
import { Injectable } from '@nestjs/common';
import { OffersRepository } from './offers.repository';
import { PricingEngineService } from '../pricing/pricing-engine.service';
import { PricingService } from '../pricing/pricing.service';
import { VideoLifecycleService } from '../videos/video-lifecycle.service';
import { MoveRequestsService } from '../move-requests/move-requests.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CommissionsService } from '../commissions/commissions.service';
import { Offer } from './entities/offer.entity';
import { MoveRequest } from '../move-requests/entities/move-request.entity';

export interface OfferDetail {
  offer: Offer;
  moveRequest: MoveRequest;
  company: CompanySummary;
  pricingBreakdown: PricingBreakdown;
  inventorySummary: InventorySummary;
  isEditable: boolean;
  isFinalizable: boolean;
}

export interface CompanySummary {
  id: string;
  name: string;
  logoUrl?: string;
  rating: number;
  reviewCount: number;
}

export interface InventorySummary {
  itemCount: number;
  totalVolume: number;
  totalWeight: number;
  aiConfidence: number;
}

@Injectable()
export class OffersService {
  constructor(
    private readonly offersRepository: OffersRepository,
    private readonly pricingEngineService: PricingEngineService,
    private readonly pricingService: PricingService,
    private readonly videoLifecycleService: VideoLifecycleService,
    private readonly moveRequestsService: MoveRequestsService,
    private readonly notificationsService: NotificationsService,
    private readonly commissionsService: CommissionsService,
  ) {}

  /**
   * Creates a draft offer for a move request. Company must have pricing rules.
   * Calculates initial estimated price via PricingEngine.
   */
  async createOffer(companyId: string, dto: CreateOfferDto): Promise<Offer>;

  /**
   * Updates a draft/pending offer. Cannot update after customer acceptance.
   */
  async updateOffer(offerId: string, companyId: string, dto: UpdateOfferDto): Promise<Offer>;

  /**
   * Finalizes an offer: company locks in finalPrice and included services.
   * After finalization, the associated video is scheduled for deletion.
   * Notifications are sent to the customer.
   */
  async finalizeOffer(offerId: string, companyId: string, dto: FinalizeOfferDto): Promise<Offer>;

  /**
   * Withdraws an offer before acceptance. Sets status to WITHDRAWN.
   */
  async withdrawOffer(offerId: string, companyId: string): Promise<Offer>;

  /**
   * Customer accepts an offer. Triggers:
   * - MoveRequest status → ACCEPTED
   * - Other offers → REJECTED
   * - Capacity allocation via AvailabilityService
   * - Commission pre-calculation
   * - Video deletion trigger
   */
  async acceptOffer(offerId: string, customerId: string): Promise<MoveRequest>;

  /**
   * Customer rejects an offer. Offer status → REJECTED.
   */
  async rejectOffer(offerId: string, customerId: string): Promise<Offer>;

  /**
   * Retrieves an offer with full detail (pricing breakdown, inventory summary, company info).
   */
  async getOfferDetail(offerId: string): Promise<OfferDetail>;

  /**
   * Returns all offers for a move request, sorted by price.
   */
  async findByMoveRequestId(moveRequestId: string): Promise<Offer[]>;

  /**
   * Returns paginated offers for a company.
   */
  async findByCompanyId(companyId: string, query: PaginationQueryDto): Promise<PaginatedResult<Offer>>;

  /**
   * Returns paginated offers for a customer.
   */
  async findByCustomerId(customerId: string, query: PaginationQueryDto): Promise<PaginatedResult<Offer>>;

  /**
   * Returns the best (lowest final price) offer for a move request.
   */
  async getBestOfferForRequest(moveRequestId: string): Promise<Offer | null>;

  /**
   * Validates that a company can create an offer for a move request.
   * Checks: company approved, request open, not already offered by this company.
   */
  async validateOfferCreation(companyId: string, moveRequestId: string): Promise<{ valid: boolean; error?: string }>;

  /**
   * Sends reminder to company about pending offer drafts.
   */
  async sendOfferDraftReminder(companyId: string, moveRequestId: string): Promise<void>;

  /**
   * Expires offers past their validUntil date.
   */
  async expireStaleOffers(): Promise<number>;

  /**
   * Reopens a move request if the accepted offer is cancelled
   * (e.g., company becomes unavailable).
   */
  async handleAcceptedOfferCancellation(offerId: string, reason: string): Promise<MoveRequest>;
}
```

### 5.5 CommissionService

```typescript
// commissions/commissions.service.ts
import { Injectable } from '@nestjs/common';
import { CommissionsRepository } from './commissions.repository';
import { CompaniesService } from '../companies/companies.service';
import { ReviewsService } from '../reviews/reviews.service';
import { Commission } from './entities/commission.entity';

export interface CommissionSummary {
  totalCommission: number;
  totalJobs: number;
  averageCommissionRate: number;
  period: DateRange;
  byCompany: CompanyCommissionSummary[];
}

export interface CompanyCommissionSummary {
  companyId: string;
  companyName: string;
  commissionAmount: number;
  jobsCount: number;
  averageRating: number;
  appliedRate: number;
}

export interface PlatformCommissionSummary {
  totalCommission: number;
  totalJobs: number;
  totalRevenue: number;
  period: DateRange;
  byMonth: MonthlyCommission[];
}

export interface MonthlyCommission {
  month: string;
  commission: number;
  jobs: number;
}

export enum RatingTier {
  ELITE = 'elite',       // 4.5+ → lowest commission
  PREFERRED = 'preferred', // 4.0–4.49
  STANDARD = 'standard',   // 3.5–3.99
  PROVISIONAL = 'provisional', // < 3.5 or insufficient reviews → highest commission
}

@Injectable()
export class CommissionsService {
  constructor(
    private readonly commissionsRepository: CommissionsRepository,
    private readonly companiesService: CompaniesService,
    private readonly reviewsService: ReviewsService,
  ) {}

  /**
   * Primary calculation: determines commission amount for a completed job.
   * Dynamic rate based on company rating tier.
   */
  async calculateCommission(
    offerId: string,
    companyId: string,
    finalPrice: number,
  ): Promise<Commission>;

  /**
   * Determines the commission rate percentage for a company based on its rating tier.
   * ELITE: 5%, PREFERRED: 8%, STANDARD: 12%, PROVISIONAL: 18%.
   * Admin overrides take precedence.
   */
  async calculateDynamicRate(companyId: string): Promise<number>;

  /**
   * Returns the effective rate for a company (accounting for overrides).
   */
  async getRateForCompany(companyId: string): Promise<number>;

  /**
   * Returns the rating tier for a company based on its average rating and review count.
   * Minimum 5 reviews required for ELITE/PREFERRED tiers.
   */
  async getRatingTier(companyId: string): Promise<RatingTier>;

  /**
   * Persists a commission record after offer acceptance.
   */
  async recordCommission(
    moveRequestId: string,
    offerId: string,
    companyId: string,
    amount: number,
    ratePercent: number,
  ): Promise<Commission>;

  /**
   * Returns a commission by ID with full relations.
   */
  async findById(commissionId: string): Promise<Commission | null>;

  /**
   * Returns paginated commissions for a company.
   */
  async findByCompanyId(
    companyId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Commission>>;

  /**
   * Returns the commission record for a move request (if any).
   */
  async findByMoveRequestId(moveRequestId: string): Promise<Commission | null>;

  /**
   * Returns commission summary for a company over a date range.
   */
  async getCommissionSummary(
    companyId: string,
    dateRange: DateRange,
  ): Promise<CommissionSummary>;

  /**
   * Returns platform-wide commission summary over a date range.
   */
  async getPlatformCommissionSummary(
    dateRange: DateRange,
  ): Promise<PlatformCommissionSummary>;

  /**
   * Admin override: changes commission rate for a specific commission record.
   * Logs reason and admin identity for audit.
   */
  async overrideRate(
    commissionId: string,
    newRatePercent: number,
    adminId: string,
    reason: string,
  ): Promise<Commission>;

  /**
   * Returns commissions that are calculated but not yet paid.
   */
  async getOutstandingCommissions(companyId: string): Promise<Commission[]>;

  /**
   * Marks a commission as paid (admin action).
   */
  async markAsPaid(commissionId: string, adminId: string): Promise<Commission>;

  /**
   * Recalculates dynamic rate for a company after a new review is submitted.
   * Does not modify existing commission records — affects future calculations.
   */
  async recalculateCompanyTier(companyId: string): Promise<RatingTier>;

  /**
   * Sets a per-company commission rate override (admin action).
   * Takes precedence over dynamic tier calculation.
   */
  async setCompanyRateOverride(
    companyId: string,
    ratePercent: number,
    adminId: string,
    reason: string,
    expiryDate?: Date,
  ): Promise<void>;

  /**
   * Removes a per-company rate override.
   */
  async removeCompanyRateOverride(companyId: string, adminId: string): Promise<void>;
}
```

---

## Section 6 — Environment Configuration

### 6.1 Required Environment Variables

```bash
# ============================================
# APPLICATION
# ============================================
NODE_ENV=development                    # development | staging | production
PORT=3000                               # API server port
API_PREFIX=/api/v1                      # Global API prefix
APP_NAME=MyMove API                     # Service name for logging
APP_VERSION=1.0.0                       # Semantic version

# ============================================
# DATABASE — MySQL
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=mymove
DB_PASSWORD=secure_password_here
DB_DATABASE=mymove_development
DB_SSL=false                            # true in production (AWS RDS)
DB_POOL_SIZE=20                         # Connection pool max size

# ============================================
# AUTHENTICATION — Supabase
# ============================================
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Server-only key for admin operations
SUPABASE_JWT_SECRET=your-jwt-secret     # For local JWT verification
SUPABASE_AUTH_COOKIE_NAME=sb-access-token

# ============================================
# AWS — S3 Video Storage
# ============================================
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxx
AWS_S3_BUCKET=mymove-videos-prod
AWS_S3_VIDEO_PREFIX=videos/             # Key prefix in bucket
AWS_S3_PRESIGNED_EXPIRY_SECONDS=300     # Upload URL TTL
AWS_S3_VIEW_URL_EXPIRY_SECONDS=3600     # View URL TTL
AWS_S3_FORCE_PATH_STYLE=false           # true for MinIO/local dev

# ============================================
# NOTIFICATIONS — Email
# ============================================
EMAIL_DRIVER=sendgrid                   # sendgrid | postmark | smtp
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM_ADDRESS=noreply@mymove.com
EMAIL_FROM_NAME=MyMove

# ============================================
# NOTIFICATIONS — Push
# ============================================
FIREBASE_PROJECT_ID=mymove-app
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
PUSH_ENABLED=true

# ============================================
# AI SERVICE (Mocked for MVP)
# ============================================
AI_SERVICE_URL=https://ai.mymove.com    # External AI service endpoint
AI_SERVICE_API_KEY=ai-key-xxx
AI_SERVICE_TIMEOUT_MS=30000
AI_MOCK_MODE=true                       # true for MVP — returns synthetic results

# ============================================
# PRICING / COMMISSION
# ============================================
DEFAULT_COMMISSION_RATE_PERCENT=10      # Fallback rate if no tier applies
COMMISSION_TIER_ELITE=5                 # 4.5+ rating
COMMISSION_TIER_PREFERRED=8             # 4.0–4.49
COMMISSION_TIER_STANDARD=12             # 3.5–3.99
COMMISSION_TIER_PROVISIONAL=18          # < 3.5 or < 5 reviews
MIN_REVIEWS_FOR_TIER=5                  # Minimum reviews to qualify for elite/preferred

# ============================================
# VIDEO LIFECYCLE / GDPR
# ============================================
VIDEO_DEFAULT_RETENTION_DAYS=30
VIDEO_MAX_RETENTION_DAYS=90
VIDEO_DELETE_AFTER_OFFER_FINALIZED=true
VIDEO_DELETE_AFTER_MOVE_COMPLETED=true
VIDEO_GRACE_PERIOD_HOURS=24
GDPR_DATA_EXPORT_RETENTION_DAYS=30

# ============================================
# RATE LIMITING / SECURITY
# ============================================
RATE_LIMIT_WINDOW_MS=60000              # 1 minute
RATE_LIMIT_MAX_REQUESTS=100             # per window per IP
THROTTLE_TTL=60
THROTTLE_LIMIT=100
CORS_ORIGINS=https://app.mymove.com,https://admin.mymove.com
TRUST_PROXY=false

# ============================================
# LOGGING / MONITORING
# ============================================
LOG_LEVEL=debug                         # debug | info | warn | error
LOG_FORMAT=json                         # json | pretty
SENTRY_DSN=https://xxx@sentry.io/xxx
HEALTH_CHECK_ENABLED=true

# ============================================
# REDIS / JOB QUEUE (Future: BullMQ)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ============================================
# GEO / MAPS (Distance calculation)
# ============================================
MAPS_API_PROVIDER=google                # google | openstreetmap | mapbox
GOOGLE_MAPS_API_KEY=AIza...
DISTANCE_CALCULATION_MODE=estimated     # estimated | precise
```

### 6.2 Environment Validation Schema (using `joi` or `class-validator`)

```typescript
// shared/config/env.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, IsEnum, validateSync, Min, Max } from 'class-validator';

enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment) NODE_ENV: Environment;
  @IsNumber() @Min(1) @Max(65535) PORT: number;
  @IsString() DB_HOST: string;
  @IsNumber() @Min(1) @Max(65535) DB_PORT: number;
  @IsString() DB_USERNAME: string;
  @IsString() DB_PASSWORD: string;
  @IsString() DB_DATABASE: string;
  @IsString() SUPABASE_URL: string;
  @IsString() SUPABASE_ANON_KEY: string;
  @IsString() SUPABASE_SERVICE_ROLE_KEY: string;
  @IsString() AWS_REGION: string;
  @IsString() AWS_ACCESS_KEY_ID: string;
  @IsString() AWS_SECRET_ACCESS_KEY: string;
  @IsString() AWS_S3_BUCKET: string;
  @IsString() EMAIL_DRIVER: string;
  @IsString() SENDGRID_API_KEY: string;
  @IsString() EMAIL_FROM_ADDRESS: string;
  @IsBoolean() AI_MOCK_MODE: boolean;
  @IsNumber() @Min(0) @Max(100) DEFAULT_COMMISSION_RATE_PERCENT: number;
  @IsNumber() @Min(1) VIDEO_DEFAULT_RETENTION_DAYS: number;
  @IsString() CORS_ORIGINS: string;
  @IsString() LOG_LEVEL: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.map(e => Object.values(e.constraints || {})).join('\n')}`);
  }

  return validated;
}
```

### 6.3 ConfigService Usage Pattern

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './shared/config/env.validation';
import { databaseConfig } from './shared/config/database.config';
import { s3Config } from './shared/config/s3.config';
import { supabaseConfig } from './shared/config/supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      load: [databaseConfig, s3Config, supabaseConfig],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

---

## Appendix A — NestJS Module Dependency Graph

```
AppModule
├── AuthModule
│   └── UsersModule
├── UsersModule (leaf)
├── CompaniesModule
│   ├── UsersModule
│   └── NotificationsModule
├── MoveRequestsModule
│   ├── UsersModule
│   ├── InventoryModule
│   ├── AvailabilityModule
│   ├── PricingModule
│   ├── OffersModule
│   ├── VideosModule
│   └── NotificationsModule
├── InventoryModule
│   └── VideosModule
├── VideosModule
│   └── S3Service (shared)
├── PricingModule
│   ├── CompaniesModule
│   ├── MoveRequestsModule
│   └── InventoryModule
├── OffersModule
│   ├── PricingModule
│   ├── MoveRequestsModule
│   ├── VideosModule (VideoLifecycleService)
│   ├── CommissionsModule
│   └── NotificationsModule
├── AvailabilityModule
│   ├── CompaniesModule
│   └── MoveRequestsModule
├── ReviewsModule
│   ├── UsersModule
│   ├── CompaniesModule
│   ├── MoveRequestsModule
│   └── CommissionsModule
├── AdminModule (orchestration)
│   ├── UsersModule
│   ├── CompaniesModule
│   ├── MoveRequestsModule
│   ├── OffersModule
│   ├── ReviewsModule
│   ├── CommissionsModule
│   └── NotificationsModule
├── NotificationsModule
│   └── UsersModule
└── CommissionsModule
    ├── CompaniesModule
    ├── ReviewsModule
    └── OffersModule
```

## Appendix B — Global Middleware & Bootstrap Setup

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useGlobalGuards(
    app.get(JwtAuthGuard),
    app.get(RolesGuard),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || true,
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

## Appendix C — Entity Relationship Summary

```
users (1) ────────< (N) companies                    [owner relationship]
users (1) ────────< (N) move_requests                  [customer relationship]
users (1) ────────< (N) reviews                        [reviewer relationship]
users (1) ────────< (N) notifications                  [recipient]

companies (1) ────< (N) company_documents
companies (1) ────< (N) pricing_rules
companies (1) ────< (N) service_addons
companies (1) ────< (N) teams
companies (1) ────< (N) offers
companies (1) ────< (N) commissions

move_requests (1) ─< (1) videos
move_requests (1) ─< (1) inventory_items (via inventory_id)
move_requests (1) ─< (1) ai_analyses
move_requests (1) ─< (N) offers
move_requests (1) ─< (1) reviews
move_requests (1) ─< (1) commissions
move_requests (1) ─< (N) availability_slots            [allocated slots]

teams (1) ────────< (N) availability_slots
videos (1) ───────< (N) ai_analyses                    [source video]
```

---

> **Document Status:** Production-ready architecture specification.  
> **Next Steps:** (1) Scaffold NestJS project via `nest new`, (2) Generate entities from this spec, (3) Implement `AuthModule` first (Supabase integration), (4) Sequentially implement `UsersModule` → `CompaniesModule` → `VideosModule` → `InventoryModule` → `MoveRequestsModule` → `PricingModule` → `AvailabilityModule` → `OffersModule` → `ReviewsModule` → `CommissionsModule` → `NotificationsModule` → `AdminModule`.

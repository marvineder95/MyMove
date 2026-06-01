# MyMove — Security Architecture & RBAC Foundation

> **Classification:** Internal Security Architecture Document  
> **Version:** 1.0  
> **Date:** 2025-01-21  
> **Audience:** Backend, Frontend, DevOps, Compliance, QA  

---

## Table of Contents

1. [System Architecture Overview](#section-1--system-architecture-overview)
2. [RBAC System Design](#section-2--rbac-system-design)
3. [Data Flow Diagrams](#section-3--data-flow-diagrams)
4. [Security & Data Handling](#section-4--security--data-handling)
5. [API Security](#section-5--api-security)
6. [Audit & Monitoring](#section-6--audit--monitoring)
7. [Infrastructure Security](#section-7--infrastructure-security)

---

## Section 1 — System Architecture Overview

### 1.1 High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Vue 3 + Vite │  │  Vue 3 + Vite │  │  Vue 3 + Vite │  │  Admin Dashboard │ │
│  │   (B2C App)   │  │  (B2B Portal) │  │  (SaaS Mode)  │  │   (point4Studio) │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘ │
└─────────┼─────────────────┼─────────────────┼───────────────────┼───────────┘
          │                 │                 │                   │
          └─────────────────┴─────────────────┴───────────────────┘
                              │ HTTPS / TLS 1.3
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    NestJS Backend API                                    │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │
│  │  │ Auth Module │ │Move Module │ │Offer Module │ │  Admin Module   │   │ │
│  │  │  (JWT/RBAC) │ │ (Requests)  │ │ (Pricing)   │ │ (Approvals)     │   │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │
│  │  │Video Module │ │Company Mod │ │Review Mod   │ │  Audit Module   │   │ │
│  │  │ (S3/Flows)  │ │ (Profile)   │ │ (Ratings)   │ │ (Logging)       │   │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘   │ │
│  │                                                                        │ │
│  │  Guards: JwtAuthGuard │ RolesGuard │ DataOwnershipGuard │ AuditLogInt  │ │
│  │  Middleware: RateLimit │ CORS │ Helmet │ RequestContext                       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬───────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────┐      ┌─────────────────┐      ┌──────────────────┐
│  Supabase    │      │     MySQL       │      │    AWS S3        │
│   Auth       │      │   (Primary DB)  │      │  (File Storage)  │
│              │      │                 │      │                  │
│ • JWT Issue  │      │ • users         │      │ • Videos         │
│ • JWT Verify │      │ • companies     │      │ • Documents      │
│ • OAuth      │      │ • move_requests │      │ • Trade Licenses │
│ • Password   │      │ • offers        │      │                  │
│   Reset      │      │ • videos        │      │ SSE-S3 / SSE-KMS │
│              │      │ • reviews       │      │ Presigned URLs   │
│              │      │ • admin_logs    │      │ Lifecycle Rules  │
│              │      │ • company_invites      │                  │
└──────────────┘      └─────────────────┘      └──────────────────┘
                              │
                              ▼
                   ┌─────────────────┐
                   │  AI Service     │
                   │  (External)     │
                   │                 │
                   │ • Mocked for    │
                   │   MVP           │
                   │ • Receives      │
                   │   video URL     │
                   │ • Returns       │
                   │   inventory     │
                   └─────────────────┘
```

### 1.2 Communication Flows

| Flow | Protocol | Security |
|------|----------|----------|
| Client → NestJS API | HTTPS / TLS 1.3 | JWT Bearer token in `Authorization` header |
| NestJS → Supabase Auth | HTTPS + API Key | Service role key (server-side only) |
| NestJS → MySQL | TCP + SSL | TLS encrypted connection, credential rotation |
| NestJS → S3 | HTTPS + AWS SigV4 | IAM role / access keys with least privilege |
| NestJS → AI Service | HTTPS | API key authentication, request signing |
| Client → S3 (upload) | HTTPS | Presigned POST/PUT URL (time + size limited) |

### 1.3 Multi-Tenancy Model (SaaS Mode)

MyMove operates in **two modes** requiring different data isolation strategies:

**Mode A: Marketplace (Default)**
- Customer creates a move request → broadcast to selected companies
- Customer receives and compares offers from multiple companies
- Companies compete; customer has choice

**Mode B: SaaS (Single-Tenant)**
- Company invites customer via email (`company_invites` table)
- Customer registers through invitation link
- Customer sees only that company's branding and offer
- No cross-company visibility

**Isolation Mechanism:**

| Layer | Marketplace | SaaS Mode |
|-------|-------------|-----------|
| Request type | `move_requests.request_type = 'MARKETPLACE'` | `move_requests.request_type = 'SAAS'` |
| Company access | Many companies receive request | One company linked via `company_invites` |
| Customer view | Multiple offers, company comparison | Single offer, white-label experience |
| Data query scope | `WHERE request_id IN (...)` with visibility rules | `WHERE company_id = :invited_company` |

**Database discriminant:**

```sql
CREATE TABLE move_requests (
  id              UUID PRIMARY KEY,
  customer_id     UUID REFERENCES users(id),
  request_type    ENUM('MARKETPLACE', 'SAAS') NOT NULL DEFAULT 'MARKETPLACE',
  invited_company_id UUID REFERENCES companies(id) NULL,  -- set only for SAAS
  ...
);

CREATE TABLE company_invites (
  id          UUID PRIMARY KEY,
  company_id  UUID REFERENCES companies(id),
  email       VARCHAR(255),          -- invited customer email
  token       VARCHAR(255) UNIQUE,   -- secure invite token
  status      ENUM('PENDING','ACCEPTED','EXPIRED'),
  expires_at  TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## Section 2 — RBAC System Design

### 2.1 Role Definitions & Permission Matrix

Users are assigned a single role stored in the `users` table as `role ENUM('END_CUSTOMER','COMPANY','ADMIN')`.
Companies are linked via `users.company_id → companies.id`.
Admins have `users.is_admin = true` and `company_id IS NULL`.

#### 2.1.1 Master Permission Matrix

| # | Permission | END_CUSTOMER | COMPANY | ADMIN | Enforcement Point |
|---|-----------|:------------:|:-------:|:-----:|-------------------|
| 1 | View own profile | ✅ | ✅ | ✅ | `DataOwnershipGuard` |
| 2 | Edit own profile | ✅ | ✅ | ✅ | `DataOwnershipGuard` |
| 3 | View other users | ❌ | ❌ | ✅ | `RolesGuard(['ADMIN'])` |
| 4 | Create move request | ✅ | ❌ | ❌ | `RolesGuard(['END_CUSTOMER'])` |
| 5 | View move requests | own only | received only | all | `DataOwnershipGuard` + `CompanyOwnershipGuard` |
| 6 | Edit move requests | own draft only | ❌ | ❌ | `DataOwnershipGuard` + status check |
| 7 | Upload video | own | ❌ | ❌ | `RolesGuard(['END_CUSTOMER'])` + request ownership |
| 8 | View video | own | received req | ❌ | `VideoAccessGuard` (presigned + role check) |
| 9 | View inventory | own | received req | all | `DataOwnershipGuard` + `CompanyOwnershipGuard` |
| 10 | Edit inventory | own | ❌ | ❌ | `DataOwnershipGuard` |
| 11 | Create offers | ❌ | own company | ❌ | `RolesGuard(['COMPANY'])` + `CompanyOwnershipGuard` |
| 12 | View offers | received | own company | all | `DataOwnershipGuard` + `CompanyOwnershipGuard` |
| 13 | Edit offers | ❌ | own draft | ❌ | `CompanyOwnershipGuard` + status check |
| 14 | Accept offer | own (received) | ❌ | ❌ | `DataOwnershipGuard` + offer linkage |
| 15 | Manage pricing | ❌ | own company | ❌ | `RolesGuard(['COMPANY'])` + `CompanyOwnershipGuard` |
| 16 | Manage teams | ❌ | own company | ❌ | `RolesGuard(['COMPANY'])` + `CompanyOwnershipGuard` |
| 17 | Manage availability | ❌ | own company | ❌ | `RolesGuard(['COMPANY'])` + `CompanyOwnershipGuard` |
| 18 | View company list | ✅ (public) | ✅ (public) | ✅ | Public endpoint, no guard |
| 19 | Edit company profile | ❌ | own | ✅ (as admin) | `CompanyOwnershipGuard` / `RolesGuard(['ADMIN'])` |
| 20 | Upload documents | ❌ | own | ❌ | `RolesGuard(['COMPANY'])` + `CompanyOwnershipGuard` |
| 21 | Approve / reject companies | ❌ | ❌ | ✅ | `RolesGuard(['ADMIN'])` + `AuditLogInterceptor` |
| 22 | Suspend / activate companies | ❌ | ❌ | ✅ | `RolesGuard(['ADMIN'])` + `AuditLogInterceptor` |
| 23 | View admin dashboard | ❌ | ❌ | ✅ | `RolesGuard(['ADMIN'])` |
| 24 | Manage commissions | ❌ | ❌ | ✅ | `RolesGuard(['ADMIN'])` + `AuditLogInterceptor` |
| 25 | View reviews | own | own company | all | `DataOwnershipGuard` + `CompanyOwnershipGuard` |
| 26 | Write review | own completed | ❌ | ❌ | `DataOwnershipGuard` + move completion check |
| 27 | View audit logs | ❌ | ❌ | ✅ | `RolesGuard(['ADMIN'])` |

#### 2.1.2 Permission Logic Summary

- **END_CUSTOMER**: Full ownership of own data. No cross-customer visibility. No access to company internals.
- **COMPANY**: Access to data only for received move requests (marketplace) or invited customers (SaaS). Full control over own profile, pricing, team, offers. No access to other companies' data.
- **ADMIN**: Global read access. Write access limited to moderation, configuration, and audit. No access to video content (metadata only for GDPR compliance).

### 2.2 NestJS Guards Implementation

#### 2.2.1 `@Roles(...)` Decorator

```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type UserRole = 'END_CUSTOMER' | 'COMPANY' | 'ADMIN';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

#### 2.2.2 `@CurrentUser()` Decorator

```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  sub: string;           // user UUID
  email: string;
  role: UserRole;
  company_id?: string;   // null for END_CUSTOMER and ADMIN
  iat: number;
  exp: number;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserPayload | undefined, ctx: ExecutionContext): CurrentUserPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;

    if (!user) {
      throw new Error('CurrentUser decorator used without JwtAuthGuard');
    }

    return data ? user[data] : user;
  },
);
```

#### 2.2.3 `JwtAuthGuard` — Supabase JWT Validation

```typescript
// src/common/guards/jwt-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_KEY'),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.substring(7);

    try {
      // Verify token via Supabase Auth server
      const { data: { user: supabaseUser }, error } = await this.supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Enrich with application-specific role data from local DB
      const enrichedUser = await this.enrichUserContext(supabaseUser, token);
      request.user = enrichedUser;

      return true;
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Authentication failed');
    }
  }

  private async enrichUserContext(supabaseUser: any, token: string): Promise<CurrentUserPayload> {
    // Query local DB to get role and company_id (not stored in Supabase metadata for decoupling)
    // This also ensures deleted/suspended users are blocked even if JWT is valid
    const userRecord = await this.getUserFromDb(supabaseUser.id);

    if (!userRecord || userRecord.is_suspended) {
      throw new UnauthorizedException('User account is suspended or deleted');
    }

    return {
      sub: userRecord.id,
      email: supabaseUser.email,
      role: userRecord.role,
      company_id: userRecord.company_id ?? undefined,
      iat: Math.floor(Date.now() / 1000),
      exp: supabaseUser.exp,
    };
  }

  private async getUserFromDb(userId: string): Promise<any> {
    // Raw query using MySQL connection; in practice use a UserService
    // SELECT id, role, company_id, is_suspended FROM users WHERE id = ?
    return null; // placeholder — actual implementation in UserService
  }
}
```

#### 2.2.4 `RolesGuard` — Role-Based Authorization

```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, UserRole } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restriction applied
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
```

#### 2.2.5 `DataOwnershipGuard` — Resource Ownership Verification

```typescript
// src/common/guards/data-ownership.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';

export const OWNERSHIP_KEY = 'ownership';
export interface OwnershipConfig {
  resourceTable: string;   // e.g., 'move_requests', 'users', 'offers'
  ownerColumn: string;       // e.g., 'customer_id', 'user_id', 'company_id'
  paramKey: string;          // e.g., 'id' from @Param('id')
  allowedRoles?: string[];   // roles that bypass ownership (e.g., ADMIN)
}

export const RequireOwnership = (config: OwnershipConfig) =>
  ReflectMetadata(OWNERSHIP_KEY, config);

import { SetMetadata } from '@nestjs/common';
export const ReflectMetadata = SetMetadata;

@Injectable()
export class DataOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.getAllAndOverride<OwnershipConfig>(OWNERSHIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!config) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;
    const resourceId = request.params[config.paramKey];

    if (!resourceId) {
      throw new NotFoundException(`Resource identifier '${config.paramKey}' not found in route`);
    }

    // Admins bypass ownership checks (unless explicitly restricted)
    if (config.allowedRoles?.includes(user.role)) {
      return true;
    }

    // COMPANY role: check if the company_id matches (for company-owned resources)
    if (user.role === 'COMPANY' && config.ownerColumn === 'company_id') {
      const isOwner = await this.verifyCompanyOwnership(config, resourceId, user.company_id);
      if (!isOwner) {
        throw new ForbiddenException('You do not have access to this company resource');
      }
      return true;
    }

    // END_CUSTOMER or generic: verify direct ownership
    const ownerId = await this.getOwnerId(config, resourceId);

    if (!ownerId) {
      throw new NotFoundException('Resource not found');
    }

    if (ownerId !== user.sub && (!user.company_id || ownerId !== user.company_id)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }

  private async getOwnerId(config: OwnershipConfig, resourceId: string): Promise<string | null> {
    const query = `
      SELECT ${config.ownerColumn} AS owner_id
      FROM ${config.resourceTable}
      WHERE id = ?
      LIMIT 1
    `;
    const result = await this.dataSource.query(query, [resourceId]);
    return result.length > 0 ? result[0].owner_id : null;
  }

  private async verifyCompanyOwnership(
    config: OwnershipConfig,
    resourceId: string,
    companyId: string | undefined,
  ): Promise<boolean> {
    if (!companyId) return false;
    const query = `SELECT 1 FROM ${config.resourceTable} WHERE id = ? AND company_id = ? LIMIT 1`;
    const result = await this.dataSource.query(query, [resourceId, companyId]);
    return result.length > 0;
  }
}
```

#### 2.2.6 `CompanyOwnershipGuard` — Company Resource Isolation

```typescript
// src/common/guards/company-ownership.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const COMPANY_RESOURCE_KEY = 'company_resource';
export const IsCompanyResource = () => ReflectMetadata(COMPANY_RESOURCE_KEY, true);

@Injectable()
export class CompanyOwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isCompanyResource = this.reflector.getAllAndOverride<boolean>(COMPANY_RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isCompanyResource) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as CurrentUserPayload;

    // Only COMPANY users can access company resources
    if (user.role !== 'COMPANY') {
      throw new ForbiddenException('Only company accounts can access this resource');
    }

    if (!user.company_id) {
      throw new ForbiddenException('Company account not properly linked to a company');
    }

    // Attach company_id to request for downstream service use
    request.company_id = user.company_id;

    return true;
  }
}
```

#### 2.2.7 Combined Guard Usage Example

```typescript
// src/modules/move-requests/move-request.controller.ts
import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DataOwnershipGuard, RequireOwnership } from '../../common/guards/data-ownership.guard';
import { CompanyOwnershipGuard, IsCompanyResource } from '../../common/guards/company-ownership.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('move-requests')
@UseGuards(JwtAuthGuard, RolesGuard, DataOwnershipGuard, CompanyOwnershipGuard)
export class MoveRequestController {

  @Post()
  @Roles('END_CUSTOMER')
  async create(
    @Body() dto: CreateMoveRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.moveRequestService.create(dto, user.sub);
  }

  @Get(':id')
  @Roles('END_CUSTOMER', 'COMPANY', 'ADMIN')
  @RequireOwnership({
    resourceTable: 'move_requests',
    ownerColumn: 'customer_id',
    paramKey: 'id',
    allowedRoles: ['ADMIN'],
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    // For COMPANY role, service layer additionally checks if company received this request
    return this.moveRequestService.findOneWithVisibility(id, user);
  }

  @Patch(':id')
  @Roles('END_CUSTOMER')
  @RequireOwnership({
    resourceTable: 'move_requests',
    ownerColumn: 'customer_id',
    paramKey: 'id',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMoveRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.moveRequestService.update(id, dto, user.sub);
  }
}

// src/modules/offers/offer.controller.ts
@Controller('offers')
@UseGuards(JwtAuthGuard, RolesGuard, DataOwnershipGuard, CompanyOwnershipGuard)
export class OfferController {

  @Post()
  @Roles('COMPANY')
  @IsCompanyResource()
  async createOffer(
    @Body() dto: CreateOfferDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    // company_id injected via guard
    return this.offerService.create(dto, user.company_id!);
  }

  @Get('company')
  @Roles('COMPANY')
  @IsCompanyResource()
  async findCompanyOffers(@CurrentUser() user: CurrentUserPayload) {
    return this.offerService.findByCompany(user.company_id!);
  }
}
```

### 2.3 Middleware & Interceptors

#### 2.3.1 `AuditLogInterceptor` — Admin Action Logging

```typescript
// src/common/interceptors/audit-log.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';
import { Request } from 'express';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actor_id: string;
  actor_role: string;
  actor_ip: string;
  action: string;       // e.g., 'COMPANY_APPROVE', 'OFFER_SEND', 'VIDEO_DELETE'
  target_type: string;  // e.g., 'company', 'offer', 'video'
  target_id: string;
  before_value?: string; // JSON stringified previous state
  after_value?: string;  // JSON stringified new state
  metadata?: string;     // extra context (reason, source IP, user agent)
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly auditedActions = new Set([
    'POST   /admin/companies/:id/approve',
    'POST   /admin/companies/:id/reject',
    'POST   /admin/companies/:id/suspend',
    'PATCH  /admin/commissions',
    'DELETE /admin/users/:id',
    'POST   /offers',           // offer creation by company
    'PATCH  /offers/:id/send',  // offer sent to customer
    'DELETE /videos/:id',        // manual or automated video deletion
    'POST   /companies/:id/documents',
  ]);

  constructor(private dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const routeKey = `${request.method.toUpperCase().padEnd(6)} ${request.route?.path || request.path}`;

    // Only intercept configured admin/action paths
    if (!this.isAuditedRoute(routeKey)) {
      return next.handle();
    }

    const user = request.user as CurrentUserPayload;
    const actorId = user?.sub || 'anonymous';
    const actorRole = user?.role || 'UNKNOWN';
    const actorIp = request.ip || request.headers['x-forwarded-for']?.toString() || 'unknown';
    const action = this.resolveActionName(routeKey, request);
    const targetId = this.extractTargetId(request);
    const targetType = this.extractTargetType(request);

    // Capture before state for destructive/modifying actions
    const beforeValuePromise = this.captureBeforeState(action, targetId, targetType);

    return next.handle().pipe(
      tap(async (responseBody) => {
        const beforeValue = await beforeValuePromise;
        const afterValue = this.captureAfterState(action, responseBody, request);

        await this.writeAuditLog({
          id: this.generateUuid(),
          timestamp: new Date(),
          actor_id: actorId,
          actor_role: actorRole,
          actor_ip: actorIp,
          action,
          target_type: targetType,
          target_id: targetId,
          before_value: beforeValue ? JSON.stringify(beforeValue) : undefined,
          after_value: afterValue ? JSON.stringify(afterValue) : undefined,
          metadata: JSON.stringify({
            userAgent: request.headers['user-agent'],
            route: routeKey,
            body: this.sanitizeBody(request.body),
          }),
        });
      }),
    );
  }

  private isAuditedRoute(routeKey: string): boolean {
    return Array.from(this.auditedActions).some(pattern => {
      const regex = new RegExp('^' + pattern.replace(/:\w+/g, '[^/]+') + '$');
      return regex.test(routeKey.trim());
    });
  }

  private resolveActionName(routeKey: string, req: Request): string {
    const custom = req.headers['x-audit-action'] as string;
    if (custom) return custom;
    // Derive from route
    if (routeKey.includes('/approve')) return 'COMPANY_APPROVE';
    if (routeKey.includes('/reject')) return 'COMPANY_REJECT';
    if (routeKey.includes('/suspend')) return 'COMPANY_SUSPEND';
    if (routeKey.includes('/commissions')) return 'COMMISSION_UPDATE';
    if (routeKey.includes('/offers') && req.method === 'POST') return 'OFFER_CREATE';
    if (routeKey.includes('/offers') && req.method === 'PATCH') return 'OFFER_UPDATE';
    if (routeKey.includes('/videos') && req.method === 'DELETE') return 'VIDEO_DELETE';
    return 'ADMIN_ACTION';
  }

  private extractTargetId(req: Request): string {
    // Extract from route params or query
    return req.params.id || req.params.companyId || req.params.userId || 'system';
  }

  private extractTargetType(req: Request): string {
    const path = req.path;
    if (path.includes('/companies')) return 'company';
    if (path.includes('/offers')) return 'offer';
    if (path.includes('/videos')) return 'video';
    if (path.includes('/users')) return 'user';
    if (path.includes('/commissions')) return 'commission_config';
    return 'unknown';
  }

  private async captureBeforeState(action: string, targetId: string, targetType: string): Promise<any> {
    // Query current state before modification
    if (targetId === 'system' || !targetId) return null;
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM ${targetType}s WHERE id = ? LIMIT 1`,
        [targetId],
      );
      return result[0] || null;
    } catch {
      return null;
    }
  }

  private captureAfterState(action: string, responseBody: any, req: Request): any {
    return responseBody;
  }

  private async writeAuditLog(entry: AuditLogEntry): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO admin_logs
        (id, timestamp, actor_id, actor_role, actor_ip, action, target_type, target_id, before_value, after_value, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id, entry.timestamp, entry.actor_id, entry.actor_role,
        entry.actor_ip, entry.action, entry.target_type, entry.target_id,
        entry.before_value, entry.after_value, entry.metadata,
      ],
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    // Remove sensitive fields
    ['password', 'token', 'secret', 'creditCard', 'ssn'].forEach(key => delete sanitized[key]);
    return sanitized;
  }

  private generateUuid(): string {
    return crypto.randomUUID();
  }
}
```

**Registration in module:**

```typescript
// src/app.module.ts
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
```

#### 2.3.2 Database Trigger for Audit Log Backup

```sql
-- MySQL trigger to ensure audit logs are never silently deleted
CREATE TABLE admin_logs_archive LIKE admin_logs;

DELIMITER //

CREATE TRIGGER trg_admin_logs_backup_before_delete
BEFORE DELETE ON admin_logs
FOR EACH ROW
BEGIN
  INSERT INTO admin_logs_archive (
    id, timestamp, actor_id, actor_role, actor_ip,
    action, target_type, target_id, before_value, after_value, metadata
  ) VALUES (
    OLD.id, OLD.timestamp, OLD.actor_id, OLD.actor_role, OLD.actor_ip,
    OLD.action, OLD.target_type, OLD.target_id, OLD.before_value, OLD.after_value, OLD.metadata
  );
END //

CREATE TRIGGER trg_admin_logs_backup_before_update
BEFORE UPDATE ON admin_logs
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Audit logs are immutable and cannot be updated';
END //

DELIMITER ;
```

---

## Section 3 — Data Flow Diagrams

### 3.1 Video Lifecycle & GDPR Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Customer   │────▶│  Vue Frontend │────▶│ NestJS API  │────▶│   AWS S3     │
│ (END_CUSTOMER)│     │               │     │             │     │ (Private Bucket)
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Generate     │
                                       │ Presigned URL │
                                       │ (POST, 15min) │
                                       │ max 500MB    │
                                       └──────────────┘
                                              │
                                              ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   AWS S3     │◀────│ Direct Upload │◀────│   Browser    │◀────│  Customer    │
│ SSE-S3 Enc.  │     │ (multipart)  │     │ (no proxy)   │     │  Uploads Video│
│ Bucket Policy│     └──────────────┘     └──────────────┘     └──────────────┘
│ (no public)  │
└──────────────┘
       │
       │ Event: s3:ObjectCreated:*
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  AI Service  │◀────│  NestJS API   │────▶│  Save Video  │
│  (Mocked)    │     │  (Webhook)    │     │  Record in DB│
│              │     │               │     │  status=PENDING│
│ Process Video│     │ Trigger AI    │     │              │
│ → Inventory  │     │ Analysis Job  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                          │
       │ AI Callback                              │
       ▼                                          ▼
┌──────────────┐                         ┌──────────────┐
│  Update DB   │                         │  Company     │
│  inventory   │                         │  Requests    │
│  status=DONE │                         │  Presigned   │
└──────────────┘                         │  View URL    │
                                         │  (15min)     │
                                         └──────────────┘
```

#### 3.1.1 Video Lifecycle Steps with Security Controls

| Step | Action | Security Control | Responsible |
|------|--------|-----------------|-------------|
| 1 | Customer requests upload | `JwtAuthGuard` + `RolesGuard(['END_CUSTOMER'])` | NestJS |
| 2 | API generates presigned URL | Time-limited (15 min), content-type restricted, max 500MB | S3 + NestJS |
| 3 | Browser uploads directly to S3 | HTTPS only, CORS policy enforced, no public bucket | S3 |
| 4 | S3 event triggers AI processing | Lambda/webhook verifies JWT token, checks video ownership | NestJS |
| 5 | AI returns inventory | PII stripped from AI response (only item types, no faces/audio transcripts) | AI Service |
| 6 | Company views video | Presigned GET URL (15 min), guard verifies company received the request | NestJS + S3 |
| 7 | **Auto-deletion trigger** | Cron job checks: `offer_sent_at IS NOT NULL OR created_at + 30 days` | NestJS Scheduler |
| 8 | S3 object deleted | `DeleteObject` API call with IAM role | S3 |
| 9 | DB record scrubbed | `s3_key` set NULL, `thumbnail_url` set NULL, metadata retained (retention law) | MySQL |
| 10 | Audit log written | `VIDEO_DELETE` entry with actor = `system_cron`, before/after state | `AuditLogInterceptor` |

#### 3.1.2 Video Retention Cron Job (NestJS)

```typescript
// src/modules/videos/video-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { S3Service } from './s3.service';
import { DataSource } from 'typeorm';

@Injectable()
export class VideoCleanupService {
  private readonly logger = new Logger(VideoCleanupService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleVideoCleanup(): Promise<void> {
    this.logger.log('Starting video retention cleanup job...');

    // Find videos past retention:
    // - offer was sent (offers.offer_sent_at IS NOT NULL and linked to this request)
    // - OR video.created_at > 30 days ago
    const expiredVideos = await this.dataSource.query(`
      SELECT v.id, v.s3_key, v.move_request_id, v.created_at
      FROM videos v
      LEFT JOIN move_requests mr ON mr.id = v.move_request_id
      LEFT JOIN offers o ON o.move_request_id = mr.id AND o.status = 'SENT'
      WHERE v.s3_key IS NOT NULL
        AND (
          (o.sent_at IS NOT NULL AND o.sent_at < DATE_SUB(NOW(), INTERVAL 1 DAY))
          OR v.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        )
      LIMIT 100
    `);

    for (const video of expiredVideos) {
      try {
        // 1. Delete from S3
        await this.s3Service.deleteObject(video.s3_key);

        // 2. Scrub DB record (retain metadata for legal compliance)
        await this.dataSource.query(`
          UPDATE videos
          SET s3_key = NULL,
              s3_bucket = NULL,
              thumbnail_url = NULL,
              deleted_at = NOW(),
              deletion_reason = 'RETENTION_POLICY'
          WHERE id = ?
        `, [video.id]);

        // 3. Write manual audit log (system action)
        await this.dataSource.query(`
          INSERT INTO admin_logs
            (id, timestamp, actor_id, actor_role, actor_ip, action, target_type, target_id, before_value, after_value, metadata)
          VALUES (UUID(), NOW(), 'system_cron', 'SYSTEM', '127.0.0.1',
                  'VIDEO_DELETE', 'video', ?, ?, NULL, ?)
        `, [
          video.id,
          JSON.stringify({ s3_key: video.s3_key, created_at: video.created_at }),
          JSON.stringify({ reason: 'RETENTION_POLICY', trigger: 'cron_30d_or_post_offer' }),
        ]);

        this.logger.log(`Deleted video ${video.id}`);
      } catch (err) {
        this.logger.error(`Failed to delete video ${video.id}: ${err.message}`);
      }
    }
  }
}
```

### 3.2 Move Request Flow with Data Visibility

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                            MOVE REQUEST FLOW                                     │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  STEP 1: Customer creates move request                                           │
│  ┌──────────────┐    POST /move-requests                                          │
│  │  Customer    │─────────────────────────────────────────────────────▶           │
│  │ (END_CUSTOMER)│   Visibility: Customer owns. Not visible to anyone yet.      │
│  └──────────────┘                                                                 │
│                            │                                                     │
│                            ▼                                                     │
│  STEP 2: AI Video Analysis (if video uploaded)                                   │
│  ┌──────────────┐    Video → AI Service → Inventory JSON                         │
│  │  AI Service  │─────────────────────────────────────────────────────▶ DB         │
│  │  (Mocked)    │   Visibility: Customer owns. Admin sees metadata only.       │
│  └──────────────┘            Company: NO ACCESS until Step 4                    │
│                            │                                                     │
│                            ▼                                                     │
│  STEP 3: Customer edits inventory & move details                                  │
│  ┌──────────────┐    PATCH /move-requests/:id                                    │
│  │  Customer    │─────────────────────────────────────────────────────▶           │
│  └──────────────┘   Visibility: Customer owns. No external visibility.              │
│                            │                                                     │
│                            ▼                                                     │
│  STEP 4: Customer selects companies & requests offers                              │
│  ┌──────────────┐    POST /move-requests/:id/request-offers                      │
│  │  Customer    │─────────────────────────────────────────────────────▶           │
│  │              │    Body: { company_ids: [...] }                                 │
│  └──────────────┘                                                                 │
│                            │                                                     │
│              ┌─────────────┴─────────────┐                                       │
│              │                           │                                       │
│              ▼                           ▼                                       │
│  ┌──────────────┐              ┌──────────────┐                                 │
│  │ Company A    │              │ Company B    │   Visibility: Each company sees │
│  │ (receives req)│              │ (receives req)│   ONLY their received request  │
│  └──────────────┘              └──────────────┘   + associated video (presigned) │
│         │                            │                                           │
│         ▼                            ▼                                           │
│  STEP 5: Companies create offers                                               │
│  ┌──────────────┐              ┌──────────────┐                                 │
│  │ Company A    │              │ Company B    │   Visibility: Offer visible to  │
│  │ POST /offers │              │ POST /offers │   company (own) + customer (when │
│  │ for req      │              │ for req      │   customer queries offers)       │
│  └──────────────┘              └──────────────┘                                 │
│         │                            │                                           │
│         └─────────────┬──────────────┘                                           │
│                       ▼                                                        │
│  STEP 6: Customer views offers                                                   │
│  ┌──────────────┐    GET /move-requests/:id/offers                               │
│  │  Customer    │◀──────────────────────────────────────────────────              │
│  │              │    Visibility: Customer sees ALL offers for own request            │
│  └──────────────┘    Company A cannot see Company B's offer.                     │
│                       │                                                          │
│                       ▼                                                          │
│  STEP 7: Customer accepts offer                                                  │
│  ┌──────────────┐    POST /offers/:id/accept                                      │
│  │  Customer    │─────────────────────────────────────────────────────▶           │
│  │              │    Visibility: All other offers become EXPIRED                   │
│  └──────────────┘    Accepted company gets customer contact details                │
│                       │                                                          │
│                       ▼                                                          │
│  STEP 8: Move completed → Customer writes review                                 │
│  ┌──────────────┐    POST /reviews                                                 │
│  │  Customer    │─────────────────────────────────────────────────────▶           │
│  │              │    Visibility: Review is public (company + all customers)        │
│  └──────────────┘    Company sees own reviews. Admin sees all.                    │
│                                                                                  │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Data Visibility Matrix by Step:**

| Step | Data Element | Customer | Company A | Company B | Admin |
|------|-------------|:--------:|:---------:|:---------:|:-----:|
| 1 | Move request (draft) | ✅ | ❌ | ❌ | Metadata only |
| 2 | AI inventory | ✅ | ❌ | ❌ | Metadata only |
| 3 | Move details, addresses | ✅ | ❌ | ❌ | Metadata only |
| 4 | Request sent to companies | ✅ | ✅ (received) | ✅ (received) | Metadata only |
| 4 | Video | ✅ | ✅ (presigned) | ✅ (presigned) | ❌ |
| 5 | Company A offer | ❌ | ✅ | ❌ | ✅ |
| 5 | Company B offer | ❌ | ❌ | ✅ | ✅ |
| 6 | All offers | ✅ | ❌ | ❌ | ✅ |
| 7 | Accepted offer | ✅ | ✅ (winner) | ❌ | ✅ |
| 7 | Customer contact (post-accept) | ✅ | ✅ (winner) | ❌ | ✅ |
| 8 | Review | ✅ (public) | ✅ (own) | ❌ | ✅ |

### 3.3 SaaS Mode vs Marketplace Mode Data Isolation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MARKETPLACE MODE (Default)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Customer ──▶ Create Request ──▶ Select 3 Companies ──▶ Broadcast         │
│                                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                              │
│   │ Company A│    │ Company B│    │ Company C│   All receive same request  │
│   │ (sees req)│   │ (sees req)│   │ (sees req)│  + video + inventory      │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘                              │
│        │               │               │                                    │
│        ▼               ▼               ▼                                    │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐                              │
│   │ Offer $500│   │ Offer $450│   │ Offer $600│  Customer sees ALL offers  │
│   └──────────┘    └──────────┘    └──────────┘  + comparison table          │
│                                                                             │
│   DB: move_requests.request_type = 'MARKETPLACE'                            │
│       move_request_companies linking table: (move_request_id, company_id)   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            SAAS MODE (Single-Tenant)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Company X ──▶ Invite Customer ──▶ Email with Token ──▶ Customer Registers │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────┐     │
│   │                    Customer Portal (White-label)                  │     │
│   │  ┌──────────────┐                                               │     │
│   │  │ Company Logo │  Customer sees only Company X branding        │     │
│   │  │ Request Form │  + single offer flow                            │     │
│   │  │ One Offer    │                                               │     │
│   │  └──────────────┘                                               │     │
│   └──────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│   DB: move_requests.request_type = 'SAAS'                                   │
│       move_requests.invited_company_id = Company X ID                       │
│       company_invites: (company_id, email, token, status)                   │
│                                                                             │
│   Query constraint for COMPANY role:                                        │
│       WHERE request_type = 'SAAS' AND invited_company_id = :my_company_id   │
│                                                                             │
│   Query constraint for CUSTOMER:                                            │
│       Returns only their request + single offer from inviting company       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 3.3.1 Database Schema for Mode Discrimination

```sql
-- Core discriminator on move_requests
ALTER TABLE move_requests
  ADD COLUMN request_type ENUM('MARKETPLACE', 'SAAS') NOT NULL DEFAULT 'MARKETPLACE',
  ADD COLUMN invited_company_id UUID NULL,
  ADD CONSTRAINT fk_move_requests_invited_company
    FOREIGN KEY (invited_company_id) REFERENCES companies(id);

-- Invitation tracking for SaaS mode
CREATE TABLE company_invites (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  company_id      UUID NOT NULL,
  email           VARCHAR(255) NOT NULL,
  token           VARCHAR(64) NOT NULL UNIQUE,   -- cryptographically random token
  status          ENUM('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED') DEFAULT 'PENDING',
  expires_at      TIMESTAMP NOT NULL,
  accepted_at     TIMESTAMP NULL,
  accepted_by_user_id UUID NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_invites_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_invites_user FOREIGN KEY (accepted_by_user_id) REFERENCES users(id),
  INDEX idx_invites_token (token),
  INDEX idx_invites_email (email),
  INDEX idx_invites_company (company_id)
) ENGINE=InnoDB;

-- Bridge table for marketplace multi-company broadcast
CREATE TABLE move_request_companies (
  move_request_id UUID NOT NULL,
  company_id      UUID NOT NULL,
  invited_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  viewed_at       TIMESTAMP NULL,
  offer_id        UUID NULL,
  PRIMARY KEY (move_request_id, company_id),
  CONSTRAINT fk_mrc_request FOREIGN KEY (move_request_id) REFERENCES move_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_mrc_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_mrc_company (company_id)
) ENGINE=InnoDB;

-- View for enforcing SaaS vs Marketplace visibility in queries
CREATE VIEW v_move_request_visibility AS
SELECT
  mr.id,
  mr.customer_id,
  mr.request_type,
  mr.invited_company_id,
  CASE
    WHEN mr.request_type = 'SAAS' THEN mr.invited_company_id
    ELSE NULL
  END AS visible_to_company_id
FROM move_requests mr;
```

#### 3.3.2 Service Layer Isolation Logic (TypeScript)

```typescript
// src/modules/move-requests/move-request.service.ts
@Injectable()
export class MoveRequestService {

  async findVisibleForCompany(companyId: string, pagination: PaginationDto) {
    // Marketplace: requests sent to this company via bridge table
    // SaaS: requests where invited_company_id = this company
    const query = `
      SELECT DISTINCT mr.*
      FROM move_requests mr
      LEFT JOIN move_request_companies mrc
        ON mrc.move_request_id = mr.id AND mrc.company_id = ?
      WHERE (
        (mr.request_type = 'MARKETPLACE' AND mrc.company_id = ?)
        OR
        (mr.request_type = 'SAAS' AND mr.invited_company_id = ?)
      )
      AND mr.status NOT IN ('DRAFT', 'CANCELLED')
      ORDER BY mr.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return this.dataSource.query(query, [companyId, companyId, companyId, pagination.limit, pagination.offset]);
  }

  async findVisibleForCustomer(userId: string, pagination: PaginationDto) {
    // Customer sees own requests regardless of mode
    const query = `
      SELECT mr.*,
        COUNT(DISTINCT o.id) AS offer_count,
        CASE
          WHEN mr.request_type = 'SAAS' THEN c.name
          ELSE NULL
        END AS invited_company_name
      FROM move_requests mr
      LEFT JOIN companies c ON c.id = mr.invited_company_id
      LEFT JOIN offers o ON o.move_request_id = mr.id
      WHERE mr.customer_id = ?
      GROUP BY mr.id
      ORDER BY mr.created_at DESC
      LIMIT ? OFFSET ?
    `;
    return this.dataSource.query(query, [userId, pagination.limit, pagination.offset]);
  }

  async createSaaSInvitation(companyId: string, dto: InviteCustomerDto) {
    // Company invites customer to SaaS mode
    const token = crypto.randomBytes(32).toString('hex');
    await this.dataSource.query(`
      INSERT INTO company_invites (company_id, email, token, status, expires_at)
      VALUES (?, ?, ?, 'PENDING', DATE_ADD(NOW(), INTERVAL 7 DAY))
    `, [companyId, dto.email, token]);

    // Send email with invitation link containing token
    await this.emailService.sendInvitation(dto.email, token, companyId);
    return { token };
  }
}
```

---

## Section 4 — Security & Data Handling

### 4.1 Authentication

#### 4.1.1 Supabase Auth Integration Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Client     │─────▶│  Supabase    │─────▶│   Supabase   │
│  (Vue 3)     │◀─────│   Auth       │◀─────│    DB        │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │
       │  JWT (RS256)        │
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  LocalStorage│      │  NestJS API  │
│  access_token│─────▶│              │
│  refresh_token     │  Supabase    │
│              │      │  JWT Verify  │
└──────────────┘      └──────────────┘
```

**Client-side (Vue 3 + Pinia):**

```typescript
// stores/auth.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabase: SupabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: localStorage.getItem('mm_access_token'),
    refreshToken: localStorage.getItem('mm_refresh_token'),
  }),

  actions: {
    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.user = data.user;
      this.accessToken = data.session.access_token;
      this.refreshToken = data.session.refresh_token;
      localStorage.setItem('mm_access_token', data.session.access_token);
      localStorage.setItem('mm_refresh_token', data.session.refresh_token);
      // Sync role to local DB via NestJS registration endpoint if new user
      await this.syncUserToBackend(data.user, data.session.access_token);
    },

    async refreshSession() {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: this.refreshToken!,
      });
      if (error) throw error;
      this.accessToken = data.session.access_token;
      this.refreshToken = data.session.refresh_token;
      localStorage.setItem('mm_access_token', data.session.access_token);
      localStorage.setItem('mm_refresh_token', data.session.refresh_token);
    },

    async signOut() {
      await supabase.auth.signOut();
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('mm_access_token');
      localStorage.removeItem('mm_refresh_token');
      // Call backend to revoke/blacklist if implementing token blacklist
      await fetch('/api/v1/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${this.accessToken}` } });
    },
  },
});
```

#### 4.1.2 JWT Structure and Claims

Supabase Auth issues RS256-signed JWTs with the following claims. MyMove enriches these with application-specific role data from the local database.

**Supabase JWT Payload (standard):**

```json
{
  "aud": "authenticated",
  "exp": 1737465600,
  "iat": 1737462000,
  "iss": "https://<project>.supabase.co/auth/v1",
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "customer@example.com",
  "phone": "",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "full_name": "Jane Doe"
  },
  "role": "authenticated",
  "aal": "aal1",
  "amr": [{ "method": "password", "timestamp": 1737462000 }]
}
```

**MyMove Enriched Context (after `JwtAuthGuard` enrichment):**

```typescript
interface CurrentUserPayload {
  sub: string;              // Supabase user UUID → maps to users.id
  email: string;
  role: 'END_CUSTOMER' | 'COMPANY' | 'ADMIN';
  company_id?: string;      // FK to companies.id, set only for COMPANY role
  iat: number;              // issued at
  exp: number;              // expires at
}
```

**Key design decisions:**
- Role is **NOT stored in Supabase JWT** to avoid token bloat and stale claims. Role is fetched from local MySQL on every request (cached in Redis for 5 minutes).
- This ensures instant role revocation (e.g., suspend company) without waiting for JWT expiry.
- JWT expiry is short (1 hour). Refresh token rotates on every use.

#### 4.1.3 Token Refresh Strategy

| Aspect | Implementation |
|--------|---------------|
| Access token TTL | 60 minutes (Supabase default, configurable) |
| Refresh token TTL | 30 days (or until explicit logout) |
| Rotation | Enabled — new refresh token issued per refresh, old invalidated |
| Auto-refresh | Client intercepts 401, attempts refresh, retries original request |
| Backend trust | Backend only validates access tokens; refresh is client ↔ Supabase |
| Logout | Client calls `supabase.auth.signOut()` + backend clears any server-side cache |

#### 4.1.4 Logout & Token Revocation

```typescript
// src/modules/auth/auth.controller.ts
@Controller('auth')
export class AuthController {

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: CurrentUserPayload, @Headers('authorization') auth: string) {
    const token = auth.replace('Bearer ', '');

    // Add token to Redis revocation list (TTL = remaining JWT expiry)
    const decoded = jwt.decode(token) as { exp: number };
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await this.redis.setex(`revoked_token:${token}`, ttl, '1');
    }

    // Audit log
    await this.auditService.log({
      action: 'USER_LOGOUT',
      actor_id: user.sub,
      actor_role: user.role,
      target_type: 'user',
      target_id: user.sub,
    });

    return { message: 'Logged out successfully' };
  }
}
```

**Redis check in JwtAuthGuard (augmented):**

```typescript
// Inside JwtAuthGuard.canActivate, after JWT verification:
const isRevoked = await this.redis.get(`revoked_token:${token}`);
if (isRevoked) {
  throw new UnauthorizedException('Token has been revoked');
}
```

### 4.2 Authorization

#### 4.2.1 Resource-Level Access Control

Every data access must answer: **"Can user X access resource Y?"**

Implemented via a three-layer defense:

1. **Authentication layer**: `JwtAuthGuard` — is the user who they claim?
2. **Role layer**: `RolesGuard` — is the user's role allowed for this operation?
3. **Ownership layer**: `DataOwnershipGuard` / `CompanyOwnershipGuard` — does the user own this specific resource?

**Resource ownership resolution table:**

| Resource Table | Owner Column (END_CUSTOMER) | Owner Column (COMPANY) | Admin Bypass |
|---------------|----------------------------|------------------------|--------------|
| `users` | `id` (self) | `id` (self) | ✅ |
| `move_requests` | `customer_id` | `move_request_companies.company_id` (via bridge) | ✅ |
| `videos` | `move_requests.customer_id` (via join) | `move_request_companies.company_id` | ❌ |
| `offers` | `move_requests.customer_id` (via join) | `company_id` | ✅ |
| `reviews` | `customer_id` | `company_id` (target) | ✅ |
| `companies` | N/A | `id` (self) | ✅ |
| `company_documents` | N/A | `company_id` | ✅ |

#### 4.2.2 Ownership Verification Middleware (Query-Level)

```typescript
// src/common/guards/ownership-middleware.service.ts
@Injectable()
export class OwnershipMiddlewareService {
  constructor(private dataSource: DataSource) {}

  async canAccessMoveRequest(user: CurrentUserPayload, moveRequestId: string): Promise<boolean> {
    if (user.role === 'ADMIN') return true;

    if (user.role === 'END_CUSTOMER') {
      const [row] = await this.dataSource.query(
        `SELECT 1 FROM move_requests WHERE id = ? AND customer_id = ? LIMIT 1`,
        [moveRequestId, user.sub],
      );
      return !!row;
    }

    if (user.role === 'COMPANY') {
      const [row] = await this.dataSource.query(`
        SELECT 1 FROM move_requests mr
        LEFT JOIN move_request_companies mrc
          ON mrc.move_request_id = mr.id AND mrc.company_id = ?
        WHERE mr.id = ?
          AND (
            (mr.request_type = 'MARKETPLACE' AND mrc.company_id IS NOT NULL)
            OR (mr.request_type = 'SAAS' AND mr.invited_company_id = ?)
          )
        LIMIT 1
      `, [user.company_id, moveRequestId, user.company_id]);
      return !!row;
    }

    return false;
  }

  async canAccessOffer(user: CurrentUserPayload, offerId: string): Promise<boolean> {
    if (user.role === 'ADMIN') return true;

    if (user.role === 'COMPANY') {
      const [row] = await this.dataSource.query(
        `SELECT 1 FROM offers WHERE id = ? AND company_id = ? LIMIT 1`,
        [offerId, user.company_id],
      );
      return !!row;
    }

    if (user.role === 'END_CUSTOMER') {
      const [row] = await this.dataSource.query(`
        SELECT 1 FROM offers o
        JOIN move_requests mr ON mr.id = o.move_request_id
        WHERE o.id = ? AND mr.customer_id = ?
        LIMIT 1
      `, [offerId, user.sub]);
      return !!row;
    }

    return false;
  }

  async canAccessVideo(user: CurrentUserPayload, videoId: string): Promise<boolean> {
    // Admins NEVER get video access (GDPR: video contains personal belongings)
    if (user.role === 'ADMIN') return false;

    if (user.role === 'END_CUSTOMER') {
      const [row] = await this.dataSource.query(`
        SELECT 1 FROM videos v
        JOIN move_requests mr ON mr.id = v.move_request_id
        WHERE v.id = ? AND mr.customer_id = ?
        LIMIT 1
      `, [videoId, user.sub]);
      return !!row;
    }

    if (user.role === 'COMPANY') {
      const [row] = await this.dataSource.query(`
        SELECT 1 FROM videos v
        JOIN move_requests mr ON mr.id = v.move_request_id
        LEFT JOIN move_request_companies mrc
          ON mrc.move_request_id = mr.id AND mrc.company_id = ?
        WHERE v.id = ?
          AND v.s3_key IS NOT NULL
          AND (
            (mr.request_type = 'MARKETPLACE' AND mrc.company_id IS NOT NULL)
            OR (mr.request_type = 'SAAS' AND mr.invited_company_id = ?)
          )
        LIMIT 1
      `, [user.company_id, videoId, user.company_id]);
      return !!row;
    }

    return false;
  }
}
```

#### 4.2.3 Cross-Company Data Leak Prevention

**Threat**: Company A manipulates request parameters to access Company B's offers, pricing, or customer data.

**Defenses:**

| Defense | Implementation |
|---------|---------------|
| Query scoping | Every query scoped by `company_id` for COMPANY role |
| Parameterized queries | Never raw string interpolation; always `?` placeholders |
| ID validation | All `:id` params validated as UUID format |
| Response filtering | DTO serialization excludes unauthorized nested objects |
| Error masking | 404 returned instead of 403 for unauthorized resources (prevent ID enumeration) |

```typescript
// src/common/filters/authorization-exception.filter.ts
@Catch(ForbiddenException)
export class AuthorizationExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Return 404 for forbidden resources to prevent ID enumeration
    if (request.params.id) {
      response.status(404).json({
        statusCode: 404,
        message: 'Resource not found',
      });
      return;
    }

    response.status(403).json({
      statusCode: 403,
      message: 'Access denied',
    });
  }
}
```

### 4.3 File Security

#### 4.3.1 S3 Bucket Configuration

**Bucket Policy (Private, No Public Access):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedConnections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::mymove-private-uploads",
        "arn:aws:s3:::mymove-private-uploads/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    },
    {
      "Sid": "DenyPublicRead",
      "Effect": "Deny",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectVersion"
      ],
      "Resource": "arn:aws:s3:::mymove-private-uploads/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-acl": ["public-read", "public-read-write"]
        }
      }
    },
    {
      "Sid": "AllowApplicationAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/mymove-api-ec2-role"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::mymove-private-uploads",
        "arn:aws:s3:::mymove-private-uploads/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "true"
        }
      }
    }
  ]
}
```

**Bucket CORS Configuration (Strict):**

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["Content-Type", "x-amz-meta-*"],
      "AllowedMethods": ["POST", "PUT", "GET"],
      "AllowedOrigins": [
        "https://mymove.app",
        "https://*.mymove.app",
        "https://admin.mymove.app"
      ],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 300
    }
  ]
}
```

**Server-Side Encryption (SSE-S3 / SSE-KMS):**

```json
{
  "Rules": [
    {
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "arn:aws:kms:us-east-1:123456789012:key/mymove-s3-key"
      },
      "BucketKeyEnabled": true
    }
  ]
}
```

#### 4.3.2 Presigned URL Generation (NestJS)

```typescript
// src/modules/videos/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.getOrThrow('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = this.config.getOrThrow('S3_BUCKET_NAME');
  }

  async generateUploadPresignedUrl(
    key: string,
    contentType: string,
    maxSizeBytes: number = 500 * 1024 * 1024, // 500MB
  ): Promise<{ url: string; fields: Record<string, string> }> {
    // Validate content type — only video files
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!allowedTypes.includes(contentType)) {
      throw new Error('Invalid content type. Only video files are allowed.');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      // Enforce server-side encryption
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: this.config.get('S3_KMS_KEY_ID'),
      // Metadata for tracking
      Metadata: {
        'upload-purpose': 'move-inventory-video',
        'platform': 'mymove',
      },
    });

    // 15-minute expiry for upload URL
    const url = await getSignedUrl(this.s3, command, { expiresIn: 900 });
    return { url, fields: {} };
  }

  async generateViewPresignedUrl(key: string): Promise<string> {
    if (!key) throw new Error('Invalid S3 key');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    // 15-minute expiry for viewing
    return getSignedUrl(this.s3, command, { expiresIn: 900 });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.s3.send(command);
  }

  // Generate a structured S3 key path for organization and lifecycle rules
  generateKey(userId: string, requestId: string, filename: string): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    return `uploads/${userId}/${requestId}/${timestamp}_${sanitized}`;
  }
}
```

#### 4.3.3 File Validation & Limits

| Constraint | Value | Enforcement |
|-----------|-------|-------------|
| Max file size | 500 MB | S3 presigned URL condition + client validation |
| Allowed types | MP4, MOV, AVI, WebM | Content-Type whitelist in presigned URL + S3 policy |
| Filename sanitization | Alphanumeric + `.-_` | Regex replacement before S3 key generation |
| Virus scanning | Future | Integrate ClamAV / AWS Macie post-MVP |
| Duplicate prevention | UUID in key path | Unique S3 key per upload |

#### 4.3.4 Lifecycle Rules (S3)

```json
{
  "Rules": [
    {
      "ID": "abort-incomplete-multipart-uploads",
      "Status": "Enabled",
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 1
      }
    },
    {
      "ID": "move-completed-videos-to-glacier",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "uploads/"
      },
      "Transitions": [
        {
          "Days": 7,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

> **Note**: The application-layer deletion (Section 3.1.2 cron job) runs BEFORE S3 lifecycle expiration to ensure proper audit logging and DB scrubbing. S3 lifecycle serves as a safety net.

### 4.4 GDPR Compliance

#### 4.4.1 GDPR Principles Mapping

| GDPR Principle | MyMove Implementation |
|---------------|----------------------|
| **Lawfulness, Fairness, Transparency** | Privacy policy v1.0 mandatory at signup. Granular consent checkboxes. |
| **Purpose Limitation** | Video data used ONLY for moving quotes. AI analysis extracts inventory only. No facial recognition. |
| **Data Minimization** | Collect: name, email, phone, addresses. Do NOT collect: SSN, DOB (unless legally required), financial details. |
| **Accuracy** | Profile edit endpoints. Company profile verification workflow. |
| **Storage Limitation** | Videos: 30 days max. Move requests: 2 years then anonymized. Audit logs: 3 years. |
| **Integrity & Confidentiality** | Encryption at rest (S3 SSE-KMS, MySQL SSL). Encryption in transit (TLS 1.3). RBAC access control. |
| **Accountability** | Audit logs for all admin/company actions. DPA with companies. |

#### 4.4.2 Consent Management

```sql
-- Consent tracking table
CREATE TABLE user_consents (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  user_id         UUID NOT NULL,
  consent_type    ENUM('TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'VIDEO_UPLOAD', 'MARKETING_EMAILS', 'COMPANY_DPA') NOT NULL,
  version         VARCHAR(20) NOT NULL,   -- e.g., 'v1.0', 'v2.1'
  accepted_at     TIMESTAMP NOT NULL,
  ip_address      VARCHAR(45),            -- IPv6 compatible
  user_agent      TEXT,
  revoked_at      TIMESTAMP NULL,

  CONSTRAINT fk_consents_user FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY uk_user_consent_type (user_id, consent_type, version)
) ENGINE=InnoDB;
```

**Consent validation at video upload:**

```typescript
// src/modules/videos/video.controller.ts
@Post('upload-request')
@Roles('END_CUSTOMER')
async requestUpload(
  @CurrentUser() user: CurrentUserPayload,
  @Body() dto: RequestUploadDto,
) {
  // Verify explicit video upload consent
  const hasConsent = await this.consentService.hasValidConsent(
    user.sub,
    'VIDEO_UPLOAD',
    'v1.0', // current required version
  );

  if (!hasConsent) {
    throw new ForbiddenException(
      'Explicit consent required for video upload. Please accept the video upload terms in your profile settings.',
    );
  }

  return this.videoService.createUploadRequest(user.sub, dto);
}
```

#### 4.4.3 Data Subject Rights Implementation

| Right | Endpoint | Implementation |
|-------|----------|---------------|
| **Right to Access** | `GET /me/data-export` | Async job generates ZIP with all personal data. Emailed within 72 hours. |
| **Right to Rectification** | `PATCH /me/profile` | Direct edit for name, email, phone, addresses. |
| **Right to Erasure** | `DELETE /me/account` | Soft delete + 30-day grace period. After grace: hard delete PII, anonymize reviews/offers. |
| **Right to Portability** | `GET /me/data-export?format=machine` | JSON/CSV export of all user data. |
| **Right to Restrict Processing** | `POST /me/restrict-processing` | Flags account. No new offers, no marketing. Retains data for legal obligations. |
| **Right to Object** | `POST /me/object-processing` | Opt-out of AI analysis for specific request. Manual inventory process. |

**Account Deletion Service:**

```typescript
// src/modules/users/account-deletion.service.ts
@Injectable()
export class AccountDeletionService {

  async initiateDeletion(userId: string): Promise<void> {
    // 1. Soft-delete: mark user as scheduled_for_deletion_at = NOW() + 30 days
    await this.dataSource.query(`
      UPDATE users SET status = 'PENDING_DELETION', scheduled_deletion_at = DATE_ADD(NOW(), INTERVAL 30 DAY)
      WHERE id = ?
    `, [userId]);

    // 2. Cancel all pending move requests
    await this.dataSource.query(`
      UPDATE move_requests SET status = 'CANCELLED', cancelled_reason = 'USER_DELETION'
      WHERE customer_id = ? AND status IN ('DRAFT', 'PENDING', 'REQUESTED')
    `, [userId]);

    // 3. Trigger immediate video deletion
    const videos = await this.dataSource.query(`
      SELECT v.id, v.s3_key FROM videos v
      JOIN move_requests mr ON mr.id = v.move_request_id
      WHERE mr.customer_id = ? AND v.s3_key IS NOT NULL
    `, [userId]);

    for (const video of videos) {
      await this.videoCleanupService.deleteVideoImmediate(video.id, video.s3_key);
    }

    // 4. Notify companies with pending offers
    const affectedCompanies = await this.dataSource.query(`
      SELECT DISTINCT o.company_id FROM offers o
      JOIN move_requests mr ON mr.id = o.move_request_id
      WHERE mr.customer_id = ? AND o.status IN ('DRAFT', 'SENT')
    `, [userId]);

    for (const company of affectedCompanies) {
      await this.notificationService.notifyCompanyUserDeleted(company.company_id, userId);
    }

    // 5. Log deletion initiation
    await this.auditService.log({
      action: 'ACCOUNT_DELETION_INITIATED',
      actor_id: userId,
      actor_role: 'END_CUSTOMER',
      target_type: 'user',
      target_id: userId,
    });
  }

  async finalizeDeletion(userId: string): Promise<void> {
    // Called by cron job after 30-day grace period
    // 1. Anonymize move requests (retain for analytics/legal)
    await this.dataSource.query(`
      UPDATE move_requests
      SET customer_id = NULL,
          from_address = '[REDACTED]',
          to_address = '[REDACTED]',
          contact_phone = NULL,
          notes = NULL
      WHERE customer_id = ?
    `, [userId]);

    // 2. Anonymize reviews (retain rating, remove text + name)
    await this.dataSource.query(`
      UPDATE reviews
      SET reviewer_name = '[DELETED_USER]',
          review_text = CASE WHEN is_public = FALSE THEN '[REDACTED]' ELSE review_text END,
          customer_id = NULL
      WHERE customer_id = ?
    `, [userId]);

    // 3. Delete user record
    await this.dataSource.query(`DELETE FROM users WHERE id = ?`, [userId]);

    // 4. Delete consents
    await this.dataSource.query(`DELETE FROM user_consents WHERE user_id = ?`, [userId]);

    // 5. Log
    await this.auditService.log({
      action: 'ACCOUNT_DELETION_FINALIZED',
      actor_id: 'system_cron',
      actor_role: 'SYSTEM',
      target_type: 'user',
      target_id: userId,
    });
  }
}
```

#### 4.4.4 Data Processing Agreement (DPA) for Companies

```sql
-- Company DPA acceptance tracking
CREATE TABLE company_dpa_signatures (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  company_id      UUID NOT NULL,
  dpa_version     VARCHAR(20) NOT NULL,
  signed_by_user_id UUID NOT NULL,
  signed_at       TIMESTAMP NOT NULL,
  ip_address      VARCHAR(45),
  document_url    VARCHAR(500),  -- S3 URL to signed PDF

  CONSTRAINT fk_dpa_company FOREIGN KEY (company_id) REFERENCES companies(id),
  CONSTRAINT fk_dpa_user FOREIGN KEY (signed_by_user_id) REFERENCES users(id),
  UNIQUE KEY uk_company_dpa (company_id, dpa_version)
) ENGINE=InnoDB;
```

**DPA Enforcement:**
- Company cannot receive marketplace requests until DPA is signed.
- Company cannot invite SaaS customers until DPA is signed.
- DPA covers: data processor obligations, subprocessor list (AWS, AI service), breach notification timeline (72 hours), data return/deletion on contract termination.

### 4.5 Data Retention Policy

| # | Data Type | Retention Period | Action After Retention | Legal Basis |
|---|-----------|-----------------|----------------------|-------------|
| 1 | **Videos** | 30 days OR after offer sent + 24 hours | Auto-delete from S3, DB scrubbed | Art. 5(1)(e) GDPR — storage limitation |
| 2 | **AI Analysis Results** | Same as linked video | Deleted with video | Purpose limitation |
| 3 | **Move Requests** | 2 years from completion | Anonymize: remove customer_id, addresses, phone | Legal obligation (tax/commercial law) |
| 4 | **Offers** | 2 years from creation | Archive to cold storage, anonymize pricing metadata | Legal obligation |
| 5 | **Reviews** | Indefinite (or until user requests deletion) | Allow user deletion request; anonymize reviewer_name if account deleted | Legitimate interest (public reviews) |
| 6 | **Company Documents** (trade licenses) | Until account closure + 1 year | Delete from S3 and DB | Contract performance |
| 7 | **Audit Logs** | 3 years | Archive to S3 Glacier, delete after 7 years | Legal obligation (accountability) |
| 8 | **User Consents** | Duration of relationship + 2 years | Retain proof of consent even after account deletion | Legal obligation (demonstrable consent) |
| 9 | **Failed Login Attempts** | 90 days | Delete | Security legitimate interest |
| 10 | **Session/Token Records** | Token expiry + 7 days | Delete | Security legitimate interest |

**Automated Enforcement:**
- Daily cron job at 02:00 UTC for video cleanup.
- Monthly cron job at 01:00 UTC for move request anonymization.
- Yearly cron job for audit log archiving.

---

## Section 5 — API Security

### 5.1 Rate Limiting

Implemented via `@nestjs/throttler` with Redis store.

| Endpoint Category | Limit | Window | Scope | Notes |
|------------------|-------|--------|-------|-------|
| Authentication (login, register) | 5 requests | 1 minute | IP + email | Prevents brute force |
| Password reset | 3 requests | 1 hour | IP + email | Prevents email abuse |
| Video upload request | 10 requests | 1 hour | User ID | Prevents storage abuse |
| General API (read) | 100 requests | 1 minute | User ID | Standard read operations |
| General API (write) | 30 requests | 1 minute | User ID | Create/update operations |
| Admin endpoints | 60 requests | 1 minute | User ID | Admin bulk operations |
| Public endpoints (company list) | 50 requests | 1 minute | IP | Unauthenticated browsing |
| Offer creation | 20 requests | 1 minute | Company ID | Prevents spam offers |

```typescript
// src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,        // 1 minute
          limit: 100,        // default
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

```typescript
// src/modules/auth/auth.controller.ts — custom rate limits
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {

  @Post('login')
  @Throttle(5, 60)  // 5 per minute
  async login(@Body() dto: LoginDto) { ... }

  @Post('register')
  @Throttle(3, 300) // 3 per 5 minutes
  async register(@Body() dto: RegisterDto) { ... }
}

// src/modules/videos/video.controller.ts
@Post('upload-request')
@Throttle(10, 3600) // 10 per hour
@Roles('END_CUSTOMER')
async requestUpload(...) { ... }
```

### 5.2 CORS Configuration

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://mymove.app',
      'https://www.mymove.app',
      'https://admin.mymove.app',
      // SaaS white-label subdomains validated dynamically
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Client-Version'],
    exposedHeaders: ['X-Request-ID'],
    credentials: true,
    maxAge: 86400,
    // Dynamic origin check for SaaS subdomains
    origin: (origin, callback) => {
      const allowedOrigins = [
        /^https:\/\/mymove\.app$/,
        /^https:\/\/.*\.mymove\.app$/,
        /^https:\/\/admin\.mymove\.app$/,
      ];
      if (!origin || allowedOrigins.some(rx => rx.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });

  await app.listen(3000);
}
bootstrap();
```

### 5.3 Helmet.js Security Headers

```typescript
// src/main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // required for Vue 3
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.supabase.co", "https://*.amazonaws.com"],
        mediaSrc: ["'self'", "https://*.amazonaws.com"], // video playback
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // allow video embeds from S3
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // S3 video playback
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hidePoweredBy: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    xssFilter: true,
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
  }));

  await app.listen(3000);
}
```

### 5.4 Input Validation Strategy

```typescript
// src/common/pipes/validation.pipe.ts
import { ValidationPipe } from '@nestjs/common';

// Global validation pipe configuration
app.useGlobalPipe(new ValidationPipe({
  whitelist: true,              // strip non-decorated properties
  forbidNonWhitelisted: true,   // throw on non-decorated properties
  transform: true,              // auto-transform types
  transformOptions: {
    enableImplicitConversion: false,
  },
  errorHttpStatusCode: 422,
}));
```

**Example DTO with strict validation:**

```typescript
// src/modules/move-requests/dto/create-move-request.dto.ts
import { IsString, IsUUID, IsEnum, IsOptional, Length, IsDateString, IsArray, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMoveRequestDto {
  @IsEnum(['MARKETPLACE', 'SAAS'])
  requestType: 'MARKETPLACE' | 'SAAS';

  @IsOptional()
  @IsUUID()
  invitedCompanyId?: string;  // required only if SAAS

  @IsString()
  @Length(5, 200)
  fromAddress: string;

  @IsString()
  @Length(5, 200)
  toAddress: string;

  @IsDateString()
  moveDate: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('4', { each: true })
  requestedCompanyIds?: string[];  // for marketplace mode
}

export class RequestUploadDto {
  @IsUUID()
  moveRequestId: string;

  @IsString()
  @Length(1, 200)
  fileName: string;

  @IsString()
  contentType: string;
}
```

### 5.5 SQL Injection Prevention

**Rule**: All database queries use parameterized statements. No string interpolation of user input.

```typescript
// ✅ CORRECT — parameterized query
const result = await this.dataSource.query(
  `SELECT * FROM move_requests WHERE id = ? AND customer_id = ?`,
  [requestId, userId],
);

// ❌ WRONG — never do this
const result = await this.dataSource.query(
  `SELECT * FROM move_requests WHERE id = '${requestId}'`,  // SQL injection risk!
);
```

**Additional defenses:**
- TypeORM query builder for complex queries (auto-parameterizes)
- Input validation ensures UUID format before DB queries
- Database user with minimal privileges (no DROP, no GRANT)
- Read replicas for SELECT queries; write master for mutations

### 5.6 XSS Prevention

| Layer | Defense |
|-------|---------|
| Input | ValidationPipe strips HTML tags; `class-validator` `@IsString()` with length limits |
| Storage | No HTML stored in DB; all text treated as plain text |
| Output | Vue 3 auto-escapes `{{ }}` interpolations; `v-html` banned by ESLint rule |
| API | Content-Type always `application/json`; never `text/html` for API responses |
| Headers | `X-Content-Type-Options: nosniff`, CSP `default-src 'self'` |

**ESLint rule for Vue 3 (ban v-html):**

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'vue/no-v-html': 'error',
  },
};
```

---

## Section 6 — Audit & Monitoring

### 6.1 What Gets Logged

| # | Event Category | Specific Events | Log Level | Retention |
|---|---------------|-----------------|-----------|-----------|
| 1 | **Authentication** | Login success, login failure, logout, token refresh, password reset request, password change | INFO / WARN | 90 days |
| 2 | **Admin Actions** | Company approve, company reject, company suspend, commission update, user deletion, config change | INFO | 3 years |
| 3 | **Company Actions** | Offer create, offer send, offer update, document upload, team member add/remove, pricing rule update | INFO | 2 years |
| 4 | **Customer Actions** | Move request create, move request cancel, offer accept, review write, video upload, profile update | INFO | 2 years |
| 5 | **Data Lifecycle** | Video auto-deletion, account deletion initiated, account deletion finalized, move request anonymization | INFO | 3 years |
| 6 | **Security Events** | Rate limit hit, ownership check failure, suspicious bulk request, CORS violation | WARN | 1 year |
| 7 | **System Events** | Deployment, backup completion, cron job start/end, error alerts | INFO | 1 year |

### 6.2 Log Structure

**Standardized audit log entry (`admin_logs` table):**

```sql
CREATE TABLE admin_logs (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  timestamp       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actor_id        VARCHAR(36) NOT NULL,        -- user UUID or 'system_cron', 'system_event'
  actor_role      VARCHAR(20) NOT NULL,        -- 'END_CUSTOMER', 'COMPANY', 'ADMIN', 'SYSTEM'
  actor_ip        VARCHAR(45) NOT NULL,        -- IPv6 compatible
  action          VARCHAR(50) NOT NULL,        -- enum of known actions
  target_type     VARCHAR(30) NOT NULL,        -- resource type
  target_id       VARCHAR(36) NOT NULL,        -- resource UUID
  before_value    JSON NULL,                   -- snapshot before change
  after_value     JSON NULL,                   -- snapshot after change
  metadata        JSON NULL,                   -- user-agent, route, sanitized body
  severity        ENUM('INFO', 'WARN', 'ERROR') DEFAULT 'INFO',

  INDEX idx_logs_timestamp (timestamp),
  INDEX idx_logs_actor (actor_id),
  INDEX idx_logs_action (action),
  INDEX idx_logs_target (target_type, target_id),
  INDEX idx_logs_severity_timestamp (severity, timestamp)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
```

**Example JSON structure:**

```json
{
  "id": "a1b2c3d4-...",
  "timestamp": "2025-01-21T10:30:00.123Z",
  "actor_id": "user-123",
  "actor_role": "ADMIN",
  "actor_ip": "203.0.113.45",
  "action": "COMPANY_APPROVE",
  "target_type": "company",
  "target_id": "comp-456",
  "before_value": {
    "status": "PENDING_VERIFICATION",
    "verified_at": null,
    "verified_by": null
  },
  "after_value": {
    "status": "APPROVED",
    "verified_at": "2025-01-21T10:30:00.000Z",
    "verified_by": "user-123"
  },
  "metadata": {
    "userAgent": "Mozilla/5.0 ...",
    "route": "POST /admin/companies/comp-456/approve",
    "body": {}
  },
  "severity": "INFO"
}
```

### 6.3 Alert Conditions & Thresholds

| Alert ID | Condition | Threshold | Severity | Response Action |
|----------|-----------|-----------|----------|-----------------|
| AUTH-001 | Failed login attempts for same account | 5 failures in 10 minutes | WARN | Rate limit + notify user via email |
| AUTH-002 | Failed login attempts from same IP | 20 failures in 10 minutes | CRITICAL | IP temporary block (1 hour) + alert admin |
| AUTH-003 | Login from new location / device | First-time IP + country | INFO | Email notification to user |
| COMP-001 | Company rating drops | Average < 2.0 stars | WARN | Auto-flag for admin review |
| COMP-002 | Bulk offer creation | > 50 offers in 1 hour | WARN | Rate limit + review queue |
| COMP-003 | Suspicious pricing | Offer 50% below market average | INFO | Flag for manual review |
| VID-001 | Video download attempts by unauthorized company | Any failure | ERROR | Immediate block + admin alert |
| SYS-001 | Database connection failures | > 3 in 5 minutes | CRITICAL | Page on-call engineer |
| SYS-002 | S3 upload failure rate | > 5% in 10 minutes | CRITICAL | Alert DevOps |
| GDPR-001 | Video past retention not deleted | Any video > 35 days | CRITICAL | Escalate to compliance officer |

**Alerting Pipeline:**

```
NestJS App ──▶ Winston Logger ──▶ CloudWatch Logs ──▶ CloudWatch Alarms
                                      │
                                      ▼
                              PagerDuty / Slack / Email
```

### 6.4 Winston Logger Configuration

```typescript
// src/common/logger/winston.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // File transport for audit logs (separate from application logs)
    new winston.transports.File({
      filename: 'logs/audit.json.log',
      level: 'info',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: 'logs/error.json.log',
      level: 'error',
      format: winston.format.json(),
    }),
  ],
});
```

---

## Section 7 — Infrastructure Security

### 7.1 Environment Variable Security

**Golden Rule**: `.env` files NEVER committed to version control.

**Required environment variables:**

```bash
# .env.example (safe to commit — no real values)
# === Supabase ===
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=                    # Client-side key (RLS policies)
SUPABASE_SERVICE_KEY=                 # Server-side only (bypasses RLS)

# === Database ===
DATABASE_URL=mysql://user:pass@host:3306/mymove?ssl=true
DATABASE_SSL_CA_PATH=/path/to/ca.pem

# === AWS ===
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=                      # IAM user with S3-only access
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=mymove-private-uploads
S3_KMS_KEY_ID=arn:aws:kms:...:key/...

# === Redis (for rate limiting, token revocation) ===
REDIS_URL=redis://host:6379/0

# === Application ===
NODE_ENV=production
APP_PORT=3000
API_VERSION=v1
ENCRYPTION_KEY=                         # For any local encryption needs

# === Monitoring ===
LOG_LEVEL=info
ALERT_WEBHOOK_URL=                      # Slack/PagerDuty webhook
```

**Security measures:**
- `.env` added to `.gitignore` on day 0
- `.env.example` committed with empty values as documentation
- Production secrets injected via AWS Secrets Manager / ECS secrets / Kubernetes secrets
- CI/CD pipeline fails if any required env var is missing at startup
- `config-validation.ts` schema validates all env vars at bootstrap

```typescript
// src/config/config.validation.ts
import { plainToInstance } from 'class-transformer';
import { IsString, IsUrl, IsPort, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsUrl()
  SUPABASE_URL: string;

  @IsString()
  SUPABASE_SERVICE_KEY: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  S3_BUCKET_NAME: string;
}

export function validateConfig(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  return validated;
}
```

### 7.2 Database Connection Security

| Measure | Implementation |
|---------|---------------|
| SSL/TLS | `ssl: { ca: fs.readFileSync(process.env.DATABASE_SSL_CA_PATH) }` in TypeORM config |
| Credential rotation | AWS Secrets Manager auto-rotation every 30 days; app reloads on change |
| Connection pooling | Max 20 connections per API instance; idle timeout 30s |
| Least privilege DB user | `mymove_app` user: SELECT, INSERT, UPDATE, DELETE only. No CREATE, DROP, GRANT. |
| Separate admin user | `mymove_admin` for migrations only; credentials in CI/CD, not application |
| Query timeout | Global 30-second query timeout; long queries logged as warnings |

```typescript
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    ca: require('fs').readFileSync(process.env.DATABASE_SSL_CA_PATH),
    rejectUnauthorized: true,
  } : false,
  connectTimeout: 10000,
  extra: {
    connectionLimit: 20,
    queueLimit: 0,
    idleTimeout: 30000,
    enableKeepAlive: true,
  },
  logging: process.env.NODE_ENV === 'development',
  maxQueryExecutionTime: 30000, // log slow queries > 30s
};
```

### 7.3 S3 Bucket Hardening

| Control | Implementation |
|---------|---------------|
| Block public access | `BlockPublicAcls`, `BlockPublicPolicy`, `IgnorePublicAcls`, `RestrictPublicBuckets` all `true` |
| Versioning | Enabled (for recovery if accidental delete) |
| MFA Delete | Enabled for production bucket |
| Logging | S3 access logs written to separate `mymove-logs` bucket |
| Lifecycle | Move to Glacier after 7 days; delete after 30 days (safety net) |
| Encryption | SSE-KMS with customer-managed key; bucket key enabled |
| CORS | Strict origin whitelist, no wildcards |
| Object Lock | Compliance mode for audit log archives (WORM) |

```bash
# AWS CLI commands for bucket hardening
aws s3api put-public-access-block \
  --bucket mymove-private-uploads \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

aws s3api put-bucket-versioning \
  --bucket mymove-private-uploads \
  --versioning-configuration Status=Enabled,MFADelete=Enabled

aws s3api put-bucket-encryption \
  --bucket mymove-private-uploads \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "arn:aws:kms:...:key/..."
      },
      "BucketKeyEnabled": true
    }]
  }'
```

### 7.4 Dependency Scanning

| Tool | Purpose | Integration |
|------|---------|-------------|
| `npm audit` | Known vulnerabilities in dependencies | CI pipeline (block on high/critical) |
| Snyk | Continuous dependency monitoring | Weekly scans + PR checks |
| Dependabot | Auto-PR for dependency updates | GitHub integration |
| OWASP Dependency-Check | CVE database cross-reference | Monthly manual scan |

**CI Pipeline gate:**

```yaml
# .github/workflows/security.yml
- name: Audit dependencies
  run: npm audit --audit-level=high
  continue-on-error: false

- name: Run Snyk test
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 7.5 Secrets Management Recommendation

**Recommended Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     AWS Secrets Manager                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  Supabase    │  │  MySQL       │  │  AWS IAM Keys        │ │
│  │  Service Key │  │  Credentials │  │  (S3 Access)         │ │
│  │  Rotation:   │  │  Rotation:   │  │  Rotation:           │ │
│  │  30 days     │  │  30 days     │  │  90 days             │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                    │                                              │
│                    ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  AWS Systems Manager Parameter Store (non-sensitive)    │    │
│  │  • S3 bucket name                                        │    │
│  │  • Region settings                                       │    │
│  │  • Feature flags                                         │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ECS / EC2 / EKS                             │
│  Secrets injected as environment variables at container startup  │
│  No secrets written to disk, no secrets in container layers      │
└─────────────────────────────────────────────────────────────────┘
```

**Secrets Manager IAM Policy (for API server):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOnlySpecificSecrets",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:*:*:secret:mymove/supabase-*",
        "arn:aws:secretsmanager:*:*:secret:mymove/database-*",
        "arn:aws:secretsmanager:*:*:secret:mymove/aws-*"
      ]
    }
  ]
}
```

**Alternative**: For non-AWS deployments, use **HashiCorp Vault** or **Doppler** for equivalent functionality.

---

## Appendix A — Database Schema Reference for Security

```sql
-- Core tables referenced throughout this document

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  supabase_uid    VARCHAR(36) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  role            ENUM('END_CUSTOMER','COMPANY','ADMIN') NOT NULL DEFAULT 'END_CUSTOMER',
  company_id      UUID NULL,
  full_name       VARCHAR(200) NOT NULL,
  phone           VARCHAR(50) NULL,
  status          ENUM('ACTIVE','SUSPENDED','PENDING_DELETION') DEFAULT 'ACTIVE',
  is_suspended    BOOLEAN DEFAULT FALSE,
  scheduled_deletion_at TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id),
  INDEX idx_users_email (email),
  INDEX idx_users_supabase (supabase_uid),
  INDEX idx_users_company (company_id),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  name            VARCHAR(200) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  status          ENUM('PENDING_VERIFICATION','APPROVED','SUSPENDED','REJECTED') DEFAULT 'PENDING_VERIFICATION',
  verified_at     TIMESTAMP NULL,
  verified_by     UUID NULL,
  commission_rate DECIMAL(5,4) DEFAULT 0.1000,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_companies_verifier FOREIGN KEY (verified_by) REFERENCES users(id),
  INDEX idx_companies_status (status),
  INDEX idx_companies_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE move_requests (
  id                  UUID PRIMARY KEY DEFAULT (UUID()),
  customer_id         UUID NOT NULL,
  request_type        ENUM('MARKETPLACE','SAAS') NOT NULL DEFAULT 'MARKETPLACE',
  invited_company_id  UUID NULL,
  status              ENUM('DRAFT','REQUESTED','OFFERS_RECEIVED','OFFER_ACCEPTED','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
  from_address        VARCHAR(500) NOT NULL,
  to_address          VARCHAR(500) NOT NULL,
  move_date           DATE NOT NULL,
  notes               TEXT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_mr_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_mr_invited_company FOREIGN KEY (invited_company_id) REFERENCES companies(id),
  INDEX idx_mr_customer (customer_id),
  INDEX idx_mr_status (status),
  INDEX idx_mr_type (request_type)
) ENGINE=InnoDB;

CREATE TABLE videos (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  move_request_id UUID NOT NULL,
  s3_bucket       VARCHAR(100) NULL,
  s3_key          VARCHAR(500) NULL,
  thumbnail_url   VARCHAR(500) NULL,
  file_size       BIGINT NULL,
  content_type    VARCHAR(50) NULL,
  duration_seconds INT NULL,
  status          ENUM('UPLOADING','PROCESSING','READY','FAILED','DELETED') DEFAULT 'UPLOADING',
  ai_analysis     JSON NULL,
  deleted_at      TIMESTAMP NULL,
  deletion_reason ENUM('RETENTION_POLICY','USER_DELETION','ADMIN_ACTION','UPLOAD_FAILURE') NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_videos_move_request FOREIGN KEY (move_request_id) REFERENCES move_requests(id) ON DELETE CASCADE,
  INDEX idx_videos_move_request (move_request_id),
  INDEX idx_videos_status (status),
  INDEX idx_videos_deleted_at (deleted_at)
) ENGINE=InnoDB;

CREATE TABLE offers (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  move_request_id UUID NOT NULL,
  company_id      UUID NOT NULL,
  status          ENUM('DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED') DEFAULT 'DRAFT',
  price_amount    DECIMAL(12,2) NOT NULL,
  price_currency  VARCHAR(3) DEFAULT 'EUR',
  description     TEXT NULL,
  valid_until     TIMESTAMP NULL,
  sent_at         TIMESTAMP NULL,
  accepted_at     TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_offers_move_request FOREIGN KEY (move_request_id) REFERENCES move_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_offers_company FOREIGN KEY (company_id) REFERENCES companies(id),
  INDEX idx_offers_move_request (move_request_id),
  INDEX idx_offers_company (company_id),
  INDEX idx_offers_status (status)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  move_request_id UUID NOT NULL,
  company_id      UUID NOT NULL,
  customer_id     UUID NULL,  -- NULL after anonymization
  reviewer_name   VARCHAR(200) NOT NULL,
  rating          TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text     TEXT NULL,
  is_public       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_reviews_move_request FOREIGN KEY (move_request_id) REFERENCES move_requests(id),
  CONSTRAINT fk_reviews_company FOREIGN KEY (company_id) REFERENCES companies(id),
  INDEX idx_reviews_company (company_id),
  INDEX idx_reviews_rating (rating)
) ENGINE=InnoDB;

CREATE TABLE company_documents (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  company_id      UUID NOT NULL,
  document_type   ENUM('TRADE_LICENSE','INSURANCE','IDENTITY','OTHER') NOT NULL,
  s3_key          VARCHAR(500) NOT NULL,
  file_name       VARCHAR(255) NOT NULL,
  status          ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  reviewed_by     UUID NULL,
  reviewed_at     TIMESTAMP NULL,
  rejection_reason TEXT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_docs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_docs_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id),
  INDEX idx_docs_company (company_id),
  INDEX idx_docs_status (status)
) ENGINE=InnoDB;

CREATE TABLE admin_logs (
  id              UUID PRIMARY KEY DEFAULT (UUID()),
  timestamp       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actor_id        VARCHAR(36) NOT NULL,
  actor_role      VARCHAR(20) NOT NULL,
  actor_ip        VARCHAR(45) NOT NULL,
  action          VARCHAR(50) NOT NULL,
  target_type     VARCHAR(30) NOT NULL,
  target_id       VARCHAR(36) NOT NULL,
  before_value    JSON NULL,
  after_value     JSON NULL,
  metadata        JSON NULL,
  severity        ENUM('INFO','WARN','ERROR') DEFAULT 'INFO',

  INDEX idx_logs_timestamp (timestamp),
  INDEX idx_logs_actor (actor_id),
  INDEX idx_logs_action (action),
  INDEX idx_logs_target (target_type, target_id),
  INDEX idx_logs_severity_timestamp (severity, timestamp)
) ENGINE=InnoDB ROW_FORMAT=COMPRESSED;
```

## Appendix B — Quick Reference: Guard Application Matrix

| Endpoint Pattern | Guards Required |
|-----------------|-----------------|
| `POST /move-requests` | `JwtAuthGuard`, `RolesGuard(['END_CUSTOMER'])` |
| `GET /move-requests/:id` | `JwtAuthGuard`, `RolesGuard`, `DataOwnershipGuard` |
| `PATCH /move-requests/:id` | `JwtAuthGuard`, `RolesGuard(['END_CUSTOMER'])`, `DataOwnershipGuard` |
| `POST /videos/upload-request` | `JwtAuthGuard`, `RolesGuard(['END_CUSTOMER'])`, `DataOwnershipGuard` |
| `GET /videos/:id/view` | `JwtAuthGuard`, `RolesGuard`, `VideoAccessGuard` (custom) |
| `POST /offers` | `JwtAuthGuard`, `RolesGuard(['COMPANY'])`, `CompanyOwnershipGuard` |
| `GET /offers/company` | `JwtAuthGuard`, `RolesGuard(['COMPANY'])`, `CompanyOwnershipGuard` |
| `POST /offers/:id/send` | `JwtAuthGuard`, `RolesGuard(['COMPANY'])`, `DataOwnershipGuard` |
| `POST /offers/:id/accept` | `JwtAuthGuard`, `RolesGuard(['END_CUSTOMER'])`, `DataOwnershipGuard` |
| `POST /admin/companies/:id/approve` | `JwtAuthGuard`, `RolesGuard(['ADMIN'])`, `AuditLogInterceptor` |
| `GET /admin/dashboard` | `JwtAuthGuard`, `RolesGuard(['ADMIN'])` |
| `GET /admin/logs` | `JwtAuthGuard`, `RolesGuard(['ADMIN'])` |
| `GET /companies` | Public (no guards, rate limit only) |
| `GET /companies/:id` | Public (no guards, rate limit only) |
| `PATCH /companies/:id` | `JwtAuthGuard`, `RolesGuard(['COMPANY','ADMIN'])`, `DataOwnershipGuard` |

## Appendix C — GDPR Checklist for Implementation

- [ ] Privacy policy v1.0 drafted and reviewed by legal counsel
- [ ] Terms of service v1.0 drafted and reviewed
- [ ] Data Processing Agreement (DPA) template for companies
- [ ] Consent checkboxes implemented at registration (ToS, Privacy, Video Upload)
- [ ] Consent versions tracked in `user_consents` table
- [ ] Video upload blocked without explicit `VIDEO_UPLOAD` consent
- [ ] Cookie consent banner (if using analytics cookies)
- [ ] Data export endpoint (`GET /me/data-export`) implemented
- [ ] Account deletion flow with 30-day grace period implemented
- [ ] Video auto-deletion cron job tested and scheduled
- [ ] Move request anonymization after 2 years implemented
- [ ] "Right to restrict processing" endpoint implemented
- [ ] Company DPA signature tracking implemented
- [ ] Admin audit logs immutable (trigger protection)
- [ ] Breach notification procedure documented (72-hour SLA)
- [ ] Data Protection Impact Assessment (DPIA) for video processing completed
- [ ] Subprocessor list published (AWS, Supabase, AI vendor)
- [ ] EU representative appointed (if company outside EU)
- [ ] Privacy contact email configured (privacy@mymove.app)

---

*End of Document — MyMove Security Architecture v1.0*

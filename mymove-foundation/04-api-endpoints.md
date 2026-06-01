# MyMove Platform — REST API Specification

> **Version:** 1.0.0  
> **Base Path:** `/api/v1`  
> **Last Updated:** 2024

---

## Table of Contents

1. [API Overview](#section-1--api-overview)
2. [Endpoint Specifications](#section-2--endpoint-specifications)
   - 2.1 [Auth](#21-auth)
   - 2.2 [Users](#22-users)
   - 2.3 [Companies](#23-companies)
   - 2.4 [Move Requests](#24-move-requests)
   - 2.5 [Inventory](#25-inventory)
   - 2.6 [Videos](#26-videos)
   - 2.7 [Pricing](#27-pricing)
   - 2.8 [Offers](#28-offers)
   - 2.9 [Availability](#29-availability)
   - 2.10 [Reviews](#210-reviews)
   - 2.11 [Admin](#211-admin)
3. [DTO Specifications](#section-3--dto-specifications)
4. [Error Handling](#section-4--error-handling)
5. [Authentication & Authorization](#section-5--authentication--authorization)

---

## Section 1 — API Overview

### Base URL & Versioning

| Environment | Base URL |
|-------------|----------|
| Development | `https://api-dev.mymove.com/api/v1` |
| Staging | `https://api-staging.mymove.com/api/v1` |
| Production | `https://api.mymove.com/api/v1` |

**Versioning Strategy:** URL path versioning (`/api/v1`, `/api/v2`). Backward-compatible additions within v1; breaking changes require v2. Deprecated endpoints return `Sunset` header with sunset date.

### Authentication

All authenticated endpoints require:
```
Authorization: Bearer <supabase_jwt_token>
```

The JWT contains:
- `sub` — user UUID
- `role` — `END_CUSTOMER` | `COMPANY` | `ADMIN`
- `email` — verified email address
- `iat` / `exp` — standard JWT timestamps

### Standard Response Format

**Success (200–299):**
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 147,
    "totalPages": 8
  }
}
```

For single-resource responses, `meta` is omitted.

### Error Response Format

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Validation failed",
  "details": [
    { "field": "fromAddress", "message": "fromAddress must be a string", "code": "IS_STRING" }
  ],
  "timestamp": "2024-06-15T10:23:45.000Z",
  "path": "/api/v1/move-requests",
  "requestId": "req_8f2a9c1d"
}
```

### Pagination Standard

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-based) |
| `limit` | integer | 20 | Items per page (max 100) |
| `sort` | string | `-created_at` | Sort field; prefix `-` for DESC |
| `status` | string | — | Filter by status (entity-specific) |
| `q` | string | — | Full-text search query |

Response always includes `meta` object with pagination info.

### Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Auth (login/register) | 10 | 1 minute |
| General authenticated | 1000 | 1 minute |
| File uploads (presigned URL) | 20 | 1 minute |
| Admin endpoints | 500 | 1 minute |

Headers returned on every response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1718457600
```

Exceeded limits return `429 Too Many Requests`.

---

## Section 2 — Endpoint Specifications

### 2.1 Auth

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| POST | `/auth/register` | No | — | Register end customer | — |
| POST | `/auth/register-company` | No | — | Register company owner | — |
| POST | `/auth/login` | No | — | Login (email + password) | — |
| POST | `/auth/logout` | Yes | Any | Logout / invalidate session | — |
| POST | `/auth/refresh` | Yes | Any | Refresh access token | — |
| GET | `/auth/me` | Yes | Any | Get current authenticated user | — |
| POST | `/auth/forgot-password` | No | — | Request password reset email | — |
| POST | `/auth/reset-password` | No | — | Reset password with token | — |

#### POST /auth/register

**Auth:** None  
**Request Body:** `RegisterCustomerDto`

**Response 201:**
```json
{
  "data": {
    "id": "usr_a1b2c3d4",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "END_CUSTOMER",
    "emailVerified": false,
    "createdAt": "2024-06-15T10:23:45.000Z"
  }
}
```

**Response 409:**
```json
{
  "statusCode": 409,
  "error": "CONFLICT",
  "message": "Email already registered",
  "code": "EMAIL_ALREADY_EXISTS"
}
```

**Notes:** Triggers Supabase signup + confirmation email. Profile row created automatically via trigger.

---

#### POST /auth/register-company

**Auth:** None  
**Request Body:** `RegisterCompanyDto`

**Response 201:**
```json
{
  "data": {
    "id": "usr_e5f6g7h8",
    "email": "owner@acmemovers.com",
    "firstName": "Alice",
    "lastName": "Smith",
    "role": "COMPANY",
    "company": {
      "id": "cmp_9i0j1k2l",
      "name": "Acme Movers Ltd",
      "status": "PENDING_APPROVAL",
      "createdAt": "2024-06-15T10:23:45.000Z"
    },
    "createdAt": "2024-06-15T10:23:45.000Z"
  }
}
```

**Response 409:** Email conflict (same as register).

**Notes:** Company profile created in `PENDING_APPROVAL` status. Admin notified via internal event. Owner must submit documents before approval.

---

#### POST /auth/login

**Auth:** None  
**Request Body:** `LoginDto`

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4=...",
    "expiresIn": 3600,
    "user": {
      "id": "usr_a1b2c3d4",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "END_CUSTOMER"
    }
  }
}
```

**Response 401:**
```json
{
  "statusCode": 401,
  "error": "UNAUTHORIZED",
  "message": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

---

#### POST /auth/logout

**Auth:** Required (Any role)  
**Request Body:** None

**Response 204:** No content.

**Notes:** Invalidates refresh token on Supabase. Client must discard tokens.

---

#### POST /auth/refresh

**Auth:** Required (Any role, via refresh token)  
**Request Body:** `{ "refreshToken": "..." }`

**Response 200:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIG5ldyByZWZyZXNoIHRva2Vu...",
    "expiresIn": 3600
  }
}
```

**Response 401:** Invalid or expired refresh token.

---

#### GET /auth/me

**Auth:** Required (Any role)  
**Request Body:** None

**Response 200:**
```json
{
  "data": {
    "id": "usr_a1b2c3d4",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "END_CUSTOMER",
    "avatarUrl": "https://cdn.mymove.com/avatars/usr_a1b2c3d4.jpg",
    "emailVerified": true,
    "createdAt": "2024-06-15T10:23:45.000Z",
    "lastLoginAt": "2024-06-20T08:15:30.000Z"
  }
}
```

---

#### POST /auth/forgot-password

**Auth:** None  
**Request Body:** `{ "email": "john.doe@example.com" }`

**Response 202:** Accepted (always returns 202 to prevent email enumeration).

```json
{
  "data": {
    "message": "If the email exists, a reset link has been sent."
  }
}
```

---

#### POST /auth/reset-password

**Auth:** None  
**Request Body:** `{ "token": "reset_token_from_email", "newPassword": "SecurePass123!" }`

**Response 200:**
```json
{
  "data": {
    "message": "Password reset successful"
  }
}
```

**Response 400:** Invalid or expired token.

---

### 2.2 Users

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| GET | `/users/me` | Yes | Any | Get current user profile | — |
| PATCH | `/users/me` | Yes | Any | Update current user profile | — |
| GET | `/users/me/moves` | Yes | END_CUSTOMER | List customer's move requests | `?page&limit&status&sort` |
| PATCH | `/users/me/settings` | Yes | Any | Update user settings | — |

#### GET /users/me

**Auth:** Required (Any role)  
**Response 200:** Same shape as `GET /auth/me`, with additional settings.

```json
{
  "data": {
    "id": "usr_a1b2c3d4",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "END_CUSTOMER",
    "settings": {
      "notifications": { "email": true, "sms": false, "push": true },
      "language": "en",
      "currency": "EUR"
    },
    "createdAt": "2024-06-15T10:23:45.000Z"
  }
}
```

---

#### PATCH /users/me

**Auth:** Required (Any role)  
**Request Body:** `UpdateUserDto` (partial update, all fields `@IsOptional`)

**Response 200:** Updated user object.

---

#### GET /users/me/moves

**Auth:** Required (`END_CUSTOMER`)  
**Query Params:** `page`, `limit`, `status` (`DRAFT` | `SUBMITTED` | `OFFERS_RECEIVED` | `OFFER_ACCEPTED` | `COMPLETED` | `CANCELLED`), `sort`

**Response 200:**
```json
{
  "data": [
    {
      "id": "req_m3n4o5p6",
      "status": "OFFERS_RECEIVED",
      "fromAddress": "123 Main St, Berlin",
      "toAddress": "456 Oak Ave, Munich",
      "moveDate": "2024-07-10",
      "inventoryItemCount": 42,
      "offerCount": 3,
      "createdAt": "2024-06-15T10:23:45.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

#### PATCH /users/me/settings

**Auth:** Required (Any role)  
**Request Body:**
```json
{
  "notifications": {
    "email": true,
    "sms": false,
    "push": true
  },
  "language": "en",
  "currency": "EUR"
}
```

**Response 200:** Updated settings object.

---

### 2.3 Companies

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| POST | `/companies` | Yes | COMPANY | Create/update company profile (post-registration) | — |
| GET | `/companies/me` | Yes | COMPANY | Get own company profile | — |
| PATCH | `/companies/me` | Yes | COMPANY | Update own company profile | — |
| GET | `/companies` | No | — | Public marketplace list | `?page&limit&q&city&ratingMin&sort` |
| GET | `/companies/:id` | No | — | Public company profile | — |
| POST | `/companies/me/documents` | Yes | COMPANY | Upload verification document | — |
| GET | `/companies/me/documents` | Yes | COMPANY | List own documents | — |
| DELETE | `/companies/me/documents/:id` | Yes | COMPANY | Delete a document | — |

#### POST /companies

**Auth:** Required (`COMPANY`)  
**Request Body:** `CreateCompanyDto`

**Response 201:**
```json
{
  "data": {
    "id": "cmp_9i0j1k2l",
    "name": "Acme Movers Ltd",
    "slug": "acme-movers-ltd",
    "description": "Professional moving services since 2010.",
    "logoUrl": "https://cdn.mymove.com/logos/cmp_9i0j1k2l.jpg",
    "website": "https://acmemovers.com",
    "phone": "+491234567890",
    "email": "contact@acmemovers.com",
    "address": {
      "street": "Mover Str. 10",
      "city": "Berlin",
      "postalCode": "10115",
      "country": "DE"
    },
    "serviceArea": ["Berlin", "Potsdam", "Brandenburg"],
    "status": "PENDING_APPROVAL",
    "rating": 0,
    "reviewCount": 0,
    "createdAt": "2024-06-15T10:23:45.000Z"
  }
}
```

**Notes:** Called after `POST /auth/register-company` to flesh out the profile. Status remains `PENDING_APPROVAL` until admin action.

---

#### GET /companies/me

**Auth:** Required (`COMPANY`)  
**Response 200:** Full company profile + nested pricing rules, teams, and document status.

```json
{
  "data": {
    "id": "cmp_9i0j1k2l",
    "name": "Acme Movers Ltd",
    "status": "APPROVED",
    "documents": [
      { "id": "doc_1a2b3c4d", "type": "BUSINESS_LICENSE", "status": "VERIFIED", "url": "..." }
    ],
    "teams": [
      { "id": "tm_5e6f7g8h", "name": "Team Alpha", "capacity": 2 }
    ],
    "pricingRules": [
      { "id": "pr_9i0j1k2l", "name": "Standard", "baseFee": 150, "pricePerHour": 80, "pricePerKm": 2.5 }
    ],
    "createdAt": "2024-06-15T10:23:45.000Z"
  }
}
```

---

#### PATCH /companies/me

**Auth:** Required (`COMPANY`)  
**Request Body:** `UpdateCompanyDto` (partial)

**Response 200:** Updated company profile.

**Notes:** Cannot modify `status` or `rating` via this endpoint (admin-only fields).

---

#### GET /companies

**Auth:** None (Public marketplace)  
**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | integer | Page number |
| `limit` | integer | Items per page |
| `q` | string | Search by name or city |
| `city` | string | Filter by service area city |
| `ratingMin` | number | Minimum average rating (0–5) |
| `sort` | string | `rating`, `-rating`, `name`, `-created_at` |

**Response 200:**
```json
{
  "data": [
    {
      "id": "cmp_9i0j1k2l",
      "name": "Acme Movers Ltd",
      "slug": "acme-movers-ltd",
      "logoUrl": "https://cdn.mymove.com/logos/cmp_9i0j1k2l.jpg",
      "city": "Berlin",
      "rating": 4.7,
      "reviewCount": 128,
      "serviceArea": ["Berlin", "Potsdam"],
      "startingPrice": 150
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 47, "totalPages": 3 }
}
```

**Notes:** Only `APPROVED` companies returned. `startingPrice` is the lowest `baseFee` from their pricing rules.

---

#### GET /companies/:id

**Auth:** None  
**Response 200:**
```json
{
  "data": {
    "id": "cmp_9i0j1k2l",
    "name": "Acme Movers Ltd",
    "slug": "acme-movers-ltd",
    "description": "Professional moving services since 2010.",
    "logoUrl": "https://cdn.mymove.com/logos/cmp_9i0j1k2l.jpg",
    "website": "https://acmemovers.com",
    "phone": "+491234567890",
    "address": { "city": "Berlin", "country": "DE" },
    "serviceArea": ["Berlin", "Potsdam", "Brandenburg"],
    "rating": 4.7,
    "reviewCount": 128,
    "gallery": ["https://cdn.mymove.com/gallery/cmp_1.jpg"],
    "createdAt": "2024-06-15T10:23:45.000Z"
  }
}
```

**Response 404:** Company not found or not approved.

---

#### POST /companies/me/documents

**Auth:** Required (`COMPANY`)  
**Request Body:** `UploadDocumentDto`

**Response 201:**
```json
{
  "data": {
    "id": "doc_1a2b3c4d",
    "companyId": "cmp_9i0j1k2l",
    "type": "BUSINESS_LICENSE",
    "fileName": "license.pdf",
    "mimeType": "application/pdf",
    "url": "https://s3.mymove.com/docs/doc_1a2b3c4d.pdf",
    "status": "PENDING_VERIFICATION",
    "uploadedAt": "2024-06-15T10:23:45.000Z"
  }
}
```

---

#### GET /companies/me/documents

**Auth:** Required (`COMPANY`)  
**Response 200:** Array of documents.

```json
{
  "data": [
    {
      "id": "doc_1a2b3c4d",
      "type": "BUSINESS_LICENSE",
      "status": "VERIFIED",
      "uploadedAt": "2024-06-15T10:23:45.000Z"
    },
    {
      "id": "doc_5e6f7g8h",
      "type": "INSURANCE_CERTIFICATE",
      "status": "PENDING_VERIFICATION",
      "uploadedAt": "2024-06-16T09:00:00.000Z"
    }
  ]
}
```

---

#### DELETE /companies/me/documents/:id

**Auth:** Required (`COMPANY`)  
**Response 204:** No content.

**Notes:** Can only delete documents with status `PENDING_VERIFICATION` or `REJECTED`. Verified documents are immutable.

---

### 2.4 Move Requests

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| POST | `/move-requests` | Yes | END_CUSTOMER | Create draft move request | — |
| GET | `/move-requests` | Yes | END_CUSTOMER | List my move requests | `?page&limit&status&sort` |
| GET | `/move-requests/:id` | Yes | END_CUSTOMER / COMPANY* | Get move request details | — |
| PATCH | `/move-requests/:id` | Yes | END_CUSTOMER | Update draft details | — |
| POST | `/move-requests/:id/submit` | Yes | END_CUSTOMER | Submit for offers | — |
| POST | `/move-requests/:id/video` | Yes | END_CUSTOMER | Initiate video upload | — |
| GET | `/move-requests/:id/inventory` | Yes | END_CUSTOMER / COMPANY* | Get inventory | — |
| PATCH | `/move-requests/:id/inventory` | Yes | END_CUSTOMER | Bulk update inventory | — |
| POST | `/move-requests/:id/request-offers` | Yes | END_CUSTOMER | Select companies & request offers | — |
| GET | `/move-requests/:id/offers` | Yes | END_CUSTOMER / COMPANY* | List offers for this request | `?page&limit&sort` |
| POST | `/move-requests/:id/accept-offer/:offerId` | Yes | END_CUSTOMER | Accept an offer | — |

*COMPANY access only if they have received an offer request for this move.

#### POST /move-requests

**Auth:** Required (`END_CUSTOMER`)  
**Request Body:** `CreateMoveRequestDto`

**Response 201:**
```json
{
  "data": {
    "id": "req_m3n4o5p6",
    "status": "DRAFT",
    "customerId": "usr_a1b2c3d4",
    "fromAddress": "123 Main St, Berlin",
    "toAddress": "456 Oak Ave, Munich",
    "moveDate": "2024-07-10",
    "moveTime": "09:00",
    "propertyTypeFrom": "APARTMENT",
    "floorFrom": 3,
    "elevatorFrom": true,
    "propertyTypeTo": "HOUSE",
    "floorTo": 0,
    "elevatorTo": false,
    "estimatedDistanceKm": 580,
    "specialRequirements": ["FRAGILE_ITEMS", "PIANO"],
    "notes": "Please arrive before 9 AM.",
    "inventoryItemCount": 0,
    "videoId": null,
    "createdAt": "2024-06-15T10:23:45.000Z",
    "updatedAt": "2024-06-15T10:23:45.000Z"
  }
}
```

**Response 400:** Validation error on fields.

---

#### GET /move-requests

**Auth:** Required (`END_CUSTOMER`)  
**Query Params:** `page`, `limit`, `status`, `sort`

**Response 200:** Paginated list of move requests (summary shape).

---

#### GET /move-requests/:id

**Auth:** Required (`END_CUSTOMER` owner or `COMPANY` with offer access)  
**Response 200:** Full move request with inventory summary and offer count.

```json
{
  "data": {
    "id": "req_m3n4o5p6",
    "status": "SUBMITTED",
    "customerId": "usr_a1b2c3d4",
    "fromAddress": "123 Main St, Berlin",
    "toAddress": "456 Oak Ave, Munich",
    "moveDate": "2024-07-10",
    "moveTime": "09:00",
    "propertyTypeFrom": "APARTMENT",
    "floorFrom": 3,
    "elevatorFrom": true,
    "propertyTypeTo": "HOUSE",
    "floorTo": 0,
    "elevatorTo": false,
    "estimatedDistanceKm": 580,
    "specialRequirements": ["FRAGILE_ITEMS", "PIANO"],
    "notes": "Please arrive before 9 AM.",
    "inventorySummary": {
      "totalItems": 42,
      "totalVolumeM3": 28.5,
      "categories": [
        { "category": "FURNITURE", "count": 12 },
        { "category": "BOXES", "count": 25 },
        { "category": "APPLIANCES", "count": 5 }
      ]
    },
    "video": {
      "id": "vid_q7r8s9t0",
      "status": "PROCESSED",
      "thumbnailUrl": "https://s3.mymove.com/videos/vid_q7r8s9t0_thumb.jpg"
    },
    "offerCount": 0,
    "selectedCompanyIds": ["cmp_9i0j1k2l", "cmp_2b3c4d5e"],
    "createdAt": "2024-06-15T10:23:45.000Z",
    "updatedAt": "2024-06-16T14:30:00.000Z"
  }
}
```

**Response 404:**
```json
{
  "statusCode": 404,
  "error": "NOT_FOUND",
  "message": "Move request not found",
  "code": "MOVE_REQUEST_NOT_FOUND"
}
```

**Response 403:** Company not in selected companies list.

---

#### PATCH /move-requests/:id

**Auth:** Required (`END_CUSTOMER`, owner, status `DRAFT` only)  
**Request Body:** `UpdateMoveRequestDto`

**Response 200:** Updated move request.

**Response 409:**
```json
{
  "statusCode": 409,
  "error": "CONFLICT",
  "message": "Cannot edit move request after submission",
  "code": "MOVE_REQUEST_LOCKED"
}
```

---

#### POST /move-requests/:id/submit

**Auth:** Required (`END_CUSTOMER`, owner, status `DRAFT`)  
**Request Body:** `SubmitMoveRequestDto` (optional final confirmation fields)

**Response 200:**
```json
{
  "data": {
    "id": "req_m3n4o5p6",
    "status": "SUBMITTED",
    "submittedAt": "2024-06-16T14:30:00.000Z",
    "message": "Move request submitted. Awaiting offers from selected companies."
  }
}
```

**Notes:** Transition to `SUBMITTED`. System validates inventory non-empty, address fields populated, move date >= today+2 days. Notifications sent to selected companies.

---

#### POST /move-requests/:id/video

**Auth:** Required (`END_CUSTOMER`, owner, status `DRAFT`)  
**Request Body:** `{ "fileName": "move_video.mp4", "mimeType": "video/mp4", "fileSize": 52428800 }`

**Response 201:**
```json
{
  "data": {
    "videoId": "vid_q7r8s9t0",
    "uploadUrl": "https://s3.mymove.com/presigned/vid_q7r8s9t0?X-Amz-Algorithm=...",
    "expiresAt": "2024-06-15T10:33:45.000Z",
    "fields": {
      "key": "videos/vid_q7r8s9t0.mp4",
      "Content-Type": "video/mp4"
    }
  }
}
```

**Notes:** Returns presigned PUT URL for direct S3 upload. Client uploads directly, then calls `POST /videos/confirm-upload`. Max file size 100MB.

---

#### GET /move-requests/:id/inventory

**Auth:** Required (`END_CUSTOMER` owner or `COMPANY` with offer access)  
**Response 200:**
```json
{
  "data": {
    "moveRequestId": "req_m3n4o5p6",
    "items": [
      {
        "id": "itm_1a2b3c4d",
        "name": "Sofa (3-seater)",
        "category": "FURNITURE",
        "quantity": 1,
        "volumeM3": 2.5,
        "weightKg": 45,
        "fragile": false,
        "disassemblyRequired": false,
        "source": "AI",
        "confidence": 0.94,
        "imageUrl": null
      },
      {
        "id": "itm_5e6f7g8h",
        "name": "Dining Table",
        "category": "FURNITURE",
        "quantity": 1,
        "volumeM3": 1.8,
        "weightKg": 35,
        "fragile": false,
        "disassemblyRequired": true,
        "source": "MANUAL",
        "confidence": null,
        "imageUrl": null
      }
    ],
    "summary": {
      "totalItems": 42,
      "totalVolumeM3": 28.5,
      "totalWeightKg": 850,
      "aiDetected": 30,
      "manualAdded": 12
    }
  }
}
```

---

#### PATCH /move-requests/:id/inventory

**Auth:** Required (`END_CUSTOMER`, owner)  
**Request Body:** `{ "items": [ { "id": "itm_1a2b3c4d", "quantity": 2 }, { "id": "itm_new1", "name": "Bookshelf", ... } ] }` — bulk upsert.

**Response 200:** Updated inventory.

---

#### POST /move-requests/:id/request-offers

**Auth:** Required (`END_CUSTOMER`, owner, status `DRAFT` or `SUBMITTED`)  
**Request Body:** `{ "companyIds": ["cmp_9i0j1k2l", "cmp_2b3c4d5e", "cmp_6f7g8h9i"] }`

**Response 200:**
```json
{
  "data": {
    "moveRequestId": "req_m3n4o5p6",
    "requestedCompanies": 3,
    "skippedCompanies": 0,
    "status": "SUBMITTED",
    "message": "Offer requests sent to 3 companies."
  }
}
```

**Response 422:**
```json
{
  "statusCode": 422,
  "error": "UNPROCESSABLE_ENTITY",
  "message": "Some companies are unavailable for the selected move date",
  "code": "INSUFFICIENT_CAPACITY",
  "details": [
    { "companyId": "cmp_6f7g8h9i", "reason": "No available teams on 2024-07-10" }
  ]
}
```

**Notes:** System filters out companies without capacity on the move date. Only available companies are notified.

---

#### GET /move-requests/:id/offers

**Auth:** Required (`END_CUSTOMER` owner or `COMPANY` with offer)  
**Query Params:** `page`, `limit`, `sort`

**Response 200:**
```json
{
  "data": [
    {
      "id": "off_u1v2w3x4",
      "companyId": "cmp_9i0j1k2l",
      "companyName": "Acme Movers Ltd",
      "companyLogo": "https://cdn.mymove.com/logos/cmp_9i0j1k2l.jpg",
      "companyRating": 4.7,
      "status": "SENT",
      "estimatedPrice": 1450.00,
      "finalPrice": 1380.00,
      "currency": "EUR",
      "teamSize": 3,
      "estimatedDurationHours": 8,
      "includedServices": ["PACKING", "DISASSEMBLY"],
      "addonServices": [
        { "name": "Piano Handling", "price": 150.00 }
      ],
      "validUntil": "2024-07-05T23:59:59.000Z",
      "sentAt": "2024-06-17T09:00:00.000Z",
      "expiresInDays": 5
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

---

#### POST /move-requests/:id/accept-offer/:offerId

**Auth:** Required (`END_CUSTOMER`, owner)  
**Response 200:**
```json
{
  "data": {
    "moveRequestId": "req_m3n4o5p6",
    "offerId": "off_u1v2w3x4",
    "status": "OFFER_ACCEPTED",
    "companyId": "cmp_9i0j1k2l",
    "finalPrice": 1380.00,
    "currency": "EUR",
    "moveDate": "2024-07-10",
    "acceptedAt": "2024-06-18T10:00:00.000Z",
    "nextSteps": [
      "Company will contact you to confirm exact arrival time",
      "Payment details will be shared 48h before the move"
    ]
  }
}
```

**Response 410:**
```json
{
  "statusCode": 410,
  "error": "GONE",
  "message": "Offer has expired",
  "code": "OFFER_EXPIRED"
}
```

**Response 409:**
```json
{
  "statusCode": 409,
  "error": "CONFLICT",
  "message": "An offer has already been accepted for this move request",
  "code": "OFFER_ALREADY_ACCEPTED"
}
```

**Notes:** All other pending offers are auto-rejected. Video auto-deleted (GDPR). Company notified.

---

### 2.5 Inventory

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| GET | `/inventory` | Yes | END_CUSTOMER / COMPANY | Get inventory by move request | `?moveRequestId` (required) |
| POST | `/inventory/items` | Yes | END_CUSTOMER | Add manual item | — |
| PATCH | `/inventory/items/:id` | Yes | END_CUSTOMER | Update item | — |
| DELETE | `/inventory/items/:id` | Yes | END_CUSTOMER | Delete item | — |
| GET | `/inventory/ai-analysis` | Yes | END_CUSTOMER / COMPANY* | Get AI analysis results | `?moveRequestId` (required) |

*COMPANY only if they have an offer on the move request.

#### GET /inventory

**Auth:** Required  
**Query Params:** `moveRequestId` (required, UUID)

**Response 200:** Same shape as `GET /move-requests/:id/inventory`.

**Response 400:** Missing `moveRequestId`.

---

#### POST /inventory/items

**Auth:** Required (`END_CUSTOMER`, move request owner, status `DRAFT`)  
**Request Body:** `CreateInventoryItemDto`

**Response 201:**
```json
{
  "data": {
    "id": "itm_new1",
    "moveRequestId": "req_m3n4o5p6",
    "name": "Bookshelf",
    "category": "FURNITURE",
    "quantity": 1,
    "volumeM3": 1.2,
    "weightKg": 25,
    "fragile": false,
    "disassemblyRequired": true,
    "source": "MANUAL",
    "imageUrl": null,
    "createdAt": "2024-06-15T11:00:00.000Z"
  }
}
```

---

#### PATCH /inventory/items/:id

**Auth:** Required (`END_CUSTOMER`, owner)  
**Request Body:** `UpdateInventoryItemDto` (partial)

**Response 200:** Updated item.

---

#### DELETE /inventory/items/:id

**Auth:** Required (`END_CUSTOMER`, owner)  
**Response 204:** No content.

---

#### GET /inventory/ai-analysis

**Auth:** Required  
**Query Params:** `moveRequestId` (required)

**Response 200:**
```json
{
  "data": {
    "moveRequestId": "req_m3n4o5p6",
    "videoId": "vid_q7r8s9t0",
    "status": "COMPLETED",
    "detectedItems": [
      {
        "name": "Sofa (3-seater)",
        "category": "FURNITURE",
        "confidence": 0.94,
        "boundingBox": { "x": 120, "y": 80, "width": 400, "height": 200 },
        "estimatedVolumeM3": 2.5,
        "estimatedWeightKg": 45,
        "fragile": false
      },
      {
        "name": "TV (55-inch)",
        "category": "ELECTRONICS",
        "confidence": 0.89,
        "boundingBox": { "x": 50, "y": 300, "width": 300, "height": 180 },
        "estimatedVolumeM3": 0.3,
        "estimatedWeightKg": 18,
        "fragile": true
      }
    ],
    "totalDetected": 30,
    "processingTimeMs": 4500,
    "processedAt": "2024-06-15T10:30:00.000Z"
  }
}
```

**Notes:** AI analysis runs async after video upload confirmation. Polling this endpoint (or use WebSocket) to check status (`PENDING` | `PROCESSING` | `COMPLETED` | `FAILED`).

---

### 2.6 Videos

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| POST | `/videos/presigned-url` | Yes | END_CUSTOMER | Get presigned URL for upload | — |
| POST | `/videos/confirm-upload` | Yes | END_CUSTOMER | Confirm upload complete | — |
| GET | `/videos/:id/url` | Yes | END_CUSTOMER / COMPANY* | Get temporary access URL | — |
| DELETE | `/videos/:id` | Yes | END_CUSTOMER | Delete video | — |

*COMPANY only if they have an offer on the associated move request.

#### POST /videos/presigned-url

**Auth:** Required (`END_CUSTOMER`)  
**Request Body:** `PresignedUrlDto`

**Response 201:**
```json
{
  "data": {
    "videoId": "vid_q7r8s9t0",
    "uploadUrl": "https://s3.mymove.com/presigned/vid_q7r8s9t0?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
    "expiresAt": "2024-06-15T10:33:45.000Z",
    "fields": {
      "key": "videos/vid_q7r8s9t0.mp4",
      "Content-Type": "video/mp4",
      "x-amz-meta-move-request-id": "req_m3n4o5p6"
    },
    "maxFileSize": 104857600
  }
}
```

---

#### POST /videos/confirm-upload

**Auth:** Required (`END_CUSTOMER`)  
**Request Body:** `{ "videoId": "vid_q7r8s9t0", "fileSize": 52428800, "durationSeconds": 120 }`

**Response 200:**
```json
{
  "data": {
    "videoId": "vid_q7r8s9t0",
    "status": "PROCESSING",
    "thumbnailUrl": "https://s3.mymove.com/videos/vid_q7r8s9t0_thumb.jpg",
    "message": "Upload confirmed. AI analysis started."
  }
}
```

**Notes:** Triggers AI analysis pipeline. Thumbnail generated automatically.

---

#### GET /videos/:id/url

**Auth:** Required  
**Response 200:**
```json
{
  "data": {
    "videoId": "vid_q7r8s9t0",
    "accessUrl": "https://s3.mymove.com/videos/vid_q7r8s9t0.mp4?X-Amz-Expires=300&...",
    "expiresAt": "2024-06-15T10:28:45.000Z",
    "thumbnailUrl": "https://s3.mymove.com/videos/vid_q7r8s9t0_thumb.jpg"
  }
}
```

**Notes:** URL expires in 5 minutes. Re-fetch to renew. Video deleted automatically after offer acceptance or 30 days, whichever comes first (GDPR).

---

#### DELETE /videos/:id

**Auth:** Required (`END_CUSTOMER`, owner)  
**Response 204:** No content.

**Notes:** Soft delete in DB + S3 object deletion. AI analysis results remain (they are not personal data in raw form). Re-upload allowed if move request still in `DRAFT`.

---

### 2.7 Pricing

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| GET | `/pricing/rules/me` | Yes | COMPANY | List my pricing rules | — |
| POST | `/pricing/rules` | Yes | COMPANY | Create pricing rule | — |
| PATCH | `/pricing/rules/:id` | Yes | COMPANY | Update pricing rule | — |
| DELETE | `/pricing/rules/:id` | Yes | COMPANY | Delete pricing rule | — |
| POST | `/pricing/calculate` | Yes | Any | Calculate estimate for move request | — |
| GET | `/pricing/service-addons` | Yes | COMPANY | List my service addons | — |
| POST | `/pricing/service-addons` | Yes | COMPANY | Create service addon | — |
| PATCH | `/pricing/service-addons/:id` | Yes | COMPANY | Update service addon | — |
| DELETE | `/pricing/service-addons/:id` | Yes | COMPANY | Delete service addon | — |

#### GET /pricing/rules/me

**Auth:** Required (`COMPANY`)  
**Response 200:**
```json
{
  "data": [
    {
      "id": "pr_9i0j1k2l",
      "companyId": "cmp_9i0j1k2l",
      "name": "Standard Local Move",
      "description": "For moves within 50km",
      "baseFee": 150.00,
      "pricePerHour": 80.00,
      "pricePerKm": 2.50,
      "teamSize": 2,
      "minHours": 3,
      "maxDistanceKm": 50,
      "isDefault": true,
      "createdAt": "2024-06-15T10:23:45.000Z"
    },
    {
      "id": "pr_3c4d5e6f",
      "companyId": "cmp_9i0j1k2l",
      "name": "Long Distance",
      "description": "For moves over 50km",
      "baseFee": 250.00,
      "pricePerHour": 90.00,
      "pricePerKm": 3.00,
      "teamSize": 3,
      "minHours": 5,
      "maxDistanceKm": null,
      "isDefault": false,
      "createdAt": "2024-06-15T10:23:45.000Z"
    }
  ]
}
```

---

#### POST /pricing/rules

**Auth:** Required (`COMPANY`)  
**Request Body:** `CreatePricingRuleDto`

**Response 201:** Created pricing rule (full object).

---

#### PATCH /pricing/rules/:id

**Auth:** Required (`COMPANY`, owner)  
**Request Body:** `UpdatePricingRuleDto` (partial)

**Response 200:** Updated rule.

---

#### DELETE /pricing/rules/:id

**Auth:** Required (`COMPANY`, owner)  
**Response 204:** No content.

---

#### POST /pricing/calculate

**Auth:** Required (`END_CUSTOMER` or `COMPANY`)  
**Request Body:** `CalculateEstimateDto`

**Response 200:**
```json
{
  "data": {
    "moveRequestId": "req_m3n4o5p6",
    "pricingRuleId": "pr_9i0j1k2l",
    "companyId": "cmp_9i0j1k2l",
    "breakdown": {
      "baseFee": 150.00,
      "hourlyCharge": 640.00,
      "distanceCharge": 1450.00,
      "serviceAddons": [
        { "name": "Piano Handling", "price": 150.00 },
        { "name": "Packing Service", "price": 200.00 }
      ],
      "subtotal": 2590.00,
      "discount": 0.00,
      "platformCommission": 129.50,
      "totalEstimated": 2719.50
    },
    "estimatedDurationHours": 8,
    "teamSize": 3,
    "currency": "EUR",
    "validUntil": "2024-07-05T23:59:59.000Z"
  }
}
```

**Notes:** Called by companies before creating an offer. Customers may preview estimates if selecting a single company. Formula: `baseFee + (pricePerHour * estimatedHours * teamSize) + (pricePerKm * distanceKm) + sum(addons)`.

---

#### GET /pricing/service-addons

**Auth:** Required (`COMPANY`)  
**Response 200:**
```json
{
  "data": [
    {
      "id": "sa_1a2b3c4d",
      "companyId": "cmp_9i0j1k2l",
      "name": "Piano Handling",
      "description": "Specialized equipment for pianos",
      "price": 150.00,
      "currency": "EUR",
      "category": "SPECIAL_ITEM",
      "isActive": true
    }
  ]
}
```

---

#### POST /pricing/service-addons

**Auth:** Required (`COMPANY`)  
**Request Body:** `CreateServiceAddonDto`

**Response 201:** Created addon.

---

#### PATCH /pricing/service-addons/:id

**Auth:** Required (`COMPANY`, owner)  
**Request Body:** `UpdateServiceAddonDto`

**Response 200:** Updated addon.

---

#### DELETE /pricing/service-addons/:id

**Auth:** Required (`COMPANY`, owner)  
**Response 204:** No content.

---

### 2.8 Offers

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| GET | `/offers` | Yes | COMPANY / END_CUSTOMER | List offers (role-scoped) | `?page&limit&status&sort` |
| GET | `/offers/:id` | Yes | COMPANY / END_CUSTOMER | Get offer details | — |
| POST | `/offers` | Yes | COMPANY | Create draft offer for a request | — |
| PATCH | `/offers/:id` | Yes | COMPANY | Adjust offer price/services | — |
| POST | `/offers/:id/send` | Yes | COMPANY | Finalize and send offer | — |
| POST | `/offers/:id/accept` | Yes | END_CUSTOMER | Accept offer | — |
| POST | `/offers/:id/reject` | Yes | END_CUSTOMER / COMPANY* | Reject offer | — |

*Company can withdraw their own unsent/undrafted offer.

#### GET /offers

**Auth:** Required  
**Query Params:** `page`, `limit`, `status` (`DRAFT` | `SENT` | `ACCEPTED` | `REJECTED` | `EXPIRED` | `WITHDRAWN`), `sort`

**Response 200 (COMPANY):**
```json
{
  "data": [
    {
      "id": "off_u1v2w3x4",
      "moveRequestId": "req_m3n4o5p6",
      "customerName": "John Doe",
      "fromAddress": "123 Main St, Berlin",
      "toAddress": "456 Oak Ave, Munich",
      "moveDate": "2024-07-10",
      "status": "SENT",
      "finalPrice": 1380.00,
      "currency": "EUR",
      "sentAt": "2024-06-17T09:00:00.000Z",
      "validUntil": "2024-07-05T23:59:59.000Z",
      "offerCount": 3
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

**Response 200 (END_CUSTOMER):** Similar, but scoped to received offers with company details.

---

#### GET /offers/:id

**Auth:** Required (offer participant)  
**Response 200:**
```json
{
  "data": {
    "id": "off_u1v2w3x4",
    "moveRequestId": "req_m3n4o5p6",
    "companyId": "cmp_9i0j1k2l",
    "companyName": "Acme Movers Ltd",
    "status": "SENT",
    "pricingRuleId": "pr_9i0j1k2l",
    "breakdown": {
      "baseFee": 150.00,
      "hourlyCharge": 640.00,
      "distanceCharge": 1450.00,
      "serviceAddons": [
        { "name": "Piano Handling", "price": 150.00 },
        { "name": "Packing Service", "price": 200.00 }
      ],
      "subtotal": 2590.00,
      "discount": 1210.00,
      "platformCommission": 129.50,
      "finalPrice": 1380.00
    },
    "teamSize": 3,
    "estimatedDurationHours": 8,
    "includedServices": ["TRANSPORT", "LOADING", "UNLOADING", "PACKING", "DISASSEMBLY"],
    "addonServices": [
      { "name": "Piano Handling", "price": 150.00 }
    ],
    "notes": "We include free packing materials. Discount applied for mid-week move.",
    "validUntil": "2024-07-05T23:59:59.000Z",
    "sentAt": "2024-06-17T09:00:00.000Z",
    "acceptedAt": null,
    "createdAt": "2024-06-16T14:00:00.000Z"
  }
}
```

---

#### POST /offers

**Auth:** Required (`COMPANY`, `APPROVED` status, available for move date)  
**Request Body:** `CreateOfferDto`

**Response 201:**
```json
{
  "data": {
    "id": "off_u1v2w3x4",
    "moveRequestId": "req_m3n4o5p6",
    "companyId": "cmp_9i0j1k2l",
    "status": "DRAFT",
    "finalPrice": 1380.00,
    "currency": "EUR",
    "teamSize": 3,
    "estimatedDurationHours": 8,
    "createdAt": "2024-06-16T14:00:00.000Z"
  }
}
```

**Response 403:**
```json
{
  "statusCode": 403,
  "error": "FORBIDDEN",
  "message": "Company not in selected companies for this move request",
  "code": "NOT_SELECTED_COMPANY"
}
```

**Response 422:**
```json
{
  "statusCode": 422,
  "error": "UNPROCESSABLE_ENTITY",
  "message": "Insufficient team capacity for selected date",
  "code": "INSUFFICIENT_CAPACITY"
}
```

---

#### PATCH /offers/:id

**Auth:** Required (`COMPANY`, owner, status `DRAFT`)  
**Request Body:** `UpdateOfferDto`

**Response 200:** Updated offer.

---

#### POST /offers/:id/send

**Auth:** Required (`COMPANY`, owner, status `DRAFT`)  
**Request Body:** `SendOfferDto` (optional final notes/attachments)

**Response 200:**
```json
{
  "data": {
    "id": "off_u1v2w3x4",
    "status": "SENT",
    "sentAt": "2024-06-17T09:00:00.000Z",
    "validUntil": "2024-07-05T23:59:59.000Z",
    "message": "Offer sent to customer. Valid for 7 days."
  }
}
```

**Notes:** System validates `finalPrice >= 0`. Customer notified via email/push. Offer enters `SENT` state and starts expiration timer.

---

#### POST /offers/:id/accept

**Auth:** Required (`END_CUSTOMER`, move request owner, offer status `SENT`)  
**Response 200:**
```json
{
  "data": {
    "id": "off_u1v2w3x4",
    "status": "ACCEPTED",
    "acceptedAt": "2024-06-18T10:00:00.000Z",
    "moveRequestStatus": "OFFER_ACCEPTED",
    "nextSteps": ["Payment link will be sent 48h before move", "Company contact: +491234567890"]
  }
}
```

**Notes:** Triggers video deletion, commission calculation, and move request status update.

---

#### POST /offers/:id/reject

**Auth:** Required (`END_CUSTOMER` owner or `COMPANY` owner)  
**Request Body:** `{ "reason": "TOO_EXPENSIVE" }` (optional, customer only)

**Response 200:**
```json
{
  "data": {
    "id": "off_u1v2w3x4",
    "status": "REJECTED",
    "rejectedAt": "2024-06-18T10:00:00.000Z",
    "rejectedBy": "CUSTOMER",
    "reason": "TOO_EXPENSIVE"
  }
}
```

**Notes:** Company withdrawal sets `status: WITHDRAWN`, not `REJECTED`.

---

### 2.9 Availability

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| GET | `/availability/me` | Yes | COMPANY | Get company calendar/availability | `?fromDate&toDate` |
| GET | `/availability/check` | No | — | Public capacity check | `?date&companyId` |
| POST | `/availability/slots` | Yes | COMPANY | Create availability slot/override | — |
| PATCH | `/availability/slots/:id` | Yes | COMPANY | Update slot | — |
| DELETE | `/availability/slots/:id` | Yes | COMPANY | Delete slot | — |
| GET | `/availability/teams` | Yes | COMPANY | List teams | — |
| POST | `/availability/teams` | Yes | COMPANY | Create team | — |
| PATCH | `/availability/teams/:id` | Yes | COMPANY | Update team | — |
| DELETE | `/availability/teams/:id` | Yes | COMPANY | Delete team | — |

#### GET /availability/me

**Auth:** Required (`COMPANY`)  
**Query Params:** `fromDate` (ISO date, default today), `toDate` (ISO date, default +30 days)

**Response 200:**
```json
{
  "data": [
    {
      "date": "2024-07-10",
      "status": "AVAILABLE",
      "totalCapacity": 4,
      "bookedCapacity": 1,
      "remainingCapacity": 3,
      "teams": [
        { "teamId": "tm_5e6f7g8h", "teamName": "Team Alpha", "maxParallelJobs": 2, "bookedJobs": 1 },
        { "teamId": "tm_9i0j1k2l", "teamName": "Team Beta", "maxParallelJobs": 2, "bookedJobs": 0 }
      ]
    },
    {
      "date": "2024-07-11",
      "status": "BLOCKED",
      "totalCapacity": 4,
      "bookedCapacity": 4,
      "remainingCapacity": 0,
      "teams": [ ... ]
    }
  ]
}
```

---

#### GET /availability/check

**Auth:** None (Public)  
**Query Params:** `date` (required, ISO date), `companyId` (required, UUID)

**Response 200:**
```json
{
  "data": {
    "companyId": "cmp_9i0j1k2l",
    "date": "2024-07-10",
    "isAvailable": true,
    "remainingCapacity": 3,
    "totalCapacity": 4,
    "message": "Available for booking"
  }
}
```

**Response 200 (unavailable):**
```json
{
  "data": {
    "companyId": "cmp_9i0j1k2l",
    "date": "2024-07-10",
    "isAvailable": false,
    "remainingCapacity": 0,
    "totalCapacity": 4,
    "message": "Fully booked for this date"
  }
}
```

---

#### POST /availability/slots

**Auth:** Required (`COMPANY`)  
**Request Body:** `CreateAvailabilitySlotDto`

**Response 201:**
```json
{
  "data": {
    "id": "slot_1a2b3c4d",
    "companyId": "cmp_9i0j1k2l",
    "date": "2024-07-15",
    "status": "BLOCKED",
    "reason": "Company holiday",
    "teamIds": ["tm_5e6f7g8h", "tm_9i0j1k2l"],
    "createdAt": "2024-06-15T10:23:45.000Z"
  }
}
```

**Notes:** `status` can be `AVAILABLE` (override to open), `BLOCKED` (override to close), or `REDUCED`.

---

#### PATCH /availability/slots/:id

**Auth:** Required (`COMPANY`, owner)  
**Request Body:** `UpdateAvailabilitySlotDto`

**Response 200:** Updated slot.

---

#### DELETE /availability/slots/:id

**Auth:** Required (`COMPANY`, owner)  
**Response 204:** No content.

---

#### GET /availability/teams

**Auth:** Required (`COMPANY`)  
**Response 200:**
```json
{
  "data": [
    {
      "id": "tm_5e6f7g8h",
      "companyId": "cmp_9i0j1k2l",
      "name": "Team Alpha",
      "description": "Experienced team for large moves",
      "maxParallelJobs": 2,
      "defaultTeamSize": 3,
      "isActive": true,
      "members": [
        { "id": "mem_1a2b3c", "name": "Bob", "role": "DRIVER" },
        { "id": "mem_4d5e6f", "name": "Charlie", "role": "MOVER" }
      ],
      "createdAt": "2024-06-15T10:23:45.000Z"
    }
  ]
}
```

---

#### POST /availability/teams

**Auth:** Required (`COMPANY`)  
**Request Body:** `CreateTeamDto`

**Response 201:** Created team.

---

#### PATCH /availability/teams/:id

**Auth:** Required (`COMPANY`, owner)  
**Request Body:** `UpdateTeamDto`

**Response 200:** Updated team.

---

#### DELETE /availability/teams/:id

**Auth:** Required (`COMPANY`, owner)  
**Response 204:** No content.

**Notes:** Cannot delete team with future bookings. Must reassign or cancel bookings first.

---

### 2.10 Reviews

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| POST | `/reviews` | Yes | END_CUSTOMER | Rate a completed move | — |
| GET | `/reviews` | No | — | List reviews (public) | `?companyId&page&limit&sort` |
| GET | `/reviews/:id` | No | — | Get review details | — |
| GET | `/reviews/company/:id/average` | No | — | Get company average rating | — |

#### POST /reviews

**Auth:** Required (`END_CUSTOMER`, move request status `COMPLETED`)  
**Request Body:** `CreateReviewDto`

**Response 201:**
```json
{
  "data": {
    "id": "rev_1a2b3c4d",
    "moveRequestId": "req_m3n4o5p6",
    "companyId": "cmp_9i0j1k2l",
    "customerId": "usr_a1b2c3d4",
    "customerName": "John D.",
    "rating": 5,
    "punctuality": 5,
    "professionalism": 5,
    "carefulness": 4,
    "valueForMoney": 5,
    "comment": "Excellent service! Arrived on time, handled everything with care. Highly recommend.",
    "isFlagged": false,
    "createdAt": "2024-07-15T10:00:00.000Z"
  }
}
```

**Response 409:**
```json
{
  "statusCode": 409,
  "error": "CONFLICT",
  "message": "Review already submitted for this move",
  "code": "REVIEW_ALREADY_EXISTS"
}
```

**Notes:** Reviews are public after admin moderation (auto-approved if no flagged words). Company receives email notification.

---

#### GET /reviews

**Auth:** None (Public)  
**Query Params:** `companyId` (required or optional), `page`, `limit`, `sort` (`-created_at`, `rating`)

**Response 200:**
```json
{
  "data": [
    {
      "id": "rev_1a2b3c4d",
      "customerName": "John D.",
      "rating": 5,
      "comment": "Excellent service!",
      "createdAt": "2024-07-15T10:00:00.000Z",
      "companyResponse": null
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 128, "totalPages": 7 }
}
```

---

#### GET /reviews/:id

**Auth:** None  
**Response 200:** Full review with company response (if any).

```json
{
  "data": {
    "id": "rev_1a2b3c4d",
    "moveRequestId": "req_m3n4o5p6",
    "companyId": "cmp_9i0j1k2l",
    "customerName": "John D.",
    "rating": 5,
    "punctuality": 5,
    "professionalism": 5,
    "carefulness": 4,
    "valueForMoney": 5,
    "comment": "Excellent service!",
    "companyResponse": {
      "text": "Thank you for your kind words, John!",
      "respondedAt": "2024-07-16T09:00:00.000Z"
    },
    "isFlagged": false,
    "createdAt": "2024-07-15T10:00:00.000Z"
  }
}
```

---

#### GET /reviews/company/:id/average

**Auth:** None  
**Response 200:**
```json
{
  "data": {
    "companyId": "cmp_9i0j1k2l",
    "averageRating": 4.73,
    "reviewCount": 128,
    "distribution": {
      "5": 98,
      "4": 22,
      "3": 6,
      "2": 1,
      "1": 1
    },
    "categoryAverages": {
      "punctuality": 4.8,
      "professionalism": 4.9,
      "carefulness": 4.6,
      "valueForMoney": 4.7
    }
  }
}
```

---

### 2.11 Admin

| Method | Path | Auth | Role | Description | Query Params |
|--------|------|------|------|-------------|--------------|
| GET | `/admin/dashboard/stats` | Yes | ADMIN | Platform overview stats | `?fromDate&toDate` |
| GET | `/admin/companies` | Yes | ADMIN | Approval queue + all companies | `?page&limit&status&sort` |
| PATCH | `/admin/companies/:id/approve` | Yes | ADMIN | Approve a company | — |
| PATCH | `/admin/companies/:id/reject` | Yes | ADMIN | Reject a company | — |
| PATCH | `/admin/companies/:id/suspend` | Yes | ADMIN | Suspend a company | — |
| GET | `/admin/documents` | Yes | ADMIN | Document verification queue | `?page&limit&status&sort` |
| PATCH | `/admin/documents/:id/verify` | Yes | ADMIN | Verify/reject a document | — |
| GET | `/admin/users` | Yes | ADMIN | List all users | `?page&limit&role&sort` |
| GET | `/admin/requests` | Yes | ADMIN | List all move requests | `?page&limit&status&sort` |
| GET | `/admin/commissions` | Yes | ADMIN | Commission report | `?page&limit&companyId&fromDate&toDate` |
| PATCH | `/admin/commissions/:companyId` | Yes | ADMIN | Update commission rate | — |
| GET | `/admin/reviews/flagged` | Yes | ADMIN | Flagged reviews for moderation | `?page&limit&sort` |
| GET | `/admin/logs` | Yes | ADMIN | Audit / activity logs | `?page&limit&entityType&entityId&fromDate&toDate` |

#### GET /admin/dashboard/stats

**Auth:** Required (`ADMIN`)  
**Query Params:** `fromDate`, `toDate` (ISO dates, default last 30 days)

**Response 200:**
```json
{
  "data": {
    "period": { "from": "2024-06-01", "to": "2024-06-30" },
    "users": { "total": 4520, "new": 320, "active": 1890 },
    "companies": { "total": 87, "pending": 12, "approved": 68, "suspended": 7 },
    "moveRequests": { "total": 1450, "draft": 320, "submitted": 210, "offersReceived": 340, "completed": 480, "cancelled": 100 },
    "offers": { "total": 3890, "sent": 2100, "accepted": 520, "rejected": 890, "expired": 380 },
    "revenue": { "gross": 2845000.00, "commission": 142250.00, "currency": "EUR" },
    "reviews": { "total": 520, "averageRating": 4.6, "flagged": 3 }
  }
}
```

---

#### GET /admin/companies

**Auth:** Required (`ADMIN`)  
**Query Params:** `page`, `limit`, `status` (`PENDING_APPROVAL` | `APPROVED` | `REJECTED` | `SUSPENDED`), `sort`

**Response 200:**
```json
{
  "data": [
    {
      "id": "cmp_9i0j1k2l",
      "name": "Acme Movers Ltd",
      "email": "owner@acmemovers.com",
      "status": "PENDING_APPROVAL",
      "documentsSubmitted": 2,
      "documentsVerified": 0,
      "registeredAt": "2024-06-15T10:23:45.000Z",
      "daysPending": 5
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

---

#### PATCH /admin/companies/:id/approve

**Auth:** Required (`ADMIN`)  
**Request Body:** `{ "commissionRate": 0.05, "notes": "All documents verified. Welcome aboard!" }`

**Response 200:**
```json
{
  "data": {
    "id": "cmp_9i0j1k2l",
    "status": "APPROVED",
    "approvedAt": "2024-06-20T14:00:00.000Z",
    "approvedBy": "usr_admin1",
    "commissionRate": 0.05,
    "notes": "All documents verified. Welcome aboard!",
    "message": "Company approved. Owner notified via email."
  }
}
```

---

#### PATCH /admin/companies/:id/reject

**Auth:** Required (`ADMIN`)  
**Request Body:** `{ "reason": "INCOMPLETE_DOCUMENTS", "message": "Business license expired. Please submit updated document." }`

**Response 200:**
```json
{
  "data": {
    "id": "cmp_9i0j1k2l",
    "status": "REJECTED",
    "rejectedAt": "2024-06-20T14:00:00.000Z",
    "rejectedBy": "usr_admin1",
    "reason": "INCOMPLETE_DOCUMENTS",
    "message": "Business license expired. Please submit updated document."
  }
}
```

---

#### PATCH /admin/companies/:id/suspend

**Auth:** Required (`ADMIN`)  
**Request Body:** `{ "reason": "VIOLATION", "message": "Multiple customer complaints received.", "durationDays": 30 }`

**Response 200:**
```json
{
  "data": {
    "id": "cmp_9i0j1k2l",
    "status": "SUSPENDED",
    "suspendedAt": "2024-06-20T14:00:00.000Z",
    "suspendedBy": "usr_admin1",
    "reason": "VIOLATION",
    "message": "Multiple customer complaints received.",
    "suspensionEndsAt": "2024-07-20T14:00:00.000Z"
  }
}
```

**Notes:** Suspended companies are hidden from marketplace and cannot receive new requests. Existing accepted moves proceed.

---

#### GET /admin/documents

**Auth:** Required (`ADMIN`)  
**Query Params:** `page`, `limit`, `status` (`PENDING_VERIFICATION` | `VERIFIED` | `REJECTED`), `sort`

**Response 200:**
```json
{
  "data": [
    {
      "id": "doc_1a2b3c4d",
      "companyId": "cmp_9i0j1k2l",
      "companyName": "Acme Movers Ltd",
      "type": "BUSINESS_LICENSE",
      "fileName": "license.pdf",
      "status": "PENDING_VERIFICATION",
      "uploadedAt": "2024-06-15T10:23:45.000Z",
      "url": "https://s3.mymove.com/docs/doc_1a2b3c4d.pdf"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 25, "totalPages": 2 }
}
```

---

#### PATCH /admin/documents/:id/verify

**Auth:** Required (`ADMIN`)  
**Request Body:** `{ "status": "VERIFIED", "notes": "License valid until 2026." }` or `{ "status": "REJECTED", "reason": "Document unclear", "notes": "Please re-scan and upload." }`

**Response 200:** Updated document with verification info.

---

#### GET /admin/users

**Auth:** Required (`ADMIN`)  
**Query Params:** `page`, `limit`, `role`, `sort`

**Response 200:** Paginated user list (sensitive data like password hash excluded).

---

#### GET /admin/requests

**Auth:** Required (`ADMIN`)  
**Query Params:** `page`, `limit`, `status`, `sort`, `fromDate`, `toDate`

**Response 200:** Paginated move request list with customer and company summary.

---

#### GET /admin/commissions

**Auth:** Required (`ADMIN`)  
**Query Params:** `page`, `limit`, `companyId`, `fromDate`, `toDate`

**Response 200:**
```json
{
  "data": [
    {
      "companyId": "cmp_9i0j1k2l",
      "companyName": "Acme Movers Ltd",
      "period": "2024-06",
      "totalMoves": 42,
      "grossRevenue": 58300.00,
      "commissionRate": 0.05,
      "commissionAmount": 2915.00,
      "currency": "EUR",
      "status": "PENDING_PAYOUT"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 68, "totalPages": 4 }
}
```

---

#### PATCH /admin/commissions/:companyId

**Auth:** Required (`ADMIN`)  
**Request Body:** `UpdateCommissionDto`

**Response 200:**
```json
{
  "data": {
    "companyId": "cmp_9i0j1k2l",
    "oldRate": 0.05,
    "newRate": 0.045,
    "effectiveFrom": "2024-07-01",
    "updatedAt": "2024-06-20T14:00:00.000Z"
  }
}
```

**Notes:** Rate changes apply to future offers only. Historical commissions remain at old rate.

---

#### GET /admin/reviews/flagged

**Auth:** Required (`ADMIN`)  
**Query Params:** `page`, `limit`, `sort`

**Response 200:**
```json
{
  "data": [
    {
      "id": "rev_flagged1",
      "companyId": "cmp_9i0j1k2l",
      "companyName": "Acme Movers Ltd",
      "customerName": "Jane D.",
      "rating": 1,
      "comment": "Terrible experience!!!",
      "flagReason": "SUSPICIOUS_PATTERN",
      "flaggedAt": "2024-06-20T10:00:00.000Z",
      "autoFlagged": true
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

---

#### GET /admin/logs

**Auth:** Required (`ADMIN`)  
**Query Params:** `page`, `limit`, `entityType`, `entityId`, `fromDate`, `toDate`, `action`

**Response 200:**
```json
{
  "data": [
    {
      "id": "log_1a2b3c4d",
      "timestamp": "2024-06-20T14:00:00.000Z",
      "actorId": "usr_admin1",
      "actorRole": "ADMIN",
      "action": "COMPANY_APPROVED",
      "entityType": "COMPANY",
      "entityId": "cmp_9i0j1k2l",
      "details": { "previousStatus": "PENDING_APPROVAL", "newStatus": "APPROVED" },
      "ipAddress": "203.0.113.42",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 12400, "totalPages": 248 }
}
```

---

## Section 3 — DTO Specifications

All DTOs use `class-validator` decorators for runtime validation. All fields are required unless marked with `@IsOptional()`.

---

### Auth DTOs

```typescript
import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterCustomerDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}
```

```typescript
import { IsString, IsEmail, IsOptional, MinLength, MaxLength, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CompanyAddressDto {
  @IsString()
  @MaxLength(200)
  street: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(20)
  postalCode: string;

  @IsString()
  @MaxLength(2)
  country: string;
}

export class RegisterCompanyDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  companyName: string;

  @ValidateNested()
  @Type(() => CompanyAddressDto)
  @IsOptional()
  address?: CompanyAddressDto;
}
```

```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
```

---

### User DTOs

```typescript
import { IsString, IsOptional, MaxLength, IsBoolean, IsEnum } from 'class-validator';

class NotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @IsBoolean()
  @IsOptional()
  sms?: boolean;

  @IsBoolean()
  @IsOptional()
  push?: boolean;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  avatarUrl?: string;
}
```

---

### Company DTOs

```typescript
import { IsString, IsOptional, MaxLength, IsArray, IsUrl, ValidateNested, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @MaxLength(200)
  street: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(20)
  postalCode: string;

  @IsString()
  @MaxLength(2)
  country: string;
}

export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @IsUrl()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @IsUrl()
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serviceArea?: string[];
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @IsUrl()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @IsUrl()
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  serviceArea?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery?: string[];
}
```

```typescript
import { IsString, IsEnum, MaxLength } from 'class-validator';

export enum DocumentType {
  BUSINESS_LICENSE = 'BUSINESS_LICENSE',
  INSURANCE_CERTIFICATE = 'INSURANCE_CERTIFICATE',
  TAX_ID = 'TAX_ID',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  OTHER = 'OTHER',
}

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @MaxLength(100)
  mimeType: string;

  @IsString()
  @MaxLength(255)
  url: string;
}
```

---

### Move Request DTOs

```typescript
import { IsString, IsOptional, MaxLength, IsEnum, IsNumber, Min, IsBoolean, IsDateString, IsArray, ArrayMinSize } from 'class-validator';

export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  OFFICE = 'OFFICE',
  STORAGE = 'STORAGE',
  OTHER = 'OTHER',
}

export enum SpecialRequirement {
  FRAGILE_ITEMS = 'FRAGILE_ITEMS',
  PIANO = 'PIANO',
  ANTiques = 'ANTIQUES',
  ART = 'ART',
  PETS = 'PETS',
  STAIR_CARRY = 'STAIR_CARRY',
  LONG_CARRY = 'LONG_CARRY',
  PARKING_RESTRICTED = 'PARKING_RESTRICTED',
}

export class CreateMoveRequestDto {
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  fromAddress: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  toAddress: string;

  @IsDateString()
  moveDate: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  moveTime?: string;

  @IsEnum(PropertyType)
  propertyTypeFrom: PropertyType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  floorFrom?: number;

  @IsBoolean()
  @IsOptional()
  elevatorFrom?: boolean;

  @IsEnum(PropertyType)
  propertyTypeTo: PropertyType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  floorTo?: number;

  @IsBoolean()
  @IsOptional()
  elevatorTo?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedDistanceKm?: number;

  @IsArray()
  @IsEnum(SpecialRequirement, { each: true })
  @IsOptional()
  specialRequirements?: SpecialRequirement[];

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
```

```typescript
import { IsString, IsOptional, MaxLength, IsEnum, IsNumber, Min, IsBoolean, IsDateString, IsArray } from 'class-validator';

export class UpdateMoveRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(500)
  fromAddress?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(500)
  toAddress?: string;

  @IsDateString()
  @IsOptional()
  moveDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  moveTime?: string;

  @IsEnum(PropertyType)
  @IsOptional()
  propertyTypeFrom?: PropertyType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  floorFrom?: number;

  @IsBoolean()
  @IsOptional()
  elevatorFrom?: boolean;

  @IsEnum(PropertyType)
  @IsOptional()
  propertyTypeTo?: PropertyType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  floorTo?: number;

  @IsBoolean()
  @IsOptional()
  elevatorTo?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedDistanceKm?: number;

  @IsArray()
  @IsEnum(SpecialRequirement, { each: true })
  @IsOptional()
  specialRequirements?: SpecialRequirement[];

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
```

```typescript
import { IsArray, IsString, ArrayMinSize, MaxLength } from 'class-validator';

export class SubmitMoveRequestDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @MaxLength(50, { each: true })
  companyIds: string[];
}
```

---

### Inventory DTOs

```typescript
import { IsString, IsOptional, MaxLength, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';

export enum InventoryCategory {
  FURNITURE = 'FURNITURE',
  ELECTRONICS = 'ELECTRONICS',
  APPLIANCES = 'APPLIANCES',
  BOXES = 'BOXES',
  CLOTHING = 'CLOTHING',
  KITCHEN = 'KITCHEN',
  DECOR = 'DECOR',
  SPORTS = 'SPORTS',
  OTHER = 'OTHER',
}

export enum InventorySource {
  AI = 'AI',
  MANUAL = 'MANUAL',
}

export class CreateInventoryItemDto {
  @IsString()
  @MaxLength(200)
  moveRequestId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsEnum(InventoryCategory)
  category: InventoryCategory;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  volumeM3?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weightKg?: number;

  @IsBoolean()
  @IsOptional()
  fragile?: boolean;

  @IsBoolean()
  @IsOptional()
  disassemblyRequired?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  imageUrl?: string;
}
```

```typescript
import { IsString, IsOptional, MaxLength, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateInventoryItemDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsEnum(InventoryCategory)
  @IsOptional()
  category?: InventoryCategory;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  volumeM3?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weightKg?: number;

  @IsBoolean()
  @IsOptional()
  fragile?: boolean;

  @IsBoolean()
  @IsOptional()
  disassemblyRequired?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  imageUrl?: string;
}
```

---

### Video DTOs

```typescript
import { IsString, MaxLength, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class PresignedUrlDto {
  @IsString()
  @MaxLength(200)
  moveRequestId: string;

  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @MaxLength(100)
  mimeType: string;

  @IsNumber()
  @Min(1)
  @Max(104857600)
  fileSize: number;
}
```

---

### Pricing DTOs

```typescript
import { IsString, IsOptional, MaxLength, IsNumber, Min, IsBoolean, IsInt } from 'class-validator';

export class CreatePricingRuleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(0)
  baseFee: number;

  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @IsNumber()
  @Min(0)
  pricePerKm: number;

  @IsInt()
  @Min(1)
  teamSize: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minHours?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDistanceKm?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
```

```typescript
import { IsString, IsOptional, MaxLength, IsNumber, Min, IsBoolean, IsInt } from 'class-validator';

export class UpdatePricingRuleDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseFee?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerHour?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pricePerKm?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  teamSize?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minHours?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDistanceKm?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
```

```typescript
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class AddonCalculationDto {
  @IsString()
  addonId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CalculateEstimateDto {
  @IsString()
  moveRequestId: string;

  @IsString()
  pricingRuleId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddonCalculationDto)
  @IsOptional()
  addons?: AddonCalculationDto[];
}
```

```typescript
import { IsString, IsOptional, MaxLength, IsNumber, Min, IsEnum, IsBoolean } from 'class-validator';

export enum ServiceAddonCategory {
  SPECIAL_ITEM = 'SPECIAL_ITEM',
  PACKING = 'PACKING',
  STORAGE = 'STORAGE',
  CLEANING = 'CLEANING',
  DISPOSAL = 'DISPOSAL',
  OTHER = 'OTHER',
}

export class CreateServiceAddonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(ServiceAddonCategory)
  category: ServiceAddonCategory;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

```typescript
import { IsString, IsOptional, MaxLength, IsNumber, Min, IsEnum, IsBoolean } from 'class-validator';

export class UpdateServiceAddonDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(ServiceAddonCategory)
  @IsOptional()
  category?: ServiceAddonCategory;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

---

### Offer DTOs

```typescript
import { IsString, IsOptional, MaxLength, IsNumber, Min, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OfferAddonDto {
  @IsString()
  serviceAddonId: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOfferDto {
  @IsString()
  @MaxLength(200)
  moveRequestId: string;

  @IsString()
  @MaxLength(200)
  pricingRuleId: string;

  @IsNumber()
  @Min(0)
  finalPrice: number;

  @IsInt()
  @Min(1)
  teamSize: number;

  @IsNumber()
  @Min(0.5)
  estimatedDurationHours: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedServices?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfferAddonDto)
  @IsOptional()
  addonServices?: OfferAddonDto[];

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
```

```typescript
import { IsString, IsOptional, MaxLength, IsNumber, Min, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOfferDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  finalPrice?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  teamSize?: number;

  @IsNumber()
  @Min(0.5)
  @IsOptional()
  estimatedDurationHours?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedServices?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfferAddonDto)
  @IsOptional()
  addonServices?: OfferAddonDto[];

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
```

```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class SendOfferDto {
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  finalNotes?: string;
}
```

---

### Availability DTOs

```typescript
import { IsString, IsOptional, MaxLength, IsEnum, IsDateString, IsArray, IsInt, Min, IsNumber } from 'class-validator';

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  BLOCKED = 'BLOCKED',
  REDUCED = 'REDUCED',
}

export class CreateAvailabilitySlotDto {
  @IsDateString()
  date: string;

  @IsEnum(AvailabilityStatus)
  status: AvailabilityStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  teamIds?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  reducedCapacity?: number;
}
```

```typescript
import { IsString, IsOptional, MaxLength, IsEnum, IsDateString, IsArray, IsNumber, Min } from 'class-validator';

export class UpdateAvailabilitySlotDto {
  @IsEnum(AvailabilityStatus)
  @IsOptional()
  status?: AvailabilityStatus;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  teamIds?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  reducedCapacity?: number;
}
```

```typescript
import { IsString, IsOptional, MaxLength, IsInt, Min, IsBoolean, IsArray } from 'class-validator';

class TeamMemberDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(100)
  role: string;
}

export class CreateTeamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @Min(1)
  maxParallelJobs: number;

  @IsInt()
  @Min(1)
  defaultTeamSize: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  members?: TeamMemberDto[];
}
```

```typescript
import { IsString, IsOptional, MaxLength, IsInt, Min, IsBoolean, IsArray } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxParallelJobs?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  defaultTeamSize?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  members?: TeamMemberDto[];
}
```

---

### Review DTOs

```typescript
import { IsString, IsOptional, MaxLength, IsInt, Min, Max, IsEnum } from 'class-validator';

export enum RejectReason {
  TOO_EXPENSIVE = 'TOO_EXPENSIVE',
  BETTER_OFFER = 'BETTER_OFFER',
  CHANGED_PLANS = 'CHANGED_PLANS',
  COMPANY_UNAVAILABLE = 'COMPANY_UNAVAILABLE',
  OTHER = 'OTHER',
}

export class CreateReviewDto {
  @IsString()
  @MaxLength(200)
  moveRequestId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  punctuality?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  professionalism?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  carefulness?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  valueForMoney?: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  comment?: string;
}
```

---

### Admin DTOs

```typescript
import { IsString, IsOptional, MaxLength, IsNumber, Min, Max, IsDateString } from 'class-validator';

export class UpdateCommissionDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  commissionRate: number;

  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;
}
```

---

## Section 4 — Error Handling

### Standard Error Response Format

Every error response follows this structure:

```json
{
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Human-readable description",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "details": [],
  "timestamp": "2024-06-15T10:23:45.000Z",
  "path": "/api/v1/move-requests",
  "requestId": "req_8f2a9c1d"
}
```

| Field | Description |
|-------|-------------|
| `statusCode` | HTTP status code (integer) |
| `error` | HTTP error name (e.g., `BAD_REQUEST`) |
| `message` | Human-readable message (safe for UI display) |
| `code` | Machine-readable enum for i18n / programmatic handling |
| `details` | Array of field-level errors (validation only) |
| `timestamp` | ISO 8601 timestamp of error occurrence |
| `path` | Request path that caused the error |
| `requestId` | Unique request correlation ID |

### HTTP Status Codes

| Status | Scenario | Example Code |
|--------|----------|--------------|
| 200 | Success | — |
| 201 | Created | — |
| 204 | No content (delete/logout) | — |
| 400 | Bad request / validation failure | `VALIDATION_ERROR` |
| 401 | Missing or invalid JWT | `UNAUTHORIZED` |
| 403 | Valid JWT but insufficient permissions | `FORBIDDEN` |
| 404 | Resource not found | `MOVE_REQUEST_NOT_FOUND` |
| 409 | Conflict (duplicate, state violation) | `EMAIL_ALREADY_EXISTS` |
| 410 | Resource expired (offers) | `OFFER_EXPIRED` |
| 422 | Business logic violation | `INSUFFICIENT_CAPACITY` |
| 429 | Rate limit exceeded | `RATE_LIMIT_EXCEEDED` |
| 500 | Internal server error | `INTERNAL_ERROR` |

### Error Code Enum

```typescript
export enum ErrorCode {
  // General
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Auth
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Move Requests
  MOVE_REQUEST_NOT_FOUND = 'MOVE_REQUEST_NOT_FOUND',
  MOVE_REQUEST_LOCKED = 'MOVE_REQUEST_LOCKED',
  INVALID_MOVE_STATUS = 'INVALID_MOVE_STATUS',

  // Offers
  OFFER_NOT_FOUND = 'OFFER_NOT_FOUND',
  OFFER_EXPIRED = 'OFFER_EXPIRED',
  OFFER_ALREADY_ACCEPTED = 'OFFER_ALREADY_ACCEPTED',
  NOT_SELECTED_COMPANY = 'NOT_SELECTED_COMPANY',

  // Companies
  COMPANY_NOT_FOUND = 'COMPANY_NOT_FOUND',
  COMPANY_PENDING_APPROVAL = 'COMPANY_PENDING_APPROVAL',
  COMPANY_SUSPENDED = 'COMPANY_SUSPENDED',

  // Availability
  INSUFFICIENT_CAPACITY = 'INSUFFICIENT_CAPACITY',
  TEAM_NOT_FOUND = 'TEAM_NOT_FOUND',
  TEAM_HAS_BOOKINGS = 'TEAM_HAS_BOOKINGS',

  // Videos
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  VIDEO_TOO_LARGE = 'VIDEO_TOO_LARGE',
  VIDEO_UPLOAD_EXPIRED = 'VIDEO_UPLOAD_EXPIRED',

  // Inventory
  INVENTORY_ITEM_NOT_FOUND = 'INVENTORY_ITEM_NOT_FOUND',
  AI_ANALYSIS_FAILED = 'AI_ANALYSIS_FAILED',

  // Pricing
  PRICING_RULE_NOT_FOUND = 'PRICING_RULE_NOT_FOUND',
  INVALID_PRICING_PARAMS = 'INVALID_PRICING_PARAMS',

  // Reviews
  REVIEW_ALREADY_EXISTS = 'REVIEW_ALREADY_EXISTS',
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',

  // Documents
  DOCUMENT_NOT_FOUND = 'DOCUMENT_NOT_FOUND',
  DOCUMENT_VERIFIED_IMMUTABLE = 'DOCUMENT_VERIFIED_IMMUTABLE',

  // Admin
  ADMIN_ONLY = 'ADMIN_ONLY',
  INVALID_COMMISSION_RATE = 'INVALID_COMMISSION_RATE',
}
```

### Global Exception Filter Behavior

```typescript
// NestJS Global Exception Filter (pseudocode)
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse = {
      statusCode: status,
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      code: ErrorCode.INTERNAL_ERROR,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.requestId,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      errorResponse = {
        ...errorResponse,
        statusCode: status,
        error: HttpStatus[status] || 'UNKNOWN',
        message: res.message || exception.message,
        code: res.code || ErrorCode.INTERNAL_ERROR,
        details: res.details || [],
      };
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      errorResponse.statusCode = status;
      errorResponse.error = 'BAD_REQUEST';
      errorResponse.code = ErrorCode.VALIDATION_ERROR;
      errorResponse.details = formatValidationErrors(exception);
    }

    // Log to monitoring
    this.logger.error({
      ...errorResponse,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorResponse);
  }
}
```

**Key Behaviors:**
- All exceptions caught and formatted consistently
- Stack traces logged internally but never leaked to client (production)
- Request ID propagated from middleware for tracing
- Validation errors include per-field details array
- Business exceptions throw `UnprocessableEntityException` with custom `code`

---

## Section 5 — Authentication & Authorization

### JWT Validation Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Client    │────▶│  NestJS Guard    │────▶│  Supabase JWT   │────▶│  User DB    │
│  (Bearer)   │     │  (AuthGuard)     │     │   Verification  │     │  (profile)  │
└─────────────┘     └──────────────────┘     └─────────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │  RolesGuard      │
                    │  (RBAC check)    │
                    └──────────────────┘
```

1. **AuthGuard** extracts `Authorization: Bearer <token>` header
2. Token verified against Supabase JWT public key (RS256)
3. Decoded payload attached to `req.user`:
   ```typescript
   interface AuthenticatedUser {
     sub: string;        // user UUID
     email: string;
     role: UserRole;
     iat: number;
     exp: number;
   }
   ```
4. **RolesGuard** checks `req.user.role` against endpoint's `@Roles()` decorator
5. If role mismatch → `403 FORBIDDEN` with code `FORBIDDEN`
6. If token expired → `401 UNAUTHORIZED` with code `TOKEN_EXPIRED`
7. If token invalid → `401 UNAUTHORIZED` with code `INVALID_TOKEN`

### Role-Based Access Matrix

| Endpoint | END_CUSTOMER | COMPANY | ADMIN | Public |
|----------|:----------:|:-------:|:-----:|:------:|
| `POST /auth/register` | — | — | — | ✅ |
| `POST /auth/register-company` | — | — | — | ✅ |
| `POST /auth/login` | — | — | — | ✅ |
| `POST /auth/forgot-password` | — | — | — | ✅ |
| `POST /auth/reset-password` | — | — | — | ✅ |
| `POST /auth/logout` | ✅ | ✅ | ✅ | — |
| `POST /auth/refresh` | ✅ | ✅ | ✅ | — |
| `GET /auth/me` | ✅ | ✅ | ✅ | — |
| `GET /users/me` | ✅ | ✅ | ✅ | — |
| `PATCH /users/me` | ✅ | ✅ | ✅ | — |
| `GET /users/me/moves` | ✅ | — | — | — |
| `PATCH /users/me/settings` | ✅ | ✅ | ✅ | — |
| `POST /companies` | — | ✅ | — | — |
| `GET /companies/me` | — | ✅ | — | — |
| `PATCH /companies/me` | — | ✅ | — | — |
| `GET /companies` | — | — | — | ✅ |
| `GET /companies/:id` | — | — | — | ✅ |
| `POST /companies/me/documents` | — | ✅ | — | — |
| `GET /companies/me/documents` | — | ✅ | — | — |
| `DELETE /companies/me/documents/:id` | — | ✅ | — | — |
| `POST /move-requests` | ✅ | — | — | — |
| `GET /move-requests` | ✅ | — | — | — |
| `GET /move-requests/:id` | ✅* | ✅** | — | — |
| `PATCH /move-requests/:id` | ✅ | — | — | — |
| `POST /move-requests/:id/submit` | ✅ | — | — | — |
| `POST /move-requests/:id/video` | ✅ | — | — | — |
| `GET /move-requests/:id/inventory` | ✅* | ✅** | — | — |
| `PATCH /move-requests/:id/inventory` | ✅ | — | — | — |
| `POST /move-requests/:id/request-offers` | ✅ | — | — | — |
| `GET /move-requests/:id/offers` | ✅* | ✅** | — | — |
| `POST /move-requests/:id/accept-offer/:offerId` | ✅ | — | — | — |
| `GET /inventory` | ✅* | ✅** | — | — |
| `POST /inventory/items` | ✅ | — | — | — |
| `PATCH /inventory/items/:id` | ✅ | — | — | — |
| `DELETE /inventory/items/:id` | ✅ | — | — | — |
| `GET /inventory/ai-analysis` | ✅* | ✅** | — | — |
| `POST /videos/presigned-url` | ✅ | — | — | — |
| `POST /videos/confirm-upload` | ✅ | — | — | — |
| `GET /videos/:id/url` | ✅* | ✅** | — | — |
| `DELETE /videos/:id` | ✅ | — | — | — |
| `GET /pricing/rules/me` | — | ✅ | — | — |
| `POST /pricing/rules` | — | ✅ | — | — |
| `PATCH /pricing/rules/:id` | — | ✅ | — | — |
| `DELETE /pricing/rules/:id` | — | ✅ | — | — |
| `POST /pricing/calculate` | ✅ | ✅ | — | — |
| `GET /pricing/service-addons` | — | ✅ | — | — |
| `POST /pricing/service-addons` | — | ✅ | — | — |
| `PATCH /pricing/service-addons/:id` | — | ✅ | — | — |
| `DELETE /pricing/service-addons/:id` | — | ✅ | — | — |
| `GET /offers` | ✅* | ✅** | — | — |
| `GET /offers/:id` | ✅* | ✅** | — | — |
| `POST /offers` | — | ✅ | — | — |
| `PATCH /offers/:id` | — | ✅ | — | — |
| `POST /offers/:id/send` | — | ✅ | — | — |
| `POST /offers/:id/accept` | ✅ | — | — | — |
| `POST /offers/:id/reject` | ✅ | ✅ | — | — |
| `GET /availability/me` | — | ✅ | — | — |
| `GET /availability/check` | — | — | — | ✅ |
| `POST /availability/slots` | — | ✅ | — | — |
| `PATCH /availability/slots/:id` | — | ✅ | — | — |
| `DELETE /availability/slots/:id` | — | ✅ | — | — |
| `GET /availability/teams` | — | ✅ | — | — |
| `POST /availability/teams` | — | ✅ | — | — |
| `PATCH /availability/teams/:id` | — | ✅ | — | — |
| `DELETE /availability/teams/:id` | — | ✅ | — | — |
| `POST /reviews` | ✅ | — | — | — |
| `GET /reviews` | — | — | — | ✅ |
| `GET /reviews/:id` | — | — | — | ✅ |
| `GET /reviews/company/:id/average` | — | — | — | ✅ |
| `GET /admin/dashboard/stats` | — | — | ✅ | — |
| `GET /admin/companies` | — | — | ✅ | — |
| `PATCH /admin/companies/:id/approve` | — | — | ✅ | — |
| `PATCH /admin/companies/:id/reject` | — | — | ✅ | — |
| `PATCH /admin/companies/:id/suspend` | — | — | ✅ | — |
| `GET /admin/documents` | — | — | ✅ | — |
| `PATCH /admin/documents/:id/verify` | — | — | ✅ | — |
| `GET /admin/users` | — | — | ✅ | — |
| `GET /admin/requests` | — | — | ✅ | — |
| `GET /admin/commissions` | — | — | ✅ | — |
| `PATCH /admin/commissions/:companyId` | — | — | ✅ | — |
| `GET /admin/reviews/flagged` | — | — | ✅ | — |
| `GET /admin/logs` | — | — | ✅ | — |

\* Owner only  
\** Only if company has an offer on the move request

### Public Endpoints List

The following endpoints require **no authentication**:

1. `POST /api/v1/auth/register`
2. `POST /api/v1/auth/register-company`
3. `POST /api/v1/auth/login`
4. `POST /api/v1/auth/forgot-password`
5. `POST /api/v1/auth/reset-password`
6. `GET /api/v1/companies`
7. `GET /api/v1/companies/:id`
8. `GET /api/v1/availability/check`
9. `GET /api/v1/reviews`
10. `GET /api/v1/reviews/:id`
11. `GET /api/v1/reviews/company/:id/average`

### Middleware Behavior

| Middleware | Order | Purpose |
|------------|-------|---------|
| `RequestIdMiddleware` | 1 | Attaches `X-Request-Id` (or generates UUID) to request context |
| `LoggerMiddleware` | 2 | Logs request method, path, duration, status code |
| `AuthMiddleware` | 3 | Validates JWT, populates `req.user` |
| `RolesGuard` | 4 | Checks `@Roles()` decorator against `req.user.role` |
| `CompanyStatusGuard` | 5 | (COMPANY only) Checks company is `APPROVED`; blocks `PENDING`/`SUSPENDED` |
| `RateLimitInterceptor` | 6 | Applies rate limits per endpoint category |

**Company Status Guard Rules:**
- `PENDING_APPROVAL` → 403 with code `COMPANY_PENDING_APPROVAL` (except `GET /companies/me`, `PATCH /companies/me`, document endpoints)
- `SUSPENDED` → 403 with code `COMPANY_SUSPENDED` (all endpoints)
- `REJECTED` → 403 with code `COMPANY_PENDING_APPROVAL` (prompts re-registration)

**Ownership Validation:**
- For `END_CUSTOMER`: `resource.customerId === req.user.sub`
- For `COMPANY`: `resource.companyId === req.user.companyId` (companyId fetched from profile)
- For `ADMIN`: No ownership check; full access
- Cross-resource access for companies (e.g., viewing move request inventory) is permitted only when an offer relationship exists.

---

## Appendix: NestJS Swagger/OpenAPI Annotations

```typescript
// Example controller annotation for reference
@ApiTags('Move Requests')
@Controller('move-requests')
@UseGuards(AuthGuard, RolesGuard)
export class MoveRequestController {
  @Post()
  @Roles(UserRole.END_CUSTOMER)
  @ApiOperation({ summary: 'Create a draft move request' })
  @ApiResponse({ status: 201, description: 'Move request created', type: MoveRequestResponse })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiBearerAuth()
  async create(
    @Body() dto: CreateMoveRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<MoveRequestResponse> { ... }
}
```

**Swagger UI URL:** `https://api.mymove.com/api/v1/docs`  
**OpenAPI JSON:** `https://api.mymove.com/api/v1/docs-json`

---

*End of API Specification v1.0.0*

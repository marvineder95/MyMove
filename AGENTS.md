<!-- From: /Users/marvineder/Documents/Marvin/MyMove/AGENTS.md -->
# AGENTS.md — MyMove Platform

> This file is written for AI coding agents. It describes the actual state of the codebase, build commands, conventions, and known gaps. Read this before making any changes.

---

## Project Overview

**MyMove** is a hybrid B2C + B2B SaaS + marketplace platform for moving services. It connects end customers with moving companies, supports video-based inventory capture, company pricing/offer workflows, and role-based access for customers, companies, and admins.

The repository is a monorepo-style root containing three top-level directories:

| Directory | Purpose |
|-----------|---------|
| `mymove-api/` | NestJS backend API (Node.js / TypeScript) |
| `mymove-frontend/` | Vue 3 SPA (TypeScript / Vite / TailwindCSS) |
| `mymove-foundation/` | Markdown specification documents (architecture plans, DB schema, API design, frontend structure). These are **planning artifacts**, not generated code. |

The project is currently in early MVP implementation. The foundation docs describe a target architecture (21 tables, 60+ endpoints, multi-tenancy, SaaS white-label, etc.). The actual code implements a leaner first phase (9 backend modules, 11 frontend pages, 4 Pinia stores).

---

## Technology Stack

### Backend (`mymove-api/`)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | NestJS | `^10.3.0` |
| Language | TypeScript | `^5.3.3` |
| ORM | TypeORM | `^0.3.17` |
| Database | MySQL 8 (via `mysql2`) | `^3.6.5` |
| Auth | Passport + JWT + Supabase | `^10.0.3` / `^10.2.0` |
| Validation | `class-validator` + `class-transformer` | `^0.14.0` / `^0.5.1` |
| Config | `@nestjs/config` + Joi | `^3.1.1` / `^17.11.0` |
| API Docs | Swagger (`@nestjs/swagger`) | `^7.2.0` |
| Security | `helmet` | `^7.1.0` |
| File Storage | AWS S3 (SDK v3 `client-s3`) | via npm |
| Hashing | `bcryptjs` | `^2.4.3` |
| Build | Nest CLI + `ts-loader` | `^10.3.0` |
| Testing | Jest + `ts-jest` + `supertest` | `^29.7.0` |
| Linting | ESLint + Prettier | configured |

### Frontend (`mymove-frontend/`)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Vue 3 (Composition API) | `^3.4.0` |
| Language | TypeScript | `^5.3.3` |
| Build Tool | Vite | `^5.0.10` |
| Router | Vue Router | `^4.2.5` |
| State Management | Pinia | `^2.1.7` |
| Styling | Tailwind CSS + PostCSS + Autoprefixer | `^3.4.0` / `^8.4.32` / `^10.4.16` |
| HTTP Client | Axios | `^1.6.5` |
| Auth Client | Supabase | `^2.39.0` |
| i18n | Vue I18n | `^9.8.0` |
| Form Validation | Vee-Validate + Zod | `^4.15.1` / `^4.4.1` |
| Toast Notifications | `vue-sonner` | `^2.0.9` |
| Icons | `lucide-vue-next` | `^1.0.0` |
| Testing | Vitest + jsdom + `@vue/test-utils` | `^4.1.5` / `^29.1.1` / `^2.4.10` |
| Linting | ESLint + Prettier | configured |

---

## Project Structure

### Backend

```
mymove-api/
├── src/
│   ├── main.ts                    # Bootstrap: helmet, CORS, versioning, validation pipe, Swagger, global exception filter
│   ├── app.module.ts              # Root module: ConfigModule, TypeOrmModule, SharedModule, 9 feature modules
│   ├── data-source.ts             # TypeORM DataSource for CLI migrations
│   ├── common/                    # Cross-cutting concerns
│   │   ├── decorators/            # @CurrentUser(), @Public(), @Roles()
│   │   ├── enums/                 # UserRole enum
│   │   ├── filters/               # HttpExceptionFilter
│   │   ├── guards/                # JwtAuthGuard, RolesGuard
│   │   └── interfaces/            # PaginationMeta
│   ├── config/                    # Environment + database configuration
│   │   ├── database.config.ts     # MySQL async factory, SSL in production, entity auto-discovery
│   │   └── env.validation.ts      # Joi schema for env vars
│   ├── migrations/                # TypeORM migrations
│   │   └── 1777653581828-InitialSchema.ts
│   ├── modules/                   # Feature modules (each has controller/service/entity/DTO folders)
│   │   ├── auth/                  # Registration, login, JWT issuance, dev login, Supabase JWT strategy
│   │   ├── companies/             # Company profiles, document uploads, approval workflow, dashboard stats
│   │   ├── health/                # Health check endpoint
│   │   ├── offers/                # Price offers from companies to move requests
│   │   ├── pricing/               # Per-company pricing config, estimate calculations
│   │   ├── requests/              # Move request lifecycle, inventory items, video upload to S3
│   │   ├── reviews/               # Customer reviews for completed moves
│   │   ├── teams/                 # Team management, availability slots, bookings
│   │   └── users/                 # User CRUD, pagination, soft-delete, admin-only endpoints
│   └── shared/                    # Global shared services
│       ├── shared.module.ts
│       └── services/
│           └── s3.service.ts      # AWS S3 presigned URL generation
├── .eslintrc.js                   # ESLint config (TypeScript + Prettier)
├── .prettierrc                    # Prettier config
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── plan.md                        # Backend-specific implementation plan
```

**Implemented entities (12 tables):**
- `users`, `companies`, `company_documents`, `move_requests`, `move_request_items`, `request_videos`, `offers`, `reviews`, `company_pricing`, `company_teams`, `team_availabilities`, `team_bookings`

### Frontend

```
mymove-frontend/
├── src/
│   ├── main.ts                    # Bootstrap: createApp → Pinia → Router → i18n
│   ├── App.vue                    # Root layout shell with conditional header
│   ├── style.css                  # Tailwind directives + @apply utility classes (.btn, .card, etc.)
│   ├── supabase.ts                # Supabase client initialization
│   ├── api/                       # Axios instance + domain API modules
│   │   ├── index.ts               # Axios config, auth interceptor, 401 handling
│   │   ├── auth.ts
│   │   ├── company.ts
│   │   ├── offers.ts
│   │   ├── requests.ts
│   │   ├── reviews.ts
│   │   └── user.ts
│   ├── components/                # Shared Vue components
│   │   ├── AppHeader.vue
│   │   ├── company/               # Company dashboard sub-components
│   │   ├── customer/              # Customer layout components
│   │   └── ui/                    # Reusable UI primitives (BaseButton, BaseInput, BaseCard, ToastProvider)
│   ├── composables/               # Vue composables
│   │   └── useToast.ts            # Toast wrapper around vue-sonner
│   ├── i18n/                      # Vue I18n setup + translation files
│   │   ├── index.ts
│   │   ├── de.json                # Default locale
│   │   └── en.json                # Fallback locale
│   ├── pages/                     # Route-level page components (lazy-loaded in router)
│   │   ├── CompanyDashboardPage.vue
│   │   ├── CreateMovePage.vue
│   │   ├── DashboardPage.vue
│   │   ├── EstimatePage.vue
│   │   ├── InventoryPage.vue
│   │   ├── LandingPage.vue
│   │   ├── LoginPage.vue
│   │   ├── OffersPage.vue
│   │   ├── ProfilePage.vue
│   │   ├── RegisterPage.vue
│   │   └── VideoUploadPage.vue
│   ├── router/
│   │   └── index.ts               # Route definitions + beforeEach auth/role guard
│   ├── stores/                    # Pinia stores (Composition API style)
│   │   ├── auth.ts                # JWT in localStorage, Supabase Google OAuth, role helpers, dev login
│   │   ├── company.ts
│   │   ├── offer.ts
│   │   └── request.ts
│   ├── types/
│   │   └── index.ts               # Centralized TypeScript domain types
│   └── validation/
│       ├── index.ts
│       └── schemas.ts             # Zod validation schemas for forms
├── .eslintrc.cjs                  # ESLint config (Vue 3 + TypeScript + Prettier)
├── .prettierrc                    # Prettier config
├── vitest.config.ts               # Vitest configuration
├── vite.config.ts
├── tailwind.config.js
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── tsconfig.node.json
```

---

## Build and Development Commands

### Backend

```bash
cd mymove-api

# Development (watch mode)
npm run start:dev

# Production build
npm run build

# Production start
npm run start:prod

# Lint (ESLint + Prettier configured)
npm run lint

# Tests (Jest)
npm run test
npm run test:watch
npm run test:cov

# TypeORM migrations
npm run typeorm -- migration:generate -d src/data-source.ts -n MigrationName
npm run migration:generate   # shorthand
npm run migration:run        # apply pending migrations
npm run migration:revert     # revert last migration

# E2E tests (references ./test/jest-e2e.json which does not exist yet)
npm run test:e2e
```

**Dev defaults:**
- API runs on `http://localhost:3000`
- Swagger docs at `http://localhost:3000/docs` (disabled in production)
- Global API prefix: `/api/v1`

### Frontend

```bash
cd mymove-frontend

# Development (Vite dev server)
npm run dev

# Production build (type-check then bundle)
npm run build

# Preview production build locally
npm run preview

# Lint (ESLint + Prettier configured)
npm run lint

# Tests (Vitest)
npx vitest
npx vitest run
```

**Dev defaults:**
- Dev server on `http://localhost:5173`
- Proxies `/api` → `http://localhost:3000`

---

## Environment Setup

Copy `.env.example` to `.env` in each project and fill in real values.

### Backend (`mymove-api/.env`)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `development` / `production` / `test` |
| `PORT` | Server port (default: 3000) |
| `API_PREFIX` | Global route prefix (default: `/api/v1`) |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | MySQL connection |
| `DB_SYNCHRONIZE` | TypeORM auto-sync (default: `false`; use migrations in production) |
| `DB_LOGGING` | TypeORM query logging |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_JWT_SECRET` | Supabase auth integration |
| `JWT_SECRET` | Local JWT signing secret (min 32 chars) |
| `JWT_EXPIRATION` | Token TTL in seconds (default: 3600) |
| `BCRYPT_ROUNDS` | Password hashing rounds (default: 12) |
| `CORS_ORIGIN` | Allowed CORS origin (default: `*`) |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME` | S3 video/document storage |

### Frontend (`mymove-frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:3000/api/v1`) |

---

## Code Style Guidelines

### Backend (NestJS)

- **Architecture:** Standard NestJS layered architecture per module:
  ```
  modules/<domain>/
  ├── <domain>.module.ts
  ├── <domain>.controller.ts
  ├── <domain>.service.ts
  ├── <domain>.repository.ts   # Custom TypeORM wrapper (most modules)
  ├── dto/
  │   ├── create-<x>.dto.ts
  │   ├── update-<x>.dto.ts
  │   └── ...
  └── entities/
      └── <x>.entity.ts
  ```
- **Path aliases (tsconfig.json):**
  - `@/*` → `src/*`
  - `@config/*` → `src/config/*`
  - `@common/*` → `src/common/*`
  - `@modules/*` → `src/modules/*`
  - `@shared/*` → `src/shared/*`
- **Naming:**
  - Modules: `PascalCase` plural + `Module` (e.g., `AuthModule`)
  - Services: `PascalCase` + `Service` (e.g., `AuthService`)
  - DTOs: `PascalCase` + `Dto` (e.g., `CreateUserDto`)
  - Entities: `PascalCase` singular (e.g., `User`)
  - DB columns: `snake_case` (always explicit via `name: 'snake_case'` in `@Column()`)
- **Validation:** DTOs must use `class-validator` decorators. The global `ValidationPipe` has `whitelist: true` and `forbidNonWhitelisted: true` — unknown fields are stripped and rejected.
- **Soft deletes:** Use `@DeleteDateColumn` + `softDelete()` for `User`, `Company`, and related entities.
- **Auth patterns:**
  - `@Public()` bypasses JWT guard.
  - `@Roles(UserRole.ADMIN)` + `RolesGuard` enforce RBAC.
  - `@CurrentUser()` extracts the authenticated user; `@CurrentUser('userId')` extracts a specific field.
- **Data access:** Services depend on custom repositories (not directly on TypeORM `Repository`). Complex queries use `createQueryBuilder` with explicit column whitelisting. Never return `passwordHash` in normal list/get queries.
- **ESLint/Prettier:** Configured. Prettier uses `singleQuote: true`, `trailingComma: "all"`, `printWidth: 100`, `tabWidth: 2`, `semi: true`.

### Frontend (Vue 3)

- **Syntax:** Use `<script setup lang="ts">` (Composition API) for all components.
- **Path alias:** `@/` maps to `src/`.
- **Naming:**
  - Vue components: `PascalCase` + `.vue` (e.g., `AppHeader.vue`, `LoginPage.vue`)
  - TS modules: `camelCase` (e.g., `auth.ts`, `requests.ts`)
  - Pinia stores: `use` prefix + `Store` suffix (e.g., `useAuthStore`)
  - API module imports: suffixed with `Api` in consumer code (convention, not enforced)
- **Styling:** Tailwind utility classes. Reusable component classes are defined in `style.css` using `@apply` (`.btn`, `.btn-primary`, `.card`, etc.).
- **State management:** Pinia with Composition API (`defineStore` + `ref`/`computed`). Expose `isLoading` and `error` refs for async operations.
- **Error handling:** Repeated pattern across stores/pages:
  ```ts
  const e = err as { response?: { data?: { message?: string } } }
  error.value = e.response?.data?.message || 'Fallback message'
  ```
- **i18n:** Default locale is `de` (German), fallback is `en`. No hardcoded UI strings in logic or templates — always use `$t('key')` or `t('key')`.
- **Form validation:** Zod schemas in `src/validation/schemas.ts` define form shapes. Vee-Validate integrates Zod for reactive form validation.
- **ESLint/Prettier:** Configured. Prettier uses `singleQuote: true`, `trailingComma: "all"`, `printWidth: 100`, `tabWidth: 2`, `semi: false`.

---

## Testing Instructions

### Backend
- Jest is configured inline in `package.json`:
  - `rootDir: "src"`
  - `testRegex: ".*\\.spec\\.ts$"`
  - `transform: ts-jest`
  - `coverageDirectory: "../coverage"`
  - `testEnvironment: "node"`
- One spec file exists: `src/modules/auth/auth.service.spec.ts`
- To add tests, create `*.spec.ts` files alongside source files in `src/`. Follow NestJS testing patterns (`Test.createTestingModule`, mocked repositories, `supertest` for E2E).

### Frontend
- Vitest is configured in `vitest.config.ts`:
  - Environment: `jsdom`
  - `globals: true`
  - Vue plugin enabled for SFC support
- One spec file exists: `src/components/__tests__/BaseButton.spec.ts`
- To add tests, create `*.spec.ts` files. Use `@vue/test-utils` for component tests and standard Vitest patterns for composables/stores.

---

## Security Considerations

- **Authentication:** Dual JWT support.
  - Supabase JWT is validated via `JwtAuthGuard` (tries local secret first, then `SUPABASE_JWT_SECRET`).
  - Local JWT is issued on login/registration.
  - Token extracted from `Authorization: Bearer <token>` header.
  - Dev login endpoint (`POST /auth/dev-login`) auto-creates test accounts for local development.
- **Authorization:** 3 roles — `END_CUSTOMER`, `COMPANY`, `ADMIN`.
  - `JwtAuthGuard` validates token + enriches payload with local `role` and `companyId`.
  - `RolesGuard` checks `@Roles()` metadata.
- **Input sanitization:** `class-validator` DTOs + `whitelist: true` on global `ValidationPipe`.
- **SQL injection:** Mitigated by TypeORM parameterized queries. No raw SQL in the current codebase.
- **File uploads:** Direct-to-S3 via presigned PUT URLs (15-minute expiry). Backend only generates URLs and tracks metadata (`RequestVideo` entity). Max file size should be enforced at S3 bucket policy level.
- **CORS:** Configured via `CORS_ORIGIN` env var.
- **Headers:** `helmet()` applied globally.
- **Sensitive data:**
  - `passwordHash` is excluded from normal queries.
  - Soft deletes are used for user/company data.
  - No `.env` files are committed (only `.env.example`).
- **Swagger:** Disabled in production (`NODE_ENV === 'production'`).

---

## Known Gaps and Important Notes

1. **E2E test config missing:** `test:e2e` script references `./test/jest-e2e.json` which does not exist yet.
2. **No CI/CD:** No `.github/workflows/`, `Dockerfile`, or deployment manifests exist.
3. **No structured logging:** Only `console.log` is used in `main.ts`. No Winston/Pino integration.
4. **SaaS / multi-tenancy:** The foundation docs describe a SaaS white-label mode and company-invite flow. These are **not yet implemented** in the actual code.
5. **AI analysis:** The video upload flow creates `RequestVideo` records and presigned S3 URLs. The "AI processing" step is mocked/planned but not yet wired to an actual service.
6. **Company sidebar navigation:** Links in `CompanySidebar.vue` exist but several routes (orders, calendar, team, vehicles, pricing, reviews pages) are not yet implemented.
7. **Customer sidebar navigation:** Similar gap — links exist but not all routes are wired.

---

## How to Extend

### Adding a backend module

1. Create a new folder under `mymove-api/src/modules/<name>/`.
2. Add `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, and `dto/` + `entities/` subfolders.
3. Export the module from `app.module.ts`.
4. Follow the existing custom repository pattern if the module needs database access (see `users`, `companies`, or `requests` for examples).
5. Add Swagger decorators (`@ApiTags`, `@ApiBearerAuth`, `@ApiResponse`) to controller methods.
6. Use `@Roles()` + `@UseGuards(JwtAuthGuard, RolesGuard)` to protect admin or role-specific routes.

### Adding a frontend page

1. Create a new `.vue` file under `mymove-frontend/src/pages/` using `<script setup lang="ts">`.
2. Add a lazy-loaded route in `mymove-frontend/src/router/index.ts`.
3. Set `meta: { requiresAuth: true, role: 'END_CUSTOMER' }` (or appropriate role) for protected routes.
4. Use `public: true` for unauthenticated pages (login/register).
5. If the page needs backend data, add API functions to the appropriate file in `src/api/` and call them from a Pinia store or directly in the page.
6. Wrap all user-visible strings with `$t('key')` and add keys to `src/i18n/de.json` and `src/i18n/en.json`.

### Adding an API client method

1. Add the typed function to the relevant domain file in `mymove-frontend/src/api/` (e.g., `requests.ts`).
2. Import the shared Axios instance from `src/api/index.ts`.
3. Add any new TypeScript interfaces to `src/types/index.ts`.

### Adding a database migration

1. Ensure `src/data-source.ts` is up to date with entities.
2. Run `npm run migration:generate` in `mymove-api/` to auto-generate a migration.
3. Review the generated migration before applying.
4. Run `npm run migration:run` to apply.

---

## Useful References

- `mymove-foundation/` contains detailed specification documents:
  - `01-system-architecture.md` — High-level architecture, guard hierarchy, multi-tenancy model
  - `02-backend-structure.md` — Full target backend module design
  - `03-database-schema.md` — Target MySQL schema (21 tables)
  - `04-api-endpoints.md` — Target REST API design (60+ endpoints)
  - `05-frontend-structure.md` — Target frontend architecture
  - `06-key-components.md` — Cross-functional component specs
- `mymove-api/plan.md` — Backend implementation plan (Phase 1)
- `plan.md` (root) — Original execution plan for generating the foundation

---

*Last updated: 2026-05-08*

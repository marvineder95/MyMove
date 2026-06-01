# MyMove — Complete Technical Foundation

> **Project:** MyMove — Hybrid B2C + B2B SaaS + Marketplace for Moving Services  
> **Classification:** Production-Ready Architecture Foundation  
> **Version:** 1.0.0  
> **Date:** 2026-05-01  
> **Stack:** Vue 3 + NestJS + MySQL + Supabase Auth + AWS S3  

---

## Document Structure

This foundation consists of **7 sections** covering the complete technical architecture:

| # | Section | Document | Size | Contents |
|---|---------|----------|------|----------|
| 1 | **System Architecture Overview** | `01-system-architecture.md` | 2,818 lines | High-level component diagram, multi-tenancy model, RBAC matrix, NestJS guards, data flow diagrams, GDPR compliance, audit & monitoring, infrastructure security |
| 2 | **Backend Structure (NestJS)** | `02-backend-structure.md` | 3,139 lines | Complete folder tree, 13 module breakdowns, shared infrastructure (guards, decorators, interceptors), clean architecture layers, 5 key business logic services, env config, module dependency graph |
| 3 | **Database Schema (MySQL)** | `03-database-schema.md` | 1,651 lines | ASCII ER diagram, 21 tables with full SQL DDL, CHECK constraints, indexes, enum definitions, GDPR & retention policies, 6 production-ready example queries |
| 4 | **API Endpoints** | `04-api-endpoints.md` | 3,648 lines | 60+ REST endpoints across 11 modules, request/response DTOs with class-validator decorators, error codes, auth & authorization matrix, rate limiting, pagination standards |
| 5 | **Frontend Structure (Vue)** | `05-frontend-structure.md` | 3,442 lines | Complete folder tree, 35+ routes with role guards, component hierarchy, 10 Pinia stores, i18n architecture (DE+EN), API integration layer, 8 key composables, TypeScript interfaces |
| 6 | **Key Components** | `06-key-components.md` | This file | Cross-functional domain components bridging frontend, backend, and database |
| 7 | **Data Flow Explanation** | `01-system-architecture.md` Section 3 | Embedded | Video lifecycle, move request flow, SaaS vs Marketplace isolation |

---

## Quick Stats

- **Total specification lines:** 14,698
- **Backend modules:** 13
- **Database tables:** 21
- **API endpoints:** 60+
- **Frontend routes:** 35+
- **User roles:** 3 (END_CUSTOMER, COMPANY, ADMIN)
- **Languages supported:** 2 (DE, EN) — extensible

---

## Core Principles (Enforced Throughout)

1. **AI supports decisions, not replaces them** — All AI results are editable by users
2. **Full transparency** — Customers see exactly how prices are calculated
3. **GDPR-compliant** — Videos are temporary (auto-deleted after offer or 30 days max)
4. **Production-grade from day one** — JWT auth, role guards, audit logging, encryption
5. **Scalable multi-tenant hybrid** — Marketplace + SaaS mode supported natively

---

## Naming Convention Cross-Reference

| Layer | Convention | Example |
|-------|-----------|---------|
| Database tables | `snake_case` plural | `move_requests`, `inventory_items` |
| Database columns | `snake_case` | `price_per_hour`, `confidence_score` |
| NestJS entities | PascalCase singular | `MoveRequest`, `InventoryItem` |
| NestJS modules | PascalCase plural | `MoveRequestsModule` |
| NestJS services | PascalCase + `Service` | `PricingEngineService` |
| NestJS DTOs | PascalCase + `Dto` | `CreateMoveRequestDto` |
| API paths | kebab-case plural | `/api/v1/move-requests` |
| Vue components | PascalCase | `InventoryEditor.vue` |
| Vue composables | camelCase `useXxx` | `useMoveRequest.ts` |
| Pinia stores | camelCase | `useMoveRequestStore` |
| i18n keys | dot-notation | `moveRequest.title` |

---

## Repository Bootstrap Commands

```bash
# Backend
git clone <repo> mymove-api
cd mymove-api
npm install @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/typeorm typeorm mysql2 class-validator class-transformer @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @supabase/supabase-js

# Frontend
git clone <repo> mymove-frontend
cd mymove-frontend
npm create vue@latest . -- --typescript --router --pinia
npm install -D tailwindcss postcss autoprefixer
npm install vue-i18n@9 axios
npx tailwindcss init -p
```

---

## Next Steps (Development Roadmap)

| Phase | Focus | Duration |
|-------|-------|----------|
| **Phase 0** | Bootstrap repos, set up CI/CD, configure Supabase + AWS S3 + MySQL | 1 week |
| **Phase 1** | Auth module, user registration/login, role-based routing | 1 week |
| **Phase 2** | Company registration, admin approval flow, document upload | 1 week |
| **Phase 3** | Video upload (S3 presigned), mock AI service, inventory editor | 1.5 weeks |
| **Phase 4** | Move request wizard, pricing engine, company availability | 1.5 weeks |
| **Phase 5** | Offer creation/editing, customer acceptance, video auto-deletion | 1 week |
| **Phase 6** | Reviews, commission tracking, admin dashboard | 1 week |
| **Phase 7** | SaaS mode (company invites), white-label basics | 1 week |
| **Phase 8** | Polish, i18n completion, E2E testing, security audit | 1 week |

**Estimated MVP timeline:** 8–10 weeks with a team of 3–4 engineers.

---

## Security Checklist (Pre-Launch)

- [ ] JWT secret rotation policy configured
- [ ] S3 buckets are private, presigned URLs time-limited
- [ ] MySQL connections use SSL/TLS
- [ ] Rate limiting active on all public endpoints
- [ ] Input validation (`whitelist: true`) on all DTOs
- [ ] SQL injection tests pass (parameterized queries only)
- [ ] GDPR consent flow implemented with version tracking
- [ ] Video auto-deletion cron job tested
- [ ] Admin audit logs writing to immutable table
- [ ] Dependency vulnerability scan (npm audit) clean
- [ ] Penetration testing scoped (OWASP Top 10)

---

## Support & Extension Points

| Extension | How |
|-----------|-----|
| **New language** | Add locale file to `src/i18n/locales/`, register in `src/i18n/index.ts` |
| **New user role** | Add to `UserRole` enum, update RBAC matrix, add `RolesGuard` to relevant controllers |
| **New pricing factor** | Add column to `pricing_rules`, update `PricingEngineService`, add UI field to `PricingParameterEditor.vue` |
| **New service addon** | Add to `service_addons` table, update `ServiceAddon` entity, add to offer editor |
| **Real AI integration** | Replace mock `AiAnalysisService` with HTTP client to external AI provider; no schema changes needed |
| **Payment integration** | Add `payments` module; Stripe/Adyen webhook handlers |
| **Push notifications** | Implement `PushNotificationDriver` in `notification-drivers/` |

---

*End of Master Document. See linked section files for complete technical specifications.*

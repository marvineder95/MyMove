# MyMove Platform — Execution Plan

## Objective
Generate a production-ready foundation for MyMove, a hybrid B2C+B2B SaaS + marketplace platform for moving services. The deliverable is a comprehensive technical specification with complete folder structures, module definitions, database schemas, API endpoints, and frontend architecture.

## Stages

### Stage 1 — Parallel Foundation Generation (5 agents in parallel)
All agents receive the full project brief. Each focuses on one architectural pillar.

| Agent | Skill | Output |
|-------|-------|--------|
| Backend_Architect | NestJS module design, clean architecture | Complete backend folder structure, module definitions, service interfaces, entity outlines, auth guards |
| Database_Architect | MySQL relational schema design | Full database schema: CREATE TABLE statements, relations, indexes, enums |
| Frontend_Architect | Vue 3 + Composition API + Tailwind | Complete frontend folder structure, page routing per role, component hierarchy, i18n setup, state management plan |
| API_Designer | REST API design, DTOs, OpenAPI-style specs | All endpoint definitions per module, request/response DTOs, auth requirements, status codes |
| Security_Flow_Architect | RBAC, JWT, GDPR, data flows | RBAC matrix, JWT strategy outline, video lifecycle (GDPR), data flow diagrams, security middleware plan |

### Stage 2 — Integration & Quality Assurance
- Read all Stage 1 outputs
- Cross-check consistency (DB tables ↔ API DTOs ↔ Backend modules ↔ Frontend pages)
- Resolve naming mismatches, missing relations, or security gaps
- Produce the final unified deliverable:
  1. System architecture overview
  2. Backend structure (NestJS)
  3. Database schema (MySQL)
  4. API endpoints
  5. Frontend structure (Vue)
  6. Key components
  7. Data flow explanation

## File Delivery
Write all outputs under `/mnt/agents/output/mymove-foundation/`.

## Constraints
- All text i18n-ready (no hardcoded UI strings in logic)
- MVP scope: AI mocked, offer editing enabled, simplified calendar with multi-team support
- Production-grade from day one: assume future multi-tenancy and SaaS white-label

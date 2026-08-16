# All In One — QA Test Plan (Sprint 21)

## Purpose

Prove Sprints 01–20 work together as one coherent product with evidence — not optimism. This plan covers functional correctness, security, accessibility, performance, cross-device behavior, and Frontal Slayer isolation.

---

## Status model

| Status | Meaning |
|--------|---------|
| NOT_TESTED | No execution evidence |
| PASS | Automated or documented manual pass |
| FAIL | Reproducible failure |
| PARTIAL | Some coverage; gaps documented |
| BLOCKED | Cannot run (environment) |
| NOT_APPLICABLE | Out of scope |
| REQUIRES_PROVIDER | Needs live external provider |
| REQUIRES_PRODUCTION_ENVIRONMENT | Needs dedicated AIO Supabase / prod config |

**Rule:** Visual inspection alone is never PASS.

---

## Test pyramid

| Layer | Location | Scope |
|-------|----------|-------|
| Unit | `src/all-in-one/**/*.test.ts` | Pure logic: billing, dispatch, brokerage, factoring, insurance |
| Domain | workflow, crm, communications, management | Service orchestration, conversion, metrics |
| Repository | `data/data.test.ts` | Demo store, FS isolation, env contract |
| Security | `security/security.test.ts` | IDOR, permissions, audit, production gate |
| Integration | `integrations/integrations.test.ts` | Provider contract simulation |
| RLS | Planned against dedicated Supabase | Customer A ≠ Customer B at DB layer |
| E2E | `e2e/all-in-one/` | Playwright smoke + critical paths |
| Manual | QA Command Center matrices | Keyboard, SR, Safari, device classes |

---

## Commands

```bash
# All In One vitest (188 tests)
npm run test:aio

# Playwright smoke (requires dev server on :3001)
E2E_BASE_URL=http://localhost:3001 npm run test:aio:e2e

# Full regression script (build + vitest + FS guard)
./scripts/aio-qa-check.sh
```

---

## Personas (minimum)

Anonymous Visitor, Customer A/B, Multi-org Customer, Customer Support, CRM, Permitting, Dispatcher, Brokerage, Factoring, Insurance, Finance, Operations, Manager, Admin, Owner, Security Admin.

Demo persona switching: Office staff selector + demo store.

---

## Frontal Slayer regression (mandatory)

After any AIO change:

1. `npm run build` — full monorepo build
2. FS import guard — no `@/lib/supabase` or `@/utils/adminAuth` in `src/all-in-one/`
3. AIO demo reset must not mutate FS data
4. AIO migrations must target AIO project only (`verify-migration-environment.sh`)

---

## Flaky test policy

- Do not retry until green without fixing root cause
- Track flaky tests as defects with `related_test` field
- Isolate test data per test case

---

## E2E selector strategy

Prefer: accessible roles, labels, semantic HTML.  
Use `data-testid` only where necessary.  
Avoid: nth-child, random CSS classes, coordinates.

---

## CI foundation

- `scripts/aio-qa-check.sh` — build + vitest + FS guard
- Playwright project `aio-demo` in `playwright.config.ts`
- Optional E2E in CI when `E2E_LOCAL_SERVER=1`

---

## Pre-extraction gate

`canExtractAllInOne()` in `src/all-in-one/qa/extractionGate.ts`:

- Returns **READY** only when blockers empty and no open P0 extraction defects
- Current result: **BLOCKED** (see EXTRACTION_READINESS_REPORT.md)

---

## Deliverables (Sprint 21)

- QA Command Center UI at `/all-in-one/office/system/qa`
- This plan + journey matrix + audit reports
- Expanded vitest + Playwright smoke
- Known issues registry

**Sprint 22** uses route/env/database inventories for physical extraction.

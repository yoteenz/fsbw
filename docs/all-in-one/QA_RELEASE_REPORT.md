# All In One — QA Release Report (Sprint 21)

**Date:** 2026-08-16  
**Environment:** Debug host `/all-in-one` inside Frontal Slayer repository  
**Data mode:** Demo (default)  
**Report type:** Release-quality hardening — evidence-based, not certification

---

## Executive summary

Sprint 21 established an evidence-based QA harness, expanded automated tests, and documented extraction readiness. **The platform is not ready for standalone extraction** (`canExtractAllInOne()` → **BLOCKED**). **No open P0 defects.** Core demo workflows pass automated domain and security tests; live Supabase RLS, full browser matrix, and manual accessibility sign-off remain incomplete.

---

## Automated test summary

| Layer | Command | Result | Count |
|-------|---------|--------|-------|
| Unit / domain / security | `npm run test:aio` | **PASS** | 188 tests / 18 files |
| E2E smoke (Chromium) | `npm run test:aio:e2e` | **PASS** | 15 tests |
| Production build | `npm run build` | **PASS** (via `scripts/aio-qa-check.sh`) | — |
| FS import guard | `scripts/aio-qa-check.sh` | **PASS** | No forbidden FS imports in `src/all-in-one/` |

---

## QA status model (tracked suites + journeys)

| Status | Suites | Journeys | Notes |
|--------|--------|----------|-------|
| PASS | 17 | 10 | Vitest + Playwright smoke |
| PARTIAL | 1 | 4 | A11y automation; prospect/permitting/extraction journeys |
| BLOCKED / REQUIRES_ENV | 1 | 0 | Live Supabase RLS matrix |
| NOT_TESTED | 1 | 0 | Lighthouse — not fabricated |
| FAIL | 0 | 0 | — |

**Total tracked:** 34 (20 suites + 14 journeys)

---

## Defect summary

| Severity | Open | Verified / closed |
|----------|------|-------------------|
| P0 | 0 | — |
| P1 | 0 | — |
| P2 | 2 | QA-001 (extraction), QA-002 (RLS live) |
| P3 | 0 | QA-005 verified |
| P4 | 2 | QA-003, QA-004 placeholders |

See `KNOWN_ISSUES.md` for full registry.

---

## Critical path answers (evidence-based)

| Question | Answer | Evidence |
|----------|--------|----------|
| Can demo customer complete Road Ready? | **PARTIAL** | Domain tests PASS; full keyboard/mobile E2E PARTIAL |
| Can they request a service & pay invoice (demo)? | **YES (demo)** | Billing calculator + cross-domain tests; CRM/workflow tests |
| Cross-customer data exposure? | **DENIED in demo** | `security.test.ts`, journey j12 |
| Staff permission escalation? | **DENIED in demo** | Authorization guard tests |
| Financial calculations exact? | **YES (unit)** | `billingCalculator.test.ts`, management allocation tests |
| Management numbers trustworthy? | **YES (fixture)** | `management.test.ts` metric registry |
| Frontal Slayer unaffected? | **YES (guard)** | FS isolation self-check + import guard |
| Ready for extraction? | **NO** | `canExtractAllInOne()` BLOCKED — see EXTRACTION_READINESS_REPORT.md |

---

## Accessibility status

- **Benchmark:** WCAG 2.2 AA engineering target (not formal certification)
- **Automated:** PARTIAL — skip links added; full axe/keyboard matrix pending
- **Manual keyboard / SR:** NOT_TESTED at sign-off level

See `ACCESSIBILITY_AUDIT.md`.

---

## Performance status

- **Lighthouse:** NOT_TESTED (no fabricated scores)
- **Bundle audit:** Documented in `PERFORMANCE_AUDIT.md`
- **Regressions tracked:** 0 known

---

## Browser / device coverage

- **Chromium (Playwright):** 15 smoke routes tested — PASS
- **Firefox, Safari, Edge:** NOT_TESTED in this sprint
- **Device matrix:** PARTIAL — see `CROSS_DEVICE_MATRIX.md`

---

## Security status

- Sprint 19 security suite re-run: **PASS** (16 tests)
- IDOR / authorization guard: **PASS** (demo layer)
- Live RLS: **REQUIRES_PRODUCTION_ENVIRONMENT**

---

## Extraction readiness

**Status: BLOCKED**

Static blockers:

1. Application mounted via FS `App.tsx` lazy host
2. Shared Vite build — no standalone `package.json`
3. Debug route `/all-in-one` not standalone domain
4. Dedicated AIO Supabase not provisioned for live RLS

See `EXTRACTION_READINESS_REPORT.md`.

---

## Provider-dependent / production-only

| Area | Status |
|------|--------|
| Live Supabase RLS | REQUIRES_PRODUCTION_ENVIRONMENT |
| Real payments | REQUIRES_PROVIDER |
| Government filing | REQUIRES_PROVIDER |
| Factoring / insurance submission | Demo simulation only |
| SMS / email (production) | REQUIRES_PROVIDER |

---

## Commands

```bash
npm run test:aio
E2E_BASE_URL=http://localhost:3001 npm run test:aio:e2e
./scripts/aio-qa-check.sh
```

---

## QA Command Center

Staff route (demo): `/all-in-one/office/system/qa`

Sub-routes: accessibility, performance, devices, browsers.

---

**Next sprint:** Sprint 22 — Standalone extraction + repository separation (uses inventories and blockers from this sprint).

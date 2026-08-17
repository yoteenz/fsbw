# Business Name Check — Implementation Report

**Sprint:** AIO Smart Intake state-aware business name availability check  
**Date:** 2026-08-17

## Summary

Step 3 of Smart Intake now collects **formation state before business name**, exposes an explicit **Check Availability** action with honest registry-backed statuses, persists structured check metadata on intake answers, shows results on the service request review screen, rechecks before submit when stale, and queues manual reviews in AIO Office.

## Files changed

### Domain / registry

| File | Purpose |
|------|---------|
| `src/business-formation/businessNameRegistry/types.ts` | Statuses, request/response/result types |
| `src/business-formation/businessNameRegistry/normalize.ts` | Lookup normalization + fingerprint |
| `src/business-formation/businessNameRegistry/stateCapabilities.ts` | Per-state capability config |
| `src/business-formation/businessNameRegistry/staleLogic.ts` | Stale invalidation + recheck rules |
| `src/business-formation/businessNameRegistry/registryService.ts` | Orchestrator + cache |
| `src/business-formation/businessNameRegistry/nameCheckClient.ts` | Browser client (demo local / prod API) |
| `src/business-formation/businessNameRegistry/adapters/demoAdapter.ts` | Deterministic demo responses |
| `src/business-formation/businessNameRegistry/adapters/topographAdapter.ts` | Optional live provider (TN/GA/IL) |
| `src/business-formation/businessNameRegistry/adapters/unsupportedAdapter.ts` | Manual verification fallback |
| `src/business-formation/businessNameRegistry/server/handler.ts` | Shared HTTP handler |
| `src/business-formation/businessNameRegistry/server/rateLimit.ts` | Validation + IP rate limit |
| `src/business-formation/businessNameRegistry/businessNameCheck.test.ts` | Unit tests (19 cases) |

### API

| File | Purpose |
|------|---------|
| `api/aio/business-name-check.ts` | Vercel serverless endpoint |
| `vercel.json` | API rewrite before SPA fallback |

### Smart Intake UI

| File | Purpose |
|------|---------|
| `src/intake/intakeTypes.ts` | `business_name_check` type + `business.nameCheck` |
| `src/intake/intakeConfig.ts` | Reordered Step 3 fields; formation state first |
| `src/components/intake/BusinessNameCheckField.tsx` | Step 3 name check UI |
| `src/components/IntakeQuestionField.tsx` | Renders new question type |
| `src/pages/GetStartedPage.tsx` | Stale invalidation on answer changes |
| `src/pages/RequestSubmitPage.tsx` | Review panel + final recheck |
| `src/styles/aio-name-check.css` | Mobile/desktop status styling |

### Office / demo

| File | Purpose |
|------|---------|
| `src/demo/businessNameCheckActions.ts` | Manual review queue tasks |
| `src/pages/office/BusinessNameReviewOfficePage.tsx` | Office queue page |
| `src/office-core/officeWorkTypes.ts` | `business_name_review` queue id |
| `src/office-core/officeCommandCenterService.ts` | Queue summary |
| `src/office/routes/OfficeRoutes.tsx` | Route |
| `src/utils/paths.ts` | `officeBusinessNameReview` |

### i18n

| File | Purpose |
|------|---------|
| `src/locales/en/intake.json` | English strings |
| `src/locales/es/intake.json` | Spanish strings |
| `src/i18n/index.ts` | Namespace registration |
| `src/i18n/format.ts` | `formatAppDate` helper |

### Security / docs

| File | Purpose |
|------|---------|
| `src/security/rateLimitPolicy.ts` | Policy entry for endpoint |
| `docs/business-formation/BUSINESS_NAME_CHECK_ARCHITECTURE.md` | Architecture |
| `docs/business-formation/BUSINESS_NAME_REGISTRY_SUPPORT.md` | State matrix |

## Tables / migrations

No Supabase schema changes in this sprint. Name check results persist in demo intake answers (`intake.business.nameCheck` JSON).

## Supported states (automated)

| State | Condition |
|-------|-----------|
| TN, GA, IL | When `AIO_TOPOGRAPH_API_KEY` configured |
| All states | Demo mode deterministic adapter |

## Unsupported states

All other states → `lookup_unavailable` + Office manual review queue in production path.

## Known gaps

- Production live lookup requires commercial provider API key (no official SOS REST APIs).
- Office staff outcome recording (Likely Available / Conflict / Needs Revision) is queue-only — no persisted review outcome table yet.
- Intake section titles not fully i18n-wired (name check strings are).

## Tests

`npm run test -- src/business-formation/businessNameRegistry/businessNameCheck.test.ts` — 19 passing.

## Build

`npm run build` — passing.

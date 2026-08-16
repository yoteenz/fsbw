# All In One — Known Issues (Sprint 21)

Canonical defect registry. Statuses follow QA defect lifecycle: OPEN, TRIAGED, IN_PROGRESS, FIXED, READY_FOR_RETEST, VERIFIED, WONT_FIX, DUPLICATE, BLOCKED.

---

## QA-001 — Shared Vite host (not standalone shell)

| Field | Value |
|-------|-------|
| **Severity** | P2 |
| **Domain** | EXTRACTION |
| **Status** | OPEN |
| **Extraction blocker?** | Yes |
| **Production blocker?** | No |
| **Description** | All In One is code-split inside the Frontal Slayer Vite bundle via lazy route host — no independent application entry yet. |
| **Workaround** | Continue review at `/all-in-one` until Sprint 22 extraction. |
| **Introduced** | Sprint 01 |

---

## QA-002 — Live Supabase RLS matrix not executed

| Field | Value |
|-------|-------|
| **Severity** | P2 |
| **Domain** | DATA |
| **Status** | OPEN |
| **Extraction blocker?** | No |
| **Production blocker?** | Yes |
| **Description** | Automated RLS tests require dedicated AIO Supabase project. Demo mode uses `authorizationGuard` only. |
| **Workaround** | Use demo mode for functional QA; provision AIO Supabase before production launch. |
| **Introduced** | Sprint 20 |

---

## QA-003 — Portal notification settings placeholder

| Field | Value |
|-------|-------|
| **Severity** | P4 |
| **Domain** | PORTAL |
| **Route** | `/all-in-one/portal/settings` |
| **Status** | OPEN |
| **Extraction blocker?** | No |
| **Production blocker?** | No |
| **Description** | Notification controls show intentional "Coming soon" note. |
| **Workaround** | None required for demo review. |

---

## QA-004 — Road Ready Download Summary disabled

| Field | Value |
|-------|-------|
| **Severity** | P4 |
| **Domain** | ROAD_READY |
| **Route** | `/all-in-one/portal/road-ready` |
| **Status** | OPEN |
| **Extraction blocker?** | No |
| **Production blocker?** | No |
| **Description** | Export button disabled with "Coming Soon" title. |
| **Workaround** | Use on-screen readiness review. |

---

## QA-005 — Playwright E2E local server (RESOLVED)

| Field | Value |
|-------|-------|
| **Severity** | P3 |
| **Domain** | SYSTEM |
| **Status** | VERIFIED |
| **Description** | 15/15 smoke tests pass with `E2E_BASE_URL=http://localhost:3001` and `aio-demo` Playwright project. |
| **Verified** | 2026-08-16 |

---

## Severity definitions (reference)

- **P0** — Release blocker (cross-customer exposure, auth bypass, FS corruption, etc.)
- **P1** — Critical (major flow unusable, wrong invoice totals, permission escalation)
- **P2** — Major
- **P3** — Moderate
- **P4** — Minor

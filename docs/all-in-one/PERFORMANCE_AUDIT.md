# All In One — Performance Audit (Sprint 21)

**Principle:** Measure what exists; do not fabricate Lighthouse scores.

---

## What was measured

| Area | Method | Result |
|------|--------|--------|
| Production build | `npm run build` | PASS — AIO compiles inside shared Vite host |
| Vitest duration | `npm run test:aio` | ~2s for 188 tests |
| Playwright smoke | 15 routes Chromium | ~17s total |
| Known perf regressions | QA overview | 0 tracked |

---

## Route code splitting

All In One is lazy-loaded from Frontal Slayer `App.tsx` — public FS routes do not load AIO chunks until `/all-in-one` navigation.

Heavy domains (Management, Dispatch, Reports, Security, Integrations) are nested lazy routes within AIO office shell.

---

## Bundle audit (qualitative)

Shared root `package.json` — AIO does not have isolated bundle analysis yet.

**Observations (Sprint 21):**

- Chart/management modules load only on management routes (lazy)
- No duplicate React copies introduced by Sprint 21
- Full standalone bundle audit deferred to Sprint 22 extraction

---

## Network / runtime (not fully instrumented)

| Concern | Status |
|---------|--------|
| Client 360 N+1 queries | NOT_TESTED with profiler |
| Management dashboard duplicate fetches | NOT_TESTED |
| Large list pagination (500+ rows) | NOT_TESTED at scale |
| Memory leaks on route churn | NOT_TESTED |

Demo store is in-memory/localStorage — performance characteristics differ from Supabase mode.

---

## Performance budgets (proposed, not enforced)

| Metric | Target (debug) | Measured |
|--------|----------------|----------|
| Initial AIO chunk (lazy) | TBD Sprint 22 | NOT_TESTED |
| Route transition (demo) | < 500ms perceived | NOT_TESTED |
| API p95 (supabase mode) | TBD when connected | N/A |

---

## QA Command Center

Route: `/all-in-one/office/system/qa/performance`

---

## Recommendations

1. Add bundle analyzer to standalone AIO app (Sprint 22)
2. Instrument Client 360 fetch count when Supabase repositories active
3. Optional Lighthouse CI on `/all-in-one` and `/all-in-one/portal` after extraction

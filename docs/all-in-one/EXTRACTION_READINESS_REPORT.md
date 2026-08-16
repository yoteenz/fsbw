# All In One — Extraction Readiness Report (Sprint 21)

**Gate function:** `canExtractAllInOne()` in `src/all-in-one/qa/extractionGate.ts`  
**Current status:** **BLOCKED**  
**Recommendation:** Proceed to Sprint 22 physical separation; do not extract until blockers resolved.

---

## Requirements checklist

| ID | Requirement | Met | Notes |
|----|-------------|-----|-------|
| routes | All AIO routes identified | ✓ | 35 routes in `routeManifest.ts` |
| components | Under `src/all-in-one/` | ✓ | — |
| styles | Isolated `.aio-app` | ✓ | — |
| migrations | `all-in-one/supabase/migrations/` | ✓ | 8 baseline files |
| auth-isolated | AIO auth adapter | ✓ | Demo + supabase modes |
| no-fs-db | No FS DB for business data | ✓ | Demo store + AIO schema |
| no-fs-imports | No FS-specific imports | ✓ | Guard in `aio-qa-check.sh` |
| build | Passes in shared host | ✓ | `npm run build` |
| core-qa | Automated QA passes | ✓ | 188 vitest + 15 E2E |
| standalone-build | Build without FS host | ✗ | Sprint 22 |
| standalone-repo | Separate repository | ✗ | Sprint 22 |
| no-p0 | No open P0 defects | ✓ | 0 open P0 |

---

## Static blockers

1. Application still mounted via Frontal Slayer `App.tsx` lazy route host
2. Shared Vite build bundles AIO with FS — no standalone `package.json`
3. Debug route `/all-in-one` not yet standalone domain
4. Dedicated AIO Supabase project not provisioned for live RLS tests

---

## Open extraction-related defects

| ID | Title | Severity |
|----|-------|----------|
| QA-001 | Shared Vite host — not standalone shell | P2 |

---

## Dependency graph (summary)

| Class | Examples |
|-------|----------|
| AIO_SPECIFIC | `src/all-in-one/`, `docs/all-in-one/`, `all-in-one/supabase/` |
| SHARED_GENERIC | Vite host shell (replace in Sprint 22) |
| FS_SPECIFIC | `src/lib/supabase`, `src/utils/adminAuth` — **must not import** |
| EXTERNAL | react, react-router-dom, vitest, playwright |

Full graph: `src/all-in-one/qa/dependencyGraph.ts`

---

## Inventories

| Inventory | Count / note |
|-----------|--------------|
| Routes | 35 (manifest) |
| Env vars | See `inventories.ts` — `VITE_AIO_*` contract |
| Migrations | 8 SQL files |
| Storage buckets | Documented in `AIO_STORAGE_BUCKETS` |
| Packages | Shared root `package.json` — Sprint 22 splits |
| Server | Demo client-side; minimal shared host API |

---

## FS dependencies found

**Runtime imports from FS-specific modules in AIO src:** None (verified by guard).

**Architectural dependencies:**

- Lazy mount in FS `App.tsx`
- Shared build toolchain and dependencies
- Cloud preview tunnel via FS dev script

---

## Build isolation test

Simulation only — no code moved.

**Result:** AIO module closure cannot compile as standalone app without new entry shell (Sprint 22 deliverable).

---

## Warnings (non-blocking)

- Live Supabase RLS matrix not executed
- Full browser matrix incomplete (Chromium only)
- Manual accessibility sign-off pending

---

## Sprint 22 inputs

Use this report plus:

- `QA_RELEASE_REPORT.md`
- `routeManifest.ts`
- `dependencyGraph.ts`
- `inventories.ts`
- `E2E_JOURNEY_MATRIX.md`

**Do not perform extraction during Sprint 21.**

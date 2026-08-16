# All In One — Extraction Plan

Goal: Move `src/all-in-one/` into a **standalone repository** with minimal rewrite.

---

## Files / directories to extract

Copy entire tree:

```
src/all-in-one/          → src/ (or keep src/all-in-one/ in new repo)
  intake/                → Sprint 02 Smart Intake (config-driven)
  roadmap/               → Sprint 02 mock recommendation engine
  demo/                    # centralized store (Sprint 03–12, v12)
  portal/                  # Sprint 12 — command center + attention engine
  insurance/               # Sprint 11 core module
  brokerage/               # Sprint 10 core module
  factoring/               # Sprint 09 core module
  dispatch/                # Sprint 08
  billing/                 # Sprint 07
  data/                    → repository layer + supabase client (Sprint 04)
  auth/                    → authentication (Sprint 04)
  office/                  → internal Office app + workflows
all-in-one/supabase/migrations/ → dedicated backend schema (Sprint 04)
  storage/demoStorage.ts → localStorage keys + reset
  data/services.ts       → Service catalog + bundles
  data/mockFactoring.ts    # Sprint 01 legacy mock (superseded by factoring/ + demo seed for Sprint 09)
  factoring/               # Sprint 09 — extract entire module
  brokerage/               # Sprint 10 — extract entire module
  insurance/               # Sprint 11 — extract entire module
  pages/shipper/
  pages/portal/brokerage/
  pages/portal/insurance/
  pages/portal/ClientPortalPages.tsx  # Sprint 12 hub pages
  portal/                  # Sprint 12 — extract command center module
  office/pages/BrokeragePages.tsx
  office/pages/InsurancePages.tsx
  components/factoring/    # Sprint 09 UI
docs/all-in-one/         → docs/
```

Do **not** copy Frontal Slayer-specific paths (`src/pages/`, `src/components/`, `motherboard/`, etc.).

---

## Dependencies to copy / install

New repo `package.json` minimum:

- `react`, `react-dom`, `react-router-dom`
- `typescript`, `vite`, `@vitejs/plugin-react`
- Optional: same versions as host for consistency

Replace host-only imports:

| Current | After extraction |
|---------|------------------|
| `lazyWithRetry` from `../../utils/lazyWithRetry` | Local util or standard `React.lazy` |
| `StudioDebugRoutes` registration | Own `App.tsx` with routes at `/` not `/debug/all-in-one` |

---

## Configuration changes

Update `src/all-in-one/config/appConfig.ts`:

```ts
routes: {
  base: '/',           // was /debug/all-in-one
  portal: '/portal',
  clientLogin: '/portal',
}
```

Update `aioPaths` helper accordingly.

Environment variables:

- `VITE_AIO_DATA_MODE` — `demo` | `backend`
- `VITE_AIO_SUPABASE_URL` — dedicated AIO project only (**not** Frontal Slayer `hyycomvcaqxxvyrfupes`)
- `VITE_AIO_SUPABASE_ANON_KEY`
- `VITE_AIO_SITE_URL`
- `VITE_AIO_CONTACT_PHONE` (optional)

---

## Routing changes

| Debug (host) | Production (standalone) |
|--------------|-------------------------|
| `/debug/all-in-one` | `/` |
| `/debug/all-in-one/portal/factoring` | `/portal/factoring` |
| `/debug/all-in-one/office/factoring` | `/office/factoring` |
| `/debug/all-in-one/services/factoring` | `/services/factoring` |
| `/debug/all-in-one/services/...` | `/services/...` |

Remove registration from `StudioDebugRoutes.tsx` and `studio-institute-paths.ts` in host repo after cutover.

---

## Supabase separation

- Create **new** Supabase project for All In One customer data
- Do **not** migrate into Frontal Slayer production DB
- Apply migrations only to All In One project when backend sprints begin

---

## Domain & Cloudflare

1. Register production domain (e.g. `allinoneenterprises.com`)
2. Deploy standalone Vercel/Cloudflare Pages project
3. Point DNS + SSL
4. Retire `/debug/all-in-one` route on Frontal Slayer host

---

## Asset migration

1. Replace `appConfig.assets.heroImage` URL with hosted CDN asset
2. Drop in final logo SVG/PNG at `public/assets/logo.svg`
3. Set `appConfig.assets.logoSlot`

---

## Build / deployment

Standalone Vite app:

```bash
npm run build
# deploy dist/ to Vercel or Cloudflare Pages
```

No dependency on Frontal Slayer `vercel.json` or `[sync-only]` commit flow.

---

## Must NOT travel from Frontal Slayer

- Supabase project `hyycomvcaqxxvyrfupes` credentials
- Frontal Slayer auth (`adminAuth`, Supabase session)
- Storefront components, design system (`src/design-system/`), FSMS
- Admin routes, Studio OS modules
- Expert capture `/expert-capture/all-in-one-permitting` (separate Studio OS artifact — evaluate separately)

---

## Factoring module extractable (Sprint 09)

Self-contained under `src/all-in-one/factoring/` with demo actions in `demo/factoringActions.ts` and `demo/factoringSeed.ts`.

Dependencies to keep with module on extraction:

| Dependency | Reason |
|------------|--------|
| `billing/money.ts` | Minor units + `formatMoney` |
| `dispatch/dispatchTypes.ts` + `dispatchRules.ts` | Load + handoff readiness |
| `notifications/notificationEngine.ts` | Factoring alerts |
| `vault/` (reference ids only) | Document links on invoices |

No Frontal Slayer or Sprint 07 invoice tables required for factoring workflow demo.

Docs to copy: `FACTORING_SYSTEM.md`, `FREIGHT_RECEIVABLES_DOMAIN.md`, `FACTORING_SECURITY.md`, `DIRECT_FACTORING_FUTURE.md`, `BROKERAGE_SYSTEM.md`, `BROKERAGE_FINANCIAL_DOMAIN.md`, `BROKERAGE_SECURITY.md`, `BROKERAGE_ACTIVATION.md`, `INSURANCE_SYSTEM.md`, `INSURANCE_REGULATORY_BOUNDARIES.md`, `INSURANCE_DATA_SECURITY.md`, `INSURANCE_ACTIVATION.md`.

---

## Brokerage module extractable (Sprint 10)

Self-contained under `src/all-in-one/brokerage/` with demo actions in `demo/brokerageActions.ts` and `demo/brokerageSeed.ts`.

Dependencies to keep with module on extraction:

| Dependency | Reason |
|------------|--------|
| `billing/money.ts` | Minor units + `formatMoney` |
| `dispatch/dispatchTypes.ts` | Canonical `Load` + operational statuses |
| `notifications/notificationEngine.ts` | Brokerage alerts |
| `vault/` (reference ids only) | BOL/POD on loads |

**Dispatch ≠ Brokerage:** extract shared `Load` types via `dispatch/` but keep UI routes separate (`/shipper`, `/portal/brokerage`, `/office/brokerage` vs `/portal/dispatch`).

---

## Insurance module extractable (Sprint 11)

Self-contained under `src/all-in-one/insurance/` with demo actions in `demo/insuranceActions.ts` and `demo/insuranceSeed.ts`.

Dependencies to keep with module on extraction:

| Dependency | Reason |
|------------|--------|
| `billing/money.ts` | Minor units + `formatMoney` for limits/premiums display |
| `road-ready/` (types + sync hook) | `syncInsuranceToRoadReady`, `isPolicyActiveForRoadReady` |
| `notifications/notificationEngine.ts` | Insurance alerts |
| `vault/` (reference ids only) | Policy/COI document links |
| `demo/roadReadySeed.ts` | Fleet units for vehicle schedule (read-only ids) |

**Premium ≠ service revenue:** do not merge `InsuranceQuoteRecord` into Sprint 07 billing on extraction.

---

## Command center module extractable (Sprint 12)

Self-contained under `src/all-in-one/portal/` with UI in `pages/portal/ClientPortalPages.tsx`, `pages/PortalPage.tsx`, `components/CommandCenterComponents.tsx`.

Dependencies to keep with module on extraction:

| Dependency | Reason |
|------------|--------|
| All domain demo actions | Collectors read dispatch, vault, billing, insurance, etc. |
| `utils/paths.ts` | Canonical route constants |
| `layouts/AIOPortalLayout.tsx` | Nav + mobile chrome |
| Domain modules (read-only aggregation) | No circular imports — portal imports domains, not reverse |

**Financial separation:** extract `MoneySummaryView` rules — never add combined totals on extraction.

**Dedupe contract:** preserve `insurance-expiry:{orgId}:{date}` across host and standalone repo.

Docs to copy: `CLIENT_COMMAND_CENTER.md`, `CLIENT_INFORMATION_ARCHITECTURE.md`, `CLIENT_ATTENTION_ENGINE.md`.

---

## Sprint 21 — Extraction readiness inputs (use in Sprint 22)

Before physical extraction, consume:

| Artifact | Location |
|----------|----------|
| Extraction gate | `src/all-in-one/qa/extractionGate.ts` → `canExtractAllInOne()` |
| Route manifest | `src/all-in-one/qa/routeManifest.ts` (35 routes) |
| Dependency graph | `src/all-in-one/qa/dependencyGraph.ts` |
| Inventories | `src/all-in-one/qa/inventories.ts` |
| QA report | `docs/all-in-one/EXTRACTION_READINESS_REPORT.md` |
| Known blockers | `docs/all-in-one/KNOWN_ISSUES.md` QA-001 |

**Sprint 21 result:** BLOCKED — shared Vite host, no standalone package.json, no dedicated Supabase for live RLS.

---

- [ ] New GitHub repository created
- [ ] `appConfig` routes updated to production paths
- [ ] `lazyWithRetry` decoupled or inlined
- [ ] Standalone `App.tsx` + router
- [ ] New Supabase project (when backend needed)
- [ ] Production domain + deploy
- [ ] Remove debug route from Frontal Slayer host
- [ ] Verify zero Frontal Slayer visual/code coupling

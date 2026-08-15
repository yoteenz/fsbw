# All In One — Debug Architecture

## Temporary host

All In One Enterprises Inc. Sprint 01 runs inside the **Frontal Slayer / Build-a-Wig** repository solely to use the existing Cloudflare preview tunnel (`npm run dev` + `./scripts/cloud-preview-tunnel.sh`).

This is **not** a Frontal Slayer product surface. It must not appear in storefront navigation, admin IA, or customer flows.

---

## Debug route namespace

| Route | Purpose |
|-------|---------|
| `/all-in-one` | Homepage (canonical) |
| `/all-in-one/get-started` | Smart Intake entry (`?goal=` query params) |
| `/all-in-one/roadmap/results` | Preliminary roadmap results |
| `/all-in-one/services` | Service marketplace |
| `/all-in-one/services/:serviceSlug` | Config-driven service detail |
| `/all-in-one/services/permitting\|business-formation\|…` | Division landing pages |
| `/all-in-one/services/factoring` | Factoring public page (custom) |
| `/all-in-one/service-plan` | My Service Plan |
| `/all-in-one/request/submit` | Mock service request review |
| `/all-in-one/request/confirmation/:id` | Demo request confirmation |
| `/all-in-one/portal` | Client dashboard |
| `/all-in-one/portal/requests/:requestId` | Request detail + timeline |
| `/all-in-one/portal/factoring` | Factoring portal (mock) |
| `/debug/all-in-one/*` | Legacy redirect → `/all-in-one/*` |

Registered in `src/routes/StudioDebugRoutes.tsx` **before** the catch-all `App` route. Lazy-loaded via `src/all-in-one/routes/AllInOneRouteHost.tsx`.

---

## Project directories

```
src/all-in-one/
  config/appConfig.ts      # Company, contact, routes, feature flags
  intake/                  # Sprint 02 — config-driven Smart Intake
  roadmap/                 # Sprint 02 — mock recommendation engine
  repositories/            # Sprint 02 — LocalDemo* persistence abstractions
  storage/demoStorage.ts   # localStorage namespaces + reset
  data/services.ts         # Sprint 02 — full service catalog + bundles
  components/              # AIO* design system + intake/roadmap/request UI
  layouts/                 # Public + portal layouts (+ debug banner)
  sections/                # Homepage sections
  pages/                   # Route pages (intake, marketplace, portal, requests)
  data/                    # Mock data (mockFactoring.ts, mockServices.ts, …)
  services/factoring/      # Partner abstraction types + placeholder provider
  styles/aio.css           # Scoped under .aio-app
  routes/                  # AllInOneRoutes + lazy host
  types/ utils/ hooks/
docs/all-in-one/           # Project documentation
```

---

## Routing & bootstrap isolation

- `isAllInOneDebugPath()` in `src/routes/studio-institute-paths.ts`
- `isIsolatedStudioRoute()` returns true for All In One paths → skips heavy storefront bootstrap in `main-legacy.tsx`
- Code-split: `lazyWithRetry` on `AllInOneRouteHost` — does not inflate initial Frontal Slayer bundle for normal users

---

## Styling isolation

- All styles scoped under `.aio-app` in `src/all-in-one/styles/aio.css`
- Typography: Plus Jakarta Sans + DM Sans (not Futura PT / Frontal Slayer fonts)
- Colors: black/charcoal/white/gold — no brand red `#EB1C24`
- CSS imported only from `AllInOneRouteHost.tsx` when debug route loads

---

## Mock data

| File | Contents |
|------|----------|
| `mockRoadmap.ts` | Progress %, checklist, business steps |
| `mockDashboard.ts` | Portal metrics, activity, documents |
| `mockLoads.ts` | Dispatch load, brokerage form, shipper timeline |
| `mockServices.ts` | Six service divisions, intent cards, page meta |
| `mockFactoring.ts` | Dashboard metrics, invoices, history, workflow docs, operate-grow steps |

**No financial backend.** No Supabase tables. No API routes. No bank/ACH data collected.

### Sprint 02 — localStorage namespaces

| Key | Contents |
|-----|----------|
| `aio_debug_intake` | Smart Intake answers |
| `aio_debug_roadmap` | Generated preliminary roadmap |
| `aio_debug_service_plan` | Selected services (My Service Plan) |
| `aio_debug_requests` | Demo service requests array |
| `aio_debug_request_counter` | Incrementing demo request number |

**Reset Demo Data** — `AIODebugBanner` clears all keys and reloads to homepage.

### Sprint 02 — intake configuration

- `intakeConfig.ts` — sections, questions, goal/journey/business/operating/assets/pain-point branches
- `intakeRules.ts` — field get/set, validation
- Conditional sections: shipper (`move_freight`), factoring branch, insurance branch
- Goal query map: `start-business`, `get-legal`, `compliance`, `insurance`, `dispatch`, `factoring`, `move-freight`

### Sprint 02 — roadmap engine

- `roadmapEngine.ts` — deterministic mock rules from intake answers
- Statuses: completed, in_progress, recommended, needs_review, optional, etc.
- Dual progress: Setup/Compliance vs Business Services (factoring does not reduce compliance %)
- "Why am I seeing this?" expandable reasons per item

### Sprint 02 — service configuration

- `data/services.ts` — 30+ services with slug, division, FAQ, documents, related services
- `serviceBundles` — packaged service concepts (no checkout)

### Sprint 02 — demo request model

- Format: `AIO-DEMO-0001`
- Status workflow config: new_request → initial review → documents → submission → agency → complete
- Timeline driven by `serviceRequestRepository` configuration

### Factoring components (Sprint 01 follow-up)

`AIOFactoringMetricCard`, `AIOFactoringInvoiceRow`, `AIOFactoringStatusBadge`, `AIOFactoringWorkflow`, `AIOFundingEstimate`, `AIODocumentChecklist`, `AIOFactoringHistory`

---

## Mock data (original Sprint 01)

---

## Host repo dependencies (temporary)

| Dependency | Usage |
|------------|--------|
| React 19 + React Router 6 | Same as host — acceptable |
| `lazyWithRetry` from `src/utils/lazyWithRetry.ts` | Chunk loading helper |
| `StudioDebugRoutes` registration | Minimal 1-route addition |
| Vite dev server + Cloudflare tunnel | Preview only |

---

## Known temporary compromises

1. Lives inside Frontal Slayer repo and shares `node_modules`
2. Uses host `index.html` and global React root
3. Hero image is external placeholder URL in `appConfig.ts`
4. Phone/email are config placeholders
5. Client Login has no auth — links to portal prototype
6. Sample testimonial labeled "Debug Only"

---

## What must NOT change in Frontal Slayer

- Existing routes, navigation, global CSS, auth, Supabase behavior
- No All In One entries in storefront menu or admin dashboard

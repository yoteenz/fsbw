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
| `/all-in-one/portal` | Client Command Center home (Sprint 12) |
| `/all-in-one/portal/business` | My Business profile (Sprint 12) |
| `/all-in-one/portal/business/summary` | Printable business summary (Sprint 12) |
| `/all-in-one/portal/operations` | Operations hub (Sprint 12) |
| `/all-in-one/portal/money` | Money hub — separate domains (Sprint 12) |
| `/all-in-one/portal/documents` | Document center hub (Sprint 12) |
| `/all-in-one/portal/communication` | Communication hub (Sprint 12) |
| `/all-in-one/portal/requests` | Service requests list (Sprint 12) |
| `/all-in-one/portal/services` | Services center (Sprint 12) |
| `/all-in-one/portal/activity` | Activity timeline (Sprint 12) |
| `/all-in-one/portal/team` | Team roster (Sprint 12) |
| `/all-in-one/portal/search` | Portal search (Sprint 12) |
| `/all-in-one/portal/onboarding` | Road Ready onboarding (10-step) |
| `/all-in-one/portal/road-ready` | Road Ready persistent home |
| `/all-in-one/portal/fleet` | Fleet profile |
| `/all-in-one/portal/fleet/vehicles/:id` | Vehicle detail |
| `/all-in-one/portal/requests/:requestId` | Request detail + timeline |
| `/all-in-one/login` | Auth — sign in |
| `/all-in-one/sign-up` | Auth — create account |
| `/all-in-one/forgot-password` | Password reset request |
| `/all-in-one/reset-password` | Set new password |
| `/all-in-one/onboarding` | First-login setup |
| `/all-in-one/portal/settings` | Account settings |
| `/all-in-one/office/*` | Internal Office · INTERNAL PREVIEW (demo) or staff auth (backend) |
| `/all-in-one/office/road-ready` | Road Ready client queue |
| `/all-in-one/office/clients/:id/road-ready` | Staff verification review |
| `/all-in-one/portal/factoring` | Factoring portal (Sprint 09) |
| `/all-in-one/office/factoring` | Factoring Command Center (Sprint 09) |
| `/all-in-one/shipper` | Shipper portal home (Sprint 10) |
| `/all-in-one/shipper/onboarding` | Shipper onboarding |
| `/all-in-one/shipper/shipments` | Shipper shipments list |
| `/all-in-one/shipper/shipments/new` | New shipment request |
| `/all-in-one/shipper/shipments/:loadId` | Shipment detail |
| `/all-in-one/shipper/quotes` | Freight quotes |
| `/all-in-one/shipper/quotes/:quoteId` | Quote review / accept |
| `/all-in-one/shipper/billing` | Shipper invoices (`BSI-*`) |
| `/all-in-one/portal/brokerage` | Carrier brokerage home (Sprint 10) |
| `/all-in-one/portal/brokerage/offers` | Carrier offers |
| `/all-in-one/portal/brokerage/loads/:loadId` | Carrier brokerage load |
| `/all-in-one/portal/brokerage/payments` | Carrier payables |
| `/all-in-one/office/brokerage` | Brokerage Command Center (Sprint 10) |
| `/all-in-one/office/brokerage/readiness` | Capability + activation checklist |
| `/all-in-one/office/brokerage/shippers` | Shipper directory |
| `/all-in-one/office/brokerage/coverage` | Needs-coverage queue |
| `/all-in-one/office/brokerage/carriers` | Carrier network |
| `/all-in-one/office/brokerage/finance` | Shipper invoices + carrier payables |
| `/all-in-one/portal/insurance` | Insurance Center (Sprint 11) |
| `/all-in-one/portal/insurance/request` | Request help / add existing policy |
| `/all-in-one/portal/insurance/requests/:requestId` | Insurance request detail |
| `/all-in-one/portal/insurance/policies/:policyId` | Policy detail (masked number) |
| `/all-in-one/portal/insurance/certificates` | COI list |
| `/all-in-one/portal/insurance/certificates/new` | Request COI |
| `/all-in-one/portal/insurance/renewals` | Insurance renewals |
| `/all-in-one/office/insurance` | Insurance Command Center (Sprint 11) |
| `/all-in-one/office/insurance/readiness` | Capability + activation checklist |
| `/all-in-one/office/insurance/requests` | Insurance requests queue |
| `/all-in-one/office/insurance/policies` | Policy administration |
| `/all-in-one/office/insurance/partners` | Partner directory |
| `/all-in-one/office/insurance/certificates` | COI requests |
| `/all-in-one/office/insurance/renewals` | Expiring policies |
| `/debug/all-in-one/portal/factoring` | Legacy alias → `/all-in-one/portal/factoring` |
| `/debug/all-in-one/office/factoring` | Legacy alias → `/all-in-one/office/factoring` |
| `/debug/all-in-one/*` | Legacy redirect → `/all-in-one/*` |

Registered in `src/routes/StudioDebugRoutes.tsx` **before** the catch-all `App` route. Lazy-loaded via `src/all-in-one/routes/AllInOneRouteHost.tsx`.

---

## Project directories

```
src/all-in-one/
  config/appConfig.ts      # Company, contact, routes, feature flags
  demo/                    # Sprint 03–13 — demo store v13 + seed/actions
  portal/                  # Sprint 12 — command center, attention engine, org context
  brokerage/               # Sprint 10 — types, rules, calculations, config
  insurance/               # Sprint 11 — types, rules, calculations, config, partner adapter
  factoring/               # Sprint 09 — types, rules, calculations, config
  dispatch/                # Sprint 08 — load domain, handoff rules
  road-ready/              # Sprint 05 — Road Ready config, rules, scoring, types
  data/                    # Sprint 04 — repositories (demo + supabase), supabase client
  auth/                    # Sprint 04 — AIOAuthProvider, authService, route guards
  office/                  # Sprint 03 — internal Office app, workflows, priority engine
    layouts/               # AIOOfficeLayout (sidebar shell)
    pages/                 # Dashboard, CRM, requests, ops, division centers
    routes/OfficeRoutes.tsx
    workflows/             # Division workflow definitions + engine
  intake/                  # Sprint 02 — config-driven Smart Intake
  roadmap/                 # Sprint 02 — mock recommendation engine
  repositories/            # Sprint 02 — LocalDemo* (now backed by demo store)
  storage/demoStorage.ts   # localStorage namespaces + reset
  data/services.ts         # Sprint 02 — full service catalog + bundles
  components/              # AIO* design system + intake/roadmap/request UI
  layouts/                 # Public + portal layouts (+ debug banner)
  sections/                # Homepage sections
  pages/portal/ClientPortalPages.tsx  # Sprint 12 — hub pages
  components/CommandCenterComponents.tsx  # Sprint 12 — CC UI blocks
  pages/shipper/           # Sprint 10 — ShipperPortalPages
  pages/portal/brokerage/  # Sprint 10 — carrier brokerage portal
  pages/portal/insurance/  # Sprint 11 — InsurancePortalPages
  components/factoring/    # Sprint 09 — LoadFactoringSection
  office/pages/BrokeragePages.tsx
  office/pages/FactoringPages.tsx
  office/pages/InsurancePages.tsx
  data/                    # Mock data (mockFactoring.ts legacy, mockServices.ts, …)
  services/factoring/      # Partner abstraction + Sprint 09 adapter stub
  styles/aio.css           # Scoped under .aio-app (+ .aio-office)
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

### Sprint 04 — data modes

| Mode | Storage | Auth |
|------|---------|------|
| `demo` | `aio_debug_store` localStorage | Optional demo portal/office entry |
| `backend` | Dedicated AIO Supabase (`aio_*` tables) | Supabase Auth + RLS |

**Reset Demo Data** — only when `VITE_AIO_DATA_MODE=demo`.

Backend migrations: `all-in-one/supabase/migrations/` — **not** Frontal Slayer `supabase/migrations/`.

### Sprint 03 — centralized demo store

Single key: `aio_debug_store`. Current version: **13** (Sprint 13 Office 2.0). Legacy versions migrate on first load (v3→…→v12→v13).

Entities: clients, requests, tasks, documents, deadlines, notes, messages, activity, staff, loads, dispatch enrollments, factoringProfiles, factoringProviders, debtorAccounts, freightInvoices, factoringSubmissions, factoringIssues, factoringCounters, **brokerageCapability**, **shipperProfiles**, **shipmentRequests**, **brokerageFreightQuotes**, **carrierNetworkProfiles**, **carrierOffers**, **brokerageRateConfirmations**, **brokerageLoadFinancials**, **brokerageAccessorials**, **brokerageShipperInvoices**, **carrierPayables**, **brokerageIssues**, **coverageHistory**, **brokerageCounters**, invoices, notifications, billing, road ready, fleet, **portalMemberRole**, **organizationMembers**.

**Cross-portal sync:** Portal and Office read/write the same store. `portalClientId` links customer session to client record.

**Reset:** `resetDemoStore()` restores `demoSeed.ts` canonical fictional data.

**Visibility:** `internal` vs `customer` on notes, messages, documents — internal notes never render in portal.

### Sprint 02 — localStorage namespaces (legacy, migrated)

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

### Sprint 09 — demo store v8 (factoring)

| Upgrade | Adds |
|---------|------|
| v7 → v8 | `factoringProviders`, `factoringProfiles`, `debtorAccounts`, `freightInvoices`, `factoringSubmissions`, `factoringIssues`, `factoringCounters`; replaces legacy flat `factoring[]` array |

Seed: `factoringSeed.ts` — clients A–G scenarios (interested, in review, action needed, funding pending, funded, existing factor).

Actions: `factoringActions.ts` — enrollment, freight invoice, submission lifecycle, notifications.

**Reset Demo Data** restores v10 seed via `demoSeed.ts`.

Factoring UI banner: `DEMO · Fictional providers, amounts, and funding for review only`

### Sprint 10 — demo store v10 (brokerage)

| Upgrade | Adds |
|---------|------|
| v8 → v9 | Full brokerage graph: capability, shippers, shipment requests, freight quotes, carrier network, offers, rate confirmations, load financials, shipper invoices, carrier payables, issues, coverage history; brokerage loads merged into `loads[]` with `sourceType: 'brokerage'` |
| v9 → v10 | Refreshes brokerage financials (per-scenario margins, Load G $500), patches br-load-a/br-load-h, sets `brokeragePortalClientId: client-b` |

Seed: `brokerageSeed.ts` — loads **A–H** scenarios (coverage, in transit, POD issue, ready to bill, invoiced, factoring-protected payable).

Actions: `brokerageActions.ts` — requests, quotes, load conversion, offers, shipper invoices, notifications.

Default capability: **`demo`** (`DEFAULT_BROKERAGE_CAPABILITY`).

Brokerage UI banner: `DEMO_BROKERAGE_LABEL` from `brokerageConfig.ts`.

**Reset Demo Data** restores v10 brokerage slice via `demoSeed.ts` (full store now v11 — see below).

### Sprint 11 — demo store v11 (insurance)

| Upgrade | Adds |
|---------|------|
| v10 → v11 | Full insurance graph: capability, partners, policies, coverages, policy vehicles, requests, handoffs, quote records, certificate holders, certificates, issues, counters; `syncInsuranceToRoadReady` for client-b and client-c |

Seed: `insuranceSeed.ts` — scenarios **A–I** (clients a–g + readiness gate + Road Ready sync).

Actions: `insuranceActions.ts` — requests, policy intake, referral, quotes, COI, Road Ready sync, notifications.

Default capability: **`demo`** (`DEFAULT_INSURANCE_CAPABILITY`). Default operating mode: **`assistance`**.

Insurance UI banner: `DEMO_INSURANCE_LABEL` from `insuranceConfig.ts`.

**Reset Demo Data** restores v11 seed via `demoSeed.ts`.

### Sprint 12 — demo store v12 (command center)

| Upgrade | Adds |
|---------|------|
| v11 → v12 | `portalMemberRole` (default `owner`), `organizationMembers[]` seeded per demo org (owners, driver on client-b, admin/ops on client-c) |

Seed: `commandCenterSeed.ts` — membership roster for clients a–g + shipper client-e.

Actions: none new — command center reads existing domain actions via `clientCommandCenterService.ts`.

Debug controls (`AIODebugBanner`):

- Organization `<select>` → `setPortalOrganization()` / `portalClientId`
- Role `<select>` → `setPortalMemberRole()` / `portalMemberRole`
- **Shipper Org** → `shipperPortalOrgId = client-e`

Demo scenarios by org:

| Org | Command center QA focus |
|-----|-------------------------|
| client-a | New owner-operator baseline |
| client-b | Mixed attention + driver role member |
| client-c | Fleet admin/ops roles |
| client-d | Factoring in progress |
| client-f | Active load / POD |
| client-g | All caught up |
| client-e | Shipper quotes (via shipper portal) |

**Reset Demo Data** restores v12 seed via `demoSeed.ts`.

### Factoring components (Sprint 01 + Sprint 09)

Sprint 01: `AIOFactoringMetricCard`, `AIOFactoringInvoiceRow`, `AIOFactoringStatusBadge`, `AIOFactoringWorkflow`, `AIOFundingEstimate`, `AIODocumentChecklist`, `AIOFactoringHistory`

Sprint 09: `LoadFactoringSection`, `FactoringPortalPages`, `FactoringPages` (office), `FreightInvoicePrintPage`, module under `src/all-in-one/factoring/`

Sprint 10: `ShipperPortalPages`, `BrokeragePortalPages`, `BrokeragePages` (office), module under `src/all-in-one/brokerage/`

Sprint 11: `InsurancePortalPages`, `InsurancePages` (office), module under `src/all-in-one/insurance/`

Sprint 12: `ClientPortalPages` (hub routes), `CommandCenterComponents`, `portal/*` (command center service + engines), `PortalPage` command center home

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

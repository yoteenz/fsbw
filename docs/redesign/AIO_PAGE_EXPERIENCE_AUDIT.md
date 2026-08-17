# AIO Page Experience Audit

Phase 0 audit for the **AIO Website — Full Page Experience Redesign Sprint**. Maps existing routes, components, data dependencies, and proposed shared templates against the 14 approved page families from the Page Story & Moodboard.

**Scope:** `all-in-one-enterprises/` standalone app (`src/`). Homepage mobile restructure from prior sprint is **frozen** — not re-audited for redesign.

**Date:** 2026-08-17

---

## Layouts & shared chrome

| Layout | Path | Used for |
|--------|------|----------|
| `AIOPublicLayout` | `src/layouts/AIOPublicLayout.tsx` | Public marketing, services, auth-adjacent pages |
| `AIOPortalLayout` | `src/layouts/AIOPortalLayout.tsx` | Client portal + shipper portal |
| `AIOOfficeLayout` | `src/office/layouts/AIOOfficeLayout.tsx` | Staff AIO Office |
| `AIOAuthLayout` | `src/layouts/AIOAuthLayout.tsx` | Login, signup, onboarding |

**Shared chrome:** `AIONav`, `AIOFooter`, `AIOButton`, `AIOSectionHeader`, `AIOCard`, `AIOIcon`, homepage primitives under `components/homepage/`.

**Responsive layers:** `aio.css`, `aio-mobile.css`, `aio-homepage-mobile.css`, `aio-large-display.css` (1600px+ ultrawide caps).

---

## Page family matrix

| # | Page family | Primary route(s) | Current component(s) | Auth | Data / logic deps | Proposed template |
|---|-------------|------------------|----------------------|------|-------------------|-------------------|
| 1 | Homepage | `/` | `HomePage`, `AioHomepageHero`, `AioPathwayRouter`, mobile sections | Public | `homePathways`, journey hooks | **No change** (approved prior sprint) |
| 2 | Service Hub | `/services`, `/services/:divisionSlug` (division mode) | `ServicesPage`, `ServiceCatalogDetailPage` (division), `MobileDivisionServicesView` | Public | `SERVICE_DISCOVERY_CATEGORIES`, `divisionMeta`, `getServicesByDivision`, catalog search | `ServiceHubTemplate` |
| 3 | Individual Service | `/services/:serviceSlug` | `ServiceCatalogDetailPage`, `MobileServiceDetailView` | Public | `aioServices`, `getServicePricing`, `getPublicServiceCta`, mobile config | `ServiceDetailTemplate` |
| 4 | Start My Business | `/start-your-business`, `/start-your-business/*` | `StartYourBusinessPage`, journey step pages, `useStartBusinessJourney` | Public (+ state when signed in) | `startBusinessJourneyDef`, Road Ready items | `JourneyHubTemplate` |
| 5 | Road Ready™ | `/road-ready`, `/portal/road-ready`, `/get-started` | `RoadReadyPublicPage`, `RoadReadyPage`, intake flows | Public / Portal | Road Ready profile, items, progress | `RoadReadyTemplate` |
| 6 | Bookkeeping | `/services/bookkeeping`, `/portal/bookkeeping` | `BookkeepingPage`, portal bookkeeping | Public / Portal | `bookkeepingPlans`, assessment flow | `OperationalServiceTemplate` |
| 7 | Dispatch | `/services/dispatching`, `/portal/dispatch/*` | `ServiceCatalogDetailPage` (division), dispatch portal pages | Public / Portal | Dispatch onboarding, loads | `OperationalServiceTemplate` |
| 8 | Freight / Shipper | `/services/brokerage`, `/shipper/*` | `ServiceCatalogDetailPage`, shipper portal | Public / Portal | Brokerage + shipper flows | `OperationalServiceTemplate` |
| 9 | Factoring | `/services/factoring`, `/portal/factoring/*` | `FactoringPage`, factoring portal | Public / Portal | `mockFactoringHowItWorks`, partner disclaimers | `OperationalServiceTemplate` |
| 10 | Digital Records Vault | `/portal/vault`, `/portal/documents`, office vault | `VaultPage`, `DocumentCenterPage`, `DocumentVaultPages` (office) | Portal / Office | Vault taxonomy, Supabase when live | `VaultBrowserTemplate` + public vault marketing on `ClientPortalInfoPage` |
| 11 | Client Portal | `/portal` | `PortalPage`, `CommandCenterComponents`, `MobilePortalHome` | Portal | `useClientCommandCenter` | `PortalDashboardTemplate` (restyle, preserve logic) |
| 12 | AIO Office | `/office/*` | `OfficeDashboardPage`, `OfficeCommandCenterComponents` | Office | `useOfficeCommandCenter`, demo store | `OfficeDashboardTemplate` (restyle, preserve logic) |
| 13 | Resources | `/about#resources`, nav Resources dropdown | `AboutPage` section, `resourcesMenuLinks` | Public | Static links, Road Ready CTA | `ResourcesTemplate` |
| 14 | Contact | `/contact`, `/request-callback` | `ContactPage`, `RequestCallbackPage` | Public | CRM lead creation, `aioAppConfig.contact` | `ContactIntentTemplate` |

---

## Route inventory (public)

| Route | Component | Page family |
|-------|-----------|---------------|
| `/` | `HomePage` | Homepage |
| `/services` | `ServicesPage` | Service Hub (master) |
| `/services/find` | `ServiceFindPage` | Service Hub (search) |
| `/services/:slug` | `ServiceCatalogDetailPage` | Hub (division) or Individual Service |
| `/services/bookkeeping` | `BookkeepingPage` | Bookkeeping |
| `/services/factoring` | `FactoringPage` | Factoring |
| `/start-your-business` | `StartYourBusinessPage` | Start My Business |
| `/road-ready` | `RoadReadyPublicPage` | Road Ready™ |
| `/client-portal` | `ClientPortalInfoPage` | Client Portal (marketing) |
| `/contact` | `ContactPage` | Contact |
| `/about` | `AboutPage` | Resources (partial) |
| `/get-started` | `GetStartedPage` | Road Ready intake |
| `/roadmap`, `/roadmap/results` | Roadmap flows | Road Ready |

## Route inventory (portal)

| Route | Component | Page family |
|-------|-----------|---------------|
| `/portal` | `PortalPage` | Client Portal |
| `/portal/road-ready` | `RoadReadyPage` | Road Ready™ |
| `/portal/vault` | `VaultPage` | Digital Records Vault |
| `/portal/documents` | `DocumentCenterPage` | Digital Records Vault |
| `/portal/dispatch/*` | Dispatch portal pages | Dispatch |
| `/portal/factoring/*` | Factoring portal | Factoring |
| `/portal/bookkeeping` | Bookkeeping portal | Bookkeeping |
| `/shipper/*` | Shipper portal | Freight / Shipper |

## Route inventory (office)

| Route | Component | Page family |
|-------|-----------|---------------|
| `/office` | `OfficeDashboardPage` | AIO Office |
| `/office/documents/vault` | `DocumentVaultPages` | Digital Records Vault (staff) |
| Division queues | `DivisionQueuePage`, work pages | AIO Office |

---

## Service & navigation data models

| Source | Purpose |
|--------|---------|
| `src/data/services.ts` | `aioServices`, `divisionMeta`, bundles |
| `src/services/catalog/*` | Discovery categories, canonical catalog, search |
| `src/data/publicNavigation.ts` | Mega menu, resources links |
| `src/data/homePathways.ts` | Homepage pathway cards |
| `src/billing/servicePricingConfig.ts` | Customer pricing labels |
| `src/launch/serviceActivationLaunch.ts` | Public CTA gating |
| `src/services/mobileServicePageConfig.ts` | Mobile service benefits/process overrides |
| `src/journeys/startBusinessJourneyConfig.ts` | Journey milestones BUILD→ROLL |
| `src/vault/vaultTaxonomy.ts` | Document categories |

---

## Reusable components (existing → page system)

| Existing | Page-system primitive |
|----------|----------------------|
| `AIOButton` | `AioPrimaryButton` / `AioSecondaryButton` (aliases) |
| `AIOSectionHeader` | `AioSectionHeading` |
| `aio-page-hero` CSS | `AioCinematicHero` |
| `aio-marketplace-card` grid | `AioServiceRow` stack |
| `aio-step` | `AioProcessRail` |
| `AIORoadmapProgress` | Roadmap lists |
| `AIORoadReadyTeaserRing` | `AioProgressRing` (data-driven) |
| `CommandCenterComponents` | Portal dashboard (restyle only) |
| `OfficeCommandCenterComponents` | Office dashboard (restyle only) |

---

## Authenticated vs public

- **Public:** All routes under `AIOPublicLayout` except auth pages use `AIONav` with Log In / Sign Up.
- **Portal:** `CustomerRouteGuard` → `AIOPortalLayout`; portal nav, no public auth CTAs.
- **Office:** `OfficeRouteGuard` → operational density, work queues.
- **Road Ready progress:** Real data via demo store / Supabase when connected — never hardcode moodboard percentages.

---

## Supabase & security (preserve)

- Auth: `AIOAuthProvider`, route guards
- Vault: RLS-backed when production project live; taxonomy in `src/vault/`
- No schema changes required for this presentation sprint

---

## Implementation notes

1. **Homepage:** Do not redesign; use as visual north star for dark/gold/cinematic language on other pages.
2. **Division hubs:** `permitting`, `business-formation`, `insurance`, `dispatching`, `brokerage`, `safety`, `financial` render via `ServiceCatalogDetailPage` division mode → migrate to `ServiceHubTemplate`.
3. **Concise service pages:** Desktop individual services currently section-heavy → collapse to Hero / Handles / Process / Requirements / Related.
4. **Mobile:** Keep `MobileServiceDetailView` and `MobileDivisionServicesView`; align dark styling via shared CSS tokens.
5. **Asset gaps:** Document in redesign report — e.g. dispatch hero, bookkeeping split hero, contact support imagery.

---

## Proposed template summary

| Template | Sections |
|----------|----------|
| `ServiceHubTemplate` | Cinematic hero → service row directory → roadmap footer CTA |
| `ServiceDetailTemplate` | Compact hero → What AIO Handles → Process rail → Requirements/timeline → Related → sidebar CTA |
| `JourneyHubTemplate` | Journey hero → vertical milestones (auth-aware) → roadmap footer |
| `RoadReadyTemplate` | Diagnostic hero + progress ring → grouped roadmap list |
| `OperationalServiceTemplate` | Hero → capabilities → process → audience/packages → CTA |
| `PortalDashboardTemplate` | Welcome + progress → next best action → at a glance → activity |
| `ContactIntentTemplate` | Hero → intent grid → contact options → form |

---

*End Phase 0 audit. Implementation proceeds in order: shared design system → templates → page refactors → cross-site QA.*

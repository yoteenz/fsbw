# AIO Page Redesign Report

Sprint: **AIO Website — Full Page Experience Redesign**  
Reference: Page Story & Moodboard (14 page families)  
Date: 2026-08-17

---

## Summary

Introduced a shared **page system** (`components/page-system/`, `aio-page-system.css`) and migrated major public routes to premium dark/gold cinematic layouts while **preserving all routes, business logic, auth, pricing, and data integrations**.

**Homepage not redesigned** (prior sprint approved).

---

## Route matrix

| Old page / route | Page family | Shared template | Status |
|------------------|-------------|-----------------|--------|
| `/` HomePage | Homepage | homepage/* (frozen) | Unchanged |
| `/services` | Service Hub | `ServiceHubTemplate` / shell | **Redesigned** |
| `/services/:division` | Service Hub | `ServiceHubTemplate` | **Redesigned** (desktop) |
| `/services/:serviceSlug` | Individual Service | `ServiceDetailTemplate` | **Redesigned** (desktop) |
| `/start-your-business` | Start My Business | Journey shell + milestones | **Redesigned** |
| `/road-ready` | Road Ready™ | Shell + progress ring | **Redesigned** |
| `/services/bookkeeping` | Bookkeeping | Shell + operational sections | **Redesigned** |
| `/services/factoring` | Factoring | `OperationalServiceTemplate` | **Redesigned** |
| `/services/dispatching` | Dispatch | Division hub + detail | **Partial** (hub/detail templates) |
| `/services/brokerage` | Freight / Shipper | Division hub + detail | **Partial** |
| `/client-portal` | Client Portal marketing | Shell + vault preview | **Redesigned** |
| `/portal` | Client Command Center | Existing command center | **Logic preserved** |
| `/portal/vault` | Digital Records Vault | Existing vault UI | **Logic preserved** |
| `/office` | AIO Office | Existing office CC | **Logic preserved** |
| `/about#resources` | Resources | Shell + resource rows | **Redesigned** |
| `/contact` | Contact | Intent-first shell | **Redesigned** |

---

## Components created

**Primitives:** `AioPageShell`, `AioCinematicHero`, `AioEyebrow`, `AioSectionHeading`, `AioServiceRowList`, `AioFeatureGrid`, `AioProcessRail`, `AioActionPanel`, `AioRelatedServices`, `AioRoadmapFooterCta`, `AioProgressRing`, `AioJourneyMilestones`

**Templates:** `ServiceHubTemplate`, `ServiceDetailTemplate`, `OperationalServiceTemplate`

**Config:** `hubConfig.ts` (division icons, discovery → division mapping)

**Styles:** `src/styles/aio-page-system.css`

---

## Pages / components changed

- `ServicesPage.tsx`
- `ServiceCatalogDetailPage.tsx`
- `StartYourBusinessPage.tsx`
- `RoadReadyPublicPage.tsx`
- `BookkeepingPage.tsx`
- `FactoringPage.tsx`
- `ContactPage.tsx`
- `ClientPortalInfoPage.tsx`
- `AboutPage.tsx`
- `App.tsx` (CSS import)

---

## Functionality preserved

- All routes in `AllInOneRoutes.tsx`
- Service pricing, launch gating, plan bar, intake flows
- Mobile service views (`MobileServiceDetailView`, `MobileDivisionServicesView`)
- Portal / office command centers, vault security, Road Ready logic
- Supabase/auth architecture (no schema changes this sprint)
- CRM lead creation on contact submit (intent prepended to message)

---

## Asset requirements (not shipped)

Document for future art pass — do not use moodboard crops:

| Asset ID | Subject | Notes |
|----------|---------|-------|
| `AIO_ASSET_DISPATCH_HERO` | Dispatcher / ops desk | Dark cinematic, headline left |
| `AIO_ASSET_BOOKKEEPING_HERO` | Laptop + trucking financial context | Split hero optional |
| `AIO_ASSET_CONTACT_HERO` | Professional support rep | Warm, trustworthy |
| `AIO_ASSET_JOURNEY_HERO` | Truck on road at dusk | Start My Business |
| `AIO_ASSET_VAULT_HERO` | Secure archive / vault metaphor | Public vault marketing |

Existing `aioAppConfig.assets.heroImage` used where configured.

---

## Responsive testing

- `npm run build` (tsc + vite): **pass**
- Viewport validator script: not present at repo root in this environment
- Mobile paths: unchanged dedicated components; page-system CSS is additive
- Ultrawide: inherits `aio-large-display.css` container caps

---

## Remaining visual differences vs moodboard

- Portal command center and office dashboard: functional layout unchanged; full dark premium pass deferred
- Dispatch / brokerage marketing pages: use division hub template, not full operational custom layouts
- Authenticated Road Ready portal page: not restyled in this pass (public page done)
- Some bookkeeping comparison matrices retain legacy light styling inside dark shell

---

## Known issues

- Desktop Start My Business shows both journey milestone list and legacy stepper (intentional for continuity; may consolidate later)
- Road Ready public ring shows 0% with sign-in prompt (correct — no hardcoded demo progress)
- Contact intent selection prepends category to message text rather than separate CRM field

---

## Docs

- `docs/redesign/AIO_PAGE_EXPERIENCE_AUDIT.md` — Phase 0 audit
- `docs/redesign/AIO_PAGE_SYSTEM.md` — design system reference

---

*Spatial Architecture Review: SKIPPED — public marketing presentation sprint, no new Studio OS surfaces.*

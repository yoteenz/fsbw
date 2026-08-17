# AIO Page System

Shared design system for the **AIO Full Page Experience Redesign** — premium black/charcoal/gold public and authenticated marketing surfaces.

**Implementation:** `all-in-one-enterprises/src/components/page-system/` + `src/styles/aio-page-system.css`

**Homepage:** Uses approved mobile/desktop homepage primitives under `components/homepage/` — **not** part of this page-system refactor.

---

## Page families

| Family | Template | Experience model |
|--------|----------|------------------|
| Homepage | (frozen) | UNDERSTAND → CHOOSE → START |
| Service Hub | `ServiceHubTemplate` | UNDERSTAND → CHOOSE |
| Individual Service | `ServiceDetailTemplate` | UNDERSTAND → START |
| Start My Business | `AioPageShell` + `AioJourneySection` | ASSESS → COMPLETE → TRACK |
| Road Ready™ | `AioPageShell` + `AioProgressRing` | ASSESS → COMPLETE → TRACK |
| Bookkeeping / Dispatch / Freight / Factoring | `OperationalServiceTemplate` | UNDERSTAND → CHOOSE → START |
| Digital Records Vault | Feature grid + portal vault routes | SEE → ACT → CONTINUE |
| Client Portal | Command center (logic preserved) | SEE → ACT → CONTINUE |
| AIO Office | Office command center (logic preserved) | REVIEW → PROCESS → RESOLVE |
| Resources | `AioPageShell` + service rows | UNDERSTAND → CHOOSE |
| Contact | `AioPageShell` + intent grid | UNDERSTAND → CHOOSE → START |

---

## Primitives

| Component | Role |
|-----------|------|
| `AioPageShell` | Dark/light page wrapper |
| `AioCinematicHero` | Compact cinematic hero (eyebrow, headline, CTAs, optional bg image) |
| `AioEyebrow` | Gold uppercase label |
| `AioSectionHeading` | Section title block |
| `AioServiceRowList` | Stacked hub directory rows |
| `AioFeatureGrid` | “What AIO Handles” capability tiles |
| `AioProcessRail` | Horizontal / stacked process steps |
| `AioActionPanel` | Sidebar CTA panel (service detail) |
| `AioRelatedServices` | Compact related-service cards |
| `AioRoadmapFooterCta` | “Get My Roadmap” footer band |
| `AioProgressRing` | Data-driven Road Ready ring (no hardcoded %) |
| `AioJourneyMilestones` | Start My Business vertical journey |

Buttons reuse existing `AIOButton` (`gold`, `outline-gold`).

---

## Visual tokens

Uses existing `.aio-app` CSS variables from `aio.css`:

| Token | Value / usage |
|-------|----------------|
| `--aio-black` | Primary page background |
| `--aio-surface` | Elevated charcoal |
| `--aio-gold` | Accent — eyebrows, CTAs, icons, step numbers |
| White / muted gray | Primary / secondary text |
| Borders | `rgba(255,255,255,0.08)` or gold at 25–45% opacity |
| Radius | `var(--aio-radius)` / `--aio-radius-lg` — restrained, not pill-heavy |

Gold is **accent only** — not full-page fills.

---

## Templates

### ServiceHubTemplate

1. Cinematic hero  
2. Service row directory  
3. Optional children  
4. Roadmap footer CTA  

Used by: `/services` (master hub), division hubs (`/services/permitting`, etc.) desktop.

### ServiceDetailTemplate

1. Compact hero + primary/secondary CTA  
2. What AIO Handles (`AioFeatureGrid`)  
3. Process rail  
4. Requirements + optional timeline block  
5. Related services  
6. Sidebar action panel (pricing, plan, intake — **logic unchanged**)

Used by: individual `/services/:serviceSlug` desktop. Mobile keeps `MobileServiceDetailView`.

### OperationalServiceTemplate

Hero + capabilities + process + audience + optional important note + footer CTA.

Used by: Bookkeeping, Factoring; dispatch/brokerage can adopt via division detail or future pass.

### Journey

`AioJourneySection` on Start My Business — connects to `useStartBusinessJourney` / Road Ready state.

---

## Responsive behavior

- **Mobile:** Existing mobile-specific views preserved (`MobileServiceDetailView`, `MobileDivisionServicesView`, `MobilePortalHome`, portal bottom nav).
- **Desktop:** Page-system layouts use CSS grid with breakpoints at 768px / 1024px.
- **Ultrawide:** Inherits container caps from `aio-large-display.css` (1600px+); content constrained, backgrounds may bleed.

Process rail: multi-column desktop → single column mobile.

---

## Hero system

`AioCinematicHero` supports:

- `compact` — shorter min-height for hub/detail pages  
- `backgroundImage` — optional `--aio-ps-hero-bg` (use approved assets only; document gaps in redesign report)  
- Breadcrumb nav  
- Action row  

Do **not** crop moodboard images into production assets.

---

## Data rules

- Service content from `aioServices`, catalog, pricing config, launch gating  
- Journey progress from Road Ready / demo store — never moodboard percentages  
- Vault categories from `vaultTaxonomy.ts`  
- Bookkeeping prices from `bookkeepingPlans.ts`  

---

## Import

```tsx
import {
  ServiceHubTemplate,
  ServiceDetailTemplate,
  OperationalServiceTemplate,
  AioCinematicHero,
} from '../components/page-system';
```

CSS loaded globally via `App.tsx` → `aio-page-system.css`.

---

*See also:* `docs/redesign/AIO_PAGE_EXPERIENCE_AUDIT.md`, `docs/redesign/AIO_PAGE_REDESIGN_REPORT.md`

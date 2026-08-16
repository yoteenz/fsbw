# Homepage Content Migration Map

**Post-Build Refinement 01** · All In One Enterprises Inc.

Audit date: 2026-08-16

---

## Summary

The public homepage was reduced from **7 stacked sections** (many acting as a vertical sitemap) to **6 purposeful sections + footer**, using progressive disclosure. Valuable content was **relocated**, not deleted.

---

## Section migration

| Current section (pre-refinement) | New destination | Action |
|----------------------------------|-----------------|--------|
| **Hero** (`HeroSection.tsx`) | Homepage | **Refine** — headline → *The business office behind the truck*; CTAs → Start My Business / See How It Works; trust strip below hero |
| **Service Strip** (`ServiceStripSection.tsx`) | — | **Remove from homepage** — redundant with pathway cards; division links remain in Services mega menu + footer |
| **Intent Cards** — “What Are You Looking To Do?” (7 cards) | Homepage pathway grid | **Reorganize** → 6 primary pathways with Explore CTAs |
| **Roadmap Preview** (`RoadmapSection.tsx`) | `/road-ready` + homepage teaser | **Condense** — illustrative ring + category list on homepage; full sample widget on `/road-ready` |
| **Business Progression** — “From formation to freight” (6 steps) | `/start-your-business` | **Move** — full BUILD→ROLL journey |
| **Business Progression** — “After you're rolling” (4 steps) | `/start-your-business` + service routes | **Move** — operate/grow steps + links to dispatch/factoring/brokerage |
| **Platform Preview** — “More than a marketing site” (4 portal panels) | `/client-portal` | **Move** — full multi-module preview; homepage gets single command-center teaser |
| **Trust Section** + sample testimonial | Hero trust strip (qualitative only) | **Condense** — remove fake/sample testimonial from public surfaces |
| **Debug / Sprint language** (footer, sections, banners) | Debug routes only | **Remove from homepage/footer copy** — `AIODebugBanner` unchanged for preview env |

---

## Navigation migration

| Pre-refinement nav | Post-refinement nav | Action |
|--------------------|---------------------|--------|
| Services → `/services` | Services ▾ mega menu | **Restructure** — 4 intent categories mapped to existing routes |
| Get Started | Start Your Business → `/start-your-business` | **Rename + route** |
| Industries → `/about#industries` | About (industries anchor retained) | **Demote** from top nav |
| Resources → `/about#resources` | Resources ▾ dropdown | **Restructure** |
| About Us | About | **Keep** |
| Contact | Contact | **Keep** |
| — | Road Ready™ → `/road-ready` | **Add** top-level |
| Client Login | Client Login | **Keep** |

---

## Routes

| Route | Status |
|-------|--------|
| `/start-your-business` | **Added** — startup journey destination |
| `/road-ready` | **Added** — public Road Ready landing + intake CTA |
| `/client-portal` | **Added** — portal explanation + full preview panels |
| `/get-started` | **Reused** — Road Ready intake (unchanged engine) |
| `/services/*` | **Reused** — all service + division routes |
| `/portal` | **Reused** — authenticated client login |

No duplicate service implementations were created.

---

## Content preserved (not deleted)

- `BusinessProgressionSection.tsx` — logic copied to `StartYourBusinessPage.tsx`; component retained for reference
- `PlatformPreviewSection.tsx` + `AIOPortalPreview.tsx` — used on `/client-portal`
- `RoadmapSection.tsx`, `IntentCardsSection.tsx`, `ServiceStripSection.tsx`, `TrustSection.tsx` — retained in repo; removed from homepage composition only
- `mockRoadmap.ts`, `mockServices.ts` — unchanged data sources

---

## Service activation

Homepage pathway cards and mega menu badges respect `launch/serviceActivationLaunch.ts`:

- **GO** — normal Explore CTA (e.g. dispatch)
- **LIMITED_PILOT** — pilot note on card (e.g. permitting, formation)
- **HOLD / BLOCKED** — Request Info badge in mega menu; cards still link to truthful service pages

No services were marked active when the activation matrix says otherwise.

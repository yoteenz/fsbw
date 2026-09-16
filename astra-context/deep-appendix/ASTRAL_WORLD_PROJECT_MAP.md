# ASTRAL_WORLD_PROJECT_MAP

**Canonical root:** `/home/ubuntu/SITE00`  
**Relevance:** HIGH for Astra Test 01 unless marked LOW.

---

## ROOT / DOCS

| Path | Purpose | Status | Astra |
|------|---------|--------|-------|
| `docs/projects/astral-world/PROJECT_BIBLE.md` | Compiled truth state | AWAITING_JUDGMENT | HIGH |
| `docs/projects/astral-world/REFERENCE_FIDELITY.md` | Reference doctrine + convergence | ACTIVE | HIGH |
| `docs/projects/astral-world/EXPERIENCE_PROTOTYPE.md` | P0.E.1 shell + routes | ACTIVE | HIGH |
| `docs/projects/astral-world/FAST_TRACK_PRODUCT_MODEL.md` | Product thesis | PROTOTYPE | HIGH |
| `docs/projects/astral-world/SOCIAL_PRESENCE.md` | Presence spec | PROTOTYPE | MED |
| `docs/projects/astral-world/DESTINATION_BEHAVIOR.md` | Destination logic | ACTIVE | MED |
| `docs/projects/astral-world/TAKE_ME_SOMEWHERE.md` | Router doc | ACTIVE | HIGH |
| `docs/projects/astral-world/WORLD_HIERARCHY.md` | Structure | UNRESOLVED | HIGH |
| `docs/projects/astral-world/references/*` | REFERENCE A/B PNG | APPROVED | HIGH |
| `docs/audits/SITE00_ASTRAL_WORLD_*` | Sprint audits | HISTORICAL | LOW–MED |

---

## ROUTES

| Path | Purpose | Status | Astra |
|------|---------|--------|-------|
| `shared/site00-astral-world/routes.ts` | Base URLs | LIVE | HIGH |
| `src/site00/astral-world/pages/AstralWorldExperienceRouter.tsx` | Route tree | LIVE | HIGH |
| `src/site00/pages/ProjectAstralWorldExperiencePage.tsx` | Gate | LIVE | MED |
| `src/site00/pages/ProjectAstralWorldFastTrackPage.tsx` | Fast track entry | LIVE | MED |
| `shared/site00-astral-world/scenes/immersiveRoutes.ts` | Immersive detection | LIVE | MED |

---

## COMPONENTS (entry-focused)

| Path | Purpose | Status | Astra |
|------|---------|--------|-------|
| `.../pages/AstralWorldHomePage.tsx` | Home route | LIVE | HIGH |
| `.../scenes/MobileArrivalScene.tsx` | Scene 01 router | LIVE | HIGH |
| `.../scenes/AwD01WorldEntryScreen.tsx` | Desktop entry | LIVE | HIGH |
| `.../scenes/AwM01WorldEntryScreen.tsx` | Mobile entry | LIVE | HIGH |
| `.../overlays/WhosHereWorldOverlay.tsx` | Who's Here | LIVE | HIGH |
| `.../overlays/TakeMeSomewhereWorldOverlay.tsx` | TMS overlay | LIVE | HIGH |
| `.../AstralWorldExperienceShell.tsx` | App shell | LIVE | MED |
| `.../immersive/CanonicalScreenStage.tsx` | Stage math | LIVE | HIGH |
| `DesktopHomeReferenceLayout.tsx` | Legacy ref home | STALE for entry | LOW |
| `MobileHomeReferenceLayout.tsx` | Legacy ref home | STALE for entry | LOW |

---

## STATE MODULES

| Path | Purpose | Status | Astra |
|------|---------|--------|-------|
| `context/AstralWorldContext.tsx` | React state hub | LIVE | HIGH |
| `shared/.../fixtureService.ts` | Demo data | PROTOTYPE | MED |
| `shared/.../presenceService.ts` | Presence ops | PROTOTYPE | MED |
| `shared/.../takeMeSomewhereRouter.ts` | TMS routes | LIVE | HIGH |
| `shared/.../takeMeSomewhereContextEngine.ts` | TMS copy | LIVE | MED |

---

## SCREEN MASTERS / ASSETS

| Path | Purpose | Status | Astra |
|------|---------|--------|-------|
| `shared/.../screen-masters/awD01LayeredAssets.ts` | D01 geometry | LIVE | HIGH |
| `shared/.../screen-masters/awM01LayeredAssets.ts` | M01 geometry | LIVE | HIGH |
| `public/astral-world/screen-masters/**` | PNG/JPG masters | APPROVED | HIGH |
| `public/astral-world/bg-*-cinematic.png` | Runtime crops | INTERIM | MED |
| `shared/.../referenceAssets.ts` | Reference registry | LIVE | MED |
| `shared/.../generation/*` | FAL contracts | PIPELINE | LOW for Test 01 |

---

## API / DATA MODELS

| Path | Purpose | Status | Astra |
|------|---------|--------|-------|
| `api/site00/astral-world-*.ts` | Assets, reader account | PARTIAL | LOW |
| `supabase/migrations/20260826220000_site00_astral_reader_accounts.sql` | Reader accounts | SCHEMA | LOW |
| `shared/.../readerAccount/*` | Avatar library | IN PROGRESS | LOW |

---

## TESTS

| Path | Purpose | Astra |
|------|---------|-------|
| `tests/astralWorldExperienceP0E1.test.ts` | Core experience | MED |
| `tests/astralWorldFt52*.test.ts` | Layered entry replication | HIGH |
| `tests/astralWorldFt32InteractionLanguage.test.ts` | Interaction language | MED |

---

## FSBW WORKSPACE

| Path | Purpose | Status | Astra |
|------|---------|--------|-------|
| `/workspace/astra-context/` | This pack | NEW | HIGH |
| `/workspace/src/site00/` | SITE 00 in monorepo | No astral-world subtree at audit | N/A |

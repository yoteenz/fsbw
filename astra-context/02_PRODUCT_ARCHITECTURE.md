# Product Architecture — Astral World (SITE 00)

**Repo root:** `/home/ubuntu/SITE00` (canonical). **FSBW workspace:** no parallel `src/site00/astral-world` copy at audit.

---

## Entry routes

| Surface | Base path | Mode |
|---------|-----------|------|
| Experience (founder preview) | `/projects/astral-world/experience` | `experience` |
| Fast Track prototype | `/projects/astral-world/debug/world` | `fast-track` |

**Landing (Test 01 target):**

- `/projects/astral-world/experience/home`
- `/projects/astral-world/debug/world/home`

Defined in `shared/site00-astral-world/routes.ts`.

---

## Route tree (experience)

```
home                          → World entry (SCENE 01 Arrival)
astrea                        → District hub scene
astrea/tarot-suite            → Tarot Suite interior
astrea/astral-mall            → Mall + kiosk hotspots
astrea/coffee-shop            → Coffee Shop + Join Her Table
readers                       → Find My Reader (world-native discovery)
friends                       → Meet My Friends
journal                       → Journey artifact
profile                       → Avatar / account surface
daily-card, custom-avatar, join-circle, create-deck, notification-demo
```

Router: `src/site00/astral-world/pages/AstralWorldExperienceRouter.tsx`  
Gate: `src/site00/pages/ProjectAstralWorldExperiencePage.tsx` (slug + capability).

---

## Shell & viewport

| Viewport | Behavior |
|----------|----------|
| **Desktop** ≥1024px | Layered canonical stage **AW_D_01_WORLD_ENTRY** (`AwD01WorldEntryScreen`) |
| **Mobile** <1024px | Layered canonical stage **AW_M_01_WORLD_ENTRY** (`AwM01WorldEntryScreen`) |

Hook: `useAstralViewport.ts` (1024px breakpoint).

Legacy **P0.E.1** layouts (`DesktopHomeReferenceLayout`, `MobileHomeReferenceLayout`) still exist for reference convergence tests but **home** uses `MobileArrivalScene` → D01/M01 layered screens (FT5.2).

Shell: `AstralWorldExperienceShell.tsx` — scene transitions, optional debug panel (`?debug=1`).

---

## State & data (prototype)

| Concern | Location |
|---------|----------|
| React context | `src/site00/astral-world/context/AstralWorldContext.tsx` |
| Fixtures | `shared/site00-astral-world/fixtures.ts`, `fixtureService.ts` |
| Presence | `shared/site00-astral-world/presenceService.ts` |
| Take Me Somewhere | `takeMeSomewhereRouter.ts`, `takeMeSomewhereContextEngine.ts` |
| Types | `shared/site00-astral-world/types.ts` |

**Persistence:** Local React state + fixtures — **not** production Supabase for client session (reader accounts migration exists for reader identity layer).

---

## Backend touchpoints (SITE 00 API)

- `api/site00/astral-world-assets.ts`
- `api/site00/astral-world-reader-account.ts`
- `api/site00/astral-world-avatar-library.ts`
- `api/admin/site00-astral-world-generation.ts`
- Supabase: `20260826220000_site00_astral_reader_accounts.sql`

FAL / generation manifests under `shared/site00-astral-world/generation/*`.

---

## Tests (regression signal)

~**148+** Vitest files matching `astralWorld*.test.ts` — routing, Take Me Somewhere, layered replication, interaction language, reader account.

---

## Styling

- `src/site00/astral-world/styles/astral-world.css`
- Typography: Cinzel / Cormorant / Inter (celestial gold system) — **not** Frontal Slayer Futura/red.

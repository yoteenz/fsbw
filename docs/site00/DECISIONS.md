# SITE 00 — Unresolved Product Decisions

Discovered during Foundation V1.1 implementation. **Do not guess** — create extension points until founder decides.

## Routing & deployment

| Decision | Status | Notes |
|----------|--------|-------|
| Production domain for SITE 00 | Unresolved | Do not hardcode; use env config |
| `/` vs `/origin` on production | Partial | `VITE_SITE00_ROOT=1` flag; dedicated domain TBD |
| Coexistence with Frontal Slayer on same deploy | Decided | FS keeps `/` by default; SITE 00 at `/origin` |

## Navigation & content

| Decision | Status | Notes |
|----------|--------|-------|
| Final ENTER 00 directory labels/groupings | Provisional | Data-driven; reference not final |
| SITES / SERVICES / SYSTEM / ABOUT / JOURNAL page content | Not designed | Nav disabled until inventory sprint |
| Services catalog copy vs IDNTY/BLDR overlap | Principle established | Catalog vs action — pages TBD |

## Business logic

| Decision | Status | Notes |
|----------|--------|-------|
| Exact pricing values | Provisional | Centralized in config; editable |
| Payment schedules, refunds, revision counts | Not defined | Extension points only |
| Enterprise pricing formulas | Not defined | |
| Option D pricing (Hybridize / Recalibrate) | Not defined | Types prepared |
| Support SLAs, maintenance subscriptions | Not defined | |
| Status strip metrics (047 sites, 12 builds) | Placeholder | Not live data |

## Workflow downstream

| Decision | Status | Notes |
|----------|--------|-------|
| IDNTY assessment after state selection | Not built | Selection stored in context |
| BLDR discovery questionnaire | Not built | "NOT SURE?" card selects class only |
| BLUPRNT direction screen set per project type | Not defined | |
| BUILD production stage granularity | Types only | |
| CTRL ROOM authenticated features | Architecture only | |
| Auth provider / YOUR SPACE personalization | Extension point | |

## Creative direction

| Decision | Status | Notes |
|----------|--------|-------|
| IDNTY direction presentation format | Not built | A/B/C + Option D architecture prepared |
| BLUPRNT representative screen sets | Not defined | |
| No-Frankenstein enforcement in UI | Rule documented | Hybridize path not built |

## Visual production

| Decision | Status | Notes |
|----------|--------|-------|
| Production environment assets (3 families) | **Required** | See ASSETS.md gap report |
| Isolated wireframe object assets | **Required** | |
| Dedicated mobile compositions | **Required** | No approved mobile refs |
| Exact SITE 00 red hex value | Derived | `--site-red: #e8192c` — verify against final brand spec |

## Technical

| Decision | Status | Notes |
|----------|--------|-------|
| Supabase schema for Site00Project | Not migrated | Type definition only |
| Real backend for status strip metrics | Not built | |
| Guidance panel / Build Guide action | Button present | Destination TBD |

## Canon rule

When implementing any of the above, update this file and BIBLE.md. Flag conflicts — do not silently resolve.

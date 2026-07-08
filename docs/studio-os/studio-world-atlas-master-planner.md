# Studio World Atlas™ — Master Planner™ (Phase 3)

**Route:** `/admin/studio/world-atlas` → **MASTER PLANNER™** mode  
**Philosophy:** Plan intentionally before generating. Generation is the final step.

## Master Planner Mode™

When **MASTER PLANNER™** or **FUTURE VISION™** is active, the holographic table becomes a future planning surface:

- Existing buildings remain visible
- Reserved land appears as dashed planned extrusions
- Potential roads render as gold dashed paths
- Expansion zone overlay pulses across the table
- Construction overlays show project phases

## Reserve Land™

Founders reserve areas before construction:

- Future Headquarters™ · Innovation District™ · Research Campus™
- Marketplace Pavilion Expansion™ · Creative Campus™
- Customer Experience Center™ · Training Academy™

Land stays reserved until the founder advances the planning pipeline.

## Planning pipeline (Construction Phases™)

| Phase | Label |
|-------|--------|
| 1 | Vision™ |
| 2 | Reserved Land™ |
| 3 | Concept Blueprint™ |
| 4 | Approved Blueprint™ |
| 5 | Construction™ |
| 6 | Interior Assembly™ |
| 7 | Commissioning™ |
| 8 | Grand Opening™ |
| 9 | Operational™ |

Use **ADVANCE PHASE →** on a selected reservation to progress without generating assets.

## District Planning™

- **Drag** planned buildings on the table to reposition districts
- Add **Plaza**, **Transit Hub**, **Skybridge**, **Observation Tower**
- Potential roads connect reserved land to the campus anchor

## Simulation Mode™

**RUN SIMULATION MODE™** answers before generation:

- Navigation impact · crowd risk · entrance recommendations
- Placement score (0–100)
- AI traffic · walking distance · discoverability · expansion fit

Results persist in `lastSimulations` per plan.

## Creative Budget Integration™

Each reservation shows:

- Estimated generation + construction cost
- Creative Budget impact %
- Reuse opportunities · projected Creative Equity · Marketplace value

## World Forecast™

Horizons: **1 · 3 · 5 · 10 years** — projected building/district counts and narrative milestones.

## Expansion Recommendations™

Proactive campus growth suggestions (Marketing HQ capacity, Blueprint Wing, Marketplace hall, Operations Wing).

## Future Vision™

**+ FUTURE VISION™ CONCEPT** creates sketch districts (e.g. Prototype District™, Experimental Headquarters™) with **no generation** until approved.

## Studio Orb™ — Master Planner

In planning mode, the Orb advises placement, expansion, architectural balance, simulation, budget, and forecast.

## Core modules

`src/studio-os-core/studio-world-atlas/`

- `master-planner.ts` — reserve land, features, vision concepts, road paths
- `master-planner-phases.ts` — 9-phase pipeline
- `master-planner-simulation.ts` — Simulation Mode™
- `master-planner-budget.ts` — Creative Budget estimates
- `master-planner-forecast.ts` — World Forecast™
- `master-planner-expansion.ts` — Expansion Recommendations™
- `master-planner-orb.ts` — Orb as campus architect

**Storage:** `studioWorldAtlasDiscovery_v3` (migrates v2)

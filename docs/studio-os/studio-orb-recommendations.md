# Studio Orb™ — Orb Recommendations™ (Proactive Intelligence Layer)

**Philosophy:** The founder should not have to think about where to go next. The Orb evolves from guide to **Executive Chief of Staff**.

## The Daily Brief™

On first Studio World entry each session (`/admin/studio/*`), the Orb greets the founder with:

- Time-aware greeting (Good morning / afternoon / evening)
- Overnight generations · pending approvals · cost-saving discoveries
- Golden Builds · Blueprint updates · high-priority recommendation count

Dismiss with **ENTER STUDIO WORLD →**.

## Orb Recommendations Panel

Open via Studio Orb radial menu → **Daily Brief** (🔔), or the recommendations surface.

Each recommendation displays:

| Field | Description |
|-------|-------------|
| Priority | critical · high · medium · low |
| Estimated Impact | transformative · high · moderate · low |
| Estimated Time | Minutes |
| Estimated Cost | Generation / construction estimate |
| Potential Savings | Reuse or budget % when applicable |
| Departments Affected | Cross-department scope |
| Creative Equity Gained | Projected equity |
| Reasoning | **Why** this was recommended |
| Confidence Score | 0–100 |

## Focus Modes™

| Mode | Behavior |
|------|----------|
| Executive Mode™ | Mission-critical only |
| Creative Mode™ | Inspiration and creative opportunities |
| Builder Mode™ | Generation and construction |
| Explorer Mode™ | Discoveries and hidden areas |
| Growth Mode™ | Expansion opportunities |
| Launch Mode™ | Shipping and execution |

Stored in `studioOrbRecommendations_v1` per organization.

## The Executive Journey™

Prepared optimal route (accept or customize per stop):

Executive Atrium™ → Marketing Headquarters™ → Campaign Studio™ → Creative Direction Studio™ → Story Table™ → Studio Archives™ → Marketplace Pavilion™ → Executive Atrium™

Journey adapts to Focus Mode (e.g. Explorer adds Atlas; Builder adds Asset Factory).

## Surprise Discoveries™

Thoughtful delights — forgotten Blueprints, Warehouse environments, seasonal landmarks, overnight milestones. Surfaced via Explorer Mode or low-frequency rotation.

## World Integration (Atlas)

On **Studio World Atlas™**:

- Recommended buildings **glow** (`has-orb-glow`)
- Surprise destinations **pulse** (`has-orb-pulse`)
- Pending approvals show **beacons** (`has-orb-beacon`)
- Executive Journey routes render as **gold dashed paths** (`is-orb-journey`)

Orb sidebar title becomes **CHIEF OF STAFF** with proactive recommendation cards.

## Engine modules

```
src/studio-os-core/orb-recommendations/
├── types.ts
├── constants.ts
├── personalization-store.ts
├── context-collector.ts
├── daily-brief.ts
├── recommendation-engine.ts
├── surprise-discoveries.ts
├── executive-journey.ts
├── focus-modes.ts
├── atlas-world-signals.ts
└── index.ts
```

**Hook:** `useStudioOrbRecommendations`  
**UI:** `StudioOrbDailyBriefOverlay` · `StudioOrbRecommendationsPanel`

## Intentional boundaries

Recommendation scores and company signals are **heuristic/demo** layers synthesized from Organization Pulse, Executive Council, Blueprint progress, and Atlas discovery — not yet wired to live Creative Budget, Asset Registry, or Marketplace APIs.

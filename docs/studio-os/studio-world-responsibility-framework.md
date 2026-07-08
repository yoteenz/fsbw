# Studio World Responsibility Framework™

**Status:** Canonical law — July 2026  
**Scope:** Permanent flagship missions, exclusive responsibilities, pipeline handoffs, Orb personalities.  
**Engine:** `src/studio-os-core/studio-world/responsibility-framework.ts`

---

## Core Law

Every flagship destination has **ONE primary mission**.

- No overlap
- No duplicate functionality
- Every building answers: *"What happens here that cannot happen anywhere else?"*

Studio World™ is the ecosystem. No destination competes with another. Every destination hands work to the next.

---

## Seven Flagships

| Flagship | Mission | Success phrase | Output |
|----------|---------|----------------|--------|
| **Creative Direction Studio™** | Imagine · Invent · Explore · Direct | I create ideas here. | Approved creative vision (not assets) |
| **Studio Warehouse™** | Manufacture · Assemble · Reuse · Produce | I manufacture ideas here. | Reusable building blocks |
| **Studio Archives™** | Remember · Preserve · Teach · Celebrate | I preserve ideas here. | Institutional memory |
| **Marketplace™** | Share · Exchange · License · Monetize | I share ideas here. | Licensed distribution |
| **Command Center™** | Operate · Observe · Coordinate | I oversee everything here. | Orchestration intelligence |
| **Headquarters™** | Execute · Operate · Grow | I run my company here. | Business execution |
| **Expedition Hub™** | Transform · Guide · Coach | I transform my company here. | Guided journeys |

---

## The Pipeline

```
Founder Intent™
    ↓ Imagine      Creative Direction Studio™
    ↓ Evaluate     Future Tournament™
    ↓ Refine       Future Merge™
    ↓ Approve      Concept Approval™
    ↓ Manufacture  Studio Warehouse™
    ↓ Build        Scene Assembly™
    ↓ Complete     Golden Build™
    ↓ Preserve     Studio Archives™
    ↓ Share        Marketplace™
    ↓ Execute      Headquarters™
    ↓ Learn        Studio World™ (Command Center™)
```

---

## Forbidden Actions (by flagship)

| Flagship | Never does |
|----------|------------|
| Creative Direction Studio™ | Manufacture · Archive · Sell |
| Studio Warehouse™ | Invent · Archive permanently · Sell |
| Studio Archives™ | Generate · Manufacture · Sell |
| Marketplace™ | Generate · Create · Manufacture |
| Command Center™ | Create · Manufacture · Archive · Sell |
| Headquarters™ | Invent vision · Manufacture assets · Archive Golden Builds · List on Marketplace |
| Expedition Hub™ | Replace flagship missions · Duplicate production or archives |

---

## Studio Orb™ Personalities

Same Orb. Different expertise.

| Destination | Orb role |
|-------------|----------|
| Creative Direction Studio™ | Creative Director |
| Studio Warehouse™ | Production Supervisor |
| Studio Archives™ | Historian |
| Marketplace™ | Curator |
| Headquarters™ | Executive Assistant |
| Command Center™ | Chief of Staff |
| Expedition Hub™ | Coach |

Resolver: `src/studio-os-core/studio-world/orb-personality.ts`

---

## Canonical World Paths

| Flagship | World entry | Legacy (preserved) |
|----------|-------------|-------------------|
| Command Center™ | `/admin/studio/world/command-center` | `/admin/studio/overview` |
| Creative Direction Studio™ | `/admin/studio/world/creative-direction-studio` | `/admin/studio/department/creative-direction` |
| Studio Warehouse™ | `/admin/studio/world/warehouse` | `/admin/studio/studio-warehouse` |
| Studio Archives™ | `/admin/studio/world/archives` | `/admin/studio/studio-archives` |
| Marketplace™ | `/admin/studio/world/marketplace` | `/admin/studio/marketplace` |
| Headquarters™ | `/admin/studio/world/headquarters` | `/admin/headquarters` |
| Expedition Hub™ | `/admin/studio/world/expedition-hub` | `/admin/studio/expansion-center` |

---

## Validation

```typescript
import { auditResponsibilityOverlap, assertFeatureBelongsToFlagship } from 'src/studio-os-core/studio-world';

auditResponsibilityOverlap(); // should return []
assertFeatureBelongsToFlagship('asset-registry', 'studio-warehouse'); // ok
assertFeatureBelongsToFlagship('asset-registry', 'studio-archives'); // violation
```

---

## Related docs

- [STUDIO_WORLD_ARCHITECTURE_V4.md](./STUDIO_WORLD_ARCHITECTURE_V4.md) — physical taxonomy and routing
- [studio-world-constitution.md](./studio-world-constitution.md) — permanent governance and Constitution Review™
- [creative-direction-studio-parallel-futures-integration.md](./creative-direction-studio-parallel-futures-integration.md) — vision pipeline through Concept Approval™

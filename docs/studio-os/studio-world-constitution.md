# Studio World Constitution™

**Status:** Canonical governance — July 2026  
**Chamber:** Constitution Hall™ · Command Center™  
**Route:** `/admin/studio/constitution-hall`  
**Engine:** `src/studio-os-core/studio-world-constitution/`

---

## Mission

Studio World should never drift back toward traditional software. The Constitution™ is the permanent operating framework that preserves philosophy, architecture, responsibilities, and evolution for years to come.

Every future feature, room, department, headquarters, AI engine, Blueprint, Expedition, Marketplace asset, and workflow must comply before entering Studio World.

---

## Constitution Hall™

A monumental architectural chamber — not settings, not documentation. Governing principles are maintained here as live law.

- **UI:** `src/components/admin/studio/constitution-hall/ConstitutionHallRoom.tsx`
- **Orb:** Keeper of Studio World — explains principles, evolution, and fit

---

## Eight Foundational Laws

| # | Law | Enforcement |
|---|-----|-------------|
| 1 | Everything Belongs Somewhere™ | No owner → cannot build |
| 2 | One Mission Per Destination™ | Overlap → Constitution flags |
| 3 | Everything Is Architecture™ | Reject page-first thinking |
| 4 | Everything Is Connected™ | Campus continuity required |
| 5 | Reuse Before Generation™ | Search Registry / Archive / Genome first |
| 6 | Plan Before Build™ | Never skip planning pipeline |
| 7 | The Founder Remains Creative Director™ | No AI auto-override |
| 8 | Studio World Learns™ | Every decision improves the platform |

Canon text: `src/studio-os-core/studio-world-constitution/laws.ts`

---

## Constitution Review™

Before implementation, run `runConstitutionReview(proposal)`:

```typescript
import { runConstitutionReview } from 'src/studio-os-core/studio-world-constitution';

const result = runConstitutionReview({
  name: 'Talent Scheduling Observatory',
  description: 'Immersive room in Operations Headquarters for casting calendar coordination.',
  proposedFlagshipId: 'headquarters',
  proposedPhysicalType: 'observatory',
});
```

### Review questions (automatic)

1. Which building owns it?
2. Does it duplicate another system?
3. Does it violate destination responsibilities?
4. Does it belong architecturally?
5. Does it require Scene Stack™?
6. Does it strengthen Studio World philosophy?
7. Should it become a room instead?
8. Should it become an Expedition?
9. Should it become a Blueprint?

---

## Constitution Score™

| Dimension | Weight |
|-----------|--------|
| Architecture Score™ | 12% |
| Mission Alignment™ | 14% |
| World Continuity™ | 10% |
| Reuse Score™ | 8% |
| Creative Alignment™ | 10% |
| Scalability™ | 8% |
| Maintainability™ | 8% |
| Immersion™ | 15% |
| Experience™ | 15% |

**Overall Constitution Compliance™** — threshold **70%**. Below threshold → recommend redesign.

Reviews persist in `studioOsStudioWorldConstitution_v1`.

---

## Integration

- **Responsibility Framework™:** `assertFeatureBelongsToFlagship`, `FLAGSHIP_RESPONSIBILITY_LAWS`
- **Architecture Auditor™:** complementary guardian for webpage detection and Scene Stack™
- **Orb:** `resolveOrbPersonalityForPath` returns Keeper in Constitution Hall™

---

## Related docs

- [studio-world-responsibility-framework.md](./studio-world-responsibility-framework.md)
- [STUDIO_WORLD_ARCHITECTURE_V4.md](./STUDIO_WORLD_ARCHITECTURE_V4.md)

---

## Final philosophy

Most software grows by accumulating features. Studio World grows by expanding a civilization. **Nothing enters without earning its place.**

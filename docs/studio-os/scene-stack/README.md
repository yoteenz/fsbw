# Scene Stack™

**Golden Build™ Layered Environment Architecture**

**Version:** 1.0.0  
**Status:** Canonical — supersedes single-image Scene Genesis™  
**Scope:** Every department environment in Studio World™

---

> **Studio OS NEVER generates complete scenes as a single image.**

---

## Mission

Every department environment is **assembled** through a layered **Scene Stack™**.

Each layer is independently:

- Generatable
- Approvable
- Regeneratable
- Versioned
- Replaceable

Dislike the lighting? Regenerate **only** the Lighting Layer™.  
The room shell remains intact.

**Isolated layer contract (2026-07-12):** `signature-landmark` and `furniture-objects` must deliver transparent PNG object plates — never full-scene rerenders. See **`docs/studio-os/creative-production/ISOLATED_LAYER_GENERATION_CONTRACT.md`**.

---

## The 10 Layers

| # | Layer | Owner | Generatable |
|---|-------|-------|-------------|
| 01 | **Environment Shell™** | FAL | Architecture only |
| 02 | **Signature Landmark™** | FAL | Department hero object |
| 03 | **Furniture & Physical Objects™** | FAL | Props · workstations |
| 04 | **Lighting Systems™** | FAL | Light rigs · pools |
| 05 | **Atmospheric Systems™** | FAL | Haze · depth · particles |
| 06 | **Surface Materials & Detail™** | FAL | Bronze · stone · glass |
| 07 | **Ambient Motion™** | FAL | Idle life motion pass |
| 08 | **Interaction Layer™** | **Cursor** | Hotspots · forms · Orb UI |
| 09 | **Runtime Effects™** | **Cursor** | State · animation · vignette |
| 10 | **Founder Personalization™** | FAL | Genome-adapted expression |

**Layers 01–07, 10:** FAL via Golden Build™ pipeline  
**Layers 08–09:** Cursor only — **never** faux architecture in HTML/CSS

---

## Document Index

| Document | Contents |
|----------|----------|
| [scene-stack.md](./scene-stack.md) | Master specification |
| [layer-architecture.md](./layer-architecture.md) | Layer definitions · isolation rules |
| [golden-build-pipeline.md](./golden-build-pipeline.md) | Generation · approval · composition |
| [regeneration-system.md](./regeneration-system.md) | Per-layer regen · versioning |
| [cursor-boundary.md](./cursor-boundary.md) | What Cursor must never do |
| [department-composition.md](./department-composition.md) | Station stacks · CDS pilot |
| [future-roadmap.md](./future-roadmap.md) | Implementation phases |

---

## Relationship to Prior Canon

| Prior | Scene Stack™ relationship |
|-------|---------------------------|
| Scene Genesis™ (single plate) | **Superseded** — migrated to layered stack |
| Environmental Pass V1 (CSS architecture) | **Forbidden** for visual layers |
| Architectural Icons™ | Layer 02 = Signature Landmark™ |
| Creative Approval Pipeline™ | Per-layer approval extends pipeline model |

---

## Implementation (CDS Pilot)

- `src/studio-os-core/scene-stack/`
- `useSceneStack` hook
- `SceneStackViewport` compositor
- **V3:** [Creative Intelligence Engine™](../creative-intelligence-engine/README.md) — CDS proving ground for generated workspace scenes
- Route: `/admin/studio/department/creative-direction`

---

## Final Law

**Golden Build™ produces layered environments — not images.**

**Cursor begins only after visual layers exist.**

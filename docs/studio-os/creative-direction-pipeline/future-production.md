# Future Production™

**Migration · implementation phases · integration map**

---

## Purpose

Roadmap for implementing Creative Direction Pipeline™ — replacing Creative Approval Pipeline™ philosophy without building UI or new engines in this sprint.

---

## What This Sprint Did

| Deliverable | Status |
|-------------|--------|
| `docs/studio-os/creative-direction-pipeline/` (13 documents) | ✅ |
| Vision-first production philosophy | ✅ |
| Scene Blueprint™ as production truth | ✅ |
| Migration map from Creative Approval Pipeline™ | ✅ |
| CORE.md · MEMORY.md update | Pending commit |

---

## What This Sprint Did NOT Do

| Excluded | Reason |
|----------|--------|
| React · UI components | User instruction |
| New engines | Platform freeze |
| Modify `studio-builder/` code | Philosophy sprint only |
| Delete Creative Approval Pipeline™ code | Migration gated on implementation |

---

## Migration: Creative Approval Pipeline™ → Creative Direction Pipeline™

### Preserved (Evolve in Place)

| Component | Current location | Future role |
|-----------|------------------|-------------|
| `pipeline-definition.ts` | `studio-builder/` | Refinement stages · not asset stages |
| `approval-pipeline-store.ts` | `studio-builder/` | Vision + refinement state |
| `creative-review.ts` | `studio-builder/` | Refinement Braintrust gate |
| `director-feedback.ts` | `studio-builder/` | Natural language parsing |
| `directors-notes-store.ts` | `studio-builder/` | Persistent creative notes |
| `useCreativeApprovalPipeline` | `hooks/` | → `useCreativeDirectionPipeline` |
| `CreativeReviewPanel` | `components/` | Refinement review UI |
| FAL generation API | `api/_lib/studioBuilderGeneration.ts` | Concept + node generation |

### Replaced (Philosophy)

| Old | New |
|-----|-----|
| 10 production group stages | Vision lock → refinement nodes |
| Per-group Generate → Approve → Unlock | Concept A/B/C → Select → Tap refine |
| `production-groups.json` queue order | Asset Graph™ dependency order |
| Asset-first founder UX | Vision-first founder UX |

### New Concepts (To Implement)

| Concept | Priority |
|---------|----------|
| Scene Blueprint™ schema + co-generation | P0 |
| Concept generation (3 environments) | P0 |
| Vision lock state | P0 |
| Asset Graph™ from blueprint | P1 |
| Tap-to-refine interaction | P1 |
| Director Feedback™ NL parser | P1 |
| Background Intelligence™ orchestration | P2 |
| Blueprint version history | P2 |

---

## Implementation Phases

### Phase 1 — Vision Layer

| Work | Depends on |
|------|------------|
| Creative Brief™ capture UI in room | Living Mood Wall™ · Inspiration |
| Creative Direction™ lock | Existing genome hooks |
| 3-concept generation endpoint | Prompt Compiler™ · FAL |
| Scene Blueprint™ co-generation | New schema · LLM structured output |
| Founder vision selection UX | Spatial concept presentation |

### Phase 2 — Deconstruction Layer

| Work | Depends on |
|------|------------|
| Reverse Engineering™ from blueprint | Scene Blueprint™ schema |
| Asset Graph™ construction | Graph store |
| Dependency edge mapping | Blueprint relationships |
| Migrate `production-groups.json` → derived from graph | Asset manifest |

### Phase 3 — Refinement Layer

| Work | Depends on |
|------|------------|
| Tap-to-select node in room | Department Runtime™ hit targets |
| Director Feedback™ voice/text | `director-feedback.ts` evolution |
| Surgical node regeneration | Generation Manager™ |
| Creative Review™ per refinement | Existing `creative-review.ts` |
| Background Intelligence™ | Parallel job prep |

### Phase 4 — Persistence & Golden Build™

| Work | Depends on |
|------|------------|
| Blueprint · graph versioning | World Persistence™ |
| Project Genome™ creative memory | Existing project-genome |
| Golden Build™ certification from graph | Production Lifecycle™ |
| Walk the Room™ on approved vision | Existing spec |

---

## Updated Production Stack

```
FOUNDER
  Creative Brief™ · Vision Selection · Tap-to-Refine · Director Feedback™
        ↓
CREATIVE DIRECTION PIPELINE™ (this spec)
  Concepts · Scene Blueprint™ · Asset Graph™ · Refinement
        ↓
EXISTING ENGINES (unchanged)
  Prompt Compiler™ · Generation Manager™ · Validation Loop™
  Department Runtime™ · Registry™ · Studio World™
        ↓
GOLDEN BUILD™ → CERTIFIED™ → LIVE™
```

---

## Documentation Updates Required (On Implementation)

| Document | Update |
|----------|--------|
| [production/README.md](../production/README.md) | Cross-reference Creative Direction Pipeline™ |
| [creative-production-pipeline.md](../production/creative-production-pipeline.md) | Stage 01–03 vision-first notes |
| [alpha/studio-builder/README.md](../alpha/studio-builder/README.md) | Replace queue-first with vision-first |
| [alpha/studio-builder/production-flow.md](../alpha/studio-builder/production-flow.md) | New orchestration chain |
| CORE.md Alpha Sprint 001 line | Note pipeline evolution |

---

## Open Questions

| Question | Options |
|----------|---------|
| Concept generation provider | Single image vs multi-pass assembly |
| Blueprint generation | LLM structured JSON vs template fill |
| Graph store location | Extend pipeline store vs new graph store |
| Tap hit targets in alpha | Invisible zones vs visible on inspect mode |
| Minimum nodes before Golden Build™ | Hero + Orb + shell vs full 35 |
| Existing in-progress pipelines | Migrate vs fresh start per project |

---

## Success Validation

| Test | Pass criteria |
|------|---------------|
| Founder sentiment | "Directing headquarters" not "generating assets" |
| Vision selection | 3 concepts with blueprints in <5 min |
| Refinement | Single node change without full regen |
| Blueprint authority | Reverse engineering never pixel-only |
| Persistence | Refresh preserves vision + refinements |
| Braintrust | Every refinement gated · vision selection not gated |

---

## Final Note

Creative Direction Pipeline™ is the production philosophy Studio OS should have started with.

The implemented Creative Approval Pipeline™ was the right **alpha step** — it proved generation · review · and persistence.

Creative Direction Pipeline™ is the **production maturity step** — vision first · surgical refinement · blueprint truth.

> Studio OS does not build rooms. Studio OS develops visions.

---

## Cross-References

- [README.md](./README.md)
- [creative-direction-pipeline.md](./creative-direction-pipeline.md)
- [Creative Approval Pipeline™](../../src/studio-os-core/studio-builder/pipeline-definition.ts)
- [future-production-roadmap.md](../production/future-production-roadmap.md)

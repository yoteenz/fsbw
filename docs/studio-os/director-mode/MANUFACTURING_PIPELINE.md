# Manufacturing Pipeline

After founder approval, every creative object follows the same manufacturing pipeline.

## Canonical order

```
Blueprint (approved)
    ↓
Construction Plan
    ↓
Asset DNA + Render Intent
    ↓
Job Queue / Manufacturing Queue
    ↓
AI Factory Workers
    ↓
Manufacturing Inspection
    ↓
Quality Guard
    ↓
Immune System
    ↓
Scene Stack / Assembly
    ↓
Living World
```

## Director Mode rules

1. **Workers never improvise.** Each worker receives Render Intent — not prompts.
2. **Jobs are bounded.** Workers know only their assigned object.
3. **Inspection is per-object.** Not per-room, not per-scene.
4. **Failures are classified.** Not "generation failed."
5. **Repairs are targeted.** Background removal, silhouette adjust — not full regen by default.

## Shipped foundation (Documented Fact)

| Stage | Module | Location |
|-------|--------|----------|
| Construction Plan | Blueprint Author | `src/studio-os-core/blueprint-author/` |
| Asset DNA | Manufacturing Engine | `src/studio-os-core/manufacturing-engine/asset-dna.ts` |
| Render Intent | Manufacturing Engine | `src/studio-os-core/manufacturing-engine/render-intent.ts` |
| Job Queue | Blueprint Author + Manufacturing Engine | job-queue, manufacturing-queue |
| Workers | AI Factory Workers | `ai-factory-workers.ts` |
| Inspection | Manufacturing Inspection | `manufacturing-inspection.ts` |
| Quality Guard | Quality Guard Evolution | `quality-guard-evolution.ts` |
| Immune System | Immune DNA Repair | `immune-dna-repair.ts` |

## Future (Planned)

- Brand object manufacturing pipeline
- Campaign object manufacturing pipeline
- Cross-studio dependency propagation

## Cross-references

- Manufacturing Engine: `docs/studio-os/manufacturing-engine/MANUFACTURING_ENGINE.md`
- Blueprint Author compiler order: `docs/studio-os/blueprint-author/BLUEPRINT_AUTHOR.md`
- Construction Mode approval gate: `docs/studio-os/construction-mode/CONSTRUCTION_MODE.md`

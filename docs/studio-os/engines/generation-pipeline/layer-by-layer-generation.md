# Layer-by-Layer Generation™

**Engine Module:** `studio.generation-pipeline.v1.layer-generation`  
**Status:** Canonical layer execution sequence

---

## Law

> **Generation happens layer-by-layer.**

> Dislike the lighting? Regenerate **Lighting™ only** — Environment™ stays intact.

---

## Canonical Layer Sequence

Generation Queue™ executes layers in this order:

| Order | Layer | Category | Provider | Regeneratable alone |
|-------|-------|----------|----------|---------------------|
| 1 | **Environment™** | Environment Shell™ | ✓ | ✓ (warns downstream) |
| 2 | **Lighting™** | Lighting™ | ✓ | ✓ |
| 3 | **Architecture™** | Architecture™ | ✓ | ✓ |
| 4 | **Furniture™** | Furniture™ | ✓ | ✓ |
| 5 | **Hero Objects™** | Hero Objects™ | ✓ | ✓ |
| 6 | **Atmosphere™** | Atmosphere™ | ✓ | ✓ |
| 7 | **Particles™** | Particles™ | ✓ | ✓ |
| 8 | **Runtime FX™** | Runtime FX™ | Cursor | ✓ |

**Extended layers** (Scene Planner may include — same pipeline rules):

| Layer | Runs after |
|-------|------------|
| Materials™ | Architecture™ |
| Interactive Objects™ | Furniture™ |
| Audio™ | Atmosphere™ |
| Camera™ | Environment™ |
| Interaction Layer™ | Runtime FX™ (Cursor) |

---

## Per-Layer Pipeline Micro-Flow

Each generatable layer passes through:

```
Registry Check (layer-scoped)
         ↓
Reuse Existing? ──YES──→ Attach · skip queue
         │
         NO
         ↓
Prompt Composer™ (layer ProductionPrompt™)
         ↓
Provider Optimizer™
         ↓
Generation Queue™ (single layer job)
         ↓
Quality Inspector™
         ↓
Founder Approval™
         ↓
Mark layer approved → unlock dependents
```

---

## Dependency Locks

| Layer | Locked until |
|-------|--------------|
| Lighting™ | Environment™ approved |
| Architecture™ | Environment™ approved |
| Furniture™ | Environment™ + Architecture™ approved |
| Hero Objects™ | Architecture™ approved |
| Atmosphere™ | Lighting™ approved |
| Particles™ | Atmosphere™ approved |
| Runtime FX™ | All visual layers approved |

Generation Queue™ will not enqueue a layer while prerequisites are `pending` or `rejected`.

---

## Parallel Exceptions

Layers with no mutual dependency may run in parallel within a stage:

```yaml
parallelGroup:
  - lighting-systems
  - architecture-structure
  # both depend only on environment-shell
```

Scene Planner™ `generationOrder` maps to Pipeline layer sequence — Planner is authoritative for parallelism; Pipeline enforces minimum layer order above.

---

## Layer State Machine

```yaml
LayerPipelineState:
  layerId: string
  status:
    planned | registry-checked | queued | generating |
    quality-check | awaiting-approval | approved | rejected | reused
  registryId: string | null
  generationJobId: string | null
  qualityReportId: string | null
  approvalDecision: approved | rejected | pending
  regenCount: number
  versionBranch: string | null
```

---

## Regenerate Layer

Founder: *"Regenerate lighting only"*

```
1. Lock all other layers (preserve approved artifacts)
2. Reset target layer → planned
3. Re-run Registry Check (may find new reuse candidate)
4. Re-estimate (partial — one layer)
5. Founder Approve partial estimate
6. Re-queue single layer job
7. Quality Inspector™ → Founder Approval™
8. Scene Assembly™ recomposites (lighting pass only)
9. Registry Update™ (new version or overwrite per policy)
```

No full workspace rebuild.

---

## Reuse Existing (Layer Skip)

When Registry Check returns `exact-match`:

```yaml
LayerReuseSkip:
  layerId: lighting-systems
  registryId: registry:lighting-editorial-rig-v3
  queueSkipped: true
  savingsApplied: 0.42
  status: reused
```

Layer marked `approved` immediately · unlocks dependents.

---

## Story Table™ Example

```
Layer 1 Environment™     → generate-new  → queued → approved
Layer 2 Lighting™        → reuse-existing → skipped → approved
Layer 3 Architecture™    → modify-parent → queued → approved
Layer 4 Furniture™       → generate-new  → queued → approved
Layer 5 Hero Objects™    → reuse-existing → skipped → approved
Layer 6 Atmosphere™      → generate-new  → queued → approved
Layer 7 Particles™       → reuse-existing → skipped → approved
Layer 8 Runtime FX™      → cursor-task   → post-visual → approved
         ↓
Scene Assembly™ → Registry Update™ → Workspace Published™
```

---

## Anti-Patterns

| Forbidden | Required |
|-----------|----------|
| Full scene single prompt | Layer-by-layer jobs |
| Regen downstream on lighting tweak | Target layer only |
| Queue all layers before Environment approved | Sequential unlock |
| Skip Quality Inspector per layer | Every generated layer validated |

---

_Layer-by-Layer Generation™ — one layer at a time, forever replaceable._

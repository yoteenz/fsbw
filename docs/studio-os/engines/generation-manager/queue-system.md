# Queue System — Studio Generation Manager™

**Engine Module:** `studio.generation-manager.v1.queue`  
**Status:** Auto queue · scheduling · progress

---

## Principle

> **The founder never creates the queue manually.**

Every department compile produces a **generation queue automatically** from `asset-manifest.json` + dependency graph + Compiler stage map.

---

## Queue Creation

```
DepartmentPackage.zip sealed
         ↓
Read 14_metadata/generation-queue.json (Compiler output)
         ↓
Merge registryResolutions[] — mark reuse/adapt items
         ↓
Assign queue positions (001, 002, …)
         ↓
Compute estimated minutes per item
         ↓
GenerationJob.queueItems[] ready
```

If `generation-queue.json` missing, Manager reconstructs from `dependencies.json` topological order — Compiler output is canonical.

---

## Queue Item Schema

```yaml
QueueItem:
  position: string                    # "001" · "002" · zero-padded
  assetId: string
  displayName: string                 # Human label for founder UI
  logicalGroup: string                # Environment · Furniture · Orb · …
  stageId: string                     # Compiler stage ID
  packageFolder: string
  state: GenerationState              # see generation-states.md
  resolution: enum                    # generate · reuse · adapt · inherit · skip
  registryRef: string | null
  providerRoute: ProviderRoute
  expandedPromptRef: string           # 13_prompts/{assetId}.json
  dependencies: string[]              # assetIds that must complete first
  estimatedMinutes: number
  actualMinutes: number | null
  retryCount: number
  priority: number                    # default 0 · founder boost +100
  artifactRef: string | null
  validationRef: string | null
  history: StateTransition[]
```

---

## Creative Direction Studio™ Queue

Auto-generated logical groups (founder-facing labels):

| Pos | Group | Asset IDs | Resolution |
|-----|-------|-----------|------------|
| 001 | Environment | `env-floor-cds` | generate |
| 002 | Architecture | `env-shell-cds`, `env-ceiling-cds`, `env-alcove-cds`, `env-window-cds`, `portal-entry-cds`, `portal-exit-cds` | generate |
| 003 | Ceiling | *(within 002 batch)* | generate |
| 004 | Floor | *(within 001)* | generate |
| 005 | Windows | `env-window-cds` | generate |
| 006 | Lighting | `lighting-rig-cds` | adapt |
| 007 | Furniture | `table-timeline-cds`, `table-sandbox-cds`, `shelf-library-cds` | generate |
| 008 | Orb | `pedestal-orb-cds`, `orb-cds` | reuse + generate |
| 009 | Mood Wall | `wall-mood-cds`, `wall-brief-cds`, `observatory-cds`, `screen-compare-cds` | generate (hero) |
| 010 | Timeline Table | `table-timeline-cds` | generate |
| 011 | Glass Panels | `glass-panels-cds`, `panel-context-float-cds`, `panel-founder-notes-cds` | adapt + generate |
| 012 | Holograms | `ai-creative-director-cds`, `ai-research-concierge-cds`, `ai-brand-concierge-cds` | definition |
| 013 | Particles | `particles-ambient-cds` | generate |
| 014 | Audio | `audio-ambient-cds`, `audio-ceremony-cds`, `audio-orb-cds` | generate |
| 015 | Animations | `camera-paths-cds`, ceremony metadata | metadata |
| 016 | Runtime Metadata | `markers-walk-room-cds`, `ceremony-approval-cds`, content seeds | metadata |

**Note:** Positions 003–005 nest under architecture/environment batches in UI — single progress bar per group with expandable asset list.

Total executable items: **35** · skipped via reuse: **~4–6**.

---

## Scheduling Algorithm

```
while job.status == running:
  readySet = items where:
    - state == queued
    - all dependencies satisfied (approved | reused)
    - not paused
  sort readySet by:
    1. priority desc
    2. position asc
  dispatch min(readySet, maxConcurrent) to provider
```

### Default Concurrency (v1)

| Setting | Value |
|---------|-------|
| `maxConcurrent` | 1 (sequential — safe default) |
| `maxConcurrentPerStage` | 3 (parallel within stage when no intra-stage edges) |
| `maxConcurrentGlobal` | 1 for v1 implementation |

v2 enables parallel generation — see [future-roadmap.md](./future-roadmap.md).

---

## Stage Batching

Items in same Compiler stage with **no mutual hard edges** may run parallel:

```yaml
stage-2-architecture:
  parallel: [env-ceiling-cds, env-alcove-cds, env-window-cds, portal-entry-cds, portal-exit-cds]
  sequential-after: env-shell-cds
```

Manager respects `stageGates` from `dependencies.json`.

---

## Reuse Skip

Items with `resolution: reuse | adapt` (artifact already linked):

```
state: queued → approved (skip generating)
artifactRef: from registryResolutions
actualMinutes: 0
```

Counted in progress as **complete** immediately after dependency satisfaction.

---

## Progress Tracking

```yaml
JobProgress:
  percent: number                     # 0-100
  byGroup:
    - group: Environment
      status: complete
    - group: Lighting
      status: generating
      assetId: lighting-rig-cds
    - group: Furniture
      status: queued
  estimatedMinutesRemaining: number
  startedAt: ISO8601
  projectedCompleteAt: ISO8601
```

**ETA formula:** sum(estimatedMinutes for queued+generating) × concurrency factor + 10% buffer.

---

## Founder Queue Controls

| Action | Queue Effect |
|--------|--------------|
| Pause | No new dispatches · in-flight completes |
| Resume | Scheduling resumes |
| Prioritize `wall-mood-cds` | priority +100 when deps satisfied |
| Cancel job | All queued → cancelled · in-flight completes then stops |
| Regenerate one | Insert branch item · same position · new jobId suffix |
| Create Branch | Clone remaining queue to `branch-{id}` job |

---

## Priority Rules

| Source | Priority Boost |
|--------|----------------|
| Default | 0 |
| Founder prioritize | +100 |
| Hero object (`wall-mood-cds`) | +10 (automatic) |
| Blocking many dependents | +5 per dependent count |
| Retry after failure | +20 (avoid starvation) |
| Marketplace deadline | +50 (future) |

Hard dependencies **always** override priority — cannot prioritize furniture before floor.

---

## Queue Persistence

```yaml
GenerationQueueSnapshot:
  jobId: string
  savedAt: ISO8601
  items: QueueItem[]
  checksum: sha256
```

Snapshots on: every state change · pause · resume · job complete.

Enables resume after crash — **never lose production progress**.

---

## generation-queue.json (Compiler Output)

Manager expects Compiler to emit:

```json
{
  "$schema": "studio.asset-compiler.v1/generation-queue.json",
  "packageId": "pkg-creative-direction-golden-v1",
  "items": [
    {
      "position": "001",
      "assetId": "env-floor-cds",
      "logicalGroup": "environment",
      "stageId": "environment",
      "dependencies": ["env-shell-cds"],
      "estimatedMinutes": 8
    }
  ]
}
```

Manager validates schema on ingest — reject job if invalid.

---

## Gate

**Queue ready** when:

- [ ] All items have position · assetId · state
- [ ] Dependency graph acyclic
- [ ] Every `generate` item has `expandedPromptRef`
- [ ] Reuse items have `registryRef` + `artifactRef`
- [ ] ETA computable

---

_Queue System — the call sheet writes itself._

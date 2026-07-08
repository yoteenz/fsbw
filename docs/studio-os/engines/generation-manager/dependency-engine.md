# Dependency Engine — Studio Generation Manager™

**Engine Module:** `studio.generation-manager.v1.dependencies`  
**Status:** Automatic generation order · hard gates

---

## Principle

> **Generation order is automatic.**

Lighting cannot generate before Environment. Furniture cannot generate before Floor. Particles require Environment. Interactive objects require Furniture. Runtime metadata requires completed assets.

---

## Input Sources

| Source | Path | Provides |
|--------|------|----------|
| Dependency graph | `14_metadata/dependencies.json` | Nodes · edges · topological order |
| Stage gates | `dependencies.json` → `stageGates[]` | Compiler stage sequencing |
| Asset manifest | `asset-manifest.json` (in package) | Per-asset `dependencies[]` |
| Registry resolutions | `package-manifest.json` | Pruned subgraph for reuse |
| SDK universal rules | Department SDK | Orb-pedestal · portal-shell |

Generation Manager **consumes** Compiler-resolved graph — does not rebuild from scratch except recovery mode.

---

## Dependency Rules (Universal)

| Rule | Example |
|------|---------|
| Lighting after environment shell | `lighting-rig-cds` requires `env-shell-cds` |
| Furniture after floor | `table-timeline-cds` requires `env-floor-cds` |
| Large objects after lighting + furniture | `wall-mood-cds` requires `lighting-rig-cds` |
| Particles after environment + hero objects | `particles-ambient-cds` requires `env-shell-cds`, `wall-mood-cds` |
| Interactive objects after furniture | `orb-cds` requires `pedestal-orb-cds` |
| Glass after furniture + large objects | `glass-panels-cds` requires zone objects |
| Runtime metadata last | `markers-walk-room-cds` requires all zones |
| Audio after interactive objects | `audio-ceremony-cds` requires `ceremony-approval-cds` |

---

## Edge Types (Execution Semantics)

| Type | Generation Manager Behavior |
|------|----------------------------|
| `hard` | Item blocked until dependency `approved` or `reused` |
| `soft` | May proceed with placeholder · replace on dependency complete |
| `stack` | Sequential within same stage — pedestal before orb |
| `genome` | Adapt overlay waits for base mesh approved |
| `ceremony` | Audio + target object both required |

v1: **hard** and **stack** enforced · **soft** disabled (no placeholders in golden path).

---

## CDS Dependency Examples

```yaml
env-shell-cds:
  requires: []
  blocks: [env-floor-cds, env-ceiling-cds, env-window-cds, env-alcove-cds, lighting-rig-cds]

env-floor-cds:
  requires: [env-shell-cds]
  blocks: [table-timeline-cds, table-sandbox-cds, shelf-library-cds, pedestal-orb-cds]

lighting-rig-cds:
  requires: [env-shell-cds, env-ceiling-cds]
  blocks: [wall-mood-cds, wall-brief-cds, all furniture]

pedestal-orb-cds:
  requires: [env-floor-cds, lighting-rig-cds]
  blocks: [orb-cds]

orb-cds:
  requires: [pedestal-orb-cds]
  resolution: reuse
  blocks: [audio-orb-cds]

wall-mood-cds:
  requires: [env-shell-cds, lighting-rig-cds, table-timeline-cds]
  blocks: [particles-ambient-cds, screen-compare-cds]

markers-walk-room-cds:
  requires: [all zone objects]
  stage: runtime-metadata
```

---

## Stage Gate Enforcement

From Compiler [generation-pipeline.md](../studio-asset-compiler/generation-pipeline.md):

| Stage | Gate — Prior Stages Complete |
|-------|---------------------------|
| 1 Environment | — |
| 2 Architecture | 1 |
| 3 Lighting | 2 |
| 4 Furniture | 1, 3 |
| 5 Large objects | 2, 3, 4 |
| 6 Interactive | 5 |
| 7 Glass | 4, 5 |
| 8 Floating UI | 7 |
| 9 Effects | 3, 5 |
| 10 Animation | 5, 6 |
| 11 Audio | 6 |
| 12 Final metadata | 1–11 |

Manager will not dispatch stage N+1 until stage N items are `approved | reused | skipped`.

---

## Resolution Algorithm

```
function canDispatch(item):
  for dep in item.dependencies:
    depItem = queue.find(dep)
    if depItem.state not in [approved, reused]:
      return false
  for gate in item.stageGates:
    if not stageComplete(gate):
      return false
  return true

function stageComplete(stageId):
  return all items in stage have terminal state
```

---

## Reuse Pruning

When `registryResolutions[]` marks exact reuse:

```
Remove provider dispatch for item
Dependency edges preserved — dependents still wait for state=approved
Inherited dependencies from Registry merged into graph
```

Adapt reuse: base artifact linked · optional overlay gen may still dispatch.

---

## Cycle Detection

If Compiler shipped cyclic graph (should not happen):

```
Manager rejects job at ingest
Emit error: dependency-cycle-detected
List cycle path in diagnostic
Require Compiler re-run
```

Recovery: Manager does not attempt to break cycles.

---

## Dependency Violation Handling

If provider returns success but dependency artifact missing (corruption):

```
Mark item failed
Retry engine: wait-for-dependency-recook
Do not cascade-fail dependents — hold in queued
```

---

## Parallelism Within Constraints

```
readySet = items where canDispatch(item) && state == queued

# Group by stage
for stage in orderedStages:
  stageReady = readySet.filter(stage)
  if no hard edges between stageReady members:
    dispatch parallel (up to maxConcurrentPerStage)
  else:
    dispatch sequential per topological tie-break
```

---

## Founder Override Limits

| Override | Allowed | Blocked |
|----------|---------|---------|
| Prioritize within ready set | ✓ | — |
| Prioritize before deps met | ✗ | Hard deps |
| Skip dependency | ✗ | Never |
| Force parallel on gated stage | ✗ | Stage gates |

---

## Diagnostic Output

```yaml
DependencyDiagnostic:
  jobId: string
  blockedItems:
    - assetId: wall-mood-cds
      waitingOn: [lighting-rig-cds]
      estimatedWaitMinutes: 5
  criticalPath: [env-shell-cds, lighting-rig-cds, wall-mood-cds, particles-ambient-cds]
  criticalPathMinutes: 43
```

Critical path drives ETA accuracy.

---

_Dependency Engine — respect the build order, always._

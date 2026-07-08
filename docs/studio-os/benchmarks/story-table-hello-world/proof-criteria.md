# Proof Criteria™ — Engine First, Not Beauty

**Benchmark Module:** `studio.benchmark.story-table-hello-world.v1.proof`  
**Status:** Measurable engine proof scorecard

---

## Law

> **Do not optimize for beauty first.**

> **Optimize for proving the engine generated, assembled, stored, and reused assets correctly.**

---

## Benchmark Scorecard

| # | Criterion | Weight | Pass condition |
|---|-----------|--------|----------------|
| 1 | Pipeline completed end-to-end | 15% | All 11 stages reached `Workspace Published™` |
| 2 | Layer independence | 10% | 12 distinct `LayerPlan™` records |
| 3 | Registry reuse demonstrated | 15% | `reuseRate ≥ 40%` |
| 4 | Pre-gen estimate gate | 10% | No queue jobs before `estimateApproved` |
| 5 | Per-layer Quality Inspector™ | 10% | Every generated layer has `QualityReport` |
| 6 | Per-layer Founder Approval™ | 10% | Every layer `approvalDecision: approved` |
| 7 | Registry persistence | 15% | All layers have Canonical Asset Records |
| 8 | Scene Assembly integrity | 10% | `AssembledWorkspaceScene` references 12 layers |
| 9 | Partial regen proof | 10% | Lighting™ regen without shell change |
| 10 | No manual design violations | 5% | Zero hand-placed visual substitutes |

**Pass threshold:** ≥ **80%** weighted score

**Aesthetics:** Not scored in v1 benchmark.

---

## Per-Stage Proof Artifacts

| Stage | Required artifact |
|-------|-------------------|
| Founder Intent™ | `FounderIntent` record |
| Prompt Composer™ | `ProductionPrompt™` per generatable layer |
| Scene Planner™ | `SceneBlueprint™` JSON |
| Asset Registry™ | `RegistryCheckResult[]` |
| Generation Queue™ | `QueueBuildReport` |
| Approval™ | `FounderControlRecord[]` |
| Scene Assembly™ | `AssembledWorkspaceScene` |
| Workspace Published™ | `PublishedWorkspace` |

All artifacts auditable in Studio Alpha™ — not required founder-facing.

---

## Reuse Proof

```yaml
ReuseProof:
  layersReused: number          # target ≥ 5
  layersModified: number
  layersGenerated: number       # target ≤ 3
  savingsDocumented: number     # must match estimate
  crossWorkspaceReuse: boolean  # at least one sibling workspace ref
  orbExplainedWhy: boolean
```

Example: Lighting reused from Mood Wall™ — logged in `FounderControlRecord`.

---

## Storage Proof

```yaml
RegistryProof:
  recordsCreated: number        # net-new assets
  recordsUpdated: number        # modify paths
  recordsReused: number         # usageCount incremented
  promptVersionLineage: boolean # every record has promptVersion
  workspaceSceneTagged: boolean # every record has workspace: story-table
  dependencyGraphEdges: boolean # layer deps in Registry DAG
```

Query: *"What assets exist for Story Table™?"* → returns 12 layer entries.

---

## Assembly Proof

```yaml
AssemblyProof:
  allLayersReferenced: boolean
  blendOrderCorrect: boolean
  noMissingArtifactRefs: boolean
  runtimeFxAfterVisual: boolean
  cursorLayersLast: boolean
```

---

## Regen Proof

```yaml
RegenProof:
  targetLayer: lighting-story-table
  upstreamLocked: [env-shell-story-table]
  upstreamArtifactHashUnchanged: boolean
  newLightingVersionInRegistry: boolean
  reassemblyTimeSeconds: number  # < 30s
```

---

## Anti-Pass Conditions (Automatic Fail)

| Violation |
|-----------|
| Full-scene single-generation job |
| Skip Registry Check on any layer |
| Manual Three.js mesh for visual layer |
| Founder prompt textarea used |
| Queue before estimate approval |
| Missing Canonical Asset Record on generated layer |
| Beauty-only approval without QualityReport |

---

## Hello World Declaration

When scorecard ≥ 80%:

```yaml
HelloWorldDeclaration:
  benchmarkId: studio.benchmark.story-table-hello-world.v1
  status: proven
  declaredAt: ISO8601
  message: >
    Story Table™ is the first fully generated workspace.
    The Generation Pipeline™ is proven.
    All future departments inherit this benchmark.
```

---

_Proof Criteria — the engine passed. Beauty comes later._

# Pipeline Run Spec™ — Story Table™ Hello World

**Benchmark Module:** `studio.benchmark.story-table-hello-world.v1.run`  
**Status:** End-to-end execution specification

---

## Run Identity

```yaml
BenchmarkRun:
  runId: benchmark-story-table-hello-world-v1
  orgId: pilot-org
  departmentId: creative-direction
  workspaceScene: story-table
  blueprintId: blueprint-editorial-luxury-v1
  pipelineVersion: studio.generation-pipeline.v1
  beautyPriority: false
  engineProofPriority: true
```

---

## Stage 1 — Founder Intent™

```yaml
FounderIntent:
  naturalLanguage: >
    Generate the Story Table™ workspace for Creative Direction Studio.
    Editorial luxury headquarters strategy room. Use what we already own.
    Layer by layer. First fully generated workspace.
  workspaceScene: story-table
  intentType: generate
  explicitVariation: false
```

**Output:** `StructuredCreativeRequest` via Creative Interpreter™

---

## Stage 2 — Prompt Composer™

Composer assembles twelve-source `ProductionBrief` per layer scope.

| Source | Story Table contribution |
|--------|-------------------------|
| Company DNA™ | Editorial luxury · warm stone · brass |
| Department Blueprint™ | `blueprint-editorial-luxury-v1` |
| Workspace Rules™ | Executive table · orbiting camera · holographic zone |
| Registry References™ | Mood Wall™ lighting · Arrival™ shell candidates |

**Output:** `ProductionBrief` — internal only

---

## Stage 3 — Scene Planner™

Planner emits `SceneBlueprint™` from [layer-manifest.md](./layer-manifest.md).

**Expected inventory (reference):**

| Bucket | Count |
|--------|-------|
| reusableAssets | 8 |
| missingAssets (generate) | 2 |
| modify | 3 |
| requiredAssets | 12 |

See [cds-story-table-example.md](../../studio-production-estimates/cds-story-table-example.md).

**Output:** `SceneBlueprint™` with `planStatus: estimate-ready`

---

## Stage 4 — Asset Registry™

Per-layer Registry Check™ — remember-first.

| Layer | Expected resolution |
|-------|---------------------|
| Environment Shell™ | reuse (Arrival sibling) |
| Lighting™ | reuse |
| Architecture™ | reuse |
| Furniture™ | modify |
| Executive Strategy Table™ | generate-new |
| Floating Studio Orb™ | reuse (platform Orb) |
| Holographic Project Boards™ | modify |
| Material Samples™ | reuse |
| Atmosphere™ | reuse |
| Particles™ | reuse |
| Ambient Audio™ | reuse |
| Runtime FX™ | cursor-task |

**Proof:** `reuseRate ≥ 0.40` · every layer has `registrySearchId`

---

## Stage 5 — Pre-Generation Estimate (Gate)

```
Estimated Production Cost™      $2.48
Estimated Production Time™      2m 12s
Assets Reused™                  8
Assets Modified™                3
New Assets Generated™           2
Estimated Savings™            $4.86
Complexity™                   Medium
```

**Founder:** Approve Production™

**Proof:** `estimateApproved: true` before queue unlock

---

## Stage 6 — Generation Queue™

Execute non-reused layers only:

| Job | Layer | Action |
|-----|-------|--------|
| — | 8 reuse layers | attach · skip queue |
| J1 | Furniture™ | modify |
| J2 | Holographic Project Boards™ | modify |
| J3 | Executive Strategy Table™ | generate-new |
| J4 | (if needed) Ambient Motion | modify |

Per-layer: Prompt Composer™ → Provider Optimizer™ → Generation Manager™ job.

**Proof:** Each job has `generationManagerJobId` · `artifactRef` · Build Report entry

---

## Stage 7 — Quality Inspector™

Every generated/modified layer receives `QualityReport`:

| Check | Threshold |
|-------|-----------|
| blueprintCompliance | ≥ 0.85 (benchmark — not golden yet) |
| layerIsolation | pass |
| genomeMatch | ≥ 0.80 |

Failed layer → Regenerate — upstream preserved.

---

## Stage 8 — Approval™

Founder Approval™ per generated layer at Pipeline™ workstation.

| Control exercised in benchmark |
|-------------------------------|
| Approve (all layers) |
| Reuse Existing (default on 8 layers) |
| Regenerate (Lighting™ — partial proof run) |

---

## Stage 9 — Scene Assembly™

Scene Stack™ compositor blends approved layers per manifest blend order.

**Output:**

```yaml
AssembledWorkspaceScene:
  workspaceScene: story-table
  status: assembled
  layerCount: 12
  goldenBuildContribution: 25    # first workspace — partial dept Golden Build
```

**Proof:** Progressive preview at each layer approval (optional v1.1)

---

## Stage 10 — Registry Update™

Every net-new/modified asset → [Canonical Asset Record™](../engines/studio-asset-registry/canonical-asset-record.md):

| Required fields populated |
|---------------------------|
| UUID · Name · Category · Department · Workspace · Scene |
| Generation Pack · promptVersion · blueprintVersion |
| Usage Count (seed 1) · Created By · Date |

**Proof:** 12 layer records queryable · `promptVersion` lineage traceable

---

## Stage 11 — Workspace Published™

```yaml
PublishedWorkspace:
  workspaceScene: story-table
  status: published
  benchmarkComplete: true
  publishedAt: ISO8601
  pipelineRunId: benchmark-story-table-hello-world-v1
```

Orb: *"Story Table™ is live — your first fully generated workspace."*

---

## Post-Benchmark Regen Proof

Mandatory second run:

```
Founder: "Regenerate Story Table lighting — warmer editorial."
         ↓
Partial SceneBlueprint (lighting-story-table only)
         ↓
Partial estimate → approve
         ↓
Single queue job
         ↓
Reassemble lighting pass only
         ↓
Registry version bump on lighting asset
```

**Proof:** Environment Shell™ artifact unchanged · `regenCount: 1` on lighting

---

## Timing Budget (Reference)

| Phase | Target |
|-------|--------|
| Plan + Registry + Estimate | < 30s founder-facing |
| Queue execution | ~2m 12s |
| Assembly | < 15s |
| Total to published | < 3m |

---

_Pipeline Run Spec — one run, twelve layers, full engine proof._

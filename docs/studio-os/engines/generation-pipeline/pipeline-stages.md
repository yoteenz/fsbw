# Pipeline Stages™

**Engine Module:** `studio.generation-pipeline.v1.stages`  
**Status:** Twelve canonical production stages

---

## Overview

| # | Stage | Generates? | Founder controls |
|---|-------|------------|------------------|
| 1 | Founder Intent™ | No | — |
| 2 | Prompt Composer™ | No | Reuse · Variations |
| 3 | Scene Planner™ | No | Approve · Reject |
| 4 | Asset Registry Check™ | No | Reuse Existing |
| 5 | Missing Assets™ | No | Reuse · Variations |
| 6 | Pre-Generation Estimate | No | Approve · Reject |
| 7 | Provider Optimizer™ | No | — |
| 8 | Generation Queue™ | **Yes** | Regenerate · Reject |
| 9 | Quality Inspector™ | No | Approve · Reject · Regenerate |
| 10 | Founder Approval™ | No | Approve · Reject · Variations |
| 11 | Scene Assembly™ | No | Approve |
| 12 | Registry Update™ | No | — |
| 13 | Workspace Published™ | No | — |

Stage 6 (estimate) is mandatory gate — not optional.

---

## Stage 1 — Founder Intent™

**Input:** Voice · text · gesture · workstation context

```yaml
FounderIntent:
  naturalLanguage: string
  workspaceScene: string
  intentType: generate | modify | reuse | regen-layer
  explicitVariation: boolean
```

**Output:** `StructuredCreativeRequest` (via Creative Interpreter™)

**Sub-engines:** Creative Interpreter™ · Blueprint Engine™ (scope)

---

## Stage 2 — Prompt Composer™

**Purpose:** Translate intent → provider-neutral production brief.

**Input:** StructuredCreativeRequest · Genome · Blueprint scope

**Output:** `ProductionBrief` (internal) — seeds Scene Planner

**Sub-engine:** [Prompt Composer™](../prompt-composer/README.md)

Founder never sees prompts. Orb: *"Translating your intent…"*

---

## Stage 3 — Scene Planner™

**Purpose:** Decompose workspace → production layers · emit Scene Blueprint™.

**Input:** ProductionBrief · Blueprint · workspace template

**Output:** `SceneBlueprint™` — dependencies · inventory · generation order

**Sub-engine:** [Scene Planner™](../scene-planner/README.md)

Plans only — no generation.

---

## Stage 4 — Asset Registry Check™

**Purpose:** Remember-first inventory — what does the company already own?

**Input:** SceneBlueprint.layerManifest[]

**Output:** `RegistryCheckResult` per layer

```yaml
RegistryCheckResult:
  layerId: string
  candidates: RegistryCandidate[]
  recommendation: reuse-existing | modify | generate-new
  defaultAction: reuse-existing          # remember-first default
  compatibilityScore: number
  estimatedSavings: number
```

**Sub-engines:** [Asset Registry™](../studio-asset-registry/README.md) · [Asset Intelligence Engine™](../../asset-intelligence-engine/README.md)

---

## Stage 5 — Missing Assets™

**Purpose:** Resolve gaps — classify what still needs production.

**Input:** RegistryCheckResult[] · founder overrides

**Output:** Updated SceneBlueprint with:

- `reusableAssets` (fulfilled)
- `missingAssets` (generate · modify · acquire)
- `GenerationLineItem[]` · `ReuseLineItem[]`

**Founder controls:** Reuse Existing™ · Create Variations™

---

## Stage 6 — Pre-Generation Estimate (Gate)

**Purpose:** Quote before any provider contact.

**Output:** `ProductionEstimate™`

| Field | Required |
|-------|----------|
| estimatedCost | ✓ |
| estimatedTime | ✓ |
| providerUsage (internal) | ✓ |
| reusableSavings | ✓ |
| complexity | ✓ |
| reuseRate | ✓ |

**Founder controls:** **Approve** (proceed) · **Reject** (revise plan)

**Sub-engines:** [Production Estimates™](../../studio-production-estimates/README.md) · [Creative Budgets™](../../creative-budgets/README.md)

**Law:** Generation Queue™ **blocked** until estimate approved.

---

## Stage 7 — Provider Optimizer™

**Purpose:** Adapt `ProductionPrompt™` → `OptimizedProviderPayload™` per layer job.

**Input:** Approved SceneBlueprint · GenerationLineItems

**Output:** Provider payloads queued for Generation Manager™

**Sub-engine:** [Provider Optimizer handoff](../prompt-composer/provider-optimizer-handoff.md)

Founder never sees provider or model.

---

## Stage 8 — Generation Queue™

**Purpose:** Execute layer-by-layer provider jobs.

**Input:** Optimized payloads · approved estimate · layer order

**Output:** Raw artifacts per layer

**Sub-engine:** [Generation Manager™](../generation-manager/README.md)

**Founder controls:** Regenerate · Reject (cancel job)

See [generation-queue-stage.md](./generation-queue-stage.md) · [layer-by-layer-generation.md](./layer-by-layer-generation.md).

---

## Stage 9 — Quality Inspector™

**Purpose:** Validate each layer artifact before founder review.

**Checks:** Blueprint compliance · resolution · layer isolation · genome match

**Output:** `QualityReport` per layer — pass · fail · regen-scope

**Sub-engine:** Validation Loop™ · [validation-handoff](../generation-manager/validation-handoff.md)

**Founder controls:** Approve (pass) · Reject · Regenerate

See [quality-inspector-stage.md](./quality-inspector-stage.md).

---

## Stage 10 — Founder Approval™

**Purpose:** Founder reviews layer or batch at Pipeline™ workstation.

**Input:** QualityReport · layer preview · Orb narration

**Output:** `ApprovalDecision` — approved · rejected · variation-requested

**Sub-engines:** Creative Approval Pipeline™ · Production Estimates™

**Founder controls:** All five controls available

---

## Stage 11 — Scene Assembly™

**Purpose:** Composite approved layers into workspace scene.

**Input:** Approved layer artifacts · Scene Stack™ blend order

**Output:** `AssembledWorkspaceScene` — ready state

**Sub-engine:** [Scene Stack™](../../scene-stack/README.md) compositor

---

## Stage 12 — Registry Update™

**Purpose:** Auto-register every new/modified asset.

**Input:** Approved artifacts · ProductionPrompt™ provenance

**Output:** Canonical Asset Records · `promptVersion` · usage seeds

**Sub-engine:** [Auto-Registration™](../studio-asset-registry/auto-registration.md)

---

## Stage 13 — Workspace Published™

**Purpose:** Workspace scene live in Department Runtime™.

**Output:**

```yaml
PublishedWorkspace:
  workspaceScene: string
  status: published
  goldenBuildContribution: number
  registryAssetIds: string[]
  publishedAt: ISO8601
```

Orb: *"Story Table™ is ready — editorial luxury preserved."*

---

## Pipeline State Object

```yaml
GenerationPipelineRun:
  runId: uuid
  orgId: string
  workspaceScene: string
  currentStage: PipelineStage
  stageHistory: StageTransition[]
  sceneBlueprintId: uuid
  productionEstimateId: string | null
  estimateApproved: boolean
  layerStates: Record<layerId, LayerPipelineState>
  published: boolean
```

---

_Pipeline Stages™ — twelve gates from intent to published world._

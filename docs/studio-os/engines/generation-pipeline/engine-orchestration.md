# Engine Orchestration™

**Engine Module:** `studio.generation-pipeline.v1.orchestration`  
**Status:** Sub-engine coordination map

---

## Generation Pipeline™ as Master Orchestrator

Generation Pipeline™ does not implement generation logic — it **coordinates** specialized engines in canonical order.

```
┌─────────────────────────────────────────────────────────────┐
│              GENERATION PIPELINE™ (this engine)              │
│  State machine · stage gates · founder controls · estimates  │
└─────────────────────────────────────────────────────────────┘
         │ orchestrates │
         ▼              ▼              ▼              ▼
  Prompt Composer  Scene Planner  Gen Manager   Scene Stack
  Asset Registry   Prod Estimates  Validation    Runtime
```

---

## Stage → Engine Map

| # | Pipeline Stage | Primary Engine | Supporting |
|---|----------------|----------------|------------|
| 1 | Founder Intent™ | Creative Intelligence Engine™ | Blueprint Engine™ |
| 2 | Prompt Composer™ | [prompt-composer/](../prompt-composer/) | Company Genome™ |
| 3 | Scene Planner™ | [scene-planner/](../scene-planner/) | Scene Stack templates |
| 4 | Asset Registry Check™ | [studio-asset-registry/](../studio-asset-registry/) | Asset Intelligence |
| 5 | Missing Assets™ | scene-planner/asset-inventory | Asset Intelligence |
| 6 | Pre-Gen Estimate | [studio-production-estimates/](../../studio-production-estimates/) | [creative-budgets/](../../creative-budgets/) |
| 7 | Provider Optimizer™ | provider-optimizer (v1.1) | Design Registry™ |
| 8 | Generation Queue™ | [generation-manager/](../generation-manager/) | Provider adapters |
| 9 | Quality Inspector™ | Validation Loop™ | generation-manager/validation-handoff |
| 10 | Founder Approval™ | Creative Approval Pipeline™ | CDS Pipeline™ workstation |
| 11 | Scene Assembly™ | [scene-stack/](../../scene-stack/) | Department Runtime™ |
| 12 | Registry Update™ | auto-registration | Canonical Asset Record™ |
| 13 | Workspace Published™ | Department Runtime™ | Walk the Business™ |

---

## Reconciliation with CIE Prompt Pipeline

[Creative Intelligence Engine™](../../creative-intelligence-engine/prompt-generation-architecture.md) documents upstream intelligence flow. **Generation Pipeline™** is the **production execution authority** — same stages, unified orchestration:

| CIE concept | Generation Pipeline stage |
|-------------|---------------------------|
| Creative Interpreter™ | Founder Intent™ (stage 1) |
| Blueprint Engine™ | Feeds Prompt Composer™ + Scene Planner™ |
| Asset Registry™ search | Asset Registry Check™ (stage 4) |
| Production Estimates™ | Pre-Generation Estimate (stage 6) |
| Prompt Composer™ | Stage 2 |
| Scene Planner™ | Stage 3 |
| Provider Optimizer™ | Stage 7 |
| Generation Manager™ | Generation Queue™ (stage 8) |
| Quality Inspector™ | Stage 9 |
| Approval Queue™ | Founder Approval™ (stage 10) |
| Scene Assembly™ | Stage 11 |
| Registry write | Registry Update™ (stage 12) |
| Completed Workspace™ | Workspace Published™ (stage 13) |

**Canonical order for production:** Generation Pipeline™ README sequence.

---

## Manufacturing Path (Batch)

Department package compiles use same Pipeline with different entry:

```
Compiler Prompt Expansion
         ↓
Scene Planner (batch mode)
         ↓
Registry Check
         ↓
Estimate → Queue → …
```

See [prompt-composer/compiler-convergence.md](../prompt-composer/compiler-convergence.md).

---

## Pipeline Coordinator API (v1.1 Spec)

```yaml
GenerationPipelineCoordinator:
  startRun(intent: FounderIntent): GenerationPipelineRun
  advanceStage(runId, action: FounderControl): StageResult
  getEstimate(runId): PreGenerationEstimate
  approveEstimate(runId): void
  enqueueGeneration(runId): PipelineGenerationQueue
  publishWorkspace(runId): PublishedWorkspace
```

---

## State Ownership

| Data | Owner engine |
|------|--------------|
| `ProductionPrompt™` | Prompt Composer™ |
| `SceneBlueprint™` | Scene Planner™ |
| `OptimizedProviderPayload™` | Provider Optimizer™ |
| `PipelineGenerationQueue` | Generation Pipeline™ |
| Queue job execution | Generation Manager™ |
| `QualityReport` | Quality Inspector™ |
| Canonical Asset Record™ | Asset Registry™ |
| `PublishedWorkspace` | Generation Pipeline™ |

---

## Failure Domains

| Failure | Owning stage | Recovery |
|---------|--------------|----------|
| Plan invalid | Scene Planner™ | Reject → revise |
| No reuse budget | Pre-Gen Estimate | Reject → reduce scope |
| Provider fail | Generation Queue™ | Regenerate · failover |
| Quality fail | Quality Inspector™ | Regenerate layer |
| Founder reject | Founder Approval™ | Regenerate · Variation |
| Assembly fail | Scene Assembly™ | Layer regen |

---

_Engine Orchestration™ — one pipeline, many engines, single production truth._

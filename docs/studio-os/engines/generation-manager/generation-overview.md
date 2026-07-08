# Generation Overview — Studio Generation Manager™

**Engine Module:** `studio.generation-manager.v1.overview`  
**Status:** Orchestration philosophy and boundaries

---

## Definition

Studio Generation Manager™ is the **production coordinator** between prepared manufacturing packages and AI provider execution.

Upstream engines decide **what** to build and **how** to prompt it. Generation Manager decides **when**, **where**, and **whether** each asset gets cooked — then ensures quality before the library remembers it.

---

## Hollywood Production Model

| Hollywood Role | Studio OS Engine |
|----------------|------------------|
| Screenplay · creative intent | Creative Direction Studio™ |
| Production design · breakdown | Department Generator™ |
| Manufacturing · prompt packages | Asset Compiler™ + Prompt Compiler™ |
| **Production Manager** | **Generation Manager™** |
| Camera crew · VFX houses | AI Providers (FAL · OpenAI · Runway · …) |
| Quality control · dailies review | Validation Loop™ + Asset Review |
| Studio archive | Asset Registry™ |
| Premiere · live show | Department Runtime™ |

The founder is the **Creative Director**. Generation Manager is the **line producer** — invisible when working, indispensable when scale matters.

---

## What Gets Orchestrated

Generation Manager receives a **sealed DepartmentPackage.zip** from Asset Compiler™ (Build Health ≥ 70) containing:

| Input | Location | Manager Use |
|-------|----------|-------------|
| Generation queue | `14_metadata/generation-queue.json` | Primary work order |
| Dependency graph | `14_metadata/dependencies.json` | Scheduling constraints |
| Expanded prompts | `13_prompts/{assetId}.json` | Provider payloads |
| Registry resolutions | `package-manifest.json` | Skip regen for reuse/adapt |
| Provider hints | Per prompt stack | Routing |
| Assembly manifest | `15_runtime/` | Final metadata job |

Manager **executes** the queue. It does not rebuild it unless Compiler re-runs.

---

## Orchestration Decisions

For every queue item, Generation Manager determines:

| Decision | Logic Source |
|----------|--------------|
| **Should this generate?** | Registry reuse resolution — skip if exact/adapt linked |
| **When?** | Dependency engine — topological order + stage gates |
| **Which provider?** | Provider abstraction — asset type · route · failover |
| **What on failure?** | Retry engine — scope · provider switch · escalate |
| **Pass quality?** | Validation handoff — automated gates + founder where required |
| **Where stored?** | Artifact plane — `artifact://` with checksum |
| **When reusable?** | Registry integration — post-validation registration |
| **Runtime ready?** | Notify when package cook complete |

---

## Pipeline Integration

### Upstream — Compiler Handoff

```
Asset Compiler seals package
         ↓
POST /generation/submit
  packageId: pkg-creative-direction-golden-v1
  packageRef: CreativeDirectionStudio_Package.zip
  orgId: frontal-slayer
  genomeSnapshotRef: ...
         ↓
Generation Manager ingests queue
         ↓
Job created: gen-job-cds-golden-v1
```

### Downstream — Provider Execution

```
For each queue item (dependency-respecting):
  state: preparing → prompt-compiled → generating
         ↓
Provider adapter.submitJob(expandedPrompt)
         ↓
Poll until complete or failure
         ↓
state: validating
         ↓
Validation handoff
         ↓
state: approved | needs-revision | failed
```

### Terminal — Package Cook Complete

```
All items: approved | reused | archived
         ↓
Seal cooked package (artifacts embedded or linked)
         ↓
Emit Build Report
         ↓
Notify Registry + Runtime
         ↓
Event: generation.package.complete
```

---

## Relationship to Production Pipeline

[Creative Production Pipeline](../../production/creative-production-pipeline.md) Stage 03 (Asset Generation) **executes through** Generation Manager:

| Production Stage | Engine |
|------------------|--------|
| 03 Asset Generation™ | Generation Manager orchestrates providers |
| 04 Asset Review™ | Validation handoff + founder review |
| 05 Registry™ | Manager triggers registration on approval |

Production methodology defines **what** happens. Generation Manager defines **how orchestration runs**.

---

## Boundary Law

```
Compiler™              Generation Manager™        Providers
─────────────────────────────────────────────────────────────
Prepares queue         Executes queue             Cook assets
Expands prompts        Submits payloads           Return artifacts
Estimates time         Tracks actual time         No queue logic
Build Health (pre)     Validation handoff (post)  No validation
Never calls FAL        Always routes providers    Never schedules
```

```
Validation Loop™       Generation Manager™        Registry™
─────────────────────────────────────────────────────────────
Quality authority      Submits for validation     Receives approved
Issues approval token  Retries on needs-revision  Records usage
Blocks Registry        Never self-approves        Never generates
```

---

## Job Model

```yaml
GenerationJob:
  jobId: string                       # gen-job-pkg-creative-direction-golden-v1
  packageId: string
  orgId: string
  status: enum                        # queued · running · paused · complete · failed · cancelled
  createdAt: ISO8601
  queueItems: QueueItem[]
  progress:
    total: number
    complete: number
    failed: number
    reused: number
    percent: number
    estimatedMinutesRemaining: number
  controls:
    paused: boolean
    priorityOverrides: PriorityOverride[]
    branchId: string | null           # regen branch
```

One job per package cook. Re-cook creates new job with parent reference.

---

## Founder Controls

| Control | Effect |
|---------|--------|
| **Pause** | Finish in-flight item · hold queue |
| **Resume** | Continue from paused position |
| **Prioritize** | Bump asset to front of ready set (respects hard deps) |
| **Cancel** | Stop job · mark remaining cancelled |
| **Regenerate one asset** | New branch item · surgical scope |
| **Approve** | Founder gate on hero · flagged assets |
| **Reject** | needs-revision → retry engine |
| **Create Branch** | Fork job for experimental regen without blocking main |

Founder never edits prompts. Controls operate on **assets and jobs**, not prompt text.

---

## CDS Pilot Job

First production job:

| Attribute | Value |
|-----------|-------|
| `jobId` | `gen-job-cds-golden-v1` |
| `packageId` | `pkg-creative-direction-golden-v1` |
| Queue items | 35 assets · 16 logical groups |
| Expected reuse skip | 4–6 items (orb · glass · lighting · acrylic) |
| Est. provider time | ~151 min (Compiler estimate) |
| Providers | FAL primary · OpenAI fallback |

---

## Event Bus

| Event | Subscribers |
|-------|-------------|
| `generation.job.created` | Production dashboard · Mission Control |
| `generation.item.stateChanged` | Founder progress UI |
| `generation.item.failed` | Retry engine |
| `generation.item.approved` | Registry · Build Report |
| `generation.job.complete` | Runtime · Assembly (Stage 06) |
| `generation.job.paused` | Founder notification |

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| Founder writes FAL prompts | Compiler + Prompt Compiler own prompts |
| Skip queue on "small" departments | Every department auto-queues |
| Provider called without dependency check | Broken assets · wrong context |
| Direct Registry write on provider return | Validation handoff required |
| Full-package regen on one failure | Retry engine surgical law |
| Generation Manager expands prompts | Compiler boundary |

---

## Success Definition

Generation Manager succeeds when a founder says:

> *"I want to build a Creative Direction Studio."*

And Studio OS automatically:

1. Determines required assets (already in Definition)
2. Compiles prompts (Compiler)
3. Orchestrates generation (Manager)
4. Validates results (Validation Loop)
5. Stores reusable assets (Registry)
6. Notifies assembly (Runtime path)

The founder never thinks about prompts.

---

_Generation Overview — coordinate production, never hold the camera._

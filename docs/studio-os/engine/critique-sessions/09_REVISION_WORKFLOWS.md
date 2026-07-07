# 09 — Revision Workflows

**Engine Module:** `studio.critique-sessions.v1.revision-workflows`  
**Status:** Critique-to-execution routing  
**Philosophy:** Recommendations become structured work.

---

## Design Principle

> Every critique connects directly into **Studio Production Engine™** and generation subsystems. Recommendations do not die in a transcript — they become **routable work** with founder-selected disposition.

---

## Founder Disposition Options

For each recommended revision, founder chooses:

| Disposition | ID | Effect |
|-------------|-----|--------|
| **Apply immediately** | `apply-immediately` | Trigger regen/change now · highest priority |
| **Assign to Concierge** | `assign-concierge` | AI specialist owns follow-through |
| **Send to Department** | `send-department` | Production Engine workspace receives work package |
| **Branch into experiment** | `branch-experiment` | Parallel experimental path · main unchanged |
| **Schedule for later** | `schedule-later` | Queued with due date · Orb reminds |
| **Dismiss permanently** | `dismiss-permanent` | Logged in Memory · not resurfaced unless founder requests |

---

## Revision Workflow Schema

```yaml
RevisionWorkflow:
  workflowId: string
  sessionId: string
  revisionId: string
  disposition: DispositionType
  founderDecisionId: string

  scope: RevisionScope              # aligned with Validation Loop 09 + Generator 14
  targetEngine: enum
    # department-generator | asset-compiler | production-engine | creative-direction-studio | runtime-preview

  routing:
    departmentId: string | null
    conciergeId: string | null
    productionPhase: string | null  # discover | development | production | review | marketing | publishing
    workPackageId: string | null

  branch: BranchSpec | null
  scheduledFor: ISO8601 | null
  dismissedReason: string | null

  status: enum                      # queued | in-progress | complete | dismissed | blocked
  blockedBy: string | null          # dependency id

  validationRevalidationRequired: boolean
```

---

## Routing Matrix

| Revision Type | Default Target | Production Engine Phase |
|---------------|----------------|------------------------|
| Creative direction change | Creative Direction Studio™ | N/A — direction layer |
| Mood board update | CDS · Development | development |
| Environment regen | Department Generator → Compiler | production |
| Lighting-only regen | Asset Compiler (scoped) | production |
| Interaction change | Generator interaction compiler | production |
| Copy/editorial | Production Engine department | review · marketing |
| CTA/marketing | Marketing department | marketing |
| Performance fix | Engineering · Compiler | production |
| Genome update | Company Genome service | executive |
| Marketplace listing fix | Marketplace export | publishing |

---

## Production Engine Handoff

```yaml
ProductionEngineHandoff:
  workflowId: string
  projectId: string
  departmentDestination: string    # e.g., production · marketing
  workPackage:
    title: string
    description: string
    sourceSession: string
    sourceRecommendation: string
    acceptanceCriteria: string[]
    genomeContext: CompanyGenomeSnapshot
    creativeDirectionRef: string | null
  priority: enum
  estimatedEffort: string
```

Work packages appear in department workspace — not as tasks on a dashboard, but as **work arriving at the building** per Production Engine philosophy.

---

## Surgical Regen Integration

Critique revisions inherit **surgical scope law** from Validation Loop Revision Engine (09) and Generator Regeneration System (14):

| Scope | When Critique Recommends |
|-------|-------------------------|
| `lighting-only` | Atmosphere · mood · time-of-day |
| `audio-only` | Sonic identity issues |
| `motion-only` | Ceremony · idle · transition |
| `object:{id}` | Single object replacement |
| `interaction:{verb}` | Verb behavior change |
| `environment-only` | Architecture · spatial (not full department) |
| `full-department` | **Founder explicit request only** |

**Rule:** Critique Sessions never default to full regeneration.

---

## Branch Experiment Workflow

```yaml
BranchExperimentWorkflow:
  parentWorkflowId: string
  branchName: string
  isolatedScope: RevisionScope
  previewMode: boolean             # Runtime sandbox
  successMetrics: string[]
  reviewSessionScheduled: CritiqueSessionType | null
  mergeRequiresSession: boolean    # Critique before merge to main
```

Branches use Runtime sandbox isolation per Golden Department Sandbox rules.

---

## Validation Loop Revalidation

When revision completes:

```
1. Revision workflow → status: complete
2. If validationRevalidationRequired:
   → Trigger Validation Loop scoped revalidation (02)
   → May schedule follow-up Critique Session before Founder Review
3. If disposition was dismiss-permanent:
   → Skip revalidation · log outcome in Memory
```

---

## Workflow Status Lifecycle

```
QUEUED
    ↓
IN_PROGRESS (assigned · regen running · department working)
    ↓
┌─ BLOCKED (dependency)
└─ COMPLETE
    ↓
REVALIDATION (optional)
    ↓
CLOSED
```

---

## Concierge Assignment

When `assign-concierge`:

```yaml
ConciergeAssignment:
  conciergeRole: AIRoleId
  task: string
  context: ActionItemBundle excerpt
  deliverable: string
  reportBackVia: enum              # orb | next-session | async-summary
```

Concierge completes work and reports via Orb — may trigger abbreviated Critique Session for review.

---

## Dismiss Permanent Memory

Dismissed revisions are **not deleted**:

```yaml
DismissedRevisionMemory:
  revisionId: string
  dismissedAt: ISO8601
  reason: string | null
  sourceRole: AIRoleId
  topic: string
```

Post Session Learning (11) compares dismissed advice against later outcomes — "founder ignored advice that proved valuable."

---

_Next: [10 — Memory System](./10_MEMORY_SYSTEM.md)_

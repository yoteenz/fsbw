# Production Queue™

**Module:** `studio-alpha.production-dashboard.v1.queue`  
**Status:** Every pending generation in one place

---

## Purpose

Every pending generation appears in the **Production Queue™** — the live manufacturing floor of Studio Alpha™.

Operators see what is waiting · generating · queued · blocked on approval.

---

## Queue Item Schema

```yaml
ProductionQueueItem:
  queueItemId: string
  hierarchy:
    department: string              # "Creative Direction Studio™"
    scene: string | null            # "Mood Wall™"
    station: string | null
    layer: string | null
    asset: string | null
  displayLabel: string              # "Creative Direction Studio™ → Mood Wall™"
  priority: critical | high | normal | low | backlog
  status:
    - waiting
    - queued
    - generating
    - waiting_approval
    - retrying
    - blocked_dependency
    - paused
  estimatedCostUsd: number
  estimatedTimeSeconds: number
  actualCostUsd: number | null
  dependencies: string[]            # queueItemIds or assetIds
  assignedBlueprintId: string | null
  assignedBlueprintLabel: string | null
  generationManagerJobId: string | null
  provider: string | null             # internal — e.g. FAL
  model: string | null                # internal
  requestedAt: ISO8601
  startedAt: ISO8601 | null
  completedAt: ISO8601 | null
```

---

## Canonical Examples

| Display | Status |
|---------|--------|
| Creative Direction Studio™ → Mood Wall™ | **Waiting** |
| Creative Direction Studio™ → Lighting System™ | **Generating** |
| Finance™ → Capital Vault™ | **Queued** |
| Hiring™ → Talent Observatory™ | **Waiting Approval** |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| **Waiting** | Scoped · not yet queued |
| **Queued** | In Generation Manager™ queue |
| **Generating** | Provider job active |
| **Waiting Approval** | Output ready · Creative Approval Pipeline™ |
| **Retrying** | Retry Engine™ active |
| **Blocked Dependency** | Upstream asset/layer incomplete |
| **Paused** | Operator pause |

---

## Priority Rules

| Priority | Use |
|----------|-----|
| **Critical** | Golden Build™ blocker · launch gate |
| **High** | Department completion path |
| **Normal** | Standard production |
| **Low** | Polish · optional layers |
| **Backlog** | Deferred optimization |

Operators may reprioritize — logged in production history.

---

## Queue Panel Layout

```
PRODUCTION QUEUE                    [Filter] [Sort: Priority]
────────────────────────────────────────────────────────────
● CDS → Lighting System™     Generating    $0.42   1m 20s
○ Finance → Capital Vault™   Queued        $1.12   3m 40s
○ CDS → Mood Wall™           Waiting       $0.28   45s
◐ Hiring → Talent Observatory  Waiting Approval  $0.65  —
```

---

## Required Fields Per Item

Every generation **must** have:

- Priority
- Status
- Estimated Cost
- Estimated Time
- Dependencies
- Assigned Blueprint

Missing fields block queue promotion to **Queued**.

---

## Integration

| System | Role |
|--------|------|
| [Generation Manager™](../../studio-os/engines/generation-manager/README.md) | Job state source |
| [Production Estimates™](../../studio-os/studio-production-estimates/README.md) | Estimated cost/time |
| [Creative Approval Pipeline™](../../studio-os/creative-direction-pipeline/) | Waiting Approval state |
| [Scene Stack™](../../studio-os/scene-stack/README.md) | Layer-level queue items |

---

_Production Queue™ — the manufacturing floor._

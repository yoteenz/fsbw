# Department Analytics™

**Module:** `studio-alpha.production-dashboard.v1.departments`  
**Status:** Per-department production intelligence

---

## Purpose

Answer: *How much has Creative Direction Studio™ cost to build?* · *Which departments are complete?* · *Which still need production?*

Every department in the Studio World™ build plan receives a full analytics profile.

---

## Department Analytics Schema

```yaml
DepartmentAnalytics:
  departmentId: string
  departmentLabel: string           # "Creative Direction Studio™"
  completionPercent: number
  productionBudgetUsd: number       # internal allocated budget
  actualCostUsd: number
  estimatedRemainingCostUsd: number
  generatedAssets: number
  reusedAssets: number
  blueprintsUsed: number
  systemsUsed: number
  approvalCount: number
  generationHistory: GenerationHistoryEntry[]
  goldenBuildStatus:
    - not_started
    - in_progress
    - golden_build_achieved
    - certified
    - live
    - evolution
    - legacy
```

---

## Metrics Definitions

| Field | Definition |
|-------|------------|
| **Completion %** | Scene + station + asset manifest weighted completion |
| **Production Budget** | Internal Studio Alpha™ allocation for this department |
| **Actual Cost** | Sum of all generation cost attributed to department |
| **Estimated Remaining Cost** | Forecast to reach target lifecycle stage |
| **Generated Assets** | Net-new assets created for department |
| **Reused Assets** | Registry assets inherited · not regenerated |
| **Blueprints Used** | Creative Blueprints™ applied |
| **Systems Used** | Coordinated Systems™ inherited |
| **Approval Count** | Founder + internal approvals recorded |
| **Generation History** | Chronological job log with cost · status · blueprint |
| **Golden Build Status** | [Production Lifecycle™](../../studio-os/production-lifecycle/) stage |

---

## Example — Creative Direction Studio™

```
Creative Direction Studio™
────────────────────────────────────
Completion %              72%
Production Budget         $2,400.00
Actual Cost               $1,842.16
Est. Remaining            $412.00
────────────────────────────────────
Generated Assets          142
Reused Assets             89
Blueprints Used           6
Systems Used              24
Approvals                 318
Golden Build Status       Golden Build Achieved
```

---

## Department Comparison Table

Operators can sort departments by:

| Sort key | Use |
|----------|-----|
| Actual Cost | Highest spend departments |
| Remaining Cost | Budget risk |
| Completion % | Build velocity |
| Reuse ratio | Efficiency |
| Golden Build Status | Certification pipeline |

---

## Generation History Entry

```yaml
GenerationHistoryEntry:
  jobId: string
  timestamp: ISO8601
  label: string
  costUsd: number
  status: completed | failed | cancelled
  blueprintId: string | null
  provider: string
  model: string
  reuse: boolean
```

---

## Drill-Down

Department row → [Scene Analytics](./scene-analytics.md) filtered to department → [Roadmap View](./roadmap-view.md) subtree.

---

_Department Analytics™ — every department accountable._

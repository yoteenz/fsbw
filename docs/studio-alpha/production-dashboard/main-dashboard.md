# Studio World Production — Main Dashboard

**Module:** `studio-alpha.production-dashboard.v1.main`  
**Status:** Top-level Studio World™ progress and cost

---

## Header

```
STUDIO WORLD PRODUCTION
The Mission Control of Studio World™
Studio Alpha™ · Internal Only
```

---

## Overall Progress Panel

| Field | Definition |
|-------|------------|
| **Overall Completion %** | Weighted completion across all departments in Studio World™ build plan |
| **Departments Complete** | Count at Golden Build™ certified or Live™ |
| **Scenes Complete** | Scenes with all required layers approved |
| **Stations Complete** | Interactive stations ready in department runtime |
| **Assets Generated** | Total net-new assets created (lifetime Studio World build) |
| **Blueprints Created** | Creative Blueprints™ authored for platform |
| **Systems Created** | Coordinated Systems™ defined |
| **Packages Created** | Department Packages™ assembled |
| **Marketplace Assets** | Assets published to Blueprint / Historic HQ marketplace |

---

## Cost Panel

| Field | Definition |
|-------|------------|
| **Total Production Cost** | Sum of all actual generation cost (GPU + internal labor allocation if tracked) |
| **Estimated Remaining Cost** | Forecast to complete Studio World™ build plan |
| **Total Estimated Studio World Cost** | `totalProductionCost + estimatedRemainingCost` |

### Example Layout

```
┌─────────────────────────────────────────────────────┐
│  STUDIO WORLD PRODUCTION                            │
├─────────────────────────────────────────────────────┤
│  Overall Completion          34%                    │
│  Departments Complete        2 / 18                 │
│  Scenes Complete             14 / 89                │
│  Stations Complete           31 / 124               │
├─────────────────────────────────────────────────────┤
│  Assets Generated            4,218                  │
│  Blueprints Created          47                     │
│  Systems Created             186                    │
│  Packages Created            12                     │
│  Marketplace Assets          8                      │
├─────────────────────────────────────────────────────┤
│  Total Production Cost       $18,442.18             │
│  Estimated Remaining         $41,200.00             │
│  Total Est. Studio World     $59,642.18             │
└─────────────────────────────────────────────────────┘
```

---

## Completion Weighting (v1)

```
overallCompletion = Σ (departmentWeight × departmentCompletion) / Σ departmentWeight

departmentCompletion derived from:
  - Golden Build status (0–40%)
  - Scene layer completion (0–35%)
  - Asset manifest approval (0–25%)
```

Configurable per Studio World™ build plan.

---

## Drill-Down Navigation

| Click target | Navigates to |
|--------------|--------------|
| Departments Complete | [Department Analytics](./department-analytics.md) |
| Scenes Complete | [Scene Analytics](./scene-analytics.md) |
| Total Production Cost | [Generation Analytics](./generation-analytics.md) |
| Blueprints Created | [Blueprint Analytics™](./blueprint-analytics.md) |
| Overall Completion | [Roadmap View](./roadmap-view.md) |

---

## Refresh Cadence

| Data | Refresh |
|------|---------|
| Queue · generating jobs | Real-time (Event Bus™) |
| Cost totals | On job complete + hourly rollup |
| Completion % | On approval events |
| Remaining cost forecast | Daily + on plan change |

---

_Main Dashboard — Studio World™ at a glance._

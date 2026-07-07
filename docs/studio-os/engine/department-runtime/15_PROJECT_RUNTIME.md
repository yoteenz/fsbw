# 15 — Project Runtime

**Engine Module:** `studio.department-runtime.v1.project`  
**Status:** Project-as-runtime-object specification  
**Parent:** [Studio Project™ Model](../../project-model.md)

---

## Definition

**Project Runtime** binds the active **Project** as a first-class living object inside the department — carrying creative direction, assets, progress, and outputs across the Headquarters.

> Everything follows the Project.

---

## Project Runtime Object

```yaml
ProjectRuntimeContext:
  projectId: string
  projectCode: string                 # PROJECT-001
  title: string
  status: enum                      # active | review | approved | launched | archived

  # Creative
  creativeDirection: CreativeDirectionBundle
  moodBoard: MoodBoardRef
  founderNotes: FounderNote[]
  projectGenome: ProjectGenomeOverlay

  # Assets
  assets: ProjectAsset[]
  versions: VersionLineage[]
  masterAsset: AssetRef | null      # protagonist in transit

  # Execution
  progress: ProgressMetrics
  timeline: Milestone[]
  outputs: OutputRef[]
  analytics: AnalyticsSnapshot

  # Spatial
  homeDepartment: string            # where project lives
  currentDepartment: string         # where user is now
  travelHistory: DepartmentVisit[]

  # State
  blockers: Blocker[]
  pendingApprovals: ApprovalItem[]
  lastActivityAt: datetime
```

---

## Project Hydration

On department ACTIVE, Project Runtime hydrates objects:

| Object | Hydration |
|--------|-----------|
| Project Board | Tasks, blockers, collaborators |
| Timeline Table | Milestones, deadlines |
| Asset Shelf | Project assets from Registry |
| Mood Wall | Project mood + Genome refs |
| Interactive Wall | Project references, pins |
| Preview Screen | Active output preview |
| Approval Station | Pending approvals |
| Floating Panels | Project status metrics |

---

## Project Travel

Projects **physically travel** through departments (Experience DNA):

```
Creative Direction (brief approved)
    → handoff animation
    → Storyboarding (sequence defined)
    → Production (assets built)
    → Review (quality gate)
    → Publishing (launch)
```

Runtime tracks `travelHistory` and updates `currentDepartment`.

---

## Project Events

| Event | Runtime Response |
|-------|------------------|
| `project-activated` | Hydrate all objects |
| `milestone-completed` | Timeline pulse + optional celebration |
| `approval-required` | Approval Station illuminate |
| `output-ready` | Exit portal glow |
| `blocker-detected` | Production Manager + Orb alert |
| `project-launched` | Launch celebration profile |

---

## Project ↔ Department Binding

- One **active** project per department visit (configurable: multi-project shelf)
- Project Genome overlays Company Genome per 13
- Output ports emit when exit criteria met

---

## Analytics (Runtime Surface)

Progress metrics on Project Board and Floating Panels — sourced from platform analytics service, not invented by Runtime.

---

_Next: [16 — Performance System](./16_PERFORMANCE_SYSTEM.md)_

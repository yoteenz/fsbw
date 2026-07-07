# 14 — State Manager

**Engine Module:** `studio.department-runtime.v1.state`  
**Status:** Unified state specification

---

## Definition

The **State Manager** maintains all runtime state domains — enabling BACKGROUND preservation, session resume, collaboration continuity, and audit.

---

## State Domains

### Department State

```yaml
DepartmentState:
  departmentId: string
  lifecycle: enum                   # from 01 lifecycle
  assemblyComplete: boolean
  activeZone: string
  genomeSnapshotId: string
  packageVersion: string
  lastVisitedAt: datetime
```

### Project State

Bound via Project Runtime (15) — active project ID, hydration level, output port status.

### AI State

```yaml
AIState:
  concierges: Map<instanceId, ConciergeState>
  orb: OrbState
  pendingEscalations: Escalation[]
  collaborationQueue: CollaborationExchange[]
```

### Object State

```yaml
ObjectStateMap:
  objects: Map<instanceId, {
    state: ObjectState
    content: any
    pins: Pin[]
    annotations: Annotation[]
    selection: string | null
  }>
```

### Review State

```yaml
ReviewState:
  pendingReviews: ReviewItem[]
  activeComparison: ComparisonSet | null
  approvalQueue: ApprovalItem[]
```

### Approval State

```yaml
ApprovalState:
  pending: ApprovalItem[]
  completed: ApprovalRecord[]
  ceremonyInProgress: boolean
```

### Animation State

```yaml
AnimationState:
  activePlaybacks: AnimationPlayback[]
  reducedMotion: boolean
  ceremonyLock: boolean
```

### User Session

```yaml
UserSessionState:
  userId: string
  permissions: PermissionSet
  preferences: UserPreferences
  navigationHistory: NavigationHistory
  verbHistory: VerbRecord[]
  focusObject: string | null
```

---

## State Persistence

| Domain | BACKGROUND | UNLOAD | Cross-Session |
|--------|------------|--------|---------------|
| Department | ✓ memory | ✓ snapshot | package version only |
| Object content | ✓ | ✓ | ✓ server sync |
| AI memory (session) | ✓ | flush to dept | — |
| AI memory (org) | ✓ | ✓ | ✓ |
| Navigation history | ✓ | ✓ | ✓ |
| Approval pending | ✓ | ✓ | ✓ |
| Animation | reset | reset | — |

---

## State Sync

```
Verb completed → Object State update
    → Review/Approval State if applicable
    → AI State triggers
    → Project State update
    → Event Bus emission
    → Optional server persist
```

---

## Concurrency

- One `ACTIVE` verb per user per zone
- Ceremony lock blocks conflicting verbs
- AI collaboration serialized per object

---

## State Snapshot API

```yaml
RuntimeStateSnapshot:
  department: DepartmentState
  project: ProjectState
  ai: AIState
  objects: ObjectStateMap
  review: ReviewState
  approval: ApprovalState
  animation: AnimationState
  session: UserSessionState
  capturedAt: datetime
```

Used for BACKGROUND resume and crash recovery.

---

_Next: [15 — Project Runtime](./15_PROJECT_RUNTIME.md)_

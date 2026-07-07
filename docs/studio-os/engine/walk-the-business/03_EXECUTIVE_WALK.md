# 03 — Executive Walk

**Engine Module:** `studio.walk-the-business.v1.executive-walk`  
**Status:** Daily path through Headquarters  
**Philosophy:** The founder physically moves through their business.

---

## Design Principle

> The founder **walks** — not clicks a sidebar. Each department is a destination on the studio lot.

---

## Canonical Executive Path (Creative Agency HQ)

Default path for creative/production headquarters:

```
EXECUTIVE OFFICE / ARRIVAL PLAZA
    ↓
CREATIVE DIRECTION STUDIO
    ↓
PRODUCTION DEPARTMENT
    ↓
MARKETING DEPARTMENT
    ↓
PUBLISHING CENTER
    ↓
CUSTOMER EXPERIENCE
    ↓
MARKETPLACE
    ↓
OPERATIONS
    ↓
ANALYTICS OBSERVATORY
    ↓
INNOVATION LAB
    ↓
RETURN TO EXECUTIVE PLAZA (conclusion)
```

**Rule:** Path adapts to headquarters type and installed departments. Uninstalled buildings are **absent** — not grayed-out icons.

---

## Stop Schema

```yaml
ExecutiveWalkStop:
  stopId: string
  sequence: number
  departmentId: string
  buildingId: string
  displayName: string

  narrativeRole: string         # why this stop matters today
  healthSnapshot: DepartmentHealth
  prioritySignals: PrioritySignal[]

  estimatedDuration: string     # "~2 min"
  skipInPriorityMode: boolean
  requiredForFullWalk: boolean

  cameraEntry: CameraPreset
  conciergeGreeting: ConciergeGreeting | null
```

---

## Path Profiles by Headquarters Type

| HQ Type | Path Emphasis |
|---------|---------------|
| Creative Agency | Creative Direction → Production → Marketing → Publishing |
| Law Firm | Intake → Case Management → Billing → Client Experience |
| Salon | Booking → Service Floor → Retail → Client Loyalty |
| Restaurant | Kitchen → Service → Reservations → Marketing |
| Film Studio | Development → Production Lot → Post → Distribution |

Headquarters Engine registers `executiveWalkProfile` per type.

---

## Movement Behavior

| Behavior | Detail |
|----------|--------|
| **Walk pace** | Editorial · founder-controlled · never rushed |
| **Camera** | Follows founder · cinematic transitions between buildings |
| **Skip** | Founder: "Skip to Marketing" — path marks skipped · revisitable |
| **Deep-dive** | Founder enters department — walk pauses · resumes on exit |
| **Cross-lot travel** | Ceremonial — see Production Engine travel between buildings |

---

## Priority Walk Resolution

```
Input: approvalQueue · at-risk projects · growthSignals · executiveMoments
    ↓
PriorityScorer ranks departments
    ↓
Select 4–7 stops maximum
    ↓
Narrative order (not pure severity sort — flow matters)
    ↓
Orb previews path: "Today I'll take you to Production, Marketing, and Creative Direction."
```

Priority walk **never** visits every building.

---

## Department Status at Each Stop

Every stop answers three questions **spatially**:

1. **What happened while I was away?**
2. **What needs my attention?**
3. **What's going well?**

Answers come from Department Behavior (04) — not text panels.

---

## Walk Transcript

```yaml
ExecutiveWalkTranscript:
  walkId: string
  entries:
    - type: enum                # arrival · movement · orb-guidance · concierge · moment · command · branch
      timestamp: ISO8601
      departmentId: string | null
      content: string
      spatialContext: Vector3 | null
```

Feeds Walk Conclusion (11) and institutional memory.

---

## Branch Points

| Branch | Trigger |
|--------|---------|
| Enter department work | Founder walks through door · work mode |
| Walk the Room™ | Critique needed on project |
| Critique Session | Approval requires dialogue |
| Approval inline | Quick founder decision at stop |
| Free explore | Founder abandons guided path |

Walk state preserved for resume.

---

## Integration with Production Engine

Executive path maps to **Studio Production Engine™** department buildings:

| Walk Stop | Production Department |
|-----------|----------------------|
| Creative Direction Studio | Above production — direction layer |
| Production | Discover · Development · Production · Review |
| Marketing | Marketing department |
| Publishing | Publishing department |

Project objects visibly move along lot during walk.

---

_Next: [04 — Department Behavior](./04_DEPARTMENT_BEHAVIOR.md)_

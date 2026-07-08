# Routine Framework™

**Structure of a Guided Journey**

---

## Purpose

Define the canonical structure of a **Routine™** — steps · states · completion · and relationship to the Scene Architecture™ hierarchy.

---

## Routine Definition

| Property | Required | Description |
|----------|----------|-------------|
| **Routine ID** | Yes | Stable identifier (`launch-product`, `hire-employee`) |
| **Display name** | Yes | Founder-facing outcome name (Launch Product™) |
| **Goal™** | Yes | Business objective statement |
| **Category** | Yes | Launch · Hiring · Brand · Executive · Creative · Operations |
| **Steps** | Yes | Ordered journey legs |
| **Entry condition** | Yes | When routine is available |
| **Completion criteria** | Yes | What marks Routine Complete™ |
| **Estimated duration** | Recommended | Founder expectation setting |
| **Dependencies** | Optional | Prerequisites · assets · approvals |
| **Adaptation profile** | Optional | Shortcut · skip rules |

---

## Step Structure

Each routine step maps to Scene Architecture™:

```typescript
interface RoutineStep {
  id: string;
  order: number;
  departmentId: string;      // Department™ destination
  sceneId: string;           // Scene™ place
  workspaceId?: string;        // Workspace™ activity
  tasks: RoutineTask[];        // Required Task™ completions
  optional: boolean;           // Can Intelligent Shortcut™ skip?
  transitionToNext: TransitionType;  // Physical movement
  orbIntro: string;            // Orb guidance line
  completionSignal: string;    // What "done" means here
}
```

---

## Routine States

| State | Description |
|-------|-------------|
| **Available** | Prerequisites met · founder can start |
| **Starting** | Routine Start™ ceremony in progress |
| **Active** | Founder on journey |
| **Paused** | Interruption™ — resume state saved |
| **Blocked** | Dependency unmet · Orb explains |
| **Completing** | Final step done · summary |
| **Complete** | Routine Complete™ · memory recorded |
| **Archived** | Historical reference in Company Memory™ |

---

## Routine Start™ Ceremony

Mandatory opening for every routine:

| Phase | Content |
|-------|---------|
| 1. **Arrival Scene™** | First department threshold — never mid-work |
| 2. **Orb greeting** | Personal · contextual |
| 3. **Objective brief** | What this routine accomplishes |
| 4. **Journey preview** | Departments · scenes · estimated path |
| 5. **Dependency check** | Missing items surfaced |
| 6. **Recent changes** | Since last routine or visit |
| 7. **Begin** | Founder confirms · first step activates |

---

## Step Progression

```
Step N active
    ↓
Founder completes Task™(s) in Workspace™
    ↓
Step N completion signal fires
    ↓
Orb acknowledges · brief summary
    ↓
Transition™ to Step N+1 department/scene
    ↓
Arrival at next destination (abbreviated if return visit)
    ↓
Step N+1 active
```

---

## Routine Complete™

When all required steps complete:

| Beat | Content |
|------|---------|
| **Summary** | What was accomplished |
| **Artifacts** | What was created · approved · published |
| **Memory write** | Routine Memory™ recorded |
| **Taste learning** | Founder Taste Engine™ updated |
| **Next suggestions** | Orb offers related routines |
| **Celebration** | Appropriate World State™ acknowledgment |

---

## Canonical Example: Launch Product™

```
Goal™: Launch Product™
Routine™: Launch Product Routine™

Step 1: Creative Direction Studio™ → Story Table Scene™ → Asset Creation Workspace™
        Task™: Golden Build™ approved
        Transition™: Executive Corridor™

Step 2: Distribution™ → Campaign Workspace™
        Task™: Launch campaign configured
        Transition™: Glass bridge

Step 3: Marketing™ → Launch Calendar Scene™
        Task™: Calendar populated
        Transition™: Skywalk

Step 4: Analytics™ → Performance Workspace™
        Task™: Tracking verified

Completion™: Routine Complete™
```

---

## Canonical Example: Hire Employee™

```
Goal™: Hire Employee™

Step 1: Hiring™ → Talent Discovery Scene™
Step 2: Hiring™ → Candidate Comparison Scene™
Step 3: Hiring™ → Founder Review Scene™
Step 4: Hiring™ → Offer Room Scene™
Step 5: Operations™ → Team Assignment Workspace™

Completion™: Routine Complete™
```

---

## Canonical Example: Weekly Executive Review™

```
Goal™: Weekly Executive Review™

Step 1: Headquarters™ → Intelligence™ → Company Genome Scene™
Step 2: Analytics™ → Metrics Observatory Scene™
Step 3: Finance™ → Revenue Observatory Scene™
Step 4: Operations™ → Operations Command Scene™
Step 5: Headquarters™ → Executive Summary Scene™

Completion™: Routine Complete™
```

---

## Optional vs Required Steps

| Type | Intelligent Shortcut™ |
|------|----------------------|
| **Required** | Skip only if completion already verified |
| **Optional** | Skip by default if no value add |
| **Conditional** | Activate based on company state |

---

## Routine and Production Lifecycle™

Routines respect [Production Lifecycle™](../production-lifecycle/README.md) stages:

| Lifecycle need | Routine step type |
|----------------|-------------------|
| Blueprint™ | Creative · strategy steps |
| Golden Build™ | Production pipeline steps |
| Certified™ | Review · validation steps |
| Live™ | Launch · distribution steps |
| Legacy™ | Archive · chronicle steps |

---

## Cross-References

- [routine-engine.md](./routine-engine.md)
- [future-routine-library.md](./future-routine-library.md)
- [department-framework.md](../navigation/department-framework.md)

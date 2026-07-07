# 01 — Experience Overview

**Engine Module:** `studio.walk-the-business.v1.overview`  
**Status:** Canonical experience definition

---

## What Is Walk the Business™?

Walk the Business™ is the **canonical daily operating experience** for Studio OS — the executive ritual where every morning the founder feels like they are **physically arriving at their Headquarters** before work begins.

> The Headquarters itself becomes the dashboard.

---

## Core Philosophy

> People don't start their workday by staring at spreadsheets. Business owners naturally think: *"What needs my attention today?"*

Studio OS answers that question by letting them **walk through their business** — not read about it.

| Anti-Pattern (Rejected) | Walk the Business (Canonical) |
|---------------------------|-------------------------------|
| Login → widget dashboard | Login → Headquarters arrival |
| KPI cards and charts first | Environment and departments first |
| Notification inbox | Concierges and Orb in context |
| Static department icons | Living departments with visible activity |
| "Check analytics" | "Walk the business" |

---

## Mission

Design Walk the Business™ so:

1. Every department communicates health through **environment**, **AI employees**, **activity**, and **visual state**
2. Founder understands business state **by walking** — not reading reports
3. Orb guides proactively — never overwhelms
4. Walk concludes with **clear daily priorities**
5. Headquarters **evolves visibly** as business grows
6. Experience becomes the **defining daily ritual** of Studio OS

---

## Participants

| Participant | Role |
|-------------|------|
| **Founder** | Executive arriving for the day |
| **Studio Orb™** | Executive Assistant · walk guide |
| **AI Concierges™** | Department staff · updates · approvals |
| **Headquarters** | Living environment · health expression |
| **Departments** | Buildings that communicate status |

---

## Inputs

```yaml
WalkTheBusinessInput:
  sessionId: string
  founderId: string
  companyId: string

  # Temporal context
  localTime: ISO8601
  lastWalkAt: ISO8601 | null
  awayDuration: duration              # since last session

  # Business state snapshot
  headquartersState: HeadquartersStateSnapshot
  departmentHealth: DepartmentHealthMap
  projectPipeline: ProjectPipelineSnapshot
  approvalQueue: ApprovalQueueSnapshot
  growthSignals: GrowthSignalSnapshot
  executiveMoments: ExecutiveMoment[]  # queued organic moments

  # Walk config
  walkScope: enum | null              # full | priority | summary | free-explore
  founderPreference: DailyWalkPreference | null
```

---

## Outputs

```yaml
WalkTheBusinessOutput:
  walkId: string
  status: enum                        # active | paused | completed | skipped

  walkTranscript: ExecutiveWalkTranscript
  departmentsVisited: string[]
  momentsExperienced: ExecutiveMoment[]
  approvalsSurfaced: ApprovalRef[]
  prioritiesIdentified: DailyPriority[]

  dailyBrief: DailyExecutiveBrief     # conclusion artifact
  suggestedFocus: FocusRecommendation[]
  branchesTaken: WalkBranch[]         # e.g., entered Walk the Room

  nextRecommendedAction: enum         # begin-work | deep-dive-department | critique-session
```

---

## Lifecycle

```
LOGIN / RETURN
    ↓
ARRIVAL (HQ fades in · morning light · departments online)
    ↓
ORB_WELCOME (scope selection)
    ↓
EXECUTIVE_WALK (path through departments)
    ├─ Department behavior updates at each stop
    ├─ Orb proactive guidance
    ├─ Concierge greetings · requests
    ├─ Executive moments (organic)
    └─ Founder commands (redirect · deep-dive)
    ↓
┌─ BRANCH: department work · Walk the Room · Critique Session
└─ WALK_CONCLUSION (Orb daily brief)
    ↓
BEGIN_WORK (founder enters chosen department)
    ↓
HQ_CONTINUES_LIVING (background activity until next walk)
```

---

## Daily Ritual Cadence

| Pattern | Behavior |
|---------|----------|
| **First login of day** | Full arrival sequence · walk offered |
| **Return same day** | Abbreviated arrival · "Welcome back" · optional mini-walk |
| **Skipped walk** | Founder may explore freely — brief still generated async |
| **Multi-founder** (future) | Shared HQ state · personal walk scope |

Default: **Walk offered every morning.** Never mandatory — always valuable.

---

## Relationship Map

### Headquarters Engine™

Walk the Business operates across full HQ hierarchy: Buildings → Departments → Workspaces. The walk path is configurable per headquarters type (law firm · salon · creative agency · etc.).

### Walk the Room™

When walk surfaces work needing critique, founder may branch:

```
Executive Walk → Production stop → "Review Project 014" → Walk the Room™
```

Walk the Business **orients**. Walk the Room **critiques**.

### Experience Engine™

Morning arrival triggers:
- Time-of-day lighting (morning warmth)
- Founder Mode atmosphere
- Health-driven environment modifiers (07)

### Studio Production Engine™

Executive walk path follows production lot: Creative Direction → Production → Review → Marketing → Publishing.

### Living Creative Headquarters Experience™

Founder = Studio Director · Orb = Executive Creative Director · Departments = buildings on the lot.

---

## The Heartbeat Principle

Walk the Business is **not a feature** in the navigation menu. It **is** what happens when Studio OS starts.

> As iconic as News Feed · Timeline · Dock — the ritual users associate with the platform.

---

_Next: [02 — Arrival Experience](./02_ARRIVAL_EXPERIENCE.md)_

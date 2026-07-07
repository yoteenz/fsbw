# 13 — Implementation Guide

**Engine Module:** `studio.walk-the-business.v1.implementation`  
**Status:** Abstract engineering roadmap  
**Philosophy:** Architecture only. No production code in this sprint.

---

## Implementation Scope

Walk the Business™ is the **default Studio OS entry experience** — orchestration across Headquarters Runtime, Experience Engine, department behaviors, Orb intelligence, and daily brief generation. **Not** a homepage dashboard component.

---

## Recommended Subsystems

| Subsystem | Responsibility | Doc |
|-----------|----------------|-----|
| `DailyWalkOrchestrator` | Session lifecycle · scope · path | 01, 03 |
| `ArrivalDirector` | Morning sequence · away summary | 02 |
| `ExecutivePathResolver` | Full vs priority paths | 03 |
| `DepartmentBehaviorEngine` | Live status expression | 04 |
| `OrbExecutiveAssistant` | Guidance queue · translation | 05 |
| `ConciergeDailyPresence` | Greetings · approvals · celebrations | 06 |
| `HeadquartersHealthComputer` | Health → environment modifiers | 07 |
| `ExecutiveMomentScheduler` | Organic moments | 08 |
| `WalkCommandParser` | Natural navigation | 09 |
| `WorldEvolutionSurfacer` | Growth visibility on walk | 10 |
| `DailyBriefGenerator` | Conclusion artifact | 11 |
| `WalkTheRoomBridge` | Critique branch | 01 |
| `ExperienceEngineBridge` | Morning · health atmosphere | 02, 07 |

---

## Suggested Build Phases

### Phase 1 — Morning Arrival

| Deliverable | Milestone |
|-------------|-----------|
| Login → HQ arrival (not dashboard) | Default entry route |
| Arrival sequence · Orb welcome | Scope selection |
| Quick Summary brief | Orb spoken priorities |
| `DailyExecutiveBrief` schema | Persisted artifact |

**Milestone:** Founder logs in · hears morning brief · enters one department.

### Phase 2 — Executive Walk

| Deliverable | Milestone |
|-------------|-----------|
| Executive path (5 stops minimum) | Plaza → Creative → Production → Marketing → Plaza |
| Priority walk resolver | Approvals · risks first |
| Walk commands | "Take me to Production" |
| Department health → activity level | Visual difference quiet vs active |

**Milestone:** Founder completes 10-minute priority walk.

### Phase 3 — Living Departments

| Deliverable | Milestone |
|-------------|-----------|
| `DepartmentLiveBehavior` per production dept | Motion · concierges · pending work visible |
| Concierge greetings · approval requests | Spatial — no toasts |
| Headquarters health environment modifiers | Thriving vs attention |
| Away-state delta | Progress since last visit |

**Milestone:** Production visibly different after overnight progress.

### Phase 4 — Moments & Evolution

| Deliverable | Milestone |
|-------------|-----------|
| Executive moments scheduler | Celebration + concern |
| World evolution surfacing | New building on walk |
| Walk conclusion brief | Full daily executive brief |
| Walk the Room branch | From approval stop |

**Milestone:** Full morning ritual end-to-end.

### Phase 5 — Platform Heartbeat

| Deliverable | Milestone |
|-------------|-----------|
| All HQ types path profiles | Law firm · salon · agency |
| Campus Evolution integration | Tier visual upgrades |
| CoS intelligence feed | Orb priority queue |
| Multi-department Marketplace stops | Expansion recommendations |

**Milestone:** Walk the Business is **the** Studio OS login experience.

---

## Service Boundaries

```
┌─────────────────────────────────────────────────────────┐
│  STUDIO OS ENTRY                                          │
│  Login → Walk the Business Orchestrator (default)         │
└───────────────────────────┬─────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  HEADQUARTERS RUNTIME (spatial world)                     │
│  Buildings · Departments · Navigation · Health expression │
└───────┬─────────────┬─────────────┬─────────────────────┘
        ↓             ↓             ↓
┌──────────────┐ ┌──────────┐ ┌─────────────────────────┐
│ Experience   │ │ Studio   │ │ Intelligence feeds       │
│ Engine       │ │ Orb      │ │ CoS · Analytics · Projects│
└──────────────┘ └──────────┘ └─────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│  BRANCH: Department work · Walk the Room · Critique      │
└─────────────────────────────────────────────────────────┘
```

---

## API Surface (Abstract)

```yaml
WalkTheBusinessAPI:
  walks:
    - POST /daily-walks                 # initiate (login hook)
    - GET  /daily-walks/{id}
    - POST /daily-walks/{id}/command
    - POST /daily-walks/{id}/complete
    - POST /daily-walks/{id}/skip

  briefs:
    - GET  /daily-briefs/today
    - GET  /daily-briefs/{date}

  health:
    - GET  /headquarters/health

  moments:
    - GET  /daily-walks/{id}/moments
    - POST /daily-walks/{id}/moments/{mid}/defer
```

---

## Runtime Contract: DailyWalkCapable

Every department on executive path implements:

```yaml
DailyWalkCapable:
  departmentId: string
  executiveWalkStop: ExecutiveWalkStop
  liveBehavior: DepartmentLiveBehavior
  conciergeRoster: AIRoleId[]
  healthExpression: HealthExpression
  approvalSurface: ApprovalSurface | null
  onFounderApproach: FounderApproachHandler
```

Golden path reference: Creative Direction Studio → Production → Marketing → Publishing.

---

## Default Entry Hook

```yaml
StudioOSEntryPolicy:
  defaultExperience: walk-the-business
  fallbackExperience: free-explore-hq    # only if walk explicitly disabled
  dashboardRoute: forbidden-as-default   # no /admin/dashboard as login landing
```

**Critical:** Engineering must not mount widget dashboard as login destination.

---

## Data Stores

| Store | Contents |
|-------|----------|
| `daily_walk_sessions` | Walk metadata · scope · status |
| `daily_executive_briefs` | Conclusion artifacts |
| `headquarters_health_snapshots` | Health history |
| `executive_moments_queue` | Scheduled moments |
| `world_evolution_events` | Growth events |
| `walk_transcripts` | Executive walk log |

---

## Success Criteria

1. Login lands in Headquarters — **not** dashboard
2. Arrival sequence plays on first daily visit
3. Founder completes priority walk in <15 minutes
4. Department health visible without reading numbers
5. Orb brief matches founder's actual priorities (validated over time)
6. Concierge approval request — zero notification toasts
7. Founder says "I walked my business" — not "I checked dashboard"
8. Walk the Room branches cleanly from walk stop

---

## Schema Namespace

```
studio.walk-the-business.v1
├── walk-session
├── arrival-config
├── executive-walk-stop
├── executive-walk-path
├── department-live-behavior
├── headquarters-health
├── orb-guidance
├── executive-moment
├── daily-executive-brief
├── daily-priority
├── world-evolution-event
└── executive-walk-command
```

---

## Canonical Statement

> Walk the Business™ becomes the canonical daily operating ritual for every Headquarters built on Studio OS. It is the heartbeat of the platform.

Engineering builds the morning ritual first. Dashboards may exist elsewhere — they do **not** replace the walk.

---

_End of Walk the Business™ Experience Specification._

# 01 — Adaptive Overview

**Engine Module:** `studio.adaptive-walk.v1.overview`  
**Status:** Canonical intelligence layer definition

---

## What Is Adaptive Walk™?

Adaptive Walk™ is the **intelligence layer** that orchestrates [Walk the Business™](../walk-the-business/README.md) — ensuring no two executive walkthroughs feel exactly the same.

> A CEO doesn't receive the same briefing every morning. Studio OS recognizes quiet days · launch days · crisis days · celebration days — and adapts.

---

## Core Philosophy

| Day Type | Executive Reality |
|----------|-------------------|
| **Quiet** | Explore · calibrate · low urgency |
| **Launch** | Publishing · Marketing · Review dominate |
| **Crisis** | Problems first — nothing else until resolved |
| **Celebration** | Milestones · wins · pride before tasks |
| **Creative sprint** | Direction · mood · story · photography |
| **Operations** | CX · support · inventory · finance |
| **Innovation** | Marketplace · experiments · new capabilities |

Adaptive Walk generates a **unique executive experience** for each — not a scripted tour.

---

## Mission

Instead of a fixed route, Studio OS dynamically generates today's walk based on:

- Business activity
- Project status
- Priorities · opportunities · risks
- Celebrations pending
- Founder preferences (Long-Term Memory)
- Company Genome™ expression

---

## Inputs

```yaml
AdaptiveWalkInput:
  sessionDate: ISO8601
  founderId: string
  companyId: string

  # Business signals
  businessActivity: ActivitySnapshot
  projectPipeline: ProjectPipelineSnapshot
  approvalQueue: ApprovalQueueSnapshot
  launchCalendar: LaunchEvent[]
  riskSignals: RiskSignal[]
  opportunitySignals: OpportunitySignal[]
  celebrationQueue: CelebrationEvent[]
  systemAlerts: SystemAlert[]

  # Context
  headquartersHealth: HeadquartersHealth
  companyGenome: CompanyGenomeSnapshot
  founderMemory: AdaptiveWalkMemoryProfile
  awayDuration: duration
  dayOfWeek: enum
  priorWalkMode: WalkMode | null
```

---

## Outputs

```yaml
AdaptiveWalkOutput:
  adaptiveWalkId: string
  resolvedMode: WalkMode
  modeConfidence: number
  modeRationale: string[]           # internal — Orb may cite selectively

  generatedPath: AdaptiveWalkPath
  headquartersStory: HeadquartersStory
  environmentProfile: DynamicHQProfile
  orbPersonality: OrbAdaptationProfile
  executivePriorities: ExecutivePriorityStack

  personalizationApplied: PersonalizationDelta[]
  founderOverrideActive: boolean | null

  walkTheBusinessHandoff: WalkTheBusinessInput   # populates Walk the Business session
```

---

## Lifecycle

```
LOGIN / DAY START
    ↓
SIGNAL_INGESTION (projects · analytics · approvals · launches · alerts)
    ↓
MODE_RESOLUTION (03) — what kind of day is today?
    ↓
┌─ FOUNDER_OVERRIDE? (09) — accept or adjust mode
└─ PATH_GENERATION — unique stops · order · narrative
    ↓
DYNAMIC_HQ_PROFILE (04) — atmosphere · department emphasis
    ↓
ORB_ADAPTATION (05) — welcome · tone · energy
    ↓
HANDOFF → Walk the Business™ executes walk
    ↓
WALK_IN_PROGRESS — real-time reprioritization if crisis emerges
    ↓
WALK_COMPLETE → MEMORY_UPDATE (10) — habits · skips · dwell time
```

---

## Anti-Repetition Guarantee

| Mechanism | Effect |
|-----------|--------|
| Mode resolution | Different day types → different paths |
| Priority scoring | Same mode · different stops if signals change |
| Personalization | Founder habits reshape emphasis |
| Executive moments | Variable organic encounters |
| Storytelling layer | HQ feels different even on same route |
| Narrative variation | Orb phrasing · concierge updates never templated |

**Test:** Two consecutive quiet Mondays should still differ in stops, moments, and spoken content.

---

## Relationship to Walk the Business

| Walk the Business | Adaptive Walk |
|-------------------|---------------|
| Arrival sequence | Supplies mode + scope |
| Executive Walk (03) | Receives generated path |
| Department Behavior (04) | Receives activity level targets per mode |
| Orb Assistant (05) | Receives personality profile |
| HQ Health (07) | Receives story + modifiers |
| Walk Conclusion (11) | Receives priority stack for brief |

Walk the Business docs describe **how** the walk executes. Adaptive Walk describes **what** today's walk should be.

---

## Canonical Question

> *"What kind of day is today?"*

Not: *"What page would you like to open?"*

---

_Next: [02 — Walk Modes](./02_WALK_MODES.md)_

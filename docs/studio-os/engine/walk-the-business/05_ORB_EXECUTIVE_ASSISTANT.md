# 05 — Orb Executive Assistant

**Engine Module:** `studio.walk-the-business.v1.orb-assistant`  
**Status:** Proactive executive guidance system  
**Philosophy:** The Orb guides — it does not show widgets.

---

## Design Principle

> Instead of widgets, the **Orb becomes the Executive Assistant** — proactively guiding the founder through the walk with context, priority, and calm authority.

Guide — **not interrupt**.

---

## Orb Roles in Daily Walk

| Role | Detail |
|------|--------|
| **Greeter** | Arrival welcome · scope selection |
| **Guide** | Path narration · transitions between stops |
| **Prioritizer** | Surfaces what matters today — ranked · not exhaustive |
| **Connector** | Links moments across departments |
| **Summarizer** | Walk conclusion · daily brief |
| **Router** | Commands → navigation · deep-dives |

Orb is **not** a notification center. Orb **contextualizes**.

---

## Canonical Guidance Examples

| Situation | Orb Says |
|-----------|----------|
| Approvals waiting | "We have **three approvals** waiting — I'll bring you to Creative Direction first." |
| Department attention | "**Marketing** would like your attention before today's launch." |
| Opportunity | "I've discovered a **new opportunity** in the Marketplace wing." |
| Revenue signal | "**Revenue increased 12%** yesterday — Analytics Observatory has the story." |
| Creative spark | "**Creative Direction** has new inspiration overnight on Project 014." |
| Risk | "**One project is falling behind** in Production — Concierge is waiting." |
| Calm day | "A quiet morning. Publishing is on schedule. Shall we do a brief walk or explore?" |

---

## Proactive vs Interrupt

```yaml
OrbGuidancePolicy:
  proactive: boolean              # always on for daily walk
  interruptThreshold: enum        # critical-only · important · all
  maxUnsolicitedPerStop: 2
  deferToConcierge: boolean       # department-specific detail → concierge
  quietHours: boolean             # respect founder focus preferences
```

| Priority | Behavior |
|----------|----------|
| **Critical** | Orb approaches immediately — risk · launch failure · VIP |
| **Important** | Orb mentions at next natural stop |
| **Informational** | Orb available if asked · mentions at conclusion |
| **Celebratory** | Executive Moment (08) — organic timing |

**Rule:** Max **2** unsolicited Orb statements per walk stop. Never pile-on.

---

## Guidance Schema

```yaml
OrbGuidance:
  guidanceId: string
  walkId: string
  stopId: string | null
  priority: enum
  category: enum
    # approval · attention · opportunity · metric · creative · risk · celebration · navigation

  spokenContent: string
  evidence: GuidanceEvidence[]
  suggestedAction: SuggestedAction | null
  deferrable: boolean
```

---

## Widget Translation Layer

Backend intelligence may originate from analytics · orchestration · CoS — Orb **translates** to spatial guidance:

| Backend Signal | Orb Translation |
|----------------|-----------------|
| `approvalQueue.count: 3` | "Three approvals waiting" + route to stop |
| `revenue.delta: +12%` | "Revenue increased 12% yesterday" + Observatory |
| `project.health: at-risk` | "One project falling behind" + Production |
| `marketplace.recommendation` | "New opportunity" + Marketplace wing |

**Never** expose raw widget data during walk.

---

## Relationship to Chief of Staff

Chief of Staff orchestration feeds Orb priority queue. Orb is the **voice** — CoS is the **intelligence layer** behind daily brief.

---

## Orb During Free Explore

When founder chooses Explore Freely:

- Orb follows at guide distance
- Available on summon: "Orb, what needs attention?"
- Generates async `DailyExecutiveBrief` at session end if no formal walk

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Orb reads dashboard metrics verbatim | Breaks spatial philosophy |
| Orb interrupts mid-department work | Walk vs work modes separate |
| Orb guilt-trips inactivity | Supportive · not judgmental |
| Chat bubble stack on screen | Voice · spatial presence only |

---

_Next: [06 — AI Employees](./06_AI_EMPLOYEES.md)_

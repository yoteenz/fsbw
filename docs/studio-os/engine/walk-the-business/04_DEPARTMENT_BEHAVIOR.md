# 04 — Department Behavior

**Engine Module:** `studio.walk-the-business.v1.department-behavior`  
**Status:** Living department status communication  
**Philosophy:** Departments should never feel static. Every department visibly communicates life.

---

## Design Principle

> Departments communicate current health through **environment**, **AI employees**, **activity**, and **visual state** — not status badges on a card.

---

## Behavior Contract (All Departments)

```yaml
DepartmentLiveBehavior:
  departmentId: string
  activityLevel: enum             # dormant · quiet · active · vibrant · celebration
  visualState: VisualStateModifiers
  ambientActivity: AmbientActivity[]
  pendingFounderItems: FounderAttentionItem[]
  aiEmployeesPresent: ConciergePresence[]
  lastUpdated: ISO8601
```

Every department implements `DailyWalkCapable` (13).

---

## Department Profiles

### Creative Direction Studio

| Signal | Visual/Behavioral Expression |
|--------|---------------------------|
| Mood boards evolving | Panels shift · new pins animate in |
| New ideas | Reference cards appear on walls |
| Founder notes waiting | Notes glow softly at Brief Wall |
| Orb suggestions | Orb pedestal pulse · suggestion cards |
| Direction approved | Timeline Table ceremony complete state |

> *Feels like the creative brain is thinking overnight.*

### Production Department

| Signal | Expression |
|--------|------------|
| Projects moving stages | Asset objects travel lot path |
| AI collaboration | Concierges at stations · gesture activity |
| Progress updates | Timeline markers advance |
| Blocked project | Station dim · object idle · concierge waiting |
| Ahead of schedule | Subtle celebration particles |

> *Feels like a studio lot before call time.*

### Marketing Department

| Signal | Expression |
|--------|------------|
| Campaign preparing launch | Countdown · content queue animating |
| Content queues evolving | Editorial wall updates |
| Engagement spike | Warm lighting pulse · growth indicator in environment |
| Campaign live | Launch banner in-world · not popup |
| Underperforming | Quieter atmosphere · concierge at ready |

### Publishing Center

| Signal | Expression |
|--------|------------|
| Launch countdown | Clock object · ceremonial staging |
| Scheduled releases | Calendar wall animates |
| Completed launches | Archive corridor · celebration ghosts |
| Publishing block | Gate closed metaphor · Orb flags |

### Customer Experience

| Signal | Expression |
|--------|------------|
| Active conversations | Ambient activity · concierge at desk |
| Support requests | Queue visible as physical queue — not ticket list |
| Testimonials | New testimonial object appears in gallery |
| VIP alert | Subtle gold accent · concierge approaches founder on walk |
| NPS milestone | Celebration moment triggers (08) |

### Marketplace

| Signal | Expression |
|--------|------------|
| New Expansions available | New wing glow · Marketplace Concierge at entrance |
| Updates installed | Construction complete state |
| Recommendations | Display pedestals with suggested expansions |
| Creator activity | Activity in creator pavilion |
| Certification pending | Validation badge station active |

---

## Activity Levels

| Level | Environment | When |
|-------|-------------|------|
| **Dormant** | Minimal motion · lights low | Department not yet installed |
| **Quiet** | Slow idle · few concierges | No urgent work · off-peak |
| **Active** | Normal industry motion | Standard operations |
| **Vibrant** | Elevated motion · warm light | Launches · wins · high engagement |
| **Celebration** | Particles · ceremony · audio swell | Milestones · major wins |

Activity level drives Headquarters Health (07).

---

## Never Static

Between walks, departments **continue**:

```yaml
BackgroundActivity:
  departmentId: string
  eventsSinceLastWalk: ActivityEvent[]
  stateDelta: VisualStateDelta
```

Founder away 8 hours → Production shows measurable progress — not identical state.

---

## Status Without Dashboards

| Forbidden | Canonical |
|-----------|-----------|
| Red badge count on icon | Concierge greets: "Two approvals waiting" |
| KPI card overlay | Revenue milestone = celebration moment in Analytics Observatory |
| Email-style notification list | Testimonial object appears in Customer Experience gallery |
| Static screenshot department | Living Runtime session per department |

---

## Genome Expression

Department behavior respects Company Genome:

- Luxury salon: slower motion · warmer light · quieter audio
- High-growth startup: snappier indicators · more visible activity
- Law firm: restrained celebration · confidentiality cues

Same activity level · different **expression**.

---

## Health Snapshot Schema

```yaml
DepartmentHealth:
  departmentId: string
  overall: enum                   # thriving · healthy · attention · concern · critical
  dimensions:
    - name: string                # throughput · approvals · engagement · blockers
      state: enum
      spatialExpression: string   # how it manifests in environment
  founderActionRequired: boolean
  suggestedStopPriority: number
```

---

_Next: [05 — Orb Executive Assistant](./05_ORB_EXECUTIVE_ASSISTANT.md)_

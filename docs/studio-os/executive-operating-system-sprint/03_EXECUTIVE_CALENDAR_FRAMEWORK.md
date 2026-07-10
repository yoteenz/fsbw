# Executive Calendar Framework™

**Status:** Canonical calendar architecture — P0 Executive OS Sprint  
**Scope:** The calendar as the operating heart of Studio World™

---

## Calendar Thesis

> **The calendar is no longer passive. It becomes the operating schedule of the company.**

The Executive Calendar™ is not a date picker attached to software. It is the **organizational nervous system** — scheduling when departments need founder leadership, when reviews must occur, and when decisions gate production.

---

## What the Calendar Is

| Executive Calendar™ **is** | Executive Calendar™ **is not** |
|-----------------------------|--------------------------------|
| Company's operating schedule | Personal reminder app |
| Department-initiated rhythm | Founder-managed todo list |
| Decision gate scheduler | Passive event storage |
| Preparation deadline driver | Post-hoc logging |
| Organizational memory index | Stateless appointment book |
| Momentum visualizer | Empty calendar anxiety |

---

## Calendar Architecture

```
EXECUTIVE CALENDAR™
├── Scheduled Meetings (department-originated)
├── Decision Gates (production · launch · approval)
├── Executive Rituals (recurring organizational cadence)
├── Proactive Requests (organization-initiated)
├── Follow-Up Actions (from previous meeting outcomes)
├── Preparation Windows (pre-meeting work periods)
└── Founder Availability Overlay (Founder OS integration)
```

---

## Meeting Origins

Every meeting on the calendar **originates from a department**:

| Originating department | Example meetings |
|------------------------|------------------|
| **Creative Direction Studio™** | Creative Direction Review · Concept Selection · Direction Lock |
| **Brand Strategy Office™** | Brand Strategy Review · Positioning Decision · Genome Alignment |
| **Packaging Lab™** | Packaging Approval · Material Selection · Structural Review |
| **Photography Studio™** | Photography Selection · Lighting Approval · Shot List Review |
| **Motion Graphics Theater™** | Motion Graphics Review · Pacing Decision · Animation Approval |
| **Marketing Agency™ / Campaign Gallery™** | Campaign Readiness Review · Launch Decision · Channel Approval |
| **Innovation Department™** | Innovation Assessment · Prototype Review · Investment Decision |
| **Studio Warehouse™** | Production Readiness Meeting · Quality Gate · Distribution Authorization |
| **Founder Office™** | Founder Vision Session · Strategic Alignment · Quarterly Review |
| **Executive Operations™** | Morning Executive Briefing · Operations Review · Crisis Briefing |

**Law:** A calendar entry without department origin is not an Executive Calendar™ entry.

---

## Canonical Meeting Types

### Daily Rhythm

| Meeting | Typical time | Purpose |
|---------|--------------|---------|
| **Morning Executive Briefing™** | First arrival | Overnight accomplishments · today's decisions · priority meetings |

### Weekly Rhythm

| Meeting | Typical cadence | Purpose |
|---------|-----------------|---------|
| Creative Direction Review | Weekly | Direction evolution · branch decisions |
| Production Status Review | Weekly | Pipeline health · blockers |
| Campaign Readiness Review | As needed | Launch gate decisions |

### Decision Gates

| Gate | Trigger | Founder decision |
|------|---------|------------------|
| **Direction Lock** | Concepts ready | Which vision moves to production |
| **Packaging Approval** | Prototypes complete | Structural · material go/no-go |
| **Production Authorization** | Readiness evidence mounted | Begin manufacture |
| **Launch Decision** | Campaign assets ready | Go to market |
| **Canon Approval** | Creative review complete | Permanent vault placement |

### Strategic Cadence

| Meeting | Cadence | Purpose |
|---------|---------|---------|
| **Founder Vision Session** | Monthly | Strategic alignment · long-term direction |
| **Quarterly Innovation Summit** | Quarterly | Investment · exploration priorities |
| **Annual Company Retreat** | Annual | Legacy reflection · year-ahead vision |

---

## Meeting Entry Schema

Every calendar entry requires:

| Field | Description |
|-------|-------------|
| **meetingId** | Unique identifier |
| **title** | Human-readable (e.g., "Creative Direction Review — Tuesday 3:00 PM") |
| **originatingDepartment** | Department that scheduled it |
| **meetingType** | From canonical type registry |
| **scheduledAt** | Date/time (or "ready now" for proactive gates) |
| **physicalLocation** | Room address in Studio World™ |
| **agenda** | Structured purpose · topics · sequence |
| **participants** | AI specialists · roles required |
| **supportingMaterials** | Artifacts that must be mounted before arrival |
| **preparationStatus** | `preparing` · `ready` · `blocked` |
| **expectedDecisions** | What founder must decide |
| **priorMeetingRefs** | Links to related meeting chronicle |
| **outcome** | `pending` · `decided` · `deferred` · `cancelled` |
| **followUpActions** | Post-meeting organizational tasks |

---

## Preparation Lifecycle

```
MEETING SCHEDULED (department or system)
        ↓
PREPARATION WINDOW opens
        ↓
Specialists gather materials
        ↓
Room prepared (boards · screens · samples)
        ↓
Agenda finalized on table
        ↓
preparationStatus → ready
        ↓
Founder notified (calendar · Orb · ambient)
        ↓
FOUNDER ARRIVES (never before ready)
        ↓
Meeting conducted
        ↓
Outcome recorded · follow-ups scheduled
        ↓
Chronicle updated
```

**Law:** Founder cannot enter a meeting until `preparationStatus: ready`. Entering early shows preparation in progress — specialists still working, not empty room.

---

## Proactive Scheduling

The organization schedules meetings without founder initiation when:

| Trigger | Meeting scheduled |
|---------|-------------------|
| `milestone_reached` | Milestone Review |
| `disagreement_unresolved` | Founder Arbitration Session |
| `production_blocked` | Urgent Approval Meeting |
| `competitor_event` | Strategic Response Briefing |
| `opportunity_detected` | Opportunity Assessment |
| `deadline_approaching` | Readiness Gate Review |
| `quality_gate_failed` | Quality Review Session |

Proactive entries appear on calendar with `origin: organizational_intelligence` and **evidence of trigger** attached.

---

## Calendar Views (Experience, Not UI)

The calendar manifests in Studio World™ through **spatial and ambient channels** — not a grid widget:

| Channel | Expression |
|---------|------------|
| **Morning Briefing projection** | Today's meetings · decisions · overnight summary |
| **Mission Control™ ticker** | Upcoming gates · blockers |
| **Orb announcement** | "Packaging Approval is ready — room prepared" |
| **Department signage** | "Review scheduled — Tuesday 3PM" |
| **Founder Boardroom™ wall** | Weekly rhythm · strategic calendar |
| **Corridor ambient** | Meeting in progress · room occupied indicator |

A traditional calendar grid may exist as a **Founder Office™ artifact** — but it is not the primary experience.

---

## Founder OS Integration

[Founder Operating System™](../founder-operating-system.md) overlays founder availability:

| Founder OS signal | Calendar behavior |
|-------------------|-------------------|
| High decision fatigue | Defer non-critical gates to tomorrow |
| Deep work protected | No proactive meetings during block |
| Low energy | Shorter briefing · fewer stops |
| High creative cycle | Prioritize creative reviews |
| Meeting overload | Batch approvals · delegate prep review |

Founder OS **protects** the founder. It never **removes** founder decision authority.

---

## Calendar Memory

The calendar is an **index into organizational memory**:

| Query | Calendar provides |
|-------|-------------------|
| "When did we approve packaging?" | Packaging Approval meeting · chronicle link |
| "What led to this direction?" | Chain of Creative Direction Reviews |
| "Who disagreed last time?" | Meeting transcript · specialist positions |
| "What's still pending?" | `outcome: pending` entries |
| "What follow-ups are overdue?" | Unresolved followUpActions |

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| Empty calendar on new project | No operating rhythm |
| Meetings without preparation | Prompt in disguise |
| Founder-scheduled everything | Organization not operating |
| Calendar disconnected from rooms | No spatial integration |
| Stateless meeting entries | No chronicle linkage |
| Proactive spam | Unearned surprise |
| Grid as only view | No executive ritual framing |

---

## Closing

The Executive Calendar™ is the heartbeat of Studio World™.

When the founder glances at it — whether as a briefing projection, a boardroom wall, or an Orb announcement — they should feel the pulse of a company that knows **when it needs its leader** and **what it has prepared for them**.

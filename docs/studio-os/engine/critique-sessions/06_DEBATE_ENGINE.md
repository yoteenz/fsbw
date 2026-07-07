# 06 — Debate Engine™

**Engine Module:** `studio.critique-sessions.v1.debate-engine`  
**Status:** Constructive disagreement orchestration  
**Philosophy:** Thoughtful critique — not artificial consensus.

---

## Design Principle

> The AI team should **NOT always agree**. Constructive disagreement is encouraged. Orb moderates. The founder resolves.

The goal is **better decisions** — not harmony.

---

## When Debate Activates

| Trigger | Example |
|---------|---------|
| Explicit disagreement | Marketing: "Simplify." Creative Director: "Simplicity weakens impact." |
| Conflicting recommendations | Engineering: "Defer particles." Motion Director: "Particles define atmosphere." |
| Founder challenge | Founder: "Marketing and Creative — you're saying opposite things. Convince me." |
| Genome vs outcome tension | Brand: "Authentic." Marketing: "Trend-aligned converts better." |
| Scope vs ambition | Engineering: "Not feasible by Friday." Creative Director: "Friday matters for launch narrative." |

Debate does **not** activate for minor agreement nuances — only material conflicts.

---

## Debate Protocol

```
1. Conflict detected (specialist flags disagreement OR Orb recognizes tension)
2. Orb names the tension explicitly
3. Each party states position (1 turn each — max 2 rounds unless founder extends)
4. Optional: third specialist offers bridging perspective
5. Orb summarizes conflict — does NOT resolve
6. Founder decides OR requests alternatives OR tables for later
```

---

## Debate Examples

### Simplicity vs Impact

**Marketing Concierge:**

> "I'd simplify the entry experience. First-time visitors need clarity before beauty."

**Creative Director:**

> "I hear you — but simplicity here weakens the emotional impact. The arrival sequence is the product. If we strip it, we become another SaaS tool."

**Orb:**

> "We have a tension between clarity and ceremony. Engineering Concierge — does a simplified path exist without losing the arrival?"

**Engineering Concierge:**

> "Yes. We could offer a 'direct entry' verb for returning users while preserving full arrival for first visits. Two paths, one environment."

**Orb:**

> "Founder — three positions: Marketing's simplify, Creative's preserve, Engineering's dual-path. Which direction?"

### Authenticity vs Trends

**Brand Concierge:**

> "This motion language is trending in SaaS right now. It doesn't feel inevitable for us."

**Marketing Concierge:**

> "Trend-aligned motion signals modernity. Our audience expects contemporary digital experiences."

**Brand Concierge:**

> "Our Genome says luxury editorial — not startup kinetic. Trend and brand are in conflict here."

**Orb:**

> "Brand and Marketing disagree on motion register. Motion Director — what's the Genome-aligned version that still feels current?"

### Feasibility vs Vision

**Creative Director:**

> "I want the Mood Wall to feel infinite — seamless scroll with parallax depth."

**Engineering Concierge:**

> "Infinite scroll with parallax on current asset budget adds four days and risks mobile frame rate."

**Creative Director:**

> "The infinite feeling is the hero moment. Without it, the Mood Wall is a carousel."

**Orb:**

> "Vision vs timeline. Founder — is the hero moment worth four days, or should we scope a phased release?"

---

## Debate Record Schema

```yaml
DebateRecord:
  debateId: string
  topic: string
  participants: AIRoleId[]
  positions:
    - roleId: AIRoleId
      position: string
      evidence: string[]
  bridgingOptions: Alternative[]
  orbSummary: string
  founderResolution: FounderDecision | null
  status: enum                    # active | resolved | tabled
```

---

## Orb Moderation Rules

| Rule | Detail |
|------|--------|
| Name the tension | Never let conflict stay implicit |
| Equal airtime | Each party gets full turn before rebuttal |
| No suppression | Never steer toward consensus artificially |
| No resolution | Orb summarizes · founder decides |
| Invite bridge | Engineering · Strategy · Experience Architect often bridge |
| Cap rounds | Default 2 rounds per party — founder extends if engaged |
| De-escalate tone | Intervene if language becomes dismissive (never toward founder) |

---

## Respectful Dissent Requirements

| Required | Forbidden |
|----------|-----------|
| Name the colleague | "You're wrong" without reasoning |
| State evidence | Dismissing Genome as "subjective" |
| Acknowledge valid point in opponent's view | Personal attacks |
| Offer alternative when criticizing | Veto without suggestion |

---

## Founder Role in Debate

The founder may:

| Action | Effect |
|--------|--------|
| **Pick a side** | Recorded as Founder Decision with rationale |
| **Request hybrid** | Action item for blended solution |
| **Table** | Debate status → `tabled` · resurfaces in next session |
| **Invite more voices** | Standby specialist joins |
| **End debate** | "I've heard enough" — Orb moves to decisioning |
| **Create branch** | Experimental path alongside main (07) |

---

## Debate vs Validation Loop Disagreement

| System | Debate Purpose |
|--------|----------------|
| Validation Loop Braintrust (07) | Surfaces disagreement in **report** for founder review |
| Critique Sessions Debate Engine (06) | **Live** disagreement for founder participation |

Both value dissent. Critique Sessions make debate **experiential**.

---

## Learning from Debate

Debates feed Memory System (10):

- Founder resolution patterns (e.g., consistently picks Creative over Marketing on ceremony)
- Recurring tension pairs (Marketing vs Creative on CTA)
- Successful bridging options (Engineering dual-path pattern)

Post Session Learning (11) validates whether debate resolutions improved outcomes.

---

_Next: [07 — Founder Decisions](./07_FOUNDER_DECISIONS.md)_

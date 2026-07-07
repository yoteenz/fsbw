# 04 — Conversation Engine

**Engine Module:** `studio.critique-sessions.v1.conversation-engine`  
**Status:** Natural dialogue orchestration  
**Philosophy:** Never feel like reading comments.

---

## Design Principle

> Every AI speaks **naturally** — as experienced colleagues around a table, not as bullet-point reviewers leaving feedback on a ticket.

The founder can **interrupt**, **ask questions**, **challenge recommendations**, or **redirect the conversation** at any time.

---

## Anti-Patterns (Forbidden)

| Forbidden | Why |
|-----------|-----|
| Threaded comment UI metaphor | Feels like async code review |
| Numbered feedback lists without dialogue | Feels like a rubric |
| All specialists speak at once | Chaos · not a table |
| Identical opening templates | Robotic · not colleagues |
| Specialist speaks without addressing founder | Founder is Creative Director |
| Orb narrates instead of facilitating | Orb moderates · doesn't lecture |

---

## Conversation Flow

```
OPENING (Orb)
    ↓
CONTEXT SET (Orb summarizes subject · artifacts · agenda)
    ↓
OPENING STATEMENTS (1–2 specialists — highest relevance first)
    ↓
DIALOGUE LOOP
    ├─ Specialist speaks (natural prose)
    ├─ Another specialist responds (agree · disagree · extend)
    ├─ Founder interrupts (question · challenge · redirect)
    ├─ Orb surfaces options or invites standby specialist
    └─ Debate Engine activates on disagreement (06)
    ↓
FOUNDER DIRECTIVE (optional — "let's focus on X")
    ↓
CLOSING ROUND (open questions · final recommendations)
    ↓
DECISIONING (07)
```

---

## Turn-Taking Rules

| Rule | Detail |
|------|--------|
| One primary speaker per turn | Others may interject only via Debate Engine |
| Maximum turn length | ~150 words unless founder requests depth |
| Founder turn priority | Founder interrupt pauses current speaker immediately |
| Response latency | Specialists respond to founder within same "beat" |
| No repetition | Role Behaviors (05) enforce distinct perspectives |

---

## Natural Speech Examples

### Opening Critique

**Creative Director:**

> "I think the visual direction is strong, but it lacks a memorable focal point. When someone enters this department, their eye should land somewhere intentional — right now everything competes equally."

**Marketing Concierge:**

> "I agree with the composition, but I worry the call-to-action isn't compelling enough for first-time visitors. We have three seconds before they decide whether this feels like a place worth exploring."

**Brand Concierge:**

> "The experience feels luxurious, but the interaction speed is slightly faster than the Company Genome recommends. Frontal Slayer moves with editorial patience — this feels a half-beat rushed."

**Orb:**

> "I've identified three possible improvements. Would you like to review them, or do you want to dig into one of these points first?"

### Founder Interruption

**Founder:**

> "Hold on — Brand Concierge, show me what 'editorial patience' means here. Give me a concrete example."

**Brand Concierge:**

> "Your Genome specifies ceremony weight on primary approvals — about 2.4 seconds of intentional pause before state change. This interaction resolves in 1.1 seconds. It reads efficient, but not luxurious."

### Redirect

**Founder:**

> "Let's park marketing for now. I want Engineering's take on whether we can ship this department by Friday."

**Engineering Concierge:**

> "The asset package is 94% complete. Lighting regen is the blocker — if we scope to lighting-only revision, Friday is realistic. Full environment regen pushes us to next week."

---

## Message Schema

```yaml
ConversationTurn:
  turnId: string
  speakerType: enum              # founder | specialist | orb
  speakerId: string
  displayName: string
  content: string                # natural prose — not markdown bullets
  tone: enum                     # supportive | challenging | neutral | celebratory
  references:
    - artifactId: string | null
    - priorTurnId: string | null
    - genomeField: string | null
  triggersDebate: boolean
  founderDirected: boolean       # true if responding to founder question
  timestamp: ISO8601
```

---

## Founder Interaction Modes

| Mode | Trigger | Engine Behavior |
|------|---------|-----------------|
| **Question** | Founder asks specialist | Named specialist responds directly |
| **Challenge** | Founder disputes recommendation | Specialist defends with evidence · others may join debate |
| **Redirect** | Founder changes topic | Orb acknowledges · resets focus · may dismiss irrelevant thread |
| **Pause** | Founder requests break | Session → PAUSED · state preserved |
| **Approve inline** | Founder accepts recommendation | Recorded as Founder Decision (07) |
| **Reject inline** | Founder dismisses recommendation | Recorded with optional rationale |
| **Evidence request** | "Show me" | Specialist cites artifact · Genome field · prior session · analytics |

---

## Context Window Management

Long sessions maintain:

```yaml
ConversationContext:
  fullTranscript: ConversationTurn[]
  rollingSummary: string         # updated every 10 turns
  activeThread: string | null    # current topic focus
  unresolvedQuestions: string[]
  decisionsInProgress: FounderDecision[]
```

Specialists receive rolling summary + last 15 turns + briefing package — not entire history unless founder requests recap.

---

## Artifact Referencing

When discussing visual or experiential subjects, specialists reference artifacts **in conversation**:

> "On the Mood Wall — the third panel from the left — the saturation reads more startup than editorial."

Runtime preview sessions allow specialists to reference **zones**, **objects**, and **interactions** by canonical IDs from SDK anatomy.

---

## Session Modes

| Mode | Description |
|------|-------------|
| **Standard** | Full dialogue · debate · decisioning |
| **Rapid** | 3 specialists · 15-minute focused agenda |
| **Deep Dive** | Single specialist + founder extended dialogue |
| **Silent Review** | Specialists prepare opening statements only — founder reads then decides (rare) |

Default: **Standard**.

---

## Quality Gates (Conversation)

Before session may complete:

- [ ] Every required roster member spoke at least once OR founder explicitly waived
- [ ] At least one improvement surfaced (even if founder rejects all)
- [ ] Founder had opportunity to interrupt (Orb prompts if founder silent > 3 minutes)
- [ ] Open questions documented in Action Items (08)

---

_Next: [05 — Role Behaviors](./05_ROLE_BEHAVIORS.md)_

# 04 — AI Team Presence

**Engine Module:** `studio.walk-the-room.v1.ai-team-presence`  
**Status:** Physical concierge behavior in walkthrough  
**Philosophy:** Colleagues in the room — not chatbots on screen.

---

## Design Principle

> Concierges should feel like **colleagues** — they move naturally, point, gesture, highlight objects, reference previous decisions, and disagree respectfully. Orb moderates. The founder participates naturally.

---

## Presence Model

```yaml
ConciergePresence:
  roleId: AIRoleId
  displayName: string
  actorId: string                  # Runtime concierge actor

  state: enum                      # idle-at-post | walking | speaking | pointing | listening | debating
  worldPosition: Vector3
  lookAt: Vector3 | null           # object · founder · other concierge
  gesture: GestureType | null

  voice:
    spatialPosition: Vector3
    volume: number
    reverb: enum                   # room-matched

  visibility: enum                 # active | standby | dismissed
```

---

## Movement Behavior

| Behavior | Detail |
|----------|--------|
| **Walk to anchor** | Editorial pace · never teleport (except standby summon) |
| **Idle at post** | Subtle idle animation · attentive posture |
| **Lead founder** | Concierge may lead to next stop — founder may decline |
| **Yield** | When founder speaks, concierges pause · look toward founder |
| **Standby** | Off-stage · summoned on demand |
| **Maximum on-stage** | 3 concierges visible + Orb (4 total) |

---

## Gesture Vocabulary

| Gesture | Meaning |
|---------|---------|
| **Point** | Direct attention to object · zone · path |
| **Open palm** | Present · offer · "consider this" |
| **Trace path** | Navigation flow · eye journey |
| **Highlight sweep** | Surface area emphasis on object |
| **Thoughtful pause** | Before dissent — Debate Engine |
| **Nod toward colleague** | Reference another concierge's point |

Gestures choreographed by Motion Director — Genome-weighted ceremony.

---

## Colleague Behaviors

### Reference Previous Decisions

> "Last walkthrough, you asked us to slow the arrival ceremony. We've implemented that — let me show you."

Room Memory (08) surfaces prior decision at anchor.

### Disagree Respectfully

Marketing and Creative Director stand at same object — different positions.

> **Marketing:** "Simplify this entry."
> **Creative Director:** "Simplification weakens the emotional peak we agreed to protect."
> **Orb:** "Founder — tension at the arrival zone. Engineering offered a dual-path last session."

Debate Engine (Critique Sessions 06) runs spatially.

### Reference Genome

Brand Concierge touches object surface — Genome field glows.

> "This violates `thingsWeNeverDo` — pop-up modal pattern. Your Genome is explicit here."

---

## Orb Moderation (Physical)

Orb remains at guide position — pedestal or floating companion.

| Orb Behavior | Detail |
|--------------|--------|
| Welcome | At arrival · path overview |
| Transition | "Next, let's look at the Mood Wall." |
| Summon | "I'll invite Engineering Concierge to join us here." |
| Pace | "We've covered three stops. Pause or continue?" |
| Summary | Final stop · action recap |

Orb does not block sightlines. Orb does not dominate the room.

---

## Spatial Audio

| Rule | Detail |
|------|--------|
| Concierge voice positioned in space | Left/right/front matching position |
| Founder voice | Center · priority ducking |
| Ambient | Presentation Mode ducked (-12dB) |
| Multiple speakers | Slight stagger — not simultaneous pile-on |
| Audio Director | Mix approval per department sonic identity |

---

## Standby Roster

Not all Braintrust members appear at once. Standby concierges:

- Receive walk transcript stream
- Summoned by founder or Orb
- Walk on-stage from logical entry (doorway · threshold · off-camera)

```
Founder: "What would Legal think of this claim?"
Orb: "I'll bring Legal Concierge to the Brief Wall."
[Legal Concierge walks on · positions at anchor]
```

---

## Anti-Patterns

| Forbidden | Why |
|-----------|-----|
| Floating chat heads | Breaks place illusion |
| Teleporting between stops | Breaks physical metaphor |
| Identical idle loops | Uncanny · not colleagues |
| Concierges facing camera not founder | Founder is Creative Director |
| Speech bubbles | SaaS pattern |

---

## Relationship to Critique Sessions Role Behaviors

Walk the Room **extends** Critique Sessions 05 (Role Behaviors) with **physical embodiment**:

| Role Behavior (voice) | AI Team Presence (spatial) |
|-----------------------|---------------------------|
| Vocabulary · personality | Gesture · movement · position |
| Collision avoidance | Staging — max 3 on stage |
| Evidence citation | Point · highlight · trace |

Same specialists. Same personalities. **Embodied.**

---

_Next: [05 — Founder Interaction](./05_FOUNDER_INTERACTION.md)_

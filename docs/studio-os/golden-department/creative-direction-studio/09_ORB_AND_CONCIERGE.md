# 09 — Orb & Concierge

**Golden Department:** Creative Direction Studio™  
**Section:** Intelligence Behavior — Permanent Physical Presence

---

## Design Principle

> The Orb is **not a floating chat bubble**. It is a **permanent physical anchor** with voice, glow, and routing intelligence. Concierges are **ambient staff** — present in zones, not help desk tickets.

---

## Intelligence Stack

```
┌─────────────────────────────────────────┐
│              STUDIO ORB™                 │
│   Voice · Route · Generate · Navigate   │
└───────────────┬─────────────────────────┘
                │
    ┌───────────┼───────────┬───────────────┐
    ▼           ▼           ▼               ▼
 Creative    Research     Brand      Production
 Director    Concierge   Concierge    Manager
 (Brief)     (Mood·Lib)  (Observatory) (Timeline)
```

---

## Orb Command Center™

### Physical Presence

| Property | Specification |
|----------|---------------|
| Location | Pedestal X=0.35, Y=0.55, Z=0.4 |
| Form | Sphere 0.12m diameter · floats 0.15m above pedestal |
| Pedestal | Stone/metal cylinder 0.9m · command ring on top |
| Glow | Genome accent ring · pulse on listen |
| Rotation | Faces founder during conversation · 15° on greet |
| Visibility | Always in peripheral from primary camera |

### Orb States

| State | Visual | Audio |
|-------|--------|-------|
| `idle` | Slow breathe glow 4s | Ambient room |
| `listening` | Ring brightens · particles gather | Ambient ducks 50% |
| `thinking` | Inner swirl · 1.2s | Soft processing tone |
| `speaking` | Pulse sync to voice | Voice stem + light bed |
| `routing` | Brief flash toward target zone | Transition whoosh |
| `ceremony` | Elevated glow · ring expands | Ceremony undertone |

### Orb Greeting Scripts

| Context | Voice (Genome-adapted) |
|---------|------------------------|
| First visit | *"Welcome to Creative Direction. I'll be your guide in this studio. Project [code] is ready — your brief is on the left wall, references on the hero wall, and timeline at the table."* |
| Return · active | *"Welcome back. Three new references since yesterday. Branch B awaits your review."* |
| Return · pending approval | *"Creative Direction is ready for your approval at the timeline."* |
| No project | *"Ready to begin a new creative direction? Let's start with your brief."* |

---

## Example Orb Commands

| Founder Says | Orb Action | Zone Target |
|--------------|------------|-------------|
| *"Find stronger references."* | Research Concierge search | Library shelf populate + Mood Wall suggest |
| *"Generate three luxury directions."* | Spawn 3 sandbox concepts | Creative Sandbox™ |
| *"Compare these campaigns."* | Twin screen compare | Sandbox screens |
| *"Why does this feel generic?"* | Brand analysis | Observatory divergence view |
| *"Show me Apple-level art direction."* | Filter + brief update | Mood Wall filter + Brief Wall note |
| *"Change direction."* | Branch ceremony init | Timeline Table |
| *"Approve this direction."* | Ceremony trigger | Timeline approve |
| *"Reject this."* | Archive flow | Mood Wall or Timeline |
| *"Take me to Storyboarding."* | Navigation departure | Exit Portal → Story department |
| *"What does our brand DNA say about lighting?"* | Domain inspect | Observatory zoom |
| *"Pin this to the brief."* | Pin route | Brief Wall section |
| *"Undo last mark."* | Annotate undo | Last active surface |

---

## Creative Director (AI Employee)

### Role

**Executive creative partner** — guards strategic coherence of Creative Direction.

### Zone Presence

| Zone | Behavior |
|------|----------|
| Brief Wall | Ambient note on rail when direction shifts |
| Timeline | Conflict notes on dependency nodes |
| Mood Wall | Suggests stronger references when cluster weak |
| Sandbox | Reviews alternates — ranks by brief alignment |

### Ambient Behaviors

| Trigger | Response |
|---------|----------|
| Brief section empty | *"Mission isn't pinned yet — want me to draft from Genome?"* |
| Mood cluster weak | Subtle glow on Library → stronger refs |
| Branch divergence | Timeline note: *"Branch B diverges from stated objective."* |
| Pre-approval | *"Ready to lock direction? Downstream Production will read this."* |

### Never Does

- Approve on founder's behalf
- Delete references
- Override Genome without flag

---

## Research Concierge (AI Employee)

### Role

**Reference intelligence** — ingest, tag, search, cluster.

### Zone Presence

| Zone | Behavior |
|------|----------|
| Mood Wall | Auto-tag on pin: lighting, composition, mood, materials, typography, motion, luxury, palette, hierarchy |
| Library | Categorization, duplicate detection, trend clustering |
| Drop pipeline | Extract intelligence on every ingest |

### Ambient Behaviors

| Trigger | Response |
|---------|----------|
| New drop | Tag shimmer · metadata card |
| Duplicate detected | *"Similar reference in Library — cluster?"* |
| Search request | Shelf sections illuminate · results animate on |
| Trend cluster | *"Four pins share editorial lighting — group them?"* |

### Extracted Intelligence Fields

Lighting · Composition · Mood · Materials · Typography · Motion · Camera · Pacing · Luxury cues · Color palette · Brand personality · Emotional direction · Visual hierarchy · Design language

---

## Brand Concierge (AI Employee)

### Role

**Genome guardian** — ensures Project direction aligns with Company DNA.

### Zone Presence

| Zone | Behavior |
|------|----------|
| Observatory | Primary station — divergence visualization |
| Mood Wall | Flags off-brand references |
| Brief Wall | Validates Creative Direction summary vs values |

### Ambient Behaviors

| Trigger | Response |
|---------|----------|
| Off-brand reference | Observatory pulse · *"This diverges from photographyDirection."* |
| Genome update | Re-scan Project · divergence report |
| *"Why generic?"* | Comparative analysis vs Genome + aspirational refs |
| Pre-approval | Genome alignment score — visual, not numeric dashboard |

### Never Does

- Block founder creativity — flags, does not gate
- Rewrite Creative Direction without request

---

## Concierge Interaction Patterns

### Ambient Note (Default)

Glass card appears on zone edge — fades after 8s unless pinned. No modal.

### Requested Analysis

Orb routes to zone · camera shifts · glass detail panel · voice summary.

### Proactive Suggestion

Max 1 unsolicited suggestion per 5 minutes — respects focus. Disabled during ceremony.

---

## Voice Register (Genome-Adaptive)

| Company | Orb Tone | Concierge Tone |
|---------|----------|----------------|
| Luxury beauty | Warm, confident | Sensory, evocative |
| NDX finance | Measured, authoritative | Precise, insight-forward |
| Restaurant | Inviting, craft-focused | Sensory, hospitality |
| Law firm | Formal, strategic | Clarity-first, respectful |

Voice stems from Genome `voice` domain — not hardcoded persona.

---

## Production Manager (Cross-Department)

### CDS Role

Timeline dependency notes when direction change affects downstream Production Engine departments.

| Trigger | Note |
|---------|------|
| Direction lock change | *"Storyboarding will rebuild Act 2 visuals."* |
| Branch merge | *"Production assets on branch A remain — confirm merge scope."* |

Read-only in CDS — execution authority lives in Production departments.

---

## Error & Recovery

| Failure | Orb Response |
|---------|--------------|
| Reference fetch fail | *"Couldn't reach that link — try a screenshot drop."* |
| Voice unclear | *"I didn't catch that — try again or type on the brief."* |
| Genome slot missing | *"Brand DNA isn't complete — Observatory shows gaps."* |
| Sandbox isolate breach | Hard block — *"Approve required before main project changes."* |

---

## Runtime Contracts

| Contract | Engine |
|----------|--------|
| Orb state machine | Department Runtime · Orb subsystem |
| Concierge triggers | `ai-*-cds` asset triggers |
| Voice routing | Orb Runtime → zone handlers |
| Permission | `creative-direction.approve` — founder only |

See [11 — Compiler & Runtime](./11_COMPILER_AND_RUNTIME.md).

---

_Next: [10 — Motion & Audio](./10_MOTION_AND_AUDIO.md)_

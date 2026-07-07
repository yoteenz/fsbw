# 05 — Founder Interaction

**Engine Module:** `studio.walk-the-room.v1.founder-interaction`  
**Status:** Natural founder participation in spatial walkthrough  
**Philosophy:** The founder walks as Creative Director — not as audience.

---

## Design Principle

> At any point the founder can interrupt, ask questions, challenge recommendations, or redirect — and **every interaction updates the discussion naturally** without breaking the walkthrough.

---

## Founder Powers

| Power | Example | System Response |
|-------|---------|-----------------|
| **Interrupt** | "Wait — back to the Mood Wall." | Camera returns · concierges pause current thread |
| **Ask question** | "What inspired this layout?" | Relevant specialist answers · may cite reference library |
| **Challenge** | "I don't buy the CTA concern." | Marketing defends · others may join debate |
| **Request alternatives** | "Show me another direction." | Live Visualization (06) triggers |
| **Compare versions** | "Can you compare Version B?" | Room Memory loads version · side-by-side or swap preview |
| **Spatial command** | "Move this." | Object manipulation preview (sandbox rules) |
| **Style directive** | "Try a luxury approach." | Genome-weighted live preview |
| **Regenerate** | "Generate another Mood Wall." | Action Mode → scoped regen |
| **Reference query** | "What would Apple do?" | Aspirational brand comparison — advisory only |
| **Genome query** | "What would Frontal Slayer do?" | Genome inevitability check |
| **Pace control** | "Skip ahead." / "Slow down." | Path advances or extends current stop |
| **Exit** | "End walk." | Summary · action items · Presentation Mode exit |

---

## Input Channels

| Channel | Detail |
|---------|--------|
| **Voice** | Primary — hold Orb ring · ambient mic in Presentation Mode |
| **Orb command** | Natural language via Studio Orb™ |
| **Physical verbs** | SDK interaction verbs on objects during walk |
| **Gesture** | Future — point at object to focus critique |

All channels parse to unified `FounderWalkCommand` schema.

---

## Founder Command Schema

```yaml
FounderWalkCommand:
  commandId: string
  walkId: string
  timestamp: ISO8601
  inputChannel: enum

  intent: enum
    # interrupt | question | challenge | alternative | compare-version | move
    # style-directive | regenerate | reference-query | genome-query | pace | exit
    # approve-inline | reject-inline | action-disposition

  rawTranscript: string
  parsedTarget:
    anchorId: string | null
    versionId: string | null
    referenceBrand: string | null
    disposition: ActionDisposition | null

  spatialContext:
    founderPosition: Vector3
    lookAt: Vector3 | null
    currentStopId: string
```

---

## Natural Language Examples

### Challenge

**Founder:** "I don't like this."

**Orb:** "Understood. Is it the composition, the palette, or the emotional register?"

**Founder:** "The palette. Too safe."

**Creative Director:** "I can show you a bolder direction anchored to Project Genome — still on-brand."

→ Live Visualization: Mood Wall palette shift preview.

### Compare Version

**Founder:** "Can you compare Version B?"

**Orb:** "Loading Branch B from March walkthrough. Swapping Mood Wall now."

→ Room Memory loads version snapshot · live swap at anchor.

### Reference Query

**Founder:** "What would Apple do?"

**Editorial Art Director:** "Apple would reduce elements to one hero moment and let negative space breathe. Your Genome supports restraint — but your emotional register is warmer than Apple cold minimalism."

**Founder:** "What would Frontal Slayer do?"

**Brand Concierge:** "Frontal Slayer would add editorial patience — hold the reveal 1.5 seconds longer. Your Genome specifies ceremony weight here."

---

## Interaction Flow Integration

```
Founder command received
    ↓
Orb parses intent (or asks clarifying question)
    ↓
┌─ DIALOGUE → Conversation Engine (Critique Sessions 04)
├─ PREVIEW → Live Visualization (06)
├─ DEBATE → Debate Engine (Critique Sessions 06)
├─ DECISION → Founder Decisions (Critique Sessions 07)
├─ ACTION → Action Mode (09)
└─ NAVIGATION → Walkthrough Path adjusts (07)
    ↓
Walk transcript updated · Room Memory notified
```

**Rule:** Founder interaction never feels like filling a form.

---

## Founder Never Overwhelmed

| Guardrail | Detail |
|-----------|--------|
| Max concurrent spatial critiques visible | 3 per stop |
| Concierge speak queue | One primary · one response |
| Orb pace checks | Every 3 stops: "Continue or pause?" |
| Critical-only mode | Available at welcome |
| Defer without guilt | "Schedule later" always visible in Action Mode |

Emotional Design (10) governs pacing.

---

## Relationship to Founder Decisions (Critique Sessions 07)

Every inline approval/rejection during walk records as `FounderDecision` with spatial context:

```yaml
FounderDecision:
  spatialContext:
    walkId: string
    stopId: string
    anchorId: string
    founderPosition: Vector3
```

Rationale via voice attaches to Room Memory and Critique Memory.

---

_Next: [06 — Live Visualization](./06_LIVE_VISUALIZATION.md)_

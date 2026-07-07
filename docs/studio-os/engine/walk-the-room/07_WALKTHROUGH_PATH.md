# 07 — Walkthrough Path

**Engine Module:** `studio.walk-the-room.v1.walkthrough-path`  
**Status:** Narrative journey orchestration  
**Philosophy:** The walkthrough should feel intentional — not a tour of everything.

---

## Design Principle

> Each walkthrough follows a **narrative path** — a sequence of stops that tells the story of the work being reviewed.

---

## Canonical Path (Creative Department)

```
ARRIVAL
    ↓
CREATIVE INTENT
    ↓
MOOD BOARD
    ↓
COMPANY GENOME
    ↓
PROJECT STORY
    ↓
ENVIRONMENT
    ↓
INTERACTIONS
    ↓
NAVIGATION
    ↓
CONTENT
    ↓
CONVERSION
    ↓
FINAL SUMMARY
```

**Rule:** Not every walk uses every stop. Path profiles adapt to subject type and scope.

---

## Stop Schema

```yaml
WalkthroughStop:
  stopId: string
  sequence: number
  name: string
  narrativePurpose: string

  spatialTarget:
    zoneId: string | null
    objectId: string | null
    cameraPreset: string | null

  leadingConcierge: AIRoleId
  supportingConcierges: AIRoleId[]

  critiques: SpatialCritique[]     # pre-identified for this stop
  livePreviewOpportunities: string[]
  estimatedDuration: string        # "~2 min"

  skipConditions: string[]         # when critical-only mode may skip
  requiredForSessionTypes: CritiqueSessionType[]
```

---

## Path Profiles by Subject

### Department Package (Creative Direction Studio)

| Stop | Zone/Object | Lead |
|------|-------------|------|
| Arrival | Entry threshold | Orb |
| Creative Intent | Brief Wall | Creative Director |
| Mood Board | Living Mood Wall | Creative Director |
| Company Genome | Genome Observatory | Brand Concierge |
| Project Story | Timeline Table | Creative Director |
| Environment | Room overview | Experience Architect |
| Interactions | Key verb stations | UX Concierge |
| Navigation | Zone transitions | Experience Architect |
| Content | Editorial surfaces | Editorial Art Director |
| Conversion | First-visit path | Marketing Concierge |
| Final Summary | Orb Command Center | Orb |

### Project Review

| Stop | Focus |
|------|-------|
| Project intent | Mission · brief |
| Creative direction | Active direction strip |
| Asset journey | Production lot path |
| Outputs | Deliverables preview |
| Launch readiness | Conversion · dependencies |
| Summary | Orb |

### Marketplace Listing

| Stop | Focus |
|------|-------|
| Listing overview | Marketplace Concierge |
| Buyer first impression | Experience Architect |
| Genome fit | Brand Concierge |
| Performance | Engineering Concierge |
| Certification | Marketplace Concierge |
| Summary | Orb |

### Campaign

| Stop | Focus |
|------|-------|
| Campaign intent | Marketing Concierge |
| Audience fit | Growth Strategist |
| Creative assets | Creative Director |
| CTA path | Marketing Concierge |
| Brand alignment | Brand Concierge |
| Summary | Orb |

---

## Path Resolution

```
Input: walkType · sessionType · walkScope · founderAgenda · roomMemory.openIssues
    ↓
PathResolver selects profile
    ↓
Filter stops by scope (complete · critical-only · custom)
    ↓
Inject open issues from Room Memory as required stops
    ↓
Order stops narratively
    ↓
Assign concierges per stop
    ↓
Output: WalkthroughPath
```

---

## Narrative Intentionality

Each stop answers **one question**:

| Stop | Question |
|------|----------|
| Creative Intent | Why does this exist? |
| Mood Board | What should it feel like? |
| Company Genome | Is this inevitable for us? |
| Project Story | What is the narrative arc? |
| Environment | Does it feel like a place? |
| Interactions | Do verbs feel physical and discoverable? |
| Navigation | Does exploration feel natural? |
| Content | Is editorial quality exceptional? |
| Conversion | Will the right action happen? |
| Final Summary | What do we do next? |

---

## Founder Path Control

| Command | Effect |
|---------|--------|
| "Skip ahead" | Advance to next stop |
| "Go back" | Return to prior stop · critiques restored |
| "Jump to Mood Board" | Non-linear navigation — path marks skipped stops |
| "Only critical" | Re-resolve path with critical filter |
| "Add stop" | Insert custom stop from agenda |

Non-linear walks still produce complete Action Item Bundle at summary.

---

## Pacing

| Scope | Typical Duration |
|-------|------------------|
| Critical only | 8–12 minutes |
| Complete (department) | 25–40 minutes |
| Custom agenda | Variable |

Orb offers pause every 3 stops. Founder may extend any stop.

---

## Final Summary Stop

Orb at summary position:

> "We've walked eleven stops. **Four decisions** recorded. **Three revisions** queued. **One open question** for Marketing Review.
>
> Ready to route action items?"

Summary connects to Action Mode (09) and Critique Sessions Action Items (08).

---

_Next: [08 — Room Memory](./08_ROOM_MEMORY.md)_

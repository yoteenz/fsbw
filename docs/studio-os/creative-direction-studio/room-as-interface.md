# The Room Is The Interface™

**Every feature exists somewhere physically**

---

## Purpose

Define how Creative Direction Studio™ maps **every capability** to **physical place** — furniture · architecture · equipment · environmental storytelling.

Stop treating the interface as rectangles floating on a webpage.

---

## Core Law

**If it cannot be pointed to in the room, it does not belong in V2.**

---

## Physical Workstation Map

| Capability | Physical form | Placement | Interaction |
|------------|---------------|-----------|-------------|
| **Living Mood Wall™** | Double-height architectural wall · infinite surface | Hero midground · first sightline after arrival | Approach · pin · cluster · compare |
| **Founder Notes™** | Illuminated writing desk · warm task light | Foreground left | Sit · write · voice · illuminate on focus |
| **Orb™** | Holographic sphere above Story Table™ | **Spatial center** of room | Speak · command · orbit pulses |
| **Story Table™** | Central production table · glass · projected surface | Foreground center · Orb hovers above | Gather · brief · concept review |
| **Reference Library™** | Physical shelving · labeled volumes · spine glow | Background right flank | Browse · pull volume · drag to Mood Wall |
| **Creative Pipeline™** | Production board mounted on wall · magnetic strips · status lights | Midground left wall | Walk to board · move cards physically |
| **Branch Comparison™** | Gallery wall · framed concept panels A/B/C | Discovery zone · deeper in room | Walk gallery · select frame |
| **Timeline™** | Illuminated production table · embedded timeline | Midground center | Scrub · branch · approve on surface |
| **Review Area™** | Collaborative seating · facing presentation wall | Foreground right | Sit · Creative Review™ · Braintrust |
| **Asset Console™** | Production workstation · monitors · tools | Midground back | Operate · refine · Director Feedback™ |
| **Genome Observatory™** | Alcove display · data orbits | Background left alcove | Discover on exploration |
| **Brief Wall™** | Pin rail wall · editorial board | Midground left periphery | Pin · annotate |
| **Sandbox™** | Isolation preview plinth | Behind timeline | Isolate concept |

---

## Nothing Is A Card

| Card pattern (forbidden) | Physical replacement |
|--------------------------|---------------------|
| Pipeline status card | Light on production board |
| Review summary card | Orb speaks · Review Area seating |
| Asset thumbnail grid | Asset Console monitors |
| Branch picker modal | Gallery wall frames |
| Notes textarea panel | Illuminated desk surface |
| Settings drawer | Story Table™ context menu (diegetic) |

---

## Diegetic UI Law

All UI must be **in-world**:

| UI type | Expression |
|---------|------------|
| Status | LED · board light · screen content |
| Selection | Physical highlight · beam · frame glow |
| Text input | Desk surface · wall annotation · voice to Orb |
| Navigation | Walk · look · Orb guidance |
| Progress | Pipeline board columns · timeline fill |

**No floating panels** except Orb speech (spatial · not modal chrome).

---

## Prototype → Reset Mapping

| Prototype component | V2 destination |
|---------------------|----------------|
| `CreativeApprovalPipelinePanel` | **Creative Pipeline™** production wall |
| `CreativeReviewPanel` | **Review Area™** collaborative space |
| Mood Wall component | **Living Mood Wall™** architecture (keep · expand scale) |
| Founder Notes component | **Founder Notes™** illuminated desk |
| Orb copy | **Orb™** above Story Table™ — host behavior |
| Environment shell background | **Full spatial scene** — not flat backdrop |

---

## Interaction Emergence

```
Founder walks to object
        ↓
Camera settles on workstation
        ↓
Object responds (light · sound · Orb line)
        ↓
Interaction available (touch · speak · gesture)
        ↓
Work completes in-world
        ↓
Founder walks away — room continues (Idle Life™)
```

Controls are **last** — environment and workstations **first**.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Feature without physical anchor | Breaks room-as-interface |
| Modal over entire room | Software not place |
| Card stack on right rail | Dashboard pattern |
| Same screen for all workflows | Every workstation has place |

---

## Cross-References

- [spatial-hierarchy.md](./spatial-hierarchy.md)
- [orb-as-host.md](./orb-as-host.md)
- [implementation-strategy.md](./implementation-strategy.md)
- [object-catalog](../alpha/object-catalog.md)

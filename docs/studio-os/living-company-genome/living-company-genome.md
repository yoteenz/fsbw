# Living Company Genome™ — Master Specification

**Engine ID:** `studio.living-company-genome.v1`  
**Status:** Evolutionary memory of every Studio OS company

---

## The Problem

Most platforms treat a company as **configuration**:

- Logo upload
- Theme color
- Static dashboard

Headquarters never mature. History disappears. Founders cannot **see** how far they've come.

---

## The Solution

Studio OS treats a company as a **living organism**:

- Genome records every DNA strand
- Events update DNA permanently
- World manifests DNA visually
- Time Capsules preserve every chapter
- Headquarters becomes autobiography

---

## Core Laws

### Law 1 — Never Frozen

> Companies should never remain visually frozen.

HQ · departments · materials evolve with real business maturity.

### Law 2 — Events Become DNA

> Every meaningful milestone permanently becomes part of company history.

First Customer™ · Major Launch™ · Funding™ — not notifications · **genome mutations**.

### Law 3 — Growth Is Earned

> Evolution is recommended when earned — never random.

Intelligent Evolution™ ties visual upgrades to business reality.

### Law 4 — Nothing Meaningful Disappears

> Retired branding · prototype rooms · archived concepts remain accessible.

Living Departments™ · Time Capsule™ · Living Museum™.

### Law 5 — Architecture Is Memory

> Years later, founders experience memories in space — not decoration.

*"This was the room where Version 1 was born."*

### Law 6 — Legacy Over Files

> Studio OS stores a legacy. Founders walk through the story.

---

## The Eight DNA Strands

Each company maintains a living genome recording:

| Strand | Records |
|--------|---------|
| **Creative DNA™** | Visual language · taste · blueprint lineage |
| **Architectural DNA™** | HQ character · proportions · landmark evolution |
| **Operational DNA™** | How work flows · department maturity |
| **Leadership DNA™** | Decision style · risk · delegation patterns |
| **Brand DNA™** | Voice · identity chapters · campaign history |
| **Customer DNA™** | Who you serve · relationship depth · milestones |
| **Innovation DNA™** | Inventions · patents · prototypes · experiments |
| **Culture DNA™** | Values in action · rituals · team growth |

See [genome-domains.md](./genome-domains.md).

Maps to [Company Genome™](../company-genome.md) domains — Living Company Genome™ adds **evolutionary event plane**.

---

## Evolution Loop

```
Real-world milestone (or in-platform achievement)
         ↓
Genome Event™ detected / recorded
         ↓
Relevant DNA strands update
         ↓
Intelligent Evolution™ evaluates world eligibility
         ↓
Founder offered evolution (optional inherit)
         ↓
World Evolution™ manifests in HQ · departments
         ↓
Time Capsule™ seals chapter snapshot
         ↓
Legacy Layer™ narrative anchors placed
```

---

## World Evolution Example

**Startup phase:**

- Minimal finishes
- Simple lighting
- Basic architectural detailing

**As company grows:**

- New materials appear (earned)
- Craftsmanship improves
- Artwork becomes richer
- Landmarks become more iconic
- Environmental storytelling expands

Headquarters **visibly matures** — not manual redecoration.

---

## CDS Inheritance Example

Creative Direction Studio™ under **Editorial Luxury™** at year one.

After **Major Launch™** + **100 Customers™**:

- Creative DNA™ gains launch palette chapter
- Architectural DNA™ unlocks richer landmark expression
- Living Department™: launch campaign becomes Mood Wall exhibit
- HQ: Launch Gallery™ wing eligible

Marketing inherits evolved blueprint variant — rooms feel related **and** historically grounded.

---

## Input Contract

```yaml
GenomeEventInput:
  orgId: string
  eventType: GenomeEventType
  occurredAt: datetime
  source: platform | integration | founder-declared | expedition
  payload:
    title: string
    description: string
    metrics: Record<string, number>   # customers, revenue, employees
    artifacts: ArtifactRef[]            # campaigns, products, logos
    expeditionId: string | null
  evidence:
    required: boolean
    attachments: string[]
```

---

## Output Contract

```yaml
GenomeEvolutionOutput:
  eventId: string
  dnaUpdates: DNA StrandUpdate[]
  worldEvolutionOffers: EvolutionOffer[]
  timeCapsuleId: string
  legacyAnchors: LegacyAnchor[]
  timelineEntry: TimelineEntry
  museumEligible: MuseumWing[]
  coherenceImpact: number
```

---

## Integration Stack

| Layer | Role |
|-------|------|
| **Living Company Genome™** | When · why · what evolves |
| **Company Genome™** | What the company IS (data) |
| **Creative Blueprint Engine™** | How it LOOKS (language) |
| **Legacy Vault™** | WHERE history is stored |
| **Expeditions™** | Narrative transformation arcs |

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| Cosmetic upgrade without earned event | Breaks trust |
| Delete old branding | Violates Time Capsule law |
| Genome update without world manifestation | Founders don't see growth |
| Random premium materials at signup | Startup should look like startup |
| Confuse Living Genome with static config | Misses autobiography promise |

---

## Final Philosophy

The headquarters should become a **living autobiography** — one that grows, remembers, evolves, and tells the company's story long after individual projects are finished.

Founders should look back and **physically see** how far they've come.

---

_See also: [genome-events.md](./genome-events.md) · [world-evolution.md](./world-evolution.md) · [time-capsule.md](./time-capsule.md)_

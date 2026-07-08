# CDS Presentation™ — Living Intelligence (UI Later)

**Engine Module:** `studio.company-genome.v2.cds-presentation`  
**Status:** Experience spec — not settings page

---

## Law

> Company Genome™ in **Creative Direction Studio™** is a **living intelligence system** — not a settings page · not a profile.

**Build the engine first. UI comes later.**

---

## Placement

**Library™ workspace** or dedicated **Genome Observatory™** zone in CDS — physical room, not `/settings/genome` route.

Founder walks into a space where Studio OS **shows what it has learned**.

---

## Experience Tone

Founder should feel:

> *"Studio OS is gradually understanding my company."*

Not:

> *"I am filling out a brand questionnaire."*

---

## Living Display Elements (Future UI)

| Element | Content |
|---------|---------|
| **Header** | `Company Genome™` · status: `Learning...` · `Stable` · `Evolving` |
| **Visual Identity Confidence** | Strand meter 0–100 |
| **Creative Confidence** | Strand meter |
| **Operational Confidence** | Strand meter |
| **Brand Confidence** | Strand meter |
| **Generation Accuracy** | 30d recommendation match % |
| **Recent Learned Behaviors** | Last 5–10 belief updates |
| **Creative Drift** | Alert when recent decisions diverge from canon |
| **DNA Evolution Timeline** | Scrollable chapter history |

---

## Recent Learned Behaviors (Example)

```
• Warm editorial lighting confidence increased to 97%
• Reused lighting rig from Mood Wall™ — reinforcement
• Rejected industrial steel aesthetic — added to dislikes
• Purchased Luxury Materials Pack™ — 12 traits imported
• Approved Story Table™ atmosphere layer
```

---

## Creative Drift (Example)

```
Creative Drift detected (moderate)

Recent approvals favor cooler lighting.
Your established canon: warm editorial (87%).

[ Align to canon ]  [ Explore new direction ]
```

Diegetic controls on physical surfaces — not modal buttons in v3 spec.

---

## What NOT to Build

| Forbidden | Alternative |
|-----------|-------------|
| Settings page with 200 fields | Learned beliefs display |
| CRM contact fields | Decision DNA timeline |
| Analytics charts · funnels | Confidence strands |
| Profile avatar · username | Company organism metaphor |
| Manual trait editors (default) | Override only on explicit founder request |

---

## Orb Role

Orb narrates Genome in every CDS workspace:

- *"I'm applying your warm editorial lighting — 97% confidence."*
- *"This recommendation matches your floating architecture preference."*

---

## Data Source

All display elements read from:

- `CompanyGenomeSnapshot`
- `StrandConfidence`
- `GenomeDecision` recent window
- `CreativeDrift` analysis

No separate presentation database.

---

## v1 Sprint

**Docs only.** No React · no route · no visualization implementation.

Engine must be contract-stable before CDS Genome room is built.

---

_CDS Presentation — watch the organism learn, don't configure it._

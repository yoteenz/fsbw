# Genome Domains™ — Eight DNA Strands

**Module:** `studio.living-company-genome.v1.domains`  
**Status:** Canonical evolutionary DNA model

---

## Principle

Everything contributes to how the company evolves.

Each strand is **living** — updated by Genome Events™ · manifested in World Evolution™.

---

## The Eight Strands

### Creative DNA™

| Records | World Manifestation |
|---------|---------------------|
| Visual DNA™ · blueprint lineage | Material richness · art · exhibit quality |
| Founder taste evolution | Department visual maturity |
| Campaign aesthetic history | Mood walls · galleries |
| Rejected · approved branches | Prototype Vault™ |

**Feeds:** Creative Blueprint Engine™ · Asset Intelligence Company DNA™

---

### Architectural DNA™

| Records | World Manifestation |
|---------|---------------------|
| HQ scale · wing count · maturity tier | Ceiling height · column detail · stone grade |
| Landmark iconicity scores | Story Table™ · Genome constellation growth |
| Transition character | Corridor craftsmanship |
| Environmental storytelling depth | Plaques · timelines · narrative props |

**Feeds:** Living Headquarters™ · Architectural Icons™ · Scene Stack shells

---

### Operational DNA™

| Records | World Manifestation |
|---------|---------------------|
| Department count · pack installs | New wings · unlocked corridors |
| Process maturity | Mission control density · pipeline sophistication |
| Automation adoption | Ambient efficiency cues (non-SaaS) |
| Quality certification history | Golden Build badges in-world |

**Feeds:** Industry Architecture · Production Lifecycle stages

---

### Leadership DNA™

| Records | World Manifestation |
|---------|---------------------|
| Decision patterns · risk shifts | Executive wing character |
| Delegation milestones | Additional concierge presence |
| Succession readiness | Founder Hall™ depth |
| Council · expedition choices | Memorial · decision plaques |

**Feeds:** Organization Genome™ · Succession Mode™ · Executive Council

---

### Brand DNA™

| Records | World Manifestation |
|---------|---------------------|
| Logo chapters · identity refreshes | Founder Hall™ logo timeline |
| Campaign launches | Launch Gallery™ exhibits |
| Voice evolution | Typography · Orb personality |
| Award wins | Trophy displays · Wall of Milestones™ |

**Feeds:** Brand Architect · Organization Genome voice domains

---

### Customer DNA™

| Records | World Manifestation |
|---------|---------------------|
| Customer count tiers | Showroom eligibility · gallery scale |
| Relationship depth | Relationship Gallery™ (CX dept) |
| Testimonial milestones | Customer story walls |
| Market expansion | Globe · timezone displays |

**Feeds:** Pulse · Relationship Memory · CX departments

---

### Innovation DNA™

| Records | World Manifestation |
|---------|---------------------|
| Patents · prototypes · experiments | Innovation Museum™ · Prototype Vault™ |
| Failed experiments (preserved) | Archived concept rooms |
| Product version history | Version 1 birth room preserved |
| R&D expedition outcomes | Lab wing upgrades |

**Feeds:** Innovation Lab™ · Profession Brain™

---

### Culture DNA™

| Records | World Manifestation |
|---------|---------------------|
| First employee · team growth | Hiring wing · Talent Observatory™ activation |
| Rituals · celebrations | Celebration atmosphere unlocks |
| Values-in-action moments | Culture exhibits |
| Community · guild participation | Guild hall connections |

**Feeds:** Living Headquarters celebrations · Expeditions™

---

## Strand Schema

```yaml
DNAStrand:
  strandId: creative | architectural | operational | leadership | brand | customer | innovation | culture
  orgId: string
  version: number
  maturityLevel: number              # 0–100 earned
  chapters: Chapter[]
  activeModifiers: Modifier[]        # from recent events
  worldEligibility: EligibilityRule[]
  lastEventId: string
  capsuleRefs: string[]
```

---

## Mapping to Company Genome™ (M277)

| Living Strand | Company Genome™ Domains |
|---------------|---------------------------|
| Creative DNA™ | Creative Direction · Material & Spatial · Sensory |
| Architectural DNA™ | worldBuilding · spatialDesign · signatureExperiences |
| Operational DNA™ | Behavior · Offerings · operations (extended) |
| Leadership DNA™ | Identity & Purpose · decision principles |
| Brand DNA™ | Personality & Voice · Signature Identity |
| Customer DNA™ | Competitive Context · customer emotions |
| Innovation DNA™ | Signature moments · product philosophy |
| Culture DNA™ | Values · coreBeliefs · rituals (extended) |

Living Company Genome™ adds **maturityLevel** · **chapters** · **worldEligibility** per strand.

---

## Maturity Levels (Earned)

| Level | Name | Typical Trigger |
|-------|------|-----------------|
| 0–20 | **Genesis** | Company founded |
| 21–40 | **Emerging** | First Product™ · First Customer™ |
| 41–60 | **Growing** | 100 Customers™ · First Employee™ |
| 61–80 | **Established** | Major Launch™ · Funding™ |
| 81–95 | **Signature** | Award™ · 1,000 Customers™ · Acquisition™ |
| 96–100 | **Legendary** | Decade · industry icon status |

Visual upgrades unlock by **strand maturity** — not calendar time.

---

_Genome Domains™ — eight strands, one organism._

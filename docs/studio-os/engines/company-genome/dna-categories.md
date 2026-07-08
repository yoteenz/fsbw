# DNA Categories™

**Engine Module:** `studio.company-genome.v2.dna-categories`  
**Status:** Living DNA strand schemas

---

## Overview

Company Genome™ organizes knowledge into **four expressive strands** plus **Decision DNA™** (see [decision-dna.md](./decision-dna.md)).

Every trait is a `GenomeBelief` with `confidence` score.

```yaml
GenomeBelief:
  beliefId: uuid
  strand: visual | creative | brand | operational
  key: string
  value: string | number | object
  confidence: number              # 0–100
  evidenceCount: number
  lastUpdated: ISO8601
  source: decision | marketplace | onboarding | inference
```

---

## Visual DNA™

How the company **looks** in space and image.

| Trait domain | Examples |
|--------------|----------|
| **Preferred architecture** | Floating volumes · monumental lobby · restrained envelope |
| **Preferred color temperatures** | Warm editorial · cool clinical · neutral luxury |
| **Preferred lighting** | Warm editorial key-fill · volumetric haze · rim accent |
| **Favorite compositions** | Wide establishing · product three-quarter · orbital strategy |
| **Preferred materials** | Calacatta marble · aged brass · frosted glass |
| **Textures** | Honed stone · brushed metal · matte lacquer |
| **Camera movement** | Slow orbit · dolly reveal · static editorial |
| **Scene scale** | Double-height · intimate desk · campus wide |
| **Atmosphere** | Editorial haze · minimal dust · ceremonial mist |
| **Realism level** | Archviz fidelity · stylized editorial · abstract |

```yaml
visualDna:
  preferredLighting:
    value: warm-editorial-key-fill
    confidence: 97
  preferredMaterials:
    value: [calacatta-marble, aged-brass, frosted-glass]
    confidence: 94
  dislikes:
    - key: heavy-industrial-materials
      confidence: 95
```

---

## Creative DNA™

How the company **creates and tells stories**.

| Trait domain | Examples |
|--------------|----------|
| **Preferred creative direction** | Editorial luxury · documentary raw · playful premium |
| **Editorial style** | Magazine spread · annual report · cinematic brief |
| **Storytelling preferences** | Founder-led narrative · customer hero · process reveal |
| **Campaign philosophy** | Restraint over hype · evidence over adjectives |
| **Pacing** | Deliberate · energetic · contemplative |
| **Motion language** | Ceremonial reveal · subtle idle life · snap cut |
| **Presentation style** | Holographic cards · physical boards · timeline table |

---

## Brand DNA™

How the company **presents identity** across touchpoints.

| Trait domain | Examples |
|--------------|----------|
| **Typography** | Editorial serif headlines · geometric sans UI |
| **Iconography** | Line weight · corner radius · luxury minimal |
| **Spacing philosophy** | Generous breathing room · dense command |
| **Visual hierarchy** | Single hero · layered depth |
| **Interaction philosophy** | Diegetic controls · voice-first · gesture approve |
| **Luxury level** | 0–100 scale — editorial luxury vs accessible |
| **Minimalism level** | 0–100 — restraint vs maximal |
| **Emotional tone** | Confident warmth · precise authority · playful craft |

---

## Operational DNA™

How the company **runs production**.

| Trait domain | Examples |
|--------------|----------|
| **Generation approval speed** | Fast iterate · deliberate review |
| **Budget preferences** | Reuse-first · invest in hero · conservative |
| **Regeneration tolerance** | High (iterate) · low (get it right first) |
| **Preferred providers** | Org policy hints — internal only |
| **Preferred quality settings** | editorial-luxury · golden-build · draft-explore |
| **Rendering standards** | 21:9 environment · 4K hero · isolation passes |

---

## Confidence Display (Founder-Facing)

```
Studio OS believes:
  Founder prefers warm editorial lighting     Confidence 97%
  Founder prefers floating architecture       Confidence 92%
  Founder dislikes heavy industrial materials Confidence 95%
```

Low confidence (< 60%) → Orb may ask one clarifying question — not a form.

---

## Strand Interactions

| Interaction | Rule |
|-------------|------|
| Visual + Brand | Material language informs typography spirit |
| Creative + Visual | Editorial style informs lighting |
| Operational + Visual | Quality tier informs realism level |
| Decision DNA | All strands — see decision-dna.md |

---

## Snapshot for Downstream Engines

```yaml
CompanyGenomeSnapshot:
  orgId: string
  snapshotId: uuid
  snapshotHash: sha256
  capturedAt: ISO8601
  visualDna: VisualDnaBeliefs
  creativeDna: CreativeDnaBeliefs
  brandDna: BrandDnaBeliefs
  operationalDna: OperationalDnaBeliefs
  topBeliefs: GenomeBelief[]        # confidence ≥ 80
  negativeConstraints: GenomeBelief[]
```

Consumed by [Prompt Composer™](../prompt-composer/composition-sources.md) as **Company DNA™** source #1.

---

_DNA Categories — four strands of living company identity._

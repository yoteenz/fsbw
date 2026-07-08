# Decision DNA™

**Engine Module:** `studio.company-genome.v2.decision-dna`  
**Status:** Track every founder decision

---

## Law

> **Track every decision.**

Decision DNA™ is the **event log and learning substrate** for all four expressive strands.

---

## Decision Types

| Type | ID | Learning signal |
|------|-----|-----------------|
| **Approved** | `approved` | Strengthen matching beliefs |
| **Rejected** | `rejected` | Negative constraint · lower weight |
| **Modified** | `modified` | Delta preference · parent-child lineage |
| **Regenerated** | `regenerated` | Refinement direction |
| **Favorited** | `favorite` | Strong positive · high confidence bump |
| **Archived** | `archived` | Deprecation · reduce future recommendations |
| **Purchased** | `purchased` | Marketplace taste import |
| **Duplicated** | `duplicated` | Fork intent · variation appetite |
| **Reused** | `reused` | Reinforce existing asset patterns |

---

## Decision Record Schema

```yaml
GenomeDecision:
  decisionId: uuid
  orgId: string
  timestamp: ISO8601

  decisionType: approved | rejected | modified | regenerated |
                favorite | archived | purchased | duplicated | reused

  context:
    pipelineStage: string | null
    workspaceScene: string | null
    layerId: string | null
    departmentId: string | null
    registryId: string | null
    blueprintId: string | null
    marketplacePackId: string | null

  subject:
    category: visual | creative | brand | operational
    traits: string[]              # e.g. warm-editorial-lighting
    artifactRef: string | null

  founderOverride: boolean        # chose against recommendation
  recommendationShown: string | null
  deltaConfidence: number         # applied to beliefs after processing
```

---

## Learning Pipeline

```
GenomeDecision recorded
         ↓
Learning Engine extracts traits
         ↓
Update GenomeBelief confidence
         ↓
Merge into Visual/Creative/Brand/Operational DNA™
         ↓
Emit GenomeUpdateEvent
         ↓
Living Company Genome™ (if milestone threshold)
```

---

## Examples

### Approval

```yaml
decisionType: approved
subject:
  category: visual
  traits: [warm-editorial-lighting, volumetric-haze]
deltaConfidence: +3
```

### Rejection

```yaml
decisionType: rejected
subject:
  category: visual
  traits: [heavy-industrial-materials, cold-steel-palette]
deltaConfidence: -8 on positive belief · +12 on negative constraint
```

### Reuse

```yaml
decisionType: reused
context:
  registryId: registry:lighting-editorial-rig-v3
subject:
  traits: [lighting-rig-editorial, warm-key-fill]
deltaConfidence: +2
```

### Marketplace Purchase

```yaml
decisionType: purchased
context:
  marketplacePackId: pack-luxury-materials-v2
subject:
  traits: [marble-luxury, brass-aged, glass-frosted]
deltaConfidence: +5 per imported trait
```

---

## Founder Override Tracking

When founder chooses against Genome recommendation:

```yaml
founderOverride: true
recommendationShown: reuse-existing
actualChoice: generate-new
```

Feeds Founder Taste Genome™ — does not penalize Company Genome incorrectly.

---

## Retention

| Data | Retention |
|------|-----------|
| Decision records | Permanent org history |
| Aggregated beliefs | Living snapshot |
| Raw prompts | Never stored in Genome |

---

## Studio Alpha™ Analytics

Decision DNA enables:

- Learning loop accuracy
- Recommendation vs choice alignment
- Confidence calibration over time

Not founder-facing analytics dashboard in v2.

---

_Decision DNA™ — every click teaches. Every silence teaches too._

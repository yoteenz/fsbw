# Generation Influence™

**Engine Module:** `studio.company-genome.v2.generation-influence`  
**Status:** Genome shapes every generation path

---

## Law

> **The Genome should influence every generation.**

---

## Consumers (Mandatory Consultation)

| Engine | Consultation use |
|--------|------------------|
| **Prompt Composer™** | Auto-inherit traits · negatives |
| **Scene Planner™** | Reuse bias · layer templates · quality tier |
| **Asset Registry Check™** | Compatibility scoring weights |
| **Provider Optimizer™** | Quality tier · org provider policy |
| **Creative Blueprint Engine™** | Apply Existing™ default |
| **Asset Intelligence Engine™** | Recommendation ranking |
| **Production Estimates™** | Complexity · reuse coaching |
| **Quality Inspector™** | Genome match threshold |
| **Department Generator™** | Genome injection manifest |
| **Scene Assembly™** | Blend preferences |

---

## Influence Weights (Default)

| Factor | Weight in recommendations |
|--------|---------------------------|
| Company Genome™ beliefs ≥ 80 | 35% |
| Creative Blueprint™ | 30% |
| Asset Registry reuse | 25% |
| Founder explicit intent | 10% |

Explicit founder intent **overrides** Genome when contradictory — recorded in Decision DNA™.

---

## Scene Planner™ Influence

```yaml
PlannerGenomeHints:
  preferredReuseCategories: string[]
  defaultQualityTier: string
  layerTemplateOverrides: Record<layerId, object>
  estimatedReuseBias: number      # 0–1
```

Increases reuse recommendations when Operational DNA™ shows reuse-first preference.

---

## Registry Compatibility

Genome traits boost compatibility scores:

```
Asset candidate: lighting-rig-editorial
Genome belief: warm-editorial-lighting (97%)
         ↓
Compatibility +12 vs neutral candidate
```

---

## Long-Term: Outcome-Only Requests

```
Founder: "Create a headquarters."
         ↓
Genome fills: lighting · marble · architecture · atmosphere ·
              materials · realism · camera · pacing · quality
         ↓
Founder approves outcome — not atoms
```

**Goal:** founders stop prompting creative atoms.

---

## Generation Accuracy Metric

```yaml
generationAccuracy:
  period: 30d
  recommendationsShown: number
  recommendationsAccepted: number
  accuracy: number                # accepted / shown
  trend: improving | stable | declining
```

Feeds CDS **Generation Accuracy** display.

---

_Generation Influence — every pixel passes through company memory._

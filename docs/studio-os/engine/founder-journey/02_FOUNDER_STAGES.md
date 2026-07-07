# 02 — Founder Stages

**Engine Module:** `studio.founder-journey.v1.founder-stages`  
**Status:** Flexible founder maturity model  
**Philosophy:** Guidance stages — not achievements.

---

## Design Principle

> Stages are **guidance** for adaptation — not badges, not locked levels. Founders may move forward, revisit challenges, or occupy **multiple stages simultaneously**.

Studio Intelligence determines stage from **behavior · goals · business signals** — not arbitrary milestones alone.

---

## Stage Registry

| Stage | ID | Typical Focus |
|-------|-----|---------------|
| **Dreaming** | `dreaming` | Vision · possibility · pre-launch ideation |
| **Building** | `building` | Creating first product · brand · team foundations |
| **Launching** | `launching` | First market entry · early customers · ship |
| **Growing** | `growing` | Traction · repeatability · team expansion |
| **Scaling** | `scaling` | Systems · delegation · operational depth |
| **Leading** | `leading` | Strategic leadership · culture · executive team |
| **Diversifying** | `diversifying` | New brands · acquisitions · portfolio |
| **Legacy** | `legacy` | Succession · institution · long-term impact |

---

## Stage Profiles (Adaptation Hints)

### Dreaming

```yaml
DreamingStage:
  platformTone: expansive · educational · encouraging
  orbRole: teacher · explainer · possibility partner
  hqExpression: starter campus · few buildings · high potential energy
  rituals: longer guidance · more teaching moments
  automation: minimal — founder hands-on expected
```

### Building

```yaml
BuildingStage:
  platformTone: focused · craft · momentum
  orbRole: guide · suggests · explains tradeoffs
  hqExpression: core departments forming · construction visible
  rituals: Walk the Business teaches department purpose
  milestones: first product · first brand assets emphasized
```

### Launching

```yaml
LaunchingStage:
  platformTone: urgent-calm · ship-focused
  orbRole: launch partner · checklist without SaaS checklist UI
  hqExpression: Publishing · Marketing active · countdown culture
  rituals: Launch Day mode frequent (Adaptive Walk)
```

### Growing

```yaml
GrowingStage:
  platformTone: optimistic · data-informed · team-aware
  orbRole: prioritizer · celebrates wins · flags bottlenecks
  hqExpression: departments busier · Customer Experience emerges
  rituals: balance celebration + operations
```

### Scaling

```yaml
ScalingStage:
  platformTone: systems · delegation · strategic
  orbRole: delegator · challenges founder bottlenecks
  hqExpression: Operations · Analytics expand · automation visible
  rituals: shorter walks · more delegate recommendations
```

### Leading

```yaml
LeadingStage:
  platformTone: strategic · culture · long-horizon
  orbRole: executive partner · blind spot highlight · strategic insight
  hqExpression: Executive Office · Boardroom · Innovation Lab
  rituals: Executive Briefings · Reflection Sessions increase
```

### Diversifying

```yaml
DiversifyingStage:
  platformTone: portfolio · synergy · capacity-aware
  orbRole: ecosystem strategist · cross-brand opportunity
  hqExpression: multi-brand operations · Acquisition Center
  rituals: Multi-Brand Evolution paths (11)
```

### Legacy

```yaml
LegacyStage:
  platformTone: reflective · institutional · succession-aware
  orbRole: steward · chronicle keeper · wisdom transmission
  hqExpression: Founder Walk · Remembrance · museum spaces
  rituals: Reflection · Chronicle review dominant
```

---

## Multi-Stage Assessment

```yaml
FounderStageAssessment:
  stageId: FounderStageId
  weight: number                    # 0–1 · sum may exceed 1 across stages
  evidence: string[]
  dominantDimensions: string[]      # e.g., "creative-building" + "launching"
```

Example: Founder at **Growing** (0.7) + **Building** (0.4) on new product line.

---

## Stage Inference Signals

| Signal Category | Examples |
|-----------------|----------|
| Business | Revenue band · team size · department count |
| Behavioral | Delegation rate · walk patterns · time in departments |
| Decision | Approval speed · risk choices · override patterns |
| Stated goals | Founder's Promise · reflection answers |
| Milestones | First launch completed → Launching less dominant |
| Complexity | Multi-brand · international · acquisitions |

**No single signal** determines stage. Weighted inference with confidence score.

---

## Stage Transitions

Transitions are **observed** — not announced as level-ups:

```
Orb (subtle, when appropriate):

"You've been delegating more operational decisions — 
 the Headquarters is ready to support a more strategic daily rhythm."
```

Never: "Congratulations! You reached Level 5: Scaling."

---

## Revisiting Earlier Stages

Founder launching new brand while Leading existing company:

- Primary: `leading` + `building` on new venture
- HQ: portfolio campus · new wing in construction metaphor
- Rituals: Creative Sprint mode on new brand · standard brief on mature brand

**Normal** — not regression.

---

_Next: [03 — Business Evolution](./03_BUSINESS_EVOLUTION.md)_

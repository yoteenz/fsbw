# 06 — Headquarters Evolution

**Engine Module:** `studio.founder-journey.v1.headquarters-evolution`  
**Status:** Founder-growth-driven HQ unlock system  
**Philosophy:** The Headquarters tells the story of the founder's journey.

---

## Design Principle

> As the founder grows, the Headquarters **changes naturally** — new buildings · expanded offices · unlocked capabilities — visual and operational reflection of journey stage.

---

## HQ Evolution Tiers

```yaml
HQEvolutionTier:
  tierId: string
  displayName: string
  narrative: string                 # "Growth campus" · "Executive headquarters"

  unlockedBuildings: string[]
  unlockedDepartments: string[]
  visualTier: CampusVisualTier
  conciergeCapacity: number
  automationCeiling: number
```

Tiers correlate with Founder Stages (02) and Business Evolution (03) — **both** required for unlocks.

---

## Example Unlock Progression

| Founder Growth | HQ Unlocks |
|----------------|------------|
| Building → Launching | Publishing · Marketing buildings complete |
| Growing | Customer Experience · Analytics Observatory |
| Scaling | Operations center · automation workflows visible |
| Leading | Executive Office expansion · **Boardroom** |
| Diversifying | Acquisition Center · Multi-brand Operations |
| International | International Expansion wing |
| Legacy | Founder Walk prominence · Remembrance integration |

Unlocks are **ceremonial** on Walk the Business — World Evolution (10) surfaces them.

---

## Unlock Schema

```yaml
HQUnlockEvent:
  unlockId: string
  buildingOrDepartment: string
  triggeredBy:
    founderStage: FounderStageId | null
    businessSignal: string | null
    milestoneId: string | null
  ceremony: string
  firstSurfacedOnWalk: boolean
```

---

## Executive Office Expansion

Physical metaphor for founder maturity:

| Stage | Executive Office |
|-------|------------------|
| Dreaming | Small plaza · vision objects |
| Building | Modest office · single desk |
| Leading | Expanded suite · board table visible |
| Legacy | Gallery · chronicle walls |

---

## Natural vs Forced

| Natural unlock | Forced |
|----------------|--------|
| Earned through business + founder signals | Paywall only |
| Previewed by Orb before available | Surprise lock-out |
| Genome-appropriate architecture | Generic enterprise template |

Headquarters Engine generates industry-appropriate buildings — Founder Journey gates **when** they appear.

---

## Integration

| Engine | Role |
|--------|------|
| Headquarters Engine™ | Building catalog |
| Campus Evolution Engine™ | Visual tier progression |
| Founder Walk™ | Path · memory integration |
| Marketplace | Expansions accelerate unlocks |
| Company Maturity Engine | Organizational readiness |

---

_Next: [07 — Personalized Rituals](./07_PERSONALIZED_RITUALS.md)_

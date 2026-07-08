# Taste-Driven Recommendations™

> **Canonical home:** [taste-recommendations.md](./taste-recommendations.md) — v2.0 platform strategy sprint. This file remains as extended reference.

**Marketplace discovery powered by Founder Taste Genome™**

**Version:** 1.0.0  
**Status:** Canonical recommendation architecture (docs only)  
**Parent:** [Studio Marketplace™](./README.md)

---

## Purpose

Marketplace recommendations must become **increasingly intelligent** — personal, not generic.

Founders should feel Studio OS understands **how they create** before they browse.

---

## Core Law

```
RECOMMEND PLACES — NOT PRODUCTS
RECOMMEND BY TASTE — NOT TRENDING ALONE
```

---

## Intelligence Inputs

| Genome | Recommendation influence |
|--------|-------------------------|
| **Founder Taste Genome™** | Primary — materials · restraint · lighting · risk |
| **Founder Genome™** | Ceremony · tempo · leadership posture |
| **Company Genome™** | Industry envelope · brand tier |
| **Mode™** | Entrepreneur vs Creator emphasis |
| **Headquarters History™** | Past choices · renovations · rejects |
| **Behavioral signals** | Preview completions · dwell time in previews |

**Source:** [Founder Taste Engine™](../founder-taste-engine/README.md) · [Founder Intelligence System™](../intelligence/README.md)

---

## Taste Match Score™

Every listable headquarters receives a **personal taste match score** per founder (0–100%):

```
Taste Match = weighted similarity(
  Founder Taste Genome™,
  Environment DNA™ taste vectors,
  Founder behavioral history
)
```

### Display Examples

| Score | Orb / UI copy |
|-------|---------------|
| 97% | *"97% Taste Match"* |
| 91% | *"Recommended — closely matches your taste"* |
| 84% | *"Strong match for luxury editorial architecture"* |

### Explanation Transparency

Every recommendation includes **why**:

> *"Recommended because you consistently prefer luxury editorial architecture."*

> *"This headquarters closely matches your Founder Taste Genome™."*

> *"You approved three environments with chrome, marble, and editorial lighting."*

Never black-box recommendations.

---

## Recommendation Surfaces

| Surface | Behavior |
|---------|----------|
| **Onboarding Studio Originals™** | 3–5 taste-matched Originals |
| **Marketplace For You** | Personalized HQ row |
| **Orb proactive** | *"I found a Living Set™ that matches your taste."* |
| **Post-Renovation** | *"Creators building in your style"* |
| **Post-Rejection** | Adjust weights — don't resurface similar |
| **Premium Generation™** | Prioritize taste-aligned Concept A/B/C |

---

## Taste Dimensions Matched

| Dimension | Example signal |
|-----------|----------------|
| **Architectural genre** | Editorial vs minimal vs industrial |
| **Material vocabulary** | Marble/chrome vs walnut vs white planes |
| **Lighting preference** | Dramatic vs even vs warm |
| **Spatial restraint** | Maximal vs Apple minimal |
| **Motion appetite** | Calm idle vs kinetic holograms |
| **Risk tolerance** | Experimental vs conservative environments |
| **Color physics** | Warm vs cool material palettes |

Derived from [Taste Learning™](../founder-taste-engine/taste-learning.md) — decisions not surveys.

---

## Cold Start (New Founder)

Before Taste Genome™ is rich:

| Phase | Recommendation source |
|-------|----------------------|
| **First 5 minutes** | Mode™ + Industry + Company Genome™ |
| **After first selection** | Initial taste vectors from Original choice |
| **After first approval/rejection** | Taste Learning™ activates |
| **After 3+ environment decisions** | Full taste match scores |

Never empty catalog — Studio Originals™ always available.

---

## Negative Signals

| Founder action | Recommendation adjustment |
|----------------|---------------------------|
| Reject environment | Downrank similar DNA vectors |
| Uninstall package | Strong negative weight |
| Short preview bounce | Mild negative |
| Explicit "not my style" | Orb refines · taste dialogue |
| Branch™ preference | Uprank parallel aesthetics |

Rejected aesthetics feed **Alternate Branch™** memory — not deleted.

---

## Creator-Facing Taste Insights (Future)

Creators see **aggregate** taste demand — never individual founder data:

| Insight | Use |
|---------|-----|
| *"Luxury editorial demand +12% this quarter"* | Design direction |
| *"Minimal tech labs highly installed in SaaS"* | Portfolio strategy |

No founder genome leakage.

---

## Orb Taste Dialogue™

| Moment | Orb pattern |
|--------|-------------|
| High match browse | *"97% match — this feels like environments you've chosen before."* |
| Surprising match | *"Different genre — but matches your lighting and material taste."* |
| Low match warning | *"Beautiful — but may not align with your usual restraint."* |
| Taste update | *"Your taste profile shifted toward warmer hospitality."* |

**Source:** [Orb Taste Dialogue™](../founder-taste-engine/orb-taste-dialogue.md)

---

## Anti-Patterns

| Anti-pattern | Violation |
|--------------|-----------|
| Generic "Trending" as default | Ignores taste |
| Same recommendations for all founders | Breaks intelligence promise |
| Opaque scores without explanation | Breaks trust |
| Taste sold to creators for targeting | Privacy violation |
| Recommend individual assets | Wrong product class |

---

## Relationship to Canon

| System | Role |
|--------|------|
| [Marketplace Ranking™](./marketplace-ranking.md) | Taste weight in sort |
| [Studio Originals™](./studio-originals.md) | Onboarding recommendations |
| [Predictive Design™](../founder-taste-engine/predictive-design.md) | Premium gen alignment |

---

## Implementation Status

**Docs only.** Recommendation spec — no ML implementation this sprint.

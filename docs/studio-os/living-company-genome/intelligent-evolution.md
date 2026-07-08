# Intelligent Evolution™ — Earned Growth

**Module:** `studio.living-company-genome.v1.intelligent-evolution`  
**Status:** Studio OS recommends evolution — never random

---

## Principle

> Growth becomes earned. Never random.

Studio OS observes business reality + genome maturity → offers **eligible** world upgrades.

---

## Recommendation Examples

| Signal | Recommendation |
|--------|----------------|
| HQ still Genesis tier · 2 years · 100+ customers | *"Your headquarters still reflects an early-stage startup. Evolve toward Established materials?"* |
| 5 premium launches · showroom criteria met | *"Your showroom qualifies for Signature Collection™ exhibit tier."* |
| Funding closed | *"Investor milestone unlocks Executive wing craftsmanship upgrade."* |
| Award won | *"Display award in Wall of Milestones™ + landmark accent lighting?"* |
| Brand refresh complete | *"Seal pre-refresh Time Capsule™ · activate new brand chapter?"* |
| Blueprint maturity lag | *"Creative DNA™ ahead of Architectural DNA™ — evolve HQ shell to match?"* |

---

## Evolution Offer Schema

```yaml
EvolutionOffer:
  offerId: string
  orgId: string
  type: material-tier | wing-unlock | landmark-upgrade | museum-wing | blueprint-evolution | exhibit-layer
  earnedBy:
    eventIds: string[]
    strandMaturity: Record<strandId, number>
  recommendation:
    summary: string
    rationale: string              # WHY earned
    previewTimelineId: string | null
  choices:
    - Accept Evolution™
    - Preview First™
    - Defer
    - Decline (pin current tier)
  impact:
    dnaStrands: string[]
    blueprintChanges: string[]
    assetGaps: number
    coherenceGain: number
  expiresAt: datetime | null       # soft urgency — never forced
```

---

## Earned Eligibility Rules

| Upgrade | Minimum Signals |
|---------|-----------------|
| Material tier +1 | Strand maturity + event threshold |
| Wing unlock | Operational DNA + specific event |
| Landmark upgrade | Architectural DNA + Golden Build history |
| Museum wing | Multiple genome events + capsule count |
| Blueprint evolution | Creative DNA + founder taste alignment |
| Signature Collection™ | Customer DNA + product tier rules |

**No pay-to-skip** — marketplace blueprints accelerate language · not maturity tier.

---

## Orb Voice

Recommendations are **invitations**:

> *"You've earned a more refined headquarters. Want to see how Executive Luxury would feel within your existing Editorial language — or stay in startup mode a while longer?"*

Never shame early-stage aesthetic.

---

## Decline & Pin

Founder may **decline** or **pin** current tier:

- Recorded in genome (preference for startup aesthetic)
- Intelligent Evolution suppresses repeat nag
- Re-offer on new major event only

---

## Integration

| System | Role |
|--------|------|
| **Pulse™** | Business metrics |
| **Memory Engine™** | Outcome verification |
| **Creative Blueprint Engine™** | Blueprint evolution execution |
| **Asset Intelligence™** | Reuse vs gap-fill |
| **Expeditions™** | Narrative evolution arcs |

---

## Anti-Patterns

| Anti-Pattern | Why |
|--------------|-----|
| Premium look on day one | Breaks earned growth |
| Upgrade without explanation | Breaks trust |
| Forced upgrade modal | Violates founder agency |
| Cosmetic-only with no event | Fake maturity |

---

_Intelligent Evolution™ — earned, explained, optional._

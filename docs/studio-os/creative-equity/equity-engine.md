# Equity Engine™

**Module:** `studio.creative-equity.v1.engine`  
**Status:** What increases Creative Equity™ — and what does not

---

## Principle

> The Equity Engine™ rewards **longevity · consistency · quality · reuse · adaptability** — never unnecessary generation.

---

## Reward Dimensions

| Dimension | Equity signal |
|-----------|---------------|
| **Longevity** | Asset active across months/years |
| **Consistency** | Blueprint language coherent org-wide |
| **Quality** | Studio Certified™ · Golden Build™ approval |
| **Reuse** | High reuse count · cross-department adoption |
| **Adaptability** | Blueprint variants · modify-not-regenerate |
| **Marketplace Value** | Publications · licenses · downloads |
| **Founder Satisfaction** | Approvals · collections · pinned assets |
| **Creative Efficiency** | Savings generated vs hypothetical regenerate |
| **Design Excellence** | Validation Loop™ score · Braintrust endorsement |

---

## Equity Events (Increase)

```yaml
EquityEvent:
  eventId: string
  orgId: string
  timestamp: ISO8601
  eventType:
    - golden_build_approved
    - blueprint_created
    - blueprint_reused
    - system_created
    - system_reused
    - landmark_created
    - living_set_certified
    - department_certified
    - studio_original_certified
    - asset_studio_certified
    - marketplace_published
    - marketplace_sale
    - marketplace_license
    - asset_reuse_milestone
    - blueprint_adopted_external
    - community_adoption
    - positive_marketplace_rating
    - founder_collection_added
    - long_term_usage_milestone
  entityId: string
  entityType: asset | blueprint | system | landmark | department | set | marketplace_product
  equityDeltaUsd: number
  reasoning: string
```

---

## Equity Events (No Increase / Decrease)

| Event | Treatment |
|-------|-------------|
| Uncertified draft generation | Zero until approved |
| Failed generation | Zero |
| Regenerate without new value | Zero delta |
| Redundant duplicate asset | Minimal · archive recommended |
| Asset deprecated | Equity **preserved** in history — not erased |
| Unnecessary full-scene regen | No bonus · may reduce efficiency signals |

Equity history is **append-only**. Deprecation does not delete contribution record.

---

## Contributor Weights (v1)

```
equityDelta = baseValue(entityType) × qualityMultiplier × reuseMultiplier × longevityBonus

qualityMultiplier:
  draft: 0
  approved: 1.0
  golden_build: 1.25
  studio_certified: 1.5

reuseMultiplier:
  log-scaled from reuseCount (caps prevent runaway)

longevityBonus:
  +5% per year active (capped)
```

Exact coefficients live in internal rate card — founder sees **equity delta result**, not formula internals.

---

## Equity Score Aggregation

```
equityScoreUsd = Σ equityEvent.equityDeltaUsd (lifetime, org-scoped)
               + portfolioIntrinsicValue (blueprints · landmarks · certified sets)
               + marketplaceInfluenceValue (spec · not cash ledger)
```

Headline **Creative Equity™** is a single founder-facing number with drill-down to [Creative Portfolio™](./creative-portfolio.md).

---

## Orb Integration

Equity Engine™ triggers Orb insights when:

| Trigger | Orb example |
|---------|---------------|
| Blueprint reuse milestone | *"Editorial Luxury Blueprint™ is one of your most valuable assets."* |
| Landmark cross-department | *"This Landmark™ reused across nine departments."* |
| External adoption | *"Creative Equity increased — Blueprint adopted by three headquarters."* |
| Design language maturation | *"Your design language has become significantly more valuable."* |

---

## Relationship to Creative Budgets™ Efficiency Score™

| Metric | Horizon | Focus |
|--------|---------|-------|
| Efficiency Score™ | Monthly | How wisely budget was spent |
| Creative Equity™ | Lifetime | What wealth was built |

High monthly efficiency **feeds** equity growth — but equity persists when budget resets.

---

_Equity Engine™ — reward what lasts, ignore what wastes._

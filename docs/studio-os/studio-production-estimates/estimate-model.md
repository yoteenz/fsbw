# Production Estimate™ Model

**Module:** `studio.production-estimates.v1.model`  
**Status:** Canonical estimate schema

---

## Production Estimate™ Card (Founder-Facing)

```
┌─────────────────────────────────────────────┐
│  PRODUCTION ESTIMATE™                       │
│  Creative Direction Studio™ · Story Table™  │
├─────────────────────────────────────────────┤
│  Estimated Production Cost™     $2.48       │
│  Estimated Production Time™     2m 12s      │
│  Assets Reused™                 8           │
│  Blueprints Reused™             1           │
│  Systems Reused™                5           │
│  Assets Modified™               3           │
│  New Assets Generated™          2           │
│  Estimated Savings™             $4.86       │
│  Production Complexity™         Medium      │
├─────────────────────────────────────────────┤
│  [ Approve Production™ ]  [ Revise Scope™ ] │
└─────────────────────────────────────────────┘
```

---

## Field Definitions

### Estimated Production Cost™

| Property | Rule |
|----------|------|
| **What it is** | Abstract production value for approved scope |
| **What it is not** | API bill · token cost · provider invoice |
| **Currency** | USD display · rounded to cents |
| **Basis** | Line items · complexity multiplier · assembly time |

Internal mapping from production units exists — **never shown to founder**.

---

### Estimated Production Time™

| Property | Rule |
|----------|------|
| **Format** | `Xm Ys` or `Xs` for short jobs |
| **Includes** | Queue · generation · validation · assembly |
| **Excludes** | Founder review time (separate) |
| **Reuse items** | Near-zero time contribution |

---

### Assets Reused™

Count of Registry assets linked with **Reuse Existing™** — no new provider execution.

---

### Blueprints Reused™

Count of **Creative Blueprints™** applied (typically 0–2 per production unit).

---

### Systems Reused™

Count of **Systems™** inherited from active blueprint (lighting · materials · etc.).

---

### Assets Modified™

Count of **Duplicate & Modify™** partial productions.

---

### New Assets Generated™

Count of **Generate Completely New™** units — should be minimized by intelligence.

---

### Estimated Savings™

Dollar value of reuse vs hypothetical full-regeneration scope:

```
Savings = FullRegenProductionCost - ActualProductionCost
```

Always shown when savings > 0.

---

### Production Complexity™

| Tier | Meaning |
|------|---------|
| **Low** | Heavy reuse · few gaps · single system |
| **Medium** | Mixed reuse + modify + 1–3 new assets |
| **High** | New blueprint variant · many layers · cross-deps |
| **Signature** | Landmark · multi-system · golden-tier QA |

See [production-complexity.md](./production-complexity.md).

---

## Line Item Schema

```yaml
ProductionLineItem:
  id: string
  label: string                    # "Editorial Lighting System™"
  action: reuse | modify | generate | inherit-system
  category: asset | blueprint | system | layer
  registryRef: string | null
  blueprintRef: string | null
  systemRef: string | null
  productionCostUsd: number
  productionTimeSeconds: number
  savingsVsGenerateUsd: number
  complexityWeight: number
  founderVisible: true
```

---

## Estimate Versions

| Version | When |
|---------|------|
| **Draft** | Calculating · intelligence in flight |
| **Presented** | Shown to founder · awaiting approval |
| **Approved** | Locked scope for Generation Manager™ |
| **Revised** | Founder changed scope · new estimate id |
| **Actual** | Post-production reconciliation (internal + summary) |

Approved estimate ID passed to Generation Manager™ job manifest.

---

## Comparison Mode (Optional)

When founder revises scope:

```
Original Estimate          Revised Estimate
Cost $4.12                 Cost $2.48
New assets 6               New assets 2
Savings $2.10              Savings $4.86
```

Orb highlights what changed and why savings improved.

---

_Estimate Model — production studio quote, not API receipt._

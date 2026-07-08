# Dashboard Fields™

**Module:** `studio.creative-budgets.v1.dashboard`  
**Status:** Founder-facing display contract (spec only)

---

## Primary Surfaces

| Surface | Placement |
|---------|-----------|
| **Mission Control** | Financial / Production wing strip |
| **Headquarters Experience™** | Operations or Financial zone card |
| **Pre-production gate** | Compact budget pill beside Production Estimate™ |
| **Command Dock** | Orb references budget in coaching |

---

## Canonical Dashboard Layout

```
Creative Budget™
────────────────────────────────────
Monthly Budget          $250.00
Spent                   $41.72
Estimated Pending       $28.14
Saved Through Reuse     $137.55
Efficiency Score        94%
────────────────────────────────────
Assets Reused           482
Blueprint Systems       118
────────────────────────────────────
Completed (month)       12
Pending                 3
```

---

## Field Display Rules

| Field | Always show | Format |
|-------|-------------|--------|
| Monthly Budget™ | Yes | `$XXX.XX` |
| Spent | Yes | `$XXX.XX` |
| Estimated Pending™ | Yes | `$XXX.XX` |
| Saved Through Reuse | Yes | `$XXX.XX` |
| Efficiency Score™ | Yes | `XX%` |
| Assets Reused™ | Yes | Integer |
| Blueprint Systems Reused™ | Yes | Integer · label "Blueprint Systems" |
| Available | Optional secondary | `$XXX.XX` |
| Monthly Production™ | Yes (footer) | Integer |
| Pending Productions™ | Yes (footer) | Integer |

---

## Visual Hierarchy

1. **Capacity row** — Budget · Spent · Pending (founder asks "can I afford this?")
2. **Efficiency row** — Savings · Score (founder asks "am I producing intelligently?")
3. **Reuse row** — Assets · Blueprints (founder asks "is my investment compounding?")
4. **Activity row** — Completed · Pending counts

---

## Compact Pill (Pre-Estimate)

Beside Production Estimate™ card:

```
Creative Budget™  $180.14 available · 94% efficient
```

Tap expands full dashboard.

---

## Warning States

| State | Display | Orb |
|-------|---------|-----|
| **Healthy** | Default styling | Coaching wins |
| **Low available** (< 20% budget) | Amber accent | Suggest reuse revision |
| **Pending heavy** | Show pending prominently | "3 productions in flight" |
| **Depleted** | Soft gate on new approvals | Scope reduction coaching |

Never red-alarm API meter aesthetics.

---

## Mobile-First

- Single column stack
- Scannable currency grid
- Efficiency Score™ as hero metric (large percent)
- Orb coaching collapsible below card

---

## Forbidden on Dashboard

See [forbidden-exposure.md](./forbidden-exposure.md):

- Provider names
- Token counts
- Per-model costs
- API credit language

---

_Dashboard Fields™ — creative capacity at a glance._

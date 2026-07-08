# Integration Map™

**Module:** `studio.creative-budgets.v1.integrations`  
**Status:** Pipeline position

---

## Upstream (Inputs)

| System | Provides |
|--------|----------|
| [Studio Production Estimates™](../studio-production-estimates/README.md) | Per-job cost · savings · reuse breakdown |
| [Asset Intelligence Engine™](../asset-intelligence-engine/README.md) | Reuse classification · savings signals |
| [Creative Blueprint Engine™](../creative-blueprint-engine/README.md) | Blueprint/System reuse events |
| [Living Company Genome™](../living-company-genome/README.md) | Maturity · efficiency bonus context |
| [Studio Asset Registry™](../engines/studio-asset-registry/README.md) | Asset reuse counts · investment depth |
| [Monetization Architecture](../monetization-architecture.md) | Default Monthly Budget™ tier |

---

## Downstream (Consumers)

| System | Receives |
|--------|----------|
| [Mission Control](../engine/mission-control/) | Creative Budget™ dashboard strip |
| [Headquarters Experience™](../../motherboard/CORE.md) | Financial / operations zone card |
| [Studio Generation Manager™](../engines/generation-manager/README.md) | Budget ledger status updates |
| [Command Dock / Orb](../studio-intelligence-architecture/) | Coaching narration inputs |
| [Company Health Index™](../company-health-index.md) | Innovation / efficiency signals (future) |

---

## Pipeline Order (Canonical)

```
Monthly Creative Budget™ allocated
         ↓
Creative Blueprint context
         ↓
Asset Intelligence search
         ↓
Production Estimate™ (per job)
         ↓
★ Creative Budget gate (available check) ★
         ↓
Founder approve → Pending reserved
         ↓
Generation Manager™
         ↓
On complete → Spent + Savings rollup
         ↓
Efficiency Score™ recalculate
         ↓
Orb coaching
```

---

## Production Estimates™ Handoff

```yaml
BudgetReservation:
  productionEstimateId: string
  estimatedCostUsd: number
  estimatedSavingsUsd: number
  breakdown:
    assetsReused: number
    blueprintsReused: number
    systemsReused: number
  onApprove: increment estimatedPendingUsd
  onComplete: transfer to spentUsd + savings rollup
  onCancel: release pending
```

Creative Budgets™ **consumes** estimate fields — never duplicates calculation logic.

---

## Generation Manager™ Callbacks

| Event | Budget action |
|-------|---------------|
| `job.started` | Ledger → `in_progress` |
| `job.completed` | Close ledger · rollup savings |
| `job.failed` | Pending holds until retry or cancel |
| `job.cancelled` | Release pending |

---

## CDS Integration

| CDS Action | Budget interaction |
|------------|-------------------|
| `ensureStation(arrival)` | Estimate → reserve pending |
| `regenerateLayer(lighting)` | Smaller estimate · smaller reservation |
| Pipeline stage generate | Stage estimate batch · single approval |

Budget pill visible on Story Table™ estimate gate.

---

## Intelligence Stack Position

```
Company
  → Visual DNA™ / Living Company Genome™
  → Creative Blueprints™ / Systems™
  → Asset Intelligence (reuse before generate)
  → Studio Production Estimates™ (pre-production quote)
  → ★ Creative Budgets™ (monthly capacity) ★
  → Generation Manager™ (execute after approval)
  → Asset Registry™
```

---

## Internal Admin (Future)

Platform operators may configure production rate cards and tier budgets — never merged into founder Creative Budget™ card as provider detail.

---

_Integration Map™ — monthly capacity gates intelligent production._

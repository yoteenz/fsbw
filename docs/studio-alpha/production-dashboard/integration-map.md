# Integration Map™

**Module:** `studio-alpha.production-dashboard.v1.integrations`  
**Status:** Internal manufacturing pipeline position

---

## Upstream Data Sources

| System | Provides |
|--------|----------|
| [Studio Generation Manager™](../../studio-os/engines/generation-manager/README.md) | Job state · retries · provider callbacks |
| [Studio Production Estimates™](../../studio-os/studio-production-estimates/README.md) | Estimated cost/time per job |
| [Creative Budgets™](../../studio-os/creative-budgets/README.md) | Founder-facing rollups (sanitized) |
| [Scene Stack™](../../studio-os/scene-stack/README.md) | Layer manifest · scene structure |
| [Creative Blueprint Engine™](../../studio-os/creative-blueprint-engine/README.md) | Blueprint · System metadata |
| [Asset Intelligence Engine™](../../studio-os/asset-intelligence-engine/README.md) | Reuse · compatibility signals |
| [Studio Asset Registry™](../../studio-os/engines/studio-asset-registry/README.md) | Asset records · versions |
| [Production Lifecycle™](../../studio-os/production-lifecycle/) | Golden Build · Certified stages |
| [Creative Approval Pipeline™](../../studio-os/creative-direction-pipeline/) | Approval states |
| [Event Bus™](../../studio-os/event-bus.md) | Real-time job events |

---

## Downstream Consumers

| Consumer | Receives |
|----------|----------|
| Studio Alpha™ operators | Full dashboard |
| [Production Orb™](./production-orb.md) | Briefings · alerts |
| [Optimization Center](./optimization-center.md) | Recommendation engine |
| Internal reporting | Cost · ROI exports |
| Estimate calibration (internal) | Actual vs estimate variance |

**Does not feed:** Founder Studio OS UI directly — only sanitized rollups via Creative Budgets™ / Production Estimates™.

---

## Pipeline Position

```
Studio World™ Build Plan
         ↓
Roadmap View™ (hierarchy)
         ↓
Production Estimate™ (founder) + Internal scope (operators)
         ↓
★ Production Dashboard™ Queue ★
         ↓
Generation Manager™ (FAL · providers)
         ↓
★ Generation Analytics™ (GPU truth) ★
         ↓
Registry + Approvals
         ↓
Asset ROI™ · Blueprint Analytics™ rollup
         ↓
Optimization Center™ recommendations
         ↓
Production Orb™ briefing
```

---

## Intelligence Stack (Full)

```
Studio Alpha™ Build Plan
  → Scene Stack™ layers
  → Creative Blueprints™ / Systems™
  → Asset Intelligence (reuse paths)
  → Production Estimates™ (founder quote)
  → Creative Budgets™ (founder monthly capacity)
  → ★ Production Dashboard™ (internal truth) ★
  → Generation Manager™
  → Asset Registry™
  → Asset ROI™ / Blueprint Analytics™
```

---

## Event Subscriptions

| Event | Dashboard action |
|-------|------------------|
| `generation.job.queued` | Add/update queue item |
| `generation.job.started` | Status → Generating |
| `generation.job.completed` | Cost rollup · ROI update |
| `generation.job.failed` | Failure analytics · Orb alert |
| `approval.pending` | Queue → Waiting Approval |
| `approval.approved` | Scene layer status · completion % |
| `blueprint.applied` | Blueprint Analytics reuse++ |
| `asset.reused` | Asset ROI reuse++ |

---

## CDS Pilot Integration

| CDS entity | Dashboard module |
|------------|------------------|
| Creative Direction Studio™ | Department Analytics |
| Story Table™ scene | Scene Analytics |
| Per-layer stack | Layer rows + Queue items |
| Editorial Luxury Blueprint™ | Blueprint Analytics |

---

_Integration Map™ — internal Mission Control wired to the pipeline._

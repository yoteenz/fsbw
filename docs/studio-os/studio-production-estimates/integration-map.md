# Integration Map™

**Module:** `studio.production-estimates.v1.integrations`  
**Status:** Pipeline position

---

## Upstream (Inputs)

| System | Provides |
|--------|----------|
| [Creative Blueprint Engine™](../creative-blueprint-engine/README.md) | Blueprints · Systems™ scope |
| [Asset Intelligence Engine™](../asset-intelligence-engine/README.md) | Reuse · modify · generate classification |
| [Scene Stack™](../scene-stack/README.md) | Layer manifest per station |
| [Living Company Genome™](../living-company-genome/README.md) | Maturity · complexity context |
| [Studio Asset Registry™](../engines/studio-asset-registry/README.md) | Performance cost history (internal) |

---

## Downstream (Consumers)

| System | Receives |
|--------|----------|
| [Studio Generation Manager™](../engines/generation-manager/README.md) | Approved estimate · locked line items |
| [Creative Approval Pipeline™](../creative-direction-pipeline/README.md) | Post-production review (separate) |
| [Production Lifecycle Golden Build™](../production-lifecycle/golden-build.md) | Estimate at certification gates |
| Build report (internal) | Actual vs estimate reconcile |

---

## Pipeline Order (Canonical)

```
Blueprint context
         ↓
Asset Intelligence search
         ↓
★ Production Estimate™ ★
         ↓
Founder approve
         ↓
Generation Manager™
         ↓
Validation Loop™
         ↓
Registry
         ↓
Runtime
```

---

## Generation Manager™ Handoff

```yaml
GenerationManagerJob:
  productionEstimateId: string
  approvedLineItems: ProductionLineItem[]
  scopeHash: string                    # tamper detection
  executeOnlyApproved: true
```

Generation Manager **must not** exceed approved `newAssetsGenerated` count without new estimate.

---

## CDS Integration

| CDS Action | Estimate type |
|------------|---------------|
| `ensureStation(arrival)` | Station stack estimate |
| `regenerateLayer(lighting)` | Single layer estimate |
| Pipeline stage generate | Stage manifest estimate |

---

## Internal Admin (Future)

Platform operators may see provider routing in **admin-only** build reports — never merged into founder Production Estimate™ UI.

---

_Integration Map™ — estimate gates execution._

# Approval Engine

Nothing reaches manufacturing automatically.

## Approval stages

| Stage | Description | AI compute |
|-------|-------------|------------|
| `draft` | Founder intent captured | None |
| `blueprint` | Blueprint Author produced plan | None |
| `review` | Founder inspects in Construction Mode | None |
| `approved` | Founder authorized manufacturing | Authorized |
| `queued` | Jobs decomposed and scheduled | Pending |
| `manufacturing` | Workers executing Render Intent | Active |
| `verification` | Quality Guard + Inspection | Active |
| `accepted` | Object approved for Living World | Complete |
| `rejected` | Failed verification — repair or discard | Stopped |
| `revision-requested` | Founder requests change before re-queue | None |

## State machine

```
draft → blueprint → review → approved → queued → manufacturing
                                    ↓
                              revision-requested → blueprint
                                    ↓
manufacturing → verification → accepted → Living World
                           → rejected → repair → manufacturing
```

## Shipped gate (Documented Fact)

Construction Mode implements the **review → approved** gate:

```typescript
// Shipped — src/studio-os-core/construction-mode/compile-orchestrator.ts
runConstructionModeCompile({ founderApproved: false });
// → manufacturing blocked
```

Full Approval Engine runtime for non-environment objects is **Planned**.

## Cross-references

- Construction Mode founder approval: `docs/studio-os/construction-mode/CONSTRUCTION_MODE.md`
- Founder Preview: `docs/studio-os/manufacturing-engine/FOUNDER_PREVIEW.md`

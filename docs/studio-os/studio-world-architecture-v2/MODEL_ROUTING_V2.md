# Model Routing v2

**Version:** `model-routing-v2.v1`

## Law

**Never allow one model to generate everything.** Every model has one responsibility.

## Matrix

| Level | Route | Responsibility |
|-------|-------|----------------|
| Architecture | `environment-shell` / NBP edit | BlueprintShell |
| Room blueprint | World Compiler | Intelligence only |
| Hero assets | `signature-landmark` / NB2 | Isolated hero objects |
| Furniture | `furniture-objects` / NB2 | Furniture groups |
| Decor | `decorative-object` / NB2 | Fast disposable decor |
| Materials | Material library | No AI textures |
| Lighting | Lighting overlay | Independent pass |
| Assembly | Scene Stack v2 | Mount only |
| Validation | Quality Guard | Per-subsystem |
| Repair | Immune System | Localized recovery |

## Integration

Delegates to `creative-production/model-registry/` — `layer-model-routing.v2`.

## Module

`src/studio-os-core/studio-world-architecture-v2/model-routing-v2.ts`

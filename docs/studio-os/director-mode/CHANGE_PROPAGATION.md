# Change Propagation

When a shared resource changes, only **dependent objects** rebuild. The entire world never recompiles.

## Example: Brand Marble update

```
Brand Marble (material library)
    ↓ propagates to
├── Lobby Floor
├── Reception Desk
├── Packaging (ribbon foil reference)
├── Website (hero texture)
├── Campaign (background material)
└── Presentation (slide background)
```

Only objects with `materialRefs` containing `founder-marble` enter the rebuild queue.

## Propagation rules

| Change type | Propagation scope | Full world recompile |
|-------------|-------------------|----------------------|
| Material library update | All objects referencing material | **Forbidden** |
| Brand color system update | Brand-tagged objects | **Forbidden** |
| Typography update | Text objects referencing typeface | **Forbidden** |
| Single object replace | Selected object only | **Forbidden** |
| Architecture shell change | All socket-bound assets | Bounded to room |
| Founder explicit override | As specified | Founder-only |

## Dependency graph

Change Propagation uses the **relationship graph** on each Directable Object:

```typescript
// Conceptual
type PropagationPlan = {
  sourceChange: { objectId: string; changeType: string };
  affectedObjects: string[];
  rebuildJobs: ManufacturingJob[];
  unaffectedObjects: string[];
  roomRemainsOperational: true;
};
```

## Shipped foundation

Blueprint diff engine and Immune DNA repair implement **attribute-level** drift detection. Full cross-studio propagation is **Planned**.

## Cross-references

- Material Reference System: `docs/studio-os/blueprint-author/MATERIAL_REFERENCE_SYSTEM.md`
- Blueprint Diff Engine: `docs/studio-os/blueprint-author/BLUEPRINT_DIFF_ENGINE.md`
- Dependency Visualizer: `docs/studio-os/construction-mode/DEPENDENCY_VISUALIZER.md`

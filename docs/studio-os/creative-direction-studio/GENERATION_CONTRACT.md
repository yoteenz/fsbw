# Creative Director Studio Generation Contract

CDS shares the Experience Lab generation kernel (`useSceneStack` + `studio-builder-generate`).

## Artifact intent routing

| CDS output | Intent | Validator |
|------------|--------|-----------|
| Full campaign | `campaign-composite` | Full-scene allowed |
| Complete logo | `full-logo` | Brand fidelity |
| Logo symbol | `logo-component` | Component isolation |
| Packaging render | `packaging-composite` | Full composition |
| Model replacement | `campaign-model-replacement` | Targeted swap |
| Scene Stack furniture layer | `object-group` | Isolated (when used) |

Enable via `creativeStudioStackMode: true` + `cdsArtifactClass` when generating composites.

## Divergence from Frontal Slayer

Same as Experience Lab — verified-asset pipeline applies only when `requiresIsolatedObjectValidation(intent)` is true.

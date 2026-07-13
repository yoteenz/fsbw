# Artifact Intent Contract

Validation resolves by **artifact intent**, not a universal full-scene rejection rule.

## Intent types

| Intent | Full scene allowed | Isolated validation |
|--------|-------------------|---------------------|
| `environment-shell` | Yes | No |
| `final-scene` | Yes | No |
| `isolated-object` | No | Yes |
| `object-group` | No | Yes |
| `campaign-composite` | Yes | No |
| `logo-component` | No | Yes (component) |
| `transparent-overlay` | Partial | Relaxed |

## Implementation

`src/studio-os-core/creative-production/artifact-intent.ts`

`runVerifiedAssetProductionPipeline` gates isolated validation via `requiresIsolatedObjectValidation(intent)`.

## CDS routing

Pass `cdsArtifactClass` for Director Mode composites. Full campaigns use `campaign-composite` — never isolated-object validator.

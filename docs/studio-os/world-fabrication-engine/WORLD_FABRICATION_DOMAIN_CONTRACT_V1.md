# World Fabrication Domain Contract V1

**Source:** `src/studio-os-core/world-fabrication-engine/types.ts`

## Core entities (reconciled)

| Conceptual entity | V1 type / location |
|-------------------|-------------------|
| WORLD_PROJECT | `WorldProjectRef` |
| SPATIAL_SPECIFICATION | `SpatialSpecification` |
| VISUAL_AUTHORITY_SET | `VisualAuthorityRecord[]` on job store |
| REFERENCE_VIEW | `ReferenceViewRecord` |
| FABRICATION_JOB | `FabricationJobManifest` + `FabricationJobStore` |
| FABRICATION_STAGE | `FabricationStageState` + `WORLD_FABRICATION_STAGES` |
| FABRICATION_ASSET | `FabricationAssetRecord` |
| ASSET_VARIANT / lineage | `LineageTransformRecord` |
| GEOMETRY_MODULE | `GeometryModuleFamily` + module hierarchy in handoff |
| MATERIAL_SET | tracked via asset metadata + validation |
| SCENE_ASSEMBLY | `SceneAssemblyInstance[]` |
| INTERACTION_CONTRACT | `InteractionAnchor` |
| VALIDATION_REPORT | `FabricationValidationReport` |
| FOUNDER_REVIEW | `FounderReviewRecord` |
| EXPORT_PACKAGE | `WebRuntimeExportManifest` / delivery stage |
| DEPLOYMENT_TARGET | `STAGE_14` gate — not authorized in foundation sprint |

Generated outputs are **never** canonical without explicit founder approval status.

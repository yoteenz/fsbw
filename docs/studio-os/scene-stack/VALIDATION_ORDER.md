# Scene Stack Validation Order

## Canonical order (isolated-object / object-group)

1. **GENERATED_CANDIDATE** — provider URL received
2. **IDENTITY_VALIDATING** — requested object vs full-scene likelihood
3. **STRUCTURE_VALIDATING** — frame coverage, silhouette (salvageable opaque deferral)
4. **BACKGROUND_CLASSIFYING** — SIMPLE_SOLID vs FULL_SCENE_RERENDER
5. **BACKGROUND_REMOVING** — Ideogram / white-studio fallback (when eligible)
6. **POSTPROCESS_VALIDATING** — alpha, halo, edge integrity
7. **APPROVED** — mount authorized

## Pre-repair bug

Structural and quality stages rejected opaque studio plates **before** step 5, causing `QUALITY_REGENERATE_REQUIRED` on otherwise salvageable NB2 output.

## Post-repair

`isSalvageableOpaqueStudioPlate()` defers transparent-margin and opaque-background hard rejection until extraction completes or fails.

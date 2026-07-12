# Incident — Full-Scene Rerender Layer Failure

**Compile run:** `run-1783892114155-bnqd8w`  
**Date:** 2026-07-11  
**Severity:** P0 — Layer 1 validation blocked compile

## Documented facts

1. Shell foundation pipeline completed successfully (HTTP 202, registered, persisted, mount verified).
2. `pipelineComplete: true`, `pipelineOk: true` for shell phase.
3. Compile failed at Layer 1 with `LANDMARK_VALIDATION_FAILED` / `QUALITY_REGENERATE_REQUIRED`.
4. Quality guard: "Object layer fills entire frame — likely full-scene rerender baking prior layers."
5. `signature-landmark` and `furniture-objects` outputs resembled full-scene photographs, not isolated plates.
6. Shell remained valid after failure.
7. Scene-layer-quality-guard correctly rejected invalid assets.

## Inference

The prior prompt/reference/model combination encouraged scene recreation:

- `nano-banana-pro/edit` is img2img-capable.
- Shell URL was previously passed as dominant reference for all non-shell layers.
- Prompts had weak isolation language; webp output lacked reliable alpha.

## Repair shipped

- Isolated layer contract (`isolated-layer-contract.v1`).
- Dedicated isolated prompts (`scene-stack.v3-isolated`).
- Shell reference stripped for `signature-landmark` and `furniture-objects`.
- PNG output for isolated object layers.
- Strengthened quality guard with frame coverage, transparency, shell similarity.
- Automatic regeneration loop (max 2 attempts, shell preserved).
- UI truth: landmark failure vs shell failure distinguished.
- Immune System recovery event chain.

## In progress

Founder verification on mobile Experience Lab compile beyond Layer 1.

## Planned

Broader layer-specific provider routing if FAL text-only isolation remains unreliable at scale.

## Founder action

- **If repair succeeds:** None.
- **If two regeneration attempts fail:** Review provider strategy or approve governed model-route change.

# Current Handoff — Active Sprint State

**Last updated:** 2026-07-12

## Current sprint

**P0 Isolated Asset Prompt + Model Routing Repair — SHIPPED (pending founder verification)**

Root cause for `run-1783893880377-6ymov2`: **COMBINED** — img2img `nano-banana-pro/edit` + marble fallback + insufficient isolation against model behavior.

**Repair:** `fal-ai/nano-banana-pro` text-to-image for landmark/furniture; strict `isolated-asset-prompt.v2`; effective-request tracing; real regeneration job HUD.

**Docs:** `ISOLATED_ASSET_PROMPT_STANDARD.md`, `LAYER_MODEL_ROUTING_MATRIX.md`, `FULL_SCENE_LAYER_ROOT_CAUSE_ANALYSIS.md`

## Current blocker

| ID | Blocker | Unblock |
|----|---------|---------|
| **B1-Isolated** | Founder verification — Experience Lab must mount valid isolated landmark on mobile | Full compile after deploy |

## Documented fact

Shell healthy; Layer 1 landmark failed as full-scene output on `run-1783893880377-6ymov2`.

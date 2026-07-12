# Isolated Layer Generation Contract™

**Version:** `isolated-layer-contract.v1`  
**Quality gate:** `isolated-layer-quality.v1`  
**Prompt version:** `isolated-asset-prompt.v2` (`signature-landmark-isolated-prompt.v2`, `furniture-objects-isolated-prompt.v2`)  
**Model routing:** `layer-model-routing.v1`  
**Effective request:** `effective-generation-request.v1`

## Rule

A Scene Stack layer is **not** a scene. Each layer is one mountable contribution:

```
shell + landmark + furniture + materials + atmosphere + motion + reflections = final scene
```

No individual layer may replace the full equation.

## Generation modes

| Mode | Layers |
|------|--------|
| `full-scene-shell` | `environment-shell` only |
| `isolated-single-object` | `signature-landmark` |
| `isolated-object-group` | `furniture-objects` |
| `texture-map` | `surface-materials` |
| `atmosphere-overlay` | `atmospheric-systems` |
| `lighting-map` | `lighting-systems` |
| `motion-overlay` | `ambient-motion` |
| `reflection-overlay` | other overlays |

`signature-landmark` and `furniture-objects` **must not** use `full-scene-shell`.

## Reference policy

- **Shell:** may inform camera angle, scale, placement via blueprint prompt metadata only.
- **Isolated object layers:** `referencePolicy: perspective-metadata-only` — **no shell URL** passed to FAL img2img.
- **Blend overlays:** no shell reference; runtime CSS compositing.

Implementation: `reference-chain.ts`, `reference-enforcement.ts`, `isolated-layer-contract.ts`.

## Output format

- Isolated object layers: **PNG** (alpha required).
- Shell: webp acceptable.

## Quality thresholds (initial)

| Layer | Max frame coverage | Min transparent sides | Shell similarity threshold |
|-------|-------------------|----------------------|---------------------------|
| `signature-landmark` | 70% | 3 | 0.82 |
| `furniture-objects` | 85% | 2 | 0.84 |

Classifications: `isolated-valid`, `suspicious-scene-rerender`, `full-scene-rerender`, `opaque-background`, `baked-checkerboard`, `low-confidence-isolation`.

## Regeneration

- Max automatic attempts: **2** (`MAX_ISOLATION_REGENERATION_ATTEMPTS`).
- Shell preserved; only failed layer regenerated.
- Prompt strengthened on attempt 2.
- Immune System events: `LayerQualityFailureDetected` → `FullSceneRerenderDiagnosed` → `ShellPreservationConfirmed` → `IsolationPromptStrengthened` → `LayerRegenerationStarted` → `LayerRevalidated` → `LayerMounted` → `CompileResumed`.

## Provider

- Platform: FAL via governed `executeGovernedGeneration`.
- **Environment shell:** `fal-ai/nano-banana-pro/edit` — img2img with marble genesis anchor or shell URL.
- **Isolated object layers:** `fal-ai/nano-banana-pro` — **text-to-image only** (zero `image_urls`; no marble fallback) to prevent full-scene repaint.
- Pre-dispatch: `assertIsolatedPromptBeforeDispatch()` rejects prohibited full-scene language on positive prompt.
- Effective request records: `effective-generation-request.ts` — safe prompt hash, model, reference strategy, regeneration attempt.

## Modules

| Concern | Path |
|---------|------|
| Contract | `src/studio-os-core/scene-stack/isolated-layer-contract.ts` |
| Prompts (v2) | `src/studio-os-core/scene-stack/isolated-asset-prompt.ts` |
| Model routing | `src/studio-os-core/scene-stack/layer-model-routing.ts` |
| Placement metadata | `src/studio-os-core/scene-stack/placement-metadata.ts` |
| Effective request | `src/studio-os-core/scene-stack/effective-generation-request.ts` |
| Quality | `src/studio-os-core/scene-stack/isolated-layer-quality.ts` |
| Guard | `src/studio-os-core/scene-stack/quality-guard.ts` |
| Recovery | `src/studio-os-core/scene-stack/layer-quality-recovery.ts` |
| Loop | `src/hooks/useSceneStack.ts` |
| Server dispatch | `api/_lib/studioBuilderGeneration.ts` |

## Validation vs production

Experience Lab validation mode and Creative Studio production share the same contract and quality guard. Validation may use ephemeral registry but **cannot** weaken isolation requirements.

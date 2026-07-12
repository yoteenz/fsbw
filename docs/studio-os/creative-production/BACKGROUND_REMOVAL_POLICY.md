# Background Removal Policy™

Background removal is **cleanup**, not diagnosis or regeneration.

## Eligible classifications

- `NATIVE_ALPHA` — no removal; approve directly
- `SIMPLE_SOLID_BACKGROUND` — governed Ideogram path
- `SIMPLE_GRADIENT_BACKGROUND` — governed Ideogram path
- `SHADOW_PLANE_ONLY` — when object boundaries separable

## Never run cleanup on

- `FULL_SCENE_RERENDER`
- `ENVIRONMENT_FUSED`
- `FAKE_TRANSPARENCY`
- `UNKNOWN_LOW_CONFIDENCE`
- Wrong identity
- Malformed / cropped structure
- Full-scene likelihood ≥ threshold

## Flow

```
candidate → identity + structure pass → classify → eligible → POST /api/admin/scene-stack-asset-cleanup
→ postprocess validation → approval
```

Provider: `fal-ai/ideogram/remove-background` via `runProductAssetBackgroundRemoval` with white-studio fallback.

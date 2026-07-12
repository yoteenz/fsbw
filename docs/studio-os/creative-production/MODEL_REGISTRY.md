# Model Registry™

**Policy version:** `layer-model-routing.v2`  
**Status:** Production (Founder-approved 2026-07-12)

## Purpose

Configuration-driven model routing for Studio OS creative production. Replaces hardcoded isolated-asset defaults with a governed **Contractor Registry** — one `resolveModelRoute()` function for all surfaces.

## Canonical location

`src/studio-os-core/creative-production/model-registry/`

## Production routes

| Asset class | Primary route | Endpoint |
|-------------|---------------|----------|
| environment-shell | `nano-banana-pro-edit-shell` | `fal-ai/nano-banana-pro/edit` |
| signature-landmark | `nano-banana-2-isolated` | `fal-ai/nano-banana-2` |
| furniture-objects | `nano-banana-2-isolated-group` | `fal-ai/nano-banana-2` |
| reception-structure | `nano-banana-2-reception-structure` | `fal-ai/nano-banana-2` |
| brand-grounded isolated | `nano-banana-2-isolated-edit` | `fal-ai/nano-banana-2/edit` |
| background-removal | `birefnet-background-removal` | `fal-ai/birefnet/v2` |

## Founder decision

- **Isolated assets:** Nano Banana 2 (controlled visual comparison winner)
- **Environment shell:** Nano Banana Pro Edit (unchanged)

## Resolution truth

NB2 supports native `4K` resolution enum. The system records:

- `requestedResolution`
- `providerNativeResolution`
- `outputResolution`
- `upscaleApplied` / `upscaleModel`
- `truthState`: `native-4k` | `provider-nearest-supported` | `post-upscaled-4k`

## Rollback

Change `rolloutState` or `primaryRoute` in `routes.ts` — no call-site rewrites required.

## API

```ts
resolveModelRoute({
  organizationId,
  assetClass,
  brandGroundingRequired,
  surface,
})
```

Creative Studio and Experience Lab both resolve through `resolveSceneStackLayerModelRoute()` which delegates to the registry.

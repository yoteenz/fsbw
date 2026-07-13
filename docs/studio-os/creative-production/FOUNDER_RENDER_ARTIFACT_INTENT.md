# Founder Render Artifact Intent

**Intent ID:** `founder-full-room-preview`

## Classification

| Field | Value |
|-------|-------|
| Surface | Experience Lab (primary), Creative Director Studio (shared contract) |
| Validation | Full-scene output allowed; isolated-object validation **not** applied |
| Model route | `nano-banana-pro-founder-full-room` |
| Provider model | `fal-ai/nano-banana-pro/edit` |
| Generation mode | Image-to-image with brand material references |
| Output | Single photoreal full-room interior |

## Distinction from other intents

| Intent | Use |
|--------|-----|
| `founder-full-room-preview` | Founder approval — complete room visualization |
| `environment-shell` | Scene Stack shell layer |
| `isolated-object` | Signature landmark / single asset |
| `object-group` | Furniture objects layer |
| `campaign-composite` | CDS full campaign (planned) |
| `full-logo` | CDS logo concept (planned) |

## CDS shared contract

Creative Director Studio will use artifact-intent-specific Founder Renderers:

- Full campaign → campaign composite preview
- Full logo → logo render preview
- Packaging → package visualization

**Planned** — CDS artifact-specific renderers beyond shared contract are not complete in this sprint.

## Registry

```typescript
validatorExistsForIntent('founder-full-room-preview') // true
requiresIsolatedObjectValidation('founder-full-room-preview') // false
allowsFullSceneOutput('founder-full-room-preview') // true
```

Model registry route: `MODEL_REGISTRY_ROUTES` entry `nano-banana-pro-founder-full-room`.

## Persistence

`studio_founder_render_jobs.artifact_intent` = `founder-full-room-preview`

Migration: `supabase/migrations/20260713150000_studio_founder_render_jobs.sql`

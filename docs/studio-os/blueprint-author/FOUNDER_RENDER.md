# Founder Render™

**Artifact intent:** `founder-full-room-preview`  
**Prompt version:** `founder-full-room-preview-prompt.v1`  
**Model route:** `nano-banana-pro-founder-full-room` → `fal-ai/nano-banana-pro/edit`

## Purpose

Founder Render shows **one photoreal full-room concept image** generated from the approved Construction Plan. It is the primary Founder Review visual — not a procedural diagram, CSS mockup, or engineering blueprint.

## Two preview products

| Product | Audience | Format | Default |
|---------|----------|--------|---------|
| **Founder Render** | Founder / Creative Director | Photoreal full-room image | **Yes — hero** |
| **Engineering Blueprint** | Workers, diagnostics | Procedural sockets/zones | Collapsed drawer |

Do not present procedural rectangles, SVG placeholders, or glassmorphism shapes as the Founder Render.

## Job contract

Durable table: `studio_founder_render_jobs`

Required fields: `organizationId`, `projectId`, `roomId`, `blueprintId`, `blueprintRevision`, `constructionPlanId`, `artifactIntent`, `status`, `modelRoute`, `providerModel`, `promptVersion`, `previewArtifactUrl`, `failureReason`, `approvalStatus`, `approvalRecord`.

Statuses: `no_preview` · `queued` · `generating` · `ready` · `failed` · `stale` · `approved`

## API

- `POST /api/admin/founder-render-generate` — dispatch from Construction Plan
- `GET /api/admin/founder-render-status?jobId=` — poll + persist result
- `POST /api/admin/founder-render-approve` — approval gate before manufacturing

## Prompt builder

`src/studio-os-core/founder-render/prompt-builder.ts` (server-only)

Consumes live Construction Plan: room purpose, architecture, hero assets, furniture, brand materials, lighting, camera, negative rules, founder revision notes.

## Brand assets

Preflight (`runFounderRenderPreflight`) requires organization brand vault. Missing required marble → `BRAND_ASSET_REQUIRED_MISSING` — no generic fallback.

## Approval gate

`canApproveFounderRender` requires:

- status `ready`
- `previewArtifactUrl` present
- image loaded in UI
- blueprint revision matches current plan
- no stale preview

Manufacturing (`runConstructionModeCompile`) only runs after durable approval record is persisted.

## Diagnostics

`FounderRenderDiagnosticsPanel` — artifact intent, model route, prompt version, blueprint revision, brand refs, provider job ID, output URL, persistence, approval status. Copy diagnostics / effective prompt preview.

## Code paths

- Core: `src/studio-os-core/founder-render/`
- UI hero: `FounderReviewHero.tsx` (photoreal image only)
- Workflow: `useBlueprintAuthorWorkflow.ts`
- Engineering blueprint: `BlueprintDrawer` / `BlueprintPreview` (procedural — separate)

## Documented Fact

Previous production Founder Review hero used `buildFounderRenderModel()` procedural CSS shapes (`generationOccurred: false`).

## Founder Decision

Founder Review must show an actual AI-generated photoreal full-room image before manufacturing begins.

# Experience Lab — Founder Preview Workflow

## Canonical flow

```
Founder Request
  → Blueprint Author
  → Construction Plan
  → Founder Render Job
  → Full-Room Photoreal Preview
  → Founder Review
  → Approve or Revise
  → Manufacturing Queue
  → Asset Deconstruction / Manufacturing
  → Validation
  → Scene Assembly
  → Living World
```

## Experience Lab integration

Experience Lab uses Blueprint Author workflow (`useBlueprintAuthorWorkflow`). On Construction Plan open:

1. **Founder Review** step shows `FounderReviewExperience`
2. Hero = `FounderReviewHero` with photoreal image (or explicit state panel — never procedural shapes)
3. **Open Blueprint** drawer = engineering procedural preview (collapsed by default)
4. **Generate Founder Preview** dispatches `founder-full-room-preview` job
5. **Approve & Build** gated until real image ready + revision match

## Preview states

| State | UI |
|-------|-----|
| `NO_PREVIEW` | "Generate Founder Preview" button |
| `QUEUED` / `GENERATING` | Progress panel — no fake room |
| `READY` | Full photoreal image, zoom, fullscreen |
| `FAILED` | Exact failure reason + retry |
| `STALE` | Warning + regenerate required |
| `APPROVED` | Manufacturing may begin |

## Revision workflow

Founder revision note → regenerate Founder Render → review again. Manufacturing does not start from unapproved preview.

## Mobile

Wide 16:9 render in responsive framed viewer. Pinch/zoom and fullscreen supported. Model generates desktop aspect ratio; mobile displays scaled render.

## Non-goals

- Do not jump from blueprint rectangles directly to asset manufacturing
- Do not label engineering diagram as Founder Render
- Do not fall back to procedural shapes on generation failure

## Status

**In Progress** — code shipped; founder mobile verification pending (B1-FounderRender).

## Related

- `docs/studio-os/blueprint-author/FOUNDER_RENDER.md`
- `docs/studio-os/creative-production/FOUNDER_RENDER_ARTIFACT_INTENT.md`

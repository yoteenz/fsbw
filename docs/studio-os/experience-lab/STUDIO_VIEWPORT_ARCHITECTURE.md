# StudioViewport™ Architecture

**Location:** `src/features/studio-world/experience-lab-v2/StudioViewport.tsx`

## Purpose

The StudioViewport is the central visual workspace for Experience Lab V2. It does not permanently display one artifact — it switches modes.

## Supported modes

- `BLUEPRINT` — holographic specification layer (not baked into environment)
- `FOUNDER_RENDER` — photoreal full-room render artifact
- `CONSTRUCTION_PLAN` — assembly/manufacturing plan
- `MATERIALS` / `LIGHTING` / `CAMERA` — profile views
- `SPLIT_VIEW` — blueprint in left pane, Founder Render in right pane (no overlap)
- `EMPTY_STATE` / `LOADING` / `ERROR`

## Capabilities

- Zoom, fit, fullscreen
- Aspect-ratio-aware content regions
- Stale revision warning in header
- Artifact metadata in pane summaries
- URL query persistence: `?view=blueprint|founder-render|split|…`

## Layering rule

Viewport content lives in the React layer **above** `ExperienceLabEnvironmentLayer`. The environment never dictates layout.

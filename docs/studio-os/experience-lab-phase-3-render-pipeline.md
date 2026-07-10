# Experience Lab Phase 3 — Creative Studio Rendering Pipeline

**Status:** Implemented  
**Date:** 2026-07-10

## Objective

Experience Lab Mode 2 must invoke the **exact same rendering pipeline** as Creative Direction Studio and display the **final compiled environment** — never wireframes, placeholders, or schematic layouts.

## Pipeline (full compile — never stop halfway)

```
Creative DNA
    ↓
Scene Graph™
    ↓
Asset Stack / Layer Stack
    ↓
Architecture → Lighting → Materials → Atmosphere → Motion → Reflections
    ↓
World Compiler™ — Render Final Scene™
    ↓
SceneStackViewport (layer compositor — production output)
```

Experience Lab binds each company preview to an existing **Scene Stack station** used by CDS / Command Center / Warehouse / World Atlas.

## Company → Scene Stack bindings

| Company | Preview A | Preview B | Preview C |
|---------|-----------|-----------|-----------|
| **Studio OS** | Command Center · Executive Atrium™ | Command Center · Threshold™ | World Atlas · Holographic Table™ |
| **Frontal Slayer** | CDS · Arrival Zone™ | CDS · Living Mood Wall™ | CDS · Story Table™ |
| **NDX** | CDS · Creative Pipeline™ | CDS · Reference Library™ | Warehouse · Animation Archive™ |

Bindings: `src/studio-os-core/creative-studio-preview/render-bindings.ts`

## Architecture

| Layer | Path | Role |
|-------|------|------|
| **Render bindings** | `render-bindings.ts` | Company × concept → department + station |
| **Render hook** | `useCreativeStudioRenderPreview.ts` | `useSceneStack` + auto `ensureStation` + `compileStation` |
| **Viewport** | `CreativeStudioRenderPreview.tsx` | `SceneStackViewport` + World Compiler stage footer |
| **Preview compiler** | `creative-studio-preview/` | Read-only specs + scorecard (unchanged) |
| **Mode 2 UI** | `CreativeIntelligencePanel.tsx` | Blind test + render preview hero |

## Removed (Phase 3)

- CSS/SVG schematic environments (`CreativePreviewEnvironment.tsx`)
- Wireframe boxes, labeled floor plans, placeholder rectangles
- In-scene planning artifacts

## Success test

Preview must look like a **completed Creative Studio render** — layered FAL plates composed through World Compiler™, indistinguishable from CDS / Command Center output. If it could be mistaken for an unfinished wireframe, the sprint fails.

## Guarantees

- Preview compiler specifications remain `CREATIVE_PREVIEW_READ_ONLY`
- Render path uses shared Scene Stack store + builder registry hydration (same assets as CDS)
- No separate placeholder layout generator

Route: `/admin/studio/experience-lab` → Mode 2

See also: `experience-lab-phase-2-creative-intelligence.md` (compiler + blind validation)

## Hotfix — LOAD SHELL rejection (2026-07-10)

**Root cause:** World Compiler `load-shell` requires `environment-shell.publicUrl`. Experience Lab (a) skipped `ensureStation` when any non-shell layer existed, (b) ran compile without a shell, (c) treated `draft_ready` shells as unlocked — blocking downstream layer generation and package mount in validation mode.

**Fix:** `validation-render.ts` ephemeral validation mode; `resolveShellLockState` accepts `draft_ready` shells in validation; `buildComponentPackagesForStation` includes draft layers; Experience Lab orchestration requires shell before compile; compilation report separates **Render Readiness** (stages) from **Input Integrity** (packages).

Verify: `node scripts/verify-experience-lab-shell-resolution.mjs`


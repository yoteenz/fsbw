# Experience Lab Phase 2 — Environmental Intelligence Validation

**Status:** Implemented (preview infrastructure)  
**Date:** 2026-07-10

## Objective

Experience Lab validates **environmental intelligence** — not layouts, wireframes, or theme switching. When a company is selected, the Creative Studio Preview Compiler generates a **believable place** that communicates the company's identity without logos, labels, or brand color swatches.

A founder (or blind tester) should recognize the industry within 5 seconds from architecture, materials, lighting, circulation, and spatial hierarchy alone.

## Validation model

```
Studio OS
    ↓
Creative Studio Preview Compiler
    ↓
Cinematic environmental preview (a PLACE — not a UI)
```

## Architecture

| Layer | Path | Role |
|-------|------|------|
| **Creative Studio Preview Compiler™** | `src/studio-os-core/creative-studio-preview/` | Deterministic READ-ONLY preview specifications |
| **Environment scene profiles** | `environment-scene-profiles.ts` | Per-company × Preview A/B/C architectural keywords, atmosphere, circulation |
| **Hook** | `src/hooks/useCreativeStudioPreview.ts` | Company/concept selection, blind mode, recompile |
| **Mode shell** | `ExperienceLabModeShell.tsx` | Mode 1 Runtime · Mode 2 Environmental Intelligence |
| **Cinematic preview** | `CreativeStudioRenderPreview.tsx` | World Compiler™ + `SceneStackViewport` — final CDS render (Phase 3) |

## Company targets

| Company | Must feel like | Architectural keywords |
|---------|----------------|-------------------------|
| **Studio OS** | Executive HQ · knowledge institution · OS company | executive atrium, constitutional archive, knowledge observatory, executive bridge, crystal, white marble, chrome |
| **Frontal Slayer** | Luxury beauty flagship · high-fashion concierge | concierge arrival, mirror diagnostics, editorial salon, couture retail, floating acrylic, white marble (not mansion pastiche) |
| **NDX** | Modern media HQ · editorial command center | live newsroom, signal wall, broadcast command, producer stations, dynamic displays |

## Preview A / B / C

Each company receives three cinematic variants:

- **Preview A** — Most likely production environment (highest confidence)
- **Preview B** — Alternative architectural direction
- **Preview C** — Experimental direction

Each variant renders a distinct scene (atrium vs bridge vs observatory for Studio OS; concierge vs gallery vs diagnostic for Frontal Slayer; newsroom vs command deck vs signal lab for NDX).

## Blind pass / fail test

Mode 2 includes **Blind industry test**:

1. Hide company names, labels, and branding in the preview area
2. Show preview to someone unfamiliar with the project
3. Record PASS if industry identified within 5 seconds; FAIL otherwise

## Compiler inputs

- Company Registry (Studio OS, Frontal Slayer, NDX/ndxbook)
- Strategic Brand DNA (Experience Engine seeds)
- Operating model & narrative intelligence (company profiles)
- Design canon & spatial architecture rules
- Department topology
- Experience Engine constraints (materials, motion, rules)

## Compiler outputs (per company)

- Preview Specification (philosophy, architecture, materials, lighting, spatial hierarchy, circulation, furniture, environmental storytelling, department relationships, emotional tone)
- Three previews (A production, B alternative, C experimental)
- Creative Intelligence Scorecard (10 categories + evidence)
- Validation evidence (inputs, DNA, rules, constraints, reasoning chain)

## Guarantees

- `CREATIVE_PREVIEW_READ_ONLY = true`
- No Asset Registry writes
- No publishing
- No Foundry/FAL invocation
- No wireframe boxes, Figma-style labels, or dashboard mockups in preview scenes

## Experience Lab modes

1. **Runtime Validation** — StudioBootstrap, RuntimeDiagnostics, Experience Lab runtime state
2. **Environmental Intelligence Validation** — Cinematic previews, blind test, scorecard, side-by-side compare

Route: `/admin/studio/experience-lab`

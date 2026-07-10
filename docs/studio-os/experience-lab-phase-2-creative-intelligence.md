# Experience Lab Phase 2 — Creative Intelligence Validation

**Status:** Implemented (preview infrastructure)  
**Date:** 2026-07-10

## Objective

Transition Experience Lab from runtime QA harness to the first real **read-only customer** of Creative Direction Studio intelligence — without building final CDS production UI or generating assets.

## Architecture

| Layer | Path | Role |
|-------|------|------|
| **Creative Studio Preview Compiler™** | `src/studio-os-core/creative-studio-preview/` | Deterministic READ-ONLY preview specifications |
| **Hook** | `src/hooks/useCreativeStudioPreview.ts` | Company/concept selection, recompile |
| **Mode shell** | `ExperienceLabModeShell.tsx` | Mode 1 Runtime · Mode 2 Creative Intelligence |
| **Visual preview** | `CreativePreviewEnvironment.tsx` | Structural archetypes (no logos) |

## Compiler inputs

- Company Registry (Studio OS, Frontal Slayer, NDX/ndxbook)
- Strategic Brand DNA (Experience Engine seeds)
- Operating model & narrative intelligence (company profiles)
- Design canon & spatial architecture rules
- Department topology
- Experience Engine constraints (materials, motion, rules)

## Compiler outputs (per company)

- Preview Specification (philosophy, architecture, materials, lighting, spatial org, interaction, motion, mood, workflow, signatures)
- Three concepts (A recommended, B alternative, C experimental)
- Creative Intelligence Scorecard (10 categories + evidence)
- Validation evidence (inputs, DNA, rules, constraints, reasoning chain)

## Guarantees

- `CREATIVE_PREVIEW_READ_ONLY = true`
- No Asset Registry writes
- No publishing
- No Foundry/FAL invocation

## Experience Lab modes

1. **Runtime Validation** — StudioBootstrap, RuntimeDiagnostics, Experience Lab runtime state
2. **Creative Intelligence Validation** — Preview compiler, scorecard, multi-concept, side-by-side compare

Route: `/admin/studio/experience-lab`

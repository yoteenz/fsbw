# World Fabrication — Execution Handoff V1

**Module:** `src/studio-os-core/world-fabrication-engine/handoffs.ts`

## Codex + Blender handoff

`CodexBlenderHandoffPackage` includes:

- Approved references + spatial spec ref  
- Optional massing GLB  
- Module hierarchy + material defs  
- Export + quality + performance constraints  
- Validation steps + expected return package  
- **Execution environment** (must not be `UNAVAILABLE` for runnable jobs)

Codex is the preferred **programmable reconstruction** agent; Blender is the primary modeling environment.

## Unreal assembly handoff

`UnrealAssemblyHandoffPackage` — optional for simple assets; documents zone assembly, lighting, navigation, collision, cinematic cameras.

## Web runtime export

`WebRuntimeExportManifest` — GLB refs, optional budgets, interaction anchors, reduced-motion/static fallbacks.

## Execution safety

Permission ≠ connectivity. Jobs must record capability before marking runnable. Shadow PC / local DCC / paid GPU require explicit authorization — not assumed in this sprint.

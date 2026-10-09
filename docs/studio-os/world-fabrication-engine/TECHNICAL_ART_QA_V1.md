# Technical Art QA V1

Lane-specific QA entry point: `runLaneTechnicalQa()` in `technical-art/technical-qa.ts`.

## Executable in repo (schema / manifest)

- Production profile resolution
- Package completeness vs profile
- Texture color-space metadata rules
- Character rig requirements (contract level)
- Quality gate evaluation vs deliverable slots
- Codex handoff extension validation

## Not executable without tool integration

- Blender geometry topology inspection
- Unreal navmesh / import verification
- Actual bake output pixel validation

Findings include `executableInRepo: boolean` to distinguish contract checks from future DCC hooks.

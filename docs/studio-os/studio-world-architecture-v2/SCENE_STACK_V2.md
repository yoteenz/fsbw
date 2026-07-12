# Scene Stack v2

**Version:** `scene-stack.v2`

## Principle

Scene Stack **assembles**. It does not generate.

## Assembly order

1. BlueprintShell
2. Room blueprint metadata
3. Architecture
4. Hero assets
5. Furniture
6. Decor
7. Materials
8. Lighting
9. Effects
10. Interaction

## Rules

- Only **approved** layers mount
- `generationOccurred: false` at assembly time
- Unapproved candidates cannot mount (verified pipeline required)

## Module

`src/studio-os-core/studio-world-architecture-v2/scene-stack-assembly-v2.ts`

## v1 compatibility

Existing `compileWorldStation` remains for Experience Lab. v2 orchestrator runs in parallel via `runWorldBuildV2`.

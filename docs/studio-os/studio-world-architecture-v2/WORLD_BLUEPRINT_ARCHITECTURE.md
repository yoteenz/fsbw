# World Blueprint Architecture™

**Version:** `blueprint-shell.v1` · `studio-world-architecture.v2`

## Principle

Generate **only architecture**. Think like an architect — not an interior decorator.

## BlueprintShell™ contains

- Walls, ceiling, floor
- Windows, glass, stairs, elevator openings
- Circulation, lighting cavities, structural openings, architectural framing

## BlueprintShell™ excludes

- Furniture, landmarks, concierge desks, decorations, people

## Immutability

Once approved, BlueprintShell becomes **immutable**. It rarely changes.

If validation fails → repair **BlueprintShell only**. Never continue to hero assets.

## Module

`src/studio-os-core/studio-world-architecture-v2/blueprint-shell.ts`

## Model routing

Architecture → `environment-shell` → `fal-ai/nano-banana-pro/edit`

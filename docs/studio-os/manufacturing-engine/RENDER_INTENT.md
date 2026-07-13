# Render Intent™

Generation receives **manufacturing instructions** — not prompts.

## Schema

- Purpose, generation mode, output type
- Isolation, transparency, camera, perspective, lens
- Lighting profile, material library, reference assets
- Expected scale, geometry, silhouette, dimensions
- Negative rules, quality/validation/repair thresholds
- `forbiddenArchitecture`, `forbiddenFurniture`, `forbiddenPeople`

## Example: ReceptionDesk.v7

```
Purpose: Hero Reception Desk
Output: Transparent PNG
Background: Transparent
Architecture: Forbidden
Perspective: Orthographic
Scale: 1:1
Materials: FounderMaterialLibrary.v12
Expected: Single isolated desk — nothing else
```

## Rule

`assertNoPromptInRenderIntent()` — prompt fields are forbidden.

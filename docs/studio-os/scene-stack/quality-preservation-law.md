# Scene Stack™ Quality Preservation Law

**Scene Assembly™ hardened architecture — non-destructive composition**

---

## Immutable Layer Law

Scene Assembly™ may **never** regenerate, repaint, reinterpret, or re-encode approved prior layers.

Approved layers are **immutable source assets**.

Runtime may only:

- position · mask · align · composite · blend · depth-sort · color-match · shadow-match · optimize display

Runtime may **not** send previous approved layers back into an image model.

---

## Master Scene Blueprint™

Every layer generation references a shared **Master Scene Blueprint™** (`resolveMasterSceneBlueprint`), not flattened prior outputs.

Blueprint includes: scene id · workspace id · camera · aspect ratio · perspective · floor plan · zone map · placement notes · reserved regions · depth hints · lighting direction · material language · visual DNA · negative rules · shell reference · layer dependency rules.

Module: `src/studio-os-core/scene-stack/master-scene-blueprint.ts`

---

## Reference Rules (FAL)

**Allowed**

- environment shell reference only (single URL)
- placement mask / rough guide (future)
- blueprint metadata in prompt

**Forbidden**

- full stack composite
- previous layer composite
- approved prior generative layers
- degraded viewport export

Enforcement: `reference-enforcement.ts` (client) · `api/_lib/sceneStackReferenceEnforcement.ts` (server)

---

## Scene Graph™

Technical architecture behind founder-facing **Scene Stack™**.

Each layer = graph node referencing blueprint, asset registry id, source image, z-index, blend mode, opacity, dependency rules, quality status, version.

**Nothing flattens until final export.**

Module: `src/studio-os-core/scene-stack/scene-graph.ts`

---

## Quality Guard™

Before saving a generated layer: `validateSceneLayerQuality()` checks resolution, aspect, frame coverage, shell similarity, edge sharpness, washout.

Failures → `REGENERATE REQUIRED` with reasons.

Module: `src/studio-os-core/scene-stack/quality-guard.ts`

---

## Clean Regeneration Mode™

For pre-fix degraded stations: `cleanRegenerateStation()` in `useSceneStack`.

1. Keep shell if sharp
2. Discard derived layers
3. Regenerate from blueprint + shell only

Module: `src/studio-os-core/scene-stack/clean-regeneration.ts`

---

## Final Export Rule™

Flattening allowed **only** in `buildSceneStackExportBundle()` / `flattenSceneGraphToCanvas()`.

Canonical = layered scene graph + individual source layers.

Flattened preview = delivery artifact only.

Module: `src/studio-os-core/scene-stack/scene-export.ts`

---

## Regression Guard

- `SCENE_ASSEMBLY_LAW_VERSION` on every saved layer record
- `SCENE_STACK_PROMPT_VERSION` = `scene-stack.v2`
- Server rejects `referenceImageUrls.length > 1` for `scene-stack-*` production groups

---

## See Also

- [scene-stack.md](./scene-stack.md)
- [layer-architecture.md](./layer-architecture.md)
- [golden-build-pipeline.md](./golden-build-pipeline.md)

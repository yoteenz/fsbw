# Blueprint Author™

**Version:** `blueprint-author.v1`  
**Status:** Foundation sprint shipped — deterministic construction plans before AI generation

## Philosophy

Separate **DESIGN** from **CONSTRUCTION**.

- **Blueprint Author** designs — room topology, sockets, materials, lighting, cameras
- **AI Workers** construct — bounded jobs only
- **World Compiler** assembles from Blueprint
- **Immune System** repairs toward Blueprint

Blueprints are permanent. Generations are temporary.

## Compiler order

```
Founder Request → Blueprint Author → Construction Plan → Job Queue
→ AI Workers → Quality Guard → Immune System → Scene Stack → Living Room
```

## Code

`src/studio-os-core/blueprint-author/`

| Module | Responsibility |
|--------|----------------|
| `blueprint-author.ts` | Translate founder intent to Construction Plan |
| `construction-plan-schema.ts` | Deterministic plan schema |
| `job-queue.ts` | Decompose plan into independent jobs |
| `ai-worker-contract.ts` | Bounded worker input/output |
| `quality-verification.ts` | Validate output against Blueprint |
| `blueprint-diff-engine.ts` | Expected vs actual drift |
| `immune-blueprint-repair.ts` | Self-healing toward Blueprint |
| `compile-orchestrator.ts` | Full pipeline (`runBlueprintCompile`) |

## Integration

- Exported from `src/studio-os-core/scene-stack/index.ts`
- Feeds `runWorldBuildV2` with blueprint-driven assets
- Reuses v2 material library, asset sockets, model routing

## Docs

- [CONSTRUCTION_PLAN_SCHEMA.md](./CONSTRUCTION_PLAN_SCHEMA.md)
- [JOB_QUEUE_ARCHITECTURE.md](./JOB_QUEUE_ARCHITECTURE.md)
- [ASSET_SOCKET_SYSTEM.md](./ASSET_SOCKET_SYSTEM.md)
- [STYLE_LIBRARY.md](./STYLE_LIBRARY.md)
- [MATERIAL_REFERENCE_SYSTEM.md](./MATERIAL_REFERENCE_SYSTEM.md)
- [CAMERA_ANCHOR_SYSTEM.md](./CAMERA_ANCHOR_SYSTEM.md)
- [LIGHTING_PROFILE_SYSTEM.md](./LIGHTING_PROFILE_SYSTEM.md)
- [BLUEPRINT_VERSIONING.md](./BLUEPRINT_VERSIONING.md)
- [BLUEPRINT_DIFF_ENGINE.md](./BLUEPRINT_DIFF_ENGINE.md)
- [FOUNDER_RENDER.md](./FOUNDER_RENDER.md)

## Spatial Architecture Review

**SKIPPED** — foundation/infrastructure layer with no new founder-facing nav surfaces.

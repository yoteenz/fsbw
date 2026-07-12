# Studio World Architecture v2 — Index

**Version:** `studio-world-architecture.v2`  
**Status:** Foundation sprint shipped — canonical construction model

## Canon hierarchy

```
Studio World → Building → Floor → Room Blueprint → Architecture
→ Hero Assets → Furniture → Decor → Materials → Lighting
→ Effects → Interaction → Living World
```

## World Compiler order

See `world-compiler-order-v2.ts` — 12 phases from BlueprintShell to Activate Room.

## Code

`src/studio-os-core/studio-world-architecture-v2/`

## Docs

- [WORLD_BLUEPRINT_ARCHITECTURE.md](./WORLD_BLUEPRINT_ARCHITECTURE.md)
- [ROOM_BLUEPRINT_SYSTEM.md](./ROOM_BLUEPRINT_SYSTEM.md)
- [SCENE_STACK_V2.md](./SCENE_STACK_V2.md)
- [IMMUNE_SYSTEM_ROOM_RECOVERY.md](./IMMUNE_SYSTEM_ROOM_RECOVERY.md)
- [ASSET_HIERARCHY.md](./ASSET_HIERARCHY.md)
- [MODEL_ROUTING_V2.md](./MODEL_ROUTING_V2.md)
- [MATERIAL_LIBRARY_SPEC.md](./MATERIAL_LIBRARY_SPEC.md)
- [ROOM_HEALTH_MODEL.md](./ROOM_HEALTH_MODEL.md)

## Spatial Architecture Review

Completed as foundation artifact — world-first assembly replaces asset-first generation as canonical order. v1 `compileWorldStation` preserved for Experience Lab continuity; v2 orchestrator (`runWorldBuildV2`) is the forward path.

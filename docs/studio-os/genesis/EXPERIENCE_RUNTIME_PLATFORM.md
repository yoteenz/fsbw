# Experience Runtime™ — Platform Runtime

**Architecture:** `genesis/articles/EXPERIENCE_RUNTIME.md`  
**Runtime:** `src/studio-os-core/genesis/experience-runtime/`  
**UI:** `/admin/studio/experience-runtime`  
**Hooks:** `useExperienceRuntimeState` · `useExperienceRuntimeAssembly`  
**Genesis key:** `experienceRuntimeDna`

Depends on **Experience Engine™** (`experienceEngineDna`) for Brand/Department/Scene/Component/Motion/Interaction DNA registries.

---

## Routes

| Path | Experience |
|------|------------|
| `/admin/studio/experience-runtime` | Runtime Arrival · live brand switcher |
| `/admin/studio/experience-runtime/runtime` | Runtime Overview |
| `/admin/studio/experience-runtime/runtime-engine` | Runtime Engine · assemblers |
| `/admin/studio/experience-runtime/runtime-cache` | Runtime Cache |
| `/admin/studio/experience-runtime/runtime-registry` | Platform DNA Registry |
| `/admin/studio/experience-runtime/runtime-state` | State DNA |
| `/admin/studio/experience-runtime/runtime-preview` | Runtime Preview |
| `/admin/studio/experience-runtime/runtime-playground` | Runtime Playground + Inspector |

---

## Assemblers

| Assembler | Purpose |
|-----------|---------|
| **DNAResolver™** | Loads and merges Platform → Brand → Department → Scene → Component → Motion → Interaction → State DNA |
| **ThemeResolver™** | Compiles brand atmosphere into CSS variables and token bindings |
| **SceneAssembler™** | Builds stable runtime scene graph with fixed node IDs |
| **ComponentAssembler™** | Binds component anatomy variants without forking |
| **MotionAssembler™** | Binds motion profile + reduced-motion branch |
| **InteractionAssembler™** | Binds interaction states from Interaction DNA |

---

## Public API

```typescript
import {
  assembleExperienceRuntime,
  switchRuntimeBrandLive,
  applyRuntimeGraphToElement,
} from '@/studio-os-core/genesis';
import { useExperienceRuntimeAssembly } from '@/hooks/useExperienceRuntimeAssembly';

const { ref, graph, switchBrandLive } = useExperienceRuntimeAssembly({ brandId: 'frontal-slayer' });
switchBrandLive('ndx'); // live patch — no reload
```

---

## Live brand switching

`switchRuntimeBrandLive(brandId)` patches the Runtime Experience Graph™:

- Platform template and node IDs remain mounted
- State DNA slots preserved
- CSS variables and component variants rebind
- No route rebuild · no layout regeneration

---

## Runtime Inspector™

Displays inherited Platform/Brand/Department/Scene DNA, components, resolved tokens, active overrides, and performance metrics.

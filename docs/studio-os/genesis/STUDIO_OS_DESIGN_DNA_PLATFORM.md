# Studio OS Design DNA™ — Platform Runtime

**Architecture:** `genesis/articles/STUDIO_OS_DESIGN_DNA.md`  
**Runtime:** `src/studio-os-core/genesis/studio-os-design-dna/`  
**UI:** `/admin/studio/design-dna`  
**Hooks:** `useStudioOsDesignDnaState.ts` · `useDesignDnaSceneInheritance.ts`  
**Genesis key:** `studioOsDesignDna` in `genesis_v1` localStorage

---

## Routes

| Path | Experience |
|------|------------|
| `/admin/studio/design-dna` | Design DNA™ Arrival · constitutional overview |
| `/admin/studio/design-dna/design-tokens` | Design Token Registry™ |
| `/admin/studio/design-dna/department-themes` | Department Theme Registry™ |
| `/admin/studio/design-dna/scene-templates` | Scene Template Engine™ |
| `/admin/studio/design-dna/component-library` | Component Library™ |
| `/admin/studio/design-dna/color-system` | Color System™ |
| `/admin/studio/design-dna/navigation-system` | Cognitive Navigation Engine™ |
| `/admin/studio/design-dna/motion-system` | Motion & Animation Engine™ |
| `/admin/studio/design-dna/icon-system` | Icon System™ |
| `/admin/studio/design-dna/lighting-system` | Lighting & Glass Material Engine™ |

---

## Runtime engines

| Engine | Module | Purpose |
|--------|--------|---------|
| Design Token Registry™ | `bootstrap/seed-data.ts` | Constitutional spacing, grid, typography, glass, motion tokens |
| Department Theme Registry™ | `bootstrap/seed-data.ts` | 26 permanent department color/atmosphere records |
| Cognitive Navigation Engine™ | `engines/registry-engines.ts` | Department → Division → Room Accent hierarchy |
| Scene Template Engine™ | `bootstrap/seed-data.ts` | 10-layer Headquarters master template |
| Lighting Engine™ | `engines/scene-engines.ts` | Ambient presets bound to departments |
| Glass Material Engine™ | `engines/scene-engines.ts` | Executive glass surfaces with legibility rules |
| Motion Engine™ | `engines/scene-engines.ts` | Department-derived motion presets |
| Animation Engine™ | `bootstrap/seed-data.ts` | Scene animation hooks per layer |
| Typography Engine™ | `bootstrap/seed-data.ts` | Futura + Grace constitutional scale |
| Component Library™ | `bootstrap/seed-data.ts` | 12 reusable inherited components |

---

## Scene inheritance

Every new Headquarters scene must inherit Design DNA — never manual styles:

```typescript
import { resolveDesignDnaSceneProfile, applyDesignDnaToElement } from '@/studio-os-core/genesis';
// or in React:
import { useDesignDnaSceneInheritance } from '@/hooks/useDesignDnaSceneInheritance';

const { ref, profile } = useDesignDnaSceneInheritance('knowledge');
// Attach ref to scene root — CSS variables inject automatically
```

---

## Integration

- Depends on **Architect's Prompt Library™** bootstrap chain
- `ensureStudioOsDesignDnaSubsystem()` in `ensureGenesisStore()` chain
- Genesis framework module: `'studio-os-design-dna'`
- Complements **Design Token Engine™** (`/admin/studio/design-token-engine`) — DNA is constitutional; DTE is operational catalog
- Distinct from customer **Design DNA Canon** (`/admin/studio/design-dna-canon`)
- Marble/glass immersive UI — constitutional registry, not dashboards

---

## Validation rule

No department should manually define styles. Everything generates from Design DNA registries via `resolveDesignDnaSceneProfile()`.

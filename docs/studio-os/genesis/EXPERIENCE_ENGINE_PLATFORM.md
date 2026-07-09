# Experience Engine™ — Platform Runtime

**Architecture:** `genesis/articles/EXPERIENCE_ENGINE.md`  
**Runtime:** `src/studio-os-core/genesis/experience-engine/`  
**UI:** `/admin/studio/experience-engine`  
**Hooks:** `useExperienceEngineDnaState` · `useExperienceInheritance`  
**Genesis key:** `experienceEngineDna` in `genesis_v1` localStorage

---

## Routes

| Path | Experience |
|------|------------|
| `/admin/studio/experience-engine` | Engine Arrival · brand switcher · playground preview |
| `/admin/studio/experience-engine/brand-dna` | Brand Registry™ |
| `/admin/studio/experience-engine/department-dna` | Department Registry™ |
| `/admin/studio/experience-engine/scene-dna` | Scene Registry™ |
| `/admin/studio/experience-engine/component-dna` | Component Registry™ |
| `/admin/studio/experience-engine/motion-dna` | Motion Registry™ |
| `/admin/studio/experience-engine/interaction-dna` | Interaction Registry™ |
| `/admin/studio/experience-engine/theme-playground` | Experience Playground™ |

---

## Registries

| Registry | Purpose |
|----------|---------|
| BrandRegistry™ | Identity, color, typography, glass, lighting, motion, materials, voice, Orb, navigation, rules |
| DepartmentRegistry™ | Department color, lighting, mood, particles, animation personality per brand |
| SceneRegistry™ | Shared HQ master demonstration scene — identical layout for all brands |
| ComponentRegistry™ | Brand component variants (executive header, cards, nav rail, Orb mount, ribbon) |
| MotionRegistry™ | Entrance, transition, hover, focus, loading, reduced-motion |
| InteractionRegistry™ | Hover, focus, selected, success, warning, approval, disabled |

---

## Scene inheritance

```typescript
import { resolveExperienceProfile, applyExperienceProfileToElement } from '@/studio-os-core/genesis';
import { useExperienceInheritance } from '@/hooks/useExperienceInheritance';

const { ref, profile } = useExperienceInheritance({ brandId: 'frontal-slayer' });
```

No hardcoded brand styles — all values compile from DNA registries.

---

## Demonstration brands

| Brand | Identity |
|-------|----------|
| Studio OS™ | Marble executive institution — first Brand DNA (Design DNA promoted, not redesigned) |
| Frontal Slayer™ | Luxury beauty mansion / salon concierge |
| NDX™ | Media command / broadcast editorial |

Same scene template (`hq-master-demonstration-v1`). Layout identical; DNA inheritance changes atmosphere.

---

## Integration

- Depends on **Studio OS Design DNA™** bootstrap chain
- `ensureExperienceEngineDnaSubsystem()` in `ensureGenesisStore()`
- Genesis framework module: `experience-engine-dna`
- Coexists with M141 adaptive atmosphere runtime (`src/studio-os-core/experience-engine/`)

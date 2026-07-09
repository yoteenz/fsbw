# Experience Lab™ — Platform Runtime

**Runtime:** `src/studio-os-core/genesis/experience-lab/`  
**UI:** `/admin/studio/experience-lab`  
**Hook:** `useExperienceLabState`  
**Genesis key:** `experienceLabDna`

Wraps **Experience Runtime™** — does not redesign Experience Engine or Runtime.

---

## Panels

Runtime Status™ · Brand DNA™ · Platform DNA™ · Department DNA™ · Scene DNA™ · Component DNA™ · Motion DNA™ · Interaction DNA™ · Runtime Inspector™ · Performance™

---

## Live switchers

Brand · Department · Scene · Theme · Orb · Lighting · Particle · Typography · Animation

---

## Test scenarios

All use scene `hq-master-demonstration-v1` with fixed node IDs — only inherited DNA changes:

1. Studio OS Executive Headquarters  
2. Studio OS Institute  
3. Studio OS Command Center  
4. Frontal Slayer Headquarters  
5. Frontal Slayer Hair Analysis Lab  
6. NDX Headquarters  

---

## Public API

```typescript
import { getExperienceLabReadyView, applyLabScenario } from '@/studio-os-core/genesis';
import { useExperienceLabState } from '@/hooks/useExperienceLabState';
```

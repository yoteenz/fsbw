# Studio World™ Experience Intelligence Engine™

**Status:** Live engine — July 2026  
**Former name:** Experience Auditor™  
**Role:** Studio World's Creative Director — not QA, not bugs, not accessibility.

---

## Purpose

Every destination must feel **magical · cinematic · alive · luxurious · intentional · effortless · memorable**.

The engine evaluates rooms, transitions, interactions, animations, concierges, AI conversations, and headquarters from **human experience** — not engineering.

---

## Pipeline position

```
Founder Intent™ → Creative Intelligence Engine™ → Asset Intelligence Engine™
→ Generation Gate™ → Scene Assembly™ → Architecture Auditor™
→ Experience Intelligence Engine™ ← NEW
→ Quality Inspector™ → Founder Approval™ → Deploy™
```

Stages: `STUDIO_WORLD_EXPERIENCE_PIPELINE` in  
`src/studio-os-core/experience-intelligence-engine/pipeline-stages.ts`

`useSceneStack` chains: Architecture Auditor → Experience Intelligence after each layer assembly.

---

## What it evaluates

16 experience dimensions including immersion, wonder, luxury, discovery, cinematic quality, founder/guest delight, and **Overall Magic™**.

Creative Director questions include: *Would Apple ship this?* · *Would Disney Imagineering obsess over this?*

---

## Modules

| Module | Role |
|--------|------|
| `experience-detector` | Flags flat, generic, static, UI-heavy experiences |
| `destination-evaluator` | Scores destinations from migration + Scene Stack depth |
| `discovery-engine` | Recommends hidden rooms, collectibles, surprises |
| `flow-analyzer` | Hesitation, lost navigation, abrupt transitions |
| `improvement-engine` | Lighting, atmosphere, landmarks, delight moments |
| `memory-store` | Self-learning approved experience patterns |

---

## Founder experience

**Experience Observatory™** — `/admin/studio/experience-observatory`

Living observatory with Magic Core sculpture and installation columns — not graphs or cards.

Entry: Executive Atrium HUD → **Experience Observatory™**

---

## API

```typescript
import {
  runExperienceIntelligenceAudit,
  runExperienceIntelligenceGate,
  gateAfterArchitectureAudit,
} from '@/studio-os-core/experience-intelligence-engine';
```

---

## References

- Architecture Auditor: `docs/studio-os/architecture-auditor.md`
- Migration report: `docs/studio-os/STUDIO_WORLD_ARCHITECTURE_MIGRATION_REPORT_V5.md`

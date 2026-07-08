# Professional Memory™ / Wisdom Engine™ — Implementation Guide

**Status:** Implementation foundation  
**Article:** ARTICLE-E04  
**Core package:** `src/studio-os-core/professional-memory-wisdom-engine/`

---

## Module layout

| Module | Path | Responsibility |
| --- | --- | --- |
| **Professional Memory** | `professional-memory/` | Orchestration, bootstrap, sync, career-world event ingest |
| **Memory Events** | `memory-events/` | Schemas, catalog seeds, event registry, normalization |
| **Memory Timeline** | `memory-timeline/` | Persistent timeline builder and filters |
| **Reflection Engine** | `reflection-engine/` | Reflection mode specs and generators |
| **Wisdom Engine** | `wisdom-engine/` | Context-aware recommendation synthesis + orchestration |
| **Career History** | `career-history/` | Career milestone aggregation from memories |
| **Achievement History** | `achievement-history/` | Achievements, certifications, awards |
| **Orb Integration** | `orb-integration/` | Optional meaningful memory surfacing |

Root facades (`engine.ts`, `catalog.ts`, `index.ts`) preserve backward compatibility.

---

## Memory model

Every professional memory stores:

- Memory ID (`id`)
- Profession (`profession`)
- Category (`category`)
- Date (`occurredAt`)
- Scene (`sceneId`, `sceneLabel`)
- Simulation (`simulationId`)
- Career level (`careerLevel`)
- Importance (`importance`)
- Participants (`participants`)
- Related skills (`relatedSkillIds`)
- Related Profession Brain concepts (`relatedBrainConceptIds`)
- Related certifications (`relatedCertificationIds`)
- Reflection summary (`reflectionSummary`)

Plus signals, emotional tone, business/mentorship links, and Orb visibility.

---

## Timeline

`buildProfessionalTimeline()` supports:

- Career milestones
- Businesses
- Promotions
- Projects
- Mentorship
- Awards
- Community events
- Competition history
- Industry contributions

Timeline entries are derived from memory signals and categories — not hardcoded per world.

---

## Registering memory events from Career Worlds

Career Worlds emit events through the registry — **never by editing core engine code**.

```typescript
import { ingestCareerWorldMemoryEvent } from '@/studio-os-core/professional-memory-wisdom-engine';

ingestCareerWorldMemoryEvent(orgId, learnerId, {
  worldId: 'architecture-world',
  profession: 'licensed-architect',
  eventType: 'promotion-earned',
  title: 'Promoted to project lead',
  careerLevel: 'project-lead',
  importance: 88,
  relatedSkillIds: ['technical-drawing', 'team-leadership'],
  relatedBrainConceptIds: ['building-code-review'],
  reflectionSummary: 'Leadership begins when documentation quality protects the whole team.',
  signals: ['promotion', 'career-milestone'],
  category: 'career-memory',
});
```

Supported generic event types (see `MEMORY_EVENT_REGISTRY`):

- `client-outcome`
- `simulation-complete`
- `promotion-earned`
- `business-opened`
- `certification-earned`
- `mentorship-milestone`
- `award-received`
- `industry-contribution`

---

## Reflection modes

- Career Timeline™
- Year In Review™
- Mastery Replay™
- Business Timeline™
- Knowledge Evolution™
- Skill Growth™
- Mentorship Journey™

```typescript
import { generateReflectionSpec } from '@/studio-os-core/professional-memory-wisdom-engine';

const spec = generateReflectionSpec(timeline, 'year-in-review');
```

---

## Wisdom Engine

Orchestrates:

- Profession Brain™ (via related brain concept ids)
- Knowledge Retention Engine™ (retention profile ids)
- Professional Memory™
- Career World™ (world id + career history)
- World Graph™ (professional-memory nodes)
- Simulation outcomes
- Mentorship history

```typescript
import { orchestrateWisdomRecommendation, createWisdomContext } from '@/studio-os-core/professional-memory-wisdom-engine';

const context = createWisdomContext({
  learnerId,
  organizationId,
  profession: 'licensed-architect',
  worldId: 'architecture-world',
  currentQuestion: 'Should I approve this revision before the client meeting?',
});

const recommendation = orchestrateWisdomRecommendation(context);
```

---

## Orb integration

Orb surfaces meaningful memories only when context adds value:

- Anniversaries
- Major milestones
- Promotion anniversaries
- Certification anniversaries
- Industry relevance to past work
- Personal growth insights

Cooldown: `ORB_MEMORY_RECALL_COOLDOWN_MS` (12 hours). Surfaced memory ids are tracked to avoid repetition.

Wired into Orb Recommendations via `buildProfessionalMemoryOrbRecommendations()`.

---

## React hook

```typescript
import { useProfessionalMemoryState } from '@/hooks/useProfessionalMemoryState';

const { store, timeline, wisdomRecommendation, refresh } = useProfessionalMemoryState();
```

Listens for `PROFESSIONAL_MEMORY_UPDATED_EVENT` on localStorage writes.

---

## Profession-agnostic foundation

Launch seeds include examples from:

- Beauty / Hair World™
- Architecture World™
- Finance World™
- Healthcare World™
- Construction World™
- Marketing World™

No Hair World logic lives in the engine runtime. Worlds register events; the engine stores and synthesizes.

---

## Persistence

localStorage key: `PROFESSIONAL_MEMORY_STORAGE_KEY`

Future: replace with `ProfessionalMemoryPersistenceAdapter` (Supabase) without changing Career World APIs.

---

## Related docs

- Architecture canon: `ARTICLE_E04_PROFESSIONAL_MEMORY_WISDOM_ENGINE.md`
- Knowledge Retention: `../knowledge-retention/KNOWLEDGE_RETENTION_ENGINE.md`

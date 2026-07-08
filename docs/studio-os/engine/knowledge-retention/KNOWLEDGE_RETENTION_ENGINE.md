# Knowledge Retention Engine™ — Implementation Guide

**Status:** Implementation foundation  
**Article:** ARTICLE-E03  
**Core package:** `src/studio-os-core/knowledge-retention-engine/`

---

## Module layout

Every Career World adopts the same reusable modules:

| Module | Path | Responsibility |
| --- | --- | --- |
| **Knowledge Retention** | `knowledge-retention/` | Orchestration — bootstrap, sync, industry ingest, review completion |
| **Retention Profiles** | `retention-profiles/` | Schemas, catalog seeds, CRUD helpers |
| **Memory Engine** | `memory-engine/` | localStorage persistence, analytics snapshots |
| **Review Engine** | `review-engine/` | Decay evaluation, triggers, periodic scheduler |
| **Orb Reminders** | `orb-reminders/` | Optional contextual mentor lines + Orb recommendation bridge |
| **Refresher Generator** | `refresher-generator/` | Refresher experience specs and extension registry |

Root facades (`engine.ts`, `catalog.ts`, `index.ts`) preserve backward compatibility for World Graph ingest and Knowledge Core references.

---

## Retention profile fields

Each professional memory stores:

- Concept ID (`id`)
- Profession (`profession`)
- Date learned (`learnedAt`)
- Last practiced (`lastPracticed`)
- Last simulated (`lastSimulated`)
- Confidence score (`confidenceScore`)
- Recall score (`recallScore`)
- Applications completed (`applicationsCompleted`)
- Mistakes made (`mistakesMade`)
- Industry version (`industryVersion`)
- Certification status (`certificationStatus`)
- Career relevance (`careerRelevance`)

Plus brain linkage, domain, difficulty, career goals, and upcoming simulation/project context.

---

## Review triggers

The review engine evaluates profiles on:

- Time elapsed
- Low confidence
- Repeated mistakes
- New industry standards
- Upcoming simulations
- Career goals
- Certification deadlines

Scheduler interval: `RETENTION_SCHEDULER_INTERVAL_MS` (6 hours default).

---

## Refresher Modes™

Implementation sprint modes:

1. Memory Spark™
2. TL;DR Review™
3. Interactive Scenario™
4. Simulation Replay™
5. Mentor Walkthrough™
6. Quick Assessment™
7. Industry Update™
8. Certification Renewal™

Use `generateRefresherSpec()` or register custom generators via `RefresherGeneratorRegistry`.

---

## Orb integration

Orb reminders are **always optional**. Contextual lines include:

- "Before today's first appointment..."
- "It's been a while since..."
- "A new industry technique is now available..."
- "You've mastered this skill before—want a quick refresh?"

Wired into Orb Recommendations via `buildRetentionOrbRecommendations()` (`category: knowledge-refresh`).

---

## Profession Brain hooks

When Profession Brains™ receive canonical updates:

```typescript
import { queueProfessionBrainRefreshers } from '@/studio-os-core/knowledge-retention-engine';

queueProfessionBrainRefreshers(orgId, learnerId, [{
  brainId: 'hair-color',
  conceptId: 'memory-hair-bleaching-chemistry',
  title: 'Bond integrity documentation',
  industryVersion: '2026.3',
  summary: '...',
  whyItChanged: '...',
  workImpact: '...',
  severity: 'certification',
}]);
```

Affected learners are identified by profile `brainId` / `conceptId`. Refreshers are queued with what/why/how explanations.

---

## React hook

```typescript
import { useKnowledgeRetentionState } from '@/hooks/useKnowledgeRetentionState';

const { store, plan, analytics, refresh } = useKnowledgeRetentionState();
```

Listens for `KNOWLEDGE_RETENTION_UPDATED_EVENT` on localStorage writes.

---

## Analytics

`buildRetentionAnalyticsSnapshot()` tracks:

- Retention
- Confidence
- Mastery
- Review completion
- Knowledge growth
- Concept decay

---

## Future extensions

| Extension | Integration point |
| --- | --- |
| Supabase persistence | Replace `KnowledgeRetentionPersistenceAdapter` in `memory-engine/store.ts` |
| Career World tick | Call `syncKnowledgeRetention()` on world return |
| Simulation Engine | Register `simulation-replay` generator in `RefresherGeneratorRegistry` |
| Studio Institute | Render `RefresherExperienceSpec` payloads in learning UI |
| Admin workspace | `/admin/studio/knowledge-retention` (optional prototype) |
| World Graph | `knowledge-retention-ingest.ts` — Professional Memory™ nodes |

---

## Related docs

- Architecture canon: `ARTICLE_E03_KNOWLEDGE_RETENTION_ENGINE.md`
- Career Worlds pattern: `docs/studio-os/career-worlds/CAREER_WORLDS_ENGINE.md`

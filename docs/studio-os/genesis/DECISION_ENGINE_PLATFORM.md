# Genesis Universal Decision Architecture™ — Platform Guide

**Core:** `src/studio-os-core/genesis/decision-engine/`  
**Ontology:** `genesis/articles/UNIVERSAL_DECISION_ARCHITECTURE.md`  
**Content home:** `genesis/decision-engine/`  
**Admin:** `/admin/studio/genesis` → Decisions tab

---

## Purpose

The Universal Decision Architecture is a **first-class Genesis subsystem** providing reusable decision infrastructure for Studio World. This sprint delivers **framework only** — no hardcoded Studio World decisions in runtime.

---

## Implemented systems

| System | Module |
|--------|--------|
| Decision Registry™ | `decisions/registry.ts` |
| Decision Engine | `decisions/engine.ts` |
| Recommendation Engine™ | `recommendations/engine.ts` |
| Priority Engine™ | `priorities/engine.ts` |
| Context Engine™ | `context/engine.ts` |
| Evidence Model™ | `evidence/model.ts` |
| Confidence Model™ | `confidence/model.ts` |
| Decision Review | `review/review.ts` |
| Decision History™ | `history/history.ts` |
| Decision Audit™ | `audit/audit.ts` |
| Learning Feedback™ | `learning/feedback.ts` |
| Strategies | `strategies/strategies.ts` |
| Content Loader | `content/loader.ts` |

---

## Decision envelope

Every decision stores:

- Unique ID, Decision Type, Intent, Context
- Evidence, Confidence Score, Recommendation
- Alternative Options, Dependencies
- Review Status, Human Override
- Audit History, Learning History

---

## Key APIs

```typescript
import {
  submitStudioDecision,
  issueStudioRecommendation,
  createStudioPriorityRanking,
  buildDecisionContext,
  buildDecisionConfidence,
  applyHumanOverride,
  recordLearningFeedback,
  ingestDecisionBatch,
  validateDecisionEngineStore,
} from '@/studio-os-core/genesis';
```

---

## Persistence

Nested under `genesis_v1` localStorage as `GenesisStore.decisionEngine`. Registries start empty until decisions are submitted or ingested via `genesis/decision-engine/decisions/decision.schema.json`.

---

## Principles

- Human judgment always overrides automation
- Recommendations must explain why
- High-impact decisions require transparency
- Decisions improve through learning loops

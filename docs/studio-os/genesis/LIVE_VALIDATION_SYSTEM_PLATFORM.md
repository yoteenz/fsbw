# Live Validation System™ — Platform Runtime Guide

**Blueprint:** `genesis/articles/LIVE_VALIDATION_SYSTEM.md`  
**Content home:** `genesis/live-validation-system/`  
**Parent:** Founder Acceptance Testing™  
**Runtime:** `src/studio-os-core/genesis/live-validation-system/`  
**Experience:** `/admin/studio/live-validation-system`

---

## Status

Live Validation System™ Phase 2 runtime is **implemented** with passive signals, Founder Diary™, Escape Velocity™, system health scores, adoption/value tracking, and Genesis proposal queue.

Genesis is **never modified automatically** — validated insights become queued Genesis Improvement Proposals™ for founder review.

---

## Runtime module

| Path | Engine |
|------|--------|
| `constants.ts` | Tracking metrics, health dimensions, escape classifications, dashboard views |
| `types.ts` | Store schemas, ready view, signals, proposals |
| `persistence.ts` | Nested Genesis store key `liveValidationSystem` |
| `founder-diary/diary-engine.ts` | Founder Diary Engine™ |
| `escape-velocity/escape-velocity-engine.ts` | Escape Velocity Engine™ |
| `system-health/health-engine.ts` | System Health + passive signal aggregation |
| `system-confidence/confidence-engine.ts` | System Confidence Engine™ |
| `adoption/adoption-engine.ts` | Adoption Engine™ |
| `value-tracking/value-engine.ts` | Value Engine™ |
| `genesis-learning/learning-engine.ts` | Learning Engine™ |
| `genesis-learning/proposal-engine.ts` | Genesis Proposal Engine™ |
| `live-validation/dashboard.ts` | Ready view assembly |
| `bootstrap/seed.ts` | Launch Stack live validation fixtures |
| `engine.ts` | Public API |

---

## UI integration

| Component | Path |
|-----------|------|
| Live Validation workspace | `src/components/admin/studio/live-validation-system/LiveValidationSystemWorkspace.tsx` |
| Hook | `src/hooks/useLiveValidationSystemState.ts` |
| Route | `/admin/studio/live-validation-system` |
| FAT link | Founder Acceptance Testing workspace → Live Validation |

### Dashboard views

- Live Validation Overview™
- Founder Diary™
- Escape Velocity™
- System Health™
- Adoption & Value™
- Genesis Proposals™

---

## Genesis integration

- `ensureLiveValidationSystemSubsystem()` in `ensureGenesisStore()`
- Framework module: `'live-validation-system'`
- Chains after `ensureFounderAcceptanceTestingSubsystem()`
- Proposals queue in store; `reviewGenesisProposal()` records architectural history

---

## API (selected)

```typescript
ensureLiveValidationSystemSubsystem();
getLiveValidationSystemReadyView('overview');
getLiveValidationPlatformStats();
logEscapeEvent({ systemId, destinationCategory, ... });
recordDiaryAnswer(promptId, response);
listSystemHealthScores();
listGenesisProposals('queued');
reviewGenesisProposal(proposalId, 'accepted', note);
createGenesisImprovementProposal({ title, systemIds, ... });
```

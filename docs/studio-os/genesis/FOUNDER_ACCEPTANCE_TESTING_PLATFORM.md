# Genesis Founder Acceptance Testing™ — Platform Runtime Guide

**Blueprint:** `genesis/articles/FOUNDER_ACCEPTANCE_TESTING.md`  
**Content home:** `genesis/founder-acceptance-testing/`  
**Runtime:** `src/studio-os-core/genesis/founder-acceptance-testing/`  
**Experience:** `/admin/studio/founder-acceptance-testing`

---

## Status

Founder Acceptance Testing™ Launch Stack runtime is **implemented** with validation registry, metric/evidence engines, and graduation pipeline.

---

## Runtime module

| Path | Responsibility |
|------|----------------|
| `constants.ts` | Validation levels, gates, metrics, dashboard views |
| `types.ts` | Store schemas, ready view, projection contracts |
| `persistence.ts` | Nested Genesis store key `founderAcceptanceTesting` |
| `validation/registry.ts` | Validation Registry™ |
| `founder-testing/dashboard.ts` | Founder Testing Dashboard™ projections |
| `metrics/metric-engine.ts` | Metric Engine™ — 12 founder metrics |
| `evidence/evidence-engine.ts` | Evidence Engine™ |
| `withdrawal-test/withdrawal-engine.ts` | Withdrawal Test™ |
| `replacement-test/replacement-engine.ts` | Replacement Test™ |
| `genesis-feedback/feedback-engine.ts` | Genesis Feedback Engine™ |
| `validation-history/history-engine.ts` | Validation audit trail |
| `graduation/graduation-engine.ts` | Graduation Engine™ |
| `launch-stack/progress.ts` | Launch Stack Progress™ |
| `bootstrap/seed.ts` | Launch Stack validation fixtures |
| `engine.ts` | Public API |

---

## UI integration

| Component | Path |
|-----------|------|
| Validation workspace | `src/components/admin/studio/founder-acceptance-testing/FounderAcceptanceTestingWorkspace.tsx` |
| Hook | `src/hooks/useFounderAcceptanceTestingState.ts` |
| Route | `/admin/studio/founder-acceptance-testing` |

### Dashboard views

- Validation Dashboard™
- Launch Stack Status™
- Metric Trends™
- Genesis Learnings™
- Outstanding Issues™
- Graduated Systems™

---

## Genesis integration

- `ensureFounderAcceptanceTestingSubsystem()` in `ensureGenesisStore()`
- Framework module: `'founder-acceptance-testing'`
- Integrates with Build Order™ registry and Orb™ subsystem bootstrap chain

---

## Validation pipeline

```text
Architecture → Implementation → Founder Acceptance Testing™ → Genesis Feedback™ → Launch Stack Graduation™ → Platform Ready™
```

Pass threshold: **75/100** with Withdrawal Test™, Replacement Test™, and Delight signal.

---

## API (selected)

```typescript
ensureFounderAcceptanceTestingSubsystem();
getFounderAcceptanceTestingReadyView('validation-dashboard');
getFounderAcceptancePlatformStats();
listValidationRegistry();
buildLaunchStackProgress();
listGraduatedSystems();
listOutstandingIssues();
aggregatePlatformMetricTrends();
```

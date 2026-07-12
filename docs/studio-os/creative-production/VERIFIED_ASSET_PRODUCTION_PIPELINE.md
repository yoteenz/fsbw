# Verified Asset Production Pipeline™

**Version:** `verified-asset-production.v1`

## Rule

No generated provider output may mount into Scene Stack without passing the full production gate:

```
generate → inspect → identify → validate → classify background → cleanup (when eligible)
→ revalidate → approve → register → mount → scene validate
```

## Lifecycle states

`REQUESTED` → `GENERATING` → `GENERATED_CANDIDATE` → `IDENTITY_VALIDATING` → `STRUCTURE_VALIDATING` → `BACKGROUND_CLASSIFYING` → `BACKGROUND_REMOVING` (optional) → `POSTPROCESS_VALIDATING` → `APPROVED` → `REGISTERED` → `MOUNTING` → `MOUNTED` → `SCENE_VALIDATED`

Failure states: `REJECTED_WRONG_ASSET`, `REJECTED_FULL_SCENE`, `REJECTED_BACKGROUND`, `REJECTED_DAMAGED`, `REJECTED_LOW_CONFIDENCE`, `REGENERATION_REQUIRED`, `MANUAL_REVIEW_REQUIRED`

## Candidate vs approved

| State | Mountable | Registry authoritative |
|-------|-----------|------------------------|
| Candidate (raw provider URL) | No | No |
| Quarantined | No | Forensic only |
| Approved | Yes | Yes |

## Modules

| Concern | Path |
|---------|------|
| Contract | `verified-asset-production/contract.ts` |
| State machine | `verified-asset-production/state-machine.ts` |
| Identity | `verified-asset-production/identity-validation.ts` |
| Structure | `verified-asset-production/structural-validation.ts` |
| Background | `verified-asset-production/background-classification.ts` |
| Postprocess | `verified-asset-production/postprocess-validation.ts` |
| Approval | `verified-asset-production/approval-gate.ts` |
| Quarantine | `verified-asset-production/quarantine.ts` |
| Pipeline | `verified-asset-production/pipeline.ts` |
| Cleanup API | `api/admin/scene-stack-asset-cleanup.ts` |
| Driver | `src/hooks/useSceneStack.ts` |

## Bounds

- Max provider generation attempts: **2**
- Max background-removal attempts per candidate: **1** (+ 1 alternate on halo damage policy)
- Max mount-correction attempts: **2**
- Quarantine retention: **7 days**

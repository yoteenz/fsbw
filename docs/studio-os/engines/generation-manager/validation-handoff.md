# Validation Handoff — Studio Generation Manager™

**Engine Module:** `studio.generation-manager.v1.validation`  
**Status:** Quality gates before Registry

---

## Principle

> **Nothing reaches the Registry until validated.**

Every generated artifact automatically enters validation. Generation Manager orchestrates handoff — Validation Loop™ retains authority.

---

## Validation Pipeline Position

```
Provider returns CookedArtifact
         ↓
Generation Manager: state → validating
         ↓
Automated pre-validation (Manager)
         ↓
Studio Validation Loop™ (authority)
         ↓
Production Asset Review (Stage 04 criteria)
         ↓
├── PASS → approved → Registry handoff
└── FAIL → needs-revision → retry engine
```

---

## Automated Pre-Validation (Manager)

Fast checks before Validation Loop — fail fast:

| Check | Rule | Fail Class |
|-------|------|------------|
| Checksum valid | Artifact not corrupt | `corrupt` |
| Format match | GLB/PNG/MP3 expected | `corrupt` |
| Resolution min | ≥ prompt spec | `low-quality` |
| File size sane | Not empty · not > 50MB single | `corrupt` |
| Prompt hash match | Artifact tagged to correct assetId | `prompt-conflict` |
| Dependency refs | Upstream artifacts present | `dependency-missing` |

Pre-validation failure → retry engine without Validation Loop invoke.

---

## Quality Gates (Full Validation)

Every asset evaluated per [asset-review-system.md](../../production/asset-review-system.md):

| Gate | Dimension | Automated | Founder |
|------|-----------|-----------|---------|
| Company Genome™ | Alignment · thingsWeNeverDo | ✓ | — |
| Room DNA™ | Slider reflection | ✓ | — |
| Lighting consistency | Rig compatibility | ✓ | — |
| Perspective | Camera spec | ✓ | — |
| Resolution | Meets output spec | ✓ | — |
| Material quality | PBR · genome slots | ✓ | — |
| Luxury score | ≥ 85 default · hero ≥ 90 | ✓ | hero confirm |
| Prompt compliance | Expanded stack honored | ✓ | — |
| Reusability | Registry metadata ready | ✓ | — |
| Performance suitability | Budget MB contribution | ✓ | — |
| Immersion | Anti-SaaS · place-not-page | ○ | hero |

---

## Validation Request Schema

```yaml
ValidationRequest:
  requestId: string
  jobId: string
  assetId: string
  packageId: string
  orgId: string
  artifactRef: string
  expandedPromptRef: string
  genomeSnapshotRef: string
  roomDnaSnapshot: object
  validationProfile: string           # default · hero · audio · metadata
  priorAttempts: number
  submittedAt: ISO8601
```

---

## Validation Profiles

| Profile | Assets | Threshold |
|---------|--------|-----------|
| `default` | Standard objects | Luxury ≥ 85 |
| `hero` | `wall-mood-cds` · shell | Luxury ≥ 90 · founder required |
| `reuse-skip` | Registry linked | Metadata only |
| `metadata` | Animation · walk markers | Schema only |
| `audio` | Audio stems | Seamless loop · levels |
| `intelligence` | Concierge defs | Routing schema |

---

## Validation Response

```yaml
ValidationResponse:
  requestId: string
  decision: pass | fail | founder-required
  scores:
    luxury: number
    genome: number
    roomDna: number
    immersion: number
    performance: number
  failures: ValidationFailure[]
  founderReviewRequired: boolean
  revisionScope: string | null
  validationLoopRef: string | null    # if full loop engaged
```

---

## Studio Validation Loop™ Integration

Hero assets and package-complete review engage full loop:

```
Per-asset pass (automated)
         ↓
Package cook complete
         ↓
Validation Loop: department package review
         ↓
Walk the Room™ (Stage 08 production)
         ↓
validationApprovalToken
```

Manager blocks `job → complete` without package-level token for golden departments.

---

## Founder Approval Gate

| Asset | Founder Required |
|-------|------------------|
| `wall-mood-cds` | ✓ Always |
| `env-shell-cds` | ✓ Always |
| `orb-cds` | ✓ On reuse confirm |
| `lighting-rig-cds` | ○ Unless flagged |
| All others | Only on fail or hero-adjacent |

Founder sees artifact in context — never prompt. Approve · Reject · Regenerate.

---

## Fail → Retry Handoff

```yaml
ValidationFailure:
  dimension: string
  severity: error | warn
  message: string
  revisionScope: string
  retryStrategy: string
```

Manager maps failure → retry engine automatically. Founder reject adds `founderNotes` to retry payload.

---

## Batch Validation

Non-hero assets in same stage may validate parallel:

```
stage-5-complete → batch validate [wall-brief-cds, observatory-cds, screen-compare-cds]
```

Hero never batched — individual founder gate.

---

## Validation Timing

| Mode | When |
|------|------|
| Per-asset | Default — validate before next dependent dispatches |
| Stage batch | Optional — validate all stage items together |
| Package | Required — after all items approved |

**CDS golden path:** per-asset for deps · package validation at end.

---

## Registry Block

```yaml
registryWriteBlocked: true            # until validation.decision == pass
```

Manager enforces — Registry integration rejects writes without `validationRef` pass token.

---

## Validation History

```yaml
ValidationRecord:
  assetId: string
  attempts: ValidationAttempt[]
  finalDecision: pass | fail
  totalValidationMinutes: number
```

Included in Build Report `validationResults`.

---

_Validation Handoff — quality before memory._

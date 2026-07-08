# Evolution Engine™

**Engine Module:** `studio.company-genome.v2.evolution`  
**Status:** Continuous update mechanics

---

## Purpose

Company Genome™ is **living** — not a static document written once at onboarding.

The Evolution Engine processes learning signals into strand updates and snapshots.

---

## Evolution Cycle

```
LearningSignal or GenomeDecision
         ↓
Trait extraction
         ↓
Confidence update (see confidence-scoring.md)
         ↓
Strand merge (Visual · Creative · Brand · Operational)
         ↓
Snapshot version bump
         ↓
Downstream cache invalidation
         ↓
Optional: Living Company Genome™ milestone check
```

---

## Snapshot Versioning

```yaml
GenomeSnapshot:
  orgId: string
  version: string                 # semver + monotonic counter
  snapshotHash: sha256
  capturedAt: ISO8601
  beliefCount: number
  strandConfidences: StrandConfidence
  changelog: GenomeChange[]
```

Every Prompt Composer™ compose reads **latest snapshot** by hash.

---

## Creative Drift Detection

```yaml
CreativeDrift:
  detected: boolean
  driftScore: number              # 0–100
  description: string
  recentDecisions: string[]
  recommendation: align | explore | founder-review
```

Example: *"Recent approvals favor cooler lighting — diverging from warm editorial canon (87%)."*

Surfaced in CDS presentation — not blocking.

---

## DNA Evolution Timeline

```yaml
TimelineEntry:
  entryId: uuid
  timestamp: ISO8601
  eventType: belief-formed | confidence-threshold | drift-detected |
             marketplace-import | milestone
  headline: string
  strand: string
  confidenceBefore: number | null
  confidenceAfter: number | null
```

Example entries:

- *"Warm editorial lighting reached 90% confidence"*
- *"Heavy industrial materials added to dislikes (95%)"*
- *"Luxury Materials Pack™ imported 12 traits"*

---

## Relationship to Living Company Genome™

| Company Genome™ v2 | Living Company Genome™ |
|--------------------|------------------------|
| Continuous taste learning | Milestone chapters |
| Confidence beliefs | Genome Events™ |
| Decision DNA | Time Capsule™ |
| Creative drift | World Evolution™ |

Milestone thresholds may trigger Living Genome events — complementary, not duplicate.

---

## Rollback (Rare)

```yaml
GenomeRollback:
  toSnapshotId: uuid
  reason: founder-request | bad-learning-batch
  scope: strand | full
```

Rollback does not delete Decision DNA™ — audit preserved.

---

_Evolution Engine — DNA that breathes with every decision._

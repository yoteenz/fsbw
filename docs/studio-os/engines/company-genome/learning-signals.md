# Learning Signals™

**Engine Module:** `studio.company-genome.v2.learning`  
**Status:** What teaches the Genome

---

## Continuous Evolution Law

> Company Genome™ **continuously evolves**.

Every listed signal produces a `GenomeDecision` → belief update.

---

## Signal Sources

| Source | Signal types | Strand impact |
|--------|--------------|---------------|
| **Approval** | Layer · asset · blueprint · estimate | All strands |
| **Rejection** | Quality fail · aesthetic miss | Visual · Creative · negative |
| **Regeneration** | Target layer · variation intent | Visual · Operational |
| **Edit** | Manual refinement post-approval | Trait delta |
| **Marketplace purchase** | Pack · asset · scene · workspace | Visual · Brand |
| **Reused asset** | Registry attach | Visual · Operational |
| **Generated department** | New dept package | Creative · Visual |
| **Onboarding conversation** | Mission · industry · aspiration | Brand · Creative |
| **Mood boards · references** | Pinterest · uploads | Visual |
| **Creative Review™** | Braintrust feedback | Creative |
| **Founder notes** | Voice · journal | Creative · Brand |
| **Blueprint adoption** | Apply Existing™ | Visual · Creative |

---

## Per-Signal Processing

```yaml
LearningSignal:
  signalId: uuid
  orgId: string
  source: string
  rawEvent: object
  extractedTraits: string[]
  targetStrands: string[]
  processedAt: ISO8601 | null
```

Processing is **async** — never blocks generation queue.

---

## Approval Learning

```
Founder approves lighting layer (warm editorial)
         ↓
Extract: warm-editorial-lighting, volumetric-haze, editorial-rig
         ↓
Visual DNA™ beliefs +3 confidence each
         ↓
Operational DNA™: approval-speed signal (fast/slow)
```

---

## Rejection Learning

```
Founder rejects asset (industrial steel aesthetic)
         ↓
Extract: heavy-industrial-materials, cold-steel
         ↓
Negative constraint +12 confidence
         ↓
Related positive beliefs -6 if previously suggested
```

---

## Regeneration Learning

```
Founder regenerates with "warmer" intent
         ↓
Delta: color-temperature +warm
         ↓
Refine lighting belief · not full replacement
```

---

## Marketplace Learning

See [marketplace-integration.md](./marketplace-integration.md).

---

## Reuse Learning

```
Founder reuses registry:lighting-editorial-rig-v3
         ↓
Reinforce: lighting-rig-editorial, reuse-first-behavior
         ↓
Operational DNA™: budget preference reuse-first +2
```

---

## Department Generation Learning

```
New Finance department generated
         ↓
Extract spatial scale · material carryover · blueprint inheritance
         ↓
Creative DNA™: cross-department consistency signal
```

---

## What Does NOT Teach Genome

| Excluded | Why |
|----------|-----|
| Page views · click heatmaps | Analytics — not Genome |
| CRM stage changes | Not creative identity |
| Unrelated admin settings | Not taste signal |
| Other companies' data | Org-scoped only |

---

## Privacy & Scope

- Genome learning is **per-org** isolated
- No cross-tenant model training without explicit opt-in (future)
- Founder Taste Genome™ may travel — Company Genome™ does not

---

_Learning Signals — every action writes a chapter in company DNA._

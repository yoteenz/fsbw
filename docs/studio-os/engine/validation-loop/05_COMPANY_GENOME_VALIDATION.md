# 05 — Company Genome Validation

**Engine Module:** `studio.validation-loop.v1.genome-validation`  
**Status:** Brand inevitability evaluation system  
**Philosophy:** If it could belong to another company, validation fails.

---

## Design Principle

> Every output must answer: **Does this feel inevitable for this company?**  
> And: **Would this experience work unchanged for another company?** If yes — fail.

The system must explain **WHY**.

---

## The Inevitability Test

| Question | Pass Answer |
|----------|-------------|
| Does this feel inevitable for this company? | **Yes** — materials, light, voice, mood unmistakable |
| Would this work for a competitor unchanged? | **No** — swapping Genome must change soul |
| Can a blind visitor identify the company? | **Yes** — without reading mission text |
| Does Genome express in space, not settings? | **Yes** — no settings-page dependency |

---

## Genome Domain Audit

| Domain | Validation Check |
|--------|------------------|
| `materialLanguage` | Floor · walls · furniture match Genome materials |
| `lightingStyle` | Rig temperature · accent character |
| `photographyDirection` | Mood surface character |
| `editorialDirection` | Typography on objects · pin style |
| `voice` | Orb + Concierge register |
| `customerEmotions` | Ambient audio · particle warmth |
| `values` | Observatory · Brief Wall alignment |
| `brandDNA` | Material samples · decor |
| `visualReferences` | Exterior view · seed references |

Each domain: **bound · expressed · inevitable** — or flagged with explanation.

---

## Two-Genome Swap Test (Mandatory)

```
1. Generate/assemble department with Company A Genome
2. Hot-swap to Company B Genome (Runtime injection)
3. Evaluate: Does the room feel like a different headquarters?
4. If transformation is cosmetic only (color swap) → FAIL
5. If topology changes → FAIL (DNA violation — separate issue)
6. If materials · light · voice · mood · audio transform → PASS
```

| Company Pair | Expected Transformation |
|--------------|------------------------|
| Frontal Slayer ↔ NDX | Beauty mansion ↔ editorial think tank |
| Restaurant ↔ Law Firm | Culinary warmth ↔ library authority |
| Any ↔ Any | Different soul · same department topology |

---

## Genome Validation Result Schema

```yaml
GenomeValidationResult:
  inevitabilityScore: number          # 0–100
  transferabilityRisk: enum           # none | low | medium | high | critical
  domainAudit: GenomeDomainResult[]
  swapTestPass: boolean
  swapTestEvidence: string
  brandConciergeVerdict: string
  failures:
    - domain: string
      reason: string
      suggestion: string
  pass: boolean
```

---

## Fail Explanations (Required Format)

Every fail must include:

```yaml
GenomeFailureExplanation:
  what: string                        # what failed
  why: string                         # why it breaks inevitability
  whichGenomeDomain: string
  evidence: string[]                  # specific observations
  revisionScope: RegenerationScope    # surgical fix
  couldBelongToOtherCompany: boolean  # must be true on fail
```

**Example:**

> **What:** Mood Wall defaults to generic tech-minimal imagery.  
> **Why:** Frontal Slayer photographyDirection demands editorial beauty texture; current seeds could serve any SaaS company.  
> **Domain:** photographyDirection · customerEmotions  
> **Revision:** Regenerate mood-wall seeds with Genome modifiers · re-run swap test.

---

## Relationship to Brand Concierge

Brand Concierge (AI Braintrust) guards Genome alignment:

| Trigger | Action |
|---------|--------|
| Off-brand reference in package | Flag in Genome audit |
| Project direction diverges from values | Divergence visualization required |
| Swap test marginal pass | Brand Concierge demands revision |

---

## Genome Update Mid-Validation

If Company Genome updates during active validation:

| Action | Rule |
|--------|------|
| Pause pipeline | Until re-swap test completes |
| Re-run Genome Validation | Required |
| Preserve founder review | Only if swap test still passes |

---

## Pass Threshold

| Metric | Department Package |
|--------|-------------------|
| inevitabilityScore | ≥ 75 |
| transferabilityRisk | ≤ low |
| swapTestPass | Required true |
| All critical domains bound | Required |

---

_Next: [06 — Department Review](./06_DEPARTMENT_REVIEW.md)_

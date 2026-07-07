# 06 — Department Review

**Engine Module:** `studio.validation-loop.v1.department-review`  
**Status:** Holistic department audit system  
**Philosophy:** Every asset reviewed individually and as part of the whole.

---

## Design Principle

> A department is not a collection of assets — it is a **place**. Department Review audits each modular piece and the emergent whole.

---

## Review Layers

### Layer 1: Per-Asset Review

| Asset Category | Review Criteria |
|----------------|-----------------|
| **Environment** | Shell integrity · proportions · Genome materials |
| **Objects** | SDK class binding · zone placement · affordances |
| **Lighting** | Three-point rig · ceremony accents · Genome temperature |
| **Audio** | Stem quality · spatial map · ducking rules |
| **Interactions** | Verb bindings · permissions · ceremony triggers |
| **Motion** | Arrival · idle · events · reduced-motion fallback |
| **Particles** | Density appropriate · Genome character · performance |
| **AI Employees** | Role presence · trigger validity · no auto-approve |
| **Navigation** | Entry/exit portals · camera paths · inter-dept ports |
| **Runtime** | Assembly completes · ACTIVE state · preview functional |
| **Marketplace** | Replaceable flags · manifest complete · compatibility |

Each asset receives: `pass | warn | fail` + explanation.

### Layer 2: Holistic Review

| Holistic Check | Question |
|----------------|----------|
| Zone coherence | Do zones relate as a room? |
| Verb coverage | Can founder complete department purpose with primary verbs? |
| AI team coverage | Are all zones served by appropriate staff? |
| Audio-mood alignment | Does sound match visual mood? |
| Motion-audio sync | Ceremonies synchronized? |
| Sandbox isolation | Experiments isolated until approve? |
| Hero hierarchy | Hero zone dominates as DNA specifies? |
| Orb presence | Visible · physical · routable? |

---

## Department Review Result Schema

```yaml
DepartmentReviewResult:
  departmentId: string
  packageVersion: semver
  assetReviews: AssetReviewResult[]
  holisticReview: HolisticReviewResult
  goldenDepartmentAlignment: number   # 0–100 for creative pipeline
  sdkQAPass: boolean
  runtimeQAPass: boolean
  marketplaceReadiness: number
  pass: boolean
  failedAssets: string[]
  revisionPlan: RevisionPlan | null
```

```yaml
AssetReviewResult:
  assetId: string
  objectClass: string
  zoneId: string
  status: enum                      # pass | warn | fail
  dimensions:
    technical: { score, notes }
    creative: { score, notes }
    genome: { score, notes }
    runtime: { score, notes }
  replaceableVerified: boolean
  revisionScope: RegenerationScope | null
```

---

## Creative Direction Studio™ Audit Checklist

Reference package `pkg-creative-direction-golden-v1`:

| Asset / Zone | Must Pass |
|--------------|-----------|
| 7 zones present | ✓ |
| Mood Wall hero | ✓ |
| Timeline Table primary | ✓ |
| Sandbox isolation contract | ✓ |
| Orb pedestal (not bubble) | ✓ |
| creative-approval ceremony | ✓ |
| 16 primary verbs bound | ✓ |
| Genome slots on all assets | ✓ |
| Arrival 5–7s sequence | ✓ |

---

## SDK Compliance Gate

Department Review enforces SDK QA Checklist (17):

| SDK Check | Department Review Stage |
|-----------|------------------------|
| Anatomy complete | Asset manifest audit |
| Spatial layout | Holistic zone map |
| Object library | Per-asset class verify |
| Interaction engine | Interaction map audit |
| AI employees | AI team manifest |
| Motion standard | Animation manifest |
| Audio standard | Audio manifest |
| Marketplace packaging | Marketplace readiness score |

---

## Performance Review

| Metric | Threshold |
|--------|-----------|
| Package size | ≤ DNA sizeBudget |
| Asset count | ≤ DNA assetBudget |
| Preview load time | < 5s |
| Draw calls (preview) | < 200 |
| Texture memory | < 80 MB |

Performance dimension feeds Scorecard (08).

---

## Marketplace Compatibility Review

| Check | Pass |
|-------|------|
| All assets `replaceable: true` | Required |
| No monolithic scenes | Required |
| Dependency graph acyclic | Required |
| Semver declared | Required |
| Install dry-run | Required |
| Genome hooks documented | Required |

---

_Next: [07 — AI Braintrust](./07_AI_BRAINTRUST.md)_

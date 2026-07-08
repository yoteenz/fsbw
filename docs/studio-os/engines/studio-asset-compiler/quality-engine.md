# Quality Engine — Studio Asset Compiler™

**Engine Module:** `studio.asset-compiler.v1.quality-engine`  
**Status:** Pre-package validation · Build Health score

---

## Purpose

Before sealing `DepartmentPackage.zip`, every asset and the package as a whole pass through the **Quality Engine**. Broken packages never ship to providers or Runtime.

Runs at **Stage 12 — Final Validation**.

---

## Per-Asset Checks

| Check | Rule | Severity |
|-------|------|----------|
| **Consistency** | Expanded prompt matches asset blueprint purpose | error |
| **Naming** | `assetId` matches `[a-z0-9-]+` · folder path convention | error |
| **Material conflicts** | Adjacent zone materials compatible per Design Language | warn |
| **Lighting conflicts** | No competing key light definitions per zone | error |
| **Duplicate prompts** | `promptHash` unique unless intentional reuse | warn |
| **Reuse opportunities** | Registry match flagged if regen unnecessary | info |
| **Genome compliance** | All `genomeSlots` resolve · `thingsWeNeverDo` not violated | error |
| **Design Language** | Quality tier · forbidden patterns absent from negatives | error |
| **Budget** | Estimated package MB ≤ department.json `budgetMB` | warn |
| **Interaction coverage** | Asset in interaction-manifest if interactive | error |
| **No flattened bg** | No full-room single texture dependency | error |

---

## Package-Level Checks

| Check | Rule |
|-------|------|
| Hero object placed | `spatial.heroObjectId` in queue stage ≤ 6 |
| Orb present | `orb-cds` in package |
| Runtime manifest complete | `15_runtime/` all required files |
| Stage completeness | All manifest assets assigned to stage |
| Prompt count | ≥ asset count (environment may split) |
| Golden department flags | `validation-criteria.md` gates referenced |

---

## Build Health Score

**Build Health™** — 0–100 composite score in `package-manifest.json`.

| Dimension | Weight | Measures |
|-----------|--------|----------|
| Input completeness | 15% | All Definition files ingested |
| Prompt expansion quality | 20% | Token depth · layer completeness |
| Dependency integrity | 15% | No cycles · gates valid |
| Genome compliance | 15% | Slots · thingsWeNeverDo |
| Design Language alignment | 10% | Registry + language tokens |
| Reuse efficiency | 10% | % assets linked from registry |
| Interaction coverage | 10% | Interactive assets bound |
| Budget adherence | 5% | Size estimate within cap |

### Thresholds

| Score | Status | Action |
|-------|--------|--------|
| 90–100 | `excellent` | Seal package · priority Validation Loop |
| 85–89 | `pass` | Seal package |
| 70–84 | `pass-with-warnings` | Seal · build-report warnings prominent |
| < 70 | `fail` | Do not seal · return errors to compile requester |

Golden Department (`creative-direction`) target: **≥ 85**.

---

## Validation Output

`14_metadata/validation.json`:

```json
{
  "$schema": "studio.asset-compiler.v1/validation.json",
  "packageId": "pkg-creative-direction-golden-v1",
  "buildHealth": 87,
  "status": "pass",
  "checkedAt": "2026-07-08T00:00:00Z",
  "assetResults": [
    { "assetId": "wall-mood-cds", "status": "pass", "warnings": [] },
    { "assetId": "glass-panels-cds", "status": "pass", "warnings": ["reuse-candidate:registry-glass-v1"] }
  ],
  "packageWarnings": ["estimatedMB 118 near budget cap 120"],
  "packageErrors": [],
  "genomeCompliance": true,
  "designLanguageCompliance": true
}
```

---

## Relationship to Validation Loop™

| Engine | When | Authority |
|--------|------|-----------|
| **Quality Engine** (this) | Pre-provider · at compile | Manufacturing correctness |
| **Validation Loop™** | Post-cook · pre-Runtime | Creative · experience · founder approval |

Quality Engine does not replace Validation Loop. It ensures the **package is manufacturable**.

---

## Auto-Remediation (v1 — Document Only)

| Issue | Suggested fix in build-report |
|-------|------------------------------|
| Missing negative | Inject universal anti-SaaS |
| Shallow prompt | Re-run expansion with blueprint enrich |
| Reuse candidate | Link registry asset · save generation cost |
| Material conflict | Prefer Genome materialLanguage winner |

Implementation deferred — v1 spec documents behavior.

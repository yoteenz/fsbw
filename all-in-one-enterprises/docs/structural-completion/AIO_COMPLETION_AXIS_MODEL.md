# AIO Completion Axis Model

**Sprint:** P0.AIO.COMPLETE-PRODUCT-BLUEPRINT-STRUCTURAL-COMPLETION-FORENSIC1  
**Doctrine:** Structural-completion-first (aligned with JURNL). Paid generation is never on the critical path for structural product completion.

## Independent axes

Each material product node carries **four independent percentages** (0–100). They must **not** be collapsed into a single “percent done.”

| Axis | Meaning |
|------|---------|
| **functional_completion** | Required route, nav, states, data contract, validation, auth, persistence, and interactions are complete or formally N/A per `AIO_FUNCTIONAL_COMPLETION_CONTRACT.md`. |
| **visual_completion** | Executive industrial / locked brand expression applied; not merely neutral structural shell. |
| **approval_completion** | Founder-approved for the current brand pass (typography, logo placement, voice). |
| **launch_readiness** | Weighted readiness for production launch for that node’s audience (includes backend, CI, secrets, RLS)—**not** derived automatically from functional alone. |

## Canonical progression (per node)

`PLANNED` → `STRUCTURED` → `FUNCTIONAL` → `EXPRESSION_READY` → `AUTHORITY_READY` → `VISUALLY_IMPLEMENTED` → `QA_READY` → `APPROVED` → `LIVE`

A node may be **FUNCTIONAL** while **visual_completion** is low (neutral structural shell allowed in later waves).

## Reporting example (founder format)

```
100% FUNCTIONAL (domain X)
35% VISUALLY IMPLEMENTED
20% APPROVED
62% LAUNCH READY
```

## Baseline (this forensic run)

Evidence-based rollup from `AIO_FAMILY_COMPLETION_MATRIX.json` and `AIO_ROUTE_FORENSIC.json`:

| Axis | Overall % | Denominator |
|------|-----------|-------------|
| Functional | **64%** | 302 material nodes (unique route declarations in core + office, excluding pure layout-only shells) |
| Visual | **38%** | Same 302 nodes; scored against locked brand system adoption, not redesign |
| Approval | **22%** | Same 302 nodes; identity pass locked; page-level approval mostly pending |
| Launch readiness | **45%** | Same 302 nodes; penalized for demo-first paths, missing provider/driver guards, live CI blockers |

Family-level metrics: see `AIO_FAMILY_COMPLETION_MATRIX.json`.

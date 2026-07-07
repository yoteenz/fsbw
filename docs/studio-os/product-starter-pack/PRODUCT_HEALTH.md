# Product Health™

**Version:** 2.0.0  
**Status:** Ratified  
**Role:** Composite product validator — architecture through launch  
**Parent:** [START_HERE.md](./START_HERE.md)

---

## Purpose

**Product Health™** measures holistic product readiness across ten dimensions. It complements:

- **Architecture Validator™** — structural compliance
- **Design Health™** — visual compliance

Product Health is the **executive gate** for launch and quarterly review.

---

## Gate Output

| Result | Meaning | Action |
|--------|---------|--------|
| **PASS** | All critical dimensions ≥ threshold | Launch / promote channel |
| **WARNING** | Non-critical debt or Preview-scope gaps | Preview/Beta only |
| **FAIL** | Critical violation | Blocked |

---

## Scoring Model

**Overall Product Health Score:** 0–100 (weighted composite)

| Dimension | Weight | Critical? | Validator source |
|-----------|--------|-----------|------------------|
| Architecture | 15% | **Yes** | Architecture Validator™ |
| Design | 12% | **Yes** | Design Health™ |
| Performance | 10% | No | Performance budget audit |
| Accessibility | 15% | **Yes** | A11y audit |
| AI | 8% | No | AI Review checklist |
| Security | 12% | **Yes** | Security Review |
| Maintainability | 8% | No | Code/doc review |
| Documentation | 10% | **Yes** | Knowledge Registry™ |
| QA | 5% | No | QA_TEMPLATE completion |
| Scalability | 5% | No | Architecture review |

**PASS:** ≥85 overall · no critical dimension <70  
**WARNING:** 70–84 overall · or non-critical <60  
**FAIL:** <70 overall · or any critical <70 · or accessibility <80

---

## Dimension Rubrics

### Architecture (Critical)

| Score | Criteria |
|-------|----------|
| 90+ | Validator 0 errors · milestones registered · dependencies clean |
| 70–89 | Minor warnings · documented remediation |
| <70 | Validator errors · Foundation mutation · missing module doc |

### Design (Critical)

| Score | Criteria |
|-------|----------|
| 90+ | Design Health™ PASS · catalog compliance |
| 70–89 | Design Health™ WARNING · experimental flagged |
| <70 | Design Health™ FAIL · local design fork |

### Performance

| Score | Criteria |
|-------|----------|
| 90+ | All budgets met · caching active |
| 70–89 | One budget marginal · plan documented |
| <70 | Critical path regression · no budget defined |

### Accessibility (Critical)

| Score | Criteria |
|-------|----------|
| 90+ | WCAG 2.2 AA · keyboard complete · reduced motion |
| 70–89 | Minor issues · remediation scheduled |
| <70 | Critical a11y blockers |

### AI

| Score | Criteria |
|-------|----------|
| 90+ | Boundaries clear · escalation tested · memory scoped |
| 70–89 | Partial adversarial review |
| <70 | Autonomous mutations · no approval boundary |

### Security (Critical)

| Score | Criteria |
|-------|----------|
| 90+ | Auth/authz complete · audit trail · no secrets exposed |
| 70–89 | Minor hardening items |
| <70 | Critical vulnerability · missing authz |

### Maintainability

| Score | Criteria |
|-------|----------|
| 90+ | Clean module boundaries · documented ADRs |
| 70–89 | Some coupling · refactor planned |
| <70 | Core/UI tangled · no documentation |

### Documentation (Critical)

| Score | Criteria |
|-------|----------|
| 90+ | All templates complete · Knowledge Registry indexed |
| 70–89 | Minor doc gaps |
| <70 | Missing module doc · spec incomplete |

### QA

| Score | Criteria |
|-------|----------|
| 90+ | QA_TEMPLATE 100% · regression clean |
| 70–89 | Known issues documented |
| <70 | Untested critical paths |

### Scalability

| Score | Criteria |
|-------|----------|
| 90+ | Horizontal path clear · state bounded |
| 70–89 | Known limits documented |
| <70 | Unbounded state · no caching plan |

---

## Health Report Template

```markdown
# Product Health Report — {Product Name}

**Product ID:** {product-id}
**Date:** {YYYY-MM-DD}
**Maturity:** {level}
**Release Channel:** {channel}

## Summary
| Result | Overall Score |
|--------|---------------|
| PASS / WARNING / FAIL | {0–100} |

## Dimension Scores
| Dimension | Score | Critical | Status |
|-----------|-------|----------|--------|
| Architecture | | Yes | |
| Design | | Yes | |
| Performance | | No | |
| Accessibility | | Yes | |
| AI | | No | |
| Security | | Yes | |
| Maintainability | | No | |
| Documentation | | Yes | |
| QA | | No | |
| Scalability | | No | |

## Critical Failures
- ...

## Remediation Plan
| Item | Owner | Deadline |
|------|-------|----------|
| | | |

## Validator References
- Architecture Validator™: {pass/fail}
- Design Health™: {pass/warning/fail}
```

---

## Execution Cadence

| When | Scope |
|------|-------|
| Pre-implementation | Architecture + Design preview |
| Pre-launch | Full composite |
| Channel promotion | Full composite · must PASS for Stable |
| Quarterly | Mature products |
| Post-incident | Affected dimensions only |

---

## AI Execution (Future)

Product Health™ is designed for eventual AI execution:

```
Input:  product spec · module doc · validator reports · QA checklist
Output: dimension scores · PASS/WARNING/FAIL · remediation list
Gate:   blocks LAUNCH_CHECKLIST completion on FAIL
```

---

## Relationship to Other Validators

```
Architecture Validator™ ──→ Architecture dimension
Design Health™          ──→ Design dimension
Accessibility audit     ──→ Accessibility dimension
Security review         ──→ Security dimension
QA_TEMPLATE             ──→ QA dimension
                              ↓
                    Product Health™ (composite)
                              ↓
                    Definition of Done
```

---

## Cross-References

| Artifact | Path |
|----------|------|
| Architecture Validator™ | `scripts/architecture-validator.mjs` |
| Design Health™ | `docs/studio-os/design/DESIGN_HEALTH.md` |
| Definition of Done | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) |
| Product Maturity™ | [PRODUCT_MATURITY.md](./PRODUCT_MATURITY.md) |
| Studio Constitution™ | `docs/studio-os/master-spec/constitution.yaml` |

---

*Product Health™ — one score · ten dimensions · launch with confidence.*

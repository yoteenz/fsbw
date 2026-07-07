# Definition of Done — Studio OS Product

**Version:** 2.0.0  
**Status:** Ratified  
**Authority:** Official completion criteria for every Studio OS product  
**Parent:** [START_HERE.md](./START_HERE.md)

---

## Official Statement

> A Studio OS product is **complete** only when every gate below passes.  
> Partial completion is not launchable on Stable. Preview/Beta may proceed with documented WARNING gates.

---

## Gate Matrix

| # | Gate | Validator / Source | Required result |
|---|------|-------------------|-----------------|
| 1 | **Architecture PASS** | Architecture Validator™ | 0 errors |
| 2 | **Design PASS** | Design Health™ | PASS (Stable) · PASS/WARNING (Preview) |
| 3 | **Accessibility PASS** | A11y audit | WCAG 2.2 AA · no critical |
| 4 | **QA PASS** | QA_TEMPLATE.md | Signed off · no critical defects |
| 5 | **Performance PASS** | Performance budgets | Budgets met or documented exception |
| 6 | **Security PASS** | Security Review | PASS · no critical vulnerabilities |
| 7 | **Documentation PASS** | Knowledge Registry™ | All required docs · module indexed |
| 8 | **Governance Registered** | System Registry™ | Product entry live |
| 9 | **Master Specification Updated** | product-roadmap.yaml · milestones | Current |
| 10 | **Knowledge Registry Updated** | M126 index | Module doc searchable |
| 11 | **Design Registry Updated** | DESIGN_REGISTRY.md | Compliance row |
| 12 | **Release Approved** | Founder + channel gate | Written approval |

**Composite:** [Product Health™](./PRODUCT_HEALTH.md) must be **PASS** for Stable launch.

---

## 1. Architecture PASS

```
□ Master Spec milestone registered (if new module)
□ Architecture Validator™ — 0 errors on compile
□ node scripts/compile-master-spec.mjs — success
□ manifest-bundle.json includes product metadata
□ No Foundation v1.1 baseline mutation
□ Release Channel eligibility implemented
□ Dependency graph — no unresolved hard deps
□ Module doc exists: docs/studio-os/{product-id}.md
```

**Reference:** [Studio Constitution™](../master-spec/constitution.yaml) · registry-driven objects

---

## 2. Design PASS

```
□ designCompliance block in product README
□ COMPONENT_USAGE_MAP.md complete
□ All UI maps to comp-* catalog (or approved experimental)
□ Design Health™ score ≥85 (PASS) or ≥70 (Preview WARNING)
□ No critical design dimension <70
□ Accessibility dimension ≥80
□ No unregistered duplicate components
□ VDR filed for any intentional deviations
□ Design Registry version declared
```

**Reference:** [Design Governance](../design/) · [Design Health™](../design/DESIGN_HEALTH.md)

---

## 3. Accessibility PASS

```
□ Keyboard navigation — all P0 flows
□ Focus visible on all interactive elements
□ Color contrast WCAG 2.2 AA minimum
□ Screen reader labels on icon-only controls
□ prefers-reduced-motion respected
□ Touch targets ≥44px mobile
□ Accessibility Review PASS (Review Board)
```

---

## 4. QA PASS

```
□ QA_TEMPLATE.md — 100% P0 checks
□ Unit/integration tests for core logic (where applicable)
□ Manual QA checklist signed off
□ Visual regression (flagship products)
□ AI adversarial review (if AI surfaces)
□ Conversation + voice testing (if applicable)
□ No open critical or major defects
□ Regression Engine™ spot-check
```

---

## 5. Performance PASS

```
□ LCP <2.5s (or documented exception)
□ INP <200ms
□ CLS <0.1
□ Product bundle within budget
□ Canvas/editor 60fps (if applicable)
□ Caching strategy active
□ Performance Review PASS (Review Board)
```

---

## 6. Security PASS

```
□ Authentication flow verified
□ Authorization per object/screen
□ No secrets in client storage
□ Audit trail for sensitive operations
□ Security Review PASS (Review Board)
□ Data retention per DATA_MODEL.md
```

---

## 7. Documentation PASS

```
□ All PRODUCT_CREATION_CHECKLIST spec items complete
□ docs/studio-os/{module-id}.md exists and current
□ Product README accurate
□ SUCCESS_METRICS.md defined
□ IMPLEMENTATION_PLAN.md archived
□ QA_PLAN.md signed off
```

**Reference:** [Knowledge Registry™](../knowledge-registry.md)

---

## 8. Governance Registered

```
□ System Registry™ (M127) — product entry live
□ product-roadmap.yaml — maturity = production
□ Release Channel assignment recorded
□ Product Review Board record filed
```

---

## 9. Master Specification Updated

```
□ Milestone status: in-progress → complete (where applicable)
□ product-roadmap.yaml lifecycle current
□ New chapters/milestones added via governed process (if needed)
□ compile-master-spec.mjs passes
```

**Reference:** [Master Specification™](../master-spec/MASTER_SPEC_INDEX.md)

---

## 10. Knowledge Registry Updated

```
□ Module documentation indexed
□ Global search discovers product module
□ Cross-links to related systems
□ Academy sync queued (if applicable)
```

**Reference:** [Knowledge Registry™](../knowledge-registry.md) (M126)

---

## 11. Design Registry Updated

```
□ Compliance row in DESIGN_REGISTRY.md
□ Component usage versions match catalog
□ Experimental components flagged
□ VDR references listed in designCompliance
```

**Reference:** [Design Registry™](../design/DESIGN_REGISTRY.md)

---

## 12. Release Approved

```
□ LAUNCH_CHECKLIST.md 100%
□ Founder launch approval recorded
□ Release notes published
□ Rollback tested
□ Monitoring active
□ Support runbook ready
```

---

## Done Statement Template

```markdown
# Product Done — {Product Name}

**Product ID:** {product-id}
**Version:** {semver}
**Launch Date:** {YYYY-MM-DD}
**Release Channel:** {channel}

| Gate | Status | Date | Validator |
|------|--------|------|-----------|
| Architecture PASS | ✅ | | Architecture Validator™ |
| Design PASS | ✅ | | Design Health™ |
| Accessibility PASS | ✅ | | A11y audit |
| QA PASS | ✅ | | QA sign-off |
| Performance PASS | ✅ | | Budget audit |
| Security PASS | ✅ | | Security Review |
| Documentation PASS | ✅ | | Knowledge Registry™ |
| Governance Registered | ✅ | | System Registry™ |
| Master Spec Updated | ✅ | | compile pass |
| Knowledge Registry Updated | ✅ | | M126 |
| Design Registry Updated | ✅ | | v{version} |
| Release Approved | ✅ | | Founder |

**Product Health™:** PASS — Score {n}/100
**Approved by:** {name}
```

---

## Channel-Specific Rules

| Channel | Minimum gates |
|---------|---------------|
| **Preview** | Architecture 0 errors · Design WARNING OK · Founder approval |
| **Beta** | All gates PASS except known documented debt |
| **Stable** | All 12 gates PASS · Product Health™ PASS |

---

## Not Done (Common Failures)

| Failure | Gate blocked | Resolution |
|---------|--------------|------------|
| Local button component | Design | Replace with `comp-buttons` |
| Missing module doc | Documentation · Architecture | Create `docs/studio-os/{id}.md` |
| Design Health FAIL | Design | Fix hierarchy/accessibility |
| Spec without governance ref | Design | Add designCompliance |
| Experimental on Stable | Release | Channel downgrade or VDR ratify |
| Skipped Review Board | Release | Complete 9 reviews |
| No Founder Approval | Implementation · Launch | Obtain written approval |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Product Health™ | [PRODUCT_HEALTH.md](./PRODUCT_HEALTH.md) |
| Launch Checklist | [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) |
| Product Review Board | [PRODUCT_REVIEW_BOARD.md](./PRODUCT_REVIEW_BOARD.md) |
| Studio Constitution™ | `docs/studio-os/master-spec/constitution.yaml` |
| Design Governance™ | `docs/studio-os/design/` |
| Knowledge Registry™ | `docs/studio-os/knowledge-registry.md` |

---

*Definition of Done — twelve gates · one standard · ship with confidence.*

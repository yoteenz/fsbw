# Definition of Done — Studio OS Product

**Parent:** [Studio Product Starter Pack™](./README.md)

---

## Official Completion Criteria

A Studio OS product is **done** when all gates pass:

---

## Gate Matrix

| Gate | Validator | Required result |
|------|-----------|-----------------|
| **Architecture PASS** | Architecture Validator™ | 0 errors · channel-appropriate warnings |
| **Design PASS** | Design Health™ | PASS (Stable) or PASS/WARNING (Preview) |
| **Accessibility PASS** | Accessibility audit | WCAG 2.2 AA · no critical issues |
| **QA PASS** | QA Engine™ + product tests | Release Channel checklist |
| **Documentation PASS** | Knowledge Registry™ | Module doc · spec complete · registry entries |
| **Launch Ready** | Release Readiness™ | Channel gate · executive sign-off |

---

## Architecture PASS

```
□ Master Spec milestone registered (if new module)
□ Architecture Validator™ 0 errors on compile
□ No unresolved dependency warnings (complete modules)
□ manifest-bundle.json includes product metadata
□ No Foundation baseline mutation
□ Release Channel eligibility implemented
```

---

## Design PASS

```
□ designCompliance block in product README
□ Component Usage Map complete
□ All UI maps to comp-* catalog (or approved experimental)
□ Design Health™ score ≥85 (PASS) or ≥70 (Preview WARNING)
□ No critical dimension <70
□ Accessibility dimension ≥80
□ No unregistered duplicate components
□ VDR filed for any intentional deviations
```

---

## Accessibility PASS

```
□ Keyboard navigation complete
□ Focus visible on all interactive elements
□ Color contrast AA minimum
□ Screen reader labels on icon-only controls
□ Reduced motion respected
□ Touch targets ≥44px mobile
```

---

## QA PASS

```
□ Unit/integration tests for core logic (where applicable)
□ Manual QA checklist complete
□ Visual regression (flagship products)
□ AI flow adversarial review (if AI surfaces)
□ Regression Engine™ spot-check
□ No Release Channel violations
```

---

## Documentation PASS

```
□ All Required Documentation Checklist items complete
□ docs/studio-os/{module-id}.md exists
□ product README current
□ COMPONENT_USAGE_MAP.md accurate
□ SUCCESS_METRICS.md defined
□ product-roadmap.yaml lifecycle updated
```

---

## Launch Ready

```
□ Release Channel assignment confirmed
□ System Registry™ entry live
□ Knowledge Registry™ indexed
□ Launch Report drafted
□ Success metrics instrumentation planned
□ Handoff to governance phase documented
□ Executive approval recorded
```

---

## Done Statement Template

```markdown
## Product Done — {Product Name}

| Gate | Status | Date |
|------|--------|------|
| Architecture PASS | ✅ | |
| Design PASS | ✅ | |
| Accessibility PASS | ✅ | |
| QA PASS | ✅ | |
| Documentation PASS | ✅ | |
| Launch Ready | ✅ | |

Release Channel: {channel}
Registry: Design {version} · Product {version}
Approved by: {name}
```

---

## Not Done (Common Failures)

| Failure | Resolution |
|---------|------------|
| Local button component | Replace with `comp-buttons` |
| Missing module doc | Generate per Architecture Validator |
| Design Health FAIL | Fix hierarchy/accessibility first |
| Spec without governance ref | Add designCompliance |
| Experimental on Stable | Channel downgrade or ratify component |

---

*Definition of Done — six gates · one standard · ship with confidence.*

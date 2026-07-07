# QA Plan — {Product Name}

**Product ID:** `{product-id}`  
**Version:** 0.1.0  
**Release Channel:** preview | beta | stable  
**Owner:** {name}  
**Date:** {YYYY-MM-DD}

---

> Copy to `docs/studio-os/products/{product-id}/QA_PLAN.md`  
> Complete before launch. Feeds [Product Health™](./PRODUCT_HEALTH.md).

---

## QA Overview

| Field | Value |
|-------|-------|
| Product maturity | 🧪 QA |
| Target channel | |
| QA lead | |
| Target launch date | |

---

## 1. Architecture Validation

| Check | Command / Tool | Pass criteria | Status |
|-------|----------------|---------------|--------|
| Compile | `node scripts/compile-master-spec.mjs` | 0 errors | ☐ |
| Validator | Architecture Validator™ | 0 errors | ☐ |
| Module doc | `docs/studio-os/{product-id}.md` | Exists · indexed | ☐ |
| Milestone status | `milestones/*.yaml` | Updated | ☐ |
| Dependency graph | No new cycles | Clean | ☐ |

---

## 2. Design Validation

| Check | Tool | Pass criteria | Status |
|-------|------|---------------|--------|
| Design Health™ | Manual / future script | PASS (Stable) or WARNING (Preview) | ☐ |
| Component compliance | COMPONENT_USAGE_MAP | All `comp-*` | ☐ |
| No local design fork | Code review | No custom chrome | ☐ |
| Glass consistency | Visual review | Matches Design Language | ☐ |
| Motion consistency | Visual review | Reduced motion respected | ☐ |

---

## 3. Accessibility

| Check | Standard | Status |
|-------|----------|--------|
| Keyboard navigation | All P0 flows | ☐ |
| Focus visible | All interactive | ☐ |
| Color contrast | WCAG 2.2 AA | ☐ |
| Screen reader | Icon labels · landmarks | ☐ |
| Reduced motion | `prefers-reduced-motion` | ☐ |
| Touch targets | ≥44px mobile | ☐ |
| axe / Lighthouse a11y | Score ≥90 | ☐ |

---

## 4. Performance

| Budget | Target | Actual | Status |
|--------|--------|--------|--------|
| LCP | <2.5s | | ☐ |
| INP | <200ms | | ☐ |
| CLS | <0.1 | | ☐ |
| Product bundle | <{n}kb | | ☐ |
| Canvas FPS | 60 | | ☐ |

---

## 5. Regression

| Area | Test type | Status |
|------|-----------|--------|
| Studio Orb integration | Manual | ☐ |
| HQ navigation | Manual | ☐ |
| Auth session | Manual | ☐ |
| Existing modules | Spot-check | ☐ |
| Regression Engine™ | Automated | ☐ |

---

## 6. Cross-Device

| Device | OS | Browser | Status |
|--------|-----|---------|--------|
| Desktop | macOS | Chrome | ☐ |
| Desktop | Windows | Edge | ☐ |
| Tablet | iPadOS | Safari | ☐ |
| Mobile | iOS | Safari | ☐ |
| Mobile | Android | Chrome | ☐ |

---

## 7. Cross-Browser

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | latest | ☐ |
| Safari | latest | ☐ |
| Firefox | latest | ☐ |
| Edge | latest | ☐ |

---

## 8. Conversation Testing

| Scenario | Expected | Status |
|----------|----------|--------|
| Happy path dialogue | Proposal → accept | ☐ |
| Rejection flow | Revert clean | ☐ |
| "Why?" explanation | Reasoning shown | ☐ |
| Timeout | Graceful message | ☐ |
| Prompt injection | Blocked | ☐ |
| Turn history | Timeline accurate | ☐ |

---

## 9. Voice Testing (if applicable)

| Scenario | Expected | Status |
|----------|----------|--------|
| Voice activate | Orb radial | ☐ |
| Transcript merge | Chat timeline | ☐ |
| Cancel | Clean stop | ☐ |
| Permission denied | Fallback UI | ☐ |

---

## 10. Launch Readiness

| Gate | Status |
|------|--------|
| Product Health™ PASS | ☐ |
| Definition of Done complete | ☐ |
| LAUNCH_CHECKLIST complete | ☐ |
| Release Channel gate | ☐ |
| Rollback tested | ☐ |
| Support docs ready | ☐ |

---

## Defect Log

| ID | Severity | Description | Status | Owner |
|----|----------|-------------|--------|-------|
| QA-001 | | | open | |

**Severity:** critical · major · minor · cosmetic

**Launch blockers:** critical · major (accessibility · security)

---

## QA Sign-Off

| Role | Name | Date | Result |
|------|------|------|--------|
| QA lead | | | PASS / FAIL |
| Engineering | | | |
| Product | | | |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Product Health™ | [PRODUCT_HEALTH.md](./PRODUCT_HEALTH.md) |
| Design Health™ | `docs/studio-os/design/DESIGN_HEALTH.md` |
| Launch Checklist | [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) |
| Definition of Done | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) |

---

*QA Plan — validate everything · ship once.*

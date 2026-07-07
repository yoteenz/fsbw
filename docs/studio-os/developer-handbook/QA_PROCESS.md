# QA Process — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)

---

## QA Framework Overview

Studio OS quality is enforced through **three validators** and **one composite gate**:

```
Architecture Validator™  ──→  Structural compliance
Design Health™         ──→  Visual compliance
Product Health™        ──→  Composite readiness
        ↓
Definition of Done (12 gates)
        ↓
Release Channel promotion
```

---

## Validation Layers

### 1. Architecture Validation

| Property | Detail |
|----------|--------|
| **Script** | `scripts/architecture-validator.mjs` |
| **Trigger** | `compile-master-spec.mjs` · `npm run build` |
| **Output** | 0 errors required |
| **Report** | `ARCHITECTURE_VALIDATION_REPORT.md` |

**Checks:** Milestone coverage · module docs · registry integrity · dependency graph · Knowledge Registry™ compliance.

### 2. Design Validation

| Property | Detail |
|----------|--------|
| **Rubric** | `design/DESIGN_HEALTH.md` |
| **Output** | PASS · WARNING · FAIL |
| **Score** | 0–100 weighted |
| **Critical dims** | Consistency · typography · hierarchy · accessibility · component duplication |

**When:** Prototype review · pre-launch · quarterly.

### 3. Product Validation

| Property | Detail |
|----------|--------|
| **Rubric** | `product-starter-pack/PRODUCT_HEALTH.md` |
| **Output** | PASS · WARNING · FAIL |
| **Dimensions** | 10 — architecture through scalability |

**When:** Pre-launch · channel promotion · quarterly (mature products).

---

## QA by Category

### Regression

| Scope | Method |
|-------|--------|
| Platform core | Regression Engine™ spot-check |
| Studio Orb integration | Manual per release |
| HQ navigation | Manual per release |
| Product-specific | Unit + E2E (flagship) |
| Visual | Screenshot comparison (flagship) |

### Accessibility

| Check | Standard |
|-------|----------|
| Keyboard navigation | All P0 flows |
| Focus management | Modals · docks · drawers |
| Color contrast | WCAG 2.2 AA |
| Screen reader | Labels · landmarks · live regions |
| Reduced motion | `prefers-reduced-motion` |
| Touch targets | ≥44px mobile |
| Automated | axe · Lighthouse ≥90 |

### Performance

| Budget | Target | Tool |
|--------|--------|------|
| LCP | <2.5s | Lighthouse · RUM |
| INP | <200ms | RUM |
| CLS | <0.1 | Lighthouse |
| Bundle (product) | Per spec | build analyze |
| Canvas FPS | 60 | Profiling |
| AI latency | <3s | Monitoring |

### Security

| Check | When |
|-------|------|
| Auth/authz per object | Pre-launch |
| No secrets in client | Every PR |
| Prompt injection (AI) | Pre-launch adversarial |
| Upload validation | Pre-launch |
| Audit trail | Sensitive operations |
| Dependency audit | Monthly |

### Conversation Testing

| Scenario | Expected |
|----------|----------|
| Happy path | Proposal → accept |
| Rejection | Clean revert |
| "Why?" | Reasoning shown |
| Timeout | Graceful degrade |
| Injection | Blocked |
| Timeline | Accurate history |

### Voice Testing (if applicable)

| Scenario | Expected |
|----------|----------|
| Activate | Orb radial |
| Transcript | Merged to chat |
| Cancel | Clean stop |
| Permission denied | Fallback UI |

---

## QA Workflow

### Per Product

1. Copy [QA_TEMPLATE.md](../product-starter-pack/QA_TEMPLATE.md) → `products/{id}/QA_PLAN.md`
2. Complete checks per phase
3. Log defects with severity
4. QA sign-off before launch

### Defect Severity

| Severity | Launch impact |
|----------|---------------|
| **Critical** | Blocks launch |
| **Major** | Blocks Stable · may ship Preview with documented debt |
| **Minor** | Track · fix in next cycle |
| **Cosmetic** | Track |

---

## Definition of Done (12 Gates)

| # | Gate | Validator |
|---|------|-----------|
| 1 | Architecture PASS | Architecture Validator™ |
| 2 | Design PASS | Design Health™ |
| 3 | Accessibility PASS | A11y audit |
| 4 | QA PASS | QA_TEMPLATE |
| 5 | Performance PASS | Budget audit |
| 6 | Security PASS | Security review |
| 7 | Documentation PASS | Knowledge Registry™ |
| 8 | Governance Registered | System Registry™ |
| 9 | Master Spec Updated | compile pass |
| 10 | Knowledge Registry Updated | M126 index |
| 11 | Design Registry Updated | compliance row |
| 12 | Release Approved | Founder sign-off |

**Detail:** [DEFINITION_OF_DONE.md](../product-starter-pack/DEFINITION_OF_DONE.md)

---

## Channel-Specific QA

| Channel | Minimum |
|---------|---------|
| **Stable** | All 12 gates PASS · Product Health™ PASS |
| **Beta** | All gates PASS · documented minor debt OK |
| **Preview** | Architecture 0 errors · Design WARNING OK · Founder approval |
| **Experimental** | Internal QA · no Stable promotion path |

---

## QA Roles

| Role | Responsibility |
|------|----------------|
| **QA lead** | QA_PLAN ownership · sign-off |
| **Engineering** | Fix defects · unit tests |
| **Design governance** | Design Health™ review |
| **Accessibility owner** | A11y audit |
| **Security** | Threat model · pen test |
| **Product** | Acceptance · success metrics |

---

## Automation Roadmap

| Validator | Status | Target |
|-----------|--------|--------|
| Architecture Validator™ | ✅ Executable | CI on every build |
| Design Health™ | 📋 Rubric only | `scripts/design-health-validator.mjs` |
| Product Health™ | 📋 Rubric only | `scripts/product-health-validator.mjs` |
| Visual regression | Partial | Flagship products |
| A11y | Manual + axe | CI integration |

---

## Cross-References

| Document | Path |
|----------|------|
| QA Template | `product-starter-pack/QA_TEMPLATE.md` |
| Launch Checklist | `product-starter-pack/LAUNCH_CHECKLIST.md` |
| Release Process | [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) |
| Design Health™ | `design/DESIGN_HEALTH.md` |
| Product Health™ | `product-starter-pack/PRODUCT_HEALTH.md` |

---

*QA Process — validate everything · ship with confidence.*

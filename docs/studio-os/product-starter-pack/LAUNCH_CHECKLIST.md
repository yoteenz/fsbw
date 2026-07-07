# Launch Checklist — {Product Name}

**Product ID:** `{product-id}`  
**Target Channel:** preview | beta | stable  
**Launch Date:** {YYYY-MM-DD}  
**Owner:** {name}

---

> Copy to `docs/studio-os/products/{product-id}/LAUNCH_CHECKLIST.md`  
> All sections must pass before Release Channel promotion.

---

## Pre-Launch Summary

| Field | Value |
|-------|-------|
| Version | {semver} |
| Design Registry | {version} |
| Foundation | v1.1 |
| Product Health™ | PASS / WARNING / FAIL |
| Founder launch approval | ☐ |

---

## 1. Documentation

| Item | Path | Status |
|------|------|--------|
| Product README current | `products/{id}/README.md` | ☐ |
| Experience spec complete | | ☐ |
| Module doc indexed | `docs/studio-os/{id}.md` | ☐ |
| COMPONENT_USAGE_MAP accurate | | ☐ |
| SUCCESS_METRICS defined | | ☐ |
| IMPLEMENTATION_PLAN archived | | ☐ |
| QA_PLAN signed off | | ☐ |

---

## 2. Architecture

| Item | Status |
|------|--------|
| Architecture Validator™ 0 errors | ☐ |
| Master Spec milestones updated | ☐ |
| `product-roadmap.yaml` → live | ☐ |
| `manifest-bundle.json` includes product | ☐ |
| No Foundation baseline mutation | ☐ |
| Dependency graph clean | ☐ |

---

## 3. Design

| Item | Status |
|------|--------|
| designCompliance block current | ☐ |
| Design Health™ PASS (or WARNING for Preview) | ☐ |
| Design Registry compliance row added | ☐ |
| No unregistered components on Stable | ☐ |
| Visual regression (flagship) | ☐ |

---

## 4. QA

| Item | Status |
|------|--------|
| QA_TEMPLATE 100% P0 | ☐ |
| No open critical defects | ☐ |
| Regression spot-check | ☐ |
| Cross-device P0 flows | ☐ |

---

## 5. Accessibility

| Item | Status |
|------|--------|
| WCAG 2.2 AA audit complete | ☐ |
| Keyboard flows verified | ☐ |
| Reduced motion verified | ☐ |
| Accessibility Review PASS | ☐ |

---

## 6. Security

| Item | Status |
|------|--------|
| Security Review PASS | ☐ |
| Auth/authz tested | ☐ |
| No secrets in client | ☐ |
| Audit trail for sensitive ops | ☐ |

---

## 7. Analytics

| Item | Status |
|------|--------|
| North star instrumented | ☐ |
| Success metrics events defined | ☐ |
| Funnel tracking active | ☐ |
| Error tracking configured | ☐ |

---

## 8. Monitoring

| Item | Status |
|------|--------|
| Error alerting | ☐ |
| Performance RUM | ☐ |
| AI latency monitoring (if applicable) | ☐ |
| Uptime check | ☐ |

---

## 9. Release Notes

| Item | Status |
|------|--------|
| User-facing release notes drafted | ☐ |
| Internal changelog | ☐ |
| Known limitations documented | ☐ |
| Channel eligibility documented | ☐ |

---

## 10. Support

| Item | Status |
|------|--------|
| Support runbook | ☐ |
| FAQ / troubleshooting | ☐ |
| Escalation path | ☐ |

---

## 11. Training

| Item | Status |
|------|--------|
| Internal demo recorded | ☐ |
| Onboarding guide for org admins | ☐ |
| Academy lesson queued (if applicable) | ☐ |

---

## 12. Rollback

| Item | Status |
|------|--------|
| Feature flag kill switch tested | ☐ |
| Rollback procedure documented | ☐ |
| Data backup verified | ☐ |
| Communication template ready | ☐ |

---

## Registry Registration

| Registry | Action | Status |
|----------|--------|--------|
| **System Registry™** (M127) | Product entry live | ☐ |
| **Knowledge Registry™** (M126) | Module indexed | ☐ |
| **Design Registry™** | Compliance row | ☐ |
| **product-roadmap.yaml** | maturity → production | ☐ |

---

## Launch Approval

| Approver | Role | Date | Approved |
|----------|------|------|----------|
| | Founder | | ☐ |
| | Engineering | | ☐ |
| | QA | | ☐ |

---

## Post-Launch (Day 1 / Week 1)

| Action | Owner | Due |
|--------|-------|-----|
| Monitor error rates | | Day 1 |
| Success metrics baseline | | Day 7 |
| Schedule Lessons Learned | | Day 30 |
| Product Maturity → Production | | Day 1 |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Definition of Done | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) |
| Product Health™ | [PRODUCT_HEALTH.md](./PRODUCT_HEALTH.md) |
| Knowledge Registry™ | `docs/studio-os/knowledge-registry.md` |
| System Registry™ | `docs/studio-os/system-registry.md` |

---

*Launch Checklist — nothing ships until everything passes.*

# Implementation Plan — {Product Name}

**Product ID:** `{product-id}`  
**Version:** 0.1.0  
**Status:** Draft | Approved  
**Owner:** {name}  
**Date:** {YYYY-MM-DD}  
**Founder Approval:** {date or pending}

---

> Copy to `docs/studio-os/products/{product-id}/IMPLEMENTATION_PLAN.md`  
> **Do not begin until Founder Approval recorded.**

---

## Prerequisites

| Prerequisite | Status |
|--------------|--------|
| Product Review Board — all reviews PASS | ☐ |
| Founder Approval | ☐ |
| Design Registry version declared | ☐ |
| Release Channel assigned | ☐ |

---

## Engineering Phases

### Phase 1: Foundation ({duration})

| Deliverable | Path | Validation |
|-------------|------|------------|
| Core module scaffold | `studio-os-core/{product-id}/` | types compile |
| Shell route | `pages/admin/studio/{product-id}/` | route loads |
| Module doc | `docs/studio-os/{product-id}.md` | Validator |

**Exit:** Architecture Validator™ 0 errors

### Phase 2: Core Experience ({duration})

| Deliverable | Component IDs |
|-------------|---------------|
| Workspace | `comp-canvas`, `comp-workspace-panel` |
| Director integration | `comp-ai-chat` |
| | |

**Exit:** P0 screens functional · Design Health preview ≥70

### Phase 3: Intelligence ({duration})

| Deliverable | Dependency |
|-------------|------------|
| AI flows | Conversation Engine™ |
| Command integration | Command palette |

### Phase 4: Polish & QA ({duration})

| Deliverable | Gate |
|-------------|------|
| Accessibility pass | WCAG 2.2 AA |
| Performance budgets | LCP · INP |
| QA_TEMPLATE complete | Product Health™ |

### Phase 5: Launch ({duration})

| Deliverable | Gate |
|-------------|------|
| LAUNCH_CHECKLIST | Definition of Done |
| Registry registration | System + Knowledge |

---

## Dependencies

| Phase | Depends on | Blocker if missing |
|-------|------------|-------------------|
| 2 | 1 | Core types |
| 3 | 2 | Workspace shell |
| 4 | 3 | Feature complete |

### External Dependencies

| Dependency | Owner | ETA |
|------------|-------|-----|
| | | |

---

## Feature Flags

| Flag | Phase introduced | Default | Remove when |
|------|------------------|---------|-------------|
| `{product}_preview` | 1 | org opt-in | Stable launch |
| | | | |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep | medium | high | Out of scope doc |
| Design debt | low | medium | Catalog-only rule |
| AI latency | medium | medium | Graceful degrade |
| | | | |

---

## Rollback

| Scenario | Rollback action | Data impact |
|----------|-----------------|-------------|
| Critical bug post-launch | Feature flag off | None |
| Bad migration | Restore backup | Draft loss possible |
| Channel demotion | Preview only | Users notified |

### Rollback Checklist

- [ ] Feature flag identified
- [ ] Data migration reversible
- [ ] Communication template ready
- [ ] Registry status update path

---

## Migration

| From | To | Strategy | Downtime |
|------|-----|----------|----------|
| Experience Studio™ | Website Builder™ | Parallel · opt-in | none |

---

## Milestones

| Milestone | Target date | Owner | Status |
|-----------|-------------|-------|--------|
| Phase 1 complete | | | |
| Prototype parity | | | |
| Beta ready | | | |
| Launch | | | |

---

## Validation per Phase

| Phase | Architecture Validator™ | Design Health™ | Manual QA |
|-------|------------------------|----------------|-----------|
| 1 | required | — | smoke |
| 2 | required | preview | core flows |
| 3 | required | preview | AI adversarial |
| 4 | required | PASS target | full QA_TEMPLATE |
| 5 | required | PASS | launch checklist |

---

## Team & Ownership

| Role | Name | Responsibility |
|------|------|----------------|
| Product owner | | Vision · approval |
| Engineering lead | | Implementation |
| Design governance | | Catalog compliance |

---

## Approval

| Item | Status | Approver | Date |
|------|--------|----------|------|
| Phases sequenced | ☐ | | |
| Risks documented | ☐ | | |
| Rollback plan | ☐ | | |
| Engineering Review ready | ☐ | | |
| Founder Approval | ☐ | | |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Technical Architecture | [TECHNICAL_ARCHITECTURE_TEMPLATE.md](./TECHNICAL_ARCHITECTURE_TEMPLATE.md) |
| Definition of Done | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) |
| Product Review Board | [PRODUCT_REVIEW_BOARD.md](./PRODUCT_REVIEW_BOARD.md) |

---

*Implementation Plan — phased · validated · reversible.*

# Product Maturity™

**Version:** 2.0.0  
**Status:** Ratified  
**Parent:** [START_HERE.md](./START_HERE.md)

---

## Purpose

Every Studio OS product receives a **maturity level** — tracked from concept through platform service. Maturity drives expectations, review frequency, and registry status.

---

## Maturity Levels

| Level | Symbol | Definition | Typical duration |
|-------|--------|------------|------------------|
| **Concept** | 🌱 | Idea approved · OS thesis alignment | Days |
| **Discovery** | 🌿 | Research + Product Vision complete | 1–2 weeks |
| **Architecture** | 🌳 | Technical scope · milestone map defined | 1 week |
| **Prototype** | 🏗 | Experience prototype approved | 1–3 weeks |
| **Development** | ⚙ | Implementation in progress | Weeks–months |
| **QA** | 🧪 | Quality gates active · pre-launch | 1–2 weeks |
| **Production** | 🚀 | Launched on Release Channel | Ongoing |
| **Mature** | ⭐ | Stable · metrics met · low debt | 3+ months post-launch |
| **Platform Service** | 🏛 | Core OS dependency · other products rely on it | Long-term |

---

## Level Criteria

### 🌱 Concept

- [ ] Entry in `product-roadmap.yaml`
- [ ] One-page concept note
- [ ] Executive approval to proceed

### 🌿 Discovery

- [ ] UX_DISCOVERY_TEMPLATE complete
- [ ] PRODUCT_VISION_TEMPLATE complete
- [ ] Competitive differentiation documented

### 🌳 Architecture

- [ ] TECHNICAL_ARCHITECTURE scoped
- [ ] Master Spec milestone map
- [ ] Release Channel identified
- [ ] designCompliance declared

### 🏗 Prototype

- [ ] Full product specification
- [ ] Experience prototype approved
- [ ] Product Review Board pre-implementation reviews PASS
- [ ] Founder Approval recorded

### ⚙ Development

- [ ] Implementation plan active
- [ ] Architecture Validator™ passing
- [ ] Module documentation started

### 🧪 QA

- [ ] Feature complete for channel scope
- [ ] QA_TEMPLATE in progress
- [ ] Design Health™ ≥70 (Preview) or ≥85 (Stable target)

### 🚀 Production

- [ ] LAUNCH_CHECKLIST complete
- [ ] Definition of Done — all gates PASS
- [ ] System Registry™ + Knowledge Registry™ registered
- [ ] Release Channel live

### ⭐ Mature

- [ ] Product Health™ PASS for 2 consecutive quarters
- [ ] Success metrics on track
- [ ] No critical design or architecture debt
- [ ] Lessons Learned documented

### 🏛 Platform Service

- [ ] Other products declare dependency
- [ ] SLA or compatibility contract documented
- [ ] Breaking changes require DR + migration window
- [ ] Owned by platform team

---

## Maturity Record Template

```markdown
# Product Maturity — {Product Name}

**Product ID:** {product-id}
**Current Level:** {symbol} {name}
**As of:** {YYYY-MM-DD}

## Current State
| Field | Value |
|-------|-------|
| Release Channel | preview / beta / stable |
| Design Registry | {version} |
| Product Health | PASS / WARNING / FAIL |
| Owner | {name} |

## Next Milestone
- Target level: {symbol} {name}
- Target date: {YYYY-MM-DD}
- Blockers: {list}

## Remaining Risks
| Risk | Severity | Mitigation |
|------|----------|------------|
| | | |

## Technical Debt
| Item | Priority | VDR/DR |
|------|----------|--------|
| | | |

## Future Opportunities
- ...
```

---

## Promotion Rules

| From → To | Requires |
|-----------|----------|
| Concept → Discovery | Executive approval |
| Discovery → Architecture | Vision approval |
| Architecture → Prototype | Spec complete · governance declared |
| Prototype → Development | **Founder Approval** |
| Development → QA | Feature complete for scope |
| QA → Production | Definition of Done PASS |
| Production → Mature | 90 days + Product Health PASS |
| Mature → Platform Service | Dependency declaration + executive approval |

**Demotion:** Product may demote on critical security issue · Foundation violation · or channel rollback.

---

## Registry Integration

Update `master-spec/product-roadmap.yaml`:

```yaml
products:
  - id: {product-id}
    maturity: concept | discovery | architecture | prototype | development | qa | production | mature | platform-service
    releaseChannel: preview | beta | stable
    updatedAt: '{ISO date}'
```

---

## Review Cadence by Maturity

| Level | Review frequency |
|-------|------------------|
| Concept–Prototype | Weekly |
| Development | Bi-weekly |
| QA | Daily gate checks |
| Production | Monthly health |
| Mature | Quarterly Product Health™ |
| Platform Service | Monthly compatibility |

---

## Example Products (Target Maturity)

| Product | Current | Target |
|---------|---------|--------|
| Studio Orb™ / Voice | ⭐ Mature | 🏛 Platform Service |
| Website Builder™ | 🌳 Architecture | 🚀 Production |
| Campaign Engine™ | 🌱 Concept | — |
| Relationship Intelligence™ | 🌱 Concept | — |
| Knowledge Graph™ | 🌱 Concept | — |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Product Roadmap | `docs/studio-os/master-spec/product-roadmap.yaml` |
| Product Health™ | [PRODUCT_HEALTH.md](./PRODUCT_HEALTH.md) |
| Definition of Done | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) |
| Product Lifecycle | [START_HERE.md](./START_HERE.md) |

---

*Product Maturity™ — know where every product stands · know what comes next.*

# Studio Website Builder™ — Product Specification Package

**Product ID:** `website-builder`  
**Flagship:** Yes — primary demonstration of Studio OS philosophy  
**Phase:** Product Vision & Experience Design (pre-implementation)  
**Status:** ⏳ Awaiting approval before code  
**Date:** 2026-07-07

---

## Design Governance Compliance

```yaml
designCompliance:
  registryVersion: "1.0.0"
  inherits:
    - docs/studio-os/design/STUDIO_DESIGN_CONSTITUTION.md
    - docs/studio-os/design/DESIGN_LANGUAGE_SYSTEM.md
    - docs/studio-os/design/COMPONENT_CATALOG.md
  validates: docs/studio-os/design/DESIGN_HEALTH.md
  note: >
    §6 of WEBSITE_BUILDER_EXPERIENCE_SPEC.md describes composition and
    product atmosphere — not a parallel design system. Global visual rules
    defer to Design Governance.
```

**Starter Pack:** [product-starter-pack v2.0.0](../../product-starter-pack/START_HERE.md) · [PRODUCT_CREATION_CHECKLIST](../../product-starter-pack/PRODUCT_CREATION_CHECKLIST.md)

---

## Approval Gate

Implementation **must not begin** until this package is reviewed and approved.

| # | Deliverable | Document section |
|---|-------------|------------------|
| 1 | Product Vision | §1 |
| 2 | UX Journey | §2 |
| 3 | Complete Information Architecture | §3 |
| 4 | Screen Map | §4 |
| 5 | Component Inventory | §5 |
| 6 | Design Language | §6 |
| 7 | Interaction Model | §7 |
| 8 | Motion System | §8 |
| 9 | AI Collaboration Flow | §9 |
| 10 | Technical Architecture | §10 |

**Full specification:** [`WEBSITE_BUILDER_EXPERIENCE_SPEC.md`](./WEBSITE_BUILDER_EXPERIENCE_SPEC.md)

---

## Strategic Context

| Property | Value |
|----------|-------|
| Priority | **P2 Phase 0 Golden Product** — Reference Implementation for Studio OS |
| Relationship | Website Builder™ is a **publish specialization** for Website experience type — inherits this Reference Implementation |
| Precedes | Website publish pipeline · Campaign Engine™ · Publishing Studio™ |
| Release Channel | Preview (organization opt-in) |
| Evolves from | Experience Studio™ UI + Digital Architect™ core |
| Does NOT resemble | WordPress · Wix · Squarespace · Shopify · Webflow |

**Design synthesis:** Claude Design · Framer · Figma · Linear · Apple HIG · Notion AI — unified into one Studio OS experience.

---

## Product Lifecycle Position

```
✅ 1. Idea & Research         — P2 Phase 1 flagship
✅ 2. Architecture alignment  — Experience Architecture · Digital Architect
✅ 3. Design Governance       — Inherits design/ v1.0.0
✅ 4. Product Specification   — THIS PACKAGE (§1–§10)
⏳ 5. Experience Prototype    — After spec approval · catalog components only
⏳ 6. Technical Architecture  — §10 implementation after approval
⏳ 7. Master Spec additions   — Minimal delta on approval
⏳ 8. Implementation
⏳ 9. QA (Design Health™ + Architecture Validator™)
⏳ 10. Launch
⏳ 11. Governance registration
```

---

## Related Artifacts

| Artifact | Path |
|----------|------|
| Design Governance | `docs/studio-os/design/` |
| Component Catalog | `docs/studio-os/design/COMPONENT_CATALOG.md` |
| Product Starter Pack | `docs/studio-os/product-starter-pack/` |
| Product Phase Charter | `docs/studio-os/PRODUCT_PHASE_CHARTER.md` |
| Product Roadmap | `docs/studio-os/master-spec/product-roadmap.yaml` |
| Experience Studio (current) | `src/components/admin/studio/experience-studio/` |
| Digital Architect core | `src/studio-os-core/digital-architect/` |
| Experience Architecture | `docs/studio-os/master-spec/experience-architecture.yaml` |

---

**Next step after approval:** Experience Prototype → governed Master Spec delta → implementation sprint.

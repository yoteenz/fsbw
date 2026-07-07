# Studio OS Design Governance™

**Permanent visual source of truth for every Studio OS product.**

| Property | Value |
|----------|-------|
| Package | `docs/studio-os/design/` |
| Authority | Studio Design Constitution™ |
| Registry | Design Registry™ |
| Validator | Design Health™ |
| Status | Active · Pre-implementation governance |
| Foundation | Architecture v1.1 frozen — design layer additive |

---

## Purpose

Products **inherit** design. They never own it.

When Studio OS visual language evolves, update **one governance layer** — every future product inherits automatically.

---

## Document Index

| # | Document | Role |
|---|----------|------|
| 1 | [STUDIO_DESIGN_CONSTITUTION.md](./STUDIO_DESIGN_CONSTITUTION.md) | Governing document — no product may override |
| 2 | [DESIGN_LANGUAGE_SYSTEM.md](./DESIGN_LANGUAGE_SYSTEM.md) | Permanent principles — survives complete redesigns |
| 3 | [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) | Canonical reusable component library |
| 4 | [DESIGN_REGISTRY.md](./DESIGN_REGISTRY.md) | Visual source of truth · versions · compatibility |
| 5 | [DESIGN_REVISION_FRAMEWORK.md](./DESIGN_REVISION_FRAMEWORK.md) | Governed visual change (VDR system) |
| 6 | [DESIGN_HEALTH.md](./DESIGN_HEALTH.md) | Design Validator™ — PASS · WARNING · FAIL |
| — | [revisions/vdr-registry.yaml](./revisions/vdr-registry.yaml) | VDR historical record (VDR-000 baseline) |

---

## Relationship to Other Governance

```
Studio Constitution™ (architecture)
        ↓ informs
Studio Design Constitution™ (visual)
        ↓ implements
Design Language System™ + Component Catalog™
        ↓ tracked in
Design Registry™
        ↓ changed via
Design Revision Framework™ (VDR-###)
        ↓ validated by
Design Health™

Master Specification™ ──references──→ Design Governance
Product Specifications ──inherit──→ Design Governance
Product Starter Pack™ ──onboards──→ every new product
```

---

## Cross-References

| Artifact | Path |
|----------|------|
| Studio Constitution | `docs/studio-os/master-spec/constitution.yaml` |
| Experience Architecture | `docs/studio-os/master-spec/experience-architecture.yaml` |
| Core Philosophies | `docs/studio-os/master-spec/core-philosophies.yaml` |
| Component Registry™ (M127) | `docs/studio-os/system-registry.md` |
| Design Token Engine™ | `docs/studio-os/master-spec/milestones/volume-i.yaml` |
| Product Starter Pack | `docs/studio-os/product-starter-pack/` |
| Website Builder (example product) | `docs/studio-os/products/website-builder/` |

---

## Amendment

Visual changes require **Visual Design Revisions (VDR)** per [DESIGN_REVISION_FRAMEWORK.md](./DESIGN_REVISION_FRAMEWORK.md) — never silent product-level overrides.

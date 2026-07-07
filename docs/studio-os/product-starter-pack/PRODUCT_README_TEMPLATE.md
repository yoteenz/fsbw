# {Product Name}™

**Product ID:** `{product-id}`  
**Version:** 0.1.0  
**Owner:** {name}  
**Status:** {maturity emoji} {maturity level}  
**Release Channel:** preview | beta | stable  
**Date:** {YYYY-MM-DD}

---

> Copy this template to `docs/studio-os/products/{product-id}/README.md`  
> This is the product index — first file created for any new product.

---

## Summary

{2–3 sentences describing what this product does inside Studio OS}

---

## Vision

{One paragraph — link to full vision doc}

**Full vision:** [PRODUCT_VISION.md](./PRODUCT_VISION.md)

---

## Architecture

| Layer | Path |
|-------|------|
| Core module | `src/studio-os-core/{product-id}/` |
| UI components | `src/components/admin/studio/{product-id}/` |
| Module documentation | `docs/studio-os/{product-id}.md` |
| Route | `/admin/studio/{product-id}` |

**Full architecture:** [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)

---

## Dependencies

### Platform

| Module | Required |
|--------|----------|
| Conversation Engine™ | yes/no |
| Studio Orb™ | yes |
| Design Governance v1.0.0 | yes |

### Products

| Product | Relationship |
|---------|--------------|
| | extends / replaces / integrates |

---

## Design Governance Compliance

```yaml
designCompliance:
  registryVersion: "1.0.0"
  catalogVersion: "1.0.0"
  languageSystemVersion: "1.0.0"
  constitutionVersion: "1.0.0"
  designHealthGate: pending
  releaseChannel: preview
  vdrCompliance: []
```

**Inherits:** [Design Governance](../design/) — does not redefine.

**Component map:** [COMPONENT_USAGE_MAP.md](./COMPONENT_USAGE_MAP.md)

---

## Current Version

| Artifact | Version |
|----------|---------|
| Product spec | 0.1.0 |
| Design Registry | 1.0.0 |
| Implementation | not started |

---

## Status & Maturity

| Field | Value |
|-------|-------|
| Maturity | 🌱 Concept |
| Phase | {current lifecycle phase} |
| Blocker | {if any} |

See [Product Maturity™](../product-starter-pack/PRODUCT_MATURITY.md)

---

## Documentation Links

| Document | Path | Status |
|----------|------|--------|
| Product Vision | PRODUCT_VISION.md | ☐ |
| UX Discovery | UX_DISCOVERY.md | ☐ |
| Information Architecture | INFORMATION_ARCHITECTURE.md | ☐ |
| Screen Map | SCREEN_MAP.md | ☐ |
| Component Usage | COMPONENT_USAGE_MAP.md | ☐ |
| AI Collaboration | AI_COLLABORATION.md | ☐ |
| Data Model | DATA_MODEL.md | ☐ / N/A |
| Technical Architecture | TECHNICAL_ARCHITECTURE.md | ☐ |
| Implementation Plan | IMPLEMENTATION_PLAN.md | ☐ |
| QA Plan | QA_PLAN.md | ☐ |
| Launch Checklist | LAUNCH_CHECKLIST.md | ☐ |
| Success Metrics | SUCCESS_METRICS.md | ☐ |
| Creation Checklist | PRODUCT_CREATION_CHECKLIST.md | ☐ |

---

## Approval Gates

| Gate | Status | Date |
|------|--------|------|
| Vision approved | ☐ | |
| Spec approved | ☐ | |
| Prototype approved | ☐ | |
| Review Board PASS | ☐ | |
| **Founder Approval** | ☐ | |
| Launch approved | ☐ | |

---

## Related Systems

| System | Relationship |
|--------|--------------|
| Headquarters™ | Entry wing |
| Studio Orb™ | Intelligence entry |
| Knowledge Registry™ (M126) | Documentation index |
| System Registry™ (M127) | Launch registration |
| Master Specification™ | Milestone home |

---

## Cross-References

| Governance | Path |
|------------|------|
| Studio Constitution™ | `docs/studio-os/master-spec/constitution.yaml` |
| Master Specification™ | `docs/studio-os/master-spec/MASTER_SPEC_INDEX.md` |
| Design Governance™ | `docs/studio-os/design/` |
| Product Starter Pack™ | `docs/studio-os/product-starter-pack/START_HERE.md` |
| Product Roadmap | `docs/studio-os/master-spec/product-roadmap.yaml` |

---

*{Product Name}™ — inherits Studio OS · extends capability.*

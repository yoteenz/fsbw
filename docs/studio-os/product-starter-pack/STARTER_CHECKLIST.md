# Studio Product Starter Pack™

> **v2.0.0:** This checklist is superseded by [PRODUCT_CREATION_CHECKLIST.md](./PRODUCT_CREATION_CHECKLIST.md) — the master checklist for all new products.

---

> **Instructions:** Copy this file to `docs/studio-os/products/{product-id}/STARTER_CHECKLIST.md` and check off as you progress.

---

## Product Identity

| Field | Value |
|-------|-------|
| **Product ID** | `{product-id}` |
| **Product Name** | |
| **Priority** | P2 / P3 / … |
| **Release Channel** | preview / beta / stable |
| **Owner** | |
| **Started** | |

---

## Phase Checklist

### ☐ Idea
- [ ] OS thesis alignment documented
- [ ] Entry added to `product-roadmap.yaml`
- [ ] Executive approval to proceed

### ☐ Research
- [ ] User/persona evidence
- [ ] Competitive scan (what we are NOT)
- [ ] Existing module reuse map
- [ ] Release Channel rationale

### ☐ Architecture
- [ ] Milestone/dependency map
- [ ] Master Spec delta scoped
- [ ] No Foundation mutation required

### ☐ Design Governance
- [ ] Read [Studio Design Constitution](../design/STUDIO_DESIGN_CONSTITUTION.md)
- [ ] `designCompliance` block in product README
- [ ] [Component Usage Map](./COMPONENT_USAGE_MAP.md) drafted
- [ ] Confirmed: no local design language

### ☐ Product Specification
- [ ] Product Vision
- [ ] UX Journey
- [ ] Information Architecture
- [ ] Screen Map
- [ ] User Flows
- [ ] Component Usage Map
- [ ] AI Flow
- [ ] Technical Architecture
- [ ] Data Model (if needed)
- [ ] **SPEC APPROVAL RECEIVED**

### ☐ Experience Prototype
- [ ] Prototype uses catalog components only
- [ ] Design Health preview run
- [ ] **PROTOTYPE APPROVAL RECEIVED**

### ☐ Implementation
- [ ] Folder structure per [template](./FOLDER_STRUCTURE_TEMPLATE.md)
- [ ] Core module in `studio-os-core/`
- [ ] UI in `components/admin/studio/`
- [ ] `docs/studio-os/{module-id}.md`
- [ ] Architecture Validator passes on build

### ☐ QA
- [ ] Design Health PASS
- [ ] Accessibility PASS
- [ ] QA checklist complete
- [ ] [Definition of Done](./DEFINITION_OF_DONE.md) gates

### ☐ Launch
- [ ] System Registry™ registered
- [ ] Success metrics live
- [ ] Launch Report
- [ ] product-roadmap → `live`

### ☐ Governance
- [ ] Maintenance owner assigned
- [ ] VDR process understood by team

---

## Product-Specific Starters

Duplicate this checklist for:

| Product | Product ID | Status |
|---------|------------|--------|
| **Studio Website Builder™** | `website-builder` | Spec complete · awaiting approval |
| **Campaign Engine™** | `campaign-engine` | Queued |
| **Publishing Studio™** | `publishing-studio` | Queued |
| **Relationship Intelligence** | `relationship-intelligence` | Roadmap |
| **Executive Headquarters** | `executive-headquarters` | Roadmap |
| **Knowledge Graph UI** | `knowledge-graph-ui` | Roadmap |
| **Creator Marketplace** | `creator-marketplace` | Future |
| **Digital Twin** | `digital-twin` | Future |

---

## Quick Links

| Resource | Path |
|----------|------|
| Design Governance | `docs/studio-os/design/` |
| Product Starter Pack | `docs/studio-os/product-starter-pack/` |
| Master Spec Index | `docs/studio-os/master-spec/MASTER_SPEC_INDEX.md` |
| Product Roadmap | `docs/studio-os/master-spec/product-roadmap.yaml` |

---

*Copy this checklist · govern every product · ship intentionally.*

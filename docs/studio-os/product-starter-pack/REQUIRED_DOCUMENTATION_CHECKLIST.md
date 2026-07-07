# Required Documentation Checklist

> **v2.0.0:** Superseded by [PRODUCT_CREATION_CHECKLIST.md](./PRODUCT_CREATION_CHECKLIST.md) and per-document templates in this package.

---

Every Studio OS product **must** produce these documents before Experience Prototype approval.

---

## Mandatory Documents

| # | Document | Required before | Template location |
|---|----------|-----------------|-------------------|
| 1 | **Product Vision** | Prototype | `products/{id}/PRODUCT_VISION.md` or spec §1 |
| 2 | **UX Journey** | Prototype | spec §2 |
| 3 | **Information Architecture** | Prototype | spec §3 |
| 4 | **Screen Map** | Prototype | spec §4 |
| 5 | **User Flows** | Prototype | `USER_FLOWS.md` or spec appendix |
| 6 | **Component Usage Map** | Prototype | Maps to [Component Catalog](../design/COMPONENT_CATALOG.md) |
| 7 | **AI Flow** | Prototype | spec §9 or `AI_COLLABORATION_FLOW.md` |
| 8 | **Technical Architecture** | Implementation | spec §10 |
| 9 | **Data Model** | Implementation (if stateful) | `DATA_MODEL.md` |
| 10 | **Launch Checklist** | Launch | [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) |
| 11 | **Success Metrics** | Launch | `SUCCESS_METRICS.md` |

---

## Design Governance Documents (Inherited — Do Not Duplicate)

| Document | Action |
|----------|--------|
| Studio Design Constitution | **Reference** |
| Design Language System | **Reference** |
| Component Catalog | **Map usage** |
| Design Registry | **Declare version** |
| Design Health | **Pass gate** |

---

## Optional but Recommended

| Document | When |
|----------|------|
| Competitive differentiation | Research phase |
| Release Channel plan | Architecture phase |
| Accessibility audit plan | Specification |
| Migration guide | Replacing existing module |
| Runbook | Post-launch |

---

## Consolidated Spec Option

Products may combine items 1–8 into a single **Experience Specification** (see Website Builder example) if:

- Table of contents maps 1:1 to this checklist
- Component Usage Map appendix included
- designCompliance block in README

**Path:** `docs/studio-os/products/{product-id}/`

---

## Approval Gates

| Gate | Requires |
|------|----------|
| **Prototype approved** | Items 1–7 complete |
| **Implementation approved** | Items 1–9 complete · Design Governance declared |
| **Launch approved** | All items · Definition of Done PASS |

---

## Component Usage Map Template

```markdown
## Component Usage Map

| Screen | Component ID | Variant | Experimental |
|--------|--------------|---------|--------------|
| Canvas | comp-canvas | default | no |
| Inspector | comp-inspector-panel | dock-right | no |
| AI | comp-ai-chat | director | no |
```

---

## designCompliance Block (Required in product README)

```yaml
designCompliance:
  registryVersion: '1.0.0'
  catalogVersion: '1.0.0'
  languageSystemVersion: '1.0.0'
  designHealthGate: pending | pass | warning
  releaseChannel: preview | beta | stable
```

---

*Required Documentation Checklist — nothing launches undocumented.*

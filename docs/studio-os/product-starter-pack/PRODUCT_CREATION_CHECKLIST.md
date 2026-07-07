# Product Creation Checklist — {Product Name}

**Product ID:** `{product-id}`  
**Started:** {YYYY-MM-DD}  
**Owner:** {name}

---

> **MASTER CHECKLIST** — Copy to `docs/studio-os/products/{product-id}/PRODUCT_CREATION_CHECKLIST.md`  
> Nothing proceeds until each phase prerequisite is complete.  
> **Begin at:** [START_HERE.md](./START_HERE.md)

---

## Product Identity

| Field | Value |
|-------|-------|
| **Product ID** | `{product-id}` |
| **Product Name** | |
| **Priority** | P1 / P2 / P3 |
| **Release Channel** | preview / beta / stable |
| **Owner** | |
| **Maturity** | 🌱 Concept |

---

## Phase 0 — Onboarding

### ☐ Governance Reading (Required)

- [ ] [Studio Constitution™](../master-spec/constitution.yaml)
- [ ] [Core Philosophies](../master-spec/core-philosophies.yaml)
- [ ] [Experience Architecture™](../master-spec/experience-architecture.yaml)
- [ ] [Studio Design Constitution™](../design/STUDIO_DESIGN_CONSTITUTION.md)
- [ ] [Design Language System™](../design/DESIGN_LANGUAGE_SYSTEM.md)
- [ ] [Component Catalog™](../design/COMPONENT_CATALOG.md)
- [ ] [START_HERE.md](./START_HERE.md)
- [ ] [PRODUCT_DEVELOPMENT_RULES.md](./PRODUCT_DEVELOPMENT_RULES.md)

### ☐ Package Setup

- [ ] Folder created: `docs/studio-os/products/{product-id}/`
- [ ] [PRODUCT_README_TEMPLATE.md](./PRODUCT_README_TEMPLATE.md) → `README.md`
- [ ] This checklist copied to product folder
- [ ] Entry added to `master-spec/product-roadmap.yaml`

**Gate:** Executive idea approval

---

## Phase 1 — Idea 🌱

- [ ] OS thesis alignment documented in README
- [ ] One-page concept note
- [ ] Priority slot confirmed
- [ ] Anti-personas identified

**Gate:** Executive approval → Research

---

## Phase 2 — Research 🌿

- [ ] [UX_DISCOVERY_TEMPLATE.md](./UX_DISCOVERY_TEMPLATE.md) started
- [ ] Competitive scan (what we are NOT)
- [ ] Existing module reuse map
- [ ] Release Channel rationale

**Gate:** Research review

---

## Phase 3 — Product Vision 🌿

- [ ] [PRODUCT_VISION_TEMPLATE.md](./PRODUCT_VISION_TEMPLATE.md) complete
- [ ] Mission · vision · north star defined
- [ ] Success metrics sketched
- [ ] Out of scope explicit
- [ ] Vision approval received

**Gate:** Vision approval → Architecture

---

## Phase 4 — Architecture 🌳

- [ ] Master Spec milestone map scoped
- [ ] Dependencies identified
- [ ] No Foundation v1.1 mutation (or DR filed)
- [ ] [TECHNICAL_ARCHITECTURE_TEMPLATE.md](./TECHNICAL_ARCHITECTURE_TEMPLATE.md) scoped

**Gate:** Architecture alignment check

---

## Phase 5 — Design Governance Reference 🌳

- [ ] `designCompliance` block in README
- [ ] [COMPONENT_USAGE_TEMPLATE.md](./COMPONENT_USAGE_TEMPLATE.md) drafted
- [ ] Confirmed: **no local design language**
- [ ] Design Registry version declared (1.0.0)

**Gate:** Design Constitution acknowledgment

---

## Phase 6 — Product Specification 🌳

- [ ] [INFORMATION_ARCHITECTURE_TEMPLATE.md](./INFORMATION_ARCHITECTURE_TEMPLATE.md)
- [ ] [SCREEN_MAP_TEMPLATE.md](./SCREEN_MAP_TEMPLATE.md)
- [ ] [COMPONENT_USAGE_MAP.md](./COMPONENT_USAGE_MAP.md) complete
- [ ] [AI_COLLABORATION_TEMPLATE.md](./AI_COLLABORATION_TEMPLATE.md) (if AI)
- [ ] [DATA_MODEL_TEMPLATE.md](./DATA_MODEL_TEMPLATE.md) (if stateful)
- [ ] [TECHNICAL_ARCHITECTURE_TEMPLATE.md](./TECHNICAL_ARCHITECTURE_TEMPLATE.md) complete
- [ ] User flows documented
- [ ] **SPEC APPROVAL RECEIVED**

**Gate:** Specification completeness → Prototype

---

## Phase 7 — Experience Prototype 🏗

- [ ] Prototype uses **catalog components only**
- [ ] Design Health™ preview ≥70
- [ ] P0 screens demonstrated
- [ ] **PROTOTYPE APPROVAL RECEIVED**

**Gate:** Prototype approval → Review Board

---

## Phase 8 — Product Review Board 🏗

- [ ] Architecture Review — PASS
- [ ] UX Review — PASS
- [ ] Design Review — PASS
- [ ] AI Review — PASS / N/A
- [ ] Accessibility Review — PASS
- [ ] Performance Review — PASS
- [ ] Security Review — PASS
- [ ] Engineering Review — PASS
- [ ] Founder Review — **GRANTED**
- [ ] Review record filed: `PRODUCT_REVIEW_BOARD.md` copy in product folder

**Gate:** **Founder Approval → Implementation authorized**

---

## Phase 9 — Implementation ⚙

- [ ] [IMPLEMENTATION_PLAN_TEMPLATE.md](./IMPLEMENTATION_PLAN_TEMPLATE.md) approved
- [ ] [PRODUCT_FOLDER_STRUCTURE.md](./PRODUCT_FOLDER_STRUCTURE.md) followed
- [ ] Core module: `src/studio-os-core/{product-id}/`
- [ ] UI: `src/components/admin/studio/{product-id}/`
- [ ] Module doc: `docs/studio-os/{product-id}.md`
- [ ] Architecture Validator™ passes on build
- [ ] No unregistered UI components

**Gate:** Feature complete for channel scope → QA

---

## Phase 10 — QA 🧪

- [ ] [QA_TEMPLATE.md](./QA_TEMPLATE.md) complete
- [ ] Design Health™ PASS (or WARNING for Preview)
- [ ] Accessibility PASS
- [ ] Product Health™ PASS
- [ ] [DEFINITION_OF_DONE.md](./DEFINITION_OF_DONE.md) gates checked

**Gate:** QA sign-off → Beta/Launch

---

## Phase 11 — Beta 🧪

- [ ] Release Channel gate satisfied
- [ ] Org opt-in configured (Preview/Beta)
- [ ] Monitoring active
- [ ] Feedback channel open

**Gate:** Launch readiness

---

## Phase 12 — Launch 🚀

- [ ] [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) 100%
- [ ] System Registry™ (M127) registered
- [ ] Knowledge Registry™ (M126) indexed
- [ ] Design Registry™ compliance row
- [ ] Master Specification updated
- [ ] Release notes published
- [ ] **LAUNCH APPROVAL RECEIVED**

**Gate:** Production → Governed Evolution

---

## Phase 13 — Governed Evolution ⭐

- [ ] [LESSONS_LEARNED_TEMPLATE.md](./LESSONS_LEARNED_TEMPLATE.md) at Day 30
- [ ] Product Maturity updated
- [ ] Quarterly Product Health™ scheduled
- [ ] VDR/DR process understood by team

---

## Product Catalog (Duplicate for Each)

| Product | ID | Checklist location |
|---------|-----|-------------------|
| Experience Studio™ | `experience-studio` | legacy — align on next revision |
| Studio Website Builder™ | `website-builder` | `products/website-builder/` |
| Campaign Engine™ | `campaign-engine` | TBD |
| Publishing Studio™ | `publishing-studio` | TBD |
| Relationship Intelligence™ | `relationship-intelligence` | TBD |
| Executive Headquarters™ | `executive-headquarters` | TBD |
| Knowledge Graph™ | `knowledge-graph` | TBD |
| Creator Marketplace™ | `creator-marketplace` | TBD |
| AI Concierge™ | `ai-concierge` | TBD |
| Digital Twin™ | `digital-twin` | TBD |

---

## Quick Links

| Resource | Path |
|----------|------|
| Design Governance | `docs/studio-os/design/` |
| Product Starter Pack | `docs/studio-os/product-starter-pack/` |
| Studio Constitution™ | `docs/studio-os/master-spec/constitution.yaml` |
| Master Specification™ | `docs/studio-os/master-spec/MASTER_SPEC_INDEX.md` |
| Knowledge Registry™ | `docs/studio-os/knowledge-registry.md` |
| System Registry™ | `docs/studio-os/system-registry.md` |

---

*Product Creation Checklist — the master gate · nothing proceeds ungoverned.*

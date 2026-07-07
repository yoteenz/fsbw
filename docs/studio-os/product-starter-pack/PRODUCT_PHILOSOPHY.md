# Product Philosophy — Studio OS

> **v2.0.0:** Superseded by [START_HERE.md](./START_HERE.md) and [PRODUCT_DEVELOPMENT_RULES.md](./PRODUCT_DEVELOPMENT_RULES.md).

---

## Core Belief

> Products are **extensions of a customer's Headquarters** — not independent applications with Studio skin.

They inherit architecture, design, governance, and intelligence. They contribute **business capabilities**, **flows**, and **domain value** — never parallel foundations, never standalone apps, never template stores.

**Headquarters model:** [Headquarters Engine™](../headquarters-engine.md) · [Platform Vision](../platform-vision.md)

**Content products** additionally inherit the [Master Content Pipeline™](../master-content-pipeline.md): campaigns are production pipelines; **Projects** produce **Outputs** linked to the parent Project. Products **consume** the ten **lifecycle gates** (DISCOVER → LEARNING) — they do not define independent workflows.

**Production UX:** [Studio Production Engine™](../studio-production-engine.md) — each gate is a **department workspace** in Studio Headquarters. Users walk the asset through departments; they never scroll through all phases on one page. Gate reference: [master-content-pipeline-gates.md](../master-content-pipeline-gates.md) · Departments: [studio-production-engine-departments.md](../studio-production-engine-departments.md).

---

## The Studio OS Product Lifecycle

```
Idea
  ↓
Research
  ↓
Architecture
  ↓
Design Governance
  ↓
Product Specification
  ↓
Experience Prototype
  ↓
Implementation
  ↓
QA
  ↓
Launch
  ↓
Governance
```

---

## Phase Philosophy

### Idea

A product exists to **demonstrate or extend** Studio OS philosophy — not to fill a market checkbox.

**Question:** Does this product prove the OS thesis?

### Research

Understand users, competitive landscape, and **existing Studio OS modules** that already solve partial problems.

**Rule:** Reuse before build.

### Architecture

Confirm Master Specification alignment. Identify milestones, dependencies, Release Channel.

**Rule:** No architectural DR required for product-only work unless baseline changes.

### Design Governance

**Mandatory gate before specification implementation.**

Products declare compliance with:
- Studio Design Constitution™
- Design Language System™
- Component Catalog™
- Design Registry™ version

**Rule:** Products never author parallel design languages.

### Product Specification

Document vision through technical architecture — per [Required Documentation Checklist](./REQUIRED_DOCUMENTATION_CHECKLIST.md).

**Rule:** Spec references governance · does not redefine it.

### Experience Prototype

Interactive proof of **feel** — not production code.

**Rule:** Prototype uses catalog components only.

### Implementation

Build with registry discipline · Conversation Engine · Release Channel gates.

**Rule:** Build more · re-architect less.

### QA

Architecture Validator™ + Design Health™ + accessibility + channel gates.

### Launch

Release Channel promotion · registry registration · documentation complete.

### Governance

Long-term maintenance through VDR and product roadmap — not silent drift.

---

## Product vs Platform Responsibilities

| Platform owns | Product owns |
|---------------|--------------|
| Design language | User flows |
| Component canon | Domain logic |
| Constitution | Feature scope |
| Release channels | Product metrics |
| Registry infrastructure | Product documentation |
| Studio Orb / Intelligence layer | Product-specific AI prompts |

---

## Anti-Patterns

- ❌ Starting with code before specification
- ❌ Local CSS design system
- ❌ "We'll align with design later"
- ❌ Skipping prototype for "speed"
- ❌ Product-specific button component
- ❌ Volume authoring without product driver

---

## Alignment with Product Phase Charter

See [PRODUCT_PHASE_CHARTER.md](../PRODUCT_PHASE_CHARTER.md):

> Build more. Re-architect less. Validate continuously. Ship intentionally.

---

*Product Philosophy — extend the OS · inherit everything else.*

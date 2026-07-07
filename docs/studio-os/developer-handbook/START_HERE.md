# START HERE — Studio OS Developer Handbook™

**Version:** 1.0.0  
**Audience:** Engineers · designers · product · QA · architects · AI agents  
**Date:** 2026-07-07

---

> **Welcome to Studio OS.** This is where every contributor begins — human or AI.

---

## What Studio OS Is

**Studio OS™** is an **immersive Business Headquarters Operating System** — not a generic SaaS dashboard or app store.

Every organization receives a **living Headquarters** that **grows over time** through **Headquarters Expansions™**. Users collaborate with intelligence inside **places**, not configure settings inside **tools**.

Studio OS is:
- A **platform** — constitution, architecture, design canon, registries, **[Headquarters Engine™](../headquarters-engine.md)**
- A **business operating system** — expand capabilities, not download templates
- A **product ecosystem** — products are **extensions of Headquarters**, not standalone apps
- A **governance system** — changes are deliberate, versioned, and validated
- A **reference implementation** — Experience Studio™ proves the entire stack

---

## Platform Vision

> Every entrepreneur steps inside a **living Headquarters** tailored to their business — expands it as the business evolves — and never outgrows the operating system.

**Horizon:** Studio OS becomes the world's first **immersive Business Headquarters Operating System** — where founders build businesses, not buy software.

**Canonical:** [Platform Vision](../platform-vision.md) · [Headquarters Engine™](../headquarters-engine.md)

---

## Operating Philosophy

| Principle | Meaning |
|-----------|---------|
| **Build more · re-architect less** | Product drives spec — not sequential volume sprints |
| **Governance enables speed** | Canon prevents decision fatigue |
| **Registry-driven everything** | Important objects are searchable, documented, auditable |
| **Frozen foundation · governed evolution** | v1.1 frozen — changes via DR/CA/VDR |
| **Products inherit · never redefine** | Design, architecture, philosophy |
| **Quality over velocity** | Beauty · maintainability · accessibility · delight |

**Charter:** [PRODUCT_PHASE_CHARTER.md](../PRODUCT_PHASE_CHARTER.md)

---

## Product Philosophy

Products are **extensions of Studio OS** — not independent apps with Studio skin.

```
Idea → Research → Vision → Architecture → Design Governance
  → Specification → Prototype → Review → Founder Approval
  → Implementation → QA → Beta → Launch → Governed Evolution
```

Every product begins from the [Product Starter Pack™](../product-starter-pack/START_HERE.md). No blank pages.

**Golden Product:** Experience Studio™ is the Reference Implementation™ — all flagship capabilities validate here first.

---

## Design Philosophy

| Pillar | Rule |
|--------|------|
| **Inheritance over invention** | Products compose `comp-*` catalog — never fork |
| **Places over panels** | Spatial hierarchy · glass environments |
| **Calm over clutter** | Progressive disclosure · canvas-first |
| **Luxury over utility theater** | Premium restraint |
| **Motion with meaning** | Animation communicates state |
| **Accessibility as dignity** | WCAG 2.2 AA minimum |

**Authority:** [Studio Design Constitution™](../design/STUDIO_DESIGN_CONSTITUTION.md)

---

## AI Philosophy

| Principle | Expression |
|-----------|------------|
| **Intelligence as presence** | Studio Orb™ · Director — not sidebar chatbot |
| **Models are replaceable** | Studio Intelligence™ owns the layer |
| **Human agency** | AI proposes · humans approve |
| **Never silent mutation** | Preview → accept/reject |
| **Teach don't tell** | Explanations · alternatives · confidence |
| **Conversation before configuration** | Dialogue precedes forms |

**Guide:** [AI_COLLABORATION_GUIDE.md](./AI_COLLABORATION_GUIDE.md)

---

## Engineering Philosophy

| Principle | Expression |
|-----------|------------|
| **Spec in docs/** | Master Specification independent of app code |
| **Core vs UI separation** | `studio-os-core/` · `components/admin/studio/` |
| **Validator gates** | Architecture Validator™ blocks bad builds |
| **Module documentation** | Every module → Knowledge Registry™ |
| **Feature flags + channels** | Release Channel System™ (CA-001) |
| **No silent baseline mutation** | Foundation v1.1 frozen |

**Guidelines:** [ENGINEERING_GUIDELINES.md](./ENGINEERING_GUIDELINES.md)

---

## Governance Philosophy

> **Nothing changes silently. Everything traces to authority.**

| Layer | Change mechanism |
|-------|------------------|
| Platform principles | Constitutional Amendment (CA-###) |
| Architecture | Design Revision (DR-###) |
| Visual design | Visual Design Revision (VDR-###) |
| Products | Product spec amendment + Review Board |
| Handbook | Documentation PR + review |

**Model:** [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md)

---

## Required Reading Order

### Everyone (Day 1)

| Order | Document | Time |
|-------|----------|------|
| 1 | This document | 15 min |
| 2 | [PLATFORM_OVERVIEW.md](./PLATFORM_OVERVIEW.md) | 20 min |
| 3 | [GLOSSARY.md](./GLOSSARY.md) | Reference |
| 4 | [PLATFORM_MAP.md](./PLATFORM_MAP.md) | 10 min |
| 5 | Studio Constitution™ | `master-spec/constitution.yaml` | 15 min |

### Before Contributing Code (Day 2–3)

| Order | Document |
|-------|----------|
| 6 | [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md) |
| 7 | [ENGINEERING_GUIDELINES.md](./ENGINEERING_GUIDELINES.md) |
| 8 | [DESIGN_GOVERNANCE.md](./DESIGN_GOVERNANCE.md) |
| 9 | [QA_PROCESS.md](./QA_PROCESS.md) |
| 10 | [CONTRIBUTOR_GUIDE.md](./CONTRIBUTOR_GUIDE.md) |

### Before Product Work

| Order | Document |
|-------|----------|
| 11 | [Product Starter Pack START_HERE](../product-starter-pack/START_HERE.md) |
| 12 | [PRODUCT_LIFECYCLE.md](./PRODUCT_LIFECYCLE.md) |
| 13 | [PRODUCT_REFERENCE_IMPLEMENTATION.md](./PRODUCT_REFERENCE_IMPLEMENTATION.md) |

### Before Release

| Order | Document |
|-------|----------|
| 14 | [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) |
| 15 | [QA_PROCESS.md](./QA_PROCESS.md) |

---

## How to Contribute

| Intent | Start here |
|--------|------------|
| Fix a bug | ENGINEERING_GUIDELINES → module doc → PR |
| New feature | CONTRIBUTOR_GUIDE → product spec if product-scoped |
| New product | Product Starter Pack → PRODUCT_CREATION_CHECKLIST |
| Visual change | DESIGN_GOVERNANCE → VDR proposal |
| Architecture change | GOVERNANCE_MODEL → DR proposal |
| Constitutional change | GOVERNANCE_MODEL → CA proposal |
| Documentation | DOCUMENTATION_MAP → Knowledge Registry™ sync |

**Never:** Skip governance · invent design language · mutate foundation silently · ship without validators.

---

## Development Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│  ONBOARD → READ HANDBOOK → UNDERSTAND GOVERNANCE            │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PRODUCT PATH: Starter Pack → Spec → Prototype → Review     │
│              → Founder Approval → Implement → QA → Launch   │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  PLATFORM PATH: Proposal → DR/VDR/CA → Implement → Validate │
└───────────────────────────┬─────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  GOVERNED EVOLUTION: Registry update · Lessons Learned      │
└─────────────────────────────────────────────────────────────┘
```

---

## Current Implementation Status

| Area | Status |
|------|--------|
| Foundation v1.1 | ✅ Frozen |
| Studio Orb™ / Voice / Conversation | ✅ Mature (Preview) |
| Design Governance | ✅ Ratified |
| Product Starter Pack v2.0.0 | ✅ Ratified |
| Experience Studio™ spec | ⏳ Awaiting approval |
| Experience Studio™ production | ❌ Not authorized |
| Developer Handbook | ✅ This package |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Master Specification™ | `docs/studio-os/master-spec/MASTER_SPEC_INDEX.md` |
| Design Governance™ | `docs/studio-os/design/` |
| Product Starter Pack™ | `docs/studio-os/product-starter-pack/` |
| Experience Studio™ | `docs/studio-os/products/experience-studio/` |
| Documentation Map | [DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md) |

---

*START HERE — understand Studio OS before you touch it.*

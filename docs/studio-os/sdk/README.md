# Studio Department SDK™

**Version:** 1.0.0  
**Status:** Canonical Engine Specification  
**Type:** Platform Foundation — not a feature, not a department  
**Parent:** [Studio OS Platform Architecture](../PLATFORM_ARCHITECTURE.md) · [Headquarters Engine™](../headquarters-engine.md)  
**Supersedes:** Per-department ad-hoc layouts, flattened UI mockups, page-based module design

---

> **Departments are not webpages. Departments are interactive worlds.**

The Studio Department SDK™ is the permanent engine specification governing **every department that will ever exist** inside Studio OS — regardless of industry, company size, or visual identity.

Think of this SDK as:

| Reference | Studio OS Equivalent |
|-----------|---------------------|
| Apple Human Interface Guidelines | Behavioral + spatial law for all departments |
| Unreal Engine Actor System | Modular object classes with inputs, outputs, and lifecycle |
| The Movies Building System | Assembled environments from discrete, swappable assets |

---

## What This SDK Governs

| In Scope | Out of Scope |
|----------|--------------|
| Department anatomy and inheritance | React components |
| Spatial layout rules | Page routing implementation |
| Object class library | UI mockups |
| Interaction verbs | Form-first workflows |
| AI employee roles and collaboration | Per-department branding |
| Asset modularity standards | Flattened scene generation |
| Visual, motion, and audio inheritance | Creative direction decisions |
| Company Genome injection points | Cursor creative authoring |
| Runtime assembly contract | Production deployment scripts |

---

## Canonical Hierarchy

Every department exists inside the Headquarters spatial stack:

```
Headquarters
    ↓
Buildings
    ↓
Departments          ← THIS SDK
    ↓
Workspaces
    ↓
Projects
    ↓
Assets
    ↓
Tasks
```

A **Department** is a named production or business **room** — a living environment with concierge presence, modular objects, interaction zones, and exit criteria. Users do not "open a page." They **arrive at a place.**

---

## SDK Document Index

Read in order for first-time authoring. Reference individually during implementation.

| # | Document | System |
|---|----------|--------|
| 01 | [Department Anatomy](./01_DEPARTMENT_ANATOMY.md) | Mandatory inheritance contract for every department |
| 02 | [Spatial Layout System](./02_SPATIAL_LAYOUT_SYSTEM.md) | Physical environment topology |
| 03 | [Object Library](./03_OBJECT_LIBRARY.md) | Reusable object classes |
| 04 | [Interaction Engine](./04_INTERACTION_ENGINE.md) | Physical interaction verbs |
| 05 | [AI Employee System](./05_AI_EMPLOYEE_SYSTEM.md) | Collaborative AI workers |
| 06 | [Asset Standard](./06_ASSET_STANDARD.md) | Modular asset composition |
| 07 | [Visual Language](./07_VISUAL_LANGUAGE.md) | Inherited visual law |
| 08 | [Motion Standard](./08_MOTION_STANDARD.md) | Cinematic movement law |
| 09 | [Audio Standard](./09_AUDIO_STANDARD.md) | Environmental and ceremonial audio |
| 10 | [Company Genome Integration](./10_COMPANY_GENOME_INTEGRATION.md) | Identity injection — no department branding |
| 11 | [Department Runtime](./11_DEPARTMENT_RUNTIME.md) | Dynamic assembly by Studio Engine |
| 12 | [World Routing](./12_WORLD_ROUTING.md) | Travel between locations |
| 13 | [Marketplace Packaging](./13_MARKETPLACE_PACKAGING.md) | Installable department packages |
| 14 | [FAL Asset Compiler](./14_FAL_ASSET_COMPILER.md) | Prompt → modular asset packages |
| 15 | [Cursor Runtime Requirements](./15_CURSOR_RUNTIME_REQUIREMENTS.md) | Assembly contract for Cursor |
| 16 | [Department Creation Guide](./16_DEPARTMENT_CREATION_GUIDE.md) | Official authoring workflow |
| 17 | [QA Checklist](./17_QA_CHECKLIST.md) | Approval gate before release |

---

## Core Principles (Non-Negotiable)

### 1. Worlds, Not Pages
Departments are navigable physical environments. Navigation is travel. Data lives on objects, not in tables by default.

### 2. Modular Assembly
Every department is composed from discrete assets. **Never** generate or ship a single flattened scene. Every element must be independently replaceable.

### 3. Genome-First Identity
Departments define **structure and behavior only**. Company Genome™ injects all branding, voice, materials, lighting character, and AI personality. The same Marketing Department must transform into a luxury hair brand, law firm, or construction company without rebuild.

### 4. Physical Interaction
Users click, drag, pin, approve, scrub, speak, and converse — not fill forms. Forms are escape hatches, not primary interfaces.

### 5. AI Collaboration
AI employees have roles, permissions, and memory. They collaborate; they do not replace one another or the human founder.

### 6. Marketplace-Ready by Default
Every department authored with this SDK can be packaged, versioned, and installed into another company's Headquarters.

### 7. Cursor Assembles — FAL Generates
FAL (and allied model providers) compile prompts into modular asset packages. Cursor assembles packages at runtime. Neither Cursor nor department authors perform creative direction — Genome and approved blueprints do.

---

## Relationship to Existing Platform Systems

```
Company Genome™ (M277)
         ↓
Studio Department SDK™          ← structural law for all departments
         ↓
Headquarters Engine™            ← generates HQ from industry + packs
         ↓
FAL Asset Compiler              ← generates modular asset packages
         ↓
Department Runtime              ← assembles living environment
         ↓
Interaction Engine™ (M130)      ← platform-wide behavioral consistency
         ↓
World Routing                     ← travel between departments
         ↓
Headquarters Marketplace™       ← publish and install packs
```

---

## Who Uses This SDK

| Role | Usage |
|------|-------|
| **Department Architects** | Author new departments via Creation Guide |
| **FAL Pipeline Engineers** | Compile asset packages per Asset Compiler spec |
| **Cursor Runtime Engineers** | Implement assembly per Runtime Requirements |
| **QA / Experience Review** | Gate release via QA Checklist |
| **Marketplace Publishers** | Package departments per Marketplace spec |
| **AI Agents** | Must read SDK before proposing any department work |

---

## Versioning

| Field | Value |
|-------|-------|
| SDK Version | `1.0.0` |
| Schema Namespace | `studio.department.sdk.v1` |
| Breaking changes | Require constitutional amendment + SDK major version bump |

---

## Quick Start

1. Read [01 — Department Anatomy](./01_DEPARTMENT_ANATOMY.md) — understand mandatory inheritance.
2. Read [10 — Company Genome Integration](./10_COMPANY_GENOME_INTEGRATION.md) — understand why departments never define branding.
3. Follow [16 — Department Creation Guide](./16_DEPARTMENT_CREATION_GUIDE.md) step by step.
4. Gate with [17 — QA Checklist](./17_QA_CHECKLIST.md) before any release.

---

_Studio Department SDK™ — The permanent foundation for all Studio OS departments and every future industry expansion._

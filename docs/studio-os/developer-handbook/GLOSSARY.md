# Glossary — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)

---

> Canonical definitions for Studio OS terminology. When in doubt, this glossary is authoritative for handbook context.

---

## A

### Architecture Governance™
Rules and processes governing platform architecture — Foundation baseline, milestones, dependency graph, DR process. See [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md).

### Architecture Validator™
Automated script (`scripts/architecture-validator.mjs`) that validates structural compliance. Runs on compile and build. **0 errors required.**

### Awakening Experience™
Ceremonial intelligence entry sequence (M89.4). First visit to Headquarters — optional Studio Orb™ awakening.

---

## C

### Campaign Engine™
Studio OS module — transforms strategy into coordinated **production pipelines** (Master Content Assets™ + platform derivatives). Route: `/admin/studio/campaign-engine`. Core: `src/studio-os-core/campaign-engine/`. Inherits [Master Content Pipeline™](../master-content-pipeline.md).

### Component Catalog™
Canonical library of reusable UI components (`comp-*` IDs). Path: `design/COMPONENT_CATALOG.md`. Products use — never fork.

### Constitutional Amendment™ (CA-###)
Rare process for changing Studio Constitution™ principles. Example: CA-001 Release Channel System™.

### Concierge Review Board™
Multidisciplinary review layer for content readiness. Each concierge (Brand, Editorial, SEO, Legal, etc.) returns PASS · WARNING · FAIL with recommendations and an overall readiness score. Stage 9 of [Master Content Pipeline™](../master-content-pipeline.md). Surfaces: Concierge Approval Flow™, Studio Intelligence review dimensions.

### Content Expansion Engine™
Flagship Studio OS capability (architecture) — from one [Master Content Asset™](#master-content-asset) generates platform-specific derivatives (Instagram carousel, TikTok script, newsletter, FAQ, etc.) while preserving lineage. Stage 11 of Master Content Pipeline™.

### Conversation Engine™
Platform module orchestrating AI dialogue turns, routing, and session management. Milestone M89.3.

### Conversation-First UX™
Interaction philosophy — dialogue and creative direction precede configuration forms.

### Conversation Mode™
Immersive intelligence interaction backdrop (M89.x). Related to Command Dock™ evolution.

### Creative Wing
Headquarters environment zone where Experience Studio™ and creative products live.

---

## D

### Definition of Done
Official product completion criteria — 12 gates. Path: `product-starter-pack/DEFINITION_OF_DONE.md`.

### Design DNA™
Brand personality blending system (Luxury™ · Editorial™ · etc.). Milestone M84. Customer canon: Design DNA Canon™.

### Design Governance™
Complete visual governance package at `docs/studio-os/design/`. Includes Constitution, Language, Catalog, Registry, VDR, Design Health™.

### Design Genome™
Organizational visual memory system. Milestone M85. Promotes patterns to org canon.

### Design Health™
Visual compliance validator — PASS · WARNING · FAIL. Rubric at `design/DESIGN_HEALTH.md`.

### Design Language System™
Permanent principles defining how Studio OS should feel — survives redesigns. Not a snapshot of current UI.

### Design Registry™
Version truth for all design artifacts. Products declare `designCompliance` version.

### Design Revision™ (DR-###)
**Architectural** design revision — milestones, modules, experience architecture. Distinct from VDR.

### Design Revision Framework™
VDR numbering, approval, and migration process. Path: `design/DESIGN_REVISION_FRAMEWORK.md`.

### Digital Architect™
Solution architecture module (M55) — IA, ecosystem, handoff. Core layer beneath Experience Studio™.

### DR (Design Revision)
See Design Revision™. Architectural scope only.

---

## E

### Experience Architecture™
Frozen canonical experiential layer — presence, headquarters, design genome stack. Path: `experience-architecture.yaml`.

### Experience DNA™
Slider system for motion, glass, density, storytelling, AI collaboration. Milestones M85, M141.

### Experience Engine™
Environmental adaptation and storytelling engine. Milestone M141.

### Experience Prototype
Interactive proof of product feel — not production code. Uses catalog components only.

### Experience Studio™
AI Creative Operating System — Golden Product™ and Reference Implementation™. NOT a website builder. Milestone M131.

### Experience Type
Category of output Experience Studio™ creates (Website, Store, Portal, etc.). 13+ types defined.

### Experimental (Release Channel)
Least stable channel — internal prototypes and unratified components.

---

## F

### Foundation v1.1
Frozen architectural baseline. Operationally complete. No silent mutation.

### Founder Approval
Written executive authorization required before product implementation begins.

---

## G

### Golden Product™
Official proving-ground product where platform capabilities validate before graduating. Experience Studio™ is the Golden Product.

### Governed Evolution
Post-launch maintenance phase — VDR, DR, Lessons Learned, maturity reviews.

### Governance Philosophy
Nothing changes silently. Everything traces to authority via CA, DR, VDR, or product process.

---

## K

### Knowledge Registry™
Searchable documentation index for all platform modules (M126). Module docs at `docs/studio-os/{module-id}.md`.

---

## L

### Living Headquarters™
Headquarters that evolves with organizational life — seasons, milestones, memory. DR-003 merged.

---

## M

### Master Content Asset™
The single source of truth for campaign content — Page 001, episode, article, video, interview, guide, etc. All platform-specific outputs are **derivatives** linked to this asset. Stage 7 of [Master Content Pipeline™](../master-content-pipeline.md).

### Master Content Pipeline™
Canonical 17-stage content operating model for Studio OS — production pipeline, not publishing pipeline. Spec: [master-content-pipeline.md](../master-content-pipeline.md). Code: `src/studio-os-core/content-pipeline/`. Inherited by Campaign Engine™, Newsroom™, Publishing Studio™, Knowledge Library™, Studio Intelligence™.

### Master Specification™
Architectural source of truth — Volumes 0–XIX, milestones, dependencies. Path: `master-spec/`.

### Milestone (M###)
Canonical capability container in Master Spec. 233 milestones across volumes.

---

## O

### Organizational Intelligence Platform
What Studio OS is — not a generic SaaS dashboard. Constitution principle #1.

---

## P

### Personalization DNA™
Respectful personalization — culture, tone, accessibility. Milestone M89.5.

### Places over Panels
Design philosophy — spatial hierarchy and glass environments, not admin chrome.

### Platform Map
Visual diagram of how all Studio OS packages connect. [PLATFORM_MAP.md](./PLATFORM_MAP.md).

### Platform Service (Maturity)
Maturity level 🏛 — product is core OS dependency for other products.

### POP (Product Operating Procedure)
Synonym for Product Starter Pack™ v2.0.0.

### Product Governance™
Rules for how products inherit and extend platform governance without overriding.

### Product Health™
Composite product validator — 10 dimensions, PASS/WARNING/FAIL. Pre-launch and quarterly.

### Product Operating Procedure
See POP.

### Product Phase
Current Studio OS development phase — product drives spec, not sequential volume sprints.

### Product Review Board™
Mandatory pre-implementation review gate — 9–10 reviews + Founder Approval.

### Product Starter Pack™
Canonical product onboarding — 22 documents, templates, lifecycle. v2.0.0.

### Publishing Studio™
Distribution and multi-platform publishing product. Queued P2 Phase 3. Inherits [Master Content Pipeline™](../master-content-pipeline.md) stages 12–14 (derivative review, scheduling, publishing).

---

## R

### Reference Implementation™
Official product validating the entire Studio OS stack. Experience Studio™.

### Registry-Driven
Constitution principle — important objects are searchable, documented, auditable, QA-gated.

### Release Channel System™
Constitutional capability (CA-001) for org opt-in feature gates. Channels: Stable · Preview · Beta · Experimental. M127.14.

### Remix™
Quick design transformation workflow in Experience Studio™ — preview before apply.

---

## S

### Studio Constitution™
Supreme platform law — 13 principles. Volume 0. `constitution.yaml`.

### Studio Design Constitution™
Supreme visual law. No product may override. `design/STUDIO_DESIGN_CONSTITUTION.md`.

### Studio Intelligence™
Platform-owned intelligence layer. AI models are replaceable engines beneath it.

### Studio Orb™
Ambient intelligence presence — primary OS interaction anchor. `comp-studio-orb`. M89.1.

### Studio OS™
Organizational Intelligence Platform — the complete ecosystem documented in this handbook.

### System Registry™
Runtime registry of platform objects and products (M127). Launch registration required.

---

## V

### Visual Design Revision™ (VDR-###)
**Visual** design change process — components, tokens, motion. Distinct from architectural DR.

### Voice Mode™
Voice interaction layer for Studio Orb™ and Conversation Engine™. M89.2.

### Volume (Master Spec)
Major specification container. Volumes 0–V complete. VI–XIX governed roadmaps.

### VDR
See Visual Design Revision™.

---

## W

### Website Builder™
Publish-pipeline specialization for Website experience type. Inherits Experience Studio Reference Implementation. NOT a competing product.

### Workspace DNA™
Per-organization experiential genome. Multi-org isolation. M76.5 + M85.

### Workspace Panel
Catalog component `comp-workspace-panel` — environment chrome container.

---

## Symbols & Shorthand

| Term | Meaning |
|------|---------|
| `comp-*` | Canonical component ID from Component Catalog™ |
| `CA-###` | Constitutional Amendment number |
| `DR-###` | Architectural Design Revision number |
| `VDR-###` | Visual Design Revision number |
| `M###` | Milestone number |
| 🌱–🏛 | Product maturity symbols |

---

## Cross-References

| Document | Path |
|----------|------|
| Platform Overview | [PLATFORM_OVERVIEW.md](./PLATFORM_OVERVIEW.md) |
| Documentation Map | [DOCUMENTATION_MAP.md](./DOCUMENTATION_MAP.md) |
| Core Philosophies | `master-spec/core-philosophies.yaml` |

---

*Glossary — speak the same language · build the same platform.*

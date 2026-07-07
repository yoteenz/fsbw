# Glossary — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)

---

> Canonical definitions for Studio OS terminology. When in doubt, this glossary is authoritative for handbook context.

---

---

## A

### APPROVAL GATE™
Seventh gate after expansion — approve every derivative before publishing. Exit: **Publishing Package**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

### Architecture Governance™
Rules and processes governing platform architecture — Foundation baseline, milestones, dependency graph, DR process. See [GOVERNANCE_MODEL.md](./GOVERNANCE_MODEL.md).

### Architecture Validator™
Automated script (`scripts/architecture-validator.mjs`) that validates structural compliance. Runs on compile and build. **0 errors required.**

### ASSEMBLY GATE™
Third gate — gather talent, props, locations, brand assets, and dependencies. Exit: **Production Ready**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

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
Multidisciplinary review layer for content readiness. Each concierge (Brand, Editorial, SEO, Legal, etc.) returns PASS · WARNING · FAIL with recommendations and an overall readiness score. Primary gate: **REVIEW GATE™**; per-derivative review in **APPROVAL GATE™**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

### Content Expansion Engine™
Flagship Studio OS capability (architecture) — from one [Master Content Asset™](#master-content-asset) generates platform-specific derivatives (Instagram carousel, TikTok script, newsletter, FAQ, etc.) while preserving lineage. Gate: **EXPANSION GATE™**.

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

### DEVELOP GATE™
Second lifecycle gate — creative brief becomes **Production Blueprint** (storyboard, script, messaging, moodboard). See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

### DISCOVER GATE™
First lifecycle gate — ideas become validated opportunities. Exit: **Approved Creative Brief**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

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

### EXPANSION GATE™
Sixth gate — generate platform derivatives from Approved Master Asset. Exit: **Derivative Library**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

### Experience Architecture™
Frozen canonical experiential layer — presence, headquarters, design genome stack. Path: `experience-architecture.yaml`.

### Experience DNA™
Slider system for motion, glass, density, storytelling, AI collaboration. Milestones M85, M141.

### Experience Engine™
Environmental adaptation and storytelling engine. Milestone M141.

### Experience Prototype
Interactive proof of product feel — not production code. Uses catalog components only.

### Email Studio™
Future Studio OS product for email and newsletter content. Consumes Master Content Pipeline **EXPANSION · APPROVAL · PUBLISH · MEASURE** gates. Queued.

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

### LEARNING GATE™
Final gate — feed performance and lessons into institutional knowledge. Exit: **Institutional Knowledge**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

### Living Headquarters™
Headquarters that evolves with organizational life — seasons, milestones, memory. DR-003 merged.

---

## M

### Master Content Asset™
The single source of truth for campaign content — Page 001, episode, article, video, interview, guide, etc. All platform-specific outputs are **derivatives** linked to this asset. Created in **PRODUCTION GATE™**. See [Master Content Pipeline™](../master-content-pipeline.md).

### Master Content Pipeline™
Canonical **ten-gate** content operating model for Studio OS — production pipeline, not publishing pipeline. Products consume gates; they do not own independent lifecycles. Spec: [master-content-pipeline.md](../master-content-pipeline.md) · [Gates reference](../master-content-pipeline-gates.md). Inherited by Campaign Engine™, Newsroom™, Website Builder™, Publishing Studio™, Social Studio™, Email Studio™, Knowledge Library™, Studio Intelligence™.

### MEASURE GATE™
Ninth gate — measure published asset performance. Exit: **Performance Report**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

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

### PRODUCTION GATE™
Fourth gate — create the Master Content Asset. Exit: **Master Content Asset**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

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

### PUBLISH GATE™
Eighth gate — distribute approved publishing package. Exit: **Published Assets**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

### Publishing Studio™
Distribution and multi-platform publishing product. Queued P2 Phase 3. Consumes **APPROVAL GATE™** and **PUBLISH GATE™** of [Master Content Pipeline™](../master-content-pipeline.md).

---

## R

### REVIEW GATE™
Fifth gate — validate master asset quality before expansion. Exit: **Approved Master Asset**. See [Master Content Pipeline Gates](../master-content-pipeline-gates.md).

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

### Social Studio™
Future Studio OS product for social channel content. Consumes Master Content Pipeline **EXPANSION · APPROVAL · PUBLISH · MEASURE** gates. Queued.

### Studio Constitution™
Supreme platform law — 13 principles. Volume 0. `constitution.yaml`.

### Studio Design Constitution™
Supreme visual law. No product may override. `design/STUDIO_DESIGN_CONSTITUTION.md`.

### Studio Intelligence™
Platform-owned intelligence layer. AI models are replaceable engines beneath it.

### Studio Orb™
Ambient intelligence presence — primary OS interaction anchor. `comp-studio-orb`. M89.1.

### Studio Production Engine™
Department-based UX implementing [Master Content Pipeline™](../master-content-pipeline.md). Ten **department workspaces** (Discover · Development · Assembly · Production · Review · Expansion · Approval · Publishing · Intelligence · Learning) inside Studio Headquarters Production Wing. Users travel with a **living Master Content Asset passport** — not a stacked report page. Spec: [studio-production-engine.md](../studio-production-engine.md). **Not implementation** — governed architecture only.

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

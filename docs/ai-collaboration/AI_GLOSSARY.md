# AI Glossary™ — Canonical Terminology

**Version:** 1.0.0  
**Rule:** Every future AI conversation must use these definitions consistently. Propose additions to the founder before inventing synonyms.

---

## Core platform

### Genesis Core™
The executable constitutional runtime layer — company genome, experience DNA, organizational memory hooks, and Genesis-adjacent platform services. Distinct from Genesis *documentation* in `docs/studio-os/genesis/`. Persisted client-side primarily as `genesis_v1`.

### Genesis Orb™
The primary navigation and attention surface in Headquarters — radial menu, life/culture preferences panel, executive context. Not a generic chat widget; it is the founder's console in the spatial OS.

### Studio OS™
The standalone creative operating system product. Hierarchy: **Studio OS → Workspace Registry → Organizations**. Frontal Slayer is one organization on the host deployment.

### Motherboard
In-repo persistent agent memory at `motherboard/` — `CORE.md`, `CODEBASE.md`, `MEMORY.md`. Used by Cursor agents, not a substitute for this ChatGPT package.

---

## Spatial world

### Studio World™
The living headquarters — a spatial city where every capability has a physical address. Ten foundational districts (Institute, Works, World District, Forge, Labs, Research, Council, Archive, Observatory, Arena). Canon: `docs/studio-world/STUDIO_WORLD_MASTER_PLAN.md`.

### Studio Atlas™
The geographic map projection of Studio World — zoom scales from World to Concept. Shows *where* things are. Not a sitemap or admin menu. Canon: `docs/studio-world/STUDIO_ATLAS_BIBLE.md`.

### Living Knowledge Graph™
The intelligence layer connecting entities (projects, lessons, meetings, assets, professors). Atlas shows where; Knowledge Graph shows why it matters and what relates. Canon: `docs/studio-world/STUDIO_WORLD_LIVING_KNOWLEDGE_GRAPH_BIBLE.md`.

### Studio Council™
District for strategy, meetings, approvals — executive governance in spatial form.

### Studio Forge™
District for ideas → products — manufacturing / creation pipeline metaphor.

### Studio Works™
Creation campus — production floors, assembly, World Compiler metaphorically lives here.

### Civilization Layer™
Culture, traditions, reputation, institutions — how Studio World feels like a society worth belonging to. Canon: `docs/studio-world/STUDIO_WORLD_CIVILIZATION_BIBLE.md`.

---

## Learning

### Studio Institute™
The spatial learning operating system — professors, simulations, campus geography. Not an isolated LMS. Canon: `docs/studio-institute/STUDIO_INSTITUTE_BIBLE.md`.

### Learning DNA™
The global adaptive learning engine — how Institute becomes smarter individually and collectively. Canon: `docs/studio-institute/STUDIO_INSTITUTE_LEARNING_DNA_BIBLE.md`.

### Professor Atlas™
Institute faculty / AI specialist roster tied to disciplines and Knowledge Graph nodes.

---

## Production & compile

### Experience Lab™
Validation render mode for previewing brand environments (concepts A/B/C) without Asset Registry promotion. Ephemeral shell + Scene Stack generation under validation authorization policy.

### World Compiler™
The station assembly pipeline — ordered stages from shell load through layer mount to render readiness report. Code: `src/studio-os-core/scene-stack/world-compiler/`.

### Scene Stack™
Ordered generatable layers for a station: environment-shell → signature-landmark → furniture-objects → lighting → atmosphere → materials → motion → interaction → effects.

### Layer 1 / Signature Landmark™
First generatable layer after shell. ID: `signature-landmark`. World Compiler stage: `mount-landmark`. Landmark generation — not shell generation.

### Environment Shell™
Layer 0 / reference shell. ID: `environment-shell`. Locked immutable reference for subsequent FAL placement layers.

### Compiler (generic)
Any staged transform pipeline with enter/complete/fail transitions. World Compiler is the primary instance in current debugging.

### Compile run / compileRunId
Single diagnostic compile session identifier — one tap = one run in `?compilerDiag=1` mode.

---

## Registry & packages

### Department Package™
Executable bundle registered for a Studio department (e.g. `studio-world-atlas`). Must exist in `DepartmentPackageRegistry` at boot.

### Registry (Department Package Registry)
Singleton registry validating bundled packages at boot. Failure: `Department package not registered: {id}`.

### Asset Registry™
Canonical promoted assets — separate from Scene Stack local drafts. Validation mode does not write here.

### Production Authorization™
Signed authorization required for material generation on governed API routes. Validation client policy ≠ server gate.

---

## Diagnostics

### Black Box / Flight Recorder™
Global append-only operational event recorder. Routes: `/__studio-os-flight-recorder`, etc. Isolated from main app boot.

### FAILED_AT_LAYER_1
Terminal diagnostic freeze state when Layer 1 generation fails in compiler diagnostic mode.

### AI Context Capsule™
Portable export bundle for external AI onboarding — see `EXPORT_SPECIFICATION.md`.

---

## Agents & collaboration

### Composer
Cursor Cloud implementation agent — commits to `master`, one deploy per task.

### Terra
Cursor governance / architecture alignment agent.

### ChatGPT (this glossary context)
External AI Creative Director — authors prompts and reviews; does not commit code.

---

## Commerce (host site)

### Build-a-Wig™ / FSBW
Customer-facing custom wig builder on the same deployment as Studio OS admin. Mobile-first product.

### Frontal Slayer
First production organization / workspace in Studio OS.

---

## Naming rules

- ™ on first mention in formal docs
- kebab-case for code IDs (`signature-landmark`)
- `/__studio-os-*` for diagnostic routes (double underscore prefix)
- Company routes: `/admin/studio/companies/{slug}/...`

---

## Adding terms

When introducing a new canonical term:

1. Founder approves name
2. Add row here with one-line + canon link
3. Append `AI_CHANGELOG.md`
4. Update `AI_CONTEXT.md` if roadmap-level

---

*End of AI Glossary™ v1.0.0*

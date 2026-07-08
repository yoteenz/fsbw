# Creative Intelligence Engine™ — Master Specification

**Engine ID:** `studio.creative-intelligence-engine.v1`  
**Status:** Architectural reset V3 — engine before worlds

---

## The Evolution

| Era | What CDS was | Status |
|-----|--------------|--------|
| **Alpha prototype** | Card pipeline in environment shell | Concept proved · **frozen** |
| **V2 reset** | Room-as-interface · arrival · movement | Philosophy correct · incomplete |
| **V3 (this sprint)** | **Creative Intelligence Engine™** | Engine generates worlds · CDS is proving ground |

**Do NOT continue polishing the prototype.**  
**Do NOT iterate on current implementation.**

---

## What Creative Direction Studio™ Is Now

| Property | Value |
|----------|-------|
| **Product role** | Studio OS **Creative Intelligence Engine™** — first instance |
| **Experience** | Immersive creative headquarters — not software |
| **Metaphor** | Pixar HQ · Apple ID Lab · Hollywood stage · archviz firm |
| **Department ID** | `creative-direction` |
| **Route** | `/admin/studio/department/creative-direction` (preserved) |
| **Benchmark** | Every future Studio OS department inherits this engine |

---

## Core Laws

### Law 1 — Environment Is Interface

> The interface disappears. The environment becomes the interface. The room becomes the workflow.

### Law 2 — Scenes Not Pages

> Every former "tab" is a **workspace scene** — a physical room the founder walks into.

### Law 3 — Physical Department First

> Design the physical department first. Determine where controls naturally exist inside that space.

### Law 4 — Engine Before Pixels

> Do not chase pixel perfection. Build systems that make pixel-perfect environments **possible**.

### Law 5 — Asset-First Layers

> Every environment is assembled from independent reusable layers — not one flat image.

### Law 6 — No Founder Prompts

> Founders express **intent**. The pipeline composes provider calls.

### Law 7 — Remember and Evolve

> Every approved generation is registered · assembled · remembered · continuously evolved.

---

## Creative Intelligence Engine™ Responsibilities

| Responsibility | Module |
|----------------|--------|
| Interpret founder creative intent | Creative Interpreter™ |
| Apply company Visual DNA™ | [Blueprint Engine™](../creative-blueprint-engine/README.md) |
| Search reuse before generate | [Asset Intelligence™](../asset-intelligence-engine/README.md) |
| Plan scene layer manifest | [Scene Planner™](../engines/scene-planner/README.md) |
| Compose provider prompts | Prompt Composer™ |
| Route providers internally | Provider Optimizer™ |
| Validate output quality | Quality Inspector™ |
| Gate founder approval | Approval Queue™ |
| Register approved assets | [Asset Registry™](../engines/studio-asset-registry/README.md) |
| Assemble workspace scenes | Scene Assembly™ |

---

## Relationship to Intelligence Stack

```
Founder enters CDS workspace scene
         ↓
Founder Intent™ (natural language · gestures · genome)
         ↓
★ CREATIVE INTELLIGENCE ENGINE™ ★
         ↓
Scene Stack™ layers generated · approved · composed
         ↓
Completed Workspace™ (living headquarters room)
         ↓
Creative Portfolio™ · Creative Equity™ (long-term value)
```

Integrates: [Scene Stack™](../scene-stack/README.md) · [Production Estimates™](../studio-production-estimates/README.md) · [Generation Manager™](../engines/generation-manager/README.md) · [Creative Approval Pipeline™](../creative-direction-pipeline/README.md).

---

## Anti-Patterns (Forbidden)

| Anti-Pattern | Why |
|--------------|-----|
| Polish prototype cards/spacing | V3 is replacement not iteration |
| Dashboard tabs as pages | Violates scene law |
| Single-image scene generation | Violates asset-first law |
| Founder FAL prompt fields | Violates pipeline law |
| Ship visuals before pipeline | Violates engine-first law |
| HTML/CSS faux architecture layers | [Cursor boundary](../scene-stack/cursor-boundary.md) |

---

## Success Definition

Creative Direction Studio™ should **no longer resemble a website**.

It should feel like stepping into a **living creative headquarters** where:

- Every workspace has a physical purpose
- Every interaction belongs naturally in the environment
- Every scene is **generated · assembled · remembered · evolved** by Studio OS

**Build the engine first. Then let the engine build the worlds.**

---

_See also: [workspaces-as-scenes.md](./workspaces-as-scenes.md) · [prompt-generation-architecture.md](./prompt-generation-architecture.md) · [engine-first-roadmap.md](./engine-first-roadmap.md)_

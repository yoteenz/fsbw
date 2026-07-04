# StudioOS Interactive Manual

Internal operating manual for Frontal Slayer operators — learn by using the live StudioOS interface.

## System names

| Layer | Name | Audience |
|-------|------|----------|
| Customer onboarding | **Onboarding Tutorial** (The Mansion Tour) | Storefront customers |
| Admin training | **StudioOS Interactive Manual** | Studio operators |
| Shared architecture | **Knowledge Graph** | Both (admin primary) |

## Access

- **ⓘ on every Studio module** — opens the **Knowledge Graph entry panel** (overview, walkthrough, workflows, written chapter, connected modules)
- **LEARN THIS WORKSPACE** — fixed button on Studio pages (page-only tour, no full manual replay)
- **Interactive Manual hub** — `/admin/studio/knowledge-hub`
- **Written documentation** — slide-over panel via **OPEN WRITTEN MANUAL CHAPTER**

## Knowledge Hub tabs

Overview · Knowledge Graph · Walkthroughs · Workflow Maps · Search · Written Links · What's New · Progress · Missing Docs · Missing Targets · Wiki

## Architecture

| Path | Role |
|------|------|
| `src/studio-interactive-manual/knowledge-graph/` | Data-driven graph: nodes, edges, workflow maps, search |
| `src/studio-interactive-manual/schema.ts` | Module → Section → Widget → Action hierarchy |
| `src/studio-interactive-manual/buildFromKnowledge.ts` | Compiles Knowledge Hub page guides + graph into manuals |
| `src/studio-interactive-manual/moduleEnrichments.ts` | Flagship module deep-dives (Photography Bible, Asset Factory, etc.) |
| `src/studio-interactive-manual/StudioInteractiveManualContext.tsx` | Provider, spotlight, wizard, search, graph connections |
| `src/components/admin/studio/knowledge-hub/KnowledgeGraphEntryPanel.tsx` | ⓘ entry point into the graph |
| `src/components/admin/studio/StudioManualBridge.tsx` | Links written doc panel ↔ interactive manual |

Manuals and graph nodes are **data-driven** — new Studio modules inherit architecture when registered in `KNOWLEDGE_PAGE_GUIDES` and the graph seed.

## Knowledge Graph

Each node stores: id, name, type, description, purpose, route, targetSelector, relatedNodes, parent/child, workflows, manual chapter, tutorial steps, version, status.

Relationship types include: depends on, creates, updates, displays, publishes to, feeds, generates, teaches, documented by, related to.

Seeded workflow maps:

- **Photography pipeline** — Creative DNA → Master Hero → Asset Factory → Smart Assets → Website
- **Build-A-Wig cart snapshot** — Customer config → Variant lookup → Smart Asset Registry → Cart → Order
- **Rewards** — Purchase → Points → Voucher → Checkout
- **Tutorial layering** — Onboarding Tutorial (customer) ↔ Interactive Manual (admin)

## Layered education

1. **Quick explanation** — ⓘ overview panel
2. **Walkthrough** — spotlight + wizard on live UI
3. **Connected modules** — graph relationships
4. **Written manual chapter** — Owner's Manual cross-link

## Hotspots

Layout targets (all Studio pages):

- `[data-studio-manual="module-header"]`
- `[data-studio-manual="info-button"]`
- `[data-studio-manual="nav-tabs"]`
- `[data-studio-manual="workspace-content"]`

## Progress

Local storage key: `adminStudioInteractiveManual_v2`

Tracks separately from customer Onboarding Tutorial progress: modules learned, features, widgets, workflows, graph nodes visited, manual chapters viewed, walkthroughs completed, overall knowledge %, resume position.

## Search

Examples: “How does Asset Factory work?”, “What is Creative DNA?”, “Where do cart images come from?”, “What does FALLBACK_USED mean?”, “How does Build-A-Wig connect to orders?”

Returns graph nodes, walkthroughs, written doc hits, workflows, and connected modules.

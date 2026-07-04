# StudioOS Interactive Manual

Internal operating manual for Frontal Slayer operators — learn by using the live StudioOS interface.

## Access

- **ⓘ on every Studio module** — launches the Interactive Manual walkthrough (spotlight + wizard)
- **LEARN THIS WORKSPACE** — fixed button on Studio pages (page-only tour, no full manual replay)
- **Interactive Manual hub** — `/admin/studio/knowledge-hub` (tabs: Interactive Manual, Progress, What's New, Wiki)
- **Written documentation** — slide-over panel via **OPEN WRITTEN DOC** (Owner's Manual chapters)

## Architecture

| Path | Role |
|------|------|
| `src/studio-interactive-manual/schema.ts` | Module → Section → Widget → Action hierarchy |
| `src/studio-interactive-manual/buildFromKnowledge.ts` | Compiles Knowledge Hub page guides into manuals |
| `src/studio-interactive-manual/moduleEnrichments.ts` | Flagship module deep-dives (Asset Factory, etc.) |
| `src/studio-interactive-manual/registry.ts` | Runtime module registry |
| `src/studio-interactive-manual/StudioInteractiveManualContext.tsx` | Provider, spotlight, wizard, search |
| `src/components/admin/studio/StudioManualBridge.tsx` | Links written doc panel ↔ interactive manual |

Manuals are **data-driven** — new Studio modules inherit architecture when registered in `KNOWLEDGE_PAGE_GUIDES`.

## Hotspots

Layout targets (all Studio pages):

- `[data-studio-manual="module-header"]`
- `[data-studio-manual="info-button"]`
- `[data-studio-manual="nav-tabs"]`
- `[data-studio-manual="workspace-content"]`

## Progress

Local storage key: `adminStudioInteractiveManual_v1`

Tracks: modules learned, features, widgets, workflows, overall knowledge %, resume position.

## Search

Examples: “How do approvals work?”, “How does Asset Factory work?”, “How do variants inherit?”

Launches the matching module walkthrough at the relevant step.

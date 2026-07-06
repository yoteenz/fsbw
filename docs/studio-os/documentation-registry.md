# Documentation Registry™ V1.0 (Milestone 126)

**Route:** `/admin/studio/documentation-registry`

## Purpose

**Documentation Registry™** is the single source of truth for all Studio OS documentation. Every feature registers once with structured metadata; every documentation system consumes that registration automatically.

> One source. Infinite knowledge. Always synchronized.

## Core philosophy

- **One registration, many consumers** — like Profession Brain™ for expertise, the registry is infrastructure for documentation
- **No duplicate maintenance** — manual, walkthrough, Academy, FAQ, tooltips, search, and Command Dock read from the registry
- **Concept-aware search** — aliases, abbreviations, misspellings, and semantic clusters (not keywords alone)
- **Contextual help** — documentation resolves from the user's current page, panel, or route
- **Version history** — current, previous, deprecated, and upcoming features preserved

## Registry metadata

Each feature exposes structured fields including:

Official Name · Internal ID · Category · Description · Purpose · Capabilities · Dependencies · Related Systems · Status · Owner · Version · Release Date · Last Updated · Associated Departments · Associated Concierges · Associated Workflows · Supported Organizations · Required Permissions · Feature Flags · Keywords · Aliases · Search Synonyms · Documentation Links · Academy Lessons · Tutorial References · Walkthrough References · Tooltips · FAQ References · Command Dock References · Developer Documentation · Architecture Documentation · Release Notes · Example Workflows · Related Screens · Related Components · Future Milestones

## Architecture

| Layer | Path |
|-------|------|
| Canonical system list (M125) | `documentation-sync/system-registry.ts` |
| Full registry expansion | `documentation-registry/registry-builder.ts` |
| Registration API | `documentation-registry/registration.ts` |
| Smart search | `documentation-registry/smart-search.ts` |
| Walkthrough sync | `documentation-registry/walkthrough-sync.ts` |
| Academy sync | `documentation-registry/academy-sync.ts` |
| Contextual docs | `documentation-registry/contextual-docs.ts` |
| Health dashboard | `documentation-registry/health-dashboard.ts` |
| Version history | `documentation-registry/version-history.ts` |
| Auto-sync | `documentation-registry/auto-sync.ts` |
| Command Dock | `documentation-registry/dock-advisor.ts` |

## Auto-sync surfaces

When a feature registers or updates, consumers refresh automatically:

Studio Manual · Getting Started Guide · Interactive Walkthrough · Academy · Help Center · Search Index · Tooltips · FAQ · Developer Docs · Architecture Docs · Command Dock Help · Release Notes · Feature Registry · Version History

## Smart search

**`queryDocumentationRegistry()`** queries the registry first (also wired into `searchIndex.ts` and Knowledge Hub search).

Example clusters:

- **"memory"** → Memory Engine™, Legacy Vault™, Knowledge Fabric™, Organization Consciousness™
- **"AI"** → Studio Intelligence™, Model Orchestrator™, Profession Brain™, Foundation Models™

## Walkthrough & Academy

- **Walkthrough:** `organization-inauguration/walkthrough.ts` uses `buildWalkthroughStopsFromRegistry()` — no hardcoded steps
- **Academy:** `buildAcademyLessonsFromRegistry()` generates Studio Institute™ lesson candidates from registry entries

## Command Dock

**`resolveDocumentationRegistryAdvice()`** handles platform documentation questions before Documentation Sync fallback:

- *"Explain Profession Brain™."*
- *"How does Executive Council™ work?"*
- *"What changed in the latest release?"*
- *"Show Documentation Registry health."*

Proactive lines on Knowledge Hub, Documentation Registry workspace, and Mission Control.

## Sync chain

Studio Foundation Models → Documentation Sync → **Documentation Registry**

**`documentation-sync/store`** triggers **`syncDocumentationRegistryFromSources`** · **boundary-sync** · registry **`auto-sync`** invalidates caches without circular resync

## UI

- **`DocumentationRegistryWorkspace`** — Overview · Feature Registry · Documentation Health · Auto-Sync · Smart Search
- **`MissionControlDocumentationRegistryPanel`** in Legacy Wing
- Hook: **`useDocumentationRegistryState`**

## Storage

Demo localStorage: `studioOsDocumentationRegistry_v1`

## Brand voice

*"One source. Infinite knowledge. Always synchronized."*

Accent: `#0891B2`

## Developer integration

When adding a new milestone module:

1. Add one entry to **`documentation-sync/system-registry.ts`**
2. Registry builder expands it into full metadata automatically
3. Optional: **`registerDocumentationFeature()`** for custom overrides
4. Run sync chain — all surfaces update without manual copying

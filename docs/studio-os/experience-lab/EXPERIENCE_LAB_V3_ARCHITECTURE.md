# Experience Lab V3 — Five-Workspace Operating System

**Status:** Experimental parallel branch (rebooted 2026-07-14)  
**Routes:** `/admin/studio/experience-lab-v3` · `/admin/studio/world-builder` · `/admin/studio/world-v3`  
**V2:** Frozen at `/admin/studio/experience-lab-v2` — **do not modify**

## Vision

Experience Lab V3 is an operating system — not a single page. The **shell stays persistent** while the **viewport becomes a swipeable five-workspace system**. V2 visual language (glass, typography, command dock, design variants, workbench, blueprint panel) is preserved in a **separate V3 implementation**.

## Isolation rules

| Rule | Enforcement |
|------|-------------|
| No V2 imports | V3 lives in `src/features/studio-world/experience-lab-v3/` only |
| No V2 file edits | V2 directory frozen |
| Separate CSS | `experience-lab-v3.css` only |
| Separate store | `ExperienceLabV3StoreProvider` |
| Deletable | Removing V3 folder + routes leaves V2 intact |

## Architecture

```
ExperienceLabV3Shell (persistent shell)
├── V3CommandDock (header · program · pipeline · breadcrumb · status)
├── V3WorkspacePills (Environment → Production → Review → Assets → Intelligence)
├── V3WorkspaceStage (horizontal swipe viewport)
│   ├── V3EnvironmentWorkspace (immersive render)
│   ├── V3ProductionWorkspace (mission control)
│   ├── V3ReviewWorkspace (founder approval)
│   ├── V3AssetsWorkspace (warehouse)
│   ├── V3IntelligenceWorkspace (analytics)
│   ├── V3BlueprintPanel (persistent floating — content adapts per workspace)
│   └── V3ContextInspector (single interchangeable inspector)
├── V3DesignVariantStrip (always beneath viewport, synced across workspaces)
├── V3ContextAwareWorkbench (tools swap per active workspace)
├── V3StudioSpotlightSearch (⌘K)
└── V3StudioAiAssistantDock
```

## Five workspaces

| # | Workspace | Purpose |
|---|-----------|---------|
| 01 | Environment | Creative design — full render, blueprint, environment package |
| 02 | Production | Execution — queue, pipeline, work orders, dependencies |
| 03 | Review | Founder decisions — brief, timeline, approvals |
| 04 | Assets | Warehouse — blueprints, materials, packages, presets |
| 05 | Intelligence | Analytics — budget, providers, diagnostics, queue health |

**Navigation:** horizontal swipe + workspace pills. Shell never changes.

## Panel rules

- **Blueprint panel** — only persistent floating panel; content adapts per workspace
- **Context inspector** — exactly one; morphs on workbench tool (Lighting → Materials → Camera…)
- **No stacked overlays** — never multiple floating inspectors

## Context-aware workbench

| Workspace | Tools |
|-----------|-------|
| Environment | Blueprint, Lighting, Materials, Construction, Camera, Compare, Split View |
| Production | Pause, Retry, Dependencies, Outputs, Logs, Priority, Assign |
| Review | Approve, Reject, Compare, Comment, Promote, Request Revision, History |
| Assets | Publish, Save, Duplicate, Archive, Export, Marketplace, Metadata |
| Intelligence | Budget, Forecast, Providers, Diagnostics, Reports, Performance, Queue Health |

## Package integration

All workspaces reference the same Environment Package state — no duplicate variants or revisions.

## Feature flags

| Flag | Default |
|------|---------|
| `VITE_EXPERIENCE_LAB_V3_ENABLED` | true (admin) |
| `VITE_EXPERIENCE_LAB_V3_WORLD_BUILDER` | true |
| `VITE_EXPERIENCE_LAB_V3_SPOTLIGHT` | true |
| `VITE_EXPERIENCE_LAB_V3_AI_ASSISTANT` | true |
| `VITE_EXPERIENCE_LAB_V3_OPS_TICKER` | true |

## Tests

`src/features/studio-world/experience-lab-v3/experience-lab-v3.test.ts`

## Related

- V2 live workspace: `docs/studio-os/experience-lab/EXPERIENCE_LAB_EVENT_DRIVEN_WORKSPACE.md`
- V2 frozen reference: `/admin/studio/experience-lab-v2`

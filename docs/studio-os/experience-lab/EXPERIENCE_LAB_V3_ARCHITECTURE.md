# Experience Lab V3 — World-Building OS Architecture

**Status:** Experimental parallel branch  
**Routes:** `/admin/studio/experience-lab-v3` · `/admin/studio/world-builder` (alias)  
**V2:** Frozen at `/admin/studio/experience-lab-v2` — **do not modify**

## Design philosophy

V3 studies operational clarity (workflow, speed, hierarchy, awareness) — not Zota branding. Studio World remains luxury, cinematic, architectural, premium. UX communicates **production** over **presentation**.

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
ExperienceLabV3Shell
├── V3ProgramSelector (Studio World / Industry Packs → dynamic departments)
├── V3WorkspaceContextHud (one-glance context chain)
├── V3LiveOperationBoard (Queued, Generating, Blocked, Review, …)
├── Left rail: V3ProductionTimelinePanel, V3PipelineView, V3QueueBoard, V3PackageViewPanel
├── Center: V3Viewport (hero render) + V3DynamicWorkbench (tool launcher)
├── Right rail: V3BlueprintInspectorPanel (persistent) + V3ActiveWorkOrderPanel (single) + V3ContextInspectorPanel (single, replaces on tool change)
├── V3BottomOperationsBoard (mission control metrics)
├── V3StudioSpotlightSearch (⌘K)
└── V3StudioAiAssistantDock
```

## Core models

- **Work orders** — every production task (generate blueprint, mobile, materials, package, …) with progress, ETA, priority, cost, owner, dependencies
- **Package view** — desktop-canonical multi-device outputs (mobile/tablet/hero derive from desktop)
- **Pipeline** — Queued → Preparing → AI Generation → Validation → Consistency → Founder Review → Canonical → Marketplace
- **Revision hierarchy** — render → revision → package → environment

## Feature flags

| Flag | Default |
|------|---------|
| `VITE_EXPERIENCE_LAB_V3_ENABLED` | true (admin) |
| `VITE_EXPERIENCE_LAB_V3_WORLD_BUILDER` | true |
| `VITE_EXPERIENCE_LAB_V3_SPOTLIGHT` | true |
| `VITE_EXPERIENCE_LAB_V3_AI_ASSISTANT` | true |
| `VITE_EXPERIENCE_LAB_V3_QUEUE_DRAG` | false |
| `VITE_EXPERIENCE_LAB_V3_OPS_TICKER` | true |

## Tests

`src/features/studio-world/experience-lab-v3/experience-lab-v3.test.ts`

## Related

- V2 live workspace: `docs/studio-os/experience-lab/EXPERIENCE_LAB_EVENT_DRIVEN_WORKSPACE.md`
- V2 route: `/admin/studio/experience-lab-v2`

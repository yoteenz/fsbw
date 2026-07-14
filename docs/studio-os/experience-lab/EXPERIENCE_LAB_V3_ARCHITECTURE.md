# Experience Lab V3 — V2 Shell + Viewport Workspace Pager

**Status:** Experimental (rebased onto V2 shell 2026-07-14)  
**Routes:** `/admin/studio/experience-lab-v3` · `/admin/studio/world-builder` · `/admin/studio/world-v3`  
**V2:** Frozen at `/admin/studio/experience-lab-v2` — **do not modify**

## Model

V3 = **Experience Lab V2 canonical shell** + **horizontal viewport workspace pager**.

When sitting on **Environment**, V2 and V3 should look nearly identical. The only obvious differences:

- iOS-style **segmented workspace control** above the viewport
- Ability to **swipe** between workspaces

Everything outside the viewport (Command Dock, Workbench, Living Orb, lower deck, drawers, side rails) uses **V2 components and CSS unchanged**.

## Five viewport workspaces

| # | Workspace | Content |
|---|-----------|---------|
| 01 | Environment | Full `ExperienceLabViewportStage` (today's Experience Lab) |
| 02 | Production | Zota-inspired ops — queue, pipeline, work orders |
| 03 | Review | Founder approval wall, brief, timeline |
| 04 | Assets | Environment package outputs + asset library |
| 05 | Command | Mission control diagnostics |

**No vertical page switching.** Workspace changes only via swipe or segmented control.

## Implementation

```
ExperienceLabV3Shell
├── V2: ProgramContextProvider, LiveWorkspaceProvider, useExperienceLabAppShell
├── V2: ExperienceLabCommandDock (unchanged)
├── V2: ExperienceLabWorkstationFrame
│   ├── V2 side rails (desktop)
│   ├── V3WorkspaceViewportPager (replaces viewport only)
│   │   ├── V3WorkspaceSegmentedControl
│   │   └── 5 lazy-mounted panes (adjacent preload)
│   └── V2 lower deck: FounderReviewConsole, ApprovalBridge, FounderWorkbench, Orb
└── V2: ExperienceLabSheet overlays
```

**CSS:** `experience-lab-v2.css` (shell) + `experience-lab-v3-pager.css` (pager only)

**Page:** `fixedViewport` (same as V2)

## Workbench integration

V2 workbench tool selection can switch viewport workspace via `v3-workbench-workspace-map.ts` (e.g. Lighting → Environment, Workforce → Production).

## Tests

`src/features/studio-world/experience-lab-v3/experience-lab-v3.test.ts`

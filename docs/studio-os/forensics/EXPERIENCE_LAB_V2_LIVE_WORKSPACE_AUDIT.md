# Experience Lab V2 Live Workspace — Forensic Audit

**Sprint:** P0 Experience Lab V2 Live Workspace Wiring  
**Date:** 2026-07-14  
**Verdict:** Mock business state replaced with canonical `ExperienceLabLiveWorkspaceViewModel` driven by active Environment Asset Package.

## Pre-wiring placeholder inventory

| Section | Pre-wiring source | Post-wiring source |
|---------|-------------------|-------------------|
| Design Brief | `charterSummary` only; mood hardcoded "Luxury / Power / Innovation" | `liveWorkspace.designBrief` from package + charter |
| Founder Review Wall | Static 3 dots; nav buttons dead; `founderRender` never passed | `liveWorkspace.founderReviewEntries` from revision history + outputs |
| Revision Timeline | `REVISION_POINTS = [13–18]`, `CHART_HEIGHTS` hardcoded | `liveWorkspace.timelineEvents` from package revision + audit log |
| Blueprint Display | Package bridge; blueprint output usually `pending` | `resolveExperienceLabBlueprintDisplay` state machine |
| Dynamic Context | Partial model fields; static copy for lighting/workforce | `liveWorkspace.workbenchModules` per tool |
| Approval Bridge | Real gating; `onApprove` not wired | Package `approveForProduction` via shell handler |
| Workbench tools | Selection worked; tools sheet buttons dead | Registry-driven; sheet wires `handleWorkbenchToolChange` |
| Tools sheet | Static labels, no handlers | Maps to workbench tool IDs |
| Founder render | Adapter accepted `founderRender` but shell never passed | Derived from package desktop/mobile outputs |
| Pipeline environmentId | Not tied to variant selection | Provider invalidates on Command Dock + variant change |

## Canonical data ownership

- **Environment Package owns:** outputs, prompts, provider/model, seed, costs, status, revision history, audit events, readiness, approval, canonical state
- **UI owns:** workbench tool selection (presentation), historical preview revision, expanded/collapsed state
- **Live workspace provider:** page-level sync boundary; no duplicate package records

## Files introduced

- `live-workspace/ExperienceLabLiveWorkspaceViewModel.ts`
- `live-workspace/buildExperienceLabLiveWorkspaceViewModel.ts`
- `live-workspace/resolveExperienceLabBlueprintDisplay.ts`
- `live-workspace/StudioWorldWorkbenchRegistry.ts`
- `live-workspace/ExperienceLabLiveWorkspaceProvider.tsx`
- `live-workspace/liveWorkspaceToV2ViewModel.ts`
- `live-workspace/experience-lab-package-actions.ts`
- `live-workspace/experience-lab-live-workspace-diagnostics.ts`

## Remaining limitations

- Blueprint image requires package `outputs.blueprint` generation completion (preview-cache bootstrap seeds mobile/desktop only)
- Durable Supabase repository active only when `VITE_ENABLE_PACKAGE_PERSISTENCE=true`
- Historical preview mode sets revision context; does not mutate canonical package state
- Realtime uses provider `syncTick` invalidation; no separate event bus when persistence disabled

## Non-goals preserved

- No UI redesign (Command Dock, viewport anchors, workbench shell, Living Orb unchanged)
- No Environment Package schema changes
- Legacy `/admin/studio/experience-lab` route untouched

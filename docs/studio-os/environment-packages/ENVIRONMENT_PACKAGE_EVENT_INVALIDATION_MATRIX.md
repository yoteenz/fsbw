# Environment Package Event Invalidation Matrix

Targeted invalidation — **never** global page refetch.

Implementation: `resolveInvalidationsForEvent()` in  
`src/studio-os-core/environment-asset-package/events/EnvironmentPackageEventInvalidationMatrix.ts`

## Selectors

| Selector | Surfaces |
|----------|----------|
| `active-package` | Package drawer, status, health |
| `package-outputs` | Output registry |
| `blueprint-display` | Persistent Blueprint Display |
| `design-brief` | Design Brief card |
| `founder-review-wall` | Founder Review Wall |
| `revision-timeline` | Revision Timeline |
| `architectural-tools` | Workbench — Architectural Tools |
| `material-library` | Workbench — Material Library |
| `asset-reference` | Workbench — Asset Reference |
| `budget-forecast` | Workbench — Budget Forecast |
| `workforce-center` | Workbench — Workforce Center |
| `permit-center` | Workbench — Permit Center |
| `approval-bridge` | Approval Bridge |
| `package-readiness` | Readiness / blockers |
| `generation-jobs` | Job queue / progress |

## Key mappings

### `BLUEPRINT_UPDATED`
`active-package`, `package-outputs`, `blueprint-display`, `architectural-tools`, `design-brief`, `founder-review-wall`, `revision-timeline`, `package-health`, `approval-bridge`

### `BUDGET_UPDATED` / `ACTUAL_COST_UPDATED`
`budget-forecast`, `design-brief`, `package-health`

### `READINESS_UPDATED` / `BLOCKER_*`
`package-readiness`, `permit-center`, `design-brief`, `approval-bridge`, `package-health`

### `REVISION_COMPLETED`
`founder-review-wall`, `revision-timeline`, `design-brief`, `active-package`, `approval-bridge`

### `ACTIVE_VARIANT_CHANGED` / `ACTIVE_PACKAGE_CHANGED`
Full workspace selector set (context transition)

## Reconciliation

`reconcileExperienceLabWorkspace()` maps invalidations → `refreshPackage` when `active-package` or `package-outputs` affected.

Workbench tool selection is **never** changed by unrelated events (`switchWorkbenchTool: false`).

## Fallback rules

- `OUTPUT_*` → `package-outputs`, `design-brief`
- `GENERATION_*` → `generation-jobs`, `revision-timeline`
- `ACTIVE_*` → `active-package`
- Unknown → `active-package` only

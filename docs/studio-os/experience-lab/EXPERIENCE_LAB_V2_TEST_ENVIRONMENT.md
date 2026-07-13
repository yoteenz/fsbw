# Experience Lab V2 Test Environment

**Status:** Test route only — production Experience Lab unchanged.

## Routes

| Route | Purpose |
|-------|---------|
| `/admin/studio/experience-lab` | **Production** — unchanged, fully operational |
| `/admin/studio/experience-lab-v2` | **Canonical V2 test environment** |
| `/admin/studio/experience-lab/test-v2` | Alias redirect → `-v2` |

## Principles

- React owns the complete page structure and all interactive content.
- AI-generated environment art sits **beneath** the interface as a decorative layer.
- Environment images must **not** contain production UI, panels, typography, or navigation.
- V2 displays native badges: **EXPERIENCE LAB V2 — TEST ENVIRONMENT** and **NOT YET PRODUCTION**.

## Component structure

```
src/features/studio-world/experience-lab-v2/
  ExperienceLabV2Shell.tsx       — main layout orchestrator
  StudioViewport.tsx             — universal center viewport
  ExperienceLabEnvironmentLayer.tsx
  ExperienceLabV2Header.tsx      — command dock
  ExperienceLabLeftInspector.tsx / ExperienceLabRightInspector.tsx
  ExperienceLabWorkbench.tsx     — founder review console
  ExperienceLabApprovalBar.tsx
  ExperienceLabToolDock.tsx
  ExperienceLabDiagnostics.tsx   — test modes + migration readiness
  experience-lab-v2-view-model-adapter.ts
  experience-lab-v2-feature-flags.ts
  experience-lab-v2-test-modes.ts
```

## Test modes

| Mode | Behavior |
|------|----------|
| `MOCK` | Fixtures only, no production writes |
| `READ_ONLY` | Reads live data, no mutations (default) |
| `CONTROLLED_LIVE` | Selected production actions with confirmation + server flag |

## Feature flags

- `VITE_EXPERIENCE_LAB_V2_ENABLED` (default true for Studio World Admin)
- `VITE_EXPERIENCE_LAB_V2_LIVE_ACTIONS` (default false)
- `VITE_EXPERIENCE_LAB_V2_ENVIRONMENT`
- `VITE_EXPERIENCE_LAB_V2_DIAGNOSTICS`
- `VITE_EXPERIENCE_LAB_V2_MOBILE_DOCK`

Server write enforcement: `api/_lib/experienceLabV2Flags.ts` + `EXPERIENCE_LAB_V2_LIVE_ACTIONS`.

## Cutover

Production route migration requires a **separate explicit Founder-approved sprint**. V2 diagnostics panel records readiness checkboxes only — no auto-migration.

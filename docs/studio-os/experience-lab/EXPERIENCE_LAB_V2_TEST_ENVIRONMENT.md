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
- AI-generated environment art sits **beneath** the interface as a decorative layer (Layer 1).
- Environment images must **not** contain production UI, panels, typography, or navigation.
- Viewport content (blueprint, founder render, construction, materials, lighting, camera) appears **only** inside `StudioViewport` (Layer 3).
- V2 displays native badges: **EXPERIENCE LAB V2 — TEST ENVIRONMENT** and **NOT YET PRODUCTION**.

## Three-layer architecture

| Layer | Responsibility |
|-------|----------------|
| **Layer 1 — Environment** | `ExperienceLabEnvironmentLayer` — architectural atmosphere only |
| **Layer 2 — React UI** | Command dock, floating inspectors, workbench, approval bridge, docks |
| **Layer 3 — Viewport content** | Blueprint, founder render, construction, materials, lighting, camera inside `StudioViewport` |

## Component structure (immersive command interface)

```
src/features/studio-world/experience-lab-v2/
  ExperienceLabV2Shell.tsx           — three-layer orchestrator
  ExperienceLabEnvironmentLayer.tsx  — Layer 1 decorative room
  ExperienceLabCommandDock.tsx         — unified command dock (desktop + mobile rows)
  ExperienceLabRegistrySidebar.tsx   — desktop left registry tree
  ExperienceLabGovernanceSidebar.tsx — desktop right scene/performance/permits
  ExperienceLabViewportStage.tsx     — viewport stage + floating inspectors + view angles
  StudioViewport.tsx                 — Layer 3 universal center viewport + mode rail
  ExperienceLabFloatingInspector.tsx — mounted floating panels (not dashboard cards)
  ExperienceLabFounderWorkbench.tsx  — integrated founder review console
  ExperienceLabApprovalBridge.tsx    — illuminated CDS approval bridge
  ExperienceLabWorkbenchDock.tsx     — architectural tool tray (6 tools)
  ExperienceLabDepartmentDock.tsx    — global Studio World bottom dock
  ExperienceLabDiagnostics.tsx       — test modes + migration readiness drawer
  experience-lab-v2-composition.ts   — composition markers for tests
  experience-lab-v2-view-model-adapter.ts
  experience-lab-v2-feature-flags.ts
  experience-lab-v2-test-modes.ts
  experience-lab-v2.css              — immersive workstation visual language
```

**Legacy presentation components** (`ExperienceLabV2Header`, `ExperienceLabLeftInspector`, `ExperienceLabRightInspector`, `ExperienceLabWorkbench`, `ExperienceLabApprovalBar`, `ExperienceLabToolDock`) remain in the folder for reference but are **not** wired by the V2 shell.

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

## Review screenshots

Captured via `E2E_LOCAL_SERVER=1 node scripts/capture-experience-lab-v2-screenshots.mjs`:

- `docs/studio-os/experience-lab/v2-screenshots/`
- Viewports: 390×844, 430×932, tablet portrait, desktop, ultrawide

## Cutover

Production route migration requires a **separate explicit Founder-approved sprint**. V2 diagnostics panel records readiness checkboxes only — no auto-migration.

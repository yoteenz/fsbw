# Studio World — Components Inventory

**Scale (observed):**

| Location | Approx. count |
| --- | --- |
| `src/components/admin/studio/` | ~293 top-level files/folders; ~1000+ total files |
| `src/components/admin/studio-os/` | ~20 top-level areas |
| `src/features/studio-world/` | experience-lab-v2, v3, icons |
| `src/studio-os-core/` | Domain logic (not all React components) |

---

## Shared chrome (Studio-wide)

| Component | Path | Role |
| --- | --- | --- |
| Admin studio layout | `AdminStudioLayout.tsx` | Orb, nav tabs, knowledge hub shell |
| Module page shell | `AdminStudioModulePageShell.tsx` | Standard department page frame |
| Placeholder shell | `AdminStudioPlaceholderShell.tsx` | Incomplete modules |
| Boot | `studio-boot/StudioBootGate.tsx`, `StudioRouteSuspenseFallback.tsx` | Boot sequencing, suspense |
| Navigation | `navigation/`, `AdminStudioNavTabs.tsx`, `AdminStudioBreadcrumbTrail.tsx` | Nav UI |
| Immersion | `immersion/StudioImmersionShell.tsx`, ambient layers | HQ presence |
| Studio Orb | `studio-orb/*` | Executive orb UI, voice, recommendations |
| Global experience | `global-experience/StudioWorldExperienceProvider.tsx` | Cross-room context |

**Classification:** **Shared** across departments; **exclusive** to Studio World admin.

---

## Feature-grouped components (exclusive)

### Genesis & experience platform

| Feature | Path | Notes |
| --- | --- | --- |
| Genesis workspace | `genesis/GenesisWorkspace.tsx` | Genesis UI |
| Experience Lab | `experience-lab/*` | Pipeline status, render preview, workspaces |
| Experience Engine UI | `experience-engine/` (pages + components) | Tied to genesis core |
| World atlas | `world-atlas/StudioWorldAtlasRoom.tsx` | Atlas room |

### Creative Direction Studio

| Feature | Path |
| --- | --- |
| CDS room | `src/components/admin/studio-os/creative-direction-studio/*` |
| Scene Stack viewport | `SceneStackViewport.tsx` (CDS) |
| Company routes | `company-routes/CompanyRouteShell.tsx` |

### Content & production departments

| Feature | Path pattern |
| --- | --- |
| Content brain | `content-brain/` |
| Creative director | `creative-director/` |
| Production studio | `production-studio/` |
| AI production | `AdminStudioAiProduction*` root files |
| Distribution | `AdminStudioDistribution*` |
| Asset director | `asset-director/` + root cards |
| Show bible / shows | `show-bible/`, show cards |

### Intelligence & executive

| Feature | Path |
| --- | --- |
| Mission control | `mission-control/` |
| Studio intelligence | `studio-intelligence/`, `studio-intelligence-layer/` |
| Chief officer rooms | `chief-*` folders matching routes |
| Executive cards | `AdminStudioExecutive*` |

### Institute & knowledge

| Feature | Path |
| --- | --- |
| Studio institute admin | `studio-institute/StudioInstituteWorkspace.tsx` |
| Knowledge hub UI | Linked from institute routes |

### Platform / registries (UI)

| Feature | Path |
| --- | --- |
| Model orchestrator | page + workspace components |
| Foundation models | `studio-foundation-models/` |
| Prompt library | `architects-prompt-library/`, prompt list items |
| Studio OS design DNA | `studio-os-design-dna/` |

### Studio Administration (portfolio)

| Component | Path |
| --- | --- |
| Platform layout | `StudioPlatformLayout.tsx` |
| Guards | `StudioAdministrationGuard.tsx`, `StudioWorkspaceGuard.tsx` |
| Workspace creation | `workspace-creation/` |
| NDXbook | `ndxbook-*` |

---

## Shared with host (Studio depends)

| Component | Path | Studio usage |
| --- | --- | --- |
| Admin guards | `AdminStudioWorkspaceGuard.tsx` | Workspace load |
| Lazy helper | `lazyWithRetry` in App | All studio pages |

**Not inventoried:** Customer `src/components` except where imported by studio paths (grep per feature if needed).

---

## Legacy / placeholder / unused patterns (observed)

| Signal | Evidence |
| --- | --- |
| **Placeholder** | `AdminStudioPlaceholderShell.tsx`, many `*-engine` rooms with demo status in nav |
| **Legacy nav group** | `STUDIO_NAV_GROUPS` id `legacy`; `legacy-system` route |
| **Duplicate lab surfaces** | experience-lab, v2, v3 component trees |
| **Demo metric cards** | `AdminStudioModuleCard` with static demo metrics |
| **Former feature names** | `route-registry.ts` `formerFeatureName` field on mappings |

No static analysis of import graph performed; “unused” = routing/registry signals only.

---

## Classification summary

| Type | Estimate |
| --- | --- |
| **Exclusive Studio UI** | Majority of `components/admin/studio` |
| **Studio OS admin exclusive** | `components/admin/studio-os` |
| **Core non-UI** | `studio-os-core` engines |
| **Shared host** | App shell, guards, Supabase hooks used by studio pages |
| **Legacy/placeholder** | Legacy group + placeholder shell + demo-tagged modules |

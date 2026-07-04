# StudioOS Core Modules

Industry-agnostic platform modules registered in `src/studio-os/core/modules.ts`.

| Module | Route Segment | Role |
|--------|---------------|------|
| Executive Command Center | `executive-command-center` | Workspace executive overview |
| Studio Dashboard | `hub` | Creative operations directory |
| Content Brain | `content-brain` | Brand knowledge & editorial intelligence |
| Creative Director | `creative-director` | Pre-production creative decisions |
| Intelligence Engine | `intelligence-engine` | Evidence-based recommendations |
| Show Bible | `show-bible` | Show DNA and production standards |
| Asset Director | `asset-director` | Visual source of truth |
| Studio Lot | `studio-lot` | Virtual production environments |
| Talent Agency | `talent-agency` | On-camera personalities |
| Casting | `casting` | Casting board and approvals |
| Production Pipeline | `production` | Operational production flow |
| AI Production Engine | `ai-production-engine` | Automated execution layer |
| Distribution Network | `distribution-network` | Multi-channel publishing |
| Audience Brain | `audience-brain` | Audience intelligence |
| Legacy System | `legacy-system` | Institutional archive |

Module labels and descriptions in Core are generic. Workspace-specific subtitles live in each Workspace config (`moduleCopy`).

Service stubs remain in `src/services/studio/` and register via `STUDIO_SERVICE_REGISTRY`.

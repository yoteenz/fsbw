# Studio World — Place Inventory (Forensic Audit1)

**Source of truth for named places:** `src/studio-os-core/studio-world/route-registry.ts` (**89** route→location mappings).  
**Additional canon places (doc-only):** `docs/studio-world/002_WORLD_ARCHITECTURE.md` (wings, floors).

Legend: **Status** = migrationStatus / implementation evidence. **Alignment** = product firewall guess.

---

## Company / work

| Name | Source | Status | Function | Actors | Access | Data | Alignment | Spatial role | Reuse |
|------|--------|--------|----------|--------|--------|------|-----------|--------------|-------|
| Studio Command Center™ | route-registry | immersive-partial | Executive ops | Founder, exec | Org HQ | Partial | STUDIO WORLD | Command district | KEEP |
| Mission Control Room™ | route-registry | immersive-partial | Overview / queue | Founder | Executive | Partial | STUDIO WORLD | Command | KEEP |
| Operations Coordination Room™ | route-registry | standard-room | Work orchestration | Ops | Team | OS state | STUDIO OS shell | Room | EVOLVE |
| Production Wall™ | route-registry | standard-room | Pipeline | Production | Team | Partial | STUDIO WORLD | Production wing | KEEP |
| Casting Studio™ | route-registry | standard-room | Cast / talent | Production | Team | Resident cast schema | STUDIO WORLD | Production | KEEP |
| Talent Theater™ | route-registry | standard-room | Hiring metaphor | HR/Ops | Team | Demo | STUDIO WORLD | Production | EVOLVE |

## Production

| Name | Source | Status | Function | Spatial role |
|------|--------|--------|----------|--------------|
| Studio Warehouse™ | route-registry | immersive-live | Asset production hub | Building |
| Generation Bay™ (Asset Factory) | route-registry | immersive-partial | Governed generation | Laboratory |
| Asset Registry Vault™ | route-registry | standard-room | Asset catalog | Vault |
| Render Queue Bay™ | route-registry | standard-room | Render jobs | Room |

## Social / public

| Name | Source | Status | Function | Spatial role |
|------|--------|--------|----------|--------------|
| Arrival Experience Garden™ | route-registry | standard-room | Entry orientation | Garden |
| Campus Map Atrium™ | route-registry | standard-room | Nav / overview | Atrium |
| Marketplace Pavilion™ | route-registry | immersive-partial | Packs / workforce economy | Pavilion |

## Residential (logical — resident life)

| Name | Source | Status | Function | Spatial role |
|------|--------|--------|----------|--------------|
| Resident `home` refs | life-os-seed | IMPLEMENTED | Home identity | Logical residence |
| Creative Direction Floor, Fab Lab, etc. | life-os-seed LOCATIONS | IMPLEMENTED | Work/social locations | Logical — map to wings in 002 |

## Commercial / marketing

| Name | Source | Status | Function | Spatial role |
|------|--------|--------|----------|--------------|
| Distribution Headquarters™ | route-registry | standard-room | Publish / social | HQ wing |
| Distribution Dock™ | route-registry | standard-room | Publishing queue | Dock |
| Social Publishing Studio™ | route-registry | standard-room | OAuth social | Studio |
| Campaign Studio™ | route-registry | standard-room | Campaigns | Studio |
| Brand Headquarters™ | route-registry | standard-room | Brand ops | HQ |
| Shows Theater™ | route-registry | standard-room | Show metaphor | Theater |

## Training / academy

| Name | Source | Status | Function | Spatial role |
|------|--------|--------|----------|--------------|
| Studio Institute Academy™ | route-registry | standard-room | LOS / courses | Building |
| Simulation Laboratory™ | route-registry | module | Org simulation | Lab |

## Archive / memory

| Name | Source | Status | Function | Spatial role |
|------|--------|--------|----------|--------------|
| Studio Archives™ | route-registry | immersive-live | Archives entry | Building |
| Museum Wing™ | route-registry | immersive-live | Legacy museum | Museum |
| Legacy Vault™ | route-registry | module | Org memory | Vault |
| Knowledge Core Observatory™ | route-registry | immersive-partial | Knowledge graph UI | Observatory |

## System / hidden

| Name | Source | Status | Function | Spatial role |
|------|--------|--------|----------|--------------|
| Systems Dock rooms (event bus, workflow, state) | route-registry | standard-room | OS infra | Hidden/sub-basement metaphor |
| QA Command Center™ | route-registry | standard-room | QA | Security wing |

## Client / tenant

| Name | Source | Status | Function | Spatial role |
|------|--------|--------|----------|--------------|
| Grand Atrium (per company) | CompanyGrandAtriumPage | IMPLEMENTED | Company entry | Atrium |
| Company creative-direction / story-table | company-routes | IMPLEMENTED | CDS per company | Studio |

## Marketing / business district (canon doc)

| Name | Source | Status | Notes |
|------|--------|--------|-------|
| Market Wing destinations | 002_WORLD_ARCHITECTURE | DOC_ONLY | War Room, Campaign Boardroom — not all in route-registry |

## Transit / thresholds

| Name | Source | Status | Notes |
|------|--------|--------|-------|
| `/admin/studio/world/*` canonical paths | world/page.tsx | IMPLEMENTED | Threshold from legacy slugs |
| Legacy slug redirects | company-routes/redirects.ts | IMPLEMENTED | Portal between eras |

## Creation / SITE00-connected

| Name | Source | Status | Notes |
|------|--------|--------|-------|
| SITE 00 `/origin`, `/assts` | site00 routes | IMPLEMENTED | Not SW HQ — handoff docs |

## Unknown / historical

| Name | Source | Notes |
|------|--------|-------|
| Legacy Campus Map™ (hub) | route-registry | Former hub slug |
| Innovation Lineage / Constellations / Expeditions | route-registry | Partial immersive — verify live usage |

---

## Resident life → implied places (not yet literal 3D)

From Foundation2/runtime canon — **REQUIRES_LITERAL_SPACE** or **BENEFITS_FROM_SPACE** in matrix:

- Home, workplace, commute path, third places, private conversation rooms, training rooms, career event venues, team meeting rooms, founder intervention space, documentary observation points.

Evidence: `RESIDENT_WORKSPACE.md`, `life-os-seed.ts`, `002_WORLD_ARCHITECTURE.md` meeting rooms.

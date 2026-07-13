# Studio World Architectural Shell™ — Complete Department Shell Map

**Status:** Pre-implementation audit  
**Sprint:** Studio World Architectural Shell (Persistent Command Deck + Workbench)  
**Date:** 2026-07-13  
**Rule:** No department may replace the master shell. Departments populate Top Command Deck™, Immersive Room Workspace, and Bottom Workbench™ differently.

---

## Master shell (mandatory for all departments)

```
┌──────────────────────────────────────────────┐
│ TOP COMMAND DECK™  (global operating bridge) │
├──────────────────────────────────────────────┤
│                                              │
│        IMMERSIVE ROOM WORKSPACE              │
│                                              │
├──────────────────────────────────────────────┤
│ BOTTOM WORKBENCH™  (department workstation)  │
└──────────────────────────────────────────────┘
```

### Global Command Deck elements (always present)

| Slot | Content |
|------|---------|
| Identity | Current Department · Current Workspace |
| Navigation | Breadcrumb · Studio World Registry link |
| Context | Company Context · World Context |
| State | Current Revision · Approval Status |
| Founder | Notifications · Founder Profile · Search |
| Department tabs | Optional — department-specific commands only |

### Global Workbench elements (structure fixed, tools vary)

| Category | Examples by department |
|----------|---------------------|
| Architecture tools | Material Library · Lighting Studio · Camera Studio · Permit Center |
| Production tools | Asset Workbench · Material Lab · Render Queue · Immune System |
| Governance tools | Budget Forecast · Construction Queue · Municipal Ledger |

---

## Current-state vs target-state summary

| Pattern today | Departments using it | Target |
|---------------|---------------------|--------|
| **AdminStudioLayout** marble card + tabs | ~80% of registry routes | Migrate to shell; card becomes workspace exception only |
| **DepartmentGoldenBuildShell** HUD + no workbench | EL, Genesis workspaces | Add Command Deck + Workbench |
| **Immersive HUD + SceneTray** (bottom only) | CDS, Warehouse, Command Center | SceneTray → Workbench; add Command Deck |
| **Plain tab bar** (EL Mode 1/2) | Experience Lab | Replace with Command Deck tabs |
| **No persistent shell** | Safe/health EL routes | N/A |

---

## Flagship 1 — Studio Command Center™

**Route:** `/admin/studio/overview` → `StudioCommandCenterRoom`  
**Current shell:** `DepartmentGoldenBuildShell` + HUD back/identity/pill + `SceneTray` (2 zones)  
**Target identity:** Executive bridge of the headquarters — mission control, not a dashboard.

### Top Command Deck (proposed)

| Tab / command | Purpose |
|---------------|---------|
| Mission Control | Default — atrium overview |
| Campus Map | Studio Overview / world graph |
| Approvals | Approval center queue |
| Calendar | Executive calendar |
| Health | Company pulse · org health |
| Notifications | Smart notifications |
| Search | Executive search |

**Global slots:** Department = Command Center · Workspace = Executive Atrium · Breadcrumb = STUDIO WORLD > COMMAND CENTER · Revision N/A · Approval = wing readiness.

### Immersive workspace

- Organization Pulse Core
- Wing portal hotspots (Operations · Performance · Security)
- Scene Stack threshold layers
- Executive brief ambient (Genesis)

### Bottom Workbench (proposed)

| Tool | Role |
|------|------|
| Wing Navigator | Jump to registered departments |
| Approval Queue | Pending founder decisions |
| Activity Feed | Live organizational events |
| Briefing Console | Genesis morning brief |
| Permit Center | Cross-department permit status (Municipal Governance) |
| Budget Snapshot | HQ-wide AI spend |

---

## Flagship 2 — Experience Lab™

**Route:** `/admin/studio/experience-lab` → `ExperienceLabWorkspace`  
**Current shell:** `DepartmentGoldenBuildShell` + **Mode 1/2 tab bar** (not Command Deck) + stacked panels  
**Target identity:** Apple Park Architecture Studio — bright, holographic, planning-only.

### Top Command Deck (proposed)

| Tab | Purpose |
|-----|---------|
| Studio World | Registry + campus context |
| Blueprints | Active blueprint list |
| Renders | Founder Render gallery |
| Materials | Material **philosophy** (not editing) |
| Lighting | Lighting **philosophy** (not editing) |
| History | Revision timeline |
| Approvals | Approval wall · founder comments |

**Global slots:** Revision = blueprint rev · Approval = Founder Render status · Permit = municipal permit badge.

### Immersive workspace

- Large cinematic Founder Render (hero)
- Floating holographic blueprint
- Construction timeline
- Room registry · department hierarchy
- Future expansion registry
- Permit status wall
- Budget forecast overlay
- Environmental simulation (read-only)
- **No** asset lists · layer trees · material painting · mesh editing

### Bottom Workbench (proposed)

| Tool | Role |
|------|------|
| Architectural Tools | Blueprint Author entry · circulation · mood |
| Material Library | Founder Material Library **intent** viewer |
| Lighting Studio | Profile selector (philosophy) |
| Camera Studio | Camera intent / anchors |
| Budget Forecast | `forecastConstructionBudget` |
| Permit Center | Apply · status · municipal ledger |
| Construction Queue | Post-approval handoff queue (read-only until CDS) |

**Primary CTA (Command Deck or workspace monument):** `APPROVE & SEND TO CREATIVE DIRECTOR STUDIO`

---

## Flagship 3 — Creative Director Studio™

**Route:** `/admin/studio/department/creative-direction` → `CreativeDirectionStudioRoom`  
**Current shell:** `DepartmentGoldenBuildShell` + HUD + Stack build button + `SceneTray` (7 zones)  
**Target identity:** Luxury production facility — darker, dramatic, manufacturing-only.

### Top Command Deck (proposed)

| Tab | Purpose |
|-----|---------|
| Dashboard | Manufacturing overview |
| Assets | Selected asset + queue |
| Projects | Active production packages |
| Lighting | Lighting tests (asset-scoped) |
| Materials | Material tests (asset-scoped) |
| Approvals | Per-asset approval queue |
| Asset History | Version history |
| Construction Mode | Assembly status (read-only generate) |

**Global slots:** Revision = asset version · Approval = per-asset · Reference = locked Founder Render URL.

### Immersive workspace

- Approved Founder Render as **permanent reference** (frozen architecture)
- Center: selected asset turntable
- Surround: version gallery · dependency graph · manufacturing status
- Production monitors · reference walls · lighting rigs
- **No** room invention · blueprint editing · full-scene regeneration

### Bottom Workbench (proposed)

| Tool | Role |
|------|------|
| Asset Workbench | Regenerate · compare · isolate |
| Material Lab | Brand-grounded material assignment |
| Lighting Studio | Per-asset lighting tests |
| Camera Suite | Per-asset camera tests |
| Asset Library | Registry + warehouse link |
| Render Queue | NB2 worker queue |
| Permit Center | Interior design / renovation permits |
| Construction Mode | Send approved asset to assembly |
| Immune System | Inspector status · halt reasons |

**Primary CTA:** `APPROVE ASSET`

---

## Flagship 4 — Studio Warehouse™ / Studio Archives™

**Route:** `/admin/studio/studio-warehouse` → `StudioWarehouseRoom`  
**Current shell:** Immersive campus + `ArchitecturalNavigationRail` + `SceneTray` (~20 zones)  
**Target identity:** Asset vault + manufacturing campus — inventory, not architecture.

### Top Command Deck (proposed)

| Tab | Purpose |
|-----|---------|
| Campus Map | Zone navigator |
| Asset Registry | Registry vault |
| Generation Bay | Active jobs |
| Museum | Archives wing |
| Marketplace | Pavilion |
| Approvals | Certified asset queue |

### Immersive workspace

- Campus zones (Entrance · Galleries · Labs · Museum · Innovation)
- Asset shelf + inspector (current)
- Living architecture layers

### Bottom Workbench (proposed)

| Tool | Role |
|------|------|
| Asset Inspector | Metadata · lineage · favorites |
| Compare Mode | Side-by-side |
| Generation Bay | Queue control |
| Registry Search | Cross-department lookup |
| Import / Export | Large asset import permit |
| Quality Guard | Inspection results |

---

## Flagship 5 — Headquarters™

**Route:** `/admin/headquarters` + org-scoped children  
**Current shell:** Mixed — Executive Lobby (`MissionControlWorkspace`) + many `AdminStudioLayout` children  
**Target identity:** Founder's mansion — emotional HQ, not SaaS.

### Top Command Deck (proposed)

| Tab | Purpose |
|-----|---------|
| Lobby | Executive Lobby hero |
| Pulse | Company pulse |
| Priority | Priority of the day |
| Departments | Wing grid |
| Legacy | Timeline · memories |
| Financial | Health scorecards |

### Immersive workspace

- `ExecutiveLobbyHero` · `HqWingZone` · `CrystalHealthGrid`
- Living Headquarters atmosphere
- Department cards (navigate to departments)

### Bottom Workbench (proposed)

| Tool | Role |
|------|------|
| Concierge | Command Dock bridge |
| Calendar | Executive calendar |
| Notifications | Alerts |
| Quick Actions | Founder shortcuts |
| Expansion | Department pack install |

---

## Flagship 6 — Marketplace™

**Route:** `/admin/studio/marketplace`  
**Current shell:** `AdminStudioStageShell` card  
**Target identity:** Certified commercial buildings district.

### Top Command Deck

| Tab | Purpose |
|-----|---------|
| Browse | Certified buildings |
| Community Mods | Risk-accepted mods |
| My Installs | Founder installs |
| Certifications | Badge status |

### Immersive workspace

- Product shelves (spatial)
- Department mod previews
- Checkout / install flow

### Bottom Workbench

| Tool | Role |
|------|------|
| Compatibility Check | Mod vs HQ |
| Permit Center | Marketplace certification permit |
| Install Queue | Department mod registry |
| Support Status | Community vs certified |

---

## Flagship 7 — Expedition Hub™

**Route:** `/admin/studio/expansion-center`  
**Current shell:** `AdminStudioLayout` children  
**Target identity:** City planning office for HQ expansion.

### Top Command Deck

| Tab | Purpose |
|-----|---------|
| Expansion | Available packs |
| Owned | Installed departments |
| Workforce | Digital payroll |
| Recommendations | Growth advisor |

### Immersive workspace

- Department pack cards (spatial gallery)
- Industry architecture preview

### Bottom Workbench

| Tool | Role |
|------|------|
| Install Engine | Pack install |
| Budget Forecast | Expansion cost |
| Permit Center | Department expansion permit |
| Zoning Check | `validateZoningPlacement` |

---

## Constitution Hall™ + Municipal Governance

**Route:** `/admin/studio/constitution-hall`  
**Target:** City Hall — municipal dashboard renders here (not floating SaaS).

### Top Command Deck

| Tab | Purpose |
|-----|---------|
| City Health | Municipal dashboard |
| Permits | Pending · approved · denied |
| Inspections | Queue |
| Occupancy | Departments awaiting open |
| Ledger | Municipal audit trail |

### Workbench

| Tool | Role |
|------|------|
| Permit Application | New construction permit |
| Zoning Map | Floor/zone rules |
| Building Code | Violation report |
| Budget Governance | City-wide AI cap |

---

## Beauty Headquarters scenes (Studio World Registry)

Mapped from `BEAUTY_HEADQUARTERS_REGISTRY` — each scene inherits shell when given a dedicated room.

| Scene | Command Deck focus | Workspace | Workbench focus |
|-------|---------------------|-----------|-----------------|
| Reception | Blueprints · Renders · Approvals | Founder Render hero | Architecture tools · Permit |
| Grand Lobby | Studio World · Navigation | Circulation preview | Registry · Expansion |
| Transformation Suite | Materials intent · Lighting intent | Suite render | Manufacturing handoff |
| Build A Wig Atelier | Assets · Projects | Atelier render | Asset workbench |
| Hair Analysis Lab | Blueprints · History | Lab environment | Analysis tools |
| Extensions Boutique | Materials · Approvals | Boutique render | Asset + retail tools |
| Founder Suite | Executive · Approvals | Suite render | Executive tools only |
| Institute | Academy · Courses | Campus classroom | Knowledge tools |
| Marketing / Finance / Ops | Department KPIs | Department room | Ops-specific tools |

---

## CDS satellite routes (registry — currently card shell)

These should **not** remain independent layouts; they populate CDS Command Deck tabs or Workbench tools:

| Registry route | Maps to |
|----------------|---------|
| `director-mode` | CDS workspace — rehearsal zone |
| `production-builder` | CDS workbench — shot builder |
| `render-queue` | CDS workbench — queue |
| `prompt-library` | CDS workbench — versioned prompts |
| `ai-studio` | CDS workbench — model routing |
| `concierge-approval-flow` | CDS Command Deck — Approvals tab |
| `creative-director` (card) | **Deprecate** as separate page — merge into CDS room |

---

## Component architecture (implementation phase)

| Primitive | Responsibility |
|-----------|----------------|
| `StudioWorldShell` | Fixed 3-zone layout · animated continuity |
| `TopCommandDeck` | Global slots + department tab strip |
| `BottomWorkbench` | Tool tray · collapsible · department tools |
| `ImmersiveWorkspace` | Full-bleed room slot |
| `DepartmentToolbar` | Optional in-deck actions |
| `DepartmentBreadcrumb` | World path from route registry |
| `DepartmentActions` | Primary/secondary CTA row |

### Blueprint Author assembly (future)

Blueprint declares: `departmentType`, `commandDeckModules[]`, `workbenchModules[]`, `workspaceModules[]` → shell auto-assembles. No manual layout per department.

---

## Migration priority (recommended)

| Priority | Department | Reason |
|----------|------------|--------|
| P0 | Experience Lab | Canonical north star · most panel-like today |
| P0 | Creative Director Studio | Canonical north star · needs identity split from EL |
| P1 | Studio Command Center | Entry point — sets expectation |
| P1 | Studio Warehouse | Asset manufacturing handoff |
| P2 | Headquarters | Already immersive-themed |
| P2 | Constitution Hall | Municipal dashboard host |
| P3 | Card-shell satellites | Batch migrate to parent department shell |

---

## Success criteria mapping

| Criterion | This audit enables |
|-----------|-------------------|
| One architectural language | Shell map defines shared slots for all departments |
| Command Deck landmark | Proposed global slots + per-department tabs |
| Workbench landmark | Tool categories per department |
| Immersive workspace preserved | Middle zone remains department-owned |
| Blueprint Author auto-assembly | Module IDs listed per department for blueprint schema extension |

**Next step:** Implement `StudioWorldShell` primitives — begin with Experience Lab + Creative Director Studio only.

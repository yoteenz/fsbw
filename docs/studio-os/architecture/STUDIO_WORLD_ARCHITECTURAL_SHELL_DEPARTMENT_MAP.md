# Studio World Architectural Shell™ — Complete Department Shell Map

**Status:** Pre-implementation audit — **complete** (awaiting founder approval before code)  
**Sprint:** Studio World Architectural Shell™ (Persistent Command Deck + Workbench)  
**Date:** 2026-07-13  
**Rule:** No department may replace the master shell. Departments populate Top Command Deck™, Immersive Room Workspace, and Bottom Workbench™ differently.

### Audit inventory (machine-verified)

| Source | Count | Notes |
|--------|-------|-------|
| `STUDIO_WORLD_ROUTE_REGISTRY` | **89** routes | 7 registered flagships |
| `ADMIN_STUDIO_MODULES` (nav) | **214** modules | **213** flagged webpage-like today |
| `immersive-live` routes | **5** | CDS, Warehouse×2, Archives×2 |
| `immersive-partial` routes | **19** | Command Center observatories, Constitution Hall, etc. |
| `standard-room` routes | **65** | `AdminStudioLayout` card shell — migrate to parent department shell |
| Registry gaps | **EL, Construction Mode, Genesis** | Live routes exist; not yet in `route-registry.ts` |

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

## Design language (shell canon — not department interiors)

The shell fixtures are **engineered into the building**, not drawn over rooms.

| Token | Application |
|-------|-------------|
| Glass · acrylic | Command Deck backdrop · deck tab strip · workbench bay dividers |
| Chrome · brushed aluminum | Deck rail · workbench frame · tool icon bezels |
| Thin illuminated borders | Active tab · selected tool · approval status ring |
| Floating shadows | Deck elevation above workspace · workbench floor anchor |
| World-class typography | Deck identity row · breadcrumb · revision badge |
| Soft edge lighting | Deck underside glow · workbench rim light |
| Premium spacing | Fixed deck height · workbench tool bays · no cramped SaaS density |

**Department interiors** (bright EL vs dark CDS) vary inside `ImmersiveWorkspace` only — shell tokens stay constant.

---

## Animated continuity (department transitions)

When the founder moves between departments:

1. **Top Command Deck** — never unmounts; identity row cross-fades; department tabs animate swap (slide + opacity).
2. **Bottom Workbench** — never unmounts; tool bays cross-fade; inactive tools slide out, department tools slide in.
3. **Immersive Workspace** — full room transform (dissolve · elevator · door open · camera dolly) — department-owned animation.
4. **Breadcrumb + Registry** — update in deck without layout shift.

**Anti-pattern:** Full page remount with new top nav — forbidden. `AdminStudioLayout` marble card must not reappear as the outer frame for production departments.

---

## Current-state vs target-state summary

| Pattern today | Departments using it | Target |
|---------------|---------------------|--------|
| **AdminStudioLayout** marble card + tabs | ~80% of registry routes | Migrate to shell; card becomes workspace exception only |
| **DepartmentGoldenBuildShell** HUD + no workbench | EL, Genesis workspaces | Add Command Deck + Workbench |
| **Immersive HUD + SceneTray** (bottom only) | CDS, Warehouse, Command Center | SceneTray → Workbench; add Command Deck |
| **Plain tab bar** (EL Mode 1/2) | Experience Lab | Replace with Command Deck tabs |
| **No persistent shell** | Safe/health EL routes | N/A (debug only) |
| **Command Dock portal** | GoldenBuildShell overlay | Retained as Genesis concierge — not Command Deck |

### Current layout components (today)

| Component | File | Role today | Target |
|-----------|------|------------|--------|
| `DepartmentGoldenBuildShell` | `department-vertical-slice/DepartmentGoldenBuildShell.tsx` | Full-viewport immersive portal + Orb | Becomes `StudioWorldShell` inner provider |
| `AdminStudioLayout` | `AdminStudioLayout.tsx` | Marble card + tabs | **Exception only** — pure admin modules |
| `SceneTray` | `navigation/SceneTray.tsx` | Bottom zone switcher | Migrates to `BottomWorkbench` |
| `AdminStudioStageShell` | `AdminStudioStageShell.tsx` | Scrollable stage card | Deprecate for production departments |
| HUD back/identity/pill | Per-room inline | Ad-hoc header | Migrates to `TopCommandDeck` global slots |

---

## Flagship 0 — Experience Lab™ (registry gap — P0)

**Route:** `/admin/studio/experience-lab` → `ExperienceLabWorkspace`  
**Registry:** **Not in** `STUDIO_WORLD_ROUTE_REGISTRY` — municipal fixture `sceneId: experience-lab`, `flagshipId: experience-lab`  
**Current shell:** `DepartmentGoldenBuildShell` + **Mode 1/2 tab bar** + stacked panels (`#fafafa`)  
**Target identity:** Architecture headquarters — bright, holographic, planning-only (see EL/CDS identity gap analysis).

### Top Command Deck (proposed — matches sprint spec)

| Tab | Purpose |
|-----|---------|
| Studio World | Registry + campus context |
| Blueprints | Active blueprint list |
| Renders | Founder Render gallery |
| Materials | Material **philosophy** (intent only) |
| Lighting | Lighting **philosophy** (intent only) |
| History | Revision timeline |
| Approvals | Approval wall · founder comments |

**Global slots:** Department = Experience Lab · Workspace = Founder Review / Blueprint Author · Revision = blueprint rev · Approval = Founder Render status · Permit badge.

### Immersive workspace

- Large cinematic Founder Render
- Floating holographic blueprint
- Construction timeline · room registry · department hierarchy
- Future expansion registry · permit wall · budget forecast overlay
- Environmental simulation (read-only)
- **Forbidden:** asset lists · layer trees · material painting · mesh editing · post-approval manufacturing

### Bottom Workbench (proposed — matches sprint spec)

| Tool | Module ID |
|------|-----------|
| Architectural Tools | `el.architectural-tools` |
| Material Library | `el.material-library-intent` |
| Lighting Studio | `el.lighting-philosophy` |
| Camera Studio | `el.camera-intent` |
| Budget Forecast | `el.budget-forecast` |
| Permit Center | `el.permit-center` |
| Construction Queue | `el.construction-queue` (handoff read-only) |

**Primary CTA (monument):** `APPROVE & SEND TO CREATIVE DIRECTOR STUDIO`

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

## Construction Mode™ (assembly department — registry gap — P0)

**Route:** Not yet a dedicated room — today embedded in `FounderReviewExperience` post-approve panels  
**Target route:** `/admin/studio/world/construction-mode` (proposed) or CDS workbench zone `construction-assembly`  
**Role:** Licensed assembly crew — **never generates**, only places approved assets at approved coordinates.

### Top Command Deck (proposed)

| Tab | Purpose |
|-----|---------|
| Assembly Floor | Active room assembly view |
| Asset Queue | Approved assets awaiting placement |
| Socket Map | Approved sockets + coordinates |
| Dependencies | Resolved dependency order |
| Inspection | Immune System pass/fail |
| Occupancy | Post-assembly open gate |

### Immersive workspace

- Physical assembly visualization (workers place assets)
- Blueprint overlay (read-only, locked)
- Socket highlight map
- Progress timeline per asset
- **Forbidden:** generation · regeneration · blueprint edit

### Bottom Workbench (proposed)

| Tool | Module ID |
|------|-----------|
| Construction Queue | `cm.construction-queue` |
| Immune System | `cm.immune-inspector` |
| Permit Center | `cm.occupancy-permit` |
| Municipal Ledger | `cm.assembly-ledger` |
| Dependency Graph | `cm.dependency-graph` (read-only) |

**Receives from CDS:** approved asset · coordinates · sockets · materials · lighting profile · blueprint · dependencies.

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

## Complete registry audit — routes by flagship

| Flagship | Routes | Shell today | Target shell | Priority |
|----------|--------|-------------|--------------|----------|
| Studio Command Center | 28 | 5 immersive · 23 standard | `StudioWorldShell` | P1 |
| Creative Direction Studio | 11 | 1 immersive · 10 standard | `StudioWorldShell` | P0 |
| Studio Warehouse | 6 | 2 immersive · 4 standard | `StudioWorldShell` | P1 |
| Studio Archives | 12 | 4 immersive · 8 standard | `StudioWorldShell` | P2 |
| Marketplace | 2 | 2 standard | `StudioWorldShell` | P2 |
| Headquarters | 20 | 1 partial · 19 standard | `StudioWorldShell` | P2 |
| Expedition Hub | 10 | 10 standard | `StudioWorldShell` | P3 |
| **Experience Lab** | 0 (gap) | GoldenBuild + tabs | `StudioWorldShell` | **P0** |
| **Construction Mode** | 0 (gap) | Inline EL panels | `StudioWorldShell` | **P0** |

### Satellite route consolidation (all flagships)

**Rule:** `standard-room` child routes must not keep independent `AdminStudioLayout` — they populate parent Command Deck tab or Workbench tool.

| Parent flagship | Satellite routes (count) | Consolidation target |
|-----------------|--------------------------|----------------------|
| Command Center | 23 standard rooms | Deck tabs: Mission Control · Campus Map · Approvals · Health · Systems Dock |
| CDS | 10 standard rooms | Workbench: render-queue · prompt-library · ai-studio · production-builder |
| Warehouse | 4 standard rooms | Workbench: asset-registry · generation-bay · media-vault |
| Archives | 8 standard rooms | Deck: Museum · Blueprint Archive · Innovation District |
| Headquarters | 19 standard rooms | Deck per HQ wing: Marketing · Distribution · Intelligence · Operations |
| Expedition Hub | 10 standard rooms | Deck: Expansion · Onboarding · Simulation |

---

## Component architecture (implementation phase)

| Primitive | Responsibility | Props (sketch) |
|-----------|----------------|----------------|
| `StudioWorldShell` | Fixed 3-zone layout · animated continuity · design tokens | `departmentId`, `workspaceId`, `children` |
| `TopCommandDeck` | Global slots + optional department tab strip | `identity`, `breadcrumb`, `revision`, `approval`, `tabs[]`, `onTabChange` |
| `BottomWorkbench` | Floor-anchored tool tray · collapsible bays | `tools[]`, `activeToolId`, `onToolSelect` |
| `ImmersiveWorkspace` | Full-bleed room slot — department owns interior | `children`, `transitionKey` |
| `DepartmentToolbar` | In-deck contextual actions (non-tab) | `actions[]` |
| `DepartmentBreadcrumb` | World path from `resolveWorldRouteByPath` | `routeMapping` |
| `DepartmentActions` | Primary/secondary monument CTAs | `primary`, `secondary[]` |

**File target:** `src/components/admin/studio-os/studio-world-shell/` (new package — no implementation until gates cleared).

### Blueprint Author shell assembly

Blueprint Author extends to declare shell modules — departments **declare capabilities**, Studio World **builds the shell**.

```typescript
type DepartmentShellBlueprint = {
  departmentType: 'architecture' | 'production' | 'assembly' | 'executive' | 'vault' | 'commerce' | 'expansion';
  commandDeckModules: CommandDeckModuleId[];
  workbenchModules: WorkbenchModuleId[];
  workspaceModules: WorkspaceModuleId[];
  visualTheme?: 'bright-architectural' | 'dark-production' | 'neutral-executive'; // workspace only
};
```

**Experience Lab blueprint example:**

```yaml
departmentType: architecture
commandDeckModules: [studio-world, blueprints, renders, materials-philosophy, lighting-philosophy, history, approvals]
workspaceModules: [founder-render-hero, holographic-blueprint, construction-timeline, permit-wall, revision-timeline]
workbenchModules: [architectural-tools, material-library-intent, lighting-philosophy, camera-intent, budget-forecast, permit-center, construction-queue]
visualTheme: bright-architectural
```

**Creative Director Studio blueprint example:**

```yaml
departmentType: production
commandDeckModules: [dashboard, assets, projects, lighting-tests, materials-tests, approvals, asset-history, construction-mode-status]
workspaceModules: [frozen-founder-render-reference, asset-turntable, version-gallery, dependency-graph, manufacturing-status]
workbenchModules: [asset-workbench, material-lab, lighting-studio, camera-suite, asset-library, render-queue, permit-center, construction-handoff, immune-system]
visualTheme: dark-production
```

**Construction Mode blueprint example:**

```yaml
departmentType: assembly
commandDeckModules: [assembly-floor, asset-queue, socket-map, dependencies, inspection, occupancy]
workspaceModules: [assembly-visualization, blueprint-overlay-readonly, socket-highlights, progress-timeline]
workbenchModules: [construction-queue, immune-inspector, occupancy-permit, assembly-ledger]
```

No manual per-department layout coding after schema ships.

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
| Blueprint Author auto-assembly | Module IDs + schema examples per department |
| Animated continuity | Deck + workbench persist; workspace transforms |
| Construction Mode assembly-only | Separate department shell map defined |

---

## Implementation gates

| Gate | Requirement |
|------|-------------|
| G1 | This department shell map reviewed by founder |
| G2 | EL/CDS identity gap analysis approved (`EXPERIENCE_LAB_CDS_IDENTITY_GAP_ANALYSIS.md`) |
| G3 | `StudioWorldShell` primitive API approved |
| G4 | Blueprint Author `DepartmentShellBlueprint` schema approved |
| G5 | Experience Lab + Construction Mode added to `route-registry.ts` |

**Do not begin `StudioWorldShell` implementation until G1 confirmed.** P0 departments (EL, CDS, Construction Mode) migrate first after primitives ship.

**Next step after approval:** Implement `StudioWorldShell` + `TopCommandDeck` + `BottomWorkbench` — wire Experience Lab as first consumer.

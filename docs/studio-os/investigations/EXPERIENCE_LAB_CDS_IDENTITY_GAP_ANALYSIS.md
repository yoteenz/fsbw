# Experience Lab™ + Creative Director Studio™ — Identity Gap Analysis

**Status:** Pre-implementation architectural review  
**Sprint:** Distinct Department Identities  
**Date:** 2026-07-13  
**References:** Attachment A (Experience Lab concept) · Attachment B (Creative Director Studio concept) — *artistic direction cited by founder; no image files found in repository*

**Audit basis:** Written canonical spec (this sprint) · existing production code · `EXPERIENCE_LAB_CDS_MANUFACTURING_PIPELINE.md` · `FOUNDER_RENDER.md` · immersive room implementations.

---

## Executive summary

| Dimension | Experience Lab today | Experience Lab target | Gap severity |
|-----------|---------------------|----------------------|--------------|
| Identity | Validation lab with tabs | Architecture headquarters | **Critical** |
| Shell | Mode 1/2 tabs + panels | Command Deck + holographic room | **Critical** |
| Responsibility | Blueprint + mock manufacturing + World Compiler preview | Blueprint + Founder Render + handoff only | **High** |
| Atmosphere | Light gray `#fafafa` system UI | Bright glass · gold · holograms | **High** |
| Primary CTA | `Approve & Build` | `Approve & Send to CDS` | **Medium** |

| Dimension | CDS today | CDS target | Gap severity |
|-----------|-----------|------------|--------------|
| Identity | Scene-stack immersive room | Luxury production facility | **High** |
| Shell | HUD + SceneTray zones | Command Deck + manufacturing workbench | **High** |
| Responsibility | `ensureStation` can invent rooms; layer regeneration | Frozen architecture · per-asset manufacturing | **Critical** |
| Atmosphere | Indigo accents · mixed immersion | Dark · red · chrome · black marble | **High** |
| Primary CTA | Stack build / pipeline approve | `Approve Asset` monument | **Medium** |

**Core diagnosis:** Both departments use fragments of immersive UI, but neither feels like *walking into a different building*. Experience Lab still reads as **a website with tabs and forms**. Creative Director Studio reads as **a sophisticated 3D navigator** but still performs **architectural generation** (Scene Stack shell layers) instead of pure asset manufacturing.

---

## Part 1 — Experience Lab™ gap analysis

### 1.1 Spatial / shell gaps

| Required (concept) | Current implementation | Gap |
|--------------------|------------------------|-----|
| Persistent Command Deck | `ExperienceLabModeShell` top tabs (Runtime \| Creative Intelligence) | Tabs are mode switchers, not operating bridge |
| Persistent Workbench | None — tools inline in panels | No fixed workstation |
| Cinematic room workspace | `CreativeIntelligencePanel` = header + switchers + `BlueprintAuthorExperienceLabGate` | Panel stack inside `#fafafa` container |
| Walk-in headquarters feel | `DepartmentGoldenBuildShell` portal exists but inner UI is web forms | Shell wrapper without architectural interior |
| Animated continuity | None between EL modes | Mode swap is instant tab click |

**Files:** `ExperienceLabModeShell.tsx`, `CreativeIntelligencePanel.tsx`, `FounderReviewExperience.tsx`

### 1.2 Responsibility gaps (architect vs manufacturer)

| EL must ONLY output | Current behavior | Gap |
|---------------------|------------------|-----|
| Approved Blueprint | ✅ `BlueprintAuthor` + `ConstructionPlan` | OK |
| Approved Founder Render | ✅ `FounderReviewHero` + FAL NBP | OK (verify mobile E2E) |
| Material **intent** | Material set in plan; no separate intent lock artifact | Partial |
| Camera **intent** | Camera anchors in plan; not surfaced as locked intent | Partial |
| Lighting **intent** | Lighting profile in plan; not surfaced as locked intent | Partial |
| Handoff to CDS | `approveAndBuild()` → manufacturing panels **inside EL** | **Critical** — manufacturing should not run in EL |

| EL must NEVER do | Current behavior | Gap |
|------------------|------------------|-----|
| Asset editing | `BlueprintDrawer` + `FounderInspectPanel` + `ObjectInspector` | **High** — inspect/edit objects in EL |
| Material painting | Not present | OK |
| Object lists / layer trees | Blueprint drawer asset list | **Medium** |
| Mock manufacturing unlock | `ManufacturingQueue`, `WorkerStatus`, `InspectionStatus` in `FounderReviewExperience` post-approve | **Critical** — violates EL→CDS separation |
| World Compiler as EL product | `CreativeStudioRenderPreview` after approval in Mode 2 | **High** — compiler output should be CDS/Construction Mode |

**Canon conflict:** P0 pipeline doc says EL does not manufacture; UI still shows manufacturing panels and World Compiler preview in Experience Lab after approval.

### 1.3 Workflow / CTA gaps

| Target CTA hierarchy | Current | Gap |
|---------------------|---------|-----|
| Primary: `APPROVE & SEND TO CREATIVE DIRECTOR STUDIO` | `Approve & Build` | Wrong verb — implies local build |
| Secondary: Request Revision | ✅ revision textarea + regenerate | OK |
| Secondary: Export Blueprint | Not exposed as monument button | Missing |
| Secondary: Compare Revisions | `LiveDiffPanel` exists | Partial — not prominent |
| Secondary: Open Registry | Company/concept switchers only | Missing Studio World Registry |
| Secondary: Preview Walkthrough | Not present | Missing |
| Physical handoff transition | None | **Critical** — no elevator / dissolve animation |

**File:** `FounderReviewExperience.tsx` lines 169–190

### 1.4 Visual / atmosphere gaps

| Target (bright architectural) | Current | Gap |
|------------------------------|---------|-----|
| Glass · acrylic · chrome | System UI borders `#e5e7eb` | Generic web |
| Floating holograms | `BlueprintDrawer` procedural clay | Not holographic |
| Construction grids | Not visible in hero | Missing |
| White · gold accents | Red `#eb1c24` primary only | Partial brand |
| Engineering / planning / future | Copy says "Founder Review" — correct tone | Visual doesn't match |

### 1.5 Integration gaps (municipal + pipeline)

| System | Required | Current | Gap |
|--------|----------|---------|-----|
| Permit before world gen | `authorizeConstruction` | Not wired in EL UI | Not surfaced |
| Budget forecast before approval | `forecastConstructionBudget` | Not shown to founder | Missing |
| Studio World Registry | Scene picker | Company/concept switchers | Wrong registry |
| Approved handoff persistence | `ApprovedFounderRenderHandoff` on approve | Contract exists; not persisted | P0-B blocker |
| CDS gate | No manufacturing in EL | Manufacturing UI in EL | **Critical** |

---

## Part 2 — Creative Director Studio™ gap analysis

### 2.1 Spatial / shell gaps

| Required (concept) | Current implementation | Gap |
|--------------------|------------------------|-----|
| Command Deck with production tabs | HUD: back · identity · stack pill · build button | No department command tabs |
| Manufacturing workbench | `SceneTray` zone switcher (7 zones) | Tray is navigation, not tools |
| Asset turntable center stage | `SceneStackViewport` per zone — composited layers | Shows **room layers**, not single asset |
| Approved Founder Render permanent reference | Scene Stack generates `environment-shell` layer | **Critical** — invents architecture |
| Dark luxury workshop | `cdsImmersionTheme` + indigo | Lighter than target; not black marble/red |

**Files:** `CreativeDirectionStudioRoom.tsx`, `SceneStackViewport.tsx`, `cameraZones.ts`

### 2.2 Responsibility gaps (manufacturer vs architect)

| CDS must receive locked inputs | Current | Gap |
|-------------------------------|---------|-----|
| Approved Founder Render | `ensureStation` seeds from stack, not handoff | **Critical** (P0-C) |
| Approved Blueprint | Not enforced at CDS entry | **Critical** |
| Approved Construction Plan | Manufacturing graph not wired | **High** |
| Frozen architecture | `environment-shell` layer regenerates | **Critical** |

| CDS must manufacture | Current | Gap |
|----------------------|---------|-----|
| Per-asset NB2 workers | Scene Stack layer generation (mixed) | Partial — routing exists (P1) but UI is layer-centric |
| Material tests per asset | Mood wall pins only | **High** |
| Lighting tests per asset | Not per-asset | **High** |
| Version gallery per asset | Pipeline board stages | Partial |
| Dependency graph | Not visible | Missing |

| CDS must NEVER | Current | Gap |
|----------------|---------|-----|
| Invent architecture | `handleEnsureStation` + shell layer | **Critical** |
| Full-room regeneration | Possible via environment-shell | **Critical** |
| Blueprint editing | Not present | OK |

### 2.3 Zone model gaps

| Concept (11 blueprint zones) | Runtime (7 camera zones) | Gap |
|------------------------------|--------------------------|-----|
| founder-review | `review-chamber` + `pipeline-board` | Split across two zones |
| sandbox / branch-comparison | Not implemented | Missing |
| observatory | Not implemented | Missing |
| departure-threshold | Not implemented | Missing |

CDS feels like **walking between camera positions** in one room — correct direction — but zones are **creative pipeline stations**, not **manufacturing bays**.

### 2.4 Workflow / CTA gaps

| Target CTA | Current | Gap |
|------------|---------|-----|
| Primary: `APPROVE ASSET` | Pipeline stage approve / stack build | Not asset-centric monument |
| Open Material Lab | No dedicated lab surface | Missing |
| Open Lighting Studio | No dedicated lab surface | Missing |
| Open Camera Suite | No dedicated lab surface | Missing |
| Send to Construction Mode | Not exposed | Missing |
| View Dependency Graph | Not exposed | Missing |
| Open Asset Registry | Warehouse link not in-room | Partial |

### 2.5 Visual differentiation gaps (EL vs CDS)

| Attribute | EL target | CDS target | Current EL | Current CDS |
|-----------|-----------|------------|------------|-------------|
| Brightness | Bright | Dark | Light gray | Medium immersive |
| Accent | Gold | Red | Red only | Indigo |
| Materials | Glass · white | Chrome · black marble | System borders | Immersion CSS |
| Hero object | Holographic blueprint | Asset turntable | Founder Render photo | Layer composite |
| Mood | Planning · future | Manufacturing · alive | Review form | Pipeline + mood wall |

**Visual separation today:** Insufficient — both use `DepartmentGoldenBuildShell` + red brand accents.

### 2.6 Animated transition gaps

| Target sequence | Current | Gap |
|-----------------|---------|-----|
| Blueprint folds | None | Missing |
| Founder signs approval | Button click | Not ceremonial |
| Room dissolves | None | Missing |
| Elevator ride | None | Missing |
| CDS doors open with Founder Render waiting | CDS requires manual station setup | **Critical** |

---

## Part 3 — Construction Mode gaps

| Target | Current | Gap |
|--------|---------|-----|
| Assembly only — never generates | `LiveRoomAssemblyPanel` + mock workers in EL | Generation still in EL/CDS stack |
| Receives approved assets + sockets only | Construction timeline in EL post-approve | Wrong entry point |
| Workers assemble physically | Simulated queue UI | Not spatial assembly |
| Separate department feel | Embedded in `FounderReviewExperience` | Not a walkable department |

**Recommendation:** Construction Mode becomes its own shell-populated department; EL and CDS hand off via `ApprovedFounderRenderHandoff` + asset queue — not inline panels.

---

## Part 4 — Complete change list (implementation backlog)

### Experience Lab — UI/UX

1. Replace Mode 1/2 tabs with `TopCommandDeck` department tabs (keep Mode 1 as workbench tool, not top-level tab).
2. Implement bright architectural design language (glass deck · gold accents · hologram blueprint).
3. Hero workspace: full-viewport Founder Render + floating blueprint — not form sections.
4. Remove post-approval manufacturing panels from EL (`ManufacturingQueue`, `WorkerStatus`, mock assembly).
5. Remove `CreativeStudioRenderPreview` / World Compiler unlock from EL — move to CDS or Construction Mode.
6. Rename primary CTA to `APPROVE & SEND TO CREATIVE DIRECTOR STUDIO`.
7. Add handoff transition animation (dissolve → elevator → CDS arrival).
8. Surface Permit Center + Budget Forecast in workbench (Municipal Governance).
9. Add Studio World Registry picker (replace company/concept switcher for production path).
10. Lock Material/Camera/Lighting **intent** artifacts on approval.

### Experience Lab — workflow / backend

11. Persist `ApprovedFounderRenderHandoff` on approve (P0-B).
12. Wire `authorizeConstruction` preflight before Founder Render generate.
13. Block `approveAndBuild` from starting local manufacturing — dispatch handoff only.

### Creative Director Studio — UI/UX

14. Implement `TopCommandDeck` production tabs + `BottomWorkbench` manufacturing tools.
15. Dark luxury theme: black marble · chrome · red accents · production monitors.
16. Center stage: single asset turntable (not full layer composite as hero).
17. Permanent Founder Render reference wall (locked image, non-regenerable).
18. Material Lab · Lighting Studio · Camera Suite as workbench tools.
19. Rename primary CTA to `APPROVE ASSET`.
20. Add elevator arrival state — Founder Render already loaded from handoff.

### Creative Director Studio — workflow / backend

21. Gate `ensureStation` on `ApprovedFounderRenderHandoff` (P0-C).
22. Seed shell from `previewArtifactUrl` — disable `environment-shell` regeneration.
23. Asset queue from `buildRoomManufacturingGraph` — one worker per node.
24. Route all asset gens through ModelRoutingEngine (NB2) with founder render reference.
25. `Send to Construction Mode` only for approved assets.

### Shared shell (both departments)

26. Implement `StudioWorldShell` + `TopCommandDeck` + `BottomWorkbench` + `ImmersiveWorkspace`.
27. Animated continuity: deck/workbench persist; only contents + room transform.
28. Blueprint Author schema: `commandDeckModules` + `workbenchModules` per department type.

---

## Part 5 — Spatial Architecture Review

**Status:** APPROVED WITH MITIGATIONS · Score **4.4**

| Question | Answer |
|----------|--------|
| Where does this live? | Experience Lab wing + Creative Direction Studio floor — same HQ, different buildings |
| Creates a dashboard? | **Mitigated** — Command Deck is bridge, not data grid; Workbench is diegetic tools |
| Department clarity? | **Yes** after gaps closed — architect vs manufacturer |
| Immersion? | **Yes** after shell + transition + visual split |

**Mitigation:** Do not implement Command Deck as `AdminStudioNavTabs` — must be glass architectural fixture.

---

## Part 6 — Attachment reference note

Founder cited **Attachment A** (Experience Lab) and **Attachment B** (Creative Director Studio) as visual north stars. No PNG/JPG concept files were found under `docs/`, `public/`, or workspace artifacts at audit time.

**Recommendation:** Add concept images to `docs/studio-os/reference-concepts/` (or design vault) so implementation sprints can diff against pixels, not prose alone.

---

## Implementation gate

| Gate | Requirement |
|------|-------------|
| G1 | This gap analysis reviewed by founder |
| G2 | Department shell map approved (`STUDIO_WORLD_ARCHITECTURAL_SHELL_DEPARTMENT_MAP.md`) |
| G3 | P0-B handoff persistence shipped |
| G4 | `StudioWorldShell` primitives designed (API sketch) |
| G5 | Concept attachments stored in repo |

**Do not begin UI implementation until G1–G2 confirmed.** Backend gates G3 can parallel shell primitives (G4).

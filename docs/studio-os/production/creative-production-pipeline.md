# Creative Production Pipeline — Studio OS v1

**Document:** End-to-end production methodology  
**Pilot:** Creative Direction Studio™ (`creative-direction`)  
**Status:** Canonical — every future department follows this pipeline

---

## Definition

The **Creative Production Pipeline** is the operational sequence that transforms company creative intent into a living, walkable, interactive department.

Platform architecture defined **how Studio OS thinks**. This pipeline defines **how Studio OS is physically created**.

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 01 — CREATIVE DIRECTION™                                         │
│  Genome analysis · brief · mood board · art direction · approval        │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 02 — ASSET PLANNING™                                             │
│  Environment · objects · interactions · camera/light/material/audio     │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 03 — ASSET GENERATION™                                           │
│  Ordered manufacture · prompts · dependencies · provider execution      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 04 — ASSET REVIEW™                                               │
│  Per-asset quality · genome · scale · immersion · founder gate          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 05 — REGISTRY™                                                   │
│  Approved → Studio Asset Registry™ · rejected → regeneration            │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 06 — DEPARTMENT ASSEMBLY™                                        │
│  Cursor wires modular scene · no baked screenshots                      │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 07 — RUNTIME™                                                    │
│  Department Runtime™ · Orb · concierges · interactions · state          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 08 — VALIDATION™                                                 │
│  Walk the Room™ · critique · performance · accessibility                │
└───────────────────────────────┬─────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────────┐
│  STAGE 09 — GOLDEN DEPARTMENT™                                          │
│  CDS certified as reference · inheritance law for all future departments  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Stage 01 — Creative Direction™

**Purpose:** Establish creative authority before any asset is planned or generated.

**Outputs:** Creative Direction Package — approved intent that gates all downstream work.

### Activities

| Activity | Source | Output |
|----------|--------|--------|
| Company Genome™ analysis | Organization Genome (M95) | Material · voice · editorial · things-we-never-do |
| Project Genome™ analysis | Active project context | Audience · constraints · branch labels |
| Founder intent capture | Founder Journey™ · Command Dock | Maturity · ritual weight · creative register |
| Living Mood Board™ | Founder drops · Inspiration Library | Pinned references · clusters · compare sets |
| Creative Brief | Studio Intelligence™ synthesis | Problem · opportunity · emotional target |
| Art Direction | Golden Department spec · Design Language™ | Anti-SaaS law · luxury tier · photography direction |
| Visual references | Inspiration Library · reference-drop | Curated image set · genome alignment check |
| Inspiration Library seed | `seed-mood-cds` · `seed-brief-cds` · `seed-library-cds` | Content seeds for room boot |
| Creative approval | Founder sign-off | **Creative Direction Lock** — Stage 02 may begin |

### CDS Pilot — Stage 01 Deliverables

| Deliverable | Location / Reference |
|-------------|---------------------|
| Experience intent | `golden-department/creative-direction-studio/` |
| Emotional register | Inspired · Curious · Creative · Powerful · Focused · Supported |
| Art direction law | `05_ART_DIRECTION.md` — no SaaS dashboards · no card grids |
| Genome adaptation examples | `06_GENOME_ADAPTATION.md` — 7 industries |
| Room DNA sliders | `departments/creative-direction-studio/room-dna.json` (17 sliders) |

### Gate

**Creative Direction Lock** — founder confirms: *"This is the creative brain we are building."*

No asset planning until lock. Changes after lock trigger **revision scope** (surgical, not full restart).

---

## Stage 02 — Asset Planning™

**Purpose:** Translate creative intent into a complete, modular production inventory.

**Outputs:** Department Definition (Generator output) — already complete for CDS v1.

### Activities

| Activity | Output Artifact |
|----------|-----------------|
| Environment breakdown | `environment-blueprint.md` · shell · floor · ceiling · windows · alcoves · portals |
| Modular object list | `asset-manifest.json` — 35 assets · no flattened backgrounds |
| Required interactions | `interaction-manifest.json` · `interactions-catalog.md` |
| Camera language | `camera-paths-cds` · arrival · zone inspect · Walk the Room path |
| Lighting language | `lighting-rig-cds` · three-point editorial · genome slot |
| Material language | Per-asset `genomeSlots` · Design Language compliance |
| Audio language | `audio-ambient-cds` · `audio-ceremony-cds` · `audio-orb-cds` |
| Animation language | Ceremony · panel reveal · orb idle · arrival choreography |

### CDS Pilot — Planning Summary

| Category | Count | Key Assets |
|----------|-------|------------|
| Environment | 5 | shell · floor · ceiling · windows · alcove |
| Zone objects | 7 | mood wall · brief wall · timeline · sandbox · library · observatory · compare screen |
| Intelligence | 5 | orb · pedestal · 3 concierges |
| Atmosphere | 5 | lighting rig · particles · 3 audio |
| Navigation | 3 | camera paths · entry/exit portals |
| Interaction | 3 | glass panels · context float · walk markers |
| Founder | 3 | notes panel · approval pedestal · inspiration drop |
| Content seed | 3 | mood · brief · library seeds |

**Budget:** 120 MB · **Hero object:** `wall-mood-cds`

### Gate

**Planning Complete** — `asset-manifest.json` validates against Generator schema · every zone has objects · every interactive object has interaction entry · hero object declared.

CDS v1: Planning gate **passed** (Definition exists).

---

## Stage 03 — Asset Generation™

**Purpose:** Manufacture every modular asset in dependency order.

**Owner:** Studio Asset Compiler™ + AI providers (FAL primary).

See [asset-production-workflow.md](./asset-production-workflow.md) for full generation order and per-asset specifications.

### High-Level Order

1. Environment → 2. Architecture → 3. Lighting → 4. Furniture → 5. Large objects → 6. Interactive objects → 7. Glass → 8. Floating UI → 9. VFX/Particles → 10. Animation refs → 11. Audio refs → 12. Final validation

### Gate

**Package Sealed** — `DepartmentPackage.zip` + `package-manifest.json` + `build-report.md` · Build Health ≥ 80.

---

## Stage 04 — Asset Review™

**Purpose:** Every generated asset passes human and genome quality before Registry.

See [asset-review-system.md](./asset-review-system.md).

### Gate

**Asset Review Complete** — 100% assets approved or explicitly regenerated · no `pending` items.

---

## Stage 05 — Registry™

**Purpose:** Approved assets become permanent Studio Asset Registry™ items.

| Path | Action |
|------|--------|
| Approved | Register · `lifecycle: approved` · reuse index updated |
| Rejected | Return to Stage 03 with revision scope |
| Reusable across industries | `genomeAdaptability` score assigned |

### CDS Registry Targets

| Asset | Registry ID (proposed) | Reuse Category |
|-------|------------------------|----------------|
| Studio Orb | `registry:orb-universal-v2` | `orb-universal` |
| Glass panels | `registry:glass-panel-frosted-v2` | `glass-panel` |
| Mood wall | `registry:mood-wall-hero-v1` | `interactive-wall-hero` |
| Lighting rig | `registry:lighting-rig-editorial-v1` | `lighting-rig-editorial` |
| Prompt fragments | `registry:prompt-fragment-*` | per Prompt Library |

### Gate

**Registry Sealed** — all approved CDS assets registered · `pkg-creative-direction-golden-v1` linked in `relationships.usedBy`.

---

## Stage 06 — Department Assembly™

**Purpose:** Cursor assembles the department from modular package — no baked screenshots.

See [department-assembly.md](./department-assembly.md).

### Gate

**Assembly Complete** — scene loads · all 35 assets mounted · interactions wired · no flat background dependency.

---

## Stage 07 — Runtime™

**Purpose:** Department Runtime™ brings the assembled department to life.

See [runtime-preparation.md](./runtime-preparation.md).

### Gate

**Runtime Active** — lifecycle state `ACTIVE` · Orb responding · concierges routable · ceremonies executable.

---

## Stage 08 — Validation™

**Purpose:** Holistic quality authority before Golden certification.

See [validation-pipeline.md](./validation-pipeline.md).

### Gate

**Validation Approval Token** issued — Runtime install permanent · Walk the Room™ passed · founder critique complete.

---

## Stage 09 — Golden Department™

**Purpose:** Creative Direction Studio™ certified as reference implementation.

See [golden-department-process.md](./golden-department-process.md).

### Gate

**Golden Certification** — inheritance documentation published · every future department answers: *Does it feel as alive as CDS?*

---

## Timeline & Dependencies

| Stage | Depends On | Blocks |
|-------|------------|--------|
| 01 Creative Direction | Genome · Founder Journey | 02 |
| 02 Asset Planning | 01 lock | 03 |
| 03 Asset Generation | 02 · Registry snapshot (reuse) | 04 |
| 04 Asset Review | 03 | 05 |
| 05 Registry | 04 | 06 (refs) · future reuse |
| 06 Assembly | 03 package · 05 refs | 07 |
| 07 Runtime | 06 | 08 |
| 08 Validation | 07 | 09 |
| 09 Golden | 08 | Future departments |

Stages 05 and 06 may overlap — Registry registration of approved assets can proceed while Cursor begins assembly on earlier-approved items.

---

## Rejection Loops

| Stage | Rejection Trigger | Return To |
|-------|-------------------|-----------|
| 01 | Founder rejects creative direction | Revise brief · mood · art direction |
| 04 | Asset fails review | Stage 03 — surgical regen scope |
| 05 | Registry validation fails | Stage 04 — metadata fix |
| 06 | Assembly wiring error | Stage 03 or 06 — asset or connection fix |
| 07 | Runtime boot failure | Stage 06 — assembly fix |
| 08 | Validation failure | Stage 04–07 depending on failure class |
| 09 | Golden criteria miss | Stage 08 — targeted remediation |

**Never full-regen by default** — Revision Engine surgical scopes only.

---

## CDS Pilot Status (v1)

| Stage | Status |
|-------|--------|
| 01 Creative Direction | ✓ Spec complete (Golden Department + Definition) |
| 02 Asset Planning | ✓ Definition complete (35 assets) |
| 03 Asset Generation | ○ Production plan defined · execution pending |
| 04 Asset Review | ○ Methodology defined |
| 05 Registry | ○ Methodology defined · seed IDs proposed |
| 06 Assembly | ○ Methodology defined |
| 07 Runtime | ○ Methodology defined |
| 08 Validation | ○ Methodology defined |
| 09 Golden | ○ Process defined · certification pending execution |

---

## Production Philosophy

1. **Place, not page** — every stage serves immersion, not UI convenience
2. **Modular always** — no baked screenshots · no flattened backgrounds
3. **Genome-native** — same topology · different soul per company
4. **Reuse before regen** — Registry consulted at Stage 03
5. **Founder authority** — AI assists · founder approves creative direction and golden status
6. **Cursor connects** — Cursor assembles and wires · never invents design
7. **Golden inheritance** — CDS success defines the bar for every future department

---

_End-to-end production — from creative intent to certified Golden Department._

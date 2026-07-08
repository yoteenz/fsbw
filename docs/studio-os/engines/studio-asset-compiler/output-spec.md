# Output Spec — Studio Asset Compiler™

**Engine Module:** `studio.asset-compiler.v1.output`  
**Deliverable:** `DepartmentPackage.zip`  
**Status:** Canonical manufacturing output

---

## Single Deliverable

Every compile produces **one zip**:

```
CreativeDirectionStudio_Package.zip
```

Generic pattern: `{DepartmentDisplayName}_Package.zip`

Internal package ID remains semver-addressed: `pkg-creative-direction-golden-v1`

---

## Package Directory Structure (v1)

```
DepartmentPackage/
├── 01_environment/          # Floor · atmosphere · exterior plates
├── 02_architecture/         # Shell · walls · ceiling · alcoves · portals
├── 03_furniture/            # Tables · shelves · pedestals · seating
├── 04_objects/              # Hero zone objects · intelligence anchors
├── 05_glass/                # Glass surfaces · panels · table tops
├── 06_holograms/            # Observatory · floating displays · orb glow volumes
├── 07_ui/                   # Glass inspect overlays · context panels (furniture not DOM)
├── 08_lighting/             # Light rigs · IBL · accent metadata
├── 09_vfx/                  # Particles · haze · atmosphere definitions
├── 10_animation/            # Ceremony · arrival · object motion refs
├── 11_audio/                # Ambient · ceremony · orb · interaction SFX manifests
├── 12_particles/            # Particle system JSON (may mirror 09_vfx split)
├── 13_prompts/              # Expanded provider-ready prompt stacks
├── 14_metadata/             # Dependencies · asset meta · validation · reuse map
├── 15_runtime/              # Runtime assembly manifest · Cursor handoff
├── 16_preview/              # Preview plate specs · thumbnails (pre-cook references)
├── manifest.json            # Package root manifest (required)
├── package-manifest.json    # Build manifest with health metrics (required)
└── build-report.md          # Human-readable compile report (required)
```

> **Note:** Folders 01–12 hold **generation targets** (paths + specs pre-cook). After provider execution, cooked GLB/audio land in same paths. `13_prompts/` is always compiler-written.

---

## Folder Assignment Rules

| Asset Category | Folder | Example Asset |
|----------------|--------|---------------|
| `environment` floor · atmosphere | `01_environment/` | env-floor-cds |
| `environment` shell · portals | `02_architecture/` | env-shell-cds, portal-entry-cds |
| `furniture` | `03_furniture/` | table-timeline-cds, shelf-library-cds |
| `zone` hero objects | `04_objects/` | wall-mood-cds, observatory-cds |
| glass-class assets | `05_glass/` | glass-panels-cds, table glass surfaces |
| luminous · display volumes | `06_holograms/` | orb-cds, observatory interior |
| inspect · context overlays | `07_ui/` | panel-context-float-cds |
| `lighting-rig` | `08_lighting/` | lighting-rig-cds |
| particles · haze | `09_vfx/` · `12_particles/` | particles-ambient-cds |
| animation metadata | `10_animation/` | ceremony-approval-cds |
| audio stems | `11_audio/` | audio-ambient-cds |
| all expanded prompts | `13_prompts/` | per-asset JSON/MD stacks |
| graphs · QA | `14_metadata/` | dependencies.json, validation.json |
| assembly | `15_runtime/` | runtime-assembly-manifest.json |
| preview specs | `16_preview/` | hero-angle-spec.md |

---

## Root `manifest.json`

```json
{
  "$schema": "studio.department-package.v1/manifest.json",
  "packageId": "pkg-creative-direction-golden-v1",
  "departmentId": "creative-direction",
  "displayName": "Creative Direction Studio™",
  "version": "1.0.0",
  "goldenDepartment": true,
  "compiledAt": "2026-07-08T00:00:00Z",
  "compilerVersion": "studio.asset-compiler.v1.0.0",
  "sourceDefinition": "docs/studio-os/departments/creative-direction-studio/",
  "assetCount": 35,
  "promptCount": 47,
  "generationStages": 12,
  "folders": ["01_environment", "02_architecture", "..."],
  "requiredEngines": [
    "studio.department-runtime.v1",
    "studio.validation-loop.v1"
  ]
}
```

---

## Pre-Cook vs Post-Cook

| Phase | Package State |
|-------|---------------|
| **Compiler output** | Full folder structure · expanded prompts · metadata · runtime manifest · empty asset slots with `pending` status |
| **Post-FAL** | Cooked GLB · textures · audio in 01–12 |
| **Post-Validation** | `validationApprovalToken` in 14_metadata |
| **Runtime install** | Department Runtime loads 15_runtime + cooked 01–12 |

Compiler sprint defines **pre-cook package** — complete and ready for AI generation queue.

---

## Output Naming

| Department | Zip Name |
|------------|----------|
| creative-direction | `CreativeDirectionStudio_Package.zip` |
| discovery | `DiscoveryDepartment_Package.zip` |
| Pattern | `{PascalDepartmentName}_Package.zip` |

---

## Anti-Patterns

| Forbidden in Package | Required |
|---------------------|----------|
| `background.png` full room | Modular 01–16 folders |
| `index.html` | 15_runtime manifest only |
| Unexpanded one-line prompts | 13_prompts/ full stacks |
| Missing build-report.md | Always included |
| Missing package-manifest.json | Always included |

See [package-schema.md](./package-schema.md) for `package-manifest.json` full schema.

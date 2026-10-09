# G — Geometry fidelity assessment

**Source inspected (read-only):** `01_SOURCE/build_astra_v1.py`, `export-validation-report.json`, saved `.blend` validation JSON.

## Method

Procedural recipe audit — **no mesh edits** in this sprint.

## Findings

| Element | Reference expectation | Astra V1 actual | Match | Severity |
|---------|----------------------|-----------------|-------|----------|
| Overall silhouette | Asymmetric red blade + left marble fin + stepped glass | Symmetric **five-pavilion** layout around central red **tower** | **Poor** | **High** |
| Red portal | Interlocking red planes, deep crimson | Twin thin **box blades** + transom/sidelights (`RED_PORTAL`) | **Poor** | **High** |
| Glass volumes | Distinct framed enclosures, varied heights | Repeated `pavilion()` template (3×3 pane grids) | **Partial** | **Medium** |
| Interior density | Arches, complex overlap | Mezzanine slabs, stairs, columns — **simpler grid** | **Partial** | **High** |
| Marble plinth | Strong vein contrast, sculpted mass | Boxes + repo `marble-half.png` UV | **Partial** | **Medium** |
| Triangle budget | N/A | **228,996 tris** — high count from **8-segment bevels** on many cubes | N/A | **Low** (count ≠ quality) |

## Oversimplification signals (CONFIRMED)

- **`pavilion()`** repeats identical pane/mullion logic — modular but **generic**.
- **277 meshes** mostly **972-triangle beveled cubes** (export report) — repetitive primitives, not hand-modeled reference forms.
- **No boolean-traced** red intersection geometry from reference image.

## Coherence

Multi-view renders **are** from one scene (consistent architecture) — **CONFIRMED** by shared `.blend` and camera manifest.

**GEOMETRY_FIDELITY:** **Architecturally coherent but reference-simplified — high severity mismatch on portal silhouette and massing.**

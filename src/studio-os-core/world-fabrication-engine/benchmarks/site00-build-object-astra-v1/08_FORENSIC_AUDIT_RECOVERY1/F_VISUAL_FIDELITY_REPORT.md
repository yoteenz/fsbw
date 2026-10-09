# F — Visual fidelity report (element table)

| Element | Reference expectation | Astra actual | Match | Severity | Evidence |
|---------|---------------------|--------------|-------|----------|----------|
| Overall silhouette | Asymmetric red blade + left stone fin | Central red tower + symmetric pavilions | **Fail** | High | `hero-vs-approved-reference.png`, deconstruction doc |
| Portal | Deep crimson interlocking planes | Twin acrylic boxes + transom | **Fail** | High | Renders + `RED_PORTAL` script |
| Glass volumes | Bright layered framed enclosures | Transmission panes; muted highlights | **Partial** | Medium | Founder noted glass ↑; comparison PNG |
| Interior architecture | Dense arches/overlap | Slabs/stairs/columns, simpler | **Partial** | High | Side render, creative-fidelity md |
| Floor plates | Strong horizontal rhythm | Present but regular grid | **Partial** | Medium | `build_astra_v1.py` mezzanine loops |
| Plinth | Bold veined marble | Subtle veins, correct mass roughly | **Partial** | Medium | Hero render |
| Materials (marble/red) | High contrast / deep red | Soft veins, coral red | **Fail** | High | Comparison + material manifest |
| Lighting | High-key white field | Gray studio floor/sky | **Partial** | Medium | Cycles setup in script |
| Camera | Perspective ¾ | Orthographic ¾ | **Fail** | High | `H_CAMERA_MATCH_AUDIT.md` |
| Human figures | Human silhouettes | Gray ellipsoids | **Fail** | High | `I_HUMAN_FIGURE_QUALITY_AUDIT.md` |
| Spatial continuity | Consistent world | Consistent across 5 renders | **Pass** | Low | Same `.blend` |

**No numeric similarity scores** — qualitative only.

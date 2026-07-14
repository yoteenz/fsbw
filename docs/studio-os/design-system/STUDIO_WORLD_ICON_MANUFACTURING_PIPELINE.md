# Studio World Icon Manufacturing Pipeline — Sprint 03

**Route:** `/admin/studio/icon-manufacturing`  
**Status:** Production pipeline — permanent icon manufacturing home

## Pipeline

```
Master Sheet → Calibration Studio → QA → Batch Export → Certification → Registry → Production Promotion
```

## Sections

| Section | Capability |
|---------|------------|
| Master Library | All uploaded master sheets (Experience Lab, Navigation Master, …) |
| Calibration Studio | Row/column/global controls — profile-aware 8×8 and 10×10 |
| Quality Assurance | Automatic PASS/WARN/FAIL per cell |
| Batch Export | Manufacture PNGs + metadata + manifest (founder runs build script) |
| Certification | Draft → Calibrated → QA → Founder Approved → Certified → Production |
| Registry | Search + auto-register on promotion (founder approval required) |
| Icon Health | Coverage, warnings, failures |
| Manufacturing History | Timeline of calibrations, exports, certifications |
| Production Promotion | One-click after founder approval — does not auto-swap EL runtime |
| Runtime Preview | Architecture preview contexts/sizes/themes (no UI changes) |

## Core modules

- `src/studio-os-core/icon-manufacturing/` — profiles, QA, certification, batch export, promotion, history
- `src/features/studio-world/icons/icon-manufacturing/` — UI shell, GridCalibrationStudio

## Legacy route preserved

`/admin/studio/studio-world-icon-grid-calibration` — Experience Lab v6 editor unchanged; banner links to manufacturing hub.

## Build commands

```bash
npm run experience-lab:build-icons          # Experience Lab v6 slice
npm run navigation-master:generate-sheet      # Navigation master artwork
npm run navigation-master:build-icons         # Navigation v1 slice
```

## Rules

- Master sheet is sole source of truth
- Never edit production PNGs directly
- No OCR, no heuristic crop detection
- Founder approval required for production promotion
- Experience Lab runtime not auto-replaced

## Tests

`src/features/studio-world/icons/icon-manufacturing/icon-manufacturing.test.ts`

# Experience Lab Icon Fidelity Repair

Pipeline: **experience-lab-icons-v2** · Source SHA256: `d7476775716d3f2dc9b2416198c81bbd19d8e1a7f5730c5ff3c79fe6cda1f51d`

## Forensic root cause

Prior extraction merged **printed label strokes** into glyph bounding boxes because:

1. Global bottom-up label heuristic mis-estimated `labelStart` on navigation-row icons.
2. Connected bright pixels were merged without **glyph vs label** component classification.
3. Confidence formula ignored **bottom-band text contamination** (reported 1.00 while labels remained).

## Repair applied

- Connected-component glyph/label classifier
- Horizontal gap detection between icon and label band
- Per-icon centralized overrides (`scripts/config/experience-lab-icon-extraction-overrides.ts`)
- Output text-contamination detector (baseline strip heuristics, no OCR)
- Optical scale registry tuning for undersized glyphs

## 64-icon audit summary

| Status | Count |
|---|---:|
| PASS | 40 |
| WARN | 24 |
| FAIL | 0 |

## Founder review group

### MATERIALS (`materials`)

| Stage | Detail |
|---|---|
| Source cell | row 0, col 3 |
| Glyph bounds | 0,57 → 174,86 |
| Label cutoff | y=114 |
| Bottom-band ratio | 0.000 |
| Contamination score | 0.000 (clean) |
| Override | yes — Paint-bucket glyph sits above MATERIALS label; auto bounds included label strokes. |
| Audit | **WARN** · conf 0.72 |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs `generated/materials.png` vs QA route sizes.

### CAMERA (`camera`)

| Stage | Detail |
|---|---|
| Source cell | row 0, col 5 |
| Glyph bounds | 0,57 → 175,82 |
| Label cutoff | y=117 |
| Bottom-band ratio | 0.000 |
| Contamination score | 0.000 (clean) |
| Override | yes — Camera body clipped low; label band false-positive extended bounds. |
| Audit | **WARN** · conf 0.72 |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs `generated/camera.png` vs QA route sizes.

### ANALYTICS (`analytics`)

| Stage | Detail |
|---|---|
| Source cell | row 1, col 4 |
| Glyph bounds | 0,11 → 174,78 |
| Label cutoff | y=109 |
| Bottom-band ratio | 0.000 |
| Contamination score | 0.000 (clean) |
| Override | yes — Bar-chart glyph merged with ANALYTICS word band in single bounding box. |
| Audit | **WARN** · conf 1.00 |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs `generated/analytics.png` vs QA route sizes.

### PLAYBACK (`playback`)

| Stage | Detail |
|---|---|
| Source cell | row 2, col 0 |
| Glyph bounds | 0,14 → 174,76 |
| Label cutoff | y=81 |
| Bottom-band ratio | 0.000 |
| Contamination score | 0.000 (clean) |
| Override | yes — Animation-studio play glyph contaminated by PLAYBACK label strokes. |
| Audit | **WARN** · conf 1.00 |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs `generated/playback.png` vs QA route sizes.

### ZOOM IN (`zoomIn`)

| Stage | Detail |
|---|---|
| Source cell | row 3, col 0 |
| Glyph bounds | 0,14 → 174,87 |
| Label cutoff | y=89 |
| Bottom-band ratio | 0.000 |
| Contamination score | 0.000 (clean) |
| Override | yes — Magnifier handle ends above ZOOM IN label band; prior cutoff included label strokes. |
| Audit | **WARN** · conf 1.00 |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs `generated/zoom-in.png` vs QA route sizes.

### PERSPECTIVE (`perspective`)

| Stage | Detail |
|---|---|
| Source cell | row 3, col 5 |
| Glyph bounds | 0,13 → 175,68 |
| Label cutoff | y=81 |
| Bottom-band ratio | 0.000 |
| Contamination score | 0.000 (clean) |
| Override | yes — Composition cube picked up PERSPECTIVE label characters. |
| Audit | **WARN** · conf 0.72 |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs `generated/perspective.png` vs QA route sizes.

### DASHBOARD (`dashboard`)

| Stage | Detail |
|---|---|
| Source cell | row 7, col 0 |
| Glyph bounds | 0,0 → 174,70 |
| Label cutoff | y=95 |
| Bottom-band ratio | 0.000 |
| Contamination score | 0.000 (clean) |
| Override | yes — Dashboard tiles merged with DASHBOARD label baseline. |
| Audit | **WARN** · conf 1.00 |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs `generated/dashboard.png` vs QA route sizes.

### TERMINAL (`terminal`)

| Stage | Detail |
|---|---|
| Source cell | row 7, col 2 |
| Glyph bounds | 0,5 → 174,70 |
| Label cutoff | y=95 |
| Bottom-band ratio | 0.000 |
| Contamination score | 0.000 (clean) |
| Override | yes — Command-center terminal glyph included TERMINAL word band. |
| Audit | **WARN** · conf 0.72 |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs `generated/terminal.png` vs QA route sizes.

### PERMISSIONS (`permissions`)

| Stage | Detail |
|---|---|
| Source cell | row 7, col 5 |
| Glyph bounds | 0,0 → 175,70 |
| Label cutoff | y=95 |
| Bottom-band ratio | 0.000 |
| Contamination score | 0.000 (clean) |
| Override | yes — Permit shield glyph overlapped PERMISSIONS baseline fragments. |
| Audit | **WARN** · conf 1.00 |

SOURCE → CORRECTED → RUNTIME: compare labeled cell vs `generated/permissions.png` vs QA route sizes.

## Full forensic table

| Key | Label | Row | Col | Status | Conf | Override | Bottom ratio | Contamination |
|---|---|---:|---:|---|---:|---|---:|---:|
| experienceLab | EXPERIENCE LAB | 0 | 0 | PASS | 0.92 | no | 0.00 | 0.00 |
| blueprint | BLUEPRINT | 0 | 1 | WARN | 1.00 | yes | 0.00 | 0.00 |
| construction | CONSTRUCTION | 0 | 2 | WARN | 1.00 | yes | 0.00 | 0.00 |
| materials | MATERIALS | 0 | 3 | WARN | 0.72 | yes | 0.00 | 0.00 |
| lighting | LIGHTING | 0 | 4 | WARN | 0.72 | yes | 0.00 | 0.00 |
| camera | CAMERA | 0 | 5 | WARN | 0.72 | yes | 0.00 | 0.00 |
| splitView | SPLIT VIEW | 0 | 6 | WARN | 1.00 | yes | 0.00 | 0.00 |
| founderRender | FOUNDER RENDER | 0 | 7 | WARN | 1.00 | yes | 0.00 | 0.00 |
| projects | PROJECTS | 1 | 0 | PASS | 1.00 | no | 0.00 | 0.00 |
| history | HISTORY | 1 | 1 | PASS | 1.00 | no | 0.00 | 0.00 |
| revisions | REVISIONS | 1 | 2 | PASS | 1.00 | no | 0.00 | 0.00 |
| milestones | MILESTONES | 1 | 3 | PASS | 0.92 | no | 0.00 | 0.00 |
| analytics | ANALYTICS | 1 | 4 | WARN | 1.00 | yes | 0.00 | 0.00 |
| performance | PERFORMANCE | 1 | 5 | WARN | 1.00 | yes | 0.00 | 0.00 |
| issues | ISSUES | 1 | 6 | PASS | 1.00 | no | 0.00 | 0.00 |
| approved | APPROVED | 1 | 7 | PASS | 1.00 | no | 0.00 | 0.00 |
| playback | PLAYBACK | 2 | 0 | WARN | 1.00 | yes | 0.00 | 0.00 |
| pause | PAUSE | 2 | 1 | PASS | 1.00 | no | 0.00 | 0.00 |
| stop | STOP | 2 | 2 | PASS | 1.00 | no | 0.00 | 0.00 |
| next | NEXT | 2 | 3 | PASS | 1.00 | no | 0.00 | 0.00 |
| previous | PREVIOUS | 2 | 4 | PASS | 1.00 | no | 0.00 | 0.00 |
| loop | LOOP | 2 | 5 | PASS | 1.00 | no | 0.00 | 0.00 |
| capture | CAPTURE | 2 | 6 | PASS | 1.00 | no | 0.00 | 0.00 |
| fullscreen | FULLSCREEN | 2 | 7 | PASS | 1.00 | no | 0.00 | 0.00 |
| zoomIn | ZOOM IN | 3 | 0 | WARN | 1.00 | yes | 0.00 | 0.00 |
| zoomOut | ZOOM OUT | 3 | 1 | PASS | 1.00 | no | 0.00 | 0.00 |
| pan | PAN | 3 | 2 | WARN | 1.00 | no | 0.22 | 0.08 |
| fitView | FIT VIEW | 3 | 3 | PASS | 0.92 | no | 0.00 | 0.00 |
| orbit | ORBIT | 3 | 4 | WARN | 1.00 | yes | 0.00 | 0.00 |
| perspective | PERSPECTIVE | 3 | 5 | WARN | 0.72 | yes | 0.00 | 0.00 |
| toggleUi | TOGGLE UI | 3 | 6 | PASS | 1.00 | no | 0.00 | 0.00 |
| grid | GRID | 3 | 7 | PASS | 1.00 | no | 0.00 | 0.00 |
| hide | HIDE | 4 | 0 | PASS | 0.92 | no | 0.00 | 0.00 |
| lock | LOCK | 4 | 1 | PASS | 1.00 | no | 0.08 | 0.03 |
| unlock | UNLOCK | 4 | 2 | WARN | 1.00 | no | 0.29 | 0.09 |
| duplicate | DUPLICATE | 4 | 3 | PASS | 0.92 | no | 0.00 | 0.00 |
| delete | DELETE | 4 | 4 | WARN | 0.92 | no | 0.21 | 0.09 |
| edit | EDIT | 4 | 5 | PASS | 1.00 | no | 0.14 | 0.06 |
| settings | SETTINGS | 4 | 6 | PASS | 0.92 | no | 0.00 | 0.00 |
| filter | FILTER | 4 | 7 | PASS | 1.00 | no | 0.14 | 0.04 |
| export | EXPORT | 5 | 0 | WARN | 0.92 | no | 0.27 | 0.18 |
| import | IMPORT | 5 | 1 | PASS | 1.00 | no | 0.06 | 0.04 |
| cloudSync | CLOUD SYNC | 5 | 2 | PASS | 0.92 | no | 0.00 | 0.00 |
| database | DATABASE | 5 | 3 | PASS | 0.92 | no | 0.00 | 0.00 |
| link | LINK | 5 | 4 | PASS | 1.00 | no | 0.11 | 0.09 |
| share | SHARE | 5 | 5 | WARN | 1.00 | yes | 0.00 | 0.00 |
| users | USERS | 5 | 6 | PASS | 0.92 | no | 0.04 | 0.05 |
| team | TEAM | 5 | 7 | WARN | 1.00 | yes | 0.00 | 0.00 |
| notifications | NOTIFICATIONS | 6 | 0 | PASS | 1.00 | no | 0.10 | 0.08 |
| comments | COMMENTS | 6 | 1 | PASS | 1.00 | no | 0.03 | 0.03 |
| notes | NOTES | 6 | 2 | PASS | 0.92 | no | 0.08 | 0.09 |
| attachments | ATTACHMENTS | 6 | 3 | WARN | 1.00 | yes | 0.00 | 0.00 |
| schedule | SCHEDULE | 6 | 4 | PASS | 0.92 | no | 0.05 | 0.06 |
| timeTracking | TIME TRACKING | 6 | 5 | PASS | 1.00 | no | 0.13 | 0.12 |
| flag | FLAG | 6 | 6 | PASS | 1.00 | no | 0.04 | 0.03 |
| favorite | FAVORITE | 6 | 7 | PASS | 1.00 | no | 0.11 | 0.09 |
| dashboard | DASHBOARD | 7 | 0 | WARN | 1.00 | yes | 0.00 | 0.00 |
| focusMode | FOCUS MODE | 7 | 1 | PASS | 1.00 | no | 0.02 | 0.01 |
| terminal | TERMINAL | 7 | 2 | WARN | 0.72 | yes | 0.00 | 0.00 |
| diagnostics | DIAGNOSTICS | 7 | 3 | WARN | 1.00 | yes | 0.00 | 0.00 |
| security | SECURITY | 7 | 4 | PASS | 1.00 | no | 0.09 | 0.08 |
| permissions | PERMISSIONS | 7 | 5 | WARN | 1.00 | yes | 0.00 | 0.00 |
| help | HELP | 7 | 6 | PASS | 1.00 | no | 0.08 | 0.07 |
| about | ABOUT | 7 | 7 | PASS | 1.00 | no | 0.09 | 0.07 |

## Regenerate

```bash
npm run experience-lab:build-icons
```

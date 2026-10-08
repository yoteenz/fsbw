# AIO OFFICE visual authority studio — HOME · WORK · REPORTS · MORE

Design authority only. Nothing in `src/` imports these files, and the studio is never deployed.

Sprint: `P0.AIO.OFFICE.FOUNDER-HOME-WORK-REPORTS-MORE.FOUNDER-APPROVAL-AND-VISUAL-AUTHORITY1` (2026-10-08).

| File | What it is |
|---|---|
| `studio.html` · `studio.css` · `studio.js` | Deterministic UI assembly over approved photography (HYBRID_HARD_RULE): `studio.html?page=home\|work\|reports\|more\|kit&role=founder\|staff\|staff-granted&view=attention\|deadlines\|blocked&state=quick`. The viewport is read from the window width: mobile < 700, tablet 700–1023, desktop ≥ 1024, wide ≥ 1900. |
| `compare.html` | Original-versus-revised boards: the founder's drawing, the revised first screen, the revised full page, and what changed. |
| `render.mjs` | Serves the app root, renders every frame with Chromium, runs the visual QA against the DOM, and writes `../../../AIO_OFFICE_VISUAL_AUTHORITY/` plus `renders.json`. |
| `standins/` | Seven lane images cropped from the founder's drawing. They are for review only and are labelled STAND-IN on every render. `standins.json` lists their source boxes and sha256. |

```
cd all-in-one-enterprises && node design-authority/aio-office/render.mjs
```

Rules the studio follows:
- **Frame:** the approved AIO OFFICE staff frame from `AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT`, with WORK in place of FILING.
- **Brand:** the header lockup `public/migration/brand-lockup.png` only.
- **Type and icons:** Roboto Condensed and Roboto from `public/fonts/migration`; glyphs from the founder icon sheet and the migration kit's outline family, plus six supplemental glyphs drawn here (marked NEW GLYPH on the components sheet).
- **Text:** every visible word is uppercase.
- **Data:** every figure is ILLUSTRATIVE SAMPLE DATA, labelled SAMPLE. Signals and honest states follow the AIO office root contracts in the SITE00 Experience Brain.

Status:
- **Decisions:** approved.
- **Visuals:** generated, and awaiting founder approval.
- **Implementation:** not authorized.

The record lives in `docs/aio/office-visual-authority/`, vendored from SITE00.

## The unified office review (`office/`)

The next sprint (`P0.AIO.OFFICE.COMPLETE-INTERNAL-OFFICE-AND-UNIFIED-EXPERIENCE1`) builds the whole internal office around these roots: INTAKE, the twelve lanes, the report domains, the MORE destinations, record pages and Client 360. See `office/README.md`. The studio's only change for it is embed support: `window.AIO_STUDIO_EMBED` and `studioSet()`, plus `data-go` / `data-act` / `data-sim` hooks on existing controls. These are attributes only, and all 38 authority renders keep their pinned sha256.

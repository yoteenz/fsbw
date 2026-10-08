# AIO OFFICE unified review — the whole internal office, connected

Design authority only. Nothing in `src/` imports these files, the review is never deployed, and it holds **sample records only** (no real client, person, policy or money).

Sprint: `P0.AIO.OFFICE.COMPLETE-INTERNAL-OFFICE-AND-UNIFIED-EXPERIENCE1` (2026-10-08), batch 1. Founder review: https://claude.ai/artifact/VQCyD4A4YmeErb27ik2hgG

The approved roots (HOME · WORK · REPORTS · MORE) are drawn by `../studio.js` in embed mode, exactly as approved; INTAKE shows the approved client-migration screens unchanged; WORK › FILING & FUEL TAXES shows the approved IFTA command unchanged. Everything else is an office page built from shared components.

| File | What it is |
|---|---|
| `office-data.js` | The sample records. One record per business entity; every lane points to the same record by id. |
| `office-ui.js` · `office.css` | Shared components: page header, client context bar, tabs, filter chips, rows, record frame pieces, actions column, related records, honest states, boards, fleet cards. |
| `pages-core.js` | HOME detail pages, Client 360 and the record page for every record type. |
| `pages-intake.js` | INTAKE root, the ten sections, migration cases and the approved flow viewer. |
| `pages-work.js` | MY WORK, ALL OPEN WORK and the twelve lane workspaces. |
| `pages-reports-more.js` | The ten REPORTS domains and the eleven MORE destinations with their child pages. |
| `office-app.js` · `viewer.css` | Router, client context, simulated actions, search, switcher, the device frame, and the review guide (page status, journeys, incomplete destinations). |
| `build.mjs` | Bundles one page plus its images into `dist/` (`index.html` to publish, `local.html` for QA). Needs python3 + Pillow for resizing. |
| `qa.mjs` | Crawls every reachable page at four screen sizes and three roles, runs the journeys and interactions, writes `qa-report.json`, and with `--shots` the review screenshots. |

```
cd all-in-one-enterprises
node design-authority/aio-office/office/build.mjs /tmp/aio-office-review
node design-authority/aio-office/office/qa.mjs /tmp/aio-office-review --shots ../AIO_OFFICE_UNIFIED_REVIEW/screens
```

Interaction rules:
- `data-go` navigates inside the review. Every tap opens a designed page; QA fails on a dead control.
- `data-sim` is a simulated action. It asks first, then changes status and history for this visit only (SIMULATED · NOT SAVED).
- Founder-only actions never render for staff. Pages a role is not granted show the permission page. In the live app, the server must enforce these grants.
- Approval in INTAKE lands on PREBUILT. Only the client's confirmation makes a client ACTIVE.

The record lives in `docs/aio/office-unified-experience/`, vendored from SITE00.

# AIO OFFICE — four workspace proofs

Sprint `P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.CREATIVE-DIRECTION-AND-WORKSPACE-RECOVERY1` (2026-10-08) built the four workspaces.

Sprint `P0.AIO.OFFICE.UNIFIED-EXPERIENCE2.MATERIAL-MOTION-AND-DETAIL-POLISH1` locked their design language and polished their material, motion and detail. The language is recorded as the AIO OFFICE WORKSPACE STYLE in `docs/aio/office-workspace-style/`.

Founder review: https://claude.ai/artifact/DKYZUHjSdiTw1qSC1evdbk

This folder holds four creative-directed workspaces: VEHICLES & FLEET, BOOKKEEPING, COMPLIANCE and CLIENT 360. Each one is composed for its kind of work:

- **Fleet** is built around a truck.
- **Bookkeeping** is built around a month.
- **Compliance** is built around a calendar.
- **Client 360** is built around a company.

All four draw inside the approved header and five-root navigation (`../studio.js` in embed mode, unchanged). They use the Batch 1 sample records in `../office/office-data.js`, so they show the same records as Batch 1, recomposed.

The workspaces are candidates until the founder approves them. They are isolated from `src/` and are never deployed. Nothing in them saves or sends anything.

| File | What it is |
|---|---|
| `ws-data.js` | Extra sample data for the proofs: fleet meta, bookkeeping periods and items, deadline owners and history. Amounts are labelled SAMPLE and no balances appear. |
| `ws-core.js` | The shared engine: one state object, `data-a` actions, inline SIMULATED confirmations, drawers, and the BACK path across workspaces. |
| `ws-motion.js` | Motion: the review patches the page instead of redrawing it, so scroll, focus and rows survive. It also slides the segmented thumbs, and moves focus into and out of drawers (Tab trap, inert background). |
| `ws-fleet.js` | VEHICLES & FLEET: yard roster, blueprint stage with tags on the truck, and the connection panel. |
| `ws-books.js` | BOOKKEEPING: the close as a ledger rule, the worktable, and the focus panel. |
| `ws-compliance.js` | COMPLIANCE: the 90-day horizon, the urgency queue, and the case panel. |
| `ws-client.js` | CLIENT 360: the directory, the identity plate, the twelve-service constellation, and the drill-stack panel. |
| `ws.css` | The workspace grammar on the approved tokens, with the locked type, motion and elevation tokens and the MOTION, DRAWERS and CONTROLS · STATES layers. |
| `ws-review.js`, `review.css` | The founder review: landing, tabs, device switch, FOUNDER / STAFF switch, BEFORE view, and TRY demonstrations. |
| `build.mjs` | Builds one self-contained page plus its images, as a fragment for the artifact and as `local.html`. |
| `qa.mjs` | 258 checks: journeys, dead controls, handlers, keyboard reach, fit, overflow, uppercase, roles, demonstrations, motion, drawers, reduced motion and the text audit. It also takes screenshots. |
| `audit.mjs` | The text audit over 79 states at four sizes, checking for wraps, clipping, overlaps, unreachable truncation, text below 9 px and unintended sideways scroll. It can run alone, and `qa.mjs` uses it. |
| `record.mjs` | Records twelve interactions with real clicks, saving MP4, WebM and a filmstrip for each. |
| `boards.mjs` | Makes the since-Batch-1 before → after boards and the board comparing the approved roots with the workspaces. |
| `polish-boards.mjs` | Makes the seven boards comparing the last pass with this one, including the text-audit counts and frames from the recordings. |

**Mobile preview tunnel (live demo):** build into `preview/`, then open `site.html` on the AIO Vite tunnel (paths in `docs/cloud-agent/aio-design-preview-tunnel.md` at repo root).

```
node design-authority/aio-office/workspaces/build.mjs design-authority/aio-office/workspaces/preview
node design-authority/aio-office/workspaces/build.mjs /tmp/ws
node design-authority/aio-office/workspaces/qa.mjs /tmp/ws ../AIO_OFFICE_WORKSPACE_PROOFS/screens
node design-authority/aio-office/office/build.mjs /tmp/b1 && node design-authority/aio-office/workspaces/boards.mjs /tmp/b1 /tmp/ws
node design-authority/aio-office/workspaces/record.mjs /tmp/ws ../AIO_OFFICE_WORKSPACE_PROOFS/recordings after   # and the last pass with label "before"
node design-authority/aio-office/workspaces/polish-boards.mjs /tmp/ws-last /tmp/ws ../AIO_OFFICE_WORKSPACE_PROOFS/recordings
```

The record of this work is the Experience Brain in SITE00 (`projects/aio/office-workspace-proofs.ts` and `projects/aio/office-workspace-style.ts`), vendored to `docs/aio/office-workspace-proofs/` and `docs/aio/office-workspace-style/`. The outputs (boards, screens and the QA summary) are in `AIO_OFFICE_WORKSPACE_PROOFS/` at the repository root.

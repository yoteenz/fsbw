# AIO IFTA · three-mode authority V2 (fine-tune of V1)

Sprint `P0.AIO.IFTA.THREE-MODE-AUTHORITY-REFINEMENT-V2`. **Founder direction: fine-tune V1 only; do not change the composition.**

V2 keeps V1's composition exactly:
- every page, block, image, card, rail, tab and hero element in the same place and size, on every band
- the same concepts, imagery, content, copy, data, logic and brand

Only type size, weight, tracking and contrast are refined, so one role reads the same in every mode.

An earlier V2 draft (`ab2e4e99`) recomposed the phone and tablet layouts. It was withdrawn and replaced by this fine-tune.

**Nothing live was changed.** The patch ships here as `v2-reference.patch`, which applies cleanly to `master` with `git apply -p1`. It contains:
- one appended block in `ifta-ui.css`
- the new light-ground lockup `public/brand/ifta/aio-lockup-light-bg.png`
- its manifest entry
- one line in the mock builder (the mock note is uppercase too)

There are no TSX changes.

## Founder additions (after the fine-tune)

- **Uppercase.** Every word on the IFTA pages and mocks is uppercase: client, staff case, queue, public, shell and footers. Identifiers such as the case ID display uppercase; the stored values are unchanged.
  - Where uppercase ran wider, row text was sized down slightly so V1's widths and line breaks hold: the public desktop process tiles and promises, the client activity lines and upload names, one client tablet card title, and the staff phone health and task rows.
  - The public desktop promises keep their exact V1 widths.
  - One long staff quarter-task row ("CONFIRM A DUPLICATE TA PETRO RECEIPT") truncates on staff desktop and at 375 px, like its neighbours already did in V1.
- **Light-ground footer logo.** On the client, staff and queue footers, the black-plate lockup is replaced by the founder's transparent light-ground lockup (`aio-lockup-light-bg.png`). It has the same height and position, is 6–8 px wider (the logo's own proportions) and has no plate. The public footer keeps the dark-ground lockup over the mountain photo.

| | V1 (kept for comparison) | V2 fine-tune |
|---|---|---|
| Public | https://claude.ai/artifact/WQDLzooEj26KangyyzKssx | https://claude.ai/artifact/Mwz9TDJadxqKMPpcoBxxCR |
| Client | https://claude.ai/artifact/JDEeSCFdEea3JUTDkYxMzw | https://claude.ai/artifact/D4rPXM9faMgPse25oUxgzt |
| Staff / founder | https://claude.ai/artifact/LbuNRAW5JrDtnevYrjSfQ4 | https://claude.ai/artifact/2562hEnELiQyQSjCkoB5FR |

- Boards: `boards/v1-v2-{public,client,staff}.jpg` (V1 left, V2 right) and the equal-scale `boards/v2-three-mode-board.jpg`.
- The V2 links are static snapshots. The V1 links follow `master` via the mock refresh routine.

## Composition lock (proof)

A geometry capture records the box of every structural block on V1 and on V2, at 375, 402, 834, 1024 and 1440 for public, client and staff (queue at 402, 1024 and 1440). The blocks are:
- shell, hero, hero plates, images and pictures
- health panel
- metric rail and its cells
- tab row and tabs
- grid areas and cards
- CTA rail, footers
- public sections, process steps, promises
- logo, avatar, state pill

Hero and card text anchors are recorded too.

**Result:** all 18 views are identical to V1 (±1 px blocks, ±4 px text anchors), page heights included. The tool is in the session scratchpad (`geom.mjs` / `geomdiff.py`).

## What changed (V1 → V2, computed px)

| Role | public 1440 | client 1440 | staff 1440 | public 834 | client 834 | staff 1024 | client 402 | staff 402 |
|---|---|---|---|---|---|---|---|---|
| Card titles | — | 18.5 | 19 → 18.5 | — | 20.5/21/23.5 → 21 | 17.5/23 → 17/21 | 8.2/9.6 → 9.2 | 7/8.2 → 7/9.2 |
| Next-action label | — | 18 → 22 | 27 → 22 | — | 21.5 → 22 | 26 → 22 | 13 | 13 |
| Next-action eyebrow | — | 18 → 16 | 16 | — | 17.5 → 16 | 17 → 16 | 7.5 → 8 | 7.5 → 8 |
| Metric labels | 20 → 17 | 17.5 → 14.5 | 16.5 → 14.5 | 16 → 15 | 14.5 → 15.5 | 16 → 15.5 | 7.2 | 6.2 → 7.2 |
| Metric values | 37 | 29 → 31 | 34 → 31 | 30 | 24/28.5 | 30/35 | 13/17.2 | 11/13 |
| Metric delta | — | — | 15 → 13 | — | — | — | — | — |
| Client health title / chip / rows | — | — | 23/16/17 → 20/13.5/15.5 | — | — | 22.5/15/19 → 20/15/17 | — | — |
| Tabs | — | 15 → 14.5 | 14.5 | — | 14.5 → 15 | 15 | 7.5 | 7.5 |
| View All | — | 13 | 13/15.5 → 13 | — | 15.5 → 15 | 13/15 → 15 | 7 | 5.5/7 |
| Workflow rows | — | 16.5 → 17 | 17.5 → 17 | — | 18.5 | 19.5 → 18.5 | 7.5 | 7.5 |
| Task rows | — | 15.5 → 15 | 15.5 → 15 | — | — | 20 → 18 | — | 6.6 |
| Chart axis (client bars) | — | 9.5 → 12 | 15 | — | — | — | — | — |
| Section headings | 25/29/31.5 → 26/29 | — | — | 30 | — | — | — | — |
| Sample badge | 10.5 → 11.5 | — | — | 10.5 → 11.5 | — | — | — | — |
| Footer tagline | — | 11.5 | 13 | — | 13 | 13 | 6.5 → 7.5 | 6.5 → 7.5 |

Plus, on every band:
- **Staff and queue hero (contrast).** The night-yard plate carried dark text and the lockup was nearly invisible. The lockup is now light with a soft shadow, Q3 2026 is white at weight 600 instead of 700, and the client name leads the hero lines in white 600. Positions and sizes are unchanged.
- **Staff desktop metric rail.** The "TOTAL FUEL (GAL)" label ran 5 px under its "vs Q2 2026" delta; it now clears it by 8 px.
- **Phone.** Small, scale-relative nudges to labels, status, legends, activity and footer text, only where the V1 box already had room.
- **Clipped rows.** Tracking is 0 on legend names, task rows, activity titles, risk detail and upload names, so more text shows before the ellipsis.

## Checks (worktree on `aace9d2d` + patch)

| Check | Result |
|---|---|
| Composition lock | 18 / 18 views identical to V1 |
| Horizontal overflow | None at 375, 402, 834, 1024 or 1440 |
| Clipped text | Equal to or lower than V1 in every view: client 834 8 → 5, staff 1024 12 → 10, staff 834 12 → 10, client 375 10 → 9; all others the same |
| Text below 12 px (desktop / tablet) | Equal or lower: client 1440 14 → 8, staff 1440 8 → 3, staff 834 11 → 8 |
| `tsc` | Clean |
| `vitest src/ifta` | 21 / 21 |
| Live interaction pass | 41 / 43, the same as untouched `master` |

The phone pages are V1's dense authority phone composition, so their text stays small by design. With the composition locked, V2 only nudges type where the box allows.

The two interaction failures come from the Cursor-agent commit `596dc269`, not from V2:
1. The client page shows a "Client health" card, which the staff-only guard forbids.
2. The staff action reads "Return draft" instead of "Nudge client".

Both await a founder decision.

No image generation was run.

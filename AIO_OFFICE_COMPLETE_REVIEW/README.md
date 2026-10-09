# AIO OFFICE — the complete office (design review evidence)

Sprint **P0.AIO.COMPLETE-PRODUCT-VISUAL-CONVERGENCE.INTERNAL-OFFICE-AND-PUBLIC-WEBSITE1** (2026-10-09). This is a design review on sample records. Nothing is live or saved.

## What this is

The internal AIO OFFICE, completed in the locked AIO OFFICE WORKSPACE STYLE.

- **The five approved roots** (HOME · INTAKE · WORK · REPORTS · MORE) are drawn unchanged. Every link on them opens a designed page.
- **All twelve service lanes** have a workspace, each built around its own object:

| No. | Lane | Built around |
|---|---|---|
| 01 | Permitting | an application |
| 02 | Filing & fuel taxes | a quarter |
| 03 | Compliance | a calendar |
| 04 | Fleet | a truck |
| 05 | Dispatch | a load board |
| 06 | Brokerage | a match (paused) |
| 07 | Insurance | coverage |
| 08 | Factoring | an invoice packet |
| 09 | Bookkeeping | a month |
| 10 | Drivers | a driver's credentials |
| 11 | Maintenance | a repair line |
| 12 | Road Ready | a road |

- **The other office pages:**
  - HOME has a triage desk.
  - INTAKE has the migration line.
  - REPORTS has its ten areas.
  - MORE has its eleven destinations.
  - Client 360 stays the relationship pattern.

The review groups the departments in four groups: AUTHORITY & FILINGS · TRUCKS & PEOPLE · FREIGHT & MONEY · THE OFFICE. Each department shows MAIN, SELECTED, DEEPER and PHONE states, and its TRY demonstrations press the real controls.

## Contents

- `boards/dept-<id>.jpg`: one board per department. Each shows:
  - the primary workspace
  - a selected record
  - a deeper interaction
  - tablet, phone and phone-open views
  - ultra-wide
  - the links on the approved roots that open it
  - its TRY demonstrations
- `renders/<id>/`: the render set behind each board. MAIN at 390 · 834 · 1440 · 2560, and every SEE state at its device.
- `thumbs/`: the landing cards of the review.
- `screens/` and `qa-summary.json`: the office QA, written by `qa.mjs`.

## Tools (fsbw `all-in-one-enterprises/design-authority/aio-office/workspaces/`)

```
node build.mjs <dist>                    # the review (WS_ONLY=id,id to build some lanes only)
node lane-check.mjs <dist> <id> <out>    # one workspace: every SEE and audit state at four sizes, structure + text audit
node qa.mjs <dist> <screensDir>          # the whole review: every page at four sizes, roots → pages, demos, drawers, motion, text audit
node dept-boards.mjs <dist>              # → boards/dept-*.jpg + renders/
node thumbs.mjs <dist>                   # → thumbs/ (then build again so the landing shows them)
```

The previous sprint's evidence (`AIO_OFFICE_WORKSPACE_PROOFS/`) is left as it was.

# Composer propagation manifest — client migration responsive family

**Owner of the system:** Opus (audit, architecture, blueprint, shell, root reconstruction, representative proof set).
**This file:** the repetitive follow-up work that remains, scoped so Composer can execute it without redesigning anything.
Every item below works *inside* the blueprint (tokens, declarations, shell). None of it may add a per-screen breakpoint,
change the phone authorities, or touch lifecycle / actor / data logic.

**What is already complete (do not redo):** the shell for all 41 screens (header, sidebar, dock, hero band, tokens,
breakpoints) applies automatically through `MigrationShell` + `migrationResponsive.ts`; every screen is declared; the root
matches the tablet and desktop masters; all leak checks pass; conformance per screen is in
`validation/responsive-qa.json`.

## Ground rules

1. Read `future-page-contract.md`, `grid-rules.json`, `table-list-rules.json` first.
2. Phone (< 700px) must stay pixel-identical: capture every touched screen at 427×768 @2x before and after (threshold 0.01%).
3. Validate with `npm run migration:responsive-qa` (MIG_MOCK_BASE=<dev server>) — leak checks must stay 100% and the
   touched screens must not lose conformance; `npm run migration:blueprint -- --check` must pass.
4. Uppercase law; no invented copy; column headers only name data already in the row.

## Items

### C1 · Tables for the remaining record lists (TABLE_MODE)
| Screen | Today (tablet / desktop) | Target | Columns (data already shown) |
| --- | --- | --- | --- |
| `batch-complete` | `.amg-results` rows | `<table>` from tablet up, phone rows unchanged | CLIENT · OUTCOME · (OPEN) |
| `upload` | `UploadedFiles` rows | table from tablet up | FILE NAME · TYPE · SIZE · STATUS · ACTIONS |
| `batch-conflicts` | duplicate compare cards | keep cards (decision UI), add a summary table above only if the founder asks | — |

Pattern to copy: `BatchQueueScreen` (`MigrationBatchScreens.tsx`) — render the `<table className="amg-qtable">` next to the
phone rows, flip the declaration to `table: 'TABLE'`, and the CSS (`[data-table='TABLE']`) hides the phone rows from tablet up.
**Founder confirmation needed** on the columns before C1 ships (the authorities draw rows, not tables).

### C2 · Reflow phone-unit row internals at narrow tablet widths (700–760px)
Some module rows are drawn in authority units (853u) with fixed internal columns; between 700 and ~760px they compress by up to
7% instead of wrapping. Make them wrap (grid areas → second row) **only inside `@media (min-width: 700px)`**:
- `ActivationPeopleScreen` person rows (`.amg-person`: contact lines + choice bar) → choice bar below the contact block.
- `ActivationDocumentsScreen` rows (`.amg-dlist2`) → choice bar below the title block.
- `MigrationReviewScreen` section rows (`.amg-review__rows`: confidence + action grid) → action grid below at < 760px.
Acceptance: no clipped text (the QA overflow probe), touch targets ≥ 32px, phone unchanged.

### C3 · Header search scope
The desktop search placeholder (authority copy) reads "Search clients, migrations, or help…"; today it searches clients
(opens the existing-client finder with `?q=`). When a migrations index (batches) exists, add a grouped result list; until then
do not change the placeholder (authority) — this is recorded as a known gap, not a bug to hide.

### C4 · Sidebar / dock glyphs (founder decision)
The masters draw a document glyph for INTAKE and outline bars for REPORTS; the family uses the founder icon sheet glyphs (tray,
signal) at every size. Swap only if the founder chooses the master glyphs — then add them to the icon sheet, not as one-offs.

### C5 · Retina hero plates (asset)
`env-wide-tablet.jpg` / `env-wide-desktop.jpg` are cut from 1× masters. When 2× sources exist, add `srcset` densities in
`HeroPlate` (AioMigrationKit.tsx); same crop, same focal points (hero-rules.json).

### C6 · Screens below the conformance bar
Any screen listed under `summary.below90` in `validation/responsive-qa.json` gets one fix pass against the failing parts
(`viewports.TABLET.parts` / `viewports.DESKTOP.parts`): shell, hero, grid, overflow, gutter, cta, table, touch.

## Not for Composer
- New masters for other families (existing / activation / new / batch tablet or desktop frames) — Opus re-derives the grammar.
- Anything touching lifecycle, PREBUILT ≠ ACTIVE, actor boundaries, auth, RLS, routes or data.

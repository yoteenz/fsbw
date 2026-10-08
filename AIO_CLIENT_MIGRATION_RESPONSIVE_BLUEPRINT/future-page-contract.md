# Future migration page contract

**DO NOT SCALE. REFLOW. One responsive system, many page expressions.**

A new client-migration page gets the family's shell, navigation, hero band, grids, tokens and actor boundaries at
MOBILE / TABLET / DESKTOP by **declaring what it is**. It never writes its own breakpoints, never re-creates the header,
the dock or the sidebar, and never decides on its own whether a client may see staff navigation.

## 1. Declare the page (required)

Add one entry to `all-in-one-enterprises/src/client-migration/visual/migrationResponsive.ts`:

```ts
'batch-export': staff('AIO-MIG-BATCH-EXPORT-001', `${M}/batch-export`, {
  pageType: 'TABLE_LIST',      // LANDING · PATH_SELECT · UPLOAD · PROCESSING · REVIEW · TABLE_LIST · DETAIL ·
                               // CONFIRMATION · INVITE · ACTIVATION · ARRIVAL · BATCH
  density: 'TABLE_HEAVY',      // LOW · MEDIUM · HIGH · TABLE_HEAVY
  hero: 'COMPACT',             // FULL (landing / arrival only) · COMPACT · NONE
  primaryGrid: 'MAIN_SIDE',    // PATHS_3UP · MAIN_SIDE · CANVAS_PANEL · SINGLE · CENTERED
  process: 'NONE',             // BAND · STEPPER · STAGES · NONE
  support: 'SIDE',             // SUPPORT_GRID · SIDE · NONE
  form: 'NONE',                // FIELDS · CHOICES · NONE
  table: 'TABLE',              // TABLE · ROWS · NONE
  overlay: 'NONE',             // SHEET · NONE
}),
```

`staff(...)` and `client(...)` fill the actor and the defaults; set only what differs. Then run
`npm run migration:blueprint` so `screen-responsive-map.json` lists the page (the export fails `--check` until it does).

| Field | Rule |
| --- | --- |
| ACTOR | `STAFF` → AIO OFFICE shell (tablet dock, desktop sidebar + search). `CLIENT` → CLIENT OFFICE shell: no navigation, no INTAKE, no staff controls, no `/office` links. |
| PAGE_TYPE | Picks the default regions (page-type-taxonomy.json). |
| DENSITY_CLASS | Guides spacing and whether records become a table. |
| HERO_MODE | FULL only for the landing and the arrival. Working pages are COMPACT. |
| PRIMARY_GRID_MODE | Staff review → CANVAS_PANEL. Client pages → CENTERED. Working pages → MAIN_SIDE. |
| PROCESS_MODE | BAND renders the stage count from data (`AioSteps` with `--n`); never hard-code columns. |
| SUPPORT_GRID_MODE | SIDE puts what-happens-next / notes in the side column (desktop) or paired panels (tablet). |
| FORM_MODE | FIELDS: 2 columns from tablet up. |
| TABLE_MODE | TABLE: stacked rows on the phone, a semantic table (`<table>` + `th scope="col"`, or role=table) from tablet up. |
| OVERLAY_MODE | SHEET: bottom sheet → edge sheet → modal / inspector (overlay-rules.json). |

## 2. Render inside the shell (required)

```tsx
<MigrationShell family="root" actor="staff" screen="batch-export" viewer={viewer}>
  <AioMigrationHero kicker="CLIENT MIGRATION INTAKE" title={['BATCH', 'EXPORT']} subtitle={...} />
  <AioFlow top={466}>
    <AioCard>…</AioCard>          {/* main column */}
    <AioWhatNext>…</AioWhatNext>  {/* side column */}
    <>{cta}</>                    {/* the action rides with the side column */}
  </AioFlow>
</MigrationShell>
```

* `MigrationShell` writes the declaration onto `.amg` (`data-page-type`, `data-density`, `data-hero`, `data-grid`,
  `data-process`, `data-support`, `data-form`, `data-table`, `data-overlay`). `aio-migration-responsive.css` reads only
  those attributes.
* `AioMigrationHero` brings the art-directed plate (tablet / desktop) and keeps the text in the left safe zone.
* `AioFlow` sorts children into top (select steps), main and side.

## 3. The mobile authority comes first

The phone composition is drawn by the page's own authority (853×1536) and is pixel-locked. Tablet and desktop are
**derived by the system**, not drawn per page. If a page needs a tablet/desktop exception, change the family grammar
(this blueprint + the responsive CSS) so every page of that type benefits — never add a per-screen breakpoint.

## 4. Laws that do not bend

* All text UPPERCASE (password inputs excepted).
* PREBUILT is not ACTIVE; no layout may imply a client is active before activation.
* Client screens never show INTAKE, the staff dock, the staff sidebar or links into `/office`.
* No multiple equal gold buttons; one primary action per screen.
* No content invention: copy comes from the authority or from live data; column headers only name data already shown.
* No IFTA (or other workspace) content inside client migration.

## 5. Validate before merging

```bash
npm run migration:blueprint -- --check   # declaration map up to date
npm run migration:responsive-qa          # live browser: actor leaks, shell per viewport, conformance per screen
```

A new page must reach **RESPONSIVE_SYSTEM_CONFORMANCE ≥ 90** at TABLET and DESKTOP and pass every leak check, with no
horizontal scroll from 390 to 1920px. Descendant pages are scored for conformance to the system — never reported as a
pixel match to the root masters, whose content differs.

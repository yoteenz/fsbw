# AIO client migration — authority implementation recovery (RECOVERY1)

Sprint: `P0.AIO.CLIENT-MIGRATION.OPUS-AUTHORITY-IMPLEMENTATION-RECOVERY1`
Base: `master` @ `f8041c9a` · branch `opus/aio-client-migration-authority-recovery1`

The approved images in `AIO_CLIENT_MIGRATION_AUTHORITY/` are the design authority. Nothing in that directory was changed.
Functional code (routes, upload, batch/file lifecycle, review actions, lifecycle transitions, activation, Supabase paths) was kept; the look was rebuilt.

## Root cause of the rejected implementation

1. **The composite screenshot was the UI.** `MigrationAuthorityShell` painted `hero-root.jpg` / `hero-existing.jpg` (authority crops with the headline, copy and cards baked in) and stacked generic `.mig-card` panels under them.
2. **Parent geometry was a generic webpage.** A max-width card column with browser body margin (8px white frame), so the environment was a picture inside a page instead of the page.
3. **No authority unit system.** Sizes were rem/clamp guesses, so nothing could be compared to the authority pixel for pixel.
4. **Actor shells were shared.** Client activation reused the staff intake shell.

## Renderer (src/client-migration/visual/)

| Layer | Implementation |
| --- | --- |
| L0 environment | `AioMigrationEnvironment` — full-bleed clean plate per family (`env-root.jpg`, `env-existing.jpg`, `env-active.jpg`), text and UI removed from the photography |
| L1 brand/shell | `AioMigrationHeader` — frosted bar, family lockup crop, live viewer identity (staff on intake, client contact on activation) |
| L2 hero | `AioMigrationHero` — React type positioned in authority coordinates (`--k-* --t-* --a-* --s-*` per screen) |
| L3 modules | `AioMigrationPanel`, `AioSteps`, `AioMonogram`, `AioStatusPill`, `AioWhatNext` |
| L4 actions | `AioMigrationCTA` |
| L5 navigation | `AioStaffDock` — staff/founder intake only; never rendered for the client actor |

Unit system: `1u = 1px of the 853×1536 authority frame`. Phones use `--u = 100vw / 853`; at ≥854px `--u = 1px` and the column sits on the full-bleed environment. Resets are zero-specificity (`:where(.amg)`) so component classes always win.

Screens: `MigrationRootScreen`, `MigrationExistingScreens` (existing / extract / received), `ActivationScreens` (company / complete).

## Representatives — status at the canonical viewport (427×768 @2x = 854×1536)

| Pass | Authority | Route | Static-copy elements measured | Median Δ | Max position Δ |
| --- | --- | --- | --- | --- | --- |
| 01 ROOT | `00_ROOT/AIO-MIG-ROOT-001` | `/office/migration` | 14 | 1px | 3px |
| 02 EXISTING CLIENT | `01_EXISTING_CLIENT/AIO-MIG-EXISTING-SELECT-001` | `/office/migration/existing` | 13 | 1px | 4px |
| 03 EXTRACTING | `01_EXISTING_CLIENT/AIO-MIG-EXISTING-EXTRACT-001` | `/office/migration/extract?client=` | 16 | 1px | 3px |
| 04 FILES RECEIVED | `01_EXISTING_CLIENT/AIO-MIG-EXISTING-RECEIVED-001` | `/office/migration/received?client=` | 12 | 2px | 3px |
| 05 COMPANY REVIEW | `02_ACTIVATION/AIO-MIG-ACTIVATION-COMPANY-001` | `/portal/activation/review#company` | 16 | 1px | 4px |
| 06 ACTIVE ARRIVAL | `02_ACTIVATION/AIO-MIG-ACTIVATION-COMPLETE-002` | `/portal/activation/review#done` | 16 | 1px | 3px |

Captures: `docs/migration-recovery/live/`. Boards (authority | live | overlay): `docs/migration-recovery/boards/`.

## Live data instead of authority sample data

Names, USDOT/MC, monograms, viewer identity, file rows, counts, progress, start time and the company record come from the store. The authority's sample people (ALEX R., BROWN LOGISTICS LLC, 842 files) do not appear. Photos of people are not invented — the avatar is the viewer's initials.

Deliberate deviations where runtime truth differs from the authority:

- **Supported file types** come from `FILE_POLICY` (PDF, JPG, PNG, WEBP). The authority's Excel/CSV/Doc/Zip tiles would advertise uploads the vault rejects. On FILES RECEIVED those types render as UNSUPPORTED.
- **Company address** shows the Road Ready business address when one is on file, else the client's USDOT · MC.
- **Contact role** comes from the organization member record (e.g. Owner), else "Primary contact".

## Behavior changes (intentional, small)

- **EXTRACTING CTA**: reads VIEW IN BACKGROUND while extraction is running and returns to intake. Before, it advanced to match before extraction finished. Once every stage is complete it reads CONTINUE and advances as before.
- **FILES RECEIVED → BEGIN EXTRACTION**: files already stored on the batch are enough to begin. Before, the step re-ran the upload and threw "Add at least one PDF, JPG, PNG, or WEBP file" when no new files were pending (pre-existing on master; reproduced and fixed).
- **Existing client search** lists clients still to migrate first and searches every client record. The ACTIVE guard on CONTINUE is unchanged.

## Actor and lifecycle boundaries (verified in browser)

- Staff intake (root, existing, extract, received): intake dock present, INTAKE active.
- Client activation (company, people, done): no dock, no INTAKE / FILING / REPORTS.
- `#done` renders the arrival only when the lifecycle is ACTIVE (`canAccessClientOffice`). PREBUILT is stopped by the portal lifecycle guard; INVITED and CLIENT_CONFIRMATION_REQUIRED fall back to CONFIRM & ACTIVATE.
- The arrival shows no INTAKE, MIGRATION, PREBUILT, NOT ACTIVE YET, extraction or approval copy. Office rows link to `/portal/business|operations|money|vault|inbox`.

## Not yet done (founder gate first)

- The remaining authority screens still render their functional panels (`.amg-legacy`) inside the new environment and shell. Propagation starts after founder review of the six.
- Tablet/desktop are full-bleed (no white wrapper) but are the mobile composition on a wider environment, not yet a derived layout.

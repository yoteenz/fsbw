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

## Uppercase law (founder rule, overrides authority casing)

Every AIO page renders all text uppercase (`src/styles/aio-uppercase.css`, imported last, `!important`; tab titles via `src/utils/uppercaseDocumentTitle.ts`). Where the authority draws lowercase, these screens keep the authority composition and **fit** the uppercase copy. The generated "UPPERCASE FIT" block at the end of `aio-migration.css` sizes each block so it keeps its authority line count inside its panel. It was measured in the browser at 427×768 @2x by comparing each block in its original case against uppercase. Letter-case differences from the authority images are intentional; QA compares composition and fit.

## Icons — founder icon sheet

Every migration icon comes from the founder-supplied icon sheet (`docs/migration-recovery/icon-sheet/aio-icon-sheet-source.png`), traced to vector rather than cropped. The 79 sheet icons are segmented in sheet order and traced with potrace at 10× (per-icon ink normalisation keeps gray and coloured icons as clean as black ones). Derived glyphs: `arrow-right` (the up-arrow of `migrate`, rotated), and the `info-mark` / `help-mark` / `alert-mark` inner marks. Output is one cached sprite, `public/migration/icons/aio-icon-sheet.svg` (61 KB gzipped), with names in `src/client-migration/visual/aioIconSheet.ts`. Regenerate with `scripts/icon-sheet/`.

| UI spot | Sheet glyph |
| --- | --- |
| Dock HOME / INTAKE / FILING / REPORTS / MORE | home / inbox / folder / signal / menu |
| Header search / bell / account chevron | search / notification / dropdown |
| Status: accepted / partial / unsupported / NOT ACTIVE YET / ACTIVE | success / warning / failure / warning / success |
| File types (PDF / image / sheet, doc / archive) | pdf / image / text / folder (tinted by type) |
| Office: My Business / Operations / Finances / Vault / Inbox | profile / settings / signal / security / inbox |
| Arrows and chevrons | arrow-right (derived) / forward |

The sheet has no phone glyph: the phone in the company contact rows is the one icon still drawn in code. Provider logos (Samsara, Motive, …) are third-party brand marks and stay as images. Icon sizes were measured against the authority's ink boxes (dock labels stay on their calibrated line; glyphs scale with `transform`).

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

## Tablet and desktop (derived, not authority-drawn)

The authority frames are phone frames. Wider screens get a layout derived from them in `aio-migration.css`; the phone composition below 700px is unchanged (0% pixel difference).

- **≥ 700px (tablet):** header becomes a bar (logo left, actions right, centered 1240px column). The authority photograph becomes a full-width band holding the headline. Panels flow in one column, stretched to the column, at a desktop type scale (`--u` clamped 0.82–0.95px). Multi-up rows spread out: three path tiles, three providers, three extraction stats, three activation choices. Right-hand row content (status, counts, add buttons) stays anchored to the right edge. The existing-family dock is centered.
- **≥ 1120px (desktop):** EXISTING, FILES RECEIVED and COMPANY REVIEW go two-column (main 2fr, side 1fr); the flow card spans both. WELCOME TO YOUR OFFICE stays a focused single card (940px).
- **Verified:** no horizontal overflow at 700 / 768 / 900 / 1024 / 1119 / 1120 / 1280 / 1440 / 1920 on all ten migration screens; boundary checks 23/23.

## Propagation — every authority screen (after founder review of the six)

Every authority screen is built: 41 screens for the 42 images. The six representatives keep their pixel-locked renderers; the other 35 use a module renderer built on the same unit system. `AIO-MIG-ACTIVATION-COMPLETE-001` is the superseded draft of the arrival (it shows the staff dock on a client screen); `COMPLETE-002` is the one rendered. No legacy panels (`.amg-legacy`, `.mig-card`) remain on any migration route.

| Layer | Implementation |
| --- | --- |
| Modules | `AioMigrationModules.tsx`: flow container, cards, client header, row lists, chips, discs, stat tiles, fields, drop zone (drops whole folders), notes, strips, callouts, choice buttons, confidence |
| Styles | `aio-migration-flow.css`: module geometry in authority units, per-screen values, tablet/desktop layer, generated uppercase fit |
| Headlines | `migrationHero.ts`: authority copy (line breaks as drawn) and metrics measured on each PNG (cap top, size from cap height, pitch) |
| Data | `migrationData.ts`: live derivations (people, fleet, documents, lifecycle events, batch buckets, extracted-fact confidence) |
| Screens | `MigrationIntakeScreens.tsx` (existing branch), `MigrationNewScreens.tsx`, `MigrationBatchScreens.tsx`, `ActivationReviewScreens.tsx` |
| Glyphs | Founder icon sheet first. Drawn in the sheet's outline weight only where the sheet has no subject: company building, people, truck, link, envelope, map pin, history, person plus/minus, thumbs up, send, tag, ID card, folder upload, shield check, phone |

| Branch | Screens (route `/office/migration/:screen` unless noted) |
| --- | --- |
| Existing client | upload · match · review · conflicts · approval · prebuilt · invite · invited |
| Client activation (`/portal/activation/review#…`, client actor, no dock) | welcome · people · vehicles · services · documents · changed · confirm |
| New client | new · new-received · new-extract · new-identity · new-records · new-review · new-approval · new-prebuilt · new-invite · new-confirm |
| Bulk batch | batch · batch-received · batch-processing · batch-summary · batch-conflicts · batch-queue · batch-client · batch-approval · batch-run · batch-complete |

Fidelity: captured at 427×768 @2x and compared with each authority (side-by-side and overlay boards). Composition, module order, geometry and type follow the authority; content follows the record, so list lengths and wraps differ where the live data differs. The uppercase fit was regenerated for these screens (each block keeps its authority-casing line count and width).

### Live data and deliberate deviations (propagated screens)

- No sample people, vehicles, documents, percentages or IDs from the authority. People are initials (no photos); extraction confidence is the level recorded on the facts (HIGH / MEDIUM / LOW / CONFLICT), never an invented percentage; empty sections say so.
- Supported types come from `FILE_POLICY` (no CSV), as on the representatives.
- Invite expiry reads 3 days, the real 72-hour link lifetime (the authority draws 7 and 14 days).
- FOUNDER REVIEW and ITEMS NEEDING REVIEW show step 2 (REVIEW DATA) as current; the authority REVIEW image highlights only step 1.
- Client activation: each person, vehicle, service and document can be answered on its own; the section response the activation service records is the roll-up (any NEEDS AN UPDATE, else any I'M NOT SURE, else LOOKS RIGHT once every item is answered). A section with nothing on file asks "Is that right?" so activation can still complete. CONFIRM AND ACTIVATE names the sections still to review instead of "Activation conditions not met".
- Client DOCUMENTS lists customer-visible vault records only; internal staff scans never reach the client.
- NEW · SEND INVITE takes the destination email (new files have no email until then) and keeps the link on screen with a copy button if email delivery fails.
- NEW CLIENT FILE stores USDOT and MC on the Road Ready profile; BUSINESS IDENTITY REVIEW adds the EIN (`BusinessProfile.ein`).
- BULK · PROCESS APPROVED CLIENTS now runs approval for matched clients without open conflicts (PREBUILT, never ACTIVE). Before, the button only advanced the screen.
- ITEMS NEEDING REVIEW writes the decisions on SAVE DECISIONS (KEEP AIO → reject, USE EXTRACTED → confirm, NEEDS CLIENT CONFIRMATION); DUPLICATES AND CONFLICTS writes Merge / Keep Separate (Review Later leaves the item open).

### Tablet and desktop (propagated screens)

≥ 700px: one stack in authority order at the desktop type scale, as on the representatives. ≥ 1120px: the step card spans the top, cards form a 2fr main column and the closing items (what happens next, notes, the action) a sticky 1fr side column; screens with nothing for the side keep a 1000px measure.

### Review gallery

`npm run migration:gallery` captures all 41 built screens with demo data and writes `.migration-mocks/aio-migration-gallery.html`: each screen renders live at phone, tablet or desktop width next to its authority image. Link: `docs/migration-recovery/MOCKS.md`.

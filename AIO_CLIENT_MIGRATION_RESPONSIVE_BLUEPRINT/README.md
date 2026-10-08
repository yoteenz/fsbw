# AIO client migration — responsive blueprint

**DO NOT SCALE. REFLOW. One responsive system, many page expressions.**

The family blueprint every client-migration page inherits at MOBILE (< 700px, the locked phone authorities), TABLET
(700–1023px, master `masters/AIO-MIG-ROOT-TABLET-834x1194.png`) and DESKTOP (≥ 1024px, master
`masters/AIO-MIG-ROOT-DESKTOP-1440x900.png`). The phone authorities live in `../AIO_CLIENT_MIGRATION_AUTHORITY/` and were not
modified.

| File | What it fixes |
| --- | --- |
| `responsive-blueprint.json` | index, primitives, MOBILE→TABLET→DESKTOP transformations for every region |
| `page-type-taxonomy.json` | 12 page types and 4 density classes |
| `screen-responsive-map.json` | all 41 screens: declaration, forensic audit, conformance (declarations generated from code) |
| `responsive-tokens.json` | breakpoints, spacing tokens, content widths, typography roles, CTA rules |
| `hero-rules.json` | FULL / COMPACT / NONE, safe zones, plates, focal points |
| `grid-rules.json` | PATHS_3UP, MAIN_SIDE, CANVAS_PANEL, SINGLE, CENTERED; process / support / form modes |
| `nav-rules.json` | AIO OFFICE (staff) and CLIENT OFFICE (client) shells |
| `overlay-rules.json` | sheet → edge sheet → modal / inspector |
| `table-list-rules.json` | TABLE vs ROWS |
| `future-page-contract.md` | how a new page inherits the system |
| `COMPOSER_PROPAGATION_MANIFEST.md` | remaining repetitive work, scoped for Composer |
| `validation/responsive-qa.json` | live-browser QA (root composition, conformance, leak checks) |
| `proof/` | proof set A–G at mobile / tablet / desktop |

Code: `all-in-one-enterprises/src/client-migration/visual/migrationResponsive.ts` (declarations),
`AioMigrationKit.tsx` (`MigrationShell`), `aio-migration-responsive.css` (the system).

```bash
cd all-in-one-enterprises
npm run migration:blueprint            # refresh screen-responsive-map.json from the declarations (--check to verify)
npm run migration:responsive-qa        # live QA against a running dev server (MIG_MOCK_BASE)
```

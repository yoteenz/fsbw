# Frontal Slayer — Owner's Manual (Workspace)

Frontal Slayer is the **first Workspace** on studio os. This document contains Workspace-specific knowledge. Platform architecture lives in `docs/studio-os/`.

## Workspace Identity

| Field | Value |
|-------|-------|
| Workspace ID | `frontal-slayer` |
| Brand Name | FRONTAL SLAYER |
| Entry | `/admin/studio/executive-command-center` |
| Config | `src/workspaces/frontal-slayer/config.ts` |

## Brand Rules

- White marble · glass acrylic · cherry red (`#EB1C24`) accent
- Futura PT labels · Covered By Your Grace accent numbers
- PSA: trusted founder presence — never robotic
- Real catalog units only in product references (NOIR, BLANCO, SOFT WAVE, etc.)

## Studio Entry

1. Admin Dashboard → **STUDIO** → studio os workspace picker
2. Select **FRONTAL SLAYER**
3. Executive Command Center loads — same experience as before the platform refactor

## Data Location

All Frontal Slayer demo seeds remain in `src/utils/adminStudio*Demo.ts` and are bridged through `src/workspaces/frontal-slayer/dataAdapter.ts`.

## Related Docs

- [Brand Rules](./BRAND_RULES.md)
- [Shows & Studios](./SHOWS_AND_STUDIOS.md)
- [Content Packs](./CONTENT_PACKS.md)

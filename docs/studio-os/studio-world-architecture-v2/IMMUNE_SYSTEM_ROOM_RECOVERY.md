# Immune System — Room Recovery™

**Version:** `immune-room-recovery.v1`

## Principle

Each subsystem owns itself. Repair **only** the failing subsystem.

## Forbidden cascades

- Rebuild room because desk failed
- Rebuild architecture because chair failed
- Regenerate entire scene because landmark failed

## Localized actions

| Subsystem | Failure | Action |
|-----------|---------|--------|
| Architecture | critical | Repair BlueprintShell only — room offline |
| Hero assets | critical | Regenerate subsystem — room stays online |
| Furniture | critical | Load fallback furniture |
| Decor | critical | Remove decor |
| Lighting | critical | Rebake lighting only |
| Materials | critical | Regenerate with library materials |

## Example: Reception

Architecture ✓ · Lighting ✓ · Landmark ✗ · Desk ✓ · Furniture ✓ · Decor ✓

→ Only landmark regenerates. Reception remains operational.

## Module

`src/studio-os-core/studio-world-architecture-v2/immune-room-recovery.ts`

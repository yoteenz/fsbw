# Asset Socket System

**Version:** `asset-socket-system.v1`

Blueprint defines sockets. AI never guesses placement.

## Reception example sockets

| Socket ID | Role | Required |
|-----------|------|----------|
| `ReceptionDeskSocket` | hero | yes |
| `LandmarkSocket` | hero | no |
| `LeftSeatingSocket` | furniture | no |
| `RightSeatingSocket` | furniture | no |
| `CoffeeTableSocket` | furniture | no |
| `MonitorSocket` | decor | no |
| `ReceptionLightingSocket` | lighting | yes |
| `DecorationSocket` | decor | no |
| `NavigationAnchorSocket` | interaction | yes |

## Rules

1. Every asset references exactly one `socketId`
2. Asset class must be in socket `compatibleAssetClasses`
3. Required sockets must have assigned assets before compile
4. Bounds are percentage-based placement regions

## API

```typescript
defineAssetSockets(specs);
assertAssetInSocket({ assetClass, socketId, sockets });
assertAllRequiredSocketsFilled({ sockets, assignedSocketIds });
```

## Worker instruction format

> Build Asset #27 according to Blueprint Revision 14 using Socket `ReceptionDeskSocket`.

Not: "Create me a lobby."

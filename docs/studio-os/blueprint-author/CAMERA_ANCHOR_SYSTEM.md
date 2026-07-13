# Camera Anchor System

**Version:** `camera-anchor-system.v1`

Blueprint owns camera anchors. Models never invent perspective.

## Standard purposes

- `arrival` — Lobby arrival
- `overview` — Room overview
- `hero` — Hero asset focus
- `walkthrough` — Walk path
- `inspection` — Detail inspection
- `photo` — Marketing photo

## Reception anchors

| Anchor ID | Purpose |
|-----------|---------|
| `LobbyArrival` | arrival |
| `DeskInspection` | inspection |
| `Overview` | overview |
| `WalkPath` | walkthrough |
| `Entry` | photo |

## API

```typescript
defineCameraAnchors(anchors);
resolveCameraAnchor(anchors, anchorId);
selectRenderCamera({ anchors, purpose });
```

All renders use Blueprint anchors. Workers receive `cameraAnchorId` — not free-form camera prompts.

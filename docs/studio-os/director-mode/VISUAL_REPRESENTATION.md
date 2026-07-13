# Visual Representation (Visual Blueprints)

Director Mode inherits Blueprint Author. Blueprints are **not** CAD drawings. They are **immersive visual construction previews**.

## What a visual blueprint contains

| Layer | Content |
|-------|---------|
| Finished appearance | Procedural preview of intended result |
| Construction overlays | Layer toggles (architecture, sockets, health, …) |
| Object boundaries | Per-object selectable regions |
| Sockets | Placement anchors with occupancy status |
| Camera anchors | Framing positions with preview |
| Materials | Library references (Founder Marble, etc.) |
| Lighting | Lighting volumes and profiles |
| Dependency graph | Build-order edges |
| Workers | Assigned factory workers per job |
| Cost estimate | AI cost units, tokens, GPU |
| Duration estimate | Expected manufacturing time |
| Confidence score | System confidence in plan completeness |

## Shipped foundation (Documented Fact)

Construction Mode implements procedural clay preview:

- White architecture shell
- Gray placeholder assets
- Blue sockets
- Navigation graph, camera markers, lighting volumes

See `docs/studio-os/construction-mode/WORLD_PREVIEW.md`.

## Future (Planned)

- Photorealistic blueprint preview (post-approval reference only — not pre-manufacturing AI generation)
- Brand/campaign visual blueprints in respective Director Studios
- Immersive walkthrough (founder camera in Construction Mode)

## Approval rule

Founders approve visual blueprints **before** AI begins manufacturing. This is non-negotiable under Director Constitution Article II.

## Cross-references

- Construction Plan Dashboard: `docs/studio-os/construction-mode/CONSTRUCTION_MODE.md`
- Founder Preview: `docs/studio-os/manufacturing-engine/FOUNDER_PREVIEW.md`
- Camera Anchor System: `docs/studio-os/blueprint-author/CAMERA_ANCHOR_SYSTEM.md`

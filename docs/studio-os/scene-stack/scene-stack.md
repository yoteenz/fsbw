# Scene Stack™ — Master Specification

**Golden Build™ Layered Environments**

---

## Foundational Law

```
NEVER: One FAL call → complete scene image
ALWAYS: N layer passes → composed environment
```

A department station is the **composition of all approved layers** — not a single render.

---

## Composition Model

```
Station™
├── Layer 01 Environment Shell™      (z:1)
├── Layer 02 Signature Landmark™   (z:2)
├── Layer 03 Furniture & Objects™    (z:3)
├── Layer 04 Lighting Systems™       (z:4 · blend)
├── Layer 05 Atmospheric Systems™  (z:5 · blend)
├── Layer 06 Surface Materials™    (z:6 · blend)
├── Layer 07 Ambient Motion™       (z:7 · blend)
├── Layer 08 Interaction Layer™    (Cursor · z:interaction)
├── Layer 09 Runtime Effects™      (Cursor · z:effects)
└── Layer 10 Founder Personalization™ (z:8 · blend)
```

Final pixels = stacked FAL plates + Cursor interaction/runtime overlays.

---

## Layer Independence

| Capability | Per layer |
|------------|-----------|
| Generate | ✅ |
| Approve | ✅ |
| Regenerate | ✅ (increments version) |
| Version history | ✅ |
| Replace | ✅ (swap layer without touching others) |

**Example:** Regenerate `lighting-systems` v3 — `environment-shell` v1 and `signature-landmark` v2 unchanged.

---

## Prompt Isolation

Each FAL prompt includes a **layer pass declaration**:

> *LAYER PASS 04 LIGHTING SYSTEMS ONLY — light pools accents tracks. NO architecture rebuild NO furniture NO UI.*

Prevents monolithic scene generation.

---

## Required Layers (minimum viable station)

1. Environment Shell™
2. Signature Landmark™
3. Lighting Systems™

Station status `ready` when all generatable layers for that station are approved.

---

## Storage

- `studioOsSceneStack_v1` — per layer version records
- Asset registry — `scene-stack-{station}-{layer}-v{N}`

---

## API

Reuses `POST /api/admin/studio-builder-generate` with:

`productionGroupId: scene-stack-{stationId}-{layerId}`

---

## Cursor Boundary

Cursor **must not**:

- Draw architecture with HTML/CSS gradients/borders
- Fake landmarks with CSS shapes
- Replace FAL layers with decorative panels

Cursor **must**:

- Composite approved layer URLs
- Place interaction hotspots
- Handle camera · nav · Orb · state · runtime effects

See [cursor-boundary.md](./cursor-boundary.md).

---

## See Also

- [layer-architecture.md](./layer-architecture.md)
- [golden-build-pipeline.md](./golden-build-pipeline.md)
- [../architectural-icons/department-landmarks.md](../architectural-icons/department-landmarks.md)

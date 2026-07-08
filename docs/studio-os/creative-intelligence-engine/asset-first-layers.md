# Asset-First Layers™

**Module:** `studio.creative-intelligence-engine.v1.asset-first`  
**Status:** Independent layers · reusable across Studio World™

---

## Principle

> Every generated environment should be **layered**. Every layer exists independently so it can be **reused across Studio World™**.

---

## Layer Inventory

| Layer | Generatable | Reusable across |
|-------|-------------|-----------------|
| **Environment Shell™** | FAL | Departments · scenes |
| **Lighting™** | FAL | All scenes |
| **Materials™** | FAL | All scenes |
| **Architecture™** | FAL | Departments · blueprints |
| **Furniture™** | FAL | Stations · scenes |
| **Atmosphere™** | FAL | Scenes · sets |
| **Hero Objects™** | FAL | Landmarks · stations |
| **Interactive Objects™** | Cursor | Workstations |
| **Particles™** | FAL / runtime | Atmosphere pass |
| **Audio™** | Asset pipeline | Departments |
| **Animations™** | Cursor / FAL | Ambient motion |
| **Runtime FX™** | Cursor | State · vignette |

---

## Independence Rules

| Rule | Law |
|------|-----|
| **Separate generation jobs** | One layer = one Generation Manager™ job |
| **Separate approval** | Per-layer Approval Queue™ |
| **Separate registry entries** | Asset ID per layer version |
| **Separate regeneration** | Touch one layer without cascade |
| **Cross-scene reuse** | Registry search before generate |

---

## Reuse Across Studio World™

```
Editorial Luxury Lighting System™ (layer asset)
    ├── CDS Story Table™
    ├── CDS Mood Wall™
    ├── Finance Capital Vault™
    └── Marketplace licensed HQ
```

[Asset Intelligence Engine™](../asset-intelligence-engine/README.md) enforces search-first.

[Creative Equity™](../creative-equity/README.md) tracks lifetime value of reused layers.

---

## Scene Stack™ Alignment

Creative Intelligence Engine™ asset-first model **extends** [Scene Stack™ 10-layer model](../scene-stack/layer-architecture.md):

| Asset-First (engine) | Scene Stack™ ID |
|----------------------|-----------------|
| Architecture™ | environment-shell |
| Hero Objects™ | signature-landmark + furniture |
| Particles™ | atmospheric (sub-pass) |
| Audio™ | parallel audio manifest |
| Animations™ | ambient-motion |

---

## Cursor Boundary

Layers 08–09 in Scene Stack™ remain **Cursor-only**:

- Interaction Layer™ — hotspots · forms on objects
- Runtime Effects™ — state transitions

**Never** generate faux architecture in HTML/CSS to substitute FAL layers.

See [cursor-boundary.md](../scene-stack/cursor-boundary.md).

---

## Package Export

Approved layer assets export in **Department Package™**:

```yaml
DepartmentPackage:
  scenes:
    - sceneId: story-table
      layers: [registry asset refs]
  reusableSystems: [lighting-system-id, material-system-id]
```

Future departments **inherit** systems — not regenerate.

---

_Asset-First Layers™ — generate once, compose everywhere._

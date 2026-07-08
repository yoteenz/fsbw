# Environment Blueprint — Creative Direction Studio™

**Schema ID:** `studio.department-generator.v1.environment-blueprint`  
**Department ID:** `creative-direction`  
**Package ID:** `pkg-creative-direction-golden-v1`  
**Layout Template:** Stage  
**Room DNA:** [room-dna.json](./room-dna.json)

---

## Design Intent

Double-height editorial atelier — part luxury architecture studio, part Hollywood creative headquarters, part Apple Industrial Design Lab. The founder walks into the most expensive creative space they have ever occupied.

**No flattened background.** Modular environment tasks compile to discrete assets.

---

## Spatial Envelope

| Property | Value |
|----------|-------|
| Width | 18.0 m |
| Depth | 12.0 m |
| Footprint | ~120 m² |
| Aspect ratio | 3:2 |
| Hero ceiling | 6.5 m equivalent (double-volume) |
| Work ceiling | 3.2 m equivalent |
| Columns | 2 slender supports at 35% depth |
| Exterior | Floor-to-ceiling glass right flank (8 m span) |

---

## Zone Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CEILING — SKY LIGHT COFFER                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │              LIVING MOOD WALL™ (hero · full width)                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  BRIEF WALL™     TIMELINE TABLE™      LIBRARY™           GLASS WALL     │
│  (left)          (center stage)       (right flank)      (exterior)     │
│                    SANDBOX™ (behind timeline)                            │
│                         ORB COMMAND CENTER™                              │
│  GENOME OBSERVATORY™ (left alcove)                                       │
│  [ENTRY PORTAL]                                        [EXIT PORTAL]     │
│══════════════════════════════════════════════════════════════════════════│
│                    STONE / WOOD FLOOR — reflection depth                 │
└─────────────────────────────────────────────────────────────────────────┘
```

| Zone ID | Normalized Position | SDK Type | Hero |
|---------|---------------------|----------|------|
| `arrival-threshold` | Z = -0.9, center-left | entry | — |
| `brief-wall` | X = -0.85, left wall | secondary | — |
| `mood-wall` | Z = 0.95, full width, elevated | hero | ✓ |
| `observatory` | X = -0.55, Z = 0.2, alcove | secondary | — |
| `timeline-table` | X = 0, Z = 0.35, center | primary | — |
| `sandbox` | X = 0.2, Z = 0.15, behind table | secondary | — |
| `reference-library` | X = 0.75, Z = 0.25 | secondary | — |
| `orb-command` | X = 0.35, Y = 0.55, Z = 0.4 | orb | — |
| `departure-threshold` | Z = -0.9, center-right | exit | — |

---

## Environment Tasks

| Task ID | Category | Prompt Ref | Stage | Output Asset |
|---------|----------|------------|-------|--------------|
| `env-architecture` | architecture | `fal-prompt-package/architecture.md` | 1 | `env-shell-cds` |
| `env-walls` | walls | `fal-prompt-package/architecture.md#walls` | 1 | `env-shell-cds` (interior) |
| `env-floor` | floor | `fal-prompt-package/environment.md#floor` | 2 | `env-floor-cds` |
| `env-ceiling` | ceiling | `fal-prompt-package/architecture.md#ceiling` | 2 | `env-ceiling-cds` |
| `env-windows` | windows | `fal-prompt-package/architecture.md#windows` | 3 | `env-window-cds` |
| `env-alcove` | architecture | `fal-prompt-package/architecture.md#alcove` | 2 | `env-alcove-cds` |
| `env-glass` | glass | `fal-prompt-package/materials.md#glass` | 3 | `glass-panels-cds` |
| `env-lighting` | lighting | `fal-prompt-package/lighting.md` | 4 | `lighting-rig-cds` |
| `env-atmosphere` | ambient | `fal-prompt-package/vfx.md` | 6 | `particles-ambient-cds` |
| `env-furniture-layout` | layout | `fal-prompt-package/furniture.md#layout` | 5 | layout rules |
| `env-navigation` | navigation | `fal-prompt-package/architecture.md#navigation` | 7 | `camera-paths-cds` |
| `env-camera` | camera | `fal-prompt-package/camera.md` | 7 | `camera-paths-cds` |
| `env-composition` | composition | `fal-prompt-package/environment.md#composition` | 7 | metadata |

---

## Lighting Rig

### Three-Point Editorial

| Anchor | Position | Character |
|--------|----------|-----------|
| Hero Key | Above Mood Wall, 15° off-center | Soft wash — imagery is star |
| Work Key | Above Timeline Table | Crisp warm — review clarity |
| Ambient Fill | Ceiling sky panel + window fill | Room never dark |

### Accent Lighting

| Feature | Light |
|---------|-------|
| Orb Pedestal | Uplight + Genome glow ring |
| Brief Wall | Pin spots on active sections |
| Observatory | Internal glow — living data |
| Sandbox | Dimmable — brightens on branch |
| Approval ceremony | Ceiling grid accent |

**Genome slot:** `lightingStyle`

---

## Materials (Genome-Injected)

| Surface | Material Family | Genome Slot |
|---------|----------------|-------------|
| Floor | Polished stone or wide-plank wood | materialLanguage |
| Hero wall backing | Gallery plaster or dark walnut | materialLanguage |
| Timeline Table | 40mm glass on brushed metal | glass + metal |
| Brief Wall | Matte plaster + brass pin rails | materialLanguage |
| Library shelves | Walnut or steel open shelving | materialLanguage |
| Sandbox | Matte white Corian-equivalent | materialLanguage |
| Ceiling | Diffused luminous coffer | lightingStyle |
| Window frames | Slim steel or brass | materialLanguage |

---

## Windows & Exterior

Right flank: floor-to-ceiling glass. Exterior is **atmospheric plate** — parallax 0.3×, Genome-driven still with breathe.

| Genome Context | Exterior View |
|----------------|---------------|
| Urban luxury | Soft-focus city skyline at dusk |
| Editorial | Abstract horizon |
| Beauty mansion | Garden terrace greenery |
| Finance | Minimal sky — cloud movement |
| Law | Library courtyard or abstract stone |

---

## Navigation Graph

```yaml
entry: arrival-threshold
paths:
  - from: arrival-threshold
    to: mood-wall
    ceremony: creative-direction-arrival
    durationMs: 5000
  - from: mood-wall
    to: timeline-table
    type: walk
  - from: timeline-table
    to: sandbox
    type: walk
  - from: orb-command
    to: "*"
    type: route
exit: departure-threshold
```

---

## Dependency Graph

```
env-architecture (shell)
├── env-floor
├── env-ceiling
├── env-alcove
├── env-windows
│   └── exterior plate
├── env-glass
├── env-lighting
├── env-furniture-layout
├── zone assets (see asset-manifest.json)
├── env-atmosphere
└── env-navigation + env-camera
```

---

## Anti-Patterns

| Forbidden | Canonical |
|-----------|-----------|
| Single `background.png` | Discrete environment tasks |
| Baked brand colors | Genome shader slots |
| White void | Floor · walls · ceiling required |
| UI chrome in environment | Physical room only |

**Prompt source:** [fal-prompt-package/](./fal-prompt-package/)

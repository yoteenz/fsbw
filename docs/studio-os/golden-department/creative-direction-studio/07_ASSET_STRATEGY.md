# 07 — Asset Strategy

**Golden Department:** Creative Direction Studio™  
**Section:** Modular Asset Package — Studio Asset Compiler™ Contract

---

## Design Principle

> Do **not** design one flattened screen. Define **modular assets** — each independently replaceable and regeneratable through Studio Asset Compiler™.

Every asset is a **first-class package member** with metadata, Genome slots, and Runtime bindings.

---

## Package Identity

| Field | Value |
|-------|-------|
| Package ID | `pkg-creative-direction-golden-v1` |
| Department ID | `creative-direction` |
| Schema | `studio.department-package.v1` |
| Layout Template | Stage |
| Asset Budget | 45 assets (max) |
| Size Budget | 120 MB (compressed) |

---

## Asset Inventory

### Environment Assets

| Asset ID | Class | Purpose | Regeneratable |
|----------|-------|---------|---------------|
| `env-shell-cds` | environment | Room envelope — walls, floor, ceiling | ✓ |
| `env-floor-cds` | material | Floor surface shader + reflection | ✓ |
| `env-ceiling-cds` | lighting | Sky coffer + accent track | ✓ |
| `env-window-cds` | environment | Glass wall + exterior plate | ✓ |
| `env-alcove-cds` | environment | Observatory alcove geometry | ✓ |

### Zone Assets

| Asset ID | Class | Zone | Purpose |
|----------|-------|------|---------|
| `wall-mood-cds` | mood-wall | Living Mood Wall™ | Infinite inspiration surface |
| `wall-brief-cds` | interactive-wall | Creative Brief Wall™ | Pin rails + sections |
| `table-timeline-cds` | timeline-table | Project Timeline Table™ | Glass command surface |
| `table-sandbox-cds` | glass-table | Creative Sandbox™ | Experimentation surface |
| `shelf-library-cds` | asset-shelf | Reference Library™ | Categorized archive |
| `observatory-cds` | interactive-object | Genome Observatory™ | Dome + visualization |
| `pedestal-orb-cds` | orb-pedestal | Orb Command Center™ | Intelligence anchor |
| `screen-compare-cds` | preview-screen | Sandbox | Twin comparison panels |

### Intelligence Assets

| Asset ID | Class | Purpose |
|----------|-------|---------|
| `orb-cds` | orb | Studio Orb mesh + glow + audio |
| `ai-creative-director-cds` | ai-triggers | Creative Director ambient behaviors |
| `ai-research-concierge-cds` | ai-triggers | Reference tagging + search |
| `ai-brand-concierge-cds` | ai-triggers | Genome alignment guard |

### Atmosphere Assets

| Asset ID | Class | Purpose |
|----------|-------|---------|
| `lighting-rig-cds` | lighting | Three-point editorial rig |
| `particles-ambient-cds` | particles | Hero dust / editorial minimal |
| `audio-ambient-cds` | audio | Room tone stem |
| `audio-ceremony-cds` | audio | Approval stamp sound |
| `audio-orb-cds` | audio | Orb pulse + voice bed |

### Navigation Assets

| Asset ID | Class | Purpose |
|----------|-------|---------|
| `camera-paths-cds` | camera | arrival · hero · primary · orb · ceremony · departure |
| `portal-entry-cds` | portal | Entry Portal |
| `portal-exit-cds` | portal | Exit Portal |

### Interaction Assets

| Asset ID | Class | Purpose |
|----------|-------|---------|
| `interactions-cds` | interactions | Verb bindings per zone |
| `ceremony-approval-cds` | ceremony | Creative Direction Approval |
| `glass-panels-cds` | floating-panel | Inspect overlays |

### Content Seed Assets (Optional)

| Asset ID | Class | Purpose |
|----------|-------|---------|
| `seed-mood-cds` | content-seed | Genome-default Mood Wall pins |
| `seed-brief-cds` | content-seed | Project brief template pins |
| `seed-library-cds` | content-seed | Starter reference shelf |

---

## Asset Dependency Graph

```
env-shell-cds
├── env-floor-cds
├── env-ceiling-cds
├── env-window-cds
├── env-alcove-cds
├── wall-mood-cds
├── wall-brief-cds
├── table-timeline-cds
├── table-sandbox-cds
├── shelf-library-cds
├── observatory-cds
├── pedestal-orb-cds
│   └── orb-cds
├── screen-compare-cds
├── lighting-rig-cds
├── particles-ambient-cds
├── portal-entry-cds
├── portal-exit-cds
├── interactions-cds
├── ceremony-approval-cds
├── camera-paths-cds
├── audio-ambient-cds
├── audio-ceremony-cds
├── audio-orb-cds
├── ai-creative-director-cds
├── ai-research-concierge-cds
└── ai-brand-concierge-cds
```

---

## Genome Slots Per Asset

| Asset | Genome Fields Bound |
|-------|---------------------|
| `env-shell-cds` | materialLanguage, editorialDirection |
| `env-floor-cds` | materialLanguage |
| `env-window-cds` | visualReferences, lightingStyle |
| `wall-mood-cds` | photographyDirection, customerEmotions |
| `wall-brief-cds` | editorialDirection, voice |
| `observatory-cds` | brandDNA, values, experienceDNA |
| `lighting-rig-cds` | lightingStyle |
| `particles-ambient-cds` | experienceDNA |
| `audio-ambient-cds` | customerEmotions |
| `orb-cds` | voice |

---

## Regeneration Rules

| Trigger | Assets Regenerated |
|---------|-------------------|
| Genome material change | env-*, furniture, floor |
| Genome lighting change | lighting-rig, particles, window |
| Industry switch | Full package (ordered stages) |
| Single object damage | That asset only |
| Marketplace variant install | Override asset by ID — merge manifest |

**Studio Asset Compiler™** stage order: environment → furniture → lighting → atmosphere → intelligence → interactions → audio → camera.

---

## Export Manifest

```yaml
package:
  id: pkg-creative-direction-golden-v1
  departmentId: creative-direction
  version: 1.0.0
  goldenDepartment: true
  assets:
    - id: env-shell-cds
      path: environment/shell.glb
      genomeSlots: [materialLanguage]
    - id: wall-mood-cds
      path: zones/mood-wall.glb
      genomeSlots: [photographyDirection, customerEmotions]
    # ... full manifest in compiler export
  ceremonies:
    - creative-approval
  permissions:
    - creative-direction.approve
    - creative-direction.branch
```

---

## Marketplace Compatibility

| Property | Specification |
|----------|---------------|
| Asset swap | Any asset ID replaceable via marketplace overlay |
| Partial install | Zone pack (e.g., mood-wall variant) supported |
| Version pin | Package version semver — runtime checks compatibility |
| Golden flag | `goldenDepartment: true` — inheritance reference |

See [12 — Marketplace & Inheritance](./12_MARKETPLACE_AND_INHERITANCE.md).

---

## Anti-Patterns

| Forbidden | Correct |
|-----------|---------|
| Single flattened PNG room | Modular GLB + shader slots |
| Baked brand colors in textures | Genome shader parameters |
| Monolithic scene file | Asset graph with dependencies |
| UI screenshot as environment | Generated spatial assets |

---

_Next: [08 — Interaction Map](./08_INTERACTION_MAP.md)_

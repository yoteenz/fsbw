# Asset Categories — Everything Is Reusable

**Module:** `studio.asset-intelligence.v1.categories`  
**Status:** Canonical reuse taxonomy

---

## Principle

> Everything is reusable.

No asset type is "generate-only." If Studio OS created it once and approved it, it belongs in a searchable category.

---

## Canonical Categories

| Category | Examples | Typical Reuse |
|----------|----------|---------------|
| **Environment Shell™** | Walls · ceiling · floor · proportions | Cross-station · cross-department adapt |
| **Landmarks™** | Story Table™ · Capital Vault™ · Genome wall | Department-specific · high reuse within archetype |
| **Lighting™** | Editorial rigs · pools · practicals | **Highest cross-department reuse** |
| **Furniture™** | Desks · tables · seating · shelving | Duplicate + modify finish |
| **Decor™** | Art · objects · vignettes | Remix · adapt |
| **Atmosphere™** | Haze · depth · volumetric passes | Layer reuse in Scene Stack™ |
| **Materials™** | Surface treatments · PBR profiles | **Company DNA™ anchor** |
| **Glass™** | Panels · partitions · display cases | Exact reuse common |
| **Stone™** | Marble · slate · terrazzo floors | Exact reuse · DNA critical |
| **Metal™** | Bronze · brass · brushed steel trims | Palette consistency |
| **Plants™** | Living greenery · sculptural botanicals | Adapt scale |
| **Particles™** | Dust · embers · ambient specks | Layer 07 Ambient Motion™ |
| **Screens™** | Holographic · LED · display surfaces | Modify content only |
| **Transitions™** | Doorways · portals · scene bridges | Platform reuse |
| **Audio™** | Ambient beds · UI sounds | Exact reuse |
| **Animations™** | Idle loops · ambient motion clips | Runtime attach |
| **Runtime FX™** | Vignette · state glow · interaction feedback | Cursor layer · cross-dept |

---

## Scene Stack™ Layer Mapping

| Scene Stack Layer | Primary Categories |
|-------------------|-------------------|
| 01 Environment Shell™ | Environment Shell™ · Stone™ · Metal™ |
| 02 Signature Landmark™ | Landmarks™ · Furniture™ |
| 03 Furniture & Physical Objects™ | Furniture™ · Decor™ · Plants™ |
| 04 Lighting Systems™ | Lighting™ |
| 05 Atmospheric Systems™ | Atmosphere™ · Particles™ |
| 06 Surface Materials & Detail™ | Materials™ · Glass™ · Stone™ · Metal™ |
| 07 Ambient Motion™ | Animations™ · Particles™ |
| 08 Interaction Layer™ | Screens™ · Runtime FX™ (Cursor) |
| 09 Runtime Effects™ | Runtime FX™ · Animations™ (Cursor) |
| 10 Founder Personalization™ | Materials™ · Decor™ (genome-adapted) |

Intelligence searches **by layer category first** when request originates from Scene Stack™.

---

## Reuse Category (Compiler Alignment)

Each item also carries `reuseCategory` for batch compile matching:

```
lighting-editorial-volumetric
furniture-shelving-floating
material-marble-dark-executive
environment-shell-atelier-bronze
```

Aligns with [category-system.md](../engines/studio-asset-registry/category-system.md).

---

## Cross-Category Reuse

Intelligence may recommend **cross-category** reuse when visual role aligns:

| Request | Registry Match | Action |
|---------|----------------|--------|
| Bronze trim for Finance desk | Metal™ asset from CDS | Duplicate & Modify scale |
| Editorial wall lighting | Lighting™ from Mood Wall™ | Reuse Existing™ |
| Dark floor for new department | Stone™ from Capital Vault™ | Reuse Existing™ |

---

## Pack Categories (Marketplace)

Marketplace Packs™ group categories:

| Pack Type | Contents |
|-----------|----------|
| **Asset Packs™** | Mixed approved collections |
| **Lighting Packs™** | Lighting™ + Atmosphere™ |
| **Furniture Collections™** | Furniture™ · Decor™ |
| **Material Libraries™** | Materials™ · Glass™ · Stone™ · Metal™ |
| **Atmosphere Packs™** | Atmosphere™ · Particles™ |
| **Architectural Components™** | Environment Shell™ · Landmarks™ |
| **Transition Systems™** | Transitions™ |

See [marketplace-integration.md](./marketplace-integration.md).

---

## Category Search Priority

When multiple categories match a request:

```
1. Exact category match
2. Scene Stack layer category
3. Parent category (e.g. Materials™ for specific stone)
4. Visual role equivalent (cross-category)
5. Pack bundle match
```

---

## Forbidden Assumptions

| Assumption | Reality |
|------------|---------|
| "Lighting is always new per room" | Lighting has highest reuse rate |
| "Landmarks are never shared" | Archetype landmarks adapt across similar departments |
| "Runtime FX aren't assets" | Registered · versioned · reusable |
| "Audio doesn't need Registry" | Audio is first-class · exact reuse default |

---

_Asset Categories — the taxonomy Intelligence searches._

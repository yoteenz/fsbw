# 07 — Visual Language

**SDK Module:** `studio.department.sdk.v1.visual`  
**Status:** Inherited visual law  
**Philosophy:** Visual standards are inherited by all departments and adapted by Company Genome — never defined per department

---

## Definition

The Department Visual Language defines the **structural visual rules** every department inherits. These are not brand choices — they are the physics of how Studio OS environments look, feel, and communicate depth.

Company Genome™ injects brand-specific expression into these rules at runtime. Departments never hardcode visual identity.

---

## Visual Inheritance Model

```
SDK Visual Language (this document)     ← structural law — fixed
         ↓
Company Genome™ domains                 ← brand expression — dynamic
         ↓
Department Asset Materials              ← runtime result — unique per company
```

The same visual language produces marble and crystal for a luxury brand, brushed steel and glass for a law firm, warm wood and linen for a medical practice — without changing SDK rules.

---

## Architecture

### Spatial Architecture

| Rule | Specification |
|------|---------------|
| Envelope | Departments exist within a bounded 3D envelope — not infinite scroll |
| Proportion | Golden ratio governs hero-to-primary zone height ratio (1:0.618) |
| Horizon | Floor plane always visible — user always knows "ground" |
| Ceiling | Ceiling implied but rarely shown — open sky or soft gradient |
| Depth layers | Minimum 3 depth planes: foreground (furniture), midground (work), background (hero) |
| Walls | Walls are surfaces — not UI containers. Content lives on objects, not walls (except Mood Wall, Interactive Wall) |

### Architectural Styles (Genome-Adaptive)

Genome `worldBuilding` domain selects architectural character:

| Style | Genome Signal | Expression |
|-------|---------------|------------|
| **Luxury** | High `spatialDesign` generosity, premium `materialLanguage` | Marble, crystal, brass, generous void space |
| **Editorial** | Strong `editorialDirection`, refined `typography` | Clean lines, gallery white, dramatic typography walls |
| **Minimal** | Restrained `colorPrinciples`, sparse `worldBuilding` | Few objects, maximum negative space, single material palette |
| **Industrial** | Operational `interactionStyle`, functional `materialLanguage` | Exposed structure, concrete, utility surfaces |
| **Organic** | Warm `brandEmotions`, natural `materialLanguage` | Wood, stone, plants, soft curves |

---

## Materials

### Material Slots

Every surface exposes Genome-parameterized slots:

```yaml
MaterialSlot:
  baseColor: color          # from colorPrinciples
  roughness: float          # 0.0 (mirror) to 1.0 (matte)
  metalness: float          # 0.0 (dielectric) to 1.0 (metal)
  emissive: color           # accent glow from colorPrinciples
  normal: texture           # surface detail from materialLanguage
  opacity: float            # for glass surfaces
```

### Canonical Material Families

| Family | Use | Genome Domain |
|--------|-----|---------------|
| **Stone** | Floors, walls, pedestals | `materialLanguage` |
| **Glass** | Tables, panels, displays | `materialLanguage` + `colorPrinciples` |
| **Metal** | Fixtures, frames, accents | `materialLanguage` |
| **Fabric** | Seating, soft surfaces | `materialLanguage` |
| **Wood** | Tables, shelving, warmth | `materialLanguage` |
| **Light** | Emissive surfaces, glow | `colorPrinciples` |

**Rule:** SDK defines slot schema. Genome defines values. Assets define geometry.

---

## Glass

Glass is a first-class material system — not a visual effect.

| Property | Specification |
|----------|---------------|
| Refraction | All glass surfaces refract background content |
| Reflection | Reflection intensity from Genome `materialLanguage` — luxury: high; minimal: low |
| Tint | Glass tint from `colorPrinciples` — never neutral clear |
| Edge glow | Glass edges catch `colorPrinciples` accent as emissive rim |
| Content plane | Glass tables and panels render content on an interior plane with parallax |
| Frost transition | Panels frost/fade on dismiss — never hard disappear |

---

## Lighting

| Rule | Specification |
|------|---------------|
| Source count | 3–5 visible sources per department (see Spatial Layout anchors) |
| Temperature | Genome `lightingStyle` sets warm/cool baseline |
| Key light | Always from above-front — never flat frontal |
| Fill | Ambient fill prevents pure black shadows |
| Accent | Ceremony and Orb zones have dedicated accent capability |
| IBL | Image-based lighting from Genome-adapted environment map |
| Shadow | Soft shadows required — hard shadows only for industrial style |

**Forbidden:** Flat, even lighting. Pure white light. Lighting without Genome adaptation.

---

## Typography

Typography lives on **panels and objects** — never floating in space without a surface.

| Rule | Specification |
|------|---------------|
| Source | Genome `editorialDirection` + `typography` domains |
| Hierarchy | 3 levels maximum in any single panel: headline, body, caption |
| Scale | Relative to object size — not viewport percentage |
| Weight | Headlines: Genome display weight. Body: Genome text weight |
| Case | Genome `microcopyStyle` determines case treatment |
| Motion | Text appears with content — never types itself character by character (except Orb speech) |

---

## Spacing

| Rule | Specification |
|------|---------------|
| Object spacing | Minimum 0.15 normalized units between furniture objects |
| Panel padding | 12–24px equivalent at primary LOD |
| Zone breathing | 20% of zone area must be negative space |
| Content density | Maximum 7 items visible on any single surface without scroll/pagination |
| Orb clearance | Minimum 0.2 units clearance around Orb Pedestal |

---

## Scale

| Element | Scale Reference |
|---------|-----------------|
| Furniture | Human-scale — work surfaces at desk height |
| Panels | Proportional to attached object — never viewport-width |
| Orb | 0.12 unit diameter — consistent across all departments |
| Text | Readable at primary camera distance without zoom |
| Particles | Subtle — never obscure content |
| Hero / Mood Wall | Largest visual element — establishes room scale |

---

## Depth

| Technique | Application |
|-----------|-------------|
| Parallax | Mood Wall, background elements move slower than foreground |
| Atmospheric perspective | Distant elements desaturate and lighten |
| Focus depth | Active object sharp; inactive objects slightly soft |
| Layer separation | Foreground, midground, background clearly distinct |
| Reflection depth | Glass and polished surfaces reflect room depth |

---

## Reflections

| Surface | Reflection Behavior |
|---------|---------------------|
| Glass tables | Reflect room ceiling and hero space |
| Polished stone | Subtle environment reflection |
| Metal accents | Sharp reflection of nearest light source |
| Panels | No reflection — matte or frosted glass only |
| Orb | Reflects room state — glow overrides reflection |

---

## Particles

| Type | Use | Intensity |
|------|-----|-----------|
| Ambient dust | Atmospheric depth | Very subtle — 5–15 particles visible |
| Light motes | Hero space atmosphere | Subtle — follows light anchors |
| Interaction spark | Verb feedback | Brief — 0.5s duration |
| Ceremony burst | Approval, launch | Medium — 2s duration |
| Genome pulse | Genome update received | Subtle — room-wide color breathe |

**Rule:** Particles never obscure readable content. `prefers-reduced-motion` disables all particles.

---

## Animation (Visual)

Visual animation rules complement [08 — Motion Standard](./08_MOTION_STANDARD.md):

| Element | Animation |
|---------|-----------|
| Mood Wall | Slow parallax, color breathe (8s cycle) |
| Glass surfaces | Reflection shimmer on content change |
| Particles | Continuous ambient; burst on ceremony |
| Lighting | Subtle intensity shift on zone focus change |
| Materials | Genome update triggers 2s crossfade |

---

## Style Registers

Three canonical style registers — Genome selects primary, may blend:

### Luxury

| Attribute | Expression |
|-----------|------------|
| Materials | Marble, crystal, brushed gold, velvet |
| Lighting | Warm key, soft fill, accent sparkle |
| Spacing | Generous — 30%+ negative space |
| Particles | Gold motes, slow drift |
| Glass | High reflection, warm tint |
| Typography | Elegant serif headlines, generous tracking |

### Editorial

| Attribute | Expression |
|-----------|------------|
| Materials | Gallery white, black accents, matte concrete |
| Lighting | Dramatic key, deep shadows, spotlight accents |
| Spacing | Structured grid feeling — precise alignment |
| Particles | Minimal — dust only |
| Glass | Low reflection, neutral tint |
| Typography | Bold sans headlines, tight hierarchy |

### Minimalism

| Attribute | Expression |
|-----------|------------|
| Materials | Single material family, matte everything |
| Lighting | Even, soft, no dramatic shadows |
| Spacing | Maximum negative space — 40%+ |
| Particles | None |
| Glass | Frosted, no reflection |
| Typography | Light weight, ample line height |

---

## Genome Adaptation Matrix

| SDK Visual Rule | Genome Domain | Adaptation |
|-----------------|---------------|------------|
| Material slots | `materialLanguage` | Values filled |
| Color on all surfaces | `colorPrinciples` | Palette applied |
| Light temperature | `lightingStyle` | Warmth/coolness set |
| Typography | `editorialDirection`, `typography` | Fonts and hierarchy |
| Hero imagery | `visualReferences`, `photographyDirection` | Mood Wall content |
| Particle color | `colorPrinciples`, `brandEmotions` | Hue and intensity |
| Style register | `visualPhilosophy`, `worldBuilding` | Register selection |
| Spacing generosity | `spatialDesign` | Density adjustment |
| Glass tint | `colorPrinciples` | Tint color |
| Reflection intensity | `materialLanguage` | Roughness/metalness |

---

## Forbidden Visual Patterns

| Pattern | Why Forbidden |
|---------|---------------|
| Hardcoded hex colors in assets | Genome must control all color |
| Dashboard card grids | Departments are environments, not dashboards |
| Flat 2D page layouts | All content on spatial objects |
| Stock photo backgrounds | Mood Wall uses Genome references only |
| Brand logos in asset files | Logos injected from Genome at runtime |
| Dark mode toggle per department | Atmosphere from Genome + Living HQ, not user toggle |
| Uniform density across industries | Genome `spatialDesign` must vary expression |

---

_Next: [08 — Motion Standard](./08_MOTION_STANDARD.md)_

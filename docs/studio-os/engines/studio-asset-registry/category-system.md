# Category System — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.categories`  
**Status:** Canonical taxonomy for all Registry Items

---

## Purpose

The category system enables **discovery**, **Smart Reuse matching**, **Compiler folder routing**, and **search filtering** across unlimited asset types.

Every Registry Item has:

- **`category`** — top-level domain (required)
- **`subcategory`** — dot-notation specialization (required)
- **`reuseCategory`** — cross-department reuse matcher (required for physical/runtime assets)

---

## Top-Level Categories

| Category ID | Display Name | Description |
|-------------|--------------|-------------|
| `environment` | Environment | Architecture · shells · terrain · sky · room envelopes |
| `architecture` | Architecture | Structural elements · walls · floors · ceilings · portals |
| `furniture` | Furniture | Seating · tables · storage · fixtures |
| `material` | Materials | Surface shaders · PBR sets · genome-tint slots |
| `glass` | Glass Systems | Panels · partitions · frosted overlays · curtain walls |
| `lighting` | Lighting | Rigs · fixtures · HDRI · volumetric · accent |
| `vfx` | VFX | Post-process · ambient effects · screen-space |
| `particle` | Particle Systems | Dust · sparkle · celebration · atmospheric |
| `audio` | Audio | SFX · UI sounds · ambient beds |
| `music` | Music | Scores · loops · ceremony themes |
| `animation` | Animations | Object · camera · ceremony · transition |
| `camera` | Cameras | Presets · rigs · inspect angles · cinematic |
| `ui` | UI Components | Acrylic panels · HUD · floating monitors |
| `acrylic` | Acrylic Panels | Inspect overlays · menus · floating UI glass |
| `hologram` | Holograms | Projections · displays · talent holograms |
| `npc` | NPCs | Non-player characters · ambient staff |
| `ai-personality` | AI Personalities | Concierge brains · advisor personas |
| `concierge` | Concierges | Digital staff definitions · roster entries |
| `orb` | Studio Orb | Orb meshes · behaviors · ceremony states |
| `motion` | Motion Systems | Easing · timing · choreography libraries |
| `icon` | Icons | Brand · UI · wayfinding |
| `typography` | Typography Systems | Font stacks · scale · register rules |
| `brand-theme` | Brand Themes | Visual identity bundles |
| `genome-preset` | Company Genome Presets | Pre-built genome configurations |
| `room-dna` | Room DNA Presets | Slider snapshots · industry presets |
| `department-template` | Department Templates | Reusable department definitions |
| `department-package` | Department Packages | Compiled `DepartmentPackage.zip` refs |
| `prompt` | Prompt Intelligence | Templates · fragments · recipes · negatives |
| `interaction` | Interaction Patterns | Verbs · affordances · ceremonies |
| `walk-path` | Walk Paths | Navigation · tour · ceremony paths |
| `validation` | Validation Rules | QA gates · golden criteria |
| `pack` | Marketplace Packs™ | Pack manifests · collections |
| `prop` | Props | Decorative · functional small objects |
| `plant` | Plants | Greenery · biophilic elements |
| `door` | Doors & Portals | Entries · transitions · discover exits |
| `display` | Displays | Screens · mood walls · comparison surfaces |

Categories are **extensible** — new top-level categories register via `registry:category-{id}-v1` meta-items without schema migration.

---

## Subcategory Notation

Format: `{parent}.{child}[.{grandchild}]`

```
furniture.seating.executive
furniture.seating.lounge
furniture.tables.conference
glass.panel.frosted
glass.panel.acrylic-floating
lighting.rig.editorial
lighting.fixture.ceiling-pendant
prompt.template.lighting
prompt.fragment.glass
prompt.recipe.luxury-marble-environment
prompt.negative.saas-forbidden
orb.behavior.greeting
orb.mesh.universal-v2
interaction.verb.inspect
interaction.ceremony.approval
pack.luxury-office
pack.law-office
genome-preset.law-firm
room-dna.creative-direction-golden
```

---

## Reuse Category Registry

`reuseCategory` is the **primary Smart Reuse matcher** — coarser than subcategory, shared across departments.

Derived from Department Generator [asset-schema](../../department-generator/asset-schema.md) and extended for Registry scope:

| Reuse Category | Matches | Example Registry IDs |
|----------------|---------|----------------------|
| `seating-executive` | Executive chairs | `registry:executive-chair-luxury-v3` |
| `seating-lounge` | Lounge · salon seating | `registry:salon-chair-v1` |
| `table-conference` | Conference · board tables | `registry:conference-table-marble-v2` |
| `table-workstation` | Desks · workstations | `registry:creative-desk-v1` |
| `glass-panel` | Frosted · inspect panels | `registry:glass-panel-frosted-v2` |
| `acrylic-floating-menu` | Floating UI acrylic | `registry:acrylic-menu-v1` |
| `interactive-wall-hero` | Mood · comparison walls | `registry:mood-wall-hero-v1` |
| `lighting-rig-editorial` | Editorial lighting rigs | `registry:lighting-rig-editorial-v1` |
| `lighting-fixture-ambient` | Ambient fixtures | `registry:ceiling-pendant-luxury-v1` |
| `orb-universal` | Studio Orb mesh + behavior | `registry:orb-universal-v2` |
| `hologram-display` | Holographic displays | `registry:hologram-panel-law-v1` |
| `material-marble-luxury` | Luxury marble materials | `registry:marble-calacatta-genome-slot` |
| `material-brass-accent` | Brass · metal accents | `registry:brass-material-v2` |
| `environment-shell-interior` | Room interior shells | `registry:interior-shell-atelier-v1` |
| `environment-shell-lobby` | Lobby · reception shells | `registry:lobby-shell-luxury-v1` |
| `camera-product-three-quarter` | Product inspect cameras | `registry:camera-3q-product-v1` |
| `vfx-ambient-dust` | Subtle ambient VFX | `registry:vfx-dust-editorial-v1` |
| `audio-ambient-office` | Office ambient loops | `registry:audio-ambient-creative-v1` |
| `animation-panel-reveal` | UI panel reveal motion | `registry:anim-panel-reveal-v1` |
| `prompt-glass-panel` | Glass prompt fragments | `registry:prompt-fragment-glass-frosted-v1` |
| `prompt-lighting-rim` | Rim lighting prompts | `registry:prompt-fragment-lighting-rim-v1` |
| `prompt-luxury-marble` | Marble environment prompts | `registry:prompt-recipe-luxury-marble-v1` |
| `prompt-negative-saas` | Anti-SaaS negative library | `registry:prompt-negative-saas-v1` |
| `interaction-inspect-overlay` | Inspect interaction pattern | `registry:interaction-inspect-v1` |
| `department-creative-direction` | Full CDS template | `registry:dept-template-creative-direction-v1` |
| `pack-luxury-office` | Luxury Office Pack™ | `registry:pack-luxury-office-v1` |
| `pack-law-office` | Law Office Pack™ | `registry:pack-law-office-v1` |
| `genome-adapt-furniture` | Furniture genome overlay | `registry:genome-adapt-furniture-luxury-v1` |
| `concierge-digital-staff` | Concierge definitions | `registry:concierge-creative-director-v1` |

---

## Category → Compiler Folder Mapping

When Compiler reuses or packages assets, categories route to `DepartmentPackage.zip` folders:

| Category | Package Folder |
|----------|----------------|
| `environment`, `architecture` | `01_environment/` |
| `furniture`, `prop`, `plant` | `02_furniture/` |
| `material` | `03_materials/` |
| `glass`, `acrylic` | `05_glass/` |
| `lighting` | `08_lighting/` |
| `vfx`, `particle` | `09_vfx/` |
| `audio`, `music` | `10_audio/` |
| `animation`, `motion` | `11_animation/` |
| `camera` | `12_cameras/` |
| `ui`, `hologram`, `display` | `04_ui/` |
| `orb` | `06_orb/` |
| `npc`, `concierge`, `ai-personality` | `07_characters/` |
| `prompt` | `13_prompts/` |
| `interaction`, `walk-path` | `14_interactions/` |
| `department-package` | root `package-manifest.json` |
| `validation` | `14_metadata/` |

Prompt-category items populate `13_prompts/` even when not physically generated.

---

## Category Meta-Items

Each top-level category has a **meta Registry Item**:

```json
{
  "registryId": "registry:category-furniture-v1",
  "identity": {
    "name": "Furniture Category",
    "category": "meta",
    "subcategory": "meta.category"
  },
  "metadata": {
    "childCategories": ["furniture.seating", "furniture.tables", "furniture.storage"],
    "reuseCategories": ["seating-executive", "table-conference", "table-workstation"],
    "compilerFolder": "02_furniture/"
  }
}
```

Meta-items power search facets and documentation auto-generation.

---

## Industry Affinity Tags

Categories may declare **industry affinity** — not restriction:

| Industry | High-Affinity Categories |
|----------|--------------------------|
| `law` | `furniture.seating.executive`, `glass.panel.frosted`, `hologram.display` |
| `beauty` | `furniture.seating.lounge`, `lighting.rig.editorial`, `material.marble` |
| `restaurant` | `furniture.tables`, `lighting.fixture`, `ambient.audio` |
| `medical` | `furniture.seating`, `glass.panel`, `validation` |
| `construction` | `environment.shell`, `display`, `material` |
| `agency` | `interactive-wall-hero`, `orb`, `prompt` |
| `music` | `audio`, `music`, `acrylic` |
| `podcast` | `audio`, `furniture.tables`, `lighting.rig` |

Affinity boosts search ranking — does not block cross-industry reuse.

---

## Pack Category Hierarchy

```
pack (top-level)
  └── pack.{pack-slug}
        └── items[] → any category
```

Pack items retain their native category **and** `packOwnership.ownedByPack`.

---

## Registration Rules

| Rule | Description |
|------|-------------|
| One primary category | Every item has exactly one top-level `category` |
| Subcategory required | No orphan top-level-only items |
| Reuse category for physical assets | All mesh · material · audio · animation items require `reuseCategory` |
| Prompt items use `prompt` category | Never filed under `furniture` even if furniture-related |
| Department templates use `department-template` | Not `furniture` or `environment` |
| Pack manifests use `pack` | Child items registered separately |

---

## Creative Direction Studio™ Category Seed

Golden department `asset-manifest.json` seeds these reuse categories:

| Asset (CDS) | Category | Reuse Category |
|-------------|----------|----------------|
| Mood Wall | `display` | `interactive-wall-hero` |
| Glass Panels | `glass` | `glass-panel` |
| Studio Orb | `orb` | `orb-universal` |
| Timeline Table | `furniture` | `table-workstation` |
| Branch Comparison Zone | `interaction` | `interaction-inspect-overlay` |
| Editorial Lighting Rig | `lighting` | `lighting-rig-editorial` |

These become first **Approved** golden Registry entries.

---

_Category System — unlimited types, one taxonomy._

# 04 — Environment Compiler

**Engine Module:** `studio.department-generator.v1.environment-compiler`  
**Status:** Environment generation task compiler  
**Philosophy:** Never one prompt for a room. Always discrete architectural tasks.

---

## Design Principle

> The Generator does **not** say *"Generate Creative Direction."* It compiles **Architecture Prompt · Interior Prompt · Ceiling Prompt · Floor Prompt · Window Prompt · Lighting Prompt · Furniture Prompt · Decor Prompt · View Prompt · Atmosphere Prompt · Environmental Storytelling Prompt** — each separately.

---

## Compiler Output

```yaml
EnvironmentCompileResult:
  departmentId: DepartmentTypeId
  layoutTemplate: LayoutTemplateId
  tasks: EnvironmentTask[]          # 10–15 discrete tasks
  dependencyGraph: AssetDependencyGraph
  spatialManifest: SpatialManifest  # zone positions · SDK 02
  genomeSlots: GenomeSlotBinding[]
```

Each `EnvironmentTask` becomes one entry in `GenerationInstructionSet` for Asset Compiler (11).

---

## Environment Task Catalog

| Task ID | Prompt Target | Asset Output | Stage Order |
|---------|---------------|--------------|-------------|
| `env-architecture` | Shell geometry · proportions · envelope | `environment/shell.glb` | 1 |
| `env-interior` | Wall planes · alcoves · wall treatments | `environment/interior.glb` | 1 |
| `env-ceiling` | Coffers · sky panels · accent tracks | `environment/ceiling.glb` | 2 |
| `env-floor` | Floor material · reflection · grain | `materials/floor.shader` | 2 |
| `env-windows` | Glass wall · frames · exterior connection | `environment/windows.glb` | 3 |
| `env-view-plate` | Exterior atmospheric plate | `environment/exterior.plate` | 3 |
| `env-lighting-rig` | Three-point editorial rig | `lighting/rig.json` | 4 |
| `env-furniture` | Tables · pedestals · shelving frames | `furniture/*.glb` | 5 |
| `env-decor` | Rails · pins · accent hardware | `decor/*.glb` | 5 |
| `env-atmosphere` | Particle fields · fog · depth haze | `particles/ambient.json` | 6 |
| `env-storytelling` | Environmental narrative hints | metadata only | 6 |
| `env-portals` | Entry · exit portal geometry | `portals/*.glb` | 7 |

---

## Prompt Compilation (Per Task)

```yaml
EnvironmentTask:
  id: string
  promptStack:
    base: string                    # DNA atmosphereCharacter + layoutTemplate
    architecture: string            # spatial rules from DNA
    genomeModifiers:
      materialLanguage: "{{genome.materialLanguage}}"
      lightingStyle: "{{genome.lightingStyle}}"
      editorialDirection: "{{genome.editorialDirection}}"
    industryModifiers: string[]     # from Industry DNA
    negativePrompt: string          # anti-SaaS · anti-dashboard universal
  outputSpec:
    assetId: string
    format: enum                    # glb | shader | json | plate
    genomeSlots: string[]
  providerHint: ProviderHint        # routed by Asset Compiler
```

### Example: Architecture Prompt (creative-direction)

```
Base: Double-height editorial creative atelier, Stage layout, 3:2 width-depth,
      minimal columns, generous horizontal sweep, luxury architecture studio register.

Architecture: Hero zone double-volume 6.5m equivalent; work zones 3.2m;
              left wall Brief zone; center Timeline; right glass flank.

Genome: {{materialLanguage}} primary surfaces; {{lightingStyle}} key character;
        {{editorialDirection}} proportion and negative space.

Industry: {{industryModifier}}

Negative: dashboard, card grid, sidebar, white void, stock photo banner, UI chrome.
```

---

## Layout Template Compilation

| Template | Environment Emphasis |
|----------|---------------------|
| **Stage** | Double-height hero · dominant back wall · center command surface |
| **Workshop** | Uniform height · sequential surfaces · production flow |
| **Gallery** | Comparison walls · browsing depth · portrait lighting |

DNA selects template. Compiler never overrides.

---

## Zone Placement Manifest

Compiled from DNA `zoneInventory` + Golden Department coordinates:

```yaml
SpatialManifest:
  zones:
    - id: mood-wall
      position: { x: 0, y: 0.95, z: 0 }
      type: hero
    - id: timeline-table
      position: { x: 0, y: 0.35, z: 0 }
      type: primary
    - id: orb-pedestal
      position: { x: 0.35, y: 0.55, z: 0.4 }
      type: orb
  entry: { z: -0.9, portal: entry }
  exit: { z: -0.9, portal: exit }
```

---

## Genome Slot Bindings (Environment)

| Task | Genome Fields |
|------|---------------|
| env-architecture | materialLanguage, editorialDirection |
| env-floor | materialLanguage |
| env-windows | visualReferences, lightingStyle |
| env-view-plate | visualReferences, customerEmotions |
| env-lighting-rig | lightingStyle |
| env-atmosphere | experienceDNA, customerEmotions |
| env-decor | materialLanguage |

---

## Industry Transform Examples

| Company | Architecture Modifier |
|---------|----------------------|
| Frontal Slayer | Warm Calacatta marble · rose-gold fixtures · salon proportions |
| NDX | Polished concrete · frosted glass · precise shadow lines |
| Restaurant | Wide-plank oak · copper accents · open shelving metaphor |
| Law Firm | Mahogany paneling · leather-bound zones · library ladders |

Same `env-architecture` task ID — different compiled prompt per Genome.

---

## Dependency Graph

```
env-architecture
├── env-interior
├── env-ceiling
├── env-floor
├── env-windows
│   └── env-view-plate
├── env-lighting-rig
├── env-furniture
├── env-decor
├── env-atmosphere
└── env-portals
```

Object Compiler (05) furniture tasks **extend** `env-furniture` — never duplicate shell.

---

## Anti-Patterns

| Forbidden | Correct |
|-----------|---------|
| Single "generate room" prompt | 10–15 discrete tasks |
| Baked brand hex in texture prompts | Genome shader slots |
| Flattened environment PNG | Modular GLB + shader |
| UI layout in architecture prompt | Physical room envelope only |

---

_Next: [05 — Object Compiler](./05_OBJECT_COMPILER.md)_

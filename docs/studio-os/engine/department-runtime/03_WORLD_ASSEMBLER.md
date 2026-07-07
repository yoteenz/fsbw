# 03 — World Assembler

**Engine Module:** `studio.department-runtime.v1.world-assembler`  
**Status:** Spatial assembly specification  
**Philosophy:** The Runtime assembles. It never creates.

---

## Definition

The **World Assembler** orchestrates the ordered construction of a department world from loaded asset modules and metadata. It places geometry, binds materials, activates systems, and prepares the envelope for Genome injection and intelligence activation.

---

## Assembly Pipeline

```
Load Environment
        ↓
Apply Lighting (rig structure — values pending Genome)
        ↓
Bind Materials (shader slots — values pending Genome)
        ↓
Place Furniture (metadata.objectPlacements)
        ↓
Attach Glass Elements (furniture nodes)
        ↓
Place Interactive Objects (zones)
        ↓
Position Orb (pedestal node)
        ↓
Initialize Particles (emitters dormant until ACTIVE)
        ↓
Prime Audio (mixer channels — silent until ACTIVE)
        ↓
Bind Animations (objects + camera)
        ↓
Register Interaction Zones (bounds from metadata)
        ↓
Instantiate AI Employee Slots (Concierge Runtime)
        ↓
Genome Injection (13) — fill all slots
        ↓
READY
```

**Nothing is created at assembly** — only positioned, bound, and connected.

---

## Assembly Context

```yaml
AssemblyContext:
  package: DepartmentAssetPackage
  metadata: PackageMetadata           # placements, zones, load order
  loadedAssets: Map<assetId, AssetHandle>
  spatialEnvelope: SpatialBounds      # from World Rules / metadata
  layoutTemplate: enum                # stage | workshop | gallery
  attachmentGraph: AttachmentNode[]   # environment → furniture → glass
  zoneBounds: ZoneBounds[]            # computed from object clusters
  validationResults: AssemblyValidation[]
```

---

## Stage Specifications

### 1. Environment

| Action | Source |
|--------|--------|
| Instantiate room shell mesh | `environment/environment.glb` |
| Set spatial envelope origin | metadata.spatialLayout |
| Register attachment nodes | Named nodes in GLB |
| Enable collision mesh | Environment collision layer |
| Apply LOD policy | Performance System (16) |

### 2. Lighting

| Action | Source |
|--------|--------|
| Parse light rig JSON | `lighting/lights.json` |
| Position anchors per SDK spatial layout | Hero, work, ambient, ceremony |
| Load IBL HDR | `lighting/ibl-environment.hdr` |
| Leave intensity/color as Genome slots | Pending injection |

### 3. Materials

| Action | Source |
|--------|--------|
| Load shader bundles | `materials/*.json` |
| Register material IDs | Global material registry |
| Bind to environment surfaces | Slot assignment map |
| Slots remain null until Genome | Injection stage |

### 4. Furniture

| Action | Source |
|--------|--------|
| For each `metadata.objectPlacements` | Placement record |
| Instantiate GLB at position/rotation/scale | furniture/*.glb |
| Bind material set reference | materials-furniture |
| Register collision bounds | Object Manager |
| Validate spacing ≥ 0.15 | Overlap rejection |

### 5. Glass Elements

| Action | Source |
|--------|--------|
| Attach to furniture attachment nodes | glass/*.glb |
| Bind glass shader bundle | materials-glass |
| Enable refraction pipeline | Render graph |
| Register content planes | For panel rendering |

### 6. Interactive Objects

| Action | Source |
|--------|--------|
| Place approval stations, preview screens, etc. | Per anatomy |
| Bind interaction collision planes | interactions.json |
| Assign to zones | Zone registry |
| Mood Wall: bind imagery reference | Genome-driven at injection |

### 7. Orb

| Action | Source |
|--------|--------|
| Load platform Orb mesh | orb/orb.glb or platform cache |
| Attach to orb-pedestal node | Pedestal furniture |
| Register Orb Runtime actor | Subsystem 06 |

### 8. Particles

| Action | Source |
|--------|--------|
| Parse particle system JSON | particles/*.json |
| Create emitters at zone anchors | Dormant until ACTIVE |
| Color slots null until Genome | Injection |

### 9. Audio

| Action | Source |
|--------|--------|
| Register mixer channels | Ambient, SFX, ceremony, voice |
| Preload ambient OGG | Decoded buffer ready |
| Queue lazy SFX | On first interaction |
| Volume 0 until ACTIVE | Fade in on arrival |

### 10. Animations

| Action | Source |
|--------|--------|
| Bind clips to object instances | animations/*.glb |
| Load camera path JSON | camera/camera.json |
| Register motion profiles | SDK 08 profile IDs |
| Set reduced-motion fallbacks | User preference |

### 11. Interaction Zones

| Action | Source |
|--------|--------|
| Compute zone bounds from placements | metadata + SDK 02 |
| Register allowed verbs per zone | interactions.json |
| Link zones to camera presets | Camera System |

### 12. AI Employee Slots

| Action | Source |
|--------|--------|
| Read ai-employees from package/DNA | Department DNA |
| Create Concierge Runtime actor per role | Subsystem 07 |
| Assign primary zones | anatomy.aiEmployees |
| Defer personality until Genome | Injection |

### 13. Genome Injection

Delegated to [13 — Genome Injection](./13_GENOME_INJECTION.md) — assembly pauses at READY until injection completes.

---

## Assembly Validation

| Check | Severity |
|-------|----------|
| All required placements resolved | Critical |
| No object overlap | Critical |
| All attachment nodes found | Critical |
| All zones have ≥1 object | Warning |
| Orb pedestal exists | Critical |
| Entry and exit portals placed | Critical |
| Interaction map objects exist | Critical |

Failed critical → Error Recovery (19); partial assembly with fallbacks.

---

## Assembly vs Creation

| Assembler Does | Assembler Never Does |
|----------------|---------------------|
| Position loaded GLB | Generate mesh geometry |
| Bind material references | Author shaders from scratch |
| Compute zone bounds | Invent interaction verbs |
| Wire attachment nodes | Design spatial layout |
| Register actors | Create AI personalities |

---

## Multi-Package Headquarters

Each department package assembles **independently**. Headquarters orchestrator maintains multiple assembled worlds:

```
HQ Runtime Context
├── creative-direction/  → assembled world (may be BACKGROUND)
├── marketing/           → assembled world (ACTIVE)
└── production/          → assembled world (UNLOADED — cached metadata only)
```

Only ACTIVE + BACKGROUND departments retain full assembly in memory.

---

_Next: [04 — Object Manager](./04_OBJECT_MANAGER.md)_

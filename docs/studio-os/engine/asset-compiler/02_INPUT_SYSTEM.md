# 02 — Input System

**Engine Module:** `studio.asset-compiler.v1.inputs`  
**Status:** Canonical input specification  
**Philosophy:** Every compiler input is structured data — never freeform user prompts

---

## Definition

The Input System defines **every data source** the Studio Asset Compiler™ consumes. All inputs are typed, validated, and versioned. The compiler never accepts raw user text as a generation prompt — inputs are resolved into prompt variables by the Prompt Compiler (03).

---

## Input Resolution Flow

```
Primary Inputs (6 domains)
         ↓
Supporting Inputs (resolved from primary + platform)
         ↓
Input Manifest (validated, merged, versioned)
         ↓
Prompt Compiler (03)
```

---

## Primary Inputs

### 1. Company Genome™

**Source:** Company Genome service (M277)  
**Type:** `CompanyGenomeSnapshot`  
**Required:** Yes — every compile

The apex living identity. Drives all visual, voice, material, and behavioral derivation.

```yaml
CompanyGenomeSnapshot:
  organizationId: string
  snapshotId: string
  capturedAt: datetime
  domains:
    # Identity
    mission: string
    purpose: string
    coreBeliefs: string[]
    values: string[]
    personality: string
    archetype: string
    # Creative
    visualPhilosophy: string
    experiencePhilosophy: string
    motionPhilosophy: string
    photographyDirection: string
    artDirection: string
    editorialDirection: string
    pacing: string
    # Material & Spatial
    colorPrinciples: ColorPrincipleSet    # principles, not hex
    materialLanguage: MaterialLanguage
    lightingStyle: LightingStyle
    spatialDesign: SpatialDesign
    worldBuilding: WorldBuilding
    # Sensory
    musicStyle: MusicStyle
    soundDesign: SoundDesign
    # Behavior
    interactionStyle: InteractionStyle
    immersionLevel: number                  # 0.0–1.0
    # Constraints
    thingsWeNeverDo: string[]
    thingsWeLove: string[]
    visualReferences: Reference[]
    aspirationalBrands: string[]
    # Signature
    signatureMoments: SignatureMoment[]
    signatureAnimations: string[]
    # Offerings
    products: Product[]
    terminology: TerminologyMap
    voice: VoiceProfile
    microcopyStyle: MicrocopyStyle
```

**Compiler usage:** Every prompt stack inherits relevant Genome domains automatically. See [08 — Company Genome Injection](./08_COMPANY_GENOME_INJECTION.md).

---

### 2. Department DNA

**Source:** Department SDK anatomy + spatial layout + object instances  
**Type:** `DepartmentDNA`  
**Required:** Yes

The structural blueprint of the department being compiled.

```yaml
DepartmentDNA:
  anatomy: DepartmentAnatomy          # SDK 01 — full anatomy schema
  spatialLayout: SpatialLayout        # SDK 02 — template + placements
  objects: ObjectInstance[]           # SDK 03 — placed object instances
  interactionZones: ZoneDefinition[]  # SDK 01 — zone bounds + verbs
  aiEmployees: AIEmployeeAssignment[]   # SDK 05 — role assignments
  dependencies: DependencyRef[]         # SDK 01 — upstream/downstream
  genomeHooks: GenomeHookRef[]          # SDK 01 — injection points
  compileProfile: string              # department compiler profile (07)
```

**Compiler usage:** Determines which assets to generate, spatial proportions, object inventory, and department-specific prompt templates.

---

### 3. Project Intent

**Source:** Project Model + Project Genome™ (M278)  
**Type:** `ProjectIntent | null`  
**Required:** No — null for department-only compiles

Active project context that overlays department defaults.

```yaml
ProjectIntent:
  projectId: string
  projectCode: string                 # e.g., PROJECT-001
  title: string
  creativeDirection: CreativeDirectionSummary
  mood: ProjectMood
  deliverables: Deliverable[]
  timeline: Milestone[]
  references: Reference[]
  founderNotes: FounderNote[]
  audienceIntent: string
  channelTargets: string[]
  projectGenome: ProjectGenomeOverlay
```

**Compiler usage:** Influences Mood Wall content, hero imagery, timeline data, Interactive Wall references, and AI knowledge emphasis. Does not override Company Genome constraints.

---

### 4. Design Language

**Source:** SDK Visual Language (07) + Design Genome™ (M85)  
**Type:** `DesignLanguage`  
**Required:** Yes

Structural visual law — not brand expression.

```yaml
DesignLanguage:
  styleRegister: enum               # luxury | editorial | minimal | industrial | organic
  materialFamilies: string[]        # stone, glass, metal, fabric, wood, light
  glassRules: GlassRules
  lightingRules: LightingRules
  typographyRules: TypographyRules
  spacingRules: SpacingRules
  depthTechniques: DepthTechnique[]
  particleRules: ParticleRules
  reflectionRules: ReflectionRules
  designGenomePatterns: Pattern[]   # org visual memory from M85
```

**Compiler usage:** Constrains generation geometry, material slot structure, and spatial proportions. Genome fills slot values.

---

### 5. Experience DNA™

**Source:** Experience DNA module  
**Type:** `ExperienceDNA`  
**Required:** Yes

How the department **feels** in motion and atmosphere.

```yaml
ExperienceDNA:
  immersionLevel: number            # 0.0–1.0
  motionCharacter: enum             # cinematic | brisk | deliberate | still
  atmosphereWeight: enum            # whisper | balanced | declare
  arrivalCeremony: ArrivalCeremonyConfig
  departureCeremony: DepartureCeremonyConfig
  ambientDensity: number            # particle/audio density
  interactionFeedback: enum         # subtle | standard | dramatic
  cameraPersonality: enum           # observational | intimate | elevated | dynamic
  silenceTolerance: number          # 0.0–1.0
  celebrationIntensity: number      # 0.0–1.0
  lotMetaphor: string               # studio lot character
```

**Compiler usage:** Drives motion profiles, audio density, particle intensity, camera behavior, and ceremony configuration in generated assets.

---

### 6. World Rules

**Source:** SDK spatial + interaction + physics law  
**Type:** `WorldRules`  
**Required:** Yes

The physics and interaction law of the department world.

```yaml
WorldRules:
  coordinateSystem: CoordinateSystem    # SDK 02 normalized envelope
  spatialEnvelope: SpatialBounds
  layoutTemplate: enum                  # stage | workshop | gallery
  zoneRules: ZoneRule[]
  objectSpacing: number                 # minimum 0.15
  cameraPresets: CameraPreset[]         # SDK 02 six positions
  interactionVerbs: string[]            # SDK 04 verb catalog
  physicsRules:
    gravity: boolean                    # always true
    collision: boolean                  # furniture collision bounds
    glassRefraction: boolean
  accessibilityRules: AccessibilityRule[]
  performanceBudget: PerformanceBudget
```

**Compiler usage:** Constrains asset scale, placement validation, interaction map generation, and performance limits.

---

## Supporting Inputs

### Industry DNA

**Source:** Industry Architecture (M88) — `industries.ts`  
**Type:** `IndustryDNA`

```yaml
IndustryDNA:
  industryId: string                  # beauty | legal | medical | construction | ...
  industryName: string
  spatialConventions: string[]        # e.g., "generous seating" for law
  materialAffinities: string[]        # industry-typical materials (not branded)
  workflowPatterns: string[]          # industry-typical work flows
  regulatoryContext: string[]         # compliance considerations
  terminologyOverrides: TerminologyMap
```

**Compiler usage:** Influences department compiler profile (07) selection and material family hints. Never overrides Genome.

---

### Mood

**Source:** Project Intent + Company Genome `brandEmotions`  
**Type:** `MoodVector`

```yaml
MoodVector:
  primary: string                     # confident | contemplative | energetic | ...
  secondary: string | null
  intensity: number                   # 0.0–1.0
  colorTemperature: enum              # warm | cool | neutral
  source: enum                        # project | genome | founder-note
```

**Compiler usage:** Mood Wall generation, ambient audio selection, particle character, lighting warmth.

---

### References

**Source:** Company Genome `visualReferences` + Project references + Founder pins  
**Type:** `ReferenceSet`

```yaml
Reference:
  id: string
  type: enum              # photography | texture | architecture | material | mood
  source: string          # URL or Asset Registry ID
  weight: number          # influence strength 0.0–1.0
  scope: enum             # company | project | department
  approved: boolean
```

**Compiler usage:** Mood Wall imagery, material texture references, hero space composition. Never embedded in assets — referenced at generation and runtime.

---

### Founder Notes

**Source:** Creative Direction Studio™ · Project founder notes  
**Type:** `FounderNote[]`

```yaml
FounderNote:
  id: string
  content: string
  scope: enum             # project | department | company
  priority: enum          # guidance | preference | constraint
  createdAt: datetime
  affects: string[]       # asset categories or objects affected
```

**Compiler usage:** High-priority notes become prompt variables. Constraints override defaults. Guidance influences creative direction prompts.

---

### Brand Assets

**Source:** Asset Registry™ — logos, photography, brand kits  
**Type:** `BrandAssetRef[]`

```yaml
BrandAssetRef:
  assetId: string         # Asset Registry ID
  type: enum              # logo | photography | icon | pattern | video
  usage: enum             # mood-wall | hero | reference | runtime-inject
  injectAt: enum          # compile-time-reference | runtime-only
```

**Rule:** Logos and brand marks are **runtime-inject only** — never generated into 3D assets. Photography may inform Mood Wall generation as reference.

---

### Prompt Variables

**Source:** Computed by Input Resolver from all inputs above  
**Type:** `PromptVariableMap`

```yaml
PromptVariable:
  key: string
  value: string | number | boolean
  source: string          # which input domain provided this
  scope: enum             # global | category | asset
  genomeDerived: boolean
```

The Prompt Compiler (03) consumes this map — never raw inputs directly.

---

### Asset Dependencies

**Source:** Department DNA objects + SDK asset standard dependency graph  
**Type:** `AssetDependencyGraph`

```yaml
AssetDependency:
  assetId: string
  dependsOn: string[]     # must generate after these
  blocks: string[]        # these wait for this asset
  sharedParameters: string[]  # parameters inherited from parent asset
```

**Compiler usage:** Determines generation order (04). Environment blocks furniture. Materials pre-load before all geometry.

---

### Interaction Requirements

**Source:** SDK 04 interaction maps + department anatomy commands  
**Type:** `InteractionRequirements`

```yaml
InteractionRequirements:
  verbs: VerbBinding[]            # verb → object → zone
  gestures: GestureMap
  ceremonies: CeremonyConfig[]    # approval, launch
  aiTriggers: AITriggerMap
  accessibilityFallbacks: FallbackMap
```

**Compiler usage:** Generates `interactions.json` deterministically. Informs interactive object geometry (approval station, glass table collision planes).

---

### Animation Requirements

**Source:** SDK 08 motion standard + Experience DNA  
**Type:** `AnimationRequirements`

```yaml
AnimationRequirements:
  profiles: MotionProfileRef[]    # SDK 08 canonical profiles
  objectAnimations: ObjectAnimationSpec[]
  cameraPaths: CameraPathSpec[]
  ceremonySequences: CeremonySequence[]
  ambientAnimations: AmbientAnimationSpec[]
  reducedMotionFallbacks: FallbackSpec[]
```

**Compiler usage:** Generates animation clips and camera path JSON. Motion character from Experience DNA scales durations.

---

### Lighting Requirements

**Source:** SDK 02 lighting anchors + Design Language + Genome `lightingStyle`  
**Type:** `LightingRequirements`

```yaml
LightingRequirements:
  anchors: LightingAnchor[]       # hero, work, ambient, ceremony
  genomeStyle: LightingStyle        # from Company Genome
  temperatureRange: [number, number]
  accentCapability: boolean
  iblSlot: boolean                # image-based lighting placeholder
  ceremonyAccent: CeremonyLightConfig
```

**Compiler usage:** Generates `lights.json` with Genome-parameterized slots. IBL HDR generated or selected from library.

---

## Input Validation

Every compile begins with input validation:

| Check | Failure Action |
|-------|----------------|
| Company Genome resolvable | Halt — Genome required |
| Department DNA complete | Halt — list missing anatomy fields |
| World Rules valid | Halt — spatial envelope errors |
| Design Language present | Use SDK defaults |
| Experience DNA present | Use balanced defaults |
| Project Intent (if provided) | Validate project exists |
| References approved | Exclude unapproved references |
| Performance budget defined | Use SDK defaults |
| Industry DNA resolvable | Use universal profile |

---

## Input Manifest

Validated inputs are merged into a single manifest:

```yaml
InputManifest:
  id: string
  compileRequestId: string
  createdAt: datetime
  primary:
    companyGenome: CompanyGenomeSnapshot
    departmentDNA: DepartmentDNA
    projectIntent: ProjectIntent | null
    designLanguage: DesignLanguage
    experienceDNA: ExperienceDNA
    worldRules: WorldRules
  supporting:
    industryDNA: IndustryDNA
    mood: MoodVector
    references: ReferenceSet
    founderNotes: FounderNote[]
    brandAssets: BrandAssetRef[]
    promptVariables: PromptVariableMap
    assetDependencies: AssetDependencyGraph
    interactionRequirements: InteractionRequirements
    animationRequirements: AnimationRequirements
    lightingRequirements: LightingRequirements
  validation:
    passed: boolean
    warnings: string[]
    defaultsUsed: string[]
```

This manifest is immutable for the duration of a compile run. Stored for audit and regeneration.

---

## Input Precedence

When inputs conflict, this precedence applies:

```
1. Company Genome constraints (thingsWeNeverDo)     — absolute veto
2. Founder Notes (priority: constraint)             — override defaults
3. Project Intent                                   — overlay on department
4. Department DNA                                   — structural law
5. World Rules                                      — spatial physics
6. Experience DNA                                   — feel and motion
7. Design Language                                  — visual structure
8. Industry DNA                                     — industry hints
9. SDK defaults                                     — fallback
```

---

_Next: [03 — Prompt Compiler](./03_PROMPT_COMPILER.md)_

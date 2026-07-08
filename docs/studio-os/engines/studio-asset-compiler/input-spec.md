# Input Spec — Studio Asset Compiler™

**Engine Module:** `studio.asset-compiler.v1.input`  
**Schema:** `studio.asset-compiler.v1/compile-input`  
**Status:** Every compiler input defined

---

## Primary Input — Department Definition

Official output from **Studio Department Generator™**. First reference implementation:

**`docs/studio-os/departments/creative-direction-studio/`**

| File | Required | Compiler Use |
|------|----------|--------------|
| `department.json` | ✓ | Identity · profiles · zones · concierges · capabilities |
| `room-dna.json` | ✓ | Slider snapshot · prompt modifiers · industry presets |
| `asset-manifest.json` | ✓ | Asset inventory · stage order · dependencies |
| `interaction-manifest.json` | ✓ | Verb bindings · ceremonies · permissions |
| `environment-blueprint.md` | ✓ | Spatial envelope · environment tasks |
| `scene-assembly-blueprint.md` | ✓ | Placement · boot · Cursor handoff |
| `asset-blueprint.md` | ✓ | Per-object behavior · FAL intent |
| `fal-prompt-package/*.md` | ✓ | Source prompt fragments (pre-expansion) |
| `ai-team.md` | ○ | AI employee routing for runtime manifest |
| `company-genome-adaptation.md` | ○ | Industry adaptation reference |
| `interactions-catalog.md` | ○ | Extended interaction contracts |
| `validation-criteria.md` | ○ | Golden gates for Quality Engine |

---

## Genome Context (Required)

### Company Genome™

```yaml
CompanyGenomeSnapshot:
  schema: studio.company-genome.v1/snapshot
  organizationId: string
  domains:
    mission: string
    values: string[]
    brandDNA: BrandDNA
    materialLanguage: string
    lightingStyle: string
    editorialDirection: string
    photographyDirection: string
    visualReferences: string[]
    customerEmotions: string[]
    experienceDNA: ExperienceDNA
    voice: VoiceProfile
    sonicIdentity: SonicProfile
  thingsWeNeverDo: string[]
```

**Compiler use:** Genome layer injection on every expanded prompt · Quality Engine compliance check.

### Project Genome™

```yaml
ProjectGenomeSnapshot:
  schema: studio.project-genome.v1/snapshot
  projectId: string
  intent: string
  audience: string
  creativeConstraints: string[]
  visualBrief: string
  branchLabels: string[]
```

**Compiler use:** Project overlay on Brief Wall seeds · Timeline labels · Mood Wall character. Optional — compile without project uses Company-only seeds.

### Brand Genome™

Subset of Company Genome focused on visual/verbal identity:

```yaml
BrandGenomeSnapshot:
  materialLanguage: string
  colorSystem: ColorTokens        # shader slots, not baked hex in meshes
  typographyRegister: string
  photographyDirection: string
  voice: VoiceProfile
  editorialDirection: string
```

### Founder Journey™

```yaml
FounderJourneySnapshot:
  schema: studio.founder-journey.v1/snapshot
  stage: enum                     # building · launching · growing · ...
  maturityLevel: number
  ritualPreferences: string[]
  orbRelationshipPhase: string
  adaptationDirectives: AdaptationDirective[]
```

**Compiler use:** Ceremony weight · motion pacing multiplier · Orb greeting register · department unlock context.

---

## Design Context

### Design Language™

```yaml
DesignLanguageSnapshot:
  schema: studio.design-language.v1
  materialVocabulary: string[]
  lightingVocabulary: string[]
  compositionRules: string[]
  forbiddenPatterns: string[]
  qualityTier: enum               # editorial-luxury · professional · ...
```

**Compiler use:** Quality Engine · negative prompt augmentation · Build Health Design Language compliance dimension.

### Design Registry™

```yaml
DesignRegistrySnapshot:
  schema: studio.design-registry.v1
  registeredAssets: RegisteredAsset[]
  reuseLibrary: ReuseEntry[]
  goldenModels: ModelRoute[]
```

**Compiler use:** Reuse lookup · provider model routing · dedupe against existing cooked assets.

---

## Compile Request Schema

```json
{
  "$schema": "studio.asset-compiler.v1/compile-input.json",
  "packageId": "pkg-creative-direction-golden-v1",
  "departmentDefinitionPath": "docs/studio-os/departments/creative-direction-studio/",
  "genomeContext": {
    "companyGenomeRef": "genome-snapshot-v1",
    "projectGenomeRef": null,
    "brandGenomeRef": "brand-snapshot-v1",
    "founderJourneyRef": "founder-journey-snapshot-v1"
  },
  "designContext": {
    "designLanguageRef": "design-language-v1",
    "designRegistryRef": "design-registry-v1"
  },
  "compileMode": "full",
  "providerProfile": "provider-agnostic"
}
```

---

## Input Validation Gates

| Gate | Rule |
|------|------|
| Schema version | `department.json` schemaVersion compatible with compiler v1 |
| Asset count | ≤ budget in department.json (`budgetMB`) |
| Hero object | `spatial.heroObjectId` exists in asset-manifest |
| No flattened bg | asset-manifest has no `background-plate` category |
| Interaction coverage | Every zone object in asset-manifest has interaction entry |
| Prompt sources | Every asset with `promptRef` resolves to existing file |
| Genome slots | Every `genomeSlots[]` entry exists in Company Genome snapshot |

Failure → compile abort with `build-report.md` errors section.

---

## Relationship to Generator Handoff

Generator may also emit `handoff/generation-instruction-set.json`. Compiler **ingests** this when present or **reconstructs** equivalent from Department Definition files. Department Definition is the canonical input for v1 manufacturing.

See [engine/department-generator/11_ASSET_COMPILER_HANDOFF.md](../../engine/department-generator/11_ASSET_COMPILER_HANDOFF.md).

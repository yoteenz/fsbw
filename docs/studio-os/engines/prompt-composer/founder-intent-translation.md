# Founder Intent Translation™

**Engine Module:** `studio.prompt-composer.v1.intent-translation`  
**Status:** Intent → structured production brief

---

## Law

> **The founder only provides intent. Studio OS creates the production brief.**

Founders never see token counts · negative prompts · model slugs · or provider parameters.

---

## Input: Founder Intent™

From [Creative Intelligence Engine™](../../creative-intelligence-engine/prompt-generation-architecture.md):

```yaml
FounderIntent:
  id: uuid
  orgId: string
  source: voice | text | gesture | genome | workstation_context
  workspaceScene: arrival | story-table | mood-wall | notes-desk | pipeline | library
  intentType: generate | modify | reuse | approve | explore
  naturalLanguage: string
  projectContext: ProjectGenome
  tasteSignals: FounderTasteGenome
  explicitVariation: boolean          # Generate Completely New™ bypass
```

---

## Translation Flow

```
FounderIntent.naturalLanguage
         ↓
Creative Interpreter™ (upstream — not Composer)
  → StructuredCreativeRequest
         ↓
Scene Planner™ (upstream)
  → ScenePlan + GenerationLineItem[]
         ↓
★ Prompt Composer™ ★
  → ProductionBrief (internal)
  → ProductionPrompt™ (output)
```

Prompt Composer receives **structured** input — not raw founder text alone.

---

## Example Translation

### Founder

> *"Build an editorial luxury headquarters."*

### Creative Interpreter™ resolves

```yaml
StructuredCreativeRequest:
  scope: workspace | department
  targetDepartment: creative-direction
  aestheticIntent:
    - editorial
    - luxury
    - headquarters
  layerScope: full-scene-stack | null   # null = planner decides
  genomeSignals:
    restraintLevel: high
    materialTone: warm-stone-brass-glass
```

### Scene Planner™ emits

```yaml
GenerationLineItem:
  lineItemId: string
  category: Environment Shell™
  layerId: env-shell-cds
  reuseResolution: generate-new          # after Registry gate
  blueprintId: blueprint-editorial-hq-v2
  workspaceScene: arrival
  productionEstimateId: est-abc123
```

### Prompt Composer™ produces

A complete `ProductionPrompt™` — see [production-prompt-schema.md](./production-prompt-schema.md).

Founder sees: *"Composing editorial luxury headquarters…"*  
Never: *"fal-ai/nano-banana-pro prompt: …"*

---

## Intent Types → Compose Mode

| intentType | Compose behavior |
|------------|------------------|
| `generate` | Full compose from 12 sources |
| `modify` | Delta compose — inherit parent asset prompt layers |
| `reuse` | Skip compose — Registry ref only (no ProductionPrompt) |
| `approve` | No compose — approval path only |
| `explore` | Lightweight preview compose · lower quality tier |

---

## Variation Requests

When `explicitVariation: true`:

| Request | Composer behavior |
|---------|-------------------|
| Generate Completely New™ | Fresh compose · no Registry prompt inheritance |
| Duplicate & Modify™ | Clone parent `ProductionPrompt™` · apply delta layers |
| Force regen | Same brief · new `composeId` · bump `promptVersion` |

---

## Production Brief (Internal)

Intermediate object — never founder-facing:

```yaml
ProductionBrief:
  briefId: uuid
  composeId: uuid
  orgId: string
  founderIntentId: uuid
  scenePlanId: string
  lineItemId: string

  # Resolved references (Composer fetches)
  companyDna: CompanyGenomeSnapshot
  departmentBlueprint: BlueprintRef
  workspaceRules: WorkspaceRuleSet
  registryRefs: RegistryItemRef[]
  materialLibrary: MaterialVocabularyRef[]
  lightingRules: LightingProfileRef
  cameraRules: CameraProfileRef
  architecturalLanguage: ArchitecturalLanguageRef

  # Requirements
  renderingRequirements: RenderingRequirements
  qualityRequirements: QualityRequirements
  negativePrompt: NegativePromptStack

  # Hints only — Optimizer decides
  providerHints: ProviderHintMap
```

`ProductionBrief` → merge → `ProductionPrompt™`.

---

## Orb Narration

| Stage | Orb says |
|-------|----------|
| Translating | *"Translating your intent into a production brief…"* |
| Composing | *"Assembling editorial luxury language from your Blueprints…"* |
| Registry refs | *"Referencing three compatible Lighting assets from your library…"* |
| Complete | *"Production brief ready — routing to generation."* |

---

_Founder Intent Translation™ — one sentence in, world-class brief out._

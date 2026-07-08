# Assembly Pipeline™

**Engine Module:** `studio.prompt-composer.v1.assembly`  
**Status:** Compose stages · merge rules · versioning

---

## Pipeline

```
GenerationLineItem (from Scene Planner™)
         ↓
① Fetch Sources
         ↓
② Resolve Genome Tokens
         ↓
③ Load Registry Fragments
         ↓
④ Merge Layer Stacks
         ↓
⑤ Apply Requirements
         ↓
⑥ Build ProductionPrompt™
         ↓
⑦ Validate Compose
         ↓
⑧ Emit to Provider Optimizer™
```

---

## Stage ① — Fetch Sources

Parallel fetch from engines:

| Source | API / Store |
|--------|-------------|
| Company DNA™ | Company Genome™ snapshot service |
| Department Blueprint™ | Blueprint Engine™ |
| Workspace Rules™ | Workspace rule catalog |
| Camera · Lighting · Material | Registry Prompt Library |
| Registry References™ | Asset Registry™ search result |
| Rendering · Quality | Scene Stack™ + Production Estimate |
| Negative | Registry `prompt.negative` |
| Provider Hints | Design Registry™ |

Output: `ProductionBrief` (see [founder-intent-translation.md](./founder-intent-translation.md)).

---

## Stage ② — Resolve Genome Tokens

Replace all `{{genome.*}}` and `{{roomDna.*}}` placeholders with resolved strings from live snapshots.

| Unresolved token | Action |
|------------------|--------|
| Required slot | **Compose error** — block generation |
| Optional slot | Omit layer · log warning |
| Deprecated slot | Map to successor · log migration |

---

## Stage ③ — Load Registry Fragments

From [Prompt Library](../studio-asset-registry/prompt-library.md):

```yaml
FragmentLoad:
  recipeId: string | null
  fragmentIds: string[]
  mergeOrder: base → physical → material → lighting → camera → atmosphere
```

| Match type | Fragment behavior |
|------------|-------------------|
| Golden fragment | Use verbatim · bump `promptVersion` ref |
| Compatible fragment | Adapt Genome tokens only |
| No fragment | Compose from Blueprint + sources |

---

## Stage ④ — Merge Layer Stacks

Canonical layer order in `ProductionPrompt™.layers`:

```yaml
layers:
  intent: string              # distilled founder intent (internal)
  base: string
  physical: PhysicalLayer
  architectural: ArchitecturalLayer
  material: MaterialLayer
  lighting: LightingLayer
  atmosphere: AtmosphereLayer | null
  camera: CameraLayer
  workspace: WorkspaceLayer
  genome: GenomeLayer
  registry: RegistryLayerRef[]
  negative: string            # merged NegativePromptStack
```

### Merge Rules

| Conflict | Resolution |
|----------|------------|
| Blueprint vs Genome | Blueprint wins unless `experimental` |
| Registry parent vs new material | Parent wins · delta in `material.override` |
| Two lighting profiles | Higher `qualityTier` wins |
| Workspace vs camera | Workspace framing constraints override camera defaults |

---

## Stage ⑤ — Apply Requirements

### Rendering Requirements™

```yaml
RenderingRequirements:
  resolution: string          # e.g. 3840x1600
  aspectRatio: string         # e.g. 21:9
  outputFormat: glb | png | mp3 | json
  objectIsolation: boolean
  transparentBackground: boolean
  layerIsolation: boolean       # no bleed into sibling layers
  parallaxPlanes: number | null
```

### Quality Requirements™

```yaml
QualityRequirements:
  qualityTier: draft | standard | editorial-luxury | golden-build
  blueprintComplianceMin: number    # 0–1
  perspectiveCompliance: boolean
  genomeMatchMin: number
  validationLoopProfile: string   # Validation Loop™ profile ID
```

---

## Stage ⑥ — Build ProductionPrompt™

Assign identifiers:

```yaml
ProductionPrompt:
  composeId: uuid
  promptVersion: string         # semver + content hash
  promptHash: sha256
  composedAt: ISO8601
  composerVersion: "studio.prompt-composer.v1"
```

`promptVersion` format: `prompt-composer/{date}/{hash8}` — stored on [Canonical Asset Record™](../studio-asset-registry/canonical-asset-record.md).

---

## Stage ⑦ — Validate Compose

| Check | Fail action |
|-------|-------------|
| `layers.base` < 40 tokens | Auto-enrich from Blueprint |
| Missing negative | Inject universal anti-SaaS |
| No blueprint ref | Warning · allow only `draft` tier |
| Simplistic total < 120 tokens | Enrich · log `composeQuality: thin` |
| Blueprint contradiction | **Block** — return to Scene Planner™ |
| Duplicate `promptHash` (24h window) | Link `duplicateOf` · skip re-generation |

---

## Stage ⑧ — Emit

```yaml
ComposeOutput:
  productionPrompt: ProductionPrompt
  brief: ProductionBrief        # audit trail
  skipped: boolean              # true if Exact Match™ reuse
  registryOnlyRef: string | null
```

Handoff → [Provider Optimizer™](./provider-optimizer-handoff.md).

---

## Batch vs Intent Path

| Path | Trigger | Stage differences |
|------|---------|-------------------|
| **Intent Path™** | Founder workstation | Full pipeline · live Genome |
| **Manufacturing Path™** | Asset Compiler™ | Pre-resolved fragments · static Genome from package |

Manufacturing path documented in [compiler-convergence.md](./compiler-convergence.md).

---

## Audit Trail

Every compose writes:

```yaml
ComposeAuditRecord:
  composeId: uuid
  founderIntentId: uuid | null
  lineItemId: string
  sourceHashes: Record<string, sha256>
  durationMs: number
  enrichmentApplied: string[]
  validationResult: pass | warn | block
```

Stored for Studio Alpha™ internal analytics — never founder-facing.

---

_Assembly Pipeline™ — twelve sources merged into one production truth._

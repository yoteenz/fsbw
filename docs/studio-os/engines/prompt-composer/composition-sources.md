# Composition Sources™

**Engine Module:** `studio.prompt-composer.v1.sources`  
**Status:** Twelve mandatory source layers

---

## Law

Every `ProductionPrompt™` must assemble from **all applicable** source layers below. Omitted layers must be explicitly marked `notApplicable` with reason — never silently skipped.

---

## The Twelve Sources

| # | Source | Origin Engine | Contributes |
|---|--------|---------------|-------------|
| 1 | **Company DNA™** | [Company Genome™](../engines/company-genome/README.md) · [Living Company Genome™](../../living-company-genome/README.md) | Brand tone · material language · restraint · sonic identity · editorial direction |
| 2 | **Department Blueprint™** | [Creative Blueprint Engine™](../../creative-blueprint-engine/README.md) | Visual DNA™ · applicable Blueprints™ · Systems™ · inheritance rules |
| 3 | **Workspace Rules™** | [Creative Intelligence Engine™](../../creative-intelligence-engine/workspaces-as-scenes.md) | Physical room constraints · zone context · workstation scene behavior |
| 4 | **Camera Rules™** | Registry `prompt.camera` · Blueprint camera systems | Angle · focal length · isolation · parallax · hero framing |
| 5 | **Architectural Language™** | Blueprint architectural systems · Design Registry™ | Envelope · proportion · column rhythm · negative anti-SaaS architecture |
| 6 | **Lighting Rules™** | Registry lighting profiles · Blueprint lighting systems | Key-fill · rim · volumetric · editorial rig · Genome `lightingStyle` |
| 7 | **Material Library™** | Registry `prompt.material` · Genome `materialLanguage` | Stone · brass · glass · wood vocabulary · PBR behavior hints |
| 8 | **Asset Registry References™** | [Studio Asset Registry™](../studio-asset-registry/README.md) | Reuse refs · compatible assets · prompt fragments · dependency links |
| 9 | **Rendering Requirements™** | Scene Stack™ layer spec · Production Estimate | Resolution · aspect ratio · isolation · output format · layer bleed rules |
| 10 | **Quality Requirements™** | [Validation Loop™](../../engine/validation-loop/README.md) · Golden Build™ gates | Editorial tier · perspective compliance · blueprint fidelity · genome match |
| 11 | **Negative Prompt™** | Registry `prompt.negative` · universal anti-SaaS library | Forbidden patterns · brand guardrails · layer isolation negatives |
| 12 | **Provider Hints™** | Design Registry™ golden models · org policy | Asset type · capability hints · **not** final provider selection |

---

## Source Resolution Order

```
1. Company DNA™          (org-wide guardrails — always first)
2. Department Blueprint™ (scope authority)
3. Workspace Rules™      (scene context)
4. Asset Registry References™ (reuse before invent)
5. Architectural Language™
6. Lighting Rules™
7. Material Library™
8. Camera Rules™
9. Rendering Requirements™
10. Quality Requirements™
11. Negative Prompt™     (merge + dedupe)
12. Provider Hints™      (hints only — Optimizer owns selection)
```

Later layers may **refine** earlier layers. Earlier layers **override** conflicting downstream invention.

---

## Company DNA™

```yaml
CompanyDnaInjection:
  genomeVersion: string
  strands:
    creative: { editorialDirection, restraintLevel, visualMaturity }
    brand: { tone, colorDiscipline, typographySpirit }
    architectural: { scalePreference, materialHeritage }
  founderTaste: FounderTasteGenome
  tokens:
    materialLanguage: string      # resolved — not {{placeholder}} in output
    lightingStyle: string
    sonicIdentity: string | null
```

Fetched from Company Genome™ snapshot at compose time. Hash stored in `ProductionPrompt™.provenance.companyDnaHash`.

---

## Department Blueprint™

```yaml
BlueprintInjection:
  blueprintId: string
  blueprintVersion: string
  visualDna: VisualDnaRef
  systems: BlueprintSystemRef[]
  inheritance: apply-existing | fork | experimental
  promptStack: string[]           # ordered Registry prompt recipe IDs
```

Blueprint is **scope authority** — Composer cannot contradict active Blueprint without `experimental` flag + founder approval.

---

## Workspace Rules™

Per [physical-workspaces.md](../../creative-intelligence-engine/physical-workspaces.md):

| Workspace | Rules injected |
|-----------|----------------|
| Arrival™ | Threshold reveal · first-impression lighting · no clutter |
| Story Table™ | Executive table height · orbiting camera · holographic card zone |
| Mood Wall™ | Double-height · parallax planes · editorial photography |
| Notes Desk™ | Intimate scale · warm task light · desk surface materials |
| Pipeline™ | Command wall legibility · status tile negative space |
| Library™ | Archive shelving · specimen lighting · quiet luxury |

---

## Asset Registry References™

From [Remember-First Law™](../studio-asset-registry/remember-first-law.md):

| Registry outcome | Source contribution |
|------------------|---------------------|
| Exact Match™ | `registryRefs` only — compose skipped |
| Close Match™ | Parent asset prompt layers + delta |
| Generate New™ | Prompt Library fragments · recipes · compatible refs as style anchors |

```yaml
RegistryRef:
  registryId: string
  role: reuse-parent | style-anchor | dependency | fragment
  promptFragmentId: string | null
  usageCount: number
```

---

## Negative Prompt™

Merged stack — never a single string until final serialization:

```yaml
NegativePromptStack:
  universal: string[]        # anti-SaaS · anti-dashboard · anti-browser-chrome
  brand: string[]            # Genome forbidden patterns
  layer: string[]            # category-specific (e.g. no text in hologram)
  blueprint: string[]        # Blueprint compliance negatives
  workspace: string[]        # room-specific forbidden elements
```

Dedupe by semantic hash before merge into `ProductionPrompt™.layers.negative`.

---

## Provider Hints™ (Not Selection)

```yaml
ProviderHints:
  assetType: mesh | image | texture | audio | video | metadata
  capabilityTags: string[]     # e.g. transparent-background, 3d-mesh, editorial
  preferredFamilies: string[]  # fal | openai-images | flux | imagen | bfl
  modelRouteRef: string | null # Design Registry golden route — Optimizer may override
  parameters:
    style: string | null
    guidanceScale: number | null
```

**Law:** Composer emits hints. [Provider Optimizer™](./provider-optimizer-handoff.md) selects actual provider + model.

---

## Example — Editorial Luxury HQ

| Source | Resolved contribution |
|--------|----------------------|
| Company DNA™ | Warm stone · brushed brass · high restraint · editorial maturity |
| Department Blueprint™ | `blueprint-editorial-hq-v2` · Visual DNA™ luxury-atelier |
| Workspace Rules™ | Arrival™ threshold · cinematic reveal |
| Camera Rules™ | Wide establishing · 24mm equivalent · slow dolly motivation |
| Architectural Language™ | Double-height lobby · column rhythm · no glass curtain SaaS |
| Lighting Rules™ | Editorial key · warm fill · volumetric haze |
| Material Library™ | Calacatta · aged brass · frosted glass partitions |
| Registry References™ | `registry:lighting-editorial-rig-v3` style anchor |
| Rendering Requirements™ | 3840×1600 · 21:9 · environment plate |
| Quality Requirements™ | Golden Build™ tier · blueprint fidelity ≥ 0.92 |
| Negative Prompt™ | dashboard · kanban · SaaS UI · readable text · flat icon |
| Provider Hints™ | `image` · `editorial` · families: `[fal, openai-images, imagen]` |

---

_Composition Sources™ — twelve layers, one production brief._

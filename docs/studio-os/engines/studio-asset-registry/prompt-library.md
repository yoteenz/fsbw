# Prompt Library — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.prompt-library`  
**Status:** Reusable prompt intelligence catalog

---

## Purpose

The Registry stores **prompt intelligence** as first-class Registry Items — not loose markdown scattered across department folders.

Studio Asset Compiler™ assembles prompts automatically from the Prompt Library. Founders never write expanded FAL strings.

---

## Prompt Item Types

| Subcategory | ID Pattern | Role |
|-------------|------------|------|
| `prompt.template` | Full generation template | Complete prompt for asset class |
| `prompt.fragment` | Reusable layer | Base · physical · material · lighting slice |
| `prompt.recipe` | Multi-fragment assembly | Ordered stack for complex assets |
| `prompt.negative` | Negative prompt library | Forbidden patterns · anti-SaaS |
| `prompt.modifier` | Genome/Room overlay | Company-specific tone injection |
| `prompt.camera` | Camera directives | Angle · focal length · isolation |
| `prompt.environment` | Environment shells | Room · lobby · atelier |
| `prompt.lighting` | Lighting behavior | Rim · key-fill · volumetric |
| `prompt.material` | Material vocabulary | Marble · brass · frosted glass |
| `prompt.orb` | Orb-specific | Greeting · ceremony · idle |
| `prompt.acrylic` | Acrylic UI panels | Floating menu · inspect overlay |
| `prompt.animation` | Motion directives | Reveal · hover · ceremony |
| `prompt.hologram` | Holographic displays | Law firm · medical · creative |

---

## Prompt Fragment Schema

```json
{
  "registryId": "registry:prompt-fragment-glass-frosted-v1",
  "version": "1.0.0",
  "identity": {
    "name": "Frosted Glass Panel — Base Fragment",
    "category": "prompt",
    "subcategory": "prompt.fragment.glass",
    "reuseCategory": "prompt-glass-panel",
    "creator": { "type": "studio", "id": "studio-os-core" }
  },
  "status": { "lifecycle": "approved", "qualityTier": "golden" },
  "promptContent": {
    "layer": "base",
    "text": "Frosted glass floating inspect panel, polished bevel edge, soft interior bounce, luxury editorial atelier",
    "tokenCount": 24,
    "language": "en"
  },
  "profiles": {
    "generator": {
      "expansionRole": "base-layer",
      "supportedGenerators": ["studio-asset-compiler"],
      "compatibleCategories": ["glass", "acrylic", "ui"],
      "providerHints": {
        "fal": { "weight": 1.0 },
        "openai": { "weight": 0.9 }
      }
    }
  },
  "compatibility": {
    "departments": ["*"],
    "industries": ["*"]
  },
  "tags": ["glass", "frosted", "panel", "inspect", "luxury"]
}
```

---

## Prompt Recipe Schema

Recipes define **ordered assembly** — Compiler Prompt Expansion Engine executes:

```json
{
  "registryId": "registry:prompt-recipe-luxury-marble-environment-v1",
  "identity": {
    "name": "Luxury Marble Environment Recipe",
    "category": "prompt",
    "subcategory": "prompt.recipe.environment"
  },
  "promptContent": {
    "type": "recipe",
    "layers": [
      { "ref": "registry:prompt-fragment-environment-atelier-v1", "role": "base", "required": true },
      { "ref": "registry:prompt-fragment-material-marble-calacatta-v1", "role": "material", "required": true },
      { "ref": "registry:prompt-fragment-lighting-editorial-rim-v1", "role": "lighting", "required": true },
      { "ref": "registry:prompt-fragment-camera-product-3q-v1", "role": "camera", "required": false },
      { "ref": "registry:prompt-negative-saas-v1", "role": "negative", "required": true }
    ],
    "assemblyOrder": "base → material → lighting → camera → genomeModifiers → negative"
  }
}
```

---

## Negative Prompt Library

Centralized forbidden patterns — Design Language compliance:

```json
{
  "registryId": "registry:prompt-negative-saas-v1",
  "identity": {
    "name": "Anti-SaaS Negative Library",
    "subcategory": "prompt.negative.saas"
  },
  "promptContent": {
    "text": "SaaS dashboard, kanban board, sticky notes, flat UI mockup, stock photo office, fluorescent lighting, cubicle farm, generic corporate clipart",
    "scope": "global",
    "severity": "error"
  }
}
```

Quality Engine rejects expanded prompts missing required negatives.

---

## Genome Modifier Fragments

Company Genome™ injects via modifier fragments:

```json
{
  "registryId": "registry:prompt-modifier-frontal-slayer-material-v1",
  "identity": {
    "subcategory": "prompt.modifier.genome"
  },
  "promptContent": {
    "genomeSlot": "materialLanguage",
    "template": "Editorial luxury marble and brass, high-contrast noir accents, {materialLanguage}",
    "binds": ["materialLanguage", "editorialDirection"]
  },
  "compatibility": {
    "companyGenome": {
      "organizationIds": ["frontal-slayer"]
    }
  }
}
```

---

## Room DNA Modifier Fragments

```json
{
  "registryId": "registry:prompt-modifier-room-dna-luxury-v1",
  "promptContent": {
    "sliderBindings": [
      { "slider": "luxuryLevel", "threshold": 0.7, "append": "ultra-premium materials, museum-quality finishes" },
      { "slider": "editorialLevel", "threshold": 0.8, "append": "fashion editorial lighting, Vogue atelier atmosphere" }
    ]
  }
}
```

Sourced from `room-dna.json` `promptModifiers` in Department Definitions.

---

## Compiler Assembly Flow

```
Department fal-prompt-package/*.md (source fragments)
         ↓
Resolve to Registry prompt refs (migrate on register)
         ↓
Prompt Expansion Engine:
  1. Load recipe OR build from fragment refs
  2. Apply asset manifest physical layer
  3. Inject genome modifier fragments
  4. Inject room DNA modifier fragments
  5. Append negative libraries
  6. Apply provider profile parameters
         ↓
Write 13_prompts/{assetId}.json (ExpandedPromptStack)
```

See [prompt-expansion-engine.md](../studio-asset-compiler/prompt-expansion-engine.md).

---

## Prompt Library Index

`RegistrySnapshot.promptLibrary` — fast Compiler lookup:

```yaml
PromptIndexEntry:
  registryId: string
  subcategory: string
  expansionRole: string          # base · material · lighting · negative · ...
  compatibleCategories: string[]
  reuseCategory: string
  genomeSlots: string[]
```

---

## Seeded Prompt Library (v1)

From Creative Direction Studio™ `fal-prompt-package/`:

| Source File | Registry ID | Subcategory |
|-------------|-------------|-------------|
| `environment.md` | `registry:prompt-fragment-environment-atelier-v1` | `prompt.fragment.environment` |
| `lighting.md` | `registry:prompt-fragment-lighting-editorial-rim-v1` | `prompt.fragment.lighting` |
| `materials.md` | `registry:prompt-fragment-material-marble-v1` | `prompt.fragment.material` |
| `objects.md` | `registry:prompt-fragment-glass-frosted-v1` | `prompt.fragment.glass` |
| `furniture.md` | `registry:prompt-fragment-furniture-executive-v1` | `prompt.fragment.furniture` |
| `orb.md` | `registry:prompt-fragment-orb-greeting-v1` | `prompt.fragment.orb` |
| `acrylic.md` | `registry:prompt-fragment-acrylic-menu-v1` | `prompt.fragment.acrylic` |
| `camera.md` | `registry:prompt-fragment-camera-product-3q-v1` | `prompt.fragment.camera` |
| `negative.md` | `registry:prompt-negative-saas-v1` | `prompt.negative.saas` |
| `hologram.md` | `registry:prompt-fragment-hologram-display-v1` | `prompt.fragment.hologram` |
| `animation.md` | `registry:prompt-fragment-animation-reveal-v1` | `prompt.fragment.animation` |
| `audio.md` | `registry:prompt-fragment-audio-ambient-v1` | `prompt.fragment.audio` |
| `vfx.md` | `registry:prompt-fragment-vfx-dust-v1` | `prompt.fragment.vfx` |
| `interaction.md` | `registry:prompt-fragment-interaction-inspect-v1` | `prompt.fragment.interaction` |
| `genome.md` | `registry:prompt-modifier-genome-universal-v1` | `prompt.modifier.genome` |

---

## Fragment Reuse (Smart Reuse)

Before expanding, Compiler checks Prompt Library reuse:

| Check | Result |
|-------|--------|
| Exact fragment exists for asset | Link · skip expansion write |
| Recipe covers asset category | Execute recipe · skip hand assembly |
| Genome modifier exists for org | Inject · no custom writing |
| Negative library current | Append · compliance pass |

Prompt reuse counts toward `metrics.reusePercentage`.

---

## Versioning Prompt Items

| Change | Version Bump |
|--------|--------------|
| Wording tweak (same semantics) | PATCH |
| New genome binding | MINOR |
| Layer reorder in recipe | MINOR |
| Removed required layer | MAJOR |
| Negative pattern change affecting QA | MINOR |

Prompt changes trigger **dependent asset recompile recommendation** in impact analysis.

---

## Pack Prompt Bundles

Packs may ship prompt collections:

```
registry:pack-luxury-salon-v1
  └── promptBundle:
        - registry:prompt-recipe-salon-environment-v1
        - registry:prompt-fragment-salon-lighting-v1
        - registry:prompt-modifier-salon-genome-v1
```

Pack purchase injects prompt items into org-scoped snapshot.

---

## Quality Gates

| Gate | Rule |
|------|------|
| No empty fragments | `promptContent.text` required |
| Recipe acyclic | Fragment deps resolve |
| Negative coverage | Environment + furniture recipes include negative ref |
| Token budget | Expanded stack ≤ provider max (warn) |
| Genome slot validity | Modifier binds exist in Company Genome |
| Duplicate detection | `promptHash` in expanded output unique per asset |

---

_Prompt Library — intelligence stored, not scattered._

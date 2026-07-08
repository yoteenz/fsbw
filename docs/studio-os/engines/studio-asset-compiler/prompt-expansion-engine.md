# Prompt Expansion Engine — Studio Asset Compiler™

**Engine Module:** `studio.asset-compiler.v1.prompt-expansion`  
**Status:** Heart of manufacturing — never simplistic prompts

---

## Principle

> Input: `Glass Panel`. Output: a **complete generation specification** — material · thickness · transparency · lighting behavior · Genome adaptation · negative prompts · resolution · isolation — everything required for premium generation.

Founders and designers **never write** expanded prompts. The Prompt Expansion Engine derives them from Department Definition + Genomes.

---

## Expansion Pipeline

```
Source (fal-prompt-package/*.md fragment)
    +
Asset manifest entry (dimensions · material · zone)
    +
Asset blueprint (behavior · genome slots)
    +
Room DNA™ promptModifiers
    +
Company Genome™ layers
    +
Project Genome™ overlay (if present)
    +
Design Language™ tokens
    +
Provider profile parameters
         ↓
ExpandedPromptStack (written to 13_prompts/{assetId}.json)
```

---

## Expanded Prompt Stack Schema

```json
{
  "$schema": "studio.asset-compiler.v1/expanded-prompt.json",
  "assetId": "glass-panels-cds",
  "departmentId": "creative-direction",
  "category": "glass",
  "packageFolder": "05_glass/",

  "sourcePromptRef": "fal-prompt-package/objects.md",
  "expandedAt": "2026-07-08T00:00:00Z",
  "promptHash": "sha256:…",

  "layers": {
    "base": "Frosted glass floating inspect panel, luxury editorial atelier",
    "physical": {
      "dimensions": { "widthM": 0.5, "heightM": 0.35, "depthM": 0.02 },
      "thickness": "8mm apparent",
      "transparency": 0.72,
      "edgeFinish": "polished-bevel-soft-glow"
    },
    "material": {
      "primary": "frosted-glass-genome-tint",
      "genomeSlot": "materialLanguage",
      "reflectionBehavior": "soft-interior-bounce",
      "refractionIndex": 1.52
    },
    "lighting": {
      "behavior": "rim-accent-from-editorial-rig",
      "genomeSlot": "lightingStyle",
      "keyFillRatio": "inherit-stage-08"
    },
    "camera": {
      "angle": "product-three-quarter-30deg",
      "focalLength": "85mm equivalent",
      "isolation": "transparent-background"
    },
    "roomAdaptation": {
      "roomDnaSliders": ["glassLevel", "luxuryLevel", "editorialLevel"],
      "zoneContext": "inspect-overlay-any-zone"
    },
    "brandAdaptation": {
      "genomeDomains": ["materialLanguage", "editorialDirection"],
      "industryPreset": null
    },
    "scale": {
      "humanReference": "hand-height-floating",
      "worldUnits": "meters"
    },
    "genome": {
      "injectionSlots": ["materialLanguage"],
      "tokens": {
        "materialLanguage": "{{genome.materialLanguage}}",
        "editorialDirection": "{{genome.editorialDirection}}"
      }
    },
    "negative": "UI mockup, dashboard card, browser chrome, readable text, buttons, SaaS widget, flat icon",
    "reuseTags": ["glass-inspect-panels", "floating-context-panel"]
  },

  "generation": {
    "resolution": "2048x2048",
    "aspectRatio": "1:1",
    "outputFormat": "glb",
    "objectIsolation": true,
    "transparentBackground": true,
    "qualityTier": "editorial-luxury"
  },

  "provider": {
    "preferred": ["fal", "openai"],
    "assetType": "mesh",
    "modelRoute": "design-registry/golden-models/glass-object",
    "parameters": {
      "style": "architectural-product",
      "guidanceScale": 7.5
    }
  }
}
```

---

## Expansion Rules by Category

| Category | Always Expanded |
|----------|-----------------|
| Environment | scale · depth planes · atmosphere · Genome exterior · 21:9 resolution |
| Architecture | envelope proportions · material families · column count · negative anti-SaaS |
| Furniture | human-scale height · clearance · wood/stone Genome · product isolation |
| Glass | thickness · transparency · edge · refraction · rim lighting |
| Hologram | glow volume · internal luminance · no literal UI text |
| Audio | stem character · Genome sonicIdentity · ceremony weight from Founder Journey |
| Particles | density from Room DNA calmLevel · luxury dust vs minimal editorial |

---

## Example — Living Mood Wall™

**Input fragment:** `fal-prompt-package/mood-wall.md` one-paragraph prompt

**Compiler expands to:**

- 14m × 5.5m dimensions · double-height hero
- 3 parallax depth planes
- `photographyDirection` + `customerEmotions` Genome layers
- Editorial key light motivation from stage 08
- 21:9 environment plate + separate mesh isolation pass
- Negative: whiteboard · kanban · Pinterest UI
- Reuse: `interactive-wall-hero`
- Stage: 06 (Interactive Objects)
- Dependencies: env-shell-cds, lighting-rig-cds

---

## Dedupe & Reuse

Before writing `13_prompts/`, Expansion Engine checks Design Registry™:

| Match | Action |
|-------|--------|
| `reuseCategory` + Genome hash match | Mark `reusedFrom` · skip prompt regen · link existing asset |
| Partial match | Adapt layer only (material swap) |
| No match | Full expansion |

Reuse percentage recorded in `package-manifest.json`.

---

## Quality Hooks (Pre-Write)

| Check | Action |
|-------|--------|
| Duplicate prompt hash | Merge or flag warning |
| Missing negative prompt | Inject universal anti-SaaS negative |
| Genome slot unresolved | Compile error |
| Simplistic prompt (< 80 tokens expanded) | Auto-enrich from blueprint |

---

## Output Location

```
13_prompts/
├── index.json                    # Asset ID → prompt file map
├── env-shell-cds.json
├── wall-mood-cds.json
├── glass-panels-cds.json
├── lighting-rig-cds.json
└── …
```

Provider-agnostic JSON — FAL adapter maps to API payload per [provider-abstraction.md](./provider-abstraction.md).

---

## Relationship to engine/asset-compiler/03_PROMPT_COMPILER.md

This document is the **manufacturing-layer** view. Deep prompt layer taxonomy lives in [`engine/asset-compiler/03_PROMPT_COMPILER.md`](../../engine/asset-compiler/03_PROMPT_COMPILER.md). Schemas are compatible; folder output adds `13_prompts/` expanded JSON format.

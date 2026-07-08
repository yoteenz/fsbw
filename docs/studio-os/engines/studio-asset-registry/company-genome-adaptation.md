# Company Genome Adaptation — Studio Asset Registry™

**Engine Module:** `studio.asset-registry.v1.genome-adaptation`  
**Status:** One asset · many company souls

---

## Principle

> The same chair should feel different inside Frontal Slayer, NDXBook, Luxury Salon, Law Firm, Restaurant, Music Studio, and Construction HQ — **without becoming different assets**.

Adaptation occurs through **Company Genome™** and **Room DNA™** — not duplicate Registry entries.

---

## Adaptation vs Duplication

| Approach | Registry Entries | Generation Cost | Consistency |
|----------|------------------|-----------------|-------------|
| **Duplicate per brand** | N companies × M assets | High | Low — drift |
| **Genome adaptation** | 1 asset · N overlays | Low | High — single source |

Registry mandates genome adaptation as **default**. Duplication requires justification (recorded in `revisionHistory`).

---

## Genome Slots on Registry Items

Physical assets declare **genome slots** — runtime shader/material/voice fields:

```json
{
  "profiles": {
    "runtime": {
      "genomeSlots": ["materialLanguage", "colorSystem", "editorialDirection"],
      "replaceable": true
    }
  },
  "compatibility": {
    "companyGenome": {
      "compatible": true,
      "genomeSlots": ["materialLanguage", "colorSystem", "editorialDirection"],
      "adaptationProfile": "registry:genome-adapt-furniture-luxury-v1"
    }
  }
}
```

| Slot | Typical Use |
|------|-------------|
| `materialLanguage` | Upholstery · surface · finish tone |
| `colorSystem` | Brand accent · trim · edge glow |
| `editorialDirection` | Photography mood · contrast |
| `lightingStyle` | Key-fill character on object |
| `voice` | Concierge · UI copy register |
| `sonicIdentity` | Audio sting · ambient character |
| `photographyDirection` | Marketing still framing |
| `customerEmotions` | Interaction warmth |

Slots are **references**, not baked values. Runtime resolves from live Company Genome snapshot.

---

## Adaptation Profiles

Reusable adaptation recipes register as Registry items:

```json
{
  "registryId": "registry:genome-adapt-furniture-luxury-v1",
  "identity": {
    "category": "genome-preset",
    "subcategory": "genome-adapt.furniture"
  },
  "adaptationRules": {
    "targetCategories": ["furniture", "prop"],
    "slotMappings": [
      {
        "slot": "materialLanguage",
        "resolver": "interpolate-genome-value",
        "fallback": "neutral-luxury-leather"
      },
      {
        "slot": "colorSystem",
        "resolver": "brand-accent-from-genome",
        "applyTo": ["trim", "edge-glow", "stitching"]
      }
    ],
    "industryClamps": {
      "law": { "luxuryLevel": { "min": 0.6 }, "warmthLevel": { "max": 0.4 } },
      "beauty": { "editorialLevel": { "min": 0.7 } }
    }
  }
}
```

---

## Company Examples — Same Chair

**Asset:** `registry:executive-chair-luxury-v3`

| Organization | Genome Expression | Perceived Difference |
|--------------|-------------------|----------------------|
| **Frontal Slayer** | Noir marble · brass · high editorial | Fashion-forward executive power |
| **NDXBook** | Media command · crisp · broadcast | Authoritative media chair |
| **Luxury Salon** | Warm blush · soft gold · intimate | Client consultation elegance |
| **Law Firm** | Dark walnut · restrained brass · formal | Traditional authority |
| **Restaurant** | Warm wood · terracotta accent · inviting | Hospitality warmth |
| **Music Studio** | Matte black · neon accent · creative | Producer creative energy |
| **Construction HQ** | Industrial steel · safety orange accent | Rugged professionalism |

**One mesh. Seven souls.** Runtime applies slots at mount — no recompile required for live adaptation.

---

## Room DNA™ Overlay

Room DNA sliders modulate asset presentation within a department:

```json
{
  "compatibility": {
    "roomDna": {
      "sliderInfluence": ["luxuryLevel", "editorialLevel", "warmthLevel", "glassLevel"],
      "presets": ["creative-direction-golden", "law-office-formal"]
    }
  }
}
```

| Slider | Effect on Asset |
|--------|-----------------|
| `luxuryLevel` | Material quality tier · detail density |
| `editorialLevel` | Lighting contrast · composition drama |
| `warmthLevel` | Color temperature · ambient tone |
| `glassLevel` | Transparency · frosted intensity on glass assets |

Room DNA from `room-dna.json` in Department Definitions. Compiler passes slider snapshot into expanded prompts; Runtime applies live.

---

## Adapt Reuse Flow

```
Compiler: asset-manifest entry (executive-chair-law)
         ↓
Reuse Engine: match registry:executive-chair-luxury-v3 (adapt, score 87)
         ↓
Link mesh artifact (no regen)
         ↓
Expand overlay prompts only:
  - genome modifier for law-firm org
  - room DNA formal preset
  - industry clamp rules
         ↓
package-manifest.json:
  registryResolutions[].adaptationMode: genome-overlay
         ↓
Runtime mounts chair + resolves genome slots from live org snapshot
```

---

## Company Genome Presets (Registry Items)

Pre-built genome configurations accelerate onboarding:

```json
{
  "registryId": "registry:genome-preset-law-firm-v1",
  "identity": {
    "category": "genome-preset",
    "subcategory": "genome-preset.law-firm"
  },
  "genomeSnapshot": {
    "materialLanguage": "dark-walnut-brass-restrained",
    "lightingStyle": "formal-balanced-no-drama",
    "editorialDirection": "authoritative-trustworthy",
    "colorSystem": { "primary": "genome-slot", "accent": "brass-muted" },
    "thingsWeNeverDo": ["neon", "playful-emoji", "casual-slang"]
  },
  "compatibility": {
    "industries": ["law"],
    "recommendedPacks": ["registry:pack-law-office-v1"]
  }
}
```

Organization Genome™ (M95) remains authoritative — presets are **starting points**, not overrides.

---

## Brand Adaptability Score

`scores.genomeAdaptability` (0–100) measures how well an asset adapts:

| Factor | Weight |
|--------|--------|
| Genome slot count | 30% |
| `replaceable: true` on runtime profile | 20% |
| Industry diversity in compatibility | 20% |
| Proven adaptations in usageHistory | 20% |
| Adaptation profile exists | 10% |

High adaptability → prioritized in Smart Reuse across industries.

---

## Things We Never Do

Company Genome `thingsWeNeverDo[]` gates Registry compatibility:

```
Compiler + Runtime check:
  asset.promptSource + genome overlay
  MUST NOT violate thingsWeNeverDo

Example: Frontal Slayer never "stock photo office"
  → Quality Engine error if negative library missing
  → Runtime blocks incompatible marketing stills
```

---

## Genome Incompatibility Handling

When asset genome slots ⊄ org genome:

| Fallback | Order |
|----------|-------|
| 1. Find alternate Registry item with compatible slots | Reuse |
| 2. Inherit parent prompt · generate delta | Inherit |
| 3. Full generation with genome-compliant prompt | Generate |
| 4. Block compile with build-report error | Abort |

Never silently mount with missing slots.

---

## Pack + Genome Interaction

Pack purchases may include genome presets:

```
pack-law-office-v1
  └── genomePresets: [registry:genome-preset-law-firm-v1]
         ↓
Optional apply on injection (founder confirms)
         ↓
Org Genome enriched · assets adapt consistently
```

Pack does not replace Organization Genome™ — offers curated alignment.

---

## Validation Criteria

| Check | Rule |
|-------|------|
| Slot declaration | Interactive assets declare ≥ 1 genome slot |
| Adaptation profile | Furniture · glass · lighting have profiles |
| Industry clamps | Law · medical presets include restraint rules |
| No baked brand | Artifacts must not embed org-specific hex/logo |
| Cross-org test | Golden asset validates against ≥ 3 genome presets |
| Room DNA binding | Department assets declare slider influence |

Creative Direction Studio™ `company-genome-adaptation.md` is the golden reference for adaptation behavior.

---

## Telemetry

| Metric | Use |
|--------|-----|
| `adaptationsApplied` | Per item · per org |
| `genomeSlotResolutionFailures` | Quality signal |
| `industryDistribution` | Search ranking boost |

Feeds `scores.genomeAdaptability` over time.

---

_Company Genome Adaptation — one library, infinite expression._

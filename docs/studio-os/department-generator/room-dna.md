# Room DNA™

**Schema ID:** `studio.department-generator.v1.room-dna`  
**Output file:** `room-dna.json`  
**Status:** Aesthetic gene slider system

---

## Purpose

**Room DNA™** exposes aesthetic **sliders** used to generate and regenerate any department room. Same topology · variable soul — sliders drive prompt compilation across environment and asset blueprints.

Distinct from **Department DNA™** (what kind of place) and **Company Genome™** (whose place). Room DNA is the **aesthetic gene vector** for this specific generated instance.

---

## Slider Dimensions

| Slider | ID | Range | Low Pole | High Pole |
|--------|-----|-------|----------|-----------|
| **Luxury Level** | `luxury` | 0–1 | Utilitarian | Ultra-luxury editorial |
| **Innovation Level** | `innovation` | 0–1 | Traditional | Futuristic |
| **Minimalism** | `minimalism` | 0–1 | Maximalist layered | Severe restraint |
| **Warmth** | `warmth` | 0–1 | Cool clinical | Warm inviting |
| **Technology** | `technology` | 0–1 | Analog craft | High-tech holographic |
| **Corporate** | `corporate` | 0–1 | Boutique intimate | Enterprise formal |
| **Playfulness** | `playfulness` | 0–1 | Serious gravitas | Playful energetic |
| **Creativity** | `creativity` | 0–1 | Operational functional | Exploratory artistic |
| **Glass** | `glass` | 0–1 | Opaque solid | Glass-dominant |
| **Wood** | `wood` | 0–1 | No wood | Rich wood grain |
| **Stone** | `stone` | 0–1 | No stone | Stone marble emphasis |
| **Chrome** | `chrome` | 0–1 | Matte organic | Polished chrome accents |
| **Brand Personality** | `brandPersonality` | enum | Genome-derived | — |

---

## Room DNA Schema

```json
{
  "$schema": "studio.department-generator.v1/room-dna.json",
  "departmentId": "creative-direction",
  "version": "1.0.0",
  "resolvedAt": "2026-07-08T00:00:00Z",

  "sliders": {
    "luxury": 0.92,
    "innovation": 0.55,
    "minimalism": 0.68,
    "warmth": 0.75,
    "technology": 0.48,
    "corporate": 0.22,
    "playfulness": 0.35,
    "creativity": 0.95,
    "glass": 0.80,
    "wood": 0.45,
    "stone": 0.30,
    "chrome": 0.40
  },

  "brandPersonality": {
    "source": "company-genome",
    "archetype": "creator-editor",
    "voiceRegister": "editorial-luxury",
    "thingsWeNeverDo": ["popup-modals", "dashboard-chrome"]
  },

  "materialBias": {
    "primary": ["brushed-brass", "frosted-glass", "walnut"],
    "accent": ["marble-vein-subtle", "linen-upholstery"],
    "forbidden": ["neon-plastic", "stock-photo-frames"]
  },

  "promptModifiers": {
    "environment": "Double-height editorial atelier, luxury architecture studio, generous negative space",
    "lighting": "Warm key 3200K editorial three-point, soft fill, controlled rim",
    "furniture": "Bespoke editorial furniture, low-profile luxury, no office cubicle aesthetics"
  },

  "regenerationScopes": {
    "lighting-only": { "affectedSliders": ["warmth", "luxury"], "preserveTopology": true },
    "materials-only": { "affectedSliders": ["wood", "stone", "glass", "chrome"], "preserveTopology": true }
  }
}
```

---

## Slider → Prompt Translation

| Slider Value | Compiler Effect |
|--------------|-----------------|
| `luxury: 0.9+` | Premium materials · ceremony weight · negative space |
| `innovation: 0.8+` | Holographic objects · floating UI surfaces |
| `minimalism: 0.8+` | Fewer decor tasks · larger void volumes |
| `glass: 0.8+` | Window task priority · glass partition objects |
| `corporate: 0.7+` | Conference table · formal seating layout |

Room DNA injects into every `prompts/*.md` file and per-asset FAL prompts.

---

## Genome Interaction

```
Company Genome™ (apex identity)
         ↓ constrains
Room DNA™ sliders (instance aesthetic)
         ↓ compiles into
Environment + Asset prompt stacks
```

Genome may **clamp** sliders (law firm: low `playfulness` max). Room DNA never violates Genome `thingsWeNeverDo`.

---

## Future Room Generation

Same Room DNA slider set generates:
- Creative Direction Studio™
- Law firm intake room
- Salon consultation suite

**Different** `departmentId` + DNA topology · **same** slider machinery.

---

## Relationship to Engine

| Concept | Engine location |
|---------|-----------------|
| Department DNA™ | `engine/department-generator/03_DEPARTMENT_DNA.md` |
| Genome injection | `engine/department-generator/10_GENOME_INJECTION.md` |
| Regeneration scopes | `engine/department-generator/14_REGENERATION_SYSTEM.md` |

Room DNA™ is the **slider snapshot** at generation time — stored in package for surgical regen.

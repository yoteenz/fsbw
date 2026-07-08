# Set DNA™ — Environment Blueprint Schema

**Version:** 1.0.0  
**Status:** Canonical schema (docs only)  
**Schema ID:** `studio.set-dna.v1`  
**Predecessor expression:** Room DNA™ (`room-dna.json`)

---

## Purpose

Every Set™ is generated from a reusable **Set DNA™** profile.

Set DNA™ is the **blueprint for environment generation** — architecture · lighting · materials · behavior · audio · objects · emotion.

Uniqueness of any Set™ comes from **Set DNA™ + Company Genome™ + Department Definition** — never hardcoded per-department code.

---

## Set DNA™ Fields

| Field | Description | Generation influence |
|-------|-------------|---------------------|
| **Purpose** | Why this Set exists · what work happens here | Layout priority · object selection |
| **Primary Emotion** | Target founder feeling | [Emotional Design](../foundational-experience-systems/emotional-design-principle.md) |
| **Architectural Style** | Envelope · proportion · ceiling · threshold | Environment mesh · FAL prompts |
| **Lighting Style** | Key · fill · rim · ceremony | Light rig · atmosphere |
| **Materials** | Floor · wall · accent surfaces | Shader · texture generation |
| **Furniture** | Tables · seating · fixtures | Object manifest |
| **Camera Language** | Arrival glide · hero framing · walk path | Arrival Sequence™ |
| **Movement Style** | Founder pace · zone transitions | Navigation feel |
| **Audio Profile** | Ambient · sting · environmental SFX | Audio system |
| **Particle System** | Dust · motes · hologram sparkle | Idle Life™ tier |
| **Interactive Objects** | Hero + supporting Studio Objects | Object manifest |
| **Hero Asset** | Primary interactive centerpiece | Production group hero |
| **Orb Behavior** | Greeting · idle · proactive register | Orb runtime profile |
| **Animation Style** | Easing · ceremony weight · motion density | Animation compiler |
| **Brand Genome Influence** | How Company Genome™ modulates Set | Genome injection weights |
| **Industry Influence** | Vertical adaptation (law · fashion · medical) | Marketplace adaptation |
| **Department Personality** | Voice · formality · energy | Concierge + Orb copy |

---

## Set DNA™ Schema (Canonical)

```json
{
  "setDna": {
    "schemaVersion": "studio.set-dna.v1",
    "setId": "creative-atelier-v1",
    "displayName": "Creative Atelier™ Set",
    "departmentId": "creative-direction",

    "purpose": "Living creative brain — direction · mood · brief · approval",
    "primaryEmotion": "inspired",

    "architecturalStyle": {
      "envelope": "editorial-stage",
      "ceilingHeight": "double-height",
      "threshold": "marble-portal",
      "circulation": "open-sightlines"
    },

    "lightingStyle": {
      "key": "warm-editorial-drama",
      "fill": "soft-ambient",
      "rim": "brass-accent",
      "ceremony": "approval-gold-pulse"
    },

    "materials": {
      "floor": ["marble", "warm-stone"],
      "walls": ["editorial-plaster", "glass-pins"],
      "accents": ["brass", "rose-gold"]
    },

    "furniture": {
      "primary": ["timeline-table", "brief-wall", "reference-shelves"],
      "secondary": ["founder-seat", "observatory-rail"]
    },

    "cameraLanguage": {
      "arrivalPreset": "portal-glide-hero-mood-wall",
      "heroFrame": "mood-wall-center",
      "walkHeight": "founder-eye-level"
    },

    "movementStyle": {
      "pace": "editorial-calm",
      "zoneTransition": "walk-fade"
    },

    "audioProfile": {
      "ambient": "warm-room-tone-editorial",
      "arrivalSting": "soft-brass-bloom",
      "idleTexture": "distant-creative-activity"
    },

    "particleSystem": {
      "enabled": true,
      "tier": "subtle-dust-keylight",
      "maxCount": 12
    },

    "interactiveObjects": [
      { "objectId": "living-mood-wall", "role": "hero" },
      { "objectId": "founder-notes", "role": "supporting" },
      { "objectId": "brief-wall", "role": "supporting" }
    ],

    "heroAsset": {
      "objectId": "living-mood-wall",
      "productionGroupId": "environment"
    },

    "orbBehavior": {
      "profileId": "orb-creative-atelier-v1",
      "greetingRegister": "confident-editorial",
      "idleProfile": "orb-breath-editorial"
    },

    "animationStyle": {
      "easing": "luxury-ease-out",
      "ceremonyWeight": 0.85,
      "motionDensity": "medium"
    },

    "brandGenomeInfluence": {
      "materialLanguage": 0.9,
      "lightingStyle": 0.85,
      "editorialDirection": 0.92,
      "voice": 0.8
    },

    "industryInfluence": {
      "packId": null,
      "adaptationStrength": 0.7
    },

    "departmentPersonality": {
      "energy": "creative-luxury",
      "formality": "editorial-not-corporate",
      "proactivity": "sparse-helpful"
    },

    "signatureColors": {
      "primary": "#C9A962",
      "accent": "#EB1C24",
      "ambient": "#1a1816"
    },

    "sliders": {
      "luxuryLevel": 0.88,
      "editorialLevel": 0.92,
      "warmthLevel": 0.78,
      "calmLevel": 0.72,
      "glassLevel": 0.85
    },

    "forbiddenFeeling": ["generic-saas", "cold-corporate", "startup-clutter"],
    "defaultFeeling": ["inspired", "editorial", "luxurious", "calm-creative"]
  }
}
```

---

## Relationship to Room DNA™

| Room DNA™ (existing) | Set DNA™ (canonical) |
|----------------------|----------------------|
| `room-dna.json` in department package | `set-dna.json` (future artifact name) |
| Sliders · feeling · prompt modifiers | Full environment blueprint |
| Alpha Golden Build uses Room DNA | Sets™ canon supersedes vocabulary |

**Migration law (future):** Room DNA fields map into Set DNA™ — no loss of alpha work. File rename deferred until explicit implementation sprint.

| Room DNA field | Set DNA field |
|--------------|---------------|
| `sliders` | `setDna.sliders` |
| `defaultFeeling` | `setDna.defaultFeeling` |
| `forbiddenFeeling` | `setDna.forbiddenFeeling` |
| `promptModifiers` | Compiled into generation prompts via Set DNA |

---

## Set DNA™ Compilation Pipeline

```
Set DNA™
    + Department Definition
    + Company Genome™
    + Project Genome™
         ↓
Studio Builder™ prompt compiler
         ↓
FAL environment generation
         ↓
Studio Asset Registry™
         ↓
Department Runtime assembles Set™
```

**Future:** [future-set-generator.md](./future-set-generator.md)

---

## DNA Inheritance

| Source | What Set DNA inherits |
|--------|----------------------|
| **Company Genome™** | Materials · voice · color · editorial |
| **Industry Pack** | Vertical furniture · compliance cues |
| **Department Definition** | Purpose · zones · object roles |
| **Founder Journey™** | Arrival length · ceremony · Orb chattiness |

Set DNA™ defines **Set personality**. Genomes **modulate** it.

---

## Validation

Set DNA™ must pass:

| Gate | Validator |
|------|-----------|
| Schema complete | `studio.set-dna.v1` |
| Hero object declared | Required |
| Primary emotion declared | Emotional Design Principle |
| Arrival + Idle profiles referenced | Foundational Experience Systems |
| No page/dashboard vocabulary in purpose field | Sets philosophy |

---

## Cross-References

- [Sets philosophy](./sets-philosophy.md)
- [Set registry](./set-registry.md)
- [Room DNA alpha](../alpha/room-layout.md)
- [Environment storytelling](../alpha/environment-storytelling.md)

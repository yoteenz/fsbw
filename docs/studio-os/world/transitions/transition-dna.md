# Transition DNA™

**Version:** 1.0.0  
**Status:** Canonical schema (docs only)  
**Schema ID:** `studio.transition-dna.v1`

---

## Purpose

Every transition between Sets™ inherits a **Transition DNA™** profile — the blueprint for how a specific journey feels, adapts, and tells story.

Transition DNA™ compiles from genome · department · business state · journey context.

---

## Inherited Context

Every transition adapts from:

| Source | Modulates |
|--------|-----------|
| **Company Genome™** | Materials · voice · brand signage |
| **Department personality** | Source + destination Set tone |
| **Architectural language** | Headquarters shared lot grammar |
| **Lighting language** | Handoff curves between Sets™ |
| **Audio profile** | Crossfade · ambient continuity |
| **Brand identity** | Signage · material accents |
| **Founder Journey™** | Pacing · ceremony · Orb chattiness |
| **Time of day** | Key light warmth · exterior visibility |
| **Current business state** | Operational ambient density |
| **Launch Day™** | Elevated ceremony · brighter path |
| **Celebration™** | Warm accents · subtle festivity |
| **Crisis™** | Urgent pacing · focused Orb · reduced idle |
| **Adaptive Walk™** | Route selection · priority destinations |

The journey itself **adapts** — same edge type · different DNA expression.

---

## Transition DNA™ Fields

| Field | Description |
|-------|-------------|
| `transitionId` | Stable edge identifier |
| `transitionTypeId` | Walk · Elevator · Skybridge · … |
| `fromSetId` | Origin Set™ |
| `toSetId` | Destination Set™ |
| `durationMs` | Base duration (modulated by journey) |
| `cameraPreset` | Camera choreography profile |
| `movementSpeed` | Walk pace · elevator speed |
| `lightingHandoff` | Source → corridor → destination curve |
| `audioCrossfade` | Ambient blend profile |
| `signage` | Environmental department markers |
| `storytellingBeats` | Optional narrative moments |
| `orbGuidanceScript` | Context lines during journey |
| `streamingProfile` | World streaming tier |
| `idleLifeDuring` | `continue` \| `reduce` \| `ceremony-hold` |
| `genomeWeights` | Material · voice injection |
| `journeyModifiers` | Founder Journey stage multipliers |
| `stateModifiers` | Launch · Celebration · Crisis overlays |

---

## Canonical Schema

```json
{
  "transitionDna": {
    "schemaVersion": "studio.transition-dna.v1",
    "transitionId": "creative-atelier-to-discovery-lab-glass-hallway",
    "transitionTypeId": "glass-hallway-v1",
    "fromSetId": "creative-atelier-v1",
    "toSetId": "discovery-lab-v1",

    "durationMs": 7000,
    "cameraPreset": "glass-corridor-vista-dolly-v1",
    "movementSpeed": "editorial-walk",

    "lightingHandoff": {
      "from": "warm-editorial-key",
      "corridor": "glass-rim-transparency",
      "to": "curious-cool-discovery"
    },

    "audioCrossfade": {
      "fromAmbient": "creative-atelier-room-tone",
      "corridorAmbient": "glass-corridor-footsteps-light",
      "toAmbient": "discovery-lab-data-hum",
      "crossfadeMs": 1200
    },

    "signage": {
      "environmental": ["DISCOVERY LAB →", "RESEARCH WING"],
      "material": "brass-editorial"
    },

    "storytellingBeats": [
      { "atMs": 2000, "visual": "vista-headquarters-floor-below" },
      { "atMs": 4500, "visual": "discovery-door-glow-ahead" }
    ],

    "orbGuidance": {
      "mode": "contextual-brief",
      "lines": [
        "Discovery has completed overnight research.",
        "The Lab is ready when you are."
      ]
    },

    "streamingProfile": {
      "preloadAtMs": 1500,
      "streamDuring": true,
      "handoffAtMs": 6000
    },

    "idleLifeDuring": "continue",

    "genomeWeights": {
      "materialLanguage": 0.7,
      "voice": 0.85,
      "lightingStyle": 0.8
    },

    "journeyModifiers": {
      "legacy": { "durationMultiplier": 1.2, "orbReflective": true },
      "building": { "durationMultiplier": 1.0 }
    },

    "stateModifiers": {
      "celebration": { "lightingBoost": 0.15 },
      "crisis": { "durationMultiplier": 0.85, "orbUrgent": true }
    }
  }
}
```

---

## Relationship to Set DNA™

| Set DNA™ | Transition DNA™ |
|----------|-----------------|
| Destination environment | Journey between destinations |
| Hero object · furniture | Corridor · elevator · bridge |
| Arrival into Set | Final beats of transition |

Set DNA™ defines **where you arrive**.  
Transition DNA™ defines **how you get there**.

---

## Compilation

```
Transition graph edge (from → to)
    + Transition Type™
    + Company Genome™
    + Founder Journey™
    + Business state
         ↓
Transition DNA™ compiler (future)
         ↓
Runtime transition manifest
         ↓
Camera + audio + streaming + Orb
```

**Future:** [future-roadmap.md](./future-roadmap.md)

---

## Validation

| Rule | Requirement |
|------|-------------|
| Both Set IDs valid | Registry check |
| Type matches topology | No Walk across impossible distance without bridge |
| `idleLifeDuring` ≠ `pause` | World continuity law |
| No loader vocabulary in scripts | Philosophy check |
| Streaming profile required | World streaming law |

---

## Cross-References

- [Transition types](./transition-types.md)
- [Set DNA](../set-dna.md)
- [Orb guidance](./orb-guidance.md)
- [World streaming](./world-streaming.md)
